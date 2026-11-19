import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Play,
  FastForward,
  CheckCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  NationalTournamentDrawState,
  TournamentNation,
  getNationalTournamentConfig,
} from '../utils/nationalTournamentManager';
import { ConsoleModalShell, ConsolePaginationBar, ConsolePageTab } from './common/ConsolePager';

interface NationalTournamentDrawProps {
  drawState: NationalTournamentDrawState;
  onCompleteDraw: (completedDrawState: NationalTournamentDrawState) => void;
  onClose?: () => void;
}

export type NationalDrawStep = 1 | 2 | 3; // 1: Pot Reveal, 2: Group Draw, 3: Fixture Schedule

export const NationalTournamentDraw: React.FC<NationalTournamentDrawProps> = ({
  drawState,
  onCompleteDraw,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<NationalDrawStep>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [revealedTeams, setRevealedTeams] = useState<Set<string>>(new Set());
  const [activeDrawnTeam, setActiveDrawnTeam] = useState<TournamentNation | null>(null);
  const [activeLog, setActiveLog] = useState<string>('Press "Draw Next" to commence the official draw ceremony.');
  const [isDrawFinished, setIsDrawFinished] = useState<boolean>(false);
  const [mobilePotPage, setMobilePotPage] = useState<number>(1);
  const [focusedGroupIndex, setFocusedGroupIndex] = useState<number>(0);

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const config = getNationalTournamentConfig(
    drawState.competitionName,
    drawState.playerNation.code,
    drawState.tier
  );

  const theme = config.theme;
  const totalSteps = drawState.animationSteps.length;

  const playerGroupIndex = drawState.groups.findIndex((g) =>
    g.teams.some((t) => t.code.toUpperCase() === drawState.playerNation.code.toUpperCase())
  );

  useEffect(() => {
    if (playerGroupIndex >= 0) {
      setFocusedGroupIndex(playerGroupIndex);
    }
  }, [playerGroupIndex]);

  useEffect(() => {
    setCurrentStep(1);
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
    setRevealedTeams(new Set());
    setActiveDrawnTeam(null);
    setActiveLog('Press "Draw Next" to commence the official draw ceremony.');
    setIsDrawFinished(false);
    setMobilePotPage(1);
  }, [drawState.competitionName, drawState.playerNation.code, totalSteps]);

  const finishDraw = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setIsAutoPlaying(false);
    setIsDrawFinished(true);
  };

  const handleNextStep = () => {
    if (currentStepIndex >= totalSteps) {
      finishDraw();
      return;
    }

    const step = drawState.animationSteps[currentStepIndex];
    if (!step) return;

    setActiveDrawnTeam(step.team);
    setActiveLog(step.logText);
    setRevealedTeams((prev) => new Set([...prev, step.team.code]));
    setCurrentStepIndex((prev) => prev + 1);

    if (currentStepIndex + 1 >= totalSteps) {
      finishDraw();
    }
  };

  const handleNextStepRef = useRef(handleNextStep);
  useEffect(() => {
    handleNextStepRef.current = handleNextStep;
  });

  const handleInstantDraw = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setIsAutoPlaying(false);

    const allCodes = new Set<string>();
    drawState.groups.forEach((g) => {
      g.teams.forEach((t) => allCodes.add(t.code));
    });

    setRevealedTeams(allCodes);
    setCurrentStepIndex(totalSteps);
    setActiveDrawnTeam(drawState.playerNation);
    setActiveLog(`All ${drawState.groups.length} groups have been officially finalized!`);
    finishDraw();
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (isAutoPlaying && !isDrawFinished) {
      autoPlayRef.current = setInterval(() => {
        handleNextStepRef.current();
      }, 500);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, isDrawFinished]);

  const renderFlag = (iso: string, name: string) => {
    const cleanIso = (iso || 'un').toLowerCase().replace('gb-', '');
    return (
      <img
        src={`https://flagcdn.com/w40/${cleanIso}.png`}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-5 h-3.5 object-cover rounded shadow-sm border border-slate-700/50 shrink-0"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  };

  const isPlayerNation = (code: string) => {
    return code.toUpperCase() === drawState.playerNation.code.toUpperCase();
  };

  const groupsList = drawState.groups;
  const currentFocusedGroup = groupsList[focusedGroupIndex] || groupsList[0];
  const pots = drawState.pots || [];
  const totalPots = Math.max(1, pots.length);
  const safePotPage = Math.min(Math.max(1, mobilePotPage), totalPots);
  const currentMobilePot = pots[safePotPage - 1];

  const stepTabs: ConsolePageTab[] = [
    { id: '1', label: '1. Pots' },
    { id: '2', label: '2. Draw' },
    { id: '3', label: '3. Schedule' },
  ];

  const handleTabChange = (tabId: string) => {
    const nextStep = Number(tabId) as NationalDrawStep;
    if (nextStep === 3) {
      handleInstantDraw();
    }
    setCurrentStep(nextStep);
  };

  return (
    <ConsoleModalShell
      isOpen={true}
      onClose={onClose}
      showCloseButton={false}
      title={drawState.competitionName}
      subtitle={`${drawState.playerNation.name} • Edition ${drawState.seasonYear}`}
      badge="OFFICIAL DRAW"
      icon={<Trophy className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-5xl"
      tabs={stepTabs}
      activeTabId={String(currentStep)}
      onTabChange={handleTabChange}
      headerRight={
        onClose ? (
          <button
            id="national-draw-back-btn"
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-arcade font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow shrink-0"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">RETURN</span>
          </button>
        ) : undefined
      }
      bodyClassName={`p-3 sm:p-5 relative bg-gradient-to-b ${theme.gradient}`}
      footer={
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as NationalDrawStep)}
              className="min-h-[48px] px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-arcade font-bold text-xs uppercase flex items-center gap-1.5 border border-slate-600 transition cursor-pointer active:scale-95 shrink-0"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>PREV</span>
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1) {
                  setCurrentStep(2);
                } else {
                  handleInstantDraw();
                  setCurrentStep(3);
                }
              }}
              className="min-h-[48px] flex-1 sm:flex-initial sm:ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-95"
            >
              <span className="truncate">{currentStep === 1 ? 'PROCEED TO DRAW' : 'VIEW SCHEDULE'}</span>
              <ChevronRight className="w-4 h-4 stroke-[3] shrink-0" />
            </button>
          ) : (
            <button
              id="national-draw-confirm-btn"
              type="button"
              onClick={() => onCompleteDraw({ ...drawState, isCompleted: true })}
              className="min-h-[48px] flex-1 sm:flex-initial sm:ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition cursor-pointer active:scale-95"
            >
              <CheckCircle className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">CONFIRM & ENTER TOURNAMENT</span>
            </button>
          )}
        </div>
      }
    >
      {/* STEP 1: POTS REVEAL */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm font-arcade">
            <span className="text-slate-200 uppercase tracking-wider">
              Official Seeding Pots ({totalPots} Pots)
            </span>
            <span className="text-amber-300">
              Your Seed: Pot {drawState.playerNation.rank ? Math.min(4, Math.ceil(drawState.playerNation.rank / 8)) : 1}
            </span>
          </div>

          {/* Mobile Single-Pot Paged View (no nested scroll trap) */}
          <div className="sm:hidden space-y-3">
            <ConsolePaginationBar
              currentPage={safePotPage}
              totalPages={totalPots}
              onPageChange={setMobilePotPage}
              label="POT"
            />

            {currentMobilePot && (
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 shadow-md space-y-2.5">
                <div className="text-xs font-arcade font-bold text-amber-300 uppercase tracking-wide pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>{currentMobilePot.potLabel}</span>
                  <span className="text-xs text-slate-400 font-mono">{currentMobilePot.teams.length} teams</span>
                </div>
                <div className="space-y-1.5">
                  {currentMobilePot.teams.map((team) => {
                    const isPlayer = isPlayerNation(team.code);
                    return (
                      <div
                        key={team.code}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                          isPlayer
                            ? 'bg-amber-500/25 border border-amber-400 text-amber-200 font-bold'
                            : 'bg-slate-950/70 text-slate-200 border border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderFlag(team.iso, team.name)}
                          <span className="truncate">{team.name}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-300 shrink-0">OVR {team.ovr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tablet / Desktop All-Pots Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pots.map((pot) => (
              <div key={pot.potNumber} className="bg-slate-900/85 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <div className="text-xs font-arcade font-bold text-amber-300 uppercase tracking-wide mb-2.5 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                  <span>{pot.potLabel}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{pot.teams.length} teams</span>
                </div>
                <div className="space-y-1.5">
                  {pot.teams.map((team) => {
                    const isPlayer = isPlayerNation(team.code);
                    return (
                      <div
                        key={team.code}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          isPlayer
                            ? 'bg-amber-500/25 border border-amber-400 text-amber-200 font-bold'
                            : 'bg-slate-950/60 text-slate-200 border border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {renderFlag(team.iso, team.name)}
                          <span className="truncate">{team.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">OVR {team.ovr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: ANIMATED GROUP DRAW */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Draw Ticker & Control Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
              <span className="text-sm font-semibold text-slate-100 leading-snug">
                {activeLog}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end">
              {!isDrawFinished ? (
                <>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="min-h-[44px] flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-black text-xs uppercase flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Draw Next</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleAutoPlay}
                    className={`min-h-[44px] px-3 py-2 rounded-xl font-arcade font-bold text-xs uppercase flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      isAutoPlaying
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>{isAutoPlaying ? 'Pause' : 'Auto'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleInstantDraw}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-arcade text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    Instant
                  </button>
                </>
              ) : (
                <span className="text-xs sm:text-sm font-arcade font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Draw Concluded
                </span>
              )}
            </div>
          </div>

          {/* Group Navigation Bar */}
          <ConsolePaginationBar
            currentPage={focusedGroupIndex + 1}
            totalPages={Math.max(1, groupsList.length)}
            onPageChange={(page) => setFocusedGroupIndex(page - 1)}
            label="GROUP"
          />

          <div className="hidden sm:flex items-center justify-center gap-1.5 flex-wrap">
            {groupsList.map((g, idx) => {
              const isSelected = idx === focusedGroupIndex;
              const isUserGroup = idx === playerGroupIndex;
              return (
                <button
                  key={g.letter}
                  type="button"
                  onClick={() => setFocusedGroupIndex(idx)}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-arcade font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : isUserGroup
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Grp {g.letter}
                  {isUserGroup && ' ★'}
                </button>
              );
            })}
          </div>

          {/* Focused Group Hero Card */}
          {currentFocusedGroup && (
            <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-amber-400/80 shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 font-arcade font-black text-sm flex items-center justify-center shrink-0">
                    {currentFocusedGroup.letter}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-arcade font-black text-white uppercase truncate">
                      {currentFocusedGroup.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-retro">Official Group Standings</p>
                  </div>
                </div>

                {focusedGroupIndex === playerGroupIndex && (
                  <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-arcade font-black text-[10px] uppercase shadow shrink-0">
                    ★ YOUR NATION
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {currentFocusedGroup.teams.map((team, idx) => {
                  const isRevealed = revealedTeams.has(team.code);
                  const isPlayer = isPlayerNation(team.code);
                  const isJustDrawn = activeDrawnTeam?.code === team.code;

                  return (
                    <div
                      key={team.code || idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-sm transition-all ${
                        !isRevealed
                          ? 'bg-slate-950/40 border-dashed border-slate-800 text-slate-500'
                          : isPlayer
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow'
                          : isJustDrawn
                          ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                          : 'bg-slate-950/70 border-slate-800 text-slate-200'
                      }`}
                    >
                      {isRevealed ? (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-arcade text-xs flex items-center justify-center font-bold shrink-0">
                              {idx + 1}
                            </span>
                            {renderFlag(team.iso, team.name)}
                            <span className="font-arcade font-bold truncate text-sm">
                              {team.name}
                            </span>
                            {isPlayer && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-slate-300 shrink-0">
                            OVR {team.ovr}
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs sm:text-sm">
                          <span>{idx + 1}.</span>
                          <span>Waiting for draw...</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: SCHEDULE CONFIRMATION */}
      {currentStep === 3 && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <h3 className="text-sm sm:text-base font-arcade font-black text-amber-300 uppercase">
              Tournament Group Matchdays Confirmed
            </h3>
            <p className="text-sm text-slate-200 font-sans mt-1.5 leading-relaxed">
              Your national squad is drawn into Group {drawState.playerGroupLetter}. Fixture dates are locked into your career calendar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((md) => (
              <div key={md} className="p-4 rounded-xl bg-slate-950/85 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs sm:text-sm font-arcade font-bold text-amber-300">
                    Matchday {md}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    SCHEDULED
                  </span>
                </div>
                <div className="text-sm text-slate-300 font-sans">
                  Group Stage Fixture #{md}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
