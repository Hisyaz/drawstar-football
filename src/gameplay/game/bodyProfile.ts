import type {
  AppearanceV2,
  CalfSizeV2,
  ChestSizeV2,
  LimbLengthV2,
  MuscularityTierV2,
  NeckLengthV2,
  NeckWidthV2,
  PlayerAppearance,
  ThighSizeV2,
  ThicknessTier,
  WaistSizeV2,
} from '../types';

/**
 * Body model (shared by v1 rig and C6 AppearanceV2).
 * Weight/height ratio (BMI) gives 3 weight classes (skinny / normal / heavy);
 * STRENGTH gives 3 muscle configurations (0-70 low, 71-89 medium, 90+ high). 3 x 3 = 9 build variants.
 * Height sets how tall the player is; chest, waist, thighs, calves and neck width have 4 thickness tiers on top.
 * Base proportions are LEAN (footballers). All sizes are rig pixels (2x).
 */
export type WeightClass = 'skinny' | 'normal' | 'heavy';
export type MuscleLevel = 0 | 1 | 2; // low, medium, high
export type BuildId = `${WeightClass}_${'low' | 'medium' | 'high'}`;
export type Tier = ThicknessTier; // 0 | 1 | 2 | 3
const MUSCLE_NAME = ['low', 'medium', 'high'] as const;

/**
 * Single authoritative mapping between C6 v2 4-tier physique labels and the rig's 0..3 thickness tiers.
 * Legacy v1 field names: chestTier -> chest, waistTier -> waist, thighTier -> thighs, calfTier -> calves, neckTier -> neckWidth.
 */
export const NECK_WIDTH_TIERS: readonly NeckWidthV2[] = ['thin', 'normal', 'wide', 'bulky'] as const;
export const CHEST_SIZE_TIERS: readonly ChestSizeV2[] = ['frail', 'normal', 'wide', 'powerful'] as const;
export const WAIST_SIZE_TIERS: readonly WaistSizeV2[] = ['skinny', 'normal', 'chubby', 'chonky'] as const;
export const THIGH_SIZE_TIERS: readonly ThighSizeV2[] = ['skinny', 'normal', 'powerful', 'huge'] as const;
export const CALF_SIZE_TIERS: readonly CalfSizeV2[] = ['skinny', 'normal', 'powerful', 'huge'] as const;

export const LEGACY_TIER_FIELD_MAP = {
  chestTier: 'chest',
  waistTier: 'waist',
  thighTier: 'thighs',
  calfTier: 'calves',
  neckTier: 'neckWidth',
} as const;

export function labelToTier<T extends string>(options: readonly T[], value: unknown, fallback: Tier = 1): Tier {
  if (typeof value === 'number' && isFinite(value)) {
    return clamp(Math.round(value), 0, 3) as Tier;
  }
  if (typeof value === 'string') {
    const idx = options.indexOf(value as T);
    if (idx >= 0) return idx as Tier;
  }
  return fallback;
}

export function tierToLabel<T extends string>(options: readonly T[], tier: unknown, fallbackIndex: Tier = 1): T {
  const idx = typeof tier === 'number' && isFinite(tier) ? (clamp(Math.round(tier), 0, 3) as Tier) : fallbackIndex;
  return options[idx];
}

export interface BodyProfile {
  build: BuildId;
  weightClass: WeightClass;
  muscle: MuscleLevel;
  muscularity: MuscularityTierV2;
  heightScale: number;
  headScale: number;
  chestW: number;
  waistW: number;
  hipW: number;
  shoulderSpan: number;
  thighT: number;
  calfT: number;
  upperArmT: number;
  foreArmT: number;
  neckW: number;
  belly: number;
  legLen: number;
  torsoLen: number;
  armScale: number;
  neckLen: number;
  // Canonical C6 4-tier indices & limb length metadata (consumed by C7 renderer)
  chestTier: Tier;
  waistTier: Tier;
  thighTier: Tier;
  calfTier: Tier;
  neckWidthTier: Tier;
  neckLength: NeckLengthV2;
  legsLength: LimbLengthV2;
  armsLength: LimbLengthV2;
}

export type AnyAppearance = PlayerAppearance | AppearanceV2;

function isV2(a: any): a is AppearanceV2 {
  return Boolean(a && a.version === 2 && a.physique);
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function extractHeightWeight(a: AnyAppearance): { heightCm: number; weightKg: number } {
  if (isV2(a)) {
    return {
      heightCm: Number.isFinite(a.physique.heightCm) ? a.physique.heightCm : 180,
      weightKg: Number.isFinite(a.physique.weightKg) ? a.physique.weightKg : 75,
    };
  }
  return {
    heightCm: Number.isFinite(a?.heightCm) ? a.heightCm : 180,
    weightKg: Number.isFinite(a?.weightKg) ? a.weightKg : 75,
  };
}

export function bmiOf(a: Pick<PlayerAppearance, 'heightCm' | 'weightKg'> | AppearanceV2): number {
  const hw = extractHeightWeight(a as AnyAppearance);
  const m = (hw.heightCm || 180) / 100;
  return (hw.weightKg || 75) / (m * m);
}

export function getWeightClass(a: AnyAppearance): WeightClass {
  const bmi = bmiOf(a);
  return bmi < 21 ? 'skinny' : bmi <= 24.6 ? 'normal' : 'heavy';
}

/** STR stat -> stored muscleMass (legacy v1): 0-70 = 1.5 (low), 71-89 = 3 (medium), 90+ = 4.5 (high) */
export function muscleFromStrength(str: number): number {
  return str >= 90 ? 4.5 : str >= 71 ? 3 : 1.5;
}

/** STR stat -> canonical C6 muscularity tier: 0-70 low, 71-89 medium, 90+ high */
export function muscularityFromStrength(str: number): MuscularityTierV2 {
  if (!Number.isFinite(str)) return 'medium';
  return str >= 90 ? 'high' : str >= 71 ? 'medium' : 'low';
}

export function strengthFromMuscleMass(muscleMass: number): number {
  if (!Number.isFinite(muscleMass)) return 75;
  return muscleMass < 2.25 ? 60 : muscleMass < 3.75 ? 78 : 92;
}

export function muscleLevelOf(a: AnyAppearance): MuscleLevel {
  if (isV2(a)) {
    const str = Number.isFinite(a.physique.strength) ? a.physique.strength : 75;
    return str >= 90 ? 2 : str >= 71 ? 1 : 0;
  }
  const m = a?.muscleMass ?? 3;
  return m < 2.25 ? 0 : m < 3.75 ? 1 : 2;
}

export function getBuild(a: AnyAppearance): BuildId {
  return `${getWeightClass(a)}_${MUSCLE_NAME[muscleLevelOf(a)]}` as BuildId;
}

const BASE = { chest: 25, waist: 20, hip: 21, shoulder: 14, thigh: 8, calf: 6, upperArm: 5, foreArm: 4, neck: 5 };
const WEIGHT_MULT: Record<WeightClass, { c: number; w: number; l: number; n: number; belly: number }> = {
  skinny: { c: 0.86, w: 0.80, l: 0.80, n: 0.84, belly: 0 },
  normal: { c: 1, w: 0.95, l: 1, n: 1, belly: 0 },
  heavy: { c: 1.08, w: 1.28, l: 1.12, n: 1.14, belly: 3 },
};
const MUSCLE_MULT = [
  { c: 0.95, w: 1.02, l: 0.92, n: 0.95 },
  { c: 1.02, w: 0.98, l: 1.04, n: 1.04 },
  { c: 1.14, w: 0.96, l: 1.24, n: 1.22 },
];
const TIER_PX = [-2, 0, 2, 4];

/** Default [calves, waist, chest, arms, neckWidth] 0..3 tiers from weight class + muscle level */
export function defaultTiers(w: WeightClass, m: MuscleLevel): [Tier, Tier, Tier, Tier, Tier] {
  const waist: Tier = w === 'skinny' ? 0 : w === 'normal' ? 1 : m === 2 ? 2 : 3;
  const limb = clamp(m + (w === 'heavy' ? 1 : w === 'skinny' ? -1 : 0), 0, 3) as Tier;
  return [limb, waist, clamp(m + 1, 0, 3) as Tier, limb, clamp(m + (w === 'heavy' ? 1 : 0), 0, 3) as Tier];
}

export function getBodyProfile(a: AnyAppearance): BodyProfile {
  const wc = getWeightClass(a);
  const ml = muscleLevelOf(a);
  const w = WEIGHT_MULT[wc];
  const mm = MUSCLE_MULT[ml];
  const d = defaultTiers(wc, ml);
  const { heightCm } = extractHeightWeight(a);

  let chestTier: Tier;
  let waistTier: Tier;
  let thighTier: Tier;
  let calfTier: Tier;
  let neckWidthTier: Tier;
  let armTierVal: Tier;
  let neckLength: NeckLengthV2 = 'normal';
  let legsLength: LimbLengthV2 = 'normal';
  let armsLength: LimbLengthV2 = 'normal';
  let hasExplicitThigh = false;

  if (isV2(a)) {
    chestTier = labelToTier(CHEST_SIZE_TIERS, a.physique.chest, d[2]);
    waistTier = labelToTier(WAIST_SIZE_TIERS, a.physique.waist, d[1]);
    thighTier = labelToTier(THIGH_SIZE_TIERS, a.physique.thighs, d[0]);
    calfTier = labelToTier(CALF_SIZE_TIERS, a.physique.calves, d[0]);
    neckWidthTier = labelToTier(NECK_WIDTH_TIERS, a.physique.neckWidth, d[4]);
    armTierVal = d[3];
    neckLength = a.physique.neckLength || 'normal';
    legsLength = a.physique.legsLength || 'normal';
    armsLength = a.physique.armsLength || 'normal';
    hasExplicitThigh = true;
  } else {
    const ap: any = a || {};
    calfTier = labelToTier(CALF_SIZE_TIERS, ap.calfTier, d[0]);
    thighTier = ap.thighTier !== undefined ? labelToTier(THIGH_SIZE_TIERS, ap.thighTier, calfTier) : calfTier;
    hasExplicitThigh = ap.thighTier !== undefined;
    waistTier = labelToTier(WAIST_SIZE_TIERS, ap.waistTier, d[1]);
    chestTier = labelToTier(CHEST_SIZE_TIERS, ap.chestTier, d[2]);
    armTierVal = labelToTier(CALF_SIZE_TIERS, ap.armTier, d[3]);
    neckWidthTier = labelToTier(NECK_WIDTH_TIERS, ap.neckTier, d[4]);
  }

  const tCalf = TIER_PX[calfTier];
  const tThigh = TIER_PX[thighTier];
  const tWaist = TIER_PX[waistTier];
  const tChest = TIER_PX[chestTier];
  const tArm = TIER_PX[armTierVal];
  const tNeck = TIER_PX[neckWidthTier];

  const hs = clamp(0.90 + ((clamp(heightCm || 180, 165, 202) - 165) / 37) * 0.24, 0.90, 1.14);
  const legMult = legsLength === 'short' ? 0.85 : legsLength === 'long' ? 1.15 : 1.0;
  const torsoMult = legsLength === 'short' ? 1.07 : legsLength === 'long' ? 0.94 : 1.0;
  const armScale = armsLength === 'short' ? 0.84 : armsLength === 'long' ? 1.18 : 1.0;
  const neckLen = neckLength === 'turtle' ? 1 : neckLength === 'short' ? 3 : neckLength === 'long' ? 8 : 5;
  const c = w.c * mm.c;
  const wa = w.w * mm.w;
  const l = w.l * mm.l;
  const n = w.n * mm.n;

  return {
    build: `${wc}_${MUSCLE_NAME[ml]}` as BuildId,
    weightClass: wc,
    muscle: ml,
    muscularity: MUSCLE_NAME[ml],
    heightScale: hs,
    headScale: 0.96 + (hs - 0.9) * 0.16,
    chestW: Math.round(BASE.chest * c + tChest * 1.6),
    waistW: Math.round(BASE.waist * wa + tWaist * 1.6),
    hipW: Math.round(BASE.hip * (0.5 + wa * 0.5) + tWaist),
    shoulderSpan: Math.round(BASE.shoulder * c + tChest * 0.6),
    thighT: Math.max(5, Math.round(BASE.thigh * l + (hasExplicitThigh ? tThigh : tCalf * 0.5))),
    calfT: Math.max(4, Math.round(BASE.calf * l + tCalf)),
    upperArmT: Math.max(3, Math.round(BASE.upperArm * l + tArm)),
    foreArmT: Math.max(3, Math.round(BASE.foreArm * l + tArm * 0.8)),
    neckW: Math.max(3, Math.round(BASE.neck * n + tNeck)),
    belly: w.belly,
    legLen: Math.round(29 * hs * legMult),
    torsoLen: Math.round(23 * hs * torsoMult),
    armScale,
    neckLen,
    chestTier,
    waistTier,
    thighTier,
    calfTier,
    neckWidthTier,
    neckLength,
    legsLength,
    armsLength,
  };
}
