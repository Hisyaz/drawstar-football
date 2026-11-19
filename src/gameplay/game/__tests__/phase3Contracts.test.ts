/**
 * Phase 3 Core Type Contracts, Match Mode Specs & Stadium Constraint Validators Tests
 *
 * Run with:
 *   npx tsx src/gameplay/game/__tests__/phase3Contracts.test.ts
 */

import assert from 'node:assert/strict';
import type {
  FootballMatchMode,
  TurfQuality,
  PitchSurfaceStatus,
  StreetFormationName,
  MatchModeRules,
  PreMatchConfig,
} from '../../types';
import { resolveMatchModeRules } from '../../types';
import type {
  StadiumCategory,
  StreetArenaConfig,
  StadiumDefinition,
} from '../../types/stadium';
import { PITCH_CONFIG } from '../constants';
import { createDefaultStadium } from '../stadiumRegistry';
import {
  DEFAULT_STREET_ARENA_CONFIG,
  getAllowedDugoutsForCategory,
  getAllowedGradesForCategory,
  getAllowedShapesForCategory,
  getAllowedStandTypesForCategory,
  getAllowedTimesOfDay,
  getAllowedTunnelsForCategory,
  getAllowedTurfQualitiesForCategory,
  getAllowedWallSizesForCategory,
  getMaxTiersForCategory,
  sanitizeStadiumForCategory,
} from '../stadiumConstraints';
import { resolvePitchMetrics, syncPitchConfigWithMetrics } from '../pitchDimensions';

function testCoreContractsAndMatchModeRules() {
  const modePro: FootballMatchMode = 'pro';
  const modeYouth: FootballMatchMode = 'youth';
  const modeStreet: FootballMatchMode = 'street';
  assert.equal(modePro, 'pro');
  assert.equal(modeYouth, 'youth');
  assert.equal(modeStreet, 'street');

  const turfs: TurfQuality[] = ['pristine', 'normal', 'poor', 'synthetic', 'concrete', 'sand'];
  assert.equal(turfs.length, 6);

  const muddyStatus: PitchSurfaceStatus = 'muddy';
  const allStatuses: PitchSurfaceStatus[] = ['normal', 'wet', 'muddy', 'snowy'];
  assert.ok(allStatuses.includes(muddyStatus));

  const streetFormation: StreetFormationName = '1-2-2-2';
  assert.equal(streetFormation, '1-2-2-2');

  // Pro rules
  const proRules: MatchModeRules = resolveMatchModeRules('pro');
  assert.equal(proRules.displayedHalfMinutes, 45);
  assert.equal(proRules.maxPlayersPerTeam, 11);
  assert.equal(proRules.speedMultiplier, 1.0);
  assert.equal(proRules.sidelineWallsBounce, false);
  assert.equal(proRules.cornersAsThrowIns, false);
  assert.equal(proRules.foulsMode, 'ifab');
  assert.equal(proRules.offsidesEnabled, true);
  assert.equal(proRules.disableSurroundingsAndIntro, false);
  assert.equal(proRules.syntheticInjuryBonusPct, 0);

  // Youth league vs Int'l Youth Cup Final vs U17 World Cup
  const youthLeagueRules = resolveMatchModeRules('youth', {
    competitionTag: 'youth_league',
    turfQuality: 'synthetic',
  });
  assert.equal(youthLeagueRules.displayedHalfMinutes, 35);
  assert.equal(youthLeagueRules.disableSurroundingsAndIntro, true);
  assert.equal(youthLeagueRules.syntheticInjuryBonusPct, 10);

  const youthCupGroupRules = resolveMatchModeRules('youth', {
    competitionTag: 'intl_youth_cup',
  });
  assert.equal(youthCupGroupRules.displayedHalfMinutes, 35);
  assert.equal(youthCupGroupRules.disableSurroundingsAndIntro, true);

  const youthCupFinalRules = resolveMatchModeRules('youth', {
    competitionTag: 'intl_youth_cup_final',
  });
  assert.equal(youthCupFinalRules.displayedHalfMinutes, 45);
  assert.equal(youthCupFinalRules.disableSurroundingsAndIntro, false);

  const u17WorldCupRules = resolveMatchModeRules('youth', {
    competitionTag: 'u17_world_cup',
  });
  assert.equal(u17WorldCupRules.displayedHalfMinutes, 45);
  assert.equal(u17WorldCupRules.disableSurroundingsAndIntro, false);

  // Street rules
  const streetRules = resolveMatchModeRules('street', { turfQuality: 'concrete' });
  assert.equal(streetRules.displayedHalfMinutes, 30);
  assert.equal(streetRules.maxPlayersPerTeam, 7);
  assert.equal(streetRules.speedMultiplier, 1.10);
  assert.equal(streetRules.sidelineWallsBounce, true);
  assert.equal(streetRules.cornersAsThrowIns, true);
  assert.equal(streetRules.foulsMode, 'street_hit_only');
  assert.equal(streetRules.offsidesEnabled, false);
  assert.equal(streetRules.syntheticInjuryBonusPct, 0);

  // PreMatchConfig optional contract verification
  const cfg: Partial<PreMatchConfig> = {
    matchMode: 'street',
    displayedHalfMinutes: 30,
    isStreetMatch: true,
    streetCityId: 'rio_de_janeiro',
    scoreboardThemeId: 'street_neon',
    crowdAttendancePctOverride: 0.35,
    isCasualCrowd: true,
    finalBoardCity: 'London',
    finalBoardYear: 2028,
  };
  assert.equal(cfg.displayedHalfMinutes, 30);
}

function testYouthStadiumConstraintsAndSanitizer() {
  const youthCat: StadiumCategory = 'youth';
  assert.deepEqual(getAllowedShapesForCategory(youthCat), ['rectangular']);
  assert.deepEqual(getAllowedShapesForCategory('street'), ['rectangular']);
  assert.ok(getAllowedShapesForCategory('pro').includes('oval'));

  // Grade unlocks by country and youthSpecialUnlocked
  assert.deepEqual(getAllowedGradesForCategory('youth'), ['municipal', 'brutalist']);
  assert.deepEqual(getAllowedGradesForCategory('youth', { country: 'Germany' }), [
    'municipal',
    'brutalist',
  ]);
  assert.deepEqual(getAllowedGradesForCategory('youth', { country: 'Spain' }), [
    'municipal',
    'brutalist',
    'industrial',
  ]);
  assert.deepEqual(getAllowedGradesForCategory('youth', { country: 'England' }), [
    'municipal',
    'brutalist',
    'industrial',
    'victorian',
  ]);
  assert.deepEqual(
    getAllowedGradesForCategory('youth', { country: 'Brazil', youthSpecialUnlocked: true }),
    ['municipal', 'brutalist', 'industrial', 'victorian', 'modern']
  );
  assert.deepEqual(getAllowedGradesForCategory('street'), []);

  // Stand types & caps
  assert.deepEqual(getAllowedStandTypesForCategory('youth', 'west'), [
    'tiered',
    'wall',
    'none',
  ]);
  assert.deepEqual(getAllowedStandTypesForCategory('youth', 'corner_nw'), [
    'round',
    'square',
    'none',
  ]);
  assert.equal(getMaxTiersForCategory('youth', 'west', 'tiered'), 2);
  assert.equal(getMaxTiersForCategory('youth', 'corner_nw', 'round'), 1);
  assert.deepEqual(getAllowedWallSizesForCategory('youth'), ['small']);

  // Tunnels & dugouts
  assert.deepEqual(getAllowedTunnelsForCategory('youth'), [
    'inflatable_accordion',
    'subterranean_staircase',
  ]);
  assert.deepEqual(getAllowedDugoutsForCategory('youth'), [
    'folding_chairs',
    'utilitarian_concrete',
    'classic_timber',
  ]);

  // Turf: pristine disabled -> synthetic replaces it in Youth unless special unlocked
  assert.deepEqual(getAllowedTurfQualitiesForCategory('youth'), [
    'normal',
    'poor',
    'synthetic',
  ]);
  assert.deepEqual(
    getAllowedTurfQualitiesForCategory('youth', { youthSpecialUnlocked: true }),
    ['pristine', 'normal', 'poor', 'synthetic']
  );
  assert.deepEqual(getAllowedTurfQualitiesForCategory('street'), [
    'concrete',
    'sand',
    'synthetic',
    'poor',
  ]);

  // Sanitization checks on over-built stadium converted to Youth
  const base = createDefaultStadium('Overbuilt Youth Test');
  base.category = 'youth';
  base.country = 'Italy';
  base.shape = 'oval';
  base.hasTrack = true;
  base.turfQuality = 'pristine';
  base.architecturalGrade = 'modern';
  base.tunnel.type = 'modern_architectural';
  base.dugouts.type = 'recaro_racing';
  base.lighting.type = 'none';
  base.lighting.timeOfDay = 'night';
  base.timeOfDay = 'sunset';
  base.pitchLengthMeters = 110;
  base.pitchWidthMeters = 74;
  base.hasVipSeats = true;
  base.hasVipZone = true;
  base.hasTransmissionArea = true;
  base.stands.west = {
    ...base.stands.west,
    type: 'vip_building',
    tierCount: 4,
    tiers: [{ size: 'large' }, { size: 'large' }, { size: 'medium' }, { size: 'small' }],
    architecturalGrade: 'modern',
    hasRoof: true,
  };
  base.stands.north = {
    ...base.stands.north,
    type: 'wall',
    wallSize: 'large',
    architecturalGrade: 'victorian',
  };
  base.stands.corner_nw = {
    ...base.stands.corner_nw,
    type: 'tower',
    cornerType: 'tower',
  };
  base.stands.corner_ne = {
    ...base.stands.corner_ne,
    type: 'round',
    cornerType: 'round',
    tierCount: 3,
    tiers: [{ size: 'large' }, { size: 'medium' }, { size: 'small' }],
  };
  base.stands.corner_se = {
    ...base.stands.corner_se,
    type: 'giant',
    cornerType: 'giant',
    wallSize: 'large',
  };

  // Lighting 'none' blocks 'sunset' and 'night'
  assert.deepEqual(getAllowedTimesOfDay(base), ['dawn', 'noon']);

  const sanitized = sanitizeStadiumForCategory(base);
  assert.equal(sanitized.shape, 'rectangular');
  assert.equal(sanitized.hasTrack, false);
  assert.equal(sanitized.turfQuality, 'synthetic'); // 'pristine' replaced by 'synthetic'
  assert.equal(sanitized.architecturalGrade, 'brutalist');
  assert.equal(sanitized.tunnel.type, 'subterranean_staircase');
  assert.equal(sanitized.dugouts.type, 'classic_timber');
  assert.equal(sanitized.lighting.timeOfDay, 'noon');
  assert.equal(sanitized.timeOfDay, 'noon');
  assert.equal(sanitized.pitchLengthMeters, 94);
  assert.equal(sanitized.pitchWidthMeters, 60);
  assert.equal(sanitized.roof?.enabled, false);
  assert.equal(sanitized.hasVipSeats, false);
  assert.equal(sanitized.hasVipZone, false);
  assert.equal(sanitized.hasTransmissionArea, false);
  assert.equal(sanitized.stands.west.type, 'tiered');
  assert.equal(sanitized.stands.west.tierCount, 2);
  assert.equal(sanitized.stands.west.tiers?.length, 2);
  assert.equal(sanitized.stands.west.hasRoof, false);
  assert.equal(sanitized.stands.north.type, 'wall');
  assert.equal(sanitized.stands.north.wallSize, 'small');
  assert.equal(sanitized.stands.north.architecturalGrade, 'brutalist');
  assert.equal(sanitized.stands.corner_nw.cornerType, 'none');
  assert.equal(sanitized.stands.corner_ne.cornerType, 'round');
  assert.equal(sanitized.stands.corner_ne.tierCount, 1);
  assert.equal(sanitized.stands.corner_se.cornerType, 'square');
  assert.equal(sanitized.stands.corner_se.wallSize, 'small');
  assert.equal(sanitized.isCasualYouthCrowd, true);
  assert.equal(sanitized.disableEntryCinematic, true);

  // Unlocked special youth cup host unlocks pristine turf, roof & modern grade
  const unlockedBase: StadiumDefinition = {
    ...base,
    youthSpecialUnlocked: true,
    lighting: { ...base.lighting, type: 'corner_pylons', timeOfDay: 'night' },
    timeOfDay: 'night',
  };
  const unlocked = sanitizeStadiumForCategory(unlockedBase);
  assert.equal(unlocked.turfQuality, 'pristine');
  assert.equal(unlocked.architecturalGrade, 'modern');
  assert.equal(unlocked.lighting.timeOfDay, 'night');
  assert.equal(unlocked.disableEntryCinematic, false);
}

function testStreetStadiumConstraintsAndSanitizer() {
  assert.deepEqual(getAllowedTunnelsForCategory('street'), []);
  assert.deepEqual(getAllowedDugoutsForCategory('street'), []);
  assert.deepEqual(getAllowedStandTypesForCategory('street', 'east'), ['none']);
  assert.deepEqual(getAllowedStandTypesForCategory('street', 'corner_sw'), ['none']);

  const streetCfg: StreetArenaConfig = {
    ...DEFAULT_STREET_ARENA_CONFIG,
    archetype: 'favela_quadra',
    surface: 'sand',
    streetLighting: 'daylight_only',
    fenceCrowdMode: 'block_party_fence',
  };

  const streetRaw = createDefaultStadium('Copacabana Sand Court');
  streetRaw.category = 'street';
  streetRaw.shape = 'round';
  streetRaw.hasTrack = true;
  streetRaw.streetConfig = streetCfg;
  streetRaw.lighting.timeOfDay = 'night';
  streetRaw.timeOfDay = 'sunset';
  streetRaw.pitchLengthMeters = 105;
  streetRaw.pitchWidthMeters = 68;

  assert.deepEqual(getAllowedTimesOfDay(streetRaw), ['dawn', 'noon']);

  const sanitizedStreet = sanitizeStadiumForCategory(streetRaw);
  assert.equal(sanitizedStreet.shape, 'rectangular');
  assert.equal(sanitizedStreet.hasTrack, false);
  assert.equal(sanitizedStreet.capacity, 0);
  assert.equal(sanitizedStreet.roof?.enabled, false);
  assert.equal(sanitizedStreet.roofCutaway, 'hidden');
  assert.equal(sanitizedStreet.turfQuality, 'sand');
  assert.equal(sanitizedStreet.streetSurface, 'sand');
  assert.equal(sanitizedStreet.lighting.type, 'none');
  assert.equal(sanitizedStreet.lighting.timeOfDay, 'noon');
  assert.equal(sanitizedStreet.timeOfDay, 'noon');
  assert.equal(sanitizedStreet.pitchLengthMeters, 52);
  assert.equal(sanitizedStreet.pitchWidthMeters, 32);
  assert.equal(sanitizedStreet.stands.west.type, 'none');
  assert.equal(sanitizedStreet.stands.corner_nw.cornerType, 'none');
  assert.equal(sanitizedStreet.disableEntryCinematic, true);
}

function testPitchDimensionsAcrossModes() {
  // Pro mode (and default omitted mode) remains unchanged
  const proDefault = resolvePitchMetrics();
  const proExplicit = resolvePitchMetrics({ preset: 'standard' }, 'pro');
  assert.equal(proDefault.matchMode, 'pro');
  assert.equal(proDefault.lengthMeters, 105);
  assert.equal(proDefault.widthMeters, 68);
  assert.equal(proDefault.goalWidthPx, 220);
  assert.equal(proDefault.crossbarHeightPx, 65);
  assert.equal(proDefault.goalDepthPx, 60);
  assert.deepEqual(proDefault, proExplicit);

  // Youth bounds & goals
  const youthDefault = resolvePitchMetrics(undefined, 'youth');
  assert.equal(youthDefault.matchMode, 'youth');
  assert.equal(youthDefault.lengthMeters, 90);
  assert.equal(youthDefault.widthMeters, 58);
  assert.equal(youthDefault.goalWidthPx, 192);
  assert.equal(youthDefault.crossbarHeightPx, 56);
  assert.equal(youthDefault.goalDepthPx, 52);
  assert.ok(youthDefault.penaltyBoxWidth < proDefault.penaltyBoxWidth);
  assert.ok(youthDefault.penaltyBoxHeight < proDefault.penaltyBoxHeight);

  const youthClamped = resolvePitchMetrics(
    { preset: 'custom', lengthMeters: 110, widthMeters: 74 },
    'youth'
  );
  assert.equal(youthClamped.lengthMeters, 94);
  assert.equal(youthClamped.widthMeters, 60);

  // Street bounds & goals
  const streetDefault = resolvePitchMetrics(undefined, 'street');
  assert.equal(streetDefault.matchMode, 'street');
  assert.equal(streetDefault.lengthMeters, 46);
  assert.equal(streetDefault.widthMeters, 28);
  assert.equal(streetDefault.goalWidthPx, 148);
  assert.equal(streetDefault.crossbarHeightPx, 46);
  assert.equal(streetDefault.goalDepthPx, 40);
  assert.ok(streetDefault.penaltyBoxWidth < youthDefault.penaltyBoxWidth);
  assert.ok(streetDefault.penaltySpotDist < streetDefault.penaltyBoxHeight);

  const streetClampedLow = resolvePitchMetrics(
    { preset: 'custom', lengthMeters: 20, widthMeters: 15 },
    'street'
  );
  assert.equal(streetClampedLow.lengthMeters, 42);
  assert.equal(streetClampedLow.widthMeters, 24);

  // syncPitchConfigWithMetrics updates PITCH_CONFIG and can restore Pro cleanly
  syncPitchConfigWithMetrics(undefined, 'street');
  assert.equal(PITCH_CONFIG.GOAL_WIDTH, 148);
  assert.equal(PITCH_CONFIG.GOAL_DEPTH, 40);
  assert.equal(PITCH_CONFIG.GOAL_CROSSBAR_HEIGHT, 46);

  syncPitchConfigWithMetrics({ preset: 'standard' }, 'pro');
  assert.equal(PITCH_CONFIG.GOAL_WIDTH, 220);
  assert.equal(PITCH_CONFIG.GOAL_DEPTH, 60);
  assert.equal(PITCH_CONFIG.GOAL_CROSSBAR_HEIGHT, 65);
}

testCoreContractsAndMatchModeRules();
testYouthStadiumConstraintsAndSanitizer();
testStreetStadiumConstraintsAndSanitizer();
testPitchDimensionsAcrossModes();

console.log('✅ Phase 3 contracts, stadium constraints & pitch dimension tests passed!');
