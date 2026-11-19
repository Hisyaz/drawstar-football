import { YOUTH_LEAGUES_DATABASE, findYouthTeamAndLeague } from '../../data/youthLeaguesDatabase';
import {
  getIntlYouthCupStadiumEligibleSections,
  getIntlYouthSectionForClubOrCountry,
  InternationalYouthSection,
} from '../../utils/internationalYouthGrouping';
import {
  ArchitecturalGrade,
  StadiumDefinition,
  StandConfig,
  StandPosition,
  calculateFifaQualification,
  calculateStadiumTotalCapacity,
  getDefaultRoofConfig,
} from '../types/stadium';
import { sanitizeStadiumForCategory } from './stadiumConstraints';

const CITY_COLORS: Record<string, [string, string]> = {
  buenos_aires: ['#0284c7', '#f8fafc'],
  sao_paulo: ['#15803d', '#facc15'],
  madrid: ['#dc2626', '#f8fafc'],
  london: ['#991b1b', '#f8fafc'],
  paris: ['#1e3a8a', '#ef4444'],
  roma: ['#7f1d1d', '#f59e0b'],
  berlin: ['#1e293b', '#38bdf8'],
  lisboa: ['#047857', '#f8fafc'],
  riyadh: ['#15803d', '#ffffff'],
};

function mapGradeToLegacy(grade: ArchitecturalGrade): StandConfig['grade'] {
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

function resolveBigYouthGrade(country: string): ArchitecturalGrade {
  const c = country.trim().toLowerCase();
  if (c === 'spain' || c === 'espana' || c === 'españa') return 'industrial';
  if (c === 'england') return 'victorian';
  return 'brutalist';
}

function buildBigYouthLeagueStadium(
  leagueId: string,
  leagueName: string,
  city: string,
  country: string,
  slotNumber: number
): StadiumDefinition {
  const [primaryColor, secondaryColor] = CITY_COLORS[leagueId] || ['#1d4ed8', '#f8fafc'];
  const grade = resolveBigYouthGrade(country);
  const legacyGrade = mapGradeToLegacy(grade);

  const makeSideStand = (pos: StandPosition, tiers: 1 | 2): StandConfig => ({
    position: pos,
    type: 'tiered',
    grade: legacyGrade,
    architecturalGrade: grade,
    tierCount: tiers,
    tiers: Array.from({ length: tiers }, () => ({ size: tiers === 2 ? 'medium' : 'small' })),
    primaryColor,
    secondaryColor,
    hasRoof: false,
    roofCoverage: 0,
  });

  const makeCorner = (pos: StandPosition, useSquare: boolean): StandConfig =>
    useSquare
      ? {
          position: pos,
          type: 'square',
          cornerType: 'square',
          grade: legacyGrade,
          architecturalGrade: grade,
          wallSize: 'small',
          tierCount: 1,
          tiers: [{ size: 'small' }],
          primaryColor,
          secondaryColor,
          hasRoof: false,
          roofCoverage: 0,
        }
      : {
          position: pos,
          type: 'round',
          cornerType: 'round',
          grade: legacyGrade,
          architecturalGrade: grade,
          tierCount: 1,
          tiers: [{ size: 'small' }],
          primaryColor,
          secondaryColor,
          hasRoof: false,
          roofCoverage: 0,
        };

  const stands: Record<StandPosition, StandConfig> = {
    east: makeSideStand('east', 2),
    west: makeSideStand('west', 2),
    north: makeSideStand('north', 1),
    south: makeSideStand('south', 1),
    corner_ne: makeCorner('corner_ne', false),
    corner_nw: makeCorner('corner_nw', false),
    corner_se: makeCorner('corner_se', true),
    corner_sw: makeCorner('corner_sw', true),
  };

  const capacity = calculateStadiumTotalCapacity(stands, 'rectangular');
  return sanitizeStadiumForCategory({
    id: `youth_${leagueId}_big`,
    slotNumber,
    name: `${city} Youth Central Ground`,
    shortName: `${city.slice(0, 8)} Central`,
    city,
    country,
    category: 'youth',
    youthSpecialUnlocked: false,
    architecturalGrade: grade,
    shape: 'rectangular',
    surroundings: 'small_city',
    grounds: 'park_recreation',
    roof: { ...getDefaultRoofConfig('rectangular'), enabled: false, cutawayMode: 'hidden', coverage: 0 },
    roofCutaway: 'hidden',
    hasTrack: false,
    apronMaterial: 'concrete',
    stands,
    seats: {
      style: 'plastic_bench',
      pattern: 'solid',
      colors: [primaryColor, secondaryColor],
    },
    lighting: {
      type: 'none',
      pylonCount: 0,
      powerKw: 0,
      timeOfDay: 'noon',
    },
    dugouts: {
      type: 'utilitarian_concrete',
      quality: 'municipal',
      frameColor: primaryColor,
      cushionColor: secondaryColor,
      shelterTint: 'rgba(15, 23, 42, 0.78)',
      setbackDistance: 8,
    },
    tunnel: {
      type: 'subterranean_staircase',
      siting: 'center_main',
      primaryColor,
      secondaryColor,
    },
    capacity,
    fifaCategory: calculateFifaQualification(capacity, legacyGrade, 0, 'poor'),
    pitchPreset: 'compact',
    pitchLengthMeters: 90,
    pitchWidthMeters: 56,
    turfQuality: 'poor',
    mowingPattern: 'plain',
    grassLength: 'normal',
    surfaceStatus: 'normal',
    goalFrame: 'standard',
    netTension: 'moderate',
    seatColor: 'blue',
    crowdLevel: 'few',
    isCasualYouthCrowd: true,
    disableEntryCinematic: true,
    timeOfDay: 'noon',
  });
}

function buildSmallYouthLeagueStadium(
  leagueId: string,
  leagueName: string,
  city: string,
  country: string,
  slotNumber: number
): StadiumDefinition {
  const [primaryColor, secondaryColor] = CITY_COLORS[leagueId] || ['#2563eb', '#f8fafc'];

  const stands: Record<StandPosition, StandConfig> = {
    east: {
      position: 'east',
      type: 'tiered',
      grade: 'grade1_municipal',
      architecturalGrade: 'municipal',
      tierCount: 1,
      tiers: [{ size: 'small' }],
      primaryColor,
      secondaryColor,
      hasRoof: false,
      roofCoverage: 0,
    },
    west: {
      position: 'west',
      type: 'wall',
      grade: 'grade2_classic',
      architecturalGrade: 'brutalist',
      wallSize: 'small',
      tierCount: 1,
      tiers: [],
      primaryColor,
      secondaryColor,
      hasRoof: false,
      roofCoverage: 0,
    },
    north: {
      position: 'north',
      type: 'none',
      grade: 'grade1_municipal',
      architecturalGrade: 'municipal',
      tierCount: 1,
      tiers: [],
      primaryColor,
      secondaryColor,
      hasRoof: false,
      roofCoverage: 0,
    },
    south: {
      position: 'south',
      type: 'none',
      grade: 'grade1_municipal',
      architecturalGrade: 'municipal',
      tierCount: 1,
      tiers: [],
      primaryColor,
      secondaryColor,
      hasRoof: false,
      roofCoverage: 0,
    },
    corner_ne: { position: 'corner_ne', type: 'none', cornerType: 'none', grade: 'grade1_municipal', architecturalGrade: 'municipal', tierCount: 1, tiers: [], hasRoof: false, roofCoverage: 0 },
    corner_nw: { position: 'corner_nw', type: 'none', cornerType: 'none', grade: 'grade1_municipal', architecturalGrade: 'municipal', tierCount: 1, tiers: [], hasRoof: false, roofCoverage: 0 },
    corner_se: { position: 'corner_se', type: 'none', cornerType: 'none', grade: 'grade1_municipal', architecturalGrade: 'municipal', tierCount: 1, tiers: [], hasRoof: false, roofCoverage: 0 },
    corner_sw: { position: 'corner_sw', type: 'none', cornerType: 'none', grade: 'grade1_municipal', architecturalGrade: 'municipal', tierCount: 1, tiers: [], hasRoof: false, roofCoverage: 0 },
  };

  const capacity = calculateStadiumTotalCapacity(stands, 'rectangular');
  return sanitizeStadiumForCategory({
    id: `youth_${leagueId}_small`,
    slotNumber,
    name: `${city} Municipal Academy Pitch`,
    shortName: `${city.slice(0, 8)} Mun.`,
    city,
    country,
    category: 'youth',
    youthSpecialUnlocked: false,
    architecturalGrade: 'municipal',
    shape: 'rectangular',
    surroundings: 'nature',
    grounds: 'park_recreation',
    roof: { ...getDefaultRoofConfig('rectangular'), enabled: false, cutawayMode: 'hidden', coverage: 0 },
    roofCutaway: 'hidden',
    hasTrack: false,
    apronMaterial: 'concrete',
    stands,
    seats: {
      style: 'plastic_bench',
      pattern: 'solid',
      colors: [primaryColor, secondaryColor],
    },
    lighting: {
      type: 'none',
      pylonCount: 0,
      powerKw: 0,
      timeOfDay: 'noon',
    },
    dugouts: {
      type: 'folding_chairs',
      quality: 'municipal',
      frameColor: primaryColor,
      cushionColor: secondaryColor,
      shelterTint: 'rgba(15, 23, 42, 0.72)',
      setbackDistance: 7,
    },
    tunnel: {
      type: 'inflatable_accordion',
      siting: 'center_main',
      primaryColor,
      secondaryColor,
    },
    capacity,
    fifaCategory: calculateFifaQualification(capacity, 'grade1_municipal', 0, 'synthetic'),
    pitchPreset: 'compact',
    pitchLengthMeters: 88,
    pitchWidthMeters: 54,
    turfQuality: 'synthetic',
    mowingPattern: 'plain',
    grassLength: 'short',
    surfaceStatus: 'normal',
    goalFrame: 'standard',
    netTension: 'soft',
    seatColor: 'blue',
    crowdLevel: 'empty',
    isCasualYouthCrowd: true,
    disableEntryCinematic: true,
    timeOfDay: 'noon',
  });
}

function buildSpecialUnlockedYouthStadium(
  section: InternationalYouthSection,
  slotNumber: number
): StadiumDefinition {
  const leadClub = section.clubs[0];
  const primaryColor = leadClub?.primaryColor || '#0284c7';
  const secondaryColor = leadClub?.secondaryColor || '#f8fafc';
  const primaryCountry = section.countries[0] || section.sectionLabel;

  const stands: Record<StandPosition, StandConfig> = {
    east: {
      position: 'east',
      type: 'tiered',
      grade: 'grade4_modern',
      architecturalGrade: 'modern',
      tierCount: 2,
      tiers: [{ size: 'medium' }, { size: 'medium' }],
      primaryColor,
      secondaryColor,
      hasRoof: true,
      roofCoverage: 0.85,
    },
    west: {
      position: 'west',
      type: 'tiered',
      grade: 'grade4_modern',
      architecturalGrade: 'modern',
      tierCount: 2,
      tiers: [{ size: 'medium' }, { size: 'medium' }],
      primaryColor,
      secondaryColor,
      hasRoof: true,
      roofCoverage: 0.85,
    },
    north: {
      position: 'north',
      type: 'tiered',
      grade: 'grade4_modern',
      architecturalGrade: 'modern',
      tierCount: 2,
      tiers: [{ size: 'small' }, { size: 'small' }],
      primaryColor,
      secondaryColor,
      hasRoof: true,
      roofCoverage: 0.85,
    },
    south: {
      position: 'south',
      type: 'tiered',
      grade: 'grade4_modern',
      architecturalGrade: 'modern',
      tierCount: 2,
      tiers: [{ size: 'small' }, { size: 'small' }],
      primaryColor,
      secondaryColor,
      hasRoof: true,
      roofCoverage: 0.85,
    },
    corner_ne: {
      position: 'corner_ne',
      type: 'round',
      cornerType: 'round',
      grade: 'grade4_modern',
      architecturalGrade: 'modern',
      tierCount: 1,
      tiers: [{ size: 'medium' }],
      primaryColor,
      secondaryColor,
      hasRoof: true,
      roofCoverage: 0.75,
    },
    corner_nw: {
      position: 'corner_nw',
      type: 'round',
      cornerType: 'round',
      grade: 'grade4_modern',
      architecturalGrade: 'modern',
      tierCount: 1,
      tiers: [{ size: 'medium' }],
      primaryColor,
      secondaryColor,
      hasRoof: true,
      roofCoverage: 0.75,
    },
    corner_se: {
      position: 'corner_se',
      type: 'round',
      cornerType: 'round',
      grade: 'grade4_modern',
      architecturalGrade: 'modern',
      tierCount: 1,
      tiers: [{ size: 'medium' }],
      primaryColor,
      secondaryColor,
      hasRoof: true,
      roofCoverage: 0.75,
    },
    corner_sw: {
      position: 'corner_sw',
      type: 'round',
      cornerType: 'round',
      grade: 'grade4_modern',
      architecturalGrade: 'modern',
      tierCount: 1,
      tiers: [{ size: 'medium' }],
      primaryColor,
      secondaryColor,
      hasRoof: true,
      roofCoverage: 0.75,
    },
  };

  const capacity = calculateStadiumTotalCapacity(stands, 'rectangular');
  return sanitizeStadiumForCategory({
    id: `youth_special_${section.sectionId}`,
    slotNumber,
    name: `${section.sectionLabel} Youth Showcase Arena`,
    shortName: `${section.sectionLabel.slice(0, 10)} Arena`,
    city: section.sectionLabel,
    country: primaryCountry,
    category: 'youth',
    youthSpecialUnlocked: true,
    architecturalGrade: 'modern',
    shape: 'rectangular',
    surroundings: 'big_city',
    grounds: 'mall_commercial',
    roof: {
      enabled: true,
      style: 'continuous_cantilever_ring',
      material: 'ptfe_fabric',
      border: 'painted_club_fascia',
      cutawayMode: 'partial',
      coverage: 0.75,
    },
    roofCutaway: 'partial',
    hasTrack: false,
    apronMaterial: 'grass',
    stands,
    seats: {
      style: 'classic_bucket',
      pattern: 'horizontalBands',
      colors: [primaryColor, secondaryColor],
    },
    lighting: {
      type: 'corner_pylons',
      pylonCount: 4,
      powerKw: 1800,
      timeOfDay: 'night',
    },
    dugouts: {
      type: 'classic_timber',
      quality: 'modern',
      frameColor: primaryColor,
      cushionColor: secondaryColor,
      shelterTint: 'rgba(15, 23, 42, 0.85)',
      setbackDistance: 9,
    },
    tunnel: {
      type: 'subterranean_staircase',
      siting: 'center_main',
      primaryColor,
      secondaryColor,
    },
    capacity,
    fifaCategory: calculateFifaQualification(capacity, 'grade4_modern', 1800, 'pristine'),
    pitchPreset: 'balanced',
    pitchLengthMeters: 92,
    pitchWidthMeters: 58,
    turfQuality: 'pristine',
    mowingPattern: 'european_boxes',
    grassLength: 'normal',
    surfaceStatus: 'normal',
    goalFrame: 'standard',
    netTension: 'moderate',
    seatColor: 'blue',
    crowdLevel: 'half',
    isCasualYouthCrowd: true,
    disableEntryCinematic: false,
    timeOfDay: 'night',
  });
}

let nextSlot = 801;

export const GENERATED_YOUTH_LEAGUE_STADIUMS: Record<string, StadiumDefinition> = {};
for (const [leagueId, league] of Object.entries(YOUTH_LEAGUES_DATABASE)) {
  const big = buildBigYouthLeagueStadium(leagueId, league.name, league.city, league.country, nextSlot++);
  const small = buildSmallYouthLeagueStadium(leagueId, league.name, league.city, league.country, nextSlot++);
  GENERATED_YOUTH_LEAGUE_STADIUMS[big.id] = big;
  GENERATED_YOUTH_LEAGUE_STADIUMS[small.id] = small;
}

export const GENERATED_SPECIAL_YOUTH_STADIUMS: Record<string, StadiumDefinition> = {};
for (const section of getIntlYouthCupStadiumEligibleSections()) {
  const special = buildSpecialUnlockedYouthStadium(section, nextSlot++);
  GENERATED_SPECIAL_YOUTH_STADIUMS[special.id] = special;
}

export const ALL_GENERATED_YOUTH_STADIUMS: Record<string, StadiumDefinition> = {
  ...GENERATED_YOUTH_LEAGUE_STADIUMS,
  ...GENERATED_SPECIAL_YOUTH_STADIUMS,
};

export function resolveYouthStadiumForClub(
  clubNameOrTeam: string | { name?: string; stadiumId?: string; country?: string; tierClass?: 'big' | 'small' },
  isIntlCup: boolean = false
): StadiumDefinition {
  const name = typeof clubNameOrTeam === 'string' ? clubNameOrTeam : clubNameOrTeam.name || '';
  const explicitId = typeof clubNameOrTeam === 'object' ? clubNameOrTeam.stadiumId : undefined;
  if (explicitId && ALL_GENERATED_YOUTH_STADIUMS[explicitId]) {
    if (!isIntlCup) return ALL_GENERATED_YOUTH_STADIUMS[explicitId];
  }

  if (isIntlCup) {
    const country = typeof clubNameOrTeam === 'object' ? clubNameOrTeam.country : undefined;
    const section = getIntlYouthSectionForClubOrCountry(country || name);
    if (section) {
      const specialId = `youth_special_${section.sectionId}`;
      if (ALL_GENERATED_YOUTH_STADIUMS[specialId]) {
        return ALL_GENERATED_YOUTH_STADIUMS[specialId];
      }
    }
    const specialList = Object.values(GENERATED_SPECIAL_YOUTH_STADIUMS);
    if (specialList.length > 0) {
      const key = (country || name || 'intl_youth_cup').toLowerCase();
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
      }
      return specialList[hash % specialList.length];
    }
  }

  const leagueMatch = findYouthTeamAndLeague(name);
  if (leagueMatch) {
    const sid = leagueMatch.team.stadiumId || `youth_${leagueMatch.leagueKey}_${leagueMatch.team.tierClass || 'small'}`;
    if (ALL_GENERATED_YOUTH_STADIUMS[sid]) {
      return ALL_GENERATED_YOUTH_STADIUMS[sid];
    }
  }

  // Fallback to London Youth Big/Small
  return GENERATED_YOUTH_LEAGUE_STADIUMS.youth_london_big || Object.values(GENERATED_YOUTH_LEAGUE_STADIUMS)[0];
}
