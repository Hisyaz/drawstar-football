/**
 * Phase 9: MatchEngine Mechanics (Youth 35m, Street 7v7, Muddy Physics) & Mode-Specific HUD Scoreboards
 * Automated Verification Suite
 *
 * Run with:
 *   ./node_modules/.bin/tsx src/gameplay/game/__tests__/phase9EngineAndHud.test.ts
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

import { resolveMatchModeRules } from '../../types';
import { getMatchModeRules, isStreet7v7Squad } from '../formations';
import { updateTeamBlockShape } from '../tactics';
import { determineOutOfBoundsAward } from '../matchRules';
import { applyStreetSidelineWallRebound } from '../pitchBoundary';
import { DOUBLE_TAP_E_WINDOW_MS, InputSkillTracker } from '../skills';
import { resolvePitchSurfaceStatus, getMuddyConditionModifiers } from '../weatherEngine';
import { MatchEngine } from '../engine';
import { PITCH_CONFIG } from '../constants';
import { buildStreetGameplayTeams, buildU17NationalGameplayTeams, buildYouthAndIntlCupGameplayTeams } from '../../../utils/gameplayAdapter';
import { STREET_STADIUM_BY_CITY } from '../streetStadiumGenerator';
import { GENERATED_YOUTH_LEAGUE_STADIUMS } from '../youthStadiumGenerator';
import { getScoreboardTheme } from '../../components/MatchHUD';
import { STARTING_CITIES } from '../../../constants';
import type { Ball, KeyState } from '../../types';

function makeKeys(overrides: Partial<KeyState> = {}): KeyState {
  return {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Shift: false,
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    KeyQ: false,
    KeyE: false,
    Space: false,
    ...overrides,
  };
}

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`✅ [Phase 9] ${name}`);
  } catch (err) {
    console.error(`❌ [Phase 9] FAILED: ${name}`);
    throw err;
  }
}

// =========================================================================
// 1. Rules Resolver & Formations
// =========================================================================
test('getMatchModeRules resolves Youth (35m), Int’l Youth Cup Final (45m), U17 WC (45m), and Street 7v7 (30m + 1.10x + walls)', () => {
  const pro = getMatchModeRules('pro');
  assert.equal(pro.maxPlayersPerTeam, 11);
  assert.equal(pro.displayedHalfMinutes, 45);
  assert.equal(pro.speedMultiplier, 1.0);
  assert.equal(pro.offsidesEnabled, true);
  assert.equal(pro.foulsMode, 'ifab');
  assert.equal(pro.syntheticInjuryBonusPct, 0);

  const youthLeague = getMatchModeRules('youth', { competitionTag: 'youth_league', turfQuality: 'synthetic' });
  assert.equal(youthLeague.maxPlayersPerTeam, 11);
  assert.equal(youthLeague.displayedHalfMinutes, 35);
  assert.equal(youthLeague.offsidesEnabled, true);
  assert.equal(youthLeague.syntheticInjuryBonusPct, 10);

  const cupKnockout = getMatchModeRules('youth', { competitionTag: 'intl_youth_cup' });
  assert.equal(cupKnockout.displayedHalfMinutes, 35);

  const cupFinal = getMatchModeRules('youth', { competitionTag: 'intl_youth_cup_final' });
  assert.equal(cupFinal.displayedHalfMinutes, 45, 'Int’l Youth Cup Final uses 45m halves');

  const u17 = resolveMatchModeRules('youth', { competitionTag: 'u17_world_cup' });
  assert.equal(u17.displayedHalfMinutes, 45, 'U17 World Cup uses 45m halves');

  const street = getMatchModeRules('street');
  assert.equal(street.maxPlayersPerTeam, 7);
  assert.equal(street.displayedHalfMinutes, 30);
  assert.equal(street.speedMultiplier, 1.1);
  assert.equal(street.sidelineWallsBounce, true);
  assert.equal(street.cornersAsThrowIns, true);
  assert.equal(street.offsidesEnabled, false);
  assert.equal(street.foulsMode, 'street_hit_only');
});

// =========================================================================
// 2. Street 7v7 MatchEngine Clocks, Speed, Pitch Geometry & Formations
// =========================================================================
test('MatchEngine Street mode applies 7v7 1-2-2-2, 30m halves, 1.10x timeScale, and 46m x 28m bounds', () => {
  const engine = new MatchEngine();
  const streetBundle = buildStreetGameplayTeams('madrid');
  const madridStreetStadium = STREET_STADIUM_BY_CITY['madrid'];

  engine.setTeam('home', streetBundle.homeTeam);
  engine.setTeam('away', streetBundle.awayTeam);
  engine.applyPreMatchConfig({
    matchMode: 'street',
    isStreetMatch: true,
    competitionTag: 'street',
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
    stadiumTier: madridStreetStadium.tier,
    stadiumId: madridStreetStadium.id,
    timeOfDay: 'night',
    seatColor: 'concrete',
    pitchPreset: 'custom',
    pitchLengthMeters: 46,
    pitchWidthMeters: 28,
    turfQuality: madridStreetStadium.turfQuality,
    grassLength: madridStreetStadium.grassLength,
    weather: 'clear',
    season: 'summer',
    netTension: 'hard',
    goalFrame: 'round_steel',
  });

  assert.equal(engine.matchMode, 'street');
  assert.equal(engine.displayedHalfMinutes, 30);
  assert.equal(engine.scoreboardThemeId, 'street');

  const homePlayers = engine.players.filter((p) => p.team === 'home');
  const awayPlayers = engine.players.filter((p) => p.team === 'away');
  assert.equal(homePlayers.length, 7);
  assert.equal(awayPlayers.length, 7);
  assert.equal(isStreet7v7Squad(engine.players, 'home'), true);
  assert.equal(isStreet7v7Squad(engine.players, 'away'), true);

  // TimeScale includes Street 1.10x boost (gameSpeed=100% -> 0.70 * 1.10 = 0.77)
  engine.gameSpeed = 100;
  assert.ok(Math.abs(engine.getTimeScale() - 0.70 * 1.10) < 1e-6);
  // Surface speed multiplier must NOT double-stack 1.10x on clear concrete/normal turf
  const surf = engine.getSurfaceMovementMultipliers();
  assert.equal(surf.speedMult, 1.0);

  // Period check triggers at 30:00 + stoppage instead of 45:00
  engine.currentHalf = 1;
  engine.firstHalfStoppageMinutes = 1;
  engine.matchTimeSeconds = 30 * 60 + 30;
  assert.equal((engine as any).isPeriodOver(), false);
  engine.matchTimeSeconds = 31 * 60;
  assert.equal((engine as any).isPeriodOver(), true);

  engine.startSecondHalf();
  assert.equal(engine.currentHalf, 2);
  assert.equal(engine.matchTimeSeconds, 30 * 60);

  engine.secondHalfStoppageMinutes = 2;
  engine.matchTimeSeconds = 61 * 60;
  assert.equal((engine as any).isPeriodOver(), false);
  engine.matchTimeSeconds = 62 * 60;
  assert.equal((engine as any).isPeriodOver(), true);

  // Compact block tactics must stay cleanly within the compact 46m x 28m pitch
  updateTeamBlockShape('home', engine.ball, 'mid_block', 'normal', engine.players, true, 'possession', engine.homeTactics);
  for (const pl of engine.players) {
    assert.ok(pl.targetX >= PITCH_CONFIG.PITCH_LEFT && pl.targetX <= PITCH_CONFIG.PITCH_RIGHT);
    assert.ok(pl.targetY >= PITCH_CONFIG.PITCH_TOP && pl.targetY <= PITCH_CONFIG.PITCH_BOTTOM);
  }
});

// =========================================================================
// 3. Youth 35m vs U17/Cup Final 45m Clocks & Scoreboard Theme Inference
// =========================================================================
test('Youth Leagues run 35m halves and Int’l Youth Cup Final / U17 WC run 45m halves', () => {
  const engine = new MatchEngine();
  const romaStadium = GENERATED_YOUTH_LEAGUE_STADIUMS['youth_roma_big'];
  const youthBundle = buildYouthAndIntlCupGameplayTeams({
    competitionMode: 'youth_league',
    homeClub: 'Trastevere Giovanile',
    awayClub: 'Parioli Calcio Junior',
  });

  engine.setTeam('home', youthBundle.homeTeam);
  engine.setTeam('away', youthBundle.awayTeam);
  engine.applyPreMatchConfig({
    matchMode: 'youth',
    competitionTag: 'youth_league',
    youthCityId: 'roma',
    homeTeamId: youthBundle.homeTeam.id,
    awayTeamId: youthBundle.awayTeam.id,
    homeFormation: '4-3-3',
    awayFormation: '4-3-3',
    homePlaystyle: 'possession',
    awayPlaystyle: 'gegenpress',
    homeTactics: engine.homeTactics,
    awayTactics: engine.awayTactics,
    difficulty: 'normal',
    halfDurationMinutes: 3,
    stadiumTier: romaStadium.tier,
    stadiumId: romaStadium.id,
    timeOfDay: 'noon',
    seatColor: 'red',
    pitchPreset: 'standard',
    turfQuality: romaStadium.turfQuality,
    grassLength: romaStadium.grassLength,
    weather: 'clear',
    season: 'spring',
    netTension: 'moderate',
    goalFrame: 'standard',
  });

  assert.equal(engine.displayedHalfMinutes, 35);
  assert.equal(engine.scoreboardThemeId, 'youth_roma');
  engine.firstHalfStoppageMinutes = 0;
  engine.matchTimeSeconds = 35 * 60;
  assert.equal((engine as any).isPeriodOver(), true);

  engine.startSecondHalf();
  assert.equal(engine.matchTimeSeconds, 35 * 60);
  engine.secondHalfStoppageMinutes = 0;
  engine.matchTimeSeconds = 70 * 60;
  assert.equal((engine as any).isPeriodOver(), true);

  // Int'l Youth Cup Final switches up to 45m halves and displays City + Year
  engine.applyPreMatchConfig({
    matchMode: 'youth',
    competitionTag: 'intl_youth_cup_final',
    finalBoardCity: 'Lisboa',
    finalBoardYear: 2028,
    homeTeamId: youthBundle.homeTeam.id,
    awayTeamId: youthBundle.awayTeam.id,
    homeFormation: '4-3-3',
    awayFormation: '4-3-3',
    homePlaystyle: 'possession',
    awayPlaystyle: 'gegenpress',
    homeTactics: engine.homeTactics,
    awayTactics: engine.awayTactics,
    difficulty: 'elite',
    halfDurationMinutes: 3,
    stadiumTier: 'monumental',
    timeOfDay: 'night',
    seatColor: 'auto',
    pitchPreset: 'standard',
    turfQuality: 'pristine',
    grassLength: 'short',
    weather: 'clear',
    season: 'summer',
    netTension: 'hard',
    goalFrame: 'standard',
  });
  assert.equal(engine.displayedHalfMinutes, 45);
  assert.equal(engine.scoreboardThemeId, 'intl_youth_cup_final');
  const cupFinalTheme = getScoreboardTheme(engine.scoreboardThemeId, {
    finalBoardCity: engine.finalBoardCity,
    finalBoardYear: engine.finalBoardYear,
  });
  assert.ok(cupFinalTheme.label.includes('FINAL • LISBOA 2028'));

  // U17 World Cup runs 45m halves
  const u17Bundle = buildU17NationalGameplayTeams({
    homeNation: 'ARG',
    awayNation: 'FRA',
  });
  engine.setTeam('home', u17Bundle.homeTeam);
  engine.setTeam('away', u17Bundle.awayTeam);
  engine.applyPreMatchConfig({
    matchMode: 'youth',
    competitionTag: 'u17_world_cup',
    homeTeamId: u17Bundle.homeTeam.id,
    awayTeamId: u17Bundle.awayTeam.id,
    homeFormation: '4-3-3',
    awayFormation: '4-3-3',
    homePlaystyle: 'possession',
    awayPlaystyle: 'gegenpress',
    homeTactics: engine.homeTactics,
    awayTactics: engine.awayTactics,
    difficulty: 'elite',
    halfDurationMinutes: 3,
    stadiumTier: 'monumental',
    timeOfDay: 'night',
    seatColor: 'auto',
    pitchPreset: 'standard',
    turfQuality: 'pristine',
    grassLength: 'short',
    weather: 'clear',
    season: 'summer',
    netTension: 'hard',
    goalFrame: 'standard',
  });
  assert.equal(engine.displayedHalfMinutes, 45);
  assert.equal(engine.scoreboardThemeId, 'u17_world_cup');
});

// =========================================================================
// 4. Street Sideline Walls & Endline Throw-In Corners
// =========================================================================
test('Street sidelines bounce live (vx = -vx * 0.78) with zero throw-ins; defending endline awards throw-in corners', () => {
  const ball: Ball = {
    x: PITCH_CONFIG.PITCH_LEFT - 4,
    y: PITCH_CONFIG.CENTER_Y,
    prevX: PITCH_CONFIG.PITCH_LEFT + 5,
    prevY: PITCH_CONFIG.CENTER_Y,
    z: 2,
    vx: -10,
    vy: 2,
    vz: 0,
    spin: 0,
    spinY: 0,
    ownerId: 'p1',
    lastTouchTeam: 'home',
    lastTouchPlayerId: 'p1',
    isAirborne: false,
    isOverpowered: false,
    isSpecialCurve: false,
    isChipped: false,
    isDividedBall: false,
    rollFrictionOverride: null,
  };
  applyStreetSidelineWallRebound(ball, 0.78);
  assert.ok(ball.x >= PITCH_CONFIG.PITCH_LEFT + 2);
  assert.ok(Math.abs(ball.vx - 7.8) < 1e-6, 'vx rebounds at -0.78 restitution');
  assert.equal(ball.ownerId, null);
  assert.equal(ball.isDividedBall, true);

  // Rule helper returns null on touchlines in Street mode
  assert.equal(
    determineOutOfBoundsAward(
      {
        hasExited: true,
        type: 'touchline_left',
        crossingX: PITCH_CONFIG.PITCH_LEFT,
        crossingY: PITCH_CONFIG.CENTER_Y,
        crossingZ: 0,
        t: 0,
        isGoalMouthEntrance: false,
      },
      ball,
      'HOME',
      'AWAY',
      true,
      { matchMode: 'street' }
    ),
    null
  );

  // Defending touch over top endline triggers corner throw-in in Street mode
  ball.lastTouchTeam = 'away'; // away defends top when homeAttacksUp = true
  const cornerAward = determineOutOfBoundsAward(
    {
      hasExited: true,
      type: 'endline_top',
      crossingX: PITCH_CONFIG.PITCH_RIGHT - 20,
      crossingY: PITCH_CONFIG.PITCH_TOP,
      crossingZ: 0,
      t: 0,
      isGoalMouthEntrance: false,
    },
    ball,
    'HOME',
    'AWAY',
    true,
    { matchMode: 'street' }
  );
  assert.ok(cornerAward);
  assert.equal(cornerAward!.type, 'throw_in');
  assert.equal(cornerAward!.fromCorner, true);
  assert.equal(cornerAward!.awardedTeam, 'home');
  assert.equal(cornerAward!.spotX, PITCH_CONFIG.PITCH_RIGHT - 8);
  assert.equal(cornerAward!.spotY, PITCH_CONFIG.PITCH_TOP + 8);

  // Engine integration verify: sideline exit stays in_play & bounces
  const engine = new MatchEngine();
  engine.applyStadium({
    ...STREET_STADIUM_BY_CITY['buenos_aires'],
    turfQuality: 'synthetic',
    pitchLengthMeters: 46,
    pitchWidthMeters: 28,
  });
  engine.matchPhase = 'in_play';
  engine.ball.x = PITCH_CONFIG.PITCH_LEFT - 5;
  engine.ball.y = PITCH_CONFIG.CENTER_Y;
  engine.ball.vx = -8;
  (engine as any).checkOutOfBounds();
  assert.equal(engine.matchPhase, 'in_play');
  assert.equal(engine.setPiece, null);
  assert.ok(engine.ball.vx > 0);

  // Defending endline exit in Street mode creates a throw_in setPiece from the corner and increments corners
  engine.ball.x = PITCH_CONFIG.PITCH_RIGHT - 20;
  engine.ball.y = PITCH_CONFIG.PITCH_TOP - 5;
  engine.ball.lastTouchTeam = 'away';
  (engine as any).checkOutOfBounds();
  assert.equal(engine.matchPhase, 'throw_in');
  assert.equal(engine.matchStats.home.corners, 1);
});

// =========================================================================
// 5. Street Offsides Disabled & Double-Tap E Foul Rule
// =========================================================================
test('Street mode disables offsides, suppresses regular fouls/cards, and whistles fouls ONLY on double-tap E hits', () => {
  // Verify DOUBLE_TAP_E_WINDOW_MS and tracker
  assert.equal(DOUBLE_TAP_E_WINDOW_MS, 280);
  const tracker = new InputSkillTracker();
  const s1 = tracker.update(makeKeys({ KeyE: true }), 1000);
  assert.equal(s1.doubleTapE, false);
  tracker.update(makeKeys({ KeyE: false }), 1080);
  const s2 = tracker.update(makeKeys({ KeyE: true }), 1220); // 220ms <= 280ms
  assert.equal(s2.doubleTapE, true);
  // Outside window (>280ms) does not fire
  tracker.update(makeKeys({ KeyE: false }), 1260);
  const s3 = tracker.update(makeKeys({ KeyE: true }), 1600);
  assert.equal(s3.doubleTapE, false);

  const engine = new MatchEngine();
  engine.applyStadium({
    ...STREET_STADIUM_BY_CITY['buenos_aires'],
    turfQuality: 'normal',
    pitchLengthMeters: 46,
    pitchWidthMeters: 28,
  });
  engine.matchPhase = 'in_play';

  // Offside blocked
  const attacker = engine.players.find((p) => p.team === 'home' && p.role !== 'GK')!;
  const defender = engine.players.find((p) => p.team === 'away' && p.role !== 'GK')!;
  (engine as any).triggerOffside(attacker);
  assert.equal(engine.matchPhase, 'in_play');
  assert.equal(engine.matchStats.home.offsides, 0);

  // Standard foul suppressed
  (engine as any).awardFoul(attacker, attacker.x, attacker.y, defender);
  assert.equal(engine.matchStats.away.fouls, 0);
  assert.equal(engine.matchPhase, 'in_play');

  // Double-tap E hit within range whistles foul cleanly with zero cards
  attacker.team = 'home';
  defender.team = 'away';
  attacker.x = PITCH_CONFIG.CENTER_X;
  attacker.y = PITCH_CONFIG.CENTER_Y;
  defender.x = attacker.x + 28;
  defender.y = attacker.y;
  const hitAwarded = (engine as any).tryStreetDoubleTapHit(attacker);
  assert.equal(hitAwarded, true);
  assert.equal(engine.matchPhase, 'free_kick');
  assert.equal(engine.matchStats.home.fouls, 1);
  assert.equal(engine.matchStats.home.yellowCards, 0);
  assert.equal(engine.matchStats.home.redCards, 0);
});

// =========================================================================
// 6. Muddy Conditions & Turf Injury Risk + Career Street Injury Sim
// =========================================================================
test('Muddy conditions (sand + rain/torrential) apply -7% run speed & +9% stamina burn; synthetic turf gives +10% injury risk & Career Street locks rating on injury', () => {
  assert.equal(resolvePitchSurfaceStatus('rain', 'sand'), 'muddy');
  assert.equal(resolvePitchSurfaceStatus('torrential', 'sand'), 'muddy');
  const muddy = getMuddyConditionModifiers('muddy');
  assert.ok(Math.abs(muddy.playerSpeedMultiplier - 0.93) < 1e-6);
  assert.ok(Math.abs(muddy.staminaDrainMultiplier - 1.09) < 1e-6);

  const engine = new MatchEngine();
  engine.applyStadium({
    ...GENERATED_YOUTH_LEAGUE_STADIUMS['youth_roma_small'],
    category: 'youth',
    turfQuality: 'sand',
    weather: 'rain',
  });
  const sandRainSurf = engine.getSurfaceMovementMultipliers();
  assert.equal(engine.pitchSurfaceStatus, 'muddy');
  assert.ok(sandRainSurf.speedMult < 0.94, 'Muddy pitch slows run speed');
  assert.ok(sandRainSurf.staminaMult > 1.08, 'Muddy pitch increases stamina burn');

  // Synthetic turf +10% injury bonus vs natural grass
  const sampleVictim = engine.players.find((p) => p.team === 'home' && p.role !== 'GK')!;
  engine.turfQuality = 'normal';
  const baseRisk = (engine as any).computeTackleInjuryRisk(sampleVictim, true, false);
  engine.turfQuality = 'synthetic';
  const syntheticRisk = (engine as any).computeTackleInjuryRisk(sampleVictim, true, false);
  assert.ok(Math.abs(syntheticRisk / baseRisk - 1.1) < 1e-4, 'Synthetic turf multiplies injury chance by 1.10');

  // Career Street tackle injury snapshots locked rating & sims remaining minutes
  const streetEngine = new MatchEngine();
  const streetBundle = buildStreetGameplayTeams('london');
  streetEngine.setTeam('home', streetBundle.homeTeam);
  streetEngine.setTeam('away', streetBundle.awayTeam);
  streetEngine.matchMode = 'street';
  streetEngine.displayedHalfMinutes = 30;
  streetEngine.controlMode = 'one_player';
  const hero = streetEngine.players.find((p) => p.team === 'home' && p.role !== 'GK')!;
  const mate = streetEngine.players.find((p) => p.team === 'home' && p.id !== hero.id)!;
  streetEngine.lockedPlayerId = hero.id;
  streetEngine.playerRatings.recordPassCompletion(hero.id, mate, true);
  streetEngine.playerRatings.recordGoal(hero.id, null, 'away', streetEngine.players);
  const preInjuryRating = streetEngine.playerRatings.getRating(hero.id);
  const tackler = streetEngine.players.find((p) => p.team === 'away' && p.role !== 'GK')!;
  streetEngine.matchPhase = 'in_play';
  streetEngine.matchTimeSeconds = 12 * 60;

  const injuredTriggered = streetEngine.evaluateTackleInjury(tackler, hero, true, true, true);
  assert.equal(injuredTriggered, true);
  assert.equal(streetEngine.userWasInjuredInMatch, true);
  assert.equal(streetEngine.lockedUserRatingAtInjury, preInjuryRating);
  assert.ok(streetEngine.userInjuryRiskPct > 0);
  assert.equal(streetEngine.matchPhase, 'full_time');
  assert.equal(streetEngine.matchTimeSeconds, 60 * 60);

  const payload = streetEngine.getMatchCompletionPayload();
  assert.equal(payload.userInjured, true);
  assert.equal(payload.lockedUserRating, preInjuryRating);
  assert.equal(payload.matchMode, 'street');
  assert.equal(payload.displayedHalfMinutes, 30);
});

// =========================================================================
// 7. Distinct Mode & League Broadcast Scoreboard Themes
// =========================================================================
test('getScoreboardTheme returns unique themes for Street, all 9 Youth Leagues, Int’l Youth Cup, U17 WC, and Pro', () => {
  const streetTheme = getScoreboardTheme('street');
  assert.equal(streetTheme.id, 'street');
  assert.equal(streetTheme.showBroadcastLiveDot, false);
  assert.equal(streetTheme.iconKind, 'street');
  assert.equal(streetTheme.rightWordmarkSub, 'STREET');

  const leagueIds = new Set<string>();
  const leagueLabels = new Set<string>();
  assert.equal(STARTING_CITIES.length, 9);
  for (const city of STARTING_CITIES) {
    const theme = getScoreboardTheme(`youth_${city.id}`);
    assert.equal(theme.id, `youth_${city.id}`);
    assert.equal(theme.iconKind, 'youth');
    leagueIds.add(theme.id);
    leagueLabels.add(theme.label);
  }
  assert.equal(leagueIds.size, 9);
  assert.equal(leagueLabels.size, 9);

  const cupTheme = getScoreboardTheme('intl_youth_cup');
  assert.equal(cupTheme.iconKind, 'cup');
  const cupFinalTheme = getScoreboardTheme('intl_youth_cup_final', { finalBoardCity: 'Madrid', finalBoardYear: 2029 });
  assert.ok(cupFinalTheme.label.includes('FINAL • MADRID 2029'));

  const u17Theme = getScoreboardTheme('u17_world_cup');
  assert.equal(u17Theme.iconKind, 'u17');
  assert.equal(u17Theme.label, 'U17 WORLD CUP');

  const proTheme = getScoreboardTheme('pro');
  assert.equal(proTheme.iconKind, 'tv');
  assert.equal(proTheme.label, 'MATCHDAY');
});

console.log(`\n🎉 All ${passed} Phase 9 tests passed!`);
