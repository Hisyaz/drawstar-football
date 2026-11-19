import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MatchEngine } from '../gameplay/game/engine';
import {
  KeyState,
  DifficultyLevel,
  PlayerIndicatorType,
  PlayerIndicatorStyle,
  PreMatchConfig,
  ControlMode,
  ControllerCustomization,
  CustomKeyBindings,
  GamepadBindings,
  GraphicsSettings,
  HalfDurationMinutes,
  PlayerSlotConfig,
  ControlScope,
  CursorSwitchMode,
  FootballMatchMode,
  MatchModeCompetitionTag,
  DEFAULT_KEY_BINDINGS_1P,
  DEFAULT_KEY_BINDINGS_WASD,
  DEFAULT_KEY_BINDINGS_2P,
  DEFAULT_KEY_BINDINGS_3P,
  DEFAULT_KEY_BINDINGS_4P,
} from '../gameplay/types';
import { PitchCanvas } from '../gameplay/components/PitchCanvas';
import { SetPieceOverlay } from '../gameplay/components/SetPieceOverlay';
import { MatchHUD, HudDisplayMode } from '../gameplay/components/MatchHUD';
import { PauseModal } from '../gameplay/components/PauseModal';
import { EndGameModal } from '../gameplay/components/EndGameModal';
import { PreMatchModal } from '../gameplay/components/PreMatchModal';
import { PreMatchPresentationModal } from '../gameplay/components/PreMatchPresentationModal';
import {
  TeamSelectorModal,
  TeamSelectorBrowseMode,
  TeamSelectorYouthBundle,
} from '../gameplay/components/TeamSelectorModal';
import { DeviceProfilerModal } from '../gameplay/components/DeviceProfilerModal';
import { SideSelectModal } from '../gameplay/components/SideSelectModal';
import { TacticalGamePlanModal, GamePlanPayload } from '../gameplay/components/TacticalGamePlanModal';
import { StadiumSelectorModal, StadiumConfig } from '../gameplay/components/StadiumSelectorModal';
import { StadiumCreatorModal } from '../gameplay/components/StadiumCreatorModal';
import { TeamEditorModal } from '../gameplay/components/TeamEditorModal';
import { UnifiedSettingsModal } from '../gameplay/components/UnifiedSettingsModal';
import { ControllerSettingsModal } from '../gameplay/components/ControllerSettingsModal';
import { GraphicsSettingsModal } from '../gameplay/components/GraphicsSettingsModal';
import { RetroFilterOverlay } from '../gameplay/components/RetroFilterOverlay';
import { ArcadeConsole, ActionModifier, ControllerBgMode, ControllerTheme } from '../gameplay/components/ArcadeConsole';
import { RadarMinimap, MinimapMode, RadarZoom } from '../gameplay/components/RadarMinimap';
import { TeamDefinition } from '../gameplay/types/team';
import { StadiumDefinition, RoofCutawayMode } from '../gameplay/types/stadium';
import { getStadiumById } from '../gameplay/game/stadiumRegistry';
import { registerDrawStarExternalTeams, registerRuntimeMatchTeams } from '../gameplay/game/teamDatabase';
import { getLanguage, setLanguage, Language } from '../gameplay/game/i18n';
import { loadGraphicsSettings, saveGraphicsSettings } from '../gameplay/game/graphicsConfig';
import {
  loadControllerCustomization,
  saveControllerCustomization,
  loadKeyBindings,
  saveKeyBindings,
  loadGamepadBindings,
  saveGamepadBindings,
  loadControlMode,
  saveControlMode,
  loadAssistModes,
  saveAssistModes,
  loadDebugExecutionOverlay,
  saveDebugExecutionOverlay,
} from '../gameplay/game/controllerConfig';
import { audio } from '../gameplay/game/audio';
import { LeagueDatabase } from '../types/leagueEditor';
import type { ResolvedCompetitionVenue } from '../utils/competitionVenueSystem';
import { NationalTeam } from '../types/nationalTeam';
import {
  buildAllDrawStarGameplayTeams,
  buildStreetGameplayTeams,
  StreetGameplayMatchBundle,
} from '../utils/gameplayAdapter';
import { StreetCaptainDrawModal } from '../gameplay/components/StreetCaptainDrawModal';
import { suspendGameNavForGameplay } from '../utils/gameNavigation';
import { ConsoleModalShell } from './common/ConsolePager';
import { YOUTH_LEAGUES_DATABASE } from '../data/youthLeaguesDatabase';
import { Trophy, Sparkles, Flame, ArrowLeft, MapPin } from 'lucide-react';

function createEmptyKeyState(): KeyState {
  return {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Shift: false,
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    KeyQ: false,
    KeyE: false,
    Space: false,
  };
}

function updateSlotKeyboardInput(
  slot: PlayerSlotConfig,
  code: string,
  isDown: boolean,
  slotKeys: Record<number, KeyState>
) {
  const sk = slotKeys[slot.id];
  if (!sk) return;
  const b =
    slot.keyBindings ||
    (slot.id === 2
      ? DEFAULT_KEY_BINDINGS_2P
      : slot.id === 3
      ? DEFAULT_KEY_BINDINGS_3P
      : DEFAULT_KEY_BINDINGS_4P);

  if (code === b.moveUp) sk.ArrowUp = isDown;
  else if (code === b.moveDown) sk.ArrowDown = isDown;
  else if (code === b.moveLeft) sk.ArrowLeft = isDown;
  else if (code === b.moveRight) sk.ArrowRight = isDown;
  else if (code === b.sprint) sk.Shift = isDown;
  else if (code === b.gingaSwitch) sk.Space = isDown;
  else if (code === b.skillQ) sk.KeyQ = isDown;
  else if (code === b.skillE) sk.KeyE = isDown;
  else if (code === b.shortPass) sk.KeyS = isDown;
  else if (code === b.shoot) sk.KeyA = isDown;
  else if (code === b.longPass) sk.KeyW = isDown;
  else if (code === b.cross) sk.KeyD = isDown;
}

export interface GameplayGoalScorerInfo {
  playerName: string;
  team: 'home' | 'away';
  minute: number;
  assistPlayerName?: string;
  isOwnGoal?: boolean;
  isPenalty?: boolean;
}

export interface GameplayAssistProviderInfo {
  playerName: string;
  team: 'home' | 'away';
  assists: number;
}

export interface GameplayMatchResult {
  homeScore: number;
  awayScore: number;
  userGoals: number;
  userAssists: number;
  userRating: number;
  isUserHome: boolean;
  mvpName?: string;
  mvpRating?: number;
  goalScorers?: GameplayGoalScorerInfo[];
  assistProviders?: GameplayAssistProviderInfo[];
  userInjured?: boolean;
  userInjuryRiskPct?: number;
  lockedUserRating?: number | null;
  matchMode?: FootballMatchMode;
  displayedHalfMinutes?: number;
  scoreboardThemeId?: string;
}

export interface GameplayModeShellProps {
  isOpen: boolean;
  mode: 'kick_off' | 'career_pro_match';
  initialMatchMode?: 'pro' | 'youth' | 'street';
  initialStreetCityId?: string;
  leagueDb?: LeagueDatabase;
  nationalTeams?: NationalTeam[];
  careerSetup?: {
    homeTeam: TeamDefinition;
    awayTeam: TeamDefinition;
    lockedPlayerId: string;
    isUserHome: boolean;
    matchTitle?: string;
    stadiumId?: string;
    stadiumOverride?: StadiumDefinition;
    competitionVenue?: ResolvedCompetitionVenue;
    matchMode?: FootballMatchMode;
    competitionTag?: MatchModeCompetitionTag;
    youthCityId?: string;
    scoreboardThemeId?: string;
    displayedHalfMinutes?: 30 | 35 | 45;
    crowdAttendancePctOverride?: number;
    isCasualCrowd?: boolean;
    finalBoardCity?: string;
    finalBoardYear?: number;
    disableSurroundingsAndIntro?: boolean;
  };
  onCareerMatchComplete?: (result: GameplayMatchResult) => void;
  onExit: () => void;
}

export const GameplayModeShell: React.FC<GameplayModeShellProps> = ({
  isOpen,
  mode,
  initialMatchMode = 'pro',
  initialStreetCityId = 'buenos_aires',
  leagueDb,
  nationalTeams,
  careerSetup,
  onCareerMatchComplete,
  onExit,
}) => {
  const isCareerRestricted = mode === 'career_pro_match';

  // Synchronize DrawStar teams into the Gameplay team database before rendering selectors
  const registeredCount = useMemo(() => {
    const drawStarTeams = buildAllDrawStarGameplayTeams(leagueDb, nationalTeams);
    registerDrawStarExternalTeams(drawStarTeams);
    return drawStarTeams.length;
  }, [leagueDb, nationalTeams, isOpen]);

  const engineRef = useRef<MatchEngine | null>(null);
  if (!engineRef.current) {
    const e = new MatchEngine();
    const storedAssist = loadAssistModes();
    e.assistBySide = { ...storedAssist.sides };
    e.playerSlots = e.playerSlots.map((s) => ({
      ...s,
      assistMode: storedAssist.slots[s.id] || s.assistMode || 'assisted',
    }));
    e.debugExecutionOverlay = loadDebugExecutionOverlay();
    e.graphicsSettings = loadGraphicsSettings();
    e.isPaused = true;
    engineRef.current = e;
  }
  const engine = engineRef.current;

  const keysRef = useRef<KeyState>(createEmptyKeyState());
  const slotKeysRef = useRef<Record<number, KeyState>>({
    1: keysRef.current,
    2: createEmptyKeyState(),
    3: createEmptyKeyState(),
    4: createEmptyKeyState(),
  });

  const [playerSlots, setPlayerSlots] = useState<PlayerSlotConfig[]>(() => engine.playerSlots);
  const [kickOffSubMode, setKickOffSubMode] = useState<'pro' | 'youth' | 'street'>(
    initialMatchMode === 'street' ? 'street' : initialMatchMode === 'youth' ? 'youth' : 'pro'
  );
  const [teamSelectorBrowseMode, setTeamSelectorBrowseMode] = useState<TeamSelectorBrowseMode>('pro');
  const [streetCityId, setStreetCityId] = useState<string>(initialStreetCityId);
  const [isModeSelectOpen, setIsModeSelectOpen] = useState(false);
  const [isStreetCitySelectOpen, setIsStreetCitySelectOpen] = useState(false);
  const [isStreetCaptainDrawOpen, setIsStreetCaptainDrawOpen] = useState(false);
  const [appFlow, setAppFlow] = useState<
    | 'profiler'
    | 'side_select'
    | 'mode_select'
    | 'street_city_select'
    | 'team_selector'
    | 'street_captain_draw'
    | 'presentation'
    | 'in_match'
  >(isCareerRestricted ? 'presentation' : 'profiler');

  const activeModeMetaRef = useRef<{
    matchMode?: FootballMatchMode;
    competitionTag?: MatchModeCompetitionTag;
    youthCityId?: string;
    scoreboardThemeId?: string;
    displayedHalfMinutes?: 30 | 35 | 45;
    crowdAttendancePctOverride?: number;
    isCasualCrowd?: boolean;
    finalBoardCity?: string;
    finalBoardYear?: number;
    disableSurroundingsAndIntro?: boolean;
    stadiumOverride?: StadiumDefinition;
  }>({});

  const [isDeviceProfilerOpen, setIsDeviceProfilerOpen] = useState(!isCareerRestricted);
  const [isSideSelectOpen, setIsSideSelectOpen] = useState(false);
  const [isStartupTeamSelectOpen, setIsStartupTeamSelectOpen] = useState(false);
  const [startupTeamSide, setStartupTeamSide] = useState<'home' | 'away'>('home');

  const [isPaused, setIsPaused] = useState(false);
  const [isPreMatchOpen, setIsPreMatchOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(isCareerRestricted);
  const [isGamePlanOpen, setIsGamePlanOpen] = useState(false);
  const [isStadiumOpen, setIsStadiumOpen] = useState(false);
  const [isStadiumCreatorOpen, setIsStadiumCreatorOpen] = useState(false);
  const [stadiumCreatorInitial, setStadiumCreatorInitial] = useState<StadiumDefinition | undefined>(undefined);
  const [isTeamEditorOpen, setIsTeamEditorOpen] = useState(false);
  const [teamEditorTargetId, setTeamEditorTargetId] = useState<string | null>(null);
  const [isUnifiedSettingsOpen, setIsUnifiedSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'graphics' | 'controls' | 'match_hud'>('graphics');

  const [stadiumConfig, setStadiumConfig] = useState<StadiumConfig>(() => ({
    stadiumTier: engine.stadiumTier,
    pitchPreset: engine.pitchPreset,
    pitchLengthMeters: engine.pitchLengthMeters,
    pitchWidthMeters: engine.pitchWidthMeters,
    turfQuality: engine.turfQuality,
    mowingPattern: engine.mowingPattern,
    grassLength: engine.grassLength,
    surfaceStatus: engine.surfaceStatus,
    weather: engine.weather,
    season: engine.season,
    timeOfDay: engine.timeOfDay,
    seatColor: engine.seatColor,
    crowdLevel: engine.crowdLevel || 'crowded',
    netTension: engine.netTension,
    goalFrame: engine.goalFrame,
    stadiumId: engine.activeStadium?.id,
    isHomeVenueLocked: engine.isHomeVenueSelected,
    shape: engine.activeStadium?.shape,
    surroundings: engine.activeStadium?.surroundings,
    grounds: engine.activeStadium?.grounds,
    benchType: engine.activeStadium?.dugouts?.type,
    benchQuality: engine.activeStadium?.dugouts?.quality,
    tunnelType: engine.activeStadium?.tunnel?.type,
    tunnelSiting: engine.activeStadium?.tunnel?.siting,
    hasTrack: engine.activeStadium?.hasTrack,
    apronMaterial: engine.activeStadium?.apronMaterial || 'grass',
    capacity: engine.activeStadium?.capacity,
    fifaCategory: engine.activeStadium?.fifaCategory,
    roofCutaway: engine.activeStadium?.roofCutaway,
    roofStyle: engine.activeStadium?.roof?.style,
  }));

  const syncStadiumConfigFromEngine = useCallback(() => {
    setStadiumConfig({
      stadiumTier: engine.stadiumTier,
      pitchPreset: engine.pitchPreset,
      pitchLengthMeters: engine.pitchLengthMeters,
      pitchWidthMeters: engine.pitchWidthMeters,
      turfQuality: engine.turfQuality,
      mowingPattern: engine.mowingPattern,
      grassLength: engine.grassLength,
      surfaceStatus: engine.surfaceStatus,
      weather: engine.weather,
      season: engine.season,
      timeOfDay: engine.timeOfDay,
      seatColor: engine.seatColor,
      crowdLevel: engine.crowdLevel || 'crowded',
      netTension: engine.netTension,
      goalFrame: engine.goalFrame,
      stadiumId: engine.activeStadium?.id,
      isHomeVenueLocked: engine.isHomeVenueSelected,
      shape: engine.activeStadium?.shape,
      surroundings: engine.activeStadium?.surroundings,
      grounds: engine.activeStadium?.grounds,
      benchType: engine.activeStadium?.dugouts?.type,
      benchQuality: engine.activeStadium?.dugouts?.quality,
      tunnelType: engine.activeStadium?.tunnel?.type,
      tunnelSiting: engine.activeStadium?.tunnel?.siting,
      hasTrack: engine.activeStadium?.hasTrack,
      apronMaterial: engine.activeStadium?.apronMaterial || 'grass',
      capacity: engine.activeStadium?.capacity,
      fifaCategory: engine.activeStadium?.fifaCategory,
      roofCutaway: engine.activeStadium?.roofCutaway,
      roofStyle: engine.activeStadium?.roof?.style,
    });
  }, [engine]);

  const initializedSessionKeyRef = useRef<string | null>(null);

  // Completely disable global yellow screen navigation while any gameplay flow (Side Select, Team Select, Captain Draw, Match, Pause, End Game) is open
  useEffect(() => {
    if (!isOpen) {
      suspendGameNavForGameplay(false, 'gameplay_shell');
      return;
    }
    suspendGameNavForGameplay(true, 'gameplay_shell');
    return () => {
      suspendGameNavForGameplay(false, 'gameplay_shell');
    };
  }, [isOpen]);

  // Initialize flow whenever shell opens for a new session
  useEffect(() => {
    if (!isOpen) {
      initializedSessionKeyRef.current = null;
      engine.isPaused = true;
      return;
    }

    const sessionKey =
      mode === 'career_pro_match' && careerSetup
        ? `career_${careerSetup.homeTeam.id}_${careerSetup.awayTeam.id}_${careerSetup.lockedPlayerId}_${careerSetup.matchTitle || ''}_${careerSetup.competitionVenue?.stadiumId || ''}_${careerSetup.competitionVenue?.finalBannerText || ''}`
        : `kick_off_${mode}`;

    if (initializedSessionKeyRef.current === sessionKey) {
      return;
    }
    initializedSessionKeyRef.current = sessionKey;

    if (mode === 'career_pro_match' && careerSetup) {
      registerDrawStarExternalTeams([
        ...buildAllDrawStarGameplayTeams(leagueDb, nationalTeams),
        careerSetup.homeTeam,
        careerSetup.awayTeam,
      ]);
      registerRuntimeMatchTeams([careerSetup.homeTeam, careerSetup.awayTeam]);
      const userSide: 'home' | 'away' = careerSetup.isUserHome ? 'home' : 'away';
      const careerSlot: PlayerSlotConfig[] = [
        {
          ...(engine.playerSlots[0] || {
            id: 1,
            name: '1P',
            device: 'keyboard',
            gamepadIndex: 0,
            color: '#38bdf8',
          }),
          side: userSide,
          controlScope: 'single_player',
          lockedPlayerId: careerSetup.lockedPlayerId,
        },
      ];
      const effectiveMode: FootballMatchMode =
        careerSetup.matchMode ||
        initialMatchMode ||
        (careerSetup.homeTeam.teamSize === 7 ? 'street' : 'pro');
      engine.isPaused = true;
      engine.setPlayerSlots(careerSlot);
      setPlayerSlots(careerSlot);
      engine.matchMode = effectiveMode;
      engine.crowdAttendancePctOverride = careerSetup.crowdAttendancePctOverride;
      engine.isCasualCrowd = Boolean(careerSetup.isCasualCrowd ?? effectiveMode !== 'pro');
      engine.finalBoardCity = careerSetup.finalBoardCity;
      engine.finalBoardYear = careerSetup.finalBoardYear;
      engine.youthCityId = careerSetup.youthCityId;
      engine.setTeam('home', careerSetup.homeTeam);
      engine.setTeam('away', careerSetup.awayTeam);
      engine.setControlMode('one_player');
      engine.setLockedPlayer(careerSetup.lockedPlayerId);
      engine.restartMatch(true);
      setControlModeState('one_player');
      if (careerSetup.competitionVenue) {
        engine.applyCompetitionVenueOverlay(careerSetup.competitionVenue);
      } else if (careerSetup.stadiumOverride) {
        engine.applyStadium(careerSetup.stadiumOverride, true);
      } else if (careerSetup.stadiumId) {
        const std = getStadiumById(careerSetup.stadiumId);
        if (std) engine.applyStadium(std, true);
      }
      engine.syncMatchModeRules(careerSetup.competitionTag, careerSetup.scoreboardThemeId);
      if (careerSetup.displayedHalfMinutes) {
        engine.displayedHalfMinutes = careerSetup.displayedHalfMinutes;
      }
      activeModeMetaRef.current = {
        matchMode: effectiveMode,
        competitionTag: careerSetup.competitionTag,
        youthCityId: careerSetup.youthCityId,
        scoreboardThemeId: careerSetup.scoreboardThemeId,
        displayedHalfMinutes: careerSetup.displayedHalfMinutes || engine.displayedHalfMinutes,
        crowdAttendancePctOverride: careerSetup.crowdAttendancePctOverride,
        isCasualCrowd: careerSetup.isCasualCrowd,
        finalBoardCity: careerSetup.finalBoardCity,
        finalBoardYear: careerSetup.finalBoardYear,
        disableSurroundingsAndIntro: careerSetup.disableSurroundingsAndIntro,
        stadiumOverride: careerSetup.stadiumOverride,
      };
      syncStadiumConfigFromEngine();
      setScore({ home: 0, away: 0 });
      setMatchTime(0);
      setMatchPhase('kickoff_ready');
      setIsPaused(true);
      setIsDeviceProfilerOpen(false);
      setIsSideSelectOpen(false);
      setIsModeSelectOpen(false);
      setIsStreetCitySelectOpen(false);
      setIsStartupTeamSelectOpen(false);
      setIsStreetCaptainDrawOpen(false);
      setIsPresentationOpen(true);
      setAppFlow('presentation');
    } else if (mode === 'kick_off') {
      engine.applyCompetitionVenueOverlay(null);
      engine.matchMode = initialMatchMode;
      activeModeMetaRef.current = { matchMode: initialMatchMode };
      engine.restartMatch(true);
      setKickOffSubMode(initialMatchMode === 'street' ? 'street' : initialMatchMode === 'youth' ? 'youth' : 'pro');
      setTeamSelectorBrowseMode(initialMatchMode === 'youth' ? 'youth_leagues' : 'pro');
      setStreetCityId(initialStreetCityId);
      setScore({ home: 0, away: 0 });
      setMatchTime(0);
      setMatchPhase('kickoff_ready');
      setIsPaused(true);
      setIsDeviceProfilerOpen(true);
      setIsSideSelectOpen(false);
      setIsModeSelectOpen(false);
      setIsStreetCitySelectOpen(false);
      setIsStartupTeamSelectOpen(false);
      setIsStreetCaptainDrawOpen(false);
      setIsPresentationOpen(false);
      setAppFlow('profiler');
    }
  }, [isOpen, mode, careerSetup, registeredCount, initialMatchMode, initialStreetCityId]);

  const handleUpdateStadiumConfig = (newConfig: StadiumConfig) => {
    if (isCareerRestricted) return;
    setStadiumConfig(newConfig);
    engine.stadiumTier = newConfig.stadiumTier;
    engine.pitchPreset = newConfig.pitchPreset;
    engine.pitchLengthMeters = newConfig.pitchLengthMeters;
    engine.pitchWidthMeters = newConfig.pitchWidthMeters;
    engine.setTurfQuality(newConfig.turfQuality);
    engine.setMowingPattern(newConfig.mowingPattern);
    engine.setGrassLength(newConfig.grassLength);
    engine.setSurfaceStatus(newConfig.surfaceStatus);
    engine.setWeather(newConfig.weather);
    engine.setSeason(newConfig.season);
    engine.setTimeOfDay(newConfig.timeOfDay);
    engine.setSeatColor(newConfig.seatColor);
    engine.setCrowdLevel(newConfig.crowdLevel);
    engine.setNetTension(newConfig.netTension);
    engine.setGoalFrame(newConfig.goalFrame);
    if (newConfig.apronMaterial) engine.setApronMaterial(newConfig.apronMaterial);
    if (newConfig.grounds) engine.setGrounds(newConfig.grounds);
    if (newConfig.roofCutaway) engine.setRoofCutaway(newConfig.roofCutaway);
    if (newConfig.stadiumId) {
      const std = getStadiumById(newConfig.stadiumId);
      if (std) engine.applyStadium(std, !!newConfig.isHomeVenueLocked);
    }
  };

  const [difficulty, setDifficulty] = useState<DifficultyLevel>(engine.difficulty);
  const [gameSpeed, setGameSpeed] = useState<number>(engine.gameSpeed);
  const [powerBarSpeed, setPowerBarSpeed] = useState<number>(() => engine.powerBarSpeedPct);
  const [debugExecutionOverlay, setDebugExecutionOverlay] = useState<boolean>(() => engine.debugExecutionOverlay);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [matchTime, setMatchTime] = useState(0);
  const [matchPhase, setMatchPhase] = useState(engine.matchPhase);
  const [bannerMessage, setBannerMessage] = useState<string | null>(engine.bannerMessage);
  const [gkPromptOpen, setGkPromptOpen] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const [hasBall, setHasBall] = useState(false);
  const [controlledPlayer, setControlledPlayer] = useState(engine.getControlledPlayer());
  const [cameraFocus, setCameraFocus] = useState<'pitch' | 'ball' | 'player'>('pitch');

  const [minimapMode, setMinimapMode] = useState<MinimapMode>('transparent');
  const [minimapSonar, setMinimapSonar] = useState<boolean>(true);
  const [radarZoom, setRadarZoom] = useState<RadarZoom>('full');
  const [scoreboardMode, setScoreboardMode] = useState<HudDisplayMode>('solid');
  const [specialActionTextMode, setSpecialActionTextMode] = useState<HudDisplayMode>('solid');
  const [playerInfoMode, setPlayerInfoMode] = useState<HudDisplayMode>('solid');
  const [controllerBgMode, setControllerBgMode] = useState<ControllerBgMode>('solid');
  const [controllerTheme, setControllerTheme] = useState<ControllerTheme>('dark_blue');
  const [playerIndicatorType, setPlayerIndicatorType] = useState<PlayerIndicatorType>('small_arrow');
  const [playerIndicatorStyle, setPlayerIndicatorStyle] = useState<PlayerIndicatorStyle>('solid');

  const [controlMode, setControlModeState] = useState<ControlMode>(() =>
    isCareerRestricted ? 'one_player' : loadControlMode()
  );
  const [controllerCustomization, setControllerCustomization] = useState<ControllerCustomization>(loadControllerCustomization);
  const [keyBindings, setKeyBindings] = useState<CustomKeyBindings>(loadKeyBindings);
  const [gamepadBindings, setGamepadBindings] = useState<GamepadBindings>(loadGamepadBindings);
  const [isGamepadConnected, setIsGamepadConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState('');
  const [isControllerSettingsOpen, setIsControllerSettingsOpen] = useState(false);
  const [graphicsSettings, setGraphicsSettings] = useState<GraphicsSettings>(loadGraphicsSettings);
  const [isGraphicsSettingsOpen, setIsGraphicsSettingsOpen] = useState(false);

  const handleToggleCameraFocus = useCallback(() => {
    const next = engine.toggleCameraFocus();
    setCameraFocus(next);
    engine.setBanner(`CAMERA: ${next.toUpperCase()}`, 60);
    setBannerMessage(`CAMERA: ${next.toUpperCase()}`);
  }, [engine]);

  const handleControlModeChange = (nextMode: ControlMode) => {
    if (isCareerRestricted) return;
    setControlModeState(nextMode);
    engine.setControlMode(nextMode);
    saveControlMode(nextMode);
  };

  const handleGraphicsSettingsChange = (updated: GraphicsSettings) => {
    setGraphicsSettings(updated);
    engine.graphicsSettings = updated;
    saveGraphicsSettings(updated);
  };

  const lastUiUpdateRef = useRef(0);
  const handleTick = useCallback(() => {
    const cp = engine.getControlledPlayer();
    const distToBall = Math.hypot(engine.ball.x - (cp?.x || 0), engine.ball.y - (cp?.y || 0));
    const isAiSetPiece = !!engine.setPiece && engine.setPiece.team !== 'home';
    const ownsBall = !isAiSetPiece && !!cp && (engine.ball.ownerId === cp.id || (!engine.ball.ownerId && distToBall < 26 && engine.ball.z < 8));
    setHasBall(ownsBall);
    setControlledPlayer(cp);

    const now = Date.now();
    if (now - lastUiUpdateRef.current > 90) {
      lastUiUpdateRef.current = now;
      setScore({ ...engine.score });
      setMatchTime(engine.matchTimeSeconds);
      setMatchPhase(engine.matchPhase);
      setBannerMessage(engine.bannerMessage);
      setGkPromptOpen(!!engine.gkGoUpPrompt);
      setIsPaused(engine.isPaused);
    }
  }, [engine]);

  // Gamepad polling & Keyboard handling when open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (engine.matchPhase === 'full_time' || appFlow !== 'in_match') return;
        const paused = engine.togglePause();
        setIsPaused(paused);
        e.preventDefault();
        return;
      }
      const code = e.code;
      const keyLower = e.key ? e.key.toLowerCase() : '';
      const k = keysRef.current;
      const matches = (boundCode: string, defaultCode: string, altCodes: string[] = []) =>
        code === boundCode || code === defaultCode || altCodes.includes(code);

      if (matches(keyBindings.cameraFocus, 'KeyC', []) || keyLower === 'c') {
        handleToggleCameraFocus();
      } else if (matches(keyBindings.moveUp, 'ArrowUp')) k.ArrowUp = true;
      else if (matches(keyBindings.moveDown, 'ArrowDown')) k.ArrowDown = true;
      else if (matches(keyBindings.moveLeft, 'ArrowLeft')) k.ArrowLeft = true;
      else if (matches(keyBindings.moveRight, 'ArrowRight')) k.ArrowRight = true;
      else if (matches(keyBindings.sprint, 'ShiftLeft', ['ShiftRight', 'Shift']) || e.key === 'Shift') k.Shift = true;
      else if ((code === 'KeyG' || keyLower === 'g') && !isCareerRestricted) {
        engine.switchControlToGoalkeeper(1);
      } else if (matches(keyBindings.gingaSwitch, 'Space', []) || e.key === ' ') {
        k.Space = true;
        if (!isCareerRestricted) engine.switchControlToClosestDefender();
      } else if (matches(keyBindings.skillQ, 'KeyQ', ['q']) || keyLower === 'q') {
        k.KeyQ = true;
        if (!isCareerRestricted) engine.switchControlToClosestDefender(1);
      } else if (matches(keyBindings.skillE, 'KeyE', ['e']) || keyLower === 'e') {
        k.KeyE = true;
      } else if (matches(keyBindings.shortPass, 'KeyS', ['KeyP']) || keyLower === 's' || keyLower === 'p') {
        k.KeyS = true;
        engine.triggerActionPress('pass', k);
      } else if (matches(keyBindings.shoot, 'KeyA', []) || keyLower === 'a') {
        k.KeyA = true;
        engine.triggerActionPress('shoot', k);
      } else if (matches(keyBindings.cross, 'KeyD', []) || keyLower === 'd') {
        k.KeyD = true;
        engine.triggerActionPress('cross', k);
      } else if (matches(keyBindings.longPass, 'KeyW', ['KeyL']) || keyLower === 'w' || keyLower === 'l') {
        k.KeyW = true;
        engine.triggerActionPress('long_pass', k);
      }

      for (const slot of playerSlots) {
        if (slot.id > 1 && slot.device === 'keyboard') {
          updateSlotKeyboardInput(slot, code, true, slotKeysRef.current);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const keyLower = e.key ? e.key.toLowerCase() : '';
      const k = keysRef.current;
      const matches = (boundCode: string, defaultCode: string, altCodes: string[] = []) =>
        code === boundCode || code === defaultCode || altCodes.includes(code);

      if (matches(keyBindings.moveUp, 'ArrowUp')) k.ArrowUp = false;
      else if (matches(keyBindings.moveDown, 'ArrowDown')) k.ArrowDown = false;
      else if (matches(keyBindings.moveLeft, 'ArrowLeft')) k.ArrowLeft = false;
      else if (matches(keyBindings.moveRight, 'ArrowRight')) k.ArrowRight = false;
      else if (matches(keyBindings.sprint, 'ShiftLeft', ['ShiftRight', 'Shift']) || e.key === 'Shift') k.Shift = false;
      else if (matches(keyBindings.gingaSwitch, 'Space', []) || e.key === ' ') k.Space = false;
      else if (matches(keyBindings.skillQ, 'KeyQ', ['q']) || keyLower === 'q') k.KeyQ = false;
      else if (matches(keyBindings.skillE, 'KeyE', ['e']) || keyLower === 'e') k.KeyE = false;
      else if (matches(keyBindings.shortPass, 'KeyS', ['KeyP']) || keyLower === 's' || keyLower === 'p') {
        k.KeyS = false;
        engine.triggerActionRelease('pass', k);
      } else if (matches(keyBindings.shoot, 'KeyA', []) || keyLower === 'a') {
        k.KeyA = false;
        engine.triggerActionRelease('shoot', k);
      } else if (matches(keyBindings.cross, 'KeyD', []) || keyLower === 'd') {
        k.KeyD = false;
        engine.triggerActionRelease('cross', k);
      } else if (matches(keyBindings.longPass, 'KeyW', ['KeyL']) || keyLower === 'w' || keyLower === 'l') {
        k.KeyW = false;
        engine.triggerActionRelease('long_pass', k);
      }

      for (const slot of playerSlots) {
        if (slot.id > 1 && slot.device === 'keyboard') {
          updateSlotKeyboardInput(slot, code, false, slotKeysRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, engine, keyBindings, playerSlots, handleToggleCameraFocus, isCareerRestricted, appFlow]);

  const handleConfirmDeviceProfile = (config: {
    inputMethod: 'touch' | 'keyboard' | 'gamepad';
    controllerBgMode: ControllerBgMode;
    graphicsSettings: GraphicsSettings;
  }) => {
    const storedAssist = loadAssistModes();
    const initialSlots: PlayerSlotConfig[] = [
      {
        id: 1,
        name: '1P',
        side: 'home',
        device: config.inputMethod,
        gamepadIndex: 0,
        color: '#38bdf8',
        keyBindings: DEFAULT_KEY_BINDINGS_1P,
        assistMode: storedAssist.slots[1] || 'assisted',
      },
    ];
    engine.setPlayerSlots(initialSlots);
    setPlayerSlots(initialSlots);
    const targetBgMode: ControllerBgMode =
      config.inputMethod === 'touch'
        ? (config.controllerBgMode === 'hidden' ? 'solid' : config.controllerBgMode)
        : 'hidden';
    setControllerBgMode(targetBgMode);
    handleGraphicsSettingsChange(config.graphicsSettings);
    setIsDeviceProfilerOpen(false);
    setIsSideSelectOpen(true);
    setAppFlow('side_select');
    engine.setBanner(`HARDWARE PROFILED: ${config.inputMethod.toUpperCase()}`, 75);
  };

  const humanStreetSides = useMemo<Array<'home' | 'away'>>(() => {
    const sides: Array<'home' | 'away'> = [];
    if (playerSlots.some((s) => s.side === 'home')) sides.push('home');
    if (playerSlots.some((s) => s.side === 'away')) sides.push('away');
    return sides;
  }, [playerSlots]);

  const applyStreetBundleToEngine = useCallback(
    (bundle: StreetGameplayMatchBundle) => {
      registerRuntimeMatchTeams([bundle.homeTeam, bundle.awayTeam]);
      engine.matchMode = 'street';
      engine.youthCityId = bundle.cityId;
      engine.isCasualCrowd = true;
      engine.finalBoardCity = undefined;
      engine.finalBoardYear = undefined;
      engine.crowdAttendancePctOverride = undefined;
      engine.applyStadium(bundle.stadium, true);
      engine.setTeam('home', bundle.homeTeam);
      engine.setTeam('away', bundle.awayTeam);
      engine.restartMatch(true);
      engine.syncMatchModeRules('street', 'street');
      engine.displayedHalfMinutes = 30;
      activeModeMetaRef.current = {
        matchMode: 'street',
        competitionTag: 'street',
        youthCityId: bundle.cityId,
        scoreboardThemeId: 'street',
        displayedHalfMinutes: 30,
        isCasualCrowd: true,
        stadiumOverride: bundle.stadium,
      };
      setControlledPlayer(engine.getControlledPlayer());
      syncStadiumConfigFromEngine();
    },
    [engine, syncStadiumConfigFromEngine]
  );

  const applyYouthMatchupToEngine = useCallback(
    (bundle: TeamSelectorYouthBundle) => {
      registerRuntimeMatchTeams([bundle.homeTeam, bundle.awayTeam]);
      setKickOffSubMode('youth');
      engine.matchMode = bundle.matchMode;
      engine.youthCityId = bundle.youthCityId;
      engine.isCasualCrowd = bundle.isCasualCrowd;
      engine.crowdAttendancePctOverride = bundle.crowdAttendancePctOverride;
      engine.finalBoardCity = bundle.finalBoardCity;
      engine.finalBoardYear = bundle.finalBoardYear;
      engine.applyStadium(bundle.stadium, true);
      engine.setTeam('home', bundle.homeTeam);
      engine.setTeam('away', bundle.awayTeam);
      engine.restartMatch(true);
      engine.syncMatchModeRules(bundle.competitionTag, bundle.scoreboardThemeId);
      engine.displayedHalfMinutes = bundle.displayedHalfMinutes;
      activeModeMetaRef.current = {
        matchMode: bundle.matchMode,
        competitionTag: bundle.competitionTag,
        youthCityId: bundle.youthCityId,
        scoreboardThemeId: bundle.scoreboardThemeId,
        displayedHalfMinutes: bundle.displayedHalfMinutes,
        crowdAttendancePctOverride: bundle.crowdAttendancePctOverride,
        isCasualCrowd: bundle.isCasualCrowd,
        finalBoardCity: bundle.finalBoardCity,
        finalBoardYear: bundle.finalBoardYear,
        disableSurroundingsAndIntro: bundle.disableSurroundingsAndIntro,
        stadiumOverride: bundle.stadium,
      };
      setControlledPlayer(engine.getControlledPlayer());
      syncStadiumConfigFromEngine();
      setIsStartupTeamSelectOpen(false);
      setIsPresentationOpen(true);
      setAppFlow('presentation');
    },
    [engine, syncStadiumConfigFromEngine]
  );

  const launchStreetKickOffFlow = useCallback(
    (slotsOverride?: PlayerSlotConfig[], cityOverride?: string) => {
      const activeSlots = slotsOverride || playerSlots;
      const targetCity = cityOverride || streetCityId;
      if (cityOverride) setStreetCityId(cityOverride);
      const hasHome = activeSlots.some((s) => s.side === 'home');
      const hasAway = activeSlots.some((s) => s.side === 'away');
      const activeHumanSides: Array<'home' | 'away'> = [];
      if (hasHome) activeHumanSides.push('home');
      if (hasAway) activeHumanSides.push('away');

      setKickOffSubMode('street');
      setIsSideSelectOpen(false);
      setIsModeSelectOpen(false);
      setIsStreetCitySelectOpen(false);
      setIsStartupTeamSelectOpen(false);

      if (activeHumanSides.length > 0) {
        // Human side(s) play the Top-15 3-card Captain Draw Cinematic (Home first, then Away if both human)
        setIsStreetCaptainDrawOpen(true);
        setAppFlow('street_captain_draw');
      } else {
        // CPU vs CPU spectator: auto-pick captains from Top-15 + 6+6 teammates silently without cinematic
        const bundle = buildStreetGameplayTeams(targetCity, leagueDb, null, {
          homeControl: 'cpu',
          awayControl: 'cpu',
        });
        applyStreetBundleToEngine(bundle);
        setIsStreetCaptainDrawOpen(false);
        setIsPresentationOpen(true);
        setAppFlow('presentation');
      }
    },
    [playerSlots, streetCityId, leagueDb, applyStreetBundleToEngine]
  );

  const handleConfirmSideSelect = (
    newSlots: PlayerSlotConfig[],
    scope: ControlScope = 'all_team',
    lockedId?: string,
    cursorMode: CursorSwitchMode = 'manual'
  ) => {
    saveAssistModes(newSlots);
    engine.setPlayerSlots(newSlots);
    setPlayerSlots(newSlots);
    const slot1 = newSlots.find((s) => s.id === 1);
    if (slot1) {
      if (slot1.device === 'keyboard') {
        const targetBindings =
          slot1.keyboardPreset === 'wasd'
            ? DEFAULT_KEY_BINDINGS_WASD
            : slot1.keyBindings || DEFAULT_KEY_BINDINGS_1P;
        setKeyBindings(targetBindings);
        saveKeyBindings(targetBindings);
      }
      if (scope === 'single_player' && lockedId) {
        engine.setControlMode('one_player');
        engine.setLockedPlayer(lockedId);
        setControlModeState('one_player');
      } else {
        engine.setControlMode('full_team');
        setControlModeState('full_team');
      }
      engine.cursorSwitchMode = cursorMode;
    }

    const isAlreadyInMatch = matchTime > 0 || score.home > 0 || score.away > 0;
    if (isAlreadyInMatch) {
      setIsSideSelectOpen(false);
      setIsPaused(true);
      return;
    }

    setIsSideSelectOpen(false);
    setIsModeSelectOpen(true);
    setAppFlow('mode_select');
  };

  const handleSelectTeamFromStartup = (side: 'home' | 'away', team: TeamDefinition) => {
    if (team.teamSize !== 7) {
      setKickOffSubMode('pro');
      engine.matchMode = 'pro';
      activeModeMetaRef.current = { matchMode: 'pro', competitionTag: 'pro', displayedHalfMinutes: 45 };
    }
    engine.setTeam(side, team);
    setControlledPlayer(engine.getControlledPlayer());
    if (side === 'home') {
      syncStadiumConfigFromEngine();
    }
  };

  const handleStartMatch = (config: PreMatchConfig) => {
    const meta = activeModeMetaRef.current;
    const isStreetActive =
      kickOffSubMode === 'street' ||
      meta.matchMode === 'street' ||
      engine.matchMode === 'street' ||
      engine.homeTeam.teamSize === 7 ||
      engine.awayTeam.teamSize === 7;
    const effectiveMode: FootballMatchMode = isStreetActive
      ? 'street'
      : meta.matchMode || config.matchMode || engine.matchMode || 'pro';
    const effectiveConfig: PreMatchConfig = {
      ...config,
      matchMode: effectiveMode,
      isStreetMatch: isStreetActive,
      competitionTag: meta.competitionTag || config.competitionTag,
      youthCityId: meta.youthCityId || config.youthCityId,
      scoreboardThemeId: meta.scoreboardThemeId || config.scoreboardThemeId,
      displayedHalfMinutes:
        meta.displayedHalfMinutes || config.displayedHalfMinutes || (isStreetActive ? 30 : effectiveMode === 'youth' ? 35 : 45),
      crowdAttendancePctOverride: meta.crowdAttendancePctOverride ?? config.crowdAttendancePctOverride,
      isCasualCrowd: meta.isCasualCrowd ?? config.isCasualCrowd,
      finalBoardCity: meta.finalBoardCity ?? config.finalBoardCity,
      finalBoardYear: meta.finalBoardYear ?? config.finalBoardYear,
    };
    engine.applyPreMatchConfig(effectiveConfig);
    if (meta.stadiumOverride) {
      engine.applyStadium(meta.stadiumOverride, true);
      engine.syncMatchModeRules(effectiveConfig.competitionTag, effectiveConfig.scoreboardThemeId);
      if (effectiveConfig.displayedHalfMinutes) {
        engine.displayedHalfMinutes = effectiveConfig.displayedHalfMinutes;
      }
    }
    if (isCareerRestricted && careerSetup) {
      engine.setControlMode('one_player');
      engine.setLockedPlayer(careerSetup.lockedPlayerId);
      setControlModeState('one_player');
    } else if (effectiveConfig.controlScope === 'single_player' && effectiveConfig.lockedPlayerId) {
      engine.setControlMode('one_player');
      engine.setLockedPlayer(effectiveConfig.lockedPlayerId);
      setControlModeState('one_player');
    } else {
      engine.setControlMode('full_team');
      setControlModeState('full_team');
    }
    setDifficulty(effectiveConfig.difficulty);
    setScore({ home: 0, away: 0 });
    setMatchTime(0);
    setMatchPhase(engine.matchPhase);
    setBannerMessage(`MATCH COMMENCED: ${engine.homeTeam.name.toUpperCase()} VS ${engine.awayTeam.name.toUpperCase()}`);
    setIsPreMatchOpen(false);
    setIsPresentationOpen(false);
    setIsStartupTeamSelectOpen(false);
    setIsStreetCaptainDrawOpen(false);
    setIsModeSelectOpen(false);
    setIsStreetCitySelectOpen(false);
    setIsPaused(false);
    engine.isPaused = false;
    setAppFlow('in_match');
    engine.startPreMatchSwoop(4200, true);
  };

  const handleCareerFinishAndReturn = () => {
    if (!onCareerMatchComplete || !careerSetup) {
      onExit();
      return;
    }
    const ratings = engine.playerRatings.getAllRatings();
    const userRec = ratings.find(
      (r) =>
        r.playerId === engine.lockedPlayerId ||
        r.playerId === careerSetup.lockedPlayerId ||
        r.sourceId === careerSetup.lockedPlayerId
    );
    const mvp = engine.playerRatings.getMatchMvp();
    const goalScorers: GameplayGoalScorerInfo[] = (engine.goalEvents || []).map((g) => ({
      playerName: g.scorerName,
      team: g.team,
      minute: g.minute,
      assistPlayerName: g.assistName,
      isOwnGoal: g.isOwnGoal,
      isPenalty: g.isPenalty,
    }));
    const assistProviders: GameplayAssistProviderInfo[] = ratings
      .filter((r) => r.assists > 0)
      .map((r) => ({
        playerName: r.name,
        team: r.team,
        assists: r.assists,
      }));
    const finalUserRating =
      engine.userWasInjuredInMatch && engine.lockedUserRatingAtInjury !== null
        ? engine.lockedUserRatingAtInjury
        : (userRec?.rating || 7.2);
    onCareerMatchComplete({
      homeScore: score.home,
      awayScore: score.away,
      userGoals: userRec?.goals || 0,
      userAssists: userRec?.assists || 0,
      userRating: finalUserRating,
      isUserHome: careerSetup.isUserHome,
      mvpName: mvp?.player?.name,
      mvpRating: mvp?.player?.rating,
      goalScorers,
      assistProviders,
      userInjured: engine.userWasInjuredInMatch,
      userInjuryRiskPct: engine.userInjuryRiskPct,
      lockedUserRating: engine.lockedUserRatingAtInjury,
      matchMode: engine.matchMode,
      displayedHalfMinutes: engine.displayedHalfMinutes,
      scoreboardThemeId: engine.scoreboardThemeId,
    });
  };

  if (!isOpen) return null;

  const aimArrowSlot = playerSlots.find(s => engine.slotControlledPlayerIds?.[s.id] === engine.userControlledPlayerId) ||
    playerSlots.find(s => s.id === 1) || playerSlots[0];

  return (
    <div className="fixed inset-0 z-[120] w-full h-[100dvh] safe-top safe-bottom overflow-hidden bg-[#07131e] select-none">
      {/* FULL-VIEWPORT 2D CANVAS FOOTBALL FIELD */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <PitchCanvas
          engine={engine}
          keysRef={keysRef}
          slotKeysRef={slotKeysRef}
          onTick={handleTick}
          playerIndicatorType={playerIndicatorType}
          playerIndicatorStyle={playerIndicatorStyle}
          graphicsSettings={graphicsSettings}
          controllerBgMode={controllerBgMode}
        />
        <RetroFilterOverlay filter={graphicsSettings.activeFilter} />
      </div>

      <SetPieceOverlay engine={engine} keysRef={keysRef} />

      {gkPromptOpen && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-3 safe-top safe-bottom bg-black/60">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-xl p-4 max-w-sm w-full text-center shadow-2xl">
            <div className="font-['Press_Start_2P'] text-[10px] text-amber-400 mb-2">LATE CORNER, WE ARE LOSING</div>
            <p className="text-slate-200 text-sm font-mono mb-3">Your goalkeeper asks: can I go up for this corner?</p>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => engine.resolveGkGoUp(true)} className="min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg py-2.5 px-3 text-xs font-mono cursor-pointer">LET HIM GO UP [S]</button>
              <button type="button" onClick={() => engine.resolveGkGoUp(false)} className="min-h-[44px] bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg py-2.5 px-3 text-xs font-mono cursor-pointer">TELL HIM TO STAY [D]</button>
            </div>
          </div>
        </div>
      )}

      <MatchHUD
        score={score}
        matchTimeSeconds={matchTime}
        matchPhase={matchPhase}
        bannerMessage={bannerMessage}
        controlledPlayer={controlledPlayer}
        controlledPlayerRating={engine.getControlledPlayerRating()}
        scoreboardMode={scoreboardMode}
        specialActionTextMode={specialActionTextMode}
        playerInfoMode={playerInfoMode}
        onOpenPreMatch={() => setIsPreMatchOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onOpenGraphicsSettings={() => setIsGraphicsSettingsOpen(true)}
        homeTeam={engine.homeTeam}
        awayTeam={engine.awayTeam}
        stoppageTimeDisplay={engine.stoppageTimeDisplay}
        currentHalf={engine.currentHalf}
        currentPeriod={engine.currentPeriod}
        displayedHalfMinutes={engine.displayedHalfMinutes}
        scoreboardThemeId={engine.scoreboardThemeId}
        matchMode={engine.matchMode}
        finalBoardCity={engine.finalBoardCity}
        finalBoardYear={engine.finalBoardYear}
        roofCutaway={stadiumConfig.roofCutaway || engine.activeStadium?.roofCutaway || 'partial'}
        onCycleRoofCutaway={() => {
          const current = stadiumConfig.roofCutaway || engine.activeStadium?.roofCutaway || 'partial';
          const nextCutaway: RoofCutawayMode = current === 'hidden' ? 'partial' : current === 'partial' ? 'full' : 'hidden';
          audio.playKick(0.22);
          engine.setRoofCutaway(nextCutaway);
          setStadiumConfig((prev) => ({ ...prev, roofCutaway: nextCutaway }));
        }}
        stadiumDef={engine.activeStadium}
      />

      <RadarMinimap
        engine={engine}
        mode={minimapMode}
        sonar={minimapSonar}
        zoom={radarZoom}
        focusTarget={cameraFocus}
        onCycleMode={() => setMinimapMode(minimapMode === 'transparent' ? 'solid' : minimapMode === 'solid' ? 'off' : 'transparent')}
        onToggleSonar={() => setMinimapSonar(!minimapSonar)}
        onCycleZoom={() => setRadarZoom(radarZoom === 'full' ? 'zoom1' : radarZoom === 'zoom1' ? 'zoom2' : 'full')}
      />

      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto">
        <ArcadeConsole
          keys={keysRef.current}
          hasBall={hasBall}
          onKeyChange={(key, pressed) => { keysRef.current[key] = pressed; }}
          onActionPress={(action, modifier) => engine.triggerActionPress(action, keysRef.current, modifier)}
          onActionRelease={(action, modifier) => engine.triggerActionRelease(action, keysRef.current, modifier)}
          onModifierChange={(modifier) => engine.setActionModifier(modifier)}
          onDeflectionChange={(ratio) => { engine.analogSpeedRatio = ratio; }}
          onTogglePause={() => { const p = engine.togglePause(); setIsPaused(p); }}
          isPaused={isPaused}
          controllerBgMode={controllerBgMode}
          controllerTheme={controllerTheme}
          cameraFocus={cameraFocus}
          onToggleCameraFocus={handleToggleCameraFocus}
          controllerCustomization={controllerCustomization}
          controlMode={controlMode}
          isGamepadConnected={isGamepadConnected}
          gamepadName={gamepadName}
          onOpenControllerSettings={() => setIsControllerSettingsOpen(true)}
        />
      </div>

      <PauseModal
        isOpen={
          isPaused &&
          matchPhase !== 'full_time' &&
          appFlow === 'in_match' &&
          !isPreMatchOpen &&
          !isPresentationOpen &&
          !isGamePlanOpen &&
          !isStadiumOpen &&
          !isStadiumCreatorOpen &&
          !isTeamEditorOpen &&
          !isUnifiedSettingsOpen &&
          !isControllerSettingsOpen &&
          !isGraphicsSettingsOpen
        }
        onResume={() => { const p = engine.togglePause(); setIsPaused(p); }}
        onResetKickoff={() => {
          engine.resetToKickoff('home', false, true);
          setScore({ home: 0, away: 0 });
          setMatchTime(0);
          setMatchPhase('kickoff_ready');
          setIsPaused(false);
        }}
        isHalfTime={matchPhase === 'half_time'}
        isExtraTimeHalf={matchPhase === 'extra_time_half'}
        onStartSecondHalf={() => {
          engine.startSecondHalf();
          setIsPaused(false);
          setMatchPhase(engine.matchPhase);
        }}
        onStartETSecondHalf={() => {
          engine.startExtraTimeSecondHalf();
          setIsPaused(false);
          setMatchPhase(engine.matchPhase);
        }}
        stoppageTimeMinutes={engine.currentHalf === 1 ? engine.firstHalfStoppageMinutes : engine.secondHalfStoppageMinutes}
        currentHalf={engine.currentHalf}
        currentPeriod={engine.currentPeriod}
        matchTimeSeconds={matchTime}
        displayedHalfMinutes={engine.displayedHalfMinutes}
        matchMode={engine.matchMode}
        onOpenPreMatch={() => {
          setIsPaused(false);
          setIsPresentationOpen(true);
        }}
        onOpenPresentation={() => {
          setIsPaused(false);
          setIsPresentationOpen(true);
        }}
        onOpenGamePlan={() => {
          setIsPaused(false);
          setIsGamePlanOpen(true);
        }}
        onOpenSideSelect={() => {
          if (isCareerRestricted) return;
          setIsPaused(false);
          setIsSideSelectOpen(true);
        }}
        onOpenSettings={() => {
          setIsPaused(false);
          setSettingsInitialTab('match_hud');
          setIsUnifiedSettingsOpen(true);
        }}
        homeScore={score.home}
        awayScore={score.away}
        homeTeamName={engine.homeTeam.name}
        awayTeamName={engine.awayTeam.name}
        homeTeamBadge={engine.homeTeam.badge?.icon || engine.homeTeam.badge?.text}
        awayTeamBadge={engine.awayTeam.badge?.icon || engine.awayTeam.badge?.text}
        currentLang={currentLang}
        onToggleLanguage={() => {
          const next = currentLang === 'en' ? 'es' : 'en';
          setLanguage(next);
          setCurrentLang(next);
        }}
        difficulty={difficulty}
        onChangeDifficulty={(d) => { engine.difficulty = d; setDifficulty(d); }}
        gameSpeed={gameSpeed}
        onChangeGameSpeed={(s) => { engine.gameSpeed = s; setGameSpeed(s); }}
        powerBarSpeed={powerBarSpeed}
        onChangePowerBarSpeed={(p) => { engine.powerBarSpeedPct = p; setPowerBarSpeed(p); }}
        minimapMode={minimapMode}
        onChangeMinimapMode={setMinimapMode}
        minimapSonar={minimapSonar}
        onChangeMinimapSonar={setMinimapSonar}
        radarZoom={radarZoom}
        onChangeRadarZoom={setRadarZoom}
        scoreboardMode={scoreboardMode}
        onChangeScoreboardMode={setScoreboardMode}
        specialActionTextMode={specialActionTextMode}
        onChangeSpecialActionTextMode={setSpecialActionTextMode}
        playerInfoMode={playerInfoMode}
        onChangePlayerInfoMode={setPlayerInfoMode}
        controllerBgMode={controllerBgMode}
        onChangeControllerBgMode={setControllerBgMode}
        controllerTheme={controllerTheme}
        onChangeControllerTheme={setControllerTheme}
        playerIndicatorType={playerIndicatorType}
        onChangePlayerIndicatorType={setPlayerIndicatorType}
        playerIndicatorStyle={playerIndicatorStyle}
        onChangePlayerIndicatorStyle={setPlayerIndicatorStyle}
        controlMode={controlMode}
        onChangeControlMode={handleControlModeChange}
        onOpenControllerSettings={() => { setIsPaused(false); setIsControllerSettingsOpen(true); }}
        onOpenGraphicsSettings={() => { setIsPaused(false); setIsGraphicsSettingsOpen(true); }}
        graphicsSettings={graphicsSettings}
        isGamepadConnected={isGamepadConnected}
        gamepadName={gamepadName}
        homePlayers={engine.players.filter((p) => p.team === 'home')}
        lockedPlayerId={engine.lockedPlayerId}
        onSelectLockedPlayer={(id) => {
          if (isCareerRestricted) return;
          engine.setLockedPlayer(id);
          setControlledPlayer(engine.getControlledPlayer());
        }}
        stadiumTier={engine.stadiumTier}
        onChangeStadiumTier={(tier) => { if (!isCareerRestricted) engine.setStadiumTier(tier); }}
        timeOfDay={engine.timeOfDay}
        onChangeTimeOfDay={(t) => { if (!isCareerRestricted) engine.setTimeOfDay(t); }}
        seatColor={engine.seatColor}
        onChangeSeatColor={(c) => { if (!isCareerRestricted) engine.setSeatColor(c); }}
        turfQuality={engine.turfQuality}
        onChangeTurfQuality={(q) => { if (!isCareerRestricted) engine.setTurfQuality(q); }}
        grassLength={engine.grassLength}
        onChangeGrassLength={(l) => { if (!isCareerRestricted) engine.setGrassLength(l); }}
        weather={engine.weather}
        onChangeWeather={(w) => { if (!isCareerRestricted) engine.setWeather(w); }}
        season={engine.season}
        onChangeSeason={(s) => { if (!isCareerRestricted) engine.setSeason(s); }}
        netTension={engine.netTension}
        onChangeNetTension={(n) => { if (!isCareerRestricted) engine.setNetTension(n); }}
        goalFrame={engine.goalFrame}
        onChangeGoalFrame={(g) => { if (!isCareerRestricted) engine.setGoalFrame(g); }}
        onOpenMainMenu={onExit}
      />

      <EndGameModal
        isOpen={matchPhase === 'full_time'}
        homeScore={score.home}
        awayScore={score.away}
        homeTeamName={engine.homeTeam.name}
        awayTeamName={engine.awayTeam.name}
        homeTeamBadge={engine.homeTeam.badge?.icon || engine.homeTeam.badge?.text}
        awayTeamBadge={engine.awayTeam.badge?.icon || engine.awayTeam.badge?.text}
        homeKitColor={engine.homeKit.primaryColor}
        awayKitColor={engine.awayKit.primaryColor}
        stats={engine.matchStats}
        playerRatings={engine.playerRatings.getAllRatings()}
        matchMvp={engine.playerRatings.getMatchMvp()}
        goalEvents={engine.goalEvents}
        penaltyShootout={engine.penaltyShootout}
        isDraw={score.home === score.away}
        isExtraTimeAvailable={engine.currentPeriod === '2nd_half'}
        matchMode={engine.matchMode}
        isKickOff={mode === 'kick_off'}
        userRating={
          careerSetup?.lockedPlayerId
            ? engine.userWasInjuredInMatch && engine.lockedUserRatingAtInjury !== null
              ? engine.lockedUserRatingAtInjury
              : engine.playerRatings
                  .getAllRatings()
                  .find((r) => r.playerId === careerSetup.lockedPlayerId || r.sourceId === careerSetup.lockedPlayerId)
                  ?.rating ?? engine.getControlledPlayerRating()
            : null
        }
        userInjured={engine.userWasInjuredInMatch}
        matchPeriod={
          engine.currentPeriod === 'penalty_shootout'
            ? 'PEN'
            : engine.currentPeriod === 'extra_time_2'
            ? `${engine.displayedHalfMinutes * 2 + 30}:00`
            : `${engine.displayedHalfMinutes * 2}:00`
        }
        careerReturnLabel={isCareerRestricted ? 'CONTINUE' : undefined}
        onCareerReturn={isCareerRestricted ? handleCareerFinishAndReturn : undefined}
        onRematch={() => {
          engine.restartMatch(false);
          setIsPaused(false);
          setScore({ home: 0, away: 0 });
          setMatchTime(0);
          setMatchPhase(engine.matchPhase);
          setBannerMessage(engine.bannerMessage);
          setAppFlow('in_match');
        }}
        onTeamSelection={() => {
          if (isCareerRestricted) return;
          engine.restartMatch(true);
          setIsPaused(true);
          setScore({ home: 0, away: 0 });
          setMatchTime(0);
          setMatchPhase('kickoff_ready');
          setStartupTeamSide('home');
          setIsStartupTeamSelectOpen(true);
          setAppFlow('team_selector');
        }}
        onOpenSettings={() => {
          setSettingsInitialTab('match_hud');
          setIsUnifiedSettingsOpen(true);
        }}
        onMainMenu={isCareerRestricted ? handleCareerFinishAndReturn : onExit}
        onStartExtraTime={() => {
          engine.startExtraTime();
          setIsPaused(false);
          setMatchPhase(engine.matchPhase);
        }}
        onStartPenalties={() => {
          engine.startPenaltyShootout();
          setIsPaused(false);
          setMatchPhase(engine.matchPhase);
        }}
      />

      <ControllerSettingsModal
        isOpen={isControllerSettingsOpen}
        onClose={() => setIsControllerSettingsOpen(false)}
        controlMode={controlMode}
        onChangeControlMode={handleControlModeChange}
        controllerCustomization={controllerCustomization}
        onChangeControllerCustomization={(c) => { setControllerCustomization(c); saveControllerCustomization(c); }}
        keyBindings={keyBindings}
        onChangeKeyBindings={(b) => { setKeyBindings(b); saveKeyBindings(b); }}
        gamepadBindings={gamepadBindings}
        onChangeGamepadBindings={(b) => { setGamepadBindings(b); saveGamepadBindings(b); }}
        isGamepadConnected={isGamepadConnected}
        gamepadName={gamepadName}
      />

      <GraphicsSettingsModal
        isOpen={isGraphicsSettingsOpen}
        onClose={() => setIsGraphicsSettingsOpen(false)}
        settings={graphicsSettings}
        onChangeSettings={handleGraphicsSettingsChange}
      />

      <PreMatchModal
        isOpen={isPreMatchOpen}
        isMidMatch={matchTime > 0 || score.home > 0 || score.away > 0}
        matchMode={engine.matchMode}
        displayedHalfMinutes={engine.displayedHalfMinutes}
        onStartMatch={handleStartMatch}
        onApplyTacticsMidMatch={(cfg) => {
          if (!isCareerRestricted) {
            engine.applyTacticsMidMatch(cfg);
            if (cfg.difficulty) setDifficulty(cfg.difficulty);
          }
          setIsPreMatchOpen(false);
          setIsPaused(false);
        }}
        onUpdatePlayerPlaystyle={(playerId, playstyle) => {
          if (!isCareerRestricted) engine.setPlayerPlaystyle(playerId, playstyle);
        }}
        onClose={() => setIsPreMatchOpen(false)}
        onOpenPresentation={() => {
          setIsPreMatchOpen(false);
          setIsPresentationOpen(true);
        }}
        onOpenGamePlan={() => {
          setIsPreMatchOpen(false);
          setIsGamePlanOpen(true);
        }}
        initialConfig={{
          halfDurationMinutes: engine.halfDurationMinutes,
          homeFormation: engine.homeFormation,
          awayFormation: engine.awayFormation,
          homePlaystyle: engine.homePlaystyle,
          awayPlaystyle: engine.awayPlaystyle,
          homeTactics: engine.homeTactics,
          awayTactics: engine.awayTactics,
          difficulty: difficulty,
          stadiumTier: engine.stadiumTier,
          timeOfDay: engine.timeOfDay,
          seatColor: engine.seatColor,
          pitchPreset: engine.pitchPreset,
          pitchLengthMeters: engine.pitchLengthMeters,
          pitchWidthMeters: engine.pitchWidthMeters,
          turfQuality: engine.turfQuality,
          grassLength: engine.grassLength,
          weather: engine.weather,
          season: engine.season,
          netTension: engine.netTension,
          goalFrame: engine.goalFrame,
          homeTeamId: engine.homeTeam.id,
          awayTeamId: engine.awayTeam.id,
          matchMode: engine.matchMode,
          displayedHalfMinutes: engine.displayedHalfMinutes,
        }}
      />

      {/* STEP 1 OF KICK OFF: SYSTEM PROFILER */}
      <DeviceProfilerModal
        isOpen={isDeviceProfilerOpen && !isCareerRestricted}
        onConfirm={handleConfirmDeviceProfile}
        currentGraphicsSettings={graphicsSettings}
      />

      {/* STEP 2 OF KICK OFF: SELECT SIDE & CONTROLLER PROFILE */}
      <SideSelectModal
        isOpen={isSideSelectOpen && !isCareerRestricted}
        onConfirm={handleConfirmSideSelect}
        onClose={() => {
          setIsSideSelectOpen(false);
          if (appFlow === 'side_select' || (matchTime === 0 && score.home === 0 && score.away === 0)) {
            onExit();
          } else {
            setIsPaused(true);
          }
        }}
        initialPlayers={playerSlots}
        isMidMatch={matchTime > 0 || score.home > 0 || score.away > 0}
        homeTeamName={engine.homeTeam.name}
        awayTeamName={engine.awayTeam.name}
        homeTeamBadge={engine.homeTeam.badge?.icon || engine.homeTeam.badge?.text}
        awayTeamBadge={engine.awayTeam.badge?.icon || engine.awayTeam.badge?.text}
        homePlayers={engine.players.filter((p) => p.team === 'home')}
        awayPlayers={engine.players.filter((p) => p.team === 'away')}
        initialControlScope={controlMode === 'one_player' ? 'single_player' : 'all_team'}
        initialLockedPlayerId={engine.lockedPlayerId || undefined}
        initialCursorSwitchMode={engine.cursorSwitchMode}
      />

      {/* STEP 2B OF KICK OFF: 3-MODE SELECTOR (PROFESSIONAL | YOUTH LEAGUES | STREET) */}
      <ConsoleModalShell
        isOpen={isModeSelectOpen && !isCareerRestricted}
        onClose={() => {
          setIsModeSelectOpen(false);
          setIsSideSelectOpen(true);
          setAppFlow('side_select');
        }}
        title="SELECT KICK OFF MODE"
        subtitle="Choose match format, ruleset, and stadium atmosphere"
        icon={<Trophy className="w-5 h-5 text-amber-400" />}
        accentColor="amber"
        maxWidthClass="sm:max-w-3xl"
        bodyClassName="p-4 sm:p-5 bg-slate-900/95 space-y-4"
        footer={
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setIsModeSelectOpen(false);
                setIsSideSelectOpen(true);
                setAppFlow('side_select');
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-arcade flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO SIDES</span>
            </button>
            <div className="text-xs font-mono text-slate-400">
              {playerSlots.some((s) => s.side === 'home') && playerSlots.some((s) => s.side === 'away')
                ? '1P vs 2P / Local Versus'
                : playerSlots.length > 0
                ? 'Player vs CPU'
                : 'CPU Exhibition'}
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. PROFESSIONAL */}
          <button
            type="button"
            onClick={() => {
              setKickOffSubMode('pro');
              setTeamSelectorBrowseMode('pro');
              activeModeMetaRef.current = { matchMode: 'pro', competitionTag: 'pro', displayedHalfMinutes: 45 };
              engine.matchMode = 'pro';
              setIsModeSelectOpen(false);
              setStartupTeamSide('home');
              setIsStartupTeamSelectOpen(true);
              setAppFlow('team_selector');
            }}
            className="p-4 rounded-2xl border-2 border-blue-500/60 bg-gradient-to-b from-blue-950/60 to-slate-950 hover:border-blue-400 hover:from-blue-900/60 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-lg"
          >
            <div className="space-y-2">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-300" />
              </div>
              <div className="font-arcade text-sm text-white font-black">PROFESSIONAL</div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                11v11 Clubs &amp; National Teams. 45-minute halves, full IFAB laws, authentic pro stadiums &amp; broadcast presentation.
              </p>
            </div>
            <div className="text-[11px] font-arcade text-blue-300 pt-2 border-t border-blue-500/30">
              SELECT CLUB / NATION →
            </div>
          </button>

          {/* 2. YOUTH LEAGUES / CUP / U17 */}
          <div className="p-4 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-b from-emerald-950/60 to-slate-950 flex flex-col justify-between gap-3 shadow-lg">
            <div className="space-y-2">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
                <Flame className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="font-arcade text-sm text-white font-black">YOUTH LEAGUES</div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                9 City Youth Academies (35m), Country-grouped Int&apos;l Youth Cup (Final 45m Pro stadium), &amp; U17 World Cup (45m).
              </p>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-emerald-500/30">
              <button
                type="button"
                onClick={() => {
                  setKickOffSubMode('youth');
                  setTeamSelectorBrowseMode('youth_leagues');
                  setIsModeSelectOpen(false);
                  setIsStartupTeamSelectOpen(true);
                  setAppFlow('team_selector');
                }}
                className="w-full min-h-[44px] px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade text-[10px] font-black cursor-pointer"
              >
                9 CITY YOUTH LEAGUES (35m)
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setKickOffSubMode('youth');
                    setTeamSelectorBrowseMode('intl_youth_cup');
                    setIsModeSelectOpen(false);
                    setIsStartupTeamSelectOpen(true);
                    setAppFlow('team_selector');
                  }}
                  className="min-h-[44px] px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-400/50 text-emerald-200 font-arcade text-[9px] cursor-pointer"
                >
                  INT&apos;L CUP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKickOffSubMode('youth');
                    setTeamSelectorBrowseMode('u17_world_cup');
                    setIsModeSelectOpen(false);
                    setIsStartupTeamSelectOpen(true);
                    setAppFlow('team_selector');
                  }}
                  className="min-h-[44px] px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-400/50 text-cyan-200 font-arcade text-[9px] cursor-pointer"
                >
                  U17 WORLD CUP
                </button>
              </div>
            </div>
          </div>

          {/* 3. STREET 7v7 */}
          <button
            type="button"
            onClick={() => {
              setKickOffSubMode('street');
              setIsModeSelectOpen(false);
              setIsStreetCitySelectOpen(true);
              setAppFlow('street_city_select');
            }}
            className="p-4 rounded-2xl border-2 border-lime-500/60 bg-gradient-to-b from-lime-950/50 to-slate-950 hover:border-lime-400 hover:from-lime-900/50 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-lg"
          >
            <div className="space-y-2">
              <div className="w-11 h-11 rounded-xl bg-lime-500/20 border border-lime-400/50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-lime-300" />
              </div>
              <div className="font-arcade text-sm text-white font-black">STREET 7v7</div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                Pick a city, draft a Top-15 Captain from the 3-card cinematic, rock Light vs Dark streetwear &amp; bounce off concrete walls!
              </p>
            </div>
            <div className="text-[11px] font-arcade text-lime-300 pt-2 border-t border-lime-500/30">
              CHOOSE STREET CITY (30m) →
            </div>
          </button>
        </div>
      </ConsoleModalShell>

      {/* STEP 2C OF KICK OFF: STREET 9 STARTING CITIES SELECTOR */}
      <ConsoleModalShell
        isOpen={isStreetCitySelectOpen && !isCareerRestricted}
        onClose={() => {
          setIsStreetCitySelectOpen(false);
          setIsModeSelectOpen(true);
          setAppFlow('mode_select');
        }}
        title="CHOOSE STREET CITY"
        subtitle="Each city draws 7v7 pickup talent from its local Youth, Div 1 & Div 2 pools"
        icon={<MapPin className="w-5 h-5 text-lime-400" />}
        accentColor="emerald"
        maxWidthClass="sm:max-w-3xl"
        bodyClassName="p-4 sm:p-5 bg-slate-900/95"
        footer={
          <button
            type="button"
            onClick={() => {
              setIsStreetCitySelectOpen(false);
              setIsModeSelectOpen(true);
              setAppFlow('mode_select');
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-arcade flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO MODES</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {Object.values(YOUTH_LEAGUES_DATABASE).map((yl) => (
            <button
              key={yl.id}
              type="button"
              onClick={() => launchStreetKickOffFlow(playerSlots, yl.id)}
              className={`min-h-[64px] p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                streetCityId === yl.id
                  ? 'bg-lime-950/60 border-lime-400 text-white shadow'
                  : 'bg-slate-950/80 border-slate-800 hover:border-lime-400/60 text-slate-200'
              }`}
            >
              <div className="min-w-0">
                <div className="font-bold text-xs truncate">
                  {yl.flag} {yl.city}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                  {yl.country} · Street Cage 7v7
                </div>
              </div>
              <span className="font-arcade text-[10px] text-lime-300 shrink-0">DRAFT →</span>
            </button>
          ))}
        </div>
      </ConsoleModalShell>

      {/* STEP 3 OF KICK OFF: TEAM SELECTION */}
      <TeamSelectorModal
        isOpen={isStartupTeamSelectOpen && !isCareerRestricted}
        side={startupTeamSide}
        currentTeamId={startupTeamSide === 'home' ? engine.homeTeam.id : engine.awayTeam.id}
        initialBrowseMode={teamSelectorBrowseMode}
        onSelectTeam={handleSelectTeamFromStartup}
        onSelectYouthMatchup={applyYouthMatchupToEngine}
        onSideChange={(s) => setStartupTeamSide(s)}
        onOpenTeamEditor={(teamId) => {
          setIsStartupTeamSelectOpen(false);
          setTeamEditorTargetId(teamId);
          setIsTeamEditorOpen(true);
        }}
        onLaunchStreetMode={() => {
          setIsStartupTeamSelectOpen(false);
          setIsStreetCitySelectOpen(true);
          setAppFlow('street_city_select');
        }}
        onChangeMode={() => {
          setIsStartupTeamSelectOpen(false);
          setIsModeSelectOpen(true);
          setAppFlow('mode_select');
        }}
        onClose={() => {
          setIsStartupTeamSelectOpen(false);
          setIsPresentationOpen(true);
          setAppFlow('presentation');
        }}
      />

      {/* STEP 3B OF STREET KICK OFF (HUMAN SIDES ONLY): TOP-15 CAPTAIN DRAW CINEMATIC */}
      <StreetCaptainDrawModal
        isOpen={isStreetCaptainDrawOpen && !isCareerRestricted}
        initialCityId={streetCityId}
        leagueDb={leagueDb}
        sequenceSides={humanStreetSides}
        onComplete={(drawResult) => {
          setStreetCityId(drawResult.cityId);
          const bundle = buildStreetGameplayTeams(drawResult.cityId, leagueDb, null, {
            homeControl: humanStreetSides.includes('home') ? 'player' : 'cpu',
            awayControl: humanStreetSides.includes('away') ? 'player' : 'cpu',
            homeCaptain: drawResult.homeCaptain || null,
            awayCaptain: drawResult.awayCaptain || null,
          });
          applyStreetBundleToEngine(bundle);
          setIsStreetCaptainDrawOpen(false);
          setIsPresentationOpen(true);
          setAppFlow('presentation');
        }}
        onCancel={() => {
          setIsStreetCaptainDrawOpen(false);
          setIsStreetCitySelectOpen(true);
          setAppFlow('street_city_select');
        }}
      />

      {/* STEP 4 OF KICK OFF (AND ENTRY FOR CAREER PRO KEY MATCH): PRE-MATCH PRESENTATION */}
      <PreMatchPresentationModal
        isOpen={isPresentationOpen}
        careerModeRestricted={isCareerRestricted}
        matchMode={engine.matchMode}
        displayedHalfMinutes={engine.displayedHalfMinutes}
        onClose={() => {
          setIsPresentationOpen(false);
          if (isCareerRestricted && matchTime === 0) {
            onExit();
          } else if (!isCareerRestricted && matchTime === 0 && score.home === 0 && score.away === 0 && appFlow !== 'in_match') {
            setStartupTeamSide('home');
            setIsStartupTeamSelectOpen(true);
            setAppFlow('team_selector');
          } else if (matchTime > 0 && matchPhase !== 'full_time') {
            engine.isPaused = true;
            setIsPaused(true);
          }
        }}
        onOpenMainMenu={onExit}
        onBackToTeamSelector={
          isCareerRestricted
            ? undefined
            : () => {
                setIsPresentationOpen(false);
                if (kickOffSubMode === 'street' && humanStreetSides.length > 0) {
                  setIsStreetCaptainDrawOpen(true);
                  setAppFlow('street_captain_draw');
                } else {
                  setStartupTeamSide('home');
                  setIsStartupTeamSelectOpen(true);
                  setAppFlow('team_selector');
                }
              }
        }
        onStartMatch={(config) => {
          handleStartMatch(config);
          setIsPresentationOpen(false);
        }}
        onOpenDetailedSettings={() => {
          if (isCareerRestricted) {
            setSettingsInitialTab('graphics');
            setIsUnifiedSettingsOpen(true);
            setIsPresentationOpen(false);
          } else {
            setIsPresentationOpen(false);
            setIsPreMatchOpen(true);
          }
        }}
        onOpenStadium={() => {
          setIsPresentationOpen(false);
          setIsStadiumOpen(true);
        }}
        onOpenGamePlan={() => {
          setIsPresentationOpen(false);
          setIsGamePlanOpen(true);
        }}
        onOpenSettings={() => {
          setIsPresentationOpen(false);
          setSettingsInitialTab('graphics');
          setIsUnifiedSettingsOpen(true);
        }}
        onSelectTeam={(side, selected) => {
          if (isCareerRestricted) return;
          engine.setTeam(side, selected);
          setControlledPlayer(engine.getControlledPlayer());
          if (side === 'home') {
            syncStadiumConfigFromEngine();
          }
        }}
        initialHomeTeamId={engine.homeTeam.id}
        initialAwayTeamId={engine.awayTeam.id}
        initialDifficulty={difficulty}
        initialHalfDuration={engine.halfDurationMinutes}
        stadiumConfig={stadiumConfig}
        competitionVenue={isCareerRestricted ? careerSetup?.competitionVenue : undefined}
        controlScope={isCareerRestricted ? 'single_player' : controlMode === 'one_player' ? 'single_player' : 'all_team'}
        initialLockedPlayerId={isCareerRestricted ? careerSetup?.lockedPlayerId : engine.lockedPlayerId || undefined}
        cursorSwitchMode={engine.cursorSwitchMode}
      />

      <TacticalGamePlanModal
        isOpen={isGamePlanOpen}
        readOnly={isCareerRestricted}
        onClose={() => {
          setIsGamePlanOpen(false);
          if (matchTime === 0 && score.home === 0 && score.away === 0) {
            setIsPresentationOpen(true);
          }
        }}
        initialHomeTeam={engine.homeTeam}
        initialAwayTeam={engine.awayTeam}
        initialHomeFormation={engine.homeFormation}
        initialAwayFormation={engine.awayFormation}
        initialHomePlaystyle={engine.homePlaystyle}
        initialAwayPlaystyle={engine.awayPlaystyle}
        initialHomeTactics={engine.homeTactics}
        initialAwayTactics={engine.awayTactics}
        initialHomeRoles={engine.homeTeam.roles}
        initialAwayRoles={engine.awayTeam.roles}
        onApplyGamePlan={(plan: GamePlanPayload) => {
          if (isCareerRestricted) return;
          engine.applyTacticalGamePlan(plan);
          setControlledPlayer(engine.getControlledPlayer());
          setBannerMessage(`GAME PLAN APPLIED: ${plan.homeFormation}`);
        }}
        isMidMatch={matchTime > 0 || score.home > 0 || score.away > 0}
      />

      <StadiumSelectorModal
        isOpen={isStadiumOpen}
        readOnly={isCareerRestricted}
        onClose={() => {
          setIsStadiumOpen(false);
          if (matchTime === 0 && score.home === 0 && score.away === 0) {
            setIsPresentationOpen(true);
          }
        }}
        config={stadiumConfig}
        onChangeConfig={handleUpdateStadiumConfig}
        homeTeam={engine.homeTeam}
        awayTeam={engine.awayTeam}
        onApplyAndClose={(cfg) => {
          if (!isCareerRestricted) handleUpdateStadiumConfig(cfg);
          setIsStadiumOpen(false);
          if (matchTime === 0 && score.home === 0 && score.away === 0) {
            setIsPresentationOpen(true);
          }
        }}
        onOpenStadiumCreator={(std) => {
          if (isCareerRestricted) return;
          setIsStadiumOpen(false);
          setStadiumCreatorInitial(std || engine.activeStadium);
          setIsStadiumCreatorOpen(true);
        }}
      />

      <StadiumCreatorModal
        isOpen={isStadiumCreatorOpen && !isCareerRestricted}
        onClose={() => {
          setIsStadiumCreatorOpen(false);
          if (matchTime === 0 && score.home === 0 && score.away === 0) {
            setIsPresentationOpen(true);
          }
        }}
        onSaveStadium={(savedStadium) => {
          engine.applyStadium(savedStadium, false);
          syncStadiumConfigFromEngine();
        }}
        onTestMatchday={(testStadium) => {
          engine.applyStadium(testStadium, false);
          syncStadiumConfigFromEngine();
          setIsStadiumCreatorOpen(false);
          handleStartMatch({
            difficulty,
            halfDurationMinutes: engine.halfDurationMinutes,
            controlScope: controlMode === 'one_player' ? 'single_player' : 'all_team',
            lockedPlayerId: engine.lockedPlayerId || undefined,
            homeFormation: engine.homeFormation,
            awayFormation: engine.awayFormation,
            homePlaystyle: engine.homePlaystyle,
            awayPlaystyle: engine.awayPlaystyle,
            stadiumTier: engine.stadiumTier,
            timeOfDay: engine.timeOfDay,
            seatColor: engine.seatColor,
            pitchPreset: engine.pitchPreset,
            pitchLengthMeters: engine.pitchLengthMeters,
            pitchWidthMeters: engine.pitchWidthMeters,
            turfQuality: engine.turfQuality,
            grassLength: engine.grassLength,
            weather: engine.weather,
            season: engine.season,
            netTension: engine.netTension,
            goalFrame: engine.goalFrame,
            homeTeamId: engine.homeTeam.id,
            awayTeamId: engine.awayTeam.id,
          });
        }}
        initialStadium={stadiumCreatorInitial || engine.activeStadium}
      />

      <TeamEditorModal
        isOpen={isTeamEditorOpen && !isCareerRestricted}
        initialTeamId={teamEditorTargetId || engine.homeTeam.id}
        onClose={() => {
          setIsTeamEditorOpen(false);
          if (matchTime === 0 && score.home === 0 && score.away === 0) {
            setIsPresentationOpen(true);
          }
        }}
        onSaveTeam={(updatedTeam) => {
          if (engine.homeTeam.id === updatedTeam.id) {
            engine.setTeam('home', updatedTeam);
            syncStadiumConfigFromEngine();
          } else if (engine.awayTeam.id === updatedTeam.id) {
            engine.setTeam('away', updatedTeam);
          }
        }}
        onTestMatchday={(testTeam) => {
          engine.setTeam('home', testTeam);
          syncStadiumConfigFromEngine();
          setIsTeamEditorOpen(false);
          handleStartMatch({
            difficulty,
            halfDurationMinutes: engine.halfDurationMinutes,
            controlScope: controlMode === 'one_player' ? 'single_player' : 'all_team',
            lockedPlayerId: engine.lockedPlayerId || undefined,
            homeFormation: engine.homeFormation,
            awayFormation: engine.awayFormation,
            homePlaystyle: engine.homePlaystyle,
            awayPlaystyle: engine.awayPlaystyle,
            stadiumTier: engine.stadiumTier,
            timeOfDay: engine.timeOfDay,
            seatColor: engine.seatColor,
            pitchPreset: engine.pitchPreset,
            pitchLengthMeters: engine.pitchLengthMeters,
            pitchWidthMeters: engine.pitchWidthMeters,
            turfQuality: engine.turfQuality,
            grassLength: engine.grassLength,
            weather: engine.weather,
            season: engine.season,
            netTension: engine.netTension,
            goalFrame: engine.goalFrame,
            homeTeamId: engine.homeTeam.id,
            awayTeamId: engine.awayTeam.id,
          });
        }}
      />

      <UnifiedSettingsModal
        isOpen={isUnifiedSettingsOpen}
        onClose={() => {
          setIsUnifiedSettingsOpen(false);
          if (matchTime === 0 && score.home === 0 && score.away === 0 && !isPaused && matchPhase !== 'full_time') {
            setIsPresentationOpen(true);
          }
        }}
        graphicsSettings={graphicsSettings}
        onChangeGraphicsSettings={handleGraphicsSettingsChange}
        controlMode={controlMode}
        onChangeControlMode={handleControlModeChange}
        controllerCustomization={controllerCustomization}
        onChangeControllerCustomization={(c) => { setControllerCustomization(c); saveControllerCustomization(c); }}
        keyBindings={keyBindings}
        onChangeKeyBindings={(b) => { setKeyBindings(b); saveKeyBindings(b); }}
        gamepadBindings={gamepadBindings}
        onChangeGamepadBindings={(b) => { setGamepadBindings(b); saveGamepadBindings(b); }}
        isGamepadConnected={isGamepadConnected}
        gamepadName={gamepadName}
        controllerBgMode={controllerBgMode}
        onChangeControllerBgMode={setControllerBgMode}
        controllerTheme={controllerTheme}
        onChangeControllerTheme={setControllerTheme}
        halfDuration={engine.halfDurationMinutes}
        onChangeHalfDuration={(d) => { engine.halfDurationMinutes = d; }}
        gameSpeed={gameSpeed}
        onChangeGameSpeed={(s) => { engine.gameSpeed = s; setGameSpeed(s); }}
        powerBarSpeed={powerBarSpeed}
        onChangePowerBarSpeed={(p) => { engine.powerBarSpeedPct = p; setPowerBarSpeed(p); }}
        difficulty={difficulty}
        onChangeDifficulty={(d) => { engine.difficulty = d; setDifficulty(d); }}
        scoreboardMode={scoreboardMode}
        onChangeScoreboardMode={setScoreboardMode}
        specialActionTextMode={specialActionTextMode}
        onChangeSpecialActionTextMode={setSpecialActionTextMode}
        playerInfoMode={playerInfoMode}
        onChangePlayerInfoMode={setPlayerInfoMode}
        playerIndicatorType={playerIndicatorType}
        onChangePlayerIndicatorType={setPlayerIndicatorType}
        playerIndicatorStyle={playerIndicatorStyle}
        onChangePlayerIndicatorStyle={setPlayerIndicatorStyle}
        minimapMode={minimapMode}
        onChangeMinimapMode={setMinimapMode}
        minimapSonar={minimapSonar}
        onChangeMinimapSonar={setMinimapSonar}
        radarZoom={radarZoom}
        onChangeRadarZoom={setRadarZoom}
        debugExecutionOverlay={debugExecutionOverlay}
        onChangeDebugExecutionOverlay={(e) => { engine.debugExecutionOverlay = e; setDebugExecutionOverlay(e); saveDebugExecutionOverlay(e); }}
        manualAimArrowVisible={Boolean(aimArrowSlot?.manualAimArrow)}
        manualAimArrowAvailable={aimArrowSlot?.device === 'keyboard'}
        onChangeManualAimArrowVisible={(enabled) => {
          if (!aimArrowSlot) return;
          const nextSlots = playerSlots.map(s => s.id === aimArrowSlot.id ? { ...s, manualAimArrow: enabled } : s);
          engine.setPlayerSlots(nextSlots);
          setPlayerSlots(nextSlots);
          saveAssistModes(nextSlots);
        }}
        initialTab={settingsInitialTab}
      />
    </div>
  );
};
