import React from 'react';
import { PlayerCardData } from '../types';
import { handleCareerEndingChoice } from '../utils/staminaInjurySystem';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, AlertTriangle, Activity, Heart } from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface CareerEndingInjuryModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  showToast: (msg: string) => void;
}

export const CareerEndingInjuryModal: React.FC<CareerEndingInjuryModalProps> = ({
  isOpen,
  player,
  onUpdatePlayer,
  showToast,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !player.isCareerEndingRisk) return null;

  const currentPotential = player.potentialOvr || (player.ovr ? player.ovr + 10 : 80);
  const reducedPotential = Math.max(30, currentPotential - 10);
  const injuryWeeks = player.injuryWeeksRemaining || 52;

  const handleRetire = () => {
    const res = handleCareerEndingChoice(player, 'retire');
    onUpdatePlayer(res.updatedPlayer);
    showToast(t(res.message));
  };

  const handleFocusOnRecovery = () => {
    const res = handleCareerEndingChoice(player, 'recover');
    onUpdatePlayer(res.updatedPlayer);
    showToast(t(res.message));
  };

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      showCloseButton={false}
      maxWidthClass="sm:max-w-2xl"
      accentColor="rose"
      title={t('Potentially Career-Ending Injury')}
      subtitle={`${t(player.injuryName || 'Catastrophic Joint Reconstruction')} (${t('{weeks} Weeks Out', { weeks: injuryWeeks })})`}
      badge={t('CRITICAL MEDICAL DIAGNOSIS')}
      icon={<ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />}
    >
      <div className="p-4 sm:p-6 space-y-5">
        <ConsolePagedText
          paragraphs={[
            `${t('Specialists have concluded their examination of {name}.', { name: player.name })} ${t('The severity of this injury ({injury}) threatens your ability to continue competing at the highest level.', { injury: t(player.injuryName || 'Severe Trauma') })}`,
            t('Continuing your career after this type of damage carries severe physical consequences and permanent loss of potential athletic peak.'),
          ]}
          maxCharsPerPage={360}
          textSizeClass="text-sm sm:text-base text-slate-200 leading-relaxed"
        />

        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{t('Choose carefully — this decision permanently shapes your remaining career.')}</span>
        </div>

        {/* Decision Choices */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            {t('Choose Your Career Path:')}
          </h3>

          <button
            type="button"
            onClick={handleFocusOnRecovery}
            className="w-full min-h-[56px] p-4 rounded-xl bg-gradient-to-r from-blue-900/80 to-indigo-900/80 hover:from-blue-800 hover:to-indigo-800 border border-blue-500/50 text-left transition-all cursor-pointer shadow-lg space-y-1.5 active:scale-95"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-sm sm:text-base font-black text-blue-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{t('FOCUS ON RECOVERY')}</span>
              </span>
              <span className="self-start sm:self-auto text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/40">
                {t('Potential Penalty: -10 PTS')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-snug">
              {t('Fight through surgery and grueling rehab. You will remain in the game, but your Potential OVR permanently drops from {current} to {reduced}.', { current: currentPotential, reduced: reducedPotential })}
            </p>
          </button>

          <button
            type="button"
            onClick={handleRetire}
            className="w-full min-h-[56px] p-4 rounded-xl bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 border border-rose-800/80 text-left transition-all cursor-pointer shadow-lg space-y-1.5 active:scale-95"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-sm sm:text-base font-black text-rose-200 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{t('ANNOUNCE RETIREMENT')}</span>
              </span>
              <span className="self-start sm:self-auto text-xs font-bold text-rose-300 bg-rose-900/60 px-2.5 py-0.5 rounded border border-rose-500/40">
                {t('End Career')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-rose-100/90 leading-snug">
              {t('Hang up your boots immediately to preserve your long-term health and conclude your football career.')}
            </p>
          </button>
        </div>
      </div>
    </ConsoleModalShell>
  );
};

