import { NATIONALITIES, STARTING_CITIES } from '../constants';
import { DEFAULT_LEAGUE_DATABASE } from '../data/defaultLeagues';
import {
  YOUTH_LEAGUES_DATABASE,
  getYouthLeagueTeamScaledSquad,
  YouthTeamData,
} from '../data/youthLeaguesDatabase';
import { resolveStreetStadiumForCity, StartingCityStreetId } from '../gameplay/game/streetStadiumGenerator';
import { STREET_1_2_2_2_SLOTS } from '../gameplay/game/formations';
import {
  PlayerRole,
  StreetwearBottomStyle,
  StreetwearHatStyle,
  StreetwearOutfit,
  StreetwearPaletteGroup,
  StreetwearTopStyle,
  SubPosition,
} from '../gameplay/types';
import { StadiumDefinition } from '../gameplay/types/stadium';
import { KitConfig, PlayerCardData, PlayerConfig } from '../types';
import { EditorTeamData, LeagueDatabase, SquadSlot } from '../types/leagueEditor';
import { SPECIAL_TEAM_IDS } from './confederationStadiumDefaults';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';

export type { StartingCityStreetId };
export type StreetRoleLabel = 'GK' | 'DEF1' | 'DEF2' | 'MID1' | 'MID2' | 'ATT1' | 'ATT2';
export type StreetLineBucket = 'GK' | 'DEF' | 'MID' | 'ATT';

export interface StreetCityDescriptor {
  cityId: StartingCityStreetId;
  cityName: string;
  countryName: string;
  youthLeagueId: string;
  d1LeagueIds: string[];
  d2LeagueIds: string[];
  countryCodes: string[];
  streetTeamNames: [string, string];
  aliases: string[];
}

export interface StreetTaggedPoolPlayer {
  player: PlayerCardData;
  origin: 'youth' | 'd1' | 'd2';
  clubName: string;
  squadGroup?: 'youth' | 'squad' | 'reserves' | 'u20' | 'u17';
}

export interface StreetPoolSourceStats {
  cityId: StartingCityStreetId;
  cityName: string;
  countryName: string;
  youthCount: number;
  d1Count: number;
  d2Count: number;
  reservesCount: number;
  u20Count: number;
  u17Count: number;
  totalPoolSize: number;
}

export interface StreetCaptainCandidateEntry {
  player: PlayerCardData;
  origin: 'youth' | 'd1' | 'd2';
  clubName: string;
  squadGroup?: 'youth' | 'squad' | 'reserves' | 'u20' | 'u17';
  cityRank: number;
}

export interface StreetAssignedSlot {
  slotNumber: number;
  role: PlayerRole;
  streetRole: StreetRoleLabel;
  subPosition: Extract<SubPosition, 'GK' | 'CB' | 'CM' | 'ST'>;
  xPercent: number;
  yPercent: number;
  player: PlayerCardData;
  isUserPlayer?: boolean;
  isCaptain?: boolean;
  streetOutfit: StreetwearOutfit;
}

export interface StreetBibPair {
  id: string;
  homeName: string;
  awayName: string;
  homeKit: KitConfig;
  awayKit: KitConfig;
}

export interface StreetMatchBuildOptions {
  age?: number;
  seed?: string | number;
  bibPairIndex?: number;
  homeControl?: 'player' | 'cpu';
  awayControl?: 'player' | 'cpu';
  homeCaptain?: PlayerCardData | null;
  awayCaptain?: PlayerCardData | null;
}

export interface StreetMatchBuildResult {
  cityId: StartingCityStreetId;
  cityName: string;
  countryName: string;
  stadium: StadiumDefinition;
  drawnPlayers13: PlayerCardData[];
  bonusPlayer?: PlayerCardData;
  matchPlayers14: PlayerCardData[];
  homeSlots: StreetAssignedSlot[];
  awaySlots: StreetAssignedSlot[];
  homeEditorTeam: EditorTeamData;
  awayEditorTeam: EditorTeamData;
  homeCaptainId: string;
  awayCaptainId: string;
  bibPair: StreetBibPair;
  lockedPlayerId?: string;
  sourceStats: StreetPoolSourceStats;
  drawNonce: string;
}

export const STREET_CITY_DESCRIPTORS: Record<StartingCityStreetId, StreetCityDescriptor> = {
  buenos_aires: {
    cityId: 'buenos_aires',
    cityName: 'Buenos Aires',
    countryName: 'Argentina',
    youthLeagueId: 'buenos_aires',
    d1LeagueIds: ['argentina_d1'],
    d2LeagueIds: ['argentina_d2'],
    countryCodes: ['ARG', 'AR'],
    streetTeamNames: ['Potrero Albiceleste', 'Villa Sur Barrio XI'],
    aliases: ['buenos aires', 'buenos_aires', 'buenosaires', 'argentina', 'arg'],
  },
  sao_paulo: {
    cityId: 'sao_paulo',
    cityName: 'São Paulo',
    countryName: 'Brazil',
    youthLeagueId: 'sao_paulo',
    d1LeagueIds: ['brazil_d1'],
    d2LeagueIds: ['brazil_d2'],
    countryCodes: ['BRA', 'BR'],
    streetTeamNames: ['Várzea Paulista', 'Quadra Centro 7'],
    aliases: ['sao paulo', 'são paulo', 'sao_paulo', 'saopaulo', 'brazil', 'brasil', 'bra'],
  },
  london: {
    cityId: 'london',
    cityName: 'London',
    countryName: 'England',
    youthLeagueId: 'london',
    d1LeagueIds: ['england_d1'],
    d2LeagueIds: ['england_d2'],
    countryCodes: ['ENG', 'GB-ENG', 'UK'],
    streetTeamNames: ['Southwark Cage 7', 'Thames Estate All-Stars'],
    aliases: ['london', 'england', 'eng', 'south london'],
  },
  madrid: {
    cityId: 'madrid',
    cityName: 'Madrid',
    countryName: 'Spain',
    youthLeagueId: 'madrid',
    d1LeagueIds: ['spain_d1'],
    d2LeagueIds: ['spain_d2'],
    countryCodes: ['ESP', 'ES'],
    streetTeamNames: ['Vallecas Barrio 7', 'Lavapiés Pista Club'],
    aliases: ['madrid', 'spain', 'espana', 'españa', 'esp'],
  },
  paris: {
    cityId: 'paris',
    cityName: 'Paris',
    countryName: 'France',
    youthLeagueId: 'paris',
    d1LeagueIds: ['france_d1'],
    d2LeagueIds: ['france_d2'],
    countryCodes: ['FR', 'FRA'],
    streetTeamNames: ['Saint-Denis Cage', 'Belleville Paname 7'],
    aliases: ['paris', 'france', 'fr', 'fra', 'banlieue'],
  },
  roma: {
    cityId: 'roma',
    cityName: 'Roma',
    countryName: 'Italy',
    youthLeagueId: 'roma',
    d1LeagueIds: ['italy_d1'],
    d2LeagueIds: ['italy_d2'],
    countryCodes: ['ITA', 'IT'],
    streetTeamNames: ['Testaccio Campetto', 'Trastevere Piazza 7'],
    aliases: ['roma', 'rome', 'italy', 'italia', 'ita'],
  },
  berlin: {
    cityId: 'berlin',
    cityName: 'Berlin',
    countryName: 'Germany',
    youthLeagueId: 'berlin',
    d1LeagueIds: ['germany_d1'],
    d2LeagueIds: ['germany_d2'],
    countryCodes: ['GER', 'DEU', 'DE'],
    streetTeamNames: ['Kreuzberg Käfig 7', 'Neukölln Beton Crew'],
    aliases: ['berlin', 'germany', 'deutschland', 'ger', 'deu'],
  },
  lisboa: {
    cityId: 'lisboa',
    cityName: 'Lisboa',
    countryName: 'Portugal',
    youthLeagueId: 'lisboa',
    d1LeagueIds: ['portugal_d1'],
    d2LeagueIds: ['portugal_d2'],
    countryCodes: ['POR', 'PRT', 'PT'],
    streetTeamNames: ['Alfama Recinto 7', 'Tejo Ribeira Crew'],
    aliases: ['lisboa', 'lisbon', 'portugal', 'por', 'prt'],
  },
  riyadh: {
    cityId: 'riyadh',
    cityName: 'Riyadh',
    countryName: 'Saudi Arabia',
    youthLeagueId: 'riyadh',
    d1LeagueIds: ['saudi_d1'],
    d2LeagueIds: ['saudi_d2'],
    countryCodes: ['KSA', 'SAU', 'SA'],
    streetTeamNames: ['Al-Malaz Sand 7', 'Olaya Street Stars'],
    aliases: ['riyadh', 'saudi arabia', 'saudi', 'ksa', 'sau'],
  },
};

// Light (White / Sky Blue / Light Yellow / Light Pink) vs Dark (Black / Dark Purple / Brown) palettes
export const LIGHT_STREETWEAR_TOP_PALETTE: Array<{ color: string; accent: string }> = [
  { color: '#f8fafc', accent: '#0f172a' }, // Crisp White
  { color: '#7dd3fc', accent: '#ffffff' }, // Sky Blue
  { color: '#bae6fd', accent: '#0369a1' }, // Soft Sky
  { color: '#fef08a', accent: '#1e293b' }, // Light Yellow
  { color: '#fbcfe8', accent: '#ffffff' }, // Light Pink
  { color: '#f9a8d4', accent: '#831843' }, // Bright Pastel Pink
  { color: '#fef3c7', accent: '#1e293b' }, // Warm Cream
];

export const LIGHT_STREETWEAR_BOTTOM_SHORTS: string[] = [
  '#f1f5f9',
  '#e0f2fe',
  '#fef9c3',
  '#fce7f3',
  '#e2e8f0',
];

export const LIGHT_STREETWEAR_BOTTOM_JEANS: string[] = [
  '#60a5fa',
  '#93c5fd',
  '#3b82f6',
  '#cbd5e1',
];

export const LIGHT_STREETWEAR_BOTTOM_JOGGERS: string[] = [
  '#e2e8f0',
  '#f1f5f9',
  '#d6d3d1',
  '#bae6fd',
];

export const LIGHT_STREETWEAR_SHOES: string[] = [
  '#ffffff',
  '#f8fafc',
  '#e0f2fe',
  '#fef08a',
  '#f1f5f9',
];

export const LIGHT_STREETWEAR_HATS: string[] = [
  '#f8fafc',
  '#7dd3fc',
  '#fef08a',
  '#fbcfe8',
  '#e2e8f0',
];

export const DARK_STREETWEAR_TOP_PALETTE: Array<{ color: string; accent: string }> = [
  { color: '#111827', accent: '#e2e8f0' }, // Jet Black
  { color: '#09090b', accent: '#cbd5e1' }, // Obsidian Black
  { color: '#3b0764', accent: '#d8b4fe' }, // Dark Purple
  { color: '#4c1d95', accent: '#f3e8ff' }, // Deep Violet
  { color: '#451a03', accent: '#fde68a' }, // Dark Brown
  { color: '#5c3317', accent: '#e7e5e4' }, // Espresso Brown
  { color: '#1f2937', accent: '#94a3b8' }, // Dark Charcoal
];

export const DARK_STREETWEAR_BOTTOM_SHORTS: string[] = [
  '#09090b',
  '#111827',
  '#2e1065',
  '#271308',
  '#1f2937',
];

export const DARK_STREETWEAR_BOTTOM_JEANS: string[] = [
  '#111827',
  '#172554',
  '#1c1917',
  '#1e1b4b',
];

export const DARK_STREETWEAR_BOTTOM_JOGGERS: string[] = [
  '#0f172a',
  '#2e1065',
  '#292524',
  '#18181b',
];

export const DARK_STREETWEAR_SHOES: string[] = [
  '#111827',
  '#1f2937',
  '#27272a',
  '#3b0764',
  '#451a03',
];

export const DARK_STREETWEAR_HATS: string[] = [
  '#111827',
  '#3b0764',
  '#451a03',
  '#1f2937',
  '#2e1065',
];

export const STREETWEAR_BIB_PAIRS: StreetBibPair[] = [
  {
    id: 'street_light_vs_dark',
    homeName: 'Light Streetwear (White / Sky / Pastel)',
    awayName: 'Dark Streetwear (Black / Purple / Brown)',
    homeKit: {
      style: 'normal',
      pattern: 'solid',
      collar: 'crew',
      color1: '#f8fafc',
      color2: '#7dd3fc',
    },
    awayKit: {
      style: 'normal',
      pattern: 'solid',
      collar: 'crew',
      color1: '#111827',
      color2: '#3b0764',
    },
  },
  {
    id: 'street_sky_yellow_vs_plum_brown',
    homeName: 'Bright Streetwear (Sky / Yellow / Pink)',
    awayName: 'Shadow Streetwear (Black / Plum / Espresso)',
    homeKit: {
      style: 'normal',
      pattern: 'solid',
      collar: 'crew',
      color1: '#7dd3fc',
      color2: '#fef08a',
    },
    awayKit: {
      style: 'normal',
      pattern: 'solid',
      collar: 'crew',
      color1: '#3b0764',
      color2: '#451a03',
    },
  },
];

let drawSequenceCounter = 1;

function normalizeKey(value?: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .trim();
}

export function resolveStreetCityId(cityIdOrName?: string): StartingCityStreetId {
  const norm = normalizeKey(cityIdOrName);
  if (!norm) return 'buenos_aires';

  for (const descriptor of Object.values(STREET_CITY_DESCRIPTORS)) {
    if (
      normalizeKey(descriptor.cityId) === norm ||
      normalizeKey(descriptor.cityName) === norm ||
      descriptor.aliases.some((alias) => normalizeKey(alias) === norm)
    ) {
      return descriptor.cityId;
    }
  }

  for (const cityMeta of STARTING_CITIES) {
    if (
      normalizeKey(cityMeta.id) === norm ||
      normalizeKey(cityMeta.cityName) === norm ||
      normalizeKey(cityMeta.countryName) === norm ||
      normalizeKey(cityMeta.nationality.code) === norm
    ) {
      return cityMeta.id as StartingCityStreetId;
    }
  }

  return 'buenos_aires';
}

function fnv1aHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createStreetRng(explicitSeed?: string | number): { rng: () => number; nonce: string } {
  if (explicitSeed !== undefined) {
    const nonce = `seed:${String(explicitSeed)}`;
    return { rng: mulberry32(fnv1aHash(nonce)), nonce };
  }

  let cryptoWord = 0;
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
      const buf = new Uint32Array(2);
      globalThis.crypto.getRandomValues(buf);
      cryptoWord = (buf[0] ^ Math.imul(buf[1], 2654435761)) >>> 0;
    }
  } catch {
    cryptoWord = 0;
  }

  const seq = drawSequenceCounter++;
  const nonce = `${Date.now()}-${seq}-${cryptoWord}-${Math.floor(Math.random() * 1e9)}`;
  const prng = mulberry32(fnv1aHash(nonce));
  return {
    rng: () => {
      return ((prng() + Math.random()) * 0.5) % 1;
    },
    nonce,
  };
}

function shuffleWithRng<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickFrom<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

export function getStreetPlayerOvr(p?: Partial<PlayerCardData> | null): number {
  if (!p) return 60;
  return Number(p.ovr || p.overallRating || 65);
}

export function generateStreetwearOutfit(
  paletteGroup: StreetwearPaletteGroup,
  rng: () => number = Math.random
): StreetwearOutfit {
  const topStyles: StreetwearTopStyle[] = ['tshirt', 'tshirt', 'hoodie', 'tank_top', 'windbreaker'];
  const bottomStyles: StreetwearBottomStyle[] = ['shorts', 'jeans', 'joggers'];
  const hatStyles: StreetwearHatStyle[] = ['none', 'none', 'none', 'cap', 'cap', 'beanie'];

  const topStyle = pickFrom(topStyles, rng);
  const bottomStyle = pickFrom(bottomStyles, rng);
  const hatStyle = pickFrom(hatStyles, rng);

  if (paletteGroup === 'light') {
    const topPick = pickFrom(LIGHT_STREETWEAR_TOP_PALETTE, rng);
    const bottomColor =
      bottomStyle === 'jeans'
        ? pickFrom(LIGHT_STREETWEAR_BOTTOM_JEANS, rng)
        : bottomStyle === 'joggers'
        ? pickFrom(LIGHT_STREETWEAR_BOTTOM_JOGGERS, rng)
        : pickFrom(LIGHT_STREETWEAR_BOTTOM_SHORTS, rng);
    return {
      paletteGroup: 'light',
      topStyle,
      topColor: topPick.color,
      topAccentColor: topPick.accent,
      bottomStyle,
      bottomColor,
      shoeColor: pickFrom(LIGHT_STREETWEAR_SHOES, rng),
      hatStyle,
      hatColor: hatStyle === 'none' ? undefined : pickFrom(LIGHT_STREETWEAR_HATS, rng),
      sockColor: '#f8fafc',
    };
  }

  const topPick = pickFrom(DARK_STREETWEAR_TOP_PALETTE, rng);
  const bottomColor =
    bottomStyle === 'jeans'
      ? pickFrom(DARK_STREETWEAR_BOTTOM_JEANS, rng)
      : bottomStyle === 'joggers'
      ? pickFrom(DARK_STREETWEAR_BOTTOM_JOGGERS, rng)
      : pickFrom(DARK_STREETWEAR_BOTTOM_SHORTS, rng);
  return {
    paletteGroup: 'dark',
    topStyle,
    topColor: topPick.color,
    topAccentColor: topPick.accent,
    bottomStyle,
    bottomColor,
    shoeColor: pickFrom(DARK_STREETWEAR_SHOES, rng),
    hatStyle,
    hatColor: hatStyle === 'none' ? undefined : pickFrom(DARK_STREETWEAR_HATS, rng),
    sockColor: '#1f2937',
  };
}

function isGoalkeeperPlayer(p?: Partial<PlayerCardData> | null): boolean {
  if (!p) return false;
  const sub = (p.subPosition || p.position || '').toUpperCase().trim();
  return sub === 'GK';
}

export function resolveStreetLineBucket(p?: Partial<PlayerCardData> | null): StreetLineBucket {
  if (isGoalkeeperPlayer(p)) return 'GK';
  const sub = (p?.subPosition || p?.position || '').toUpperCase().trim();
  if (sub === 'CB' || sub === 'LB' || sub === 'RB' || sub === 'LWB' || sub === 'RWB' || sub === 'LIB' || sub === 'DEF') {
    return 'DEF';
  }
  if (sub === 'ST' || sub === 'CF' || sub === 'SS' || sub === 'LW' || sub === 'RW' || sub === 'ATT') {
    return 'ATT';
  }
  return 'MID';
}

export function computeStreetRemainingBucketNeeds(
  anchor?: Partial<PlayerCardData> | null
): Record<StreetLineBucket, number> {
  const needs: Record<StreetLineBucket, number> = {
    GK: 1,
    DEF: 2,
    MID: 2,
    ATT: 2,
  };
  if (!anchor) return needs;
  const bucket = resolveStreetLineBucket(anchor);
  needs[bucket] = Math.max(0, needs[bucket] - 1);
  return needs;
}

function toPlayerCardData(input: PlayerCardData | PlayerConfig): PlayerCardData {
  const anyP = input as PlayerCardData & PlayerConfig;
  return {
    ...anyP,
    id: anyP.id || `street_user_${normalizeKey(anyP.name).replace(/\s+/g, '_') || 'player'}`,
    ovr: anyP.ovr || anyP.overallRating || 68,
    number: anyP.shirtNumber || anyP.number || 10,
    shirtNumber: anyP.shirtNumber || anyP.number || 10,
  };
}

function isSpecialOrTemporaryClub(team?: EditorTeamData | null): boolean {
  if (!team) return true;
  if (team.isTemporaryContinentalClub) return true;
  if ((SPECIAL_TEAM_IDS as readonly string[]).includes(team.id)) return true;
  if (team.leagueId && (SPECIAL_TEAM_IDS as readonly string[]).includes(team.leagueId)) return true;
  return false;
}

export function collectStreetCityPlayerPool(
  cityIdOrName?: string,
  leagueDb?: LeagueDatabase | null,
  options?: { age?: number; excludePlayer?: PlayerCardData | PlayerConfig | null }
): {
  descriptor: StreetCityDescriptor;
  pool: StreetTaggedPoolPlayer[];
  youthPool: StreetTaggedPoolPlayer[];
  d1Pool: StreetTaggedPoolPlayer[];
  d2Pool: StreetTaggedPoolPlayer[];
  stats: StreetPoolSourceStats;
} {
  const cityId = resolveStreetCityId(cityIdOrName);
  const descriptor = STREET_CITY_DESCRIPTORS[cityId];
  const youthAge = Math.max(10, Math.min(16, Math.round(options?.age || 16)));
  const excludedId = options?.excludePlayer?.id;
  const excludedName = normalizeKey(options?.excludePlayer?.name);

  const effectiveDb: LeagueDatabase =
    leagueDb && leagueDb.teams && Object.keys(leagueDb.teams).length > 0
      ? leagueDb
      : getLeagueDatabase() || DEFAULT_LEAGUE_DATABASE;

  const fallbackDb = getLeagueDatabase();
  const seenKeys = new Set<string>();
  const youthPool: StreetTaggedPoolPlayer[] = [];
  const d1Pool: StreetTaggedPoolPlayer[] = [];
  const d2Pool: StreetTaggedPoolPlayer[] = [];
  let reservesCount = 0;
  let u20Count = 0;
  let u17Count = 0;

  const isExcludedUser = (card?: PlayerCardData | null): boolean => {
    if (!card) return true;
    if (excludedId && card.id === excludedId) return true;
    if (
      excludedName &&
      normalizeKey(card.name) === excludedName &&
      (!options?.excludePlayer?.club || normalizeKey(card.club) === normalizeKey(options.excludePlayer.club))
    ) {
      return true;
    }
    return false;
  };

  const pushUnique = (
    bucket: StreetTaggedPoolPlayer[],
    origin: 'youth' | 'd1' | 'd2',
    clubName: string,
    card?: PlayerCardData | null,
    squadGroup: 'youth' | 'squad' | 'reserves' | 'u20' | 'u17' = origin === 'youth' ? 'youth' : 'squad'
  ) => {
    if (!card || !card.name || isExcludedUser(card)) return;
    const dedupeKey = card.id
      ? `id:${card.id}`
      : `name:${normalizeKey(card.name)}:${normalizeKey(clubName || card.club)}`;
    if (seenKeys.has(dedupeKey)) return;
    seenKeys.add(dedupeKey);
    if (squadGroup === 'reserves') reservesCount++;
    else if (squadGroup === 'u20') u20Count++;
    else if (squadGroup === 'u17') u17Count++;
    bucket.push({
      player: {
        ...card,
        club: card.club || clubName,
      },
      origin,
      clubName,
      squadGroup,
    });
  };

  // 1. City Youth League clubs (all 9 Starting Cities have dedicated Youth Leagues)
  const youthLeague = YOUTH_LEAGUES_DATABASE[descriptor.youthLeagueId];
  if (youthLeague) {
    for (const yTeam of youthLeague.teams) {
      if (Array.isArray(yTeam.players) && yTeam.players.length > 0) {
        for (const yp of yTeam.players) {
          pushUnique(youthPool, 'youth', yTeam.name, yp, 'youth');
        }
      } else {
        const scaled = getYouthLeagueTeamScaledSquad(yTeam as YouthTeamData, youthAge);
        for (const yp of scaled.players) {
          pushUnique(youthPool, 'youth', yTeam.name, yp, 'youth');
        }
      }
    }
  }

  // Also include any customized youth clubs stored inside effectiveDb for this city/league
  const cityYouthLeagueId = `${
    descriptor.youthLeagueId === 'buenos_aires'
      ? 'argentina'
      : descriptor.youthLeagueId === 'sao_paulo'
      ? 'brazil'
      : descriptor.cityId === 'london'
      ? 'england'
      : descriptor.cityId === 'paris'
      ? 'france'
      : descriptor.cityId === 'madrid'
      ? 'spain'
      : descriptor.cityId === 'lisboa'
      ? 'portugal'
      : descriptor.cityId
  }_youth`;
  for (const team of Object.values(effectiveDb.teams || {})) {
    if (!team || isSpecialOrTemporaryClub(team)) continue;
    if (
      team.leagueId === cityYouthLeagueId ||
      (Boolean(team.leagueId?.endsWith('_youth')) && normalizeKey(team.city) === normalizeKey(descriptor.cityName))
    ) {
      const hydrated = team.squadSaveFile?.squad?.some((s) => s.player) ? team : ensureTeamSquadSaveFile(team);
      for (const slot of hydrated.squadSaveFile?.squad || []) {
        if (slot.player) pushUnique(youthPool, 'youth', hydrated.name, slot.player, 'youth');
      }
    }
  }

  // 2. Country D1 & D2 Clubs from effectiveDb (squad + reserves + u20 + u17)
  const collectCountryClubsFromDb = (db: LeagueDatabase) => {
    const codeSet = new Set(descriptor.countryCodes.map((c) => c.toUpperCase()));
    const d1Set = new Set(descriptor.d1LeagueIds);
    const d2Set = new Set(descriptor.d2LeagueIds);

    for (const team of Object.values(db.teams || {})) {
      if (!team || isSpecialOrTemporaryClub(team)) continue;
      const league = team.leagueId ? db.leagues?.[team.leagueId] : undefined;
      const tier = league?.divisionTier;
      if (tier === 'youth' || (team.leagueId || '').endsWith('_youth')) continue;

      const matchesLeague =
        (team.leagueId && (d1Set.has(team.leagueId) || d2Set.has(team.leagueId))) ||
        (team.countryCode && codeSet.has(team.countryCode.toUpperCase()));
      if (!matchesLeague) continue;

      const origin: 'd1' | 'd2' =
        (team.leagueId && d2Set.has(team.leagueId)) || tier === '2nd' ? 'd2' : 'd1';
      const targetBucket = origin === 'd2' ? d2Pool : d1Pool;

      const hasAllGroups = Boolean(
        team.squadSaveFile?.squad?.some((s) => Boolean(s.player)) &&
          team.squadSaveFile?.reserves?.some((s) => Boolean(s.player)) &&
          team.squadSaveFile?.u20?.some((s) => Boolean(s.player)) &&
          team.squadSaveFile?.u17?.some((s) => Boolean(s.player))
      );
      const hydrated = hasAllGroups ? team : ensureTeamSquadSaveFile(team);

      for (const slot of hydrated.squadSaveFile?.squad || []) {
        if (slot.player) pushUnique(targetBucket, origin, hydrated.name, slot.player, 'squad');
      }
      for (const slot of hydrated.squadSaveFile?.reserves || []) {
        if (slot.player) pushUnique(targetBucket, origin, hydrated.name, slot.player, 'reserves');
      }
      for (const slot of hydrated.squadSaveFile?.u20 || []) {
        if (slot.player) pushUnique(targetBucket, origin, hydrated.name, slot.player, 'u20');
      }
      for (const slot of hydrated.squadSaveFile?.u17 || []) {
        if (slot.player) pushUnique(targetBucket, origin, hydrated.name, slot.player, 'u17');
      }
    }
  };

  collectCountryClubsFromDb(effectiveDb);
  if (d1Pool.length === 0 && fallbackDb) {
    collectCountryClubsFromDb(fallbackDb);
  }

  const pool = [...youthPool, ...d1Pool, ...d2Pool];
  return {
    descriptor,
    pool,
    youthPool,
    d1Pool,
    d2Pool,
    stats: {
      cityId: descriptor.cityId,
      cityName: descriptor.cityName,
      countryName: descriptor.countryName,
      youthCount: youthPool.length,
      d1Count: d1Pool.length,
      d2Count: d2Pool.length,
      reservesCount,
      u20Count,
      u17Count,
      totalPoolSize: pool.length,
    },
  };
}

/**
 * Slices the Top 15 highest-OVR players from the city pool and draws `count` (default 3)
 * candidate stars for human Street Captain selection (excluding any already-selected IDs).
 */
export function drawStreetCaptainCandidates(
  cityIdOrName?: string,
  leagueDb?: LeagueDatabase | null,
  options?: {
    age?: number;
    seed?: string | number;
    excludeIds?: string[];
    excludePlayer?: PlayerCardData | PlayerConfig | null;
    count?: number;
  }
): {
  cityId: StartingCityStreetId;
  cityName: string;
  countryName: string;
  candidates: StreetCaptainCandidateEntry[];
  top15Pool: StreetCaptainCandidateEntry[];
  stats: StreetPoolSourceStats;
} {
  const { rng } = createStreetRng(options?.seed);
  const { descriptor, pool, stats } = collectStreetCityPlayerPool(cityIdOrName, leagueDb, {
    age: options?.age || 16,
    excludePlayer: options?.excludePlayer,
  });

  const excludedSet = new Set(options?.excludeIds || []);
  const eligible = pool.filter((entry) => !excludedSet.has(entry.player.id));
  const sortedByOvr = [...eligible].sort((a, b) => {
    const diff = getStreetPlayerOvr(b.player) - getStreetPlayerOvr(a.player);
    if (diff !== 0) return diff;
    return a.player.id.localeCompare(b.player.id);
  });

  const top15Pool: StreetCaptainCandidateEntry[] = sortedByOvr.slice(0, 15).map((entry, idx) => ({
    player: entry.player,
    origin: entry.origin,
    clubName: entry.clubName,
    squadGroup: entry.squadGroup,
    cityRank: idx + 1,
  }));

  const count = Math.max(1, Math.min(options?.count ?? 3, top15Pool.length));
  const candidates = shuffleWithRng(top15Pool, rng).slice(0, count);

  return {
    cityId: descriptor.cityId,
    cityName: descriptor.cityName,
    countryName: descriptor.countryName,
    candidates,
    top15Pool,
    stats,
  };
}

function synthesizeStreetPlayerFallback(
  cityId: StartingCityStreetId,
  countryName: string,
  bucket: StreetLineBucket,
  index: number,
  rng: () => number
): PlayerCardData {
  const nat =
    NATIONALITIES.find((n) => n.name.toLowerCase() === countryName.toLowerCase()) ||
    NATIONALITIES[0];
  const ovr = 66 + Math.floor(rng() * 8);
  const subPos = bucket === 'GK' ? 'GK' : bucket === 'DEF' ? 'CB' : bucket === 'MID' ? 'CM' : 'ST';
  return {
    id: `street_synth_${bucket.toLowerCase()}_${cityId}_${Date.now()}_${index}`,
    name: `${STREET_CITY_DESCRIPTORS[cityId].cityName} ${bucket} #${index}`,
    number: bucket === 'GK' ? (index === 1 ? 1 : 13) : 2 + index,
    shirtNumber: bucket === 'GK' ? (index === 1 ? 1 : 13) : 2 + index,
    ovr,
    age: 19,
    club: `${STREET_CITY_DESCRIPTORS[cityId].cityName} Streets`,
    subPosition: subPos,
    position: bucket,
    playStyle: bucket === 'GK' ? 'balanced_gk' : bucket === 'DEF' ? 'stopper' : bucket === 'MID' ? 'box_to_box' : 'poacher',
    nationality: nat,
    stats: {
      pro: ovr,
      def: ovr,
      cre: bucket === 'GK' ? 54 : ovr,
      men: ovr,
      goa: bucket === 'GK' ? 42 : ovr,
      phy: ovr,
      ...(bucket === 'GK'
        ? {
            gkDetailed: {
              saving: ovr,
              reflexes: ovr + 1,
              handling: ovr - 1,
              positioning: ovr,
              aerialReach: ovr,
              oneOnOne: ovr,
              distribution: 62,
            },
          }
        : {}),
    },
    biometrics: {
      strength: ovr,
      skinColor: '#e0ac69',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#18181b',
      hairDye: '#18181b',
    },
    accessories: {
      accessory: 'none',
      headbandColor: '#ffffff',
    },
    kit: { color1: '#f8fafc', color2: '#0f172a', pattern: 'solid' },
    emblem: { shape: 'crested-shield', mode: '1', color1: '#f8fafc', color2: '#0f172a' },
  };
}

/**
 * Draws 6 positional teammates strictly matching remaining deficits from [1 GK, 2 DEF, 2 MID, 2 ATT]
 * after discounting `anchor`'s position. Never draws a duplicate GK when `anchor` is a GK.
 */
function drawPositionalSixTeammates(
  availablePool: PlayerCardData[],
  anchor: PlayerCardData,
  rng: () => number,
  cityId: StartingCityStreetId,
  countryName: string,
  synthOffset: number
): PlayerCardData[] {
  const needs = computeStreetRemainingBucketNeeds(anchor);
  const picked: PlayerCardData[] = [];

  const pullBucket = (bucket: StreetLineBucket, count: number) => {
    for (let i = 0; i < count; i++) {
      const idx = availablePool.findIndex((p) => resolveStreetLineBucket(p) === bucket);
      if (idx >= 0) {
        picked.push(availablePool.splice(idx, 1)[0]);
      } else if (bucket !== 'GK') {
        // Fallback to any non-GK player so we never accidentally draw an extra goalkeeper
        const nonGkIdx = availablePool.findIndex((p) => resolveStreetLineBucket(p) !== 'GK');
        if (nonGkIdx >= 0) {
          picked.push(availablePool.splice(nonGkIdx, 1)[0]);
        } else {
          picked.push(synthesizeStreetPlayerFallback(cityId, countryName, bucket, synthOffset + picked.length, rng));
        }
      } else {
        picked.push(synthesizeStreetPlayerFallback(cityId, countryName, 'GK', synthOffset + picked.length, rng));
      }
    }
  };

  // Draw GK first (0 if anchor is GK, else 1) so no GK is ever accidentally pulled into an outfield slot fallback
  pullBucket('GK', needs.GK);
  pullBucket('DEF', needs.DEF);
  pullBucket('MID', needs.MID);
  pullBucket('ATT', needs.ATT);

  return picked;
}

function assignSevenPlayersTo1222(
  rawSeven: PlayerCardData[],
  paletteGroup: StreetwearPaletteGroup,
  rng: () => number,
  captainPlayerId: string,
  userPlayerCard?: PlayerCardData
): StreetAssignedSlot[] {
  const keeper =
    rawSeven.find((p) => isGoalkeeperPlayer(p)) ||
    rawSeven[0];
  const outfieldSix = rawSeven.filter((p) => p.id !== keeper.id).slice(0, 6);

  const assigned: Array<PlayerCardData | null> = [keeper, null, null, null, null, null, null];
  const remaining = [...outfieldSix];

  // Lock Unique Career outfield user into their natural line slot first
  if (userPlayerCard && userPlayerCard.id !== keeper.id) {
    const userIdxInRemaining = remaining.findIndex((p) => p.id === userPlayerCard.id);
    if (userIdxInRemaining >= 0) {
      remaining.splice(userIdxInRemaining, 1);
    }
    const line = resolveStreetLineBucket(userPlayerCard);
    const preferredIdx = line === 'DEF' ? 1 : line === 'MID' ? 3 : 5;
    assigned[preferredIdx] = userPlayerCard;
  }

  const pickBestMatch = (bucketTargets: Array<'DEF' | 'MID' | 'ATT'>): PlayerCardData => {
    for (const target of bucketTargets) {
      const idx = remaining.findIndex((p) => resolveStreetLineBucket(p) === target);
      if (idx >= 0) return remaining.splice(idx, 1)[0];
    }
    return remaining.shift() || keeper;
  };

  const slotPreferences: Array<{ index: number; prefs: Array<'DEF' | 'MID' | 'ATT'> }> = [
    { index: 1, prefs: ['DEF', 'MID', 'ATT'] },
    { index: 2, prefs: ['DEF', 'MID', 'ATT'] },
    { index: 3, prefs: ['MID', 'DEF', 'ATT'] },
    { index: 4, prefs: ['MID', 'ATT', 'DEF'] },
    { index: 5, prefs: ['ATT', 'MID', 'DEF'] },
    { index: 6, prefs: ['ATT', 'MID', 'DEF'] },
  ];

  for (const { index, prefs } of slotPreferences) {
    if (!assigned[index]) {
      assigned[index] = pickBestMatch(prefs);
    }
  }

  return STREET_1_2_2_2_SLOTS.map((slotSpec, idx) => {
    const basePlayer = assigned[idx] || keeper;
    const outfit = basePlayer.streetOutfit?.paletteGroup === paletteGroup
      ? basePlayer.streetOutfit
      : generateStreetwearOutfit(paletteGroup, rng);
    const playerWithOutfit: PlayerCardData = {
      ...basePlayer,
      streetOutfit: outfit,
    };
    return {
      slotNumber: idx + 1,
      role: slotSpec.role,
      streetRole: slotSpec.streetRole,
      subPosition: slotSpec.subPosition,
      xPercent: Math.round(slotSpec.x * 100),
      yPercent: Math.round(slotSpec.y * 100),
      player: playerWithOutfit,
      isUserPlayer: Boolean(userPlayerCard && playerWithOutfit.id === userPlayerCard.id),
      isCaptain: playerWithOutfit.id === captainPlayerId,
      streetOutfit: outfit,
    };
  });
}

function buildStreetEditorTeam(
  id: string,
  name: string,
  shortName: string,
  descriptor: StreetCityDescriptor,
  kit: KitConfig,
  slots: StreetAssignedSlot[],
  stadium: StadiumDefinition,
  captainId: string
): EditorTeamData {
  const avgOvr =
    slots.length > 0
      ? Math.round(slots.reduce((sum, s) => sum + getStreetPlayerOvr(s.player), 0) / slots.length)
      : 68;

  const squadSlots: SquadSlot[] = slots.map((s) => ({
    slotNumber: s.slotNumber,
    player: s.player,
    assignedRole: s.streetRole,
    shirtNumber: s.player.shirtNumber || s.player.number || s.slotNumber,
    xPercent: s.xPercent,
    yPercent: s.yPercent,
  }));

  const creatorSlot = slots.find((s) => s.streetRole === 'MID1') || slots[3] || slots[0];
  const strikerSlot = slots.find((s) => s.streetRole === 'ATT1') || slots[5] || slots[0];

  return {
    id,
    name,
    shortName,
    countryCode: descriptor.countryCodes[0] as EditorTeamData['countryCode'],
    countryName: descriptor.countryName,
    emblem: {
      shape: 'star-shield',
      mode: '2',
      color1: kit.color1,
      color2: kit.color2,
    },
    kit,
    overallRating: avgOvr,
    ovr: avgOvr,
    reputation: avgOvr,
    captainPlayerId: captainId,
    tacticalRoles: {
      captainId,
      freeKickNearId: creatorSlot?.player.id || captainId,
      freeKickLongId: creatorSlot?.player.id || captainId,
      penaltyTakerId: strikerSlot?.player.id || captainId,
      leftCornerTakerId: creatorSlot?.player.id || captainId,
      rightCornerTakerId: slots.find((s) => s.streetRole === 'MID2')?.player.id || creatorSlot?.player.id || captainId,
    },
    keyRoles: {
      captainPlayerId: captainId,
      creatorPlayerId: creatorSlot?.player.id || captainId,
      goalscorerPlayerId: strikerSlot?.player.id || captainId,
    },
    stadium: {
      name: stadium.name,
      capacity: 0,
      tier: 1,
      gameplayStadiumId: stadium.id,
    },
    manager: {
      name: `${descriptor.cityName} Street Boss`,
      nationality: descriptor.countryCodes[0] as EditorTeamData['countryCode'],
      age: 34,
      hasSecondaryTactic: false,
      primaryTactic: {
        formation: '4-4-2',
        style: 'possession',
        playstyle: 'jogobonito',
        defensiveLine: 3,
        defensiveStyle: 'mixed',
        offsideTrap: 'NO',
        compactness: 2,
        passingStyle: 'short',
        finalThirdApproach: 'secure',
        teamShape: 'free',
        attackingSupport: 'all_attack',
        positions: slots.map((s) => {
          const roleCoords: Record<
            StreetRoleLabel,
            { role: 'GK' | 'CB' | 'CM' | 'ST'; zoneRow: number; zoneCol: number }
          > = {
            GK: { role: 'GK', zoneRow: 9, zoneCol: 1 },
            DEF1: { role: 'CB', zoneRow: 7, zoneCol: 0 },
            DEF2: { role: 'CB', zoneRow: 7, zoneCol: 2 },
            MID1: { role: 'CM', zoneRow: 4, zoneCol: 0 },
            MID2: { role: 'CM', zoneRow: 4, zoneCol: 2 },
            ATT1: { role: 'ST', zoneRow: 1, zoneCol: 0 },
            ATT2: { role: 'ST', zoneRow: 1, zoneCol: 2 },
          };
          const mapped = roleCoords[s.streetRole];
          return {
            slotId: String(s.slotNumber),
            role: mapped.role,
            playstyle: 'Balanced',
            zoneRow: mapped.zoneRow,
            zoneCol: mapped.zoneCol,
          };
        }),
      },
    },
    squadSaveFile: {
      squad: squadSlots,
      reserves: [],
      u20: [],
      u17: [],
    },
  };
}

function selectHighestOvrCaptainId(players: PlayerCardData[]): string {
  if (players.length === 0) return '';
  let best = players[0];
  let bestOvr = getStreetPlayerOvr(best);
  for (let i = 1; i < players.length; i++) {
    const cur = players[i];
    const curOvr = getStreetPlayerOvr(cur);
    if (curOvr > bestOvr) {
      best = cur;
      bestOvr = curOvr;
    }
  }
  return best.id;
}

/**
 * HOTFIX PHASE A9 Street 7v7 Builder:
 * - Pools City Youth + Country D1 & D2 (`squad`, `reserves`, `u20`, `u17`).
 * - Kick Off: Anchors Home & Away Captains (supplied from Top-15 cinematic for human sides,
 *   or auto-picked from Top-15 for CPU sides) and draws 6 positional teammates per side
 *   strictly discounting each captain's position from [1 GK, 2 DEF, 2 MID, 2 ATT].
 * - Unique Career: Places user player directly into Home (skipping captain cinematic),
 *   discounts user's position from the 6 Home draws, CPU Away auto-picks Top-15 captain + 6,
 *   and assigns captaincy to the highest-OVR player on the team (not forcing the user).
 * - Outfits: Home wears randomized white/bright streetwear; Away wears randomized dark streetwear.
 */
export function buildStreetMatchTeams(
  cityIdOrName?: string,
  leagueDb?: LeagueDatabase | null,
  userPlayer?: PlayerCardData | PlayerConfig | null,
  options?: StreetMatchBuildOptions
): StreetMatchBuildResult {
  const { rng, nonce } = createStreetRng(options?.seed);
  const userCard = userPlayer ? toPlayerCardData(userPlayer) : undefined;
  const userAge = userCard?.age && userCard.age <= 16 ? userCard.age : options?.age || 16;

  const { descriptor, pool, stats } = collectStreetCityPlayerPool(cityIdOrName, leagueDb, {
    age: userAge,
    excludePlayer: userCard,
  });

  const stadium = resolveStreetStadiumForCity(descriptor.cityId);
  const availablePool = shuffleWithRng(pool, rng).map((entry) => entry.player);

  const removePlayerById = (targetId: string): PlayerCardData | undefined => {
    const idx = availablePool.findIndex((p) => p.id === targetId);
    if (idx >= 0) return availablePool.splice(idx, 1)[0];
    return undefined;
  };

  const pickTop15RandomCaptain = (): PlayerCardData => {
    if (availablePool.length === 0) {
      return synthesizeStreetPlayerFallback(descriptor.cityId, descriptor.countryName, 'MID', 501, rng);
    }
    const top15 = [...availablePool]
      .sort((a, b) => {
        const diff = getStreetPlayerOvr(b) - getStreetPlayerOvr(a);
        if (diff !== 0) return diff;
        return a.id.localeCompare(b.id);
      })
      .slice(0, Math.min(15, availablePool.length));
    const chosen = top15[Math.floor(rng() * top15.length)] || top15[0];
    return removePlayerById(chosen.id) || chosen;
  };

  let homeSevenRaw: PlayerCardData[];
  let awaySevenRaw: PlayerCardData[];
  let homeCaptainId: string;
  let awayCaptainId: string;
  let drawnPlayers13: PlayerCardData[];
  let bonusPlayer: PlayerCardData | undefined;

  if (userCard) {
    // Unique Career Street: User takes 1 Home slot (no captain draw cinematic); Away CPU auto-picks Top-15 captain before teammate drafts.
    const homeAnchor = userCard;
    const awayAnchor =
      (options?.awayCaptain && removePlayerById(options.awayCaptain.id)) ||
      options?.awayCaptain ||
      pickTop15RandomCaptain();

    const homeTeammates6 = drawPositionalSixTeammates(
      availablePool,
      homeAnchor,
      rng,
      descriptor.cityId,
      descriptor.countryName,
      10
    );
    const awayTeammates6 = drawPositionalSixTeammates(
      availablePool,
      awayAnchor,
      rng,
      descriptor.cityId,
      descriptor.countryName,
      20
    );

    homeSevenRaw = [homeAnchor, ...homeTeammates6];
    awaySevenRaw = [awayAnchor, ...awayTeammates6];
    drawnPlayers13 = [...homeTeammates6, awayAnchor, ...awayTeammates6];

    // Unique Career: Captaincy belongs strictly to the highest-OVR player on the team (do NOT force user)
    homeCaptainId = selectHighestOvrCaptainId(homeSevenRaw);
    awayCaptainId = selectHighestOvrCaptainId(awaySevenRaw);
  } else {
    // Kick Off Street: Human sides supply chosen Top-15 captain; CPU sides auto-pick randomly from Top 15 before teammate draws
    const resolvedHomeCaptain =
      (options?.homeCaptain && (removePlayerById(options.homeCaptain.id) || options.homeCaptain)) ||
      pickTop15RandomCaptain();

    const resolvedAwayCaptain =
      (options?.awayCaptain &&
        options.awayCaptain.id !== resolvedHomeCaptain.id &&
        (removePlayerById(options.awayCaptain.id) || options.awayCaptain)) ||
      pickTop15RandomCaptain();

    const homeTeammates6 = drawPositionalSixTeammates(
      availablePool,
      resolvedHomeCaptain,
      rng,
      descriptor.cityId,
      descriptor.countryName,
      10
    );

    const awayTeammates6 = drawPositionalSixTeammates(
      availablePool,
      resolvedAwayCaptain,
      rng,
      descriptor.cityId,
      descriptor.countryName,
      20
    );

    homeSevenRaw = [resolvedHomeCaptain, ...homeTeammates6];
    awaySevenRaw = [resolvedAwayCaptain, ...awayTeammates6];
    bonusPlayer = resolvedHomeCaptain;
    drawnPlayers13 = [...homeTeammates6, resolvedAwayCaptain, ...awayTeammates6];
    homeCaptainId = resolvedHomeCaptain.id;
    awayCaptainId = resolvedAwayCaptain.id;
  }

  const matchPlayers14 = [...homeSevenRaw, ...awaySevenRaw].slice(0, 14);

  const bibIdx =
    options?.bibPairIndex !== undefined
      ? Math.abs(options.bibPairIndex) % STREETWEAR_BIB_PAIRS.length
      : Math.floor(rng() * STREETWEAR_BIB_PAIRS.length);
  const bibPair = STREETWEAR_BIB_PAIRS[bibIdx];

  // Home always wears Light/Bright Streetwear; Away always wears Dark Streetwear
  const homeSlots = assignSevenPlayersTo1222(homeSevenRaw, 'light', rng, homeCaptainId, userCard);
  const awaySlots = assignSevenPlayersTo1222(awaySevenRaw, 'dark', rng, awayCaptainId);

  const homeTeamName = descriptor.streetTeamNames[0];
  const awayTeamName = descriptor.streetTeamNames[1];
  const homeShort = `${descriptor.cityName.slice(0, 2).toUpperCase()}1`;
  const awayShort = `${descriptor.cityName.slice(0, 2).toUpperCase()}2`;

  const homeEditorTeam = buildStreetEditorTeam(
    `street_${descriptor.cityId}_home_${nonce}`,
    homeTeamName,
    homeShort,
    descriptor,
    bibPair.homeKit,
    homeSlots,
    stadium,
    homeCaptainId
  );

  const awayEditorTeam = buildStreetEditorTeam(
    `street_${descriptor.cityId}_away_${nonce}`,
    awayTeamName,
    awayShort,
    descriptor,
    bibPair.awayKit,
    awaySlots,
    stadium,
    awayCaptainId
  );

  return {
    cityId: descriptor.cityId,
    cityName: descriptor.cityName,
    countryName: descriptor.countryName,
    stadium,
    drawnPlayers13,
    bonusPlayer,
    matchPlayers14,
    homeSlots,
    awaySlots,
    homeEditorTeam,
    awayEditorTeam,
    homeCaptainId,
    awayCaptainId,
    bibPair,
    lockedPlayerId: userCard?.id,
    sourceStats: stats,
    drawNonce: nonce,
  };
}

