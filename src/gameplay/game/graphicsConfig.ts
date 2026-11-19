/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GraphicsSettings, GraphicsTier, RetroFilterType } from '../types';
import { isMatchFilterUnlocked } from '../../utils/cardDustSystem';

export interface RetroFilterDefinition {
  id: RetroFilterType;
  name: string;
  badge: string;
  era: string;
  description: string;
  achievementCondition: string;
}

export const ALL_RETRO_FILTERS: RetroFilterDefinition[] = [
  {
    id: 'none',
    name: 'Standard Clean',
    badge: 'OFF',
    era: 'Native Pixel Art',
    description: 'Crisp, modern 16-bit vector aesthetic without post-processing filters.',
    achievementCondition: 'Unlocked by default',
  },
  {
    id: 'crt_arcade',
    name: 'CRT Arcade Monitor',
    badge: 'ARCADE',
    era: '1990s Coin-Op',
    description: 'Sub-pixel horizontal scanlines, Trinitron convex glass vignette, and subtle 60Hz phosphor glow.',
    achievementCondition: 'Unlock in Card Collection (1,000 Dust)',
  },
  {
    id: 'vhs_1994',
    name: '1994 World Championship VHS',
    badge: 'VHS TAPE',
    era: '1994 USA Broadcast',
    description: 'Analog magnetic tape flutter, slight chroma bleed, and bottom-edge tracking noise bar.',
    achievementCondition: 'Unlock in Card Collection (1,000 Dust)',
  },
  {
    id: 'neo_geo_16bit',
    name: '16-Bit Neo-Geo / Mega Drive',
    badge: '16-BIT',
    era: '1992 Neo-Geo AES',
    description: 'Punchy arcade saturation, high contrast, and classic micro-dithered palette feel.',
    achievementCondition: 'Unlock in Card Collection (1,000 Dust)',
  },
  {
    id: 'vintage_1954',
    name: '1954 Vintage B&W Newsprint',
    badge: '1954 B&W',
    era: '1954 World Championship / Pelé Era',
    description: 'Historic monochromatic grain, authentic sepia tint, newsprint halftone dot pattern & dark vignette.',
    achievementCondition: 'Unlock in Card Collection (1,000 Dust)',
  },
  {
    id: 'manga_tsubasa',
    name: 'Manga / Anime Cel-Shaded',
    badge: 'TSUBASA',
    era: 'Captain Tsubasa Mode',
    description: 'High-contrast ink outlines, hyper-saturated colors, and dramatic speed lines on screen perimeter.',
    achievementCondition: 'Unlock in Card Collection (1,000 Dust)',
  },
  {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk Neon Pitch',
    badge: 'NIGHT ELECTRIC',
    era: 'Neo-Tokyo 2099',
    description: 'Pitch markings radiate electric cyan, obsidian pitch turf, and luminescent player glow.',
    achievementCondition: 'Unlock in Card Collection (1,000 Dust)',
  },
  {
    id: 'cinematic_35mm',
    name: 'Cinematic 35mm Technicolor',
    badge: '35MM WIDESCREEN',
    era: '1970s Theatrical Film',
    description: 'Warm golden grass grading, subtle film grain jitter, and dramatic 2.39:1 widescreen letterbox bars.',
    achievementCondition: 'Unlock in Card Collection (1,000 Dust)',
  },
];

export const GRAPHICS_PRESETS: Record<GraphicsTier, Omit<GraphicsSettings, 'activeFilter' | 'unlockedFilters'>> = {
  performance: {
    tier: 'performance',
    quadShadows: false,
    ambientOcclusion: false,
    pitchScuffs: false,
    highDpi: false,
    volumetricLighting: false,
    crowdFlashbulbs: false,
    netSpringPhysics: false,
    powerVaporTrails: false,
    waterSprayParticles: false,
    videoRefReview: false,
  },
  balanced: {
    tier: 'balanced',
    quadShadows: false,
    ambientOcclusion: false,
    pitchScuffs: false,
    highDpi: false,
    volumetricLighting: false,
    crowdFlashbulbs: true,
    netSpringPhysics: true,
    powerVaporTrails: false,
    waterSprayParticles: false,
    videoRefReview: true,
  },
  high_end: {
    tier: 'high_end',
    quadShadows: true,
    ambientOcclusion: true,
    pitchScuffs: true,
    highDpi: true,
    volumetricLighting: true,
    crowdFlashbulbs: true,
    netSpringPhysics: true,
    powerVaporTrails: true,
    waterSprayParticles: true,
    videoRefReview: true,
  },
};

const ALL_FILTER_IDS: RetroFilterType[] = ALL_RETRO_FILTERS.map((f) => f.id);

export function getDustUnlockedRetroFilters(): RetroFilterType[] {
  return ALL_FILTER_IDS.filter((id) => isMatchFilterUnlocked(id));
}

const DEFAULT_GRAPHICS_SETTINGS: GraphicsSettings = {
  tier: 'balanced',
  quadShadows: false,
  ambientOcclusion: false,
  pitchScuffs: false,
  highDpi: false,
  volumetricLighting: false,
  crowdFlashbulbs: true,
  netSpringPhysics: true,
  powerVaporTrails: false,
  waterSprayParticles: false,
  videoRefReview: true,
  activeFilter: 'none',
  unlockedFilters: ['none'],
};

const STORAGE_KEY = 'swos_graphics_settings';

export function loadGraphicsSettings(): GraphicsSettings {
  const dustUnlocked = getDustUnlockedRetroFilters();
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const requestedFilter: RetroFilterType = parsed?.activeFilter || 'none';
        const safeActiveFilter: RetroFilterType = dustUnlocked.includes(requestedFilter)
          ? requestedFilter
          : 'none';
        return {
          ...DEFAULT_GRAPHICS_SETTINGS,
          ...parsed,
          activeFilter: safeActiveFilter,
          unlockedFilters: dustUnlocked,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to load graphics settings from localStorage:', err);
  }
  return {
    ...DEFAULT_GRAPHICS_SETTINGS,
    unlockedFilters: dustUnlocked,
  };
}

export function saveGraphicsSettings(settings: GraphicsSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save graphics settings to localStorage:', err);
  }
}

export function applyPresetTier(current: GraphicsSettings, tier: GraphicsTier): GraphicsSettings {
  const preset = GRAPHICS_PRESETS[tier];
  return {
    ...current,
    ...preset,
    tier,
  };
}

export function unlockAllRetroFilters(current: GraphicsSettings): GraphicsSettings {
  const allIds = ALL_RETRO_FILTERS.map((f) => f.id);
  const updated = {
    ...current,
    unlockedFilters: allIds,
  };
  saveGraphicsSettings(updated);
  return updated;
}
export const unlockAllFilters = unlockAllRetroFilters;
