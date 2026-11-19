/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TurfQuality, GrassLength, PitchScuffMark, TurfParticle, Ball, Player } from '../types';
import { PITCH_CONFIG, PHYSICS } from './constants';

export interface TurfPhysicsConfig {
  quality: TurfQuality;
  grassLength: GrassLength;
}

export interface TurfRollingModifiers {
  friction: number;
  bounceRestitution: number;
  staminaMultiplier: number;
  scuffRateMultiplier: number;
  microBounceChance: number;
  playerRunSpeedMultiplier: number;
}

/**
 * Returns injury risk multiplier based on turf surface.
 * Synthetic turf carries +10% injury probability (1.10).
 */
export function getTurfInjuryMultiplier(quality: TurfQuality = 'normal'): number {
  return quality === 'synthetic' ? 1.10 : 1.0;
}

/**
 * Calculates rolling friction and bounce dynamics based on turf quality and grass length
 */
export function getTurfRollingModifiers(
  quality: TurfQuality = 'normal',
  grassLength: GrassLength = 'normal'
): TurfRollingModifiers {
  // Base rolling friction (PHYSICS.BALL_FRICTION_GROUND is ~0.978)
  let friction = PHYSICS.BALL_FRICTION_GROUND;
  let bounceRestitution = PHYSICS.BOUNCE_COEFFICIENT;
  let staminaMultiplier = 1.0;
  let scuffRateMultiplier = 1.0;
  let microBounceChance = 0.0;
  let playerRunSpeedMultiplier = 1.0;

  // Grass length modifiers (only affect grass/poor turf cuts)
  if (quality === 'pristine' || quality === 'normal' || quality === 'poor') {
    if (grassLength === 'short') {
      // 15% faster roll / lower resistance
      friction = 0.986;
      bounceRestitution = 0.72;
      staminaMultiplier = 0.95;
    } else if (grassLength === 'long') {
      // Noticeable friction, passes die down earlier, burns stamina
      friction = 0.968;
      bounceRestitution = 0.62;
      staminaMultiplier = 1.10;
    }
  }

  // Turf quality modifiers
  if (quality === 'pristine') {
    friction = Math.min(0.990, friction + 0.003);
    bounceRestitution = Math.min(0.76, bounceRestitution + 0.04);
    scuffRateMultiplier = 0.5; // Minimal grass gouging
    microBounceChance = 0.0;
  } else if (quality === 'poor') {
    friction = Math.max(0.960, friction - 0.007);
    bounceRestitution = Math.max(0.55, bounceRestitution - 0.06);
    scuffRateMultiplier = 2.0; // Degrades 2x faster!
    microBounceChance = 0.035; // 3.5% chance per frame for micro-hop
  } else if (quality === 'synthetic') {
    // Identical rolling/bounce/micro-hop physics to 'poor' (injury +10% handled via getTurfInjuryMultiplier)
    friction = Math.max(0.960, friction - 0.007);
    bounceRestitution = Math.max(0.55, bounceRestitution - 0.06);
    scuffRateMultiplier = 1.5;
    microBounceChance = 0.035;
  } else if (quality === 'concrete') {
    // Hard urban street tarmac: very fast roll, crisp true bounce, zero mud/hops
    friction = 0.991;
    bounceRestitution = 0.78;
    staminaMultiplier = 1.0;
    scuffRateMultiplier = 0.25;
    microBounceChance = 0.0;
    playerRunSpeedMultiplier = 1.0;
  } else if (quality === 'sand') {
    // Coarse dry/loose sand: strictly slower & worse than 'poor'
    friction = 0.948;
    bounceRestitution = 0.40;
    staminaMultiplier = 1.15;
    scuffRateMultiplier = 2.4;
    microBounceChance = 0.055;
    playerRunSpeedMultiplier = 0.93;
  }

  return {
    friction,
    bounceRestitution,
    staminaMultiplier,
    scuffRateMultiplier,
    microBounceChance,
    playerRunSpeedMultiplier,
  };
}

/**
 * Applies micro-bounces and unpredictable hops on poor, synthetic, or sand surfaces
 */
export function applyPoorTurfMicroHops(ball: Ball, quality: TurfQuality): void {
  if ((quality !== 'poor' && quality !== 'synthetic' && quality !== 'sand') || ball.isAirborne || ball.ownerId) {
    return;
  }

  const hopChance = quality === 'sand' ? 0.055 : 0.035;
  const horizSpeed = Math.hypot(ball.vx, ball.vy);
  if (horizSpeed > 1.2 && Math.random() < hopChance) {
    // Unpredictable turf/sand bobble (deadened bounce height in deep sand, wider deflection)
    ball.z = quality === 'sand' ? Math.min(2.6, 0.3 + Math.random() * 1.4) : Math.min(3.5, 0.4 + Math.random() * 1.8);
    ball.vz = quality === 'sand' ? 0.45 + Math.random() * 0.65 : 0.6 + Math.random() * 0.9;
    ball.isAirborne = true;
    const devSpread = quality === 'sand' ? 0.18 : 0.12;
    const angleDev = (Math.random() - 0.5) * devSpread;
    const cos = Math.cos(angleDev);
    const sin = Math.sin(angleDev);
    const nvx = ball.vx * cos - ball.vy * sin;
    const nvy = ball.vx * sin + ball.vy * cos;
    ball.vx = nvx;
    ball.vy = nvy;
  }
}

/**
 * Creates persistent turf scuff marks from slide tackles, hard kicks, or pivot braking
 */
export function createTurfScuff(
  x: number,
  y: number,
  vx: number,
  vy: number,
  type: 'slide' | 'kick' | 'pivot',
  quality: TurfQuality = 'normal'
): PitchScuffMark | null {
  const speed = Math.hypot(vx, vy);
  if (speed < 0.8) return null;

  const angle = Math.atan2(vy, vx);
  const scuffMultiplier =
    quality === 'sand'
      ? 2.1
      : quality === 'poor'
      ? 1.8
      : quality === 'synthetic'
      ? 1.2
      : quality === 'concrete'
      ? 0.65
      : quality === 'pristine'
      ? 0.6
      : 1.0;

  let length = 18;
  let width = 5;
  let color = '#233918'; // Earthy dark turf divot mark

  if (type === 'slide') {
    length = (22 + speed * 4.5) * scuffMultiplier;
    width = 6 * scuffMultiplier;
    color =
      quality === 'sand'
        ? '#9c7d4d'
        : quality === 'concrete'
        ? '#3f4754'
        : quality === 'synthetic'
        ? '#18181b'
        : quality === 'poor'
        ? '#5c4827'
        : '#1e3314';
  } else if (type === 'kick') {
    length = 12 * scuffMultiplier;
    width = 4 * scuffMultiplier;
    color =
      quality === 'sand'
        ? '#8b6e42'
        : quality === 'concrete'
        ? '#475569'
        : quality === 'synthetic'
        ? '#27272a'
        : quality === 'poor'
        ? '#4f3c20'
        : '#284419';
  } else if (type === 'pivot') {
    length = 10 * scuffMultiplier;
    width = 6 * scuffMultiplier;
    color =
      quality === 'sand'
        ? '#a38452'
        : quality === 'concrete'
        ? '#64748b'
        : quality === 'synthetic'
        ? '#27272a'
        : '#253e19';
  }

  return {
    x,
    y,
    angle,
    length,
    width,
    color,
    opacity: quality === 'concrete' ? 0.35 : 0.75,
    alpha: quality === 'concrete' ? 0.35 : 0.75,
    life: 1800, // Persists for ~30 seconds (or throughout the half)
  };
}

/**
 * Draws dry bare soil patches on poor quality turf (in goalmouths, penalty spots, center circle, touchlines)
 */
export function drawPoorTurfPatches(ctx: CanvasRenderingContext2D): void {
  const cx = PITCH_CONFIG.CENTER_X;
  const top = PITCH_CONFIG.PITCH_TOP;
  const bottom = PITCH_CONFIG.PITCH_BOTTOM;
  const left = PITCH_CONFIG.PITCH_LEFT;
  const right = PITCH_CONFIG.PITCH_RIGHT;
  const cy = PITCH_CONFIG.CENTER_Y;

  ctx.save();

  // 1. TOP & BOTTOM 6-YARD BOX HEAVY DRY BARE EARTH
  drawDryMudPatch(ctx, cx, top + 35, 220, 60);
  drawDryMudPatch(ctx, cx, bottom - 35, 220, 60);

  // 2. PENALTY BOX EDGES & PENALTY SPOTS
  drawDryMudPatch(ctx, cx, top + PITCH_CONFIG.PENALTY_SPOT_DIST, 75, 45);
  drawDryMudPatch(ctx, cx, bottom - PITCH_CONFIG.PENALTY_SPOT_DIST, 75, 45);

  // 3. CENTER SPOT & TRAMPLED MIDFIELD CIRCLE
  drawDryMudPatch(ctx, cx, cy, 140, 80);

  // 4. TOUCHLINE RUNNERS WEAR (Assistant referee & winger trampled strips)
  ctx.fillStyle = 'rgba(115, 92, 52, 0.28)';
  // Left touchline wear strip
  ctx.fillRect(left - 4, top + 150, 8, PITCH_CONFIG.FIELD_HEIGHT - 300);
  // Right touchline wear strip
  ctx.fillRect(right - 4, top + 150, 8, PITCH_CONFIG.FIELD_HEIGHT - 300);

  ctx.restore();
}

function drawDryMudPatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  // Dry brown earthy base
  ctx.fillStyle = 'rgba(122, 98, 56, 0.45)';
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Darker trampled soil core
  ctx.fillStyle = 'rgba(84, 64, 34, 0.52)';
  ctx.beginPath();
  ctx.ellipse(x, y, w / 3, h / 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dry parched crack lines & pebble texture
  ctx.fillStyle = '#4a381e';
  for (let i = -w / 3; i < w / 3; i += 12) {
    const py = y + Math.sin(i * 0.5) * (h * 0.28);
    ctx.fillRect(x + i, py, 3, 1);
    ctx.fillRect(x + i + 2, py + 1, 1, 2);
  }
}
