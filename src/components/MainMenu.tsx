import React, { useState, useEffect, useRef } from 'react';
import { PlayerCardData } from '../types';
import { PRESET_PLAYERS } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { LanguagePickerButton, LanguagePickerModal } from './LanguagePickerModal';
import { CompactMusicPlayerButton } from './CompactMusicPlayerButton';
import { ProfileTopRightBadge } from './ProfileTopRightBadge';
import { GraphicSettingsModal } from './GraphicSettingsModal';
import { useAudio } from '../context/AudioContext';
import { useAutosaveSettings, AutosaveFrequency } from '../utils/careerSaveSystem';
import { useTestMode, useMagicTool } from '../utils/testModeSystem';
import { useGraphicSettings } from '../utils/graphicSettingsSystem';
import { haptics } from '../utils/hapticsSystem';
import {
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Footprints,
  Crown,
  Play,
  RotateCcw,
  Sliders,
  Settings,
  Shield,
  CreditCard,
  Users,
  Volume2,
  VolumeX,
  Globe,
  Gauge,
  Monitor,
  Save,
  Beaker,
  Radio,
  Check,
  Lock,
  Eye,
  Type,
  Database,
  ShoppingBag,
  Download,
  FolderArchive,
  Wand2,
  Crosshair,
  Layers,
  Building2,
} from 'lucide-react';
import { ProjectSyncModal } from './ProjectSyncModal';
import { DrawStarMarkIcon } from './DrawStarMarkIcon';
import { DrawStarHeaderLogo } from './DrawStarHeaderLogo';
import { triggerMagicInspect, triggerMagicAuditModal } from '../utils/translationAuditSystem';

import pitchBg from '../assets/images/pitch_background_1786468261881.jpg';
import cleatsTiedImg from '../assets/images/cleats_tied_1786468275388.jpg';
import worldCupTrophyImg from '../assets/images/world_cup_globe_1786468309877.jpg';
import flagPaintingImg from '../assets/images/flag_painting_1787087312357.jpg';
import tacticsBoardImg from '../assets/images/tactics_board_1786468286153.jpg';
import drawstarLogoImg from '../assets/images/drawstar_logo_1789138230089.jpg';

const PickLegendModal = React.lazy(() => import('./PickLegendModal').then(m => ({ default: m.PickLegendModal })));
import {
  getChampionCredits,
  subscribeToChampionCredits,
  getStoreCollection,
  subscribeToStoreCollection,
  beginUniqueCareerCreditEscrow,
  isStoreTutorialCompleted,
  areAllStarterTutorialPacksPurchased,
} from '../utils/storeCollectionSystem';
import { isTutorialEnabled } from '../utils/tutorialSystem';
import { UniqueCareerStoreRedirectTutorialModal } from './RetroPagedTutorialModal';
import { PixelCoinSlotCareerButton } from './pixel/PixelCoinSlotCareerButton';
import {
  PixelBallIcon,
  PixelTrophyIcon,
  PixelCleatIcon,
  PixelCoinIcon,
  PixelCardsIcon,
  PixelShopIcon,
  PixelSlidersIcon,
  PixelGearIcon,
  PixelCrownIcon,
  PixelArrowRightIcon,
  PixelCheckIcon,
  PixelCloseIcon,
  PixelStarIcon,
  PixelSparklesIcon,
} from './pixel/PixelIcons';
import { PixelBadge } from './pixel/PixelBadge';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

interface MainMenuProps {
  onStartKickOff?: () => void;
  onStartNewGame: (alreadyPaid?: boolean) => void;
  onSelectLegendPreset?: (preset: PlayerCardData) => void;
  onStartEditor?: (editorTab?: 'character' | 'team' | 'card' | 'competitions' | 'stadium' | 'manager') => void;
  onOpenOptionFile?: () => void;
  onOpenStore?: () => void;
  onOpenStoreForStarterTutorial?: () => void;
  onOpenCardCollection?: () => void;
  showToast: (msg: string) => void;
  legendsList?: PlayerCardData[];
  hasSavedCareer?: boolean;
  savedCareerInfo?: string | null;
  onContinueCareer?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartKickOff,
  onStartNewGame,
  onSelectLegendPreset,
  onStartEditor,
  onOpenOptionFile,
  onOpenStore,
  onOpenStoreForStarterTutorial,
  onOpenCardCollection,
  showToast,
  legendsList = [],
  hasSavedCareer = false,
  savedCareerInfo,
  onContinueCareer,
}) => {
  const { t } = useLanguage();
  const {
    startMenuMusic,
    isMuted,
    toggleMute,
    volume,
    setVolume,
    soundtrackMode,
    setSoundtrackMode,
    nextTrack,
  } = useAudio();
  const { autosaveSettings, updateAutosaveSettings } = useAutosaveSettings();
  const { isTestMode, setTestMode } = useTestMode();
  const { isMagicTool, setMagicTool, enableMagicToolWithTestMode } = useMagicTool();
  const { graphicSettings, updateGraphicSettings } = useGraphicSettings();

  const [showLegendModal, setShowLegendModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showGraphicSettingsModal, setShowGraphicSettingsModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showCardCollectionModal, setShowCardCollectionModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showUniqueCareerStoreTutorial, setShowUniqueCareerStoreTutorial] = useState(false);
  const [championCredits, setChampionCredits] = useState<number>(() => getChampionCredits());
  const [optionsActiveTab, setOptionsActiveTab] = useState<'soundtrack' | 'settings' | 'autosave' | 'testmode' | 'sync'>('soundtrack');
  const [mobileMenuPage, setMobileMenuPage] = useState<1 | 2>(1);
  const [optionsSettingsPage, setOptionsSettingsPage] = useState<1 | 2>(1);
  const [totalOwnedCards, setTotalOwnedCards] = useState<number>((): number => {
    try {
      const col = getStoreCollection();
      if (!col || typeof col !== 'object') return 0;
      const cardsObj: Record<string, unknown> = ('cards' in col && (col as any).cards && typeof (col as any).cards === 'object')
        ? (col as any).cards
        : (col as Record<string, unknown>);
      return Object.values(cardsObj).reduce<number>((acc, c) => acc + (typeof c === 'number' ? c : 0), 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    setChampionCredits(getChampionCredits());
    const unsubscribe = subscribeToChampionCredits((creds) => {
      setChampionCredits(creds);
    });
    const unsubCol = subscribeToStoreCollection((col) => {
      try {
        if (!col || typeof col !== 'object') {
          setTotalOwnedCards(0);
          return;
        }
        const cardsObj: Record<string, unknown> = ('cards' in col && (col as any).cards && typeof (col as any).cards === 'object')
          ? (col as any).cards
          : (col as Record<string, unknown>);
        const total: number = Object.values(cardsObj).reduce<number>((acc, c) => acc + (typeof c === 'number' ? c : 0), 0);
        setTotalOwnedCards(total);
      } catch {
        setTotalOwnedCards(0);
      }
    });
    return () => {
      unsubscribe();
      unsubCol();
    };
  }, []);

  const handleOpenStore = () => {
    if (onOpenStore) {
      onOpenStore();
    } else {
      setShowStoreModal(true);
    }
  };

  const handleOpenCardCollection = () => {
    if (onOpenCardCollection) {
      onOpenCardCollection();
    } else {
      setShowCardCollectionModal(true);
    }
  };

  const handleInterceptUniqueCareerStart = (): boolean => {
    if (
      isTutorialEnabled() &&
      !isStoreTutorialCompleted() &&
      !areAllStarterTutorialPacksPurchased()
    ) {
      setShowUniqueCareerStoreTutorial(true);
      return true;
    }
    return false;
  };

  const handleUniqueCareerStart = () => {
    const reserved = beginUniqueCareerCreditEscrow();
    if (!reserved) {
      showToast('⚠️ Could not reserve Champion Credit.');
      return;
    }
    onStartNewGame(true);
  };

  const hasStartedMenuMusicRef = useRef(false);
  useEffect(() => {
    if (!hasStartedMenuMusicRef.current) {
      hasStartedMenuMusicRef.current = true;
      startMenuMusic();
    }
  }, [startMenuMusic]);

  // Combine default legend presets and user saved custom legends
  const allLegends = [
    ...PRESET_PLAYERS.filter((p) => p.id !== 'prodigy'),
    ...legendsList.filter((l) => !PRESET_PLAYERS.some((p) => p.id === l.id)),
  ];

  const handlePickLegend = (legend: PlayerCardData) => {
    if (onSelectLegendPreset) {
      onSelectLegendPreset(legend);
      setShowLegendModal(false);
    } else {
      showToast(`⭐ Selected ${legend.name}!`);
    }
  };

  return (
    <React.Suspense fallback={null}>
      <div
        id="main-menu-root"
      className="min-h-screen min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-y-auto overscroll-y-auto touch-pan-y p-3 sm:p-6 md:p-8 pb-10 sm:pb-6 font-sans select-none"
    >
      {/* ================= 32-BIT RETRO ATMOSPHERE & PITCH BACKGROUND ================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Crisp stadium turf image with visible green grass blades below */}
        <img
          src={pitchBg}
          alt="Stadium pitch turf at night"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-bottom filter brightness-[0.65] contrast-[1.2] saturate-[1.1] scale-105"
        />
        {/* 32-bit scanline and halftone dither grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        {/* Soft atmospheric gradient allowing pitch floodlights & grass to shine */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/75" />
        {/* Pitch contact turf shadow at very bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-emerald-950/70 to-transparent pointer-events-none" />
      </div>

      {/* ================= 32-BIT TOP ARCADE HEADER BAR ================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 py-1.5 sm:py-2 shrink-0 min-w-0">
        {/* Left: 32-Bit DrawStar Arcade Logo */}
        <div className="flex items-center min-w-0">
          <DrawStarHeaderLogo />
        </div>

        {/* Right: 32-Bit All-Inclusive Icon Bar (wraps cleanly without overflowing 360px/390px) */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 min-w-0">
          {/* Real-time Champion Credits (Icon + Balance) */}
          <div
            id="main-menu-credits-badge"
            className="min-h-[40px] px-2.5 bg-amber-950/90 border-2 border-amber-500/80 pixel-bevel-gold text-amber-300 font-pixel text-xs flex items-center gap-1.5 shadow-md select-none shrink-0"
            title={`Champion Credits: ${championCredits.toLocaleString()}`}
          >
            <PixelCoinIcon size={16} />
            <span className="font-arcade font-bold tracking-tight text-white">{championCredits.toLocaleString()}</span>
          </div>

          {/* Quick Collection Button (Icon-first) */}
          <button
            id="main-menu-collection-quick-btn"
            type="button"
            onClick={handleOpenCardCollection}
            className="min-h-[40px] min-w-[40px] px-2 sm:px-2.5 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border-2 border-cyan-500/80 hover:border-cyan-400 pixel-bevel-cyan flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md active:scale-95 shrink-0"
            title={`Card Collection (${totalOwnedCards} Owned Cards)`}
            aria-label="Card Collection"
          >
            <PixelCardsIcon size={16} className="text-cyan-400" />
            <span className="font-arcade text-[10px] text-cyan-200 hidden md:inline uppercase font-bold">
              {totalOwnedCards}
            </span>
          </button>

          {/* Quick Store Button (Icon-first) */}
          <button
            id="main-menu-store-quick-btn"
            type="button"
            onClick={handleOpenStore}
            className="min-h-[40px] min-w-[40px] sm:w-auto sm:px-2.5 bg-amber-950/90 hover:bg-amber-900 text-amber-300 border-2 border-amber-500/80 hover:border-amber-400 pixel-bevel-gold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md active:scale-95 shrink-0"
            title="DrawStar Card Store (10 Credits / Pack)"
            aria-label="Card Store"
          >
            <PixelShopIcon size={16} className="text-amber-400" />
            <span className="font-arcade text-[10px] text-amber-300 hidden md:inline uppercase font-bold">
              {t('SHOP')}
            </span>
          </button>

          {/* Quick Settings Button (Icon-first) */}
          <button
            id="main-menu-settings-quick-btn"
            type="button"
            onClick={() => {
              setOptionsActiveTab('settings');
              setShowOptionsModal(true);
            }}
            className="min-h-[40px] min-w-[40px] bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-2 border-slate-700/80 hover:border-slate-500 pixel-bevel-raised flex items-center justify-center cursor-pointer transition shadow-md active:scale-95 shrink-0"
            title={t('Settings') || 'Game Settings & Preferences'}
            aria-label="Settings"
          >
            <PixelGearIcon size={16} className="text-slate-300" />
          </button>

          {/* Compact 32-Bit Soundtrack Operator Button & Popover */}
          <CompactMusicPlayerButton />

          {/* Language Selector */}
          <LanguagePickerButton />

          {/* Player Profile Badge */}
          <ProfileTopRightBadge showToast={showToast} embedded />
        </div>
      </header>

      {/* ================= MAIN INTERACTION AREA ================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 my-2 sm:my-auto py-1 sm:py-4 flex flex-col justify-center gap-3 sm:gap-5 min-w-0">

        {/* ================= MOBILE / CONSOLE 2-PAGE NAVIGATION BAR (< lg) ================= */}
        <div className="lg:hidden w-full grid grid-cols-2 gap-2 p-1.5 bg-slate-900/95 border-2 border-amber-500/60 pixel-bevel-gold shadow-lg shrink-0">
          <button
            id="main-menu-mobile-page-1-btn"
            type="button"
            onClick={() => setMobileMenuPage(1)}
            className={`min-h-[44px] px-3 py-2 font-arcade font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
              mobileMenuPage === 1
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <span>1. PLAY MODES</span>
          </button>
          <button
            id="main-menu-mobile-page-2-btn"
            type="button"
            onClick={() => setMobileMenuPage(2)}
            className={`min-h-[44px] px-3 py-2 font-arcade font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
              mobileMenuPage === 2
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-md'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <span>2. LOCKER & STUDIO</span>
          </button>
        </div>
        
        {/* ================= RESUME ACTIVE CAREER (32-BIT PIXEL BANNER) ================= */}
        {hasSavedCareer && onContinueCareer && (
          <div className={`${mobileMenuPage === 1 ? 'flex' : 'hidden lg:flex'} w-full justify-center animate-in fade-in slide-in-from-top-3 duration-300`}>
            <button
              type="button"
              onClick={onContinueCareer}
              className="w-full max-w-4xl p-3.5 sm:p-4.5 bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-emerald-500 pixel-bevel-emerald shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-between gap-3 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group relative overflow-hidden"
            >
              {/* Corner Pixel Accents */}
              <span className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
              <span className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
              <span className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
              <span className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 bg-emerald-600 text-white pixel-bevel-emerald flex items-center justify-center shrink-0 border-2 border-emerald-400 shadow-md">
                  <RotateCcw className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-pixel uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/60 px-2 py-0.5">
                      {t('SAVED CAREER FOUND')}
                    </span>
                  </div>
                  <h3 className="font-arcade text-sm sm:text-base text-white uppercase tracking-wide truncate mt-1 drop-shadow">
                    {savedCareerInfo || t('Resume Active Footballer Journey')}
                  </h3>
                </div>
              </div>

              <div className="shrink-0">
                <span className="min-h-[44px] px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs tracking-wider uppercase border-2 border-emerald-400 pixel-bevel-emerald shadow-md flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>{t('RESUME')}</span>
                  <PixelArrowRightIcon size={14} />
                </span>
              </div>
            </button>
          </div>
        )}

        {/* ================= 32-BIT MENU GRID (8 COLS FOR MODES / 4 COLS FOR MENU ACTIONS) ================= */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          
          {/* ================= LEFT 8 COLS: PRIMARY 32-BIT GAME MODES (PAGE 1 ON MOBILE) ================= */}
          <div className={`${mobileMenuPage === 1 ? 'grid' : 'hidden lg:grid'} lg:col-span-8 grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-stretch`}>
            {/* 0. KICK OFF — FIRST FEATURED ARCADE EXHIBITION BUTTON */}
            {onStartKickOff && (
              <button
                id="main-menu-kickoff-btn"
                type="button"
                onClick={onStartKickOff}
                className="sm:col-span-2 group relative min-h-[168px] sm:min-h-[188px] bg-gradient-to-r from-[#04231e] via-[#063a2f] to-[#0a192f] text-slate-100 border-2 border-emerald-400 pixel-bevel-emerald shadow-[0_14px_40px_rgba(16,185,129,0.28)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.45)] transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-7 text-left overflow-hidden cursor-pointer hover:border-emerald-300 hover:-translate-y-1 active:translate-y-0 gap-4"
              >
                <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-300 pointer-events-none z-20" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-300 pointer-events-none z-20" />
                <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-300 pointer-events-none z-20" />
                <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-300 pointer-events-none z-20" />

                <div className="absolute inset-0 bg-[radial-gradient(#10b98118_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none z-0" />
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 group-hover:opacity-35 transition-opacity pointer-events-none">
                  <img
                    src={pitchBg}
                    alt="Arcade match pitch"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#04231e] via-[#063a2f]/70 to-transparent" />
                </div>

                <div className="relative z-10 space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/90 text-emerald-300 border border-emerald-400/70 text-[10px] font-pixel uppercase tracking-wider pixel-bevel-emerald">
                      <PixelBallIcon size={13} />
                      <span>{t('32-BIT MATCH ENGINE')}</span>
                    </span>
                    <span className="text-[10px] font-pixel text-emerald-300/90">
                      {t('INSTANT PLAY · FREE')}
                    </span>
                  </div>

                  <h2 className="font-arcade font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase leading-none tracking-wider drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
                    {t('KICK OFF')}
                  </h2>

                  <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
                    {t('System Profiler -> Controller & Sides -> World Clubs, National Teams & Special XI -> Live Pitch Action.')}
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-3 shrink-0">
                  <div className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-pixel text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 border-2 border-emerald-200 pixel-bevel-emerald shadow-lg group-hover:scale-105 transition-transform">
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>{t('PLAY KICK OFF')}</span>
                  </div>
                </div>
              </button>
            )}

            {/* 1. UNIQUE CAREER WITH DETAILED 32-BIT COIN-IN-SLOT ANIMATION */}
            <PixelCoinSlotCareerButton
              championCredits={championCredits}
              hasSavedCareer={hasSavedCareer}
              onContinueCareer={onContinueCareer}
              onStartCareer={handleUniqueCareerStart}
              onInterceptStartCareer={handleInterceptUniqueCareerStart}
              onOpenStore={handleOpenStore}
              showToast={showToast}
              t={t}
            />

            {/* 2. PLAY AS LEGEND (32-BIT ARCADE GOLDEN PANEL) */}
            <button
              type="button"
              onClick={() => setShowLegendModal(true)}
              className="group relative min-h-[215px] sm:min-h-[340px] lg:min-h-[400px] bg-gradient-to-b from-[#1c1305] via-[#120c03] to-[#0a0701] text-slate-100 border-2 border-amber-500/80 pixel-bevel-gold shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all duration-300 flex flex-col justify-between p-4 sm:p-7 text-left overflow-hidden cursor-pointer hover:border-amber-400 hover:-translate-y-1 active:translate-y-0"
            >
              {/* Pixel Corner Brackets */}
              <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400 pointer-events-none z-20" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400 pointer-events-none z-20" />
              <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400 pointer-events-none z-20" />
              <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400 pointer-events-none z-20" />

              {/* Background Artwork with 32-bit pixel dither & fade */}
              <div className="absolute top-0 right-0 bottom-0 w-3/4 sm:w-2/3 pointer-events-none overflow-hidden z-0">
                <img
                  src={worldCupTrophyImg}
                  alt="Golden world cup trophy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.2] opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1c1305] via-[#1c1305]/70 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#f59e0b12_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
              </div>

              {/* Header Badges */}
              <div className="relative z-10 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/90 text-amber-300 border border-amber-500/70 text-[10px] font-pixel uppercase tracking-wider pixel-bevel-gold">
                    <PixelCrownIcon size={13} />
                    <span>{t('IMMORTAL ICONS')}</span>
                  </span>
                  <span className="text-[10px] font-pixel text-amber-400/80">
                    {t('SLOT 02')}
                  </span>
                </div>

                <h2 className="font-arcade font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase leading-none tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {t('PLAY AS LEGEND')}
                </h2>

                <p className="text-sm text-amber-100/90 font-medium leading-relaxed">
                  {t('Take control of an all-time legend. Relive historical campaigns, lift major silverware, and cement eternal glory.')}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] font-pixel text-amber-300/80">
                  <PixelSparklesIcon size={12} className="text-amber-400" />
                  <span>{t('100+ Icons • Era Campaigns')}</span>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="relative z-10 pt-3 sm:pt-4 flex items-center justify-between border-t border-amber-500/30 mt-3 sm:mt-4">
                <div className="min-h-[44px] px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-amber-300 pixel-bevel-gold shadow-lg group-hover:brightness-110 transition-all">
                  <PixelTrophyIcon size={15} />
                  <span>{t('CHOOSE ICON')}</span>
                </div>

                <div className="w-10 h-10 bg-amber-950/90 border border-amber-500/70 text-amber-300 pixel-bevel-gold flex items-center justify-center transition-all group-hover:translate-x-1 shadow-sm">
                  <PixelArrowRightIcon size={15} />
                </div>
              </div>
            </button>
          </div>

          {/* ================= RIGHT 4 COLS: 32-BIT ARCADE ACTION TILES (PAGE 2 ON MOBILE) ================= */}
          <div className={`${mobileMenuPage === 2 ? 'flex' : 'hidden lg:flex'} lg:col-span-4 flex-col gap-3 justify-between`}>
            {/* 2x2 Square Boxes Grid */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              
              {/* 1. DEDICATED CARD COLLECTION BUTTON (SQUARE BOX) */}
              <button
                id="main-menu-card-collection-btn"
                type="button"
                onClick={handleOpenCardCollection}
                className="group relative bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-cyan-500/80 hover:border-cyan-400 pixel-bevel-cyan shadow-[0_8px_20px_rgba(0,0,0,0.5)] p-3 sm:p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px]"
              >
                {/* Corner Pixel Accents */}
                <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />

                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-10 h-10 bg-cyan-950 border border-cyan-500/70 pixel-bevel-cyan text-cyan-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <PixelCardsIcon size={22} className="text-cyan-400" />
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-pixel bg-cyan-950 text-cyan-300 border border-cyan-500/60 pixel-bevel-cyan shrink-0">
                    {totalOwnedCards}
                  </span>
                </div>

                <div className="my-auto pt-2">
                  <h3 className="font-arcade font-black text-xs sm:text-sm text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors leading-tight">
                    {t('CARD COLLECTION')}
                  </h3>
                  <p className="text-[10px] font-pixel text-slate-400 mt-1 line-clamp-1">
                    {t('Deck & Archives')}
                  </p>
                </div>

                <div className="pt-2 border-t border-cyan-500/30 flex items-center justify-between text-[10px] font-pixel text-cyan-400">
                  <span className="group-hover:underline uppercase tracking-wider">
                    {t('VIEW')}
                  </span>
                  <PixelArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 2. CARD STORE BUTTON (SQUARE BOX) */}
              <button
                id="main-menu-store-card-btn"
                type="button"
                onClick={handleOpenStore}
                className="group relative bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-amber-500/80 hover:border-amber-400 pixel-bevel-gold shadow-[0_8px_20px_rgba(0,0,0,0.5)] p-3 sm:p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px]"
              >
                {/* Corner Pixel Accents */}
                <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-amber-400 pointer-events-none" />

                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-10 h-10 bg-amber-950 border border-amber-500/70 pixel-bevel-gold text-amber-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <PixelShopIcon size={22} className="text-amber-400" />
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-pixel bg-amber-950 text-amber-300 border border-amber-500/60 pixel-bevel-gold shrink-0">
                    {t('10 CREDITS')}
                  </span>
                </div>

                <div className="my-auto pt-2">
                  <h3 className="font-arcade font-black text-xs sm:text-sm text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors leading-tight">
                    {t('CARD STORE')}
                  </h3>
                  <p className="text-[10px] font-pixel text-slate-400 mt-1 line-clamp-1">
                    {t('7 Pack Types')}
                  </p>
                </div>

                <div className="pt-2 border-t border-amber-500/30 flex items-center justify-between text-[10px] font-pixel text-amber-400">
                  <span className="group-hover:underline uppercase tracking-wider">
                    {t('SHOP')}
                  </span>
                  <PixelArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 3. EDITOR STUDIO BUTTON (SQUARE BOX) */}
              <button
                id="main-menu-editor-btn"
                type="button"
                onClick={() => setShowEditorModal(true)}
                className="group relative bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-purple-500/80 hover:border-purple-400 pixel-bevel-raised shadow-[0_8px_20px_rgba(0,0,0,0.5)] p-3 sm:p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px]"
              >
                {/* Corner Pixel Accents */}
                <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-purple-400 pointer-events-none" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-purple-400 pointer-events-none" />

                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-10 h-10 bg-purple-950 border border-purple-500/70 pixel-bevel-raised text-purple-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <PixelSlidersIcon size={22} className="text-purple-400" />
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-pixel bg-purple-950 text-purple-300 border border-purple-500/60 pixel-bevel-raised shrink-0">
                    {t('SANDBOX')}
                  </span>
                </div>

                <div className="my-auto pt-2">
                  <h3 className="font-arcade font-black text-xs sm:text-sm text-white uppercase tracking-wide group-hover:text-purple-300 transition-colors leading-tight">
                    {t('EDITOR STUDIO')}
                  </h3>
                  <p className="text-[10px] font-pixel text-slate-400 mt-1 line-clamp-1">
                    {t('Players & Teams')}
                  </p>
                </div>

                <div className="pt-2 border-t border-purple-500/30 flex items-center justify-between text-[10px] font-pixel text-purple-400">
                  <span className="group-hover:underline uppercase tracking-wider">
                    {t('EDIT')}
                  </span>
                  <PixelArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 4. OPTIONS & SETTINGS BUTTON (SQUARE BOX) */}
              <button
                id="main-menu-options-btn"
                type="button"
                onClick={() => setShowOptionsModal(true)}
                className="group relative bg-slate-900/95 hover:bg-slate-850 text-slate-100 border-2 border-slate-600 hover:border-slate-400 pixel-bevel-raised shadow-[0_8px_20px_rgba(0,0,0,0.5)] p-3 sm:p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98] overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[155px]"
              >
                {/* Corner Pixel Accents */}
                <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-slate-400 pointer-events-none" />

                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-10 h-10 bg-slate-800 border border-slate-600 pixel-bevel-raised text-slate-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <PixelGearIcon size={22} className="text-slate-300" />
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-pixel bg-slate-800 text-slate-300 border border-slate-600 pixel-bevel-raised shrink-0">
                    {t('PREFS')}
                  </span>
                </div>

                <div className="my-auto pt-2">
                  <h3 className="font-arcade font-black text-xs sm:text-sm text-white uppercase tracking-wide group-hover:text-slate-300 transition-colors leading-tight">
                    {t('OPTIONS')}
                  </h3>
                  <p className="text-[10px] font-pixel text-slate-400 mt-1 line-clamp-1">
                    {t('Audio & Visuals')}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] font-pixel text-slate-400">
                  <span className="group-hover:underline uppercase tracking-wider">
                    {t('CONFIG')}
                  </span>
                  <PixelArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* 5. OFFLINE - DOWNLOAD BANNER */}
            <button
              id="main-menu-btn-download-sync"
              type="button"
              onClick={() => setShowSyncModal(true)}
              className="w-full min-h-[64px] p-3 sm:p-3.5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 text-slate-100 border-2 border-amber-400/90 pixel-bevel-gold shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group overflow-hidden relative"
              title="Download offline edition for PC, Linux, or Mobile"
            >
              {/* Corner Pixel Accents */}
              <span className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-amber-300 pointer-events-none" />
              <span className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-amber-300 pointer-events-none" />
              <span className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-amber-300 pointer-events-none" />
              <span className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-amber-300 pointer-events-none" />

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-amber-950 border border-amber-400/80 pixel-bevel-gold text-amber-300 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5 text-amber-300 stroke-[2.5]" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-arcade font-black text-sm sm:text-base text-white uppercase tracking-wider group-hover:text-amber-300 transition-colors truncate">
                    {t('OFFLINE - DOWNLOAD')}
                  </h3>
                  <p className="text-xs font-sans text-amber-200/80 mt-0.5 truncate">
                    {t('PC • Linux • Mobile Android & iOS')}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span className="min-h-[44px] px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-[11px] font-black tracking-wider uppercase border border-amber-300 pixel-bevel-gold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform shadow-sm">
                  <span>{t('DOWNLOAD')}</span>
                  <PixelArrowRightIcon size={12} />
                </span>
              </div>
            </button>
          </div>

        </div>

        {/* Bottom Mobile Console Pager */}
        <div className="lg:hidden w-full shrink-0 pt-1">
          <ConsolePaginationBar
            currentPage={mobileMenuPage}
            totalPages={2}
            onPageChange={(p) => setMobileMenuPage((p === 2 ? 2 : 1))}
            label="MENU PAGE"
          />
        </div>
      </main>

      {/* ================= 32-BIT RETRO FOOTER ================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto py-2 flex items-center justify-between text-slate-400 text-[10px] font-pixel shrink-0 drop-shadow">
        <span>DRAWSTAR 32-BIT • FOOTBALL LEGACY 2026</span>
        <span className="hidden sm:inline">D-PAD / TAP: NAVIGATE • ENTER / TAP: SELECT</span>
        <span>SYSTEM: 32-BIT PIXEL ENGINE</span>
      </footer>

      {/* ================= CINEMATIC PICK LEGEND MODAL ================= */}
      <PickLegendModal
        isOpen={showLegendModal}
        onClose={() => setShowLegendModal(false)}
        onStartLegendCareer={handlePickLegend}
        showToast={showToast}
      />

      {/* ================= EDITOR SELECTOR MODAL ================= */}
      <ConsoleModalShell
        id="main-menu-editor-modal"
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        title={t('Editor Studio')}
        subtitle={t('Select the sandbox suite you want to customize')}
        badge="STUDIO"
        icon={<Sliders className="w-5 h-5 text-blue-300" />}
        accentColor="blue"
        maxWidthClass="sm:max-w-2xl"
        bodyClassName="p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setShowEditorModal(false);
              if (onStartEditor) onStartEditor('character');
            }}
            className="min-h-[72px] p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border-2 border-slate-700 hover:border-blue-400 text-left transition-all cursor-pointer flex items-center gap-3 active:scale-95"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-arcade font-black text-white uppercase truncate">{t('NAV_PLAYER_EDITOR')}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{t('Player stats & appearance')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowEditorModal(false);
              if (onStartEditor) onStartEditor('team');
            }}
            className="min-h-[72px] p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border-2 border-slate-700 hover:border-blue-400 text-left transition-all cursor-pointer flex items-center gap-3 active:scale-95"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-arcade font-black text-white uppercase truncate">{t('Team & Kits')}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{t('Club names & kits')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowEditorModal(false);
              if (onStartEditor) onStartEditor('competitions');
            }}
            className="min-h-[72px] p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border-2 border-slate-700 hover:border-blue-400 text-left transition-all cursor-pointer flex items-center gap-3 active:scale-95"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-arcade font-black text-white uppercase truncate">{t('Competitions')}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{t('Leagues & tournaments')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowEditorModal(false);
              if (onStartEditor) onStartEditor('card');
            }}
            className="min-h-[72px] p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border-2 border-slate-700 hover:border-blue-400 text-left transition-all cursor-pointer flex items-center gap-3 active:scale-95"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-arcade font-black text-white uppercase truncate">{t('Card Deck Studio')}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{t('Custom perk cards')}</p>
            </div>
          </button>

          <button
            id="main-menu-btn-manager-editor"
            type="button"
            onClick={() => {
              setShowEditorModal(false);
              if (onStartEditor) onStartEditor('manager');
            }}
            className="min-h-[72px] p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-400 text-left transition-all cursor-pointer flex items-center gap-3 active:scale-95"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm"><Users className="w-5 h-5" /></div>
            <div className="min-w-0"><h4 className="text-sm font-arcade font-black text-white uppercase truncate">Manager Studio</h4><p className="text-xs text-slate-300 mt-0.5">Create managers &amp; assign clubs</p></div>
          </button>

          <button
            id="main-menu-btn-stadium-editor"
            type="button"
            onClick={() => {
              setShowEditorModal(false);
              if (onStartEditor) onStartEditor('stadium');
            }}
            className="col-span-full min-h-[72px] p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border-2 border-slate-700 hover:border-emerald-400 text-left transition-all cursor-pointer flex items-center gap-3 active:scale-95"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-arcade font-black text-white uppercase truncate">{t('Stadium Editor')}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{t('Pro, Youth & Street venues')}</p>
            </div>
          </button>

          <button
            id="main-menu-btn-option-file"
            type="button"
            onClick={() => {
              setShowEditorModal(false);
              if (onOpenOptionFile) onOpenOptionFile();
            }}
            className="col-span-full min-h-[76px] p-4 rounded-xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 hover:from-blue-900 hover:to-indigo-900 border-2 border-blue-500/70 hover:border-blue-300 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-md active:scale-95"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-arcade font-black text-white uppercase tracking-tight">Option File Database</h4>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
                    MASTER DB
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                  Unified persistent database • Players, Teams, Leagues, Competitions, Cards, Import/Export
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-300 shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </ConsoleModalShell>

      {/* ================= OPTIONS & PREFERENCES MODAL ================= */}
      <ConsoleModalShell
        id="main-menu-options-modal-content"
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        title={t('Game Preferences')}
        subtitle={t('Soundtrack, graphic settings, autosave & developer test mode')}
        badge="SYSTEM"
        icon={<Settings className="w-5 h-5 text-amber-300" />}
        accentColor="amber"
        maxWidthClass="sm:max-w-2xl"
        tabs={[
          { id: 'soundtrack', label: t('Audio'), icon: <Volume2 className="w-4 h-4 text-emerald-400" /> },
          { id: 'settings', label: t('SETTINGS_TAB_GRAPHICS') || 'GRAPHICS', icon: <Monitor className="w-4 h-4 text-amber-400" /> },
          { id: 'autosave', label: t('Autosave'), icon: <Save className="w-4 h-4 text-cyan-400" /> },
          {
            id: 'testmode',
            label: t('Test Mode'),
            icon: <Beaker className="w-4 h-4 text-amber-400" />,
            badge: isMagicTool ? 'MAGIC' : isTestMode ? 'ON' : undefined,
          },
          { id: 'sync', label: t('Download & Sync'), icon: <FolderArchive className="w-4 h-4 text-amber-400" /> },
        ]}
        activeTabId={optionsActiveTab}
        onTabChange={(id) => {
          setOptionsActiveTab(id as any);
          setOptionsSettingsPage(1);
        }}
        bodyClassName="p-3 sm:p-5 space-y-3.5 font-mono"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              id="main-menu-options-done-btn"
              type="button"
              onClick={() => setShowOptionsModal(false)}
              className="min-h-[44px] w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black font-arcade text-xs uppercase tracking-wider border-2 border-amber-300 shadow-md cursor-pointer active:scale-95"
            >
              {t('Done')}
            </button>
          </div>
        }
      >
        {/* TAB 1: SOUNDTRACK & AUDIO */}
        {optionsActiveTab === 'soundtrack' && (
          <div className="space-y-3">
            {/* Soundtrack Mute Toggle */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg flex items-center justify-center shrink-0">
                  {!isMuted ? (
                    <Volume2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black uppercase tracking-wider text-white block">
                    {t('Soundtrack Audio')}
                  </span>
                  <span className="text-xs text-slate-300 font-sans block">
                    {!isMuted ? t('Playing 16-bit retro synth chiptunes') : t('Audio is currently muted')}
                  </span>
                </div>
              </div>
              <button
                id="options-toggle-mute-btn"
                type="button"
                onClick={toggleMute}
                className={`min-h-[44px] px-4 py-2 text-xs font-mono font-black transition-all cursor-pointer active:scale-95 border rounded-lg shrink-0 ${
                  !isMuted
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700'
                }`}
              >
                {!isMuted ? t('ACTIVE') : t('MUTED')}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                <span>{t('Master Music Volume')}</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {Math.round((volume ?? 0.65) * 100)}%
                </span>
              </div>
              <input
                id="options-volume-range-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume ?? 0.65}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Soundtrack Playback Mode Preference */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>{t('Soundtrack Mode')}</span>
                </label>
                <span className="text-xs font-mono text-slate-300 uppercase font-bold">
                  {soundtrackMode === 'immersive' ? 'Contextual' : 'All Tracks Shuffle'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="soundtrack-mode-immersive-btn"
                  type="button"
                  onClick={() => setSoundtrackMode('immersive')}
                  className={`min-h-[72px] p-3 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-95 ${
                    soundtrackMode === 'immersive'
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black uppercase tracking-wider">🎧 {t('Immersive')}</span>
                      {soundtrackMode === 'immersive' && (
                        <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {t('Plays soundtrack based on your active league & competition context (German League, European Winners League, World Championship, etc.)')}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500 px-2 py-0.5 self-start rounded">
                    Authentic Matchday
                  </span>
                </button>

                <button
                  id="soundtrack-mode-playall-btn"
                  type="button"
                  onClick={() => {
                    setSoundtrackMode('play_all');
                    nextTrack();
                  }}
                  className={`min-h-[72px] p-3 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-95 ${
                    soundtrackMode === 'play_all'
                      ? 'bg-amber-950/70 border-amber-400 text-amber-200'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black uppercase tracking-wider">🎲 {t('Play All')}</span>
                      {soundtrackMode === 'play_all' && (
                        <Check className="w-4 h-4 text-amber-400 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {t('Plays all songs in random order across all leagues and countries regardless of which competition you are in.')}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase bg-amber-950 text-amber-300 border border-amber-500 px-2 py-0.5 self-start rounded">
                    Full Library Shuffle
                  </span>
                </button>
              </div>
            </div>

            {/* Language Selector trigger */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black uppercase tracking-wider text-white block">
                    {t('Language')}
                  </span>
                  <span className="text-xs text-slate-300 font-sans block">
                    {t('Pick commentary & menu locale')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOptionsModal(false);
                  setShowLangModal(true);
                }}
                className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-600 rounded-lg text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shrink-0"
              >
                {t('CHANGE')}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SETTINGS & DISPLAY (PAGED 2 PAGES FOR ZERO CRAMPED SCROLL) */}
        {optionsActiveTab === 'settings' && (
          <div className="space-y-3">
            <ConsolePaginationBar
              currentPage={optionsSettingsPage}
              totalPages={2}
              onPageChange={(p) => setOptionsSettingsPage(p === 2 ? 2 : 1)}
              label="GRAPHICS PAGE"
            />

            {optionsSettingsPage === 1 ? (
              <div className="space-y-3">
                {/* Font Size Selection */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-amber-400" />
                      <span>{t('Font Size')}</span>
                    </label>
                    <span className="text-xs font-mono text-slate-300">
                      {graphicSettings.fontSize === 'sm' && 'Compact (17.5px)'}
                      {graphicSettings.fontSize === 'base' && 'Standard (19px)'}
                      {graphicSettings.fontSize === 'lg' && 'Large (21px)'}
                      {graphicSettings.fontSize === 'xl' && 'Extra Large (23px)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'sm' as const, label: t('FONT_SIZE_COMPACT') || 'Compact', sub: '17.5px' },
                      { id: 'base' as const, label: t('FONT_SIZE_STANDARD') || 'Standard', sub: '19px' },
                      { id: 'lg' as const, label: t('FONT_SIZE_LARGE') || 'Large', sub: '21px' },
                      { id: 'xl' as const, label: t('FONT_SIZE_EXTRA_LARGE') || 'Extra Large', sub: '23px' },
                    ].map((f) => {
                      const isSelected = graphicSettings.fontSize === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => updateGraphicSettings({ fontSize: f.id })}
                          className={`min-h-[52px] p-2.5 border rounded-lg text-center transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-amber-950 text-amber-300 border-amber-400 font-black shadow-sm'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                        >
                          <span className="text-xs sm:text-sm block font-bold">{f.label}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{f.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quality Mode */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-amber-400" />
                      <span>{t('Quality Preset')}</span>
                    </label>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        graphicSettings.quality === 'high' || graphicSettings.quality === 'high_quality'
                          ? 'text-purple-200 bg-purple-950 border border-purple-400'
                          : graphicSettings.quality === 'performance'
                          ? 'text-cyan-200 bg-cyan-950 border border-cyan-500'
                          : 'text-amber-200 bg-amber-950 border border-amber-500'
                      }`}
                    >
                      {graphicSettings.quality === 'high' || graphicSettings.quality === 'high_quality'
                        ? 'HIGH • 120 FPS'
                        : graphicSettings.quality === 'performance'
                        ? 'PERF • 60+ FPS'
                        : 'BALANCED • 60 FPS'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        id: 'performance' as const,
                        title: t('QUALITY_PERFORMANCE_TITLE') || 'Performance Mode (Mobile)',
                        badge: '60+ FPS',
                        desc:
                          t('QUALITY_PERFORMANCE_DESC') ||
                          'Optimized flat barebones styling for maximum responsiveness, low battery use, and zero input lag.',
                      },
                      {
                        id: 'balanced' as const,
                        title: t('QUALITY_BALANCED_TITLE') || 'Balanced Mode (32-Bit)',
                        badge: '60 FPS',
                        desc:
                          t('QUALITY_BALANCED_DESC') ||
                          'Original 32-bit retro arcade aesthetic with stepped pixel bevels, CRT scanlines, and procedural audio.',
                      },
                      {
                        id: 'high' as const,
                        title: t('QUALITY_HIGH_QUALITY_TITLE') || 'High Quality Mode (Cyber-Arcade)',
                        badge: '120 FPS',
                        desc:
                          t('QUALITY_HIGH_QUALITY_DESC') ||
                          'Deluxe visual overhaul with volumetric neon glow, holographic foil card shimmer, and particle cascades.',
                      },
                    ].map((q) => {
                      const isSelected =
                        graphicSettings.quality === q.id ||
                        (q.id === 'high' && graphicSettings.quality === 'high_quality');
                      return (
                        <button
                          key={q.id}
                          id={`main-menu-quality-opt-${q.id}`}
                          type="button"
                          onClick={() => {
                            updateGraphicSettings({ quality: q.id });
                            haptics.buttonPress();
                          }}
                          className={`w-full min-h-[72px] p-3 border rounded-xl flex items-start justify-between gap-3 text-left transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? q.id === 'high'
                                ? 'bg-purple-950/60 border-2 border-purple-400 text-white'
                                : q.id === 'performance'
                                ? 'bg-cyan-950/60 border-2 border-cyan-400 text-white'
                                : 'bg-amber-950/60 border-2 border-amber-400 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                                {q.title}
                              </span>
                              <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-600">
                                {q.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                              {q.desc}
                            </p>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-xs font-mono font-black px-2.5 py-1 rounded bg-emerald-500 text-slate-950">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ON
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-mono text-slate-300 bg-slate-800 border border-slate-600 px-2.5 py-1 rounded">
                                SELECT
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Colorblind Mode Selection */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>{t('Colorblind Mode')}</span>
                    </label>
                    <span className="text-xs font-mono text-slate-300 capitalize">
                      {graphicSettings.colorblindMode.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'none' as const, label: 'Standard', desc: 'Default color palette' },
                      { id: 'protanopia' as const, label: 'Protanopia', desc: 'Red-weak color assistance' },
                      { id: 'deuteranopia' as const, label: 'Deuteranopia', desc: 'Green-weak color assistance' },
                      { id: 'tritanopia' as const, label: 'Tritanopia', desc: 'Blue-weak color assistance' },
                      { id: 'high_contrast' as const, label: 'High Contrast', desc: 'Maximum contrast boost' },
                    ].map((c) => {
                      const isSelected = graphicSettings.colorblindMode === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => updateGraphicSettings({ colorblindMode: c.id })}
                          className={`w-full min-h-[52px] p-2.5 border rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 font-bold'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white block">{c.label}</span>
                            <p className="text-xs text-slate-300 font-sans">{c.desc}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  id="main-menu-open-advanced-graphic-btn"
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowGraphicSettingsModal(true);
                  }}
                  className="w-full min-h-[48px] py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-400 rounded-xl text-amber-300 text-xs sm:text-sm font-arcade font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t('OPEN_ADVANCED_GRAPHICS_MODAL') || 'ADVANCED GRAPHICS & HAPTIC STUDIO'}</span>
                </button>

                <button
                  type="button"
                  id="main-menu-open-testmode-from-settings-btn"
                  onClick={() => setOptionsActiveTab('testmode')}
                  className="w-full min-h-[48px] py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-xl text-amber-300 text-xs font-mono font-bold flex items-center justify-between transition cursor-pointer active:scale-95"
                >
                  <span>{t('OPEN TEST MODE MENU')} →</span>
                  <span className="text-xs text-slate-300">
                    {isTestMode ? (isMagicTool ? '✨ MAGIC READY' : 'TEST ACTIVE') : 'OFF'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUTOSAVE OPTIONS */}
        {optionsActiveTab === 'autosave' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg flex items-center justify-center shrink-0">
                  <Save className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black uppercase tracking-wider text-white block">
                    {t('Automatic Career Saving')}
                  </span>
                  <span className="text-xs text-slate-300 font-sans block">
                    {autosaveSettings.enabled
                      ? t('Career progress saves automatically at scheduled milestones')
                      : t('Autosave is disabled (manual saves only)')}
                  </span>
                </div>
              </div>
              <button
                id="options-toggle-autosave-btn"
                type="button"
                onClick={() => updateAutosaveSettings({ enabled: !autosaveSettings.enabled })}
                className={`min-h-[44px] px-4 py-2 text-xs font-mono font-black transition-all cursor-pointer active:scale-95 border rounded-lg shrink-0 ${
                  autosaveSettings.enabled
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700'
                }`}
              >
                {autosaveSettings.enabled ? t('ENABLED') : t('DISABLED')}
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-400">
                  {t('Autosave Frequency')}
                </label>
                <span className="text-xs font-mono text-slate-300 uppercase font-bold">
                  {autosaveSettings.frequency === 'every_6_months' && 'High Frequency'}
                  {autosaveSettings.frequency === 'every_season' && 'Standard'}
                  {autosaveSettings.frequency === 'every_2_seasons' && 'Low Frequency'}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'every_6_months' as AutosaveFrequency,
                    title: 'Every 6 Months',
                    sub: 'Saves at Pre-Season, Mid-Season Break & Season End',
                    tag: 'Highest Safety',
                  },
                  {
                    id: 'every_season' as AutosaveFrequency,
                    title: 'Every Season (Default)',
                    sub: 'Saves at End of Season during Contract & Trophy Gala',
                    tag: 'Recommended',
                  },
                  {
                    id: 'every_2_seasons' as AutosaveFrequency,
                    title: 'Every 2 Seasons',
                    sub: 'Saves every 2 full seasons for lighter storage footprint',
                    tag: 'Minimal',
                  },
                ].map((opt) => {
                  const isSelected = autosaveSettings.frequency === opt.id;
                  return (
                    <button
                      key={opt.id}
                      id={`autosave-freq-opt-${opt.id}`}
                      type="button"
                      onClick={() => updateAutosaveSettings({ frequency: opt.id })}
                      className={`w-full min-h-[60px] p-3 border rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-95 ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">{opt.title}</span>
                          <span
                            className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                              isSelected
                                ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {opt.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans mt-1">{opt.sub}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 stroke-[3] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs sm:text-sm font-sans text-slate-200 leading-relaxed px-1">
              💾 {t('Autosaves preserve your current career progression, statistics, transfer history, and store inventory across local career slots.')}
            </p>
          </div>
        )}

        {/* TAB 4: DEVELOPER TEST MODE */}
        {optionsActiveTab === 'testmode' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg flex items-center justify-center shrink-0">
                  <Beaker className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black uppercase tracking-wider text-white block">
                    {t('Developer Test Mode')}
                  </span>
                  <span className="text-xs text-slate-300 font-sans block">
                    {isTestMode
                      ? t('Test mode is ACTIVE: debug tools and stat modifiers are unlocked')
                      : t('Test mode is OFF: standard simulation rules apply')}
                  </span>
                </div>
              </div>
              <button
                id="options-toggle-testmode-btn"
                type="button"
                onClick={() => setTestMode(!isTestMode)}
                className={`min-h-[44px] px-4 py-2 text-xs font-mono font-black transition-all cursor-pointer active:scale-95 border rounded-lg shrink-0 ${
                  isTestMode
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-700'
                }`}
              >
                {isTestMode ? t('ACTIVE') : t('DISABLED')}
              </button>
            </div>

            <div
              className={`p-3.5 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                isMagicTool ? 'bg-amber-950/40 border-amber-500/80' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    isMagicTool
                      ? 'bg-amber-500 text-slate-950 border-amber-300'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <Wand2 className={`w-5 h-5 ${isMagicTool ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400'}`} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black uppercase tracking-wider text-white block">
                    {t('Magic Tool (UI & Translation Inspector)')}
                  </span>
                  <span className="text-xs text-slate-300 font-sans block">
                    {!isTestMode
                      ? t('Activate to enable Test Mode and launch the floating Magic Tool')
                      : isMagicTool
                      ? t('Magic Tool is ACTIVE: Floating inspector is visible on screen')
                      : t('Magic Tool is OFF: Toggle ON to show the floating inspector')}
                  </span>
                </div>
              </div>
              <button
                id="options-toggle-magictool-btn"
                type="button"
                onClick={() => {
                  if (!isTestMode) {
                    enableMagicToolWithTestMode();
                    showToast('✨ Test Mode & Magic Tool enabled! Floating inspector is now active.');
                  } else {
                    const next = !isMagicTool;
                    setMagicTool(next);
                    showToast(next ? '✨ Magic Tool enabled!' : 'Magic Tool disabled.');
                  }
                }}
                className={`min-h-[44px] px-4 py-2 text-xs font-mono font-black transition-all cursor-pointer active:scale-95 border rounded-lg shrink-0 ${
                  isMagicTool
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {isMagicTool ? t('ACTIVE') : t('DISABLED')}
              </button>
            </div>

            {isTestMode && isMagicTool && (
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2.5">
                <span className="text-xs text-amber-300 font-mono font-bold block">✨ Magic Tool Live Actions:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsModal(false);
                      triggerMagicInspect(true);
                      showToast('✨ Magic Inspect mode activated! Hover & click any text on screen.');
                    }}
                    className="min-h-[44px] py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-arcade text-xs font-black uppercase tracking-wider rounded-lg border border-amber-300 shadow flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Crosshair className="w-4 h-4 stroke-[2.5]" />
                    <span>Inspect Main Menu UI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsModal(false);
                      triggerMagicAuditModal(true);
                    }}
                    className="min-h-[44px] py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 font-arcade text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Open Audit Center</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 px-1 text-slate-200">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-300 uppercase">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t('Test Mode Capabilities')}</span>
              </div>
              <ul className="text-xs sm:text-sm text-slate-200 space-y-1.5 list-disc pl-5 leading-relaxed font-sans">
                <li>{t('Instant test dashboard in Persistent UI with full stat inspector')}</li>
                <li>{t('Quick-advance and speed simulation toggles')}</li>
                <li>{t('Custom card deck testing and attribute override tools')}</li>
                <li>{t('Transfers, contract, and youth academy fast validation')}</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 5: OFFLINE DOWNLOAD CENTER */}
        {optionsActiveTab === 'sync' && (
          <div className="space-y-3 font-sans">
            <div className="p-4 bg-gradient-to-r from-amber-950/60 to-slate-950 border-2 border-amber-500/80 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <Download className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-arcade font-black text-white uppercase tracking-wider">
                    {t('Offline Game Downloads')}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                    {t('Download standalone packages for PC (Windows), Linux, and Mobile (Android APK).')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowOptionsModal(false);
                  setShowSyncModal(true);
                }}
                className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-amber-300 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>{t('OPEN OFFLINE DOWNLOAD CENTER')}</span>
              </button>
            </div>
          </div>
        )}
      </ConsoleModalShell>

      {/* Graphic Settings Modal Standalone Trigger */}
      <GraphicSettingsModal
        isOpen={showGraphicSettingsModal}
        onClose={() => setShowGraphicSettingsModal(false)}
      />

      {/* Language Picker Modal Triggered from Options */}
      <LanguagePickerModal isOpen={showLangModal} onClose={() => setShowLangModal(false)} />

      {/* Project Sync & Archive Exporter Modal */}
      <ProjectSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        showToast={showToast}
      />

      {/* First-Time Unique Career -> Card Store Starter Packs Tutorial */}
      <UniqueCareerStoreRedirectTutorialModal
        isOpen={showUniqueCareerStoreTutorial}
        onCancel={() => setShowUniqueCareerStoreTutorial(false)}
        onGoToStore={() => {
          setShowUniqueCareerStoreTutorial(false);
          if (onOpenStoreForStarterTutorial) {
            onOpenStoreForStarterTutorial();
          } else {
            handleOpenStore();
          }
        }}
      />
    </div>
    </React.Suspense>
  );
};

