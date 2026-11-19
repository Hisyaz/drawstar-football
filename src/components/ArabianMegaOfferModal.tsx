import React, { useState } from 'react';
import { ClubTransferOffer } from '../utils/transferMarketSystem';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Coins,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface ArabianMegaOfferModalProps {
  isOpen: boolean;
  offer: ClubTransferOffer | null;
  player: PlayerCardData;
  onAccept: (offer: ClubTransferOffer) => void;
  onDecline: (offerId?: string) => void;
}

export const ArabianMegaOfferModal: React.FC<ArabianMegaOfferModalProps> = ({
  isOpen,
  offer,
  onAccept,
  onDecline,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'offer' | 'lifestyle' | 'mercenary'>('offer');

  if (!isOpen || !offer) return null;

  const yearlySalary = offer.yearlySalary || 45000000;
  const weeklyWage = offer.weeklyWage || Math.round(yearlySalary / 52);
  const signingBonus = offer.signingBonus || Math.round(yearlySalary * 0.2);
  const formattedFee = offer.formattedFee || '€85,000,000';
  const clubName = offer.buyerClub?.clubName || 'Saudi League Club';

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={() => onDecline(offer.id)}
      title={t('Generational Wealth Contract Proposal')}
      subtitle={`${clubName} • 🇸🇦 ${t('Saudi League Mega-Contract Event')}`}
      badge={t('ARABIAN MEGA-DEAL')}
      icon={<Coins className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-4xl"
      tabs={[
        { id: 'offer', label: t('Mega Offer') },
        { id: 'lifestyle', label: t('Empire & Lifestyle') },
        { id: 'mercenary', label: t('Mercenary Tradeoff') },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'offer' | 'lifestyle' | 'mercenary')}
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            onClick={() => onDecline(offer.id)}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-600 transition active:scale-95 cursor-pointer"
          >
            {t('DECLINE (Stay For Sporting Glory)')}
          </button>

          <button
            type="button"
            onClick={() => onAccept(offer)}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition active:scale-[0.98] border border-emerald-400/50 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span className="truncate">{t('ACCEPT THE MEGA DEAL (Sign with {club})', { club: clubName })}</span>
          </button>
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-5 text-left">
        {activeTab === 'offer' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                {t('THE ARABIAN LEAGUE COMES KNOCKING')}
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {t('Representatives from the Saudi League have arrived with a private jet and an unprecedented financial proposal that will forever alter your career and generational wealth.')}
              </p>
            </div>

            <div className="bg-slate-950/80 rounded-2xl border border-amber-500/40 p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/60 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                    🇸🇦
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-2xl font-black text-white uppercase tracking-wide truncate">
                      {clubName}
                    </div>
                    <div className="text-xs sm:text-sm text-amber-400 font-bold mt-0.5">
                      {t('Saudi League • Tier 1 Division')}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-400/40 sm:text-right shrink-0 w-full sm:w-auto flex sm:block items-center justify-between">
                  <div className="text-xs uppercase font-bold text-amber-300">{t('Offered Transfer Fee')}</div>
                  <div className="text-base sm:text-lg font-black text-amber-200 font-mono">{formattedFee}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-400">
                    {t('YEARLY SALARY')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                    €{(yearlySalary / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    €{yearlySalary.toLocaleString()}/{t('yr')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    {t('WEEKLY WAGE')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                    €{(weeklyWage / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    €{weeklyWage.toLocaleString()}/{t('week')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    {t('SIGNING BONUS')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                    €{(signingBonus / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-slate-300">{t('Immediate liquid cash to savings')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div className="space-y-4">
            <ConsolePagedText
              resetKey={`${offer.id}-lifestyle`}
              pages={[
                {
                  heading: t('GENERATIONAL EMPIRE & UPGRADES'),
                  paragraphs: [
                    t('This astronomical windfall will allow you to immediately purchase every luxury upgrade in the Lifestyle Store, establish massive global business ventures, and secure multi-generational wealth.'),
                  ],
                  node: (
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm pt-2">
                      <TrendingUp className="w-5 h-5 shrink-0" />
                      <span>{t('Unlimited Business & Lifestyle Capital Unlocked')}</span>
                    </div>
                  ),
                },
                {
                  heading: t('ZERO FINANCIAL CEILING'),
                  paragraphs: [
                    t('Never worry about training facility costs, elite kinesiologists, private cryogenic chambers, or investment capital again. You operate on an unlimited budget.'),
                  ],
                  node: (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm pt-2">
                      <Building className="w-5 h-5 shrink-0" />
                      <span>{t('Elite Recovery & Private Performance Support')}</span>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

        {activeTab === 'mercenary' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-rose-500/30">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-lg">
                <DollarSign className="w-7 h-7 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{t('THE SPORTING TRADEOFF')}</span>
                </div>
                <div className="text-lg font-black text-amber-300 uppercase tracking-wide">
                  {t('PERK: "MERCENARY"')}
                </div>
              </div>
            </div>

            <ConsolePagedText
              resetKey={`${offer.id}-mercenary`}
              paragraphs={[
                t('Taking the Arabian fortune means stepping outside the mainstream European sporting spotlight. Accepting this offer instantly awards you the permanent trait:'),
              ]}
              bullets={[
                `${t('-80% to all Fame gains')} (${t('European media spotlight diminishes')}).`,
                `${t('+20% to all future bonuses & contract renewal fees')} ${t('in your favor')}.`,
                `${t('Top European clubs become significantly less likely to sign you')} ${t('in future windows')}.`,
              ]}
            />
          </div>
        )}
      </div>
    </ConsoleModalShell>
  );
};
