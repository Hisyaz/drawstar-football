import React from 'react';
import { Skull, ArrowRight, Lock } from 'lucide-react';
import { BadRepTierUpEvent, getRomanReputationTier } from '../utils/badReputationSystem';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface BadReputationTierModalProps {
  isOpen: boolean;
  event: BadRepTierUpEvent | null;
  onAcknowledge: () => void;
}

export const BadReputationTierModal: React.FC<BadReputationTierModalProps> = ({
  isOpen,
  event,
  onAcknowledge,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !event) return null;

  const roman = getRomanReputationTier(event.newTier);

  return (
    <ConsoleModalShell
      id="bad-reputation-tier-modal"
      isOpen={isOpen}
      onClose={onAcknowledge}
      showCloseButton={false}
      closeDisabled={true}
      zIndexClass="z-[10000]"
      maxWidthClass="sm:max-w-lg"
      accentColor="rose"
      title={t(event.title) || event.title}
      badge={`${t('BAD_REP_TIER_LABEL') || 'REPUTATION TIER'} ${roman}`}
      subtitle={
        event.newTier === 3
          ? `🔒 ${t('LOCKED') || 'LOCKED'} • ${t('ACTIVE_PROBLEM_PLAYER_PENALTIES') || 'Problem-Player Penalties'}`
          : t('ACTIVE_PROBLEM_PLAYER_PENALTIES') || 'Active Problem-Player Penalties'
      }
      icon={<Skull className="w-5 h-5 text-rose-300 animate-pulse" />}
      headerRight={
        event.newTier === 3 ? (
          <span className="px-2 py-1 bg-slate-900 text-amber-300 border border-amber-500 rounded text-[10px] font-mono font-bold flex items-center gap-1 uppercase shrink-0">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>{t('LOCKED') || 'LOCKED'}</span>
          </span>
        ) : undefined
      }
      bodyClassName="p-4 sm:p-6 flex flex-col justify-between"
      footer={
        <button
          type="button"
          onClick={onAcknowledge}
          className="w-full min-h-[48px] px-6 py-3 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-arcade text-xs sm:text-sm uppercase tracking-wider rounded-xl border border-rose-400/60 flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
        >
          <span>{t('ACKNOWLEDGE_CONSEQUENCES') || 'ACKNOWLEDGE CONSEQUENCES'}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      }
    >
      <ConsolePagedText
        resetKey={`${event.newTier}-${event.title}`}
        pages={[
          {
            heading: `${t('BAD_REP_TIER_LABEL') || 'Reputation Tier'} ${roman}`,
            paragraphs: [t(event.description) || event.description],
          },
          {
            heading: `⚠ ${t('ACTIVE_PROBLEM_PLAYER_PENALTIES') || 'Active Problem-Player Penalties'}`,
            bullets: event.consequences.map((c) => t(c) || c),
          },
        ]}
      />
    </ConsoleModalShell>
  );
};
