import React, { useState } from 'react';
import { Award, Zap, Sparkles, CheckCircle2, GraduationCap, BarChart2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface DevelopmentTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevelopmentTutorialModal: React.FC<DevelopmentTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'guide' | 'tiers'>('guide');
  const [tiersPage, setTiersPage] = useState<number>(1);
  const TIERS_PER_PAGE = 6;

  if (!isOpen) return null;

  const tiers = [
    { range: '0–20', rate: '+5.0', desc: t('DEV_TUTORIAL_TIER_1') || '0–20: +5 Levels per point (1 pt gives 5 levels)', highlight: 'emerald' },
    { range: '20–30', rate: '+3.0', desc: t('DEV_TUTORIAL_TIER_2') || '20–30: +3 Levels per point', highlight: 'emerald' },
    { range: '30–40', rate: '+2.0', desc: t('DEV_TUTORIAL_TIER_3') || '30–40: +2 Levels per point', highlight: 'emerald' },
    { range: '40–50', rate: '+1.5', desc: t('DEV_TUTORIAL_TIER_4') || '40–50: +1.5 Levels per point', highlight: 'cyan' },
    { range: '50–60', rate: '+1.25', desc: t('DEV_TUTORIAL_TIER_5') || '50–60: +1.25 Levels per point', highlight: 'cyan' },
    { range: '60–70', rate: '+1.0', desc: t('DEV_TUTORIAL_TIER_6') || '60–70: +1 Level per point', highlight: 'blue' },
    { range: '70–80', rate: '+0.5', desc: t('DEV_TUTORIAL_TIER_7') || '70–80: 0.5 Levels per point (2 points needed per level)', highlight: 'amber' },
    { range: '80–85', rate: '+0.25', desc: t('DEV_TUTORIAL_TIER_8') || '80–85: 0.25 Levels per point (4 points needed per level)', highlight: 'amber' },
    { range: '85–90', rate: '+0.15', desc: t('DEV_TUTORIAL_TIER_9') || '85–90: 0.15 Levels per point (~7 points per level)', highlight: 'orange' },
    { range: '90–95', rate: '+0.10', desc: t('DEV_TUTORIAL_TIER_10') || '90–95: 0.1 Levels per point (10 points needed per level)', highlight: 'rose' },
    { range: '95–99', rate: '+0.05', desc: t('DEV_TUTORIAL_TIER_11') || '95–99: 0.05 Levels per point (20 points needed per level)', highlight: 'rose' },
  ];

  const totalTierPages = Math.ceil(tiers.length / TIERS_PER_PAGE);
  const safeTierPage = Math.min(tiersPage, totalTierPages);
  const pagedTiers = tiers.slice((safeTierPage - 1) * TIERS_PER_PAGE, safeTierPage * TIERS_PER_PAGE);

  return (
    <ConsoleModalShell
      id="dev-tutorial-modal-content"
      isOpen={isOpen}
      onClose={onClose}
      title={t('DEV_TUTORIAL_TITLE') || 'Attribute Development & Training Levels'}
      subtitle={t('DEV_TUTORIAL_SUBTITLE') || 'Tiered growth curves, progress bars & the 100 Stat Break'}
      badge="System Guide"
      icon={<GraduationCap className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-3xl"
      tabs={[
        { id: 'guide', label: '1. ' + (t('SYSTEM GUIDE') || 'SYSTEM GUIDE'), icon: <Sparkles className="w-3.5 h-3.5" /> },
        { id: 'tiers', label: '2. ' + (t('DEV_TUTORIAL_TIER_TITLE') || 'EFFICIENCY TIERS'), icon: <Zap className="w-3.5 h-3.5" /> },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'guide' | 'tiers')}
      bodyClassName="p-4 sm:p-6 space-y-4 font-pixel text-slate-200"
      footer={
        <div className="flex justify-end">
          <button
            id="dev-tutorial-confirm-btn"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-arcade font-black uppercase text-xs sm:text-sm pixel-corners pixel-bevel-gold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>{t('DEV_TUTORIAL_GOT_IT') || "Got It, Let's Train!"}</span>
          </button>
        </div>
      }
    >
      {activeTab === 'guide' && (
        <ConsolePagedText
          textSizeClass="text-sm sm:text-base"
          pages={[
            {
              heading: t('DEV_TUTORIAL_PROGRESS_BAR_TITLE') || 'Under-Stat Training Bar',
              paragraphs: [
                t('DEV_TUTORIAL_INTRO') ||
                  "Each stat point invested now adds to your attribute's Training Level. Early attributes surge quickly, while elite levels require focused dedication.",
                t('DEV_TUTORIAL_PROGRESS_BAR_DESC') ||
                  'Each stat features a dedicated progress bar displaying the exact points invested and remaining to advance to the next level.',
              ],
              node: (
                <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/40 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-300 rounded-lg shrink-0">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs sm:text-sm text-cyan-200 font-sans">
                    {t('DEV_TUTORIAL_PROGRESS_BAR_TITLE') || 'Under-Stat Training Bar'} — Switch to Page 2 in this guide to check Stat Break & Archetype Rules!
                  </div>
                </div>
              ),
            },
            {
              heading: t('DEV_TUTORIAL_STAT_BREAK_TITLE') || 'Stat Break & Training Bonuses',
              paragraphs: [
                t('DEV_TUTORIAL_STAT_BREAK_DESC') ||
                  'At 99, invest exactly 100 stat points to break through to 100 and achieve permanent Stat Break Immortality!',
                t('DEV_TUTORIAL_TRAINING_REWARD_DESC') ||
                  'Hitting 100% on your training bar allocates +1 stat point of tiered progression into every attribute!',
                t('DEV_TUTORIAL_ARCHETYPE_BONUS_DESC') ||
                  'Main strengths receive +2/yr and secondaries +1/yr. Archetype weakness attributes require +10% more points to advance.',
              ],
              node: (
                <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-slate-900 border-2 border-amber-400/80 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-amber-400 text-slate-950 rounded-lg shrink-0 font-black">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-amber-200 font-sans">
                    100 Stat Break = Permanent Legend Threshold!
                  </span>
                </div>
              ),
            },
          ]}
        />
      )}

      {activeTab === 'tiers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-arcade font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5 text-xs sm:text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{t('DEV_TUTORIAL_TIER_TITLE') || 'Training Efficiency Tiers'}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pagedTiers.map((tItem) => (
              <div
                key={tItem.range}
                className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-white font-mono text-sm">{tItem.range}</span>
                  <p className="text-xs text-slate-300 font-sans leading-snug">{tItem.desc}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono shrink-0 ${
                    tItem.highlight === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : tItem.highlight === 'cyan'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : tItem.highlight === 'blue'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : tItem.highlight === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : tItem.highlight === 'orange'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {tItem.rate}
                </span>
              </div>
            ))}
          </div>

          {totalTierPages > 1 && (
            <ConsolePaginationBar
              currentPage={safeTierPage}
              totalPages={totalTierPages}
              onPageChange={setTiersPage}
              totalItems={tiers.length}
              pageSize={TIERS_PER_PAGE}
              label="TIER PAGE"
            />
          )}
        </div>
      )}
    </ConsoleModalShell>
  );
};

