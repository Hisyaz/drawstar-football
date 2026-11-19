/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MatchScore, MatchPhase, Player, FootballMatchMode } from '../types';
import { TeamDefinition } from '../types/team';
import { HOME_KIT, AWAY_KIT } from '../game/constants';
import { Tv, Radio, Sparkles, Activity, Star, Trophy, Globe, Zap, Award } from 'lucide-react';
import { PlayerRatingsEngine } from '../game/playerRatings';
import { RoofCutawayMode, StadiumDefinition, isFifaWorldCertified } from '../types/stadium';

export type HudDisplayMode = 'solid' | 'transparent' | 'off';

export type ScoreboardIconKind = 'tv' | 'street' | 'youth' | 'cup' | 'u17';

export interface ScoreboardThemeConfig {
  id: string;
  label: string;
  rightStatusLabel: string;
  accentHex: string;
  secondaryHex: string;
  frameClass: string;
  frameTransparentClass: string;
  headerClass: string;
  headerTransparentClass: string;
  borderDividerClass: string;
  titleTextClass: string;
  scoreDigitBorderClass: string;
  scoreDigitTextClass: string;
  clockBgClass: string;
  clockTextClass: string;
  halfTextClass: string;
  rightWordmarkMain: string;
  rightWordmarkSub: string;
  iconKind: ScoreboardIconKind;
  showBroadcastLiveDot: boolean;
}

const YOUTH_LEAGUE_THEME_MAP: Record<string, ScoreboardThemeConfig> = {
  youth_buenos_aires: {
    id: 'youth_buenos_aires',
    label: 'LIGA METROPOLITANA BA',
    rightStatusLabel: 'SUB-17',
    accentHex: '#38bdf8',
    secondaryHex: '#facc15',
    frameClass: 'border-sky-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_12px_rgba(56,189,248,0.28)] bg-[#061829]',
    frameTransparentClass: 'border-sky-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#061829]/75 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#072b4a] via-[#0c3f6b] to-[#072b4a] border-sky-400/55',
    headerTransparentClass: 'bg-sky-950/60 border-sky-400/40',
    borderDividerClass: 'border-sky-400/55',
    titleTextClass: 'text-sky-300',
    scoreDigitBorderClass: 'border-yellow-400/55',
    scoreDigitTextClass: 'text-yellow-300',
    clockBgClass: 'bg-gradient-to-b from-[#071f36] to-[#040f1b]',
    clockTextClass: 'text-sky-300',
    halfTextClass: 'text-yellow-300',
    rightWordmarkMain: 'BA JUVENIL',
    rightWordmarkSub: 'TV',
    iconKind: 'youth',
    showBroadcastLiveDot: true,
  },
  youth_sao_paulo: {
    id: 'youth_sao_paulo',
    label: 'PAULISTA BASE U17',
    rightStatusLabel: 'BRASIL',
    accentHex: '#22c55e',
    secondaryHex: '#facc15',
    frameClass: 'border-emerald-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_12px_rgba(34,197,94,0.28)] bg-[#051d12]',
    frameTransparentClass: 'border-emerald-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#051d12]/75 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#07361f] via-[#0b5230] to-[#07361f] border-yellow-400/55',
    headerTransparentClass: 'bg-emerald-950/60 border-yellow-400/40',
    borderDividerClass: 'border-yellow-400/55',
    titleTextClass: 'text-yellow-300',
    scoreDigitBorderClass: 'border-emerald-400/60',
    scoreDigitTextClass: 'text-yellow-300',
    clockBgClass: 'bg-gradient-to-b from-[#062617] to-[#03130c]',
    clockTextClass: 'text-emerald-300',
    halfTextClass: 'text-yellow-300',
    rightWordmarkMain: 'PAULISTA',
    rightWordmarkSub: 'TV',
    iconKind: 'youth',
    showBroadcastLiveDot: true,
  },
  youth_madrid: {
    id: 'youth_madrid',
    label: 'CANTERA MADRIDISTA',
    rightStatusLabel: 'ESPAÑA',
    accentHex: '#f43f5e',
    secondaryHex: '#fbbf24',
    frameClass: 'border-rose-500/90 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_12px_rgba(244,63,94,0.28)] bg-[#1f0912]',
    frameTransparentClass: 'border-rose-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#1f0912]/75 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#3a0a1d] via-[#57102a] to-[#3a0a1d] border-amber-400/55',
    headerTransparentClass: 'bg-rose-950/60 border-amber-400/40',
    borderDividerClass: 'border-amber-400/55',
    titleTextClass: 'text-amber-300',
    scoreDigitBorderClass: 'border-rose-400/60',
    scoreDigitTextClass: 'text-amber-300',
    clockBgClass: 'bg-gradient-to-b from-[#290915] to-[#13040a]',
    clockTextClass: 'text-amber-300',
    halfTextClass: 'text-rose-300',
    rightWordmarkMain: 'CANTERA',
    rightWordmarkSub: 'TV',
    iconKind: 'youth',
    showBroadcastLiveDot: true,
  },
  youth_london: {
    id: 'youth_london',
    label: 'LONDON ACADEMY PREM',
    rightStatusLabel: 'UK U17',
    accentHex: '#22d3ee',
    secondaryHex: '#cbd5e1',
    frameClass: 'border-cyan-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_12px_rgba(34,211,238,0.25)] bg-[#0b1322]',
    frameTransparentClass: 'border-cyan-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#0b1322]/75 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#13213c] via-[#1c3259] to-[#13213c] border-cyan-400/55',
    headerTransparentClass: 'bg-slate-900/70 border-cyan-400/40',
    borderDividerClass: 'border-cyan-400/55',
    titleTextClass: 'text-cyan-300',
    scoreDigitBorderClass: 'border-cyan-400/55',
    scoreDigitTextClass: 'text-white',
    clockBgClass: 'bg-gradient-to-b from-[#0e1a30] to-[#060c18]',
    clockTextClass: 'text-cyan-300',
    halfTextClass: 'text-slate-200',
    rightWordmarkMain: 'ALBION',
    rightWordmarkSub: 'TV',
    iconKind: 'youth',
    showBroadcastLiveDot: true,
  },
  youth_paris: {
    id: 'youth_paris',
    label: 'ÎLE-DE-FRANCE ESPOIRS',
    rightStatusLabel: 'U17',
    accentHex: '#60a5fa',
    secondaryHex: '#fb7185',
    frameClass: 'border-blue-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_12px_rgba(96,165,250,0.28)] bg-[#0b152a]',
    frameTransparentClass: 'border-blue-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#0b152a]/75 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#132347] via-[#1e3a6e] to-[#4c1327] border-slate-200/50',
    headerTransparentClass: 'bg-blue-950/65 border-slate-200/35',
    borderDividerClass: 'border-blue-400/55',
    titleTextClass: 'text-slate-100',
    scoreDigitBorderClass: 'border-blue-300/55',
    scoreDigitTextClass: 'text-white',
    clockBgClass: 'bg-gradient-to-b from-[#0f1c38] to-[#060d1c]',
    clockTextClass: 'text-blue-300',
    halfTextClass: 'text-rose-300',
    rightWordmarkMain: 'ESPOIRS',
    rightWordmarkSub: 'TV',
    iconKind: 'youth',
    showBroadcastLiveDot: true,
  },
  youth_roma: {
    id: 'youth_roma',
    label: 'PRIMAVERA ROMA',
    rightStatusLabel: 'ITALIA',
    accentHex: '#b91c1c',
    secondaryHex: '#fbbf24',
    frameClass: 'border-amber-500/90 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_12px_rgba(185,28,28,0.32)] bg-[#23090d]',
    frameTransparentClass: 'border-amber-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#23090d]/75 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#450a14] via-[#6b111f] to-[#450a14] border-amber-400/60',
    headerTransparentClass: 'bg-red-950/65 border-amber-400/40',
    borderDividerClass: 'border-amber-400/60',
    titleTextClass: 'text-amber-300',
    scoreDigitBorderClass: 'border-amber-400/60',
    scoreDigitTextClass: 'text-amber-300',
    clockBgClass: 'bg-gradient-to-b from-[#2e0910] to-[#170408]',
    clockTextClass: 'text-amber-300',
    halfTextClass: 'text-rose-200',
    rightWordmarkMain: 'PRIMAVERA',
    rightWordmarkSub: 'TV',
    iconKind: 'youth',
    showBroadcastLiveDot: true,
  },
  youth_berlin: {
    id: 'youth_berlin',
    label: 'BERLIN JUGENDLIGA',
    rightStatusLabel: 'U17',
    accentHex: '#f59e0b',
    secondaryHex: '#94a3b8',
    frameClass: 'border-amber-500/85 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_10px_rgba(245,158,11,0.22)] bg-[#141619]',
    frameTransparentClass: 'border-amber-500/55 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#141619]/75 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#23262b] via-[#32363d] to-[#23262b] border-amber-500/55',
    headerTransparentClass: 'bg-zinc-900/70 border-amber-500/40',
    borderDividerClass: 'border-amber-500/55',
    titleTextClass: 'text-amber-400',
    scoreDigitBorderClass: 'border-zinc-400/55',
    scoreDigitTextClass: 'text-amber-300',
    clockBgClass: 'bg-gradient-to-b from-[#1b1e23] to-[#0e1012]',
    clockTextClass: 'text-amber-300',
    halfTextClass: 'text-zinc-200',
    rightWordmarkMain: 'JUGEND',
    rightWordmarkSub: 'TV',
    iconKind: 'youth',
    showBroadcastLiveDot: true,
  },
  youth_lisboa: {
    id: 'youth_lisboa',
    label: 'LIGA TEJO FORMAÇÃO',
    rightStatusLabel: 'PT U17',
    accentHex: '#14b8a6',
    secondaryHex: '#f8fafc',
    frameClass: 'border-teal-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_12px_rgba(20,184,166,0.28)] bg-[#061c1d]',
    frameTransparentClass: 'border-teal-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#061c1d]/75 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#0a3133] via-[#114e52] to-[#0a3133] border-teal-300/55',
    headerTransparentClass: 'bg-teal-950/65 border-teal-300/40',
    borderDividerClass: 'border-teal-400/55',
    titleTextClass: 'text-teal-200',
    scoreDigitBorderClass: 'border-white/50',
    scoreDigitTextClass: 'text-white',
    clockBgClass: 'bg-gradient-to-b from-[#082426] to-[#031213]',
    clockTextClass: 'text-teal-300',
    halfTextClass: 'text-white',
    rightWordmarkMain: 'TEJO BASE',
    rightWordmarkSub: 'TV',
    iconKind: 'youth',
    showBroadcastLiveDot: true,
  },
  youth_riyadh: {
    id: 'youth_riyadh',
    label: 'RIYADH FUTURE PRO',
    rightStatusLabel: 'KSA U17',
    accentHex: '#10b981',
    secondaryHex: '#fcd34d',
    frameClass: 'border-emerald-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_12px_rgba(16,185,129,0.28)] bg-[#071f17]',
    frameTransparentClass: 'border-emerald-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#071f17]/75 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#0b3b2b] via-[#125941] to-[#0b3b2b] border-amber-300/60',
    headerTransparentClass: 'bg-emerald-950/65 border-amber-300/40',
    borderDividerClass: 'border-amber-300/55',
    titleTextClass: 'text-amber-200',
    scoreDigitBorderClass: 'border-amber-300/60',
    scoreDigitTextClass: 'text-amber-300',
    clockBgClass: 'bg-gradient-to-b from-[#09291e] to-[#04140f]',
    clockTextClass: 'text-emerald-300',
    halfTextClass: 'text-amber-200',
    rightWordmarkMain: 'RIYADH',
    rightWordmarkSub: 'TV',
    iconKind: 'youth',
    showBroadcastLiveDot: true,
  },
};

export function getScoreboardTheme(
  scoreboardThemeId?: string,
  options?: { finalBoardCity?: string; finalBoardYear?: number }
): ScoreboardThemeConfig {
  const raw = (scoreboardThemeId || 'pro').trim().toLowerCase();
  const normalized = YOUTH_LEAGUE_THEME_MAP[`youth_${raw}`] ? `youth_${raw}` : raw;

  if (normalized === 'street') {
    return {
      id: 'street',
      label: 'STREET 7v7 • URBAN CAGE',
      rightStatusLabel: 'CAGE',
      accentHex: '#a3e635',
      secondaryHex: '#22d3ee',
      frameClass: 'border-lime-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.9),0_0_14px_rgba(163,230,53,0.3)] bg-[#141417]',
      frameTransparentClass: 'border-lime-400/65 shadow-[0_4px_16px_rgba(0,0,0,0.75)] bg-[#141417]/80 backdrop-blur-md',
      headerClass: 'bg-gradient-to-r from-[#1f2937] via-[#111827] to-[#18181b] border-lime-400/65',
      headerTransparentClass: 'bg-zinc-900/75 border-lime-400/45',
      borderDividerClass: 'border-lime-400/60',
      titleTextClass: 'text-lime-300',
      scoreDigitBorderClass: 'border-cyan-400/65',
      scoreDigitTextClass: 'text-lime-300',
      clockBgClass: 'bg-gradient-to-b from-[#18181b] to-[#09090b]',
      clockTextClass: 'text-cyan-300',
      halfTextClass: 'text-lime-300',
      rightWordmarkMain: 'DRAWSTAR',
      rightWordmarkSub: 'STREET',
      iconKind: 'street',
      showBroadcastLiveDot: false,
    };
  }

  if (YOUTH_LEAGUE_THEME_MAP[normalized]) {
    return YOUTH_LEAGUE_THEME_MAP[normalized];
  }

  if (normalized === 'intl_youth_cup' || normalized === 'intl_youth_cup_final') {
    const isFinal = normalized === 'intl_youth_cup_final';
    const cityStr = options?.finalBoardCity ? options.finalBoardCity.toUpperCase() : '';
    const yearStr = options?.finalBoardYear ? `${options.finalBoardYear}` : '';
    const finalSuffix = cityStr && yearStr ? `FINAL • ${cityStr} ${yearStr}` : isFinal ? 'FINAL' : 'KNOCKOUT';
    return {
      id: normalized,
      label: isFinal ? `INT'L YOUTH CUP • ${finalSuffix}` : "INT'L YOUTH CUP",
      rightStatusLabel: isFinal ? 'FINAL' : 'CUP',
      accentHex: '#fbbf24',
      secondaryHex: '#10b981',
      frameClass: 'border-amber-400/95 shadow-[0_8px_28px_rgba(0,0,0,0.9),0_0_16px_rgba(251,191,36,0.35)] bg-[#061f16]',
      frameTransparentClass: 'border-amber-400/70 shadow-[0_4px_16px_rgba(0,0,0,0.75)] bg-[#061f16]/80 backdrop-blur-md',
      headerClass: 'bg-gradient-to-r from-[#0b3827] via-[#13543b] to-[#0b3827] border-amber-400/70',
      headerTransparentClass: 'bg-emerald-950/70 border-amber-400/45',
      borderDividerClass: 'border-amber-400/70',
      titleTextClass: 'text-amber-300',
      scoreDigitBorderClass: 'border-amber-400/75',
      scoreDigitTextClass: 'text-amber-300',
      clockBgClass: 'bg-gradient-to-b from-[#07261b] to-[#03130d]',
      clockTextClass: 'text-emerald-300',
      halfTextClass: 'text-amber-300',
      rightWordmarkMain: 'YOUTH CUP',
      rightWordmarkSub: 'TV',
      iconKind: 'cup',
      showBroadcastLiveDot: true,
    };
  }

  if (normalized === 'u17_world_cup') {
    return {
      id: 'u17_world_cup',
      label: 'U17 WORLD CUP',
      rightStatusLabel: 'WORLD',
      accentHex: '#38bdf8',
      secondaryHex: '#facc15',
      frameClass: 'border-cyan-300/95 shadow-[0_8px_28px_rgba(0,0,0,0.9),0_0_16px_rgba(56,189,248,0.35)] bg-[#06172d]',
      frameTransparentClass: 'border-cyan-300/65 shadow-[0_4px_16px_rgba(0,0,0,0.75)] bg-[#06172d]/80 backdrop-blur-md',
      headerClass: 'bg-gradient-to-r from-[#0c2e59] via-[#144787] to-[#0c2e59] border-amber-300/65',
      headerTransparentClass: 'bg-sky-950/70 border-amber-300/45',
      borderDividerClass: 'border-cyan-300/65',
      titleTextClass: 'text-amber-300',
      scoreDigitBorderClass: 'border-cyan-300/70',
      scoreDigitTextClass: 'text-amber-300',
      clockBgClass: 'bg-gradient-to-b from-[#072142] to-[#031021]',
      clockTextClass: 'text-cyan-300',
      halfTextClass: 'text-amber-300',
      rightWordmarkMain: 'WORLD U17',
      rightWordmarkSub: 'TV',
      iconKind: 'u17',
      showBroadcastLiveDot: true,
    };
  }

  return {
    id: 'pro',
    label: 'MATCHDAY',
    rightStatusLabel: 'LIVE',
    accentHex: '#f59e0b',
    secondaryHex: '#34d399',
    frameClass: 'border-amber-500/90 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_12px_rgba(245,158,11,0.25)] bg-[#07131e]',
    frameTransparentClass: 'border-amber-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.7)] bg-[#07131e]/70 backdrop-blur-md',
    headerClass: 'bg-gradient-to-r from-[#0c2238] via-[#102a45] to-[#0c2238] border-amber-500/50',
    headerTransparentClass: 'bg-black/40 border-amber-500/40',
    borderDividerClass: 'border-amber-500/60',
    titleTextClass: 'text-amber-400',
    scoreDigitBorderClass: 'border-amber-500/40',
    scoreDigitTextClass: 'text-amber-400',
    clockBgClass: 'bg-gradient-to-b from-[#081524] to-[#040b12]',
    clockTextClass: 'text-emerald-400',
    halfTextClass: 'text-amber-300',
    rightWordmarkMain: 'DRAWSTAR',
    rightWordmarkSub: 'TV',
    iconKind: 'tv',
    showBroadcastLiveDot: true,
  };
}

interface MatchHUDProps {
  score: MatchScore;
  matchTimeSeconds: number;
  matchPhase: MatchPhase;
  bannerMessage: string | null;
  controlledPlayer?: Player;
  controlledPlayerRating?: number;
  scoreboardMode?: HudDisplayMode;
  specialActionTextMode?: HudDisplayMode;
  playerInfoMode?: HudDisplayMode;
  onOpenPreMatch?: () => void;
  onOpenPresentation?: () => void;
  onOpenGraphicsSettings?: () => void;
  homeTeam?: TeamDefinition;
  awayTeam?: TeamDefinition;
  stoppageTimeDisplay?: string | null;
  currentHalf?: number;
  currentPeriod?: string;
  roofCutaway?: RoofCutawayMode;
  onCycleRoofCutaway?: () => void;
  stadiumDef?: StadiumDefinition;
  isWorldTier?: boolean;
  displayedHalfMinutes?: number;
  scoreboardThemeId?: string;
  matchMode?: FootballMatchMode;
  finalBoardCity?: string;
  finalBoardYear?: number;
}

export const MatchHUD: React.FC<MatchHUDProps> = ({
  score,
  matchTimeSeconds,
  bannerMessage,
  controlledPlayer,
  controlledPlayerRating = 6.0,
  scoreboardMode = 'solid',
  specialActionTextMode = 'solid',
  playerInfoMode = 'solid',
  onOpenPreMatch,
  onOpenPresentation,
  onOpenGraphicsSettings,
  homeTeam,
  awayTeam,
  stoppageTimeDisplay,
  currentHalf = 1,
  currentPeriod = '1st_half',
  roofCutaway = 'partial',
  onCycleRoofCutaway,
  stadiumDef,
  isWorldTier,
  displayedHalfMinutes = 45,
  scoreboardThemeId,
  matchMode,
  finalBoardCity,
  finalBoardYear,
}) => {
  const isWorldStatus = isWorldTier || (stadiumDef && isFifaWorldCertified(stadiumDef));
  const resolvedThemeId = scoreboardThemeId || (matchMode === 'street' ? 'street' : 'pro');
  const theme = getScoreboardTheme(resolvedThemeId, { finalBoardCity, finalBoardYear });
  const isStreet = matchMode === 'street' || theme.id === 'street';
  const effectiveHalfLimit = displayedHalfMinutes || (isStreet ? 30 : 45);

  // Format match clock (e.g. 45:00, 35:00, 30:00)
  const minutes = Math.floor(matchTimeSeconds / 60);
  const seconds = Math.floor(matchTimeSeconds % 60);
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const halfText =
    currentPeriod === 'extra_time_1'
      ? 'ET 1'
      : currentPeriod === 'extra_time_2'
      ? 'ET 2'
      : currentPeriod === 'penalty_shootout'
      ? 'PENS'
      : currentHalf === 2 || minutes >= effectiveHalfLimit
      ? '2ND HALF'
      : '1ST HALF';

  const renderThemeIcon = () => {
    if (theme.iconKind === 'street') return <Zap className="w-2.5 h-2.5 text-lime-400 shrink-0" />;
    if (theme.iconKind === 'cup') return <Trophy className="w-2.5 h-2.5 text-amber-300 shrink-0" />;
    if (theme.iconKind === 'u17') return <Globe className="w-2.5 h-2.5 text-cyan-300 shrink-0" />;
    if (theme.iconKind === 'youth') return <Award className="w-2.5 h-2.5 text-amber-300 shrink-0" />;
    return <Tv className="w-2.5 h-2.5 text-amber-400 shrink-0" />;
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 sm:p-3.5 select-none z-20">
      {/* ======================================================== */}
      {/* 1. TOP ROW: MODE-SPECIFIC SCOREBOARD (LEFT) & BRANDING (RIGHT) */}
      {/* ======================================================== */}
      <div className="flex items-start justify-between w-full pointer-events-none">
        {scoreboardMode !== 'off' ? (
          <div
            className={`pointer-events-auto flex flex-col rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              scoreboardMode === 'solid' ? theme.frameClass : theme.frameTransparentClass
            }`}
          >
            {/* TOP MODE-SPECIFIC BROADCAST BUG / STREET HEADER */}
            <div
              className={`flex items-center justify-between gap-2 px-2.5 py-0.5 border-b ${
                scoreboardMode === 'solid' ? theme.headerClass : theme.headerTransparentClass
              }`}
            >
              <div className="flex items-center gap-1.5">
                {renderThemeIcon()}
                <span className={`font-['Press_Start_2P'] text-[6px] sm:text-[7px] font-bold tracking-wider uppercase ${theme.titleTextClass}`}>
                  {theme.label}
                </span>
                {isWorldStatus && !isStreet && (
                  <span className="px-1 py-0.2 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[5.5px] uppercase flex items-center gap-0.5 shadow-sm">
                    <span>★</span>
                    <span>WORLD TIER</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {theme.showBroadcastLiveDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_4px_#f43f5e]" />
                )}
                <span
                  className={`font-['Press_Start_2P'] text-[6px] font-bold tracking-tighter ${
                    isStreet ? 'text-cyan-300' : 'text-rose-400'
                  }`}
                >
                  {theme.rightStatusLabel}
                </span>
              </div>
            </div>

            {/* MAIN 32-BIT BEVELED SCOREBOARD DECK */}
            <div className="relative flex items-stretch">
              {/* CRT SCANLINE OVERLAY */}
              <div
                className="absolute inset-0 pointer-events-none opacity-15 z-10"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
                  backgroundSize: '100% 2px',
                }}
              />

              {/* HOME TEAM MODULE */}
              <div
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 border-r-2 ${theme.borderDividerClass} shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] ${
                  scoreboardMode === 'solid'
                    ? 'bg-gradient-to-b from-[#0e3c75] to-[#082348]'
                    : 'bg-blue-950/60'
                }`}
                style={homeTeam ? { backgroundColor: homeTeam.kit.primaryColor + 'cc' } : undefined}
              >
                {/* Home Team Badge */}
                <div className="relative flex items-center justify-center">
                  <span
                    className="w-4 h-4 rounded-full ring-1.5 ring-white/80 shadow-sm flex items-center justify-center text-[7px] font-black text-white font-['Press_Start_2P']"
                    style={{ backgroundColor: homeTeam?.badge?.bg || '#0055b8' }}
                  >
                    {homeTeam?.badge?.icon || homeTeam?.badge?.text || 'H'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] font-bold text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {homeTeam?.shortName || HOME_KIT.shortName}
                  </span>
                  <span className="text-[6px] text-blue-200 uppercase font-mono tracking-tighter hidden sm:inline truncate max-w-[65px]">
                    {homeTeam?.country || 'ALL-STARS'}
                  </span>
                </div>
                {/* Score Digit */}
                <div className={`ml-1 sm:ml-2 px-1.5 py-0.5 rounded bg-black/65 border ${theme.scoreDigitBorderClass} shadow-inner flex items-center justify-center min-w-[20px] sm:min-w-[24px]`}>
                  <span className={`font-['Press_Start_2P'] text-xs sm:text-sm font-black ${theme.scoreDigitTextClass} drop-shadow-[0_2px_0_rgba(0,0,0,1)]`}>
                    {score.home}
                  </span>
                </div>
              </div>

              {/* BROADCAST MATCH CLOCK & HALF PILLAR */}
              <div
                className={`flex flex-col items-center justify-center px-2.5 sm:px-3.5 py-1 border-r-2 ${theme.borderDividerClass} min-w-[68px] sm:min-w-[80px] ${
                  scoreboardMode === 'solid' ? theme.clockBgClass : 'bg-black/60'
                }`}
              >
                {/* Digital Clock Readout & Added Stoppage Time Badge */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {!isStreet && <Radio className={`w-2.5 h-2.5 ${theme.clockTextClass} animate-pulse hidden sm:inline`} />}
                  <span className={`font-['Press_Start_2P'] text-[10px] sm:text-[11px] font-black ${theme.clockTextClass} tracking-wider drop-shadow-[0_0_6px_rgba(52,211,153,0.45)]`}>
                    {timeFormatted}
                  </span>
                  {stoppageTimeDisplay && (
                    <span className="px-1 py-0.2 rounded bg-amber-500/25 border border-amber-400/90 font-['Press_Start_2P'] text-[6px] sm:text-[7px] font-black text-amber-300 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                      {stoppageTimeDisplay}
                    </span>
                  )}
                </div>
                {/* Period Indicator */}
                <span className={`font-['Press_Start_2P'] text-[6px] sm:text-[7px] font-bold ${theme.halfTextClass} tracking-wider mt-0.5`}>
                  {halfText}
                </span>
              </div>

              {/* AWAY TEAM MODULE */}
              <div
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] ${
                  scoreboardMode === 'solid'
                    ? 'bg-gradient-to-b from-[#7f1d1d] to-[#450a0a]'
                    : 'bg-red-950/60'
                }`}
                style={awayTeam ? { backgroundColor: awayTeam.kit.primaryColor + 'cc' } : undefined}
              >
                {/* Score Digit */}
                <div className={`mr-1 sm:mr-2 px-1.5 py-0.5 rounded bg-black/65 border ${theme.scoreDigitBorderClass} shadow-inner flex items-center justify-center min-w-[20px] sm:min-w-[24px]`}>
                  <span className={`font-['Press_Start_2P'] text-xs sm:text-sm font-black ${theme.scoreDigitTextClass} drop-shadow-[0_2px_0_rgba(0,0,0,1)]`}>
                    {score.away}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] font-bold text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {awayTeam?.shortName || AWAY_KIT.shortName}
                  </span>
                  <span className="text-[6px] text-red-200 uppercase font-mono tracking-tighter hidden sm:inline truncate max-w-[65px]">
                    {awayTeam?.country || 'LEGENDS'}
                  </span>
                </div>
                {/* Away Team Badge */}
                <div className="relative flex items-center justify-center">
                  <span
                    className="w-4 h-4 rounded-full ring-1.5 ring-white/80 shadow-sm flex items-center justify-center text-[7px] font-black text-white font-['Press_Start_2P']"
                    style={{ backgroundColor: awayTeam?.badge?.bg || '#991b1b' }}
                  >
                    {awayTeam?.badge?.icon || awayTeam?.badge?.text || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : <div />}

        {/* TOP RIGHT: MODE-AWARE BROADCAST WORDMARK & STADIUM ROOF CUTAWAY TOGGLER */}
        <div className="pointer-events-auto flex items-center gap-2 select-none pt-0.5 sm:pt-1 pr-1 sm:pr-2">
          {onCycleRoofCutaway && !isStreet && (
            <button
              onClick={onCycleRoofCutaway}
              className={`px-2 py-1 rounded border-2 text-[8px] sm:text-[9px] font-mono font-black tracking-wider flex items-center gap-1 sm:gap-1.5 shadow-md active:scale-95 transition-all select-none cursor-pointer ${
                roofCutaway === 'full'
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                  : roofCutaway === 'partial'
                  ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                  : 'bg-slate-950/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={`Roof Cutaway: ${
                roofCutaway === 'hidden'
                  ? 'Hidden (0% Canopy) — Unobstructed pitch view. Click for Edge-Only (50%)'
                  : roofCutaway === 'partial'
                  ? 'Edge-Only (50% Canopy) — Framing upper rows without blocking action. Click for Full (100%)'
                  : 'Full Canopy (100%) — Covered spectator bowl. Click to Hide (0%)'
              }`}
            >
              <span className="text-[10px]">🏛️</span>
              <span className="hidden sm:inline">ROOF:</span>
              <span className="font-bold uppercase">
                {roofCutaway === 'hidden' ? '0% [HIDE]' : roofCutaway === 'full' ? '100% [FULL]' : '50% [EDGE]'}
              </span>
            </button>
          )}
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            {/* 32-bit Star Icon */}
            <span
              className={`font-['Press_Start_2P'] text-[10px] sm:text-[13px] select-none animate-pulse ${
                isStreet ? 'text-lime-400' : 'text-amber-400'
              }`}
              style={{
                textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 3px 3px 0 rgba(0,0,0,0.9), 0 0 8px rgba(251,191,36,0.7)',
              }}
            >
              ★
            </span>
            {/* 32-bit Competition / Broadcast Wordmark */}
            <span
              className={`font-['Press_Start_2P'] text-[10px] sm:text-[13px] font-black italic tracking-wider sm:tracking-widest uppercase bg-clip-text text-transparent ${
                isStreet
                  ? 'bg-gradient-to-b from-lime-200 via-lime-400 to-emerald-500'
                  : 'bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500'
              }`}
              style={{
                filter: 'drop-shadow(2px 2px 0px #000000) drop-shadow(-1px -1px 0px #000000) drop-shadow(3px 3px 2px rgba(0,0,0,0.85))',
              }}
            >
              {theme.rightWordmarkMain}
            </span>
            <span
              className={`font-['Press_Start_2P'] text-[9px] sm:text-[11px] font-black italic tracking-tight uppercase bg-clip-text text-transparent ${
                isStreet
                  ? 'bg-gradient-to-b from-cyan-300 via-cyan-400 to-sky-500'
                  : 'bg-gradient-to-b from-rose-400 via-red-500 to-rose-600'
              }`}
              style={{
                filter: 'drop-shadow(2px 2px 0px #000000) drop-shadow(-1px -1px 0px #000000) drop-shadow(3px 3px 2px rgba(0,0,0,0.85))',
              }}
            >
              {theme.rightWordmarkSub}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BOTTOM LEFT: SPECIAL ACTION TEXT & CONTROLLED PLAYER INFO */}
      {/* Anchored cleanly ABOVE the bottom arcade controller deck */}
      {/* ======================================================== */}
      <div className="absolute bottom-[160px] sm:bottom-[175px] md:bottom-[180px] left-2.5 sm:left-4 pointer-events-auto flex flex-col items-start gap-1.5 max-w-[280px] sm:max-w-sm z-20 select-none">
        {/* TOP ITEM: SPECIAL ACTION NOTIFICATION BANNER (NUTMEG, BULLET SHOT, ETC.) */}
        {bannerMessage && specialActionTextMode !== 'off' && (
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 animate-in fade-in duration-150 transition-all ${
              specialActionTextMode === 'solid'
                ? 'bg-gradient-to-r from-[#0c2238] via-[#163554] to-[#0c2238] border-amber-400 text-amber-300 shadow-[0_4px_16px_rgba(0,0,0,0.9),0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-[#07131e]/75 backdrop-blur-sm border-amber-400/80 text-amber-300 shadow-[0_4px_12px_rgba(0,0,0,0.7)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-['Press_Start_2P'] text-[8px] sm:text-[9px] font-bold tracking-tight leading-relaxed whitespace-pre-line drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {bannerMessage}
            </span>
          </div>
        )}

        {/* BOTTOM ITEM: CONTROLLED PLAYER CARD (NAME, NUMBER, STAMINA) */}
        {controlledPlayer && playerInfoMode !== 'off' && (
          <div
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${
              playerInfoMode === 'solid'
                ? 'bg-[#07131e] border-amber-500/80 shadow-[0_4px_16px_rgba(0,0,0,0.85)]'
                : 'bg-[#07131e]/75 backdrop-blur-sm border-amber-500/60 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
            }`}
          >
            {/* SHIRT NUMBER BADGE */}
            <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <span className="font-['Press_Start_2P'] text-[9px] font-black text-amber-300">
                #{controlledPlayer.number}
              </span>
            </div>

            {/* PLAYER NAME & ROLE */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-['Press_Start_2P'] text-[8px] sm:text-[9px] font-bold text-white tracking-wider">
                  {controlledPlayer.name.toUpperCase()}
                </span>
                {controlledPlayer.primaryPos && (
                  <span
                    className={`text-[7px] font-mono font-bold px-1 rounded border ${
                      controlledPlayer.primaryPos === 'ATT'
                        ? 'bg-rose-950/90 text-rose-300 border-rose-600/60'
                        : controlledPlayer.primaryPos === 'MID'
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/60'
                        : controlledPlayer.primaryPos === 'DEF'
                        ? 'bg-sky-950/90 text-sky-300 border-sky-600/60'
                        : 'bg-amber-950/90 text-amber-300 border-amber-600/60'
                    }`}
                  >
                    {controlledPlayer.primaryPos}
                  </span>
                )}
                <span className="text-[7px] font-mono font-bold px-1 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  {controlledPlayer.subPos || controlledPlayer.role}
                </span>
                {controlledPlayer.playstyleName && (
                  <span className="text-[7px] font-mono font-bold px-1 rounded bg-amber-950/80 text-amber-300 border border-amber-600/50">
                    {controlledPlayer.playstyleName.toUpperCase()}
                  </span>
                )}
                {/* LIVE SOFASCORE RATING BADGE */}
                <div
                  className={`text-[7px] font-mono font-bold px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${
                    PlayerRatingsEngine.getRatingBadgeClasses(controlledPlayerRating).badgeBg
                  } ${PlayerRatingsEngine.getRatingBadgeClasses(controlledPlayerRating).border} ${
                    PlayerRatingsEngine.getRatingBadgeClasses(controlledPlayerRating).text
                  }`}
                >
                  <Star className="w-2.5 h-2.5 fill-current shrink-0 text-amber-400" />
                  <span>{controlledPlayerRating.toFixed(1)}</span>
                </div>
              </div>

              {/* MINI STAMINA METER */}
              <div className="flex items-center gap-1 mt-1">
                <Activity className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <div className="w-20 sm:w-24 h-1.5 rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${Math.max(5, Math.min(100, controlledPlayer.stamina))}%`,
                      backgroundColor:
                        controlledPlayer.stamina > 50
                          ? '#10b981'
                          : controlledPlayer.stamina > 25
                          ? '#facc15'
                          : '#ef4444',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM RIGHT: LIVE PLAYER RATING FLOATING BADGE        */}
      {/* Anchored cleanly ABOVE the bottom arcade button deck      */}
      {/* ======================================================== */}
      {controlledPlayer && playerInfoMode !== 'off' && (
        <div className="absolute bottom-[160px] sm:bottom-[175px] md:bottom-[180px] right-2.5 sm:right-4 pointer-events-auto flex items-center gap-1.5 z-20 select-none animate-in fade-in duration-200">
          <div
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.85)] font-mono transition-all duration-300 ${
              PlayerRatingsEngine.getRatingBadgeClasses(controlledPlayerRating).badgeBg
            } ${PlayerRatingsEngine.getRatingBadgeClasses(controlledPlayerRating).border} ${
              PlayerRatingsEngine.getRatingBadgeClasses(controlledPlayerRating).glow
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current shrink-0 text-amber-400 animate-pulse" />
            <div className="flex flex-col items-end">
              <span className="font-['Press_Start_2P'] text-[6px] text-slate-300 uppercase tracking-tighter">
                RATING
              </span>
              <span
                className={`font-['Press_Start_2P'] text-[9px] sm:text-[10px] ${
                  PlayerRatingsEngine.getRatingBadgeClasses(controlledPlayerRating).text
                } tracking-tight`}
              >
                {controlledPlayerRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
