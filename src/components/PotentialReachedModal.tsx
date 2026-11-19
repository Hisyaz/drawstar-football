import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Check,
  Dice5,
  RefreshCw,
} from 'lucide-react';
import { PlayerCardData } from '../types';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface PotentialReachedModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onApplyOutcome: (updatedPlayer: PlayerCardData) => void;
  onClose: () => void;
}

export type EarlyPotentialFateOption = 'unfulfilled_genius' | 'ahead_of_schedule' | 'overconfidence_trap';

export const PotentialReachedModal: React.FC<PotentialReachedModalProps> = ({
  isOpen,
  player,
  onApplyOutcome,
  onClose,
}) => {
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rolledOption, setRolledOption] = useState<EarlyPotentialFateOption | null>(null);
  const [activeTab, setActiveTab] = useState<'milestone' | 'rules'>('milestone');

  const age = player.age || 20;
  const isEarly = age < 27;
  const isPeak = age >= 27 && age <= 29;
  const isLate = age >= 30;

  const currentPot = player.potentialOvr || Math.max((player.ovr || 50) + 5, 80);
  const currentOvr = player.ovr || 50;

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsRolling(false);
      setRolledOption(null);
      setActiveTab('milestone');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRollFate = () => {
    if (isRolling || rolledOption) return;
    setIsRolling(true);

    setTimeout(() => {
      let option: EarlyPotentialFateOption;
      const roll = Math.random();

      if (player.hasUsedEarlyPotentialBoost) {
        option = roll < 0.5 ? 'ahead_of_schedule' : 'overconfidence_trap';
      } else {
        if (roll < 0.3333) {
          option = 'unfulfilled_genius';
        } else if (roll < 0.6666) {
          option = 'ahead_of_schedule';
        } else {
          option = 'overconfidence_trap';
        }
      }

      setRolledOption(option);
      setIsRolling(false);
    }, 1200);
  };

  const handleConfirmAndClose = () => {
    const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
    let newPot = currentPot;

    if (isEarly && rolledOption) {
      if (rolledOption === 'unfulfilled_genius') {
        newPot = Math.min(99, currentPot + 2);
        copy.hasUsedEarlyPotentialBoost = true;
      } else if (rolledOption === 'ahead_of_schedule') {
        newPot = currentPot;
      } else if (rolledOption === 'overconfidence_trap') {
        newPot = Math.max(50, currentPot - 1);
        copy.overconfidenceDropPending = true;
      }
    }

    copy.potentialOvr = newPot;
    copy.lastReachedPotentialOvr = newPot;

    onApplyOutcome(copy);
    onClose();
  };

  const modalTitle = isEarly
    ? 'Early Peak Milestone'
    : isPeak
    ? 'Peak Prime Milestone'
    : 'Late Bloom Milestone';

  const modalBadge = isEarly
    ? 'EARLY POTENTIAL REACHED'
    : isPeak
    ? 'PEAK POTENTIAL REACHED'
    : 'LATE PEAK ACHIEVED';

  const HeaderIcon = isEarly ? Sparkles : isPeak ? Award : Zap;
  const accentColor = isPeak ? 'emerald' : isLate ? 'purple' : 'amber';

  const ruleBullets = [
    'Stat Point Distribution Locked: From now on, you can no longer distribute stat points (unassigned points) while your OVR is at or above your POT.',
    'Cards & Event Stat Boosts Ineffective: Any cards, perks, training levels, or events that grant stat increases will NOT add anything while your OVR matches your POT.',
    'Re-Enabling Upgrades: If your OVR drops below your POT (due to age decline or injury), stat point distribution and event stat boosts will reactivate until you reach your POT again.',
    'Hard Ceiling: Your OVR can never exceed your POT (except for the temporary Overconfidence Trap).',
  ];

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      title={modalTitle}
      subtitle={`Age ${age} • ${currentOvr} OVR / ${currentPot} POT Ceiling`}
      badge={modalBadge}
      icon={<HeaderIcon className="w-5 h-5 text-amber-300" />}
      accentColor={accentColor}
      maxWidthClass="sm:max-w-xl"
      zIndexClass="z-[10000]"
      showCloseButton={false}
      tabs={[
        { id: 'milestone', label: isEarly ? 'Fate Milestone' : 'Milestone' },
        { id: 'rules', label: 'Ceiling Rules (4)' },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'milestone' | 'rules')}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <button
          type="button"
          onClick={handleConfirmAndClose}
          disabled={isEarly && !rolledOption}
          className={`w-full min-h-[48px] font-black py-3 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
            isEarly && !rolledOption
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 cursor-pointer active:scale-95'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>
            {isEarly && !rolledOption ? 'Roll Fate To Continue' : 'Acknowledge & Continue Career'}
          </span>
        </button>
      }
    >
      {activeTab === 'milestone' ? (
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            At age <strong className="text-amber-300">{age}</strong>, your overall rating (
            <strong>{currentOvr} OVR</strong>) has matched your Potential ceiling (
            <strong>{currentPot} POT</strong>)!
          </p>

          {isEarly && (
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Dice5 className="w-4 h-4 text-amber-400" /> Early Potential Fate Roll
                </div>
                <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 font-bold">
                  {player.hasUsedEarlyPotentialBoost ? '50% / 50% Odds' : '33.3% Odds Each'}
                </span>
              </div>

              {!rolledOption && !isRolling && (
                <div className="space-y-3 py-1">
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Reaching your potential before age 27 triggers a career fate roll. Roll to discover how your early peak shapes your ceiling!
                  </p>
                  {player.hasUsedEarlyPotentialBoost && (
                    <p className="text-xs sm:text-sm text-amber-300 bg-amber-950/60 border border-amber-500/30 rounded-xl p-3 font-semibold">
                      You already unlocked the +2 Potential boost earlier in your career. That bonus cannot be rolled again.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleRollFate}
                    className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    <Dice5 className="w-5 h-5" /> Roll Potential Fate
                  </button>
                </div>
              )}

              {isRolling && (
                <div className="text-center py-6 space-y-2">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest animate-pulse">
                    Determining Career Fate...
                  </p>
                </div>
              )}

              {rolledOption && !isRolling && (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  {rolledOption === 'unfulfilled_genius' && (
                    <div className="bg-amber-950/50 border border-amber-400/80 rounded-xl p-4 space-y-2">
                      <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2 uppercase tracking-wide">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        Option 1: Unfulfilled Genius (+2 Potential)
                      </div>
                      <p className="text-sm text-amber-100 leading-relaxed">
                        &ldquo;Your potential was not enough! Hard work and relentless drive open up new horizons.&rdquo;
                      </p>
                      <div className="bg-slate-950/80 border border-amber-500/40 rounded-lg p-2.5 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">New Potential Ceiling:</span>
                        <span className="text-emerald-400 text-sm font-black flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> {currentPot} → {currentPot + 2} POT
                        </span>
                      </div>
                    </div>
                  )}

                  {rolledOption === 'ahead_of_schedule' && (
                    <div className="bg-slate-950 border border-sky-400/80 rounded-xl p-4 space-y-2">
                      <div className="text-xs sm:text-sm font-black text-sky-300 flex items-center gap-2 uppercase tracking-wide">
                        <Zap className="w-4 h-4 text-sky-400 shrink-0" />
                        Option 2: Ahead of Schedule (Unchanged)
                      </div>
                      <p className="text-sm text-sky-100 leading-relaxed">
                        &ldquo;Faster than expected! You mastered your skillset early, but your potential ceiling remains firmly at {currentPot}.&rdquo;
                      </p>
                      <div className="bg-slate-900 border border-sky-500/40 rounded-lg p-2.5 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">Potential Ceiling:</span>
                        <span className="text-sky-300 text-sm font-black">{currentPot} POT (Unchanged)</span>
                      </div>
                    </div>
                  )}

                  {rolledOption === 'overconfidence_trap' && (
                    <div className="bg-rose-950/50 border border-rose-500/80 rounded-xl p-4 space-y-2">
                      <div className="text-xs sm:text-sm font-black text-rose-300 flex items-center gap-2 uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        Option 3: Overconfidence Trap (-1 Potential)
                      </div>
                      <p className="text-sm text-rose-100 leading-relaxed">
                        &ldquo;This made you overconfident! Complacency sets in, causing your potential ceiling to drop by -1. For this season, your OVR ({currentOvr}) will be higher than your POT ({currentPot - 1}), but it will drop next season.&rdquo;
                      </p>
                      <div className="bg-slate-950/80 border border-rose-500/40 rounded-lg p-2.5 flex items-center justify-between text-xs font-bold flex-wrap gap-2">
                        <span className="text-slate-300">New Potential Ceiling:</span>
                        <span className="text-rose-400 text-sm font-black flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" /> {currentPot} → {currentPot - 1} POT
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isPeak && (
            <ConsolePagedText
              paragraphs={[
                'Congratulations! You have reached your prime athletic and technical potential. You are currently operating at the absolute peak of your capabilities.',
              ]}
              resetKey={`peak-${currentOvr}`}
            />
          )}

          {isLate && (
            <ConsolePagedText
              paragraphs={[
                'Veteran excellence! Through experience, tactical intelligence, and physical maintenance, you have achieved a late career peak and matched your full potential.',
              ]}
              resetKey={`late-${currentOvr}`}
            />
          )}

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-arcade uppercase tracking-wider flex items-center justify-between cursor-pointer"
          >
            <span>View Potential Ceiling Rules</span>
            <span>PAGE 2 →</span>
          </button>
        </div>
      ) : (
        <ConsolePagedText
          heading="Important Potential Ceiling Rules"
          bullets={ruleBullets}
          maxBulletsPerPage={2}
          resetKey={`rules-${age}`}
        />
      )}
    </ConsoleModalShell>
  );
};

