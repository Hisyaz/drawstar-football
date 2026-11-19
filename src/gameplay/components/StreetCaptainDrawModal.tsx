import React, { useEffect, useMemo, useState } from 'react';
import { Check, Crown, MapPin, Shield, Sparkles, Trophy, Users, X } from 'lucide-react';
import { PlayerCardData } from '../../types';
import { LeagueDatabase } from '../../types/leagueEditor';
import { PlayerFacePortrait } from '../../components/PlayerFacePortrait';
import { ConsoleModalShell } from '../../components/common/ConsolePager';
import {
  drawStreetCaptainCandidates,
  resolveStreetCityId,
  resolveStreetLineBucket,
  StartingCityStreetId,
  STREET_CITY_DESCRIPTORS,
  StreetCaptainCandidateEntry,
  StreetPoolSourceStats,
} from '../../utils/streetTeamBuilder';

export interface StreetCaptainDrawResult {
  cityId: StartingCityStreetId;
  homeCaptain?: PlayerCardData;
  awayCaptain?: PlayerCardData;
}

interface StreetCaptainDrawModalProps {
  isOpen: boolean;
  initialCityId?: string;
  leagueDb?: LeagueDatabase | null;
  sequenceSides: Array<'home' | 'away'>;
  onComplete: (result: StreetCaptainDrawResult) => void;
  onCancel: () => void;
}

type RevealStage = 'shuffling' | 'revealing_1' | 'revealing_2' | 'revealing_3' | 'ready';

const CITY_LIST = Object.values(STREET_CITY_DESCRIPTORS);

function getOriginBadge(entry: StreetCaptainCandidateEntry): { label: string; style: string } {
  if (entry.origin === 'youth') {
    return {
      label: 'YOUTH U16',
      style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    };
  }
  const tier = entry.origin === 'd1' ? 'DIV 1' : 'DIV 2';
  const sub =
    entry.squadGroup && entry.squadGroup !== 'squad'
      ? ` · ${entry.squadGroup.toUpperCase()}`
      : '';
  return {
    label: `${tier}${sub}`,
    style:
      entry.origin === 'd1'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  };
}

export const StreetCaptainDrawModal: React.FC<StreetCaptainDrawModalProps> = ({
  isOpen,
  initialCityId = 'buenos_aires',
  leagueDb,
  sequenceSides,
  onComplete,
  onCancel,
}) => {
  const effectiveSides: Array<'home' | 'away'> =
    sequenceSides.length > 0 ? sequenceSides : ['home'];

  const [cityId, setCityId] = useState<StartingCityStreetId>(() =>
    resolveStreetCityId(initialCityId)
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [candidates, setCandidates] = useState<StreetCaptainCandidateEntry[]>([]);
  const [poolStats, setPoolStats] = useState<StreetPoolSourceStats | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [pickedHomeCaptain, setPickedHomeCaptain] = useState<PlayerCardData | undefined>(
    undefined
  );
  const [revealStage, setRevealStage] = useState<RevealStage>('shuffling');

  const currentSide = effectiveSides[Math.min(stepIndex, effectiveSides.length - 1)] || 'home';
  const activeCity = STREET_CITY_DESCRIPTORS[cityId];

  // Reset entire session whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    setCityId(resolveStreetCityId(initialCityId));
    setStepIndex(0);
    setPickedHomeCaptain(undefined);
    setSelectedCandidateId(null);
  }, [isOpen, initialCityId]);

  // Draw 3 Top-15 candidates for the active side & kick off reveal choreography
  useEffect(() => {
    if (!isOpen) return;
    const excludeIds =
      currentSide === 'away' && pickedHomeCaptain ? [pickedHomeCaptain.id] : [];
    const draw = drawStreetCaptainCandidates(cityId, leagueDb, {
      count: 3,
      excludeIds,
    });
    setCandidates(draw.candidates);
    setPoolStats(draw.stats);
    setSelectedCandidateId(draw.candidates[0]?.player.id || null);
    setRevealStage('shuffling');

    const t1 = setTimeout(() => setRevealStage('revealing_1'), 160);
    const t2 = setTimeout(() => setRevealStage('revealing_2'), 320);
    const t3 = setTimeout(() => setRevealStage('revealing_3'), 480);
    const t4 = setTimeout(() => setRevealStage('ready'), 620);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, cityId, stepIndex, currentSide, leagueDb]);

  const selectedEntry = useMemo(
    () =>
      candidates.find((c) => c.player.id === selectedCandidateId) || candidates[0] || null,
    [candidates, selectedCandidateId]
  );

  if (!isOpen) return null;

  const isRevealedCard = (cardIdx: number): boolean => {
    if (revealStage === 'ready') return true;
    if (revealStage === 'revealing_3') return cardIdx <= 2;
    if (revealStage === 'revealing_2') return cardIdx <= 1;
    if (revealStage === 'revealing_1') return cardIdx <= 0;
    return false;
  };

  const handleConfirmCaptain = () => {
    const chosen = selectedEntry?.player;
    if (!chosen) return;

    if (currentSide === 'home' && effectiveSides.includes('away')) {
      setPickedHomeCaptain(chosen);
      setStepIndex(1);
      return;
    }

    if (currentSide === 'home') {
      onComplete({
        cityId,
        homeCaptain: chosen,
        awayCaptain: undefined,
      });
    } else {
      onComplete({
        cityId,
        homeCaptain: pickedHomeCaptain,
        awayCaptain: chosen,
      });
    }
  };

  const selectedLineBucket = selectedEntry
    ? resolveStreetLineBucket(selectedEntry.player)
    : 'MID';

  const quotaPreviewText =
    selectedLineBucket === 'GK'
      ? 'Remaining 6 draws: 0 GK · 2 DEF · 2 MID · 2 ATT (Captain covers GK)'
      : selectedLineBucket === 'DEF'
      ? 'Remaining 6 draws: 1 GK · 1 DEF · 2 MID · 2 ATT'
      : selectedLineBucket === 'MID'
      ? 'Remaining 6 draws: 1 GK · 2 DEF · 1 MID · 2 ATT'
      : 'Remaining 6 draws: 1 GK · 2 DEF · 2 MID · 1 ATT';

  return (
    <ConsoleModalShell
      id="street-captain-draw-modal"
      isOpen={isOpen}
      onClose={onCancel}
      title="STREET 7v7 CAPTAIN DRAW"
      subtitle={`${
        currentSide === 'home' ? 'HOME CAPTAIN (WHITE / BRIGHT GEAR)' : 'AWAY CAPTAIN (DARK GEAR)'
      } · ${activeCity.cityName.toUpperCase()} TOP-15 POOL`}
      icon={<Crown className="w-5 h-5 text-amber-400" />}
      accentColor={currentSide === 'home' ? 'amber' : 'rose'}
      maxWidthClass="sm:max-w-4xl"
      headerRight={
        <div className="flex items-center gap-2 shrink-0">
          {revealStage !== 'ready' && (
            <button
              type="button"
              onClick={() => setRevealStage('ready')}
              className="min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 uppercase cursor-pointer transition-colors"
            >
              SKIP REVEAL
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel street captain draw"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      }
      bodyClassName="flex flex-col gap-3 p-3 sm:p-4 overflow-y-auto"
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs text-slate-300 flex items-center gap-2 min-w-0">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{quotaPreviewText}</span>
          </div>
          <button
            type="button"
            onClick={handleConfirmCaptain}
            disabled={!selectedEntry || revealStage === 'shuffling'}
            className={`w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg disabled:opacity-50 ${
              currentSide === 'home'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950'
                : 'bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {currentSide === 'home' && effectiveSides.includes('away')
                ? `LOCK ${selectedEntry?.player.name.split(' ').pop()?.toUpperCase() || 'CAPTAIN'} -> AWAY DRAW`
                : `DRAFT ${selectedEntry?.player.name.toUpperCase() || 'CAPTAIN'} & AUTO-FILL 6`}
            </span>
          </button>
        </div>
      }
    >
      {/* Side & Streetwear Color Contrast Banner + City Switcher (on Step 0 before Home locked) */}
      <div className="flex flex-col gap-2.5">
        <div
          className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            currentSide === 'home'
              ? 'bg-sky-950/50 border-sky-400/50'
              : 'bg-purple-950/50 border-purple-500/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                currentSide === 'home'
                  ? 'bg-slate-100 border-sky-300 text-slate-950'
                  : 'bg-zinc-950 border-purple-400 text-purple-200'
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-arcade text-xs sm:text-sm text-white uppercase tracking-wide flex items-center gap-2">
                <span>
                  {currentSide === 'home'
                    ? 'HOME SIDE DRAFT · SELECT 1 OF 3 TOP-15 STARS'
                    : 'AWAY SIDE DRAFT · SELECT 1 OF 3 TOP-15 STARS'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                {currentSide === 'home'
                  ? 'Home squad wears random Light Streetwear (White, Sky Blue, Light Yellow, Pastel Pink).'
                  : 'Away squad wears random Dark Streetwear (Black, Dark Purple, Charcoal, Brown).'}
              </p>
            </div>
          </div>

          {poolStats && (
            <div className="text-[11px] font-mono text-slate-300 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 shrink-0 tabular-nums">
              Pool: {poolStats.totalPoolSize} ({poolStats.youthCount} YTH · {poolStats.d1Count} D1 ·{' '}
              {poolStats.d2Count} D2)
            </div>
          )}
        </div>

        {/* City Picker (locked once Home captain is already picked for two-player sequential draw) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> City:
          </span>
          {CITY_LIST.map((c) => {
            const active = c.cityId === cityId;
            const locked = stepIndex > 0;
            return (
              <button
                key={c.cityId}
                type="button"
                disabled={locked}
                onClick={() => setCityId(c.cityId)}
                className={`min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border transition-all ${
                  active
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600'
                } ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {c.cityName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Card Top-15 Captain Cinematic Stage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {candidates.map((entry, idx) => {
          const revealed = isRevealedCard(idx);
          const isSelected = selectedEntry?.player.id === entry.player.id;
          const bucket = resolveStreetLineBucket(entry.player);
          const origin = getOriginBadge(entry);
          const ovr = entry.player.ovr || entry.player.overallRating || 72;
          const s = entry.player.stats;

          return (
            <button
              key={entry.player.id}
              type="button"
              onClick={() => {
                if (!revealed) setRevealStage('ready');
                setSelectedCandidateId(entry.player.id);
              }}
              aria-label={`Select captain candidate ${entry.player.name}, ${bucket}, OVR ${ovr}`}
              className={`relative text-left rounded-2xl border-2 p-3 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[290px] ${
                !revealed
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700 scale-[0.97]'
                  : isSelected
                  ? currentSide === 'home'
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.28)] -translate-y-1'
                    : 'bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/45 border-purple-400 shadow-[0_0_24px_rgba(192,132,252,0.28)] -translate-y-1'
                  : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500'
              }`}
            >
              {!revealed ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-amber-400/40 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                  <div className="font-arcade text-xs text-amber-300 uppercase tracking-widest">
                    TOP 15 CARD #{idx + 1}
                  </div>
                  <div className="text-[11px] text-slate-400">Drawing from {activeCity.cityName}...</div>
                </div>
              ) : (
                <>
                  {/* Card Header: OVR + City Rank + Line Role */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-arcade font-black text-base flex items-center justify-center shadow tabular-nums">
                        {ovr}
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1 tabular-nums">
                          <Trophy className="w-3 h-3" /> RANK #{entry.cityRank}
                        </div>
                        <div className="text-[11px] font-bold text-slate-300">
                          {entry.player.subPosition || bucket} ({bucket})
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="px-2 py-1 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                        PICKED
                      </span>
                    )}
                  </div>

                  {/* Portrait + Club Info */}
                  <div className="my-2 flex flex-col items-center">
                    <div className="rounded-xl bg-slate-950/75 border border-slate-800 p-1.5">
                      <PlayerFacePortrait player={entry.player} size={96} hideTeam />
                    </div>
                    <div className="mt-2 text-center w-full">
                      <div className="font-black text-sm text-white truncate">
                        {entry.player.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {entry.clubName}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`${origin.style} inline-block px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider leading-tight`}
                        >
                          {origin.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 6-Stat Mini Matrix */}
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800/90 text-[10px] font-mono tabular-nums">
                    <div className="flex justify-between px-1.5 py-0.5 rounded bg-slate-950/70">
                      <span className="text-slate-400">PRO</span>
                      <span className="text-white font-bold">{s?.pro ?? ovr}</span>
                    </div>
                    <div className="flex justify-between px-1.5 py-0.5 rounded bg-slate-950/70">
                      <span className="text-slate-400">DEF</span>
                      <span className="text-white font-bold">{s?.def ?? ovr}</span>
                    </div>
                    <div className="flex justify-between px-1.5 py-0.5 rounded bg-slate-950/70">
                      <span className="text-slate-400">CRE</span>
                      <span className="text-white font-bold">{s?.cre ?? ovr}</span>
                    </div>
                    <div className="flex justify-between px-1.5 py-0.5 rounded bg-slate-950/70">
                      <span className="text-slate-400">MEN</span>
                      <span className="text-white font-bold">{s?.men ?? ovr}</span>
                    </div>
                    <div className="flex justify-between px-1.5 py-0.5 rounded bg-slate-950/70">
                      <span className="text-slate-400">GOA</span>
                      <span className="text-white font-bold">{s?.goa ?? ovr}</span>
                    </div>
                    <div className="flex justify-between px-1.5 py-0.5 rounded bg-slate-950/70">
                      <span className="text-slate-400">PHY</span>
                      <span className="text-white font-bold">{s?.phy ?? ovr}</span>
                    </div>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </ConsoleModalShell>
  );
};
