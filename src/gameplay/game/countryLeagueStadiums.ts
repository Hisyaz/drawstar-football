import {
  StadiumDefinition,
  StandConfig,
  StandPosition,
  StadiumShape,
  SurroundingsType,
  RoofConfig,
  SeatStyle,
  BenchType,
  BenchQualityTier,
  TunnelType,
  ArchitecturalGrade,
  TierSize,
  TimeOfDay,
  calculateStadiumTotalCapacity,
  calculateFifaQualification,
} from '../types/stadium';
import { TurfQuality, LawnMowingPattern, StadiumTier } from '../types';
import { EditorTeamData } from '../../types/leagueEditor';
import { inferDivisionTierFromTeam, stableTeamHash } from '../../data/fictionalSponsors';

interface CountryStadiumSpec {
  id: string;
  slotNumber: number;
  name: string;
  shortName: string;
  city: string;
  country: string;
  countryCode: string;
  archetypeRole: 'flagship' | 'heritage' | 'regional';
  shape: StadiumShape;
  hasTrack: boolean;
  surroundings: SurroundingsType;
  standGrade: StandConfig['grade'];
  archGrade: ArchitecturalGrade;
  tierCount: 1 | 2 | 3 | 4;
  tier: StadiumTier;
  primaryColor: string;
  secondaryColor: string;
  roof: RoofConfig;
  seatStyle: SeatStyle;
  benchType: BenchType;
  benchQuality: BenchQualityTier;
  tunnelType: TunnelType;
  turfQuality: TurfQuality;
  mowingPattern: LawnMowingPattern;
  timeOfDay: TimeOfDay;
  pylonCount: 0 | 2 | 4 | 6;
  powerKw: number;
  hasVipZone?: boolean;
  hasVipSeats?: boolean;
  hasTransmissionArea?: boolean;
}

function buildStandsForSpec(spec: CountryStadiumSpec): Record<StandPosition, StandConfig> {
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
  const isRegional = spec.archetypeRole === 'regional';
  const isFlagship = spec.archetypeRole === 'flagship';

  for (const pos of positions) {
    const isCorner = pos.startsWith('corner_');
    if (isRegional && isCorner) {
      stands[pos] = {
        position: pos,
        type: 'none',
        grade: spec.standGrade,
        backdrop: 'wall',
        primaryColor: spec.primaryColor,
        secondaryColor: spec.secondaryColor,
        hasRoof: false,
        roofCoverage: 0,
      };
      continue;
    }

    const standTiers = isCorner
      ? Math.max(1, spec.tierCount - 1)
      : spec.tierCount;

    const tierSize: TierSize = isFlagship
      ? isCorner
        ? 'medium'
        : 'large'
      : spec.archetypeRole === 'heritage'
      ? isCorner
        ? 'small'
        : 'medium'
      : 'small';

    stands[pos] = {
      position: pos,
      type: 'tiered',
      grade: spec.standGrade,
      tierCount: Math.min(4, standTiers) as 1 | 2 | 3 | 4,
      tiers: Array.from({ length: standTiers }, () => ({ size: tierSize })),
      primaryColor: spec.primaryColor,
      secondaryColor: spec.secondaryColor,
      hasRoof: isRegional ? pos === 'west' || pos === 'east' : true,
      roofCoverage: isFlagship ? 0.9 : spec.archetypeRole === 'heritage' ? 0.78 : pos === 'west' || pos === 'east' ? 0.6 : 0,
    };
  }
  return stands;
}

function buildCountryStadium(spec: CountryStadiumSpec): StadiumDefinition {
  const stands = buildStandsForSpec(spec);
  const capacity = calculateStadiumTotalCapacity(stands, spec.shape);
  const lightingType =
    spec.archetypeRole === 'flagship'
      ? 'roof_banks'
      : spec.archetypeRole === 'heritage'
      ? 'corner_pylons'
      : 'light_poles';

  return {
    id: spec.id,
    slotNumber: spec.slotNumber,
    name: spec.name,
    shortName: spec.shortName,
    city: spec.city,
    country: spec.country,
    shape: spec.shape,
    surroundings: spec.surroundings,
    grounds: 'parking_lots',
    roof: spec.roof,
    roofCutaway: 'partial',
    hasTrack: spec.hasTrack,
    apronMaterial: spec.hasTrack ? 'rubber_tartan' : spec.archetypeRole === 'flagship' ? 'artificial_turf' : 'grass',
    apronSetback: spec.hasTrack ? 'expansive' : spec.archetypeRole === 'flagship' ? 'standard' : 'compact',
    stands,
    seats: {
      style: spec.seatStyle,
      pattern: spec.archetypeRole === 'flagship' ? 'horizontalBands' : spec.archetypeRole === 'heritage' ? 'verticalStripes' : 'solid',
      colors: [spec.primaryColor, spec.secondaryColor, '#e2e8f0'],
    },
    lighting: {
      type: lightingType,
      pylonCount: spec.pylonCount,
      powerKw: spec.powerKw,
      timeOfDay: spec.timeOfDay,
    },
    dugouts: {
      type: spec.benchType,
      quality: spec.benchQuality,
      frameColor: spec.primaryColor,
      cushionColor: spec.secondaryColor,
      shelterTint: 'rgba(15, 23, 42, 0.85)',
      setbackDistance: spec.archetypeRole === 'flagship' ? 14 : 11,
    },
    tunnel: {
      type: spec.tunnelType,
      siting: 'center_main',
      primaryColor: spec.primaryColor,
      secondaryColor: spec.secondaryColor,
      backlitLeds: spec.archetypeRole === 'flagship',
      hasBellows: spec.tunnelType === 'inflatable_accordion',
    },
    capacity,
    fifaCategory: calculateFifaQualification(capacity, spec.standGrade, spec.powerKw, spec.turfQuality),
    tier: spec.tier,
    architecturalGrade: spec.archGrade,
    pitchPreset: 'balanced',
    pitchLengthMeters: 105,
    pitchWidthMeters: 68,
    turfQuality: spec.turfQuality,
    mowingPattern: spec.mowingPattern,
    grassLength: spec.archetypeRole === 'flagship' ? 'short' : 'normal',
    surfaceStatus: 'normal',
    goalFrame: 'standard',
    netTension: 'moderate',
    seatColor: 'auto',
    hasTransmissionArea: spec.hasTransmissionArea ?? spec.archetypeRole !== 'regional',
    hasVipZone: spec.hasVipZone ?? spec.archetypeRole === 'flagship',
    hasVipSeats: spec.hasVipSeats ?? spec.archetypeRole !== 'regional',
  };
}

/**
 * 3 Stadium Types per Existing League Country (9 League Countries × 3 = 27 Stadiums)
 * Strictly 1 set of 3 per country (no extra sets created for 2nd divisions).
 * Slots #010 .. #036
 */
const COUNTRY_STADIUM_SPECS: CountryStadiumSpec[] = [
  // ENG (England) — #010, #011, #012
  {
    id: 'eng_premier_bowl',
    slotNumber: 10,
    name: 'Albion Crown Arena',
    shortName: 'Albion Crown',
    city: 'London',
    country: 'England',
    countryCode: 'ENG',
    archetypeRole: 'flagship',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade4_modern',
    archGrade: 'modern',
    tierCount: 3,
    tier: 'monumental',
    primaryColor: '#1d4ed8',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'tensile_cable', material: 'etfe_cushion', border: 'led_halo_ribbon', cutawayMode: 'partial', coverage: 0.72 },
    seatStyle: 'tip_up_padded',
    benchType: 'recaro_racing',
    benchQuality: 'elite_vip',
    tunnelType: 'modern_architectural',
    turfQuality: 'pristine',
    mowingPattern: 'european_boxes',
    timeOfDay: 'night',
    pylonCount: 0,
    powerKw: 2600,
  },
  {
    id: 'eng_heritage_park',
    slotNumber: 11,
    name: 'Blackburn Brickworks Ground',
    shortName: 'Brickworks',
    city: 'Manchester',
    country: 'England',
    countryCode: 'ENG',
    archetypeRole: 'heritage',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'small_city',
    standGrade: 'grade2_classic',
    archGrade: 'victorian',
    tierCount: 2,
    tier: 'craven',
    primaryColor: '#b91c1c',
    secondaryColor: '#f8fafc',
    roof: { enabled: true, style: 'gable_peak', material: 'corrugated_steel', border: 'painted_club_fascia', cutawayMode: 'partial', coverage: 0.65 },
    seatStyle: 'classic_bucket',
    benchType: 'classic_timber',
    benchQuality: 'classic',
    tunnelType: 'direct_portal',
    turfQuality: 'pristine',
    mowingPattern: 'horizontal',
    timeOfDay: 'sunset',
    pylonCount: 4,
    powerKw: 1500,
  },
  {
    id: 'eng_county_ground',
    slotNumber: 12,
    name: 'Midlands County Park',
    shortName: 'County Park',
    city: 'Derby',
    country: 'England',
    countryCode: 'ENG',
    archetypeRole: 'regional',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'small_city',
    standGrade: 'grade2_classic',
    archGrade: 'brutalist',
    tierCount: 1,
    tier: 'ascenso',
    primaryColor: '#334155',
    secondaryColor: '#e2e8f0',
    roof: { enabled: true, style: 'cantilever_truss', material: 'corrugated_steel', border: 'gunmetal_box_girder', cutawayMode: 'partial', coverage: 0.5 },
    seatStyle: 'plastic_bench',
    benchType: 'utilitarian_concrete',
    benchQuality: 'municipal',
    tunnelType: 'subterranean_staircase',
    turfQuality: 'normal',
    mowingPattern: 'horizontal',
    timeOfDay: 'noon',
    pylonCount: 4,
    powerKw: 950,
  },

  // ESP (Spain) — #013, #014, #015
  {
    id: 'esp_iberica_dome',
    slotNumber: 13,
    name: 'Estadio Ibérico Real',
    shortName: 'Ibérico Real',
    city: 'Madrid',
    country: 'Spain',
    countryCode: 'ESP',
    archetypeRole: 'flagship',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade5_futuristic',
    archGrade: 'modern',
    tierCount: 3,
    tier: 'monumental',
    primaryColor: '#0f172a',
    secondaryColor: '#facc15',
    roof: { enabled: true, style: 'spaceframe_halo', material: 'anodized_aluminum', border: 'led_halo_ribbon', cutawayMode: 'partial', coverage: 0.78 },
    seatStyle: 'tip_up_padded',
    benchType: 'recaro_racing',
    benchQuality: 'luxury',
    tunnelType: 'modern_architectural',
    turfQuality: 'pristine',
    mowingPattern: 'checkerboard',
    timeOfDay: 'night',
    pylonCount: 0,
    powerKw: 2800,
  },
  {
    id: 'esp_sol_mestalla',
    slotNumber: 14,
    name: 'Estadio Sol y Mar',
    shortName: 'Sol y Mar',
    city: 'Valencia',
    country: 'Spain',
    countryCode: 'ESP',
    archetypeRole: 'heritage',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade3_industrial',
    archGrade: 'industrial',
    tierCount: 2,
    tier: 'craven',
    primaryColor: '#ea580c',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'barrel_vault', material: 'corrugated_steel', border: 'painted_club_fascia', cutawayMode: 'partial', coverage: 0.6 },
    seatStyle: 'classic_bucket',
    benchType: 'covered_sunken',
    benchQuality: 'modern',
    tunnelType: 'telescopic_canopy',
    turfQuality: 'pristine',
    mowingPattern: 'vertical',
    timeOfDay: 'night',
    pylonCount: 4,
    powerKw: 1700,
  },
  {
    id: 'esp_provincial_campo',
    slotNumber: 15,
    name: 'Campo Municipal Castilla',
    shortName: 'Castilla',
    city: 'Valladolid',
    country: 'Spain',
    countryCode: 'ESP',
    archetypeRole: 'regional',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'small_city',
    standGrade: 'grade1_municipal',
    archGrade: 'municipal',
    tierCount: 1,
    tier: 'ascenso',
    primaryColor: '#6d28d9',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'cantilever_truss', material: 'precast_concrete', border: 'gunmetal_box_girder', cutawayMode: 'partial', coverage: 0.45 },
    seatStyle: 'plastic_bench',
    benchType: 'utilitarian_concrete',
    benchQuality: 'municipal',
    tunnelType: 'subterranean_staircase',
    turfQuality: 'normal',
    mowingPattern: 'horizontal',
    timeOfDay: 'sunset',
    pylonCount: 4,
    powerKw: 900,
  },

  // ITA (Italy) — #016, #017, #018
  {
    id: 'ita_colosseo_moderno',
    slotNumber: 16,
    name: 'Stadio Olimpia Nuova',
    shortName: 'Olimpia Nuova',
    city: 'Milan',
    country: 'Italy',
    countryCode: 'ITA',
    archetypeRole: 'flagship',
    shape: 'oval',
    hasTrack: true,
    surroundings: 'big_city',
    standGrade: 'grade4_modern',
    archGrade: 'modern',
    tierCount: 3,
    tier: 'monumental',
    primaryColor: '#1e3a8a',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'continuous_cantilever_ring', material: 'ptfe_fabric', border: 'video_halo_board', cutawayMode: 'partial', coverage: 0.65 },
    seatStyle: 'tip_up_padded',
    benchType: 'recaro_racing',
    benchQuality: 'elite_vip',
    tunnelType: 'modern_architectural',
    turfQuality: 'pristine',
    mowingPattern: 'european_boxes',
    timeOfDay: 'night',
    pylonCount: 0,
    powerKw: 2400,
  },
  {
    id: 'ita_san_classico',
    slotNumber: 17,
    name: 'Stadio San Vittore',
    shortName: 'San Vittore',
    city: 'Turin',
    country: 'Italy',
    countryCode: 'ITA',
    archetypeRole: 'heritage',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade3_industrial',
    archGrade: 'brutalist',
    tierCount: 2,
    tier: 'craven',
    primaryColor: '#7f1d1d',
    secondaryColor: '#f8fafc',
    roof: { enabled: true, style: 'barrel_vault', material: 'precast_concrete', border: 'copper_stone_coping', cutawayMode: 'partial', coverage: 0.58 },
    seatStyle: 'classic_bucket',
    benchType: 'covered_sunken',
    benchQuality: 'classic',
    tunnelType: 'direct_portal',
    turfQuality: 'normal',
    mowingPattern: 'vertical',
    timeOfDay: 'night',
    pylonCount: 4,
    powerKw: 1550,
  },
  {
    id: 'ita_comunale_campo',
    slotNumber: 18,
    name: 'Stadio Comunale Vecchio',
    shortName: 'Comunale',
    city: 'Parma',
    country: 'Italy',
    countryCode: 'ITA',
    archetypeRole: 'regional',
    shape: 'oval',
    hasTrack: true,
    surroundings: 'small_city',
    standGrade: 'grade2_classic',
    archGrade: 'brutalist',
    tierCount: 1,
    tier: 'ascenso',
    primaryColor: '#0369a1',
    secondaryColor: '#facc15',
    roof: { enabled: true, style: 'continuous_cantilever_ring', material: 'galvanized_plate', border: 'compression_box_ring', cutawayMode: 'partial', coverage: 0.35 },
    seatStyle: 'plastic_bench',
    benchType: 'concrete_dugout',
    benchQuality: 'municipal',
    tunnelType: 'subterranean_staircase',
    turfQuality: 'normal',
    mowingPattern: 'horizontal',
    timeOfDay: 'noon',
    pylonCount: 4,
    powerKw: 850,
  },

  // GER (Germany) — #019, #020, #021
  {
    id: 'ger_bundes_arena',
    slotNumber: 19,
    name: 'Rheinland Super-Arena',
    shortName: 'Rheinland',
    city: 'Munich',
    country: 'Germany',
    countryCode: 'GER',
    archetypeRole: 'flagship',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade5_futuristic',
    archGrade: 'modern',
    tierCount: 3,
    tier: 'monumental',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'spaceframe_halo', material: 'etfe_cushion', border: 'led_halo_ribbon', cutawayMode: 'partial', coverage: 0.8 },
    seatStyle: 'vip_leather',
    benchType: 'recaro_racing',
    benchQuality: 'luxury',
    tunnelType: 'modern_architectural',
    turfQuality: 'pristine',
    mowingPattern: 'diagonal_diamonds',
    timeOfDay: 'night',
    pylonCount: 0,
    powerKw: 2900,
  },
  {
    id: 'ger_ruhr_stadion',
    slotNumber: 20,
    name: 'Ruhrpott Kessel',
    shortName: 'Ruhrpott',
    city: 'Dortmund',
    country: 'Germany',
    countryCode: 'GER',
    archetypeRole: 'heritage',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade3_steel_cantilever',
    archGrade: 'industrial',
    tierCount: 2,
    tier: 'monumental',
    primaryColor: '#eab308',
    secondaryColor: '#090d16',
    roof: { enabled: true, style: 'cantilever_truss', material: 'corrugated_steel', border: 'gunmetal_box_girder', cutawayMode: 'partial', coverage: 0.72 },
    seatStyle: 'classic_bucket',
    benchType: 'recaro_racing',
    benchQuality: 'modern',
    tunnelType: 'telescopic_canopy',
    turfQuality: 'pristine',
    mowingPattern: 'european_boxes',
    timeOfDay: 'night',
    pylonCount: 4,
    powerKw: 1850,
  },
  {
    id: 'ger_volkspark_platz',
    slotNumber: 21,
    name: 'Volkspark Sportplatz',
    shortName: 'Volkspark',
    city: 'Hanover',
    country: 'Germany',
    countryCode: 'GER',
    archetypeRole: 'regional',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'forest',
    standGrade: 'grade2_classic',
    archGrade: 'industrial',
    tierCount: 1,
    tier: 'ascenso',
    primaryColor: '#14532d',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'cantilever_truss', material: 'corrugated_steel', border: 'painted_club_fascia', cutawayMode: 'partial', coverage: 0.5 },
    seatStyle: 'plastic_bench',
    benchType: 'utilitarian_concrete',
    benchQuality: 'municipal',
    tunnelType: 'direct_portal',
    turfQuality: 'normal',
    mowingPattern: 'horizontal',
    timeOfDay: 'noon',
    pylonCount: 4,
    powerKw: 1000,
  },

  // FR (France) — #022, #023, #024
  {
    id: 'fr_etoile_stade',
    slotNumber: 22,
    name: "Stade de l'Étoile",
    shortName: "L'Étoile",
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
    archetypeRole: 'flagship',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade4_modern',
    archGrade: 'modern',
    tierCount: 3,
    tier: 'monumental',
    primaryColor: '#1e3a8a',
    secondaryColor: '#ef4444',
    roof: { enabled: true, style: 'barrel_vault', material: 'anodized_aluminum', border: 'led_halo_ribbon', cutawayMode: 'partial', coverage: 0.72 },
    seatStyle: 'tip_up_padded',
    benchType: 'recaro_racing',
    benchQuality: 'elite_vip',
    tunnelType: 'modern_architectural',
    turfQuality: 'pristine',
    mowingPattern: 'checkerboard',
    timeOfDay: 'night',
    pylonCount: 0,
    powerKw: 2500,
  },
  {
    id: 'fr_azur_velodrome',
    slotNumber: 23,
    name: 'Stade Vélodrome du Sud',
    shortName: 'Vélodrome Sud',
    city: 'Marseille',
    country: 'France',
    countryCode: 'FR',
    archetypeRole: 'heritage',
    shape: 'oval',
    hasTrack: true,
    surroundings: 'beach',
    standGrade: 'grade3_industrial',
    archGrade: 'industrial',
    tierCount: 2,
    tier: 'craven',
    primaryColor: '#0284c7',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'spoke_wheel_tension', material: 'ptfe_fabric', border: 'glow_led_ribbon', cutawayMode: 'partial', coverage: 0.6 },
    seatStyle: 'classic_bucket',
    benchType: 'covered_sunken',
    benchQuality: 'modern',
    tunnelType: 'telescopic_canopy',
    turfQuality: 'pristine',
    mowingPattern: 'vertical',
    timeOfDay: 'sunset',
    pylonCount: 4,
    powerKw: 1650,
  },
  {
    id: 'fr_municipal_stade',
    slotNumber: 24,
    name: 'Stade Municipal du Nord',
    shortName: 'Municipal Nord',
    city: 'Reims',
    country: 'France',
    countryCode: 'FR',
    archetypeRole: 'regional',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'small_city',
    standGrade: 'grade1_municipal',
    archGrade: 'municipal',
    tierCount: 1,
    tier: 'ascenso',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'cantilever_truss', material: 'corrugated_steel', border: 'gunmetal_box_girder', cutawayMode: 'partial', coverage: 0.45 },
    seatStyle: 'plastic_bench',
    benchType: 'folding_chairs',
    benchQuality: 'municipal',
    tunnelType: 'direct_portal',
    turfQuality: 'normal',
    mowingPattern: 'horizontal',
    timeOfDay: 'noon',
    pylonCount: 4,
    powerKw: 850,
  },

  // ARG (Argentina) — #025, #026, #027
  {
    id: 'arg_monumental_bowl',
    slotNumber: 25,
    name: 'Coliseo del Plata',
    shortName: 'Coliseo Plata',
    city: 'Buenos Aires',
    country: 'Argentina',
    countryCode: 'ARG',
    archetypeRole: 'flagship',
    shape: 'oval',
    hasTrack: true,
    surroundings: 'big_city',
    standGrade: 'grade4_modern',
    archGrade: 'modern',
    tierCount: 3,
    tier: 'monumental',
    primaryColor: '#0284c7',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'continuous_cantilever_ring', material: 'ptfe_fabric', border: 'video_halo_board', cutawayMode: 'partial', coverage: 0.52 },
    seatStyle: 'tip_up_padded',
    benchType: 'covered_sunken',
    benchQuality: 'luxury',
    tunnelType: 'inflatable_accordion',
    turfQuality: 'pristine',
    mowingPattern: 'european_boxes',
    timeOfDay: 'night',
    pylonCount: 4,
    powerKw: 2300,
  },
  {
    id: 'arg_caldera_sur',
    slotNumber: 26,
    name: 'La Caldera del Sur',
    shortName: 'Caldera Sur',
    city: 'Avellaneda',
    country: 'Argentina',
    countryCode: 'ARG',
    archetypeRole: 'heritage',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade3_industrial',
    archGrade: 'brutalist',
    tierCount: 2,
    tier: 'craven',
    primaryColor: '#b91c1c',
    secondaryColor: '#facc15',
    roof: { enabled: true, style: 'cantilever_truss', material: 'precast_concrete', border: 'painted_club_fascia', cutawayMode: 'partial', coverage: 0.5 },
    seatStyle: 'classic_bucket',
    benchType: 'concrete_dugout',
    benchQuality: 'classic',
    tunnelType: 'inflatable_accordion',
    turfQuality: 'normal',
    mowingPattern: 'vertical',
    timeOfDay: 'night',
    pylonCount: 4,
    powerKw: 1450,
  },
  {
    id: 'arg_barrio_cancha',
    slotNumber: 27,
    name: 'Cancha Municipal Pampeana',
    shortName: 'Pampeana',
    city: 'Córdoba',
    country: 'Argentina',
    countryCode: 'ARG',
    archetypeRole: 'regional',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'small_city',
    standGrade: 'grade1_municipal',
    archGrade: 'municipal',
    tierCount: 1,
    tier: 'ascenso',
    primaryColor: '#16a34a',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'cantilever_truss', material: 'corrugated_steel', border: 'gunmetal_box_girder', cutawayMode: 'partial', coverage: 0.35 },
    seatStyle: 'plastic_bench',
    benchType: 'utilitarian_concrete',
    benchQuality: 'municipal',
    tunnelType: 'subterranean_staircase',
    turfQuality: 'normal',
    mowingPattern: 'plain',
    timeOfDay: 'noon',
    pylonCount: 4,
    powerKw: 750,
  },

  // BRA (Brazil) — #028, #029, #030
  {
    id: 'bra_maracana_imperial',
    slotNumber: 28,
    name: 'Arena Imperial do Brasil',
    shortName: 'Imperial BR',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    countryCode: 'BRA',
    archetypeRole: 'flagship',
    shape: 'oval',
    hasTrack: true,
    surroundings: 'big_city',
    standGrade: 'grade4_modern',
    archGrade: 'modern',
    tierCount: 3,
    tier: 'monumental',
    primaryColor: '#15803d',
    secondaryColor: '#facc15',
    roof: { enabled: true, style: 'spoke_wheel_tension', material: 'ptfe_fabric', border: 'video_halo_board', cutawayMode: 'partial', coverage: 0.72 },
    seatStyle: 'tip_up_padded',
    benchType: 'recaro_racing',
    benchQuality: 'elite_vip',
    tunnelType: 'telescopic_canopy',
    turfQuality: 'pristine',
    mowingPattern: 'checkerboard',
    timeOfDay: 'night',
    pylonCount: 0,
    powerKw: 2450,
  },
  {
    id: 'bra_paulista_caldeirao',
    slotNumber: 29,
    name: 'Caldeirão Paulista',
    shortName: 'Paulista',
    city: 'São Paulo',
    country: 'Brazil',
    countryCode: 'BRA',
    archetypeRole: 'heritage',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade3_industrial',
    archGrade: 'industrial',
    tierCount: 2,
    tier: 'craven',
    primaryColor: '#991b1b',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'barrel_vault', material: 'corrugated_steel', border: 'painted_club_fascia', cutawayMode: 'partial', coverage: 0.6 },
    seatStyle: 'classic_bucket',
    benchType: 'covered_sunken',
    benchQuality: 'modern',
    tunnelType: 'inflatable_accordion',
    turfQuality: 'pristine',
    mowingPattern: 'horizontal',
    timeOfDay: 'night',
    pylonCount: 4,
    powerKw: 1600,
  },
  {
    id: 'bra_estadual_estadio',
    slotNumber: 30,
    name: 'Estádio Estadual do Interior',
    shortName: 'Estádio Int.',
    city: 'Campinas',
    country: 'Brazil',
    countryCode: 'BRA',
    archetypeRole: 'regional',
    shape: 'oval',
    hasTrack: true,
    surroundings: 'small_city',
    standGrade: 'grade2_classic',
    archGrade: 'brutalist',
    tierCount: 1,
    tier: 'ascenso',
    primaryColor: '#166534',
    secondaryColor: '#fde047',
    roof: { enabled: true, style: 'radial_louvered_pergola', material: 'galvanized_plate', border: 'compression_box_ring', cutawayMode: 'partial', coverage: 0.35 },
    seatStyle: 'plastic_bench',
    benchType: 'concrete_dugout',
    benchQuality: 'municipal',
    tunnelType: 'subterranean_staircase',
    turfQuality: 'normal',
    mowingPattern: 'horizontal',
    timeOfDay: 'noon',
    pylonCount: 4,
    powerKw: 880,
  },

  // POR (Portugal) — #031, #032, #033
  {
    id: 'por_luz_atlantica',
    slotNumber: 31,
    name: 'Estádio Luz Atlântica',
    shortName: 'Luz Atlântica',
    city: 'Lisbon',
    country: 'Portugal',
    countryCode: 'POR',
    archetypeRole: 'flagship',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade4_modern',
    archGrade: 'modern',
    tierCount: 3,
    tier: 'monumental',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'barrel_vault', material: 'etfe_cushion', border: 'led_halo_ribbon', cutawayMode: 'partial', coverage: 0.74 },
    seatStyle: 'tip_up_padded',
    benchType: 'recaro_racing',
    benchQuality: 'elite_vip',
    tunnelType: 'modern_architectural',
    turfQuality: 'pristine',
    mowingPattern: 'european_boxes',
    timeOfDay: 'night',
    pylonCount: 0,
    powerKw: 2400,
  },
  {
    id: 'por_dragao_pedreira',
    slotNumber: 32,
    name: 'Estádio da Pedreira',
    shortName: 'Pedreira',
    city: 'Porto',
    country: 'Portugal',
    countryCode: 'POR',
    archetypeRole: 'heritage',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'mountains',
    standGrade: 'grade3_industrial',
    archGrade: 'brutalist',
    tierCount: 2,
    tier: 'craven',
    primaryColor: '#1d4ed8',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'tensile_cable', material: 'anodized_aluminum', border: 'gunmetal_box_girder', cutawayMode: 'partial', coverage: 0.65 },
    seatStyle: 'classic_bucket',
    benchType: 'covered_sunken',
    benchQuality: 'modern',
    tunnelType: 'telescopic_canopy',
    turfQuality: 'pristine',
    mowingPattern: 'vertical',
    timeOfDay: 'sunset',
    pylonCount: 4,
    powerKw: 1550,
  },
  {
    id: 'por_concelho_parque',
    slotNumber: 33,
    name: 'Parque Municipal do Minho',
    shortName: 'Parque Minho',
    city: 'Braga',
    country: 'Portugal',
    countryCode: 'POR',
    archetypeRole: 'regional',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'small_city',
    standGrade: 'grade1_municipal',
    archGrade: 'municipal',
    tierCount: 1,
    tier: 'ascenso',
    primaryColor: '#047857',
    secondaryColor: '#facc15',
    roof: { enabled: true, style: 'cantilever_truss', material: 'corrugated_steel', border: 'painted_club_fascia', cutawayMode: 'partial', coverage: 0.45 },
    seatStyle: 'plastic_bench',
    benchType: 'utilitarian_concrete',
    benchQuality: 'municipal',
    tunnelType: 'direct_portal',
    turfQuality: 'normal',
    mowingPattern: 'horizontal',
    timeOfDay: 'noon',
    pylonCount: 4,
    powerKw: 850,
  },

  // KSA (Saudi Arabia) — #034, #035, #036
  {
    id: 'ksa_kingdom_pearl',
    slotNumber: 34,
    name: 'Pearl of Najd Arena',
    shortName: 'Pearl Najd',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    countryCode: 'KSA',
    archetypeRole: 'flagship',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'big_city',
    standGrade: 'grade5_futuristic',
    archGrade: 'modern',
    tierCount: 3,
    tier: 'monumental',
    primaryColor: '#047857',
    secondaryColor: '#facc15',
    roof: { enabled: true, style: 'spaceframe_halo', material: 'anodized_aluminum', border: 'led_halo_ribbon', cutawayMode: 'partial', coverage: 0.85 },
    seatStyle: 'vip_leather',
    benchType: 'recaro_racing',
    benchQuality: 'luxury',
    tunnelType: 'modern_architectural',
    turfQuality: 'pristine',
    mowingPattern: 'diagonal_diamonds',
    timeOfDay: 'night',
    pylonCount: 0,
    powerKw: 2950,
  },
  {
    id: 'ksa_red_sea_crown',
    slotNumber: 35,
    name: 'Red Sea Oasis Stadium',
    shortName: 'Red Sea Oasis',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    countryCode: 'KSA',
    archetypeRole: 'heritage',
    shape: 'oval',
    hasTrack: true,
    surroundings: 'beach',
    standGrade: 'grade4_modern',
    archGrade: 'modern',
    tierCount: 2,
    tier: 'craven',
    primaryColor: '#0f766e',
    secondaryColor: '#ffffff',
    roof: { enabled: true, style: 'petal_ocular_halo', material: 'ptfe_fabric', border: 'glow_led_ribbon', cutawayMode: 'partial', coverage: 0.7 },
    seatStyle: 'tip_up_padded',
    benchType: 'recaro_racing',
    benchQuality: 'modern',
    tunnelType: 'telescopic_canopy',
    turfQuality: 'pristine',
    mowingPattern: 'european_boxes',
    timeOfDay: 'night',
    pylonCount: 4,
    powerKw: 1950,
  },
  {
    id: 'ksa_desert_citadel',
    slotNumber: 36,
    name: 'Al-Qasr Regional Ground',
    shortName: 'Al-Qasr',
    city: 'Dammam',
    country: 'Saudi Arabia',
    countryCode: 'KSA',
    archetypeRole: 'regional',
    shape: 'rectangular',
    hasTrack: false,
    surroundings: 'savannah',
    standGrade: 'grade2_classic',
    archGrade: 'brutalist',
    tierCount: 1,
    tier: 'ascenso',
    primaryColor: '#15803d',
    secondaryColor: '#f8fafc',
    roof: { enabled: true, style: 'cantilever_truss', material: 'precast_concrete', border: 'gunmetal_box_girder', cutawayMode: 'partial', coverage: 0.45 },
    seatStyle: 'classic_bucket',
    benchType: 'concrete_dugout',
    benchQuality: 'municipal',
    tunnelType: 'subterranean_staircase',
    turfQuality: 'normal',
    mowingPattern: 'horizontal',
    timeOfDay: 'sunset',
    pylonCount: 4,
    powerKw: 950,
  },
];

export const GENERATED_COUNTRY_STADIUMS: Record<string, StadiumDefinition> = Object.fromEntries(
  COUNTRY_STADIUM_SPECS.map((spec) => [spec.id, buildCountryStadium(spec)])
);

/**
 * Exactly 3 stadium IDs per existing league country [flagship, heritage, regional]
 */
export const COUNTRY_LEAGUE_STADIUM_IDS: Record<string, [string, string, string]> = {
  ENG: ['eng_premier_bowl', 'eng_heritage_park', 'eng_county_ground'],
  ESP: ['esp_iberica_dome', 'esp_sol_mestalla', 'esp_provincial_campo'],
  ITA: ['ita_colosseo_moderno', 'ita_san_classico', 'ita_comunale_campo'],
  GER: ['ger_bundes_arena', 'ger_ruhr_stadion', 'ger_volkspark_platz'],
  FR: ['fr_etoile_stade', 'fr_azur_velodrome', 'fr_municipal_stade'],
  ARG: ['arg_monumental_bowl', 'arg_caldera_sur', 'arg_barrio_cancha'],
  BRA: ['bra_maracana_imperial', 'bra_paulista_caldeirao', 'bra_estadual_estadio'],
  POR: ['por_luz_atlantica', 'por_dragao_pedreira', 'por_concelho_parque'],
  KSA: ['ksa_kingdom_pearl', 'ksa_red_sea_crown', 'ksa_desert_citadel'],
};

export function normalizeLeagueCountryCode(countryCodeOrName?: string): string {
  const raw = (countryCodeOrName || '').trim().toUpperCase();
  if (raw === 'ENG' || raw === 'EN' || raw === 'UK' || raw === 'GB' || raw.includes('ENGLAND')) return 'ENG';
  if (raw === 'ESP' || raw === 'ES' || raw.includes('SPAIN')) return 'ESP';
  if (raw === 'ITA' || raw === 'IT' || raw.includes('ITALY')) return 'ITA';
  if (raw === 'GER' || raw === 'DE' || raw.includes('GERMANY')) return 'GER';
  if (raw === 'FR' || raw === 'FRA' || raw.includes('FRANCE')) return 'FR';
  if (raw === 'ARG' || raw === 'AR' || raw.includes('ARGENTINA')) return 'ARG';
  if (raw === 'BRA' || raw === 'BR' || raw.includes('BRAZIL')) return 'BRA';
  if (raw === 'POR' || raw === 'PT' || raw.includes('PORTUGAL')) return 'POR';
  if (raw === 'KSA' || raw === 'SAU' || raw === 'SA' || raw.includes('SAUDI')) return 'KSA';
  return 'OTHERS';
}

export function getCountryStadiumTriple(countryCodeOrName?: string): [string, string, string] | null {
  const cc = normalizeLeagueCountryCode(countryCodeOrName);
  return COUNTRY_LEAGUE_STADIUM_IDS[cc] || null;
}

/**
 * Assigns each league team one of its country's 3 stadiums as home:
 * - Bigger / flagship D1 teams -> triple[0] (Flagship Arena)
 * - Mid / heritage D1 & top ex-D1 D2 teams -> triple[1] (Classic Heritage Ground)
 * - Smaller D1, most D2, youth, state_only -> triple[2] (Regional / Municipal Ground)
 */
export function getAssignedCountryStadiumIdForTeam(
  team: Partial<EditorTeamData> & { id?: string; name?: string; countryCode?: string; countryName?: string },
  explicitDivisionTier?: string
): string {
  const triple =
    getCountryStadiumTriple(team.countryCode) ||
    getCountryStadiumTriple(team.countryName);

  const divTier = inferDivisionTierFromTeam(team, explicitDivisionTier);
  const rep = team.reputation ?? team.overallRating ?? team.ovr ?? 70;
  const capacity = team.stadium?.capacity ?? 0;
  const hash = stableTeamHash(`${team.id || ''}:${team.name || 'club'}:stad`);

  if (!triple) {
    // Non-league foreign club (continental competition fallback)
    if (rep >= 81 || capacity >= 50000) return 'santiago_bernabeu';
    if (rep >= 74 || capacity >= 25000) return 'estadio_monumental';
    return 'craven_cottage';
  }

  const [flagshipId, heritageId, regionalId] = triple;

  if (divTier === 'youth' || divTier === 'state_only') {
    return regionalId;
  }

  if (divTier === '2nd') {
    // Bigger 2nd-div clubs get Heritage Ground; remaining 2nd-div teams get Regional Ground (with rare variety)
    if (rep >= 72 || capacity >= 30000) return heritageId;
    return hash % 5 === 0 ? heritageId : regionalId;
  }

  // 1st division distribution across all 3 country stadium types
  if (rep >= 80 || capacity >= 52000) {
    return hash % 5 === 0 ? heritageId : flagshipId;
  }
  if (rep >= 74 || capacity >= 24000) {
    return hash % 4 === 0 ? flagshipId : heritageId;
  }
  return hash % 4 === 0 ? heritageId : regionalId;
}
