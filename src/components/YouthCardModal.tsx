import React, { useState } from 'react';
import { PlayerConfig } from '../types';
import { YouthCardInstance } from '../types/youthLeagueCards';
import { CardVisualRenderer, UniversalCardCategory } from './CardVisualRenderer';
import { Award, Lock, Sparkles, ArrowRight, Check, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isTestModeEnabled } from '../utils/testModeSystem';
import { drawThreeYouthCards, getAllAvailableYouthCards } from '../utils/youthLeagueCardSystem';
import { TestCardPickerModal } from './TestCardPickerModal';
import { ChoiceSystem } from './ChoiceSystem';
import { isDisasterCard, getChampionCredits, deductChampionCredits } from '../utils/storeCollectionSystem';
import { isRerollUnlocked } from '../utils/cardDustSystem';
import { haptics } from '../utils/hapticsSystem';
import { audioManager } from '../utils/audioSystem';
import { DisasterDestructionSequence } from './DisasterDestructionSequence';
import { ConsoleModalShell } from './common/ConsolePager';

interface YouthCardModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  seasonLabel: string; // e.g. "Mid-Season Draw (Dec-Jan)" or "Pre-Season Draw (Jul-Aug)"
  drawnCards: YouthCardInstance[];
  onSelectCard: (selectedCard: YouthCardInstance) => void;
  onRedrawCards?: () => void;
  canUseFreeReroll?: boolean;
  onUseFreeReroll?: () => void;
  showToast?: (msg: string) => void;
}

export const YouthCardModal: React.FC<YouthCardModalProps> = ({
  isOpen,
  player,
  seasonLabel,
  drawnCards: initialDrawnCards,
  onSelectCard,
  onRedrawCards,
  canUseFreeReroll = false,
  onUseFreeReroll,
  showToast,
}) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'pack_intro' | 'disaster_resolution' | 'selection'>('pack_intro');
  const [internalCards, setInternalCards] = useState<YouthCardInstance[]>(initialDrawnCards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showCardPicker, setShowCardPicker] = useState<boolean>(false);

  const isTestMode = isTestModeEnabled();
  const currentCards = internalCards && internalCards.length > 0 ? internalCards : initialDrawnCards;

  React.useEffect(() => {
    if (isOpen) {
      if (initialDrawnCards && initialDrawnCards.length > 0) {
        setInternalCards(initialDrawnCards);
      }
      setCurrentIndex(0);
      setPhase('pack_intro');
    }
  }, [isOpen, initialDrawnCards]);

  const allAvailableYouthCards = React.useMemo(() => {
    return getAllAvailableYouthCards();
  }, []);

  if (!isOpen || !currentCards || currentCards.length === 0) return null;

  const selectedCard = currentCards[currentIndex] || currentCards[0];

  const handleOpenPack = () => {
    if (currentCards.some(isDisasterCard)) {
      setPhase('disaster_resolution');
    } else {
      setPhase('selection');
    }
  };

  const handleConfirmSelection = (card: YouthCardInstance) => {
    onSelectCard(card);
  };

  const getUniversalCategory = (card: YouthCardInstance): UniversalCardCategory => {
    if (card.category === 'negative_youth') return 'negative';
    if (card.category === 'double_edged') return 'double_edged';
    if (card.category === 'iconic_youth' || card.rarity === 'Iconic') return 'iconic';
    return 'positive';
  };

  const handleRedraw = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onRedrawCards) {
      onRedrawCards();
    } else {
      const hasMgr = Boolean((player as any).managerState || player.managerName);
      const newDrawn = drawThreeYouthCards(hasMgr);
      setInternalCards(newDrawn);
      setCurrentIndex(0);
    }
  };

  const handlePaidReroll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isRerollUnlocked()) return;
    const creds = getChampionCredits();
    if (creds < 5) {
      haptics.errorBuzz();
      return;
    }
    deductChampionCredits(5);
    haptics.impactMedium();
    const hasMgr = Boolean((player as any).managerState || player.managerName);
    const newDrawn = drawThreeYouthCards(hasMgr);
    setInternalCards(newDrawn);
    setCurrentIndex(0);
  };

  const handleFreeCareerReroll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canUseFreeReroll) return;
    audioManager.playRerollDiceSound();
    haptics.mediumTap();
    const hasMgr = Boolean((player as any).managerState || player.managerName);
    const newDrawn = drawThreeYouthCards(hasMgr);
    setInternalCards(newDrawn);
    setCurrentIndex(0);
    onUseFreeReroll?.();
    if (showToast) {
      showToast('🎲 1× Free Career Reroll used! Fresh Youth cards drawn.');
    }
  };

  const handleSelectFromPicker = (pickedCard: YouthCardInstance) => {
    if (!currentCards.some((c) => c.instanceId === pickedCard.instanceId)) {
      setInternalCards([pickedCard, ...currentCards.slice(0, 2)]);
    }
    setCurrentIndex(0);
    setPhase('selection');
    setShowCardPicker(false);
  };

  const subclass =
    selectedCard.category === 'negative_youth'
      ? 'setback'
      : selectedCard.category === 'double_edged'
      ? 'double_edged'
      : 'development';

  return (
    <>
      {/* Test Mode Card Picker Modal */}
      {showCardPicker && (
        <TestCardPickerModal
          isOpen={showCardPicker}
          title="Youth Academy Cards • Test Mode Picker"
          subtitle="All Youth Academy cards sorted from Highest to Lowest Tier (Iconic → Legendary → Gold → Silver → Bronze)"
          cards={allAvailableYouthCards}
          onSelectCard={handleSelectFromPicker}
          onClose={() => setShowCardPicker(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: 32-BIT RETRO INTRO */}
      {/* ========================================================================= */}
      {phase === 'pack_intro' && (
        <ConsoleModalShell
          isOpen={isOpen}
          onClose={handleOpenPack}
          showCloseButton={false}
          zIndexClass="z-[9999]"
          title={t('YOUTH_MODAL_TITLE')}
          subtitle={t('YOUTH_MODAL_SUBTITLE')}
          badge={`${t('YOUTH_MODAL_BADGE')} • ${seasonLabel.toUpperCase()}`}
          icon={<Award className="w-5 h-5 text-sky-400" />}
          accentColor="sky"
          maxWidthClass="sm:max-w-xl"
          bodyClassName="p-4 sm:p-5 space-y-4"
          footer={
            <div className="space-y-2.5">
              {!isTestMode && canUseFreeReroll && (
                <button
                  type="button"
                  onClick={handleFreeCareerReroll}
                  className="w-full min-h-[44px] py-2 px-3.5 bg-emerald-950 hover:bg-emerald-900 border-2 border-emerald-400 rounded-xl text-emerald-200 font-black text-xs uppercase flex items-center justify-between gap-2 cursor-pointer active:scale-95 shadow-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">🎲 FREE REROLL (1× PER CAREER)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[11px] font-black shrink-0">
                    FREE
                  </span>
                </button>
              )}
              {isTestMode && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleRedraw}
                    className="min-h-[44px] py-2 px-3 bg-sky-950 hover:bg-sky-900 border border-sky-400 rounded-xl text-sky-300 font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>🎲 RE-DRAW</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardPicker(true)}
                    className="min-h-[44px] py-2 px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-400 rounded-xl text-emerald-300 font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>🎴 PICK CARD</span>
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={handleOpenPack}
                className="w-full min-h-[48px] bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl border-2 border-sky-200 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <span>REVEAL & SELECT YOUTH CARD</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-sky-400 uppercase">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>ACADEMY GROWTH</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Development drills, breakthrough matches, coaching feedback, or physical milestones.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>YOUTH PROGRESSION</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Select the best trajectory for your youth league development season.
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-950 border border-sky-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-sky-900 border border-sky-500 rounded-lg text-sky-300 flex items-center justify-center font-black text-base shrink-0">
                🏅
              </div>
              <div className="text-left">
                <div className="font-black text-white text-sm">{currentCards.length} YOUTH CARDS DRAWN</div>
                <div className="text-xs text-slate-400">Presented one card at a time in full focus</div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-sky-950 border border-sky-500 rounded text-sky-300 font-black text-[10px] shrink-0">
              32-BIT YOUTH
            </span>
          </div>
        </ConsoleModalShell>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1.5: 32-BIT RETRO DISASTER DESTRUCTION SEQUENCE */}
      {/* ========================================================================= */}
      {phase === 'disaster_resolution' && (
        <DisasterDestructionSequence
          cards={currentCards}
          onComplete={(surviving) => {
            const nextCards = surviving && surviving.length > 0 ? surviving : currentCards;
            setInternalCards(nextCards);
            setCurrentIndex(0);
            setPhase('selection');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: 32-BIT SELECTION SYSTEM */}
      {/* ========================================================================= */}
      {phase === 'selection' && (
        <ChoiceSystem
          isOpen={isOpen}
          totalChoices={currentCards.length}
          currentIndex={currentIndex}
          onNavigate={setCurrentIndex}
          onConfirm={() => handleConfirmSelection(selectedCard)}
          title={selectedCard.name}
          subtitle={`${seasonLabel} • ${selectedCard.rarity.toUpperCase()}`}
          selectorLabel={`CHOICE ${currentIndex + 1} OF ${currentCards.length}`}
          isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
          themeColor="#0284c7"
          accentGradient="from-sky-400 via-cyan-300 to-sky-500"
          categoryBadge={
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-500 pixel-bevel-cyan">
                {selectedCard.categoryLabel || 'Youth Academy'}
              </span>
              {selectedCard.isNewCardGuaranteed && (
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 border border-yellow-200 pixel-bevel-gold animate-pixel-blink">
                  ★ NEW CARD
                </span>
              )}
            </div>
          }
          topActions={
            <div className="flex items-center gap-1.5 font-mono">
              {isTestMode && (
                <>
                  <button
                    type="button"
                    onClick={handleRedraw}
                    className="min-h-[40px] text-xs text-sky-300 hover:bg-sky-900 font-bold px-2.5 py-1.5 bg-slate-950 border border-sky-500 rounded shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Re-draw random youth cards (Test Mode)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-Draw</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardPicker(true)}
                    className="min-h-[40px] text-xs text-emerald-300 hover:bg-emerald-900 font-bold px-2.5 py-1.5 bg-slate-950 border border-emerald-500 rounded shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Browse all available youth cards (Test Mode)"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Pick</span>
                  </button>
                </>
              )}
              {!isTestMode && canUseFreeReroll && (
                <button
                  type="button"
                  onClick={handleFreeCareerReroll}
                  className="min-h-[40px] text-xs text-emerald-200 hover:bg-emerald-900 font-bold px-2.5 py-1.5 bg-emerald-950 border border-emerald-400 rounded shrink-0 cursor-pointer flex items-center gap-1 shadow-sm transition active:scale-95"
                  title="Use your 1-time Free Reroll for this Unique Career"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Reroll (1×)</span>
                </button>
              )}
              {!isTestMode && isRerollUnlocked() && (
                <button
                  type="button"
                  onClick={handlePaidReroll}
                  className="min-h-[40px] text-xs text-amber-300 hover:bg-amber-900 font-bold px-2.5 py-1.5 bg-slate-950 border border-amber-500 rounded shrink-0 cursor-pointer flex items-center gap-1 shadow-sm transition active:scale-95"
                  title="Re-roll youth cards with fresh potential (Costs 5 Champion Coins)"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Re-Roll (5🪙)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPhase('pack_intro')}
                className="min-h-[40px] text-xs text-slate-300 hover:text-white font-bold px-3 py-1.5 bg-slate-950 border border-slate-700 rounded shrink-0 cursor-pointer active:scale-95"
              >
                Info
              </button>
            </div>
          }
          confirmLabel={`CONFIRM: ${selectedCard.name.toUpperCase()}`}
          confirmIcon={<Check className="w-5 h-5 stroke-[3]" />}
        >
          {/* Centered Large Card Visual Display */}
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <CardVisualRenderer
              cardFamily="youth"
              name={selectedCard.name}
              categoryType={getUniversalCategory(selectedCard)}
              subclass={subclass}
              categoryLabel={selectedCard.categoryLabel}
              rarity={selectedCard.rarity}
              description={selectedCard.description}
              effectDescriptions={selectedCard.effectDescriptions || []}
              iconName={selectedCard.iconName}
              isSelected={true}
              selectButtonText="CURRENT CHOICE"
              index={currentIndex}
              isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
              className="w-full shadow-2xl"
            />
          </div>
        </ChoiceSystem>
      )}
    </>
  );
};
