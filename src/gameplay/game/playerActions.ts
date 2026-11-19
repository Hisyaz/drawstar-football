/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { setPendingIntent } from './execution';
import { makeIntent, resolveAimAngle, selectShortPassTarget, selectLongPassTarget } from './intent';
import { teamAttacksUp } from './sides';
import { AssistMode, AssistAction, Player, Ball, KeyState, TeamSide, PitchSurfaceStatus } from '../types';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from './constants';
import { audio } from './audio';
import { evaluateOffside } from './ai';
import {
  evaluateKickAccuracyInfo,
  calculateShortPassPhysics,
  calculateLongPassPhysics,
  calculateCrossPhysics,
  calculateShotPhysics,
  KickAccuracyInfo,
} from './ballPhysics';

export interface ActionExecutionContext {
  players: Player[];
  ball: Ball;
  setBanner: (msg: string, frames?: number) => void;
  triggerOffside: (incident: any, passingPlayer: Player) => void;
  recordPendingOffside?: (passer: Player, tx: number, ty: number, receiver: Player | null, isSetPiece: boolean) => void;
  updateUserControlledFlag: () => void;
  userControlledPlayerId: string | null;
  matchPhase: string;
  setMatchPhase: (phase: any) => void;
  stakeFactor?: number;
  kickoffKickingTeam?: TeamSide;
  homeAttacksUp?: boolean;
  assistMode?: AssistMode;
  getAssistMode?: (player: Player, action: AssistAction) => AssistMode;
  surfaceStatus?: PitchSurfaceStatus;
}

/**
 * Phase 2 — 1. Short Pass Execution (S / Green S Button)
 * Crisp, low ground roll directly into the recipient's body for clean first-touch reception.
 */
export function executeShortPassAction(
  ctx: ActionExecutionContext,
  player: Player,
  power: number = 0.5,
  isSpecial: boolean = false,
  isChip: boolean = false,
  keys?: KeyState
) {
  const isKickoff = ctx.matchPhase === 'kickoff_ready';
  const assistMode: AssistMode = ctx.getAssistMode ? ctx.getAssistMode(player, 'shortPass') : (ctx.assistMode ?? 'assisted');
  const acc = evaluateKickAccuracyInfo(player, keys, ctx.players);

  const selection = selectShortPassTarget(
    player,
    ctx.players,
    keys,
    power,
    assistMode,
    isKickoff,
    player.isUserControlled ? 'human' : 'cpu',
    isSpecial,
    acc.isRunning
  );
  const bestMate = selection.receiver;
  const finalPower = selection.power;
  let targetX = selection.targetX;
  let targetY = selection.targetY;
  if (bestMate && assistMode !== 'manual') {
    player.assistTargetIds = { ...(player.assistTargetIds || {}), shortPass: bestMate.id };
    player.assistTargetAngles = { ...(player.assistTargetAngles || {}), shortPass: resolveAimAngle(player, keys, assistMode === 'manual' && player.manualAimAngleActive ? player.manualAimAngle : undefined).aimAngle };
  } else if (player.assistTargetIds) {
    delete player.assistTargetIds.shortPass;
    delete player.assistTargetAngles?.shortPass;
  }

  // Set visual animation
  if (isChip) {
    player.action = 'chip_shot';
    player.actionTimer = 14;
  } else if (isSpecial) {
    player.action = 'special_curl_pass';
    player.actionTimer = 16;
  } else if (finalPower < 0.60) {
    player.action = acc.isRunning ? 'running_pass_low' : 'standing_pass_low';
    player.actionTimer = acc.isRunning ? 11 : 9;
  } else if (finalPower <= 0.70) {
    player.action = acc.isRunning ? 'running_pass_mid' : 'standing_pass_mid';
    player.actionTimer = acc.isRunning ? 14 : 12;
  } else {
    player.action = acc.isRunning ? 'running_pass_high' : 'standing_pass_high';
    player.actionTimer = acc.isRunning ? 17 : 15;
  }
  player.animFrame = 0;

  // Phase 8 Expressive Passing Delivery Selection
  if (bestMate) {
    const angleDiff = Math.abs(
      Math.atan2(Math.sin(selection.angle - player.facingAngle), Math.cos(selection.angle - player.facingAngle))
    );
    if (angleDiff > 2.2) {
      player.action = 'backheel_flick';
      player.actionTimer = 16;
    } else if (isSpecial) {
      player.action = 'trivela';
      player.actionTimer = 18;
    } else if (isChip) {
      player.action = 'scoop_chip';
      player.actionTimer = 16;
    } else if (finalPower < 0.58) {
      player.action = 'sidefoot_push';
      player.actionTimer = 14;
    }
  }

  if (isKickoff) {
    player.facingAngle = selection.angle;
  } else {
    player.facingAngle = selection.angle;
  }

  // Dynamic offside check (kickoffs are exempt from offside under FIFA Law 11)
  if (!isKickoff && bestMate) {
    if (ctx.recordPendingOffside) {
      ctx.recordPendingOffside(player, targetX, targetY, bestMate, false);
    } else {
      const isAttackingUp = teamAttacksUp(player.team);
      const offside = evaluateOffside(player, bestMate, targetX, targetY, ctx.players, isAttackingUp);
      if (offside.isOffside) {
        ctx.triggerOffside(offside, player);
        return;
      }
    }
  }

  // Kickoff ball is now in play!
  if (isKickoff) {
    ctx.setMatchPhase('in_play');
  }

  // Trajectory calculation via ballPhysics (C2/C3 unified Intent -> Execution)
  setPendingIntent(selection.intent);
  const traj = calculateShortPassPhysics(player, targetX, targetY, finalPower, isSpecial, isChip, acc, ctx.stakeFactor || 0, ctx.surfaceStatus || 'normal');

  ctx.ball.ownerId = null;
  ctx.ball.lastTouchTeam = player.team;
  ctx.ball.lastTouchPlayerId = player.id;
  ctx.ball.lastKickAction = 'pass';
  ctx.ball.rollFrictionOverride = traj.rollFriction;
  ctx.ball.lastKickPower = finalPower;
  ctx.ball.isDividedBall = true;
  ctx.ball.vx = traj.vx;
  ctx.ball.vy = traj.vy;
  ctx.ball.vz = traj.vz;
  ctx.ball.z = traj.vz > 0 ? 0.5 : 0;
  ctx.ball.spin = traj.spin;
  ctx.ball.spinY = traj.spinY;
  ctx.ball.isAirborne = traj.isAirborne;
  ctx.ball.isOverpowered = traj.isOverpowered;
  ctx.ball.isSpecialCurve = traj.isSpecialCurve;
  ctx.ball.isChipped = traj.isChipped;
  ctx.ball.chipType = traj.chipType;
  ctx.ball.isLaserPing = traj.isLaserPing;
  ctx.ball.isStatBreak = traj.isLaserPing;
  ctx.ball.statBreakTrait = traj.statBreakTrait;
  if (traj.isLaserPing) {
    player.statBreakAuraTimer = 35;
    player.statBreakTraitName = '⚡ Laser Ping';
  }

  if (isChip) {
    audio.playChipScoop(finalPower);
  } else if (traj.isOverpowered) {
    audio.playOverpoweredKick();
  } else if (isSpecial) {
    audio.playSpecialCurveKick();
  } else {
    audio.playKick(0.55 + finalPower * 0.35);
  }

  ctx.setBanner(traj.bannerMessage, 65);

  // Switch control to recipient for targeted assisted/semi passes; manual leaves switch to proximity / user
  if (bestMate && player.id === ctx.userControlledPlayerId) {
    ctx.userControlledPlayerId = bestMate.id;
    ctx.updateUserControlledFlag();
  }
}

/**
 * Phase 2 — 2. Long Pass / Through Ball Execution (W / Red L Button)
 * Space ahead of target teammate in attack direction; leading space vector; bypasses ground interceptors.
 */
export function executeLongPassAction(
  ctx: ActionExecutionContext,
  player: Player,
  power: number = 0.5,
  isSpecial: boolean = false,
  isChip: boolean = false,
  keys?: KeyState
) {
  const isKickoff = ctx.matchPhase === 'kickoff_ready';
  const assistMode: AssistMode = ctx.getAssistMode ? ctx.getAssistMode(player, 'longPass') : (ctx.assistMode ?? 'assisted');
  const isAttackingUp = teamAttacksUp(player.team);
  const acc = evaluateKickAccuracyInfo(player, keys, ctx.players);

  const selection = selectLongPassTarget(
    player,
    ctx.players,
    keys,
    power,
    assistMode,
    isKickoff,
    isAttackingUp,
    player.isUserControlled ? 'human' : 'cpu',
    isSpecial
  );
  const bestMate = selection.receiver;
  const finalPower = selection.power;
  const targetX = selection.targetX;
  const targetY = selection.targetY;
  if (bestMate && assistMode !== 'manual') {
    player.assistTargetIds = { ...(player.assistTargetIds || {}), longPass: bestMate.id };
    player.assistTargetAngles = { ...(player.assistTargetAngles || {}), longPass: resolveAimAngle(player, keys, assistMode === 'manual' && player.manualAimAngleActive ? player.manualAimAngle : undefined).aimAngle };
  } else if (player.assistTargetIds) {
    delete player.assistTargetIds.longPass;
    delete player.assistTargetAngles?.longPass;
  }

  if (isChip) {
    player.action = 'chipped_long_pass';
    player.actionTimer = 22;
  } else if (finalPower < 0.60) {
    player.action = acc.isRunning ? 'running_long_pass_low' : 'standing_long_pass_low';
    player.actionTimer = acc.isRunning ? 13 : 11;
  } else if (finalPower <= 0.70) {
    player.action = acc.isRunning ? 'running_long_pass_mid' : 'standing_long_pass_mid';
    player.actionTimer = acc.isRunning ? 17 : 15;
  } else {
    player.action = acc.isRunning ? 'running_long_pass_high' : 'standing_long_pass_high';
    player.actionTimer = acc.isRunning ? 21 : 19;
  }
  player.animFrame = 0;
  player.facingAngle = selection.angle;

  // Dynamic offside check (exempt on kickoff under FIFA Law 11)
  if (!isKickoff && bestMate) {
    if (ctx.recordPendingOffside) {
      ctx.recordPendingOffside(player, targetX, targetY, bestMate, false);
    } else {
      const offside = evaluateOffside(player, bestMate, targetX, targetY, ctx.players, isAttackingUp);
      if (offside.isOffside) {
        ctx.triggerOffside(offside, player);
        return;
      }
    }
  }

  // Kickoff ball is now in play!
  if (isKickoff) {
    ctx.setMatchPhase('in_play');
  }

  setPendingIntent(selection.intent);
  const traj = calculateLongPassPhysics(player, targetX, targetY, finalPower, isSpecial, isChip, acc, ctx.stakeFactor || 0, ctx.surfaceStatus || 'normal');

  ctx.ball.ownerId = null;
  ctx.ball.lastTouchTeam = player.team;
  ctx.ball.lastTouchPlayerId = player.id;
  ctx.ball.lastKickAction = 'long_pass';
  ctx.ball.rollFrictionOverride = traj.rollFriction;
  ctx.ball.lastKickPower = finalPower;
  ctx.ball.isDividedBall = true;
  ctx.ball.vx = traj.vx;
  ctx.ball.vy = traj.vy;
  ctx.ball.vz = traj.vz;
  ctx.ball.z = traj.vz > 0 ? 0.5 : 0;
  ctx.ball.spin = traj.spin;
  ctx.ball.spinY = traj.spinY;
  ctx.ball.isAirborne = traj.isAirborne;
  ctx.ball.isOverpowered = traj.isOverpowered;
  ctx.ball.isSpecialCurve = traj.isSpecialCurve;
  ctx.ball.isChipped = traj.isChipped;
  ctx.ball.chipType = traj.chipType;
  ctx.ball.isKnuckle = false;
  ctx.ball.isRadarTelemetry = traj.isRadarTelemetry;
  ctx.ball.isStatBreak = traj.isRadarTelemetry;
  ctx.ball.statBreakTrait = traj.statBreakTrait;
  if (traj.isRadarTelemetry) {
    player.statBreakAuraTimer = 35;
    player.statBreakTraitName = '⚡ Radar Telemetry Switch';
  }

  if (isChip) {
    audio.playChipScoop(finalPower);
  } else if (traj.isOverpowered) {
    audio.playOverpoweredKick();
  } else if (isSpecial) {
    audio.playSpecialCurveKick();
  } else {
    audio.playKick(0.85);
  }

  ctx.setBanner(traj.bannerMessage, 70);

  // C3: Receiver runs autonomously onto leading space until human user takes control (autoSwitch or manual Switch)
  if (bestMate) {
    bestMate.targetX = targetX;
    bestMate.targetY = targetY;
    bestMate.passChaseX = targetX;
    bestMate.passChaseY = targetY;
    bestMate.passChaseTimer = 110;
    bestMate.actionTimer = 0;
    bestMate.action = 'running';
  }
}

/**
 * Phase 2 — 3. Cross Execution (D / Blue C Button) & ⚡ Chipped Cross (E + D)
 * Opposing team's penalty box corridor; whipped delivery for aerial duels; high floating chipped cross for far-post runners.
 */
export function executeCrossAction(
  ctx: ActionExecutionContext,
  player: Player,
  power: number = 0.5,
  isSpecial: boolean = false,
  isChip: boolean = false,
  keys?: KeyState
) {
  const assistMode = ctx.getAssistMode ? ctx.getAssistMode(player, 'cross') : (ctx.assistMode ?? 'assisted');
  if (ctx.matchPhase === 'kickoff_ready') {
    ctx.setMatchPhase('in_play');
  }

  const acc = evaluateKickAccuracyInfo(player, keys, ctx.players);

  if (isChip) {
    player.action = 'chipped_cross';
    player.actionTimer = 22;
  } else if (power < 0.60) {
    player.action = acc.isRunning ? 'running_cross_low' : 'standing_cross_low';
    player.actionTimer = acc.isRunning ? 14 : 12;
  } else if (power <= 0.70) {
    player.action = acc.isRunning ? 'running_cross_mid' : 'standing_cross_mid';
    player.actionTimer = acc.isRunning ? 18 : 16;
  } else {
    player.action = acc.isRunning ? 'running_cross_high' : 'standing_cross_high';
    player.actionTimer = acc.isRunning ? 21 : 19;
  }
  player.animFrame = 0;

  const isAttackingUp = ctx.homeAttacksUp !== undefined
    ? (player.team === 'home' ? ctx.homeAttacksUp : !ctx.homeAttacksUp)
    : player.team === 'home';

  // Phase 7.2: Automatic Cambio de Frente (Cross-Field Switch of Play) Detection
  // High-power cross aimed from one wing toward opposite flank is interpreted as a flat switch.
  const fromLeftWing = player.x < PITCH_CONFIG.CENTER_X - 110;
  const fromRightWing = player.x > PITCH_CONFIG.CENTER_X + 110;
  const isWing = fromLeftWing || fromRightWing;
  const crossAimAngle = resolveAimAngle(player, keys, assistMode === 'manual' && player.manualAimAngleActive ? player.manualAimAngle : undefined).aimAngle;
  const crossAimX = Math.cos(crossAimAngle);
  const crossAimY = Math.sin(crossAimAngle);
  const crossAttackDirY = isAttackingUp ? -1 : 1;
  const crossAimForward = crossAimY * crossAttackDirY;
  const isAimingAcross = (fromLeftWing && crossAimX > 0.35 && crossAimForward < 0.65) ||
                         (fromRightWing && crossAimX < -0.35 && crossAimForward < 0.65);
  const isFieldSwitch = isWing && isAimingAcross;

  let targetX: number;
  let targetY: number;
  let targetReceiver: Player | null = null;

  if (isFieldSwitch) {
    // Search for receiving winger / fullback on the opposite flank to lead in stride
    const oppositeMates = ctx.players.filter(m => {
      if (m.team !== player.team || m.id === player.id || m.role === 'GK' || m.isRedCarded) return false;
      return fromLeftWing ? m.x > PITCH_CONFIG.CENTER_X + 60 : m.x < PITCH_CONFIG.CENTER_X - 60;
    });

    let bestWinger: Player | null = null;
    let bestScore = -Infinity;

    for (const m of oppositeMates) {
      const isWingerRole = ['RW', 'RM', 'RWB', 'RB', 'LW', 'LM', 'LWB', 'LB', 'ST1', 'ST2'].includes(m.role) ||
                           ['RW', 'RM', 'RWB', 'RB', 'LW', 'LM', 'LWB', 'LB'].includes(m.subPos || '');
      const widthScore = Math.abs(m.x - PITCH_CONFIG.CENTER_X); // Wider lateral position is favored
      const isAhead = isAttackingUp ? m.y < player.y + 80 : m.y > player.y - 80;
      let score = widthScore + (isWingerRole ? 350 : 0) + (isAhead ? 250 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestWinger = m;
      }
    }

    if (bestWinger) {
      targetReceiver = bestWinger;
      const attackDirY = isAttackingUp ? -1 : 1;
      const runnerSpeed = Math.hypot(bestWinger.vx, bestWinger.vy);
      // Leading space vector ahead of opposite winger so they can take it in stride
      const leadDistance = 35 + power * 45 + runnerSpeed * 12;
      targetX = bestWinger.x + (bestWinger.x > PITCH_CONFIG.CENTER_X ? 20 : -20);
      targetY = bestWinger.y + attackDirY * leadDistance;
    } else {
      // Projected open opposite channel
      const attackDirY = isAttackingUp ? -1 : 1;
      targetX = fromLeftWing ? PITCH_CONFIG.PITCH_RIGHT - 140 : PITCH_CONFIG.PITCH_LEFT + 140;
      targetY = player.y + attackDirY * (120 + power * 150);
    }
  } else {
    // Standard cross into the opposing team's penalty box corridor
    targetX = PITCH_CONFIG.CENTER_X;
    targetY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP + 115 : PITCH_CONFIG.PITCH_BOTTOM - 115;

    // Directional arrow fine-tuning towards near post, penalty spot, or far post inside the box
    if (keys?.ArrowLeft) {
      targetX -= 65;
    } else if (keys?.ArrowRight) {
      targetX += 65;
    }

    if (keys?.ArrowUp) {
      targetY += isAttackingUp ? -45 : 45; // deeper towards 6-yard box
    } else if (keys?.ArrowDown) {
      targetY += isAttackingUp ? 45 : -45; // towards penalty spot / top of box
    }
  }

  if (assistMode !== 'manual') {
    const aimAngle = crossAimAngle;
    const aimX = Math.cos(aimAngle);
    const aimY = Math.sin(aimAngle);
    const attackDirY = isAttackingUp ? -1 : 1;
    const aimForward = aimY * attackDirY;
    const isBackwardAim = aimForward < -0.48;
    const isOppositeWingAim = Math.abs(aimX) > 0.55 && aimForward < 0.55 &&
      ((fromLeftWing && aimX > 0) || (fromRightWing && aimX < 0));

    let chosen: Player | null = null;
    let bestScore = -Infinity;
    for (const mate of ctx.players) {
      if (mate.team !== player.team || mate.id === player.id || mate.role === 'GK' || mate.isRedCarded) continue;
      const vx = mate.x - player.x;
      const vy = mate.y - player.y;
      const dist = Math.hypot(vx, vy);
      if (dist < 30 || dist > 900) continue;
      const alignment = (vx * aimX + vy * aimY) / dist;
      if (isBackwardAim && vy * attackDirY > -20) continue;
      if (isOppositeWingAim && ((fromLeftWing && mate.x < PITCH_CONFIG.CENTER_X + 30) || (fromRightWing && mate.x > PITCH_CONFIG.CENTER_X - 30))) continue;
      let nearestOpp = 180;
      for (const opp of ctx.players) {
        if (opp.team !== player.team && !opp.isRedCarded) nearestOpp = Math.min(nearestOpp, Math.hypot(opp.x - mate.x, opp.y - mate.y));
      }
      const inDangerArea = Math.abs(mate.y - (isAttackingUp ? PITCH_CONFIG.PITCH_TOP + 220 : PITCH_CONFIG.PITCH_BOTTOM - 220)) < 300;
      const score = alignment * 1.8 + Math.min(1, nearestOpp / 120) * 0.8 + (inDangerArea && !isBackwardAim ? 0.9 : 0) - dist / 1000;
      if (score > bestScore) { bestScore = score; chosen = mate; }
    }

    if (chosen) {
      targetReceiver = chosen;
      if (isBackwardAim) {
        // Backward delivery: target a free teammate in the aimed zone, leading only slightly.
        targetX = chosen.x + chosen.vx * 4;
        targetY = chosen.y + chosen.vy * 4;
      } else if (isOppositeWingAim) {
        targetX = chosen.x + (chosen.x > PITCH_CONFIG.CENTER_X ? 24 : -24);
        targetY = chosen.y + attackDirY * (34 + power * 36);
      } else {
        // Attacking cross: deliver into open space for the most dangerous runner.
        targetX = chosen.x + chosen.vx * 7;
        targetY = chosen.y + attackDirY * (42 + power * 34);
      }
    }
  }

  // MANUAL crosses follow the selected aim ray. Assisted and Semi retain the
  // tactical box/wing target behavior and are refined by the C3 assist selection.
  if (assistMode === 'manual') {
    const manualAngle = resolveAimAngle(player, keys, player.manualAimAngleActive ? player.manualAimAngle : undefined).aimAngle;
    const range = 220 + Math.max(0, Math.min(1, power)) * 520;
    targetX = player.x + Math.cos(manualAngle) * range;
    targetY = player.y + Math.sin(manualAngle) * range;
    targetReceiver = null;
  }

  // Pitch boundary clamping
  targetX = Math.max(PITCH_CONFIG.PITCH_LEFT + 25, Math.min(PITCH_CONFIG.PITCH_RIGHT - 25, targetX));
  targetY = Math.max(PITCH_CONFIG.PITCH_TOP + 25, Math.min(PITCH_CONFIG.PITCH_BOTTOM - 25, targetY));

  if (acc.isDefenderTouching) {
    targetX += (Math.random() - 0.5) * 50 * (acc.errorSpreadMultiplier * 0.5);
    targetY += (Math.random() - 0.5) * 35 * (acc.errorSpreadMultiplier * 0.5);
  }

  // Dynamic offside check for crosses into box or field switches
  if (ctx.recordPendingOffside) {
    ctx.recordPendingOffside(player, targetX, targetY, targetReceiver, false);
  }

  setPendingIntent(makeIntent('cross', player.isUserControlled ? 'human' : 'cpu', player.x, player.y, targetX, targetY, power, targetReceiver?.id ?? null, isSpecial, assistMode));
  const traj = calculateCrossPhysics(player, targetX, targetY, power, isSpecial, isChip, acc, ctx.stakeFactor || 0, isFieldSwitch, ctx.surfaceStatus || 'normal');

  ctx.ball.ownerId = null;
  ctx.ball.lastTouchTeam = player.team;
  ctx.ball.lastTouchPlayerId = player.id;
  ctx.ball.lastKickAction = 'cross';
  ctx.ball.lastKickPower = power;
  ctx.ball.isDividedBall = true;
  ctx.ball.vx = traj.vx;
  ctx.ball.vy = traj.vy;
  ctx.ball.vz = traj.vz;
  ctx.ball.z = 1.0;
  ctx.ball.spin = traj.spin;
  ctx.ball.spinY = traj.spinY;
  ctx.ball.isAirborne = true;
  ctx.ball.isOverpowered = traj.isOverpowered;
  ctx.ball.isSpecialCurve = traj.isSpecialCurve;
  ctx.ball.isChipped = traj.isChipped;
  ctx.ball.chipType = traj.chipType;
  ctx.ball.isKnuckle = false;
  ctx.ball.isGuidedWhip = traj.isGuidedWhip;
  ctx.ball.isStatBreak = traj.isGuidedWhip;
  ctx.ball.statBreakTrait = traj.statBreakTrait;
  if (traj.isGuidedWhip) {
    player.statBreakAuraTimer = 35;
    player.statBreakTraitName = '⚡ Guided Whip';
  }

  if (isChip) {
    audio.playChipScoop(power);
  } else if (traj.isOverpowered) {
    audio.playOverpoweredKick();
    audio.playCrowdGasp();
  } else if (isSpecial) {
    audio.playSpecialCurveKick();
  } else {
    audio.playKick(0.75 + power * 0.25);
  }

  ctx.setBanner(traj.bannerMessage, 70);

  // Phase 7.2: Alert receiving runner to sprint onto ball in stride and transfer user cursor
  if (targetReceiver) {
    targetReceiver.targetX = targetX;
    targetReceiver.targetY = targetY;
    targetReceiver.action = 'running';
    targetReceiver.actionTimer = 0;

    if (player.id === ctx.userControlledPlayerId) {
      ctx.userControlledPlayerId = targetReceiver.id;
      ctx.updateUserControlledFlag();
    }
  } else if (player.id === ctx.userControlledPlayerId) {
    // For standard crosses into box, transfer cursor to the best positioned attacker in the box
    const boxMates = ctx.players.filter(
      p => p.team === player.team && p.id !== player.id && p.role !== 'GK' && !p.isRedCarded
    );
    let bestBoxMate: Player | null = null;
    let minD = Infinity;
    for (const m of boxMates) {
      const d = Math.hypot(m.x - targetX, m.y - targetY);
      if (d < minD) {
        minD = d;
        bestBoxMate = m;
      }
    }
    if (bestBoxMate) {
      ctx.userControlledPlayerId = bestBoxMate.id;
      ctx.updateUserControlledFlag();
    }
  }
}

/**
 * Phase 2 — 4. Shot Execution (A / Orange S Button) & ⚡ Chip Shot (E + A)
 * High-velocity strike aimed toward corners/side netting; or delicate dink scoop lifting cleanly over rushing GK.
 */
export function executeShotAction(
  ctx: ActionExecutionContext,
  player: Player,
  power: number = 0.5,
  isSpecial: boolean = false,
  isChip: boolean = false,
  keys?: KeyState
) {
  const assistMode = ctx.getAssistMode ? ctx.getAssistMode(player, 'shoot') : (ctx.assistMode ?? 'assisted');
  if (ctx.matchPhase === 'kickoff_ready') {
    ctx.setMatchPhase('in_play');
  }

  const acc = evaluateKickAccuracyInfo(player, keys, ctx.players);

  // Check for desperate sliding toe poke when pressured from behind/sides
  let isUnderPressure = false;
  for (const opp of ctx.players) {
    if (opp.team !== player.team && !opp.isRedCarded) {
      const d = Math.hypot(opp.x - player.x, opp.y - player.y);
      if (d < 24) {
        isUnderPressure = true;
        break;
      }
    }
  }

  if (isChip) {
    player.action = 'chip_shot';
    player.actionTimer = 20;
  } else if (isSpecial) {
    player.action = 'curling_finesse';
    player.actionTimer = 22;
  } else if (isUnderPressure && power > 0.6) {
    player.action = 'sliding_toe_poke';
    player.actionTimer = 18;
  } else if (power >= 0.75) {
    player.action = 'driven_laces_strike';
    player.actionTimer = 22;
  } else if (power < 0.60) {
    player.action = acc.isRunning ? 'running_shot_low' : 'standing_shot_low';
    player.actionTimer = acc.isRunning ? 14 : 12;
  } else {
    player.action = acc.isRunning ? 'running_shot_mid' : 'standing_shot_mid';
    player.actionTimer = acc.isRunning ? 18 : 16;
  }
  player.animFrame = 0;

  const isAttackingUp = ctx.homeAttacksUp !== undefined
    ? (player.team === 'home' ? ctx.homeAttacksUp : !ctx.homeAttacksUp)
    : player.team === 'home';
  let targetGoalY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP : PITCH_CONFIG.PITCH_BOTTOM;
  const boxEdgeY = isAttackingUp ? PITCH_CONFIG.PITCH_BOTTOM - 140 : PITCH_CONFIG.PITCH_TOP + 140;
  const isInBox = isAttackingUp ? player.y <= boxEdgeY : player.y >= boxEdgeY;
  const smallAreaY = isAttackingUp ? PITCH_CONFIG.PITCH_TOP + 62 : PITCH_CONFIG.PITCH_BOTTOM - 62;
  const isInSmallArea = Math.abs(player.y - smallAreaY) < 68 && Math.abs(player.x - PITCH_CONFIG.CENTER_X) < 220;

  // ASSISTED/SEMI map aim to the goal while preserving left/right intent. Aiming
  // away from goal still selects the same post side, but reduces the assist bonus.
  let aimX = PITCH_CONFIG.CENTER_X;
  const aimAngle = resolveAimAngle(player, keys, assistMode === 'manual' && player.manualAimAngleActive ? player.manualAimAngle : undefined).aimAngle;
  if (Math.cos(aimAngle) < -0.12) aimX -= 48;
  else if (Math.cos(aimAngle) > 0.12) aimX += 48;
  const goalAngle = isAttackingUp ? -Math.PI / 2 : Math.PI / 2;
  const aimAlignment = Math.cos(Math.atan2(Math.sin(aimAngle - goalAngle), Math.cos(aimAngle - goalAngle)));
  const rawAssistQuality = Math.max(0, Math.min(1, (aimAlignment + 0.15) / 0.75));
  let aimAssistQuality = assistMode === 'manual' ? 1 : (isInSmallArea || !isInBox ? rawAssistQuality : 0.65 * rawAssistQuality);
  if (assistMode === 'manual') {
    const rawRange = 420 + Math.max(0, Math.min(1, power)) * 500;
    aimX = player.x + Math.cos(aimAngle) * rawRange;
    targetGoalY = player.y + Math.sin(aimAngle) * rawRange;
  }

  // Precision adjustment
  if (acc.isStanding) {
    aimX += (Math.random() - 0.5) * 8;
  } else if (acc.isRunning) {
    aimX += (Math.random() - 0.5) * 16 + (player.vx * 0.28);
  }

  if (acc.isDefenderTouching) {
    aimX += (Math.random() - 0.5) * 44 * (acc.errorSpreadMultiplier * 0.5);
  }

  const shotIntent = makeIntent(isInBox ? 'shot' : 'long_shot', player.isUserControlled ? 'human' : 'cpu', player.x, player.y, aimX, targetGoalY, power, null, isSpecial, assistMode);
  setPendingIntent(shotIntent);
  const traj = calculateShotPhysics(player, targetGoalY, aimX, power, isSpecial, isChip, acc, ctx.stakeFactor || 0, ctx.surfaceStatus || 'normal', aimAssistQuality);

  ctx.ball.ownerId = null;
  ctx.ball.lastTouchTeam = player.team;
  ctx.ball.lastTouchPlayerId = player.id;
  ctx.ball.lastKickAction = 'shoot';
  ctx.ball.lastKickPower = power;
  ctx.ball.isDividedBall = true;
  ctx.ball.vx = traj.vx;
  ctx.ball.vy = traj.vy;
  ctx.ball.vz = traj.vz;
  ctx.ball.z = 0.5;
  ctx.ball.spin = traj.spin;
  ctx.ball.spinY = traj.spinY;
  ctx.ball.isAirborne = true;
  ctx.ball.isOverpowered = traj.isOverpowered;
  ctx.ball.isSpecialCurve = traj.isSpecialCurve;
  ctx.ball.isChipped = traj.isChipped;
  ctx.ball.chipType = traj.chipType;
  ctx.ball.isKnuckle = false;
  ctx.ball.isThunderbolt = traj.isThunderbolt;
  ctx.ball.isDeadlyAssassin = traj.isDeadlyAssassin;
  ctx.ball.isStatBreak = traj.isThunderbolt || traj.isDeadlyAssassin;
  ctx.ball.statBreakTrait = traj.statBreakTrait;
  if (traj.statBreakTrait) {
    player.statBreakAuraTimer = 40;
    player.statBreakTraitName = `⚡ ${traj.statBreakTrait}`;
  }

  if (isChip) {
    audio.playChipScoop(power);
    if (traj.isOverpowered) {
      audio.playCrowdGasp();
    }
  } else if (traj.isOverpowered) {
    audio.playOverpoweredKick();
    audio.playCrowdGasp();
  } else if (isSpecial) {
    audio.playSpecialCurveKick();
  } else {
    audio.playKick(0.7 + power * 0.4);
  }

  ctx.setBanner(traj.bannerMessage, 70);
}
