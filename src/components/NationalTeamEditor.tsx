import React, { useState, useMemo, useEffect } from 'react';
import {
  LeagueDatabase,
  ManagerData,
  KitConfig,
  StadiumConfig as DrawStarStadiumConfig,
} from '../types/leagueEditor';
import { NationalTeam, Confederation } from '../types/nationalTeam';
import { PlayerCardData, EquipmentSponsorId } from '../types';
import { getNationalTeamsDatabase, updateNationalTeamInDatabase } from '../utils/nationalTeamDatabaseManager';
import { EQUIPMENT_SPONSORS } from '../data/fictionalSponsors';
import { KitRenderer } from './KitRenderer';
import { TeamPlayerEditorModal } from './TeamPlayerEditorModal';
import { TacticalPitchBoard } from '../gameplay/components/TacticalPitchBoard';
import { TacticalGamePlanModal, GamePlanPayload } from '../gameplay/components/TacticalGamePlanModal';
import { StadiumSelectorModal, StadiumConfig as GameplayStadiumConfig } from '../gameplay/components/StadiumSelectorModal';
import { StadiumCreatorModal } from '../gameplay/components/StadiumCreatorModal';
import { TeamEditorModal } from '../gameplay/components/TeamEditorModal';
import { StadiumDefinition } from '../gameplay/types/stadium';
import { FormationName, TacticalPlaystyle } from '../gameplay/types';
import { getStadiumById } from '../gameplay/game/stadiumRegistry';
import { registerDrawStarExternalTeams } from '../gameplay/game/teamDatabase';
import { MacroscopicSkyCamPreview } from '../gameplay/components/MacroscopicSkyCamPreview';
import { nationalTeamToGameplayTeam } from '../utils/gameplayAdapter';
import {
  resolveCountryConfederation,
  resolveDefaultStadiumForTeam,
} from '../utils/confederationStadiumDefaults';
import { getFederationDisplayName } from '../types/competitionEditor';
import {
  Globe,
  Search,
  Shield,
  Shirt,
  User,
  Sliders,
  Building2,
  Users,
  Edit3,
  X,
  Flag,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  Tv,
  MapPin,
} from 'lucide-react';
import { ConsolePaginationBar } from './common/ConsolePager';

interface NationalTeamEditorProps {
  leagueDb?: LeagueDatabase;
  showToast: (msg: string) => void;
  initialTeamId?: string;
  initialTab?: 'identity' | 'kits' | 'tactics' | 'stadium' | 'squad';
  initialSquadTier?: 'Senior' | 'U20' | 'U17';
  onEditPlayerInFullEditor?: (
    team: NationalTeam,
    player: PlayerCardData,
    slotNumber: number,
    tier: 'Senior' | 'U20' | 'U17'
  ) => void;
}

const CONFEDERATIONS: { key: Confederation | 'ALL'; label: string; count: number }[] = [
  { key: 'ALL', label: 'All Nations', count: 50 },
  { key: 'UEFA', label: 'Euro (Europe)', count: 23 },
  { key: 'CONMEBOL', label: 'Sudamericonferencia (South America)', count: 7 },
  { key: 'CAF', label: 'AF (Africa)', count: 9 },
  { key: 'CONCACAF', label: 'NAF (N. America)', count: 6 },
  { key: 'AFC', label: 'AFN (Asia)', count: 4 },
  { key: 'OFC', label: 'OCE (Oceania)', count: 1 },
];

export const NationalTeamEditor: React.FC<NationalTeamEditorProps> = ({
  leagueDb,
  showToast,
  initialTeamId,
  initialTab,
  initialSquadTier,
  onEditPlayerInFullEditor,
}) => {
  const [nationalTeams, setNationalTeams] = useState<NationalTeam[]>(() => getNationalTeamsDatabase(leagueDb));
  const [selectedConfederation, setSelectedConfederation] = useState<Confederation | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(initialTeamId || null);

  // Active Editor Tab for Selected Team
  const [activeTab, setActiveTab] = useState<'identity' | 'kits' | 'tactics' | 'stadium' | 'squad'>(
    initialTab || 'identity'
  );
  const [activeSquadTier, setActiveSquadTier] = useState<'Senior' | 'U20' | 'U17'>(
    initialSquadTier || 'Senior'
  );
  const [nationsPage, setNationsPage] = useState(1);
  const [squadPage, setSquadPage] = useState(1);

  useEffect(() => {
    setNationsPage(1);
  }, [selectedConfederation, searchQuery]);

  useEffect(() => {
    setSquadPage(1);
  }, [selectedTeamId, activeSquadTier]);

  // Gameplay Modal States
  const [isGamePlanOpen, setIsGamePlanOpen] = useState(false);
  const [isStadiumSelectorOpen, setIsStadiumSelectorOpen] = useState(false);
  const [isStadiumCreatorOpen, setIsStadiumCreatorOpen] = useState(false);
  const [isVenueAtmosphereOpen, setIsVenueAtmosphereOpen] = useState(false);

  useEffect(() => {
    setNationalTeams(getNationalTeamsDatabase(leagueDb));
  }, [leagueDb]);

  useEffect(() => {
    if (initialTeamId) setSelectedTeamId(initialTeamId);
    if (initialTab) setActiveTab(initialTab);
    if (initialSquadTier) setActiveSquadTier(initialSquadTier);
  }, [initialTeamId, initialTab, initialSquadTier]);

  // Player Editor Modal State
  const [editingPlayerModal, setEditingPlayerModal] = useState<{
    slotNumber: number;
    player: PlayerCardData;
    tier: 'Senior' | 'U20' | 'U17';
  } | null>(null);

  // Filter national teams by Confederation and Search
  const filteredTeams = useMemo(() => {
    return nationalTeams.filter((t) => {
      if (selectedConfederation !== 'ALL' && t.confederation !== selectedConfederation) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = t.nation.name.toLowerCase().includes(q);
        const codeMatch = t.nation.code.toLowerCase().includes(q);
        const managerMatch = (t.manager as any)?.name?.toLowerCase().includes(q);
        const stadiumMatch = t.stadium?.name?.toLowerCase().includes(q);
        return nameMatch || codeMatch || managerMatch || stadiumMatch;
      }
      return true;
    }).sort((a, b) => (a.fifaRanking || 99) - (b.fifaRanking || 99));
  }, [nationalTeams, selectedConfederation, searchQuery]);

  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return nationalTeams.find((t) => t.id === selectedTeamId) || null;
  }, [nationalTeams, selectedTeamId]);

  const gameplaySelectedTeam = useMemo(() => {
    if (!selectedTeam) return null;
    return nationalTeamToGameplayTeam(selectedTeam);
  }, [selectedTeam]);

  const resolvedConfedVenue = useMemo(() => {
    if (!selectedTeam) return null;
    const conf = resolveCountryConfederation(
      selectedTeam.nation.code || selectedTeam.nation.name,
      selectedTeam.confederation
    );
    const resolved = resolveDefaultStadiumForTeam(conf, selectedTeam.stadium, {
      id: selectedTeam.id,
      name: selectedTeam.nation.name,
      country: selectedTeam.nation.name,
      category: 'national',
    });
    return {
      confederation: conf,
      ...resolved,
    };
  }, [selectedTeam]);

  const activeStadiumDef: StadiumDefinition = useMemo(() => {
    if (selectedTeam?.stadium?.isCustomOverride && selectedTeam.stadium.gameplayStadium) {
      return selectedTeam.stadium.gameplayStadium;
    }
    const id = selectedTeam?.stadium?.gameplayStadiumId || resolvedConfedVenue?.homeStadiumId || 'santiago_bernabeu';
    return getStadiumById(id) || resolvedConfedVenue?.stadium || getStadiumById('santiago_bernabeu');
  }, [selectedTeam, resolvedConfedVenue]);

  const [stadiumSelectorConfig, setStadiumSelectorConfig] = useState<GameplayStadiumConfig>(() => ({
    stadiumTier: 'monumental',
    pitchPreset: 'balanced',
    pitchLengthMeters: 105,
    pitchWidthMeters: 68,
    turfQuality: 'pristine',
    mowingPattern: 'horizontal',
    grassLength: 'normal',
    surfaceStatus: 'normal',
    weather: 'clear',
    season: 'spring',
    timeOfDay: 'noon',
    seatColor: 'auto',
    crowdLevel: 'crowded',
    netTension: 'moderate',
    goalFrame: 'standard',
  }));

  useEffect(() => {
    if (!selectedTeam || !activeStadiumDef) return;
    setStadiumSelectorConfig((prev) => ({
      ...prev,
      pitchPreset: activeStadiumDef.pitchPreset || 'balanced',
      pitchLengthMeters: activeStadiumDef.pitchLengthMeters || 105,
      pitchWidthMeters: activeStadiumDef.pitchWidthMeters || 68,
      turfQuality: activeStadiumDef.turfQuality || 'pristine',
      mowingPattern: activeStadiumDef.mowingPattern || 'horizontal',
      grassLength: activeStadiumDef.grassLength || 'normal',
      surfaceStatus: activeStadiumDef.surfaceStatus || 'normal',
      seatColor: activeStadiumDef.seatColor || 'auto',
      netTension: activeStadiumDef.netTension || 'moderate',
      goalFrame: activeStadiumDef.goalFrame || 'standard',
      stadiumId: activeStadiumDef.id,
      isHomeVenueLocked: true,
      shape: activeStadiumDef.shape,
      surroundings: activeStadiumDef.surroundings,
      grounds: activeStadiumDef.grounds,
      capacity: activeStadiumDef.capacity,
      fifaCategory: activeStadiumDef.fifaCategory,
      roofCutaway: activeStadiumDef.roofCutaway || 'partial',
      roofStyle: activeStadiumDef.roof?.style,
      ...(selectedTeam.stadium?.gameplayConfig || {}),
    }));
  }, [selectedTeamId, activeStadiumDef?.id]);

  const mapCapacityToTier = (cap: number): 1 | 2 | 3 | 4 | 5 => {
    if (cap >= 65000) return 5;
    if (cap >= 42000) return 4;
    if (cap >= 22000) return 3;
    if (cap >= 8000) return 2;
    return 1;
  };

  // Handler to save full team changes
  const handleUpdateTeam = (updated: NationalTeam, quiet = false) => {
    const updatedList = updateNationalTeamInDatabase(updated);
    setNationalTeams(updatedList);
    if (!quiet) {
      showToast(`Saved changes for ${updated.nation.name} National Team`);
    }
  };

  // Handler for saving edited player inside a tier
  const handleSavePlayerInTier = (updatedPlayer: PlayerCardData) => {
    if (!selectedTeam || !editingPlayerModal) return;

    const tier = editingPlayerModal.tier;
    const teamCopy = { ...selectedTeam };

    let targetSquad = tier === 'Senior' ? [...teamCopy.squad] : tier === 'U20' ? [...(teamCopy.u20Squad || [])] : [...(teamCopy.u17Squad || [])];

    const idx = targetSquad.findIndex((p) => p.id === updatedPlayer.id || p.shirtNumber === updatedPlayer.shirtNumber);
    if (idx !== -1) {
      targetSquad[idx] = updatedPlayer;
    } else {
      targetSquad.push(updatedPlayer);
    }

    if (tier === 'Senior') teamCopy.squad = targetSquad;
    else if (tier === 'U20') teamCopy.u20Squad = targetSquad;
    else if (tier === 'U17') teamCopy.u17Squad = targetSquad;

    handleUpdateTeam(teamCopy);
    setEditingPlayerModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl relative overflow-hidden pixel-bevel-raised">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 font-arcade">
              <Globe className="w-4 h-4" />
              World Ranking Database
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3 font-pixel pixel-text-shadow">
              NATIONAL TEAM EDITOR
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 pixel-corners font-bold font-arcade">
                TOP 50 NATIONS
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-retro">
              Manage complete Senior, U20, and U17 squads, tactical setups, national managers, and kits across all 50 official World national teams.
            </p>
          </div>

          {selectedTeam && (
            <button
              onClick={() => setSelectedTeamId(null)}
              className="min-h-[44px] self-start md:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 pixel-corners text-xs font-bold flex items-center gap-2 transition-all shadow-md font-pixel uppercase cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to National Teams List
            </button>
          )}
        </div>
      </div>

      {!selectedTeam ? (
        /* MAIN LIST VIEW OF ALL 50 NATIONS */
        (() => {
          const NATIONS_PER_PAGE = 8;
          const totalNationPages = Math.max(1, Math.ceil(filteredTeams.length / NATIONS_PER_PAGE));
          const safeNationsPage = Math.min(nationsPage, totalNationPages);
          const pagedNations = filteredTeams.slice(
            (safeNationsPage - 1) * NATIONS_PER_PAGE,
            safeNationsPage * NATIONS_PER_PAGE
          );
          return (
        <div className="space-y-5">
          {/* Confederation Tabs & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950 p-3 sm:p-4 pixel-corners border border-slate-800">
            {/* Confederation Selector */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5">
              {CONFEDERATIONS.map((conf) => (
                <button
                  key={conf.key}
                  onClick={() => setSelectedConfederation(conf.key)}
                  className={`min-h-[44px] px-3 py-1.5 pixel-corners text-xs font-bold transition-all flex items-center justify-center sm:justify-start gap-1.5 font-pixel uppercase cursor-pointer truncate ${
                    selectedConfederation === conf.key
                      ? 'bg-blue-600 text-white border border-blue-400 pixel-bevel-raised shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span className="truncate">{conf.label}</span>
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search nation, code, manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[44px] bg-slate-900 border border-slate-800 pixel-corners pl-10 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-retro transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear Search"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {totalNationPages > 1 && (
            <ConsolePaginationBar
              currentPage={safeNationsPage}
              totalPages={totalNationPages}
              onPageChange={setNationsPage}
              totalItems={filteredTeams.length}
              pageSize={NATIONS_PER_PAGE}
              label="NATIONS"
            />
          )}

          {/* National Teams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pagedNations.map((team) => {
              const managerObj = team.manager as ManagerData;
              const seniorCount = team.squad?.length || 35;
              const u20Count = team.u20Squad?.length || 35;
              const u17Count = team.u17Squad?.length || 35;

              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 pixel-corners p-5 shadow-lg hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-blue-500/20 transition-all" />

                  <div>
                    {/* Top Header: Ranking & Confederation */}
                    <div className="flex items-center justify-between mb-3 font-arcade">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 pixel-corners text-xs font-black">
                          #{team.fifaRanking || '?'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 pixel-corners text-[10px] font-bold uppercase tracking-wider">
                          {getFederationDisplayName(team.confederation || 'FIFA')}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-900/40 text-blue-300 border border-blue-700/40 pixel-corners text-xs font-black">
                        OVR {team.teamOvr || team.ovr || 75}
                      </span>
                    </div>

                    {/* Nation Name & Flag */}
                    <div className="flex items-center gap-3 my-3">
                      <div className="w-12 h-12 pixel-corners bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                        <span className={`fi fi-${team.nation.iso?.toLowerCase()}`}></span>
                        {!team.nation.iso && <Flag className="w-6 h-6 text-slate-400" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors font-pixel">
                          {team.nation.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium font-retro">
                          {team.nation.code} National Football Team
                        </p>
                      </div>
                    </div>

                    {/* Manager & Tactical Info */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs font-retro">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          Manager:
                        </span>
                        <span className="font-bold text-slate-200 font-pixel">
                          {managerObj?.name || 'Head Coach'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                          Primary Tactic:
                        </span>
                        <span className="font-bold text-slate-200 capitalize font-arcade">
                          {managerObj?.primaryTactic?.formation || '4-3-3'} ({managerObj?.primaryTactic?.style || 'possession'})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          Stadium:
                        </span>
                        <span className="font-medium text-slate-300 truncate max-w-[140px]">
                          {team.stadium?.name || 'National Stadium'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer: Squad Summary & Action */}
                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold font-arcade">
                      <span className="px-1.5 py-0.5 bg-slate-800 pixel-corners text-slate-300">Sr: {seniorCount}</span>
                      <span className="px-1.5 py-0.5 bg-slate-800 pixel-corners text-slate-300">U20: {u20Count}</span>
                      <span className="px-1.5 py-0.5 bg-slate-800 pixel-corners text-slate-300">U17: {u17Count}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform font-pixel">
                      Edit Team
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalNationPages > 1 && (
            <ConsolePaginationBar
              currentPage={safeNationsPage}
              totalPages={totalNationPages}
              onPageChange={setNationsPage}
              totalItems={filteredTeams.length}
              pageSize={NATIONS_PER_PAGE}
              label="NATIONS"
            />
          )}
        </div>
          );
        })()
      ) : (
        /* INDIVIDUAL NATIONAL TEAM EDITOR VIEW */
        <div className="space-y-6">
          {/* Team Selected Banner */}
          <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 pixel-bevel-raised">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 pixel-corners bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-lg">
                <span className={`fi fi-${selectedTeam.nation.iso?.toLowerCase()}`}></span>
                {!selectedTeam.nation.iso && <Flag className="w-8 h-8 text-amber-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2 font-arcade">
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 pixel-corners text-xs font-black">
                    World Rank #{selectedTeam.fifaRanking}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 pixel-corners text-[10px] font-bold uppercase tracking-wider">
                    {getFederationDisplayName(selectedTeam.confederation || 'FIFA')}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1 font-pixel pixel-text-shadow">
                  {selectedTeam.nation.name} National Team
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-retro">
                  National Team OVR: <strong className="text-amber-300">{selectedTeam.teamOvr || selectedTeam.ovr || 75}</strong> • Senior Pool: {selectedTeam.squad?.length || 35} Players
                </p>
              </div>
            </div>

            {/* Navigation Tabs for Selected Team */}
            {(() => {
              const teamTabs = [
                { id: 'identity', label: 'Identity & Info', icon: Globe },
                { id: 'kits', label: 'National Kits', icon: Shirt },
                { id: 'tactics', label: 'Manager & Tactics', icon: Sliders },
                { id: 'stadium', label: 'National Stadium', icon: Building2 },
                { id: 'squad', label: 'Squad Pool (35)', icon: Users },
              ] as const;
              const currentIdx = Math.max(0, teamTabs.findIndex((tb) => tb.id === activeTab));
              return (
                <>
                  {/* Mobile Console Tab Switcher */}
                  <div className="flex md:hidden items-center justify-between gap-2 bg-slate-950 p-2 pixel-corners border border-slate-800 w-full">
                    <button
                      type="button"
                      onClick={() => setActiveTab(teamTabs[(currentIdx - 1 + teamTabs.length) % teamTabs.length].id)}
                      aria-label="Previous Section"
                      className="min-w-[44px] min-h-[44px] bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white cursor-pointer shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0 text-center">
                      <div className="text-[10px] font-mono text-slate-400">
                        PAGE {currentIdx + 1} / {teamTabs.length}
                      </div>
                      <div className="text-xs font-black text-amber-300 uppercase truncate font-pixel">
                        {teamTabs[currentIdx].label}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab(teamTabs[(currentIdx + 1) % teamTabs.length].id)}
                      aria-label="Next Section"
                      className="min-w-[44px] min-h-[44px] bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white cursor-pointer shrink-0"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Desktop Tabs */}
                  <div className="hidden md:flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 pixel-corners border border-slate-800">
                    {teamTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`min-h-[44px] px-3.5 py-2 pixel-corners text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap font-pixel uppercase cursor-pointer ${
                            activeTab === tab.id
                              ? 'bg-amber-400 text-slate-950 pixel-bevel-raised shadow-md font-black'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>

          {/* TAB 1: IDENTITY & BASIC INFO */}
          {activeTab === 'identity' && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 font-pixel">
                <Globe className="w-5 h-5 text-amber-400" />
                National Team Identity & Federation Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-retro">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Nation Name
                  </label>
                  <input
                    type="text"
                    value={selectedTeam.nation.name}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        nation: { ...selectedTeam.nation, name: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Nation Code (3 letters)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={selectedTeam.nation.code}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        nation: { ...selectedTeam.nation, code: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    ISO Country Flag Code (2 letters / gb-eng)
                  </label>
                  <input
                    type="text"
                    value={selectedTeam.nation.iso}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        nation: { ...selectedTeam.nation, iso: e.target.value.toLowerCase() },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Confederation
                  </label>
                  <select
                    value={selectedTeam.confederation || 'UEFA'}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        confederation: e.target.value as Confederation,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="UEFA">Euro (Europe)</option>
                    <option value="CONMEBOL">Sudamericonferencia (South America)</option>
                    <option value="CAF">AF (Africa)</option>
                    <option value="CONCACAF">NAF (North/Central America)</option>
                    <option value="AFC">AFN (Asia)</option>
                    <option value="OFC">OCE (Oceania)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    World Ranking
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={selectedTeam.fifaRanking || 1}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        fifaRanking: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    National Team Rating (OVR)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={99}
                    value={selectedTeam.teamOvr || selectedTeam.ovr || 75}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        teamOvr: parseInt(e.target.value) || 75,
                        ovr: parseInt(e.target.value) || 75,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KITS */}
          {activeTab === 'kits' && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 font-pixel">
                <Shirt className="w-5 h-5 text-amber-400" />
                National Team Kit Configuration
              </h3>

              {/* Uniform / Equipment Sponsor Selector */}
              <div className="bg-slate-950 border border-slate-800 p-4 pixel-corners flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label
                    htmlFor="national-equipment-sponsor-select"
                    className="block text-xs font-bold text-amber-400 uppercase tracking-wider font-arcade"
                  >
                    Uniform &amp; Equipment Sponsor
                  </label>
                  <p className="text-xs text-slate-400 font-retro mt-0.5">
                    Select national federation kit supplier or Generic (No Brand).
                  </p>
                </div>
                <select
                  id="national-equipment-sponsor-select"
                  value={selectedTeam.equipmentSponsor || selectedTeam.homeKit?.equipmentSponsor || 'generic'}
                  onChange={(e) => {
                    const eqId = e.target.value as EquipmentSponsorId;
                    handleUpdateTeam({
                      ...selectedTeam,
                      equipmentSponsor: eqId,
                      homeKit: {
                        color1: selectedTeam.homeKit?.color1 || '#38bdf8',
                        color2: selectedTeam.homeKit?.color2 || '#ffffff',
                        pattern: selectedTeam.homeKit?.pattern || 'stripes',
                        ...selectedTeam.homeKit,
                        equipmentSponsor: eqId,
                      },
                      awayKit: {
                        color1: selectedTeam.awayKit?.color1 || '#1e3a8a',
                        color2: selectedTeam.awayKit?.color2 || '#ffffff',
                        pattern: selectedTeam.awayKit?.pattern || 'solid',
                        ...selectedTeam.awayKit,
                        equipmentSponsor: eqId,
                      },
                    });
                  }}
                  className="min-h-[44px] sm:w-64 bg-slate-900 border border-slate-700 text-white text-xs font-bold px-3 py-2 pixel-corners focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  {EQUIPMENT_SPONSORS.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Home Kit */}
                <div className="bg-slate-950 border border-slate-800 p-5 pixel-corners space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-arcade">
                    Home Kit
                  </h4>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-slate-900 pixel-corners p-2 flex items-center justify-center border border-slate-800">
                      <KitRenderer
                        kit={{
                          ...(selectedTeam.homeKit || { color1: '#38bdf8', color2: '#ffffff', pattern: 'stripes' }),
                          equipmentSponsor: selectedTeam.equipmentSponsor || selectedTeam.homeKit?.equipmentSponsor,
                        }}
                      />
                    </div>
                    <div className="space-y-2 flex-1 font-retro">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 font-arcade">Primary Color</label>
                        <input
                          type="color"
                          value={selectedTeam.homeKit?.color1 || '#38bdf8'}
                          onChange={(e) =>
                            handleUpdateTeam({
                              ...selectedTeam,
                              homeKit: { ...selectedTeam.homeKit, color1: e.target.value } as KitConfig,
                            })
                          }
                          className="w-full h-9 bg-slate-900 border border-slate-800 pixel-corners cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 font-arcade">Secondary Color</label>
                        <input
                          type="color"
                          value={selectedTeam.homeKit?.color2 || '#ffffff'}
                          onChange={(e) =>
                            handleUpdateTeam({
                              ...selectedTeam,
                              homeKit: { ...selectedTeam.homeKit, color2: e.target.value } as KitConfig,
                            })
                          }
                          className="w-full h-9 bg-slate-900 border border-slate-800 pixel-corners cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Away Kit */}
                <div className="bg-slate-950 border border-slate-800 p-5 pixel-corners space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-arcade">
                    Away Kit
                  </h4>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-slate-900 pixel-corners p-2 flex items-center justify-center border border-slate-800">
                      <KitRenderer
                        kit={{
                          ...(selectedTeam.awayKit || { color1: '#1e3a8a', color2: '#ffffff', pattern: 'solid' }),
                          equipmentSponsor: selectedTeam.equipmentSponsor || selectedTeam.awayKit?.equipmentSponsor,
                        }}
                      />
                    </div>
                    <div className="space-y-2 flex-1 font-retro">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 font-arcade">Primary Color</label>
                        <input
                          type="color"
                          value={selectedTeam.awayKit?.color1 || '#1e3a8a'}
                          onChange={(e) =>
                            handleUpdateTeam({
                              ...selectedTeam,
                              awayKit: { ...selectedTeam.awayKit, color1: e.target.value } as KitConfig,
                            })
                          }
                          className="w-full h-9 bg-slate-900 border border-slate-800 pixel-corners cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 font-arcade">Secondary Color</label>
                        <input
                          type="color"
                          value={selectedTeam.awayKit?.color2 || '#ffffff'}
                          onChange={(e) =>
                            handleUpdateTeam({
                              ...selectedTeam,
                              awayKit: { ...selectedTeam.awayKit, color2: e.target.value } as KitConfig,
                            })
                          }
                          className="w-full h-9 bg-slate-900 border border-slate-800 pixel-corners cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGER & TACTICS (POWERED BY GAMEPLAY-INT TACTICAL ENGINE) */}
          {activeTab === 'tactics' && gameplaySelectedTeam && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 font-pixel">
                    <Sliders className="w-5 h-5 text-amber-400" />
                    National Manager &amp; 32-Bit Tactical Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-retro">
                    Single unified tactical planner: drag formation nodes, customize philosophy, and set specialist kickers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGamePlanOpen(true)}
                  className="min-h-[44px] w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition pixel-corners shrink-0 font-pixel"
                >
                  <Sliders className="w-4 h-4" />
                  Open Full Tactical Game Plan
                </button>
              </div>

              {/* Manager Identity Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-4 pixel-corners border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Head Coach / Manager Name
                  </label>
                  <input
                    type="text"
                    value={(selectedTeam.manager as any)?.name || ''}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        manager: { ...selectedTeam.manager, name: e.target.value } as any,
                      })
                    }
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 font-retro"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-arcade">
                    Manager Nationality
                  </label>
                  <input
                    type="text"
                    value={(selectedTeam.manager as any)?.nationality || selectedTeam.nation.name}
                    onChange={(e) =>
                      handleUpdateTeam({
                        ...selectedTeam,
                        manager: { ...selectedTeam.manager, nationality: e.target.value } as any,
                      })
                    }
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-800 pixel-corners px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 font-retro"
                  />
                </div>
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-950 border border-slate-800 pixel-corners p-3">
                  <div className="text-[10px] text-slate-400">FORMATION</div>
                  <div className="text-sm font-black text-amber-400">{gameplaySelectedTeam.preferredFormation}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 pixel-corners p-3">
                  <div className="text-[10px] text-slate-400">TACTICAL PHILOSOPHY</div>
                  <div className="text-sm font-black text-emerald-400 uppercase">{gameplaySelectedTeam.tacticalPlaystyle}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 pixel-corners p-3">
                  <div className="text-[10px] text-slate-400">NATIONAL SQUAD POOL</div>
                  <div className="text-sm font-black text-white">{selectedTeam.squad?.length || 0} Senior Players</div>
                </div>
              </div>

              {/* Gameplay Tactical Pitch Board */}
              <div className="bg-slate-950 border border-slate-800 pixel-corners p-2.5 sm:p-4 h-[460px] sm:h-[620px] flex flex-col">
                <TacticalPitchBoard
                  team={gameplaySelectedTeam}
                  side="home"
                  selectedPlayerId={null}
                  onSelectPlayer={() => setIsGamePlanOpen(true)}
                  formation={gameplaySelectedTeam.preferredFormation as FormationName}
                  onChangeFormation={(f) => {
                    const mgrObj = (selectedTeam.manager || { name: 'Head Coach', nationality: selectedTeam.nation.name }) as any;
                    const prevPrimary = mgrObj.primaryTactic || {};
                    handleUpdateTeam({
                      ...selectedTeam,
                      manager: {
                        ...mgrObj,
                        preferredFormation: f,
                        primaryTactic: {
                          ...prevPrimary,
                          formation: f as any,
                          playstyle: prevPrimary.playstyle || gameplaySelectedTeam.tacticalPlaystyle,
                        },
                      },
                    });
                  }}
                  tacticalPlaystyle={gameplaySelectedTeam.tacticalPlaystyle as TacticalPlaystyle}
                  captainId={gameplaySelectedTeam.roles?.captainId}
                  activeKit={gameplaySelectedTeam.kit}
                />
              </div>

              <TacticalGamePlanModal
                isOpen={isGamePlanOpen}
                onClose={() => setIsGamePlanOpen(false)}
                initialHomeTeam={gameplaySelectedTeam}
                initialAwayTeam={gameplaySelectedTeam}
                initialHomeFormation={gameplaySelectedTeam.preferredFormation}
                initialAwayFormation={gameplaySelectedTeam.preferredFormation}
                initialHomePlaystyle={gameplaySelectedTeam.tacticalPlaystyle}
                initialAwayPlaystyle={gameplaySelectedTeam.tacticalPlaystyle}
                initialHomeTactics={gameplaySelectedTeam.tactics}
                initialAwayTactics={gameplaySelectedTeam.tactics}
                initialHomeRoles={gameplaySelectedTeam.roles}
                initialAwayRoles={gameplaySelectedTeam.roles}
                onApplyGamePlan={(plan: GamePlanPayload) => {
                  const mgrObj = (selectedTeam.manager || { name: 'Head Coach', nationality: selectedTeam.nation.name }) as any;
                  const prevPrimary = mgrObj.primaryTactic || {};
                  // Sync updated player roles/playstyles onto senior squad where matched
                  const gpById = new Map(plan.homeTeam.players.map((p) => [p.id, p]));
                  const updatedSquad = (selectedTeam.squad || []).map((card) => {
                    const gp = gpById.get(card.id);
                    if (!gp) return card;
                    return {
                      ...card,
                      subPosition: gp.subPosition,
                      playStyle: gp.playstyle,
                      shirtNumber: gp.number,
                      number: gp.number,
                    };
                  });

                  handleUpdateTeam({
                    ...selectedTeam,
                    squad: updatedSquad,
                    tacticalRoles: plan.homeRoles,
                    manager: {
                      ...mgrObj,
                      tactic: plan.homePlaystyle,
                      preferredFormation: plan.homeFormation,
                      primaryTactic: {
                        ...prevPrimary,
                        formation: plan.homeFormation as any,
                        playstyle: plan.homePlaystyle as any,
                        defensiveLine: plan.homeTactics.defensiveLine as any,
                        defensiveStyle: plan.homeTactics.defensiveStyle as any,
                        offsideTrap: plan.homeTactics.offsideTrap ? 'YES' : 'NO',
                        compactness: plan.homeTactics.compactness as any,
                        passingStyle: plan.homeTactics.creation as any,
                        finalThirdApproach: plan.homeTactics.finalThird as any,
                        teamShape: plan.homeTactics.shape as any,
                        attackingSupport: plan.homeTactics.runs as any,
                      },
                    } as ManagerData,
                  });
                }}
              />
            </div>
          )}

          {/* TAB 4: STADIUM (POWERED BY GAMEPLAY-INT STADIUM SUITE & CONFEDERATION DEFAULTS) */}
          {activeTab === 'stadium' && gameplaySelectedTeam && resolvedConfedVenue && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 font-pixel">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    National Stadium &amp; Venue Studio
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-retro">
                    Mirrors your Confederation Special Team stadium by default unless overridden using the Gameplay Stadium Suite.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 pixel-corners text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    {selectedTeam.stadium?.isCustomOverride
                      ? 'CUSTOM NATIONAL VENUE'
                      : `MIRRORS ${resolvedConfedVenue.confederation} SPECIAL TEAM`}
                  </div>
                  <div className="text-sm font-black text-white">{activeStadiumDef.name}</div>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {activeStadiumDef.capacity.toLocaleString()} Seats · {activeStadiumDef.pitchLengthMeters || 105}m × {activeStadiumDef.pitchWidthMeters || 68}m
                  </div>
                </div>
              </div>

              {/* Confederation Default Banner */}
              <div
                className={`p-4 pixel-corners border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selectedTeam.stadium?.isCustomOverride
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                  <div className="text-xs">
                    <div className="font-black uppercase tracking-wider">
                      {selectedTeam.stadium?.isCustomOverride
                        ? 'Custom National Stadium Active'
                        : `${resolvedConfedVenue.confederation} Default Active (${resolvedConfedVenue.mirroredSpecialTeam.name})`}
                    </div>
                    <div className="text-[11px] opacity-85 mt-0.5">
                      {selectedTeam.stadium?.isCustomOverride
                        ? `Customized for ${selectedTeam.nation.name}. Reset anytime to mirror ${resolvedConfedVenue.mirroredSpecialTeam.name}.`
                        : `By default, ${resolvedConfedVenue.confederation} national teams mirror ${resolvedConfedVenue.mirroredSpecialTeam.name}'s stadium & venue setup until customized.`}
                    </div>
                  </div>
                </div>

                {selectedTeam.stadium?.isCustomOverride && (
                  <button
                    type="button"
                    onClick={() => {
                      const defStd = resolvedConfedVenue.stadium;
                      const cap = defStd.capacity || 60000;
                      handleUpdateTeam({
                        ...selectedTeam,
                        stadium: {
                          ...(selectedTeam.stadium || { name: defStd.name, capacity: cap, tier: 5 }),
                          name: defStd.name,
                          capacity: cap,
                          tier: mapCapacityToTier(cap),
                          gameplayStadiumId: resolvedConfedVenue.homeStadiumId,
                          gameplayStadium: undefined,
                          gameplayConfig: undefined,
                          homeVenueConfig: undefined,
                          isCustomOverride: false,
                        } as DrawStarStadiumConfig,
                      });
                    }}
                    className="px-3 py-2 pixel-corners bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to {resolvedConfedVenue.confederation} Default
                  </button>
                )}
              </div>

              {/* Sky-Cam Preview + Action Suite */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-slate-950 border border-slate-800 pixel-corners p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Macroscopic Sky-Cam Preview
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 text-amber-300 uppercase font-bold">
                      {activeStadiumDef.fifaCategory || 'INTERNATIONAL'}
                    </span>
                  </div>
                  <MacroscopicSkyCamPreview
                    stadium={activeStadiumDef}
                    timeOfDay={stadiumSelectorConfig.timeOfDay || 'noon'}
                    weather={stadiumSelectorConfig.weather || 'clear'}
                    homeTeam={gameplaySelectedTeam || undefined}
                    awayTeam={gameplaySelectedTeam || undefined}
                    roofCutaway={stadiumSelectorConfig.roofCutaway || activeStadiumDef.roofCutaway || 'partial'}
                    borderClassName="border border-emerald-500/30"
                    compactTitle="Macroscopic Sky-Cam Preview"
                  />
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-slate-950 border border-slate-800 pixel-corners p-5">
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-pixel">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      Stadium &amp; Venue Editors
                    </h4>
                    <p className="text-xs text-slate-400 font-retro">
                      Edit stand architecture, seat colors &amp; patterns, pitch dimensions, turf quality, sponsors, adboards, and supporter atmosphere.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsStadiumCreatorOpen(true)}
                      className="w-full min-h-[48px] py-3 px-4 pixel-corners bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
                    >
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span>Interactive Stadium Creator (Stands &amp; Pitch)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsStadiumSelectorOpen(true)}
                      className="w-full min-h-[48px] py-3 px-4 pixel-corners bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
                    >
                      <Sliders className="w-4 h-4 shrink-0" />
                      <span>Stadium Selector, Pitch Size &amp; Turf Suite</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        registerDrawStarExternalTeams([gameplaySelectedTeam]);
                        setIsVenueAtmosphereOpen(true);
                      }}
                      className="w-full min-h-[48px] py-3 px-4 pixel-corners bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <Tv className="w-4 h-4 shrink-0" />
                      <span>Sponsors, Adboards, Seat Colors &amp; Culture</span>
                    </button>
                  </div>
                </div>
              </div>

              <StadiumSelectorModal
                isOpen={isStadiumSelectorOpen}
                onClose={() => setIsStadiumSelectorOpen(false)}
                config={stadiumSelectorConfig}
                onChangeConfig={setStadiumSelectorConfig}
                onApplyAndClose={(cfg) => {
                  setStadiumSelectorConfig(cfg);
                  const chosenStd = cfg.stadiumId ? getStadiumById(cfg.stadiumId) : activeStadiumDef;
                  const cap = cfg.capacity || chosenStd?.capacity || selectedTeam.stadium?.capacity || 60000;
                  handleUpdateTeam({
                    ...selectedTeam,
                    stadium: {
                      ...(selectedTeam.stadium || { name: chosenStd.name, capacity: cap, tier: 5 }),
                      name: chosenStd?.name || selectedTeam.stadium?.name || 'National Stadium',
                      capacity: cap,
                      tier: mapCapacityToTier(cap),
                      gameplayStadiumId: chosenStd?.id || cfg.stadiumId,
                      gameplayStadium: chosenStd,
                      gameplayConfig: cfg,
                      isCustomOverride: true,
                    },
                  });
                  setIsStadiumSelectorOpen(false);
                }}
                homeTeam={gameplaySelectedTeam}
                awayTeam={gameplaySelectedTeam}
                onSelectStadium={(std) => {
                  const cap = std.capacity || 60000;
                  handleUpdateTeam({
                    ...selectedTeam,
                    stadium: {
                      ...(selectedTeam.stadium || { name: std.name, capacity: cap, tier: 5 }),
                      name: std.name,
                      capacity: cap,
                      tier: mapCapacityToTier(cap),
                      gameplayStadiumId: std.id,
                      gameplayStadium: std,
                      isCustomOverride: true,
                    },
                  });
                }}
                onOpenStadiumCreator={() => {
                  setIsStadiumSelectorOpen(false);
                  setIsStadiumCreatorOpen(true);
                }}
              />

              <StadiumCreatorModal
                isOpen={isStadiumCreatorOpen}
                onClose={() => setIsStadiumCreatorOpen(false)}
                initialStadium={activeStadiumDef}
                onSaveStadium={(savedStd) => {
                  const cap = savedStd.capacity || 60000;
                  handleUpdateTeam({
                    ...selectedTeam,
                    stadium: {
                      ...(selectedTeam.stadium || { name: savedStd.name, capacity: cap, tier: 5 }),
                      name: savedStd.name,
                      capacity: cap,
                      tier: mapCapacityToTier(cap),
                      gameplayStadiumId: savedStd.id,
                      gameplayStadium: savedStd,
                      isCustomOverride: true,
                    },
                  });
                  setIsStadiumCreatorOpen(false);
                }}
              />

              <TeamEditorModal
                isOpen={isVenueAtmosphereOpen}
                initialTeamId={gameplaySelectedTeam.id}
                onClose={() => setIsVenueAtmosphereOpen(false)}
                onSaveTeam={(updatedGp) => {
                  handleUpdateTeam({
                    ...selectedTeam,
                    stadium: {
                      ...(selectedTeam.stadium || { name: activeStadiumDef.name, capacity: activeStadiumDef.capacity, tier: 5 }),
                      gameplayStadiumId: updatedGp.homeStadiumId || activeStadiumDef.id,
                      homeVenueConfig: updatedGp.homeVenueConfig,
                      isCustomOverride: true,
                    },
                  });
                  setIsVenueAtmosphereOpen(false);
                }}
              />
            </div>
          )}

          {/* TAB 5: SQUAD POOL */}
          {activeTab === 'squad' && (
            <div className="bg-slate-900 border-2 border-slate-800 pixel-corners p-6 shadow-xl space-y-6 pixel-bevel-raised">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 font-pixel">
                    <Users className="w-5 h-5 text-amber-400" />
                    National Team Squad Roster
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-retro">
                    Select Senior, U20, or U17 squads. Target size: 35 players per squad.
                  </p>
                </div>

                {/* Tier Switcher */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 pixel-corners border border-slate-800 w-full md:w-auto">
                  <button
                    onClick={() => setActiveSquadTier('Senior')}
                    className={`min-h-[44px] px-2 sm:px-4 py-1.5 pixel-corners text-xs font-bold transition-all font-pixel uppercase cursor-pointer truncate ${
                      activeSquadTier === 'Senior'
                        ? 'bg-amber-400 text-slate-950 pixel-bevel-raised shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Senior ({selectedTeam.squad?.length || 35})
                  </button>
                  <button
                    onClick={() => setActiveSquadTier('U20')}
                    className={`min-h-[44px] px-2 sm:px-4 py-1.5 pixel-corners text-xs font-bold transition-all font-pixel uppercase cursor-pointer truncate ${
                      activeSquadTier === 'U20'
                        ? 'bg-amber-400 text-slate-950 pixel-bevel-raised shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    U20 ({selectedTeam.u20Squad?.length || 35})
                  </button>
                  <button
                    onClick={() => setActiveSquadTier('U17')}
                    className={`min-h-[44px] px-2 sm:px-4 py-1.5 pixel-corners text-xs font-bold transition-all font-pixel uppercase cursor-pointer truncate ${
                      activeSquadTier === 'U17'
                        ? 'bg-amber-400 text-slate-950 pixel-bevel-raised shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    U17 ({selectedTeam.u17Squad?.length || 35})
                  </button>
                </div>
              </div>

              {/* Squad Cards (Mobile) & Table (Desktop) with Console Pagination */}
              {(() => {
                const squadList =
                  activeSquadTier === 'Senior'
                    ? selectedTeam.squad || []
                    : activeSquadTier === 'U20'
                    ? selectedTeam.u20Squad || []
                    : selectedTeam.u17Squad || [];

                const SQUAD_PER_PAGE = 6;
                const totalSquadPages = Math.max(1, Math.ceil(squadList.length / SQUAD_PER_PAGE));
                const safeSquadPage = Math.min(squadPage, totalSquadPages);
                const pagedSquad = squadList.slice(
                  (safeSquadPage - 1) * SQUAD_PER_PAGE,
                  safeSquadPage * SQUAD_PER_PAGE
                );

                return (
                  <div className="space-y-4">
                    {totalSquadPages > 1 && (
                      <ConsolePaginationBar
                        currentPage={safeSquadPage}
                        totalPages={totalSquadPages}
                        onPageChange={setSquadPage}
                        totalItems={squadList.length}
                        pageSize={SQUAD_PER_PAGE}
                        label="SQUAD PAGE"
                      />
                    )}

                    {/* Mobile Squad Card List (< md) */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                      {pagedSquad.map((player, idx) => {
                        const globalIndex = (safeSquadPage - 1) * SQUAD_PER_PAGE + idx;
                        return (
                          <div
                            key={player.id || globalIndex}
                            className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-300 font-arcade shrink-0">
                                #{player.shirtNumber || globalIndex + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-white truncate">
                                    {player.name || `${player.firstName} ${player.lastName}`}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black font-arcade shrink-0">
                                    {player.overallRating} OVR
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 font-mono mt-0.5">
                                  <span className="text-cyan-400 font-bold">{player.position}</span>
                                  {' • '}
                                  <span>Age {player.age || 22}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (onEditPlayerInFullEditor) {
                                  handleUpdateTeam(selectedTeam, true);
                                  onEditPlayerInFullEditor(selectedTeam, player, globalIndex + 1, activeSquadTier);
                                } else {
                                  setEditingPlayerModal({
                                    slotNumber: globalIndex + 1,
                                    player,
                                    tier: activeSquadTier,
                                  });
                                }
                              }}
                              className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 pixel-corners font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all font-pixel cursor-pointer shrink-0"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Squad Table (md+) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-arcade">
                          <tr>
                            <th className="py-3 px-3">#</th>
                            <th className="py-3 px-3">Pos</th>
                            <th className="py-3 px-3">Player Name</th>
                            <th className="py-3 px-3">Age</th>
                            <th className="py-3 px-3 text-center">OVR</th>
                            <th className="py-3 px-3">PAC</th>
                            <th className="py-3 px-3">SHO</th>
                            <th className="py-3 px-3">PAS</th>
                            <th className="py-3 px-3">DRI</th>
                            <th className="py-3 px-3">DEF</th>
                            <th className="py-3 px-3">PHY</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-retro">
                          {pagedSquad.map((player, idx) => {
                            const globalIndex = (safeSquadPage - 1) * SQUAD_PER_PAGE + idx;
                            return (
                              <tr
                                key={player.id || globalIndex}
                                className="hover:bg-slate-800/50 transition-colors group"
                              >
                                <td className="py-2.5 px-3 font-bold text-slate-400 font-arcade">
                                  {player.shirtNumber || globalIndex + 1}
                                </td>
                                <td className="py-2.5 px-3 font-black text-amber-400 font-arcade">
                                  {player.position}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                                  <span>{player.name || `${player.firstName} ${player.lastName}`}</span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-400">
                                  {player.age || 22}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span
                                    className={`px-2 py-0.5 pixel-corners font-black text-xs font-arcade ${
                                      player.overallRating >= 85
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : player.overallRating >= 75
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {player.overallRating}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.pace ?? player.stats?.pro ?? 70}</td>
                                <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.shooting ?? player.stats?.goa ?? 70}</td>
                                <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.passing ?? player.stats?.cre ?? 70}</td>
                                <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.dribbling ?? player.stats?.cre ?? 70}</td>
                                <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.defending ?? player.stats?.def ?? 70}</td>
                                <td className="py-2.5 px-3 text-slate-300 font-arcade">{(player.stats as any)?.physicality ?? player.stats?.phy ?? 70}</td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onEditPlayerInFullEditor) {
                                        handleUpdateTeam(selectedTeam, true);
                                        onEditPlayerInFullEditor(selectedTeam, player, globalIndex + 1, activeSquadTier);
                                      } else {
                                        setEditingPlayerModal({
                                          slotNumber: globalIndex + 1,
                                          player,
                                          tier: activeSquadTier,
                                        });
                                      }
                                    }}
                                    className="min-h-[38px] px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 pixel-corners font-bold text-xs flex items-center gap-1 ml-auto border border-slate-700 transition-all font-pixel cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {totalSquadPages > 1 && (
                      <ConsolePaginationBar
                        currentPage={safeSquadPage}
                        totalPages={totalSquadPages}
                        onPageChange={setSquadPage}
                        totalItems={squadList.length}
                        pageSize={SQUAD_PER_PAGE}
                        label="SQUAD PAGE"
                      />
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* PLAYER EDITOR MODAL */}
      {editingPlayerModal && (
        <TeamPlayerEditorModal
          isOpen={true}
          slotNumber={editingPlayerModal.slotNumber}
          player={editingPlayerModal.player}
          groupLabel={editingPlayerModal.tier}
          occupiedNumbers={new Map()}
          onSave={handleSavePlayerInTier}
          onClose={() => setEditingPlayerModal(null)}
          onEditAppearancePortrait={
            onEditPlayerInFullEditor && selectedTeam
              ? (currentForm) => {
                  handleSavePlayerInTier(currentForm);
                  handleUpdateTeam(selectedTeam, true);
                  onEditPlayerInFullEditor(selectedTeam, currentForm, editingPlayerModal.slotNumber, editingPlayerModal.tier);
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
