/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AppearanceV2, LimbLengthV2, ShirtCutV2 } from '../types';
import {
  ARM_TATTOOS_V2,
  CALF_SIZES_V2,
  CHEST_SIZES_V2,
  EARRING_GEMS_V2,
  EARRING_MATERIALS_V2,
  EARRING_STYLES_V2,
  FACE_TATTOOS_V2,
  FACIAL_HAIRS_V2,
  HAIR_COLORS_V2,
  HAIR_DYES_V2,
  HAIR_LENGTHS_V2,
  HAIR_TEXTURES_V2,
  HEADWEAR_V2,
  LIMB_LENGTHS_V2,
  NECK_LENGTHS_V2,
  NECK_TATTOOS_V2,
  NECK_WIDTHS_V2,
  NECKLACES_V2,
  SHIRT_CUTS_V2,
  SHOE_COLOR_PRESETS_V2,
  SKIN_TONES_V2,
  SOCK_LENGTHS_V2,
  THIGH_SIZES_V2,
  WAIST_SIZES_V2,
  createDefaultAppearanceV2,
} from './appearanceV2';
import {
  ALL_RIG_TEST_ACTIONS,
  RIG_CYCLE_PX_BY_LEG,
  RIG_RES,
  evaluateRunningFootOffset,
  getRigCanvasDimensions,
  getRigCyclePx,
  renderRigRun,
  renderRigToContext,
  type RigRenderSurface,
} from './spriteRig';

class PixelBufferSurface implements RigRenderSurface {
  readonly width: number;
  readonly height: number;
  readonly grid: Uint8Array;
  fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  imageSmoothingEnabled = false;
  outOfBoundsCount = 0;
  borderTouchCount = 0;
  colorHash = 2166136261;
  private tx = 0;
  private ty = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
  }

  translate(x: number, y: number): void {
    this.tx += x;
    this.ty += y;
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    const x0 = Math.round(x + this.tx);
    const y0 = Math.round(y + this.ty);
    const x1 = x0 + Math.round(w);
    const y1 = y0 + Math.round(h);
    const fs = typeof this.fillStyle === 'string' ? this.fillStyle : '';
    let fsHash = 0;
    for (let i = 0; i < fs.length; i++) {
      fsHash = (Math.imul(fsHash ^ fs.charCodeAt(i), 16777619)) >>> 0;
    }
    this.colorHash = Math.imul(this.colorHash ^ x0 ^ (y0 << 8) ^ (x1 << 16) ^ (y1 << 24) ^ fsHash, 16777619) >>> 0;
    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        if (px < 0 || py < 0 || px >= this.width || py >= this.height) {
          this.outOfBoundsCount++;
          continue;
        }
        if (px === 0 || py === 0 || px === this.width - 1 || py === this.height - 1) {
          this.borderTouchCount++;
        }
        this.grid[py * this.width + px] = 1;
      }
    }
  }

  countConnectedComponents(): number {
    const w = this.width;
    const h = this.height;
    const seen = new Uint8Array(w * h);
    const stack: number[] = [];
    let count = 0;
    for (let i = 0; i < w * h; i++) {
      if (!this.grid[i] || seen[i]) continue;
      count++;
      seen[i] = 1;
      stack.push(i);
      while (stack.length > 0) {
        const cur = stack.pop()!;
        const cx = cur % w;
        const cy = (cur / w) | 0;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            if (ox === 0 && oy === 0) continue;
            const nx = cx + ox;
            const ny = cy + oy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const ni = ny * w + nx;
            if (this.grid[ni] && !seen[ni]) {
              seen[ni] = 1;
              stack.push(ni);
            }
          }
        }
      }
    }
    return count;
  }
}

export interface ClipTestVariant {
  label: string;
  appearance: AppearanceV2;
  isGk?: boolean;
}

export function getClipTestVariants(): ClipTestVariant[] {
  return [
    {
      label: 'tiny_short',
      appearance: createDefaultAppearanceV2({
        hairLength: 'shaven',
        skinTone: 'pale',
        physique: {
          heightCm: 165,
          weightKg: 55,
          strength: 40,
          neckWidth: 'thin',
          neckLength: 'turtle',
          chest: 'frail',
          waist: 'skinny',
          thighs: 'skinny',
          calves: 'skinny',
          legsLength: 'short',
          armsLength: 'short',
        },
        uniform: {
          shirtCut: 'tight',
          tucked: 'tucked',
          socks: 'short',
          sleeves: 'normal',
          interiorShirt: { enabled: false, sleeve: 'short', neck: 'short' },
          shoeColor: '#111111',
        },
      }),
    },
    {
      label: 'normal_default',
      appearance: createDefaultAppearanceV2(),
    },
    {
      label: 'max_extreme',
      appearance: createDefaultAppearanceV2({
        hairLength: 'long',
        hairTexture: 'curly',
        hairColor: 'black',
        skinTone: 'ebony',
        physique: {
          heightCm: 210,
          weightKg: 115,
          strength: 105,
          neckWidth: 'bulky',
          neckLength: 'long',
          chest: 'powerful',
          waist: 'chonky',
          thighs: 'huge',
          calves: 'huge',
          legsLength: 'long',
          armsLength: 'long',
        },
        uniform: {
          shirtCut: 'big_retro',
          tucked: 'untucked',
          socks: 'long',
          sleeves: 'long',
          interiorShirt: { enabled: true, sleeve: 'long', neck: 'long' },
          shoeColor: '#facc15',
        },
      }),
    },
    {
      label: 'max_retro_short_sleeve_gk',
      isGk: true,
      appearance: createDefaultAppearanceV2({
        hairLength: 'long',
        hairTexture: 'braids',
        skinTone: 'sun_kissed',
        physique: {
          heightCm: 202,
          weightKg: 98,
          strength: 95,
          neckWidth: 'bulky',
          neckLength: 'long',
          chest: 'powerful',
          waist: 'chubby',
          thighs: 'powerful',
          calves: 'powerful',
          legsLength: 'long',
          armsLength: 'long',
        },
        uniform: {
          shirtCut: 'big_retro',
          tucked: 'tucked',
          socks: 'long',
          sleeves: 'normal',
          interiorShirt: { enabled: true, sleeve: 'long', neck: 'long' },
          shoeColor: '#f8fafc',
        },
      }),
    },
    {
      label: 'max_afro_headwear_accessories',
      appearance: createDefaultAppearanceV2({
        hairLength: 'long',
        hairTexture: 'curly',
        hairColor: 'black',
        hairDye: 'platinum',
        skinTone: 'ebony',
        facialHair: 'full_beard',
        headwear: 'protective_face_mask',
        necklace: 'diamond_encrusted_gold_necklace',
        tattoos: {
          neck: 'blackout_neck',
          leftArm: 'floral_mandala_sleeve',
          rightArm: 'tribal_sleeve',
          face: 'temple_crown',
        },
        earrings: {
          left: { style: 'large_barbell', material: 'gold', gem: 'diamond' },
          right: { style: 'gem', material: 'silver', gem: 'emerald' },
        },
        physique: {
          heightCm: 210,
          weightKg: 112,
          strength: 100,
          neckWidth: 'bulky',
          neckLength: 'long',
          chest: 'powerful',
          waist: 'chubby',
          thighs: 'huge',
          calves: 'huge',
          legsLength: 'long',
          armsLength: 'long',
        },
        uniform: {
          shirtCut: 'big_retro',
          tucked: 'untucked',
          socks: 'long',
          sleeves: 'normal',
          interiorShirt: { enabled: true, sleeve: 'short', neck: 'short' },
          shoeColor: '#ef4444',
        },
      }),
    },
    {
      label: 'max_dreads_glasses_combo',
      appearance: createDefaultAppearanceV2({
        hairLength: 'long',
        hairTexture: 'dreads',
        hairColor: 'dark_brown',
        hairDye: 'pink',
        skinTone: 'olive',
        facialHair: 'mutton_chops',
        headwear: 'sports_glasses',
        necklace: 'military_tag',
        tattoos: {
          neck: 'rose',
          leftArm: 'double_stripe_band',
          rightArm: 'blackout_sleeve',
          face: 'under_eye_cross',
        },
        earrings: {
          left: { style: 'studs', material: 'black_steel', gem: 'diamond' },
          right: { style: 'small_barbell', material: 'bronze', gem: 'sapphire' },
        },
        physique: {
          heightCm: 202,
          weightKg: 90,
          strength: 92,
          neckWidth: 'wide',
          neckLength: 'long',
          chest: 'wide',
          waist: 'normal',
          thighs: 'powerful',
          calves: 'powerful',
          legsLength: 'long',
          armsLength: 'long',
        },
        uniform: {
          shirtCut: 'normal',
          tucked: 'tucked',
          socks: 'normal',
          sleeves: 'normal',
          interiorShirt: { enabled: false, sleeve: 'short', neck: 'short' },
          shoeColor: '#2563eb',
        },
      }),
    },
  ];
}

const DIRECTIONS_8: ReadonlyArray<[number, number]> = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
];

/**
 * Exhaustive pixel-level clip & connectivity test across:
 * - all rig actions (40 representative poses covering all 110 actions)
 * - all 8 viewing directions
 * - all 6 animation frames
 * - both sprite resolutions (2x and 1x)
 * - extreme body sizes, biggest afro/dreads hair, headwear, tattoos & earrings
 */
export function runRigClipAndConnectivityTest(): {
  ok: boolean;
  totalChecked: number;
  failures: string[];
} {
  const variants = getClipTestVariants();
  const failures: string[] = [];
  let totalChecked = 0;

  for (const res of [2, 1] as const) {
    for (const v of variants) {
      for (const action of ALL_RIG_TEST_ACTIONS) {
        const dims = getRigCanvasDimensions(action, res);
        for (const [dirX, dirY] of DIRECTIONS_8) {
          for (let frame = 0; frame < 6; frame++) {
            totalChecked++;
            const buf = new PixelBufferSurface(dims.width, dims.height);
            renderRigToContext(
              buf,
              v.appearance,
              '#1d4ed8',
              '#ffffff',
              '#0f172a',
              '#1d4ed8',
              frame,
              dirX,
              dirY,
              10,
              Boolean(v.isGk),
              true,
              action,
              res
            );
            if (buf.outOfBoundsCount > 0) {
              if (failures.length < 25) {
                failures.push(`OOB res=${res} (${buf.outOfBoundsCount}px): ${v.label} ${action} dir=(${dirX},${dirY}) f=${frame}`);
              }
            } else if (buf.borderTouchCount > 0) {
              if (failures.length < 25) {
                failures.push(`BORDER CLIP res=${res} (${buf.borderTouchCount}px): ${v.label} ${action} dir=(${dirX},${dirY}) f=${frame}`);
              }
            }
            const comps = buf.countConnectedComponents();
            if (comps !== 1) {
              if (failures.length < 25) {
                failures.push(`DISCONNECTED res=${res} (${comps} islands): ${v.label} ${action} dir=(${dirX},${dirY}) f=${frame}`);
              }
            }
          }
        }
      }
    }
  }

  return {
    ok: failures.length === 0,
    totalChecked,
    failures,
  };
}

/**
 * Verifies per-leg-length stride tables and anti-slide stance-foot lock:
 * stance foot backward velocity equals body forward velocity across short, normal, and long legs.
 */
export function runStrideLockVerification(): { ok: boolean; rows: string[] } {
  const rows: string[] = [];
  let ok = true;
  const check = (name: string, pass: boolean, detail = '') => {
    if (!pass) ok = false;
    rows.push(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
  };

  const gaits: Array<'walk' | 'jog' | 'run' | 'sprint' | 'dribbling'> = ['walk', 'jog', 'run', 'sprint', 'dribbling'];

  // 1. Cycle lengths scale strictly by leg length (short < normal < long) and gait
  const legOrderOk = gaits.every(
    (g) =>
      RIG_CYCLE_PX_BY_LEG.short[g] < RIG_CYCLE_PX_BY_LEG.normal[g] &&
      RIG_CYCLE_PX_BY_LEG.normal[g] < RIG_CYCLE_PX_BY_LEG.long[g]
  );
  check('RIG_CYCLE_PX_BY_LEG scales strictly short < normal < long for all gaits', legOrderOk);

  // 2. Stance foot world-X drift check across simulated movement steps for each leg length & gait
  let maxWorldDriftPx = 0;
  for (const leg of LIMB_LENGTHS_V2) {
    for (const gait of gaits) {
      const cyclePx = getRigCyclePx(gait, leg);
      const speed = cyclePx / 12; // arbitrary constant forward speed in logical px/frame
      let playerX = 100;
      let phase = 0.05; // right foot planted (q in [0, 0.5))
      let prevFootWorldX: number | null = null;

      for (let step = 0; step < 4; step++) {
        const evalRes = evaluateRunningFootOffset(phase, 1, gait, leg, 1, 0);
        if (!evalRes.inStance) {
          ok = false;
          rows.push(`FAIL expected right foot in stance for ${leg}/${gait} at phase=${phase}`);
          break;
        }
        const footWorldX = playerX + evalRes.footDxRigPx / RIG_RES;
        if (prevFootWorldX !== null) {
          const drift = Math.abs(footWorldX - prevFootWorldX);
          if (drift > maxWorldDriftPx) maxWorldDriftPx = drift;
        }
        prevFootWorldX = footWorldX;
        playerX += speed;
        phase = (phase + speed / cyclePx) % 1;
      }
    }
  }
  check(
    'stance foot stays locked to ground (zero slide) for short, normal, and long legs',
    maxWorldDriftPx < 1e-6,
    `maxDrift=${maxWorldDriftPx.toExponential(2)}px`
  );

  // 3. Cadence check: at identical speed, short legs complete more cycles per distance than long legs
  const dist = 120;
  const shortCycles = dist / getRigCyclePx('run', 'short');
  const normalCycles = dist / getRigCyclePx('run', 'normal');
  const longCycles = dist / getRigCyclePx('run', 'long');
  check(
    'stride cadence slows cleanly with leg length (short > normal > long cycles/distance)',
    shortCycles > normalCycles && normalCycles > longCycles,
    `cycles/120px: short=${shortCycles.toFixed(2)}, norm=${normalCycles.toFixed(2)}, long=${longCycles.toFixed(2)}`
  );

  return { ok, rows };
}

/**
 * Verifies that every C7 renderer option (skin tones, physique dimensions, limb lengths,
 * kit cuts x tucked, socks, sleeves, interiorShirt sleeve/neck, shoeColor) produces
 * distinct pixel output from the real rig rasterizer.
 */
export function runC7OptionRenderTests(): { ok: boolean; rows: string[] } {
  const rows: string[] = [];
  let ok = true;
  const check = (name: string, pass: boolean, detail = '') => {
    if (!pass) ok = false;
    rows.push(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
  };

  const renderHash = (
    app: AppearanceV2,
    action = 'idle',
    frame = 0,
    dirX = 0,
    dirY = 1
  ): number => {
    const dims = getRigCanvasDimensions(action);
    const buf = new PixelBufferSurface(dims.width, dims.height);
    renderRigToContext(buf, app, '#dc2626', '#ffffff', '#0f172a', '#dc2626', frame, dirX, dirY, 10, false, true, action);
    return buf.colorHash;
  };

  const countDistinct = (hashes: number[]) => new Set(hashes).size;

  // 1. All 7 skin tones
  const skinHashes = SKIN_TONES_V2.map((skinTone) => renderHash(createDefaultAppearanceV2({ skinTone })));
  check('all 7 skin tones render distinctly', countDistinct(skinHashes) === SKIN_TONES_V2.length, `${countDistinct(skinHashes)}/${SKIN_TONES_V2.length}`);

  // 2. Neck width (4) & neck length (4)
  const nwHashes = NECK_WIDTHS_V2.map((neckWidth) => renderHash(createDefaultAppearanceV2({ physique: { neckWidth } })));
  const nlHashes = NECK_LENGTHS_V2.map((neckLength) => renderHash(createDefaultAppearanceV2({ physique: { neckLength } })));
  check('all 4 neck widths render distinctly', countDistinct(nwHashes) === 4, `${countDistinct(nwHashes)}/4`);
  check('all 4 neck lengths render distinctly', countDistinct(nlHashes) === 4, `${countDistinct(nlHashes)}/4`);

  // 3. Chest (4), waist (4), thighs (4), calves (4)
  const chHashes = CHEST_SIZES_V2.map((chest) => renderHash(createDefaultAppearanceV2({ physique: { chest } })));
  const waHashes = WAIST_SIZES_V2.map((waist) => renderHash(createDefaultAppearanceV2({ physique: { waist }, uniform: { tucked: 'tucked' } })));
  const thHashes = THIGH_SIZES_V2.map((thighs) => renderHash(createDefaultAppearanceV2({ physique: { thighs } }), 'running_run', 1, 1, 0));
  const caHashes = CALF_SIZES_V2.map((calves) => renderHash(createDefaultAppearanceV2({ physique: { calves } }), 'running_run', 1, 1, 0));
  check('all 4 chest sizes render distinctly', countDistinct(chHashes) === 4, `${countDistinct(chHashes)}/4`);
  check('all 4 waist sizes render distinctly', countDistinct(waHashes) === 4, `${countDistinct(waHashes)}/4`);
  check('all 4 thigh sizes render distinctly', countDistinct(thHashes) === 4, `${countDistinct(thHashes)}/4`);
  check('all 4 calf sizes render distinctly', countDistinct(caHashes) === 4, `${countDistinct(caHashes)}/4`);

  // 4. Arm length (3) & leg length (3)
  const armHashes = LIMB_LENGTHS_V2.map((armsLength) => renderHash(createDefaultAppearanceV2({ physique: { armsLength } }), 'running_run', 1, 1, 0));
  const legHashes = LIMB_LENGTHS_V2.map((legsLength) => renderHash(createDefaultAppearanceV2({ physique: { legsLength } }), 'running_sprint', 0, 1, 0));
  check('all 3 arm lengths render distinctly', countDistinct(armHashes) === 3, `${countDistinct(armHashes)}/3`);
  check('all 3 leg lengths render distinctly', countDistinct(legHashes) === 3, `${countDistinct(legHashes)}/3`);

  // 5. Kit cuts (3) x tucked/untucked (2) = 6
  const cutTuckHashes: number[] = [];
  for (const shirtCut of SHIRT_CUTS_V2) {
    for (const tucked of ['tucked', 'untucked'] as const) {
      cutTuckHashes.push(renderHash(createDefaultAppearanceV2({ uniform: { shirtCut, tucked } })));
    }
  }
  check('all 3 shirt cuts x tucked/untucked render 6 distinct silhouettes', countDistinct(cutTuckHashes) === 6, `${countDistinct(cutTuckHashes)}/6`);

  // 6. Socks (3) & sleeves (2)
  const sockHashes = SOCK_LENGTHS_V2.map((socks) => renderHash(createDefaultAppearanceV2({ uniform: { socks } })));
  const sleeveHashes = (['normal', 'long'] as const).map((sleeves) => renderHash(createDefaultAppearanceV2({ uniform: { sleeves } })));
  check('all 3 sock lengths render distinctly', countDistinct(sockHashes) === 3, `${countDistinct(sockHashes)}/3`);
  check('normal vs long outer sleeves render distinctly', countDistinct(sleeveHashes) === 2, `${countDistinct(sleeveHashes)}/2`);

  // 7. Interior shirt (off + 2 sleeve x 2 neck combos = 5)
  const intHashes = [
    renderHash(createDefaultAppearanceV2({ uniform: { interiorShirt: { enabled: false, sleeve: 'short', neck: 'short' } } })),
    renderHash(createDefaultAppearanceV2({ uniform: { interiorShirt: { enabled: true, sleeve: 'short', neck: 'short' } } })),
    renderHash(createDefaultAppearanceV2({ uniform: { interiorShirt: { enabled: true, sleeve: 'long', neck: 'short' } } })),
    renderHash(createDefaultAppearanceV2({ uniform: { interiorShirt: { enabled: true, sleeve: 'short', neck: 'long' } } })),
    renderHash(createDefaultAppearanceV2({ uniform: { interiorShirt: { enabled: true, sleeve: 'long', neck: 'long' } } })),
  ];
  check('winter interior shirt off + sleeve/neck combinations render distinctly', countDistinct(intHashes) === 5, `${countDistinct(intHashes)}/5`);

  // 8. Shoe color on upright & diving pose
  const bootStand = ['#111111', '#f8fafc', '#ef4444', '#facc15'].map((shoeColor) =>
    renderHash(createDefaultAppearanceV2({ uniform: { shoeColor } }), 'idle', 0, 0, 1)
  );
  const bootDive = ['#111111', '#f8fafc', '#ef4444'].map((shoeColor) =>
    renderHash(createDefaultAppearanceV2({ uniform: { shoeColor } }), 'diving_header', 2, 1, 0)
  );
  check('shoeColor changes boot colors in upright & dive poses', countDistinct(bootStand) === 4 && countDistinct(bootDive) === 3);

  return { ok, rows };
}

export type C7ContactSheetKind = 'builds' | 'kits' | 'proportions';

/**
 * Generates labeled C7 contact sheets on HTMLCanvasElement for visual review in browser (?dev=1).
 */
export function generateC7ContactSheet(kind: C7ContactSheetKind): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  if (!ctx) return cv;

  const drawCell = (
    gx: number,
    gy: number,
    cw: number,
    ch: number,
    label: string,
    app: AppearanceV2,
    action = 'idle',
    frame = 0,
    dirX = 0,
    dirY = 1
  ) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(gx, gy, cw - 6, ch - 6);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(gx + 0.5, gy + 0.5, cw - 7, ch - 7);

    // Pitch turf strip at feet
    ctx.fillStyle = '#15803d';
    ctx.fillRect(gx + 6, gy + ch - 34, cw - 18, 12);

    const sprite = renderRigRun(app, '#dc2626', '#ffffff', '#ffffff', '#dc2626', frame, dirX, dirY, 10, false, true, action);
    const sx = Math.round(gx + (cw - 6 - sprite.width) / 2);
    const sy = Math.round(gy + ch - 26 - sprite.height + 6);
    ctx.drawImage(sprite, sx, sy);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, gx + (cw - 6) / 2, gy + ch - 12);
  };

  if (kind === 'builds') {
    // All 9 builds (3 weight classes x 3 strength tiers) x 3 leg lengths = 27 cells
    const weights = [
      { name: 'skinny', h: 180, w: 60 },
      { name: 'normal', h: 180, w: 75 },
      { name: 'heavy', h: 180, w: 94 },
    ];
    const strengths = [
      { name: 'low', str: 60 },
      { name: 'med', str: 80 },
      { name: 'high', str: 95 },
    ];
    const cols = 9;
    const rows = 3;
    const cw = 112;
    const ch = 152;
    cv.width = cols * cw + 24;
    cv.height = rows * ch + 46;
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('C7 CONTACT SHEET: 9 BUILDS x 3 LEG LENGTHS (short / normal / long)', 14, 24);

    LIMB_LENGTHS_V2.forEach((leg, rIdx) => {
      let cIdx = 0;
      for (const wt of weights) {
        for (const st of strengths) {
          const app = createDefaultAppearanceV2({
            physique: { heightCm: wt.h, weightKg: wt.w, strength: st.str, legsLength: leg },
          });
          drawCell(14 + cIdx * cw, 38 + rIdx * ch, cw, ch, `${wt.name}_${st.name} (${leg})`, app, 'running_run', 1, 1, 1);
          cIdx++;
        }
      }
    });
    return cv;
  }

  if (kind === 'kits') {
    const entries: Array<{ label: string; app: AppearanceV2 }> = [];
    for (const cut of SHIRT_CUTS_V2) {
      for (const tucked of ['tucked', 'untucked'] as const) {
        entries.push({
          label: `${cut} / ${tucked}`,
          app: createDefaultAppearanceV2({ uniform: { shirtCut: cut, tucked } }),
        });
      }
    }
    for (const socks of SOCK_LENGTHS_V2) {
      entries.push({
        label: `socks:${socks}`,
        app: createDefaultAppearanceV2({ uniform: { socks } }),
      });
    }
    entries.push({
      label: 'sleeves:long',
      app: createDefaultAppearanceV2({ uniform: { sleeves: 'long' } }),
    });
    entries.push({
      label: 'int:short/short',
      app: createDefaultAppearanceV2({ uniform: { interiorShirt: { enabled: true, sleeve: 'short', neck: 'short' } } }),
    });
    entries.push({
      label: 'int:long/long',
      app: createDefaultAppearanceV2({ uniform: { interiorShirt: { enabled: true, sleeve: 'long', neck: 'long' } } }),
    });
    for (const shoe of SHOE_COLOR_PRESETS_V2.slice(0, 4)) {
      entries.push({
        label: `boot ${shoe}`,
        app: createDefaultAppearanceV2({ uniform: { shoeColor: shoe } }),
      });
    }
    for (const skin of SKIN_TONES_V2) {
      entries.push({
        label: `skin:${skin}`,
        app: createDefaultAppearanceV2({ skinTone: skin }),
      });
    }

    const cols = 6;
    const rows = Math.ceil(entries.length / cols);
    const cw = 124;
    const ch = 152;
    cv.width = cols * cw + 24;
    cv.height = rows * ch + 46;
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('C7 CONTACT SHEET: KIT CUTS x TUCKS, SOCKS, SLEEVES, INTERIOR SHIRT, BOOTS & 7 SKIN TONES', 14, 24);
    entries.forEach((e, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      drawCell(14 + c * cw, 38 + r * ch, cw, ch, e.label, e.app);
    });
    return cv;
  }

  // 'proportions': neck width, neck length, chest, waist, thighs, calves, arms length, leg stride frames
  const entries: Array<{ label: string; app: AppearanceV2; action?: string; frame?: number; dirX?: number; dirY?: number }> = [];
  for (const nw of NECK_WIDTHS_V2) {
    entries.push({ label: `neckW:${nw}`, app: createDefaultAppearanceV2({ physique: { neckWidth: nw } }) });
  }
  for (const nl of NECK_LENGTHS_V2) {
    entries.push({ label: `neckL:${nl}`, app: createDefaultAppearanceV2({ physique: { neckLength: nl } }) });
  }
  for (const ch of CHEST_SIZES_V2) {
    entries.push({ label: `chest:${ch}`, app: createDefaultAppearanceV2({ physique: { chest: ch } }) });
  }
  for (const wa of WAIST_SIZES_V2) {
    entries.push({ label: `waist:${wa}`, app: createDefaultAppearanceV2({ physique: { waist: wa } }) });
  }
  for (const th of THIGH_SIZES_V2) {
    entries.push({ label: `thighs:${th}`, app: createDefaultAppearanceV2({ physique: { thighs: th } }) });
  }
  for (const ca of CALF_SIZES_V2) {
    entries.push({ label: `calves:${ca}`, app: createDefaultAppearanceV2({ physique: { calves: ca } }) });
  }
  for (const ar of LIMB_LENGTHS_V2) {
    entries.push({ label: `arms:${ar}`, app: createDefaultAppearanceV2({ physique: { armsLength: ar } }), action: 'running_run', frame: 1, dirX: 1, dirY: 0 });
  }
  for (const leg of LIMB_LENGTHS_V2) {
    entries.push({ label: `stride:${leg}`, app: createDefaultAppearanceV2({ physique: { legsLength: leg } }), action: 'running_sprint', frame: 0, dirX: 1, dirY: 0 });
  }

  const cols = 6;
  const rows = Math.ceil(entries.length / cols);
  const cw = 124;
  const ch = 152;
  cv.width = cols * cw + 24;
  cv.height = rows * ch + 46;
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('C7 CONTACT SHEET: NECK / CHEST / WAIST / THIGHS / CALVES / ARMS / STRIDE', 14, 24);
  entries.forEach((e, idx) => {
    const c = idx % cols;
    const r = Math.floor(idx / cols);
    drawCell(14 + c * cw, 38 + r * ch, cw, ch, e.label, e.app, e.action || 'idle', e.frame ?? 0, e.dirX ?? 0, e.dirY ?? 1);
  });
  return cv;
}

export function openC7PreviewSheetsOverlay(): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('c7-preview-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'c7-preview-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,0.96);overflow:auto;padding:20px;color:#fff;font-family:monospace;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'CLOSE C7 SHEETS';
  closeBtn.style.cssText = 'position:sticky;top:0;padding:8px 14px;background:#dc2626;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;margin-bottom:16px;';
  closeBtn.onclick = () => overlay.remove();
  overlay.appendChild(closeBtn);

  for (const kind of ['builds', 'kits', 'proportions'] as C7ContactSheetKind[]) {
    const canvas = generateC7ContactSheet(kind);
    canvas.style.cssText = 'display:block;max-width:100%;height:auto;margin-bottom:24px;border:1px solid #334155;';
    overlay.appendChild(canvas);
  }
  document.body.appendChild(overlay);
}

/**
 * Verifies every C8 head & accessory option renders distinctly across BOTH res=2 and res=1,
 * across viewing directions, dye overrides, and without pose/connectivity breaks under headwear.
 */
export function runC8OptionRenderTests(): { ok: boolean; rows: string[] } {
  const rows: string[] = [];
  let ok = true;
  const check = (name: string, pass: boolean, detail = '') => {
    if (!pass) ok = false;
    rows.push(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
  };

  const renderProbe = (
    app: AppearanceV2,
    action = 'idle',
    frame = 0,
    dirX = 0,
    dirY = 1,
    res: 1 | 2 = 2
  ): { hash: number; oob: number; comps: number } => {
    const dims = getRigCanvasDimensions(action, res);
    const buf = new PixelBufferSurface(dims.width, dims.height);
    renderRigToContext(buf, app, '#dc2626', '#ffffff', '#0f172a', '#dc2626', frame, dirX, dirY, 10, false, true, action, res);
    return { hash: buf.colorHash, oob: buf.outOfBoundsCount + buf.borderTouchCount, comps: buf.countConnectedComponents() };
  };

  for (const res of [2, 1] as const) {
    // 1. Hair: shaven + all 4 non-shaven lengths x 5 textures = 21 styles
    const hairHashes: number[] = [
      renderProbe(createDefaultAppearanceV2({ hairLength: 'shaven', hairTexture: 'straight' }), 'idle', 0, 0, 1, res).hash,
    ];
    for (const len of HAIR_LENGTHS_V2) {
      if (len === 'shaven') continue;
      for (const tex of HAIR_TEXTURES_V2) {
        hairHashes.push(renderProbe(createDefaultAppearanceV2({ hairLength: len, hairTexture: tex }), 'idle', 0, 0, 1, res).hash);
      }
    }
    check(`res=${res}: shaven + 4x5 hair length x texture styles render distinctly`, new Set(hairHashes).size === 21, `${new Set(hairHashes).size}/21`);

    // 2. Hair colors (6) + hair dyes (8) + dye override proof
    const hcHashes = HAIR_COLORS_V2.map((hairColor) => renderProbe(createDefaultAppearanceV2({ hairLength: 'medium', hairColor, hairDye: 'natural' }), 'idle', 0, 0, 1, res).hash);
    const nonNatDyes = HAIR_DYES_V2.filter((d) => d !== 'natural');
    const hdHashes = nonNatDyes.map((hairDye) => renderProbe(createDefaultAppearanceV2({ hairLength: 'medium', hairColor: 'black', hairDye }), 'idle', 0, 0, 1, res).hash);
    const dyeOverrideOk =
      renderProbe(createDefaultAppearanceV2({ hairLength: 'medium', hairColor: 'black', hairDye: 'blue' }), 'idle', 0, 0, 1, res).hash ===
      renderProbe(createDefaultAppearanceV2({ hairLength: 'medium', hairColor: 'blonde', hairDye: 'blue' }), 'idle', 0, 0, 1, res).hash;
    check(`res=${res}: 6 hair colors & 8 dyes distinct + dye overrides base hairColor`, new Set(hcHashes).size === 6 && new Set(hdHashes).size === 8 && dyeOverrideOk);

    // 3. Facial hair: all 11 options
    const fhHashes = FACIAL_HAIRS_V2.map((facialHair) =>
      renderProbe(createDefaultAppearanceV2({ hairColor: 'black', facialHair }), 'idle', 0, 0, 1, res).hash
    );
    check(`res=${res}: all 11 facial hair options render distinctly`, new Set(fhHashes).size === 11, `${new Set(fhHashes).size}/11`);

    // 4. Headwear: none + 4 options across front & back views + zero pose breaks
    const hwFront = HEADWEAR_V2.map((headwear) => renderProbe(createDefaultAppearanceV2({ headwear }), 'idle', 0, 0, 1, res).hash);
    const hwBack = HEADWEAR_V2.map((headwear) => renderProbe(createDefaultAppearanceV2({ headwear }), 'idle', 0, 0, -1, res).hash);
    let headwearPoseClean = true;
    for (const headwear of HEADWEAR_V2) {
      for (const act of ['idle', 'celebrating', 'diving_header', 'running_sprint', 'bicycle_kick']) {
        for (const [dx, dy] of DIRECTIONS_8) {
          const p = renderProbe(createDefaultAppearanceV2({ hairLength: 'long', hairTexture: 'curly', headwear }), act, 2, dx, dy, res);
          if (p.oob > 0 || p.comps !== 1) headwearPoseClean = false;
        }
      }
    }
    check(
      `res=${res}: all 5 headwear options distinct front/back & zero pose breaks`,
      new Set(hwFront).size === 5 && new Set(hwBack).size === 5 && headwearPoseClean
    );

    // 5. Necklaces: none + 4 options
    const nkHashes = NECKLACES_V2.map((necklace) => renderProbe(createDefaultAppearanceV2({ necklace }), 'idle', 0, 0, 1, res).hash);
    check(`res=${res}: all 5 necklace options render distinctly`, new Set(nkHashes).size === 5, `${new Set(nkHashes).size}/5`);

    // 6. Tattoos: neck (5), leftArm (6), rightArm (6), face (5)
    const neckTatHashes = NECK_TATTOOS_V2.map((neck) => renderProbe(createDefaultAppearanceV2({ tattoos: { neck } }), 'idle', 0, 0, 1, res).hash);
    const lArmHashes = ARM_TATTOOS_V2.map((leftArm) => renderProbe(createDefaultAppearanceV2({ tattoos: { leftArm }, uniform: { sleeves: 'normal' } }), 'idle', 0, 0, 1, res).hash);
    const rArmHashes = ARM_TATTOOS_V2.map((rightArm) => renderProbe(createDefaultAppearanceV2({ tattoos: { rightArm }, uniform: { sleeves: 'normal' } }), 'idle', 0, 0, 1, res).hash);
    const faceTatHashes = FACE_TATTOOS_V2.map((face) => renderProbe(createDefaultAppearanceV2({ tattoos: { face } }), 'idle', 0, 0, 1, res).hash);
    check(
      `res=${res}: all neck (5), left/right arm (6), & face (5) tattoos render distinctly`,
      new Set(neckTatHashes).size === 5 &&
        new Set(lArmHashes).size === 6 &&
        new Set(rArmHashes).size === 6 &&
        new Set(faceTatHashes).size === 5
    );

    // 7. Earrings: left & right independently, 5 styles, 5 materials, 5 gems
    const eStyleL = EARRING_STYLES_V2.map((style) => renderProbe(createDefaultAppearanceV2({ earrings: { left: { style, material: 'gold', gem: 'emerald' } } }), 'idle', 0, 0, 1, res).hash);
    const eStyleR = EARRING_STYLES_V2.map((style) => renderProbe(createDefaultAppearanceV2({ earrings: { right: { style, material: 'silver', gem: 'sapphire' } } }), 'idle', 0, 0, 1, res).hash);
    const eMat = EARRING_MATERIALS_V2.map((material) => renderProbe(createDefaultAppearanceV2({ earrings: { left: { style: 'large_barbell', material } } }), 'idle', 0, 0, 1, res).hash);
    const eGem = EARRING_GEMS_V2.map((gem) => renderProbe(createDefaultAppearanceV2({ earrings: { right: { style: 'gem', material: 'gold', gem } } }), 'idle', 0, 0, 1, res).hash);
    check(
      `res=${res}: left/right earrings (5 styles x 5 materials x 5 gems) render distinctly`,
      new Set(eStyleL).size === 5 &&
        new Set(eStyleR).size === 5 &&
        new Set(eMat).size === 5 &&
        new Set(eGem).size === 5
    );
  }

  return { ok, rows };
}

export type C8ContactSheetKind = 'hair' | 'facial_headwear' | 'tattoos_jewelry_combos';

/**
 * Generates labeled C8 contact sheets on HTMLCanvasElement for visual review in browser (?dev=1).
 */
export function generateC8ContactSheet(kind: C8ContactSheetKind): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  if (!ctx) return cv;

  const drawCell = (
    gx: number,
    gy: number,
    cw: number,
    ch: number,
    label: string,
    app: AppearanceV2,
    action = 'idle',
    frame = 0,
    dirX = 0,
    dirY = 1,
    res: 1 | 2 = 2
  ) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(gx, gy, cw - 6, ch - 6);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(gx + 0.5, gy + 0.5, cw - 7, ch - 7);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(gx + 6, gy + ch - 34, cw - 18, 12);

    const sprite = renderRigRun(app, '#dc2626', '#ffffff', '#ffffff', '#dc2626', frame, dirX, dirY, 10, false, true, action, res);
    const drawW = res === 1 ? sprite.width * 2 : sprite.width;
    const drawH = res === 1 ? sprite.height * 2 : sprite.height;
    const sx = Math.round(gx + (cw - 6 - drawW) / 2);
    const sy = Math.round(gy + ch - 26 - drawH + 6);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, sx, sy, drawW, drawH);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, gx + (cw - 6) / 2, gy + ch - 12);
  };

  if (kind === 'hair') {
    const entries: Array<{ label: string; app: AppearanceV2; dirY?: number }> = [
      { label: 'shaven', app: createDefaultAppearanceV2({ hairLength: 'shaven' }) },
    ];
    for (const len of HAIR_LENGTHS_V2) {
      if (len === 'shaven') continue;
      for (const tex of HAIR_TEXTURES_V2) {
        entries.push({ label: `${len}/${tex}`, app: createDefaultAppearanceV2({ hairLength: len, hairTexture: tex }) });
      }
    }
    for (const col of HAIR_COLORS_V2) {
      entries.push({ label: `col:${col}`, app: createDefaultAppearanceV2({ hairLength: 'medium', hairTexture: 'wavy', hairColor: col }) });
    }
    for (const dye of HAIR_DYES_V2.filter((d) => d !== 'natural')) {
      entries.push({ label: `dye:${dye}`, app: createDefaultAppearanceV2({ hairLength: 'long', hairTexture: 'curly', hairDye: dye }) });
    }

    const cols = 7;
    const rows = Math.ceil(entries.length / cols);
    const cw = 116;
    const ch = 152;
    cv.width = cols * cw + 24;
    cv.height = rows * ch + 46;
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('C8 SHEET 1: HAIR (5 LENGTHS x 5 TEXTURES + 6 COLORS + 8 DYES + SHAVEN)', 14, 24);
    entries.forEach((e, idx) => {
      drawCell(14 + (idx % cols) * cw, 38 + Math.floor(idx / cols) * ch, cw, ch, e.label, e.app);
    });
    return cv;
  }

  if (kind === 'facial_headwear') {
    const entries: Array<{ label: string; app: AppearanceV2; dirX?: number; dirY?: number; res?: 1 | 2 }> = [];
    for (const fh of FACIAL_HAIRS_V2) {
      entries.push({ label: `fh:${fh}`, app: createDefaultAppearanceV2({ facialHair: fh }) });
    }
    for (const hw of HEADWEAR_V2) {
      if (hw === 'none') continue;
      entries.push({ label: `hw:${hw} (F)`, app: createDefaultAppearanceV2({ headwear: hw }), dirX: 0, dirY: 1 });
      entries.push({ label: `hw:${hw} (S)`, app: createDefaultAppearanceV2({ headwear: hw }), dirX: 1, dirY: 0 });
      entries.push({ label: `hw:${hw} (B)`, app: createDefaultAppearanceV2({ headwear: hw }), dirX: 0, dirY: -1 });
      entries.push({ label: `hw:${hw} (1x)`, app: createDefaultAppearanceV2({ headwear: hw }), dirX: 1, dirY: 1, res: 1 });
    }

    const cols = 6;
    const rows = Math.ceil(entries.length / cols);
    const cw = 128;
    const ch = 152;
    cv.width = cols * cw + 24;
    cv.height = rows * ch + 46;
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('C8 SHEET 2: 11 FACIAL HAIRS + 4 HEADWEARS (FRONT / SIDE / BACK / 1x)', 14, 24);
    entries.forEach((e, idx) => {
      drawCell(14 + (idx % cols) * cw, 38 + Math.floor(idx / cols) * ch, cw, ch, e.label, e.app, 'idle', 0, e.dirX ?? 0, e.dirY ?? 1, e.res ?? 2);
    });
    return cv;
  }

  // 'tattoos_jewelry_combos'
  const entries: Array<{ label: string; app: AppearanceV2; action?: string; dirX?: number; dirY?: number; res?: 1 | 2 }> = [];
  for (const nk of NECKLACES_V2.filter((n) => n !== 'none')) {
    entries.push({ label: `neck:${nk}`, app: createDefaultAppearanceV2({ necklace: nk }) });
  }
  for (const nt of NECK_TATTOOS_V2.filter((t) => t !== 'none')) {
    entries.push({ label: `ntat:${nt}`, app: createDefaultAppearanceV2({ physique: { neckLength: 'long' }, tattoos: { neck: nt } }) });
  }
  for (const at of ARM_TATTOOS_V2.filter((t) => t !== 'none')) {
    entries.push({ label: `arm:${at}`, app: createDefaultAppearanceV2({ tattoos: { leftArm: at, rightArm: at } }) });
  }
  for (const ft of FACE_TATTOOS_V2.filter((t) => t !== 'none')) {
    entries.push({ label: `face:${ft}`, app: createDefaultAppearanceV2({ tattoos: { face: ft } }) });
  }
  for (const es of EARRING_STYLES_V2.filter((s) => s !== 'none')) {
    entries.push({
      label: `ear:${es}`,
      app: createDefaultAppearanceV2({ earrings: { left: { style: es, material: 'gold', gem: 'emerald' }, right: { style: es, material: 'silver', gem: 'amethyst' } } }),
    });
  }
  // Combination spot checks (8 directions + dive + 1x)
  const spotCombo = getClipTestVariants()[4].appearance;
  for (const [dx, dy] of DIRECTIONS_8) {
    entries.push({ label: `combo dir(${dx},${dy})`, app: spotCombo, dirX: dx, dirY: dy });
  }
  entries.push({ label: 'combo dive 2x', app: spotCombo, action: 'diving_header', dirX: 1, dirY: 0 });
  entries.push({ label: 'combo idle 1x', app: spotCombo, res: 1 });

  const cols = 6;
  const rows = Math.ceil(entries.length / cols);
  const cw = 132;
  const ch = 152;
  cv.width = cols * cw + 24;
  cv.height = rows * ch + 46;
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('C8 SHEET 3: NECKLACES, TATTOOS, EARRINGS & 8-DIR / DIVE / 1x COMBO CHECKS', 14, 24);
  entries.forEach((e, idx) => {
    drawCell(14 + (idx % cols) * cw, 38 + Math.floor(idx / cols) * ch, cw, ch, e.label, e.app, e.action || 'idle', 1, e.dirX ?? 0, e.dirY ?? 1, e.res ?? 2);
  });
  return cv;
}

export function openC8PreviewSheetsOverlay(): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('c8-preview-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'c8-preview-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,0.96);overflow:auto;padding:20px;color:#fff;font-family:monospace;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'CLOSE C8 SHEETS';
  closeBtn.style.cssText = 'position:sticky;top:0;padding:8px 14px;background:#dc2626;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;margin-bottom:16px;';
  closeBtn.onclick = () => overlay.remove();
  overlay.appendChild(closeBtn);

  for (const kind of ['hair', 'facial_headwear', 'tattoos_jewelry_combos'] as C8ContactSheetKind[]) {
    const canvas = generateC8ContactSheet(kind);
    canvas.style.cssText = 'display:block;max-width:100%;height:auto;margin-bottom:24px;border:1px solid #334155;';
    overlay.appendChild(canvas);
  }
  document.body.appendChild(overlay);
}
