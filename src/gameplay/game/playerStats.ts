import type {
  Ball,
  CanonicalGoalkeeperStats,
  CanonicalOutfieldStats,
  DifficultyLevel,
  MatchStakeTier,
  Player,
  PlayerRole,
  ProgressionTier,
  StatBreakDuelResolution,
} from '../types';

function normStat(val: number): number {
  return (Math.min(99, Math.max(40, val)) - 40) / 59;
}

export function isStatBreak(val: number): boolean {
  return val > 99;
}

export function getAttributeTier(val: number): ProgressionTier {
  if (val > 99) return 'stat_break';
  if (val >= 90) return 'pinnacle';
  if (val >= 80) return 'elite';
  if (val >= 70) return 'pro';
  return 'amateur';
}

const STAT_BREAK_TRAIT_NAMES: Record<string, string> = {
  pac: 'Hyper-Burst / Sonic Ghost',
  sta: 'Iron Engine',
  str: 'Immovable Juggernaut',
  bcl: 'Magnetic Velvet & Instinctive Skill',
  ret: 'Fortress Shield',
  dri: 'Ankle Breaker',
  spa: 'Laser Ping',
  lpa: 'Radar Telemetry Switch',
  cro: 'Guided Whip',
  sho: 'Deadly Assassin',
  hea: 'Sky Walk & Bullet Header',
  lsh: 'Thunderbolt Cannon',
  tck: 'Surgical Extraction',
  mrk: 'Shadow Lockdown',
  int: 'Sixth Sense',
  pos: 'Omnipresent Phantom',
  cmp: 'Ice in the Veins',
  rea: 'Instant Synapse',
  sav: 'Spiderman Leap',
  ref: 'Bullet Time',
  han: 'Magnetic Claws',
  gpo: 'Geometric Master',
  aer: 'Sky Domination',
  oneOnOne: 'Sweeper Wall',
  dis: 'Laser Telemetry',
};

export function getAttributeStatBreakName(statKey: string): string {
  return STAT_BREAK_TRAIT_NAMES[statKey.toLowerCase()] || '⚡ Supernatural Breakthrough';
}

export function resolveStatBreakDuel(
  attacker: Player,
  defender: Player,
  duelType: 'tackle' | 'dribble_cut' | 'shot_save' | 'aerial_duel' | 'loose_ball_pass',
  context?: { cutAngle?: number; distToFrame?: number; isInsideSixYard?: boolean; isInInterceptionCone?: boolean },
): StatBreakDuelResolution {
  const aStats = attacker.canonicalStats as unknown as Record<string, number> | undefined;
  const dStats = defender.canonicalStats as unknown as Record<string, number> | undefined;

  if (duelType === 'tackle') {
    const str = aStats?.str ?? 75;
    const tck = dStats?.tck ?? 75;
    const aBreak = isStatBreak(str);
    const dBreak = isStatBreak(tck);
    if (aBreak && dBreak) {
      return Math.hypot(attacker.vx, attacker.vy) >= 0.7 * 4.4
        ? { winner: 'attacker', traitTriggered: '⚡ Immovable Juggernaut', reason: 'Momentum Vector Check: Moving at >70% velocity; attacker shrugs tackle!' }
        : { winner: 'defender', traitTriggered: '⚡ Surgical Extraction', reason: 'Momentum Vector Check: Attacker decelerated; defender cleanly strips the ball!' };
    }
    if (aBreak && Math.hypot(attacker.vx, attacker.vy) >= 0.5 * 4.4) {
      return { winner: 'attacker', traitTriggered: '⚡ Immovable Juggernaut', reason: 'Attacker shrugs off physical challenge with colossal kinetic mass!' };
    }
    if (dBreak) {
      return { winner: 'defender', traitTriggered: '⚡ Surgical Extraction', reason: 'Pristine surgical tackle cleanly captures ball with 0% foul risk!' };
    }
  }

  if (duelType === 'dribble_cut') {
    const dri = aStats?.dri ?? 75;
    const mrk = dStats?.mrk ?? 75;
    const aBreak = isStatBreak(dri);
    const dBreak = isStatBreak(mrk);
    if (aBreak && dBreak) {
      return (context?.cutAngle ?? 90) > 75
        ? { winner: 'attacker', traitTriggered: '⚡ Ankle Breaker', reason: 'Angle Divergence Check: Cut angle >75°; sharp cut leaves defender off-balance!' }
        : { winner: 'defender', traitTriggered: '⚡ Shadow Lockdown', reason: 'Angle Divergence Check: Shallow angle; Lockdown defender sticks to hip!' };
    }
    if (aBreak) return { winner: 'attacker', traitTriggered: '⚡ Ankle Breaker', reason: 'Instantaneous 180° turn with 0 deceleration causes defender stumble!' };
    if (dBreak) return { winner: 'defender', traitTriggered: '⚡ Shadow Lockdown', reason: 'Shadow Lockdown adheres like glue, nullifying attacker burst!' };
  }

  if (duelType === 'shot_save') {
    const sho = aStats?.sho ?? 75;
    const sav = dStats?.sav ?? 75;
    const aBreak = isStatBreak(sho);
    const dBreak = isStatBreak(sav);
    if (aBreak && dBreak) {
      return (context?.distToFrame ?? 12) <= 8
        ? { winner: 'attacker', traitTriggered: '⚡ Deadly Assassin', reason: 'Postage Stamp Duel: Within 8px of post/bar; postage stamp finishes clean!' }
        : { winner: 'defender', traitTriggered: '⚡ Spiderman Leap', reason: 'Postage Stamp Duel: >8px from frame; Spiderman Leap tips over crossbar!' };
    }
    if (aBreak) return { winner: 'attacker', traitTriggered: '⚡ Deadly Assassin', reason: 'Ruthless postage-stamp accuracy delays goalkeeper dive!' };
    if (dBreak) return { winner: 'defender', traitTriggered: '⚡ Spiderman Leap', reason: 'Supernatural +20px diving spring fingertip reach!' };
  }

  if (duelType === 'aerial_duel') {
    const hea = aStats?.hea ?? 75;
    const aer = dStats?.aer ?? 75;
    const aBreak = isStatBreak(hea);
    const dBreak = isStatBreak(aer);
    if (aBreak && dBreak) {
      return context?.isInsideSixYard
        ? { winner: 'defender', traitTriggered: '⚡ Sky Domination', reason: 'Positioning Anchor Check: Inside 6-yard box; Goalkeeper dominates airspace!' }
        : { winner: 'attacker', traitTriggered: '⚡ Sky Walk & Bullet Header', reason: 'Positioning Anchor Check: Outside 6-yard box; Attacker out-leaps backline!' };
    }
    if (aBreak) return { winner: 'attacker', traitTriggered: '⚡ Sky Walk & Bullet Header', reason: 'Unmatched vertical hang-time powers downward bullet header!' };
    if (dBreak) return { winner: 'defender', traitTriggered: '⚡ Sky Domination', reason: 'Penalty box airspace dominance claims high contested delivery clean!' };
  }

  if (duelType === 'loose_ball_pass') {
    const pac = aStats?.pac ?? 75;
    const intStat = dStats?.int ?? 75;
    const aBreak = isStatBreak(pac);
    const dBreak = isStatBreak(intStat);
    if (aBreak && dBreak) {
      return context?.isInInterceptionCone
        ? { winner: 'defender', traitTriggered: '⚡ Sixth Sense', reason: 'Anticipation Vector: Pass in lane; Sixth Sense cuts it off cleanly!' }
        : { winner: 'attacker', traitTriggered: '⚡ Hyper-Burst / Sonic Ghost', reason: 'Anticipation Vector: Pass led into green space; Sonic Ghost wins footrace!' };
    }
    if (aBreak) return { winner: 'attacker', traitTriggered: '⚡ Hyper-Burst / Sonic Ghost', reason: 'Instantaneous 0-frame acceleration burns into open space!' };
    if (dBreak) return { winner: 'defender', traitTriggered: '⚡ Sixth Sense', reason: 'Telepathic passing lane read lunges across 35px radius!' };
  }

  return { winner: 'attacker', traitTriggered: 'Standard Duel', reason: 'Standard physical contest resolved by attribute ratings.' };
}

const STAKE_FACTORS: Record<MatchStakeTier, number> = {
  friendly: 0,
  cup: 0.1,
  league: 0.15,
  key_match: 0.25,
  final: 0.4,
};

export function getStakeFactor(tier: MatchStakeTier = 'friendly'): number {
  return STAKE_FACTORS[tier] ?? 0;
}

function applyComposureStakeModifier(base: number, cmp: number, stakeFactor: number): number {
  if (stakeFactor <= 0) return Math.min(0.98, Math.max(0.02, base));
  const cNorm = (cmp - 70) / 29;
  const mult = 1 + stakeFactor * cNorm;
  return Math.min(0.98, Math.max(0.02, base * mult));
}

export function calculateShortPassSuccessRate(spa: number, cmp = 70, stakeFactor = 0): number {
  const base = spa <= 99 ? 0.1 + 0.85 * normStat(spa) : 0.95 + 0.03 * Math.min(1, (spa - 99) / 6);
  return applyComposureStakeModifier(base, cmp, stakeFactor);
}

export function calculateLongPassSuccessRate(lpa: number, cmp = 70, stakeFactor = 0): number {
  return calculateShortPassSuccessRate(lpa, cmp, stakeFactor) * 0.6;
}

export function calculateCrossSuccessRate(cro: number, cmp = 70, stakeFactor = 0): number {
  return calculateShortPassSuccessRate(cro, cmp, stakeFactor) * 0.8;
}

export function calculateInsideBoxShotAccuracy(sho: number, cmp = 70, stakeFactor = 0): number {
  const base = sho <= 99 ? 0.1 + 0.85 * normStat(sho) : 0.98;
  return applyComposureStakeModifier(base, cmp, stakeFactor);
}

export function calculateLongShotAccuracy(lsh: number, distFactor: number, cmp = 70, stakeFactor = 0): number {
  const inside = calculateInsideBoxShotAccuracy(lsh, cmp, stakeFactor);
  const drop = Math.max(0, distFactor) * 0.035;
  const raw = Math.max(0.02, 0.6 * inside - drop);
  return applyComposureStakeModifier(raw, cmp, stakeFactor);
}

export function calculateHeaderAccuracy(hea: number, cmp = 70, stakeFactor = 0): number {
  return applyComposureStakeModifier(0.1 + 0.85 * normStat(hea), cmp, stakeFactor);
}

export function calculateTrapDistance(bcl: number, isAirborne = false): number {
  let dist = 36 - 32 * normStat(bcl);
  if (isAirborne) dist *= 1.35;
  return Math.max(3, dist);
}

export function resolveShieldDuel(
  attackerStr: number,
  attackerRet: number,
  defenderStr: number,
  defenderTck: number,
): { holds: boolean; delta: number } {
  const att = 0.6 * attackerStr + 0.4 * attackerRet;
  const def = 0.7 * defenderStr + 0.3 * defenderTck;
  const delta = att - def;
  return { holds: delta >= 0, delta };
}

export function calculateOffBallTopSpeed(pac: number): number {
  const n = normStat(pac);
  return pac > 99 ? 4.4 + 0.35 * Math.min(1, (pac - 99) / 6) : 2.8 + 1.6 * n;
}

export function calculateOnBallTopSpeed(pac: number, dri: number): number {
  return calculateOffBallTopSpeed(pac) * (0.75 + 0.25 * normStat(dri));
}

export function calculateTurnDecelerationFactor(dri: number, angleDiff: number): number {
  if (Math.abs(angleDiff) < Math.PI / 3) return 1;
  const penalty = 0.45 * (1 - normStat(dri));
  return Math.max(0.55, 1 - penalty);
}

export type DribbleTier = 'amateur' | 'semi_pro' | 'pro' | 'elite' | 'world_class' | 'unique';

export function getDribblingTier(dri: number): DribbleTier {
  if (dri >= 100) return 'unique';
  if (dri >= 90) return 'world_class';
  if (dri >= 80) return 'elite';
  if (dri >= 70) return 'pro';
  if (dri >= 60) return 'semi_pro';
  return 'amateur';
}

export function calculateOnBallTurnRate(dri: number, bcl: number): number {
  if (dri > 99 || bcl > 99) return 1;
  const blend = dri * 0.6 + bcl * 0.4;
  return 0.2 + 0.78 * Math.max(0, Math.min(1, (blend - 40) / 59));
}

export function calculateOnBallAccelerationRamp(dri: number, pac: number): number {
  if (dri > 99) return 1;
  const blend = dri * 0.65 + pac * 0.35;
  const t = Math.max(0, Math.min(1, (blend - 40) / 59));
  return 0.22 + 0.78 * Math.pow(t, 1.3);
}

export function getDribblingTouchOffset(tier: DribbleTier): number {
  switch (tier) {
    case 'amateur': return 17;
    case 'semi_pro': return 14;
    case 'pro': return 12;
    case 'elite': return 10;
    case 'world_class': return 9;
    case 'unique': return 8;
  }
}

export function getStepOverCycleSpeed(tier: DribbleTier): number {
  switch (tier) {
    case 'amateur': return 0.65;
    case 'semi_pro': return 0.85;
    case 'pro': return 1.1;
    case 'elite': return 1.45;
    case 'world_class': return 1.85;
    case 'unique': return 2.25;
  }
}

export function calculateInterceptionRadius(intStat: number): number {
  return 14 + 22 * normStat(intStat);
}

export function calculateCleanInterceptChance(intStat: number): number {
  return 0.2 + 0.75 * normStat(intStat);
}

export function calculateStandingTackleCleanChance(tck: number): number {
  return 0.3 + 0.65 * normStat(tck);
}

export function calculateSlideCleanChance(sld: number): number {
  return 0.15 + 0.8 * normStat(sld);
}

export function calculateSlideReach(sld: number): number {
  return 28 + 30 * normStat(sld);
}

export function calculateStealToFeetChance(tck: number): number {
  return 0.25 + 0.7 * normStat(tck);
}

export function calculateAerialAwarenessDelay(rea: number, difficulty: DifficultyLevel = 'normal'): number {
  if (difficulty === 'standing') return 999;
  if (rea > 99) return 0;
  const base = 24 - 22 * normStat(rea);
  const mult = difficulty === 'legend' ? 0.4 : difficulty === 'elite' ? 0.65 : difficulty === 'normal' ? 1 : 1.5;
  return Math.max(0, Math.round(base * mult));
}

export function calculateAerialInterceptionBias(pos: number): number {
  return pos > 99 ? 40 : 10 + 25 * normStat(pos);
}

export interface AerialTimingWindow {
  sweetSpotZMin: number;
  sweetSpotZMax: number;
  acceptableZMin: number;
  acceptableZMax: number;
  maxReachDist: number;
  accuracyBonus: number;
  powerMultiplier: number;
}

export function calculateAerialTimingWindow(rea: number, skill: number, isVolley = false): AerialTimingWindow {
  const blend = normStat(rea) * 0.6 + normStat(skill) * 0.4;
  const isBreak = rea > 99 || skill > 99;
  if (isVolley) {
    return {
      sweetSpotZMin: Math.max(2.5, 4 - blend * 1.5),
      sweetSpotZMax: 16 + blend * 5,
      acceptableZMin: 1.8,
      acceptableZMax: 28 + (isBreak ? 6 : blend * 4),
      maxReachDist: isBreak ? 42 : 24 + blend * 14,
      accuracyBonus: 0.15 + blend * 0.35,
      powerMultiplier: 1 + blend * 0.4,
    };
  }
  return {
    sweetSpotZMin: Math.max(9, 13 - blend * 3.5),
    sweetSpotZMax: 25 + blend * 7,
    acceptableZMin: 7,
    acceptableZMax: 36 + (isBreak ? 8 : blend * 4),
    maxReachDist: isBreak ? 40 : 20 + blend * 15,
    accuracyBonus: 0.1 + blend * 0.4,
    powerMultiplier: 0.95 + blend * 0.35,
  };
}

export function evaluateAerialContactQuality(
  ballZ: number,
  dist: number,
  window: AerialTimingWindow,
): 'sweet_spot' | 'acceptable' | 'mistimed' {
  if (dist > window.maxReachDist) return 'mistimed';
  if (ballZ >= window.sweetSpotZMin && ballZ <= window.sweetSpotZMax) return 'sweet_spot';
  if (ballZ >= window.acceptableZMin && ballZ <= window.acceptableZMax) return 'acceptable';
  return 'mistimed';
}

export function calculateSecondBallReactionDelay(rea: number, difficulty: DifficultyLevel = 'normal'): number {
  if (difficulty === 'standing') return 999;
  if (rea > 99) return 0;
  const base = 14 - 13 * normStat(rea);
  const mult = difficulty === 'legend' ? 0.35 : difficulty === 'elite' ? 0.6 : difficulty === 'normal' ? 1 : 1.8;
  return Math.max(0, Math.round(base * mult));
}

export function calculateGkDiveReach(sav: number, ref: number): number {
  return 28 + 20 * (0.6 * normStat(sav) + 0.4 * normStat(ref));
}

export function calculateGkCatchChance(han: number): number {
  return han > 99 ? 1 : 0.35 + 0.6 * normStat(han);
}

export function calculateInitialMaxStamina(sta: number): number {
  return 100 + 50 * normStat(sta);
}

export function updatePlayerStaminaDynamic(
  player: Player,
  isSprinting: boolean,
  timeScale = 1,
  staminaMultiplier = 1
): void {
  const sta = (player.canonicalStats as CanonicalOutfieldStats | undefined)?.sta ?? 70;
  if (sta > 99) {
    player.stamina = player.staminaMax ?? 150;
    return;
  }
  if (player.staminaInitialMax === undefined) {
    player.staminaInitialMax = calculateInitialMaxStamina(sta);
    player.staminaMax = player.staminaInitialMax;
    player.stamina = player.staminaMax;
  }
  const initMax = player.staminaInitialMax;
  const currMax = player.staminaMax ?? initMax;
  const floorMax = 0.5 * initMax;
  if (isSprinting) {
    const drain = (sta > 99 ? 0 : 0.28 - 0.12 * normStat(sta)) * timeScale * Math.max(0.5, staminaMultiplier);
    player.stamina = Math.max(0, (player.stamina ?? currMax) - drain);
    player.staminaMax = Math.max(floorMax, currMax - 0.04 * drain);
  } else {
    const rec = (0.08 + 0.14 * normStat(sta)) * timeScale;
    player.stamina = Math.min(currMax, (player.stamina ?? currMax) + rec);
  }
}

export function createStatsBuffer(
  outfield?: Partial<CanonicalOutfieldStats>,
  gk?: Partial<CanonicalGoalkeeperStats>,
): Float32Array {
  const buf = new Float32Array(25);
  if (outfield) {
    buf[0] = outfield.pac ?? 70;
    buf[1] = outfield.sta ?? 70;
    buf[2] = outfield.str ?? 70;
    buf[3] = outfield.bcl ?? 70;
    buf[4] = outfield.ret ?? 70;
    buf[5] = outfield.dri ?? 70;
    buf[6] = outfield.spa ?? 70;
    buf[7] = outfield.lpa ?? 70;
    buf[8] = outfield.cro ?? 70;
    buf[9] = outfield.sho ?? 70;
    buf[10] = outfield.hea ?? 70;
    buf[11] = outfield.lsh ?? 70;
    buf[12] = outfield.tck ?? 70;
    buf[13] = outfield.sld ?? 70;
    buf[14] = outfield.int ?? 70;
    buf[15] = outfield.mrk ?? 70;
    buf[16] = outfield.pos ?? 70;
    buf[17] = outfield.cmp ?? 70;
    buf[18] = outfield.rea ?? 70;
  }
  if (gk) {
    buf[19] = gk.sav ?? 70;
    buf[20] = gk.ref ?? 70;
    buf[21] = gk.han ?? 70;
    buf[22] = gk.gpo ?? 70;
    buf[23] = gk.aer ?? 70;
    buf[24] = gk.oneOnOne ?? 70;
  }
  return buf;
}

export const HOME_PLAYER_CANONICAL_STATS: Record<PlayerRole, CanonicalOutfieldStats | CanonicalGoalkeeperStats> = {
  GK: { sav: 101, ref: 97, han: 94, gpo: 95, aer: 96, oneOnOne: 98, dis: 90 },
  LB: { pac: 88, sta: 95, str: 88, bcl: 90, ret: 88, dri: 84, spa: 88, lpa: 87, cro: 86, sho: 64, hea: 92, lsh: 62, tck: 101, sld: 98, int: 98, mrk: 99, pos: 98, cmp: 98, rea: 96 },
  CB1: { pac: 85, sta: 93, str: 87, bcl: 91, ret: 89, dri: 82, spa: 91, lpa: 90, cro: 76, sho: 58, hea: 90, lsh: 60, tck: 99, sld: 98, int: 99, mrk: 99, pos: 101, cmp: 99, rea: 98 },
  CB2: { pac: 80, sta: 91, str: 93, bcl: 89, ret: 85, dri: 80, spa: 92, lpa: 101, cro: 84, sho: 95, hea: 88, lsh: 99, tck: 92, sld: 90, int: 91, mrk: 89, pos: 93, cmp: 95, rea: 91 },
  RB: { pac: 96, sta: 101, str: 84, bcl: 91, ret: 90, dri: 92, spa: 89, lpa: 87, cro: 93, sho: 72, hea: 78, lsh: 75, tck: 88, sld: 86, int: 90, mrk: 87, pos: 92, cmp: 91, rea: 95 },
  LM: { pac: 101, sta: 92, str: 78, bcl: 95, ret: 94, dri: 96, spa: 91, lpa: 88, cro: 96, sho: 84, hea: 72, lsh: 82, tck: 65, sld: 62, int: 72, mrk: 64, pos: 92, cmp: 90, rea: 95 },
  CM1: { pac: 90, sta: 97, str: 92, bcl: 94, ret: 93, dri: 90, spa: 95, lpa: 94, cro: 86, sho: 93, hea: 84, lsh: 96, tck: 92, sld: 90, int: 94, mrk: 92, pos: 96, cmp: 97, rea: 96 },
  CM2: { pac: 93, sta: 96, str: 101, bcl: 95, ret: 94, dri: 93, spa: 93, lpa: 91, cro: 89, sho: 92, hea: 98, lsh: 92, tck: 86, sld: 84, int: 88, mrk: 86, pos: 95, cmp: 95, rea: 95 },
  RM: { pac: 91, sta: 88, str: 86, bcl: 96, ret: 95, dri: 96, spa: 94, lpa: 92, cro: 91, sho: 89, hea: 75, lsh: 91, tck: 72, sld: 68, int: 76, mrk: 70, pos: 91, cmp: 92, rea: 94 },
  ST1: { pac: 96, sta: 88, str: 84, bcl: 99, ret: 99, dri: 101, spa: 98, lpa: 96, cro: 95, sho: 98, hea: 78, lsh: 97, tck: 52, sld: 48, int: 70, mrk: 55, pos: 98, cmp: 98, rea: 99 },
  ST2: { pac: 91, sta: 90, str: 91, bcl: 97, ret: 94, dri: 93, spa: 90, lpa: 84, cro: 82, sho: 99, hea: 101, lsh: 94, tck: 50, sld: 46, int: 62, mrk: 52, pos: 99, cmp: 97, rea: 96 },
};

export const AWAY_PLAYER_CANONICAL_STATS: Record<PlayerRole, CanonicalOutfieldStats | CanonicalGoalkeeperStats> = {
  GK: { sav: 95, ref: 95, han: 101, gpo: 99, aer: 93, oneOnOne: 95, dis: 86 },
  RB: { pac: 88, sta: 94, str: 86, bcl: 92, ret: 90, dri: 87, spa: 92, lpa: 94, cro: 96, sho: 88, hea: 80, lsh: 92, tck: 90, sld: 88, int: 91, mrk: 90, pos: 93, cmp: 96, rea: 93 },
  CB1: { pac: 86, sta: 92, str: 88, bcl: 92, ret: 90, dri: 84, spa: 93, lpa: 91, cro: 76, sho: 62, hea: 91, lsh: 66, tck: 98, sld: 97, int: 101, mrk: 98, pos: 99, cmp: 99, rea: 97 },
  CB2: { pac: 87, sta: 95, str: 97, bcl: 87, ret: 85, dri: 80, spa: 88, lpa: 86, cro: 72, sho: 65, hea: 96, lsh: 68, tck: 98, sld: 96, int: 96, mrk: 97, pos: 96, cmp: 95, rea: 95 },
  LB: { pac: 98, sta: 97, str: 93, bcl: 89, ret: 86, dri: 90, spa: 87, lpa: 94, cro: 94, sho: 96, hea: 72, lsh: 101, tck: 88, sld: 93, int: 87, mrk: 84, pos: 90, cmp: 92, rea: 95 },
  RM: { pac: 78, sta: 84, str: 78, bcl: 98, ret: 99, dri: 94, spa: 101, lpa: 97, cro: 92, sho: 82, hea: 68, lsh: 84, tck: 60, sld: 55, int: 78, mrk: 62, pos: 96, cmp: 99, rea: 95 },
  CM1: { pac: 89, sta: 96, str: 96, bcl: 94, ret: 93, dri: 89, spa: 94, lpa: 92, cro: 82, sho: 86, hea: 96, lsh: 88, tck: 97, sld: 95, int: 97, mrk: 101, pos: 97, cmp: 97, rea: 96 },
  CM2: { pac: 88, sta: 89, str: 82, bcl: 97, ret: 96, dri: 96, spa: 96, lpa: 95, cro: 93, sho: 95, hea: 74, lsh: 98, tck: 62, sld: 58, int: 74, mrk: 65, pos: 94, cmp: 95, rea: 95 },
  LM: { pac: 95, sta: 93, str: 88, bcl: 95, ret: 93, dri: 95, spa: 91, lpa: 89, cro: 92, sho: 96, hea: 84, lsh: 95, tck: 68, sld: 66, int: 77, mrk: 70, pos: 95, cmp: 96, rea: 101 },
  ST1: { pac: 96, sta: 84, str: 82, bcl: 99, ret: 98, dri: 98, spa: 88, lpa: 80, cro: 76, sho: 101, hea: 84, lsh: 91, tck: 46, sld: 42, int: 58, mrk: 46, pos: 99, cmp: 98, rea: 99 },
  ST2: { pac: 93, sta: 89, str: 80, bcl: 98, ret: 98, dri: 98, spa: 96, lpa: 94, cro: 92, sho: 97, hea: 78, lsh: 95, tck: 52, sld: 48, int: 68, mrk: 54, pos: 97, cmp: 101, rea: 97 },
};
