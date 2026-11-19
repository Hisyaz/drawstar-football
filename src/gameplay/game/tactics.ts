/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Ball,
  DetailedTactics,
  DifficultyLevel,
  Player,
  TacticalBlockPhase,
  TacticalPlaystyle,
  TeamSide,
  TeamTacticalRoles,
} from '../types';
import { PITCH_CONFIG } from './constants';

export const CANDIDATE_TARGETS = new Int32Array(11);
export const CANDIDATE_SCORES = new Float32Array(11);
export const PRESSED_DISTANCES = new Float32Array(8);
export const PRESS_ROLE_IDS = new Int32Array(11);
export const PRESS_TARGET_XS = new Float32Array(11);
export const HOME_BLOCK_TARGETS = new Float32Array(22);
export const AWAY_BLOCK_TARGETS = new Float32Array(22);

const PX_PER_METER = PITCH_CONFIG.FIELD_HEIGHT / 105;

export function distSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

export function distToSegmentSq(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const lenSq = distSq(ax, ay, bx, by);
  if (lenSq === 0) return distSq(px, py, ax, ay);
  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = ax + t * (bx - ax);
  const projY = ay + t * (by - ay);
  return distSq(px, py, projX, projY);
}

export function calculateInterceptionVector(
  _player: Player,
  carrier: Player,
  framesAhead = 8
): { targetX: number; targetY: number } {
  const speedSq = carrier.vx * carrier.vx + carrier.vy * carrier.vy;
  const vx = speedSq > 0.16 ? carrier.vx : Math.cos(carrier.facingAngle) * 1.5;
  const vy = speedSq > 0.16 ? carrier.vy : Math.sin(carrier.facingAngle) * 1.5;
  const tx = carrier.x + vx * framesAhead;
  const ty = carrier.y + vy * framesAhead;
  return {
    targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 25, Math.min(PITCH_CONFIG.PITCH_RIGHT - 25, tx)),
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 30, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 30, ty)),
  };
}

export function isCarrierInPressingCorridor(
  carrier: Player,
  _isAttackingUp: boolean
): boolean {
  return Math.abs(carrier.x - PITCH_CONFIG.CENTER_X) > PITCH_CONFIG.FIELD_WIDTH * 0.28;
}

export function calculateCoverShadowPosition(
  ax: number,
  ay: number,
  bx: number,
  by: number
): { x: number; y: number } {
  return {
    x: ax * 0.65 + bx * 0.35,
    y: ay * 0.65 + by * 0.35,
  };
}

export function findCoverShadowTarget(
  defender: Player,
  carrier: Player,
  allPlayers: Player[],
  _isAttackingUp: boolean
): { x: number; y: number } | null {
  let bestTarget: Player | null = null;
  let bestDistSq = Infinity;
  for (let i = 0; i < allPlayers.length; i++) {
    const p = allPlayers[i];
    if (p.team === carrier.team && p.id !== carrier.id && p.role !== 'GK' && !p.isRedCarded) {
      const d = distSq(defender.x, defender.y, p.x, p.y);
      if (d < bestDistSq && d < 260 * 260) {
        bestDistSq = d;
        bestTarget = p;
      }
    }
  }
  return bestTarget ? calculateCoverShadowPosition(carrier.x, carrier.y, bestTarget.x, bestTarget.y) : null;
}

export function calculateZone14Position(isAttackingUp: boolean): { x: number; y: number } {
  const dir = isAttackingUp ? 1 : -1;
  const goalY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP : PITCH_CONFIG.PITCH_BOTTOM;
  return {
    x: PITCH_CONFIG.CENTER_X,
    y: goalY + dir * (PITCH_CONFIG.PENALTY_BOX_HEIGHT + 55),
  };
}

export function findUnobstructedPassingTarget(
  target: { x: number; y: number },
  passer: Player,
  opponents: Player[],
  _isAttackingUp: boolean
): { targetX: number; targetY: number; isObstructed: boolean } {
  let obstructed = false;
  let blocker: Player | null = null;
  for (let i = 0; i < opponents.length; i++) {
    const opp = opponents[i];
    if (opp.isRedCarded || opp.action === 'fouled_falling' || opp.role === 'GK') continue;
    if (distToSegmentSq(opp.x, opp.y, passer.x, passer.y, target.x, target.y) < 1225) {
      obstructed = true;
      blocker = opp;
      break;
    }
  }
  if (!obstructed || !blocker) {
    return { targetX: target.x, targetY: target.y, isObstructed: false };
  }
  const angle = Math.atan2(target.y - passer.y, target.x - passer.x);
  const leftAngle = angle + Math.PI / 2;
  const rightAngle = angle - Math.PI / 2;
  const offset = 48;
  const lx = target.x + Math.cos(leftAngle) * offset;
  const ly = target.y + Math.sin(leftAngle) * offset;
  const rx = target.x + Math.cos(rightAngle) * offset;
  const ry = target.y + Math.sin(rightAngle) * offset;
  const leftDist = distSq(lx, ly, blocker.x, blocker.y);
  const rightDist = distSq(rx, ry, blocker.x, blocker.y);
  const chosenX = leftDist > rightDist ? lx : rx;
  const chosenY = leftDist > rightDist ? ly : ry;
  return {
    targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 30, Math.min(PITCH_CONFIG.PITCH_RIGHT - 30, chosenX)),
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 40, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 40, chosenY)),
    isObstructed: true,
  };
}

function getBuildUpPhase(carrier: Player, isAttackingUp: boolean): 'deep_buildup' | 'midfield_progression' | 'final_third_overload' {
  if (isAttackingUp) {
    if (carrier.y > PITCH_CONFIG.CENTER_Y + 120) return 'deep_buildup';
    if (carrier.y < PITCH_CONFIG.CENTER_Y - 140) return 'final_third_overload';
    return 'midfield_progression';
  }
  if (carrier.y < PITCH_CONFIG.CENTER_Y - 120) return 'deep_buildup';
  if (carrier.y > PITCH_CONFIG.CENTER_Y + 140) return 'final_third_overload';
  return 'midfield_progression';
}

export function calculateSupportVector(
  player: Player,
  carrier: Player,
  teammates: Player[],
  opponents: Player[],
  isAttackingUp: boolean,
  _playstyle?: TacticalPlaystyle,
  _tactics?: DetailedTactics
): { targetX: number; targetY: number; runType: Player['supportRunType'] } {
  const phase = getBuildUpPhase(carrier, isAttackingUp);
  const forwardSign = isAttackingUp ? -1 : 1;
  const isMid =
    player.role === 'CM1' ||
    player.role === 'CM2' ||
    player.role === 'LM' ||
    player.role === 'RM' ||
    player.primaryPos === 'MID';
  const isAtt = player.role === 'ST1' || player.role === 'ST2' || player.primaryPos === 'ATT';
  const subPos =
    player.subPos ||
    (player.role === 'LB'
      ? 'LB'
      : player.role === 'RB'
      ? 'RB'
      : player.role === 'LM'
      ? 'LM'
      : player.role === 'RM'
      ? 'RM'
      : player.role === 'ST1' || player.role === 'ST2'
      ? 'ST'
      : 'CM');
  const psId = player.playstyleId;

  if (phase === 'deep_buildup') {
    if (psId === 18 || player.playstyle === 'regista') {
      return { targetX: PITCH_CONFIG.CENTER_X, targetY: carrier.y - forwardSign * 35, runType: 'triangle_short' };
    }
    if (psId === 20 || player.playstyle === 'inverted_fb') {
      return {
        targetX: player.role === 'LB' || subPos === 'LB' ? PITCH_CONFIG.CENTER_X - 110 : PITCH_CONFIG.CENTER_X + 110,
        targetY: carrier.y + forwardSign * 45,
        runType: 'triangle_short',
      };
    }
    if (player.role === 'LB' || subPos === 'LB' || subPos === 'LWB') {
      return { targetX: PITCH_CONFIG.PITCH_LEFT + 75, targetY: carrier.y + forwardSign * 60, runType: 'triangle_short' };
    }
    if (player.role === 'RB' || subPos === 'RB' || subPos === 'RWB') {
      return { targetX: PITCH_CONFIG.PITCH_RIGHT - 75, targetY: carrier.y + forwardSign * 60, runType: 'triangle_short' };
    }
    if (subPos === 'CAM' || psId === 9 || psId === 10 || psId === 11) {
      const pocket = calculateDropIntoPocket(player, carrier, opponents, isAttackingUp);
      return { targetX: pocket.targetX, targetY: pocket.targetY, runType: 'drop_pocket' };
    } else if (isMid) {
      const sideSign = player.role === 'CM1' ? -1 : 1;
      const angle = (Math.PI / 4) * sideSign;
      const dist = 140;
      const tx = carrier.x + Math.sin(angle) * dist;
      const ty = carrier.y + forwardSign * Math.cos(angle) * dist;
      return {
        targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 90, Math.min(PITCH_CONFIG.PITCH_RIGHT - 90, tx)),
        targetY: ty,
        runType: 'triangle_short',
      };
    } else if (isAtt) {
      return {
        targetX: player.role === 'ST1' ? PITCH_CONFIG.CENTER_X - 60 : PITCH_CONFIG.CENTER_X + 60,
        targetY: carrier.y + forwardSign * 260,
        runType: 'triangle_penetrate',
      };
    }
  }

  if (phase === 'midfield_progression') {
    if (
      Math.abs(carrier.x - PITCH_CONFIG.CENTER_X) > 200 &&
      carrier.id !== player.id &&
      ((carrier.x < PITCH_CONFIG.CENTER_X && player.x < PITCH_CONFIG.CENTER_X) ||
        (carrier.x > PITCH_CONFIG.CENTER_X && player.x > PITCH_CONFIG.CENTER_X)) &&
      (isMid || subPos === 'LB' || subPos === 'RB' || subPos === 'LWB' || subPos === 'RWB')
    ) {
      const under = calculateUnderlappingRun(player, carrier, carrier, isAttackingUp);
      if (under) return { targetX: under.targetX, targetY: under.targetY, runType: 'underlap' };
    }
    if (player.role === 'LB' || player.role === 'RB' || subPos === 'LB' || subPos === 'RB' || subPos === 'LWB' || subPos === 'RWB') {
      const winger = teammates.find((w) =>
        player.role === 'LB' || subPos === 'LB'
          ? w.role === 'LM' || w.subPos === 'LW'
          : w.role === 'RM' || w.subPos === 'RW'
      );
      if (winger) {
        const over = calculateOverlappingFullbackRun(player, winger, carrier, isAttackingUp);
        if (over) return { targetX: over.targetX, targetY: over.targetY, runType: 'overlap' };
      }
    }
    if (subPos === 'CAM' || subPos === 'SS' || psId === 9 || psId === 10 || psId === 11) {
      const pocket = calculateDropIntoPocket(player, carrier, opponents, isAttackingUp);
      return { targetX: pocket.targetX, targetY: pocket.targetY, runType: 'drop_pocket' };
    }
    if (psId === 13 || psId === 15 || player.playstyle === 'box_to_box') {
      const laneOffset = player.x < PITCH_CONFIG.CENTER_X ? -85 : 85;
      return { targetX: PITCH_CONFIG.CENTER_X + laneOffset, targetY: carrier.y + forwardSign * 160, runType: 'triangle_penetrate' };
    }
    if (subPos === 'CDM' || psId === 17 || player.role === 'CM1') {
      return { targetX: PITCH_CONFIG.CENTER_X, targetY: carrier.y - forwardSign * 85, runType: 'triangle_short' };
    }
    if (player.role === 'CM2' || subPos === 'CM') {
      return {
        targetX: carrier.x < PITCH_CONFIG.CENTER_X ? PITCH_CONFIG.CENTER_X + 80 : PITCH_CONFIG.CENTER_X - 80,
        targetY: carrier.y + forwardSign * 135,
        runType: 'triangle_penetrate',
      };
    }
    if (player.role === 'LM' || subPos === 'LM' || subPos === 'LW') {
      return { targetX: PITCH_CONFIG.PITCH_LEFT + 110, targetY: carrier.y + forwardSign * 120, runType: 'triangle_penetrate' };
    }
    if (player.role === 'RM' || subPos === 'RM' || subPos === 'RW') {
      return { targetX: PITCH_CONFIG.PITCH_RIGHT - 110, targetY: carrier.y + forwardSign * 120, runType: 'triangle_penetrate' };
    }
    if (isAtt) {
      const blind = calculateBlindsideChannelRun(player, opponents, isAttackingUp);
      if (blind) return { targetX: blind.targetX, targetY: blind.targetY, runType: 'blindside' };
    }
  }

  if (phase === 'final_third_overload') {
    const cut = calculateCutbackTarget(player, carrier, teammates, isAttackingUp);
    if (cut) return { targetX: cut.targetX, targetY: cut.targetY, runType: 'cutback' };
    if (Math.abs(carrier.x - PITCH_CONFIG.CENTER_X) > 180 && (isMid || subPos === 'CAM' || subPos === 'SS')) {
      const under = calculateUnderlappingRun(player, carrier, carrier, isAttackingUp);
      if (under) return { targetX: under.targetX, targetY: under.targetY, runType: 'underlap' };
    }
    if (isAtt) {
      const blind = calculateBlindsideChannelRun(player, opponents, isAttackingUp);
      return blind
        ? { targetX: blind.targetX, targetY: blind.targetY, runType: 'blindside' }
        : {
            targetX: player.role === 'ST1' ? PITCH_CONFIG.CENTER_X - 55 : PITCH_CONFIG.CENTER_X + 55,
            targetY: carrier.y + forwardSign * 85,
            runType: 'blindside',
          };
    } else {
      if (player.role === 'LM' || player.role === 'RM' || subPos === 'LW' || subPos === 'RW') {
        return {
          targetX: player.role === 'LM' || subPos === 'LW' ? PITCH_CONFIG.CENTER_X - 70 : PITCH_CONFIG.CENTER_X + 70,
          targetY: carrier.y + forwardSign * 70,
          runType: 'blindside',
        };
      }
      if (isMid) {
        const edgeY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP + 230 : PITCH_CONFIG.PITCH_BOTTOM - 230;
        return {
          targetX: player.role === 'CM1' ? PITCH_CONFIG.CENTER_X - 45 : PITCH_CONFIG.CENTER_X + 45,
          targetY: edgeY,
          runType: 'cutback',
        };
      }
    }
  }

  return {
    targetX: PITCH_CONFIG.PITCH_LEFT + player.baseX * PITCH_CONFIG.FIELD_WIDTH,
    targetY: PITCH_CONFIG.PITCH_TOP + player.baseY * PITCH_CONFIG.FIELD_HEIGHT,
    runType: null,
  };
}

export function calculateBlindsideChannelRun(
  player: Player,
  opponents: Player[],
  isAttackingUp: boolean
): { targetX: number; targetY: number } | null {
  let cb1: Player | null = null;
  let cb2: Player | null = null;
  let lb: Player | null = null;
  let rb: Player | null = null;
  for (let i = 0; i < opponents.length; i++) {
    const o = opponents[i];
    if (o.isRedCarded) continue;
    if (o.role === 'CB1') cb1 = o;
    else if (o.role === 'CB2') cb2 = o;
    else if (o.role === 'LB') lb = o;
    else if (o.role === 'RB') rb = o;
  }
  let leftChannel = PITCH_CONFIG.CENTER_X - 110;
  let rightChannel = PITCH_CONFIG.CENTER_X + 110;
  if (lb && cb1) leftChannel = (lb.x + cb1.x) * 0.5;
  if (rb && cb2) rightChannel = (rb.x + cb2.x) * 0.5;
  const targetX = Math.abs(player.x - leftChannel) < Math.abs(player.x - rightChannel) ? leftChannel : rightChannel;
  const targetY = isAttackingUp ? player.y - 140 : player.y + 140;
  return {
    targetX,
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 60, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 60, targetY)),
  };
}

export function calculateOverlappingFullbackRun(
  fullback: Player,
  winger: Player,
  carrier: Player,
  isAttackingUp: boolean
): { targetX: number; targetY: number } | null {
  if (carrier.id !== winger.id || Math.abs(winger.x - PITCH_CONFIG.CENTER_X) >= 320) return null;
  const targetX = fullback.role === 'LB' ? PITCH_CONFIG.PITCH_LEFT + 75 : PITCH_CONFIG.PITCH_RIGHT - 75;
  const targetY = isAttackingUp ? winger.y - 110 : winger.y + 110;
  return {
    targetX,
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 80, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 80, targetY)),
  };
}

export function calculateUnderlappingRun(
  _runner: Player,
  winger: Player,
  _carrier: Player,
  isAttackingUp: boolean
): { targetX: number; targetY: number } | null {
  if (!(Math.abs(winger.x - PITCH_CONFIG.CENTER_X) > 200)) return null;
  const targetX = winger.x < PITCH_CONFIG.CENTER_X ? PITCH_CONFIG.CENTER_X - 130 : PITCH_CONFIG.CENTER_X + 130;
  const dir = isAttackingUp ? -1 : 1;
  const targetY = winger.y + dir * 115;
  return {
    targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 60, Math.min(PITCH_CONFIG.PITCH_RIGHT - 60, targetX)),
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 70, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 70, targetY)),
  };
}

export function calculateDropIntoPocket(
  player: Player,
  carrier: Player,
  _opponents: Player[],
  isAttackingUp: boolean
): { targetX: number; targetY: number } {
  const dir = isAttackingUp ? -1 : 1;
  const targetY = carrier.y + dir * 95;
  const offset = player.x < PITCH_CONFIG.CENTER_X ? -65 : 65;
  const targetX = PITCH_CONFIG.CENTER_X + offset;
  return {
    targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 75, Math.min(PITCH_CONFIG.PITCH_RIGHT - 75, targetX)),
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 80, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 80, targetY)),
  };
}

export function calculateCutbackTarget(
  player: Player,
  carrier: Player,
  _teammates: Player[],
  isAttackingUp: boolean
): { targetX: number; targetY: number } | null {
  const deep = isAttackingUp
    ? carrier.y < PITCH_CONFIG.PITCH_TOP + 140
    : carrier.y > PITCH_CONFIG.PITCH_BOTTOM - 140;
  const wide = Math.abs(carrier.x - PITCH_CONFIG.CENTER_X) > 160;
  if (!deep || !wide) return null;

  const fromLeft = carrier.x < PITCH_CONFIG.CENTER_X;
  const nearPostX = fromLeft ? PITCH_CONFIG.CENTER_X - 60 : PITCH_CONFIG.CENTER_X + 60;
  const penaltySpotX = PITCH_CONFIG.CENTER_X;
  const topBoxX = fromLeft ? PITCH_CONFIG.CENTER_X - 30 : PITCH_CONFIG.CENTER_X + 30;
  const goalLineY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP : PITCH_CONFIG.PITCH_BOTTOM;
  const sixYardY = isAttackingUp ? goalLineY + 65 : goalLineY - 65;
  const spotY = isAttackingUp ? goalLineY + 130 : goalLineY - 130;
  const edgeY = isAttackingUp ? goalLineY + 230 : goalLineY - 230;

  if (player.role === 'ST1') return { targetX: nearPostX, targetY: sixYardY };
  if (player.role === 'ST2') return { targetX: penaltySpotX, targetY: spotY };
  if (player.role === 'CM1' || player.role === 'CM2') return { targetX: topBoxX, targetY: edgeY };
  return null;
}

export function calculateThirdManRun(
  player: Player,
  carrier: Player,
  isAttackingUp: boolean
): { targetX: number; targetY: number } {
  const dir = isAttackingUp ? -1 : 1;
  return {
    targetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 70, Math.min(PITCH_CONFIG.PITCH_RIGHT - 70, (player.x + PITCH_CONFIG.CENTER_X) * 0.5)),
    targetY: Math.max(PITCH_CONFIG.PITCH_TOP + 60, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 60, carrier.y + dir * 130)),
  };
}

export function getPlayerPOS(player: Player): number {
  if (player.canonicalStats && 'pos' in player.canonicalStats && typeof player.canonicalStats.pos === 'number') {
    return player.canonicalStats.pos;
  }
  return 70;
}

export function getPlayerREA(player: Player): number {
  if (player.canonicalStats && 'rea' in player.canonicalStats && typeof player.canonicalStats.rea === 'number') {
    return player.canonicalStats.rea;
  }
  return 70;
}

export function getPlayerTCK(player: Player): number {
  if (player.canonicalStats && 'tck' in player.canonicalStats && typeof player.canonicalStats.tck === 'number') {
    return player.canonicalStats.tck;
  }
  return 70;
}

export function getPlayerSLD(player: Player): number {
  if (player.canonicalStats && 'sld' in player.canonicalStats && typeof player.canonicalStats.sld === 'number') {
    return player.canonicalStats.sld;
  }
  return 70;
}

export function calculateForwardShadowingTarget(
  forward: Player,
  opponents: Player[],
  isAttackingUp: boolean
): { targetX: number; targetY: number; shadowTargetId: string | null } {
  let cb1: Player | null = null;
  let cb2: Player | null = null;
  let dm: Player | null = null;
  for (let i = 0; i < opponents.length; i++) {
    const o = opponents[i];
    if (o.team === forward.team || o.isRedCarded || o.role === 'GK') continue;
    if (o.role === 'CB1') cb1 = o;
    else if (o.role === 'CB2') cb2 = o;
    else if (o.role === 'CM1' || o.subPos === 'CDM') dm = o;
  }
  const primaryCb =
    forward.role === 'ST1' || forward.role === 'LM' || forward.x < PITCH_CONFIG.CENTER_X
      ? cb1 || cb2
      : cb2 || cb1;
  if (primaryCb && dm) {
    const pos = calculateCoverShadowPosition(primaryCb.x, primaryCb.y, dm.x, dm.y);
    return { targetX: pos.x, targetY: pos.y, shadowTargetId: dm.id };
  }
  if (primaryCb) {
    const backDir = isAttackingUp ? 1 : -1;
    return { targetX: primaryCb.x, targetY: primaryCb.y + backDir * 45, shadowTargetId: primaryCb.id };
  }
  return { targetX: forward.x, targetY: forward.y, shadowTargetId: null };
}

export function evaluateDefenderStepOut(
  defender: Player,
  allPlayers: Player[],
  ball: Ball,
  isAttackingUp: boolean
): { shouldStepOut: boolean; stepTargetX: number; stepTargetY: number } {
  if (!(defender.role === 'CB1' || defender.role === 'CB2' || defender.subPos === 'CB' || defender.subPos === 'LIB')) {
    return { shouldStepOut: false, stepTargetX: defender.x, stepTargetY: defender.y };
  }
  const isDestroyer = defender.playstyleId === 23 || defender.playstyle === 'destroyer';
  const tck = defender.canonicalStats && 'tck' in defender.canonicalStats ? defender.canonicalStats.tck : 75;
  const intStat = defender.canonicalStats && 'int' in defender.canonicalStats ? defender.canonicalStats.int : 75;
  const threshold = isDestroyer ? 68 : 84;
  if (tck < threshold && intStat < threshold) {
    return { shouldStepOut: false, stepTargetX: defender.x, stepTargetY: defender.y };
  }
  const stepDir = isAttackingUp ? -1 : 1;
  for (let i = 0; i < allPlayers.length; i++) {
    const opp = allPlayers[i];
    if (opp.team === defender.team || opp.isRedCarded || opp.role === 'GK') continue;
    const dx = opp.x - defender.x;
    const dy = opp.y - defender.y;
    const dSq = dx * dx + dy * dy;
    if (dSq > 1225 && dSq < 16900) {
      const facingOwnGoal = isAttackingUp ? Math.sin(opp.facingAngle) > 0.25 : Math.sin(opp.facingAngle) < -0.25;
      const nearBall = distSq(opp.x, opp.y, ball.x, ball.y) < 4225;
      if (facingOwnGoal || nearBall) {
        const sx = defender.x + dx * 0.45;
        const sy = defender.y + stepDir * 38;
        return {
          shouldStepOut: true,
          stepTargetX: Math.max(PITCH_CONFIG.PITCH_LEFT + 40, Math.min(PITCH_CONFIG.PITCH_RIGHT - 40, sx)),
          stepTargetY: Math.max(PITCH_CONFIG.PITCH_TOP + 60, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 60, sy)),
        };
      }
    }
  }
  return { shouldStepOut: false, stepTargetX: defender.x, stepTargetY: defender.y };
}

export function applyAnticipationAndAttributeVariance(
  baseX: number,
  baseY: number,
  player: Player,
  difficulty: DifficultyLevel,
  ball: Ball,
  matchFrame = 0
): { x: number; y: number } {
  if (difficulty === 'standing') return { x: player.x, y: player.y };
  const pos = getPlayerPOS(player);
  const rea = getPlayerREA(player);
  let noise = 0;
  if (difficulty === 'easy') noise = Math.max(6, 38 - (pos / 105) * 26);
  else if (difficulty === 'normal') noise = Math.max(0, 14 - (pos / 105) * 14);

  let x = baseX;
  let y = baseY;
  if (noise > 0) {
    const phase = (player.number * 37 + Math.floor(matchFrame / 30)) % 100;
    x += Math.sin(phase) * noise;
    y += Math.cos(phase) * noise;
  }
  if ((difficulty === 'elite' || difficulty === 'legend' || rea >= 85) && (ball.vx !== 0 || ball.vy !== 0) && ball.vx * ball.vx + ball.vy * ball.vy > 4) {
    const weight = difficulty === 'legend' ? 0.35 : difficulty === 'elite' ? 0.22 : 0.12;
    const reaNorm = rea / 99;
    x += ball.vx * weight * reaNorm * 3.5;
    y += ball.vy * weight * reaNorm * 3.5;
  }
  x = Math.max(PITCH_CONFIG.PITCH_LEFT + 30, Math.min(PITCH_CONFIG.PITCH_RIGHT - 30, x));
  y = Math.max(PITCH_CONFIG.PITCH_TOP + 40, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 40, y));
  return { x, y };
}

export function getCounterPressDurationFrames(
  difficulty: DifficultyLevel = 'normal',
  playstyle: TacticalPlaystyle = 'possession',
  tactics?: DetailedTactics
): number {
  if (difficulty === 'standing') return 0;
  let sec = 3.4;
  if (difficulty === 'legend') sec = 4.8;
  else if (difficulty === 'elite') sec = 4.2;
  else if (difficulty === 'normal') sec = 3.4;
  else if (difficulty === 'easy') sec = 2.4;

  if (playstyle === 'gegenpress' || tactics?.runs === 'all_attack') {
    sec = Math.min(5, sec + 1);
  } else if (playstyle === 'catenaccio' || playstyle === 'conservative' || (tactics && tactics.defensiveLine <= 2)) {
    sec = Math.max(1.8, sec - 1);
  }
  return Math.round(sec * 60);
}

export function determineTeamBlockPhase(
  inPossession: boolean,
  framesSinceTurnover: number,
  counterPressDuration: number,
  ballY: number,
  isAttackingUp: boolean,
  playstyle: TacticalPlaystyle = 'possession',
  tactics?: DetailedTactics
): TacticalBlockPhase {
  if (inPossession) return 'attacking_possession';
  if (framesSinceTurnover >= 0 && framesSinceTurnover <= counterPressDuration) return 'counter_press';
  const fieldH = PITCH_CONFIG.FIELD_HEIGHT;
  const top = PITCH_CONFIG.PITCH_TOP;
  const defLine = tactics?.defensiveLine ?? 3;
  const ballHigh = isAttackingUp ? ballY < top + fieldH * 0.38 : ballY > top + fieldH * 0.62;
  const ballDeep = isAttackingUp ? ballY > top + fieldH * 0.68 : ballY < top + fieldH * 0.32;
  const highStyle = playstyle === 'gegenpress' || defLine >= 4 || tactics?.runs === 'all_attack';
  const lowStyle = playstyle === 'catenaccio' || playstyle === 'conservative' || defLine <= 2;
  if (ballHigh && highStyle) return 'high_press';
  if (ballDeep || lowStyle) return 'low_block';
  return 'mid_block';
}

export function updateTeamBlockShape(
  team: TeamSide,
  ball: Ball,
  blockPhase: TacticalBlockPhase = 'mid_block',
  _difficulty: DifficultyLevel = 'normal',
  players: Player[],
  attacksUp?: boolean,
  playstyle: TacticalPlaystyle = 'possession',
  tactics?: DetailedTactics
): void {
  if (!players || players.length === 0) return;
  const isUp = attacksUp !== undefined ? attacksUp : team === 'home';
  const buf = team === 'home' ? HOME_BLOCK_TARGETS : AWAY_BLOCK_TARGETS;
  const fieldW = PITCH_CONFIG.FIELD_WIDTH;
  const fieldH = PITCH_CONFIG.FIELD_HEIGHT;
  const top = PITCH_CONFIG.PITCH_TOP;
  const bottom = PITCH_CONFIG.PITCH_BOTTOM;
  const left = PITCH_CONFIG.PITCH_LEFT;
  const right = PITCH_CONFIG.PITCH_RIGHT;
  const centerX = PITCH_CONFIG.CENTER_X;
  const centerY = PITCH_CONFIG.CENTER_Y;
  const compactness = tactics?.compactness ?? 2;
  const defLine = tactics?.defensiveLine ?? 3;

  const teamCount = players.reduce((acc, p) => (p.team === team ? acc + 1 : acc), 0);
  const isCompact7v7 = teamCount > 0 && teamCount <= 7;
  const pxPerMeter = fieldH / (isCompact7v7 ? 46 : 105);

  let blockDepthMeters = isCompact7v7 ? 15 : 30;
  if (blockPhase === 'low_block') blockDepthMeters = isCompact7v7 ? 12.5 : 25.5;
  else if (blockPhase === 'counter_press') blockDepthMeters = isCompact7v7 ? 12 : 25;
  else if (blockPhase === 'high_press') blockDepthMeters = isCompact7v7 ? 13.5 : 27;
  else if (blockPhase === 'mid_block') blockDepthMeters = isCompact7v7 ? 15 : 30;
  else if (blockPhase === 'attacking_possession') blockDepthMeters = isCompact7v7 ? 17 : 33;
  blockDepthMeters += ([2.5, 0, -2, -3.5][compactness - 1] ?? 0) * (isCompact7v7 ? 0.5 : 1);

  const blockDepthPx = Math.max(isCompact7v7 ? 10 : 25, Math.min(isCompact7v7 ? 20 : 35, blockDepthMeters)) * pxPerMeter;
  const forwardDir = isUp ? -1 : 1;

  let backLineY: number;
  if (isUp) {
    if (blockPhase === 'low_block') backLineY = bottom - (18 + (defLine - 1) * 2.5) * (isCompact7v7 ? 0.5 : 1) * pxPerMeter;
    else if (blockPhase === 'high_press') backLineY = centerY + fieldH * 0.055 - (defLine - 3) * (fieldH * 0.028);
    else if (blockPhase === 'counter_press') backLineY = Math.max(centerY + fieldH * 0.025, ball.y + (isCompact7v7 ? 8 : 18) * pxPerMeter);
    else if (blockPhase === 'attacking_possession') backLineY = Math.max(centerY - fieldH * 0.06, ball.y + (isCompact7v7 ? 10 : 22) * pxPerMeter);
    else backLineY = bottom - (34 + (defLine - 3) * 4) * (isCompact7v7 ? 0.48 : 1) * pxPerMeter + (ball.y - centerY) * 0.28;
    backLineY = Math.max(top + fieldH * 0.35, Math.min(bottom - fieldH * 0.27, backLineY));
  } else {
    if (blockPhase === 'low_block') backLineY = top + (18 + (defLine - 1) * 2.5) * (isCompact7v7 ? 0.5 : 1) * pxPerMeter;
    else if (blockPhase === 'high_press') backLineY = centerY - fieldH * 0.055 + (defLine - 3) * (fieldH * 0.028);
    else if (blockPhase === 'counter_press') backLineY = Math.min(centerY - fieldH * 0.025, ball.y - (isCompact7v7 ? 8 : 18) * pxPerMeter);
    else if (blockPhase === 'attacking_possession') backLineY = Math.min(centerY + fieldH * 0.06, ball.y - (isCompact7v7 ? 10 : 22) * pxPerMeter);
    else backLineY = top + (34 + (defLine - 3) * 4) * (isCompact7v7 ? 0.48 : 1) * pxPerMeter + (ball.y - centerY) * 0.28;
    backLineY = Math.min(bottom - fieldH * 0.35, Math.max(top + fieldH * 0.27, backLineY));
  }

  const offsideTrap = !isCompact7v7 && (tactics?.offsideTrap ?? false);
  const ballNearMid = Math.abs(ball.y - centerY) < fieldH * 0.3;
  if (offsideTrap && ballNearMid && (blockPhase === 'mid_block' || blockPhase === 'high_press')) {
    backLineY += forwardDir * 35;
  }

  const frontLineY = backLineY + forwardDir * blockDepthPx;
  const midLineY = backLineY + forwardDir * (blockDepthPx * 0.48);
  const horizScale = [1.12, 0.95, 0.78, 0.6][compactness - 1] ?? 0.95;
  const ballOffsetX = ball.x - centerX;
  const ballShiftX = ballOffsetX * 0.28 * horizScale;

  let slotIdx = 0;
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (p.team !== team) continue;
    if (p.role === 'GK') {
      p.isRestDefence = false;
      p.tacticalBlockPhase = blockPhase;
      const gkX = centerX;
      const gkY = isUp ? bottom - Math.min(75, fieldH * 0.07) : top + Math.min(75, fieldH * 0.07);
      p.tacticalTargetX = gkX;
      p.tacticalTargetY = gkY;
      if (slotIdx < 11) {
        buf[slotIdx * 2] = gkX;
        buf[slotIdx * 2 + 1] = gkY;
      }
      slotIdx++;
      continue;
    }

    const subPos =
      p.subPos ||
      (p.role === 'LB'
        ? 'LB'
        : p.role === 'RB'
        ? 'RB'
        : p.role === 'LM'
        ? 'LM'
        : p.role === 'RM'
        ? 'RM'
        : p.role === 'ST1' || p.role === 'ST2'
        ? 'ST'
        : p.role === 'CB1' || p.role === 'CB2'
        ? 'CB'
        : 'CM');
    const psId = p.playstyleId;
    const isDef = p.role === 'CB1' || p.role === 'CB2' || p.role === 'LB' || p.role === 'RB' || p.primaryPos === 'DEF';
    const isMid = p.role === 'CM1' || p.role === 'CM2' || p.role === 'LM' || p.role === 'RM' || p.primaryPos === 'MID';

    let isRest = false;
    if (blockPhase === 'attacking_possession') {
      if (p.role === 'CB1' || p.role === 'CB2') isRest = true;
      else if (playstyle === 'catenaccio' || playstyle === 'counterattack') {
        if (p.role === 'LB' || p.role === 'RB') isRest = true;
      } else if (playstyle === 'possession' || playstyle === 'arteta_control') {
        if (
          p.role === 'CM1' ||
          subPos === 'CDM' ||
          (ballOffsetX > 100 && p.role === 'LB') ||
          (ballOffsetX < -100 && p.role === 'RB')
        ) {
          isRest = true;
        }
      } else if (p.role === 'CM1' || subPos === 'CDM') {
        isRest = true;
      }
    }
    p.isRestDefence = isRest;
    p.tacticalBlockPhase = blockPhase;

    const baseX = left + p.baseX * fieldW;
    let tx = centerX + (baseX - centerX) * horizScale + ballShiftX;
    if (blockPhase === 'attacking_possession' && (psId === 20 || p.playstyle === 'inverted_fb')) {
      const invOffset = p.role === 'LB' || subPos === 'LB' ? -115 : 115;
      tx = centerX + invOffset * horizScale;
    } else if (ballOffsetX > 160 && (p.role === 'LB' || p.role === 'LM' || subPos === 'LB')) {
      tx += 65 * horizScale;
    } else if (ballOffsetX < -160 && (p.role === 'RB' || p.role === 'RM' || subPos === 'RB')) {
      tx -= 65 * horizScale;
    }

    let ty: number;
    if (isRest) {
      const restDist = (isCompact7v7 ? 10 : 22) * pxPerMeter;
      ty = isUp ? Math.max(backLineY, ball.y + restDist) : Math.min(backLineY, ball.y - restDist);
    } else if (isDef) {
      ty = backLineY;
      if (p.role === 'LB' || p.role === 'RB' || subPos === 'LB' || subPos === 'RB' || subPos === 'LWB' || subPos === 'RWB') {
        if (blockPhase === 'attacking_possession') {
          ty =
            subPos === 'LWB' || subPos === 'RWB' || psId === 21 || p.playstyle === 'attacker_fb'
              ? backLineY + forwardDir * (blockDepthPx * 0.72)
              : backLineY + forwardDir * (blockDepthPx * 0.28);
        } else {
          ty = backLineY + forwardDir * 15;
        }
      }
    } else if (isMid) {
      ty = midLineY;
      if (subPos === 'CDM' || psId === 17 || psId === 16 || p.playstyle === 'anchor' || p.playstyle === 'enforcer') {
        ty =
          blockPhase === 'low_block' || blockPhase === 'mid_block'
            ? backLineY + forwardDir * (blockDepthPx * 0.18)
            : backLineY + forwardDir * (blockDepthPx * 0.35);
      } else if (psId === 18 || p.playstyle === 'regista') {
        if (blockPhase === 'attacking_possession') ty = backLineY + forwardDir * (blockDepthPx * 0.08);
      } else if (subPos === 'CAM' || psId === 9 || psId === 10 || psId === 11) {
        ty = backLineY + forwardDir * (blockDepthPx * 0.72);
      } else if (psId === 13 || psId === 15 || p.playstyle === 'box_to_box') {
        if (blockPhase === 'attacking_possession') ty = backLineY + forwardDir * (blockDepthPx * 0.82);
        else if (blockPhase === 'low_block') ty = backLineY + forwardDir * (blockDepthPx * 0.14);
      } else if (p.role === 'LM' || p.role === 'RM' || subPos === 'LM' || subPos === 'RM') {
        ty = midLineY + forwardDir * (blockDepthPx * 0.15);
      }
    } else {
      ty = frontLineY;
      if (blockPhase === 'mid_block' || blockPhase === 'counter_press') {
        const limitY = isUp ? top + fieldH * 0.4 : bottom - fieldH * 0.4;
        ty = isUp ? Math.min(frontLineY, limitY) : Math.max(frontLineY, limitY);
      }
    }

    const marginX = isCompact7v7 ? 16 : 40;
    const marginY = isCompact7v7 ? 24 : 60;
    tx = Math.max(left + marginX, Math.min(right - marginX, tx));
    ty = Math.max(top + marginY, Math.min(bottom - marginY, ty));
    p.tacticalTargetX = tx;
    p.tacticalTargetY = ty;
    if (slotIdx < 11) {
      buf[slotIdx * 2] = tx;
      buf[slotIdx * 2 + 1] = ty;
    }
    slotIdx++;
  }
}

export function getContextPressMultiplier(
  scoreDiff: number,
  matchTimeMinutes: number,
  isGegenpress: boolean
): number {
  let mult = 1;
  if (scoreDiff < 0) {
    mult += 0.15;
    if (matchTimeMinutes > 65) mult += 0.2;
    if (matchTimeMinutes > 80) mult += 0.25;
  } else if (scoreDiff > 0 && matchTimeMinutes > 70) {
    mult -= 0.1;
  }
  if (isGegenpress) mult += 0.18;
  return Math.max(0.85, Math.min(1.65, mult));
}

export function shouldRunTacticalScan(frameCount: number, playerIndex: number): boolean {
  return (frameCount + playerIndex) % 4 === 0;
}

function readStat(player: { role?: string; canonicalStats?: Record<string, any> }, key: string): number {
  if (!player.canonicalStats || player.role === 'GK' || !('pac' in player.canonicalStats)) return 40;
  const val = player.canonicalStats[key];
  return typeof val === 'number' ? val : 50;
}

export function evaluatePlayerRoleFit(
  player: { role?: string; canonicalStats?: Record<string, any> },
  roleKey: keyof TeamTacticalRoles
): { score: number; highlightText: string } {
  const isGk = player.role === 'GK';
  switch (roleKey) {
    case 'captainId': {
      const cmp = isGk ? 80 : readStat(player, 'cmp');
      const pos = isGk ? 80 : readStat(player, 'pos');
      return { score: Math.round(cmp * 0.65 + pos * 0.35), highlightText: `CMP ${cmp} · POS ${pos}` };
    }
    case 'freeKickNearId': {
      if (isGk) return { score: 35, highlightText: 'GK' };
      const sho = readStat(player, 'sho');
      const lsh = readStat(player, 'lsh');
      const cmp = readStat(player, 'cmp');
      return { score: Math.round(sho * 0.5 + lsh * 0.3 + cmp * 0.2), highlightText: `SHO ${sho} · LSH ${lsh} · CMP ${cmp}` };
    }
    case 'freeKickLongId': {
      if (isGk) return { score: 35, highlightText: 'GK' };
      const lpa = readStat(player, 'lpa');
      const cro = readStat(player, 'cro');
      return { score: Math.round(lpa * 0.55 + cro * 0.45), highlightText: `LPA ${lpa} · CRO ${cro}` };
    }
    case 'penaltyTakerId': {
      if (isGk) return { score: 35, highlightText: 'GK' };
      const sho = readStat(player, 'sho');
      const cmp = readStat(player, 'cmp');
      return { score: Math.round(sho * 0.6 + cmp * 0.4), highlightText: `SHO ${sho} · CMP ${cmp}` };
    }
    case 'leftCornerTakerId':
    case 'rightCornerTakerId': {
      if (isGk) return { score: 35, highlightText: 'GK' };
      const cro = readStat(player, 'cro');
      const spa = readStat(player, 'spa');
      return { score: Math.round(cro * 0.65 + spa * 0.35), highlightText: `CRO ${cro} · SPA ${spa}` };
    }
    default:
      return { score: 50, highlightText: 'STD' };
  }
}

export function autoAssignOptimalRoles(
  players: Array<{ id: string; role?: string; isCaptain?: boolean; canonicalStats?: Record<string, any> }>
): TeamTacticalRoles {
  const outfield = players.filter((p) => p.role !== 'GK');
  const pool = outfield.length > 0 ? outfield : players;
  const pickBest = (roleKey: keyof TeamTacticalRoles): string => {
    let bestId = pool[0]?.id || '';
    let bestScore = -Infinity;
    for (const p of pool) {
      const fit = evaluatePlayerRoleFit(p, roleKey);
      if (fit.score > bestScore) {
        bestScore = fit.score;
        bestId = p.id;
      }
    }
    return bestId;
  };
  const existingCaptain = players.find((p) => p.isCaptain);
  return {
    captainId: existingCaptain ? existingCaptain.id : pickBest('captainId'),
    freeKickNearId: pickBest('freeKickNearId'),
    freeKickLongId: pickBest('freeKickLongId'),
    penaltyTakerId: pickBest('penaltyTakerId'),
    leftCornerTakerId: pickBest('leftCornerTakerId'),
    rightCornerTakerId: pickBest('rightCornerTakerId'),
  };
}

export { resolveMatchModeRules as getMatchModeRules } from '../types';
