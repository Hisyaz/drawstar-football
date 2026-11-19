/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { STARTING_CITIES } from '../../constants';
import { TimeOfDay, TurfQuality } from '../types';
import {
  StadiumDefinition,
  StandConfig,
  StandPosition,
  StreetArenaConfig,
  getDefaultRoofConfig,
} from '../types/stadium';
import { sanitizeStadiumForCategory } from './stadiumConstraints';

export type StartingCityStreetId =
  | 'buenos_aires'
  | 'sao_paulo'
  | 'london'
  | 'madrid'
  | 'paris'
  | 'roma'
  | 'berlin'
  | 'lisboa'
  | 'riyadh';

interface StreetVenueBlueprint {
  cityId: StartingCityStreetId;
  id: string;
  slotNumber: number;
  name: string;
  shortName: string;
  city: string;
  country: string;
  countryAliases: string[];
  cityAliases: string[];
  primaryColor: string;
  secondaryColor: string;
  timeOfDay: TimeOfDay;
  pitchLengthMeters: number;
  pitchWidthMeters: number;
  apronMaterial: StadiumDefinition['apronMaterial'];
  surroundings: StadiumDefinition['surroundings'];
  streetConfig: StreetArenaConfig;
  description: string;
}

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

function createEmptyStreetStands(
  primaryColor: string,
  secondaryColor: string,
  hasGrassrootsFans: boolean
): Record<StandPosition, StandConfig> {
  const stands = {} as Record<StandPosition, StandConfig>;
  for (const pos of ALL_STAND_POSITIONS) {
    const isCorner = pos.startsWith('corner_');
    stands[pos] = {
      position: pos,
      type: 'none',
      ...(isCorner ? { cornerType: 'none' as const } : {}),
      tierCount: 1,
      tiers: [],
      primaryColor,
      secondaryColor,
      hasRoof: false,
      roofCoverage: 0,
      hasGrassrootsFans,
    };
  }
  return stands;
}

export const STREET_VENUE_BLUEPRINTS: StreetVenueBlueprint[] = [
  {
    cityId: 'buenos_aires',
    id: 'street_buenos_aires',
    slotNumber: 901,
    name: 'Potrero de Villa',
    shortName: 'Potrero Villa',
    city: 'Buenos Aires',
    country: 'Argentina',
    countryAliases: ['argentina', 'arg', 'ar'],
    cityAliases: ['buenos aires', 'buenosaires', 'ba', 'villa'],
    primaryColor: '#38bdf8',
    secondaryColor: '#f8fafc',
    timeOfDay: 'sunset',
    pitchLengthMeters: 44,
    pitchWidthMeters: 26,
    apronMaterial: 'gravel_ballast',
    surroundings: 'small_city',
    streetConfig: {
      archetype: 'potrero_dirt',
      surface: 'poor',
      perimeterWallStyle: 'corrugated_iron',
      courtMarkings: 'chalk_dust',
      goalStyle: 'crates_and_pipes',
      streetLighting: 'sodium_streetlamps',
      fenceCrowdMode: 'block_party_fence',
      urbanProps: ['parked_cars', 'laundry_lines', 'graffiti_murals', 'milk_crates'],
    },
    description:
      'Buenos Aires Villa potrero with rutted earth, corrugated tin and brick mural perimeter, chalk touchlines, parked sedans, laundry lines, and galvanized pipe goals.',
  },
  {
    cityId: 'sao_paulo',
    id: 'street_sao_paulo',
    slotNumber: 902,
    name: 'Quadra da Várzea',
    shortName: 'Quadra Várzea',
    city: 'São Paulo',
    country: 'Brazil',
    countryAliases: ['brazil', 'brasil', 'bra', 'br'],
    cityAliases: ['sao paulo', 'são paulo', 'saopaulo', 'sp'],
    primaryColor: '#16a34a',
    secondaryColor: '#facc15',
    timeOfDay: 'night',
    pitchLengthMeters: 42,
    pitchWidthMeters: 25,
    apronMaterial: 'concrete',
    surroundings: 'big_city',
    streetConfig: {
      archetype: 'favela_quadra',
      surface: 'concrete',
      perimeterWallStyle: 'graffiti_brick',
      courtMarkings: 'multisport_crossover',
      goalStyle: 'futsal_tubular',
      streetLighting: 'festoon_string_lights',
      fenceCrowdMode: 'block_party_fence',
      urbanProps: ['graffiti_murals', 'laundry_lines', 'corner_kiosk', 'milk_crates'],
    },
    description:
      'Tight São Paulo hillside concrete quadra ringed by painted brick & chainlink walls, yellow/white multisport lines, futsal tubular frames, and festoon block-party lights.',
  },
  {
    cityId: 'london',
    id: 'street_london',
    slotNumber: 903,
    name: 'South London Tarmac Cage',
    shortName: 'London Cage',
    city: 'London',
    country: 'England',
    countryAliases: ['england', 'eng', 'uk', 'gb', 'gb-eng', 'united kingdom'],
    cityAliases: ['london', 'south london', 'peckham', 'brixton'],
    primaryColor: '#dc2626',
    secondaryColor: '#e2e8f0',
    timeOfDay: 'night',
    pitchLengthMeters: 46,
    pitchWidthMeters: 28,
    apronMaterial: 'asphalt_paved',
    surroundings: 'big_city',
    streetConfig: {
      archetype: 'tarmac_cage',
      surface: 'synthetic',
      perimeterWallStyle: 'chainlink_cage',
      courtMarkings: 'spray_paint',
      goalStyle: 'chain_net_park',
      streetLighting: 'sodium_streetlamps',
      fenceCrowdMode: 'sparse_locals',
      urbanProps: ['parked_cars', 'graffiti_murals'],
    },
    description:
      'High-mesh South London estate astro cage bordered by brick tenements, parked cars, amber sodium lamps, spray-painted sidelines, and heavy chain-link park goals.',
  },
  {
    cityId: 'madrid',
    id: 'street_madrid',
    slotNumber: 904,
    name: 'Pista del Barrio',
    shortName: 'Pista Barrio',
    city: 'Madrid',
    country: 'Spain',
    countryAliases: ['spain', 'espana', 'españa', 'esp', 'es'],
    cityAliases: ['madrid', 'vallecas', 'barrio'],
    primaryColor: '#ef4444',
    secondaryColor: '#facc15',
    timeOfDay: 'noon',
    pitchLengthMeters: 44,
    pitchWidthMeters: 26,
    apronMaterial: 'concrete',
    surroundings: 'big_city',
    streetConfig: {
      archetype: 'courtyard_paving',
      surface: 'concrete',
      perimeterWallStyle: 'concrete_curb_wall',
      courtMarkings: 'multisport_crossover',
      goalStyle: 'futsal_tubular',
      streetLighting: 'daylight_only',
      fenceCrowdMode: 'sparse_locals',
      urbanProps: ['laundry_lines', 'corner_kiosk'],
    },
    description:
      'Sunlit Castilian apartment courtyard paving rink surrounded by concrete curb walls, overhead laundry lines, corner kiosk, multisport lines, and tubular futsal goals.',
  },
  {
    cityId: 'paris',
    id: 'street_paris',
    slotNumber: 905,
    name: 'Banlieue City Stade',
    shortName: 'City Stade',
    city: 'Paris',
    country: 'France',
    countryAliases: ['france', 'fr', 'fra'],
    cityAliases: ['paris', 'banlieue', 'saint-denis', 'st denis'],
    primaryColor: '#1d4ed8',
    secondaryColor: '#ef4444',
    timeOfDay: 'night',
    pitchLengthMeters: 46,
    pitchWidthMeters: 27,
    apronMaterial: 'artificial_turf',
    surroundings: 'big_city',
    streetConfig: {
      archetype: 'tarmac_cage',
      surface: 'synthetic',
      perimeterWallStyle: 'chainlink_cage',
      courtMarkings: 'spray_paint',
      goalStyle: 'futsal_tubular',
      streetLighting: 'single_flood_pole',
      fenceCrowdMode: 'block_party_fence',
      urbanProps: ['graffiti_murals', 'scooters'],
    },
    description:
      'Greater Paris banlieue city-stade enclosed in black steel cage mesh beneath a single bright flood pole, synthetic carpet, spray-paint lines, scooters, and mural walls.',
  },
  {
    cityId: 'roma',
    id: 'street_roma',
    slotNumber: 906,
    name: 'Campetto di Quartiere',
    shortName: 'Campetto',
    city: 'Roma',
    country: 'Italy',
    countryAliases: ['italy', 'italia', 'ita', 'it'],
    cityAliases: ['roma', 'rome', 'quartiere'],
    primaryColor: '#991b1b',
    secondaryColor: '#f59e0b',
    timeOfDay: 'sunset',
    pitchLengthMeters: 44,
    pitchWidthMeters: 26,
    apronMaterial: 'brick_pavers',
    surroundings: 'small_city',
    streetConfig: {
      archetype: 'courtyard_paving',
      surface: 'concrete',
      perimeterWallStyle: 'graffiti_brick',
      courtMarkings: 'spray_paint',
      goalStyle: 'painted_wall_posts',
      streetLighting: 'festoon_string_lights',
      fenceCrowdMode: 'sparse_locals',
      urbanProps: ['scooters', 'corner_kiosk', 'laundry_lines'],
    },
    description:
      'Golden-hour Roman piazza campetto with weathered ochre brick walls, painted goalposts against the stone, Vespas/scooters, neighborhood kiosk, and festoon lamps.',
  },
  {
    cityId: 'berlin',
    id: 'street_berlin',
    slotNumber: 907,
    name: 'Hinterhof Betonkäfig',
    shortName: 'Betonkäfig',
    city: 'Berlin',
    country: 'Germany',
    countryAliases: ['germany', 'deutschland', 'ger', 'deu', 'de'],
    cityAliases: ['berlin', 'kreuzberg', 'hinterhof'],
    primaryColor: '#334155',
    secondaryColor: '#38bdf8',
    timeOfDay: 'night',
    pitchLengthMeters: 45,
    pitchWidthMeters: 27,
    apronMaterial: 'concrete',
    surroundings: 'big_city',
    streetConfig: {
      archetype: 'rooftop_mesh',
      surface: 'concrete',
      perimeterWallStyle: 'chainlink_cage',
      courtMarkings: 'faded_tarmac',
      goalStyle: 'chain_net_park',
      streetLighting: 'sodium_streetlamps',
      fenceCrowdMode: 'sparse_locals',
      urbanProps: ['graffiti_murals', 'milk_crates'],
    },
    description:
      'Gritty Berlin Hinterhof concrete & rooftop mesh cage layered with heavy graffiti murals, faded tarmac boundaries, chain-net steel goals, and amber streetlamps.',
  },
  {
    cityId: 'lisboa',
    id: 'street_lisboa',
    slotNumber: 908,
    name: 'Recinto Ribeirinho',
    shortName: 'Ribeirinho',
    city: 'Lisboa',
    country: 'Portugal',
    countryAliases: ['portugal', 'por', 'prt', 'pt'],
    cityAliases: ['lisboa', 'lisbon', 'alfama', 'alcantara'],
    primaryColor: '#047857',
    secondaryColor: '#f8fafc',
    timeOfDay: 'sunset',
    pitchLengthMeters: 44,
    pitchWidthMeters: 26,
    apronMaterial: 'concrete',
    surroundings: 'beach',
    streetConfig: {
      archetype: 'coastal_boardwalk',
      surface: 'sand',
      perimeterWallStyle: 'timber_seawall',
      courtMarkings: 'chalk_dust',
      goalStyle: 'futsal_tubular',
      streetLighting: 'festoon_string_lights',
      fenceCrowdMode: 'sparse_locals',
      urbanProps: ['laundry_lines', 'corner_kiosk'],
    },
    description:
      'Tagus riverside sandy recinto bordered by weathered timber seawalls, tiled alley facades, laundry lines, chalk-dust markings, and compact futsal frames.',
  },
  {
    cityId: 'riyadh',
    id: 'street_riyadh',
    slotNumber: 909,
    name: 'Al-Malaz Sand Lot',
    shortName: 'Al-Malaz',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    countryAliases: ['saudi arabia', 'saudi', 'ksa', 'sau', 'sa'],
    cityAliases: ['riyadh', 'al-malaz', 'al malaz', 'malaz'],
    primaryColor: '#15803d',
    secondaryColor: '#f8fafc',
    timeOfDay: 'night',
    pitchLengthMeters: 48,
    pitchWidthMeters: 28,
    apronMaterial: 'gravel_ballast',
    surroundings: 'small_city',
    streetConfig: {
      archetype: 'desert_sand_lot',
      surface: 'sand',
      perimeterWallStyle: 'concrete_curb_wall',
      courtMarkings: 'chalk_dust',
      goalStyle: 'crates_and_pipes',
      streetLighting: 'sodium_streetlamps',
      fenceCrowdMode: 'block_party_fence',
      urbanProps: ['parked_cars', 'milk_crates'],
    },
    description:
      'Warm evening Al-Malaz desert sand lot under amber streetlamps, sandstone curb borders, chalk-drawn lines, parked sedans along the touchline, and pipe goals.',
  },
];

function buildStreetStadiumDefinition(bp: StreetVenueBlueprint): StadiumDefinition {
  const isDaylight = bp.streetConfig.streetLighting === 'daylight_only';
  const hasFans = bp.streetConfig.fenceCrowdMode !== 'none';
  const surfaceAsTurf: TurfQuality = bp.streetConfig.surface;

  return sanitizeStadiumForCategory({
    id: bp.id,
    slotNumber: bp.slotNumber,
    name: bp.name,
    shortName: bp.shortName,
    city: bp.city,
    country: bp.country,
    category: 'street',
    streetSurface: bp.streetConfig.surface,
    streetCityId: bp.cityId,
    streetConfig: {
      ...bp.streetConfig,
      urbanProps: [...bp.streetConfig.urbanProps],
    },
    isCasualYouthCrowd: true,
    disableEntryCinematic: true,
    shape: 'rectangular',
    surroundings: bp.surroundings,
    grounds: 'parking_lots',
    roof: {
      ...getDefaultRoofConfig('rectangular'),
      enabled: false,
      cutawayMode: 'hidden',
      coverage: 0,
    },
    roofCutaway: 'hidden',
    hasTrack: false,
    apronMaterial: bp.apronMaterial,
    apronSetback: 'compact',
    stands: createEmptyStreetStands(bp.primaryColor, bp.secondaryColor, hasFans),
    seats: {
      style: 'plastic_bench',
      pattern: 'solid',
      colors: [bp.primaryColor, bp.secondaryColor],
    },
    lighting: isDaylight
      ? {
          type: 'none',
          pylonCount: 0,
          powerKw: 0,
          timeOfDay: 'noon',
        }
      : {
          type: 'light_poles',
          pylonCount: bp.streetConfig.streetLighting === 'single_flood_pole' ? 1 : 4,
          powerKw: 350,
          timeOfDay: bp.timeOfDay,
        },
    dugouts: {
      type: 'folding_chairs',
      quality: 'municipal',
      frameColor: bp.primaryColor,
      cushionColor: bp.secondaryColor,
      shelterTint: 'rgba(15, 23, 42, 0.72)',
      setbackDistance: 4,
    },
    tunnel: {
      type: 'direct_portal',
      siting: 'behind_goal',
      primaryColor: bp.primaryColor,
      secondaryColor: bp.secondaryColor,
    },
    capacity: 0,
    fifaCategory: 'national',
    pitchPreset: 'compact',
    pitchLengthMeters: bp.pitchLengthMeters,
    pitchWidthMeters: bp.pitchWidthMeters,
    turfQuality: surfaceAsTurf,
    mowingPattern: 'plain',
    grassLength: 'short',
    surfaceStatus: 'normal',
    goalFrame: 'round_steel',
    netTension: 'soft',
    seatColor: 'concrete',
    timeOfDay: isDaylight ? 'noon' : bp.timeOfDay,
  });
}

export const GENERATED_STREET_STADIUMS: Record<string, StadiumDefinition> = {};
export const STREET_STADIUM_BY_CITY: Record<StartingCityStreetId, StadiumDefinition> = {} as Record<
  StartingCityStreetId,
  StadiumDefinition
>;

for (const bp of STREET_VENUE_BLUEPRINTS) {
  const stadium = buildStreetStadiumDefinition(bp);
  GENERATED_STREET_STADIUMS[stadium.id] = stadium;
  STREET_STADIUM_BY_CITY[bp.cityId] = stadium;
}

// Verify all STARTING_CITIES entries are represented
for (const cityMeta of STARTING_CITIES) {
  const id = cityMeta.id as StartingCityStreetId;
  if (!STREET_STADIUM_BY_CITY[id]) {
    const fallback = buildStreetStadiumDefinition({
      cityId: id,
      id: `street_${cityMeta.id}`,
      slotNumber: 900 + Object.keys(GENERATED_STREET_STADIUMS).length + 1,
      name: `${cityMeta.cityName} Street Cage`,
      shortName: `${cityMeta.cityName.slice(0, 10)} Cage`,
      city: cityMeta.cityName,
      country: cityMeta.countryName,
      countryAliases: [cityMeta.countryName.toLowerCase(), cityMeta.nationality.code.toLowerCase()],
      cityAliases: [cityMeta.cityName.toLowerCase(), cityMeta.id.toLowerCase()],
      primaryColor: '#f59e0b',
      secondaryColor: '#0f172a',
      timeOfDay: 'sunset',
      pitchLengthMeters: 45,
      pitchWidthMeters: 27,
      apronMaterial: 'asphalt_paved',
      surroundings: 'small_city',
      streetConfig: {
        archetype: 'tarmac_cage',
        surface: 'concrete',
        perimeterWallStyle: 'chainlink_cage',
        courtMarkings: 'spray_paint',
        goalStyle: 'futsal_tubular',
        streetLighting: 'sodium_streetlamps',
        fenceCrowdMode: 'sparse_locals',
        urbanProps: ['graffiti_murals', 'milk_crates'],
      },
      description: `${cityMeta.cityName} neighborhood street pitch.`,
    });
    GENERATED_STREET_STADIUMS[fallback.id] = fallback;
    STREET_STADIUM_BY_CITY[id] = fallback;
  }
}

function normalizeStreetKey(value?: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .trim();
}

export function resolveStreetStadiumForCity(cityIdOrName?: string): StadiumDefinition {
  const raw = (cityIdOrName || '').trim();
  if (raw && GENERATED_STREET_STADIUMS[raw]) {
    return GENERATED_STREET_STADIUMS[raw];
  }

  const norm = normalizeStreetKey(raw);
  if (!norm) {
    return STREET_STADIUM_BY_CITY.buenos_aires;
  }

  for (const bp of STREET_VENUE_BLUEPRINTS) {
    if (
      normalizeStreetKey(bp.cityId) === norm ||
      normalizeStreetKey(bp.id) === norm ||
      normalizeStreetKey(bp.name) === norm ||
      bp.cityAliases.some((a) => normalizeStreetKey(a) === norm)
    ) {
      return STREET_STADIUM_BY_CITY[bp.cityId];
    }
  }

  // Fallback check against STARTING_CITIES / country aliases
  for (const bp of STREET_VENUE_BLUEPRINTS) {
    if (
      bp.countryAliases.some((a) => normalizeStreetKey(a) === norm) ||
      bp.cityAliases.some((a) => norm.includes(normalizeStreetKey(a)))
    ) {
      return STREET_STADIUM_BY_CITY[bp.cityId];
    }
  }

  return STREET_STADIUM_BY_CITY.buenos_aires;
}
