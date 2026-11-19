/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from './constants';
import {
  GoalNetState,
  GraphicsSettings,
  TimeOfDay,
  TeamKit,
  TurfQuality,
  WeatherCondition,
  Season,
  GoalFrameType,
  NetTension,
  PuddleZone,
  PitchSurfaceStatus,
} from '../types';
import {
  StadiumDefinition,
  StreetArenaConfig,
  StreetSurfaceType,
  StreetPerimeterWallStyle,
  StreetCourtMarkings,
  StreetGoalStyle,
  StreetLightingType,
  StreetFenceCrowdMode,
  StreetUrbanProp,
} from '../types/stadium';
import { resolvePitchMetrics, ResolvedPitchMetrics } from './pitchDimensions';
import { getGoalFrameMetrics } from './goalNetPhysics';
import {
  drawWeatherAtmosphere,
  getWeatherSurfaceModifiers,
  resolvePitchSurfaceStatus,
} from './weatherEngine';
import { drawStreetFenceOnlookers } from './crowdRenderer';

export interface StreetRenderOptions {
  topNet: GoalNetState;
  bottomNet: GoalNetState;
  pitchTilt: number;
  cameraX: number;
  cameraY: number;
  viewLeft: number;
  viewTop: number;
  viewWidth: number;
  viewHeight: number;
  graphicsSettings?: GraphicsSettings;
  timeOfDay: TimeOfDay;
  homeKit: TeamKit;
  awayKit: TeamKit;
  turfQuality: TurfQuality;
  weather: WeatherCondition;
  season: Season;
  goalFrame: GoalFrameType;
  netTension: NetTension;
  puddles: PuddleZone[];
  surfaceStatus?: PitchSurfaceStatus;
  stadiumDef?: StadiumDefinition;
}

const streetPatternCache: Record<string, HTMLCanvasElement> = {};

function hash2D(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) ^ (x * y);
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) & 0xffff;
}

/**
 * Resolves effective StreetArenaConfig even if stadiumDef omits optional fields.
 */
export function resolveEffectiveStreetConfig(
  stadiumDef?: StadiumDefinition,
  turfQuality: TurfQuality = 'concrete'
): StreetArenaConfig {
  const existing = stadiumDef?.streetConfig;
  const fallbackSurface: StreetSurfaceType =
    existing?.surface ||
    stadiumDef?.streetSurface ||
    (turfQuality === 'sand' || turfQuality === 'poor' || turfQuality === 'synthetic' || turfQuality === 'concrete'
      ? turfQuality
      : 'concrete');

  return {
    archetype: existing?.archetype || 'tarmac_cage',
    surface: fallbackSurface,
    perimeterWallStyle: existing?.perimeterWallStyle || 'chainlink_cage',
    courtMarkings: existing?.courtMarkings || 'spray_paint',
    goalStyle: existing?.goalStyle || 'futsal_tubular',
    streetLighting: existing?.streetLighting || 'sodium_streetlamps',
    fenceCrowdMode: existing?.fenceCrowdMode || 'sparse_locals',
    urbanProps: existing?.urbanProps || ['parked_cars', 'graffiti_murals', 'milk_crates'],
  };
}

/**
 * Generates seamless tile pattern for the 4 Street surfaces without mowed stripes.
 */
function getStreetSurfacePattern(surface: StreetSurfaceType, isMuddy: boolean): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const key = `${surface}_${isMuddy ? 'muddy' : 'dry'}`;
  if (streetPatternCache[key]) return streetPatternCache[key];

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (surface === 'concrete') {
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 128, 128);
    // Tarmac / poured concrete slab seams
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 63, 128, 2);
    ctx.fillRect(63, 0, 2, 128);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 62, 128, 1);
    ctx.fillRect(62, 0, 1, 128);
    // Fine asphalt aggregate speckles & weathered hairline crack
    for (let y = 0; y < 128; y += 3) {
      for (let x = 0; x < 128; x += 3) {
        const h = hash2D(x, y);
        if (h % 7 === 0) {
          ctx.fillStyle = h % 2 === 0 ? 'rgba(15, 23, 42, 0.28)' : 'rgba(148, 163, 184, 0.22)';
          ctx.fillRect(x, y, 2, 1);
        }
      }
    }
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, 18);
    ctx.lineTo(28, 26);
    ctx.lineTo(36, 44);
    ctx.stroke();
  } else if (surface === 'sand') {
    ctx.fillStyle = isMuddy ? '#85653d' : '#d6b06b';
    ctx.fillRect(0, 0, 128, 128);
    // Wind-blown sand ripples (no mowed grass stripes)
    ctx.fillStyle = isMuddy ? 'rgba(62, 43, 21, 0.35)' : 'rgba(180, 134, 62, 0.35)';
    for (let y = 6; y < 128; y += 14) {
      for (let x = 0; x < 128; x += 8) {
        const wave = Math.round(Math.sin(x * 0.14 + y * 0.05) * 2);
        ctx.fillRect(x, y + wave, 7, 2);
      }
    }
    // Coarse silica / shell grit specks
    for (let y = 0; y < 128; y += 2) {
      for (let x = 0; x < 128; x += 2) {
        const h = hash2D(x + 9, y + 3);
        if (h % 9 === 0) {
          ctx.fillStyle = isMuddy
            ? 'rgba(42, 28, 12, 0.32)'
            : h % 2 === 0
            ? 'rgba(254, 240, 199, 0.38)'
            : 'rgba(120, 82, 34, 0.28)';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  } else if (surface === 'poor') {
    // Potrero dusty bare earth + scuffed crabgrass tufts
    ctx.fillStyle = '#785734';
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 4) {
      for (let x = 0; x < 128; x += 4) {
        const h = hash2D(x * 3, y * 5);
        if (h % 11 === 0) {
          ctx.fillStyle = 'rgba(77, 102, 42, 0.42)';
          ctx.fillRect(x, y, 5, 3);
        } else if (h % 7 === 0) {
          ctx.fillStyle = 'rgba(68, 42, 20, 0.36)';
          ctx.fillRect(x, y, 3, 2);
        }
      }
    }
  } else {
    // 'synthetic': dark rubber-crumb caged astro-mat (zero mowed grass stripes)
    ctx.fillStyle = '#1b5e36';
    ctx.fillRect(0, 0, 128, 128);
    // Faint Velcro roll seam
    ctx.fillStyle = 'rgba(9, 44, 24, 0.45)';
    ctx.fillRect(0, 63, 128, 1);
    // Dark rubber-crumb infill dots
    for (let y = 0; y < 128; y += 3) {
      for (let x = 0; x < 128; x += 3) {
        const h = hash2D(x + 17, y + 29);
        if (h % 6 === 0) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
          ctx.fillRect(x, y, 1, 1);
        } else if (h % 13 === 0) {
          ctx.fillStyle = 'rgba(74, 222, 128, 0.20)';
          ctx.fillRect(x, y, 2, 1);
        }
      }
    }
  }

  streetPatternCache[key] = canvas;
  return canvas;
}

/**
 * 1. Close-cropped urban neighborhood surrounding ground (Zero stadium concourse or grandstands)
 */
function drawStreetNeighborhoodGround(
  ctx: CanvasRenderingContext2D,
  metrics: ResolvedPitchMetrics,
  config: StreetArenaConfig,
  timeOfDay: TimeOfDay
) {
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  const outerL = metrics.pitchLeft - 520;
  const outerT = metrics.pitchTop - 460;
  const outerW = metrics.fieldWidth + 1040;
  const outerH = metrics.fieldHeight + 920;

  // Base surrounding ground by archetype
  let groundColor = isNight ? '#111827' : isSunset ? '#27272a' : '#334155';
  if (config.archetype === 'coastal_boardwalk') {
    groundColor = isNight ? '#1e293b' : isSunset ? '#78350f' : '#c29b61';
  } else if (config.archetype === 'desert_sand_lot') {
    groundColor = isNight ? '#261e16' : isSunset ? '#7c4a21' : '#b8894c';
  } else if (config.archetype === 'potrero_dirt') {
    groundColor = isNight ? '#1c1917' : isSunset ? '#3f2e22' : '#574231';
  }

  ctx.fillStyle = groundColor;
  ctx.fillRect(outerL, outerT, outerW, outerH);

  // Coastal boardwalk ocean strip or adjacent urban sidewalk apron
  const apronPad = 56;
  const curbL = metrics.pitchLeft - apronPad;
  const curbT = metrics.pitchTop - apronPad;
  const curbW = metrics.fieldWidth + apronPad * 2;
  const curbH = metrics.fieldHeight + apronPad * 2;

  if (config.archetype === 'coastal_boardwalk') {
    // Ocean waves along North horizon edge
    ctx.fillStyle = isNight ? '#0c4a6e' : isSunset ? '#0369a1' : '#0284c7';
    ctx.fillRect(outerL, outerT, outerW, 240);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(outerL, outerT + 234, outerW, 5);
    // Timber deck apron surrounding court
    ctx.fillStyle = isNight ? '#422006' : '#78350f';
    ctx.fillRect(curbL, curbT, curbW, curbH);
  } else {
    // Neighborhood concrete sidewalk / curb slab tight around court walls
    ctx.fillStyle = isNight ? '#1f2937' : '#64748b';
    ctx.fillRect(curbL, curbT, curbW, curbH);
    ctx.strokeStyle = isNight ? '#0f172a' : '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(curbL, curbT, curbW, curbH);
  }

  // Tightly framing urban apartment rooftops / favela walls / alley curbs along North/West/East edges
  if (config.archetype === 'favela_quadra' || config.archetype === 'courtyard_paving' || config.archetype === 'tarmac_cage') {
    const wallTopY = metrics.pitchTop - 165;
    const roofColors = isNight
      ? ['#1e293b', '#27272a', '#1e1b4b', '#292524']
      : ['#9a3412', '#475569', '#b45309', '#3f6212'];
    let bx = metrics.pitchLeft - 240;
    let idx = 0;
    while (bx < metrics.pitchRight + 240) {
      const bw = 96 + ((idx * 37) % 64);
      const bh = 86 + ((idx * 19) % 28);
      ctx.fillStyle = roofColors[idx % roofColors.length];
      ctx.fillRect(bx, wallTopY - bh, bw - 4, bh);
      // Warm apartment windows
      ctx.fillStyle = isNight ? 'rgba(253, 224, 71, 0.72)' : 'rgba(226, 232, 240, 0.45)';
      for (let wx = bx + 12; wx < bx + bw - 20; wx += 22) {
        ctx.fillRect(wx, wallTopY - bh + 18, 10, 12);
        ctx.fillRect(wx, wallTopY - bh + 44, 10, 12);
      }
      // Side asphalt street lane divider
      bx += bw;
      idx++;
    }
  }
}

/**
 * 2. Street Court Surface (No mowed grass stripes!)
 */
function drawStreetCourtSurface(
  ctx: CanvasRenderingContext2D,
  metrics: ResolvedPitchMetrics,
  config: StreetArenaConfig,
  surfaceStatus: PitchSurfaceStatus
) {
  const { pitchLeft: left, pitchTop: top, fieldWidth: w, fieldHeight: h } = metrics;
  const isMuddy = surfaceStatus === 'muddy';
  const patCanvas = getStreetSurfacePattern(config.surface, isMuddy);
  const pattern = patCanvas ? ctx.createPattern(patCanvas, 'repeat') : null;

  if (pattern) {
    ctx.fillStyle = pattern;
  } else {
    ctx.fillStyle =
      config.surface === 'concrete'
        ? '#475569'
        : config.surface === 'sand'
        ? '#d6b06b'
        : config.surface === 'poor'
        ? '#785734'
        : '#1b5e36';
  }
  ctx.fillRect(left, top, w, h);

  // Wet or Muddy surface gloss / boggy discoloration
  if (isMuddy) {
    ctx.fillStyle = 'rgba(74, 52, 26, 0.34)';
    ctx.fillRect(left, top, w, h);
    // Mud churn pockets in front of both goals and midfield
    ctx.fillStyle = 'rgba(58, 40, 18, 0.48)';
    ctx.beginPath();
    ctx.ellipse(metrics.centerX, top + 34, 48, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(metrics.centerX, metrics.pitchBottom - 34, 48, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(metrics.centerX, metrics.centerY, 44, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (surfaceStatus === 'wet') {
    ctx.fillStyle = 'rgba(148, 210, 255, 0.10)';
    ctx.fillRect(left, top, w, h);
  }
}

/**
 * 3. Street Court Markings scaled to 7v7 Street dimensions
 */
function drawStreetCourtMarkings(
  ctx: CanvasRenderingContext2D,
  metrics: ResolvedPitchMetrics,
  style: StreetCourtMarkings,
  isRedLines: boolean
) {
  const {
    pitchLeft: left,
    pitchRight: right,
    pitchTop: top,
    pitchBottom: bottom,
    fieldWidth: w,
    fieldHeight: h,
    centerX: cx,
    centerY: cy,
    centerCircleRadius: cRad,
    penaltyBoxWidth: penW,
    penaltyBoxHeight: penH,
  } = metrics;

  ctx.save();

  // Optional multisport basketball/handball crossover lines painted faintly under football lines
  if (style === 'multisport_crossover') {
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.42)';
    ctx.lineWidth = 2;
    ctx.strokeRect(left + 12, top + 12, w - 24, h - 24);
    // Faint basketball key & 3-pt arcs at top/bottom
    ctx.beginPath();
    ctx.arc(cx, top + 12, Math.min(w * 0.28, penW * 0.52), 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, bottom - 12, Math.min(w * 0.28, penW * 0.52), Math.PI + 0.15, Math.PI * 2 - 0.15);
    ctx.stroke();
  }

  let lineColor = '#f8fafc';
  let lineWidth = 2.5;
  if (isRedLines) {
    lineColor = '#ef4444';
  } else if (style === 'spray_paint') {
    lineColor = '#facc15';
    lineWidth = 2.5;
  } else if (style === 'chalk_dust') {
    lineColor = 'rgba(248, 250, 252, 0.78)';
    ctx.setLineDash([7, 3]);
    lineWidth = 2.2;
  } else if (style === 'faded_tarmac') {
    lineColor = 'rgba(226, 232, 240, 0.45)';
    lineWidth = 2;
  } else if (style === 'multisport_crossover') {
    lineColor = '#ffffff';
    lineWidth = 2.5;
  }

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;

  // Touchlines / Endlines & Halfway Line
  ctx.strokeRect(left, top, w, h);
  ctx.beginPath();
  ctx.moveTo(left, cy);
  ctx.lineTo(right, cy);
  ctx.stroke();

  // Center circle & X-mark kickoff spot
  ctx.beginPath();
  ctx.arc(cx, cy, cRad, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 5);
  ctx.lineTo(cx + 5, cy + 5);
  ctx.moveTo(cx + 5, cy - 5);
  ctx.lineTo(cx - 5, cy + 5);
  ctx.stroke();

  // Top & Bottom Street Penalty Arcs / Boxes
  ctx.strokeRect(cx - penW / 2, top, penW, penH);
  ctx.strokeRect(cx - penW / 2, bottom - penH, penW, penH);

  // Corner arcs
  const cr = metrics.cornerArcRadius;
  ctx.beginPath();
  ctx.arc(left, top, cr, 0, Math.PI / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(right, top, cr, Math.PI / 2, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(left, bottom, cr, -Math.PI / 2, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(right, bottom, cr, Math.PI, -Math.PI / 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * 4. Tight Perimeter Rebound Walls flush with 7v7 touchlines & endlines
 */
function drawStreetPerimeterWalls(
  ctx: CanvasRenderingContext2D,
  metrics: ResolvedPitchMetrics,
  wallStyle: StreetPerimeterWallStyle
) {
  const { pitchLeft: left, pitchRight: right, pitchTop: top, pitchBottom: bottom, centerX: cx } = metrics;
  const goalHalfW = PITCH_CONFIG.GOAL_WIDTH / 2;
  const goalLeft = cx - goalHalfW;
  const goalRight = cx + goalHalfW;

  ctx.save();

  const drawWallSegment = (x1: number, y1: number, x2: number, y2: number, vertical: boolean) => {
    const thickness = wallStyle === 'chainlink_cage' ? 4 : wallStyle === 'timber_seawall' ? 7 : 6;

    if (wallStyle === 'chainlink_cage') {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Diamond fence cross-wires
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (wallStyle === 'graffiti_brick') {
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = thickness + 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Graffiti spray accents along brick barrier
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 18]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (wallStyle === 'corrugated_iron') {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (wallStyle === 'timber_seawall') {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else {
      // 'concrete_curb_wall'
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Fence / barrier anchor posts every ~65px
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(2, Math.floor(dist / 65));
    ctx.fillStyle = wallStyle === 'timber_seawall' ? '#451a03' : '#1e293b';
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      ctx.fillRect(px - (vertical ? 3 : 2.5), py - (vertical ? 2.5 : 3), 6, 6);
    }
  };

  // West & East full touchline rebound walls flush at court border
  drawWallSegment(left - 2, top - 2, left - 2, bottom + 2, true);
  drawWallSegment(right + 2, top - 2, right + 2, bottom + 2, true);

  // North & South endline rebound walls flanking the exact 7v7 goal mouths
  drawWallSegment(left - 2, top - 2, goalLeft, top - 2, false);
  drawWallSegment(goalRight, top - 2, right + 2, top - 2, false);

  drawWallSegment(left - 2, bottom + 2, goalLeft, bottom + 2, false);
  drawWallSegment(goalRight, bottom + 2, right + 2, bottom + 2, false);

  ctx.restore();
}

/**
 * 5. Street Goal Frames scaled cleanly to 148px width & live physics depth/height
 */
function drawStreetGoals(
  ctx: CanvasRenderingContext2D,
  isTop: boolean,
  net: GoalNetState,
  goalStyle: StreetGoalStyle,
  goalFrame: GoalFrameType
) {
  const cx = PITCH_CONFIG.CENTER_X;
  const w = PITCH_CONFIG.GOAL_WIDTH;
  const halfW = w / 2;
  const leftX = cx - halfW;
  const rightX = cx + halfW;
  const goalLineY = isTop ? PITCH_CONFIG.PITCH_TOP : PITCH_CONFIG.PITCH_BOTTOM;
  const metrics = getGoalFrameMetrics(goalFrame);
  const depth = metrics.depth;
  const h = PITCH_CONFIG.GOAL_CROSSBAR_HEIGHT;
  const dir = isTop ? -1 : 1;
  const backY = goalLineY + dir * depth;
  const crossbarY = goalLineY - h;

  const bulge = net.bulgeAmount || 0;
  const wave = Math.sin(Date.now() * 0.015) * (net.shake || 0) * 0.4;

  ctx.save();

  // Interior goal shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(leftX, Math.min(goalLineY, backY), w, Math.abs(depth));

  if (goalStyle === 'painted_wall_posts') {
    // Boldly painted end-wall posts + overhead steel bar
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(leftX, goalLineY);
    ctx.lineTo(leftX, crossbarY);
    ctx.lineTo(rightX, crossbarY);
    ctx.lineTo(rightX, goalLineY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    for (let sx = leftX + 10; sx < rightX; sx += 12) {
      ctx.beginPath();
      ctx.moveTo(sx, crossbarY);
      ctx.lineTo(sx, goalLineY + dir * bulge * 0.25);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Net mesh for tubular, chain-link, or crates_and_pipes
  const isChain = goalStyle === 'chain_net_park';
  ctx.strokeStyle = isChain ? 'rgba(148, 163, 184, 0.78)' : 'rgba(241, 245, 249, 0.80)';
  ctx.lineWidth = isChain ? 1.4 : 1;
  const meshSteps = 14;
  for (let i = 0; i <= meshSteps; i++) {
    const gx = leftX + (i / meshSteps) * w;
    const bulgeShift = dir * bulge * 0.55 + wave * 0.3;
    ctx.beginPath();
    ctx.moveTo(gx, crossbarY);
    ctx.lineTo(gx, backY + bulgeShift);
    ctx.stroke();
  }
  for (let j = 0; j <= 4; j++) {
    const gy = crossbarY + (j / 4) * (backY - crossbarY);
    ctx.beginPath();
    ctx.moveTo(leftX, gy);
    ctx.lineTo(rightX, gy);
    ctx.stroke();
  }

  if (goalStyle === 'crates_and_pipes') {
    // Stacked plastic milk crates as post bases + salvaged galvanized pipe frame
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(leftX - 5, goalLineY - 6, 10, 10);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(rightX - 5, goalLineY - 6, 10, 10);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leftX, goalLineY);
    ctx.lineTo(leftX, crossbarY);
    ctx.lineTo(rightX, crossbarY);
    ctx.lineTo(rightX, goalLineY);
    ctx.stroke();
  } else if (goalStyle === 'futsal_tubular') {
    // Iconic candy-striped futsal tubular goalposts
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(leftX, goalLineY);
    ctx.lineTo(leftX, crossbarY);
    ctx.lineTo(rightX, crossbarY);
    ctx.lineTo(rightX, goalLineY);
    ctx.stroke();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(leftX, goalLineY);
    ctx.lineTo(leftX, crossbarY);
    ctx.lineTo(rightX, crossbarY);
    ctx.lineTo(rightX, goalLineY);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // 'chain_net_park': Heavy matte galvanized park steel frame
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(leftX, goalLineY);
    ctx.lineTo(leftX, crossbarY);
    ctx.lineTo(rightX, crossbarY);
    ctx.lineTo(rightX, goalLineY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 6. Zero-Stadium Neighborhood Props outside the rebound cage
 */
function drawStreetNeighborhoodProps(
  ctx: CanvasRenderingContext2D,
  metrics: ResolvedPitchMetrics,
  props: StreetUrbanProp[],
  timeOfDay: TimeOfDay
) {
  const { pitchLeft: left, pitchRight: right, pitchTop: top, pitchBottom: bottom, centerY: cy } = metrics;
  const isNight = timeOfDay === 'night';

  ctx.save();

  if (props.includes('parked_cars')) {
    const cars = [
      { x: left - 44, y: cy - 110, color: '#dc2626' },
      { x: left - 44, y: cy + 50, color: '#2563eb' },
      { x: right + 22, y: cy - 70, color: '#eab308' },
    ];
    for (const c of cars) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(c.x + 2, c.y + 2, 22, 40);
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x, c.y, 22, 38);
      // Windshield & rear glass
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(c.x + 3, c.y + 8, 16, 7);
      ctx.fillRect(c.x + 3, c.y + 24, 16, 6);
      if (isNight) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.fillRect(c.x + 2, c.y - 2, 4, 2);
        ctx.fillRect(c.x + 16, c.y - 2, 4, 2);
      }
    }
  }

  if (props.includes('scooters')) {
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(left - 28, bottom - 40, 10, 18);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(left - 25, bottom - 44, 4, 6);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(right + 16, top + 28, 10, 18);
  }

  if (props.includes('milk_crates')) {
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(left - 22, cy - 16, 10, 10);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(left - 22, cy - 2, 10, 10);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(right + 12, cy + 16, 10, 10);
  }

  if (props.includes('graffiti_murals')) {
    // Painted mural blocks above north end wall
    const tagColors = ['#ec4899', '#22d3ee', '#facc15', '#a855f7'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = tagColors[i];
      ctx.fillRect(left + 20 + i * 75, top - 20, 42, 6);
    }
  }

  if (props.includes('laundry_lines')) {
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left - 30, top - 28);
    ctx.lineTo(left + 90, top - 44);
    ctx.stroke();
    const shirts = ['#f8fafc', '#ef4444', '#38bdf8', '#facc15'];
    for (let i = 0; i < shirts.length; i++) {
      ctx.fillStyle = shirts[i];
      ctx.fillRect(left - 12 + i * 24, top - 34 - i * 3, 9, 10);
    }
  }

  if (props.includes('corner_kiosk')) {
    const kx = right + 14;
    const ky = top - 26;
    ctx.fillStyle = isNight ? '#312e81' : '#b45309';
    ctx.fillRect(kx, ky, 36, 28);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(kx, ky, 36, 6);
    if (isNight) {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.fillRect(kx - 4, ky + 28, 44, 14);
    }
  }

  ctx.restore();
}

/**
 * 7. Street-Specific Lighting Atmosphere (Zero 4-Pylon Pro Stadium Floodlights)
 */
function drawStreetLightingAtmosphere(
  ctx: CanvasRenderingContext2D,
  metrics: ResolvedPitchMetrics,
  lighting: StreetLightingType,
  timeOfDay: TimeOfDay
) {
  ctx.save();
  const boundsL = metrics.pitchLeft - 220;
  const boundsT = metrics.pitchTop - 220;
  const boundsW = metrics.fieldWidth + 440;
  const boundsH = metrics.fieldHeight + 440;

  if (timeOfDay === 'sunset') {
    ctx.fillStyle = 'rgba(251, 146, 60, 0.14)';
    ctx.fillRect(boundsL, boundsT, boundsW, boundsH);
  } else if (timeOfDay === 'dawn') {
    ctx.fillStyle = 'rgba(253, 164, 175, 0.10)';
    ctx.fillRect(boundsL, boundsT, boundsW, boundsH);
  } else if (timeOfDay === 'night') {
    ctx.fillStyle = 'rgba(10, 15, 32, 0.30)';
    ctx.fillRect(boundsL, boundsT, boundsW, boundsH);
  }

  if (lighting === 'daylight_only' || timeOfDay === 'noon') {
    ctx.restore();
    return;
  }

  if (lighting === 'sodium_streetlamps') {
    const poles = [
      { x: metrics.pitchLeft - 22, y: metrics.pitchTop + 30 },
      { x: metrics.pitchRight + 22, y: metrics.pitchBottom - 30 },
    ];
    for (const pole of poles) {
      const grad = ctx.createRadialGradient(pole.x, pole.y, 10, pole.x, pole.y, 240);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.32)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pole.x, pole.y, 240, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.fillRect(pole.x - 3, pole.y - 3, 6, 6);
    }
  } else if (lighting === 'festoon_string_lights') {
    const bulbsY = [metrics.pitchTop + 12, metrics.centerY, metrics.pitchBottom - 12];
    for (const by of bulbsY) {
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(metrics.pitchLeft - 8, by);
      ctx.lineTo(metrics.pitchRight + 8, by);
      ctx.stroke();
      for (let bx = metrics.pitchLeft + 24; bx < metrics.pitchRight - 10; bx += 56) {
        const bulbGrad = ctx.createRadialGradient(bx, by, 2, bx, by, 34);
        bulbGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        bulbGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = bulbGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 34, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (lighting === 'single_flood_pole') {
    const px = metrics.pitchLeft - 24;
    const py = metrics.centerY - 40;
    const spot = ctx.createRadialGradient(px, py, 16, metrics.centerX, metrics.centerY, metrics.fieldHeight * 0.72);
    spot.addColorStop(0, 'rgba(224, 242, 254, 0.30)');
    spot.addColorStop(0.55, 'rgba(186, 230, 253, 0.12)');
    spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spot;
    ctx.fillRect(boundsL, boundsT, boundsW, boundsH);
  }

  ctx.restore();
}

/**
 * Master Street Mode Arena Renderer.
 * Replaces stadium stands, floodlight pylons, and running tracks with a tight 7v7 urban world.
 */
export function drawStreetArena(
  ctx: CanvasRenderingContext2D,
  options: StreetRenderOptions
): void {
  const {
    topNet,
    bottomNet,
    viewLeft,
    viewTop,
    viewWidth,
    viewHeight,
    graphicsSettings,
    timeOfDay,
    homeKit,
    awayKit,
    turfQuality,
    weather,
    season,
    goalFrame,
    puddles,
    surfaceStatus,
    stadiumDef,
  } = options;

  const metrics = resolvePitchMetrics(
    {
      matchMode: 'street',
      preset: stadiumDef?.pitchPreset || 'balanced',
      lengthMeters: stadiumDef?.pitchLengthMeters,
      widthMeters: stadiumDef?.pitchWidthMeters,
    },
    'street'
  );

  const config = resolveEffectiveStreetConfig(stadiumDef, turfQuality);
  const weatherMods = getWeatherSurfaceModifiers(weather, season, turfQuality);
  const effectiveSurfaceStatus = surfaceStatus || resolvePitchSurfaceStatus(weather, turfQuality);

  // 1. Neighborhood Surroundings (Alley / Courtyard / Boardwalk / Curb)
  drawStreetNeighborhoodGround(ctx, metrics, config, timeOfDay);

  // 2. Street Court Surface (Concrete / Sand / Poor Earth / Synthetic Mat — Zero mowed stripes)
  drawStreetCourtSurface(ctx, metrics, config, effectiveSurfaceStatus);

  // 3. Street Court Markings (Spray Paint / Chalk / Multisport Crossover / Faded Tarmac)
  drawStreetCourtMarkings(ctx, metrics, config.courtMarkings, weatherMods.isRedLines);

  // 4. Tight 7v7 Perimeter Rebound Walls
  drawStreetPerimeterWalls(ctx, metrics, config.perimeterWallStyle);

  // 5. Urban Props (Parked Cars / Laundry Lines / Milk Crates / Graffiti / Kiosk / Scooters)
  drawStreetNeighborhoodProps(ctx, metrics, config.urbanProps, timeOfDay);

  // 6. Casual Street Fence Onlookers (Zero grandstands!)
  drawStreetFenceOnlookers(
    ctx,
    config.fenceCrowdMode as StreetFenceCrowdMode,
    homeKit || HOME_KIT,
    awayKit || AWAY_KIT,
    metrics,
    timeOfDay,
    graphicsSettings
  );

  // 7. Weather Puddles & Precipitation (including 'muddy' sand bog puddles)
  drawWeatherAtmosphere(
    ctx,
    weather,
    puddles,
    viewLeft,
    viewTop,
    viewWidth,
    viewHeight,
    effectiveSurfaceStatus
  );

  // 8. 7v7 Street Goal Frames (scaled to 148px Street goal width)
  drawStreetGoals(ctx, true, topNet, config.goalStyle, goalFrame);
  drawStreetGoals(ctx, false, bottomNet, config.goalStyle, goalFrame);

  // 9. Street Atmospheric Hue & Sodium/Festoon/Single-Pole Lighting
  if (weatherMods.atmosphericHueOverlay) {
    ctx.fillStyle = weatherMods.atmosphericHueOverlay;
    ctx.fillRect(
      metrics.pitchLeft - 220,
      metrics.pitchTop - 220,
      metrics.fieldWidth + 440,
      metrics.fieldHeight + 440
    );
  }
  drawStreetLightingAtmosphere(ctx, metrics, config.streetLighting, timeOfDay);
}
