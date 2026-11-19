import React, { useEffect, useState } from 'react';
import {
  Check,
  Gamepad2,
  Keyboard,
  Layers,
  Move,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ControlMode,
  ControllerCustomization,
  CustomKeyBindings,
  GamepadBindings,
} from '../types';
import {
  DEFAULT_CONTROLLER_CUSTOMIZATION,
  DEFAULT_GAMEPAD_BINDINGS,
  DEFAULT_KEY_BINDINGS,
  formatGamepadButtonDisplay,
  formatKeyDisplay,
} from '../game/controllerConfig';
import { ConsoleModalShell } from '../../components/common/ConsolePager';

interface ControllerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  controlMode: ControlMode;
  onChangeControlMode: (mode: ControlMode) => void;
  controllerCustomization: ControllerCustomization;
  onChangeControllerCustomization: (customization: ControllerCustomization) => void;
  keyBindings: CustomKeyBindings;
  onChangeKeyBindings: (bindings: CustomKeyBindings) => void;
  gamepadBindings: GamepadBindings;
  onChangeGamepadBindings: (bindings: GamepadBindings) => void;
  isGamepadConnected?: boolean;
  gamepadName?: string;
}

export const ControllerSettingsModal: React.FC<ControllerSettingsModalProps> = ({
  isOpen,
  onClose,
  controlMode,
  onChangeControlMode,
  controllerCustomization,
  onChangeControllerCustomization,
  keyBindings,
  onChangeKeyBindings,
  gamepadBindings,
  onChangeGamepadBindings,
  isGamepadConnected = false,
  gamepadName = '',
}) => {
  const [activeTab, setActiveTab] = useState<'buttons' | 'layout' | 'mode'>('buttons');
  const [listeningKey, setListeningKey] = useState<keyof CustomKeyBindings | null>(null);
  const [listeningGamepad, setListeningGamepad] = useState<keyof GamepadBindings | null>(null);
  const [liveButtons, setLiveButtons] = useState<number[]>([]);

  useEffect(() => {
    if (!listeningKey) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setListeningKey(null);
        return;
      }
      onChangeKeyBindings({ ...keyBindings, [listeningKey]: e.code });
      setListeningKey(null);
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [listeningKey, keyBindings, onChangeKeyBindings]);

  useEffect(() => {
    let rafId: number;
    const poll = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = pads[0] || pads[1];
      if (pad) {
        const pressed: number[] = [];
        pad.buttons.forEach((btn, idx) => {
          if (btn.pressed) pressed.push(idx);
        });
        setLiveButtons(pressed);
        if (listeningGamepad && pressed.length > 0) {
          const btnIdx = pressed[0];
          onChangeGamepadBindings({ ...gamepadBindings, [listeningGamepad]: btnIdx });
          setListeningGamepad(null);
        }
      } else {
        setLiveButtons([]);
      }
      rafId = requestAnimationFrame(poll);
    };
    if (isOpen) {
      rafId = requestAnimationFrame(poll);
    }
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, listeningGamepad, gamepadBindings, onChangeGamepadBindings]);

  if (!isOpen) return null;

  const actionRows: Array<{
    keyAction: keyof CustomKeyBindings;
    gamepadAction: keyof GamepadBindings;
    label: string;
    withBallDesc: string;
    withoutBallDesc: string;
    color: string;
  }> = [
    {
      keyAction: 'longPass',
      gamepadAction: 'longPass',
      label: 'Long Pass / Driven Through-Ball',
      withBallDesc: 'W: Driven through-ball to space (E: Chip, Q: Curve)',
      withoutBallDesc: 'W: Push foul / Shoulder charge (GK: 1v1 Star-Spread Smother)',
      color: 'text-amber-400',
    },
    {
      keyAction: 'shoot',
      gamepadAction: 'shoot',
      label: 'Shoot / Clear Volley',
      withBallDesc: 'A: Shot on goal / Placement',
      withoutBallDesc: 'A: Defensive clearance (GK: Low smother dive)',
      color: 'text-rose-400',
    },
    {
      keyAction: 'shortPass',
      gamepadAction: 'shortPass',
      label: 'Short Pass / Standing Tackle',
      withBallDesc: 'S: Ground pass to feet / Calms tempo',
      withoutBallDesc: 'S: Standing tackle / Ball pressure (GK: Sweeper sprint rush)',
      color: 'text-emerald-400',
    },
    {
      keyAction: 'cross',
      gamepadAction: 'cross',
      label: 'Cross / Slide Tackle',
      withBallDesc: 'D: Curled cross / Flank delivery',
      withoutBallDesc: 'D: Sliding tackle / Interception (GK: High dive / Top corner)',
      color: 'text-sky-400',
    },
    {
      keyAction: 'cameraFocus',
      gamepadAction: 'cameraFocus',
      label: 'Switch Camera (Pitch / Ball / Player)',
      withBallDesc: 'C: Cycle Pitch / Ball / Player Camera',
      withoutBallDesc: 'C: Cycle Pitch / Ball / Player Camera',
      color: 'text-cyan-300',
    },
    {
      keyAction: 'sprint',
      gamepadAction: 'sprint',
      label: 'Sprint / Turbo Run',
      withBallDesc: 'Shift: Sprint / Dash ahead',
      withoutBallDesc: 'Shift: Sprint recovery run',
      color: 'text-yellow-300',
    },
    {
      keyAction: 'gingaSwitch',
      gamepadAction: 'gingaSwitch',
      label: 'Ginga / Defense Switch / Tactical Guide',
      withBallDesc: 'Space: Sombrero lift & volleys',
      withoutBallDesc: 'Space: Switch defender (G: Direct Goalkeeper toggle)',
      color: 'text-cyan-400',
    },
    {
      keyAction: 'skillQ',
      gamepadAction: 'skillQ',
      label: 'Skill Q / Shield / Shoulder Hit',
      withBallDesc: 'Q: Ball shielding & Nutmeg',
      withoutBallDesc: 'Q: Body check & Shoulder hit (GK: High aerial jump catch)',
      color: 'text-purple-400',
    },
    {
      keyAction: 'skillE',
      gamepadAction: 'skillE',
      label: 'Skill E / Knuckle / Shirt Pull',
      withBallDesc: 'E: Knuckle shot & Step-overs',
      withoutBallDesc: 'E: Shirt pull tactical foul (GK: Two-fisted punch clear)',
      color: 'text-pink-400',
    },
  ];

  const handleResetBindings = () => {
    onChangeKeyBindings(DEFAULT_KEY_BINDINGS);
    onChangeGamepadBindings(DEFAULT_GAMEPAD_BINDINGS);
  };

  const handleResetLayout = () => {
    onChangeControllerCustomization(DEFAULT_CONTROLLER_CUSTOMIZATION);
  };

  const tabs = [
    { id: 'buttons', label: 'BUTTONS', icon: <Keyboard className="w-3.5 h-3.5" /> },
    { id: 'layout', label: 'DECK', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'mode', label: 'MODE', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="CONTROLLER SETUP"
      subtitle="Button Mapping · Arcade Deck Layout · Control Mode"
      icon={<Gamepad2 className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-3xl"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'buttons' | 'layout' | 'mode')}
      bodyClassName="p-3 sm:p-5 space-y-5"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-black shadow-lg transition active:scale-95 cursor-pointer"
          >
            SAVE & RESUME
          </button>
        </div>
      }
    >
          {activeTab === 'buttons' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isGamepadConnected ? 'bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <div>
                    <span className="font-['Press_Start_2P'] text-[9px] text-white block">
                      {isGamepadConnected ? 'JOYSTICK / GAMEPAD CONNECTED' : 'NO JOYSTICK DETECTED'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isGamepadConnected
                        ? gamepadName || 'Standard Gamepad Ready'
                        : 'Connect USB/Bluetooth joystick or play with keyboard / arcade console'}
                    </span>
                  </div>
                </div>
                {isGamepadConnected && (
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/80">
                    <span>LIVE INPUTS:</span>
                    <span className="font-bold text-white">
                      {liveButtons.length > 0 ? liveButtons.map((b) => `B${b}`).join(', ') : 'IDLE'}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="hidden sm:grid grid-cols-12 bg-slate-900/90 px-3 py-2 border-b border-slate-800 font-['Press_Start_2P'] text-[8px] text-slate-400">
                  <div className="col-span-5">ACTION & BEHAVIOR</div>
                  <div className="col-span-3 text-center">KEYBOARD KEY</div>
                  <div className="col-span-4 text-right">JOYSTICK INPUT</div>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {actionRows.map((row) => {
                    const keyCode = keyBindings[row.keyAction];
                    const gpBtn = gamepadBindings[row.gamepadAction];
                    const isWaitingKey = listeningKey === row.keyAction;
                    const isWaitingGp = listeningGamepad === row.gamepadAction;

                    return (
                      <div key={row.keyAction} className="flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2.5 px-3 py-3 hover:bg-slate-900/40 transition">
                        <div className="sm:col-span-5 space-y-1 min-w-0">
                          <span className={`font-bold text-xs ${row.color} block`}>{row.label}</span>
                          <span className="text-[11px] text-slate-300 block font-sans">{row.withBallDesc}</span>
                          <span className="text-[11px] text-slate-400 block font-sans">{row.withoutBallDesc}</span>
                        </div>
                        <div className="sm:col-span-7 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setListeningGamepad(null);
                              setListeningKey(row.keyAction);
                            }}
                            className={`min-h-[44px] w-full px-2.5 py-2 rounded-lg border font-mono text-xs font-bold transition cursor-pointer text-center truncate ${
                              isWaitingKey
                                ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/80 animate-pulse'
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
                            }`}
                          >
                            {isWaitingKey ? 'PRESS KEY...' : `KEY: ${formatKeyDisplay(keyCode)}`}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setListeningKey(null);
                              setListeningGamepad(row.gamepadAction);
                            }}
                            className={`min-h-[44px] w-full px-2.5 py-2 rounded-lg border font-mono text-xs font-semibold transition cursor-pointer text-center truncate ${
                              isWaitingGp
                                ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400/80 animate-pulse'
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-300'
                            }`}
                          >
                            {isWaitingGp ? 'PRESS BTN...' : `PAD: ${formatGamepadButtonDisplay(gpBtn)}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                <span className="text-xs text-slate-300 font-sans">
                  Default keyboard: <b>W</b>=Long Pass, <b>A</b>=Shoot, <b>S</b>=Short Pass, <b>D</b>=Cross, <b>Shift</b>=Sprint, <b>Space</b>=Switch/Ginga
                </span>
                <button
                  type="button"
                  onClick={handleResetBindings}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-arcade text-[10px] transition cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET DEFAULTS</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-5">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                    <Move className="w-4 h-4 text-amber-400" />
                    <span>JOYSTICK POSITION & SCALE</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    SIDE: <b className="text-amber-400">{controllerCustomization.stickSide.toUpperCase()}</b>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    STICK HAND ORIENTATION
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onChangeControllerCustomization({ ...controllerCustomization, stickSide: 'left' })}
                      className={`min-h-[44px] py-2.5 px-3 rounded-lg text-center font-arcade text-[10px] border transition cursor-pointer ${
                        controllerCustomization.stickSide === 'left'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400 font-black'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      LEFT-HAND STICK (STANDARD)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeControllerCustomization({ ...controllerCustomization, stickSide: 'right' })}
                      className={`min-h-[44px] py-2.5 px-3 rounded-lg text-center font-arcade text-[10px] border transition cursor-pointer ${
                        controllerCustomization.stickSide === 'right'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400 font-black'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      RIGHT-HAND STICK (LEFTY)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>STICK SIZE</span>
                      <span className="font-mono text-amber-300">{Math.round(controllerCustomization.stickScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.80"
                      max="1.30"
                      step="0.05"
                      value={controllerCustomization.stickScale}
                      onChange={(e) =>
                        onChangeControllerCustomization({
                          ...controllerCustomization,
                          stickScale: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>STICK OFFSET X</span>
                      <span className="font-mono text-amber-300">{controllerCustomization.stickOffsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="2"
                      value={controllerCustomization.stickOffsetX}
                      onChange={(e) =>
                        onChangeControllerCustomization({
                          ...controllerCustomization,
                          stickOffsetX: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>STICK OFFSET Y</span>
                      <span className="font-mono text-amber-300">{controllerCustomization.stickOffsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="2"
                      value={controllerCustomization.stickOffsetY}
                      onChange={(e) =>
                        onChangeControllerCustomization({
                          ...controllerCustomization,
                          stickOffsetY: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>BUTTONS POSITION & ARC LAYOUT</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    STYLE: <b className="text-emerald-400">{controllerCustomization.buttonsLayout.toUpperCase()}</b>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    BUTTON ARRANGEMENT PATTERN
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'diamond', label: 'DIAMOND', desc: 'Classic D-pad orientation' },
                        { id: 'arc', label: 'CURVED ARC', desc: 'Ergonomic arcade cabinet' },
                        { id: 'cluster', label: 'CLUSTER', desc: '2x2 Compact matrix' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          onChangeControllerCustomization({ ...controllerCustomization, buttonsLayout: opt.id })
                        }
                        className={`p-2 rounded-lg text-center font-['Press_Start_2P'] text-[8px] border transition cursor-pointer flex flex-col items-center gap-1 ${
                          controllerCustomization.buttonsLayout === opt.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className="text-[7px] text-slate-500 font-sans">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>BUTTON SPACING</span>
                      <span className="font-mono text-emerald-300">{Math.round(controllerCustomization.buttonsSpacing * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.80"
                      max="1.30"
                      step="0.05"
                      value={controllerCustomization.buttonsSpacing}
                      onChange={(e) =>
                        onChangeControllerCustomization({
                          ...controllerCustomization,
                          buttonsSpacing: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>BUTTON OFFSET X</span>
                      <span className="font-mono text-emerald-300">{controllerCustomization.buttonsOffsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="2"
                      value={controllerCustomization.buttonsOffsetX}
                      onChange={(e) =>
                        onChangeControllerCustomization({
                          ...controllerCustomization,
                          buttonsOffsetX: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>BUTTON OFFSET Y</span>
                      <span className="font-mono text-emerald-300">{controllerCustomization.buttonsOffsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="2"
                      value={controllerCustomization.buttonsOffsetY}
                      onChange={(e) =>
                        onChangeControllerCustomization({
                          ...controllerCustomization,
                          buttonsOffsetY: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                    <span>CONTROLLER DECK BACKGROUND SIZE & SCALE</span>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400">HEIGHT: {controllerCustomization.deckHeight}px</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>DECK HEIGHT</span>
                      <span className="font-mono text-cyan-300">{controllerCustomization.deckHeight}px</span>
                    </div>
                    <input
                      type="range"
                      min="110"
                      max="190"
                      step="5"
                      value={controllerCustomization.deckHeight}
                      onChange={(e) =>
                        onChangeControllerCustomization({
                          ...controllerCustomization,
                          deckHeight: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>DECK SCALE</span>
                      <span className="font-mono text-cyan-300">{Math.round(controllerCustomization.deckScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.85"
                      max="1.15"
                      step="0.05"
                      value={controllerCustomization.deckScale}
                      onChange={(e) =>
                        onChangeControllerCustomization({
                          ...controllerCustomization,
                          deckScale: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>DECK OPACITY</span>
                      <span className="font-mono text-cyan-300">{Math.round(controllerCustomization.deckOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.30"
                      max="1.00"
                      step="0.05"
                      value={controllerCustomization.deckOpacity}
                      onChange={(e) =>
                        onChangeControllerCustomization({
                          ...controllerCustomization,
                          deckOpacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleResetLayout}
                  className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-arcade text-[10px] transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET DECK LAYOUT</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'mode' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-slate-200 font-bold text-xs">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>PLAYER CONTROL MODE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onChangeControlMode('full_team')}
                    className={`min-h-[54px] p-3.5 rounded-xl border text-left space-y-2 transition cursor-pointer relative ${
                      controlMode === 'full_team'
                        ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-arcade font-black text-xs text-amber-300">FULL TEAM MODE</span>
                      {controlMode === 'full_team' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Standard arcade 11v11 soccer. Automatically switches user control to the teammate closest to the ball.
                    </p>
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[11px] text-amber-200/90 font-mono">
                      <b>SPACEBAR / G BUTTON WITHOUT BALL:</b>
                      <span className="block text-slate-300">Instantly switches control to nearest teammate to ball.</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeControlMode('one_player')}
                    className={`min-h-[54px] p-3.5 rounded-xl border text-left space-y-2 transition cursor-pointer relative ${
                      controlMode === 'one_player'
                        ? 'bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-arcade font-black text-xs text-cyan-300">1-PLAYER (BE-A-PRO LOCK)</span>
                      {controlMode === 'one_player' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Locked to your single chosen player! The camera can focus on you, and control never auto-switches away.
                    </p>
                    <div className="bg-slate-950/60 p-2 rounded border border-cyan-800/60 text-[11px] text-cyan-200 font-mono">
                      <b>SPACEBAR / G BUTTON WITHOUT BALL:</b>
                      <span className="block text-cyan-300 font-semibold">
                        Tactical Auto-Position Assist: Automatically drives your player into optimal tactical defensive cover.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SMART INPUT FEATURES</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  • <b>Mobile & Touch:</b> High-responsiveness arcade console with slight pull = walk and extended pull = run.
                  <br />• <b>Shift Stick Visual:</b> Pressing <b>Shift</b> tilts the arcade joystick into sprint stance.
                  <br />• <b>Gamepad Support:</b> Plug in Xbox, PlayStation, or USB controllers for native joystick play.
                </p>
              </div>
            </div>
          )}
    </ConsoleModalShell>
  );
};
