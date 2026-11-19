import React, { useEffect, useRef } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { MatchEngine } from '../game/engine';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from '../game/constants';

export type MinimapMode = 'solid' | 'transparent' | 'off';
export type RadarZoom = 'full' | 'zoom1' | 'zoom2';

interface RadarMinimapProps {
  engine: MatchEngine;
  mode: MinimapMode;
  sonar: boolean;
  zoom?: RadarZoom;
  focusTarget?: 'pitch' | 'ball' | 'player';
  onCycleMode?: () => void;
  onToggleSonar?: () => void;
  onCycleZoom?: () => void;
}

export const RadarMinimap: React.FC<RadarMinimapProps> = ({
  engine,
  mode,
  sonar,
  zoom = 'full',
  focusTarget = 'pitch',
  onCycleMode,
  onToggleSonar,
  onCycleZoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'off') return;
    let rafId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const padX = 5;
      const padY = 5;
      const innerW = w - padX * 2;
      const innerH = h - padY * 2;

      const controlled = engine.getControlledPlayer();
      let focusX = engine.ball.x;
      let focusY = engine.ball.y;

      if (focusTarget === 'player' && controlled) {
        focusX = controlled.x;
        focusY = controlled.y;
      } else if (focusTarget === 'pitch' && controlled) {
        focusX = engine.ball.x * 0.55 + controlled.x * 0.45;
        focusY = engine.ball.y * 0.55 + controlled.y * 0.45;
      }

      let viewW = PITCH_CONFIG.FIELD_WIDTH;
      let viewH = PITCH_CONFIG.FIELD_HEIGHT;
      if (zoom === 'zoom1') {
        viewW = PITCH_CONFIG.FIELD_WIDTH / 1.7;
        viewH = PITCH_CONFIG.FIELD_HEIGHT / 1.7;
      } else if (zoom === 'zoom2') {
        viewW = PITCH_CONFIG.FIELD_WIDTH / 2.8;
        viewH = PITCH_CONFIG.FIELD_HEIGHT / 2.8;
      }

      let viewLeft = focusX - viewW / 2;
      let viewTop = focusY - viewH / 2;

      if (zoom === 'full') {
        viewLeft = PITCH_CONFIG.PITCH_LEFT;
        viewTop = PITCH_CONFIG.PITCH_TOP;
      } else {
        viewLeft = Math.max(PITCH_CONFIG.PITCH_LEFT - 40, Math.min(PITCH_CONFIG.PITCH_RIGHT + 40 - viewW, viewLeft));
        viewTop = Math.max(PITCH_CONFIG.PITCH_TOP - 40, Math.min(PITCH_CONFIG.PITCH_BOTTOM + 40 - viewH, viewTop));
      }

      const toX = (worldX: number) => padX + ((worldX - viewLeft) / viewW) * innerW;
      const toY = (worldY: number) => padY + ((worldY - viewTop) / viewH) * innerH;

      ctx.clearRect(0, 0, w, h);

      if (sonar) {
        if (mode === 'solid') {
          ctx.fillStyle = '#02120a';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
          for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
        } else {
          ctx.fillStyle = 'rgba(2, 18, 10, 0.15)';
          ctx.fillRect(0, 0, w, h);
        }
        const fx = toX(focusX);
        const fy = toY(focusY);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(fx, fy, innerW * 0.28, 0, Math.PI * 2);
        ctx.arc(fx, fy, innerW * 0.58, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
        ctx.lineWidth = 1;
      } else {
        if (mode === 'solid') {
          ctx.fillStyle = '#0f381a';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
          const bandH = innerH / 8;
          for (let i = 0; i < 8; i += 2) ctx.fillRect(padX, padY + i * bandH, innerW, bandH);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(padX, padY, innerW, innerH);
      ctx.clip();

      const pLeft = toX(PITCH_CONFIG.PITCH_LEFT);
      const pRight = toX(PITCH_CONFIG.PITCH_RIGHT);
      const pTop = toY(PITCH_CONFIG.PITCH_TOP);
      const pBot = toY(PITCH_CONFIG.PITCH_BOTTOM);
      ctx.strokeRect(pLeft, pTop, pRight - pLeft, pBot - pTop);

      const midY = toY(PITCH_CONFIG.CENTER_Y);
      ctx.beginPath();
      ctx.moveTo(pLeft, midY);
      ctx.lineTo(pRight, midY);
      ctx.stroke();

      const midX = toX(PITCH_CONFIG.CENTER_X);
      const cRad = (PITCH_CONFIG.CENTER_CIRCLE_RADIUS / viewW) * innerW;
      ctx.beginPath();
      ctx.arc(midX, midY, cRad, 0, Math.PI * 2);
      ctx.stroke();

      const boxLeft = toX(PITCH_CONFIG.CENTER_X - PITCH_CONFIG.PENALTY_BOX_WIDTH / 2);
      const boxRight = toX(PITCH_CONFIG.CENTER_X + PITCH_CONFIG.PENALTY_BOX_WIDTH / 2);
      const topBoxBot = toY(PITCH_CONFIG.PITCH_TOP + PITCH_CONFIG.PENALTY_BOX_HEIGHT);
      ctx.strokeRect(boxLeft, pTop, boxRight - boxLeft, topBoxBot - pTop);

      const botBoxTop = toY(PITCH_CONFIG.PITCH_BOTTOM - PITCH_CONFIG.PENALTY_BOX_HEIGHT);
      ctx.strokeRect(boxLeft, botBoxTop, boxRight - boxLeft, pBot - botBoxTop);

      for (const p of engine.players) {
        if (p.isRedCarded) continue;
        const px = toX(p.x);
        const py = toY(p.y);
        if (px < padX - 8 || px > padX + innerW + 8 || py < padY - 8 || py > padY + innerH + 8) continue;

        const isUser = p.isUserControlled;
        const isGk = p.role === 'GK';
        const isHome = p.team === 'home';
        const sizeScale = zoom === 'zoom2' ? 1.4 : zoom === 'zoom1' ? 1.2 : 1;

        if (sonar) {
          ctx.save();
          if (isHome) {
            const c = isGk ? '#facc15' : '#38bdf8';
            ctx.shadowColor = c;
            ctx.shadowBlur = (isUser ? 10 : 6) * sizeScale;
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(px, py, (isUser ? 3.8 : 2.8) * sizeScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, 1.2 * sizeScale, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const c = isGk ? '#10b981' : '#f43f5e';
            ctx.shadowColor = c;
            ctx.shadowBlur = 6 * sizeScale;
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(px, py, 2.8 * sizeScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, 1.1 * sizeScale, 0, Math.PI * 2);
            ctx.fill();
          }
          if (isUser) {
            const ringR = (4.5 + Math.sin(Date.now() / 120) * 1.8) * sizeScale;
            ctx.strokeStyle = '#facc15';
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 8;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(px, py, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        } else {
          ctx.save();
          const r = (isUser ? 3.5 : 2.5) * sizeScale;
          ctx.fillStyle = isHome
            ? isGk
              ? '#ffbb00'
              : engine.homeKit?.primaryColor || HOME_KIT.primaryColor
            : isGk
            ? '#00aa55'
            : engine.awayKit?.primaryColor || AWAY_KIT.primaryColor;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          if (isUser) {
            const ringR = (4.2 + Math.sin(Date.now() / 130) * 1.5) * sizeScale;
            ctx.strokeStyle = '#ffea00';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(px, py, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      const bx = toX(engine.ball.x);
      const by = toY(engine.ball.y);
      const bz = Math.min(40, engine.ball.z || 0);
      const isAir = engine.ball.isAirborne || bz > 3;
      const bScale = zoom === 'zoom2' ? 1.4 : zoom === 'zoom1' ? 1.2 : 1;

      ctx.save();
      if (sonar) {
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 12 * bScale;
        if (isAir) {
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bx, by, (3.5 + bz * 0.12) * bScale, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx, by, 2.6 * bScale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(bx, by, (isAir ? 3.2 : 2.4) * bScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (isAir) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bx, by, 4.2 * bScale, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
      ctx.restore();

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [engine, mode, sonar, zoom, focusTarget]);

  if (mode === 'off') return null;

  const zoomLabel = zoom === 'zoom2' ? 'Z:2' : zoom === 'zoom1' ? 'Z:1' : 'FULL';

  return (
    <div
      className={`absolute bottom-[165px] sm:bottom-[175px] md:bottom-[180px] right-2 sm:right-3.5 z-20 pointer-events-auto select-none rounded-lg overflow-hidden transition-all duration-200 border-2 ${
        sonar
          ? mode === 'solid'
            ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.45)] bg-slate-950/90'
            : 'border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.35)] bg-emerald-950/20'
          : mode === 'solid'
          ? 'border-amber-500/80 shadow-[0_4px_16px_rgba(0,0,0,0.85)] bg-[#07131e]'
          : 'border-amber-500/60 shadow-[0_4px_12px_rgba(0,0,0,0.6)] bg-transparent'
      }`}
      style={{ width: '104px' }}
      title="Tactical Radar (Bottom Right above controller)"
    >
      <div
        className={`w-full px-1.5 py-0.5 flex items-center justify-between border-b ${
          sonar
            ? `${mode === 'solid' ? 'bg-emerald-950/90' : 'bg-emerald-950/40'} border-emerald-500/50 text-emerald-300`
            : `${
                mode === 'solid'
                  ? 'bg-gradient-to-r from-blue-950 via-slate-950 to-blue-950'
                  : 'bg-blue-950/40'
              } border-amber-500/50 text-amber-400`
        }`}
      >
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${sonar ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-amber-400'}`} />
          <span className="font-['Press_Start_2P'] text-[6px] font-bold tracking-tighter">
            {sonar ? 'SONAR' : 'RADAR'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onCycleZoom && (
            <button
              type="button"
              onClick={onCycleZoom}
              title={`Radar Zoom: ${zoom.toUpperCase()} (Click to cycle Full / Zoom 1 / Zoom 2)`}
              aria-label="Cycle Radar Zoom"
              className="px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-amber-300 hover:text-white font-['Press_Start_2P'] text-[5px] transition cursor-pointer"
            >
              {zoomLabel}
            </button>
          )}
          {onToggleSonar && (
            <button
              type="button"
              onClick={onToggleSonar}
              title={sonar ? 'Switch to Classic 90s Radar' : 'Activate Neon Lights'}
              aria-label="Toggle Sonar"
              className={`p-0.5 rounded cursor-pointer transition ${
                sonar ? 'text-emerald-300 hover:text-white' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
            </button>
          )}
          {onCycleMode && (
            <button
              type="button"
              onClick={onCycleMode}
              title={`Mode: ${mode.toUpperCase()} (Click to cycle)`}
              aria-label="Cycle Radar Mode"
              className="p-0.5 rounded cursor-pointer text-slate-300 hover:text-amber-300 transition"
            >
              <Eye className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full h-[166px] flex items-center justify-center">
        <canvas ref={canvasRef} width={104} height={166} className="w-full h-full block [image-rendering:pixelated]" />
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '100% 3px',
          }}
        />
        {zoom !== 'full' && (
          <div className="absolute top-1 left-1.5 px-1 py-0.2 rounded bg-black/70 border border-amber-500/50 text-[5px] font-['Press_Start_2P'] text-amber-300 pointer-events-none">
            {focusTarget === 'pitch' ? 'PITCH' : focusTarget === 'player' ? 'P1' : 'BALL'}
          </div>
        )}
      </div>
    </div>
  );
};
