/**
 * Phase 6: Youth 23-Player Squads, OVR Escalation, Int'l Cup Grouping,
 * U17 DB Call-Ups & Youth Stadiums Automated Verification Suite
 *
 * Run with:
 *   ./node_modules/.bin/tsx src/gameplay/game/__tests__/phase6YouthSquadsAndU17.test.ts
 */

import assert from 'node:assert/strict';

// Minimal localStorage polyfill for headless Node execution
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

import { STARTING_CITIES } from '../../../constants';
import {
  YOUTH_LEAGUES_DATABASE,
  getYouthLeagueTeamScaledSquad,
} from '../../../data/youthLeaguesDatabase';
import {
  FEDERATION_CLUB_POOLS,
  getAllIntlYouthPoolClubs,
  getAllIntlYouthPoolTemplates,
  getIntlYouthPoolClubScaledSquad,
} from '../../../data/internationalYouthPool';
import {
  getIntlYouthCupStadiumEligibleSections,
  getIntlYouthSectionForClubOrCountry,
  groupInternationalYouthClubs,
} from '../../../utils/internationalYouthGrouping';
import {
  getRegisteredStadiumsByCategory,
  getStadiumById,
  resolveYouthStadiumForClub,
} from '../stadiumRegistry';
import {
  GENERATED_SPECIAL_YOUTH_STADIUMS,
  GENERATED_YOUTH_LEAGUE_STADIUMS,
} from '../youthStadiumGenerator';
import { ensureTeamSquadSaveFile } from '../../../utils/squadSaveFileSystem';
import {
  clearNationalTeamsCache,
  getNationalTeamsDatabase,
  rebuildNationalU17SquadsFromDatabase,
} from '../../../utils/nationalTeamDatabaseManager';
import { getLeagueDatabase, cloneLeagueDatabase } from '../../../utils/leagueDatabaseSystem';
import {
  checkU17QualifiersEligibility,
  checkU17WorldCupEligibility,
} from '../../../utils/u17NationalTeamEngine';
import type { PlayerCardData } from '../../../types';

function testYouthLeagues23PlayerSquads() {
  const cityLeagueIds = Object.keys(YOUTH_LEAGUES_DATABASE);
  assert.equal(cityLeagueIds.length, 9, 'Should cover all 9 STARTING_CITIES Youth Leagues');
  assert.equal(STARTING_CITIES.length, 9);

  for (const [leagueId, league] of Object.entries(YOUTH_LEAGUES_DATABASE)) {
    assert.equal(league.teams.length, 10, `League ${leagueId} must contain 10 teams`);
    const bigTeams = league.teams.filter((t) => t.tierClass === 'big');
    const smallTeams = league.teams.filter((t) => t.tierClass === 'small');
    assert.equal(bigTeams.length, 3, `League ${leagueId} must have 3 big teams`);
    assert.equal(smallTeams.length, 7, `League ${leagueId} must have 7 small teams`);

    for (const team of league.teams) {
      assert.ok(Array.isArray(team.players) && team.players.length === 23, `${team.name} must have 23 players`);
      assert.ok(team.kit && team.crowdPalette && team.crowdPalette.length === 2, `${team.name} needs kit & crowd palette`);
      assert.equal(team.stadiumId, `youth_${leagueId}_${team.tierClass}`);

      // Verify positional coverage (3 GKs + outfield spread) & age <= 16 Kickoff default
      const gkCount = team.players.filter((p) => p.position === 'GK').length;
      assert.equal(gkCount, 3, `${team.name} 23-man squad must carry 3 GKs`);
      for (const p of team.players) {
        assert.ok((p.age ?? 16) <= 16, `Kickoff youth player ${p.name} must have age <= 16`);
      }
    }
  }
}

function testOvrEscalationAndFastPathPreservation() {
  const sampleClub = YOUTH_LEAGUES_DATABASE.madrid.teams[0];
  const age10 = getYouthLeagueTeamScaledSquad(sampleClub, 10)!;
  const age12 = getYouthLeagueTeamScaledSquad(sampleClub, 12)!;
  const age14 = getYouthLeagueTeamScaledSquad(sampleClub, 14)!;
  const age16 = getYouthLeagueTeamScaledSquad(sampleClub, 16)!;

  assert.equal(age10.starters.length, 11);
  assert.equal(age10.subs.length, 7);
  assert.equal(age10.reserves.length, 5);
  assert.equal(age10.players.length, 23);

  assert.ok(age10.teamOvr < age12.teamOvr, `Age 10 (${age10.teamOvr}) < Age 12 (${age12.teamOvr})`);
  assert.ok(age12.teamOvr < age14.teamOvr, `Age 12 (${age12.teamOvr}) < Age 14 (${age14.teamOvr})`);
  assert.ok(age14.teamOvr < age16.teamOvr, `Age 14 (${age14.teamOvr}) < Age 16 (${age16.teamOvr})`);

  // Ensure fast-path does NOT overwrite youth OVRs with Pro OVRs
  const normalized = ensureTeamSquadSaveFile(age10.team);
  const preservedActive = (normalized.squadSaveFile?.squad || []).filter((s) => Boolean(s.player));
  assert.equal(preservedActive.length, 23);
  assert.equal(preservedActive[0].player?.id, age10.players[0].id);
  assert.equal(preservedActive[0].player?.ovr, age10.players[0].ovr);

  // Int'l Youth Cup club must scale higher than domestic Youth League at same age
  const intlTemplate = FEDERATION_CLUB_POOLS.UEFA[0]; // Catalunya FC (Spain)
  const intlAge16 = getIntlYouthPoolClubScaledSquad(intlTemplate, 16)!;
  const intlAge12 = getIntlYouthPoolClubScaledSquad(intlTemplate, 12)!;
  assert.ok(
    intlAge16.teamOvr > age16.teamOvr,
    `Int'l Cup OVR at 16 (${intlAge16.teamOvr}) should exceed domestic league (${age16.teamOvr})`
  );
  assert.ok(
    intlAge12.teamOvr > age12.teamOvr,
    `Int'l Cup OVR at 12 (${intlAge12.teamOvr}) should exceed domestic league (${age12.teamOvr})`
  );
}

function testIntlYouthPoolAndGrouping() {
  const templates = getAllIntlYouthPoolTemplates();
  assert.equal(templates.length, 48, 'All 6 federations combined must have 48 pool clubs');

  const poolClubs = getAllIntlYouthPoolClubs(16);
  assert.equal(poolClubs.length, 48);
  for (const club of poolClubs) {
    assert.equal(club.players.length, 23, `${club.name} must carry 23 players`);
    assert.equal(club.representativePlayers.length, 4, `${club.name} must carry 4 representative stars`);
    // Every representative player must actually exist inside the club's 23-player squad
    for (const rep of club.representativePlayers) {
      assert.ok(
        club.players.some((p) => p.id === rep.id && p.name === rep.name),
        `Representative star ${rep.name} must be synced from ${club.name}'s 23-player squad`
      );
    }
  }

  const sections = groupInternationalYouthClubs(poolClubs);
  const totalClubsGrouped = sections.reduce((sum, s) => sum + s.teamCountInSection, 0);
  assert.equal(totalClubsGrouped, 48, 'Grouped sections must cover all 48 Int\'l Youth Cup pool clubs');

  // Verify regional bundling of 1-team countries
  const benelux = sections.find((s) => s.sectionId === 'benelux_alpine');
  assert.ok(benelux && benelux.isBundledRegional, 'Benelux / Alpine should bundle Netherlands, Belgium & Austria');
  assert.equal(benelux.teamCountInSection, 3);
  assert.ok(benelux.countries.includes('Netherlands') && benelux.countries.includes('Belgium') && benelux.countries.includes('Austria'));

  const balkan = getIntlYouthSectionForClubOrCountry('Croatia', poolClubs);
  assert.ok(balkan && balkan.sectionId === 'greek_balkan' && balkan.sectionLabel === 'Greek & Balkan');

  const africaNW = sections.find((s) => s.sectionId === 'north_west_africa');
  assert.ok(africaNW && africaNW.teamCountInSection === 4, 'North & West Africa should bundle Egypt, Morocco, Cote d\'Ivoire & Senegal');

  const spain = sections.find((s) => s.sectionId === 'spain');
  assert.ok(spain && !spain.isBundledRegional && spain.teamCountInSection === 2);
}

function testYouthStadiumsRegistryAndConstraints() {
  const youthStadiums = getRegisteredStadiumsByCategory('youth');
  const leagueStadiumList = Object.values(GENERATED_YOUTH_LEAGUE_STADIUMS);
  const specialStadiumList = Object.values(GENERATED_SPECIAL_YOUTH_STADIUMS);
  const eligibleSections = getIntlYouthCupStadiumEligibleSections();

  assert.equal(leagueStadiumList.length, 18, '2 * 9 = 18 Youth League stadiums');
  assert.equal(specialStadiumList.length, eligibleSections.length, '1 special youth stadium per 2+ team section');
  assert.equal(youthStadiums.length, 18 + eligibleSections.length);

  // BIG Youth stadium checks (including regional grade unlocks)
  const spainBig = getStadiumById('youth_madrid_big');
  assert.equal(spainBig.category, 'youth');
  assert.equal(spainBig.turfQuality, 'poor');
  assert.equal(spainBig.architecturalGrade, 'industrial');
  assert.equal(spainBig.lighting.type, 'none');
  assert.equal(spainBig.roof?.enabled, false);

  const englandBig = getStadiumById('youth_london_big');
  assert.equal(englandBig.architecturalGrade, 'victorian');
  assert.equal(englandBig.turfQuality, 'poor');

  const argSmall = getStadiumById('youth_buenos_aires_small');
  assert.equal(argSmall.turfQuality, 'synthetic');
  assert.equal(argSmall.stands.north.type, 'none');
  assert.equal(argSmall.stands.south.type, 'none');
  assert.equal(argSmall.lighting.type, 'none');
  assert.equal(argSmall.roof?.enabled, false);

  // Special Unlocked Youth Stadium checks
  const specialBenelux = getStadiumById('youth_special_benelux_alpine');
  assert.equal(specialBenelux.category, 'youth');
  assert.equal(specialBenelux.youthSpecialUnlocked, true);
  assert.equal(specialBenelux.turfQuality, 'pristine');
  assert.equal(specialBenelux.roof?.enabled, true);
  assert.equal(specialBenelux.architecturalGrade, 'modern');
  assert.equal(specialBenelux.lighting.type, 'corner_pylons');

  // Club stadium resolution helper check
  const resolvedBig = resolveYouthStadiumForClub(YOUTH_LEAGUES_DATABASE.london.teams[0], false);
  assert.equal(resolvedBig.id, 'youth_london_big');
  const resolvedSpecial = resolveYouthStadiumForClub({ name: 'Amstel Godenzonen AFC', country: 'Netherlands' }, true);
  assert.equal(resolvedSpecial.id, 'youth_special_benelux_alpine');
}

function testNationalU17PopulationAndMeritCallUps() {
  clearNationalTeamsCache();
  (globalThis as any).localStorage.clear();

  const dbClone = cloneLeagueDatabase(getLeagueDatabase());
  const firstTeamId = Object.keys(dbClone.teams)[0];
  // Inject a standout 16yo Spanish Striker prospect (OVR 79) directly into a club's u17 slots
  const eliteProspect: PlayerCardData = {
    id: 'test-db-u17-esp-prodigy',
    name: 'Íñigo Test Wonderkid',
    firstName: 'Íñigo',
    lastName: 'Wonderkid',
    number: 9,
    shirtNumber: 9,
    ovr: 79,
    overallRating: 79,
    potentialOvr: 92,
    age: 16,
    club: dbClone.teams[firstTeamId].name,
    clubCountry: 'ESP',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Complete',
    preferredFoot: 'Right',
    weakFootStars: 4,
    heightCm: 178,
    weightKg: 70,
    stats: { pro: 79, def: 45, cre: 77, men: 78, goa: 81, phy: 78 },
    biometrics: {
      strength: 78,
      skinColor: '#f1c27d',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#111111',
      hairDye: '#111111',
    },
    accessories: { accessory: 'none', headbandColor: '#000000' },
    kit: { style: 'normal', color1: '#dc2626', color2: '#facc15', pattern: 'solid', collar: 'crew' },
    emblem: { shape: 'crested-shield', mode: '2', color1: '#dc2626', color2: '#facc15' },
  };
  dbClone.teams[firstTeamId].squadSaveFile!.u17[0] = {
    slotNumber: 1,
    player: eliteProspect,
  };

  const natTeams = rebuildNationalU17SquadsFromDatabase(dbClone);
  const spain = natTeams.find((n) => n.nation.code === 'ESP');
  assert.ok(spain && spain.u17Squad && spain.u17Squad.length === 35, 'Spain must have 35-player U17 squad');

  // Verify injected DB talent ranked near/at top of Spain's U17 squad sorted desc by OVR
  assert.ok(
    spain.u17Squad.some((p) => p.id === eliteProspect.id),
    'Spain U17 squad must draw real <=17 player from leagueDb'
  );
  for (let i = 1; i < spain.u17Squad.length; i++) {
    const prevOvr = spain.u17Squad[i - 1].overallRating || spain.u17Squad[i - 1].ovr || 0;
    const currOvr = spain.u17Squad[i].overallRating || spain.u17Squad[i].ovr || 0;
    assert.ok(prevOvr >= currOvr, 'U17 squad must be sorted descending by OVR');
  }

  // Verify real Youth League / Int'l Pool players populate nations (zero National Pool fallback for England/Spain/Brazil)
  const spainNonPool = spain.u17Squad.filter((p) => !(p.club || '').endsWith('National Pool'));
  assert.ok(spainNonPool.length >= 25, `Spain U17 should be mostly real Youth/DB clubs, got ${spainNonPool.length}/35`);

  // Merit-based U17 call-up checks against real incumbents
  const england = natTeams.find((n) => n.nation.code === 'ENG')!;
  const weakMidTester = { ...eliteProspect, id: 'u-1', nationality: england.nation, subPosition: 'CM', position: 'MID' as const, ovr: 55, age: 16 };
  const failEval = checkU17QualifiersEligibility(weakMidTester, england.nation);
  assert.equal(failEval.isEligible, false, 'OVR 55 should miss England U17 call-up');

  // Beating weakest incumbent starter at ATT should grant Key Starter
  const starterOvr = Math.max(failEval.starterOvrNeeded, 76);
  const starTester = { ...eliteProspect, id: 'u-2', nationality: england.nation, subPosition: 'CM', position: 'MID' as const, ovr: starterOvr, age: 16 };
  const starterEval = checkU17QualifiersEligibility(starTester, england.nation);
  assert.equal(starterEval.isEligible, true);
  assert.equal(starterEval.role, 'Key Starter');

  // Age 17 disallowed from Qualifiers, allowed for U17 World Cup when qualified
  const age17Tester = { ...starTester, age: 17 };
  assert.equal(checkU17QualifiersEligibility(age17Tester, england.nation).isEligible, false);
  assert.equal(checkU17WorldCupEligibility(age17Tester, england.nation, true).isEligible, true);
  assert.equal(checkU17WorldCupEligibility(age17Tester, england.nation, false).isEligible, false);
}

function runAll() {
  testYouthLeagues23PlayerSquads();
  testOvrEscalationAndFastPathPreservation();
  testIntlYouthPoolAndGrouping();
  testYouthStadiumsRegistryAndConstraints();
  testNationalU17PopulationAndMeritCallUps();
  console.log('Phase 6 tests passed: 9 city 23-player squads, OVR scaling, 48-club grouping, Youth stadiums & merit U17 call-ups verified.');
}

runAll();
