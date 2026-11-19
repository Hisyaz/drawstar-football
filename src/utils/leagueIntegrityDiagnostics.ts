import { PlayerCardData, PlayerConfig } from '../types';
import { LeagueDatabase, EditorTeamData } from '../types/leagueEditor';
import { DEFAULT_LEAGUE_DATABASE } from '../data/defaultLeagues';
import { YOUTH_LEAGUES_DATABASE, YouthLeagueData, YouthTeamData } from '../data/youthLeaguesDatabase';
import { getCanonicalLeagueIds, getExpectedCountryForLeague } from './leagueSanitizer';

export function normalizeYouthCityKey(city?: string): string {
  const clean = (city || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (!clean) return '';
  if (clean.includes('sao paulo') || clean === 'sao_paulo') return 'sao_paulo';
  if (clean.includes('buenos aires') || clean === 'buenos_aires') return 'buenos_aires';
  if (clean.includes('madrid')) return 'madrid';
  if (clean.includes('london') || clean.includes('londres')) return 'london';
  if (clean.includes('paris')) return 'paris';
  if (clean.includes('roma') || clean.includes('rome')) return 'roma';
  if (clean.includes('berlin')) return 'berlin';
  if (clean.includes('lisboa') || clean.includes('lisbon')) return 'lisboa';
  if (clean.includes('riyadh') || clean.includes('riad')) return 'riyadh';
  return clean.replace(/\s+/g, '_');
}

export function getExpectedCountryCodeForCity(cityKey: string): string {
  switch (cityKey) {
    case 'sao_paulo':
      return 'BRA';
    case 'buenos_aires':
      return 'ARG';
    case 'madrid':
      return 'ESP';
    case 'london':
      return 'ENG';
    case 'paris':
      return 'FR';
    case 'roma':
      return 'ITA';
    case 'berlin':
      return 'GER';
    case 'lisboa':
      return 'POR';
    case 'riyadh':
      return 'KSA';
    default:
      return '';
  }
}

export type IntegritySeverity = 'critical' | 'warning';

export interface IntegrityFinding {
  code:
    | 'YOUTH_PREMATURE_PRO_LEAGUE'
    | 'YOUTH_CITY_LEAGUE_MISMATCH'
    | 'YOUTH_STALE_CONTINENTAL_FLAG'
    | 'PRO_COUNTRY_LEAGUE_MISMATCH'
    | 'PRO_WRONG_FEDERATION_COMPETITION'
    | 'PRO_STALE_YOUTH_FLAGS'
    | 'OPPONENT_CROSS_COUNTRY_CONTAMINATION'
    | 'WORLD_CACHE_PLAYER_CLUB_DESYNC'
    | 'DB_DUPLICATE_TEAM_ACROSS_LEAGUES'
    | 'DB_FOREIGN_TEAM_IN_LEAGUE';
  severity: IntegritySeverity;
  message: string;
  details?: Record<string, unknown>;
}

export interface PlayerContextAuditResult {
  isValid: boolean;
  mode: 'youth' | 'pro' | 'free_agent';
  resolvedCountryCode: string;
  resolvedLeagueId: string;
  findings: IntegrityFinding[];
}

export interface LeagueDbAuditResult {
  isValid: boolean;
  findings: IntegrityFinding[];
  duplicateTeamIds: string[];
  foreignContaminations: Array<{ leagueId: string; teamId: string; teamName: string; expectedCountry: string; actualCountry: string }>;
}

const FEDERATION_BY_COUNTRY: Record<string, 'UEFA' | 'CONMEBOL' | 'AFC'> = {
  ENG: 'UEFA',
  GB: 'UEFA',
  UK: 'UEFA',
  ESP: 'UEFA',
  FR: 'UEFA',
  FRA: 'UEFA',
  GER: 'UEFA',
  DEU: 'UEFA',
  ITA: 'UEFA',
  POR: 'UEFA',
  PRT: 'UEFA',
  ARG: 'CONMEBOL',
  BRA: 'CONMEBOL',
  KSA: 'AFC',
  SAU: 'AFC',
};

const COMP_FEDERATION_BY_ID: Record<string, 'UEFA' | 'CONMEBOL' | 'AFC' | 'CONCACAF' | 'CAF' | 'OFC'> = {
  UEFA_CL: 'UEFA',
  UEFA_EL: 'UEFA',
  UEFA_ECL: 'UEFA',
  UEFA_SC: 'UEFA',
  CONMEBOL_LIB: 'CONMEBOL',
  CONMEBOL_SUD: 'CONMEBOL',
  CONMEBOL_REC: 'CONMEBOL',
  AFC_CL: 'AFC',
  AFC_CUP: 'AFC',
  CONCACAF_CC: 'CONCACAF',
  CONCACAF_CAC: 'CONCACAF',
  CAF_CL: 'CAF',
  CAF_CONFED_CUP: 'CAF',
  CAF_SC: 'CAF',
  OFC_CL: 'OFC',
};

export function normalizeCountryCode(code?: string): string {
  const c = (code || '').toUpperCase().trim();
  if (c === 'FRA') return 'FR';
  if (c === 'DEU') return 'GER';
  if (c === 'PRT') return 'POR';
  if (c === 'SAU') return 'KSA';
  if (c === 'UK' || c === 'GB') return 'ENG';
  return c;
}

export function findYouthClubLocation(clubName?: string): { leagueKey: string; league: YouthLeagueData; team: YouthTeamData } | null {
  const target = (clubName || '').trim().toLowerCase();
  if (!target) return null;
  for (const [leagueKey, league] of Object.entries(YOUTH_LEAGUES_DATABASE)) {
    const match = league.teams.find((t) => t.name.toLowerCase() === target);
    if (match) {
      return { leagueKey, league, team: match };
    }
  }
  return null;
}

export function findCanonicalClubInDb(
  clubNameOrId: string,
  db: LeagueDatabase
): EditorTeamData | null {
  const target = (clubNameOrId || '').trim().toLowerCase();
  if (!target) return null;
  const teams = Object.values(db?.teams || {});
  const exact = teams.find(
    (t) => t.id.toLowerCase() === target || t.name.toLowerCase() === target
  );
  if (exact) return exact;
  const defaultTeams = Object.values(DEFAULT_LEAGUE_DATABASE.teams || {});
  return (
    defaultTeams.find(
      (t) => t.id.toLowerCase() === target || t.name.toLowerCase() === target
    ) || null
  );
}

/**
 * Audits a player's Youth/Pro competitive context and detects any cross-country,
 * premature Pro, or continental contamination.
 */
export function auditPlayerCompetitiveContext(
  player: Partial<PlayerConfig & PlayerCardData>,
  careerDb: LeagueDatabase,
  observedOpponents?: Array<{ name: string; leagueId?: string; countryCode?: string }>
): PlayerContextAuditResult {
  const findings: IntegrityFinding[] = [];
  const clubName = (player.club || '').trim();
  const stage = (player.careerStage || '').toUpperCase();
  const isFreeAgent = stage === 'FREE_AGENT' || player.isFreeAgent === true || clubName === 'Free Agent';

  if (isFreeAgent) {
    return {
      isValid: true,
      mode: 'free_agent',
      resolvedCountryCode: normalizeCountryCode(player.countryCode),
      resolvedLeagueId: '',
      findings: [],
    };
  }

  const youthMatch = findYouthClubLocation(clubName);
  const explicitlyPro =
    stage === 'PROFESSIONAL' ||
    stage === 'PRO' ||
    stage === 'SENIOR' ||
    player.isProPlayer === true ||
    player.isProfessional === true ||
    player.isCareerModeActive === true;

  const isYouthMode =
    !explicitlyPro &&
    (player.isYouthCareerActive === true || Boolean(youthMatch) || (player.age || 10) < 16 || stage === 'YOUTH_ACADEMY');

  if (isYouthMode) {
    const cityKey = normalizeYouthCityKey(player.startingCity || player.city || youthMatch?.league.city);
    const expectedCountry = normalizeCountryCode(
      cityKey ? getExpectedCountryCodeForCity(cityKey) : getExpectedCountryCodeForCity(normalizeYouthCityKey(youthMatch?.league.country))
    );
    const expectedYouthLeagueId = youthMatch ? `youth_${youthMatch.leagueKey}` : cityKey ? `youth_${cityKey}` : '';

    // Check 1: Did a Youth club/city resolve to a Pro league or England fallback?
    const leagueStr = (player.league || '').toLowerCase();
    const leagueIdStr = (player.leagueId || '').toLowerCase();
    if (
      leagueIdStr.includes('_d1') ||
      leagueIdStr.includes('_d2') ||
      leagueStr.includes('english league') ||
      leagueStr.includes('premier league') ||
      (expectedCountry !== 'ENG' && normalizeCountryCode(player.countryCode) === 'ENG')
    ) {
      findings.push({
        code: 'YOUTH_PREMATURE_PRO_LEAGUE',
        severity: 'critical',
        message: `Youth player "${player.name}" at "${clubName}" (${player.startingCity || player.city || 'unknown city'}) leaked into Pro/English league context (${player.leagueId || player.league || player.countryCode}).`,
        details: { clubName, city: player.city, startingCity: player.startingCity, league: player.league, leagueId: player.leagueId, countryCode: player.countryCode },
      });
    }

    // Check 2: If club belongs to a specific Youth League, city/youthLeagueName must match
    if (youthMatch && cityKey && youthMatch.leagueKey !== cityKey && player.youthLeagueName && !player.youthLeagueName.toLowerCase().includes(youthMatch.league.name.toLowerCase())) {
      findings.push({
        code: 'YOUTH_CITY_LEAGUE_MISMATCH',
        severity: 'critical',
        message: `Youth academy "${clubName}" belongs to ${youthMatch.league.name} (${youthMatch.leagueKey}) but player points to "${player.youthLeagueName}" / city "${cityKey}".`,
        details: { youthLeagueKey: youthMatch.leagueKey, playerCityKey: cityKey, youthLeagueName: player.youthLeagueName },
      });
    }

    // Check 3: Youth players must not retain Pro continental qualifications
    if ((player as any).qualifiedContinentalCompId || (player as any).continentalCompId) {
      findings.push({
        code: 'YOUTH_STALE_CONTINENTAL_FLAG',
        severity: 'warning',
        message: `Youth player carries stale continental flag (${(player as any).qualifiedContinentalCompId || (player as any).continentalCompId}).`,
      });
    }

    // Check 4: Verify simulated opponent list contains only teams from the expected Youth League (stripping U10-U17 age suffixes)
    if (observedOpponents && observedOpponents.length > 0 && youthMatch) {
      const stripAgeSuffix = (name: string) => name.replace(/\s+u\d{2}$/i, '').trim().toLowerCase();
      const validNames = new Set(youthMatch.league.teams.map((t) => stripAgeSuffix(t.name)));
      const invalidOpps = observedOpponents.filter((o) => !validNames.has(stripAgeSuffix(o.name || '')));
      if (invalidOpps.length > 0) {
        findings.push({
          code: 'OPPONENT_CROSS_COUNTRY_CONTAMINATION',
          severity: 'critical',
          message: `Youth fixture generated ${invalidOpps.length} foreign/non-league opponents (${invalidOpps.slice(0, 3).map((o) => o.name).join(', ')}) for ${youthMatch.league.name}.`,
          details: { invalidOpponents: invalidOpps.map((o) => o.name), expectedLeague: youthMatch.league.name },
        });
      }
    }

    return {
      isValid: findings.length === 0,
      mode: 'youth',
      resolvedCountryCode: expectedCountry,
      resolvedLeagueId: expectedYouthLeagueId,
      findings,
    };
  }

  // PROFESSIONAL MODE AUDIT
  const dbTeam = findCanonicalClubInDb(clubName, careerDb);
  const expectedCountry = normalizeCountryCode(dbTeam?.countryCode || player.countryCode);
  const expectedLeagueId = dbTeam?.leagueId || player.leagueId || '';
  const actualPlayerCountry = normalizeCountryCode(player.countryCode);
  const actualPlayerLeagueId = player.leagueId || '';

  if (dbTeam && expectedCountry && actualPlayerCountry && actualPlayerCountry !== expectedCountry) {
    findings.push({
      code: 'PRO_COUNTRY_LEAGUE_MISMATCH',
      severity: 'critical',
      message: `Club "${dbTeam.name}" belongs to ${expectedCountry} (${expectedLeagueId}), but player holds countryCode="${actualPlayerCountry}" and leagueId="${actualPlayerLeagueId}".`,
      details: { club: dbTeam.name, expectedCountry, expectedLeagueId, actualPlayerCountry, actualPlayerLeagueId },
    });
  }

  if (dbTeam && actualPlayerLeagueId && dbTeam.leagueId && actualPlayerLeagueId !== dbTeam.leagueId) {
    findings.push({
      code: 'PRO_COUNTRY_LEAGUE_MISMATCH',
      severity: 'critical',
      message: `Club "${dbTeam.name}" belongs to leagueId="${dbTeam.leagueId}", but player carries stale leagueId="${actualPlayerLeagueId}".`,
      details: { club: dbTeam.name, dbLeagueId: dbTeam.leagueId, actualPlayerLeagueId },
    });
  }

  // Check federation vs continental competition consistency (e.g., BRA/ARG must never hold UEFA_CL)
  const expectedFed = FEDERATION_BY_COUNTRY[expectedCountry];
  const compId = (player as any).qualifiedContinentalCompId || (player as any).continentalCompId;
  if (expectedFed && compId) {
    const compFed = COMP_FEDERATION_BY_ID[compId];
    if (compFed && compFed !== expectedFed) {
      findings.push({
        code: 'PRO_WRONG_FEDERATION_COMPETITION',
        severity: 'critical',
        message: `Pro player in ${expectedCountry} (${expectedFed}) holds cross-confederation competition "${compId}" (${compFed}).`,
        details: { expectedCountry, expectedFed, compId, compFed },
      });
    }
  }

  // Check Pro player still carrying stale Youth League markers
  if (player.isYouthCareerActive === true || player.youthLeagueName) {
    findings.push({
      code: 'PRO_STALE_YOUTH_FLAGS',
      severity: 'warning',
      message: `Professional player at "${clubName}" still carries Youth flags (isYouthCareerActive=${String(player.isYouthCareerActive)}, youthLeagueName="${player.youthLeagueName || ''}").`,
    });
  }

  // Verify observed Pro opponents belong to the same country/tier
  if (observedOpponents && observedOpponents.length > 0 && expectedCountry) {
    const badOpps = observedOpponents.filter((opp) => {
      const oppTeam = findCanonicalClubInDb(opp.name, careerDb);
      const oppCountry = normalizeCountryCode(opp.countryCode || oppTeam?.countryCode);
      return oppCountry && oppCountry !== expectedCountry;
    });
    if (badOpps.length > 0) {
      findings.push({
        code: 'OPPONENT_CROSS_COUNTRY_CONTAMINATION',
        severity: 'critical',
        message: `Pro fixture in ${expectedCountry} (${expectedLeagueId}) mixed ${badOpps.length} foreign clubs: ${badOpps.slice(0, 4).map((o) => o.name).join(', ')}.`,
        details: { expectedCountry, expectedLeagueId, badOpponents: badOpps.map((o) => o.name) },
      });
    }
  }

  return {
    isValid: findings.filter((f) => f.severity === 'critical').length === 0,
    mode: 'pro',
    resolvedCountryCode: expectedCountry,
    resolvedLeagueId: expectedLeagueId,
    findings,
  };
}

/**
 * Scans every league in a LeagueDatabase to identify duplicate club IDs across leagues
 * or foreign clubs trapped inside a domestic league.
 */
export function auditLeagueDatabaseContamination(db: LeagueDatabase): LeagueDbAuditResult {
  const findings: IntegrityFinding[] = [];
  const teamToLeagues = new Map<string, string[]>();
  const duplicateTeamIds: string[] = [];
  const foreignContaminations: Array<{
    leagueId: string;
    teamId: string;
    teamName: string;
    expectedCountry: string;
    actualCountry: string;
  }> = [];

  const leagues = Object.values(db?.leagues || {});
  for (const league of leagues) {
    const expectedCountry = normalizeCountryCode(
      league.countryCode || getExpectedCountryForLeague(league.id)
    );
    const seenInThisLeague = new Set<string>();

    for (const teamId of league.teamIds || []) {
      const list = teamToLeagues.get(teamId) || [];
      if (!list.includes(league.id)) {
        list.push(league.id);
        teamToLeagues.set(teamId, list);
      }

      if (seenInThisLeague.has(teamId)) continue;
      seenInThisLeague.add(teamId);

      const team = db.teams?.[teamId] || DEFAULT_LEAGUE_DATABASE.teams?.[teamId];
      if (!team) continue;

      const actualCountry = normalizeCountryCode(team.countryCode);
      if (actualCountry && expectedCountry && actualCountry !== expectedCountry) {
        foreignContaminations.push({
          leagueId: league.id,
          teamId: team.id,
          teamName: team.name,
          expectedCountry,
          actualCountry,
        });
      }
    }
  }

  for (const [teamId, leagueIds] of teamToLeagues.entries()) {
    const domesticLeagues = leagueIds.filter((id) => !id.includes('cup') && !id.includes('state_only'));
    if (domesticLeagues.length > 1) {
      duplicateTeamIds.push(teamId);
    }
  }

  if (duplicateTeamIds.length > 0) {
    findings.push({
      code: 'DB_DUPLICATE_TEAM_ACROSS_LEAGUES',
      severity: 'critical',
      message: `${duplicateTeamIds.length} club ID(s) appear simultaneously in multiple domestic leagues: ${duplicateTeamIds.slice(0, 6).join(', ')}`,
      details: { duplicateTeamIds },
    });
  }

  if (foreignContaminations.length > 0) {
    findings.push({
      code: 'DB_FOREIGN_TEAM_IN_LEAGUE',
      severity: 'critical',
      message: `${foreignContaminations.length} foreign club entry(ies) detected inside domestic league teamIds lists.`,
      details: { sample: foreignContaminations.slice(0, 6) },
    });
  }

  return {
    isValid: findings.length === 0,
    findings,
    duplicateTeamIds,
    foreignContaminations,
  };
}

/**
 * Non-destructive save-load repair utility that reconciles a legacy corrupted PlayerConfig
 * with canonical Youth or Pro LeagueDatabase ownership.
 */
export function repairCorruptedCareerContext(
  player: PlayerConfig,
  careerDb: LeagueDatabase
): { repairedPlayer: PlayerConfig; repairsApplied: string[] } {
  const repairsApplied: string[] = [];
  const next: PlayerConfig = { ...player };
  const youthMatch = findYouthClubLocation(next.club);
  const stage = (next.careerStage || '').toUpperCase();
  const explicitlyPro =
    stage === 'PROFESSIONAL' ||
    stage === 'PRO' ||
    stage === 'SENIOR' ||
    next.isProPlayer === true ||
    (next as any).isProfessional === true ||
    next.isCareerModeActive === true;

  if (!explicitlyPro && (next.isYouthCareerActive === true || youthMatch)) {
    if (youthMatch) {
      if (next.youthLeagueName !== youthMatch.league.name) {
        next.youthLeagueName = youthMatch.league.name;
        repairsApplied.push(`Aligned youthLeagueName -> ${youthMatch.league.name}`);
      }
      if (next.league !== youthMatch.league.name) {
        next.league = youthMatch.league.name;
        repairsApplied.push(`Cleared leaked league -> ${youthMatch.league.name}`);
      }
      if (next.leagueId !== `youth_${youthMatch.leagueKey}`) {
        next.leagueId = `youth_${youthMatch.leagueKey}`;
        repairsApplied.push(`Aligned youth leagueId -> youth_${youthMatch.leagueKey}`);
      }
      const youthCountryCode = getExpectedCountryCodeForCity(normalizeYouthCityKey(youthMatch.league.city));
      if (youthCountryCode && normalizeCountryCode(next.countryCode) !== normalizeCountryCode(youthCountryCode)) {
        next.countryCode = youthCountryCode;
        next.clubCountry = youthMatch.league.country;
        repairsApplied.push(`Aligned Youth countryCode -> ${youthCountryCode}`);
      }
    }
    if ((next as any).qualifiedContinentalCompId) {
      (next as any).qualifiedContinentalCompId = undefined;
      repairsApplied.push('Cleared stale qualifiedContinentalCompId on Youth save');
    }
    return { repairedPlayer: next, repairsApplied };
  }

  const dbTeam = findCanonicalClubInDb(next.club || '', careerDb);
  if (dbTeam) {
    const canonical = getCanonicalLeagueIds(dbTeam.countryCode);
    const resolvedLeagueId = dbTeam.leagueId || canonical.d1Id;
    const leagueObj = careerDb.leagues?.[resolvedLeagueId] || DEFAULT_LEAGUE_DATABASE.leagues?.[resolvedLeagueId];

    if (next.leagueId !== resolvedLeagueId) {
      next.leagueId = resolvedLeagueId;
      repairsApplied.push(`Aligned Pro leagueId -> ${resolvedLeagueId}`);
    }
    if (leagueObj?.name && next.league !== leagueObj.name) {
      next.league = leagueObj.name;
      repairsApplied.push(`Aligned Pro league name -> ${leagueObj.name}`);
    }
    if (normalizeCountryCode(next.countryCode) !== normalizeCountryCode(dbTeam.countryCode)) {
      next.countryCode = dbTeam.countryCode;
      next.clubCountry = dbTeam.countryName;
      repairsApplied.push(`Aligned Pro countryCode -> ${dbTeam.countryCode}`);
    }
    if (next.isYouthCareerActive) {
      next.isYouthCareerActive = false;
      next.youthLeagueName = undefined;
      repairsApplied.push('Cleared stale Youth flags on Pro save');
    }
  }

  return { repairedPlayer: next, repairsApplied };
}
