/** Seedable random source for decisions that must be replayable (execution rolls). Unseeded = ordinary randomness. */
let state: number | null = null;
export function setExecSeed(seed: number | null): void { state = seed === null ? null : (seed >>> 0) || 1; }
export function execRandom(): number {
  if (state === null) return Math.random();
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
