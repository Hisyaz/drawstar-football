/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  TeamDefinition,
  TeamCategory,
  Confederation,
  RatingTier,
  MatchModeCompetitionTag,
  FootballMatchMode,
} from '../types';
import { StadiumDefinition } from '../types/stadium';
import {
  getTeamById,
  getAllTeams,
  getRandomTeam,
  getTeamCategories,
  getConfederationsForCategory,
  getCountriesForCategoryAndConfederation,
  getLeaguesForSelection,
  filterTeams,
  calculatePlayerOvr,
} from '../game/teams';
import { isStatBreak } from '../game/playerStats';
import {
  X,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Trophy,
  Users,
  Sparkles,
  Check,
  Target,
  Dices,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePaginationBar } from '../../components/common/ConsolePager';
import { YOUTH_LEAGUES_DATABASE, YouthTeamData } from '../../data/youthLeaguesDatabase';
import { getAllIntlYouthPoolClubs } from '../../data/internationalYouthPool';
import { getNationalTeamsDatabase } from '../../utils/nationalTeamDatabaseManager';
import {
  buildYouthAndIntlCupGameplayTeams,
  buildU17NationalGameplayTeams,
} from '../../utils/gameplayAdapter';
import { groupInternationalYouthClubs } from '../../utils/internationalYouthGrouping';
import type { InternationalYouthClub } from '../../types/youthLeague';

export type TeamSelectorBrowseMode = 'pro' | 'youth_leagues' | 'intl_youth_cup' | 'u17_world_cup';

export interface TeamSelectorYouthBundle {
  mode: 'youth_league' | 'intl_youth_cup' | 'intl_youth_cup_final' | 'u17_world_cup';
  homeTeam: TeamDefinition;
  awayTeam: TeamDefinition;
  stadium: StadiumDefinition;
  matchMode: FootballMatchMode;
  competitionTag: MatchModeCompetitionTag;
  scoreboardThemeId?: string;
  youthCityId?: string;
  displayedHalfMinutes: 35 | 45;
  disableSurroundingsAndIntro: boolean;
  isCasualCrowd: boolean;
  crowdAttendancePctOverride?: number;
  finalBoardCity?: string;
  finalBoardYear?: number;
}

interface TeamSelectorModalProps {
  isOpen: boolean;
  side: 'home' | 'away';
  currentTeamId: string;
  onSelectTeam: (side: 'home' | 'away', team: TeamDefinition) => void;
  onSelectYouthMatchup?: (bundle: TeamSelectorYouthBundle) => void;
  onClose: () => void;
  onSideChange?: (newSide: 'home' | 'away') => void;
  onOpenTeamEditor?: (teamId: string) => void;
  onLaunchStreetMode?: () => void;
  onChangeMode?: () => void;
  initialBrowseMode?: TeamSelectorBrowseMode;
}

export const TeamSelectorModal: React.FC<TeamSelectorModalProps> = ({
  isOpen,
  side,
  currentTeamId,
  onSelectTeam,
  onSelectYouthMatchup,
  onClose,
  onSideChange,
  onOpenTeamEditor,
  onLaunchStreetMode,
  onChangeMode,
  initialBrowseMode = 'pro',
}) => {
  const [activeSide, setActiveSide] = useState<'home' | 'away'>(side);
  const [browseMode, setBrowseMode] = useState<TeamSelectorBrowseMode>(initialBrowseMode);

  useEffect(() => {
    setActiveSide(side);
  }, [side]);

  useEffect(() => {
    if (isOpen) {
      setBrowseMode(initialBrowseMode);
    }
  }, [isOpen, initialBrowseMode]);

  // Youth Leagues state (9 cities, strict age 16 default)
  const youthLeaguesList = useMemo(() => Object.values(YOUTH_LEAGUES_DATABASE), []);
  const [selectedYouthLeagueId, setSelectedYouthLeagueId] = useState<string>(
    youthLeaguesList[0]?.id || 'buenos_aires'
  );
  const activeYouthLeague = useMemo(
    () => YOUTH_LEAGUES_DATABASE[selectedYouthLeagueId] || youthLeaguesList[0],
    [selectedYouthLeagueId, youthLeaguesList]
  );
  const [youthHomeClub, setYouthHomeClub] = useState<YouthTeamData | null>(
    () => youthLeaguesList[0]?.teams[0] || null
  );
  const [youthAwayClub, setYouthAwayClub] = useState<YouthTeamData | null>(
    () => youthLeaguesList[0]?.teams[1] || null
  );
  const [youthPickerSide, setYouthPickerSide] = useState<'home' | 'away'>('home');

  // International Youth Cup state (Country-grouped accordion + Final Showcase 45m Pro stadium toggle)
  const intlCupClubs = useMemo(() => getAllIntlYouthPoolClubs(16), []);
  const [cupPickSide, setCupPickSide] = useState<'home' | 'away'>('home');
  const [cupHomeClub, setCupHomeClub] = useState<InternationalYouthClub>(
    () => intlCupClubs[0]
  );
  const [cupAwayClub, setCupAwayClub] = useState<InternationalYouthClub>(
    () => intlCupClubs[1] || intlCupClubs[0]
  );
  const [isCupFinalShowcase, setIsCupFinalShowcase] = useState<boolean>(false);
  const [expandedCupCountries, setExpandedCupCountries] = useState<Record<string, boolean>>({});
  const [cupSearchQuery, setCupSearchQuery] = useState<string>('');

  const allCupSections = useMemo(
    () => groupInternationalYouthClubs(intlCupClubs),
    [intlCupClubs]
  );

  const cupSections = useMemo(() => {
    const q = cupSearchQuery.trim().toLowerCase();
    if (!q) return allCupSections;
    return allCupSections
      .map((sec) => {
        const secMatches =
          sec.sectionLabel.toLowerCase().includes(q) ||
          sec.countries.some((c) => c.toLowerCase().includes(q));
        const matchingClubs = secMatches
          ? sec.clubs
          : sec.clubs.filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                c.country.toLowerCase().includes(q) ||
                c.federation.toLowerCase().includes(q)
            );
        if (matchingClubs.length === 0) return null;
        return {
          ...sec,
          clubs: matchingClubs,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [allCupSections, cupSearchQuery]);

  // U17 World Championship state (National Teams populated u17Squad)
  const nationalTeamsDb = useMemo(
    () =>
      [...getNationalTeamsDatabase()].sort(
        (a, b) => (a.fifaRanking ?? 99) - (b.fifaRanking ?? 99)
      ),
    []
  );
  const [u17PickSide, setU17PickSide] = useState<'home' | 'away'>('home');
  const [u17HomeCode, setU17HomeCode] = useState<string>(() => nationalTeamsDb[0]?.nation.code || 'ARG');
  const [u17AwayCode, setU17AwayCode] = useState<string>(() => nationalTeamsDb[1]?.nation.code || 'BRA');
  const [u17SearchQuery, setU17SearchQuery] = useState<string>('');
  const [isU17Knockout, setIsU17Knockout] = useState<boolean>(false);

  const filteredU17Nations = useMemo(() => {
    const q = u17SearchQuery.trim().toLowerCase();
    return nationalTeamsDb.filter(
      (nt) =>
        !q ||
        nt.nation.name.toLowerCase().includes(q) ||
        nt.nation.code.toLowerCase().includes(q) ||
        (nt.confederation || '').toLowerCase().includes(q)
    );
  }, [nationalTeamsDb, u17SearchQuery]);

  const u17HomeNation = useMemo(
    () => nationalTeamsDb.find((n) => n.nation.code === u17HomeCode) || nationalTeamsDb[0],
    [nationalTeamsDb, u17HomeCode]
  );
  const u17AwayNation = useMemo(
    () => nationalTeamsDb.find((n) => n.nation.code === u17AwayCode) || nationalTeamsDb[1] || nationalTeamsDb[0],
    [nationalTeamsDb, u17AwayCode]
  );

  const initialTeam = getTeamById(currentTeamId);
  const [category, setCategory] = useState<TeamCategory>(initialTeam.category);
  const [confederation, setConfederation] = useState<Confederation>(initialTeam.confederation);
  const [country, setCountry] = useState<string>(initialTeam.country);
  const [league, setLeague] = useState<string>(initialTeam.league || '');
  const [previewTeam, setPreviewTeam] = useState<TeamDefinition>(initialTeam);

  const [step, setStep] = useState<number>(() =>
    initialTeam.category === 'special' ? 2 : initialTeam.category === 'national' ? 4 : 5
  );
  const [viewMode, setViewMode] = useState<'drill' | 'all'>('drill');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLineup, setShowLineup] = useState(false);
  const [mobilePage, setMobilePage] = useState<'browse' | 'preview'>('browse');
  const [teamPage, setTeamPage] = useState(1);

  const [isRolling, setIsRolling] = useState(false);
  const [rollingTeam, setRollingTeam] = useState<TeamDefinition | null>(null);

  useEffect(() => {
    setTeamPage(1);
  }, [category, confederation, country, league, viewMode, searchQuery, step]);

  useEffect(() => {
    const team = getTeamById(currentTeamId);
    setPreviewTeam(team);
    setCategory(team.category);
    setConfederation(team.confederation);
    setCountry(team.country);
    if (team.league) setLeague(team.league);
    setStep(team.category === 'special' ? 2 : team.category === 'national' ? 4 : 5);
  }, [currentTeamId, activeSide]);

  if (!isOpen) return null;

  const handleSelectTeamAndUpdateSide = (team: TeamDefinition) => {
    setPreviewTeam(team);
    onSelectTeam(activeSide, team);
  };

  const handleRandomTeam = () => {
    if (isRolling) return;
    setIsRolling(true);
    const allTeams = getAllTeams();
    let ticks = 0;
    const maxTicks = 10;
    const interval = setInterval(() => {
      ticks++;
      const randTeam = allTeams[Math.floor(Math.random() * allTeams.length)];
      setRollingTeam(randTeam);
      if (ticks >= maxTicks) {
        clearInterval(interval);
        const winner = getRandomTeam();
        handleSelectTeamAndUpdateSide(winner);
        setCategory(winner.category);
        setConfederation(winner.confederation);
        setCountry(winner.country);
        if (winner.league) setLeague(winner.league);
        setStep(winner.category === 'special' ? 2 : winner.category === 'national' ? 4 : 5);
        setIsRolling(false);
        setRollingTeam(null);
      }
    }, 60);
  };

  const handleConfirmTeam = (team: TeamDefinition) => {
    onSelectTeam(activeSide, team);
    onClose();
  };

  const categories = getTeamCategories();
  const confederations = getConfederationsForCategory(category);
  const countries = getCountriesForCategoryAndConfederation(category, confederation);
  const leagues = getLeaguesForSelection(category, confederation, country);
  const filteredTeams = filterTeams(
    category,
    category === 'special' ? undefined : confederation,
    category === 'special' ? undefined : country,
    category === 'club' ? league : undefined
  );

  const searchResults = getAllTeams().filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q) ||
      (t.league && t.league.toLowerCase().includes(q)) ||
      t.ratingTier.toLowerCase().includes(q)
    );
  });

  const getTierBadgeStyle = (tier: RatingTier) => {
    switch (tier) {
      case 'S':
        return 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black border-amber-300 font-extrabold shadow-[0_0_12px_rgba(251,191,36,0.6)]';
      case 'A':
        return 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-400 font-bold shadow-[0_0_8px_rgba(16,185,129,0.4)]';
      case 'B':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 font-bold';
      case 'C':
        return 'bg-gradient-to-r from-stone-600 to-stone-500 text-white border-stone-400 font-semibold';
    }
  };

  const getStars = (tier: RatingTier) => {
    switch (tier) {
      case 'S':
        return '⭐⭐⭐⭐⭐';
      case 'A':
        return '⭐⭐⭐⭐';
      case 'B':
        return '⭐⭐⭐';
      case 'C':
        return '⭐⭐';
    }
  };

  const handleConfirmYouthLeague = () => {
    if (!onSelectYouthMatchup || !youthHomeClub || !youthAwayClub) return;
    const bundle = buildYouthAndIntlCupGameplayTeams({
      homeClub: youthHomeClub,
      awayClub: youthAwayClub,
      age: 16,
      competitionMode: 'youth_league',
    });
    const cityKey = `youth_${activeYouthLeague.id}`;
    onSelectYouthMatchup({
      mode: 'youth_league',
      homeTeam: bundle.homeTeam,
      awayTeam: bundle.awayTeam,
      stadium: bundle.stadium,
      matchMode: 'youth',
      competitionTag: 'youth_league',
      scoreboardThemeId: cityKey,
      youthCityId: activeYouthLeague.id,
      displayedHalfMinutes: 35,
      disableSurroundingsAndIntro: true,
      isCasualCrowd: true,
    });
    onClose();
  };

  const handleConfirmIntlYouthCup = () => {
    if (!onSelectYouthMatchup || !cupHomeClub || !cupAwayClub) return;
    const compMode = isCupFinalShowcase ? 'intl_youth_cup_final' : 'intl_youth_cup';
    const bundle = buildYouthAndIntlCupGameplayTeams({
      homeClub: cupHomeClub,
      awayClub: cupAwayClub,
      age: 16,
      competitionMode: compMode,
      seasonYear: new Date().getFullYear(),
    });
    onSelectYouthMatchup({
      mode: compMode,
      homeTeam: bundle.homeTeam,
      awayTeam: bundle.awayTeam,
      stadium: bundle.stadium,
      matchMode: 'youth',
      competitionTag: compMode,
      scoreboardThemeId: compMode,
      displayedHalfMinutes: bundle.displayedHalfMinutes,
      disableSurroundingsAndIntro: bundle.disableSurroundingsAndIntro,
      isCasualCrowd: bundle.isCasualCrowd,
      crowdAttendancePctOverride: bundle.crowdAttendancePctOverride,
      finalBoardCity: bundle.finalBoardCity,
      finalBoardYear: bundle.finalBoardYear,
    });
    onClose();
  };

  const handleConfirmU17Match = () => {
    if (!onSelectYouthMatchup || !u17HomeNation || !u17AwayNation) return;
    const bundle = buildU17NationalGameplayTeams({
      homeNation: {
        code: u17HomeNation.nation.code,
        name: u17HomeNation.nation.name,
        iso: u17HomeNation.nation.iso,
        confederation: u17HomeNation.confederation || 'UEFA',
        ovr: u17HomeNation.teamOvr || 72,
        isSimulationOnly: false,
      },
      awayNation: {
        code: u17AwayNation.nation.code,
        name: u17AwayNation.nation.name,
        iso: u17AwayNation.nation.iso,
        confederation: u17AwayNation.confederation || 'UEFA',
        ovr: u17AwayNation.teamOvr || 72,
        isSimulationOnly: false,
      },
      stageName: isU17Knockout ? 'Final' : 'Group Stage',
      isKnockout: isU17Knockout,
      seasonYear: new Date().getFullYear(),
    });
    onSelectYouthMatchup({
      mode: 'u17_world_cup',
      homeTeam: bundle.homeTeam,
      awayTeam: bundle.awayTeam,
      stadium: bundle.stadium,
      matchMode: 'youth',
      competitionTag: 'u17_world_cup',
      scoreboardThemeId: 'u17_world_cup',
      displayedHalfMinutes: 45,
      disableSurroundingsAndIntro: false,
      isCasualCrowd: false,
    });
    onClose();
  };

  const displayTeam = rollingTeam || previewTeam;
  const TEAMS_PER_PAGE = 6;
  const activeBrowseList = viewMode === 'drill' ? filteredTeams : searchResults;
  const totalTeamPages = Math.max(1, Math.ceil(activeBrowseList.length / TEAMS_PER_PAGE));
  const safeTeamPage = Math.min(teamPage, totalTeamPages);
  const pagedTeams = activeBrowseList.slice((safeTeamPage - 1) * TEAMS_PER_PAGE, safeTeamPage * TEAMS_PER_PAGE);

  const isYouthBrowse = browseMode !== 'pro';

  return (
    <ConsoleModalShell
      id="team-selector-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        browseMode === 'youth_leagues'
          ? 'YOUTH LEAGUES (9 CITIES)'
          : browseMode === 'intl_youth_cup'
          ? "INT'L YOUTH CUP"
          : browseMode === 'u17_world_cup'
          ? 'U17 WORLD CHAMPIONSHIP'
          : 'TEAM SELECTION'
      }
      subtitle={
        browseMode === 'youth_leagues'
          ? `${activeYouthLeague?.name || 'Youth League'} · Age 16 · 35m Halves`
          : browseMode === 'intl_youth_cup'
          ? `${cupHomeClub?.name} vs ${cupAwayClub?.name} · ${isCupFinalShowcase ? 'Pro Final 45m' : 'Section 35m'}`
          : browseMode === 'u17_world_cup'
          ? `${u17HomeNation?.nation.name} U17 vs ${u17AwayNation?.nation.name} U17 · 45m Halves`
          : `${activeSide === 'home' ? 'HOME SIDE' : 'AWAY SIDE'} · ${displayTeam.name}`
      }
      icon={<Trophy className="w-5 h-5 text-amber-400" />}
      accentColor={isYouthBrowse ? 'emerald' : activeSide === 'home' ? 'blue' : 'rose'}
      maxWidthClass="sm:max-w-5xl"
      headerRight={
        <div className="flex items-center gap-1.5 shrink-0">
          {onChangeMode && (
            <button
              type="button"
              onClick={onChangeMode}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all active:scale-95 shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>MODE</span>
            </button>
          )}
          {onLaunchStreetMode && (
            <button
              type="button"
              onClick={onLaunchStreetMode}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white cursor-pointer border border-amber-300/40 whitespace-nowrap"
              title="Draft 7v7 Street Pickup Teams from City Pool"
            >
              <Sparkles className="w-4 h-4" />
              <span>STREET 7v7</span>
            </button>
          )}
          {!isYouthBrowse && (
            <button
              type="button"
              onClick={handleRandomTeam}
              disabled={isRolling}
              className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0 ${
                isRolling
                  ? 'bg-amber-500 text-black cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black cursor-pointer'
              }`}
              title="Pick a random team instantly!"
            >
              <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{isRolling ? 'ROLL...' : 'RANDOM'}</span>
            </button>
          )}
        </div>
      }
      bodyClassName="flex flex-col min-h-0"
      footer={
        isYouthBrowse ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-mono text-slate-300 truncate">
              {browseMode === 'youth_leagues' && youthHomeClub && youthAwayClub && (
                <span>
                  <strong className="text-sky-300">{youthHomeClub.name}</strong> vs{' '}
                  <strong className="text-rose-300">{youthAwayClub.name}</strong> · Youth Stadium (35m)
                </span>
              )}
              {browseMode === 'intl_youth_cup' && cupHomeClub && cupAwayClub && (
                <span>
                  <strong className="text-sky-300">{cupHomeClub.name}</strong> vs{' '}
                  <strong className="text-rose-300">{cupAwayClub.name}</strong> ·{' '}
                  {isCupFinalShowcase ? 'Pro Final Stadium (45m · 60-80% Crowd)' : 'Youth Section (35m)'}
                </span>
              )}
              {browseMode === 'u17_world_cup' && u17HomeNation && u17AwayNation && (
                <span>
                  <strong className="text-sky-300">{u17HomeNation.nation.name} U17</strong> vs{' '}
                  <strong className="text-rose-300">{u17AwayNation.nation.name} U17</strong> · Pro WC Stadium (45m)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={
                browseMode === 'youth_leagues'
                  ? handleConfirmYouthLeague
                  : browseMode === 'intl_youth_cup'
                  ? handleConfirmIntlYouthCup
                  : handleConfirmU17Match
              }
              className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 whitespace-nowrap shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>
                {browseMode === 'youth_leagues'
                  ? 'CONFIRM YOUTH MATCH'
                  : browseMode === 'intl_youth_cup'
                  ? isCupFinalShowcase
                    ? 'CONFIRM FINAL SHOWCASE'
                    : 'CONFIRM CUP MATCH'
                  : 'CONFIRM U17 MATCH'}
              </span>
            </button>
          </div>
        ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveSide('home');
                  onSideChange?.('home');
                }}
                className={`min-h-[40px] px-2.5 py-1 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                  activeSide === 'home' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                🔵 HOME
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSide('away');
                  onSideChange?.('away');
                }}
                className={`min-h-[40px] px-2.5 py-1 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                  activeSide === 'away' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                🔴 AWAY
              </button>
            </div>
            <span className="text-xs font-mono text-slate-300 truncate">{displayTeam.name}</span>
          </div>

          <button
            type="button"
            onClick={() => handleConfirmTeam(displayTeam)}
            className={`w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
              activeSide === 'home'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span className="truncate">CONFIRM {displayTeam.shortName.toUpperCase()} ({activeSide.toUpperCase()})</span>
          </button>
        </div>
        )
      }
    >
      {/* Top Mode Strip (Pro vs Youth Leagues vs Int'l Youth Cup vs U17 World Cup) */}
      {onSelectYouthMatchup && (
        <div className="px-3 sm:px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {([
            { id: 'pro', label: 'PRO CLUBS & NATIONS' },
            { id: 'youth_leagues', label: '9 CITY YOUTH LEAGUES' },
            { id: 'intl_youth_cup', label: "INT'L YOUTH CUP" },
            { id: 'u17_world_cup', label: 'U17 WORLD CUP' },
          ] as Array<{ id: TeamSelectorBrowseMode; label: string }>).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBrowseMode(tab.id)}
              className={`min-h-[44px] px-3 py-1.5 rounded-lg text-[11px] font-arcade uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                browseMode === tab.id
                  ? tab.id === 'pro'
                    ? 'bg-blue-600 text-white border-blue-400 font-black shadow'
                    : 'bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {isYouthBrowse ? (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4">
          {browseMode === 'youth_leagues' && (
            <div className="space-y-4">
              {/* City Picker across all 9 Youth Leagues */}
              <div>
                <div className="text-xs font-arcade text-emerald-300 uppercase mb-2">
                  1. SELECT YOUTH CITY LEAGUE ({youthLeaguesList.length} CITIES · AGE 16)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {youthLeaguesList.map((yl) => {
                    const selected = yl.id === activeYouthLeague?.id;
                    return (
                      <button
                        key={yl.id}
                        type="button"
                        onClick={() => {
                          setSelectedYouthLeagueId(yl.id);
                          setYouthHomeClub(yl.teams[0] || null);
                          setYouthAwayClub(yl.teams[1] || yl.teams[0] || null);
                        }}
                        className={`min-h-[52px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selected
                            ? 'bg-emerald-950/70 border-emerald-400 text-white shadow'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="font-bold text-xs truncate">
                          {yl.flag} {yl.city}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {yl.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Home / Away Picker */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setYouthPickerSide('home')}
                  className={`min-h-[48px] px-3 py-2 rounded-xl border text-left cursor-pointer ${
                    youthPickerSide === 'home'
                      ? 'bg-blue-950/70 border-blue-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-mono text-blue-300 uppercase">PICKING HOME</div>
                  <div className="font-bold text-xs truncate">{youthHomeClub?.name || 'Select Home'}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setYouthPickerSide('away')}
                  className={`min-h-[48px] px-3 py-2 rounded-xl border text-left cursor-pointer ${
                    youthPickerSide === 'away'
                      ? 'bg-rose-950/70 border-rose-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-mono text-rose-300 uppercase">PICKING AWAY</div>
                  <div className="font-bold text-xs truncate">{youthAwayClub?.name || 'Select Away'}</div>
                </button>
              </div>

              {/* Youth Clubs in selected league */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(activeYouthLeague?.teams || []).map((club) => {
                  const isHome = youthHomeClub?.id === club.id;
                  const isAway = youthAwayClub?.id === club.id;
                  return (
                    <button
                      key={club.id}
                      type="button"
                      onClick={() => {
                        if (youthPickerSide === 'home') setYouthHomeClub(club);
                        else setYouthAwayClub(club);
                      }}
                      className={`min-h-[54px] p-3 rounded-xl border flex items-center justify-between gap-2 text-left cursor-pointer transition-all ${
                        isHome
                          ? 'bg-blue-950/60 border-blue-400 text-white'
                          : isAway
                          ? 'bg-rose-950/60 border-rose-400 text-white'
                          : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-4 h-7 rounded border border-white/25 shrink-0"
                          style={{ backgroundColor: club.primaryColor || '#0284c7' }}
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">{club.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Age 16 Base OVR {club.ovr} · {club.tierClass === 'big' ? 'BIG YOUTH' : 'LOCAL YOUTH'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-arcade shrink-0 text-amber-300">
                        {isHome && isAway ? 'H+A' : isHome ? 'HOME' : isAway ? 'AWAY' : 'PICK'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {browseMode === 'intl_youth_cup' && (
            <div className="space-y-3">
              {/* Top Controls: Home/Away Target, Search & Final Showcase 45m Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => setCupPickSide('home')}
                    className={`min-h-[48px] px-3 py-1.5 rounded-lg border text-left cursor-pointer ${
                      cupPickSide === 'home'
                        ? 'bg-blue-950/70 border-blue-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-[9px] font-mono text-blue-300">HOME CLUB</div>
                    <div className="font-bold text-xs truncate">
                      {cupHomeClub?.flag} {cupHomeClub?.name}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCupPickSide('away')}
                    className={`min-h-[48px] px-3 py-1.5 rounded-lg border text-left cursor-pointer ${
                      cupPickSide === 'away'
                        ? 'bg-rose-950/70 border-rose-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-[9px] font-mono text-rose-300">AWAY CLUB</div>
                    <div className="font-bold text-xs truncate">
                      {cupAwayClub?.flag} {cupAwayClub?.name}
                    </div>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={cupSearchQuery}
                      onChange={(e) => setCupSearchQuery(e.target.value)}
                      placeholder="Filter country or club..."
                      className="min-h-[44px] pl-8 pr-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCupFinalShowcase((prev) => !prev)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg border text-xs font-arcade uppercase transition-all cursor-pointer whitespace-nowrap ${
                      isCupFinalShowcase
                        ? 'bg-amber-400 text-slate-950 border-amber-200 font-black shadow'
                        : 'bg-slate-900 text-amber-300 border-amber-500/50 hover:bg-slate-800'
                    }`}
                  >
                    {isCupFinalShowcase ? '🏆 FINAL SHOWCASE: ON (PRO 45m)' : 'FINAL SHOWCASE: OFF (35m)'}
                  </button>
                </div>
              </div>

              {/* Alphabetical Country Accordion + Bundled Regional Sections */}
              <div className="space-y-2">
                {cupSections.map((sec) => {
                  const isExpanded = expandedCupCountries[sec.sectionId] ?? true;
                  return (
                    <div key={sec.sectionId} className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCupCountries((prev) => ({
                            ...prev,
                            [sec.sectionId]: !isExpanded,
                          }))
                        }
                        className="w-full min-h-[44px] px-3.5 py-2 flex items-center justify-between gap-2 text-left bg-slate-950/70 hover:bg-slate-900 cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center gap-2 font-bold text-xs text-white min-w-0">
                          {sec.isBundledRegional ? (
                            <Globe className="w-4 h-4 text-amber-300 shrink-0" />
                          ) : (
                            <span>{sec.clubs[0]?.flag || '🌍'}</span>
                          )}
                          <span className={sec.isBundledRegional ? 'text-amber-300' : 'text-white'}>
                            {sec.sectionLabel}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            ({sec.clubs.length} {sec.clubs.length === 1 ? 'club' : 'clubs'})
                          </span>
                          {sec.isBundledRegional && sec.countries.length > 0 && (
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[240px] sm:max-w-md">
                              · {sec.countries.join(', ')}
                            </span>
                          )}
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>
                      {isExpanded && (
                        <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {sec.clubs.map((club) => {
                            const isH = cupHomeClub?.id === club.id;
                            const isA = cupAwayClub?.id === club.id;
                            return (
                              <button
                                key={club.id}
                                type="button"
                                onClick={() => {
                                  if (cupPickSide === 'home') setCupHomeClub(club);
                                  else setCupAwayClub(club);
                                }}
                                className={`min-h-[48px] p-2.5 rounded-lg border flex items-center justify-between gap-2 text-left cursor-pointer ${
                                  isH
                                    ? 'bg-blue-950/70 border-blue-400 text-white'
                                    : isA
                                    ? 'bg-rose-950/70 border-rose-400 text-white'
                                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-600'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="font-bold text-xs truncate">
                                    {sec.isBundledRegional
                                      ? `${club.flag} ${club.country} · ${club.name}`
                                      : club.name}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400">
                                    {club.federation} · Age 16 OVR {club.teamOvr}
                                  </div>
                                </div>
                                <span className="text-[10px] font-arcade text-amber-300 shrink-0">
                                  {isH ? 'HOME' : isA ? 'AWAY' : 'PICK'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {cupSections.length === 0 && (
                  <div className="p-6 text-center text-xs font-mono text-slate-400 bg-slate-900/50 border border-slate-800 rounded-xl">
                    No International Youth Cup clubs matched "{cupSearchQuery}".
                  </div>
                )}
              </div>
            </div>
          )}

          {browseMode === 'u17_world_cup' && (
            <div className="space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => setU17PickSide('home')}
                    className={`min-h-[48px] px-3 py-1.5 rounded-lg border text-left cursor-pointer ${
                      u17PickSide === 'home'
                        ? 'bg-blue-950/70 border-blue-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-[9px] font-mono text-blue-300">HOME U17</div>
                    <div className="font-bold text-xs truncate">
                      {u17HomeNation?.nation.name} U17
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setU17PickSide('away')}
                    className={`min-h-[48px] px-3 py-1.5 rounded-lg border text-left cursor-pointer ${
                      u17PickSide === 'away'
                        ? 'bg-rose-950/70 border-rose-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-[9px] font-mono text-rose-300">AWAY U17</div>
                    <div className="font-bold text-xs truncate">
                      {u17AwayNation?.nation.name} U17
                    </div>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={u17SearchQuery}
                      onChange={(e) => setU17SearchQuery(e.target.value)}
                      placeholder="Filter U17 nation..."
                      className="min-h-[44px] pl-8 pr-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsU17Knockout((prev) => !prev)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg border text-xs font-arcade uppercase cursor-pointer whitespace-nowrap ${
                      isU17Knockout
                        ? 'bg-amber-400 text-slate-950 border-amber-200 font-black'
                        : 'bg-slate-900 text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    {isU17Knockout ? '🏆 FINAL / KNOCKOUT' : 'GROUP STAGE · 45m'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredU17Nations.map((nt) => {
                  const isH = u17HomeCode === nt.nation.code;
                  const isA = u17AwayCode === nt.nation.code;
                  const u17Size = nt.u17Squad?.length || 23;
                  return (
                    <button
                      key={nt.nation.code}
                      type="button"
                      onClick={() => {
                        if (u17PickSide === 'home') setU17HomeCode(nt.nation.code);
                        else setU17AwayCode(nt.nation.code);
                      }}
                      className={`min-h-[52px] p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left cursor-pointer ${
                        isH
                          ? 'bg-blue-950/70 border-blue-400 text-white'
                          : isA
                          ? 'bg-rose-950/70 border-rose-400 text-white'
                          : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">
                          {nt.nation.name} ({nt.nation.code})
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {nt.confederation || 'INTL'} · {u17Size} U17 Squad · Rank #{nt.fifaRanking || '-'}
                        </div>
                      </div>
                      <span className="text-[10px] font-arcade text-amber-300 shrink-0">
                        {isH ? 'HOME' : isA ? 'AWAY' : 'PICK'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
      <>
      {/* Mobile 2-Page Console Switcher (< md): 1. Browse Teams <-> 2. Preview & Squad */}
      <div className="md:hidden grid grid-cols-2 gap-2 p-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => setMobilePage('browse')}
          className={`min-h-[44px] px-2.5 rounded-lg font-arcade text-[10px] uppercase font-bold transition-all cursor-pointer ${
            mobilePage === 'browse'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          1. BROWSE TEAMS
        </button>
        <button
          type="button"
          onClick={() => setMobilePage('preview')}
          className={`min-h-[44px] px-2.5 rounded-lg font-arcade text-[10px] uppercase font-bold transition-all cursor-pointer ${
            mobilePage === 'preview'
              ? 'bg-amber-500 text-slate-950 shadow font-black'
              : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          2. SQUAD & KITS
        </button>
      </div>

      {/* Navigation / View Toggle Bar */}
      <div
        className={`${
          mobilePage === 'browse' ? 'flex' : 'hidden md:flex'
        } bg-slate-950/90 border-b border-slate-800 px-3 sm:px-4 py-2.5 flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-2.5 text-xs shrink-0`}
      >
        <div className="grid grid-cols-2 sm:inline-flex bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 gap-1">
          <button
            type="button"
            onClick={() => setViewMode('drill')}
            className={`min-h-[44px] px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'drill' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            By Continent
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`min-h-[44px] px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            All ({getAllTeams().length})
          </button>
        </div>

        {viewMode === 'drill' && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`min-h-[36px] px-2 py-1 rounded cursor-pointer transition-colors ${
                step === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-900'
              }`}
            >
              1. {category === 'club' ? 'CLUBS' : category === 'national' ? 'NATIONAL' : 'SPECIAL'}
            </button>

            {category === 'special' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`min-h-[36px] px-2 py-1 rounded cursor-pointer transition-colors ${
                    step === 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-900'
                  }`}
                >
                  2. Special Teams ({getAllTeams().filter((t) => t.category === 'special').length})
                </button>
              </>
            )}

            {category === 'national' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`min-h-[36px] px-2 py-1 rounded cursor-pointer transition-colors ${
                    step === 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-900'
                  }`}
                >
                  2. {confederation.toUpperCase()}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`min-h-[36px] px-2 py-1 rounded cursor-pointer transition-colors ${
                    step === 3 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-900'
                  }`}
                >
                  3. {country}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className={`min-h-[36px] px-2 py-1 rounded cursor-pointer transition-colors ${
                    step === 4 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-900'
                  }`}
                >
                  4. Squad
                </button>
              </>
            )}

            {category === 'club' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`min-h-[36px] px-2 py-1 rounded cursor-pointer transition-colors ${
                    step === 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-900'
                  }`}
                >
                  2. {confederation.toUpperCase()}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`min-h-[36px] px-2 py-1 rounded cursor-pointer transition-colors ${
                    step === 3 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-900'
                  }`}
                >
                  3. {country}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className={`min-h-[36px] px-2 py-1 rounded cursor-pointer transition-colors ${
                    step === 4 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-900'
                  }`}
                >
                  4. {league ? (league.length > 14 ? league.slice(0, 12) + '…' : league) : 'League'}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className={`min-h-[36px] px-2 py-1 rounded cursor-pointer transition-colors ${
                    step === 5 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-900'
                  }`}
                >
                  5. Club
                </button>
              </>
            )}
          </div>
        )}

        {viewMode === 'all' && (
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search team, country, league..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Panel: Drill-down / Browse */}
        <div className={`${mobilePage === 'browse' ? 'flex' : 'hidden md:flex'} md:col-span-7 flex-col gap-3 min-w-0`}>
          {viewMode === 'drill' ? (
            <>
              {step === 1 && (
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Step 1: Select Category</h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategory(cat.id);
                          if (cat.id === 'special') {
                            const specials = filterTeams('special');
                            if (specials.length > 0) setPreviewTeam(specials[0]);
                            setStep(2);
                          } else if (cat.id === 'national') {
                            const confs = getConfederationsForCategory('national');
                            if (confs.length > 0) {
                              setConfederation(confs[0].id);
                              const ctrs = getCountriesForCategoryAndConfederation('national', confs[0].id);
                              if (ctrs.length > 0) setCountry(ctrs[0]);
                            }
                            setStep(2);
                          } else {
                            const confs = getConfederationsForCategory('club');
                            if (confs.length > 0) {
                              setConfederation(confs[0].id);
                              const ctrs = getCountriesForCategoryAndConfederation('club', confs[0].id);
                              if (ctrs.length > 0) {
                                setCountry(ctrs[0]);
                                const lgs = getLeaguesForSelection('club', confs[0].id, ctrs[0]);
                                if (lgs.length > 0) setLeague(lgs[0]);
                              }
                            }
                            setStep(2);
                          }
                        }}
                        className={`min-h-[60px] p-3.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          category === cat.id
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl shrink-0">{cat.icon}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{cat.label}</div>
                            <div className="text-xs text-slate-400">
                              {cat.id === 'special'
                                ? `${cat.count} Showcase squads`
                                : cat.id === 'national'
                                ? `${cat.count} International squads`
                                : `${cat.count} Domestic clubs`}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {category === 'special' && step === 2 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Special Teams ({filteredTeams.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="min-h-[44px] px-3 rounded-lg bg-slate-800 text-xs font-bold text-blue-400 hover:text-white cursor-pointer"
                    >
                      ← Categories
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {pagedTeams.map((t) => {
                      const isSelected = previewTeam.id === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleSelectTeamAndUpdateSide(t)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-950/60 via-slate-800/80 to-slate-900 border-amber-500 shadow-md ring-1 ring-amber-400'
                              : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow border border-white/20 shrink-0"
                              style={{ backgroundColor: t.badge.bg, color: t.badge.primaryColor }}
                            >
                              {t.badge.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-xs sm:text-sm text-white truncate">{t.name}</span>
                                <span className={`px-1.5 py-0.5 text-[10px] uppercase rounded border shrink-0 ${getTierBadgeStyle(t.ratingTier)}`}>
                                  {t.ratingTier}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">
                                {t.preferredFormation} • <span className="text-amber-300 font-bold">{t.averageOvr} OVR</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleConfirmTeam(t);
                            }}
                            className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-transform active:scale-95 cursor-pointer shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                          >
                            {isSelected ? 'Confirm ✓' : 'Select'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {totalTeamPages > 1 && (
                    <ConsolePaginationBar
                      currentPage={safeTeamPage}
                      totalPages={totalTeamPages}
                      totalItems={filteredTeams.length}
                      pageSize={TEAMS_PER_PAGE}
                      onPageChange={setTeamPage}
                      label="TEAMS"
                    />
                  )}
                </div>
              )}

              {category === 'national' && step === 2 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                      Step 2: Select Continent
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="min-h-[44px] px-3 rounded-lg bg-slate-800 text-xs font-bold text-blue-400 hover:text-white cursor-pointer"
                    >
                      ← Categories
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {confederations.map((conf) => (
                      <button
                        key={conf.id}
                        type="button"
                        onClick={() => {
                          setConfederation(conf.id);
                          const ctrs = getCountriesForCategoryAndConfederation('national', conf.id);
                          if (ctrs.length > 0) setCountry(ctrs[0]);
                          setStep(3);
                        }}
                        className={`min-h-[56px] p-3.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          confederation === conf.id
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Globe className="w-5 h-5 text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{conf.label}</div>
                            <div className="text-xs text-slate-400">
                              {conf.region} ({conf.count} squad{conf.count > 1 ? 's' : ''})
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {category === 'national' && step === 3 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                      Step 3: Country ({confederation.toUpperCase()})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="min-h-[44px] px-3 rounded-lg bg-slate-800 text-xs font-bold text-blue-400 hover:text-white cursor-pointer"
                    >
                      ← Continent
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {countries.map((ctr) => (
                      <button
                        key={ctr}
                        type="button"
                        onClick={() => {
                          setCountry(ctr);
                          const list = filterTeams('national', confederation, ctr);
                          if (list.length > 0) handleSelectTeamAndUpdateSide(list[0]);
                          setStep(4);
                        }}
                        className={`min-h-[48px] p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          country === ctr
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-sm truncate">{ctr}</div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {category === 'national' && step === 4 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                      Step 4: National Squad ({filteredTeams.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="min-h-[44px] px-3 rounded-lg bg-slate-800 text-xs font-bold text-blue-400 hover:text-white cursor-pointer"
                    >
                      ← Country
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {pagedTeams.map((t) => {
                      const isSelected = previewTeam.id === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleSelectTeamAndUpdateSide(t)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-900/60 to-slate-800/80 border-blue-500 shadow-md ring-1 ring-blue-400'
                              : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow border border-white/20 shrink-0"
                              style={{ backgroundColor: t.badge.bg, color: t.badge.primaryColor }}
                            >
                              {t.badge.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-xs sm:text-sm text-white truncate">{t.name}</span>
                                <span className={`px-1.5 py-0.5 text-[10px] uppercase rounded border shrink-0 ${getTierBadgeStyle(t.ratingTier)}`}>
                                  {t.ratingTier}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">
                                {t.preferredFormation} • <span className="text-amber-300 font-bold">{t.averageOvr} OVR</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleConfirmTeam(t);
                            }}
                            className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-transform active:scale-95 cursor-pointer shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                          >
                            {isSelected ? 'Confirm ✓' : 'Select'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {totalTeamPages > 1 && (
                    <ConsolePaginationBar
                      currentPage={safeTeamPage}
                      totalPages={totalTeamPages}
                      totalItems={filteredTeams.length}
                      pageSize={TEAMS_PER_PAGE}
                      onPageChange={setTeamPage}
                      label="TEAMS"
                    />
                  )}
                </div>
              )}

              {category === 'club' && step === 2 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                      Step 2: Select Continent
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="min-h-[44px] px-3 rounded-lg bg-slate-800 text-xs font-bold text-blue-400 hover:text-white cursor-pointer"
                    >
                      ← Categories
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {confederations.map((conf) => (
                      <button
                        key={conf.id}
                        type="button"
                        onClick={() => {
                          setConfederation(conf.id);
                          const ctrs = getCountriesForCategoryAndConfederation('club', conf.id);
                          if (ctrs.length > 0) {
                            setCountry(ctrs[0]);
                            const lgs = getLeaguesForSelection('club', conf.id, ctrs[0]);
                            if (lgs.length > 0) setLeague(lgs[0]);
                          }
                          setStep(3);
                        }}
                        className={`min-h-[56px] p-3.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          confederation === conf.id
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Globe className="w-5 h-5 text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{conf.label}</div>
                            <div className="text-xs text-slate-400">
                              {conf.region} ({conf.count} club{conf.count > 1 ? 's' : ''})
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {category === 'club' && step === 3 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                      Step 3: Country ({confederation.toUpperCase()})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="min-h-[44px] px-3 rounded-lg bg-slate-800 text-xs font-bold text-blue-400 hover:text-white cursor-pointer"
                    >
                      ← Continent
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {countries.map((ctr) => (
                      <button
                        key={ctr}
                        type="button"
                        onClick={() => {
                          setCountry(ctr);
                          const lgs = getLeaguesForSelection('club', confederation, ctr);
                          if (lgs.length > 0) {
                            setLeague(lgs[0]);
                            const clubs = filterTeams('club', confederation, ctr, lgs[0]);
                            if (clubs.length > 0) setPreviewTeam(clubs[0]);
                          }
                          setStep(4);
                        }}
                        className={`min-h-[48px] p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          country === ctr
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-sm truncate">{ctr}</div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {category === 'club' && step === 4 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                      Step 4: League ({country})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="min-h-[44px] px-3 rounded-lg bg-slate-800 text-xs font-bold text-blue-400 hover:text-white cursor-pointer"
                    >
                      ← Country
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {leagues.map((lg) => {
                      const count = filterTeams('club', confederation, country, lg).length;
                      return (
                        <button
                          key={lg}
                          type="button"
                          onClick={() => {
                            setLeague(lg);
                            const list = filterTeams('club', confederation, country, lg);
                            if (list.length > 0) handleSelectTeamAndUpdateSide(list[0]);
                            setStep(5);
                          }}
                          className={`min-h-[56px] p-3.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                            league === lg
                              ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                              : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-white truncate">{lg}</div>
                              <div className="text-xs text-slate-400">
                                {count} club{count > 1 ? 's' : ''} competing
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {category === 'club' && step === 5 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider truncate">
                      Step 5: Club ({filteredTeams.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="min-h-[44px] px-3 rounded-lg bg-slate-800 text-xs font-bold text-blue-400 hover:text-white cursor-pointer shrink-0"
                    >
                      ← League
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {pagedTeams.map((t) => {
                      const isSelected = previewTeam.id === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleSelectTeamAndUpdateSide(t)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-900/60 to-slate-800/80 border-blue-500 shadow-md ring-1 ring-blue-400'
                              : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow border border-white/20 shrink-0"
                              style={{ backgroundColor: t.badge.bg, color: t.badge.primaryColor }}
                            >
                              {t.badge.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-xs sm:text-sm text-white truncate">{t.name}</span>
                                <span className={`px-1.5 py-0.5 text-[10px] uppercase rounded border shrink-0 ${getTierBadgeStyle(t.ratingTier)}`}>
                                  {t.ratingTier}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">
                                {t.preferredFormation} • <span className="text-amber-300 font-bold">{t.averageOvr} OVR</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleConfirmTeam(t);
                            }}
                            className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-transform active:scale-95 cursor-pointer shrink-0 ${
                              isSelected
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                          >
                            {isSelected ? 'Confirm ✓' : 'Select'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {totalTeamPages > 1 && (
                    <ConsolePaginationBar
                      currentPage={safeTeamPage}
                      totalPages={totalTeamPages}
                      totalItems={filteredTeams.length}
                      pageSize={TEAMS_PER_PAGE}
                      onPageChange={setTeamPage}
                      label="CLUBS"
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                All Teams ({searchResults.length})
              </h3>
              <div className="flex flex-col gap-2">
                {pagedTeams.map((t) => {
                  const isSelected = previewTeam.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTeamAndUpdateSide(t)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-900/60 to-slate-800/80 border-blue-500 shadow-md ring-1 ring-blue-400'
                          : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow border border-white/20 shrink-0"
                          style={{ backgroundColor: t.badge.bg, color: t.badge.primaryColor }}
                        >
                          {t.badge.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-white truncate">{t.name}</span>
                            <span className={`px-1.5 py-0.5 text-[9px] uppercase rounded border shrink-0 ${getTierBadgeStyle(t.ratingTier)}`}>
                              {t.ratingTier}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {t.country}{t.league ? ` • ${t.league}` : ''} • <span className="text-amber-300 font-bold">{t.averageOvr} OVR</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleConfirmTeam(t);
                        }}
                        className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-transform active:scale-95 cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {isSelected ? 'Confirm ✓' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>
              {totalTeamPages > 1 && (
                <ConsolePaginationBar
                  currentPage={safeTeamPage}
                  totalPages={totalTeamPages}
                  totalItems={searchResults.length}
                  pageSize={TEAMS_PER_PAGE}
                  onPageChange={setTeamPage}
                  label="TEAMS"
                />
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Selected Team Inspection (Page 2 on Mobile) */}
        <div className={`${mobilePage === 'preview' ? 'flex' : 'hidden md:flex'} md:col-span-5 flex-col gap-3 min-w-0`}>
          <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg border-2 border-white/20 shrink-0"
                  style={{ backgroundColor: displayTeam.badge.bg, color: displayTeam.badge.primaryColor }}
                >
                  {displayTeam.badge.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-base text-white truncate">{displayTeam.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] uppercase rounded border ${getTierBadgeStyle(displayTeam.ratingTier)}`}>
                      TIER {displayTeam.ratingTier}
                    </span>
                    <span className="text-xs text-amber-400">{getStars(displayTeam.ratingTier)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-amber-400 leading-none">{displayTeam.averageOvr}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">OVR</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 italic border-l-2 border-amber-400/80 pl-2.5 py-0.5 font-sans">
              &ldquo;{displayTeam.description}&rdquo;
            </p>

            {displayTeam.league && (
              <div className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">{displayTeam.league}</span>
                <span>({displayTeam.country})</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Formation</span>
                <span className="font-black text-white">{displayTeam.preferredFormation}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Philosophy</span>
                <span className="font-bold text-amber-300 capitalize">
                  {displayTeam.tacticalPlaystyle.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Official Uniforms</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">Home</span>
                  <div
                    className="w-6 h-6 rounded-full border border-white/20 shadow"
                    style={{ backgroundColor: displayTeam.kit.primaryColor }}
                  />
                  <span className="text-[10px] truncate max-w-full text-slate-300">{displayTeam.kit.name}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">Away</span>
                  <div
                    className="w-6 h-6 rounded-full border border-white/20 shadow"
                    style={{ backgroundColor: displayTeam.awayKit.primaryColor }}
                  />
                  <span className="text-[10px] truncate max-w-full text-slate-300">{displayTeam.awayKit.name}</span>
                </div>
                {displayTeam.thirdKit ? (
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">3rd</span>
                    <div
                      className="w-6 h-6 rounded-full border border-white/20 shadow"
                      style={{ backgroundColor: displayTeam.thirdKit.primaryColor }}
                    />
                    <span className="text-[10px] truncate max-w-full text-slate-300">{displayTeam.thirdKit.name}</span>
                  </div>
                ) : (
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-[10px]">
                    Standard
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-black flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Set-Piece Specialists</span>
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <div className="truncate">
                  <span className="text-slate-400">Cap:</span>{' '}
                  <span className="font-bold text-amber-300">
                    {displayTeam.players.find((p) => p.id === displayTeam.roles.captainId || p.isCaptain)?.name || 'Leader'}
                  </span>
                </div>
                <div className="truncate">
                  <span className="text-slate-400">Pen:</span>{' '}
                  <span className="font-bold text-white">
                    {displayTeam.players.find((p) => p.id === displayTeam.roles.penaltyTakerId)?.name || 'Striker'}
                  </span>
                </div>
                <div className="truncate">
                  <span className="text-slate-400">FK Near:</span>{' '}
                  <span className="font-bold text-white">
                    {displayTeam.players.find((p) => p.id === displayTeam.roles.freeKickNearId)?.name || 'Direct'}
                  </span>
                </div>
                <div className="truncate">
                  <span className="text-slate-400">FK Long:</span>{' '}
                  <span className="font-bold text-white">
                    {displayTeam.players.find((p) => p.id === displayTeam.roles.freeKickLongId)?.name || 'Long'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLineup(!showLineup)}
              className="w-full min-h-[44px] py-2 text-xs font-bold text-blue-300 hover:text-white bg-slate-900 rounded-lg border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>
                {showLineup
                  ? 'Hide Lineup'
                  : `Inspect Full Squad (${displayTeam.players.length} + ${displayTeam.substitutes?.length || 0} Bench)`}
              </span>
            </button>

            {showLineup && (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 border-t border-slate-800 pt-2">
                <div className="text-[10px] uppercase font-black text-amber-400 px-1">Starting 11</div>
                <div className="flex flex-col gap-1">
                  {displayTeam.players.map((p) => {
                    const ovr = calculatePlayerOvr(p.canonicalStats, p.role);
                    const hasSB = Object.values(p.canonicalStats).some(
                      (v) => typeof v === 'number' && isStatBreak(v)
                    );
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-slate-900/60 border border-slate-800/80"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 text-slate-400 font-mono text-[11px] shrink-0">#{p.number}</span>
                          <span className="font-bold text-white truncate">{p.name}</span>
                          {p.isCaptain && (
                            <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-1 rounded shrink-0">
                              (C)
                            </span>
                          )}
                          {hasSB && <span className="text-[10px] text-amber-300 font-bold shrink-0">⚡</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs shrink-0">
                          <span className="text-slate-400 uppercase font-mono">{p.subPosition}</span>
                          <span className="font-black text-amber-400">{ovr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {onOpenTeamEditor && (
              <button
                type="button"
                onClick={() => onOpenTeamEditor(displayTeam.id)}
                className="w-full min-h-[44px] py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Edit Team &amp; Venue</span>
              </button>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </ConsoleModalShell>
  );
};
