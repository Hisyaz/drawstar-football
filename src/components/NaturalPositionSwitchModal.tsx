import React from 'react';
import { PlayerCardData, PlayerPositionSlot } from '../types';
import { switchMainPosition } from '../utils/positionMasterySystem';
import { useLanguage } from '../context/LanguageContext';
import { Check, X, Compass, ArrowRightLeft } from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface NaturalPositionSwitchModalProps {
  player: PlayerCardData;
  eligibleSlot: PlayerPositionSlot;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSwitch: (updatedPlayer: PlayerCardData) => void;
}

export const NaturalPositionSwitchModal: React.FC<NaturalPositionSwitchModalProps> = ({
  player,
  eligibleSlot,
  isOpen,
  onClose,
  onConfirmSwitch,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const currentMainSub = player.subPosition || player.position || 'ST';
  const currentMainPlayStyle = (player as any).playStyle || 'Balanced';

  const handleConfirm = () => {
    const updated = switchMainPosition(player, eligibleSlot.id);
    onConfirmSwitch(updated);
  };

  return (
    <ConsoleModalShell
      id="natural-position-switch-modal"
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass="z-[110]"
      maxWidthClass="sm:max-w-lg"
      accentColor="emerald"
      title={t('FEEL_NATURAL_EVENT') || 'You feel a natural at a new position!'}
      badge={t('SEASON_MILESTONE') || 'Season Milestone'}
      icon={<Compass className="w-5 h-5 text-emerald-300" />}
      bodyClassName="p-4 sm:p-6 space-y-5"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>{t('NO_KEEP_MAIN') || 'No, Keep Current Main'}</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="min-h-[46px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t('YES_MAKE_MAIN') || 'Yes, Make it Main Position!'}</span>
          </button>
        </div>
      }
    >
      {/* Transformation preview card */}
      <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase font-arcade">
          <span>{t('CURRENT_MAIN') || 'Current Main'}</span>
          <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400">{t('NEW_MAIN_PROPOSED') || 'New Main'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400">Current Main (Tier V)</div>
            <div className="text-base font-black text-white">{currentMainSub}</div>
            <div className="text-xs text-slate-300">{currentMainPlayStyle}</div>
            <div className="text-xs text-amber-400 mt-1 font-bold">
              → Will become Secondary (Tier IV)
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/60 rounded-lg p-3">
            <div className="text-xs text-emerald-300 font-bold">New Main (Tier V)</div>
            <div className="text-base font-black text-white">{eligibleSlot.subPosition}</div>
            <div className="text-xs text-slate-200">{eligibleSlot.playStyle}</div>
            <div className="text-xs text-emerald-300 mt-1 font-bold">
              ★ 100% Native Proficiency
            </div>
          </div>
        </div>
      </div>

      {/* Full-width readable text */}
      <ConsolePagedText
        paragraphs={[
          `"You feel a natural at ${eligibleSlot.position}: ${eligibleSlot.subPosition} (${eligibleSlot.playStyle})! Having played over 80% of your fixtures this season with Tier IV mastery, do you want to make it your new official Main Position?"`,
          t('MAIN_POSITION_NOTE') ||
            'If you choose NO, your current main position remains unchanged, and this position remains a secondary Tier IV position.',
        ]}
        maxCharsPerPage={360}
      />
    </ConsoleModalShell>
  );
};
