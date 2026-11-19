import type { Ball, Particle, Player, PlayerAction, ProgressionTier } from '../types';
import { PITCH_CONFIG } from './constants';
import { audio } from './audio';
import { calculateAerialTimingWindow, evaluateAerialContactQuality } from './playerStats';

class AnimationEngine {
  private static instance: AnimationEngine | null = null;

  static getInstance(): AnimationEngine {
    if (!AnimationEngine.instance) AnimationEngine.instance = new AnimationEngine();
    return AnimationEngine.instance;
  }

  resolveDribbleTier(player: Player): ProgressionTier | 'semi_pro' | 'world_class' | 'unique' {
    if (player.dribbleTier) return player.dribbleTier;
    const dri = player.canonicalStats && 'dri' in player.canonicalStats ? player.canonicalStats.dri : 70;
    const tier =
      dri >= 100
        ? 'unique'
        : dri >= 90
          ? 'world_class'
          : dri >= 80
            ? 'elite'
            : dri >= 70
              ? 'pro'
              : dri >= 60
                ? 'semi_pro'
                : 'amateur';
    player.dribbleTier = tier as Player['dribbleTier'];
    return tier as Player['dribbleTier'] & string;
  }

  updateCloseControlDribble(player: Player, hasBall: boolean, timeScale = 1): void {
    if (!hasBall) return;
    const speed = Math.hypot(player.vx, player.vy);
    if (speed < 0.2) return;
    const tier = this.resolveDribbleTier(player);
    let cadence = 6;
    switch (tier) {
      case 'amateur': cadence = speed > 2.8 ? 6 : 8; break;
      case 'semi_pro': cadence = speed > 2.8 ? 5 : 7; break;
      case 'pro': cadence = speed > 2.8 ? 4 : 6; break;
      case 'elite': cadence = speed > 2.8 ? 3 : 5; break;
      case 'world_class': cadence = speed > 2.8 ? 2 : 4; break;
      case 'unique': cadence = speed > 2.8 ? 2 : 3; break;
    }
    player.animTimer = (player.animTimer || 0) + timeScale;
    if (player.animTimer >= cadence) {
      player.animTimer = 0;
      player.animFrame = ((player.animFrame || 0) + 1) % 6;
      player.touchStepFoot = player.animFrame % 2 === 0 ? 'left' : 'right';
    }
  }

  triggerBodyFeint(player: Player, dir: 'left' | 'right', _intensity?: number): void {
    const tier = this.resolveDribbleTier(player);
    player.action = 'body_feint';
    let duration = 16;
    if (tier === 'unique') duration = 8;
    else if (tier === 'world_class') duration = 10;
    else if (tier === 'elite') duration = 12;
    else if (tier === 'pro') duration = 15;
    else if (tier === 'semi_pro') duration = 18;
    else duration = 22;
    player.actionTimer = duration;
    player.bodyFeintDir = dir;
    player.animFrame = 0;
    player.animTimer = 0;
    audio.playKick(0.3);
  }

  triggerRoulette(player: Player): void {
    const tier = this.resolveDribbleTier(player);
    player.action = 'roulette';
    player.actionTimer = tier === 'unique' || tier === 'world_class' ? 16 : 22;
    player.animFrame = 0;
    player.animTimer = 0;
    audio.playKick(0.4);
  }

  triggerNutmegOrSombrero(player: Player, isSombrero: boolean): void {
    const tier = this.resolveDribbleTier(player);
    if (isSombrero) {
      player.action = 'sombrero';
      player.actionTimer = tier === 'unique' || tier === 'world_class' ? 18 : 24;
      player.animFrame = 0;
      audio.playKick(0.65);
    } else {
      player.action = 'nutmeg_dash';
      player.actionTimer = tier === 'unique' || tier === 'world_class' ? 15 : 20;
      player.animFrame = 0;
      audio.playNutmegCheer();
    }
  }

  resolveShootingAnimation(
    player: Player,
    ball: Ball,
    power: number,
    isSpecial: boolean,
    isChipped: boolean,
    allPlayers: Player[],
  ): PlayerAction {
    const high = ball.z > 14;
    const mid = ball.z > 3 && ball.z <= 14;
    if (high) {
      return Math.abs(player.facingAngle - Math.atan2(PITCH_CONFIG.CENTER_Y - player.y, PITCH_CONFIG.CENTER_X - player.x)) > 2 &&
        Math.random() < 0.35
        ? 'bicycle_kick'
        : 'side_volley';
    }
    if (mid) return Math.random() < 0.5 ? 'half_volley' : 'side_volley';
    let pressured = false;
    for (const other of allPlayers) {
      if (other.team !== player.team && !other.isRedCarded && Math.hypot(other.x - player.x, other.y - player.y) < 22) {
        pressured = true;
        break;
      }
    }
    if (pressured && power > 0.65) return 'sliding_toe_poke';
    if (isSpecial) return 'curling_finesse';
    if (isChipped) return 'chip_shot';
    if (power > 0.75) return 'driven_laces_strike';
    return Math.hypot(player.vx, player.vy) > 0.8 ? 'running_shot_mid' : 'standing_shot_mid';
  }

  resolvePassingAnimation(
    player: Player,
    targetAngle: number,
    power: number,
    isSpecial: boolean,
    isChipped: boolean,
  ): PlayerAction {
    let diff = Math.abs(targetAngle - player.facingAngle);
    while (diff > Math.PI) diff = Math.PI * 2 - diff;
    if (diff > 2.2) return 'backheel_flick';
    if (isSpecial) return 'trivela';
    if (isChipped) return 'scoop_chip';
    return power < 0.6 ? 'sidefoot_push' : 'standing_pass_mid';
  }

  updateLocomotion(player: Player, _isMoving: boolean, isJockeying: boolean, timeScale = 1): Particle[] {
    const speed = Math.hypot(player.vx, player.vy);
    const particles: Particle[] = [];
    const prevSpeed = Math.hypot(player.prevVx || 0, player.prevVy || 0);
    const decel = prevSpeed - speed;
    if (prevSpeed > 3.4 && decel > 1.8 && (!player.decelSkidTimer || player.decelSkidTimer <= 0)) {
      player.decelSkidTimer = 14;
      player.action = 'deceleration_skid';
      player.animFrame = 0;
      audio.playKick(0.25);
      const dir = Math.atan2(player.prevVy || 0, player.prevVx || 0);
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: player.x,
          y: player.y + 2,
          z: 0,
          vx: -Math.cos(dir) * (1.5 + Math.random() * 2),
          vy: -Math.sin(dir) * (1.5 + Math.random() * 2),
          vz: Math.random() * 1.8 + 0.5,
          color: i % 2 === 0 ? '#15803d' : '#166534',
          life: 0,
          maxLife: 15,
          size: 2,
        });
      }
    }
    player.prevVx = player.vx;
    player.prevVy = player.vy;
    if (player.decelSkidTimer && player.decelSkidTimer > 0) {
      player.decelSkidTimer = Math.max(0, player.decelSkidTimer - timeScale);
      if (player.decelSkidTimer === 0 && player.action === 'deceleration_skid') {
        player.action = 'idle';
      }
      return particles;
    }
    if (isJockeying && speed < 2.5) {
      player.action = 'defensive_jockey';
      player.animTimer = (player.animTimer || 0) + timeScale;
      if (player.animTimer % 5 === 0) {
        player.animFrame = ((player.animFrame || 0) + 1) % 4;
      }
    }
    return particles;
  }

  resolveAerialContest(attacker: Player, defender: Player, _ball?: Ball) {
    const aStr = attacker.canonicalStats && 'str' in attacker.canonicalStats ? attacker.canonicalStats.str : 75;
    const aHea = attacker.canonicalStats && 'hea' in attacker.canonicalStats ? attacker.canonicalStats.hea : 75;
    const aRea = attacker.canonicalStats && 'rea' in attacker.canonicalStats ? attacker.canonicalStats.rea : 75;
    const dStr = defender.canonicalStats && 'str' in defender.canonicalStats ? defender.canonicalStats.str : 75;
    const dHea = defender.canonicalStats && 'hea' in defender.canonicalStats ? defender.canonicalStats.hea : 75;
    const dRea = defender.canonicalStats && 'rea' in defender.canonicalStats ? defender.canonicalStats.rea : 75;
    const aScore = aStr * 0.4 + aHea * 0.45 + aRea * 0.15 + (Math.random() - 0.5) * 16;
    const dScore = dStr * 0.45 + dHea * 0.4 + dRea * 0.15 + (Math.random() - 0.5) * 16;
    const attackerWins = aScore >= dScore;
    const winner = attackerWins ? attacker : defender;
    const loser = attackerWins ? defender : attacker;
    winner.action = 'contested_duel';
    winner.actionTimer = 22;
    winner.animFrame = 1;
    loser.action = 'contested_duel';
    loser.actionTimer = 22;
    loser.animFrame = 0;
    audio.playShoulderHit();
    return { winner, loser, isContested: true, powerMultiplier: 1.15, elevation: 0.25 };
  }

  resolveHeaderStyle(player: Player, ball: Ball, distToGoal: number, simple = false): PlayerAction {
    if (simple) return 'heading';
    if (ball.z <= 18 && ball.z >= 8 && distToGoal < 260) return 'diving_header';
    if (distToGoal < 240) return 'bullet_header';
    if (Math.abs(player.x - PITCH_CONFIG.CENTER_X) > 80) return 'glancing_header';
    return 'heading';
  }

  resolveVolleyStyle(player: Player, ball: Ball, _distToGoal: number, simple = false): PlayerAction {
    if (simple) return 'volley';
    if (ball.z <= 6.8) return 'half_volley';
    if (ball.z > 16.5) {
      const backToGoal = player.team === 'home' ? Math.sin(player.facingAngle) > 0.35 : Math.sin(player.facingAngle) < -0.35;
      return backToGoal ? 'bicycle_kick' : 'scissor_kick';
    }
    if (Math.hypot(player.vx, player.vy) > 1.8 && ball.z >= 5 && ball.z <= 14) return 'diving_volley';
    return 'side_volley';
  }

  evaluateAerialTimingStrike(player: Player, ball: Ball, isVolley: boolean) {
    const rea = player.canonicalStats && 'rea' in player.canonicalStats ? player.canonicalStats.rea : 75;
    const skill = isVolley
      ? (player.canonicalStats && 'sho' in player.canonicalStats ? player.canonicalStats.sho : 75)
      : (player.canonicalStats && 'hea' in player.canonicalStats ? player.canonicalStats.hea : 75);
    const timingWindow = calculateAerialTimingWindow(rea, skill, isVolley);
    const dist = Math.hypot(ball.x - player.x, ball.y - player.y);
    const quality = evaluateAerialContactQuality(ball.z, dist, timingWindow);
    let powerMultiplier = timingWindow.powerMultiplier;
    let accuracySpread = 0;
    if (quality === 'sweet_spot') {
      powerMultiplier *= 1.25;
      accuracySpread = 4;
    } else if (quality === 'acceptable') {
      powerMultiplier *= 0.9;
      accuracySpread = 16;
    } else {
      powerMultiplier *= 0.4;
      accuracySpread = 45;
    }
    return { quality, timingWindow, powerMultiplier, accuracySpread };
  }

  triggerGoalkeeperAcrobaticSave(
    gk: Player,
    type: 'smother' | 'fingertip' | 'punch' | 'star_spread' | 'recovery',
    dirX = 0,
    dirY = 0,
  ): void {
    gk.diveX = dirX * 3.5;
    gk.diveY = dirY * 3.5;
    if (type === 'smother') {
      gk.action = 'gk_low_smother';
      gk.actionTimer = 24;
      gk.animFrame = 0;
      audio.playKick(0.5);
    } else if (type === 'fingertip') {
      gk.action = 'gk_fingertip_parry';
      gk.actionTimer = 26;
      gk.animFrame = 0;
      audio.playKick(0.7);
    } else if (type === 'punch') {
      gk.action = 'gk_punch';
      gk.actionTimer = 20;
      gk.animFrame = 0;
      audio.playKick(0.85);
    } else if (type === 'star_spread') {
      gk.action = 'gk_star_spread';
      gk.actionTimer = 22;
      gk.animFrame = 0;
      audio.playKick(0.4);
    } else {
      gk.action = 'gk_recovery_roll';
      gk.actionTimer = 18;
      gk.animFrame = 0;
    }
  }
}

export const animationEngine = AnimationEngine.getInstance();
