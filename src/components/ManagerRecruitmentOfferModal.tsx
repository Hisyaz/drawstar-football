import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { ManagerState, PlayerCardData } from '../types';
import { MANAGER_TYPE_PROFILES, ManagerTypeProfile } from '../utils/managerInteractionSystem';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePaginationBar, ConsolePagedText } from './common/ConsolePager';

interface ManagerRecruitmentOfferModalProps {
  isOpen: boolean;
  offers: ManagerState[];
  player: PlayerCardData;
  onSelectManager: (selectedManager: ManagerState) => void;
  onDeclineAll: () => void;
}

export const ManagerRecruitmentOfferModal: React.FC<ManagerRecruitmentOfferModalProps> = ({
  isOpen,
  offers,
  player,
  onSelectManager,
  onDeclineAll,
}) => {
  const { t } = useLanguage();
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'terms' | 'dossier'>('terms');

  if (!isOpen || !offers || offers.length === 0) return null;

  const safeIdx = Math.min(selectedOfferIndex, offers.length - 1);
  const currentOffer = offers[safeIdx] || offers[0];
  const typeProfile: ManagerTypeProfile =
    MANAGER_TYPE_PROFILES[currentOffer.managerType || 'professional'] ||
    MANAGER_TYPE_PROFILES.professional;

  const content = (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onDeclineAll}
      title={
        offers.length === 1
          ? t('Agent Representation Pitch')
          : t('Agency Representation Offers ({count})', { count: offers.length })
      }
      subtitle={`${t('Fame')}: ${player.fame || 0} • ${t('OVR')}: ${player.ovr || 55}`}
      badge={t('AGENT REPRESENTATION')}
      icon={<Briefcase className="w-5 h-5 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-5xl"
      zIndexClass="z-[9999]"
      tabs={[
        { id: 'terms', label: t('Profile & Impact') },
        { id: 'dossier', label: t('Agent Dossier & Bio') },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'terms' | 'dossier')}
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            onClick={onDeclineAll}
            className="min-h-[46px] px-6 py-3 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition active:scale-95"
          >
            {t('Stay Self-Managed')}
          </button>

          <button
            type="button"
            onClick={() => onSelectManager(currentOffer)}
            className="min-h-[48px] px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer transition active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5] shrink-0" />
            <span>{t('Sign Representation Contract')}</span>
          </button>
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-4 text-left">
        {/* Multi-Offer Selector: Mobile Console Pagination Bar + Desktop Candidate Strip */}
        {offers.length > 1 && (
          <div className="space-y-2">
            <div className="sm:hidden">
              <ConsolePaginationBar
                currentPage={safeIdx + 1}
                totalPages={offers.length}
                onPageChange={(page) => setSelectedOfferIndex(page - 1)}
                label={t('CANDIDATE')}
              />
            </div>

            <div className="hidden sm:grid sm:grid-cols-3 gap-2.5">
              {offers.map((offer, idx) => {
                const isSelected = safeIdx === idx;
                const profile =
                  MANAGER_TYPE_PROFILES[offer.managerType || 'professional'] ||
                  MANAGER_TYPE_PROFILES.professional;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedOfferIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded text-white bg-gradient-to-r ${profile.badgeColor} uppercase`}
                      >
                        {t(profile.title)}
                      </span>
                      {offer.isNewCardGuaranteed && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 uppercase">
                          ✨ NEW
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black text-white truncate">{offer.name}</div>
                    <div className="flex items-center justify-between text-xs text-slate-300 pt-1.5 border-t border-slate-800 font-mono">
                      <span>
                        {t('Neg')}: <strong className="text-blue-400">{offer.negotiation}</strong>
                      </span>
                      <span>
                        {t('Net')}: <strong className="text-amber-400">{offer.network}</strong>
                      </span>
                      <span>
                        {t('Mkt')}: <strong className="text-emerald-400">{offer.marketing}</strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Agent Identity Header */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-lg text-white bg-gradient-to-r ${typeProfile.badgeColor} uppercase tracking-wide`}
                >
                  {t(typeProfile.title)}
                </span>
                {currentOffer.isNewCardGuaranteed && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-yellow-400 text-slate-950 uppercase tracking-wider">
                    ✨ NEW CARD GUARANTEE
                  </span>
                )}
                {currentOffer.associatedClubName && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">
                    🏛️ {currentOffer.associatedClubName}
                  </span>
                )}
                {currentOffer.tier && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg uppercase">
                    {t(currentOffer.tier)} {t('Tier')}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {currentOffer.name}
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/90 font-medium italic">
                "{t(typeProfile.tagline)}"
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 shrink-0">
              <div className="bg-slate-900 px-3 py-2.5 rounded-xl border border-blue-500/40 text-center">
                <div className="text-[11px] font-bold text-slate-300 uppercase">{t('Negotiation')}</div>
                <div className="text-lg sm:text-xl font-black text-blue-400 font-mono">{currentOffer.negotiation}</div>
              </div>
              <div className="bg-slate-900 px-3 py-2.5 rounded-xl border border-amber-500/40 text-center">
                <div className="text-[11px] font-bold text-slate-300 uppercase">{t('Network')}</div>
                <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">{currentOffer.network}</div>
              </div>
              <div className="bg-slate-900 px-3 py-2.5 rounded-xl border border-emerald-500/40 text-center">
                <div className="text-[11px] font-bold text-slate-300 uppercase">{t('Marketing')}</div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">{currentOffer.marketing}</div>
              </div>
            </div>
          </div>

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 text-emerald-300">
                  <TrendingUp className="w-4 h-4 shrink-0 mt-1" />
                  <span>
                    <strong>{t('Development')}:</strong> {t(typeProfile.developmentBonus)}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-amber-200">
                  <DollarSign className="w-4 h-4 shrink-0 mt-1" />
                  <span>
                    <strong>{t('Financials')}:</strong> {t(typeProfile.financialBonus)}
                  </span>
                </div>
                {typeProfile.riskFactor && (
                  <div className="flex items-start gap-2.5 text-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-1" />
                    <span>
                      <strong>{t('Risk Warning')}:</strong> {t(typeProfile.riskFactor)}
                    </span>
                  </div>
                )}
              </div>

              {currentOffer.specialTrait && (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-blue-500/15 border border-amber-500/40 rounded-xl flex items-start gap-2.5 text-sm text-amber-100">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t('Signature Trait')}:</strong> {t(currentOffer.specialTrait)}
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dossier' && (
            <ConsolePagedText
              resetKey={`${currentOffer.name}-${safeIdx}`}
              pages={[
                {
                  heading: currentOffer.agencyName || t('Independent Agency'),
                  paragraphs: [t(currentOffer.bio || typeProfile.description)],
                },
              ]}
            />
          )}
        </div>
      </div>
    </ConsoleModalShell>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
