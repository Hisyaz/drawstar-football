/**
 * Phase 1 League Contamination Forensics & Isolation Test Suite
 *
 * Run baseline reproduction report:
 *   npx tsx src/utils/__tests__/leagueIsolation.test.ts
 *
 * Run strict gate (exits non-zero on any contamination finding; used in Phase 2 verification):
 *   npx tsx src/utils/__tests__/leagueIsolation.test.ts --strict
 */

// 1. Lightweight browser storage polyfill for Node execution via tsx
const memoryStore = new Map<string, string>();
if (typeof (globalThis as any).localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => (memoryStore.has(key) ? memoryStore.get(key)! : null),
    setItem: (key: string, val: string) => {
      memoryStore.set(key, String(val));
    },
    removeItem: (key: string) => {
      memoryStore.delete(key);
    },
    clear: () => {
      memoryStore.clear();
    },
    key: (index: number) => Array.from(memoryStore.keys())[index] ?? null,
    get length() {
      return memoryStore.size;
    },
  };
}
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = { localStorage: (globalThis as any).localStorage };
}

import type { PlayerCardData, PlayerConfig } from '../../types';
import { DEFAULT_LEAGUE_DATABASE } from '../../data/defaultLeagues';
import { YOUTH_LEAGUES_DATABASE } from '../../data/youthLeaguesDatabase';
import { saveCareerLeagueDatabase, getCareerLeagueDatabase, saveToSlot, getSaveSlot, invalidateSaveSlotCache } from '../careerSaveSystem';
import { getLeagueDatabase } from '../leagueDatabaseSystem';
import { generateYouthBlockMatches } from '../youthMatchSimulator';
import { simulateFullYouthLeagueStandings } from '../youthLeagueSimulation';
import { rebuildPlayerCompetitiveContextOnTransfer } from '../clubContextRebuilder';
import { executeCanonicalTransfer } from '../transferRequestSystem';
import { getWorldSimulationState } from '../worldSimulationEngine';
import {
  auditPlayerCompetitiveContext,
  auditLeagueDatabaseContamination,
  repairCorruptedCareerContext,
} from '../leagueIntegrityDiagnostics';

const STRICT_MODE = process.argv.includes('--strict');

function cloneDefaultDb() {
  return JSON.parse(JSON.stringify(DEFAULT_LEAGUE_DATABASE));
}

function makeYouthPlayer(overrides: Partial<PlayerConfig & PlayerCardData>): PlayerConfig & PlayerCardData {
  return {
    id: 'test-user-1',
    name: 'Lucas Silva',
    firstName: 'Lucas',
    lastName: 'Silva',
    age: 16,
    ovr: 66,
    overallRating: 66,
    position: 'ST',
    subPosition: 'ST',
    playStyle: 'Finisher',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    startingCity: 'São Paulo',
    city: 'São Paulo',
    club: 'Moema Atlético Clube',
    clubCountry: 'Brazil',
    countryCode: 'BRA',
    youthTeamName: 'Moema Atlético Clube',
    youthLeagueName: YOUTH_LEAGUES_DATABASE.sao_paulo.name,
    league: YOUTH_LEAGUES_DATABASE.sao_paulo.name,
    isYouthCareerActive: true,
    isProPlayer: false,
    isProfessional: false,
    careerStage: 'YOUTH_ACADEMY',
    stats: { pro: 64, def: 42, cre: 65, men: 62, goa: 68, phy: 63 },
    fame: 110,
    chemistry: 65,
    fitness: 88,
    staminaCurrent: 88,
    ...overrides,
  } as any;
}

function assertCondition(cond: boolean, label: string) {
  if (!cond) {
    throw new Error(`Assertion failed: ${label}`);
  }
}

async function runSuite() {
  let failures = 0;
  const bugReproFindings: string[] = [];

  console.log('==================================================================');
  console.log('DrawStar Football — League & Transfer Isolation Diagnostic Suite');
  console.log(`Mode: ${STRICT_MODE ? 'STRICT (Phase 2 verification gate)' : 'BASELINE FORENSICS (Phase 1 reproduction)'}`);
  console.log('==================================================================\n');

  // ------------------------------------------------------------------
  // SELF-CHECK: Verify diagnostic & repair helpers themselves work
  // ------------------------------------------------------------------
  const freshDb = cloneDefaultDb();
  saveCareerLeagueDatabase(freshDb);
  const dbCheck = auditLeagueDatabaseContamination(freshDb);
  console.log(`[SELF-CHECK] DEFAULT_LEAGUE_DATABASE audit: valid=${dbCheck.isValid}, findings=${dbCheck.findings.length}`);
  if (!dbCheck.isValid) {
    dbCheck.findings.forEach((f) => console.log(`   -> ${f.code}: ${f.message}`));
  }

  const corruptedLegacySave = makeYouthPlayer({
    league: 'English League',
    leagueId: 'england_d1',
    countryCode: 'ENG',
    clubCountry: 'England',
    qualifiedContinentalCompId: 'UEFA_CL',
  } as any);
  const preAudit = auditPlayerCompetitiveContext(corruptedLegacySave, freshDb);
  assertCondition(!preAudit.isValid, 'Auditor must flag corrupted Sao Paulo -> england_d1 save');
  const { repairedPlayer, repairsApplied } = repairCorruptedCareerContext(corruptedLegacySave, freshDb);
  const postAudit = auditPlayerCompetitiveContext(repairedPlayer, freshDb);
  assertCondition(postAudit.isValid, 'repairCorruptedCareerContext must restore clean Youth Sao Paulo context');
  console.log(`[SELF-CHECK] Corrupted save detection & repair passed (${repairsApplied.length} repairs).\n`);

  // ------------------------------------------------------------------
  // SCENARIO A: São Paulo Youth League Age 16 (Before Turning Pro)
  // ------------------------------------------------------------------
  console.log('--- Scenario A: São Paulo Youth Career reaching Age 16 (non-Pro) ---');
  memoryStore.clear();
  saveCareerLeagueDatabase(cloneDefaultDb());
  const spAge16 = makeYouthPlayer({ age: 16 });
  const spBlock = generateYouthBlockMatches(spAge16, 1, true);
  const spSimOpponents = spBlock.matches
    .filter((m) => m.competitionType === 'league' || !m.competitionType)
    .map((m) => ({
      name: m.isPlayerHome ? m.awayTeamName : m.homeTeamName,
      leagueId: m.competitionName,
    }));

  const spStandings = simulateFullYouthLeagueStandings(spAge16, {
    leagueName: YOUTH_LEAGUES_DATABASE.sao_paulo.name,
    standings: [],
    matchesPlayed: 9,
    goals: 5,
    assists: 2,
    avgRating: 7.4,
    mvps: 2,
  } as any);

  const spStandingsOpps = spStandings.standings.map((s) => ({ name: s.teamName }));
  const spAudit = auditPlayerCompetitiveContext(spAge16, getCareerLeagueDatabase(), [
    ...spSimOpponents,
    ...spStandingsOpps,
  ]);

  if (!spAudit.isValid) {
    failures++;
    bugReproFindings.push('Scenario A (Sao Paulo Age 16 Youth -> England contamination)');
    console.log(`[FAIL / REPRODUCED] Standings league="${spStandings.leagueName}", opponents sample=${spSimOpponents.slice(0, 3).map((o) => o.name).join(', ')}`);
    spAudit.findings.forEach((f) => console.log(`   -> ${f.code}: ${f.message}`));
  } else {
    console.log(`[PASS] São Paulo Age 16 stayed isolated in ${spStandings.leagueName}.`);
  }

  // ------------------------------------------------------------------
  // SCENARIO B: Argentina Start + Unmapped City (Roma / Berlin / Lisboa / Riyadh)
  // ------------------------------------------------------------------
  console.log('\n--- Scenario B: Argentina Youth Start & Non-English City Mapping ---');
  memoryStore.clear();
  saveCareerLeagueDatabase(cloneDefaultDb());
  const argPlayer = makeYouthPlayer({
    nationality: { code: 'ARG', iso: 'ar', name: 'Argentina' },
    startingCity: 'Buenos Aires',
    city: 'Buenos Aires',
    club: 'Palermo Juniors',
    clubCountry: 'Argentina',
    countryCode: 'ARG',
    youthTeamName: 'Palermo Juniors',
    youthLeagueName: YOUTH_LEAGUES_DATABASE.buenos_aires.name,
    league: YOUTH_LEAGUES_DATABASE.buenos_aires.name,
    age: 16,
  });
  const argBlock = generateYouthBlockMatches(argPlayer, 1, true);
  const argOpps = argBlock.matches.map((m) => ({ name: m.isPlayerHome ? m.awayTeamName : m.homeTeamName }));
  const argAudit = auditPlayerCompetitiveContext(argPlayer, getCareerLeagueDatabase(), argOpps);

  // Also test Roma, Berlin, Lisboa, Riyadh -> ensure none silently pull London rivals
  const londonNames = new Set(YOUTH_LEAGUES_DATABASE.london.teams.map((t) => t.name.toLowerCase()));
  const extraCities = [
    { city: 'Roma', country: 'Italy', code: 'ITA', iso: 'it', club: 'Trastevere Academy', league: 'Roma Youth League' },
    { city: 'Berlin', country: 'Germany', code: 'GER', iso: 'de', club: 'Kreuzberg Jugend FC', league: 'Berlin Youth League' },
    { city: 'Lisboa', country: 'Portugal', code: 'POR', iso: 'pt', club: 'Alfama Esperança FC', league: 'Lisboa Youth League' },
    { city: 'Riyadh', country: 'Saudi Arabia', code: 'KSA', iso: 'sa', club: 'Al-Olaya Falcons Academy', league: 'Riyadh Youth League' },
  ];
  let nonEnglishGotLondonRivals = false;
  for (const c of extraCities) {
    const p = makeYouthPlayer({
      nationality: { code: c.code, iso: c.iso, name: c.country },
      startingCity: c.city,
      city: c.city,
      club: c.club,
      clubCountry: c.country,
      countryCode: c.code,
      youthTeamName: c.club,
      youthLeagueName: c.league,
      league: c.league,
      age: 13,
    });
    const blk = generateYouthBlockMatches(p, 1, true);
    if (
      blk.matches.some((m) => londonNames.has((m.isPlayerHome ? m.awayTeamName : m.homeTeamName).toLowerCase()))
    ) {
      nonEnglishGotLondonRivals = true;
    }
  }

  if (!argAudit.isValid || nonEnglishGotLondonRivals) {
    failures++;
    bugReproFindings.push('Scenario B (Argentina Age 16 or Non-English City -> London/England contamination)');
    if (!argAudit.isValid) {
      console.log(`[FAIL / REPRODUCED - ARG] Opponents=${argOpps.slice(0, 3).map((o) => o.name).join(', ')}`);
      argAudit.findings.forEach((f) => console.log(`   -> ${f.code}: ${f.message}`));
    }
    if (nonEnglishGotLondonRivals) {
      console.log('[FAIL / REPRODUCED - CITY] Starting in Roma/Berlin/Lisboa/Riyadh drafted London Youth League opponents!');
    }
  } else {
    console.log('[PASS] Buenos Aires, Roma, Berlin, Lisboa, & Riyadh resolved cleanly without London/England leakage.');
  }

  // ------------------------------------------------------------------
  // SCENARIO C: Youth Academy Switch Integrity
  // ------------------------------------------------------------------
  console.log('\n--- Scenario C: Youth Academy Transfer / Switch Integrity ---');
  const spAge13 = makeYouthPlayer({ age: 13 });
  const youthTransfer = executeCanonicalTransfer(spAge13, {
    type: 'youth',
    destinationClub: 'Chamartín Cantera',
    destinationLeague: YOUTH_LEAGUES_DATABASE.madrid.name,
    destinationCity: 'Madrid',
    destinationCountry: 'Spain',
    isInternational: true,
    reason: 'International youth trial move',
  } as any);
  const switchedOpps = generateYouthBlockMatches(youthTransfer.updatedPlayer, 1, true).matches.map((m) => ({
    name: m.isPlayerHome ? m.awayTeamName : m.homeTeamName,
  }));
  const switchAudit = auditPlayerCompetitiveContext(
    youthTransfer.updatedPlayer,
    getCareerLeagueDatabase(),
    switchedOpps
  );

  if (!switchAudit.isValid) {
    failures++;
    bugReproFindings.push('Scenario C (Youth academy switch left stale league/country fields)');
    console.log(`[FAIL / REPRODUCED] Post-switch club="${youthTransfer.updatedPlayer.club}", league="${youthTransfer.updatedPlayer.league}", countryCode="${youthTransfer.updatedPlayer.countryCode}"`);
    switchAudit.findings.forEach((f) => console.log(`   -> ${f.code}: ${f.message}`));
  } else {
    console.log('[PASS] Youth academy switch cleanly updated all club/league/country/opponent fields.');
  }

  // ------------------------------------------------------------------
  // SCENARIO D: Pro Mid-Season Cross-Continent Transfer & World Sim Cache
  // ------------------------------------------------------------------
  console.log('\n--- Scenario D: Pro Transfer BRA -> ESP & World Simulation Cache Isolation ---');
  memoryStore.clear();
  const dbD = cloneDefaultDb();
  saveCareerLeagueDatabase(dbD);

  const braPro = makeYouthPlayer({
    age: 18,
    ovr: 79,
    overallRating: 79,
    club: 'Gávea Rubro-Negro',
    clubId: 'bra_1_flamengo',
    clubCountry: 'Brazil',
    countryCode: 'BRA',
    league: 'Brazilian League',
    leagueId: 'brazil_d1',
    leagueTier: 1,
    isYouthCareerActive: false,
    isProPlayer: true,
    isProfessional: true,
    isCareerModeActive: true,
    careerStage: 'PROFESSIONAL',
    youthTeamName: undefined,
    youthLeagueName: undefined,
    qualifiedContinentalCompId: 'CONMEBOL_LIB',
  } as any);

  // Warm the world simulation cache while player is in Brazil D1
  const preTransferWorld = getWorldSimulationState('2026/2027', dbD, braPro);
  const brazilStandingBefore = preTransferWorld.leagues['brazil_d1']?.standings.find((r) => r.teamName === 'Gávea Rubro-Negro');

  // Transfer player to Spain D1 (Blancos CF) via canonical rebuilder + check world cache sync
  const transferredToSpain = rebuildPlayerCompetitiveContextOnTransfer(braPro, 'Blancos CF', undefined, dbD);
  const postTransferWorld = getWorldSimulationState('2026/2027', dbD, transferredToSpain);

  const staleBraPlayerFlag = postTransferWorld.leagues['brazil_d1']?.standings.some((r) => r.isPlayerTeam);
  const espPlayerFlag = postTransferWorld.leagues['spain_d1']?.standings.some((r) => r.isPlayerTeam && r.teamName.toLowerCase().includes('blancos'));

  const espAudit = auditPlayerCompetitiveContext(transferredToSpain, dbD);
  const worldCountryAudit = !staleBraPlayerFlag && Boolean(espPlayerFlag) && Boolean(brazilStandingBefore);

  if (!espAudit.isValid || !worldCountryAudit) {
    failures++;
    bugReproFindings.push('Scenario D (Pro BRA -> ESP transfer left stale World Sim cache / continental competition mismatch)');
    console.log(`[FAIL / REPRODUCED] transferred club="${transferredToSpain.club}", leagueId="${transferredToSpain.leagueId}", staleBrazilIsPlayerTeam=${String(staleBraPlayerFlag)}, spainIsPlayerTeam=${String(espPlayerFlag)}`);
    espAudit.findings.forEach((f) => console.log(`   -> ${f.code}: ${f.message}`));
  } else {
    console.log('[PASS] Pro South America -> Europe transfer & World Simulation cache isolated cleanly.');
  }

  // ------------------------------------------------------------------
  // SCENARIO E: Save-Slot Load Auto-Repair & Career/Editor DB Isolation
  // ------------------------------------------------------------------
  console.log('\n--- Scenario E: Save-Slot Load Auto-Repair & DB Contamination Audit ---');
  saveToSlot(2, {
    player: corruptedLegacySave,
    accounting: { contractYears: 0, yearlySalary: 0, totalSavings: 0, sponsors: [], sanctions: [], businesses: [] } as any,
    manager: { trustScore: 70, matchRatingsHistory: [] } as any,
    championCoins: 10,
    iconicCoins: 0,
    storeItems: [],
    isCharacterConfirmed: true,
    careerLeagueDb: cloneDefaultDb(),
  });
  invalidateSaveSlotCache(2);
  const reloadedSlot = getSaveSlot(2);
  const slotAudit = reloadedSlot ? auditPlayerCompetitiveContext(reloadedSlot.player, dbD) : { isValid: false, findings: [] };
  const globalDbAudit = auditLeagueDatabaseContamination(getLeagueDatabase());
  if (!slotAudit.isValid || !globalDbAudit.isValid) {
    failures++;
    bugReproFindings.push('Scenario E (Save-slot load repair or DB contamination audit)');
    console.log(`[FAIL] slotAudit=${slotAudit.isValid}, globalDbAudit=${globalDbAudit.isValid}`);
  } else {
    console.log('[PASS] Save-slot auto-repair & global DB contamination audit passed.');
  }

  console.log('\n==================================================================');
  console.log(`SUMMARY: ${failures} scenario(s) detected contamination (${bugReproFindings.join('; ') || 'NONE'}).`);
  console.log('==================================================================');

  if (STRICT_MODE && failures > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal suite error:', err);
  process.exit(1);
});
