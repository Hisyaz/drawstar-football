import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Crown,
  Shield,
  ChevronRight,
  ChevronLeft,
  FastForward,
  CheckCircle2,
  X,
  ArrowRight,
  Play,
} from 'lucide-react';
import { WorldAwardsSeasonResults } from '../types/individualAwards';
import { PlayerCardData } from '../types';
import { FlagVector } from './FlagVectors';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

export interface AwardsCeremonyModalProps {
  isOpen: boolean;
  awardsData: WorldAwardsSeasonResults;
  onClose: () => void;
  onCeremonyComplete?: () => void;
  player?: PlayerCardData;
  seasonYear?: string;
}

type CeremonyStage =
  | 'intro'
  | 'golden_boot'
  | 'golden_creator'
  | 'golden_boy'
  | 'yashin'
  | 'world_xi'
  | 'ballon_dor'
  | 'grand_finale';

const CEREMONY_STAGES: CeremonyStage[] = [
  'intro',
  'golden_boot',
  'golden_creator',
  'golden_boy',
  'yashin',
  'world_xi',
  'ballon_dor',
  'grand_finale',
];

const BALLON_DOR_PAGE_SIZE = 5;

export const AwardsCeremonyModal: React.FC<AwardsCeremonyModalProps> = ({
  isOpen,
  awardsData,
  onClose,
  onCeremonyComplete,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [ballonDorPage, setBallonDorPage] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStage = CEREMONY_STAGES[currentStageIdx];

  const triggerGoldConfetti = () => {
    if (shouldDisableParticles()) return;
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff', '#eab308'],
      });
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStageIdx(0);
      setRevealedCount(0);
      setBallonDorPage(1);
      setIsAutoPlaying(true);
    }
  }, [isOpen]);

  useEffect(() => {
    setRevealedCount(0);
    setBallonDorPage(1);
  }, [currentStageIdx]);

  const getStageItemsInfo = () => {
    switch (currentStage) {
      case 'golden_boot':
        return {
          title: 'BEST STRIKER OF THE YEAR',
          subtitle:
            "Awarded to world football's supreme striker for overall attacking performance, clinical scoring, and decisive calendar-year impact",
          icon: '⚡',
          type: 'list_5',
          items: awardsData.bestStriker ? [...awardsData.bestStriker].reverse() : [...awardsData.europeanGoldenBoot].reverse(),
          total: awardsData.bestStriker ? awardsData.bestStriker.length : awardsData.europeanGoldenBoot.length,
        };
      case 'golden_creator':
        return {
          title: 'GOLDEN CREATOR',
          subtitle: 'Awarded to the highest playmaker in European league football with tier-weighted assists',
          icon: '🎯',
          type: 'list_5',
          items: [...awardsData.goldenCreator].reverse(),
          total: awardsData.goldenCreator.length,
        };
      case 'golden_boy':
        return {
          title: 'GOLDEN BOY TROPHY',
          subtitle: 'Awarded to the most outstanding U21 football prodigy in world football',
          icon: '🌟',
          type: 'list_5',
          items: [...awardsData.goldenBoy].reverse(),
          total: awardsData.goldenBoy.length,
        };
      case 'yashin':
        return {
          title: 'YASHIN TROPHY',
          subtitle: 'Awarded to the best goalkeeper in world football and designated World XI starter',
          icon: '🧤',
          type: 'list_5',
          items: [...awardsData.yashinTrophy].reverse(),
          total: awardsData.yashinTrophy.length,
        };
      case 'world_xi':
        return {
          title: 'FIFPRO WORLD XI',
          subtitle: `The ultimate global 11 chosen through authentic voting in ${awardsData.worldXI.formation}`,
          icon: '🌐',
          type: 'world_xi',
          items: awardsData.worldXI.allEleven,
          total: 11,
        };
      case 'ballon_dor':
        return {
          title: "BALLON D'OR",
          subtitle: 'The supreme individual honor in world football awarded to the ultimate champion of the year',
          icon: '🏆',
          type: 'ballon_dor',
          items: [...awardsData.ballonDor].reverse(),
          total: awardsData.ballonDor.length,
        };
      default:
        return {
          title: 'WORLD INDIVIDUAL AWARDS GALA',
          subtitle: 'Celebrating world football excellence',
          icon: '🏆',
          type: 'intro',
          items: [],
          total: 0,
        };
    }
  };

  const stageInfo = getStageItemsInfo();

  useEffect(() => {
    if (!isOpen) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (
      isAutoPlaying &&
      currentStage !== 'intro' &&
      currentStage !== 'grand_finale' &&
      stageInfo.total > 0 &&
      revealedCount < stageInfo.total
    ) {
      timerRef.current = setInterval(() => {
        setRevealedCount((prev) => {
          if (prev < stageInfo.total) {
            return prev + 1;
          }
          return prev;
        });
      }, 1200);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, isAutoPlaying, currentStage, stageInfo.total, revealedCount >= stageInfo.total]);

  useEffect(() => {
    if (
      isOpen &&
      currentStage !== 'intro' &&
      currentStage !== 'grand_finale' &&
      stageInfo.total > 0 &&
      revealedCount === stageInfo.total
    ) {
      triggerGoldConfetti();
    }
  }, [isOpen, currentStage, revealedCount, stageInfo.total]);

  // Follow the latest revealed Ballon d'Or block automatically while auto-revealing
  useEffect(() => {
    if (currentStage === 'ballon_dor' && revealedCount > 0) {
      const targetPage = Math.max(1, Math.ceil(revealedCount / BALLON_DOR_PAGE_SIZE));
      setBallonDorPage(targetPage);
    }
  }, [currentStage, revealedCount]);

  if (!isOpen) return null;

  const finishCeremony = () => {
    if (onCeremonyComplete) {
      onCeremonyComplete();
    } else {
      onClose();
    }
  };

  const handleNextStage = () => {
    if (currentStageIdx < CEREMONY_STAGES.length - 1) {
      setCurrentStageIdx((prev) => prev + 1);
    } else {
      finishCeremony();
    }
  };

  const handleSkipCurrentCategory = () => {
    setRevealedCount(stageInfo.total);
    if (currentStage === 'ballon_dor') {
      const lastPage = Math.max(1, Math.ceil(stageInfo.total / BALLON_DOR_PAGE_SIZE));
      setBallonDorPage(lastPage);
    }
    triggerGoldConfetti();
  };

  const ballonTotalPages = Math.max(1, Math.ceil(stageInfo.items.length / BALLON_DOR_PAGE_SIZE));
  const safeBallonPage = Math.min(Math.max(1, ballonDorPage), ballonTotalPages);
  const visibleBallonItems =
    currentStage === 'ballon_dor'
      ? stageInfo.items
          .map((item, idx) => ({ item, idx }))
          .slice((safeBallonPage - 1) * BALLON_DOR_PAGE_SIZE, safeBallonPage * BALLON_DOR_PAGE_SIZE)
      : [];

  const renderFooter = () => {
    if (currentStage === 'intro') {
      return (
        <div className="flex items-center justify-between gap-2">
          <button
            id="ceremony-top-back-btn"
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-200 border border-amber-500/40 text-xs font-arcade font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span>RETURN</span>
          </button>
          <button
            id="ceremony-begin-btn"
            type="button"
            onClick={handleNextStage}
            className="min-h-[48px] flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-neutral-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>BEGIN CEREMONY</span>
          </button>
        </div>
      );
    }

    if (currentStage === 'grand_finale') {
      return (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentStageIdx(CEREMONY_STAGES.length - 2)}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-200 border border-amber-500/40 text-xs font-arcade font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span>PREV</span>
          </button>
          <button
            id="ceremony-return-summary-btn"
            type="button"
            onClick={finishCeremony}
            className="min-h-[48px] flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-neutral-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>RETURN TO SEASON SUMMARY</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between gap-2 w-full">
        <button
          id="ceremony-prev-category-btn"
          type="button"
          disabled={currentStageIdx <= 1}
          onClick={() => setCurrentStageIdx((prev) => Math.max(1, prev - 1))}
          className="min-h-[44px] px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-amber-200 text-xs font-arcade font-bold border border-amber-500/30 transition flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">PREVIOUS</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAutoPlaying((prev) => !prev)}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-arcade font-bold border transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            isAutoPlaying
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-neutral-900 border-neutral-700 text-neutral-300'
          }`}
        >
          <span>{isAutoPlaying ? 'PAUSE' : 'AUTO-PLAY'}</span>
        </button>

        {revealedCount < stageInfo.total ? (
          <button
            id="ceremony-skip-category-btn"
            type="button"
            onClick={handleSkipCurrentCategory}
            className="min-h-[44px] flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-arcade font-black border border-amber-400/50 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>REVEAL ALL</span>
          </button>
        ) : (
          <button
            id="ceremony-next-category-btn"
            type="button"
            onClick={handleNextStage}
            className="min-h-[44px] flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 font-arcade font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{currentStageIdx === CEREMONY_STAGES.length - 2 ? 'FINISH' : 'NEXT AWARD'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        )}
      </div>
    );
  };

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      title={stageInfo.title}
      subtitle={`World Football Gala • ${awardsData.seasonYear}`}
      badge={`${currentStageIdx + 1} / ${CEREMONY_STAGES.length}`}
      icon={<span className="text-lg sm:text-xl">🏆</span>}
      accentColor="amber"
      maxWidthClass="sm:max-w-4xl"
      zIndexClass="z-[120]"
      bodyClassName="p-3.5 sm:p-6 flex flex-col justify-start"
      headerRight={
        <div className="flex items-center gap-1.5 shrink-0">
          {currentStage !== 'intro' && (
            <button
              id="ceremony-top-back-btn"
              type="button"
              onClick={onClose}
              aria-label="Return"
              className="min-h-[44px] min-w-[44px] px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-500/40 text-xs font-arcade font-bold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">RETURN</span>
            </button>
          )}
          <button
            id="ceremony-skip-all-btn"
            type="button"
            onClick={finishCeremony}
            className="min-h-[44px] px-2.5 sm:px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 text-xs font-arcade font-bold border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <FastForward className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Skip Ceremony</span>
            <span className="sm:hidden">Skip</span>
          </button>
          <button
            id="ceremony-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close Ceremony"
            className="min-w-[44px] min-h-[44px] rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center justify-center border border-amber-500/30 cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      }
      footer={renderFooter()}
    >
      <AnimatePresence mode="wait">
        {/* 1. INTRO STAGE */}
        {currentStage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="text-center py-4 sm:py-6 px-1 sm:px-4 flex flex-col items-center justify-center space-y-5 my-auto"
          >
            <div className="relative">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-800 p-1 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center text-4xl sm:text-5xl">
                  🏆
                </div>
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-amber-300 animate-pulse" />
            </div>

            <div className="max-w-xl space-y-2">
              <div className="text-amber-400 font-extrabold tracking-widest text-xs uppercase">
                Annual Honors & Global Recognition
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500">
                WORLD INDIVIDUAL AWARDS
              </h1>
              <p className="text-amber-100/80 text-sm sm:text-base leading-relaxed">
                Derived entirely from simulated matchdays, official league goals, continental clashes, and international tournaments.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 w-full max-w-2xl pt-1">
              {[
                { label: 'Golden Boot', icon: '⚽' },
                { label: 'Golden Creator', icon: '🎯' },
                { label: 'Golden Boy', icon: '🌟' },
                { label: 'Yashin Trophy', icon: '🧤' },
                { label: 'World XI', icon: '🌐' },
                { label: "Ballon d'Or", icon: '🏆' },
              ].map((c, i) => (
                <div key={i} className="bg-neutral-900/70 border border-amber-400/25 rounded-xl p-2.5 text-center flex flex-col items-center">
                  <span className="text-xl sm:text-2xl mb-1">{c.icon}</span>
                  <span className="text-xs font-bold text-amber-200 leading-tight">{c.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 2. TOP 5 LIST AWARDS */}
        {(currentStage === 'golden_boot' ||
          currentStage === 'golden_creator' ||
          currentStage === 'golden_boy' ||
          currentStage === 'yashin') && (
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 w-full max-w-2xl mx-auto"
          >
            <div className="text-center space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-300 text-xs font-bold uppercase tracking-wider">
                Category {currentStageIdx} of {CEREMONY_STAGES.length - 2}
              </span>
              <p className="text-amber-100/80 text-sm leading-relaxed">
                {stageInfo.subtitle}
              </p>
            </div>

            <div className="space-y-2.5">
              {stageInfo.items.map((rawItem: any, idx: number) => {
                const isRevealed = idx < revealedCount;
                const isWinner = rawItem.rank === 1 || rawItem.isWinner;

                if (!isRevealed) {
                  return (
                    <div
                      key={rawItem.id || idx}
                      className="h-14 rounded-2xl bg-neutral-950/50 border border-amber-500/15 flex items-center justify-between px-4 opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-500/60">#{rawItem.rank}</span>
                        <span className="text-xs font-mono tracking-widest text-amber-400/40">••••••••••••••••</span>
                      </div>
                      <span className="text-xs text-amber-500/40 font-bold">Unrevealed</span>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={rawItem.id || idx}
                    initial={{ opacity: 0, x: -16, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`rounded-2xl p-3 sm:p-4 border transition-all flex items-center justify-between gap-3 ${
                      isWinner
                        ? 'bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/60'
                        : 'bg-neutral-950/80 border-amber-500/25'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow ${
                          rawItem.rank === 1
                            ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-black'
                            : rawItem.rank === 2
                            ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black'
                            : rawItem.rank === 3
                            ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                            : 'bg-neutral-800 text-amber-300/80'
                        }`}
                      >
                        {rawItem.rank === 1 ? '🥇' : `#${rawItem.rank}`}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-amber-50 truncate">
                            {rawItem.name}
                          </span>
                          {rawItem.isUserPlayer && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase">
                              YOU
                            </span>
                          )}
                          {isWinner && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
                              WINNER
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-amber-200/75 truncate">
                          <FlagVector countryCode={rawItem.countryCode} className="w-4 h-3 rounded-sm shrink-0" />
                          <span className="truncate">{rawItem.club}</span>
                          {rawItem.leagueName && <span className="hidden sm:inline text-amber-400/80">• {rawItem.leagueName}</span>}
                          {rawItem.age && <span>• Age {rawItem.age}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {currentStage === 'golden_boot' && (
                        <div>
                          <div className="text-base sm:text-lg font-black text-amber-300">
                            {rawItem.attackingScore ?? rawItem.weightedPoints} <span className="text-xs font-normal text-amber-400/70">pts</span>
                          </div>
                          <div className="text-[11px] text-amber-200/70 font-mono">
                            {rawItem.goals}G{rawItem.assists ? ` • ${rawItem.assists}A` : ''}
                          </div>
                        </div>
                      )}
                      {currentStage === 'golden_creator' && (
                        <div>
                          <div className="text-base sm:text-lg font-black text-amber-300">
                            {rawItem.weightedPoints} <span className="text-xs font-normal text-amber-400/70">pts</span>
                          </div>
                          <div className="text-[11px] text-amber-200/70 font-mono">
                            {rawItem.assists} ast × {rawItem.leagueFactor.toFixed(1)}
                          </div>
                        </div>
                      )}
                      {currentStage === 'golden_boy' && (
                        <div>
                          <div className="text-base sm:text-lg font-black text-amber-300">
                            {rawItem.ovr} <span className="text-xs font-normal text-amber-400/70">OVR</span>
                          </div>
                          <div className="text-[11px] font-bold text-amber-400/80">{rawItem.tier}</div>
                        </div>
                      )}
                      {currentStage === 'yashin' && (
                        <div>
                          <div className="text-base sm:text-lg font-black text-amber-300">
                            {rawItem.points} <span className="text-xs font-normal text-amber-400/70">pts</span>
                          </div>
                          <div className="text-[11px] font-mono text-amber-200/70">{rawItem.ovr} OVR</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 5. WORLD XI TACTICAL FORMATION CEREMONY */}
        {currentStage === 'world_xi' && (
          <motion.div
            key="world_xi"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="space-y-4 w-full max-w-3xl mx-auto"
          >
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>Formation: {awardsData.worldXI.formation}</span>
              </div>
              <p className="text-amber-100/75 text-xs sm:text-sm">
                Featuring the Yashin Winner in goal + top performers worldwide by main position
              </p>
            </div>

            <div className="relative rounded-2xl bg-neutral-950 border border-amber-500/40 p-3 sm:p-5 overflow-hidden shadow-inner">
              <div className="absolute inset-2 border border-amber-500/20 rounded-xl pointer-events-none" />
              <div className="absolute top-1/2 left-2 right-2 h-px bg-amber-500/20 pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between space-y-4">
                {[
                  { label: 'ATT', color: 'text-rose-400', players: awardsData.worldXI.attackers },
                  { label: 'MID', color: 'text-amber-400', players: awardsData.worldXI.midfielders },
                  { label: 'DEF', color: 'text-blue-400', players: awardsData.worldXI.defenders },
                ].map((row) => (
                  <div key={row.label} className="flex flex-wrap justify-center sm:justify-around items-start gap-2.5 sm:gap-3">
                    {row.players.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center w-[74px] sm:w-[96px]">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30">
                          <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                            <span className={`text-[10px] font-black ${row.color}`}>{row.label}</span>
                            <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-amber-100 mt-1 w-full truncate">{p.name}</span>
                        <span className="text-[10px] text-amber-300/75 w-full truncate">{p.club}</span>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Goalkeeper */}
                <div className="flex justify-center items-center pt-1">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-700 p-0.5 shadow-xl shadow-yellow-500/40">
                      <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-emerald-400">GK</span>
                        <span className="text-xs font-black text-amber-200">{awardsData.worldXI.goalkeeper.ovr}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-black text-amber-100 max-w-[140px] truncate">
                        {awardsData.worldXI.goalkeeper.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300/75 truncate max-w-[140px]">
                      {awardsData.worldXI.goalkeeper.club}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 6. BALLON D'OR CEREMONY (Paged 5/page instead of nested scroll) */}
        {currentStage === 'ballon_dor' && (
          <motion.div
            key="ballon_dor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3.5 w-full max-w-2xl mx-auto"
          >
            <div className="text-center space-y-1">
              <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 text-xs font-black uppercase tracking-widest shadow-md shadow-amber-500/20">
                👑 THE PINNACLE AWARD
              </span>
              <p className="text-amber-100/80 text-xs sm:text-sm">
                Evaluated by Worldwide Trophy Points & Ultimate Matchday Dominance ({revealedCount}/{stageInfo.total} revealed)
              </p>
            </div>

            {ballonTotalPages > 1 && (
              <ConsolePaginationBar
                currentPage={safeBallonPage}
                totalPages={ballonTotalPages}
                onPageChange={setBallonDorPage}
                totalItems={stageInfo.items.length}
                pageSize={BALLON_DOR_PAGE_SIZE}
                label="RANKINGS"
              />
            )}

            <div className="space-y-2">
              {visibleBallonItems.map(({ item: rawItem, idx }) => {
                const isRevealed = idx < revealedCount;
                const isWinner = rawItem.rank === 1 || rawItem.isWinner;

                if (!isRevealed) {
                  return (
                    <div
                      key={rawItem.id || idx}
                      className="h-12 rounded-xl bg-neutral-950/50 border border-amber-500/15 flex items-center justify-between px-4 opacity-45"
                    >
                      <span className="text-xs font-bold text-amber-500/60">#{rawItem.rank}</span>
                      <span className="text-xs font-mono tracking-widest text-amber-400/40">••••••••••••••</span>
                      <span className="text-xs text-amber-500/40">Classified</span>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={rawItem.id || idx}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-2xl p-3 border transition-all flex items-center justify-between gap-3 ${
                      isWinner
                        ? 'bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.5)] ring-2 ring-amber-400'
                        : 'bg-neutral-950/75 border-amber-500/25'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                          rawItem.rank === 1
                            ? 'bg-gradient-to-br from-amber-300 to-yellow-500 text-black shadow-lg shadow-amber-500/40'
                            : 'bg-neutral-800 text-amber-300/80'
                        }`}
                      >
                        {rawItem.rank === 1 ? '👑' : `#${rawItem.rank}`}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-amber-50 truncate">
                            {rawItem.name}
                          </span>
                          {rawItem.isUserPlayer && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black">
                              YOU
                            </span>
                          )}
                          {isWinner && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider animate-pulse">
                              WINNER
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-amber-200/75 truncate">
                          <FlagVector countryCode={rawItem.countryCode} className="w-3.5 h-2.5 rounded-sm shrink-0" />
                          <span className="truncate">{rawItem.club}</span>
                          <span>•</span>
                          <span className="shrink-0">{rawItem.ovr} OVR</span>
                          {rawItem.pointsBreakdown?.[0] && (
                            <span className="hidden sm:inline text-amber-400/90 text-xs truncate">
                              • {rawItem.pointsBreakdown[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-black text-amber-300">
                        {rawItem.points} <span className="text-xs font-normal text-amber-400/70">pts</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 7. GRAND FINALE */}
        {currentStage === 'grand_finale' && (
          <motion.div
            key="grand_finale"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="text-center py-4 px-2 sm:px-4 space-y-5 my-auto"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-1 mx-auto shadow-[0_0_40px_rgba(245,158,11,0.5)]">
              <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center text-3xl">
                🌟
              </div>
            </div>

            <div className="max-w-lg mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-amber-100">
                AWARDS GALA COMPLETE
              </h2>
              <p className="text-amber-100/80 text-sm sm:text-base leading-relaxed">
                All individual honors and global rankings have been recorded into the permanent season history archives.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto text-left">
              <div className="bg-neutral-900/85 border border-amber-500/25 rounded-xl p-3">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">Golden Boot</span>
                <span className="text-sm font-black text-amber-100 truncate block mt-0.5">{awardsData.europeanGoldenBoot[0]?.name}</span>
                <span className="text-xs text-amber-300/70 font-mono">{awardsData.europeanGoldenBoot[0]?.weightedPoints} pts</span>
              </div>

              <div className="bg-neutral-900/85 border border-amber-500/25 rounded-xl p-3">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">Golden Creator</span>
                <span className="text-sm font-black text-amber-100 truncate block mt-0.5">{awardsData.goldenCreator[0]?.name}</span>
                <span className="text-xs text-amber-300/70 font-mono">{awardsData.goldenCreator[0]?.weightedPoints} pts</span>
              </div>

              <div className="bg-neutral-900/85 border border-amber-500/25 rounded-xl p-3">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">Golden Boy</span>
                <span className="text-sm font-black text-amber-100 truncate block mt-0.5">{awardsData.goldenBoy[0]?.name}</span>
                <span className="text-xs text-amber-300/70 font-mono">{awardsData.goldenBoy[0]?.ovr} OVR</span>
              </div>

              <div className="bg-neutral-900/85 border border-amber-500/25 rounded-xl p-3">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">Ballon d'Or</span>
                <span className="text-sm font-black text-amber-100 truncate block mt-0.5">{awardsData.ballonDor[0]?.name}</span>
                <span className="text-xs text-amber-300/70 font-mono">{awardsData.ballonDor[0]?.points} pts</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConsoleModalShell>
  );
};
