import { PlayerCardData, PlayerConfig } from '../types';
import { getStartingClubChemistry } from './badReputationSystem';
import { EditorTeamData, LeagueDatabase } from '../types/leagueEditor';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { findClubInLeagueDatabase } from './kitResolutionSystem';
import { cleanLeagueName, getCanonicalLeagueIds, getExpectedCountryForLeague } from './leagueSanitizer';
import { calculatePlayerMarketValue } from './transferMarketSystem';
import { PRO_CLUBS_DATABASE, ProClubDefinition } from './earlyCareerSystem';
import { detectPlayerContinentalCompetition } from './continentalScheduleIntegration';
import {
  findYouthTeamAndLeague,
  getYouthLeagueByCity,
  getYouthLeagueCountryCode,
  resolvePlayerYouthLeagueStrict,
  YouthTeamData,
  YouthLeagueData,
} from '../data/youthLeaguesDatabase';

export interface ClubCompetitiveContext {
  club: string;
  clubId: string;
  clubCountry: string;
  countryCode: string;
  league: string;
  leagueId: string;
  leagueTier: 1 | 2;
  canonicalD1Id?: string;
  canonicalD2Id?: string;
  isYouth?: boolean;
  kit?: any;
  emblem?: any;
}

type WorldSimulationSyncHook = (player: any, careerDb?: LeagueDatabase) => void;
let worldSimulationSyncHook: WorldSimulationSyncHook | null = null;

/**
 * Registers a world simulation cache rebind callback without introducing circular module imports.
 */
export function registerWorldSimulationSyncHook(hook: WorldSimulationSyncHook): void {
  worldSimulationSyncHook = hook;
}

function notifyWorldSimulationSync(player: any, careerDb?: LeagueDatabase): void {
  if (worldSimulationSyncHook) {
    try {
      worldSimulationSyncHook(player, careerDb);
    } catch (err) {
      console.warn('[ClubContextRebuilder] World simulation sync hook failed:', err);
    }
  }
}

export interface ResolveClubContextOptions {
  isYouthMode?: boolean;
  youthLeagueHint?: string;
  cityHint?: string;
  countryCodeHint?: string;
}

/**
 * Resolves authoritative club, country, league, and kit data for any club name or ID.
 * Zero silent fallback to England/London on Youth clubs or unrecognized clubs.
 */
export function resolveAuthoritativeClubContext(
  clubIdentifier: string,
  providedLeagueDb?: LeagueDatabase,
  options?: ResolveClubContextOptions
): ClubCompetitiveContext {
  const db = providedLeagueDb || getCareerLeagueDatabase();
  const youthCatalogMatch = findYouthTeamAndLeague(clubIdentifier);
  const matchedDbClub: EditorTeamData | null = findClubInLeagueDatabase(clubIdentifier, db);

  // If this club is a known Youth Academy (in YOUTH_LEAGUES_DATABASE or marked *_youth in DB), resolve strictly as Youth
  if (
    youthCatalogMatch ||
    options?.isYouthMode ||
    (matchedDbClub?.leagueId && matchedDbClub.leagueId.toLowerCase().includes('youth'))
  ) {
    const resolvedLeague =
      youthCatalogMatch?.league ||
      resolvePlayerYouthLeagueStrict({
        club: clubIdentifier,
        youthLeagueName: options?.youthLeagueHint,
        city: options?.cityHint,
        countryCode: options?.countryCodeHint || matchedDbClub?.countryCode,
        leagueId: matchedDbClub?.leagueId,
      });

    const countryCode = getYouthLeagueCountryCode(resolvedLeague.id) || (matchedDbClub?.countryCode || '').toUpperCase();
    return {
      club: youthCatalogMatch?.team.name || matchedDbClub?.name || clubIdentifier,
      clubId: matchedDbClub?.id || youthCatalogMatch?.team.id || `youth_${resolvedLeague.id}_${clubIdentifier.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      clubCountry: resolvedLeague.country,
      countryCode,
      league: resolvedLeague.name,
      leagueId: `youth_${resolvedLeague.id}`,
      leagueTier: 1,
      isYouth: true,
      kit: matchedDbClub?.kit ? { ...matchedDbClub.kit } : undefined,
      emblem: matchedDbClub?.emblem ? { ...matchedDbClub.emblem } : undefined,
    };
  }

  // Check early career pro clubs catalog if not matched in DB
  const proClubDef: ProClubDefinition | undefined = PRO_CLUBS_DATABASE.find(
    (c) => c.clubName.toLowerCase() === clubIdentifier.toLowerCase() || c.id === clubIdentifier
  );

  const clubName = matchedDbClub?.name || proClubDef?.clubName || clubIdentifier;
  const clubId = matchedDbClub?.id || proClubDef?.id || `club_${clubName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  // Determine Country Code & Country Name strictly from DB / leagueId / pro catalog first
  let countryCode = (matchedDbClub?.countryCode || proClubDef?.countryCode || '').toUpperCase().trim();
  let countryName = matchedDbClub?.countryName || proClubDef?.countryName || '';

  if ((!countryCode || countryCode === 'INT') && matchedDbClub?.leagueId) {
    const derivedFromLeague = getExpectedCountryForLeague(matchedDbClub.leagueId);
    if (derivedFromLeague) {
      countryCode = derivedFromLeague;
    }
  }

  // Fallback pattern inference only if DB entry lacked countryCode
  if (!countryCode || countryCode === 'INT') {
    const idLower = clubId.toLowerCase();
    const nameLower = clubName.toLowerCase();

    if (
      idLower.startsWith('arg_') ||
      idLower.startsWith('argentina') ||
      nameLower.includes('viaducto') ||
      nameLower.includes('sarand') ||
      nameLower.includes('xeneizes') ||
      nameLower.includes('millonarios plate') ||
      nameLower.includes('avellaneda') ||
      nameLower.includes('boca') ||
      nameLower.includes('river') ||
      nameLower.includes('racing club') ||
      nameLower.includes('independiente')
    ) {
      countryCode = 'ARG';
      countryName = 'Argentina';
    } else if (
      idLower.startsWith('bra_') ||
      idLower.startsWith('brazil') ||
      nameLower.includes('gávea') ||
      nameLower.includes('gavea') ||
      nameLower.includes('palestra') ||
      nameLower.includes('morumbi') ||
      nameLower.includes('itaquera') ||
      nameLower.includes('laranjeiras') ||
      nameLower.includes('beira-rio') ||
      nameLower.includes('flamengo') ||
      nameLower.includes('palmeiras') ||
      nameLower.includes('santos') ||
      nameLower.includes('corinthians') ||
      nameLower.includes('sao paulo') ||
      nameLower.includes('são paulo')
    ) {
      countryCode = 'BRA';
      countryName = 'Brazil';
    } else if (
      idLower.startsWith('eng_') ||
      idLower.startsWith('england') ||
      nameLower.includes('tottenham') ||
      nameLower.includes('lilywhites hotspur') ||
      nameLower.includes('arsenal') ||
      nameLower.includes('gunners fc') ||
      nameLower.includes('chelsea') ||
      nameLower === 'london fc' ||
      nameLower.includes('liverpool') ||
      nameLower.includes('mersey reds') ||
      nameLower.includes('manchester') ||
      nameLower.includes('eastlands sky blues') ||
      nameLower.includes('red devils united') ||
      nameLower.includes('aston villa') ||
      nameLower.includes('midlands villans') ||
      nameLower.includes('newcastle') ||
      nameLower.includes('tyneside magpies')
    ) {
      countryCode = 'ENG';
      countryName = 'England';
    } else if (
      idLower.startsWith('ger_') ||
      idLower.startsWith('germany') ||
      nameLower.includes('hoffenheim') ||
      nameLower.includes('kraichgau') ||
      nameLower.includes('bayern') ||
      nameLower.includes('bavaria rot') ||
      nameLower.includes('dortmund') ||
      nameLower.includes('westfalen schwarzgelb') ||
      nameLower.includes('leverkusen') ||
      nameLower.includes('rheinland werkself') ||
      nameLower.includes('leipzig') ||
      nameLower.includes('messestadt') ||
      nameLower.includes('frankfurt') ||
      nameLower.includes('mainhattan') ||
      nameLower.includes('stuttgart') ||
      nameLower.includes('schwaben') ||
      nameLower.includes('munster') ||
      nameLower.includes('münster') ||
      nameLower.includes('preussen') ||
      nameLower.includes('preußen') ||
      nameLower.includes('schalke') ||
      nameLower.includes('gelsenkirchen') ||
      nameLower.includes('hamburg') ||
      nameLower.includes('elbe raute') ||
      nameLower.includes('hertha') ||
      nameLower.includes('spree alte dame') ||
      nameLower.includes('koln') ||
      nameLower.includes('köln') ||
      nameLower.includes('domstadt') ||
      nameLower.includes('paderborn') ||
      nameLower.includes('nürnberg') ||
      nameLower.includes('nurnberg') ||
      nameLower.includes('franken') ||
      nameLower.includes('braunschweig') ||
      nameLower.includes('magdeburg') ||
      nameLower.includes('elversberg') ||
      nameLower.includes('karlsruhe') ||
      nameLower.includes('kaiserslautern') ||
      nameLower.includes('darmstadt') ||
      nameLower.includes('hannover')
    ) {
      countryCode = 'GER';
      countryName = 'Germany';
    } else if (
      idLower.startsWith('esp_') ||
      idLower.startsWith('spain') ||
      nameLower.includes('madrid') ||
      nameLower.includes('blancos cf') ||
      nameLower.includes('atlético aviación') ||
      nameLower.includes('atletico aviacion') ||
      nameLower.includes('catalunya fc') ||
      nameLower.includes('barcelona') ||
      nameLower.includes('sevilla') ||
      nameLower.includes('nervión') ||
      nameLower.includes('nervion') ||
      nameLower.includes('valencia') ||
      nameLower.includes('turia murciélagos') ||
      nameLower.includes('sociedad') ||
      nameLower.includes('gipuzkoa') ||
      nameLower.includes('betis') ||
      nameLower.includes('heliópolis') ||
      nameLower.includes('bilbao') ||
      nameLower.includes('bizkaia')
    ) {
      countryCode = 'ESP';
      countryName = 'Spain';
    } else if (
      idLower.startsWith('ita_') ||
      idLower.startsWith('italy') ||
      nameLower.includes('juventus') ||
      nameLower.includes('piemonte bianconeri') ||
      nameLower.includes('inter') ||
      nameLower.includes('nerazzurri milano') ||
      nameLower.includes('milan') ||
      nameLower.includes('rossoneri calcio') ||
      nameLower.includes('roma') ||
      nameLower.includes('capitale giallorossi') ||
      nameLower.includes('napoli') ||
      nameLower.includes('partenopei') ||
      nameLower.includes('lazio') ||
      nameLower.includes('aquile biancocelesti') ||
      nameLower.includes('atalanta') ||
      nameLower.includes('bergamo dea')
    ) {
      countryCode = 'ITA';
      countryName = 'Italy';
    } else if (
      idLower.startsWith('fr_') ||
      idLower.startsWith('fra_') ||
      idLower.startsWith('france') ||
      nameLower.includes('paris') ||
      nameLower.includes('psg') ||
      nameLower.includes('bleus de paris') ||
      nameLower.includes('marseille') ||
      nameLower.includes('phocéenne') ||
      nameLower.includes('monaco') ||
      nameLower.includes('principauté') ||
      nameLower.includes('lyon') ||
      nameLower.includes('rhône gones') ||
      nameLower.includes('lille') ||
      nameLower.includes('flandres dogues') ||
      nameLower.includes('rennes') ||
      nameLower.includes('bretagne rouge')
    ) {
      countryCode = 'FR';
      countryName = 'France';
    } else if (
      idLower.startsWith('por_') ||
      idLower.startsWith('portugal') ||
      nameLower.includes('benfica') ||
      nameLower.includes('águias encarnadas') ||
      nameLower.includes('sporting') ||
      nameLower.includes('alvalade leões') ||
      nameLower.includes('porto') ||
      nameLower.includes('invicta dragões') ||
      nameLower.includes('braga') ||
      nameLower.includes('guerreiros do minho')
    ) {
      countryCode = 'POR';
      countryName = 'Portugal';
    } else if (
      idLower.startsWith('sau_') ||
      idLower.startsWith('ksa_') ||
      idLower.startsWith('saudi') ||
      nameLower.includes('hilal') ||
      nameLower.includes('riyadh blue crescent') ||
      nameLower.includes('nassr') ||
      nameLower.includes('najd knights') ||
      nameLower.includes('ittihad') ||
      nameLower.includes('jeddah tigers') ||
      nameLower.includes('ahli') ||
      nameLower.includes('red sea royal')
    ) {
      countryCode = 'KSA';
      countryName = 'Saudi Arabia';
    } else if (options?.countryCodeHint) {
      countryCode = options.countryCodeHint.toUpperCase().trim();
    } else {
      console.warn(`[ClubContextRebuilder] Could not infer countryCode for club "${clubIdentifier}" — refusing silent England fallback.`);
      countryCode = '';
      countryName = 'Unknown';
    }
  }

  if (!countryName) {
    if (countryCode === 'ENG' || countryCode === 'GB' || countryCode === 'UK') countryName = 'England';
    else if (countryCode === 'ESP') countryName = 'Spain';
    else if (countryCode === 'GER' || countryCode === 'DEU') countryName = 'Germany';
    else if (countryCode === 'ITA') countryName = 'Italy';
    else if (countryCode === 'FR' || countryCode === 'FRA') countryName = 'France';
    else if (countryCode === 'POR' || countryCode === 'PRT') countryName = 'Portugal';
    else if (countryCode === 'ARG') countryName = 'Argentina';
    else if (countryCode === 'BRA') countryName = 'Brazil';
    else if (countryCode === 'KSA' || countryCode === 'SAU') countryName = 'Saudi Arabia';
    else countryName = 'International';
  }

  // Derive Canonical Leagues ONLY when countryCode is resolved
  const canonicalLeagues = countryCode ? getCanonicalLeagueIds(countryCode) : undefined;
  let leagueId = matchedDbClub?.leagueId || '';

  let isTier2 = false;
  if (leagueId) {
    if (
      (canonicalLeagues && leagueId === canonicalLeagues.d2Id) ||
      leagueId.endsWith('_d2') ||
      (db.leagues?.[leagueId] as any)?.tier === 2 ||
      db.leagues?.[leagueId]?.divisionTier === '2nd' ||
      proClubDef?.leagueTier === 2
    ) {
      isTier2 = true;
    }
  } else if (canonicalLeagues) {
    if (db.leagues?.[canonicalLeagues.d2Id]?.teamIds?.includes(clubId) || proClubDef?.leagueTier === 2) {
      isTier2 = true;
      leagueId = canonicalLeagues.d2Id;
    } else {
      leagueId = canonicalLeagues.d1Id;
    }
  }

  const leagueData = leagueId ? db.leagues?.[leagueId] : undefined;
  const leagueName = cleanLeagueName(leagueData?.name || proClubDef?.leagueName || (isTier2 ? '2nd Division' : '1st Division'));

  return {
    club: clubName,
    clubId,
    clubCountry: countryName,
    countryCode,
    league: leagueName,
    leagueId,
    leagueTier: isTier2 ? 2 : 1,
    canonicalD1Id: canonicalLeagues?.d1Id,
    canonicalD2Id: canonicalLeagues?.d2Id,
    isYouth: false,
    kit: matchedDbClub?.kit ? { ...matchedDbClub.kit } : undefined,
    emblem: matchedDbClub?.emblem ? { ...matchedDbClub.emblem } : undefined,
  };
}

export type ClubFederation = 'UEFA' | 'CONMEBOL' | 'AFC' | 'CAF' | 'CONCACAF' | 'OFC';

/**
 * Returns the canonical continental federation for a club based on country code and league
 */
export function getClubFederation(countryCode?: string, leagueName?: string, clubCountry?: string): ClubFederation {
  const code = (countryCode || clubCountry || '').toUpperCase().trim();
  const lName = (leagueName || '').toLowerCase();

  // Europe (UEFA)
  if (
    ['ENG', 'GB', 'UK', 'ESP', 'GER', 'DEU', 'ITA', 'FR', 'FRA', 'NED', 'POR', 'PRT', 'BEL', 'SCO', 'TUR', 'AUT', 'SUI', 'GRE', 'UKR', 'RUS', 'POL', 'CZE', 'CRO', 'DEN', 'NOR', 'SWE'].includes(code) ||
    lName.includes('premier league') || lName.includes('english league') || lName.includes('laliga') || lName.includes('la liga') || lName.includes('spanish league') || lName.includes('serie a') || lName.includes('italian league') || lName.includes('bundesliga') || lName.includes('german league') || lName.includes('ligue 1') || lName.includes('ligue 2') || lName.includes('french league') || lName.includes('eredivisie') || lName.includes('liga portugal') || lName.includes('portuguese league') || lName.includes('championship')
  ) {
    return 'UEFA';
  }

  // South America (CONMEBOL)
  if (
    ['ARG', 'BRA', 'COL', 'CHI', 'URU', 'PAR', 'ECU', 'PER', 'VEN', 'BOL'].includes(code) ||
    lName.includes('brasileir') || lName.includes('brazilian league') || lName.includes('argentin') || lName.includes('libertadores') || lName.includes('sudamericana')
  ) {
    return 'CONMEBOL';
  }

  // Asia (AFC)
  if (
    ['KSA', 'SAU', 'SAUDI ARABIA', 'QAT', 'UAE', 'JPN', 'KOR', 'CHN', 'AUS', 'IRN', 'UZB', 'IRQ'].includes(code) ||
    lName.includes('saudi') || lName.includes('roshn') || lName.includes('j-league') || lName.includes('k league')
  ) {
    return 'AFC';
  }

  // North/Central America (CONCACAF)
  if (['USA', 'MEX', 'CAN', 'CRC', 'HON', 'JAM', 'PAN'].includes(code) || lName.includes('mls') || lName.includes('liga mx')) {
    return 'CONCACAF';
  }

  // Africa (CAF)
  if (['EGY', 'MAR', 'NGA', 'RSA', 'GHA', 'SEN', 'ALG', 'TUN'].includes(code)) {
    return 'CAF';
  }

  if (code) {
    console.warn(`[ClubContextRebuilder] Unrecognized federation for code="${code}" league="${leagueName || ''}" — defaulting to UEFA.`);
  }
  return 'UEFA';
}

/**
 * Checks whether a continental competition ID belongs to the given federation
 */
export function isCompetitionValidForFederation(compId: string, federation: ClubFederation): boolean {
  if (federation === 'UEFA') {
    return ['UEFA_CL', 'UEFA_EL', 'UEFA_ECL', 'UEFA_SC'].includes(compId);
  }
  if (federation === 'CONMEBOL') {
    return ['CONMEBOL_LIB', 'CONMEBOL_SUD', 'CONMEBOL_REC'].includes(compId);
  }
  if (federation === 'AFC') {
    return ['AFC_CL', 'AFC_CUP'].includes(compId);
  }
  if (federation === 'CAF') {
    return ['CAF_CL', 'CAF_CONFED_CUP', 'CAF_CC', 'CAF_SC'].includes(compId);
  }
  if (federation === 'CONCACAF') {
    return ['CONCACAF_CC', 'CONCACAF_CAC'].includes(compId);
  }
  if (federation === 'OFC') {
    return ['OFC_CL'].includes(compId);
  }
  return false;
}

export function rebuildPlayerCompetitiveContextOnTransfer<T extends PlayerConfig | PlayerCardData>(
  player: T,
  newClubIdentifier: string,
  overrides?: Partial<T>,
  providedLeagueDb?: LeagueDatabase
): T {
  const careerDb = providedLeagueDb || getCareerLeagueDatabase();
  const safeOverrides: Partial<T> | undefined =
    overrides && !('leagues' in (overrides as any) && 'teams' in (overrides as any))
      ? overrides
      : undefined;

  const authoritative = resolveAuthoritativeClubContext(newClubIdentifier, careerDb);
  const newFederation = getClubFederation(authoritative.countryCode, authoritative.league, authoritative.clubCountry);

  const isSameClub =
    Boolean(player.clubId && player.clubId === authoritative.clubId) ||
    Boolean((player.club || '').trim().toLowerCase() === authoritative.club.trim().toLowerCase());

  const updated: any = {
    ...player,
    ...safeOverrides,
    club: authoritative.club,
    clubId: authoritative.clubId,
    clubCountry: authoritative.clubCountry,
    countryCode: authoritative.countryCode,
    country: player.country || authoritative.clubCountry,
    league: authoritative.league,
    leagueId: authoritative.leagueId,
    leagueTier: authoritative.leagueTier,
    kit: authoritative.kit || (player as any).kit,
    emblem: authoritative.emblem || (player as any).emblem,
    isFreeAgent: false,
    isProPlayer: true,
    isProfessional: true,
    isCareerModeActive: true,
    careerStage: 'PROFESSIONAL',
    // Strictly wipe stale Youth Academy markers upon Pro transfer/transition
    isYouthCareerActive: false,
    youthTeamName: undefined,
    youthLeagueName: undefined,
    youthLeagueTeam: undefined,
    isBigClubYouth: false,
    youthClubChoice: undefined,
    youthLeagueStaminaPenalty: 0,
    chemistry: (safeOverrides as any)?.chemistry ?? getStartingClubChemistry((player as any).badReputationTier || 0),
    requestedTransfer: false,
    pendingTransferRequest: undefined,
    activeInternationalDuty: undefined,
    isRepresentingNationalTeam: false,
    activeMatchResult: undefined,
  };

  // Clean detection object: strip previous club's continental qualification flags and ranks when transferring
  const cleanPlayerForDetection = {
    ...player,
    ...safeOverrides,
    club: authoritative.club,
    clubId: authoritative.clubId,
    clubCountry: authoritative.clubCountry,
    countryCode: authoritative.countryCode,
    league: authoritative.league,
    leagueId: authoritative.leagueId,
    leagueTier: authoritative.leagueTier,
    isProPlayer: true,
    isProfessional: true,
    isYouthCareerActive: false,
    isCareerModeActive: true,
    careerStage: 'PROFESSIONAL',
    squadDestination: (safeOverrides as any)?.squadDestination || 'First Team',
    qualifiedContinental: isSameClub ? (player as any).qualifiedContinental : undefined,
    qualifiedContinentalCompId: isSameClub ? (player as any).qualifiedContinentalCompId : undefined,
    continentalCompId: isSameClub ? (player as any).continentalCompId : undefined,
    previousLeagueFinish: isSameClub ? (player as any).previousLeagueFinish : undefined,
    leagueFinishRank: isSameClub ? (player as any).leagueFinishRank : undefined,
    lastSeasonRank: isSameClub ? (player as any).lastSeasonRank : undefined,
    isDomesticCupWinner: isSameClub ? Boolean((player as any).isDomesticCupWinner) : false,
  };

  // Detect if destination club has continental qualification for next season using authoritative Career DB
  const detectedNewComp = detectPlayerContinentalCompetition(cleanPlayerForDetection as any, careerDb);

  // Validate that detected competition strictly matches the destination club's federation
  const validCompId =
    detectedNewComp && isCompetitionValidForFederation(detectedNewComp, newFederation)
      ? detectedNewComp
      : undefined;

  let newCompShort: 'ucl' | 'uel' | 'uecl' | 'libertadores' | 'sudamericana' | 'afc_elite' | 'afc_two' | undefined;
  if (validCompId === 'UEFA_CL') newCompShort = 'ucl';
  else if (validCompId === 'UEFA_EL') newCompShort = 'uel';
  else if (validCompId === 'UEFA_ECL') newCompShort = 'uecl';
  else if (validCompId === 'CONMEBOL_LIB') newCompShort = 'libertadores';
  else if (validCompId === 'CONMEBOL_SUD') newCompShort = 'sudamericana';
  else if (validCompId === 'AFC_CL') newCompShort = 'afc_elite';
  else if (validCompId === 'AFC_CUP') newCompShort = 'afc_two';

  const overrideCompId = (safeOverrides as any)?.qualifiedContinentalCompId;
  const validOverrideCompId =
    overrideCompId && isCompetitionValidForFederation(overrideCompId, newFederation) ? overrideCompId : undefined;

  updated.qualifiedContinental =
    (safeOverrides as any)?.qualifiedContinental !== undefined
      ? (safeOverrides as any).qualifiedContinental &&
        isCompetitionValidForFederation(validOverrideCompId || validCompId || '', newFederation)
        ? (safeOverrides as any).qualifiedContinental
        : newCompShort
      : isSameClub
      ? isCompetitionValidForFederation((player as any).qualifiedContinentalCompId || '', newFederation)
        ? (player as any).qualifiedContinental || newCompShort
        : newCompShort
      : newCompShort;

  updated.qualifiedContinentalCompId =
    validOverrideCompId !== undefined
      ? validOverrideCompId
      : isSameClub
      ? isCompetitionValidForFederation((player as any).qualifiedContinentalCompId || '', newFederation)
        ? (player as any).qualifiedContinentalCompId || validCompId || undefined
        : validCompId || undefined
      : validCompId || undefined;

  updated.continentalCompId = updated.qualifiedContinentalCompId;

  updated.previousLeagueFinish =
    (safeOverrides as any)?.previousLeagueFinish !== undefined
      ? (safeOverrides as any).previousLeagueFinish
      : isSameClub
      ? (player as any).previousLeagueFinish
      : undefined;

  updated.leagueFinishRank =
    (safeOverrides as any)?.leagueFinishRank !== undefined
      ? (safeOverrides as any).leagueFinishRank
      : isSameClub
      ? (player as any).leagueFinishRank
      : undefined;

  updated.lastSeasonRank =
    (safeOverrides as any)?.lastSeasonRank !== undefined
      ? (safeOverrides as any).lastSeasonRank
      : isSameClub
      ? (player as any).lastSeasonRank
      : undefined;

  updated.isDomesticCupWinner =
    (safeOverrides as any)?.isDomesticCupWinner !== undefined
      ? (safeOverrides as any).isDomesticCupWinner
      : isSameClub
      ? Boolean((player as any).isDomesticCupWinner)
      : false;

  // Recalculate market value based on new context
  if (typeof updated.marketValue === 'number' || typeof (player as any).marketValue === 'number') {
    try {
      const mvRes = calculatePlayerMarketValue(updated);
      updated.marketValue = mvRes.marketValue;
    } catch {
      // ignore
    }
  }

  notifyWorldSimulationSync(updated, careerDb);

  return updated as T;
}

export interface YouthSwitchOptions {
  youthLeagueName?: string;
  city?: string;
  country?: string;
  isInternational?: boolean;
  overrides?: Record<string, any>;
}

/**
 * Rebuilds a Youth player's competitive context atomically upon switching academies or joining a Youth club.
 * Ensures zero stale city, league, leagueId, countryCode, or continental competition flags remain.
 */
export function rebuildPlayerYouthContextOnSwitch<T extends PlayerConfig | PlayerCardData>(
  player: T,
  targetTeamOrName: string | Pick<YouthTeamData, 'name' | 'youthLeague' | 'city' | 'country'> & { id?: string },
  options?: YouthSwitchOptions
): T {
  const clubName = typeof targetTeamOrName === 'string' ? targetTeamOrName : targetTeamOrName.name;
  const teamObj = typeof targetTeamOrName === 'string' ? undefined : targetTeamOrName;

  const catalogMatch = findYouthTeamAndLeague(clubName);
  const leagueHint = options?.youthLeagueName || teamObj?.youthLeague;
  const cityHint = options?.city || teamObj?.city;
  const countryHint = options?.country || teamObj?.country;

  const resolvedLeague: YouthLeagueData =
    (leagueHint ? getYouthLeagueByCity(leagueHint) : null) ||
    catalogMatch?.league ||
    resolvePlayerYouthLeagueStrict({
      club: clubName,
      youthLeagueName: leagueHint,
      city: cityHint,
      clubCountry: countryHint,
      countryCode: getYouthLeagueCountryCode(cityHint || countryHint),
    });

  const targetCountryCode =
    getYouthLeagueCountryCode(resolvedLeague.id) ||
    getYouthLeagueCountryCode(countryHint || cityHint) ||
    (player as any).countryCode ||
    '';
  const targetCountryName = resolvedLeague.country || countryHint || 'Unknown';
  const targetCity = resolvedLeague.city || cityHint || (player as any).city || '';
  const targetClubId =
    catalogMatch?.team.id ||
    teamObj?.id ||
    `youth_${resolvedLeague.id}_${clubName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const trainedCountries = [...((player as any).youthTrainedCountries || [])];
  if (options?.isInternational && targetCountryName && !trainedCountries.includes(targetCountryName)) {
    trainedCountries.push(targetCountryName);
  }

  const updated: any = {
    ...player,
    ...(options?.overrides || {}),
    club: catalogMatch?.team.name || clubName,
    clubId: targetClubId,
    youthTeamName: catalogMatch?.team.name || clubName,
    youthLeagueTeam: catalogMatch?.team.name || clubName,
    youthLeagueName: resolvedLeague.name,
    league: resolvedLeague.name,
    leagueId: `youth_${resolvedLeague.id}`,
    leagueTier: undefined,
    city: targetCity,
    startingCity: (player as any).startingCity || targetCity,
    clubCountry: targetCountryName,
    countryCode: targetCountryCode,
    youthTrainedCountries: trainedCountries,
    isYouthCareerActive: true,
    isProPlayer: false,
    isProfessional: false,
    isCareerModeActive: false,
    isFreeAgent: false,
    careerStage: 'YOUTH_ACADEMY',
    qualifiedContinental: undefined,
    qualifiedContinentalCompId: undefined,
    continentalCompId: undefined,
    previousLeagueFinish: undefined,
    leagueFinishRank: undefined,
    lastSeasonRank: undefined,
    isDomesticCupWinner: false,
    activeMatchResult: undefined,
    pendingTransferRequest: undefined,
    requestedTransfer: false,
  };

  notifyWorldSimulationSync(updated);

  return updated as T;
}
