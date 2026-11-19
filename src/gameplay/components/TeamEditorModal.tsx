/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TeamDefinition,
  TeamSponsor,
  AdboardTier,
  TeamHomeVenueConfig,
  SpecialClubTradition,
} from '../types/team';
import {
  SeatPattern,
  SeatStyle,
  BenchType,
  BenchQualityTier,
  StadiumDefinition,
} from '../types/stadium';
import {
  LawnMowingPattern,
  TurfQuality,
  GrassLength,
  SurfaceStatus,
  NetTension,
  GoalFrameType,
  PitchDimensionPreset,
} from '../types';
import {
  getAllTeams,
  getTeamById,
  saveTeamCustomization,
  resetTeamCustomization,
  getDefaultHomeVenueConfig,
} from '../game/teamDatabase';
import { getAllRegisteredStadiums, getStadiumById, getStadiumCatalogSlots } from '../game/stadiumRegistry';
import {
  INTERNATIONAL_COMMERCIAL_BRANDS,
  getNationalBrandsForCountry,
} from '../../data/fictionalSponsors';
import { audio } from '../game/audio';
import { MacroscopicSkyCamPreview } from './MacroscopicSkyCamPreview';
import {
  Users,
  Building2,
  Tv,
  Sparkles,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  X,
  Volume2,
  Flame,
  Flag,
  HelpCircle,
  Eye,
  Sliders,
  Palette,
  Layers,
  Shield,
  Trophy,
} from 'lucide-react';
import { ConsoleModalShell } from '../../components/common/ConsolePager';

interface TeamEditorModalProps {
  isOpen: boolean;
  initialTeamId: string;
  onClose: () => void;
  onSaveTeam: (updatedTeam: TeamDefinition) => void;
  onTestMatchday?: (team: TeamDefinition) => void;
}

export const TeamEditorModal: React.FC<TeamEditorModalProps> = ({
  isOpen,
  initialTeamId,
  onClose,
  onSaveTeam,
  onTestMatchday,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeamId);
  const [activeTab, setActiveTab] = useState<'general' | 'venue' | 'sponsors' | 'fans' | 'special'>('venue');
  const [team, setTeam] = useState<TeamDefinition>(() => getTeamById(initialTeamId));
  const [config, setConfig] = useState<TeamHomeVenueConfig>(() => {
    const t = getTeamById(initialTeamId);
    return t.homeVenueConfig || getDefaultHomeVenueConfig(t);
  });
  const [isSavedBanner, setIsSavedBanner] = useState(false);
  useEffect(() => {
    const current = getTeamById(selectedTeamId);
    setTeam(current);
    setConfig(current.homeVenueConfig || getDefaultHomeVenueConfig(current));
  }, [selectedTeamId]);

  const basePreviewStd = getStadiumById(config.stadiumId);
  const customizedPreviewStd: StadiumDefinition | null = basePreviewStd
    ? {
        ...basePreviewStd,
        seats: {
          style: 'classic_bucket',
          pattern: config.seatPattern || 'solid',
          colors: config.seatColors?.length
            ? config.seatColors
            : [team.badge.primaryColor, team.badge.secondaryColor || '#ffffff'],
        },
      }
    : null;

  if (!isOpen) return null;

  const allTeams = getAllTeams();
  const allStadiums = getAllRegisteredStadiums();
  const catalogSlots1To999 = getStadiumCatalogSlots(999);

  const handleSelectTeam = (id: string) => {
    audio.playKick(0.2);
    setSelectedTeamId(id);
    const t = getTeamById(id);
    setTeam(t);
    setConfig(t.homeVenueConfig || getDefaultHomeVenueConfig(t));
  };

  const handleSave = () => {
    audio.playKick(0.4);
    const updatedTeam = saveTeamCustomization(team.id, {
      homeVenueConfig: config,
      homeStadiumId: config.stadiumId,
    });
    setTeam({ ...updatedTeam });
    onSaveTeam(updatedTeam);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 2200);
  };

  const handleResetToDefaults = () => {
    audio.playKick(0.3);
    const def = resetTeamCustomization(team.id);
    setTeam({ ...def });
    setConfig(def.homeVenueConfig || getDefaultHomeVenueConfig(def));
    onSaveTeam(def);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 2200);
  };

  // Sponsor Helpers (1 to 3 primary slots, up to 5 max)
  const handleAddSponsor = () => {
    if (config.sponsors.length >= 3) return;
    audio.playKick(0.2);
    const natPool = getNationalBrandsForCountry(team.countryCode || team.country);
    const combinedPool = [...natPool, ...INTERNATIONAL_COMMERCIAL_BRANDS];
    const nextBrand =
      combinedPool.find((b) => !config.sponsors.some((s) => s.name.toUpperCase() === b.name.toUpperCase())) ||
      combinedPool[config.sponsors.length % combinedPool.length];
    const newSp: TeamSponsor = {
      id: `sp_${Date.now()}`,
      name: nextBrand.name,
      colors: nextBrand.colors,
    };
    setConfig({ ...config, sponsors: [...config.sponsors, newSp] });
  };

  const handleRemoveSponsor = (index: number) => {
    audio.playKick(0.2);
    const next = config.sponsors.filter((_, i) => i !== index);
    setConfig({ ...config, sponsors: next });
  };

  const handleUpdateSponsor = (index: number, updates: Partial<TeamSponsor>) => {
    const next = [...config.sponsors];
    next[index] = { ...next[index], ...updates };
    setConfig({ ...config, sponsors: next });
  };

  const handleUpdateSponsorColor = (spIndex: number, colorIndex: 0 | 1 | 2, color: string) => {
    const next = [...config.sponsors];
    const curColors = [...next[spIndex].colors] as [string, string?, string?];
    curColors[colorIndex] = color;
    next[spIndex] = { ...next[spIndex], colors: curColors };
    setConfig({ ...config, sponsors: next });
  };

  // Seat color helper
  const handleSeatColorChange = (idx: number, hex: string) => {
    const nextCols = [...config.seatColors];
    nextCols[idx] = hex;
    setConfig({ ...config, seatColors: nextCols });
  };

  const handleAddSeatColor = () => {
    if (config.seatColors.length >= 4) return;
    setConfig({ ...config, seatColors: [...config.seatColors, '#ffffff'] });
  };

  const handleRemoveSeatColor = (idx: number) => {
    if (config.seatColors.length <= 1) return;
    setConfig({ ...config, seatColors: config.seatColors.filter((_, i) => i !== idx) });
  };

  const venueTabs = [
    { id: 'venue', label: 'VENUE', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'sponsors', label: 'SPONSORS', icon: <Tv className="w-3.5 h-3.5" /> },
    { id: 'fans', label: 'FANS', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'special', label: 'TRADITIONS', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'general', label: 'INFO', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="TEAM & VENUE EDITOR"
      subtitle={`${team.name} (${team.shortName}) · ${team.ratingTier}-Tier (${team.averageOvr} OVR)`}
      badge={isSavedBanner ? 'SAVED!' : undefined}
      icon={<Shield className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-5xl"
      tabs={venueTabs}
      activeTabId={activeTab}
      onTabChange={(id) => {
        audio.playKick(0.15);
        setActiveTab(id as any);
      }}
      bodyClassName="p-3 sm:p-5 bg-gradient-to-b from-slate-900 to-slate-950 space-y-4"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-500 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Revert this team to default canonical venue"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REVERT</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
            {onTestMatchday && (
              <button
                type="button"
                onClick={() => {
                  audio.playKick(0.35);
                  handleSave();
                  onTestMatchday(team);
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>TEST</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="min-h-[48px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-mono text-xs font-black tracking-wider transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSavedBanner ? 'SAVED!' : 'SAVE CHANGES'}</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Active Team Selector Strip */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-xs font-mono font-bold text-slate-300 uppercase">EDITING CLUB / SQUAD:</span>
        <select
          value={selectedTeamId}
          onChange={(e) => handleSelectTeam(e.target.value)}
          className="min-h-[44px] w-full sm:w-auto sm:min-w-[260px] bg-slate-900 border border-slate-700 text-amber-300 text-xs rounded-lg px-3 py-2 font-mono focus:border-amber-400 focus:outline-none"
        >
          {allTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} [{t.ratingTier}]
            </option>
          ))}
        </select>
      </div>

      {activeTab === 'venue' && (
        <div className="space-y-4">
              
              {/* Home Stadium & Custom Name Override */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-black text-amber-400 uppercase flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Home Stadium Assignment & Venue Name</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Applies custom club setup on top of selected stadium
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                      Target Stadium (Catalog 1–999)
                    </label>
                    <select
                      value={config.stadiumId}
                      onChange={(e) => {
                        audio.playKick(0.2);
                        const sId = e.target.value;
                        if (!sId) return;
                        const std = getStadiumById(sId);
                        setConfig({
                          ...config,
                          stadiumId: sId,
                          customStadiumName: config.customStadiumName || std.name,
                        });
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:border-amber-400 focus:outline-none"
                    >
                      {catalogSlots1To999.map(({ slotNumber, stadium }) => {
                        const slotStr = String(slotNumber).padStart(3, '0');
                        if (!stadium) {
                          return (
                            <option key={`slot_${slotNumber}`} value="" disabled>
                              #{slotStr} — (Empty Slot)
                            </option>
                          );
                        }
                        return (
                          <option key={stadium.id} value={stadium.id}>
                            #{slotStr} {stadium.name} ({stadium.city}, {stadium.country}) · {stadium.shape.toUpperCase()}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 uppercase font-bold block mb-1">
                      Custom Stadium Name Override
                    </label>
                    <input
                      type="text"
                      value={config.customStadiumName || ''}
                      onChange={(e) => setConfig({ ...config, customStadiumName: e.target.value })}
                      placeholder="e.g. Anfield, La Caja, Santiago Bernabéu"
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* PHASE A6.1: LIVE MACROSCOPIC PREVIEW CARD */}
                <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col md:flex-row items-center gap-3">
                  {customizedPreviewStd && (
                    <div className="w-full md:w-[404px] shrink-0 flex justify-center">
                      <MacroscopicSkyCamPreview
                        stadium={customizedPreviewStd}
                        timeOfDay="noon"
                        weather="clear"
                        homeTeam={team}
                        badgeText="HOME VENUE SKY CAM"
                        badgeClassName="bg-slate-950/80 border border-amber-400 text-amber-300 font-['Press_Start_2P'] text-[6px]"
                        borderClassName="rounded-lg border border-amber-400/50"
                        compactButtonClassName="rounded-lg border border-amber-400/60 bg-slate-900 hover:bg-slate-800 text-amber-300"
                        compactTitle="Home Venue Sky-Cam"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 w-full text-left space-y-1">
                    <div className="font-['Press_Start_2P'] text-[10px] text-amber-400">
                      {(config.customStadiumName || getStadiumById(config.stadiumId)?.name || 'HOME VENUE').toUpperCase()}
                    </div>
                    <p className="text-[9.5px] font-mono text-slate-300">
                      Footprint: {getStadiumById(config.stadiumId)?.shape.toUpperCase()} · Custom Seat Pattern: {config.seatPattern?.toUpperCase()}
                    </p>
                    <p className="text-[8.5px] font-mono text-slate-400">
                      Live bird's-eye architectural simulation showing customized club colors & field mosaic.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stadium Seats: Pattern & Colors (Same as Stadium Creator) */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-black text-cyan-400 uppercase flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>Grandstand Seats: Pattern & Custom Colors</span>
                  </h3>
                  <button
                    onClick={() => {
                      audio.playKick(0.2);
                      setConfig({
                        ...config,
                        seatColors: [team.badge.primaryColor, team.badge.secondaryColor || '#ffffff'],
                      });
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
                  >
                    Auto-Fill from Club Kit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                      Seating Pattern
                    </label>
                    <select
                      value={config.seatPattern}
                      onChange={(e) => setConfig({ ...config, seatPattern: e.target.value as SeatPattern })}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="solid">Solid (Uniform Club Color)</option>
                      <option value="horizontalBands">Horizontal Color Bands</option>
                      <option value="verticalStripes">Vertical Stripes</option>
                      <option value="perStand">Per-Stand Alternating</option>
                      <option value="lowerUpper">Lower vs Upper Tier Contrast</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        Seat Colors ({config.seatColors.length} of 4)
                      </label>
                      {config.seatColors.length < 4 && (
                        <button
                          onClick={handleAddSeatColor}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Color
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {config.seatColors.map((col, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
                          <input
                            type="color"
                            value={col}
                            onChange={(e) => handleSeatColorChange(idx, e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span className="text-[10px] font-mono uppercase text-slate-300 pr-1">{col}</span>
                          {config.seatColors.length > 1 && (
                            <button
                              onClick={() => handleRemoveSeatColor(idx)}
                              className="text-slate-500 hover:text-rose-400 cursor-pointer p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Goal Net & Dugout Benches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Goal Net */}
                <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
                  <h3 className="text-xs font-mono font-black text-emerald-400 uppercase">
                    🥅 Goal Net & Frame Architecture
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Net Tension
                      </label>
                      <select
                        value={config.netTension}
                        onChange={(e) => setConfig({ ...config, netTension: e.target.value as NetTension })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono"
                      >
                        <option value="loose">Loose (Brazilian Box)</option>
                        <option value="moderate">Moderate Standard</option>
                        <option value="tight">Tight (Modern European)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Frame Style
                      </label>
                      <select
                        value={config.goalFrame}
                        onChange={(e) => setConfig({ ...config, goalFrame: e.target.value as GoalFrameType })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono"
                      >
                        <option value="steel_white">Steel White (Modern)</option>
                        <option value="standard">Standard Box Frame</option>
                        <option value="vintage_wood">Square Vintage Wood</option>
                        <option value="modern_hex">Modern Hex Stanchion</option>
                      </select>
                    </div>

                    <div className="col-span-2 flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-slate-400">Net Cord Color:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={config.netColor || '#ffffff'}
                          onChange={(e) => setConfig({ ...config, netColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <button
                          onClick={() => setConfig({ ...config, netColor: team.badge.primaryColor })}
                          className="px-2 py-0.5 text-[9px] font-mono bg-slate-800 rounded border border-slate-600 hover:text-white"
                        >
                          Club Color
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dugout Benches */}
                <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
                  <h3 className="text-xs font-mono font-black text-purple-400 uppercase">
                    🪑 Player Dugouts & Technical Shelters
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Bench Model
                      </label>
                      <select
                        value={config.benchType}
                        onChange={(e) => setConfig({ ...config, benchType: e.target.value as BenchType })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono"
                      >
                        <option value="recaro_racing">Recaro Racing Leather</option>
                        <option value="covered_sunken">Covered Sunken Dugout</option>
                        <option value="classic_timber">Classic Timber Bench</option>
                        <option value="utilitarian_concrete">Utilitarian Concrete Bunker</option>
                        <option value="folding_chairs">Pitch-Level Folding Chairs</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Quality Tier
                      </label>
                      <select
                        value={config.benchQuality}
                        onChange={(e) => setConfig({ ...config, benchQuality: e.target.value as BenchQualityTier })}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono"
                      >
                        <option value="luxury">Luxury Club Leather</option>
                        <option value="elite_vip">Elite VIP Heated</option>
                        <option value="modern">Modern Professional</option>
                        <option value="classic">Classic Ground</option>
                        <option value="municipal">Municipal Grassroots</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pitch Dimensions & Turf Physical Status (Phase D1.3) */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-black text-emerald-400 uppercase flex items-center gap-1.5">
                    <span>🌱 Home Pitch Dimensions (IFAB Invariance)</span>
                  </h3>
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    Bespoke Pitch Profile per Club / National Squad
                  </span>
                </div>

                {/* 4 Preset Buttons: Compact, Standard, Expansive, Custom */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'compact' as PitchDimensionPreset,
                      label: 'Compact Ground',
                      dims: '100m × 64m',
                      desc: 'Aggressive gegenpressing & low block',
                      length: 100,
                      width: 64,
                    },
                    {
                      id: 'standard' as PitchDimensionPreset,
                      label: 'Standard Venue',
                      dims: '105m × 68m',
                      desc: 'World / Euro balanced benchmark',
                      length: 105,
                      width: 68,
                    },
                    {
                      id: 'expansive' as PitchDimensionPreset,
                      label: 'Expansive Cathedral',
                      dims: '110m × 74m',
                      desc: 'Tiki-taka possession & wide overloads',
                      length: 110,
                      width: 74,
                    },
                    {
                      id: 'custom' as PitchDimensionPreset,
                      label: 'Custom Size',
                      dims: `${config.pitchLengthMeters}m × ${config.pitchWidthMeters}m`,
                      desc: 'Custom length & width dimensions',
                      length: config.pitchLengthMeters,
                      width: config.pitchWidthMeters,
                    },
                  ].map((p) => {
                    const isSelected = (config.pitchPreset || 'standard') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (p.id === 'custom') {
                            setConfig({
                              ...config,
                              pitchPreset: 'custom',
                              pitchLengthMeters: Math.max(100, Math.min(110, config.pitchLengthMeters || 105)),
                              pitchWidthMeters: Math.max(64, Math.min(74, config.pitchWidthMeters || 68)),
                            });
                          } else {
                            setConfig({
                              ...config,
                              pitchPreset: p.id,
                              pitchLengthMeters: p.length,
                              pitchWidthMeters: p.width,
                            });
                          }
                        }}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-400'
                            : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-mono font-bold text-[10px] uppercase truncate">{p.label}</div>
                        <div className="text-[9px] font-semibold text-amber-300 mt-0.5">{p.dims}</div>
                        <div className="text-[7.5px] text-slate-500 mt-0.5 leading-tight">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Sliders (Shown when custom) */}
                {config.pitchPreset === 'custom' && (
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[9px] text-emerald-300 font-mono font-bold">
                      <span>CUSTOM DIMENSIONS (IFAB LEGAL LIMITS: 100-110m L × 64-74m W)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[9px] font-mono text-slate-300 mb-1">
                          <span>Pitch Length (Goal-to-Goal):</span>
                          <span className="text-amber-300 font-bold">{config.pitchLengthMeters}m</span>
                        </div>
                        <input
                          type="range"
                          min={100}
                          max={110}
                          step={1}
                          value={config.pitchLengthMeters}
                          onChange={(e) => setConfig({ ...config, pitchLengthMeters: Number(e.target.value) })}
                          className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] font-mono text-slate-300 mb-1">
                          <span>Pitch Width (Touchline-to-Touchline):</span>
                          <span className="text-amber-300 font-bold">{config.pitchWidthMeters}m</span>
                        </div>
                        <input
                          type="range"
                          min={64}
                          max={74}
                          step={1}
                          value={config.pitchWidthMeters}
                          onChange={(e) => setConfig({ ...config, pitchWidthMeters: Number(e.target.value) })}
                          className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Turf Grade & Base Surface Status */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800/80">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Turf Grade
                    </label>
                    <select
                      value={config.turfQuality}
                      onChange={(e) => setConfig({ ...config, turfQuality: e.target.value as TurfQuality })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono"
                    >
                      <option value="pristine">Pristine (Emerald Sheen)</option>
                      <option value="normal">Normal (Regulation Grass)</option>
                      <option value="poor">Poor (Arid Sandy Patches)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Base Status
                    </label>
                    <select
                      value={config.baseSurfaceStatus}
                      onChange={(e) => setConfig({ ...config, baseSurfaceStatus: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono"
                    >
                      <option value="dry">Dry (Fast Ball Skip)</option>
                      <option value="normal">Normal (Balanced Traction)</option>
                      <option value="wet">Wet (High Gloss & Skids)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: SPONSORS & 4-TIER ADBOARD PERIMETER SYSTEM                  */}
          {/* ================================================================= */}
          {activeTab === 'sponsors' && (
            <div className="space-y-4">
              
              {/* Adboard Technology Tier Card Grid */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
                <h3 className="text-xs font-mono font-black text-amber-400 uppercase flex items-center justify-between">
                  <span>Adboard Perimeter Technology Tier</span>
                  <span className="text-[10px] text-slate-400">Controls hoarding visuals across pitch perimeter</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'basic_paper',
                      title: 'Tier 1: Basic Paper',
                      badge: 'PRINTED PAPER',
                      desc: 'Static paper billboard hoardings around stadium. Alternates/cycles based on # of sponsors.',
                      icon: '📄',
                    },
                    {
                      id: 'classic_electronic',
                      title: 'Tier 2: Classic Roller',
                      badge: 'TRI-VISION PRISMS',
                      desc: 'Mechanical rotating prism slats flipping between sponsors every 15 match seconds.',
                      icon: '🔄',
                    },
                    {
                      id: 'led_ribbon',
                      title: 'Tier 3: LED Ribbon',
                      badge: 'DIGITAL SCREEN',
                      desc: 'Continuous illuminated LED ribbon board with scrolling text and neon accent glow.',
                      icon: '💡',
                    },
                    {
                      id: 'modern_dynamic_led',
                      title: 'Tier 4: Dynamic LED',
                      badge: 'HIGH-TECH STADIUM',
                      desc: 'Synchronized perimeter LED displays, color waves, pulsing transitions, and brand sweeps.',
                      icon: '⚡',
                    },
                  ].map((t) => {
                    const active = config.adboardTier === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          audio.playKick(0.2);
                          setConfig({ ...config, adboardTier: t.id as AdboardTier });
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                            : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-base">{t.icon}</span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                              active ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {t.badge}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-white block">
                            {t.title}
                          </span>
                          <p className="text-[10px] font-mono text-slate-400 mt-1 leading-snug">
                            {t.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Interactive Adboard Preview Strip */}
              <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Pitch-Side Adboard Live Simulation Preview
                </span>
                <div className="h-10 bg-slate-950 border border-slate-800 rounded-lg flex items-center overflow-hidden px-1 gap-1">
                  {config.sponsors.length === 0 ? (
                    <div className="w-full text-center text-slate-500 font-mono text-xs">
                      [ CLEAN ARCHITECTURAL STADIUM WALL · ZERO SPONSORS ]
                    </div>
                  ) : (
                    Array.from({ length: 4 }).map((_, i) => {
                      const sp =
                        config.sponsors.length === 1
                          ? config.sponsors[0]
                          : config.sponsors.length === 2
                          ? config.sponsors[i % 2]
                          : config.sponsors[i % config.sponsors.length];
                      return (
                        <div
                          key={i}
                          style={{
                            backgroundColor: sp.colors[0] || '#0f172a',
                            color: sp.colors[1] || '#ffffff',
                            borderColor: sp.colors[2] || sp.colors[0],
                          }}
                          className={`flex-1 h-8 rounded border flex items-center justify-center font-mono text-[10px] font-black tracking-wider px-2 shadow-inner truncate transition-all ${
                            config.adboardTier === 'modern_dynamic_led' ? 'animate-pulse' : ''
                          }`}
                        >
                          {sp.name}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Sponsor List (1 to 3 sponsors) */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-black text-amber-400 uppercase">
                      Club Commercial Sponsors ({config.sponsors.length} of 3)
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      Assign 1 to 3 fictional national/international sponsors & allocate adboard colors
                    </p>
                  </div>
                  <button
                    disabled={config.sponsors.length >= 3}
                    onClick={handleAddSponsor}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow ${
                      config.sponsors.length >= 3
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD SPONSOR</span>
                  </button>
                </div>

                {config.sponsors.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 font-mono text-xs">
                    No sponsors configured. Click "ADD SPONSOR" to create commercial adboards.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {config.sponsors.map((sp, idx) => (
                      <div
                        key={sp.id || idx}
                        className="bg-slate-900 border border-slate-700/90 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={sp.name}
                            onChange={(e) => handleUpdateSponsor(idx, { name: e.target.value.toUpperCase() })}
                            placeholder="SPONSOR BRAND NAME"
                            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white uppercase font-bold focus:border-amber-400 focus:outline-none flex-1"
                          />
                        </div>

                        {/* 1 to 3 Brand Colors */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">BG:</span>
                            <input
                              type="color"
                              value={sp.colors[0] || '#0f172a'}
                              onChange={(e) => handleUpdateSponsorColor(idx, 0, e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                              title="Background Color"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Text:</span>
                            <input
                              type="color"
                              value={sp.colors[1] || '#ffffff'}
                              onChange={(e) => handleUpdateSponsorColor(idx, 1, e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                              title="Text Color"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Accent/LED:</span>
                            <input
                              type="color"
                              value={sp.colors[2] || sp.colors[0] || '#38bdf8'}
                              onChange={(e) => handleUpdateSponsorColor(idx, 2, e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                              title="Accent / Glowing Neon Color"
                            />
                          </div>

                          <button
                            onClick={() => handleRemoveSponsor(idx)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            title="Delete Sponsor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: FANS & REGIONAL MATCH ATMOSPHERE                           */}
          {/* ================================================================= */}
          {activeTab === 'fans' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-black text-amber-400 uppercase flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Fan Demographics & Matchday Atmosphere Behavior</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Country: {team.country} ({team.confederation.toUpperCase()})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Acoustic Chants & Soundscape
                    </label>
                    <select
                      value={config.fanAcoustics || 'choral'}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setConfig({ ...config, fanAcoustics: val });
                        if (val === 'murga') audio.playMurgaBrassFlourish(0.4);
                        else if (val === 'whistling') audio.playHostileWhistling(0.5);
                        else if (val === 'thunder_clap') audio.playVikingClapCrescendo(0, 0.4);
                        else if (val === 'horns') audio.playContinuousHornsFanfare(0.4);
                        else audio.playKick(0.3);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono"
                    >
                      <option value="choral">Choral Stadium Anthems (British / European)</option>
                      <option value="murga">Murga Brass & Bass Drums (South American)</option>
                      <option value="whistling">Hostile Whistling & Jeering (Balkans / Latin)</option>
                      <option value="thunder_clap">Synchronized Thunder Claps (Nordic)</option>
                      <option value="horns">Vuvuzelas & Continuous Horns (Global)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Hostility Level on Opponent Possession
                    </label>
                    <select
                      value={config.fanHostility || 'moderate'}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setConfig({ ...config, fanHostility: val });
                        if (val === 'hostile' || val === 'cauldron') audio.playHostileWhistling(0.4);
                        else audio.playKick(0.2);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono"
                    >
                      <option value="friendly">Polite / Family Ground</option>
                      <option value="moderate">Moderate Competition</option>
                      <option value="hostile">Intense Hostility & Deafening Boos</option>
                      <option value="cauldron">Intimidating Cauldron (La Caja Style)</option>
                    </select>
                  </div>
                </div>

                {/* Atmosphere Flags, Pyro, Tifo & Wave Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {[
                    { key: 'fanShirtless', label: 'Shirtless Ultras', icon: '🎽' },
                    { key: 'fanFlags', label: 'Scarves & Flags', icon: '🚩' },
                    { key: 'fanFlares', label: 'Pyrotechnic Flares', icon: '🔥' },
                    { key: 'fanPaperShower', label: 'Paper Confetti Shower', icon: '🎊' },
                    { key: 'fanTifo', label: 'Giant Club Tifo', icon: '🖼️' },
                    { key: 'fanMexicanWave', label: '360° Mexican Wave', icon: '🌊' },
                  ].map((item) => {
                    const isChecked = Boolean((config as any)[item.key]);
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          audio.playKick(0.15);
                          setConfig({ ...config, [item.key]: !isChecked });
                        }}
                        className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{item.icon}</span>
                          <span className="text-[10px]">{item.label}</span>
                        </span>
                        <span className="text-xs">{isChecked ? '✓' : '✗'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: SPECIAL CLUB TRADITIONS                                    */}
          {/* ================================================================= */}
          {activeTab === 'special' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <div>
                  <h3 className="text-xs font-mono font-black text-amber-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Special Iconic Club Traditions (Select One)</span>
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    Signature ritual triggered during walkout, kickoff, and goal celebrations
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'none',
                      title: 'Standard Heritage Matchday',
                      desc: 'Traditional matchday entrance without unique visual mechanics.',
                      icon: '⚽',
                    },
                    {
                      id: 'bubbles',
                      title: 'West Ham Bubbles',
                      desc: 'Thousands of iridescent soap bubbles floating across the pitch from sideline machines.',
                      icon: '🫧',
                    },
                    {
                      id: 'poznan',
                      title: 'The Poznań Celebration',
                      desc: 'Supporters link arms with backs to the pitch and jump in unison on goals.',
                      icon: '🔄',
                    },
                    {
                      id: 'viking_clap',
                      title: 'Viking Thunder Clap',
                      desc: 'Synchronized overhead thunder claps starting slow and accelerating to frenzy.',
                      icon: '👏',
                    },
                    {
                      id: 'poropopo',
                      title: 'O Poropopó (Brazil)',
                      desc: 'Corinthians-style lateral bouncing dance chanting in terrace section.',
                      icon: '🕺',
                    },
                    {
                      id: 'yellow_wall',
                      title: 'Yellow Wall Synchronized Bounce',
                      desc: '25,000-fan single-tier standing terrace bouncing in lockstep rhythm.',
                      icon: '🟡',
                    },
                    {
                      id: 'bombonera_tremor',
                      title: 'La Caja Stand Tremor',
                      desc: 'Intense stand bouncing causing subtle camera tactile screen rumble.',
                      icon: '💥',
                    },
                    {
                      id: 'murga_trompetas',
                      title: 'Murga de Trompetas y Bombos',
                      desc: 'Continuous fast-tempo Latin brass and bass drum carnival rhythm.',
                      icon: '🎺',
                    },
                  ].map((trad) => {
                    const active = (config.specialTradition || 'none') === trad.id;
                    return (
                      <button
                        key={trad.id}
                        onClick={() => {
                          audio.playKick(0.2);
                          setConfig({ ...config, specialTradition: trad.id as SpecialClubTradition });
                          if (trad.id === 'murga_trompetas') audio.playMurgaBrassFlourish(0.45);
                          else if (trad.id === 'viking_clap') audio.playVikingClapCrescendo(1, 0.45);
                          else if (trad.id === 'poropopo') audio.playPoropopoRhythm(0.4);
                          else if (trad.id === 'bombonera_tremor') audio.playStandRumble(0.8);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                            : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{trad.icon}</span>
                          {active && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-mono font-bold uppercase">
                              SELECTED
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-white block">
                          {trad.title}
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 mt-1 leading-snug">
                          {trad.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: GENERAL CLUB INFO                                          */}
          {/* ================================================================= */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <h3 className="text-xs font-mono font-black text-amber-400 uppercase">
                  Club Profile & Tactical Identity
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Team Name:</span>
                    <span className="font-bold text-white">{team.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Short Name:</span>
                    <span className="font-bold text-white">{team.shortName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category:</span>
                    <span className="font-bold text-amber-300 uppercase">{team.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Country:</span>
                    <span className="font-bold text-white">{team.country}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Confederation:</span>
                    <span className="font-bold text-white uppercase">{team.confederation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Rating Tier:</span>
                    <span className="font-bold text-amber-400">{team.ratingTier}-Tier ({team.averageOvr} OVR)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs font-sans text-slate-200 leading-relaxed">
                  <span className="text-slate-400 block text-[11px] font-mono mb-1">Description:</span>
                  {team.description}
                </div>
              </div>
            </div>
          )}
    </ConsoleModalShell>
  );
};
