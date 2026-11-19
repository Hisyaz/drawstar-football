import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  UserCheck,
  Globe,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award,
  Briefcase,
  FileCheck,
  Compass,
} from 'lucide-react';
import { PlayerCardData, AccountingState, ManagerState } from '../types';
import {
  calculateContractRenewal,
  generateManagerTransferProposals,
  calculatePlayingTimeIntervention,
  generateYouthProFastTrackOffers,
  generateTopYouthAcademyOffers,
  ContractRenewalResult,
  ManagerTransferProposal,
  PlayingTimeInterventionResult,
  YouthProOffer,
  TopYouthAcademyOffer,
} from '../utils/managerInteractionSystem';
import { ensureProgressionIntegrityOnProTransition } from '../utils/playerIdentitySystem';
import { addPlayerNewPosition } from '../utils/positionMasterySystem';
import { calculatePlayerMarketValue } from '../utils/transferMarketSystem';
import { getPerkById, CareerPerk } from '../utils/perksSystem';
import { findClubInLeagueDatabase } from '../utils/kitResolutionSystem';
import { rebuildPlayerCompetitiveContextOnTransfer } from '../utils/clubContextRebuilder';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePaginationBar, ConsolePagedText } from './common/ConsolePager';

export type ManagerActiveAction =
  | 'none'
  | 'pro_contract_renewal'
  | 'pro_request_transfer'
  | 'pro_playing_time'
  | 'youth_get_pro_team'
  | 'youth_get_new_youth_team';

interface ManagerActionsModalProps {
  isOpen: boolean;
  action: ManagerActiveAction;
  onClose: () => void;
  player: PlayerCardData;
  accounting?: AccountingState;
  manager?: ManagerState;
  onUpdatePlayer: (updatedPlayer: PlayerCardData) => void;
  onUpdateAccounting: (updatedAccounting: AccountingState) => void;
  onUpdateManager?: (updatedManager: ManagerState) => void;
  onTriggerPerkUnlock?: (perk: CareerPerk) => void;
  showToast: (msg: string) => void;
}

export const ManagerActionsModal: React.FC<ManagerActionsModalProps> = ({
  isOpen,
  action,
  onClose,
  player,
  accounting,
  manager,
  onUpdatePlayer,
  onUpdateAccounting,
  onTriggerPerkUnlock,
  showToast,
}) => {
  const { t } = useLanguage();
  const [renewalResult, setRenewalResult] = useState<ContractRenewalResult | null>(null);
  const [transferProposals, setTransferProposals] = useState<ManagerTransferProposal[]>([]);
  const [playingTimeResult, setPlayingTimeResult] = useState<PlayingTimeInterventionResult | null>(null);
  const [youthProOffers, setYouthProOffers] = useState<YouthProOffer[]>([]);
  const [topYouthOffers, setTopYouthOffers] = useState<TopYouthAcademyOffer[]>([]);
  const [offerPage, setOfferPage] = useState<number>(1);
  const [subTab, setSubTab] = useState<'main' | 'details'>('main');

  React.useEffect(() => {
    if (!isOpen) return;
    setOfferPage(1);
    setSubTab('main');

    if (action === 'pro_contract_renewal') {
      setRenewalResult(calculateContractRenewal(player, accounting, manager));
    } else if (action === 'pro_request_transfer') {
      setTransferProposals(generateManagerTransferProposals(player, manager));
    } else if (action === 'pro_playing_time') {
      setPlayingTimeResult(calculatePlayingTimeIntervention(player, manager));
    } else if (action === 'youth_get_pro_team') {
      setYouthProOffers(generateYouthProFastTrackOffers(player, manager));
    } else if (action === 'youth_get_new_youth_team') {
      setTopYouthOffers(generateTopYouthAcademyOffers(player, manager));
    }
  }, [isOpen, action, player, accounting, manager]);

  if (!isOpen || action === 'none') return null;

  const handleAcceptContractRenewal = () => {
    if (!renewalResult || !renewalResult.isSuccess) return;

    const updatedAccounting: AccountingState = {
      ...accounting,
      contractYears: renewalResult.newContractYears,
      yearlySalary: renewalResult.newYearlySalary,
      releaseClause: renewalResult.newReleaseClause ?? accounting?.releaseClause,
      transferStatus: 'not_listed',
      sponsors: accounting?.sponsors || [],
      sanctions: accounting?.sanctions || [],
      businesses: accounting?.businesses || [],
      totalSavings: (accounting?.totalSavings || 0) + renewalResult.signingBonus,
    };

    const updatedPlayer: PlayerCardData = {
      ...player,
      isFreeAgent: false,
      contractYearsRemaining: renewalResult.newContractYears,
      releaseClause: renewalResult.newReleaseClause ?? player.releaseClause,
      marketValue: calculatePlayerMarketValue({
        ...player,
        accounting: updatedAccounting,
      }).marketValue,
    };

    onUpdateAccounting(updatedAccounting);
    onUpdatePlayer(updatedPlayer);
    showToast(
      t('✍️ Contract Renewed! New weekly wage: €{wage}/wk (+€{bonus} bonus)', {
        wage: renewalResult.newWeeklyWage.toLocaleString(),
        bonus: renewalResult.signingBonus.toLocaleString(),
      })
    );
    onClose();
  };

  const handleExecuteTransfer = (proposal: ManagerTransferProposal) => {
    const isSaudi =
      proposal.countryName.toLowerCase().includes('saudi') ||
      proposal.countryName.toLowerCase().includes('arabia') ||
      proposal.leagueName.toLowerCase().includes('saudi') ||
      proposal.leagueName.toLowerCase().includes('roshn');

    const playerFeeBonus = proposal.playerTransferFeeCutAmount || 0;
    const totalBonusGained = proposal.signingBonus + playerFeeBonus;

    const updatedAccounting: AccountingState = {
      ...accounting,
      contractYears: proposal.contractYears,
      yearlySalary: proposal.yearlySalary,
      releaseClause: proposal.releaseClause,
      transferStatus: 'not_listed',
      sponsors: accounting?.sponsors || [],
      sanctions: accounting?.sanctions || [],
      businesses: accounting?.businesses || [],
      totalSavings: (accounting?.totalSavings || 0) + totalBonusGained,
    };

    const nextActivePerks = [...(player.activePerkIds || [])];
    if (isSaudi && !nextActivePerks.includes('mercenary')) {
      if (nextActivePerks.length >= 5) {
        nextActivePerks[nextActivePerks.length - 1] = 'mercenary';
      } else {
        nextActivePerks.push('mercenary');
      }
    }

    const updatedPlayer: PlayerCardData = rebuildPlayerCompetitiveContextOnTransfer(
      player,
      proposal.clubName,
      {
        isFreeAgent: false,
        contractYearsRemaining: proposal.contractYears,
        releaseClause: proposal.releaseClause,
        squadDestination: proposal.proposedSquad,
        squadRole: proposal.expectedRole,
        hasSeenSaudiOfferEvent: isSaudi ? true : player.hasSeenSaudiOfferEvent,
        activePerkIds: nextActivePerks,
        accounting: updatedAccounting,
      } as any
    );

    onUpdateAccounting(updatedAccounting);
    onUpdatePlayer(updatedPlayer);
    if (isSaudi) {
      const mercenaryPerk = getPerkById('mercenary');
      if (mercenaryPerk && onTriggerPerkUnlock) {
        onTriggerPerkUnlock(mercenaryPerk);
      }
      showToast(
        t('💰 Transferred to {club}! Fee: {fee} • Player Cut: €{cut} • Unlocked "Mercenary" perk!', {
          club: proposal.clubName,
          fee: proposal.formattedFee,
          cut: playerFeeBonus.toLocaleString(),
        })
      );
    } else {
      showToast(
        t('✈️ Transferred to {club}! Fee: {fee} • Wage: €{wage}/wk • Player Cut: €{cut}', {
          club: proposal.clubName,
          fee: proposal.formattedFee,
          wage: proposal.weeklyWage.toLocaleString(),
          cut: playerFeeBonus.toLocaleString(),
        })
      );
    }
    onClose();
  };

  const handleApplyPlayingTimeOutcome = () => {
    if (!playingTimeResult) return;

    let updatedPlayer: PlayerCardData = { ...player };

    if (
      playingTimeResult.outcomeType === 'first_team_starter' ||
      playingTimeResult.outcomeType === 'young_potential_succession'
    ) {
      updatedPlayer.squadDestination = 'First Team';
      updatedPlayer.squadRole = playingTimeResult.newRole || 'Starting XI Pillar';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (playingTimeResult.outcomeType === 'first_team_rotation') {
      updatedPlayer.squadDestination = 'First Team';
      updatedPlayer.squadRole = 'Primary First-Team Rotation';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (
      playingTimeResult.outcomeType === 'reserves_to_first_team' ||
      (playingTimeResult.outcomeType as string) === 'first_team_promotion'
    ) {
      updatedPlayer.squadDestination = 'First Team';
      updatedPlayer.squadRole = 'First Team Squad Player';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (playingTimeResult.outcomeType === 'u20_to_reserves') {
      updatedPlayer.squadDestination = 'Reserves';
      updatedPlayer.squadRole = 'Reserves Prospect';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (playingTimeResult.outcomeType === 'u17_to_u20') {
      updatedPlayer.squadDestination = 'U20';
      updatedPlayer.squadRole = 'U20 Developing Talent';
      updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
    } else if (playingTimeResult.outcomeType === 'development_plan') {
      updatedPlayer.squadRole = 'Development Plan Focus';
    } else if (playingTimeResult.outcomeType === 'suggest_learn_position') {
      if (playingTimeResult.learnPositionProposal) {
        updatedPlayer = addPlayerNewPosition(updatedPlayer, playingTimeResult.learnPositionProposal);
        updatedPlayer.squadRole = `Learning ${playingTimeResult.learnPositionProposal.subPosition}`;
        updatedPlayer.chemistry = Math.min(100, (updatedPlayer.chemistry || 50) + playingTimeResult.chemistryDelta);
      }
    } else if (playingTimeResult.outcomeType === 'season_loan_move') {
      if (playingTimeResult.loanClub) {
        updatedPlayer.club = `${playingTimeResult.loanClub.name} (Loan)`;
        updatedPlayer.league = playingTimeResult.loanClub.league;
        updatedPlayer.squadDestination = 'First Team';
        updatedPlayer.squadRole = 'Guaranteed Starter';
      }
    } else if (playingTimeResult.outcomeType === 'transfer_list') {
      updatedPlayer.requestedTransfer = true;
      updatedPlayer.squadRole = 'Transfer Listed';
    }

    onUpdatePlayer(updatedPlayer);
    showToast(t('🎯 Manager Decision: {headline}', { headline: t(playingTimeResult.headline) }));
    onClose();
  };

  const handleSignYouthProContract = (offer: YouthProOffer) => {
    const updatedAccounting: AccountingState = {
      contractYears: offer.contractYears,
      yearlySalary: offer.yearlySalary,
      sponsors: accounting?.sponsors || [],
      sanctions: accounting?.sanctions || [],
      businesses: accounting?.businesses || [],
      totalSavings: (accounting?.totalSavings || 0) + offer.signingBonus,
    };

    const matchedProClub = findClubInLeagueDatabase(offer.clubName);

    const updatedPlayer = ensureProgressionIntegrityOnProTransition(player, {
      clubName: offer.clubName,
      leagueName: offer.leagueName,
      countryName: offer.countryName,
      squadDestination: offer.squadDestination,
      playingTimeExpectation: offer.expectedRole === 'First Team Starter' ? 'STARTER' : 'ROTATION',
      fameBonus: 10,
      chemistryBonus: 50,
      recoverySupplementsBonus: 1,
    });
    if (matchedProClub) {
      updatedPlayer.clubId = matchedProClub.id;
      if (matchedProClub.kit) updatedPlayer.kit = { ...matchedProClub.kit };
      if (matchedProClub.emblem) updatedPlayer.emblem = { ...matchedProClub.emblem };
    }
    updatedPlayer.squadRole = offer.expectedRole;
    updatedPlayer.marketValue = calculatePlayerMarketValue({
      ...updatedPlayer,
      accounting: updatedAccounting,
    }).marketValue;

    onUpdateAccounting(updatedAccounting);
    onUpdatePlayer(updatedPlayer);
    showToast(
      t('🌟 Signed First Pro Contract with {club}! Wage: €{wage}/wk', {
        club: offer.clubName,
        wage: offer.weeklyWage.toLocaleString(),
      })
    );
    onClose();
  };

  const handleSelectTopYouthAcademy = (offer: TopYouthAcademyOffer) => {
    const matchedYouthClub = findClubInLeagueDatabase(offer.name);

    const updatedPlayer: PlayerCardData = {
      ...player,
      club: offer.name,
      clubId: matchedYouthClub?.id || player.clubId,
      youthLeagueTeam: offer.name,
      league: offer.youthLeague,
      city: offer.city,
      clubCountry: offer.country,
      kit: matchedYouthClub?.kit ? { ...matchedYouthClub.kit } : player.kit,
      emblem: matchedYouthClub?.emblem ? { ...matchedYouthClub.emblem } : player.emblem,
    };

    onUpdatePlayer(updatedPlayer);
    showToast(
      t('🚀 Transferred to {club} ({city}, {country})! {perk}', {
        club: offer.name,
        city: offer.city,
        country: offer.country,
        perk: t(offer.developmentPerk),
      })
    );
    onClose();
  };

  const titleText =
    action === 'pro_contract_renewal'
      ? t('Contract Renewal Negotiations')
      : action === 'pro_request_transfer'
      ? t('Transfer Market Proposals')
      : action === 'pro_playing_time'
      ? t('Playing Time & Squad Role Summit')
      : action === 'youth_get_pro_team'
      ? t('Fast-Track Professional Contract')
      : t('Elite Youth Academy Transfer');

  const activeTransferProp =
    transferProposals[Math.min(offerPage - 1, Math.max(0, transferProposals.length - 1))] || null;
  const activeYouthPro =
    youthProOffers[Math.min(offerPage - 1, Math.max(0, youthProOffers.length - 1))] || null;
  const activeTopYouth =
    topYouthOffers[Math.min(offerPage - 1, Math.max(0, topYouthOffers.length - 1))] || null;

  const footerNode = (() => {
    if (action === 'pro_contract_renewal' && renewalResult) {
      return renewalResult.isSuccess ? (
        <button
          type="button"
          onClick={handleAcceptContractRenewal}
          className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm uppercase tracking-wide shadow-sm border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
        >
          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('Sign New Contract')}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm cursor-pointer transition border border-slate-200 shadow-sm"
        >
          {t('Return to Career Hub')}
        </button>
      );
    }

    if (action === 'pro_playing_time' && playingTimeResult) {
      return (
        <button
          type="button"
          onClick={handleApplyPlayingTimeOutcome}
          className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wide shadow-sm border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {playingTimeResult.outcomeType === 'suggest_learn_position'
              ? t('Confirm & Learn {pos}', {
                  pos: playingTimeResult.learnPositionProposal?.subPosition || 'Position',
                })
              : t('Confirm & Apply Changes')}
          </span>
        </button>
      );
    }

    if (action === 'pro_request_transfer' && activeTransferProp) {
      return (
        <button
          type="button"
          onClick={() => handleExecuteTransfer(activeTransferProp)}
          className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 cursor-pointer transition shadow-sm border border-slate-200 active:scale-95"
        >
          <span>{t('Accept & Sign')} ({activeTransferProp.clubName})</span>
          <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
        </button>
      );
    }

    if (action === 'youth_get_pro_team' && activeYouthPro) {
      return (
        <button
          type="button"
          onClick={() => handleSignYouthProContract(activeYouthPro)}
          className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 cursor-pointer transition shadow-sm border border-slate-200 active:scale-95"
        >
          <span>{t('Sign Pro Deal')} ({activeYouthPro.clubName})</span>
          <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
        </button>
      );
    }

    if (action === 'youth_get_new_youth_team' && activeTopYouth) {
      return (
        <button
          type="button"
          onClick={() => handleSelectTopYouthAcademy(activeTopYouth)}
          className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 cursor-pointer transition shadow-sm border border-slate-200 active:scale-95"
        >
          <span>{t('Join Academy')} ({activeTopYouth.name})</span>
          <ArrowRight className="w-4 h-4 text-purple-600 shrink-0" />
        </button>
      );
    }

    return null;
  })();

  const hasSubTabs = action === 'pro_contract_renewal' || action === 'pro_playing_time';

  const modalContent = (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={titleText}
      subtitle={t('Agent & Boardroom Summit')}
      icon={<UserCheck className="w-5 h-5 text-blue-400" />}
      accentColor="blue"
      maxWidthClass="sm:max-w-3xl"
      zIndexClass="z-[99999]"
      tabs={
        hasSubTabs
          ? [
              { id: 'main', label: action === 'pro_contract_renewal' ? t('Contract Terms') : t('Summit Outcome') },
              {
                id: 'details',
                label: action === 'pro_contract_renewal' ? t("Agent's Negotiation Pitch") : t('Depth Chart & Notes'),
              },
            ]
          : undefined
      }
      activeTabId={subTab}
      onTabChange={(id) => setSubTab(id as 'main' | 'details')}
      footer={footerNode}
    >
      <div className="p-4 sm:p-6 space-y-4 text-left">
        {/* 1. PRO CONTRACT RENEWAL */}
        {action === 'pro_contract_renewal' && renewalResult && (
          <>
            {subTab === 'main' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-400 block">{t('Club Importance')}</span>
                    <span className="text-xs sm:text-sm font-black text-amber-400">
                      {t(renewalResult.statusBreakdown.importance)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-400 block">{t('Contract Urgency')}</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-400">
                      {t(renewalResult.statusBreakdown.contractUrgency)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-400 block">{t('Agent Skill Leverage')}</span>
                    <span className="text-xs sm:text-sm font-black text-blue-400">
                      {t(renewalResult.statusBreakdown.negotiationSkillBonus)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-400 block">{t('Success Chance')}</span>
                    <span className="text-xs sm:text-sm font-black text-purple-400">
                      {renewalResult.successProbability}%
                    </span>
                  </div>
                </div>

                {renewalResult.isSuccess ? (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm sm:text-base">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>{t('Contract Terms Agreed!')}</span>
                    </div>
                    <p className="text-slate-100 text-sm leading-relaxed">{t(renewalResult.clubResponseText)}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-500/20">
                      <div>
                        <span className="text-xs text-slate-400 block font-bold">{t('New Weekly Wage')}</span>
                        <span className="text-base font-black text-emerald-300">
                          €{renewalResult.newWeeklyWage.toLocaleString()} / {t('wk')}
                        </span>
                        <span className="text-xs text-emerald-400 font-bold block">
                          (+{renewalResult.percentageIncrease}% {t('raise')})
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-bold">{t('Contract Duration')}</span>
                        <span className="text-base font-black text-white">
                          {renewalResult.newContractYears} {t('Years')}
                        </span>
                        <span className="text-xs text-slate-400 block">
                          ({t('Was')} {renewalResult.oldContractYears} {t('yrs')})
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-bold">{t('Signing Bonus')}</span>
                        <span className="text-base font-black text-amber-400">
                          €{renewalResult.signingBonus.toLocaleString()}
                        </span>
                        <span className="text-xs text-amber-300/80 block font-bold">{t('Paid Immediately')}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ConsolePagedText
                    resetKey="renewal-stalled"
                    pages={[
                      {
                        heading: t('Contract Renewal Stalled'),
                        paragraphs: [
                          t(renewalResult.clubResponseText),
                          t('Tip: Renewal is significantly easier when you have 1 year or less left on your contract, or after raising your OVR and match influence.'),
                        ],
                      },
                    ]}
                  />
                )}
              </div>
            ) : (
              <ConsolePagedText
                resetKey="renewal-pitch"
                pages={[
                  {
                    heading: t("Agent's Negotiation Pitch"),
                    paragraphs: [t(renewalResult.managerPitchText)],
                    node: (
                      <div className="flex items-center gap-2 text-blue-300 text-xs font-bold pt-2">
                        <Briefcase className="w-4 h-4 shrink-0" />
                        <span>{manager?.name || t('Your Agent')}</span>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </>
        )}

        {/* 2. PRO REQUEST TRANSFER OFFERS */}
        {action === 'pro_request_transfer' && activeTransferProp && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-slate-200 text-xs sm:text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                {t('{agentName} tapped his club network (Rating: {network}/100) to bring {count} formal transfer bids.', {
                  agentName: manager?.name || t('Your Agent'),
                  network: manager?.network || 40,
                  count: transferProposals.length,
                })}
              </span>
            </div>

            {transferProposals.length > 1 && (
              <ConsolePaginationBar
                currentPage={offerPage}
                totalPages={transferProposals.length}
                onPageChange={setOfferPage}
                label={t('OFFER')}
              />
            )}

            <div className="p-4 sm:p-5 bg-slate-950 border border-slate-700 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl shrink-0">{activeTransferProp.countryFlag}</span>
                  <div className="min-w-0">
                    <div className="font-black text-white text-base sm:text-lg flex items-center flex-wrap gap-1.5">
                      <span>{activeTransferProp.clubName}</span>
                      {activeTransferProp.clubTierInfo && (
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${activeTransferProp.clubTierInfo.badgeBg}`}
                        >
                          {t(activeTransferProp.clubTierInfo.shortLabel)}
                        </span>
                      )}
                      {activeTransferProp.interestEvaluation && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          {t(activeTransferProp.interestEvaluation.classification)} (
                          {activeTransferProp.interestEvaluation.interestScore}%)
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
                      {activeTransferProp.leagueName} ({activeTransferProp.countryName})
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 flex sm:block items-center justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className="text-xs text-slate-400 font-bold block">{t('Offered Fee')}</span>
                  <span className="text-base font-black text-emerald-400">{activeTransferProp.formattedFee}</span>
                </div>
              </div>

              {activeTransferProp.starterComparisonText && (
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-1 text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{t('Squad Starter Comparison')}:</span>
                  </span>
                  <span className="font-mono font-black text-cyan-300">
                    {t(activeTransferProp.starterComparisonText)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t('Weekly Wage')}</span>
                  <span className="text-sm font-black text-white">
                    €{activeTransferProp.weeklyWage.toLocaleString()}/{t('wk')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t('Role Promised')}</span>
                  <span className="text-sm font-black text-amber-400">{t(activeTransferProp.expectedRole)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t('Signing Bonus')}</span>
                  <span className="text-sm font-black text-purple-400">
                    €{activeTransferProp.signingBonus.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-400 font-bold block">
                    {t('Player Cut')} ({activeTransferProp.playerTransferFeeCutPercent || 7}%)
                  </span>
                  <span className="text-sm font-black text-emerald-300">
                    €{(activeTransferProp.playerTransferFeeCutAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed italic">{t(activeTransferProp.managerAssessment)}</p>
            </div>
          </div>
        )}

        {/* 3. PRO PLAYING TIME INTERVENTION */}
        {action === 'pro_playing_time' && playingTimeResult && (
          <>
            {subTab === 'main' ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{t('Coach & Boardroom Tactical Decision')}</span>
                  </div>
                  <p className="text-slate-100 text-sm leading-relaxed">{t(playingTimeResult.coachStatement)}</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="font-extrabold text-white text-sm">
                    {t('Negotiated Outcome')}: {t(playingTimeResult.headline)}
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">{t(playingTimeResult.managerDebrief)}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                    <div className="p-3 bg-slate-900 rounded-xl">
                      <span className="text-xs text-slate-400 font-bold block">{t('Squad Destination')}</span>
                      <span className="text-sm font-black text-emerald-400">{t(playingTimeResult.newSquad)}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl">
                      <span className="text-xs text-slate-400 font-bold block">{t('Assigned Role')}</span>
                      <span className="text-sm font-black text-blue-400">{t(playingTimeResult.newRole)}</span>
                    </div>
                  </div>

                  {playingTimeResult.loanClub && (
                    <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-indigo-100 text-sm">
                      <strong>{t('Loan Destination')}:</strong> {playingTimeResult.loanClub.name} (
                      {playingTimeResult.loanClub.league}) • {t('Role')}: {t(playingTimeResult.loanClub.guaranteedRole)}
                    </div>
                  )}

                  {playingTimeResult.learnPositionProposal && (
                    <div className="p-3.5 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-2 text-sm text-purple-100">
                      <div className="flex items-center gap-2 font-black text-purple-300">
                        <Compass className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>
                          {t('Position Opportunity')}: {playingTimeResult.learnPositionProposal.subPosition}
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {t(playingTimeResult.learnPositionProposal.explanation)}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-purple-500/20 text-xs">
                        <span className="text-purple-300 font-bold">
                          {t('Current Starter')}: {playingTimeResult.learnPositionProposal.starterName}
                        </span>
                        <span className="text-amber-400 font-black">
                          {playingTimeResult.learnPositionProposal.starterOvr} {t('OVR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {playingTimeResult.evaluation ? (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-300">
                      <span>{t('Position Depth & Rival Evaluation')}</span>
                      <span className="text-blue-400">
                        {player.position || 'ST'} {t('Depth Chart')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[10px]">
                            {t('YOU')}
                          </span>
                          <span className="font-bold text-white">
                            {player.name} ({t('Age')} {player.age || 20})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-200 font-extrabold">
                            {player.ovr} {t('OVR')}
                          </span>
                          <span className="text-amber-400 font-extrabold">
                            {player.potentialOvr || 80} {t('POT')}
                          </span>
                          <span className="text-xs text-emerald-400 font-bold">
                            {t(playingTimeResult.evaluation.playerForm)}
                          </span>
                        </div>
                      </div>

                      {playingTimeResult.evaluation.competitorsAhead.map((comp, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                              {t('RIVAL')}
                            </span>
                            <span className="font-medium text-slate-100">
                              {comp.name} ({t('Age')} {comp.age})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-200 font-bold">
                              {comp.ovr} {t('OVR')}
                            </span>
                            <span className="text-slate-400 font-bold">
                              {comp.potential} {t('POT')}
                            </span>
                            <span className="text-xs text-slate-400">{t(comp.status)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ConsolePagedText
                    resetKey="pt-notes"
                    paragraphs={[t(playingTimeResult.managerDebrief)]}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* 4. YOUTH GET PRO TEAM */}
        {action === 'youth_get_pro_team' && activeYouthPro && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-100 text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {t('{agentName} pitched your youth academy tape to professional scouts. Choose an official professional contract to sign:', {
                  agentName: manager?.name || t('Your Agent'),
                })}
              </span>
            </div>

            {youthProOffers.length > 1 && (
              <ConsolePaginationBar
                currentPage={offerPage}
                totalPages={youthProOffers.length}
                onPageChange={setOfferPage}
                label={t('CONTRACT')}
              />
            )}

            <div className="p-4 sm:p-5 bg-slate-950 border border-slate-700 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl shrink-0">{activeYouthPro.countryFlag}</span>
                  <div>
                    <div className="font-black text-white text-base sm:text-lg flex items-center flex-wrap gap-2">
                      <span>{activeYouthPro.clubName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {t('Pro Tier')} {activeYouthPro.leagueTier}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300">
                      {activeYouthPro.leagueName} ({activeYouthPro.countryName})
                    </div>
                  </div>
                </div>

                <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex sm:block justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold block">{t('Weekly Salary')}</span>
                  <span className="text-base font-black text-emerald-400">
                    €{activeYouthPro.weeklyWage.toLocaleString()}/{t('wk')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t('Squad')}</span>
                  <span className="text-sm font-black text-blue-400">{t(activeYouthPro.squadDestination)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t('Expected Role')}</span>
                  <span className="text-sm font-black text-amber-400">{t(activeYouthPro.expectedRole)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t('Signing Bonus')}</span>
                  <span className="text-sm font-black text-purple-400">
                    €{activeYouthPro.signingBonus.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-200 italic leading-relaxed">{t(activeYouthPro.managerReview)}</p>
            </div>
          </div>
        )}

        {/* 5. YOUTH GET NEW YOUTH TEAM */}
        {action === 'youth_get_new_youth_team' && activeTopYouth && (
          <div className="space-y-4">
            <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-100 text-xs sm:text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                {t('{agentName} arranged transfers to Top-2 powerhouse academies across international youth leagues:', {
                  agentName: manager?.name || t('Your Agent'),
                })}
              </span>
            </div>

            {topYouthOffers.length > 1 && (
              <ConsolePaginationBar
                currentPage={offerPage}
                totalPages={topYouthOffers.length}
                onPageChange={setOfferPage}
                label={t('ACADEMY')}
              />
            )}

            <div className="p-4 sm:p-5 bg-slate-950 border border-slate-700 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl shrink-0">{activeTopYouth.countryFlag}</span>
                  <div>
                    <div className="font-black text-white text-base sm:text-lg flex items-center flex-wrap gap-2">
                      <span>{activeTopYouth.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                        {t(activeTopYouth.leagueStanding)}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300">
                      {activeTopYouth.youthLeague} • {activeTopYouth.city}, {activeTopYouth.country}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex sm:block justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold block">{t('Academy OVR')}</span>
                  <span className="text-base font-black text-amber-400">
                    {activeTopYouth.ovr} {t('OVR')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-0.5">
                  {t('Development Facility Perk')}
                </span>
                <span className="text-sm font-extrabold text-emerald-300">{t(activeTopYouth.developmentPerk)}</span>
              </div>

              <p className="text-sm text-slate-200 italic leading-relaxed">{t(activeTopYouth.managerPitch)}</p>
            </div>
          </div>
        )}
      </div>
    </ConsoleModalShell>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
