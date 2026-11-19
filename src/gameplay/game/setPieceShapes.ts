import type { MatchEngine } from './engine';
import type { Player, TeamSide, DetailedTactics } from '../types';
import { PITCH_CONFIG } from './constants';

export type SetPieceStyle = 'block_keeper' | 'running' | 'dummy_run' | 'wrestle';
export type DefendersLevel = 'few' | 'some' | 'normal' | 'park_bus';
export type AttackersLevel = 'few' | 'some' | 'normal' | 'all_out';

/** Default set-piece identity per tactical playstyle (user can override in the tactics screen). */
export const SET_PIECE_DEFAULTS: Record<string, { corner: SetPieceStyle; freeKick: SetPieceStyle; defenders: DefendersLevel; attackers: AttackersLevel }> = {
  possession: { corner: 'dummy_run', freeKick: 'running', defenders: 'normal', attackers: 'normal' },
  arteta_control: { corner: 'block_keeper', freeKick: 'dummy_run', defenders: 'normal', attackers: 'normal' },
  gegenpress: { corner: 'running', freeKick: 'running', defenders: 'few', attackers: 'some' },
  catenaccio: { corner: 'wrestle', freeKick: 'block_keeper', defenders: 'some', attackers: 'few' },
  counterattack: { corner: 'wrestle', freeKick: 'running', defenders: 'few', attackers: 'few' },
  long_ball: { corner: 'block_keeper', freeKick: 'block_keeper', defenders: 'normal', attackers: 'all_out' },
  brexitball: { corner: 'block_keeper', freeKick: 'block_keeper', defenders: 'normal', attackers: 'all_out' },
  jogobonito: { corner: 'dummy_run', freeKick: 'running', defenders: 'normal', attackers: 'some' },
  futbol_champan: { corner: 'wrestle', freeKick: 'dummy_run', defenders: 'some', attackers: 'normal' },
  conservative: { corner: 'wrestle', freeKick: 'block_keeper', defenders: 'park_bus', attackers: 'few' },
  custom: { corner: 'running', freeKick: 'running', defenders: 'normal', attackers: 'normal' },
};

const ATT_COUNT: Record<AttackersLevel, number> = { few: 3, some: 4, normal: 5, all_out: 6 };
const BACK_COUNT: Record<AttackersLevel, number> = { few: 3, some: 3, normal: 3, all_out: 0 };
const STAY_UP: Record<DefendersLevel, number> = { few: 3, some: 2, normal: 1, park_bus: 0 };

export function getSetPieceSettings(engine: MatchEngine, team: TeamSide) {
  const tac: DetailedTactics = team === 'home' ? engine.homeTactics : engine.awayTactics;
  const ps = (team === 'home' ? engine.homePlaystyle : (engine as any).awayPlaystyle) || 'possession';
  const d = SET_PIECE_DEFAULTS[ps] || SET_PIECE_DEFAULTS.possession;
  const tr = ((team === 'home' ? (engine as any).homeTeam : (engine as any).awayTeam)?.roles || {}) as any;
  const pick = (a?: any[], b?: any[]) => ((a && a.filter(Boolean).length ? a : b) || []).filter(Boolean);
  const roles = { heading: pick(tr.headingIds, tac.setPieceRoles?.heading), backLine: pick(tr.backLineIds, tac.setPieceRoles?.backLine), rebounds: pick(tr.reboundIds, tac.setPieceRoles?.rebounds) };
  return { corner: tac.cornerStyle ?? d.corner, freeKick: tac.freeKickStyle ?? d.freeKick, defenders: tac.setPieceDefenders ?? d.defenders, attackers: tac.setPieceAttackers ?? d.attackers, roles };
}

const cs = (p: Player): any => p.canonicalStats || {};
const headScore = (p: Player) => (cs(p).hea ?? 70) * 0.5 + (cs(p).str ?? 70) * 0.2 + ((p.appearance?.heightCm ?? 180) - 150) * 0.9;
const backScore = (p: Player) => (cs(p).pac ?? 70) * 0.6 + (cs(p).int ?? 70) * 0.4 + (p.primaryPos === 'DEF' ? 15 : 0);
const reboundScore = (p: Player) => (cs(p).sho ?? 70) * 0.5 + (cs(p).int ?? 70) * 0.3 + (cs(p).ref ?? 60) * 0.2;

export interface SetPieceSquad { attackers: Player[]; back: Player[]; rebounds: Player[]; counters: Player[]; }

/** Auto-picks the squads. Goalkeepers are NEVER picked. Manual roles (Heading / Back Line / Rebounds) win over automatic picks. */
export function assignSetPiecePlayers(engine: MatchEngine, team: TeamSide, takerId: number | string): SetPieceSquad {
  const s = getSetPieceSettings(engine, team);
  const pool = engine.players.filter((p) => p.team === team && p.role !== 'GK' && p.id !== takerId && !p.isRedCarded);
  const byId = (ids?: Array<number | string>) => (ids || []).map((id) => pool.find((p) => p.id === id || String(p.id).endsWith(String(id)))).filter(Boolean) as Player[]; // same id matching as the set-piece takers
  const used = new Set<Player>();
  const mHead = byId(s.roles?.heading).slice(0, 3), mBack = byId(s.roles?.backLine).slice(0, 3), mReb = byId(s.roles?.rebounds).slice(0, 2);
  [...mHead, ...mBack, ...mReb].forEach((p) => used.add(p)); // manual role picks are reserved first (a player holds one role)
  const fill = (n: number, score: (p: Player) => number, manual: Player[] = []) => {
    const out: Player[] = manual.slice(0, n);
    for (const p of pool.filter((q) => !used.has(q) && !out.includes(q)).sort((a, b) => score(b) - score(a))) { if (out.length >= n) break; out.push(p); used.add(p); }
    return out;
  };
  // attackers: best headers ('few' = strikers first), manual Heading picks always included
  const attScore = s.attackers === 'few' ? (p: Player) => headScore(p) + (p.primaryPos === 'ATT' ? 60 : 0) : headScore;
  const attackers = fill(ATT_COUNT[s.attackers], attScore, mHead);
  // halfway group = counter-attackers (fastest, not necessarily forwards) + back line; size = the larger of the two settings
  const H = Math.max(BACK_COUNT[s.attackers], STAY_UP[s.defenders]);
  const counters = fill(STAY_UP[s.defenders], (p) => cs(p).pac ?? 70);
  const back = fill(Math.max(0, H - counters.length), backScore, mBack);
  // everyone left guards the rebound zone (manual Rebounds first)
  const rebounds = fill(99, reboundScore, mReb);
  return { attackers, back, rebounds, counters };
}

/** Moves a player smoothly toward a spot while a set piece is being set up */
function drift(p: Player, tx: number, ty: number, faceX: number, faceY: number) {
  if (!isFinite(tx) || !isFinite(ty) || !isFinite(p.x) || !isFinite(p.y)) return;
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
  if (d > 1.5) { p.x += dx * 0.12; p.y += dy * 0.12; p.action = 'running'; p.animFrame = (p.animFrame + 1) % 6; } else if (p.action === 'running') { p.action = 'idle'; }
  p.vx = 0; p.vy = 0;
  p.facingAngle = Math.atan2(faceY - p.y, faceX - p.x);
}

const spread = (i: number, n: number, w: number) => (n <= 1 ? 0 : -w + (2 * w * i) / (n - 1));

/** Player ids are strings like 'home_ST1': turn any id into a small stable number (never NaN). */
function idHash(v: any): number {
  if (typeof v === 'number' && isFinite(v)) return v;
  let x = 7; const t = String(v);
  for (let i = 0; i < t.length; i++) x = (x * 31 + t.charCodeAt(i)) % 9973;
  return x;
}

/** Two players locked together: shirt-pulling, hand-fighting, shoulder pushes. Both face each other and sway against each other. */
function wrestleJostle(def: Player, att: Player, t: number) {
  const dx = att.x - def.x, dy = att.y - def.y, d = Math.hypot(dx, dy) || 1;
  if (d > 34) return; // not in contact yet
  const ux = dx / d, uy = dy / d;
  const push = Math.sin(t * 0.32 + idHash(def.id) * 0.7) * 1.1;           // push / pull sway along the contact line
  const side = Math.cos(t * 0.21 + idHash(att.id) * 0.5) * 0.8;           // sideways shuffle
  const minD = 15;
  const k = d + push < minD ? 0 : push;
  if (!isFinite(k) || !isFinite(side)) return;
  def.x -= ux * k * 0.5 - uy * side * 0.4; def.y -= uy * k * 0.5 + ux * side * 0.4;
  att.x += ux * k * 0.5 + uy * side * 0.4; att.y += uy * k * 0.5 - ux * side * 0.4;
  const f = Math.floor(t / 5) % 6;
  for (const [a, b] of [[def, att], [att, def]] as Array<[Player, Player]>) {
    a.action = 'wrestle'; a.animFrame = f; a.vx = 0; a.vy = 0;
    a.facingAngle = Math.atan2(b.y - a.y, b.x - a.x);
  }
}

/** Called every frame while a corner / attacking free kick is being set up. */
export function applySetPieceShapes(engine: MatchEngine): void {
  const sp = engine.setPiece;
  if (!sp || (sp.type !== 'corner_kick' && sp.type !== 'free_kick') || sp.isPenalty) return;
  const up = sp.spotY < PITCH_CONFIG.CENTER_Y;                    // attacking toward the top goal?
  const goalY = up ? PITCH_CONFIG.PITCH_TOP : PITCH_CONFIG.PITCH_BOTTOM;
  const dir = up ? 1 : -1;                                         // from goal line into the pitch
  const cx = PITCH_CONFIG.CENTER_X;
  const distToGoal = Math.abs(sp.spotY - goalY);
  if (sp.type === 'free_kick' && distToGoal > 560) return;        // only dangerous free kicks get a set-piece shape
  const atkTeam = sp.team, defTeam: TeamSide = atkTeam === 'home' ? 'away' : 'home';
  const set = getSetPieceSettings(engine, atkTeam);
  const style = sp.type === 'corner_kick' ? set.corner : set.freeKick;
  const squad = assignSetPiecePlayers(engine, atkTeam, sp.takerId);
  (sp as any).squadTag = (sp as any).squadTag || 1;
  const t = engine.phaseTimer;

  // ---- attackers by style ----
  const partner = new Map<Player, Player>(); // defender -> attacker (wrestle style)
  const n = squad.attackers.length;
  squad.attackers.forEach((p, i) => {
    let tx = cx + spread(i, n, 95), ty = goalY + dir * 150;
    if (style === 'block_keeper') { if (i < 3) { tx = cx + (i - 1) * 20; ty = goalY + dir * 34; } else { tx = cx + spread(i - 3, Math.max(1, n - 3), 70); ty = goalY + dir * 118; } }
    else if (style === 'running') { tx = cx + spread(i, n, 130); ty = goalY + dir * 250; }                 // outside the box, running in from behind the defenders
    else if (style === 'dummy_run') { tx = cx + spread(i, n, 120); ty = goalY + dir * (t > 40 ? 250 : 190); }  // line up on the offside line, then step back onside before the kick
    else if (style === 'wrestle') {
      const marks = engine.players.filter((q) => q.team === defTeam && q.role !== 'GK').sort((a, b) => Math.hypot(a.x - cx, a.y - (goalY + dir * 90)) - Math.hypot(b.x - cx, b.y - (goalY + dir * 90)));
      const m = marks[i]; if (m) { partner.set(m, p); tx = m.x + (m.x < cx ? 12 : -12); ty = m.y - dir * 10; }
    }
    drift(p, tx, ty, cx, goalY);
    const mk = style === 'wrestle' ? [...partner.entries()].find(([, a]) => a === p)?.[0] : undefined;
    if (mk) wrestleJostle(mk, p, t);
  });
  // ---- late-game keeper joins the attack (tallest man in the box) ----
  if (sp.type === 'corner_kick' && engine.gkGoUpTeams[atkTeam]) {
    const kg = engine.players.find((q) => q.team === atkTeam && q.role === 'GK' && !q.isRedCarded);
    if (kg) { kg.gkAdvanced = true; kg.gkAdvancedFrames = 0; drift(kg, cx + 14, goalY + dir * 190, cx, goalY); }
  }
  // ---- back line stays near the halfway line; counters just above it ----
  squad.back.forEach((p, i) => drift(p, cx + spread(i, squad.back.length, 150), PITCH_CONFIG.CENTER_Y + dir * 40, cx, goalY));
  squad.counters.forEach((p, i) => drift(p, cx + spread(i, squad.counters.length, 190), PITCH_CONFIG.CENTER_Y - dir * 20, cx, goalY));
  // ---- rebound guards at the edge of the box ----
  squad.rebounds.forEach((p, i) => drift(p, cx + spread(i, squad.rebounds.length, 110), goalY + dir * 320, cx, goalY));

  // ---- defending team: posts, six-yard zone, man marks, rebound edge ----
  let defs = engine.players.filter((p) => p.team === defTeam && p.role !== 'GK' && !p.isRedCarded).sort((a, b) => headScore(b) - headScore(a));
  {
    // Defending corners: Heading role players take the six-yard zone, Rebounds role players guard the edge of the box
    const dr = getSetPieceSettings(engine, defTeam).roles;
    const match = (ids?: Array<number | string>) => (ids || []).map((id) => defs.find((p) => p.id === id || String(p.id).endsWith(String(id)))).filter(Boolean) as Player[];
    const heads = match(dr?.heading), rebs = match(dr?.rebounds).filter((p) => !heads.includes(p));
    if (heads.length || rebs.length) {
      const rest = defs.filter((p) => !heads.includes(p) && !rebs.includes(p));
      const posts = rest.splice(0, 2);
      const zone = [...heads]; while (zone.length < 3 && rest.length) zone.push(rest.shift()!);
      defs = [...posts, ...zone, ...rest, ...rebs];
    }
  }
  const atkPos = squad.attackers;
  defs.forEach((p, i) => {
    if (partner.has(p)) return; // wrestling with his attacker: handled above
    if (p.action === 'wrestle') p.action = 'idle';
    let tx: number, ty: number;
    if (i < 2) { tx = cx + (i === 0 ? -62 : 62); ty = goalY + dir * 16; }                                  // posts
    else if (i < 5) { tx = cx + spread(i - 2, 3, 46); ty = goalY + dir * 62; }                             // six-yard zone: best headers
    else if (i < 5 + atkPos.length) { const a = atkPos[i - 5]; tx = a.x; ty = a.y + dir * -12; }           // man-mark an attacker
    else { tx = cx + spread(i, defs.length, 100); ty = goalY + dir * 300; }                                // rebound edge
    drift(p, tx, ty, sp.spotX, sp.spotY);
  });
}

/** Called the moment the corner / free kick is delivered: the squad runs (style-specific). */
export function triggerSetPieceRuns(engine: MatchEngine): void {
  const sp = engine.setPiece;
  if (!sp || (sp.type !== 'corner_kick' && sp.type !== 'free_kick') || sp.isPenalty) return;
  const up = sp.spotY < PITCH_CONFIG.CENTER_Y, goalY = up ? PITCH_CONFIG.PITCH_TOP : PITCH_CONFIG.PITCH_BOTTOM, dir = up ? 1 : -1, cx = PITCH_CONFIG.CENTER_X;
  const set = getSetPieceSettings(engine, sp.team);
  const style = sp.type === 'corner_kick' ? set.corner : set.freeKick;
  for (const q of engine.players) if (q.action === 'wrestle') q.action = 'idle';
  const squad = assignSetPiecePlayers(engine, sp.team, sp.takerId);
  const kg2 = engine.gkGoUpTeams[sp.team] ? engine.players.find((q) => q.team === sp.team && q.role === 'GK') : undefined;
  if (kg2) { kg2.spRunX = cx + 6; kg2.spRunY = goalY + dir * 60; kg2.spRunTimer = 80; kg2.spRunDelay = 8; engine.gkGoUpTeams[sp.team] = false; }
  const targets: Array<[number, number]> = [[cx - 34, goalY + dir * 42], [cx + 34, goalY + dir * 42], [cx, goalY + dir * 96], [cx - 70, goalY + dir * 70], [cx + 70, goalY + dir * 70], [cx, goalY + dir * 140]];
  if (style === 'block_keeper' || style === 'wrestle') return; // they hold their ground
  squad.attackers.forEach((p, i) => { const tg = targets[i % targets.length]; p.spRunX = tg[0]; p.spRunY = tg[1]; p.spRunTimer = 70 + i * 8; p.spRunDelay = style === 'running' ? i * 6 : 0; });
}
