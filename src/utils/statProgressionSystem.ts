/**
 * STAT PROGRESSION & TRAINING LEVEL SYSTEM
 * 
 * Implements the tiered training level system for player development:
 * - 0 to 20: 1 stat point = 5 levels (rapid foundational growth)
 * - 20 to 30: 1 stat point = 3 levels
 * - 30 to 40: 1 stat point = 2 levels
 * - 40 to 50: 1 stat point = 1.5 levels
 * - 50 to 60: 1 stat point = 1.25 levels
 * - 60 to 70: 1 stat point = 1 level
 * - 70 to 80: 1 stat point = 0.5 levels (2 stat points per level)
 * - 80 to 85: 1 stat point = 0.25 levels (4 stat points per level)
 * - 85 to 90: 1 stat point = 0.15 levels (~6.67 stat points per level)
 * - 90 to 95: 1 stat point = 0.1 levels (10 stat points per level)
 * - 95 to 99: 1 stat point = 0.05 levels (20 stat points per level)
 * - 99 to 100: exactly 100 stat points needed to achieve STAT BREAK (0.01 per point)
 * - 100: Stat Break Immortality Max
 */

import {
  isStatWeaknessForPlayerType,
  isStatPoorForPlayerType,
  getStatDevelopmentState,
  getPlayerTypeStatRole,
  StatDevelopmentState,
  STAT_DEV_STATE_CONFIG,
} from '../data/playerTypes';

export {
  isStatWeaknessForPlayerType,
  isStatPoorForPlayerType,
  getStatDevelopmentState,
  getPlayerTypeStatRole,
  STAT_DEV_STATE_CONFIG,
};
export type { StatDevelopmentState };

export interface StatTrainingProgressInfo {
  level: number;
  progress: number; // 0 to < 1 (or 1.0 if 100)
  percent: number; // 0 to 100
  levelsPerPoint: number;
  pointsNeededPerLevel: number;
  pointsInvestedInCurrentLevel: number;
  pointsRemainingForNextLevel: number;
  isStatBroken: boolean;
  isAt99StatBreak: boolean;
  isWeakness: boolean;
  isPoor: boolean;
  developmentState: StatDevelopmentState;
  summaryLabel: string;
}

/**
 * Returns how many levels 1 stat point yields for a given base level.
 * - Poor: requires 5% more stat points (baseRate / 1.05)
 * - Weakness: requires 10% more stat points (baseRate / 1.10)
 * - Natural, Skillful, Normal: baseRate
 */
export function getLevelsPerPoint(level: number, devState: StatDevelopmentState | boolean = 'normal'): number {
  let baseRate = 0;
  if (level < 0) baseRate = 5;
  else if (level < 20) baseRate = 5;
  else if (level < 30) baseRate = 3;
  else if (level < 40) baseRate = 2;
  else if (level < 50) baseRate = 1.5;
  else if (level < 60) baseRate = 1.25;
  else if (level < 70) baseRate = 1;
  else if (level < 80) baseRate = 0.5;
  else if (level < 85) baseRate = 0.25;
  else if (level < 90) baseRate = 0.15;
  else if (level < 95) baseRate = 0.1;
  else if (level < 99) baseRate = 0.05;
  else if (level === 99) baseRate = 0.01; // Exactly 100 stat points needed to break to 100
  else baseRate = 0; // Already 100 or broken

  if (baseRate <= 0) return 0;

  if (devState === 'weakness' || devState === true) {
    return baseRate / 1.10;
  }
  if (devState === 'poor') {
    return baseRate / 1.05;
  }
  return baseRate;
}

/**
 * Returns how many stat points are required for a complete level at the given level.
 */
export function getPointsPerLevel(level: number, devState: StatDevelopmentState | boolean = 'normal'): number {
  const rate = getLevelsPerPoint(level, devState);
  if (rate <= 0) return 0;
  return 1 / rate;
}

/**
 * Computes full training progress details for display under an attribute.
 */
export function getStatTrainingProgressInfo(
  level: number,
  progress = 0,
  isBroken = false,
  devState: StatDevelopmentState | boolean = 'normal'
): StatTrainingProgressInfo {
  const isStatBroken = isBroken || level >= 100;
  const isAt99StatBreak = level === 99 && !isStatBroken;

  const resolvedState: StatDevelopmentState =
    typeof devState === 'boolean'
      ? devState
        ? 'weakness'
        : 'normal'
      : devState;

  const isWeakness = resolvedState === 'weakness';
  const isPoor = resolvedState === 'poor';

  if (isStatBroken) {
    return {
      level: Math.max(100, level),
      progress: 1.0,
      percent: 100,
      levelsPerPoint: 0,
      pointsNeededPerLevel: 0,
      pointsInvestedInCurrentLevel: isWeakness ? 110 : isPoor ? 105 : 100,
      pointsRemainingForNextLevel: 0,
      isStatBroken: true,
      isAt99StatBreak: false,
      isWeakness,
      isPoor,
      developmentState: resolvedState,
      summaryLabel: '⭐ STAT BREAK MAX',
    };
  }

  const levelsPerPoint = getLevelsPerPoint(level, resolvedState);
  const pointsNeededPerLevel = getPointsPerLevel(level, resolvedState);

  // Clamp progress between 0 and 0.9999
  const safeProgress = Math.max(0, Math.min(0.9999, progress));
  const percent = Math.floor(safeProgress * 100);
  const pointsInvestedInCurrentLevel = Math.round(safeProgress * pointsNeededPerLevel * 100) / 100;
  const pointsRemainingForNextLevel = Math.max(
    0,
    Math.round((pointsNeededPerLevel - pointsInvestedInCurrentLevel) * 100) / 100
  );

  let summaryLabel = `${pointsInvestedInCurrentLevel} / ${pointsNeededPerLevel.toFixed(1)} pts`;
  if (isAt99StatBreak) {
    summaryLabel = `⭐ BREAK PROGRESS: ${Math.round(safeProgress * 100)}% (${pointsInvestedInCurrentLevel.toFixed(0)}/100 pts)`;
  }

  return {
    level,
    progress: safeProgress,
    percent,
    levelsPerPoint,
    pointsNeededPerLevel,
    pointsInvestedInCurrentLevel,
    pointsRemainingForNextLevel,
    isStatBroken: false,
    isAt99StatBreak,
    isWeakness,
    isPoor,
    developmentState: resolvedState,
    summaryLabel,
  };
}

export interface StatInvestmentResult {
  newLevel: number;
  newProgress: number;
  statBreakTriggered: boolean;
  levelsGained: number;
  pointsSpent: number;
}

/**
 * Invests `pointsToAdd` into a stat, advancing levels and fractional progress.
 * Crosses tiers seamlessly.
 */
export function applyStatPointInvestment(
  currentLevel: number,
  currentProgress: number,
  pointsToAdd: number,
  isWeakness = false
): StatInvestmentResult {
  let level = currentLevel;
  let progress = Math.max(0, Math.min(0.9999, currentProgress || 0));
  let remainingPoints = Math.max(0, pointsToAdd);
  const startLevel = level;
  let statBreakTriggered = false;

  if (level >= 100) {
    return {
      newLevel: 100,
      newProgress: 1.0,
      statBreakTriggered: false,
      levelsGained: 0,
      pointsSpent: 0,
    };
  }

  while (remainingPoints > 0.00001 && level < 100) {
    const rate = getLevelsPerPoint(level, isWeakness);
    if (rate <= 0) break;

    // Progress remaining in current level
    const progressNeeded = 1.0 - progress;
    // Points needed to complete current level
    const pointsNeededForLevel = progressNeeded / rate;

    if (remainingPoints >= pointsNeededForLevel - 0.000001) {
      // Completed this level!
      remainingPoints -= pointsNeededForLevel;
      level += 1;
      progress = 0;

      if (level >= 100) {
        level = 100;
        progress = 1.0;
        statBreakTriggered = true;
        break;
      }
    } else {
      // Invest remaining points into current level's progress
      progress += remainingPoints * rate;
      remainingPoints = 0;

      if (progress >= 0.99999) {
        level += 1;
        progress = 0;
        if (level >= 100) {
          level = 100;
          progress = 1.0;
          statBreakTriggered = true;
        }
      }
      break;
    }
  }

  // Precision clamp
  progress = Math.round(progress * 10000) / 10000;
  if (progress >= 1 && level < 100) {
    level += 1;
    progress = 0;
    if (level >= 100) {
      level = 100;
      progress = 1.0;
      statBreakTriggered = true;
    }
  }

  const levelsGained = level - startLevel;
  const pointsSpent = pointsToAdd - remainingPoints;

  return {
    newLevel: level,
    newProgress: progress,
    statBreakTriggered,
    levelsGained,
    pointsSpent: Math.round(pointsSpent * 100) / 100,
  };
}

export interface StatRefundResult {
  newLevel: number;
  newProgress: number;
  refunded: boolean;
}

/**
 * Refunds 1 stat point from a stat, reducing progress and levels if applicable.
 */
export function refundStatPointInvestment(
  currentLevel: number,
  currentProgress: number,
  minLevel = 40,
  isWeakness = false
): StatRefundResult {
  let level = currentLevel;
  let progress = Math.max(0, currentProgress || 0);
  let pointsToRefund = 1.0;

  if (level <= minLevel && progress <= 0.0001) {
    return { newLevel: level, newProgress: progress, refunded: false };
  }

  while (pointsToRefund > 0.00001 && (level > minLevel || (level === minLevel && progress > 0.0001))) {
    const tierLevel = level === 100 ? 99 : level;
    const rate = getLevelsPerPoint(tierLevel, isWeakness);
    if (rate <= 0) break;

    // Points represented by current level's partial progress
    const pointsInCurrentProgress = progress / rate;

    if (pointsToRefund <= pointsInCurrentProgress + 0.00001) {
      progress -= pointsToRefund * rate;
      pointsToRefund = 0;
      break;
    } else {
      pointsToRefund -= pointsInCurrentProgress;
      if (level > minLevel) {
        level -= 1;
        progress = 1.0;
      } else {
        progress = 0;
        break;
      }
    }
  }

  progress = Math.max(0, Math.round(progress * 10000) / 10000);
  return { newLevel: level, newProgress: progress, refunded: true };
}
