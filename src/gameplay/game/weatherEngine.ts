/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  WeatherCondition,
  Season,
  TurfQuality,
  PitchSurfaceStatus,
  PuddleZone,
  WeatherParticle,
  Ball,
  Player,
  GraphicsSettings,
} from '../types';
import { PITCH_CONFIG } from './constants';
import { audio } from './audio';

export interface WeatherSurfaceModifiers {
  rollFrictionMultiplier: number;
  passDistanceMultiplier: number;
  slideDistanceMultiplier: number;
  playerSlipRisk: number;
  isRedLines: boolean;
  ballType: 'standard' | 'winter_orange' | 'winter_yellow';
  atmosphericHueOverlay: string | null;
  ambientBrightness: number;
}

export interface MuddyConditionModifiers {
  isMuddy: boolean;
  playerSpeedMultiplier: number;
  staminaDrainMultiplier: number;
  groundBallSpeedMultiplier: number;
  airBallSpeedMultiplier: number;
  shortPassSpeedMultiplier: number;
  shortPassErrorRadMax: number;
}

/**
 * Resolves special pitch surface status from weather & turf quality.
 * When rain or torrential rain falls on 'sand', surface becomes 'muddy'.
 */
export function resolvePitchSurfaceStatus(
  weather: WeatherCondition = 'clear',
  turfQuality: TurfQuality = 'normal'
): PitchSurfaceStatus {
  const isRain = weather === 'rain' || weather === 'torrential';
  const isSnow = weather === 'snow' || weather === 'blizzard';
  if (isRain && turfQuality === 'sand') return 'muddy';
  if (isSnow) return 'snowy';
  if (isRain) return 'wet';
  return 'normal';
}

/**
 * Returns subtle 5-10% tuning deltas active when surfaceStatus === 'muddy'.
 * Neutral values (1.0 / 0) otherwise.
 */
export function getMuddyConditionModifiers(
  surfaceStatus: PitchSurfaceStatus = 'normal'
): MuddyConditionModifiers {
  if (surfaceStatus !== 'muddy') {
    return {
      isMuddy: false,
      playerSpeedMultiplier: 1.0,
      staminaDrainMultiplier: 1.0,
      groundBallSpeedMultiplier: 1.0,
      airBallSpeedMultiplier: 1.0,
      shortPassSpeedMultiplier: 1.0,
      shortPassErrorRadMax: 0.0,
    };
  }
  return {
    isMuddy: true,
    playerSpeedMultiplier: 0.93, // -7% slower running
    staminaDrainMultiplier: 1.09, // +9% faster stamina spend
    groundBallSpeedMultiplier: 0.92, // -8% slower ball roll/speed on ground
    airBallSpeedMultiplier: 1.08, // +8% faster ball velocity in the air (favors long shots/crosses/passes)
    shortPassSpeedMultiplier: 0.93, // -7% slower short ground pass release
    shortPassErrorRadMax: 0.07, // subtle ~4 deg max angular scatter on short ground passes
  };
}

/**
 * Pre-allocated pool of weather particles for 60 FPS zero-allocation animation
 */
const MAX_WEATHER_PARTICLES = 300;
const weatherParticlesPool: WeatherParticle[] = Array.from({ length: MAX_WEATHER_PARTICLES }, () => ({
  x: 0,
  y: 0,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  type: 'rain',
  life: 0,
  maxLife: 0,
  size: 1,
  alpha: 0,
}));

/**
 * Fixed puddle zones generated for waterlogged/torrential/muddy matches
 */
export function generatePuddleZones(quality: TurfQuality, _weather?: WeatherCondition): PuddleZone[] {
  const cx = PITCH_CONFIG.CENTER_X;
  const top = PITCH_CONFIG.PITCH_TOP;
  const bottom = PITCH_CONFIG.PITCH_BOTTOM;
  const left = PITCH_CONFIG.PITCH_LEFT;
  const right = PITCH_CONFIG.PITCH_RIGHT;

  if (quality === 'pristine' || quality === 'concrete') {
    // Sub-air drainage or sloped street tarmac does not pool deep mud hollows
    return [];
  }

  const basePuddles: PuddleZone[] = [
    // Top Goalmouth Hollow
    { x: cx, y: top + 45, radiusX: 52, radiusY: 28, depth: 0.8 },
    // Top Penalty Spot Depression
    { x: cx - 25, y: top + PITCH_CONFIG.PENALTY_SPOT_DIST + 10, radiusX: 38, radiusY: 22, depth: 0.6 },
    // Bottom Goalmouth Hollow
    { x: cx, y: bottom - 45, radiusX: 54, radiusY: 28, depth: 0.85 },
    // Bottom Penalty Spot Depression
    { x: cx + 20, y: bottom - PITCH_CONFIG.PENALTY_SPOT_DIST - 10, radiusX: 40, radiusY: 24, depth: 0.65 },
  ];

  if (quality === 'poor' || quality === 'sand') {
    // Additional hollows in midfield and flank channels
    const halfW = PITCH_CONFIG.FIELD_WIDTH * 0.25;
    basePuddles.push(
      { x: cx - halfW, y: PITCH_CONFIG.CENTER_Y - 70, radiusX: 48, radiusY: 28, depth: quality === 'sand' ? 0.95 : 0.9 },
      { x: cx + halfW, y: PITCH_CONFIG.CENTER_Y + 80, radiusX: 50, radiusY: 30, depth: 0.95 },
      { x: left + 65, y: top + PITCH_CONFIG.FIELD_HEIGHT * 0.36, radiusX: 42, radiusY: 24, depth: 0.7 },
      { x: right - 65, y: bottom - PITCH_CONFIG.FIELD_HEIGHT * 0.36, radiusX: 45, radiusY: 25, depth: 0.75 }
    );
  }

  return basePuddles;
}

/**
 * Surface condition physics matrix evaluator
 */
export function getWeatherSurfaceModifiers(
  weather: WeatherCondition = 'clear',
  season: Season = 'summer',
  turfQuality: TurfQuality = 'normal'
): WeatherSurfaceModifiers {
  let rollFrictionMultiplier = 1.0;
  let passDistanceMultiplier = 1.0;
  let slideDistanceMultiplier = 1.0;
  let playerSlipRisk = 0.0;
  let isRedLines = false;
  let ballType: 'standard' | 'winter_orange' | 'winter_yellow' = 'standard';
  let atmosphericHueOverlay: string | null = null;
  let ambientBrightness = 1.0;

  switch (weather) {
    case 'clear':
      rollFrictionMultiplier = 1.0;
      slideDistanceMultiplier = 1.0;
      ambientBrightness = 1.05;
      break;

    case 'cloudy':
      rollFrictionMultiplier = 1.0;
      slideDistanceMultiplier = 1.0;
      ambientBrightness = 0.92;
      atmosphericHueOverlay = 'rgba(100, 116, 139, 0.08)'; // Soft overcast tint
      break;

    case 'rain':
      // 15% faster ground roll on wet grass; on sand it turns muddy and heavy
      rollFrictionMultiplier = turfQuality === 'sand' ? 0.975 : 1.015;
      passDistanceMultiplier = turfQuality === 'sand' ? 0.93 : 1.05;
      slideDistanceMultiplier = turfQuality === 'sand' ? 1.15 : 1.35;
      playerSlipRisk = turfQuality === 'sand' ? 0.05 : turfQuality === 'poor' ? 0.04 : 0.015;
      ambientBrightness = 0.88;
      atmosphericHueOverlay = 'rgba(30, 58, 95, 0.12)'; // Rainy cool sheen
      break;

    case 'torrential':
      // Waterlogged
      if (turfQuality === 'pristine') {
        rollFrictionMultiplier = 1.015;
        slideDistanceMultiplier = 1.35;
        playerSlipRisk = 0.01;
      } else if (turfQuality === 'sand') {
        rollFrictionMultiplier = 0.960;
        passDistanceMultiplier = 0.88;
        slideDistanceMultiplier = 1.25;
        playerSlipRisk = 0.09;
      } else {
        rollFrictionMultiplier = 0.985; // Drag from heavy standing moisture
        passDistanceMultiplier = 0.92;
        slideDistanceMultiplier = 1.50; // Long hydroplaning slide tackles
        playerSlipRisk = turfQuality === 'poor' ? 0.08 : 0.04;
      }
      ambientBrightness = 0.82;
      atmosphericHueOverlay = 'rgba(15, 23, 42, 0.20)'; // Heavy storm gloom
      break;

    case 'snow':
      // Dusted with snow layer, slower roll, red lines mandate, winter ball
      rollFrictionMultiplier = 0.965; // High roll friction
      passDistanceMultiplier = 0.90;
      slideDistanceMultiplier = 1.25;
      playerSlipRisk = 0.035;
      isRedLines = true;
      ballType = 'winter_orange';
      ambientBrightness = 0.96;
      atmosphericHueOverlay = 'rgba(219, 234, 254, 0.14)'; // Frosty pale tint
      break;

    case 'blizzard':
      // Heavy thick snow blanket, passes travel 30% shorter distance
      rollFrictionMultiplier = 0.940;
      passDistanceMultiplier = 0.70;
      slideDistanceMultiplier = 1.10;
      playerSlipRisk = 0.065;
      isRedLines = true;
      ballType = 'winter_yellow';
      ambientBrightness = 0.90;
      atmosphericHueOverlay = 'rgba(224, 242, 254, 0.24)'; // Heavy blizzard veil
      break;
  }

  // Season ambient hue refinement
  if (season === 'winter' && weather !== 'snow' && weather !== 'blizzard') {
    atmosphericHueOverlay = atmosphericHueOverlay || 'rgba(147, 197, 253, 0.07)';
  } else if (season === 'autumn' && (weather === 'clear' || weather === 'cloudy')) {
    atmosphericHueOverlay = atmosphericHueOverlay || 'rgba(217, 119, 6, 0.04)'; // Amber golden autumn
  }

  return {
    rollFrictionMultiplier,
    passDistanceMultiplier,
    slideDistanceMultiplier,
    playerSlipRisk,
    isRedLines,
    ballType,
    atmosphericHueOverlay,
    ambientBrightness,
  };
}

/**
 * Checks if a point is within any standing water puddle zone
 */
export function isPointInPuddle(x: number, y: number, puddles: PuddleZone[]): PuddleZone | null {
  for (let i = 0; i < puddles.length; i++) {
    const p = puddles[i];
    const dx = (x - p.x) / p.radiusX;
    const dy = (y - p.y) / p.radiusY;
    if (dx * dx + dy * dy <= 1.0) {
      return p;
    }
  }
  return null;
}

/**
 * Processes puddle interaction for the ball: violent deceleration & water splash!
 */
export function processBallPuddlePhysics(
  ball: Ball,
  puddles: PuddleZone[],
  quality: TurfQuality,
  timeScale: number = 1
): boolean {
  if (ball.z > 1.5 || ball.ownerId || puddles.length === 0) {
    ball.inPuddle = false;
    return false;
  }

  const puddle = isPointInPuddle(ball.x, ball.y, puddles);
  if (puddle) {
    ball.inPuddle = true;
    const speed = Math.hypot(ball.vx, ball.vy);
    // Heavy water resistance: ball decelerates violently or stops dead in puddle
    const brake = Math.pow(0.55 - puddle.depth * 0.25, timeScale);
    ball.vx *= brake;
    ball.vy *= brake;
    if (speed > 1.2) {
      // Water splash particles
      spawnWaterSplash(ball.x, ball.y, speed);
    }
    return true;
  }

  ball.inPuddle = false;
  return false;
}

/**
 * Processes sprinting player traction and slip risk in wet turf or puddles
 */
export function processPlayerPuddleTraction(
  player: Player,
  puddles: PuddleZone[],
  slipRisk: number,
  timeScale: number = 1
): void {
  if (player.slipTimer && player.slipTimer > 0) {
    player.slipTimer = Math.max(0, player.slipTimer - timeScale);
    // Skidding on turf while slipping
    const ang = player.slipAngle || player.facingAngle;
    player.vx = Math.cos(ang) * 1.8;
    player.vy = Math.sin(ang) * 1.8;
    return;
  }

  // Check if player is sprinting or changing directions suddenly
  const speed = Math.hypot(player.vx, player.vy);
  if (speed < 2.5) return;

  const inPuddle = isPointInPuddle(player.x, player.y, puddles);
  let effectiveRisk = slipRisk;
  if (inPuddle) {
    effectiveRisk = Math.max(effectiveRisk, 0.12 * inPuddle.depth);
  }

  // Agility and Balance mitigate slip chance
  const rawStats = player.canonicalStats as unknown as Record<string, unknown> | undefined;
  const agi = typeof rawStats?.agi === 'number' ? (rawStats.agi as number) : 70;
  const bal = typeof rawStats?.bal === 'number' ? (rawStats.bal as number) : 70;
  const balanceFactor = (200 - (agi + bal)) / 200; // Lower stats = higher factor (up to 0.75)

  if (Math.random() < effectiveRisk * balanceFactor * 0.08) {
    // Player loses traction and slips!
    player.slipTimer = 18;
    player.slipAngle = player.facingAngle;
    player.action = 'running';
    spawnWaterSplash(player.x, player.y, speed);
  }
}

/**
 * Spawns water splash particles
 */
export function spawnWaterSplash(x: number, y: number, intensity: number): void {
  const count = Math.min(8, Math.floor(intensity * 1.5) + 2);
  for (let i = 0; i < count; i++) {
    const p = findDeadWeatherParticle();
    if (!p) break;
    const ang = Math.random() * Math.PI * 2;
    const spd = 1.2 + Math.random() * intensity * 0.4;
    p.x = x + (Math.random() - 0.5) * 6;
    p.y = y + (Math.random() - 0.5) * 6;
    p.z = 0;
    p.vx = Math.cos(ang) * spd;
    p.vy = Math.sin(ang) * spd;
    p.vz = 1.5 + Math.random() * 2.2;
    p.type = 'splash';
    p.life = 0;
    p.maxLife = 12 + Math.floor(Math.random() * 6);
    p.size = 1.5 + Math.random() * 1.5;
    p.alpha = 0.85;
  }
}

/**
 * Spawns cleat water or snow spray behind sprinting or sliding player
 */
export function spawnCleatSpray(
  x: number,
  y: number,
  vx: number,
  vy: number,
  isSnow: boolean
): void {
  for (let i = 0; i < 2; i++) {
    const p = findDeadWeatherParticle();
    if (!p) break;
    p.x = x + (Math.random() - 0.5) * 8;
    p.y = y + (Math.random() - 0.5) * 8;
    p.z = 0;
    p.vx = -vx * 0.25 + (Math.random() - 0.5) * 1.2;
    p.vy = -vy * 0.25 + (Math.random() - 0.5) * 1.2;
    p.vz = 0.8 + Math.random() * 1.6;
    p.type = isSnow ? 'snow' : 'spray';
    p.life = 0;
    p.maxLife = 14 + Math.floor(Math.random() * 6);
    p.size = isSnow ? 2.2 : 1.6;
    p.alpha = isSnow ? 0.9 : 0.7;
  }
}

function findDeadWeatherParticle(): WeatherParticle | null {
  for (let i = 0; i < weatherParticlesPool.length; i++) {
    if (weatherParticlesPool[i].life >= weatherParticlesPool[i].maxLife) {
      return weatherParticlesPool[i];
    }
  }
  return null;
}

/**
 * Updates weather particle system across active camera viewport
 */
export function updateWeatherParticles(
  weather: WeatherCondition,
  viewLeft: number,
  viewTop: number,
  viewWidth: number,
  viewHeight: number,
  graphicsTier: string = 'balanced',
  timeScale: number = 1
): void {
  if (weather === 'clear' || weather === 'cloudy') {
    // Age and clear active particles
    for (let i = 0; i < weatherParticlesPool.length; i++) {
      if (weatherParticlesPool[i].life < weatherParticlesPool[i].maxLife) {
        weatherParticlesPool[i].life++;
      }
    }
    return;
  }

  const isRain = weather === 'rain' || weather === 'torrential';
  const isSnow = weather === 'snow' || weather === 'blizzard';
  const isHeavy = weather === 'torrential' || weather === 'blizzard';

  // Spawn new particles according to weather density and graphics settings
  const spawnRate = graphicsTier === 'performance' ? 4 : isHeavy ? 16 : 9;

  for (let s = 0; s < spawnRate; s++) {
    const p = findDeadWeatherParticle();
    if (!p) break;

    p.x = viewLeft + Math.random() * viewWidth;
    p.y = viewTop + Math.random() * viewHeight;
    p.z = 40 + Math.random() * 70;

    if (isRain) {
      p.type = 'rain';
      p.vx = -1.2 + (Math.random() - 0.5) * 0.4; // Angled wind slant
      p.vy = 5.5 + Math.random() * 2.5;
      p.vz = -4.5;
      p.life = 0;
      p.maxLife = 24 + Math.floor(Math.random() * 8);
      p.size = isHeavy ? 2.0 : 1.4;
      p.alpha = isHeavy ? 0.65 : 0.45;
    } else if (isSnow) {
      p.type = 'snow';
      p.vx = (Math.random() - 0.5) * 1.8 + (isHeavy ? -1.8 : 0);
      p.vy = 1.4 + Math.random() * 1.8;
      p.vz = -1.2 - Math.random() * 1.0;
      p.life = 0;
      p.maxLife = 40 + Math.floor(Math.random() * 20);
      p.size = isHeavy ? 2.8 + Math.random() * 1.8 : 2.0 + Math.random() * 1.2;
      p.alpha = isHeavy ? 0.85 : 0.70;
    }
  }

  // Update existing particles
  for (let i = 0; i < weatherParticlesPool.length; i++) {
    const p = weatherParticlesPool[i];
    if (p.life >= p.maxLife) continue;

    p.life += timeScale;
    p.x += p.vx * timeScale;
    p.y += p.vy * timeScale;
    p.z += p.vz * timeScale;

    if (p.type === 'splash' || p.type === 'spray') {
      p.vz -= 0.22 * timeScale; // Gravity
      if (p.z <= 0) {
        p.z = 0;
        p.vx *= 0.8;
        p.vy *= 0.8;
      }
    } else if (p.type === 'snow') {
      // Gentle swirling drift
      p.vx += Math.sin(Date.now() * 0.005 + p.y * 0.02) * 0.06;
    }

    if (p.z <= 0 && (p.type === 'rain' || p.type === 'snow')) {
      p.life = p.maxLife; // Hit ground
    }
  }
}

/**
 * Draws active weather particles and ground puddles
 */
export function drawWeatherAtmosphere(
  ctx: CanvasRenderingContext2D,
  weather: WeatherCondition,
  puddles: PuddleZone[],
  viewLeft: number,
  viewTop: number,
  viewWidth: number,
  viewHeight: number,
  surfaceStatus: PitchSurfaceStatus = 'normal'
): void {
  const isMuddy = surfaceStatus === 'muddy';
  // 1. Draw Puddles on Turf / Sand
  if (puddles.length > 0) {
    ctx.save();
    for (let i = 0; i < puddles.length; i++) {
      const p = puddles[i];
      if (isMuddy) {
        // Soft outer saturated silt halo
        ctx.fillStyle = 'rgba(101, 74, 41, 0.58)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.radiusX * 1.18, p.radiusY * 1.18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Deep boggy mud core
        ctx.fillStyle = 'rgba(72, 50, 26, 0.72)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.radiusX, p.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Murky puddle sheen reflection
        ctx.fillStyle = 'rgba(138, 122, 98, 0.30)';
        ctx.beginPath();
        ctx.ellipse(p.x - 3, p.y - 2, p.radiusX * 0.65, p.radiusY * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dark wet ground water ring
        ctx.fillStyle = 'rgba(15, 35, 45, 0.55)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.radiusX, p.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sky reflection highlight
        ctx.fillStyle = 'rgba(125, 175, 215, 0.28)';
        ctx.beginPath();
        ctx.ellipse(p.x - 3, p.y - 2, p.radiusX * 0.7, p.radiusY * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ripple rings
      const ripPhase = (Date.now() * 0.003 + i) % 1;
      ctx.strokeStyle = isMuddy
        ? `rgba(196, 174, 142, ${0.32 * (1 - ripPhase)})`
        : `rgba(220, 240, 255, ${0.35 * (1 - ripPhase)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.radiusX * ripPhase, p.radiusY * ripPhase, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. Snow Cover Blanket on Pitch
  if (weather === 'snow' || weather === 'blizzard') {
    ctx.save();
    const isBlizzard = weather === 'blizzard';
    // Semi-translucent white frost dusting
    ctx.fillStyle = isBlizzard ? 'rgba(240, 246, 255, 0.46)' : 'rgba(235, 245, 255, 0.22)';
    ctx.fillRect(
      PITCH_CONFIG.PITCH_LEFT,
      PITCH_CONFIG.PITCH_TOP,
      PITCH_CONFIG.FIELD_WIDTH,
      PITCH_CONFIG.FIELD_HEIGHT
    );

    // Subtle drift mounds in corners & touchlines
    ctx.fillStyle = isBlizzard ? 'rgba(255, 255, 255, 0.38)' : 'rgba(255, 255, 255, 0.18)';
    const top = PITCH_CONFIG.PITCH_TOP;
    const bottom = PITCH_CONFIG.PITCH_BOTTOM;
    const left = PITCH_CONFIG.PITCH_LEFT;
    const right = PITCH_CONFIG.PITCH_RIGHT;
    ctx.fillRect(left, top, PITCH_CONFIG.FIELD_WIDTH, 12);
    ctx.fillRect(left, bottom - 12, PITCH_CONFIG.FIELD_WIDTH, 12);
    ctx.restore();
  }

  // 3. Render Weather Particles (Rain streaks, snowflakes, splashes)
  ctx.save();
  for (let i = 0; i < weatherParticlesPool.length; i++) {
    const p = weatherParticlesPool[i];
    if (p.life >= p.maxLife) continue;

    const lifeRatio = 1 - p.life / p.maxLife;
    const alpha = p.alpha * lifeRatio;

    if (p.type === 'rain') {
      ctx.strokeStyle = `rgba(200, 225, 255, ${alpha})`;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 2.2, p.y + p.vy * 2.2);
      ctx.stroke();
    } else if (p.type === 'snow') {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'splash' || p.type === 'spray') {
      ctx.fillStyle = `rgba(215, 235, 255, ${alpha})`;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
  ctx.restore();
}

/**
 * Evaluates dynamic weather transition in second half (e.g., cloudy match starts raining or snowing)
 */
export function evaluateHalfTimeWeatherTransition(
  currentWeather: WeatherCondition,
  season: Season
): WeatherCondition {
  if (currentWeather !== 'cloudy') return currentWeather;

  const rand = Math.random();
  if (season === 'winter') {
    // 40% chance of transitioning to snow
    if (rand < 0.40) return 'snow';
  } else {
    // 45% chance of transitioning to rain
    if (rand < 0.45) return 'rain';
  }
  return currentWeather;
}
