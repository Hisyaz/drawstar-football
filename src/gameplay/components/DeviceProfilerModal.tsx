import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Cpu, Gamepad2, Keyboard, Smartphone } from 'lucide-react';
import { GraphicsSettings, GraphicsTier } from '../types';
import { applyPresetTier } from '../game/graphicsConfig';
import { ControllerBgMode } from './ArcadeConsole';
import { ConsoleModalShell } from '../../components/common/ConsolePager';

type InputMethod = 'gamepad' | 'keyboard' | 'touch';

interface DeviceProfile {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  hasTouch: boolean;
  hasKeyboard: boolean;
  hasGamepad: boolean;
  gamepadName: string;
  gpuRenderer: string;
  cores: number;
  memoryGb?: number;
  dpr: number;
  recommendedInput: InputMethod;
  recommendedControllerBg: ControllerBgMode;
  recommendedGraphicsTier: GraphicsTier;
}

function detectDeviceProfile(): DeviceProfile {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const isMobile = width < 768 || (hasTouch && width < 900);
  const isTablet = hasTouch && width >= 768 && width <= 1024;
  const hasKeyboard = !isMobile && !isTablet;
  const deviceType: 'mobile' | 'tablet' | 'desktop' = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  let hasGamepad = false;
  let gamepadName = '';
  try {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
      if (pad && pad.connected) {
        hasGamepad = true;
        gamepadName = pad.id;
        break;
      }
    }
  } catch {
    // ignore gamepad probe errors
  }

  let gpuRenderer = 'Standard WebGL';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        gpuRenderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || 'Standard GPU';
      }
    }
  } catch {
    // ignore webgl probe errors
  }

  const cores = navigator.hardwareConcurrency || 4;
  const memoryGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

  let recommendedInput: InputMethod = 'touch';
  let recommendedControllerBg: ControllerBgMode = 'solid';
  if (hasGamepad) {
    recommendedInput = 'gamepad';
    recommendedControllerBg = 'hidden';
  } else if (hasKeyboard) {
    recommendedInput = 'keyboard';
    recommendedControllerBg = 'hidden';
  }

  const gpuLower = gpuRenderer.toLowerCase();
  const isHighGpu =
    gpuLower.includes('nvidia') ||
    gpuLower.includes('geforce') ||
    gpuLower.includes('radeon') ||
    gpuLower.includes('apple m') ||
    gpuLower.includes('adreno (tm) 7') ||
    gpuLower.includes('mali-g7');

  let recommendedGraphicsTier: GraphicsTier = 'balanced';
  if (
    cores <= 4 ||
    (memoryGb !== undefined && memoryGb <= 3) ||
    gpuLower.includes('mali-4') ||
    gpuLower.includes('mali-g52') ||
    gpuLower.includes('adreno 5') ||
    gpuLower.includes('powervr')
  ) {
    recommendedGraphicsTier = 'performance';
  } else if (isHighGpu && cores >= 6) {
    recommendedGraphicsTier = 'high_end';
  }

  return {
    deviceType,
    hasTouch,
    hasKeyboard,
    hasGamepad,
    gamepadName,
    gpuRenderer,
    cores,
    memoryGb,
    dpr,
    recommendedInput,
    recommendedControllerBg,
    recommendedGraphicsTier,
  };
}

interface DeviceProfilerModalProps {
  isOpen: boolean;
  onConfirm: (payload: {
    inputMethod: InputMethod;
    controllerBgMode: ControllerBgMode;
    graphicsSettings: GraphicsSettings;
  }) => void;
  currentGraphicsSettings: GraphicsSettings;
}

export const DeviceProfilerModal: React.FC<DeviceProfilerModalProps> = ({
  isOpen,
  onConfirm,
  currentGraphicsSettings,
}) => {
  const profile = useMemo(() => detectDeviceProfile(), []);
  const [inputMethod, setInputMethod] = useState<InputMethod>(profile.recommendedInput);
  const [controllerBgMode, setControllerBgMode] = useState<ControllerBgMode>(profile.recommendedControllerBg);
  const [graphicsTier, setGraphicsTier] = useState<GraphicsTier>(profile.recommendedGraphicsTier);
  const [mobilePage, setMobilePage] = useState<'input' | 'graphics'>('input');

  useEffect(() => {
    const onPadConnected = () => {
      setInputMethod('gamepad');
      setControllerBgMode('hidden');
    };
    window.addEventListener('gamepadconnected', onPadConnected);
    return () => window.removeEventListener('gamepadconnected', onPadConnected);
  }, []);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const graphicsSettings = applyPresetTier(currentGraphicsSettings, graphicsTier);
    onConfirm({ inputMethod, controllerBgMode, graphicsSettings });
  };

  return (
    <ConsoleModalShell
      id="device-profiler-modal"
      isOpen={isOpen}
      showCloseButton={false}
      title="SYSTEM PROFILER"
      subtitle="Auto-detected hardware & recommended setup"
      icon={<Cpu className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-3xl"
      headerRight={
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/40 rounded-lg text-emerald-300 font-mono text-[10px] font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ONLINE</span>
        </div>
      }
      bodyClassName="p-3 sm:p-5 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200"
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-[11px] font-mono text-slate-300 truncate">
            <span className="text-amber-400 font-bold">{inputMethod.toUpperCase()}</span> ·{' '}
            <span className="text-emerald-400 font-bold">{graphicsTier.toUpperCase()}</span> ·{' '}
            Deck: <span className="text-sky-400 font-bold">{controllerBgMode.toUpperCase()}</span>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-arcade text-xs font-black rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>PROCEED TO TEAMS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      }
    >
      {/* Mobile Console Page Switcher (< md) */}
      <div className="grid grid-cols-2 gap-2 md:hidden bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setMobilePage('input')}
          className={`min-h-[44px] px-2.5 rounded-lg font-arcade text-[10px] uppercase font-bold transition-all cursor-pointer ${
            mobilePage === 'input'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 text-slate-300 hover:text-white'
          }`}
        >
          1. INPUT & DECK
        </button>
        <button
          type="button"
          onClick={() => setMobilePage('graphics')}
          className={`min-h-[44px] px-2.5 rounded-lg font-arcade text-[10px] uppercase font-bold transition-all cursor-pointer ${
            mobilePage === 'graphics'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 text-slate-300 hover:text-white'
          }`}
        >
          2. SPECS & GRAPHICS
        </button>
      </div>

      {/* Section 1: Input & Touch Deck */}
      <div className={`${mobilePage === 'input' ? 'block' : 'hidden md:block'} space-y-3`}>
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div className="text-xs font-arcade text-amber-400 uppercase tracking-wider mb-2.5 flex flex-wrap items-center justify-between gap-1">
            <span>1. INPUT METHOD</span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              detected: {profile.hasGamepad ? 'joystick' : profile.hasTouch ? 'touchpad' : 'keyboard'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            {(
              [
                {
                  id: 'gamepad' as InputMethod,
                  label: 'CONTROLLER',
                  icon: <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />,
                  recommended: profile.hasGamepad,
                  desc: 'Gamepad / Joystick',
                },
                {
                  id: 'keyboard' as InputMethod,
                  label: 'KEYBOARD',
                  icon: <Keyboard className="w-4 h-4 text-amber-400 shrink-0" />,
                  recommended: !profile.hasGamepad && profile.deviceType === 'desktop',
                  desc: 'Arrows + S/A/W/D',
                },
                {
                  id: 'touch' as InputMethod,
                  label: 'TOUCHPAD',
                  icon: <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />,
                  recommended: profile.hasTouch && !profile.hasGamepad,
                  desc: 'Virtual 32-bit Console',
                },
              ] as const
            ).map((item) => {
              const isSelected = inputMethod === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setInputMethod(item.id);
                    setControllerBgMode(item.id === 'keyboard' || item.id === 'gamepad' ? 'hidden' : 'solid');
                  }}
                  className={`min-h-[54px] p-3 rounded-lg border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {item.recommended && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-mono text-[9px] font-black rounded uppercase">
                      SUGGESTED
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1 pr-16">
                    {item.icon}
                    <span className="font-arcade text-[10px] text-white">{item.label}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300">{item.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs font-mono">
            <div className="font-bold text-amber-300 mb-2 uppercase tracking-wide flex flex-wrap items-center justify-between gap-1">
              <span>⚡ BUTTON ALLOCATION</span>
              <span className="text-slate-400 font-normal">Standard Arcade</span>
            </div>
            {inputMethod === 'gamepad' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-200 text-xs">
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">✕ / A</span>: Short Pass / Tackle</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">□ / X</span>: Shoot / Clear</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">○ / B</span>: Long Pass / Cross</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">△ / Y</span>: Through / GK Rush</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">RT / R2</span>: Sprint Acceleration</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">LB / L1</span>: Ginga Skill Feint</div>
              </div>
            ) : inputMethod === 'keyboard' ? (
              <div className="grid grid-cols-2 gap-1.5 text-slate-200 text-xs">
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">Arrows</span>: Move</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">S Key</span>: Pass / Tackle</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">A Key</span>: Shoot / Clear</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">W Key</span>: Long / Lob</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">D Key</span>: Cross / Slide</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80"><span className="text-amber-400 font-bold">Shift</span>: Sprint</div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                Responsive 32-bit on-screen arcade stick + action buttons (Pass, Shoot, Cross, Long Pass). Slight stick pull walks; full pull sprints.
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-slate-300 text-xs font-mono">On-Screen Touch Deck:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['hidden', 'solid', 'transparent'] as ControllerBgMode[]).map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setControllerBgMode(bg)}
                    className={`min-h-[44px] px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer border transition-all ${
                      controllerBgMode === bg
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {bg === 'hidden' ? 'Hide' : bg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Hardware Specs & Graphics Tier */}
      <div className={`${mobilePage === 'graphics' ? 'block' : 'hidden md:block'} space-y-3`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-center font-mono">
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">DEVICE</div>
            <div className="text-xs font-bold text-amber-300 uppercase mt-0.5">{profile.deviceType}</div>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">CPU CORES</div>
            <div className="text-xs font-bold text-white mt-0.5">{profile.cores} Cores</div>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">MEMORY</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {profile.memoryGb ? `${profile.memoryGb} GB+` : 'Standard'}
            </div>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">DPR</div>
            <div className="text-xs font-bold text-sky-400 mt-0.5">{profile.dpr}x Native</div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div className="text-xs font-arcade text-amber-400 uppercase tracking-wider mb-2.5 flex flex-wrap items-center justify-between gap-1">
            <span>2. GRAPHIC PRESET</span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              suggested: {profile.recommendedGraphicsTier.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(
              [
                {
                  id: 'performance' as GraphicsTier,
                  name: 'PERFORMANCE',
                  tag: 'Lightweight / 60 FPS',
                  desc: 'Flat turf, zero blur, maximum frame rate for phones & low-end devices.',
                  recommended: profile.recommendedGraphicsTier === 'performance',
                },
                {
                  id: 'balanced' as GraphicsTier,
                  name: 'BALANCED',
                  tag: 'Standard Arcade',
                  desc: 'Crisp pitch markings, standard shadows, authentic 90s console feel.',
                  recommended: profile.recommendedGraphicsTier === 'balanced',
                },
                {
                  id: 'high_end' as GraphicsTier,
                  name: 'HIGH',
                  tag: 'Full 32-Bit Glory',
                  desc: 'Quad-shadow floodlights, dynamic lighting, retro CRT scanline bloom.',
                  recommended: profile.recommendedGraphicsTier === 'high_end',
                },
              ] as const
            ).map((preset) => {
              const isSelected = graphicsTier === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setGraphicsTier(preset.id)}
                  className={`min-h-[72px] p-3 rounded-lg border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  {preset.recommended && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-mono text-[9px] font-black rounded uppercase">
                      SUGGESTED
                    </span>
                  )}
                  <div className="font-arcade text-[10px] text-white pr-16">{preset.name}</div>
                  <div className="text-[11px] font-mono text-amber-300 font-bold mt-1">{preset.tag}</div>
                  <div className="text-xs font-sans text-slate-300 mt-1 leading-snug">{preset.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ConsoleModalShell>
  );
};
