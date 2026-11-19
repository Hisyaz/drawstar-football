import React, { useEffect, useState } from 'react';
import { SpecialClubEvaluation } from '../types/specialClubInterest';
import { PlayerConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Crown, Sparkles, DollarSign, Clock, X } from 'lucide-react';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface SpecialSignInEventModalProps {
  isOpen: boolean;
  evaluation: SpecialClubEvaluation | null;
  player: PlayerConfig;
  onReceiveContractProposal?: (evaluation: SpecialClubEvaluation) => void;
  onReceiveProposal?: (evaluation: SpecialClubEvaluation) => void;
  onWaitAndKeepProposal?: (evaluation: SpecialClubEvaluation) => void;
  onWait?: (evaluation: SpecialClubEvaluation) => void;
  onDeclineSpecialInterest?: (evaluation: SpecialClubEvaluation) => void;
  onDecline?: (evaluation: SpecialClubEvaluation) => void;
}

export const SpecialSignInEventModal: React.FC<SpecialSignInEventModalProps> = ({
  isOpen,
  evaluation,
  onReceiveContractProposal,
  onReceiveProposal,
  onWaitAndKeepProposal,
  onWait,
  onDeclineSpecialInterest,
  onDecline,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'terms' | 'pitch'>('terms');

  const handleReceive = (ev: SpecialClubEvaluation) => {
    if (onReceiveContractProposal) onReceiveContractProposal(ev);
    else if (onReceiveProposal) onReceiveProposal(ev);
  };

  const handleWait = (ev: SpecialClubEvaluation) => {
    if (onWaitAndKeepProposal) onWaitAndKeepProposal(ev);
    else if (onWait) onWait(ev);
  };

  const handleDecline = (ev: SpecialClubEvaluation) => {
    if (onDeclineSpecialInterest) onDeclineSpecialInterest(ev);
    else if (onDecline) onDecline(ev);
  };

  useEffect(() => {
    if (isOpen) {
      if (typeof audioManager.playLegendaryFlashSound === 'function') {
        audioManager.playLegendaryFlashSound();
      }
      haptics.success();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !evaluation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === 'Enter') {
        e.preventDefault();
        handleReceive(evaluation);
      } else if (e.key === '2' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleWait(evaluation);
      } else if (e.key === '3' || e.key === 'Escape') {
        e.preventDefault();
        handleDecline(evaluation);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, evaluation]);

  if (!isOpen || !evaluation) return null;

  const config = evaluation.config;
  const yearly = evaluation.salary || 30000000;
  const weekly = evaluation.weeklyWage || Math.round(yearly / 52);
  const signingBonus = evaluation.signingBonus || Math.round(yearly * 0.2);

  return (
    <ConsoleModalShell
      id="special-sign-in-event-modal"
      isOpen={isOpen}
      showCloseButton={false}
      closeDisabled={true}
      title={config.name}
      subtitle={`${config.financialTier || 'Global Elite'} • ${config.leagueName} (${config.country})`}
      badge="🌟 SPECIAL SIGN-IN EVENT"
      icon={<Crown className="w-6 h-6 text-amber-300" />}
      accentColor="sky"
      maxWidthClass="sm:max-w-4xl"
      zIndexClass="z-[9999]"
      tabs={[
        { id: 'terms', label: 'Project & Offer' },
        { id: 'pitch', label: 'Leader Pitch & Guide' },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'terms' | 'pitch')}
      footer={
        <div className="space-y-2 w-full">
          <div className="text-[11px] font-mono text-slate-300 uppercase text-center">
            {t('SELECT RESPONSE • KEYBOARD [1 / 2 / 3] • TOUCH / CONTROLLER SUPPORTED')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              id="special-event-receive-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => handleReceive(evaluation)}
              className="min-h-[48px] py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 border-2 border-sky-200 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer rounded-xl"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>RECEIVE PROPOSAL</span>
              <span className="text-[10px] font-mono opacity-80 hidden sm:inline">[1]</span>
            </button>

            <button
              id="special-event-wait-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => handleWait(evaluation)}
              className="min-h-[48px] py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-200 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer rounded-xl"
              title="Add proposal to Special Opportunity in Transfer and decide later"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>DECIDE LATER (WAIT)</span>
              <span className="text-[10px] font-mono opacity-80 hidden sm:inline">[2]</span>
            </button>

            <button
              id="special-event-decline-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => handleDecline(evaluation)}
              className="min-h-[48px] py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-2 border-slate-600 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer rounded-xl"
            >
              <X className="w-4 h-4 shrink-0" />
              <span>DECLINE EVENT</span>
              <span className="text-[10px] font-mono opacity-80 hidden sm:inline">[3]</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-4 text-left">
        {activeTab === 'terms' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sporting Project */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-arcade text-sky-300 uppercase">SPORTING PROJECT</span>
                <span className="text-xs font-mono text-slate-300 font-bold">
                  {config.leagueName} ({config.country})
                </span>
              </div>
              <div className="text-sm font-mono space-y-2 text-slate-200">
                <p>
                  Manager:{' '}
                  <strong className="text-white">
                    {config.managerName} ({config.managerNationality})
                  </strong>
                </p>
                <p>
                  Tactical System:{' '}
                  <span className="text-sky-300">
                    {config.formation} • {config.tacticalStyle}
                  </span>
                </p>
                <p>
                  Guaranteed Role:{' '}
                  <span className="text-emerald-400 font-bold">
                    {evaluation.squadRole || 'First-Team Starter & Marquee Star'}
                  </span>
                </p>
              </div>
            </div>

            {/* Financial Terms */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-arcade text-amber-300 uppercase flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  CONTRACT OPPORTUNITY
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {evaluation.contractYears || 4} YEARS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                <div>
                  <span className="text-xs text-slate-400 uppercase block">YEARLY SALARY</span>
                  <span className="text-lg font-arcade font-black text-emerald-400">
                    €{yearly.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-300 block">(€{weekly.toLocaleString()}/wk)</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase block">SIGNING BONUS</span>
                  <span className="text-lg font-arcade font-black text-amber-300">
                    +€{signingBonus.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-300 block">Direct Savings</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ConsolePagedText
            resetKey={config.name}
            pages={[
              {
                heading: `${config.leaderTitle} • ${config.keyLeaders}`,
                paragraphs: [`"${config.presidentialQuote || config.legacyPitch}"`],
              },
              {
                heading: 'Transfer Hub Opportunity Flow',
                paragraphs: [
                  t(
                    'Accepting this special event adds the contract to SPECIAL OPPORTUNITY in your Transfer Hub with a [BLUE !] notification. You can inspect the contract and sign whenever ready.'
                  ),
                ],
              },
            ]}
          />
        )}
      </div>
    </ConsoleModalShell>
  );
};
