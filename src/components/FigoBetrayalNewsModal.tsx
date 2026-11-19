import React, { useEffect, useState } from 'react';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/localizationSystem';
import { audioManager } from '../utils/audioSystem';
import {
  Skull,
  Flame,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Newspaper,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface FigoBetrayalNewsModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  betrayedClub: string;
  destinationClub: string;
  rivalryName?: string;
  onClose: () => void;
}

export const FigoBetrayalNewsModal: React.FC<FigoBetrayalNewsModalProps> = ({
  isOpen,
  player,
  betrayedClub,
  destinationClub,
  rivalryName,
  onClose,
}) => {
  const { currentLanguage } = useLanguage();
  const [sectionTab, setSectionTab] = useState<'story' | 'consequences'>('story');
  const [conseqPage, setConseqPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      audioManager.playWhistle();
      setSectionTab('story');
      setConseqPage(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const perkTitle =
    currentLanguage === 'es-AR'
      ? 'Traidor'
      : currentLanguage === 'es-ES'
      ? 'Judas'
      : currentLanguage === 'pt-BR'
      ? 'Judas / Traidor'
      : currentLanguage === 'fr-FR'
      ? 'Traître'
      : 'Snake';

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      showCloseButton={false}
      maxWidthClass="sm:max-w-3xl"
      accentColor="rose"
      title={`${player.name || 'STAR PLAYER'} ${t('CROSSES FORBIDDEN DIVIDE TO')} ${destinationClub.toUpperCase()}!`}
      subtitle={rivalryName ? `"${rivalryName}" ${t('Erupts into Chaos')}` : `${t('Historic Betrayal Shakes the Football World')}`}
      badge={t('BREAKING NEWS')}
      icon={<Newspaper className="w-5 h-5 text-rose-400" />}
      tabs={[
        { id: 'story', label: '1. Breaking Story' },
        { id: 'consequences', label: '2. Consequences' },
      ]}
      activeTabId={sectionTab}
      onTabChange={(id) => setSectionTab(id as 'story' | 'consequences')}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] px-6 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white font-black font-arcade text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-rose-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>{t('Embrace the Hostility & Continue')}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      }
    >
      <div className="p-4 sm:p-6 space-y-4 text-left">
        {/* Transfer Duel Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-3 bg-slate-950/80 border border-rose-500/40 rounded-xl p-3.5 shadow-inner">
          <div className="text-center flex-1 min-w-0 w-full space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('Betrayed Club')}</span>
            <div className="text-base font-black text-rose-400 truncate px-1">{betrayedClub}</div>
            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              ❌ {t('Blacklisted')}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0">
            <ArrowRight className="w-5 h-5 text-amber-400 rotate-90 sm:rotate-0" />
            <span className="text-[10px] font-black text-amber-400 uppercase">DIRECT</span>
          </div>

          <div className="text-center flex-1 min-w-0 w-full space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('New Arch-Rival')}</span>
            <div className="text-base font-black text-emerald-400 truncate px-1">{destinationClub}</div>
            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ✅ {t('New Home')}
            </span>
          </div>
        </div>

        {/* Tab 1: Story */}
        {sectionTab === 'story' && (
          <ConsolePagedText
            paragraphs={[
              `In a move sending seismic shockwaves across the continent reminiscent of legendary forbidden switches between Catalunya FC and Blancos CF, established starter ${player.name} has signed directly for arch-rival ${destinationClub}.`,
              `Enraged ${betrayedClub} supporters have flooded city squares, burning jerseys, throwing fake banknotes, and hoisting massive "${perkTitle}" banners. Club directors and ultra groups have officially declared you persona non grata.`,
            ]}
            maxCharsPerPage={360}
            textSizeClass="text-sm sm:text-base text-slate-100 leading-relaxed"
          />
        )}

        {/* Tab 2: Permanent Consequences */}
        {sectionTab === 'consequences' && (
          <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-black text-xs sm:text-sm uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{t('Permanent Career Consequences Applied')}</span>
            </div>

            <div className="md:hidden">
              <ConsolePaginationBar
                currentPage={conseqPage}
                totalPages={3}
                onPageChange={setConseqPage}
                label="IMPACT"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              <div className={`${conseqPage === 1 ? 'block' : 'hidden md:block'} bg-black/60 border border-rose-500/30 rounded-xl p-3.5 space-y-1.5`}>
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs sm:text-sm">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{t('Never Signable Again')}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <strong>{betrayedClub}</strong> will <strong>NEVER</strong> submit another contract offer or bid for you again.
                </p>
              </div>

              <div className={`${conseqPage === 2 ? 'block' : 'hidden md:block'} bg-black/60 border border-amber-500/30 rounded-xl p-3.5 space-y-1.5`}>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs sm:text-sm">
                  <Skull className="w-4 h-4 shrink-0" />
                  <span>{t('Hostile Atmosphere')}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Facing {betrayedClub} triggers deafening stadium whistles, hostile chants, and venomous pressure on every touch.
                </p>
              </div>

              <div className={`${conseqPage === 3 ? 'block' : 'hidden md:block'} bg-black/60 border border-emerald-500/30 rounded-xl p-3.5 space-y-1.5`}>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs sm:text-sm">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span>{t('Perk Unlocked')}: {perkTitle}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  You have earned the <strong>&quot;{perkTitle}&quot;</strong> Career Perk, embodying football&apos;s ultimate villain role.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ConsoleModalShell>
  );
};

