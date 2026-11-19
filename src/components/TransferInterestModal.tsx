import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PlayerCardData, AccountingState, ManagerState } from '../types';
import { ClubTransferOffer, calculatePlayerMarketValue, isSaudiClubOffer } from '../utils/transferMarketSystem';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowRightLeft,
  Building,
  X,
  Check,
  Globe,
  TrendingUp,
  Scale,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { negotiateOfferWithClub, ManagerNegotiationDetails } from '../utils/managerInteractionSystem';
import { ConsoleModalShell, ConsolePaginationBar, ConsolePagedText } from './common/ConsolePager';

interface TransferInterestModalProps {
  isOpen: boolean;
  offers: ClubTransferOffer[];
  player: PlayerCardData;
  accounting?: AccountingState;
  manager?: ManagerState;
  onAcceptTransfer: (offer: ClubTransferOffer) => void;
  onRejectOffer: (offerId: string) => void;
  onClose: () => void;
  onOpenArabianMegaOffer?: (offer: ClubTransferOffer) => void;
}

export const TransferInterestModal: React.FC<TransferInterestModalProps> = ({
  isOpen,
  offers: initialOffers,
  player,
  manager,
  onAcceptTransfer,
  onRejectOffer,
  onClose,
  onOpenArabianMegaOffer,
}) => {
  const { t } = useLanguage();
  const [activeOffers, setActiveOffers] = useState<ClubTransferOffer[]>(initialOffers);
  const [selectedOfferId, setSelectedOfferId] = useState<string>(initialOffers[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'bids' | 'value'>('bids');
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);
  const [negotiationResult, setNegotiationResult] = useState<{
    offerId: string;
    details: ManagerNegotiationDetails;
  } | null>(null);

  React.useEffect(() => {
    setActiveOffers(initialOffers);
    if (initialOffers.length > 0 && (!selectedOfferId || !initialOffers.some((o) => o.id === selectedOfferId))) {
      setSelectedOfferId(initialOffers[0].id);
    }
  }, [initialOffers]);

  if (!isOpen) return null;

  if (activeOffers.length === 0) {
    const emptyContent = (
      <ConsoleModalShell
        isOpen={true}
        onClose={onClose}
        title={t('All Transfer Bids Withdrawn')}
        subtitle={t('TRANSFER MARKET WINDOW')}
        icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
        accentColor="amber"
        maxWidthClass="sm:max-w-lg"
        zIndexClass="z-[9999]"
        footer={
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] px-6 py-3 rounded-xl text-sm font-black bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white transition cursor-pointer active:scale-95"
          >
            {t('Back to Career')}
          </button>
        }
      >
        <div className="p-5 sm:p-6">
          <ConsolePagedText
            resetKey="withdrawn"
            paragraphs={[
              t('Contract demands exceeded what bidding clubs were willing to accommodate. Continue performing in league matches to attract new bids!'),
            ]}
          />
        </div>
      </ConsoleModalShell>
    );
    return typeof document !== 'undefined' ? createPortal(emptyContent, document.body) : emptyContent;
  }

  const mvBreakdown = calculatePlayerMarketValue(player);
  const selectedIndex = Math.max(0, activeOffers.findIndex((o) => o.id === selectedOfferId));
  const selectedOffer = activeOffers[selectedIndex] || activeOffers[0];

  const handleNegotiateTransfer = (offerToNegotiate: ClubTransferOffer) => {
    setNegotiatingId(offerToNegotiate.id);

    setTimeout(() => {
      const details = negotiateOfferWithClub(
        {
          yearlySalary: offerToNegotiate.yearlySalary,
          weeklyWage: offerToNegotiate.weeklyWage,
          contractYears: offerToNegotiate.contractYears,
          expectedRole: offerToNegotiate.expectedRole,
          proposedSquad: offerToNegotiate.proposedSquad,
          countryCode: offerToNegotiate.buyerClub.countryCode,
          countryName: offerToNegotiate.buyerClub.countryName,
          clubName: offerToNegotiate.buyerClub.clubName,
        },
        {
          ovr: player.ovr,
          potentialOvr: player.potentialOvr,
          fame: player.fame,
          position: player.position,
          subPosition: player.subPosition,
        },
        manager
      );

      setNegotiationResult({ offerId: offerToNegotiate.id, details });
      setNegotiatingId(null);

      if (details.outcome === 'dropped') {
        const remaining = activeOffers.filter((o) => o.id !== offerToNegotiate.id);
        setActiveOffers(remaining);
        if (remaining.length > 0) {
          setSelectedOfferId(remaining[0].id);
        }
      } else {
        const updated = activeOffers.map((o) => {
          if (o.id === offerToNegotiate.id) {
            return {
              ...o,
              yearlySalary: details.newSalary,
              weeklyWage: details.newWeeklyWage,
              contractYears: details.newContractYears,
              expectedRole: details.newRole as any,
              proposedSquad: details.newSquad as any,
              signingBonus: Math.round(details.newSalary * 0.18),
              isNegotiated: true,
            };
          }
          return o;
        });
        setActiveOffers(updated);
      }
    }, 600);
  };

  const renderOfferCard = (offer: ClubTransferOffer) => {
    const isSelected = offer.id === selectedOffer.id;
    const isBeingNegotiated = negotiatingId === offer.id;
    const isSaudi = isSaudiClubOffer(offer);

    return (
      <div
        key={offer.id}
        onClick={() => setSelectedOfferId(offer.id)}
        className={`p-4 pixel-corners border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 bg-slate-950 ${
          isSelected
            ? isSaudi
              ? 'border-amber-400 pixel-bevel-gold bg-amber-950/20'
              : 'border-purple-400 pixel-bevel-raised bg-purple-950/30'
            : isSaudi
            ? 'border-amber-500/50 hover:border-amber-400 pixel-bevel-sunken'
            : 'border-slate-800 hover:border-slate-700 pixel-bevel-sunken'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isSaudi ? (
              <span className="px-2 py-0.5 pixel-corners text-[10px] font-black uppercase bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-500/60 flex items-center gap-1 font-arcade">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                🇸🇦 {t('MEGA ARABIAN OFFER')}
              </span>
            ) : (
              <span className="px-2 py-0.5 pixel-corners text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 font-arcade">
                {offer.buyerClub.leagueName}
              </span>
            )}
            <span className="px-2 py-0.5 pixel-corners text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1 font-arcade">
              <Globe className="w-3 h-3 text-sky-400" />
              {offer.buyerClub.countryName}
            </span>
            {(offer as any).isNegotiated && (
              <span className="px-2 py-0.5 pixel-corners text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 font-arcade">
                <TrendingUp className="w-3 h-3" />
                {t('Negotiated')}
              </span>
            )}
          </div>

          {offer.isExpiringContractMove && (
            <span className="px-2 py-0.5 pixel-corners text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-arcade">
              {t('1-Yr Move')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 bg-gradient-to-br ${offer.buyerClub.clubBadgeBg} pixel-corners pixel-bevel-raised border border-white/20 text-white shadow-lg shrink-0`}
          >
            <Building className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black text-white pixel-text-shadow font-arcade truncate">
              {offer.buyerClub.clubName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-retro truncate">
              {t('Manager')}: <strong className="text-white">{offer.buyerClub.managerName}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 bg-slate-900 p-3 pixel-corners border border-slate-800 pixel-bevel-sunken text-xs sm:text-sm font-retro">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block font-arcade">
              {offer.isFreeAgentMove ? t('Transfer Status') : t('Transfer Fee')}
            </span>
            <span className="text-sm sm:text-base font-black text-amber-400 font-arcade mt-0.5 block">
              {offer.isFreeAgentMove ? t('Free Transfer (€0 Fee)') : offer.formattedFee}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block font-arcade">{t('Proposed Salary')}</span>
            <span className="text-sm sm:text-base font-black text-emerald-400 font-arcade mt-0.5 block">
              €{offer.weeklyWage.toLocaleString()} / {t('wk')}
            </span>
          </div>
          <div className="col-span-2 pt-1.5 border-t border-slate-800 flex items-center justify-between flex-wrap gap-1 text-xs text-slate-200">
            <span>
              {t('Squad')}: <strong className="text-white">{t(offer.proposedSquad)}</strong>
            </span>
            <span>
              {t('Role')}: <strong className="text-amber-300">{t(offer.expectedRole)}</strong>
            </span>
          </div>
          {offer.playerTransferFeeCutPercent && offer.playerTransferFeeCutPercent > 0 && !offer.isFreeAgentMove && (
            <div className="col-span-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold font-arcade">
                {t('Player Transfer Cut')} ({offer.playerTransferFeeCutPercent}%):
              </span>
              <span className="text-emerald-300 font-black font-arcade">
                +€{Math.round((offer.offeredFee || 0) * (offer.playerTransferFeeCutPercent / 100)).toLocaleString()}
              </span>
            </div>
          )}
          {offer.isFreeAgentMove && (
            <div className="col-span-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-purple-300 font-bold font-arcade">{t('Free Agent Signing Bonus')}:</span>
              <span className="text-purple-200 font-black font-arcade">
                +€{(offer.signingBonus || 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {!(offer as any).isNegotiated && (
          <button
            type="button"
            disabled={isBeingNegotiated}
            onClick={(e) => {
              e.stopPropagation();
              handleNegotiateTransfer(offer);
            }}
            className="w-full min-h-[44px] py-2.5 px-3 pixel-corners bg-slate-900 hover:bg-slate-800 border border-slate-700 pixel-bevel-raised text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-arcade"
          >
            <Scale className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{isBeingNegotiated ? t('Negotiating...') : t('Agent: Negotiate Terms')}</span>
          </button>
        )}
      </div>
    );
  };

  const modalContent = (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t('Official Transfer Bids Received ({count})', { count: activeOffers.length })}
      subtitle={`${t('Estimated Market Value')}: ${mvBreakdown.formattedValue}`}
      badge={t('TRANSFER MARKET WINDOW')}
      icon={<ArrowRightLeft className="w-5 h-5 text-purple-300" />}
      accentColor="purple"
      maxWidthClass="sm:max-w-5xl"
      zIndexClass="z-[9999]"
      tabs={[
        { id: 'bids', label: t('Club Bids'), badge: activeOffers.length },
        { id: 'value', label: t('Market Value') },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'bids' | 'value')}
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full font-arcade">
          <div className="text-xs sm:text-sm text-slate-300 text-center sm:text-left truncate">
            {t('Selected Transfer')}: <strong className="text-white">{selectedOffer.buyerClub.clubName}</strong> ({selectedOffer.formattedFee})
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onRejectOffer(selectedOffer.id)}
              className="min-h-[46px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 pixel-corners pixel-bevel-raised text-xs sm:text-sm font-bold border border-slate-600 transition cursor-pointer active:translate-y-0.5"
            >
              {t('Decline Offer')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (isSaudiClubOffer(selectedOffer) && !player.hasSeenSaudiOfferEvent && onOpenArabianMegaOffer) {
                  onOpenArabianMegaOffer(selectedOffer);
                } else {
                  onAcceptTransfer(selectedOffer);
                }
              }}
              className="min-h-[48px] px-6 py-2.5 pixel-corners text-xs sm:text-sm font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 pixel-bevel-raised shadow-lg shadow-purple-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5"
            >
              <Check className="w-4 h-4 stroke-[3] shrink-0" />
              <span>{t('Accept Transfer & Join')}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="p-3.5 sm:p-5 space-y-4">
        {negotiationResult && (
          <div
            className={`p-3.5 pixel-corners border-2 text-xs sm:text-sm flex items-start justify-between gap-3 ${
              negotiationResult.details.outcome === 'success'
                ? 'bg-emerald-950 border-emerald-500/80 text-emerald-100'
                : negotiationResult.details.outcome === 'partial'
                ? 'bg-sky-950 border-sky-500/80 text-sky-100'
                : 'bg-rose-950 border-rose-500/80 text-rose-100'
            }`}
          >
            <div className="space-y-1 flex-1">
              <span className="font-bold uppercase tracking-wider text-xs block font-arcade">
                {negotiationResult.details.outcome === 'success'
                  ? `🎉 ${t('Transfer Terms Upgraded!')}`
                  : negotiationResult.details.outcome === 'partial'
                  ? `🤝 ${t('Partial Wage Concession')}`
                  : `⚠️ ${t('Transfer Bid Withdrawn')}`}
              </span>
              <p className="text-sm leading-relaxed font-retro">{t(negotiationResult.details.clubResponse)}</p>
            </div>
            <button
              type="button"
              onClick={() => setNegotiationResult(null)}
              aria-label="Dismiss"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'bids' && (
          <div className="space-y-3.5">
            {/* Mobile console pager: 1 bid per page cleanly without long vertical scrolling */}
            {activeOffers.length > 1 && (
              <div className="md:hidden">
                <ConsolePaginationBar
                  currentPage={selectedIndex + 1}
                  totalPages={activeOffers.length}
                  onPageChange={(page) => {
                    const target = activeOffers[page - 1];
                    if (target) setSelectedOfferId(target.id);
                  }}
                  label={t('BID')}
                />
              </div>
            )}

            <div className="md:hidden">{renderOfferCard(selectedOffer)}</div>

            <div className="hidden md:grid md:grid-cols-2 gap-3.5">
              {activeOffers.map((offer) => renderOfferCard(offer))}
            </div>
          </div>
        )}

        {activeTab === 'value' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 pixel-corners border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block font-arcade">
                  {t('Estimated Market Value')}
                </span>
                <span className="text-2xl font-black text-amber-400 font-arcade">{mvBreakdown.formattedValue}</span>
              </div>
              <div className="text-sm text-slate-200 font-retro">
                <span className="font-bold text-white">{player.ovr} {t('OVR')}</span> ({mvBreakdown.ovrWeight}%) •{' '}
                <span className="font-bold text-amber-300">{player.potentialOvr} {t('Potential')}</span> ({mvBreakdown.potentialWeight}%)
                <div className="text-xs text-slate-400 mt-0.5">
                  {t('Fame Multiplier')}: <strong>{mvBreakdown.fameMultiplier}x</strong> ({player.fame || 0} {t('Fame')})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-arcade text-xs">
              <div className="bg-slate-950 p-3 pixel-corners border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('Weighted Score')}</span>
                <span className="text-white font-bold text-sm">{mvBreakdown.weightedAbilityScore}</span>
              </div>
              <div className="bg-slate-950 p-3 pixel-corners border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('Fame Multiplier')}</span>
                <span className="text-amber-400 font-bold text-sm">{mvBreakdown.fameMultiplier}x</span>
              </div>
              <div className="bg-slate-950 p-3 pixel-corners border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('Contract Factor')}</span>
                <span className="text-sky-400 font-bold text-sm">{mvBreakdown.contractLengthMultiplier}x</span>
              </div>
              <div className="bg-slate-950 p-3 pixel-corners border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('Reputation Factor')}</span>
                <span className="text-emerald-400 font-bold text-sm">{mvBreakdown.badRepMultiplier}x</span>
              </div>
            </div>

            <ConsolePagedText
              resetKey="mv-engine"
              pages={[
                {
                  heading: t('Progressive Market Value Engine'),
                  paragraphs: [
                    t('Market Value uses a continuous formula combining weighted current OVR and Potential. Fame acts as a continuous multiplier without hard caps, while contract length and bad reputation adjust negotiating power.'),
                  ],
                },
              ]}
            />
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
