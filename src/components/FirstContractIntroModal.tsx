import React, { useState, useEffect } from 'react';
import { PlayerCardData } from '../types';
import { ProContractOffer } from '../types/streetCards';
import { generateFirstContractIntro, IntroNarrative } from '../utils/firstContractIntroEngine';
import { ArrowRight, Building, Globe, Trophy, RefreshCw } from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface FirstContractIntroModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  offer: ProContractOffer;
  onProceedToCareer: () => void;
}

export const FirstContractIntroModal: React.FC<FirstContractIntroModalProps> = ({
  isOpen,
  player,
  offer,
  onProceedToCareer,
}) => {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const intro: IntroNarrative = generateFirstContractIntro(player, offer, variant);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onProceedToCareer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onProceedToCareer]);

  if (!isOpen) return null;

  const toggleVariant = () => {
    setVariant((prev) => (prev === 'A' ? 'B' : 'A'));
  };

  const narrativeParagraphs = intro.narrativeText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      title={offer.clubName}
      subtitle={`${offer.leagueName} • ${offer.countryName}`}
      badge={intro.badgeText}
      icon={<Building className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-3xl"
      showCloseButton={false}
      headerRight={
        <button
          type="button"
          onClick={toggleVariant}
          className="min-h-[44px] px-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          title="Switch intro story perspective"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Variant {intro.variant}</span>
        </button>
      }
      bodyClassName="p-4 sm:p-6 space-y-4 font-pixel"
      footer={
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onProceedToCareer}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 pixel-bevel-gold shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 group active:scale-95 font-pixel uppercase"
          >
            <Trophy className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="truncate">ENTER CAREER MODE WITH {offer.clubName.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>
      }
    >
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs font-retro text-amber-400 font-bold">
          <span>{offer.leagueName}</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-sky-400" /> {offer.countryName}
          </span>
        </div>
        <h3 className="text-sm sm:text-base font-black text-amber-300 tracking-wide uppercase font-arcade">
          {intro.title}
        </h3>
      </div>

      {/* Contract Assignment Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block font-pixel">Squad Assigned</span>
          <span className="font-black text-emerald-400 text-xs sm:text-sm mt-0.5 block font-arcade truncate">{offer.initialSquadDestination || 'First Team'}</span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block font-pixel">Expected Role</span>
          <span className="font-black text-amber-300 text-xs sm:text-sm mt-0.5 block font-arcade truncate">{offer.expectedRole || 'Starter'}</span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block font-pixel">Contract Length</span>
          <span className="font-black text-white text-xs sm:text-sm mt-0.5 block font-arcade">{offer.contractYears} Years</span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block font-pixel">Weekly Salary</span>
          <span className="font-black text-emerald-400 text-xs sm:text-sm font-arcade mt-0.5 block">€{offer.weeklyWage?.toLocaleString()}/wk</span>
        </div>
      </div>

      {/* Full-Width Paged Narrative Reader */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <ConsolePagedText
          paragraphs={narrativeParagraphs}
          resetKey={`${offer.id}-${variant}`}
          textSizeClass="text-sm sm:text-base"
          maxCharsPerPage={360}
        />
      </div>
    </ConsoleModalShell>
  );
};

