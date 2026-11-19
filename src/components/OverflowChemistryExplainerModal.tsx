import React, { useState } from 'react';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';
import { t } from '../utils/localizationSystem';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface OverflowChemistryExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChemistry?: number;
}

export const OverflowChemistryExplainerModal: React.FC<OverflowChemistryExplainerModalProps> = ({
  isOpen,
  onClose,
  currentChemistry = 110,
}) => {
  const [activeTab, setActiveTab] = useState<'meter' | 'rules'>('meter');

  if (!isOpen) return null;

  const overflowPct = Math.max(0, Math.min(100, currentChemistry - 100));

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t('OVERFLOW_CHEM_TITLE')}
      subtitle={t('OVERFLOW_CHEM_SUBTITLE')}
      badge={t('OVERFLOW_CHEM_BADGE') || 'TRANSCENDENCE'}
      icon={<Sparkles className="w-5 h-5 text-cyan-300" />}
      accentColor="cyan"
      maxWidthClass="sm:max-w-lg"
      zIndexClass="z-[100]"
      tabs={[
        { id: 'meter', label: t('Synergy Meter') || 'Synergy Meter' },
        { id: 'rules', label: t('How It Works') || 'How It Works (3)' },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'meter' | 'rules')}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] py-3 px-6 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 hover:from-cyan-300 hover:to-sky-200 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <span>{t('OVERFLOW_CHEM_BUTTON')}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      }
    >
      {activeTab === 'meter' ? (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-bold">
              <span className="text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                {t('OVERFLOW_CHEM_METER_TITLE') || 'Overflow Synergy Meter'}
              </span>
              <span className="text-white font-mono">
                <span className="text-emerald-400 font-black">100%</span>
                <span className="text-slate-400 mx-1">+</span>
                <span className="text-cyan-400 font-black">
                  {overflowPct > 0
                    ? t('OVERFLOW_CHEM_METER_OVERFLOW', { pct: overflowPct }) || `${overflowPct}% OVERFLOW`
                    : t('OVERFLOW_CHEM_METER_ZONE') || 'OVERFLOW ZONE (0–100%)'}
                </span>
              </span>
            </div>

            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative p-0.5">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 w-full opacity-60" />
              <div
                className="absolute inset-0 h-full rounded-full transition-all duration-500 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 shadow-[0_0_14px_rgba(56,189,248,0.9)] border border-cyan-200/60"
                style={{ width: `${Math.max(15, overflowPct)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 gap-2">
              <span>{t('OVERFLOW_CHEM_BASE_LABEL') || 'Base (100%)'}</span>
              <span className="text-cyan-300 font-bold text-right">
                {t('OVERFLOW_CHEM_LAYER_LABEL') || 'Overflow (Max 200%)'}
              </span>
            </div>
          </div>

          <ConsolePagedText
            paragraphs={[t('OVERFLOW_CHEM_DESC_1')]}
            resetKey="chem-meter"
          />

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-arcade uppercase tracking-wider flex items-center justify-between cursor-pointer"
          >
            <span>Read Full Overflow Rules</span>
            <span>NEXT PAGE →</span>
          </button>
        </div>
      ) : (
        <ConsolePagedText
          heading={t('OVERFLOW_CHEM_TITLE')}
          bullets={[
            t('OVERFLOW_CHEM_DESC_1'),
            t('OVERFLOW_CHEM_DESC_2'),
            t('OVERFLOW_CHEM_DESC_3'),
          ]}
          maxBulletsPerPage={2}
          resetKey="chem-rules"
        />
      )}
    </ConsoleModalShell>
  );
};

