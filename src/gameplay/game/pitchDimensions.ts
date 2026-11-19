/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FootballMatchMode, PitchDimensionPreset, PitchDimensionConfig } from '../types';
import { PITCH_CONFIG } from './constants';

/**
 * Standard IFAB Law 1 Pitch Dimension Presets
 * Compact: 100m × 64m (IFAB Legal Minimum ground)
 * Standard / Balanced: 105m × 68m (FIFA & UEFA Benchmark)
 * Expansive: 110m × 74m (IFAB Legal Maximum ground, e.g. Camp Nou)
 */
export const PITCH_DIMENSION_PRESETS: Record<
  'compact' | 'standard' | 'balanced' | 'expansive',
  {
    name: string;
    lengthMeters: number;
    widthMeters: number;
    description: string;
    tacticalSummary: string;
    staminaDrainMultiplier: number;
    spaceHalfSpaceMultiplier: number;
    pressingTrapMultiplier: number;
  }
> = {
  compact: {
    name: 'Compact / Direct Ground (100m × 64m)',
    lengthMeters: 100,
    widthMeters: 64,
    description: 'IFAB Legal Minimum ground. Compresses midfield channels and passing avenues.',
    tacticalSummary: 'Favors low blocks, aggressive gegenpressing, and direct aerial long balls.',
    staminaDrainMultiplier: 0.90,
    spaceHalfSpaceMultiplier: 0.82,
    pressingTrapMultiplier: 1.25,
  },
  standard: {
    name: 'Standard / WFA Benchmark (105m × 68m)',
    lengthMeters: 105,
    widthMeters: 68,
    description: 'Standard international tournament & European Winners League specification.',
    tacticalSummary: 'Symmetrical spacing for both wide wingers and central possession triangles.',
    staminaDrainMultiplier: 1.0,
    spaceHalfSpaceMultiplier: 1.0,
    pressingTrapMultiplier: 1.0,
  },
  balanced: {
    name: 'Standard / WFA Benchmark (105m × 68m)',
    lengthMeters: 105,
    widthMeters: 68,
    description: 'Standard international tournament & European Winners League specification.',
    tacticalSummary: 'Symmetrical spacing for both wide wingers and central possession triangles.',
    staminaDrainMultiplier: 1.0,
    spaceHalfSpaceMultiplier: 1.0,
    pressingTrapMultiplier: 1.0,
  },
  expansive: {
    name: 'Expansive Cathedral (110m × 74m)',
    lengthMeters: 110,
    widthMeters: 74,
    description: 'IFAB Legal Maximum ground (e.g., Camp Nou). Hugely stretched half-spaces.',
    tacticalSummary: 'Favors tiki-taka possession, switches to wingers, and stretching low defensive blocks.',
    staminaDrainMultiplier: 1.15,
    spaceHalfSpaceMultiplier: 1.22,
    pressingTrapMultiplier: 0.82,
  },
};

export const MIN_LEGAL_METERS_WIDTH = 64;   // Compact minimum width
export const MAX_LEGAL_METERS_WIDTH = 74;   // Expansive maximum width
export const MIN_LEGAL_METERS_LENGTH = 100; // Compact minimum length
export const MAX_LEGAL_METERS_LENGTH = 110; // Expansive maximum length

export interface ModePitchBounds {
  minLength: number;
  maxLength: number;
  defaultLength: number;
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  goalWidthPx: number;
  crossbarHeightPx: number;
  goalDepthPx: number;
}

export const MODE_PITCH_BOUNDS: Record<FootballMatchMode, ModePitchBounds> = {
  pro: {
    minLength: MIN_LEGAL_METERS_LENGTH,
    maxLength: MAX_LEGAL_METERS_LENGTH,
    defaultLength: 105,
    minWidth: MIN_LEGAL_METERS_WIDTH,
    maxWidth: MAX_LEGAL_METERS_WIDTH,
    defaultWidth: 68,
    goalWidthPx: 220,
    crossbarHeightPx: 65,
    goalDepthPx: 60,
  },
  youth: {
    minLength: 84,
    maxLength: 94,
    defaultLength: 90,
    minWidth: 52,
    maxWidth: 60,
    defaultWidth: 58,
    goalWidthPx: 192,
    crossbarHeightPx: 56,
    goalDepthPx: 52,
  },
  street: {
    minLength: 42,
    maxLength: 52,
    defaultLength: 46,
    minWidth: 24,
    maxWidth: 32,
    defaultWidth: 28,
    goalWidthPx: 148,
    crossbarHeightPx: 46,
    goalDepthPx: 40,
  },
};

// Infill area is strictly fixed: Maximum pitch possible (110m × 74m) plus 1 meter in every direction
export const INFILL_SAFETY_MARGIN_METERS = 1;
export const INFILL_METERS_WIDTH = MAX_LEGAL_METERS_WIDTH + INFILL_SAFETY_MARGIN_METERS * 2;   // 76m
export const INFILL_METERS_LENGTH = MAX_LEGAL_METERS_LENGTH + INFILL_SAFETY_MARGIN_METERS * 2; // 112m

export const MAX_PITCH_TURF_WIDTH = 1500;
export const MAX_PITCH_TURF_HEIGHT = 2500;

export type PitchResolutionInput =
  Partial<PitchDimensionConfig> & {
    pitchDimensions?: PitchDimensionPreset;
    matchMode?: FootballMatchMode;
  };

/**
 * Converts real-world pitch dimensions (meters) into pixel coordinates
 * Baseline benchmark: 74m × 110m (max pitch) maps to 1500px × 2500px
 * Infill area: 76m × 112m (max pitch + 1m in every direction)
 */
export interface ResolvedPitchMetrics {
  matchMode: FootballMatchMode;
  preset: PitchDimensionPreset;
  lengthMeters: number;
  widthMeters: number;
  turfWidth: number;
  turfHeight: number;
  fieldWidth: number;
  fieldHeight: number;
  marginX: number;
  marginTop: number;
  marginBottom: number;
  totalWidth: number;
  totalHeight: number;
  pitchLeft: number;
  pitchRight: number;
  pitchTop: number;
  pitchBottom: number;
  turfLeft: number;
  turfRight: number;
  turfTop: number;
  turfBottom: number;
  lineOffsetX: number;
  lineOffsetY: number;
  centerX: number;
  centerY: number;
  // Goal Dimensions
  goalWidthPx: number;
  crossbarHeightPx: number;
  goalDepthPx: number;
  // Infill Area Metrics (Max pitch possible + 1m in every direction)
  infillWidthMeters: number;  // 76m
  infillLengthMeters: number; // 112m
  infillWidth: number;        // ~1541px
  infillHeight: number;       // ~2545px
  infillLeft: number;         // ~160px
  infillRight: number;        // ~1701px
  infillTop: number;          // ~197px
  infillBottom: number;       // ~2742px
  marginToInfillMetersX: number; // (76 - widthMeters) / 2 (min 1.0m)
  marginToInfillMetersY: number; // (112 - lengthMeters) / 2 (min 1.0m)
  // Markings
  penaltyBoxWidth: number;
  penaltyBoxHeight: number;
  sixYardBoxWidth: number;
  sixYardBoxHeight: number;
  centerCircleRadius: number;
  penaltySpotDist: number;
  cornerArcRadius: number;
  // Tactical Modifiers
  staminaMultiplier: number;
  spaceMultiplier: number;
}

export function resolvePitchMetrics(
  config?: PitchResolutionInput,
  matchMode?: FootballMatchMode
): ResolvedPitchMetrics {
  const effectiveMode: FootballMatchMode = matchMode || config?.matchMode || 'pro';
  const bounds = MODE_PITCH_BOUNDS[effectiveMode] || MODE_PITCH_BOUNDS.pro;
  const preset = config?.preset || config?.pitchDimensions || 'standard';

  let lengthMeters = bounds.defaultLength;
  let widthMeters = bounds.defaultWidth;

  const hasExplicitMeters =
    config?.lengthMeters !== undefined || config?.widthMeters !== undefined;

  if (preset === 'custom' || (effectiveMode !== 'pro' && !config?.preset && !config?.pitchDimensions && hasExplicitMeters)) {
    lengthMeters = Math.max(
      bounds.minLength,
      Math.min(bounds.maxLength, Math.round(config?.lengthMeters ?? bounds.defaultLength))
    );
    widthMeters = Math.max(
      bounds.minWidth,
      Math.min(bounds.maxWidth, Math.round(config?.widthMeters ?? bounds.defaultWidth))
    );
  } else if (preset === 'compact') {
    lengthMeters = bounds.minLength;
    widthMeters = bounds.minWidth;
  } else if (preset === 'expansive') {
    lengthMeters = bounds.maxLength;
    widthMeters = bounds.maxWidth;
  } else {
    // standard / balanced
    lengthMeters = bounds.defaultLength;
    widthMeters = bounds.defaultWidth;
  }

  // Canonical coordinate scale: 74m x 110m (expansive max pitch) maps to 1500px x 2500px
  const pxPerMeterX = MAX_PITCH_TURF_WIDTH / MAX_LEGAL_METERS_WIDTH;
  const pxPerMeterY = MAX_PITCH_TURF_HEIGHT / MAX_LEGAL_METERS_LENGTH;

  const marginX = 180;
  const marginTop = 220;
  const marginBottom = 200;

  const centerX = marginX + MAX_PITCH_TURF_WIDTH / 2; // 930
  const centerY = marginTop + MAX_PITCH_TURF_HEIGHT / 2; // 1470

  // The infill area is fixed to the maximum pitch possible plus 1 meter in every direction
  const infillWidth = Math.round(INFILL_METERS_WIDTH * pxPerMeterX);   // ~1541px
  const infillHeight = Math.round(INFILL_METERS_LENGTH * pxPerMeterY); // ~2545px
  const infillLeft = Math.round(centerX - infillWidth / 2);            // ~160px
  const infillRight = infillLeft + infillWidth;                       // ~1701px
  const infillTop = Math.round(centerY - infillHeight / 2);            // ~197px
  const infillBottom = infillTop + infillHeight;                      // ~2742px

  // Pitch field dimensions strictly centered inside the infill area
  const fieldWidth = Math.round(widthMeters * pxPerMeterX);
  const fieldHeight = Math.round(lengthMeters * pxPerMeterY);

  const pitchLeft = Math.round(centerX - fieldWidth / 2);
  const pitchRight = pitchLeft + fieldWidth;
  const pitchTop = Math.round(centerY - fieldHeight / 2);
  const pitchBottom = pitchTop + fieldHeight;

  // Margin to infill area boundary in meters (at least 1 meter in every direction)
  const marginToInfillMetersX = (INFILL_METERS_WIDTH - widthMeters) / 2;
  const marginToInfillMetersY = (INFILL_METERS_LENGTH - lengthMeters) / 2;

  // Total canvas boundaries
  const totalWidth = MAX_PITCH_TURF_WIDTH + marginX * 2;
  const totalHeight = MAX_PITCH_TURF_HEIGHT + marginTop + marginBottom;

  const turfLeft = marginX;
  const turfRight = marginX + MAX_PITCH_TURF_WIDTH;
  const turfTop = marginTop;
  const turfBottom = marginTop + MAX_PITCH_TURF_HEIGHT;

  const lineOffsetX = Math.max(0, Math.round((MAX_PITCH_TURF_WIDTH - fieldWidth) / 2));
  const lineOffsetY = Math.max(0, Math.round((MAX_PITCH_TURF_HEIGHT - fieldHeight) / 2));

  // Markings scale: Pro uses canonical IFAB boxes; Youth & Street scale boxes proportionally to pitch dimensions
  const boxScaleX = effectiveMode === 'pro' ? 1 : widthMeters / 68;
  const boxScaleY = effectiveMode === 'pro' ? 1 : lengthMeters / 105;

  const penaltyBoxWidth = Math.round(40.32 * pxPerMeterX * boxScaleX);
  const penaltyBoxHeight = Math.round(16.5 * pxPerMeterY * boxScaleY);
  const sixYardBoxWidth = Math.round(18.32 * pxPerMeterX * boxScaleX);
  const sixYardBoxHeight = Math.round(5.5 * pxPerMeterY * boxScaleY);
  const centerCircleRadius = Math.round(9.15 * pxPerMeterX * Math.min(boxScaleX, boxScaleY));
  const penaltySpotDist = Math.round(11.0 * pxPerMeterY * boxScaleY);
  const cornerArcRadius = Math.max(
    effectiveMode === 'pro' ? 26 : 14,
    Math.round(1.0 * pxPerMeterX * boxScaleX)
  );

  // Compute tactical modifiers relative to mode benchmark (or Pro 105×68 baseline)
  const areaRatio = (widthMeters * lengthMeters) / (68 * 105);
  const staminaMultiplier =
    effectiveMode === 'pro'
      ? Math.max(0.85, Math.min(1.25, Math.sqrt(areaRatio)))
      : Math.max(0.45, Math.min(1.15, Math.sqrt(areaRatio)));
  const spaceMultiplier =
    effectiveMode === 'pro'
      ? Math.max(0.80, Math.min(1.25, widthMeters / 68))
      : Math.max(0.35, Math.min(1.15, widthMeters / 68));

  return {
    matchMode: effectiveMode,
    preset,
    lengthMeters,
    widthMeters,
    turfWidth: MAX_PITCH_TURF_WIDTH,
    turfHeight: MAX_PITCH_TURF_HEIGHT,
    fieldWidth,
    fieldHeight,
    marginX,
    marginTop,
    marginBottom,
    totalWidth,
    totalHeight,
    pitchLeft,
    pitchRight,
    pitchTop,
    pitchBottom,
    turfLeft,
    turfRight,
    turfTop,
    turfBottom,
    lineOffsetX,
    lineOffsetY,
    centerX,
    centerY,
    goalWidthPx: bounds.goalWidthPx,
    crossbarHeightPx: bounds.crossbarHeightPx,
    goalDepthPx: bounds.goalDepthPx,
    infillWidthMeters: INFILL_METERS_WIDTH,
    infillLengthMeters: INFILL_METERS_LENGTH,
    infillWidth,
    infillHeight,
    infillLeft,
    infillRight,
    infillTop,
    infillBottom,
    marginToInfillMetersX,
    marginToInfillMetersY,
    penaltyBoxWidth,
    penaltyBoxHeight,
    sixYardBoxWidth,
    sixYardBoxHeight,
    centerCircleRadius,
    penaltySpotDist,
    cornerArcRadius,
    staminaMultiplier,
    spaceMultiplier,
  };
}

/**
 * Phase D1.1: Dynamically synchronizes PITCH_CONFIG singleton with active pitch metrics.
 * Ensures that chalk lines, out-of-bounds raycasting, linesmen patrol paths, goalposts,
 * penalty boxes, and corner arcs are 100% physically and visually identical.
 */
export function syncPitchConfigWithMetrics(
  config?: PitchResolutionInput,
  matchMode?: FootballMatchMode
): ResolvedPitchMetrics {
  const metrics = resolvePitchMetrics(config, matchMode);
  PITCH_CONFIG.FIELD_WIDTH = metrics.fieldWidth;
  PITCH_CONFIG.FIELD_HEIGHT = metrics.fieldHeight;
  PITCH_CONFIG.PITCH_LEFT = metrics.pitchLeft;
  PITCH_CONFIG.PITCH_RIGHT = metrics.pitchRight;
  PITCH_CONFIG.PITCH_TOP = metrics.pitchTop;
  PITCH_CONFIG.PITCH_BOTTOM = metrics.pitchBottom;
  PITCH_CONFIG.CENTER_X = metrics.centerX;
  PITCH_CONFIG.CENTER_Y = metrics.centerY;
  PITCH_CONFIG.GOAL_WIDTH = metrics.goalWidthPx;
  PITCH_CONFIG.GOAL_DEPTH = metrics.goalDepthPx;
  PITCH_CONFIG.GOAL_CROSSBAR_HEIGHT = metrics.crossbarHeightPx;
  PITCH_CONFIG.PENALTY_BOX_WIDTH = metrics.penaltyBoxWidth;
  PITCH_CONFIG.PENALTY_BOX_HEIGHT = metrics.penaltyBoxHeight;
  PITCH_CONFIG.SIX_YARD_BOX_WIDTH = metrics.sixYardBoxWidth;
  PITCH_CONFIG.SIX_YARD_BOX_HEIGHT = metrics.sixYardBoxHeight;
  PITCH_CONFIG.CENTER_CIRCLE_RADIUS = metrics.centerCircleRadius;
  PITCH_CONFIG.PENALTY_SPOT_DIST = metrics.penaltySpotDist;
  PITCH_CONFIG.CORNER_ARC_RADIUS = metrics.cornerArcRadius;
  return metrics;
}
