/**
 * INTENT = what was asked for (human input or CPU decision). EXECUTION (execution.ts) decides how well the player manages it.
 * An Intent is plain data: it never contains stat-based randomness.
 */
import type { AssistMode, KeyState, Player } from '../types';
import { PITCH_CONFIG } from './constants';

export type KickKind = 'short_pass' | 'long_pass' | 'cross' | 'shot' | 'long_shot' | 'chip' | 'throw';

export interface Intent {
  kind: KickKind;
  source: 'human' | 'cpu';
  angle: number;          // radians: direction the kick is meant to go
  power: number;          // 0..1 power meter (or CPU equivalent)
  targetX: number;        // where the ball is meant to end up
  targetY: number;
  receiverId?: string | null;
  special?: boolean;      // curl / knuckle / lofted special variants
  assistMode?: AssistMode;
}

export function makeIntent(
  kind: KickKind,
  source: 'human' | 'cpu',
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
  power: number,
  receiverId?: string | null,
  special?: boolean,
  assistMode?: AssistMode
): Intent {
  return {
    kind,
    source,
    angle: Math.atan2(targetY - fromY, targetX - fromX),
    power,
    targetX,
    targetY,
    receiverId: receiverId ?? null,
    special,
    assistMode,
  };
}

export function normalizeAngleDiff(a: number): number {
  let d = a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function resolveAimAngle(
  player: Player,
  keys?: KeyState,
  overrideAngle?: number
): { aimAngle: number; hasDirectionalInput: boolean } {
  if (overrideAngle !== undefined && Number.isFinite(overrideAngle)) {
    return { aimAngle: overrideAngle, hasDirectionalInput: true };
  }
  let inputDx = 0;
  let inputDy = 0;
  if (keys?.ArrowLeft) inputDx -= 1;
  if (keys?.ArrowRight) inputDx += 1;
  if (keys?.ArrowUp) inputDy -= 1;
  if (keys?.ArrowDown) inputDy += 1;
  const hasDirectionalInput = inputDx !== 0 || inputDy !== 0;
  const aimAngle = hasDirectionalInput ? Math.atan2(inputDy, inputDx) : player.facingAngle;
  return { aimAngle, hasDirectionalInput };
}

export function shortPassRangeFromPower(power: number): number {
  const rangeT = Math.max(0, Math.min(1, (power - 0.1) / 0.8));
  return 124 + rangeT * 480;
}

export function shortPassPowerForDistance(dist: number): number {
  const rangeT = Math.max(0, Math.min(1, (dist + 22 - 124) / 480));
  return Math.max(0.18, Math.min(0.88, 0.1 + 0.8 * rangeT));
}

export function longPassRangeFromPower(power: number): number {
  const clamped = Math.max(0, Math.min(1, power));
  return 140 + clamped * 580;
}

export interface PassTargetSelection {
  receiver: Player | null;
  targetX: number;
  targetY: number;
  power: number;
  angle: number;
  intent: Intent;
}

/**
 * Shared short-pass intent builder (human + CPU):
 * - ASSISTED: targets nearest teammate in the aimed cone; corrects direction & power unless raw power is over (>=0.90) or under (<0.14).
 * - SEMI: snaps direction cleanly toward the chosen teammate in the aimed cone, keeps exact raw power.
 * - MANUAL: keeps exact raw angle and exact raw power, with no receiver snapping.
 */
export function selectShortPassTarget(
  player: Player,
  players: Player[],
  keys: KeyState | undefined,
  rawPower: number,
  mode: AssistMode,
  isKickoff: boolean,
  source: 'human' | 'cpu' = player.isUserControlled ? 'human' : 'cpu',
  isSpecial: boolean = false,
  isRunningLead: boolean = Math.hypot(player.vx, player.vy) > 0.35
): PassTargetSelection {
  const { aimAngle, hasDirectionalInput } = resolveAimAngle(player, keys, mode === 'manual' && player.manualAimAngleActive ? player.manualAimAngle : undefined);
  const clampedPower = Math.max(0.05, Math.min(1, rawPower));

  if (mode === 'manual' && !isKickoff) {
    const range = shortPassRangeFromPower(clampedPower);
    const targetX = Math.max(PITCH_CONFIG.PITCH_LEFT + 12, Math.min(PITCH_CONFIG.PITCH_RIGHT - 12, player.x + Math.cos(aimAngle) * range));
    const targetY = Math.max(PITCH_CONFIG.PITCH_TOP + 12, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 12, player.y + Math.sin(aimAngle) * range));
    const intent = makeIntent('short_pass', source, player.x, player.y, targetX, targetY, clampedPower, null, isSpecial, 'manual');
    return { receiver: null, targetX, targetY, power: clampedPower, angle: intent.angle, intent };
  }

  let bestMate: Player | null = null;
  let bestScore = -Infinity;

  if (isKickoff) {
    if (hasDirectionalInput) {
      for (let i = 0; i < players.length; i++) {
        const m = players[i];
        if (m.team !== player.team || m.id === player.id || m.isRedCarded) continue;
        const dx = m.x - player.x;
        const dy = m.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 5) continue;
        const angleDiff = Math.abs(normalizeAngleDiff(Math.atan2(dy, dx) - aimAngle));
        const alignment = Math.cos(angleDiff);
        const score = alignment * 1000 - dist * 0.35;
        if (score > bestScore) {
          bestScore = score;
          bestMate = m;
        }
      }
    } else {
      for (let i = 0; i < players.length; i++) {
        const m = players[i];
        if (m.team !== player.team || m.id === player.id || m.isRedCarded) continue;
        const dx = m.x - player.x;
        const dy = m.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 5) continue;
        let prefScore = 600 - dist * 0.5;
        if (m.role === 'ST2') prefScore += 350;
        if (m.role === 'CM1' || m.role === 'CM2') prefScore += 220;
        if (prefScore > bestScore) {
          bestScore = prefScore;
          bestMate = m;
        }
      }
    }
  } else {
    // Primary cone search (~±75 deg around aim direction): prioritize NEAREST teammate inside the aimed cone
    const coneHalfRad = Math.PI * 0.42;
    for (let i = 0; i < players.length; i++) {
      const m = players[i];
      if (m.team !== player.team || m.id === player.id || m.isRedCarded) continue;
      const dx = m.x - player.x;
      const dy = m.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 10) continue;
      const angleDiff = Math.abs(normalizeAngleDiff(Math.atan2(dy, dx) - aimAngle));
      if (angleDiff <= coneHalfRad) {
        const rangePenalty = dist > 480 ? (dist - 480) * 1.6 : 0;
        const score = 1000 - dist - angleDiff * 140 - rangePenalty;
        if (score > bestScore) {
          bestScore = score;
          bestMate = m;
        }
      }
    }

    // Fallback to nearest wide teammate if none in tight cone
    if (!bestMate) {
      for (let i = 0; i < players.length; i++) {
        const m = players[i];
        if (m.team !== player.team || m.id === player.id || m.isRedCarded) continue;
        const dx = m.x - player.x;
        const dy = m.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 10) continue;
        const angleDiff = Math.abs(normalizeAngleDiff(Math.atan2(dy, dx) - aimAngle));
        const score = 600 - dist - angleDiff * 240;
        if (score > bestScore) {
          bestScore = score;
          bestMate = m;
        }
      }
    }
  }

  // Keep the same receiver while aim stays in the same direction. Teammate movement alone
  // must never make a short-pass preview jump between players.
  if (!isKickoff && player.assistTargetIds?.shortPass && player.assistTargetAngles?.shortPass !== undefined &&
      Math.abs(normalizeAngleDiff(aimAngle - player.assistTargetAngles.shortPass)) < 0.32) {
    const locked = players.find(m => m.id === player.assistTargetIds?.shortPass && m.team === player.team && !m.isRedCarded);
    if (locked && locked.id !== player.id) bestMate = locked;
  }

  if (!bestMate) {
    const range = shortPassRangeFromPower(clampedPower);
    const targetX = player.x + Math.cos(aimAngle) * range;
    const targetY = player.y + Math.sin(aimAngle) * range;
    const intent = makeIntent('short_pass', source, player.x, player.y, targetX, targetY, clampedPower, null, isSpecial, mode);
    return { receiver: null, targetX, targetY, power: clampedPower, angle: intent.angle, intent };
  }

  let leadX = bestMate.x;
  let leadY = bestMate.y;
  if (!isKickoff && isRunningLead) {
    leadX += bestMate.vx * 3.2;
    leadY += bestMate.vy * 3.2;
  }

  const distToLead = Math.hypot(leadX - player.x, leadY - player.y);

  if (mode === 'semi') {
    const snappedAngle = Math.atan2(leadY - player.y, leadX - player.x);
    const range = shortPassRangeFromPower(clampedPower);
    const targetX = Math.max(PITCH_CONFIG.PITCH_LEFT + 12, Math.min(PITCH_CONFIG.PITCH_RIGHT - 12, player.x + Math.cos(snappedAngle) * range));
    const targetY = Math.max(PITCH_CONFIG.PITCH_TOP + 12, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 12, player.y + Math.sin(snappedAngle) * range));
    const intent = makeIntent('short_pass', source, player.x, player.y, targetX, targetY, clampedPower, bestMate.id, isSpecial, 'semi');
    return { receiver: bestMate, targetX, targetY, power: clampedPower, angle: snappedAngle, intent };
  }

  // ASSISTED: perfect target point & corrected weight unless user raw input was overpowered (>= 0.90) or underpowered (< 0.14)
  const isOverOrUnderPowered = clampedPower >= 0.90 || clampedPower < 0.14;
  const finalPower = isOverOrUnderPowered ? clampedPower : shortPassPowerForDistance(distToLead);
  const clampedX = Math.max(PITCH_CONFIG.PITCH_LEFT + 12, Math.min(PITCH_CONFIG.PITCH_RIGHT - 12, leadX));
  const clampedY = Math.max(PITCH_CONFIG.PITCH_TOP + 12, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 12, leadY));
  const intent = makeIntent('short_pass', source, player.x, player.y, clampedX, clampedY, finalPower, bestMate.id, isSpecial, 'assisted');
  return { receiver: bestMate, targetX: clampedX, targetY: clampedY, power: finalPower, angle: intent.angle, intent };
}

/**
 * Shared long-pass intent builder (human + CPU):
 * - ASSISTED: picks teammate in the most dangerous position in the aimed direction, targets reachable leading space in front.
 * - SEMI: snaps direction cleanly toward leading space of intended teammate in aimed cone, preserves exact raw power.
 * - MANUAL: exact raw aim direction & exact raw power with zero receiver snapping.
 */
export function selectLongPassTarget(
  player: Player,
  players: Player[],
  keys: KeyState | undefined,
  rawPower: number,
  mode: AssistMode,
  isKickoff: boolean,
  isAttackingUp: boolean,
  source: 'human' | 'cpu' = player.isUserControlled ? 'human' : 'cpu',
  isSpecial: boolean = false
): PassTargetSelection {
  const { aimAngle } = resolveAimAngle(player, keys, mode === 'manual' && player.manualAimAngleActive ? player.manualAimAngle : undefined);
  const clampedPower = Math.max(0.05, Math.min(1, rawPower));
  const dirY = isAttackingUp ? -1 : 1;

  if (mode === 'manual' && !isKickoff) {
    const range = longPassRangeFromPower(clampedPower);
    const targetX = Math.max(PITCH_CONFIG.PITCH_LEFT + 30, Math.min(PITCH_CONFIG.PITCH_RIGHT - 30, player.x + Math.cos(aimAngle) * range));
    const targetY = Math.max(PITCH_CONFIG.PITCH_TOP + 30, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 30, player.y + Math.sin(aimAngle) * range));
    const intent = makeIntent('long_pass', source, player.x, player.y, targetX, targetY, clampedPower, null, isSpecial, 'manual');
    return { receiver: null, targetX, targetY, power: clampedPower, angle: intent.angle, intent };
  }

  let bestMate: Player | null = null;
  let bestScore = -Infinity;

  if (isKickoff) {
    for (let i = 0; i < players.length; i++) {
      const m = players[i];
      if (m.team !== player.team || m.id === player.id || m.isRedCarded) continue;
      const dx = m.x - player.x;
      const dy = m.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 10) continue;
      const angleDiff = Math.abs(normalizeAngleDiff(Math.atan2(dy, dx) - aimAngle));
      const alignment = Math.cos(angleDiff);
      const score = alignment * 1000 + (dist > 80 ? 150 : 0) - dist * 0.25;
      if (score > bestScore) {
        bestScore = score;
        bestMate = m;
      }
    }
  } else {
    const opponentGoalY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP : PITCH_CONFIG.PITCH_BOTTOM;
    for (let i = 0; i < players.length; i++) {
      const m = players[i];
      if (m.team !== player.team || m.id === player.id || m.isRedCarded) continue;
      const dx = m.x - player.x;
      const dy = m.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 35 || dist >= 760) continue;

      const angleDiff = Math.abs(normalizeAngleDiff(aimAngle - Math.atan2(dy, dx)));
      const alignmentScore = Math.cos(angleDiff);
      if (alignmentScore <= 0.25) continue;

      // Danger evaluation: goal proximity + ahead of passer + open space from nearest opponent + active run
      const distToGoal = Math.hypot(m.x - PITCH_CONFIG.CENTER_X, m.y - opponentGoalY);
      const goalDanger = Math.max(0, 1 - distToGoal / PITCH_CONFIG.FIELD_HEIGHT); // 0..1 higher near goal
      const aheadProgress = isAttackingUp ? (player.y - m.y) : (m.y - player.y);
      const aheadNorm = Math.max(-0.3, Math.min(1.0, aheadProgress / 420));

      let minOppDist = 160;
      for (let j = 0; j < players.length; j++) {
        const opp = players[j];
        if (opp.team !== player.team && !opp.isRedCarded) {
          const dOpp = Math.hypot(opp.x - m.x, opp.y - m.y);
          if (dOpp < minOppDist) minOppDist = dOpp;
        }
      }
      const spaceNorm = minOppDist / 160;
      const runnerSpeed = Math.hypot(m.vx, m.vy);
      const runBonus = runnerSpeed > 1.0 ? 0.18 : 0;

      const dangerScore =
        goalDanger * 0.55 +
        aheadNorm * 0.35 +
        spaceNorm * 0.28 +
        alignmentScore * 0.42 +
        runBonus -
        (dist / 760) * 0.10;

      if (dangerScore > bestScore) {
        bestScore = dangerScore;
        bestMate = m;
      }
    }
  }

  // Long-pass receiver lock uses the same aim-direction rule as short passes.
  if (!isKickoff && player.assistTargetIds?.longPass && player.assistTargetAngles?.longPass !== undefined &&
      Math.abs(normalizeAngleDiff(aimAngle - player.assistTargetAngles.longPass)) < 0.32) {
    const locked = players.find(m => m.id === player.assistTargetIds?.longPass && m.team === player.team && !m.isRedCarded);
    if (locked && locked.id !== player.id) bestMate = locked;
  }

  if (!bestMate) {
    const range = longPassRangeFromPower(clampedPower);
    const targetX = Math.max(PITCH_CONFIG.PITCH_LEFT + 30, Math.min(PITCH_CONFIG.PITCH_RIGHT - 30, player.x + Math.cos(aimAngle) * range));
    const targetY = Math.max(PITCH_CONFIG.PITCH_TOP + 30, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 30, player.y + Math.sin(aimAngle) * range));
    const intent = makeIntent('long_pass', source, player.x, player.y, targetX, targetY, clampedPower, null, isSpecial, mode);
    return { receiver: null, targetX, targetY, power: clampedPower, angle: intent.angle, intent };
  }

  let leadX = bestMate.x;
  let leadY = bestMate.y;

  if (!isKickoff) {
    const leadDistance = 45 + clampedPower * 40;
    const forwardRunX = Math.cos(bestMate.facingAngle) * Math.max(Math.abs(bestMate.vx) * 12, 10);
    const forwardRunY = dirY * Math.max(Math.abs(bestMate.vy) * 12, leadDistance);
    leadX = bestMate.x + forwardRunX;
    leadY = bestMate.y + forwardRunY;

    // Pitch boundary clamp
    leadX = Math.max(PITCH_CONFIG.PITCH_LEFT + 30, Math.min(PITCH_CONFIG.PITCH_RIGHT - 30, leadX));
    leadY = Math.max(PITCH_CONFIG.PITCH_TOP + 30, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 30, leadY));

    // Reachability clamp: ensure leading target is within distance bestMate can sprint during ball flight
    const ballDist = Math.hypot(leadX - player.x, leadY - player.y);
    const shotFactor = (player.stats?.shotPower || 4.4) / 4.4;
    const estBallSpeed = (ballDist > 320 || clampedPower >= 0.65)
      ? (18.5 + clampedPower * 12.0) * shotFactor * 0.85
      : (8.5 + clampedPower * 13.0) * 0.78;
    const estFlightFrames = Math.max(12, Math.min(95, ballDist / Math.max(6, estBallSpeed)));
    const sprintSpd = bestMate.stats?.sprintSpeed || 3.4;
    const maxReach = Math.max(18, sprintSpd * estFlightFrames * 0.88);

    const offX = leadX - bestMate.x;
    const offY = leadY - bestMate.y;
    const offDist = Math.hypot(offX, offY);
    if (offDist > maxReach && offDist > 1) {
      const scale = maxReach / offDist;
      leadX = bestMate.x + offX * scale;
      leadY = bestMate.y + offY * scale;
    }
  }

  if (mode === 'semi') {
    const snappedAngle = Math.atan2(leadY - player.y, leadX - player.x);
    const range = longPassRangeFromPower(clampedPower);
    const targetX = Math.max(PITCH_CONFIG.PITCH_LEFT + 30, Math.min(PITCH_CONFIG.PITCH_RIGHT - 30, player.x + Math.cos(snappedAngle) * range));
    const targetY = Math.max(PITCH_CONFIG.PITCH_TOP + 30, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 30, player.y + Math.sin(snappedAngle) * range));
    const intent = makeIntent('long_pass', source, player.x, player.y, targetX, targetY, clampedPower, bestMate.id, isSpecial, 'semi');
    return { receiver: bestMate, targetX, targetY, power: clampedPower, angle: snappedAngle, intent };
  }

  // ASSISTED: calibrated weight for the reachable space unless user raw input was overpowered (>= 0.96) or explicitly underpowered (< 0.14)
  const distToSpace = Math.hypot(leadX - player.x, leadY - player.y);
  const isOverOrUnderPowered = clampedPower >= 0.96 || clampedPower < 0.14;
  const finalPower = isKickoff
    ? clampedPower
    : isOverOrUnderPowered
    ? clampedPower
    : Math.max(0.32, Math.min(0.88, 0.20 + distToSpace / 720));

  const intent = makeIntent('long_pass', source, player.x, player.y, leadX, leadY, finalPower, bestMate.id, isSpecial, 'assisted');
  return { receiver: bestMate, targetX: leadX, targetY: leadY, power: finalPower, angle: intent.angle, intent };
}
