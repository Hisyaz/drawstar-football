/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TeamDefinition,
  TeamCategory,
  Confederation,
  TeamHomeVenueConfig,
  TeamSponsor,
  AdboardTier,
  FanAcousticStyle,
  FanHostilityLevel,
  SpecialClubTradition,
  CulturalDemographicRegion,
} from '../types/team';
import { SeatPattern, BenchType } from '../types/stadium';
import { getStadiumById } from './stadiumRegistry';
import {
  getAssignedCommercialSponsorsForTeam,
  INTERNATIONAL_COMMERCIAL_BRANDS,
  getNationalBrandsForCountry,
} from '../../data/fictionalSponsors';

import { MODERN_EUROPEAN_XI, CLASSIC_EUROPEAN_XI } from './teams/specialTeams';
import { MODERN_SOUTH_AMERICAN_XI, CLASSIC_SOUTH_AMERICAN_XI } from './teams/southAmericanLegends';
import { AFRICA_ALL_TIME_XI, ASIA_OCEANIA_ALL_TIME_XI, CONCACAF_LEGENDS } from './teams/otherLegends';
import { SPAIN_2026, ARGENTINA_2026 } from './teams/nationalTeams';
import { BOCA_JUNIORS_2026, RIVER_PLATE_2026, REAL_CUNDINAMARCA, BOGOTA_FC } from './teams/clubTeams';

export * from './teams/specialTeams';
export * from './teams/southAmericanLegends';
export * from './teams/otherLegends';
export * from './teams/nationalTeams';
export * from './teams/clubTeams';

/**
 * Phase 13.5: Expanded Multi-Tier Roster Database & All-Time Continental Showcase (7 Legendary Squads)
 *
 * Tiers:
 * - Tier S: All-Time Continental Showcase (93 - 98 OVR) with ⚡ Stat Breaks (7 Global Teams)
 * - Tier A: Elite International Contenders (87 OVR, Spain 2026 & Argentina 2026)
 * - Tier B: Heritage Pro Superclásico Rivals (76 - 77 OVR, Boca Juniors 2026 & River Plate 2026)
 * - Tier C: Ascenso Derby Underdogs (55 OVR, Real Cundinamarca & Bogotá FC)
 */

export const TEAM_DATABASE: TeamDefinition[] = [
  // ==========================================================================
  // TIER S — ALL-TIME CONTINENTAL SHOWCASE (7 LEGENDARY SQUADS)
  // ==========================================================================
  MODERN_EUROPEAN_XI,
  CLASSIC_EUROPEAN_XI,
  MODERN_SOUTH_AMERICAN_XI,
  CLASSIC_SOUTH_AMERICAN_XI,
  AFRICA_ALL_TIME_XI,
  ASIA_OCEANIA_ALL_TIME_XI,
  CONCACAF_LEGENDS,

  // ==========================================================================
  // TIER A — WORLD CUP HEAVYWEIGHTS (NATIONAL TEAMS)
  // ==========================================================================
  SPAIN_2026,
  ARGENTINA_2026,

  // ==========================================================================
  // TIER B — SUPERCLÁSICO RIVALS (CLUBS)
  // ==========================================================================
  BOCA_JUNIORS_2026,
  RIVER_PLATE_2026,

  // ==========================================================================
  // TIER C — ASCENSO DERBY RIVALS (CLUBS)
  // ==========================================================================
  REAL_CUNDINAMARCA,
  BOGOTA_FC,
];

// Bundled kickoff teams use original, fictional manager identities. Keep these
// names distinct from the club and youth data-pack manager pool.
const FICTIONAL_BUNDLED_MANAGER_NAMES = [
  'Nilo Valcor', 'Orin Senari', 'Pavel Lunet', 'Quen Ardell', 'Rian Mavero',
  'Soren Cendris', 'Tarek Velkan', 'Ulan Teren', 'Vero Zorren', 'Warin Avelin',
  'Xavi Corvane', 'Yoren Rovelli', 'Zalen Kovalen',
];

TEAM_DATABASE.forEach((team, index) => {
  team.manager = {
    ...team.manager,
    name: FICTIONAL_BUNDLED_MANAGER_NAMES[index],
    country: team.manager?.country || team.country,
    countryCode: team.manager?.countryCode || team.countryCode,
  };
});

// Phase 12: Team-Specific Home Stadium Binding & Kickoff Venue Registry (Section 12.5)
BOCA_JUNIORS_2026.homeStadiumId = 'la_bombonera';
BOCA_JUNIORS_2026.venueOverrides = {
  pitchPattern: 'diagonal_diamonds',
  netStyle: 'brazilian',
  netTension: 'hard',
  pitchSizePreset: 'compact',
  turfQuality: 'normal',
  dugoutStyle: 'covered_sunken',
  tunnelStyle: 'inflatable_accordion',
  fanColors: { primary: '#1d4ed8', secondary: '#eab308' },
  bannerMessages: ['¡LA 12 TE ALIENTA!', 'BOCA ES MUNDIAL', 'XENEIZE HASTA LA MUERTE'],
  sponsors: ['PAMPA GAS', 'AEROVAN', 'NEXORA TEL'],
};

RIVER_PLATE_2026.homeStadiumId = 'estadio_monumental';
RIVER_PLATE_2026.venueOverrides = {
  pitchPattern: 'european_boxes',
  netStyle: 'standard',
  netTension: 'moderate',
  pitchSizePreset: 'balanced',
  turfQuality: 'pristine',
  dugoutStyle: 'recaro_racing',
  tunnelStyle: 'subterranean_staircase',
  fanColors: { primary: '#dc2626', secondary: '#ffffff' },
  bannerMessages: ['EL MAS GRANDE LEJOS', 'RIVER DE MI VIDA', 'CARP 1901'],
  sponsors: ['SUR PAGOS', 'FINAPEX', 'SOLARION'],
};

SPAIN_2026.homeStadiumId = 'santiago_bernabeu';
SPAIN_2026.venueOverrides = {
  pitchPattern: 'european_boxes',
  netStyle: 'standard',
  netTension: 'moderate',
  pitchSizePreset: 'balanced',
  turfQuality: 'pristine',
  dugoutStyle: 'recaro_racing',
  tunnelStyle: 'modern_architectural',
  fanColors: { primary: '#dc2626', secondary: '#facc15' },
  bannerMessages: ['VIVA ESPAÑA', 'LA FURIA ROJA', 'CAMPEONES DEL MUNDO'],
};

ARGENTINA_2026.homeStadiumId = 'estadio_monumental';
ARGENTINA_2026.venueOverrides = {
  pitchPattern: 'european_boxes',
  netStyle: 'standard',
  netTension: 'moderate',
  pitchSizePreset: 'balanced',
  turfQuality: 'pristine',
  dugoutStyle: 'recaro_racing',
  tunnelStyle: 'subterranean_staircase',
  fanColors: { primary: '#38bdf8', secondary: '#ffffff' },
  bannerMessages: ['MUCHACHOS AHORA NOS VOLVIMOS A ILUSIONAR', 'VAMOS ARGENTINA', '3 ESTRELLAS EN EL PECHO'],
};

REAL_CUNDINAMARCA.homeStadiumId = 'estadio_metropolitano_techo';
REAL_CUNDINAMARCA.venueOverrides = {
  pitchPattern: 'plain',
  netStyle: 'standard',
  netTension: 'soft',
  pitchSizePreset: 'compact',
  turfQuality: 'poor',
  dugoutStyle: 'utilitarian_concrete',
  tunnelStyle: 'inflatable_accordion',
  fanColors: { primary: '#005b41', secondary: '#ffd100' },
  bannerMessages: ['CUNDINAMARCA CORAZON', 'FUERZA REAL', 'ASCENSO PASION'],
};

BOGOTA_FC.homeStadiumId = 'estadio_metropolitano_techo';
BOGOTA_FC.venueOverrides = {
  pitchPattern: 'plain',
  netStyle: 'standard',
  netTension: 'soft',
  pitchSizePreset: 'compact',
  turfQuality: 'poor',
  dugoutStyle: 'utilitarian_concrete',
  tunnelStyle: 'inflatable_accordion',
  fanColors: { primary: '#e11d48', secondary: '#fbbf24' },
  bannerMessages: ['BOGOTA FC EN EL PECHO', 'LOS LEONES DE TECHO'],
};

CLASSIC_EUROPEAN_XI.homeStadiumId = 'craven_cottage';
CLASSIC_EUROPEAN_XI.venueOverrides = {
  pitchPattern: 'horizontal',
  netStyle: 'standard',
  netTension: 'moderate',
  pitchSizePreset: 'compact',
  turfQuality: 'normal',
  dugoutStyle: 'classic_timber',
  tunnelStyle: 'direct_portal',
};

MODERN_EUROPEAN_XI.homeStadiumId = 'santiago_bernabeu';
MODERN_EUROPEAN_XI.venueOverrides = {
  pitchPattern: 'european_boxes',
  netStyle: 'standard',
  netTension: 'moderate',
  pitchSizePreset: 'balanced',
  turfQuality: 'pristine',
  dugoutStyle: 'recaro_racing',
  tunnelStyle: 'modern_architectural',
};

CLASSIC_SOUTH_AMERICAN_XI.homeStadiumId = 'maracana_legend';
CLASSIC_SOUTH_AMERICAN_XI.venueOverrides = {
  pitchPattern: 'plain',
  netStyle: 'brazilian',
  netTension: 'hard',
  pitchSizePreset: 'expansive',
  turfQuality: 'pristine',
  dugoutStyle: 'recaro_racing',
  tunnelStyle: 'inflatable_accordion',
};

MODERN_SOUTH_AMERICAN_XI.homeStadiumId = 'maracana_legend';
MODERN_SOUTH_AMERICAN_XI.venueOverrides = {
  pitchPattern: 'plain',
  netStyle: 'brazilian',
  netTension: 'hard',
  pitchSizePreset: 'expansive',
  turfQuality: 'pristine',
  dugoutStyle: 'recaro_racing',
  tunnelStyle: 'inflatable_accordion',
};

ASIA_OCEANIA_ALL_TIME_XI.homeStadiumId = 'floating_marina_arena';
ASIA_OCEANIA_ALL_TIME_XI.venueOverrides = {
  pitchPattern: 'checkerboard',
  netStyle: 'standard',
  pitchSizePreset: 'balanced',
  turfQuality: 'pristine',
  dugoutStyle: 'covered_sunken',
  tunnelStyle: 'direct_portal',
};

CONCACAF_LEGENDS.homeStadiumId = 'victoria_runway_ground';
CONCACAF_LEGENDS.venueOverrides = {
  pitchPattern: 'vertical',
  netStyle: 'standard',
  pitchSizePreset: 'compact',
  turfQuality: 'normal',
  dugoutStyle: 'folding_chairs',
  tunnelStyle: 'telescopic_canopy',
};

AFRICA_ALL_TIME_XI.homeStadiumId = 'estadio_monumental';
AFRICA_ALL_TIME_XI.venueOverrides = {
  pitchPattern: 'european_boxes',
  netStyle: 'standard',
  netTension: 'moderate',
  pitchSizePreset: 'expansive',
  turfQuality: 'pristine',
  dugoutStyle: 'covered_sunken',
  tunnelStyle: 'inflatable_accordion',
  fanColors: { primary: '#007a3d', secondary: '#ffcd00' },
  bannerMessages: ['AFRICA ALL-TIME XI', 'PRIDE OF THE CONTINENT'],
};

/**
 * Phase A4.1: Geographic Cultural Identity & Demographic Resolution
 */
export function resolveCulturalRegion(country: string, confederation?: Confederation): CulturalDemographicRegion {
  const c = country.toLowerCase();
  const conf = confederation?.toLowerCase();

  // 1. South American / Latin (CONMEBOL or Latin Nations)
  if (
    conf === 'conmebol' ||
    c.includes('argentina') ||
    c.includes('brazil') ||
    c.includes('colombia') ||
    c.includes('uruguay') ||
    c.includes('chile') ||
    c.includes('peru') ||
    c.includes('paraguay') ||
    c.includes('bolivia') ||
    c.includes('ecuador') ||
    c.includes('venezuela')
  ) {
    return 'south_american';
  }

  // 2. British / UK Heritage
  if (
    c.includes('england') ||
    c.includes('scotland') ||
    c.includes('wales') ||
    c.includes('northern ireland') ||
    c.includes('great britain') ||
    c.includes('united kingdom')
  ) {
    return 'british';
  }

  // 3. Nordic Nations
  if (
    c.includes('iceland') ||
    c.includes('sweden') ||
    c.includes('norway') ||
    c.includes('denmark') ||
    c.includes('finland')
  ) {
    return 'nordic';
  }

  // 4. Continental European / Balkans
  if (
    conf === 'uefa' ||
    c.includes('spain') ||
    c.includes('germany') ||
    c.includes('italy') ||
    c.includes('france') ||
    c.includes('netherlands') ||
    c.includes('portugal') ||
    c.includes('poland') ||
    c.includes('greece') ||
    c.includes('turkey') ||
    c.includes('croatia') ||
    c.includes('serbia') ||
    c.includes('austria') ||
    c.includes('belgium') ||
    c.includes('switzerland')
  ) {
    return 'continental_balkans';
  }

  // 5. East Asian & Global
  return 'east_asian_global';
}

/**
 * Phase A4.1 & A4.2: Cultural Default Match Atmosphere Matrix
 */
export function getDefaultFanCulture(team: TeamDefinition): {
  culturalRegion: CulturalDemographicRegion;
  fanAcoustics: FanAcousticStyle;
  fanHostility: FanHostilityLevel;
  fanShirtless: boolean;
  fanFlags: boolean;
  fanFlares: boolean;
  fanPaperShower: boolean;
  fanTifo: boolean;
  fanMexicanWave: boolean;
  specialTradition: SpecialClubTradition;
} {
  const culturalRegion = resolveCulturalRegion(team.country, team.confederation);
  const teamId = team.id.toLowerCase();

  // Club-specific signature special traditions
  let specialTradition: SpecialClubTradition = 'none';
  if (teamId.includes('boca')) {
    specialTradition = 'bombonera_tremor';
  } else if (teamId.includes('river') || teamId.includes('bogota') || teamId.includes('cundinamarca') || teamId.includes('argentina')) {
    specialTradition = 'murga_trompetas';
  } else if (teamId.includes('west_ham')) {
    specialTradition = 'bubbles';
  } else if (teamId.includes('dortmund') || teamId.includes('yellow')) {
    specialTradition = 'yellow_wall';
  } else if (teamId.includes('poznan') || teamId.includes('city') || teamId.includes('poland')) {
    specialTradition = 'poznan';
  } else if (culturalRegion === 'nordic' || teamId.includes('iceland')) {
    specialTradition = 'viking_clap';
  } else if (teamId.includes('brazil') || teamId.includes('corinthians') || teamId.includes('maracana')) {
    specialTradition = 'poropopo';
  }

  switch (culturalRegion) {
    case 'south_american':
      return {
        culturalRegion,
        fanAcoustics: 'murga',
        fanHostility: teamId.includes('boca') || teamId.includes('river') || teamId.includes('argentina') ? 'cauldron' : 'hostile',
        fanShirtless: true,
        fanFlags: true,
        fanFlares: true,
        fanPaperShower: true,
        fanTifo: true,
        fanMexicanWave: true,
        specialTradition,
      };

    case 'british':
      return {
        culturalRegion,
        fanAcoustics: 'choral',
        fanHostility: 'moderate',
        fanShirtless: false,
        fanFlags: true,
        fanFlares: false,
        fanPaperShower: false,
        fanTifo: false,
        fanMexicanWave: false,
        specialTradition,
      };

    case 'continental_balkans':
      return {
        culturalRegion,
        fanAcoustics: team.country.toLowerCase() === 'spain' ? 'choral' : 'whistling',
        fanHostility: 'hostile',
        fanShirtless: true,
        fanFlags: true,
        fanFlares: true,
        fanPaperShower: false,
        fanTifo: true,
        fanMexicanWave: true,
        specialTradition,
      };

    case 'nordic':
      return {
        culturalRegion,
        fanAcoustics: 'thunder_clap',
        fanHostility: 'moderate',
        fanShirtless: false,
        fanFlags: true,
        fanFlares: false,
        fanPaperShower: false,
        fanTifo: true,
        fanMexicanWave: false,
        specialTradition: specialTradition === 'none' ? 'viking_clap' : specialTradition,
      };

    case 'east_asian_global':
    default:
      return {
        culturalRegion,
        fanAcoustics: 'horns',
        fanHostility: 'friendly',
        fanShirtless: false,
        fanFlags: true,
        fanFlares: false,
        fanPaperShower: false,
        fanTifo: true,
        fanMexicanWave: true,
        specialTradition,
      };
  }
}

/**
 * Phase A1 & A4: Default Team Home Venue Configuration Generator
 */
export function getDefaultHomeVenueConfig(team: TeamDefinition): TeamHomeVenueConfig {
  const stadId = team.homeStadiumId || (team.ratingTier === 'S' || team.ratingTier === 'A' ? 'estadio_monumental' : team.ratingTier === 'B' ? 'craven_cottage' : 'ascenso_municipal');
  
  const isSouthAmerican = team.country === 'Argentina' || team.country === 'Brazil' || team.country === 'Colombia' || team.confederation === 'conmebol';
  const isBoca = team.id.includes('boca');
  const isRiver = team.id.includes('river');
  const isBogota = team.id.includes('bogota') || team.id.includes('cundinamarca');
  
  let sponsors: TeamSponsor[] = [];
  let adboardTier: AdboardTier = 'basic_paper';
  let seatColors: string[] = [team.badge?.primaryColor || '#dc2626', team.badge?.secondaryColor || '#ffffff'];
  let seatPattern: SeatPattern = 'horizontalBands';
  let customStadiumName = '';

  if (isBoca) {
    customStadiumName = 'La Caja';
    seatPattern = 'horizontalBands';
    seatColors = ['#00457c', '#fecb00'];
    adboardTier = 'classic_electronic';
    sponsors = getAssignedCommercialSponsorsForTeam(
      { id: 'arg_boca', name: team.name, countryCode: 'ARG', reputation: 85 },
      '1st'
    );
  } else if (isRiver) {
    customStadiumName = 'Estadio Monumental de Núñez';
    seatPattern = 'lowerUpper';
    seatColors = ['#dc2626', '#ffffff', '#0f172a'];
    adboardTier = 'led_ribbon';
    sponsors = getAssignedCommercialSponsorsForTeam(
      { id: 'arg_river', name: team.name, countryCode: 'ARG', reputation: 85 },
      '1st'
    );
  } else if (isBogota) {
    customStadiumName = 'Estadio Metropolitano de Techo';
    seatPattern = 'perStand';
    seatColors = ['#eab308', '#0f172a'];
    adboardTier = 'basic_paper';
    const nat = getNationalBrandsForCountry(team.country);
    sponsors = [
      { id: 'sp_1', name: nat[0].name, colors: nat[0].colors },
      { id: 'sp_2', name: nat[1].name, colors: nat[1].colors },
    ];
  } else if (team.category === 'special') {
    customStadiumName = `${team.name} Grand Coliseum`;
    seatPattern = 'solid';
    seatColors = [team.kit?.primaryColor || '#1e3a8a', team.kit?.secondaryColor || '#ffffff', '#ffd700'];
    adboardTier = 'modern_dynamic_led';
    sponsors = [
      { id: 'sp_1', name: INTERNATIONAL_COMMERCIAL_BRANDS[0].name, colors: INTERNATIONAL_COMMERCIAL_BRANDS[0].colors },
      { id: 'sp_2', name: INTERNATIONAL_COMMERCIAL_BRANDS[2].name, colors: INTERNATIONAL_COMMERCIAL_BRANDS[2].colors },
      { id: 'sp_3', name: INTERNATIONAL_COMMERCIAL_BRANDS[4].name, colors: INTERNATIONAL_COMMERCIAL_BRANDS[4].colors },
    ];
  } else {
    // National / Generic clubs (1 to 3 strictly fictional brands based on ratingTier/country)
    customStadiumName = `${team.name} Arena`;
    seatColors = [team.kit?.primaryColor || '#dc2626', team.kit?.secondaryColor || '#ffffff'];
    seatPattern = 'horizontalBands';
    adboardTier = team.ratingTier === 'S' || team.ratingTier === 'A' ? 'led_ribbon' : 'classic_electronic';
    const approxRep = team.ratingTier === 'S' || team.ratingTier === 'A' ? 84 : team.ratingTier === 'B' ? 76 : 66;
    sponsors = getAssignedCommercialSponsorsForTeam(
      { id: team.id, name: team.name, countryName: team.country, reputation: approxRep },
      team.ratingTier === 'C' ? '2nd' : '1st'
    );
  }

  const baseStad = getStadiumById(stadId);
  const v = team.venueOverrides;
  const benchType = (baseStad?.dugouts?.type as BenchType) || (team.ratingTier === 'S' || team.ratingTier === 'A' ? 'recaro_racing' : 'classic_timber');
  const benchQuality = baseStad?.dugouts?.quality || (team.ratingTier === 'S' ? 'luxury' : team.ratingTier === 'A' ? 'modern' : 'classic');
  const netTension = v?.netTension || baseStad?.netTension || 'moderate';
  const goalFrame = v?.netStyle || baseStad?.goalFrame || (isSouthAmerican ? 'brazilian' : 'standard');
  const turfQuality = v?.turfQuality || baseStad?.turfQuality || (team.ratingTier === 'S' || team.ratingTier === 'A' ? 'pristine' : team.ratingTier === 'B' ? 'normal' : 'poor');
  const mowingPattern = v?.pitchPattern || baseStad?.mowingPattern || 'horizontal';
  const pitchPreset = v?.pitchSizePreset || baseStad?.pitchPreset || 'balanced';

  // Inherit cultural fan defaults
  const fanDefaults = getDefaultFanCulture(team);

  return {
    stadiumId: stadId,
    customStadiumName,
    seatPattern,
    seatColors,
    seatStyle: 'classic_bucket',
    netColor: '#ffffff',
    netPattern: 'solid',
    netTension,
    goalFrame,
    benchType,
    benchQuality,
    pitchPreset,
    pitchLengthMeters: baseStad?.pitchLengthMeters || 105,
    pitchWidthMeters: baseStad?.pitchWidthMeters || 68,
    turfQuality,
    mowingPattern,
    grassLength: baseStad?.grassLength || 'normal',
    baseSurfaceStatus: baseStad?.surfaceStatus || 'normal',
    sponsors,
    adboardTier,
    ...fanDefaults,
  };
}

const customTeamsCache: Record<string, Partial<TeamDefinition>> = {};
let externalDrawStarTeams: TeamDefinition[] = [];
const runtimeMatchTeamsCache: Record<string, TeamDefinition> = {};

/**
 * Registers transient dynamically drafted teams (e.g. Street 7v7 city pickup squads)
 * so getTeamById resolves them cleanly in PreMatchPresentationModal and applyPreMatchConfig
 * without polluting the standard club selector list.
 */
export function registerRuntimeMatchTeams(teams: TeamDefinition[]): void {
  for (const t of teams || []) {
    if (t && t.id) {
      runtimeMatchTeamsCache[t.id] = t;
    }
  }
}

/**
 * Registers DrawStar's Club and National Team database into the Gameplay-Int team selector.
 * Native Gameplay-Int Special Teams are always retained and never duplicated.
 */
export function registerDrawStarExternalTeams(teams: TeamDefinition[]): void {
  externalDrawStarTeams = (teams || []).filter((t) => t && t.category !== 'special');
}

function getMergedTeamDatabase(): TeamDefinition[] {
  if (externalDrawStarTeams.length === 0) {
    return TEAM_DATABASE;
  }
  const specialTeams = TEAM_DATABASE.filter((t) => t.category === 'special');
  return [...specialTeams, ...externalDrawStarTeams];
}

export function loadCustomizedTeams(): Record<string, Partial<TeamDefinition>> {
  if (typeof window === 'undefined') return customTeamsCache;
  try {
    const raw = localStorage.getItem('swos_custom_teams_overrides');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.assign(customTeamsCache, parsed);
      }
    }
  } catch {}
  return customTeamsCache;
}

export function saveTeamCustomization(teamId: string, updates: Partial<TeamDefinition>): TeamDefinition {
  const overrides = loadCustomizedTeams();
  overrides[teamId] = { ...(overrides[teamId] || {}), ...updates };
  customTeamsCache[teamId] = overrides[teamId];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('swos_custom_teams_overrides', JSON.stringify(overrides));
    } catch {}
  }
  if (runtimeMatchTeamsCache[teamId]) {
    Object.assign(runtimeMatchTeamsCache[teamId], updates);
    return runtimeMatchTeamsCache[teamId];
  }
  const db = getMergedTeamDatabase();
  const baseTeam = db.find(t => t.id === teamId) || TEAM_DATABASE.find(t => t.id === teamId);
  if (baseTeam) {
    Object.assign(baseTeam, updates);
    return baseTeam;
  }
  return getTeamById(teamId);
}

export function resetTeamCustomization(teamId: string): TeamDefinition {
  const overrides = loadCustomizedTeams();
  delete overrides[teamId];
  delete customTeamsCache[teamId];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('swos_custom_teams_overrides', JSON.stringify(overrides));
    } catch {}
  }
  const db = getMergedTeamDatabase();
  const baseTeam = db.find(t => t.id === teamId) || TEAM_DATABASE.find(t => t.id === teamId);
  if (baseTeam) {
    baseTeam.homeVenueConfig = getDefaultHomeVenueConfig(baseTeam);
    return baseTeam;
  }
  return getTeamById(teamId);
}

/**
 * Helper Utilities for Team Querying & Hierarchical Navigation
 */

export function getAllTeams(): TeamDefinition[] {
  loadCustomizedTeams();
  const db = getMergedTeamDatabase();
  for (const t of db) {
    if (!t.homeVenueConfig) {
      t.homeVenueConfig = getDefaultHomeVenueConfig(t);
    }
    const saved = customTeamsCache[t.id];
    if (saved) {
      Object.assign(t, saved);
    }
  }
  return db;
}

export function getTeamById(id: string): TeamDefinition {
  loadCustomizedTeams();
  if (runtimeMatchTeamsCache[id]) {
    const rt = runtimeMatchTeamsCache[id];
    if (!rt.homeVenueConfig) {
      rt.homeVenueConfig = getDefaultHomeVenueConfig(rt);
    }
    const savedRt = customTeamsCache[rt.id];
    if (savedRt) {
      Object.assign(rt, savedRt);
    }
    return rt;
  }
  if (id === 'ginga_all_stars' || id === 'pixel_legends') {
    return getTeamById('modern_european_xi');
  }
  if (id === 'boca_juniors') {
    const mergedBoca = getMergedTeamDatabase().find(t => t.id === 'boca_juniors' || t.name.toLowerCase().includes('xeneizes') || t.name.toLowerCase().includes('boca'));
    if (mergedBoca) return mergedBoca;
    return getTeamById('boca_juniors_2026');
  }
  if (id === 'river_plate') {
    const mergedRiver = getMergedTeamDatabase().find(t => t.id === 'river_plate' || t.name.toLowerCase().includes('millonarios plate') || t.name.toLowerCase().includes('river plate'));
    if (mergedRiver) return mergedRiver;
    return getTeamById('river_plate_2026');
  }
  if (id === 'classic_european') {
    return getTeamById('classic_european_xi');
  }
  if (id === 'modern_european') {
    return getTeamById('modern_european_xi');
  }
  const db = getMergedTeamDatabase();
  const found = db.find(t => t.id === id) || TEAM_DATABASE.find(t => t.id === id);
  const target = found || db[0] || TEAM_DATABASE[0];
  if (!target.homeVenueConfig) {
    target.homeVenueConfig = getDefaultHomeVenueConfig(target);
  }
  const saved = customTeamsCache[target.id];
  if (saved) {
    Object.assign(target, saved);
  }
  return target;
}

export function getCategories(): { id: TeamCategory; label: string; icon: string; count: number }[] {
  const db = getAllTeams();
  return [
    { id: 'club', label: 'Club Teams', icon: '🛡️', count: db.filter(t => t.category === 'club').length },
    { id: 'national', label: 'National Teams', icon: '🌍', count: db.filter(t => t.category === 'national').length },
    { id: 'special', label: 'Special Teams', icon: '⚡', count: db.filter(t => t.category === 'special').length },
  ];
}

export function getConfederations(category?: TeamCategory): { id: Confederation; label: string; region: string; count: number }[] {
  const db = getAllTeams();
  const teams = category ? db.filter(t => t.category === category) : db;
  const confedCounts = new Map<Confederation, number>();
  teams.forEach(t => {
    confedCounts.set(t.confederation, (confedCounts.get(t.confederation) || 0) + 1);
  });

  const defs: Record<Confederation, { id: Confederation; label: string; region: string }> = {
    uefa: { id: 'uefa', label: 'Euro', region: 'Europe' },
    conmebol: { id: 'conmebol', label: 'Sudamericonferencia', region: 'South America' },
    concacaf: { id: 'concacaf', label: 'NAF', region: 'North, Central America & Caribbean' },
    afc: { id: 'afc', label: 'AFN', region: 'Asia' },
    caf: { id: 'caf', label: 'AF', region: 'Africa' },
    ofc: { id: 'ofc', label: 'OCE', region: 'Oceania' },
    special: { id: 'special', label: 'Special Teams', region: 'All-Time Continental Showcase' },
  };

  return Array.from(confedCounts.keys()).map(c => ({
    ...(defs[c] || { id: c, label: c.toUpperCase(), region: c }),
    count: confedCounts.get(c) || 0,
  }));
}

export function getCountries(category: TeamCategory, confederation: Confederation): string[] {
  const db = getAllTeams();
  const teams = db.filter(t => t.category === category && t.confederation === confederation);
  const countries = new Set<string>();
  teams.forEach(t => countries.add(t.country));
  return Array.from(countries);
}

export function getLeagues(category: TeamCategory, confederation: Confederation, country: string): string[] {
  const db = getAllTeams();
  const teams = db.filter(
    t => t.category === category && t.confederation === confederation && t.country === country
  );
  const leagues = new Set<string>();
  teams.forEach(t => {
    if (t.league) leagues.add(t.league);
  });
  return Array.from(leagues);
}

export function getTeamsByFilter(
  category?: TeamCategory,
  confederation?: Confederation,
  country?: string,
  league?: string
): TeamDefinition[] {
  const db = getAllTeams();
  return db.filter(t => {
    if (category && t.category !== category) return false;
    if (category === 'special') return true;
    if (confederation && t.confederation !== confederation) return false;
    if (country && t.country !== country) return false;
    if (league && t.league && t.league !== league) return false;
    return true;
  });
}

/**
 * 🎲 One-Click Instant Random Team Selector
 */
export function getRandomTeam(filter?: { category?: TeamCategory; confederation?: Confederation }): TeamDefinition {
  const db = getAllTeams();
  let pool = db;
  if (filter?.category) {
    pool = pool.filter(t => t.category === filter.category);
  }
  if (filter?.confederation) {
    pool = pool.filter(t => t.confederation === filter.confederation);
  }
  if (pool.length === 0) pool = db;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
