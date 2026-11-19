/**
 * Phase 8: Street Stadiums (1/City), Dynamic Per-Play 13-Player Pool & 7v7 Adapter
 * Automated Verification Suite
 *
 * Run with:
 *   ./node_modules/.bin/tsx src/gameplay/game/__tests__/phase8StreetAndAdapters.test.ts
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

import { STARTING_CITIES } from '../../../constants';
import { NATIONALITIES } from '../../../constants';
import type { PlayerCardData, PlayerConfig } from '../../../types';
import {
  GENERATED_STREET_STADIUMS,
  STREET_STADIUM_BY_CITY,
  resolveStreetStadiumForCity,
} from '../streetStadiumGenerator';
import { getRegisteredStadiumsByCategory, STADIUM_REGISTRY } from '../stadiumRegistry';
import { MatchEngine } from '../engine';
import { applyTeamToEngine, getTeamById } from '../teams';
import {
  buildStreetMatchTeams,
  collectStreetCityPlayerPool,
  resolveStreetCityId,
} from '../../../utils/streetTeamBuilder';
import {
  buildStreetGameplayTeams,
  buildU17NationalGameplayTeams,
  buildYouthAndIntlCupGameplayTeams,
  editorTeamToGameplayTeam,
} from '../../../utils/gameplayAdapter';
import { clearNationalTeamsCache } from '../../../utils/nationalTeamDatabaseManager';

function makeUserPlayer(overrides: Partial<PlayerConfig & PlayerCardData> = {}): PlayerConfig & PlayerCardData {
  const nat = NATIONALITIES.find((n) => n.code === 'ARG') || NATIONALITIES[0];
  return {
    id: 'user_phase8_star',
    name: 'Thiago Barrio',
    number: 10,
    shirtNumber: 10,
    age: 16,
    ovr: 71,
    overallRating: 71,
    potentialOvr: 89,
    position: 'ATT',
    subPosition: 'ST',
    club: 'Palermo Juniors',
    league: 'Liga Bonaerense de Juveniles',
    nationality: nat,
    heightCm: 174,
    weightKg: 68,
    preferredFoot: 'Right',
    weakFootStars: 4,
    playStyle: 'Poacher',
    stats: { pro: 72, def: 46, cre: 70, men: 69, goa: 73, phy: 72 },
    biometrics: {
      strength: 72,
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

async function runTests() {
  clearNationalTeamsCache();

  // =========================================================================
  // 1. 1 Bespoke Street Stadium per STARTING_CITIES Entry
  // =========================================================================
  const streetRegistry = getRegisteredStadiumsByCategory('street');
  assert.equal(
    streetRegistry.length,
    STARTING_CITIES.length,
    `Expected exactly ${STARTING_CITIES.length} registered street stadiums, got ${streetRegistry.length}`
  );

  const seenIds = new Set<string>();
  const seenSlots = new Set<number>();
  for (const city of STARTING_CITIES) {
    const stadium = resolveStreetStadiumForCity(city.id);
    assert.ok(stadium, `Missing street stadium for city ${city.id}`);
    assert.equal(stadium.category, 'street');
    assert.equal(STADIUM_REGISTRY[stadium.id]?.id, stadium.id);
    assert.equal(stadium.capacity, 0);
    assert.equal(stadium.disableEntryCinematic, true);
    assert.equal(stadium.isCasualYouthCrowd, true);
    assert.ok(stadium.streetConfig, `Missing streetConfig on ${stadium.id}`);
    assert.ok(stadium.pitchLengthMeters && stadium.pitchLengthMeters <= 52, 'Street pitch length clamped <= 52m');
    assert.ok(stadium.pitchWidthMeters && stadium.pitchWidthMeters <= 32, 'Street pitch width clamped <= 32m');
    assert.ok(!seenIds.has(stadium.id), `Duplicate street stadium id ${stadium.id}`);
    seenIds.add(stadium.id);
    assert.ok(stadium.slotNumber && !seenSlots.has(stadium.slotNumber), `Duplicate street slotNumber on ${stadium.id}`);
    seenSlots.add(stadium.slotNumber!);
  }

  assert.equal(STREET_STADIUM_BY_CITY.buenos_aires.name, 'Potrero de Villa');
  assert.equal(STREET_STADIUM_BY_CITY.buenos_aires.streetConfig?.surface, 'poor');
  assert.equal(STREET_STADIUM_BY_CITY.sao_paulo.name, 'Quadra da Várzea');
  assert.equal(resolveStreetStadiumForCity('São Paulo').id, 'street_sao_paulo');
  assert.equal(resolveStreetStadiumForCity('Lisbon').id, 'street_lisboa');
  assert.equal(resolveStreetStadiumForCity('Rome').id, 'street_roma');
  assert.equal(STREET_STADIUM_BY_CITY.riyadh.streetConfig?.archetype, 'desert_sand_lot');
  assert.equal(Object.keys(GENERATED_STREET_STADIUMS).length, 9);
  console.log('✓ 1. All 9 Starting Cities have unique registered Street stadiums with distinct visuals & surfaces');

  // =========================================================================
  // 2. City-Scoped Pool [City Youth + Country D1 + Country D2]
  // =========================================================================
  const baPool = collectStreetCityPlayerPool('buenos_aires');
  assert.ok(baPool.stats.youthCount > 0, 'Buenos Aires pool must include City Youth League players');
  assert.ok(baPool.stats.d1Count > 0, 'Buenos Aires pool must include Country D1 players');
  assert.ok(baPool.stats.d2Count > 0, 'Buenos Aires pool must include Country D2 players');

  const londonPool = collectStreetCityPlayerPool('london');
  assert.ok(londonPool.stats.youthCount > 0 && londonPool.stats.d1Count > 0 && londonPool.stats.d2Count > 0);
  const londonIds = new Set(londonPool.pool.map((e) => e.player.id));
  const baPoolOverlap = baPool.pool.filter((e) => londonIds.has(e.player.id));
  assert.equal(baPoolOverlap.length, 0, 'Switching city must switch the entire source player pool');

  // Verify every single Starting City yields a rich playable pool
  for (const city of STARTING_CITIES) {
    const cityPool = collectStreetCityPlayerPool(city.id);
    assert.ok(cityPool.stats.youthCount >= 100, `${city.id} should have rich youth pool`);
    assert.ok(cityPool.stats.d1Count >= 100, `${city.id} should have rich D1 pool`);
    assert.ok(cityPool.stats.totalPoolSize >= 200, `${city.id} total pool >= 200`);
  }
  console.log('✓ 2. City-scoped pools cover [City Youth + Country D1 + Country D2] across all 9 cities');

  // =========================================================================
  // 3. Fresh Non-Sticky Per-Play 13-Player Draw + Unique Career & Kickoff
  // =========================================================================
  const baRun1 = buildStreetMatchTeams('buenos_aires');
  const baRun2 = buildStreetMatchTeams('buenos_aires');
  assert.equal(baRun1.drawnPlayers13.length, 13, 'Kickoff draws 13 players');
  assert.ok(baRun1.bonusPlayer, 'Kickoff includes +1 city-captain/bonus player');
  assert.equal(baRun1.matchPlayers14.length, 14, 'Kickoff yields 14 match sheet players');

  const run1Ids = baRun1.drawnPlayers13.map((p) => p.id).sort().join(',');
  const run2Ids = baRun2.drawnPlayers13.map((p) => p.id).sort().join(',');
  assert.notEqual(run1Ids, run2Ids, 'Two consecutive Street pulls in the same city must yield different 13-player draws');

  // Check city-switching immediately updates stadium & pool
  const madridStreet = buildStreetGameplayTeams('Madrid');
  assert.equal(madridStreet.cityId, 'madrid');
  assert.equal(madridStreet.stadium.id, 'street_madrid');
  assert.equal(madridStreet.homeTeam.homeStadiumId, 'street_madrid');
  const madridPoolIds = new Set(collectStreetCityPlayerPool('madrid').pool.map((e) => e.player.id));
  assert.ok(
    madridStreet.drawnPlayers13.every((p) => madridPoolIds.has(p.id)),
    'Madrid Street draw must come strictly from the Madrid/Spain city pool'
  );

  // Unique Career mode with Outfield User: 1 User + 13 drawn = 14, Home 7 (with user), Away 7, 1 GK each
  const outfieldUser = makeUserPlayer({ id: 'career_user_st', subPosition: 'ST', position: 'ATT' });
  const careerOutfieldMatch = buildStreetGameplayTeams('São Paulo', null, outfieldUser);
  assert.equal(resolveStreetCityId('São Paulo'), 'sao_paulo');
  assert.equal(careerOutfieldMatch.drawnPlayers13.length, 13);
  assert.equal(careerOutfieldMatch.matchPlayers14.length, 14);
  assert.equal(careerOutfieldMatch.homeTeam.players.length, 7, 'Street Home team never padded to 11');
  assert.equal(careerOutfieldMatch.awayTeam.players.length, 7, 'Street Away team never padded to 11');
  assert.equal(careerOutfieldMatch.homeTeam.teamSize, 7);
  assert.equal(careerOutfieldMatch.awayTeam.teamSize, 7);
  assert.equal(careerOutfieldMatch.homeTeam.streetFormation, '1-2-2-2');
  assert.equal(careerOutfieldMatch.awayTeam.streetFormation, '1-2-2-2');
  assert.ok(
    careerOutfieldMatch.homeTeam.players.some((p) => p.id === 'career_user_st'),
    'Unique Career user must be placed into Home 7'
  );
  assert.ok(
    !careerOutfieldMatch.awayTeam.players.some((p) => p.id === 'career_user_st'),
    'Unique Career user must not appear on Away 7'
  );
  assert.equal(careerOutfieldMatch.homeTeam.players.filter((p) => p.role === 'GK').length, 1, 'Home must have 1 GK');
  assert.equal(careerOutfieldMatch.awayTeam.players.filter((p) => p.role === 'GK').length, 1, 'Away must have 1 GK');

  // Unique Career mode with GK User
  const gkUser = makeUserPlayer({ id: 'career_user_gk', subPosition: 'GK', position: 'GK', playStyle: 'balanced_gk' });
  const careerGkMatch = buildStreetGameplayTeams('paris', null, gkUser);
  const homeGk = careerGkMatch.homeTeam.players.find((p) => p.role === 'GK');
  assert.equal(homeGk?.id, 'career_user_gk', 'GK user must take Home GK slot');
  assert.equal(careerGkMatch.awayTeam.players.filter((p) => p.role === 'GK').length, 1, 'Away must still get 1 GK');

  // Verify strict 1-2-2-2 roles & contrasting Streetwear bibs
  const expectedRoles = ['GK', 'CB1', 'CB2', 'CM1', 'CM2', 'ST1', 'ST2'];
  const expectedLabels = ['GK', 'DEF1', 'DEF2', 'MID1', 'MID2', 'ATT1', 'ATT2'];
  assert.deepEqual(
    careerOutfieldMatch.homeTeam.players.map((p) => p.role),
    expectedRoles
  );
  assert.deepEqual(
    careerOutfieldMatch.homeTeam.players.map((p) => p.streetRoleLabel),
    expectedLabels
  );
  assert.notEqual(
    careerOutfieldMatch.homeTeam.kit.primaryColor,
    careerOutfieldMatch.awayTeam.kit.primaryColor,
    'Streetwear bibs must contrast between Home and Away'
  );

  // Verify direct editorTeamToGameplayTeam with teamSize === 7 never pads to 11
  const converted7 = editorTeamToGameplayTeam(careerOutfieldMatch.homeEditorTeam, undefined, undefined, {
    teamSize: 7,
    cityId: 'sao_paulo',
  });
  assert.equal(converted7.players.length, 7);
  assert.equal(converted7.streetFormation, '1-2-2-2');
  console.log('✓ 3. Fresh per-play 13-player pulls, 2-GK guarantee, bibs & 7v7 1-2-2-2 conversion verified');

  // =========================================================================
  // 4. MatchEngine / applyTeamToEngine 7v7 + 11v11 Round-Trip
  // =========================================================================
  const engine = new MatchEngine();
  assert.equal(engine.players.length, 22, 'Default MatchEngine initializes 11v11');

  applyTeamToEngine(engine, 'home', careerOutfieldMatch.homeTeam);
  applyTeamToEngine(engine, 'away', careerOutfieldMatch.awayTeam);
  assert.equal(engine.players.filter((p) => p.team === 'home').length, 7, 'Engine must trim Home to 7 players for 7v7');
  assert.equal(engine.players.filter((p) => p.team === 'away').length, 7, 'Engine must trim Away to 7 players for 7v7');
  assert.equal(engine.players.length, 14, 'Engine must hold exactly 14 players on pitch in 7v7');
  assert.ok(
    engine.players.some((p) => p.id === engine.userControlledPlayerId),
    'userControlledPlayerId must remain valid on 7v7 pitch'
  );

  // Restore back to 11v11 cleanly
  const proTeam = getTeamById('barcelona') || getTeamById(engine.homeTeam.id);
  if (proTeam) {
    applyTeamToEngine(engine, 'home', proTeam);
    applyTeamToEngine(engine, 'away', proTeam);
    assert.equal(engine.players.filter((p) => p.team === 'home').length, 11, 'Restoring 11v11 restores 11 Home slots');
    assert.equal(engine.players.filter((p) => p.team === 'away').length, 11, 'Restoring 11v11 restores 11 Away slots');
  }
  console.log('✓ 4. MatchEngine applyTeamToEngine native 7v7 & 11v11 restoration verified');

  // =========================================================================
  // 5. buildYouthAndIntlCupGameplayTeams & buildU17NationalGameplayTeams
  // =========================================================================
  const kickoffYouth = buildYouthAndIntlCupGameplayTeams({
    homeClub: 'Palermo Juniors',
    awayClub: 'Belgrano Plate',
  });
  assert.equal(kickoffYouth.age, 16, 'Kickoff Youth must default to age = 16');
  assert.equal(kickoffYouth.displayedHalfMinutes, 35);
  assert.equal(kickoffYouth.disableSurroundingsAndIntro, true);
  assert.equal(kickoffYouth.stadium.category, 'youth');
  assert.equal(kickoffYouth.homeTeam.players.length, 18, 'Youth matchday squad has 11 starters + 7 subs');

  const intlFinal = buildYouthAndIntlCupGameplayTeams({
    homeClub: 'Palermo Juniors',
    awayClub: 'Montmartre Olympique',
    competitionMode: 'intl_youth_cup_final',
    seasonYear: 2028,
    userPlayer: makeUserPlayer(),
  });
  assert.equal(intlFinal.displayedHalfMinutes, 45);
  assert.equal(intlFinal.disableSurroundingsAndIntro, false);
  assert.equal(intlFinal.stadium.category, 'pro');
  assert.ok(
    intlFinal.crowdAttendancePctOverride !== undefined &&
      intlFinal.crowdAttendancePctOverride >= 0.6 &&
      intlFinal.crowdAttendancePctOverride <= 0.8
  );
  assert.ok(
    intlFinal.homeTeam.players.some((p) => p.id === 'user_phase8_star'),
    'User injected into Int’l Youth Cup Final home squad'
  );

  const argUserU17 = makeUserPlayer({ id: 'u17_arg_star', ovr: 82, overallRating: 82, age: 16 });
  const u17Match = buildU17NationalGameplayTeams({
    homeNation: 'Argentina',
    awayNation: 'Brazil',
    stageName: 'Quarter-Final',
    isKnockout: true,
    userPlayer: argUserU17,
  });
  assert.equal(u17Match.competitionTag, 'u17_world_cup');
  assert.equal(u17Match.displayedHalfMinutes, 45);
  assert.equal(u17Match.disableSurroundingsAndIntro, false);
  assert.equal(u17Match.stadium.category, 'pro');
  assert.equal(u17Match.homeU17Squad.length, 23);
  assert.equal(u17Match.awayU17Squad.length, 23);
  assert.equal(u17Match.userIncludedTeam, 'home');
  assert.ok(u17Match.homeTeam.players.some((p) => p.id === 'u17_arg_star'));
  console.log('✓ 5. buildYouthAndIntlCupGameplayTeams (age 16 default / Finals) & buildU17NationalGameplayTeams verified');

  console.log('\nALL PHASE 8 CHECKS PASSED');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
