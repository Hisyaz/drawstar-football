/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  AppearanceSchemaVersion,
  AppearanceV2,
  AppearanceValidationResult,
  ArmTattooV2,
  CalfSizeV2,
  ChestSizeV2,
  EarringGemV2,
  EarringMaterialV2,
  EarringSlotV2,
  EarringStyleV2,
  EarringsV2,
  FaceTattooV2,
  FacialHairV2,
  HairColorV2,
  HairDyeV2,
  HairLengthV2,
  HairTextureV2,
  HeadwearV2,
  GlassesShadeV2,
  RegularGlassesDesignV2,
  InteriorShirtNeckV2,
  InteriorShirtSleeveV2,
  InteriorShirtV2,
  JerseyTuckV2,
  LimbLengthV2,
  NeckLengthV2,
  NeckTattooV2,
  NeckWidthV2,
  NecklaceV2,
  PhysiqueV2,
  PlayerAppearance,
  ShirtCutV2,
  SkinToneV2,
  SleeveLengthV2,
  SockLengthV2,
  TattoosV2,
  ThighSizeV2,
  UniformV2,
  WaistSizeV2,
} from '../types/player';
import {
  CALF_SIZE_TIERS,
  CHEST_SIZE_TIERS,
  NECK_WIDTH_TIERS,
  THIGH_SIZE_TIERS,
  WAIST_SIZE_TIERS,
  defaultTiers,
  getWeightClass,
  muscleFromStrength,
  muscleLevelOf,
  strengthFromMuscleMass,
  tierToLabel,
} from './bodyProfile';

export const APPEARANCE_SCHEMA_VERSION: AppearanceSchemaVersion = 2;

export const HAIR_LENGTHS_V2: readonly HairLengthV2[] = [
  'shaven',
  'fade',
  'short',
  'medium',
  'long',
] as const;

export const HAIR_TEXTURES_V2: readonly HairTextureV2[] = [
  'straight',
  'wavy',
  'curly',
  'braids',
  'dreads',
] as const;

export const HAIR_COLORS_V2: readonly HairColorV2[] = [
  'black',
  'dark_brown',
  'light_brown',
  'auburn',
  'blonde',
  'red',
] as const;

export const HAIR_COLOR_HEX_V2: Record<HairColorV2, string> = {
  black: '#18181b',
  dark_brown: '#3b2314',
  light_brown: '#7c5230',
  auburn: '#8b3a1e',
  blonde: '#e5c158',
  red: '#b83b1d',
};

export const HAIR_DYES_V2: readonly HairDyeV2[] = [
  'natural',
  'silver_white',
  'platinum',
  'red',
  'orange',
  'yellow',
  'pink',
  'blue',
  'green',
] as const;

export const HAIR_DYE_HEX_V2: Record<Exclude<HairDyeV2, 'natural'>, string> = {
  silver_white: '#cbd5e1',
  platinum: '#f8fafc',
  red: '#dc2626',
  orange: '#f97316',
  yellow: '#facc15',
  pink: '#ec4899',
  blue: '#2563eb',
  green: '#16a34a',
};

export const SKIN_TONES_V2: readonly SkinToneV2[] = [
  'pale',
  'fair',
  'tanned',
  'sun_kissed',
  'olive',
  'dark',
  'ebony',
] as const;

export const SKIN_TONE_HEX_V2: Record<SkinToneV2, string> = {
  pale: '#ffdbac',
  fair: '#f1c27d',
  olive: '#e0ac69',
  sun_kissed: '#d59a58',
  tanned: '#c68642',
  dark: '#8d5524',
  ebony: '#3b2219',
};

export const FACIAL_HAIRS_V2: readonly FacialHairV2[] = [
  'none',
  'full_beard',
  'well_kept_beard',
  'three_day_stubble',
  'mutton_chops',
  'royal_beard',
  'goatee',
  'chin_strap',
  'mustache',
  'pointy_mustache',
  'classic_mustache',
] as const;

export const HEADWEAR_V2: readonly HeadwearV2[] = [
  'none',
  'sports_headband',
  'performance_elastic_band',
  'protective_face_mask',
  'sports_glasses',
] as const;

export const REGULAR_GLASSES_DESIGNS_V2: readonly RegularGlassesDesignV2[] = ['none', 'round', 'square', 'rectangular'] as const;
export const GLASSES_SHADES_V2: readonly GlassesShadeV2[] = ['transparent', 'tinted_black', 'iridescent', 'grey', 'gold', 'blue', 'pink', 'red'] as const;

export const NECKLACES_V2: readonly NecklaceV2[] = [
  'none',
  'military_tag',
  'silver_necklace',
  'gold_necklace',
  'diamond_encrusted_gold_necklace',
] as const;

export const NECK_TATTOOS_V2: readonly NeckTattooV2[] = [
  'none',
  'script_lettering',
  'rose',
  'blackout_neck',
  'winger_crest',
] as const;

export const ARM_TATTOOS_V2: readonly ArmTattooV2[] = [
  'none',
  'double_stripe_band',
  'script_name_sleeve',
  'tribal_sleeve',
  'floral_mandala_sleeve',
  'blackout_sleeve',
] as const;

export const FACE_TATTOOS_V2: readonly FaceTattooV2[] = [
  'none',
  'cheek_star',
  'under_eye_cross',
  'cheek_script',
  'temple_crown',
] as const;

export const EARRING_STYLES_V2: readonly EarringStyleV2[] = [
  'none',
  'small_barbell',
  'large_barbell',
  'studs',
  'gem',
] as const;

export const EARRING_MATERIALS_V2: readonly EarringMaterialV2[] = [
  'silver',
  'gold',
  'bronze',
  'black_steel',
  'steel',
] as const;

export const EARRING_GEMS_V2: readonly EarringGemV2[] = [
  'diamond',
  'white_pearl',
  'emerald',
  'sapphire',
  'amethyst',
] as const;

export const NECK_WIDTHS_V2 = NECK_WIDTH_TIERS;
export const NECK_LENGTHS_V2: readonly NeckLengthV2[] = ['turtle', 'short', 'normal', 'long'] as const;
export const CHEST_SIZES_V2 = CHEST_SIZE_TIERS;
export const WAIST_SIZES_V2 = WAIST_SIZE_TIERS;
export const THIGH_SIZES_V2 = THIGH_SIZE_TIERS;
export const CALF_SIZES_V2 = CALF_SIZE_TIERS;
export const LIMB_LENGTHS_V2: readonly LimbLengthV2[] = ['short', 'normal', 'long'] as const;

export const SHIRT_CUTS_V2: readonly ShirtCutV2[] = ['tight', 'normal', 'big_retro'] as const;
export const JERSEY_TUCKS_V2: readonly JerseyTuckV2[] = ['tucked', 'untucked'] as const;
export const SOCK_LENGTHS_V2: readonly SockLengthV2[] = ['short', 'normal', 'long'] as const;
export const SLEEVE_LENGTHS_V2: readonly SleeveLengthV2[] = ['normal', 'long'] as const;
export const INTERIOR_SHIRT_SLEEVES_V2: readonly InteriorShirtSleeveV2[] = ['short', 'long'] as const;
export const INTERIOR_SHIRT_NECKS_V2: readonly InteriorShirtNeckV2[] = ['short', 'long'] as const;

export const SHOE_COLOR_PRESETS_V2: readonly string[] = [
  '#111111', // Classic Black
  '#f8fafc', // Pure White
  '#dc2626', // Crimson Red
  '#2563eb', // Electric Blue
  '#facc15', // Solar Gold
  '#f97316', // Neon Orange
  '#ec4899', // Vivid Pink
  '#10b981', // Mint Emerald
] as const;

export const PHYSIQUE_LIMITS_V2 = {
  heightCm: { min: 155, max: 210, default: 180 },
  weightKg: { min: 55, max: 115, default: 75 },
  strength: { min: 0, max: 120, default: 75 },
} as const;

export interface DeepPartialAppearanceV2 {
  version?: number;
  hairLength?: HairLengthV2;
  hairTexture?: HairTextureV2;
  hairColor?: HairColorV2;
  hairDye?: HairDyeV2;
  skinTone?: SkinToneV2;
  facialHair?: FacialHairV2;
  headwear?: HeadwearV2;
  regularGlasses?: { design?: RegularGlassesDesignV2; frameColor?: string; shade?: GlassesShadeV2 };
  necklace?: NecklaceV2;
  tattoos?: Partial<TattoosV2>;
  earrings?: {
    left?: Partial<EarringSlotV2>;
    right?: Partial<EarringSlotV2>;
  };
  physique?: Partial<PhysiqueV2>;
  uniform?: Partial<Omit<UniformV2, 'interiorShirt'>> & {
    interiorShirt?: Partial<InteriorShirtV2>;
  };
}

export function createDefaultEarringSlotV2(overrides?: Partial<EarringSlotV2>): EarringSlotV2 {
  return {
    style: overrides?.style ?? 'none',
    material: overrides?.material ?? 'silver',
    gem: overrides?.gem ?? 'diamond',
  };
}

export function createDefaultAppearanceV2(overrides?: DeepPartialAppearanceV2): AppearanceV2 {
  return {
    version: APPEARANCE_SCHEMA_VERSION,
    hairLength: overrides?.hairLength ?? 'short',
    hairTexture: overrides?.hairTexture ?? 'straight',
    hairColor: overrides?.hairColor ?? 'dark_brown',
    hairDye: overrides?.hairDye ?? 'natural',
    skinTone: overrides?.skinTone ?? 'fair',
    facialHair: overrides?.facialHair ?? 'none',
    headwear: overrides?.headwear ?? 'none',
    regularGlasses: {
      design: overrides?.regularGlasses?.design ?? 'none',
      frameColor: overrides?.regularGlasses?.frameColor ?? '#334155',
      shade: overrides?.regularGlasses?.shade ?? 'transparent',
    },
    necklace: overrides?.necklace ?? 'none',
    tattoos: {
      neck: overrides?.tattoos?.neck ?? 'none',
      leftArm: overrides?.tattoos?.leftArm ?? 'none',
      rightArm: overrides?.tattoos?.rightArm ?? 'none',
      face: overrides?.tattoos?.face ?? 'none',
    },
    earrings: {
      left: createDefaultEarringSlotV2(overrides?.earrings?.left),
      right: createDefaultEarringSlotV2(overrides?.earrings?.right),
    },
    physique: {
      heightCm: overrides?.physique?.heightCm ?? PHYSIQUE_LIMITS_V2.heightCm.default,
      weightKg: overrides?.physique?.weightKg ?? PHYSIQUE_LIMITS_V2.weightKg.default,
      strength: overrides?.physique?.strength ?? PHYSIQUE_LIMITS_V2.strength.default,
      neckWidth: overrides?.physique?.neckWidth ?? 'normal',
      neckLength: overrides?.physique?.neckLength ?? 'normal',
      chest: overrides?.physique?.chest ?? 'normal',
      waist: overrides?.physique?.waist ?? 'normal',
      thighs: overrides?.physique?.thighs ?? 'normal',
      calves: overrides?.physique?.calves ?? 'normal',
      legsLength: overrides?.physique?.legsLength ?? 'normal',
      armsLength: overrides?.physique?.armsLength ?? 'normal',
    },
    uniform: {
      shirtCut: overrides?.uniform?.shirtCut ?? 'normal',
      tucked: overrides?.uniform?.tucked ?? 'tucked',
      socks: overrides?.uniform?.socks ?? 'normal',
      sleeves: overrides?.uniform?.sleeves ?? 'normal',
      interiorShirt: {
        enabled: overrides?.uniform?.interiorShirt?.enabled ?? false,
        sleeve: overrides?.uniform?.interiorShirt?.sleeve ?? 'short',
        neck: overrides?.uniform?.interiorShirt?.neck ?? 'short',
      },
      shoeColor: overrides?.uniform?.shoeColor ?? '#111111',
    },
  };
}

export function isAppearanceV2(value: unknown): value is AppearanceV2 {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (value as any).version === APPEARANCE_SCHEMA_VERSION &&
      (value as any).physique &&
      (value as any).uniform
  );
}

// ============================================================================
// Validation & Repair (invalid values are repaired, never rejected)
// ============================================================================

export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const short = /^#?([0-9a-fA-F]{3})$/.exec(trimmed);
  if (short) {
    const s = short[1].toLowerCase();
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`;
  }
  const full = /^#?([0-9a-fA-F]{6})$/.exec(trimmed);
  if (full) {
    return `#${full[1].toLowerCase()}`;
  }
  return null;
}

function normalizeToken(val: unknown): string {
  return typeof val === 'string'
    ? val
        .trim()
        .toLowerCase()
        .replace(/[\s/-]+/g, '_')
    : '';
}

function validateEnum<T extends string>(
  raw: unknown,
  allowed: readonly T[],
  fallback: T,
  field: string,
  errors: string[],
  aliases?: Record<string, T>
): T {
  if (typeof raw === 'string' && (allowed as readonly string[]).includes(raw)) {
    return raw as T;
  }
  const norm = normalizeToken(raw);
  if (norm && (allowed as readonly string[]).includes(norm)) {
    errors.push(`${field}: normalized non-canonical value "${String(raw)}" -> "${norm}"`);
    return norm as T;
  }
  if (norm && aliases && aliases[norm]) {
    errors.push(`${field}: mapped alias "${String(raw)}" -> "${aliases[norm]}"`);
    return aliases[norm];
  }
  errors.push(`${field}: invalid value ${JSON.stringify(raw)} -> repaired to "${fallback}"`);
  return fallback;
}

function validateClampedInt(
  raw: unknown,
  min: number,
  max: number,
  fallback: number,
  field: string,
  errors: string[]
): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    errors.push(`${field}: non-finite value ${JSON.stringify(raw)} -> repaired to ${fallback}`);
    return fallback;
  }
  const rounded = Math.round(raw);
  if (rounded < min || rounded > max) {
    const clamped = Math.max(min, Math.min(max, rounded));
    errors.push(`${field}: out-of-range value ${raw} -> clamped to ${clamped}`);
    return clamped;
  }
  return rounded;
}

const HAIR_LENGTH_ALIASES: Record<string, HairLengthV2> = {
  bald: 'shaven',
  shaved: 'shaven',
  buzzcut: 'short',
  high_fade: 'fade',
};

const HAIR_DYE_ALIASES: Record<string, HairDyeV2> = {
  none: 'natural',
  silver: 'silver_white',
  white: 'silver_white',
};

const FACIAL_HAIR_ALIASES: Record<string, FacialHairV2> = {
  clean: 'none',
  stubble: 'three_day_stubble',
  '3_day_stubble': 'three_day_stubble',
  beard: 'full_beard',
};

const SHIRT_CUT_ALIASES: Record<string, ShirtCutV2> = {
  big: 'big_retro',
  retro: 'big_retro',
  loose: 'big_retro',
};

const SOCK_LENGTH_ALIASES: Record<string, SockLengthV2> = {
  low: 'short',
  standard: 'normal',
  high_knee: 'long',
};

function validateEarringSlot(
  raw: unknown,
  field: string,
  errors: string[]
): EarringSlotV2 {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  if (!obj) {
    errors.push(`${field}: missing/invalid object -> repaired to default`);
    return createDefaultEarringSlotV2();
  }
  return {
    style: validateEnum(obj.style, EARRING_STYLES_V2, 'none', `${field}.style`, errors),
    material: validateEnum(obj.material, EARRING_MATERIALS_V2, 'silver', `${field}.material`, errors),
    gem: validateEnum(obj.gem, EARRING_GEMS_V2, 'diamond', `${field}.gem`, errors),
  };
}

export function validateAppearanceV2(input: unknown): AppearanceValidationResult {
  const errors: string[] = [];
  const def = createDefaultAppearanceV2();

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    errors.push('root: expected object -> repaired to default AppearanceV2');
    return { valid: false, errors, repaired: def };
  }

  const raw = input as Record<string, unknown>;
  if (raw.version !== APPEARANCE_SCHEMA_VERSION) {
    errors.push(`version: expected ${APPEARANCE_SCHEMA_VERSION}, got ${JSON.stringify(raw.version)} -> repaired to ${APPEARANCE_SCHEMA_VERSION}`);
  }

  const rawTattoos = raw.tattoos && typeof raw.tattoos === 'object' && !Array.isArray(raw.tattoos)
    ? (raw.tattoos as Record<string, unknown>)
    : null;
  const rawGlasses = raw.regularGlasses && typeof raw.regularGlasses === 'object' && !Array.isArray(raw.regularGlasses)
    ? (raw.regularGlasses as Record<string, unknown>)
    : null;
  if (!rawTattoos) {
    errors.push('tattoos: missing/invalid object -> repaired to defaults');
  }

  const rawEarrings = raw.earrings && typeof raw.earrings === 'object' && !Array.isArray(raw.earrings)
    ? (raw.earrings as Record<string, unknown>)
    : null;
  if (!rawEarrings) {
    errors.push('earrings: missing/invalid object -> repaired to defaults');
  }

  const rawPhysique = raw.physique && typeof raw.physique === 'object' && !Array.isArray(raw.physique)
    ? (raw.physique as Record<string, unknown>)
    : null;
  if (!rawPhysique) {
    errors.push('physique: missing/invalid object -> repaired to defaults');
  }

  const rawUniform = raw.uniform && typeof raw.uniform === 'object' && !Array.isArray(raw.uniform)
    ? (raw.uniform as Record<string, unknown>)
    : null;
  if (!rawUniform) {
    errors.push('uniform: missing/invalid object -> repaired to defaults');
  }

  const rawInterior = rawUniform?.interiorShirt && typeof rawUniform.interiorShirt === 'object' && !Array.isArray(rawUniform.interiorShirt)
    ? (rawUniform.interiorShirt as Record<string, unknown>)
    : null;
  if (!rawInterior) {
    errors.push('uniform.interiorShirt: missing/invalid object -> repaired to defaults');
  }

  let interiorEnabled = def.uniform.interiorShirt.enabled;
  if (rawInterior) {
    if (typeof rawInterior.enabled === 'boolean') {
      interiorEnabled = rawInterior.enabled;
    } else {
      errors.push(`uniform.interiorShirt.enabled: invalid boolean ${JSON.stringify(rawInterior.enabled)} -> repaired to false`);
    }
  }

  let shoeColor = def.uniform.shoeColor;
  if (rawUniform) {
    const normalizedShoe = normalizeHexColor(rawUniform.shoeColor);
    if (!normalizedShoe) {
      errors.push(`uniform.shoeColor: invalid color ${JSON.stringify(rawUniform.shoeColor)} -> repaired to "${def.uniform.shoeColor}"`);
    } else {
      if (normalizedShoe !== rawUniform.shoeColor) {
        errors.push(`uniform.shoeColor: normalized "${String(rawUniform.shoeColor)}" -> "${normalizedShoe}"`);
      }
      shoeColor = normalizedShoe;
    }
  }

  const repaired: AppearanceV2 = {
    version: APPEARANCE_SCHEMA_VERSION,
    hairLength: validateEnum(raw.hairLength, HAIR_LENGTHS_V2, def.hairLength, 'hairLength', errors, HAIR_LENGTH_ALIASES),
    hairTexture: validateEnum(raw.hairTexture, HAIR_TEXTURES_V2, def.hairTexture, 'hairTexture', errors),
    hairColor: validateEnum(raw.hairColor, HAIR_COLORS_V2, def.hairColor, 'hairColor', errors),
    hairDye: validateEnum(raw.hairDye, HAIR_DYES_V2, def.hairDye, 'hairDye', errors, HAIR_DYE_ALIASES),
    skinTone: validateEnum(raw.skinTone, SKIN_TONES_V2, def.skinTone, 'skinTone', errors),
    facialHair: validateEnum(raw.facialHair, FACIAL_HAIRS_V2, def.facialHair, 'facialHair', errors, FACIAL_HAIR_ALIASES),
    headwear: validateEnum(raw.headwear, HEADWEAR_V2, def.headwear, 'headwear', errors),
    regularGlasses: {
      design: validateEnum(rawGlasses?.design, REGULAR_GLASSES_DESIGNS_V2, def.regularGlasses.design, 'regularGlasses.design', errors),
      frameColor: normalizeHexColor(rawGlasses?.frameColor) || def.regularGlasses.frameColor,
      shade: validateEnum(rawGlasses?.shade, GLASSES_SHADES_V2, def.regularGlasses.shade, 'regularGlasses.shade', errors),
    },
    necklace: validateEnum(raw.necklace, NECKLACES_V2, def.necklace, 'necklace', errors),
    tattoos: {
      neck: validateEnum(rawTattoos?.neck, NECK_TATTOOS_V2, def.tattoos.neck, 'tattoos.neck', errors),
      leftArm: validateEnum(rawTattoos?.leftArm, ARM_TATTOOS_V2, def.tattoos.leftArm, 'tattoos.leftArm', errors),
      rightArm: validateEnum(rawTattoos?.rightArm, ARM_TATTOOS_V2, def.tattoos.rightArm, 'tattoos.rightArm', errors),
      face: validateEnum(rawTattoos?.face, FACE_TATTOOS_V2, def.tattoos.face, 'tattoos.face', errors),
    },
    earrings: {
      left: validateEarringSlot(rawEarrings?.left, 'earrings.left', errors),
      right: validateEarringSlot(rawEarrings?.right, 'earrings.right', errors),
    },
    physique: {
      heightCm: validateClampedInt(
        rawPhysique?.heightCm,
        PHYSIQUE_LIMITS_V2.heightCm.min,
        PHYSIQUE_LIMITS_V2.heightCm.max,
        def.physique.heightCm,
        'physique.heightCm',
        errors
      ),
      weightKg: validateClampedInt(
        rawPhysique?.weightKg,
        PHYSIQUE_LIMITS_V2.weightKg.min,
        PHYSIQUE_LIMITS_V2.weightKg.max,
        def.physique.weightKg,
        'physique.weightKg',
        errors
      ),
      strength: validateClampedInt(
        rawPhysique?.strength,
        PHYSIQUE_LIMITS_V2.strength.min,
        PHYSIQUE_LIMITS_V2.strength.max,
        def.physique.strength,
        'physique.strength',
        errors
      ),
      neckWidth: validateEnum(rawPhysique?.neckWidth, NECK_WIDTHS_V2, def.physique.neckWidth, 'physique.neckWidth', errors),
      neckLength: validateEnum(rawPhysique?.neckLength, NECK_LENGTHS_V2, def.physique.neckLength, 'physique.neckLength', errors),
      chest: validateEnum(rawPhysique?.chest, CHEST_SIZES_V2, def.physique.chest, 'physique.chest', errors),
      waist: validateEnum(rawPhysique?.waist, WAIST_SIZES_V2, def.physique.waist, 'physique.waist', errors),
      thighs: validateEnum(rawPhysique?.thighs, THIGH_SIZES_V2, def.physique.thighs, 'physique.thighs', errors),
      calves: validateEnum(rawPhysique?.calves, CALF_SIZES_V2, def.physique.calves, 'physique.calves', errors),
      legsLength: validateEnum(rawPhysique?.legsLength, LIMB_LENGTHS_V2, def.physique.legsLength, 'physique.legsLength', errors),
      armsLength: validateEnum(rawPhysique?.armsLength, LIMB_LENGTHS_V2, def.physique.armsLength, 'physique.armsLength', errors),
    },
    uniform: {
      shirtCut: validateEnum(rawUniform?.shirtCut, SHIRT_CUTS_V2, def.uniform.shirtCut, 'uniform.shirtCut', errors, SHIRT_CUT_ALIASES),
      tucked: validateEnum(rawUniform?.tucked, JERSEY_TUCKS_V2, def.uniform.tucked, 'uniform.tucked', errors),
      socks: validateEnum(rawUniform?.socks, SOCK_LENGTHS_V2, def.uniform.socks, 'uniform.socks', errors, SOCK_LENGTH_ALIASES),
      sleeves: validateEnum(rawUniform?.sleeves, SLEEVE_LENGTHS_V2, def.uniform.sleeves, 'uniform.sleeves', errors),
      interiorShirt: {
        enabled: interiorEnabled,
        sleeve: validateEnum(
          rawInterior?.sleeve,
          INTERIOR_SHIRT_SLEEVES_V2,
          def.uniform.interiorShirt.sleeve,
          'uniform.interiorShirt.sleeve',
          errors
        ),
        neck: validateEnum(
          rawInterior?.neck,
          INTERIOR_SHIRT_NECKS_V2,
          def.uniform.interiorShirt.neck,
          'uniform.interiorShirt.neck',
          errors
        ),
      },
      shoeColor,
    },
  };

  return {
    valid: errors.length === 0,
    errors,
    repaired,
  };
}

export function repairAppearanceV2(input: unknown): AppearanceV2 {
  return validateAppearanceV2(input).repaired;
}

// ============================================================================
// Migration: v1 PlayerAppearance -> AppearanceV2 (and v2 -> v1 compat bridge)
// ============================================================================

function hexToRgb(hex: string): [number, number, number] | null {
  const norm = normalizeHexColor(hex);
  if (!norm) return null;
  const n = parseInt(norm.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function nearestPaletteKey<T extends string>(
  hex: unknown,
  palette: Record<T, string>,
  fallback: T
): T {
  const rgb = typeof hex === 'string' ? hexToRgb(hex) : null;
  if (!rgb) return fallback;
  let best: T = fallback;
  let bestDist = Infinity;
  for (const key of Object.keys(palette) as T[]) {
    const pRgb = hexToRgb(palette[key]);
    if (!pRgb) continue;
    const dr = rgb[0] - pRgb[0];
    const dg = rgb[1] - pRgb[1];
    const db = rgb[2] - pRgb[2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bestDist) {
      bestDist = d;
      best = key;
    }
  }
  return best;
}

export function mapV1SkinToneToV2(skinTone: unknown): SkinToneV2 {
  if (typeof skinTone === 'string') {
    const norm = normalizeToken(skinTone);
    if ((SKIN_TONES_V2 as readonly string[]).includes(norm)) {
      return norm as SkinToneV2;
    }
  }
  return nearestPaletteKey(skinTone, SKIN_TONE_HEX_V2, 'fair');
}

export function mapV1HairColorToV2(rawHairColor: unknown): { hairColor: HairColorV2; hairDye: HairDyeV2 } {
  if (typeof rawHairColor === 'string') {
    const norm = normalizeToken(rawHairColor);
    if ((HAIR_COLORS_V2 as readonly string[]).includes(norm)) {
      return { hairColor: norm as HairColorV2, hairDye: 'natural' };
    }
  }
  const rgb = typeof rawHairColor === 'string' ? hexToRgb(rawHairColor) : null;
  if (!rgb) return { hairColor: 'dark_brown', hairDye: 'natural' };

  const [r, g, b] = rgb;
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const spread = maxC - minC;

  // Detect explicit non-natural dye colors (silver/white/platinum, neon blue/green/pink, vivid red)
  if (minC >= 185 && spread <= 35) {
    return {
      hairColor: 'dark_brown',
      hairDye: minC >= 228 ? 'platinum' : 'silver_white',
    };
  }
  if (b > r + 45 && b >= g + 20) {
    return { hairColor: 'black', hairDye: 'blue' };
  }
  if (g > r + 35 && g > b + 20) {
    return { hairColor: 'black', hairDye: 'green' };
  }
  if (r > 185 && b > 105 && g < 130) {
    return { hairColor: 'dark_brown', hairDye: 'pink' };
  }
  if (r > 205 && g < 55 && b < 55) {
    return { hairColor: 'dark_brown', hairDye: 'red' };
  }

  return {
    hairColor: nearestPaletteKey(rawHairColor, HAIR_COLOR_HEX_V2, 'dark_brown'),
    hairDye: 'natural',
  };
}

export function mapV1HairStyleToV2(hairStyle: unknown): { hairLength: HairLengthV2; hairTexture: HairTextureV2 } {
  const id = String(hairStyle || 'part').trim().toLowerCase();
  switch (id) {
    case 'bald':
    case 'shaved':
    case 'shaven':
      return { hairLength: 'shaven', hairTexture: 'straight' };
    case 'buzzcut':
    case 'crop_brown':
    case 'spiky_black':
      return { hairLength: 'short', hairTexture: 'straight' };
    case 'high-fade':
    case 'fade':
      return { hairLength: 'fade', hairTexture: 'straight' };
    case 'part':
    case 'blond_sweep':
      return { hairLength: 'short', hairTexture: 'straight' };
    case 'wavy':
      return { hairLength: 'medium', hairTexture: 'wavy' };
    case 'curly':
    case 'curly_blond':
    case 'ginger_curly':
      return { hairLength: 'medium', hairTexture: 'curly' };
    case 'afro':
    case 'afro_black':
      return { hairLength: 'long', hairTexture: 'curly' };
    case 'braids':
      return { hairLength: 'long', hairTexture: 'braids' };
    case 'dreads':
      return { hairLength: 'long', hairTexture: 'dreads' };
    case 'topknot':
    case 'ponytail_dark':
      return { hairLength: 'long', hairTexture: 'straight' };
    default: {
      if (id.includes('dread')) return { hairLength: 'long', hairTexture: 'dreads' };
      if (id.includes('braid')) return { hairLength: 'long', hairTexture: 'braids' };
      if (id.includes('afro') || id.includes('curly')) return { hairLength: 'medium', hairTexture: 'curly' };
      if (id.includes('wavy')) return { hairLength: 'medium', hairTexture: 'wavy' };
      if (id.includes('fade')) return { hairLength: 'fade', hairTexture: 'straight' };
      if (id.includes('long') || id.includes('ponytail') || id.includes('topknot')) {
        return { hairLength: 'long', hairTexture: 'straight' };
      }
      return { hairLength: 'short', hairTexture: 'straight' };
    }
  }
}

export function mapV1FacialHairToV2(facialHair: unknown, hasBeard?: boolean): FacialHairV2 {
  const raw = facialHair ?? (hasBeard ? 'beard' : 'clean');
  const norm = normalizeToken(raw);
  if ((FACIAL_HAIRS_V2 as readonly string[]).includes(norm)) return norm as FacialHairV2;
  if (norm === 'stubble') return 'three_day_stubble';
  if (norm === 'beard') return 'full_beard';
  if (norm === 'clean' || !norm) return 'none';
  return 'none';
}

export function mapV1TattooToV2(tattoo: unknown): ArmTattooV2 {
  const norm = normalizeToken(tattoo);
  if ((ARM_TATTOOS_V2 as readonly string[]).includes(norm)) return norm as ArmTattooV2;
  if (norm === 'forearm_ink') return 'script_name_sleeve';
  if (norm === 'full_sleeve') return 'tribal_sleeve';
  return 'none';
}

export function mapV1EarringsToV2(earrings: unknown): EarringsV2 {
  const norm = normalizeToken(earrings);
  const empty = createDefaultEarringSlotV2();
  switch (norm) {
    case 'left_stud':
      return { left: { style: 'studs', material: 'silver', gem: 'diamond' }, right: { ...empty } };
    case 'right_stud':
      return { left: { ...empty }, right: { style: 'studs', material: 'silver', gem: 'diamond' } };
    case 'dual_stud':
      return {
        left: { style: 'studs', material: 'silver', gem: 'diamond' },
        right: { style: 'studs', material: 'silver', gem: 'diamond' },
      };
    case 'small_hoop':
      return { left: { style: 'small_barbell', material: 'gold', gem: 'diamond' }, right: { ...empty } };
    default:
      return { left: { ...empty }, right: { ...empty } };
  }
}

export function migrateAppearanceV1ToV2(
  v1: Partial<PlayerAppearance> | AppearanceV2 | null | undefined,
  context?: { strength?: number }
): AppearanceV2 {
  if (isAppearanceV2(v1)) {
    const repaired = repairAppearanceV2(v1);
    if (typeof context?.strength === 'number' && Number.isFinite(context.strength)) {
      repaired.physique.strength = validateClampedInt(
        context.strength,
        PHYSIQUE_LIMITS_V2.strength.min,
        PHYSIQUE_LIMITS_V2.strength.max,
        repaired.physique.strength,
        'context.strength',
        []
      );
    }
    return repaired;
  }

  const src = (v1 && typeof v1 === 'object' ? v1 : {}) as Partial<PlayerAppearance> & Record<string, any>;
  const { hairLength, hairTexture } = mapV1HairStyleToV2(src.hairStyle);
  const { hairColor, hairDye } = mapV1HairColorToV2(src.hairColor);
  const skinTone = mapV1SkinToneToV2(src.skinTone);
  const facialHair = mapV1FacialHairToV2(src.facialHair, src.hasBeard);
  const earrings = mapV1EarringsToV2(src.earrings);

  const heightCm =
    typeof src.heightCm === 'number' && Number.isFinite(src.heightCm) ? src.heightCm : 180;
  const weightKg =
    typeof src.weightKg === 'number' && Number.isFinite(src.weightKg) ? src.weightKg : 75;
  const strength =
    typeof context?.strength === 'number' && Number.isFinite(context.strength)
      ? context.strength
      : strengthFromMuscleMass(typeof src.muscleMass === 'number' ? src.muscleMass : 3);

  const v1ForBuild: PlayerAppearance = {
    heightCm,
    weightKg,
    muscleMass: muscleFromStrength(strength),
    skinTone: SKIN_TONE_HEX_V2[skinTone],
    hairStyle: src.hairStyle || 'part',
    hairColor: HAIR_COLOR_HEX_V2[hairColor],
  };
  const dTiers = defaultTiers(getWeightClass(v1ForBuild), muscleLevelOf(v1ForBuild));

  const calves = tierToLabel(CALF_SIZE_TIERS, src.calfTier, dTiers[0]);
  const thighs = tierToLabel(THIGH_SIZE_TIERS, src.thighTier ?? src.calfTier, dTiers[0]);
  const waist = tierToLabel(WAIST_SIZE_TIERS, src.waistTier, dTiers[1]);
  const chest = tierToLabel(CHEST_SIZE_TIERS, src.chestTier, dTiers[2]);
  const neckWidth = tierToLabel(NECK_WIDTH_TIERS, src.neckTier, dTiers[4]);

  const sleeveNorm = normalizeToken(src.sleeveLength);
  const sleeves: SleeveLengthV2 = sleeveNorm === 'long' ? 'long' : 'normal';
  const interiorShirt: InteriorShirtV2 =
    sleeveNorm === 'undershirt'
      ? { enabled: true, sleeve: 'long', neck: 'short' }
      : { enabled: false, sleeve: 'short', neck: 'short' };

  const sockNorm = normalizeToken(src.sockHeight);
  const socks: SockLengthV2 =
    sockNorm === 'low' ? 'short' : sockNorm === 'high_knee' ? 'long' : 'normal';

  const tucked: JerseyTuckV2 = normalizeToken(src.jerseyFit) === 'untucked' ? 'untucked' : 'tucked';
  const shoeColor = normalizeHexColor(src.shoeColor) ?? '#111111';

  return repairAppearanceV2({
    version: APPEARANCE_SCHEMA_VERSION,
    hairLength,
    hairTexture,
    hairColor,
    hairDye,
    skinTone,
    facialHair,
    headwear: 'none',
    necklace: 'none',
    tattoos: {
      neck: 'none',
      leftArm: mapV1TattooToV2(src.tattoos?.leftArm),
      rightArm: mapV1TattooToV2(src.tattoos?.rightArm),
      face: 'none',
    },
    earrings,
    physique: {
      heightCm,
      weightKg,
      strength,
      neckWidth,
      neckLength: 'normal',
      chest,
      waist,
      thighs,
      calves,
      legsLength: 'normal',
      armsLength: 'normal',
    },
    uniform: {
      shirtCut: 'normal',
      tucked,
      socks,
      sleeves,
      interiorShirt,
      shoeColor,
    },
  });
}

/**
 * Downgrade bridge: converts AppearanceV2 to legacy v1 PlayerAppearance so existing v1
 * renderers (CaptainPreviewAvatar, legacy canvas sprites) continue working until C7/C8.
 */
export function migrateAppearanceV2ToV1(input: AppearanceV2): PlayerAppearance {
  const v2 = repairAppearanceV2(input);
  let hairStyle: PlayerAppearance['hairStyle'] = 'part';
  if (v2.hairLength === 'shaven') {
    hairStyle = 'bald';
  } else if (v2.hairLength === 'fade') {
    hairStyle = 'high-fade';
  } else if (v2.hairTexture === 'braids') {
    hairStyle = 'braids';
  } else if (v2.hairTexture === 'dreads') {
    hairStyle = 'dreads';
  } else if (v2.hairTexture === 'curly') {
    hairStyle = v2.hairLength === 'long' ? 'afro' : 'curly';
  } else if (v2.hairTexture === 'wavy') {
    hairStyle = 'wavy';
  } else if (v2.hairLength === 'long') {
    hairStyle = 'topknot';
  }

  let facialHair: PlayerAppearance['facialHair'] = 'clean';
  if (v2.facialHair === 'three_day_stubble') facialHair = 'stubble';
  else if (v2.facialHair === 'goatee') facialHair = 'goatee';
  else if (v2.facialHair !== 'none') facialHair = 'beard';

  const leftOn = v2.earrings.left.style !== 'none';
  const rightOn = v2.earrings.right.style !== 'none';
  const earrings: PlayerAppearance['earrings'] =
    leftOn && rightOn
      ? 'dual-stud'
      : leftOn
        ? v2.earrings.left.style === 'small_barbell' || v2.earrings.left.style === 'large_barbell'
          ? 'small-hoop'
          : 'left-stud'
        : rightOn
          ? 'right-stud'
          : 'none';

  const mapArm = (arm: ArmTattooV2): 'none' | 'forearm-ink' | 'full-sleeve' => {
    if (arm === 'none') return 'none';
    if (arm === 'double_stripe_band') return 'forearm-ink';
    return 'full-sleeve';
  };

  return {
    heightCm: v2.physique.heightCm,
    weightKg: v2.physique.weightKg,
    muscleMass: muscleFromStrength(v2.physique.strength),
    chestTier: CHEST_SIZE_TIERS.indexOf(v2.physique.chest) as 0 | 1 | 2 | 3,
    waistTier: WAIST_SIZE_TIERS.indexOf(v2.physique.waist) as 0 | 1 | 2 | 3,
    thighTier: THIGH_SIZE_TIERS.indexOf(v2.physique.thighs) as 0 | 1 | 2 | 3,
    calfTier: CALF_SIZE_TIERS.indexOf(v2.physique.calves) as 0 | 1 | 2 | 3,
    neckTier: NECK_WIDTH_TIERS.indexOf(v2.physique.neckWidth) as 0 | 1 | 2 | 3,
    skinTone: SKIN_TONE_HEX_V2[v2.skinTone],
    hairStyle,
    hairColor: getEffectiveHairHexV2(v2),
    facialHair,
    jerseyFit: v2.uniform.tucked,
    collarStyle: 'crew',
    sleeveLength:
      v2.uniform.sleeves === 'long'
        ? 'long'
        : v2.uniform.interiorShirt.enabled && v2.uniform.interiorShirt.sleeve === 'long'
          ? 'undershirt'
          : 'short',
    sockHeight:
      v2.uniform.socks === 'short' ? 'low' : v2.uniform.socks === 'long' ? 'high-knee' : 'standard',
    earrings,
    tattoos: {
      leftArm: mapArm(v2.tattoos.leftArm),
      rightArm: mapArm(v2.tattoos.rightArm),
    },
    hasBeard: facialHair === 'beard',
  };
}

export function getSkinToneHexV2(skinTone: SkinToneV2): string {
  return SKIN_TONE_HEX_V2[skinTone] ?? SKIN_TONE_HEX_V2.fair;
}

export function getEffectiveHairHexV2(app: Pick<AppearanceV2, 'hairColor' | 'hairDye'>): string {
  if (app.hairDye && app.hairDye !== 'natural') {
    return HAIR_DYE_HEX_V2[app.hairDye] ?? HAIR_COLOR_HEX_V2[app.hairColor] ?? HAIR_COLOR_HEX_V2.dark_brown;
  }
  return HAIR_COLOR_HEX_V2[app.hairColor] ?? HAIR_COLOR_HEX_V2.dark_brown;
}

// ============================================================================
// Stable Serialization & Sprite Cache Key
// ============================================================================

const SERIAL_SEP = '|';

/**
 * Lossless, deterministic serialization of AppearanceV2.
 * Round-trips 100% through deserializeAppearanceV2(serializeAppearanceV2(app)).
 */
export function serializeAppearanceV2(input: AppearanceV2 | Partial<PlayerAppearance>): string {
  const a = isAppearanceV2(input) ? repairAppearanceV2(input) : migrateAppearanceV1ToV2(input);
  return [
    'v2',
    a.hairLength,
    a.hairTexture,
    a.hairColor,
    a.hairDye,
    a.skinTone,
    a.facialHair,
    a.headwear,
    a.necklace,
    a.tattoos.neck,
    a.tattoos.leftArm,
    a.tattoos.rightArm,
    a.tattoos.face,
    a.earrings.left.style,
    a.earrings.left.material,
    a.earrings.left.gem,
    a.earrings.right.style,
    a.earrings.right.material,
    a.earrings.right.gem,
    a.physique.heightCm,
    a.physique.weightKg,
    a.physique.strength,
    a.physique.neckWidth,
    a.physique.neckLength,
    a.physique.chest,
    a.physique.waist,
    a.physique.thighs,
    a.physique.calves,
    a.physique.legsLength,
    a.physique.armsLength,
    a.uniform.shirtCut,
    a.uniform.tucked,
    a.uniform.socks,
    a.uniform.sleeves,
    a.uniform.interiorShirt.enabled ? '1' : '0',
    a.uniform.interiorShirt.sleeve,
    a.uniform.interiorShirt.neck,
    a.uniform.shoeColor.slice(1),
  ].join(SERIAL_SEP);
}

/**
 * Canonical visual-equivalence key for the sprite cache (C6/C9).
 * Collapses visually irrelevant hidden fields (e.g. hairTexture when shaven,
 * earring material/gem when style is 'none', interiorShirt sleeve/neck when disabled)
 * and buckets strength into its 3 muscularity tiers (low/med/high).
 */
export function appearanceCacheKeyV2(input: AppearanceV2 | Partial<PlayerAppearance>): string {
  const a = isAppearanceV2(input) ? repairAppearanceV2(input) : migrateAppearanceV1ToV2(input);
  const strengthTier = a.physique.strength >= 90 ? 'H' : a.physique.strength >= 71 ? 'M' : 'L';
  const tex = a.hairLength === 'shaven' ? '-' : a.hairTexture;
  const hasBeard = a.facialHair !== 'none';
  const hairCol =
    a.hairLength === 'shaven'
      ? hasBeard ? `b:${a.hairColor}` : '-'
      : a.hairDye !== 'natural'
        ? `d:${a.hairDye}${hasBeard ? `:${a.hairColor}` : ''}`
        : a.hairColor;
  const earKey = (e: EarringSlotV2) =>
    e.style === 'none' ? 'none' : e.style === 'gem' ? `${e.style}:${e.material}:${e.gem}` : `${e.style}:${e.material}`;
  const intKey = a.uniform.interiorShirt.enabled
    ? `1:${a.uniform.interiorShirt.sleeve}:${a.uniform.interiorShirt.neck}`
    : '0';

  return [
    'v2k',
    a.hairLength,
    tex,
    hairCol,
    a.skinTone,
    a.facialHair,
    a.headwear,
    a.necklace,
    a.tattoos.neck,
    a.tattoos.leftArm,
    a.tattoos.rightArm,
    a.tattoos.face,
    earKey(a.earrings.left),
    earKey(a.earrings.right),
    a.physique.heightCm,
    a.physique.weightKg,
    strengthTier,
    a.physique.neckWidth,
    a.physique.neckLength,
    a.physique.chest,
    a.physique.waist,
    a.physique.thighs,
    a.physique.calves,
    a.physique.legsLength,
    a.physique.armsLength,
    a.uniform.shirtCut,
    a.uniform.tucked,
    a.uniform.socks,
    a.uniform.sleeves,
    intKey,
    a.uniform.shoeColor.slice(1),
  ].join(SERIAL_SEP);
}

/**
 * Deserializes a serialized AppearanceV2 string (or legacy v1 '~' string).
 * Corrupt, truncated, or invalid fields are repaired to valid defaults instead of throwing.
 */
export function deserializeAppearanceV2(serialized: string): AppearanceV2 {
  if (typeof serialized !== 'string' || !serialized.trim()) {
    return createDefaultAppearanceV2();
  }

  // Legacy v1 '~' format detection & automatic migration
  if (!serialized.startsWith('v2|') && serialized.includes('~')) {
    const p = serialized.split('~');
    if (p.length >= 14) {
      const legacy: Partial<PlayerAppearance> = {
        heightCm: Number(p[0]),
        weightKg: Number(p[1]),
        muscleMass: Number(p[2]),
        skinTone: `#${p[3]}`,
        hairStyle: p[4],
        hairColor: `#${p[5]}`,
        facialHair: p[6] as any,
        jerseyFit: p[7] as any,
        collarStyle: p[8] as any,
        sleeveLength: p[9] as any,
        sockHeight: p[10] as any,
        earrings: p[11] as any,
        tattoos: {
          leftArm: p[12] as any,
          rightArm: p[13] as any,
        },
      };
      if (p.length >= 19) {
        const parseTier = (s: string) => {
          const n = Number(s);
          return s !== '-' && Number.isFinite(n) ? (Math.max(0, Math.min(3, Math.round(n))) as 0 | 1 | 2 | 3) : undefined;
        };
        legacy.calfTier = parseTier(p[14]);
        legacy.waistTier = parseTier(p[15]);
        legacy.chestTier = parseTier(p[16]);
        legacy.armTier = parseTier(p[17]);
        legacy.neckTier = parseTier(p[18]);
      }
      return migrateAppearanceV1ToV2(legacy);
    }
  }

  const parts = serialized.split(SERIAL_SEP);
  if (parts[0] !== 'v2') {
    return createDefaultAppearanceV2();
  }

  const num = (idx: number): number => {
    const v = parts[idx];
    if (v === undefined || v === '') return NaN;
    return Number(v);
  };

  return repairAppearanceV2({
    version: APPEARANCE_SCHEMA_VERSION,
    hairLength: parts[1],
    hairTexture: parts[2],
    hairColor: parts[3],
    hairDye: parts[4],
    skinTone: parts[5],
    facialHair: parts[6],
    headwear: parts[7],
    necklace: parts[8],
    tattoos: {
      neck: parts[9],
      leftArm: parts[10],
      rightArm: parts[11],
      face: parts[12],
    },
    earrings: {
      left: { style: parts[13], material: parts[14], gem: parts[15] },
      right: { style: parts[16], material: parts[17], gem: parts[18] },
    },
    physique: {
      heightCm: num(19),
      weightKg: num(20),
      strength: num(21),
      neckWidth: parts[22],
      neckLength: parts[23],
      chest: parts[24],
      waist: parts[25],
      thighs: parts[26],
      calves: parts[27],
      legsLength: parts[28],
      armsLength: parts[29],
    },
    uniform: {
      shirtCut: parts[30],
      tucked: parts[31],
      socks: parts[32],
      sleeves: parts[33],
      interiorShirt: {
        enabled: parts[34] === '1' ? true : parts[34] === '0' ? false : undefined,
        sleeve: parts[35],
        neck: parts[36],
      },
      shoeColor: parts[37] ? `#${parts[37]}` : undefined,
    },
  });
}
