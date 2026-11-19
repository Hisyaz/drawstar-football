import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface ConsolePageTab {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ConsoleModalShellProps {
  isOpen?: boolean;
  onClose?: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  tabs?: ConsolePageTab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  maxWidthClass?: string;
  accentColor?: 'amber' | 'emerald' | 'cyan' | 'sky' | 'rose' | 'purple' | 'blue';
  footer?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  closeDisabled?: boolean;
  showCloseButton?: boolean;
  zIndexClass?: string;
  bodyClassName?: string;
}

const ACCENT_MAP: Record<
  NonNullable<ConsoleModalShellProps['accentColor']>,
  { border: string; headerBorder: string; badge: string; tabActive: string; title: string }
> = {
  amber: {
    border: 'sm:border-amber-500/80',
    headerBorder: 'border-amber-500/50',
    badge: 'bg-amber-950 text-amber-300 border-amber-500/70',
    tabActive: 'bg-amber-500 text-slate-950 border-amber-300 font-black',
    title: 'text-amber-300',
  },
  emerald: {
    border: 'sm:border-emerald-500/80',
    headerBorder: 'border-emerald-500/50',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/70',
    tabActive: 'bg-emerald-500 text-slate-950 border-emerald-300 font-black',
    title: 'text-emerald-300',
  },
  cyan: {
    border: 'sm:border-cyan-500/80',
    headerBorder: 'border-cyan-500/50',
    badge: 'bg-cyan-950 text-cyan-300 border-cyan-500/70',
    tabActive: 'bg-cyan-500 text-slate-950 border-cyan-300 font-black',
    title: 'text-cyan-300',
  },
  sky: {
    border: 'sm:border-sky-500/80',
    headerBorder: 'border-sky-500/50',
    badge: 'bg-sky-950 text-sky-300 border-sky-500/70',
    tabActive: 'bg-sky-500 text-slate-950 border-sky-300 font-black',
    title: 'text-sky-300',
  },
  rose: {
    border: 'sm:border-rose-500/80',
    headerBorder: 'border-rose-500/50',
    badge: 'bg-rose-950 text-rose-300 border-rose-500/70',
    tabActive: 'bg-rose-500 text-white border-rose-300 font-black',
    title: 'text-rose-300',
  },
  purple: {
    border: 'sm:border-purple-500/80',
    headerBorder: 'border-purple-500/50',
    badge: 'bg-purple-950 text-purple-300 border-purple-500/70',
    tabActive: 'bg-purple-500 text-white border-purple-300 font-black',
    title: 'text-purple-300',
  },
  blue: {
    border: 'sm:border-blue-500/80',
    headerBorder: 'border-blue-500/50',
    badge: 'bg-blue-950 text-blue-300 border-blue-500/70',
    tabActive: 'bg-blue-500 text-white border-blue-300 font-black',
    title: 'text-blue-300',
  },
};

/**
 * Full-screen mobile / console-framed dialog container.
 * Guarantees 0 horizontal overflow and >=44px close & tab touch targets.
 */
export const ConsoleModalShell: React.FC<ConsoleModalShellProps> = ({
  isOpen = true,
  onClose,
  title,
  subtitle,
  badge,
  icon,
  headerRight,
  tabs,
  activeTabId,
  onTabChange,
  maxWidthClass = 'sm:max-w-5xl',
  accentColor = 'amber',
  footer,
  children,
  id,
  closeDisabled = false,
  showCloseButton = true,
  zIndexClass = 'z-50',
  bodyClassName = '',
}) => {
  if (!isOpen) return null;
  const theme = ACCENT_MAP[accentColor];

  const activeTabIndex = tabs ? Math.max(0, tabs.findIndex((tb) => tb.id === activeTabId)) : 0;

  return (
    <div
      id={id ? `${id}-backdrop` : undefined}
      className={`fixed inset-0 ${zIndexClass} bg-slate-950/95 sm:bg-black/85 sm:backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 select-none`}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose && !closeDisabled) onClose();
      }}
    >
      <div
        id={id}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full h-[100dvh] sm:h-[92dvh] sm:max-h-[860px] ${maxWidthClass} bg-slate-900 border-0 sm:border-2 ${theme.border} rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100`}
      >
        {/* Top Bar: strict min-w-0 layout so Close button can never clip right */}
        <header
          className={`px-3 py-2.5 sm:px-5 sm:py-3.5 bg-slate-950 border-b-2 ${theme.headerBorder} flex items-center justify-between gap-2 shrink-0 min-w-0`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {icon && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <h2
                  className={`font-arcade font-black text-sm sm:text-lg uppercase tracking-wide truncate ${theme.title}`}
                >
                  {title}
                </h2>
                {badge && (
                  <span
                    className={`hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase border shrink-0 ${theme.badge}`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-300 font-sans truncate mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerRight}
            {showCloseButton && onClose && (
              <button
                type="button"
                disabled={closeDisabled}
                onClick={onClose}
                aria-label="Close"
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border transition-all cursor-pointer active:scale-95 shrink-0 ${
                  closeDisabled
                    ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Console Page Tabs / Switcher Bar */}
        {tabs && tabs.length > 0 && onTabChange && (
          <nav
            aria-label="Console Pages"
            className="px-2.5 py-2 sm:px-4 bg-slate-950/90 border-b border-slate-800 shrink-0"
          >
            {/* Mobile Console Page Switcher when > 3 tabs OR multi-row crisp grid */}
            {tabs.length > 3 ? (
              <div className="flex sm:hidden items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prevIdx = (activeTabIndex - 1 + tabs.length) % tabs.length;
                    onTabChange(tabs[prevIdx].id);
                  }}
                  aria-label="Previous Page"
                  className="min-w-[44px] min-h-[44px] px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white cursor-pointer active:scale-95 shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0 text-center">
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    PAGE {activeTabIndex + 1} / {tabs.length}
                  </div>
                  <div className="font-arcade font-black text-xs text-white uppercase truncate">
                    {tabs[activeTabIndex]?.label}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (activeTabIndex + 1) % tabs.length;
                    onTabChange(tabs[nextIdx].id);
                  }}
                  aria-label="Next Page"
                  className="min-w-[44px] min-h-[44px] px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white cursor-pointer active:scale-95 shrink-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : null}

            <div
              className={`${
                tabs.length > 3 ? 'hidden sm:flex' : 'grid'
              } ${
                tabs.length === 2
                  ? 'grid-cols-2'
                  : tabs.length === 3
                  ? 'grid-cols-3'
                  : 'flex-wrap'
              } gap-1.5`}
            >
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={tab.disabled}
                    onClick={() => onTabChange(tab.id)}
                    className={`min-h-[44px] px-2.5 py-2 rounded-lg border text-xs font-arcade uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 truncate ${
                      tab.disabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                        : isActive
                        ? theme.tabActive
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span className="truncate">{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className="text-[10px] font-mono opacity-80 shrink-0">({tab.badge})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* Body Content */}
        <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain ${bodyClassName}`}>
          {children}
        </div>

        {/* Sticky Bottom Dock */}
        {footer && (
          <footer className="px-3 py-2.5 sm:px-5 sm:py-3 bg-slate-950 border-t-2 border-slate-800 shrink-0 safe-bottom">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

interface ConsolePaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  label?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Console-style page switcher bar with guaranteed >=44px touch hitboxes.
 */
export const ConsolePaginationBar: React.FC<ConsolePaginationBarProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  label = 'PAGE',
  compact = false,
  className = '',
}) => {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);

  const rangeText = useMemo(() => {
    if (totalItems === undefined || !pageSize) return null;
    if (totalItems === 0) return '0 items';
    const start = (safeCurrent - 1) * pageSize + 1;
    const end = Math.min(safeCurrent * pageSize, totalItems);
    return `${start}-${end} / ${totalItems}`;
  }, [totalItems, pageSize, safeCurrent]);

  return (
    <div
      className={`flex items-center justify-between gap-2 bg-slate-950/90 border border-slate-700/80 rounded-xl px-2 py-1.5 ${className}`}
    >
      <button
        type="button"
        disabled={safeCurrent <= 1}
        onClick={() => onPageChange(safeCurrent - 1)}
        className={`min-h-[44px] px-3 sm:px-4 rounded-lg border font-arcade text-xs uppercase font-bold flex items-center gap-1 transition-all shrink-0 ${
          safeCurrent <= 1
            ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white cursor-pointer active:scale-95'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        {!compact && <span>PREV</span>}
      </button>

      <div className="flex flex-col items-center justify-center min-w-0 px-1 text-center">
        <div className="font-arcade font-black text-xs sm:text-sm text-amber-300 tabular-nums whitespace-nowrap">
          {label} {safeCurrent} / {safeTotal}
        </div>
        {rangeText && (
          <div className="text-[11px] font-mono text-slate-400 tabular-nums whitespace-nowrap">
            {rangeText}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={safeCurrent >= safeTotal}
        onClick={() => onPageChange(safeCurrent + 1)}
        className={`min-h-[44px] px-3 sm:px-4 rounded-lg border font-arcade text-xs uppercase font-bold flex items-center gap-1 transition-all shrink-0 ${
          safeCurrent >= safeTotal
            ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            : 'bg-amber-500 hover:bg-amber-400 border-amber-300 text-slate-950 font-black cursor-pointer active:scale-95'
        }`}
      >
        {!compact && <span>NEXT</span>}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export interface ConsoleTextPageItem {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  node?: React.ReactNode;
}

interface ConsolePagedTextProps {
  heading?: string;
  pages?: ConsoleTextPageItem[];
  paragraphs?: string[];
  bullets?: string[];
  maxCharsPerPage?: number;
  maxBulletsPerPage?: number;
  className?: string;
  textSizeClass?: string;
  resetKey?: string | number;
}

/**
 * Full-width readable text reader that splits long prose & bullet lists into clean
 * console pages instead of cramming tiny fonts inside narrow bordered boxes.
 */
export const ConsolePagedText: React.FC<ConsolePagedTextProps> = ({
  heading,
  pages: explicitPages,
  paragraphs = [],
  bullets = [],
  maxCharsPerPage = 420,
  maxBulletsPerPage = 3,
  className = '',
  textSizeClass = 'text-sm sm:text-base',
  resetKey,
}) => {
  const [pageIdx, setPageIdx] = useState(0);

  useEffect(() => {
    setPageIdx(0);
  }, [resetKey]);

  const computedPages = useMemo<ConsoleTextPageItem[]>(() => {
    if (explicitPages && explicitPages.length > 0) return explicitPages;

    const result: ConsoleTextPageItem[] = [];

    // Chunk paragraphs if long
    let currentParas: string[] = [];
    let currentLen = 0;

    paragraphs.forEach((p) => {
      const clean = (p || '').trim();
      if (!clean) return;
      if (currentLen > 0 && currentLen + clean.length > maxCharsPerPage) {
        result.push({ paragraphs: currentParas });
        currentParas = [clean];
        currentLen = clean.length;
      } else {
        currentParas.push(clean);
        currentLen += clean.length;
      }
    });

    if (currentParas.length > 0) {
      result.push({ paragraphs: currentParas });
    }

    // Add bullets onto chunks
    if (bullets.length > 0) {
      const cleanBullets = bullets.filter((b) => Boolean(b && b.trim()));
      for (let i = 0; i < cleanBullets.length; i += maxBulletsPerPage) {
        const slice = cleanBullets.slice(i, i + maxBulletsPerPage);
        if (i === 0 && result.length === 1 && (result[0].paragraphs?.join('').length || 0) < 180) {
          result[0] = { ...result[0], bullets: slice };
        } else {
          result.push({ bullets: slice });
        }
      }
    }

    if (result.length === 0) {
      result.push({ paragraphs: [] });
    }

    return result;
  }, [explicitPages, paragraphs, bullets, maxCharsPerPage, maxBulletsPerPage]);

  const safeIdx = Math.min(pageIdx, Math.max(0, computedPages.length - 1));
  const activePage = computedPages[safeIdx];

  return (
    <div className={`w-full flex flex-col justify-between gap-4 ${className}`}>
      <div className="w-full space-y-3">
        {(activePage?.heading || heading) && (
          <h4 className="font-arcade font-black text-base sm:text-lg text-amber-300 uppercase tracking-wide">
            {activePage?.heading || heading}
          </h4>
        )}

        {activePage?.paragraphs && activePage.paragraphs.length > 0 && (
          <div className="space-y-3">
            {activePage.paragraphs.map((p, i) => (
              <p key={i} className={`${textSizeClass} text-slate-100 leading-relaxed font-sans`}>
                {p}
              </p>
            ))}
          </div>
        )}

        {activePage?.bullets && activePage.bullets.length > 0 && (
          <ul className="space-y-2.5 pt-1">
            {activePage.bullets.map((b, i) => (
              <li
                key={i}
                className={`${textSizeClass} text-slate-100 leading-relaxed font-sans flex items-start gap-2.5 border-b border-slate-800/70 pb-2.5 last:border-b-0`}
              >
                <span className="w-6 h-6 rounded bg-amber-500/20 border border-amber-400/60 text-amber-300 font-mono text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  {safeIdx * maxBulletsPerPage + i + 1}
                </span>
                <span className="flex-1">{b}</span>
              </li>
            ))}
          </ul>
        )}

        {activePage?.node}
      </div>

      {computedPages.length > 1 && (
        <ConsolePaginationBar
          currentPage={safeIdx + 1}
          totalPages={computedPages.length}
          onPageChange={(p) => setPageIdx(p - 1)}
          label="TEXT PAGE"
        />
      )}
    </div>
  );
};
