/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  StadiumCategory,
  StadiumDefinition,
  StandConfig,
  StandPosition,
  RoofConfig,
  getDefaultRoofConfig,
  calculateStadiumTotalCapacity,
  calculateFifaQualification,
} from '../types/stadium';
import { TeamDefinition } from '../types/team';
import { GENERATED_COUNTRY_STADIUMS } from './countryLeagueStadiums';
import { CURATED_STADIUMS } from './curatedStadiumCatalog';
import {
  DEFAULT_STREET_ARENA_CONFIG,
  sanitizeStadiumForCategory,
} from './stadiumConstraints';
import {
  ALL_GENERATED_YOUTH_STADIUMS,
  resolveYouthStadiumForClub,
} from './youthStadiumGenerator';
import {
  GENERATED_STREET_STADIUMS,
  STREET_STADIUM_BY_CITY,
  resolveStreetStadiumForCity,
} from './streetStadiumGenerator';

export { resolveYouthStadiumForClub, GENERATED_STREET_STADIUMS, STREET_STADIUM_BY_CITY, resolveStreetStadiumForCity };

function createDefaultStands(grade: StandConfig['grade'], tierCount: 1 | 2 | 3 | 4, primaryColor: string, secondaryColor: string): Record<StandPosition, StandConfig> {
  const positions: StandPosition[] = [
    'east',
    'west',
    'north',
    'south',
    'corner_ne',
    'corner_nw',
    'corner_se',
    'corner_sw',
  ];

  const stands = {} as Record<StandPosition, StandConfig>;
  for (const pos of positions) {
    const isCorner = pos.startsWith('corner_');
    stands[pos] = {
      position: pos,
      type: 'tiered',
      grade,
      tierCount,
      tiers: Array.from({ length: tierCount }, () => ({ size: isCorner ? 'small' : 'medium' })),
      primaryColor,
      secondaryColor,
      hasRoof: true,
      roofCoverage: 0.85,
    };
  }
  return stands;
}

/**
 * Canonical Registered Stadiums for Phase 12
 */

// 1. ESTADIO MONUMENTAL (River Plate & Argentina 2026 Home)
const monumentalStands = createDefaultStands('grade4_modern', 3, '#dc2626', '#ffffff');
const monumentalCapacity = calculateStadiumTotalCapacity(monumentalStands, 'oval');
export const ESTADIO_MONUMENTAL: StadiumDefinition = {
  id: 'estadio_monumental',
  name: 'Estadio Monumental de Núñez',
  shortName: 'Monumental',
  city: 'Buenos Aires',
  country: 'Argentina',
  shape: 'oval',
  surroundings: 'big_city',
  grounds: 'parking_lots',
  roof: {
    enabled: true,
    style: 'continuous_cantilever_ring',
    material: 'ptfe_fabric',
    border: 'video_halo_board',
    cutawayMode: 'partial',
    coverage: 0.5,
  },
  roofCutaway: 'partial',
  hasTrack: true,
  apronMaterial: 'rubber_tartan',
  stands: monumentalStands,
  seats: {
    style: 'tip_up_padded',
    pattern: 'horizontalBands',
    colors: ['#dc2626', '#ffffff', '#e2e8f0'],
  },
  lighting: {
    type: 'corner_pylons',
    pylonCount: 4,
    powerKw: 2400,
    timeOfDay: 'night',
  },
  dugouts: {
    type: 'covered_sunken',
    quality: 'luxury',
    frameColor: '#dc2626',
    cushionColor: '#ffffff',
    shelterTint: 'rgba(15, 23, 42, 0.85)',
    setbackDistance: 16,
  },
  tunnel: {
    type: 'inflatable_accordion',
    siting: 'center_main',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
  },
  capacity: monumentalCapacity,
  fifaCategory: calculateFifaQualification(monumentalCapacity),
  pitchPreset: 'balanced',
  pitchLengthMeters: 105,
  pitchWidthMeters: 68,
  turfQuality: 'pristine',
  mowingPattern: 'european_boxes',
  grassLength: 'normal',
  surfaceStatus: 'normal',
  goalFrame: 'standard',
  netTension: 'moderate',
  seatColor: 'red',
};

// 2. LA CAJA (Boca Juniors Home — inspired by La Bombonera)
const bomboneraStands = createDefaultStands('grade3_industrial', 3, '#00457c', '#fecb00');
// East Stand: Iconic towering VIP Palcos & Luxury Suites Building
bomboneraStands.east = {
  position: 'east',
  type: 'vip_building',
  grade: 'grade3_industrial',
  vipFloors: 4,
  hasLowerStand: true,
  lowerStandSize: 'medium',
  lowerStandMaterial: 'concrete',
  lowerStandBarrier: 'glass_balustrade',
  lowerStandSeat: 'leather_armchair',
  hasVipZone: true,
  hasVipSeats: true,
  primaryColor: '#00457c',
  secondaryColor: '#fecb00',
  hasRoof: false,
  roofCoverage: 0,
};
// West Stand: Towering 3-tier steep terrace wall
bomboneraStands.west = {
  position: 'west',
  type: 'tiered',
  grade: 'grade3_industrial',
  tierCount: 3,
  tiers: [{ size: 'large' }, { size: 'large' }, { size: 'large' }],
  primaryColor: '#00457c',
  secondaryColor: '#fecb00',
  hasRoof: true,
  roofCoverage: 0.5,
};
// North & South: Steep 2-tier terraces
bomboneraStands.north.tierCount = 2;
bomboneraStands.north.tiers = [{ size: 'medium' }, { size: 'medium' }];
bomboneraStands.south.tierCount = 2;
bomboneraStands.south.tiers = [{ size: 'medium' }, { size: 'medium' }];
// East/North & East/South Corners: Flanking VIP Hospitality Towers
bomboneraStands.corner_ne = {
  position: 'corner_ne',
  type: 'tower',
  cornerType: 'tower',
  grade: 'grade3_industrial',
  vipFloors: 4,
  hasVipZone: true,
  hasVipSeats: true,
  primaryColor: '#00457c',
  secondaryColor: '#fecb00',
  hasRoof: false,
  roofCoverage: 0,
};
bomboneraStands.corner_se = {
  position: 'corner_se',
  type: 'tower',
  cornerType: 'tower',
  grade: 'grade3_industrial',
  vipFloors: 4,
  hasVipZone: true,
  hasVipSeats: true,
  primaryColor: '#00457c',
  secondaryColor: '#fecb00',
  hasRoof: false,
  roofCoverage: 0,
};
// West/North & West/South Corners: Sweeping 3-tier round corners uniting the bowl
bomboneraStands.corner_nw = {
  position: 'corner_nw',
  type: 'round',
  cornerType: 'round',
  grade: 'grade3_industrial',
  tierCount: 3,
  tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
  primaryColor: '#00457c',
  secondaryColor: '#fecb00',
  hasRoof: true,
  roofCoverage: 0.5,
};
bomboneraStands.corner_sw = {
  position: 'corner_sw',
  type: 'round',
  cornerType: 'round',
  grade: 'grade3_industrial',
  tierCount: 3,
  tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
  primaryColor: '#00457c',
  secondaryColor: '#fecb00',
  hasRoof: true,
  roofCoverage: 0.5,
};
const bomboneraCapacity = calculateStadiumTotalCapacity(bomboneraStands, 'rectangular');
export const LA_BOMBONERA: StadiumDefinition = {
  id: 'la_bombonera',
  name: 'La Caja',
  shortName: 'La Caja',
  city: 'Buenos Aires',
  country: 'Argentina',
  shape: 'rectangular',
  surroundings: 'small_city',
  grounds: 'municipal_thoroughfare',
  roof: {
    enabled: true,
    style: 'cantilever_truss',
    material: 'corrugated_steel',
    border: 'gunmetal_box_girder',
    cutawayMode: 'partial',
    coverage: 0.5,
  },
  roofCutaway: 'partial',
  hasTrack: false,
  apronMaterial: 'concrete',
  stands: bomboneraStands,
  seats: {
    style: 'classic_bucket',
    pattern: 'horizontalBands',
    colors: ['#00457c', '#fecb00'],
  },
  lighting: {
    type: 'roof_banks',
    pylonCount: 4,
    powerKw: 2000,
    timeOfDay: 'night',
  },
  dugouts: {
    type: 'racing_bucket',
    quality: 'modern',
    frameColor: '#00457c',
    cushionColor: '#fecb00',
    shelterTint: 'rgba(0, 35, 75, 0.9)',
    setbackDistance: 14,
  },
  tunnel: {
    type: 'subterranean_staircase',
    siting: 'corner',
    primaryColor: '#00457c',
    secondaryColor: '#fecb00',
    hasBellows: false,
  },
  capacity: bomboneraCapacity,
  fifaCategory: calculateFifaQualification(bomboneraCapacity),
  pitchPreset: 'compact',
  pitchLengthMeters: 100,
  pitchWidthMeters: 64,
  turfQuality: 'normal',
  mowingPattern: 'diagonal_diamonds',
  grassLength: 'short',
  surfaceStatus: 'normal',
  goalFrame: 'brazilian',
  netTension: 'hard',
  seatColor: 'blue',
};

// 3. SANTIAGO BERNABÉU (Spain 2026 & Modern European XI Home)
const bernabeuStands = createDefaultStands('grade5_futuristic', 4, '#1e293b', '#38bdf8');
const bernabeuCapacity = calculateStadiumTotalCapacity(bernabeuStands, 'rectangular');
export const SANTIAGO_BERNABEU: StadiumDefinition = {
  id: 'santiago_bernabeu',
  name: 'Coliseo de Chamartín',
  shortName: 'Chamartín',
  city: 'Madrid',
  country: 'Spain',
  shape: 'rectangular',
  surroundings: 'big_city',
  grounds: 'mall_commercial',
  roof: {
    enabled: true,
    style: 'spaceframe_halo',
    material: 'anodized_aluminum',
    border: 'led_halo_ribbon',
    cutawayMode: 'partial',
    coverage: 0.65,
  },
  roofCutaway: 'partial',
  hasTrack: false,
  apronMaterial: 'artificial_turf',
  stands: bernabeuStands,
  seats: {
    style: 'vip_leather',
    pattern: 'solid',
    colors: ['#0284c7', '#38bdf8'],
  },
  lighting: {
    type: 'roof_banks',
    pylonCount: 4,
    powerKw: 3200,
    timeOfDay: 'night',
  },
  dugouts: {
    type: 'recaro_racing',
    quality: 'elite_vip',
    frameColor: '#0f172a',
    cushionColor: '#0284c7',
    shelterTint: 'rgba(15, 23, 42, 0.95)',
    setbackDistance: 18,
  },
  tunnel: {
    type: 'modern_architectural',
    siting: 'center_main',
    primaryColor: '#0284c7',
    secondaryColor: '#38bdf8',
    backlitLeds: true,
  },
  capacity: bernabeuCapacity,
  fifaCategory: calculateFifaQualification(bernabeuCapacity),
  pitchPreset: 'balanced',
  pitchLengthMeters: 105,
  pitchWidthMeters: 68,
  turfQuality: 'pristine',
  mowingPattern: 'european_boxes',
  grassLength: 'short',
  surfaceStatus: 'normal',
  goalFrame: 'standard',
  netTension: 'moderate',
  seatColor: 'blue',
};

// 4. CRAVEN COTTAGE (Classic European XI Home)
const cravenStands = createDefaultStands('grade2_classic', 1, '#991b1b', '#f8fafc');
// West stand (Riverside) is a 2-tier stand
cravenStands.west.tierCount = 2;
cravenStands.west.tiers = [{ size: 'medium' }, { size: 'medium' }];
// Classic English ground with open corners and brick boundary wall
cravenStands.corner_ne = {
  position: 'corner_ne',
  type: 'none',
  grade: 'grade2_classic',
  backdrop: 'small_houses',
  perimeterFinish: 'brick_wall',
  primaryColor: '#991b1b',
  secondaryColor: '#f8fafc',
  hasRoof: false,
  roofCoverage: 0,
};
cravenStands.corner_nw = {
  position: 'corner_nw',
  type: 'none',
  grade: 'grade2_classic',
  backdrop: 'small_houses',
  perimeterFinish: 'brick_wall',
  primaryColor: '#991b1b',
  secondaryColor: '#f8fafc',
  hasRoof: false,
  roofCoverage: 0,
};
cravenStands.corner_se = {
  position: 'corner_se',
  type: 'none',
  grade: 'grade2_classic',
  backdrop: 'small_houses',
  perimeterFinish: 'brick_wall',
  primaryColor: '#991b1b',
  secondaryColor: '#f8fafc',
  hasRoof: false,
  roofCoverage: 0,
};
cravenStands.corner_sw = {
  position: 'corner_sw',
  type: 'none',
  grade: 'grade2_classic',
  backdrop: 'small_houses',
  perimeterFinish: 'brick_wall',
  primaryColor: '#991b1b',
  secondaryColor: '#f8fafc',
  hasRoof: false,
  roofCoverage: 0,
};
const cravenCapacity = calculateStadiumTotalCapacity(cravenStands, 'rectangular');
export const CRAVEN_COTTAGE: StadiumDefinition = {
  id: 'craven_cottage',
  name: 'Craven Heritage Ground',
  shortName: 'Craven Ground',
  city: 'London',
  country: 'England',
  shape: 'rectangular',
  surroundings: 'nature',
  grounds: 'classical_statues',
  roof: {
    enabled: true,
    style: 'cantilever_truss',
    material: 'corrugated_steel',
    border: 'copper_stone_coping',
    cutawayMode: 'partial',
    coverage: 0.5,
  },
  roofCutaway: 'partial',
  hasTrack: false,
  apronMaterial: 'grass',
  stands: cravenStands,
  seats: {
    style: 'classic_bucket',
    pattern: 'horizontalBands',
    colors: ['#991b1b', '#f8fafc'],
  },
  lighting: {
    type: 'corner_pylons',
    pylonCount: 4,
    powerKw: 1600,
    timeOfDay: 'night',
  },
  dugouts: {
    type: 'classic_timber',
    quality: 'classic',
    frameColor: '#78350f',
    cushionColor: '#991b1b',
    shelterTint: 'rgba(30, 41, 59, 0.85)',
    setbackDistance: 12,
  },
  tunnel: {
    type: 'direct_portal',
    siting: 'corner',
    primaryColor: '#991b1b',
    secondaryColor: '#f8fafc',
  },
  capacity: cravenCapacity,
  fifaCategory: calculateFifaQualification(cravenCapacity),
  pitchPreset: 'compact',
  pitchLengthMeters: 100,
  pitchWidthMeters: 65,
  turfQuality: 'normal',
  mowingPattern: 'horizontal',
  grassLength: 'normal',
  surfaceStatus: 'normal',
  goalFrame: 'standard',
  netTension: 'moderate',
  seatColor: 'wooden',
};

// 5. ESTADIO METROPOLITANO DE TECHO (Bogotá FC & Real Cundinamarca Home)
const techoStands = createDefaultStands('grade1_municipal', 1, '#15803d', '#facc15');
// North & South are open without stands
techoStands.north = {
  position: 'north',
  type: 'none',
  grade: 'grade1_municipal',
  backdrop: 'small_houses',
  perimeterFinish: 'chainlink_fence',
  primaryColor: '#475569',
  secondaryColor: '#cbd5e1',
  hasRoof: false,
  roofCoverage: 0,
};
techoStands.south = {
  position: 'south',
  type: 'none',
  grade: 'grade1_municipal',
  backdrop: 'wall',
  wallPerimeter: { size: 'medium', material: 'concrete' },
  primaryColor: '#475569',
  secondaryColor: '#cbd5e1',
  hasRoof: false,
  roofCoverage: 0,
};
const techoCapacity = calculateStadiumTotalCapacity(techoStands, 'square');
export const ESTADIO_TECHO: StadiumDefinition = {
  id: 'estadio_metropolitano_techo',
  name: 'Estadio Metropolitano de Techo',
  shortName: 'Techo Municipal',
  city: 'Bogotá',
  country: 'Colombia',
  shape: 'square',
  surroundings: 'small_city',
  grounds: 'potrero_dirt',
  roof: {
    enabled: true,
    style: 'cantilever_truss',
    material: 'corrugated_steel',
    border: 'painted_club_fascia',
    cutawayMode: 'partial',
    coverage: 0.5,
  },
  roofCutaway: 'partial',
  hasTrack: false,
  apronMaterial: 'asphalt_paved',
  stands: techoStands,
  seats: {
    style: 'plastic_bench',
    pattern: 'solid',
    colors: ['#15803d', '#facc15'],
  },
  lighting: {
    type: 'light_poles',
    pylonCount: 4,
    powerKw: 900,
    timeOfDay: 'sunset',
  },
  dugouts: {
    type: 'utilitarian_concrete',
    quality: 'municipal',
    frameColor: '#475569',
    cushionColor: '#15803d',
    shelterTint: 'rgba(30, 41, 59, 0.75)',
    setbackDistance: 10,
  },
  tunnel: {
    type: 'inflatable_accordion',
    siting: 'center_main',
    primaryColor: '#15803d',
    secondaryColor: '#facc15',
    hasBellows: true,
  },
  capacity: techoCapacity,
  fifaCategory: calculateFifaQualification(techoCapacity),
  pitchPreset: 'compact',
  pitchLengthMeters: 100,
  pitchWidthMeters: 64,
  turfQuality: 'poor',
  mowingPattern: 'plain',
  grassLength: 'long',
  surfaceStatus: 'dry',
  goalFrame: 'standard',
  netTension: 'soft',
  seatColor: 'concrete',
};

// 6. MARACANÃ LEGENDS BOWL (Classic South American XI Home)
const maracanaStands = createDefaultStands('grade4_modern', 3, '#047857', '#fbbf24');
const maracanaCapacity = calculateStadiumTotalCapacity(maracanaStands, 'round');
export const MARACANA_LEGEND: StadiumDefinition = {
  id: 'maracana_legend',
  name: 'Estádio Carioca Monumental',
  shortName: 'Carioca',
  city: 'Rio de Janeiro',
  country: 'Brazil',
  shape: 'round',
  surroundings: 'nature',
  grounds: 'park_recreation',
  roof: {
    enabled: true,
    style: 'spoke_wheel_tension',
    material: 'ptfe_fabric',
    border: 'video_halo_board',
    cutawayMode: 'partial',
    coverage: 0.6,
  },
  roofCutaway: 'partial',
  hasTrack: true,
  apronMaterial: 'rubber_tartan',
  stands: maracanaStands,
  seats: {
    style: 'classic_bucket',
    pattern: 'lowerUpper',
    colors: ['#047857', '#fbbf24', '#0284c7'],
  },
  lighting: {
    type: 'corner_pylons',
    pylonCount: 4,
    powerKw: 2800,
    timeOfDay: 'night',
  },
  dugouts: {
    type: 'recaro_racing',
    quality: 'modern',
    frameColor: '#047857',
    cushionColor: '#fbbf24',
    shelterTint: 'rgba(15, 23, 42, 0.85)',
    setbackDistance: 16,
  },
  tunnel: {
    type: 'inflatable_accordion',
    siting: 'center_main',
    primaryColor: '#047857',
    secondaryColor: '#fbbf24',
    hasBellows: true,
  },
  capacity: maracanaCapacity,
  fifaCategory: calculateFifaQualification(maracanaCapacity),
  pitchPreset: 'expansive',
  pitchLengthMeters: 110,
  pitchWidthMeters: 74,
  turfQuality: 'pristine',
  mowingPattern: 'plain',
  grassLength: 'normal',
  surfaceStatus: 'normal',
  goalFrame: 'brazilian',
  netTension: 'hard',
  seatColor: 'green',
};

// 7. VICTORIA AIRPORT GROUND (Airport Runway Open Stand)
const runwayStands = createDefaultStands('grade1_municipal', 1, '#2563eb', '#ffffff');
// Runway and open airport fencing along north, east, and all corners
runwayStands.north = {
  position: 'north',
  type: 'none',
  grade: 'grade1_municipal',
  backdrop: 'runway',
  perimeterFinish: 'big_fence',
  primaryColor: '#334155',
  secondaryColor: '#64748b',
  hasRoof: false,
  roofCoverage: 0,
};
runwayStands.east = {
  position: 'east',
  type: 'none',
  grade: 'grade1_municipal',
  backdrop: 'runway',
  perimeterFinish: 'chainlink_fence',
  primaryColor: '#334155',
  secondaryColor: '#64748b',
  hasRoof: false,
  roofCoverage: 0,
};
runwayStands.corner_ne = {
  position: 'corner_ne',
  type: 'none',
  grade: 'grade1_municipal',
  backdrop: 'runway',
  primaryColor: '#334155',
  secondaryColor: '#64748b',
  hasRoof: false,
  roofCoverage: 0,
};
runwayStands.corner_nw = {
  position: 'corner_nw',
  type: 'none',
  grade: 'grade1_municipal',
  backdrop: 'runway',
  primaryColor: '#334155',
  secondaryColor: '#64748b',
  hasRoof: false,
  roofCoverage: 0,
};
runwayStands.corner_se = {
  position: 'corner_se',
  type: 'none',
  grade: 'grade1_municipal',
  backdrop: 'runway',
  primaryColor: '#334155',
  secondaryColor: '#64748b',
  hasRoof: false,
  roofCoverage: 0,
};
runwayStands.corner_sw = {
  position: 'corner_sw',
  type: 'none',
  grade: 'grade1_municipal',
  backdrop: 'runway',
  primaryColor: '#334155',
  secondaryColor: '#64748b',
  hasRoof: false,
  roofCoverage: 0,
};
const runwayCapacity = calculateStadiumTotalCapacity(runwayStands, 'rectangular');
export const VICTORIA_AIRPORT_GROUND: StadiumDefinition = {
  id: 'victoria_runway_ground',
  name: 'Victoria Runway Ground',
  shortName: 'Victoria Ground',
  city: 'Gibraltar',
  country: 'Gibraltar',
  shape: 'rectangular',
  surroundings: 'airport',
  grounds: 'airport_runway_tarmac',
  roof: {
    enabled: true,
    style: 'barrel_vault',
    material: 'anodized_aluminum',
    border: 'gunmetal_box_girder',
    cutawayMode: 'partial',
    coverage: 0.5,
  },
  roofCutaway: 'partial',
  hasTrack: false,
  apronMaterial: 'gravel_ballast',
  stands: runwayStands,
  seats: {
    style: 'plastic_bench',
    pattern: 'solid',
    colors: ['#2563eb', '#ffffff'],
  },
  lighting: {
    type: 'light_poles',
    pylonCount: 4,
    powerKw: 800,
    timeOfDay: 'noon',
  },
  dugouts: {
    type: 'folding_chairs',
    quality: 'municipal',
    frameColor: '#2563eb',
    cushionColor: '#ffffff',
    shelterTint: 'rgba(255, 255, 255, 0.2)',
    setbackDistance: 8,
  },
  tunnel: {
    type: 'telescopic_canopy',
    siting: 'center_main',
    primaryColor: '#2563eb',
    secondaryColor: '#ffffff',
  },
  capacity: runwayCapacity,
  fifaCategory: calculateFifaQualification(runwayCapacity),
  pitchPreset: 'compact',
  pitchLengthMeters: 100,
  pitchWidthMeters: 64,
  turfQuality: 'normal',
  mowingPattern: 'vertical',
  grassLength: 'normal',
  surfaceStatus: 'dry',
  goalFrame: 'standard',
  netTension: 'moderate',
  seatColor: 'blue',
};

// 8. FLOATING MARINA ARENA (Marine Floating Surroundings)
const marinaStands = createDefaultStands('grade4_modern', 2, '#0284c7', '#38bdf8');
marinaStands.north = {
  position: 'north',
  type: 'none',
  grade: 'grade4_modern',
  backdrop: 'open_ocean',
  perimeterFinish: 'chainlink_fence',
  primaryColor: '#0369a1',
  secondaryColor: '#38bdf8',
  hasRoof: false,
  roofCoverage: 0,
};
const marinaCapacity = calculateStadiumTotalCapacity(marinaStands, 'rectangular');
export const FLOATING_MARINA_ARENA: StadiumDefinition = {
  id: 'floating_marina_arena',
  name: 'Oceanic Floating Marina Stadium',
  shortName: 'Floating Arena',
  city: 'Marina Bay',
  country: 'Singapore',
  shape: 'rectangular',
  surroundings: 'marine_floating',
  grounds: 'marine_floating_pontoons',
  roof: {
    enabled: true,
    style: 'tensile_cable',
    material: 'etfe_cushion',
    border: 'copper_stone_coping',
    cutawayMode: 'partial',
    coverage: 0.5,
  },
  roofCutaway: 'partial',
  hasTrack: false,
  apronMaterial: 'concrete',
  stands: marinaStands,
  seats: {
    style: 'tip_up_padded',
    pattern: 'verticalStripes',
    colors: ['#0284c7', '#38bdf8', '#ffffff'],
  },
  lighting: {
    type: 'roof_banks',
    pylonCount: 4,
    powerKw: 2200,
    timeOfDay: 'sunset',
  },
  dugouts: {
    type: 'covered_sunken',
    quality: 'modern',
    frameColor: '#0284c7',
    cushionColor: '#ffffff',
    shelterTint: 'rgba(15, 23, 42, 0.9)',
    setbackDistance: 14,
  },
  tunnel: {
    type: 'direct_portal',
    siting: 'center_main',
    primaryColor: '#0284c7',
    secondaryColor: '#38bdf8',
  },
  capacity: marinaCapacity,
  fifaCategory: calculateFifaQualification(marinaCapacity),
  pitchPreset: 'balanced',
  pitchLengthMeters: 105,
  pitchWidthMeters: 68,
  turfQuality: 'pristine',
  mowingPattern: 'checkerboard',
  grassLength: 'short',
  surfaceStatus: 'wet',
  goalFrame: 'standard',
  netTension: 'moderate',
  seatColor: 'blue',
};

// 9. ALPINE BERGSTADION (Northern Mountain Chain Panorama - Phase B5 Showcase)
const alpineStands = createDefaultStands('grade2_classic', 2, '#047857', '#ffffff');
alpineStands.north = {
  position: 'north',
  type: 'none',
  grade: 'grade2_classic',
  backdrop: 'alpine_peaks',
  perimeterFinish: 'brick_wall',
  primaryColor: '#047857',
  secondaryColor: '#ffffff',
  hasRoof: false,
  roofCoverage: 0,
};
const alpineCapacity = calculateStadiumTotalCapacity(alpineStands, 'rectangular');
export const ALPINE_BERGSTADION: StadiumDefinition = {
  id: 'alpine_bergstadion',
  name: 'Alpine Bergstadion (Matterhorn Arena)',
  shortName: 'Bergstadion',
  city: 'Zermatt',
  country: 'Switzerland',
  shape: 'rectangular',
  surroundings: 'mountains',
  grounds: 'park_recreation',
  roof: {
    enabled: true,
    style: 'cantilever_truss',
    material: 'corrugated_steel',
    border: 'painted_club_fascia',
    cutawayMode: 'partial',
    coverage: 0.5,
  },
  roofCutaway: 'partial',
  hasTrack: false,
  apronMaterial: 'grass',
  stands: alpineStands,
  seats: {
    style: 'plastic_bench',
    pattern: 'horizontalBands',
    colors: ['#047857', '#ffffff', '#e2e8f0'],
  },
  lighting: {
    type: 'light_poles',
    pylonCount: 4,
    powerKw: 1400,
    timeOfDay: 'sunset',
  },
  dugouts: {
    type: 'classic_timber',
    quality: 'classic',
    frameColor: '#78350f',
    cushionColor: '#047857',
    shelterTint: 'rgba(30, 41, 59, 0.85)',
    setbackDistance: 12,
  },
  tunnel: {
    type: 'direct_portal',
    siting: 'center_main',
    primaryColor: '#047857',
    secondaryColor: '#ffffff',
  },
  capacity: alpineCapacity,
  fifaCategory: calculateFifaQualification(alpineCapacity),
  pitchPreset: 'balanced',
  pitchLengthMeters: 105,
  pitchWidthMeters: 68,
  turfQuality: 'pristine',
  mowingPattern: 'horizontal',
  grassLength: 'short',
  surfaceStatus: 'normal',
  goalFrame: 'standard',
  netTension: 'moderate',
  seatColor: 'green',
};

export const MAX_STADIUM_CATALOG_SLOTS = 999;

const BASE_CANONICAL_STADIUMS: Array<[string, StadiumDefinition, number]> = [
  ['estadio_monumental', ESTADIO_MONUMENTAL, 1],
  ['la_bombonera', LA_BOMBONERA, 2],
  ['santiago_bernabeu', SANTIAGO_BERNABEU, 3],
  ['craven_cottage', CRAVEN_COTTAGE, 4],
  ['estadio_metropolitano_techo', ESTADIO_TECHO, 5],
  ['maracana_legend', MARACANA_LEGEND, 6],
  ['victoria_runway_ground', VICTORIA_AIRPORT_GROUND, 7],
  ['floating_marina_arena', FLOATING_MARINA_ARENA, 8],
  ['alpine_bergstadion', ALPINE_BERGSTADION, 9],
];

export const STADIUM_REGISTRY: Record<string, StadiumDefinition> = {};

for (const [id, def, slotNumber] of BASE_CANONICAL_STADIUMS) {
  def.slotNumber = slotNumber;
  def.category = def.category || 'pro';
  STADIUM_REGISTRY[id] = def;
}

for (const [id, def] of Object.entries(GENERATED_COUNTRY_STADIUMS)) {
  def.category = def.category || 'pro';
  STADIUM_REGISTRY[id] = def;
}

for (const [id, def] of Object.entries(CURATED_STADIUMS)) {
  def.category = def.category || 'pro';
  STADIUM_REGISTRY[id] = def;
}

for (const [id, def] of Object.entries(ALL_GENERATED_YOUTH_STADIUMS)) {
  def.category = 'youth';
  STADIUM_REGISTRY[id] = def;
}

for (const [id, def] of Object.entries(GENERATED_STREET_STADIUMS)) {
  def.category = 'street';
  STADIUM_REGISTRY[id] = def;
}

/**
 * Phase 14.2 + Phase 4: Factory to create initial base stadium for 'pro' | 'youth' | 'street'.
 * Preserves full backwards compatibility when called as createDefaultStadium(customName?).
 */
export function createDefaultStadium(
  customNameOrSlot?: string | number,
  category: StadiumCategory = 'pro'
): StadiumDefinition {
  const customName =
    typeof customNameOrSlot === 'string' && customNameOrSlot.trim()
      ? customNameOrSlot.trim()
      : undefined;
  const id = `custom_${category}_${Date.now()}`;
  const positions: StandPosition[] = [
    'east',
    'west',
    'north',
    'south',
    'corner_ne',
    'corner_nw',
    'corner_se',
    'corner_sw',
  ];

  if (category === 'street') {
    const stands = createDefaultStands('grade1_municipal', 1, '#f59e0b', '#1e293b');
    for (const p of positions) {
      stands[p] = {
        position: p,
        type: 'none',
        grade: 'grade1_municipal',
        tierCount: 1,
        tiers: [],
        hasRoof: false,
        roofCoverage: 0,
      };
    }
    const name = customName || 'Barrio Asphalt Cage';
    return sanitizeStadiumForCategory({
      id,
      name,
      shortName: name.slice(0, 14),
      city: 'Buenos Aires',
      country: 'Argentina',
      category: 'street',
      shape: 'rectangular',
      surroundings: 'small_city',
      grounds: 'parking_lots',
      roof: { ...getDefaultRoofConfig('rectangular'), enabled: false, cutawayMode: 'hidden', coverage: 0 },
      roofCutaway: 'hidden',
      hasTrack: false,
      apronMaterial: 'asphalt_paved',
      stands,
      seats: {
        style: 'plastic_bench',
        pattern: 'solid',
        colors: ['#475569', '#f59e0b'],
      },
      lighting: {
        type: 'light_poles',
        pylonCount: 2,
        powerKw: 200,
        timeOfDay: 'noon',
      },
      dugouts: {
        type: 'folding_chairs',
        quality: 'municipal',
        frameColor: '#475569',
        cushionColor: '#f59e0b',
        shelterTint: 'rgba(15, 23, 42, 0.7)',
        setbackDistance: 6,
      },
      tunnel: {
        type: 'direct_portal',
        siting: 'behind_goal',
        primaryColor: '#475569',
        secondaryColor: '#f59e0b',
      },
      capacity: 0,
      fifaCategory: 'national',
      pitchPreset: 'compact',
      pitchLengthMeters: 48,
      pitchWidthMeters: 28,
      turfQuality: 'concrete',
      mowingPattern: 'plain',
      grassLength: 'short',
      surfaceStatus: 'normal',
      goalFrame: 'round_steel',
      netTension: 'soft',
      seatColor: 'concrete',
      streetSurface: 'concrete',
      streetConfig: {
        ...DEFAULT_STREET_ARENA_CONFIG,
        urbanProps: [...DEFAULT_STREET_ARENA_CONFIG.urbanProps],
      },
      isCasualYouthCrowd: true,
      disableEntryCinematic: true,
    });
  }

  if (category === 'youth') {
    const stands = createDefaultStands('grade2_classic', 1, '#0284c7', '#e2e8f0');
    for (const p of positions) {
      const isCorner = p.startsWith('corner_');
      stands[p] = {
        position: p,
        type: isCorner ? 'none' : 'tiered',
        ...(isCorner ? { cornerType: 'none' as const } : {}),
        grade: 'grade2_classic',
        architecturalGrade: 'brutalist',
        tierCount: 1,
        tiers: isCorner ? [] : [{ size: 'small' }],
        primaryColor: '#0284c7',
        secondaryColor: '#e2e8f0',
        hasRoof: false,
        roofCoverage: 0,
      };
    }
    const name = customName || 'Academy Training Ground';
    const capacity = calculateStadiumTotalCapacity(stands, 'rectangular');
    const fifaCategory = calculateFifaQualification(capacity, 'grade2_classic', 0, 'normal');
    return sanitizeStadiumForCategory({
      id,
      name,
      shortName: name.slice(0, 14),
      city: 'Arcade City',
      country: 'International',
      category: 'youth',
      architecturalGrade: 'brutalist',
      shape: 'rectangular',
      surroundings: 'small_city',
      grounds: 'parking_lots',
      roof: { ...getDefaultRoofConfig('rectangular'), enabled: false, cutawayMode: 'hidden', coverage: 0 },
      roofCutaway: 'hidden',
      hasTrack: false,
      apronMaterial: 'grass',
      stands,
      seats: {
        style: 'plastic_bench',
        pattern: 'solid',
        colors: ['#0284c7', '#e2e8f0'],
      },
      lighting: {
        type: 'none',
        pylonCount: 0,
        powerKw: 0,
        timeOfDay: 'noon',
      },
      dugouts: {
        type: 'classic_timber',
        quality: 'municipal',
        frameColor: '#78350f',
        cushionColor: '#0284c7',
        shelterTint: 'rgba(30, 41, 59, 0.8)',
        setbackDistance: 8,
      },
      tunnel: {
        type: 'subterranean_staircase',
        siting: 'center_main',
        primaryColor: '#0284c7',
        secondaryColor: '#e2e8f0',
      },
      capacity,
      fifaCategory,
      pitchPreset: 'balanced',
      pitchLengthMeters: 90,
      pitchWidthMeters: 56,
      turfQuality: 'normal',
      mowingPattern: 'horizontal',
      grassLength: 'normal',
      surfaceStatus: 'normal',
      goalFrame: 'standard',
      netTension: 'moderate',
      seatColor: 'blue',
      isCasualYouthCrowd: true,
      disableEntryCinematic: true,
    });
  }

  const stands = createDefaultStands('grade1_municipal', 1, '#2563eb', '#1e40af');
  // Explicitly ensure every stand has 1 small tier
  for (const p of positions) {
    stands[p] = {
      position: p,
      type: 'tiered',
      grade: 'grade1_municipal',
      tierCount: 1,
      tiers: [{ size: 'small' }],
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      hasRoof: true,
      roofCoverage: 0.75,
    };
  }

  const name = customName || 'Arcade Municipal Arena';
  const capacity = calculateStadiumTotalCapacity(stands, 'rectangular');
  const fifaCategory = calculateFifaQualification(capacity, 'grade1_municipal', 800, 'normal');

  return {
    id,
    name,
    shortName: customName ? customName.slice(0, 14) : 'Municipal',
    city: 'Arcade City',
    country: 'International',
    category: 'pro',
    shape: 'rectangular',
    surroundings: 'small_city',
    grounds: 'parking_lots',
    roof: getDefaultRoofConfig(),
    roofCutaway: 'partial',
    hasTrack: false,
    apronMaterial: 'grass',
    stands,
    seats: {
      style: 'plastic_bench',
      pattern: 'solid',
      colors: ['#2563eb', '#ffffff'],
    },
    lighting: {
      type: 'light_poles',
      pylonCount: 4,
      powerKw: 800,
      timeOfDay: 'night',
    },
    dugouts: {
      type: 'classic_timber',
      quality: 'municipal',
      frameColor: '#78350f',
      cushionColor: '#0284c7',
      shelterTint: 'rgba(30, 41, 59, 0.8)',
      setbackDistance: 10,
    },
    tunnel: {
      type: 'direct_portal',
      siting: 'center_main',
      primaryColor: '#2563eb',
      secondaryColor: '#ffffff',
    },
    capacity,
    fifaCategory,
    pitchPreset: 'balanced',
    pitchLengthMeters: 105,
    pitchWidthMeters: 68,
    turfQuality: 'normal',
    mowingPattern: 'horizontal',
    grassLength: 'normal',
    surfaceStatus: 'normal',
    goalFrame: 'standard',
    netTension: 'moderate',
    seatColor: 'blue',
  };
}

export function getNextAvailableStadiumSlot(): number {
  const used = new Set<number>();
  for (const s of Object.values(STADIUM_REGISTRY)) {
    if (s.slotNumber && s.slotNumber >= 1 && s.slotNumber <= MAX_STADIUM_CATALOG_SLOTS) {
      used.add(s.slotNumber);
    }
  }
  for (let slot = 1; slot <= MAX_STADIUM_CATALOG_SLOTS; slot++) {
    if (!used.has(slot)) return slot;
  }
  return MAX_STADIUM_CATALOG_SLOTS;
}

export interface StadiumCatalogSlot {
  slotNumber: number;
  stadium?: StadiumDefinition;
}

/**
 * Returns the full numbered 1 to 999 stadium directory.
 */
export function getStadiumCatalogSlots(maxSlot: number = MAX_STADIUM_CATALOG_SLOTS): StadiumCatalogSlot[] {
  const bySlot = new Map<number, StadiumDefinition>();
  const unslotted: StadiumDefinition[] = [];

  for (const stadium of Object.values(STADIUM_REGISTRY)) {
    if (stadium.slotNumber && stadium.slotNumber >= 1 && stadium.slotNumber <= maxSlot && !bySlot.has(stadium.slotNumber)) {
      bySlot.set(stadium.slotNumber, stadium);
    } else if (!stadium.slotNumber) {
      unslotted.push(stadium);
    }
  }

  let nextFill = 1;
  for (const stadium of unslotted) {
    while (nextFill <= maxSlot && bySlot.has(nextFill)) {
      nextFill++;
    }
    if (nextFill <= maxSlot) {
      stadium.slotNumber = nextFill;
      bySlot.set(nextFill, stadium);
      nextFill++;
    }
  }

  const slots: StadiumCatalogSlot[] = [];
  for (let n = 1; n <= maxSlot; n++) {
    slots.push({ slotNumber: n, stadium: bySlot.get(n) });
  }
  return slots;
}

/**
 * Phase 14: Save custom stadium to persistent registry and localStorage
 */
export function saveCustomStadium(stadium: StadiumDefinition): void {
  const existingSlot = STADIUM_REGISTRY[stadium.id]?.slotNumber;
  const assignedSlot = stadium.slotNumber || existingSlot || getNextAvailableStadiumSlot();
  const normalizedStadium = sanitizeStadiumForCategory({
    ...stadium,
    category: stadium.category || 'pro',
    slotNumber: Math.min(MAX_STADIUM_CATALOG_SLOTS, Math.max(1, assignedSlot)),
  });

  STADIUM_REGISTRY[normalizedStadium.id] = normalizedStadium;
  try {
    const customList = loadCustomStadiums();
    const existingIdx = customList.findIndex((s) => s.id === normalizedStadium.id);
    if (existingIdx >= 0) {
      customList[existingIdx] = normalizedStadium;
    } else {
      customList.push(normalizedStadium);
    }
    localStorage.setItem('swos_custom_stadiums', JSON.stringify(customList));
  } catch {}
}

/**
 * Load all custom stadiums from localStorage into active registry
 */
export function loadCustomStadiums(): StadiumDefinition[] {
  try {
    const raw = localStorage.getItem('swos_custom_stadiums');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const normalizedList: StadiumDefinition[] = [];
      for (const rawStd of parsed) {
        if (rawStd && rawStd.id && rawStd.name) {
          const slotNumber = rawStd.slotNumber || getNextAvailableStadiumSlot();
          const std = sanitizeStadiumForCategory({
            ...rawStd,
            category: rawStd.category || 'pro',
            slotNumber,
          });
          STADIUM_REGISTRY[std.id] = std;
          normalizedList.push(std);
        }
      }
      return normalizedList;
    }
  } catch {}
  return [];
}

/**
 * Delete a custom stadium from registry and localStorage
 */
export function deleteCustomStadium(stadiumId: string): void {
  delete STADIUM_REGISTRY[stadiumId];
  try {
    const customList = loadCustomStadiums().filter((s) => s.id !== stadiumId);
    localStorage.setItem('swos_custom_stadiums', JSON.stringify(customList));
  } catch {}
}

// Auto-hydrate custom stadiums on startup
if (typeof window !== 'undefined') {
  try {
    loadCustomStadiums();
  } catch {}
}

export function getAllRegisteredStadiums(): StadiumDefinition[] {
  return Object.values(STADIUM_REGISTRY).sort(
    (a, b) => (a.slotNumber ?? 9999) - (b.slotNumber ?? 9999)
  );
}

export function getRegisteredStadiumsByCategory(category: StadiumCategory): StadiumDefinition[] {
  return getAllRegisteredStadiums().filter(
    (stadium) => (stadium.category || 'pro') === category
  );
}

export function getStadiumById(id: string): StadiumDefinition {
  return STADIUM_REGISTRY[id] || ESTADIO_MONUMENTAL;
}

export function getHomeStadiumForTeam(team: TeamDefinition): StadiumDefinition | null {
  if (team.homeStadiumId && STADIUM_REGISTRY[team.homeStadiumId]) {
    return STADIUM_REGISTRY[team.homeStadiumId];
  }
  return null;
}
