import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Flame, Users, ArrowRight, CheckCircle2, Activity } from 'lucide-react';
import { PlayerConfig } from '../types';
import {
  simulatePreseasonFriendlyTournament,
  getClubPreseasonTrophyConfig,
  PreseasonTournamentResult,
} from '../utils/preseasonFriendlyEngine';
import { awardTrophiesToPlayer } from '../utils/trophySystem';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface PreseasonFriendlyCupModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerConfig;
  seasonYear: number | string;
  onUpdatePlayer: (updated: PlayerConfig) => void;
  onCompletedTournament?: (result: PreseasonTournamentResult) => void;
}

export const PreseasonFriendlyCupModal: React.FC<PreseasonFriendlyCupModalProps> = ({
  isOpen,
  onClose,
  player,
  seasonYear,
  onUpdatePlayer,
  onCompletedTournament,
}) => {
  const [tournamentResult, setTournamentResult] = useState<PreseasonTournamentResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [matchPage, setMatchPage] = useState(1);

  const playerRef = useRef(player);
  const seasonYearRef = useRef(seasonYear);
  const onUpdatePlayerRef = useRef(onUpdatePlayer);
  const onCompletedRef = useRef(onCompletedTournament);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    playerRef.current = player;
    seasonYearRef.current = seasonYear;
    onUpdatePlayerRef.current = onUpdatePlayer;
    onCompletedRef.current = onCompletedTournament;
  }, [player, seasonYear, onUpdatePlayer, onCompletedTournament]);

  useEffect(() => {
    if (isOpen) {
      setTournamentResult(null);
      setCurrentStep('intro');
      setMatchPage(1);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [isOpen, seasonYear]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const trophyConfig = getClubPreseasonTrophyConfig(player.club || '', player.league);

  if (!isOpen) return null;

  const handleStartTournament = () => {
    if (currentStep !== 'intro') return;
    setCurrentStep('playing');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const latestPlayer = playerRef.current;
      const result = simulatePreseasonFriendlyTournament(latestPlayer, seasonYearRef.current);
      setTournamentResult(result);
      setCurrentStep('completed');
      setMatchPage(1);

      const currentFit = latestPlayer.fitness ?? 80;
      const newFitness = Math.min(100, currentFit + result.totalFitnessGained);
      let updatedPlayer: PlayerConfig = {
        ...latestPlayer,
        fitness: newFitness,
        staminaCurrent: newFitness,
      };
      if (result.isWon && result.trophyItem) {
        updatedPlayer = awardTrophiesToPlayer(updatedPlayer, [result.trophyItem]);
      }
      onUpdatePlayerRef.current(updatedPlayer);
      onCompletedRef.current?.(result);
    }, 1200);
  };

  const activeMatch =
    tournamentResult?.matches[Math.min(matchPage - 1, (tournamentResult?.matches.length || 1) - 1)];

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={trophyConfig.trophyName}
      subtitle={`${player.club || 'Pro Club'} • Pre-Season Conditioning`}
      badge={trophyConfig.isUnique ? 'UNIQUE FRIENDLY TROPHY' : 'PRE-SEASON CUP'}
      icon={<Trophy className="w-5 h-5 text-rose-400" />}
      accentColor="rose"
      maxWidthClass="sm:max-w-xl"
      bodyClassName="p-4 sm:p-5 space-y-4 font-pixel"
      footer={
        currentStep === 'intro' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-arcade">
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 uppercase cursor-pointer"
            >
              Skip Friendly Cup
            </button>
            <button
              type="button"
              onClick={handleStartTournament}
              className="w-full min-h-[48px] px-5 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase cursor-pointer active:scale-95"
            >
              <Flame className="w-4 h-4 fill-slate-950 shrink-0" />
              <span className="truncate">Play {trophyConfig.trophyName}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        ) : currentStep === 'completed' ? (
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-arcade font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase cursor-pointer active:scale-95"
          >
            <span>Continue to Official Season</span>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          </button>
        ) : null
      }
    >
      {currentStep === 'intro' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 text-center font-arcade">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-bold">Participant</div>
              <div className="text-sm font-black text-white uppercase truncate mt-0.5">
                {player.club || 'Pro Club'}
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-bold">Conditioning</div>
              <div className="text-sm font-black text-emerald-400 uppercase mt-0.5">+20% Sharpness</div>
            </div>
          </div>

          <ConsolePagedText
            pages={[
              {
                heading: trophyConfig.trophyName,
                paragraphs: [trophyConfig.description],
              },
              {
                heading: '7-Substitutions Match Rule',
                paragraphs: [
                  "To prepare complete squad conditioning, 7 substitutions are conducted simultaneously at half-time (45'). This gives the full squad match sharpness and awards a +20% Squad Fitness boost for the upcoming campaign.",
                ],
                node: (
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-arcade pt-1">
                    <Users className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>7 simultaneous subs @ 45&apos;</span>
                  </div>
                ),
              },
            ]}
            resetKey="preseason-intro"
          />
        </div>
      )}

      {currentStep === 'playing' && (
        <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center font-arcade">
          <div className="w-16 h-16 rounded-2xl border-4 border-rose-500/30 border-t-rose-500 animate-spin flex items-center justify-center">
            <Trophy className="w-7 h-7 text-rose-400" />
          </div>
          <h4 className="text-base font-black text-white uppercase">Simulating Pre-Season Matches...</h4>
          <p className="text-sm text-slate-300 font-retro">
            Applying 7 wholesale substitutions at half-time for fitness conditioning
          </p>
        </div>
      )}

      {currentStep === 'completed' && tournamentResult && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-rose-500/50 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase font-black text-rose-400 font-arcade">
                {tournamentResult.isWon ? 'Champions 🏆' : 'Finalists'}
              </div>
              <h4 className="text-base font-black text-white uppercase">
                {tournamentResult.isWon
                  ? `${player.club || 'Your Club'} lifts the ${tournamentResult.trophyName}!`
                  : `${tournamentResult.trophyName} Completed`}
              </h4>
            </div>
            <div className="text-right shrink-0 font-arcade">
              <div className="text-[11px] text-slate-400 uppercase">Fitness Boost</div>
              <div className="text-sm font-black text-emerald-400">+{tournamentResult.totalFitnessGained}%</div>
            </div>
          </div>

          {activeMatch && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-amber-400 uppercase font-arcade flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-400 shrink-0" />
                  {activeMatch.stageTitle}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300 font-mono">
                  7 Subs @ 45&apos;
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-sm font-black">
                <span
                  className={`truncate flex-1 ${
                    activeMatch.homeTeam.isPlayerTeam ? 'text-rose-300' : 'text-white'
                  }`}
                >
                  {activeMatch.homeTeam.name}
                </span>
                <span className="font-arcade text-base bg-slate-900 px-3 py-1 rounded border border-slate-700 text-amber-300 shrink-0">
                  {activeMatch.homeScore} - {activeMatch.awayScore}
                </span>
                <span
                  className={`truncate flex-1 text-right ${
                    activeMatch.awayTeam.isPlayerTeam ? 'text-rose-300' : 'text-white'
                  }`}
                >
                  {activeMatch.awayTeam.name}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-300 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                <span>
                  {activeMatch.playerMinutes} Min • {activeMatch.playerGoals} G • {activeMatch.playerAssists} A
                </span>
                <span className="text-amber-400 font-black">Rating: {activeMatch.playerRating}</span>
              </div>

              <p className="text-sm text-emerald-300 italic font-retro leading-relaxed">
                {activeMatch.halfTimeSubsCommentary}
              </p>
            </div>
          )}

          {tournamentResult.matches.length > 1 && (
            <ConsolePaginationBar
              currentPage={matchPage}
              totalPages={tournamentResult.matches.length}
              onPageChange={setMatchPage}
              label="MATCH"
            />
          )}
        </div>
      )}
    </ConsoleModalShell>
  );
};

