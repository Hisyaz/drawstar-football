import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  RotateCcw,
  Coins,
  Crown,
  ShoppingBag,
  Package,
  ArrowRight,
  X,
} from 'lucide-react';
import { haptics } from '../utils/hapticsSystem';
import { audioManager } from '../utils/audioSystem';

export interface RetroTutorialHighlightRow {
  icon: React.ReactNode;
  label: string;
  detail: string;
}

export interface RetroTutorialPage {
  badge: string;
  title: string;
  summary: string;
  rows?: RetroTutorialHighlightRow[];
  callout?: string;
}

interface RetroPagedTutorialModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  headerTitle: string;
  headerIcon: React.ReactNode;
  accentColor?: 'cyan' | 'amber' | 'emerald';
  pages: RetroTutorialPage[];
  finalActionLabel: string;
  finalActionIcon?: React.ReactNode;
}

const ACCENT_THEMES = {
  cyan: {
    border: 'border-cyan-400',
    bevel: 'pixel-bevel-cyan',
    glow: 'shadow-[0_0_35px_rgba(34,211,238,0.3)]',
    headerBg: 'bg-cyan-950/70 border-cyan-500/50',
    badge: 'bg-cyan-950 text-cyan-300 border-cyan-500/70',
    title: 'text-cyan-300',
    corner: 'border-cyan-400',
    dotActive: 'bg-cyan-400 border-cyan-200',
    callout: 'bg-cyan-950/60 border-cyan-500/60 text-cyan-100',
    primaryBtn:
      'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 text-slate-950 border-cyan-200',
  },
  amber: {
    border: 'border-amber-400',
    bevel: 'pixel-bevel-gold',
    glow: 'shadow-[0_0_35px_rgba(245,158,11,0.32)]',
    headerBg: 'bg-amber-950/60 border-amber-500/50',
    badge: 'bg-amber-950 text-amber-300 border-amber-500/70',
    title: 'text-amber-300',
    corner: 'border-amber-400',
    dotActive: 'bg-amber-400 border-amber-200',
    callout: 'bg-amber-950/60 border-amber-500/60 text-amber-100',
    primaryBtn:
      'bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-slate-950 border-amber-200',
  },
  emerald: {
    border: 'border-emerald-400',
    bevel: 'pixel-bevel-emerald',
    glow: 'shadow-[0_0_35px_rgba(16,185,129,0.32)]',
    headerBg: 'bg-emerald-950/60 border-emerald-500/50',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/70',
    title: 'text-emerald-300',
    corner: 'border-emerald-400',
    dotActive: 'bg-emerald-400 border-emerald-200',
    callout: 'bg-emerald-950/60 border-emerald-500/60 text-emerald-100',
    primaryBtn:
      'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 text-slate-950 border-emerald-200',
  },
};

export const RetroPagedTutorialModal: React.FC<RetroPagedTutorialModalProps> = ({
  id,
  isOpen,
  onClose,
  onComplete,
  headerTitle,
  headerIcon,
  accentColor = 'cyan',
  pages,
  finalActionLabel,
  finalActionIcon,
}) => {
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setPageIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || pages.length === 0) return null;

  const theme = ACCENT_THEMES[accentColor];
  const safeIndex = Math.min(Math.max(0, pageIndex), pages.length - 1);
  const current = pages[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === pages.length - 1;

  const handleNext = () => {
    haptics.lightTap();
    audioManager.playCardFlipSound();
    if (isLast) {
      onComplete();
    } else {
      setPageIndex((p) => Math.min(pages.length - 1, p + 1));
    }
  };

  const handlePrev = () => {
    if (isFirst) return;
    haptics.lightTap();
    setPageIndex((p) => Math.max(0, p - 1));
  };

  return (
    <div
      id={`${id}-backdrop`}
      className="fixed inset-0 z-[10050] bg-slate-950/90 sm:bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id={id}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md max-h-[96dvh] bg-slate-900 border-2 ${theme.border} ${theme.bevel} ${theme.glow} flex flex-col overflow-hidden text-slate-100`}
      >
        {/* 32-Bit Subtle Scanline Overlay */}
        <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

        {/* Corner Pixel Brackets */}
        <span className={`absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 ${theme.corner} pointer-events-none z-20`} />
        <span className={`absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 ${theme.corner} pointer-events-none z-20`} />
        <span className={`absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 ${theme.corner} pointer-events-none z-20`} />
        <span className={`absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 ${theme.corner} pointer-events-none z-20`} />

        {/* Compact Top Bar */}
        <header
          className={`relative z-10 px-3.5 py-2.5 border-b-2 ${theme.headerBg} flex items-center justify-between gap-2 shrink-0`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
              {headerIcon}
            </div>
            <div className="min-w-0">
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                32-BIT GUIDE · PAGE {safeIndex + 1}/{pages.length}
              </div>
              <h2 className={`font-arcade font-black text-xs sm:text-sm uppercase tracking-wide truncate ${theme.title}`}>
                {headerTitle}
              </h2>
            </div>
          </div>

          <button
            id={`${id}-skip-btn`}
            type="button"
            onClick={onClose}
            aria-label="Skip Tutorial"
            className="min-w-[40px] min-h-[40px] bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Paged Body — Designed to fit 100% cleanly on mobile screens without scrolling */}
        <div className="relative z-10 px-3.5 py-3.5 sm:px-5 sm:py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase border ${theme.badge}`}>
              {current.badge}
            </span>
            {/* Segmented Pixel Page Dots */}
            <div className="flex items-center gap-1.5">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Page ${idx + 1}`}
                  onClick={() => setPageIndex(idx)}
                  className={`h-2.5 transition-all cursor-pointer border ${
                    idx === safeIndex
                      ? `w-6 ${theme.dotActive}`
                      : 'w-2.5 bg-slate-800 border-slate-600 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-arcade font-black text-base sm:text-lg text-white uppercase tracking-wide leading-tight">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-snug">
              {current.summary}
            </p>
          </div>

          {current.rows && current.rows.length > 0 && (
            <div className="space-y-2">
              {current.rows.map((row, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-950/90 border border-slate-700/80 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                    {row.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-arcade font-black text-white uppercase leading-tight">
                      {row.label}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-300 font-sans leading-tight mt-0.5">
                      {row.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {current.callout && (
            <div className={`p-2.5 border text-xs font-sans leading-snug ${theme.callout}`}>
              {current.callout}
            </div>
          )}
        </div>

        {/* Sticky Bottom Arcade Controls */}
        <footer className="relative z-10 px-3.5 py-2.5 bg-slate-950 border-t-2 border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            id={`${id}-prev-btn`}
            type="button"
            disabled={isFirst}
            onClick={handlePrev}
            className={`min-h-[44px] px-3.5 py-2 border-2 font-arcade font-black text-xs uppercase flex items-center gap-1 transition-all ${
              isFirst
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white cursor-pointer active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>

          <button
            id={`${id}-next-btn`}
            type="button"
            onClick={handleNext}
            className={`flex-1 min-h-[44px] px-4 py-2 border-2 font-arcade font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all ${theme.primaryBtn}`}
          >
            <span>{isLast ? finalActionLabel : 'NEXT PAGE'}</span>
            {isLast ? (
              finalActionIcon || <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

// ============================================================================
// PRE-CONFIGURED 32-BIT TUTORIALS (MOBILE ZERO-SCROLL)
// ============================================================================

interface DustTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DustTutorialModal: React.FC<DustTutorialModalProps> = ({ isOpen, onClose }) => {
  const pages: RetroTutorialPage[] = [
    {
      badge: 'STEP 1 · EARNING DUST',
      title: 'WHAT IS CARD DUST?',
      summary: 'Duplicate cards pulled from Store Packs can be recycled into Card Dust.',
      rows: [
        {
          icon: <RotateCcw className="w-4 h-4 text-emerald-400" />,
          label: '1 COPY ALWAYS SAFE',
          detail: 'Recycling only removes extra duplicates—your active deck copy stays.',
        },
        {
          icon: <Sparkles className="w-4 h-4 text-cyan-300" />,
          label: 'HIGHER TIER = MORE DUST',
          detail: 'Gold, Legendary & Iconic duplicates award much bigger Dust payouts.',
        },
      ],
    },
    {
      badge: 'STEP 2 · SPENDING DUST',
      title: 'UNLOCK & EXCHANGE',
      summary: 'Open the Unlock & Exchange tab anytime to convert Dust or buy upgrades.',
      rows: [
        {
          icon: <Coins className="w-4 h-4 text-amber-400" />,
          label: 'FIXED EXCHANGES',
          detail: 'Trade 10 Dust → 1 Credit, or 100,000 Dust → 1,000 Icon Points.',
        },
        {
          icon: <Crown className="w-4 h-4 text-purple-300" />,
          label: 'CAREER & STYLE UNLOCKS',
          detail: 'Unlock 4-Card Draws, 1 Free Reroll, Match Filters & Special Hairs!',
        },
      ],
    },
  ];

  return (
    <RetroPagedTutorialModal
      id="dust-tutorial-modal"
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onClose}
      headerTitle="CARD DUST GUIDE"
      headerIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
      accentColor="cyan"
      pages={pages}
      finalActionLabel="GOT IT!"
      finalActionIcon={<Check className="w-4 h-4 stroke-[3]" />}
    />
  );
};

interface UniqueCareerStoreRedirectTutorialModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onGoToStore: () => void;
}

export const UniqueCareerStoreRedirectTutorialModal: React.FC<
  UniqueCareerStoreRedirectTutorialModalProps
> = ({ isOpen, onCancel, onGoToStore }) => {
  const pages: RetroTutorialPage[] = [
    {
      badge: 'FIRST TIME SETUP',
      title: 'BUILD YOUR STARTER DECK',
      summary:
        'Before your first Unique Career, open the 5 Starter & Epic Packs in the Card Store.',
      rows: [
        {
          icon: <Package className="w-4 h-4 text-amber-300" />,
          label: '5 PACKS AT 1 CREDIT EACH',
          detail: '4 Starter Packs + Epic Upgrade Pack cost only 5 Credits total.',
        },
        {
          icon: <Coins className="w-4 h-4 text-emerald-400" />,
          label: '5 CREDITS KEPT FOR CAREER',
          detail: 'From your 10 starting Credits, 5 remain ready for Unique Career!',
        },
      ],
    },
    {
      badge: 'AUTO RETURN',
      title: 'OPEN ALL 5 TO LAUNCH',
      summary:
        'Every card you unpack joins your permanent deck across all future careers.',
      callout:
        '⚡ Once all 5 Starter & Epic Packs are opened, you will automatically return to launch Unique Career!',
    },
  ];

  return (
    <RetroPagedTutorialModal
      id="unique-career-store-redirect-tutorial-modal"
      isOpen={isOpen}
      onClose={onCancel}
      onComplete={onGoToStore}
      headerTitle="UNIQUE CAREER PREP"
      headerIcon={<ShoppingBag className="w-4 h-4 text-amber-300" />}
      accentColor="amber"
      pages={pages}
      finalActionLabel="OPEN CARD STORE"
      finalActionIcon={<ArrowRight className="w-4 h-4 stroke-[3]" />}
    />
  );
};
