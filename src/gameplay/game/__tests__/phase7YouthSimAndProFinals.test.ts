/**
 * Phase 7: Pro-Parity Youth Sim, Int'l Youth Cup Final (Pro Venue/45m) &
 * U17 World Championship Pro Rules — Automated Verification Suite
 *
 * Run with:
 *   ./node_modules/.bin/tsx src/gameplay/game/__tests__/phase7YouthSimAndProFinals.test.ts
 */

import assert from 'node:assert/strict';

// Minimal localStorage & window polyfills for headless Node execution
if (typeof (globalThis as any).localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, val: string) => {
      store[key] = String(val);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };
}
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import type { PlayerCardData, PlayerConfig } from '../../../types';
import { YOUTH_LEAGUES_DATABASE } from '../../../data/youthLeaguesDatabase';
import { simulateFullYouthLeagueStandings } from '../../../utils/youthLeagueSimulation';
import {
  generateTournamentMatchResult,
  generateYouthBlockMatches,
} from '../../../utils/youthMatchSimulator';
import { simulateYouthBlock } from '../../../utils/youthLeagueSystem';
import {
  buildInternationalYouthCup32,
  buildIntlCupEditorTeam,
  drawConstrainedGroups,
  generate32ClubsForCup,
  resolveIntlYouthCupFinalVenueConfig,
} from '../../../utils/internationalYouthCupEngine';
import {
  resolveU17WorldCupMatchConfig,
  simulateU17Match,
} from '../../../utils/u17NationalTeamEngine';
import { clearNationalTeamsCache } from '../../../utils/nationalTeamDatabaseManager';

function makeYouthPlayer(overrides: Partial<PlayerConfig> = {}): PlayerConfig {
  return {
    id: 'test-p7-wonderkid',
    name: 'Mateo Wonderkid',
    firstName: 'Mateo',
    lastName: 'Wonderkid',
    number: 10,
    age: 16,
    ovr: 68,
    potentialOvr: 92,
    club: YOUTH_LEAGUES_DATABASE.madrid.teams[0].name,
    city: 'Madrid',
    startingCity: 'Madrid',
    youthLeagueName: YOUTH_LEAGUES_DATABASE.madrid.name,
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Complete',
    preferredFoot: 'Right',
    weakFootStars: 4,
    heightCm: 176,
    weightKg: 68,
    fitness: 95,
    staminaCurrent: 95,
    stats: {
      pro: 68,
      def: 40,
      cre: 66,
      men: 67,
      goa: 72,
      phy: 75,
      detailed: {
        pace: 76,
        stamina: 84,
        strength: 68,
        ballControl: 70,
        retention: 66,
        dribbling: 72,
        shortPass: 67,
        longPass: 60,
        crossing: 62,
        shooting: 73,
        heading: 66,
        longShots: 70,
        tackling: 38,
        marking: 36,
        interceptions: 40,
        positioning: 71,
        composure: 69,
        reactions: 72,
      },
    },
    biometrics: {
      strength: 68,
      skinColor: '#f1c27d',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#111111',
      hairDye: '#111111',
    },
    accessories: { accessory: 'none', headbandColor: '#000000' },
    kit: { style: 'normal', color1: '#dc2626', color2: '#ffffff', pattern: 'solid', collar: 'crew' },
    emblem: { shape: 'crested-shield', mode: '2', color1: '#dc2626', color2: '#ffffff' },
    ...overrides,
  };
}

function testDomesticYouthLeagueFull23PlayerSim() {
  const madridBigPlayer = makeYouthPlayer({
    age: 15,
    ovr: 67,
    club: YOUTH_LEAGUES_DATABASE.madrid.teams[0].name,
    city: 'Madrid',
    youthLeagueName: YOUTH_LEAGUES_DATABASE.madrid.name,
  });

  const statsInput = {
    gamesPlayed: 18,
    goals: 12,
    assists: 6,
    avgRating: 7.7,
    cleanSheets: 4,
    yellowCards: 1,
    redCards: 0,
    injuryMatchesMissed: 0,
  };

  const sim = simulateFullYouthLeagueStandings(madridBigPlayer, statsInput);
  assert.equal(sim.leagueName, YOUTH_LEAGUES_DATABASE.madrid.name);
  assert.equal(sim.standings.length, 10, 'Madrid Youth League must have 10 teams');
  assert.equal(sim.totalMatchesSimulated, 90, '10-team double round-robin must simulate 90 matches');
  for (const row of sim.standings) {
    assert.equal(row.played, 18, `${row.teamName} must play 18 double round-robin matches`);
    assert.ok(row.teamOvr >= 35 && row.teamOvr <= 85, `Youth OVR out of bounds for ${row.teamName}: ${row.teamOvr}`);
  }
  assert.ok((sim.topScorers || []).length > 0, 'Youth League must produce real 23-player goal scorers');
  assert.ok((sim.mvpLeaderboard || []).length > 0, 'Youth League must produce real MVP leaders');

  // Verify strict isolation for São Paulo player (zero London contamination)
  const spPlayer = makeYouthPlayer({
    id: 'test-sp-youth',
    name: 'Gabriel Paulista',
    age: 16,
    ovr: 68,
    club: YOUTH_LEAGUES_DATABASE.sao_paulo.teams[0].name,
    city: 'São Paulo',
    startingCity: 'São Paulo',
    youthLeagueName: YOUTH_LEAGUES_DATABASE.sao_paulo.name,
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
  });
  const spSim = simulateFullYouthLeagueStandings(spPlayer, statsInput);
  assert.equal(spSim.leagueName, YOUTH_LEAGUES_DATABASE.sao_paulo.name);
  assert.ok(
    !spSim.standings.some((s) => /london|kensington|thames/i.test(s.teamName)),
    'São Paulo simulation must remain strictly isolated from London'
  );

  // Verify Pro delegation remains intact
  const proPlayer = makeYouthPlayer({
    age: 19,
    ovr: 82,
    club: 'Madrid White',
    careerStage: 'senior',
    squadDestination: 'First Team',
  });
  const proSim = simulateFullYouthLeagueStandings(proPlayer, statsInput);
  assert.equal(proSim.playerTeamQualified, false);
  assert.ok(proSim.standings.length >= 16);
}

function testYouthBlockMatchSimAndSyntheticTurf() {
  const madridBig = makeYouthPlayer({
    age: 14,
    ovr: 64,
    club: YOUTH_LEAGUES_DATABASE.madrid.teams[0].name, // tierClass: 'big'
  });
  const blockBig = generateYouthBlockMatches(madridBig, 1, true);
  assert.ok(blockBig.matches.length >= 9);

  const youthLeagueMatchesBig = blockBig.matches.filter((m) => m.matchMode === 'youth');
  assert.equal(youthLeagueMatchesBig.length, 9, 'Should simulate 9 Youth League block fixtures');

  let sawHomeBigPoor = false;
  let sawAwaySmallSynthetic = false;
  for (const m of youthLeagueMatchesBig) {
    assert.equal(m.displayedHalfMinutes, 35, 'Domestic Youth block matches use 35m halves');
    assert.ok(m.stadiumId && m.stadiumId.startsWith('youth_madrid_'), `Expected Madrid Youth stadium, got ${m.stadiumId}`);
    if (m.isPlayerHome) {
      assert.equal(m.turfQuality, 'poor');
      assert.equal(m.syntheticInjuryApplied, false);
      sawHomeBigPoor = true;
    } else if (m.turfQuality === 'synthetic') {
      assert.equal(m.syntheticInjuryApplied, true);
      sawAwaySmallSynthetic = true;
    }
    assert.ok(Array.isArray(m.goalScorers), 'Must include simulateDatabaseMatch goalScorers array');
    assert.ok(Array.isArray(m.assistProviders), 'Must include simulateDatabaseMatch assistProviders array');
  }
  assert.ok(sawHomeBigPoor, 'Should see at least one BIG club poor-turf home ground');
  assert.ok(sawAwaySmallSynthetic, 'Should see at least one SMALL club synthetic-turf away ground');

  // Verify small club synthetic turf applies on player home games too
  const smallClub = YOUTH_LEAGUES_DATABASE.madrid.teams.find((t) => t.tierClass === 'small')!;
  const madridSmall = makeYouthPlayer({ age: 14, ovr: 62, club: smallClub.name });
  const blockSmall = generateYouthBlockMatches(madridSmall, 1, true);
  const smallHomeMatch = blockSmall.matches.find((m) => m.matchMode === 'youth' && m.isPlayerHome)!;
  assert.equal(smallHomeMatch.turfQuality, 'synthetic');
  assert.equal(smallHomeMatch.syntheticInjuryApplied, true);

  // Verify simulateYouthBlock in youthLeagueSystem.ts returns full stats backed by 23-player sim
  const quickBlock = simulateYouthBlock(madridSmall, 1, true);
  assert.ok(quickBlock.gamesPlayed >= 1 && quickBlock.gamesPlayed <= 12);
  assert.ok(quickBlock.avgRating >= 5.5 && quickBlock.avgRating <= 10.0);
}

function testIntlYouthCup32GroupSimAndProFinalVenue() {
  const player = makeYouthPlayer({
    age: 16,
    ovr: 71,
    club: YOUTH_LEAGUES_DATABASE.madrid.teams[0].name,
  });

  const clubs32 = generate32ClubsForCup(player);
  assert.equal(clubs32.length, 32, `Int'l Youth Cup must contain strictly 32 clubs (got ${clubs32.length})`);
  const uefaCount = clubs32.filter((c) => c.federation === 'UEFA').length;
  assert.ok(uefaCount <= 16, `UEFA club count (${uefaCount}) must stay <= 16 for 8 groups`);

  const drawn = drawConstrainedGroups(clubs32);
  assert.equal(drawn.length, 8);
  for (const g of drawn) {
    assert.equal(g.teams.length, 4);
    assert.ok(g.teams.filter((t) => t.federation === 'UEFA').length <= 2, `${g.groupName} exceeded 2 UEFA limit`);
  }

  const cupData = buildInternationalYouthCup32(player);
  assert.equal(cupData.all32Clubs.length, 32);
  assert.equal(cupData.playerStageMatches.length, 3);
  assert.ok((cupData.simulatedGroupMatchResults || []).length >= 40, 'Non-player groups & matches simulated via DB engine');

  // Verify Int'l Youth Cup squad build resolves 23 Youth players and Special Unlocked Youth Stadium
  const builtClub = buildIntlCupEditorTeam(cupData.quarterOpponent, 16, player);
  const squadCount = (builtClub.team.squadSaveFile?.squad || []).filter((s) => Boolean(s.player)).length;
  assert.equal(squadCount, 23);
  assert.equal(builtClub.stadium.category, 'youth');
  assert.equal(builtClub.stadium.youthSpecialUnlocked, true);

  // Verify pre-final tournament match result uses 35m halves & Special Youth Stadium
  const qfMatch = generateTournamentMatchResult(
    player,
    'Quarter Final',
    cupData.quarterOpponent.name,
    cupData.quarterOpponent.teamOvr
  );
  assert.equal(qfMatch.matchResult.displayedHalfMinutes, 35);
  assert.equal(qfMatch.matchResult.matchMode, 'youth');
  assert.ok(qfMatch.matchResult.stadiumId?.startsWith('youth_special_'));

  // Verify Final Showcase Venue Config (resolveIntlYouthCupFinalVenueConfig)
  const finalCfg = resolveIntlYouthCupFinalVenueConfig(
    cupData.all32Clubs[0],
    cupData.finalOpponent,
    2032,
    player
  );
  assert.equal(finalCfg.stadium.category, 'pro', 'Int\'l Youth Cup Final must host at an existing Pro stadium');
  assert.equal(finalCfg.matchMode, 'youth');
  assert.equal(finalCfg.competitionTag, 'intl_youth_cup_final');
  assert.equal(finalCfg.displayedHalfMinutes, 45, 'Int\'l Youth Cup Final must enforce 45m halves');
  assert.ok(finalCfg.pitchMetrics.lengthMeters >= 100 && finalCfg.pitchMetrics.lengthMeters <= 112);
  assert.equal(finalCfg.pitchMetrics.goalWidthPx, 220, 'Pro pitch metrics use 220px Pro goal width');
  assert.equal(finalCfg.disableSurroundingsAndIntro, false);
  assert.ok(
    finalCfg.crowdAttendancePctOverride >= 0.60 && finalCfg.crowdAttendancePctOverride <= 0.80,
    `Crowd attendance ${finalCfg.crowdAttendancePctOverride} must fall in 0.60..0.80`
  );
  assert.equal(finalCfg.isCasualCrowd, true);
  assert.equal(finalCfg.finalBoardCity, finalCfg.stadium.city);
  assert.equal(finalCfg.finalBoardYear, 2032);
  assert.ok(
    finalCfg.finalBannerText.includes(finalCfg.stadium.city.toUpperCase()) &&
      finalCfg.finalBannerText.includes('2032'),
    `Expected [CITY] [YEAR] board text, got: ${finalCfg.finalBannerText}`
  );
  assert.equal(finalCfg.homePlayers.length, 23, 'Finalist A must field 23 Youth players');
  assert.equal(finalCfg.awayPlayers.length, 23, 'Finalist B must field 23 Youth players');

  // Verify Final tournament match simulator uses 45m & Pro Stadium
  const finalMatch = generateTournamentMatchResult(
    player,
    'Grand Final',
    cupData.finalOpponent.name,
    cupData.finalOpponent.teamOvr
  );
  assert.equal(finalMatch.matchResult.displayedHalfMinutes, 45);
  assert.equal(finalMatch.matchResult.matchMode, 'youth');
  assert.equal(finalMatch.matchResult.stadiumId, finalCfg.stadiumId);
}

function testU17WorldCupProVenue45MinAndDbSquads() {
  clearNationalTeamsCache();
  const basePlayer = makeYouthPlayer({
    id: 'test-u17-user-spain',
    name: 'Lucas Prodigio',
    firstName: 'Lucas',
    lastName: 'Prodigio',
    age: 16,
    ovr: 76,
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'ATT',
    subPosition: 'ST',
  });

  const cfg = resolveU17WorldCupMatchConfig(
    { id: 'u17-wc-qf-1', stageName: 'Quarter-Final', isKnockout: true },
    { code: 'ESP', name: 'Spain', iso: 'es' },
    { code: 'BRA', name: 'Brazil', iso: 'br' },
    2032,
    basePlayer as unknown as PlayerCardData
  );

  assert.equal(cfg.stadium.category, 'pro', 'U17 World Championship must play in existing Pro stadiums');
  assert.equal(cfg.matchMode, 'youth');
  assert.equal(cfg.competitionTag, 'u17_world_cup');
  assert.equal(cfg.displayedHalfMinutes, 45, 'U17 World Championship must enforce 45m halves');
  assert.equal(cfg.disableSurroundingsAndIntro, false);
  assert.equal(cfg.pitchMetrics.goalWidthPx, 220, 'U17 World Championship uses Pro pitch dimensions');
  assert.equal(cfg.isKnockout, true);
  assert.equal(cfg.homeU17Squad.length, 23, 'Home nation must call up 23 U17 players');
  assert.equal(cfg.awayU17Squad.length, 23, 'Away nation must call up 23 U17 players');
  assert.equal(cfg.userIncludedTeam, 'home');
  assert.ok(
    cfg.homeU17Squad.some((p) => p.id === basePlayer.id),
    'Selected Unique Career player must be injected into their nation\'s 23-man U17 squad'
  );

  // Sanity check Rule 9 remains 100% preserved
  const simRig = simulateU17Match(
    { code: 'ESP', name: 'Spain', iso: 'es', confederation: 'UEFA', ovr: 72, isSimulationOnly: false },
    { code: 'NOR', name: 'Norway', iso: 'no', confederation: 'UEFA', ovr: 50, isSimulationOnly: true },
    true
  );
  assert.equal(simRig.winnerCode, 'ESP', 'Rule 9: Implemented nation must beat Simulation-Only nation');
}

function runAll() {
  testDomesticYouthLeagueFull23PlayerSim();
  testYouthBlockMatchSimAndSyntheticTurf();
  testIntlYouthCup32GroupSimAndProFinalVenue();
  testU17WorldCupProVenue45MinAndDbSquads();
  console.log(
    'Phase 7 tests passed: 23-player domestic Youth League & block sims, synthetic +10% injury risk, 32-club Int\'l Youth Cup & Pro 45m Final showcase, and U17 World Championship Pro rules verified.'
  );
}

runAll();
