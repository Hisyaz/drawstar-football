import { StadiumConfig } from '../types/leagueEditor';
import { Confederation as DrawStarConfederation } from '../types/nationalTeam';
import { StadiumDefinition } from '../gameplay/types/stadium';
import { Confederation as GameplayConfederation, CulturalDemographicRegion, TeamDefinition, TeamHomeVenueConfig } from '../gameplay/types/team';
import { getStadiumById, getHomeStadiumForTeam, STADIUM_REGISTRY } from '../gameplay/game/stadiumRegistry';
import {
  getCuratedNationAssignment,
  CuratedNationVenueAssignment,
  getCuratedClubAssignment,
  CuratedClubVenueAssignment,
} from '../gameplay/game/curatedStadiumCatalog';
import { getAssignedCommercialSponsorsForTeam } from '../data/fictionalSponsors';
import { MODERN_EUROPEAN_XI } from '../gameplay/game/teams/specialTeams';
import { MODERN_SOUTH_AMERICAN_XI } from '../gameplay/game/teams/southAmericanLegends';
import {
  AFRICA_ALL_TIME_XI,
  ASIA_OCEANIA_ALL_TIME_XI,
  CONCACAF_LEGENDS,
} from '../gameplay/game/teams/otherLegends';
import { getDefaultHomeVenueConfig } from '../gameplay/game/teamDatabase';

export type CanonicalConfederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC';

export const SPECIAL_TEAM_IDS = [
  'modern_european_xi',
  'classic_european_xi',
  'modern_south_american_xi',
  'classic_south_american_xi',
  'africa_all_time_xi',
  'asia_oceania_all_time_xi',
  'concacaf_legends',
] as const;

export const CONFEDERATION_SPECIAL_TEAM_MAP: Record<CanonicalConfederation, TeamDefinition> = {
  UEFA: MODERN_EUROPEAN_XI,
  CONMEBOL: MODERN_SOUTH_AMERICAN_XI,
  CAF: AFRICA_ALL_TIME_XI,
  AFC: ASIA_OCEANIA_ALL_TIME_XI,
  OFC: ASIA_OCEANIA_ALL_TIME_XI,
  CONCACAF: CONCACAF_LEGENDS,
};

const UEFA_COUNTRIES = new Set([
  'ES', 'ESP', 'EN', 'ENG', 'UK', 'GB', 'DE', 'GER', 'FR', 'FRA', 'IT', 'ITA', 'PT', 'POR', 'NL', 'NED',
  'BE', 'BEL', 'CH', 'SUI', 'AT', 'AUT', 'SE', 'SWE', 'NO', 'NOR', 'DK', 'DEN', 'FI', 'FIN', 'IS', 'ISL',
  'IE', 'IRL', 'SC', 'SCO', 'WA', 'WAL', 'NIR', 'PL', 'POL', 'CZ', 'CZE', 'SK', 'SVK', 'HU', 'HUN',
  'RO', 'ROU', 'BG', 'BUL', 'GR', 'GRE', 'TR', 'TUR', 'HR', 'CRO', 'RS', 'SRB', 'SI', 'SVN', 'BA', 'BIH',
  'UA', 'UKR', 'RU', 'RUS', 'BY', 'BLR', 'EE', 'EST', 'LV', 'LVA', 'LT', 'LTU', 'GE', 'GEO', 'AM', 'ARM',
  'AZ', 'AZE', 'IL', 'ISR', 'CY', 'CYP', 'LU', 'LUX', 'MT', 'MLT', 'AL', 'ALB', 'MK', 'MKD', 'ME', 'MNE',
  'XK', 'KVX', 'MD', 'MDA', 'KZ', 'KAZ',
]);

const CONMEBOL_COUNTRIES = new Set([
  'AR', 'ARG', 'BR', 'BRA', 'CO', 'COL', 'UY', 'URU', 'CL', 'CHI', 'PE', 'PER', 'EC', 'ECU', 'PY', 'PAR',
  'BO', 'BOL', 'VE', 'VEN',
]);

const CONCACAF_COUNTRIES = new Set([
  'US', 'USA', 'MX', 'MEX', 'CA', 'CAN', 'CR', 'CRC', 'JM', 'JAM', 'PA', 'PAN', 'HN', 'HON', 'SV', 'SLV',
  'GT', 'GUA', 'NI', 'NIC', 'TT', 'TRI', 'CU', 'CUB', 'HT', 'HAI', 'DO', 'DOM', 'CW', 'CUW', 'SR', 'SUR',
  'GL', 'GY', 'GUY',
]);

const CAF_COUNTRIES = new Set([
  'MA', 'MAR', 'SN', 'SEN', 'EG', 'EGY', 'NG', 'NGA', 'CI', 'CIV', 'CM', 'CMR', 'GH', 'GHA', 'DZ', 'ALG',
  'TN', 'TUN', 'ML', 'MLI', 'BF', 'BFA', 'ZA', 'RSA', 'CD', 'COD', 'GN', 'GUI', 'ZM', 'ZAM', 'AO', 'ANG',
  'CV', 'CPV', 'GA', 'GAB', 'AF',
]);

const OFC_COUNTRIES = new Set(['NZ', 'NZL', 'FJ', 'FIJ', 'PG', 'PNG', 'NC', 'NCL', 'PF', 'TAH', 'SB', 'SOL', 'VU', 'VAN']);

export function resolveCountryConfederation(
  countryCodeOrName?: string,
  explicitConfed?: DrawStarConfederation | GameplayConfederation | string
): CanonicalConfederation {
  if (explicitConfed) {
    const up = explicitConfed.toUpperCase().trim();
    if (up === 'UEFA' || up === 'EUROPE') return 'UEFA';
    if (up === 'CONMEBOL' || up === 'SOUTH AMERICA' || up === 'SOUTH_AMERICA') return 'CONMEBOL';
    if (up === 'CONCACAF' || up === 'NORTH AMERICA') return 'CONCACAF';
    if (up === 'CAF' || up === 'AFRICA') return 'CAF';
    if (up === 'AFC' || up === 'ASIA') return 'AFC';
    if (up === 'OFC' || up === 'OCEANIA') return 'OFC';
  }

  const raw = (countryCodeOrName || '').toUpperCase().trim();
  if (!raw) return 'UEFA';
  if (UEFA_COUNTRIES.has(raw)) return 'UEFA';
  if (CONMEBOL_COUNTRIES.has(raw)) return 'CONMEBOL';
  if (CONCACAF_COUNTRIES.has(raw)) return 'CONCACAF';
  if (CAF_COUNTRIES.has(raw)) return 'CAF';
  if (OFC_COUNTRIES.has(raw)) return 'OFC';

  const low = raw.toLowerCase();
  if (
    low.includes('spain') || low.includes('england') || low.includes('france') || low.includes('germany') ||
    low.includes('italy') || low.includes('portugal') || low.includes('netherlands') || low.includes('belgium') ||
    low.includes('croatia') || low.includes('scotland') || low.includes('turkey') || low.includes('sweden') ||
    low.includes('norway') || low.includes('denmark') || low.includes('poland') || low.includes('austria') ||
    low.includes('switzerland') || low.includes('serbia') || low.includes('greece') || low.includes('ukraine') ||
    low.includes('hungary') || low.includes('europe')
  ) {
    return 'UEFA';
  }
  if (
    low.includes('argentina') || low.includes('brazil') || low.includes('colombia') || low.includes('uruguay') ||
    low.includes('chile') || low.includes('peru') || low.includes('ecuador') || low.includes('paraguay') ||
    low.includes('venezuela') || low.includes('bolivia')
  ) {
    return 'CONMEBOL';
  }
  if (
    low.includes('united states') || low.includes('usa') || low.includes('mexico') || low.includes('canada') ||
    low.includes('costa rica') || low.includes('jamaica') || low.includes('panama') || low.includes('honduras')
  ) {
    return 'CONCACAF';
  }
  if (
    low.includes('morocco') || low.includes('senegal') || low.includes('egypt') || low.includes('nigeria') ||
    low.includes('ivory') || low.includes('cameroon') || low.includes('ghana') || low.includes('algeria') ||
    low.includes('tunisia') || low.includes('south africa') || low.includes('africa')
  ) {
    return 'CAF';
  }
  if (low.includes('new zealand') || low.includes('fiji') || low.includes('oceania')) {
    return 'OFC';
  }
  return 'AFC';
}

export function toGameplayConfederation(confed: CanonicalConfederation): GameplayConfederation {
  switch (confed) {
    case 'UEFA': return 'uefa';
    case 'CONMEBOL': return 'conmebol';
    case 'CONCACAF': return 'concacaf';
    case 'CAF': return 'caf';
    case 'OFC': return 'ofc';
    case 'AFC':
    default:
      return 'afc';
  }
}

export interface ResolvedTeamStadium {
  stadium: StadiumDefinition;
  homeStadiumId: string;
  homeVenueConfig: TeamHomeVenueConfig;
  mirroredSpecialTeam: TeamDefinition;
  isCustomOverride: boolean;
}

const NATION_NAME_TO_CODE: Record<string, string> = {
  brazil: 'BRA',
  argentina: 'ARG',
  spain: 'ESP',
  colombia: 'COL',
  france: 'FRA',
  england: 'ENG',
  italy: 'ITA',
  netherlands: 'NED',
  germany: 'GER',
  portugal: 'POR',
  hungary: 'HUN',
  uruguay: 'URU',
  paraguay: 'PAR',
  chile: 'CHI',
  peru: 'PER',
  'saudi arabia': 'KSA',
  japan: 'JPN',
  'south korea': 'KOR',
  'korea republic': 'KOR',
  australia: 'AUS',
  morocco: 'MAR',
  algeria: 'ALG',
  senegal: 'SEN',
  egypt: 'EGY',
  mexico: 'MEX',
  usa: 'USA',
  'united states': 'USA',
  'new zealand': 'NZL',
};

function findCuratedNationFromMeta(fallbackTeamMeta?: Partial<TeamDefinition>): CuratedNationVenueAssignment | undefined {
  if (!fallbackTeamMeta) return undefined;
  const rawCode = fallbackTeamMeta.countryCode?.trim();
  if (rawCode) {
    const byCode = getCuratedNationAssignment(rawCode);
    if (byCode) return byCode;
  }
  const idMatch = fallbackTeamMeta.id?.match(/^nat-team-([a-z]{3})/i);
  if (idMatch?.[1]) {
    const byId = getCuratedNationAssignment(idMatch[1]);
    if (byId) return byId;
  }
  const countryLow = (fallbackTeamMeta.country || fallbackTeamMeta.name || '').trim().toLowerCase();
  const mappedCode = NATION_NAME_TO_CODE[countryLow];
  if (mappedCode) {
    return getCuratedNationAssignment(mappedCode);
  }
  return undefined;
}

function buildCuratedNationVenueConfig(
  natMeta: Partial<TeamDefinition> | undefined,
  curated: CuratedNationVenueAssignment,
  stadium: StadiumDefinition
): TeamHomeVenueConfig {
  const sponsors = getAssignedCommercialSponsorsForTeam(
    {
      id: natMeta?.id || `nat-team-${curated.code.toLowerCase()}`,
      name: natMeta?.name || curated.code,
      countryCode: curated.code as any,
      overallRating: 82,
    },
    '1st'
  );

  return {
    stadiumId: stadium.id,
    customStadiumName: curated.stadiumName,
    seatPattern: curated.seatPattern,
    seatColors: [...curated.seatColors],
    seatStyle: curated.tier >= 5 ? 'vip_leather' : 'tip_up_padded',
    netColor: '#ffffff',
    netPattern: 'solid',
    netTension: curated.culturalRegion === 'south_american' ? 'hard' : 'moderate',
    goalFrame: curated.culturalRegion === 'south_american' ? 'brazilian' : 'standard',
    benchType: stadium.dugouts?.type || 'recaro_racing',
    benchQuality: stadium.dugouts?.quality || 'elite_vip',
    pitchPreset: stadium.pitchPreset || 'balanced',
    pitchLengthMeters: stadium.pitchLengthMeters || 105,
    pitchWidthMeters: stadium.pitchWidthMeters || 68,
    turfQuality: 'pristine',
    mowingPattern: curated.mowingPattern,
    grassLength: 'short',
    baseSurfaceStatus: 'normal',
    sponsors,
    adboardTier: 'modern_dynamic_led',
    culturalRegion: curated.culturalRegion,
    fanAcoustics: curated.fanAcoustics,
    fanHostility: curated.fanHostility,
    fanShirtless: curated.culturalRegion === 'south_american',
    fanFlags: true,
    fanFlares: curated.fanFlares,
    fanPaperShower: curated.fanPaperShower,
    fanTifo: curated.fanTifo,
    fanMexicanWave: true,
    specialTradition: curated.specialTradition,
  };
}

function buildCuratedClubVenueConfig(
  teamMeta: Partial<TeamDefinition> | undefined,
  curated: CuratedClubVenueAssignment,
  stadium: StadiumDefinition
): TeamHomeVenueConfig {
  const countryCode = (teamMeta?.countryCode || stadium.country || 'ARG').toUpperCase();
  const tierStr = teamMeta?.league?.toLowerCase().includes('second') ? '2nd' : '1st';
  const sponsors = getAssignedCommercialSponsorsForTeam(
    {
      id: teamMeta?.id || 'curated_club',
      name: teamMeta?.name || curated.stadiumName,
      countryCode: countryCode as any,
      overallRating: 80,
    },
    tierStr
  );
  const regional: CulturalDemographicRegion =
    stadium.country === 'Argentina' ||
    stadium.country === 'Brazil' ||
    stadium.country === 'Uruguay' ||
    stadium.country === 'Colombia'
      ? 'south_american'
      : stadium.country === 'England' || stadium.country === 'Scotland'
      ? 'british'
      : 'continental_balkans';

  return {
    stadiumId: stadium.id,
    customStadiumName: curated.stadiumName,
    seatPattern: curated.seatPattern,
    seatColors: [...curated.seatColors],
    seatStyle: curated.tier >= 5 ? 'vip_leather' : curated.tier >= 3 ? 'classic_bucket' : 'tip_up_padded',
    netColor: '#ffffff',
    netPattern: 'solid',
    netTension: curated.netTension || stadium.netTension || 'moderate',
    goalFrame: curated.goalFrame || stadium.goalFrame || 'standard',
    benchType: stadium.dugouts?.type || 'recaro_racing',
    benchQuality: stadium.dugouts?.quality || 'modern',
    pitchPreset: stadium.pitchPreset || 'balanced',
    pitchLengthMeters: stadium.pitchLengthMeters || 105,
    pitchWidthMeters: stadium.pitchWidthMeters || 68,
    turfQuality: stadium.turfQuality || 'pristine',
    mowingPattern: curated.mowingPattern,
    grassLength: stadium.grassLength || 'short',
    baseSurfaceStatus: 'normal',
    sponsors,
    adboardTier: curated.tier >= 4 ? 'modern_dynamic_led' : 'classic_electronic',
    culturalRegion: regional,
    fanAcoustics: curated.fanAcoustics || (regional === 'south_american' ? 'murga' : 'choral'),
    fanHostility: curated.fanHostility || (regional === 'south_american' ? 'cauldron' : 'moderate'),
    fanShirtless: regional === 'south_american',
    fanFlags: true,
    fanFlares: curated.fanFlares ?? regional === 'south_american',
    fanPaperShower: curated.fanPaperShower ?? regional === 'south_american',
    fanTifo: curated.fanTifo ?? true,
    fanMexicanWave: true,
    specialTradition: curated.specialTradition || 'none',
  };
}

/**
 * Resolves the authoritative 32-bit stadium & Home Venue Configuration for BOTH Clubs and National Teams.
 * Priority:
 * 1. Explicit custom override (`customStadium.isCustomOverride === true`, guarding against `world_arena`).
 * 2. Curated National Team assignment when resolving a National Team.
 * 3. Assigned club stadium (`customStadium.gameplayStadiumId`) or Curated Club assignment.
 * 4. Fallback to Confederation Special Team stadium + venue.
 */
export function resolveDefaultStadiumForTeam(
  confed: CanonicalConfederation,
  customStadium?: StadiumConfig,
  fallbackTeamMeta?: Partial<TeamDefinition>
): ResolvedTeamStadium {
  const mirroredSpecialTeam = CONFEDERATION_SPECIAL_TEAM_MAP[confed] || MODERN_EUROPEAN_XI;
  const mirroredStadium =
    getHomeStadiumForTeam(mirroredSpecialTeam) ||
    getStadiumById(mirroredSpecialTeam.homeStadiumId || 'estadio_monumental');
  const mirroredVenue =
    mirroredSpecialTeam.homeVenueConfig || getDefaultHomeVenueConfig(mirroredSpecialTeam);

  const curatedNation =
    fallbackTeamMeta?.category === 'national' || fallbackTeamMeta?.id?.startsWith('nat-team-')
      ? findCuratedNationFromMeta(fallbackTeamMeta)
      : undefined;

  if (curatedNation && !customStadium?.isCustomOverride && STADIUM_REGISTRY[curatedNation.gameplayStadiumId]) {
    const std = getStadiumById(curatedNation.gameplayStadiumId);
    const venueCfg = buildCuratedNationVenueConfig(fallbackTeamMeta, curatedNation, std);
    return {
      stadium: std,
      homeStadiumId: std.id,
      homeVenueConfig: venueCfg,
      mirroredSpecialTeam,
      isCustomOverride: false,
    };
  }

  const curatedClub =
    fallbackTeamMeta?.category !== 'national'
      ? getCuratedClubAssignment(fallbackTeamMeta?.id)
      : undefined;

  if (
    curatedClub &&
    !customStadium?.isCustomOverride &&
    (!customStadium?.gameplayStadiumId || customStadium.gameplayStadiumId === 'world_arena') &&
    STADIUM_REGISTRY[curatedClub.gameplayStadiumId]
  ) {
    const std = getStadiumById(curatedClub.gameplayStadiumId);
    const venueCfg = buildCuratedClubVenueConfig(fallbackTeamMeta, curatedClub, std);
    return {
      stadium: std,
      homeStadiumId: std.id,
      homeVenueConfig: venueCfg,
      mirroredSpecialTeam,
      isCustomOverride: false,
    };
  }

  const safeGameplayId =
    customStadium?.gameplayStadiumId && customStadium.gameplayStadiumId !== 'world_arena'
      ? customStadium.gameplayStadiumId
      : undefined;

  const hasAssignedOrCustom = Boolean(
    customStadium &&
      (customStadium.isCustomOverride ||
        (customStadium.gameplayStadium && customStadium.gameplayStadium.id !== 'world_arena') ||
        safeGameplayId ||
        customStadium.homeVenueConfig)
  );

  if (hasAssignedOrCustom && customStadium) {
    const chosenStadium =
      customStadium.gameplayStadium && customStadium.gameplayStadium.id !== 'world_arena'
        ? customStadium.gameplayStadium
        : getStadiumById(safeGameplayId || mirroredStadium.id);

    const chosenId = safeGameplayId || chosenStadium.id;
    const baseTeamStub = {
      id: fallbackTeamMeta?.id || 'custom_team',
      name: fallbackTeamMeta?.name || customStadium.name || 'Home Club',
      country: fallbackTeamMeta?.country || chosenStadium.country || 'International',
      confederation: toGameplayConfederation(confed),
      category: fallbackTeamMeta?.category || 'club',
      ratingTier: fallbackTeamMeta?.ratingTier || 'B',
      homeStadiumId: chosenId,
      badge: fallbackTeamMeta?.badge || {
        icon: '🛡️',
        bg: '#0f172a',
        text: 'CLB',
        primaryColor: '#38bdf8',
        secondaryColor: '#ffffff',
      },
      kit: fallbackTeamMeta?.kit || {
        name: 'Home',
        shortName: 'HOM',
        primaryColor: '#0284c7',
        secondaryColor: '#ffffff',
        shortsColor: '#0f172a',
        socksColor: '#0284c7',
        gkColor: '#eab308',
      },
    } as TeamDefinition;

    const chosenVenue: TeamHomeVenueConfig = customStadium.homeVenueConfig
      ? {
          ...customStadium.homeVenueConfig,
          stadiumId: customStadium.homeVenueConfig.stadiumId === 'world_arena' ? chosenId : chosenId,
        }
      : {
          ...getDefaultHomeVenueConfig(baseTeamStub),
          stadiumId: chosenId,
          customStadiumName: customStadium.name || chosenStadium.name,
        };

    return {
      stadium: chosenStadium,
      homeStadiumId: chosenId,
      homeVenueConfig: chosenVenue,
      mirroredSpecialTeam,
      isCustomOverride: Boolean(customStadium.isCustomOverride),
    };
  }

  return {
    stadium: mirroredStadium,
    homeStadiumId: mirroredStadium.id,
    homeVenueConfig: {
      ...mirroredVenue,
      stadiumId: mirroredStadium.id,
      customStadiumName:
        customStadium?.name && customStadium.name !== mirroredStadium.name
          ? customStadium.name
          : mirroredStadium.name,
    },
    mirroredSpecialTeam,
    isCustomOverride: false,
  };
}
