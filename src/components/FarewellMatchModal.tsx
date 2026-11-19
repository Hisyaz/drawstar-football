import React, { useState, useEffect } from 'react';
import { PlayerCardData } from '../types';
import { simulateFarewellMatch } from '../utils/careerConclusionSystem';
import { FarewellMatchResult } from '../types/careerConclusion';
import { audioManager } from '../utils/audioSystem';
import { Flame, Trophy, Users, CheckCircle2, RefreshCw, ArrowRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface FarewellMatchModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onCompleteFarewell: (updatedPlayer: PlayerCardData, result: FarewellMatchResult) => void;
  onClose?: () => void;
}

export const FarewellMatchModal: React.FC<FarewellMatchModalProps> = ({
  isOpen,
  player,
  onCompleteFarewell,
  onClose,
}) => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<'glory' | 'torch' | null>(null);
  const [optionPage, setOptionPage] = useState<number>(1);
  const [inheritorName, setInheritorName] = useState<string>('Mateo Silva');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [farewellResult, setFarewellResult] = useState<FarewellMatchResult | null>(null);
  const [tempPlayer, setTempPlayer] = useState<PlayerCardData | null>(null);

  useEffect(() => {
    if (isOpen) {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.enterMatchMode('domestic', 'Career Farewell Match', clubCountry);
    }
    return () => {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.exitMatchMode(clubCountry);
    };
  }, [isOpen, player]);

  if (!isOpen) return null;

  const handleSimulateChoice = (choice: 'glory' | 'torch') => {
    setSimulating(true);
    setSelectedOption(choice);

    setTimeout(() => {
      const { updatedPlayer, result } = simulateFarewellMatch(player, choice, inheritorName);
      setFarewellResult(result);
      setTempPlayer(updatedPlayer);
      setSimulating(false);
    }, 1100);
  };

  const handleFinishAndProceed = () => {
    if (tempPlayer && farewellResult) {
      onCompleteFarewell(tempPlayer, farewellResult);
    }
  };

  return (
    <div
      id="drawstar-farewell-match-screen"
      className="fixed inset-0 z-50 h-[100dvh] flex flex-col bg-slate-950 text-white select-none font-pixel overflow-hidden animate-in fade-in"
    >
      <div className="absolute inset-0 pixel-scanlines opacity-25 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,6,23,0.9)_100%)] pointer-events-none z-0" />

      <header className="relative z-10 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-900 border-b-2 border-slate-700 flex items-center justify-between gap-2 shadow-xl shrink-0 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onClose && !farewellResult && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-arcade font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">RETURN</span>
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-arcade font-bold text-amber-400 uppercase tracking-widest block truncate">
                {t('FAREWELL MATCH • FINAL APPEARANCE')}
              </span>
              <h1 className="text-xs sm:text-sm font-arcade font-black text-white uppercase tracking-tight truncate">
                {t('The Last Chapter of {name}', { name: player.name })}
              </h1>
            </div>
          </div>
        </div>

        <div className="hidden sm:block px-2.5 py-1 bg-slate-950 border border-amber-500/50 pixel-corners text-xs font-arcade text-amber-300 shrink-0">
          {player.club}
        </div>
      </header>

      <main className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 min-h-0 flex flex-col justify-start sm:justify-center overflow-y-auto overscroll-contain space-y-4">
        {/* STEP 1: CHOICE SELECTION */}
        {!farewellResult && !simulating && (
          <div className="space-y-4">
            <ConsolePagedText
              heading={t('CHOOSE YOUR FAREWELL MOMENT')}
              paragraphs={[
                t(
                  "The referee's whistle is about to blow on your legendary career with {club}. You stand at the center circle for one final iconic decision.",
                  { club: player.club || t('your club') }
                ),
              ]}
              resetKey="farewell-intro"
            />

            {/* Mobile Option Pager */}
            <div className="sm:hidden">
              <ConsolePaginationBar
                currentPage={optionPage}
                totalPages={2}
                onPageChange={setOptionPage}
                label="CHOICE"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* OPTION 1: GO FOR GLORY */}
              <div
                className={`${
                  optionPage === 1 ? 'flex' : 'hidden sm:flex'
                } p-4 sm:p-5 pixel-corners border-2 border-rose-500/60 bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/40 flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-arcade font-black px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                      OPTION 1
                    </span>
                    <span className="text-xs font-arcade font-black px-2 py-0.5 bg-rose-950 text-rose-200 border border-rose-500/50">
                      28% SUCCESS
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-arcade font-black text-base text-rose-200 uppercase">
                        GO FOR GLORY
                      </h3>
                      <div className="text-xs font-arcade font-bold text-rose-400 uppercase">
                        &ldquo;TRY THE IMPOSSIBLE&rdquo;
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 font-retro leading-relaxed">
                    Attempt an extraordinary final goal from 30 yards or an acrobatic volley. Low probability, but connects for an immortal fairytale farewell!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateChoice('glory')}
                  className="w-full min-h-[48px] py-3 px-4 bg-rose-500 hover:bg-rose-400 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>ATTEMPT FINAL GOAL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* OPTION 2: PASS THE TORCH */}
              <div
                onClick={() => setSelectedOption('torch')}
                className={`${
                  optionPage === 2 ? 'flex' : 'hidden sm:flex'
                } p-4 sm:p-5 pixel-corners border-2 ${
                  selectedOption === 'torch'
                    ? 'border-emerald-400 bg-emerald-950/40'
                    : 'border-emerald-500/60 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40'
                } transition-all cursor-pointer flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-arcade font-black px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                      OPTION 2
                    </span>
                    <span className="text-xs font-arcade font-black px-2 py-0.5 bg-emerald-950 text-emerald-200 border border-emerald-500/50">
                      98% SUCCESS
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-arcade font-black text-base text-emerald-200 uppercase">
                        PASS THE TORCH
                      </h3>
                      <div className="text-xs font-arcade font-bold text-emerald-400 uppercase">
                        &ldquo;EMPOWER THE NEXT GEN&rdquo;
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 font-retro leading-relaxed">
                    Safely assist a promising young academy graduate who becomes your designated club heir. An unselfish act of legendary leadership.
                  </p>

                  <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                    <label className="text-xs font-arcade font-black uppercase text-emerald-300 block">
                      Young Inheritor Name:
                    </label>
                    <input
                      type="text"
                      value={inheritorName}
                      onChange={(e) => setInheritorName(e.target.value)}
                      placeholder="e.g. Mateo Silva"
                      className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-950 border border-emerald-500/60 text-white focus:outline-none font-arcade rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulateChoice('torch');
                  }}
                  className="w-full min-h-[48px] py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>PASS THE TORCH</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SIMULATING MATCHDAY */}
        {simulating && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 animate-spin rounded-xl">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h3 className="text-base font-arcade font-black text-white uppercase">
              {t('SIMULATING FAREWELL MATCHDAY...')}
            </h3>
            <p className="text-sm text-slate-300 font-retro animate-pulse">
              {t('The stadium is on its feet • Final whistle approaching...')}
            </p>
          </div>
        )}

        {/* STEP 3: RESULT DISPLAY */}
        {farewellResult && (
          <div className="space-y-4 max-w-2xl w-full mx-auto">
            <div className="p-4 sm:p-5 border-2 border-amber-500/80 bg-slate-900 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-arcade font-black text-sm text-amber-300 uppercase">
                    {farewellResult.choiceTitle}
                  </span>
                </div>
                <span className="text-xs font-arcade font-black px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded">
                  FINAL SCORE: {farewellResult.finalMatchScore}
                </span>
              </div>

              <ConsolePagedText
                paragraphs={[farewellResult.commentary]}
                resetKey={`farewell-res-${farewellResult.finalMatchScore}`}
              />

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400 font-arcade uppercase">Goals</div>
                  <div className="text-base sm:text-lg font-arcade font-black text-amber-300 mt-0.5">
                    {farewellResult.finalMatchGoals}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400 font-arcade uppercase">Assists</div>
                  <div className="text-base sm:text-lg font-arcade font-black text-emerald-300 mt-0.5">
                    {farewellResult.finalMatchAssists}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400 font-arcade uppercase">Rating</div>
                  <div className="text-base sm:text-lg font-arcade font-black text-cyan-300 mt-0.5">
                    {farewellResult.finalMatchRating}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishAndProceed}
              className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t('PROCEED TO CAREER SUMMARY & RETROSPECTIVE')}</span>
              <ArrowRight className="w-5 h-5 stroke-[3] shrink-0" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

