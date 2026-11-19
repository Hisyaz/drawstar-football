/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  TeamDefinition,
  TeamRosterPlayer,
  PreMatchConfig,
  DifficultyLevel,
  HalfDurationMinutes,
  ModularKitSelection,
  resolveModularKit,
  getDefaultKitSelection,
  detectKitClash,
  ControlScope,
  CursorSwitchMode,
  FootballMatchMode,
} from '../types';
import { getTeamById, calculatePlayerOvr } from '../game/teams';
import { CaptainHeroCanvas } from './CaptainHeroCanvas';
import { ModularKitMixer } from './ModularKitMixer';
import { TeamSelectorModal } from './TeamSelectorModal';
import { PixelKitIcon } from './TacticalPitchBoard';
import {
  Play,
  Shirt,
  Shield,
  Zap,
  Sparkles,
  Trophy,
  Clock,
  ChevronRight,
  Flame,
  AlertTriangle,
  RotateCcw,
  Users,
  Settings2,
  Building2,
  Repeat,
  Home,
} from 'lucide-react';
import { StadiumConfig } from './StadiumSelectorModal';
import { getStadiumById, getHomeStadiumForTeam } from '../game/stadiumRegistry';
import { isFifaWorldCertified } from '../types/stadium';
import { MacroscopicSkyCamPreview } from './MacroscopicSkyCamPreview';
import type { ResolvedCompetitionVenue } from '../../utils/competitionVenueSystem';

interface PreMatchPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (config: PreMatchConfig) => void;
  onOpenDetailedSettings?: (config: PreMatchConfig) => void;
  onOpenGamePlan?: () => void;
  onOpenStadium?: () => void;
  onOpenSettings?: () => void;
  onBackToTeamSelector?: () => void;
  onOpenMainMenu?: () => void;
  onSelectTeam?: (side: 'home' | 'away', team: TeamDefinition) => void;
  initialHomeTeamId?: string;
  initialAwayTeamId?: string;
  initialDifficulty?: DifficultyLevel;
  initialHalfDuration?: HalfDurationMinutes;
  stadiumConfig?: StadiumConfig;
  competitionVenue?: ResolvedCompetitionVenue;
  controlScope?: ControlScope;
  initialLockedPlayerId?: string;
  cursorSwitchMode?: CursorSwitchMode;
  careerModeRestricted?: boolean;
  matchMode?: FootballMatchMode;
  displayedHalfMinutes?: 30 | 35 | 45;
}

/**
 * Sorts players strictly according to tactical hierarchy (GK -> CB -> FB -> CDM -> CM -> CAM -> Wingers -> Strikers)
 */
function sortPlayersByTacticalHierarchy(players: TeamRosterPlayer[]): TeamRosterPlayer[] {
  const getHierarchyRank = (p: TeamRosterPlayer): number => {
    const sub = p.subPosition || p.role;
    if (p.role === 'GK' || sub === 'GK') return 100;
    if (['CB', 'LIB', 'CB1', 'CB2'].includes(sub) || ['CB1', 'CB2'].includes(p.role)) return 200;
    if (['LB', 'RB', 'LWB', 'RWB'].includes(sub) || ['LB', 'RB'].includes(p.role)) return 300;
    if (sub === 'CDM') return 400;
    if (['CM', 'CM1', 'CM2'].includes(sub) || ['CM1', 'CM2'].includes(p.role)) return 500;
    if (sub === 'CAM') return 600;
    if (['LM', 'RM', 'LW', 'RW'].includes(sub) || ['LM', 'RM'].includes(p.role)) return 700;
    if (['SS', 'CF', 'ST', 'ST1', 'ST2'].includes(sub) || ['ST1', 'ST2'].includes(p.role)) return 800;
    return 900;
  };

  return [...players].sort((a, b) => {
    const rankA = getHierarchyRank(a);
    const rankB = getHierarchyRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return a.number - b.number;
  });
}

function getPositionalBadgeColor(sub: string, role: string) {
  if (role === 'GK' || sub === 'GK') {
    return 'bg-amber-500/25 text-amber-300 border-amber-500/50';
  }
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'LIB', 'CB1', 'CB2'].includes(sub) || ['CB1', 'CB2', 'LB', 'RB'].includes(role)) {
    return 'bg-sky-500/25 text-sky-300 border-sky-500/50';
  }
  if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'CM1', 'CM2'].includes(sub) || ['CM1', 'CM2', 'LM', 'RM'].includes(role)) {
    return 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50';
  }
  return 'bg-rose-500/25 text-rose-300 border-rose-500/50';
}

function hasStatBreak(p: TeamRosterPlayer): boolean {
  if (!p.canonicalStats) return false;
  return Object.values(p.canonicalStats).some((val) => typeof val === 'number' && val > 99);
}

export const PreMatchPresentationModal: React.FC<PreMatchPresentationModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
  onOpenDetailedSettings,
  onOpenGamePlan,
  onOpenStadium,
  onOpenSettings,
  onBackToTeamSelector,
  onOpenMainMenu,
  onSelectTeam,
  initialHomeTeamId = 'spain_2026',
  initialAwayTeamId = 'argentina_2026',
  initialDifficulty = 'normal',
  initialHalfDuration = 3,
  stadiumConfig,
  competitionVenue,
  controlScope = 'all_team',
  initialLockedPlayerId,
  cursorSwitchMode = 'manual',
  careerModeRestricted = false,
  matchMode,
  displayedHalfMinutes,
}) => {
  // Active Teams
  const [homeTeamId, setHomeTeamId] = useState<string>(initialHomeTeamId);
  const [awayTeamId, setAwayTeamId] = useState<string>(initialAwayTeamId);

  // Synchronize team IDs when incoming props change from Team Selector or external updates
  useEffect(() => {
    if (initialHomeTeamId) setHomeTeamId(initialHomeTeamId);
  }, [initialHomeTeamId]);

  useEffect(() => {
    if (initialAwayTeamId) setAwayTeamId(initialAwayTeamId);
  }, [initialAwayTeamId]);

  // Mobile 3-Page Console View Switcher ('home' | 'away' | 'match')
  const [mobilePage, setMobilePage] = useState<'home' | 'away' | 'match'>('home');
  const mobileSide: 'home' | 'away' = mobilePage === 'away' ? 'away' : 'home';

  // Match settings
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);
  const [halfDuration, setHalfDuration] = useState<HalfDurationMinutes>(initialHalfDuration);

  // Modular Kit Matrix Selections
  const [homeKitSelection, setHomeKitSelection] = useState<ModularKitSelection>(() =>
    getDefaultKitSelection('home')
  );
  const [awayKitSelection, setAwayKitSelection] = useState<ModularKitSelection>(() =>
    getDefaultKitSelection('away')
  );

  // Modular Kit Mixer Overlay Toggles
  const [isHomeMixerOpen, setIsHomeMixerOpen] = useState(false);
  const [isAwayMixerOpen, setIsAwayMixerOpen] = useState(false);

  // User Controlled Player Lock Selection (including Goalkeeper GK mode)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(initialLockedPlayerId || null);

  useEffect(() => {
    if (initialLockedPlayerId) {
      setSelectedPlayerId(initialLockedPlayerId);
    }
  }, [initialLockedPlayerId]);

  // Team Selector Modals
  const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
  const [teamSelectorSide, setTeamSelectorSide] = useState<'home' | 'away'>('home');

  // Resolve team definitions
  const homeTeam = useMemo(() => getTeamById(homeTeamId), [homeTeamId]);
  const awayTeam = useMemo(() => getTeamById(awayTeamId), [awayTeamId]);
  const effectiveMatchMode: FootballMatchMode =
    matchMode || (homeTeam.teamSize === 7 || awayTeam.teamSize === 7 ? 'street' : 'pro');
  const isStreetMode = effectiveMatchMode === 'street';
  const clockHalfMins: 30 | 35 | 45 =
    displayedHalfMinutes === 30 || displayedHalfMinutes === 35 || displayedHalfMinutes === 45
      ? displayedHalfMinutes
      : isStreetMode
      ? 30
      : effectiveMatchMode === 'youth'
      ? 35
      : 45;

  // Resolve active modular kits
  const activeHomeKit = useMemo(
    () => resolveModularKit(homeTeam, homeKitSelection),
    [homeTeam, homeKitSelection]
  );
  const activeAwayKit = useMemo(
    () => resolveModularKit(awayTeam, awayKitSelection),
    [awayTeam, awayKitSelection]
  );

  // Kit clash analysis
  const clash = useMemo(
    () => detectKitClash(activeHomeKit, activeAwayKit),
    [activeHomeKit, activeAwayKit]
  );

  // Captains
  const homeCaptain = useMemo(() => {
    return (
      homeTeam.players.find((p) => p.id === homeTeam.roles?.captainId || p.isCaptain) ||
      homeTeam.players[0]
    );
  }, [homeTeam]);

  const awayCaptain = useMemo(() => {
    return (
      awayTeam.players.find((p) => p.id === awayTeam.roles?.captainId || p.isCaptain) ||
      awayTeam.players[0]
    );
  }, [awayTeam]);

  const homeStadium = useMemo(() => getHomeStadiumForTeam(homeTeam), [homeTeam]);
  const activeStadium = useMemo(() => {
    if (competitionVenue?.isNeutralVenue && competitionVenue.stadiumId) {
      return getStadiumById(competitionVenue.stadiumId);
    }
    if (stadiumConfig?.stadiumId) {
      return getStadiumById(stadiumConfig.stadiumId);
    }
    if (competitionVenue?.stadiumId) {
      return getStadiumById(competitionVenue.stadiumId);
    }
    return homeStadium || getStadiumById('estadio_monumental');
  }, [stadiumConfig?.stadiumId, homeStadium, competitionVenue?.stadiumId, competitionVenue?.isNeutralVenue]);

  const isHomeVenueActive =
    stadiumConfig?.isHomeVenueLocked || (homeStadium && activeStadium.id === homeStadium.id);

  const activeControlledPlayerId = selectedPlayerId || homeCaptain?.id || homeTeam.players[0]?.id;
  const selectedPlayer = useMemo(() => {
    return homeTeam.players.find((p) => p.id === activeControlledPlayerId);
  }, [homeTeam, activeControlledPlayerId]);
  const isGkSelected = selectedPlayer?.role === 'GK' || selectedPlayer?.subPosition === 'GK';

  // Hierarchically sorted lineups
  const sortedHomeLineup = useMemo(
    () => sortPlayersByTacticalHierarchy(homeTeam.players),
    [homeTeam]
  );
  const sortedAwayLineup = useMemo(
    () => sortPlayersByTacticalHierarchy(awayTeam.players),
    [awayTeam]
  );

  if (!isOpen) return null;

  const handleLaunchMatch = () => {
    const config: PreMatchConfig = {
      halfDurationMinutes: halfDuration,
      homeFormation: homeTeam.preferredFormation,
      awayFormation: awayTeam.preferredFormation,
      homePlaystyle: homeTeam.tacticalPlaystyle,
      awayPlaystyle: awayTeam.tacticalPlaystyle,
      homeTactics: homeTeam.tactics,
      awayTactics: awayTeam.tactics,
      difficulty,
      homeTeamId,
      awayTeamId,
      matchMode: effectiveMatchMode,
      isStreetMatch: isStreetMode,
      displayedHalfMinutes: clockHalfMins,
      controlScope,
      cursorSwitchMode,
      lockedPlayerId: controlScope === 'single_player' ? (selectedPlayerId || initialLockedPlayerId || activeControlledPlayerId) : undefined,
      customHomeKit: activeHomeKit,
      customAwayKit: activeAwayKit,
      stadiumTier: stadiumConfig?.stadiumTier,
      pitchPreset: stadiumConfig?.pitchPreset,
      pitchLengthMeters: stadiumConfig?.pitchLengthMeters,
      pitchWidthMeters: stadiumConfig?.pitchWidthMeters,
      turfQuality: stadiumConfig?.turfQuality,
      grassLength: stadiumConfig?.grassLength,
      mowingPattern: stadiumConfig?.mowingPattern,
      surfaceStatus: stadiumConfig?.surfaceStatus,
      weather: stadiumConfig?.weather,
      season: stadiumConfig?.season,
      timeOfDay: stadiumConfig?.timeOfDay,
      seatColor: stadiumConfig?.seatColor,
      netTension: stadiumConfig?.netTension,
      goalFrame: stadiumConfig?.goalFrame,
    };
    onStartMatch(config);
  };

  const handleOpenDetailed = () => {
    if (onOpenDetailedSettings) {
      const config: PreMatchConfig = {
        halfDurationMinutes: halfDuration,
        homeFormation: homeTeam.preferredFormation,
        awayFormation: awayTeam.preferredFormation,
        homePlaystyle: homeTeam.tacticalPlaystyle,
        awayPlaystyle: awayTeam.tacticalPlaystyle,
        homeTactics: homeTeam.tactics,
        awayTactics: awayTeam.tactics,
        difficulty,
        homeTeamId,
        awayTeamId,
        matchMode: effectiveMatchMode,
        isStreetMatch: isStreetMode,
        displayedHalfMinutes: clockHalfMins,
        controlScope,
        cursorSwitchMode,
        lockedPlayerId: controlScope === 'single_player' ? (selectedPlayerId || initialLockedPlayerId || activeControlledPlayerId) : undefined,
        customHomeKit: activeHomeKit,
        customAwayKit: activeAwayKit,
        stadiumTier: stadiumConfig?.stadiumTier,
        pitchPreset: stadiumConfig?.pitchPreset,
        pitchLengthMeters: stadiumConfig?.pitchLengthMeters,
        pitchWidthMeters: stadiumConfig?.pitchWidthMeters,
        turfQuality: stadiumConfig?.turfQuality,
        grassLength: stadiumConfig?.grassLength,
        mowingPattern: stadiumConfig?.mowingPattern,
        surfaceStatus: stadiumConfig?.surfaceStatus,
        weather: stadiumConfig?.weather,
        season: stadiumConfig?.season,
        timeOfDay: stadiumConfig?.timeOfDay,
        seatColor: stadiumConfig?.seatColor,
        netTension: stadiumConfig?.netTension,
        goalFrame: stadiumConfig?.goalFrame,
      };
      onOpenDetailedSettings(config);
    }
  };

  const handleOpenTeamSelect = (side: 'home' | 'away') => {
    setTeamSelectorSide(side);
    setIsTeamSelectorOpen(true);
  };

  const handleSelectTeam = (side: 'home' | 'away', selected: TeamDefinition) => {
    if (side === 'home') {
      setHomeTeamId(selected.id);
      setHomeKitSelection(getDefaultKitSelection('home'));
    } else {
      setAwayTeamId(selected.id);
      setAwayKitSelection(getDefaultKitSelection('away'));
    }
    if (onSelectTeam) {
      onSelectTeam(side, selected);
    }
    setIsTeamSelectorOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 bg-slate-950/95 backdrop-blur-xl animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-7xl h-[100dvh] sm:h-[96dvh] flex flex-col arcade-panel-beveled rounded-none sm:rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden text-white">
        {/* Authentic 32-Bit Brushed Gold Corner Rivets */}
        <div className="arcade-rivet-corner-tl hidden sm:block" />
        <div className="arcade-rivet-corner-tr hidden sm:block" />
        <div className="arcade-rivet-corner-bl hidden sm:block" />
        <div className="arcade-rivet-corner-br hidden sm:block" />
        
        {/* TOP RETRO BROADCAST CONSOLE HEADER */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/40 shrink-0 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {!careerModeRestricted && (
              <button
                type="button"
                onClick={() => {
                  if (onBackToTeamSelector) onBackToTeamSelector();
                  else handleOpenTeamSelect('home');
                }}
                className="min-h-[44px] px-3 py-1.5 text-[10px] font-arcade bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>TEAMS</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 pl-2 text-xs font-mono text-slate-300 truncate">
              <span className="text-amber-400 font-bold">
                {careerModeRestricted ? 'CAREER MATCHDAY' : '32-BIT ARCADE'}
              </span>
              <span>·</span>
              <span>{careerModeRestricted ? 'SINGLE-PLAYER LOCK' : 'MATCH SETUP'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenMainMenu && (
              <button
                type="button"
                onClick={onOpenMainMenu}
                title="Return to Main Menu"
                className="min-h-[44px] px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">MENU</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer"
            >
              ESC
            </button>
          </div>
        </div>

        {/* Mobile 3-Page Console Switcher (< lg): eliminates overlap & stacking clutter */}
        <div className="lg:hidden grid grid-cols-3 gap-1.5 px-2.5 py-2 bg-slate-950 border-b border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setMobilePage('home')}
            className={`min-h-[44px] px-2 rounded-lg border font-arcade text-[9.5px] uppercase truncate transition-all cursor-pointer ${
              mobilePage === 'home'
                ? 'bg-sky-500 text-slate-950 border-sky-300 font-black shadow'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            1. HOME
          </button>
          <button
            type="button"
            onClick={() => setMobilePage('match')}
            className={`min-h-[44px] px-2 rounded-lg border font-arcade text-[9.5px] uppercase truncate transition-all cursor-pointer ${
              mobilePage === 'match'
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            2. MATCH
          </button>
          <button
            type="button"
            onClick={() => setMobilePage('away')}
            className={`min-h-[44px] px-2 rounded-lg border font-arcade text-[9.5px] uppercase truncate transition-all cursor-pointer ${
              mobilePage === 'away'
                ? 'bg-rose-500 text-white border-rose-300 font-black shadow'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            3. AWAY
          </button>
        </div>

        {/* Clash Warning Alert */}
        {clash.isHighClashRisk && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 px-3 py-1.5 flex items-center justify-center gap-2 text-amber-200 text-xs shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span className="font-medium text-xs truncate">{clash.warningMessage}</span>
          </div>
        )}

        {/* MAIN BODY: LOCAL (HOME) - CENTER SETTINGS - AWAY */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden lg:divide-x divide-slate-800">
          
          {/* LEFT: LOCAL TEAM (HOME) */}
          <div className={`lg:col-span-5 p-3 sm:p-4 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/20 min-h-0 overflow-y-auto ${mobilePage === 'home' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="space-y-3">
              {/* Home Team Header Card */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg border border-white/20 shrink-0"
                    style={{ backgroundColor: homeTeam.badge.bg, color: homeTeam.badge.primaryColor }}
                  >
                    {homeTeam.badge.icon || homeTeam.badge.text}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-sky-500/25 text-sky-300 border border-sky-500/40 text-[8.5px] font-bold font-mono uppercase">
                        LOCAL
                      </span>
                      <span className="text-[9.5px] font-bold font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                        TIER {homeTeam.ratingTier} · {homeTeam.averageOvr} OVR
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                      {homeTeam.name}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {homeTeam.country} · {isStreetMode ? '1-2-2-2 · Street 7v7' : `${homeTeam.preferredFormation} · ${homeTeam.tacticalPlaystyle}`}
                    </p>
                    {homeTeam.manager?.name && (
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">MANAGER · {homeTeam.manager.name}</p>
                    )}
                  </div>
                </div>

                {!careerModeRestricted && (
                  <button
                    type="button"
                    onClick={() => handleOpenTeamSelect('home')}
                    className="min-h-[44px] px-3 py-1.5 text-[10px] font-arcade bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg border border-sky-500/40 transition-all cursor-pointer shrink-0"
                  >
                    CHANGE
                  </button>
                )}
              </div>

              {/* Captain Hero Banner & Uniform Indicator */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <CaptainHeroCanvas
                    appearance={homeCaptain.appearance}
                    kit={activeHomeKit}
                    facing="right"
                    width={80}
                    height={140}
                    scale={1.1}
                    className="shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-[9px] text-amber-400 font-mono font-bold uppercase">
                      <Sparkles className="w-2.5 h-2.5" />
                      CAPTAIN (C)
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                      {homeCaptain.name.toUpperCase()}
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                      #{homeCaptain.number} · {homeCaptain.subPosition} · ★ {calculatePlayerOvr(homeCaptain.canonicalStats, homeCaptain.role)} OVR
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400 font-mono">KIT:</span>
                      <span className="text-[9.5px] text-amber-300 font-bold truncate max-w-[120px]">
                        {activeHomeKit.name}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsHomeMixerOpen(!isHomeMixerOpen)}
                  className={`min-h-[48px] px-3 py-2 text-[9px] font-arcade rounded-lg border transition-all flex flex-col items-center justify-center gap-1 shrink-0 cursor-pointer ${
                    isHomeMixerOpen
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-amber-500/40'
                  }`}
                >
                  <Shirt className="w-4 h-4" />
                  <span>{isHomeMixerOpen ? 'DONE' : 'UNIFORM'}</span>
                </button>
              </div>

              {/* Collapsible Modular Kit Mixer */}
              {isHomeMixerOpen && (
                <div className="animate-fade-in">
                  <ModularKitMixer
                    team={homeTeam}
                    opponentTeam={awayTeam}
                    selection={homeKitSelection}
                    onChangeSelection={setHomeKitSelection}
                    opponentKit={activeAwayKit}
                    side="home"
                  />
                </div>
              )}

              {/* Tactical Starting 11 Hierarchy Display with Player / Goalkeeper Picker */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
                  <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3 text-sky-400" />
                    {careerModeRestricted ? 'LINEUP (LOCKED TO YOUR PRO PLAYER)' : 'LINEUP (CLICK TO PICK PLAYER / GK)'}
                  </span>
                  <span>OVR</span>
                </div>

                <div className="space-y-1 max-h-[160px] sm:max-h-[190px] overflow-y-auto pr-1">
                  {sortedHomeLineup.map((p) => {
                    const ovr = calculatePlayerOvr(p.canonicalStats, p.role);
                    const isCap = p.id === homeTeam.roles?.captainId || p.isCaptain;
                    const hasBreak = hasStatBreak(p);
                    const isControlled = p.id === activeControlledPlayerId;
                    const isGK = p.role === 'GK' || p.subPosition === 'GK';
                    const badgeClass = getPositionalBadgeColor(p.subPosition, p.role);

                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={careerModeRestricted && !isControlled}
                        onClick={() => {
                          if (!careerModeRestricted) setSelectedPlayerId(p.id);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded border text-[10px] transition-all text-left ${
                          careerModeRestricted && !isControlled ? 'opacity-65 cursor-default' : 'cursor-pointer'
                        } ${
                          isControlled
                            ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/60 shadow-md'
                            : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`px-1 py-0.2 rounded text-[8px] font-mono font-black uppercase border ${badgeClass}`}>
                            {p.subPosition || p.role}
                          </span>
                          <PixelKitIcon
                            primaryColor={activeHomeKit.primaryColor}
                            secondaryColor={activeHomeKit.secondaryColor}
                            number={p.number}
                            className="w-4 h-4 shrink-0"
                          />
                          <span className={`font-bold truncate max-w-[110px] sm:max-w-[130px] ${isControlled ? 'text-amber-300' : 'text-slate-200'}`}>
                            {p.name.toUpperCase()}
                          </span>
                          {isCap && (
                            <span className="px-1 bg-amber-400 text-slate-950 rounded text-[7px] font-black font-mono">
                              (C)
                            </span>
                          )}
                          {isControlled && (
                            <span className="px-1 bg-cyan-400 text-slate-950 rounded text-[7px] font-black font-mono">
                              {isGK ? '🧤 GK LOCK' : '🎮 YOU'}
                            </span>
                          )}
                          {hasBreak && (
                            <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          )}
                        </div>

                        <span className={`font-mono font-black text-[9.5px] shrink-0 pl-1 ${ovr >= 90 ? 'text-amber-400' : ovr >= 85 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          ★ {ovr}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* SPECIAL GOALKEEPER CONTROLS GUIDE IF GK SELECTED */}
                {isGkSelected && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-500/15 border border-amber-400/50 text-[8px] font-mono text-amber-200 animate-fade-in">
                    <div className="font-bold text-amber-300 flex items-center justify-between mb-1">
                      <span>🧤 GOALKEEPER CONTROLS (WITHOUT BALL)</span>
                      <span className="text-[7px] bg-amber-400 text-slate-950 px-1 rounded font-black">ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-300 text-[7.5px]">
                      <div><b>[S] Short Pass:</b> Full Sprint Rush</div>
                      <div><b>[W] Long Pass:</b> 1v1 Star Spread</div>
                      <div><b>[D] Cross:</b> Top-Corner Parry Leap</div>
                      <div><b>[A] Shoot:</b> Low Corner Smother Dive</div>
                      <div><b>[Q] Shield:</b> Aerial Catch Leap</div>
                      <div><b>[E] Special:</b> Two-Fist Punch Clear</div>
                    </div>
                    <div className="text-[7px] text-amber-300/80 mt-1 font-sans">
                      *On the ball: Dribble, pass & shoot like a regular player.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CENTER: MATCH OPTIONS & VS CONSOLE */}
          <div className={`lg:col-span-2 p-3 flex-col justify-between items-center bg-slate-950/95 text-center gap-3 min-h-0 overflow-y-auto ${mobilePage === 'match' ? 'flex' : 'hidden lg:flex'}`}>
            {/* VS Badge */}
            <div className="w-full flex flex-col items-center gap-0.5 border-b border-slate-800 pb-2.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                {isStreetMode ? 'STREET 7v7 · 1-2-2-2' : effectiveMatchMode === 'youth' ? 'YOUTH MATCHDAY' : 'ARCADE HEAD TO HEAD'}
              </span>
              <div className="font-arcade text-lg text-amber-400 my-0.5 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                VS
              </div>
              <div className="text-xs font-mono text-slate-300 truncate max-w-full">
                {homeTeam.shortName} <span className="text-amber-400 font-bold">x</span> {awayTeam.shortName}
              </div>
              <div className="text-[10px] font-mono text-emerald-300 font-bold mt-0.5">
                {clockHalfMins}:00 CLOCK PER HALF
              </div>
            </div>

            {/* Quick Match Configuration Widgets */}
            <div className="w-full space-y-2.5">
              {/* Half Duration Picker */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 w-full text-left">
                <div className="flex items-center justify-between gap-1.5 text-[10px] font-mono text-slate-300 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>HALF DURATION</span>
                  </div>
                  <span className="text-amber-300 font-bold">{clockHalfMins}m CLOCK</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {([2, 3, 5, 10] as HalfDurationMinutes[]).map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setHalfDuration(dur)}
                      className={`min-h-[44px] text-xs font-arcade rounded-lg transition-all cursor-pointer ${
                        halfDuration === dur
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-300 hover:text-white'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              {/* 5-Tier Difficulty Picker */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 w-full text-left">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 mb-1.5">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>DIFFICULTY</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase">{difficulty}</span>
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-2 gap-1.5">
                  {(['standing', 'easy', 'normal', 'elite', 'legend'] as DifficultyLevel[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`min-h-[44px] px-1 text-[10px] font-mono uppercase font-bold rounded-lg truncate transition-all cursor-pointer ${
                        difficulty === diff
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'bg-slate-950 text-slate-300 hover:text-white'
                      }`}
                      title={diff.toUpperCase()}
                    >
                      {diff === 'standing' ? 'DUMMY' : diff.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matchday Venue Card (Phase 12 Data-Driven Stadium Architecture) */}
            <div
              onClick={() => onOpenStadium?.()}
              className="w-full bg-slate-900/95 p-2 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mb-1">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-emerald-400 group-hover:text-emerald-300" />
                  <span>{careerModeRestricted ? 'MATCHDAY VENUE (VIEW ONLY)' : 'MATCHDAY VENUE'}</span>
                </div>
                {competitionVenue?.finalBannerText ? (
                  <span className="text-[7.5px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/50 px-1.5 rounded uppercase">
                    🏆 {competitionVenue.finalBannerText}
                  </span>
                ) : competitionVenue?.isNeutralVenue ? (
                  <span className="text-[7.5px] font-bold text-sky-300 bg-sky-500/20 border border-sky-400/40 px-1 rounded uppercase">
                    🌍 {competitionVenue.competitionBannerText}
                  </span>
                ) : isHomeVenueActive ? (
                  <span className="text-[7.5px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/40 px-1 rounded uppercase">
                    🏆 HOME
                  </span>
                ) : (
                  <span className="text-[7.5px] font-mono text-slate-400 uppercase">
                    NEUTRAL
                  </span>
                )}
              </div>
              <div className="font-['Press_Start_2P'] text-[8.5px] text-white group-hover:text-amber-300 transition-colors truncate">
                {(competitionVenue?.stadiumName || activeStadium.shortName).toUpperCase()}
              </div>
              <div className="text-[7.5px] font-mono text-slate-400 truncate mt-0.5 flex items-center justify-between">
                <span>{competitionVenue?.localizedCity || activeStadium.city}</span>
                <span className="text-emerald-400 font-bold">
                  {(competitionVenue?.capacity || activeStadium.capacity).toLocaleString()} CAP
                </span>
              </div>
              {competitionVenue && (
                <div className="mt-1 flex items-center gap-1 flex-wrap">
                  {competitionVenue.baseSponsors.map((sp) => (
                    <span
                      key={sp.id}
                      className="px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700/80 text-[6.5px] font-mono font-bold text-slate-200 uppercase"
                    >
                      {sp.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Phase A6.1: Live Architectural Sky View Thumbnail Preview */}
              <div className="my-1.5">
                <MacroscopicSkyCamPreview
                  stadium={activeStadium}
                  timeOfDay={stadiumConfig?.timeOfDay || 'noon'}
                  weather={stadiumConfig?.weather || 'clear'}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  roofCutaway={stadiumConfig?.roofCutaway}
                  badgeText="SKY VIEW"
                  bottomRightBadge={activeStadium.shape.toUpperCase()}
                  borderClassName="rounded-lg border border-emerald-500/30"
                  compactTitle="Sky View"
                />
              </div>

              <div className="mt-1 flex items-center justify-between text-[7px] font-mono text-sky-400 border-t border-slate-800/60 pt-1">
                <span className="flex items-center gap-1">
                  <span>📹</span> SKY-CAM INTRO
                </span>
                {isFifaWorldCertified(activeStadium) ? (
                  <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[7.5px] uppercase flex items-center gap-0.5 shadow-sm">
                    <span>⭐</span>
                    <span>WORLD TIER</span>
                  </span>
                ) : (
                  <span className="text-amber-300 font-bold uppercase">{activeStadium.fifaCategory || 'CONTINENTAL'}</span>
                )}
              </div>
            </div>

            {/* Match info snippet */}
            <div className="w-full text-[8px] font-mono text-slate-500 border-t border-slate-800/80 pt-1 flex items-center justify-center gap-1.5 flex-wrap">
              <span>{activeStadium.shape.toUpperCase()}</span> · <span>{stadiumConfig?.weather.toUpperCase() || 'CLEAR'}</span> · <span className="text-amber-400 font-bold">{(stadiumConfig?.crowdLevel || 'crowded').toUpperCase()}</span>
            </div>
          </div>

          {/* RIGHT: AWAY TEAM */}
          <div className={`lg:col-span-5 p-3 sm:p-4 flex-col justify-between bg-gradient-to-bl from-slate-900 via-slate-900/90 to-rose-950/20 min-h-0 overflow-y-auto ${mobilePage === 'away' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="space-y-3">
              {/* Away Team Header Card */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg border border-white/20 shrink-0"
                    style={{ backgroundColor: awayTeam.badge.bg, color: awayTeam.badge.primaryColor }}
                  >
                    {awayTeam.badge.icon || awayTeam.badge.text}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40 text-[8.5px] font-bold font-mono uppercase">
                        AWAY
                      </span>
                      <span className="text-[9.5px] font-bold font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                        TIER {awayTeam.ratingTier} · {awayTeam.averageOvr} OVR
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                      {awayTeam.name}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {awayTeam.country} · {isStreetMode ? '1-2-2-2 · Street 7v7' : `${awayTeam.preferredFormation} · ${awayTeam.tacticalPlaystyle}`}
                    </p>
                    {awayTeam.manager?.name && (
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">MANAGER · {awayTeam.manager.name}</p>
                    )}
                  </div>
                </div>

                {!careerModeRestricted && (
                  <button
                    type="button"
                    onClick={() => handleOpenTeamSelect('away')}
                    className="min-h-[44px] px-3 py-1.5 text-[10px] font-arcade bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg border border-rose-500/40 transition-all cursor-pointer shrink-0"
                  >
                    CHANGE
                  </button>
                )}
              </div>

              {/* Captain Hero Banner & Uniform Indicator */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <CaptainHeroCanvas
                    appearance={awayCaptain.appearance}
                    kit={activeAwayKit}
                    facing="left"
                    width={80}
                    height={140}
                    scale={1.1}
                    className="shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-[9px] text-amber-400 font-mono font-bold uppercase">
                      <Sparkles className="w-2.5 h-2.5" />
                      CAPTAIN (C)
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                      {awayCaptain.name.toUpperCase()}
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                      #{awayCaptain.number} · {awayCaptain.subPosition} · ★ {calculatePlayerOvr(awayCaptain.canonicalStats, awayCaptain.role)} OVR
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400 font-mono">KIT:</span>
                      <span className="text-[9.5px] text-amber-300 font-bold truncate max-w-[120px]">
                        {activeAwayKit.name}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAwayMixerOpen(!isAwayMixerOpen)}
                  className={`min-h-[48px] px-3 py-2 text-[9px] font-arcade rounded-lg border transition-all flex flex-col items-center justify-center gap-1 shrink-0 cursor-pointer ${
                    isAwayMixerOpen
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-amber-500/40'
                  }`}
                >
                  <Shirt className="w-4 h-4" />
                  <span>{isAwayMixerOpen ? 'DONE' : 'UNIFORM'}</span>
                </button>
              </div>

              {/* Collapsible Modular Kit Mixer */}
              {isAwayMixerOpen && (
                <div className="animate-fade-in">
                  <ModularKitMixer
                    team={awayTeam}
                    opponentTeam={homeTeam}
                    selection={awayKitSelection}
                    onChangeSelection={setAwayKitSelection}
                    opponentKit={activeHomeKit}
                    side="away"
                  />
                </div>
              )}

              {/* Tactical Starting 11 Hierarchy Display */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
                  <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3 text-rose-400" />
                    LINEUP (TACTICAL ROSTER)
                  </span>
                  <span>OVR</span>
                </div>

                <div className="space-y-1 max-h-[160px] sm:max-h-[190px] overflow-y-auto pr-1">
                  {sortedAwayLineup.map((p) => {
                    const ovr = calculatePlayerOvr(p.canonicalStats, p.role);
                    const isCap = p.id === awayTeam.roles?.captainId || p.isCaptain;
                    const hasBreak = hasStatBreak(p);
                    const badgeClass = getPositionalBadgeColor(p.subPosition, p.role);

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-2 py-0.5 rounded bg-slate-900/70 hover:bg-slate-850 border border-slate-800 text-[10px] transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1 py-0.2 rounded text-[8px] font-mono font-black uppercase border ${badgeClass}`}>
                            {p.subPosition || p.role}
                          </span>
                          <PixelKitIcon
                            primaryColor={activeAwayKit.primaryColor}
                            secondaryColor={activeAwayKit.secondaryColor}
                            number={p.number}
                            className="w-4 h-4 shrink-0"
                          />
                          <span className="font-bold text-slate-200 truncate max-w-[130px]">
                            {p.name.toUpperCase()}
                          </span>
                          {isCap && (
                            <span className="px-1 bg-amber-400 text-slate-950 rounded text-[7px] font-black font-mono">
                              (C)
                            </span>
                          )}
                          {hasBreak && (
                            <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          )}
                        </div>

                        <span className={`font-mono font-black text-[9.5px] ${ovr >= 90 ? 'text-amber-400' : ovr >= 85 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          ★ {ovr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UNIFIED 5-BUTTON PRE-MATCH CONTROL STRIP (2x2 + CTA ON MOBILE, 5-IN-A-LINE ON SM+) */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-2.5 sm:px-4 py-2.5 border-t-2 border-amber-500/80 shrink-0 shadow-2xl">
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 max-w-4xl mx-auto w-full">
            {/* START / KICK OFF (Top full width on mobile, center on sm+) */}
            <button
              type="button"
              onClick={handleLaunchMatch}
              className="col-span-2 sm:col-span-1 sm:order-3 sm:flex-[1.4] min-h-[48px] py-2.5 text-xs sm:text-sm font-arcade arcade-btn-gold font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950 shrink-0" />
              <span className="truncate">{careerModeRestricted ? 'KICKOFF' : 'START MATCH'}</span>
            </button>

            {/* 1. UNIFORM */}
            <button
              type="button"
              onClick={() => {
                if (mobileSide === 'home') {
                  setIsHomeMixerOpen((prev) => !prev);
                } else {
                  setIsAwayMixerOpen((prev) => !prev);
                }
              }}
              className={`sm:order-1 sm:flex-1 min-h-[44px] px-2 py-2 text-[9px] font-arcade rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                isHomeMixerOpen || isAwayMixerOpen
                  ? 'arcade-btn-gold font-bold shadow-md'
                  : 'arcade-btn text-slate-200'
              }`}
            >
              <Shirt className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">UNIFORM</span>
            </button>

            {/* 2. TACTICS */}
            <button
              type="button"
              disabled={isStreetMode}
              onClick={() => {
                if (isStreetMode) return;
                if (onOpenGamePlan) onOpenGamePlan();
                else handleOpenDetailed();
              }}
              className={`sm:order-2 sm:flex-1 min-h-[44px] px-2 py-2 text-[9px] font-arcade rounded-xl transition-all flex items-center justify-center gap-1.5 truncate ${
                isStreetMode
                  ? 'border border-lime-500/40 bg-lime-950/30 text-lime-300 opacity-85 cursor-not-allowed'
                  : 'cursor-pointer arcade-btn text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                {isStreetMode ? '1-2-2-2 FIXED' : careerModeRestricted ? 'TACTICS (VIEW)' : 'TACTICS'}
              </span>
            </button>

            {/* 4. STADIUM */}
            <button
              type="button"
              onClick={() => {
                if (onOpenStadium) onOpenStadium();
                else handleOpenDetailed();
              }}
              className="sm:order-4 sm:flex-1 min-h-[44px] px-2 py-2 text-[9px] font-arcade rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer arcade-btn text-slate-200 truncate"
            >
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{careerModeRestricted ? 'STADIUM (VIEW)' : 'STADIUM'}</span>
            </button>

            {/* 5. SETTINGS */}
            <button
              type="button"
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                else handleOpenDetailed();
              }}
              className="sm:order-5 sm:flex-1 min-h-[44px] px-2 py-2 text-[9px] font-arcade rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer arcade-btn text-slate-200 truncate"
            >
              <Settings2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">SETTINGS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Team Selection Modal */}
      <TeamSelectorModal
        isOpen={isTeamSelectorOpen}
        onClose={() => setIsTeamSelectorOpen(false)}
        onSelectTeam={handleSelectTeam}
        side={teamSelectorSide}
        onSideChange={(s) => setTeamSelectorSide(s)}
        currentTeamId={teamSelectorSide === 'home' ? homeTeamId : awayTeamId}
      />
    </div>
  );
};
