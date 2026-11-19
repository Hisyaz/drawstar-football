import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Copy,
  Download,
  Trash2,
  Check,
  Search,
  Plus,
  Eye,
  FileText,
  Shield,
} from 'lucide-react';
import {
  getInspectedItems,
  recordInspectedText,
  removeInspectedItem,
  clearAllInspectedItems,
  exportInspectedItemsAsJson,
  exportInspectedItemsAsMarkdown,
  InspectedTranslationItem,
} from '../utils/translationInspectorSystem';
import { useLanguage } from '../context/LanguageContext';
import {
  getCanonicalPosition,
  getCanonicalStat,
  getCanonicalPerk,
  getCanonicalClubName,
  getCanonicalManagerName,
  getCanonicalTrophyName,
} from '../utils/canonicalEntityResolver';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

interface TranslationInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInspectModeActive: boolean;
  onToggleInspectMode: () => void;
  showToast?: (msg: string) => void;
}

export const TranslationInspectorModal: React.FC<TranslationInspectorModalProps> = ({
  isOpen,
  onClose,
  isInspectModeActive,
  onToggleInspectMode,
  showToast = () => {},
}) => {
  const { currentLanguage } = useLanguage();
  const [items, setItems] = useState<InspectedTranslationItem[]>([]);
  const [filterScreen, setFilterScreen] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'audit_list' | 'manual_add' | 'canonical_check'>('audit_list');
  const [page, setPage] = useState<number>(1);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Manual add form state
  const [manualText, setManualText] = useState('');
  const [manualScreen, setManualScreen] = useState('Wonderkid Profile Creator');
  const [manualNotes, setManualNotes] = useState('');

  // Canonical check test
  const [canonicalTestQuery, setCanonicalTestQuery] = useState('');

  const refreshItems = () => {
    setItems(getInspectedItems());
  };

  useEffect(() => {
    if (isOpen) {
      refreshItems();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    const jsonStr = exportInspectedItemsAsJson();
    navigator.clipboard.writeText(jsonStr);
    setCopiedFormat('json');
    showToast('📋 Copied Untranslated Audit JSON to clipboard!');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleCopyMarkdown = () => {
    const mdStr = exportInspectedItemsAsMarkdown();
    navigator.clipboard.writeText(mdStr);
    setCopiedFormat('markdown');
    showToast('📋 Copied Untranslated Markdown list to clipboard!');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownloadJson = () => {
    const jsonStr = exportInspectedItemsAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawstar_untranslated_strings_${currentLanguage}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 Downloaded translation audit file!');
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    recordInspectedText(manualText, manualScreen, currentLanguage, manualNotes);
    setManualText('');
    setManualNotes('');
    refreshItems();
    setActiveTab('audit_list');
    showToast('✨ Added text to translation audit list!');
  };

  const handleDeleteItem = (id: string) => {
    removeInspectedItem(id);
    refreshItems();
  };

  const handleClearAll = () => {
    clearAllInspectedItems();
    refreshItems();
    setConfirmClearAll(false);
    setPage(1);
    showToast('🗑️ Cleared translation audit list.');
  };

  const uniqueScreens = Array.from(new Set(items.map((i) => i.screenContext)));

  const filteredItems = items.filter((item) => {
    const matchesScreen = filterScreen === 'all' || item.screenContext === filterScreen;
    const matchesSearch =
      !searchQuery.trim() ||
      item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.screenContext.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.suggestedKey && item.suggestedKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesScreen && matchesSearch;
  });

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={() => {
        setConfirmClearAll(false);
        onClose();
      }}
      id="translation-inspector-modal"
      title="TRANSLATION INSPECTOR & AUDIT TOOL"
      subtitle={`Track & export untranslated texts • Lang: ${currentLanguage}`}
      badge={`LANG: ${currentLanguage.toUpperCase()}`}
      icon={<Wand2 className="w-5 h-5 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-4xl"
      zIndexClass="z-[10000]"
      tabs={[
        { id: 'audit_list', label: 'Audited List', badge: items.length },
        { id: 'manual_add', label: 'Add Text', icon: <Plus className="w-3.5 h-3.5" /> },
        { id: 'canonical_check', label: 'Canonical Check', icon: <Shield className="w-3.5 h-3.5" /> },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => {
        setActiveTab(id as 'audit_list' | 'manual_add' | 'canonical_check');
        setConfirmClearAll(false);
      }}
      bodyClassName="p-3 sm:p-5 space-y-3.5"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 truncate">
            Saved in browser • Use Copy JSON for AI to export.
          </span>
          <button
            type="button"
            onClick={() => {
              setConfirmClearAll(false);
              onClose();
            }}
            className="min-h-[48px] px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-pixel text-xs font-bold rounded-xl cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      }
    >
      {/* TOP STATUS & LIVE PICKER CONTROLLER */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onToggleInspectMode}
          className={`w-full sm:w-auto min-h-[44px] px-3.5 py-2 rounded-xl font-pixel text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
            isInspectModeActive
              ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg animate-pulse'
              : 'bg-slate-900 text-slate-200 hover:text-white border-slate-700 hover:border-amber-400'
          }`}
        >
          <Eye className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {isInspectModeActive ? 'INSPECTOR ACTIVE (TAP IN-GAME TEXT)' : 'ACTIVATE MAGIC INSPECTOR'}
          </span>
        </button>
        <span className="text-xs text-slate-400 leading-snug">
          {isInspectModeActive
            ? 'Close this modal and tap any game text to capture it.'
            : 'Enable tap-to-capture on any screen.'}
        </span>
      </div>

      {/* TAB CONTENT 1: AUDIT LIST & EXPORT ACTIONS */}
      {activeTab === 'audit_list' && (
        <div className="space-y-3">
          {/* Filter & Export Toolbar */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search audited texts..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full min-h-[44px] pl-9 pr-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                />
              </div>

              {uniqueScreens.length > 0 && (
                <select
                  value={filterScreen}
                  onChange={(e) => {
                    setFilterScreen(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-56 min-h-[44px] bg-slate-900 border border-slate-700 text-xs text-slate-200 py-2 px-3 rounded-xl outline-none cursor-pointer"
                >
                  <option value="all">All Screens ({items.length})</option>
                  {uniqueScreens.map((s) => (
                    <option key={s} value={s}>
                      {s} ({items.filter((i) => i.screenContext === s).length})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Action Buttons: Copy JSON & Export */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                disabled={items.length === 0}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-arcade font-black uppercase flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
                  copiedFormat === 'json'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {copiedFormat === 'json' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedFormat === 'json' ? 'COPIED!' : 'COPY JSON FOR AI'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                disabled={items.length === 0}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-pixel flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Markdown</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                disabled={items.length === 0}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-pixel flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export</span>
              </button>

              {items.length > 0 && !confirmClearAll && (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}

              {items.length > 0 && confirmClearAll && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-600 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase cursor-pointer"
                  >
                    Confirm Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredItems.length > pageSize && (
            <ConsolePaginationBar
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filteredItems.length}
              pageSize={pageSize}
            />
          )}

          {/* List View */}
          <div className="space-y-2.5">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Wand2 className="w-6 h-6" />
                </div>
                <h3 className="font-arcade text-sm font-bold text-slate-300 uppercase">
                  No untranslated items recorded yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md font-retro leading-relaxed">
                  Activate the <strong>Magic Inspector</strong> button above, then tap any text in the game,
                  or use the <strong>Add Text</strong> tab to log phrases that need translation.
                </p>
              </div>
            ) : (
              paginatedItems.map((item, idx) => {
                const index = (safePage - 1) * pageSize + idx;
                return (
                  <div
                    key={item.id}
                    className="bg-slate-950/90 border border-slate-800 hover:border-amber-400/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-sm"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-pixel font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          #{index + 1}
                        </span>
                        <span className="text-[10px] font-pixel font-black px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
                          {item.screenContext}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Lang: {item.activeLanguage}
                        </span>
                        {item.suggestedKey && (
                          <span className="text-[10px] font-mono bg-slate-900 text-amber-400/90 px-1.5 py-0.5 border border-slate-800 rounded break-all">
                            Key: {item.suggestedKey}
                          </span>
                        )}
                      </div>

                      <div className="font-sans text-sm font-bold text-white leading-snug break-words">
                        "{item.originalText}"
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-400 italic">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(item.originalText);
                          showToast(`Copied: "${item.originalText}"`);
                        }}
                        className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-pixel rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>Copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl cursor-pointer transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MANUAL ADD FORM */}
      {activeTab === 'manual_add' && (
        <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="font-arcade text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Manually Record Untranslated Text</span>
              </h3>
              <p className="text-xs text-slate-400 font-retro">
                Found a phrase, popup message, or card description that remains in English? Enter it here to add it to your exportable audit list.
              </p>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4 max-w-2xl font-pixel">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Screen / Location:
                </label>
                <select
                  value={manualScreen}
                  onChange={(e) => setManualScreen(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Wonderkid Profile Creator">Wonderkid Profile Creator</option>
                  <option value="Player Development Panel">Player Development Panel</option>
                  <option value="Card Description">Card Description</option>
                  <option value="Career Hub">Career Hub</option>
                  <option value="Youth Season Dashboard">Youth Season Dashboard</option>
                  <option value="Match Day / Simulation">Match Day / Simulation</option>
                  <option value="Trophy Cabinet">Trophy Cabinet</option>
                  <option value="Contract / Agent Offer">Contract / Agent Offer</option>
                  <option value="Store / Champion Shop">Store / Champion Shop</option>
                  <option value="General Popup / Alert">General Popup / Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Exact Text Appearing in English:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Select your primary kicking foot. Weak foot begins at 0 ★."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Optional Notes / Desired Translation:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Needs translation into Spanish (es-ES and es-AR)"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-arcade font-black text-xs uppercase tracking-wider pixel-bevel-gold rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
              >
                Add to Audit List
              </button>
            </form>
          </div>
        )}

        {/* TAB CONTENT 3: CANONICAL DICTIONARY VERIFIER */}
        {activeTab === 'canonical_check' && (
          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="font-arcade text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Canonical Vocabulary Consistency Check</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                DrawStar enforces that attributes, perks, positions, club names, managers, and trophy names
                are tied to canonical identifiers so translations and editor changes stay synchronized.
              </p>
            </div>

            <div className="max-w-xl space-y-3 font-pixel">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Test Any Term (e.g. "finishing", "Striker", "hawk", "Blancos CF", "Ballon d'Or"):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter stat, position, perk, club, manager..."
                    value={canonicalTestQuery}
                    onChange={(e) => setCanonicalTestQuery(e.target.value)}
                    className="flex-1 min-h-[44px] bg-slate-900 border-2 border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 font-sans"
                  />
                  {canonicalTestQuery && (
                    <button
                      type="button"
                      onClick={() => setCanonicalTestQuery('')}
                      className="min-h-[44px] px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {canonicalTestQuery.trim() && (
                <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="text-amber-400 font-bold uppercase text-xs border-b border-slate-800 pb-1.5">
                    Canonical Resolver Output:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Position Resolution:</span>
                      <span className="font-mono text-emerald-300 font-bold break-words">
                        {getCanonicalPosition(canonicalTestQuery) || 'Not matched'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Stat Resolution:</span>
                      <span className="font-mono text-emerald-300 font-bold break-words">
                        {getCanonicalStat(canonicalTestQuery) || 'Not matched'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Perk Resolution:</span>
                      <span className="font-mono text-emerald-300 font-bold break-words">
                        {getCanonicalPerk(canonicalTestQuery) || 'Not matched'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Club Name:</span>
                      <span className="font-mono text-emerald-300 font-bold break-words">
                        {getCanonicalClubName(canonicalTestQuery)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Manager Name:</span>
                      <span className="font-mono text-emerald-300 font-bold break-words">
                        {getCanonicalManagerName(canonicalTestQuery)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Trophy Name:</span>
                      <span className="font-mono text-emerald-300 font-bold break-words">
                        {getCanonicalTrophyName(canonicalTestQuery)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </ConsoleModalShell>
  );
};
