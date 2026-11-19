import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';
import {
  Trophy,
  Crown,
  Shield,
  ArrowRight,
  ChevronLeft,
  Zap,
  Wallet,
  BarChart3,
  Star,
  Award,
} from 'lucide-react';
import { PlayerCardData, PlayerConfig } from '../types';
import {
  WorldAwardsSeasonResults,
  EuropeanGoldenShoeEntry,
} from '../types/individualAwards';
import { NationalTournamentState } from '../utils/nationalTournamentManager';
import { BackgroundTournamentResult } from '../utils/nationalCallUpEngine';
import { calculateWorldIndividualAwards } from '../utils/individualAwardsEngine';
import { calculateEuropeanGoldenShoe, getEuropeanGoldenShoeCoefficient } from '../utils/uefaAssociationRankingSystem';
import { getWorldSimulationState, WorldLeagueStandingRow } from '../utils/worldSimulationEngine';
import { getCareerLeagueDatabase } from '../utils/careerSaveSystem';
import { ConsoleModalShell, ConsolePaginationBar, ConsolePageTab } from './common/ConsolePager';

export interface SeasonSummaryModalProps {
  isOpen: boolean;
  player: PlayerCardData | PlayerConfig;
  seasonYear: string;
  onProceedToPreseason: () => void;
  onClose?: () => void;
  worldAwardsData?: WorldAwardsSeasonResults | null;
  playerStanding?: WorldLeagueStandingRow | null;
  nationalTournamentState?: NationalTournamentState | null;
  latestIntTournamentResult?: BackgroundTournamentResult | null;
  block1Stats?: any;
  block2Stats?: any;
}

type SummarySectionTab = 'summary' | 'finances' | 'league' | 'best_xi' | 'golden_boot';

const BEST_XI_PER_PAGE = 6;

export const SeasonSummaryModal: React.FC<SeasonSummaryModalProps> = ({
  isOpen,
  player,
  seasonYear,
  onProceedToPreseason,
  onClose,
  worldAwardsData: propWorldAwards,
  playerStanding,
  block1Stats,
  block2Stats,
}) => {
  const [activeTab, setActiveTab] = useState<SummarySectionTab>('summary');
  const [bestXiPage, setBestXiPage] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('summary');
    setBestXiPage(1);
    if (shouldDisableParticles()) return;
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.35 },
        colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#34d399', '#ffffff', '#eab308'],
      });
    } catch {
      // Safe fallback
    }
  }, [isOpen]);

  const seasonalStats = useMemo(() => {
    const m = (block1Stats?.gamesPlayed ?? block1Stats?.matches ?? 0) + (block2Stats?.gamesPlayed ?? block2Stats?.matches ?? 0);
    const g = (block1Stats?.goals || 0) + (block2Stats?.goals || 0);
    const a = (block1Stats?.assists || 0) + (block2Stats?.assists || 0);
    const avg =
      block1Stats && block2Stats
        ? parseFloat((((block1Stats.avgRating || 7.2) + (block2Stats.avgRating || 7.2)) / 2).toFixed(2))
        : block1Stats?.avgRating ?? block2Stats?.avgRating ?? 7.2;
    const cs = (block1Stats?.cleanSheets || 0) + (block2Stats?.cleanSheets || 0);
    return { matches: m, goals: g, assists: a, avgRating: avg, cleanSheets: cs };
  }, [block1Stats, block2Stats]);

  const seasonGrade = useMemo(() => {
    let score = 0;
    const g = seasonalStats.goals;
    const a = seasonalStats.assists;
    const rating = seasonalStats.avgRating;

    if (rating >= 8.2) score += 4;
    else if (rating >= 7.8) score += 3;
    else if (rating >= 7.4) score += 2;
    else score += 1;

    if (g + a >= 25) score += 4;
    else if (g + a >= 15) score += 3;
    else if (g + a >= 8) score += 2;
    else score += 1;

    if (playerStanding?.rank === 1) score += 3;
    else if (playerStanding?.rank && playerStanding.rank <= 4) score += 2;

    if (score >= 9) {
      return {
        grade: 'S',
        label: 'LEGENDARY MASTERPIECE',
        sublabel: "Ballon d'Or Caliber Season",
        color: 'text-amber-300 border-amber-400 bg-amber-500/20 shadow-amber-500/20',
      };
    }
    if (score >= 7) {
      return {
        grade: 'A',
        label: 'OUTSTANDING CAMPAIGN',
        sublabel: 'Elite Continental Standard',
        color: 'text-emerald-300 border-emerald-400 bg-emerald-500/20 shadow-emerald-500/20',
      };
    }
    if (score >= 4) {
      return {
        grade: 'B',
        label: 'SOLID STARTER',
        sublabel: 'Reliable First-Team Contributor',
        color: 'text-sky-300 border-sky-400 bg-sky-500/20 shadow-sky-500/20',
      };
    }
    return {
      grade: 'C',
      label: 'DEVELOPMENT PHASE',
      sublabel: 'Form & Adaptability Focus',
      color: 'text-slate-300 border-slate-500 bg-slate-800 shadow-slate-900',
    };
  }, [seasonalStats, playerStanding]);

  const financialSummary = useMemo(() => {
    const weeklyWage = (player as any).weeklyWage || (player as any).wage || 25000;
    const annualWages = weeklyWage * 52;
    const goalBonus = seasonalStats.goals * 5000;
    const leagueBonus =
      playerStanding?.rank === 1
        ? 250000
        : playerStanding?.rank && playerStanding.rank <= 4
        ? 75000
        : 25000;
    const totalBonuses = goalBonus + leagueBonus;
    const netEarnings = annualWages + totalBonuses;
    const totalSavings = (player as any).savings || Math.round(netEarnings * 0.7);

    return {
      weeklyWage,
      annualWages,
      totalBonuses,
      netEarnings,
      totalSavings,
    };
  }, [player, seasonalStats, playerStanding]);

  const awardsData: WorldAwardsSeasonResults = useMemo(() => {
    if (propWorldAwards && propWorldAwards.domesticAwards) {
      return propWorldAwards;
    }
    return calculateWorldIndividualAwards(
      player as PlayerCardData,
      seasonalStats,
      seasonYear,
      false
    );
  }, [propWorldAwards, player, seasonalStats, seasonYear]);

  const domesticAwards = awardsData.domesticAwards;
  const leagueName = domesticAwards?.leagueName || player.league || 'English League';

  const campaignHonors = useMemo(() => {
    const honors: { id: string; name: string; type: string; icon: string }[] = [];

    if (playerStanding?.rank === 1) {
      honors.push({
        id: 'league_title',
        name: `${leagueName} Champion`,
        type: 'Team Trophy',
        icon: '🏆',
      });
    }

    if (domesticAwards?.topScorerWinner?.isPlayer || domesticAwards?.topScorerWinner?.playerName === player.name) {
      honors.push({
        id: 'golden_boot',
        name: `${leagueName} Golden Boot`,
        type: 'Individual Honor',
        icon: '👟',
      });
    }

    if (domesticAwards?.bestPlayerWinner?.isPlayer || domesticAwards?.bestPlayerWinner?.playerName === player.name) {
      honors.push({
        id: 'player_of_season',
        name: `${leagueName} Player of the Season`,
        type: 'Individual Honor',
        icon: '👑',
      });
    }

    const isUserInBestXI = domesticAwards?.leagueBestXI?.allEleven.some(
      (c) => c.isUserPlayer || c.name === player.name
    );
    if (isUserInBestXI) {
      honors.push({
        id: 'best_xi',
        name: `${leagueName} Best XI Selection`,
        type: 'Individual Honor',
        icon: '⭐',
      });
    }

    if (honors.length === 0) {
      honors.push({
        id: 'first_team_medal',
        name: `${playerStanding?.rank ? `#${playerStanding.rank} Finish` : 'Season Finisher'}`,
        type: 'Campaign Medal',
        icon: '🎖️',
      });
    }

    return honors;
  }, [playerStanding, domesticAwards, leagueName, player.name]);

  const leagueAwardsList = useMemo(() => {
    if (!domesticAwards) return [];
    const topScorer = domesticAwards.topScorerWinner;
    const topAssists = domesticAwards.topAssistsWinner;
    const mvp = domesticAwards.bestPlayerWinner;
    const topGk = domesticAwards.bestGoalkeeperWinner;

    return [
      {
        id: 'top_scorer',
        category: 'GOALSCORING',
        title: domesticAwards.domesticTopScorerTrophyName || `${leagueName} Top Goalscorer`,
        winnerName: topScorer?.playerName || player.name || 'Player',
        winnerClub: topScorer?.clubName || player.club || 'Club',
        statDisplay: `${topScorer?.value ?? seasonalStats.goals} Goals`,
        isUserWinner: Boolean(topScorer?.isPlayer || topScorer?.playerName === player.name),
      },
      {
        id: 'top_assists',
        category: 'CREATIVITY',
        title: `${leagueName} Playmaker of the Season`,
        winnerName: topAssists?.playerName || player.name || 'Player',
        winnerClub: topAssists?.clubName || player.club || 'Club',
        statDisplay: `${topAssists?.value ?? seasonalStats.assists} Assists`,
        isUserWinner: Boolean(topAssists?.isPlayer || topAssists?.playerName === player.name),
      },
      {
        id: 'mvp',
        category: 'EXCELLENCE',
        title: `${leagueName} Player of the Season`,
        winnerName: mvp?.playerName || player.name || 'Player',
        winnerClub: mvp?.clubName || player.club || 'Club',
        statDisplay: `${Number(mvp?.value ?? seasonalStats.avgRating ?? 7.0).toFixed(2)} Avg Rating`,
        isUserWinner: Boolean(mvp?.isPlayer || mvp?.playerName === player.name),
      },
      {
        id: 'best_gk',
        category: 'GOALKEEPING',
        title: `${leagueName} Golden Glove`,
        winnerName: topGk?.playerName || 'Clean Sheet Leader',
        winnerClub: topGk?.clubName || player.club || 'Club',
        statDisplay: `${topGk?.cleanSheets || 16} Clean Sheets`,
        isUserWinner: Boolean(topGk?.isPlayer || topGk?.playerName === player.name),
      },
    ];
  }, [domesticAwards, leagueName, player, seasonalStats]);

  const goldenBootData = useMemo(() => {
    const db = getCareerLeagueDatabase();
    const worldState = getWorldSimulationState(seasonYear, db, player as any);
    const coeffInfo = getEuropeanGoldenShoeCoefficient(
      (player as any).leagueId || player.league || 'england_d1',
      seasonYear,
      worldState
    );

    if (!coeffInfo.isEligible) {
      return { isEligible: false, top5: [], userEntry: null };
    }

    const list: EuropeanGoldenShoeEntry[] =
      awardsData.europeanGoldenShoe && awardsData.europeanGoldenShoe.length > 0
        ? awardsData.europeanGoldenShoe
        : calculateEuropeanGoldenShoe(seasonYear, db, player as any, seasonalStats.goals);

    const top5 = list.slice(0, 5);
    const userIdx = list.findIndex((e) => e.isUserPlayer || e.id === player.id || e.name === player.name);
    const userEntry = userIdx >= 0 ? { ...list[userIdx], rank: userIdx + 1 } : null;

    return {
      isEligible: true,
      top5,
      userEntry,
    };
  }, [player, seasonYear, awardsData, seasonalStats]);

  const bestXI = domesticAwards?.leagueBestXI;
  const bestXiPlayers = bestXI?.allEleven || [];
  const totalBestXiPages = Math.max(1, Math.ceil(bestXiPlayers.length / BEST_XI_PER_PAGE));
  const safeBestXiPage = Math.min(bestXiPage, totalBestXiPages);
  const pagedBestXI = bestXiPlayers.slice(
    (safeBestXiPage - 1) * BEST_XI_PER_PAGE,
    safeBestXiPage * BEST_XI_PER_PAGE
  );

  const isGk = (player.position || '').toUpperCase().includes('GK');

  if (!isOpen) return null;

  const tabs: ConsolePageTab[] = [
    { id: 'summary', label: 'Wrap-Up', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'finances', label: 'Finances', icon: <Wallet className="w-3.5 h-3.5" /> },
    { id: 'league', label: 'Honors', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'best_xi', label: 'Best XI', icon: <Star className="w-3.5 h-3.5" /> },
  ];
  if (goldenBootData.isEligible) {
    tabs.push({ id: 'golden_boot', label: 'Golden Shoe', icon: <Award className="w-3.5 h-3.5" /> });
  }

  return (
    <ConsoleModalShell
      id="drawstar-season-summary-screen"
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      title={`${player.name} • ${player.club || 'Club'}`}
      subtitle={`Official Season Wrap-Up · ${leagueName}`}
      badge={`SEASON ${seasonYear}`}
      icon={<Trophy className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-5xl"
      headerRight={
        onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-arcade font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">RETURN</span>
          </button>
        ) : undefined
      }
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as SummarySectionTab)}
      bodyClassName="p-3 sm:p-5 space-y-4 bg-slate-950/90"
      footer={
        <div className="flex items-center justify-end">
          <button
            id="btn-season-summary-continue"
            type="button"
            onClick={onProceedToPreseason}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl text-xs sm:text-sm font-arcade font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/25 uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95 shrink-0"
          >
            <span>PROCEED TO OFF-SEASON</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      }
    >
      {/* TAB 1: CAMPAIGN GRADE, STATS & HONORS */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 bg-slate-900 border border-amber-500/60 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-4 flex flex-col items-center justify-center font-arcade font-black text-3xl sm:text-4xl shadow-xl shrink-0 ${seasonGrade.color}`}
                >
                  <span>{seasonGrade.grade}</span>
                  <span className="text-[9px] font-mono tracking-widest mt-0.5">GRADE</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-arcade font-bold text-amber-400 uppercase tracking-wider">
                    SEASON EVALUATION
                  </div>
                  <h3 className="text-base sm:text-xl font-arcade font-black text-white uppercase tracking-tight mt-0.5">
                    {seasonGrade.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
                    {seasonGrade.sublabel} · {leagueName}
                  </p>
                </div>
              </div>

              {playerStanding && (
                <div className="w-full sm:w-auto bg-slate-950 px-4 py-2.5 border border-slate-800 rounded-xl flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                  <span className="text-[10px] font-arcade uppercase text-slate-400">LEAGUE PLACEMENT</span>
                  <span className="text-sm sm:text-base font-arcade font-black text-amber-300">
                    Rank #{playerStanding.rank} ({playerStanding.points} PTS)
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left">
                <span className="text-[10px] font-arcade uppercase text-slate-400 block">MATCHES</span>
                <span className="text-lg sm:text-xl font-arcade font-black text-white mt-0.5 block">
                  {seasonalStats.matches}
                </span>
                <span className="text-xs text-slate-500 font-sans">Season Caps</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left">
                <span className="text-[10px] font-arcade uppercase text-slate-400 block">
                  {isGk ? 'CLEAN SHEETS' : 'GOALS'}
                </span>
                <span className="text-lg sm:text-xl font-arcade font-black text-emerald-400 mt-0.5 block">
                  {isGk ? seasonalStats.cleanSheets : seasonalStats.goals}
                </span>
                <span className="text-xs text-slate-500 font-sans">
                  {isGk ? 'Shutouts Kept' : 'Competitive'}
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left">
                <span className="text-[10px] font-arcade uppercase text-slate-400 block">
                  {isGk ? 'GK RATING' : 'ASSISTS'}
                </span>
                <span className="text-lg sm:text-xl font-arcade font-black text-sky-400 mt-0.5 block">
                  {isGk ? `${seasonalStats.avgRating} ★` : seasonalStats.assists}
                </span>
                <span className="text-xs text-slate-500 font-sans">
                  {isGk ? 'Shot Stopping' : 'Goal Assists'}
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left">
                <span className="text-[10px] font-arcade uppercase text-slate-400 block">AVG RATING</span>
                <span className="text-lg sm:text-xl font-arcade font-black text-amber-300 mt-0.5 block">
                  {seasonalStats.avgRating}
                </span>
                <span className="text-xs text-slate-500 font-sans">Performance</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-left space-y-2">
              <span className="text-xs font-arcade font-bold text-amber-400 uppercase tracking-wider block">
                TROPHIES & HONORS EARNED THIS CAMPAIGN
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {campaignHonors.map((honor) => (
                  <div
                    key={honor.id}
                    className="px-3 py-1.5 bg-slate-900 border border-amber-500/50 rounded-xl flex items-center gap-2 text-xs font-arcade font-bold text-white"
                  >
                    <span className="text-sm">{honor.icon}</span>
                    <span>{honor.name}</span>
                    <span className="text-[10px] text-amber-400 font-sans font-normal">({honor.type})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEDICATED FINANCIAL SUMMARY */}
      {activeTab === 'finances' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 bg-slate-900 border border-emerald-500/40 rounded-2xl text-left space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800 pb-3">
              <span className="text-xs sm:text-sm font-arcade font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                FINANCIAL SUMMARY & BANKING
              </span>
              <span className="text-xs text-amber-300 font-mono font-bold bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                €{financialSummary.weeklyWage.toLocaleString()} / week
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-arcade text-slate-400 block">BASE SALARY EARNED</span>
                <span className="text-lg sm:text-xl font-arcade font-black text-white block">
                  €{financialSummary.annualWages.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-sans">52-week contract total</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-arcade text-slate-400 block">BONUSES & MERITS</span>
                <span className="text-lg sm:text-xl font-arcade font-black text-amber-400 block">
                  +€{financialSummary.totalBonuses.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-sans">Goal & standing payouts</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-arcade text-slate-400 block">TOTAL NET SAVINGS</span>
                <span className="text-lg sm:text-xl font-arcade font-black text-emerald-400 block">
                  €{financialSummary.totalSavings.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-sans">Career liquidity reserve</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEAGUE HONORS */}
      {activeTab === 'league' && (
        <div className="space-y-3">
          <div className="text-xs font-arcade font-bold text-amber-300 uppercase">
            {leagueName} Individual Honors
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {leagueAwardsList.map((award) => (
              <div
                key={award.id}
                className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 ${
                  award.isUserWinner
                    ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="text-[10px] font-arcade text-amber-400 uppercase">{award.category}</div>
                  <div className="text-sm font-arcade font-black text-white leading-snug">{award.title}</div>
                  <div className="text-xs font-sans text-slate-400 truncate">
                    Winner: <strong className="text-white">{award.winnerName}</strong> ({award.winnerClub})
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-arcade font-black text-emerald-400">{award.statDisplay}</span>
                  {award.isUserWinner && (
                    <span className="text-[10px] font-arcade text-amber-300 block font-bold mt-1">★ YOU</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAGINATED BEST XI */}
      {activeTab === 'best_xi' && (
        <div className="space-y-3">
          <div className="text-xs font-arcade font-bold text-amber-300 uppercase flex items-center justify-between gap-2 flex-wrap">
            <span>{leagueName} Team of the Season</span>
            <span className="text-slate-400 font-mono">Formation {bestXI?.formation || '4-3-3'}</span>
          </div>

          {bestXiPlayers.length > BEST_XI_PER_PAGE && (
            <ConsolePaginationBar
              currentPage={safeBestXiPage}
              totalPages={totalBestXiPages}
              onPageChange={setBestXiPage}
              totalItems={bestXiPlayers.length}
              pageSize={BEST_XI_PER_PAGE}
              label="XI PAGE"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {pagedBestXI.map((star, idx) => {
              const isUser = star.isUserPlayer || star.name === player.name;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 ${
                    isUser
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="text-xs font-arcade font-bold text-white truncate flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded font-mono shrink-0">
                        {star.subPosition || star.mainPosition}
                      </span>
                      <span className="truncate">{star.name}</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">{star.club}</div>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-400 shrink-0">
                    {star.ovr ? `${star.ovr} OVR` : `${star.points?.toFixed(1)} Pts`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: EUROPEAN GOLDEN SHOE STANDINGS */}
      {activeTab === 'golden_boot' && goldenBootData.isEligible && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-arcade font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              European Golden Shoe Top 5
            </span>
            {goldenBootData.userEntry && (
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/40">
                Your Rank: #{goldenBootData.userEntry.rank} ({goldenBootData.userEntry.points.toFixed(1)} pts)
              </span>
            )}
          </div>

          <div className="space-y-2">
            {goldenBootData.top5.map((entry, i) => {
              const isUser = entry.isUserPlayer || entry.name === player.name;
              return (
                <div
                  key={entry.id || i}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                    isUser
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-6 text-center font-arcade font-black text-sm text-amber-300 shrink-0">
                      #{i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-arcade font-bold truncate">{entry.name}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {entry.club} · {entry.leagueName} (×{entry.coefficient})
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-arcade font-black text-amber-300">
                      {entry.points.toFixed(1)} pts
                    </div>
                    <div className="text-xs font-mono text-slate-400">{entry.goals} goals</div>
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
