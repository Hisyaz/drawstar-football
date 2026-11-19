/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Monitor,
  Gamepad2,
  Eye,
  Check,
  Clock,
  Gauge,
  Tv,
  Target,
  Flame,
  Lock,
} from 'lucide-react';
import {
  GraphicsSettings,
  GraphicsTier,
  ControlMode,
  ControllerCustomization,
  CustomKeyBindings,
  GamepadBindings,
  HalfDurationMinutes,
  DifficultyLevel,
  PlayerIndicatorType,
  PlayerIndicatorStyle,
} from '../types';
import { HudDisplayMode } from './MatchHUD';
import { RadarZoom, MinimapMode } from './RadarMinimap';
import { ControllerBgMode, ControllerTheme } from './ArcadeConsole';
import { ALL_RETRO_FILTERS, applyPresetTier } from '../game/graphicsConfig';
import { isMatchFilterUnlocked } from '../../utils/cardDustSystem';
import { formatKeyDisplay } from '../game/controllerConfig';
import { audio } from '../game/audio';
import { ConsoleModalShell } from '../../components/common/ConsolePager';

export interface UnifiedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Tab 1: Graphics & Retro Filters
  graphicsSettings: GraphicsSettings;
  onChangeGraphicsSettings: (settings: GraphicsSettings) => void;
  // Tab 2: Controls & Controller Deck
  controlMode: ControlMode;
  onChangeControlMode: (mode: ControlMode) => void;
  controllerCustomization: ControllerCustomization;
  onChangeControllerCustomization: (custom: ControllerCustomization) => void;
  keyBindings: CustomKeyBindings;
  onChangeKeyBindings: (bindings: CustomKeyBindings) => void;
  gamepadBindings: GamepadBindings;
  onChangeGamepadBindings: (bindings: GamepadBindings) => void;
  isGamepadConnected?: boolean;
  gamepadName?: string;
  controllerBgMode?: ControllerBgMode;
  onChangeControllerBgMode?: (mode: ControllerBgMode) => void;
  controllerTheme?: ControllerTheme;
  onChangeControllerTheme?: (theme: ControllerTheme) => void;
  // Tab 3: Match & HUD Visibility
  halfDuration: HalfDurationMinutes;
  onChangeHalfDuration: (dur: HalfDurationMinutes) => void;
  gameSpeed: number;
  onChangeGameSpeed: (speed: number) => void;
  powerBarSpeed?: number;
  onChangePowerBarSpeed?: (pct: number) => void;
  difficulty?: DifficultyLevel;
  onChangeDifficulty?: (diff: DifficultyLevel) => void;
  scoreboardMode: HudDisplayMode;
  onChangeScoreboardMode: (mode: HudDisplayMode) => void;
  specialActionTextMode: HudDisplayMode;
  onChangeSpecialActionTextMode: (mode: HudDisplayMode) => void;
  playerInfoMode: HudDisplayMode;
  onChangePlayerInfoMode: (mode: HudDisplayMode) => void;
  playerIndicatorType?: PlayerIndicatorType;
  onChangePlayerIndicatorType?: (type: PlayerIndicatorType) => void;
  playerIndicatorStyle?: PlayerIndicatorStyle;
  onChangePlayerIndicatorStyle?: (style: PlayerIndicatorStyle) => void;
  minimapMode: MinimapMode;
  onChangeMinimapMode: (mode: MinimapMode) => void;
  minimapSonar: boolean;
  onChangeMinimapSonar: (sonar: boolean) => void;
  radarZoom: RadarZoom;
  onChangeRadarZoom: (zoom: RadarZoom) => void;
  debugExecutionOverlay?: boolean;
  onChangeDebugExecutionOverlay?: (enabled: boolean) => void;
  manualAimArrowVisible?: boolean;
  manualAimArrowAvailable?: boolean;
  onChangeManualAimArrowVisible?: (enabled: boolean) => void;
  initialTab?: 'graphics' | 'controls' | 'match_hud';
}

export const UnifiedSettingsModal: React.FC<UnifiedSettingsModalProps> = ({
  isOpen,
  onClose,
  graphicsSettings,
  onChangeGraphicsSettings,
  keyBindings,
  isGamepadConnected,
  gamepadName,
  controllerBgMode,
  onChangeControllerBgMode,
  halfDuration,
  onChangeHalfDuration,
  gameSpeed,
  powerBarSpeed = 100,
  onChangePowerBarSpeed,
  onChangeGameSpeed,
  difficulty,
  onChangeDifficulty,
  scoreboardMode,
  onChangeScoreboardMode,
  specialActionTextMode,
  onChangeSpecialActionTextMode,
  playerInfoMode,
  onChangePlayerInfoMode,
  minimapMode,
  onChangeMinimapMode,
  minimapSonar,
  onChangeMinimapSonar,
  radarZoom,
  onChangeRadarZoom,
  debugExecutionOverlay = false,
  onChangeDebugExecutionOverlay,
  manualAimArrowVisible = false,
  manualAimArrowAvailable = true,
  onChangeManualAimArrowVisible,
  initialTab = 'graphics',
}) => {
  const [activeTab, setActiveTab] = useState<'graphics' | 'controls' | 'match_hud'>(initialTab);

  if (!isOpen) return null;

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="SYSTEM SETTINGS"
      subtitle="Graphics Pipeline · Controller Deck · Match & HUD"
      icon={<Settings className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-4xl"
      tabs={[
        { id: 'graphics', label: 'GRAPHICS', icon: <Monitor className="w-4 h-4 shrink-0" /> },
        { id: 'controls', label: 'CONTROLS', icon: <Gamepad2 className="w-4 h-4 shrink-0" /> },
        { id: 'match_hud', label: 'MATCH & HUD', icon: <Eye className="w-4 h-4 shrink-0" /> },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => {
        audio.playKick(0.15);
        setActiveTab(id as 'graphics' | 'controls' | 'match_hud');
      }}
      bodyClassName="p-3.5 sm:p-5 space-y-5 bg-gradient-to-b from-slate-900 to-slate-950"
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs font-mono text-slate-300">
            Tier: <span className="text-amber-400 font-bold">{graphicsSettings.tier.toUpperCase()}</span> · Speed:{' '}
            <span className="text-emerald-400 font-bold tabular-nums">{gameSpeed}%</span> · Half:{' '}
            <span className="text-sky-400 font-bold tabular-nums">{halfDuration}m</span>
          </div>

          <button
            type="button"
            onClick={() => {
              audio.playKick(0.3);
              onClose();
            }}
            className="min-h-[44px] px-5 py-2.5 text-xs font-arcade bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-2 ml-auto"
          >
            <Check className="w-4 h-4" />
            <span>SAVE & CLOSE</span>
          </button>
        </div>
      }
    >
      {/* TAB 1: GRAPHICS & RETRO FILTERS */}
      {activeTab === 'graphics' && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Monitor className="w-4 h-4" />
              <span>3-TIER SCALABLE GRAPHICS PIPELINE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'performance',
                  name: 'PERFORMANCE',
                  tag: 'Smooth 60 FPS',
                  desc: 'Optimized for low-end devices. Disables heavy post-processing & blur.',
                },
                {
                  id: 'balanced',
                  name: 'BALANCED',
                  tag: 'Standard Arcade',
                  desc: 'Authentic 90s console balance with high-DPI scaling & crowd flashes.',
                },
                {
                  id: 'high_end',
                  name: 'HIGH-END',
                  tag: 'Maximum Fidelity',
                  desc: 'Full quad-shadows, volumetric bloom, detailed pitch scuffs & retro shaders.',
                },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    audio.playKick(0.2);
                    const updated = applyPresetTier(graphicsSettings, p.id as GraphicsTier);
                    onChangeGraphicsSettings(updated);
                  }}
                  className={`min-h-[48px] p-3.5 rounded-xl border text-left transition-all cursor-pointer active:scale-98 ${
                    graphicsSettings.tier === p.id
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                      : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-arcade text-xs text-white font-bold">{p.name}</span>
                    {graphicsSettings.tier === p.id && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="text-xs font-mono text-amber-400 font-bold mb-1">{p.tag}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Retro Filter Selector */}
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Tv className="w-4 h-4" />
              <span>RETRO SHADERS & BROADCAST FILTERS</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_RETRO_FILTERS.map((f) => {
                const isUnlocked = f.id === 'none' || isMatchFilterUnlocked(f.id);
                const isSelected = isUnlocked && graphicsSettings.activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (!isUnlocked) return;
                      audio.playKick(0.2);
                      onChangeGraphicsSettings({
                        ...graphicsSettings,
                        activeFilter: f.id,
                      });
                    }}
                    title={isUnlocked ? f.description : 'Unlock in Card Collection → UNLOCK & EXCHANGE (1,000 Dust)'}
                    className={`min-h-[60px] p-2.5 rounded-xl border text-left transition-all ${
                      !isUnlocked
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 shadow-md cursor-pointer active:scale-98'
                        : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-200 cursor-pointer active:scale-98'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{f.badge}</span>
                      {!isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold">
                          <Lock className="w-3 h-3" /> 1,000 DUST
                        </span>
                      ) : (
                        isSelected && <Check className="w-4 h-4" />
                      )}
                    </div>
                    <div className="font-arcade text-xs truncate max-w-full">{f.name}</div>
                    <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                      {isUnlocked ? f.era : 'Card Collection Lock'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Graphics Detail Toggles */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5">
              INDIVIDUAL RENDERING ENGINES
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {[
                { key: 'quadShadows', label: 'Quad-Shadows (4 Floodlights)' },
                { key: 'highDpi', label: 'High-DPI Retina Buffer Scaling' },
                { key: 'volumetricLighting', label: 'Volumetric Rafter Haze & Bloom' },
                { key: 'pitchScuffs', label: 'Persistent Pitch Scuff Marks' },
                { key: 'crowdFlashbulbs', label: 'Dynamic Crowd Camera Flashes' },
                { key: 'videoRefReview', label: 'VideoRef (VIR) Referee TV Replays' },
              ].map((item) => {
                const val = graphicsSettings[item.key as keyof GraphicsSettings];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      audio.playKick(0.15);
                      onChangeGraphicsSettings({
                        ...graphicsSettings,
                        [item.key]: !val,
                      });
                    }}
                    className="min-h-[44px] flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer text-left"
                  >
                    <span className="text-slate-200 min-w-0 truncate">{item.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-black shrink-0 ${
                        val ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {val ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTROLS & BINDINGS */}
      {activeTab === 'controls' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-950/70 border border-sky-500/40 rounded-xl p-3.5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-arcade text-xs text-sky-300 font-bold">
                CONTROLLER & SIDE ASSIGNMENT
              </div>
              <p className="text-xs font-sans text-slate-300 mt-1 leading-relaxed">
                Device binding (WASD, Arrows, Gamepads, Touch), Control Scope (All Team vs Single Player), and Cursor Change mode are configured in the <strong className="text-sky-300">SELECT SIDE</strong> menu.
              </p>
            </div>
          </div>

          {/* Virtual On-Screen Controller Deck Visibility */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center justify-between gap-2 flex-wrap">
              <span>VIRTUAL CONTROLLER DECK DISPLAY</span>
              {controllerBgMode === 'hidden' && (
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  HIDDEN · PURE HARDWARE INPUTS
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'solid', label: 'SOLID DECK', desc: 'Full arcade console' },
                { id: 'transparent', label: 'TRANSPARENT', desc: 'See-through pitch' },
                { id: 'floating', label: 'FLOATING', desc: 'Minimal sticks' },
                { id: 'hidden', label: 'HIDE DECK', desc: 'Keyboard & Gamepad' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    audio.playKick(0.2);
                    onChangeControllerBgMode?.(mode.id as ControllerBgMode);
                  }}
                  className={`min-h-[56px] p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-98 ${
                    controllerBgMode === mode.id
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-arcade text-xs truncate">{mode.label}</div>
                  <div
                    className={`text-[11px] font-mono mt-0.5 truncate ${
                      controllerBgMode === mode.id ? 'text-slate-900 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {mode.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard Bindings Reference */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center justify-between gap-2 flex-wrap">
              <span>KEYBOARD ACTION MAPPINGS</span>
              <span className="text-xs font-normal text-slate-400">Arrow keys move player</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
              {[
                { label: 'SHORT PASS / TACKLE', val: formatKeyDisplay(keyBindings.shortPass) },
                { label: 'SHOOT / CLEAR', val: formatKeyDisplay(keyBindings.shoot) },
                { label: 'THROUGH BALL / GK RUSH', val: formatKeyDisplay(keyBindings.longPass) },
                { label: 'CROSS / SLIDE', val: formatKeyDisplay(keyBindings.cross) },
                { label: 'SPRINT / JOCKEY', val: formatKeyDisplay(keyBindings.sprint) },
                { label: 'GINGA TRICK / CHIP', val: formatKeyDisplay(keyBindings.skillE || 'KeyE') },
              ].map((kb) => (
                <div
                  key={kb.label}
                  className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <span className="text-slate-300 truncate">{kb.label}</span>
                  <span className="text-amber-400 font-bold shrink-0">{kb.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gamepad Status */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0">
                <Gamepad2 className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-arcade text-xs text-white truncate">
                    {isGamepadConnected ? 'GAMEPAD CONNECTED' : 'GAMEPAD AUTO-DETECTION'}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5 truncate">
                    {gamepadName || 'Plug in Xbox, PlayStation, or USB controller'}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-mono font-bold shrink-0 ${
                  isGamepadConnected ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {isGamepadConnected ? 'ACTIVE' : 'READY'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATCH DURATION, SPEED & HUD VISIBILITY */}
      {activeTab === 'match_hud' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Half Duration */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>HALF DURATION</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {([2, 3, 5, 10] as HalfDurationMinutes[]).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      audio.playKick(0.2);
                      onChangeHalfDuration(dur);
                    }}
                    className={`min-h-[44px] py-2 text-xs font-arcade rounded-lg border transition-all cursor-pointer tabular-nums ${
                      halfDuration === dur
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            {/* Game Speed Slider */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" />
                  <span>GAME SPEED</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs tabular-nums">
                  {gameSpeed}% SPEED
                </span>
              </div>
              <input
                type="range"
                min={80}
                max={125}
                value={gameSpeed}
                onChange={(e) => onChangeGameSpeed(Number(e.target.value))}
                className="w-full h-9 accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>80% (Slow)</span>
                <span>100% (Balanced)</span>
                <span>125% (Turbo)</span>
              </div>
            </div>

            {/* Power Bar Speed Slider */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" />
                  <span>POWER BAR SPEED</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs tabular-nums">
                  {powerBarSpeed}% SPEED
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={powerBarSpeed}
                onChange={(e) => onChangePowerBarSpeed?.(Number(e.target.value))}
                className="w-full h-9 accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>0% (5% speed)</span>
                <span>100% (Default)</span>
                <span>200% (2x faster)</span>
              </div>
            </div>
          </div>

          {/* Rival AI Difficulty */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>RIVAL AI DIFFICULTY</span>
              </div>
              <span className="font-mono font-bold text-rose-400 text-xs uppercase">{difficulty}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['standing', 'easy', 'normal', 'elite', 'legend'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    audio.playKick(0.2);
                    onChangeDifficulty?.(diff);
                  }}
                  className={`min-h-[44px] py-2 px-2 text-xs font-arcade uppercase rounded-lg border transition-all cursor-pointer ${
                    difficulty === diff
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black border-amber-300 shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                  }`}
                >
                  {diff === 'standing' ? 'DUMMY' : diff}
                </button>
              ))}
            </div>
            <p className="text-xs font-sans text-slate-300 mt-2.5 leading-relaxed">
              {difficulty === 'standing' && 'Practice Dummies: AI outfielders stand stationary for target practice.'}
              {difficulty === 'easy' && 'Casual / Amateur: Forgiving challenge, slower press reaction, loose marking.'}
              {difficulty === 'normal' && 'Balanced Pro: Authentic modern football, smart tactical choices, active press.'}
              {difficulty === 'elite' && 'Elite Challenge: High-intensity counter-press, tight cover shadows, rarely makes mistakes.'}
              {difficulty === 'legend' && 'World Class Legend: Flawless AI, lethal finishing, zero unforced errors.'}
            </p>
          </div>

          {/* HUD Visibility Modes */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5">
              HEADS-UP DISPLAY (HUD) VISIBILITY
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'SCOREBOARD', value: scoreboardMode, onChange: onChangeScoreboardMode },
                { label: 'ACTION BANNERS', value: specialActionTextMode, onChange: onChangeSpecialActionTextMode },
                { label: 'PLAYER CARD', value: playerInfoMode, onChange: onChangePlayerInfoMode },
              ].map((row) => (
                <div key={row.label}>
                  <div className="text-xs font-mono text-slate-300 mb-1.5">{row.label}</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['solid', 'transparent', 'off'] as HudDisplayMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          audio.playKick(0.15);
                          row.onChange(mode);
                        }}
                        className={`min-h-[44px] py-2 px-1 text-[11px] font-mono font-bold uppercase rounded-lg border cursor-pointer truncate ${
                          row.value === mode
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        {mode === 'transparent' ? 'CLEAR' : mode}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Minimap Matrix */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center justify-between gap-2 flex-wrap">
              <span>RADAR MINIMAP CONTROLS</span>
              <button
                type="button"
                onClick={() => {
                  audio.playKick(0.15);
                  onChangeMinimapSonar(!minimapSonar);
                }}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                  minimapSonar
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                    : 'bg-slate-900 text-slate-300 border-slate-700'
                }`}
              >
                RADAR SONAR: {minimapSonar ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-mono text-slate-300 mb-1.5">RADAR DISPLAY</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['solid', 'transparent', 'off'] as MinimapMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        audio.playKick(0.15);
                        onChangeMinimapMode(mode);
                      }}
                      className={`min-h-[44px] py-2 text-[11px] font-mono font-bold uppercase rounded-lg border cursor-pointer ${
                        minimapMode === mode
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {mode === 'transparent' ? 'CLEAR' : mode}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-slate-300 mb-1.5">RADAR ZOOM</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['full', 'zoom1', 'zoom2'] as RadarZoom[]).map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => {
                        audio.playKick(0.15);
                        onChangeRadarZoom(z);
                      }}
                      className={`min-h-[44px] py-2 text-[11px] font-mono font-bold uppercase rounded-lg border cursor-pointer ${
                        radarZoom === z
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {z.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* C2/C3 Intent vs Execution Debug Overlay */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 shrink-0" />
                <span>MANUAL AIM ARROW</span>
              </div>
              <p className="text-xs font-sans text-slate-300 mt-1">Show the current keyboard aim while controlling this player. It works in any assist mode.</p>
            </div>
            <button
              type="button"
              disabled={!manualAimArrowAvailable}
              onClick={() => { audio.playKick(0.15); onChangeManualAimArrowVisible?.(!manualAimArrowVisible); }}
              className={`min-h-[44px] min-w-[64px] px-3 py-2 rounded-lg text-xs font-arcade border cursor-pointer shrink-0 ${
                !manualAimArrowAvailable ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' : manualAimArrowVisible ? 'bg-amber-400 text-slate-950 border-amber-200 font-black' : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {manualAimArrowAvailable ? (manualAimArrowVisible ? 'ON' : 'OFF') : 'KEYBOARD'}
            </button>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 shrink-0" />
                <span>INTENT / EXECUTION OVERLAY</span>
              </div>
              <p className="text-xs font-sans text-slate-300 mt-1">
                Shows aimed intent point, actual kick point, and assist mode on the pitch.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                audio.playKick(0.15);
                onChangeDebugExecutionOverlay?.(!debugExecutionOverlay);
              }}
              className={`min-h-[44px] min-w-[64px] px-3 py-2 rounded-lg text-xs font-arcade border cursor-pointer shrink-0 ${
                debugExecutionOverlay
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {debugExecutionOverlay ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};

