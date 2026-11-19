import React, { useState, useMemo, useEffect } from 'react';
import { PlayerCardData } from '../types';
import {
  CAREER_PERKS_REGISTRY,
  getActivePerks,
  getPerkById,
  getLocalizedPerk,
  CareerPerk,
  ensurePlayerPerksSync,
} from '../utils/perksSystem';
import { PerkIcon } from './PerkIcon';
import {
  Sparkles,
  ShieldAlert,
  Award,
  Lock,
  CheckCircle2,
  XCircle,
  Search,
  Target,
  Eye,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface PerksPanelProps {
  player: PlayerCardData;
  onUpdatePlayer?: (updated: PlayerCardData) => void;
}

export const PerksPanel: React.FC<PerksPanelProps> = ({ player }) => {
  const { t, language } = useLanguage();
  const syncedPlayer = ensurePlayerPerksSync(player);
  const rawActivePerks = getActivePerks(syncedPlayer);
  const activePerks = useMemo(
    () => rawActivePerks.map((p) => getLocalizedPerk(p, language)),
    [rawActivePerks, language]
  );
  const activeIds = syncedPlayer.activePerkIds || [];
  const retiredIds = syncedPlayer.retiredPerkIds || [];

  const [consoleView, setConsoleView] = useState<'active' | 'codex'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED' | 'DEACTIVATED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [codexPage, setCodexPage] = useState<number>(1);
  const [inspectedPerk, setInspectedPerk] = useState<CareerPerk | null>(null);

  const categories: string[] = [
    'ALL',
    'Key Match',
    'Finance',
    'Lifestyle',
    'Stat',
    'Transfer Market',
    'Parent Card',
  ];

  const localizedRegistry = useMemo(() => {
    return CAREER_PERKS_REGISTRY.map((p) => getLocalizedPerk(p, language));
  }, [language]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: localizedRegistry.length };
    localizedRegistry.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [localizedRegistry]);

  const filteredRegistry = useMemo(() => {
    return localizedRegistry.filter((perk) => {
      if (selectedCategory !== 'ALL' && perk.category !== selectedCategory) return false;

      const isActive = activeIds.includes(perk.id);
      const isRetired = retiredIds.includes(perk.id);
      if (statusFilter === 'ACTIVE' && !isActive) return false;
      if (statusFilter === 'DEACTIVATED' && !isRetired) return false;
      if (statusFilter === 'LOCKED' && (isActive || isRetired)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          perk.name.toLowerCase().includes(q) ||
          perk.shortDescription.toLowerCase().includes(q) ||
          perk.effect.toLowerCase().includes(q) ||
          (perk.howToObtain || '').toLowerCase().includes(q) ||
          perk.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [selectedCategory, statusFilter, searchQuery, activeIds, retiredIds, localizedRegistry]);

  useEffect(() => {
    setCodexPage(1);
  }, [selectedCategory, statusFilter, searchQuery]);

  const pageSize = 6;
  const totalCodexPages = Math.max(1, Math.ceil(filteredRegistry.length / pageSize));
  const safeCodexPage = Math.min(codexPage, totalCodexPages);
  const pagedPerks = filteredRegistry.slice(
    (safeCodexPage - 1) * pageSize,
    safeCodexPage * pageSize
  );

  return (
    <div className="space-y-4 text-white pb-6 animate-fadeIn">
      {/* Compact Header & Console Page Switcher */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border-2 border-amber-500/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('PERKS_CODEX_HEADER') || 'CAREER PERKS & TRAITS CODEX'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5 flex-wrap">
              <span>{t('ACTIVE_PERKS') || 'ACTIVE PERKS'}</span>
              <span className="text-amber-300 text-base font-bold bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-500/40">
                {activePerks.length} / 5
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setConsoleView('active')}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-arcade font-black text-xs uppercase border transition cursor-pointer ${
                consoleView === 'active'
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-950 text-slate-200 border-slate-700 hover:bg-slate-800'
              }`}
            >
              Active Slots ({activePerks.length}/5)
            </button>
            <button
              type="button"
              onClick={() => setConsoleView('codex')}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-arcade font-black text-xs uppercase border transition cursor-pointer ${
                consoleView === 'codex'
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-950 text-slate-200 border-slate-700 hover:bg-slate-800'
              }`}
            >
              Perks Codex ({localizedRegistry.length})
            </button>
          </div>
        </div>
      </div>

      {/* PAGE 1: 5 ACTIVE PERK SLOTS */}
      {consoleView === 'active' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>ACTIVE PERK SLOTS ({activePerks.length} OF 5 EQUIPPED)</span>
            </h3>
            <span className="text-xs text-slate-300 font-semibold">Tap any equipped perk for details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((slotIndex) => {
              const perk = activePerks[slotIndex];
              if (perk) {
                return (
                  <button
                    key={perk.id}
                    type="button"
                    onClick={() => setInspectedPerk(perk)}
                    className="text-left p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 shadow-xl flex flex-col justify-between hover:border-amber-400 transition-all cursor-pointer group relative"
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-slate-800 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                          <PerkIcon iconName={perk.iconName} className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase">
                          SLOT {slotIndex + 1}
                        </span>
                      </div>

                      <div className="text-sm font-black text-amber-300 uppercase tracking-wide mb-1 leading-snug">
                        {perk.name}
                      </div>
                      <p className="text-xs text-slate-200 leading-snug line-clamp-2 mb-3">
                        {perk.shortDescription}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 leading-snug w-full">
                      <div className="font-black text-emerald-400 uppercase text-[10px] mb-0.5">BENEFIT</div>
                      <span className="font-semibold line-clamp-2">{perk.effect}</span>
                    </div>
                  </button>
                );
              }

              return (
                <div
                  key={`empty-${slotIndex}`}
                  className="p-4 rounded-2xl bg-slate-900/40 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center gap-2 min-h-[160px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-center text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-black text-slate-300 uppercase">SLOT {slotIndex + 1} EMPTY</div>
                  <p className="text-xs text-slate-400 max-w-[180px] leading-snug">
                    Earned perks from milestones or cards fill this slot.
                  </p>
                </div>
              );
            })}
          </div>

          {retiredIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/40 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>PERMANENTLY DEACTIVATED PERKS ({retiredIds.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {retiredIds.map((id) => {
                  const p = getPerkById(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => p && setInspectedPerk(getLocalizedPerk(p, language))}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/40 text-xs font-bold text-rose-200 flex items-center gap-2 cursor-pointer hover:border-rose-400 transition"
                    >
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{p?.name || id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAGE 2: PAGED PERKS CODEX */}
      {consoleView === 'codex' && (
        <div className="space-y-4">
          {/* Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search perk name, benefit, criteria..."
                className="w-full min-h-[44px] pl-9 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['ALL', 'ACTIVE', 'LOCKED', 'DEACTIVATED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`min-h-[40px] px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {st === 'DEACTIVATED' ? 'USED' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      selectedCategory === cat
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {totalCodexPages > 1 && (
            <ConsolePaginationBar
              currentPage={safeCodexPage}
              totalPages={totalCodexPages}
              onPageChange={setCodexPage}
              totalItems={filteredRegistry.length}
              pageSize={pageSize}
              label="CODEX PAGE"
            />
          )}

          {pagedPerks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {pagedPerks.map((perk) => {
                const isActive = activeIds.includes(perk.id);
                const isRetired = retiredIds.includes(perk.id);
                const activeSlotIndex = activeIds.indexOf(perk.id);

                return (
                  <button
                    key={perk.id}
                    type="button"
                    onClick={() => setInspectedPerk(perk)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border-amber-500 shadow-lg'
                        : isRetired
                        ? 'bg-slate-900/40 border-rose-900/50 opacity-75'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                              isActive
                                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                                : isRetired
                                ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                                : 'bg-slate-800 border-slate-700 text-amber-400'
                            }`}
                          >
                            <PerkIcon iconName={perk.iconName} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-white truncate">{perk.name}</h4>
                            <span className="inline-block text-[10px] font-black uppercase text-amber-400">
                              {perk.category}
                            </span>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-black uppercase shrink-0">
                            SLOT {activeSlotIndex + 1}
                          </span>
                        ) : isRetired ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-black uppercase shrink-0">
                            USED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase shrink-0">
                            LOCKED
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 mb-3 leading-relaxed">{perk.shortDescription}</p>
                    </div>

                    <div className="space-y-2 pt-2.5 border-t border-slate-800 w-full">
                      <div className="text-xs text-emerald-300 font-semibold line-clamp-2">
                        ✨ {perk.effect}
                      </div>
                      <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Tap for full details
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <h4 className="text-base font-bold text-white">No Perks Match Your Filter</h4>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setStatusFilter('ALL');
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer hover:bg-amber-400 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* PERK DEEP DIVE MODAL (Paged ConsoleModalShell) */}
      {inspectedPerk && (
        <ConsoleModalShell
          isOpen={Boolean(inspectedPerk)}
          onClose={() => setInspectedPerk(null)}
          title={inspectedPerk.name}
          subtitle={`${inspectedPerk.category} PERK • 5 Active Slots Max`}
          badge={
            activeIds.includes(inspectedPerk.id)
              ? `EQUIPPED (SLOT ${activeIds.indexOf(inspectedPerk.id) + 1})`
              : retiredIds.includes(inspectedPerk.id)
              ? 'DEACTIVATED'
              : 'UNLOCKABLE'
          }
          icon={<PerkIcon iconName={inspectedPerk.iconName} className="w-6 h-6 text-amber-300" />}
          accentColor="amber"
          maxWidthClass="sm:max-w-xl"
          footer={
            <button
              type="button"
              onClick={() => setInspectedPerk(null)}
              className="w-full min-h-[46px] px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer hover:bg-amber-400 active:scale-95 transition"
            >
              Close Breakdown
            </button>
          }
        >
          <div className="p-4 sm:p-6">
            <ConsolePagedText
              resetKey={inspectedPerk.id}
              pages={[
                {
                  heading: 'Overview & Benefit',
                  paragraphs: [inspectedPerk.shortDescription],
                  bullets: [
                    `Exact Benefit: ${inspectedPerk.effect}`,
                    `How to Unlock: ${inspectedPerk.howToObtain}`,
                  ],
                },
                ...(inspectedPerk.storyNarrative
                  ? [
                      {
                        heading: inspectedPerk.storyTitle || inspectedPerk.name,
                        paragraphs: [`“${inspectedPerk.storyNarrative}”`],
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </ConsoleModalShell>
      )}
    </div>
  );
};
