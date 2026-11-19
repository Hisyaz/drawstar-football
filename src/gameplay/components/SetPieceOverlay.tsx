import React, { useEffect, useState } from 'react';
import { Crosshair, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { MatchEngine } from '../game/engine';
import { KeyState } from '../types';

interface SetPieceOverlayProps {
  engine: MatchEngine;
  keysRef: React.MutableRefObject<KeyState>;
}

export const SetPieceOverlay: React.FC<SetPieceOverlayProps> = ({ engine, keysRef }) => {
  const setPiece = engine.setPiece;
  const isHome = Boolean(setPiece && setPiece.team === 'home');
  const isPenalty = setPiece?.type === 'penalty';
  const isFreeKick = setPiece?.type === 'free_kick';
  const isCorner = setPiece?.type === 'corner_kick';

  const [, setTick] = useState(0);

  useEffect(() => {
    let rafId: number;
    const loop = () => {
      setTick((prev) => prev + 1);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (!setPiece || !isHome) return null;

  const elevation = setPiece.elevation || 0;
  const curve = setPiece.curve || 0;
  const isTopLeftAngle = setPiece.aimAngle < -1.62 && setPiece.aimAngle > -1.78;
  const isTopRightAngle = setPiece.aimAngle < -1.36 && setPiece.aimAngle > -1.52;
  const isHighElevation = elevation > 0.22;
  const isLowElevation = elevation < -0.2;

  let sweetSpotLabel: string | null = null;
  if (isHighElevation && isTopLeftAngle) {
    sweetSpotLabel = 'TOP-LEFT 90 POSTAGE STAMP';
  } else if (isHighElevation && isTopRightAngle) {
    sweetSpotLabel = 'TOP-RIGHT 90 POSTAGE STAMP';
  } else if (isLowElevation && isTopLeftAngle) {
    sweetSpotLabel = 'BOTTOM-LEFT SIDE NETTING';
  } else if (isLowElevation && isTopRightAngle) {
    sweetSpotLabel = 'BOTTOM-RIGHT SIDE NETTING';
  } else if (Math.abs(curve) > 0.45 && Math.abs(setPiece.aimAngle - -Math.PI / 2) < 0.25) {
    sweetSpotLabel = 'BENDING MAGNUS CURL';
  }

  const handleActionPress = (action: 'shoot' | 'cross' | 'pass' | 'long_pass', isModE = false) => {
    const keyName =
      action === 'shoot' ? 'KeyA' : action === 'cross' ? 'KeyD' : action === 'pass' ? 'KeyS' : 'KeyW';
    keysRef.current[keyName] = true;
    if (isModE) {
      keysRef.current.KeyE = true;
      if (setPiece) setPiece.isPanenka = true;
    }
    engine.triggerActionPress(action, keysRef.current, isModE ? 'E' : 'normal');
  };

  const handleActionRelease = (action: 'shoot' | 'cross' | 'pass' | 'long_pass') => {
    const keyName =
      action === 'shoot' ? 'KeyA' : action === 'cross' ? 'KeyD' : action === 'pass' ? 'KeyS' : 'KeyW';
    keysRef.current[keyName] = false;
    keysRef.current.KeyE = false;
    engine.triggerActionRelease(action, keysRef.current);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-4 safe-top safe-bottom font-mono select-none">
      <div className="flex flex-col items-center gap-2 pt-1 max-w-full">
        <div className="bg-slate-950/85 backdrop-blur-md border border-amber-500/80 px-3 sm:px-4 py-2 rounded shadow-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-full text-center">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
            <Crosshair className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            <span>
              {isPenalty
                ? 'PENALTY KICK DUEL'
                : isCorner
                ? 'CORNER KICK'
                : isFreeKick
                ? 'DIRECT FREE KICK'
                : 'SET PIECE AIMING'}
            </span>
          </div>
          <div className="hidden sm:block h-4 w-[1px] bg-slate-700" />
          {sweetSpotLabel ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/70 rounded text-[10px] text-emerald-300 font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>🎯 {sweetSpotLabel}</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-300">
              AIM: [←/→] • HOLD KEY OR BUTTON TO CHARGE POWER
            </div>
          )}

          {isPenalty && setPiece.gkWeightShift && (
            <div className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-sky-950/70 border border-sky-400/40 rounded text-sky-300">
              <ShieldAlert className="w-3 h-3 text-sky-400" />
              <span>GK STANCE: {setPiece.gkWeightShift.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 pb-4 sm:pb-8 pointer-events-auto max-w-full">
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-xl p-2.5 shadow-2xl flex flex-col gap-2 w-full max-w-sm">
          <div className="flex items-center justify-between text-[10px] px-1">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {isPenalty ? 'PENALTY KICK' : isCorner ? 'CORNER KICK' : 'DIRECT FREE KICK'}
            </span>
            <span className="text-[9px] text-slate-400">AIM: [←/→]</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {isPenalty ? (
              <>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('shoot', false)}
                  onMouseUp={() => handleActionRelease('shoot')}
                  onTouchStart={() => handleActionPress('shoot', false)}
                  onTouchEnd={() => handleActionRelease('shoot')}
                  className="sm:col-span-2 min-h-[44px] py-2 px-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg border border-amber-400 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  HOLD [A] SHOOT
                </button>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('shoot', true)}
                  onMouseUp={() => handleActionRelease('shoot')}
                  onTouchStart={() => handleActionPress('shoot', true)}
                  onTouchEnd={() => handleActionRelease('shoot')}
                  className="sm:col-span-2 min-h-[44px] py-2 px-3 bg-fuchsia-600 hover:bg-fuchsia-500 active:bg-fuchsia-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg border border-fuchsia-400 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-200" />
                  [E+A] PANENKA
                </button>
              </>
            ) : isCorner ? (
              <>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('cross', false)}
                  onMouseUp={() => handleActionRelease('cross')}
                  onTouchStart={() => handleActionPress('cross', false)}
                  onTouchEnd={() => handleActionRelease('cross')}
                  className="min-h-[44px] py-2 px-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg font-bold text-[10px] text-center border border-blue-400 shadow cursor-pointer"
                >
                  [D] CROSS
                </button>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('cross', true)}
                  onMouseUp={() => handleActionRelease('cross')}
                  onTouchStart={() => handleActionPress('cross', true)}
                  onTouchEnd={() => handleActionRelease('cross')}
                  className="min-h-[44px] py-2 px-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-lg font-bold text-[10px] text-center border border-teal-400 shadow cursor-pointer"
                >
                  [E+D] CHIP
                </button>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('pass', false)}
                  onMouseUp={() => handleActionRelease('pass')}
                  onTouchStart={() => handleActionPress('pass', false)}
                  onTouchEnd={() => handleActionRelease('pass')}
                  className="min-h-[44px] py-2 px-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg font-bold text-[10px] text-center border border-emerald-400 shadow cursor-pointer"
                >
                  [S] SHORT
                </button>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('shoot', false)}
                  onMouseUp={() => handleActionRelease('shoot')}
                  onTouchStart={() => handleActionPress('shoot', false)}
                  onTouchEnd={() => handleActionRelease('shoot')}
                  className="min-h-[44px] py-2 px-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg font-bold text-[10px] text-center border border-amber-400 shadow cursor-pointer"
                >
                  [A] OLIMPICO
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('shoot', false)}
                  onMouseUp={() => handleActionRelease('shoot')}
                  onTouchStart={() => handleActionPress('shoot', false)}
                  onTouchEnd={() => handleActionRelease('shoot')}
                  className="min-h-[44px] py-2 px-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg font-bold text-[10px] text-center border border-amber-400 shadow cursor-pointer"
                >
                  [A] SHOOT
                </button>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('cross', false)}
                  onMouseUp={() => handleActionRelease('cross')}
                  onTouchStart={() => handleActionPress('cross', false)}
                  onTouchEnd={() => handleActionRelease('cross')}
                  className="min-h-[44px] py-2 px-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg font-bold text-[10px] text-center border border-blue-400 shadow cursor-pointer"
                >
                  [D] CROSS
                </button>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('pass', false)}
                  onMouseUp={() => handleActionRelease('pass')}
                  onTouchStart={() => handleActionPress('pass', false)}
                  onTouchEnd={() => handleActionRelease('pass')}
                  className="min-h-[44px] py-2 px-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg font-bold text-[10px] text-center border border-emerald-400 shadow cursor-pointer"
                >
                  [S] PASS
                </button>
                <button
                  type="button"
                  onMouseDown={() => handleActionPress('long_pass', false)}
                  onMouseUp={() => handleActionRelease('long_pass')}
                  onTouchStart={() => handleActionPress('long_pass', false)}
                  onTouchEnd={() => handleActionRelease('long_pass')}
                  className="min-h-[44px] py-2 px-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg font-bold text-[10px] text-center border border-purple-400 shadow cursor-pointer"
                >
                  [W] LOB
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
