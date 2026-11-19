/**
 * Phase 5 Renderers, Turf ('Synthetic', 'Sand' < 'Poor'), Rain 'Muddy' Physics & Dynamic Final Boards Tests
 *
 * Run with:
 *   ./node_modules/.bin/tsx src/gameplay/game/__tests__/phase5TurfWeatherAndRenderers.test.ts
 */

import assert from 'node:assert/strict';
import { HOME_KIT, AWAY_KIT, PITCH_CONFIG } from '../constants';
import { resolveMatchModeRules } from '../../types';
import {
  getTurfRollingModifiers,
  getTurfInjuryMultiplier,
} from '../turfPhysics';
import {
  resolvePitchSurfaceStatus,
  getMuddyConditionModifiers,
  getWeatherSurfaceModifiers,
  generatePuddleZones,
} from '../weatherEngine';
import { getGoalFrameMetrics } from '../goalNetPhysics';
import { resolvePitchMetrics, syncPitchConfigWithMetrics } from '../pitchDimensions';
import { setExecSeed } from '../rng';
import {
  calculateShortPassPhysics,
  calculateLongPassPhysics,
  calculateShotPhysics,
} from '../ballPhysics';
import { updateBallPhysics } from '../physics';
import {
  CASUAL_STREETWEAR_PALETTE,
  generateStandSpectators,
  resolveCrowdTargetDensity,
  drawStreetFenceOnlookers,
} from '../crowdRenderer';
import {
  formatFinalBoardText,
  resolveCompetitionMatchVenue,
} from '../../../utils/competitionVenueSystem';
import {
  buildAdboardPanels,
  drawStadiumAdHoardings,
  drawStadiumFloodlights,
} from '../stadiumRenderer';
import { resolveEffectiveStreetConfig, drawStreetArena } from '../streetRenderer';
import { drawPitch } from '../pitchRenderer';
import { createDefaultStadium } from '../stadiumRegistry';
import type { Ball, Player } from '../../types';

function createMockCtx() {
  const texts: string[] = [];
  const ops: string[] = [];
  const ctx: any = {
    fillStyle: '#000000',
    strokeStyle: '#ffffff',
    lineWidth: 1,
    shadowBlur: 0,
    globalAlpha: 1,
    font: '10px monospace',
    textBaseline: 'middle',
    imageSmoothingEnabled: false,
    save: () => ops.push('save'),
    restore: () => ops.push('restore'),
    beginPath: () => ops.push('beginPath'),
    closePath: () => ops.push('closePath'),
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    rect: () => {},
    clip: () => {},
    fill: () => ops.push('fill'),
    stroke: () => ops.push('stroke'),
    fillRect: () => ops.push('fillRect'),
    strokeRect: () => ops.push('strokeRect'),
    setLineDash: () => {},
    createPattern: () => null,
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    fillText: (text: string) => {
      texts.push(String(text));
    },
  };
  return { ctx: ctx as CanvasRenderingContext2D, texts, ops };
}

function makeDummyPlayer(id = 'p1', team: 'home' | 'away' = 'home'): Player {
  return {
    id,
    name: 'Test Player',
    team,
    role: 'CM',
    number: 8,
    x: 600,
    y: 500,
    vx: 0,
    vy: 0,
    facingAngle: -Math.PI / 2,
    stamina: 100,
    maxStamina: 100,
    ovr: 78,
    hasBall: true,
    action: 'idle',
    animFrame: 0,
    stats: {
      speed: 4.0,
      acceleration: 0.25,
      shotPower: 4.4,
      passing: 80,
      tackling: 70,
    },
    canonicalStats: {
      pac: 75,
      sho: 75,
      pas: 78,
      dri: 76,
      def: 70,
      phy: 74,
      cmp: 75,
      fin: 74,
      spw: 75,
      lsa: 74,
      acc: 75,
      spr: 75,
      sta: 80,
      agi: 75,
      bal: 74,
      pos: 75,
      vis: 76,
      cro: 74,
      int: 70,
      mrk: 70,
      str: 74,
      agg: 70,
      jmp: 72,
      hea: 72,
      fk: 70,
      pen: 72,
      gk: 20,
    },
  } as unknown as Player;
}

function makeDummyBall(): Ball {
  return {
    x: 600,
    y: 500,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    spin: 0,
    spinY: 0,
    ownerId: null,
    lastTouchTeam: 'home',
    lastTouchPlayerId: 'p1',
    isAirborne: false,
    rotationAngle: 0,
    inPuddle: false,
  };
}

function testTurfPhysicsContracts() {
  const poor = getTurfRollingModifiers('poor', 'normal');
  const synthetic = getTurfRollingModifiers('synthetic', 'normal');
  const concrete = getTurfRollingModifiers('concrete', 'normal');
  const sand = getTurfRollingModifiers('sand', 'normal');

  // Synthetic matches poor rolling/bounce/micro-hops + carries +10% injury risk
  assert.equal(synthetic.friction, poor.friction);
  assert.equal(synthetic.bounceRestitution, poor.bounceRestitution);
  assert.equal(synthetic.microBounceChance, poor.microBounceChance);
  assert.equal(getTurfInjuryMultiplier('synthetic'), 1.10);
  assert.equal(getTurfInjuryMultiplier('poor'), 1.0);
  assert.equal(getTurfInjuryMultiplier('normal'), 1.0);

  // Concrete: fast smooth roll & crisp bounce
  assert.equal(concrete.friction, 0.991);
  assert.equal(concrete.bounceRestitution, 0.78);
  assert.equal(concrete.microBounceChance, 0.0);

  // Sand strictly slower and worse than poor
  assert.ok(sand.friction < poor.friction, 'sand friction must be lower (heavier drag) than poor');
  assert.ok(sand.bounceRestitution < poor.bounceRestitution, 'sand bounce must be deader than poor');
  assert.ok(sand.playerRunSpeedMultiplier < poor.playerRunSpeedMultiplier, 'sand player run speed must be slower than poor');
  assert.ok(sand.staminaMultiplier > poor.staminaMultiplier, 'sand stamina drain must be higher than poor');
  assert.ok(sand.microBounceChance > poor.microBounceChance, 'sand micro-hop deflection must be worse than poor');
}

function testRainMuddyPhysics5To10Percent() {
  assert.equal(resolvePitchSurfaceStatus('rain', 'sand'), 'muddy');
  assert.equal(resolvePitchSurfaceStatus('torrential', 'sand'), 'muddy');
  assert.equal(resolvePitchSurfaceStatus('rain', 'normal'), 'wet');
  assert.equal(resolvePitchSurfaceStatus('clear', 'sand'), 'normal');
  assert.equal(resolvePitchSurfaceStatus('snow', 'normal'), 'snowy');

  const normalMods = getMuddyConditionModifiers('normal');
  assert.equal(normalMods.isMuddy, false);
  assert.equal(normalMods.playerSpeedMultiplier, 1.0);

  const muddy = getMuddyConditionModifiers('muddy');
  assert.equal(muddy.isMuddy, true);
  assert.ok(muddy.playerSpeedMultiplier >= 0.90 && muddy.playerSpeedMultiplier <= 0.95);
  assert.ok(muddy.staminaDrainMultiplier >= 1.05 && muddy.staminaDrainMultiplier <= 1.10);
  assert.ok(muddy.groundBallSpeedMultiplier >= 0.90 && muddy.groundBallSpeedMultiplier <= 0.95);
  assert.ok(muddy.airBallSpeedMultiplier >= 1.05 && muddy.airBallSpeedMultiplier <= 1.10);
  assert.ok(muddy.shortPassSpeedMultiplier >= 0.90 && muddy.shortPassSpeedMultiplier <= 0.95);
  assert.ok(muddy.shortPassErrorRadMax > 0 && muddy.shortPassErrorRadMax <= 0.10);

  // Sand + Rain puddles & weather surface modifiers
  const puddles = generatePuddleZones('sand', 'rain');
  assert.ok(puddles.length >= 8, 'sand generates rich muddy bog puddle zones');
  const weatherMods = getWeatherSurfaceModifiers('rain', 'summer', 'sand');
  assert.ok(weatherMods.rollFrictionMultiplier < 1.0);
  assert.ok(weatherMods.passDistanceMultiplier < 1.0);

  // Ball physics compares muddy vs normal ground pass, long pass & aerial shot
  const p = makeDummyPlayer();
  p.canonicalStats = {
    ...(p.canonicalStats as any),
    spa: 99,
    lpa: 99,
    sho: 99,
    lsh: 99,
    cmp: 99,
  };
  const acc = {
    isStanding: true,
    isRunning: false,
    isSprinting: false,
    isDefenderTouching: false,
    touchingDefender: null,
    errorSpreadMultiplier: 1.0,
    fatigueFactor: 1.0,
    pressureIntensity: 0.0,
    difficultyMultiplier: 1.0,
  };

  try {
    setExecSeed(9001);
    const dryPass = calculateShortPassPhysics(p, 600, 320, 0.55, false, false, acc, 0, 'normal');
    setExecSeed(9001);
    const mudPass = calculateShortPassPhysics(p, 600, 320, 0.55, false, false, acc, 0, 'muddy');
    const dryPassSpeed = Math.hypot(dryPass.vx, dryPass.vy);
    const mudPassSpeed = Math.hypot(mudPass.vx, mudPass.vy);
    assert.ok(mudPassSpeed < dryPassSpeed, `muddy ground short pass (${mudPassSpeed.toFixed(3)}) must be ~5-10% slower than normal (${dryPassSpeed.toFixed(3)})`);

    setExecSeed(9002);
    const dryLong = calculateLongPassPhysics(p, 600, 200, 0.85, false, false, acc, 0, 'normal');
    setExecSeed(9002);
    const mudLong = calculateLongPassPhysics(p, 600, 200, 0.85, false, false, acc, 0, 'muddy');
    assert.ok(
      Math.hypot(mudLong.vx, mudLong.vy) > Math.hypot(dryLong.vx, dryLong.vy),
      'muddy long pass travels crisper through the air (+8% air modifier)'
    );

    setExecSeed(9003);
    const dryShot = calculateShotPhysics(p, 100, 600, 0.9, false, false, acc, 0, 'normal');
    setExecSeed(9003);
    const mudShot = calculateShotPhysics(p, 100, 600, 0.9, false, false, acc, 0, 'muddy');
    const dryShotAirSpeed = Math.hypot(dryShot.vx, dryShot.vy);
    const mudShotAirSpeed = Math.hypot(mudShot.vx, mudShot.vy);
    assert.ok(mudShotAirSpeed > dryShotAirSpeed, 'muddy condition lofted/aerial long shot must travel faster (+8% low drag air effect)');
  } finally {
    setExecSeed(null);
  }

  // Rolling ground ball decelerates faster in 'muddy' status in physics loop
  const groundDry = { ...makeDummyBall(), vx: 6.0, vy: 0, isAirborne: false };
  const groundMud = { ...makeDummyBall(), vx: 6.0, vy: 0, isAirborne: false };
  updateBallPhysics(groundDry, () => {}, undefined, undefined, 1, 'sand', 'normal', 'clear', 'summer', [], 'moderate', 'standard', true, 'normal');
  updateBallPhysics(groundMud, () => {}, undefined, undefined, 1, 'sand', 'normal', 'rain', 'summer', [], 'moderate', 'standard', true, 'muddy');
  assert.ok(groundMud.vx < groundDry.vx, `muddy ground roll drag (${groundMud.vx.toFixed(4)}) must slow rolling ground balls more than dry sand (${groundDry.vx.toFixed(4)})`);
}

function testGoalNetScalingAcrossModes() {
  try {
    syncPitchConfigWithMetrics(resolvePitchMetrics({ preset: 'balanced' }, 'pro'));
    const proGoal = getGoalFrameMetrics('standard');
    assert.equal(proGoal.width, 220);
    assert.equal(proGoal.depth, 60);
    assert.equal(proGoal.crossbarHeight, 65);

    syncPitchConfigWithMetrics(resolvePitchMetrics({ preset: 'balanced' }, 'youth'));
    const youthGoal = getGoalFrameMetrics('standard');
    assert.equal(youthGoal.width, 192);
    assert.equal(youthGoal.depth, 52);
    assert.equal(youthGoal.crossbarHeight, 56);

    syncPitchConfigWithMetrics(resolvePitchMetrics({ preset: 'balanced' }, 'street'));
    const streetGoal = getGoalFrameMetrics('standard');
    assert.equal(streetGoal.width, 148);
    assert.equal(streetGoal.depth, 40);
    assert.equal(streetGoal.crossbarHeight, 46);
  } finally {
    syncPitchConfigWithMetrics(resolvePitchMetrics({ preset: 'balanced' }, 'pro'));
  }
}

function testYouthCasualCrowdAndFinalAttendance() {
  // 1. Attendance percentage override (60-80%)
  assert.equal(resolveCrowdTargetDensity('crowded', 70), 0.70);
  assert.equal(resolveCrowdTargetDensity('packet', 0.65), 0.65);

  const proCrowd = generateStandSpectators(100, HOME_KIT, AWAY_KIT, 'crowded', {
    isCasualYouthCrowd: false,
  });
  const youthFinalCrowd = generateStandSpectators(100, HOME_KIT, AWAY_KIT, 'packet', {
    isCasualYouthCrowd: true,
    crowdAttendancePctOverride: 70,
  });

  // 70% attendance on 5-row stand is strictly smaller than full packet (100% + aisle standing)
  const fullPacketCrowd = generateStandSpectators(100, HOME_KIT, AWAY_KIT, 'packet', {
    isCasualYouthCrowd: false,
  });
  assert.ok(
    youthFinalCrowd.length < fullPacketCrowd.length && youthFinalCrowd.length > proCrowd.length * 0.55,
    '70% Youth Cup Final crowd should sit realistically between empty and full capacity'
  );

  // Verify casual youth mix: ~20-25% team jerseys, majority casual streetwear colors
  const casualSet = new Set(CASUAL_STREETWEAR_PALETTE);
  const casualCount = youthFinalCrowd.filter((s) => casualSet.has(s.color)).length;
  const casualRatio = casualCount / Math.max(1, youthFinalCrowd.length);
  assert.ok(
    casualRatio >= 0.65 && casualRatio <= 0.85,
    `Expected ~75-80% casual clothing in Youth crowd, got ${(casualRatio * 100).toFixed(1)}%`
  );

  // Street fence onlookers
  const { ctx } = createMockCtx();
  assert.equal(drawStreetFenceOnlookers(ctx, 'none', HOME_KIT, AWAY_KIT), 0);
  const sparseCount = drawStreetFenceOnlookers(ctx, 'sparse_locals', HOME_KIT, AWAY_KIT);
  const blockPartyCount = drawStreetFenceOnlookers(ctx, 'block_party_fence', HOME_KIT, AWAY_KIT);
  assert.ok(sparseCount > 5 && blockPartyCount > sparseCount);
}

function testDynamicFinalBoardsAndYouthRules() {
  assert.equal(formatFinalBoardText('Buenos Aires', 2027), 'FINAL • BUENOS AIRES • 2027');

  const finalPanels = buildAdboardPanels('monumental', undefined, {
    city: 'Madrid',
    year: 2028,
  });
  assert.ok(
    finalPanels.some((p) => p.text === 'FINAL • MADRID • 2028'),
    'Dynamic FINAL • CITY • YEAR panel must be injected into adboard panels'
  );

  // Verify Int'l Youth Cup Final resolves to existing Pro stadium + FINAL board format
  const youthCupFinalVenue = resolveCompetitionMatchVenue({
    competitionId: 'INTL_YOUTH_CUP',
    stageName: 'Grand Final',
    seasonYear: 2029,
    isFinal: true,
    overrideCity: 'Rome',
    language: 'en-GB',
  });
  assert.ok(youthCupFinalVenue, 'Int\'l Youth Cup Final venue should resolve');
  assert.equal(youthCupFinalVenue!.finalBannerText, 'FINAL • ROME • 2029');
  assert.ok(youthCupFinalVenue!.capacity >= 60000, 'Int\'l Youth Cup Final must host at an existing Pro stadium');

  // Verify drawStadiumAdHoardings draws the FINAL board text onto canvas
  const { ctx, texts } = createMockCtx();
  drawStadiumAdHoardings(ctx, 'monumental', 'night', undefined, undefined, 'modern_dynamic_led', {
    city: 'Rome',
    year: 2029,
  });
  assert.ok(
    texts.some((t) => t.includes('FINAL • ROME • 2029')),
    'drawStadiumAdHoardings must render FINAL • ROME • 2029 onto perimeter boards'
  );

  // Youth unlit stadium floodlight suppression
  const unlitYouthStad = {
    ...createDefaultStadium('Barrio Academy Field', 'youth'),
    id: 'test_youth_small',
    turfQuality: 'synthetic' as const,
    lighting: { type: 'none' as const, pylonCount: 0, powerKw: 0, timeOfDay: 'noon' as const },
  };
  const floodCtx = createMockCtx();
  drawStadiumFloodlights(floodCtx.ctx, 'ascenso', 'night', 0, 0, unlitYouthStad);
  assert.equal(floodCtx.ops.length, 0, 'Unlit Youth stadium must draw zero floodlight towers');

  // Regular Youth vs Special/Final rule verification
  const youthRegular = resolveMatchModeRules('youth', { competitionTag: 'youth_league', turfQuality: 'synthetic' });
  assert.equal(youthRegular.disableSurroundingsAndIntro, true);
  assert.equal(youthRegular.syntheticInjuryBonusPct, 10);
  const youthFinal = resolveMatchModeRules('youth', { competitionTag: 'intl_youth_cup_final', turfQuality: 'pristine' });
  assert.equal(youthFinal.disableSurroundingsAndIntro, false);
}

function testStreetRendererAndDrawPitchBypass() {
  const streetStad = {
    ...createDefaultStadium('Barrio Cage', 'street'),
    id: 'test_street_arena',
    turfQuality: 'sand' as const,
    streetSurface: 'sand' as const,
    streetConfig: {
      archetype: 'coastal_boardwalk' as const,
      surface: 'sand' as const,
      perimeterWallStyle: 'timber_seawall' as const,
      courtMarkings: 'multisport_crossover' as const,
      goalStyle: 'crates_and_pipes' as const,
      streetLighting: 'festoon_string_lights' as const,
      fenceCrowdMode: 'block_party_fence' as const,
      urbanProps: ['parked_cars' as const, 'laundry_lines' as const, 'corner_kiosk' as const],
    },
  };

  const cfg = resolveEffectiveStreetConfig(streetStad, 'sand');
  assert.equal(cfg.surface, 'sand');
  assert.equal(cfg.perimeterWallStyle, 'timber_seawall');

  const { ctx, ops } = createMockCtx();
  drawStreetArena(ctx, {
    topNet: { impactX: 600, impactY: 200, impactZ: 10, bulgeAmount: 4, bulgeVel: 0, shake: 1, ballCaught: false },
    bottomNet: { impactX: 600, impactY: 800, impactZ: 10, bulgeAmount: 0, bulgeVel: 0, shake: 0, ballCaught: false },
    pitchTilt: 0.5,
    cameraX: PITCH_CONFIG.CENTER_X,
    cameraY: PITCH_CONFIG.CENTER_Y,
    viewLeft: 0,
    viewTop: 0,
    viewWidth: 1200,
    viewHeight: 900,
    timeOfDay: 'sunset',
    homeKit: HOME_KIT,
    awayKit: AWAY_KIT,
    turfQuality: 'sand',
    weather: 'rain',
    season: 'summer',
    goalFrame: 'standard',
    netTension: 'soft',
    puddles: generatePuddleZones('sand', 'rain'),
    surfaceStatus: 'muddy',
    stadiumDef: streetStad,
  });

  assert.ok(ops.length > 25, 'Street renderer must issue court, wall, prop, onlooker, puddle, and goal draw operations');

  // Verify drawPitch routes Street venues straight through streetRenderer and bypasses stadium grandstands/adboards
  const pitchMock = createMockCtx();
  drawPitch(
    pitchMock.ctx,
    0,
    0,
    1200,
    900,
    undefined,
    undefined,
    0.5,
    PITCH_CONFIG.CENTER_X,
    PITCH_CONFIG.CENTER_Y,
    { tier: 'performance' } as any,
    PITCH_CONFIG.CENTER_Y,
    false,
    'ascenso',
    'night',
    'auto',
    HOME_KIT,
    AWAY_KIT,
    'sand',
    'normal',
    'rain',
    'summer',
    'moderate',
    'standard',
    generatePuddleZones('sand', 'rain'),
    'horizontal',
    'normal',
    'empty',
    false,
    false,
    streetStad,
    undefined,
    undefined,
    undefined,
    'muddy',
    true,
    70,
    { city: 'Rio', year: 2028 }
  );
  assert.ok(
    !pitchMock.texts.some((t) => t.includes('FINAL • RIO • 2028')),
    'Street Mode must completely bypass stadium perimeter ad-hoardings and grandstands'
  );
}

function runAll() {
  testTurfPhysicsContracts();
  testRainMuddyPhysics5To10Percent();
  testGoalNetScalingAcrossModes();
  testYouthCasualCrowdAndFinalAttendance();
  testDynamicFinalBoardsAndYouthRules();
  testStreetRendererAndDrawPitchBypass();
  console.log('✅ Phase 5 tests passed (Turf, Rain Muddy 5–10%, Youth/Street Nets & Crowds, Dynamic Final Boards & Street Renderer)');
}

runAll();
