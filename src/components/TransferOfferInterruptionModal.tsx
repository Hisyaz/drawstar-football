import React, { useEffect } from 'react';
import { UnifiedClubOffer } from '../utils/clubOfferSystem';
import { PlayerConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  DollarSign,
  Calendar,
  Award,
  Check,
  Clock,
  X,
} from 'lucide-react';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';
import { ConsoleModalShell } from './common/ConsolePager';

interface TransferOfferInterruptionModalProps {
  isOpen: boolean;
  offer: UnifiedClubOffer | null;
  player: PlayerConfig;
  onAccept: (offer: UnifiedClubOffer) => void;
  onWait: (offer: UnifiedClubOffer) => void;
  onDecline: (offer: UnifiedClubOffer) => void;
}

export const TransferOfferInterruptionModal: React.FC<TransferOfferInterruptionModalProps> = ({
  isOpen,
  offer,
  player,
  onAccept,
  onWait,
  onDecline,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      audioManager.playCardFlipSound();
      haptics.firmImpact();
    }
  }, [isOpen]);

  // Keyboard navigation support (1 = YES, 2 = WAIT, 3 / Esc = NO)
  useEffect(() => {
    if (!isOpen || !offer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === 'y' || e.key === 'Y' || e.key === 'Enter') {
        e.preventDefault();
        onAccept(offer);
      } else if (e.key === '2' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        onWait(offer);
      } else if (e.key === '3' || e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
        e.preventDefault();
        onDecline(offer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, offer, onAccept, onWait, onDecline]);

  if (!isOpen || !offer) return null;

  const isRenewal = offer.isRenewalOffer || offer.transferType === 'club_renewal';
  const yearly = offer.yearlySalary || offer.weeklyWage * 52;
  const weekly = offer.weeklyWage || Math.round(yearly / 52);

  return (
    <ConsoleModalShell
      id="transfer-offer-interruption-modal"
      isOpen={isOpen}
      showCloseButton={false}
      closeDisabled={true}
      title={isRenewal ? t('CONTRACT EXTENSION SUBMITTED') : t('OFFICIAL TRANSFER BID RECEIVED')}
      subtitle={`${offer.buyerClub?.clubName || ''} • ${offer.leagueName || ''}`}
      badge={`🚨 ${t('OFFER INTERRUPTION • SIMULATION PAUSED')}`}
      accentColor="amber"
      maxWidthClass="sm:max-w-2xl"
      zIndexClass="z-[9999]"
      icon={
        <div
          className={`w-full h-full rounded-lg flex items-center justify-center font-arcade font-black text-base text-white bg-gradient-to-br ${
            offer.clubBadgeBg || 'from-amber-600 to-slate-900'
          }`}
        >
          {offer.buyerClub?.clubName?.charAt(0) || 'C'}
        </div>
      }
      footer={
        <div className="space-y-2 w-full">
          <div className="text-[11px] font-mono text-slate-300 uppercase text-center">
            {t('SELECT YOUR RESPONSE (SIMULATION AUTOMATICALLY RESUMES AFTERWARDS)')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              id="interruption-accept-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => onAccept(offer)}
              className="min-h-[48px] py-3 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-emerald-300 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer rounded-xl"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>YES (ACCEPT)</span>
              <span className="text-[10px] font-mono opacity-80 ml-1 hidden sm:inline">[1]</span>
            </button>

            <button
              id="interruption-wait-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => onWait(offer)}
              className="min-h-[48px] py-3 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-300 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer rounded-xl"
              title="Save this offer in your Transfer Hub to decide later"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>WAIT (LATER)</span>
              <span className="text-[10px] font-mono opacity-80 ml-1 hidden sm:inline">[2]</span>
            </button>

            <button
              id="interruption-decline-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => onDecline(offer)}
              className="min-h-[48px] py-3 px-3 bg-rose-700 hover:bg-rose-600 text-white border-2 border-rose-400 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer rounded-xl"
            >
              <X className="w-4 h-4 shrink-0" />
              <span>NO (DECLINE)</span>
              <span className="text-[10px] font-mono opacity-80 ml-1 hidden sm:inline">[3]</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="p-4 sm:p-5 space-y-4 text-left">
        {/* Club Identity Banner */}
        <div className="p-3.5 sm:p-4 bg-slate-950/90 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-arcade font-black text-lg border-2 border-amber-400/80 shrink-0 text-white shadow-md bg-gradient-to-br ${
                offer.clubBadgeBg || 'from-amber-600 to-slate-900'
              }`}
            >
              {offer.buyerClub?.clubName?.charAt(0) || 'C'}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black font-arcade text-white uppercase tracking-tight truncate">
                {offer.buyerClub?.clubName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-mono flex items-center gap-1.5 flex-wrap">
                <span>{offer.leagueName}</span>
                <span className="text-slate-600">•</span>
                <span>{offer.countryName}</span>
                {offer.isEuropean && (
                  <span className="px-1.5 py-0.5 bg-blue-900/80 border border-blue-500/50 text-[10px] text-blue-200 rounded">
                    Euro
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="sm:text-right shrink-0 flex sm:block items-center justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <span className="text-xs font-mono text-slate-400 uppercase block">TRANSFER FEE</span>
            <span className="text-base sm:text-lg font-arcade font-black text-amber-400">
              {offer.formattedFee || '€0'}
            </span>
          </div>
        </div>

        {/* Financial Package Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>SALARY & WAGE</span>
            </span>
            <div className="mt-1.5">
              <p className="text-base sm:text-lg font-arcade font-black text-emerald-400">
                €{yearly.toLocaleString()}
              </p>
              <p className="text-xs font-mono text-slate-300">€{weekly.toLocaleString()}/wk</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>CONTRACT LENGTH</span>
            </span>
            <div className="mt-1.5">
              <p className="text-base sm:text-lg font-arcade font-black text-sky-300">
                {offer.contractYears || 3} YEARS
              </p>
              <p className="text-xs font-mono text-indigo-300">
                Release: €{((offer.releaseClause || 20000000) / 1000000).toFixed(0)}M
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>SIGNING BONUS</span>
            </span>
            <div className="mt-1.5">
              <p className="text-base sm:text-lg font-arcade font-black text-amber-300">
                +€{(offer.signingBonus || 0).toLocaleString()}
              </p>
              <p className="text-xs font-mono text-slate-300">Directly into Savings</p>
            </div>
          </div>
        </div>

        {/* Squad Role & Tactic Context */}
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-mono">
          <span className="text-slate-300">
            Role: <strong className="text-white">{offer.squadRole || offer.expectedRole || 'Starter'}</strong> (
            {offer.initialSquadDestination || 'First Team'})
          </span>
          <span className="text-emerald-400 font-bold">
            Playstyle: {offer.expectedPlaystyle || player.playStyle || 'Balanced'}
          </span>
        </div>
      </div>
    </ConsoleModalShell>
  );
};
