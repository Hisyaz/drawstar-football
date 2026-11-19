import React, { useState, useMemo, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  Sparkles,
  ShoppingBag,
  Award,
  TrendingUp,
  Activity,
  GraduationCap,
  FileText,
  Globe,
  DollarSign,
  Heart,
  Flame,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  WIKI_TOPICS,
  isTutorialEnabled,
  setTutorialEnabled,
  resetSeenTutorials,
} from '../utils/tutorialSystem';
import {
  ConsoleModalShell,
  ConsolePaginationBar,
  ConsolePagedText,
} from './common/ConsolePager';

interface CareerTutorialWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Award,
  TrendingUp,
  Activity,
  GraduationCap,
  FileText,
  Globe,
  DollarSign,
  Sparkles,
  Heart,
  Flame,
  HelpCircle,
};

const MOBILE_TOPICS_PER_PAGE = 6;

export const CareerTutorialWikiModal: React.FC<CareerTutorialWikiModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'core' | 'development' | 'matches' | 'career' | 'economy'
  >('all');
  const [activeTopicId, setActiveTopicId] = useState<string>(WIKI_TOPICS[0].id);
  const [tutorialActive, setTutorialActive] = useState<boolean>(() => isTutorialEnabled());
  const [mobileView, setMobileView] = useState<'topics' | 'reader'>('topics');
  const [topicsPage, setTopicsPage] = useState<number>(1);

  const categories: {
    id: 'all' | 'core' | 'development' | 'matches' | 'career' | 'economy';
    labelKey: string;
    defaultLabel: string;
  }[] = [
    { id: 'all', labelKey: 'WIKI_CAT_ALL', defaultLabel: 'All Topics' },
    { id: 'core', labelKey: 'WIKI_CAT_CORE', defaultLabel: 'Cards & Store' },
    { id: 'development', labelKey: 'WIKI_CAT_DEV', defaultLabel: 'Development' },
    { id: 'matches', labelKey: 'WIKI_CAT_MATCHES', defaultLabel: 'Matchdays' },
    { id: 'career', labelKey: 'WIKI_CAT_CAREER', defaultLabel: 'Career & Club' },
    { id: 'economy', labelKey: 'WIKI_CAT_ECONOMY', defaultLabel: 'Economy' },
  ];

  const filteredTopics = useMemo(() => {
    return WIKI_TOPICS.filter((topic) => {
      if (selectedCategory !== 'all' && topic.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = (t(topic.titleKey) || '').toLowerCase();
        const desc = (t(topic.descriptionKey) || '').toLowerCase();
        const tag = (t(topic.tagKey) || '').toLowerCase();
        return title.includes(query) || desc.includes(query) || tag.includes(query);
      }
      return true;
    });
  }, [selectedCategory, searchQuery, t]);

  useEffect(() => {
    setTopicsPage(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setMobileView('topics');
    }
  }, [isOpen]);

  const totalTopicPages = Math.max(1, Math.ceil(filteredTopics.length / MOBILE_TOPICS_PER_PAGE));
  const safeTopicsPage = Math.min(topicsPage, totalTopicPages);
  const mobilePagedTopics = filteredTopics.slice(
    (safeTopicsPage - 1) * MOBILE_TOPICS_PER_PAGE,
    safeTopicsPage * MOBILE_TOPICS_PER_PAGE
  );

  const activeTopic = useMemo(() => {
    return WIKI_TOPICS.find((top) => top.id === activeTopicId) || filteredTopics[0] || WIKI_TOPICS[0];
  }, [activeTopicId, filteredTopics]);

  if (!isOpen) return null;

  const handleToggleTutorial = () => {
    const next = !tutorialActive;
    setTutorialActive(next);
    setTutorialEnabled(next);
    showToast?.(
      next
        ? t('TUTORIAL_TOAST_ENABLED') || '✅ In-game tutorial explanations ENABLED.'
        : t('TUTORIAL_TOAST_DISABLED') || 'ℹ️ In-game tutorial explanations DISABLED.'
    );
  };

  const handleResetPrompts = () => {
    resetSeenTutorials();
    showToast?.(
      t('TUTORIAL_TOAST_RESET') ||
        '🔄 All introductory explanation prompts reset! They will appear on your next visits.'
    );
  };

  const TopicIcon = activeTopic ? (ICON_MAP[activeTopic.iconName] || BookOpen) : BookOpen;

  const activeDescription = activeTopic
    ? t(activeTopic.descriptionKey) || activeTopic.descriptionKey
    : '';
  const activeBullets = activeTopic
    ? activeTopic.bulletPointsKeys.map((ptKey) => t(ptKey) || ptKey)
    : [];

  return (
    <ConsoleModalShell
      id="career-tutorial-wiki-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={t('WIKI_HEADER_TITLE') || 'CAREER ENCYCLOPEDIA & WIKI'}
      subtitle={t('WIKI_HEADER_SUBTITLE') || 'Complete guide and mechanics encyclopedia for DrawStar Football Career.'}
      badge={t('WIKI_BADGE_GUIDE') || 'GAME MANUAL'}
      icon={<BookOpen className="w-5 h-5 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-5xl"
      bodyClassName="flex flex-col overflow-hidden"
      headerRight={
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTutorial}
            className={`min-h-[44px] px-3 py-1.5 rounded-lg border text-xs font-arcade font-bold uppercase cursor-pointer transition-all ${
              tutorialActive
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}
          >
            {t('TUTORIAL_HINTS_LABEL') || 'Hints'}: {tutorialActive ? (t('TUTORIAL_STATE_ON') || 'ON') : (t('TUTORIAL_STATE_OFF') || 'OFF')}
          </button>

          <button
            type="button"
            onClick={handleResetPrompts}
            className="min-h-[44px] px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-400 text-indigo-200 text-xs font-arcade uppercase font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Reset seen explanations"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('TUTORIAL_RESET_BTN') || 'Reset Prompts'}</span>
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs text-blue-200 font-mono truncate">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">
              {t('WIKI_BOTTOM_TIP') || 'All career features are saved automatically. You can review this encyclopedia anytime from the Career Menu.'}
            </span>
          </div>
          {mobileView === 'reader' ? (
            <button
              type="button"
              onClick={() => setMobileView('topics')}
              className="md:hidden min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-arcade font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>All Topics</span>
            </button>
          ) : (
            <div className="md:hidden text-xs font-mono text-slate-400">
              {filteredTopics.length} {filteredTopics.length === 1 ? 'Topic' : 'Topics'}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-black text-xs uppercase cursor-pointer ml-auto"
          >
            {t('CLOSE') || 'CLOSE'}
          </button>
        </div>
      }
    >
      {/* MOBILE VIEW 1: TOPIC DIRECTORY WITH PAGINATION */}
      {mobileView === 'topics' && (
        <div className="md:hidden flex-1 overflow-y-auto p-3 space-y-3">
          {/* Mobile Tutorial Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleToggleTutorial}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-arcade font-bold uppercase cursor-pointer transition-all ${
                tutorialActive
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                  : 'bg-slate-950 text-slate-300 border-slate-700'
              }`}
            >
              {t('TUTORIAL_HINTS_LABEL') || 'Hints'}: {tutorialActive ? (t('TUTORIAL_STATE_ON') || 'ON') : (t('TUTORIAL_STATE_OFF') || 'OFF')}
            </button>
            <button
              type="button"
              onClick={handleResetPrompts}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-400 text-indigo-200 text-xs font-arcade uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t('TUTORIAL_RESET_BTN') || 'Reset Prompts'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('WIKI_SEARCH_PLACEHOLDER') || 'Search topics...'}
              className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-sans placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Wrapped Category Filter Buttons (Zero Horizontal Scroll) */}
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-arcade uppercase cursor-pointer border transition-colors truncate ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                {t(cat.labelKey) || cat.defaultLabel}
              </button>
            ))}
          </div>

          {totalTopicPages > 1 && (
            <ConsolePaginationBar
              currentPage={safeTopicsPage}
              totalPages={totalTopicPages}
              onPageChange={setTopicsPage}
              totalItems={filteredTopics.length}
              pageSize={MOBILE_TOPICS_PER_PAGE}
              label="TOPICS"
            />
          )}

          {mobilePagedTopics.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm font-sans border border-dashed border-slate-800 rounded-xl">
              {t('WIKI_NO_TOPICS_FOUND') || 'No topics matched your search.'}
            </div>
          ) : (
            <div className="space-y-2">
              {mobilePagedTopics.map((topic) => {
                const Icon = ICON_MAP[topic.iconName] || BookOpen;
                const isSelected = activeTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      setActiveTopicId(topic.id);
                      setMobileView('reader');
                    }}
                    className={`w-full min-h-[56px] p-3 text-left border rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 text-amber-100'
                        : 'bg-slate-950/90 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-900 text-amber-300 border-slate-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-arcade font-black uppercase truncate">
                          {t(topic.titleKey) || topic.titleKey}
                        </div>
                        <div className="text-xs font-mono text-slate-400 truncate mt-0.5">
                          {t(topic.tagKey) || topic.tagKey}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MOBILE VIEW 2: FULL-WIDTH LEGIBLE PAGED READER */}
      {mobileView === 'reader' && activeTopic && (
        <div className="md:hidden flex-1 overflow-y-auto p-3.5 space-y-4">
          <div className="flex items-center gap-3 border-b border-amber-500/30 pb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-950 border-2 border-amber-400 text-amber-300 flex items-center justify-center shrink-0">
              <TopicIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-bold uppercase text-amber-300">
                {t(activeTopic.tagKey) || activeTopic.tagKey}
              </div>
              <h3 className="text-base font-arcade font-black uppercase text-white tracking-wide leading-tight mt-0.5">
                {t(activeTopic.titleKey) || activeTopic.titleKey}
              </h3>
            </div>
          </div>

          <ConsolePagedText
            resetKey={activeTopic.id}
            paragraphs={[activeDescription]}
            bullets={activeBullets}
            maxCharsPerPage={360}
            maxBulletsPerPage={3}
            textSizeClass="text-sm sm:text-base"
          />
        </div>
      )}

      {/* DESKTOP VIEW: 2-COLUMN SIDEBAR + FULL ARTICLE */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        {/* SEARCH BAR & CATEGORY TABS */}
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-arcade uppercase cursor-pointer border transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                {t(cat.labelKey) || cat.defaultLabel}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('WIKI_SEARCH_PLACEHOLDER') || 'Search topics...'}
              className="w-full min-h-[44px] pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* LEFT SIDEBAR: TOPIC LIST */}
          <div className="w-72 lg:w-80 border-r border-slate-800 bg-slate-950/60 overflow-y-auto custom-scrollbar shrink-0 p-2.5 space-y-1.5">
            {filteredTopics.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs font-mono">
                {t('WIKI_NO_TOPICS_FOUND') || 'No topics matched your search.'}
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const Icon = ICON_MAP[topic.iconName] || BookOpen;
                const isSelected = activeTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`w-full min-h-[48px] p-2.5 text-left border rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-md'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-arcade font-black uppercase truncate">
                          {t(topic.titleKey) || topic.titleKey}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase truncate">
                          {t(topic.tagKey) || topic.tagKey}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* RIGHT PANEL: FULL ARTICLE CONTENT */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/40">
            {activeTopic ? (
              <div className="space-y-5 max-w-3xl">
                <div className="border-b border-amber-500/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-950 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-lg shrink-0">
                      <TopicIcon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                        {t(activeTopic.tagKey) || activeTopic.tagKey}
                      </span>
                      <h3 className="text-xl font-arcade font-black uppercase text-white tracking-wide mt-0.5">
                        {t(activeTopic.titleKey) || activeTopic.titleKey}
                      </h3>
                    </div>
                  </div>
                </div>

                <ConsolePagedText
                  resetKey={activeTopic.id}
                  paragraphs={[activeDescription]}
                  bullets={activeBullets}
                  maxCharsPerPage={650}
                  maxBulletsPerPage={5}
                  textSizeClass="text-sm sm:text-base"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ConsoleModalShell>
  );
};
