import React, { useState, useEffect } from 'react';
import { PlayerConfig } from '../types';
import { HeartPulse, ShieldCheck, Shield, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface FitToPlayModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  onAcknowledge: () => void;
}

export const FitToPlayModal: React.FC<FitToPlayModalProps> = ({
  isOpen,
  player,
  onAcknowledge,
}) => {
  const { t } = useLanguage();
  const [hasDismissed, setHasDismissed] = useState(false);
  const recoverySessionKey = `${player.id || 'p'}_${(player as any).lastInjuryTimestamp || 'noinj'}_${player.currentSeason || 1}_${player.careerStage || 'youth'}`;
  const [lastDismissedKey, setLastDismissedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'clearance' | 'guidelines'>('clearance');

  // Reset local dismissal state ONLY when a truly new recovery session key occurs
  useEffect(() => {
    if (isOpen && lastDismissedKey !== recoverySessionKey) {
      setHasDismissed(false);
      setActiveTab('clearance');
    }
  }, [isOpen, recoverySessionKey, lastDismissedKey]);

  if (!isOpen || hasDismissed || lastDismissedKey === recoverySessionKey) return null;

  const handleDismiss = () => {
    setHasDismissed(true);
    setLastDismissedKey(recoverySessionKey);
    onAcknowledge();
  };

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      title={t("You're Fit to Play Again!")}
      subtitle={t('MEDICAL CLEARANCE • STATUS: HEALTHY')}
      badge={t('HEALTHY')}
      icon={<HeartPulse className="w-5 h-5 text-emerald-400" />}
      accentColor="emerald"
      maxWidthClass="sm:max-w-lg"
      zIndexClass="z-[100]"
      showCloseButton={false}
      tabs={[
        { id: 'clearance', label: t('Medical Clearance') || 'Clearance' },
        { id: 'guidelines', label: t('Match Return Rules') || 'Shield & Fitness' },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'clearance' | 'guidelines')}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full min-h-[48px] py-3 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <span>{t('RETURN TO SQUAD & START MATCHES')} →</span>
        </button>
      }
    >
      {activeTab === 'clearance' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest block">
                {t('Official Status')}
              </span>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                {t('Fully Recovered')}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
              {t('HEALTHY')}
            </span>
          </div>

          <ConsolePagedText
            paragraphs={[
              t(
                'Rehabilitation is 100% complete! Medical staff have declared {name} fully fit and cleared for match participation.',
                { name: player.name }
              ),
            ]}
            bullets={[
              `${t('Post-Injury Rehab Shield Active')}: ${t('-80% INJURY RISK (1 MONTH)')}`,
              `${t('Fitness Bar Reset to 50%')}: ${t('50% FITNESS')}`,
            ]}
            resetKey={recoverySessionKey}
          />
        </div>
      ) : (
        <ConsolePagedText
          pages={[
            {
              heading: t('Post-Injury Rehab Shield Active'),
              paragraphs: [
                t(
                  'To guarantee a safe return to competition, your probability of suffering an injury is reduced by 80% for the following month.'
                ),
              ],
              node: (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 pt-1">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('-80% INJURY RISK (1 MONTH)')}</span>
                </div>
              ),
            },
            {
              heading: t('Fitness Bar Reset to 50%'),
              paragraphs: [
                t(
                  'Upon recovery, your fitness bar starts at 50%. While you are cleared to play, returning directly to 90-minute high-intensity matches carries fatigue. Build up your condition with rest or recovery items!'
                ),
              ],
              node: (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 pt-1">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t('50% FITNESS')}</span>
                </div>
              ),
            },
          ]}
          resetKey={`guide-${recoverySessionKey}`}
        />
      )}
    </ConsoleModalShell>
  );
};

