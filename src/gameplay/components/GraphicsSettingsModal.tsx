import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Flame,
  Layers,
  Lock,
  LockOpen,
  Monitor,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Tv,
  X,
  Zap,
} from 'lucide-react';
import { GraphicsSettings, GraphicsTier, RetroFilterType } from '../types';
import { ALL_RETRO_FILTERS, applyPresetTier, unlockAllFilters } from '../game/graphicsConfig';
import { ConsoleModalShell } from '../../components/common/ConsolePager';
import { isMatchFilterUnlocked } from '../../utils/cardDustSystem';
import { isTestModeEnabled } from '../../utils/testModeSystem';

interface GraphicsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GraphicsSettings;
  onChangeSettings: (settings: GraphicsSettings) => void;
}

export const GraphicsSettingsModal: React.FC<GraphicsSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'filters'>('presets');

  if (!isOpen) return null;

  const handleSelectTier = (tier: GraphicsTier) => {
    onChangeSettings(applyPresetTier(settings, tier));
  };

  const handleToggleLever = (
    key:
      | 'quadShadows'
      | 'ambientOcclusion'
      | 'pitchScuffs'
      | 'highDpi'
      | 'volumetricLighting'
      | 'crowdFlashbulbs'
      | 'netSpringPhysics'
      | 'powerVaporTrails'
      | 'videoRefReview'
  ) => {
    onChangeSettings({ ...settings, [key]: !settings[key] });
  };

  const isTestMode = isTestModeEnabled();

  const handleSelectFilter = (filter: RetroFilterType) => {
    const unlocked = isTestMode || filter === 'none' || isMatchFilterUnlocked(filter);
    if (!unlocked) return;
    onChangeSettings({ ...settings, activeFilter: filter });
  };

  const handleUnlockAll = () => {
    if (!isTestMode) return;
    onChangeSettings(unlockAllFilters(settings));
  };

  const tabs = [
    { id: 'presets', label: 'TIERS & LEVERS', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'filters', label: `RETRO FILTERS (${ALL_RETRO_FILTERS.length})`, icon: <Tv className="w-3.5 h-3.5" /> },
  ];

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="GRAPHICS & FILTERS"
      subtitle="Scalable 3-Tier Graphics Pipeline · Hardware Retro Filters"
      icon={<Monitor className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-2xl"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'presets' | 'filters')}
      bodyClassName="p-3 sm:p-5 space-y-4"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-xs font-mono text-slate-300">
            <b className="text-amber-300 uppercase">{settings.activeFilter.replace('_', ' ')}</b> ·{' '}
            <b className="text-emerald-400 uppercase">{settings.tier.replace('_', ' ')}</b>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-black transition cursor-pointer shadow-md active:scale-95"
          >
            CONFIRM & PLAY
          </button>
        </div>
      }
    >
          {activeTab === 'presets' ? (
            <>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">ONE-CLICK MASTER PRESETS</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    ACTIVE TIER: <b className="text-amber-400 uppercase">{settings.tier.replace('_', ' ')}</b>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleSelectTier('performance')}
                    className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                      settings.tier === 'performance'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-['Press_Start_2P'] text-[9px] text-emerald-400">PERFORMANCE</span>
                        {settings.tier === 'performance' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                      <span className="text-[9px] font-mono text-emerald-300/80 block mb-1.5">Fluidity & Battery Saver</span>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Locked 1.0 DPR, flat simplified shadows, disabled canvas blur, static crowd, zero particle overhead. Locked 60 FPS on older phones.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectTier('balanced')}
                    className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                      settings.tier === 'balanced'
                        ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-['Press_Start_2P'] text-[9px] text-amber-400">BALANCED</span>
                        {settings.tier === 'balanced' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                      <span className="text-[9px] font-mono text-amber-300/80 block mb-1.5">Default Vector Standard</span>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Dynamic altitude-scaled shadows, cylinder mower stripes with bevel depressions, sliding turf divots, 3D goal nets.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectTier('high_end')}
                    className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                      settings.tier === 'high_end'
                        ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/50 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-['Press_Start_2P'] text-[9px] text-purple-400">HIGH-END</span>
                        {settings.tier === 'high_end' && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                      </div>
                      <span className="text-[9px] font-mono text-purple-300/80 block mb-1.5">Atmosphere & Showcase</span>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        4-Floodlight Quad Shadows, Cleat AO, persistent pitch gouges, High-DPI Super-Sampling, floodlight bloom, crowd flashes & vapor trails.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">FINE-GRAINED RENDERING LEVERS</span>
                  <span className="text-[9px] font-mono text-slate-400">Custom overrides active immediately</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>4-Floodlight Quad Shadows</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">4 projected multi-angle shadows from corner stadium towers.</p>
                    </div>
                    <button
                      onClick={() => handleToggleLever('quadShadows')}
                      className={`min-h-[44px] min-w-[60px] px-3 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition shrink-0 ${
                        settings.quadShadows ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.quadShadows ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>Cleat Contact AO</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Soft ambient occlusion contact discs beneath player boots.</p>
                    </div>
                    <button
                      onClick={() => handleToggleLever('ambientOcclusion')}
                      className={`min-h-[44px] min-w-[60px] px-3 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition shrink-0 ${
                        settings.ambientOcclusion ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.ambientOcclusion ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Dynamic Pitch Scuffs</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Slide tackle gouges and skid marks persist on turf for the half.</p>
                    </div>
                    <button
                      onClick={() => handleToggleLever('pitchScuffs')}
                      className={`min-h-[44px] min-w-[60px] px-3 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition shrink-0 ${
                        settings.pitchScuffs ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.pitchScuffs ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Monitor className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>High-DPI Super-Sampling</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Renders at native device pixel ratio (up to 2.0x DPR).</p>
                    </div>
                    <button
                      onClick={() => handleToggleLever('highDpi')}
                      className={`min-h-[44px] min-w-[60px] px-3 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition shrink-0 ${
                        settings.highDpi ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.highDpi ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        <span>Volumetric Bloom & Haze</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Atmospheric floodlight bloom radiating from stadium rafters.</p>
                    </div>
                    <button
                      onClick={() => handleToggleLever('volumetricLighting')}
                      className={`min-h-[44px] min-w-[60px] px-3 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition shrink-0 ${
                        settings.volumetricLighting ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.volumetricLighting ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Camera className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>Crowd Camera Flashbulbs</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Dynamic camera flashes pop in the stands on big moments.</p>
                    </div>
                    <button
                      onClick={() => handleToggleLever('crowdFlashbulbs')}
                      className={`min-h-[44px] min-w-[60px] px-3 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition shrink-0 ${
                        settings.crowdFlashbulbs ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.crowdFlashbulbs ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Elastic Net Spring Physics</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Spring-mesh grid deformation with wave ripple decay on shots.</p>
                    </div>
                    <button
                      onClick={() => handleToggleLever('netSpringPhysics')}
                      className={`min-h-[44px] min-w-[60px] px-3 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition shrink-0 ${
                        settings.netSpringPhysics ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.netSpringPhysics ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Supersonic Shot Vapor Trails</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Aerodynamic vapor condensation trail behind power strikes.</p>
                    </div>
                    <button
                      onClick={() => handleToggleLever('powerVaporTrails')}
                      className={`min-h-[44px] min-w-[60px] px-3 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition shrink-0 ${
                        settings.powerVaporTrails ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.powerVaporTrails ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* VideoRef (VIR) TV Review Cut-Scenes */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Tv className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>VideoRef (VIR) TV Replay Reviews</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Authentic 32-bit TV referee monitor review on tight offside &amp; penalty calls.
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleLever('videoRefReview')}
                      className={`min-h-[44px] min-w-[60px] px-3 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition shrink-0 ${
                        settings.videoRefReview ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {settings.videoRefReview ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div>
                  <span className="font-['Press_Start_2P'] text-[10px] text-amber-400 block mb-1">
                    UNLOCKABLE RETRO FILTERS
                  </span>
                  <p className="text-[10px] text-slate-400">
                    GPU-composited CSS hardware layers. Unlock filters in Card Collection → Unlock & Exchange (1,000 Dust each).
                  </p>
                </div>
                {isTestMode && (
                  <button
                    onClick={handleUnlockAll}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <LockOpen className="w-3 h-3 text-amber-400" />
                    <span>UNLOCK ALL</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_RETRO_FILTERS.map((filter) => {
                  const isUnlocked =
                    isTestMode ||
                    filter.id === 'none' ||
                    isMatchFilterUnlocked(filter.id) ||
                    (settings.unlockedFilters || []).includes(filter.id);
                  const isActive = settings.activeFilter === filter.id && isUnlocked;
                  return (
                    <div
                      key={filter.id}
                      onClick={() => {
                        if (isUnlocked) handleSelectFilter(filter.id);
                      }}
                      className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                        isActive
                          ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50 shadow-lg'
                          : isUnlocked
                          ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer text-slate-300'
                          : 'bg-slate-950/70 border-slate-800/70 text-slate-500 opacity-75 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`font-['Press_Start_2P'] text-[9px] ${isActive ? 'text-amber-400' : isUnlocked ? 'text-slate-200' : 'text-slate-400'}`}>
                            {filter.name}
                          </span>
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-300 font-bold">
                            {filter.badge}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-300/80 block mb-1">{filter.era}</span>
                        <p className="text-[10px] text-slate-400 leading-snug">{filter.description}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono text-slate-400">
                          {isUnlocked ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <LockOpen className="w-2.5 h-2.5" /> UNLOCKED
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> 1,000 DUST
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          disabled={!isUnlocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isUnlocked) handleSelectFilter(filter.id);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition ${
                            !isUnlocked
                              ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                              : isActive
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer'
                          }`}
                        >
                          {!isUnlocked ? 'LOCKED' : isActive ? 'ACTIVE' : 'SELECT'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
    </ConsoleModalShell>
  );
};
