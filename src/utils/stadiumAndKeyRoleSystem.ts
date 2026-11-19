import { EditorTeamData, TeamKeyRoles, StadiumConfig, StadiumTier } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import { REAL_CLUB_STADIUM_REGISTRY } from '../data/realClubPresets';
import { getAssignedCountryStadiumIdForTeam } from '../gameplay/game/countryLeagueStadiums';
import {
  getCuratedClubAssignment,
  CuratedClubVenueAssignment,
} from '../gameplay/game/curatedStadiumCatalog';
import { getStadiumById, resolveYouthStadiumForClub, STADIUM_REGISTRY } from '../gameplay/game/stadiumRegistry';
import { resolveCulturalRegion } from '../gameplay/game/teamDatabase';
import {
  getAssignedCommercialSponsorsForTeam,
  containsLegacyRealLifeBrands,
  inferDivisionTierFromTeam,
} from '../data/fictionalSponsors';
import type { TeamHomeVenueConfig, FanAcousticStyle, FanHostilityLevel, SpecialClubTradition } from '../gameplay/types/team';

/**
 * POSITION LOCK VALIDATORS FOR KEY PLAYER SYSTEM
 */
export function isGoalkeeperPosition(pos: string | undefined): boolean {
  if (!pos) return false;
  const p = pos.trim().toUpperCase();
  return p === 'GK' || p === 'GOALKEEPER' || p === 'POR';
}

export function isDefenderPosition(pos: string | undefined): boolean {
  if (!pos) return false;
  const p = pos.trim().toUpperCase();
  if (isGoalkeeperPosition(p)) return false;
  return (
    p === 'CB' ||
    p === 'LB' ||
    p === 'RB' ||
    p === 'LWB' ||
    p === 'RWB' ||
    p === 'DEF' ||
    p === 'DF' ||
    p === 'SW' ||
    p.startsWith('D') ||
    p.includes('CB') ||
    p.includes('LB') ||
    p.includes('RB')
  );
}

export function isCreatorPosition(pos: string | undefined): boolean {
  if (!pos) return false;
  const p = pos.trim().toUpperCase();
  if (isGoalkeeperPosition(p) || isDefenderPosition(p)) return false;
  return (
    p === 'CM' ||
    p === 'CAM' ||
    p === 'CDM' ||
    p === 'LM' ||
    p === 'RM' ||
    p === 'MID' ||
    p === 'MF' ||
    p === 'AM' ||
    p === 'DM' ||
    p.startsWith('M') ||
    p.includes('CAM') ||
    p.includes('CM') ||
    p.includes('CDM')
  );
}

export function isGoalscorerPosition(pos: string | undefined): boolean {
  if (!pos) return false;
  const p = pos.trim().toUpperCase();
  if (isGoalkeeperPosition(p)) return false;
  return (
    p === 'ST' ||
    p === 'CF' ||
    p === 'LW' ||
    p === 'RW' ||
    p === 'ATT' ||
    p === 'FW' ||
    p === 'FWD' ||
    p.startsWith('A') ||
    p.startsWith('S') ||
    p.startsWith('F') ||
    p.includes('ST') ||
    p.includes('CF') ||
    p.includes('LW') ||
    p.includes('RW')
  );
}

export interface ValidKeyRolePlayer {
  id: string;
  name: string;
  position: string;
  ovr: number;
  slotNumber: number;
}

/**
 * Gets all valid candidate players from the FIRST TEAM SQUAD for a specific key role.
 */
export function getValidPlayersForKeyRole(
  team: EditorTeamData,
  roleKey: 'goalkeeperPlayerId' | 'defenderPlayerId' | 'creatorPlayerId' | 'goalscorerPlayerId' | 'captainPlayerId'
): ValidKeyRolePlayer[] {
  if (!team || !team.squadSaveFile || !team.squadSaveFile.squad) return [];

  const firstTeamSlots = team.squadSaveFile.squad.filter((s) => s.player !== null && s.player !== undefined);

  const players: ValidKeyRolePlayer[] = firstTeamSlots.map((s) => ({
    id: s.player!.id,
    name: s.player!.name,
    position: s.player!.position || 'ATT',
    ovr: s.player!.ovr || 50,
    slotNumber: s.slotNumber,
  }));

  switch (roleKey) {
    case 'goalkeeperPlayerId':
      return players.filter((p) => isGoalkeeperPosition(p.position));
    case 'defenderPlayerId':
      return players.filter((p) => isDefenderPosition(p.position));
    case 'creatorPlayerId':
      return players.filter((p) => isCreatorPosition(p.position));
    case 'goalscorerPlayerId':
      return players.filter((p) => isGoalscorerPosition(p.position));
    case 'captainPlayerId':
    default:
      return players; // Captain can be any player in first team
  }
}

/**
 * Automatically assigns the HIGHEST RATED (OVR-wise) option in each key role
 * from the first team squad matching the exact position requirements.
 */
export function autoAssignTeamKeyRoles(team: EditorTeamData): EditorTeamData {
  if (!team) return team;

  const validGks = getValidPlayersForKeyRole(team, 'goalkeeperPlayerId').sort((a, b) => b.ovr - a.ovr);
  const validDefs = getValidPlayersForKeyRole(team, 'defenderPlayerId').sort((a, b) => b.ovr - a.ovr);
  const validCreators = getValidPlayersForKeyRole(team, 'creatorPlayerId').sort((a, b) => b.ovr - a.ovr);
  const validGoalscorers = getValidPlayersForKeyRole(team, 'goalscorerPlayerId').sort((a, b) => b.ovr - a.ovr);
  const validCaptains = getValidPlayersForKeyRole(team, 'captainPlayerId').sort((a, b) => b.ovr - a.ovr);

  const bestGkId = validGks[0]?.id || team.goalkeeperPlayerId;
  const bestDefId = validDefs[0]?.id || team.defenderPlayerId;
  const bestCreatorId = validCreators[0]?.id || team.creatorPlayerId;
  const bestGoalscorerId = validGoalscorers[0]?.id || team.goalscorerPlayerId;
  const bestCaptainId = team.captainPlayerId || validCaptains[0]?.id;

  const updatedKeyRoles: TeamKeyRoles = {
    captainPlayerId: bestCaptainId,
    goalkeeperPlayerId: bestGkId,
    defenderPlayerId: bestDefId,
    creatorPlayerId: bestCreatorId,
    goalscorerPlayerId: bestGoalscorerId,
  };

  return {
    ...team,
    captainPlayerId: bestCaptainId,
    goalkeeperPlayerId: bestGkId,
    defenderPlayerId: bestDefId,
    creatorPlayerId: bestCreatorId,
    goalscorerPlayerId: bestGoalscorerId,
    keyRoles: updatedKeyRoles,
  };
}

/**
 * STADIUM TIER DEFINITIONS & METADATA
 */
export interface StadiumTierInfo {
  tier: StadiumTier;
  title: string;
  subtitle: string;
  description: string;
  defaultCapacity: number;
  capacityRange: [number, number];
  badgeColor: string;
  badgeBg: string;
  examples: string;
  features: string[];
}

export const STADIUM_TIERS: Record<StadiumTier, StadiumTierInfo> = {
  1: {
    tier: 1,
    title: 'Tier 1 — Potrero & Local Wood Pitch',
    subtitle: 'Grass Pitch with Wooden Stands & Basic Benches',
    description:
      'Literal potrero pitch with simple wood stands, open perimeter fencing, and minimal infrastructure. Represents early grassroots grounds.',
    defaultCapacity: 2500,
    capacityRange: [500, 8000],
    badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    badgeBg: 'from-amber-950/30 to-amber-900/10 border-amber-500/30',
    examples: 'Barrio Potreros, Local Municipal Field, Grassroots Grounds',
    features: ['Wooden Benches & Earthen Banks', 'Manual Scoreboard', 'Open Air Sidelines', 'Grass / Dirt Surface'],
  },
  2: {
    tier: 2,
    title: 'Tier 2 — Regional Municipal Grounds',
    subtitle: 'Concrete Bleachers & Basic Lighting',
    description:
      'Regional venue with concrete terraces, floodlight towers, press box, and basic ticket gates for domestic league action.',
    defaultCapacity: 12500,
    capacityRange: [5000, 25000],
    badgeColor: 'text-sky-400 border-sky-500/40 bg-sky-950/40',
    badgeBg: 'from-sky-950/30 to-sky-900/10 border-sky-500/30',
    examples: 'Estadio Alfredo Terrera, Estadio Ciudad de Vicente López',
    features: ['Concrete Terraces', 'Floodlight Pylons', 'Local Dressing Rooms', 'Electronic Scoreboard'],
  },
  3: {
    tier: 3,
    title: 'Tier 3 — Classic Iconic Stadium',
    subtitle: 'Historical Steep Stands & Intimidating Wall of Sound',
    description:
      'Famous classic arena featuring steep, multi-tiered brick-and-metal stands, intense acoustic echo, and legendary matchday atmosphere.',
    defaultCapacity: 48000,
    capacityRange: [20000, 60000],
    badgeColor: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/40',
    badgeBg: 'from-indigo-950/30 to-indigo-900/10 border-indigo-500/30',
    examples: 'La Caja, Estadio Monumental de Núñez, Yorkshire Road, Turia Classic Stadium',
    features: ['Steep Multi-Tier Stands', 'Atmospheric Acoustic Roof', 'Fan Zone & Trophy Hall', 'Press Conference Suites'],
  },
  4: {
    tier: 4,
    title: 'Tier 4 — Modern Continental Arena',
    subtitle: 'Fully Covered All-Seater & Digital Infrastructure',
    description:
      'High-specification modern stadium with full roof canopy, LED perimeter boards, modern concourses, and Euro/Sudamericonferencia grade facilities.',
    defaultCapacity: 62000,
    capacityRange: [40000, 78000],
    badgeColor: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
    badgeBg: 'from-purple-950/30 to-purple-900/10 border-purple-500/30',
    examples: 'Madrid Aviación Metropolitano, Rhône Grand Arena, Highbury Grove Park',
    features: ['All-Seater Covered Canopy', 'LED Ribbon Boards & Jumbotrons', 'VIP Executive Suites', 'Integrated Metro Access'],
  },
  5: {
    tier: 5,
    title: 'Tier 5 — State-of-the-Art Ultra-Modern Arena',
    subtitle: 'Futuristic Architectural Marvel with Retractable Pitch & Roof',
    description:
      'The pinnacle of sports engineering: retractable roof and pitch systems, 360° halo screens, luxury climate control, and futuristic exterior lighting.',
    defaultCapacity: 82000,
    capacityRange: [60000, 105000],
    badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    badgeBg: 'from-emerald-950/30 to-emerald-900/10 border-emerald-500/30',
    examples: 'Coliseo de Chamartín, North London Superdome, Bavaria Rot Arena',
    features: [
      'Retractable Pitch & Roof System',
      '360° Continuous LED Halo Screen',
      'Hyper-Modern Luxury Hospitality',
      'Acoustic sound amplifier canopy',
    ],
  },
};

function buildClubHomeVenueConfig(
  team: EditorTeamData,
  gameplayStadiumId: string,
  stadiumName: string,
  tier: StadiumTier,
  divisionTier?: string,
  curated?: CuratedClubVenueAssignment
): TeamHomeVenueConfig {
  const baseStad = getStadiumById(gameplayStadiumId);
  const primary = team.kit?.color1 || team.emblem?.color1 || '#1d4ed8';
  const secondary = team.kit?.color2 || team.emblem?.color2 || '#ffffff';
  const tertiary = team.emblem?.color3 || '#0f172a';
  const cc = (team.countryCode || '').toUpperCase();
  const culturalRegion = resolveCulturalRegion(team.countryName || cc);
  const rep = team.reputation ?? team.overallRating ?? 70;
  const divTier = inferDivisionTierFromTeam(team, divisionTier);

  const fanAcoustics: FanAcousticStyle =
    curated?.fanAcoustics ||
    (culturalRegion === 'south_american'
      ? 'murga'
      : culturalRegion === 'british'
      ? 'choral'
      : culturalRegion === 'nordic'
      ? 'thunder_clap'
      : cc === 'KSA'
      ? 'horns'
      : cc === 'ESP'
      ? 'choral'
      : 'whistling');

  const fanHostility: FanHostilityLevel =
    curated?.fanHostility ||
    (culturalRegion === 'south_american'
      ? rep >= 80
        ? 'cauldron'
        : 'hostile'
      : tier >= 4
      ? 'hostile'
      : 'moderate');

  let specialTradition: SpecialClubTradition = curated?.specialTradition || 'none';
  if (!curated?.specialTradition) {
    const tid = (team.id || '').toLowerCase();
    if (tid.includes('boca')) specialTradition = 'bombonera_tremor';
    else if (tid.includes('river') || cc === 'ARG') specialTradition = 'murga_trompetas';
    else if (tid.includes('dortmund')) specialTradition = 'yellow_wall';
    else if (tid.includes('westham')) specialTradition = 'bubbles';
    else if (tid.includes('mancity')) specialTradition = 'poznan';
    else if (cc === 'BRA') specialTradition = 'poropopo';
  }

  const seatPattern =
    curated?.seatPattern ||
    (tier >= 5 ? 'horizontalBands' : tier === 4 ? 'lowerUpper' : tier === 3 ? 'verticalStripes' : 'solid');

  const seatColors =
    curated?.seatColors && curated.seatColors.length > 0
      ? [...curated.seatColors]
      : [primary, secondary, tertiary];

  const adboardTier =
    tier >= 5
      ? 'modern_dynamic_led'
      : tier === 4
      ? 'led_ribbon'
      : tier === 3
      ? 'classic_electronic'
      : 'basic_paper';

  const sponsors = getAssignedCommercialSponsorsForTeam(team, divTier);

  return {
    stadiumId: gameplayStadiumId,
    customStadiumName: stadiumName,
    seatPattern,
    seatColors,
    seatStyle:
      tier >= 5
        ? 'vip_leather'
        : tier === 4
        ? 'tip_up_padded'
        : tier >= 3
        ? 'classic_bucket'
        : 'plastic_bench',
    netColor: '#ffffff',
    netPattern: 'solid',
    netTension: curated?.netTension || (culturalRegion === 'south_american' ? 'hard' : 'moderate'),
    goalFrame: curated?.goalFrame || (culturalRegion === 'south_american' ? 'brazilian' : 'standard'),
    benchType: baseStad?.dugouts?.type || (tier >= 4 ? 'recaro_racing' : tier === 3 ? 'covered_sunken' : 'classic_timber'),
    benchQuality: baseStad?.dugouts?.quality || (tier >= 5 ? 'luxury' : tier === 4 ? 'modern' : tier >= 3 ? 'classic' : 'municipal'),
    pitchPreset: baseStad?.pitchPreset || 'balanced',
    pitchLengthMeters: baseStad?.pitchLengthMeters || 105,
    pitchWidthMeters: baseStad?.pitchWidthMeters || 68,
    turfQuality: divTier === '1st' && rep >= 76 ? 'pristine' : tier >= 2 ? 'normal' : 'poor',
    mowingPattern: curated?.mowingPattern || baseStad?.mowingPattern || 'european_boxes',
    grassLength: tier >= 4 ? 'short' : 'normal',
    baseSurfaceStatus: 'normal',
    sponsors,
    adboardTier,
    culturalRegion,
    fanAcoustics,
    fanHostility,
    fanShirtless: culturalRegion === 'south_american' || cc === 'ITA',
    fanFlags: true,
    fanFlares: curated?.fanFlares ?? (culturalRegion === 'south_american' || cc === 'ITA' || cc === 'GER' || cc === 'FR'),
    fanPaperShower: curated?.fanPaperShower ?? (culturalRegion === 'south_american'),
    fanTifo: curated?.fanTifo ?? (tier >= 3),
    fanMexicanWave: divTier === '1st',
    specialTradition,
  };
}

/**
 * Ensures team has a valid stadium configuration initialized, assigning either its
 * curated deduplicated stadium or one of the country league stadiums and adjusting its
 * home venue settings & 1–3 fictional commercial sponsors.
 */
export function ensureTeamStadium(team: EditorTeamData, explicitDivisionTier?: string): StadiumConfig {
  const tid = (team?.id || '').toLowerCase();
  const rep = team?.reputation ?? team?.overallRating ?? 70;
  const curatedMatch = getCuratedClubAssignment(tid);
  const regMatch =
    REAL_CLUB_STADIUM_REGISTRY[tid] ||
    Object.entries(REAL_CLUB_STADIUM_REGISTRY).find(([k]) => tid.includes(k) || k.includes(tid))?.[1];

  const existing = team?.stadium;
  const isYouthTeam =
    explicitDivisionTier === 'youth' ||
    Boolean(team?.leagueId && team.leagueId.toLowerCase().includes('youth'));

  const resolvedYouthStd = isYouthTeam ? resolveYouthStadiumForClub(team) : undefined;

  const assignedCountryStadiumId = resolvedYouthStd
    ? resolvedYouthStd.id
    : getAssignedCountryStadiumIdForTeam(team, explicitDivisionTier);
  // WORLD ARENA is exclusively for World Cup Opening & Finals — never assign to any club
  const validExistingGameplayId =
    existing?.gameplayStadiumId &&
    existing.gameplayStadiumId !== 'world_arena' &&
    STADIUM_REGISTRY[existing.gameplayStadiumId] &&
    (!isYouthTeam || STADIUM_REGISTRY[existing.gameplayStadiumId].category === 'youth')
      ? existing.gameplayStadiumId
      : undefined;

  const curatedGameplayId =
    !isYouthTeam && curatedMatch && STADIUM_REGISTRY[curatedMatch.gameplayStadiumId]
      ? curatedMatch.gameplayStadiumId
      : undefined;

  const targetGameplayId =
    existing?.isCustomOverride && validExistingGameplayId
      ? validExistingGameplayId
      : curatedGameplayId || validExistingGameplayId || assignedCountryStadiumId;

  const targetGameplayStd = getStadiumById(targetGameplayId);

  let name = existing?.name || (isYouthTeam ? targetGameplayStd.name : undefined);
  let capacity = existing?.capacity ?? (isYouthTeam ? targetGameplayStd.capacity : undefined);
  let tier: StadiumTier | undefined = existing?.tier ?? (isYouthTeam ? 1 : undefined);

  // Auto-upgrade non-custom clubs to their copyright-safe curated name/capacity/tier
  if (curatedMatch && !existing?.isCustomOverride) {
    name = curatedMatch.stadiumName;
    capacity = curatedMatch.capacity;
    tier = curatedMatch.tier;
  } else if (regMatch && !existing?.isCustomOverride && (!name || name === `${team.name} Stadium` || name === 'Default Arena')) {
    name = regMatch.name;
    capacity = regMatch.capacity;
    tier = regMatch.tier;
  }

  if (!name || !capacity || !tier) {
    if (curatedMatch) {
      name = curatedMatch.stadiumName;
      capacity = curatedMatch.capacity;
      tier = curatedMatch.tier;
    } else if (regMatch) {
      name = regMatch.name;
      capacity = regMatch.capacity;
      tier = regMatch.tier;
    } else {
      if (rep >= 84) {
        tier = 5;
        capacity = capacity || targetGameplayStd.capacity || 72000;
        name = name || `${team?.name || 'Club'} Arena`;
      } else if (rep >= 76) {
        tier = 4;
        capacity = capacity || targetGameplayStd.capacity || 48000;
        name = name || `${team?.name || 'Club'} Stadium`;
      } else if (rep >= 68) {
        tier = 3;
        capacity = capacity || targetGameplayStd.capacity || 28000;
        name = name || `${team?.name || 'Club'} Stadium`;
      } else if (rep >= 58) {
        tier = 2;
        capacity = capacity || targetGameplayStd.capacity || 14000;
        name = name || `${team?.name || 'Club'} Ground`;
      } else {
        tier = 1;
        capacity = capacity || 3500;
        name = name || `${team?.name || 'Local'} Ground`;
      }
    }
  }

  const existingVenue = existing?.homeVenueConfig;
  const hasRealBrands = containsLegacyRealLifeBrands(existingVenue?.sponsors);
  const curatedOutOfSync =
    Boolean(curatedMatch) &&
    !existing?.isCustomOverride &&
    (existingVenue?.stadiumId !== targetGameplayId || existingVenue?.customStadiumName !== name);
  const needsVenueRefresh =
    !existingVenue ||
    curatedOutOfSync ||
    (!existing?.isCustomOverride &&
      (!existingVenue.sponsors ||
        existingVenue.sponsors.length === 0 ||
        existingVenue.sponsors.length > 3 ||
        hasRealBrands));

  const adjustedHomeVenue = needsVenueRefresh
    ? buildClubHomeVenueConfig(team, targetGameplayId, name, tier, explicitDivisionTier, curatedMatch)
    : {
        ...existingVenue!,
        stadiumId: existingVenue!.stadiumId === 'world_arena' ? targetGameplayId : existingVenue!.stadiumId || targetGameplayId,
        customStadiumName: existingVenue!.customStadiumName || name,
      };

  return {
    ...(existing || {}),
    name,
    capacity,
    tier,
    gameplayStadiumId: targetGameplayId,
    homeVenueConfig: adjustedHomeVenue,
  };
}
