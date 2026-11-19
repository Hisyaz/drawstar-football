import React, { useState, useEffect, useMemo } from 'react';
import { QualifierSummary, WorldCupSummary } from '../utils/internationalCareerCycleEngine';
import { audioManager } from '../utils/audioSystem';
import { Globe, Trophy, CheckCircle2, Play, Sparkles, Newspaper, ListOrdered, BarChart3, ChevronRight } from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar, ConsolePageTab } from './common/ConsolePager';

interface InternationalTournamentModalProps {
  isOpen: boolean;
  qualifierSummary: QualifierSummary | null;
  worldCupSummary: WorldCupSummary | null;
  onClose: () => void;
  onTriggerKeyMatch?: (stageTitle: string, opponentName: string, opponentOvr: number) => void;
}

const MATCHES_PER_PAGE = 4;

export const InternationalTournamentModal: React.FC<InternationalTournamentModalProps> = ({
  isOpen,
  qualifierSummary,
  worldCupSummary,
  onClose,
  onTriggerKeyMatch,
}) => {
  const isWorldCup = !!worldCupSummary;
  const summary = qualifierSummary;
  const wcSummary = worldCupSummary;

  const hasStandings = Boolean(summary?.standings || wcSummary?.groupStandings);
  const hasKnockout = Boolean(isWorldCup && (wcSummary?.currentKnockoutOpponent || wcSummary?.knockoutStages));

  const [activeTab, setActiveTab] = useState<'overview' | 'standings' | 'knockout' | 'matches' | 'player_stats'>(
    hasKnockout && wcSummary?.currentKnockoutOpponent && !wcSummary?.isFinished
      ? 'knockout'
      : hasStandings
      ? 'standings'
      : 'overview'
  );
  const [matchesPage, setMatchesPage] = useState(1);

  const compName = isWorldCup
    ? wcSummary?.competitionName || (wcSummary?.isContinental ? 'Continental Championship' : 'World Championship')
    : summary?.competitionName || 'World Championship Qualifiers';

  useEffect(() => {
    if (isOpen && (qualifierSummary || worldCupSummary)) {
      const modeType = wcSummary?.isContinental ? 'continental' : 'world';
      audioManager.enterMatchMode(modeType, compName);
      setMatchesPage(1);
    }
    return () => {
      audioManager.exitMatchMode();
    };
  }, [isOpen, compName, wcSummary?.isContinental, qualifierSummary, worldCupSummary]);

  const reversedMatches = useMemo(() => {
    const raw = isWorldCup ? wcSummary?.matches || [] : summary?.matches || [];
    return [...raw].reverse();
  }, [isWorldCup, wcSummary?.matches, summary?.matches]);

  if (!isOpen || (!qualifierSummary && !worldCupSummary)) return null;

  const tier = isWorldCup ? wcSummary!.tier : summary!.tier;
  const nation = isWorldCup ? wcSummary!.playerNation : summary!.playerNation;
  const standingsRows = summary?.standings || wcSummary?.groupStandings || [];
  const headline = isWorldCup ? wcSummary!.newsHeadline : summary!.newsHeadline;
  const newsSummary = isWorldCup ? wcSummary!.newsSummary : summary!.newsSummary;

  const totalMatchPages = Math.max(1, Math.ceil(reversedMatches.length / MATCHES_PER_PAGE));
  const safeMatchPage = Math.min(matchesPage, totalMatchPages);
  const pagedMatches = reversedMatches.slice(
    (safeMatchPage - 1) * MATCHES_PER_PAGE,
    safeMatchPage * MATCHES_PER_PAGE
  );

  const tabs: ConsolePageTab[] = [
    { id: 'overview', label: 'Press Brief', icon: <Newspaper className="w-3.5 h-3.5" /> },
  ];
  if (hasStandings) {
    tabs.push({ id: 'standings', label: 'Standings', icon: <ListOrdered className="w-3.5 h-3.5" /> });
  }
  if (hasKnockout) {
    tabs.push({ id: 'knockout', label: 'Knockout', icon: <Trophy className="w-3.5 h-3.5" /> });
  }
  tabs.push({ id: 'matches', label: 'Results', badge: reversedMatches.length, icon: <Globe className="w-3.5 h-3.5" /> });
  if (!isWorldCup) {
    tabs.push({ id: 'player_stats', label: 'Stats', icon: <BarChart3 className="w-3.5 h-3.5" /> });
  }

  return (
    <ConsoleModalShell
      id="international-tournament-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={compName}
      subtitle={`${nation.name.toUpperCase()} (${tier.toUpperCase()}) · International Hub`}
      badge={`${reversedMatches.length} MATCHES`}
      icon={
        <img
          src={`https://flagcdn.com/w80/${(nation.iso || 'gb-eng').toLowerCase()}.png`}
          alt={nation.code}
          className="w-full h-full object-cover rounded"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50" viewBox="0 0 80 50"><rect width="80" height="50" fill="%23334155"/></svg>';
          }}
        />
      }
      accentColor="amber"
      maxWidthClass="sm:max-w-4xl"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as any)}
      bodyClassName="p-3 sm:p-5 space-y-4 bg-slate-950/90"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 font-arcade uppercase"
        >
          <span>CONTINUE CAREER MODE</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      }
    >
      {/* TAB 1: FULL-WIDTH PRESS BRIEF */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-arcade">
                <Sparkles className="w-4 h-4 text-amber-400" /> OFFICIAL INTERNATIONAL REPORT
              </span>
              <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/60 px-2.5 py-0.5 rounded border border-sky-500/30">
                {nation.name} • {tier}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white font-arcade leading-snug">
              {headline}
            </h3>

            <ConsolePagedText
              paragraphs={[newsSummary]}
              maxCharsPerPage={360}
              resetKey={`${compName}-${headline}`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">Nation</span>
              <span className="text-sm font-black text-white">{nation.name}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">Matches Logged</span>
              <span className="text-sm font-black text-amber-300">{reversedMatches.length}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">Stage Status</span>
              <span className="text-sm font-black text-emerald-300">
                {wcSummary?.playerFinishStage || (tier === 'Senior' ? 'Active Qualifier' : `${tier} Squad`)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STANDINGS (MOBILE CARDS + DESKTOP TABLE) */}
      {activeTab === 'standings' && hasStandings && (
        <div className="space-y-3">
          {/* Mobile Compact Standing Cards (0 horizontal overflow) */}
          <div className="sm:hidden space-y-2">
            {standingsRows.map((row, idx) => (
              <div
                key={row.nationCode}
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                  row.isPlayerNation
                    ? 'bg-amber-500/20 border-amber-400 text-white'
                    : row.qualified
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-100'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-6 text-center font-arcade font-black text-sm text-amber-300 shrink-0">
                    {idx + 1}
                  </span>
                  <img
                    src={`https://flagcdn.com/w40/${(row.iso || 'gb-eng').toLowerCase()}.png`}
                    alt={row.nationCode}
                    className="w-5 h-3.5 object-cover rounded shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-arcade font-bold text-sm truncate">{row.nationName}</span>
                      {row.isPlayerNation && (
                        <span className="text-[10px] font-black uppercase text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/20 shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {row.played}P · {row.wins}W-{row.draws}D-{row.losses}L · GD {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-arcade font-black text-base text-amber-300">
                    {row.points} PTS
                  </div>
                  <div className={`text-[10px] font-bold uppercase ${row.qualified ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {row.qualified ? 'QUALIFIED' : 'OUT'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 font-arcade">
                  <th className="p-2.5 text-center">#</th>
                  <th className="p-2.5">Nation</th>
                  <th className="p-2.5 text-center">P</th>
                  <th className="p-2.5 text-center">W</th>
                  <th className="p-2.5 text-center">D</th>
                  <th className="p-2.5 text-center">L</th>
                  <th className="p-2.5 text-center">GF</th>
                  <th className="p-2.5 text-center">GA</th>
                  <th className="p-2.5 text-center">GD</th>
                  <th className="p-2.5 text-center font-black text-amber-400">Pts</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {standingsRows.map((row, idx) => (
                  <tr
                    key={row.nationCode}
                    className={`${
                      row.isPlayerNation
                        ? 'bg-amber-500/20 font-black text-white ring-1 ring-amber-400/50'
                        : row.qualified
                        ? 'bg-emerald-950/20 text-slate-200'
                        : 'text-slate-400 hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="p-2.5 text-center font-arcade font-bold">{idx + 1}</td>
                    <td className="p-2.5 flex items-center gap-2">
                      <img
                        src={`https://flagcdn.com/w40/${(row.iso || 'gb-eng').toLowerCase()}.png`}
                        alt={row.nationCode}
                        className="w-4 h-3 object-cover rounded-sm"
                      />
                      <span className="font-arcade">{row.nationName}</span>
                      {row.isPlayerNation && (
                        <span className="text-[10px] font-black uppercase text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/20">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-arcade">{row.played}</td>
                    <td className="p-2.5 text-center font-arcade">{row.wins}</td>
                    <td className="p-2.5 text-center font-arcade">{row.draws}</td>
                    <td className="p-2.5 text-center font-arcade">{row.losses}</td>
                    <td className="p-2.5 text-center font-arcade">{row.goalsFor}</td>
                    <td className="p-2.5 text-center font-arcade">{row.goalsAgainst}</td>
                    <td className="p-2.5 text-center font-arcade font-bold">
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td className="p-2.5 text-center font-arcade font-black text-amber-400 text-sm">
                      {row.points}
                    </td>
                    <td className="p-2.5 text-right font-arcade">
                      {row.qualified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> QUALIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                          Eliminated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: KNOCKOUT STAGE & KEY MATCH */}
      {activeTab === 'knockout' && wcSummary && (
        <div className="space-y-3">
          {wcSummary.currentKnockoutOpponent && !wcSummary.isFinished ? (
            <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-xs font-black uppercase text-amber-300 tracking-wider font-arcade">
                  KNOCKOUT MATCH AWAITING
                </span>
                <span className="text-xs font-arcade font-black text-amber-400">
                  STAGE: {wcSummary.playerFinishStage || 'Knockout Round'}
                </span>
              </div>

              <div className="flex items-center justify-around py-2 gap-2">
                <div className="text-center space-y-1.5 min-w-0 flex-1">
                  <div className="w-16 h-11 mx-auto rounded overflow-hidden shadow-md border-2 border-white/20">
                    <img
                      src={`https://flagcdn.com/w80/${(wcSummary.playerNation.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={wcSummary.playerNation.code}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-black text-sm text-white font-arcade truncate">{wcSummary.playerNation.name}</div>
                  <div className="text-xs font-arcade text-amber-400 font-bold">YOU</div>
                </div>

                <div className="text-xl sm:text-2xl font-black text-amber-400 font-arcade shrink-0">VS</div>

                <div className="text-center space-y-1.5 min-w-0 flex-1">
                  <div className="w-16 h-11 mx-auto rounded overflow-hidden shadow-md border-2 border-white/20">
                    <img
                      src={`https://flagcdn.com/w80/${(wcSummary.currentKnockoutOpponent.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={wcSummary.currentKnockoutOpponent.code}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-black text-sm text-white font-arcade truncate">{wcSummary.currentKnockoutOpponent.name}</div>
                  <div className="text-xs font-arcade text-slate-400 font-bold">OVR {wcSummary.currentKnockoutOpponent.ovr}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onTriggerKeyMatch && wcSummary.currentKnockoutOpponent) {
                    onTriggerKeyMatch(
                      `${compName} - ${wcSummary.playerFinishStage}`,
                      wcSummary.currentKnockoutOpponent.name,
                      wcSummary.currentKnockoutOpponent.ovr
                    );
                  }
                }}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer font-arcade uppercase"
              >
                <Play className="w-4 h-4 fill-slate-950 stroke-none" />
                <span>PLAY {wcSummary.playerFinishStage?.toUpperCase() || 'KNOCKOUT'} KEY MATCH</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-base font-black text-white font-arcade">TOURNAMENT FINISHED</h4>
              <p className="text-sm text-slate-300 font-sans">
                Final Finish Stage: <span className="font-bold text-amber-400 font-arcade">{wcSummary.playerFinishStage}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PAGINATED MATCH RESULTS */}
      {activeTab === 'matches' && (
        <div className="space-y-3">
          {reversedMatches.length > MATCHES_PER_PAGE && (
            <ConsolePaginationBar
              currentPage={safeMatchPage}
              totalPages={totalMatchPages}
              onPageChange={setMatchesPage}
              totalItems={reversedMatches.length}
              pageSize={MATCHES_PER_PAGE}
              label="RESULTS PAGE"
            />
          )}

          <div className="space-y-2.5">
            {pagedMatches.map((m) => (
              <div
                key={m.matchNumber}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5"
              >
                <div className="text-[11px] font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 shrink-0 font-arcade">
                  {m.stageName || `Match #${m.matchNumber}`}
                </div>

                <div className="flex items-center justify-center gap-2.5 font-black text-sm w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-right min-w-0">
                    <span className="text-white font-arcade truncate max-w-[110px] sm:max-w-none">{m.homeNation.name}</span>
                    <img
                      src={`https://flagcdn.com/w40/${(m.homeNation.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={m.homeNation.code}
                      className="w-4 h-3 object-cover rounded-sm shrink-0"
                    />
                  </div>

                  <div className="px-2.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-amber-300 font-arcade text-sm shrink-0">
                    {m.homeScore} - {m.awayScore}
                  </div>

                  <div className="flex items-center gap-1.5 text-left min-w-0">
                    <img
                      src={`https://flagcdn.com/w40/${(m.awayNation.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={m.awayNation.code}
                      className="w-4 h-3 object-cover rounded-sm shrink-0"
                    />
                    <span className="text-white font-arcade truncate max-w-[110px] sm:max-w-none">{m.awayNation.name}</span>
                  </div>
                </div>

                {m.playerStats && (
                  <div className="flex items-center gap-2 text-xs font-arcade font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-sky-300 shrink-0">
                    <span>⚽ {m.playerStats.goals}g</span>
                    <span>👟 {m.playerStats.assists}a</span>
                    <span className="text-amber-400">⭐ {m.playerStats.matchRating}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PLAYER STATS (QUALIFIER) */}
      {!isWorldCup && activeTab === 'player_stats' && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
            <span className="text-xs font-black uppercase text-slate-400 font-arcade">Qualifying Goals</span>
            <div className="text-3xl font-black text-amber-400 font-arcade">{summary.totalPlayerGoals}</div>
            <p className="text-xs text-slate-400 font-sans">Goals scored in qualifiers</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
            <span className="text-xs font-black uppercase text-slate-400 font-arcade">Qualifying Assists</span>
            <div className="text-3xl font-black text-sky-400 font-arcade">{summary.totalPlayerAssists}</div>
            <p className="text-xs text-slate-400 font-sans">Key goal assists</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
            <span className="text-xs font-black uppercase text-slate-400 font-arcade">Average Match Rating</span>
            <div className="text-3xl font-black text-emerald-400 font-arcade">{summary.avgPlayerRating}</div>
            <p className="text-xs text-slate-400 font-sans">Out of 10.0 scale</p>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
