/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  TeamDefinition,
  TeamRosterPlayer,
  FormationName,
  TacticalPlaystyle,
  PlayerRole,
  SubPosition,
  TeamKit,
} from '../types';
import { calculatePlayerOvr } from '../game/teams';
import {
  TACTICAL_BOARD_FORMATIONS,
  FORMATION_LIST,
  validateFormationStructure,
} from '../game/formations';
import {
  GOALKEEPER_ZONE,
  clampToOutfieldPitch,
  resolvePositionFromPitchGrid,
  resolveLegacyRoleFromSubPos,
  isPlaystyleAllowedForSubPos,
  PitchGridZone,
} from '../game/pitchGrid';
import { audio } from '../game/audio';
import { Sparkles, Shield, Zap, AlertTriangle, Lock, X, Check, Move } from 'lucide-react';
import { JerseyIcon } from './JerseyIcon';
import { PlayerFacePortrait } from '../../components/PlayerFacePortrait';
import { PRESET_PLAYERS } from '../../constants';
import { PlayerCardData } from '../../types';
import { applyAppearanceV2ToPlayerCard } from '../../utils/gameplayAdapter';

export { JerseyIcon, JerseyIcon as PixelKitIcon };
const TacticalPlayerPortrait = React.memo(PlayerFacePortrait);

function buildPortraitCard(player: TeamRosterPlayer, team: TeamDefinition, kit?: TeamKit): PlayerCardData {
  const base = PRESET_PLAYERS[0];
  const card = {
    ...base,
    id: player.id,
    name: player.name,
    number: player.number,
    shirtNumber: player.number,
    club: team.name,
    kit: { ...base.kit, color1: kit?.primaryColor || team.kit.primaryColor, color2: kit?.secondaryColor || team.kit.secondaryColor },
    biometrics: {
      ...base.biometrics,
      skinColor: player.appearance?.skinTone || base.biometrics.skinColor,
      hairStyle: player.appearance?.hairStyle as PlayerCardData['biometrics']['hairStyle'],
      hairRoot: player.appearance?.hairColor || base.biometrics.hairRoot,
      facialHair: player.appearance?.facialHair as PlayerCardData['biometrics']['facialHair'],
      strength: 'str' in player.canonicalStats ? player.canonicalStats.str : base.biometrics.strength,
    },
    appearanceV2: player.appearanceV2,
  } as PlayerCardData;
  return player.appearanceV2 ? applyAppearanceV2ToPlayerCard(card, player.appearanceV2) : card;
}

interface TacticalPitchBoardProps {
  team: TeamDefinition;
  side: 'home' | 'away';
  isOpponent?: boolean;
  selectedPlayerId: string | null;
  onSelectPlayer: (player: TeamRosterPlayer, isBench: boolean) => void;
  formation: FormationName;
  onChangeFormation?: (formation: FormationName) => void;
  tacticalPlaystyle?: TacticalPlaystyle;
  captainId?: string;
  activeKit?: TeamKit;
  onPlayerPositionChange?: (
    playerId: string,
    coords: { x: number; y: number },
    role: PlayerRole,
    subPos: SubPosition,
    pesLabel: string
  ) => void;
  isCompactMobile?: boolean;
}

interface BoardCoord {
  x: number;
  y: number;
  label: string;
}

interface OverlapPromptState {
  playerId: string;
  playerName: string;
  coords: { x: number; y: number };
  candidates: PitchGridZone[];
  currentSubPos?: SubPosition;
  playerIntrinsicPlaystyle?: TeamRosterPlayer['intrinsicPlaystyle'];
}

function resolveInitialCustomPos(
  x: number,
  y: number,
  role: PlayerRole,
  preferredSubPos?: SubPosition
): { subPosition: SubPosition; pesLabel: string; role: PlayerRole } {
  if (role === 'GK' || (y >= GOALKEEPER_ZONE.minY && x >= GOALKEEPER_ZONE.minX && x <= GOALKEEPER_ZONE.maxX)) {
    return { subPosition: 'GK', pesLabel: 'GK', role: 'GK' };
  }
  const match = resolvePositionFromPitchGrid(x, y, preferredSubPos).primaryMatch;
  const resolved = resolveLegacyRoleFromSubPos(match.subPos, x);
  return { subPosition: match.subPos, pesLabel: resolved.pesLabel, role: resolved.role };
}

function getBadgeStyleForLabel(label?: string): string {
  if (!label) return 'bg-emerald-500 text-slate-950 font-black border-emerald-200 shadow-sm';
  if (label === 'GK') return 'bg-amber-400 text-slate-950 font-black border-amber-200 shadow-sm';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'LIB'].includes(label)) {
    return 'bg-sky-500 text-slate-950 font-black border-sky-200 shadow-sm';
  }
  if (['CDM', 'DMF', 'CM', 'CMF', 'CAM', 'AMF', 'LM', 'LMF', 'RM', 'RMF'].includes(label)) {
    return 'bg-emerald-500 text-slate-950 font-black border-emerald-200 shadow-sm';
  }
  return 'bg-rose-600 text-white font-black border-rose-300 shadow-sm';
}

function getOvrTextColor(ovr: number): string {
  if (ovr >= 95) return 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]';
  if (ovr >= 90) return 'text-amber-400';
  if (ovr >= 85) return 'text-emerald-400';
  if (ovr >= 75) return 'text-sky-300';
  return 'text-slate-200';
}

function getBenchOvrPillStyle(ovr: number): string {
  if (ovr >= 95) return 'text-amber-300 bg-amber-950/80 border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
  if (ovr >= 90) return 'text-amber-300 bg-amber-950/60 border-amber-500/50';
  if (ovr >= 85) return 'text-emerald-300 bg-emerald-950/60 border-emerald-500/50';
  if (ovr >= 75) return 'text-sky-300 bg-sky-950/60 border-sky-500/50';
  return 'text-slate-200 bg-slate-900 border-slate-700';
}

function hasPlayerStatBreak(player: TeamRosterPlayer): boolean {
  if (!player.canonicalStats) return false;
  return Object.values(player.canonicalStats).some((v) => typeof v === 'number' && v > 99);
}

export const TacticalPitchBoard: React.FC<TacticalPitchBoardProps> = ({
  team,
  side,
  selectedPlayerId,
  onSelectPlayer,
  formation,
  onChangeFormation,
  tacticalPlaystyle,
  captainId,
  activeKit,
  onPlayerPositionChange,
  isCompactMobile = false,
}) => {
  const pitchRef = useRef<HTMLDivElement | null>(null);
  const formationCoords = TACTICAL_BOARD_FORMATIONS[formation] || TACTICAL_BOARD_FORMATIONS['4-3-3'];

  const teamAvgOvr = useMemo(() => {
    if (!team?.players || team.players.length === 0) return team?.averageOvr || 80;
    const total = team.players.reduce((sum, p) => sum + (p ? calculatePlayerOvr(p.canonicalStats, p.role) : 75), 0);
    return Math.round(total / (team.players.length || 1));
  }, [team]);

  const substitutes = team?.substitutes || [];
  const [boardCoords, setBoardCoords] = useState<Record<string, BoardCoord>>({});
  const portraitCards = useMemo(() => {
    const kit = activeKit || team.kit;
    return new Map<string, PlayerCardData>([...(team?.players || []), ...substitutes].map((player) => [player.id, buildPortraitCard(player, team, kit)] as [string, PlayerCardData]));
  }, [team, team?.players, substitutes, activeKit?.primaryColor, activeKit?.secondaryColor]);

  useEffect(() => {
    const next: Record<string, BoardCoord> = {};
    const keys = Object.keys(formationCoords) as PlayerRole[];
    (team?.players || []).forEach((p, idx) => {
      if (p.customPos) {
        const res = resolveInitialCustomPos(p.customPos.x, p.customPos.y, p.role);
        next[p.id] = { x: p.customPos.x, y: p.customPos.y, label: res.pesLabel };
      } else if (formationCoords[p.role]) {
        next[p.id] = {
          x: formationCoords[p.role].x,
          y: formationCoords[p.role].y,
          label: formationCoords[p.role].label,
        };
      } else {
        const fallbackRole = keys[idx % keys.length];
        const fallback = formationCoords[fallbackRole];
        next[p.id] = {
          x: fallback?.x || 0.5,
          y: fallback?.y || 0.5,
          label: fallback?.label || p.role,
        };
      }
    });
    setBoardCoords(next);
  }, [formation, team.players, formationCoords]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const [overlapPrompt, setOverlapPrompt] = useState<OverlapPromptState | null>(null);

  const formationValidation = useMemo(
    () =>
      validateFormationStructure(
        (team?.players || []).map((p) => ({
          role: p.role,
          subPosition: p.subPosition,
          label: boardCoords[p.id]?.label || p.subPosition || p.role,
        }))
      ),
    [team?.players, boardCoords]
  );

  const handlePointerDown = (playerId: string, ev: React.PointerEvent<HTMLDivElement>) => {
    if (ev.button !== 0 && ev.pointerType === 'mouse') return;
    ev.stopPropagation();
    const player = team.players.find((p) => p.id === playerId);
    if (player) {
      onSelectPlayer(player, false);
      if (player.role === 'GK' || player.subPosition === 'GK') return;
    }
    ev.currentTarget.setPointerCapture(ev.pointerId);
    setDraggingId(playerId);
    isDraggingRef.current = true;
    setOverlapPrompt(null);
  };

  const handlePointerMove = (playerId: string, ev: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || draggingId !== playerId || !pitchRef.current) return;
    ev.preventDefault();
    const rect = pitchRef.current.getBoundingClientRect();
    const rx = (ev.clientX - rect.left) / rect.width;
    const ry = (ev.clientY - rect.top) / rect.height;
    const clamped = clampToOutfieldPitch(rx, ry);
    const player = team.players.find((p) => p.id === playerId);
    const resolved = resolvePositionFromPitchGrid(clamped.x, clamped.y, player?.subPosition);
    setBoardCoords((prev) => ({
      ...prev,
      [playerId]: { x: clamped.x, y: clamped.y, label: resolved.primaryMatch.pesLabel },
    }));
  };

  const handlePointerUp = (playerId: string, ev: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId !== playerId) return;
    isDraggingRef.current = false;
    setDraggingId(null);
    try {
      ev.currentTarget.releasePointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    const coord = boardCoords[playerId];
    if (!coord) return;
    const player = team.players.find((p) => p.id === playerId);
    if (!player) return;

    const resolved = resolvePositionFromPitchGrid(coord.x, coord.y, player.subPosition);
    if (resolved.isOverlap && resolved.candidates.length > 1) {
      audio.playKick(0.25);
      setOverlapPrompt({
        playerId: player.id,
        playerName: player.name,
        coords: { x: coord.x, y: coord.y },
        candidates: resolved.candidates,
        currentSubPos: player.subPosition,
        playerIntrinsicPlaystyle: player.intrinsicPlaystyle || player.playstyle,
      });
    } else {
      audio.playKick(0.35);
      const match = resolved.primaryMatch;
      const { role, pesLabel } = resolveLegacyRoleFromSubPos(match.subPos, coord.x);
      setBoardCoords((prev) => ({
        ...prev,
        [playerId]: { x: coord.x, y: coord.y, label: pesLabel },
      }));
      if (formation !== 'custom') onChangeFormation?.('custom');
      onPlayerPositionChange?.(playerId, { x: coord.x, y: coord.y }, role, match.subPos, pesLabel);
    }
  };

  const confirmOverlapChoice = (zone: PitchGridZone) => {
    if (!overlapPrompt) return;
    const { playerId, coords } = overlapPrompt;
    const { role, pesLabel } = resolveLegacyRoleFromSubPos(zone.subPos, coords.x);
    audio.playKick(0.4);
    if (formation !== 'custom') onChangeFormation?.('custom');
    setBoardCoords((prev) => ({
      ...prev,
      [playerId]: { x: coords.x, y: coords.y, label: pesLabel },
    }));
    onPlayerPositionChange?.(playerId, coords, role, zone.subPos, pesLabel);
    setOverlapPrompt(null);
  };

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && overlapPrompt) {
        confirmOverlapChoice(overlapPrompt.candidates[0]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [overlapPrompt]);

  return (
    <div className="flex flex-col h-full bg-slate-950/95 border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl relative select-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-2.5 sm:px-3 py-1 sm:py-1.5 border-b-2 border-slate-700/80 flex items-center justify-between gap-2 shrink-0 shadow-inner">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold shadow-md border border-white/30 shrink-0"
            style={{
              backgroundColor: team?.badge?.bg || '#1e293b',
              color: team?.badge?.primaryColor || '#f8fafc',
            }}
          >
            {team?.badge?.icon || team?.badge?.text || team?.shortName || 'FC'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase tracking-wider ${
                  side === 'home'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {side.toUpperCase()}
              </span>
              <span className="text-[10px] font-black font-mono text-amber-400 bg-amber-400/15 px-1.5 py-0.2 rounded border border-amber-500/40">
                ★ {teamAvgOvr} OVR
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-white truncate tracking-wide mt-0.5">
              {team?.name || 'TEAM'}
            </h3>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1 text-[8px] font-mono text-amber-400 font-bold uppercase">
            <Sparkles className="w-2.5 h-2.5" />
            <span>PHILOSOPHY</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-['Press_Start_2P'] text-emerald-400 tracking-tight mt-0.5 max-w-[150px] truncate">
            {(team?.tacticalPlaystyle || tacticalPlaystyle || 'possession').replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Split: Bench Sidebar + Tactical Pitch */}
      <div className="flex-1 flex flex-row overflow-hidden relative min-h-0">
        {/* Bench */}
        <div
          className={`w-28 sm:w-36 md:w-40 bg-slate-950/90 border-r-2 border-slate-800 p-1.5 sm:p-2 flex flex-col shrink-0 overflow-y-auto ${
            isCompactMobile ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1.5 shrink-0">
            <span className="font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              BENCH ({substitutes.length})
            </span>
            <span className="text-slate-500">OVR</span>
          </div>
          <div className="space-y-1 flex-1 overflow-y-auto pr-0.5">
            {substitutes.map((sub) => {
              const ovr = calculatePlayerOvr(sub.canonicalStats, sub.role);
              const isSelected = selectedPlayerId === sub.id;
              const isSB = hasPlayerStatBreak(sub);
              const posStyle = getBadgeStyleForLabel(sub.subPosition || sub.role);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSelectPlayer(sub, true)}
                  className={`w-full min-h-[44px] text-left p-1.5 rounded-lg border transition-all flex items-center justify-between gap-1 group cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.02]'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-600 shrink-0"><TacticalPlayerPortrait player={portraitCards.get(sub.id)!} size={28} hideTeam className="!rounded-full !border-0 !shadow-none" /></div>
                    <span
                      className={`px-1 py-0.2 rounded text-[7px] sm:text-[7.5px] font-mono font-black uppercase tracking-tighter shrink-0 border ${posStyle}`}
                    >
                      {sub.subPosition || sub.role}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[8.5px] sm:text-[9.5px] font-black text-slate-200 truncate group-hover:text-amber-300 tracking-tight">
                        {sub?.name ? sub.name.toUpperCase() : 'SUB'}
                      </div>
                      <div className="text-[7px] font-mono text-slate-400">#{sub?.number ?? 12}</div>
                    </div>
                    {isSB && <Zap className="w-2 h-2 text-amber-400 fill-amber-400 shrink-0 animate-pulse" />}
                  </div>
                  <span
                    className={`font-mono font-black text-[8.5px] sm:text-[9.5px] px-1 py-0.2 rounded shrink-0 border ${getBenchOvrPillStyle(
                      ovr
                    )}`}
                  >
                    ★{ovr}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pitch Board */}
        <div className="flex-1 min-h-0 relative bg-gradient-to-b from-[#0b3319] via-[#0d4220] to-[#0b3319] p-1 sm:p-2 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-25 pointer-events-none bg-[repeating-linear-gradient(0deg,#000,#000_28px,#fff_28px,#fff_56px)] mix-blend-overlay" />
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />

          <div
            ref={pitchRef}
            className="relative h-full max-h-full max-w-full aspect-[68/105] rounded-xl border-2 border-white/60 shadow-[0_0_20px_rgba(0,0,0,0.85)] overflow-hidden bg-[#105228]/95 flex flex-col justify-between select-none mx-auto"
          >
            {!formationValidation.isValid && (
              <div className="absolute top-1.5 left-1.5 right-1.5 z-40 bg-rose-950/95 border-2 border-rose-500 rounded-lg px-2 py-1 shadow-xl flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-['Press_Start_2P'] text-[6.5px] sm:text-[7.5px] text-rose-300 font-bold tracking-tight">
                    INVALID FORMATION
                  </div>
                  <div className="text-[7px] font-mono text-rose-200 truncate mt-0.5">{formationValidation.message}</div>
                </div>
              </div>
            )}

            {/* Pitch Markings */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[34%] h-[3.5%] bg-white/10 border-x-2 border-b-2 border-white/60 pointer-events-none z-0">
              <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_6px)]" />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] border-b-2 border-x-2 border-white/60 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[5.5%] border-b-2 border-x-2 border-white/60 pointer-events-none" />
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[22%] h-[5%] border-b-2 border-white/50 rounded-b-full pointer-events-none" />
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/90 pointer-events-none" />

            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/60 pointer-events-none -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26%] aspect-square rounded-full border-2 border-white/60 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/90 pointer-events-none" />

            <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[22%] h-[5%] border-t-2 border-white/50 rounded-t-full pointer-events-none" />
            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/90 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] border-t-2 border-x-2 border-white/60 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[5.5%] border-t-2 border-x-2 border-white/60 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[34%] h-[3.5%] bg-white/10 border-x-2 border-t-2 border-white/60 pointer-events-none z-0">
              <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_6px)]" />
            </div>

            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-r-2 border-b-2 border-white/70 rounded-br-full pointer-events-none" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-l-2 border-b-2 border-white/70 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-r-2 border-t-2 border-white/70 rounded-tr-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-l-2 border-t-2 border-white/70 rounded-tl-full pointer-events-none" />

            {/* Zone Guides while dragging */}
            {draggingId && (
              <>
                <div className="absolute top-[36%] left-0 right-0 border-b border-amber-400/40 border-dashed pointer-events-none z-10 flex items-center justify-between px-2">
                  <span className="text-[7.5px] font-mono font-bold text-amber-300/80 bg-slate-950/70 px-1 rounded">
                    ⚡ ATTACKER ZONE
                  </span>
                  <span className="text-[7.5px] font-mono font-bold text-emerald-300/80 bg-slate-950/70 px-1 rounded">
                    ⚙️ MIDFIELD ZONE
                  </span>
                </div>
                <div className="absolute top-[68%] left-0 right-0 border-b border-sky-400/40 border-dashed pointer-events-none z-10 flex items-center justify-between px-2">
                  <span className="text-[7.5px] font-mono font-bold text-emerald-300/80 bg-slate-950/70 px-1 rounded">
                    ⚙️ MIDFIELD ZONE
                  </span>
                  <span className="text-[7.5px] font-mono font-bold text-sky-300/80 bg-slate-950/70 px-1 rounded">
                    🛡️ DEFENDER ZONE
                  </span>
                </div>
              </>
            )}

            {/* GK Sanctuary Box */}
            <div
              style={{
                left: `${GOALKEEPER_ZONE.minX * 100}%`,
                top: `${GOALKEEPER_ZONE.minY * 100}%`,
                width: `${(GOALKEEPER_ZONE.maxX - GOALKEEPER_ZONE.minX) * 100}%`,
                height: `${(GOALKEEPER_ZONE.maxY - GOALKEEPER_ZONE.minY) * 100}%`,
              }}
              className="absolute border border-amber-400/50 border-dotted rounded bg-amber-400/5 pointer-events-none flex items-center justify-center z-10"
            >
              <span className="text-[6.5px] font-mono font-black text-amber-300/70 tracking-tighter uppercase px-1 py-0.2 bg-slate-950/60 rounded flex items-center gap-0.5">
                <Lock className="w-2 h-2" /> GK SANCTUARY
              </span>
            </div>

            {/* Draggable Players */}
            {(team?.players || []).map((p) => {
              const coord = boardCoords[p.id] || { x: 0.5, y: 0.5, label: p.role };
              const ovr = calculatePlayerOvr(p.canonicalStats, p.role);
              const isSelected = selectedPlayerId === p.id;
              const isDragging = draggingId === p.id;
              const isCaptain = p.id === captainId || p.isCaptain;
              const isSB = hasPlayerStatBreak(p);
              const isGk = p.role === 'GK' || p.subPosition === 'GK';
              const isBasic = p.playstyle === 'basic';
              const badgeStyle = getBadgeStyleForLabel(coord.label);

              return (
                <div
                  key={p.id}
                  style={{
                    left: `${coord.x * 100}%`,
                    top: `${coord.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    touchAction: isGk ? 'auto' : 'none',
                  }}
                  onPointerDown={(ev) => handlePointerDown(p.id, ev)}
                  onPointerMove={(ev) => handlePointerMove(p.id, ev)}
                  onPointerUp={(ev) => handlePointerUp(p.id, ev)}
                  onPointerCancel={(ev) => handlePointerUp(p.id, ev)}
                  className={`absolute transition-transform select-none ${
                    isGk
                      ? 'cursor-pointer z-30'
                      : isDragging
                      ? 'z-50 scale-115 cursor-grabbing'
                      : isSelected
                      ? 'z-40 scale-108 cursor-grab'
                      : 'z-20 hover:scale-105 cursor-grab'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-40 pointer-events-none">
                      <span className="text-xs text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,1)] font-black">▼</span>
                    </div>
                  )}
                  {isDragging && (
                    <div className="absolute -inset-2 rounded-xl border border-amber-400/80 border-dashed pointer-events-none animate-pulse" />
                  )}
                  <div
                    className={`relative flex flex-col items-center w-[44px] sm:w-[50px] md:w-[54px] rounded-lg border transition-all overflow-hidden ${
                      isDragging
                        ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.9)]'
                        : isSelected
                        ? 'bg-slate-950/50 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                        : isGk
                        ? 'bg-slate-950/45 backdrop-blur-[2px] border-amber-400/40 hover:border-amber-400 shadow-md'
                        : 'bg-slate-950/35 backdrop-blur-[2px] border-white/25 hover:border-amber-400/50 hover:bg-slate-950/50 shadow-md'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between gap-0.5 px-0.5 sm:px-1 py-0.2 bg-slate-950/40 border-b border-white/10">
                      <div className="flex items-center gap-0.5 min-w-0">
                        <span
                          className={`px-0.5 sm:px-1 py-0.2 rounded text-[6.5px] sm:text-[7.5px] font-mono font-black uppercase tracking-tighter shrink-0 border ${badgeStyle}`}
                        >
                          {coord.label}
                        </span>
                        {isGk && (
                          <span title="Fixed Goalkeeper" className="flex items-center">
                            <Lock className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-amber-400 shrink-0" />
                          </span>
                        )}
                        {isBasic && (
                          <span
                            className="px-0.5 py-0.2 bg-amber-500/20 text-amber-300 text-[5.5px] sm:text-[6.5px] font-mono font-bold rounded border border-amber-500/30"
                            title="Operating on baseline attributes without special playstyle modifiers"
                          >
                            BSC
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <span className={`font-mono font-black text-[7.5px] sm:text-[8.5px] tracking-tight ${getOvrTextColor(ovr)}`}>
                          ★{ovr}
                        </span>
                        {isSB && <Zap className="w-2 h-2 text-amber-400 fill-amber-400 shrink-0 animate-pulse" />}
                      </div>
                    </div>

                    <div className="py-0.5 px-0.5 flex items-center justify-center relative w-full">
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/50 shadow"><TacticalPlayerPortrait player={portraitCards.get(p.id)!} size={36} hideTeam className="!rounded-full !border-0 !shadow-none" /><span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[6px] font-mono text-white text-center leading-[9px]">#{p.number}</span></div>
                      {isCaptain && (
                        <span className="absolute top-0 right-0 px-0.5 py-0.2 bg-amber-400 text-slate-950 rounded text-[6px] font-black font-mono shadow-sm">
                          C
                        </span>
                      )}
                    </div>

                    <div className="w-full px-0.5 py-0.2 bg-slate-950/60 text-center border-t border-white/10">
                      <span className="text-[7px] sm:text-[8px] font-mono font-black text-white tracking-tight truncate block max-w-[40px] sm:max-w-[48px] mx-auto drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                        {p?.name ? p.name.toUpperCase() : 'PLAYER'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Overlap Role Choice Popover */}
            {overlapPrompt && (
              <div
                className="absolute inset-0 z-50 pointer-events-auto"
                onClick={() => confirmOverlapChoice(overlapPrompt.candidates[0])}
              >
                <div
                  style={{
                    left: `${Math.max(22, Math.min(78, overlapPrompt.coords.x * 100))}%`,
                    top: `${overlapPrompt.coords.y * 100}%`,
                    transform:
                      overlapPrompt.coords.y < 0.28
                        ? 'translate(-50%, 20px)'
                        : 'translate(-50%, calc(-100% - 20px))',
                  }}
                  onClick={(ev) => ev.stopPropagation()}
                  className="absolute w-[240px] sm:w-[270px] bg-slate-950/95 border-2 border-amber-400 rounded-xl p-2.5 shadow-[0_0_30px_rgba(0,0,0,0.95)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none z-50"
                >
                  <div className="flex items-center justify-between border-b border-amber-400/40 pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 rounded bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 text-xs shrink-0 font-bold">
                        ⚔️
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-['Press_Start_2P'] text-[8px] text-amber-300 truncate">CHOOSE ROLE</h4>
                        <div className="text-[7.5px] font-mono text-slate-400 truncate">
                          {overlapPrompt.playerName} · Overlap Zone
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => confirmOverlapChoice(overlapPrompt.candidates[0])}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {overlapPrompt.candidates.map((cand) => {
                      const candBadge = getBadgeStyleForLabel(cand.pesLabel);
                      const isCurrent = cand.subPos === overlapPrompt.currentSubPos;
                      const intrinsic = overlapPrompt.playerIntrinsicPlaystyle;
                      const activePlaystyle = intrinsic && isPlaystyleAllowedForSubPos(intrinsic, cand.subPos);
                      return (
                        <button
                          key={cand.subPos}
                          type="button"
                          onClick={() => confirmOverlapChoice(cand)}
                          className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 group cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-400/20 border-amber-400 shadow-md ring-1 ring-amber-400/60'
                              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 hover:border-amber-400/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider shrink-0 border ${candBadge}`}
                            >
                              {cand.pesLabel}
                            </span>
                            <div className="min-w-0">
                              <div className="text-[10px] font-black text-white group-hover:text-amber-300 flex items-center gap-1 truncate">
                                <span>{cand.icon}</span>
                                <span className="truncate">{cand.name}</span>
                              </div>
                              <div className="text-[7.5px] font-mono text-slate-400 truncate mt-0.5">
                                {activePlaystyle ? (
                                  <span className="text-emerald-400 font-bold">✓ Playstyle Active</span>
                                ) : (
                                  <span className="text-amber-400/90 flex items-center gap-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5 shrink-0" /> Reverts to Basic
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-slate-400 group-hover:text-amber-300">
                            <Check className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400' : 'opacity-0 group-hover:opacity-100'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 border-amber-400 rotate-45 ${
                      overlapPrompt.coords.y < 0.28 ? '-top-1.5 border-t-2 border-l-2' : '-bottom-1.5 border-b-2 border-r-2'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Formation Badge overlay */}
            <div className="absolute bottom-2 right-2 bg-slate-950/90 border border-slate-700/80 rounded-lg px-2 py-0.5 flex items-center gap-1.5 shadow-xl pointer-events-none z-10">
              <span
                className="w-2 h-2 rounded-full border border-white/60 shadow-sm"
                style={{ backgroundColor: activeKit?.primaryColor || team?.kit?.primaryColor || '#38bdf8' }}
              />
              <span className="font-['Press_Start_2P'] text-[8px] text-amber-300">{formation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900/90 border-t-2 border-slate-700/80 px-2.5 sm:px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onChangeFormation && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto min-w-0">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase shrink-0">SYSTEM:</span>
              <select
                value={formation}
                onChange={(ev) => onChangeFormation(ev.target.value as FormationName)}
                className="min-h-[44px] flex-1 sm:flex-none bg-slate-950 border border-slate-700 hover:border-amber-500/50 text-amber-400 font-['Press_Start_2P'] text-[10px] px-2.5 py-2 rounded-lg focus:outline-none transition-colors cursor-pointer"
              >
                {FORMATION_LIST.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id} ({f.tag})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="hidden sm:flex text-[10px] font-mono text-amber-300/90 items-center gap-1.5 font-bold">
          <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>DRAG PLAYERS TO REPOSITION & CHANGE ROLES</span>
        </div>
      </div>
    </div>
  );
};
