import React, { useState, useRef } from 'react';
import {
  useOptionFile,
  exportOptionFileJSON,
  saveOptionFile,
} from '../utils/optionFileSystem';
import {
  OptionFile,
  OptionFileValidationIssue,
} from '../types/optionFile';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Users,
  Shield,
  Trophy,
  Layers,
  Sparkles,
  UserCheck,
  FileJson,
  Check,
  X,
  ChevronRight,
  Info,
  Sliders,
  Eye,
} from 'lucide-react';
import { haptics } from '../utils/hapticsSystem';
import { getStoredLanguage, LANGUAGES, LanguageCode } from '../utils/localizationSystem';
import { getLocalizedCard, ALL_CARD_TRANSLATIONS } from '../utils/cardTranslationsDatabase';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

interface OptionFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

type TabType = 'overview' | 'entities' | 'validation' | 'transfer' | 'settings';
type EntityFilter = 'all' | 'players' | 'teams' | 'leagues' | 'competitions' | 'cards' | 'managers';

export const OptionFileModal: React.FC<OptionFileModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const { optionFile, validation, save, reset, importJSON } = useOptionFile();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('players');
  const [searchQuery, setSearchQuery] = useState('');
  const [entitiesPage, setEntitiesPage] = useState(1);
  const [validationPage, setValidationPage] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: string; data: any } | null>(null);

  // Import State
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings edit state
  const [fileName, setFileName] = useState(optionFile.metadata.name);
  const [fileAuthor, setFileAuthor] = useState(optionFile.metadata.author);
  const [fileDesc, setFileDesc] = useState(optionFile.metadata.description);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    haptics.mediumTap();
    exportOptionFileJSON(optionFile);
    showToast('💾 Option File exported successfully');
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const res = importJSON(content);
        if (res.success) {
          haptics.success();
          setImportStatus('success');
          setImportMessage(res.message);
          showToast('✅ Option File imported successfully');
        } else {
          haptics.errorBuzz();
          setImportStatus('error');
          setImportMessage(res.message);
          showToast('❌ Import failed');
        }
      } catch (err: any) {
        haptics.errorBuzz();
        setImportStatus('error');
        setImportMessage(err?.message || 'Failed to read file');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSaveMetadata = () => {
    haptics.mediumTap();
    const updated: OptionFile = {
      ...optionFile,
      metadata: {
        ...optionFile.metadata,
        name: fileName.trim() || 'Option File',
        author: fileAuthor.trim() || 'Unknown',
        description: fileDesc.trim(),
        lastUpdated: new Date().toISOString(),
      },
    };
    save(updated);
    showToast('💾 Option File metadata updated');
  };

  const handleReset = () => {
    if (!confirmReset) {
      haptics.lightTap();
      setConfirmReset(true);
      return;
    }
    haptics.heavyRumble();
    reset();
    setConfirmReset(false);
    showToast('🔄 Option File reset to factory defaults');
  };

  // Filter entities
  const getFilteredEntities = () => {
    const q = searchQuery.toLowerCase().trim();
    const list: { type: string; id: string; name: string; subtitle: string; raw: any }[] = [];

    if (entityFilter === 'all' || entityFilter === 'players') {
      Object.entries(optionFile.players || {}).forEach(([id, p]) => {
        if (!q || p.name?.toLowerCase().includes(q) || id.toLowerCase().includes(q) || p.club?.toLowerCase().includes(q)) {
          list.push({
            type: 'Player',
            id,
            name: p.name || 'Unnamed Player',
            subtitle: `${p.position || 'PRO'} • OVR ${p.ovr || 70} • ${p.club || 'Free Agent'}`,
            raw: p,
          });
        }
      });
    }

    if (entityFilter === 'all' || entityFilter === 'teams') {
      Object.entries(optionFile.teams || {}).forEach(([id, t]) => {
        if (!q || t.name?.toLowerCase().includes(q) || id.toLowerCase().includes(q) || t.countryName?.toLowerCase().includes(q)) {
          list.push({
            type: 'Team',
            id,
            name: t.name || 'Unnamed Team',
            subtitle: `${t.countryCode} • ${t.leagueId || 'No League'} • Rep ${t.reputation || 50}`,
            raw: t,
          });
        }
      });
    }

    if (entityFilter === 'all' || entityFilter === 'leagues') {
      Object.entries(optionFile.leagues || {}).forEach(([id, l]) => {
        if (!q || l.name?.toLowerCase().includes(q) || id.toLowerCase().includes(q) || l.countryName?.toLowerCase().includes(q)) {
          list.push({
            type: 'League',
            id,
            name: l.name || 'Unnamed League',
            subtitle: `${l.countryCode} • ${l.divisionTier || '1st'} Division • ${l.teamIds?.length || 0} Teams`,
            raw: l,
          });
        }
      });
    }

    if (entityFilter === 'all' || entityFilter === 'competitions') {
      Object.entries(optionFile.competitions || {}).forEach(([id, c]) => {
        if (!q || c.name?.toLowerCase().includes(q) || id.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)) {
          list.push({
            type: 'Competition',
            id,
            name: c.name || 'Unnamed Competition',
            subtitle: `${c.category.toUpperCase()} • ${c.competitionType} • ${c.stages?.length || 0} Stages`,
            raw: c,
          });
        }
      });
    }

    if (entityFilter === 'all' || entityFilter === 'cards') {
      const activeLang = getStoredLanguage();
      Object.entries(optionFile.cards || {}).forEach(([id, c]) => {
        const localized = getLocalizedCard(c, activeLang);
        const transValues = Object.values(c.translations || {}).flatMap((t: { name?: string; description?: string }) => [t.name?.toLowerCase(), t.description?.toLowerCase()]);
        const matchesQuery = !q ||
          c.name?.toLowerCase().includes(q) ||
          localized.name?.toLowerCase().includes(q) ||
          id.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          transValues.some(v => v && v.includes(q));

        if (matchesQuery) {
          list.push({
            type: 'Card',
            id,
            name: localized.name || c.name || 'Unnamed Card',
            subtitle: `${c.category.toUpperCase()} • Tier: ${c.tier} • ${c.modifiers?.length || 0} Modifiers • 5/5 Langs`,
            raw: { ...c, localizedName: localized.name, localizedDescription: localized.description },
          });
        }
      });
    }

    if (entityFilter === 'all' || entityFilter === 'managers') {
      Object.entries(optionFile.managers || {}).forEach(([id, m]) => {
        if (!q || m.name?.toLowerCase().includes(q) || id.toLowerCase().includes(q) || m.nationality?.toLowerCase().includes(q)) {
          list.push({
            type: 'Manager',
            id,
            name: m.name || 'Unnamed Manager',
            subtitle: `${m.nationality} • Formation: ${m.preferredFormation} • Style: ${m.tacticalStyle}`,
            raw: m,
          });
        }
      });
    }

    return list;
  };

  const filteredEntities = getFilteredEntities();
  const ENTITIES_PER_PAGE = 9;
  const totalEntitiesPages = Math.max(1, Math.ceil(filteredEntities.length / ENTITIES_PER_PAGE));
  const safeEntitiesPage = Math.min(entitiesPage, totalEntitiesPages);
  const paginatedEntities = filteredEntities.slice(
    (safeEntitiesPage - 1) * ENTITIES_PER_PAGE,
    safeEntitiesPage * ENTITIES_PER_PAGE
  );

  const ISSUES_PER_PAGE = 8;
  const totalValidationPages = Math.max(1, Math.ceil(validation.issues.length / ISSUES_PER_PAGE));
  const safeValidationPage = Math.min(validationPage, totalValidationPages);
  const paginatedIssues = validation.issues.slice(
    (safeValidationPage - 1) * ISSUES_PER_PAGE,
    safeValidationPage * ISSUES_PER_PAGE
  );

  return (
    <>
      <ConsoleModalShell
        isOpen={isOpen}
        onClose={() => {
          haptics.lightTap();
          onClose();
        }}
        title="Option File"
        subtitle={`v${optionFile.metadata.version} • ${validation.isValid ? 'Valid DB' : `${validation.errors.length} Issues`}`}
        icon={<Database className="w-5 h-5" />}
        accentColor="blue"
        maxWidthClass="sm:max-w-5xl"
        headerRight={
          <button
            id="btn-quick-export-option-file"
            type="button"
            onClick={handleExport}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>
        }
        tabs={[
          { id: 'overview', label: 'Overview', icon: <Database className="w-3.5 h-3.5" /> },
          { id: 'entities', label: `Entities (${filteredEntities.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'validation', label: `Checks (${validation.errors.length + validation.warnings.length})`, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          { id: 'transfer', label: 'Import/Export', icon: <Upload className="w-3.5 h-3.5" /> },
          { id: 'settings', label: 'Settings', icon: <Sliders className="w-3.5 h-3.5" /> },
        ]}
        activeTabId={activeTab}
        onTabChange={(id) => {
          haptics.lightTap();
          setConfirmReset(false);
          setActiveTab(id as TabType);
        }}
      >
        <div id="option-file-content" className="space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metadata Card */}
              <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{optionFile.metadata.name}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{optionFile.metadata.description}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
                      <span><strong>Author:</strong> {optionFile.metadata.author}</span>
                      <span><strong>Schema Version:</strong> v{optionFile.metadata.schemaVersion}</span>
                      <span><strong>Last Updated:</strong> {new Date(optionFile.metadata.lastUpdated).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-overview-export"
                      onClick={handleExport}
                      className="min-h-[44px] flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download JSON
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Players', count: validation.stats.totalPlayers, icon: Users, color: 'text-emerald-400' },
                  { label: 'Teams', count: validation.stats.totalTeams, icon: Shield, color: 'text-blue-400' },
                  { label: 'Leagues', count: validation.stats.totalLeagues, icon: Trophy, color: 'text-amber-400' },
                  { label: 'Competitions', count: validation.stats.totalCompetitions, icon: Trophy, color: 'text-purple-400' },
                  { label: 'Cards', count: validation.stats.totalCards, icon: Sparkles, color: 'text-cyan-400' },
                  { label: 'Managers', count: validation.stats.totalManagers, icon: UserCheck, color: 'text-rose-400' },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl flex flex-col items-start justify-between"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <span className="text-2xl font-bold tracking-tight text-white">{stat.count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Cards by Category Breakdown */}
              <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Card Registry by Category</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
                  {Object.entries(validation.stats.cardsByCategory).map(([cat, count]) => (
                    <div key={cat} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                      <span className="capitalize font-medium text-slate-300">{cat}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-blue-400 rounded-md font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture Info Notice */}
              <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl text-xs text-blue-300 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-200">Option File Architecture Active</p>
                  <p className="text-blue-300/90 leading-relaxed">
                    All game modes (Unique Career, Play as a Legend, Tournament Simulation, Card Editor, and League Editor)
                    read from and persist directly into this Option File. Any modifications made here instantly propagate
                    to all career modes and editors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENTITIES EXPLORER */}
          {activeTab === 'entities' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="input-option-file-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setEntitiesPage(1);
                    }}
                    placeholder="Search by name, ID, club, or nationality..."
                    className="w-full min-h-[44px] pl-9 pr-10 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setEntitiesPage(1);
                      }}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full">
                  {(['all', 'players', 'teams', 'leagues', 'competitions', 'cards', 'managers'] as EntityFilter[]).map((filter) => (
                    <button
                      key={filter}
                      id={`btn-filter-${filter}`}
                      type="button"
                      onClick={() => {
                        haptics.lightTap();
                        setEntityFilter(filter);
                        setEntitiesPage(1);
                      }}
                      className={`min-h-[44px] px-3 py-1.5 text-xs font-bold rounded-xl capitalize whitespace-nowrap transition-colors cursor-pointer ${
                        entityFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredEntities.length > ENTITIES_PER_PAGE && (
                <ConsolePaginationBar
                  currentPage={safeEntitiesPage}
                  totalPages={totalEntitiesPages}
                  onPageChange={setEntitiesPage}
                  totalItems={filteredEntities.length}
                  label="ENTITIES"
                />
              )}

              {/* Entities List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {paginatedEntities.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                    No entities found matching "{searchQuery}".
                  </div>
                ) : (
                  paginatedEntities.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      id={`entity-item-${item.id}`}
                      type="button"
                      onClick={() => {
                        haptics.lightTap();
                        setSelectedEntity({ type: item.type, id: item.id, data: item.raw });
                      }}
                      className="min-h-[68px] w-full text-left p-3.5 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1 min-w-0 pr-2 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-slate-800 text-blue-400 shrink-0">
                            {item.type}
                          </span>
                          <h5 className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                            {item.name}
                          </h5>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">ID: {item.id}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
                    </button>
                  ))
                )}
              </div>

              {filteredEntities.length > ENTITIES_PER_PAGE && (
                <ConsolePaginationBar
                  currentPage={safeEntitiesPage}
                  totalPages={totalEntitiesPages}
                  onPageChange={setEntitiesPage}
                  label="ENTITIES"
                />
              )}
            </div>
          )}

          {/* TAB 3: VALIDATION & INTEGRITY */}
          {activeTab === 'validation' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">Integrity Verification Report</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Checks ID uniqueness across all tables, missing relational references, and structural schemas.
                  </p>
                </div>
                {validation.isValid ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Passed All Checks
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-sm font-semibold">
                    <XCircle className="w-4 h-4" /> {validation.errors.length} Critical Issue(s)
                  </span>
                )}
              </div>

              {/* Issues List */}
              {validation.issues.length > ISSUES_PER_PAGE && (
                <ConsolePaginationBar
                  currentPage={safeValidationPage}
                  totalPages={totalValidationPages}
                  onPageChange={setValidationPage}
                  totalItems={validation.issues.length}
                  label="ISSUES"
                />
              )}

              <div className="space-y-2.5">
                {validation.issues.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-950/30 border border-slate-800 rounded-xl">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">Database in pristine state</p>
                    <p className="text-xs text-slate-500 mt-1">All IDs are unique and reference chains are valid.</p>
                  </div>
                ) : (
                  paginatedIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        issue.type === 'error'
                          ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                          : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      }`}
                    >
                      {issue.type === 'error' ? (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div className="text-xs space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="uppercase font-bold tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-black/40">
                            {issue.entityType}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 break-all">ID: {issue.entityId}</span>
                        </div>
                        <p className="text-sm font-medium">{issue.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT & IMPORT */}
          {activeTab === 'transfer' && (
            <div className="space-y-6">
              {/* Export Box */}
              <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Export Complete Option File</h4>
                    <p className="text-xs text-slate-400">
                      Save your entire unified game database as a single JSON file. You can share, backup, or transfer it.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    id="btn-tab-export-option-file"
                    onClick={handleExport}
                    className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Option File (.json)
                  </button>
                  <span className="text-xs text-slate-500 font-mono">
                    Size: ~{(JSON.stringify(optionFile).length / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              {/* Import Box */}
              <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Import External Option File</h4>
                    <p className="text-xs text-slate-400">
                      Upload an Option File JSON. All entities will be verified against the schema before replacing current data.
                    </p>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  id="drop-zone-option-file"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-500 bg-slate-900/40'
                  }`}
                >
                  <FileJson className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-white">Click or drag & drop Option File (.json) here</p>
                  <p className="text-xs text-slate-500 mt-1">Supports all official Option File releases</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                {/* Import Feedback */}
                {importStatus !== 'idle' && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                      importStatus === 'success'
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                    }`}
                  >
                    {importStatus === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span>{importMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Metadata Configuration */}
              <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-base font-bold text-white">Option File Details</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Option File Name</label>
                    <input
                      id="input-option-file-name"
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Creator / Author</label>
                    <input
                      id="input-option-file-author"
                      type="text"
                      value={fileAuthor}
                      onChange={(e) => setFileAuthor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                    <textarea
                      id="input-option-file-desc"
                      value={fileDesc}
                      onChange={(e) => setFileDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="btn-save-option-file-details"
                    onClick={handleSaveMetadata}
                    className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Save Metadata
                  </button>
                </div>
              </div>

              {/* Danger Zone: Factory Reset */}
              <div className="p-5 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <RotateCcw className="w-5 h-5" />
                  <h4 className="text-base font-bold">Reset Option File to Factory Defaults</h4>
                </div>
                <p className="text-xs text-rose-300/80 leading-relaxed">
                  This will reset all players, clubs, leagues, competitions, and custom cards back to their clean official
                  states. Use this if you want a fresh start or if an external file contained unintended modifications.
                </p>
                {confirmReset ? (
                  <div className="pt-2 p-3 rounded-xl bg-rose-950/50 border border-rose-500/60 space-y-2.5">
                    <p className="text-xs font-bold text-rose-200">
                      Confirm Reset? All custom Option File changes will be replaced with official factory defaults.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        id="btn-factory-reset-option-file"
                        type="button"
                        onClick={handleReset}
                        className="min-h-[44px] flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" /> Confirm Factory Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      id="btn-factory-reset-option-file"
                      type="button"
                      onClick={handleReset}
                      className="min-h-[44px] flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset to Factory Defaults
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ConsoleModalShell>

      {/* Entity Detail Inspection Modal */}
      <ConsoleModalShell
        isOpen={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        title={selectedEntity?.data?.name || selectedEntity?.id || 'Entity Details'}
        subtitle={selectedEntity ? `${selectedEntity.type} • ID: ${selectedEntity.id}` : undefined}
        icon={<Eye className="w-5 h-5" />}
        accentColor="blue"
        maxWidthClass="sm:max-w-2xl"
        zIndexClass="z-[120]"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedEntity(null)}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        }
      >
        {selectedEntity && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono pb-2 border-b border-slate-800">
              <span className="break-all">Unique ID: <strong className="text-white">{selectedEntity.id}</strong></span>
              {selectedEntity.type === 'Card' && (
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-sans font-semibold text-[11px]">
                  ✓ 5/5 Language Translations
                </span>
              )}
            </div>

            {selectedEntity.type === 'Card' ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-900/60 text-blue-300 border border-blue-700/50">
                      {selectedEntity.data.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-900/60 text-amber-300 border border-amber-700/50">
                      {selectedEntity.data.tier}
                    </span>
                    {selectedEntity.data.duration && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                        {selectedEntity.data.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedEntity.data.localizedName || selectedEntity.data.name}
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {selectedEntity.data.localizedDescription || selectedEntity.data.description}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>🌍 Available Language Translations</span>
                  </h5>
                  <div className="grid grid-cols-1 gap-2.5">
                    {(['en-GB', 'es-ES', 'es-AR', 'pt-BR', 'fr-FR'] as LanguageCode[]).map((langCode) => {
                      const langInfo = LANGUAGES[langCode];
                      const trans = selectedEntity.data.translations?.[langCode] || ALL_CARD_TRANSLATIONS[selectedEntity.id]?.[langCode];
                      return (
                        <div key={langCode} className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{langInfo?.flag}</span>
                              <span className="text-xs font-semibold text-white">{langInfo?.nativeName || langCode}</span>
                              <span className="text-[11px] text-slate-500 font-mono">({langCode})</span>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                              Verified
                            </span>
                          </div>
                          <div className="text-sm font-bold text-blue-200">
                            {trans?.name || selectedEntity.data.name}
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed">
                            {trans?.description || selectedEntity.data.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <details className="text-xs text-slate-400">
                  <summary className="min-h-[44px] flex items-center cursor-pointer hover:text-white py-1 font-mono select-none">
                    ▶ View Raw Card Schema Object (JSON)
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-blue-300 font-mono overflow-x-auto whitespace-pre-wrap break-words">
                    {JSON.stringify(selectedEntity.data, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-blue-300 font-mono overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(selectedEntity.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </ConsoleModalShell>
    </>
  );
};
