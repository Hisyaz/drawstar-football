import React from 'react';
import { SpecialClubEvaluation, SpecialClubId } from '../types/specialClubInterest';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface SpecialClubRetryModalProps {
  isOpen: boolean;
  evaluation: SpecialClubEvaluation | null;
  player: PlayerCardData;
  onAcceptTerms: (evaluation: SpecialClubEvaluation) => void;
  onExplicitRejectBigThree: (clubId: SpecialClubId) => void;
  onRejectPsg: () => void;
  onClose: () => void;
}

export const SpecialClubRetryModal: React.FC<SpecialClubRetryModalProps> = ({
  isOpen,
  evaluation,
  onAcceptTerms,
  onExplicitRejectBigThree,
  onRejectPsg,
  onClose,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !evaluation) return null;

  const { config, salary, weeklyWage, signingBonus } = evaluation;
  const isBigThree = config.category === 'big_three';

  return (
    <ConsoleModalShell
      id="special-club-retry-modal"
      isOpen={isOpen}
      showCloseButton={false}
      maxWidthClass="sm:max-w-2xl"
      accentColor="amber"
      title={t('THEY’RE STILL INTERESTED')}
      subtitle={`${config.name}${evaluation.decayYear ? ` • ${t('YEAR {year}', { year: evaluation.decayYear })}` : ''}`}
      badge={t('TRANSFER WINDOW FOLLOW-UP')}
      icon={<span className="text-2xl">{config.flag}</span>}
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (isBigThree) {
                onExplicitRejectBigThree(config.id);
              } else {
                onRejectPsg();
              }
              onClose();
            }}
            className="w-full sm:w-1/2 min-h-[48px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-700 transition cursor-pointer active:scale-95"
          >
            {t('Reject {club}', { club: config.shortName })}
          </button>

          <button
            type="button"
            onClick={() => {
              onAcceptTerms(evaluation);
              onClose();
            }}
            className="w-full sm:w-1/2 min-h-[48px] px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
          >
            <span className="truncate">{t('Accept Terms & Begin Transfer')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
          </button>
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-4">
        <ConsolePagedText
          paragraphs={[
            t(
              '“{club} is still interested in signing you. Their sporting directors have reached out to your representative and they’re ready to negotiate again.”',
              { club: config.name }
            ),
          ]}
          textSizeClass="text-sm sm:text-base text-slate-100 leading-relaxed"
        />

        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">{t('Salary Package')}</div>
            <div className="text-xl font-black text-amber-300 font-mono">
              €{(salary / 1000000).toFixed(1)}M/yr
            </div>
            <div className="text-xs text-slate-400 font-mono">€{Math.round(weeklyWage / 1000)}k/wk</div>
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">{t('Signing Bonus')}</div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              €{(signingBonus / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-emerald-400 font-medium">{t('Liquid cash')}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 flex items-center gap-2.5">
          <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {config.managerName} ({config.formation}) • {t('Guaranteed Starter')}
          </span>
        </div>

        {isBigThree && (
          <div className="text-xs sm:text-sm text-rose-200 flex items-start gap-2 p-3 rounded-xl bg-rose-950/30 border border-rose-500/20">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              {t('Warning: Explicitly rejecting {club} will permanently banish them from future interest.', {
                club: config.shortName,
              })}
            </span>
          </div>
        )}
      </div>
    </ConsoleModalShell>
  );
};

