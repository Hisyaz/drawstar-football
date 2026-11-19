import React, { useEffect, useState } from 'react';
import {
  Flame,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Dices,
  Award,
  CheckCircle2,
  Footprints,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';
import { ConsoleModalShell } from './common/ConsolePager';

const triggerConfetti = (opts?: any) => {
  if (shouldDisableParticles()) return;
  try {
    if (typeof confetti === 'function') {
      confetti(opts);
    } else if ((confetti as any)?.default && typeof (confetti as any).default === 'function') {
      (confetti as any).default(opts);
    }
  } catch (e) {
    console.warn('Confetti notification suppressed:', e);
  }
};

export interface StreetDevelopmentEventModalProps {
  isOpen: boolean;
  pointsRolled: number;
  message: 'YOU LEARNED NOTHING' | 'YOU LEARNED A FEW THINGS' | 'YOU LEARNED A LOT' | string;
  tier: 'low' | 'medium' | 'high';
  age: number;
  totalAvailablePoints: number;
  onContinue: () => void;
}

export const StreetDevelopmentEventModal: React.FC<StreetDevelopmentEventModalProps> = ({
  isOpen,
  pointsRolled,
  message,
  tier,
  age,
  totalAvailablePoints,
  onContinue,
}) => {
  const [activeTab, setActiveTab] = useState<'outcome' | 'odds'>('outcome');

  useEffect(() => {
    if (isOpen && (tier === 'high' || pointsRolled >= 31)) {
      triggerConfetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }
  }, [isOpen, tier, pointsRolled]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onContinue]);

  if (!isOpen) return null;

  const isInjuredZero = pointsRolled <= 0;
  const isLow = isInjuredZero || tier === 'low' || pointsRolled <= 14;
  const isMed = !isInjuredZero && (tier === 'medium' || (pointsRolled >= 15 && pointsRolled <= 30));
  const isHigh = !isInjuredZero && (tier === 'high' || pointsRolled >= 31);

  const tierConfig = isInjuredZero
    ? {
        badgeBg: 'bg-rose-950',
        badgeBorder: 'border-rose-400',
        badgeText: 'text-rose-300',
        pointsColor: 'text-rose-400',
        tierSub: 'You were injured off the concrete pitch before finishing the session and earned 0 development points.',
      }
    : isHigh
    ? {
        badgeBg: 'bg-emerald-950',
        badgeBorder: 'border-emerald-400',
        badgeText: 'text-emerald-300',
        pointsColor: 'text-emerald-300',
        tierSub: 'The player experienced exceptional development during their time playing on the streets.',
      }
    : isMed
    ? {
        badgeBg: 'bg-amber-950',
        badgeBorder: 'border-amber-400',
        badgeText: 'text-amber-300',
        pointsColor: 'text-amber-300',
        tierSub: 'The player made some progress but did not experience major development.',
      }
    : {
        badgeBg: 'bg-slate-900',
        badgeBorder: 'border-slate-700',
        badgeText: 'text-slate-300',
        pointsColor: 'text-slate-300',
        tierSub: 'The player had a poor year on the streets and gained very little development.',
      };

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onContinue}
      showCloseButton={false}
      zIndexClass="z-[9999]"
      title={isInjuredZero ? 'Street Session Cut Short' : 'Annual Street Development'}
      subtitle={`Age ${age} Street Progression · Total Bank: +${totalAvailablePoints} PTS`}
      badge={`STREET RESULT · AGE ${age}`}
      icon={<Flame className="w-5 h-5 text-orange-400 fill-orange-400" />}
      accentColor={isInjuredZero ? 'rose' : 'amber'}
      maxWidthClass="sm:max-w-2xl"
      tabs={[
        { id: 'outcome', label: 'Session Outcome', icon: <Dices className="w-3.5 h-3.5" /> },
        { id: 'odds', label: 'Tiers & Bank', icon: <Footprints className="w-3.5 h-3.5" /> },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'outcome' | 'odds')}
      headerRight={
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-lg text-xs">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <strong className="text-amber-300">+{totalAvailablePoints} PTS</strong>
        </div>
      }
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Age {age} Advancement <strong className={isInjuredZero ? 'text-rose-300' : 'text-amber-300'}>(+{pointsRolled} PTS)</strong>
            </span>
          </div>
          <button
            id="street-progression-continue-btn"
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto min-h-[48px] px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-amber-300 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <span>CONTINUE</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      }
    >
      {activeTab === 'outcome' ? (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 text-center space-y-3">
            <div className="flex justify-center">
              <div
                className={`px-3 py-1 rounded border ${tierConfig.badgeBg} ${tierConfig.badgeBorder} text-[11px] font-black uppercase tracking-wider ${tierConfig.badgeText} flex items-center gap-1.5`}
              >
                <Dices className="w-3.5 h-3.5" />
                <span>{isInjuredZero ? 'INJURY TERMINATION (0 PTS)' : age > 16 ? 'SENIOR STREET RESULT (1–8 PTS)' : 'STREET MATCH RESULT (1–90 PTS)'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xl sm:text-3xl font-black text-white uppercase">{message}</div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {tierConfig.tierSub}
              </p>
            </div>

            <div className="flex items-baseline justify-center gap-2 pt-1">
              <span className={`text-5xl sm:text-6xl font-black tracking-tight tabular-nums ${tierConfig.pointsColor}`}>
                {isInjuredZero ? '0' : `+${pointsRolled}`}
              </span>
              <span className="text-sm sm:text-base font-black text-slate-200 uppercase">Stat Points</span>
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isInjuredZero ? 'bg-rose-500' : isHigh ? 'bg-emerald-400' : isMed ? 'bg-amber-400' : 'bg-slate-500'
                  }`}
                  style={{ width: `${isInjuredZero ? 0 : Math.min(100, Math.max(4, (pointsRolled / (age > 16 ? 8 : 90)) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400 tabular-nums">
                <span>0 pts</span>
                <span className="text-amber-300 font-bold">{pointsRolled} / {age > 16 ? 8 : 90} pts</span>
                <span>{age > 16 ? 8 : 90} pts</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-950/50 border border-orange-500/40 text-orange-200 space-y-1">
            <div className="font-black text-xs uppercase flex items-center gap-1.5 text-orange-300">
              <Layers className="w-4 h-4 text-orange-400" />
              <span>NEXT: STREET CARD DRAW</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Draw 3 Street Cards next to unlock traits, perks, or early scout opportunities!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2 text-xs">
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                isLow ? 'bg-slate-950 border-slate-500 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <div className="font-black flex items-center gap-1.5">
                  <span>40% — MINIMAL (1–14 PTS)</span>
                  {isLow && <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Poor year with very little development.</div>
              </div>
              <span className="font-bold text-slate-300 shrink-0 ml-2">40%</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                isMed ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <div className="font-black flex items-center gap-1.5">
                  <span>30% — MODERATE (15–30 PTS)</span>
                  {isMed && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Moderate progress across street games.</div>
              </div>
              <span className="font-bold text-amber-400 shrink-0 ml-2">30%</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                isHigh ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <div className="font-black flex items-center gap-1.5">
                  <span>30% — EXCEPTIONAL (31–90 PTS)</span>
                  {isHigh && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Breakthrough on the asphalt!</div>
              </div>
              <span className="font-bold text-emerald-400 shrink-0 ml-2">30%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Gained This Year</div>
              <div className="font-black text-amber-400 text-base mt-0.5">+{pointsRolled} PTS</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Total Unassigned Bank</div>
              <div className="font-black text-white text-base mt-0.5">+{totalAvailablePoints} PTS</div>
            </div>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
