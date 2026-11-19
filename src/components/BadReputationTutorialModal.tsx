import React from 'react';
import { Flame, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface BadReputationTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadReputationTutorialModal: React.FC<BadReputationTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <ConsoleModalShell
      id="bad-rep-tutorial-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={t('BAD_REP_TUTORIAL_TITLE') || 'BAD REPUTATION & CONDUCT SYSTEM'}
      subtitle={t('BAD_REP_TUTORIAL_SUBTITLE') || 'How Controversial Infamy Affects Your Football Career'}
      badge={t('CAREER_TUTORIAL_BADGE') || 'TUTORIAL GUIDE'}
      icon={<Flame className="w-5 h-5 text-rose-400 animate-pulse" />}
      accentColor="rose"
      maxWidthClass="sm:max-w-3xl"
      zIndexClass="z-[10000]"
      bodyClassName="p-4 sm:p-6 flex flex-col justify-between"
      footer={
        <div className="flex justify-end">
          <button
            id="bad-rep-tutorial-close-btn"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[48px] px-7 py-2.5 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-arcade text-xs sm:text-sm uppercase tracking-wider pixel-corners pixel-bevel-gold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)] cursor-pointer active:translate-y-0.5 transition-all"
          >
            <span>{t('BAD_REP_TUTORIAL_ACKNOWLEDGE') || 'UNDERSTOOD / ACKNOWLEDGE'}</span>
            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </button>
        </div>
      }
    >
      <ConsolePagedText
        textSizeClass="text-sm sm:text-base"
        pages={[
          {
            heading: t('BAD_REP_TUTORIAL_TITLE') || 'Bad Reputation System',
            paragraphs: [
              t('BAD_REP_TUTORIAL_INTRO') ||
                'Bad reputation reflects your controversial off-pitch and on-pitch conduct. A straight red card immediately awards +10 Bad Fame. Reckless nightlife, training ground brawls, and media outbursts also fuel your infamy meter.',
            ],
            bullets: [
              'Straight red cards increase your Bad Fame immediately (+10).',
              'Controversial press interviews and nightlife events build infamy.',
              'Higher infamy unlocks risky Tiers I–III that change club and match dynamics.',
            ],
          },
          {
            heading: `${t('BAD_REP_TUTORIAL_MODIFIERS_HEADER') || 'CONDUCT TIERS:'} ${t('BAD_REP_TIER_1_TITLE') || 'I "Bad Boy"'}`,
            paragraphs: (
              t('BAD_REP_TIER_1_DESC') ||
              '• Red Card Risk: +20% higher chance of receiving a red card during matches.\n• Transfer Drop: 25% chance interested clubs drop transfer offers.\n• Starting Chemistry: Reduced to 40% (-10%) on newly signed clubs.\n• Lifestyle Drama: 10% mid-season chance of negative lifestyle events.'
            )
              .split('\n')
              .map((line) => line.replace(/^[•\-\s]+/, '')),
          },
          {
            heading: t('BAD_REP_TIER_2_TITLE') || 'Tier II: "Menace"',
            paragraphs: (
              t('BAD_REP_TIER_2_DESC') ||
              '• Red Card Risk: +40% higher chance of receiving a red card during matches.\n• Transfer Drop: 50% chance clubs cancel contract bids.\n• Starting Chemistry: Reduced to 30% (-20%) on newly signed clubs.\n• Lifestyle Drama: 20% mid-season chance of negative lifestyle events.'
            )
              .split('\n')
              .map((line) => line.replace(/^[•\-\s]+/, '')),
          },
          {
            heading: t('BAD_REP_TIER_3_TITLE') || 'Tier III: "Psycho" (LOCKED FLOOR)',
            paragraphs: (
              t('BAD_REP_TIER_3_DESC') ||
              '• Red Card Risk: +60% higher chance of receiving a red card during matches.\n• Transfer Drop: 75% chance of prospective buyers boycotting your transfer.\n• Starting Chemistry: Reduced to 20% (-30%) on newly signed clubs.\n• Lifestyle Drama: 30% mid-season chance of negative lifestyle events.\n• Permanent Lock: Reputation can NEVER drop below Tier III once reached.'
            )
              .split('\n')
              .map((line) => line.replace(/^[•\-\s]+/, '')),
          },
          {
            heading: t('BAD_REP_TUTORIAL_RULES_HEADER') || 'COMPETITION SUSPENSION REGULATIONS',
            paragraphs: (
              t('BAD_REP_TUTORIAL_DISCIPLINARY_RULES') ||
              '• Red Cards: A straight red card bars you from playing the NEXT match of that competition.\n• World Championship & International: 2 yellow cards trigger a 1-match suspension. Yellow card counts CLEAR after the Group Stage and CLEAR again after the Quarter-Finals.\n• EWL / Continental: 2 yellow cards trigger a 1-match suspension. Yellows CLEAR after the League Phase and CLEAR again after the Quarter-Finals.\n• Domestic Leagues: 4 yellow cards trigger a 1-match suspension (no midway clears).'
            )
              .split('\n')
              .map((line) => line.replace(/^[•\-\s]+/, '')),
          },
        ]}
      />
    </ConsoleModalShell>
  );
};

