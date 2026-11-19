import React, { useState } from 'react';
import { PlayerCardData, AccountingState, ManagerState } from '../types';
import {
  CareerStageCardInstance,
  drawThreeCareerStageCards,
  drawFourCareerStageCards,
  applyCareerStageCard,
  hasInTheShadowOfPerk,
  getAllAvailableCareerStageCards,
} from '../utils/careerCardSystem';
import { CardVisualRenderer, UniversalCardCategory, CardSubclass } from './CardVisualRenderer';
import { Sparkles, DollarSign, ShieldAlert, Award, ArrowRight, Check, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isTestModeEnabled } from '../utils/testModeSystem';
import { TestCardPickerModal } from './TestCardPickerModal';
import { ChoiceSystem } from './ChoiceSystem';
import { isDisasterCard, getChampionCredits, deductChampionCredits } from '../utils/storeCollectionSystem';
import { isRerollUnlocked } from '../utils/cardDustSystem';
import { haptics } from '../utils/hapticsSystem';
import { audioManager } from '../utils/audioSystem';
import { DisasterDestructionSequence } from './DisasterDestructionSequence';
import { ConsoleModalShell } from './common/ConsolePager';

export interface CareerStageCardModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  accounting?: AccountingState;
  manager?: ManagerState;
  seasonLabel?: string;
  drawnCards?: CareerStageCardInstance[];
  onSelectCard: (
    updatedPlayer: PlayerCardData,
    updatedAccounting?: AccountingState,
    updatedManager?: ManagerState,
    message?: string
  ) => void;
  onRedrawCards?: () => void;
  onClose?: () => void;
  canUseFreeReroll?: boolean;
  onUseFreeReroll?: () => void;
  showToast?: (msg: string) => void;
}

export const CareerStageCardModal: React.FC<CareerStageCardModalProps> = ({
  isOpen,
  player,
  accounting,
  manager,
  seasonLabel = '3-CARD DRAW',
  drawnCards: initialDrawnCards,
  onSelectCard,
  onRedrawCards,
  onClose,
  canUseFreeReroll = false,
  onUseFreeReroll,
  showToast,
}) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'pack_intro' | 'disaster_resolution' | 'selection'>('pack_intro');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cards, setCards] = useState<CareerStageCardInstance[]>(() =>
    initialDrawnCards && initialDrawnCards.length > 0 ? initialDrawnCards : drawThreeCareerStageCards(player, manager)
  );
  const [showCardPicker, setShowCardPicker] = useState<boolean>(false);
  const prevIsOpenRef = React.useRef<boolean>(false);

  const isTestMode = isTestModeEnabled();

  React.useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setPhase('pack_intro');
      setCurrentIndex(0);
      setCards(
        initialDrawnCards && initialDrawnCards.length > 0
          ? initialDrawnCards
          : drawThreeCareerStageCards(player, manager)
      );
    } else if (isOpen && initialDrawnCards && initialDrawnCards.length > 0) {
      setCards(initialDrawnCards);
      setCurrentIndex(0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialDrawnCards]);

  const allAvailableCards = React.useMemo(() => {
    return getAllAvailableCareerStageCards();
  }, []);

  if (!isOpen || !cards || cards.length === 0) return null;

  const inShadowOf = hasInTheShadowOfPerk(player);
  const validIndex = Math.max(0, Math.min(currentIndex, cards.length - 1));
  const selectedCard = cards[validIndex] || cards[0];

  const handleProceedFromPackIntro = () => {
    if (cards.some(isDisasterCard)) {
      setPhase('disaster_resolution');
    } else {
      setPhase('selection');
    }
  };

  const handleConfirmSelection = (card: CareerStageCardInstance) => {
    const result = applyCareerStageCard(card, player, accounting, manager);
    onSelectCard(result.updatedPlayer, result.updatedAccounting, result.updatedManager, result.message);
    if (onClose) onClose();
  };

  const handleRedraw = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onRedrawCards) {
      onRedrawCards();
    } else {
      const newDrawn = drawThreeCareerStageCards(player, manager);
      setCards(newDrawn);
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
    const newDrawn = drawThreeCareerStageCards(player, manager);
    setCards(newDrawn);
    setCurrentIndex(0);
  };

  const handleFreeCareerReroll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canUseFreeReroll) return;
    audioManager.playRerollDiceSound();
    haptics.mediumTap();
    const newDrawn = drawThreeCareerStageCards(player, manager);
    setCards(newDrawn);
    setCurrentIndex(0);
    onUseFreeReroll?.();
    if (showToast) {
      showToast('🎲 1× Free Career Reroll used! Fresh Career cards drawn.');
    }
  };

  const handleSelectFromPicker = (pickedCard: CareerStageCardInstance) => {
    const existingIndex = cards.findIndex((c) => c.id === pickedCard.id);
    if (existingIndex >= 0) {
      setCurrentIndex(existingIndex);
    } else {
      setCards([pickedCard, ...cards.slice(0, 2)]);
      setCurrentIndex(0);
    }
    setPhase('selection');
    setShowCardPicker(false);
  };

  return (
    <>

      {/* Test Mode Card Picker Modal */}
      {showCardPicker && (
        <TestCardPickerModal
          isOpen={showCardPicker}
          title="Career Stage Cards • Test Mode Picker"
          subtitle="All Career, Lifestyle, & Sponsor cards sorted from Highest to Lowest Tier (Legendary → Gold/Epic → Silver/Rare → Bronze/Common)"
          cards={allAvailableCards}
          onSelectCard={handleSelectFromPicker}
          onClose={() => setShowCardPicker(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: 32-BIT RETRO PACK INTRO */}
      {/* ========================================================================= */}
      {phase === 'pack_intro' && (
        <ConsoleModalShell
          isOpen={isOpen}
          onClose={onClose || handleProceedFromPackIntro}
          showCloseButton={Boolean(onClose)}
          zIndexClass="z-[9999]"
          title={t('Preseason & Mid-Season Career Cards')}
          subtitle={`Select 1 card from your ${cards.length} drawn cards (Career, Lifestyle, or Sponsor). Accepted Sponsor cards are recorded directly into Accounting.`}
          badge={t('CAREER STAGE DECK • {season}', { season: seasonLabel.toUpperCase() })}
          icon={<Sparkles className="w-5 h-5 text-amber-400" />}
          accentColor="amber"
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
                    className="min-h-[44px] py-2 px-3 bg-amber-950 hover:bg-amber-900 border border-amber-400 rounded-xl text-amber-300 font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
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
                onClick={handleProceedFromPackIntro}
                className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl border-2 border-amber-300 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <span>{t('REVEAL & SELECT CAREER CARD')}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          }
        >
          {inShadowOf && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950 border border-purple-400 rounded-lg text-purple-200 text-xs font-black uppercase">
              <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{t('In The Shadow Of (+50% Sponsor, 2x Negative)')}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase">
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('FINANCIAL & SPONSOR')}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('Brand deals, endorsements, upfront bonuses, and commercial perks.')}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t('CAREER MILESTONES')}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('Tactical training, fame surges, media influence, and lifestyle perks.')}
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 bg-amber-900 border border-amber-500 rounded-lg text-amber-300 flex items-center justify-center font-black text-base shrink-0">
                🃏
              </div>
              <div className="text-left min-w-0">
                <div className="font-black text-white text-sm">{cards.length} CAREER CARDS DRAWN</div>
                <div className="text-xs text-slate-400 truncate">
                  {t('Fame: {fame}/1000 • Agent Marketing: {marketing}', { fame: player.fame || 0, marketing: manager?.marketing || 20 })}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-950 border border-amber-500 rounded text-amber-300 font-black text-[10px] shrink-0">
              {t('PICK 1')}
            </span>
          </div>
        </ConsoleModalShell>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1.5: 32-BIT RETRO DISASTER DESTRUCTION SEQUENCE */}
      {/* ========================================================================= */}
      {phase === 'disaster_resolution' && (
        <DisasterDestructionSequence
          cards={cards}
          onComplete={(surviving) => {
            const nextCards = surviving && surviving.length > 0 ? surviving : cards;
            setCards(nextCards);
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
          totalChoices={cards.length}
          currentIndex={currentIndex}
          onNavigate={setCurrentIndex}
          onConfirm={() => handleConfirmSelection(selectedCard)}
          title={selectedCard.name}
          subtitle={`${seasonLabel} • ${(selectedCard.tier || selectedCard.rarity || 'Bronze').toUpperCase()}`}
          selectorLabel={`CHOICE ${currentIndex + 1} OF ${cards.length}`}
          isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
          themeColor="#f59e0b"
          accentGradient="from-amber-400 via-yellow-300 to-amber-500"
          categoryBadge={
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold">
                {selectedCard.category === 'sponsor'
                  ? `SPONSOR (${(selectedCard.tier || selectedCard.rarity || 'Bronze').toUpperCase()})`
                  : selectedCard.category === 'lifestyle'
                  ? 'LIFESTYLE'
                  : 'CAREER STAGE'}
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
                    className="min-h-[40px] text-xs text-amber-300 hover:bg-amber-900 font-bold px-2.5 py-1.5 bg-slate-950 border border-amber-500 rounded shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Re-draw random career stage cards (Test Mode)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-Draw</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardPicker(true)}
                    className="min-h-[40px] text-xs text-emerald-300 hover:bg-emerald-900 font-bold px-2.5 py-1.5 bg-slate-950 border border-emerald-500 rounded shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Browse all available career stage cards (Test Mode)"
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
                  title="Re-roll career stage cards with fresh potential (Costs 5 Champion Coins)"
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
            {(() => {
              const isSponsor = selectedCard.category === 'sponsor';
              const tier = selectedCard.tier || selectedCard.rarity || 'Bronze';
              const type = selectedCard.type;

              let categoryType: UniversalCardCategory = 'positive';
              let subclass: CardSubclass = 'development';

              if (type === 'negative') {
                categoryType = 'negative';
                subclass = 'setback';
              } else if (type === 'double_edged') {
                categoryType = 'double_edged';
                subclass = 'double_edged';
              }

              const categoryLabel = isSponsor
                ? t('SPONSOR ({tier})', { tier: tier.toUpperCase() })
                : selectedCard.category === 'lifestyle'
                ? t('LIFESTYLE')
                : t('CAREER STAGE');

              const iconName =
                selectedCard.iconName || (isSponsor ? 'Trophy' : selectedCard.category === 'lifestyle' ? 'Smile' : 'Zap');

              return (
                <CardVisualRenderer
                  cardFamily="career"
                  name={selectedCard.name}
                  categoryType={categoryType}
                  subclass={subclass}
                  categoryLabel={categoryLabel}
                  rarity={tier}
                  tier={tier}
                  description={selectedCard.description}
                  effectDescriptions={selectedCard.effects || []}
                  iconName={iconName}
                  isSelected={true}
                  selectButtonText={t('CONFIRM THIS CARD')}
                  index={currentIndex}
                  isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
                  className="w-full shadow-2xl"
                />
              );
            })()}
          </div>
        </ChoiceSystem>
      )}
    </>
  );
};
