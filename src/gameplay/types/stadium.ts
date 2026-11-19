/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PitchDimensionPreset,
  TurfQuality,
  GrassLength,
  LawnMowingPattern,
  SurfaceStatus,
  WeatherCondition,
  Season,
  TimeOfDay,
  NetTension,
  GoalFrameType,
  SeatColorMode,
  CrowdLevel,
  StadiumTier,
} from '../types';

export type { TimeOfDay, SeatColorMode };

/**
 * ============================================================================
 * PHASE 12: DATA-DRIVEN STADIUM ARCHITECTURE, DUGOUTS, TUNNELS & TEAM VENUES
 * ============================================================================
 */

/**
 * Stadium Venue Category:
 * - 'pro': Full professional stadiums
 * - 'youth': Youth League & International Youth Cup grounds (restricted architecture)
 * - 'street': Dedicated non-stadium urban street/futsal arenas
 */
export type StadiumCategory = 'pro' | 'youth' | 'street';

/**
 * 12.2.1 Four Architectural Shapes (with circular/octagonal aliases)
 */
export type StadiumShape =
  | 'round'
  | 'oval'
  | 'square'
  | 'rectangular'
  | 'circular'
  | 'octagonal';

/**
 * 12.2.2 Five Stand Architectural Grades (Quality / Luxury / Finish Level)
 * - Grade 1: Municipal (rough cinder blocks, weathered timber benches, grassroots)
 * - Grade 2: Classic (traditional English red-brick masonry, painted steel trusses)
 * - Grade 3: Industrial (heavy corrugated steel cladding, exposed I-beams)
 * - Grade 4: Modern (smooth pre-cast architectural concrete, sweeping cantilever roofs)
 * - Grade 5: Futuristic (anodized aero-aluminum cladding, translucent ETFE, continuous LED fascia)
 */
export type StandGrade =
  | 'grade1_municipal'
  | 'grade1_historic_timber'
  | 'grade2_classic'
  | 'grade3_industrial'
  | 'grade3_steel_cantilever'
  | 'grade4_modern'
  | 'grade5_futuristic';

/**
 * ============================================================================
 * PHASE T6: THE 5-GRADE "ARCHITECTURAL GRADE" SYSTEM & 3-ELEMENT PALETTE ENGINE
 * ============================================================================
 * 5 Comprehensive Architectural Grades replacing obsolete individual materials:
 * 1. municipal: Hollow galvanized steel pipe scaffolding with diagonal cross-braces,
 *    ladder stairs, unpolished timber planks (tablones) bolted to frames, raw dirt/apron below.
 * 2. brutalist: Thick monolithic poured concrete blocks, heavy concrete steps with
 *    board-marked wood grain textures, solid concrete ledges with blocky dividers, thick handrails.
 * 3. industrial: Massive exposed structural steel I-beams, heavy columns, dark brick supporting
 *    piers, industrial steel grating / checkered metal plate stairs, weathered wood benches / flip-seats.
 * 4. victorian: Ornate red brick masonry, decorative cast-iron arches and pillars, twisted iron
 *    balustrades, carved wooden vergeboards (gingerbread trim), classical theater chairs.
 * 5. modern: Sleek hidden structural skeleton covered by smooth composite panels, brushed titanium,
 *    illuminated glass/terrazzo stairs, floating chrome handrails, LED ribbon displays, ergonomic buckets.
 */
export type ArchitecturalGrade =
  | 'municipal'
  | 'brutalist'
  | 'industrial'
  | 'victorian'
  | 'modern';

export type PaletteColor =
  | 'raw'
  | 'red'
  | 'blue'
  | 'white'
  | 'black'
  | 'yellow'
  | 'orange'
  | 'green';

export interface PaletteColorDefinition {
  id: PaletteColor;
  label: string;
  hex: string;
  darkHex: string;
  lightHex: string;
  borderHex: string;
  desc: string;
}

export const PALETTE_COLORS: PaletteColorDefinition[] = [
  {
    id: 'raw',
    label: 'Raw / Natural',
    hex: 'transparent',
    darkHex: '#1e293b',
    lightHex: '#cbd5e1',
    borderHex: '#94a3b8',
    desc: 'Unpainted raw structural finish (galvanized steel, grey poured concrete, dark brick, hardwood mahogany, brushed titanium).',
  },
  {
    id: 'red',
    label: 'Stadium Red',
    hex: '#dc2626',
    darkHex: '#7f1d1d',
    lightHex: '#f87171',
    borderHex: '#ef4444',
    desc: 'Bold stadium crimson enamel coating.',
  },
  {
    id: 'blue',
    label: 'Cobalt Blue',
    hex: '#2563eb',
    darkHex: '#1e3a8a',
    lightHex: '#60a5fa',
    borderHex: '#3b82f6',
    desc: 'Deep royal blue architectural lacquer.',
  },
  {
    id: 'white',
    label: 'Ivory White',
    hex: '#f8fafc',
    darkHex: '#94a3b8',
    lightHex: '#ffffff',
    borderHex: '#e2e8f0',
    desc: 'Crisp architectural white powder coating.',
  },
  {
    id: 'black',
    label: 'Obsidian Black',
    hex: '#0f172a',
    darkHex: '#020617',
    lightHex: '#334155',
    borderHex: '#1e293b',
    desc: 'Deep matte cast-iron obsidian finish.',
  },
  {
    id: 'yellow',
    label: 'Hazard Yellow',
    hex: '#eab308',
    darkHex: '#854d0e',
    lightHex: '#fde047',
    borderHex: '#facc15',
    desc: 'High-visibility industrial hazard yellow safety enamel.',
  },
  {
    id: 'orange',
    label: 'Amber Orange',
    hex: '#ea580c',
    darkHex: '#7c2d12',
    lightHex: '#fb923c',
    borderHex: '#f97316',
    desc: 'Vibrant stadium amber gloss enamel.',
  },
  {
    id: 'green',
    label: 'Forest Green',
    hex: '#16a34a',
    darkHex: '#14532d',
    lightHex: '#4ade80',
    borderHex: '#22c55e',
    desc: 'Traditional heritage British racing green.',
  },
];

export interface GradeElementColors {
  element1?: PaletteColor; // default 'raw'
  element2?: PaletteColor; // default 'raw'
  element3?: PaletteColor; // default 'raw'
}

export interface ArchitecturalGradeOption {
  id: ArchitecturalGrade;
  label: string;
  shortLabel: string;
  tierLevel: 1 | 2 | 3 | 4 | 5;
  seatLevel: 1 | 2 | 3 | 4 | 5;
  icon: string;
  seatStyleName: string;
  inherentSeatArchetype: SeatArchetype;
  underSeatStructure: string;
  desc: string;
  element1Name: string;
  element1Desc: string;
  element2Name: string;
  element2Desc: string;
  element3Name: string;
  element3Desc: string;
}

export const ARCHITECTURAL_GRADE_OPTIONS: ArchitecturalGradeOption[] = [
  {
    id: 'municipal',
    label: 'Municipal Scaffolding (Grade 1)',
    shortLabel: 'Municipal',
    tierLevel: 1,
    seatLevel: 1,
    icon: '🏗️',
    seatStyleName: 'Timber Tablones',
    inherentSeatArchetype: 'tablones',
    underSeatStructure: 'Galvanized pipe scaffolding & wooden ladder stairs (open dirt/apron below)',
    desc: 'Open steel pipe scaffolding with diagonal cross-braces, ladder stairs, and rustic timber planks. Open terrain shows beneath spectators.',
    element1Name: 'Scaffold Framing',
    element1Desc: 'Steel pipe tubing & diagonal cross-bracing',
    element2Name: 'Decks & Ladders',
    element2Desc: 'Scaffold planks & ladder rungs',
    element3Name: 'Tablones & Enclosures',
    element3Desc: 'Wooden bench planks & corrugated tin sheets',
  },
  {
    id: 'brutalist',
    label: 'Brutalist Concrete (Grade 2)',
    shortLabel: 'Brutalist',
    tierLevel: 2,
    seatLevel: 2,
    icon: '🏛️',
    seatStyleName: 'Concrete Ledges',
    inherentSeatArchetype: 'concrete_ledges',
    underSeatStructure: 'Solid monolithic poured concrete blocks with board-marked wood grain textures',
    desc: 'Solid monolithic poured concrete fortress with board-marked textures, heavy block concrete steps, and integrated concrete ledges.',
    element1Name: 'Superstructure',
    element1Desc: 'Poured concrete tier slabs & retaining walls',
    element2Name: 'Stairs & Aisles',
    element2Desc: 'Heavy block concrete steps & vomitory aisles',
    element3Name: 'Ledges & Dividers',
    element3Desc: 'Seating ledges, concrete dividers & slab handrails',
  },
  {
    id: 'industrial',
    label: 'Industrial Steel & Brick (Grade 3)',
    shortLabel: 'Industrial',
    tierLevel: 3,
    seatLevel: 3,
    icon: '🏭',
    seatStyleName: 'Industrial Flip-Seats',
    inherentSeatArchetype: 'industrial_flip',
    underSeatStructure: 'Massive structural steel I-beams, heavy columns, and dark brick supporting piers',
    desc: 'Exposed structural steel I-beams with rivets, dark brick masonry piers, checkered metal plate stairs, and rugged flip-up seats.',
    element1Name: 'Masonry & Foundation',
    element1Desc: 'Dark brick supporting walls & foundation piers',
    element2Name: 'Steelwork & Pipes',
    element2Desc: 'Steel I-beams, overhead piping & mesh railings',
    element3Name: 'Decking & Benches',
    element3Desc: 'Heavy timber beams, checkered metal stairs & wood benches',
  },
  {
    id: 'victorian',
    label: 'Victorian Red Brick (Grade 4)',
    shortLabel: 'Victorian',
    tierLevel: 4,
    seatLevel: 4,
    icon: '🧱',
    seatStyleName: 'Classical Theater Chairs',
    inherentSeatArchetype: 'theater_chairs',
    underSeatStructure: 'Ornate red brick masonry, decorative cast-iron arches, and carved wooden vergeboards',
    desc: 'Flemish red brick masonry, ornate cast-iron arches and twisted balustrades, hardwood stair treads, and classical theater chairs.',
    element1Name: 'Brick Facades',
    element1Desc: 'Ornate red brick masonry & arch pillars',
    element2Name: 'Cast Iron',
    element2Desc: 'Twisted iron balustrades, ornamental arches & crest detailing',
    element3Name: 'Woodwork & Benches',
    element3Desc: 'Gingerbread vergeboards, hardwood stairs & theater chairs',
  },
  {
    id: 'modern',
    label: 'Modern Titanium Composite (Grade 5)',
    shortLabel: 'Modern',
    tierLevel: 5,
    seatLevel: 5,
    icon: '💎',
    seatStyleName: 'Ergonomic Bucket Seats',
    inherentSeatArchetype: 'modern_bucket',
    underSeatStructure: 'Smooth composite panels, brushed titanium, and illuminated glass/terrazzo stair treads',
    desc: 'Seamless composite cladding, brushed titanium finishes, illuminated glass stair treads, chrome handrails, and ergonomic bucket seats.',
    element1Name: 'Composite Panels',
    element1Desc: 'Smooth exterior composite cladding & tier fascia panels',
    element2Name: 'Stairs & Glass',
    element2Desc: 'Terrazzo/glass stair treads & floating chrome handrails',
    element3Name: 'High-Tech Accents',
    element3Desc: 'Ergonomic bucket seat shells & LED ribbon display housings',
  },
];

/**
 * Stand Tier Sizes & Wall Tier Sizes
 */
export type TierSize = 'small' | 'medium' | 'large';
export type WallTierSize = 'small' | 'medium' | 'large';

/**
 * Stand Structural Types
 * - tiered: 1 to 4 stacked spectator decks
 * - wall: single massive steep terrace (e.g. Dortmund Yellow Wall / Die Gelbe Wand)
 * - vip_building: vertical flat tower with stacked VIP luxury palcos/suites, glass balustrades, sponsor murals & lower terrace (e.g. La Bombonera East Stand)
 * - round / rounded: sweeping curved multi-tier approach (Camp Nou style)
 * - square / giant: massive towering corner wall stand (St. James style)
 * - tower: vertical VIP hospitality suite tower (Bombonera style)
 * - none / no_stand: open end with contextual surroundings backdrop or perimeter wall
 */
export type StandType =
  | 'tiered'
  | 'wall'
  | 'stacked_wall'
  | 'vip_building'
  | 'round'
  | 'rounded'
  | 'square'
  | 'giant'
  | 'tower'
  | 'none'
  | 'no_stand';

/**
 * 12.2.9 Outside Environment Surroundings (Structure Step)
 * Phase 15.5 Extended Catalog: Mountains, Forest, Savannah, Highway, Small City, Big City, Beach, Airport, Railroad, Parking Lot, Marine Floating
 */
export type SurroundingsType =
  | 'small_city'
  | 'big_city'
  | 'mountains'
  | 'forest'
  | 'savannah'
  | 'highway'
  | 'beach'
  | 'airport'
  | 'railroad'
  | 'parking_lot'
  | 'marine_floating'
  | 'nature'; // backward-compatible alias for mountains

/**
 * Phase 15.5 & S1: Apron Perimeter Material & Setback Depth Selection
 */
export type ApronMaterial =
  | 'grass'
  | 'concrete'
  | 'rubber_tartan'
  | 'artificial_turf'
  | 'gravel_ballast'
  | 'asphalt_paved'
  | 'heritage_red_brick'
  | 'brick_pavers';

export type ApronSetback = 'compact' | 'standard' | 'expansive';

/**
 * Contextual Backdrops for "No Stand" sides (fused to Surroundings)
 */
export type SmallCityBackdrop = 'mall' | 'parking_lot' | 'apartment_buildings' | 'small_houses' | 'clock_tower' | 'high_street' | 'victorian_townhouses' | 'wall';
export type BeachBackdrop = 'beach_seaside' | 'ocean_surf' | 'boardwalk_promenade' | 'beach_cabanas' | 'apartment_buildings' | 'small_houses' | 'wall';
export type BigCityBackdrop = 'skyscrapers' | 'apartment_buildings' | 'mall' | 'metro_rail' | 'aviation_towers' | 'wall';
export type MountainsBackdrop = 'alpine_peaks' | 'pine_valley' | 'green_slopes' | 'ski_chalets' | 'cable_car_pylons' | 'pine_foothills' | 'wall';
export type ForestBackdrop = 'dense_pine_woodland' | 'dense_woodland' | 'autumn_canopy' | 'clearing_trail' | 'ranger_lookout' | 'log_fencing' | 'wall';
export type SavannahBackdrop = 'acacia_plains' | 'golden_grasslands' | 'rocky_outcrop' | 'safari_tracks' | 'kraal_perimeter' | 'wall';
export type HighwayBackdrop = 'cloverleaf_interchange' | 'elevated_viaduct' | 'toll_plaza_boulevard' | 'highway_gantries' | 'interstate_boulevard' | 'wall';
export type NatureBackdrop = 'mountain_forest' | 'open_alpine_hills' | 'lake_valley' | 'wall';
export type AirportBackdrop = 'runway' | 'hangars_control_tower' | 'freight_depot' | 'wall';
export type RailroadBackdrop = 'train_depot' | 'freight_railyard' | 'industrial_gantries' | 'boxcar_depot' | 'wall';
export type ParkingLotBackdrop = 'paved_parking' | 'tree_boulevard' | 'team_buses' | 'wall';
export type MarineFloatingBackdrop = 'open_ocean' | 'floating_pontoons' | 'harbor_marina' | 'fishing_trawlers' | 'wall';

export type NoStandBackdrop =
  | SmallCityBackdrop
  | BeachBackdrop
  | BigCityBackdrop
  | MountainsBackdrop
  | ForestBackdrop
  | SavannahBackdrop
  | HighwayBackdrop
  | NatureBackdrop
  | AirportBackdrop
  | RailroadBackdrop
  | ParkingLotBackdrop
  | MarineFloatingBackdrop
  | string;

/**
 * ============================================================================
 * PHASE ST3: IMMEDIATE STADIUM GROUNDS & FORECOURT CONCOURSE ENGINE
 * ============================================================================
 * 9 Core Archetypes + Surroundings-Fused Specialized Forecourts
 */
export type CoreStadiumGrounds =
  | 'parking_lots'
  | 'mall_commercial'
  | 'club_museum_trophies'
  | 'classical_statues'
  | 'modern_architectural'
  | 'industrial_depot'
  | 'park_recreation'
  | 'municipal_thoroughfare'
  | 'potrero_dirt';

export type MarineStadiumGrounds =
  | 'marine_floating_pontoons'
  | 'marine_moored_boats'
  | 'marine_oil_rig'
  | 'marine_open_lagoon'
  | 'marine_aircraft_carrier'
  | 'marine_tropical_atoll';

export type AirportStadiumGrounds =
  | 'airport_runway_tarmac'
  | 'airport_aircraft_apron'
  | 'airport_cargo_yard'
  | 'airport_service_boulevard';

export type RailroadStadiumGrounds =
  | 'railroad_train_platforms'
  | 'railroad_switching_yard'
  | 'railroad_locomotive_spur'
  | 'railroad_boxcar_siding';

export type HighwayStadiumGrounds =
  | 'highway_viaduct_pillars'
  | 'highway_toll_plaza'
  | 'highway_service_station'
  | 'highway_sound_barrier';

export type BeachStadiumGrounds =
  | 'beach_boardwalk_cabanas'
  | 'beach_dune_paths'
  | 'beach_palm_boulevard'
  | 'beach_marina_slip';

export type MountainsStadiumGrounds =
  | 'mountains_granite_terrace'
  | 'mountains_gondola_terminal'
  | 'mountains_switchback_road'
  | 'mountains_rocky_crag';

export type ForestStadiumGrounds =
  | 'forest_logging_camp'
  | 'forest_pine_trail'
  | 'forest_ranger_compound'
  | 'forest_woodland_clearing';

export type SavannahStadiumGrounds =
  | 'savannah_wadi_potrero'
  | 'savannah_safari_compound'
  | 'savannah_acacia_clearing'
  | 'savannah_ranger_outpost';

export type StadiumGroundsType =
  | CoreStadiumGrounds
  | MarineStadiumGrounds
  | AirportStadiumGrounds
  | RailroadStadiumGrounds
  | HighwayStadiumGrounds
  | BeachStadiumGrounds
  | MountainsStadiumGrounds
  | ForestStadiumGrounds
  | SavannahStadiumGrounds;

export interface GroundsOption {
  id: StadiumGroundsType;
  label: string;
  icon: string;
  desc: string;
  isSpecialized?: boolean;
}

export const CORE_GROUNDS_ARCHETYPES: GroundsOption[] = [
  {
    id: 'parking_lots',
    label: 'Parking Lots',
    icon: '🚌',
    desc: 'Asphalt parking bays, white stalls, crowd queue stanchions, team luxury coach buses, and floodlight poles.',
  },
  {
    id: 'mall_commercial',
    label: 'Mall / Commercial Plaza',
    icon: '🛍️',
    desc: 'Modern retail shopping promenade, glass storefronts, food truck clusters, fan pop-up kiosks, and pedestrian pavers.',
  },
  {
    id: 'club_museum_trophies',
    label: 'Club Museum & Trophies',
    icon: '🏆',
    desc: 'Dedicated club heritage forecourt, glass silverware pavilion, bronze crest inlays, and Fan Walk of Fame pavers.',
  },
  {
    id: 'classical_statues',
    label: 'Classical (Emirates-Style)',
    icon: '🗿',
    desc: 'Weathered red-brick walkways, ornate heritage lampposts, manicured boxwood hedges, and bronze legend statues on stone plinths.',
  },
  {
    id: 'modern_architectural',
    label: 'Modern / Architectural',
    icon: '💎',
    desc: 'Polished light-gray concrete pavers, reflective architectural water basins, kinetic steel sculptures, and illuminated ground LED light ribbons.',
  },
  {
    id: 'industrial_depot',
    label: 'Industrial / Shipping Depot',
    icon: '🏗️',
    desc: 'Heavy asphalt tarmac, stacked shipping containers, freight gantries, steel wire security fences, and yellow hazard curbs.',
  },
  {
    id: 'park_recreation',
    label: 'Park & Recreation',
    icon: '🌳',
    desc: 'Family park with children playground games, wooden park benches, manicured green lawns, mature deciduous shade trees, and flowerbeds.',
  },
  {
    id: 'municipal_thoroughfare',
    label: 'Municipal Thoroughfare',
    icon: '🚦',
    desc: 'Active city thoroughfare wrapping directly outside stadium with multi-lane asphalt, zebra crosswalks, sidewalks, bus stops, and curbside guardrails.',
  },
  {
    id: 'potrero_dirt',
    label: 'Potrero (Mud & Dirt)',
    icon: '🌾',
    desc: 'Barbed wire perimeter fence, unpaved muddy brown dirt clearing with puddle ruts, weathered tire tracks, wild thistle weeds, and rustic footpath.',
  },
];

/**
 * ============================================================================
 * PHASE B4: ASYMMETRIC GROUND DIRECTIONALITY & RICH GROUND FLAVOR ENGINE
 * ============================================================================
 */

export type CardinalDirection = 'north' | 'south' | 'east' | 'west';

export interface CardinalGroundProfile {
  cardinal: CardinalDirection;
  role: 'horizon_shelf_service' | 'main_facade_public' | 'fan_fanfare_concourse' | 'media_broadcast_technical';
  title: string;
  badge: string;
  desc: string;
  keyProps: string[];
}

export const CARDINAL_GROUND_ROLES: Record<CardinalDirection, CardinalGroundProfile> = {
  north: {
    cardinal: 'north',
    role: 'horizon_shelf_service',
    title: 'North Ground (Horizon Shelf)',
    badge: 'N - SERVICE',
    desc: 'Compact depth creating a smooth perspective transition to the horizon with low-profile staff gates, service vehicle loading bays, perimeter landscaping, and emergency exit stairwells.',
    keyProps: [
      'Low-profile staff entrance gates & turnstiles',
      'Service vehicle loading bays & delivery vans',
      'Perimeter evergreen landscaping & manicured hedges',
      'Emergency fire exit stairwells & illuminated signs',
    ],
  },
  south: {
    cardinal: 'south',
    role: 'main_facade_public',
    title: 'South Ground (Main Stadium Facade & Public Concourse)',
    badge: 'S - MAIN FACADE',
    desc: 'Grand multi-story stadium facade with glass atrium windows, ticket office booths, team bus arrival drop-off zone, VIP red carpet with brass stanchions, club superstore entrance, and bronze statue of club legends.',
    keyProps: [
      'Multi-story glass atrium stadium facade',
      'Ticket office booths with queue barriers',
      'VIP red carpet arrival runner & brass stanchions',
      'Team luxury coach buses (Home & Away)',
      'Club superstore entrance with illuminated crest',
      'Bronze statue of club legend on carved stone plinth',
    ],
  },
  east: {
    cardinal: 'east',
    role: 'fan_fanfare_concourse',
    title: 'East Ground (Sideline Fan Fanfare & Concourse)',
    badge: 'E - FAN ZONE',
    desc: 'Bustling matchday promenade with burger/kebab food trucks, beverage kiosks, fan merchandise trailers, and outdoor beer garden picnic tables.',
    keyProps: [
      'Artisan food trucks (burgers, kebabs, tacos) with service awnings',
      'Beverage kiosks with illuminated neon signage',
      'Fan merchandise trailer pop-up stalls with scarves & jerseys',
      'Outdoor beer garden picnic tables & parasol umbrellas',
    ],
  },
  west: {
    cardinal: 'west',
    role: 'media_broadcast_technical',
    title: 'West Ground (Media, Broadcast & Technical Area)',
    badge: 'W - MEDIA & TECH',
    desc: 'Outside broadcast (OB) satellite trucks with satellite dishes, TV camera mobile trailers, player security perimeter, and team dugout access ramps.',
    keyProps: [
      'Outside broadcast (OB) satellite uplink trucks with parabolic dishes',
      'Mobile TV production trailers & heavy power cable conduits',
      'Player security fence perimeter & checkpoint barriers',
      'Team dugout & tunnel access ramps with non-slip runners',
    ],
  },
};

export interface GroundFlavorDetail {
  id: StadiumGroundsType;
  name: string;
  groundProps: string[];
  northFlavor: string;
  southFlavor: string;
  eastFlavor: string;
  westFlavor: string;
}

export const B4_GROUND_FLAVORS: Record<CoreStadiumGrounds, GroundFlavorDetail> = {
  municipal_thoroughfare: {
    id: 'municipal_thoroughfare',
    name: 'Municipal Street Grid',
    groundProps: [
      'Asphalt streets with zebra crosswalks',
      'Yellow traffic divider lines & curbside lanes',
      'Parked spectator cars & city taxis',
      'Bus stops with glass shelters & route maps',
      'Retro cast-iron street lamps with warm glow',
      'Sidewalk shade trees with cast-iron tree grates',
    ],
    northFlavor: 'Municipal service gates, municipal van parking bays, and street transition curb',
    southFlavor: 'Grand civic atrium facade, taxi rank, pedestrian zebra plaza, and bronze civic statue',
    eastFlavor: 'Sidewalk food trucks, kebab trailers, and outdoor café curb tables',
    westFlavor: 'OB satellite truck curbside compound and secured technical entrance lane',
  },
  parking_lots: {
    id: 'parking_lots',
    name: 'Parking Lots (Camp Nou Style)',
    groundProps: [
      'Marked white & yellow parking bays',
      'Parked spectator vehicles & team luxury coach buses',
      'High-mast floodlight stanchions',
      'Asphalt speed bumps with yellow diagonal hazard striping',
      'Realistic dark oil stains in parking stalls',
    ],
    northFlavor: 'Staff & maintenance vehicle parking, waste compactors, and service gates',
    southFlavor: 'VIP team coach drop-off circle, red carpet, ticket office, and club megastore',
    eastFlavor: 'Food truck row parked along stall bays with beer garden picnic tables',
    westFlavor: 'Secured broadcast OB satellite truck parking compound with perimeter fencing',
  },
  mall_commercial: {
    id: 'mall_commercial',
    name: 'Commercial Mall Concourse',
    groundProps: [
      'Polished two-tone architectural stone pavers',
      'Modern floor-to-ceiling glass storefronts',
      'Digital vertical LED advertising totems',
      'Decorative tiered fountain plaza with turquoise water',
      'Outdoor café seating with parasols & patio tables',
    ],
    northFlavor: 'Retail delivery loading dock bays, service corridors, and staff exits',
    southFlavor: 'Flagship club superstore atrium, ticket hub, fountain court, and VIP red carpet',
    eastFlavor: 'Gourmet street food trucks, beverage kiosks, and covered patio dining',
    westFlavor: 'Media interview studio trailers and satellite broadcast uplink bays',
  },
  classical_statues: {
    id: 'classical_statues',
    name: 'Classical Plaza (Emirates Style)',
    groundProps: [
      'Checkered white and gray marble paving slabs',
      'Ornate bronze lamp posts with glass lantern caps',
      'Classical stone balustrades with urn finials',
      'Manicured geometric topiary box hedges',
      'Equestrian bronze statues on stepped granite plinths',
    ],
    northFlavor: 'Stone service archways, low wrought-iron service gates, and hedgerow border',
    southFlavor: 'Classical colonnade stadium facade, legend bronze statues, and VIP red carpet',
    eastFlavor: 'Heritage brass beverage kiosks, pretzel/pie food carts, and stone terrace benches',
    westFlavor: 'Enclosed media courtyard with OB satellite vans hidden behind decorative balustrades',
  },
  potrero_dirt: {
    id: 'potrero_dirt',
    name: 'Potrero (Mud & Dirt)',
    groundProps: [
      'Dry packed earth with patches of dry scrub grass',
      'Makeshift stacked tire safety barriers painted white',
      'Rusty corrugated metal storage sheds & wooden shacks',
      'White pitch-marking chalk dust trails and tire tracks',
    ],
    northFlavor: 'Makeshift corrugated staff gate, mud service track, and thistle brush',
    southFlavor: 'Rustic club house facade, wooden ticket booth, team bus dirt turn-around, and club mural',
    eastFlavor: 'Choripán grill carts, street vendor stalls with team flags, and wooden picnic benches',
    westFlavor: 'Broadcast pickup truck with portable satellite mast and wooden cable covers',
  },
  modern_architectural: {
    id: 'modern_architectural',
    name: 'Modern Architectural Plaza',
    groundProps: [
      'Geometric concrete slab pavers with shadow reveal joints',
      'Reflective water basins with stepping stones',
      'Linear ground-embedded LED lighting ribbons',
      'Sculptural minimalist brushed steel benches',
    ],
    northFlavor: 'Recessed subterranean service bay, automated glass security gates, and linear hedge line',
    southFlavor: 'Grand glass curtain-wall facade, illuminated cantilever canopy, red carpet, and steel sculpture',
    eastFlavor: 'Modernist food cubes, glowing beverage pods, and illuminated linear bar tables',
    westFlavor: 'Sleek OB media compound with underground cable channels and flush access ramps',
  },
  industrial_depot: {
    id: 'industrial_depot',
    name: 'Industrial Depot',
    groundProps: [
      'Rail spur tracks with steel rails and dark ballast gravel',
      'Shipping containers stacked 2-high with crane corner castings',
      'Heavy industrial forklift vehicles with yellow safety cages',
      'Chain-link security gates with razor wire outriggers',
      'Steel storage drums with hazard warning labels',
    ],
    northFlavor: 'Rail freight spur track, industrial staff gate, and loading dock platforms',
    southFlavor: 'Main administrative brick facade, official team bus depot, and brass founder statue',
    eastFlavor: 'Concourse food trailers set up between container stacks with heavy wooden spool tables',
    westFlavor: 'Dedicated heavy broadcast trucks, power generator trailers, and locked cable troughs',
  },
  park_recreation: {
    id: 'park_recreation',
    name: 'Park & Recreation',
    groundProps: [
      'Meandering crushed gravel pedestrian paths',
      'Dense green mature oak and pine trees',
      'Classic slatted wooden park benches',
      'Rustic dark green wooden trash receptacles',
      'Manicured emerald green picnic lawns & flowerbeds',
    ],
    northFlavor: 'Park service pathway, forestry tool depot, and dense evergreen screen',
    southFlavor: 'Pavilion grand entrance, flowerbed roundabout, team bus drop-off, and hero memorial statue',
    eastFlavor: 'Picnic food truck grove, artisanal ice cream carts, and wooden picnic lawn tables',
    westFlavor: 'Media compound integrated into gravel clearing screened by mature pine trees',
  },
  club_museum_trophies: {
    id: 'club_museum_trophies',
    name: 'Club Museum & Heritage Walk',
    groundProps: [
      'Bronze historical timeline plaques embedded in brick cobblestones',
      'Vintage team crest mosaic medallion in central promenade',
      'Historic glass trophy display rotunda with illuminated silver cups',
      'Walk of Fame brass player star pavers',
    ],
    northFlavor: 'Archive staff intake, conservation storage entrance, and brick perimeter wall',
    southFlavor: 'Museum entrance rotunda, trophy hall facade, red carpet, and legendary manager statue',
    eastFlavor: 'Heritage café pavilion, official club retro jersey trailer, and commemorative tables',
    westFlavor: 'Press conference media center and OB satellite broadcast bay',
  },
};

export function getCardinalGroundRole(side: CardinalDirection): CardinalGroundProfile {
  return CARDINAL_GROUND_ROLES[side] || CARDINAL_GROUND_ROLES.south;
}

export function getGroundFlavorDetail(grounds: StadiumGroundsType): GroundFlavorDetail {
  if (grounds in B4_GROUND_FLAVORS) {
    return B4_GROUND_FLAVORS[grounds as CoreStadiumGrounds];
  }
  // Fallback to closest core grounds
  if (grounds.startsWith('marine_')) return B4_GROUND_FLAVORS.modern_architectural;
  if (grounds.startsWith('airport_')) return B4_GROUND_FLAVORS.industrial_depot;
  if (grounds.startsWith('railroad_')) return B4_GROUND_FLAVORS.industrial_depot;
  if (grounds.startsWith('highway_')) return B4_GROUND_FLAVORS.municipal_thoroughfare;
  if (grounds.startsWith('beach_')) return B4_GROUND_FLAVORS.mall_commercial;
  if (grounds.startsWith('mountains_')) return B4_GROUND_FLAVORS.park_recreation;
  if (grounds.startsWith('forest_')) return B4_GROUND_FLAVORS.park_recreation;
  if (grounds.startsWith('savannah_')) return B4_GROUND_FLAVORS.potrero_dirt;
  return B4_GROUND_FLAVORS.parking_lots;
}

/**
 * Homogeneity Principle helper: Contextual filtering matching Grounds to Surroundings
 */
export function getGroundsForSurroundings(surroundings: SurroundingsType): GroundsOption[] {
  switch (surroundings) {
    case 'marine_floating':
      return [
        {
          id: 'marine_floating_pontoons',
          label: 'Floating Modular Hex-Pontoon',
          icon: '⚓',
          desc: 'High-buoyancy modular concrete pontoon, heavy anchor chains, maritime buoy beacons, and ocean spray.',
          isSpecialized: true,
        },
        {
          id: 'marine_moored_boats',
          label: 'Aircraft Carrier / Mega-Vessel Deck',
          icon: '🚢',
          desc: 'Flight deck catapult markings, island superstructure, perimeter safety nets, and ocean wake.',
          isSpecialized: true,
        },
        {
          id: 'marine_oil_rig',
          label: 'Offshore Industrial Oil/Gas Platform',
          icon: '🛢️',
          desc: 'Heavy yellow steel lattice legs, gas flare boom tower, exterior cranes, and offshore helipad.',
          isSpecialized: true,
        },
        {
          id: 'marine_open_lagoon',
          label: 'Tiny Tropical Coral Atoll',
          icon: '🏝️',
          desc: 'Intimate coral island with powdery white sand beaches, turquoise reef waters, coconut palms, and breaking surf.',
          isSpecialized: true,
        },
      ];

    case 'airport':
      return [
        {
          id: 'airport_runway_tarmac',
          label: 'Active Runway Tarmac',
          icon: '🛫',
          desc: 'Active runway tarmac, white threshold piano keys, and centerline guidance markings.',
          isSpecialized: true,
        },
        {
          id: 'airport_aircraft_apron',
          label: 'Aircraft Parking Bays',
          icon: '✈️',
          desc: 'Commercial aircraft apron parking bays, baggage tugs, and fuel service ground hydrants.',
          isSpecialized: true,
        },
        {
          id: 'airport_cargo_yard',
          label: 'Freight Depot Cargo Yard',
          icon: '📦',
          desc: 'Cargo freight containers, air-freight dollies, and high-intensity aviation apron floodlights.',
          isSpecialized: true,
        },
        {
          id: 'airport_service_boulevard',
          label: 'Airport Service Boulevard',
          icon: '🚖',
          desc: 'Terminal arrivals roadway, yellow curb markings, and illuminated airport taxiway signage.',
          isSpecialized: true,
        },
        CORE_GROUNDS_ARCHETYPES[0], // Parking Lots
        CORE_GROUNDS_ARCHETYPES[4], // Modern Architectural
        CORE_GROUNDS_ARCHETYPES[5], // Industrial Depot
      ];

    case 'railroad':
      return [
        {
          id: 'railroad_train_platforms',
          label: 'Multi-Track Train Platforms',
          icon: '🚉',
          desc: 'Concrete passenger train platforms, tactile yellow safety tile strips, and passenger shelter canopies.',
          isSpecialized: true,
        },
        {
          id: 'railroad_switching_yard',
          label: 'Switching Yard & Tracks',
          icon: '🛤️',
          desc: 'Crushed stone rail ballast, steel tracks, track switches, and red/green rail signal lanterns.',
          isSpecialized: true,
        },
        {
          id: 'railroad_locomotive_spur',
          label: 'Locomotive Maintenance Spur',
          icon: '🚂',
          desc: 'Locomotive service track with inspection pits, oil stains, and overhead diesel gantry.',
          isSpecialized: true,
        },
        {
          id: 'railroad_boxcar_siding',
          label: 'Industrial Boxcar Siding',
          icon: '🚆',
          desc: 'Weathered freight siding with parked colorful cargo boxcars and freight loading ramps.',
          isSpecialized: true,
        },
        CORE_GROUNDS_ARCHETYPES[5], // Industrial Depot
        CORE_GROUNDS_ARCHETYPES[7], // Municipal Thoroughfare
        CORE_GROUNDS_ARCHETYPES[0], // Parking Lots
      ];

    case 'highway':
      return [
        {
          id: 'highway_viaduct_pillars',
          label: 'Elevated Viaduct & Pillars',
          icon: '🌉',
          desc: 'Massive concrete overpass pillars, shadowed under-belly roadway, and steel expansion joint troughs.',
          isSpecialized: true,
        },
        {
          id: 'highway_toll_plaza',
          label: 'Toll Plaza Boulevard',
          icon: '🛣️',
          desc: 'Multi-lane toll booth plaza, canopy lights, crash attenuators, and green overhead lane arrows.',
          isSpecialized: true,
        },
        {
          id: 'highway_service_station',
          label: 'Service Station & Forecourt',
          icon: '⛽',
          desc: 'Highway rest stop forecourt, fuel island pumps, illuminated brand pylon, and convenience mart.',
          isSpecialized: true,
        },
        {
          id: 'highway_sound_barrier',
          label: 'Sound-Barrier Walkway',
          icon: '🚧',
          desc: 'Acoustic plexiglass/wood highway sound wall, service access catwalk, and galvanized crash barriers.',
          isSpecialized: true,
        },
        CORE_GROUNDS_ARCHETYPES[7], // Municipal Thoroughfare
        CORE_GROUNDS_ARCHETYPES[0], // Parking Lots
        CORE_GROUNDS_ARCHETYPES[1], // Mall / Commercial
      ];

    case 'beach':
      return [
        {
          id: 'beach_boardwalk_cabanas',
          label: 'Boardwalk with Cabanas',
          icon: '🏖️',
          desc: 'Wide wooden timber boardwalk promenade, colorful beach cabanas, and string-light poles.',
          isSpecialized: true,
        },
        {
          id: 'beach_dune_paths',
          label: 'Sandy Dune Paths',
          icon: '🌾',
          desc: 'Golden sand dunes, sea oats foliage, wooden sand fencing, and shell-paved pedestrian paths.',
          isSpecialized: true,
        },
        {
          id: 'beach_palm_boulevard',
          label: 'Coastal Palm Boulevard',
          icon: '🌴',
          desc: 'Brick paved oceanfront boulevard lined with towering coconut palms and vintage lampposts.',
          isSpecialized: true,
        },
        {
          id: 'beach_marina_slip',
          label: 'Yacht Club Marina Slip',
          icon: '⛵',
          desc: 'Private yacht marina slips, white gangways, nautical signal flags, and polished brass fixtures.',
          isSpecialized: true,
        },
        CORE_GROUNDS_ARCHETYPES[6], // Park & Recreation
        CORE_GROUNDS_ARCHETYPES[4], // Modern Architectural
        CORE_GROUNDS_ARCHETYPES[3], // Classical
      ];

    case 'mountains':
    case 'nature':
      return [
        {
          id: 'mountains_granite_terrace',
          label: 'Alpine Granite Terrace',
          icon: '⛰️',
          desc: 'Cut granite flagstone terrace, alpine flower planter boxes, and evergreen dwarf pines.',
          isSpecialized: true,
        },
        {
          id: 'mountains_gondola_terminal',
          label: 'Ski Gondola Terminal',
          icon: '🚡',
          desc: 'Timber and stone cable car terminal plaza, suspension cable pylons, and ski rack benches.',
          isSpecialized: true,
        },
        {
          id: 'mountains_switchback_road',
          label: 'Switchback Hairpin Road',
          icon: '🚵',
          desc: 'Winding asphalt mountain pass road with stone retaining walls and scenic turnout lookouts.',
          isSpecialized: true,
        },
        {
          id: 'mountains_rocky_crag',
          label: 'Rocky Potrero Crag',
          icon: '🪨',
          desc: 'Natural bedrock crags, gravel scree slopes, rustic log fencing, and wild mountain scrub.',
          isSpecialized: true,
        },
        CORE_GROUNDS_ARCHETYPES[8], // Potrero
        CORE_GROUNDS_ARCHETYPES[6], // Park & Recreation
        CORE_GROUNDS_ARCHETYPES[3], // Classical
      ];

    case 'forest':
      return [
        {
          id: 'forest_logging_camp',
          label: 'Logging Camp & Clearing',
          icon: '🪵',
          desc: 'Gravel timber depot clearing, stacked pine log piles, rustic wood fences, and equipment sheds.',
          isSpecialized: true,
        },
        {
          id: 'forest_pine_trail',
          label: 'Dense Pine Woodland Trail',
          icon: '🌲',
          desc: 'Needle-strewn dirt walking trail winding beneath towering spruce and pine trees.',
          isSpecialized: true,
        },
        {
          id: 'forest_ranger_compound',
          label: 'Ranger Depot Compound',
          icon: '🏕️',
          desc: 'Forest service gravel compound, rustic log cabins, radio mast, and fire tool racks.',
          isSpecialized: true,
        },
        {
          id: 'forest_woodland_clearing',
          label: 'Potrero Woodland Clearing',
          icon: '🌱',
          desc: 'Natural grassy forest glade with wildflower patches and rustic split-rail log fences.',
          isSpecialized: true,
        },
        CORE_GROUNDS_ARCHETYPES[8], // Potrero
        CORE_GROUNDS_ARCHETYPES[6], // Park & Recreation
      ];

    case 'savannah':
      return [
        {
          id: 'savannah_wadi_potrero',
          label: 'Dry Wadi Mud Potrero',
          icon: '🏜️',
          desc: 'Sun-baked dried riverbed mud with deep cracks, red dust patches, and thorny scrub bushes.',
          isSpecialized: true,
        },
        {
          id: 'savannah_safari_compound',
          label: 'Safari Vehicle Compound',
          icon: '🚙',
          desc: 'Crushed dirt compound with safari overland trucks, thatch-roof vehicle bays, and water drums.',
          isSpecialized: true,
        },
        {
          id: 'savannah_acacia_clearing',
          label: 'Umbrella Acacia Clearing',
          icon: '🦒',
          desc: 'Sweeping golden grass clearing framed by iconic flat-topped umbrella acacia trees.',
          isSpecialized: true,
        },
        {
          id: 'savannah_ranger_outpost',
          label: 'Ranger Outpost & Kraal',
          icon: '🛖',
          desc: 'Thornbush perimeter kraal fence, wooden guard watchpost, and dirt jeep tracks.',
          isSpecialized: true,
        },
        CORE_GROUNDS_ARCHETYPES[8], // Potrero
        CORE_GROUNDS_ARCHETYPES[6], // Park & Recreation
      ];

    case 'parking_lot':
      return [
        CORE_GROUNDS_ARCHETYPES[0], // Parking Lots (Primary)
        CORE_GROUNDS_ARCHETYPES[1], // Mall / Commercial
        CORE_GROUNDS_ARCHETYPES[2], // Club Museum
        CORE_GROUNDS_ARCHETYPES[3], // Classical
        CORE_GROUNDS_ARCHETYPES[4], // Modern Architectural
        CORE_GROUNDS_ARCHETYPES[5], // Industrial Depot
        CORE_GROUNDS_ARCHETYPES[6], // Park & Recreation
        CORE_GROUNDS_ARCHETYPES[7], // Municipal Thoroughfare
        CORE_GROUNDS_ARCHETYPES[8], // Potrero
      ];

    case 'big_city':
      return [
        CORE_GROUNDS_ARCHETYPES[7], // Municipal Thoroughfare / Street Grid
        CORE_GROUNDS_ARCHETYPES[1], // Commercial Mall
        CORE_GROUNDS_ARCHETYPES[4], // Modern Architectural Plaza
        CORE_GROUNDS_ARCHETYPES[0], // Parking Lots
        CORE_GROUNDS_ARCHETYPES[2], // Club Museum & Trophies
      ];

    case 'small_city':
      return [
        CORE_GROUNDS_ARCHETYPES[3], // Classical (Victorian Brick Cobblestones)
        CORE_GROUNDS_ARCHETYPES[1], // The Red Lion Pub Forecourt / Commercial
        CORE_GROUNDS_ARCHETYPES[7], // Municipal Thoroughfare (Heritage Tramway)
        CORE_GROUNDS_ARCHETYPES[6], // Park & Recreation
        CORE_GROUNDS_ARCHETYPES[0], // Parking Lots
        CORE_GROUNDS_ARCHETYPES[2], // Club Museum & Trophies
      ];

    default:
      return CORE_GROUNDS_ARCHETYPES;
  }
}

/**
 * Returns default coherent grounds for a chosen surrounding
 */
export function getDefaultGroundsForSurroundings(surroundings: SurroundingsType): StadiumGroundsType {
  switch (surroundings) {
    case 'marine_floating':
      return 'marine_floating_pontoons';
    case 'airport':
      return 'airport_runway_tarmac';
    case 'railroad':
      return 'railroad_train_platforms';
    case 'highway':
      return 'highway_viaduct_pillars';
    case 'beach':
      return 'beach_boardwalk_cabanas';
    case 'mountains':
    case 'nature':
      return 'mountains_granite_terrace';
    case 'forest':
      return 'forest_pine_trail';
    case 'savannah':
      return 'savannah_wadi_potrero';
    case 'parking_lot':
      return 'parking_lots';
    case 'small_city':
      return 'classical_statues';
    case 'big_city':
      return 'mall_commercial';
    default:
      return 'parking_lots';
  }
}

/**
 * Universal Wall Rule: wall is always available across all surrounding types
 */
export type WallSize = 'low' | 'medium' | 'tall';
export type WallMaterial = 'brick' | 'concrete' | 'stone' | 'timber' | 'metal_cladding';

export interface WallPerimeterConfig {
  size: WallSize;
  material: WallMaterial;
}

/**
 * Phase 15.7.2 & Phase A2: Canonical Contextual Perimeter Enclosure Types
 * Derived from the Hierarchical Parent Matrix: (Surroundings, Grounds) -> No-Stand Perimeter
 */
export type PerimeterFinishType =
  | 'none'
  | 'small_fence'
  | 'big_fence'
  | 'chainlink_fence'
  | 'brick_wall'
  | 'concrete_wall'
  | 'rustic_timber'
  | 'corrugated_hoarding'
  // Phase A2 Contextual Perimeters:
  | 'security_fence_lamp'
  | 'glass_balustrade'
  | 'weathered_wooden_pickets'
  | 'nautical_rope_barrier'
  | 'stone_seawall'
  | 'dry_stone_wall'
  | 'pine_timber_fence'
  | 'wire_mesh_backstop'
  | 'cast_iron_railings'
  | 'turnstile_brick_wall'
  | 'guardrail_barrier'
  | 'potrero_berm';

export interface PerimeterOption {
  id: PerimeterFinishType;
  label: string;
  icon: string;
  desc: string;
  isSpecialized?: boolean;
}

/**
 * PHASE A2.1: Hierarchical Parent Matrix Resolver:
 * (Surroundings, Grounds) dictates which No-Stand Perimeter types are contextually available.
 */
export function getContextualPerimeters(
  surroundings: SurroundingsType,
  grounds?: StadiumGroundsType
): PerimeterOption[] {
  switch (surroundings) {
    case 'big_city':
      return [
        {
          id: 'security_fence_lamp',
          label: 'Security Fence with Street Lamp',
          icon: '💡',
          desc: 'High-security galvanized steel mesh with attached high-mast LED streetlamp fixture and yellow warning sign.',
          isSpecialized: true,
        },
        {
          id: 'concrete_wall',
          label: 'Concrete Security Wall with Graffiti',
          icon: '🏢',
          desc: 'Pre-cast concrete security slabs with expansion seams, safety stencils, and colorful retro ultra graffiti.',
        },
        {
          id: 'glass_balustrade',
          label: 'Tempered Glass Balustrade',
          icon: '💎',
          desc: 'Ultra-modern frameless structural tempered glass with polished stainless steel posts and ambient cyan edge glow.',
          isSpecialized: true,
        },
        {
          id: 'chainlink_fence',
          label: 'Galvanized Diamond Chainlink Fence',
          icon: '⛓️',
          desc: 'Industrial galvanized wire mesh with tubular steel top rail and angled barbed wire outrigger arms.',
        },
      ];

    case 'beach':
      return [
        {
          id: 'weathered_wooden_pickets',
          label: 'Weathered Wooden Pickets',
          icon: '🪵',
          desc: 'Salt-weathered cedar picket palisade with brass nails, driftwood posts, and golden sand drifting at the base.',
          isSpecialized: true,
        },
        {
          id: 'nautical_rope_barrier',
          label: 'Nautical Rope Barrier',
          icon: '⚓',
          desc: 'Heavy braided maritime manila rope swagged between weathered timber mooring pilings with brass fittings.',
          isSpecialized: true,
        },
        {
          id: 'stone_seawall',
          label: 'Granite Coastal Seawall',
          icon: '🌊',
          desc: 'Chiseled granite block seawall with beveled coping cap designed to break ocean spray and tidal surges.',
          isSpecialized: true,
        },
        {
          id: 'rustic_timber',
          label: 'Rustic Timber Palisade',
          icon: '🪵',
          desc: 'Vertical wood palings with woodgrain textures and cross-timber reinforcement.',
        },
      ];

    case 'mountains':
    case 'nature':
      return [
        {
          id: 'dry_stone_wall',
          label: 'Alpine Dry Stone Wall',
          icon: '⛰️',
          desc: 'Traditional interlocking stacked fieldstone and granite slate wall with alpine moss and lichens.',
          isSpecialized: true,
        },
        {
          id: 'pine_timber_fence',
          label: 'Split Pine Timber Fence',
          icon: '🌲',
          desc: 'Rough-hewn split pine conifer post-and-rail timber fence with visible bark and natural wood knots.',
          isSpecialized: true,
        },
        {
          id: 'wire_mesh_backstop',
          label: 'Wire Mesh Backstop Barrier',
          icon: '🥅',
          desc: 'High-tensile steel wire mesh backstop barrier anchored by heavy tubular posts against steep mountain slopes.',
          isSpecialized: true,
        },
        {
          id: 'brick_wall',
          label: 'Weathered Brick Masonry Wall',
          icon: '🧱',
          desc: 'Flemish-bond weathered brick wall with stone coping.',
        },
      ];

    case 'small_city':
      return [
        {
          id: 'turnstile_brick_wall',
          label: 'Red Brick Turnstile Wall',
          icon: '🏛️',
          desc: 'Historic Victorian Flemish-bond red brick wall with turnstile entrance grilles and carved sandstone pier caps.',
          isSpecialized: true,
        },
        {
          id: 'corrugated_hoarding',
          label: 'Corrugated Iron Wall with Retro Sponsors',
          icon: '📻',
          desc: 'Galvanized corrugated sheet iron hoardings hand-painted with nostalgic local club sponsors.',
        },
        {
          id: 'cast_iron_railings',
          label: 'Victorian Cast-Iron Spear Railings',
          icon: '⚔️',
          desc: 'Heritage black cast-iron spearhead palisade with ornate fleur-de-lis finials and stone plinth curb.',
          isSpecialized: true,
        },
        {
          id: 'brick_wall',
          label: 'Aged Red Brick Wall',
          icon: '🧱',
          desc: 'Classic aged stadium brick wall with weathered mortar and stone coping.',
        },
      ];

    case 'forest':
      return [
        {
          id: 'pine_timber_fence',
          label: 'Split Pine Timber Fence',
          icon: '🌲',
          desc: 'Rough-hewn conifer post-and-rail fence seamlessly blending into the dense woodland canopy.',
          isSpecialized: true,
        },
        {
          id: 'rustic_timber',
          label: 'Rustic Timber Palisade',
          icon: '🪵',
          desc: 'Vertical timber palisade with forged iron nail studs.',
        },
        {
          id: 'wire_mesh_backstop',
          label: 'Wire Mesh Backstop Barrier',
          icon: '🥅',
          desc: 'Steel wire mesh backstop keeping balls out of the dense forest brush.',
          isSpecialized: true,
        },
        {
          id: 'dry_stone_wall',
          label: 'Dry Stone Wall',
          icon: '🪨',
          desc: 'Rustic stacked stone wall boundary.',
        },
      ];

    case 'savannah':
      return [
        {
          id: 'rustic_timber',
          label: 'Thornbush Kraal Timber Barrier',
          icon: '🪵',
          desc: 'Heavy acacia wood palisade and thornbush kraal protecting the potrero clearing.',
          isSpecialized: true,
        },
        {
          id: 'dry_stone_wall',
          label: 'Sandstone Fieldstone Wall',
          icon: '🪨',
          desc: 'Red sandstone fieldstone wall matching the distant kopje plateaus.',
          isSpecialized: true,
        },
        {
          id: 'wire_mesh_backstop',
          label: 'Wire Mesh Backstop',
          icon: '🥅',
          desc: 'Protective wire backstop perimeter.',
        },
      ];

    case 'highway':
      return [
        {
          id: 'guardrail_barrier',
          label: 'Galvanized Crash Guardrail',
          icon: '🚧',
          desc: 'Heavy Armco W-beam galvanized corrugated steel highway crash guardrail with amber reflectors.',
          isSpecialized: true,
        },
        {
          id: 'concrete_wall',
          label: 'Pre-Cast Highway Sound Wall',
          icon: '🏢',
          desc: 'Acoustic concrete sound barrier panels isolating the stadium from arterial freeway noise.',
        },
        {
          id: 'chainlink_fence',
          label: 'Highway Perimeter Chainlink Fence',
          icon: '⛓️',
          desc: 'Tall galvanized wire mesh keeping spectators off the active freeway lanes.',
        },
      ];

    case 'airport':
      return [
        {
          id: 'chainlink_fence',
          label: 'FAA Security Chainlink Fence',
          icon: '⛓️',
          desc: 'Heavy-gauge airfield security wire mesh with triple-strand razor wire outrigger arms.',
        },
        {
          id: 'concrete_wall',
          label: 'Tarmac Blast Wall',
          icon: '🏢',
          desc: 'Reinforced concrete jet blast deflection wall along runway perimeter.',
        },
        {
          id: 'glass_balustrade',
          label: 'Observation Deck Glass Barrier',
          icon: '💎',
          desc: 'Acoustic laminated glass balustrade overlooking the runway apron.',
          isSpecialized: true,
        },
      ];

    case 'railroad':
      return [
        {
          id: 'corrugated_hoarding',
          label: 'Industrial Corrugated Metal Wall',
          icon: '📻',
          desc: 'Heavy corrugated galvanized metal siding separating pitch from railyard tracks.',
        },
        {
          id: 'chainlink_fence',
          label: 'Rail Security Chainlink Fence',
          icon: '⛓️',
          desc: 'Galvanized chainlink fence with yellow track hazard warning plaques.',
        },
        {
          id: 'guardrail_barrier',
          label: 'Trackside Steel Barrier',
          icon: '🚧',
          desc: 'Steel safety crash barrier along rail ballast corridor.',
          isSpecialized: true,
        },
        {
          id: 'brick_wall',
          label: 'Railway Victorian Brick Viaduct Wall',
          icon: '🧱',
          desc: 'Aged engineering brick retaining wall with stone coping.',
        },
      ];

    case 'marine_floating':
      return [
        {
          id: 'nautical_rope_barrier',
          label: 'Nautical Rope & Mooring Bollards',
          icon: '⚓',
          desc: 'Braided marine rope strung between heavy cast-iron mooring bollards and timber pilings.',
          isSpecialized: true,
        },
        {
          id: 'glass_balustrade',
          label: 'Tempered Waterfront Glass Balustrade',
          icon: '💎',
          desc: 'Clear tempered glass offering an unobstructed view over turquoise ocean surf.',
          isSpecialized: true,
        },
        {
          id: 'weathered_wooden_pickets',
          label: 'Weathered Pier Timber Railing',
          icon: '🪵',
          desc: 'Weathered timber pier railing with brass fittings and lifesaver rings.',
          isSpecialized: true,
        },
        {
          id: 'stone_seawall',
          label: 'Stone Breakwater Seawall',
          icon: '🌊',
          desc: 'Heavy granite caisson seawall absorbing marine swells.',
          isSpecialized: true,
        },
      ];

    case 'parking_lot':
      return [
        {
          id: 'concrete_wall',
          label: 'Concrete Security Wall with Stencils',
          icon: '🏢',
          desc: 'Pre-cast parking perimeter wall with painted bay numbers and graffiti.',
        },
        {
          id: 'chainlink_fence',
          label: 'Parking Perimeter Chainlink Fence',
          icon: '⛓️',
          desc: 'Galvanized diamond wire mesh with streetlamp poles.',
        },
        {
          id: 'guardrail_barrier',
          label: 'Galvanized Crash Guardrail',
          icon: '🚧',
          desc: 'Corrugated steel parking lot perimeter crash barrier.',
          isSpecialized: true,
        },
      ];

    default:
      return [
        {
          id: 'chainlink_fence',
          label: 'Chainlink Steel Fence',
          icon: '⛓️',
          desc: 'Galvanized diamond wire mesh with barbed wire arms.',
        },
        {
          id: 'brick_wall',
          label: 'Aged Brick Wall',
          icon: '🧱',
          desc: 'Flemish-bond red brick wall with stone coping.',
        },
        {
          id: 'concrete_wall',
          label: 'Concrete Security Wall',
          icon: '🏢',
          desc: 'Pre-cast concrete security wall.',
        },
        {
          id: 'rustic_timber',
          label: 'Rustic Timber Palisade',
          icon: '🪵',
          desc: 'Vertical wooden palings with iron nails.',
        },
        {
          id: 'corrugated_hoarding',
          label: 'Corrugated Hoarding',
          icon: '📻',
          desc: 'Galvanized metal hoarding with retro sponsors.',
        },
      ];
  }
}

/**
 * Returns default contextual perimeter finish for a given surroundings and grounds combo
 */
export function getDefaultPerimeterForContext(
  surroundings: SurroundingsType,
  grounds?: StadiumGroundsType
): PerimeterFinishType {
  const options = getContextualPerimeters(surroundings, grounds);
  return options[0]?.id || 'chainlink_fence';
}

/**
 * Decoupled Fence & Perimeter Barrier Specification
 */
export type BarrierSize = 'none' | 'small' | 'medium' | 'big' | 'huge';
export type BarrierMaterial = 'brick' | 'cement' | 'wood' | 'chain_link' | 'aluminum_picket' | 'corrugated_sheet';

export interface StandBarrierConfig {
  size: BarrierSize;
  material: BarrierMaterial;
}

/**
 * ============================================================================
 * PHASE T5: PITCHSIDE TIER SAFETY FENCE & PITCH BARRIER ARCHITECTURE
 * ============================================================================
 * 7 Authentic Architectural Barrier Typologies positioned precisely between
 * the lowest stand tier (Tier 1 of tiered stands, or the pitch-level step of
 * wall stands) and the pitch apron / infill.
 */
export type PitchsideBarrierType =
  | 'red_brick'
  | 'steel_chain'
  | 'high_steel_chain'
  | 'anti_barristas'
  | 'heavy_timber'
  | 'functional_concrete'
  | 'led_ribbon';

export interface PitchsideBarrierOption {
  id: PitchsideBarrierType;
  label: string;
  shortLabel: string;
  icon: string;
  desc: string;
  heightCategory: 'low' | 'standard' | 'tall' | 'overhanging';
}

export const PITCHSIDE_BARRIER_OPTIONS: PitchsideBarrierOption[] = [
  {
    id: 'red_brick',
    label: 'Traditional English Low Brick Wall',
    shortLabel: 'Red Brick',
    icon: '🧱',
    desc: 'Low red brick parapet with weathered mortar joints and light grey stone coping (classic British ground).',
    heightCategory: 'low',
  },
  {
    id: 'steel_chain',
    label: 'South American Steel Chainlink Fence',
    shortLabel: 'Steel Chain',
    icon: '⛓️',
    desc: 'Standard-height galvanized steel wire mesh chain-link fence on tubular metal stanchions (iconic South American domestic football aesthetic).',
    heightCategory: 'standard',
  },
  {
    id: 'high_steel_chain',
    label: 'High-Protection Security Chainlink Fence',
    shortLabel: 'High Chain',
    icon: '🛡️',
    desc: 'Taller galvanized chain-link security fence with reinforced diagonal support bracing and vertical tension cables.',
    heightCategory: 'tall',
  },
  {
    id: 'anti_barristas',
    label: 'Towering Anti-Invasion Security Barrier',
    shortLabel: 'Anti-Barristas',
    icon: '⚔️',
    desc: 'Maximum security perimeter fence with outward-angled steel cantilever overhanging pitch topped with razor wire coils.',
    heightCategory: 'overhanging',
  },
  {
    id: 'heavy_timber',
    label: 'Rustic Heavy Timber Post-and-Rail',
    shortLabel: 'Heavy Timber',
    icon: '🪵',
    desc: 'Low decorative barrier constructed from thick dark-stained timber balks, cross-rails, and wrought-iron carriage bolts.',
    heightCategory: 'low',
  },
  {
    id: 'functional_concrete',
    label: 'Monolithic Brutalist Concrete Barrier',
    shortLabel: 'Concrete',
    icon: '🏢',
    desc: 'Purely functional, low poured-concrete retaining wall with chamfered top edges, expansion joint gaps, and painted safety markings.',
    heightCategory: 'low',
  },
  {
    id: 'led_ribbon',
    label: 'Modern Digital Sponsor LED Ribbon',
    shortLabel: 'LED Ribbon',
    icon: '📺',
    desc: 'Modern illuminated LED display boards running continuously with glowing sponsor graphics and neon club animations.',
    heightCategory: 'standard',
  },
];

export function resolvePitchsideBarrier(
  stand?: StandConfig,
  stadiumDef?: StadiumDefinition
): PitchsideBarrierType {
  if (stand?.pitchsideBarrier) return stand.pitchsideBarrier;
  if (stadiumDef?.pitchsideBarrier) return stadiumDef.pitchsideBarrier;
  if (stand?.barrier) {
    const mat = typeof stand.barrier === 'string' ? stand.barrier : (stand.barrier as any).material;
    const sz = typeof stand.barrier === 'object' ? (stand.barrier as any).size : undefined;
    if (mat === 'brick') return 'red_brick';
    if (mat === 'wood') return 'heavy_timber';
    if (mat === 'cement') return 'functional_concrete';
    if (mat === 'chain_link') {
      return sz === 'huge' ? 'anti_barristas' : sz === 'big' ? 'high_steel_chain' : 'steel_chain';
    }
  }
  if (stand?.grade === 'grade5_futuristic' || stand?.grade === 'grade4_modern') return 'led_ribbon';
  if (stand?.grade === 'grade2_classic') return 'red_brick';
  if (stand?.grade === 'grade1_historic_timber' || stand?.grade === 'grade1_municipal') return 'heavy_timber';
  if (stand?.grade === 'grade3_industrial' || stand?.grade === 'grade3_steel_cantilever') return 'steel_chain';
  return 'steel_chain';
}

/**
 * 12.2.6 Seat Styles & Patterns
 */
export type SeatStyle = 'plastic_bench' | 'classic_bucket' | 'tip_up_padded' | 'vip_leather';
export type SeatPattern =
  | 'solid'
  | 'perStand'
  | 'horizontalBands'
  | 'verticalStripes'
  | 'lowerUpper'
  | 'checkered'
  | 'letter_mosaic';

/**
 * Phase A5.2: 3 Distinct Functional Seat Archetypes
 * 1. Molded Ergonomic Bucket Seats (curved backrests, central number stamp, specular highlights)
 * 2. Folding Wooden Heritage Benches (slatted timber bench rows, cast-iron frame legs)
 * 3. Metallic Tip-Up Flip Seats (professional alloy flip-up seats with spring-loaded undercarriage shadows)
 */
export type SeatArchetype =
  | 'molded_bucket'
  | 'wooden_heritage_bench'
  | 'metallic_tip_up'
  | 'concrete_terrace'
  // Phase T6 Inherent Architectural Grade Seat Archetypes:
  | 'tablones'
  | 'concrete_ledges'
  | 'industrial_flip'
  | 'theater_chairs'
  | 'modern_bucket';

export interface SeatArchetypeOption {
  id: SeatArchetype;
  label: string;
  icon: string;
  desc: string;
}

export const SEAT_ARCHETYPE_OPTIONS: SeatArchetypeOption[] = [
  {
    id: 'tablones',
    label: 'Timber Tablones (Municipal Grade 1)',
    icon: '🪵',
    desc: 'Rustic timber planks bolted directly to pipe scaffolding frames without backrests (Level 1).',
  },
  {
    id: 'concrete_ledges',
    label: 'Concrete Ledges (Brutalist Grade 2)',
    icon: '🏛️',
    desc: 'Solid poured monolithic concrete steps with blocky stone dividers and aggregate textures (Level 2).',
  },
  {
    id: 'industrial_flip',
    label: 'Industrial Flip-Seats (Industrial Grade 3)',
    icon: '⚙️',
    desc: 'Rugged metal flip-up seats mounted on heavy steel plate brackets with undercarriage springs (Level 3).',
  },
  {
    id: 'theater_chairs',
    label: 'Classical Theater Chairs (Victorian Grade 4)',
    icon: '🧱',
    desc: 'Polished hardwood slats and ornamental cast-iron scrollwork armrests with brass rivets (Level 4).',
  },
  {
    id: 'modern_bucket',
    label: 'Ergonomic Bucket Seats (Modern Grade 5)',
    icon: '💺',
    desc: 'Contoured ergonomic individual plastic bucket seats with curved backrests and specular gloss (Level 5).',
  },
  // Legacy Aliases
  {
    id: 'molded_bucket',
    label: 'Molded Ergonomic Bucket',
    icon: '💺',
    desc: 'Modern contoured plastic bucket seats with curved backrests, central seat number stamp, and specular highlights.',
  },
  {
    id: 'wooden_heritage_bench',
    label: 'Folding Wooden Heritage Bench',
    icon: '🪵',
    desc: 'Vintage slatted timber plank bench rows with dark cast-iron frame legs and weathered iron rivets.',
  },
  {
    id: 'metallic_tip_up',
    label: 'Metallic Tip-Up Flip Seat',
    icon: '⚙️',
    desc: 'Professional brushed alloy flip-up seats with spring-loaded undercarriage shadows and metallic beveled edge.',
  },
];

/**
 * Phase T6: Inherent Seat Style Resolution based on Architectural Grade
 */
export function resolveStandSeatArchetype(
  grade: ArchitecturalGrade,
  explicit?: SeatArchetype,
  seatStyle?: SeatStyle,
  standGrade?: StandGrade
): SeatArchetype {
  if (explicit && explicit !== 'molded_bucket') {
    return explicit;
  }
  switch (grade) {
    case 'municipal':
      return 'tablones';
    case 'brutalist':
      return 'concrete_ledges';
    case 'industrial':
      return 'industrial_flip';
    case 'victorian':
      return 'theater_chairs';
    case 'modern':
      return 'modern_bucket';
    default:
      return 'concrete_ledges';
  }
}

/**
 * Phase T6: Seat Level Ranking (Levels 1 to 5)
 */
export function getSeatLevelRank(gradeOrArchetype?: ArchitecturalGrade | SeatArchetype | string): number {
  switch (gradeOrArchetype) {
    case 'municipal':
    case 'tablones':
    case 'wooden_bench':
      return 1;
    case 'brutalist':
    case 'concrete_ledges':
    case 'molded_bucket':
      return 2;
    case 'industrial':
    case 'industrial_flip':
    case 'steel_deck_bench':
      return 3;
    case 'victorian':
    case 'theater_chairs':
    case 'tip_up_padded':
      return 4;
    case 'modern':
    case 'modern_bucket':
    case 'vip_leather_armchair':
    case 'retro_rotomolded':
      return 5;
    default:
      return 2;
  }
}

export function resolveSeatArchetype(
  explicit?: SeatArchetype,
  seatStyle?: SeatStyle,
  standGrade?: StandGrade
): SeatArchetype {
  if (explicit) return explicit;
  if (seatStyle === 'classic_bucket') return 'modern_bucket';
  if (seatStyle === 'plastic_bench') return 'tablones';
  if (seatStyle === 'tip_up_padded') return 'industrial_flip';
  if (seatStyle === 'vip_leather') return 'theater_chairs';

  if (standGrade === 'grade1_historic_timber' || standGrade === 'grade1_municipal') {
    return 'tablones';
  }
  if (standGrade === 'grade2_classic') {
    return 'theater_chairs';
  }
  if (standGrade === 'grade3_industrial' || standGrade === 'grade3_steel_cantilever') {
    return 'industrial_flip';
  }
  if (standGrade === 'grade4_modern' || standGrade === 'grade5_futuristic') {
    return 'modern_bucket';
  }
  return 'modern_bucket';
}

export interface StadiumSeatConfig {
  style: SeatStyle;
  pattern: SeatPattern;
  colors: string[]; // 1 to 4 colors hex
  archetype?: SeatArchetype; // Phase A5.2
}

/**
 * 12.2.10 Dynamic FIFA Qualification Category
 * - national: Capacity < 15,000, basic municipal/classic finishes
 * - first_division: Capacity 15,000–35,000, industrial/modern finishes
 * - continental: Capacity 35,000–60,000, modern finishes, high-power floodlights
 * - world: Capacity 60,000+, modern/futuristic finishes, premium lighting, pristine turf
 */
export type FifaQualification = 'national' | 'first_division' | 'continental' | 'world';

/**
 * 12.3 Manager & Player Dugout Benches Architecture
 * - recaro_racing: Recaro Racing Bucket Seats (Premier League / UCL luxury)
 * - covered_sunken: Covered Sunken Dugout Shelter (sub-surface trench with transparent shield)
 * - classic_timber: Classic Timber Bench (slatted grassroots wood)
 * - utilitarian_concrete: Utilitarian Concrete Dugout (heavy cast cinder-block bunker)
 * - folding_chairs: Pitch-Level Folding Chairs (community ground portable chairs)
 */
export type BenchType =
  | 'recaro_racing'
  | 'racing_bucket'
  | 'covered_sunken'
  | 'classic_timber'
  | 'utilitarian_concrete'
  | 'concrete_dugout'
  | 'folding_chairs';

export type BenchQualityTier = 'municipal' | 'classic' | 'modern' | 'elite_vip' | 'luxury';

export interface DugoutConfig {
  type: BenchType;
  quality: BenchQualityTier;
  frameColor: string;
  cushionColor: string;
  shelterTint: string; // e.g. 'rgba(15, 23, 42, 0.9)'
  setbackDistance: number; // pixels / meters from touchline
  capacityPerBench?: number; // default 14-18 seats
}

/**
 * 12.4 Player Entrance Tunnels Architecture
 * - inflatable_accordion: Iconic South American flexible bellows / tube
 * - modern_architectural: High-tech backlit LED ribbon tunnel with dark matte panels
 * - subterranean_staircase: Sunken concrete steps from dressing rooms
 * - direct_portal: Arched masonry portal with metal security grille
 * - telescopic_canopy: Motorized sliding transparent canopy on rolling tracks
 */
export type TunnelType =
  | 'inflatable_accordion'
  | 'modern_architectural'
  | 'subterranean_staircase'
  | 'direct_portal'
  | 'telescopic_canopy';

export type TunnelSiting = 'center_main' | 'corner' | 'behind_goal';

export interface EntranceTunnelConfig {
  type: TunnelType;
  siting: TunnelSiting;
  primaryColor: string;
  secondaryColor: string;
  hasBellows?: boolean;
  backlitLeds?: boolean;
  canopyTint?: string;
}

/**
 * Stand Position Coordinates
 * - east: Right touchline stand
 * - west: Left touchline main stand (hosts dugouts & entrance tunnel)
 * - north: Top end stand (behind north goal)
 * - south: Bottom end stand (behind south goal)
 * - corner_ne, corner_nw, corner_se, corner_sw: 4 corner quadrant stands
 */
export type StandPosition =
  | 'east'
  | 'west'
  | 'north'
  | 'south'
  | 'corner_ne'
  | 'corner_nw'
  | 'corner_se'
  | 'corner_sw';

export type TierBalustradeStyle =
  | 'metal_railing'
  | 'leitch_lattice'
  | 'industrial_mesh'
  | 'glass_balustrade'
  | 'illuminated_glass';

export type StandDeckMaterial = 'concrete' | 'timber' | 'steel' | 'composite';

export type RearWallMaterial = 'brick' | 'concrete' | 'corrugated_steel' | 'timber' | 'stone';

/**
 * Phase D4.5B: Multi-Floor Tier Balcony Fascia Material Finishes
 */
export type TierFasciaMaterial = 'concrete' | 'brick' | 'steel' | 'timber' | 'composite';

/**
 * Phase T3: Stand Density System & Decoupled Deck Sizing (Tiered & Wall Stands)
 * - reduced: -1 row, spacious legroom, -15% capacity
 * - normal: baseline standard spacing
 * - high_density: +1 to +4 rows, compact packing, +25% capacity
 */
export type StandDensity = 'reduced' | 'normal' | 'high_density';

export interface StandDensityOption {
  id: StandDensity;
  label: string;
  shortLabel: string;
  icon: string;
  desc: string;
  factor: number;
  rowDeltaText: string;
}

export const STAND_DENSITY_OPTIONS: StandDensityOption[] = [
  {
    id: 'reduced',
    label: 'Reduced Density',
    shortLabel: 'Reduced',
    icon: '💺',
    desc: 'Spacious legroom with wider treads (-1 row, -15% capacity)',
    factor: 0.85,
    rowDeltaText: '-1 Row',
  },
  {
    id: 'normal',
    label: 'Normal Density',
    shortLabel: 'Normal',
    icon: '👥',
    desc: 'Standard professional spacing (baseline capacity)',
    factor: 1.0,
    rowDeltaText: 'Default',
  },
  {
    id: 'high_density',
    label: 'High Density',
    shortLabel: 'High',
    icon: '🔥',
    desc: 'Compact supporter packing (+1 to +4 rows, +25% capacity)',
    factor: 1.25,
    rowDeltaText: '+1 to +4 Rows',
  },
];

export interface StandDeckConfig {
  size: TierSize;
  density?: StandDensity; // Phase T3: Decoupled deck density
  deckMaterial?: StandDeckMaterial;
  balustradeStyle?: TierBalustradeStyle;
  fasciaMaterial?: TierFasciaMaterial;
  isVip?: boolean; // Phase T9: Dedicated luxury VIP hospitality deck
  vipSeatType?: VipSeatType;
  vomitoryArchitecture?: VomitoryArchitecture; // Phase T11: Unified Grandstand Stairs & 3-Vomitory Tunnel Architectures
}

/**
 * ============================================================================
 * PHASE T9: VIP HOSPITALITY TIER, EXECUTIVE AMENITIES & FIFA WORLD CERTIFICATION
 * ============================================================================
 * 3 Exclusive Luxury VIP Seat Types & Materials:
 * 1. plush_armchair: Burgundy velvet or club-color deep leather armchairs with diamond stitched tufting.
 * 2. executive_bucket: Premium quilted composite automotive racing-style seats with integrated headrests.
 * 3. champagne_bar_stool: Elevated brushed chrome swivel barstools with marble drink ledges.
 */
export type VipSeatType =
  | 'plush_armchair'
  | 'executive_bucket'
  | 'champagne_bar_stool';

export interface VipSeatOption {
  id: VipSeatType;
  label: string;
  shortLabel: string;
  icon: string;
  seatLevel: 6;
  desc: string;
  materialFinish: string;
}

export const VIP_SEAT_OPTIONS: VipSeatOption[] = [
  {
    id: 'plush_armchair',
    label: 'Plush Leather Armchair',
    shortLabel: 'Plush Armchair',
    icon: '🛋️',
    seatLevel: 6,
    desc: 'Deep burgundy velvet or club-tinted leather armchairs with diamond stitched tufting and private side tables.',
    materialFinish: 'burgundy_leather',
  },
  {
    id: 'executive_bucket',
    label: 'Executive Quilted Bucket',
    shortLabel: 'Executive Bucket',
    icon: '💺',
    seatLevel: 6,
    desc: 'Automotive racing-style bucket seats with quilted microfiber cushioning, chrome side supports, and drink holders.',
    materialFinish: 'quilted_composite',
  },
  {
    id: 'champagne_bar_stool',
    label: 'Champagne High Barstool',
    shortLabel: 'Barstool & Ledge',
    icon: '🍸',
    seatLevel: 6,
    desc: 'Elevated brushed chrome swivel barstools with marble cocktail drink ledges overlooking the pitch.',
    materialFinish: 'chrome_marble',
  },
];

/**
 * ============================================================================
 * PHASE T10: NEW 4-CORNER ARCHITECTURE TAXONOMY
 * ============================================================================
 * 4 Clean Distinct Architectural Options Selectable Independently:
 * 1. round / rounded: Sweeping curved multi-tier approach (up to 4 tiers) uniting stands in a smooth continuous round arc (Camp Nou & Bombonera Western corners)
 * 2. square / giant: Massive towering corner stand (St. James' Park / The Wall for corners, steep continuous monolithic rake)
 * 3. tower: Flanking vertical VIP hospitality suite tower (La Bombonera Eastern corner towers)
 * 4. none / no_stand: Open corner with low perimeter barrier, ground-matched fill, and bespoke corner landmarks
 */
export type CornerStandType =
  | 'round'
  | 'rounded'
  | 'square'
  | 'giant'
  | 'tower'
  | 'none'
  | 'no_stand';

export interface CornerStandOption {
  id: 'round' | 'square' | 'tower' | 'none';
  label: string;
  shortLabel: string;
  badge: string;
  icon: string;
  desc: string;
}

export const CORNER_STAND_OPTIONS: CornerStandOption[] = [
  {
    id: 'round',
    label: 'Round Sweeping Corner',
    shortLabel: 'Round',
    badge: 'ROUND',
    icon: '🔄',
    desc: 'Sweeping curved multi-tier approach (up to 4 tiers) uniting stands in a smooth continuous round arc (Camp Nou style)',
  },
  {
    id: 'square',
    label: 'Giant Soaring Wall Corner',
    shortLabel: 'Square/Giant',
    badge: 'GIANT',
    icon: '🏛️',
    desc: 'Massive towering corner stand with steep monolithic rake and continuous crash barriers (St. James style)',
  },
  {
    id: 'tower',
    label: 'VIP Hospitality Tower',
    shortLabel: 'Tower',
    badge: 'TOWER',
    icon: '🏢',
    desc: 'Flanking vertical VIP tower with stacked glass palcos, suites, and observation decks (Bombonera style)',
  },
  {
    id: 'none',
    label: 'Open Corner (No Stand)',
    shortLabel: 'No Stand',
    badge: 'OPEN',
    icon: '🌳',
    desc: 'Open corner with low perimeter barrier, ground-matched fill, and bespoke landmarks (Clock Tower, Floodlight Pylon)',
  },
];

export function resolveCornerArchitectureType(type?: StandType | string): 'round' | 'giant' | 'tower' | 'none' {
  if (!type || type === 'none' || type === 'no_stand') return 'none';
  if (type === 'round' || type === 'rounded' || type === 'tiered') return 'round';
  if (type === 'square' || type === 'giant' || type === 'wall' || type === 'stacked_wall') return 'giant';
  if (type === 'tower' || type === 'vip_building') return 'tower';
  return 'round';
}

export function isCornerRound(type?: StandType | string): boolean {
  return resolveCornerArchitectureType(type) === 'round';
}

export function isCornerGiant(type?: StandType | string): boolean {
  return resolveCornerArchitectureType(type) === 'giant';
}

export function isCornerTower(type?: StandType | string): boolean {
  return resolveCornerArchitectureType(type) === 'tower';
}

export function isCornerNoStand(type?: StandType | string): boolean {
  return resolveCornerArchitectureType(type) === 'none';
}

/**
 * Hotfix Phase T14L: 2.5D Oblique Architectural Prism Geometry for Corner VIP Towers
 */
export interface CornerTowerGeometry {
  pos: 'corner_nw' | 'corner_ne' | 'corner_se' | 'corner_sw';
  bounds: { x: number; y: number; w: number; h: number };
  rooftop: { x: number; y: number; w: number; h: number };
  mainElevation: { x: number; y: number; w: number; h: number };
  lateralFlank: { x: number; y: number; w: number; h: number; side: 'east' | 'west' };
  isNorth: boolean;
  isSouth: boolean;
  isWest: boolean;
  isEast: boolean;
  floors: VipFloorCount;
}

/**
 * Hotfix Phase T14L: Resolves the 2.5D oblique architectural prism geometry
 * for Corner VIP Towers across all 4 quadrants (NW, NE, SE, SW).
 */
export function getCornerTowerGeometry(
  pos: 'corner_nw' | 'corner_ne' | 'corner_se' | 'corner_sw',
  left: number,
  right: number,
  top: number,
  bottom: number,
  standDepthX: number,
  standDepthY: number,
  floors: VipFloorCount = 4
): CornerTowerGeometry {
  const isNorth = pos === 'corner_nw' || pos === 'corner_ne';
  const isSouth = pos === 'corner_sw' || pos === 'corner_se';
  const isWest = pos === 'corner_nw' || pos === 'corner_sw';
  const isEast = pos === 'corner_ne' || pos === 'corner_se';

  const cW = Math.max(70, standDepthX);
  const cH = Math.max(70, standDepthY);
  const tX = isWest ? left - cW : right;
  const tY = isNorth ? top - cH : bottom;

  const roofH = Math.max(14, Math.min(26, Math.round(cH * 0.18)));
  const bodyY = tY + roofH;
  const bodyH = cH - roofH;

  const flankW = Math.max(16, Math.min(32, Math.round(cW * 0.22)));
  const mainW = cW - flankW;

  const rooftop = { x: tX, y: tY, w: cW, h: roofH };

  let mainElevation: { x: number; y: number; w: number; h: number };
  let lateralFlank: { x: number; y: number; w: number; h: number; side: 'east' | 'west' };

  if (isWest) {
    // NW, SW: Inner side facing pitch/goal line is East (right side of tower box)
    mainElevation = { x: tX, y: bodyY, w: mainW, h: bodyH };
    lateralFlank = { x: tX + mainW, y: bodyY, w: flankW, h: bodyH, side: 'east' };
  } else {
    // NE, SE: Inner side facing pitch/goal line is West (left side of tower box)
    lateralFlank = { x: tX, y: bodyY, w: flankW, h: bodyH, side: 'west' };
    mainElevation = { x: tX + flankW, y: bodyY, w: mainW, h: bodyH };
  }

  return {
    pos,
    bounds: { x: tX, y: tY, w: cW, h: cH },
    rooftop,
    mainElevation,
    lateralFlank,
    isNorth,
    isSouth,
    isWest,
    isEast,
    floors,
  };
}

/**
 * Hotfix Phase T14M: Southern Corner 2.5D High-Oblique Structural Metrics
 * Distinguishes the southern (SW/SE) foreground rear structure and concourse overlook
 * from the strictly preserved northern (NW/NE) stands.
 */
export interface SouthernCornerObliqueMetrics {
  pos: 'corner_sw' | 'corner_se';
  activeSeatingH: number;
  promenadeH: number;
  isSouthGoalTiered: boolean;
  hasConcourseOverlook: boolean;
  buttressCount: number;
  rakerBracketCount: number;
}

export function getSouthernCornerObliqueMetrics(
  pos: 'corner_nw' | 'corner_ne' | 'corner_se' | 'corner_sw',
  deckAreaH: number,
  isWall: boolean = false
): SouthernCornerObliqueMetrics | null {
  if (pos !== 'corner_sw' && pos !== 'corner_se') return null;
  const activeSeatingH = isWall ? deckAreaH : Math.round(deckAreaH * 0.55);
  const promenadeH = Math.max(12, deckAreaH - activeSeatingH);
  return {
    pos,
    activeSeatingH,
    promenadeH,
    isSouthGoalTiered: !isWall,
    hasConcourseOverlook: !isWall,
    buttressCount: isWall ? 4 : 4,
    rakerBracketCount: 4,
  };
}

/**
 * Hotfix Phase T14N: Southern Corner Exterior Facade, Outer Wall Miter & Grounding Plinth Metrics
 * Calculates seamless outer wall miter wrap from touchline stands into South facade,
 * high-oblique foundation plinths with contact drop shadows, and exterior circulation stairs/turnstiles.
 */
export interface SouthCornerFacadeMiterMetrics {
  pos: 'corner_sw' | 'corner_se';
  touchlineStartX: number;
  touchlineStartY: number;
  southFacadeEndX: number;
  southFacadeEndY: number;
  miterLength: number;
  wallThickness: number;
  plinthHeight: number;
  copingColor: string;
  foundationColor: string;
  shadowColor: string;
  hasStaircase: boolean;
  hasTurnstileNode: boolean;
  hasExitSign: boolean;
  isContinuous: boolean;
}

export interface SouthCornerPlinthGrounding {
  grounds: StadiumGroundsType | string;
  shadowOpacity: number;
  shadowOffsetY: number;
  plinthColor: string;
  bevelColor: string;
  copingColor: string;
}

export function getSouthCornerFacadeMiterMetrics(
  pos: 'corner_nw' | 'corner_ne' | 'corner_se' | 'corner_sw',
  left: number,
  right: number,
  bottom: number,
  standDepthX: number,
  standDepthY: number,
  perspective?: StandPerspectiveMetrics,
  mat: RearWallMaterial = 'brick',
  grade: StandGrade = 'grade2_classic',
  timeOfDay: TimeOfDay = 'night'
): SouthCornerFacadeMiterMetrics | null {
  if (pos !== 'corner_sw' && pos !== 'corner_se') return null;

  const isNight = timeOfDay === 'night';
  const sTaper = perspective ? perspective.southTaperX : Math.round(standDepthY * 0.25);
  const effTau = Math.min(sTaper, standDepthX * 0.45);

  let touchlineStartX = 0;
  const touchlineStartY = bottom;
  let southFacadeEndX = 0;
  const southFacadeEndY = bottom + standDepthY;

  if (pos === 'corner_sw') {
    touchlineStartX = left - standDepthX;
    southFacadeEndX = left - effTau;
  } else {
    // corner_se
    touchlineStartX = right + standDepthX;
    southFacadeEndX = right + effTau;
  }

  const dx = southFacadeEndX - touchlineStartX;
  const dy = southFacadeEndY - touchlineStartY;
  const miterLength = Math.hypot(dx, dy);

  const copingColor = mat === 'brick'
    ? (isNight ? '#fde047' : '#fef08a')
    : mat === 'corrugated_steel'
    ? '#94a3b8'
    : mat === 'timber'
    ? '#92400e'
    : (grade === 'grade5_futuristic' ? '#38bdf8' : '#cbd5e1');

  const foundationColor = isNight ? '#0b0f19' : '#1e293b';
  const shadowColor = 'rgba(0, 0, 0, 0.52)';

  return {
    pos,
    touchlineStartX,
    touchlineStartY,
    southFacadeEndX,
    southFacadeEndY,
    miterLength,
    wallThickness: 14,
    plinthHeight: 12,
    copingColor,
    foundationColor,
    shadowColor,
    hasStaircase: true,
    hasTurnstileNode: true,
    hasExitSign: true,
    isContinuous: true,
  };
}

export function getSouthCornerPlinthGrounding(
  grounds: StadiumGroundsType | string = 'parking_lots',
  timeOfDay: TimeOfDay = 'night',
  grade: StandGrade = 'grade2_classic'
): SouthCornerPlinthGrounding {
  const isNight = timeOfDay === 'night';
  let plinthColor = isNight ? '#0f172a' : '#1e293b';
  let bevelColor = '#cbd5e1';
  let copingColor = grade === 'grade5_futuristic' ? '#38bdf8' : '#e2e8f0';
  let shadowOpacity = 0.52;
  const shadowOffsetY = 10;

  if (grounds === 'classical_statues') {
    plinthColor = isNight ? '#3b0712' : '#7f1d1d';
    bevelColor = '#fef08a';
    copingColor = '#fde047';
  } else if (grounds === 'parking_lots') {
    plinthColor = isNight ? '#090d16' : '#1e293b';
    bevelColor = '#94a3b8';
    shadowOpacity = 0.58;
  } else if (grounds === 'mall_commercial') {
    plinthColor = isNight ? '#1e293b' : '#334155';
    bevelColor = '#cbd5e1';
  } else if (grounds === 'club_museum_trophies') {
    plinthColor = isNight ? '#111827' : '#1e293b';
    bevelColor = '#38bdf8';
    copingColor = '#f8fafc';
  } else if (grounds === 'park_recreation') {
    plinthColor = isNight ? '#052e16' : '#14532d';
    bevelColor = '#86efac';
  } else if (grounds === 'potrero_dirt') {
    plinthColor = isNight ? '#2e1005' : '#451a03';
    bevelColor = '#d97706';
    copingColor = '#b45309';
  } else if (grounds === 'modern_architectural') {
    plinthColor = isNight ? '#020617' : '#0f172a';
    bevelColor = '#38bdf8';
    copingColor = '#f8fafc';
  } else if (grounds === 'industrial_depot') {
    plinthColor = isNight ? '#0b0f19' : '#1e293b';
    bevelColor = '#94a3b8';
    copingColor = '#cbd5e1';
  } else if (grounds === 'municipal_thoroughfare') {
    plinthColor = isNight ? '#1e293b' : '#334155';
    bevelColor = '#cbd5e1';
  }

  return {
    grounds,
    shadowOpacity,
    shadowOffsetY,
    plinthColor,
    bevelColor,
    copingColor,
  };
}

/**
 * Phase T12.2 & Hotfix T13C: Monumental Giant Corner Depth Scaling
 * Small: 90px depth (matches Small Wall stand ~90px)
 * Medium: 150px depth (matches Medium Wall stand ~150px)
 * Large: 250px depth (matches Big Wall stand ~250px / St. James' Park monumental colossus)
 */
export function getGiantCornerMonumentalDepth(wallSize?: TierSize | WallTierSize): number {
  if (wallSize === 'small') return 120;
  if (wallSize === 'medium') return 180;
  return 240;
}

/**
 * Hotfix Phase T13C: Checks if two stands (e.g. corner stand and adjacent stand)
 * share the identical structural and dimensional configuration:
 * - Same typology (tiered vs tiered, wall/giant vs wall/giant, none vs none)
 * - Same tier count and tier sizes (for tiered stands)
 * - Same wall size (for wall/giant stands)
 */
export function isStandConfigurationEqual(a?: StandConfig, b?: StandConfig): boolean {
  if (!a || !b) return false;
  const rawTypeA = a.cornerType || a.type;
  const rawTypeB = b.cornerType || b.type;

  const isNoneA = rawTypeA === 'none' || rawTypeA === 'no_stand';
  const isNoneB = rawTypeB === 'none' || rawTypeB === 'no_stand';
  if (isNoneA && isNoneB) return true;
  if (isNoneA || isNoneB) return false;

  const archA = resolveCornerArchitectureType(rawTypeA);
  const archB = resolveCornerArchitectureType(rawTypeB);
  const isWallA = a.type === 'wall' || isTheWallStand(a) || archA === 'giant';
  const isWallB = b.type === 'wall' || isTheWallStand(b) || archB === 'giant';
  if (isWallA && isWallB) {
    const szA = a.wallSize || 'medium';
    const szB = b.wallSize || 'medium';
    return szA === szB;
  }
  if (isWallA !== isWallB) return false;

  const isTieredA = a.type === 'tiered' || archA === 'round';
  const isTieredB = b.type === 'tiered' || archB === 'round';
  if (isTieredA && isTieredB) {
    const countA = a.tierCount ?? (a.tiers && a.tiers.length > 0 ? a.tiers.length : 2);
    const countB = b.tierCount ?? (b.tiers && b.tiers.length > 0 ? b.tiers.length : 2);
    if (countA !== countB) return false;

    for (let i = 0; i < countA; i++) {
      const szA = a.tiers?.[i]?.size || (a as any).tierSize || 'medium';
      const szB = b.tiers?.[i]?.size || (b as any).tierSize || 'medium';
      if (szA !== szB) return false;
    }
    return true;
  }

  return false;
}

/**
 * ============================================================================
 * PHASE T11: UNIFIED GRANDSTAND STAIRS & 3-VOMITORY TUNNEL ARCHITECTURES
 * ============================================================================
 * 1. Unified Grandstand Stairs:
 *    - Exactly 2 vertical gangway stairs per standard stand tier.
 *    - Consecutive tiers stagger their stair positions to simulate realistic stadium
 *      crowd circulation and structural load distribution (e.g. 28%/72% vs 38%/62%).
 * 2. 3 Distinct Vomitory / Entrance Architectures:
 *    - tunnel_above: Elevated concourse portal at top of tier with descending steps into rows.
 *    - tunnel_below: Sub-deck pitchfront portal at front lip with ascending steps into rows.
 *    - rear_level: Centered mid-tier concourse portal opening directly onto gangway aisle.
 */
export type VomitoryArchitecture = 'tunnel_above' | 'tunnel_below' | 'rear_level';

export interface VomitoryOption {
  id: VomitoryArchitecture;
  label: string;
  shortLabel: string;
  desc: string;
  icon: string;
  accessFlow: 'descending' | 'ascending' | 'direct';
}

export const VOMITORY_ARCHITECTURE_OPTIONS: VomitoryOption[] = [
  {
    id: 'rear_level',
    label: 'Mid-Deck Direct Concourse',
    shortLabel: 'Mid-Deck',
    icon: '🚪',
    desc: 'Centered mid-tier portal opening directly onto gangway aisle with balanced spectator flow.',
    accessFlow: 'direct',
  },
  {
    id: 'tunnel_above',
    label: 'Upper Concourse Descent',
    shortLabel: 'Upper Descent',
    icon: '⬇️',
    desc: 'Elevated vomitory portal at tier top rim with descending access steps from upper concourse.',
    accessFlow: 'descending',
  },
  {
    id: 'tunnel_below',
    label: 'Pitchside Inset Ascent',
    shortLabel: 'Pitchside Ascent',
    icon: '⬆️',
    desc: 'Sub-deck vomitory portal at pitchfront lip with ascending steps rising into the tier.',
    accessFlow: 'ascending',
  },
];

export function resolveVomitoryArchitecture(
  stand?: StandConfig,
  stadium?: StadiumDefinition,
  tierIdx?: number
): VomitoryArchitecture {
  if (tierIdx !== undefined && stand?.tiers?.[tierIdx]?.vomitoryArchitecture) {
    return stand.tiers[tierIdx].vomitoryArchitecture!;
  }
  if (stand?.vomitoryArchitecture) {
    return stand.vomitoryArchitecture;
  }
  if (stadium?.vomitoryArchitecture) {
    return stadium.vomitoryArchitecture;
  }
  return 'rear_level';
}

/**
 * Phase T11: Unified Grandstand Stairs with Inter-Tier Staggering
 * Exactly 2 vertical gangway stairs per tier deck. Consecutive tiers stagger their
 * gangway stair positions to simulate realistic stadium crowd circulation and structural load distribution.
 */
export function getTierStairRatios(
  tierIndex: number,
  orientation: 'touchline' | 'goal' = 'touchline'
): [number, number] {
  const normIdx = Math.max(0, Math.floor(tierIndex)) % 4;
  if (orientation === 'touchline') {
    switch (normIdx) {
      case 0: return [0.28, 0.72];
      case 1: return [0.38, 0.62];
      case 2: return [0.24, 0.76];
      case 3: return [0.34, 0.66];
      default: return [0.28, 0.72];
    }
  } else {
    // Goal-end stands
    switch (normIdx) {
      case 0: return [0.30, 0.70];
      case 1: return [0.40, 0.60];
      case 2: return [0.26, 0.74];
      case 3: return [0.36, 0.64];
      default: return [0.30, 0.70];
    }
  }
}

export function areTierStairsStaggered(
  tierA: number,
  tierB: number,
  orientation: 'touchline' | 'goal' = 'touchline'
): boolean {
  const [a1] = getTierStairRatios(tierA, orientation);
  const [b1] = getTierStairRatios(tierB, orientation);
  return Math.abs(a1 - b1) > 0.04;
}


/**
 * Phase D4.5B: Resolves effective material finish for tier balcony fascias
 */
export function resolveTierFasciaMaterial(
  stand?: StandConfig,
  tierDeck?: StandDeckConfig
): TierFasciaMaterial {
  if (tierDeck?.fasciaMaterial) {
    return tierDeck.fasciaMaterial;
  }
  if (stand?.fasciaMaterial) {
    return stand.fasciaMaterial;
  }
  if (
    stand?.grandstandMaterial === 'victorian_brick' ||
    stand?.rearWallMaterial === 'brick' ||
    stand?.grade === 'grade2_classic'
  ) {
    return 'brick';
  }
  if (
    stand?.grandstandMaterial === 'industrial_steel' ||
    stand?.deckMaterial === 'steel' ||
    tierDeck?.deckMaterial === 'steel' ||
    stand?.rearWallMaterial === 'corrugated_steel' ||
    stand?.grade === 'grade3_industrial' ||
    stand?.grade === 'grade3_steel_cantilever'
  ) {
    return 'steel';
  }
  if (
    stand?.deckMaterial === 'timber' ||
    tierDeck?.deckMaterial === 'timber' ||
    stand?.grade === 'grade1_historic_timber' ||
    stand?.rearWallMaterial === 'timber'
  ) {
    return 'timber';
  }
  if (
    stand?.grandstandMaterial === 'composite_cladding' ||
    stand?.deckMaterial === 'composite' ||
    tierDeck?.deckMaterial === 'composite' ||
    stand?.grade === 'grade5_futuristic'
  ) {
    return 'composite';
  }
  return 'concrete';
}

/**
 * Phase T3: Dedicated Tier Chair Rows Resolution
 *
 * Tiered Grandstands:
 * - Reduced (-1 row): Small = 3 rows, Medium = 7 rows, Big/Large = 13 rows
 * - Normal (Default): Small = 4 rows, Medium = 8 rows, Big/Large = 14 rows
 * - High Density (+1 to +4 rows): Small = 5 rows (+1), Medium = 10 rows (+2), Big/Large = 18 rows (+4)
 */
export function resolveTierChairRows(size?: TierSize | WallTierSize, density: StandDensity = 'normal'): number {
  const sz = size || 'medium';
  if (density === 'reduced') {
    if (sz === 'small') return 3;
    if (sz === 'large') return 13;
    return 7;
  }
  if (density === 'high_density') {
    if (sz === 'small') return 5;
    if (sz === 'large') return 18;
    return 10;
  }
  // 'normal'
  if (sz === 'small') return 4;
  if (sz === 'large') return 14;
  return 8;
}

/**
 * Phase S2.1 & Phase T3: Stepped Chair Rows per Tier Size & Density
 * - When density is provided: returns Phase T3 row count
 * - When density is omitted: preserves legacy row counts (Small: 2, Medium: 3, Large: 4)
 */
export function getTierChairRows(size?: TierSize | WallTierSize, density?: StandDensity): number {
  if (density) {
    return resolveTierChairRows(size, density);
  }
  if (size === 'small') return 2;
  if (size === 'large') return 4;
  return 3; // 'medium' or default
}

/**
 * Phase HOTFIX SS1 & Phase T3: "The Wall" Stand Terrace Row Densities
 * Massive steep continuous standing terrace:
 * - Reduced: Small = 5 rows, Medium = 10 rows, Big/Large = 15 rows
 * - Normal: Small = 6 rows, Medium = 11 rows, Big/Large = 16 rows
 * - High Density: Small = 7 rows, Medium = 13 rows, Big/Large = 20 rows
 */
export function getWallTierChairRows(size?: WallTierSize, density?: StandDensity): number {
  if (size === 'small') {
    if (density === 'reduced') return 5;
    if (density === 'high_density') return 7;
    return 6;
  }
  if (size === 'large') {
    if (density === 'reduced') return 15;
    if (density === 'high_density') return 20;
    return 16;
  }
  // 'medium' or default / undefined
  if (density === 'reduced') return 10;
  if (density === 'high_density') return 13;
  return 11;
}

/**
 * Phase T3: Capacity Adjustment Factor based on Density
 * - reduced: -15% capacity factor (0.85)
 * - normal: 1.0 baseline factor
 * - high_density: +25% capacity boost (1.25)
 */
export function getDensityCapacityFactor(density?: StandDensity): number {
  if (density === 'reduced') return 0.85;
  if (density === 'high_density') return 1.25;
  return 1.0;
}

/**
 * Phase HOTFIX SS1 & Phase T3 & Phase T10: Resolves accurate seat/terrace row count for any stand configuration
 */
export function getStandChairRows(stand?: StandConfig, tierIdx: number = 0): number {
  if (!stand) return 3;
  if (stand.type === 'none' || stand.type === 'no_stand') return 0;
  if (stand.type === 'tower') return 0;
  if (stand.type === 'stacked_wall' || isStackedWallStand(stand)) {
    if (tierIdx === 0) {
      return getStackedWallLowerRows(stand);
    }
    if (tierIdx === 1) {
      return getStackedWallUpperRows(stand);
    }
    return 0;
  }
  if (stand.type === 'wall' || stand.type === 'square' || stand.type === 'giant' || stand.wallTier || (stand as any).isWall) {
    const density = stand.wallDensity || stand.density;
    return getWallTierChairRows(stand.wallSize || 'large', density);
  }
  const deck = stand.tiers?.[tierIdx];
  const density = deck?.density || stand.density;
  return getTierChairRows(deck?.size || 'medium', density);
}

export interface StandConfig {
  position: StandPosition;
  type: StandType;
  cornerType?: CornerStandType; // Phase T10: Dedicated 4-Corner Architecture Taxonomy
  grade?: StandGrade;
  tierCount?: 1 | 2 | 3 | 4;
  tiers?: StandDeckConfig[];
  wallSize?: WallTierSize;
  wallDensity?: StandDensity; // Phase T3: Dedicated Wall density
  wallTier?: any;
  density?: StandDensity;     // Phase T3: Stand-level density fallback
  primaryColor?: string;
  secondaryColor?: string;
  hasRoof?: boolean;
  roofCoverage?: number; // 0 to 1
  backdrop?: NoStandBackdrop;
  noStandBackdrop?: string;
  wallPerimeter?: WallPerimeterConfig;
  perimeterFinish?: PerimeterFinishType;
  barrier?: StandBarrierConfig;
  hasGrassrootsFans?: boolean; // Phase 15.7.3: Standing supporter presence leaning on barrier

  // Phase S2: Grandstand Density & Substance Overhaul
  rearWallMaterial?: RearWallMaterial;
  deckMaterial?: StandDeckMaterial;
  balustradeStyle?: TierBalustradeStyle;

  // Phase ST4: Pitch-View Eave Overhangs & Customization
  roofStyle?: RoofStyle;
  roofMaterial?: RoofMaterial;
  roofBorder?: RoofBorder;
  roofCutaway?: RoofCutawayMode;
  roofOverhang?: 'small' | 'medium' | 'large';

  // Phase A5.2: 3 Distinct Functional Seat Archetypes
  seatArchetype?: SeatArchetype;

  // Phase B3.1: Authentic 32-Bit Grandstand Materials
  grandstandMaterial?: GrandstandMaterial;

  // Phase D4.5B: Multi-Floor Tier Balcony Fascia Material Finish
  fasciaMaterial?: TierFasciaMaterial;

  // Phase T5: Pitchside Tier Safety Fence & Pitch Barrier Architecture (7 Authentic Typologies)
  pitchsideBarrier?: PitchsideBarrierType;

  // Phase T6: The 5-Grade "Architectural Grade" System & 3-Element Color Palette
  architecturalGrade?: ArchitecturalGrade;
  gradeColors?: GradeElementColors;

  // Phase T7: VIP Building Multi-Floor Elevator & Integrated Pitchside Stand
  vipFloors?: VipFloorCount;
  hasLowerStand?: boolean;
  lowerStandSize?: LowerStandSize;
  lowerStandMaterial?: LowerStandMaterial;
  lowerStandBarrier?: LowerStandBarrier;
  lowerStandSeat?: LowerStandSeat;

  // Phase T8: "Stacked Wall" Modern Coliseum Architecture (Metropolitano & Tottenham Style)
  stackedWallLowerSize?: WallTierSize;
  stackedWallLowerDensity?: StandDensity;
  stackedWallUpperSize?: WallTierSize;
  stackedWallUpperDensity?: StandDensity;
  stackedWallArchedCrown?: boolean;

  // Phase T9: VIP Hospitality Tier, Executive Amenities & FIFA "World" Category Certification
  hasVipSeats?: boolean;
  vipTierIndex?: number; // Dedicated luxury hospitality level (1 = 2nd level default; 2 = 3rd level when 3 total tiers exist)
  vipSeatType?: VipSeatType;
  hasVipZone?: boolean; // Executive indoor lounge & buffet pavilion embedded in middle concourse (-5% raw standing cap)
  hasTransmissionArea?: boolean; // Centerline elevated media commentary and TV broadcast box with rooftop antenna & cameras

  // Phase T11: Unified Grandstand Stairs & 3-Vomitory Tunnel Architectures
  vomitoryArchitecture?: VomitoryArchitecture;
}

/**
 * ============================================================================
 * PHASE ST4: PITCH-VIEW EAVE OVERHANGS, SIMS CUTAWAY TOGGLER & 4 ROOF STYLES
 * ============================================================================
 */

/**
 * ST4.1 Sims-Style 3-State Roof Cutaway Mode
 * - 'hidden': Cutaway 0% - roof canopy completely hidden, 100% unobstructed view into grandstand tiers & touchlines
 * - 'partial': Cutaway 50% (Default) - edge-only visible roofs in pitch view framing outer rows without occluding action
 * - 'full': Covered 100% - complete solid roof canopy extending over stands with cantilever trusses and soffits
 */
export type RoofCutawayMode = 'hidden' | 'partial' | 'full';

export interface RoofCutawayOption {
  id: RoofCutawayMode;
  label: string;
  icon: string;
  pct: string;
  desc: string;
}

export const ROOF_CUTAWAY_OPTIONS: RoofCutawayOption[] = [
  {
    id: 'hidden',
    label: 'Hidden (0%)',
    icon: '👁️',
    pct: '0%',
    desc: 'Canopy completely hidden for 100% unobstructed view into all grandstand tiers, vomitories, and touchlines.',
  },
  {
    id: 'partial',
    label: 'Edge Only (50%)',
    icon: '📐',
    pct: '50%',
    desc: 'Canopy projects inward along outer viewport edges with fluid rounded corner arcs, framing stands without occluding pitch action.',
  },
  {
    id: 'full',
    label: 'Covered (100%)',
    icon: '🏛️',
    pct: '100%',
    desc: 'Complete full canopy extends over spectator decks with cantilever rafters, trusses, and underside soffit shadows.',
  },
];

/**
 * ST4.2 & ST5.1 Architectural Roof Styles
 * - Rectangular & Square: cantilever_truss, barrel_vault, tensile_cable, spaceframe_halo
 * - Round & Oval Coliseum: spoke_wheel_tension, petal_ocular_halo, continuous_cantilever_ring, radial_louvered_pergola
 */
export type RoofStyle =
  | 'cantilever_truss'
  | 'barrel_vault'
  | 'tensile_cable'
  | 'spaceframe_halo'
  | 'gable_peak'
  | 'spoke_wheel_tension'
  | 'petal_ocular_halo'
  | 'continuous_cantilever_ring'
  | 'radial_louvered_pergola';

export interface RoofStyleOption {
  id: RoofStyle;
  label: string;
  icon: string;
  desc: string;
  shortLabel: string;
}

export const ROOF_STYLE_OPTIONS: RoofStyleOption[] = [
  {
    id: 'cantilever_truss',
    label: 'Classic Cantilever Truss',
    shortLabel: 'Truss',
    icon: '🏗️',
    desc: 'Traditional English box ground pitched canopy with exposed steel triangular lattice trusses and purlins.',
  },
  {
    id: 'barrel_vault',
    label: 'Barrel Vault Arch Canopy',
    shortLabel: 'Vault',
    icon: '🚇',
    desc: 'Continental European style cylindrical arching canopy supported by tubular steel curved ribs and tie-rods.',
  },
  {
    id: 'tensile_cable',
    label: 'Suspended Cable-Stayed Eaves',
    shortLabel: 'Tensile',
    icon: '⚓',
    desc: 'Modern engineering with slender external mast pylons and high-tensile steel stay-cables suspending ultra-thin floating roof.',
  },
  {
    id: 'spaceframe_halo',
    label: 'Space-Frame & 360° Halo Ribbon',
    shortLabel: 'Atlanta Halo',
    icon: '💫',
    desc: 'Ultra-modern Atlanta-style faceted space-frame truss canopy with inward-facing continuous 360° LED halo ribbon screen.',
  },
];

export const GABLE_PEAK_ROOF_OPTION: RoofStyleOption = {
  id: 'gable_peak',
  label: 'Classic Gable Peak Truss',
  shortLabel: 'Gable Peak',
  icon: '🏠',
  desc: 'Traditional British timber-and-iron double-pitched roof with wooden fascia boards, cross-ties, and downpipes.',
};

export const EXTENDED_ROOF_STYLE_OPTIONS: RoofStyleOption[] = [
  ...ROOF_STYLE_OPTIONS,
  GABLE_PEAK_ROOF_OPTION,
];

/**
 * ST5.1 Four Dedicated Continuous Roof Styles for Round & Oval Coliseum Stadiums
 */
export const ROUND_OVAL_ROOF_STYLE_OPTIONS: RoofStyleOption[] = [
  {
    id: 'spoke_wheel_tension',
    label: 'Annular Spoke-Wheel Tension Ring',
    shortLabel: 'Spoke-Wheel',
    icon: '🎡',
    desc: 'Outer steel compression ring with dual upper/lower radial cable spokes connected to a floating inner tension ring, covered with translucent PTFE membrane fabric (Olympiastadion Berlin / Maracanã).',
  },
  {
    id: 'petal_ocular_halo',
    label: 'Petal Ocular Dome & 360° Halo Board',
    shortLabel: 'Petal Halo',
    icon: '🌺',
    desc: 'Eight interlocking geometric triangular petals radiating inward toward a central ocular aperture with iconic 360° glowing video halo board (Mercedes-Benz Stadium Atlanta).',
  },
  {
    id: 'continuous_cantilever_ring',
    label: 'Continuous Elliptical Cantilever Ring',
    shortLabel: 'Cantilever Ring',
    icon: '🏟️',
    desc: 'Sleek sweeping curved cantilever canopy projecting uniformly inward around the entire 360° bowl perimeter with visible underside radial ribs (Wembley / San Siro Bowl).',
  },
  {
    id: 'radial_louvered_pergola',
    label: 'Open-Breeze Radial Louvered Pergola',
    shortLabel: 'Radial Louver',
    icon: '☀️',
    desc: 'Stepped concentric sun-shading blades with open air-circulation gaps, perimeter drainage ring, and decorative mast spikes (Mediterranean / Coastal Arena).',
  },
];

export const ALL_ROOF_STYLE_OPTIONS: RoofStyleOption[] = [
  ...ROOF_STYLE_OPTIONS,
  ...ROUND_OVAL_ROOF_STYLE_OPTIONS,
];

/**
 * ST4.4 & ST5.2 Roof Materials
 * - Rectangular & Square: corrugated_steel, etfe_cushion, precast_concrete, anodized_aluminum
 * - Round & Oval Coliseum: ptfe_fabric, perforated_aluminum, solar_glass, galvanized_plate
 */
export type RoofMaterial =
  | 'corrugated_steel'
  | 'etfe_cushion'
  | 'precast_concrete'
  | 'anodized_aluminum'
  | 'ptfe_fabric'
  | 'perforated_aluminum'
  | 'solar_glass'
  | 'galvanized_plate';

export interface RoofMaterialOption {
  id: RoofMaterial;
  label: string;
  icon: string;
  desc: string;
}

export const ROOF_MATERIAL_OPTIONS: RoofMaterialOption[] = [
  {
    id: 'corrugated_steel',
    label: 'Corrugated Steel',
    icon: '🔩',
    desc: 'Galvanized zinc-coated profiled sheets with lap joints and 32-bit pixel dithered ridges.',
  },
  {
    id: 'etfe_cushion',
    label: 'ETFE Cushion',
    icon: '💎',
    desc: 'Translucent pneumatic cushions diffusing soft ambient daylight with cross-welded seams.',
  },
  {
    id: 'precast_concrete',
    label: 'Pre-Cast Concrete',
    icon: '🧱',
    desc: 'Smooth architectural ribbed concrete panels with waterproof bitumen expansion joints.',
  },
  {
    id: 'anodized_aluminum',
    label: 'Anodized Aluminum',
    icon: '✨',
    desc: 'Metallic sheen aerodynamic cladding panels with flush rivets and specular highlights.',
  },
];

/**
 * ST5.2 Four Dedicated Roof Materials for Round & Oval Coliseum Stadiums
 */
export const ROUND_OVAL_ROOF_MATERIAL_OPTIONS: RoofMaterialOption[] = [
  {
    id: 'ptfe_fabric',
    label: 'Translucent PTFE Fabric',
    icon: '⛺',
    desc: 'Soft white translucent PTFE membrane fabric diffusing natural sky light with radial welded seams.',
  },
  {
    id: 'perforated_aluminum',
    label: 'Perforated Aero-Aluminum',
    icon: '🛡️',
    desc: 'Diamond-punched metal cladding filtering soft sunbeams with lightweight aerodynamic alloy finish.',
  },
  {
    id: 'solar_glass',
    label: 'Reflective Solar Glass',
    icon: '💎',
    desc: 'Mirrored architectural glazing with dark structural mullions, specular reflections, and sky tint.',
  },
  {
    id: 'galvanized_plate',
    label: 'Heavy Galvanized Plate',
    icon: '🔩',
    desc: 'Matte battleship gray steel plate with welded radial seams, heavy industrial rivets, and weather protection.',
  },
];

export const ALL_ROOF_MATERIAL_OPTIONS: RoofMaterialOption[] = [
  ...ROOF_MATERIAL_OPTIONS,
  ...ROUND_OVAL_ROOF_MATERIAL_OPTIONS,
];

/**
 * ST4.4 & ST5.2 Roof Border / Fascia Rim Finishes
 * - Rectangular & Square: painted_club_fascia, gunmetal_box_girder, led_halo_ribbon, copper_stone_coping
 * - Round & Oval Coliseum: video_halo_board, glow_led_ribbon, compression_box_ring, leitch_radial_truss
 */
export type RoofBorder =
  | 'painted_club_fascia'
  | 'gunmetal_box_girder'
  | 'led_halo_ribbon'
  | 'copper_stone_coping'
  | 'video_halo_board'
  | 'glow_led_ribbon'
  | 'compression_box_ring'
  | 'leitch_radial_truss';

export interface RoofBorderOption {
  id: RoofBorder;
  label: string;
  icon: string;
  desc: string;
}

export const ROOF_BORDER_OPTIONS: RoofBorderOption[] = [
  {
    id: 'painted_club_fascia',
    label: 'Club Color Fascia',
    icon: '🎨',
    desc: 'Bold team-colored enameled gutter board with sponsor decals and edge trim.',
  },
  {
    id: 'gunmetal_box_girder',
    label: 'Gunmetal Box Girder',
    icon: '⚙️',
    desc: 'Heavy industrial dark steel structural channel with exposed bolts and rivets.',
  },
  {
    id: 'led_halo_ribbon',
    label: '360° LED Ribbon',
    icon: '💡',
    desc: 'Illuminated continuous digital LED band dynamically projecting match accents and animations.',
  },
  {
    id: 'copper_stone_coping',
    label: 'Copper / Stone Coping',
    icon: '🏛️',
    desc: 'Classic weathered oxidized green copper patina or beveled ashlar stone rim.',
  },
];

/**
 * ST5.2 Four Dedicated Border / Inner Ocular Rim Finishes for Round & Oval Coliseum Stadiums
 */
export const ROUND_OVAL_ROOF_BORDER_OPTIONS: RoofBorderOption[] = [
  {
    id: 'video_halo_board',
    label: '360° Digital Video Halo Board',
    icon: '📺',
    desc: 'Massive continuous cylindrical ribbon screen displaying live match status, club chants, and score telemetry in 32-bit pixel-art glow.',
  },
  {
    id: 'glow_led_ribbon',
    label: 'Glow LED Edge Ribbon',
    icon: '💡',
    desc: 'Thin pulsating neon strip along the ocular rim glowing in club primary accent color.',
  },
  {
    id: 'compression_box_ring',
    label: 'Chiseled Compression Box Ring',
    icon: '⚙️',
    desc: 'Heavy cylindrical steel compression beam in dark gunmetal finish with exposed flange bolts.',
  },
  {
    id: 'leitch_radial_truss',
    label: 'Leitch Radial Truss Edge',
    icon: '🏗️',
    desc: 'Traditional Archibald Leitch criss-cross iron lattice running around the inner rim.',
  },
];

export const ALL_ROOF_BORDER_OPTIONS: RoofBorderOption[] = [
  ...ROOF_BORDER_OPTIONS,
  ...ROUND_OVAL_ROOF_BORDER_OPTIONS,
];

/**
 * Helper: Check if a stadium shape is circular, round, or oval
 */
export function isRoundOrOvalShape(shape?: StadiumShape): boolean {
  return shape === 'round' || shape === 'oval' || shape === 'circular';
}

/**
 * Helper: Get contextual roof styles based on stadium shape
 */
export function getRoofStylesForShape(shape?: StadiumShape): RoofStyleOption[] {
  return isRoundOrOvalShape(shape) ? ROUND_OVAL_ROOF_STYLE_OPTIONS : ROOF_STYLE_OPTIONS;
}

export function getExtendedRoofStylesForShape(shape?: StadiumShape): RoofStyleOption[] {
  return isRoundOrOvalShape(shape) ? ROUND_OVAL_ROOF_STYLE_OPTIONS : EXTENDED_ROOF_STYLE_OPTIONS;
}

/**
 * Helper: Get contextual roof materials based on stadium shape
 */
export function getRoofMaterialsForShape(shape?: StadiumShape): RoofMaterialOption[] {
  return isRoundOrOvalShape(shape) ? ROUND_OVAL_ROOF_MATERIAL_OPTIONS : ROOF_MATERIAL_OPTIONS;
}

/**
 * Helper: Get contextual roof borders based on stadium shape
 */
export function getRoofBordersForShape(shape?: StadiumShape): RoofBorderOption[] {
  return isRoundOrOvalShape(shape) ? ROUND_OVAL_ROOF_BORDER_OPTIONS : ROOF_BORDER_OPTIONS;
}

export interface RoofConfig {
  enabled: boolean;
  style: RoofStyle;
  material: RoofMaterial;
  border: RoofBorder;
  cutawayMode?: RoofCutawayMode;
  coverage?: number; // 0 to 1
}

export function getDefaultRoofConfig(shape?: StadiumShape): RoofConfig {
  if (isRoundOrOvalShape(shape)) {
    return {
      enabled: true,
      style: shape === 'round' ? 'spoke_wheel_tension' : 'continuous_cantilever_ring',
      material: 'ptfe_fabric',
      border: 'video_halo_board',
      cutawayMode: 'partial',
      coverage: 0.5,
    };
  }
  return {
    enabled: true,
    style: 'cantilever_truss',
    material: 'corrugated_steel',
    border: 'painted_club_fascia',
    cutawayMode: 'partial',
    coverage: 0.5,
  };
}

/**
 * Hotfix Phase T14E: Unified Perimeter Roof Overhang Depth Engine
 * Calibrates roof canopy overhang so that:
 * 1. At 50% match cutaway ('partial'), the roof overhang NEVER hides more than 50% of the upper tier.
 * 2. Roof depth is unified around the stadium perimeter (~32px–38px baseline for standard medium stands)
 *    so all 4 stands (West, East, North, South) and 4 corners connect flush as a single cohesive canopy.
 * 3. At 'full' cutaway (100%), it extends across the entire stand (~92%–95%).
 * 4. At 'hidden' (0%), it returns 0.
 * 5. Stand-specific roofOverhang modifiers ('small' = 0.8x, 'large' = 1.15x) are supported
 *    while strictly respecting the <= 50% upper-tier visibility boundary.
 */
export function getUnifiedRoofOverhangDepth(
  stand?: StandConfig,
  standDepth: number = 145,
  cutaway: RoofCutawayMode = 'partial'
): number {
  if (cutaway === 'hidden' || standDepth <= 0) return 0;
  if (cutaway === 'full') {
    return Math.max(16, Math.round(standDepth * 0.94));
  }

  // Partial (50% match cutaway):
  // Rule: Must NEVER hide more than 50% of the upper tier rows!
  const isGiant = stand?.cornerType === 'giant' || stand?.type === 'giant';
  const isWallTier = stand?.type === 'wall' || (stand && isTheWallStand(stand)) || isGiant;
  const isStackedWall = stand?.type === 'stacked_wall' || (stand && isStackedWallStand(stand));
  const tierCount = isStackedWall
    ? 2
    : isWallTier
    ? 1
    : Math.max(1, Math.min(4, stand?.tierCount || (stand?.tiers && stand.tiers.length > 0 ? stand.tiers.length : 2)));

  const rearWallThickness = 14;
  const frontPlinth = 6;
  const deckDepth = Math.max(30, standDepth - rearWallThickness - frontPlinth);

  // Upper tier visible deck depth:
  const upperTierDepth = isWallTier
    ? deckDepth * 0.35 // Upper terrace region on a wall stand
    : isStackedWall
    ? deckDepth * 0.50
    : deckDepth / tierCount;

  // Maximum allowed projection into the upper deck: strictly <= 45% (never > 50%)
  const maxUpperTierCoverage = Math.max(4, Math.floor(upperTierDepth * 0.45));

  // Stand-specific roof overhang modifier if specified ('small' | 'medium' | 'large')
  let modifier = 1.0;
  if (stand?.roofOverhang === 'small') modifier = 0.8;
  else if (stand?.roofOverhang === 'large') modifier = 1.25;

  // Base projection proportional to stand size/depth (~16% of stand depth)
  const baseProjection = standDepth * 0.16;
  const targetProjection = baseProjection * modifier;

  // Overhang projection onto the upper tier strictly bounded by <= 50% coverage limit
  const tierProjection = Math.max(4, Math.min(maxUpperTierCoverage, Math.round(targetProjection)));

  // Total roof canopy depth including rear perimeter wall anchor
  let totalOverhang = Math.max(12, rearWallThickness + tierProjection);

  // Hotfix Phase T14J: For Giant Wall stands/corners, canopy overhang covers at most 20% of total depth
  if (isGiant) {
    totalOverhang = Math.min(totalOverhang, Math.max(12, Math.round(standDepth * 0.20)));
  }

  return totalOverhang;
}

/**
 * Lighting Model
 */
export type CornerFloodlightPlacement = 'exterior_tower' | 'integrated_parapet' | 'corner_ground';

export const CORNER_FLOODLIGHT_PLACEMENT_OPTIONS: Array<{
  id: CornerFloodlightPlacement;
  label: string;
  icon: string;
  desc: string;
}> = [
  {
    id: 'exterior_tower',
    label: 'Exterior Towers (Plaza)',
    icon: '🗼',
    desc: 'Freestanding high-mast lattice towers on outer concourse plaza',
  },
  {
    id: 'integrated_parapet',
    label: 'Parapet Clusters (Rim)',
    icon: '🏟️',
    desc: 'Compact light clusters anchored into rear parapet wall / bowl coping',
  },
  {
    id: 'corner_ground',
    label: 'Corner Ground (Open Infill)',
    icon: '🌱',
    desc: 'Pitchside infill pylon in open footprint for open / no-stand corners',
  },
];

export interface LightingModel {
  type: 'corner_pylons' | 'roof_banks' | 'light_poles' | 'none';
  pylonCount: number;
  powerKw: number;
  timeOfDay: TimeOfDay;
  cornerFloodlightPlacement?: CornerFloodlightPlacement;
}

/**
 * Dedicated Street Arena Configuration (distinct from Pro/Youth grandstand schemas)
 */
export type StreetArenaArchetype =
  | 'tarmac_cage'
  | 'favela_quadra'
  | 'potrero_dirt'
  | 'courtyard_paving'
  | 'rooftop_mesh'
  | 'coastal_boardwalk'
  | 'desert_sand_lot';

export type StreetSurfaceType = 'concrete' | 'sand' | 'synthetic' | 'poor';

export type StreetPerimeterWallStyle =
  | 'chainlink_cage'
  | 'graffiti_brick'
  | 'corrugated_iron'
  | 'timber_seawall'
  | 'concrete_curb_wall';

export type StreetCourtMarkings =
  | 'spray_paint'
  | 'chalk_dust'
  | 'multisport_crossover'
  | 'faded_tarmac';

export type StreetGoalStyle =
  | 'futsal_tubular'
  | 'chain_net_park'
  | 'painted_wall_posts'
  | 'crates_and_pipes';

export type StreetLightingType =
  | 'sodium_streetlamps'
  | 'festoon_string_lights'
  | 'single_flood_pole'
  | 'daylight_only';

export type StreetFenceCrowdMode = 'none' | 'sparse_locals' | 'block_party_fence';

export type StreetUrbanProp =
  | 'parked_cars'
  | 'laundry_lines'
  | 'graffiti_murals'
  | 'milk_crates'
  | 'scooters'
  | 'corner_kiosk';

export interface StreetArenaConfig {
  archetype: StreetArenaArchetype;
  surface: StreetSurfaceType;
  perimeterWallStyle: StreetPerimeterWallStyle;
  courtMarkings: StreetCourtMarkings;
  goalStyle: StreetGoalStyle;
  streetLighting: StreetLightingType;
  fenceCrowdMode: StreetFenceCrowdMode;
  urbanProps: StreetUrbanProp[];
}

/**
 * Resolves the effective corner floodlight placement typology for a given stadium definition.
 * Defaults to 'integrated_parapet' for built stands, or 'corner_ground' if corners are unbuilt (no-stand).
 */
export function resolveCornerFloodlightPlacement(
  stadiumDef?: StadiumDefinition,
  placementOverride?: CornerFloodlightPlacement
): CornerFloodlightPlacement {
  if (placementOverride) return placementOverride;
  if (stadiumDef?.lighting?.cornerFloodlightPlacement) {
    return stadiumDef.lighting.cornerFloodlightPlacement;
  }
  // If all 4 corners are explicitly 'none' or 'no_stand', default to authentic corner ground infill
  const nw = stadiumDef?.stands?.corner_nw?.type;
  const ne = stadiumDef?.stands?.corner_ne?.type;
  const sw = stadiumDef?.stands?.corner_sw?.type;
  const se = stadiumDef?.stands?.corner_se?.type;
  const allCornersOpen =
    (nw === 'none' || nw === 'no_stand') &&
    (ne === 'none' || ne === 'no_stand') &&
    (sw === 'none' || sw === 'no_stand') &&
    (se === 'none' || se === 'no_stand');

  return allCornersOpen ? 'corner_ground' : 'integrated_parapet';
}

/**
 * 12.2 Full Data-Driven Stadium Definition
 */
export interface StadiumDefinition {
  id: string;
  slotNumber?: number; // Catalog slot number 1..999
  name: string;
  shortName: string;
  city: string;
  country: string;
  category?: StadiumCategory; // Defaults to 'pro' when omitted
  youthSpecialUnlocked?: boolean; // Unlocks pristine turf, roof & modern stands for major Int'l Youth Cup sections
  streetSurface?: StreetSurfaceType;
  streetCityId?: string;
  streetConfig?: StreetArenaConfig;
  isCasualYouthCrowd?: boolean;
  disableEntryCinematic?: boolean;
  shape: StadiumShape;
  surroundings: SurroundingsType;
  grounds?: StadiumGroundsType; // Phase ST3: Immediate Stadium Grounds & Forecourt Concourse
  roof?: RoofConfig; // Phase ST4: Overall Stadium Roof Architecture
  roofCutaway?: RoofCutawayMode; // Phase ST4: Global Sims-style 3-state roof cutaway override
  hasTrack: boolean; // Strictly exclusive to round and oval
  apronMaterial?: ApronMaterial; // Phase 15.5: Perimeter apron material between pitch and stands
  apronSetback?: ApronSetback; // Phase S1: Setback buffer depth between pitch and stands ('compact' | 'standard' | 'expansive')
  stands: Record<StandPosition, StandConfig>;
  seats: StadiumSeatConfig;
  lighting: LightingModel;
  dugouts: DugoutConfig;
  tunnel: EntranceTunnelConfig;
  capacity: number; // Dynamically calculated or nominal
  fifaCategory: FifaQualification;
  tier?: StadiumTier;

  // Optional matchday pitch defaults
  pitchPreset?: PitchDimensionPreset;
  pitchLengthMeters?: number;
  pitchWidthMeters?: number;
  turfQuality?: TurfQuality;
  mowingPattern?: LawnMowingPattern;
  grassLength?: GrassLength;
  surfaceStatus?: SurfaceStatus;
  goalFrame?: GoalFrameType;
  netTension?: NetTension;
  weather?: WeatherCondition;
  season?: Season;
  timeOfDay?: TimeOfDay;
  seatColor?: SeatColorMode;
  seatArchetype?: SeatArchetype; // Phase A5.2
  crowdLevel?: CrowdLevel; // Phase B2.4 Dynamic Match Attendance
  pitchsideBarrier?: PitchsideBarrierType; // Phase T5: Pitchside Barrier default

  // Phase T6: The 5-Grade "Architectural Grade" System & 3-Element Color Palette
  architecturalGrade?: ArchitecturalGrade;
  gradeColors?: GradeElementColors;

  // Phase T9: Executive Amenities & FIFA "World" Category Certification
  hasTransmissionArea?: boolean;
  hasVipZone?: boolean;
  hasVipSeats?: boolean;

  // Phase T11: Unified Grandstand Stairs & 3-Vomitory Tunnel Architectures
  vomitoryArchitecture?: VomitoryArchitecture;
}

/**
 * 12.5 Team Home Venue Overrides
 */
export interface TeamVenueOverrides {
  pitchPattern?: LawnMowingPattern;
  netStyle?: GoalFrameType;
  netTension?: NetTension;
  pitchSizePreset?: PitchDimensionPreset;
  pitchLengthMeters?: number;
  pitchWidthMeters?: number;
  turfQuality?: TurfQuality;
  grassLength?: GrassLength;
  surfaceStatus?: SurfaceStatus;
  fanColors?: { primary: string; secondary: string };
  bannerMessages?: string[];
  sponsors?: string[];
  dugoutStyle?: BenchType;
  tunnelStyle?: TunnelType;
}

/**
 * Helper: Map Surroundings to available No-Stand contextual backdrops (Phase 15.7.1)
 */
export function getBackdropsForSurroundings(surroundings: SurroundingsType): { id: NoStandBackdrop; label: string }[] {
  const commonWall = { id: 'wall' as const, label: 'Perimeter Wall (Custom Height & Finish)' };
  switch (surroundings) {
    case 'small_city':
      return [
        { id: 'small_houses', label: 'Victorian Red-Brick Townhouses & Chimneys' },
        { id: 'clock_tower', label: 'Municipal Clock Tower & Civic Square' },
        { id: 'high_street', label: 'Neighborhood Corner Bakery & Streetlamps' },
        { id: 'apartment_buildings', label: 'Low-Rise Apartment Blocks' },
        { id: 'mall', label: 'Commercial Plaza & Superstore' },
        commonWall,
      ];
    case 'beach':
      return [
        { id: 'beach_seaside', label: 'Golden Sand Dunes & Coconut Palms' },
        { id: 'ocean_surf', label: 'Turquoise Ocean Breakers & Foamy Surf' },
        { id: 'boardwalk_promenade', label: 'Wooden Boardwalk Promenade & Cabanas' },
        { id: 'small_houses', label: 'Beachside Bungalows & Sea Oats' },
        { id: 'apartment_buildings', label: 'Seaside Condominiums' },
        commonWall,
      ];
    case 'big_city':
      return [
        { id: 'skyscrapers', label: 'Towering Glass & Steel Skyscrapers' },
        { id: 'metro_rail', label: 'Elevated Metro Rail Overpass & Transit Trains' },
        { id: 'aviation_towers', label: 'Rooftop Communication Masts & Aviation Strobes' },
        { id: 'apartment_buildings', label: 'High-Density Residential Towers' },
        { id: 'mall', label: 'Multi-Story Metro Mall' },
        commonWall,
      ];
    case 'mountains':
    case 'nature':
      return [
        { id: 'alpine_peaks', label: 'Alpine Peaks & Perpetual Snow Dust' },
        { id: 'mountain_forest', label: 'Mountain Forest & Alpine Glade' },
        { id: 'ski_chalets', label: 'Wooden Ski Chalets & Smoking Stone Chimneys' },
        { id: 'cable_car_pylons', label: 'Aerial Cable Car Pylons & Gondolas' },
        { id: 'pine_valley', label: 'Pine Forest Foothills & Rocky Ridges' },
        commonWall,
      ];
    case 'forest':
      return [
        { id: 'dense_pine_woodland', label: 'Dense Multi-Layered Evergreen Canopy' },
        { id: 'autumn_canopy', label: 'Golden Birch & Amber Foliage Canopy' },
        { id: 'ranger_lookout', label: 'Fire Access Road & Ranger Lookout Tower' },
        { id: 'clearing_trail', label: 'Timber Clearing & Rustic Log Fencing' },
        commonWall,
      ];
    case 'savannah':
      return [
        { id: 'acacia_plains', label: 'Golden Grasslands & Umbrella Acacias' },
        { id: 'rocky_outcrop', label: 'Sun-Drenched Kopje Plateaus & Baobabs' },
        { id: 'safari_tracks', label: 'Dirt Safari Tracks & Wildlife Silhouettes' },
        { id: 'kraal_perimeter', label: 'Rustic Thornbush Kraal & Bushveldt' },
        commonWall,
      ];
    case 'highway':
      return [
        { id: 'elevated_viaduct', label: 'Elevated Concrete Multi-Lane Freeway' },
        { id: 'highway_gantries', label: 'Overhead Highway Sign Gantries & Guardrails' },
        { id: 'cloverleaf_interchange', label: 'Interchange Flyover Loops & Traffic' },
        { id: 'toll_plaza_boulevard', label: 'Interstate Boulevard & Streetlights' },
        commonWall,
      ];
    case 'airport':
      return [
        { id: 'runway', label: 'Active Runway Tarmac & Threshold Piano Keys' },
        { id: 'hangars_control_tower', label: 'Flight Hangars & Radar Dome Tower' },
        { id: 'freight_depot', label: 'Cargo Terminal, Fuel Trucks & Airliners' },
        commonWall,
      ];
    case 'railroad':
      return [
        { id: 'train_depot', label: 'Multi-Track Locomotive Depot & Shunter Engines' },
        { id: 'freight_railyard', label: 'Parallel Ballast Tracks & Switching Signals' },
        { id: 'industrial_gantries', label: 'Heavy Steel Catenary Gantries & Boxcars' },
        commonWall,
      ];
    case 'parking_lot':
      return [
        { id: 'paved_parking', label: 'Camp Nou Style Asphalt Bays & Parked Cars' },
        { id: 'team_buses', label: 'Official Team Luxury Coach Buses' },
        { id: 'tree_boulevard', label: 'Perimeter Tree Boulevard & Queuing Crowds' },
        commonWall,
      ];
    case 'marine_floating':
      return [
        { id: 'open_ocean', label: 'Open Seawater Bay & Pixel Waves' },
        { id: 'harbor_marina', label: 'Wooden Marina Piers & Mooring Bollards' },
        { id: 'floating_pontoons', label: 'Anchored Fishing Trawlers & Yachts' },
        commonWall,
      ];
    default:
      return [commonWall];
  }
}

/**
 * 12.2.10 Capacity Mathematical Models
 * Calculates additive capacity for a given stand
 */
export function calculateStandCapacity(stand: StandConfig, shape: StadiumShape, pos?: StandPosition): number {
  if (stand.type === 'none' || stand.type === 'no_stand') {
    return 0;
  }

  const effectivePos = pos || stand.position || 'east';
  const isCorner = effectivePos.startsWith('corner_');
  const isTouchline = effectivePos === 'east' || effectivePos === 'west';

  // Base multiplier per stand position & stadium shape
  let posMultiplier = isCorner ? 0.35 : isTouchline ? 1.0 : 0.85;
  if (shape === 'round' || shape === 'oval') {
    posMultiplier = isCorner ? 0.6 : 0.95; // Bowls distribute capacity more uniformly
  } else if (shape === 'circular') {
    posMultiplier = isCorner ? 0.65 : 1.05; // Full 360 colosseum radial bowl
  }

  // Phase T10: Corner taxonomy capacity handlers
  if (isCorner) {
    if (isCornerNoStand(stand.type)) {
      return 0;
    }
    if (isCornerTower(stand.type)) {
      const floors = getVipBuildingFloors(stand);
      let towerCap = Math.round(floors * 450 * posMultiplier);
      if (hasStandVipZone(stand)) towerCap = Math.round(towerCap * 0.95);
      if (hasStandTransmissionArea(stand)) towerCap = Math.max(0, towerCap - 150);
      return towerCap;
    }
    if (isCornerGiant(stand.type)) {
      const wallBase = stand.wallSize === 'large' ? 24000 : stand.wallSize === 'medium' ? 19200 : 14400;
      const wallDensity = stand.wallDensity || stand.density || 'normal';
      const densityFactor = getDensityCapacityFactor(wallDensity);
      let cap = Math.round(wallBase * densityFactor * posMultiplier);
      if (hasStandVipZone(stand)) cap = Math.round(cap * 0.95);
      if (hasStandTransmissionArea(stand)) cap = Math.max(0, cap - 150);
      return cap;
    }
  }

  // Giant / Square corner wall stand (Phase T10 & Phase T12 Monumental Scaling)
  if (
    stand.type === 'square' ||
    stand.type === 'giant' ||
    stand.cornerType === 'square' ||
    stand.cornerType === 'giant'
  ) {
    const wallBase = stand.wallSize === 'large' ? 24000 : stand.wallSize === 'medium' ? 19200 : 14400;
    const wallDensity = stand.wallDensity || stand.density || 'normal';
    const densityFactor = getDensityCapacityFactor(wallDensity);
    let cap = Math.round(wallBase * densityFactor * posMultiplier);
    if (hasStandVipZone(stand)) cap = Math.round(cap * 0.95);
    if (hasStandTransmissionArea(stand)) cap = Math.max(0, cap - 150);
    return cap;
  }

  // VIP Tower corner stand (Phase T10)
  if (stand.type === 'tower' || stand.cornerType === 'tower') {
    const floors = getVipBuildingFloors(stand);
    let towerCap = Math.round(floors * 450 * posMultiplier);
    if (hasStandVipZone(stand)) towerCap = Math.round(towerCap * 0.95);
    if (hasStandTransmissionArea(stand)) towerCap = Math.max(0, towerCap - 150);
    return towerCap;
  }

  // Wall Tier (Dortmund-style massive single terrace)
  if (stand.type === 'wall') {
    const wallBase = stand.wallSize === 'large' ? 24000 : stand.wallSize === 'medium' ? 19200 : 14400;
    const wallDensity = stand.wallDensity || stand.density || 'normal';
    const densityFactor = getDensityCapacityFactor(wallDensity);
    let cap = Math.round(wallBase * densityFactor * posMultiplier);
    if (hasStandVipZone(stand)) {
      cap = Math.round(cap * 0.95);
    }
    if (hasStandTransmissionArea(stand)) {
      cap = Math.max(0, cap - 150);
    }
    return cap;
  }

  // Phase T8: Stacked Wall (Metropolitano & Tottenham-style double-decker wall)
  if (stand.type === 'stacked_wall') {
    return calculateStackedWallCapacity(stand, posMultiplier);
  }

  // VIP Building (La Bombonera-style Palcos Luxury Suites + Lower Terrace - Phase T7)
  if (stand.type === 'vip_building') {
    return calculateVipBuildingCapacity(stand, posMultiplier);
  }

  // Standard Stacked Tiers (1 to 4 decks)
  const tiers = stand.tiers || [{ size: 'medium' }];
  const effectiveVipIdx = getEffectiveVipTierIndex(stand);
  const standHasVip = hasStandVipSeats(stand);
  let totalTierCapacity = 0;

  tiers.forEach((t, index) => {
    // Upper tiers have larger circumference in stadium bowls
    const upperExpansion = 1 + index * 0.18;
    const tierDensity = t.density || stand.density || 'normal';
    const densityFactor = getDensityCapacityFactor(tierDensity);

    // Phase T9: Dedicated luxury VIP hospitality deck has ultra-spacious armchair spacing
    const isThisVip = standHasVip && (index === effectiveVipIdx || t.isVip);
    const tierBase = isThisVip
      ? 1600
      : (t.size === 'large' ? 6800 : t.size === 'medium' ? 4800 : 3200);

    totalTierCapacity += tierBase * densityFactor * upperExpansion;
  });

  let cap = Math.round(totalTierCapacity * posMultiplier);
  if (hasStandVipZone(stand)) {
    cap = Math.round(cap * 0.95);
  }
  if (hasStandTransmissionArea(stand)) {
    cap = Math.max(0, cap - 150);
  }

  return cap;
}

/**
 * Calculates total stadium capacity across all stands
 */
export function calculateStadiumTotalCapacity(stands: Record<StandPosition, StandConfig>, shape: StadiumShape): number {
  let total = 0;
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
  for (const pos of positions) {
    const stand = stands[pos];
    if (stand) {
      total += calculateStandCapacity(stand, shape, pos);
    }
  }
  return total;
}

/**
 * Dynamic FIFA Qualification Category Computation (Section 12.2.10 & 14.3)
 * Accrued dynamically based on current capacity, stand architectural grades, floodlights, and turf quality.
 */
export function calculateFifaQualification(
  capacity: number,
  grade?: StandGrade,
  floodlightsKw?: number,
  turfQuality?: TurfQuality
): FifaQualification {
  // Base point calculation
  let points = 0;

  // Capacity threshold points
  if (capacity >= 60000) points += 60;
  else if (capacity >= 45000) points += 48;
  else if (capacity >= 35000) points += 36;
  else if (capacity >= 22000) points += 24;
  else if (capacity >= 15000) points += 16;
  else if (capacity >= 8000) points += 8;
  else points += 2;

  // Stand Grade points
  if (grade === 'grade5_futuristic') points += 18;
  else if (grade === 'grade4_modern') points += 12;
  else if (grade === 'grade3_industrial' || grade === 'grade3_steel_cantilever') points += 6;
  else if (grade === 'grade2_classic') points += 4;
  else if (grade === 'grade1_municipal' || grade === 'grade1_historic_timber') points += 1;

  // Floodlight points
  if (floodlightsKw !== undefined) {
    if (floodlightsKw >= 2200) points += 12;
    else if (floodlightsKw >= 1400) points += 8;
    else if (floodlightsKw >= 800) points += 4;
  } else {
    points += 6; // neutral fallback
  }

  // Turf Quality points
  if (turfQuality === 'pristine') points += 10;
  else if (turfQuality === 'normal') points += 5;
  else if (turfQuality === 'poor') points -= 6;
  else points += 5;

  // Qualification categorization
  // World: massive venues (typically 60k+, modern/futuristic finish, top lighting & turf)
  if (capacity >= 50000 && points >= 80) return 'world';
  if (capacity >= 60000) return 'world'; // Pure capacity override

  // Continental: top-flight continental tournaments (35k-60k)
  if (capacity >= 28000 && points >= 52) return 'continental';
  if (capacity >= 35000) return 'continental';

  // First Division: top-tier domestic league venues (15k-35k)
  if (capacity >= 12000 && points >= 30) return 'first_division';
  if (capacity >= 15000) return 'first_division';

  return 'national';
}

/**
 * ============================================================================
 * PHASE T6: ARCHITECTURAL GRADE RESOLUTION, SEAT RANKING & MUNICIPAL PENALTY GATE
 * ============================================================================
 */

export type StadiumCertificationRating =
  | 'municipal'
  | 'national'
  | 'first_division'
  | 'continental'
  | 'world';

/**
 * Resolves the effective Architectural Grade for a stand with backward compatibility
 */
export function resolveStandArchitecturalGrade(
  stand?: StandConfig,
  stadiumDef?: StadiumDefinition
): ArchitecturalGrade {
  if (stand?.architecturalGrade) return stand.architecturalGrade;
  if (stadiumDef?.architecturalGrade) return stadiumDef.architecturalGrade;

  // Backward-compatibility mapping from legacy grade, grandstandMaterial, or deckMaterial
  if (stand?.grade === 'grade1_municipal' || stand?.grade === 'grade1_historic_timber') {
    return 'municipal';
  }
  if (
    stand?.grade === 'grade2_classic' ||
    stand?.grandstandMaterial === 'victorian_brick' ||
    stand?.rearWallMaterial === 'brick'
  ) {
    return 'victorian';
  }
  if (
    stand?.grade === 'grade3_industrial' ||
    stand?.grade === 'grade3_steel_cantilever' ||
    stand?.grandstandMaterial === 'industrial_steel' ||
    stand?.rearWallMaterial === 'corrugated_steel' ||
    stand?.deckMaterial === 'steel'
  ) {
    return 'industrial';
  }
  if (
    stand?.grade === 'grade4_modern' ||
    stand?.grade === 'grade5_futuristic' ||
    stand?.grandstandMaterial === 'composite_cladding' ||
    stand?.deckMaterial === 'composite'
  ) {
    return 'modern';
  }
  if (stand?.grandstandMaterial === 'brutalist_concrete') {
    return 'brutalist';
  }
  return 'brutalist';
}

/**
 * Phase T9: Grade 3+ (Industrial or Superior) Prerequisite Gate for VIP Hospitality
 * Only Industrial (Grade 3), Victorian (Grade 4), and Modern (Grade 5) qualify.
 * Municipal (Grade 1) and Brutalist (Grade 2) are strictly prohibited from adding VIP tiers.
 */
export function isGradeVipEligible(grade?: ArchitecturalGrade): boolean {
  return grade === 'industrial' || grade === 'victorian' || grade === 'modern';
}

export function isStandVipEligible(stand?: StandConfig, stadiumDef?: StadiumDefinition): boolean {
  const grade = resolveStandArchitecturalGrade(stand, stadiumDef);
  return isGradeVipEligible(grade);
}

/**
 * Returns whether a stand has active VIP seats (Level 6)
 */
export function hasStandVipSeats(stand?: StandConfig, stadiumDef?: StadiumDefinition): boolean {
  if (!stand) return false;
  if (stand.type === 'vip_building' || stand.type === 'tower') return true;
  if (stand.hasVipSeats && isStandVipEligible(stand, stadiumDef)) return true;
  if (stand.tiers && stand.tiers.some((t) => t.isVip) && isStandVipEligible(stand, stadiumDef)) return true;
  return false;
}

/**
 * Returns the effective VIP tier index on a tiered stand (0-indexed; default 1 = 2nd level)
 */
export function getEffectiveVipTierIndex(stand?: StandConfig): number {
  if (!stand) return 1;
  const tc = stand.tierCount || (stand.tiers ? stand.tiers.length : 2);
  const maxIdx = Math.max(1, tc - 1);
  if (typeof stand.vipTierIndex === 'number') {
    return Math.min(maxIdx, Math.max(1, Math.round(stand.vipTierIndex)));
  }
  return 1;
}

/**
 * Phase T9: Check if a stand has an active VIP Zone Buffet Lounge
 */
export function hasStandVipZone(stand?: StandConfig, stadiumDef?: StadiumDefinition): boolean {
  return !!stand?.hasVipZone && isStandVipEligible(stand, stadiumDef);
}

/**
 * Phase T9: Check if a stand has an active Transmission Press Box
 */
export function hasStandTransmissionArea(stand?: StandConfig, stadiumDef?: StadiumDefinition): boolean {
  return !!stand?.hasTransmissionArea && isStandVipEligible(stand, stadiumDef);
}

/**
 * Phase T9: Check whether VIP Seats exist anywhere in the stadium
 */
export function hasVipSeatsInStadium(stadiumDef?: StadiumDefinition): boolean {
  if (!stadiumDef) return false;
  if (stadiumDef.hasVipSeats) return true;
  if (!stadiumDef.stands) return false;
  const positions: StandPosition[] = ['east', 'west', 'north', 'south', 'corner_ne', 'corner_nw', 'corner_se', 'corner_sw'];
  return positions.some((pos) => hasStandVipSeats(stadiumDef.stands[pos], stadiumDef));
}

/**
 * Phase T9: Check whether a Transmission Press Box exists anywhere in the stadium
 */
export function hasTransmissionAreaInStadium(stadiumDef?: StadiumDefinition): boolean {
  if (!stadiumDef) return false;
  if (stadiumDef.hasTransmissionArea) return true;
  if (!stadiumDef.stands) return false;
  const positions: StandPosition[] = ['east', 'west', 'north', 'south', 'corner_ne', 'corner_nw', 'corner_se', 'corner_sw'];
  return positions.some((pos) => hasStandTransmissionArea(stadiumDef.stands[pos], stadiumDef));
}

/**
 * Phase T9: Check whether an Executive VIP Zone Buffet Lounge exists anywhere in the stadium
 */
export function hasVipZoneInStadium(stadiumDef?: StadiumDefinition): boolean {
  if (!stadiumDef) return false;
  if (stadiumDef.hasVipZone) return true;
  if (!stadiumDef.stands) return false;
  const positions: StandPosition[] = ['east', 'west', 'north', 'south', 'corner_ne', 'corner_nw', 'corner_se', 'corner_sw'];
  return positions.some((pos) => hasStandVipZone(stadiumDef.stands[pos], stadiumDef));
}

/**
 * Phase T9.4: FIFA "WORLD" Category Certification Gate
 * To achieve prestigious "WORLD" Tier (5-Star Elite FIFA Status), a stadium must fulfill all three architectural criteria:
 * 1. At least one stand with active VIP Seats.
 * 2. Active Transmission Area (Press & Broadcast Suite).
 * 3. Active VIP Zone (Executive Hospitality & Amenities).
 * AND no municipal penalty, with capacity >= 45,000.
 */
export function isFifaWorldCertified(stadiumDef: StadiumDefinition): boolean {
  if (hasMunicipalPenalty(stadiumDef.stands)) return false;
  const cap = stadiumDef.capacity || (stadiumDef.stands ? calculateStadiumTotalCapacity(stadiumDef.stands, stadiumDef.shape) : 0);
  if (cap < 45000) return false;

  return (
    hasVipSeatsInStadium(stadiumDef) &&
    hasTransmissionAreaInStadium(stadiumDef) &&
    hasVipZoneInStadium(stadiumDef)
  );
}

/**
 * Calculates dedicated VIP capacity specifically for a stand
 */
export function getStandVipCapacity(stand: StandConfig, shape: StadiumShape, pos?: StandPosition): number {
  if (!hasStandVipSeats(stand)) return 0;
  const effectivePos = pos || stand.position || 'east';
  const isCorner = effectivePos.startsWith('corner_');
  const isTouchline = effectivePos === 'east' || effectivePos === 'west';
  let posMultiplier = isCorner ? 0.35 : isTouchline ? 1.0 : 0.85;
  if (shape === 'round' || shape === 'oval') {
    posMultiplier = isCorner ? 0.6 : 0.95;
  } else if (shape === 'circular') {
    posMultiplier = isCorner ? 0.65 : 1.05;
  }

  if (stand.type === 'vip_building') {
    const floors = getVipBuildingFloors(stand);
    return Math.round(floors * 1100 * posMultiplier);
  }
  if (stand.type === 'tower') {
    const floors = getVipBuildingFloors(stand);
    return Math.round(floors * 450 * posMultiplier);
  }
  if (stand.type === 'stacked_wall') {
    return Math.round(2200 * posMultiplier);
  }
  // Tiered stand
  const tiers = stand.tiers || [{ size: 'medium' }];
  const vipIdx = getEffectiveVipTierIndex(stand);
  const deck = tiers[vipIdx] || tiers[1] || tiers[0];
  const upperExpansion = 1 + vipIdx * 0.18;
  const density = deck.density || stand.density || 'normal';
  const densityFactor = getDensityCapacityFactor(density);
  return Math.round(1600 * densityFactor * upperExpansion * posMultiplier);
}

/**
 * Calculates total VIP capacity across the stadium
 */
export function getStadiumTotalVipCapacity(stadiumDef: StadiumDefinition): number {
  if (!stadiumDef.stands) return 0;
  let total = 0;
  const positions: StandPosition[] = ['east', 'west', 'north', 'south', 'corner_ne', 'corner_nw', 'corner_se', 'corner_sw'];
  for (const pos of positions) {
    const stand = stadiumDef.stands[pos];
    if (stand) {
      total += getStandVipCapacity(stand, stadiumDef.shape, pos);
    }
  }
  return total;
}

/**
 * Returns the seat ranking level (1 to 5, or 6 for VIP Hospitality) for a given stand
 */
export function getStandSeatLevel(stand?: StandConfig, stadiumDef?: StadiumDefinition): number {
  if (hasStandVipSeats(stand, stadiumDef)) {
    return 6; // Tier 6: VIP Hospitality
  }
  const grade = resolveStandArchitecturalGrade(stand, stadiumDef);
  return getSeatLevelRank(grade);
}

/**
 * T6.5: Municipal Stadium Rating Drop Penalty
 * Having even a single stand or tier built with Tier 1 (Municipal Style) immediately
 * drops the overall stadium certification / qualification rating to the lowest possible
 * rank ('municipal'), regardless of stadium size or overall capacity.
 *
 * NOTE: Open grounds with "No Stand" (type === 'none' | 'no_stand') retain higher
 * natural community / heritage rating and do NOT trigger the municipal penalty.
 */
export function hasMunicipalPenalty(stands?: Record<StandPosition, StandConfig>): boolean {
  if (!stands) return false;
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
  for (const pos of positions) {
    const stand = stands[pos];
    if (stand && stand.type !== 'none' && stand.type !== 'no_stand') {
      const grade = resolveStandArchitecturalGrade(stand);
      if (grade === 'municipal') {
        return true;
      }
    }
  }
  return false;
}

/**
 * T6.5 & T9.4: Stadium Certification Rating Engine
 * Evaluates stadium certification rank, strictly enforcing:
 * 1. Municipal penalty gate (drops to 'municipal' if any stand is Grade 1)
 * 2. FIFA "World" Certification gate (requires VIP seats, Transmission press box, and VIP zone; clamps to 'continental' otherwise)
 */
export function getStadiumCertificationRating(stadiumDef: StadiumDefinition): StadiumCertificationRating {
  if (hasMunicipalPenalty(stadiumDef.stands)) {
    return 'municipal';
  }
  const effCap = stadiumDef.capacity || (stadiumDef.stands ? calculateStadiumTotalCapacity(stadiumDef.stands, stadiumDef.shape) : 25000);
  const qual = calculateFifaQualification(
    effCap,
    stadiumDef.stands?.west?.grade,
    stadiumDef.lighting?.powerKw,
    stadiumDef.turfQuality
  );
  if (qual === 'world') {
    if (isFifaWorldCertified(stadiumDef)) {
      return 'world';
    }
    // Phase T9.4: Clamped to Continental if missing VIP Seats, Transmission Area, or VIP Zone
    return 'continental';
  }
  return qual;
}

export interface ResolvedElementColor {
  primary: string;
  dark: string;
  light: string;
  border: string;
  isRaw: boolean;
}

/**
 * T6.4: Resolves procedural color palette values for an architectural grade element group
 */
export function resolveGradeElementColor(
  grade: ArchitecturalGrade,
  elementIndex: 1 | 2 | 3,
  color?: PaletteColor,
  isNight: boolean = false
): ResolvedElementColor {
  const chosenColor = color || 'raw';
  if (chosenColor !== 'raw') {
    const def = PALETTE_COLORS.find((p) => p.id === chosenColor);
    if (def) {
      return {
        primary: isNight ? def.darkHex : def.hex,
        dark: def.darkHex,
        light: def.lightHex,
        border: def.borderHex,
        isRaw: false,
      };
    }
  }

  // Raw / Natural unpainted material finishes per Grade & Element
  switch (grade) {
    case 'municipal':
      if (elementIndex === 1) {
        // Scaffold Framing (galvanized steel pipe tubing)
        return {
          primary: isNight ? '#475569' : '#94a3b8',
          dark: '#334155',
          light: '#cbd5e1',
          border: '#64748b',
          isRaw: true,
        };
      }
      if (elementIndex === 2) {
        // Decks & Ladders (steel rungs & basic scaffold planks)
        return {
          primary: isNight ? '#334155' : '#64748b',
          dark: '#1e293b',
          light: '#94a3b8',
          border: '#475569',
          isRaw: true,
        };
      }
      // Tablones & Enclosures (rustic unpolished wood planks & tin sheets)
      return {
        primary: isNight ? '#5a2507' : '#854d0e',
        dark: '#451a03',
        light: '#b45309',
        border: '#78350f',
        isRaw: true,
      };

    case 'brutalist':
      if (elementIndex === 1) {
        // Superstructure (monolithic poured grey concrete)
        return {
          primary: isNight ? '#1e293b' : '#475569',
          dark: '#0f172a',
          light: '#64748b',
          border: '#334155',
          isRaw: true,
        };
      }
      if (elementIndex === 2) {
        // Stairs & Aisles (heavy block concrete steps)
        return {
          primary: isNight ? '#334155' : '#64748b',
          dark: '#1e293b',
          light: '#94a3b8',
          border: '#475569',
          isRaw: true,
        };
      }
      // Ledges & Dividers (concrete ledges & slab handrails)
      return {
        primary: isNight ? '#334155' : '#64748b',
        dark: '#1e293b',
        light: '#94a3b8',
        border: '#475569',
        isRaw: true,
      };

    case 'industrial':
      if (elementIndex === 1) {
        // Masonry & Foundation (dark brick support piers)
        return {
          primary: isNight ? '#5c1d0c' : '#7f1d1d',
          dark: '#451a03',
          light: '#991b1b',
          border: '#451a03',
          isRaw: true,
        };
      }
      if (elementIndex === 2) {
        // Steelwork & Pipes (dark steel I-beams & mesh)
        return {
          primary: isNight ? '#090d16' : '#1e293b',
          dark: '#020617',
          light: '#475569',
          border: '#0f172a',
          isRaw: true,
        };
      }
      // Decking & Benches (checkered plate & rugged wood)
      return {
        primary: isNight ? '#1e293b' : '#334155',
        dark: '#0f172a',
        light: '#64748b',
        border: '#1e293b',
        isRaw: true,
      };

    case 'victorian':
      if (elementIndex === 1) {
        // Brick Facades (ornate Flemish red brickwork)
        return {
          primary: isNight ? '#7f1d1d' : '#b91c1c',
          dark: '#451a03',
          light: '#dc2626',
          border: '#991b1b',
          isRaw: true,
        };
      }
      if (elementIndex === 2) {
        // Cast Iron (twisted black iron balustrades & ornamental arches)
        return {
          primary: isNight ? '#020617' : '#0f172a',
          dark: '#000000',
          light: '#334155',
          border: '#020617',
          isRaw: true,
        };
      }
      // Woodwork & Benches (rich polished mahogany vergeboards & theater chairs)
      return {
        primary: isNight ? '#451a03' : '#78350f',
        dark: '#2d0f02',
        light: '#92400e',
        border: '#5a2507',
        isRaw: true,
      };

    case 'modern':
    default:
      if (elementIndex === 1) {
        // Composite Panels (brushed titanium / silver composite cladding)
        return {
          primary: isNight ? '#475569' : '#94a3b8',
          dark: '#334155',
          light: '#e2e8f0',
          border: '#64748b',
          isRaw: true,
        };
      }
      if (elementIndex === 2) {
        // Stairs & Glass (terrazzo / illuminated glass stair treads)
        return {
          primary: isNight ? '#94a3b8' : '#e2e8f0',
          dark: '#64748b',
          light: '#ffffff',
          border: '#cbd5e1',
          isRaw: true,
        };
      }
      // High-Tech Accents (ergonomic bucket seat shells & LED ribbons)
      return {
        primary: isNight ? '#0369a1' : '#0284c7',
        dark: '#075985',
        light: '#38bdf8',
        border: '#0284c7',
        isRaw: true,
      };
  }
}

/**
 * =============================================================================
 * PHASE T7: VIP BUILDING MULTI-FLOOR ELEVATOR (1-5 FLOORS) & PITCHSIDE STAND
 * =============================================================================
 */

export type VipFloorCount = 1 | 2 | 3 | 4 | 5;
export type LowerStandSize = 'small' | 'medium' | 'big';
export type LowerStandMaterial = 'concrete' | 'brick' | 'metal';
export type LowerStandBarrier = 'glass_balustrade' | 'metal_handrail' | 'anti_surge_barrier';
export type LowerStandSeat = 'leather_armchair' | 'padded_bucket' | 'classic_shell';

export interface LowerStandOption<T> {
  id: T;
  label: string;
  icon: string;
  desc: string;
}

export const LOWER_STAND_SIZE_OPTIONS: LowerStandOption<LowerStandSize>[] = [
  {
    id: 'small',
    label: 'Small (3 Rows)',
    icon: '🪑',
    desc: 'Compact pitchside terrace (3 rows, ~25px depth) with dugouts and tunnel portal.',
  },
  {
    id: 'medium',
    label: 'Medium (5 Rows)',
    icon: '🏟️',
    desc: 'Expanded terrace (5 rows, ~40px depth) with enhanced supporter seating.',
  },
  {
    id: 'big',
    label: 'Big (8 Rows)',
    icon: '🏰',
    desc: 'Grand lower terrace (8 rows, ~60px depth) creating a commanding presence.',
  },
];

export const LOWER_STAND_MATERIAL_OPTIONS: LowerStandOption<LowerStandMaterial>[] = [
  { id: 'concrete', label: 'Concrete Slab', icon: '🏛️', desc: 'Precast architectural concrete terraces with expansion joints.' },
  { id: 'brick', label: 'Red Brick', icon: '🧱', desc: 'Classic Flemish-bond dark red brick foundation and risers.' },
  { id: 'metal', label: 'Checkered Metal', icon: '🏭', desc: 'Industrial steel decking with diamond plate tread and rivets.' },
];

export const LOWER_STAND_BARRIER_OPTIONS: LowerStandOption<LowerStandBarrier>[] = [
  { id: 'glass_balustrade', label: 'Glass Balustrade', icon: '💎', desc: 'Seamless tempered glass balustrade with polished stainless steel top rail.' },
  { id: 'metal_handrail', label: 'Metal Handrail', icon: '⛓️', desc: 'Heavy tubular steel pipe safety railing with high visibility warning accents.' },
  { id: 'anti_surge_barrier', label: 'Anti-Surge Barrier', icon: '🛡️', desc: 'Padded reinforced crowd crush barrier with integrated advertising fascia.' },
];

export const LOWER_STAND_SEAT_OPTIONS: LowerStandOption<LowerStandSeat>[] = [
  { id: 'leather_armchair', label: 'Leather Armchair', icon: '🛋️', desc: 'Plush executive leather armchair with padded headrests and drink holders.' },
  { id: 'padded_bucket', label: 'Padded Bucket', icon: '🪑', desc: 'Ergonomic tip-up cushioned stadium seat with upholstered fabric.' },
  { id: 'classic_shell', label: 'Classic Shell', icon: '💺', desc: 'Molded high-impact polymer bucket seat shell with ergonomic lumbar support.' },
];

/**
 * Resolves the active floor count for a VIP building stand (1 to 5 floors)
 */
export function getVipBuildingFloors(stand?: StandConfig): VipFloorCount {
  if (!stand) return 4;
  if (typeof stand.vipFloors === 'number') {
    return Math.max(1, Math.min(5, Math.round(stand.vipFloors))) as VipFloorCount;
  }
  if (typeof stand.tierCount === 'number') {
    return Math.max(1, Math.min(5, Math.round(stand.tierCount))) as VipFloorCount;
  }
  return 4;
}

/**
 * Returns the number of chair/terrace rows for a VIP lower stand
 */
export function getVipLowerStandRows(size: LowerStandSize = 'small'): number {
  if (size === 'big') return 8;
  if (size === 'medium') return 5;
  return 3;
}

/**
 * Returns physical depth in pixels for the VIP lower stand
 */
export function getVipLowerStandDepth(size: LowerStandSize = 'small'): number {
  if (size === 'big') return 60;
  if (size === 'medium') return 40;
  return 25;
}

/**
 * Returns spectator capacity contribution for the VIP lower stand terrace
 */
export function getVipLowerStandCapacity(size: LowerStandSize = 'small'): number {
  if (size === 'big') return 3200;
  if (size === 'medium') return 2000;
  return 1200;
}

/**
 * Calculates total capacity for a VIP Building stand with elevator floors and integrated lower stand
 */
export function calculateVipBuildingCapacity(
  stand: StandConfig,
  shapeOrMultiplier: number | StadiumShape = 1.0,
  pos?: StandPosition
): number {
  let posMultiplier = 1.0;
  if (typeof shapeOrMultiplier === 'number') {
    posMultiplier = shapeOrMultiplier;
  } else if (typeof shapeOrMultiplier === 'string') {
    const shape = shapeOrMultiplier as StadiumShape;
    const effectivePos = pos || stand.position || 'east';
    const isCorner = effectivePos.startsWith('corner_');
    const isTouchline = effectivePos === 'east' || effectivePos === 'west';
    posMultiplier = isCorner ? 0.35 : isTouchline ? 1.0 : 0.85;
    if (shape === 'round' || shape === 'oval') {
      posMultiplier = isCorner ? 0.6 : 0.95;
    } else if (shape === 'circular') {
      posMultiplier = isCorner ? 0.65 : 1.05;
    }
  }

  const floors = getVipBuildingFloors(stand);
  const suiteCapacity = floors * 1100;
  const lowerStandActive = stand.hasLowerStand !== false;
  const lowerStandCapacity = lowerStandActive ? getVipLowerStandCapacity(stand.lowerStandSize || 'medium') : 0;
  const totalBase = suiteCapacity + lowerStandCapacity;
  return Math.round(totalBase * posMultiplier);
}

/**
 * Phase T8: Returns true if the stand is configured as a "Stacked Wall" double-decker coliseum stand
 */
export function isStackedWallStand(stand?: StandConfig): boolean {
  return stand?.type === 'stacked_wall';
}

/**
 * Phase T8: Returns row counts for lower and upper decks of a Stacked Wall stand
 */
export function getStackedWallLowerRows(stand?: StandConfig): number {
  const size = stand?.stackedWallLowerSize || 'medium';
  const density = stand?.stackedWallLowerDensity || stand?.wallDensity || stand?.density || 'normal';
  return getWallTierChairRows(size, density);
}

export function getStackedWallUpperRows(stand?: StandConfig): number {
  const size = stand?.stackedWallUpperSize || 'medium';
  const density = stand?.stackedWallUpperDensity || stand?.wallDensity || stand?.density || 'normal';
  return getWallTierChairRows(size, density);
}

export function getStackedWallRows(stand?: StandConfig): { lowerRows: number; upperRows: number; totalRows: number } {
  const lowerRows = getStackedWallLowerRows(stand);
  const upperRows = getStackedWallUpperRows(stand);
  return { lowerRows, upperRows, totalRows: lowerRows + upperRows };
}

/**
 * Phase T8: Calculates total capacity for a Stacked Wall stand
 * Monumental lower terrace + integrated soaring upper wall + cantilever mezzanine concourse
 * Achieves up to 24,000+ to 34,000+ spectators (highest capacity stand in the engine)
 */
export function calculateStackedWallCapacity(
  stand: StandConfig,
  shapeOrMultiplier: number | StadiumShape = 1.0,
  pos?: StandPosition
): number {
  let posMultiplier = 1.0;
  if (typeof shapeOrMultiplier === 'number') {
    posMultiplier = shapeOrMultiplier;
  } else if (typeof shapeOrMultiplier === 'string') {
    const shape = shapeOrMultiplier as StadiumShape;
    const effectivePos = pos || stand.position || 'east';
    const isCorner = effectivePos.startsWith('corner_');
    const isTouchline = effectivePos === 'east' || effectivePos === 'west';
    posMultiplier = isCorner ? 0.35 : isTouchline ? 1.0 : 0.85;
    if (shape === 'round' || shape === 'oval') {
      posMultiplier = isCorner ? 0.6 : 0.95;
    } else if (shape === 'circular') {
      posMultiplier = isCorner ? 0.65 : 1.05;
    }
  }

  const lowerSize = stand.stackedWallLowerSize || 'medium';
  const upperSize = stand.stackedWallUpperSize || 'medium';
  const lowerDensity = stand.stackedWallLowerDensity || stand.wallDensity || stand.density || 'normal';
  const upperDensity = stand.stackedWallUpperDensity || stand.wallDensity || stand.density || 'normal';

  const lowerBase = lowerSize === 'large' ? 18000 : lowerSize === 'medium' ? 14000 : 10000;
  // Phase T9: If VIP Seats are active on Stacked Wall, upper wall deck becomes an executive hospitality mezzanine
  const isVipUpper = hasStandVipSeats(stand);
  const upperBase = isVipUpper
    ? 2200
    : (upperSize === 'large' ? 15000 : upperSize === 'medium' ? 11000 : 8000);

  const lowerCap = Math.round(lowerBase * getDensityCapacityFactor(lowerDensity));
  const upperCap = Math.round(upperBase * getDensityCapacityFactor(upperDensity));
  const mezzanineBonus = isVipUpper ? 800 : 1500;

  let totalBase = lowerCap + upperCap + mezzanineBonus;
  if (hasStandVipZone(stand)) {
    totalBase = Math.round(totalBase * 0.95);
  }
  if (hasStandTransmissionArea(stand)) {
    totalBase = Math.max(0, totalBase - 150);
  }
  return Math.round(totalBase * posMultiplier);
}

export interface StackedWallSizeOption {
  id: WallTierSize;
  label: string;
  shortLabel: string;
  defaultRows: number;
  desc: string;
}

export const STACKED_WALL_SIZE_OPTIONS: StackedWallSizeOption[] = [
  { id: 'small', label: 'Small Wall Deck', shortLabel: 'Small', defaultRows: 6, desc: 'Compact terrace (6 rows default)' },
  { id: 'medium', label: 'Medium Wall Deck', shortLabel: 'Medium', defaultRows: 11, desc: 'Standard soaring terrace (11 rows default)' },
  { id: 'large', label: 'Big Monumental Deck', shortLabel: 'Big', defaultRows: 16, desc: 'Monumental coliseum wall (16 rows default)' },
];

/**
 * Phase T8: Shape Guard for Stand Types
 * On Round & Oval stadiums, the flat "VIP Building" is disabled (as circular coliseums have continuous curvature).
 * Instead, offers "Stacked Wall" (Metropolitano & Tottenham Style).
 */
export function getAvailableStandTypesForShape(shape?: StadiumShape): { id: StandType; label: string; desc: string }[] {
  const isBowl = shape === 'round' || shape === 'circular' || shape === 'oval';

  if (isBowl) {
    return [
      { id: 'tiered', label: 'TIERED', desc: '1 to 4 Decks' },
      { id: 'wall', label: 'THE WALL', desc: 'Single Monumental Terrace' },
      { id: 'stacked_wall', label: 'STACKED WALL', desc: 'Double-Decker Coliseum Wall' },
      { id: 'none', label: 'NO STAND', desc: 'Open Radial End' },
    ];
  }

  return [
    { id: 'tiered', label: 'TIERED', desc: '1 to 4 Decks' },
    { id: 'wall', label: 'THE WALL', desc: 'Single Monumental Terrace' },
    { id: 'stacked_wall', label: 'STACKED WALL', desc: 'Double-Decker Wall' },
    { id: 'vip_building', label: 'VIP BUILDING', desc: 'Luxury Suites & Palcos' },
    { id: 'none', label: 'NO STAND', desc: 'Open End' },
  ];
}

/**
 * 5 Surrounding-Specific Horizon Skirt architectural styles bridging concourse to skyline
 */
export type HorizonSkirtType =
  | 'mountain_valley'
  | 'coastal_marine'
  | 'metropolis'
  | 'heritage_uk'
  | 'industrial_harbor';

/**
 * Resolve surroundings type to appropriate horizon skirt archetype
 */
export function resolveHorizonSkirt(surroundings: SurroundingsType = 'small_city'): HorizonSkirtType {
  switch (surroundings) {
    case 'beach':
    case 'marine_floating':
      return 'coastal_marine';
    case 'railroad':
    case 'airport':
    case 'parking_lot':
      return 'industrial_harbor';
    case 'big_city':
    case 'highway':
      return 'metropolis';
    case 'small_city':
      return 'heritage_uk';
    case 'mountains':
    case 'forest':
    case 'savannah':
    case 'nature':
    default:
      return 'mountain_valley';
  }
}

/**
 * Zoom preset definition for dedicated vertical zoom bar engine
 */
export interface ZoomPreset {
  id: 'pitch' | 'concourse' | 'arena' | 'whole_world';
  zoom: number;
  label: string;
  description: string;
}

/**
 * 4 Standard Zoom Snap Presets (Phase B1.3)
 * Covering 100% ground level tactical detail down to 5% macroscopic whole-world vista
 */
export const ZOOM_SNAP_PRESETS: ZoomPreset[] = [
  {
    id: 'pitch',
    zoom: 1.0,
    label: '100% Pitch',
    description: 'Ground Level tactical detail & pitch markings focus',
  },
  {
    id: 'concourse',
    zoom: 0.50,
    label: '50% Concourse',
    description: 'Inner bowl, apron buffer & spectator tier concourse',
  },
  {
    id: 'arena',
    zoom: 0.15,
    label: '15% Arena',
    description: 'Full stadium architecture & outer grounds perimeter',
  },
  {
    id: 'whole_world',
    zoom: 0.05,
    label: '5% Whole-World',
    description: 'Extreme macroscopic vista & expanded northern skyline aperture',
  },
];

/**
 * =============================================================================
 * PHASE B2: GRANDSTAND TYPOLOGY DISTINCTION, "THE WALL", NO-STAND & ATTENDANCE
 * =============================================================================
 */

/**
 * Helper: Identify if a stand is "The Wall" (monolithic single-tier steep terrace)
 */
export function isTheWallStand(stand?: StandConfig): boolean {
  return stand?.type === 'wall';
}

/**
 * Phase D4.5A: Dynamic Stand Dimensional Scaling Engine
 * Computes dynamic physical stand depth based on tier count, tier size, and stand typology:
 * - 1 Tier:  75px – 90px (compact municipal terrace)
 * - 2 Tiers: 135px – 155px (standard ground)
 * - 3 Tiers: 190px – 220px (large multi-deck stadium)
 * - 4 Tiers: 250px – 285px (massive monumental arena)
 * 
 * Tier Size scaling:
 * - Small:  -15% depth (2 rows)
 * - Medium: 1.0x depth (3 rows)
 * - Large:  +25% depth (4–5 rows)
 * 
 * Stand Typologies:
 * - 'none' | 'no_stand': 0px (pure perimeter boundary, open contextual reveal)
 * - 'wall': 210px – 260px (single massive steep terrace)
 */
export function calculateDynamicStandDepth(
  stand?: StandConfig,
  shape?: StadiumShape
): number {
  if (!stand) {
    if (shape === 'round' || shape === 'circular' || shape === 'oval') {
      return 220;
    }
    return 145; // Default 2-tier medium depth
  }

  // 1. None / No Stand -> 0px depth (Phase D4.5D)
  if (stand.type === 'none' || stand.type === 'no_stand') {
    return 0;
  }

  // 2. Monolithic "The Wall" Stand (Phase D4.5C & T4.2 Wall Sizing Calibration) & Giant Corner (Phase T12.2 Monumental Depth Scaling ~180px–240px)
  const isCornerGiant =
    stand.type === 'giant' ||
    stand.type === 'square' ||
    stand.cornerType === 'giant' ||
    stand.cornerType === 'square' ||
    (Boolean(stand.position && stand.position.startsWith('corner_')) &&
      resolveCornerArchitectureType(stand.cornerType || stand.type) === 'giant');

  if (
    stand.type === 'wall' ||
    isTheWallStand(stand) ||
    isCornerGiant
  ) {
    if (isCornerGiant) {
      // Phase T12.2: Monumental Giant Corner Scaling (~180px - 240px depth matching adjacent Big Wall & 4-tier stands)
      return getGiantCornerMonumentalDepth(stand.wallSize);
    }
    const wallSize: TierSize = stand.wallSize || 'medium';
    if (wallSize === 'small') {
      return 90; // Small: ~90px (6 rows, roughly the size of a 1-tier stand)
    } else if (wallSize === 'large') {
      return 250; // Big/Large: ~250px (16 rows, roughly the same size as a 4-tier stand)
    }
    return 150; // Medium: ~150px (11 rows, roughly the size of a 2-tier stand)
  }

  // 2B. VIP Building Stand (Phase T2: La Bombonera-style flat vertical tower with luxury suites + lower terrace)
  if (stand.type === 'vip_building') {
    return 110;
  }

  // 2C. Stacked Wall (Phase T8: Double-Decker Wall Stand - Metropolitano & Tottenham Style)
  if (stand.type === 'stacked_wall' || isStackedWallStand(stand)) {
    const lower = stand.stackedWallLowerSize || 'medium';
    const upper = stand.stackedWallUpperSize || 'medium';
    const lowerDepth = lower === 'small' ? 70 : lower === 'large' ? 140 : 100;
    const upperDepth = upper === 'small' ? 70 : upper === 'large' ? 140 : 110;
    return lowerDepth + upperDepth + 15; // +15px mezzanine cantilever balcony
  }

  // 3. Multi-tier Grandstand Scaling
  const rawTiers = stand.tierCount ?? (stand.tiers && stand.tiers.length > 0 ? stand.tiers.length : 2);
  const tierCount = Math.max(1, Math.min(4, Math.round(rawTiers)));

  // Base depth per tier count:
  const baseDepths: Record<number, { min: number; base: number; max: number }> = {
    1: { min: 75, base: 82, max: 90 },
    2: { min: 135, base: 145, max: 155 },
    3: { min: 190, base: 205, max: 220 },
    4: { min: 250, base: 268, max: 285 },
  };

  const config = baseDepths[tierCount] || baseDepths[2];

  // Hotfix T13C: Resolve tier size factor from all configured tiers
  let depth = config.base;
  if (stand.tiers && stand.tiers.length > 0) {
    let scaleSum = 0;
    const count = Math.min(tierCount, stand.tiers.length);
    for (let i = 0; i < count; i++) {
      const sz = stand.tiers[i]?.size || 'medium';
      scaleSum += sz === 'small' ? 0.85 : sz === 'large' ? 1.25 : 1.0;
    }
    const avgScale = count > 0 ? scaleSum / count : 1.0;
    depth = Math.round(config.base * avgScale);
  } else {
    const dominantSize: TierSize = (stand as any).tierSize || 'medium';
    if (dominantSize === 'small') {
      depth = Math.round(config.base * 0.85); // -15%
    } else if (dominantSize === 'large') {
      depth = Math.round(config.base * 1.25); // +25%
    }
  }

  return Math.max(config.min, Math.min(config.max, depth));
}

export const calculateStandPhysicalDepth = calculateDynamicStandDepth;

/**
 * B2.2 Six Canonical Perimeter Enclosure Archetypes for Open "No Stand" sides
 */
export interface CanonicalPerimeterEnclosure {
  id: PerimeterFinishType;
  label: string;
  category: string;
  description: string;
}

export const CANONICAL_B2_PERIMETERS: CanonicalPerimeterEnclosure[] = [
  {
    id: 'chainlink_fence',
    label: 'Galvanized Chain-Link Security Fence',
    category: 'Industrial / Security',
    description: 'Interlocking diamond wire mesh with galvanized tubular steel posts, top tension rail, and caution notices.',
  },
  {
    id: 'turnstile_brick_wall',
    label: 'Victorian Red Brick Turnstile Wall',
    category: 'Heritage / Traditional',
    description: 'High Flemish-bond brick masonry wall with terracotta stone coping, turnstile entrance wickets, and decorative crests.',
  },
  {
    id: 'concrete_wall',
    label: 'Concrete Security Barrier with Graffiti',
    category: 'Urban / Ultra',
    description: 'Weathered precast concrete jersey barriers and security walls adorned with retro football fan stencils and club ultra graffiti.',
  },
  {
    id: 'glass_balustrade',
    label: 'Modern Tempered Glass Balustrade',
    category: 'Modern / Premium',
    description: 'Sleek transparent tempered glass panels with polished stainless steel balustrade clamps and ambient edge illumination.',
  },
  {
    id: 'potrero_berm',
    label: 'Open Grass Potrero Berm',
    category: 'Rural / Grassroots',
    description: 'Rolling earthen embankment with wild dandelion tufts, wooden spectator railing, and supporters leaning on split-rail cedar fences.',
  },
  {
    id: 'stone_seawall',
    label: 'Seaside Stone Breakwater Wall',
    category: 'Coastal / Maritime',
    description: 'Heavy granite block caisson seawall with beveled coping, rusted maritime mooring rings, and cast-iron bollards.',
  },
];

/**
 * B2.2 Default Perimeter Enclosure Resolver based on Grounds & Surroundings
 */
export function getDefaultPerimeterForGrounds(
  grounds?: StadiumGroundsType,
  surroundings?: SurroundingsType
): PerimeterFinishType {
  if (
    grounds === 'potrero_dirt' ||
    grounds === 'savannah_wadi_potrero' ||
    grounds === 'forest_woodland_clearing' ||
    surroundings === 'savannah' ||
    surroundings === 'nature'
  ) {
    return 'potrero_berm';
  }
  if (
    grounds?.startsWith('marine_') ||
    grounds?.startsWith('beach_') ||
    surroundings === 'beach' ||
    surroundings === 'marine_floating'
  ) {
    return 'stone_seawall';
  }
  if (
    grounds === 'modern_architectural' ||
    grounds === 'mall_commercial' ||
    surroundings === 'big_city'
  ) {
    return 'glass_balustrade';
  }
  if (
    grounds === 'industrial_depot' ||
    grounds?.startsWith('railroad_') ||
    grounds?.startsWith('airport_') ||
    grounds?.startsWith('highway_')
  ) {
    return 'concrete_wall';
  }
  if (
    grounds === 'classical_statues' ||
    grounds === 'club_museum_trophies' ||
    surroundings === 'small_city'
  ) {
    return 'turnstile_brick_wall';
  }
  return 'chainlink_fence';
}

/**
 * B2.4 Dynamic Match Attendance Percentage Calculator
 * - 'packet': 100% Sold Out (full stadium + standing aisles)
 * - 'crowded': 75% Standard Match (clusters of empty seats in upper tiers & corners)
 * - 'half': 50% Mid-Tier Cup Match (significant swaths of exposed seats & patterns)
 * - 'few': 38%
 * - 'small': 25% Minor League (sparse fan pockets, mostly exposed empty seats)
 * - 'empty': 0% Ghost Match (100% exposed colored seats & echoing stadium)
 */
export function getAttendancePercentage(crowdLevel?: CrowdLevel): number {
  switch (crowdLevel) {
    case 'packet':
      return 100;
    case 'crowded':
      return 75;
    case 'half':
      return 50;
    case 'few':
      return 38;
    case 'small':
      return 25;
    case 'empty':
    default:
      return crowdLevel === 'empty' ? 0 : 75;
  }
}

/**
 * B2.4 Deterministic Pseudo-Random Seat Occupancy Resolver
 * Zero-allocation, reproducible decision based on coordinates, stand position, and crowd level.
 */
export function shouldSeatBeOccupied(
  row: number,
  col: number,
  pos: StandPosition | string = 'east',
  crowdLevel: CrowdLevel = 'crowded'
): boolean {
  if (crowdLevel === 'empty') return false;
  if (crowdLevel === 'packet') return true;

  // Compute fast deterministic hash (0 to 999)
  const posHash = pos.charCodeAt(0) * 31 + (pos.charCodeAt(1) || 0) * 17;
  const hash = Math.abs(((col * 73856093) ^ (row * 19349663) ^ (posHash * 83492791)) % 1000);

  if (crowdLevel === 'crowded') {
    // 75% target attendance:
    // Upper rows (row >= 6) and corner stands have slightly higher vacancy (~35% empty),
    // while lower central rows are packed (~88% occupied).
    const isUpperRow = row >= 5;
    const isCorner = pos.startsWith('corner_');
    const threshold = isCorner ? 620 : isUpperRow ? 680 : 850;
    return hash < threshold;
  }

  if (crowdLevel === 'half') {
    // 50% target attendance:
    // Exposed swaths, block clusters where every 2nd or 3rd column block has clusters
    const blockCluster = Math.floor(col / 18) % 2 === 0;
    const threshold = blockCluster ? 650 : 350;
    return hash < threshold;
  }

  if (crowdLevel === 'few') {
    // ~38% target attendance
    return hash < 380;
  }

  if (crowdLevel === 'small') {
    // 25% target attendance:
    // Sparse fan pockets mostly huddled near the front and center of stands
    const isLowerCentral = row <= 3;
    const threshold = isLowerCentral ? 420 : 160;
    return hash < threshold;
  }

  return hash < 750;
}

/**
 * B2.3 Vibrant Pitch-View Seat Color Pattern Resolver
 * Resolves high-contrast colors matching the chosen seat pattern:
 * - 'solid': Primary color
 * - 'horizontalBands': Alternating row colors
 * - 'verticalStripes': Alternating column bands (e.g. 12-seat blocks)
 * - 'checkered': Checkerboard alternating blocks
 * - 'lowerUpper': Lower deck primary, upper deck secondary
 * - 'letter_mosaic': Contrasting accent forming club crest letter or star
 */
export function resolvePitchViewSeatColor(
  pattern: SeatPattern | string | undefined,
  row: number,
  col: number,
  tierIndex: number,
  primaryColor: string = '#0284c7',
  secondaryColor: string = '#ffffff'
): string {
  const effSec = secondaryColor === '#ffffff' ? '#e2e8f0' : secondaryColor;

  switch (pattern) {
    case 'horizontalBands':
      return row % 2 === 0 ? primaryColor : effSec;

    case 'verticalStripes':
      return Math.floor(col / 8) % 2 === 0 ? primaryColor : effSec;

    case 'checkered':
      return (Math.floor(col / 6) + row) % 2 === 0 ? primaryColor : effSec;

    case 'lowerUpper':
      return tierIndex === 0 ? primaryColor : effSec;

    case 'letter_mosaic': {
      // Procedural mosaic pattern (forms a centered contrast diamond or star block)
      const normCol = Math.abs(col % 24 - 12);
      const isMosaicPixel = (normCol + (row % 6)) <= 5;
      return isMosaicPixel ? effSec : primaryColor;
    }

    case 'solid':
    default:
      return primaryColor;
  }
}

/**
 * =============================================================================
 * PHASE B3: COMPREHENSIVE 32-BIT ARCHITECTURAL OVERHAUL
 * =============================================================================
 */

/**
 * B3.1 Four Canonical Procedural 32-Bit Grandstand Materials
 * 1. brutalist_concrete: Dithered grey stone tones, subtle water runoff staining, expansion joints, and aggregate texture.
 * 2. victorian_brick: Individual red and burnt umber brick pixel modules with light mortar joints and arched vomitory keystones.
 * 3. industrial_steel: Galvanized vertical corrugated metal sheeting with zinc specular highlights and rivet fasteners.
 * 4. composite_cladding: Ultra-clean modular enamel panels with high-gloss metallic reflections and glowing LED accent strips.
 */
export type GrandstandMaterial =
  | 'brutalist_concrete'
  | 'victorian_brick'
  | 'industrial_steel'
  | 'composite_cladding';

export interface GrandstandMaterialOption {
  id: GrandstandMaterial;
  label: string;
  icon: string;
  desc: string;
}

export const CANONICAL_B3_MATERIALS: GrandstandMaterialOption[] = [
  {
    id: 'brutalist_concrete',
    label: 'Brutalist Weathered Concrete',
    icon: '🏛️',
    desc: 'Dithered stone tones, subtle water runoff staining, expansion joints, and aggregate texture.',
  },
  {
    id: 'victorian_brick',
    label: 'Victorian Red Brick',
    icon: '🧱',
    desc: 'Individual red and burnt umber brick modules with light mortar joints and arched keystones.',
  },
  {
    id: 'industrial_steel',
    label: 'Industrial Corrugated Steel',
    icon: '🔩',
    desc: 'Galvanized vertical corrugated sheeting with zinc specular highlights and rivet fasteners.',
  },
  {
    id: 'composite_cladding',
    label: 'Modern Composite Cladding',
    icon: '💎',
    desc: 'Ultra-clean modular enamel panels with high-gloss metallic reflections and glowing LED accent strips.',
  },
];

/**
 * Resolves the effective 32-bit grandstand material for a stand
 */
export function resolveGrandstandMaterial(stand?: StandConfig): GrandstandMaterial {
  if (stand?.grandstandMaterial) {
    return stand.grandstandMaterial;
  }
  if (stand?.grade === 'grade2_classic' || stand?.rearWallMaterial === 'brick') {
    return 'victorian_brick';
  }
  if (
    stand?.grade === 'grade3_industrial' ||
    stand?.grade === 'grade3_steel_cantilever' ||
    stand?.rearWallMaterial === 'corrugated_steel' ||
    stand?.deckMaterial === 'steel'
  ) {
    return 'industrial_steel';
  }
  if (
    stand?.grade === 'grade4_modern' ||
    stand?.grade === 'grade5_futuristic' ||
    stand?.deckMaterial === 'composite'
  ) {
    return 'composite_cladding';
  }
  return 'brutalist_concrete';
}

/**
 * =============================================================================
 * PHASE B5: SURROUNDING HORIZONS OVERHAUL (DEEP MARINE, AIRPORT & MOUNTAINS)
 * =============================================================================
 */

export type CanonicalMarineGroundArchetype =
  | 'aircraft_carrier'
  | 'oil_rig'
  | 'coral_atoll'
  | 'hex_pontoon';

export function resolveMarineGroundArchetype(grounds?: StadiumGroundsType | string): CanonicalMarineGroundArchetype {
  if (grounds === 'marine_aircraft_carrier' || grounds === 'marine_moored_boats') {
    return 'aircraft_carrier';
  }
  if (grounds === 'marine_oil_rig') {
    return 'oil_rig';
  }
  if (grounds === 'marine_tropical_atoll' || grounds === 'marine_open_lagoon') {
    return 'coral_atoll';
  }
  return 'hex_pontoon';
}

export interface B5HorizonFeature {
  id: string;
  name: string;
  description: string;
  keyElements: string[];
}

export const B5_HORIZON_FEATURES = {
  version: 'Phase B5',
  deepMarineOcean: {
    canonicalArchetypes: ['aircraft_carrier', 'oil_rig', 'coral_atoll', 'hex_pontoon'] as CanonicalMarineGroundArchetype[],
  },
  airportGibraltar: {
    hasRockOfGibraltar: true,
  },
  mountainsNorthernChain: {
    hasAlpenglow: true,
  },
  marine: {
    id: 'marine',
    name: 'Deep Marine Ocean Expanse',
    description: 'Dramatic open-ocean setting surrounded by deep azure water, breaking waves, and foam.',
    keyElements: [
      'Military Aircraft Carrier flight deck with catapult markings & island superstructure',
      'Offshore Industrial Oil/Gas Platform with yellow lattice legs & gas flare tower',
      'Tiny Tropical Coral Atoll with white sand, turquoise reef & coconut palms',
      'Floating Modular Hex-Pontoon with anchor chains, navigation buoys & sea spray',
    ],
  },
  airport: {
    id: 'airport',
    name: 'Gibraltar Victoria Airport Runway & Rock',
    description: 'Active international runway hugging stadium perimeter with the Rock of Gibraltar looming in the background.',
    keyElements: [
      'Tarmac runway with threshold piano keys, centerline dashes & taxiway turnoffs',
      'Approach lighting stanchions & galvanized perimeter security fence',
      'Animated commercial jet / turboprop on low approach or taxiing',
      'The towering sheer limestone cliffs of the Rock of Gibraltar',
    ],
  },
  mountains: {
    id: 'mountains',
    name: 'Alpine Mountain Chain',
    description: 'Breathtaking multi-tiered parallax alpine panorama dominating the northern horizon.',
    keyElements: [
      'Forefront evergreen pine and larch forest ridges',
      'Mid-ground craggy granite cliffs, alpine meadows & winding pass road',
      'Distant jagged snowcapped peaks with couloirs & glistening glaciers',
      'Drifting atmospheric mountain mist & alpenglow',
    ],
  },
};

/**
 * =============================================================================
 * PHASE B7: MASTER B-SERIES INTEGRATION, ZERO-ALLOCATION CALIBRATION & VITEST SUITE
 * =============================================================================
 */

export interface B7MasterSuiteFeatures {
  version: 'Phase B7';
  verticalHierarchy: {
    strictlyMonotonicYOrder: boolean;
    apertureHeadroomBufferMinPx: number;
    supportedShapes: StadiumShape[];
  };
  zoomScaleEngine: {
    minZoom: number;
    maxZoom: number;
    extremeMacroscopicMinZoom: number;
    snapPresets: ZoomPreset[];
  };
  grandstandTypology: {
    theWallContinuousRake: boolean;
    multiTierOverhangShadows: boolean;
    canonicalPerimeterEnclosures: PerimeterFinishType[];
    seatArchetypes: SeatArchetype[];
  };
  matchAtmosphere: {
    crowdLevels: ('empty' | 'small' | 'few' | 'half' | 'crowded' | 'packet')[];
    pitchViewSpecularHighlights: boolean;
  };
  surroundingsAndHorizons: {
    marineArchetypes: CanonicalMarineGroundArchetype[];
    airportRunwayActive: boolean;
    mountainChainParallax: boolean;
  };
  cinematicFlight: {
    ultraWide5PercentStart: boolean;
    pitchHandoffSmoothness: boolean;
    bezierCurveStages: number;
  };
  performanceSLA: {
    targetFps: number;
    maxFrameBudgetMs: number;
    zeroPerFrameAllocation: boolean;
    budgetDeviceFriendly: boolean;
  };
}

export const B7_MASTER_SUITE_FEATURES: B7MasterSuiteFeatures = {
  version: 'Phase B7',
  verticalHierarchy: {
    strictlyMonotonicYOrder: true,
    apertureHeadroomBufferMinPx: 320,
    supportedShapes: ['rectangular', 'square', 'round', 'oval'],
  },
  zoomScaleEngine: {
    minZoom: 0.05,
    maxZoom: 1.60,
    extremeMacroscopicMinZoom: 0.05,
    snapPresets: ZOOM_SNAP_PRESETS,
  },
  grandstandTypology: {
    theWallContinuousRake: true,
    multiTierOverhangShadows: true,
    canonicalPerimeterEnclosures: [
      'chainlink_fence',
      'turnstile_brick_wall',
      'concrete_wall',
      'glass_balustrade',
      'potrero_berm',
      'stone_seawall',
    ],
    seatArchetypes: ['molded_bucket', 'wooden_heritage_bench', 'metallic_tip_up'],
  },
  matchAtmosphere: {
    crowdLevels: ['empty', 'small', 'few', 'half', 'crowded', 'packet'],
    pitchViewSpecularHighlights: true,
  },
  surroundingsAndHorizons: {
    marineArchetypes: ['aircraft_carrier', 'oil_rig', 'coral_atoll', 'hex_pontoon'],
    airportRunwayActive: true,
    mountainChainParallax: true,
  },
  cinematicFlight: {
    ultraWide5PercentStart: true,
    pitchHandoffSmoothness: true,
    bezierCurveStages: 4,
  },
  performanceSLA: {
    targetFps: 60,
    maxFrameBudgetMs: 16.67,
    zeroPerFrameAllocation: true,
    budgetDeviceFriendly: true,
  },
};

/**
 * Phase D4: Subtle High-Oblique Stand Perspective Alignment Metrics
 */
export interface StandPerspectiveMetrics {
  northTaperX: number;
  southTaperX: number;
  lateralTaperNorth: number;
  lateralTaperSouth: number;
  perspectiveRatio: number;
  eccentricityNorth: number;
  eccentricitySouth: number;
}

