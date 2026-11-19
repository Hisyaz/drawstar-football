import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, BatteryCharging, Users, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface YouthClubAdaptationModalProps {
  isOpen: boolean;
  season: 1 | 2;
  clubName: string;
  onConfirm: () => void;
}

export const YouthClubAdaptationModal: React.FC<YouthClubAdaptationModalProps> = ({
  isOpen,
  season,
  clubName,
  onConfirm,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const isSeason1 = season === 1;

  return (
    <ConsoleModalShell
      id="youth-adaptation-modal"
      isOpen={isOpen}
      onClose={onConfirm}
      showCloseButton={false}
      closeDisabled={true}
      zIndexClass="z-[100]"
      maxWidthClass="sm:max-w-lg"
      accentColor={isSeason1 ? 'amber' : 'emerald'}
      title={isSeason1 ? t('YOUTH_ADAPTATION_EVENT_1_TITLE') : t('YOUTH_ADAPTATION_EVENT_2_TITLE')}
      subtitle={clubName}
      badge={isSeason1 ? t('YOUTH_ADAPTATION_EVENT_1_BADGE') : t('YOUTH_ADAPTATION_EVENT_2_BADGE')}
      icon={
        isSeason1 ? (
          <BatteryCharging className="w-5 h-5 text-amber-300" />
        ) : (
          <Sparkles className="w-5 h-5 text-emerald-300" />
        )
      }
      bodyClassName="p-4 sm:p-6 space-y-5"
      footer={
        <button
          id="youth-adaptation-confirm-btn"
          type="button"
          onClick={onConfirm}
          className={`w-full min-h-[48px] py-3 px-5 rounded-xl font-black text-xs sm:text-sm text-slate-950 transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 uppercase font-arcade ${
            isSeason1
              ? 'bg-amber-400 hover:bg-amber-300 border-2 border-amber-200'
              : 'bg-emerald-400 hover:bg-emerald-300 border-2 border-emerald-200'
          }`}
        >
          <span>{t('YOUTH_ADAPTATION_BTN_ACKNOWLEDGE')}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      }
    >
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 text-xs font-bold font-arcade">
        <ShieldCheck className="w-4 h-4 text-amber-400" />
        <span>{clubName}</span>
      </div>

      {/* STAT PENALTY ADJUSTMENTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          id="adaptation-stamina-change-card"
          className="p-3.5 rounded-xl bg-slate-950 border border-slate-700 flex flex-col justify-between space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 font-arcade">
            <span className="flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              {t('STAT_STAMINA')}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
              {isSeason1 ? '+10 STA' : t('STATUS_NORMAL')}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400 line-through font-arcade">
              {isSeason1 ? '-20' : '-10'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className={`text-base font-black font-arcade ${isSeason1 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isSeason1 ? '-10' : '0 (No Penalty)'}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans">
            {isSeason1 ? t('YOUTH_ADAPTATION_EVENT_1_STAMINA_LABEL') : t('YOUTH_ADAPTATION_EVENT_2_STAMINA_LABEL')}
          </p>
        </div>

        <div
          id="adaptation-chemistry-change-card"
          className="p-3.5 rounded-xl bg-slate-950 border border-slate-700 flex flex-col justify-between space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 font-arcade">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-400" />
              {t('CHEMISTRY')}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-950 text-sky-300 border border-sky-500/40 font-mono">
              {isSeason1 ? '+10% Cap' : t('STATUS_NORMAL')}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400 line-through font-arcade">
              {isSeason1 ? '80%' : '90%'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className={`text-base font-black font-arcade ${isSeason1 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isSeason1 ? '90% Max' : '100% (No Cap)'}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans">
            {isSeason1 ? t('YOUTH_ADAPTATION_EVENT_1_CHEMISTRY_LABEL') : t('YOUTH_ADAPTATION_EVENT_2_CHEMISTRY_LABEL')}
          </p>
        </div>
      </div>

      {/* Full-width readable narrative & note */}
      <ConsolePagedText
        paragraphs={[
          isSeason1
            ? t('YOUTH_ADAPTATION_EVENT_1_DESC', { club: clubName })
            : t('YOUTH_ADAPTATION_EVENT_2_DESC', { club: clubName }),
          t('BIGGER_YOUTH_CLUB_ADAPTATION_NOTE'),
        ]}
        maxCharsPerPage={380}
      />
    </ConsoleModalShell>
  );
};
