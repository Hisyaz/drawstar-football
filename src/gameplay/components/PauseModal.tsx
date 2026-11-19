import React, { useState } from 'react';
import {
  Clock,
  Gamepad2,
  Languages,
  Play,
  RotateCcw,
  Settings,
  Users,
  Volume2,
  VolumeX,
  Home,
} from 'lucide-react';
import { audio } from '../game/audio';
import { Language } from '../game/i18n';
import {
  ControlMode,
  CrowdLevel,
  DifficultyLevel,
  FootballMatchMode,
  GoalFrameType,
  GraphicsSettings,
  NetTension,
  Player,
  PlayerIndicatorStyle,
  PlayerIndicatorType,
  Season,
  SeatColorMode,
  StadiumTier,
  TimeOfDay,
  TurfQuality,
  WeatherCondition,
  GrassLength,
} from '../types';
import { HudDisplayMode } from './MatchHUD';
import { MinimapMode, RadarZoom } from './RadarMinimap';
import { ControllerBgMode, ControllerTheme } from './ArcadeConsole';
import { ConsoleModalShell } from '../../components/common/ConsolePager';

export interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onResetKickoff: () => void;
  onOpenGamePlan?: () => void;
  onOpenSettings?: () => void;
  onOpenSideSelect?: () => void;
  onOpenPreMatch?: () => void;
  onOpenPresentation?: () => void;
  onOpenControllerSettings?: () => void;
  onOpenDetailedSettings?: () => void;
  onOpenGraphicsSettings?: () => void;
  onOpenMainMenu?: () => void;
  homeScore: number;
  awayScore: number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamBadge?: string;
  awayTeamBadge?: string;
  matchTimeSeconds?: number;
  displayedHalfMinutes?: number;
  currentHalf?: 1 | 2;
  currentPeriod?: string;
  difficulty?: DifficultyLevel;
  onChangeDifficulty?: (d: DifficultyLevel) => void;
  gameSpeed?: number;
  onChangeGameSpeed?: (s: number) => void;
  powerBarSpeed?: number;
  onChangePowerBarSpeed?: (s: number) => void;
  minimapMode?: MinimapMode;
  onChangeMinimapMode?: (m: MinimapMode) => void;
  minimapSonar?: boolean;
  onChangeMinimapSonar?: (b: boolean) => void;
  radarZoom?: RadarZoom;
  onChangeRadarZoom?: (z: RadarZoom) => void;
  scoreboardMode?: HudDisplayMode;
  onChangeScoreboardMode?: (m: HudDisplayMode) => void;
  specialActionTextMode?: HudDisplayMode;
  onChangeSpecialActionTextMode?: (m: HudDisplayMode) => void;
  playerInfoMode?: HudDisplayMode;
  onChangePlayerInfoMode?: (m: HudDisplayMode) => void;
  controllerBgMode?: ControllerBgMode;
  onChangeControllerBgMode?: (m: ControllerBgMode) => void;
  controllerTheme?: ControllerTheme;
  onChangeControllerTheme?: (t: ControllerTheme) => void;
  playerIndicatorType?: PlayerIndicatorType;
  onChangePlayerIndicatorType?: (t: PlayerIndicatorType) => void;
  playerIndicatorStyle?: PlayerIndicatorStyle;
  onChangePlayerIndicatorStyle?: (s: PlayerIndicatorStyle) => void;
  controlMode?: ControlMode;
  onChangeControlMode?: (m: ControlMode) => void;
  graphicsSettings?: GraphicsSettings;
  isGamepadConnected?: boolean;
  gamepadName?: string;
  homePlayers?: Player[];
  lockedPlayerId?: string | null;
  onSelectLockedPlayer?: (id: string) => void;
  stadiumTier?: StadiumTier;
  onChangeStadiumTier?: (t: StadiumTier) => void;
  timeOfDay?: TimeOfDay;
  onChangeTimeOfDay?: (t: TimeOfDay) => void;
  seatColor?: SeatColorMode;
  onChangeSeatColor?: (c: SeatColorMode) => void;
  turfQuality?: TurfQuality;
  onChangeTurfQuality?: (q: TurfQuality) => void;
  grassLength?: GrassLength;
  onChangeGrassLength?: (l: GrassLength) => void;
  weather?: WeatherCondition;
  onChangeWeather?: (w: WeatherCondition) => void;
  season?: Season;
  onChangeSeason?: (s: Season) => void;
  netTension?: NetTension;
  onChangeNetTension?: (n: NetTension) => void;
  goalFrame?: GoalFrameType;
  onChangeGoalFrame?: (g: GoalFrameType) => void;
  crowdLevel?: CrowdLevel;
  currentLang?: Language;
  onToggleLanguage?: () => void;
  isHalfTime?: boolean;
  isExtraTimeHalf?: boolean;
  onStartSecondHalf?: () => void;
  onStartETSecondHalf?: () => void;
  stoppageTimeMinutes?: number;
  matchMode?: FootballMatchMode;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onResetKickoff,
  onOpenGamePlan,
  onOpenSettings,
  onOpenSideSelect,
  onOpenDetailedSettings,
  onOpenGraphicsSettings,
  onOpenMainMenu,
  homeScore,
  awayScore,
  homeTeamName = 'HOME',
  awayTeamName = 'AWAY',
  homeTeamBadge = '🛡️',
  awayTeamBadge = '⚔️',
  matchTimeSeconds = 0,
  displayedHalfMinutes = 45,
  currentHalf = 1,
  difficulty = 'easy',
  currentLang = 'en',
  onToggleLanguage,
  isHalfTime = false,
  isExtraTimeHalf = false,
  onStartSecondHalf,
  onStartETSecondHalf,
  stoppageTimeMinutes,
  matchMode = 'pro',
}) => {
  const [isMuted, setIsMuted] = useState(audio.getMuted());
  const isStreetMode = matchMode === 'street';

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const nextMuted = audio.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleResume = () => {
    audio.playKick(0.3);
    onResume();
  };

  const handleOpenGamePlan = () => {
    audio.playKick(0.3);
    onOpenGamePlan?.();
  };

  const handleOpenSettings = () => {
    audio.playKick(0.3);
    if (onOpenSettings) onOpenSettings();
    else if (onOpenDetailedSettings) onOpenDetailedSettings();
    else onOpenGraphicsSettings?.();
  };

  const mins = Math.floor(matchTimeSeconds / 60);
  const secs = Math.floor(matchTimeSeconds % 60);
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const fullRegularHalfStr = `${String(displayedHalfMinutes).padStart(2, '0')}:00`;
  const timeSubtitle = isHalfTime
    ? `1st Half Finished · ${fullRegularHalfStr} ${stoppageTimeMinutes ? `(+${stoppageTimeMinutes}')` : ''}`
    : isExtraTimeHalf
    ? 'ET 1st Half · 105:00'
    : `Half ${currentHalf} · ${formattedTime}`;

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={isHalfTime || isExtraTimeHalf ? undefined : handleResume}
      showCloseButton={!isHalfTime && !isExtraTimeHalf}
      title={isHalfTime ? 'HALF TIME' : isExtraTimeHalf ? 'EXTRA TIME HALF' : 'MATCH PAUSED'}
      subtitle={timeSubtitle}
      icon={<Clock className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-xl"
      bodyClassName="flex flex-col justify-between bg-slate-900/95"
      footer={
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              audio.playKick(0.2);
              onResetKickoff();
              onResume();
            }}
            className="min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700 transition-colors text-xs font-mono font-bold cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART KICKOFF</span>
          </button>

          <div className="flex items-center gap-2">
            {onToggleLanguage && (
              <button
                type="button"
                onClick={() => {
                  audio.playKick(0.2);
                  onToggleLanguage();
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono cursor-pointer active:scale-95"
              >
                <Languages className="w-4 h-4" />
                <span className="uppercase font-bold">{currentLang}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleMute}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer active:scale-95"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      }
    >
      {/* Scoreboard Strip */}
      <div className="p-3.5 sm:p-5 bg-gradient-to-b from-slate-950/90 to-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 text-center min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-xl bg-sky-500/20 border border-sky-400/60 flex items-center justify-center text-2xl shadow-lg mb-1.5">
              {homeTeamBadge}
            </div>
            <div className="font-arcade text-xs text-white truncate font-bold">
              {homeTeamName}
            </div>
            <div className="text-[11px] font-mono text-sky-400 font-bold uppercase mt-0.5">HOME</div>
          </div>

          <div className="shrink-0 flex flex-col items-center px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl shadow-inner">
            <div className="font-arcade text-2xl sm:text-3xl text-amber-400 tracking-tight tabular-nums">
              {homeScore} - {awayScore}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase font-bold">
              {isHalfTime ? 'BREAK' : `${isStreetMode ? 'STREET 7v7' : matchMode === 'youth' ? 'YOUTH' : 'PRO'} · ${displayedHalfMinutes}m HALF`}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              {difficulty === 'easy' ? 'COMPETITIVE' : difficulty.toUpperCase()}
            </div>
          </div>

          <div className="flex-1 text-center min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-xl bg-rose-500/20 border border-rose-400/60 flex items-center justify-center text-2xl shadow-lg mb-1.5">
              {awayTeamBadge}
            </div>
            <div className="font-arcade text-xs text-white truncate font-bold">
              {awayTeamName}
            </div>
            <div className="text-[11px] font-mono text-rose-400 font-bold uppercase mt-0.5">AWAY</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3.5 sm:p-5 space-y-2.5 flex-1 flex flex-col justify-center">
        {isHalfTime ? (
          <button
            type="button"
            onClick={() => {
              audio.playKick(0.3);
              if (onStartSecondHalf) onStartSecondHalf();
              else onResume();
            }}
            className="w-full min-h-[54px] py-3 px-4 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-arcade text-xs sm:text-sm font-black shadow-lg transition-all active:scale-98 flex flex-col items-center justify-center gap-1 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 fill-slate-950" />
              <span>START 2ND HALF</span>
            </div>
            <span className="text-[11px] font-sans font-bold text-slate-900 tracking-normal">
              Teams switch ends · Home team kicks off
            </span>
          </button>
        ) : isExtraTimeHalf ? (
          <button
            type="button"
            onClick={() => {
              audio.playKick(0.3);
              if (onStartETSecondHalf) onStartETSecondHalf();
              else onResume();
            }}
            className="w-full min-h-[54px] py-3 px-4 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-arcade text-xs sm:text-sm font-black shadow-lg transition-all active:scale-98 flex flex-col items-center justify-center gap-1 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 fill-slate-950" />
              <span>START ET 2ND HALF</span>
            </div>
            <span className="text-[11px] font-sans font-bold text-slate-900 tracking-normal">
              Teams switch ends · Home kicks off
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResume}
            className="w-full min-h-[52px] py-3 px-4 rounded-xl border-2 border-emerald-400/80 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-arcade text-sm font-black shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>RESUME MATCH</span>
          </button>
        )}

        {!isStreetMode ? (
          <button
            type="button"
            onClick={handleOpenGamePlan}
            className="w-full min-h-[48px] py-2.5 px-4 rounded-xl border-2 border-amber-400/80 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 hover:text-white font-arcade text-xs font-bold shadow transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span>TACTICAL GAME PLAN</span>
          </button>
        ) : (
          <div className="w-full min-h-[44px] py-2 px-4 rounded-xl border border-lime-500/40 bg-lime-950/30 text-lime-300 font-mono text-xs font-bold flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-lime-400 shrink-0" />
            <span>STREET 7v7 · 1-2-2-2 FIXED SHAPE</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            audio.playKick(0.3);
            onOpenSideSelect?.();
          }}
          className="w-full min-h-[48px] py-2.5 px-4 rounded-xl border-2 border-sky-400/80 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 hover:text-white font-arcade text-xs font-bold shadow transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Gamepad2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>SELECT SIDE</span>
        </button>

        <button
          type="button"
          onClick={handleOpenSettings}
          className="w-full min-h-[48px] py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-950/90 hover:bg-slate-800 text-slate-100 font-arcade text-xs font-bold shadow transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-sky-400 shrink-0" />
          <span>SYSTEM SETTINGS</span>
        </button>

        {onOpenMainMenu && (
          <button
            type="button"
            onClick={() => {
              audio.playKick(0.3);
              onOpenMainMenu();
            }}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-800 hover:border-amber-400/80 bg-slate-950/90 hover:bg-slate-900 text-slate-300 hover:text-amber-300 font-arcade text-xs font-bold shadow transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-amber-400 shrink-0" />
            <span>MAIN MENU</span>
          </button>
        )}
      </div>
    </ConsoleModalShell>
  );
};

