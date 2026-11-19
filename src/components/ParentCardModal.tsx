import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ParentCardInstance } from '../types/parentCards';
import { CardVisualRenderer, UniversalCardCategory } from './CardVisualRenderer';
import { Zap, Check, Sparkles, ArrowRight, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isTestModeEnabled } from '../utils/testModeSystem';
import { drawFourParentCards, drawThreeParentCards, getAllAvailableParentCards } from '../utils/parentCardSystem';
import { TestCardPickerModal } from './TestCardPickerModal';
import { ChoiceSystem } from './ChoiceSystem';
import { getChampionCredits, deductChampionCredits } from '../utils/storeCollectionSystem';
import { getStoredChampionPoints, modifyStoredChampionPoints } from '../utils/legendCareerSystem';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';
import { isRerollUnlocked } from '../utils/cardDustSystem';
import { ConsoleModalShell } from './common/ConsolePager';

interface ParentCardModalProps {
  isOpen: boolean;
  cards: ParentCardInstance[];
  onSelectParentCard: (card: ParentCardInstance) => void;
  onRedrawCards?: (newCards?: ParentCardInstance[]) => void;
  startingCityOrCountry?: string;
  playerNationalityCode?: string;
  showToast?: (msg: string) => void;
  canUseFreeReroll?: boolean;
  onUseFreeReroll?: () => void;
}

export const ParentCardModal: React.FC<ParentCardModalProps> = ({
  isOpen,
  cards: initialCards,
  onSelectParentCard,
  onRedrawCards,
  startingCityOrCountry,
  playerNationalityCode,
  showToast,
  canUseFreeReroll = false,
  onUseFreeReroll,
}) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'pack_intro' | 'selection'>('pack_intro');
  const [internalCards, setInternalCards] = useState<ParentCardInstance[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showCardPicker, setShowCardPicker] = useState<boolean>(false);
  const [pointsBalance, setPointsBalance] = useState<number>(() =>
    Math.max(getChampionCredits(), getStoredChampionPoints())
  );

  const isTestMode = isTestModeEnabled();
  const currentCards = internalCards && internalCards.length > 0 ? internalCards : initialCards;

  const allAvailableParentCards = useMemo(() => {
    return getAllAvailableParentCards(startingCityOrCountry, playerNationalityCode);
  }, [startingCityOrCountry, playerNationalityCode]);

  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      if (initialCards && initialCards.length > 0) {
        setInternalCards(initialCards);
      }
      setCurrentIndex(0);
      setPhase('pack_intro');
      setPointsBalance(Math.max(getChampionCredits(), getStoredChampionPoints()));
    } else if (isOpen && initialCards && initialCards.length > 0) {
      setInternalCards((prev) => (prev && prev.length > 0 ? prev : initialCards));
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialCards]);

  if (!isOpen || !currentCards || currentCards.length === 0) return null;

  const selectedCard = currentCards[currentIndex] || currentCards[0];

  const getUniversalCategory = (card: ParentCardInstance): UniversalCardCategory => {
    if (card.rarity === 'iconic') return 'iconic';
    return 'positive';
  };

  const handleOpenPack = () => {
    setPhase('selection');
  };

  const handleRerollWithCost = (e?: React.MouseEvent, isFreeTest: boolean = false) => {
    if (e) e.stopPropagation();

    if (!isFreeTest && !isTestMode) {
      if (!isRerollUnlocked()) {
        haptics.errorBuzz();
        if (showToast) {
          showToast('🔒 Rerolls Locked! Unlock Tactical Rerolls for 1,000 Dust in Store → Upgrades.');
        }
        return;
      }

      const current = Math.max(getChampionCredits(), getStoredChampionPoints());
      if (current < 5) {
        haptics.errorBuzz();
        if (showToast) {
          showToast(`⚠️ Insufficient Champion Points! Re-rolling parent cards requires 5 points (Current: ${current}).`);
        }
        return;
      }

      // Deduct 5 Champion Points from persistent state
      deductChampionCredits(5);
      modifyStoredChampionPoints(-5);
      const nextBal = Math.max(0, current - 5);
      setPointsBalance(nextBal);
      if (showToast) {
        showToast(`🎲 Parent cards re-rolled! (-5 Champion Points • Remaining: ${nextBal})`);
      }
    } else {
      if (showToast) {
        showToast('🎲 Parent cards re-rolled with fresh potential! (Test Mode • Free)');
      }
    }

    audioManager.playRerollDiceSound();
    haptics.mediumTap();

    // Re-roll 4 parent cards with the EXACT same starting city and nationality parameters
    const freshCards = drawFourParentCards(startingCityOrCountry, playerNationalityCode);
    setInternalCards(freshCards);
    setCurrentIndex(0);

    if (onRedrawCards) {
      onRedrawCards(freshCards);
    }
  };

  const handleFreeCareerReroll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canUseFreeReroll) return;
    audioManager.playRerollDiceSound();
    haptics.mediumTap();
    const freshCards = drawThreeParentCards(startingCityOrCountry, playerNationalityCode);
    setInternalCards(freshCards);
    setCurrentIndex(0);
    onRedrawCards?.(freshCards);
    onUseFreeReroll?.();
    if (showToast) {
      showToast('🎲 1× Free Career Reroll used! Fresh Parent cards drawn.');
    }
  };

  const handleSelectFromPicker = (pickedCard: ParentCardInstance) => {
    if (!currentCards.some((c) => c.id === pickedCard.id)) {
      const updated = [pickedCard, ...currentCards.slice(0, 2)];
      setInternalCards(updated);
      if (onRedrawCards) onRedrawCards(updated);
    }
    setCurrentIndex(0);
    setPhase('selection');
    setShowCardPicker(false);
  };

  const allEffects = [
    ...(selectedCard.perkEffects || []),
    `Perk: ${selectedCard.perkTitle} - ${selectedCard.perkDescription}`,
  ];

  return (
    <>
      {/* Test Mode Card Picker Modal */}
      {showCardPicker && (
        <TestCardPickerModal
          isOpen={showCardPicker}
          title="Parent Heritage Cards • Test Mode Picker"
          subtitle="All Heritage cards sorted from Highest to Lowest Tier (Iconic → Legendary → Gold → Silver → Bronze)"
          cards={allAvailableParentCards}
          onSelectCard={handleSelectFromPicker}
          onClose={() => setShowCardPicker(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: FULLSCREEN CONSOLE PACK INTRO */}
      {/* ========================================================================= */}
      {phase === 'pack_intro' && (
        <ConsoleModalShell
          isOpen={true}
          showCloseButton={false}
          zIndexClass="z-[9999]"
          maxWidthClass="sm:max-w-2xl"
          accentColor="amber"
          title={t('PARENT_MODAL_TITLE')}
          subtitle={t('PARENT_MODAL_SUBTITLE')}
          badge={t('PARENT_MODAL_BADGE')}
          icon={<Zap className="w-5 h-5 text-amber-400 fill-amber-400" />}
          footer={
            <button
              type="button"
              onClick={handleOpenPack}
              className="w-full min-h-[48px] px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black font-arcade text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <span>{t('REVEAL & CHOOSE HERITAGE CARD') || t('PARENT_MODAL_REVEAL_BTN') || 'REVEAL & CHOOSE HERITAGE CARD'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
            </button>
          }
        >
          <div className="p-4 sm:p-6 flex flex-col gap-4">
            {/* Key Info Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              <div className="bg-slate-950/90 border border-slate-700 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-400 uppercase">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t('FAMILY BACKGROUND') || 'FAMILY BACKGROUND'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t('Childhood upbringing, household stability, surname origin, and early habits.') || 'Childhood upbringing, household stability, surname origin, and early habits.'}
                </p>
              </div>

              <div className="bg-slate-950/90 border border-slate-700 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-emerald-400 uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('PARENT_MODAL_PERMANENT')}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Permanent traits, stat multipliers, and special childhood perks unlocked at age 10.
                </p>
              </div>
            </div>

            {/* Mystery Pack Banner */}
            <div className="w-full bg-slate-950 border border-amber-600/50 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-amber-900 border border-amber-500 rounded-lg text-amber-300 flex items-center justify-center font-black text-base shrink-0">
                  🎴
                </div>
                <div className="text-left min-w-0">
                  <div className="font-black text-white text-xs sm:text-sm truncate">
                    {t(`${currentCards.length} HERITAGE CARDS DRAWN`) || t('HERITAGE_CARDS_DRAWN', { count: currentCards.length }) || `${currentCards.length} HERITAGE CARDS DRAWN`}
                  </div>
                  <div className="text-xs text-slate-400">Presented one at a time with full details</div>
                </div>
              </div>
            </div>

            {/* Action Bar: Reroll & Card Picker */}
            <div className="w-full flex flex-col gap-2">
              {!isTestMode && canUseFreeReroll && (
                <button
                  type="button"
                  onClick={(e) => handleFreeCareerReroll(e)}
                  className="w-full min-h-[44px] py-2.5 px-3.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border-2 border-emerald-400 text-emerald-200 font-black text-xs uppercase tracking-wider flex items-center justify-between gap-2 transition cursor-pointer active:scale-95 shadow-lg shadow-emerald-950/50"
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
              {isTestMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => handleRerollWithCost(e, true)}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-400 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>🎲 RE-ROLL (FREE)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardPicker(true)}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-400 text-emerald-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Layers className="w-4 h-4" />
                    <span>🎴 PICK CARD</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleRerollWithCost(e, false)}
                  className="w-full min-h-[44px] py-2.5 px-3.5 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-400 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-between gap-2 transition cursor-pointer active:scale-95"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{t('🎲 RE-ROLL PARENT CARDS') || t('PARENT_MODAL_REROLL_BTN') || '🎲 RE-ROLL PARENT CARDS'}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-amber-900 text-amber-200 text-[11px] border border-amber-500">
                      🪙 5 PTS
                    </span>
                    <span className="hidden sm:inline text-xs text-slate-300">
                      ({pointsBalance.toLocaleString()})
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </ConsoleModalShell>
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
          onConfirm={() => onSelectParentCard(selectedCard)}
          title={selectedCard.name}
          subtitle={`${selectedCard.familyDisplay} • ${selectedCard.rarity.toUpperCase()}`}
          selectorLabel={`CHOICE ${currentIndex + 1} OF ${currentCards.length}`}
          isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
          categoryBadge={
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold">
                {selectedCard.badgeText || t('CARD_BADGE_PARENT')}
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
              {!isTestMode && canUseFreeReroll && (
                <button
                  type="button"
                  onClick={(e) => handleFreeCareerReroll(e)}
                  className="min-h-[44px] text-xs text-emerald-200 hover:bg-emerald-900 font-bold px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-400 shrink-0 cursor-pointer flex items-center gap-1 shadow-sm transition active:scale-95"
                  title="Use your 1-time Free Reroll for this Unique Career"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Reroll (1×)</span>
                </button>
              )}
              {isTestMode ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleRerollWithCost(e, true)}
                    className="min-h-[44px] text-xs text-amber-300 hover:bg-amber-900 font-bold px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-500 shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Re-roll parent cards with fresh potential (Test Mode • Free)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-Roll</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardPicker(true)}
                    className="min-h-[44px] text-xs text-emerald-300 hover:bg-emerald-900 font-bold px-3 py-1.5 rounded-lg bg-slate-950 border border-emerald-500 shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Browse all available parent cards (Test Mode)"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Pick</span>
                  </button>
                </>
              ) : isRerollUnlocked() ? (
                <button
                  type="button"
                  onClick={(e) => handleRerollWithCost(e, false)}
                  className="min-h-[44px] text-xs text-amber-300 hover:bg-amber-900 font-bold px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-500 shrink-0 cursor-pointer flex items-center gap-1 shadow-sm transition active:scale-95"
                  title="Re-roll parent cards with fresh potential (Costs 5 Champion Points)"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Re-Roll (5🪙)</span>
                </button>
              ) : !canUseFreeReroll ? (
                <button
                  type="button"
                  onClick={() => {
                    if (showToast) {
                      showToast('🔒 Rerolls Locked! Unlock Rerolls or 1 Free Reroll in Card Collection → UNLOCK & EXCHANGE.');
                    }
                  }}
                  className="min-h-[44px] text-xs text-slate-400 font-bold px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700/60 shrink-0 cursor-pointer flex items-center gap-1 opacity-80"
                  title="Locked: Unlock Rerolls in Card Collection → UNLOCK & EXCHANGE"
                >
                  <span>🔒 Re-Roll</span>
                </button>
              ) : null}
              <div className="hidden sm:flex min-h-[44px] items-center text-xs font-bold text-slate-300 bg-slate-950 border border-slate-700 rounded-lg px-2.5">
                🪙 {pointsBalance.toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => setPhase('pack_intro')}
                className="min-h-[44px] text-xs text-slate-200 hover:text-white font-bold px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 shrink-0 cursor-pointer active:scale-95"
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
              card={selectedCard}
              cardId={selectedCard.id}
              name={selectedCard.name}
              subTitle={selectedCard.familyDisplay}
              categoryType={getUniversalCategory(selectedCard)}
              categoryLabel={selectedCard.badgeText || t('CARD_BADGE_PARENT')}
              rarity={selectedCard.rarity}
              description={selectedCard.description}
              effectDescriptions={allEffects}
              iconName={selectedCard.iconName}
              isSelected={true}
              selectButtonText="CURRENT CHOICE"
              index={currentIndex}
              parentPotentialBonus={selectedCard.potentialBonus}
              isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
              className="w-full shadow-2xl"
            />
          </div>
        </ChoiceSystem>
      )}
    </>
  );
};
