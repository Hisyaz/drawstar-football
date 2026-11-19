import React, { useMemo, useState } from 'react';
import { EditorTeamData } from '../../../types/leagueEditor';
import { StadiumDefinition } from '../../../gameplay/types/stadium';
import { StadiumSelectorModal, StadiumConfig } from '../../../gameplay/components/StadiumSelectorModal';
import { StadiumCreatorModal } from '../../../gameplay/components/StadiumCreatorModal';
import { TeamEditorModal } from '../../../gameplay/components/TeamEditorModal';
import { getStadiumById } from '../../../gameplay/game/stadiumRegistry';
import { registerDrawStarExternalTeams } from '../../../gameplay/game/teamDatabase';
import { MacroscopicSkyCamPreview } from '../../../gameplay/components/MacroscopicSkyCamPreview';
import { ensureTeamStadium } from '../../../utils/stadiumAndKeyRoleSystem';
import { editorTeamToGameplayTeam } from '../../../utils/gameplayAdapter';
import { resolveCountryConfederation, resolveDefaultStadiumForTeam } from '../../../utils/confederationStadiumDefaults';
import { Building2, Sliders, Tv, RotateCcw, Sparkles, Eye, MapPin } from 'lucide-react';

interface ClubStadiumSectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubStadiumSection: React.FC<ClubStadiumSectionProps> = ({
  team,
  onUpdate,
  showToast = () => {},
}) => {
  const stadium = ensureTeamStadium(team);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isVenueAtmosphereOpen, setIsVenueAtmosphereOpen] = useState(false);

  const canonicalConfed = useMemo(
    () => resolveCountryConfederation(team.countryCode || team.countryName, team.federation),
    [team.countryCode, team.countryName, team.federation]
  );

  const resolvedDefault = useMemo(
    () =>
      resolveDefaultStadiumForTeam(canonicalConfed, stadium, {
        id: team.id,
        name: team.name,
        country: team.countryName || team.countryCode,
        category: 'club',
      }),
    [canonicalConfed, stadium, team.id, team.name, team.countryName, team.countryCode]
  );

  const confDefault = useMemo(
    () => ({
      confederation: canonicalConfed,
      stadiumId: resolvedDefault.homeStadiumId,
      specialTeamLabel: resolvedDefault.mirroredSpecialTeam.name,
    }),
    [canonicalConfed, resolvedDefault]
  );

  const gameplayTeam = useMemo(() => editorTeamToGameplayTeam(team), [team]);

  const activeStadiumDef: StadiumDefinition = useMemo(() => {
    if (stadium.isCustomOverride && stadium.gameplayStadium) {
      return stadium.gameplayStadium;
    }
    const id = stadium.gameplayStadiumId || resolvedDefault.homeStadiumId;
    return getStadiumById(id) || resolvedDefault.stadium || getStadiumById('santiago_bernabeu');
  }, [stadium, resolvedDefault]);

  const [selectorConfig, setSelectorConfig] = useState<StadiumConfig>(() => ({
    stadiumTier: 'monumental',
    pitchPreset: activeStadiumDef.pitchPreset || 'balanced',
    pitchLengthMeters: activeStadiumDef.pitchLengthMeters || 105,
    pitchWidthMeters: activeStadiumDef.pitchWidthMeters || 68,
    turfQuality: activeStadiumDef.turfQuality || 'pristine',
    mowingPattern: activeStadiumDef.mowingPattern || 'horizontal',
    grassLength: activeStadiumDef.grassLength || 'normal',
    surfaceStatus: activeStadiumDef.surfaceStatus || 'normal',
    weather: 'clear',
    season: 'spring',
    timeOfDay: 'noon',
    seatColor: activeStadiumDef.seatColor || 'auto',
    crowdLevel: 'crowded',
    netTension: activeStadiumDef.netTension || 'moderate',
    goalFrame: activeStadiumDef.goalFrame || 'standard',
    stadiumId: activeStadiumDef.id,
    isHomeVenueLocked: true,
    shape: activeStadiumDef.shape,
    surroundings: activeStadiumDef.surroundings,
    grounds: activeStadiumDef.grounds,
    standGrade: activeStadiumDef.stands.east?.grade || 'grade4_modern',
    benchType: activeStadiumDef.dugouts?.type,
    benchQuality: activeStadiumDef.dugouts?.quality,
    tunnelType: activeStadiumDef.tunnel?.type,
    tunnelSiting: activeStadiumDef.tunnel?.siting,
    hasTrack: activeStadiumDef.hasTrack,
    apronMaterial: activeStadiumDef.apronMaterial || 'grass',
    capacity: activeStadiumDef.capacity,
    fifaCategory: activeStadiumDef.fifaCategory,
    roofCutaway: activeStadiumDef.roofCutaway || 'partial',
    roofStyle: activeStadiumDef.roof?.style,
    ...(stadium.gameplayConfig || {}),
  }));

  const mapCapacityToTier = (cap: number): 1 | 2 | 3 | 4 | 5 => {
    if (cap >= 65000) return 5;
    if (cap >= 42000) return 4;
    if (cap >= 22000) return 3;
    if (cap >= 8000) return 2;
    return 1;
  };

  const handleApplySelectorConfig = (cfg: StadiumConfig) => {
    setSelectorConfig(cfg);
    const chosenStd = cfg.stadiumId ? getStadiumById(cfg.stadiumId) : activeStadiumDef;
    const cap = cfg.capacity || chosenStd?.capacity || stadium.capacity;
    onUpdate((prev) => ({
      ...prev,
      stadium: {
        ...ensureTeamStadium(prev),
        name: chosenStd?.name || stadium.name,
        capacity: cap,
        tier: mapCapacityToTier(cap),
        gameplayStadiumId: chosenStd?.id || cfg.stadiumId,
        gameplayStadium: chosenStd,
        gameplayConfig: cfg,
        isCustomOverride: true,
      },
    }));
    showToast(`Applied ${chosenStd?.name || 'Stadium'} to ${team.name}!`);
  };

  const handleSaveFromCreator = (savedStd: StadiumDefinition) => {
    const cap = savedStd.capacity || stadium.capacity;
    onUpdate((prev) => ({
      ...prev,
      stadium: {
        ...ensureTeamStadium(prev),
        name: savedStd.name,
        capacity: cap,
        tier: mapCapacityToTier(cap),
        gameplayStadiumId: savedStd.id,
        gameplayStadium: savedStd,
        isCustomOverride: true,
      },
    }));
    setSelectorConfig((prev) => ({
      ...prev,
      stadiumId: savedStd.id,
      shape: savedStd.shape,
      surroundings: savedStd.surroundings,
      grounds: savedStd.grounds,
      capacity: cap,
      fifaCategory: savedStd.fifaCategory,
      pitchPreset: savedStd.pitchPreset || prev.pitchPreset,
      pitchLengthMeters: savedStd.pitchLengthMeters || prev.pitchLengthMeters,
      pitchWidthMeters: savedStd.pitchWidthMeters || prev.pitchWidthMeters,
      turfQuality: savedStd.turfQuality || prev.turfQuality,
      mowingPattern: savedStd.mowingPattern || prev.mowingPattern,
      roofCutaway: savedStd.roofCutaway || prev.roofCutaway,
      roofStyle: savedStd.roof?.style || prev.roofStyle,
    }));
    setIsCreatorOpen(false);
    showToast(`Custom stadium "${savedStd.name}" saved to ${team.name}!`);
  };

  const handleResetConfederationDefault = () => {
    const defStd = getStadiumById(confDefault.stadiumId);
    const cap = defStd?.capacity || stadium.capacity;
    onUpdate((prev) => ({
      ...prev,
      stadium: {
        ...ensureTeamStadium(prev),
        name: defStd?.name || stadium.name,
        capacity: cap,
        tier: mapCapacityToTier(cap),
        gameplayStadiumId: confDefault.stadiumId,
        gameplayStadium: undefined,
        gameplayConfig: undefined,
        homeVenueConfig: undefined,
        isCustomOverride: false,
      },
    }));
    showToast(`Reset stadium to ${confDefault.confederation} default (${confDefault.specialTeamLabel})`);
  };

  const openVenueAtmosphereEditor = () => {
    registerDrawStarExternalTeams([gameplayTeam]);
    setIsVenueAtmosphereOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 08
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Building2 className="w-7 h-7 text-emerald-400" />
            STADIUM &amp; HOME VENUE STUDIO
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Powered by the 32-Bit Stadium Creator, Turf &amp; Pitch Dimension Configurator, and Home Venue Sponsors/Fan Culture suite.
          </p>
        </div>

        {/* Status Badge */}
        <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400">
              {stadium.isCustomOverride
                ? 'CUSTOM VENUE OVERRIDE'
                : stadium.gameplayStadiumId
                ? `ASSIGNED LEAGUE STADIUM${activeStadiumDef.slotNumber ? ` • #${String(activeStadiumDef.slotNumber).padStart(3, '0')}` : ''}`
                : `MIRRORS ${confDefault.confederation} SPECIAL TEAM`}
            </div>
            <div className="text-sm font-black text-white">{activeStadiumDef.name}</div>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {activeStadiumDef.capacity.toLocaleString()} Seats • {activeStadiumDef.pitchLengthMeters || 105}m × {activeStadiumDef.pitchWidthMeters || 68}m Pitch
            </div>
          </div>
        </div>
      </div>

      {/* CONFEDERATION / ASSIGNED STADIUM NOTICE */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        stadium.isCustomOverride
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
      }`}>
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
          <div className="text-xs">
            <div className="font-black uppercase tracking-wider">
              {stadium.isCustomOverride
                ? `Custom Club Stadium Active (${activeStadiumDef.name})`
                : `Country League Venue Assigned (${activeStadiumDef.name})`}
            </div>
            <div className="text-[11px] opacity-85 mt-0.5">
              {stadium.isCustomOverride
                ? `Customized for ${team.name}. Reset anytime or pick any venue from the 1–999 stadium catalog.`
                : `Assigned from your league's 3 country stadium types and tuned with ${team.name}'s colors, sponsors, and fan atmosphere.`}
            </div>
          </div>
        </div>
        {stadium.isCustomOverride && (
          <button
            type="button"
            onClick={handleResetConfederationDefault}
            className="min-h-[44px] w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to {confDefault.confederation} Default
          </button>
        )}
      </div>

      {/* LIVE SKY-CAM PREVIEW + ACTION LAUNCHERS (ZERO DUPLICATE INPUTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <Eye className="w-4 h-4 shrink-0" /> Macroscopic Sky-Cam Preview
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 uppercase font-bold shrink-0">
              {activeStadiumDef.fifaCategory || 'CONTINENTAL'}
            </span>
          </div>
          <MacroscopicSkyCamPreview
            stadium={activeStadiumDef}
            timeOfDay={selectorConfig.timeOfDay || 'noon'}
            weather={selectorConfig.weather || 'clear'}
            homeTeam={gameplayTeam}
            awayTeam={gameplayTeam}
            roofCutaway={selectorConfig.roofCutaway || activeStadiumDef.roofCutaway || 'partial'}
            borderClassName="rounded-xl border border-emerald-500/30"
            compactTitle="Macroscopic Sky-Cam Preview"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[9px]">SHAPE &amp; SURROUNDINGS</div>
              <div className="font-bold text-white uppercase">{activeStadiumDef.shape} · {activeStadiumDef.surroundings}</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[9px]">PITCH DIMENSIONS</div>
              <div className="font-bold text-emerald-300">{activeStadiumDef.pitchLengthMeters || 105}m × {activeStadiumDef.pitchWidthMeters || 68}m</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[9px]">SEAT CAPACITY</div>
              <div className="font-bold text-amber-300">{activeStadiumDef.capacity.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Stadium &amp; Venue Suites
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch the dedicated Gameplay-Int editors to configure stands, seat patterns &amp; colors per stand, pitch size presets, turf quality, sponsors, adboards, dugouts, and fan atmosphere.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsCreatorOpen(true)}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Launch Interactive Stadium Creator (Stands &amp; Pitch)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSelectorOpen(true)}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Stadium Selector, Pitch Size &amp; Turf Suite</span>
            </button>

            <button
              type="button"
              onClick={openVenueAtmosphereEditor}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Tv className="w-4 h-4 shrink-0" />
              <span>Sponsors, Adboards, Seat Colors &amp; Fan Culture</span>
            </button>
          </div>
        </div>
      </div>

      {/* UNIFIED GAMEPLAY-INT STADIUM MODALS */}
      <StadiumSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        config={selectorConfig}
        onChangeConfig={setSelectorConfig}
        onApplyAndClose={(cfg) => {
          handleApplySelectorConfig(cfg);
          setIsSelectorOpen(false);
        }}
        homeTeam={gameplayTeam}
        awayTeam={gameplayTeam}
        onSelectStadium={(std) => {
          const cap = std.capacity || stadium.capacity;
          onUpdate((prev) => ({
            ...prev,
            stadium: {
              ...ensureTeamStadium(prev),
              name: std.name,
              capacity: cap,
              tier: mapCapacityToTier(cap),
              gameplayStadiumId: std.id,
              gameplayStadium: std,
              isCustomOverride: true,
            },
          }));
        }}
        onOpenStadiumCreator={() => {
          setIsSelectorOpen(false);
          setIsCreatorOpen(true);
        }}
      />

      <StadiumCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSaveStadium={handleSaveFromCreator}
        initialStadium={activeStadiumDef}
      />

      <TeamEditorModal
        isOpen={isVenueAtmosphereOpen}
        initialTeamId={gameplayTeam.id}
        onClose={() => setIsVenueAtmosphereOpen(false)}
        onSaveTeam={(updatedGpTeam) => {
          onUpdate((prev) => ({
            ...prev,
            stadium: {
              ...ensureTeamStadium(prev),
              gameplayStadiumId: updatedGpTeam.homeStadiumId || activeStadiumDef.id,
              homeVenueConfig: updatedGpTeam.homeVenueConfig,
              isCustomOverride: true,
            },
          }));
          setIsVenueAtmosphereOpen(false);
          showToast(`Saved Sponsors, Adboards & Fan Culture for ${team.name}`);
        }}
      />
    </div>
  );
};
