import React, { useState, useEffect } from 'react';
import { PlayerConfig } from '../types';
import {
  Bandage,
  Clock,
  ShieldAlert,
  Calendar,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface InjuryNotificationModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  injuryName?: string;
  weeksRemaining?: number;
  totalWeeks?: number;
  onAcknowledge: () => void;
}

export const InjuryNotificationModal: React.FC<InjuryNotificationModalProps> = ({
  isOpen,
  player,
  injuryName,
  weeksRemaining,
  totalWeeks,
  onAcknowledge,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'rehab'>('diagnosis');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('diagnosis');
    }
  }, [isOpen, injuryName]);

  if (!isOpen) return null;

  const injDetails = player.injuryDetails;
  const name = injuryName || injDetails?.name || player.injuryName || 'Grade II Hamstring Strain';
  const weeks = weeksRemaining ?? player.injuryWeeksRemaining ?? 4;
  const totWeeks = totalWeeks ?? player.injuryTotalWeeks ?? weeks;
  const grade =
    injDetails?.grade ||
    (weeks >= 24 ? 'Grave (6+ Months)' : weeks >= 9 ? 'Grade III' : weeks >= 4 ? 'Grade II' : 'Grade I');
  const type = injDetails?.type || 'Hamstring';
  const monthsText = injDetails?.monthsText || `${weeks} Weeks (~${(weeks / 4.3).toFixed(1)} Months)`;
  const description =
    injDetails?.description ||
    'Structural injury to muscle or ligament tissue requiring rest and physical rehabilitation.';

  const isInjuryProneActive = Boolean(
    player.justEarnedInjuryPronePerk || player.activePerkIds?.includes('injury_prone')
  );

  let gradeBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (weeks >= 24 || grade.includes('Grave') || grade.includes('Catastrophic')) {
    gradeBadgeColor = 'bg-rose-500/30 text-rose-300 border-rose-500/60 animate-pulse';
  } else if (weeks >= 9 || grade.includes('Grade III')) {
    gradeBadgeColor = 'bg-purple-500/25 text-purple-300 border-purple-500/50';
  } else if (weeks <= 3 || grade.includes('Grade I')) {
    gradeBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }

  const safetyNotice =
    t('INJURY_SAFETY_NOTICE') ||
    'You are marked NOT SELECTED / INJURED for upcoming matches during recovery. Matches and simulation continue automatically as you heal.';
  const injuryProneDesc =
    t('INJURY_PRONE_UNLOCKED_DESC') ||
    'Suffered severe or recurring physical trauma! You have acquired the permanent Injury Prone perk, increasing your future injury risk by +50% forever.';

  const tabs = [
    { id: 'diagnosis', label: t('Diagnosis') || 'Diagnosis' },
    {
      id: 'rehab',
      label: isInjuryProneActive
        ? (t('Recovery & Perk') || 'Recovery & Perk')
        : (t('Recovery Protocol') || 'Recovery Info'),
    },
  ];

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      title={t('MEDICAL_DIAGNOSIS') || 'Medical Diagnosis'}
      subtitle={t(name) || name}
      badge={t('MEDICAL_ALERT_RECOVERY_REQUIRED') || 'MEDICAL ALERT'}
      icon={<Bandage className="w-5 h-5 text-rose-400" />}
      accentColor="rose"
      maxWidthClass="sm:max-w-lg"
      zIndexClass="z-[100]"
      showCloseButton={false}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'diagnosis' | 'rehab')}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <button
          id="focus-on-recovery-btn"
          type="button"
          onClick={onAcknowledge}
          className="w-full min-h-[48px] py-3 px-5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 hover:from-rose-300 hover:to-amber-200 shadow-xl shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <span>{t('FOCUS_ON_RECOVERY_RESUME') || 'FOCUS ON RECOVERY & RESUME SIMULATION →'}</span>
        </button>
      }
    >
      {activeTab === 'diagnosis' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-extrabold text-rose-400 uppercase tracking-widest block">
                {t('OFFICIAL_DIAGNOSIS') || 'Official Diagnosis'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">{t(name) || name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-slate-800 text-slate-200 border border-slate-700">
                {t(type) || type}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${gradeBadgeColor}`}>
                {t(grade) || grade}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('EXPECTED_OUT') || 'Expected Out'}
              </span>
              <span className="text-base sm:text-lg font-black text-amber-300 flex items-center justify-center gap-1.5 mt-1">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                {weeks} {weeks === 1 ? t('WEEK') || 'Week' : t('WEEKS') || 'Weeks'}
              </span>
              {totWeeks > weeks && (
                <span className="text-[11px] text-slate-400 block mt-0.5">({totWeeks} total)</span>
              )}
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('EST_DURATION') || 'Est. Duration'}
              </span>
              <span className="text-sm sm:text-base font-black text-rose-400 flex items-center justify-center gap-1.5 mt-1">
                <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{monthsText}</span>
              </span>
            </div>
          </div>

          <ConsolePagedText
            heading={t('MEDICAL_REPORT') || 'Medical Report'}
            paragraphs={[t(description) || description]}
            maxCharsPerPage={360}
            resetKey={`${name}-${weeks}`}
          />

          {isInjuryProneActive && (
            <button
              type="button"
              onClick={() => setActiveTab('rehab')}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/70 text-yellow-300 text-xs font-black uppercase tracking-wider flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                {t('PERK_UNLOCKED_TITLE') || 'PERK UNLOCKED: INJURY PRONE'}
              </span>
              <span>VIEW →</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-300 border-b border-slate-800 pb-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="font-arcade font-black text-sm uppercase tracking-wider">
              {t('Match Availability & Recovery') || 'Match Availability & Recovery'}
            </h3>
          </div>

          <ConsolePagedText
            paragraphs={[safetyNotice]}
            bullets={
              isInjuryProneActive
                ? [`${t('PERK_UNLOCKED_TITLE') || 'PERK UNLOCKED • INJURY PRONE'}: ${injuryProneDesc}`]
                : []
            }
            maxCharsPerPage={360}
            resetKey={`rehab-${isInjuryProneActive}`}
          />
        </div>
      )}
    </ConsoleModalShell>
  );
};

