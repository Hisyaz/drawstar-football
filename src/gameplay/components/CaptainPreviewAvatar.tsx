/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { PlayerAppearance, TeamKit } from '../types';

function adjustHexColor(hex: string, delta: number): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + delta));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + delta));
  const b = Math.min(255, Math.max(0, (num & 255) + delta));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function drawCaptainPortrait(
  ctx: CanvasRenderingContext2D,
  appearance: PlayerAppearance = {
    heightCm: 182,
    weightKg: 78,
    muscleMass: 3,
    skinTone: '#ffdbac',
    hairStyle: 'part',
    hairColor: '#2b1b0d',
    facialHair: 'clean',
  },
  kit: TeamKit,
  options: { width?: number; height?: number; facing?: 'left' | 'right'; showArmband?: boolean; scale?: number } = {}
): void {
  const { width = 96, height = 168, facing = 'right', showArmband = true } = options;
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;

  const cx = Math.floor(width / 2);
  const footY = height - 12;
  if (facing === 'left') {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  const skin = appearance.skinTone || '#ffdbac';
  const skinDark = adjustHexColor(skin, -36);
  const skinLight = adjustHexColor(skin, 24);
  const hair = appearance.hairColor || '#2b1b0d';
  const hairDark = adjustHexColor(hair, -40);
  const hairLight = adjustHexColor(hair, 30);

  const primary = kit.primaryColor || '#dc2626';
  const primaryDark = adjustHexColor(primary, -45);
  const primaryLight = adjustHexColor(primary, 35);
  const secondary = kit.secondaryColor || '#ffffff';
  const secondaryDark = adjustHexColor(secondary, -35);
  const shorts = kit.shortsColor || '#ffffff';
  const shortsDark = adjustHexColor(shorts, -40);
  const shortsLight = adjustHexColor(shorts, 25);
  const socks = kit.socksColor || '#dc2626';
  const socksDark = adjustHexColor(socks, -45);
  const socksLight = adjustHexColor(socks, 30);

  const gold = '#f59e0b';
  const goldLight = '#fef08a';
  const goldDark = '#b45309';

  const px = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  };

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, footY + 2, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(cx, footY + 2, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Boots
  px(cx - 15, footY - 6, 11, 7, '#0f172a');
  px(cx - 16, footY - 2, 12, 3, '#020617');
  px(cx - 15, footY - 6, 2, 7, '#334155');
  px(cx - 13, footY - 4, 6, 2, '#f8fafc');
  px(cx - 15, footY + 1, 3, 2, '#e2e8f0');
  px(cx - 8, footY + 1, 3, 2, '#e2e8f0');

  px(cx + 4, footY - 6, 12, 7, '#0f172a');
  px(cx + 4, footY - 2, 13, 3, '#020617');
  px(cx + 4, footY - 6, 2, 7, '#334155');
  px(cx + 6, footY - 4, 6, 2, '#f8fafc');
  px(cx + 5, footY + 1, 3, 2, '#e2e8f0');
  px(cx + 12, footY + 1, 3, 2, '#e2e8f0');

  // Socks & knees
  px(cx - 14, footY - 26, 9, 21, socks);
  px(cx - 14, footY - 26, 2, 21, socksLight);
  px(cx - 7, footY - 26, 2, 21, socksDark);
  px(cx - 15, footY - 28, 11, 3, secondary);
  px(cx - 15, footY - 26, 11, 2, secondaryDark);

  px(cx + 5, footY - 26, 9, 21, socks);
  px(cx + 5, footY - 26, 2, 21, socksLight);
  px(cx + 12, footY - 26, 2, 21, socksDark);
  px(cx + 4, footY - 28, 11, 3, secondary);
  px(cx + 4, footY - 26, 11, 2, secondaryDark);

  px(cx - 13, footY - 37, 7, 10, skin);
  px(cx - 13, footY - 37, 2, 9, skinLight);
  px(cx - 8, footY - 37, 2, 9, skinDark);
  px(cx - 12, footY - 33, 5, 3, skinLight);

  px(cx + 6, footY - 37, 7, 10, skin);
  px(cx + 6, footY - 37, 2, 9, skinLight);
  px(cx + 11, footY - 37, 2, 9, skinDark);
  px(cx + 7, footY - 33, 5, 3, skinLight);

  // Shorts
  const shortsY = footY - 60;
  px(cx - 17, shortsY + 6, 15, 18, shorts);
  px(cx - 17, shortsY + 6, 2, 18, secondary);
  px(cx - 15, shortsY + 6, 3, 18, shortsLight);
  px(cx - 6, shortsY + 14, 4, 10, shortsDark);
  px(cx - 17, shortsY + 22, 15, 2, secondaryDark);

  px(cx + 2, shortsY + 6, 15, 18, shorts);
  px(cx + 15, shortsY + 6, 2, 18, secondary);
  px(cx + 3, shortsY + 6, 3, 18, shortsLight);
  px(cx + 2, shortsY + 14, 4, 10, shortsDark);
  px(cx + 2, shortsY + 22, 15, 2, secondaryDark);

  px(cx - 16, shortsY, 32, 7, shorts);
  px(cx - 16, shortsY, 32, 2, shortsLight);
  px(cx - 1, shortsY + 3, 2, 16, shortsDark);

  // Torso & Jersey
  const torsoY = footY - 104;
  const torsoH = 45;
  px(cx - 18, torsoY + 8, 36, torsoH - 8, primary);
  px(cx - 18, torsoY + 8, 3, torsoH - 8, primaryDark);
  px(cx + 15, torsoY + 8, 3, torsoH - 8, primaryDark);
  px(cx - 13, torsoY + 12, 12, 14, primaryLight);
  px(cx + 1, torsoY + 12, 12, 14, primaryLight);
  px(cx - 1, torsoY + 10, 2, torsoH - 12, primaryDark);
  px(cx - 17, torsoY + torsoH - 3, 34, 3, primaryDark);
  px(cx - 10, torsoY + 4, 20, 4, secondary);
  px(cx - 8, torsoY + 6, 16, 2, secondaryDark);
  px(cx - 14, torsoY + 14, 6, 6, secondary);
  px(cx - 13, torsoY + 15, 4, 4, gold);

  // Left sleeve & arm + optional Captain armband
  px(cx - 24, torsoY + 6, 8, 12, primary);
  px(cx - 24, torsoY + 16, 8, 2, secondary);
  if (showArmband) {
    px(cx - 25, torsoY + 18, 9, 7, gold);
    px(cx - 25, torsoY + 18, 9, 1, goldLight);
    px(cx - 25, torsoY + 24, 9, 1, goldDark);
    px(cx - 23, torsoY + 20, 4, 1, '#000000');
    px(cx - 23, torsoY + 21, 2, 2, '#000000');
    px(cx - 23, torsoY + 23, 4, 1, '#000000');
  }
  px(cx - 23, torsoY + 25, 7, 14, skin);
  px(cx - 23, torsoY + 25, 2, 14, skinLight);
  px(cx - 18, torsoY + 25, 2, 14, skinDark);

  // Right sleeve & arm + crossed forearms
  px(cx + 16, torsoY + 6, 8, 12, primary);
  px(cx + 16, torsoY + 16, 8, 2, secondary);
  px(cx + 16, torsoY + 18, 7, 18, skin);
  px(cx + 16, torsoY + 18, 2, 18, skinLight);
  px(cx + 21, torsoY + 18, 2, 18, skinDark);

  px(cx - 16, torsoY + 28, 32, 9, skin);
  px(cx - 16, torsoY + 28, 32, 2, skinLight);
  px(cx - 16, torsoY + 35, 32, 2, skinDark);
  px(cx - 8, torsoY + 30, 16, 5, skinLight);
  px(cx - 4, torsoY + 32, 8, 2, skinDark);

  // Neck
  px(cx - 6, torsoY, 12, 10, skin);
  px(cx - 6, torsoY, 2, 10, skinDark);
  px(cx + 4, torsoY, 2, 10, skinDark);
  px(cx - 3, torsoY + 2, 6, 6, skinLight);

  // Head & Face
  const headY = torsoY - 25;
  px(cx - 10, headY + 6, 20, 20, skin);
  px(cx - 10, headY + 6, 2, 20, skinDark);
  px(cx + 8, headY + 6, 2, 20, skinDark);
  px(cx - 7, headY + 10, 14, 12, skinLight);
  px(cx - 8, headY + 22, 16, 4, skin);
  px(cx - 6, headY + 24, 12, 2, skinDark);
  px(cx - 12, headY + 12, 3, 8, skin);
  px(cx - 12, headY + 14, 2, 4, skinDark);
  px(cx + 9, headY + 12, 3, 8, skin);
  px(cx + 10, headY + 14, 2, 4, skinDark);

  px(cx - 7, headY + 11, 5, 2, hairDark);
  px(cx + 2, headY + 11, 5, 2, hairDark);
  px(cx - 6, headY + 14, 4, 3, '#ffffff');
  px(cx - 4, headY + 14, 2, 3, '#0f172a');
  px(cx + 2, headY + 14, 4, 3, '#ffffff');
  px(cx + 2, headY + 14, 2, 3, '#0f172a');
  px(cx - 1, headY + 13, 2, 6, skinDark);
  px(cx - 2, headY + 18, 4, 2, skinDark);
  px(cx - 4, headY + 21, 8, 2, skinDark);
  px(cx - 3, headY + 21, 6, 1, '#881337');

  // Facial hair
  if (appearance.facialHair === 'beard' || appearance.facialHair === 'stubble') {
    const fhColor = appearance.facialHair === 'beard' ? hairDark : skinDark;
    px(cx - 8, headY + 19, 3, 6, fhColor);
    px(cx + 5, headY + 19, 3, 6, fhColor);
    px(cx - 7, headY + 23, 14, 3, fhColor);
    px(cx - 4, headY + 20, 8, 2, fhColor);
  } else if (appearance.facialHair === 'goatee') {
    px(cx - 4, headY + 22, 8, 4, hairDark);
    px(cx - 3, headY + 20, 6, 2, hairDark);
  }

  // Hair style
  const hairStyle = appearance.hairStyle || 'part';
  if (hairStyle === 'buzzcut') {
    px(cx - 10, headY, 20, 7, hair);
    px(cx - 11, headY + 2, 22, 6, hair);
    px(cx - 9, headY, 18, 2, hairLight);
  } else if (hairStyle === 'afro') {
    px(cx - 14, headY - 6, 28, 14, hair);
    px(cx - 15, headY - 4, 30, 13, hair);
    px(cx - 12, headY - 6, 24, 3, hairLight);
    px(cx - 14, headY + 5, 4, 6, hairDark);
    px(cx + 10, headY + 5, 4, 6, hairDark);
  } else if (hairStyle === 'curly' || hairStyle === 'dreads') {
    px(cx - 12, headY - 4, 24, 12, hair);
    px(cx - 13, headY - 2, 26, 14, hair);
    px(cx - 13, headY + 8, 4, 8, hairDark);
    px(cx + 9, headY + 8, 4, 8, hairDark);
    px(cx - 10, headY - 4, 20, 3, hairLight);
  } else if (hairStyle === 'bald') {
    px(cx - 9, headY + 1, 18, 7, skin);
    px(cx - 8, headY + 1, 16, 2, skinLight);
  } else {
    px(cx - 11, headY - 2, 22, 10, hair);
    px(cx - 12, headY, 24, 9, hair);
    px(cx - 10, headY - 2, 12, 3, hairLight);
    px(cx - 12, headY + 4, 3, 6, hairDark);
    px(cx + 9, headY + 4, 3, 6, hairDark);
    px(cx - 6, headY + 6, 12, 2, hairDark);
  }

  ctx.restore();
}

interface CaptainPreviewAvatarProps {
  appearance?: PlayerAppearance;
  kit: TeamKit;
  facing?: 'left' | 'right';
  width?: number;
  height?: number;
  scale?: number;
  className?: string;
}

export const CaptainPreviewAvatar: React.FC<CaptainPreviewAvatarProps> = ({
  appearance,
  kit,
  facing = 'right',
  width = 112,
  height = 192,
  scale = 2,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawCaptainPortrait(ctx, appearance, kit, {
        width,
        height,
        facing: facing === 'left' ? 'left' : 'right',
        showArmband: true,
        scale,
      });
    }
  }, [appearance, kit, facing, width, height, scale]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ imageRendering: 'pixelated', width: `${width * scale}px`, height: `${height * scale}px` }}
        className="transition-transform duration-200 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
};
