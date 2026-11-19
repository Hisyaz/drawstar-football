import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Globe,
  Play,
  Pause,
  FastForward,
  CheckCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';
import { InternationalDrawState, NationalTeamDrawGroup, NationalTeamDrawTeam, saveDrawState } from '../utils/internationalDrawEngine';
import { t } from '../utils/localizationSystem';
import { ConsoleModalShell } from './common/ConsolePager';

interface NationalTeamDrawModalProps {
  isOpen?: boolean;
  drawState: InternationalDrawState;
  onComplete?: (completedDraw: InternationalDrawState) => void;
  onDrawCompleted?: (completedDraw: InternationalDrawState) => void;
  onClose?: () => void;
}

export const NationalTeamDrawModal: React.FC<NationalTeamDrawModalProps> = ({
  isOpen = true,
  drawState: initialDrawState,
  onComplete,
  onDrawCompleted,
  onClose,
}) => {
  // All hooks placed unconditionally above early returns
  const [activeTab, setActiveTab] = useState<'draw' | 'logs'>('draw');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoDrawing, setIsAutoDrawing] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(initialDrawState.isCompleted);
  const [revealedGroups, setRevealedGroups] = useState<NationalTeamDrawGroup[]>(() => {
    if (initialDrawState.isCompleted) return initialDrawState.groups;
    return initialDrawState.groups.map((g) => ({
      ...g,
      teams: [],
    }));
  });

  const [currentStepTeam, setCurrentStepTeam] = useState<NationalTeamDrawTeam | null>(null);
  const [currentStepGroup, setCurrentStepGroup] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const userGroupLetter =
    initialDrawState.groups.find((g) => g.isPlayerGroup || g.teams.some((t) => t.isPlayerNation))?.groupLetter ||
    initialDrawState.groups[0]?.groupLetter ||
    'A';
  const [mobileGroupLetter, setMobileGroupLetter] = useState<string>(userGroupLetter);
  const [showAllGroupsMobile, setShowAllGroupsMobile] = useState<boolean>(false);

  const totalSteps = initialDrawState.animationSteps.length;
  const isConmebol = initialDrawState.isLeagueFormat;

  const executeStep = (stepIdx: number) => {
    if (stepIdx >= totalSteps) {
      setIsComplete(true);
      setIsAutoDrawing(false);
      return;
    }

    const step = initialDrawState.animationSteps[stepIdx];
    setCurrentStepTeam(step.team);
    setCurrentStepGroup(step.targetGroupLetter);

    setRevealedGroups((prev) =>
      prev.map((group) => {
        if (group.groupLetter === step.targetGroupLetter) {
          const exists = group.teams.some((t) => t.code === step.team.code);
          if (exists) return group;
          const isPlayer = group.isPlayerGroup || step.team.isPlayerNation;
          return {
            ...group,
            isPlayerGroup: isPlayer,
            teams: [...group.teams, step.team],
          };
        }
        return group;
      })
    );

    setLogMessages((prev) => [step.logText, ...prev.slice(0, 20)]);
    setCurrentStepIndex(stepIdx + 1);

    if (stepIdx + 1 >= totalSteps) {
      setIsComplete(true);
      setIsAutoDrawing(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAutoDrawing && !isComplete) {
      autoPlayTimerRef.current = setTimeout(() => {
        executeStep(currentStepIndex);
      }, currentStepIndex === 0 ? 500 : 700);
    }
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isOpen, isAutoDrawing, currentStepIndex, isComplete]);

  if (isOpen === false) return null;

  const handleFinishDraw = (completedState: InternationalDrawState) => {
    if (onDrawCompleted) onDrawCompleted(completedState);
    if (onComplete) onComplete(completedState);
    if (onClose) onClose();
  };

  const handleSkipToFinish = () => {
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    setIsAutoDrawing(false);
    setCurrentStepIndex(totalSteps);
    setRevealedGroups(initialDrawState.groups);
    setIsComplete(true);
  };

  const handleFinish = () => {
    const finishedState: InternationalDrawState = {
      ...initialDrawState,
      groups: revealedGroups,
      isCompleted: true,
    };
    saveDrawState(finishedState);
    handleFinishDraw(finishedState);
  };

  const getFlagUrl = (iso: string) => {
    const safeIso = (iso || 'un').toLowerCase();
    return `https://flagcdn.com/w80/${safeIso}.png`;
  };

  return (
    <ConsoleModalShell
      id="national-team-draw-modal"
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      title={initialDrawState.competitionName}
      subtitle={`${t('DRAW_OFFICIAL_CEREMONY') || 'Official Draw Ceremony'} · ${initialDrawState.seasonYear}`}
      icon={<Trophy className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-6xl"
      headerRight={
        <div className="flex items-center gap-2 shrink-0">
          {!isComplete && (
            <button
              id="btn-skip-draw"
              type="button"
              onClick={handleSkipToFinish}
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-600 transition cursor-pointer uppercase flex items-center gap-1.5"
            >
              <FastForward className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{t('DRAW_SKIP_TO_RESULTS') || 'Skip'}</span>
            </button>
          )}
          {onClose && (
            <button
              id="btn-close-draw"
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-400/70 cursor-pointer transition-all font-arcade font-black text-xs uppercase flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">RETURN</span>
            </button>
          )}
        </div>
      }
      tabs={[
        { id: 'draw', label: isConmebol ? 'Table & Stage' : 'Draw & Groups', icon: <Shield className="w-3.5 h-3.5" /> },
        { id: 'logs', label: 'Draw Feed', badge: logMessages.length, icon: <List className="w-3.5 h-3.5" /> },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'draw' | 'logs')}
      bodyClassName="p-3 sm:p-5 space-y-4 bg-slate-900"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="text-xs text-slate-400 hidden sm:block">
            <span className="font-semibold text-slate-200">
              {isConmebol ? 'Sudamericonferencia 10-Nation Round Robin' : 'Pot-Seeded Groups with Continental Constraints'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isComplete ? (
              <button
                id="btn-confirm-draw"
                type="button"
                onClick={handleFinish}
                className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black border border-emerald-300 shadow-lg transition cursor-pointer uppercase flex items-center justify-center gap-2 font-arcade"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t('DRAW_CONFIRM_FIXTURES') || 'Proceed to Matchday'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSkipToFinish}
                className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black border border-amber-300 transition cursor-pointer uppercase flex items-center justify-center gap-2 font-arcade"
              >
                <FastForward className="w-4 h-4" />
                <span>{t('DRAW_SKIP_TO_RESULTS') || 'Skip to Results'}</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      {activeTab === 'draw' && (
        <div className="space-y-4">
          {/* Active Draw Ceremony Stage */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 text-center overflow-hidden">
            <div className="max-w-xl mx-auto">
              {!isComplete ? (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold flex items-center justify-center space-x-2">
                    <Globe className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="font-arcade">
                      Drawing Ball {currentStepIndex} of {totalSteps}
                    </span>
                  </div>

                  {currentStepTeam ? (
                    <motion.div
                      key={currentStepTeam.code + currentStepIndex}
                      initial={{ scale: 0.85, opacity: 0, y: 8 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`inline-flex flex-col items-center p-4 rounded-2xl border ${
                        currentStepTeam.isPlayerNation
                          ? 'bg-amber-950/60 border-amber-400 shadow-lg'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={getFlagUrl(currentStepTeam.iso)}
                          alt={currentStepTeam.name}
                          className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded shadow-md border border-slate-600"
                        />
                        {currentStepTeam.isPlayerNation && (
                          <div className="absolute -top-2.5 -right-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded font-arcade shadow">
                            YOU
                          </div>
                        )}
                      </div>

                      <span className="text-lg sm:text-xl font-black text-white mt-2">
                        {currentStepTeam.name}
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1 text-xs text-slate-400 font-arcade">
                        <span>Rank #{currentStepTeam.rank}</span>
                        <span>•</span>
                        <span>{currentStepTeam.confederation}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-semibold">
                          {isConmebol ? 'Clasificatoria Sudamericana' : `Group ${currentStepGroup}`}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-4 text-slate-400 text-sm">
                      Commencing official draw ceremony...
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAutoDrawing((prev) => !prev)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-1.5 border border-slate-600 transition uppercase cursor-pointer"
                    >
                      {isAutoDrawing ? (
                        <>
                          <Pause className="w-4 h-4 text-amber-400" />
                          <span>Pause Draw</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-emerald-400" />
                          <span>Resume Draw</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => executeStep(currentStepIndex)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 border border-indigo-400 transition uppercase cursor-pointer"
                    >
                      <span>Draw Next Ball</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-2 space-y-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-arcade">
                    <CheckCircle className="w-4 h-4" />
                    <span>Official Draw Ceremony Complete</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    All participating nations have been assigned
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Review your group assignments below before proceeding to the international window.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Groups / CONMEBOL Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-arcade">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>
                  {isConmebol ? 'Sudamericonferencia Single League Standings' : 'Tournament Groups'}
                </span>
              </h3>
              {!isConmebol && (
                <span className="text-xs text-slate-400">
                  Top 2 advance to Knockout / Direct Qualification
                </span>
              )}
            </div>

            {isConmebol ? (
              <div className="bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden shadow-inner">
                <div className="divide-y divide-slate-800">
                  {(revealedGroups[0]?.teams || []).map((team, idx) => (
                    <div
                      key={team.code}
                      className={`px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 text-xs transition ${
                        team.isPlayerNation
                          ? 'bg-amber-500/15 font-bold border-l-4 border-amber-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className={`w-6 text-center font-arcade font-bold shrink-0 ${
                            idx < 6 ? 'text-emerald-400' : idx === 6 ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <img
                          src={getFlagUrl(team.iso)}
                          alt={team.name}
                          className="w-5 h-3.5 object-cover rounded shadow border border-slate-700 shrink-0"
                        />
                        <span className={`truncate text-sm ${team.isPlayerNation ? 'text-amber-300 font-bold' : 'text-slate-100'}`}>
                          {team.name}
                        </span>
                        {team.isPlayerNation && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-arcade shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 sm:gap-6 text-slate-400 font-arcade shrink-0">
                        <span className="hidden sm:inline text-xs">{team.confederation}</span>
                        <span className="text-slate-300">#{team.rank}</span>
                        <span className="font-bold text-amber-400">{team.ovr} OVR</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mobile Group Switcher */}
                <div className="flex items-center justify-between gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl sm:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      const letters = revealedGroups.map((g) => g.groupLetter);
                      const idx = letters.indexOf(mobileGroupLetter);
                      const prevIdx = idx <= 0 ? letters.length - 1 : idx - 1;
                      setMobileGroupLetter(letters[prevIdx]);
                      setShowAllGroupsMobile(false);
                    }}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-amber-300 cursor-pointer"
                    title="Previous Group"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1 overflow-x-auto py-1">
                    {revealedGroups.map((g) => {
                      const isUser = g.isPlayerGroup;
                      const isActive = !showAllGroupsMobile && mobileGroupLetter === g.groupLetter;
                      return (
                        <button
                          key={g.groupLetter}
                          type="button"
                          onClick={() => {
                            setMobileGroupLetter(g.groupLetter);
                            setShowAllGroupsMobile(false);
                          }}
                          className={`min-h-[44px] px-3 py-1.5 text-xs font-arcade uppercase rounded-lg cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 font-black border border-amber-300'
                              : isUser
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                              : 'bg-slate-900 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span>{g.groupLetter}</span>
                          {isUser && <span>★</span>}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setShowAllGroupsMobile((prev) => !prev)}
                      className={`min-h-[44px] px-3 py-1.5 text-xs font-arcade uppercase rounded-lg cursor-pointer whitespace-nowrap ${
                        showAllGroupsMobile
                          ? 'bg-amber-500 text-slate-950 font-black border border-amber-300'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      ALL
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const letters = revealedGroups.map((g) => g.groupLetter);
                      const idx = letters.indexOf(mobileGroupLetter);
                      const nextIdx = idx === -1 || idx >= letters.length - 1 ? 0 : idx + 1;
                      setMobileGroupLetter(letters[nextIdx]);
                      setShowAllGroupsMobile(false);
                    }}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-amber-300 cursor-pointer"
                    title="Next Group"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {revealedGroups.map((group) => {
                    const mobileVisible = showAllGroupsMobile || group.groupLetter === mobileGroupLetter;
                    return (
                      <div
                        key={group.groupLetter}
                        className={`${mobileVisible ? 'flex' : 'hidden sm:flex'} rounded-2xl border p-3.5 flex-col justify-between transition ${
                          group.isPlayerGroup
                            ? 'bg-amber-950/30 border-amber-400 shadow-lg'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{group.groupName}</span>
                            {group.isPlayerGroup && (
                              <span className="text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-arcade">
                                {t('DRAW_YOUR_GROUP') || 'Your Group'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-arcade">{group.teams.length}/4</span>
                        </div>

                        <div className="space-y-1.5 flex-1 min-h-[116px]">
                          {group.teams.map((tm, tIdx) => (
                            <div
                              key={tm.code}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                                tm.isPlayerNation
                                  ? 'bg-amber-500/20 text-amber-200 font-bold border border-amber-500/30'
                                  : 'text-slate-200 bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                <span className="text-xs text-slate-500 font-arcade w-4">{tIdx + 1}</span>
                                <img
                                  src={getFlagUrl(tm.iso)}
                                  alt={tm.name}
                                  className="w-4 h-3 object-cover rounded shadow border border-slate-700 shrink-0"
                                />
                                <span className="truncate font-semibold">{tm.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0 text-xs font-arcade">
                                <span className="text-slate-400">#{tm.rank}</span>
                                <span className="font-bold text-amber-400">{tm.ovr}</span>
                              </div>
                            </div>
                          ))}

                          {Array.from({ length: Math.max(0, 4 - group.teams.length) }).map((_, emptyIdx) => (
                            <div
                              key={emptyIdx}
                              className="h-7 rounded-lg border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500"
                            >
                              Waiting for Pot {group.teams.length + emptyIdx + 1}...
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-2.5">
          {logMessages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-950 border border-slate-800 rounded-2xl text-sm">
              Draw announcements will appear here as balls are drawn.
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-sm text-slate-200">
              {logMessages.map((msg, idx) => (
                <div key={idx} className="flex items-start gap-2 border-b border-slate-800/70 pb-2 last:border-b-0">
                  <span className="text-amber-400 font-bold">•</span>
                  <span className="leading-snug">{msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ConsoleModalShell>
  );
};
