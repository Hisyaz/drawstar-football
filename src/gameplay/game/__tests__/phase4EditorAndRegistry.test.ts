/**
 * Phase 4 Stadium Registry Partitioning, Default Templates & Editor Sanitization Tests
 *
 * Run with:
 *   ./node_modules/.bin/tsx src/gameplay/game/__tests__/phase4EditorAndRegistry.test.ts
 */

import assert from 'node:assert/strict';

// Minimal localStorage polyfill for headless Node test execution
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

import {
  createDefaultStadium,
  deleteCustomStadium,
  getAllRegisteredStadiums,
  getRegisteredStadiumsByCategory,
  getStadiumById,
  saveCustomStadium,
} from '../stadiumRegistry';
import {
  getAllowedDugoutsForCategory,
  getAllowedGradesForCategory,
  getAllowedShapesForCategory,
  getAllowedTimesOfDay,
  getAllowedTunnelsForCategory,
  getAllowedTurfQualitiesForCategory,
  getMaxTiersForCategory,
} from '../stadiumConstraints';

function testRegistryDefaultCategoriesAndPartitioning() {
  const allInitial = getAllRegisteredStadiums();
  assert.ok(allInitial.length > 0, 'Registry should contain canonical, country, curated, youth & street venues');
  for (const s of allInitial) {
    assert.ok(
      s.category === 'pro' || s.category === 'youth' || s.category === 'street',
      `Expected registry stadium ${s.id} to be 'pro', 'youth', or 'street', got ${s.category}`
    );
  }

  const proVenues = getRegisteredStadiumsByCategory('pro');
  const youthVenuesInitial = getRegisteredStadiumsByCategory('youth');
  const streetVenuesInitial = getRegisteredStadiumsByCategory('street');

  assert.equal(proVenues.length + youthVenuesInitial.length + streetVenuesInitial.length, allInitial.length);
  assert.ok(proVenues.length > 0, 'Registry should contain Pro venues');
  assert.ok(youthVenuesInitial.length >= 18, 'Registry should contain Phase 6 Youth venues');
  assert.ok(streetVenuesInitial.length >= 9, 'Registry should contain Phase 8 Street venues (1 per Starting City)');
}

function testCreateDefaultStadiumModes() {
  // Backwards-compatible Pro default call
  const proCustom = createDefaultStadium('Legacy Pro Arena');
  assert.equal(proCustom.category, 'pro');
  assert.equal(proCustom.name, 'Legacy Pro Arena');
  assert.equal(proCustom.shape, 'rectangular');

  // Youth template
  const youthDefault = createDefaultStadium(undefined, 'youth');
  assert.equal(youthDefault.category, 'youth');
  assert.equal(youthDefault.shape, 'rectangular');
  assert.equal(youthDefault.hasTrack, false);
  assert.equal(youthDefault.roof?.enabled, false);
  assert.equal(youthDefault.isCasualYouthCrowd, true);
  assert.equal(youthDefault.disableEntryCinematic, true);
  assert.ok((youthDefault.pitchLengthMeters ?? 90) >= 84 && (youthDefault.pitchLengthMeters ?? 90) <= 94);
  assert.ok((youthDefault.pitchWidthMeters ?? 58) >= 52 && (youthDefault.pitchWidthMeters ?? 58) <= 60);
  assert.equal(getMaxTiersForCategory('youth', 'west', 'tiered'), 2);
  assert.equal(getMaxTiersForCategory('youth', 'corner_nw', 'round'), 1);
  assert.deepEqual(getAllowedShapesForCategory('youth'), ['rectangular']);
  assert.ok(getAllowedDugoutsForCategory('youth').includes(youthDefault.dugouts.type));
  assert.ok(getAllowedTunnelsForCategory('youth').includes(youthDefault.tunnel.type));
  assert.ok(getAllowedGradesForCategory('youth').includes(youthDefault.architecturalGrade || 'brutalist'));
  assert.deepEqual(getAllowedTurfQualitiesForCategory('youth'), ['normal', 'poor', 'synthetic']);

  // Street template
  const streetDefault = createDefaultStadium('El Potrero Cage', 'street');
  assert.equal(streetDefault.category, 'street');
  assert.equal(streetDefault.name, 'El Potrero Cage');
  assert.equal(streetDefault.shape, 'rectangular');
  assert.equal(streetDefault.capacity, 0);
  assert.equal(streetDefault.roof?.enabled, false);
  assert.equal(streetDefault.turfQuality, 'concrete');
  assert.equal(streetDefault.streetSurface, 'concrete');
  assert.ok(streetDefault.streetConfig);
  assert.equal(streetDefault.stands.west.type, 'none');
  assert.equal(streetDefault.stands.corner_ne.cornerType, 'none');
  assert.ok((streetDefault.pitchLengthMeters ?? 48) >= 42 && (streetDefault.pitchLengthMeters ?? 48) <= 52);
  assert.ok((streetDefault.pitchWidthMeters ?? 28) >= 24 && (streetDefault.pitchWidthMeters ?? 28) <= 32);
}

function testSaveCustomStadiumSanitizesAndIsolatesCategories() {
  const dirtyYouth = createDefaultStadium('Cantera Sanitized', 'youth');
  dirtyYouth.id = 'test_phase4_youth_1';
  dirtyYouth.shape = 'oval'; // disallowed
  dirtyYouth.turfQuality = 'pristine'; // disallowed unless unlocked
  dirtyYouth.lighting.type = 'none';
  dirtyYouth.lighting.timeOfDay = 'night'; // disallowed when lighting === 'none'
  dirtyYouth.stands.west = {
    ...dirtyYouth.stands.west,
    type: 'vip_building',
    tierCount: 4,
  };

  assert.deepEqual(getAllowedTimesOfDay(dirtyYouth), ['dawn', 'noon']);
  saveCustomStadium(dirtyYouth);

  const storedYouth = getStadiumById('test_phase4_youth_1');
  assert.ok(storedYouth, 'Saved Youth venue should be resolvable via getStadiumById');
  assert.equal(storedYouth!.category, 'youth');
  assert.equal(storedYouth!.shape, 'rectangular');
  assert.equal(storedYouth!.turfQuality, 'synthetic');
  assert.equal(storedYouth!.lighting.timeOfDay, 'noon');
  assert.equal(storedYouth!.stands.west.type, 'tiered');
  assert.equal(storedYouth!.stands.west.tierCount, 2);

  const dirtyStreet = createDefaultStadium('La Boca Quadra', 'street');
  dirtyStreet.id = 'test_phase4_street_1';
  dirtyStreet.streetCityId = 'buenos_aires';
  dirtyStreet.streetConfig = {
    ...dirtyStreet.streetConfig!,
    archetype: 'potrero_dirt',
    surface: 'sand',
    streetLighting: 'daylight_only',
  };
  dirtyStreet.lighting.timeOfDay = 'sunset';

  saveCustomStadium(dirtyStreet);
  const storedStreet = getStadiumById('test_phase4_street_1');
  assert.ok(storedStreet, 'Saved Street venue should be resolvable via getStadiumById');
  assert.equal(storedStreet!.category, 'street');
  assert.equal(storedStreet!.turfQuality, 'sand');
  assert.equal(storedStreet!.lighting.type, 'none');
  assert.equal(storedStreet!.lighting.timeOfDay, 'noon');
  assert.equal(storedStreet!.streetCityId, 'buenos_aires');

  const youthList = getRegisteredStadiumsByCategory('youth');
  const streetList = getRegisteredStadiumsByCategory('street');
  const proList = getRegisteredStadiumsByCategory('pro');

  assert.ok(youthList.some((s) => s.id === 'test_phase4_youth_1'));
  assert.ok(!youthList.some((s) => s.id === 'test_phase4_street_1'));
  assert.ok(streetList.some((s) => s.id === 'test_phase4_street_1'));
  assert.ok(!streetList.some((s) => s.id === 'test_phase4_youth_1'));
  assert.ok(!proList.some((s) => s.id === 'test_phase4_youth_1' || s.id === 'test_phase4_street_1'));

  deleteCustomStadium('test_phase4_youth_1');
  deleteCustomStadium('test_phase4_street_1');
}

testRegistryDefaultCategoriesAndPartitioning();
testCreateDefaultStadiumModes();
testSaveCustomStadiumSanitizesAndIsolatesCategories();

console.log('✅ Phase 4 registry partitioning, default category templates & sanitizer tests passed!');
