import { Player } from '../types';
import { PITCH_CONFIG } from './constants';

/** CPU run engine: timed, line-aware attacking movement. Zero-allocation (shared result object). */
export const cpuRun = { active: false, x: 0, y: 0, kind: 0 as 0 | 1 | 2 | 3 | 4 }; // 1 behind, 2 check-to-feet decoy, 3 wide stretch, 4 late arrival

export function computeCpuRun(p: Player, carrier: Player, all: Player[], up: boolean, frame: number, pos: number, rea: number): typeof cpuRun {
  cpuRun.active = false;
  const dir = up ? -1 : 1;
  const prog = ((up ? PITCH_CONFIG.PITCH_BOTTOM - carrier.y : carrier.y - PITCH_CONFIG.PITCH_TOP) / PITCH_CONFIG.FIELD_HEIGHT);
  if (prog < 0.28 || p.role === 'GK') return cpuRun;
  const fwd = p.role === 'ST1' || p.role === 'ST2' || p.primaryPos === 'ATT';
  const wide = p.role === 'LM' || p.role === 'RM' || p.subPos === 'LW' || p.subPos === 'RW';
  const mid = p.primaryPos === 'MID' || p.role === 'CM1' || p.role === 'CM2';
  if (!fwd && !wide && !(mid && prog > 0.62)) return cpuRun;

  // Opposition last line + nearest defender to me + carrier pressure
  let lineY = up ? 99999 : -99999, markX = p.x, markD = 1e9, pressD = 1e9;
  for (let i = 0; i < all.length; i++) {
    const o = all[i];
    if (o.team === p.team || o.role === 'GK') continue;
    if (up ? o.y < lineY : o.y > lineY) lineY = o.y;
    const d = (o.x - p.x) ** 2 + (o.y - p.y) ** 2;
    if (d < markD) { markD = d; markX = o.x; }
    const dc = (o.x - carrier.x) ** 2 + (o.y - carrier.y) ** 2;
    if (dc < pressD) pressD = dc;
  }
  // Is the carrier ready to play it? POS/REA decide how well the run is timed (low POS = goes early or late)
  const ready = pressD > 75 * 75 || Math.hypot(carrier.vx, carrier.vy) > 2.2;
  const pid = Number(p.id) || Array.from(p.id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const slot = (pid * 7 + (Math.floor(frame / 150))) % 3; // rotates who runs, so runs are not identical every time
  const timingNoise = (1 - Math.min(1, pos / 95)) * 40;     // px of mis-timing at low POS
  const side = markX < p.x ? 1 : -1;                        // run away from my marker, into the gap
  const edge = lineY - dir * (6 + timingNoise * 0.6);       // onside edge (low POS drifts offside)
  let x = p.x + side * 55, y: number, kind: 1 | 2 | 3 | 4;

  if (wide) {
    kind = 3; x = p.x < PITCH_CONFIG.CENTER_X ? PITCH_CONFIG.PITCH_LEFT + 55 : PITCH_CONFIG.PITCH_RIGHT - 55;
    y = ready ? lineY + dir * 70 : edge;
  } else if (fwd && slot !== 2) {
    kind = 1; y = ready ? lineY + dir * (95 + rea * 0.4) : edge;   // hold the line, break behind when carrier is ready
  } else if (fwd) {
    kind = 2; x = carrier.x + (p.x < carrier.x ? -70 : 70); y = carrier.y + dir * 95; // check to feet: drags marker, opens space behind
  } else {
    kind = 4; x = PITCH_CONFIG.CENTER_X + (p.x < PITCH_CONFIG.CENTER_X ? -90 : 90); y = lineY - dir * (-75); // late arrival at the edge of the box
    y = lineY - dir * -75;
  }
  cpuRun.active = true; cpuRun.x = x; cpuRun.y = y; cpuRun.kind = kind;
  return cpuRun;
}
