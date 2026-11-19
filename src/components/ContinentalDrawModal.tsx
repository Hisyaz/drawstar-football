import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  FastForward,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  Globe,
} from 'lucide-react';
import {
  ContinentalTournamentSeasonState,
} from '../types/continentalCompetitions';
import { CONTINENTAL_COMPETITIONS_CATALOG } from '../utils/continentalDatabaseSystem';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

interface ContinentalDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentState: ContinentalTournamentSeasonState;
  playerClubId?: string;
  playerClubName?: string;
}

export type DrawStageStep = 1 | 2 | 3;

export const ContinentalDrawModal: React.FC<ContinentalDrawModalProps> = ({
  isOpen,
  onClose,
  tournamentState,
  playerClubId,
  playerClubName,
}) => {
  const compId = tournamentState.competitionId;
  const meta = CONTINENTAL_COMPETITIONS_CATALOG[compId];
  const isLeaguePhase = !!tournamentState.isLeaguePhaseFormat;

  const accentColor = useMemo<'blue' | 'amber' | 'emerald' | 'sky'>(() => {
    switch (compId) {
      case 'UEFA_CL':
        return 'blue';
      case 'UEFA_EL':
        return 'amber';
      case 'UEFA_ECL':
        return 'emerald';
      case 'CONMEBOL_LIB':
        return 'amber';
      case 'CONMEBOL_SUD':
        return 'sky';
      default:
        return 'blue';
    }
  }, [compId]);

  const iconChar = useMemo(() => {
    switch (compId) {
      case 'UEFA_EL':
        return '🛡️';
      case 'UEFA_ECL':
        return '🏆';
      case 'CONMEBOL_LIB':
        return '👑';
      case 'CONMEBOL_SUD':
        return '🌐';
      default:
        return '⭐';
    }
  }, [compId]);

  const maxPots = isLeaguePhase && compId === 'UEFA_ECL' ? 6 : 4;

  const [currentStep, setCurrentStep] = useState<DrawStageStep>(1);
  const [revealedPotsCount, setRevealedPotsCount] = useState<number>(1);
  const [isAnimationFinished, setIsAnimationFinished] = useState<boolean>(false);
  const [focusedPotPage, setFocusedPotPage] = useState<number>(1);
  const [focusedGroupIndex, setFocusedGroupIndex] = useState<number>(0);

  const [inspectedClubId, setInspectedClubId] = useState<string>(
    playerClubId || (tournamentState.qualifiers && tournamentState.qualifiers[0]?.teamId) || ''
  );

  useEffect(() => {
    if (playerClubId) {
      setInspectedClubId(playerClubId);
    } else if (tournamentState.qualifiers && tournamentState.qualifiers.length > 0) {
      setInspectedClubId((prev) => prev || tournamentState.qualifiers[0].teamId);
    }
  }, [playerClubId, tournamentState.qualifiers]);

  const playerGroup = useMemo(() => {
    if (isLeaguePhase) return undefined;
    return tournamentState.groups?.find((g) =>
      g.teams.some(
        (t) =>
          (playerClubId && t.id === playerClubId) ||
          (playerClubName && t.name.toLowerCase() === playerClubName.toLowerCase()) ||
          t.isPlayer
      )
    );
  }, [isLeaguePhase, tournamentState.groups, playerClubId, playerClubName]);

  useEffect(() => {
    if (playerGroup && tournamentState.groups) {
      const idx = tournamentState.groups.findIndex((g) => g.id === playerGroup.id);
      if (idx >= 0) setFocusedGroupIndex(idx);
    }
  }, [playerGroup, tournamentState.groups]);

  const playerLeagueEntry = useMemo(() => {
    if (!isLeaguePhase) return undefined;
    return tournamentState.qualifiers?.find(
      (q) =>
        (playerClubId && q.teamId === playerClubId) ||
        (playerClubName && q.teamName.toLowerCase() === playerClubName.toLowerCase())
    );
  }, [isLeaguePhase, tournamentState.qualifiers, playerClubId, playerClubName]);

  const handleSkip = () => {
    setRevealedPotsCount(maxPots);
    setIsAnimationFinished(true);
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setRevealedPotsCount(1);
      setIsAnimationFinished(false);
      setFocusedPotPage(1);
    }
  }, [isOpen, compId, tournamentState.seasonYear]);

  useEffect(() => {
    if (isOpen && !isAnimationFinished && revealedPotsCount >= maxPots) {
      setIsAnimationFinished(true);
    }
  }, [isOpen, isAnimationFinished, revealedPotsCount, maxPots]);

  useEffect(() => {
    if (!isOpen || isAnimationFinished) return;

    const timer = setInterval(() => {
      setRevealedPotsCount((prev) => (prev >= maxPots ? maxPots : prev + 1));
    }, 1100);

    return () => clearInterval(timer);
  }, [isOpen, isAnimationFinished, maxPots]);

  if (!isOpen) return null;

  const inspectedTeam = tournamentState.qualifiers?.find((q) => q.teamId === inspectedClubId);
  const inspectedRivals =
    inspectedClubId && tournamentState.teamRivals ? tournamentState.teamRivals[inspectedClubId] || [] : [];

  const groupsList = tournamentState.groups || [];
  const currentFocusedGroup = groupsList[focusedGroupIndex] || groupsList[0];

  return (
    <ConsoleModalShell
      id="continental-draw-modal-container"
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      title={meta?.name || 'Continental Cup'}
      subtitle={`Season ${tournamentState.seasonYear}/${tournamentState.seasonYear + 1} · ${
        isLeaguePhase ? '36-Team League Phase' : 'Group Stage Draw'
      }`}
      icon={<span className="text-lg">{iconChar}</span>}
      accentColor={accentColor}
      maxWidthClass="sm:max-w-5xl"
      headerRight={
        <div className="flex items-center gap-2 shrink-0">
          {!isAnimationFinished && currentStep === 1 && (
            <button
              id="continental-draw-skip-btn"
              type="button"
              onClick={handleSkip}
              className="min-h-[44px] px-3 py-1.5 text-xs font-arcade font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Skip</span>
            </button>
          )}
          <button
            id="continental-draw-back-btn"
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-all cursor-pointer font-arcade font-bold text-xs flex items-center gap-1.5 active:scale-95"
            title="Return to Career"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">RETURN</span>
          </button>
        </div>
      }
      tabs={[
        { id: '1', label: '1. Pots', icon: <Layers className="w-3.5 h-3.5" /> },
        { id: '2', label: '2. Draw', icon: <Globe className="w-3.5 h-3.5" /> },
        { id: '3', label: '3. Fixtures', icon: <Calendar className="w-3.5 h-3.5" /> },
      ]}
      activeTabId={String(currentStep)}
      onTabChange={(id) => {
        if (id !== '1') handleSkip();
        setCurrentStep(Number(id) as DrawStageStep);
      }}
      bodyClassName="p-3 sm:p-5 space-y-4 bg-slate-950/90"
      footer={
        <div id="continental-draw-modal-footer" className="flex items-center justify-between gap-2.5">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as DrawStageStep)}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-arcade font-bold text-xs uppercase flex items-center gap-1.5 border border-slate-600 transition cursor-pointer active:scale-95 shrink-0"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">PREV</span>
            </button>
          ) : null}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                handleSkip();
                setCurrentStep((prev) => (prev + 1) as DrawStageStep);
              }}
              className="flex-1 min-h-[48px] px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-95"
            >
              <span className="truncate">{currentStep === 1 ? 'PROCEED TO GROUP DRAW' : 'VIEW FIXTURE SCHEDULE'}</span>
              <ChevronRight className="w-4 h-4 stroke-[3] shrink-0" />
            </button>
          ) : (
            <button
              id="continental-draw-confirm-btn"
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">CONFIRM &amp; ENTER TOURNAMENT</span>
            </button>
          )}
        </div>
      }
    >
      {/* Player Club Banner */}
      <div
        id="continental-draw-player-banner"
        className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          {isLeaguePhase ? (
            <span className="text-slate-200 leading-snug">
              {playerLeagueEntry ? (
                <>
                  <strong className="text-amber-300 font-bold">{playerLeagueEntry.teamName}</strong> seeded in{' '}
                  <strong className="text-white underline">Pot {playerLeagueEntry.seedingPot}</strong>
                </>
              ) : (
                <span>36 Elite Clubs · 8 opponents drawn per club</span>
              )}
            </span>
          ) : (
            <span className="text-slate-200 leading-snug">
              {playerGroup ? (
                <>
                  <strong className="text-amber-300 font-bold">{playerClubName || 'Your Club'}</strong> placed in{' '}
                  <strong className="text-white underline">Group {playerGroup.groupLetter}</strong>
                </>
              ) : (
                <span>32 Qualified Teams seeded into Groups A through H</span>
              )}
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 font-mono shrink-0 hidden sm:inline">Step {currentStep} / 3</span>
      </div>

      {/* STEP 1: POT REVEAL (Mobile 1 pot/page switcher, Desktop 4-col grid without nested traps) */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-arcade">
            <span className="text-slate-300 uppercase tracking-wider">
              Seeding Pots ({revealedPotsCount}/{maxPots} Revealed)
            </span>
            <span className="text-amber-400">
              {isAnimationFinished ? 'All Pots Revealed' : 'Revealing Seeds...'}
            </span>
          </div>

          <div className="sm:hidden">
            <ConsolePaginationBar
              currentPage={Math.min(focusedPotPage, maxPots)}
              totalPages={maxPots}
              onPageChange={setFocusedPotPage}
              label="POT"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, ...(maxPots > 4 ? [5, 6] : [])].map((potNum) => {
              const potKey = `pot${potNum}` as 'pot1' | 'pot2' | 'pot3' | 'pot4' | 'pot5' | 'pot6';
              const potTeams = tournamentState.pots ? tournamentState.pots[potKey] || [] : [];
              const isDrawn = potNum <= revealedPotsCount;
              const isVisibleMobile = potNum === Math.min(focusedPotPage, maxPots);

              return (
                <div
                  key={potNum}
                  className={`${isVisibleMobile ? 'block' : 'hidden sm:block'} rounded-2xl p-3.5 border transition-all ${
                    isDrawn ? 'bg-slate-900 border-slate-700 shadow-md' : 'bg-slate-950 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
                    <span className="font-arcade font-bold text-xs text-white flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-[10px]">
                        P{potNum}
                      </span>
                      Pot {potNum}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{potTeams.length} Clubs</span>
                  </div>

                  <div className="space-y-1.5">
                    {potTeams.map((entry) => {
                      const isPlayer =
                        (playerClubId && entry.teamId === playerClubId) ||
                        (playerClubName && entry.teamName.toLowerCase() === playerClubName.toLowerCase());

                      return (
                        <div
                          key={entry.teamId}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isPlayer
                              ? 'bg-amber-500/25 border border-amber-400 text-amber-200 font-bold'
                              : 'bg-slate-950 text-slate-200 border border-slate-800/70'
                          }`}
                        >
                          <span className="truncate">{entry.teamName}</span>
                          <span className="text-[11px] text-slate-400 font-mono ml-2 shrink-0">
                            {entry.countryCode}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: GROUP DRAW / RIVALS INSPECTOR */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {isLeaguePhase ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-xs font-arcade font-bold text-amber-300">
                  36-TEAM SINGLE LEAGUE DRAWN RIVALS
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 shrink-0">Inspect:</span>
                  <select
                    value={inspectedClubId}
                    onChange={(e) => setInspectedClubId(e.target.value)}
                    className="flex-1 sm:flex-initial min-h-[44px] bg-slate-950 border border-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl"
                  >
                    {(tournamentState.qualifiers || []).map((q) => (
                      <option key={q.teamId} value={q.teamId}>
                        {q.teamName} (Pot {q.seedingPot}) {q.teamId === playerClubId ? '★ YOU' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {inspectedTeam && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((potNum) => {
                    const potRivals = inspectedRivals.filter((r) => r.rivalPot === potNum);
                    return (
                      <div key={potNum} className="rounded-2xl p-3.5 bg-slate-900 border border-slate-800">
                        <div className="text-xs font-arcade font-bold text-white mb-2 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                          <span>Pot {potNum} Matchups</span>
                          <span className="text-[11px] text-slate-400">2 Matches</span>
                        </div>
                        <div className="space-y-2">
                          {potRivals.map((rival, idx) => {
                            const isHome = rival.venue === 'HOME' || (rival as any).isHome;
                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                  isHome
                                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                                    : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                                }`}
                              >
                                <span className="truncate font-bold">{rival.rivalTeamName}</span>
                                <span className="text-[10px] font-arcade font-black px-2 py-0.5 rounded bg-black/40 shrink-0">
                                  {isHome ? 'HOME' : 'AWAY'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setFocusedGroupIndex((prev) => (prev - 1 + groupsList.length) % groupsList.length)}
                  className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3]" />
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto px-1 flex-1">
                  {groupsList.map((g, idx) => {
                    const isSelected = idx === focusedGroupIndex;
                    const isUserGroup = g.id === playerGroup?.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFocusedGroupIndex(idx)}
                        className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-arcade font-black transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 shadow-md'
                            : isUserGroup
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        Grp {g.groupLetter}
                        {isUserGroup && ' ★'}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setFocusedGroupIndex((prev) => (prev + 1) % groupsList.length)}
                  className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
                >
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              {currentFocusedGroup && (
                <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-amber-400/80 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-arcade font-black text-sm flex items-center justify-center shrink-0">
                        {currentFocusedGroup.groupLetter}
                      </span>
                      <div>
                        <h3 className="text-base font-arcade font-black text-white uppercase">
                          Group {currentFocusedGroup.groupLetter}
                        </h3>
                        <p className="text-xs text-slate-400">4 Seeded Clubs</p>
                      </div>
                    </div>

                    {currentFocusedGroup.id === playerGroup?.id && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-arcade font-black text-[10px] uppercase shadow shrink-0">
                        ★ YOUR GROUP
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {currentFocusedGroup.teams.map((team, idx) => {
                      const isPlayer =
                        (playerClubId && team.id === playerClubId) ||
                        (playerClubName && team.name.toLowerCase() === playerClubName.toLowerCase()) ||
                        team.isPlayer;

                      return (
                        <div
                          key={team.id || idx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                            isPlayer
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-arcade text-xs flex items-center justify-center font-bold shrink-0">
                              P{team.seedingPot || idx + 1}
                            </span>
                            <span className="font-arcade font-bold truncate text-sm">{team.name}</span>
                            {isPlayer && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-slate-400 shrink-0">
                            {team.countryCode || 'INT'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: FIXTURE SCHEDULE CONFIRMATION */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-arcade font-black text-amber-300 uppercase">
                Tournament Fixture Calendar Confirmed
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Matchday dates and opponent scouting are locked for the upcoming campaign.
              </p>
            </div>
            {tournamentState.finalVenue && (
              <div className="sm:text-right">
                <span className="text-[11px] text-slate-400 uppercase block font-arcade">Grand Final Venue</span>
                <span className="text-xs font-bold text-white">
                  {tournamentState.finalVenue.stadium}, {tournamentState.finalVenue.city}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: isLeaguePhase ? 8 : 6 }).map((_, idx) => {
              const md = idx + 1;
              return (
                <div
                  key={md}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-400/40 font-arcade text-xs font-black flex items-center justify-center shrink-0">
                      {md}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-arcade font-bold text-white truncate">Matchday {md}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {isLeaguePhase ? 'Swiss League Round' : 'Group Stage Fixture'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-arcade font-bold px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 shrink-0">
                    LOCKED
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
