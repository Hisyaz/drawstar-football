import React from 'react';
import { PlayerCardData } from '../types';
import { Sparkles, Crown, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface IconicPlayerEventModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onAcceptBreakthrough: () => void;
  onDismiss: () => void;
}

export const IconicPlayerEventModal: React.FC<IconicPlayerEventModalProps> = ({
  isOpen,
  player,
  onAcceptBreakthrough,
  onDismiss,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const currentPoints = player.freeStatPoints ?? player.unassignedPoints ?? 0;
  const hasEnoughPoints = currentPoints >= 10;

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      showCloseButton={false}
      zIndexClass="z-[9999]"
      maxWidthClass="sm:max-w-2xl"
      accentColor="amber"
      title={hasEnoughPoints ? t('ICONIC_PLAYER') || 'ICONIC PLAYER' : t('NOT_READY_FOR_THIS') || "I WASN'T READY FOR THIS"}
      subtitle={t('SPECIAL_ENDGAME_MILESTONE') || 'SPECIAL ENDGAME MILESTONE'}
      badge={`99 ${t('POTENTIAL') || 'POTENTIAL'}`}
      icon={
        hasEnoughPoints ? (
          <Crown className="w-5 h-5 text-amber-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-orange-400" />
        )
      }
      footer={
        hasEnoughPoints ? (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onAcceptBreakthrough}
              className="flex-1 min-h-[48px] px-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md border border-slate-200 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
              <span>{t('SPEND_10_PTS_ACTIVATE') || 'SPEND 10 PTS (ACTIVATE)'}</span>
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-[48px] px-5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase rounded-xl border border-slate-700 cursor-pointer transition-all"
            >
              {t('PASS_KEEP_POINTS') || 'Pass (Keep Points)'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onDismiss}
            className="w-full min-h-[48px] px-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md border border-slate-200 cursor-pointer active:scale-95 transition-all"
          >
            <span className="truncate">{t('CONTINUE_CAREER_99') || 'CONTINUE CAREER (REMAIN AT 99 POTENTIAL)'}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        )
      }
    >
      <div className="p-4 sm:p-6 space-y-4">
        {hasEnoughPoints ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-200 font-medium italic text-base sm:text-lg">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span>&ldquo;{t('TAPPED_UNKNOWN_POTENTIAL') || "You've tapped into unknown potential."}&rdquo;</span>
            </div>

            <ConsolePagedText
              paragraphs={[
                t('ICONIC_BREAKTHROUGH_DESC') ||
                  'You have achieved the maximum natural development ceiling of 99 Potential. You now have a rare, one-time opportunity to transcend this limit with an iconic breakthrough.',
              ]}
              textSizeClass="text-sm sm:text-base text-slate-200 leading-relaxed"
            />

            <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-black text-amber-300 uppercase">
                <span>{t('BREAKTHROUGH_COST') || 'Breakthrough Cost'}</span>
                <span className="font-mono text-emerald-400">{t('AVAILABLE') || 'Available'}: {currentPoints} PTS</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs sm:text-sm">
                <span className="text-slate-300">{t('STAT_POINT_INVESTMENT') || 'Stat Point Investment'}</span>
                <span className="font-mono font-bold text-amber-400">-10 {t('STAT_POINTS') || 'Stat Points'}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs sm:text-sm">
                <span className="text-slate-300">{t('INTERNAL_POTENTIAL_GAIN') || 'Internal Potential Gain'}</span>
                <span className="font-mono font-bold text-emerald-400">+1 {t('POTENTIAL_BREAKTHROUGH') || 'Potential Breakthrough'}</span>
              </div>
              <p className="text-xs text-slate-400 italic">
                * {t('ICONIC_NOTE') || 'Note: Displayed Potential is strictly capped at 99, but the internal Iconic Breakthrough flag is permanently unlocked for your career.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-base sm:text-lg text-orange-300 font-medium italic">
              &ldquo;{t('NOT_READY_SUBTITLE') || "You weren't ready for this."}&rdquo;
            </p>

            <ConsolePagedText
              paragraphs={[
                t('NOT_ENOUGH_POINTS_DESC') ||
                  'You reached 99 Potential, but you do not currently hold the 10 unspent Stat Points needed to activate the Iconic Player breakthrough.',
              ]}
              textSizeClass="text-sm sm:text-base text-slate-200 leading-relaxed"
            />

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300">
                <span>{t('AVAILABLE_STAT_POINTS') || 'Available Stat Points:'}</span>
                <span className="font-mono font-black text-rose-400">{currentPoints} / 10 {t('REQUIRED') || 'Required'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('POTENTIAL_REMAINS_99') || 'Your potential remains firmly established at 99 Potential. No points or attributes are lost.'}
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-slate-400 text-center font-medium pt-1">
          * {t('MILESTONE_ONCE_PER_CAREER') || 'This milestone event occurs only once per career run.'}
        </div>
      </div>
    </ConsoleModalShell>
  );
};

