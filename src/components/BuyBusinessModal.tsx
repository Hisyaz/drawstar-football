import React, { useState } from 'react';
import {
  BUSINESS_TEMPLATES,
  BusinessTemplate,
  formatEuros,
  createBusinessInstance,
} from '../data/businesses';
import { BusinessItem } from '../types';
import {
  Building2,
  Shirt,
  Dumbbell,
  Utensils,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Check,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { ChoiceSystem } from './ChoiceSystem';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface BuyBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCash?: number;
  ownedBusinesses?: BusinessItem[];
  onPurchaseBusiness: (newBiz: BusinessItem, cost: number) => void;
  showToast: (msg: string) => void;
}

export const BuyBusinessModal: React.FC<BuyBusinessModalProps> = ({
  isOpen,
  onClose,
  availableCash = 0,
  ownedBusinesses = [],
  onPurchaseBusiness,
  showToast,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewPage, setViewPage] = useState<'overview' | 'tiers'>('overview');
  const [previewTierMap, setPreviewTierMap] = useState<Record<string, number>>({
    sportswear: 1,
    fitness: 1,
    restaurant: 1,
    vc_fund: 1,
    hotel: 1,
  });

  if (!isOpen) return null;

  const safeOwnedBusinesses = Array.isArray(ownedBusinesses) ? ownedBusinesses : [];
  const safeTemplates = Array.isArray(BUSINESS_TEMPLATES) ? BUSINESS_TEMPLATES : [];

  const selectedTemplate = safeTemplates[currentIndex] || safeTemplates[0];

  if (!selectedTemplate || !selectedTemplate.tiers) {
    return (
      <ConsoleModalShell
        isOpen={isOpen}
        onClose={onClose}
        title="BUSINESS DATA UNAVAILABLE"
        icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
        accentColor="rose"
        maxWidthClass="sm:max-w-md"
        footer={
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer"
          >
            BACK
          </button>
        }
      >
        <div className="p-5">
          <ConsolePagedText paragraphs={['Business investment catalog is temporarily unavailable.']} />
        </div>
      </ConsoleModalShell>
    );
  }

  const existingBiz = safeOwnedBusinesses.find(
    (b) => b && (b.templateId === selectedTemplate.id || b.name === selectedTemplate.name)
  );
  const isAlreadyOwned = Boolean(existingBiz);

  const currentPreviewTier = (previewTierMap && previewTierMap[selectedTemplate.id]) || existingBiz?.tier || 1;
  const tierData = (selectedTemplate.tiers && selectedTemplate.tiers[currentPreviewTier]) || {
    cost: 0,
    minRevenue: 0,
    maxRevenue: 0,
  };

  const getBusinessIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt':
        return <Shirt className="w-7 h-7 text-blue-400" />;
      case 'Dumbbell':
        return <Dumbbell className="w-7 h-7 text-emerald-400" />;
      case 'Utensils':
        return <Utensils className="w-7 h-7 text-amber-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-7 h-7 text-purple-400" />;
      case 'Building2':
        return <Building2 className="w-7 h-7 text-rose-400" />;
      default:
        return <Building2 className="w-7 h-7 text-indigo-400" />;
    }
  };

  const selectedTier1Cost = selectedTemplate?.tiers?.[1]?.cost || 0;
  const canAffordSelected = availableCash >= selectedTier1Cost;

  const handleBuy = (template: BusinessTemplate) => {
    const alreadyOwned = safeOwnedBusinesses.some(
      (b) => b && (b.templateId === template.id || b.name === template.name)
    );
    if (alreadyOwned) {
      showToast(
        `❌ You already own ${template.name}! You can only own one of each business type. Upgrade it in your portfolio.`
      );
      return;
    }

    const cost = template?.tiers?.[1]?.cost || 0;
    if (availableCash < cost) {
      showToast(
        `❌ Not enough funds to purchase ${template.name}! Requires ${formatEuros(cost)} (Available: ${formatEuros(
          availableCash
        )}).`
      );
      return;
    }
    const newBiz = createBusinessInstance(template);
    onPurchaseBusiness(newBiz, cost);
    showToast(`💼 Successfully purchased ${template.name} (Tier 1) for ${formatEuros(cost)}!`);
    onClose();
  };

  return (
    <ChoiceSystem
      isOpen={isOpen}
      totalChoices={safeTemplates.length}
      currentIndex={currentIndex}
      onNavigate={setCurrentIndex}
      onConfirm={() => handleBuy(selectedTemplate)}
      title={selectedTemplate.name}
      subtitle={`${selectedTemplate.category} • Cost: ${formatEuros(selectedTier1Cost)}`}
      selectorLabel={`CHOICE ${currentIndex + 1} OF ${safeTemplates.length}`}
      themeColor="#a855f7"
      accentGradient="from-purple-500 via-pink-400 to-purple-600"
      categoryBadge={
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
          <Briefcase className="w-3 h-3" />
          BUSINESS INVESTMENT
        </span>
      }
      topActions={
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-mono">
            Funds: <strong className="text-emerald-400">{formatEuros(availableCash)}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      }
      secondaryAction={{
        label: 'Close',
        onClick: onClose,
        variant: 'ghost',
      }}
      confirmLabel={
        isAlreadyOwned
          ? 'ALREADY OWNED'
          : canAffordSelected
          ? `ACQUIRE ${selectedTemplate.name.toUpperCase()} (TIER 1)`
          : `INSUFFICIENT FUNDS (${formatEuros(selectedTier1Cost)})`
      }
      confirmDisabled={isAlreadyOwned || !canAffordSelected}
      confirmIcon={<Check className="w-5 h-5 stroke-[3]" />}
    >
      <div className="w-full max-w-3xl flex flex-col gap-4 p-4 sm:p-6 bg-slate-900/95 border border-slate-700/70 rounded-2xl sm:rounded-3xl shadow-2xl my-auto">
        {/* Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 sm:p-4 rounded-2xl bg-purple-500/20 border border-purple-500/40 shadow-inner shrink-0">
              {getBusinessIcon(selectedTemplate.iconName)}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                {selectedTemplate.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {selectedTemplate.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">Franchise Enterprise (Upgradable to Tier 5)</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Tier 1 Cost</span>
            <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
              {formatEuros(selectedTier1Cost)}
            </span>
          </div>
        </div>

        {/* Console View Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewPage('overview')}
            className={`min-h-[44px] rounded-lg text-xs font-black uppercase transition cursor-pointer ${
              viewPage === 'overview'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Overview & Margins
          </button>
          <button
            type="button"
            onClick={() => setViewPage('tiers')}
            className={`min-h-[44px] rounded-lg text-xs font-black uppercase transition cursor-pointer ${
              viewPage === 'tiers'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tier 1–5 Estimates
          </button>
        </div>

        {viewPage === 'overview' ? (
          <div className="space-y-3.5">
            {isAlreadyOwned && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Owned Franchise: Tier {existingBiz?.tier || 1} of 5 Active</span>
                </div>
                <span className="text-xs text-emerald-400 font-mono bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  1 Per Player Limit
                </span>
              </div>
            )}

            <ConsolePagedText resetKey={selectedTemplate.id} paragraphs={[selectedTemplate.description]} />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">Operating Costs</div>
                <div className="text-base font-black text-rose-400 font-mono">
                  {Math.round((selectedTemplate.operatingCostsPct || 0) * 100)}%
                </div>
                <p className="text-xs text-slate-300">Deducted from gross revenue</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">Net Profit Margin</div>
                <div className="text-base font-black text-emerald-400 font-mono">
                  {Math.round((selectedTemplate.netProfitPct || 0) * 100)}%
                </div>
                <p className="text-xs text-slate-300">Net revenue added to savings</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {[1, 2, 3, 4, 5].map((tNum) => {
                const isCurrent = currentPreviewTier === tNum;
                return (
                  <button
                    key={tNum}
                    type="button"
                    onClick={() =>
                      setPreviewTierMap((prev) => ({ ...prev, [selectedTemplate.id]: tNum }))
                    }
                    className={`min-h-[44px] py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    T{tNum}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-950 border border-purple-500/30 p-3.5 rounded-xl text-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white">Tier {currentPreviewTier} Estimates</span>
                <span className="text-amber-400 font-bold font-mono">
                  {currentPreviewTier === 1
                    ? `Cost: ${formatEuros(tierData.cost || 0)}`
                    : `Upgrade: ${formatEuros(tierData.cost || 0)}`}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-400">Annual Revenue</div>
                  <div className="font-extrabold text-sky-400 font-mono">
                    {formatEuros(tierData.minRevenue || 0)} – {formatEuros(tierData.maxRevenue || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Est. Net Profit</div>
                  <div className="font-extrabold text-emerald-400 font-mono">
                    {formatEuros(
                      Math.round((tierData.minRevenue || 0) * (selectedTemplate.netProfitPct || 0))
                    )}{' '}
                    –{' '}
                    {formatEuros(
                      Math.round((tierData.maxRevenue || 0) * (selectedTemplate.netProfitPct || 0))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Generate passive off-pitch income every season</span>
            </div>
          </div>
        )}
      </div>
    </ChoiceSystem>
  );
};
