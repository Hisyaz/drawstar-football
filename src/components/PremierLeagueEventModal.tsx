import React, { useState, useMemo } from 'react';
import { PlayerConfig, PlayerCardData, ManagerState, AccountingState } from '../types';
import { AgentState } from '../types';
import {
  isEnglishPlayer,
  isLondonYouthLeaguePlayer,
  calculateEffectiveFame,
  isLockedEliteClub,
} from '../utils/professionalOfferEligibility';
import { getProClubsFromDatabase, ProClubDefinition } from '../utils/earlyCareerSystem';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';

const triggerConfetti = () => {
  if (shouldDisableParticles()) return;
  try {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else if ((confetti as any)?.default && typeof (confetti as any).default === 'function') {
      (confetti as any).default({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  } catch (e) {
    // ignore
  }
};
import {
  Trophy,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Banknote,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { ConsoleModalShell } from './common/ConsolePager';

export interface PremierLeagueClubOffer {
  club: ProClubDefinition;
  weeklyWage: number;
  yearlySalary: number;
  signingBonus: number;
  contractYears: number;
  releaseClause: number;
  startingRole: string;
  roleDescription: string;
  developmentPoints: number;
  pitch: string;
}

interface PremierLeagueEventModalProps {
  isOpen: boolean;
  player: PlayerConfig | PlayerCardData;
  manager?: ManagerState | AgentState | null;
  accounting?: AccountingState;
  onCompleteTransfer: (offer: PremierLeagueClubOffer) => void;
  onClose: () => void;
}

export const PremierLeagueEventModal: React.FC<PremierLeagueEventModalProps> = ({
  isOpen,
  player,
  manager,
  accounting,
  onCompleteTransfer,
  onClose,
}) => {
  const [selectedClubIndex, setSelectedClubIndex] = useState<number>(0);
  const [stage, setStage] = useState<'selection' | 'negotiation' | 'work_permit' | 'permit_result'>('selection');
  const [workPermitApproved, setWorkPermitApproved] = useState<boolean | null>(null);

  const ovr = player.ovr || 75;
  const effectiveFame = calculateEffectiveFame(player.fame || 0, manager);
  const isEnglish = isEnglishPlayer(player);
  const isLondonYouth = isLondonYouthLeaguePlayer(player);
  const requiresWorkPermit = !isEnglish && !isLondonYouth;

  const hasAgent = Boolean(
    manager && manager.name && !manager.name.includes('Self-Managed') && !manager.name.includes('No current')
  );

  // Pool of eligible EPL clubs (Tier 1 England, excluding Big 6)
  const candidateOffers: PremierLeagueClubOffer[] = useMemo(() => {
    const allClubs = getProClubsFromDatabase();
    const eplPool = allClubs.filter(
      (c) =>
        c.countryCode === 'ENG' &&
        c.leagueTier === 1 &&
        !isLockedEliteClub(c) &&
        (c.leagueName.toLowerCase().includes('premier') || c.leagueName.toLowerCase().includes('epl') || c.leagueName.toLowerCase().includes('english league'))
    );

    // Fallback if specific search is narrow
    const fallbackClubs: Partial<ProClubDefinition>[] = [
      {
        id: 'eng_astonvilla',
        clubName: 'Aston Villa',
        clubBadgeBg: 'from-amber-700 via-sky-800 to-slate-950',
        leagueName: 'English League',
        countryName: 'England',
        countryCode: 'ENG',
        leagueTier: 1,
        prestigeStars: 4,
        managerName: 'Unai Emery',
        managerFormation: '4-2-3-1 / 4-4-2',
        managerTacticalStyle: 'Structured High-Block & Deadly Transitions',
      },
      {
        id: 'eng_newcastle',
        clubName: 'Newcastle United',
        clubBadgeBg: 'from-neutral-800 via-slate-900 to-sky-950',
        leagueName: 'English League',
        countryName: 'England',
        countryCode: 'ENG',
        leagueTier: 1,
        prestigeStars: 4,
        managerName: 'Eddie Howe',
        managerFormation: '4-3-3 Intense Press',
        managerTacticalStyle: 'High-Intensity Athletic Press & Vertical Attack',
      },
      {
        id: 'eng_brighton',
        clubName: 'Brighton & Hove Albion',
        clubBadgeBg: 'from-blue-600 via-sky-500 to-amber-400',
        leagueName: 'English League',
        countryName: 'England',
        countryCode: 'ENG',
        leagueTier: 1,
        prestigeStars: 4,
        managerName: 'Fabian Hürzeler',
        managerFormation: '4-2-3-1 Fluid',
        managerTacticalStyle: 'Positional Fluidity & Elite Scouting Pathway',
      },
      {
        id: 'eng_westham',
        clubName: 'West Ham United',
        clubBadgeBg: 'from-rose-900 via-sky-800 to-slate-950',
        leagueName: 'English League',
        countryName: 'England',
        countryCode: 'ENG',
        leagueTier: 1,
        prestigeStars: 4,
        managerName: 'Julen Lopetegui',
        managerFormation: '4-3-3 Balanced',
        managerTacticalStyle: 'Direct Wingplay & European Ambition',
      },
    ];

    const sourcePool = eplPool.length >= 3 ? eplPool : (fallbackClubs as ProClubDefinition[]);
    const shuffled = [...sourcePool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));

    return selected.map((club, idx) => {
      const baseWeekly = Math.round((45000 + (ovr - 75) * 4500 + (effectiveFame - 200) * 80) / 1000) * 1000;
      const weeklyWage = Math.max(38000, baseWeekly);
      const yearlySalary = weeklyWage * 52;
      const signingBonus = Math.round((yearlySalary * 0.35) / 50000) * 50000;
      const releaseClause = Math.round((55000000 + (ovr - 75) * 5000000) / 5000000) * 5000000;
      const startingRole = ovr >= 80 ? 'Crucial First-Team Starter' : 'Senior First-Team Regular';
      const roleDescription =
        ovr >= 80
          ? 'Guaranteed starting minutes across the English League campaign and domestic cup ties.'
          : 'Integrated directly into senior matchday squads with consistent weekly English League minutes.';

      const pitches = [
        `"Our analytical scouts have tracked your acceleration, tactical awareness, and ceiling. At ${club.clubName}, you will be developed directly under elite English League coaching."`,
        `"We play fearless, progressive football. We want you to challenge top English League defenses and spearhead our European qualification push."`,
        `"You have the physical dynamism and technical composure to excel in England. We have prepared an undisputed senior pathway for your profile."`,
      ];

      return {
        club,
        weeklyWage,
        yearlySalary,
        signingBonus,
        contractYears: 5,
        releaseClause,
        startingRole,
        roleDescription,
        developmentPoints: 210,
        pitch: pitches[idx % pitches.length],
      };
    });
  }, [ovr, effectiveFame]);

  if (!isOpen || candidateOffers.length === 0) return null;

  const currentOffer = candidateOffers[selectedClubIndex] || candidateOffers[0];

  const handleStartNegotiation = (index: number) => {
    setSelectedClubIndex(index);
    setStage('negotiation');
  };

  const handleProceedToRegistration = () => {
    if (requiresWorkPermit) {
      setStage('work_permit');
    } else {
      // Automatic domestic registration!
      triggerConfetti();
      onCompleteTransfer(currentOffer);
    }
  };

  const handleRunWorkPermitDecision = () => {
    // 80% approved, 20% rejected
    const roll = Math.random() * 100;
    const isApproved = roll < 80;
    setWorkPermitApproved(isApproved);
    setStage('permit_result');

    if (isApproved) {
      triggerConfetti();
    }
  };

  const handleFinalizeApprovedTransfer = () => {
    onCompleteTransfer(currentOffer);
  };

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="English League Wants You"
      subtitle={`${ovr} OVR • ${effectiveFame} Effective Fame`}
      badge="ENGLISH LEAGUE"
      icon={<Trophy className="w-5 h-5 text-purple-300" />}
      accentColor="purple"
      maxWidthClass="sm:max-w-3xl"
      zIndexClass="z-[100]"
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        stage === 'selection' ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleStartNegotiation(selectedClubIndex)}
              className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Enter Boardroom: {currentOffer.club.clubName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : stage === 'negotiation' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setStage('selection')}
              className="w-full min-h-[44px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded-xl border border-slate-700 cursor-pointer"
            >
              ← Review Other Clubs
            </button>
            <button
              type="button"
              onClick={handleProceedToRegistration}
              className="w-full min-h-[48px] px-5 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Accept Terms & Register</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : stage === 'work_permit' ? (
          <button
            type="button"
            onClick={handleRunWorkPermitDecision}
            className="w-full min-h-[48px] py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Submit Application to FA Appeals Panel</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : workPermitApproved ? (
          <button
            type="button"
            onClick={handleFinalizeApprovedTransfer}
            className="w-full min-h-[48px] py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl cursor-pointer active:scale-95"
          >
            Sign Contract & Join {currentOffer.club.clubName}
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Return to Available Opportunities
          </button>
        )
      }
    >
      {stage === 'selection' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Stage 1 — Interested English League Clubs ({candidateOffers.length})
            </h3>
            {requiresWorkPermit && (
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> GBE Work Permit Review Needed
              </span>
            )}
          </div>

          {/* Mobile Club Selector Pager */}
          <div className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-700 rounded-xl p-2">
            <button
              type="button"
              onClick={() =>
                setSelectedClubIndex((prev) => (prev - 1 + candidateOffers.length) % candidateOffers.length)
              }
              className="min-h-[44px] min-w-[44px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-arcade text-xs cursor-pointer"
            >
              PREV
            </button>
            <div className="text-center min-w-0 flex-1">
              <div className="text-[11px] font-mono text-purple-300">
                CLUB {selectedClubIndex + 1} / {candidateOffers.length}
              </div>
              <div className="text-sm font-black text-white truncate">
                {currentOffer.club.clubName}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedClubIndex((prev) => (prev + 1) % candidateOffers.length)}
              className="min-h-[44px] min-w-[44px] px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-arcade font-bold text-xs cursor-pointer"
            >
              NEXT
            </button>
          </div>

          {/* Focused Club Offer Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  currentOffer.club.clubBadgeBg || 'from-purple-800 to-slate-950'
                } flex items-center justify-center font-black text-white text-base border border-white/20 shrink-0`}
              >
                {currentOffer.club.clubName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-white text-base sm:text-lg truncate">
                  {currentOffer.club.clubName}
                </h4>
                <div className="text-xs text-slate-400">
                  {currentOffer.club.leagueName} • England • Mgr: {currentOffer.club.managerName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-sm">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Offered Role</div>
                <div className="font-black text-emerald-400 mt-0.5">{currentOffer.startingRole}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Weekly Wage</div>
                <div className="font-black text-white mt-0.5">
                  €{currentOffer.weeklyWage.toLocaleString()}/wk
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
              {currentOffer.pitch}
            </p>
          </div>
        </div>
      )}

      {stage === 'negotiation' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-black uppercase text-white">
              Boardroom: {currentOffer.club.clubName}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
              {hasAgent ? 'Agent Represented' : 'Self-Represented'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <Banknote className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400 font-bold uppercase">Weekly Wage</div>
              <div className="text-sm font-black text-emerald-400">
                €{currentOffer.weeklyWage.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400 font-bold uppercase">Signing Bonus</div>
              <div className="text-sm font-black text-amber-300">
                €{currentOffer.signingBonus.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <Clock className="w-4 h-4 text-sky-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400 font-bold uppercase">Length</div>
              <div className="text-sm font-black text-sky-400">{currentOffer.contractYears} Years</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <ShieldCheck className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400 font-bold uppercase">Release Clause</div>
              <div className="text-sm font-black text-rose-400">
                €{(currentOffer.releaseClause / 1000000).toFixed(0)}M
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-2">
              <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400 font-bold uppercase">Facility Development</div>
              <div className="text-sm font-black text-purple-300">
                +{currentOffer.developmentPoints} Pts • {currentOffer.startingRole}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">{currentOffer.pitch}</p>
        </div>
      )}

      {stage === 'work_permit' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-amber-400">UK Home Office & FA GBE</div>
              <h3 className="text-lg font-black text-white">Work-Permit Review Required</h3>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Because you do not possess English nationality and did not graduate from the London Youth League, your international transfer to <strong>{currentOffer.club.clubName}</strong> is subject to the FA GBE points-based appeals committee.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm space-y-2">
            <div className="flex justify-between gap-2">
              <span className="text-slate-300">Approval Probability:</span>
              <strong className="text-emerald-400">80% Approved</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-300">Rejection Risk:</span>
              <strong className="text-rose-400">20% Rejected</strong>
            </div>
          </div>
        </div>
      )}

      {stage === 'permit_result' && (
        <div className="space-y-4 text-center py-2">
          {workPermitApproved ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Work Permit Approved!</h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed text-left">
                The FA Appeals Panel reviewed your exceptional <strong>{ovr} OVR</strong> and recognized you as a generational talent worthy of an elite international visa. Your English League registration with <strong>{currentOffer.club.clubName}</strong> is officially finalized!
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center mx-auto text-rose-300">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Work Permit Denied!</h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed text-left">
                The UK Home Office panel strictly enforced post-Brexit international quota caps. Despite {currentOffer.club.clubName}&apos;s appeal, the Governing Body Endorsement was denied.
              </p>
            </>
          )}
        </div>
      )}
    </ConsoleModalShell>
  );
};

