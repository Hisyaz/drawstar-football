import { PlayerCardData } from '../types';
import { ProClubDefinition } from './earlyCareerSystem';
import { ClubFinances } from '../types/clubEconomy';
import { calculateRealisticPlayerMarketValue, checkTransferAffordability, createFallbackClubFinances } from './clubEconomySystem';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { calculateClubStarterOvr, getCalibratedClubStarterTarget } from './leagueOvrCalibrationSystem';

// ============================================================================
// 1. CLUB COMPETITIVE TIER DEFINITIONS (1 to 12)
// ============================================================================

export type ClubCompetitiveTierNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ClubTierInfo {
  tier: ClubCompetitiveTierNumber;
  name: string;
  shortLabel: string;
  description: string;
  colorClass: string;
  badgeBg: string;
  starterOvrRange: [number, number];
  minAcceptableOvr: number;
}

export const CLUB_COMPETITIVE_TIERS: Record<ClubCompetitiveTierNumber, ClubTierInfo> = {
  1: {
    tier: 1,
    name: 'GLOBAL ELITE',
    shortLabel: 'Tier 1 • Global Elite',
    description: 'The pinnacle of world football (Blancos CF, Catalunya FC). Commands the greatest sporting prestige and magnetic attraction.',
    colorClass: 'text-amber-300',
    badgeBg: 'bg-amber-950/80 border-amber-500/60 text-amber-200',
    starterOvrRange: [88, 94],
    minAcceptableOvr: 84,
  },
  2: {
    tier: 2,
    name: 'WORLD ELITE',
    shortLabel: 'Tier 2 • World Elite',
    description: 'Continental heavyweights capable of winning the European Winners League every season (Bavaria Rot FC, Bleus de Paris).',
    colorClass: 'text-rose-300',
    badgeBg: 'bg-rose-950/80 border-rose-500/60 text-rose-200',
    starterOvrRange: [86, 92],
    minAcceptableOvr: 82,
  },
  3: {
    tier: 3,
    name: 'ELITE',
    shortLabel: 'Tier 3 • Elite',
    description: 'Top European elite including English Big 6 (Eastlands Sky Blues City, Mersey Reds FC, Gunners FC, London FC, Red Devils United, Lilywhites Hotspur) & Nerazzurri Milano.',
    colorClass: 'text-purple-300',
    badgeBg: 'bg-purple-950/80 border-purple-500/60 text-purple-200',
    starterOvrRange: [84, 89],
    minAcceptableOvr: 80,
  },
  4: {
    tier: 4,
    name: 'TOP EUROPEAN EWL',
    shortLabel: 'Tier 4 • Top EWL',
    description: 'Regular European Winners League knockout clubs from Europe\'s Big 5 leagues (Atlético Aviación, Westfalen Schwarzgelb BVB, Piemonte Bianconeri FC, Rossoneri Calcio, etc.).',
    colorClass: 'text-blue-300',
    badgeBg: 'bg-blue-950/80 border-blue-500/60 text-blue-200',
    starterOvrRange: [82, 87],
    minAcceptableOvr: 77,
  },
  5: {
    tier: 5,
    name: 'TOP EUROPEAN EEL',
    shortLabel: 'Tier 5 • Top EEL',
    description: 'Strong continental clubs competing regularly in the European Euroleague & high domestic finishes (Rheinland Werkself, Bergamo Dea BC, Capitale Giallorossi AS, Plana Baixa Amarillo CF, Gipuzkoa Txuri-Urdin, Midlands Villans FC, Tyneside Magpies United).',
    colorClass: 'text-cyan-300',
    badgeBg: 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200',
    starterOvrRange: [79, 84],
    minAcceptableOvr: 74,
  },
  6: {
    tier: 6,
    name: 'PORTUGUESE / BRAZILIAN POWERHOUSES',
    shortLabel: 'Tier 6 • PT/BR Giants',
    description: 'Portuguese giants (Invicta Dragões FC, Águias Encarnadas SL, Alvalade Leões CP) and major Brazilian powerhouses (Palestra Alviverde SE, Gávea Rubro-Negro CR, Laranjeiras Tricolor FC, Imortal Gaúcho FBPA, Morumbi Soberano FC).',
    colorClass: 'text-emerald-300',
    badgeBg: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200',
    starterOvrRange: [77, 83],
    minAcceptableOvr: 72,
  },
  7: {
    tier: 7,
    name: 'STRONG / MID-TABLE EUROPE',
    shortLabel: 'Tier 7 • Mid-Table Europe',
    description: 'Established mid-table clubs from top European leagues (East End Irons United, Black Country Wanderers, Goodison Toffees FC, Heliópolis Verdiblanco, Nervión Rojiblancos FC, Mainhattan Adler, Toscana Viola ACF, Aiglons Côte d\'Azur OGC, Flandres Dogues SC).',
    colorClass: 'text-teal-300',
    badgeBg: 'bg-teal-950/80 border-teal-500/60 text-teal-200',
    starterOvrRange: [75, 80],
    minAcceptableOvr: 70,
  },
  8: {
    tier: 8,
    name: 'LOWER EUROPEAN & 2ND DIV',
    shortLabel: 'Tier 8 • Lower Europe',
    description: 'Relegation-threatened top flight and major second-division European clubs (English Second Division, Spanish Second Division, Italian Second Division, French Second Division, German Second Division).',
    colorClass: 'text-sky-300',
    badgeBg: 'bg-sky-950/80 border-sky-500/60 text-sky-200',
    starterOvrRange: [70, 76],
    minAcceptableOvr: 65,
  },
  9: {
    tier: 9,
    name: 'ARGENTINEAN GIANTS',
    shortLabel: 'Tier 9 • ARG Giants',
    description: 'Historic South American superpowers with massive fanbases and Copa De Proceres pedigree (Millonarios Plate, Xeneizes Juniors).',
    colorClass: 'text-yellow-300',
    badgeBg: 'bg-yellow-950/80 border-yellow-500/60 text-yellow-200',
    starterOvrRange: [75, 80],
    minAcceptableOvr: 70,
  },
  10: {
    tier: 10,
    name: 'ARGENTINEAN FIRST DIVISION',
    shortLabel: 'Tier 10 • ARG 1st Div',
    description: 'Other Argentine top-flight clubs (Academia Avellaneda, Diablos de Avellaneda, Boedo Ciclón, Liniers Fortín, Pinchas de La Plata, Granate del Sur CA, Parque Leprosos).',
    colorClass: 'text-orange-300',
    badgeBg: 'bg-orange-950/80 border-orange-500/60 text-orange-200',
    starterOvrRange: [70, 75],
    minAcceptableOvr: 64,
  },
  11: {
    tier: 11,
    name: 'BRAZILIAN SECOND DIVISION',
    shortLabel: 'Tier 11 • BRA 2nd Div',
    description: 'Brazilian Second Division clubs competing for promotion with competitive regional rosters.',
    colorClass: 'text-stone-300',
    badgeBg: 'bg-stone-900 border-stone-600 text-stone-300',
    starterOvrRange: [66, 71],
    minAcceptableOvr: 60,
  },
  12: {
    tier: 12,
    name: 'ARGENTINEAN SECOND DIVISION',
    shortLabel: 'Tier 12 • ARG 2nd Div',
    description: 'Argentinean Second Division clubs, developing domestic talent and veterans.',
    colorClass: 'text-zinc-400',
    badgeBg: 'bg-zinc-900 border-zinc-700 text-zinc-400',
    starterOvrRange: [63, 68],
    minAcceptableOvr: 57,
  },
};

/**
 * Dynamically resolves a club's competitive tier (1 to 12)
 * Uses Club Name, Country, League, Fame (0-10), Finances, and Reputation.
 */
export function getClubCompetitiveTier(
  clubInput: ProClubDefinition | Partial<PlayerCardData> | string,
  leagueName?: string,
  countryCode?: string
): ClubCompetitiveTierNumber {
  let name = '';
  let league = (leagueName || '').toLowerCase();
  let country = (countryCode || '').toUpperCase();
  let fame = 5;
  let prestigeStars = 3;
  let leagueTierNum = 1;

  if (typeof clubInput === 'string') {
    name = clubInput.toLowerCase();
  } else if (clubInput) {
    const raw = clubInput as any;
    name = (raw.club || raw.clubName || '').toLowerCase();
    league = (raw.league || raw.leagueName || league).toLowerCase();
    country = (raw.clubCountry || raw.countryCode || raw.countryName || country).toUpperCase();
    fame = typeof raw.clubFame === 'number' ? raw.clubFame : typeof raw.fame === 'number' ? raw.fame : 5;
    prestigeStars = raw.prestigeStars || 3;
    leagueTierNum = raw.leagueTier || (raw.divisionTier === '2nd' ? 2 : 1);
  }

  // Normalize club name for specific matching
  const n = name.toLowerCase();
  const isSouthAmericanException =
    country === 'ARG' ||
    country === 'URU' ||
    country === 'ECU' ||
    country === 'CHI' ||
    n.includes('viaducto') ||
    n.includes('sarand') ||
    n.includes('belvedere') ||
    n.includes('cuchilla') ||
    n.includes('guayaquil') ||
    n.includes('astillero') ||
    n.includes('ruleteros');

  // TIER 1 — GLOBAL ELITE: Blancos CF, Catalunya FC
  if (
    !isSouthAmericanException &&
    (n.includes('real madrid') ||
      n.includes('blancos cf') ||
      n.includes('catalunya fc') ||
      n.includes('barcelona') ||
      n === 'fc barcelona' ||
      n === 'real madrid cf')
  ) {
    return 1;
  }

  // TIER 2 — WORLD ELITE: Bavaria Rot FC, Bleus de Paris
  if (
    n.includes('bayern') ||
    n.includes('bavaria rot') ||
    n.includes('paris saint-germain') ||
    n.includes('bleus de paris') ||
    n === 'psg' ||
    n.includes('paris sg')
  ) {
    return 2;
  }

  // TIER 3 — ELITE: Nerazzurri Milano, English Big 6
  if (
    !isSouthAmericanException &&
    (n.includes('manchester city') ||
      n.includes('man city') ||
      n.includes('eastlands sky blues') ||
      n.includes('liverpool') ||
      n.includes('mersey reds') ||
      n.includes('arsenal') ||
      n.includes('gunners fc') ||
      n.includes('chelsea') ||
      n === 'london fc' ||
      n.includes('manchester united') ||
      n.includes('man utd') ||
      n.includes('red devils united') ||
      n.includes('tottenham') ||
      n.includes('lilywhites hotspur') ||
      n.includes('inter milan') ||
      n.includes('nerazzurri milano') ||
      n === 'inter' ||
      (n.includes('internazionale') && !country.includes('BRA')))
  ) {
    return 3;
  }

  // TIER 9 — ARGENTINEAN GIANTS: Millonarios Plate, Xeneizes Juniors
  if (
    n.includes('river plate') ||
    n.includes('millonarios plate') ||
    n.includes('boca juniors') ||
    n.includes('xeneizes juniors') ||
    n === 'river' ||
    n === 'boca'
  ) {
    return 9;
  }

  // TIER 6 — PORTUGUESE / BRAZILIAN POWERHOUSES
  if (
    n.includes('porto') ||
    n.includes('invicta dragões') ||
    n.includes('invicta dragoes') ||
    n.includes('benfica') ||
    n.includes('águias encarnadas') ||
    n.includes('aguias encarnadas') ||
    n.includes('sporting cp') ||
    n.includes('sporting lisbon') ||
    n.includes('alvalade leões') ||
    n.includes('alvalade leoes') ||
    n.includes('palmeiras') ||
    n.includes('palestra alviverde') ||
    n.includes('fluminense') ||
    n.includes('laranjeiras tricolor') ||
    n.includes('grêmio') ||
    n.includes('gremio') ||
    n.includes('imortal gaúcho') ||
    n.includes('imortal gaucho') ||
    n.includes('flamengo') ||
    n.includes('gávea rubro-negro') ||
    n.includes('gavea rubro-negro') ||
    n.includes('são paulo') ||
    n.includes('sao paulo') ||
    n.includes('morumbi soberano') ||
    n.includes('corinthians') ||
    n.includes('itaquera alvinegro') ||
    n.includes('atlético mineiro') ||
    n.includes('atletico mineiro') ||
    n.includes('minas galo') ||
    ((n.includes('internacional') || n.includes('beira-rio colorado')) && (country.includes('BRA') || league.includes('brasil') || league.includes('série')))
  ) {
    return 6;
  }

  // TIER 4 — TOP EUROPEAN UCL: Regular Big 5 UCL knockout contenders
  if (
    n.includes('atlético de madrid') ||
    n.includes('atletico madrid') ||
    n.includes('atlético aviación') ||
    n.includes('atletico aviacion') ||
    n.includes('borussia dortmund') ||
    n.includes('dortmund') ||
    n.includes('westfalen schwarzgelb') ||
    n.includes('juventus') ||
    n.includes('piemonte bianconeri') ||
    n.includes('ac milan') ||
    n.includes('rossoneri calcio') ||
    n === 'milan' ||
    n.includes('napoli') ||
    n.includes('partenopei napoli') ||
    n.includes('leverkusen') ||
    n.includes('bayer 04') ||
    n.includes('rheinland werkself')
  ) {
    return 4;
  }

  // TIER 5 — TOP EUROPEAN UEL: Europa League level / strong continental
  if (
    n.includes('roma') ||
    n.includes('as roma') ||
    n.includes('capitale giallorossi') ||
    n.includes('lazio') ||
    n.includes('aquile biancocelesti') ||
    n.includes('atalanta') ||
    n.includes('bergamo dea') ||
    n.includes('villarreal') ||
    n.includes('plana baixa amarillo') ||
    n.includes('real sociedad') ||
    n.includes('gipuzkoa txuri-urdin') ||
    n.includes('athletic club') ||
    n.includes('athletic bilbao') ||
    n.includes('bizkaia rojiblanco') ||
    n.includes('aston villa') ||
    n.includes('midlands villans') ||
    n.includes('newcastle') ||
    n.includes('tyneside magpies') ||
    n.includes('frankfurt') ||
    n.includes('eintracht') ||
    n.includes('mainhattan adler') ||
    n.includes('leipzig') ||
    n.includes('rb leipzig') ||
    n.includes('messestadt rot-weiß') ||
    n.includes('messestadt rot-weiss') ||
    n.includes('fiorentina') ||
    n.includes('toscana viola') ||
    n.includes('monaco') ||
    n.includes('as monaco') ||
    n.includes('principauté rouge') ||
    n.includes('principaute rouge') ||
    n.includes('marseille') ||
    n.includes('phocéenne olympique') ||
    n.includes('phoceenne olympique') ||
    n.includes('lyon') ||
    n.includes('rhône gones') ||
    n.includes('rhone gones')
  ) {
    return 5;
  }

  // Argentine Divisions
  if (
    country === 'ARG' ||
    league.includes('argentina') ||
    league.includes('argentinean') ||
    league.includes('profesional') ||
    league.includes('nacional')
  ) {
    if (league.includes('second division') || league.includes('nacional') || league.includes('segunda') || leagueTierNum === 2) {
      return 12; // ARGENTINEAN SECOND DIVISION
    }
    return 10; // ARGENTINEAN FIRST DIVISION
  }

  // Brazilian Divisions
  if (
    country === 'BRA' ||
    league.includes('brazil') ||
    league.includes('brasil') ||
    league.includes('brasileir') ||
    league.includes('série') ||
    league.includes('serie')
  ) {
    if (league.includes('second division') || league.includes('série b') || league.includes('serie b') || leagueTierNum === 2) {
      return 11; // BRAZILIAN SECOND DIVISION
    }
    return 6; // Default top flight Brazilian club
  }

  // European 2nd Divisions (Tier 8)
  if (
    leagueTierNum === 2 ||
    league.includes('second division') ||
    league.includes('championship') ||
    league.includes('hypermotion') ||
    league.includes('la liga 2') ||
    league.includes('segunda') ||
    league.includes('serie b') ||
    league.includes('ligue 2') ||
    league.includes('2. bundesliga')
  ) {
    return 8;
  }

  // Standard European First Division Mid-Table / Lower
  if (
    ['ENG', 'ESP', 'GER', 'ITA', 'FRA', 'POR', 'NED'].includes(country) ||
    league.includes('english league') ||
    league.includes('spanish league') ||
    league.includes('italian league') ||
    league.includes('german league') ||
    league.includes('french league') ||
    league.includes('premier') ||
    league.includes('la liga') ||
    league.includes('serie a') ||
    league.includes('bundesliga') ||
    league.includes('ligue 1')
  ) {
    if (prestigeStars >= 4 || fame >= 6) return 7; // Strong Mid-table
    return 8; // Lower European / relegation tier
  }

  // Default fallback based on fame & prestige
  if (fame >= 9) return 2;
  if (fame >= 8) return 3;
  if (fame >= 7) return 5;
  if (fame >= 5) return 7;
  if (fame >= 3) return 8;
  return 10;
}

// ============================================================================
// 2. SUB-POSITIONS & TACTICAL FORMATION COMPATIBILITY
// ============================================================================

export type SubPositionCode =
  | 'ST'
  | 'CF'
  | 'RW'
  | 'LW'
  | 'CAM'
  | 'CM'
  | 'CDM'
  | 'RM'
  | 'LM'
  | 'CB'
  | 'RB'
  | 'LB'
  | 'GK';

/**
 * Standard sub-positions used by tactical formations
 */
export const FORMATION_SUB_POSITIONS: Record<string, SubPositionCode[]> = {
  '4-3-3': ['GK', 'RB', 'CB', 'LB', 'CDM', 'CM', 'CAM', 'RW', 'LW', 'ST'],
  '4-2-3-1': ['GK', 'RB', 'CB', 'LB', 'CDM', 'CAM', 'RM', 'LM', 'RW', 'LW', 'ST'],
  '4-4-2': ['GK', 'RB', 'CB', 'LB', 'RM', 'CM', 'LM', 'ST', 'CF'],
  '3-5-2': ['GK', 'CB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'ST', 'CF'],
  '3-4-3': ['GK', 'CB', 'CDM', 'CM', 'RM', 'LM', 'RW', 'LW', 'ST', 'CF'],
  '5-3-2': ['GK', 'RB', 'CB', 'LB', 'CDM', 'CM', 'ST', 'CF'],
  '4-1-2-1-2': ['GK', 'RB', 'CB', 'LB', 'CDM', 'RM', 'LM', 'CAM', 'ST', 'CF'],
};

/**
 * Resolves player's primary sub-position code (e.g. ST, CAM, LW, RW, CDM, CB, etc.)
 */
export function resolvePlayerSubPosition(player: Partial<PlayerCardData>): SubPositionCode {
  const sub = (player.subPosition || player.position || 'ST').toUpperCase().trim();
  const validCodes: SubPositionCode[] = ['ST', 'CF', 'RW', 'LW', 'CAM', 'CM', 'CDM', 'RM', 'LM', 'CB', 'RB', 'LB', 'GK'];
  if (validCodes.includes(sub as SubPositionCode)) {
    return sub as SubPositionCode;
  }
  const pos = (player.position || 'ST').toUpperCase().trim();
  if (validCodes.includes(pos as SubPositionCode)) {
    return pos as SubPositionCode;
  }
  return 'ST';
}

/**
 * Checks if a club's formation natively utilizes a specific sub-position
 */
export function isSubPositionUsedByClub(club: ProClubDefinition, subPos: SubPositionCode): boolean {
  const formation = (club.managerFormation || '4-3-3').trim();
  const positionsInFormation = FORMATION_SUB_POSITIONS[formation] || FORMATION_SUB_POSITIONS['4-3-3'];
  
  if (positionsInFormation.includes(subPos)) {
    return true;
  }

  // Check if club preferred playstyles explicitly list this role
  if (club.preferredPlaystyles && club.preferredPlaystyles[subPos]) {
    return true;
  }

  // Adaptable adjacent sub-positions (e.g. RW can play RM / LW; CF can play ST / CAM)
  const adjacentRoles: Record<SubPositionCode, SubPositionCode[]> = {
    ST: ['CF'],
    CF: ['ST', 'CAM'],
    RW: ['RM', 'LW'],
    LW: ['LM', 'RW'],
    CAM: ['CM', 'CF'],
    CM: ['CAM', 'CDM'],
    CDM: ['CM', 'CB'],
    RM: ['RW', 'CM'],
    LM: ['LW', 'CM'],
    CB: ['CDM', 'RB', 'LB'],
    RB: ['RWB', 'RM'] as any,
    LB: ['LWB', 'LM'] as any,
    GK: [],
  };

  const adj = adjacentRoles[subPos] || [];
  return adj.some((role) => positionsInFormation.includes(role));
}

/**
 * Estimates the club's current starter OVR for a specific sub-position or overall
 * derived directly from the player database.
 */
export function estimateClubStarterOvr(
  club: ProClubDefinition,
  subPos?: SubPositionCode
): number {
  const db = getLeagueDatabase();
  const teamData = db?.teams?.[club.id];
  if (teamData) {
    const actualStarter = calculateClubStarterOvr(teamData);
    if (actualStarter && actualStarter >= 50) {
      return Math.round(actualStarter);
    }
  }

  // Fallback to calibrated club starter target
  return getCalibratedClubStarterTarget({
    id: club.id,
    name: club.clubName,
    countryCode: club.countryCode,
    leagueId: club.leagueName?.toLowerCase().replace(/\s+/g, '_'),
    reputation: Math.round(club.prestigeStars * 15 + 10),
  } as any);
}

// ============================================================================
// 3. CLUB INTEREST SCORE & CLASSIFICATION (0 to 100+)
// ============================================================================

export type ClubInterestClassification =
  | 'Low Interest'
  | 'Interested'
  | 'Strong Interest'
  | 'Very Strong Interest'
  | 'Aggressive Pursuit';

export interface ClubInterestEvaluation {
  club: ProClubDefinition;
  clubTier: ClubCompetitiveTierNumber;
  clubTierInfo: ClubTierInfo;
  interestScore: number;
  classification: ClubInterestClassification;
  isOfferEligible: boolean;
  starterOvr: number;
  ovrDifferenceVsStarter: number;
  subPositionMatch: boolean;
  tacticalAccommodation: boolean;
  isSaudiMegaPursuit: boolean;
  isBenchRaidOpportunity: boolean;
  reasons: string[];
}

export function evaluateClubInterest(
  club: ProClubDefinition,
  player: Partial<PlayerCardData> & { isBenchedAtCurrentClub?: boolean },
  agentNetworkingSkill: number = 20
): ClubInterestEvaluation {
  const ovr = player.ovr || 65;
  const potential = player.potentialOvr || 78;
  const age = player.age || 20;
  const fame = player.fame || 0;
  const subPos = resolvePlayerSubPosition(player);
  const contractYears = (player as any).accounting?.contractYears ?? player.contractYearsRemaining ?? (player.isFreeAgent ? 0 : 3);
  const isFreeAgent = Boolean(player.isFreeAgent || contractYears <= 0);
  const isExpiring = contractYears === 1;

  const clubTier = getClubCompetitiveTier(club);
  const clubTierInfo = CLUB_COMPETITIVE_TIERS[clubTier];
  const playerCurrentTier = getClubCompetitiveTier(player.club || '', player.league || '', player.clubCountry || '');
  
  const starterOvr = estimateClubStarterOvr(club, subPos);
  const ovrDiff = ovr - starterOvr;
  const subPosUsed = isSubPositionUsedByClub(club, subPos);

  const isSaudi =
    club.countryCode === 'KSA' ||
    club.countryCode === 'SAU' ||
    club.countryName.toLowerCase().includes('saudi') ||
    club.leagueName.toLowerCase().includes('saudi');

  const isMercenary =
    Boolean(player.activePerkIds?.includes('mercenary')) ||
    (Array.isArray((player as any).perks) && (player as any).perks.includes('mercenary'));

  // Determine if player is currently a bench player / non-starter at their current club
  const isPlayerStarterAtCurrentClub = !player.isBenchedAtCurrentClub &&
    player.squadRole !== 'Rotation Player' &&
    player.squadRole !== 'Reserves Prospect' &&
    (player as any).squadDestination !== 'Reserves' &&
    !player.requestedTransfer &&
    ovr >= 75;

  let interestScore = 0;
  const reasons: string[] = [];

  // --------------------------------------------------------------------------
  // 1. STARTER COMPARISON & OVR FIT
  // --------------------------------------------------------------------------
  if (ovrDiff >= 5) {
    interestScore += 40;
    reasons.push(`Massive upgrade over current ${subPos} starter (${ovr} vs ${starterOvr} OVR, +${ovrDiff})`);
  } else if (ovrDiff >= 1) {
    interestScore += 28;
    reasons.push(`Direct upgrade over current ${subPos} starter (${ovr} vs ${starterOvr} OVR)`);
  } else if (ovrDiff >= -2) {
    interestScore += 16;
    reasons.push(`Competitive starter / immediate rotation quality for ${subPos}`);
  } else if (ovrDiff >= -5 && potential >= 84) {
    interestScore += 10;
    reasons.push(`High potential prospect capable of developing into future starter`);
  } else if (ovrDiff < -6 && ovr < 92) {
    interestScore -= 35;
  }

  // --------------------------------------------------------------------------
  // 2. GENERATIONAL SUPERSTAR OVERRIDE (92+ OVR)
  // --------------------------------------------------------------------------
  let tacticalAccommodation = false;
  if (ovr >= 92) {
    interestScore += 35;
    tacticalAccommodation = true;
    reasons.push(`Generational world-class talent (${ovr} OVR): Club will adapt tactical setup to accommodate player`);
  } else if (!subPosUsed) {
    if (ovrDiff >= 6) {
      interestScore += 15;
      tacticalAccommodation = true;
      reasons.push(`Exceptional quality forces tactical adjustment to fit ${subPos}`);
    } else {
      interestScore -= 30; // Club does not use sub-position and player isn't dominant enough
    }
  } else {
    interestScore += 12;
    reasons.push(`Tactically fits club's ${club.managerFormation || '4-3-3'} formation at ${subPos}`);
  }

  // --------------------------------------------------------------------------
  // 3. TIER HIERARCHY & BENCH-TO-STARTER DYNAMICS
  // --------------------------------------------------------------------------
  let isBenchRaidOpportunity = false;

  // Case A: Club is HIGHER or EQUAL tier than player's current club
  if (clubTier <= playerCurrentTier) {
    const tierGap = playerCurrentTier - clubTier;
    interestScore += Math.min(25, 10 + tierGap * 5);
    reasons.push(`Club tier step-up from Tier ${playerCurrentTier} to Tier ${clubTier}`);
  }
  // Case B: Club is LOWER tier than player's current club
  else {
    const lowerTierGap = clubTier - playerCurrentTier;
    
    // If player is a STARTER at a higher-tier club, lower-tier clubs rarely pursue
    if (isPlayerStarterAtCurrentClub && !isSaudi) {
      if (lowerTierGap >= 4) {
        interestScore -= 60; // Unrealistic move (e.g. Real Madrid starter to Tier 8/10)
      } else if (lowerTierGap >= 2) {
        interestScore -= 35;
      }
    } 
    // BUT IF PLAYER IS ON THE BENCH / RESERVES AT A HIGHER CLUB:
    else if (!isPlayerStarterAtCurrentClub && ovrDiff >= 0) {
      isBenchRaidOpportunity = true;
      interestScore += 30;
      reasons.push(`Realistic Bench Raid: Snapping up an elite bench player from Tier ${playerCurrentTier} to become undisputed starter`);
    }
  }

  // --------------------------------------------------------------------------
  // 4. ARABIAN LEAGUE EXCEPTION ("BREAKING THE BANK")
  // --------------------------------------------------------------------------
  let isSaudiMegaPursuit = false;
  if (isSaudi) {
    if (ovr >= 85) {
      isSaudiMegaPursuit = true;
      interestScore += 50;
      reasons.push(`Saudi Mega-Pursuit: Financially aggressive package targeting elite 85+ OVR star`);
    } else if (ovr >= 80 || isMercenary) {
      interestScore += 25;
      reasons.push(`Saudi League Financial Pull: Substantial wage package ready`);
    }
  }

  // --------------------------------------------------------------------------
  // 5. CONTRACT SITUATION (Free Agent, 1 Year Expiring, 2+ Years)
  // --------------------------------------------------------------------------
  if (isFreeAgent) {
    interestScore += 25;
    reasons.push(`Free Agent Opportunity: €0 transfer fee makes player an exceptionally attractive signing`);
  } else if (isExpiring) {
    interestScore += 18;
    reasons.push(`Contract Expiring (1 Year): Club senses a bargain transfer window deal`);
  }

  // --------------------------------------------------------------------------
  // 6. AGE & POTENTIAL UPSIDE
  // --------------------------------------------------------------------------
  if (age <= 21 && potential >= 86) {
    interestScore += 15;
    reasons.push(`High future resale and developmental upside (${age}yo with ${potential} potential)`);
  } else if (age <= 24 && ovr >= 78) {
    interestScore += 10;
  }

  // --------------------------------------------------------------------------
  // 7. AGENT NETWORKING & FAME IMPACT
  // --------------------------------------------------------------------------
  if (agentNetworkingSkill >= 70) {
    interestScore += 10;
    reasons.push(`Agent Networking (${agentNetworkingSkill}/100) actively pitching player to club leadership`);
  }
  if (fame >= 300) {
    interestScore += 10;
    reasons.push(`Commercial & Shirt-selling value from high player fame (${fame})`);
  }

  // --------------------------------------------------------------------------
  // 8. MERCENARY PERK SYNERGY
  // --------------------------------------------------------------------------
  if (isMercenary && isSaudi) {
    interestScore += 20;
    reasons.push(`Mercenary Profile: Mutual alignment on lucrative contract valuation`);
  } else if (isMercenary && clubTier <= 3 && !isSaudi) {
    interestScore -= 15; // Elite traditional clubs slightly wary of mercenary reputation
  }

  // --------------------------------------------------------------------------
  // 9. AFFORDABILITY & ECONOMIC REALITY CHECK
  // --------------------------------------------------------------------------
  const mvInfo = calculateRealisticPlayerMarketValue(player);
  const buyerFameVal = typeof club.clubFame === 'number' ? club.clubFame : club.prestigeStars * 2;
  const buyerFinances = club.finances || createFallbackClubFinances(buyerFameVal, club.countryCode);
  const affordCheck = checkTransferAffordability(buyerFinances, isFreeAgent ? 0 : mvInfo.marketValue, mvInfo.weeklyWageEstimate, isSaudi ? 3 : 4);

  if (!affordCheck.isAffordable && !isSaudiMegaPursuit) {
    interestScore -= 40;
  } else if (affordCheck.score >= 80) {
    interestScore += 8;
  }

  // 10. BAD REPUTATION TRANSFER HESITATION
  // Tier 1: 25% chance teams drop interest
  // Tier 2: 50% chance teams drop interest
  // Tier 3: 75% chance teams drop interest
  const badRepTier = player.badReputationTier || 0;
  if (badRepTier >= 1) {
    const dropChance = badRepTier === 1 ? 0.25 : badRepTier === 2 ? 0.50 : 0.75;
    if (Math.random() < dropChance) {
      interestScore = 0;
      reasons.push(`Withdrew Transfer Bid: Club leadership dropped interest due to Tier ${badRepTier} bad reputation`);
    }
  }

  // Clamp final interest score
  const finalScore = Math.max(0, Math.min(100, Math.round(interestScore)));

  // Classify interest
  let classification: ClubInterestClassification = 'Low Interest';
  if (finalScore >= 90) classification = 'Aggressive Pursuit';
  else if (finalScore >= 75) classification = 'Very Strong Interest';
  else if (finalScore >= 55) classification = 'Strong Interest';
  else if (finalScore >= 35) classification = 'Interested';
  else classification = 'Low Interest';

  const isOfferEligible = finalScore >= 55;

  return {
    club,
    clubTier,
    clubTierInfo,
    interestScore: finalScore,
    classification,
    isOfferEligible,
    starterOvr,
    ovrDifferenceVsStarter: ovrDiff,
    subPositionMatch: subPosUsed,
    tacticalAccommodation,
    isSaudiMegaPursuit,
    isBenchRaidOpportunity,
    reasons,
  };
}
