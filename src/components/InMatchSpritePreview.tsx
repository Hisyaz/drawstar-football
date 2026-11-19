import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { PlayerCardData } from '../types';
import { TeamKit } from '../gameplay/types';
import { renderRigToContext, getRigCanvasDimensions } from '../gameplay/game/spriteRig';
import { extractPlayerRenderExtras, playerCardToAppearanceV2 } from '../utils/gameplayAdapter';

type MatchFacing = 'down' | 'down-right' | 'right' | 'up-right' | 'up' | 'up-left' | 'left' | 'down-left';

interface InMatchSpritePreviewProps {
  player: PlayerCardData;
  kitOverride?: Partial<TeamKit>;
  facing?: 'down' | 'right' | 'left' | 'up';
  animated?: boolean;
  scale?: number;
  showPoseControls?: boolean;
  className?: string;
}

const STAGE_W = 148;
const STAGE_H = 128;

const ACTION_BUTTONS: Array<{ id: string; label: string }> = [
  { id: 'idle', label: 'Idle' },
  { id: 'running_walk', label: 'Walk' },
  { id: 'running_run', label: 'Run' },
  { id: 'running_sprint', label: 'Sprint' },
  { id: 'dribbling', label: 'Dribble' },
  { id: 'step_overs', label: 'Skill' },
  { id: 'standing_pass_low', label: 'Pass' },
  { id: 'running_shot_mid', label: 'Shoot' },
  { id: 'heading', label: 'Header' },
  { id: 'bicycle_kick', label: 'Bicycle' },
  { id: 'celebrating', label: 'Celebrate' },
  { id: 'sliding_tackle', label: 'Tackle' },
  { id: 'goalkeeper_dive', label: 'GK Dive' },
];

const DIRECTIONS_8WAY: Array<{ id: MatchFacing; label: string; vec: { x: number; y: number } }> = [
  { id: 'down', label: '↓', vec: { x: 0, y: 1 } },
  { id: 'down-right', label: '↘', vec: { x: 1, y: 1 } },
  { id: 'right', label: '→', vec: { x: 1, y: 0 } },
  { id: 'up-right', label: '↗', vec: { x: 1, y: -1 } },
  { id: 'up', label: '↑', vec: { x: 0, y: -1 } },
  { id: 'up-left', label: '↖', vec: { x: -1, y: -1 } },
  { id: 'left', label: '←', vec: { x: -1, y: 0 } },
  { id: 'down-left', label: '↙', vec: { x: -1, y: 1 } },
];

function drawPreviewBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
): void {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
  ctx.beginPath();
  ctx.ellipse(x, y + radius + 1, radius + 1, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // White ball body + crisp pixel pentagon detail
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(Math.round(x - 1), Math.round(y - 1), 2, 2);
  ctx.restore();
}

export const InMatchSpritePreview: React.FC<InMatchSpritePreviewProps> = ({
  player,
  kitOverride,
  facing = 'down',
  animated = true,
  scale = 1.9,
  showPoseControls = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [action, setAction] = useState<string>('dribbling');
  const [directionIdx, setDirectionIdx] = useState<number>(() => {
    const idx = DIRECTIONS_8WAY.findIndex((d) => d.id === facing);
    return idx >= 0 ? idx : 0;
  });
  const frameRef = useRef(0);

  const v2 = useMemo(() => playerCardToAppearanceV2(player), [player]);
  const extras = useMemo(() => extractPlayerRenderExtras(player, kitOverride), [player, kitOverride]);

  const shirt = kitOverride?.primaryColor || player.kit?.color1 || '#0284c7';
  const trim = kitOverride?.secondaryColor || player.kit?.color2 || '#ffffff';
  const shorts = kitOverride?.shortsColor || player.kit?.color2 || '#0f172a';
  const socks = kitOverride?.socksColor || player.kit?.color1 || '#0284c7';
  const shirtNum = extras.shirtNumber;
  const isGk = extras.isGk;
  const dirEntry = DIRECTIONS_8WAY[directionIdx] || DIRECTIONS_8WAY[0];

  useEffect(() => {
    let rafId = 0;
    let lastTick = 0;
    frameRef.current = 0;

    const drawFrame = (frameIdx: number) => {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      if (!ctx) return;

      // Always reset canvas transform before clearing & drawing so transforms never accumulate
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, STAGE_W, STAGE_H);

      const dims = getRigCanvasDimensions(action, 2);
      const rigAnchorX = Math.floor(STAGE_W / 2) - (dims.offsetX + 36);
      const rigAnchorY = 6;
      const groundScreenY = rigAnchorY + dims.ground;

      // Pitch shadow anchored under player center
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.ellipse(STAGE_W / 2, groundScreenY, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw character centered cleanly inside fixed stage
      ctx.save();
      ctx.translate(rigAnchorX, rigAnchorY);
      renderRigToContext(
        ctx,
        v2,
        shirt,
        trim,
        shorts,
        socks,
        frameIdx,
        dirEntry.vec.x,
        dirEntry.vec.y,
        shirtNum,
        isGk,
        false,
        action,
        2,
        extras
      );
      ctx.restore();

      // Context-aware soccer ball for interactive match actions
      const kt = ((frameIdx % 6) + 6) % 6;
      const fx = dirEntry.vec.x || (dirEntry.vec.y === 0 ? 1 : 0.35);
      const fy = dirEntry.vec.y;
      if (action === 'dribbling' || action === 'step_overs') {
        const tapOffset = Math.sin((frameIdx / 6) * Math.PI * 2) * 5;
        drawPreviewBall(
          ctx,
          STAGE_W / 2 + fx * (16 + tapOffset),
          groundScreenY - 4 + fy * 5,
          4
        );
      } else if (action === 'standing_pass_low' || action === 'running_shot_mid') {
        const kickDist = kt < 2 ? 12 : 18 + (kt - 2) * 8;
        const kickLift = action === 'running_shot_mid' && kt >= 2 ? (kt - 1) * 4 : kt >= 2 ? 2 : 0;
        drawPreviewBall(
          ctx,
          STAGE_W / 2 + fx * kickDist,
          groundScreenY - 4 - kickLift + fy * 6,
          4
        );
      } else if (action === 'heading') {
        const arc = [14, 6, 0, 8, 16, 20][kt];
        drawPreviewBall(ctx, STAGE_W / 2 + fx * (10 + kt * 3), groundScreenY - 56 - arc, 4);
      } else if (action === 'bicycle_kick') {
        drawPreviewBall(ctx, STAGE_W / 2 - fx * 16, groundScreenY - 36 - (kt % 3) * 3, 4);
      } else if (action === 'goalkeeper_dive') {
        const sg = dirEntry.vec.x < 0 ? -1 : 1;
        drawPreviewBall(ctx, STAGE_W / 2 + sg * 30, groundScreenY - 22, 4);
      }
    };

    drawFrame(0);
    if (!animated) return;

    const tickMs = action === 'idle' ? 200 : 120;
    const loop = (ts: number) => {
      if (ts - lastTick > tickMs) {
        lastTick = ts;
        frameRef.current = (frameRef.current + 1) % 6;
        drawFrame(frameRef.current);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [v2, extras, shirt, trim, shorts, socks, shirtNum, isGk, action, dirEntry, animated]);

  const rotateStep = (delta: number) => {
    setDirectionIdx((prev) => (prev + delta + DIRECTIONS_8WAY.length) % DIRECTIONS_8WAY.length);
  };

  return (
    <div className={`flex flex-col items-center gap-2 select-none w-full max-w-[300px] ${className}`}>
      <div className="relative w-full rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/90 via-emerald-900/70 to-slate-950 p-3 shadow-inner flex flex-col items-center justify-center overflow-hidden">
        {/* Pixel turf stripe backdrop */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none rounded-2xl"
          style={{
            background:
              'repeating-linear-gradient(0deg, #065f46 0px, #065f46 18px, #047857 18px, #047857 36px)',
          }}
        />
        <div className="relative z-10 w-full flex items-center justify-between gap-2 mb-1">
          <span className="text-[9px] font-['Press_Start_2P'] text-emerald-300 uppercase tracking-wider">
            IN-GAME PREVIEW
          </span>
          <span className="text-[9px] font-mono text-emerald-200/80 uppercase">
            {ACTION_BUTTONS.find((a) => a.id === action)?.label || action} · {dirEntry.label}
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={STAGE_W}
          height={STAGE_H}
          style={{
            imageRendering: 'pixelated',
            width: `${Math.min(260, Math.round(STAGE_W * scale * 0.9))}px`,
            height: `${Math.min(224, Math.round(STAGE_H * scale * 0.9))}px`,
          }}
          className="relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
        />

        <span className="relative z-10 mt-1 text-[10px] font-mono text-slate-300 text-center">
          #{shirtNum} · {player.subPosition || player.position || 'ST'} · {v2.physique.heightCm}cm / {v2.physique.weightKg}kg
        </span>
      </div>

      {showPoseControls && (
        <div className="w-full space-y-2 bg-slate-900/75 border border-slate-800 rounded-xl p-2">
          {/* Interactive Match Actions */}
          <div className="flex flex-wrap items-center justify-center gap-1 text-[10px]">
            {ACTION_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setAction(btn.id)}
                className={`px-2 py-1 rounded-md font-bold uppercase transition cursor-pointer active:scale-95 ${
                  action === btn.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* 8-Way Match Rotation Compass */}
          <div className="flex flex-wrap items-center justify-center gap-1 pt-1.5 border-t border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={() => rotateStep(-1)}
              aria-label="Rotate left"
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            {DIRECTIONS_8WAY.map((dir, idx) => (
              <button
                key={dir.id}
                type="button"
                onClick={() => setDirectionIdx(idx)}
                className={`w-6 h-6 rounded-md font-mono flex items-center justify-center transition cursor-pointer ${
                  directionIdx === idx
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {dir.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => rotateStep(1)}
              aria-label="Rotate right"
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
