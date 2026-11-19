/**
 * Match simulator (dev tool, C1/C2/C3). Plays whole matches headless by calling engine.update directly, feeds simulated human input,
 * forces corners / goal kicks / penalties / free kicks / throw-ins, and asserts the match invariants + C3 assist & passing unit tests.
 * Enable in the browser with  ?dev=1  and run  await window.__devSim.run({ updates: 40000 })
 */
import type { AssistMode, KeyState, Player, PlayerAppearance } from '../types';
import { PITCH_CONFIG, HOME_FORMATION_BASE, AWAY_FORMATION_BASE } from './constants';
import { baseFailureProbability, failureProbability, resolveExecution, execStats } from './execution';
import { selectShortPassTarget, selectLongPassTarget, shortPassPowerForDistance } from './intent';
import { executeLongPassAction } from './playerActions';
import { setExecSeed } from './rng';
import { ALL_TEAMS } from './teams';
import {
  EARRING_PRESETS,
  FACIAL_HAIR_PRESETS,
  HAIR_PRESET_IDS,
  JERSEY_FIT_PRESETS,
  MELANIN_PALETTE,
  SOCK_HEIGHT_PRESETS,
  SLEEVE_LENGTH_PRESETS,
  TATTOO_PRESETS,
  COLLAR_STYLE_PRESETS,
  serializeAppearance,
} from './appearance';
import {
  APPEARANCE_SCHEMA_VERSION,
  ARM_TATTOOS_V2,
  CALF_SIZES_V2,
  CHEST_SIZES_V2,
  EARRING_GEMS_V2,
  EARRING_MATERIALS_V2,
  EARRING_STYLES_V2,
  FACE_TATTOOS_V2,
  FACIAL_HAIRS_V2,
  HAIR_COLORS_V2,
  HAIR_DYES_V2,
  HAIR_LENGTHS_V2,
  HAIR_TEXTURES_V2,
  HEADWEAR_V2,
  INTERIOR_SHIRT_NECKS_V2,
  INTERIOR_SHIRT_SLEEVES_V2,
  JERSEY_TUCKS_V2,
  LIMB_LENGTHS_V2,
  NECK_LENGTHS_V2,
  NECK_TATTOOS_V2,
  NECK_WIDTHS_V2,
  NECKLACES_V2,
  SHIRT_CUTS_V2,
  SHOE_COLOR_PRESETS_V2,
  SKIN_TONES_V2,
  SLEEVE_LENGTHS_V2,
  SOCK_LENGTHS_V2,
  THIGH_SIZES_V2,
  WAIST_SIZES_V2,
  appearanceCacheKeyV2,
  createDefaultAppearanceV2,
  deserializeAppearanceV2,
  migrateAppearanceV1ToV2,
  migrateAppearanceV2ToV1,
  repairAppearanceV2,
  serializeAppearanceV2,
  validateAppearanceV2,
} from './appearanceV2';
import { getBodyProfile, muscularityFromStrength } from './bodyProfile';
export {
  runRigClipAndConnectivityTest,
  runStrideLockVerification,
  runC7OptionRenderTests,
  generateC7ContactSheet,
  openC7PreviewSheetsOverlay,
  runC8OptionRenderTests,
  generateC8ContactSheet,
  openC8PreviewSheetsOverlay,
} from './rigTestTools';

export interface SimOptions {
  updates?: number;
  forceEvery?: number;
  controlKeeper?: boolean;
  maxViolations?: number;
  assistMode?: AssistMode;
}
export interface SimReport {
  execution?: any;
  ok: boolean;
  violations: string[];
  counts: Record<string, number>;
  final: { clock: number; half: number; phase: string; homeAttacksUp: boolean };
}

function emptyKeys(): KeyState {
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
  };
}

function mockPlayer(id: string, team: 'home' | 'away', x: number, y: number, lpa = 80, spa = 80, sprintSpeed = 3.6): Player {
  return {
    id,
    name: id,
    number: 10,
    team,
    role: 'CM1',
    x,
    y,
    vx: 0,
    vy: 0,
    targetX: x,
    targetY: y,
    baseX: 0.5,
    baseY: 0.5,
    facingAngle: -Math.PI / 2,
    facingDir: 'up',
    stats: { speed: 2.8, sprintSpeed, shotPower: 4.4, passing: 80, tackling: 70, heading: 70, dribbling: 78 },
    canonicalStats: {
      pac: 80, sta: 85, str: 75, bcl: 80, ret: 80, dri: 80,
      spa, lpa, cro: 75, sho: 75, hea: 70, lsh: 75,
      tck: 70, sld: 68, int: 70, mrk: 70, pos: 80, cmp: 80, rea: 80,
    },
    appearance: {} as any,
    action: 'idle',
    actionTimer: 0,
    stamina: 100,
    hasYellowCard: false,
    isRedCarded: false,
    animFrame: 0,
    animTimer: 0,
    isUserControlled: false,
    slideVelocityX: 0,
    slideVelocityY: 0,
    diveX: 0,
    diveY: 0,
  };
}

export async function runMatchSimulation(engine: any, SP: any, opts: SimOptions = {}): Promise<SimReport> {
  const updates = opts.updates ?? 40000, forceEvery = opts.forceEvery ?? 2500, maxV = opts.maxViolations ?? 12;
  if (opts.assistMode) {
    engine.assistBySide.home = opts.assistMode;
    if (engine.playerSlots?.[0]) {
      engine.playerSlots = engine.playerSlots.map((s: any) => ({ ...s, assistMode: opts.assistMode }));
    }
  }
  const violations: string[] = [];
  const counts: Record<string, number> = { updates: 0, goal_kick: 0, corner_kick: 0, penalty: 0, free_kick: 0, throw_in: 0, keeperTakers: 0, secondHalfChecks: 0, sideChecks: 0, humanShortPasses: 0, humanLongPasses: 0 };
  const st: Record<string, boolean> = {};
  const keys: any = new Proxy({}, { get: (_t, k: string) => !!st[k], set: () => true });
  const C = PITCH_CONFIG.CENTER_Y;
  const bad = (m: string) => { if (violations.length < maxV) violations.push(`[half ${engine.currentHalf} ${engine.matchPhase} t=${Math.round(engine.matchTimeSeconds)}] ${m}`); };
  let lastForcedN = -999, lastClock = engine.matchTimeSeconds, lastHalf = engine.currentHalf, lastSig = '', sameFor = 0, lastSp: any = null, checkedHalf2 = false, forced = 0;
  const attacksTop = (team: string) => (team === 'home') === engine.homeAttacksUp;
  const cornerY = (team: string) => (attacksTop(team) ? 60 : 2740);
  const scenarios: Array<() => void> = [
    () => SP.setupGoalKick(engine, 'home'), () => SP.setupGoalKick(engine, 'away'),
    () => SP.setupCornerKick(engine, 'home', 40, cornerY('home')), () => SP.setupCornerKick(engine, 'away', 1560, cornerY('away')),
    () => SP.setupCornerKick(engine, 'home', 1560, cornerY('home')), () => SP.setupCornerKick(engine, 'away', 40, cornerY('away')),
    () => SP.setupThrowIn(engine, 'home', 180, 1400), () => SP.setupThrowIn(engine, 'away', 1680, 1500),
    () => SP.setupFreeKick(engine, 'home', 900, attacksTop('home') ? 700 : 2100), () => SP.setupFreeKick(engine, 'away', 900, attacksTop('away') ? 700 : 2100),
    () => SP.setupPenalty(engine, 'home'), () => SP.setupPenalty(engine, 'away'),
  ];
  for (let n = 0; n < updates && violations.length < maxV; n++) {
    const sp = engine.setPiece;
    const cp = engine.getControlledPlayer?.();
    const humanHasBall = !!(cp && engine.ball.ownerId === cp.id && engine.matchPhase === 'in_play');
    st.ArrowUp = engine.homeAttacksUp;
    st.ArrowDown = !engine.homeAttacksUp;
    st.ArrowLeft = n % 120 < 40;
    st.ArrowRight = n % 120 >= 80;
    st.KeyA = !!(sp && sp.team === 'home' && n % 140 < 20); // shoot (penalties)
    st.KeyS = !!(sp && sp.team === 'home' && n % 90 < 20) || ((engine.matchPhase === 'kickoff' || engine.matchPhase === 'kickoff_ready') && n % 60 < 10);

    // Exercise real in-play human short & long passes across whichever AssistMode is configured
    if (humanHasBall && !engine.powerBar.isActive && n % 45 === 0) {
      if (n % 90 === 0) {
        engine.executeShortPass(cp, 0.35 + ((n % 5) * 0.12), false, false, keys);
        counts.humanShortPasses++;
      } else {
        engine.executeLongPass(cp, 0.45 + ((n % 4) * 0.13), false, false, keys);
        counts.humanLongPasses++;
      }
    }

    if (engine.gkGoUpPrompt) engine.resolveGkGoUp(false);
    if (engine.matchPhase === 'half_time' && engine.currentHalf === 1) engine.startSecondHalf();
    if (opts.controlKeeper) for (const p of engine.players) p.isUserControlled = p.team === 'home' && p.role === 'GK';
    if (n % forceEvery === Math.floor(forceEvery / 2) && engine.matchPhase === 'in_play') {
      try { lastForcedN = n; scenarios[forced++ % scenarios.length](); } catch (e: any) { bad('forcing a restart threw: ' + e.message); }
    }
    try { engine.update(keys); } catch (e: any) { bad('EXCEPTION: ' + e.message); break; }
    counts.updates++;
    // finite state
    for (const p of engine.players) if (![p.x, p.y, p.vx, p.vy].every(isFinite)) { bad(`non-finite player ${p.team} ${p.role}`); break; }
    const b = engine.ball, c = engine.camera;
    if (![b.x, b.y, b.z].every(isFinite)) bad('non-finite ball');
    if (![c.x, c.y, c.zoom].every(isFinite)) bad('non-finite camera');
    // clock
    if (engine.currentHalf === lastHalf && engine.matchTimeSeconds < lastClock - 0.001) bad(`clock ran backwards ${lastClock} -> ${engine.matchTimeSeconds}`);
    lastClock = engine.matchTimeSeconds; lastHalf = engine.currentHalf;
    // stuck phase
    const sig = engine.matchPhase + '|' + (engine.setPiece ? engine.setPiece.type : '') + '|' + Math.round(engine.matchTimeSeconds);
    sameFor = sig === lastSig ? sameFor + 1 : 0; lastSig = sig;
    if (sameFor > 7000 && engine.matchPhase !== 'half_time' && engine.matchPhase !== 'full_time') { bad('stuck in phase ' + sig); break; }
    // each new set piece
    const cur = engine.setPiece;
    if (cur && cur !== lastSp) {
      lastSp = cur;
      counts[cur.type] = (counts[cur.type] || 0) + 1;
      const taker = engine.players.find((p: any) => p.id === cur.takerId);
      if (cur.type === 'corner_kick' || cur.type === 'free_kick' || cur.type === 'penalty' || cur.isPenalty || cur.type === 'throw_in') {
        if (taker && taker.role === 'GK') {
          counts.keeperTakers++;
          const minute = engine.matchTimeSeconds / 60, diff = cur.team === 'home' ? engine.score.home - engine.score.away : engine.score.away - engine.score.home;
          const allowed = cur.type === 'throw_in' && minute >= 75 && diff < 0;
          if (!allowed) bad(`goalkeeper took a ${cur.type} (${cur.team})`);
        }
      }
      const attacksTopNow = (cur.team === 'home') === engine.homeAttacksUp;
      const info = `homeAttacksUp=${engine.homeAttacksUp}, lastTouch=${engine.ball.lastTouchTeam}, forced=${n - lastForcedN <= 3}, banner='${engine.bannerMessage}'`;
      if (cur.type === 'goal_kick') { counts.sideChecks++; if (attacksTopNow === (cur.spotY < C)) bad(`goal kick for ${cur.team} spot=(${Math.round(cur.spotX)},${Math.round(cur.spotY)}) is at the wrong end (${info})`); }
      if (cur.type === 'corner_kick' || cur.isPenalty) { counts.sideChecks++; if (attacksTopNow !== (cur.spotY < C)) bad(`${cur.type} for ${cur.team} spot=(${Math.round(cur.spotX)},${Math.round(cur.spotY)}) is at the wrong end (${info})`); }
    }
    // 2nd half really swapped
    if (engine.currentHalf === 2 && engine.matchPhase === 'in_play' && !checkedHalf2) {
      checkedHalf2 = true; counts.secondHalfChecks++;
      if (engine.homeAttacksUp !== false) bad('2nd half started but homeAttacksUp is still true');
      const hg = engine.players.find((p: any) => p.team === 'home' && p.role === 'GK'), ag = engine.players.find((p: any) => p.team === 'away' && p.role === 'GK');
      if (hg && hg.y > C) bad('2nd half: home keeper is still at the bottom goal');
      if (ag && ag.y < C) bad('2nd half: away keeper is still at the top goal');
    }
    if (n % 2000 === 0) await new Promise((r) => setTimeout(r, 0));
  }
  return { execution: JSON.parse(JSON.stringify(execStats)), ok: violations.length === 0, violations, counts, final: { clock: Math.round(engine.matchTimeSeconds), half: engine.currentHalf, phase: engine.matchPhase, homeAttacksUp: engine.homeAttacksUp } };
}

/** Execution model self-test: measured failure rate vs the design anchors (and interpolated steps), plus modifier sanity checks. */
export function runExecutionSelfTest(): { ok: boolean; rows: string[] } {
  const rows: string[] = []; let ok = true;
  const expected: Array<[number, number, number]> = [[40, 0.5, 0.03], [55, 0.2236, 0.03], [70, 0.1, 0.03], [80, 0.0574, 0.04], [90, 0.0329, 0.05], [95, 0.025, 0.06], [99, 0.02, 0.08], [100, 0.005, 0.2]];
  setExecSeed(20261101);
  for (const [stat, exp, relTol] of expected) {
    const N = stat >= 99 ? 250000 : 120000; let fails = 0;
    for (let i = 0; i < N; i++) if (resolveExecution('short_pass', stat, {}).failed) fails++;
    const measured = fails / N, formula = baseFailureProbability(stat);
    const sigma = Math.sqrt((exp * (1 - exp)) / N); const good = Math.abs(measured - exp) <= Math.max(0.0015, 4 * sigma) && Math.abs(formula - exp) < 0.0005; void relTol;
    if (!good) ok = false;
    rows.push(`${good ? 'ok  ' : 'FAIL'} stat ${stat}: expected ${(exp * 100).toFixed(2)}% (1 in ${(1 / exp).toFixed(0)})  formula ${(formula * 100).toFixed(2)}%  measured ${(measured * 100).toFixed(2)}%`);
  }
  const checks: Array<[string, boolean]> = [
    ['more pressure -> more failures', failureProbability(70, { pressure: 3 }) > failureProbability(70, { pressure: 0 })],
    ['more fatigue -> more failures', failureProbability(70, { fatigue: 1.5 }) > failureProbability(70, { fatigue: 1 })],
    ['match pressure hurts low composure more', failureProbability(70, { stakes: 1, composure: 45 }) > failureProbability(70, { stakes: 1, composure: 95 })],
    ['stat break is hit half as hard by pressure', (failureProbability(100, { pressure: 3 }) / failureProbability(100, {})) < (failureProbability(99, { pressure: 3 }) / failureProbability(99, {}))],
    ['higher stat never fails more (no pressure)', [0, 20, 40, 60, 70, 80, 90, 99, 100].every((s, i, a) => i === 0 || baseFailureProbability(s) <= baseFailureProbability(a[i - 1]))],
  ];
  for (const [name, pass] of checks) { rows.push(`${pass ? 'ok  ' : 'FAIL'} ${name}`); if (!pass) ok = false; }
  setExecSeed(null);
  for (const k of Object.keys(execStats)) delete execStats[k];
  return { ok, rows };
}

/** C3 Unit Tests: verifies ASSISTED / SEMI / MANUAL target selection, reachability, power preservation, and autonomous runner handoff. */
export function runPassingAndAssistUnitTests(engineFactory?: () => any): { ok: boolean; rows: string[] } {
  const rows: string[] = [];
  let ok = true;
  const check = (name: string, pass: boolean, detail = '') => {
    if (!pass) ok = false;
    rows.push(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
  };

  const keysUp = emptyKeys();
  keysUp.ArrowUp = true;

  // 1. Short pass ASSISTED: nearest teammate in aimed cone + power auto-corrected unless over/underpowered
  const passer = mockPlayer('p1', 'home', 800, 1400);
  const mateNearFwd = mockPlayer('mateNearFwd', 'home', 785, 1210);
  const mateFarFwd = mockPlayer('mateFarFwd', 'home', 810, 980);
  const mateBehind = mockPlayer('mateBehind', 'home', 800, 1470);
  const squad = [passer, mateNearFwd, mateFarFwd, mateBehind];

  const spAssisted = selectShortPassTarget(passer, squad, keysUp, 0.72, 'assisted', false, 'human', false, false);
  const expectedPow = shortPassPowerForDistance(Math.hypot(mateNearFwd.x - passer.x, mateNearFwd.y - passer.y));
  check('short ASSISTED picks nearest in aimed cone (ignores closer behind)', spAssisted.receiver?.id === 'mateNearFwd', `picked=${spAssisted.receiver?.id}`);
  check('short ASSISTED corrects power for perfect intent', Math.abs(spAssisted.power - expectedPow) < 0.01 && Math.abs(spAssisted.power - 0.72) > 0.1, `pow=${spAssisted.power.toFixed(3)}`);

  const spOver = selectShortPassTarget(passer, squad, keysUp, 0.94, 'assisted', false, 'human', false, false);
  const spUnder = selectShortPassTarget(passer, squad, keysUp, 0.10, 'assisted', false, 'human', false, false);
  check('short ASSISTED keeps overpowered >=0.90 error', spOver.power >= 0.90, `pow=${spOver.power}`);
  check('short ASSISTED keeps underpowered <0.14 error', spUnder.power < 0.14, `pow=${spUnder.power}`);

  // 2. Long pass ASSISTED: picks teammate in most dangerous position in aimed cone & reachable leading space
  const lpPasser = mockPlayer('lpPasser', 'home', 800, 1650);
  const safeMate = mockPlayer('safeMate', 'home', 760, 1460);
  const dangerMate = mockPlayer('dangerMate', 'home', 835, 1080);
  const blockerOpp = mockPlayer('oppMark', 'away', 765, 1445);
  const lpSquad = [lpPasser, safeMate, dangerMate, blockerOpp];

  const lpAssisted = selectLongPassTarget(lpPasser, lpSquad, keysUp, 0.60, 'assisted', false, true, 'human', false);
  check('long ASSISTED picks most dangerous teammate in cone', lpAssisted.receiver?.id === 'dangerMate', `picked=${lpAssisted.receiver?.id}`);
  check('long ASSISTED targets space in front of runner (attacking up)', lpAssisted.targetY < dangerMate.y, `targetY=${lpAssisted.targetY.toFixed(1)} vs mateY=${dangerMate.y}`);

  const leadDist = Math.hypot(lpAssisted.targetX - dangerMate.x, lpAssisted.targetY - dangerMate.y);
  const ballDist = Math.hypot(lpAssisted.targetX - lpPasser.x, lpAssisted.targetY - lpPasser.y);
  const approxFrames = Math.max(12, ballDist / 20);
  check('long ASSISTED leading space stays within runner reach', leadDist <= dangerMate.stats.sprintSpeed * approxFrames * 1.1 && leadDist > 15, `lead=${leadDist.toFixed(1)}`);

  // 3. SEMI: aim snaps cleanly toward teammate/space, raw power is strictly preserved
  const spSemiLow = selectShortPassTarget(passer, squad, keysUp, 0.24, 'semi', false, 'human', false, false);
  const spSemiHigh = selectShortPassTarget(passer, squad, keysUp, 0.78, 'semi', false, 'human', false, false);
  const angleToMate = Math.atan2(mateNearFwd.y - passer.y, mateNearFwd.x - passer.x);
  check('short SEMI snaps angle to intended teammate', Math.abs(spSemiLow.angle - angleToMate) < 0.01);
  check('short SEMI preserves exact raw power (low vs high)', Math.abs(spSemiLow.power - 0.24) < 1e-6 && Math.abs(spSemiHigh.power - 0.78) < 1e-6);
  check('short SEMI distance scales directly with raw power', Math.hypot(spSemiHigh.targetX - passer.x, spSemiHigh.targetY - passer.y) > Math.hypot(spSemiLow.targetX - passer.x, spSemiLow.targetY - passer.y) + 150);

  const lpSemiLow = selectLongPassTarget(lpPasser, lpSquad, keysUp, 0.25, 'semi', false, true, 'human', false);
  const lpSemiHigh = selectLongPassTarget(lpPasser, lpSquad, keysUp, 0.82, 'semi', false, true, 'human', false);
  check('long SEMI snaps angle to runner space', lpSemiLow.receiver?.id === 'dangerMate');
  check('long SEMI preserves exact raw power', Math.abs(lpSemiLow.power - 0.25) < 1e-6 && Math.abs(lpSemiHigh.power - 0.82) < 1e-6);
  check('long SEMI distance scales directly with raw power', Math.hypot(lpSemiHigh.targetX - lpPasser.x, lpSemiHigh.targetY - lpPasser.y) > Math.hypot(lpSemiLow.targetX - lpPasser.x, lpSemiLow.targetY - lpPasser.y) + 180);

  // 4. MANUAL: exact raw direction & power, zero receiver snapping
  const keysRight = emptyKeys();
  keysRight.ArrowRight = true; // aim right (0 rad) even though teammates are UP (-PI/2)
  const spManual = selectShortPassTarget(passer, squad, keysRight, 0.41, 'manual', false, 'human', false, false);
  const lpManual = selectLongPassTarget(lpPasser, lpSquad, keysRight, 0.63, 'manual', false, true, 'human', false);
  check('short MANUAL keeps exact raw angle and power (no snap)', spManual.receiver === null && Math.abs(spManual.angle) < 1e-6 && Math.abs(spManual.power - 0.41) < 1e-6);
  check('long MANUAL keeps exact raw angle and power (no snap)', lpManual.receiver === null && Math.abs(lpManual.angle) < 1e-6 && Math.abs(lpManual.power - 0.63) < 1e-6);

  // 5. Autonomous runner chase + handoff test on real MatchEngine if factory supplied
  if (engineFactory) {
    const eng = engineFactory();
    eng.isPaused = false;
    eng.matchPhase = 'in_play';
    eng.assistBySide.home = 'assisted';
    const homePasser = eng.players.find((p: Player) => p.team === 'home' && p.role === 'CM1');
    const homeRunner = eng.players.find((p: Player) => p.team === 'home' && p.role === 'ST1');
    if (homePasser && homeRunner) {
      homePasser.x = 800; homePasser.y = 1750; homePasser.facingAngle = -Math.PI / 2;
      homeRunner.x = 815; homeRunner.y = 1260; homeRunner.vx = 0; homeRunner.vy = 0;
      eng.userControlledPlayerId = homePasser.id;
      eng.slotControlledPlayerIds[1] = homePasser.id;
      eng.updateUserControlledFlag();
      eng.ball.ownerId = homePasser.id;
      eng.ball.x = homePasser.x; eng.ball.y = homePasser.y - 6;

      executeLongPassAction(eng.getActionExecutionContext(), homePasser, 0.65, false, false, keysUp);
      const chaseSet = (homeRunner.passChaseTimer || 0) > 0;
      const keptPasserCtrlInitially = eng.userControlledPlayerId === homePasser.id;
      check('long pass sets autonomous passChase without immediate cursor snatch', chaseSet && keptPasserCtrlInitially, `chaseTimer=${homeRunner.passChaseTimer}`);

      const yBefore = homeRunner.y;
      const idleKeys = emptyKeys();
      for (let i = 0; i < 6; i++) eng.update(idleKeys);
      const movedAutonomous = homeRunner.y < yBefore - 5;
      check('receiver runs autonomously toward ball space before control switches', movedAutonomous, `yBefore=${yBefore.toFixed(1)} yAfter=${homeRunner.y.toFixed(1)}`);

      // Simulate user switching control to receiver: autonomous chase clears and player awaits manual input
      eng.userControlledPlayerId = homeRunner.id;
      eng.slotControlledPlayerIds[1] = homeRunner.id;
      eng.updateUserControlledFlag();
      eng.update(idleKeys);
      check('autonomous chase clears once user takes control of receiver', (homeRunner.passChaseTimer || 0) === 0, `chaseTimer=${homeRunner.passChaseTimer}`);
    }
  }

  return { ok, rows };
}

/** C6 Unit Tests: verifies AppearanceV2 schema, full-roster & preset v1->v2 migration, round-trip serialization, invalid input repair, cache keys, and 4-tier rig mapping. */
export function runAppearanceV2UnitTests(): { ok: boolean; rows: string[] } {
  const rows: string[] = [];
  let ok = true;
  const check = (name: string, pass: boolean, detail = '') => {
    if (!pass) ok = false;
    rows.push(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
  };

  // 1. Default schema validity & version
  const def = createDefaultAppearanceV2();
  const defVal = validateAppearanceV2(def);
  check('default AppearanceV2 validates cleanly with version=2', defVal.valid && defVal.errors.length === 0 && def.version === APPEARANCE_SCHEMA_VERSION);

  // 2. Every option value round-trips identically through serializeAppearanceV2 <-> deserializeAppearanceV2
  const maxOpts = Math.max(
    HAIR_LENGTHS_V2.length,
    HAIR_TEXTURES_V2.length,
    HAIR_COLORS_V2.length,
    HAIR_DYES_V2.length,
    SKIN_TONES_V2.length,
    FACIAL_HAIRS_V2.length,
    HEADWEAR_V2.length,
    NECKLACES_V2.length,
    NECK_TATTOOS_V2.length,
    ARM_TATTOOS_V2.length,
    FACE_TATTOOS_V2.length,
    EARRING_STYLES_V2.length,
    EARRING_MATERIALS_V2.length,
    EARRING_GEMS_V2.length,
    NECK_WIDTHS_V2.length,
    NECK_LENGTHS_V2.length,
    CHEST_SIZES_V2.length,
    WAIST_SIZES_V2.length,
    THIGH_SIZES_V2.length,
    CALF_SIZES_V2.length,
    LIMB_LENGTHS_V2.length,
    SHIRT_CUTS_V2.length,
    JERSEY_TUCKS_V2.length,
    SOCK_LENGTHS_V2.length,
    SLEEVE_LENGTHS_V2.length,
    SHOE_COLOR_PRESETS_V2.length
  );

  let allRoundTripOk = true;
  for (let i = 0; i < maxOpts; i++) {
    const sample = createDefaultAppearanceV2({
      hairLength: HAIR_LENGTHS_V2[i % HAIR_LENGTHS_V2.length],
      hairTexture: HAIR_TEXTURES_V2[i % HAIR_TEXTURES_V2.length],
      hairColor: HAIR_COLORS_V2[i % HAIR_COLORS_V2.length],
      hairDye: HAIR_DYES_V2[i % HAIR_DYES_V2.length],
      skinTone: SKIN_TONES_V2[i % SKIN_TONES_V2.length],
      facialHair: FACIAL_HAIRS_V2[i % FACIAL_HAIRS_V2.length],
      headwear: HEADWEAR_V2[i % HEADWEAR_V2.length],
      necklace: NECKLACES_V2[i % NECKLACES_V2.length],
      tattoos: {
        neck: NECK_TATTOOS_V2[i % NECK_TATTOOS_V2.length],
        leftArm: ARM_TATTOOS_V2[i % ARM_TATTOOS_V2.length],
        rightArm: ARM_TATTOOS_V2[(i + 2) % ARM_TATTOOS_V2.length],
        face: FACE_TATTOOS_V2[i % FACE_TATTOOS_V2.length],
      },
      earrings: {
        left: {
          style: EARRING_STYLES_V2[i % EARRING_STYLES_V2.length],
          material: EARRING_MATERIALS_V2[i % EARRING_MATERIALS_V2.length],
          gem: EARRING_GEMS_V2[i % EARRING_GEMS_V2.length],
        },
        right: {
          style: EARRING_STYLES_V2[(i + 1) % EARRING_STYLES_V2.length],
          material: EARRING_MATERIALS_V2[(i + 2) % EARRING_MATERIALS_V2.length],
          gem: EARRING_GEMS_V2[(i + 3) % EARRING_GEMS_V2.length],
        },
      },
      physique: {
        heightCm: 165 + ((i * 3) % 38),
        weightKg: 60 + ((i * 5) % 45),
        strength: 50 + ((i * 7) % 55),
        neckWidth: NECK_WIDTHS_V2[i % NECK_WIDTHS_V2.length],
        neckLength: NECK_LENGTHS_V2[i % NECK_LENGTHS_V2.length],
        chest: CHEST_SIZES_V2[i % CHEST_SIZES_V2.length],
        waist: WAIST_SIZES_V2[i % WAIST_SIZES_V2.length],
        thighs: THIGH_SIZES_V2[i % THIGH_SIZES_V2.length],
        calves: CALF_SIZES_V2[i % CALF_SIZES_V2.length],
        legsLength: LIMB_LENGTHS_V2[i % LIMB_LENGTHS_V2.length],
        armsLength: LIMB_LENGTHS_V2[(i + 1) % LIMB_LENGTHS_V2.length],
      },
      uniform: {
        shirtCut: SHIRT_CUTS_V2[i % SHIRT_CUTS_V2.length],
        tucked: JERSEY_TUCKS_V2[i % JERSEY_TUCKS_V2.length],
        socks: SOCK_LENGTHS_V2[i % SOCK_LENGTHS_V2.length],
        sleeves: SLEEVE_LENGTHS_V2[i % SLEEVE_LENGTHS_V2.length],
        interiorShirt: {
          enabled: i % 2 === 1,
          sleeve: INTERIOR_SHIRT_SLEEVES_V2[i % INTERIOR_SHIRT_SLEEVES_V2.length],
          neck: INTERIOR_SHIRT_NECKS_V2[(i + 1) % INTERIOR_SHIRT_NECKS_V2.length],
        },
        shoeColor: SHOE_COLOR_PRESETS_V2[i % SHOE_COLOR_PRESETS_V2.length],
      },
    });
    const ser = serializeAppearanceV2(sample);
    const des = deserializeAppearanceV2(ser);
    const v = validateAppearanceV2(des);
    if (!v.valid || JSON.stringify(des) !== JSON.stringify(sample)) {
      allRoundTripOk = false;
      break;
    }
  }
  check('all C6 option combinations validate & serialization round-trips losslessly', allRoundTripOk);

  // 3. Every old appearance across ALL_TEAMS + HOME/AWAY_FORMATION_BASE + all v1 enum presets migrates cleanly
  let rosterCount = 0;
  let rosterFailed = 0;
  for (const team of ALL_TEAMS) {
    for (const p of [...team.players, ...(team.substitutes || [])]) {
      rosterCount++;
      const str = (p.canonicalStats as any)?.str;
      const v2 = migrateAppearanceV1ToV2(p.appearance, typeof str === 'number' ? { strength: str } : undefined);
      const val = validateAppearanceV2(v2);
      const rt = deserializeAppearanceV2(serializeAppearanceV2(v2));
      const bp = getBodyProfile(v2);
      if (!val.valid || JSON.stringify(rt) !== JSON.stringify(v2) || ![bp.chestW, bp.waistW, bp.thighT, bp.calfT, bp.neckW].every(Number.isFinite)) {
        rosterFailed++;
      }
    }
  }
  for (const base of [HOME_FORMATION_BASE, AWAY_FORMATION_BASE]) {
    for (const slot of Object.values(base)) {
      rosterCount++;
      const v2 = migrateAppearanceV1ToV2(slot.appearance);
      const val = validateAppearanceV2(v2);
      const rt = deserializeAppearanceV2(serializeAppearanceV2(v2));
      if (!val.valid || JSON.stringify(rt) !== JSON.stringify(v2)) rosterFailed++;
    }
  }
  check(`migrated all ${rosterCount} roster & formation v1 appearances`, rosterFailed === 0 && rosterCount > 0, `failed=${rosterFailed}`);

  // Also check every v1 preset enum value (including legacy aliases)
  const legacyHairs = [...HAIR_PRESET_IDS, 'curly_blond', 'afro_black', 'ponytail_dark', 'dreads', 'crop_brown', 'blond_sweep', 'ginger_curly', 'spiky_black', 'shaved'];
  let presetOk = true;
  for (let i = 0; i < legacyHairs.length; i++) {
    const v1: PlayerAppearance = {
      heightCm: 170 + (i % 25),
      weightKg: 65 + (i % 28),
      muscleMass: (i % 5) + 1,
      calfTier: (i % 4) as 0 | 1 | 2 | 3,
      waistTier: ((i + 1) % 4) as 0 | 1 | 2 | 3,
      chestTier: ((i + 2) % 4) as 0 | 1 | 2 | 3,
      neckTier: ((i + 3) % 4) as 0 | 1 | 2 | 3,
      skinTone: MELANIN_PALETTE[i % MELANIN_PALETTE.length],
      hairStyle: legacyHairs[i],
      hairColor: i % 3 === 0 ? '#111111' : i % 3 === 1 ? '#2563eb' : '#fde047',
      facialHair: FACIAL_HAIR_PRESETS[i % FACIAL_HAIR_PRESETS.length],
      jerseyFit: JERSEY_FIT_PRESETS[i % JERSEY_FIT_PRESETS.length],
      collarStyle: COLLAR_STYLE_PRESETS[i % COLLAR_STYLE_PRESETS.length],
      sleeveLength: SLEEVE_LENGTH_PRESETS[i % SLEEVE_LENGTH_PRESETS.length],
      sockHeight: SOCK_HEIGHT_PRESETS[i % SOCK_HEIGHT_PRESETS.length],
      earrings: EARRING_PRESETS[i % EARRING_PRESETS.length],
      tattoos: {
        leftArm: TATTOO_PRESETS[i % TATTOO_PRESETS.length],
        rightArm: TATTOO_PRESETS[(i + 1) % TATTOO_PRESETS.length],
      },
      hasBeard: i % 2 === 0,
    };
    const v2 = migrateAppearanceV1ToV2(v1);
    const rt = deserializeAppearanceV2(serializeAppearanceV2(v2));
    const backToV1 = migrateAppearanceV2ToV1(v2);
    const v1Ser = serializeAppearance(v1);
    const v1DesV2 = deserializeAppearanceV2(v1Ser);
    if (!validateAppearanceV2(v2).valid || JSON.stringify(rt) !== JSON.stringify(v2) || !validateAppearanceV2(v1DesV2).valid || !backToV1.skinTone) {
      presetOk = false;
      break;
    }
  }
  check('all v1 presets, legacy hair aliases, and v1 serialized strings migrate cleanly', presetOk);

  // 4. Invalid values are repaired, not rejected
  const corruptInputs: unknown[] = [
    null,
    undefined,
    'not-an-object',
    [],
    {},
    {
      version: 99,
      hairLength: 'mohawk',
      hairTexture: 42,
      hairColor: 'neon_purple',
      hairDye: 'none',
      skinTone: 'alien_green',
      facialHair: '3 day stubble',
      headwear: 'helmet',
      necklace: 'gold_chain',
      tattoos: { neck: 'dragon', leftArm: null, rightArm: 'tribal', face: 123 },
      earrings: { left: 'broken', right: { style: 'gem', material: 'wood', gem: 'ruby' } },
      physique: {
        heightCm: NaN,
        weightKg: Infinity,
        strength: 999,
        neckWidth: 'gigantic',
        neckLength: 'giraffe',
        chest: 'massive',
        waist: 'xl',
        thighs: -1,
        calves: 'tiny',
        legsLength: 'extra_long',
        armsLength: null,
      },
      uniform: {
        shirtCut: 'big / retro',
        tucked: 'half',
        socks: 'high-knee',
        sleeves: 'sleeveless',
        interiorShirt: { enabled: 'yes', sleeve: 'medium', neck: 'v' },
        shoeColor: '#F0A',
      },
    },
    {
      version: 2,
      uniform: { shoeColor: 'not_a_hex', interiorShirt: null },
      physique: { heightCm: -10, weightKg: 999, strength: -5 },
    },
  ];
  let repairOk = true;
  for (const bad of corruptInputs) {
    const res = validateAppearanceV2(bad);
    const post = validateAppearanceV2(res.repaired);
    if (res.valid || res.errors.length === 0 || !post.valid || !Number.isFinite(res.repaired.physique.heightCm) || !Number.isFinite(res.repaired.physique.weightKg) || !Number.isFinite(res.repaired.physique.strength)) {
      repairOk = false;
      break;
    }
  }
  const badStrings = ['', 'garbage', 'v2|broken|fields|only', 'v2|shaven|bad|bad|bad|bad|bad'];
  for (const s of badStrings) {
    const d = deserializeAppearanceV2(s);
    if (!validateAppearanceV2(d).valid) repairOk = false;
  }
  const repairedAlias = repairAppearanceV2({
    uniform: { shoeColor: '#F0A', shirtCut: 'big / retro' as any },
    facialHair: '3 day stubble' as any,
  });
  check(
    'invalid/corrupt objects and strings are repaired without throwing',
    repairOk && repairedAlias.uniform.shoeColor === '#ff00aa' && repairedAlias.uniform.shirtCut === 'big_retro' && repairedAlias.facialHair === 'three_day_stubble'
  );

  // 5. Strength -> muscularity & 4-tier physique monotonic check
  const muscOk =
    muscularityFromStrength(0) === 'low' &&
    muscularityFromStrength(70) === 'low' &&
    muscularityFromStrength(71) === 'medium' &&
    muscularityFromStrength(89) === 'medium' &&
    muscularityFromStrength(90) === 'high' &&
    muscularityFromStrength(105) === 'high';
  const thinBp = getBodyProfile(createDefaultAppearanceV2({ physique: { chest: 'frail', waist: 'skinny', thighs: 'skinny', calves: 'skinny', neckWidth: 'thin' } }));
  const thickBp = getBodyProfile(createDefaultAppearanceV2({ physique: { chest: 'powerful', waist: 'chonky', thighs: 'huge', calves: 'huge', neckWidth: 'bulky' } }));
  check(
    'strength->muscularity & 4-tier thickness fields map onto bodyProfile',
    muscOk &&
      thickBp.chestW > thinBp.chestW &&
      thickBp.waistW > thinBp.waistW &&
      thickBp.thighT > thinBp.thighT &&
      thickBp.calfT > thinBp.calfT &&
      thickBp.neckW > thinBp.neckW
  );

  // 6. Cache key stability & visual equivalence
  const shavenA = createDefaultAppearanceV2({ hairLength: 'shaven', hairTexture: 'straight', hairColor: 'black' });
  const shavenB = createDefaultAppearanceV2({ hairLength: 'shaven', hairTexture: 'dreads', hairColor: 'blonde' });
  const shortA = createDefaultAppearanceV2({ hairLength: 'short', hairTexture: 'straight', hairColor: 'black' });
  const shortB = createDefaultAppearanceV2({ hairLength: 'short', hairTexture: 'curly', hairColor: 'black' });
  check(
    'appearanceCacheKeyV2 is deterministic & collapses hidden fields while distinguishing visible differences',
    appearanceCacheKeyV2(shavenA) === appearanceCacheKeyV2(shavenB) &&
      appearanceCacheKeyV2(shortA) !== appearanceCacheKeyV2(shortB) &&
      serializeAppearanceV2(shavenA) !== serializeAppearanceV2(shavenB) &&
      serializeAppearance(shavenA) === appearanceCacheKeyV2(shavenA)
  );

  return { ok, rows };
}

