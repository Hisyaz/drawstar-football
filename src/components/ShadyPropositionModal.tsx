import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Flame,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Skull,
} from 'lucide-react';
import { ShadyProposition, PlayerCardData, AccountingState, ManagerState } from '../types';
import { resolveShadyProposition } from '../utils/managerInteractionSystem';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface ShadyPropositionModalProps {
  isOpen: boolean;
  proposition: ShadyProposition | null;
  player: PlayerCardData;
  accounting?: AccountingState;
  manager?: ManagerState;
  onDecisionResolved: (
    updatedPlayer: PlayerCardData,
    updatedAccounting: AccountingState,
    headline: string,
    narrative: string,
    sanctioned: boolean
  ) => void;
  onClose: () => void;
}

export const ShadyPropositionModal: React.FC<ShadyPropositionModalProps> = ({
  isOpen,
  proposition,
  player,
  accounting,
  manager,
  onDecisionResolved,
  onClose,
}) => {
  const { t } = useLanguage();
  const [isResolving, setIsResolving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pitch' | 'terms'>('pitch');
  const [resolutionOutcome, setResolutionOutcome] = useState<{
    headline: string;
    narrative: string;
    sanctioned: boolean;
    cashReward: number;
    fine: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsResolving(false);
      setActiveTab('pitch');
      setResolutionOutcome(null);
    }
  }, [isOpen, proposition?.title]);

  if (!isOpen || !proposition) return null;

  const handleDecision = (accepted: boolean) => {
    setIsResolving(true);
    const result = resolveShadyProposition(proposition, accepted, player, accounting);

    setResolutionOutcome({
      headline: result.resultHeadline,
      narrative: result.resultNarrative,
      sanctioned: result.sanctioned,
      cashReward: result.cashRewardEarned,
      fine: result.fineIncurred,
    });

    onDecisionResolved(
      result.updatedPlayer,
      result.updatedAccounting,
      result.resultHeadline,
      result.resultNarrative,
      result.sanctioned
    );
  };

  return createPortal(
    <ConsoleModalShell
      isOpen={isOpen}
      showCloseButton={false}
      zIndexClass="z-[9999]"
      maxWidthClass="sm:max-w-3xl"
      accentColor="rose"
      title={t(proposition.title)}
      subtitle={`${t('Representative')}: ${manager?.name || t('Shady Agent')}`}
      badge={t('Confidential Agent Proposition')}
      icon={<Flame className="w-6 h-6 text-rose-400 animate-pulse" />}
      tabs={
        !resolutionOutcome
          ? [
              { id: 'pitch', label: '1. The Pitch' },
              { id: 'terms', label: '2. Cash vs Risk' },
            ]
          : undefined
      }
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'pitch' | 'terms')}
      footer={
        !resolutionOutcome ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isResolving}
              onClick={() => handleDecision(false)}
              className="w-full sm:w-auto min-h-[48px] px-5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition flex items-center justify-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('Refuse Proposition (Play With Honor)')}</span>
            </button>

            <button
              type="button"
              disabled={isResolving}
              onClick={() => handleDecision(true)}
              className="w-full sm:w-auto min-h-[48px] px-6 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2 active:scale-95"
            >
              <Flame className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t('Accept Deal (€{reward})', { reward: proposition.cashReward.toLocaleString() })}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black font-arcade text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition active:scale-95"
          >
            {t('Continue Career')}
          </button>
        )
      }
    >
      <div className="p-4 sm:p-6">
        {!resolutionOutcome ? (
          <div className="space-y-4">
            {/* Pitch Section */}
            <div className={`${activeTab === 'pitch' ? 'block' : 'hidden sm:block'} space-y-3`}>
              <div className="text-xs sm:text-sm font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <Skull className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{t('The Underground Deal')}: {t(proposition.scenario)}</span>
              </div>

              <ConsolePagedText
                paragraphs={[`"${t(proposition.description)}"`]}
                textSizeClass="text-sm sm:text-base text-slate-100 italic leading-relaxed"
              />

              <div className="p-3.5 bg-rose-950/60 border border-rose-700/40 rounded-xl text-xs sm:text-sm text-rose-200 leading-relaxed">
                <strong>{t('Specific Directive')}:</strong> {t(proposition.actionInstruction)}
              </div>
            </div>

            {/* Cash vs Risk Grid */}
            <div className={`${activeTab === 'terms' ? 'grid' : 'hidden sm:grid'} grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm`}>
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                <div className="font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('Underground Compensation')}</span>
                </div>
                <div className="space-y-1.5 text-slate-200">
                  <div className="text-lg font-black text-emerald-300">
                    +€{proposition.cashReward.toLocaleString()} {t('Instant Cash')}
                  </div>
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span>{t(proposition.promisedClubBonus)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 space-y-2">
                <div className="font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{t('FA Integrity Risk')} ({proposition.investigationRiskPct}%)</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div>
                    {t('Fine')}: <strong className="text-rose-400">€{proposition.sanctionFine.toLocaleString()}</strong>
                  </div>
                  <div>
                    {t('Suspension')}: <strong className="text-rose-400">{proposition.matchBanWeeks} {t('Match Weeks Ban')}</strong>
                  </div>
                  <div>
                    {t('Infamy')}: <strong className="text-rose-400">+{proposition.reputationPenalty} {t('Bad Reputation')}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              resolutionOutcome.sanctioned
                ? 'bg-rose-950/80 border-rose-500 text-rose-100'
                : resolutionOutcome.cashReward > 0
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
                : 'bg-slate-900/80 border-slate-700 text-slate-200'
            }`}
          >
            <h3 className="text-lg sm:text-xl font-black tracking-tight">
              {t(resolutionOutcome.headline)}
            </h3>
            <ConsolePagedText
              paragraphs={[t(resolutionOutcome.narrative)]}
              textSizeClass="text-sm sm:text-base leading-relaxed"
            />
          </div>
        )}
      </div>
    </ConsoleModalShell>,
    document.body
  );
};

