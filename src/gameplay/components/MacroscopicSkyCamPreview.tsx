import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2 } from 'lucide-react';
import {
  MACROSCOPIC_PREVIEW_HEIGHT,
  MACROSCOPIC_PREVIEW_WIDTH,
  renderMacroscopicSkyViewPreview,
} from '../game/skyCamRenderer';
import { RoofCutawayMode, StadiumDefinition, TimeOfDay } from '../types/stadium';
import { WeatherCondition } from '../types';
import { TeamDefinition } from '../types/team';

export interface MacroscopicSkyCamPreviewProps {
  stadium: StadiumDefinition;
  timeOfDay?: TimeOfDay;
  weather?: WeatherCondition;
  homeTeam?: TeamDefinition;
  awayTeam?: TeamDefinition;
  roofCutaway?: RoofCutawayMode;
  badgeText?: string;
  badgeClassName?: string;
  bottomRightBadge?: string;
  bottomRightClassName?: string;
  borderClassName?: string;
  compactButtonClassName?: string;
  compactTitle?: string;
  forceCompactIcon?: boolean;
}

const GenericStadiumIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 64 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <ellipse cx="32" cy="24" rx="28" ry="18" fill="#0f172a" stroke="currentColor" strokeWidth="2.5" />
    <ellipse cx="32" cy="24" rx="22" ry="13" fill="#1e293b" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
    <rect x="16" y="15" width="32" height="18" rx="3" fill="#15803d" stroke="#86efac" strokeOpacity="0.7" strokeWidth="1.2" />
    <line x1="32" y1="15" x2="32" y2="33" stroke="#dcfce7" strokeOpacity="0.65" strokeWidth="1" />
    <circle cx="32" cy="24" r="3.8" stroke="#dcfce7" strokeOpacity="0.65" strokeWidth="1" />
    <rect x="16" y="20" width="3.5" height="8" stroke="#dcfce7" strokeOpacity="0.55" strokeWidth="0.9" />
    <rect x="44.5" y="20" width="3.5" height="8" stroke="#dcfce7" strokeOpacity="0.55" strokeWidth="0.9" />
  </svg>
);

export const MacroscopicSkyCamPreview: React.FC<MacroscopicSkyCamPreviewProps> = ({
  stadium,
  timeOfDay,
  weather,
  homeTeam,
  awayTeam,
  roofCutaway,
  badgeText,
  badgeClassName = 'bg-slate-950/85 border border-emerald-400/60 text-emerald-300',
  bottomRightBadge,
  bottomRightClassName = 'bg-slate-950/80 text-amber-300',
  borderClassName = 'rounded-xl border border-emerald-500/30',
  compactButtonClassName = 'rounded-xl border border-emerald-500/40 bg-slate-950/90 hover:border-emerald-400 hover:bg-slate-900 text-emerald-300',
  compactTitle = 'Sky-Cam Preview',
  forceCompactIcon = false,
}) => {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const inlineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [canFitLocked, setCanFitLocked] = useState<boolean>(!forceCompactIcon);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useLayoutEffect(() => {
    if (forceCompactIcon) {
      setCanFitLocked(false);
      return;
    }

    const evaluateFit = () => {
      const slot = slotRef.current;
      const slotWidth = slot ? slot.getBoundingClientRect().width : window.innerWidth;
      const vpWidth = typeof window !== 'undefined' ? window.innerWidth : MACROSCOPIC_PREVIEW_WIDTH;
      const vpHeight = typeof window !== 'undefined' ? window.innerHeight : MACROSCOPIC_PREVIEW_HEIGHT + 160;
      const fits =
        slotWidth >= MACROSCOPIC_PREVIEW_WIDTH + 4 &&
        vpWidth >= MACROSCOPIC_PREVIEW_WIDTH + 24 &&
        vpHeight >= MACROSCOPIC_PREVIEW_HEIGHT + 120;
      setCanFitLocked(fits);
    };

    evaluateFit();

    const ro =
      typeof ResizeObserver !== 'undefined' && slotRef.current
        ? new ResizeObserver(() => evaluateFit())
        : null;
    if (ro && slotRef.current) {
      ro.observe(slotRef.current);
    }
    window.addEventListener('resize', evaluateFit);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', evaluateFit);
    };
  }, [forceCompactIcon]);

  useEffect(() => {
    if (!canFitLocked || !inlineCanvasRef.current || !stadium) return;
    renderMacroscopicSkyViewPreview(inlineCanvasRef.current, stadium, {
      width: MACROSCOPIC_PREVIEW_WIDTH,
      height: MACROSCOPIC_PREVIEW_HEIGHT,
      timeOfDay,
      weather,
      homeTeam,
      awayTeam,
      roofCutaway,
    });
  }, [canFitLocked, stadium, timeOfDay, weather, homeTeam, awayTeam, roofCutaway]);

  useEffect(() => {
    if (!isModalOpen || !modalCanvasRef.current || !stadium) return;
    renderMacroscopicSkyViewPreview(modalCanvasRef.current, stadium, {
      width: MACROSCOPIC_PREVIEW_WIDTH,
      height: MACROSCOPIC_PREVIEW_HEIGHT,
      timeOfDay,
      weather,
      homeTeam,
      awayTeam,
      roofCutaway,
    });
  }, [isModalOpen, stadium, timeOfDay, weather, homeTeam, awayTeam, roofCutaway]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  return (
    <>
      <div ref={slotRef} className="w-full min-w-0 flex items-center justify-center">
        {canFitLocked ? (
          <div
            className={`relative shrink-0 overflow-hidden bg-[#050a18] shadow-inner ${borderClassName}`}
            style={{
              boxSizing: 'content-box',
              width: `${MACROSCOPIC_PREVIEW_WIDTH}px`,
              height: `${MACROSCOPIC_PREVIEW_HEIGHT}px`,
            }}
          >
            <canvas
              ref={inlineCanvasRef}
              width={MACROSCOPIC_PREVIEW_WIDTH}
              height={MACROSCOPIC_PREVIEW_HEIGHT}
              style={{
                width: `${MACROSCOPIC_PREVIEW_WIDTH}px`,
                height: `${MACROSCOPIC_PREVIEW_HEIGHT}px`,
                display: 'block',
              }}
            />
            {badgeText && (
              <div
                className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider pointer-events-none ${badgeClassName}`}
              >
                {badgeText}
              </div>
            )}
            {bottomRightBadge && (
              <div
                className={`absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase pointer-events-none ${bottomRightClassName}`}
              >
                {bottomRightBadge}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title={`Open full-resolution ${compactTitle} (${MACROSCOPIC_PREVIEW_WIDTH}×${MACROSCOPIC_PREVIEW_HEIGHT})`}
            aria-label={`Open full-resolution ${compactTitle}`}
            className={`min-h-[48px] px-3 py-2 flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-inner ${compactButtonClassName}`}
          >
            <GenericStadiumIcon className="w-9 h-7 shrink-0" />
            <div className="text-left leading-tight">
              <div className="text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <span>{compactTitle}</span>
                <Maximize2 className="w-3 h-3 opacity-80 shrink-0" />
              </div>
              <div className="text-[8.5px] font-mono opacity-75">
                Tap to view {MACROSCOPIC_PREVIEW_WIDTH}×{MACROSCOPIC_PREVIEW_HEIGHT}
              </div>
            </div>
          </button>
        )}
      </div>

      {isModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl shadow-2xl max-w-full max-h-[92vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase truncate">
                    {stadium.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Macroscopic Sky-Cam · {MACROSCOPIC_PREVIEW_WIDTH}×{MACROSCOPIC_PREVIEW_HEIGHT}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close stadium preview"
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-[#050a18] overflow-auto flex items-center justify-center">
                <div
                  className="relative shrink-0 overflow-hidden rounded-xl border border-emerald-500/40 bg-[#050a18]"
                  style={{
                    boxSizing: 'content-box',
                    width: `${MACROSCOPIC_PREVIEW_WIDTH}px`,
                    height: `${MACROSCOPIC_PREVIEW_HEIGHT}px`,
                  }}
                >
                  <canvas
                    ref={modalCanvasRef}
                    width={MACROSCOPIC_PREVIEW_WIDTH}
                    height={MACROSCOPIC_PREVIEW_HEIGHT}
                    style={{
                      width: `${MACROSCOPIC_PREVIEW_WIDTH}px`,
                      height: `${MACROSCOPIC_PREVIEW_HEIGHT}px`,
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
