/**
 * HOTFIX PHASE A9: Street 7v7 Expanded City Pool, Top-15 Captain Draw,
 * Strict [1 GK, 2 DEF, 2 MID, 2 ATT] Positional Quotas, Unique Career Highest-OVR Captaincy
 * & Light-vs-Dark Streetwear Clothes Automated Verification Suite
 *
 * Run with:
 *   ./node_modules/.bin/tsx src/gameplay/game/__tests__/hotfixPhaseA9Street.test.ts
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

import { NATIONALITIES, STARTING_CITIES } from '../../../constants';
import type { PlayerCardData, PlayerConfig } from '../../../types';
import { MatchEngine } from '../engine';
import { applyTeamToEngine, getTeamById, registerRuntimeMatchTeams } from '../teams';
import {
  buildStreetMatchTeams,
  collectStreetCityPlayerPool,
  computeStreetRemainingBucketNeeds,
  drawStreetCaptainCandidates,
  getStreetPlayerOvr,
  resolveStreetLineBucket,
} from '../../../utils/streetTeamBuilder';
import { buildStreetGameplayTeams } from '../../../utils/gameplayAdapter';

const LIGHT_TOP_COLORS = new Set([
  '#f8fafc',
  '#7dd3fc',
  '#bae6fd',
  '#fef08a',
  '#fbcfe8',
  '#f9a8d4',
  '#fef3c7',
]);

const DARK_TOP_COLORS = new Set([
  '#111827',
  '#09090b',
  '#3b0764',
  '#4c1d95',
  '#451a03',
  '#5c3317',
  '#1f2937',
]);

function makeCareerUser(
  overrides: Partial<PlayerConfig & PlayerCardData> = {}
): PlayerConfig & PlayerCardData {
  const nat = NATIONALITIES.find((n) => n.code === 'ARG') || NATIONALITIES[0];
  return {
    id: 'a9_career_user',
    name: 'Lucas Potrero',
    number: 10,
    shirtNumber: 10,
    age: 16,
    ovr: 64,
    overallRating: 64,
    potentialOvr: 88,
    position: 'ATT',
    subPosition: 'ST',
    club: 'Palermo Juniors',
    league: 'Liga Bonaerense de Juveniles',
    nationality: nat,
    heightCm: 175,
    weightKg: 68,
    preferredFoot: 'Right',
    weakFootStars: 4,
    playStyle: 'Poacher',
    stats: { pro: 65, def: 44, cre: 63, men: 62, goa: 66, phy: 64 },
    biometrics: {
      strength: 64,
      skinColor: '#d99b66',
      hairStyle: 'curly',
      hairLength: 'short',
      hairRoot: '#18181b',
      hairDye: '#18181b',
    },
    accessories: {
      accessory: 'none',
      headbandColor: '#ffffff',
    },
    kit: { color1: '#0284c7', color2: '#ffffff', pattern: 'sash' },
    emblem: { shape: 'star-shield', mode: '2', color1: '#0284c7', color2: '#ffffff' },
    ...overrides,
  };
}

function assertLineCounts1222(
  slots: ReturnType<typeof buildStreetMatchTeams>['homeSlots'],
  label: string
) {
  assert.equal(slots.length, 7, `${label} must have exactly 7 players`);
  const gks = slots.filter((s) => s.streetRole === 'GK');
  const defs = slots.filter((s) => s.streetRole === 'DEF1' || s.streetRole === 'DEF2');
  const mids = slots.filter((s) => s.streetRole === 'MID1' || s.streetRole === 'MID2');
  const atts = slots.filter((s) => s.streetRole === 'ATT1' || s.streetRole === 'ATT2');
  assert.equal(gks.length, 1, `${label} must have strictly 1 GK slot`);
  assert.equal(defs.length, 2, `${label} must have 2 DEF slots`);
  assert.equal(mids.length, 2, `${label} must have 2 MID slots`);
  assert.equal(atts.length, 2, `${label} must have 2 ATT slots`);

  // Also check that no duplicate GK cards exist across outfield slots!
  const naturalGkCards = slots.filter((s) => resolveStreetLineBucket(s.player) === 'GK');
  assert.equal(naturalGkCards.length, 1, `${label} must contain strictly 1 natural GK (0 duplicate GKs)`);
}

async function runTests() {
  // =========================================================================
  // 1. Expanded City Pool Includes D1 & D2 Reserves / U20 / U17
  // =========================================================================
  for (const city of STARTING_CITIES.slice(0, 4)) {
    const cityPool = collectStreetCityPlayerPool(city.id);
    assert.ok(cityPool.stats.youthCount > 0, `${city.id} includes Youth`);
    assert.ok(cityPool.stats.d1Count > 0, `${city.id} includes D1`);
    assert.ok(cityPool.stats.d2Count > 0, `${city.id} includes D2`);
    assert.ok(
      cityPool.stats.reservesCount > 0,
      `${city.id} must include reserves from D1/D2 (${cityPool.stats.reservesCount})`
    );
    assert.ok(
      cityPool.stats.u20Count > 0,
      `${city.id} must include U20 squads from D1/D2 (${cityPool.stats.u20Count})`
    );
    assert.ok(
      cityPool.stats.u17Count > 0,
      `${city.id} must include U17 squads from D1/D2 (${cityPool.stats.u17Count})`
    );
  }
  console.log('✓ 1. Expanded City Pools include City Youth + D1 + D2 (squad, reserves, u20, u17)');

  // =========================================================================
  // 2. Top-15 Captain Card Draw & Sequential Home -> Away Disjoint Draw
  // =========================================================================
  const homeDraw = drawStreetCaptainCandidates('madrid', null, { count: 3, seed: 'a9-draw-home' });
  assert.equal(homeDraw.candidates.length, 3, 'Must draw 3 captain candidates');
  assert.equal(homeDraw.top15Pool.length, 15, 'Top-15 pool must have 15 players');
  assert.ok(
    homeDraw.candidates.every((c) => c.cityRank >= 1 && c.cityRank <= 15),
    'All 3 candidates must belong strictly to Top 15 OVR in Madrid'
  );

  const chosenHomeCap = homeDraw.candidates[0].player;
  const awayDraw = drawStreetCaptainCandidates('madrid', null, {
    count: 3,
    excludeIds: [chosenHomeCap.id],
    seed: 'a9-draw-away',
  });
  assert.equal(awayDraw.candidates.length, 3);
  assert.ok(
    !awayDraw.candidates.some((c) => c.player.id === chosenHomeCap.id),
    'Away draw must never re-offer Home captain'
  );
  console.log('✓ 2. Top-15 Captain Draw returns 3 Top-15 candidates & supports disjoint Home -> Away sequence');

  // =========================================================================
  // 3. Strict 1-2-2-2 Positional Quota (Including GK Captain Case = 0 Extra GKs)
  // =========================================================================
  const gkAnchor = makeCareerUser({
    id: 'picked_gk_captain',
    name: 'Emiliano Dibu',
    ovr: 89,
    overallRating: 89,
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'balanced_gk',
  });
  assert.deepEqual(computeStreetRemainingBucketNeeds(gkAnchor), { GK: 0, DEF: 2, MID: 2, ATT: 2 });

  const kickOffWithGkCaptain = buildStreetMatchTeams('buenos_aires', null, null, {
    homeControl: 'player',
    awayControl: 'cpu',
    homeCaptain: gkAnchor,
    seed: 'a9-gk-cap',
  });
  assertLineCounts1222(kickOffWithGkCaptain.homeSlots, 'Home with GK captain');
  assertLineCounts1222(kickOffWithGkCaptain.awaySlots, 'CPU Away with Top-15 captain');
  assert.equal(kickOffWithGkCaptain.homeCaptainId, gkAnchor.id);
  assert.equal(kickOffWithGkCaptain.homeSlots[0].player.id, gkAnchor.id);
  assert.equal(kickOffWithGkCaptain.homeSlots[0].isCaptain, true);

  // Confirm Away CPU auto-picked a Top-15 captain in Buenos Aires pool
  const baTop15Ids = new Set(drawStreetCaptainCandidates('buenos_aires').top15Pool.map((c) => c.player.id));
  assert.ok(baTop15Ids.has(kickOffWithGkCaptain.awayCaptainId), 'CPU Away must auto-pick a Top-15 city captain');

  // Verify all 14 players are unique across Home + Away
  const all14Ids = new Set(kickOffWithGkCaptain.matchPlayers14.map((p) => p.id));
  assert.equal(all14Ids.size, 14, 'All 14 match players across Home + Away must be unique');

  // Also verify MID / ATT / DEF captains maintain exact 1-2-2-2
  const attCaptain = homeDraw.candidates[0].player;
  const kickOffHumanVsHuman = buildStreetMatchTeams('madrid', null, null, {
    homeControl: 'player',
    awayControl: 'player',
    homeCaptain: attCaptain,
    awayCaptain: awayDraw.candidates[0].player,
    seed: 'a9-hvh',
  });
  assertLineCounts1222(kickOffHumanVsHuman.homeSlots, 'Human Home');
  assertLineCounts1222(kickOffHumanVsHuman.awaySlots, 'Human Away');
  assert.equal(kickOffHumanVsHuman.homeCaptainId, attCaptain.id);
  assert.equal(kickOffHumanVsHuman.awayCaptainId, awayDraw.candidates[0].player.id);
  console.log('✓ 3. Strict 1-2-2-2 positional budgeting (0 extra GKs when anchor is GK) & CPU Top-15 auto-draft verified');

  // =========================================================================
  // 4. Unique Career: User Takes 1 Positional Spot & Captain = Highest-OVR on Squad
  // =========================================================================
  const lowOvrCareerUser = makeCareerUser({
    id: 'career_low_ovr_st',
    ovr: 61,
    overallRating: 61,
    subPosition: 'ST',
    position: 'ATT',
  });
  const careerLowMatch = buildStreetGameplayTeams('london', null, lowOvrCareerUser, {
    seed: 'a9-career-low',
  });
  assertLineCounts1222(careerLowMatch.homeSlots, 'Unique Career Home (Low OVR User)');
  const highestOvrHome = [...careerLowMatch.homeSlots].sort(
    (a, b) => getStreetPlayerOvr(b.player) - getStreetPlayerOvr(a.player)
  )[0];
  assert.notEqual(
    careerLowMatch.homeCaptainId,
    lowOvrCareerUser.id,
    'Low-OVR Unique Career user must NOT be forced as captain when a teammate has higher OVR'
  );
  assert.equal(
    careerLowMatch.homeCaptainId,
    highestOvrHome.player.id,
    'Unique Career captain must be the highest-OVR player on the 7-man squad'
  );
  assert.equal(careerLowMatch.homeTeam.roles?.captainId, careerLowMatch.homeCaptainId);

  const highOvrCareerUser = makeCareerUser({
    id: 'career_high_ovr_mid',
    ovr: 97,
    overallRating: 97,
    subPosition: 'CM',
    position: 'MID',
  });
  const careerHighMatch = buildStreetGameplayTeams('london', null, highOvrCareerUser, {
    seed: 'a9-career-high',
  });
  assertLineCounts1222(careerHighMatch.homeSlots, 'Unique Career Home (High OVR User)');
  assert.equal(
    careerHighMatch.homeCaptainId,
    highOvrCareerUser.id,
    'When Unique Career user is the highest OVR on the 7-man squad, user earns captaincy'
  );
  assert.equal(careerHighMatch.homeTeam.roles?.captainId, highOvrCareerUser.id);
  console.log('✓ 4. Unique Career positional discount & highest-OVR captaincy verified (low & high OVR)');

  // =========================================================================
  // 5. Light Home vs Dark Away Random Streetwear Clothes & Engine Propagation
  // =========================================================================
  const seenTopStyles = new Set<string>();
  const seenBottomStyles = new Set<string>();
  const seenHatStyles = new Set<string>();

  for (let i = 0; i < 6; i++) {
    const sample = buildStreetGameplayTeams('sao_paulo', null, null, { seed: `a9-outfit-${i}` });
    for (const rp of sample.homeTeam.players) {
      assert.ok(rp.streetOutfit, 'Every Home roster player carries streetOutfit');
      assert.equal(rp.streetOutfit.paletteGroup, 'light', 'Home wears Light streetwear');
      assert.ok(
        LIGHT_TOP_COLORS.has(rp.streetOutfit.topColor),
        `Home topColor ${rp.streetOutfit.topColor} must be white/bright`
      );
      seenTopStyles.add(rp.streetOutfit.topStyle);
      seenBottomStyles.add(rp.streetOutfit.bottomStyle);
      seenHatStyles.add(rp.streetOutfit.hatStyle);
    }
    for (const rp of sample.awayTeam.players) {
      assert.ok(rp.streetOutfit, 'Every Away roster player carries streetOutfit');
      assert.equal(rp.streetOutfit.paletteGroup, 'dark', 'Away wears Dark streetwear');
      assert.ok(
        DARK_TOP_COLORS.has(rp.streetOutfit.topColor),
        `Away topColor ${rp.streetOutfit.topColor} must be dark`
      );
      seenTopStyles.add(rp.streetOutfit.topStyle);
      seenBottomStyles.add(rp.streetOutfit.bottomStyle);
      seenHatStyles.add(rp.streetOutfit.hatStyle);
    }
  }

  assert.ok(seenTopStyles.size >= 3, `Expected varied streetwear tops, saw: ${[...seenTopStyles].join(', ')}`);
  assert.ok(seenBottomStyles.size >= 3, `Expected jeans/shorts/joggers variety, saw: ${[...seenBottomStyles].join(', ')}`);
  assert.ok(seenHatStyles.size >= 2, `Expected cap/beanie/none variety, saw: ${[...seenHatStyles].join(', ')}`);

  // Verify MatchEngine applyTeamToEngine + runtime team registry preserves streetOutfit & isCaptain
  const finalBundle = buildStreetGameplayTeams('paris', null, null, {
    homeControl: 'player',
    awayControl: 'cpu',
    seed: 'a9-engine-verify',
  });
  registerRuntimeMatchTeams([finalBundle.homeTeam, finalBundle.awayTeam]);
  assert.equal(getTeamById(finalBundle.homeTeam.id).id, finalBundle.homeTeam.id);
  assert.equal(getTeamById(finalBundle.awayTeam.id).id, finalBundle.awayTeam.id);

  const engine = new MatchEngine();
  applyTeamToEngine(engine, 'home', finalBundle.homeTeam);
  applyTeamToEngine(engine, 'away', finalBundle.awayTeam);
  const homeEnginePlayers = engine.players.filter((p) => p.team === 'home');
  const awayEnginePlayers = engine.players.filter((p) => p.team === 'away');
  assert.equal(homeEnginePlayers.length, 7);
  assert.equal(awayEnginePlayers.length, 7);
  assert.ok(homeEnginePlayers.every((p) => p.streetOutfit?.paletteGroup === 'light'));
  assert.ok(awayEnginePlayers.every((p) => p.streetOutfit?.paletteGroup === 'dark'));
  assert.equal(homeEnginePlayers.filter((p) => p.isCaptain).length, 1, 'Home has 1 captain armband flag on engine');
  assert.equal(awayEnginePlayers.filter((p) => p.isCaptain).length, 1, 'Away has 1 captain armband flag on engine');
  console.log('✓ 5. Light-vs-Dark randomized streetwear & engine/cache propagation verified');

  console.log('\nALL HOTFIX PHASE A9 CHECKS PASSED');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
