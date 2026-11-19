import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gamepad2,
  HelpCircle,
  Info,
  Keyboard,
  Lock,
  Plus,
  Shield,
  Smartphone,
  Trash2,
  Tv,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  AssistMode,
  AssistProfile,
  AssistAction,
  ControlScope,
  CursorSwitchMode,
  CustomKeyBindings,
  DEFAULT_KEY_BINDINGS_1P,
  DEFAULT_KEY_BINDINGS_2P,
  DEFAULT_KEY_BINDINGS_3P,
  DEFAULT_KEY_BINDINGS_4P,
  DEFAULT_KEY_BINDINGS_WASD,
  DEFAULT_PLAYER_SLOTS,
  Player,
  PlayerSlotConfig,
  TeamSide,
} from '../types';
import { loadAssistModes, saveAssistModes } from '../game/controllerConfig';
import { ConsoleModalShell } from '../../components/common/ConsolePager';

interface SlotVisualMeta {
  name: string;
  color: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  defaultBindingsArrows: CustomKeyBindings;
  defaultBindingsWasd: CustomKeyBindings;
}

const SLOT_META: SlotVisualMeta[] = [
  {
    name: '1P',
    color: '#38bdf8',
    borderClass: 'border-sky-400',
    bgClass: 'bg-sky-500/20',
    textClass: 'text-sky-400',
    defaultBindingsArrows: DEFAULT_KEY_BINDINGS_1P,
    defaultBindingsWasd: DEFAULT_KEY_BINDINGS_WASD,
  },
  {
    name: '2P',
    color: '#f59e0b',
    borderClass: 'border-amber-400',
    bgClass: 'bg-amber-500/20',
    textClass: 'text-amber-400',
    defaultBindingsArrows: DEFAULT_KEY_BINDINGS_2P,
    defaultBindingsWasd: DEFAULT_KEY_BINDINGS_2P,
  },
  {
    name: '3P',
    color: '#10b981',
    borderClass: 'border-emerald-400',
    bgClass: 'bg-emerald-500/20',
    textClass: 'text-emerald-400',
    defaultBindingsArrows: DEFAULT_KEY_BINDINGS_3P,
    defaultBindingsWasd: DEFAULT_KEY_BINDINGS_3P,
  },
  {
    name: '4P',
    color: '#c084fc',
    borderClass: 'border-purple-400',
    bgClass: 'bg-purple-500/20',
    textClass: 'text-purple-400',
    defaultBindingsArrows: DEFAULT_KEY_BINDINGS_4P,
    defaultBindingsWasd: DEFAULT_KEY_BINDINGS_4P,
  },
];

interface SideSelectModalProps {
  isOpen: boolean;
  onConfirm: (
    players: PlayerSlotConfig[],
    controlScope: ControlScope,
    lockedPlayerId: string,
    cursorSwitchMode: CursorSwitchMode
  ) => void;
  onClose?: () => void;
  initialPlayers?: PlayerSlotConfig[];
  isMidMatch?: boolean;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamBadge?: string;
  awayTeamBadge?: string;
  homePlayers?: Player[];
  awayPlayers?: Player[];
  initialControlScope?: ControlScope;
  initialLockedPlayerId?: string;
  initialCursorSwitchMode?: CursorSwitchMode;
}

export const SideSelectModal: React.FC<SideSelectModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  initialPlayers = DEFAULT_PLAYER_SLOTS,
  isMidMatch = false,
  homeTeamName = 'HOME TEAM',
  awayTeamName = 'AWAY TEAM',
  homeTeamBadge,
  awayTeamBadge,
  homePlayers = [],
  awayPlayers = [],
  initialControlScope = 'all_team',
  initialLockedPlayerId,
  initialCursorSwitchMode = 'manual',
}) => {
  const [players, setPlayers] = useState<PlayerSlotConfig[]>(() =>
    initialPlayers && initialPlayers.length > 0 ? initialPlayers : DEFAULT_PLAYER_SLOTS
  );
  const [controlScope, setControlScope] = useState<ControlScope>(initialControlScope);
  const [lockedPlayerId, setLockedPlayerId] = useState<string>(
    () =>
      initialLockedPlayerId ||
      (homePlayers.find((p) => p.role === 'ST1' || p.role === 'ST2' || p.role === 'CM1') || homePlayers[0])?.id ||
      'home_ST1'
  );
  const [cursorSwitchMode, setCursorSwitchMode] = useState<CursorSwitchMode>(initialCursorSwitchMode);
  const [gamepadCount, setGamepadCount] = useState(0);
  const [openKeyGuideId, setOpenKeyGuideId] = useState<number | null>(null);
  const [mobileSection, setMobileSection] = useState<'sides' | 'scope'>('sides');
  const [mobileSideFilter, setMobileSideFilter] = useState<TeamSide | 'spectator'>('home');

  useEffect(() => {
    if (isOpen) {
      const stored = loadAssistModes();
      if (initialPlayers && initialPlayers.length > 0) {
        setPlayers(initialPlayers.map((p) => ({
          ...p,
          assistMode: p.assistMode || stored.slots[p.id] || 'assisted',
          actionAssistModes: p.actionAssistModes || stored.actions[p.id],
          manualAimArrow: p.manualAimArrow ?? stored.arrows[p.id] ?? (p.assistMode === 'manual'),
        })));
      }
      setControlScope(initialControlScope || 'all_team');
      if (initialLockedPlayerId) setLockedPlayerId(initialLockedPlayerId);
      setCursorSwitchMode(initialCursorSwitchMode || 'manual');
    }
  }, [isOpen, initialPlayers, initialControlScope, initialLockedPlayerId, initialCursorSwitchMode]);

  useEffect(() => {
    if (!isOpen) return;
    const scanGamepads = () => {
      try {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        let count = 0;
        for (const pad of pads) {
          if (pad && pad.connected) count++;
        }
        setGamepadCount(count);
      } catch {
        // ignore gamepad probe errors
      }
    };
    scanGamepads();
    const timer = setInterval(scanGamepads, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const moveSide = (playerId: number, side: TeamSide | 'spectator') => {
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, side } : p)));
  };

  const cycleSide = (playerId: number, dir: 'left' | 'right') => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p;
        const order: Array<TeamSide | 'spectator'> = ['home', 'spectator', 'away'];
        const curIdx = order.indexOf(p.side);
        let nextIdx = dir === 'left' ? curIdx - 1 : curIdx + 1;
        if (nextIdx < 0) nextIdx = 0;
        if (nextIdx > 2) nextIdx = 2;
        return { ...p, side: order[nextIdx] };
      })
    );
  };

  const changeDevice = (
    playerId: number,
    device: 'keyboard' | 'gamepad' | 'touch',
    keyboardPreset: 'arrows' | 'wasd' = 'arrows'
  ) => {
    setPlayers((prev) => {
      if (device === 'touch' && prev.some((p) => p.id !== playerId && p.device === 'touch')) {
        return prev;
      }
      return prev.map((p) => {
        if (p.id !== playerId) return p;
        let gpIdx = p.gamepadIndex ?? 0;
        if (device === 'gamepad') {
          const used = prev
            .filter((other) => other.id !== playerId && other.device === 'gamepad')
            .map((other) => other.gamepadIndex ?? 0);
          for (let i = 0; i < 4; i++) {
            if (!used.includes(i)) {
              gpIdx = i;
              break;
            }
          }
        }
        const meta = SLOT_META[p.id - 1] || SLOT_META[0];
        const keyBindings =
          device === 'keyboard'
            ? keyboardPreset === 'wasd'
              ? meta.defaultBindingsWasd
              : meta.defaultBindingsArrows
            : p.keyBindings;
        return { ...p, device, keyboardPreset, gamepadIndex: gpIdx, keyBindings };
      });
    });
  };

  const handleAddPlayer = () => {
    if (players.length >= 4) return;
    const nextId = players.length + 1;
    const meta = SLOT_META[nextId - 1] || SLOT_META[0];
    let device: 'keyboard' | 'gamepad' = 'keyboard';
    const padUsers = players.filter((p) => p.device === 'gamepad').length;
    if (gamepadCount > padUsers) device = 'gamepad';
    let side: TeamSide | 'spectator' = 'away';
    if (players.length === 1 && players[0].side === 'home') side = 'away';
    else if (players.length === 2) side = 'home';

    const stored = loadAssistModes();
    const newSlot: PlayerSlotConfig = {
      id: nextId,
      name: meta.name,
      side,
      device,
      keyboardPreset: 'arrows',
      gamepadIndex: padUsers,
      color: meta.color,
      keyBindings: meta.defaultBindingsArrows,
      controlScope,
      cursorSwitchMode,
      assistMode: stored.slots[nextId] || 'assisted',
      actionAssistModes: stored.actions[nextId],
      manualAimArrow: stored.arrows[nextId] ?? false,
    };
    setPlayers((prev) => [...prev, newSlot]);
  };

  const changeAssistMode = (playerId: number, assistMode: AssistProfile) => {
    setPlayers((prev) => prev.map((p) => (p.id !== playerId ? p : {
      ...p,
      assistMode,
      manualAimArrow: assistMode === p.assistMode ? p.manualAimArrow : assistMode === 'manual' ? true : assistMode === 'assisted' || assistMode === 'semi' ? false : p.manualAimArrow,
    })));
  };
  const changeActionAssistMode = (playerId: number, action: AssistAction, mode: AssistMode) => {
    setPlayers((prev) => prev.map((p) => p.id === playerId ? {
      ...p,
      actionAssistModes: { shortPass: 'assisted', longPass: 'assisted', cross: 'assisted', shoot: 'assisted', tackling: 'assisted', interception: 'assisted', ...(p.actionAssistModes || {}), [action]: mode },
      manualAimArrow: mode === 'manual' ? true : p.manualAimArrow,
    } : p));
  };
  const toggleManualAimArrow = (playerId: number) => {
    setPlayers((prev) => prev.map((p) => p.id === playerId ? { ...p, manualAimArrow: !p.manualAimArrow } : p));
  };

  const handleRemovePlayer = (playerId: number) => {
    if (players.length <= 1) return;
    setPlayers((prev) =>
      prev
        .filter((p) => p.id !== playerId)
        .map((p, idx) => ({
          ...p,
          id: idx + 1,
          name: `${idx + 1}P`,
          color: SLOT_META[idx].color,
          keyBindings: p.keyBindings || SLOT_META[idx].defaultBindingsArrows,
        }))
    );
  };

  const homeCount = players.filter((p) => p.side === 'home').length;
  const awayCount = players.filter((p) => p.side === 'away').length;
  const specCount = players.filter((p) => p.side === 'spectator').length;

  const modeSummary = useMemo(() => {
    if (homeCount === 0 && awayCount === 0) {
      return '📺 SPECTATOR SIMULATION: CPU VS CPU (AUTONOMOUS MATCH)';
    }
    if (homeCount > 0 && awayCount > 0) {
      return `⚔️ LOCAL MULTIPLAYER: HOME (${homeCount}P) VS AWAY (${awayCount}P)`;
    }
    if (homeCount > 0 && awayCount === 0) {
      return `🕹️ SINGLE / CO-OP: HOME (${homeCount}P) VS CPU (AWAY)`;
    }
    return `🕹️ SINGLE / CO-OP: CPU (HOME) VS AWAY (${awayCount}P)`;
  }, [homeCount, awayCount]);

  const touchCount = players.filter((p) => p.device === 'touch').length;
  const lockRoster = useMemo(() => {
    const p1 = players.find((p) => p.id === 1);
    return p1 && p1.side === 'away' ? awayPlayers : homePlayers;
  }, [players, homePlayers, awayPlayers]);

  const handleConfirm = () => {
    const configured = players.map((p) => ({
      ...p,
      controlScope,
      lockedPlayerId: controlScope === 'single_player' ? lockedPlayerId : undefined,
      cursorSwitchMode: controlScope === 'all_team' ? cursorSwitchMode : undefined,
      assistMode: p.assistMode || 'assisted',
      manualAimArrow: p.manualAimArrow ?? (p.assistMode === 'manual'),
    }));
    saveAssistModes(configured);
    onConfirm(configured, controlScope, lockedPlayerId, cursorSwitchMode);
  };

  if (!isOpen) return null;

  return (
    <ConsoleModalShell
      id="side-select-modal"
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={Boolean(onClose)}
      title="SELECT SIDE & CONTROLLER"
      subtitle="Controller bindings · Control scope · Cursor switching"
      icon={<Gamepad2 className="w-5 h-5 text-sky-400" />}
      accentColor="blue"
      maxWidthClass="sm:max-w-5xl"
      headerRight={
        <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700 hidden sm:inline">
          🎮 {gamepadCount} PAD{gamepadCount !== 1 ? 'S' : ''}
        </span>
      }
      bodyClassName="flex flex-col min-h-0 bg-slate-950/80"
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <button
              type="button"
              onClick={handleAddPlayer}
              disabled={players.length >= 4}
              className={`min-h-[44px] px-3 py-2 text-[10px] font-arcade rounded-xl border flex items-center gap-2 transition-all ${
                players.length < 4
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-500/40 hover:border-amber-400 cursor-pointer active:scale-95'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-60'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>ADD ({players.length}/4)</span>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline font-mono">
              Instant binding: Arrows, WASD, Joypads & Touchpad
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isMidMatch && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[46px] px-4 py-2 text-xs font-mono text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                CANCEL
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none min-h-[46px] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-arcade text-xs rounded-xl font-black shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>CONFIRM SIDES</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Mode Summary Banner */}
      <div className="bg-sky-950/70 border-b border-sky-500/30 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 text-xs text-sky-100 min-w-0">
          <span className="font-arcade text-[10px] text-amber-400 shrink-0">MODE:</span>
          <span className="font-bold tracking-wide truncate">{modeSummary}</span>
        </div>
        <div className="text-[11px] font-mono text-slate-300 shrink-0 hidden md:block">
          {players.length} / 4 CONTROLLERS
        </div>
      </div>

      {/* Mobile 2-Page Console Tabs (< md) */}
      <div className="md:hidden grid grid-cols-2 gap-2 p-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => setMobileSection('sides')}
          className={`min-h-[44px] px-2.5 rounded-lg font-arcade text-[10px] uppercase font-bold transition-all cursor-pointer ${
            mobileSection === 'sides'
              ? 'bg-sky-500 text-slate-950 shadow'
              : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          1. PLAYERS & SIDES
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('scope')}
          className={`min-h-[44px] px-2.5 rounded-lg font-arcade text-[10px] uppercase font-bold transition-all cursor-pointer ${
            mobileSection === 'scope'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          2. SCOPE & CURSOR
        </button>
      </div>

      {/* Scope & Cursor Settings Bar (Always shown on md+, Paged Page 2 on < md) */}
      <div
        className={`${
          mobileSection === 'scope' ? 'flex' : 'hidden md:flex'
        } bg-slate-950 border-b border-slate-800 px-3 sm:px-4 py-3 shrink-0 flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-3 text-xs`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-arcade text-[10px] text-amber-400 uppercase shrink-0">CONTROL SCOPE:</span>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setControlScope('all_team')}
              className={`min-h-[44px] px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                controlScope === 'all_team'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Controls ball carrier and switches between outfield players"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>ALL TEAM</span>
            </button>
            <button
              type="button"
              onClick={() => setControlScope('single_player')}
              className={`min-h-[44px] px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                controlScope === 'single_player'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Locks user control onto a single designated player for the entire match"
            >
              <User className="w-4 h-4 shrink-0" />
              <span>SINGLE PLAYER</span>
            </button>
          </div>
        </div>

        {controlScope === 'all_team' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-arcade text-[10px] text-emerald-400 uppercase shrink-0">CURSOR SWITCHING:</span>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setCursorSwitchMode('manual')}
                className={`min-h-[44px] px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cursorSwitchMode === 'manual'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>MANUAL</span>
              </button>
              <button
                type="button"
                onClick={() => setCursorSwitchMode('automatic')}
                className={`min-h-[44px] px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cursorSwitchMode === 'automatic'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 shrink-0" />
                <span>AUTOMATIC</span>
              </button>
            </div>
          </div>
        )}

        {controlScope === 'single_player' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-arcade text-[10px] text-cyan-400 flex items-center gap-1 uppercase shrink-0">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>LOCKED ATHLETE:</span>
            </span>
            <select
              value={lockedPlayerId}
              onChange={(e) => setLockedPlayerId(e.target.value)}
              className="min-h-[44px] bg-slate-900 border border-cyan-500/60 rounded-lg px-3 py-2 text-xs text-cyan-200 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer w-full sm:w-auto sm:max-w-[220px]"
            >
              {lockRoster.length > 0 ? (
                lockRoster.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    #{p.number} {p.name.toUpperCase()} ({p.subPos || p.role})
                  </option>
                ))
              ) : (
                <>
                  <option value="home_ST1">#10 ATTACKER (ST)</option>
                  <option value="home_CM1">#8 MIDFIELDER (CM)</option>
                  <option value="home_CB1">#4 DEFENDER (CB)</option>
                  <option value="home_GK">#1 GOALKEEPER (GK)</option>
                </>
              )}
            </select>
          </div>
        )}

        {controlScope === 'all_team' && (
          <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-2 rounded-lg border border-slate-800">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>3m Proximity Guard active · Double-Tap Switch overrides</span>
          </div>
        )}
      </div>

      {/* Mobile Side Tab Selector (< md) inside Players & Sides tab */}
      {mobileSection === 'sides' && (
        <div className="md:hidden grid grid-cols-3 gap-1.5 px-2.5 pt-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSideFilter('home')}
            className={`min-h-[44px] px-2 rounded-lg border font-arcade text-[10px] uppercase transition-all cursor-pointer ${
              mobileSideFilter === 'home'
                ? 'bg-sky-500 text-slate-950 border-sky-300 font-black'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            HOME ({homeCount})
          </button>
          <button
            type="button"
            onClick={() => setMobileSideFilter('spectator')}
            className={`min-h-[44px] px-2 rounded-lg border font-arcade text-[10px] uppercase transition-all cursor-pointer ${
              mobileSideFilter === 'spectator'
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            SPEC ({specCount})
          </button>
          <button
            type="button"
            onClick={() => setMobileSideFilter('away')}
            className={`min-h-[44px] px-2 rounded-lg border font-arcade text-[10px] uppercase transition-all cursor-pointer ${
              mobileSideFilter === 'away'
                ? 'bg-rose-500 text-white border-rose-300 font-black'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            AWAY ({awayCount})
          </button>
        </div>
      )}

      {/* 3-Column Team Columns (or filtered active column on < md) */}
      <div
        className={`${
          mobileSection === 'sides' ? 'grid' : 'hidden md:grid'
        } flex-1 min-h-0 grid-cols-1 md:grid-cols-3 gap-2.5 p-2.5 sm:p-3 overflow-y-auto`}
      >
        {/* HOME COLUMN */}
        <div
          onClick={() => {
            if (players[0]) moveSide(players[0].id, 'home');
          }}
          className={`${
            mobileSideFilter === 'home' ? 'flex' : 'hidden md:flex'
          } flex-col rounded-xl border-2 transition-all p-2.5 bg-gradient-to-b from-sky-950/40 to-slate-900/60 min-h-[220px] ${
            homeCount > 0 ? 'border-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-sky-500/30 pb-2 mb-2 shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{homeTeamBadge || '🔵'}</span>
              <div className="min-w-0">
                <div className="font-arcade text-[10px] text-sky-400">HOME</div>
                <div className="text-xs font-bold text-white truncate">{homeTeamName}</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/40 shrink-0">
              {homeCount}P
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto min-h-[120px]">
            {players.filter((p) => p.side === 'home').length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-lg text-slate-400">
                <Shield className="w-8 h-8 text-slate-600 mb-1" />
                <span className="text-xs font-bold uppercase">CPU AUTONOMOUS AI</span>
                <span className="text-xs text-slate-500 mt-1">Tap to assign P1 to Home</span>
              </div>
            ) : (
              players
                .filter((p) => p.side === 'home')
                .map((p) => (
                  <PlayerSlotCard
                    key={p.id}
                    player={p}
                    onCycleSide={cycleSide}
                    onMoveSide={moveSide}
                    onChangeDevice={changeDevice}
                    onChangeAssistMode={changeAssistMode}
                    onChangeActionAssistMode={changeActionAssistMode}
                    onToggleManualAimArrow={toggleManualAimArrow}
                    onRemovePlayer={handleRemovePlayer}
                    canRemove={players.length > 1}
                    touchDisabled={touchCount >= 1 && p.device !== 'touch'}
                    onShowKeyGuide={() => setOpenKeyGuideId(openKeyGuideId === p.id ? null : p.id)}
                    isKeyGuideOpen={openKeyGuideId === p.id}
                  />
                ))
            )}
          </div>
        </div>

        {/* SPECTATOR COLUMN */}
        <div
          onClick={() => {
            if (players[0]) moveSide(players[0].id, 'spectator');
          }}
          className={`${
            mobileSideFilter === 'spectator' ? 'flex' : 'hidden md:flex'
          } flex-col rounded-xl border-2 transition-all p-2.5 bg-gradient-to-b from-slate-900/80 to-slate-950 min-h-[220px] ${
            specCount > 0 ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 mb-2 shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Tv className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="font-arcade text-[10px] text-amber-400">SPECTATOR</div>
                <div className="text-xs font-bold text-white truncate">CPU VS CPU</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 shrink-0">
              {specCount} IDLE
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto min-h-[120px]">
            {players.filter((p) => p.side === 'spectator').length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-lg text-slate-400">
                <Eye className="w-8 h-8 text-slate-600 mb-1" />
                <span className="text-xs font-bold uppercase">NO CONTROLLERS SITTING OUT</span>
                <span className="text-xs text-slate-500 mt-1">Tap to watch CPU play autonomously</span>
              </div>
            ) : (
              players
                .filter((p) => p.side === 'spectator')
                .map((p) => (
                  <PlayerSlotCard
                    key={p.id}
                    player={p}
                    onCycleSide={cycleSide}
                    onMoveSide={moveSide}
                    onChangeDevice={changeDevice}
                    onChangeAssistMode={changeAssistMode}
                    onChangeActionAssistMode={changeActionAssistMode}
                    onToggleManualAimArrow={toggleManualAimArrow}
                    onRemovePlayer={handleRemovePlayer}
                    canRemove={players.length > 1}
                    touchDisabled={touchCount >= 1 && p.device !== 'touch'}
                    onShowKeyGuide={() => setOpenKeyGuideId(openKeyGuideId === p.id ? null : p.id)}
                    isKeyGuideOpen={openKeyGuideId === p.id}
                  />
                ))
            )}
          </div>
        </div>

        {/* AWAY COLUMN */}
        <div
          onClick={() => {
            if (players[0]) moveSide(players[0].id, 'away');
          }}
          className={`${
            mobileSideFilter === 'away' ? 'flex' : 'hidden md:flex'
          } flex-col rounded-xl border-2 transition-all p-2.5 bg-gradient-to-b from-rose-950/40 to-slate-900/60 min-h-[220px] ${
            awayCount > 0 ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2 mb-2 shrink-0 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{awayTeamBadge || '🔴'}</span>
              <div className="min-w-0">
                <div className="font-arcade text-[10px] text-rose-400">AWAY</div>
                <div className="text-xs font-bold text-white truncate">{awayTeamName}</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40 shrink-0">
              {awayCount}P
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto min-h-[120px]">
            {players.filter((p) => p.side === 'away').length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-lg text-slate-400">
                <Shield className="w-8 h-8 text-slate-600 mb-1" />
                <span className="text-xs font-bold uppercase">CPU AUTONOMOUS AI</span>
                <span className="text-xs text-slate-500 mt-1">Tap to assign P1 to Away</span>
              </div>
            ) : (
              players
                .filter((p) => p.side === 'away')
                .map((p) => (
                  <PlayerSlotCard
                    key={p.id}
                    player={p}
                    onCycleSide={cycleSide}
                    onMoveSide={moveSide}
                    onChangeDevice={changeDevice}
                    onChangeAssistMode={changeAssistMode}
                    onChangeActionAssistMode={changeActionAssistMode}
                    onToggleManualAimArrow={toggleManualAimArrow}
                    onRemovePlayer={handleRemovePlayer}
                    canRemove={players.length > 1}
                    touchDisabled={touchCount >= 1 && p.device !== 'touch'}
                    onShowKeyGuide={() => setOpenKeyGuideId(openKeyGuideId === p.id ? null : p.id)}
                    isKeyGuideOpen={openKeyGuideId === p.id}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </ConsoleModalShell>
  );
};

interface PlayerSlotCardProps {
  player: PlayerSlotConfig;
  onCycleSide: (playerId: number, dir: 'left' | 'right') => void;
  onMoveSide: (playerId: number, side: TeamSide | 'spectator') => void;
  onChangeDevice: (playerId: number, device: 'keyboard' | 'gamepad' | 'touch', preset?: 'arrows' | 'wasd') => void;
  onChangeAssistMode: (playerId: number, assistMode: AssistProfile) => void;
  onChangeActionAssistMode: (playerId: number, action: AssistAction, mode: AssistMode) => void;
  onToggleManualAimArrow: (playerId: number) => void;
  onRemovePlayer: (playerId: number) => void;
  canRemove: boolean;
  touchDisabled: boolean;
  onShowKeyGuide: () => void;
  isKeyGuideOpen: boolean;
}

const PlayerSlotCard: React.FC<PlayerSlotCardProps> = ({
  player,
  onMoveSide,
  onChangeDevice,
  onChangeAssistMode,
  onChangeActionAssistMode,
  onToggleManualAimArrow,
  onRemovePlayer,
  canRemove,
  touchDisabled,
  onShowKeyGuide,
  isKeyGuideOpen,
}) => {
  const meta = SLOT_META[player.id - 1] || SLOT_META[0];
  const kbPreset = player.keyboardPreset || 'arrows';
  const assistMode: AssistProfile = player.assistMode || 'assisted';

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`relative p-2.5 rounded-xl border-2 transition-all shadow-md bg-slate-900/95 ${meta.borderClass}`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-arcade text-xs font-bold shadow shrink-0"
            style={{ backgroundColor: player.color, color: '#07131e' }}
          >
            {player.name}
          </div>
          <div className="leading-tight min-w-0">
            <span className="font-bold text-xs text-white uppercase truncate block">{player.name} CONTROLLER</span>
            <div className="text-[11px] text-slate-300 capitalize truncate">
              {player.side === 'spectator' ? 'Sitting Out (Spectator)' : `${player.side} Team`}
            </div>
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemovePlayer(player.id)}
            aria-label="Remove Player"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Remove Player"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Side Selector Buttons >=44px */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 mb-2">
        <button
          type="button"
          onClick={() => onMoveSide(player.id, 'home')}
          className={`min-h-[44px] rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            player.side === 'home' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>HOME</span>
        </button>
        <button
          type="button"
          onClick={() => onMoveSide(player.id, 'spectator')}
          className={`min-h-[44px] rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            player.side === 'spectator' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>SPEC</span>
        </button>
        <button
          type="button"
          onClick={() => onMoveSide(player.id, 'away')}
          className={`min-h-[44px] rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            player.side === 'away' ? 'bg-rose-500 text-white shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>AWAY</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Input Device Picker (grid-cols-2 sm:grid-cols-4 with >=44px targets) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono bg-slate-950/70 p-1 rounded-lg border border-slate-800 mb-2">
        <button
          type="button"
          onClick={() => onChangeDevice(player.id, 'keyboard', 'arrows')}
          className={`min-h-[44px] px-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
            player.device === 'keyboard' && kbPreset === 'arrows'
              ? 'bg-sky-500 text-slate-950 font-bold shadow'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Move: Arrow keys · Actions: S, A, W, D"
        >
          <Keyboard className="w-3.5 h-3.5 shrink-0" />
          <span>ARROWS</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeDevice(player.id, 'keyboard', 'wasd')}
          className={`min-h-[44px] px-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
            player.device === 'keyboard' && kbPreset === 'wasd'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Move: W, A, S, D · Actions: J, K, I, L"
        >
          <Keyboard className="w-3.5 h-3.5 shrink-0" />
          <span>WASD</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeDevice(player.id, 'gamepad')}
          className={`min-h-[44px] px-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
            player.device === 'gamepad' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
          <span>JOY #{(player.gamepadIndex ?? 0) + 1}</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeDevice(player.id, 'touch')}
          disabled={touchDisabled}
          title={touchDisabled ? 'Touchscreen restricted to 1 player maximum' : 'Touchscreen virtual buttons'}
          className={`min-h-[44px] px-1 rounded flex items-center justify-center gap-1 transition-all ${
            player.device === 'touch'
              ? 'bg-purple-500 text-white font-bold shadow cursor-pointer'
              : touchDisabled
              ? 'opacity-40 text-slate-600 cursor-not-allowed'
              : 'text-slate-300 hover:text-white cursor-pointer'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span>TOUCH</span>
        </button>
      </div>

      {/* Action Assist Profile Selector */}
      <div className="mb-2 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between px-1 mb-1.5 gap-1">
          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">GAMEPLAY ASSIST</span>
          <span className="text-[10px] font-mono text-slate-300 truncate">
            {assistMode === 'custom' ? 'Per-action settings' : assistMode === 'assisted' ? 'Aim + Weight Help' : assistMode === 'semi' ? 'Aim Help · Raw Power' : 'Full Raw'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
          {(['assisted', 'semi', 'manual', 'custom'] as AssistProfile[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChangeAssistMode(player.id, m)}
              className={`min-h-[44px] rounded font-bold uppercase transition-all cursor-pointer ${
                assistMode === m
                  ? m === 'assisted'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : m === 'semi'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : m === 'manual' ? 'bg-rose-500 text-white shadow' : 'bg-violet-500 text-white shadow'
                  : 'text-slate-300 hover:text-white bg-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        {assistMode === 'custom' && <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2">
          {([
            ['shortPass', 'SHORT PASS'], ['longPass', 'LONG PASS'], ['cross', 'CROSS'],
            ['shoot', 'SHOOT'], ['tackling', 'TACKLING'], ['interception', 'INTERCEPTION'],
          ] as [AssistAction, string][]).map(([action, label]) => (
            <label key={action} className="flex items-center justify-between gap-2 text-[9px] font-mono text-slate-300">
              <span>{label}</span>
              <select
                value={player.actionAssistModes?.[action] || 'assisted'}
                onChange={(e) => onChangeActionAssistMode(player.id, action, e.target.value as AssistMode)}
                className="min-h-[34px] rounded bg-slate-900 border border-slate-700 px-2 text-white uppercase"
              >
                <option value="assisted">ASSISTED</option><option value="semi">SEMI</option><option value="manual">MANUAL</option>
              </select>
            </label>
          ))}
        </div>}
        <button type="button" onClick={() => onToggleManualAimArrow(player.id)} className="mt-2 w-full min-h-[36px] rounded border border-slate-700 bg-slate-900 text-[10px] font-mono text-slate-200">
          MANUAL AIM ARROW: {player.manualAimArrow ? 'ON' : 'OFF'}
        </button>
      </div>

      {player.device === 'keyboard' && (
        <div className="text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-amber-400 font-bold truncate">
              {kbPreset === 'wasd' ? 'WASD + JKIL' : 'ARROWS + SAWD'}
            </span>
            <button
              type="button"
              onClick={onShowKeyGuide}
              className="min-h-[36px] px-2 text-xs text-sky-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isKeyGuideOpen ? 'HIDE' : 'KEYS'}</span>
            </button>
          </div>
          {isKeyGuideOpen ? (
            <div className="mt-1.5 space-y-1 text-xs text-slate-200">
              {player.id === 1 && kbPreset === 'arrows' && (
                <>
                  <div>Move: <span className="text-amber-300">Arrows</span></div>
                  <div>Pass: <span className="text-amber-300">S</span> · Shoot: <span className="text-amber-300">A</span></div>
                  <div>Through: <span className="text-amber-300">W</span> · Cross: <span className="text-amber-300">D</span></div>
                  <div>Switch: <span className="text-amber-300">Q / Space</span> · Sprint: <span className="text-amber-300">Shift</span></div>
                </>
              )}
              {player.id === 1 && kbPreset === 'wasd' && (
                <>
                  <div>Move: <span className="text-amber-300">W, S, A, D</span></div>
                  <div>Pass: <span className="text-amber-300">J</span> · Shoot: <span className="text-amber-300">K</span></div>
                  <div>Through: <span className="text-amber-300">I</span> · Cross: <span className="text-amber-300">L</span></div>
                  <div>Switch: <span className="text-amber-300">U / Space</span> · Sprint: <span className="text-amber-300">Shift</span></div>
                </>
              )}
              {player.id === 2 && (
                <>
                  <div>Move: <span className="text-amber-300">I, K, J, L</span></div>
                  <div>Pass: <span className="text-amber-300">U</span> · Shoot: <span className="text-amber-300">O</span> · Through: <span className="text-amber-300">Y</span> · Cross: <span className="text-amber-300">P</span></div>
                </>
              )}
              {player.id === 3 && (
                <>
                  <div>Move: <span className="text-amber-300">Numpad 8, 5, 4, 6</span></div>
                  <div>Pass: <span className="text-amber-300">Num1</span> · Shoot: <span className="text-amber-300">Num2</span> · Through: <span className="text-amber-300">Num3</span> · Cross: <span className="text-amber-300">Num0</span></div>
                </>
              )}
              {player.id === 4 && (
                <>
                  <div>Move: <span className="text-amber-300">T, G, F, H</span></div>
                  <div>Pass: <span className="text-amber-300">Z</span> · Shoot: <span className="text-amber-300">X</span> · Through: <span className="text-amber-300">C</span> · Cross: <span className="text-amber-300">V</span></div>
                </>
              )}
            </div>
          ) : (
            <div className="truncate text-slate-300 mt-0.5">
              {player.id === 1 && kbPreset === 'arrows' && 'Arrows · Pass: S · Shoot: A · Cross: D'}
              {player.id === 1 && kbPreset === 'wasd' && 'WASD · Pass: J · Shoot: K · Cross: L'}
              {player.id === 2 && 'IJKL · Pass: U · Shoot: O · Cross: P'}
              {player.id === 3 && 'Num 8546 · Pass: Num1 · Shoot: Num2'}
              {player.id === 4 && 'TGFH · Pass: Z · Shoot: X · Cross: V'}
            </div>
          )}
        </div>
      )}

      {player.device === 'gamepad' && (
        <div className="text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800">
          🎮 Stick/D-Pad: Move · ✕: Pass · □: Shoot · △: Through · ○: Cross
        </div>
      )}

      {player.device === 'touch' && (
        <div className="text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800">
          📱 Virtual analog stick + S, A, W, D arcade buttons
        </div>
      )}
    </div>
  );
};
