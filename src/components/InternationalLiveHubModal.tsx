import React, { useState, useEffect, useMemo } from 'react';
import {
  InternationalTournamentHubState,
  InternationalFixture,
} from '../types/internationalFootball';
import { PlayerCardData } from '../types';
import { audioManager } from '../utils/audioSystem';
import {
  Globe,
  Trophy,
  Play,
  CheckCircle2,
  ChevronRight,
  User,
  Activity,
  Calendar,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar, ConsolePageTab } from './common/ConsolePager';

interface InternationalLiveHubModalProps {
  isOpen: boolean;
  hubState: InternationalTournamentHubState | null;
  player: PlayerCardData;
  onClose: () => void;
  onPlayKeyMatch: (fixture: InternationalFixture) => void;
  onSimulateMatch: () => void;
  onAdvanceToNextMatch: () => void;
  onConcludeInternationalDuty: () => void;
}

const FIXTURES_PER_PAGE = 4;

export const InternationalLiveHubModal: React.FC<InternationalLiveHubModalProps> = ({
  isOpen,
  hubState,
  player,
  onClose,
  onPlayKeyMatch,
  onSimulateMatch,
  onConcludeInternationalDuty,
}) => {
  const [activeTab, setActiveTab] = useState<'matchday' | 'standings' | 'fixtures' | 'knockout' | 'squad'>('matchday');
  const [isSimulatingAnimation, setIsSimulatingAnimation] = useState(false);
  const [selectedGroupLetter, setSelectedGroupLetter] = useState<string>(hubState?.drawGroupLetter || 'A');
  const [fixturesPage, setFixturesPage] = useState(1);

  useEffect(() => {
    if (hubState?.drawGroupLetter) {
      setSelectedGroupLetter(hubState.drawGroupLetter);
    }
  }, [hubState?.drawGroupLetter]);

  useEffect(() => {
    if (isOpen && hubState) {
      audioManager.enterMatchMode('world', hubState.competitionName || 'World Championship');
      setFixturesPage(1);
    }
    return () => {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.exitMatchMode(clubCountry);
    };
  }, [isOpen, hubState?.competitionName, player, hubState]);

  const totalFixturePages = useMemo(() => {
    const len = hubState?.fixtures.length || 0;
    return Math.max(1, Math.ceil(len / FIXTURES_PER_PAGE));
  }, [hubState?.fixtures.length]);

  if (!isOpen || !hubState) return null;

  const curIdx = hubState.currentFixtureIndex;
  const currentFixture = curIdx < hubState.fixtures.length ? hubState.fixtures[curIdx] : null;
  const lastCompletedFixture = curIdx > 0 ? hubState.fixtures[curIdx - 1] : null;
  const isDutyFinished = hubState.isFinished;

  const safeFixturesPage = Math.min(fixturesPage, totalFixturePages);
  const pagedFixtures = hubState.fixtures.slice(
    (safeFixturesPage - 1) * FIXTURES_PER_PAGE,
    safeFixturesPage * FIXTURES_PER_PAGE
  );

  const handleSimulateWithAnimation = () => {
    setIsSimulatingAnimation(true);
    setTimeout(() => {
      setIsSimulatingAnimation(false);
      onSimulateMatch();
    }, 600);
  };

  const tabs: ConsolePageTab[] = [
    { id: 'matchday', label: 'Matchday', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'standings', label: 'Standings', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'fixtures', label: 'Schedule', badge: hubState.fixtures.length, icon: <Calendar className="w-3.5 h-3.5" /> },
  ];
  if (hubState.isKnockoutStageActive) {
    tabs.push({ id: 'knockout', label: 'Knockout', icon: <Layers className="w-3.5 h-3.5" /> });
  }
  tabs.push({ id: 'squad', label: 'Camp Info', icon: <User className="w-3.5 h-3.5" /> });

  return (
    <ConsoleModalShell
      id="international-live-hub-modal"
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      title={hubState.competitionName}
      subtitle={`${hubState.callingNation.name.toUpperCase()} (${hubState.tier.toUpperCase()}) · ${hubState.windowLabel}`}
      badge={`${hubState.playerRole}`}
      icon={
        <img
          src={`https://flagcdn.com/w80/${(hubState.callingNation.iso || 'gb-eng').toLowerCase()}.png`}
          alt={hubState.callingNation.code}
          className="w-full h-full object-cover rounded"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50" viewBox="0 0 80 50"><rect width="80" height="50" fill="%23334155"/></svg>';
          }}
        />
      }
      headerRight={
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg font-arcade text-xs shrink-0">
          <span className="text-amber-300 font-black">⚽ {hubState.totalGoals}</span>
          <span className="text-slate-600">|</span>
          <span className="text-sky-300 font-black">👟 {hubState.totalAssists}</span>
        </div>
      }
      accentColor="amber"
      maxWidthClass="sm:max-w-5xl"
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as any)}
      bodyClassName="p-3 sm:p-5 space-y-4 bg-slate-950/90"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 font-arcade">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700 uppercase"
          >
            Minimize Camp View
          </button>

          {isDutyFinished && (
            <button
              type="button"
              onClick={onConcludeInternationalDuty}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 uppercase"
            >
              <span>Return to Club Career</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      }
    >
      {/* TAB 1: MATCHDAY LIVE */}
      {activeTab === 'matchday' && (
        <div className="space-y-4">
          {isDutyFinished ? (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500 rounded-2xl p-4 sm:p-6 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center mx-auto text-amber-400">
                <Trophy className="w-7 h-7" />
              </div>

              <div className="space-y-2 text-left max-w-2xl mx-auto">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-arcade block text-center">
                  INTERNATIONAL DUTY CONCLUDED
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white uppercase text-center">
                  {hubState.newsHeadline}
                </h3>
                {hubState.newsSummary && (
                  <ConsolePagedText
                    paragraphs={[hubState.newsSummary]}
                    maxCharsPerPage={360}
                    resetKey={hubState.newsHeadline}
                  />
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5 max-w-lg mx-auto pt-1 font-arcade">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Caps</span>
                  <div className="text-lg font-black text-sky-400 font-mono">{hubState.capsGained}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Goals</span>
                  <div className="text-lg font-black text-amber-400 font-mono">{hubState.totalGoals}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Finish</span>
                  <div className="text-xs font-black text-emerald-400 mt-1 uppercase truncate">
                    {hubState.playerFinishStage || (hubState.playerQualified ? 'QUALIFIED ✅' : 'Completed')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onConcludeInternationalDuty}
                className="w-full max-w-md min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 mx-auto font-arcade uppercase"
              >
                <span>RETURN TO CLUB CAREER</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ) : currentFixture ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-xs font-black uppercase text-amber-300 tracking-wider font-arcade">
                  {currentFixture.stageName}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 font-arcade">
                  Match {currentFixture.matchNumber} of {hubState.fixtures.length}
                </span>
              </div>

              <div className="flex items-center justify-around py-3 bg-slate-950 rounded-2xl border border-slate-800 px-2 gap-2">
                <div className="text-center space-y-1.5 flex-1 min-w-0">
                  <div className="w-14 h-10 sm:w-16 sm:h-11 mx-auto rounded overflow-hidden shadow-md border-2 border-white/20">
                    <img
                      src={`https://flagcdn.com/w80/${(currentFixture.homeNation.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={currentFixture.homeNation.code}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-black text-xs sm:text-sm text-white uppercase truncate px-1">
                    {currentFixture.homeNation.name}
                  </div>
                  <div className="text-xs font-mono text-slate-400 font-arcade">
                    OVR <span className="font-bold text-amber-300">{currentFixture.homeNation.ovr}</span>
                    {currentFixture.homeNation.code === hubState.callingNation.code && (
                      <span className="ml-1 text-[10px] px-1 rounded bg-amber-500/30 text-amber-300 font-bold">YOU</span>
                    )}
                  </div>
                </div>

                <div className="px-2 text-center shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-arcade">VS</div>
                  <span className="text-[10px] font-arcade text-slate-500 uppercase hidden sm:block">Venue</span>
                </div>

                <div className="text-center space-y-1.5 flex-1 min-w-0">
                  <div className="w-14 h-10 sm:w-16 sm:h-11 mx-auto rounded overflow-hidden shadow-md border-2 border-white/20">
                    <img
                      src={`https://flagcdn.com/w80/${(currentFixture.awayNation.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={currentFixture.awayNation.code}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-black text-xs sm:text-sm text-white uppercase truncate px-1">
                    {currentFixture.awayNation.name}
                  </div>
                  <div className="text-xs font-mono text-slate-400 font-arcade">
                    OVR <span className="font-bold text-amber-300">{currentFixture.awayNation.ovr}</span>
                    {currentFixture.awayNation.code === hubState.callingNation.code && (
                      <span className="ml-1 text-[10px] px-1 rounded bg-amber-500/30 text-amber-300 font-bold">YOU</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-arcade">
                <button
                  type="button"
                  onClick={() => onPlayKeyMatch(currentFixture)}
                  className="min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer uppercase"
                >
                  <Play className="w-4 h-4 fill-slate-950 stroke-none shrink-0" />
                  <span>PLAY INTERACTIVE KEY MATCH (QTE)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateWithAnimation}
                  disabled={isSimulatingAnimation}
                  className="min-h-[48px] py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-600 shadow-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 uppercase"
                >
                  <Activity className={`w-4 h-4 text-amber-400 shrink-0 ${isSimulatingAnimation ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingAnimation ? 'SIMULATING FIXTURE...' : 'SIMULATE MATCH INSTANTLY'}</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Last Completed Fixture */}
          {lastCompletedFixture && lastCompletedFixture.isPlayed && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-arcade">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> RECENT MATCH RESULT
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 font-arcade">
                  {lastCompletedFixture.homeScore} - {lastCompletedFixture.awayScore}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm font-black text-white uppercase text-center sm:text-left">
                  {lastCompletedFixture.homeNation.name}{' '}
                  <span className="font-mono text-amber-400">{lastCompletedFixture.homeScore}</span> -{' '}
                  <span className="font-mono text-amber-400">{lastCompletedFixture.awayScore}</span>{' '}
                  {lastCompletedFixture.awayNation.name}
                </div>

                {lastCompletedFixture.playerStats && (
                  <div className="flex items-center gap-2.5 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-emerald-300 font-bold">⚽ {lastCompletedFixture.playerStats.goals}G</span>
                    <span className="text-sky-300 font-bold">👟 {lastCompletedFixture.playerStats.assists}A</span>
                    <span className="text-amber-400 font-bold">⭐ {lastCompletedFixture.playerStats.matchRating}</span>
                  </div>
                )}
              </div>

              {lastCompletedFixture.commentaryLogs && lastCompletedFixture.commentaryLogs.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-black uppercase text-slate-400 font-arcade">Match Timeline</span>
                  <div className="bg-slate-950 rounded-xl p-3 space-y-1.5 text-xs text-slate-200 font-sans border border-slate-800">
                    {lastCompletedFixture.commentaryLogs.map((log, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 shrink-0">{log.minute}&apos;</span>
                        <span className="leading-snug">{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STANDINGS */}
      {activeTab === 'standings' &&
        (() => {
          const hasMultipleGroups = hubState.allGroups && hubState.allGroups.length > 1;
          const activeGroupObj = hubState.allGroups?.find((g) => g.groupLetter === selectedGroupLetter);
          const isViewingPlayerGroup = !hasMultipleGroups || selectedGroupLetter === (hubState.drawGroupLetter || 'A');
          const displayRows = isViewingPlayerGroup
            ? hubState.standings
            : activeGroupObj?.standings || hubState.standings;

          return (
            <div className="space-y-3">
              {hasMultipleGroups && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-arcade">
                  {hubState.allGroups!.map((g) => {
                    const isSelected = selectedGroupLetter === g.groupLetter;
                    const isPlayerGrp = g.groupLetter === hubState.drawGroupLetter;
                    return (
                      <button
                        key={g.groupLetter}
                        id={`btn-hub-group-${g.groupLetter}`}
                        type="button"
                        onClick={() => setSelectedGroupLetter(g.groupLetter)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 uppercase ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        <span>{g.groupName}</span>
                        {isPlayerGrp && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              isSelected ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            YOU
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Mobile Compact Standings Cards */}
              <div className="sm:hidden space-y-2">
                {displayRows.map((row, idx) => (
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
                      <span className="w-6 text-center font-mono font-black text-sm text-amber-300 shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={`https://flagcdn.com/w40/${(row.iso || 'gb-eng').toLowerCase()}.png`}
                        alt={row.nationCode}
                        className="w-5 h-3.5 object-cover rounded shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm uppercase truncate">{row.nationName}</span>
                          {row.isPlayerNation && (
                            <span className="text-[10px] font-black uppercase text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/20 shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          {row.played}P · {row.wins}W-{row.draws}D-{row.losses}L · GD{' '}
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-base text-amber-300">{row.points} PTS</div>
                      <div className={`text-[10px] font-bold uppercase ${row.qualified ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {row.qualified ? 'QUALIFIED' : 'CONTENDING'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Standings Table */}
              <div className="hidden sm:block bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto shadow-md">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 font-arcade">
                      <th className="p-3 text-center">#</th>
                      <th className="p-3">Nation</th>
                      <th className="p-3 text-center">P</th>
                      <th className="p-3 text-center">W</th>
                      <th className="p-3 text-center">D</th>
                      <th className="p-3 text-center">L</th>
                      <th className="p-3 text-center">GF</th>
                      <th className="p-3 text-center">GA</th>
                      <th className="p-3 text-center">GD</th>
                      <th className="p-3 text-center font-black text-amber-400">Pts</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {displayRows.map((row, idx) => (
                      <tr
                        key={row.nationCode}
                        className={`${
                          row.isPlayerNation
                            ? 'bg-amber-500/15 font-black text-white border-l-4 border-l-amber-400'
                            : row.qualified
                            ? 'bg-emerald-950/20 text-slate-200'
                            : 'text-slate-400 hover:bg-slate-900/50'
                        }`}
                      >
                        <td className="p-3 text-center font-mono font-bold">{idx + 1}</td>
                        <td className="p-3 flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/w40/${(row.iso || 'gb-eng').toLowerCase()}.png`}
                            alt={row.nationCode}
                            className="w-4 h-3 object-cover rounded-sm"
                          />
                          <span className="uppercase">{row.nationName}</span>
                          {row.isPlayerNation && (
                            <span className="text-[10px] font-black uppercase text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/20 font-arcade">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono">{row.played}</td>
                        <td className="p-3 text-center font-mono">{row.wins}</td>
                        <td className="p-3 text-center font-mono">{row.draws}</td>
                        <td className="p-3 text-center font-mono">{row.losses}</td>
                        <td className="p-3 text-center font-mono">{row.goalsFor}</td>
                        <td className="p-3 text-center font-mono">{row.goalsAgainst}</td>
                        <td className="p-3 text-center font-mono font-bold">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="p-3 text-center font-mono font-black text-amber-400 text-sm">
                          {row.points}
                        </td>
                        <td className="p-3 text-right font-arcade">
                          {row.qualified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> QUALIFIED
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Contending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

      {/* TAB 3: PAGINATED FIXTURES */}
      {activeTab === 'fixtures' && (
        <div className="space-y-3">
          {hubState.fixtures.length > FIXTURES_PER_PAGE && (
            <ConsolePaginationBar
              currentPage={safeFixturesPage}
              totalPages={totalFixturePages}
              onPageChange={setFixturesPage}
              totalItems={hubState.fixtures.length}
              pageSize={FIXTURES_PER_PAGE}
              label="FIXTURE PAGE"
            />
          )}

          <div className="space-y-2.5">
            {pagedFixtures.map((m) => (
              <div
                key={m.id}
                className={`border rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 ${
                  m.isPlayed ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-2 font-arcade">
                  <span className="text-xs font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shrink-0">
                    {m.stageName}
                  </span>
                  {m.windowLabel && (
                    <span className="text-xs font-mono text-slate-400 hidden sm:inline">{m.windowLabel}</span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2.5 font-black text-sm w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-right min-w-0">
                    <span className="text-white uppercase truncate max-w-[110px] sm:max-w-none">{m.homeNation.name}</span>
                    <img
                      src={`https://flagcdn.com/w40/${(m.homeNation.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={m.homeNation.code}
                      className="w-5 h-3.5 object-cover rounded-sm shrink-0"
                    />
                  </div>

                  <div className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-arcade text-xs shrink-0">
                    {m.isPlayed ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                  </div>

                  <div className="flex items-center gap-1.5 text-left min-w-0">
                    <img
                      src={`https://flagcdn.com/w40/${(m.awayNation.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={m.awayNation.code}
                      className="w-5 h-3.5 object-cover rounded-sm shrink-0"
                    />
                    <span className="text-white uppercase truncate max-w-[110px] sm:max-w-none">{m.awayNation.name}</span>
                  </div>
                </div>

                <div className="shrink-0 font-arcade">
                  {m.isPlayed && m.playerStats ? (
                    <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-sky-300">
                      <span>⚽ {m.playerStats.goals}g</span>
                      <span>👟 {m.playerStats.assists}a</span>
                      <span className="text-amber-400">⭐ {m.playerStats.matchRating}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-black uppercase text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-400/40">
                      UPCOMING
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KNOCKOUT STAGE */}
      {activeTab === 'knockout' && hubState.isKnockoutStageActive && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider font-arcade">
              Tournament Knockout Bracket
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-arcade">
              {hubState.knockoutStages.map((stg, sIdx) => {
                const isPassed = sIdx < hubState.currentKnockoutStageIndex;
                const isCurrent = sIdx === hubState.currentKnockoutStageIndex;
                return (
                  <div
                    key={stg}
                    className={`p-3.5 rounded-xl border text-center space-y-1.5 ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400/60 shadow-lg'
                        : isPassed
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <span className="text-xs font-black uppercase text-slate-300 block">{stg}</span>
                    <div className="text-sm font-black text-white uppercase">
                      {isPassed ? 'CLEARED ✅' : isCurrent ? 'ACTIVE 🔥' : 'TBD'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CAMP & TACTICS */}
      {activeTab === 'squad' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-arcade block">
              Tactical Structure
            </span>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 uppercase">Head Coach:</span>
                <span className="font-bold text-white uppercase text-right">{hubState.managerName}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 uppercase">Formation &amp; Style:</span>
                <span className="font-bold text-amber-400 uppercase text-right">{hubState.managerTactic}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 uppercase">Squad Role:</span>
                <span className="font-bold text-emerald-400 uppercase text-right">{hubState.playerRole}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-sky-400 font-arcade block">
              National Honors Record
            </span>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 uppercase">Senior Lock:</span>
                <span className="font-bold text-white uppercase text-right">
                  {player.isSeniorLocked
                    ? `Locked to ${player.seniorNation || hubState.callingNation.name}`
                    : 'Open Eligibility'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 uppercase">Total Int. Caps:</span>
                <span className="font-mono font-bold text-white">
                  {(player.internationalCaps || 0) + hubState.capsGained}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 uppercase">Total Int. Goals:</span>
                <span className="font-mono font-bold text-amber-400">
                  {(player.internationalGoals || 0) + hubState.totalGoals}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
