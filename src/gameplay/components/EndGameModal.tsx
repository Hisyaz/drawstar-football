/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Users,
  BarChart3,
  Star,
  Settings,
  Home,
  Clock,
  Shield,
  Trophy,
  Flame,
  ArrowRight,
  Target,
} from 'lucide-react';
import { MatchStats, PlayerRatingRecord, MatchMvpResult, MatchGoalRecord, PenaltyShootoutState, FootballMatchMode } from '../types';
import { PlayerRatingsEngine } from '../game/playerRatings';
import { audio } from '../game/audio';
import { ConsoleModalShell, ConsolePaginationBar } from '../../components/common/ConsolePager';

export interface EndGameModalProps {
  isOpen: boolean;
  homeScore: number;
  awayScore: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamBadge?: string;
  awayTeamBadge?: string;
  homeKitColor?: string;
  awayKitColor?: string;
  stats: MatchStats;
  playerRatings?: PlayerRatingRecord[];
  matchMvp?: MatchMvpResult | null;
  goalEvents?: MatchGoalRecord[];
  penaltyShootout?: PenaltyShootoutState | null;
  isDraw: boolean;
  isExtraTimeAvailable?: boolean;
  matchPeriod?: string;
  onRematch: () => void;
  onTeamSelection: () => void;
  onOpenSettings: () => void;
  onMainMenu?: () => void;
  onStartExtraTime?: () => void;
  onStartPenalties?: () => void;
  careerReturnLabel?: string;
  onCareerReturn?: () => void;
  matchMode?: FootballMatchMode;
  userRating?: number | null;
  userInjured?: boolean;
  isKickOff?: boolean;
}

const RATINGS_PER_PAGE = 6;

export const EndGameModal: React.FC<EndGameModalProps> = ({
  isOpen,
  homeScore,
  awayScore,
  homeTeamName,
  awayTeamName,
  homeTeamBadge = '🛡️',
  awayTeamBadge = '⚔️',
  homeKitColor = '#0055b8',
  awayKitColor = '#991b1b',
  stats,
  playerRatings = [],
  matchMvp = null,
  goalEvents = [],
  penaltyShootout = null,
  isDraw,
  isExtraTimeAvailable = true,
  matchPeriod = '90:00',
  onRematch,
  onTeamSelection,
  onOpenSettings,
  onMainMenu,
  onStartExtraTime,
  onStartPenalties,
  careerReturnLabel,
  onCareerReturn,
  matchMode = 'pro',
  userRating = null,
  userInjured = false,
  isKickOff = false,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'stats' | 'ratings'>('main');
  const [ratingTeamTab, setRatingTeamTab] = useState<'home' | 'away'>('home');
  const [ratingsPage, setRatingsPage] = useState(1);

  if (!isOpen) return null;

  const hasShootoutWinner =
    Boolean(penaltyShootout?.isActive) &&
    penaltyShootout!.homeScore !== penaltyShootout!.awayScore;
  const userWon =
    homeScore > awayScore ||
    (homeScore === awayScore && hasShootoutWinner && penaltyShootout!.homeScore > penaltyShootout!.awayScore);
  const userLost =
    homeScore < awayScore ||
    (homeScore === awayScore && hasShootoutWinner && penaltyShootout!.homeScore < penaltyShootout!.awayScore);

  const totalPossession = (stats.home.possessionFrames || 0) + (stats.away.possessionFrames || 0);
  const homePossPct =
    totalPossession > 0 ? Math.round((stats.home.possessionFrames / totalPossession) * 100) : 50;
  const awayPossPct = 100 - homePossPct;

  const statItems = [
    {
      label: 'POSSESSION',
      home: `${homePossPct}%`,
      away: `${awayPossPct}%`,
      homeVal: homePossPct,
      awayVal: awayPossPct,
    },
    {
      label: 'TOTAL SHOTS',
      home: stats.home.shots,
      away: stats.away.shots,
      homeVal: stats.home.shots,
      awayVal: stats.away.shots,
    },
    {
      label: 'ON TARGET',
      home: stats.home.shotsOnTarget,
      away: stats.away.shotsOnTarget,
      homeVal: stats.home.shotsOnTarget,
      awayVal: stats.away.shotsOnTarget,
    },
    {
      label: 'PASSES',
      home: stats.home.passesCompleted,
      away: stats.away.passesCompleted,
      homeVal: stats.home.passesCompleted,
      awayVal: stats.away.passesCompleted,
    },
    {
      label: 'CORNERS',
      home: stats.home.corners,
      away: stats.away.corners,
      homeVal: stats.home.corners,
      awayVal: stats.away.corners,
    },
    {
      label: 'FOULS',
      home: stats.home.fouls,
      away: stats.away.fouls,
      homeVal: stats.home.fouls,
      awayVal: stats.away.fouls,
    },
    {
      label: 'CARDS (Y/R)',
      home: `${stats.home.yellowCards}/${stats.home.redCards}`,
      away: `${stats.away.yellowCards}/${stats.away.redCards}`,
      homeVal: stats.home.yellowCards + stats.home.redCards * 2,
      awayVal: stats.away.yellowCards + stats.away.redCards * 2,
    },
  ];

  const teamRatings = playerRatings.filter((r) => r.team === ratingTeamTab);
  const totalRatingPages = Math.max(1, Math.ceil(teamRatings.length / RATINGS_PER_PAGE));
  const safeRatingsPage = Math.min(ratingsPage, totalRatingPages);
  const pagedRatings = teamRatings.slice(
    (safeRatingsPage - 1) * RATINGS_PER_PAGE,
    safeRatingsPage * RATINGS_PER_PAGE
  );

  const assistSummary = playerRatings.filter((r) => r.assists > 0);

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      showCloseButton={false}
      title={userWon ? 'VICTORY!' : userLost ? 'FULL TIME' : 'FULL TIME DRAW'}
      subtitle={`${homeTeamName} ${homeScore} - ${awayScore} ${awayTeamName}${
        penaltyShootout?.isActive ? ` (PEN ${penaltyShootout.homeScore}-${penaltyShootout.awayScore})` : ''
      } · ${matchPeriod}`}
      icon={
        userWon ? (
          <Trophy className="w-5 h-5 text-amber-400" />
        ) : userLost ? (
          <Shield className="w-5 h-5 text-rose-400" />
        ) : (
          <Flame className="w-5 h-5 text-amber-400" />
        )
      }
      accentColor="amber"
      maxWidthClass="sm:max-w-2xl"
      tabs={[
        { id: 'main', label: 'SUMMARY', icon: <Trophy className="w-4 h-4 shrink-0" /> },
        { id: 'stats', label: 'STATS', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
        { id: 'ratings', label: 'RATINGS', icon: <Star className="w-4 h-4 shrink-0" /> },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => {
        audio.playKick(0.2);
        setActiveTab(id as 'main' | 'stats' | 'ratings');
      }}
      bodyClassName="p-3.5 sm:p-5 space-y-4 bg-slate-900/95"
      footer={
        onCareerReturn ? (
          <button
            type="button"
            onClick={() => {
              audio.playKick(0.35);
              onCareerReturn();
            }}
            className="w-full min-h-[52px] py-3 px-5 rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-400 via-lime-400 to-amber-300 hover:from-emerald-300 hover:via-lime-300 hover:to-amber-200 text-slate-950 font-arcade text-xs sm:text-sm font-black shadow-[0_0_24px_rgba(52,211,153,0.45)] transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{careerReturnLabel || 'CONTINUE'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => {
                audio.playKick(0.3);
                onRematch();
              }}
              className="min-h-[48px] py-2.5 px-3 rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 text-slate-950 font-arcade text-xs font-black shadow-[0_0_18px_rgba(52,211,153,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>RESTART</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playKick(0.3);
                onTeamSelection();
              }}
              className="min-h-[48px] py-2.5 px-3 rounded-xl border-2 border-sky-200 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 hover:from-sky-300 hover:to-blue-300 text-slate-950 font-arcade text-xs font-black shadow-[0_0_18px_rgba(56,189,248,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 stroke-[2.5]" />
              <span>SELECT NEW TEAMS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playKick(0.3);
                if (onMainMenu) onMainMenu();
              }}
              className="min-h-[48px] py-2.5 px-3 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-950 font-arcade text-xs font-black shadow-[0_0_18px_rgba(251,191,36,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 stroke-[2.5]" />
              <span>RETURN TO MAIN MENU</span>
            </button>
          </div>
        )
      }
    >
      {/* SCOREBOARD HERO CARD */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 text-center min-w-0">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-xl border border-sky-400/60 flex items-center justify-center text-2xl shadow-lg mb-1"
              style={{ backgroundColor: `${homeKitColor}33` }}
            >
              {homeTeamBadge}
            </div>
            <div className="font-arcade text-xs text-white truncate font-bold">{homeTeamName}</div>
            <div className="text-[11px] font-mono text-sky-400 font-bold uppercase mt-0.5">HOME</div>
          </div>

          <div className="shrink-0 flex flex-col items-center px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl shadow-inner min-w-[96px]">
            <div className="font-arcade text-2xl sm:text-3xl text-amber-400 tracking-tight tabular-nums">
              {homeScore} - {awayScore}
            </div>
            {penaltyShootout?.isActive && (
              <div className="text-[11px] font-arcade text-emerald-300 mt-0.5 tabular-nums">
                PEN {penaltyShootout.homeScore} - {penaltyShootout.awayScore}
              </div>
            )}
            <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase font-bold">
              {matchPeriod}
            </div>
          </div>

          <div className="flex-1 text-center min-w-0">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-xl border border-rose-400/60 flex items-center justify-center text-2xl shadow-lg mb-1"
              style={{ backgroundColor: `${awayKitColor}33` }}
            >
              {awayTeamBadge}
            </div>
            <div className="font-arcade text-xs text-white truncate font-bold">{awayTeamName}</div>
            <div className="text-[11px] font-mono text-rose-400 font-bold uppercase mt-0.5">AWAY</div>
          </div>
        </div>
      </div>

      {activeTab === 'main' && (
        <div className="space-y-3">
          {/* STREET 7v7 SUMMARY / PLAYER RATING (Kick Off shows Match Rating & MVP only — ZERO Dev Points) */}
          {matchMode === 'street' && (
            <div className="p-3 rounded-xl border border-lime-400/60 bg-gradient-to-r from-lime-950/60 via-slate-900 to-cyan-950/50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-arcade text-[10px] text-lime-300 uppercase">
                  STREET 7v7 · 1-2-2-2 URBAN MATCH
                </div>
                <div className="text-xs font-mono text-slate-300 mt-0.5">
                  {isKickOff
                    ? 'Exhibition Street Football · Match Rating & MVP Recorded'
                    : userInjured
                    ? 'Injury Termination — Rating Frozen (0 Dev Points)'
                    : 'Street Performance Complete'}
                </div>
              </div>
              {userRating !== null && (
                <div className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-950 border border-lime-400/70 text-center">
                  <div className="text-[9px] font-mono text-slate-400 uppercase">YOUR RATING</div>
                  <div className={`font-arcade text-sm font-black tabular-nums ${userInjured ? 'text-rose-400' : 'text-lime-300'}`}>
                    {userRating.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MATCH MVP HIGHLIGHT IN SUMMARY */}
          {matchMvp && (
            <div className="p-3 rounded-xl border-2 border-yellow-400/80 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/15 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-yellow-400/30 border border-yellow-400 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-yellow-300" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-[11px] font-mono text-yellow-300 font-bold uppercase truncate">
                    MATCH MVP · {matchMvp.isHome ? homeTeamName : awayTeamName}
                  </div>
                  <div className="font-arcade text-xs text-white font-bold truncate">
                    #{matchMvp.player.number} {matchMvp.player.name.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-yellow-400 border border-yellow-200 text-slate-950 font-arcade text-xs font-black flex items-center gap-1 shrink-0 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>{matchMvp.player.rating.toFixed(1)}</span>
              </div>
            </div>
          )}

          {/* GOALSCORERS & ASSISTS LOG */}
          {goalEvents.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-arcade text-emerald-300 uppercase">
                <span>⚽ GOALSCORERS &amp; ASSISTS</span>
                <span className="text-slate-400 font-mono">{goalEvents.length} GOAL{goalEvents.length > 1 ? 'S' : ''}</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {goalEvents.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-arcade text-[10px] text-amber-400 shrink-0 tabular-nums">
                        {g.minute}&apos;
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          g.team === 'home'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                        }`}
                      >
                        {g.team === 'home' ? 'HOME' : 'AWAY'}
                      </span>
                      <span className="font-bold text-white truncate">
                        ⚽ {g.scorerName}
                        {g.isOwnGoal ? ' (OG)' : g.isPenalty ? ' (PEN)' : ''}
                      </span>
                    </div>
                    {g.assistName && !g.isOwnGoal && (
                      <span className="text-[11px] text-sky-300 font-mono shrink-0 flex items-center gap-1">
                        <Target className="w-3 h-3 text-sky-400" />
                        <span>{g.assistName}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {goalEvents.length === 0 && assistSummary.length > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex flex-wrap gap-2">
              {assistSummary.map((a) => (
                <span key={a.playerId} className="px-2 py-1 rounded bg-slate-900 border border-slate-700">
                  🎯 {a.name} ({a.assists})
                </span>
              ))}
            </div>
          )}

          {/* DRAW RESOLUTION */}
          {isDraw && isExtraTimeAvailable && !penaltyShootout?.isActive && (
            <div className="p-3.5 rounded-xl border border-amber-500/60 bg-amber-500/10">
              <div className="text-xs font-arcade text-amber-300 text-center mb-2.5 tracking-wider">
                DRAW RESOLUTION
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    audio.playKick(0.3);
                    if (onStartExtraTime) onStartExtraTime();
                  }}
                  className="min-h-[48px] py-2.5 px-3 rounded-lg border border-amber-400 bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 font-arcade text-xs font-bold shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>EXTRA TIME</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audio.playKick(0.3);
                    if (onStartPenalties) onStartPenalties();
                  }}
                  className="min-h-[48px] py-2.5 px-3 rounded-lg border border-yellow-400 bg-yellow-500/25 hover:bg-yellow-500/40 text-yellow-100 font-arcade text-xs font-bold shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span>PENALTIES</span>
                </button>
              </div>
            </div>
          )}

          {/* QUICK NAVIGATION GRID */}
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={() => {
                audio.playKick(0.3);
                onOpenSettings();
              }}
              className="min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 font-arcade text-xs font-bold shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              <span>SYSTEM SETTINGS</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-2.5">
          {statItems.map((st, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-xs font-bold tabular-nums">
                <span className="text-sky-400">{st.home}</span>
                <span className="text-slate-300 font-arcade text-[11px]">{st.label}</span>
                <span className="text-rose-400">{st.away}</span>
              </div>
              <div className="flex h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-300"
                  style={{ width: `${(st.homeVal / (st.homeVal + st.awayVal || 1)) * 100}%` }}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${(st.awayVal / (st.homeVal + st.awayVal || 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="space-y-3">
          {matchMvp && (
            <div className="p-3 rounded-xl border-2 border-yellow-400/90 bg-gradient-to-r from-yellow-500/20 via-amber-500/25 to-yellow-500/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-yellow-400/30 border border-yellow-400 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-yellow-300" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-[11px] font-mono text-yellow-300 font-bold uppercase truncate">
                    MATCH MVP · {matchMvp.isHome ? homeTeamName : awayTeamName}
                  </div>
                  <div className="font-arcade text-xs text-white font-bold truncate">
                    #{matchMvp.player.number} {matchMvp.player.name.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-yellow-400 border border-yellow-300 text-slate-950 font-arcade text-xs font-black flex items-center gap-1 shrink-0 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>{matchMvp.player.rating.toFixed(1)}</span>
              </div>
            </div>
          )}

          {/* TEAM TOGGLE TABS */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                audio.playKick(0.2);
                setRatingTeamTab('home');
                setRatingsPage(1);
              }}
              className={`min-h-[44px] py-2 px-3 rounded-xl border font-arcade text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                ratingTeamTab === 'home'
                  ? 'bg-sky-950/90 border-sky-400 text-sky-300 shadow'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{homeTeamBadge}</span>
              <span className="truncate">{homeTeamName.toUpperCase()}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playKick(0.2);
                setRatingTeamTab('away');
                setRatingsPage(1);
              }}
              className={`min-h-[44px] py-2 px-3 rounded-xl border font-arcade text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                ratingTeamTab === 'away'
                  ? 'bg-rose-950/90 border-rose-400 text-rose-300 shadow'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{awayTeamBadge}</span>
              <span className="truncate">{awayTeamName.toUpperCase()}</span>
            </button>
          </div>

          {/* PAGINATED SQUAD RATINGS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pagedRatings.map((pRec) => {
              const badgeClasses = PlayerRatingsEngine.getRatingBadgeClasses(pRec.rating);
              const isPlayerMvp = matchMvp?.player.playerId === pRec.playerId;

              return (
                <div
                  key={pRec.playerId}
                  className={`min-h-[48px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-xs font-mono ${
                    isPlayerMvp
                      ? 'bg-yellow-950/40 border-yellow-400/80'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-arcade text-xs text-amber-400 font-bold shrink-0 tabular-nums">
                      #{pRec.number}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-arcade text-xs text-white truncate">
                          {pRec.name}
                        </span>
                        {isPlayerMvp && (
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span
                          className={`font-bold ${
                            pRec.primaryPos === 'ATT'
                              ? 'text-rose-400'
                              : pRec.primaryPos === 'MID'
                              ? 'text-emerald-400'
                              : pRec.primaryPos === 'DEF'
                              ? 'text-sky-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {pRec.primaryPos || pRec.role}
                        </span>
                        {pRec.isSubbedOut && (
                          <span className="text-amber-400 font-bold">SUB {pRec.subbedMinute}'</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-slate-300 tabular-nums">
                      {pRec.goals > 0 && <span className="text-white font-bold">⚽{pRec.goals}</span>}
                      {pRec.assists > 0 && <span className="text-sky-400 font-bold">🎯{pRec.assists}</span>}
                      {pRec.saves > 0 && <span className="text-emerald-400 font-bold">🧤{pRec.saves}</span>}
                    </div>

                    <div
                      className={`px-2 py-1 rounded-lg border font-arcade text-xs font-black min-w-[38px] text-center tabular-nums ${badgeClasses.badgeBg} ${badgeClasses.border} ${badgeClasses.text}`}
                    >
                      {pRec.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalRatingPages > 1 && (
            <ConsolePaginationBar
              currentPage={safeRatingsPage}
              totalPages={totalRatingPages}
              onPageChange={setRatingsPage}
              totalItems={teamRatings.length}
              pageSize={RATINGS_PER_PAGE}
              label="SQUAD PAGE"
            />
          )}
        </div>
      )}
    </ConsoleModalShell>
  );
};

