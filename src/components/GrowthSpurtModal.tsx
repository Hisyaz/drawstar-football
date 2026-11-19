import React from 'react';
import { Sparkles, Dumbbell, ArrowUpRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface GrowthSpurtModalProps {
  isOpen: boolean;
  growthCm: number;
  oldHeight: number;
  newHeight: number;
  oldWeight: number;
  newWeight: number;
  onClose: () => void;
}

export const GrowthSpurtModal: React.FC<GrowthSpurtModalProps> = ({
  isOpen,
  growthCm,
  oldHeight,
  newHeight,
  oldWeight,
  newWeight,
  onClose,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <ConsoleModalShell
      id="growth-spurt-modal"
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      zIndexClass="z-[10000]"
      maxWidthClass="sm:max-w-lg"
      accentColor="amber"
      title={`${t('GROWTH_SPURT') || 'GROWTH SPURT'} ⚡`}
      badge={t('SPECIAL_DEVELOPMENT_MILESTONE') || 'DEVELOPMENT MILESTONE'}
      subtitle={t('GREW_PLUS_CM', { cm: growthCm }) || `You grew +${growthCm} CM this year!`}
      icon={<Sparkles className="w-5 h-5 text-amber-400" />}
      bodyClassName="p-4 sm:p-6 space-y-5"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-arcade font-black py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{t('EMBRACE_NEW_HEIGHT') || 'Embrace Your New Height'}</span>
        </button>
      }
    >
      {/* Highlight Banner */}
      <div className="bg-gradient-to-b from-amber-500/15 to-slate-950 border border-amber-500/50 rounded-2xl p-4 text-center space-y-1">
        <div className="text-xl sm:text-2xl font-black text-amber-300 flex items-center justify-center gap-2 font-arcade">
          <ArrowUpRight className="w-6 h-6 text-emerald-400 stroke-[3]" />
          <span>{t('GREW_PLUS_CM', { cm: growthCm }) || `You grew +${growthCm} CM this year!`}</span>
        </div>
      </div>

      {/* Stat Changes Breakdown */}
      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5 text-amber-400" /> {t('HEIGHT_PROGRESS') || 'Height Progress'}
          </div>
          <div className="text-sm sm:text-base font-black text-white flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 line-through">{oldHeight} CM</span>
            <span className="text-emerald-400">→ {newHeight} CM</span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5 text-sky-400" /> {t('WEIGHT_PROGRESS') || 'Weight Progress'}
          </div>
          <div className="text-sm sm:text-base font-black text-white flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 line-through">{oldWeight} KG</span>
            <span className="text-emerald-400">→ {newWeight} KG</span>
          </div>
        </div>
      </div>

      {/* Full-width readable text pages */}
      <ConsolePagedText
        resetKey={`${growthCm}-${newHeight}`}
        pages={[
          {
            paragraphs: [
              `“${t('GROWTH_SPURT_FLAVOR') || 'You wake up feeling different. Your clothes feel tighter, your legs feel longer, and something about you has changed.'}”`,
              t('PHYSICAL_DEVELOPMENT_ACCELERATED') || 'Physical development accelerated dramatically. Your height and weight have surged simultaneously!',
            ],
          },
          {
            heading: `⚠️ ${t('TEMP_BODY_ADJUSTMENT') || 'Temporary Body Adjustment (1 Month)'}`,
            paragraphs: [
              t('GROWTH_PENALTY_NOTICE') ||
                'Due to your sudden change in height and body proportions, you will experience -10 Dribbling and -10 Ball Control during the following in-game month as your coordination adapts. After 1 month, your attributes will fully restore!',
            ],
          },
        ]}
      />
    </ConsoleModalShell>
  );
};
