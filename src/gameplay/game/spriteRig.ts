import type {
  AppearanceV2,
  ArmTattooV2,
  EarringGemV2,
  EarringMaterialV2,
  EarringSlotV2,
  FaceTattooV2,
  FacialHairV2,
  HairLengthV2,
  HairTextureV2,
  HeadwearV2,
  LimbLengthV2,
  NeckTattooV2,
  NecklaceV2,
  PlayerAppearance,
  StreetwearHatStyle,
  StreetwearOutfit,
} from '../types';
import {
  HAIR_COLOR_HEX_V2,
  getEffectiveHairHexV2,
  getSkinToneHexV2,
  isAppearanceV2,
} from './appearanceV2';
import { getBodyProfile } from './bodyProfile';

/**
 * Skeleton-rig renderer drawn at 2x (96x120, dive family 140x120) or 1x (48x60, dive 70x60).
 * Limbs are thick segments between SHARED joints (hip->knee->foot, shoulder->elbow->hand)
 * so they can never detach. Baked once per frame and cached by sprites.ts.
 */
export const RIG_RES = 2;

/**
 * Logical px the body travels per full stride cycle, indexed by leg length (short / normal / long).
 * The stance foot moves back at exactly this speed (reach = cyclePx / 2), so feet never slide.
 */
export const RIG_CYCLE_PX_BY_LEG: Record<LimbLengthV2, Record<string, number>> = {
  short:  { walk: 8,  jog: 16, run: 22, sprint: 28, dribbling: 14, jockey: 12 },
  normal: { walk: 10, jog: 20, run: 28, sprint: 34, dribbling: 16, jockey: 14 },
  long:   { walk: 12, jog: 24, run: 34, sprint: 40, dribbling: 18, jockey: 16 },
};

/** Backwards-compatible default stride table for normal legs. */
export const RIG_CYCLE_PX: Record<string, number> = RIG_CYCLE_PX_BY_LEG.normal;

export function getRigCyclePx(gait: string, legsLength: LimbLengthV2 = 'normal'): number {
  const table = RIG_CYCLE_PX_BY_LEG[legsLength] || RIG_CYCLE_PX_BY_LEG.normal;
  return table[gait] ?? table.run;
}

export const RIG_ACTIONS = new Set([
  'running',
  'running_walk',
  'running_jog',
  'running_run',
  'running_sprint',
  'wrestle',
  'idle',
  'dribbling',
  'deceleration_skid',
  'standing_tackle',
  'defensive_jockey',
  'goalkeeper_dive',
  'gk_fingertip_parry',
  'gk_low_smother',
  'gk_high_catch',
  'gk_punch',
  'gk_star_spread',
  'goalkeeper_penalty_anticipate',
]);

const KICK_RE = /^(?:standing_|running_)?(?:shooting|sidefoot_push|curling_finesse|trivela|pass|long_pass|cross|shot|chipped_cross|chipped_long_pass|chip_shot|scoop_chip|driven_laces_strike|knuckle_shot|knuckle_pass|special_curl_pass|special_curl_shot|freekick_strike|penalty_strike|kicking|passing|crossing|clear|clearance|clearing|kick)(?:_low|_mid|_high)?$/;
const HEAD_RE = /^(?:heading|bullet_header|glancing_header)$/;

/** Ball actions + jockey + tackle that the rig draws. */
const FAMS: Record<string, string> = {
  step_overs: 'footwork',
  elastico: 'footwork',
  around_the_world: 'footwork',
  heel_chop: 'footwork',
  roulette: 'footwork',
  close_control: 'footwork',
  ginga_juggle: 'footwork',
  nutmeg_dash: 'footwork',
  body_feint: 'feint',
  cruyff_turn: 'turn',
  rainbow_flick: 'flick',
  sombrero: 'flick',
  backheel_flick: 'flick',
  trapping: 'trap',
  shielding: 'shield',
  contested_duel: 'shield',
  shirt_pull: 'shield',
  pushing_foul: 'shield',
  volley: 'volley',
  half_volley: 'volley',
  side_volley: 'volley',
  rabona_volley: 'volley',
  flying_heel_volley: 'volley',
  sombrero_volley: 'volley',
  chest_volley: 'chest',
  freekick_stance: 'stanceK',
  penalty_stance: 'stanceK',
  penalty_runup: 'stanceK',
  wall_stance: 'wall',
  wall_jump: 'wallJump',
  throw_in: 'throwIn',
  throw_in_throw: 'throwOut',
  celebrating: 'celebrate',
};

const FLIP_RE = /^(?:bicycle_kick|scissor_kick|scorpion_kick)$/;
const SLIDE_RE = /^(?:sliding_tackle|sliding_toe_poke|fouled_falling|gk_recovery_roll)$/;
const DIVEL_RE = /^(?:diving_header|diving_volley)$/;

/** All distinct representative actions supported by the skeleton rig (used by clip & connectivity tests). */
export const ALL_RIG_TEST_ACTIONS: readonly string[] = [
  'idle',
  'running_walk',
  'running_jog',
  'running_run',
  'running_sprint',
  'dribbling',
  'deceleration_skid',
  'wrestle',
  'standing_tackle',
  'defensive_jockey',
  'goalkeeper_penalty_anticipate',
  'gk_star_spread',
  'gk_high_catch',
  'gk_punch',
  'goalkeeper_dive',
  'gk_fingertip_parry',
  'gk_low_smother',
  'standing_pass_low',
  'running_shot_mid',
  'running_long_pass_high',
  'heading',
  'bullet_header',
  'step_overs',
  'body_feint',
  'cruyff_turn',
  'rainbow_flick',
  'trapping',
  'shielding',
  'volley',
  'chest_volley',
  'freekick_stance',
  'wall_stance',
  'wall_jump',
  'throw_in',
  'throw_in_throw',
  'celebrating',
  'bicycle_kick',
  'sliding_tackle',
  'fouled_falling',
  'diving_header',
] as const;

type Spec = { lean: number; air: number; drop: number; shift: number; lead: number[]; rear: number[]; aL: number[]; aR: number[] };

function specFor(f: string, kt: number): Spec {
  const t = (kt / 6) * Math.PI * 2, sn = Math.sin(t), cs = Math.cos(t);
  const base: Spec = { lean: 0, air: 0, drop: 0, shift: 0, lead: [2, 0], rear: [0, 0], aL: [0, 15, 2], aR: [0, 15, 2] };
  switch (f) {
    case 'footwork': return { ...base, lean: 1, drop: 2, shift: sn * 2, lead: [10 * sn, 3 + 3 * (cs > 0 ? cs : 0)], rear: [-2, 0], aL: [3, 10, 6], aR: [-3, 10, 6] };
    case 'feint': return { ...base, lean: 1, drop: 3, shift: sn * 6, lead: [4, 0], rear: [-3, 0], aL: [4, 9, 8], aR: [-4, 9, 8] };
    case 'turn': return { ...base, lean: [2, 1, -1, -3, -2, 0][kt], drop: 2, shift: [0, 2, 4, 3, 1, 0][kt], lead: [[8, 4, -2, -10, -6, 0][kt], 3], rear: [-3, 0], aL: [6, 9, 8], aR: [-6, 9, 8] };
    case 'flick': return { ...base, lean: -2, lead: [-12, [3, 8, 12, 12, 6, 2][kt]], rear: [2, 0], aL: [4, 8, 9], aR: [-4, 8, 9] };
    case 'trap': return { ...base, lean: -2, lead: [9, [3, 6, 7, 7, 4, 1][kt]], rear: [-2, 0], aL: [5, 9, 8], aR: [-5, 9, 8] };
    case 'shield': return { ...base, lean: -1, drop: 3, shift: sn * 1.5, lead: [-3, 0], rear: [3, 0], aL: [-4, 7, 11], aR: [4, 7, 11] };
    case 'volley': return { ...base, lean: -3, air: [0, 4, 8, 8, 4, 0][kt], lead: [kt < 2 ? -8 : 14, kt < 2 ? 3 : kt === 2 ? 10 : 11], rear: [-2, 2], aL: [-4, 8, 11], aR: [5, 6, 11] };
    case 'chest': return { ...base, lean: -5, air: [0, 3, 6, 6, 3, 0][kt], lead: [4, 6], rear: [-3, 3], aL: [-3, 9, 10], aR: [3, 9, 10] };
    case 'stanceK': return { ...base, lean: 1, drop: 1, lead: [-6, 2], rear: [3, 0], aL: [-2, 14, 5], aR: [2, 14, 5] };
    case 'wall': return { ...base, lean: 0, lead: [0, 0], rear: [0, 0], aL: [0, 16, -3], aR: [0, 16, -3] };
    case 'wallJump': return { ...base, air: [0, 4, 9, 9, 4, 0][kt], lead: [0, 4], rear: [0, 4], aL: [0, 14, 3], aR: [0, 14, 3] };
    case 'throwIn': return { ...base, lean: -2, lead: [5, 0], rear: [-4, 0], aL: [1, -19, 4], aR: [1, -19, -2] };
    case 'throwOut': return { ...base, lean: 4, drop: 2, lead: [10, 0], rear: [-7, 0], aL: [10, 4, 3], aR: [10, 4, -2] };
    case 'celebrate': return { ...base, air: [0, 5, 9, 9, 5, 0][kt], lead: [0, 3], rear: [0, 3], aL: [0, -20, 10], aR: [0, -20, 10] };
  }
  return base;
}

export function isRigAction(a: string): boolean {
  return RIG_ACTIONS.has(a) || KICK_RE.test(a) || HEAD_RE.test(a) || !!FAMS[a] || FLIP_RE.test(a) || SLIDE_RE.test(a) || DIVEL_RE.test(a);
}

const NUM_FONT = [
  '01110,10001,10011,10101,11001,10001,01110', '00100,01100,00100,00100,00100,00100,01110',
  '01110,10001,00001,00010,00100,01000,11111', '11110,00001,00001,01110,00001,00001,11110',
  '00010,00110,01010,10010,11111,00010,00010', '11111,10000,11110,00001,00001,10001,01110',
  '00110,01000,10000,11110,10001,10001,01110', '11111,00001,00010,00100,01000,01000,01000',
  '01110,10001,10001,01110,10001,10001,01110', '01110,10001,10001,01111,00001,00010,01100',
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

function normalizeRigHex(hex: string | undefined, fallback = '#808080'): string {
  if (!hex || typeof hex !== 'string') return fallback;
  const trimmed = hex.trim();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed;
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return fallback;
}

function lum(hex: string): number {
  const clean = normalizeRigHex(hex, '#4c4c4c').slice(1);
  const v = parseInt(clean, 16);
  return (0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) / 255;
}

function shade(hex: string, f: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(normalizeRigHex(hex, ''));
  if (!m) return hex;
  const v = parseInt(m[1], 16);
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n * f)));
  return `rgb(${c((v >> 16) & 255)},${c((v >> 8) & 255)},${c(v & 255)})`;
}

function shadeHi(hex: string, f: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(normalizeRigHex(hex, ''));
  if (!m) return hex;
  const v = parseInt(m[1], 16);
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n * f + (f > 1 ? 14 : 0))));
  return `rgb(${c((v >> 16) & 255)},${c((v >> 8) & 255)},${c(v & 255)})`;
}

export interface RigExtraStyleOptions {
  rawSkinHex?: string;
  rawHairRootHex?: string;
  rawHairDyeHex?: string;
  specialHair?: string;
  headbandColor?: string;
  glassesColor?: string;
  regularGlassesDesign?: 'round' | 'square' | 'rectangular';
  regularGlassesFrameColor?: string;
  regularGlassesShade?: string;
  kitPattern?: string;
  kitCollar?: string;
  streetOutfit?: StreetwearOutfit;
}

export interface RigRenderSurface {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
  translate(x: number, y: number): void;
  imageSmoothingEnabled: boolean;
}

export function getRigCanvasDimensions(
  action: string,
  res: 1 | 2 = 2
): { width: number; height: number; offsetX: number; ground: number } {
  const diveFamily =
    action === 'goalkeeper_dive' ||
    action === 'gk_fingertip_parry' ||
    action === 'gk_low_smother' ||
    FLIP_RE.test(action) ||
    SLIDE_RE.test(action) ||
    DIVEL_RE.test(action);
  const w2 = diveFamily ? 140 : 96;
  const h2 = 120;
  const ox2 = diveFamily ? 34 : 12;
  const g2 = 111;
  if (res === 1) {
    return {
      width: Math.round(w2 / 2),
      height: Math.round(h2 / 2),
      offsetX: Math.round(ox2 / 2),
      ground: Math.round(g2 / 2),
    };
  }
  return {
    width: w2,
    height: h2,
    offsetX: ox2,
    ground: g2,
  };
}

/**
 * Pure stride-position evaluator for a given leg length & gait at continuous phase pBase in [0, 1).
 * Exposed for automated stride-lock verification.
 */
export function evaluateRunningFootOffset(
  pBase: number,
  side: -1 | 1,
  gait: 'walk' | 'jog' | 'run' | 'sprint' | 'dribbling',
  legsLength: LimbLengthV2,
  dirX: number,
  dirY: number
): { footDxRigPx: number; footDyRigPx: number; inStance: boolean } {
  const reach = getRigCyclePx(gait, legsLength) / 2;
  const lq = ((pBase + (side > 0 ? 0 : 0.5)) % 1 + 1) % 1;
  const sw = lq < 0.5 ? 1 - 4 * lq : -1 + 4 * (lq - 0.5);
  const liftScale = gait === 'walk' ? 0.25 : gait === 'jog' ? 0.6 : gait === 'run' ? 1.0 : gait === 'sprint' ? 1.35 : 0.45;
  const legLiftMult = legsLength === 'short' ? 0.85 : legsLength === 'long' ? 1.12 : 1.0;
  const lift = (lq < 0.5 ? 0 : Math.sin(Math.PI * (lq - 0.5) / 0.5)) * liftScale * legLiftMult;
  return {
    footDxRigPx: dirX * sw * reach,
    footDyRigPx: -lift * 9 + dirY * sw * (reach * 0.27),
    inStance: lq < 0.5,
  };
}

type RectFn = (x: number, y: number, w: number, h: number, c: string) => void;
type SegFn = (x0: number, y0: number, x1: number, y1: number, t: number, c: string) => void;

function drawArmTattooV2(
  R: RectFn,
  S: SegFn,
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  hxp: number,
  hyp: number,
  upperArmT: number,
  foreArmT: number,
  tat: string,
  hasShortInteriorSleeve: boolean
): void {
  if (!tat || tat === 'none') return;
  const lerp = (p: number, q: number, f: number) => p + (q - p) * f;
  const inkDark = '#0f172a';
  const inkMid = '#1e293b';
  const inkPetal = '#9f1239';
  const inkLeaf = '#0f766e';
  const foreT = Math.max(2, foreArmT - 1);
  const upT = Math.max(2, upperArmT - 1);

  if (tat === 'double_stripe_band') {
    S(lerp(ex, hxp, 0.22), lerp(ey, hyp, 0.22), lerp(ex, hxp, 0.36), lerp(ey, hyp, 0.36), Math.max(2, foreT), inkDark);
    S(lerp(ex, hxp, 0.56), lerp(ey, hyp, 0.56), lerp(ex, hxp, 0.70), lerp(ey, hyp, 0.70), Math.max(2, foreT), inkDark);
    return;
  }
  if (tat === 'forearm-ink' || tat === 'script_name_sleeve') {
    S(lerp(ex, hxp, 0.14), lerp(ey, hyp, 0.14), lerp(ex, hxp, 0.34), lerp(ey, hyp, 0.34), Math.max(2, foreT - 1), inkMid);
    R(lerp(ex, hxp, 0.45) - 1, lerp(ey, hyp, 0.45) - 1, 2, 2, inkDark);
    S(lerp(ex, hxp, 0.62), lerp(ey, hyp, 0.62), lerp(ex, hxp, 0.84), lerp(ey, hyp, 0.84), Math.max(2, foreT - 1), inkMid);
    return;
  }
  if (tat === 'tribal_sleeve' || tat === 'full-sleeve') {
    if (!hasShortInteriorSleeve) {
      S(lerp(sx, ex, 0.58), lerp(sy, ey, 0.58), ex, ey, upT, inkDark);
    }
    S(ex, ey, lerp(ex, hxp, 0.45), lerp(ey, hyp, 0.45), foreT, inkMid);
    S(lerp(ex, hxp, 0.55), lerp(ey, hyp, 0.55), lerp(ex, hxp, 0.88), lerp(ey, hyp, 0.88), foreT, inkDark);
    return;
  }
  if (tat === 'floral_mandala_sleeve') {
    if (!hasShortInteriorSleeve) {
      S(lerp(sx, ex, 0.62), lerp(sy, ey, 0.62), ex, ey, upT, inkMid);
    }
    S(ex, ey, lerp(ex, hxp, 0.82), lerp(ey, hyp, 0.82), foreT, inkMid);
    R(ex - 1, ey - 1, 2, 2, inkPetal);
    R(lerp(ex, hxp, 0.52) - 1, lerp(ey, hyp, 0.52) - 1, 2, 2, inkLeaf);
    R(lerp(ex, hxp, 0.72) - 1, lerp(ey, hyp, 0.72) - 1, 2, 2, inkPetal);
    return;
  }
  if (tat === 'blackout_sleeve') {
    if (!hasShortInteriorSleeve) {
      S(lerp(sx, ex, 0.52), lerp(sy, ey, 0.52), ex, ey, Math.max(2, upperArmT), inkDark);
    }
    S(ex, ey, hxp, hyp, Math.max(2, foreArmT), inkDark);
  }
}

function drawNeckTattooV2(
  R: RectFn,
  hdx: number,
  neckDrawTop: number,
  neckDrawH: number,
  neckW: number,
  neckTattoo: NeckTattooV2
): void {
  if (neckTattoo === 'none' || neckDrawH < 2) return;
  const ny = neckDrawTop;
  const nh = Math.max(2, neckDrawH - 1);
  if (neckTattoo === 'blackout_neck') {
    R(hdx - neckW / 2, ny, neckW, nh, '#0f172a');
    return;
  }
  if (neckTattoo === 'script_lettering') {
    R(hdx - neckW / 2, ny + Math.floor(nh / 2), Math.max(2, neckW - 2), 2, '#1e293b');
    return;
  }
  if (neckTattoo === 'rose') {
    const rx = hdx + Math.max(0, Math.floor(neckW / 2) - 3);
    R(rx, ny, 2, nh, '#1e293b');
    R(rx, ny, 3, 2, '#9f1239');
    return;
  }
  if (neckTattoo === 'winger_crest') {
    R(hdx - Math.floor(neckW / 2), ny, 2, Math.max(2, nh), '#1e293b');
    R(hdx + Math.floor(neckW / 2) - 2, ny, 2, Math.max(2, nh), '#1e293b');
    R(hdx - 1, ny + Math.max(0, nh - 2), 2, 2, '#334155');
  }
}

function drawNecklaceV2(
  R: RectFn,
  hdx: number,
  shY: number,
  neckW: number,
  back: boolean,
  necklace: NecklaceV2
): void {
  if (necklace === 'none') return;
  const span = Math.max(6, neckW + 4);
  if (back) {
    const col = necklace === 'silver_necklace' || necklace === 'military_tag' ? '#cbd5e1' : '#facc15';
    R(hdx - span / 2 + 1, shY, span - 2, 2, col);
    return;
  }
  if (necklace === 'military_tag') {
    R(hdx - span / 2, shY, 2, 2, '#94a3b8');
    R(hdx + span / 2 - 2, shY, 2, 2, '#94a3b8');
    R(hdx - 2, shY + 1, 4, 2, '#94a3b8');
    R(hdx - 2, shY + 2, 4, 4, '#cbd5e1');
    R(hdx - 1, shY + 3, 2, 2, '#475569');
    return;
  }
  if (necklace === 'silver_necklace') {
    R(hdx - span / 2, shY, 2, 2, '#cbd5e1');
    R(hdx + span / 2 - 2, shY, 2, 2, '#cbd5e1');
    R(hdx - 3, shY + 1, 6, 2, '#e2e8f0');
    return;
  }
  if (necklace === 'gold_necklace') {
    R(hdx - span / 2, shY, 2, 3, '#ca8a04');
    R(hdx + span / 2 - 2, shY, 2, 3, '#ca8a04');
    R(hdx - 4, shY + 1, 8, 3, '#facc15');
    return;
  }
  if (necklace === 'diamond_encrusted_gold_necklace') {
    R(hdx - span / 2, shY, 2, 3, '#facc15');
    R(hdx + span / 2 - 2, shY, 2, 3, '#facc15');
    R(hdx - 4, shY + 1, 8, 3, '#facc15');
    R(hdx - 3, shY + 1, 2, 2, '#e0f2fe');
    R(hdx + 1, shY + 1, 2, 2, '#e0f2fe');
    R(hdx - 2, shY + 3, 4, 4, '#facc15');
    R(hdx - 1, shY + 4, 2, 2, '#f8fafc');
  }
}

function drawEarringsV2(
  R: RectFn,
  hdx: number,
  hw: number,
  headTop: number,
  fx: number,
  earLeft: EarringSlotV2 | null,
  earRight: EarringSlotV2 | null,
  legacyEarrings: string
): void {
  const drawSlot = (side: -1 | 1, slot: EarringSlotV2) => {
    if (slot.style === 'none') return;
    const mat = EARRING_MATERIAL_HEX[slot.material] || '#e2e8f0';
    const matDark = shade(mat, 0.72);
    const gem = EARRING_GEM_HEX[slot.gem] || '#bae6fd';
    // Overlap 1px with head edge (hw/2) so connected component count is never fragmented
    const ex = side < 0 ? hdx - Math.floor(hw / 2) - 2 : hdx + Math.floor(hw / 2);
    const ey = headTop + 8;

    if (slot.style === 'studs') {
      R(ex, ey, 2, 2, mat);
    } else if (slot.style === 'small_barbell') {
      R(ex, ey, 2, 3, mat);
      R(ex, ey + 1, 2, 1, matDark);
    } else if (slot.style === 'large_barbell') {
      R(ex, ey, 2, 5, mat);
      R(ex, ey + 2, 2, 1, matDark);
      R(ex, ey + 4, 2, 2, mat);
    } else if (slot.style === 'gem') {
      R(ex, ey, 2, 3, mat);
      R(ex, ey + 1, 2, 2, gem);
    }
  };

  if (earLeft || earRight) {
    // Visible from front, diagonal, back-diagonal (outer ears), and profile (facing ear edge)
    const showLeft = fx <= 0 || fx > 0;
    const showRight = fx >= 0 || fx < 0;
    if (showLeft && earLeft) drawSlot(-1, earLeft);
    if (showRight && earRight) drawSlot(1, earRight);
    return;
  }

  if (legacyEarrings && legacyEarrings !== 'none') {
    if (legacyEarrings === 'left-stud' || legacyEarrings === 'dual-stud') R(hdx - Math.floor(hw / 2) - 2, headTop + 8, 2, 2, '#fde047');
    if (legacyEarrings === 'right-stud' || legacyEarrings === 'dual-stud') R(hdx + Math.floor(hw / 2), headTop + 8, 2, 2, '#fde047');
    if (legacyEarrings === 'small-hoop') R(hdx + Math.floor(hw / 2), headTop + 8, 2, 4, '#e5e7eb');
  }
}

function drawFacialHairV2(
  R: RectFn,
  hdx: number,
  headTop: number,
  headBottom: number,
  fx: number,
  skin: string,
  beardCol: string,
  facialHair: FacialHairV2
): void {
  if (facialHair === 'none') return;
  const cxJaw = hdx + fx * 2;
  const colDark = shade(beardCol, 0.72);
  const colMid = beardCol;
  const stub = shade(skin, 0.72);

  switch (facialHair) {
    case 'three_day_stubble': {
      R(cxJaw - 6, headBottom - 5, 12, 5, stub);
      R(cxJaw - 4, headTop + 10, 8, 2, stub);
      break;
    }
    case 'full_beard': {
      R(cxJaw - 7, headBottom - 7, 14, 7, colDark);
      R(cxJaw - 6, headBottom - 6, 12, 5, colMid);
      R(cxJaw - 4, headBottom - 6, 8, 2, shade(colMid, 1.15)); // mustache ridge
      break;
    }
    case 'well_kept_beard': {
      R(cxJaw - 6, headBottom - 5, 12, 5, colMid);
      R(cxJaw - 3, headTop + 10, 6, 2, colDark);
      break;
    }
    case 'mutton_chops': {
      R(hdx - 7 + fx, headBottom - 7, 4, 6, colMid);
      R(hdx + 3 + fx, headBottom - 7, 4, 6, colMid);
      break;
    }
    case 'royal_beard': {
      R(cxJaw - 4, headTop + 10, 8, 2, colMid); // mustache
      R(cxJaw - 2, headBottom - 4, 4, 5, colMid); // vertical chin strip
      break;
    }
    case 'goatee': {
      R(cxJaw - 4, headTop + 10, 8, 2, colMid);
      R(cxJaw - 3, headBottom - 4, 6, 5, colDark);
      break;
    }
    case 'chin_strap': {
      R(cxJaw - 7, headBottom - 6, 2, 5, colMid);
      R(cxJaw + 5, headBottom - 6, 2, 5, colMid);
      R(cxJaw - 6, headBottom - 3, 12, 3, colDark);
      break;
    }
    case 'mustache': {
      R(cxJaw - 4, headTop + 10, 8, 2, colMid);
      break;
    }
    case 'pointy_mustache': {
      R(cxJaw - 4, headTop + 10, 8, 2, colMid);
      R(cxJaw - 6, headTop + 8, 2, 3, colDark);
      R(cxJaw + 4, headTop + 8, 2, 3, colDark);
      break;
    }
    case 'classic_mustache': {
      R(cxJaw - 5, headTop + 10, 10, 3, colMid);
      R(cxJaw - 5, headTop + 12, 2, 2, colDark);
      R(cxJaw + 3, headTop + 12, 2, 2, colDark);
      break;
    }
  }
}

function drawFaceTattooV2(
  R: RectFn,
  hdx: number,
  headTop: number,
  fx: number,
  faceTattoo: FaceTattooV2
): void {
  if (faceTattoo === 'none') return;
  const ink = '#0f172a';
  const sideX = fx < 0 ? hdx - 5 : hdx + 3;

  if (faceTattoo === 'cheek_star') {
    R(sideX, headTop + 10, 4, 2, ink);
    R(sideX + 1, headTop + 9, 2, 4, ink);
  } else if (faceTattoo === 'under_eye_cross') {
    const ex = fx === 0 ? hdx + 3 : hdx + fx * 3;
    R(ex, headTop + 10, 2, 4, ink);
    R(ex - 1, headTop + 11, 4, 2, ink);
  } else if (faceTattoo === 'cheek_script') {
    R(sideX - 1, headTop + 10, 4, 2, '#1e293b');
    R(sideX + 1, headTop + 12, 4, 2, ink);
  } else if (faceTattoo === 'temple_crown') {
    const tx = fx < 0 ? hdx - 7 : hdx + 4;
    R(tx, headTop + 5, 4, 2, '#334155');
    R(tx, headTop + 3, 2, 2, ink);
    R(tx + 2, headTop + 3, 2, 2, ink);
  }
}

function drawHeadwearV2(
  R: RectFn,
  hdx: number,
  headTop: number,
  hw: number,
  fx: number,
  back: boolean,
  skin: string,
  trim: string,
  shirt: string,
  headwear: HeadwearV2,
  headbandColor?: string,
  glassesColor?: string,
  regularGlassesDesign?: 'round' | 'square' | 'rectangular',
  regularGlassesFrameColor?: string,
  regularGlassesShade?: string
): void {
  if (headwear === 'none') return;
  const x0 = hdx - Math.floor(hw / 2) - 1;
  const fullW = hw + 2;

  if (headwear === 'sports_headband') {
    const bandCol = headbandColor ? normalizeRigHex(headbandColor, '#f8fafc') : lum(trim) > 0.7 ? '#f8fafc' : trim;
    const stripeCol = headbandColor ? shade(bandCol, 0.78) : lum(shirt) < 0.25 ? '#dc2626' : shirt;
    R(x0, headTop + 2, fullW, 4, bandCol);
    R(x0, headTop + 3, fullW, 2, stripeCol);
    return;
  }

  if (headwear === 'performance_elastic_band') {
    const bandCol = headbandColor ? normalizeRigHex(headbandColor, '#0f172a') : '#0f172a';
    R(x0, headTop + 1, fullW, 2, bandCol);
    if (!back) R(hdx - 2 + fx * 2, headTop + 1, 4, 2, '#38bdf8');
    else R(hdx - 2, headTop + 1, 4, 2, '#475569');
    return;
  }

  if (headwear === 'protective_face_mask') {
    // Black carbon mask around eyes/nose + rear elastic strap in back view
    if (back) {
      R(x0, headTop + 6, fullW, 2, '#0f172a');
      return;
    }
    const ex = fx === 0 ? 0 : fx * 2;
    R(x0, headTop + 5, fullW, 6, '#1e293b');
    R(hdx - 4 + ex, headTop + 5, 8, 2, '#475569'); // brow ridge
    R(hdx - 5 + ex, headTop + 7, 3, 2, shade(skin, 0.9)); // left eye cutout
    R(hdx + 2 + ex, headTop + 7, 3, 2, shade(skin, 0.9)); // right eye cutout
    R(hdx - 1 + ex, headTop + 9, 2, 2, '#0f172a'); // nose guard bridge
    return;
  }

  if (headwear === 'sports_glasses') {
    if (regularGlassesDesign) {
      const frame = normalizeRigHex(regularGlassesFrameColor || '#334155', '#334155');
      const lenses: Record<string, string> = { tinted_black: '#111827', iridescent: '#a855f7', grey: '#94a3b8', gold: '#fbbf24', blue: '#38bdf8', pink: '#f472b6', red: '#ef4444', transparent: '#dbeafe' };
      const lens = lenses[regularGlassesShade || 'transparent'];
      const opacityShade = regularGlassesShade === 'transparent' ? 'rgba(219,234,254,0.18)' : lens;
      if (back) { R(x0, headTop + 7, fullW, 2, frame); return; }
      const ex = fx === 0 ? 0 : fx * 2;
      const y = headTop + 6;
      if (regularGlassesDesign === 'round') {
        for (const cx of [hdx - 4 + ex, hdx + 3 + ex]) {
          R(cx - 1, y, 4, 1, frame); R(cx - 2, y + 1, 1, 3, frame); R(cx + 3, y + 1, 1, 3, frame); R(cx - 1, y + 4, 4, 1, frame);
          R(cx, y + 1, 2, 3, opacityShade);
        }
      } else {
        const width = regularGlassesDesign === 'square' ? 5 : 6;
        for (const lx of [hdx - 7 + ex, hdx + 1 + ex]) {
          R(lx, y, width, 1, frame); R(lx, y + 1, 1, 3, frame); R(lx + width - 1, y + 1, 1, 3, frame); R(lx, y + 4, width, 1, frame);
          R(lx + 1, y + 1, width - 2, 3, opacityShade);
        }
      }
      R(hdx - 1 + ex, y + 1, 2, 1, frame); R(x0, y + 1, 3, 1, frame); R(x0 + fullW - 3, y + 1, 3, 1, frame);
      return;
    }
    const lensCol = glassesColor ? normalizeRigHex(glassesColor, '#38bdf8') : '#38bdf8';
    if (back) {
      R(x0, headTop + 7, fullW, 2, '#1e293b');
      return;
    }
    const ex = fx === 0 ? 0 : fx * 2;
    R(x0, headTop + 7, fullW, 2, '#0f172a'); // temple strap
    R(hdx - 6 + ex, headTop + 6, 5, 4, '#0f172a');
    R(hdx + 1 + ex, headTop + 6, 5, 4, '#0f172a');
    R(hdx - 5 + ex, headTop + 7, 3, 2, lensCol); // custom sport lens tint L
    R(hdx + 2 + ex, headTop + 7, 3, 2, lensCol); // custom sport lens tint R
  }
}

function drawStreetHatV2(
  R: RectFn,
  hdx: number,
  headTop: number,
  hw: number,
  fx: number,
  back: boolean,
  hatStyle: StreetwearHatStyle | undefined,
  hatColor: string | undefined
): void {
  if (!hatStyle || hatStyle === 'none') return;
  const col = normalizeRigHex(hatColor, '#1f2937');
  const darkCol = shade(col, 0.72);
  const hiCol = shadeHi(col, 1.18);
  const halfW = Math.floor(hw / 2);

  if (hatStyle === 'cap') {
    // Crown fits cleanly atop head without covering face/eyes
    R(hdx - halfW - 1, headTop - 3, hw + 2, 6, col);
    R(hdx - halfW + 1, headTop - 4, Math.max(6, hw - 2), 2, hiCol);
    if (!back) {
      // Curved baseball brim protruding along facing X
      const brimOffset = fx === 0 ? -5 : fx > 0 ? -2 : -8;
      R(hdx + brimOffset, headTop + 2, 10, 2, darkCol);
      R(hdx + brimOffset + 1, headTop + 3, 8, 1, shade(darkCol, 0.85));
    } else {
      // Back snapback strap & cutout
      R(hdx - 3, headTop + 1, 6, 2, darkCol);
      R(hdx - 2, headTop + 1, 4, 1, '#e2e8f0');
    }
    return;
  }

  if (hatStyle === 'beanie') {
    // Snug knit beanie dome + folded cuff
    R(hdx - halfW - 1, headTop - 3, hw + 2, 6, col);
    R(hdx - 3, headTop - 5, 6, 2, col);
    R(hdx - halfW - 1, headTop + 1, hw + 2, 3, hiCol);
    R(hdx - halfW - 1, headTop + 3, hw + 2, 1, darkCol);
  }
}

function drawHairV2(
  R: RectFn,
  hdx: number,
  headTop: number,
  hw: number,
  fx: number,
  back: boolean,
  skin: string,
  hair: string,
  hairLen: HairLengthV2,
  hairTex: HairTextureV2,
  specialHair?: string
): void {
  const top = headTop - 1;
  const hi = shadeHi(hair, 1.25);
  const sh = shade(hair, 0.68);
  const halfW = Math.floor(hw / 2);

  if (specialHair) {
    if (specialHair === 'r9-2002') {
      R(hdx - halfW, headTop + 1, hw, back ? 10 : 3, shade(skin, 0.88));
      if (!back) R(hdx - 4 + fx * 2, headTop + 1, 8, 4, hair);
      return;
    }
    if (specialHair === 'valderrama-afro') {
      R(hdx - 13, top - 6, 26, back ? 21 : 13, '#eab308');
      R(hdx - 10, top - 8, 20, 4, '#fef08a');
      return;
    }
    if (specialHair === 'davids-goggles') {
      R(hdx - halfW - 1, top, hw + 2, back ? 14 : 6, '#18181b');
      for (const ox of [-9, -5, 3, 7]) R(hdx + ox, top + 2, 2, 16, '#27272a');
      if (!back) {
        const ex = fx === 0 ? 0 : fx * 2;
        R(hdx - halfW - 1, headTop + 7, hw + 2, 2, '#09090b');
        R(hdx - 6 + ex, headTop + 6, 5, 4, '#f97316');
        R(hdx + 1 + ex, headTop + 6, 5, 4, '#f97316');
      }
      return;
    }
    if (specialHair === 'el-shaarawy-spikes') {
      R(hdx - halfW, top + 2, hw, back ? 10 : 4, '#09090b');
      R(hdx - 4, top - 8, 2, 11, hair);
      R(hdx - 1, top - 10, 3, 13, hair);
      R(hdx + 3, top - 7, 2, 10, hair);
      return;
    }
    if (specialHair === 'beckham-mohawk' || specialHair === 'vidal-crest' || specialHair === 'neymar-mohawk') {
      const col = specialHair === 'vidal-crest' ? '#09090b' : specialHair === 'neymar-mohawk' ? '#facc15' : '#eab308';
      R(hdx - halfW, top + 2, hw, back ? 10 : 4, sh);
      R(hdx - 3, top - 5, 6, back ? 14 : 9, col);
      if (specialHair === 'neymar-mohawk' && back) R(hdx - 3, top + 8, 6, 9, col);
      return;
    }
    if (specialHair === 'taribo-west') {
      R(hdx - halfW, top + 2, hw, back ? 10 : 4, '#18181b');
      R(hdx - 7, top - 4, 3, 7, '#10b981');
      R(hdx + 4, top - 4, 3, 7, '#10b981');
      R(hdx - 7, top + 1, 3, 2, '#ef4444');
      R(hdx + 4, top + 1, 3, 2, '#ef4444');
      return;
    }
    if (specialHair === 'ronaldo-noodle') {
      R(hdx - halfW, top + 1, hw, back ? 10 : 4, '#1c1917');
      for (const ox of [-6, -2, 2, 5]) R(hdx + ox, top - 2, 2, 5, '#eab308');
      return;
    }
    if (specialHair === 'pogba-razor') {
      R(hdx - halfW, top + 1, hw, back ? 10 : 5, '#18181b');
      R(hdx + 1, top - 1, 6, 4, '#06b6d4');
      R(hdx - halfW, top + 4, 4, 2, '#ffffff');
      return;
    }
    if (specialHair === 'puyol-curly' || specialHair === 'cucurella-afro') {
      const col = specialHair === 'cucurella-afro' ? '#09090b' : '#1c1917';
      R(hdx - 11, top - 4, 22, back ? 19 : 11, col);
      R(hdx - 12, top + 3, 4, 15, '#27272a');
      R(hdx + 8, top + 3, 4, 15, '#27272a');
      return;
    }
    if (specialHair === 'zidane-bald-ring') {
      R(hdx - 3, headTop + 1, 6, 2, shadeHi(skin, 1.12));
      R(hdx - halfW, headTop + 4, 2, 5, hair);
      R(hdx + halfW - 2, headTop + 4, 2, 5, hair);
      if (back) R(hdx - halfW, headTop + 6, hw, 5, hair);
      return;
    }
  }

  if (hairLen === 'shaven') {
    R(hdx - 3, headTop + 1, 6, 2, shadeHi(skin, 1.12));
    return;
  }

  if (hairLen === 'fade') {
    // Tapered skin-fade nape & temples + distinct top texture
    R(hdx - halfW, top + 4, hw, back ? 4 : 2, sh);
    if (hairTex === 'straight') {
      R(hdx - halfW - 1, top, hw + 2, 4, hair);
      R(hdx - 4, top, 8, 2, hi);
    } else if (hairTex === 'wavy') {
      R(hdx - halfW - 1, top - 1, hw + 2, 5, hair);
      R(hdx - 5, top - 2, 4, 2, hi);
      R(hdx + 1, top - 2, 4, 2, hi);
    } else if (hairTex === 'curly') {
      R(hdx - halfW - 2, top - 2, hw + 4, 6, hair);
      R(hdx - 5, top - 3, 10, 2, hi);
    } else if (hairTex === 'braids') {
      R(hdx - halfW - 1, top, hw + 2, 4, hair);
      R(hdx - 5, top - 1, 2, 5, sh);
      R(hdx - 1, top - 1, 2, 5, sh);
      R(hdx + 3, top - 1, 2, 5, sh);
    } else {
      // high-top sponge/twist fade dreads
      R(hdx - 7, top - 3, 4, 7, hair);
      R(hdx - 2, top - 4, 4, 8, hi);
      R(hdx + 3, top - 3, 4, 7, hair);
    }
    return;
  }

  if (hairLen === 'short') {
    if (hairTex === 'straight') {
      R(hdx - halfW - 1, top, hw + 2, back ? 10 : 5, hair);
      R(hdx - halfW - 1, top + 4, 2, 4, sh);
      R(hdx + halfW - 1, top + 4, 2, 4, sh);
      R(hdx - 4, top, 6, 2, hi);
    } else if (hairTex === 'wavy') {
      R(hdx - halfW - 2, top - 1, hw + 4, back ? 11 : 6, hair);
      R(hdx - 6, top - 2, 5, 2, hi);
      R(hdx + 1, top - 1, 5, 2, hi);
    } else if (hairTex === 'curly') {
      R(hdx - halfW - 2, top - 2, hw + 4, back ? 12 : 7, hair);
      R(hdx - halfW - 3, top + 3, 3, 5, sh);
      R(hdx + halfW, top + 3, 3, 5, sh);
      R(hdx - 4, top - 3, 8, 2, hi);
    } else if (hairTex === 'braids') {
      R(hdx - halfW - 1, top, hw + 2, back ? 9 : 5, hair);
      for (const ox of [-7, -3, 1, 5]) {
        R(hdx + ox, top + 2, 2, back ? 9 : 6, sh);
      }
    } else {
      // short locs fanning outward
      R(hdx - halfW - 1, top, hw + 2, back ? 8 : 5, hair);
      R(hdx - halfW - 3, top + 2, 3, 7, sh);
      R(hdx + halfW, top + 2, 3, 7, sh);
      R(hdx - 5, top - 2, 4, 3, hair);
      R(hdx + 1, top - 2, 4, 3, hair);
    }
    return;
  }

  if (hairLen === 'medium') {
    if (hairTex === 'straight') {
      R(hdx - halfW - 2, top, hw + 4, back ? 14 : 6, hair);
      R(hdx - halfW - 2, top + 5, 3, 9, sh);
      R(hdx + halfW - 1, top + 5, 3, 9, sh);
      R(hdx - 3, top, 6, 2, hi);
    } else if (hairTex === 'wavy') {
      R(hdx - halfW - 3, top - 1, hw + 6, back ? 15 : 7, hair);
      R(hdx - halfW - 3, top + 5, 4, 9, hair);
      R(hdx + halfW - 1, top + 5, 4, 9, hair);
      R(hdx - 5, top - 2, 10, 2, hi);
    } else if (hairTex === 'curly') {
      R(hdx - 11, top - 4, 22, back ? 16 : 9, hair);
      R(hdx - 9, top - 5, 18, 2, hi);
      R(hdx - 11, top + 5, 3, 6, sh);
      R(hdx + 8, top + 5, 3, 6, sh);
    } else if (hairTex === 'braids') {
      R(hdx - halfW - 1, top, hw + 2, back ? 12 : 6, hair);
      for (const ox of [-9, -5, 3, 7]) R(hdx + ox, top + 3, 2, 12, sh);
      if (back) for (const ox of [-3, 1]) R(hdx + ox, top + 9, 2, 8, hair);
    } else {
      // medium dreads
      R(hdx - halfW - 2, top - 1, hw + 4, back ? 13 : 6, hair);
      for (const ox of [-10, -6, 3, 7]) R(hdx + ox, top + 2, 3, 13, sh);
      if (back) for (const ox of [-3, 0]) R(hdx + ox, top + 10, 3, 8, hair);
    }
    return;
  }

  // hairLen === 'long'
  if (hairTex === 'straight') {
    R(hdx - halfW - 2, top, hw + 4, back ? 14 : 6, hair);
    R(hdx - 4, top, 8, 2, hi);
    if (back) {
      R(hdx - 4, top + 12, 8, 9, sh);
      R(hdx - 3, top + 11, 6, 2, '#0284c7'); // ponytail band
    } else {
      R(hdx - halfW - 2, top + 5, 3, 12, sh);
      R(hdx + halfW - 1, top + 5, 3, 12, sh);
      if (fx !== 0) R(hdx + (fx > 0 ? -halfW - 4 : halfW + 1), top + 5, 3, 11, hair);
    }
  } else if (hairTex === 'wavy') {
    R(hdx - halfW - 3, top - 1, hw + 6, back ? 16 : 7, hair);
    R(hdx - halfW - 4, top + 5, 4, 14, sh);
    R(hdx + halfW, top + 5, 4, 14, sh);
    if (back) R(hdx - 7, top + 14, 14, 6, hair);
    R(hdx - 6, top - 2, 12, 2, hi);
  } else if (hairTex === 'curly') {
    // Full voluminous retro afro
    R(hdx - 12, top - 5, 24, back ? 20 : 12, hair);
    R(hdx - 10, top - 7, 20, 3, hair);
    R(hdx - 7, top - 6, 5, 2, hi);
    R(hdx + 2, top - 5, 5, 2, hi);
  } else if (hairTex === 'braids') {
    R(hdx - halfW - 2, top, hw + 4, back ? 14 : 7, hair);
    for (const ox of [-10, -6, 3, 7]) {
      R(hdx + ox, top + 3, 3, 17, hair);
      R(hdx + ox, top + 17, 3, 2, '#facc15');
    }
    if (back) {
      for (const ox of [-3, 0]) R(hdx + ox, top + 12, 3, 10, sh);
    }
  } else {
    // long heavy dreads
    R(hdx - 11, top - 2, 22, back ? 16 : 8, hair);
    for (const ox of [-11, -7, 4, 8]) {
      R(hdx + ox, top + 2, 3, 18, sh);
      R(hdx + ox, top + 18, 3, 2, '#cbd5e1');
    }
    if (back) {
      for (const ox of [-4, 1]) R(hdx + ox, top + 12, 3, 11, hair);
    }
  }
}

export function renderRigToContext(
  g: RigRenderSurface,
  a: PlayerAppearance | AppearanceV2,
  shirt: string,
  trim: string,
  shorts: string,
  socks: string,
  frame: number,
  dirX: number,
  dirY: number,
  number: number,
  isGk: boolean,
  isCaptain: boolean,
  action: string = 'running',
  res: 1 | 2 = 2,
  extras?: RigExtraStyleOptions
): void {
  const dims = getRigCanvasDimensions(action, res);
  const ground = 111; // canonical 2x ground Y
  const canSaveRestore =
    typeof (g as any).save === 'function' && typeof (g as any).restore === 'function';
  if (canSaveRestore) {
    (g as any).save();
  }
  try {
  g.translate(dims.offsetX, 0);
  g.imageSmoothingEnabled = false;

  const v2 = isAppearanceV2(a) ? a : null;
  const v1 = v2 ? null : (a as PlayerAppearance | undefined);
  const skin = normalizeRigHex(
    extras?.rawSkinHex || (v2 ? getSkinToneHexV2(v2.skinTone) : v1?.skinTone),
    '#f1c27d'
  );
  const rootHair = normalizeRigHex(
    extras?.rawHairRootHex || (v2 ? HAIR_COLOR_HEX_V2[v2.hairColor] : v1?.hairColor),
    '#2a1a0a'
  );
  const hasExplicitDye = extras?.rawHairDyeHex && extras.rawHairDyeHex !== 'none';
  const headHair = hasExplicitDye
    ? normalizeRigHex(extras?.rawHairDyeHex, rootHair)
    : v2
    ? normalizeRigHex(getEffectiveHairHexV2(v2), rootHair)
    : rootHair;
  const beardHair = rootHair;
  const bald = v2
    ? v2.hairLength === 'shaven'
    : (v1?.hairStyle as string) === 'bald' || (v1?.hairStyle as string) === 'shaved';

  // Map v1 hairStyle fallback onto C8 5x5 hairLen x hairTex so both schemas share one renderer
  let hairLen: HairLengthV2 = 'short';
  let hairTex: HairTextureV2 = 'straight';
  if (v2) {
    hairLen = v2.hairLength;
    hairTex = v2.hairTexture;
  } else {
    const hairId = String(v1?.hairStyle || 'part');
    if (bald) {
      hairLen = 'shaven';
    } else if (/fade/.test(hairId)) {
      hairLen = 'fade';
    } else if (/afro/.test(hairId)) {
      hairLen = 'long';
      hairTex = 'curly';
    } else if (/braid/.test(hairId)) {
      hairLen = 'long';
      hairTex = 'braids';
    } else if (/dread/.test(hairId)) {
      hairLen = 'long';
      hairTex = 'dreads';
    } else if (/topknot|ponytail/.test(hairId)) {
      hairLen = 'long';
      hairTex = 'straight';
    } else if (/curly/.test(hairId)) {
      hairLen = 'medium';
      hairTex = 'curly';
    } else if (/wavy/.test(hairId)) {
      hairLen = 'medium';
      hairTex = 'wavy';
    }
  }

  const facialHair: FacialHairV2 = v2
    ? v2.facialHair
    : ((v1 as any)?.facialHair === 'stubble'
        ? 'three_day_stubble'
        : (v1 as any)?.facialHair === 'goatee'
          ? 'goatee'
          : (v1 as any)?.facialHair === 'beard' || (v1 as any)?.hasBeard
            ? 'full_beard'
            : 'none');

  const headwear: HeadwearV2 = v2 ? v2.headwear : 'none';
  const necklace: NecklaceV2 = v2 ? v2.necklace : 'none';
  const neckTattoo: NeckTattooV2 = v2 ? v2.tattoos.neck : 'none';
  const faceTattoo: FaceTattooV2 = v2 ? v2.tattoos.face : 'none';
  const earLeft: EarringSlotV2 | null = v2 ? v2.earrings.left : null;
  const earRight: EarringSlotV2 | null = v2 ? v2.earrings.right : null;
  const legacyEarrings: string = (v1 as any)?.earrings || 'none';

  const street = extras?.streetOutfit;
  const streetTop = street?.topStyle;
  const streetBottom = street?.bottomStyle;
  const isFullTrousers = streetBottom === 'jeans' || streetBottom === 'joggers';
  if (street) {
    shirt = normalizeRigHex(street.topColor, shirt);
    trim = normalizeRigHex(street.topAccentColor, trim);
    shorts = normalizeRigHex(street.bottomColor, shorts);
    socks = normalizeRigHex(street.sockColor, street.paletteGroup === 'light' ? '#f8fafc' : '#1f2937');
  }

  // Uniform & Kit options (C7)
  const shirtCut = v2 ? v2.uniform.shirtCut : 'normal';
  const untucked = street ? true : (v2 ? v2.uniform.tucked === 'untucked' : (v1 as any)?.jerseyFit === 'untucked');
  const socksLen: 'short' | 'normal' | 'long' = street
    ? 'short'
    : v2
    ? v2.uniform.socks
    : (v1 as any)?.sockHeight === 'low'
      ? 'short'
      : (v1 as any)?.sockHeight === 'high-knee'
        ? 'long'
        : 'normal';
  const sockFrom = street ? 0.80 : socksLen === 'short' ? 0.72 : socksLen === 'long' ? 0.0 : 0.36;
  const longSleeve = street
    ? streetTop === 'hoodie' || streetTop === 'windbreaker'
    : (v2 ? v2.uniform.sleeves === 'long' : v1?.sleeveLength === 'long');
  const isSleeveless = streetTop === 'tank_top';
  const interiorEnabled = street ? false : (v2 ? v2.uniform.interiorShirt.enabled : v1?.sleeveLength === 'undershirt');
  const interiorSleeve: 'short' | 'long' = v2 ? v2.uniform.interiorShirt.sleeve : 'long';
  const interiorNeck: 'short' | 'long' = v2 ? v2.uniform.interiorShirt.neck : 'short';
  const shoeColor = street
    ? normalizeRigHex(street.shoeColor, street.paletteGroup === 'light' ? '#f8fafc' : '#111827')
    : normalizeRigHex(v2 ? v2.uniform.shoeColor : (v1 as any)?.shoeColor, '#111111');
  const soleColor = street
    ? (lum(shoeColor) > 0.72 ? '#cbd5e1' : '#f8fafc')
    : (lum(shoeColor) > 0.72 ? '#334155' : '#e5e7eb');
  const collar = extras?.kitCollar || (v2 ? 'crew' : (v1 as any)?.collarStyle || 'crew');
  const kitPattern = street ? 'solid' : (extras?.kitPattern || 'solid');

  const intColor = lum(shirt) < 0.14 ? '#334155' : shade(shirt, 0.62);
  const cutChestPad = shirtCut === 'tight' ? 0 : shirtCut === 'big_retro' ? 3 : 1;
  const cutWaistPad = shirtCut === 'tight' ? 0 : shirtCut === 'big_retro' ? 4 : 1;
  const sleeveThickPad = shirtCut === 'tight' ? 0 : shirtCut === 'big_retro' ? 2 : 1;
  const shortSleeveFrac = shirtCut === 'big_retro' ? 0.76 : shirtCut === 'tight' ? 0.48 : 0.56;

  const scale = res * 0.5;
  const R: RectFn = (x: number, y: number, w: number, h: number, c: string) => {
    g.fillStyle = c;
    if (res === 1) {
      g.fillRect(Math.round(x * 0.5), Math.round(y * 0.5), Math.max(1, Math.round(w * 0.5)), Math.max(1, Math.round(h * 0.5)));
    } else {
      g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    }
  };
  const S: SegFn = (x0: number, y0: number, x1: number, y1: number, t: number, c: string) => {
    g.fillStyle = c;
    const sx0 = x0 * scale, sy0 = y0 * scale, sx1 = x1 * scale, sy1 = y1 * scale;
    const st = Math.max(1, Math.round(t * scale));
    const n = Math.max(1, Math.ceil(Math.hypot(sx1 - sx0, sy1 - sy0)));
    for (let i = 0; i <= n; i++) {
      g.fillRect(Math.round(sx0 + ((sx1 - sx0) * i) / n - st / 2), Math.round(sy0 + ((sy1 - sy0) * i) / n - st / 2), st, st);
    }
  };
  const lerp = (p: number, q: number, f: number) => p + (q - p) * f;

  const bp = getBodyProfile(a);
  const legCadenceMult = bp.legsLength === 'short' ? 0.85 : bp.legsLength === 'long' ? 1.12 : 1.0;

  const wr = action === 'wrestle', idle = action === 'idle', dr = action === 'dribbling';
  const gait = action.startsWith('running_') ? action.slice(8) : action === 'running' ? 'run' : '';
  const G: Record<string, { sw: number; lift: number; lean: number; arm: number; bob: number; pump: number; reach: number }> = {
    walk:   { sw: 0.45, lift: 0.25 * legCadenceMult, lean: 0.5, arm: 0.45, bob: 0.8 * legCadenceMult, pump: 0, reach: getRigCyclePx('walk', bp.legsLength) / 2 },
    jog:    { sw: 0.75, lift: 0.60 * legCadenceMult, lean: 1.2, arm: 0.75, bob: 1.4 * legCadenceMult, pump: 1, reach: getRigCyclePx('jog', bp.legsLength) / 2 },
    run:    { sw: 1.00, lift: 1.00 * legCadenceMult, lean: 2.0, arm: 1.00, bob: 2.0 * legCadenceMult, pump: 2, reach: getRigCyclePx('run', bp.legsLength) / 2 },
    sprint: { sw: 1.25, lift: 1.35 * legCadenceMult, lean: 4.0, arm: 1.25, bob: 2.6 * legCadenceMult, pump: 4, reach: getRigCyclePx('sprint', bp.legsLength) / 2 },
  };
  const gp = G[gait] || G.run;
  const sk = action === 'deceleration_skid';
  const gkCatch = action === 'gk_high_catch', gkPunch = action === 'gk_punch', gkStar = action === 'gk_star_spread';
  const gkDive = action === 'goalkeeper_dive' || action === 'gk_fingertip_parry' || action === 'gk_low_smother';
  const kick = KICK_RE.test(action), head = HEAD_RE.test(action) || gkCatch || gkPunch, tackle = action === 'standing_tackle', jockey = action === 'defensive_jockey' || action === 'goalkeeper_penalty_anticipate' || gkStar;
  const famName = FAMS[action] || '';
  const flipAct = FLIP_RE.test(action), slideAct = SLIDE_RE.test(action), diveL = DIVEL_RE.test(action);
  const kt = ((frame % 6) + 6) % 6;
  const spec: Spec | null = famName ? specFor(famName, kt) : null;
  const loft = /high|chip|scoop|long_pass|cross|clear/.test(action) ? 2 : /low|driven|penalty/.test(action) ? 0 : 1;
  const airT = (gkCatch ? [-2, 2, 4, 4, 2, -1] : [-2, 3, 6, 6, 3, -1])[kt];
  const useTri = (gait !== '' || dr) && !wr && !sk && !idle;
  const reach = gait !== '' ? gp.reach : dr ? getRigCyclePx('dribbling', bp.legsLength) / 2 : 11;
  const jockeyReach = getRigCyclePx('jockey', bp.legsLength) / 2;
  const pBase = ((frame % 6) + 0.5) / 6;
  const tri = (q: number) => { q = ((q % 1) + 1) % 1; return q < 0.5 ? 1 - 4 * q : -1 + 4 * (q - 0.5); };
  const bump = (q: number) => { q = ((q % 1) + 1) % 1; return q < 0.5 ? 0 : Math.sin(Math.PI * (q - 0.5) / 0.5); };
  const swingK = idle ? 0.1 : dr ? 0.62 : gp.sw;
  const liftK = idle ? 0 : dr ? 0.45 * legCadenceMult : gp.lift;
  const lean = spec ? spec.lean : kick ? (kt < 2 ? -2 : loft === 2 ? -2 : 3) : head ? [-1, 2, 4, 6, 3, 0][kt] : tackle ? (kt === 0 ? 1 : 5) : jockey ? 1 : sk ? -3 : idle ? 0 : dr ? 3 : gp.lean;
  const ph = ((frame % 6) / 6) * Math.PI * 2;
  const bob = wr ? Math.round(Math.abs(Math.sin(ph)) * 1) : idle ? Math.round(Math.abs(Math.sin(ph / 2)) * 0.8) : Math.round(Math.abs(Math.cos(ph)) * (dr ? 1.4 : sk ? 0.3 : gp.bob));
  const cx = 36 + dirX * (wr ? 4 : 2) + (wr ? Math.round(Math.sin(ph * 2) * 1.5) : 0);
  const maxDx = useTri ? Math.max(Math.abs(tri(pBase)), Math.abs(tri(pBase + 0.5))) * reach : 0;
  const hipDrop = useTri ? Math.round(bp.legLen - Math.sqrt(Math.max(1, bp.legLen * bp.legLen - Math.min(maxDx, bp.legLen * 0.85) ** 2))) : 0;
  const poseDrop = spec ? spec.drop : tackle ? (kt === 0 ? 1 : 5) : jockey ? 4 : kick && kt === 2 ? 1 : 0;
  const hipY = ground - bp.legLen - (useTri ? 0 : bob) + hipDrop + poseDrop - (head ? airT : spec ? spec.air : 0);
  const shY = hipY - bp.torsoLen;
  const back = dirY < 0;
  const fx = dirX, fy = dirY === 0 ? 0 : dirY;

  // ---- horizontal-body family: goalkeeper dives, slides, falls, bicycle kicks, diving headers ----
  if (gkDive || flipAct || slideAct || diveL) {
    const sb = dirX < 0 ? -1 : 1;
    const f3 = Math.min(2, kt % 3);
    const smother = action === 'gk_low_smother', parry = action === 'gk_fingertip_parry';
    const sg = (flipAct || slideAct) ? -sb : sb;
    let lift: number, th: number, legs: number[][], diveReach: number, armA: number[], gloves = false;
    if (gkDive) {
      lift = smother ? 6 : [8, 15, 21][parry ? 2 : f3];
      th = smother ? 0.05 : [0.3, 0.12, 0.62][parry ? 2 : f3];
      legs = [[-14, 3, -11, 9], [-16, -2, -13, 5]];
      diveReach = Math.round(22 * bp.armScale);
      gloves = true;
      armA = smother ? [th, th - 0.12] : [th + (f3 === 2 || parry ? 0.95 : 0.12), th - 0.05];
    } else if (flipAct) {
      lift = [10, 22, 28, 22, 10, 3][kt];
      th = [0.25, 0.6, 0.85, 0.55, 0.25, 0.1][kt];
      legs = [[-14, -9, -11, -11], [-16, -3, -13, -7]];
      diveReach = Math.round(12 * bp.armScale);
      armA = [th - 0.6, th - 0.8];
    } else if (slideAct) {
      const fall = action === 'fouled_falling';
      lift = fall ? [6, 10, 6, 3, 3, 3][kt] : 3;
      th = fall ? [0.3, 0.6, 0.35, 0.15, 0.1, 0.1][kt] : 0.1;
      legs = [[-17, 2, -13, 3], [-12, 5, -10, 2]];
      diveReach = Math.round(12 * bp.armScale);
      armA = [th + 0.5, th + 0.3];
    } else {
      lift = [6, 14, 16, 14, 8, 6][kt];
      th = [0.2, 0.1, 0.05, 0.1, 0.2, 0.2][kt];
      legs = [[-14, 3, -11, 9], [-16, -2, -13, 5]];
      diveReach = Math.round(10 * bp.armScale);
      armA = [th - 0.4, th - 0.5];
    }
    const TLd = bp.torsoLen + 5;
    const legDiveScale = bp.legsLength === 'short' ? 0.88 : bp.legsLength === 'long' ? 1.12 : 1.0;
    const HX = 36 - sg * 12, HY = ground - lift - 9 - Math.max(0, Math.round((bp.calfT - 8) * 0.5));
    const SX = HX + sg * Math.cos(th) * TLd, SY = HY - Math.sin(th) * TLd;
    for (const [kx, ky, fx3, fy3] of legs) {
      const kX = HX + sg * kx * legDiveScale, kY = HY + ky * legDiveScale;
      const fX = kX + sg * fx3 * legDiveScale, fY = kY + fy3 * legDiveScale;
      if (isFullTrousers) {
        S(HX, HY, kX, kY, bp.thighT + 1, shorts);
        S(kX, kY, fX, fY, bp.calfT + 1, shorts);
      } else {
        S(HX, HY, kX, kY, bp.thighT, skin);
        S(HX, HY, lerp(HX, kX, 0.65), lerp(HY, kY, 0.65), bp.thighT + 1, shorts);
        if (socksLen === 'long') {
          S(lerp(HX, kX, 0.78), lerp(HY, kY, 0.78), kX, kY, bp.calfT + 1, socks);
          S(kX, kY, fX, fY, bp.calfT + 1, socks);
        } else {
          S(kX, kY, fX, fY, bp.calfT, skin);
          S(lerp(kX, fX, sockFrom), lerp(kY, fY, sockFrom), fX, fY, bp.calfT + 1, socks);
        }
      }
      R(fX - 5 + (sg > 0 ? -2 : 0), fY - 2, 10, 6, shoeColor);
      R(fX - 5 + (sg > 0 ? -2 : 0), fY + 3, 10, 1, soleColor);
    }
    S(HX, HY, lerp(HX, SX, 0.5), lerp(HY, SY, 0.5), Math.max(10, bp.waistW * 0.85 + cutWaistPad), shirt);
    S(lerp(HX, SX, 0.5), lerp(HY, SY, 0.5), SX, SY, Math.max(12, bp.chestW * 0.78 + cutChestPad), shirt);
    R(HX - 6, HY - 6, 12, 12, shorts);
    if (untucked) R(HX - 5, HY - 6, 10, 5, shirt);

    for (let ai = 0; ai < armA.length; ai++) {
      const ang = armA[ai];
      const hX = SX + sg * Math.cos(ang) * diveReach, hY = SY - Math.sin(ang) * diveReach;
      const mX = lerp(SX, hX, 0.5), mY = lerp(SY, hY, 0.5);
      const useLongArm = street ? longSleeve : (longSleeve || isGk);
      const sleeveEnd = useLongArm ? 1.0 : shortSleeveFrac;
      S(SX, SY, mX, mY, bp.upperArmT, useLongArm ? shirt : skin);
      S(mX, mY, hX, hY, bp.foreArmT, useLongArm ? shirt : interiorEnabled && interiorSleeve === 'long' ? intColor : skin);
      if (!useLongArm && !isSleeveless) {
        if (interiorEnabled && interiorSleeve === 'short') {
          S(SX, SY, lerp(SX, hX, Math.min(0.85, sleeveEnd + 0.16)), lerp(SY, hY, Math.min(0.85, sleeveEnd + 0.16)), bp.upperArmT, intColor);
        }
        S(SX, SY, lerp(SX, hX, sleeveEnd), lerp(SY, hY, sleeveEnd), bp.upperArmT + sleeveThickPad, shirt);
        if (!interiorEnabled || interiorSleeve !== 'long') {
          const tat = ai === 0 ? (v2 ? v2.tattoos.leftArm : (v1 as any)?.tattoos?.leftArm) : (v2 ? v2.tattoos.rightArm : (v1 as any)?.tattoos?.rightArm);
          if (tat && tat !== 'none') {
            drawArmTattooV2(R, S, SX, SY, mX, mY, hX, hY, bp.upperArmT, bp.foreArmT, tat, interiorEnabled && interiorSleeve === 'short');
          }
        }
      }
      if (gloves) {
        R(hX - 5, hY - 5, 10, 10, '#facc15');
        R(hX - 1, hY - 1, 2, 2, '#1e293b');
      } else {
        R(hX - 3, hY - 3, 6, 6, skin);
      }
    }
    const neckDist = 6 + Math.round(bp.neckLen * 0.6);
    const hdX = SX + sg * Math.cos(th) * neckDist, hdY = SY - Math.sin(th) * neckDist - 2;
    S(SX, SY, hdX, hdY, Math.max(3, bp.neckW), interiorEnabled && interiorNeck === 'long' ? intColor : shade(skin, 0.85));
    if (interiorEnabled && interiorNeck === 'short') {
      R(SX - 2, SY - 2, 5, 5, intColor);
    }
    if (necklace !== 'none') {
      R(SX - 2, SY - 3, 5, 5, necklace === 'silver_necklace' || necklace === 'military_tag' ? '#cbd5e1' : '#facc15');
    }
    const hwD = Math.round(14 * bp.headScale);
    const diveHeadTop = Math.round(hdY - hwD / 2);
    const diveHeadBottom = diveHeadTop + hwD;
    R(hdX - hwD / 2, diveHeadTop, hwD, hwD, skin);
    drawHairV2(R, Math.round(hdX), diveHeadTop, hwD, sg, back, skin, headHair, hairLen, hairTex, extras?.specialHair);
    if (!back) {
      R(hdX + sg * 3 - 1, diveHeadTop + 6, 2, 3, '#111827');
      drawFacialHairV2(R, Math.round(hdX), diveHeadTop, diveHeadBottom, sg, skin, beardHair, facialHair);
      drawFaceTattooV2(R, Math.round(hdX), diveHeadTop, sg, faceTattoo);
    }
    drawHeadwearV2(R, Math.round(hdX), diveHeadTop, hwD, sg, back, skin, trim, shirt, headwear, extras?.headbandColor, extras?.glassesColor, extras?.regularGlassesDesign, extras?.regularGlassesFrameColor, extras?.regularGlassesShade);
    if (street?.hatStyle && street.hatStyle !== 'none') {
      drawStreetHatV2(R, Math.round(hdX), diveHeadTop, hwD, sg, back, street.hatStyle, street.hatColor);
    }
    drawEarringsV2(R, Math.round(hdX), hwD, diveHeadTop, sg, earLeft, earRight, legacyEarrings);
    return;
  }

  // ---- legs (far leg first) ----
  const legs = [-1, 1].map((side) => {
    const lp = ph + (side > 0 ? 0 : Math.PI);
    const lq = pBase + (side > 0 ? 0 : 0.5);
    if (spec) {
      const hxs = cx + side * Math.max(5, Math.round(bp.hipW / 3.2));
      const Ls = side > 0 ? spec.lead : spec.rear;
      const fxs = hxs + fx * Ls[0] + (fx === 0 ? side * (famName === 'shield' || famName === 'footwork' ? 3 : 1) : 0);
      const fys = ground - spec.air - Ls[1] + fy * Ls[0] * 0.27;
      return { side, sw: side, hx: hxs, hy: hipY, kx: lerp(hxs, fxs, 0.5) + fx * 2, ky: lerp(hipY, fys, 0.5) - (Ls[1] > 2 ? 3 : 0), fxp: fxs, fyp: fys };
    }
    if (kick || head || tackle || jockey) {
      const hx2 = cx + side * (jockey ? 9 : Math.max(4, Math.round(bp.hipW / 3.4))), hy2 = hipY;
      let fx2: number, fy2: number, sw2 = side;
      if (kick) {
        if (side > 0) {
          const d = kt < 2 ? -10 : kt === 2 ? 12 : 14 - (kt - 3) * 2.5;
          const lf = kt < 2 ? 0.45 : kt === 2 ? [0.15, 0.4, 0.8][loft] : [0.5, 0.5, 0.95][loft] * (kt < 5 ? 1 : 0.5);
          fx2 = hx2 + fx * d;
          fy2 = ground - lf * 14 + fy * d * 0.27;
          sw2 = 1;
        } else {
          fx2 = hx2 + fx * 2 + (fx === 0 ? side : 0);
          fy2 = ground + fy;
          sw2 = -1;
        }
      } else if (head) {
        const air = Math.max(0, airT);
        fx2 = hx2 + fx * (side > 0 ? 3 : -2);
        fy2 = ground - air + 2;
      } else if (tackle) {
        if (side > 0) {
          const d = kt === 0 ? 4 : kt < 4 ? 16 : 8;
          fx2 = hx2 + fx * d;
          fy2 = ground - 3 + fy * d * 0.27;
          sw2 = 1;
        } else {
          fx2 = hx2 - fx * 3;
          fy2 = ground;
          sw2 = -1;
        }
      } else {
        const shf = tri(lq) * jockeyReach, lat = fy !== 0 ? 1 : 0.3;
        fx2 = hx2 + side * (gkStar ? 12 : 5) + (gkStar ? 0 : shf * lat);
        fy2 = ground - (gkStar ? 0 : bump(lq) * 3) + (fx !== 0 && !gkStar ? shf * 0.3 : 0);
      }
      const kx2 = lerp(hx2, fx2, 0.5) + fx * 3, ky2 = lerp(hy2, fy2, 0.5) - (head ? 3 : 0) + (tackle && side < 0 ? 3 : 0);
      return { side, sw: sw2, hx: hx2, hy: hy2, kx: kx2, ky: ky2, fxp: fx2, fyp: fy2 };
    }
    const sw = useTri ? tri(lq) : sk ? (side > 0 ? 0.95 : -0.55) : wr ? Math.sin(lp) * 0.25 : Math.sin(lp) * swingK;
    const lift = useTri ? bump(lq) * liftK : sk ? 0 : wr ? 0 : Math.max(0, Math.cos(lp)) * liftK;
    const hx = cx + side * (wr ? 8 : Math.max(4, Math.round(bp.hipW / 3.4))), hy = hipY;
    const fxp = hx + fx * sw * (useTri ? reach : 11) + (fx === 0 ? side * 1 : 0);
    const fyp = ground - lift * 9 + fy * sw * (useTri ? reach * 0.27 : 3);
    const kx = lerp(hx, fxp, 0.5) + fx * (2 + lift * 5);
    const ky = lerp(hy, fyp, 0.5) - lift * 4 + (fx === 0 ? -fy * lift * 2 : 0);
    return { side, sw, hx, hy, kx, ky, fxp, fyp };
  }).sort((p, q) => (back ? p.sw - q.sw : q.sw - p.sw));

  for (const L of legs) {
    if (isFullTrousers) {
      S(L.hx, L.hy, L.kx, L.ky, bp.thighT + 1, shorts);
      S(L.kx, L.ky, L.fxp, L.fyp - 4, bp.calfT + 1, shorts);
      if (streetBottom === 'joggers') {
        R(L.fxp - (bp.calfT + 1) / 2, L.fyp - 6, bp.calfT + 1, 2, shade(shorts, 0.78));
      } else {
        // Subtle denim seam along leg
        S(lerp(L.hx, L.kx, 0.35), lerp(L.hy, L.ky, 0.35), L.kx, L.ky, 1, shadeHi(shorts, 1.14));
      }
    } else {
      S(L.hx, L.hy, L.kx, L.ky, bp.thighT, skin);
      S(L.hx, L.hy, lerp(L.hx, L.kx, street ? 0.68 : 0.62), lerp(L.hy, L.ky, street ? 0.68 : 0.62), bp.thighT + 1, shorts);
      S(L.kx, L.ky, L.fxp, L.fyp - 4, bp.calfT, skin);
      if (socksLen === 'long') {
        S(lerp(L.hx, L.kx, 0.78), lerp(L.hy, L.ky, 0.78), L.kx, L.ky, bp.calfT + 1, socks);
        S(L.kx, L.ky, L.fxp, L.fyp - 4, bp.calfT + 1, socks);
        S(lerp(L.hx, L.kx, 0.76), lerp(L.hy, L.ky, 0.76), lerp(L.hx, L.kx, 0.84), lerp(L.hy, L.ky, 0.84), bp.calfT + 1, trim);
      } else {
        const stX = lerp(L.kx, L.fxp, sockFrom), stY = lerp(L.ky, L.fyp - 4, sockFrom);
        S(stX, stY, L.fxp, L.fyp - 4, bp.calfT + 1, socks);
        if (!street) {
          R(stX - (bp.calfT + 1) / 2, stY - 1, bp.calfT + 1, 2, trim);
        }
      }
    }
    R(L.fxp - 5 + fx * 2, L.fyp - 4, 10, 6, shoeColor);
    R(L.fxp - 5 + fx * 2, L.fyp + 1, 10, 1, soleColor);
  }

  // ---- torso: tapered chest->waist + shirt cut (tight / normal / big_retro) & tuck ----
  const TL = bp.torsoLen;
  const sox = fx * lean + (spec ? spec.shift : 0);
  const effectiveChestW = bp.chestW + cutChestPad;
  const effectiveWaistW = bp.waistW + cutWaistPad;
  for (let r = 0; r < TL; r++) {
    const f = r / Math.max(1, TL - 1);
    const w = Math.round(lerp(effectiveChestW, effectiveWaistW, Math.min(1, f * 1.15)) + (bp.belly && f > 0.5 ? bp.belly * Math.sin((f - 0.5) * Math.PI) : 0));
    const lx = sox * (1 - f);
    const rxRow = cx - w / 2 + lx;
    const ryRow = shY + r;
    R(rxRow, ryRow, w, 1, r < 2 ? shade(shirt, 1.25) : shirt);
    if (!isGk && kitPattern !== 'solid') {
      if (kitPattern === 'stripes' || kitPattern === 'vertical-stripes') {
        for (let sx = -Math.floor(w / 2) + 2; sx < Math.floor(w / 2) - 1; sx += 6) {
          R(cx + sx + lx, ryRow, 2, 1, trim);
        }
      } else if (kitPattern === 'center-stripe') {
        R(cx - 2 + lx, ryRow, 4, 1, trim);
      } else if (kitPattern === 'hoops' || kitPattern === 'horizontal-hoops') {
        if (Math.floor(r / 4) % 2 === 1) R(rxRow, ryRow, w, 1, trim);
      } else if (kitPattern === 'halves' || kitPattern === 'half-and-half') {
        R(cx + lx, ryRow, Math.ceil(w / 2), 1, trim);
      } else if (kitPattern === 'sash' || kitPattern === 'diagonal') {
        const sashMid = cx + (-w * 0.35 + f * w * 0.7) + lx;
        R(Math.max(rxRow, sashMid - 2), ryRow, 4, 1, trim);
      } else if (kitPattern === 'checkered') {
        for (let bx = 0; bx < w; bx += 4) {
          if ((Math.floor(bx / 4) + Math.floor(r / 4)) % 2 === 0) {
            R(rxRow + bx, ryRow, Math.min(4, w - bx), 1, trim);
          }
        }
      } else if (kitPattern === 'raglan-shoulders' || kitPattern === 'shoulders') {
        if (r < 6) {
          R(rxRow, ryRow, 4, 1, trim);
          R(rxRow + w - 4, ryRow, 4, 1, trim);
        }
      } else if (kitPattern === 'gradient' && r >= Math.floor(TL * 0.55)) {
        R(rxRow, ryRow, w, 1, trim);
      }
    }
    R(rxRow, ryRow, 1, 1, shade(shirt, 0.78));
    R(rxRow + w - 1, ryRow, 1, 1, shade(shirt, 0.78));
  }
  if (!isGk && !street && kitPattern === 'solid') {
    for (const o of [-6, 0, 6]) {
      if (Math.abs(o) < effectiveWaistW / 2 - 2) R(cx + o - 1 + sox * 0.6, shY + 3, 2, Math.max(2, TL - 5), shade(shirt, 0.9));
    }
  }
  R(cx - bp.hipW / 2, hipY - 2, bp.hipW, 7, shorts);

  if (untucked) {
    const hemDrop = shirtCut === 'big_retro' ? 6 : shirtCut === 'tight' ? 3 : 4;
    const hemPad = shirtCut === 'big_retro' ? 4 : shirtCut === 'tight' ? 0 : 2;
    const hemW = effectiveWaistW + hemPad;
    R(cx - hemW / 2 + sox * 0.2, hipY - 2, hemW, hemDrop, shirt);
    R(cx - hemW / 2 + sox * 0.2, hipY - 2 + hemDrop - 1, hemW, 1, shade(shirt, 0.78));
  } else if (shirtCut === 'big_retro') {
    R(cx - effectiveWaistW / 2 - 1 + sox * 0.2, hipY - 4, effectiveWaistW + 2, 3, shirt);
    R(cx - effectiveWaistW / 2 - 1 + sox * 0.2, hipY - 2, effectiveWaistW + 2, 1, shade(shirt, 0.78));
  }

  // Collar + Streetwear silhouette accents + Pro crest
  if (street) {
    if (streetTop === 'hoodie') {
      if (back) {
        R(cx - 7 + sox, shY - 2, 14, 5, shade(shirt, 0.82));
      } else {
        R(cx - 6 + sox, shY, 12, 3, shade(shirt, 0.82));
        R(cx - 2 + sox * 0.8, shY + 3, 1, 5, trim);
        R(cx + 1 + sox * 0.8, shY + 3, 1, 5, trim);
        R(cx - 5 + sox * 0.3, hipY - 6, 10, 4, shade(shirt, 0.86));
      }
    } else if (streetTop === 'windbreaker') {
      R(cx - 5 + sox, shY - 1, 10, 3, trim);
      if (!back) {
        R(cx - 1 + sox * 0.6, shY + 2, 2, Math.max(4, TL - 2), trim);
        R(cx - Math.floor(effectiveChestW / 2) + 1 + sox * 0.7, shY + 5, effectiveChestW - 2, 2, trim);
      }
    } else if (streetTop === 'tank_top') {
      if (!back) {
        R(cx - 4 + sox, shY, 8, 2, skin);
        R(cx - 4 + sox * 0.7, shY + 5, 8, 2, trim);
      }
      R(cx - Math.floor(effectiveChestW / 2) + sox, shY, 2, 4, trim);
      R(cx + Math.floor(effectiveChestW / 2) - 2 + sox, shY, 2, 4, trim);
    } else {
      // Casual streetwear t-shirt
      R(cx - 4 + sox, shY, 8, 2, trim);
      if (!back) {
        R(cx - 4 + sox * 0.7, shY + 5, 8, 4, trim);
      }
    }
  } else {
    if (collar === 'v-neck' && !back) {
      R(cx - 3 + sox, shY, 6, 1, skin); R(cx - 2 + sox, shY + 1, 4, 1, skin); R(cx - 1 + sox, shY + 2, 2, 1, skin);
      R(cx - 4 + sox, shY, 1, 3, trim); R(cx + 3 + sox, shY, 1, 3, trim);
    } else if (collar === 'polo') {
      R(cx - 5 + sox, shY, 4, 3, trim); R(cx + 1 + sox, shY, 4, 3, trim);
      if (!back) R(cx - 1 + sox, shY + 2, 2, 5, shade(shirt, 0.75));
    } else {
      R(cx - 4 + sox, shY, 8, 2, trim);
    }
    if (!back) R(cx - Math.round(effectiveChestW / 3) + sox * 0.7, shY + 6, 3, 3, '#fbbf24');
  }

  // ---- arms (scaled by armsLength + sleeves + winter interior sleeves + arm tattoos) ----
  const shFrac = Math.min(1, 5 / Math.max(1, TL - 1));
  const torsoXAtShoulder = sox * (1 - shFrac);
  const chestWAtShoulder = Math.round(lerp(effectiveChestW, effectiveWaistW, Math.min(1, shFrac * 1.15)));
  for (const side of [-1, 1]) {
    const ap = ph + (side > 0 ? Math.PI : 0);
    const sw = Math.sin(ap);
    const shoulderOffset = Math.min(Math.round(bp.shoulderSpan + 1 + cutChestPad * 0.5), Math.floor(chestWAtShoulder / 2));
    const sx = cx + torsoXAtShoulder + side * shoulderOffset, sy = shY + 5;
    const rawHxp = spec ? sx + fx * (side > 0 ? spec.aL[0] : spec.aR[0]) + side * (side > 0 ? spec.aL[2] : spec.aR[2])
      : gkCatch ? sx - side * 3
      : gkPunch ? (side > 0 ? sx + fx * 11 : sx + side * 6)
      : gkStar ? sx + side * 15
      : kick ? sx + fx * (side > 0 ? (kt < 3 ? 7 : -7) : (kt < 3 ? -7 : 7)) + side * (fx === 0 ? 6 : 2)
      : head ? sx + side * 9 + fx * 3
      : tackle || jockey ? sx + side * 9 + fx * 3
      : wr ? sx + fx * (13 + Math.sin(ph * 2 + side) * 2) - side * 2
      : idle ? sx + side * 2 + fx * Math.sin(ph) * 1.5
      : dr ? sx + side * 3 + fx * sw * 5
      : sk ? sx + side * 8 + fx * 2
      : sx + fx * sw * 8 * gp.arm + side * 1;
    const rawHyp = spec ? sy + (side > 0 ? spec.aL[1] : spec.aR[1])
      : gkCatch ? sy - (kt >= 2 && kt <= 4 ? 19 : 11)
      : gkPunch ? (side > 0 ? sy - (kt >= 2 && kt <= 4 ? 14 : 4) : sy + 10)
      : gkStar ? sy - 12
      : kick ? sy + 11 - (kt >= 2 ? 1 : 0)
      : head ? sy + (kt >= 2 ? 3 : 10)
      : tackle || jockey ? sy + 10
      : wr ? sy + (fy > 0 ? 12 : fy < 0 ? -1 : 5) + Math.sin(ph * 2 + side) * 2
      : idle ? sy + 17 + Math.sin(ph / 2) * 0.8
      : dr ? sy + 12 - Math.max(0, sw) * 2 + fy * sw * 2
      : sk ? sy + 9
      : sy + 15 - gp.pump * 1.5 - Math.max(0, sw) * 5 * gp.arm + fy * sw * 3;
    const hxp = sx + (rawHxp - sx) * bp.armScale;
    const hyp = sy + (rawHyp - sy) * bp.armScale;
    const ex = lerp(sx, hxp, 0.5) - fx * 1, ey = lerp(sy, hyp, 0.5) - Math.abs(sw) * 3 * bp.armScale;

    const useLongArmMain = street ? longSleeve : (longSleeve || isGk);
    if (useLongArmMain) {
      S(sx, sy, ex, ey, bp.upperArmT + sleeveThickPad, shirt);
      S(ex, ey, hxp, hyp, bp.foreArmT + Math.min(1, sleeveThickPad), shirt);
      if (streetTop === 'hoodie' || streetTop === 'windbreaker') {
        R(hxp - 2, hyp - 2, 4, 3, shade(shirt, 0.8));
      } else if (interiorEnabled && interiorSleeve === 'long') {
        R(hxp - 2, hyp - 2, 4, 4, intColor);
      }
    } else {
      S(sx, sy, ex, ey, bp.upperArmT, skin);
      S(ex, ey, hxp, hyp, bp.foreArmT, interiorEnabled && interiorSleeve === 'long' ? intColor : skin);
      if (!isSleeveless) {
        if (interiorEnabled) {
          if (interiorSleeve === 'long') {
            S(lerp(sx, ex, shortSleeveFrac), lerp(sy, ey, shortSleeveFrac), ex, ey, bp.upperArmT, intColor);
          } else {
            const shortEnd = Math.min(1, shortSleeveFrac + 0.32);
            S(lerp(sx, ex, shortSleeveFrac), lerp(sy, ey, shortSleeveFrac), lerp(sx, ex, shortEnd), lerp(sy, ey, shortEnd), bp.upperArmT, intColor);
          }
        }
        S(sx, sy, lerp(sx, ex, shortSleeveFrac), lerp(sy, ey, shortSleeveFrac), bp.upperArmT + sleeveThickPad, shirt);
      }
    }

    if (!useLongArmMain && (!interiorEnabled || interiorSleeve !== 'long')) {
      const tat: ArmTattooV2 | string =
        side < 0
          ? (v2 ? v2.tattoos.leftArm : (v1 as any)?.tattoos?.leftArm || 'none')
          : (v2 ? v2.tattoos.rightArm : (v1 as any)?.tattoos?.rightArm || 'none');
      drawArmTattooV2(
        R,
        S,
        sx,
        sy,
        ex,
        ey,
        hxp,
        hyp,
        bp.upperArmT,
        bp.foreArmT,
        tat,
        interiorEnabled && interiorSleeve === 'short'
      );
    }
    R(hxp - 3, hyp - 2, 6, 6, isGk ? '#facc15' : skin);
    if (isCaptain && side < 0) {
      const armBandX = lerp(sx, ex, 0.45);
      const armBandY = lerp(sy, ey, 0.45);
      R(armBandX - 3, armBandY - 1, 6, 3, '#facc15');
    }
  }

  // ---- neck (width + length + neck tattoos + interior neck + necklace) & head ----
  const hdx = Math.round(cx + fx * 1 + sox);
  const headGap = bp.neckLen - 2; // turtle=-1, short=1, normal=3, long=6
  const headBottom = Math.round(shY - headGap);
  const headTop = headBottom - 15;
  const neckDrawTop = Math.min(shY - 1, headBottom - 2);
  const neckDrawH = Math.max(3, shY + 2 - neckDrawTop);
  R(hdx - bp.neckW / 2, neckDrawTop, bp.neckW, neckDrawH, shade(skin, 0.85));

  drawNeckTattooV2(R, hdx, neckDrawTop, neckDrawH, bp.neckW, neckTattoo);

  if (interiorEnabled) {
    if (interiorNeck === 'long') {
      const turtleTop = Math.min(shY - 1, headBottom + 1);
      const turtleH = Math.max(2, shY + 2 - turtleTop);
      R(hdx - bp.neckW / 2 - 1, turtleTop, bp.neckW + 2, turtleH, intColor);
    } else {
      R(hdx - bp.neckW / 2 - 1, shY - 1, bp.neckW + 2, 2, intColor);
    }
  }

  drawNecklaceV2(R, hdx, shY, bp.neckW, back, necklace);

  const hw = Math.round(15 * bp.headScale);
  R(hdx - hw / 2, headTop, hw, 15, skin);
  R(hdx - 8, headBottom - 3, 16, 2, shade(skin, 0.82));

  // Hair (5 lengths x 5 textures + special cuts, natural color + dye override, shaven)
  drawHairV2(R, hdx, headTop, hw, fx, back, skin, headHair, hairLen, hairTex, extras?.specialHair);

  // Face features, facial hair (all 11 options), face tattoos (4)
  if (!back) {
    const ex = fx === 0 ? 0 : fx * 3;
    R(hdx - 5 + ex, headTop + 7, 2, 3, '#111827');
    R(hdx + 3 + (fx > 0 ? 0 : ex), headTop + 7, 2, 3, '#111827');
    if (fx !== 0) R(hdx + fx * 8 - 1, headTop + 9, 2, 3, shade(skin, 0.8));
    drawFacialHairV2(R, hdx, headTop, headBottom, fx, skin, beardHair, facialHair);
    drawFaceTattooV2(R, hdx, headTop, fx, faceTattoo);
  }

  // Headwear (drawn after eyes/face so masks/glasses frame eyes cleanly, before outer earrings)
  drawHeadwearV2(R, hdx, headTop, hw, fx, back, skin, trim, shirt, headwear, extras?.headbandColor, extras?.glassesColor, extras?.regularGlassesDesign, extras?.regularGlassesFrameColor, extras?.regularGlassesShade);
  if (street?.hatStyle && street.hatStyle !== 'none') {
    drawStreetHatV2(R, hdx, headTop, hw, fx, back, street.hatStyle, street.hatColor);
  }

  // Earrings (left & right independently, style x material x gem)
  drawEarringsV2(R, hdx, hw, headTop, fx, earLeft, earRight, legacyEarrings);

  // ---- back squad number (5x7 font scaled cleanly for res=1 and res=2) ----
  if (back) {
    const n = Math.abs(Math.floor(number)) % 100;
    const dg = n >= 10 ? [Math.floor(n / 10), n % 10] : [n];
    const fg = lum(shirt) > 0.55 ? '#111827' : '#ffffff', ol = lum(shirt) > 0.55 ? '#ffffff' : '#111827';
    const wpx = dg.length * 10 + (dg.length - 1) * 2, x0 = Math.round(cx - wpx / 2), y0 = shY + 4;
    for (let pass = 0; pass < 2; pass++) {
      const col = pass === 0 ? ol : fg;
      dg.forEach((d, i) => {
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 5; c++) {
            if (NUM_FONT[d][r][c] === '1') {
              R(x0 + i * 12 + c * 2 + (pass === 0 ? 1 : 0), y0 + r * 2 + (pass === 0 ? 1 : 0), 2, 2, col);
            }
          }
        }
      });
    }
  }
  } finally {
    if (canSaveRestore) {
      (g as any).restore();
    }
  }
}

export function renderRigRun(
  a: PlayerAppearance | AppearanceV2,
  shirt: string,
  trim: string,
  shorts: string,
  socks: string,
  frame: number,
  dirX: number,
  dirY: number,
  number: number,
  isGk: boolean,
  isCaptain: boolean,
  action: string = 'running',
  res: 1 | 2 = RIG_RES,
  extras?: RigExtraStyleOptions
): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  const dims = getRigCanvasDimensions(action, res);
  cv.width = dims.width;
  cv.height = dims.height;
  (cv as any).__res = res;
  (cv as any).__isRig = true;
  const g = cv.getContext('2d');
  if (!g) return cv;
  renderRigToContext(g, a, shirt, trim, shorts, socks, frame, dirX, dirY, number, isGk, isCaptain, action, res, extras);
  return cv;
}
