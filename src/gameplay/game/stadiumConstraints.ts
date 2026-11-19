/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FootballMatchMode, TimeOfDay, TurfQuality } from '../types';
import {
  ArchitecturalGrade,
  BenchType,
  CornerStandType,
  StadiumCategory,
  StadiumDefinition,
  StadiumShape,
  StandConfig,
  StandGrade,
  StandPosition,
  StandType,
  StreetArenaConfig,
  StreetSurfaceType,
  TunnelType,
  WallTierSize,
  calculateStadiumTotalCapacity,
  getAvailableStandTypesForShape,
  getDefaultRoofConfig,
} from '../types/stadium';

export const ALL_STADIUM_SHAPES: StadiumShape[] = ['rectangular', 'square', 'round', 'oval'];

export const ALL_ARCHITECTURAL_GRADES: ArchitecturalGrade[] = [
  'municipal',
  'brutalist',
  'industrial',
  'victorian',
  'modern',
];

export const ALL_TUNNEL_TYPES: TunnelType[] = [
  'inflatable_accordion',
  'modern_architectural',
  'subterranean_staircase',
  'direct_portal',
  'telescopic_canopy',
];

export const YOUTH_TUNNEL_TYPES: TunnelType[] = [
  'inflatable_accordion',
  'subterranean_staircase',
];

export const ALL_DUGOUT_TYPES: BenchType[] = [
  'recaro_racing',
  'covered_sunken',
  'classic_timber',
  'utilitarian_concrete',
  'folding_chairs',
];

export const YOUTH_DUGOUT_TYPES: BenchType[] = [
  'folding_chairs',
  'utilitarian_concrete',
  'classic_timber',
];

export const STREET_SURFACES: StreetSurfaceType[] = [
  'concrete',
  'sand',
  'synthetic',
  'poor',
];

export const DEFAULT_STREET_ARENA_CONFIG: StreetArenaConfig = {
  archetype: 'tarmac_cage',
  surface: 'concrete',
  perimeterWallStyle: 'chainlink_cage',
  courtMarkings: 'spray_paint',
  goalStyle: 'futsal_tubular',
  streetLighting: 'sodium_streetlamps',
  fenceCrowdMode: 'sparse_locals',
  urbanProps: ['graffiti_murals', 'milk_crates'],
};

const ALL_STAND_POSITIONS: StandPosition[] = [
  'east',
  'west',
  'north',
  'south',
  'corner_ne',
  'corner_nw',
  'corner_se',
  'corner_sw',
];

function isCornerPosition(pos: StandPosition): boolean {
  return (
    pos === 'corner_ne' ||
    pos === 'corner_nw' ||
    pos === 'corner_se' ||
    pos === 'corner_sw'
  );
}

function normalizeCountryCode(country?: string): string {
  return (country || '').trim().toLowerCase();
}

function isEnglishYouthOrigin(country?: string): boolean {
  const c = normalizeCountryCode(country);
  return (
    c === 'eng' ||
    c === 'england' ||
    c === 'uk' ||
    c === 'gb' ||
    c === 'united kingdom' ||
    c === 'great britain'
  );
}

function isSpanishYouthOrigin(country?: string): boolean {
  const c = normalizeCountryCode(country);
  return c === 'esp' || c === 'spain' || c === 'españa' || c === 'espana';
}

function mapArchitecturalGradeToLegacyStandGrade(grade: ArchitecturalGrade): StandGrade {
  switch (grade) {
    case 'municipal':
      return 'grade1_municipal';
    case 'brutalist':
      return 'grade2_classic';
    case 'industrial':
      return 'grade3_industrial';
    case 'victorian':
      return 'grade2_classic';
    case 'modern':
      return 'grade4_modern';
    default:
      return 'grade1_municipal';
  }
}

export function getAllowedShapesForCategory(cat: StadiumCategory = 'pro'): StadiumShape[] {
  if (cat === 'youth' || cat === 'street') {
    return ['rectangular'];
  }
  return [...ALL_STADIUM_SHAPES];
}

export function getAllowedGradesForCategory(
  cat: StadiumCategory = 'pro',
  def?: Pick<StadiumDefinition, 'country' | 'youthSpecialUnlocked'>
): ArchitecturalGrade[] {
  if (cat === 'street') {
    return [];
  }
  if (cat === 'pro') {
    return [...ALL_ARCHITECTURAL_GRADES];
  }

  // Youth default cap: Brutalist Concrete ('municipal' | 'brutalist')
  if (def?.youthSpecialUnlocked) {
    return [...ALL_ARCHITECTURAL_GRADES];
  }

  const allowed: ArchitecturalGrade[] = ['municipal', 'brutalist'];
  if (isSpanishYouthOrigin(def?.country)) {
    allowed.push('industrial');
  } else if (isEnglishYouthOrigin(def?.country)) {
    allowed.push('industrial', 'victorian');
  }
  return allowed;
}

export function getAllowedStandTypesForCategory(
  cat: StadiumCategory = 'pro',
  pos: StandPosition,
  shape?: StadiumShape
): StandType[] {
  if (cat === 'street') {
    return ['none'];
  }
  const isCorner = isCornerPosition(pos);
  if (cat === 'youth') {
    return isCorner ? ['round', 'square', 'none'] : ['tiered', 'wall', 'none'];
  }
  if (isCorner) {
    return ['round', 'square', 'tower', 'none'];
  }
  return getAvailableStandTypesForShape(shape).map((option) => option.id);
}

export function getMaxTiersForCategory(
  cat: StadiumCategory = 'pro',
  pos?: StandPosition,
  standType?: StandType | CornerStandType
): 0 | 1 | 2 | 4 {
  if (cat === 'street') return 0;
  if (cat === 'youth') {
    if (pos && isCornerPosition(pos)) {
      return standType === 'none' || standType === 'no_stand' ? 0 : 1;
    }
    return 2;
  }
  return 4;
}

export function getAllowedWallSizesForCategory(cat: StadiumCategory = 'pro'): WallTierSize[] {
  if (cat === 'street') return [];
  if (cat === 'youth') return ['small'];
  return ['small', 'medium', 'large'];
}

export function getAllowedTunnelsForCategory(cat: StadiumCategory = 'pro'): TunnelType[] {
  if (cat === 'street') return [];
  if (cat === 'youth') return [...YOUTH_TUNNEL_TYPES];
  return [...ALL_TUNNEL_TYPES];
}

export function getAllowedDugoutsForCategory(cat: StadiumCategory = 'pro'): BenchType[] {
  if (cat === 'street') return [];
  if (cat === 'youth') return [...YOUTH_DUGOUT_TYPES];
  return [...ALL_DUGOUT_TYPES];
}

export function getAllowedTurfQualitiesForCategory(
  cat: StadiumCategory = 'pro',
  def?: Pick<StadiumDefinition, 'youthSpecialUnlocked'>
): TurfQuality[] {
  if (cat === 'street') {
    return [...STREET_SURFACES];
  }
  if (cat === 'youth') {
    return def?.youthSpecialUnlocked
      ? ['pristine', 'normal', 'poor', 'synthetic']
      : ['normal', 'poor', 'synthetic'];
  }
  return ['pristine', 'normal', 'poor'];
}

export function getAllowedTimesOfDay(
  stadium?: Pick<StadiumDefinition, 'category' | 'lighting' | 'streetConfig'>
): TimeOfDay[] {
  const hasNoStadiumLighting = stadium?.lighting?.type === 'none';
  const isStreetDaylightOnly =
    stadium?.category === 'street' && stadium?.streetConfig?.streetLighting === 'daylight_only';

  if (hasNoStadiumLighting || isStreetDaylightOnly) {
    return ['dawn', 'noon'];
  }
  return ['dawn', 'noon', 'sunset', 'night'];
}

export function resolveMatchModeFromStadiumCategory(
  cat: StadiumCategory = 'pro'
): FootballMatchMode {
  return cat;
}

function clampYouthGrade(
  grade: ArchitecturalGrade | undefined,
  allowedGrades: ArchitecturalGrade[]
): ArchitecturalGrade {
  if (grade && allowedGrades.includes(grade)) {
    return grade;
  }
  return allowedGrades.includes('brutalist') ? 'brutalist' : allowedGrades[0] || 'municipal';
}

function sanitizeYouthStand(
  pos: StandPosition,
  stand: StandConfig | undefined,
  allowedGrades: ArchitecturalGrade[],
  fallbackGrade: ArchitecturalGrade,
  specialUnlocked: boolean
): StandConfig {
  const base: StandConfig = {
    position: pos,
    type: isCornerPosition(pos) ? 'none' : 'tiered',
    ...(stand || {}),
  };

  const isCorner = isCornerPosition(pos);
  const effectiveGrade = clampYouthGrade(base.architecturalGrade || fallbackGrade, allowedGrades);
  base.architecturalGrade = effectiveGrade;
  base.grade = mapArchitecturalGradeToLegacyStandGrade(effectiveGrade);

  if (!specialUnlocked) {
    base.hasRoof = false;
    base.hasVipSeats = false;
    base.hasVipZone = false;
    base.hasTransmissionArea = false;
  }

  if (isCorner) {
    const rawCornerType = base.cornerType || base.type;
    let sanitizedCorner: CornerStandType = 'none';
    if (rawCornerType === 'round' || rawCornerType === 'rounded' || rawCornerType === 'tiered') {
      sanitizedCorner = 'round';
    } else if (
      rawCornerType === 'square' ||
      rawCornerType === 'giant' ||
      rawCornerType === 'wall' ||
      rawCornerType === 'stacked_wall'
    ) {
      sanitizedCorner = 'square';
    } else {
      sanitizedCorner = 'none';
    }

    base.type = sanitizedCorner;
    base.cornerType = sanitizedCorner;

    if (sanitizedCorner === 'round') {
      base.tierCount = 1;
      const firstTier = base.tiers?.[0];
      const clampedSize =
        firstTier?.size === 'large' ? 'medium' : firstTier?.size || 'small';
      base.tiers = [{ ...(firstTier || {}), size: clampedSize }];
    } else if (sanitizedCorner === 'square') {
      base.tierCount = 1;
      base.wallSize = 'small';
      base.tiers = [{ ...(base.tiers?.[0] || {}), size: 'small' }];
    } else {
      base.tierCount = 1;
      base.tiers = [];
    }
    return base;
  }

  // Side / end stands: allow only ['tiered', 'wall', 'none']
  let sideType: StandType = base.type;
  if (sideType === 'no_stand') {
    sideType = 'none';
  } else if (sideType === 'stacked_wall') {
    sideType = 'tiered';
  } else if (sideType !== 'tiered' && sideType !== 'wall' && sideType !== 'none') {
    sideType = 'tiered';
  }
  base.type = sideType;

  if (sideType === 'tiered') {
    const rawTiers = Math.max(1, Math.min(2, base.tierCount || base.tiers?.length || 1)) as 1 | 2;
    base.tierCount = rawTiers;
    const nextTiers = (base.tiers && base.tiers.length > 0 ? base.tiers : [{ size: 'small' as const }])
      .slice(0, rawTiers)
      .map((t) => ({
        ...t,
        size: t.size === 'large' ? ('medium' as const) : t.size || ('small' as const),
      }));
    while (nextTiers.length < rawTiers) {
      nextTiers.push({ size: 'small' });
    }
    base.tiers = nextTiers;
  } else if (sideType === 'wall') {
    base.tierCount = 1;
    base.wallSize = 'small';
  } else {
    base.tierCount = 1;
    base.tiers = [];
  }

  return base;
}

function sanitizeStreetStand(pos: StandPosition, existing?: StandConfig): StandConfig {
  return {
    position: pos,
    type: 'none',
    ...(isCornerPosition(pos) ? { cornerType: 'none' as CornerStandType } : {}),
    tierCount: 1,
    tiers: [],
    hasRoof: false,
    roofCoverage: 0,
    hasVipSeats: false,
    hasVipZone: false,
    hasTransmissionArea: false,
    hasGrassrootsFans: existing?.hasGrassrootsFans,
    backdrop: undefined,
    noStandBackdrop: undefined,
  };
}

/**
 * Enforces category-specific architectural, turf, lighting, dugout, tunnel,
 * and pitch dimension locks without mutating the caller's object.
 */
export function sanitizeStadiumForCategory(stadium: StadiumDefinition): StadiumDefinition {
  const category: StadiumCategory = stadium.category || 'pro';
  const copy: StadiumDefinition = {
    ...stadium,
    category,
    stands: { ...stadium.stands },
    lighting: { ...stadium.lighting },
    dugouts: { ...stadium.dugouts },
    tunnel: { ...stadium.tunnel },
    seats: { ...stadium.seats },
  };

  if (category === 'pro') {
    const allowedTimes = getAllowedTimesOfDay(copy);
    if (!allowedTimes.includes(copy.lighting.timeOfDay)) {
      copy.lighting.timeOfDay = allowedTimes[allowedTimes.length - 1] || 'noon';
    }
    if (copy.timeOfDay && !allowedTimes.includes(copy.timeOfDay)) {
      copy.timeOfDay = copy.lighting.timeOfDay;
    }
    return copy;
  }

  if (category === 'street') {
    const surfaceCandidate =
      copy.streetConfig?.surface ||
      copy.streetSurface ||
      (STREET_SURFACES.includes(copy.turfQuality as StreetSurfaceType)
        ? (copy.turfQuality as StreetSurfaceType)
        : 'concrete');

    const streetConfig: StreetArenaConfig = {
      ...DEFAULT_STREET_ARENA_CONFIG,
      ...(copy.streetConfig || {}),
      surface: STREET_SURFACES.includes(surfaceCandidate) ? surfaceCandidate : 'concrete',
      urbanProps: Array.isArray(copy.streetConfig?.urbanProps)
        ? [...copy.streetConfig!.urbanProps]
        : [...DEFAULT_STREET_ARENA_CONFIG.urbanProps],
    };

    for (const pos of ALL_STAND_POSITIONS) {
      copy.stands[pos] = sanitizeStreetStand(pos, copy.stands[pos]);
    }

    copy.shape = 'rectangular';
    copy.hasTrack = false;
    copy.streetConfig = streetConfig;
    copy.streetSurface = streetConfig.surface;
    copy.turfQuality = streetConfig.surface;
    copy.mowingPattern = 'plain';
    copy.roof = {
      ...(copy.roof || getDefaultRoofConfig('rectangular')),
      enabled: false,
      cutawayMode: 'hidden',
      coverage: 0,
    };
    copy.roofCutaway = 'hidden';
    copy.hasTransmissionArea = false;
    copy.hasVipZone = false;
    copy.hasVipSeats = false;
    copy.pitchsideBarrier = undefined;
    copy.capacity = 0;
    copy.fifaCategory = 'national';
    copy.isCasualYouthCrowd = true;
    copy.disableEntryCinematic = true;
    copy.crowdLevel =
      streetConfig.fenceCrowdMode === 'none'
        ? 'empty'
        : streetConfig.fenceCrowdMode === 'block_party_fence'
        ? 'few'
        : 'small';

    if (streetConfig.streetLighting === 'daylight_only') {
      copy.lighting.type = 'none';
      copy.lighting.pylonCount = 0;
      copy.lighting.powerKw = 0;
    }

    const allowedTimes = getAllowedTimesOfDay(copy);
    if (!allowedTimes.includes(copy.lighting.timeOfDay)) {
      copy.lighting.timeOfDay = allowedTimes[allowedTimes.length - 1] || 'noon';
    }
    copy.timeOfDay =
      copy.timeOfDay && allowedTimes.includes(copy.timeOfDay)
        ? copy.timeOfDay
        : copy.lighting.timeOfDay;

    if (copy.pitchLengthMeters !== undefined) {
      copy.pitchLengthMeters = Math.max(42, Math.min(52, Math.round(copy.pitchLengthMeters)));
    }
    if (copy.pitchWidthMeters !== undefined) {
      copy.pitchWidthMeters = Math.max(24, Math.min(32, Math.round(copy.pitchWidthMeters)));
    }

    return copy;
  }

  // category === 'youth'
  const specialUnlocked = Boolean(copy.youthSpecialUnlocked);
  const allowedGrades = getAllowedGradesForCategory('youth', copy);
  const topGrade = clampYouthGrade(copy.architecturalGrade, allowedGrades);

  copy.shape = 'rectangular';
  copy.hasTrack = false;
  copy.architecturalGrade = topGrade;

  for (const pos of ALL_STAND_POSITIONS) {
    copy.stands[pos] = sanitizeYouthStand(
      pos,
      copy.stands[pos],
      allowedGrades,
      topGrade,
      specialUnlocked
    );
  }

  if (!specialUnlocked) {
    copy.roof = {
      ...(copy.roof || getDefaultRoofConfig('rectangular')),
      enabled: false,
      coverage: 0,
    };
    copy.hasTransmissionArea = false;
    copy.hasVipZone = false;
    copy.hasVipSeats = false;
  }

  const allowedTunnels = getAllowedTunnelsForCategory('youth');
  if (!allowedTunnels.includes(copy.tunnel.type)) {
    copy.tunnel.type = 'subterranean_staircase';
  }

  const allowedDugouts = getAllowedDugoutsForCategory('youth');
  if (!allowedDugouts.includes(copy.dugouts.type)) {
    copy.dugouts.type = 'classic_timber';
  }

  const allowedTurf = getAllowedTurfQualitiesForCategory('youth', copy);
  const currentTurf = copy.turfQuality || 'normal';
  if (!allowedTurf.includes(currentTurf)) {
    copy.turfQuality = currentTurf === 'pristine' ? 'synthetic' : 'normal';
  }

  const allowedTimes = getAllowedTimesOfDay(copy);
  if (!allowedTimes.includes(copy.lighting.timeOfDay)) {
    copy.lighting.timeOfDay = allowedTimes[allowedTimes.length - 1] || 'noon';
  }
  if (copy.timeOfDay && !allowedTimes.includes(copy.timeOfDay)) {
    copy.timeOfDay = copy.lighting.timeOfDay;
  }

  if (copy.pitchLengthMeters !== undefined) {
    copy.pitchLengthMeters = Math.max(84, Math.min(94, Math.round(copy.pitchLengthMeters)));
  }
  if (copy.pitchWidthMeters !== undefined) {
    copy.pitchWidthMeters = Math.max(52, Math.min(60, Math.round(copy.pitchWidthMeters)));
  }

  copy.isCasualYouthCrowd = copy.isCasualYouthCrowd ?? true;
  copy.disableEntryCinematic = copy.disableEntryCinematic ?? !specialUnlocked;
  copy.capacity = calculateStadiumTotalCapacity(copy.stands, copy.shape);

  return copy;
}
