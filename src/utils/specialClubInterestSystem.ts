import { PlayerCardData, AccountingState, ManagerState } from '../types';
import {
  SpecialClubId,
  SpecialClubConfig,
  SpecialClubEvaluation,
  SpecialClubChoiceEventData,
  PlayerSpecialClubState,
  SpecialClubInterestDecay,
} from '../types/specialClubInterest';
import { ProClubDefinition, getProClubsFromDatabase } from './earlyCareerSystem';
import { UnifiedClubOffer } from './clubOfferSystem';
import { calculateRealisticPlayerMarketValue } from './clubEconomySystem';
import { getClubDevelopmentTier } from './clubDevelopmentEngine';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';

export const SPECIAL_CLUBS_CONFIG: Record<SpecialClubId, SpecialClubConfig> = {
  real_madrid: {
    id: 'real_madrid',
    name: 'Blancos CF',
    shortName: 'Blancos CF',
    country: 'Spain',
    countryCode: 'ESP',
    leagueName: 'Spanish League',
    category: 'big_three',
    primaryColor: '#ffffff',
    badgeBg: 'from-amber-400 via-blue-900 to-slate-950',
    flag: '🇪🇸',
    minOvr: 90,
    minFame: 500,
    requiresStarter: true,
    keyLeaders: 'Club President & Board of Directors',
    leaderTitle: 'President of Blancos CF',
    managerName: 'Carlo Ancelotti',
    managerNationality: 'ITA',
    formation: '4-3-3 Attacking',
    tacticalStyle: 'Direct Attacking & Galáctico Freedom',
    legacyPitch: 'The undisputed kings of European football with 15+ European Cups. Wearing the white shirt guarantees global sporting immortality and the primary runway to the Ballon d’Or.',
    financialTier: 'Global Elite',
    estimatedSalaryRange: { min: 28000000, max: 42000000 },
    signingBonusPct: 0.20,
    presidentialQuote: 'At Blancos CF, we do not ask if you can win; we show you where your European Cups will be displayed. This club was built for the greatest players in history.',
  },
  barcelona: {
    id: 'barcelona',
    name: 'Catalunya FC',
    shortName: 'Catalunya FC',
    country: 'Spain',
    countryCode: 'ESP',
    leagueName: 'Spanish League',
    category: 'big_three',
    primaryColor: '#a50044',
    badgeBg: 'from-blue-700 via-rose-700 to-amber-500',
    flag: '🇪🇸',
    minOvr: 90,
    minFame: 500,
    requiresStarter: true,
    keyLeaders: 'Club President & Sporting Director',
    leaderTitle: 'President & Sporting Director',
    managerName: 'Hansi Flick',
    managerNationality: 'GER',
    formation: '4-2-3-1 / 4-3-3',
    tacticalStyle: 'High-Line Pressing & Positional Tiki-Taka',
    legacyPitch: 'Més que un club. The cathedral of aesthetic football, iconic midfield mastery, and legendary heritage. You will lead the new golden era in Catalonia.',
    financialTier: 'Global Elite',
    estimatedSalaryRange: { min: 26000000, max: 39000000 },
    signingBonusPct: 0.18,
    presidentialQuote: 'Catalunya FC is passion, artistry, and eternal football heritage. We want you to wear the Blaugrana and become the benchmark of global excellence.',
  },
  bayern_munich: {
    id: 'bayern_munich',
    name: 'Bavaria Rot FC',
    shortName: 'Bavaria Rot FC',
    country: 'Germany',
    countryCode: 'GER',
    leagueName: 'German League',
    category: 'big_three',
    primaryColor: '#dc052d',
    badgeBg: 'from-red-700 via-red-900 to-blue-900',
    flag: '🇩🇪',
    minOvr: 90,
    minFame: 500,
    requiresStarter: true,
    keyLeaders: 'Supervisory Board & Club Icons',
    leaderTitle: 'Supervisory Board & Club Icons',
    managerName: 'Vincent Kompany',
    managerNationality: 'BEL',
    formation: '4-2-3-1 Dominant',
    tacticalStyle: 'Mia San Mia Ruthless Pressing & Power Football',
    legacyPitch: 'The absolute pinnacle of German football powerhouse discipline, non-stop trophies, and relentless European contenders. Guaranteed silverware every single season.',
    financialTier: 'Global Elite',
    estimatedSalaryRange: { min: 25000000, max: 37000000 },
    signingBonusPct: 0.18,
    presidentialQuote: 'At Bavaria Rot FC, second place is never enough. We command absolute excellence, respect, and ruthless domination across Europe.',
  },
  psg: {
    id: 'psg',
    name: 'Bleus de Paris',
    shortName: 'Bleus de Paris',
    country: 'France',
    countryCode: 'FRA',
    leagueName: 'French League',
    category: 'psg',
    primaryColor: '#004170',
    badgeBg: 'from-blue-900 via-red-600 to-slate-950',
    flag: '🇫🇷',
    minOvr: 87,
    minPotential: 90,
    minFame: 400,
    requiresStarter: true,
    keyLeaders: 'Club President & Head Coach',
    leaderTitle: 'President & Head Coach',
    managerName: 'Luis Enrique',
    managerNationality: 'ESP',
    formation: '4-3-3 Fluid',
    tacticalStyle: 'Total Possession, High Tempo & Dynamic Wings',
    legacyPitch: 'The glittering jewel of Paris. Unmatched financial power, astronomical wage packages, and supreme lifestyle in the fashion capital of the world as the undisputed superstar.',
    financialTier: 'Generational Wealth',
    estimatedSalaryRange: { min: 38000000, max: 55000000 },
    signingBonusPct: 0.25,
    presidentialQuote: 'Paris is waiting for its ultimate football king. We have the resources, the city, and the ambitions to give you anything you desire.',
  },
  manchester_united: {
    id: 'manchester_united',
    name: 'Red Devils United',
    shortName: 'Red Devils United',
    country: 'England',
    countryCode: 'ENG',
    leagueName: 'English League',
    category: 'big_six',
    primaryColor: '#da291c',
    badgeBg: 'from-red-700 via-red-950 to-amber-500',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    minOvr: 0,
    minFame: 300,
    requiresStarter: true,
    keyLeaders: 'Co-Owner & Executive Leadership',
    leaderTitle: 'Co-Owner & Executive Leadership',
    managerName: 'Erik ten Hag',
    managerNationality: 'NED',
    formation: '4-2-3-1',
    tacticalStyle: 'High-Octane Transition & Red Devils Heritage',
    legacyPitch: 'The Theatre of Dreams. Rebuilding the Red Devils empire to reclaim the English throne and European dominance.',
    financialTier: 'English League Powerhouse',
    estimatedSalaryRange: { min: 18000000, max: 32000000 },
    signingBonusPct: 0.20,
    presidentialQuote: 'Red Devils United is an obsession for over a billion people. Step onto the Theatre of Dreams pitch and become immortal.',
    stadiumName: 'Old Trafford',
    clubMotto: 'Youth, Courage, Greatness',
    historicLegends: ['Club Legends of Manchester', 'Continental Greats'],
  },
  liverpool: {
    id: 'liverpool',
    name: 'Mersey Reds FC',
    shortName: 'Mersey Reds',
    country: 'England',
    countryCode: 'ENG',
    leagueName: 'English League',
    category: 'big_six',
    primaryColor: '#c8102e',
    badgeBg: 'from-red-700 via-teal-900 to-slate-950',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    minOvr: 0,
    minFame: 300,
    requiresStarter: true,
    keyLeaders: 'CEO of Football & Sporting Director',
    leaderTitle: 'CEO of Football & Sporting Director',
    managerName: 'Arne Slot',
    managerNationality: 'NED',
    formation: '4-3-3 / 4-2-3-1',
    tacticalStyle: 'Relentless High Pressing, Speed & Intensity',
    legacyPitch: 'Merseyside and the iconic Spion Kop. 6 European Cups and unmatched emotional power on European nights.',
    financialTier: 'English League Powerhouse',
    estimatedSalaryRange: { min: 17000000, max: 30000000 },
    signingBonusPct: 0.18,
    presidentialQuote: 'With Mersey Reds FC, passion is tangible. The roar of the Kop lifts players to heights no other club on earth can reach.',
    stadiumName: 'Anfield',
    clubMotto: 'You’ll Never Walk Alone',
    historicLegends: ['Bill Shankly', 'Bob Paisley', 'Steven Gerrard', 'Kenny Dalglish'],
  },
  arsenal: {
    id: 'arsenal',
    name: 'Gunners FC',
    shortName: 'Gunners FC',
    country: 'England',
    countryCode: 'ENG',
    leagueName: 'English League',
    category: 'big_six',
    primaryColor: '#ef0107',
    badgeBg: 'from-red-600 via-red-900 to-amber-400',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    minOvr: 0,
    minFame: 300,
    requiresStarter: true,
    keyLeaders: 'Co-Chair & Sporting Leadership',
    leaderTitle: 'Co-Chair & Board Executives',
    managerName: 'Mikel Arteta',
    managerNationality: 'ESP',
    formation: '4-3-3 Dynamic',
    tacticalStyle: 'Dominant Positional Football & High-Press Technical Control',
    legacyPitch: 'The legendary North London cannon. Technical purity, world-class youth progression, and the pursuit of a glorious new English League era.',
    financialTier: 'English League Powerhouse',
    estimatedSalaryRange: { min: 16000000, max: 28000000 },
    signingBonusPct: 0.18,
    presidentialQuote: 'Gunners FC stands for class, tradition, and visionary football. We are crafting a young, fearless machine that will rule English football for the next decade.',
    stadiumName: 'Emirates Stadium',
    clubMotto: 'Victoria Concordia Crescit',
    historicLegends: ['Arsène Wenger', 'Thierry Henry', 'Dennis Bergkamp', 'Tony Adams'],
  },
  chelsea: {
    id: 'chelsea',
    name: 'London FC',
    shortName: 'London FC',
    country: 'England',
    countryCode: 'ENG',
    leagueName: 'English League',
    category: 'big_six',
    primaryColor: '#034694',
    badgeBg: 'from-blue-700 via-blue-950 to-amber-400',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    minOvr: 0,
    minFame: 300,
    requiresStarter: true,
    keyLeaders: 'Chairman & Sporting Directors',
    leaderTitle: 'Chairman & Football Operations',
    managerName: 'Enzo Maresca',
    managerNationality: 'ITA',
    formation: '4-2-3-1 / 4-3-3',
    tacticalStyle: 'High-Tempo Modern Possession & London Swagger',
    legacyPitch: 'West London in the heart of the capital. European Winners League triumph, relentless ambition, and world-class investment to build a ruthless winning juggernaut.',
    financialTier: 'English League Powerhouse',
    estimatedSalaryRange: { min: 16000000, max: 29000000 },
    signingBonusPct: 0.19,
    presidentialQuote: 'We build for serial winners. At London FC, there is only one standard: lifting trophies and commanding the European stage.',
    stadiumName: 'Stamford Bridge',
    clubMotto: 'Pride of London',
    historicLegends: ['Frank Lampard', 'Didier Drogba', 'John Terry', 'Petr Čech'],
  },
  manchester_city: {
    id: 'manchester_city',
    name: 'Eastlands Sky Blues City',
    shortName: 'Eastlands City',
    country: 'England',
    countryCode: 'ENG',
    leagueName: 'English League',
    category: 'big_six',
    primaryColor: '#6cabdd',
    badgeBg: 'from-sky-500 via-blue-900 to-slate-950',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    minOvr: 0,
    minFame: 300,
    requiresStarter: true,
    keyLeaders: 'Chairman & Director of Football',
    leaderTitle: 'Chairman & Director of Football',
    managerName: 'Pep Guardiola',
    managerNationality: 'ESP',
    formation: '4-3-3 / 3-2-4-1',
    tacticalStyle: 'Total Positional Mastery, Overloads & Ruthless Tactical Control',
    legacyPitch: 'The standard-bearers of modern football dominance. Treble winners, tactical perfection, an elite squad of masters, and unmatched serial championship pedigree.',
    financialTier: 'English League Powerhouse',
    estimatedSalaryRange: { min: 20000000, max: 35000000 },
    signingBonusPct: 0.20,
    presidentialQuote: 'We don’t just compete to win trophies; we redefine how the sport is played. If you want tactical perfection and guaranteed glory, Eastlands Sky Blues City is your home.',
    stadiumName: 'Etihad Stadium',
    clubMotto: 'Superbia in Proelio',
    historicLegends: ['Pep Guardiola', 'Sergio Agüero', 'Vincent Kompany', 'David Silva'],
  },
  tottenham_hotspur: {
    id: 'tottenham_hotspur',
    name: 'Lilywhites Hotspur',
    shortName: 'Lilywhites',
    country: 'England',
    countryCode: 'ENG',
    leagueName: 'English League',
    category: 'big_six',
    primaryColor: '#132257',
    badgeBg: 'from-blue-950 via-slate-900 to-amber-300',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    minOvr: 0,
    minFame: 300,
    requiresStarter: true,
    keyLeaders: 'Chairman & Technical Board',
    leaderTitle: 'Chairman & Technical Director',
    managerName: 'Ange Postecoglou',
    managerNationality: 'AUS',
    formation: '4-3-3 High Line',
    tacticalStyle: 'Brave, Relentless Attacking Football & Inverted Overloads',
    legacyPitch: 'Audere est Facere (To Dare Is To Do). World-class stadium infrastructure, brave breathless attacking identity, and leading North London to historic glory.',
    financialTier: 'English League Powerhouse',
    estimatedSalaryRange: { min: 14000000, max: 25000000 },
    signingBonusPct: 0.17,
    presidentialQuote: 'We have the finest stadium and infrastructure in world sport. We need the talisman who will bring silverware to Lilywhites Hotspur and etch their name into folklore forever.',
    stadiumName: 'Tottenham Hotspur Stadium',
    clubMotto: 'Audere est Facere',
    historicLegends: ['Bill Nicholson', 'Jimmy Greaves', 'Glenn Hoddle', 'Harry Kane'],
  },
  saudi_pro_league: {
    id: 'saudi_pro_league',
    name: 'Riyadh Blue Crescent SFC',
    shortName: 'Riyadh Blue Crescent',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    leagueName: 'Saudi League',
    category: 'saudi',
    primaryColor: '#0054a6',
    badgeBg: 'from-blue-600 via-teal-700 to-emerald-950',
    flag: '🇸🇦',
    minOvr: 85,
    minFame: 300,
    requiresStarter: false,
    keyLeaders: 'Sovereign Wealth Representatives & Royal Emissaries',
    leaderTitle: 'Kingdom Sports Emissaries',
    managerName: 'Jorge Jesus',
    managerNationality: 'POR',
    formation: '4-3-3 Offensive',
    tacticalStyle: 'Fluid Attacking & Marquee Superstar Domination',
    legacyPitch: 'Unfathomable tax-free generational wealth, private jets, custom palace living, and status as a global ambassador of the Kingdom’s multi-billion dollar football revolution.',
    financialTier: 'Royal Treasury',
    estimatedSalaryRange: { min: 65000000, max: 120000000 },
    signingBonusPct: 0.25,
    presidentialQuote: 'We do not negotiate on conventional limits. We will secure your family’s fortune for generations, provide world-class luxury, and make you a cultural icon across the Middle East.',
  },
};

/**
 * Normalizes club name to match special club identity
 */
export function matchSpecialClubId(clubNameOrId?: string, countryCode?: string): SpecialClubId | null {
  if (!clubNameOrId) return null;
  const name = clubNameOrId.toLowerCase().trim();
  const cc = (countryCode || '').toUpperCase().trim();

  // Explicit cross-country collision exclusions FIRST
  if (
    name === 'arg_arsenal' ||
    name.includes('sarand') ||
    name.includes('viaducto') ||
    name.includes('guayaquil') ||
    name.includes('astillero') ||
    name.includes('belvedere') ||
    name.includes('cuchilla') ||
    name.includes('montevideo') ||
    name === 'conmebol_barcelona_sc' ||
    name === 'conmebol_liverpool_mvd' ||
    (cc && cc !== 'ENG' && (name === 'arsenal' || name === 'arsenal fc' || name === 'liverpool' || name === 'liverpool fc')) ||
    (cc && cc !== 'ESP' && (name === 'barcelona' || name === 'fc barcelona' || name === 'barcelona sc'))
  ) {
    return null;
  }

  if (
    name.includes('blancos cf') ||
    name.includes('real madrid') ||
    name.includes('madrid cf') ||
    name === 'real_madrid' ||
    name === 'esp_realmadrid'
  ) {
    return 'real_madrid';
  }
  if (
    name.includes('catalunya fc') ||
    name.includes('barcelona') ||
    name.includes('barça') ||
    name === 'barcelona' ||
    name === 'esp_barcelona'
  ) {
    return 'barcelona';
  }
  if (
    name.includes('bavaria rot') ||
    name.includes('bayern') ||
    name.includes('münchen') ||
    name.includes('munich') ||
    name === 'bayern_munich' ||
    name === 'ger_bayern'
  ) {
    return 'bayern_munich';
  }
  if (
    name.includes('bleus de paris') ||
    name.includes('paris saint') ||
    name.includes('psg') ||
    name === 'psg' ||
    name === 'fr_psg'
  ) {
    return 'psg';
  }
  if (
    name.includes('red devils united') ||
    name.includes('manchester united') ||
    name.includes('man united') ||
    name.includes('man utd') ||
    name === 'manchester_united' ||
    name === 'man_united' ||
    name === 'eng_manutd'
  ) {
    return 'manchester_united';
  }
  if (
    name.includes('mersey reds') ||
    name.includes('liverpool') ||
    name.includes('lfc') ||
    name === 'liverpool' ||
    name === 'eng_liverpool'
  ) {
    return 'liverpool';
  }
  if (
    name.includes('gunners fc') ||
    name.includes('gunners') ||
    name === 'arsenal' ||
    name === 'arsenal fc' ||
    name === 'eng_arsenal'
  ) {
    return 'arsenal';
  }
  if (
    name === 'london fc' ||
    name.includes('chelsea') ||
    name === 'chelsea' ||
    name === 'eng_chelsea'
  ) {
    return 'chelsea';
  }
  if (
    name.includes('eastlands sky blues') ||
    name.includes('manchester city') ||
    name.includes('man city') ||
    name === 'manchester_city' ||
    name === 'man_city' ||
    name === 'eng_mancity'
  ) {
    return 'manchester_city';
  }
  if (
    name.includes('lilywhites hotspur') ||
    name.includes('tottenham') ||
    name.includes('spurs') ||
    name === 'tottenham_hotspur' ||
    name === 'tottenham' ||
    name === 'eng_tottenham'
  ) {
    return 'tottenham_hotspur';
  }
  if (
    name.includes('riyadh blue crescent') ||
    name.includes('najd knights') ||
    name.includes('jeddah tigers') ||
    name.includes('red sea royal') ||
    name.includes('al-hilal') ||
    name.includes('al hilal') ||
    name.includes('al-nassr') ||
    name.includes('al nassr') ||
    name.includes('al-ittihad') ||
    name.includes('saudi') ||
    name === 'saudi_pro_league' ||
    name.startsWith('sau_')
  ) {
    return 'saudi_pro_league';
  }

  return null;
}

/**
 * STRICT SPECIAL-CLUB EXCLUSION FILTER (Zero Leaks)
 * Blancos CF, Catalunya FC, Bavaria Rot FC, Bleus de Paris, EPL Big Six, and Saudi clubs must NEVER appear in:
 * - Age 16 transfer offers
 * - Any ordinary offer generator (e.g. Agent "Find me a new team", standard transfer market, etc.)
 * These clubs must ONLY be accessible through the Special Interest Event system.
 */
export function isSpecialClubOfferExcluded(
  club: {
    id?: string;
    clubName?: string;
    name?: string;
    countryCode?: string;
    countryName?: string;
    leagueName?: string;
    leagueId?: string;
    leagueTier?: number;
  },
  player?: Partial<PlayerCardData>
): boolean {
  if (!club) return false;
  if (club.id === 'arg_arsenal') {
    // Argentine Arsenal is a normal Primera División club, NOT English Gunners FC
    return false;
  }
  const clubName = (club.clubName || club.name || club.id || '').trim();
  const id = matchSpecialClubId(club.id, club.countryCode) || matchSpecialClubId(clubName, club.countryCode);
  // Global Giants, EPL Big 6, and Saudi marquee clubs are ALWAYS excluded from normal offers
  if (id) return true;

  // Saudi / Arabian club exclusions
  const cCode = (club.countryCode || '').toUpperCase();
  if (cCode === 'KSA' || cCode === 'SAU' || cCode === 'SA') return true;

  const cName = (club.countryName || '').toLowerCase();
  const lName = (club.leagueName || '').toLowerCase();
  const rawName = clubName.toLowerCase();

  if (
    cName.includes('saudi') ||
    cName.includes('arabia') ||
    lName.includes('saudi') ||
    lName.includes('roshn') ||
    lName.includes('spl')
  ) {
    return true;
  }

  // Any explicit Saudi / Arabian club names (legacy + generic)
  if (
    rawName.includes('riyadh blue crescent') ||
    rawName.includes('najd knights') ||
    rawName.includes('jeddah tigers') ||
    rawName.includes('red sea royal') ||
    rawName.includes('diriyah white lions') ||
    rawName.includes('dammam knights') ||
    rawName.includes('khobar crimson') ||
    rawName.includes('qassim wolves') ||
    rawName.includes('al-ahsa palm') ||
    rawName.includes('sudair orange') ||
    rawName.includes('saihat gulf eagles') ||
    rawName.includes('buraidah pioneers') ||
    rawName.includes('khamis mountains') ||
    rawName.includes('hijaz red knights') ||
    rawName.includes('najran citadel') ||
    rawName.includes('al-batha capital') ||
    rawName.includes('al-jawf north') ||
    rawName.includes('ar-rass desert') ||
    rawName.includes('al-hilal') ||
    rawName.includes('al hilal') ||
    rawName.includes('al-nassr') ||
    rawName.includes('al nassr') ||
    rawName.includes('al-ittihad') ||
    rawName.includes('al ittihad') ||
    rawName.includes('al-ahli') ||
    rawName.includes('al ahli') ||
    rawName.includes('al-shabab') ||
    rawName.includes('al shabab') ||
    rawName.includes('al-ettifaq') ||
    rawName.includes('al ettifaq') ||
    rawName.includes('al-fateh') ||
    rawName.includes('al-taawoun') ||
    rawName.includes('al-khaleej') ||
    rawName.includes('al-wehda') ||
    rawName.includes('al-raed') ||
    rawName.includes('al-hazem') ||
    rawName.includes('damac') ||
    rawName.includes('abha') ||
    rawName.includes('al-akhdoud') ||
    rawName.includes('al-riyadh') ||
    rawName.includes('al-qadsiah') ||
    rawName.includes('saudi')
  ) {
    return true;
  }

  // English Premier League Tier 1 Gating:
  // EPL clubs must NOT appear in normal offers until player has received the EPL signing event!
  const isEPLClub =
    club.leagueId === 'england_d1' ||
    ((cCode === 'ENG' || cName.includes('england')) &&
      (lName.includes('premier') || lName.includes('epl') || club.leagueTier === 1 || club.id?.startsWith('eng_')));

  if (isEPLClub) {
    if (!player || !isEplOfferAllowedForPlayer(player)) {
      return true; // Exclude EPL clubs until EPL signing event is received!
    }
  }

  return false;
}

/**
 * Checks whether normal EPL club offers are permissible for the player.
 * Only permitted if player has received the EPL Signing Event or is already playing in England.
 */
export function isEplOfferAllowedForPlayer(player?: Partial<PlayerCardData>): boolean {
  if (!player) return false;
  const alreadyInEngland =
    (player.league || '').toLowerCase().includes('premier') ||
    (player.countryCode || '').toUpperCase() === 'ENG' ||
    ((player as any).clubCountry || '').toLowerCase().includes('england');
  return Boolean((player as any).eplSigningEventUnlocked || alreadyInEngland);
}

/**
 * 1. SPECIAL INTEREST REQUIREMENTS CHECK
 *
 * Big 3 (Bayern Munich, Real Madrid, Barcelona):
 * - 90+ OVR AND better than one of their starters
 *
 * PSG:
 * - 87+ OVR AND better than one of their starters
 *
 * Big 6 EPL:
 * - Better than their starter in player's position/sub-position
 *
 * Saudi Arabia:
 * - 85+ OVR
 */
export const SPECIAL_CLUB_DATABASE_IDS: Record<SpecialClubId, string> = {
  real_madrid: 'esp_realmadrid',
  barcelona: 'esp_barcelona',
  bayern_munich: 'ger_bayern',
  psg: 'fr_psg',
  manchester_united: 'eng_manutd',
  liverpool: 'eng_liverpool',
  arsenal: 'eng_arsenal',
  chelsea: 'eng_chelsea',
  manchester_city: 'eng_mancity',
  tottenham_hotspur: 'eng_tottenham',
  saudi_pro_league: 'sau_alhilal',
};

export const SPECIAL_CLUBS_BENCHMARK_STARTERS: Record<
  SpecialClubId,
  {
    clubId: SpecialClubId;
    defaultStarterAvg: number;
    lowestStarterOvr: number;
    positionStarters: Record<string, number>;
  }
> = {
  real_madrid: {
    clubId: 'real_madrid',
    defaultStarterAvg: 88,
    lowestStarterOvr: 82,
    positionStarters: {
      GK: 89, CB: 87, LB: 82, RB: 86, CDM: 86, CM: 87, CAM: 90, LW: 90, RW: 86, ST: 91,
      target_man: 91, poacher: 91, complete_forward: 91, false_nine: 91, pressing_forward: 91,
      inside_forward: 90, inverted_winger: 88, traditional_winger: 86, wide_playmaker: 88,
      advanced_playmaker: 90, shadow_striker: 90, box_to_box: 87, deep_lying_playmaker: 87,
      mezzala: 87, ball_winning_midfielder: 86, holding_midfielder: 86, anchor_man: 86,
      ball_playing_defender: 87, no_nonsense_defender: 86, stopper: 86, cover_defender: 86,
      attacking_fullback: 84, inverted_fullback: 84, wingback: 84,
      sweeper_keeper: 89, traditional_keeper: 89, shot_stopper: 89,
    },
  },
  barcelona: {
    clubId: 'barcelona',
    defaultStarterAvg: 86,
    lowestStarterOvr: 82,
    positionStarters: {
      GK: 88, CB: 85, LB: 82, RB: 84, CDM: 84, CM: 86, CAM: 85, LW: 86, RW: 85, ST: 89,
      target_man: 89, poacher: 89, complete_forward: 89, false_nine: 87, pressing_forward: 87,
      inside_forward: 86, inverted_winger: 85, traditional_winger: 85, wide_playmaker: 86,
      advanced_playmaker: 86, shadow_striker: 85, box_to_box: 86, deep_lying_playmaker: 86,
      mezzala: 86, ball_winning_midfielder: 84, holding_midfielder: 84, anchor_man: 84,
      ball_playing_defender: 85, no_nonsense_defender: 84, stopper: 84, cover_defender: 84,
      attacking_fullback: 83, inverted_fullback: 83, wingback: 83,
      sweeper_keeper: 88, traditional_keeper: 88, shot_stopper: 88,
    },
  },
  bayern_munich: {
    clubId: 'bayern_munich',
    defaultStarterAvg: 86,
    lowestStarterOvr: 82,
    positionStarters: {
      GK: 87, CB: 85, LB: 83, RB: 86, CDM: 85, CM: 84, CAM: 88, LW: 84, RW: 85, ST: 90,
      target_man: 90, poacher: 90, complete_forward: 90, false_nine: 88, pressing_forward: 88,
      inside_forward: 85, inverted_winger: 85, traditional_winger: 84, wide_playmaker: 86,
      advanced_playmaker: 88, shadow_striker: 87, box_to_box: 84, deep_lying_playmaker: 85,
      mezzala: 84, ball_winning_midfielder: 85, holding_midfielder: 85, anchor_man: 85,
      ball_playing_defender: 85, no_nonsense_defender: 84, stopper: 84, cover_defender: 84,
      attacking_fullback: 84, inverted_fullback: 85, wingback: 84,
      sweeper_keeper: 87, traditional_keeper: 87, shot_stopper: 87,
    },
  },
  psg: {
    clubId: 'psg',
    defaultStarterAvg: 85,
    lowestStarterOvr: 81,
    positionStarters: {
      GK: 88, CB: 85, LB: 83, RB: 85, CDM: 86, CM: 83, CAM: 82, LW: 83, RW: 86, ST: 82,
      target_man: 82, poacher: 82, complete_forward: 83, false_nine: 83, pressing_forward: 82,
      inside_forward: 85, inverted_winger: 84, traditional_winger: 83, wide_playmaker: 84,
      advanced_playmaker: 83, shadow_striker: 83, box_to_box: 84, deep_lying_playmaker: 86,
      mezzala: 83, ball_winning_midfielder: 84, holding_midfielder: 86, anchor_man: 85,
      ball_playing_defender: 85, no_nonsense_defender: 84, stopper: 84, cover_defender: 84,
      attacking_fullback: 84, inverted_fullback: 84, wingback: 84,
      sweeper_keeper: 88, traditional_keeper: 88, shot_stopper: 88,
    },
  },
  manchester_city: {
    clubId: 'manchester_city',
    defaultStarterAvg: 87,
    lowestStarterOvr: 83,
    positionStarters: {
      GK: 88, CB: 88, LB: 83, RB: 83, CDM: 91, CM: 88, CAM: 90, LW: 88, RW: 88, ST: 91,
      target_man: 91, poacher: 91, complete_forward: 91, false_nine: 89, pressing_forward: 90,
      inside_forward: 88, inverted_winger: 88, traditional_winger: 86, wide_playmaker: 89,
      advanced_playmaker: 90, shadow_striker: 89, box_to_box: 88, deep_lying_playmaker: 90,
      mezzala: 88, ball_winning_midfielder: 91, holding_midfielder: 91, anchor_man: 91,
      ball_playing_defender: 88, no_nonsense_defender: 86, stopper: 86, cover_defender: 87,
      attacking_fullback: 84, inverted_fullback: 85, wingback: 84,
      sweeper_keeper: 88, traditional_keeper: 88, shot_stopper: 88,
    },
  },
  arsenal: {
    clubId: 'arsenal',
    defaultStarterAvg: 85,
    lowestStarterOvr: 82,
    positionStarters: {
      GK: 84, CB: 87, LB: 83, RB: 83, CDM: 87, CM: 85, CAM: 88, LW: 84, RW: 87, ST: 84,
      target_man: 84, poacher: 84, complete_forward: 84, false_nine: 85, pressing_forward: 85,
      inside_forward: 86, inverted_winger: 86, traditional_winger: 84, wide_playmaker: 87,
      advanced_playmaker: 88, shadow_striker: 86, box_to_box: 86, deep_lying_playmaker: 86,
      mezzala: 86, ball_winning_midfielder: 87, holding_midfielder: 87, anchor_man: 87,
      ball_playing_defender: 87, no_nonsense_defender: 86, stopper: 86, cover_defender: 86,
      attacking_fullback: 83, inverted_fullback: 84, wingback: 83,
      sweeper_keeper: 84, traditional_keeper: 84, shot_stopper: 84,
    },
  },
  liverpool: {
    clubId: 'liverpool',
    defaultStarterAvg: 85,
    lowestStarterOvr: 83,
    positionStarters: {
      GK: 89, CB: 89, LB: 84, RB: 86, CDM: 84, CM: 85, CAM: 84, LW: 84, RW: 89, ST: 84,
      target_man: 84, poacher: 84, complete_forward: 85, false_nine: 85, pressing_forward: 85,
      inside_forward: 88, inverted_winger: 86, traditional_winger: 84, wide_playmaker: 85,
      advanced_playmaker: 85, shadow_striker: 85, box_to_box: 85, deep_lying_playmaker: 86,
      mezzala: 85, ball_winning_midfielder: 84, holding_midfielder: 85, anchor_man: 84,
      ball_playing_defender: 88, no_nonsense_defender: 86, stopper: 86, cover_defender: 86,
      attacking_fullback: 85, inverted_fullback: 85, wingback: 85,
      sweeper_keeper: 89, traditional_keeper: 89, shot_stopper: 89,
    },
  },
  chelsea: {
    clubId: 'chelsea',
    defaultStarterAvg: 82,
    lowestStarterOvr: 79,
    positionStarters: {
      GK: 80, CB: 82, LB: 81, RB: 82, CDM: 83, CM: 83, CAM: 85, LW: 81, RW: 85, ST: 80,
      target_man: 80, poacher: 80, complete_forward: 81, false_nine: 82, pressing_forward: 81,
      inside_forward: 84, inverted_winger: 83, traditional_winger: 81, wide_playmaker: 84,
      advanced_playmaker: 85, shadow_striker: 84, box_to_box: 83, deep_lying_playmaker: 84,
      mezzala: 83, ball_winning_midfielder: 83, holding_midfielder: 83, anchor_man: 83,
      ball_playing_defender: 82, no_nonsense_defender: 81, stopper: 81, cover_defender: 81,
      attacking_fullback: 82, inverted_fullback: 82, wingback: 82,
      sweeper_keeper: 80, traditional_keeper: 80, shot_stopper: 80,
    },
  },
  manchester_united: {
    clubId: 'manchester_united',
    defaultStarterAvg: 82,
    lowestStarterOvr: 79,
    positionStarters: {
      GK: 82, CB: 83, LB: 81, RB: 81, CDM: 82, CM: 81, CAM: 87, LW: 82, RW: 81, ST: 80,
      target_man: 80, poacher: 80, complete_forward: 81, false_nine: 83, pressing_forward: 81,
      inside_forward: 82, inverted_winger: 82, traditional_winger: 81, wide_playmaker: 84,
      advanced_playmaker: 87, shadow_striker: 85, box_to_box: 82, deep_lying_playmaker: 83,
      mezzala: 82, ball_winning_midfielder: 82, holding_midfielder: 82, anchor_man: 82,
      ball_playing_defender: 83, no_nonsense_defender: 82, stopper: 82, cover_defender: 82,
      attacking_fullback: 81, inverted_fullback: 81, wingback: 81,
      sweeper_keeper: 82, traditional_keeper: 82, shot_stopper: 82,
    },
  },
  tottenham_hotspur: {
    clubId: 'tottenham_hotspur',
    defaultStarterAvg: 82,
    lowestStarterOvr: 80,
    positionStarters: {
      GK: 83, CB: 84, LB: 81, RB: 82, CDM: 81, CM: 82, CAM: 84, LW: 86, RW: 82, ST: 81,
      target_man: 81, poacher: 81, complete_forward: 82, false_nine: 83, pressing_forward: 82,
      inside_forward: 85, inverted_winger: 84, traditional_winger: 82, wide_playmaker: 83,
      advanced_playmaker: 84, shadow_striker: 84, box_to_box: 82, deep_lying_playmaker: 82,
      mezzala: 82, ball_winning_midfielder: 81, holding_midfielder: 81, anchor_man: 81,
      ball_playing_defender: 84, no_nonsense_defender: 82, stopper: 83, cover_defender: 83,
      attacking_fullback: 82, inverted_fullback: 82, wingback: 82,
      sweeper_keeper: 83, traditional_keeper: 83, shot_stopper: 83,
    },
  },
  saudi_pro_league: {
    clubId: 'saudi_pro_league',
    defaultStarterAvg: 77,
    lowestStarterOvr: 72,
    positionStarters: {
      GK: 80, CB: 78, LB: 74, RB: 76, CDM: 82, CM: 80, CAM: 82, LW: 84, RW: 82, ST: 85,
      target_man: 85, poacher: 85, complete_forward: 85, false_nine: 84, pressing_forward: 83,
      inside_forward: 84, inverted_winger: 83, traditional_winger: 82, wide_playmaker: 81,
      advanced_playmaker: 82, shadow_striker: 82, box_to_box: 80, deep_lying_playmaker: 81,
      mezzala: 80, ball_winning_midfielder: 82, holding_midfielder: 82, anchor_man: 82,
      ball_playing_defender: 78, no_nonsense_defender: 77, stopper: 77, cover_defender: 77,
      attacking_fullback: 75, inverted_fullback: 75, wingback: 75,
      sweeper_keeper: 80, traditional_keeper: 80, shot_stopper: 80,
    },
  },
};

/**
 * Retrieves the starter OVR and details for a special club at the player's position and sub-position.
 * First checks active Starting XI players in database teams, then falls back to calibrated benchmarks.
 */
export function getSpecialClubStarterOvr(
  clubId: SpecialClubId,
  player: PlayerCardData
): {
  starterOvr: number;
  starterName?: string;
  isPositionMatch: boolean;
  lowestStarterOvr: number;
  starterRoleText?: string;
} {
  const benchmark = SPECIAL_CLUBS_BENCHMARK_STARTERS[clubId] || {
    clubId,
    defaultStarterAvg: 85,
    lowestStarterOvr: 82,
    positionStarters: {},
  };

  const pos = (player.position || 'ST').toUpperCase();
  const rawSubPos = (player.subPosition || '').toLowerCase().replace(/[\s-]/g, '_');

  // Try to inspect database team first
  try {
    const db = getLeagueDatabase();
    const teamId = SPECIAL_CLUB_DATABASE_IDS[clubId];
    const dbTeam = teamId ? db?.teams?.[teamId] : undefined;

    if (dbTeam) {
      const ensured = ensureTeamSquadSaveFile(dbTeam);
      const startingXI = (ensured.squadSaveFile?.squad || []).slice(0, 11).filter((s) => s.player);
      if (startingXI.length > 0) {
        const lowestOvr = Math.min(...startingXI.map((s) => s.player?.ovr || 85));

        // 1. Look for direct sub-position match among starters
        const exactSubMatch = startingXI.find((s) => {
          const starterSub = (s.player?.subPosition || '').toLowerCase().replace(/[\s-]/g, '_');
          return starterSub && starterSub === rawSubPos;
        });

        if (exactSubMatch?.player?.ovr) {
          return {
            starterOvr: exactSubMatch.player.ovr,
            starterName: exactSubMatch.player.name,
            isPositionMatch: true,
            lowestStarterOvr: lowestOvr,
            starterRoleText: `${exactSubMatch.player.name} (${exactSubMatch.player.ovr} OVR, ${exactSubMatch.player.subPosition || exactSubMatch.player.position})`,
          };
        }

        // 2. Look for primary position match among starters
        const posMatches = startingXI.filter((s) => (s.player?.position || '').toUpperCase() === pos);
        if (posMatches.length > 0) {
          const primaryStarter = posMatches.reduce((max, s) => (s.player!.ovr > max.player!.ovr ? s : max), posMatches[0]);
          return {
            starterOvr: primaryStarter.player!.ovr,
            starterName: primaryStarter.player!.name,
            isPositionMatch: true,
            lowestStarterOvr: lowestOvr,
            starterRoleText: `${primaryStarter.player!.name} (${primaryStarter.player!.ovr} OVR, ${primaryStarter.player!.position})`,
          };
        }

        // 3. Look for secondary/additional position match if player has multi-position slots
        if (player.positions && player.positions.length > 0) {
          for (const slot of player.positions) {
            const slotPos = (slot.position || '').toUpperCase();
            const slotSub = (slot.subPosition || '').toLowerCase().replace(/[\s-]/g, '_');
            const slotMatch = startingXI.find((s) => {
              const starterSub = (s.player?.subPosition || '').toLowerCase().replace(/[\s-]/g, '_');
              return (starterSub && starterSub === slotSub) || (s.player?.position || '').toUpperCase() === slotPos;
            });
            if (slotMatch?.player?.ovr) {
              return {
                starterOvr: slotMatch.player.ovr,
                starterName: slotMatch.player.name,
                isPositionMatch: true,
                lowestStarterOvr: lowestOvr,
                starterRoleText: `${slotMatch.player.name} (${slotMatch.player.ovr} OVR, ${slotMatch.player.position})`,
              };
            }
          }
        }

        return {
          starterOvr: lowestOvr,
          starterName: startingXI[0]?.player?.name,
          isPositionMatch: false,
          lowestStarterOvr: lowestOvr,
          starterRoleText: `Starting XI Starter (${lowestOvr} OVR)`,
        };
      }
    }
  } catch {
    // Fallback to benchmark table
  }

  // Use benchmark starter dictionary
  const starterOvrBySubPos = rawSubPos ? benchmark.positionStarters[rawSubPos] : undefined;
  const starterOvrByPos = benchmark.positionStarters[pos];
  const finalStarterOvr = starterOvrBySubPos || starterOvrByPos || benchmark.defaultStarterAvg;

  return {
    starterOvr: finalStarterOvr,
    starterName: undefined,
    isPositionMatch: Boolean(starterOvrBySubPos || starterOvrByPos),
    lowestStarterOvr: benchmark.lowestStarterOvr,
    starterRoleText: `${pos}${rawSubPos ? ` (${rawSubPos})` : ''} Starter (${finalStarterOvr} OVR)`,
  };
}

/**
 * Checks Special Club Eligibility according to strict core career conditions:
 * - Saudi Arabia: 85+ OVR
 * - Big 6 EPL: Higher rating than their starter in the position and sub-position
 * - PSG: 87+ OVR AND better than one of their starters
 * - Big 3 (Bayern Munich, Real Madrid, Barcelona): 90+ OVR AND better in OVR than one of their starters
 */
export function checkSpecialClubEligibility(
  player: PlayerCardData,
  clubId: SpecialClubId
): boolean {
  const ovr = player.ovr || 55;
  const currentClubId = matchSpecialClubId(player.club);

  // Player cannot receive special offer from their own current club
  if (currentClubId === clubId) {
    return false;
  }

  // Check if player is currently a hostage
  if (player.isCurrentlyHostage && (player.hostageMonthsRemaining || 0) > 0) {
    return false;
  }

  // Check permanent rejections
  const rejectedClubs = player.permanentlyRejectedClubs || [];
  if (rejectedClubs.includes(clubId)) {
    return false;
  }

  if (clubId === 'saudi_pro_league' && player.permanentlyRejectedSaudi) {
    return false;
  }

  // Get starter benchmarks for target club in player's position & sub-position
  const starterInfo = getSpecialClubStarterOvr(clubId, player);
  const starterOvr = starterInfo.starterOvr;
  const lowestStarterOvr = starterInfo.lowestStarterOvr;

  // 1. Arabian / Saudi Pro League Offers:
  // Condition: being 85+ rated
  if (clubId === 'saudi_pro_league') {
    return ovr >= 85;
  }

  // 2. Big 6 EPL Offers (Man City, Arsenal, Liverpool, Chelsea, Man Utd, Spurs):
  // Condition: having higher rating than their starter in the position and sub-position we have
  const config = SPECIAL_CLUBS_CONFIG[clubId];
  if (config?.category === 'big_six') {
    return ovr > starterOvr;
  }

  // 3. PSG Offers:
  // Condition: 87+ rating AND being better than one of their starters
  if (clubId === 'psg') {
    return ovr >= 87 && (ovr > starterOvr || ovr > lowestStarterOvr);
  }

  // 4. Big 3 European Giants (Bayern Munich, Real Madrid, Barcelona):
  // Condition: 90+ rating AND being better in OVR than one of their starters
  if (clubId === 'real_madrid' || clubId === 'barcelona' || clubId === 'bayern_munich') {
    return ovr >= 90 && (ovr > starterOvr || ovr > lowestStarterOvr);
  }

  return false;
}

/**
 * Finds or creates a fallback ProClubDefinition for a special club
 */
export function resolveSpecialProClub(clubId: SpecialClubId): ProClubDefinition {
  const allClubs = getProClubsFromDatabase();
  const config = SPECIAL_CLUBS_CONFIG[clubId];

  const matched = allClubs.find((c) => matchSpecialClubId(c.clubName) === clubId);
  if (matched) {
    return {
      ...matched,
      managerName: config.managerName,
      managerNationality: config.managerNationality,
      managerFormation: config.formation,
      managerTacticalStyle: config.tacticalStyle,
    };
  }

  // High-fidelity fallback
  return {
    id: `special_${clubId}`,
    clubName: config.name,
    clubBadgeBg: config.badgeBg,
    countryName: config.country,
    countryCode: config.countryCode,
    leagueName: config.leagueName,
    leagueTier: 1,
    isEuropean: clubId !== 'saudi_pro_league',
    positionalLevels: {
      ATT: clubId === 'saudi_pro_league' ? 84 : 89,
      MID: clubId === 'saudi_pro_league' ? 83 : 89,
      DEF: clubId === 'saudi_pro_league' ? 82 : 88,
      GK: clubId === 'saudi_pro_league' ? 82 : 89,
    },
    positionalNeeds: {
      ATT: 'STRONG',
      MID: 'STRONG',
      DEF: 'STRONG',
      GK: 'STRONG',
    },
    prestigeStars: clubId === 'saudi_pro_league' ? 4.5 : 5,
    clubFame: clubId === 'saudi_pro_league' ? 7.5 : 10,
    managerName: config.managerName,
    managerNationality: config.managerNationality,
    managerTacticalStyle: config.tacticalStyle,
    managerFormation: config.formation,
    preferredPlaystyles: {},
  };
}

/**
 * Evaluates full contract and tactical parameters for a special club interest
 */
export function evaluateSpecialClubInterest(
  player: PlayerCardData,
  clubId: SpecialClubId,
  isRetry: boolean = false,
  decayYear?: number
): SpecialClubEvaluation {
  const config = SPECIAL_CLUBS_CONFIG[clubId];
  const buyerClub = resolveSpecialProClub(clubId);
  const ovr = player.ovr || 75;
  const fame = player.fame || 0;

  // Calculate market value and transfer fee
  const marketValObj = calculateRealisticPlayerMarketValue(player as any);
  const baseMv = marketValObj.marketValue || 80000000;

  let feeMultiplier = 1.35;
  if (config.category === 'big_six') feeMultiplier = 1.45;
  if (clubId === 'psg') feeMultiplier = 1.6;
  if (clubId === 'saudi_pro_league') feeMultiplier = 2.0;

  const transferFee = Math.round(baseMv * feeMultiplier);
  const formattedFee = `€${(transferFee / 1000000).toFixed(1)}M`;

  // Calculate high-tier salary
  const minOvrTarget = config.minOvr || 78;
  const ovrFactor = Math.max(0, ovr - minOvrTarget) * 1000000;
  const fameFactor = Math.max(0, fame - config.minFame) * 12000;
  let salary = config.estimatedSalaryRange.min + ovrFactor + fameFactor;
  salary = Math.min(config.estimatedSalaryRange.max, Math.max(config.estimatedSalaryRange.min, salary));
  salary = Math.round(salary / 500000) * 500000;

  const weeklyWage = Math.round(salary / 52);
  const signingBonus = Math.round(salary * config.signingBonusPct);
  const contractYears = clubId === 'saudi_pro_league' ? 3 : 5;

  let theme: 'glory_legacy' | 'current_glory_money' | 'premier_league_glory' | 'raw_money' = 'glory_legacy';
  if (config.category === 'big_six') theme = 'premier_league_glory';
  if (clubId === 'psg') theme = 'current_glory_money';
  if (clubId === 'saudi_pro_league') theme = 'raw_money';

  return {
    clubId,
    config,
    buyerClub,
    salary,
    weeklyWage,
    signingBonus,
    transferFee,
    formattedFee,
    contractYears,
    proposedRole: 'Undisputed Starter & Team Leader',
    squadRole: 'Key Player',
    proposedPosition: player.position || 'ST',
    proposedPlaystyle: player.playStyle || 'Complete Forward',
    isEligible: true,
    isRetry,
    decayYear,
    theme,
  };
}

/**
 * 2. MULTIPLE SPECIAL CLUBS — CHOICE EVENT RESOLUTION
 * Scans all special clubs that are actively interested in the player.
 */
export function scanActiveSpecialClubInterests(
  player: PlayerCardData
): SpecialClubEvaluation[] {
  const clubKeys: SpecialClubId[] = [
    'real_madrid',
    'barcelona',
    'bayern_munich',
    'psg',
    'manchester_united',
    'liverpool',
    'arsenal',
    'chelsea',
    'manchester_city',
    'tottenham_hotspur',
    'saudi_pro_league',
  ];

  const activeInterests: SpecialClubEvaluation[] = [];

  for (const clubId of clubKeys) {
    // Only permanently rejected clubs are barred
    if (player.permanentlyRejectedClubs?.includes(clubId)) {
      continue;
    }
    if (clubId === 'saudi_pro_league' && player.permanentlyRejectedSaudi) {
      continue;
    }

    if (checkSpecialClubEligibility(player, clubId)) {
      activeInterests.push(evaluateSpecialClubInterest(player, clubId, false));
    }
  }

  return activeInterests;
}

/**
 * Categorizes the choice dilemma when multiple special clubs are interested
 */
export function categorizeSpecialChoiceDilemma(
  interests: SpecialClubEvaluation[]
): SpecialClubChoiceEventData {
  const hasBigThree = interests.some((i) => i.config.category === 'big_three');
  const hasPsg = interests.some((i) => i.config.category === 'psg');
  const hasBigSix = interests.some((i) => i.config.category === 'big_six');
  const hasSaudi = interests.some((i) => i.config.category === 'saudi');

  let dilemmaType: SpecialClubChoiceEventData['dilemmaType'] = 'single_club';
  let title = 'WORLD FOOTBALL ELITE SUMMIT';
  let subtitle = 'The top powers in football are vying for your signature.';

  const activeCategoriesCount = [hasBigThree, hasPsg, hasBigSix, hasSaudi].filter(Boolean).length;

  if (activeCategoriesCount >= 3) {
    dilemmaType = 'all_superpowers';
    title = 'GLOBAL SUPERPOWERS TRANSFER SUMMIT';
    subtitle = 'Continental monarchs, Parisian wealth, English League titans, and Saudi fortunes are all competing for your signature.';
  } else if (hasBigThree && hasBigSix) {
    dilemmaType = 'big_three_and_big_six';
    title = 'CONTINENTAL ROYALTY vs ENGLISH LEAGUE PINNACLE';
    subtitle = 'The timeless prestige of Blancos CF / Catalunya FC / Bavaria Rot FC vs the world-famous intensity and global audience of England’s Big Six.';
  } else if (hasPsg && hasBigSix) {
    dilemmaType = 'psg_and_big_six';
    title = 'PARISIAN SUPERCLUB vs ENGLISH LEAGUE ELITE';
    subtitle = 'Bleus de Paris’s French spotlight and massive wages vs the unmatched heritage of the English League.';
  } else if (hasBigSix && hasSaudi) {
    dilemmaType = 'big_six_and_saudi';
    title = 'ENGLISH LEAGUE GLORY vs UNLIMITED ARABIAN WEALTH';
    subtitle = 'Chasing English League glory in England vs life-changing tax-free generational wealth in Saudi Arabia.';
  } else if (hasBigThree && hasPsg) {
    dilemmaType = 'big_three_and_psg';
    title = 'HISTORY & GLORY vs CURRENT GLORY & MONEY';
    subtitle = 'The historic European monarchs (Blancos CF / Catalunya FC / Bavaria Rot FC) clash against Bleus de Paris’s financial firepower and modern spotlight.';
  } else if (hasBigThree && hasSaudi) {
    dilemmaType = 'big_three_and_saudi';
    title = 'HISTORIC EUROPEAN GLORY vs RAW UNLIMITED MONEY';
    subtitle = 'Will you etch your name in European football folklore, or secure astronomical generational fortune in the Saudi League?';
  } else if (hasPsg && hasSaudi) {
    dilemmaType = 'psg_and_saudi';
    title = 'EUROPEAN GLORY & MONEY vs RAW ARABIAN FORTUNE';
    subtitle = 'Parisian elegance and European Winners League contention vs the world’s most lucrative tax-free football contracts.';
  } else if (interests.length > 1 && hasBigSix && !hasBigThree && !hasPsg && !hasSaudi) {
    dilemmaType = 'multiple_big_six';
    title = 'ENGLISH LEAGUE HEGEMONY: BATTLE OF THE BIG SIX';
    subtitle = 'England’s greatest football institutions are locked in a fierce transfer war for your signature.';
  } else if (interests.length > 1 && hasBigThree) {
    dilemmaType = 'multiple_big_three';
    title = 'TITANS OF EUROPE: THE BATTLE OF MONARCHS';
    subtitle = 'The most prestigious institutions in football history are directly competing for your loyalty.';
  }

  return {
    interestedClubs: interests,
    dilemmaType,
    title,
    subtitle,
  };
}

/**
 * 3, 4, 5. EXPLICIT REJECTION HANDLER
 *
 * Big Three & Big Six:
 * - If explicitly rejected -> PERMANENTLY REMOVED from future interest pool.
 * - They will never attempt to sign the player again.
 *
 * PSG:
 * - Rejecting PSG is not immediately permanent.
 * - Enters future interest decay system.
 *
 * Saudi Arabia:
 * - Can return every window UNLESS "I DON'T WANT TO CONSIDER IT EVER AGAIN" is selected.
 * - If permanent rejection selected -> permanently rejects all future Saudi approaches.
 */
export function recordSpecialClubExplicitRejection(
  player: PlayerCardData,
  clubId: SpecialClubId,
  isPermanentSaudi: boolean = false
): PlayerCardData {
  const currentRejected = player.permanentlyRejectedClubs || [];
  let updatedRejected = [...currentRejected];
  let updatedSaudiPermanent = player.permanentlyRejectedSaudi || false;

  const currentDecay = { ...(player.specialClubInterestDecay || {}) };

  const config = SPECIAL_CLUBS_CONFIG[clubId];
  if (config?.category === 'big_three' || config?.category === 'big_six') {
    // Big Three and Big Six explicit rejection is permanent
    if (!updatedRejected.includes(clubId)) {
      updatedRejected.push(clubId);
    }
    // Remove from decay
    delete currentDecay[clubId];
  } else if (clubId === 'psg') {
    // PSG rejection is not immediately permanent; initialize decay sequence
    currentDecay['psg'] = {
      status: 'dropped',
      yearCount: 1,
      lastAttemptYear: player.age,
    };
  } else if (clubId === 'saudi_pro_league') {
    if (isPermanentSaudi) {
      updatedSaudiPermanent = true;
      delete currentDecay['saudi_pro_league'];
    }
    // If not permanent, Saudi can return every window, no decay needed
  }

  return {
    ...player,
    permanentlyRejectedClubs: updatedRejected,
    permanentlyRejectedSaudi: updatedSaudiPermanent,
    specialClubInterestDecay: currentDecay,
  };
}

/**
 * 7. FAILED TRANSFER HANDLER (Club Refusal / Hostage)
 *
 * A failed transfer does NOT count as an explicit rejection!
 * Initializes decay sequence so the club can retry in future windows.
 */
export function recordSpecialClubFailedTransfer(
  player: PlayerCardData,
  clubId: SpecialClubId
): PlayerCardData {
  const currentDecay = { ...(player.specialClubInterestDecay || {}) };

  // Big Three or PSG enters decay tracker starting at Year 1
  if (clubId !== 'saudi_pro_league') {
    currentDecay[clubId] = {
      status: 'pending_retry',
      yearCount: 1,
      lastAttemptYear: player.age,
    };
  }

  return {
    ...player,
    specialClubInterestDecay: currentDecay,
  };
}

/**
 * 7. BIG THREE TRANSFER NEGOTIATION ROLLS
 *
 * After player agreement:
 * "We'll negotiate with your club now."
 *
 * 80% — AGREEMENT -> Universal Contract Screen -> Signing bonus paid -> Presentation
 * 20% — CLUB REFUSES -> Player receives "FORCE MY WAY OUT"
 */
export function rollBigThreeClubNegotiation(): {
  isClubAgreed: boolean;
  rollNumber: number;
} {
  const roll = Math.random() * 100;
  return {
    isClubAgreed: roll < 80, // 80% chance
    rollNumber: roll,
  };
}

/**
 * FORCE MY WAY OUT NEGOTIATION ROLL
 *
 * If previously hostage:
 * - 95%: Agreement
 * - 5%: Hostage again
 *
 * Standard (first time):
 * - 80%: Current club accepts -> Transfer completed
 * - 20%: Current club refuses -> HOSTAGE
 */
export function rollForceWayOutNegotiation(hasBeenHostageBefore: boolean = false): {
  isAccepted: boolean;
  isHostage: boolean;
  successRate: number;
  rollNumber: number;
} {
  const successRate = hasBeenHostageBefore ? 95 : 80;
  const roll = Math.random() * 100;
  const isAccepted = roll < successRate;

  return {
    isAccepted,
    isHostage: !isAccepted,
    successRate,
    rollNumber: roll,
  };
}

/**
 * Applies the HOSTAGE penalty:
 * - Remains at current club
 * - Sent to Reserves for 6 months
 * - Club refuses to play player
 * - Sets hasBeenHostageBefore = true
 */
export function applyHostagePenalty(player: PlayerCardData): PlayerCardData {
  return {
    ...player,
    isCurrentlyHostage: true,
    hostageMonthsRemaining: 6,
    hasBeenHostageBefore: true,
    squadDestination: 'Reserves',
    squadRole: 'Develop With Reserves',
  };
}

/**
 * Advances hostage duration during time passage
 */
export function processHostageProgression(
  player: PlayerCardData,
  monthsPassed: number
): PlayerCardData {
  if (!player.isCurrentlyHostage) return player;

  const currentRemaining = player.hostageMonthsRemaining || 0;
  const newRemaining = Math.max(0, currentRemaining - monthsPassed);
  const isNowResolved = newRemaining === 0;

  return {
    ...player,
    hostageMonthsRemaining: newRemaining,
    isCurrentlyHostage: !isNowResolved,
    squadDestination: isNowResolved ? 'First Team' : player.squadDestination,
    squadRole: isNowResolved ? 'Starter' : player.squadRole,
  };
}

/**
 * 9 & 10. BIG THREE / PSG FUTURE INTEREST DECAY SYSTEM
 *
 * Applies when a Big Three club or PSG previously wanted the player but transfer was not completed.
 * Only runs while player remains eligible!
 *
 * - Year 1 (First follow-up window): 60% Still interested (short retry) / 40% Interest dropped
 * - Year 2: 30% Interest returns / 70% No longer interested
 * - Year 3: 15% Interest returns / 85% No longer interested
 * - Year 4: 5% Interest returns / 95% No longer interested
 * - Final drop (if 5% fails): Permanently dropped from special interest.
 */
export function processSpecialClubDecayRolls(player: PlayerCardData): {
  retryOffers: SpecialClubEvaluation[];
  updatedPlayer: PlayerCardData;
} {
  const currentDecay = { ...(player.specialClubInterestDecay || {}) };
  const retryOffers: SpecialClubEvaluation[] = [];

  const clubIds = Object.keys(currentDecay) as SpecialClubId[];

  for (const clubId of clubIds) {
    const item = currentDecay[clubId];
    if (!item || item.status === 'final_dropped') continue;

    // Check if player still meets eligibility requirements
    const isEligible = checkSpecialClubEligibility(player, clubId);
    if (!isEligible) {
      // Interest pauses/expires while ineligible
      continue;
    }

    const yearCount = item.yearCount || 1;
    let interestProbability = 0;

    if (yearCount === 1) {
      // First follow-up window
      interestProbability = 60;
    } else if (yearCount === 2) {
      interestProbability = 30;
    } else if (yearCount === 3) {
      interestProbability = 15;
    } else if (yearCount === 4) {
      interestProbability = 5;
    } else {
      // Year 5+ -> Final Drop
      currentDecay[clubId] = {
        ...item,
        status: 'final_dropped',
        yearCount: yearCount + 1,
      };
      continue;
    }

    const roll = Math.random() * 100;
    const isSuccess = roll < interestProbability;

    if (isSuccess) {
      // Club is interested again! Trigger Short Retry Event
      const evaluation = evaluateSpecialClubInterest(player, clubId, true, yearCount);
      retryOffers.push(evaluation);
      currentDecay[clubId] = {
        ...item,
        status: 'pending_retry',
        yearCount: yearCount, // Keeps current year count for this active retry
      };
    } else {
      // Dropped for this window
      if (yearCount >= 4) {
        // Failed 5% roll -> Permanent Final Drop
        currentDecay[clubId] = {
          ...item,
          status: 'final_dropped',
          yearCount: 5,
        };
      } else {
        // Increment year count for next window
        currentDecay[clubId] = {
          ...item,
          status: 'dropped',
          yearCount: yearCount + 1,
        };
      }
    }
  }

  return {
    retryOffers,
    updatedPlayer: {
      ...player,
      specialClubInterestDecay: currentDecay,
    },
  };
}

/**
 * Converts a SpecialClubEvaluation into the standardized UnifiedClubOffer format
 * for the Universal Contract Screen.
 */
export function convertSpecialEvaluationToUnifiedOffer(
  evaluation: SpecialClubEvaluation,
  player: PlayerCardData,
  accounting?: AccountingState,
  manager?: ManagerState
): UnifiedClubOffer {
  const { config, buyerClub, salary, weeklyWage, signingBonus, transferFee, formattedFee } = evaluation;
  const devTierInfo = getClubDevelopmentTier(buyerClub.clubName);

  const isSaudi = config.category === 'saudi';
  const starterInfo = getSpecialClubStarterOvr(config.id, player);
  const starterOvr = starterInfo.starterOvr;
  const starterDiff = (player.ovr || 75) - starterOvr;

  return {
    id: `special_offer_${config.id}_${Date.now()}`,
    buyerClub,
    clubBadgeBg: config.badgeBg,
    leagueName: config.leagueName,
    countryName: config.country,
    countryCode: config.countryCode,
    prestigeStars: buyerClub.prestigeStars || 5,
    leagueTier: 1,
    isEuropean: config.category !== 'saudi',
    clubFame: buyerClub.clubFame || 10,

    developmentTier: devTierInfo.tier,
    developmentTierName: devTierInfo.name,
    developmentPhilosophy: devTierInfo.description,
    youthDevelopmentPoints: devTierInfo.annualPoints,

    managerName: config.managerName,
    managerNationality: config.managerNationality,
    managerFormation: config.formation,
    managerTacticalStyle: config.tacticalStyle,

    expectedPosition: evaluation.proposedPosition,
    expectedPlaystyle: evaluation.proposedPlaystyle,

    squadRole: evaluation.squadRole,
    expectedRole: 'Starter',
    initialSquadDestination: 'First Team',
    proposedSquad: 'First Team',
    playingTimeExpectation: 'STARTER',
    roleDescription: `Guaranteed First-Team Starter & Marquee Leader at ${config.shortName}.`,

    starterOvr,
    starterDiff,
    starterComparisonText: starterDiff > 0
      ? `You surpass their current starter (${starterOvr} OVR) by +${starterDiff} OVR and claim the Starting XI spot in ${config.managerName}'s ${config.formation} system.`
      : `You are projected as the marquee starting leader in ${config.managerName}'s ${config.formation} system.`,

    transferType: isSaudi ? 'regular_transfer' : 'regular_transfer',
    transferFee,
    formattedFee,
    weeklyWage,
    yearlySalary: salary,
    contractYears: evaluation.contractYears,
    signingBonus,
    signingBonusPercent: Math.round((signingBonus / salary) * 100),
    playerTransferFeeCutPercent: 0,
    playerTransferFeeCutAmount: 0,
    releaseClause: isSaudi ? 250000000 : 1000000000,
    isReleaseClausePaid: false,

    isSaudiMegaOffer: isSaudi,
    curatedReason: isSaudi
      ? '🇸🇦 Official Saudi League Mega-Offer Ratification Agreement'
      : `👑 ${config.name} Official Boardroom Transfer Agreement`,
  };
}
