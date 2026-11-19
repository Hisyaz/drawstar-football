import React, { useState, useMemo, useEffect } from 'react';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar,
  Filter,
  ArrowUpDown,
  BarChart3,
  ListChecks,
} from 'lucide-react';
import { haptics } from '../utils/hapticsSystem';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

interface SeasonMatchesFullListModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: SimulatedMatchResult[];
  seasonYear?: string;
  clubName?: string;
  playerName?: string;
}

const MATCHES_PER_PAGE = 5;

export const SeasonMatchesFullListModal: React.FC<SeasonMatchesFullListModalProps> = ({
  isOpen,
  onClose,
  matches = [],
  seasonYear = '2026/27',
  clubName = 'Youth Academy',
  playerName = 'Player',
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'matches' | 'stats'>('matches');
  const [resultFilter, setResultFilter] = useState<'all' | 'win' | 'draw' | 'loss'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
    }
  }, [isOpen, resultFilter, sortOrder]);

  // Calculate Season Totals
  const stats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goals = 0;
    let assists = 0;
    let cleanSheets = 0;
    let mvps = 0;
    let ratedMatches = 0;
    let totalRating = 0;
    let minutesPlayed = 0;

    matches.forEach((m) => {
      const isWin = m.isPlayerHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
      const isDraw = m.homeScore === m.awayScore;
      if (isWin) wins++;
      else if (isDraw) draws++;
      else losses++;

      goals += m.playerGoals || 0;
      assists += m.playerAssists || 0;
      if (m.cleanSheet) cleanSheets++;
      if (m.isMvp) mvps++;
      if (typeof m.playerRating === 'number' && m.playerRating > 0) {
        ratedMatches++;
        totalRating += m.playerRating;
      }
      minutesPlayed += m.minutesPlayed || 0;
    });

    const avgRating = ratedMatches > 0 ? (totalRating / ratedMatches).toFixed(1) : '—';

    return {
      total: matches.length,
      wins,
      draws,
      losses,
      goals,
      assists,
      cleanSheets,
      mvps,
      avgRating,
      minutesPlayed,
    };
  }, [matches]);

  // Filtered & Sorted Matches
  const displayedMatches = useMemo(() => {
    let list = [...matches];

    if (resultFilter !== 'all') {
      list = list.filter((m) => {
        const isWin = m.isPlayerHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
        const isDraw = m.homeScore === m.awayScore;
        if (resultFilter === 'win') return isWin;
        if (resultFilter === 'draw') return isDraw;
        if (resultFilter === 'loss') return !isWin && !isDraw;
        return true;
      });
    }

    if (sortOrder === 'newest') {
      list.reverse();
    }

    return list;
  }, [matches, resultFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(displayedMatches.length / MATCHES_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedMatches = useMemo(() => {
    const start = (safePage - 1) * MATCHES_PER_PAGE;
    return displayedMatches.slice(start, start + MATCHES_PER_PAGE);
  }, [displayedMatches, safePage]);

  if (!isOpen) return null;

  return (
    <ConsoleModalShell
      id="season-matches-full-list-modal"
      isOpen={isOpen}
      onClose={() => {
        haptics.buttonPress();
        onClose();
      }}
      title={t('CURRENT_SEASON_FIXTURES_TITLE') || 'SEASON FIXTURES & RESULTS'}
      subtitle={`${playerName} · ${clubName} · ${seasonYear}`}
      badge={`${matches.length} MATCHES`}
      icon={<Calendar className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-4xl"
      zIndexClass="z-[120]"
      tabs={[
        {
          id: 'matches',
          label: 'Fixtures Log',
          badge: displayedMatches.length,
          icon: <ListChecks className="w-4 h-4" />,
        },
        {
          id: 'stats',
          label: 'Season Totals',
          icon: <BarChart3 className="w-4 h-4" />,
        },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => {
        haptics.buttonPress();
        setActiveTab(id as 'matches' | 'stats');
      }}
      bodyClassName="p-3 sm:p-5 space-y-4 bg-slate-950/90"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            {matches.length > 0
              ? `${matches.length} fixture(s) recorded (${stats.wins}W-${stats.draws}D-${stats.losses}L)`
              : 'Season schedule ready for kickoff'}
          </span>

          <button
            type="button"
            onClick={() => {
              haptics.buttonPress();
              onClose();
            }}
            className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-arcade text-xs sm:text-sm uppercase tracking-wider rounded-xl border border-amber-300 transition-all cursor-pointer active:scale-95"
          >
            {t('CLOSE_FIXTURES_LIST') || 'CLOSE FIXTURES LIST'}
          </button>
        </div>
      }
    >
      {/* TAB 1: PAGINATED FIXTURES LIST */}
      {activeTab === 'matches' && (
        <div className="space-y-3.5">
          {/* Compact Record Quick-Pill Strip */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2 flex-wrap text-xs font-arcade">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase">{t('SEASON_RECORD') || 'RECORD'}:</span>
              <span className="font-black">
                <span className="text-emerald-400">{stats.wins}W</span> -{' '}
                <span className="text-amber-400">{stats.draws}D</span> -{' '}
                <span className="text-rose-400">{stats.losses}L</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-mono">
              <span>⚽ {stats.goals}G</span>
              <span>🎯 {stats.assists}A</span>
              <span className="text-amber-300 font-bold">⭐ {stats.avgRating}</span>
            </div>
          </div>

          {/* Filter & Sort Console Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
              {(
                [
                  { id: 'all', label: `${t('FILTER_ALL') || 'ALL'} (${matches.length})` },
                  { id: 'win', label: `${t('FILTER_WINS') || 'WIN'} (${stats.wins})` },
                  { id: 'draw', label: `${t('FILTER_DRAWS') || 'DRAW'} (${stats.draws})` },
                  { id: 'loss', label: `${t('FILTER_LOSSES') || 'LOSS'} (${stats.losses})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    haptics.buttonPress();
                    setResultFilter(tab.id);
                  }}
                  className={`min-h-[44px] px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-arcade uppercase rounded-xl border transition-all cursor-pointer truncate ${
                    resultFilter === tab.id
                      ? 'bg-amber-400 text-slate-950 font-black border-amber-300'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                haptics.buttonPress();
                setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
              }}
              className="min-h-[44px] px-3 py-1.5 text-xs font-arcade uppercase bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {sortOrder === 'newest'
                  ? t('SORT_NEWEST') || 'NEWEST FIRST'
                  : t('SORT_OLDEST') || 'OLDEST FIRST'}
              </span>
            </button>
          </div>

          {/* Pagination Control Top */}
          {displayedMatches.length > MATCHES_PER_PAGE && (
            <ConsolePaginationBar
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={displayedMatches.length}
              pageSize={MATCHES_PER_PAGE}
              label="FIXTURES PAGE"
            />
          )}

          {/* Match Rows */}
          {pagedMatches.length > 0 ? (
            <div className="space-y-2.5">
              {pagedMatches.map((m, idx) => {
                const isWin = m.isPlayerHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
                const isDraw = m.homeScore === m.awayScore;
                const opponentName = m.isPlayerHome ? m.awayTeamName : m.homeTeamName;
                const scoreDisplay = `${m.homeScore} - ${m.awayScore}`;
                const resultBadge = isWin
                  ? { label: 'WIN', bg: 'bg-emerald-950 text-emerald-300 border-emerald-500/80' }
                  : isDraw
                  ? { label: 'DRAW', bg: 'bg-amber-950 text-amber-300 border-amber-500/80' }
                  : { label: 'LOSS', bg: 'bg-rose-950 text-rose-300 border-rose-500/80' };

                const globalIdx = (safePage - 1) * MATCHES_PER_PAGE + idx;
                const fixtureNumber =
                  m.matchIndex !== undefined
                    ? m.matchIndex + 1
                    : sortOrder === 'newest'
                    ? displayedMatches.length - globalIdx
                    : globalIdx + 1;

                return (
                  <div
                    key={m.matchId || `full-match-${globalIdx}`}
                    className="bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-colors"
                  >
                    {/* Fixture Number & Date */}
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      <div className="w-12 text-center py-1.5 px-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">MD</span>
                        <span className="text-sm font-black font-arcade text-amber-300 block">
                          #{fixtureNumber}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-mono text-slate-400">
                            {m.calendarDate || `Fixture ${fixtureNumber}`}
                          </span>
                          <span className="text-[11px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded">
                            {m.isPlayerHome ? `🏠 ${t('VENUE_HOME') || 'HOME'}` : `✈️ ${t('VENUE_AWAY') || 'AWAY'}`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {m.competitionName || 'Domestic Championship'}
                        </p>
                      </div>
                    </div>

                    {/* Opponent & Score */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto space-y-1">
                      <p className="text-sm sm:text-base font-black text-white truncate font-arcade">
                        vs {opponentName || 'Opponent Club'}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${resultBadge.bg}`}>
                          {resultBadge.label} {scoreDisplay}
                        </span>
                        <span className="text-xs font-sans text-slate-400 truncate">
                          {m.homeTeamName} vs {m.awayTeamName}
                        </span>
                      </div>
                      {((m.goalScorers && m.goalScorers.length > 0) || m.mvpName) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-sans text-slate-300">
                          {m.goalScorers?.map((g, gIdx) => (
                            <span
                              key={`${m.matchId}-sm-g-${gIdx}`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800"
                            >
                              <span className="text-emerald-400 font-bold">⚽ {g.minute}&apos;</span>
                              <span className="text-white font-semibold">{g.playerName}</span>
                              {g.assistPlayerName && (
                                <span className="text-sky-300 text-[10px]">({g.assistPlayerName})</span>
                              )}
                            </span>
                          ))}
                          {m.mvpName && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200 font-semibold">
                              🏆 MVP: {m.mvpName}
                              {typeof m.mvpRating === 'number' && !isNaN(m.mvpRating) ? ` (${m.mvpRating.toFixed(1)})` : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Player Match Contribution */}
                    <div className="flex flex-col sm:items-end gap-1.5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 text-xs font-arcade">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {m.playerStatus === 'suspended' || m.isSuspended ? (
                          <span className="font-black text-xs px-2 py-0.5 rounded bg-rose-950 border border-rose-500/80 text-rose-300">
                            🟥 {m.suspensionReason || t('ROLE_SUSPENDED') || 'SUSPENDED'}
                          </span>
                        ) : m.playerStatus === 'starter' ? (
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-sky-950 border border-sky-500/60 text-sky-300">
                            {t('ROLE_STARTER') || 'STARTER'} • ⏱️ {m.minutesPlayed ?? 90}'
                          </span>
                        ) : m.playerStatus === 'sub_in' ? (
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300">
                            {t('ROLE_SUB_IN') || 'SUB IN'} • ⏱️ {m.minutesPlayed ?? 25}'
                          </span>
                        ) : m.playerStatus === 'sub_out' ? (
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-amber-950 border border-amber-500/60 text-amber-300">
                            {t('ROLE_SUB_OUT') || 'SUB OUT'} • ⏱️ {m.minutesPlayed ?? 60}'
                          </span>
                        ) : (
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-300">
                            {t('ROLE_BENCHED') || 'BENCHED'} • ⏱️ 0'
                          </span>
                        )}

                        {m.playerRating !== undefined && m.playerRating > 0 && !m.isSuspended && (
                          <span className="font-black text-amber-300 bg-amber-950/70 px-2 py-0.5 border border-amber-500/50 rounded">
                            ⭐ {m.playerRating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      {!m.isSuspended && (m.playerGoals > 0 || m.playerAssists > 0 || m.yellowCard || m.redCard || m.isMvp) && (
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          {m.playerGoals > 0 && (
                            <span className="font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 border border-emerald-500/40 rounded">
                              ⚽ {m.playerGoals}
                            </span>
                          )}
                          {m.playerAssists > 0 && (
                            <span className="font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 border border-sky-500/40 rounded">
                              🎯 {m.playerAssists}
                            </span>
                          )}
                          {m.redCard && (
                            <span className="font-black text-rose-300 bg-rose-950 px-1.5 py-0.5 border border-rose-500 rounded">
                              🟥 {t('MATCH_RED_CARDS') || 'RED'}
                            </span>
                          )}
                          {m.yellowCard && (
                            <span className="font-black text-yellow-300 bg-amber-950 px-1.5 py-0.5 border border-yellow-500 rounded">
                              🟨 {t('MATCH_YELLOW_CARDS') || 'YELLOW'}
                            </span>
                          )}
                          {m.isMvp && (
                            <span className="font-black text-amber-300 bg-amber-950/80 px-1.5 py-0.5 border border-amber-400 rounded">
                              🏆 {t('MATCH_MAN_OF_MATCH') || 'MVP'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm font-arcade bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 px-4">
              <Filter className="w-8 h-8 text-slate-600 mb-1" />
              <p className="font-bold uppercase tracking-wider text-slate-200">
                {t('NO_MATCHES_SIMULATED_THIS_SEASON') || 'NO MATCHES RECORDED THIS SEASON'}
              </p>
              <p className="text-xs font-sans text-slate-400 max-w-sm">
                {t('SIMULATE_MATCHDAY_1_DESC') || 'Simulate Matchday 1 or clear your active filter to see match results.'}
              </p>
            </div>
          )}

          {displayedMatches.length > MATCHES_PER_PAGE && (
            <ConsolePaginationBar
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={displayedMatches.length}
              pageSize={MATCHES_PER_PAGE}
              label="FIXTURES PAGE"
            />
          )}
        </div>
      )}

      {/* TAB 2: DEDICATED SEASON TOTALS PAGE */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center font-arcade">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center gap-1">
              <span className="text-xs text-slate-400 uppercase">{t('SEASON_RECORD') || 'RECORD'}</span>
              <span className="text-base sm:text-lg font-black">
                <span className="text-emerald-400">{stats.wins}W</span> -{' '}
                <span className="text-amber-400">{stats.draws}D</span> -{' '}
                <span className="text-rose-400">{stats.losses}L</span>
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center gap-1">
              <span className="text-xs text-slate-400 uppercase">{t('MATCHES_PLAYED') || 'MATCHES'}</span>
              <span className="text-xl sm:text-2xl font-black text-white">{stats.total}</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center gap-1">
              <span className="text-xs text-slate-400 uppercase">GOALS / ASSISTS</span>
              <span className="text-base sm:text-lg font-black text-emerald-400">
                ⚽ {stats.goals} <span className="text-slate-500">|</span> 🎯 {stats.assists}
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center gap-1">
              <span className="text-xs text-slate-400 uppercase">AVG RATING</span>
              <span className="text-xl sm:text-2xl font-black text-yellow-300">
                ⭐ {stats.avgRating}
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center gap-1">
              <span className="text-xs text-slate-400 uppercase">MVPs / CLEAN SHEETS</span>
              <span className="text-base sm:text-lg font-black text-sky-300">
                🏆 {stats.mvps} <span className="text-slate-500">|</span> 🧤 {stats.cleanSheets}
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-center gap-1">
              <span className="text-xs text-slate-400 uppercase">MINUTES PLAYED</span>
              <span className="text-xl sm:text-2xl font-black text-slate-100">
                ⏱️ {stats.minutesPlayed}'
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-arcade font-bold uppercase text-amber-300">
              Campaign Overview
            </h4>
            <p className="text-sm text-slate-200 font-sans leading-relaxed">
              {playerName} has completed {stats.total} match(es) for {clubName} during {seasonYear}, accumulating {stats.minutesPlayed} competitive minutes with {stats.goals} goal(s) and {stats.assists} assist(s).
            </p>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
