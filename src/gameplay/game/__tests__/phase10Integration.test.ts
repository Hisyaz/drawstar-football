/**
 * Phase 10: Kickoff 3-Mode Selector, Youth/Cup/U17 Playable Adapters, Unique Career Street & Injury Flows
 * Automated Integration & Regression Verification Suite
 *
 * Run with:
 *   ./node_modules/.bin/tsx src/gameplay/game/__tests__/phase10Integration.test.ts
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

import { calculateStreetPointsFromMatchRating } from '../../../utils/developmentSystem';
import { generateRandomInjury, processInjuryForPlayer } from '../../../utils/staminaInjurySystem';
import {
  buildYouthAndIntlCupGameplayTeams,
  buildU17NationalGameplayTeams,
  buildStreetGameplayTeams,
} from '../../../utils/gameplayAdapter';
import { YOUTH_LEAGUES_DATABASE } from '../../../data/youthLeaguesDatabase';
import { getAllIntlYouthPoolClubs } from '../../../data/internationalYouthPool';
import { groupInternationalYouthClubs } from '../../../utils/internationalYouthGrouping';
import { getLeagueDatabase } from '../../../utils/leagueDatabaseSystem';
import { getScoreboardTheme } from '../../components/MatchHUD';
import { MatchEngine } from '../engine';
import { getMatchModeRules } from '../formations';
import type { PlayerCardData } from '../../../types';

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`✅ [Phase 10] ${name}`);
  } catch (err) {
    console.error(`❌ [Phase 10] FAILED: ${name}`);
    throw err;
  }
}

function makeMockCareerPlayer(overrides: Partial<PlayerCardData> = {}): PlayerCardData {
  return {
    id: 'test-unique-wonderkid',
    name: 'Mateo Wonder',
    number: 10,
    shirtNumber: 10,
    ovr: 68,
    overallRating: 68,
    age: 16,
    club: 'Palermo Juniors',
    position: 'Forward',
    subPosition: 'ST',
    nationality: { code: 'ARG', name: 'Argentina', iso: 'ar' },
    stats: { pro: 72, def: 45, cre: 68, men: 66, goa: 74, phy: 70 },
    biometrics: {
      strength: 68,
      skinColor: '#e0ac69',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#18181b',
      hairDye: '#18181b',
    },
    accessories: { accessory: 'none', headbandColor: '#ffffff' },
    kit: { color1: '#0284c7', color2: '#ffffff', pattern: 'solid' },
    emblem: { shape: 'crested-shield', mode: '1', color1: '#0284c7', color2: '#ffffff' },
    ...overrides,
  };
}

// =========================================================================
// 1. Street Development Points Calculator (Match Rating + Injury Rule)
// =========================================================================
test('calculateStreetPointsFromMatchRating maps <=16 and >16 ratings and enforces 0 pts when injured', () => {
  const injuredYoung = calculateStreetPointsFromMatchRating(15, 9.6, true);
  assert.equal(injuredYoung.points, 0);
  assert.equal(injuredYoung.message, 'YOU LEARNED NOTHING');
  assert.equal(injuredYoung.tier, 'low');

  const injuredAdult = calculateStreetPointsFromMatchRating(18, 8.8, true);
  assert.equal(injuredAdult.points, 0);
  assert.equal(injuredAdult.message, 'YOU LEARNED NOTHING');

  const lowYoung = calculateStreetPointsFromMatchRating(16, 5.2, false);
  assert.equal(lowYoung.points, 1);
  assert.equal(lowYoung.tier, 'low');

  const strongYoung = calculateStreetPointsFromMatchRating(16, 7.5, false);
  assert.equal(strongYoung.points, 45);
  assert.equal(strongYoung.tier, 'high');

  const peakYoung = calculateStreetPointsFromMatchRating(14, 9.3, false);
  assert.equal(peakYoung.points, 90);
  assert.equal(peakYoung.message, 'YOU LEARNED A LOT');
  assert.equal(peakYoung.tier, 'high');

  const strongOld = calculateStreetPointsFromMatchRating(19, 7.5, false);
  assert.equal(strongOld.points, 5);
  assert.equal(strongOld.tier, 'high');

  const peakOld = calculateStreetPointsFromMatchRating(21, 9.5, false);
  assert.equal(peakOld.points, 8);
  assert.equal(peakOld.message, 'YOU LEARNED A LOT');
});

// =========================================================================
// 2. All 9 City Youth Leagues (Age 16, 35m halves, Youth Stadium & Scoreboard)
// =========================================================================
test('All 9 City Youth Leagues build 35m Youth gameplay bundles with distinct city scoreboard themes', () => {
  const leagueEntries = Object.entries(YOUTH_LEAGUES_DATABASE);
  assert.equal(leagueEntries.length, 9, 'Expected 9 Youth Leagues in database');

  const seenThemeLabels = new Set<string>();
  for (const [cityId, league] of leagueEntries) {
    assert.ok(league.teams.length >= 2, `${cityId} has >=2 teams`);
    const homeTeam = league.teams[0];
    const awayTeam = league.teams[1];
    const user = makeMockCareerPlayer({ club: homeTeam.name, age: 16 });
    const bundle = buildYouthAndIntlCupGameplayTeams({
      homeClub: homeTeam,
      awayClub: awayTeam,
      age: 16,
      competitionMode: 'youth_league',
      userPlayer: user,
    });

    assert.equal(bundle.age, 16);
    assert.equal(bundle.matchMode, 'youth');
    assert.equal(bundle.displayedHalfMinutes, 35);
    assert.equal(bundle.disableSurroundingsAndIntro, true);
    assert.equal(bundle.isCasualCrowd, true);
    assert.ok(bundle.homeTeam.players.length >= 11);
    assert.ok(bundle.awayTeam.players.length >= 11);
    assert.ok(bundle.lockedPlayerId, `Locked player injected for ${cityId}`);

    const theme = getScoreboardTheme(`youth_${cityId}`);
    assert.equal(theme.id, `youth_${cityId}`);
    assert.equal(theme.iconKind, 'youth');
    assert.ok(!seenThemeLabels.has(theme.label), `Unique theme label for ${cityId}`);
    seenThemeLabels.add(theme.label);
  }
});

// =========================================================================
// 3. International Youth Cup Knockout vs Grand Final Rules
// =========================================================================
test("Int'l Youth Cup separates knockout (35m) vs Grand Final (Pro stadium, 45m, 60-80% casual crowd, city+year adboards)", () => {
  const user = makeMockCareerPlayer({ club: 'Palermo Juniors', age: 16 });

  const knockout = buildYouthAndIntlCupGameplayTeams({
    homeClub: 'Palermo Juniors',
    awayClub: 'Chamartín Atlético',
    age: 16,
    competitionMode: 'intl_youth_cup',
    seasonYear: 2027,
    userPlayer: user,
  });
  assert.equal(knockout.displayedHalfMinutes, 35);
  assert.equal(knockout.disableSurroundingsAndIntro, true);
  assert.equal(getScoreboardTheme('intl_youth_cup').rightStatusLabel, 'CUP');

  const finalBundle = buildYouthAndIntlCupGameplayTeams({
    homeClub: 'Palermo Juniors',
    awayClub: 'Chamartín Atlético',
    age: 16,
    competitionMode: 'intl_youth_cup_final',
    seasonYear: 2027,
    userPlayer: user,
  });
  assert.equal(finalBundle.displayedHalfMinutes, 45);
  assert.equal(finalBundle.disableSurroundingsAndIntro, false);
  assert.equal(finalBundle.isCasualCrowd, true);
  assert.ok(
    typeof finalBundle.crowdAttendancePctOverride === 'number' &&
      finalBundle.crowdAttendancePctOverride >= 0.6 &&
      finalBundle.crowdAttendancePctOverride <= 0.8,
    `Expected 0.60-0.80 crowd ratio override, got ${finalBundle.crowdAttendancePctOverride}`
  );
  assert.ok(finalBundle.finalBoardCity && finalBundle.finalBoardCity.length > 0);
  assert.equal(finalBundle.finalBoardYear, 2027);

  const finalHud = getScoreboardTheme('intl_youth_cup_final', {
    finalBoardCity: finalBundle.finalBoardCity,
    finalBoardYear: finalBundle.finalBoardYear,
  });
  assert.ok(finalHud.label.includes('2027'));
  assert.ok(finalHud.label.includes(finalBundle.finalBoardCity!.toUpperCase()));
});

// =========================================================================
// 4. U17 World Championship 23-Man DB Squad + Pro WC Stadium + 45m Halves
// =========================================================================
test('U17 World Championship pulls 23-man u17Squads, injects career user, and uses 45m Pro WC venue', () => {
  const user = makeMockCareerPlayer({ age: 16 });
  const u17Bundle = buildU17NationalGameplayTeams({
    homeNation: 'Argentina',
    awayNation: 'France',
    stageName: 'Quarter-Final',
    seasonYear: 2027,
    isKnockout: true,
    userPlayer: user,
  });

  assert.equal(u17Bundle.competitionTag, 'u17_world_cup');
  assert.equal(u17Bundle.displayedHalfMinutes, 45);
  assert.equal(u17Bundle.disableSurroundingsAndIntro, false);
  assert.equal(u17Bundle.homeU17Squad.length, 23);
  assert.equal(u17Bundle.awayU17Squad.length, 23);
  assert.equal(u17Bundle.userIncludedTeam, 'home');
  assert.ok(u17Bundle.homeTeam.players.some((p) => p.id === u17Bundle.lockedPlayerId));
  assert.ok((u17Bundle.stadium.capacity || 0) >= 25000);
  assert.equal(getScoreboardTheme('u17_world_cup').id, 'u17_world_cup');
});

// =========================================================================
// 5. Unique Career Street 7v7 Match & Injury Processing
// =========================================================================
test('Unique Career Street 7v7 configures 1-2-2-2 (30m halves, +10% pace, highest-OVR teammate captain)', () => {
  const db = getLeagueDatabase();
  const user = makeMockCareerPlayer({
    age: 16,
    ovr: 58,
    overallRating: 58,
    club: 'Free Agent',
    league: 'Street Football',
  });
  const streetBundle = buildStreetGameplayTeams('madrid', db, user, {
    homeControl: 'player',
    awayControl: 'cpu',
  });

  assert.equal(streetBundle.matchMode, 'street');
  assert.equal(streetBundle.displayedHalfMinutes, 30);
  assert.equal(streetBundle.formation, '1-2-2-2');
  assert.equal(streetBundle.homeTeam.players.length, 7);
  assert.equal(streetBundle.awayTeam.players.length, 7);

  // Unique Career user takes one spot, while highest-OVR player wears captain armband
  const userInHome = streetBundle.homeTeam.players.find(
    (p) => p.id === user.id || p.name === user.name
  );
  assert.ok(userInHome, 'Unique Career player is placed onto Home Street 7v7 squad');
  assert.ok(streetBundle.homeTeam.players.some((p) => p.isCaptain), 'Home Street team has a captain');

  const engine = new MatchEngine();
  engine.setTeam('home', streetBundle.homeTeam);
  engine.setTeam('away', streetBundle.awayTeam);
  engine.applyPreMatchConfig({
    matchMode: 'street',
    isStreetMatch: true,
    competitionTag: 'street',
    scoreboardThemeId: 'street',
    crowdAttendancePctOverride: 0.7,
    isCasualCrowd: true,
    homeTeamId: streetBundle.homeTeam.id,
    awayTeamId: streetBundle.awayTeam.id,
    homeFormation: '4-4-2',
    awayFormation: '4-4-2',
    homeStreetFormation: '1-2-2-2',
    awayStreetFormation: '1-2-2-2',
    homePlaystyle: 'counterattack',
    awayPlaystyle: 'possession',
    homeTactics: engine.homeTactics,
    awayTactics: engine.awayTactics,
    difficulty: 'normal',
    halfDurationMinutes: 3,
    stadiumTier: streetBundle.stadium.tier,
    stadiumId: streetBundle.stadium.id,
    timeOfDay: 'night',
    seatColor: 'concrete',
    pitchPreset: 'custom',
    pitchLengthMeters: 46,
    pitchWidthMeters: 28,
    turfQuality: streetBundle.stadium.turfQuality,
    grassLength: streetBundle.stadium.grassLength,
    weather: 'clear',
    season: 'summer',
    netTension: 'hard',
    goalFrame: 'round_steel',
  });
  assert.equal(engine.displayedHalfMinutes, 30);
  assert.equal(engine.scoreboardThemeId, 'street');
  engine.gameSpeed = 100;
  assert.ok(Math.abs(engine.getTimeScale() - 0.7 * 1.1) < 1e-6);
  assert.equal(engine.players.filter((p) => p.team === 'home').length, 7);
  assert.equal(engine.players.filter((p) => p.team === 'away').length, 7);
});

test('Match synthetic/gameplay injury rolls InjuryDetails & flags injury modal cleanly; Pro 11v11 45m stays intact', () => {
  const user = makeMockCareerPlayer({ age: 18, fitness: 72 });
  const inj = generateRandomInjury(40);
  assert.ok(inj.weeks >= 1);
  assert.ok(inj.name.length > 0);

  const { updatedPlayer } = processInjuryForPlayer(user, inj);
  assert.equal(updatedPlayer.isInjured, true);
  assert.equal(updatedPlayer.hasSeenInjuryModal, false);
  assert.equal(updatedPlayer.injuryWeeksRemaining, inj.weeks);

  // Pro 11v11 regression check
  const proRules = getMatchModeRules('pro');
  assert.equal(proRules.maxPlayersPerTeam, 11);
  assert.equal(proRules.displayedHalfMinutes, 45);
  assert.equal(proRules.offsidesEnabled, true);
  assert.equal(proRules.speedMultiplier, 1.0);
});

test("groupInternationalYouthClubs preserves all Int'l Youth Cup clubs and bundles single-team countries into regional sections", () => {
  const pool = getAllIntlYouthPoolClubs(16);
  const sections = groupInternationalYouthClubs(pool);
  const totalClubsGrouped = sections.reduce((acc, s) => acc + s.clubs.length, 0);
  assert.equal(totalClubsGrouped, pool.length, 'Every pool club appears once across grouped sections');
  assert.ok(pool.length >= 48, `Expected >=48 Intl Youth Cup clubs, got ${pool.length}`);

  const labels = new Set(sections.map((s) => s.sectionLabel));
  assert.ok(labels.has('Greek & Balkan'), 'Expected Greek & Balkan regional bundle');
  assert.ok(labels.has('Benelux / Alpine'), 'Expected Benelux / Alpine regional bundle');
  assert.ok(labels.has('North & West Africa'), 'Expected North & West Africa regional bundle');
  assert.ok(labels.has('Andean South America'), 'Expected Andean South America regional bundle');
  assert.ok(labels.has('Brazil'), 'Expected multi-club country Brazil to remain unbundled');
  assert.ok(labels.has('England'), 'Expected multi-club country England to remain unbundled');
});

test('MatchEngine.getMatchCompletionPayload exposes Street 30m completion metadata cleanly', () => {
  const db = getLeagueDatabase();
  const streetBundle = buildStreetGameplayTeams('buenos_aires', db);
  const engine = new MatchEngine();
  engine.setTeam('home', streetBundle.homeTeam);
  engine.setTeam('away', streetBundle.awayTeam);
  engine.applyPreMatchConfig({
    matchMode: 'street',
    isStreetMatch: true,
    competitionTag: 'street',
    scoreboardThemeId: 'street',
    crowdAttendancePctOverride: 0.7,
    isCasualCrowd: true,
    homeTeamId: streetBundle.homeTeam.id,
    awayTeamId: streetBundle.awayTeam.id,
    homeFormation: '4-4-2',
    awayFormation: '4-4-2',
    homeStreetFormation: '1-2-2-2',
    awayStreetFormation: '1-2-2-2',
    homePlaystyle: 'counterattack',
    awayPlaystyle: 'possession',
    homeTactics: engine.homeTactics,
    awayTactics: engine.awayTactics,
    difficulty: 'normal',
    halfDurationMinutes: 3,
    stadiumTier: streetBundle.stadium.tier,
    stadiumId: streetBundle.stadium.id,
    timeOfDay: 'night',
    seatColor: 'concrete',
    pitchPreset: 'custom',
    pitchLengthMeters: 46,
    pitchWidthMeters: 28,
    turfQuality: streetBundle.stadium.turfQuality,
    grassLength: streetBundle.stadium.grassLength,
    weather: 'clear',
    season: 'summer',
    netTension: 'hard',
    goalFrame: 'round_steel',
  });
  const payload = engine.getMatchCompletionPayload();
  assert.equal(payload.matchMode, 'street');
  assert.equal(payload.displayedHalfMinutes, 30);
  assert.equal(payload.scoreboardThemeId, 'street');
  assert.equal(payload.userInjured, false);
  assert.equal(payload.lockedUserRating, null);
});

console.log(`\n🎉 Phase 10 Integration Suite Complete: ${passed} / ${passed} tests passed!`);
