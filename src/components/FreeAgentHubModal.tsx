import React, { useState, useEffect, useRef } from 'react';
import { PlayerConfig, ManagerState, AccountingState } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  getAvailableTryoutLeagues,
  TryoutLeagueOption,
  runLeagueTryoutEvaluation,
  generateCuratedClubOffers,
  AgentSearchDirective,
  UnifiedClubOffer,
} from '../utils/clubOfferSystem';
import {
  Flame,
  Globe,
  Briefcase,
  UserPlus,
  Clock,
  Sparkles,
  Trophy,
  DollarSign,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  X,
  Target,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePaginationBar, ConsolePagedText } from './common/ConsolePager';

interface FreeAgentHubModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  manager?: ManagerState;
  accounting?: AccountingState;
  currentPeriod?: 'pre_season' | 'mid_season'; // July vs January
  period?: 'pre_season' | 'mid_season';
  onPlayStreets: () => void;
  onRunTryoutSuccess: (offers: UnifiedClubOffer[]) => void;
  onRunTryoutFail: (message: string) => void;
  onGetAgentSuccess: () => void;
  onGetAgentFail: (message: string) => void;
  onAgentFindClubs: (offers: UnifiedClubOffer[]) => void;
  onAdvanceSixMonths?: (reason: string) => void;
  onClose?: () => void;
}

export const FreeAgentHubModal: React.FC<FreeAgentHubModalProps> = ({
  isOpen,
  player,
  manager,
  accounting,
  currentPeriod: propCurrentPeriod,
  period: altPeriod,
  onPlayStreets,
  onRunTryoutSuccess,
  onRunTryoutFail,
  onGetAgentSuccess,
  onGetAgentFail,
  onAgentFindClubs,
  onAdvanceSixMonths,
  onClose,
}) => {
  const currentPeriod = propCurrentPeriod || altPeriod || 'pre_season';
  const { t } = useLanguage();
  const [showLeaguePicker, setShowLeaguePicker] = useState<boolean>(false);
  const [showDirectivePicker, setShowDirectivePicker] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [pathwayPage, setPathwayPage] = useState<number>(1);
  const [leaguePage, setLeaguePage] = useState<number>(1);

  // 6-Month Advancement Transition State
  const [sixMonthsAnnouncement, setSixMonthsAnnouncement] = useState<{
    activityTitle: string;
    description: string;
    badgeText: string;
    onProceed: () => void;
  } | null>(null);

  const playerRef = useRef(player);
  const managerRef = useRef(manager);
  const accountingRef = useRef(accounting);
  const evalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    playerRef.current = player;
    managerRef.current = manager;
    accountingRef.current = accounting;
  }, [player, manager, accounting]);

  useEffect(() => {
    if (!isOpen) {
      if (evalTimerRef.current) {
        clearTimeout(evalTimerRef.current);
        evalTimerRef.current = null;
      }
      setShowLeaguePicker(false);
      setShowDirectivePicker(false);
      setIsEvaluating(false);
      setSixMonthsAnnouncement(null);
      setPathwayPage(1);
      setLeaguePage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    };
  }, []);

  const hasAgent = Boolean(manager?.name || (player as any).managerState?.name || (player as any).managerName);
  const availableLeagues = getAvailableTryoutLeagues();

  if (!isOpen) return null;

  // 1. STREETS ACTION
  const handleStreetsClick = () => {
    if (onAdvanceSixMonths) {
      onAdvanceSixMonths('7v7 Street Football Matchday & Independent Training');
    }
    setSixMonthsAnnouncement({
      activityTitle: t('7v7 Street Football Matchday'),
      description: t('Hit the concrete cages for a live 7v7 street match! Your Match Rating scales your Street Development Points (0 pts if injured), followed by drawing Street Cards.'),
      badgeText: t('LIVE 7v7 STREET MATCHDAY'),
      onProceed: () => {
        setSixMonthsAnnouncement(null);
        onPlayStreets();
      },
    });
  };

  // 2. TRYOUT LEAGUE ACTION
  const handleSelectTryoutLeague = (league: TryoutLeagueOption) => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setShowLeaguePicker(false);

    if (onAdvanceSixMonths) {
      onAdvanceSixMonths(`6 Months Free Agency: ${league.leagueName} Tryout Tour`);
    }

    if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    evalTimerRef.current = setTimeout(() => {
      evalTimerRef.current = null;
      setIsEvaluating(false);
      const result = runLeagueTryoutEvaluation(playerRef.current, league.leagueName, managerRef.current);

      setSixMonthsAnnouncement({
        activityTitle: `${league.flagEmoji} ${league.leagueName} ${t('Tryout Assessment')}`,
        description: t('6 months of travel, physical evaluations, and open squad trials across {leagueName} clubs have concluded.', {
          leagueName: league.leagueName,
        }),
        badgeText: t('6 Months Tryout Tour Concluded'),
        onProceed: () => {
          setSixMonthsAnnouncement(null);
          if (result.isSuccess && result.offers.length > 0) {
            onRunTryoutSuccess(result.offers);
          } else {
            onRunTryoutFail(result.message);
          }
        },
      });
    }, 400);
  };

  // 3. AGENT DIRECTIVE ACTION
  const handleSelectAgentDirective = (directive: AgentSearchDirective) => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setShowDirectivePicker(false);

    const directiveNames: Record<string, string> = {
      glory: t('Trophy & Glory Pursuit'),
      potential: t('Player Development & Training'),
      money: t('High Wage & Signing Bonus Market'),
      any: t('Comprehensive Market Search'),
    };

    if (onAdvanceSixMonths) {
      onAdvanceSixMonths(`6 Months Free Agency: Agent Market Scouting (${directiveNames[directive] || directive})`);
    }

    if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    evalTimerRef.current = setTimeout(() => {
      evalTimerRef.current = null;
      setIsEvaluating(false);
      const currentManager = managerRef.current;
      const offers = generateCuratedClubOffers(
        playerRef.current,
        directive,
        currentManager,
        accountingRef.current,
        5
      );

      setSixMonthsAnnouncement({
        activityTitle: `💼 ${currentManager?.name || t('Agent')} — ${directiveNames[directive] || t('Club Search')}`,
        description: t('Over the past 6 months, your representative leveraged market networks and direct club contacts to negotiate official contract proposals matching your directive.'),
        badgeText: t('6 Months Negotiations Completed'),
        onProceed: () => {
          setSixMonthsAnnouncement(null);
          onAgentFindClubs(offers);
        },
      });
    }, 400);
  };

  // 4. FIND AN AGENT ACTION (IF NO AGENT)
  const handleFindAgentClick = () => {
    if (onAdvanceSixMonths) {
      onAdvanceSixMonths('6 Months Scouting Agent Representation');
    }
    setSixMonthsAnnouncement({
      activityTitle: t('Agent Interviews & Representation Scouting'),
      description: t('You spent 6 months meeting licensed football agents, evaluating representation contracts, and examining agency career networks.'),
      badgeText: t('6 Months Representation Search'),
      onProceed: () => {
        setSixMonthsAnnouncement(null);
        onGetAgentSuccess();
      },
    });
  };

  const handleAgentRouteClick = () => {
    if (hasAgent) {
      setShowDirectivePicker(true);
    } else {
      handleFindAgentClick();
    }
  };

  const periodLabel = currentPeriod === 'mid_season' ? t('January • Mid-Season Window') : t('July • Pre-Season Window');
  const LEAGUES_PER_PAGE = 4;
  const totalLeaguePages = Math.max(1, Math.ceil(availableLeagues.length / LEAGUES_PER_PAGE));
  const safeLeaguePage = Math.min(leaguePage, totalLeaguePages);
  const pagedLeagues = availableLeagues.slice(
    (safeLeaguePage - 1) * LEAGUES_PER_PAGE,
    safeLeaguePage * LEAGUES_PER_PAGE
  );

  const hubChoices = [
    {
      id: 'free-agent-choice-streets',
      label: t('Choice 1 • Live 7v7 Matchday'),
      title: t('Play on the Streets'),
      description: t('Compete in a live 7v7 street match on local concrete cages! Earn Street Dev Points scaled by your Match Rating (0 pts if injured), then draw Street Cards.'),
      cta: t('PLAY 7v7 STREET MATCH'),
      borderClass: 'border-orange-500/60 bg-gradient-to-b from-orange-950/40 to-slate-950 hover:border-orange-400',
      iconBoxClass: 'bg-orange-500/20 border-orange-400/50 text-orange-400',
      tagClass: 'text-orange-400',
      ctaClass: 'border-orange-500/30 text-orange-300',
      icon: <Flame className="w-6 h-6" />,
      onClick: handleStreetsClick,
    },
    {
      id: 'free-agent-choice-tryouts',
      label: t('Choice 2 • Progress 6 Months'),
      title: t('League Tryouts'),
      description: t('Travel to a country or league of your choice for open club tryouts. Impress scouts with your OVR and earn immediate professional contract offers.'),
      cta: t('SELECT LEAGUE'),
      borderClass: 'border-sky-500/60 bg-gradient-to-b from-sky-950/40 to-slate-950 hover:border-sky-400',
      iconBoxClass: 'bg-sky-500/20 border-sky-400/50 text-sky-400',
      tagClass: 'text-sky-400',
      ctaClass: 'border-sky-500/30 text-sky-300',
      icon: <Globe className="w-6 h-6" />,
      onClick: () => {
        setLeaguePage(1);
        setShowLeaguePicker(true);
      },
    },
    {
      id: 'free-agent-choice-agent',
      label: t('Choice 3 • Progress 6 Months'),
      title: hasAgent ? t('Ask Agent to Find Club') : t('Find an Agent'),
      description: hasAgent
        ? t('Direct your agent with specific career priorities (Glory, Develop, Money) to return up to 5 curated contract proposals from top clubs.')
        : t('Meet licensed football agents across different tiers. Draw candidate agent cards and hire an agent to represent you on the transfer market.'),
      cta: hasAgent ? t('DIRECT AGENT') : t('FIND AN AGENT & DRAW CARDS'),
      borderClass: 'border-amber-500/60 bg-gradient-to-b from-amber-950/40 to-slate-950 hover:border-amber-400',
      iconBoxClass: 'bg-amber-500/20 border-amber-400/50 text-amber-400',
      tagClass: 'text-amber-400',
      ctaClass: 'border-amber-500/30 text-amber-300',
      icon: hasAgent ? <Briefcase className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />,
      onClick: handleAgentRouteClick,
    },
  ];

  const activeMobileChoice = hubChoices[Math.min(pathwayPage - 1, hubChoices.length - 1)];

  return (
    <>
      <ConsoleModalShell
        isOpen={isOpen}
        onClose={onClose}
        id="free-agent-hub-overlay"
        title={t('Free Agent Career Hub')}
        subtitle={periodLabel}
        badge="FREE AGENCY"
        icon={<Clock className="w-5 h-5 text-amber-400" />}
        accentColor="amber"
        maxWidthClass="sm:max-w-4xl"
        showCloseButton={Boolean(onClose)}
        bodyClassName="p-3 sm:p-6 space-y-4"
        footer={
          <div className="space-y-2">
            <div className="md:hidden">
              <ConsolePaginationBar
                currentPage={pathwayPage}
                totalPages={hubChoices.length}
                onPageChange={setPathwayPage}
                label="PATHWAY"
              />
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                {t('Joining a club mid-season (January) unlocks immediate participation in the remaining season fixtures & league standings!')}
              </span>
            </div>
          </div>
        }
      >
        {/* MANDATORY 6-MONTH ADVANCEMENT DISCLAIMER NOTICE */}
        <div className="p-3 sm:p-4 rounded-xl bg-amber-950/40 border-2 border-amber-400 flex items-start gap-3 text-left">
          <div className="w-9 h-9 rounded-lg bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/40">
            <Clock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide block font-arcade">
              ⚠️ {t('6 MONTHS WILL PASS AFTER YOU CHOOSE ANY OF THESE OPTIONS.')}
            </span>
            <p className="text-xs sm:text-sm text-slate-200 mt-0.5 font-sans">
              {t('Your career calendar and season schedule will advance by 6 months while you pursue your selected opportunity.')}
            </p>
          </div>
        </div>

        {/* MOBILE SINGLE-PATHWAY CONSOLE VIEW (< md) */}
        <div className="md:hidden">
          <button
            id={activeMobileChoice.id}
            type="button"
            onClick={activeMobileChoice.onClick}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 active:scale-[0.99] ${activeMobileChoice.borderClass}`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${activeMobileChoice.iconBoxClass}`}>
                  {activeMobileChoice.icon}
                </div>
                <div className="min-w-0">
                  <span className={`text-[10px] font-black uppercase tracking-wider block font-arcade ${activeMobileChoice.tagClass}`}>
                    {activeMobileChoice.label}
                  </span>
                  <h3 className="text-base font-black text-white font-arcade">
                    {activeMobileChoice.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {activeMobileChoice.description}
              </p>
            </div>
            <div className={`min-h-[48px] px-4 rounded-xl bg-slate-900/90 border-2 ${activeMobileChoice.ctaClass} flex items-center justify-between text-xs font-black font-arcade`}>
              <span>{activeMobileChoice.cta}</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </div>
          </button>
        </div>

        {/* DESKTOP 3 PRIMARY FREE AGENT CHOICES GRID (>= md) */}
        <div className="hidden md:grid grid-cols-3 gap-4 text-left">
          {hubChoices.map((choice) => (
            <button
              key={choice.id}
              id={choice.id}
              type="button"
              onClick={choice.onClick}
              className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-lg active:translate-y-0.5 ${choice.borderClass}`}
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${choice.iconBoxClass}`}>
                  {choice.icon}
                </div>
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-wider block font-arcade ${choice.tagClass}`}>
                    {choice.label}
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5 font-arcade">
                    {choice.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {choice.description}
                </p>
              </div>
              <div className={`pt-3 border-t flex items-center justify-between text-xs font-black font-arcade ${choice.ctaClass}`}>
                <span>{choice.cta}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </ConsoleModalShell>

      {/* 6-MONTH ADVANCEMENT PROMINENT TRANSITION SCREEN */}
      {sixMonthsAnnouncement && (
        <ConsoleModalShell
          isOpen={true}
          title={t('6 MONTHS HAVE PASSED')}
          subtitle={sixMonthsAnnouncement.activityTitle}
          badge={sixMonthsAnnouncement.badgeText}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          accentColor="amber"
          maxWidthClass="sm:max-w-lg"
          zIndexClass="z-[70]"
          showCloseButton={false}
          bodyClassName="p-4 sm:p-6 flex flex-col justify-center items-center text-center space-y-4"
          footer={
            <button
              type="button"
              onClick={sixMonthsAnnouncement.onProceed}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 active:scale-95 font-arcade"
            >
              <span>{t('Proceed to Results & Proposals')}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          }
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-xl border-2 border-amber-300">
            <Clock className="w-9 h-9 stroke-[2.5]" />
          </div>
          <ConsolePagedText paragraphs={[sixMonthsAnnouncement.description]} />
          <div className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{t('Season Calendar & Training Log successfully updated (+6 Months)')}</span>
          </div>
        </ConsoleModalShell>
      )}

      {/* MODAL 1: TRYOUT LEAGUE SELECTION MODAL */}
      {showLeaguePicker && (
        <ConsoleModalShell
          isOpen={showLeaguePicker}
          onClose={() => setShowLeaguePicker(false)}
          title={t('Choose Tryout Destination League')}
          subtitle={t('6 months will pass as you travel and trial with clubs')}
          icon={<Globe className="w-5 h-5 text-sky-400" />}
          accentColor="sky"
          maxWidthClass="sm:max-w-2xl"
          zIndexClass="z-[60]"
          bodyClassName="p-3 sm:p-5 space-y-2.5"
          footer={
            totalLeaguePages > 1 ? (
              <ConsolePaginationBar
                currentPage={safeLeaguePage}
                totalPages={totalLeaguePages}
                onPageChange={setLeaguePage}
                totalItems={availableLeagues.length}
                pageSize={LEAGUES_PER_PAGE}
                label="LEAGUES"
              />
            ) : undefined
          }
        >
          {pagedLeagues.map((league) => (
            <button
              key={league.leagueId}
              type="button"
              onClick={() => handleSelectTryoutLeague(league)}
              className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-sky-400 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between gap-3 group text-left"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl shrink-0">{league.flagEmoji}</span>
                <div className="min-w-0">
                  <div className="text-sm font-black text-white flex items-center gap-2 flex-wrap font-arcade">
                    <span className="truncate">{league.leagueName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                      {league.countryName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {league.prestigeLevel} • ~{league.averageStarterOvr} OVR • {league.clubCount} Clubs
                  </div>
                </div>
              </div>
              <span className="min-h-[44px] px-3.5 py-2 rounded-lg bg-sky-500 text-slate-950 text-xs font-black uppercase flex items-center font-arcade shrink-0">
                {t('TRY OUT')}
              </span>
            </button>
          ))}
        </ConsoleModalShell>
      )}

      {/* MODAL 2: AGENT DIRECTIVE PICKER MODAL */}
      {showDirectivePicker && (
        <ConsoleModalShell
          isOpen={showDirectivePicker}
          onClose={() => setShowDirectivePicker(false)}
          title={t('Direct Your Agent')}
          subtitle={t('Curate up to 5 contract proposals matching your priority')}
          icon={<Briefcase className="w-5 h-5 text-amber-400" />}
          accentColor="amber"
          maxWidthClass="sm:max-w-2xl"
          zIndexClass="z-[60]"
          bodyClassName="p-3 sm:p-5 space-y-3"
        >
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-300 flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{t('6 MONTHS WILL PASS as your agent negotiates with prospective clubs.')}</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'glory' as AgentSearchDirective,
                title: t('I Want Glory'),
                desc: t('Rank clubs by competitive strength, continental titles, and prestige hierarchy (Blancos CF, Catalunya FC, Bavaria Rot FC, Bleus de Paris, English giants).'),
                icon: <Trophy className="w-5 h-5 text-amber-400" />,
                cardClass: 'border-amber-500/40 hover:border-amber-400',
                iconClass: 'bg-amber-500/20 border-amber-400/40',
                arrowClass: 'text-amber-400',
              },
              {
                id: 'potential' as AgentSearchDirective,
                title: t('I Want to Develop'),
                desc: t('Rank clubs by Development Tier (5 to 1), development points/year, projected squad role, and tactical compatibility.'),
                icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
                cardClass: 'border-emerald-500/40 hover:border-emerald-400',
                iconClass: 'bg-emerald-500/20 border-emerald-400/40',
                arrowClass: 'text-emerald-400',
              },
              {
                id: 'money' as AgentSearchDirective,
                title: t('I Want Money'),
                desc: t('Rank clubs by salary package, signing bonus, and overall financial contract value (Saudi League, English League).'),
                icon: <DollarSign className="w-5 h-5 text-yellow-400" />,
                cardClass: 'border-yellow-500/40 hover:border-yellow-400',
                iconClass: 'bg-yellow-500/20 border-yellow-400/40',
                arrowClass: 'text-yellow-400',
              },
              {
                id: 'any' as AgentSearchDirective,
                title: t('Just Find Me a Team'),
                desc: t('A balanced search across all available clubs that genuinely want and need a player at your position.'),
                icon: <Target className="w-5 h-5 text-slate-300" />,
                cardClass: 'border-slate-700 hover:border-slate-500',
                iconClass: 'bg-slate-800 border-slate-700',
                arrowClass: 'text-slate-400',
              },
            ].map((dir) => (
              <button
                key={dir.id}
                type="button"
                onClick={() => handleSelectAgentDirective(dir.id)}
                className={`w-full min-h-[64px] p-3.5 rounded-xl border bg-slate-950 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between gap-3 group text-left ${dir.cardClass}`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${dir.iconClass}`}>
                    {dir.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-white font-arcade">{dir.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-snug">{dir.desc}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform ${dir.arrowClass}`} />
              </button>
            ))}
          </div>
        </ConsoleModalShell>
      )}
    </>
  );
};

