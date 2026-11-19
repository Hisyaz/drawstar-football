/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TeamDefinition,
  CanonicalOutfieldStats,
  CanonicalGoalkeeperStats,
  Player,
  PlayerRole,
  TeamCategory,
  Confederation,
} from '../types';
import {
  TEAM_DATABASE,
  getAllTeams,
  getTeamById,
  getCategories,
  getConfederations,
  getCountries,
  getLeagues,
  getTeamsByFilter,
  getRandomTeam,
} from './teamDatabase';
import { createStatsBuffer, calculateInitialMaxStamina, getDribblingTier } from './playerStats';
import { applyPositionalHierarchyToPlayer } from './playstyles';
import { applyFormationToPlayers } from './formations';
import { teamAttacksUp } from './sides';
import { PITCH_CONFIG, HOME_FORMATION_BASE, AWAY_FORMATION_BASE } from './constants';
import type { MatchEngine } from './engine';

export * from './teamDatabase';

// Backwards-compatible exports preserved from C1-C8
export const ALL_TEAMS = TEAM_DATABASE;

export function getTeamCategories(): Array<{ id: TeamCategory; label: string; icon: string; count: number }> {
  return getCategories();
}

export function getConfederationsForCategory(
  category?: TeamCategory
): Array<{ id: Confederation; label: string; region: string; count: number }> {
  return getConfederations(category);
}

export function getCountriesForCategoryAndConfederation(
  category: TeamCategory,
  confederation: Confederation
): string[] {
  return getCountries(category, confederation);
}

export function getLeaguesForSelection(
  category: TeamCategory,
  confederation: Confederation,
  country: string
): string[] {
  return getLeagues(category, confederation, country);
}

export function filterTeams(
  category?: TeamCategory,
  confederation?: Confederation,
  country?: string,
  league?: string
): TeamDefinition[] {
  return getTeamsByFilter(category, confederation, country, league);
}

/**
 * Calculates a player's dynamic Overall Rating (OVR) based on canonical stats and tactical role
 */
export function calculatePlayerOvr(
  stats?: CanonicalOutfieldStats | CanonicalGoalkeeperStats | null,
  role?: PlayerRole | string
): number {
  if (!stats || typeof stats !== 'object') {
    return 75;
  }

  if (role === 'GK' || 'sav' in stats) {
    const gk = stats as CanonicalGoalkeeperStats;
    const weighted =
      (gk.sav || 75) * 0.25 +
      (gk.ref || 75) * 0.25 +
      (gk.han || 75) * 0.15 +
      (gk.gpo || 75) * 0.15 +
      (gk.oneOnOne || 75) * 0.1 +
      (gk.aer || 75) * 0.05 +
      (gk.dis || 75) * 0.05;
    return Math.round(weighted);
  }

  const out = stats as CanonicalOutfieldStats;
  const isDef = role === 'CB1' || role === 'CB2' || role === 'LB' || role === 'RB' || role === 'DEF1' || role === 'DEF2';
  const isMid = role === 'CM1' || role === 'CM2' || role === 'LM' || role === 'RM' || role === 'MID1' || role === 'MID2';
  const isAtt = role === 'ST1' || role === 'ST2' || role === 'ATT1' || role === 'ATT2';

  if (isDef) {
    return Math.round(
      out.tck * 0.2 +
        out.int * 0.18 +
        out.mrk * 0.16 +
        out.sld * 0.1 +
        out.str * 0.1 +
        out.pos * 0.1 +
        out.pac * 0.08 +
        out.cmp * 0.08
    );
  }

  if (isMid) {
    return Math.round(
      out.spa * 0.18 +
        out.lpa * 0.14 +
        out.bcl * 0.14 +
        out.dri * 0.12 +
        out.ret * 0.1 +
        out.int * 0.1 +
        out.cmp * 0.1 +
        out.sta * 0.06 +
        out.sho * 0.06
    );
  }

  if (isAtt) {
    return Math.round(
      out.sho * 0.24 +
        out.pos * 0.16 +
        out.bcl * 0.14 +
        out.dri * 0.14 +
        out.pac * 0.12 +
        out.lsh * 0.08 +
        out.hea * 0.06 +
        out.cmp * 0.06
    );
  }

  const sum =
    out.pac + out.sta + out.str + out.bcl + out.ret + out.dri +
    out.spa + out.lpa + out.cro + out.sho + out.hea + out.lsh +
    out.tck + out.sld + out.int + out.mrk + out.pos + out.cmp + out.rea;
  return Math.round(sum / 19);
}

/**
 * Applies a full team definition (roster, attributes, tactical identity, kits, and home venue) to the MatchEngine
 */
export function applyTeamToEngine(
  engine: MatchEngine,
  side: 'home' | 'away',
  team: TeamDefinition
) {
  if (side === 'home') {
    engine.homeTeam = team;
    engine.homeKit = { ...team.kit };
    engine.homeFormation = team.preferredFormation;
    engine.homePlaystyle = team.tacticalPlaystyle;
    engine.homeTactics = { ...team.tactics };
    if (typeof engine.applyHomeVenueForTeam === 'function') {
      engine.applyHomeVenueForTeam(team);
    }
  } else {
    engine.awayTeam = team;
    engine.awayKit = { ...(team.awayKit || team.kit) };
    engine.awayFormation = team.preferredFormation;
    engine.awayPlaystyle = team.tacticalPlaystyle;
    engine.awayTactics = { ...team.tactics };
  }

  const isNative7v7 = team.teamSize === 7 || team.streetFormation === '1-2-2-2' || team.players.length === 7;
  const targetOnPitchCount = isNative7v7 ? 7 : 11;
  const teamPlayers = team.players.slice(0, isNative7v7 ? 7 : team.players.length);

  // Restore missing role slots if switching back from 7v7 to 11v11
  let sidePlayers = engine.players.filter((p) => p.team === side);
  if (!isNative7v7 && sidePlayers.length < 11) {
    const baseMap = side === 'home' ? HOME_FORMATION_BASE : AWAY_FORMATION_BASE;
    const existingRoles = new Set(sidePlayers.map((p) => p.role));
    for (const baseRole of Object.keys(baseMap) as PlayerRole[]) {
      if (existingRoles.has(baseRole)) continue;
      const info = baseMap[baseRole];
      const restored: Player = {
        id: `${side}_${baseRole}`,
        name: info.name,
        number: info.number,
        team: side,
        role: baseRole,
        x: PITCH_CONFIG.PITCH_LEFT + info.x * PITCH_CONFIG.FIELD_WIDTH,
        y: PITCH_CONFIG.PITCH_TOP + info.y * PITCH_CONFIG.FIELD_HEIGHT,
        vx: 0,
        vy: 0,
        targetX: 0,
        targetY: 0,
        baseX: info.x,
        baseY: info.y,
        facingAngle: side === 'home' ? -Math.PI / 2 : Math.PI / 2,
        facingDir: side === 'home' ? 'up' : 'down',
        stats: { ...info.stats },
        appearance: { ...info.appearance },
        scale: info.scale || 1.0,
        action: 'idle',
        actionTimer: 0,
        stamina: 100,
        staminaMax: 100,
        staminaInitialMax: 100,
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
      engine.players.push(restored);
      sidePlayers.push(restored);
    }
  }

  const matchedSet = new Set<string>();

  for (let i = 0; i < teamPlayers.length; i++) {
    if (matchedSet.size >= targetOnPitchCount) break;
    const rp = teamPlayers[i];
    let targetPlayer = sidePlayers.find((p) => p.role === rp.role && !matchedSet.has(p.id));
    if (!targetPlayer) {
      targetPlayer = sidePlayers.find((p) => !matchedSet.has(p.id));
    }
    if (!targetPlayer) continue;

    matchedSet.add(targetPlayer.id);
    targetPlayer.sourceId = rp.id;
    targetPlayer.name = rp.name;
    targetPlayer.number = rp.number;
    targetPlayer.role = rp.role;
    targetPlayer.subPos = rp.subPosition;
    targetPlayer.playstyle = rp.playstyle;
    targetPlayer.scale = rp.scale ?? 1.0;
    targetPlayer.isCaptain = rp.isCaptain;
    targetPlayer.streetOutfit = rp.streetOutfit ? { ...rp.streetOutfit } : undefined;
    targetPlayer.appearance = { ...rp.appearance };
    if (rp.appearanceV2) {
      targetPlayer.appearanceV2 = { ...rp.appearanceV2 };
    }
    targetPlayer.canonicalStats = { ...rp.canonicalStats };

    const isGK = rp.role === 'GK';
    const sta = 'sta' in rp.canonicalStats ? (rp.canonicalStats as CanonicalOutfieldStats).sta : 85;
    const initialMax = calculateInitialMaxStamina(sta);
    targetPlayer.stamina = initialMax;
    targetPlayer.staminaMax = initialMax;
    targetPlayer.staminaInitialMax = initialMax;

    const dri = 'dri' in rp.canonicalStats ? (rp.canonicalStats as CanonicalOutfieldStats).dri : 70;
    targetPlayer.dribbleTier = getDribblingTier(dri);

    targetPlayer.statsBuffer = createStatsBuffer(
      !isGK ? (rp.canonicalStats as CanonicalOutfieldStats) : undefined,
      isGK ? (rp.canonicalStats as CanonicalGoalkeeperStats) : undefined
    );

    if (!isGK) {
      const out = rp.canonicalStats as CanonicalOutfieldStats;
      targetPlayer.stats = {
        speed: 2.0 + (out.pac - 40) * 0.015,
        sprintSpeed: 3.3 + (out.pac - 40) * 0.02,
        shotPower: 3.5 + (out.sho - 40) * 0.03,
        passing: 3.5 + (out.spa - 40) * 0.03,
        tackling: 3.0 + (out.tck - 40) * 0.03,
        heading: 3.0 + (out.hea - 40) * 0.03,
        dribbling: 3.0 + (out.dri - 40) * 0.03,
      };
    } else {
      const gk = rp.canonicalStats as CanonicalGoalkeeperStats;
      targetPlayer.stats = {
        speed: 2.1,
        sprintSpeed: 3.3,
        shotPower: 4.5,
        passing: 3.8 + (gk.dis - 40) * 0.02,
        tackling: 4.2,
        heading: 4.0,
      };
    }

    applyPositionalHierarchyToPlayer(
      targetPlayer,
      side === 'home' ? engine.homeFormation : engine.awayFormation
    );
  }

  // For native 7v7 rosters, remove the unused 4 slots on this side so exactly 7 players remain on the court
  if (isNative7v7 && matchedSet.size === 7) {
    engine.players = engine.players.filter((p) => p.team !== side || matchedSet.has(p.id));
    if (side === 'home' && !engine.players.some((p) => p.id === engine.userControlledPlayerId)) {
      const fallbackUser =
        engine.players.find((p) => p.team === 'home' && p.role === 'ST1') ||
        engine.players.find((p) => p.team === 'home' && p.role !== 'GK') ||
        engine.players.find((p) => p.team === 'home');
      if (fallbackUser) {
        engine.userControlledPlayerId = fallbackUser.id;
        fallbackUser.isUserControlled = true;
      }
    }
  }

  const formation = side === 'home' ? engine.homeFormation : engine.awayFormation;
  const attacksUp = teamAttacksUp(side);
  applyFormationToPlayers(
    engine.players,
    side,
    formation,
    PITCH_CONFIG.FIELD_WIDTH,
    PITCH_CONFIG.FIELD_HEIGHT,
    PITCH_CONFIG.PITCH_LEFT,
    PITCH_CONFIG.PITCH_TOP,
    attacksUp,
    team.streetFormation
  );

  if (engine.matchPhase === 'kickoff_ready' || engine.isPaused || engine.matchTimeSeconds === 0) {
    for (const p of engine.players) {
      if (p.team === side) {
        p.x = p.targetX;
        p.y = p.targetY;
        p.vx = 0;
        p.vy = 0;
        p.action = 'idle';
      }
    }
  }

  engine.syncSlotControlledPlayers();
  if (engine.matchTimeSeconds === 0 && engine.playerRatings) {
    engine.playerRatings.initPlayers(engine.players);
  }
  const formatBadge = isNative7v7 ? '7v7 ' : '';
  engine.setBanner(`${team.name.toUpperCase()} LOADED (${formatBadge}${team.ratingTier}-TIER · ${team.averageOvr} OVR)`, 90);
}
