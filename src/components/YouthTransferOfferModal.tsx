import React, { useState } from 'react';
import { PlayerConfig, PlayerCardData } from '../types';
import { YouthTransferOffer } from '../utils/transferRequestSystem';
import {
  GraduationCap,
  Globe,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface YouthTransferOfferModalProps {
  isOpen: boolean;
  player: PlayerConfig | PlayerCardData;
  offers: YouthTransferOffer[];
  onAcceptOffer: (offer: YouthTransferOffer) => void;
  onClose: () => void;
}

export const YouthTransferOfferModal: React.FC<YouthTransferOfferModalProps> = ({
  isOpen,
  player,
  offers,
  onAcceptOffer,
  onClose,
}) => {
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);

  if (!isOpen || offers.length === 0) return null;

  const safeIndex = Math.min(selectedOfferIndex, offers.length - 1);
  const currentOffer = offers[safeIndex] || offers[0];

  const renderDetailCard = () => (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>{currentOffer.academyTier}</span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
            <span>{currentOffer.flag}</span>
            <span className="truncate">{currentOffer.destinationClub}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentOffer.destinationLeague} • {currentOffer.destinationCity}, {currentOffer.destinationCountry}
          </p>
        </div>
        <div className="p-2.5 bg-indigo-950/60 rounded-xl border border-indigo-500/30 text-center shrink-0">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Rating</span>
          <span className="text-base font-black text-indigo-300 font-arcade">{currentOffer.ovr}</span>
        </div>
      </div>

      {currentOffer.developmentStyle && (
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Tactical Philosophy & School
          </span>
          <span className="text-sm font-bold text-indigo-200 flex items-center gap-1.5 capitalize">
            <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
            {currentOffer.developmentStyle.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      <ConsolePagedText
        resetKey={currentOffer.id}
        textSizeClass="text-sm"
        pages={[
          currentOffer.isInternational
            ? {
                heading: 'International Youth Pathway & Earned Nationality',
                paragraphs: [
                  `By transferring to ${currentOffer.destinationClub}, you will develop inside ${currentOffer.destinationCountry}’s football academy ecosystem. Upon turning 18, you will officially earn ${currentOffer.destinationCountry} nationality alongside your primary ${player.nationality?.name || player.country || 'original'} nationality.`,
                ],
                bullets: [
                  'Primary citizenship preserved • Full eligibility upon turning 18',
                  `Scouting note: “${currentOffer.reason}”`,
                ],
              }
            : {
                heading: 'Domestic Academy Development',
                paragraphs: [
                  `Continue developing within your home country’s youth system with competitive league matches and direct first-team scout observation.`,
                ],
                bullets: [`Scouting note: “${currentOffer.reason}”`],
              },
        ]}
      />
    </div>
  );

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      id="youth-transfer-offer-modal"
      title="Youth Academy Transfer Offers"
      subtitle={`Current: ${player.club || player.youthTeamName || 'Youth Academy'} • ${player.nationality?.name || player.country || 'Citizen'}`}
      badge="YOUTH LEAGUE TRANSFER WINDOW"
      icon={
        currentOffer.isInternational ? (
          <Globe className="w-5 h-5 text-cyan-300" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-indigo-300" />
        )
      }
      accentColor="blue"
      maxWidthClass="sm:max-w-4xl"
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer uppercase"
          >
            Stay at Current Academy
          </button>
          <button
            type="button"
            onClick={() => onAcceptOffer(currentOffer)}
            className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer uppercase"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Accept & Join {currentOffer.destinationClub}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      }
    >
      {/* Mobile: 1 Offer per Console Page */}
      <div className="lg:hidden space-y-4">
        <ConsolePaginationBar
          currentPage={safeIndex + 1}
          totalPages={offers.length}
          onPageChange={(page) => setSelectedOfferIndex(page - 1)}
          label={`Offer ${safeIndex + 1} of ${offers.length}`}
        />
        {renderDetailCard()}
      </div>

      {/* Desktop: Sidebar Offer List + Detail Pane */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-2.5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Eligible Youth Academies ({offers.length})
          </h3>
          <div className="space-y-2">
            {offers.map((offer, idx) => {
              const isSelected = idx === safeIndex;
              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setSelectedOfferIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[56px] ${
                    isSelected
                      ? 'bg-indigo-950 border-indigo-400 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{offer.flag}</span>
                      <span className="font-black text-xs text-white truncate">{offer.destinationClub}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {offer.destinationLeague} • {offer.destinationCountry}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        offer.isInternational
                          ? 'bg-cyan-950 border border-cyan-400/40 text-cyan-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {offer.isInternational ? 'Dual Passport' : 'Domestic'}
                    </span>
                    <span className="text-[11px] text-indigo-300 font-bold mt-1 font-arcade">
                      {offer.ovr} OVR
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-950/60 p-4 rounded-xl border border-indigo-500/30">
          {renderDetailCard()}
        </div>
      </div>
    </ConsoleModalShell>
  );
};
