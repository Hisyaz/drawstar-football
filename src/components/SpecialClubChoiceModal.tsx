import React, { useState } from 'react';
import {
  SpecialClubEvaluation,
  SpecialClubChoiceEventData,
  SpecialClubId,
} from '../types/specialClubInterest';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Trophy,
  Crown,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Star,
  Banknote,
  Briefcase,
  Globe,
} from 'lucide-react';
import { ChoiceSystem } from './ChoiceSystem';
import { ConsoleModalShell } from './common/ConsolePager';

interface SpecialClubChoiceModalProps {
  isOpen: boolean;
  choiceData: SpecialClubChoiceEventData;
  player: PlayerCardData;
  onSelectClub: (selectedEvaluation: SpecialClubEvaluation) => void;
  onExplicitRejectBigThree: (clubId: SpecialClubId) => void;
  onRejectPsg: () => void;
  onRejectSaudiTemporary: () => void;
  onRejectSaudiPermanent: () => void;
  onClose: () => void;
}

export const SpecialClubChoiceModal: React.FC<SpecialClubChoiceModalProps> = ({
  isOpen,
  choiceData,
  player,
  onSelectClub,
  onExplicitRejectBigThree,
  onRejectPsg,
  onRejectSaudiTemporary,
  onRejectSaudiPermanent,
  onClose,
}) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showRejectionConfirm, setShowRejectionConfirm] = useState<boolean>(false);

  if (!isOpen || choiceData.interestedClubs.length === 0) return null;

  const currentSelection =
    choiceData.interestedClubs[currentIndex] || choiceData.interestedClubs[0];

  const hasSaudi = choiceData.interestedClubs.some((c) => c.config.category === 'saudi');
  const hasBigThree = choiceData.interestedClubs.some((c) => c.config.category === 'big_three');
  const hasPsg = choiceData.interestedClubs.some((c) => c.config.category === 'psg');

  return (
    <>
      <ChoiceSystem
        isOpen={isOpen}
        totalChoices={choiceData.interestedClubs.length}
        currentIndex={currentIndex}
        onNavigate={setCurrentIndex}
        onConfirm={() => onSelectClub(currentSelection)}
        title={currentSelection.config.name}
        subtitle={`${currentSelection.config.leagueName} • ${currentSelection.config.category.toUpperCase()}`}
        selectorLabel={`CHOICE ${currentIndex + 1} OF ${choiceData.interestedClubs.length}`}
        themeColor="#f59e0b"
        accentGradient="from-amber-400 via-yellow-300 to-amber-500"
        categoryBadge={
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            WORLD POWER SIGNING SUMMIT
          </span>
        }
        topActions={
          <button
            type="button"
            onClick={() => setShowRejectionConfirm(true)}
            className="min-h-[44px] text-xs font-bold text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 transition cursor-pointer active:scale-95"
          >
            {t('Decline All Options')}
          </button>
        }
        secondaryAction={{
          label: t('Decline All'),
          onClick: () => setShowRejectionConfirm(true),
          variant: 'ghost',
        }}
        confirmLabel={`ENTER SIGNING SUMMIT WITH ${currentSelection.config.shortName.toUpperCase()}`}
        confirmIcon={<ArrowRight className="w-5 h-5 stroke-[3]" />}
      >
        {/* Central Focused Card */}
        <div className="w-full max-w-3xl flex flex-col justify-between p-3.5 sm:p-6 bg-slate-900/90 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden my-auto backdrop-blur-md">
          <div className="space-y-3.5 sm:space-y-4 relative z-10">
            {/* Club Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl sm:text-5xl shrink-0">{currentSelection.config.flag}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {currentSelection.config.leagueName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Prestige ★★★★★
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5 truncate">
                    {currentSelection.config.name}
                  </h2>
                  <p className="text-xs text-amber-300 font-medium truncate">
                    {currentSelection.config.leaderTitle} • {currentSelection.config.keyLeaders}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Offered Salary
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                  €{(currentSelection.weeklyWage || 300000).toLocaleString()} / wk
                </span>
              </div>
            </div>

            {/* Narrative Context & Board Vision */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
              {currentSelection.config.legacyPitch || currentSelection.config.presidentialQuote}
            </p>

            {/* Tactical Vision & Role Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                  {t('Coach & Tactical Plan')}
                </div>
                <div className="font-bold text-white text-xs sm:text-sm truncate">
                  {currentSelection.config.managerName}
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentSelection.config.formation} • {currentSelection.config.tacticalStyle}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  {t('Projected Role')}
                </div>
                <div className="font-bold text-amber-300 text-xs sm:text-sm">
                  {t('Undisputed Key Starter')}
                </div>
                <div className="text-[11px] text-slate-400">
                  {t('Immediate focal point of all tactical systems')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-purple-400" />
                  {t('Sporting Ambition')}
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">
                  {currentSelection.config.category === 'saudi'
                    ? t('Global Ambassador')
                    : t('European Winners League & Ballon d’Or')}
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentSelection.config.category === 'saudi'
                    ? t('Unlimited financial expansion & influence')
                    : t('Highest tier continental silverware contention')}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Initiates official 5-step boardroom signing summit</span>
            </div>
            <span className="text-amber-300 font-mono font-bold hidden sm:inline">
              Choice {currentIndex + 1} of {choiceData.interestedClubs.length}
            </span>
          </div>
        </div>
      </ChoiceSystem>

      {/* Explicit Rejection Confirmation Dialog */}
      {showRejectionConfirm && (
        <ConsoleModalShell
          isOpen={showRejectionConfirm}
          onClose={() => setShowRejectionConfirm(false)}
          zIndexClass="z-[10000]"
          maxWidthClass="sm:max-w-lg"
          accentColor="rose"
          title={t('CONFIRM TRANSFER REJECTION')}
          subtitle={t('Please review the explicit rejection consequences:')}
          icon={<ShieldAlert className="w-5 h-5 text-rose-400" />}
          footer={
            <div className="flex flex-col gap-2">
              {hasSaudi && (
                <button
                  type="button"
                  onClick={() => {
                    onRejectSaudiPermanent();
                    setShowRejectionConfirm(false);
                    onClose();
                  }}
                  className="w-full min-h-[48px] px-4 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  🇸🇦 {t('I DON’T WANT TO CONSIDER SAUDI EVER AGAIN (PERMANENT BAN)')}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  choiceData.interestedClubs.forEach((c) => {
                    if (c.config.category === 'big_three') {
                      onExplicitRejectBigThree(c.clubId);
                    } else if (c.config.category === 'psg') {
                      onRejectPsg();
                    } else if (c.config.category === 'saudi') {
                      onRejectSaudiTemporary();
                    }
                  });
                  setShowRejectionConfirm(false);
                  onClose();
                }}
                className="w-full min-h-[48px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {t('Confirm Rejection & Stay At Current Club')}
              </button>

              <button
                type="button"
                onClick={() => setShowRejectionConfirm(false)}
                className="w-full min-h-[44px] px-4 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                {t('Cancel (Return to Summit)')}
              </button>
            </div>
          }
        >
          <div className="p-4 sm:p-6">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs sm:text-sm text-slate-200">
              {hasBigThree && (
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>
                    <strong className="text-rose-300">{t('Blancos CF / Catalunya FC / Bavaria Rot FC')}:</strong>{' '}
                    {t('Explicitly rejecting a Big Three monarch permanently removes them from your future interest pool forever.')}
                  </span>
                </div>
              )}
              {hasPsg && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>
                    <strong className="text-blue-300">{t('Bleus de Paris')}:</strong>{' '}
                    {t('Bleus de Paris interest will decay over future windows but may return if you remain eligible.')}
                  </span>
                </div>
              )}
              {hasSaudi && (
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>
                    <strong className="text-emerald-300">{t('Saudi League')}:</strong>{' '}
                    {t('Can return in future windows unless you explicitly choose to never consider it again.')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </ConsoleModalShell>
      )}
    </>
  );
};
