/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  AppearanceV2,
  EarringGemV2,
  EarringMaterialV2,
  EarringSlotV2,
  FaceTattooV2,
  FacialHairV2,
  HairLengthV2,
  HairTextureV2,
  HeadwearV2,
  NeckTattooV2,
  NecklaceV2,
  PlayerAppearance,
  TeamKit,
} from '../types';
import {
  HAIR_COLOR_HEX_V2,
  getEffectiveHairHexV2,
  getSkinToneHexV2,
  isAppearanceV2,
} from './appearanceV2';
import { getBodyProfile } from './bodyProfile';
import type { PlayerRenderExtras } from '../../utils/gameplayAdapter';

/**
 * 32-Bit Arcade Captain Hero Pixel Sprite Renderer (Full Body Model)
 *
 * Mirrors all AppearanceV2 + PlayerCardData options live: skin tone, full physique
 * proportions & muscle/vein tiers, all hair lengths/textures/roots/dyes/special cuts,
 * all 11 facial hair styles, eyewear/headwear & custom colors, independent L/R earrings,
 * necklaces, face/neck/arm tattoos, kit patterns/collars/cuts/sleeves/socks/boots,
 * and 3-way facing ('right' | 'left' | 'back' with back squad number).
 */

export interface CaptainRenderOptions {
  width?: number;
  height?: number;
  facing?: 'right' | 'left' | 'back';
  showArmband?: boolean;
  scale?: number;
  extras?: PlayerRenderExtras;
}

const NUM_FONT = [
  '01110,10001,10011,10101,11001,10001,01110',
  '00100,01100,00100,00100,00100,00100,01110',
  '01110,10001,00001,00010,00100,01000,11111',
  '11110,00001,00001,01110,00001,00001,11110',
  '00010,00110,01010,10010,11111,00010,00010',
  '11111,10000,11110,00001,00001,10001,01110',
  '00110,01000,10000,11110,10001,10001,01110',
  '11111,00001,00010,00100,01000,01000,01000',
  '01110,10001,10001,01110,10001,10001,01110',
  '01110,10001,10001,01111,00001,00010,01100',
].map((g) => g.split(','));

const EARRING_MATERIAL_HEX: Record<EarringMaterialV2, string> = {
  silver: '#e2e8f0',
  gold: '#facc15',
  bronze: '#b45309',
  black_steel: '#1e293b',
  steel: '#64748b',
};

const EARRING_GEM_HEX: Record<EarringGemV2, string> = {
  diamond: '#bae6fd',
  white_pearl: '#f8fafc',
  emerald: '#10b981',
  sapphire: '#2563eb',
  amethyst: '#a855f7',
};

function normalizeHex(hex: string | undefined, fallback = '#ffdbac'): string {
  if (!hex || typeof hex !== 'string') return fallback;
  const trimmed = hex.trim();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed;
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
}

function lum(hex: string): number {
  const clean = normalizeHex(hex, '#808080').slice(1);
  const v = parseInt(clean, 16);
  return (0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) / 255;
}

function adjustHex(hex: string, amount: number): string {
  const clean = normalizeHex(hex, '#808080').slice(1);
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Draws a 32-bit pixel-art full-body player sprite onto any 2D canvas context
 */
export function drawCaptainHeroSprite(
  ctx: CanvasRenderingContext2D,
  appearance: PlayerAppearance | AppearanceV2 = {
    heightCm: 182,
    weightKg: 78,
    muscleMass: 3,
    skinTone: '#ffdbac',
    hairStyle: 'part',
    hairColor: '#2b1b0d',
    facialHair: 'clean',
  },
  kit: TeamKit,
  options: CaptainRenderOptions = {}
) {
  const {
    width = 112,
    height = 192,
    facing = 'right',
    showArmband = true,
    extras,
  } = options;

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;

  // Virtual coordinate stage: 112x192 with ground at y = 0, centered horizontally at x = 0.
  // Scales cleanly even for compact thumbnails (e.g. 72x92) without clipping head or cleats.
  const fit = Math.min(width / 112, height / 192);
  const isBack = facing === 'back';
  const flipX = facing === 'left' ? -1 : 1;

  ctx.translate(width / 2, height - Math.max(6, Math.round(12 * fit)));
  ctx.scale(flipX * fit, fit);

  const v2 = isAppearanceV2(appearance) ? appearance : null;
  const v1 = v2 ? null : (appearance as PlayerAppearance);
  const bp = getBodyProfile(appearance);

  // --- PALETTE DERIVATIONS ---
  const skin = normalizeHex(
    extras?.rawSkinHex || (v2 ? getSkinToneHexV2(v2.skinTone) : v1?.skinTone),
    '#ffdbac'
  );
  const skinShadow = adjustHex(skin, -34);
  const skinDarkShadow = adjustHex(skin, -54);
  const skinHighlight = adjustHex(skin, 22);

  const rootHair = normalizeHex(
    extras?.rawHairRootHex || (v2 ? HAIR_COLOR_HEX_V2[v2.hairColor] : v1?.hairColor),
    '#2b1b0d'
  );
  const dyeHairRaw = extras?.rawHairDyeHex;
  const hasExplicitDye = dyeHairRaw && dyeHairRaw !== 'none';
  const hair = hasExplicitDye
    ? normalizeHex(dyeHairRaw, rootHair)
    : v2
    ? normalizeHex(getEffectiveHairHexV2(v2), rootHair)
    : rootHair;
  const hairDark = adjustHex(hair, -42);
  const hairHi = adjustHex(hair, 32);
  const rootDark = adjustHex(rootHair, -32);

  const shirt = normalizeHex(kit.primaryColor, '#dc2626');
  const shirtDark = adjustHex(shirt, -44);
  const shirtHi = adjustHex(shirt, 34);
  const trim = normalizeHex(kit.secondaryColor, '#ffffff');
  const trimDark = adjustHex(trim, -36);

  const shorts = normalizeHex(kit.shortsColor, '#ffffff');
  const shortsDark = adjustHex(shorts, -40);
  const shortsHi = adjustHex(shorts, 24);

  const socks = normalizeHex(kit.socksColor, shirt);
  const socksDark = adjustHex(socks, -42);
  const socksHi = adjustHex(socks, 28);

  const shirtCut = v2 ? v2.uniform.shirtCut : 'normal';
  const untucked = v2 ? v2.uniform.tucked === 'untucked' : (v1 as any)?.jerseyFit === 'untucked';
  const sockLen: 'short' | 'normal' | 'long' = v2
    ? v2.uniform.socks
    : (v1 as any)?.sockHeight === 'low'
    ? 'short'
    : (v1 as any)?.sockHeight === 'high-knee'
    ? 'long'
    : 'normal';
  const isGk = Boolean(extras?.isGk);
  const longSleeve = Boolean(
    isGk || (v2 ? v2.uniform.sleeves === 'long' : v1?.sleeveLength === 'long')
  );
  const interiorEnabled = v2
    ? v2.uniform.interiorShirt.enabled
    : v1?.sleeveLength === 'undershirt';
  const interiorSleeve: 'short' | 'long' = v2 ? v2.uniform.interiorShirt.sleeve : 'long';
  const interiorNeck: 'short' | 'long' = v2 ? v2.uniform.interiorShirt.neck : 'short';
  const intColor = lum(shirt) < 0.16 ? '#334155' : adjustHex(shirt, -55);

  const shoeColor = normalizeHex(
    v2 ? v2.uniform.shoeColor : (v1 as any)?.shoeColor,
    '#0f172a'
  );
  const shoeHi = adjustHex(shoeColor, 34);
  const soleColor = lum(shoeColor) > 0.72 ? '#334155' : '#020617';

  const kitPattern = extras?.kitPattern || 'solid';
  const collarStyle = extras?.kitCollar || (v1 as any)?.collarStyle || 'crew';

  const goldArmband = '#f59e0b';
  const goldArmbandHi = '#fef08a';
  const goldArmbandDark = '#b45309';

  // Helper pixel block drawer
  const p = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  };

  // --- PROPORTIONS FROM BODY PROFILE ---
  const legH = Math.round(bp.legLen * 2.08); // ~52..72
  const torsoH = Math.round(bp.torsoLen * 2.1); // ~43..56
  const cutChestExtra = shirtCut === 'tight' ? -2 : shirtCut === 'big_retro' ? 6 : 1;
  const cutWaistExtra = shirtCut === 'tight' ? -2 : shirtCut === 'big_retro' ? 8 : 1;
  const chestW = Math.max(28, Math.round(bp.chestW * 1.44 + cutChestExtra));
  const waistW = Math.max(24, Math.round(bp.waistW * 1.42 + cutWaistExtra));
  const rawHipW = Math.max(26, Math.round(bp.hipW * 1.44));
  const thighW = Math.max(10, Math.round(bp.thighT * 1.42));
  const calfW = Math.max(8, Math.round(bp.calfT * 1.38));
  const upperArmW = Math.max(7, Math.round(bp.upperArmT * 1.42));
  const foreArmW = Math.max(6, Math.round(bp.foreArmT * 1.35));
  const armDropScale = bp.armScale;
  const neckW = Math.max(8, Math.round(bp.neckW * 1.65));
  const neckH = Math.max(5, Math.round(bp.neckLen * 1.35));
  const headW = Math.round(22 * bp.headScale);
  const headH = Math.round(25 * bp.headScale);

  const muscleHigh = bp.muscle >= 2 || Boolean(extras?.statBreakActive);
  const muscleMed = bp.muscle >= 1;

  // Vertical landmarks upward from ground (y = 0)
  const hipY = -legH;
  const shortsTop = hipY - 5;
  const jerseyTop = hipY - torsoH;
  const neckTop = jerseyTop - neckH;
  const headBottom = neckTop + 3;
  const headTop = headBottom - headH;

  // Cohesive pelvis/hip & leg spacing so muscular thighs never protrude outside shorts waistband
  const legGap = Math.max(2, Math.min(4, Math.round(Math.max(4, rawHipW - thighW * 1.6) / 4)));
  const leftLegCx = -(legGap + thighW / 2);
  const rightLegCx = legGap + thighW / 2;
  const legsOuterSpan = Math.round(thighW * 2 + legGap * 2);
  const hipW = Math.max(rawHipW, waistW + 2, legsOuterSpan + 4);

  // 1. TURF DROP SHADOW
  ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
  ctx.beginPath();
  ctx.ellipse(0, 2, Math.max(24, Math.round(hipW * 0.88)), 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. BOOTS (Custom Shoe Color)
  const bootW = Math.max(11, calfW + 2);
  // Left boot
  p(leftLegCx - bootW / 2 - 1, -7, bootW, 7, shoeColor);
  p(leftLegCx - bootW / 2 - 2, -2, bootW + 1, 3, soleColor);
  p(leftLegCx - bootW / 2 - 1, -7, 2, 7, shoeHi);
  p(leftLegCx - bootW / 2 + 1, -5, Math.max(4, bootW - 5), 2, trim);
  p(leftLegCx - bootW / 2 - 1, 1, 3, 2, '#e2e8f0');
  p(leftLegCx + bootW / 2 - 4, 1, 3, 2, '#e2e8f0');

  // Right boot
  p(rightLegCx - bootW / 2, -7, bootW + 1, 7, shoeColor);
  p(rightLegCx - bootW / 2, -2, bootW + 2, 3, soleColor);
  p(rightLegCx - bootW / 2, -7, 2, 7, shoeHi);
  p(rightLegCx - bootW / 2 + 2, -5, Math.max(4, bootW - 5), 2, trim);
  p(rightLegCx - bootW / 2 + 1, 1, 3, 2, '#e2e8f0');
  p(rightLegCx + bootW / 2 - 3, 1, 3, 2, '#e2e8f0');

  // 3. KNEES, CALVES & SOCKS (Short / Normal / Over-Knee Long)
  const kneeY = Math.round(-legH * 0.48);
  const shinH = Math.abs(kneeY) - 6;
  const sockTopY =
    sockLen === 'long'
      ? kneeY - 7
      : sockLen === 'short'
      ? -Math.max(12, Math.round(shinH * 0.48) + 6)
      : kneeY + 4;

  for (const legCx of [leftLegCx, rightLegCx]) {
    // Upper shin / knee skin
    p(legCx - thighW / 2, kneeY - 6, thighW, 12, skin);
    p(legCx - thighW / 2, kneeY - 6, 2, 11, skinHighlight);
    p(legCx + thighW / 2 - 2, kneeY - 6, 2, 11, skinShadow);
    p(legCx - calfW / 2, kneeY + 4, calfW, Math.max(4, sockTopY - (kneeY + 4)), skin);

    // Calf & shin muscle definition on muscular players
    if (muscleMed) {
      p(legCx - calfW / 2 + 1, kneeY + 5, 2, Math.max(3, sockTopY - kneeY - 5), skinShadow);
    }

    // Socks
    const sockH = Math.abs(-6 - sockTopY);
    p(legCx - calfW / 2, sockTopY, calfW, sockH, socks);
    p(legCx - calfW / 2, sockTopY, 2, sockH, socksHi);
    p(legCx + calfW / 2 - 2, sockTopY, 2, sockH, socksDark);
    // Sock fold band
    p(legCx - calfW / 2 - 1, sockTopY - 2, calfW + 2, 3, trim);
    p(legCx - calfW / 2 - 1, sockTopY, calfW + 2, 2, trimDark);
  }

  // 4. SHORTS (Cohesive pelvis, filled crotch gusset, and thigh-fitted legs)
  const shortsLegH = Math.max(14, Math.abs(kneeY - shortsTop) - 4);
  const halfHip = Math.round(hipW / 2);
  const leftShortsX = Math.min(-halfHip, Math.round(leftLegCx - thighW / 2 - 2));
  const rightShortsOuterX = -leftShortsX;
  const totalShortsOuterW = rightShortsOuterX - leftShortsX;
  const shortLegW = Math.max(thighW + 4, Math.round(totalShortsOuterW / 2) - 1);
  const rightShortsX = rightShortsOuterX - shortLegW;
  const crotchH = Math.max(9, Math.round(shortsLegH * 0.54));

  // Left shorts leg (flush with outer hip)
  p(leftShortsX, shortsTop + 4, shortLegW, shortsLegH + 1, shorts);
  p(leftShortsX, shortsTop + 4, 2, shortsLegH + 1, trim);
  p(leftShortsX + 2, shortsTop + 4, 3, shortsLegH + 1, shortsHi);
  p(leftShortsX + shortLegW - 3, shortsTop + 9, 3, shortsLegH - 4, shortsDark);
  p(leftShortsX, shortsTop + 5 + shortsLegH - 2, shortLegW, 2, trimDark);

  // Right shorts leg (flush with outer hip)
  p(rightShortsX, shortsTop + 4, shortLegW, shortsLegH + 1, shorts);
  p(rightShortsOuterX - 2, shortsTop + 4, 2, shortsLegH + 1, trim);
  p(rightShortsX + 3, shortsTop + 4, 3, shortsLegH + 1, shortsHi);
  p(rightShortsX, shortsTop + 9, 3, shortsLegH - 4, shortsDark);
  p(rightShortsX, shortsTop + 5 + shortsLegH - 2, shortLegW, 2, trimDark);

  // Pelvis waistband & solid crotch gusset (eliminates any middle gap)
  p(leftShortsX, shortsTop, totalShortsOuterW, 7, shorts);
  p(leftShortsX, shortsTop, totalShortsOuterW, 2, shortsHi);
  const gussetW = Math.max(10, Math.round(totalShortsOuterW * 0.48));
  p(-Math.round(gussetW / 2), shortsTop + 4, gussetW, crotchH, shorts);
  p(-Math.round(gussetW / 2), shortsTop + 4 + crotchH - 2, gussetW, 2, shortsDark);
  p(-1, shortsTop + 3, 2, Math.max(7, crotchH - 2), shortsDark);

  // 5. TORSO & JERSEY WITH PATTERN + CUT + TUCK
  for (let r = 0; r < torsoH; r++) {
    const f = r / Math.max(1, torsoH - 1);
    const bellyAdd = bp.belly > 0 && f > 0.45 ? Math.round(bp.belly * 2.2 * Math.sin((f - 0.45) * Math.PI)) : 0;
    const rowW = Math.round(chestW + (waistW - chestW) * Math.min(1, f * 1.15) + bellyAdd);
    const rx = -Math.round(rowW / 2);
    const ry = jerseyTop + r;

    p(rx, ry, rowW, 1, shirt);

    // Jersey Patterns
    if (kitPattern === 'stripes' || kitPattern === 'vertical-stripes') {
      for (let sx = -Math.floor(rowW / 2) + 3; sx < Math.floor(rowW / 2) - 2; sx += 8) {
        p(sx, ry, 4, 1, trim);
      }
    } else if (kitPattern === 'center-stripe') {
      p(-4, ry, 8, 1, trim);
    } else if (kitPattern === 'hoops' || kitPattern === 'horizontal-hoops') {
      if (Math.floor(r / 7) % 2 === 1) {
        p(rx, ry, rowW, 1, trim);
      }
    } else if (kitPattern === 'halves' || kitPattern === 'half-and-half') {
      p(0, ry, Math.ceil(rowW / 2), 1, trim);
    } else if (kitPattern === 'sash' || kitPattern === 'diagonal') {
      const diagX = Math.round(-rowW * 0.4 + f * rowW * 0.8);
      const sashX = Math.max(rx, diagX - 4);
      const sashEnd = Math.min(rx + rowW, diagX + 4);
      if (sashEnd > sashX) p(sashX, ry, sashEnd - sashX, 1, trim);
    } else if (kitPattern === 'checkered') {
      for (let cxBlk = rx; cxBlk < rx + rowW; cxBlk += 6) {
        const checker = (Math.floor((cxBlk - rx) / 6) + Math.floor(r / 6)) % 2 === 0;
        if (checker) p(cxBlk, ry, Math.min(6, rx + rowW - cxBlk), 1, trim);
      }
    } else if (kitPattern === 'raglan-shoulders' || kitPattern === 'shoulders') {
      if (r < Math.round(torsoH * 0.28)) {
        p(rx, ry, 6, 1, trim);
        p(rx + rowW - 6, ry, 6, 1, trim);
      }
    } else if (kitPattern === 'gradient') {
      if (f > 0.55) {
        ctx.globalAlpha = Math.min(0.85, (f - 0.55) * 1.9);
        p(rx, ry, rowW, 1, trim);
        ctx.globalAlpha = 1;
      }
    }

    // Lateral shading & highlights
    p(rx, ry, 2, 1, shirtDark);
    p(rx + rowW - 2, ry, 2, 1, shirtDark);
  }

  // Chest pec highlight & muscle definition (front view)
  if (!isBack && kitPattern === 'solid') {
    p(-Math.round(chestW * 0.34), jerseyTop + 9, Math.round(chestW * 0.28), 11, shirtHi);
    p(Math.round(chestW * 0.06), jerseyTop + 9, Math.round(chestW * 0.28), 11, shirtHi);
    p(-1, jerseyTop + 8, 2, torsoH - 12, shirtDark);
    if (muscleHigh) {
      p(-Math.round(chestW * 0.32), jerseyTop + 20, Math.round(chestW * 0.26), 2, shirtDark);
      p(Math.round(chestW * 0.06), jerseyTop + 20, Math.round(chestW * 0.26), 2, shirtDark);
    }
  }

  // Untucked hem vs tucked seam (tapers cleanly into shorts waistband on muscular legs)
  const hemW = Math.max(waistW, totalShortsOuterW - 2);
  if (untucked) {
    const hemDrop = shirtCut === 'big_retro' ? 8 : 5;
    p(-Math.round(hemW / 2) - 1, hipY - 2, hemW + 2, hemDrop, shirt);
    p(-Math.round(hemW / 2) - 1, hipY - 2 + hemDrop - 1, hemW + 2, 1, shirtDark);
  } else {
    p(-Math.round(hemW / 2), hipY - 2, hemW, 2, shirtDark);
  }

  // Collar styles
  if (collarStyle === 'v-neck' && !isBack) {
    p(-6, jerseyTop, 12, 2, skin);
    p(-4, jerseyTop + 2, 8, 2, skin);
    p(-2, jerseyTop + 4, 4, 2, skin);
    p(-7, jerseyTop, 2, 4, trim);
    p(5, jerseyTop, 2, 4, trim);
    p(-3, jerseyTop + 4, 6, 2, trim);
  } else if (collarStyle === 'polo') {
    p(-9, jerseyTop - 1, 7, 4, trim);
    p(2, jerseyTop - 1, 7, 4, trim);
    if (!isBack) p(-2, jerseyTop + 2, 4, 6, shirtDark);
  } else {
    p(-9, jerseyTop, 18, 4, trim);
    p(-7, jerseyTop + 2, 14, 2, trimDark);
  }

  // Front crest vs Back Squad Number
  if (!isBack) {
    p(-Math.round(chestW * 0.34), jerseyTop + 11, 6, 6, trim);
    p(-Math.round(chestW * 0.34) + 1, jerseyTop + 12, 4, 4, goldArmband);
  } else {
    const n = Math.abs(Math.floor(extras?.shirtNumber ?? 10)) % 100;
    const dg = n >= 10 ? [Math.floor(n / 10), n % 10] : [n];
    const fg = lum(shirt) > 0.58 ? '#111827' : '#ffffff';
    const ol = lum(shirt) > 0.58 ? '#ffffff' : '#111827';
    const numW = dg.length * 10 + (dg.length - 1) * 3;
    const nx0 = -Math.round(numW / 2);
    const ny0 = jerseyTop + Math.max(9, Math.round(torsoH * 0.24));
    for (let pass = 0; pass < 2; pass++) {
      const col = pass === 0 ? ol : fg;
      dg.forEach((d, idx) => {
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 5; c++) {
            if (NUM_FONT[d][r][c] === '1') {
              p(nx0 + idx * 13 + c * 2 + (pass === 0 ? 1 : 0), ny0 + r * 2 + (pass === 0 ? 1 : 0), 2, 2, col);
            }
          }
        }
      });
    }
  }

  // 6. ARMS, SLEEVES, UNDER-SHIRT, TATTOOS, VEINS & CAPTAIN ARMBAND
  const sleeveH = Math.round(13 * armDropScale);
  const totalArmH = Math.round(35 * armDropScale);
  const armOffsetL = -Math.round(chestW / 2) - upperArmW + 2;
  const armOffsetR = Math.round(chestW / 2) - 2;
  const sleeveColor = kitPattern === 'raglan-shoulders' || kitPattern === 'shoulders' ? trim : shirt;
  const armTatL = v2 ? v2.tattoos.leftArm : 'none';
  const armTatR = v2 ? v2.tattoos.rightArm : 'none';

  const drawArm = (side: -1 | 1, ax: number, armTat: string) => {
    const sw = upperArmW + (shirtCut === 'big_retro' ? 2 : 0);
    // Jersey short or long sleeve
    if (longSleeve) {
      p(ax, jerseyTop + 3, sw, totalArmH - 5, sleeveColor);
      p(ax, jerseyTop + 3, 2, totalArmH - 5, shirtDark);
      p(ax, jerseyTop + 3 + totalArmH - 7, sw, 2, trim);
      if (interiorEnabled && interiorSleeve === 'long') {
        p(ax, jerseyTop + 3 + totalArmH - 5, foreArmW, 3, intColor);
      }
    } else {
      // Exposed arm (or compression sleeve)
      const upperSkinColor = skin;
      const lowerArmColor = interiorEnabled && interiorSleeve === 'long' ? intColor : skin;
      p(ax, jerseyTop + 3 + sleeveH, foreArmW, Math.max(6, totalArmH - sleeveH - 4), lowerArmColor);
      if (lowerArmColor === skin) {
        p(ax, jerseyTop + 3 + sleeveH, 2, Math.max(6, totalArmH - sleeveH - 4), skinHighlight);
        p(ax + foreArmW - 2, jerseyTop + 3 + sleeveH, 2, Math.max(6, totalArmH - sleeveH - 4), skinShadow);
      }

      // Compression short interior sleeve
      if (interiorEnabled && interiorSleeve === 'short') {
        p(ax, jerseyTop + 3 + sleeveH, upperArmW, 7, intColor);
      }

      // Outer jersey sleeve
      p(ax, jerseyTop + 3, sw, sleeveH, sleeveColor);
      p(ax, jerseyTop + 3 + sleeveH - 2, sw, 2, trim);

      // Arm Tattoo
      if (armTat && armTat !== 'none' && (!interiorEnabled || interiorSleeve !== 'long')) {
        const ink = '#0f172a';
        const tatTop = jerseyTop + 3 + sleeveH + (interiorEnabled && interiorSleeve === 'short' ? 7 : 2);
        const tatLen = Math.max(6, jerseyTop + 3 + totalArmH - 6 - tatTop);
        if (armTat === 'double_stripe_band') {
          p(ax, tatTop + 3, foreArmW, 2, ink);
          p(ax, tatTop + 7, foreArmW, 2, ink);
        } else if (armTat === 'script_name_sleeve') {
          p(ax + 1, tatTop + 2, Math.max(2, foreArmW - 2), Math.max(4, tatLen - 4), '#1e293b');
        } else if (armTat === 'tribal_sleeve') {
          p(ax, tatTop, foreArmW, 3, ink);
          p(ax + 1, tatTop + 4, Math.max(3, foreArmW - 2), Math.max(4, tatLen - 4), '#1e293b');
        } else if (armTat === 'floral_mandala_sleeve') {
          p(ax, tatTop, foreArmW, tatLen, '#1e293b');
          p(ax + 1, tatTop + 2, 3, 3, '#9f1239');
          p(ax + 2, tatTop + 7, 3, 3, '#0f766e');
        } else if (armTat === 'blackout_sleeve') {
          p(ax, tatTop - 1, foreArmW, tatLen + 2, ink);
        }
      }

      // Forearm vascular veins at high strength
      if (muscleHigh && (!interiorEnabled || interiorSleeve !== 'long')) {
        p(ax + Math.floor(foreArmW / 2), jerseyTop + 3 + sleeveH + 3, 1, 9, adjustHex(skin, -45));
      }
    }

    // Hand / GK Glove
    const handY = jerseyTop + 3 + totalArmH - 4;
    p(ax - 1, handY, foreArmW + 2, 7, isGk ? '#facc15' : upperArmW ? skin : skin);
    p(ax - 1, handY + 5, foreArmW + 2, 2, isGk ? '#1e293b' : skinShadow);

    // Captain's Armband on left arm
    if (showArmband && side < 0) {
      const abY = jerseyTop + 3 + Math.min(sleeveH, 11);
      p(ax - 1, abY, sw + 1, 6, goldArmband);
      p(ax - 1, abY, sw + 1, 1, goldArmbandHi);
      p(ax - 1, abY + 5, sw + 1, 1, goldArmbandDark);
      p(ax + 1, abY + 2, 4, 1, '#000000');
      p(ax + 1, abY + 3, 2, 1, '#000000');
      p(ax + 1, abY + 4, 4, 1, '#000000');
    }
  };

  drawArm(-1, armOffsetL, armTatL);
  drawArm(1, armOffsetR, armTatR);

  // Folded athletic hands across front torso (only in front/side hero stance when not back view)
  if (!isBack && muscleMed && shirtCut !== 'big_retro') {
    p(-Math.round(chestW * 0.25), jerseyTop + 24, Math.round(chestW * 0.5), 2, shirtDark);
  }

  // 7. NECK, NECK TATTOO, UNDER-SHIRT COLLAR & NECKLACE
  p(-neckW / 2, neckTop, neckW, neckH + 3, skin);
  p(-neckW / 2, neckTop, 2, neckH + 3, skinShadow);
  p(neckW / 2 - 2, neckTop, 2, neckH + 3, skinShadow);

  // Neck Tattoo
  const neckTat: NeckTattooV2 = v2 ? v2.tattoos.neck : 'none';
  if (neckTat !== 'none') {
    if (neckTat === 'blackout_neck') {
      p(-neckW / 2, neckTop + 1, neckW, Math.max(3, neckH), '#0f172a');
    } else if (neckTat === 'script_lettering') {
      p(-neckW / 2 + 1, neckTop + Math.floor(neckH / 2), Math.max(4, neckW - 2), 2, '#1e293b');
    } else if (neckTat === 'rose') {
      p(neckW / 2 - 4, neckTop + 1, 3, Math.max(3, neckH - 1), '#1e293b');
      p(neckW / 2 - 4, neckTop + 1, 3, 2, '#9f1239');
    } else if (neckTat === 'winger_crest') {
      p(-neckW / 2, neckTop + 1, 3, neckH, '#1e293b');
      p(neckW / 2 - 3, neckTop + 1, 3, neckH, '#1e293b');
    }
  }

  // High neck veins on max strength
  if (muscleHigh && !isBack) {
    p(-3, neckTop + 2, 1, neckH, adjustHex(skin, -42));
    p(2, neckTop + 2, 1, neckH, adjustHex(skin, -42));
  }

  // Interior Compression Neck
  if (interiorEnabled) {
    if (interiorNeck === 'long') {
      p(-neckW / 2 - 1, neckTop + 1, neckW + 2, Math.max(4, neckH), intColor);
    } else {
      p(-neckW / 2 - 1, jerseyTop - 2, neckW + 2, 3, intColor);
    }
  }

  // Necklace
  const necklace: NecklaceV2 = v2 ? v2.necklace : 'none';
  if (necklace !== 'none') {
    const chainW = neckW + 4;
    if (isBack) {
      const col = necklace === 'silver_necklace' || necklace === 'military_tag' ? '#cbd5e1' : '#facc15';
      p(-chainW / 2 + 1, jerseyTop - 1, chainW - 2, 2, col);
    } else if (necklace === 'military_tag') {
      p(-chainW / 2, jerseyTop - 1, 2, 3, '#94a3b8');
      p(chainW / 2 - 2, jerseyTop - 1, 2, 3, '#94a3b8');
      p(-3, jerseyTop + 1, 6, 2, '#94a3b8');
      p(-3, jerseyTop + 3, 6, 5, '#cbd5e1');
      p(-1, jerseyTop + 4, 2, 3, '#475569');
    } else if (necklace === 'silver_necklace') {
      p(-chainW / 2, jerseyTop - 1, 2, 3, '#cbd5e1');
      p(chainW / 2 - 2, jerseyTop - 1, 2, 3, '#cbd5e1');
      p(-5, jerseyTop + 1, 10, 2, '#e2e8f0');
    } else if (necklace === 'gold_necklace') {
      p(-chainW / 2, jerseyTop - 1, 2, 3, '#ca8a04');
      p(chainW / 2 - 2, jerseyTop - 1, 2, 3, '#ca8a04');
      p(-6, jerseyTop + 1, 12, 3, '#facc15');
    } else if (necklace === 'diamond_encrusted_gold_necklace') {
      p(-chainW / 2, jerseyTop - 1, 2, 3, '#facc15');
      p(chainW / 2 - 2, jerseyTop - 1, 2, 3, '#facc15');
      p(-6, jerseyTop + 1, 12, 3, '#facc15');
      p(-4, jerseyTop + 1, 2, 2, '#e0f2fe');
      p(2, jerseyTop + 1, 2, 2, '#e0f2fe');
      p(-2, jerseyTop + 3, 4, 4, '#facc15');
      p(-1, jerseyTop + 4, 2, 2, '#f8fafc');
    }
  }

  // 8. HEAD & EARS
  const halfHw = Math.round(headW / 2);
  p(-halfHw, headTop + 4, headW, headH - 6, skin);
  p(-halfHw, headTop + 4, 2, headH - 6, skinShadow);
  p(halfHw - 2, headTop + 4, 2, headH - 6, skinShadow);
  if (!isBack) {
    p(-halfHw + 3, headTop + 7, headW - 6, headH - 13, skinHighlight);
  }
  p(-halfHw + 2, headBottom - 4, headW - 4, 4, skin);
  p(-halfHw + 4, headBottom - 2, headW - 8, 2, skinShadow);

  // Ears
  p(-halfHw - 2, headTop + 11, 3, 7, skin);
  p(-halfHw - 2, headTop + 13, 2, 3, skinShadow);
  p(halfHw - 1, headTop + 11, 3, 7, skin);
  p(halfHw, headTop + 13, 2, 3, skinShadow);

  // 9. FACIAL FEATURES, BEARDS & FACE TATTOOS (FRONT ONLY)
  const facialHair: FacialHairV2 = v2 ? v2.facialHair : 'none';
  if (!isBack) {
    // Forehead temple veins on extreme strength
    if (bp.muscle === 2) {
      p(halfHw - 5, headTop + 6, 1, 3, skinDarkShadow);
    }

    // Eyebrows & Eyes
    p(-7, headTop + 10, 5, 2, rootDark);
    p(2, headTop + 10, 5, 2, rootDark);
    p(-6, headTop + 13, 4, 3, '#ffffff');
    p(-4, headTop + 13, 2, 3, '#0f172a');
    p(2, headTop + 13, 4, 3, '#ffffff');
    p(2, headTop + 13, 2, 3, '#0f172a');

    // Nose & Mouth
    p(-1, headTop + 12, 2, 6, skinShadow);
    p(-2, headTop + 17, 4, 1, skinShadow);
    p(-4, headTop + 20, 8, 2, skinShadow);
    p(-3, headTop + 20, 6, 1, '#881337');

    // Facial Hair (all 11 styles)
    const beardCol = rootHair;
    const beardDark = adjustHex(beardCol, -36);
    const stubCol = adjustHex(skin, -38);
    switch (facialHair) {
      case 'three_day_stubble':
        p(-7, headBottom - 6, 14, 5, stubCol);
        p(-4, headTop + 18, 8, 2, stubCol);
        break;
      case 'full_beard':
        p(-9, headBottom - 8, 18, 8, beardDark);
        p(-8, headBottom - 7, 16, 6, beardCol);
        p(-5, headTop + 18, 10, 2, beardDark);
        break;
      case 'well_kept_beard':
        p(-8, headBottom - 6, 16, 6, beardCol);
        p(-4, headTop + 18, 8, 2, beardDark);
        break;
      case 'mutton_chops':
        p(-10, headBottom - 9, 4, 8, beardCol);
        p(6, headBottom - 9, 4, 8, beardCol);
        break;
      case 'royal_beard':
        p(-5, headTop + 18, 10, 2, beardCol);
        p(-3, headBottom - 5, 6, 6, beardCol);
        break;
      case 'goatee':
        p(-5, headTop + 18, 10, 2, beardCol);
        p(-4, headBottom - 5, 8, 6, beardDark);
        break;
      case 'chin_strap':
        p(-9, headBottom - 8, 2, 7, beardCol);
        p(7, headBottom - 8, 2, 7, beardCol);
        p(-8, headBottom - 3, 16, 3, beardDark);
        break;
      case 'mustache':
        p(-5, headTop + 18, 10, 2, beardCol);
        break;
      case 'pointy_mustache':
        p(-5, headTop + 18, 10, 2, beardCol);
        p(-7, headTop + 16, 2, 3, beardDark);
        p(5, headTop + 16, 2, 3, beardDark);
        break;
      case 'classic_mustache':
        p(-6, headTop + 18, 12, 3, beardCol);
        p(-6, headTop + 20, 2, 2, beardDark);
        p(4, headTop + 20, 2, 2, beardDark);
        break;
    }

    // Face Tattoos
    const faceTat: FaceTattooV2 = v2 ? v2.tattoos.face : 'none';
    if (faceTat === 'cheek_star') {
      p(4, headTop + 16, 4, 2, '#0f172a');
      p(5, headTop + 15, 2, 4, '#0f172a');
    } else if (faceTat === 'under_eye_cross') {
      p(3, headTop + 16, 2, 4, '#0f172a');
      p(2, headTop + 17, 4, 2, '#0f172a');
    } else if (faceTat === 'cheek_script') {
      p(3, headTop + 17, 5, 2, '#1e293b');
    } else if (faceTat === 'temple_crown') {
      p(5, headTop + 8, 4, 2, '#334155');
      p(5, headTop + 6, 1, 2, '#0f172a');
      p(8, headTop + 6, 1, 2, '#0f172a');
    }
  }

  // 10. HAIRSTYLE (ALL STANDARD COMBINATIONS + SPECIAL HAIRCUTS)
  const hairLen: HairLengthV2 = v2 ? v2.hairLength : 'short';
  const hairTex: HairTextureV2 = v2 ? v2.hairTexture : 'straight';
  const spec = extras?.specialHair;

  if (spec) {
    if (spec === 'r9-2002') {
      p(-halfHw, headTop + 2, headW, isBack ? 18 : 6, skinShadow);
      if (!isBack) p(-6, headTop + 2, 12, 6, hair);
    } else if (spec === 'valderrama-afro') {
      const col = '#eab308';
      const colHi = '#fef08a';
      const colSh = '#854d0e';
      p(-halfHw - 8, headTop - 10, headW + 16, isBack ? 28 : 17, col);
      p(-halfHw - 10, headTop - 5, 8, 16, colSh);
      p(halfHw + 2, headTop - 5, 8, 16, colSh);
      p(-halfHw - 4, headTop - 10, headW + 8, 5, colHi);
    } else if (spec === 'davids-goggles') {
      p(-halfHw - 2, headTop - 1, headW + 4, isBack ? 24 : 9, '#18181b');
      for (const ox of [-halfHw - 3, -7, 4, halfHw]) {
        p(ox, headTop + 4, 3, 21, '#27272a');
      }
      if (!isBack) {
        p(-halfHw - 1, headTop + 12, headW + 2, 3, '#09090b');
        p(-8, headTop + 11, 7, 5, '#09090b');
        p(1, headTop + 11, 7, 5, '#09090b');
        p(-7, headTop + 12, 5, 3, '#f97316');
        p(2, headTop + 12, 5, 3, '#f97316');
      }
    } else if (spec === 'beckham-mohawk' || spec === 'vidal-crest' || spec === 'neymar-mohawk') {
      const crestCol = spec === 'vidal-crest' ? '#09090b' : spec === 'neymar-mohawk' ? '#facc15' : '#eab308';
      p(-halfHw, headTop + 3, headW, isBack ? 15 : 5, rootDark);
      p(-4, headTop - 9, 8, isBack ? 22 : 16, crestCol);
      p(-2, headTop - 11, 4, 6, adjustHex(crestCol, 40));
      if (spec === 'neymar-mohawk' && isBack) {
        p(-5, headTop + 10, 10, 14, crestCol);
      }
    } else if (spec === 'el-shaarawy-spikes') {
      p(-halfHw, headTop + 3, headW, isBack ? 16 : 6, '#09090b');
      p(-6, headTop - 13, 3, 18, hair);
      p(-2, headTop - 16, 4, 21, hair);
      p(3, headTop - 12, 3, 17, hair);
    } else if (spec === 'taribo-west') {
      p(-halfHw, headTop + 3, headW, isBack ? 15 : 6, '#18181b');
      p(-10, headTop - 7, 5, 10, '#10b981');
      p(-10, headTop, 5, 2, '#ef4444');
      p(5, headTop - 7, 5, 10, '#10b981');
      p(5, headTop, 5, 2, '#ef4444');
    } else if (spec === 'ronaldo-noodle') {
      p(-halfHw, headTop + 2, headW, isBack ? 15 : 6, '#1c1917');
      for (let x = -halfHw; x < halfHw - 2; x += 4) {
        p(x, headTop - 2, 3, 7, '#eab308');
      }
    } else if (spec === 'pogba-razor') {
      p(-halfHw, headTop + 2, headW, isBack ? 16 : 7, '#18181b');
      p(2, headTop - 1, 8, 5, '#06b6d4');
      p(-halfHw + 1, headTop + 5, 5, 2, '#ffffff');
    } else if (spec === 'puyol-curly' || spec === 'cucurella-afro') {
      const col = spec === 'cucurella-afro' ? '#09090b' : '#1c1917';
      const colSh = '#27272a';
      p(-halfHw - 6, headTop - 7, headW + 12, isBack ? 28 : 15, col);
      p(-halfHw - 7, headTop + 3, 6, 22, colSh);
      p(halfHw + 1, headTop + 3, 6, 22, colSh);
    } else if (spec === 'zidane-bald-ring') {
      p(-halfHw + 2, headTop + 2, headW - 4, 4, skinHighlight);
      p(-halfHw, headTop + 6, 3, 8, rootHair);
      p(halfHw - 3, headTop + 6, 3, 8, rootHair);
      if (isBack) p(-halfHw, headTop + 8, headW, 8, rootHair);
    } else {
      // cornrows / locs / braid-top / baggio-ponytail
      p(-halfHw - 1, headTop, headW + 2, isBack ? 18 : 8, rootHair);
      for (let ox = -halfHw + 2; ox < halfHw - 1; ox += 4) {
        p(ox, headTop, 2, isBack ? 22 : 8, hairDark);
      }
      if (isBack && (spec === 'locs' || spec === 'baggio-ponytail')) {
        p(-5, headTop + 14, 10, 14, hair);
      }
    }
  } else if (hairLen === 'shaven') {
    p(-halfHw + 2, headTop + 2, headW - 4, 5, skin);
    p(-halfHw + 3, headTop + 2, headW - 6, 2, skinHighlight);
    if (isBack) p(-halfHw + 1, headTop + 4, headW - 2, 14, skin);
  } else if (hairLen === 'fade') {
    p(-halfHw, headTop + 4, headW, isBack ? 8 : 4, adjustHex(rootHair, -18));
    if (hairTex === 'straight') {
      p(-halfHw - 1, headTop - 1, headW + 2, 6, hair);
      p(-6, headTop - 1, 12, 2, hairHi);
    } else if (hairTex === 'wavy') {
      p(-halfHw - 1, headTop - 2, headW + 2, 7, hair);
      p(-7, headTop - 3, 6, 2, hairHi);
      p(1, headTop - 3, 6, 2, hairHi);
    } else if (hairTex === 'curly') {
      p(-halfHw - 2, headTop - 4, headW + 4, 9, hair);
      p(-7, headTop - 5, 14, 2, hairHi);
    } else if (hairTex === 'braids') {
      p(-halfHw - 1, headTop - 1, headW + 2, 6, hair);
      for (const ox of [-7, -3, 1, 5]) p(ox, headTop - 2, 2, 7, hairDark);
    } else {
      // high-top sponge fade dreads
      p(-9, headTop - 5, 5, 10, hair);
      p(-3, headTop - 6, 6, 11, hairHi);
      p(4, headTop - 5, 5, 10, hair);
    }
  } else if (hairLen === 'short') {
    if (hairTex === 'straight') {
      p(-halfHw - 1, headTop - 2, headW + 2, isBack ? 17 : 9, hair);
      p(-halfHw - 1, headTop + 4, 3, 6, hairDark);
      p(halfHw - 2, headTop + 4, 3, 6, hairDark);
      p(-6, headTop - 2, 10, 3, hairHi);
    } else if (hairTex === 'wavy') {
      p(-halfHw - 2, headTop - 3, headW + 4, isBack ? 18 : 10, hair);
      p(-8, headTop - 4, 7, 3, hairHi);
      p(2, headTop - 3, 7, 3, hairHi);
    } else if (hairTex === 'curly') {
      p(-halfHw - 2, headTop - 5, headW + 4, isBack ? 20 : 12, hair);
      p(-halfHw - 3, headTop + 4, 3, 7, hairDark);
      p(halfHw, headTop + 4, 3, 7, hairDark);
      p(-6, headTop - 5, 12, 3, hairHi);
    } else if (hairTex === 'braids') {
      p(-halfHw - 1, headTop - 1, headW + 2, isBack ? 16 : 8, hair);
      for (const ox of [-8, -4, 0, 4, 7]) p(ox, headTop + 2, 2, isBack ? 15 : 8, hairDark);
    } else {
      p(-halfHw - 2, headTop - 3, headW + 4, isBack ? 15 : 9, hair);
      p(-halfHw - 4, headTop + 2, 3, 10, hairDark);
      p(halfHw + 1, headTop + 2, 3, 10, hairDark);
    }
  } else if (hairLen === 'medium') {
    if (hairTex === 'straight') {
      p(-halfHw - 2, headTop - 2, headW + 4, isBack ? 22 : 10, hair);
      p(-halfHw - 3, headTop + 6, 4, 14, hairDark);
      p(halfHw - 1, headTop + 6, 4, 14, hairDark);
      p(-6, headTop - 2, 12, 3, hairHi);
    } else if (hairTex === 'wavy') {
      p(-halfHw - 3, headTop - 3, headW + 6, isBack ? 23 : 11, hair);
      p(-halfHw - 4, headTop + 6, 5, 14, hair);
      p(halfHw - 1, headTop + 6, 5, 14, hair);
      p(-7, headTop - 4, 14, 3, hairHi);
    } else if (hairTex === 'curly') {
      p(-halfHw - 4, headTop - 7, headW + 8, isBack ? 24 : 14, hair);
      p(-9, headTop - 8, 18, 3, hairHi);
      p(-halfHw - 4, headTop + 6, 4, 10, hairDark);
      p(halfHw, headTop + 6, 4, 10, hairDark);
    } else if (hairTex === 'braids') {
      p(-halfHw - 1, headTop - 1, headW + 2, isBack ? 20 : 9, hair);
      for (const ox of [-11, -7, 4, 8]) p(ox, headTop + 3, 3, 19, hairDark);
      if (isBack) for (const ox of [-4, 1]) p(ox, headTop + 12, 3, 14, hair);
    } else {
      p(-halfHw - 2, headTop - 2, headW + 4, isBack ? 21 : 10, hair);
      for (const ox of [-12, -8, 4, 8]) p(ox, headTop + 2, 4, 20, hairDark);
      if (isBack) for (const ox of [-4, 0]) p(ox, headTop + 13, 4, 14, hair);
    }
  } else {
    // long
    if (hairTex === 'straight') {
      p(-halfHw - 2, headTop - 2, headW + 4, isBack ? 22 : 10, hair);
      p(-6, headTop - 2, 12, 3, hairHi);
      if (isBack) {
        p(-6, headTop + 17, 12, 15, hairDark);
        p(-4, headTop + 15, 8, 3, trim);
      } else {
        p(-halfHw - 3, headTop + 7, 4, 18, hairDark);
        p(halfHw - 1, headTop + 7, 4, 18, hairDark);
      }
    } else if (hairTex === 'wavy') {
      p(-halfHw - 3, headTop - 3, headW + 6, isBack ? 25 : 11, hair);
      p(-halfHw - 5, headTop + 7, 5, 20, hairDark);
      p(halfHw, headTop + 7, 5, 20, hairDark);
      if (isBack) p(-9, headTop + 20, 18, 10, hair);
      p(-8, headTop - 4, 16, 3, hairHi);
    } else if (hairTex === 'curly') {
      p(-halfHw - 6, headTop - 9, headW + 12, isBack ? 30 : 18, hair);
      p(-12, headTop - 11, 24, 4, hair);
      p(-9, headTop - 10, 8, 3, hairHi);
      p(2, headTop - 9, 8, 3, hairHi);
    } else if (hairTex === 'braids') {
      p(-halfHw - 2, headTop - 1, headW + 4, isBack ? 22 : 10, hair);
      for (const ox of [-12, -8, 5, 9]) {
        p(ox, headTop + 3, 3, 25, hair);
        p(ox, headTop + 25, 3, 2, '#facc15');
      }
      if (isBack) for (const ox of [-4, 1]) p(ox, headTop + 16, 3, 15, hairDark);
    } else {
      // long dreads
      p(-halfHw - 3, headTop - 3, headW + 6, isBack ? 24 : 11, hair);
      for (const ox of [-13, -9, 5, 9]) {
        p(ox, headTop + 2, 4, 26, hairDark);
        p(ox, headTop + 25, 4, 2, '#cbd5e1');
      }
      if (isBack) for (const ox of [-5, 1]) p(ox, headTop + 17, 4, 15, hair);
    }
  }

  // 11. HEADWEAR / GLASSES / PROTECTIVE MASK (with custom colors)
  const headwear: HeadwearV2 = v2 ? v2.headwear : 'none';
  if (headwear === 'sports_headband') {
    const bandCol = normalizeHex(extras?.headbandColor, lum(trim) > 0.7 ? '#f8fafc' : trim);
    const bandDark = adjustHex(bandCol, -36);
    p(-halfHw - 1, headTop + 4, headW + 2, 5, bandCol);
    p(-halfHw - 1, headTop + 6, headW + 2, 1, bandDark);
  } else if (headwear === 'performance_elastic_band') {
    const bandCol = normalizeHex(extras?.headbandColor, '#0f172a');
    p(-halfHw - 1, headTop + 3, headW + 2, 3, bandCol);
    if (!isBack) p(-3, headTop + 3, 6, 3, '#38bdf8');
  } else if (headwear === 'protective_face_mask') {
    if (isBack) {
      p(-halfHw - 1, headTop + 12, headW + 2, 3, '#0f172a');
    } else {
      p(-halfHw - 1, headTop + 9, headW + 2, 9, '#1e293b');
      p(-8, headTop + 9, 16, 3, '#475569');
      p(-7, headTop + 12, 5, 4, skinShadow);
      p(2, headTop + 12, 5, 4, skinShadow);
      p(-2, headTop + 14, 4, 4, '#0f172a');
    }
  } else if (headwear === 'sports_glasses') {
    const lensCol = normalizeHex(extras?.glassesColor, '#2563eb');
    const lensHi = adjustHex(lensCol, 45);
    if (isBack) {
      p(-halfHw - 1, headTop + 12, headW + 2, 3, '#1e293b');
    } else {
      p(-halfHw - 1, headTop + 13, headW + 2, 2, '#0f172a');
      p(-9, headTop + 11, 8, 6, '#0f172a');
      p(1, headTop + 11, 8, 6, '#0f172a');
      p(-8, headTop + 12, 6, 4, lensCol);
      p(2, headTop + 12, 6, 4, lensCol);
      p(-7, headTop + 12, 2, 2, lensHi);
      p(3, headTop + 12, 2, 2, lensHi);
    }
  }

  // 12. EARRINGS (Independent Left & Right with Material & Gemstone)
  const earL: EarringSlotV2 | null = v2 ? v2.earrings.left : null;
  const earR: EarringSlotV2 | null = v2 ? v2.earrings.right : null;
  const drawEarringSlot = (side: -1 | 1, slot: EarringSlotV2 | null) => {
    if (!slot || slot.style === 'none') return;
    const mat = EARRING_MATERIAL_HEX[slot.material] || '#e2e8f0';
    const matDark = adjustHex(mat, -45);
    const gem = EARRING_GEM_HEX[slot.gem] || '#bae6fd';
    const ex = side < 0 ? -halfHw - 2 : halfHw;
    const ey = headTop + 15;
    if (slot.style === 'studs') {
      p(ex, ey, 2, 2, mat);
    } else if (slot.style === 'small_barbell') {
      p(ex, ey, 2, 4, mat);
      p(ex, ey + 2, 2, 1, matDark);
    } else if (slot.style === 'large_barbell') {
      p(ex, ey, 2, 6, mat);
      p(ex, ey + 2, 2, 2, matDark);
      p(ex, ey + 5, 2, 2, mat);
    } else if (slot.style === 'gem') {
      p(ex, ey, 2, 4, mat);
      p(ex, ey + 1, 2, 2, gem);
    }
  };
  drawEarringSlot(-1, earL);
  drawEarringSlot(1, earR);

  ctx.restore();
}
