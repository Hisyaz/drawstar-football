/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useState, useMemo, useEffect } from 'react';
import {
  TeamDefinition,
  TeamRosterPlayer,
  PlayerRole,
  SubPosition,
  FormationName,
  TacticalPlaystyle,
  DetailedTactics,
  TeamTacticalRoles,
} from '../types';
import { TacticalPitchBoard } from './TacticalPitchBoard';
import {
  CANONICAL_PLAYSTYLES,
  PLAYSTYLE_DEFINITIONS,
  FORMATION_LIST,
  getDefaultTactics,
  validateFormationStructure,
} from '../game/formations';
import { calculatePlayerOvr, getTeamById } from '../game/teams';
import { evaluatePlayerRoleFit, autoAssignOptimalRoles } from '../game/tactics';
import { resolveEffectivePlaystyle } from '../game/pitchGrid';
import {
  Shield,
  Sparkles,
  Zap,
  ArrowRightLeft,
  X,
  Check,
  RotateCcw,
  Sliders,
  Users,
  Crosshair,
  Crown,
  ChevronRight,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { ConsoleModalShell } from '../../components/common/ConsolePager';

export interface GamePlanPayload {
  homeTeam: TeamDefinition;
  awayTeam: TeamDefinition;
  homeFormation: FormationName;
  awayFormation: FormationName;
  homePlaystyle: TacticalPlaystyle;
  awayPlaystyle: TacticalPlaystyle;
  homeTactics: DetailedTactics;
  awayTactics: DetailedTactics;
  homeRoles: TeamTacticalRoles;
  awayRoles: TeamTacticalRoles;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset: () => void;
  onClose: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GamePlanErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TacticalGamePlanModal caught error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md select-none">
          <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3 animate-pulse" />
            <h3 className="font-['Press_Start_2P'] text-xs text-rose-400 mb-2">TACTICAL BOARD RECOVERED</h3>
            <p className="text-xs font-mono text-slate-300 mb-4">
              A temporary lineup formatting issue occurred. Click Reset to restore standard tactical formations safely without a blank screen.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false });
                  this.props.onReset();
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-['Press_Start_2P'] text-[10px] rounded-lg shadow-md cursor-pointer"
              >
                RESET TO DEFAULTS
              </button>
              <button
                type="button"
                onClick={this.props.onClose}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-lg cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface TacticalGamePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHomeTeam: TeamDefinition;
  initialAwayTeam: TeamDefinition;
  initialHomeFormation?: FormationName;
  initialAwayFormation?: FormationName;
  initialHomePlaystyle?: TacticalPlaystyle;
  initialAwayPlaystyle?: TacticalPlaystyle;
  initialHomeTactics?: DetailedTactics;
  initialAwayTactics?: DetailedTactics;
  initialHomeRoles?: TeamTacticalRoles;
  initialAwayRoles?: TeamTacticalRoles;
  onApplyGamePlan: (plan: GamePlanPayload) => void;
  isMidMatch?: boolean;
  readOnly?: boolean;
}

type TabType = 'game_plan' | 'roles' | 'tactics';

// Defensive helpers to guarantee zero blank screens or runtime crashes
function getSafeRolesForPlayers(players: TeamRosterPlayer[], roles?: TeamTacticalRoles): TeamTacticalRoles {
  const validIds = new Set((players || []).map((p) => p.id));
  const optimal = autoAssignOptimalRoles(players || []);
  const fallbackId = players && players.length > 0 ? players[0].id : 'p1';

  const captainId = roles?.captainId && validIds.has(roles.captainId) ? roles.captainId : (optimal.captainId || fallbackId);
  const freeKickNearId = roles?.freeKickNearId && validIds.has(roles.freeKickNearId) ? roles.freeKickNearId : (optimal.freeKickNearId || fallbackId);
  const freeKickLongId = roles?.freeKickLongId && validIds.has(roles.freeKickLongId) ? roles.freeKickLongId : (optimal.freeKickLongId || fallbackId);
  const penaltyTakerId = roles?.penaltyTakerId && validIds.has(roles.penaltyTakerId) ? roles.penaltyTakerId : (optimal.penaltyTakerId || fallbackId);
  const leftCornerTakerId = roles?.leftCornerTakerId && validIds.has(roles.leftCornerTakerId) ? roles.leftCornerTakerId : (optimal.leftCornerTakerId || fallbackId);
  const rightCornerTakerId = roles?.rightCornerTakerId && validIds.has(roles.rightCornerTakerId) ? roles.rightCornerTakerId : (optimal.rightCornerTakerId || fallbackId);

  return {
    captainId,
    freeKickNearId,
    freeKickLongId,
    penaltyTakerId,
    leftCornerTakerId,
    rightCornerTakerId,
  };
}

function getSafeSubPosition(subPos?: any, role?: any): SubPosition {
  if (subPos && !['ST1', 'ST2', 'CB1', 'CB2', 'CM1', 'CM2'].includes(subPos)) {
    return subPos as SubPosition;
  }
  const r = (role || '').toUpperCase();
  if (r === 'GK') return 'GK';
  if (r.startsWith('CB') || r === 'LIB' || r === 'SW') return 'CB';
  if (r.startsWith('LB')) return 'LB';
  if (r.startsWith('RB')) return 'RB';
  if (r.startsWith('ST') || r.startsWith('CF')) return 'ST';
  if (r.startsWith('SS')) return 'SS';
  if (r === 'LM' || r === 'LMF') return 'LM';
  if (r === 'RM' || r === 'RMF') return 'RM';
  if (r === 'LW' || r === 'LWF') return 'LW';
  if (r === 'RW' || r === 'RWF') return 'RW';
  if (r.startsWith('CDM') || r.startsWith('DM')) return 'CDM';
  if (r.startsWith('CAM') || r.startsWith('AM')) return 'CAM';
  return 'CM';
}

function sanitizeTeam(team?: TeamDefinition, fallbackId: string = 'spain_2026'): TeamDefinition {
  const fallback = getTeamById(fallbackId);
  const base = team && team.players && team.players.length >= 11 ? team : fallback;

  let players = (base.players || []).map((p) => ({
    ...p,
    name: p.name || 'Player',
    role: p.role || 'CM1',
    subPosition: getSafeSubPosition(p.subPosition, p.role),
    playstyle: p.playstyle || 'basic',
    canonicalStats: p.canonicalStats || fallback.players[0].canonicalStats,
  }));

  if (players.length < 11) {
    players = (fallback.players || []).map((p) => ({ ...p }));
  }

  const substitutes = (base.substitutes && base.substitutes.length > 0 ? base.substitutes : fallback.substitutes || []).map((p) => ({
    ...p,
    name: p.name || 'Sub',
    role: p.role || 'CM1',
    subPosition: getSafeSubPosition(p.subPosition, p.role),
    playstyle: p.playstyle || 'basic',
    canonicalStats: p.canonicalStats || fallback.players[0].canonicalStats,
  }));

  return {
    ...base,
    name: base.name || fallback.name,
    shortName: base.shortName || fallback.shortName,
    players,
    substitutes,
    roles: getSafeRolesForPlayers(players, base.roles || fallback.roles),
    tacticalPlaystyle: base.tacticalPlaystyle || fallback.tacticalPlaystyle || 'possession',
    preferredFormation: base.preferredFormation || fallback.preferredFormation || '4-3-3',
  };
}

function getSafeRoles(team: TeamDefinition, roles?: TeamTacticalRoles): TeamTacticalRoles {
  return getSafeRolesForPlayers(team.players || [], roles || team.roles);
}

const TacticalGamePlanModalInner: React.FC<TacticalGamePlanModalProps> = ({
  isOpen,
  onClose,
  initialHomeTeam,
  initialAwayTeam,
  initialHomeFormation,
  initialAwayFormation,
  initialHomePlaystyle,
  initialAwayPlaystyle,
  initialHomeTactics,
  initialAwayTactics,
  initialHomeRoles,
  initialAwayRoles,
  onApplyGamePlan,
  isMidMatch = false,
  readOnly = false,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<TabType>('game_plan');

  // Mobile Single-Pitch Active Team Toggle
  const [mobileActiveSide, setMobileActiveSide] = useState<'home' | 'away'>('home');

  // Active Team Clones (guaranteed safe default instances)
  const [homeTeam, setHomeTeam] = useState<TeamDefinition>(() =>
    sanitizeTeam(initialHomeTeam, 'spain_2026')
  );

  const [awayTeam, setAwayTeam] = useState<TeamDefinition>(() =>
    sanitizeTeam(initialAwayTeam, 'argentina_2026')
  );

  // Formations & Playstyles
  const [homeFormation, setHomeFormation] = useState<FormationName>(
    initialHomeFormation || initialHomeTeam?.preferredFormation || '4-3-3'
  );
  const [awayFormation, setAwayFormation] = useState<FormationName>(
    initialAwayFormation || initialAwayTeam?.preferredFormation || '4-4-2'
  );

  const [homePlaystyle, setHomePlaystyle] = useState<TacticalPlaystyle>(
    initialHomePlaystyle || initialHomeTeam?.tacticalPlaystyle || 'possession'
  );
  const [awayPlaystyle, setAwayPlaystyle] = useState<TacticalPlaystyle>(
    initialAwayPlaystyle || initialAwayTeam?.tacticalPlaystyle || 'gegenpress'
  );

  const [homeTactics, setHomeTactics] = useState<DetailedTactics>(
    initialHomeTactics || initialHomeTeam?.tactics || getDefaultTactics('possession')
  );
  const [awayTactics, setAwayTactics] = useState<DetailedTactics>(
    initialAwayTactics || initialAwayTeam?.tactics || getDefaultTactics('gegenpress')
  );

  // Authoritative Set-Piece Roles
  const [homeRoles, setHomeRoles] = useState<TeamTacticalRoles>(() =>
    getSafeRoles(sanitizeTeam(initialHomeTeam, 'spain_2026'), initialHomeRoles)
  );
  const [awayRoles, setAwayRoles] = useState<TeamTacticalRoles>(() =>
    getSafeRoles(sanitizeTeam(initialAwayTeam, 'argentina_2026'), initialAwayRoles)
  );

  // Active Selection for Substitutions / Swaps
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: string;
    isBench: boolean;
    side: 'home' | 'away';
  } | null>(null);

  // Roles Tab Active Sub-Team Selector
  const [rolesActiveSide, setRolesActiveSide] = useState<'home' | 'away'>('home');

  // Sync when initial teams change
  useEffect(() => {
    if (isOpen) {
      const safeHome = sanitizeTeam(initialHomeTeam, 'spain_2026');
      const safeAway = sanitizeTeam(initialAwayTeam, 'argentina_2026');
      setHomeTeam(safeHome);
      setAwayTeam(safeAway);
      setHomeFormation(initialHomeFormation || safeHome.preferredFormation || '4-3-3');
      setAwayFormation(initialAwayFormation || safeAway.preferredFormation || '4-4-2');
      setHomePlaystyle(initialHomePlaystyle || safeHome.tacticalPlaystyle || 'possession');
      setAwayPlaystyle(initialAwayPlaystyle || safeAway.tacticalPlaystyle || 'gegenpress');
      setHomeTactics(initialHomeTactics || safeHome.tactics || getDefaultTactics('possession'));
      setAwayTactics(initialAwayTactics || safeAway.tactics || getDefaultTactics('gegenpress'));
      setHomeRoles(getSafeRoles(safeHome, initialHomeRoles));
      setAwayRoles(getSafeRoles(safeAway, initialAwayRoles));
      setSelectedPlayer(null);
      setMobileActiveSide('home');
    }
  }, [
    isOpen,
    initialHomeTeam,
    initialAwayTeam,
    initialHomeFormation,
    initialAwayFormation,
    initialHomePlaystyle,
    initialAwayPlaystyle,
    initialHomeTactics,
    initialAwayTactics,
    initialHomeRoles,
    initialAwayRoles,
  ]);

  // Handle Player Selection, Swapping, and Substitutions
  const handleSelectPlayer = (
    player: TeamRosterPlayer,
    isBench: boolean,
    side: 'home' | 'away'
  ) => {
    if (readOnly) return;
    // If no player selected or clicking different team, select this player
    if (!selectedPlayer || selectedPlayer.side !== side) {
      setSelectedPlayer({ id: player.id, isBench, side });
      return;
    }

    // Clicking same player deselects
    if (selectedPlayer.id === player.id) {
      setSelectedPlayer(null);
      return;
    }

    const currentTeam = side === 'home' ? homeTeam : awayTeam;
    const setTeam = side === 'home' ? setHomeTeam : setAwayTeam;
    const currentRoles = side === 'home' ? homeRoles : awayRoles;
    const setRoles = side === 'home' ? setHomeRoles : setAwayRoles;

    const newPlayers = [...currentTeam.players];
    const newSubs = [...(currentTeam.substitutes || [])];

    // Case 1: Pitch Player <-> Pitch Player (Swap positions / roles)
    if (!selectedPlayer.isBench && !isBench) {
      const idxA = newPlayers.findIndex((p) => p.id === selectedPlayer.id);
      const idxB = newPlayers.findIndex((p) => p.id === player.id);

      if (idxA !== -1 && idxB !== -1) {
        // Swap tactical roles and subpositions
        const tempRole = newPlayers[idxA].role;
        const tempSub = newPlayers[idxA].subPosition;

        newPlayers[idxA] = {
          ...newPlayers[idxA],
          role: newPlayers[idxB].role,
          subPosition: newPlayers[idxB].subPosition,
        };

        newPlayers[idxB] = {
          ...newPlayers[idxB],
          role: tempRole,
          subPosition: tempSub,
        };

        setTeam({ ...currentTeam, players: newPlayers });
      }
      setSelectedPlayer(null);
      return;
    }

    // Case 2: Pitch Player <-> Bench Player (Tactical Substitution)
    const pitchPlayerId = selectedPlayer.isBench ? player.id : selectedPlayer.id;
    const benchPlayerId = selectedPlayer.isBench ? selectedPlayer.id : player.id;

    const pitchIdx = newPlayers.findIndex((p) => p.id === pitchPlayerId);
    const benchIdx = newSubs.findIndex((p) => p.id === benchPlayerId);

    if (pitchIdx !== -1 && benchIdx !== -1) {
      const oldPitchPlayer = newPlayers[pitchIdx];
      const incomingBenchPlayer = newSubs[benchIdx];

      // Assign incoming player to the starting spot and role
      newPlayers[pitchIdx] = {
        ...incomingBenchPlayer,
        role: oldPitchPlayer.role,
        subPosition: incomingBenchPlayer.subPosition || oldPitchPlayer.subPosition,
      };

      // Put departing player onto the bench
      newSubs[benchIdx] = {
        ...oldPitchPlayer,
        role: incomingBenchPlayer.role,
      };

      // Check if departed player held any special set-piece role
      const updatedRoles = { ...currentRoles };
      const autoRoles = autoAssignOptimalRoles(newPlayers);

      if (updatedRoles.captainId === oldPitchPlayer.id) {
        updatedRoles.captainId = autoRoles.captainId;
      }
      if (updatedRoles.freeKickNearId === oldPitchPlayer.id) {
        updatedRoles.freeKickNearId = autoRoles.freeKickNearId;
      }
      if (updatedRoles.freeKickLongId === oldPitchPlayer.id) {
        updatedRoles.freeKickLongId = autoRoles.freeKickLongId;
      }
      if (updatedRoles.penaltyTakerId === oldPitchPlayer.id) {
        updatedRoles.penaltyTakerId = autoRoles.penaltyTakerId;
      }
      if (updatedRoles.leftCornerTakerId === oldPitchPlayer.id) {
        updatedRoles.leftCornerTakerId = autoRoles.leftCornerTakerId;
      }
      if (updatedRoles.rightCornerTakerId === oldPitchPlayer.id) {
        updatedRoles.rightCornerTakerId = autoRoles.rightCornerTakerId;
      }

      setRoles(updatedRoles);
      setTeam({
        ...currentTeam,
        players: newPlayers,
        substitutes: newSubs,
      });
    }

    setSelectedPlayer(null);
  };

  // Auto-Assign Optimal Roles Handler
  const handleAutoAssignRoles = (side: 'home' | 'away') => {
    if (readOnly) return;
    const targetTeam = side === 'home' ? homeTeam : awayTeam;
    const optimal = autoAssignOptimalRoles(targetTeam.players);
    if (side === 'home') {
      setHomeRoles(optimal);
    } else {
      setAwayRoles(optimal);
    }
  };

  // Handle Player Custom Position Drag on Tactical Board (Phase 16)
  const handlePlayerPositionChange = (
    side: 'home' | 'away',
    playerId: string,
    pos: { x: number; y: number },
    newRole: PlayerRole,
    newSubPos: SubPosition,
    pesLabel: string
  ) => {
    if (readOnly) return;
    const isHome = side === 'home';
    const setTeam = isHome ? setHomeTeam : setAwayTeam;
    const currentTeam = isHome ? homeTeam : awayTeam;

    const newPlayers = currentTeam.players.map((p) => {
      if (p.id === playerId) {
        const intrinsic = p.intrinsicPlaystyle || p.playstyle;
        const effectivePlaystyle = resolveEffectivePlaystyle(intrinsic, newSubPos);
        return {
          ...p,
          customPos: pos,
          role: newRole,
          subPosition: newSubPos,
          intrinsicPlaystyle: intrinsic,
          playstyle: effectivePlaystyle,
        };
      }
      return p;
    });

    setTeam({
      ...currentTeam,
      players: newPlayers,
    });
  };

  // Phase 0.2: Formation structural validation checks (>=2 DEF, >=2 MID, >=1 ATT, 1 GK)
  const homeValidation = useMemo(() => {
    return validateFormationStructure(
      homeTeam.players.map((p) => ({
        role: p.role,
        subPosition: p.subPosition,
        label: p.subPosition || p.role,
      }))
    );
  }, [homeTeam.players]);

  const awayValidation = useMemo(() => {
    return validateFormationStructure(
      awayTeam.players.map((p) => ({
        role: p.role,
        subPosition: p.subPosition,
        label: p.subPosition || p.role,
      }))
    );
  }, [awayTeam.players]);

  const isFormationValid = homeValidation.isValid && awayValidation.isValid;
  const invalidMessage = !homeValidation.isValid
    ? `HOME: ${homeValidation.message}`
    : !awayValidation.isValid
    ? `AWAY: ${awayValidation.message}`
    : '';

  // Confirm & Apply Changes
  const handleConfirm = () => {
    if (!isFormationValid) return;

    onApplyGamePlan({
      homeTeam,
      awayTeam,
      homeFormation,
      awayFormation,
      homePlaystyle,
      awayPlaystyle,
      homeTactics,
      awayTactics,
      homeRoles,
      awayRoles,
    });
    onClose();
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    const safeHome = sanitizeTeam(initialHomeTeam, 'spain_2026');
    const safeAway = sanitizeTeam(initialAwayTeam, 'argentina_2026');
    setHomeTeam(safeHome);
    setAwayTeam(safeAway);
    setHomeFormation(safeHome.preferredFormation || '4-3-3');
    setAwayFormation(safeAway.preferredFormation || '4-4-2');
    setHomePlaystyle(safeHome.tacticalPlaystyle || 'possession');
    setAwayPlaystyle(safeAway.tacticalPlaystyle || 'gegenpress');
    setHomeTactics(safeHome.tactics || getDefaultTactics('possession'));
    setAwayTactics(safeAway.tactics || getDefaultTactics('gegenpress'));
    setHomeRoles(getSafeRoles(safeHome, initialHomeRoles));
    setAwayRoles(getSafeRoles(safeAway, initialAwayRoles));
    setSelectedPlayer(null);
  };

  if (!isOpen) return null;

  const modalTabs = [
    { id: 'game_plan', label: 'BOARD', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'roles', label: 'ROLES', icon: <Crosshair className="w-3.5 h-3.5" /> },
    { id: 'tactics', label: 'TACTICS', icon: <Sliders className="w-3.5 h-3.5" /> },
  ];

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="GAME PLAN"
      subtitle={readOnly ? 'Career View Only · Lineup & Tactics' : 'Squad Lineup · Set-Piece Roles · Tactics'}
      badge={readOnly ? 'VIEW ONLY' : isMidMatch ? 'LIVE MATCH' : 'PRE-MATCH'}
      icon={<Users className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-[98vw] 2xl:max-w-[1800px]"
      tabs={modalTabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as TabType)}
      bodyClassName="p-2 sm:p-3 flex flex-col min-h-0 overflow-hidden"
      footer={
        !readOnly ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="min-h-[44px] px-3.5 py-2 text-xs font-mono font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isFormationValid}
              title={!isFormationValid ? invalidMessage : 'Confirm & Apply Game Plan'}
              className={`min-h-[48px] flex-1 sm:flex-none px-5 py-2.5 text-xs font-arcade rounded-xl font-black shadow-md transition-all flex items-center justify-center gap-2 ${
                isFormationValid
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 cursor-pointer'
                  : 'bg-rose-950/70 border border-rose-500/80 text-rose-300 opacity-70 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>CONFIRM GAME PLAN</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-arcade text-xs font-bold cursor-pointer"
            >
              CLOSE VIEW
            </button>
          </div>
        )
      }
    >
      {/* Formation integrity alert */}
      {!isFormationValid && (
        <div className="mb-2 bg-rose-950/90 border border-rose-500/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shrink-0 animate-pulse text-rose-200">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-mono text-xs text-rose-200 font-bold truncate">
              {invalidMessage}
            </span>
          </div>
          <span className="text-[10px] font-mono text-rose-200/90 shrink-0 hidden md:inline">
            Minimums: ≥2 DEF, ≥2 MID, ≥1 ATT
          </span>
        </div>
      )}

      {/* Mobile Home/Away pitch switcher */}
      {activeTab === 'game_plan' && (
        <div className="md:hidden mb-2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-mono text-slate-300 truncate">
            TEAM: <b className="text-white uppercase">{mobileActiveSide}</b>
          </span>
          <button
            type="button"
            onClick={() => setMobileActiveSide((prev) => (prev === 'home' ? 'away' : 'home'))}
            className="min-h-[44px] px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-[10px] font-black rounded-lg shadow flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>SWITCH TO {mobileActiveSide === 'home' ? 'AWAY' : 'HOME'}</span>
          </button>
        </div>
      )}

      {/* Main body area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'game_plan' && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 overflow-hidden min-h-0">
              {/* HOME TEAM TACTICAL PITCH BOARD */}
              <div className={`${mobileActiveSide === 'away' ? 'hidden md:flex' : 'flex'} flex-col h-full min-h-0 overflow-hidden`}>
                <TacticalPitchBoard
                  team={homeTeam}
                  side="home"
                  selectedPlayerId={selectedPlayer?.side === 'home' ? selectedPlayer.id : null}
                  onSelectPlayer={(p, isBench) => handleSelectPlayer(p, isBench, 'home')}
                  formation={homeFormation}
                  onChangeFormation={(f) => {
                    if (!readOnly) setHomeFormation(f);
                  }}
                  tacticalPlaystyle={homePlaystyle}
                  captainId={homeRoles.captainId}
                  activeKit={homeTeam.kit}
                  onPlayerPositionChange={(pId, pos, nRole, nSubPos, pesLabel) =>
                    handlePlayerPositionChange('home', pId, pos, nRole, nSubPos, pesLabel)
                  }
                  isCompactMobile
                />
              </div>

              {/* AWAY TEAM TACTICAL PITCH BOARD */}
              <div className={`${mobileActiveSide === 'home' ? 'hidden md:flex' : 'flex'} flex-col h-full min-h-0 overflow-hidden`}>
                <TacticalPitchBoard
                  team={awayTeam}
                  side="away"
                  isOpponent={true}
                  selectedPlayerId={selectedPlayer?.side === 'away' ? selectedPlayer.id : null}
                  onSelectPlayer={(p, isBench) => handleSelectPlayer(p, isBench, 'away')}
                  formation={awayFormation}
                  onChangeFormation={(f) => {
                    if (!readOnly) setAwayFormation(f);
                  }}
                  tacticalPlaystyle={awayPlaystyle}
                  captainId={awayRoles.captainId}
                  activeKit={awayTeam.awayKit || awayTeam.kit}
                  onPlayerPositionChange={(pId, pos, nRole, nSubPos, pesLabel) =>
                    handlePlayerPositionChange('away', pId, pos, nRole, nSubPos, pesLabel)
                  }
                  isCompactMobile
                />
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 2: AUTHORITATIVE "ROLES" SET-PIECE ASSIGNMENT SUITE (SECTION 15.5)  */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'roles' && (
            <div className="w-full h-full flex flex-col bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto">
              {/* Team Selector & Auto-Assign Header */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 pb-3 mb-4 shrink-0">
                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRolesActiveSide('home')}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all truncate cursor-pointer ${
                      rolesActiveSide === 'home'
                        ? 'bg-sky-500 text-slate-950 shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    HOME ({homeTeam.shortName || homeTeam.name})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRolesActiveSide('away')}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all truncate cursor-pointer ${
                      rolesActiveSide === 'away'
                        ? 'bg-rose-500 text-white shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    AWAY ({awayTeam.shortName || awayTeam.name})
                  </button>
                </div>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleAutoAssignRoles(rolesActiveSide)}
                    className="min-h-[44px] w-full sm:w-auto px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-[10px] font-black rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AUTO-ASSIGN OPTIMAL ROLES</span>
                  </button>
                )}
              </div>

              {/* Canonical 6 Set-Piece Roles Cards Grid */}
              {(() => {
                const targetTeam = rolesActiveSide === 'home' ? homeTeam : awayTeam;
                const activeRoles = rolesActiveSide === 'home' ? homeRoles : awayRoles;
                const setRoles = rolesActiveSide === 'home' ? setHomeRoles : setAwayRoles;
                const startingPlayers = targetTeam.players;

                const roleConfigs: {
                  key: keyof TeamTacticalRoles;
                  title: string;
                  badge: string;
                  description: string;
                  formula: string;
                }[] = [
                  {
                    key: 'captainId',
                    title: 'CAPTAIN (C)',
                    badge: '(C)',
                    description: 'Provides +5 CMP stabilization to whole squad during high pressure.',
                    formula: 'CMP 65% + POS 35%',
                  },
                  {
                    key: 'freeKickNearId',
                    title: 'FREE KICK (NEAR < 28m)',
                    badge: 'FK-S',
                    description: 'Direct strikes on goal, curled finesse, and dipped free kicks.',
                    formula: 'SHO 50% + LSH 30% + CMP 20%',
                  },
                  {
                    key: 'freeKickLongId',
                    title: 'FREE KICK (LONG > 28m)',
                    badge: 'FK-L',
                    description: 'Driven through-balls, switches, and box deliveries.',
                    formula: 'LPA 55% + CRO 45%',
                  },
                  {
                    key: 'penaltyTakerId',
                    title: 'PENALTY TAKER',
                    badge: 'PEN',
                    description: 'Primary spot-kick specialist with ice in their veins.',
                    formula: 'SHO 60% + CMP 40%',
                  },
                  {
                    key: 'leftCornerTakerId',
                    title: 'LEFT CORNER TAKER',
                    badge: 'LCK',
                    description: 'Inswinging & outswinging crosses from the left flag.',
                    formula: 'CRO 65% + SPA 35%',
                  },
                  {
                    key: 'rightCornerTakerId',
                    title: 'RIGHT CORNER TAKER',
                    badge: 'RCK',
                    description: 'Inswinging & outswinging crosses from the right flag.',
                    formula: 'CRO 65% + SPA 35%',
                  },
                ];

                const spRoles: { key: 'headingIds' | 'backLineIds' | 'reboundIds'; title: string; slots: number; desc: string; stats: string }[] = [
                  { key: 'headingIds', title: 'HEADING', slots: 3, desc: 'Defend corners AND attack corners. Your three best headers / strongest players.', stats: 'HEA + STR + height' },
                  { key: 'backLineIds', title: 'BACK LINE', slots: 3, desc: 'Stay back when you attack a set piece to guard against counters.', stats: 'PAC + INT' },
                  { key: 'reboundIds', title: 'REBOUNDS', slots: 2, desc: 'Hover at the edge of the box to catch second balls and shoot; guard the rebound zone when defending.', stats: 'REF + long shots + INT' },
                ];
                const isGkPlayer = (p: any) => p.role === 'GK' || p.subPosition === 'GK' || p.position === 'GK';
                const spTaken = new Set<string>([...(activeRoles.headingIds || []), ...(activeRoles.backLineIds || []), ...(activeRoles.reboundIds || [])].filter(Boolean));
                const spCandidates = startingPlayers.filter((p) => !isGkPlayer(p));
                const spSection = (
                  <div className="mt-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">SET PIECES</span>
                      <span className="text-[9px] font-mono text-slate-500">Goalkeepers can't be picked. Empty slot = auto-pick best rated.</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {spRoles.map((r) => (
                        <div key={r.key} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-['Press_Start_2P'] text-[9px] text-sky-300">{r.title}</span>
                            <span className="text-[8px] font-mono text-slate-500">{r.stats}</span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-mono mb-2">{r.desc}</p>
                          {Array.from({ length: r.slots }).map((_, i) => {
                            const cur = (activeRoles[r.key] || [])[i] || '';
                            return (
                              <select
                                key={i}
                                value={cur}
                                onChange={(e) => {
                                  const arr = [...(activeRoles[r.key] || [])];
                                  while (arr.length < r.slots) arr.push('');
                                  arr[i] = e.target.value;
                                  setRoles({ ...activeRoles, [r.key]: arr });
                                }}
                                className="min-h-[44px] w-full mb-1.5 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono"
                              >
                                <option value="">AUTO (best rated)</option>
                                {spCandidates
                                  .filter((p) => p.id === cur || !spTaken.has(p.id))
                                  .map((p) => (
                                    <option key={p.id} value={p.id}>
                                      #{p.number} {p?.name ? p.name.toUpperCase() : 'PLAYER'} ({p.subPosition || p.role})
                                    </option>
                                  ))}
                              </select>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );

                return (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 flex-1">
                    {roleConfigs.map((cfg) => {
                      const assignedPlayerId = activeRoles[cfg.key];
                      const assignedPlayer =
                        startingPlayers.find((p) => p.id === assignedPlayerId) || startingPlayers[0];
                      const fitResult = assignedPlayer
                        ? evaluatePlayerRoleFit(assignedPlayer, cfg.key)
                        : { score: 50, highlightText: '' };

                      return (
                        <div
                          key={cfg.key}
                          className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-lg"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">
                                {cfg.title}
                              </span>
                              <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                                {cfg.formula}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mb-3">{cfg.description}</p>

                            {/* Current Assigned Player Card */}
                            <div className="bg-slate-950 border border-amber-500/30 rounded-lg p-2.5 mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px] flex items-center justify-center border border-amber-500/40">
                                  #{assignedPlayer?.number ?? 10}
                                </span>
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>{assignedPlayer?.name ? assignedPlayer.name.toUpperCase() : 'UNKNOWN'}</span>
                                    <span className="text-[9px] font-mono text-slate-400">
                                      ({assignedPlayer?.subPosition || assignedPlayer?.role || 'FW'})
                                    </span>
                                  </div>
                                  <div className="text-[9px] font-mono text-emerald-400 mt-0.5">
                                    {fitResult?.highlightText || ''}
                                  </div>
                                </div>
                              </div>

                              <span className="font-mono font-bold text-xs text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                                FIT: {fitResult?.score ?? 50}
                              </span>
                            </div>
                          </div>

                          {/* Candidate Selector Dropdown */}
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase font-bold mb-1 block">
                              REASSIGN SPECIALIST:
                            </span>
                            <select
                              value={assignedPlayerId}
                              onChange={(e) => {
                                setRoles({
                                  ...activeRoles,
                                  [cfg.key]: e.target.value,
                                });
                              }}
                              className="min-h-[44px] w-full bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono focus:outline-none"
                            >
                              {startingPlayers.map((p) => {
                                const fit = evaluatePlayerRoleFit(p, cfg.key);
                                return (
                                  <option key={p.id} value={p.id}>
                                    #{p.number} {p?.name ? p.name.toUpperCase() : 'PLAYER'} ({p.subPosition || p.role}) — Fit: {fit.score} ({fit.highlightText})
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {spSection}
                  </>
                );
              })()}
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* TAB 3: TACTICS & FORMATION QUICK-SHIFTER                                */}
          {/* ----------------------------------------------------------------------- */}
          {activeTab === 'tactics' && (
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
              {/* HOME TEAM TACTICAL SUITE */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="font-['Press_Start_2P'] text-[11px] text-sky-400">
                      HOME TACTICAL SUITE
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{homeTeam.name}</span>
                  </div>

                  {/* Formation Selector */}
                  <div className="mb-4">
                    <label className="text-[10px] font-mono text-slate-400 font-bold uppercase mb-1.5 block">
                      FORMATION SYSTEM:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FORMATION_LIST.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => !readOnly && setHomeFormation(f.id)}
                          disabled={readOnly}
                          className={`min-h-[44px] p-2.5 rounded-lg text-left border transition-all ${
                            homeFormation === f.id
                              ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                          } ${readOnly ? 'cursor-default opacity-80' : ''}`}
                        >
                          <div className="font-arcade font-black text-xs text-amber-300">{f.id}</div>
                          <div className="text-[11px] font-mono text-slate-300 truncate">{f.tag}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Playstyle Selector */}
                  <div className="mb-4">
                    <label className="text-xs font-mono text-slate-300 font-bold uppercase mb-1.5 block">
                      TACTICAL PHILOSOPHY:
                    </label>
                    <select
                      disabled={readOnly}
                      value={homePlaystyle}
                      onChange={(e) => {
                        if (readOnly) return;
                        const nextStyle = e.target.value as TacticalPlaystyle;
                        setHomePlaystyle(nextStyle);
                        setHomeTactics(getDefaultTactics(nextStyle));
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 font-mono focus:outline-none disabled:opacity-75"
                    >
                      {CANONICAL_PLAYSTYLES.map((ps) => {
                        const def = PLAYSTYLE_DEFINITIONS[ps];
                        return (
                          <option key={ps} value={ps}>
                            {def ? `${def.name} (${def.subtitle})` : ps}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs font-sans text-slate-300 leading-relaxed">
                  <div className="text-amber-400 font-mono font-bold text-xs mb-1">PHILOSOPHY PROFILE:</div>
                  <p>{PLAYSTYLE_DEFINITIONS[homePlaystyle]?.description || 'Tactical system'}</p>
                </div>
              </div>

              {/* AWAY TEAM TACTICAL SUITE */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="font-['Press_Start_2P'] text-[11px] text-rose-400">
                      AWAY TACTICAL SUITE
                    </span>
                    <span className="text-xs font-mono text-slate-400 truncate max-w-[140px]">{awayTeam.name}</span>
                  </div>

                  {/* Formation Selector */}
                  <div className="mb-4">
                    <label className="text-xs font-mono text-slate-300 font-bold uppercase mb-1.5 block">
                      FORMATION SYSTEM:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FORMATION_LIST.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          disabled={readOnly}
                          onClick={() => !readOnly && setAwayFormation(f.id)}
                          className={`min-h-[44px] p-2.5 rounded-lg text-left border transition-all ${
                            awayFormation === f.id
                              ? 'bg-rose-500/20 border-rose-400 text-white font-bold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                          } ${readOnly ? 'cursor-default opacity-80' : ''}`}
                        >
                          <div className="font-arcade font-black text-xs text-amber-300">{f.id}</div>
                          <div className="text-[11px] font-mono text-slate-300 truncate">{f.tag}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Playstyle Selector */}
                  <div className="mb-4">
                    <label className="text-xs font-mono text-slate-300 font-bold uppercase mb-1.5 block">
                      TACTICAL PHILOSOPHY:
                    </label>
                    <select
                      disabled={readOnly}
                      value={awayPlaystyle}
                      onChange={(e) => {
                        if (readOnly) return;
                        const nextStyle = e.target.value as TacticalPlaystyle;
                        setAwayPlaystyle(nextStyle);
                        setAwayTactics(getDefaultTactics(nextStyle));
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 font-mono focus:outline-none disabled:opacity-75"
                    >
                      {CANONICAL_PLAYSTYLES.map((ps) => {
                        const def = PLAYSTYLE_DEFINITIONS[ps];
                        return (
                          <option key={ps} value={ps}>
                            {def ? `${def.name} (${def.subtitle})` : ps}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs font-sans text-slate-300 leading-relaxed">
                  <div className="text-amber-400 font-mono font-bold text-xs mb-1">PHILOSOPHY PROFILE:</div>
                  <p>{PLAYSTYLE_DEFINITIONS[awayPlaystyle]?.description || 'Tactical system'}</p>
                </div>
              </div>
            </div>
          )}
      </div>
    </ConsoleModalShell>
  );
};

export const TacticalGamePlanModal: React.FC<TacticalGamePlanModalProps> = (props) => {
  const [resetKey, setResetKey] = useState(0);
  if (!props.isOpen) return null;
  return (
    <GamePlanErrorBoundary
      key={resetKey}
      onReset={() => {
        setResetKey((prev) => prev + 1);
      }}
      onClose={props.onClose}
    >
      <TacticalGamePlanModalInner {...props} key={resetKey} />
    </GamePlanErrorBoundary>
  );
};

