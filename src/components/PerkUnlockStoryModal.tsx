import React, { useState, useEffect } from 'react';
import { CareerPerk, getLocalizedPerk } from '../utils/perksSystem';
import { PlayerCardData } from '../types';
import { PerkIcon } from './PerkIcon';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
  Zap,
  Info,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface PerkUnlockStoryModalProps {
  isOpen: boolean;
  perk: CareerPerk | null;
  player: PlayerCardData;
  onAccept: (perk: CareerPerk) => void;
  onClose?: () => void;
}

export const PerkUnlockStoryModal: React.FC<PerkUnlockStoryModalProps> = ({
  isOpen,
  perk,
  player,
  onAccept,
}) => {
  const [page, setPage] = useState<'story' | 'perk'>('story');

  // Reset page to story whenever a new perk is opened
  useEffect(() => {
    if (isOpen && perk) {
      setPage('story');
    }
  }, [isOpen, perk?.id]);

  if (!isOpen || !perk) return null;

  const localizedPerk = getLocalizedPerk(perk);
  const activeCount = player.activePerkIds?.length || 0;
  const isFull = activeCount >= 5;

  const defaultTitle = localizedPerk.storyTitle || `Moment of Realization: ${localizedPerk.name}`;
  const defaultNarrative =
    localizedPerk.storyNarrative ||
    `Through relentless dedication, grueling battles on the pitch, and the unpredictable twists of your professional journey, you have forged a defining personal philosophy. You realize that your unique path has shaped who you are as a player and as a person.`;

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      showCloseButton={false}
      maxWidthClass="sm:max-w-2xl"
      accentColor="amber"
      title={defaultTitle}
      subtitle={`${perk.category.toUpperCase()} MOMENT • ${localizedPerk.name}`}
      badge={page === 'story' ? 'STEP 1/2' : 'STEP 2/2'}
      icon={
        page === 'story' ? (
          <Sparkles className="w-5 h-5 text-amber-400" />
        ) : (
          <Award className="w-5 h-5 text-emerald-400" />
        )
      }
      tabs={[
        { id: 'story', label: '1. Story' },
        { id: 'perk', label: '2. Perk Details' },
      ]}
      activeTabId={page}
      onTabChange={(tabId) => setPage(tabId as 'story' | 'perk')}
      footer={
        page === 'story' ? (
          <button
            type="button"
            onClick={() => setPage('perk')}
            className="w-full min-h-[48px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 font-black font-arcade text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <span>NEXT: REVEAL PERK DETAILS</span>
            <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
          </button>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => setPage('story')}
              className="min-h-[48px] sm:px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-arcade text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Story</span>
            </button>
            <button
              type="button"
              onClick={() => onAccept(perk)}
              className="flex-1 min-h-[48px] py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 font-black font-arcade text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950 stroke-[2.5] shrink-0" />
              <span className="truncate">ACCEPT PERK ({perk.name.toUpperCase()})</span>
            </button>
          </div>
        )
      }
    >
      <div className="p-4 sm:p-6 space-y-4">
        {page === 'story' ? (
          <div className="space-y-4">
            <ConsolePagedText
              paragraphs={[`“${defaultNarrative}”`]}
              maxCharsPerPage={360}
              textSizeClass="text-base sm:text-lg text-slate-100 italic font-serif leading-relaxed"
              resetKey={perk.id}
            />

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs uppercase">
                <Info className="w-4 h-4 shrink-0" />
                <span>How You Earned This</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {localizedPerk.howToObtain}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <PerkIcon iconName={localizedPerk.iconName} className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {localizedPerk.category} Perk
                </span>
                <h3 className="text-base sm:text-xl font-black text-white uppercase tracking-tight truncate">
                  {localizedPerk.name}
                </h3>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {localizedPerk.shortDescription}
            </p>

            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>WHAT IT DOES</span>
              </div>
              <div className="text-sm sm:text-base font-semibold text-emerald-100 bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-500/30 leading-relaxed">
                {localizedPerk.effect}
              </div>
            </div>

            {isFull ? (
              <div className="text-xs sm:text-sm text-amber-300 font-bold bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl text-center">
                ⚠️ Active Perk Slots Full (5/5). Accepting will let you swap or discard.
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-center">
                ✨ Open perk slots ({activeCount}/5 active). Will be added directly to traits!
              </div>
            )}
          </div>
        )}
      </div>
    </ConsoleModalShell>
  );
};

