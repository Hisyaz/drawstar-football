import type { AssistMode } from '../types';
import { execRandom } from './rng';
import type { KickKind, Intent } from './intent';

/**
 * EXECUTION model. Takes the player's relevant stat and the situation and decides whether the kick goes as intended.
 * Failure probability by stat (anchors from the design brief, everything between is interpolated on a log scale):
 *   40 -> 1 in 2, 70 (pro) -> 1 in 10, 99 -> 1 in 50, stat break (100+) -> 1 in 200. Below 40 it keeps rising to 92% at 0.
 * Derived by interpolation: 80 (high level pro) ~ 1 in 17, 90 (elite) ~ 1 in 30, 95 (world class) ~ 1 in 40.
 */
const ANCHORS: Array<[number, number]> = [[0, 0.92], [40, 0.5], [70, 0.1], [99, 0.02], [100, 0.005]];

export function baseFailureProbability(stat: number): number {
  const s = Math.max(0, stat);
  if (s >= 100) return ANCHORS[4][1];
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [s0, p0] = ANCHORS[i], [s1, p1] = ANCHORS[i + 1];
    if (s <= s1) {
      const t = (s - s0) / (s1 - s0);
      return i === 0 ? p0 + (p1 - p0) * t : Math.exp(Math.log(p0) + (Math.log(p1) - Math.log(p0)) * t); // linear below 40, log-linear above
    }
  }
  return ANCHORS[4][1];
}

export interface ExecMods {
  pressure?: number;    // 0 (free) .. 3 (surrounded)
  fatigue?: number;     // 1 (fresh) .. ~1.84 (exhausted)
  stakes?: number;      // 0..1 match pressure (late game, big moments)
  composure?: number;   // 40..99 stat that resists match pressure
  crowd?: number;       // -1 (hostile) .. +1 (supportive); 0 neutral
  difficulty?: number;  // existing difficulty / error multiplier (1 = neutral)
}
export interface ExecResult {
  kind: KickKind; stat: number; failProbability: number; roll: number; failed: boolean;
  angleError: number;   // radians (0 when the kick succeeds)
  speedMult: number;    // 1 when the kick succeeds
  mishit: boolean;
}

export interface ExecutionDebugInfo {
  kind: KickKind;
  source: 'human' | 'cpu';
  assistMode: AssistMode;
  stat: number;
  failProbability: number;
  roll: number;
  failed: boolean;
  mishit: boolean;
  angleErrorDeg: number;
  speedMult: number;
  fromX: number;
  fromY: number;
  intentX: number;
  intentY: number;
  actualX: number;
  actualY: number;
  receiverId: string | null;
  timestamp: number;
}

/** Odds multiplier from the situation. Stat-break players are only half as affected by it. */
export function situationMultiplier(stat: number, m: ExecMods): number {
  const press = 1 + 0.45 * (m.pressure ?? 0);
  const fat = 1 + 1.1 * Math.max(0, (m.fatigue ?? 1) - 1);
  const resist = Math.min(1, Math.max(0, ((m.composure ?? 70) - 40) / 59));
  const stakes = 1 + 0.6 * (m.stakes ?? 0) * (1 - resist);
  const crowd = 1 - 0.1 * (m.crowd ?? 0);
  const diff = m.difficulty ?? 1;
  let mult = press * fat * stakes * crowd;
  if (stat >= 100) mult = 1 + (mult - 1) * 0.5;
  return mult * diff;
}

export function failureProbability(stat: number, m: ExecMods = {}): number {
  return Math.min(0.97, Math.max(0.001, baseFailureProbability(stat) * situationMultiplier(stat, m)));
}

// Debug log of recent executions (shown in the bug report) + per-stat-band statistics for the simulator
export const execLog: string[] = [];
export const execStats: Record<string, Record<string, { n: number; fail: number }>> = {};
let pendingIntent: Intent | null = null;
export function setPendingIntent(i: Intent | null): void { pendingIntent = i; }

// Mutable pre-allocated debug snapshot (updated in-place to keep GC zero in hot render loop)
export const lastExecutionDebug: ExecutionDebugInfo = {
  kind: 'short_pass',
  source: 'human',
  assistMode: 'assisted',
  stat: 75,
  failProbability: 0,
  roll: 1,
  failed: false,
  mishit: false,
  angleErrorDeg: 0,
  speedMult: 1,
  fromX: 0,
  fromY: 0,
  intentX: 0,
  intentY: 0,
  actualX: 0,
  actualY: 0,
  receiverId: null,
  timestamp: 0,
};

export function updateExecutionActualPoint(fromX: number, fromY: number, actualX: number, actualY: number): void {
  if (lastExecutionDebug.timestamp === 0) return;
  lastExecutionDebug.fromX = fromX;
  lastExecutionDebug.fromY = fromY;
  lastExecutionDebug.actualX = actualX;
  lastExecutionDebug.actualY = actualY;
}

export function resolveExecution(kind: KickKind, stat: number, mods: ExecMods = {}): ExecResult {
  const p = failureProbability(stat, mods);
  const roll = execRandom();
  const failed = roll < p;
  let angleError = 0, speedMult = 1, mishit = false;
  if (failed) {
    // Graded error: most failures are modest, a few are bad. Worse stats and worse situations push the severity up.
    const gap = Math.min(1, Math.max(0, 1 - stat / 100));
    const sev = Math.min(1, Math.pow(execRandom(), 1.6) * (0.55 + 0.9 * gap) * (0.8 + 0.2 * Math.min(2, mods.pressure ?? 0)));
    mishit = execRandom() < 0.08 + 0.12 * gap;
    const deg = mishit ? 45 + 35 * sev : 6 + 30 * sev;
    angleError = ((execRandom() < 0.5 ? -1 : 1) * deg * Math.PI) / 180;
    speedMult = mishit ? 0.55 + 0.3 * execRandom() : Math.max(0.6, 1 + (execRandom() - 0.5) * (0.2 + 0.5 * sev));
  }
  const res: ExecResult = { kind, stat, failProbability: p, roll, failed, angleError, speedMult, mishit };

  // Record in-place debug info for pitch overlay
  lastExecutionDebug.kind = kind;
  lastExecutionDebug.source = pendingIntent?.source ?? 'human';
  lastExecutionDebug.assistMode = pendingIntent?.assistMode ?? 'assisted';
  lastExecutionDebug.stat = stat;
  lastExecutionDebug.failProbability = p;
  lastExecutionDebug.roll = roll;
  lastExecutionDebug.failed = failed;
  lastExecutionDebug.mishit = mishit;
  lastExecutionDebug.angleErrorDeg = (angleError * 180) / Math.PI;
  lastExecutionDebug.speedMult = speedMult;
  if (pendingIntent) {
    lastExecutionDebug.intentX = pendingIntent.targetX;
    lastExecutionDebug.intentY = pendingIntent.targetY;
    lastExecutionDebug.actualX = pendingIntent.targetX;
    lastExecutionDebug.actualY = pendingIntent.targetY;
    lastExecutionDebug.receiverId = pendingIntent.receiverId ?? null;
  }
  lastExecutionDebug.timestamp = Date.now();

  // bookkeeping (cheap)
  const band = stat >= 100 ? '100+' : stat >= 90 ? '90-99' : stat >= 80 ? '80-89' : stat >= 70 ? '70-79' : stat >= 60 ? '60-69' : stat >= 50 ? '50-59' : '<50';
  const k = (execStats[kind] = execStats[kind] || {});
  const b = (k[band] = k[band] || { n: 0, fail: 0 });
  b.n++; if (failed) b.fail++;
  const modeTag = pendingIntent?.assistMode ? `[${pendingIntent.assistMode}]` : '';
  execLog.push(`${kind}${modeTag} stat=${Math.round(stat)} fail%=${(p * 100).toFixed(1)} ${failed ? (mishit ? 'MISHIT' : 'FAILED err=' + Math.round((angleError * 180) / Math.PI) + 'deg') : 'ok'}${pendingIntent ? ' intent=' + pendingIntent.source + ':' + Math.round(pendingIntent.power * 100) + '%' : ''}`);
  if (execLog.length > 40) execLog.shift();
  pendingIntent = null;
  return res;
}

