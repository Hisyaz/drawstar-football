import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Package,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Layers,
  Lock,
  Unlock,
  HeartHandshake,
  Award,
  Shield,
  Briefcase,
  UserCheck,
  Flame,
  Info,
  ChevronRight,
  Zap,
  HelpCircle,
  BookOpen,
  Dices,
  Activity,
  MessageSquare,
} from 'lucide-react';
import {
  getCardDustBalance,
  subscribeToCardDust,
  DUST_UPGRADE_DEFINITIONS,
  getPurchasedDustUpgrades,
  isDustUpgradePurchased,
  purchaseDustUpgrade,
  subscribeToDustUpgrades,
  DustUpgradeDefinition,
} from '../utils/cardDustSystem';
import { useLanguage } from '../context/LanguageContext';
import { isTutorialEnabled, hasSeenTutorial, markTutorialSeen } from '../utils/tutorialSystem';
import { CustomCard, CustomCardCategory, CustomCardTier } from '../types';
import {
  STORE_PACKS,
  STARTER_PACKS,
  EPIC_UPGRADE_PACK,
  ALL_STORE_PACKS,
  StorePackDefinition,
  StoreCategory,
  getChampionCredits,
  getStoreCollection,
  purchaseAndOpenPack,
  isCardEligibleForUniqueCareerActiveDeck,
  getCardOwnedCount,
  subscribeToChampionCredits,
  subscribeToStoreCollection,
  StoreCollection,
  PackOpenResult,
  BASIC_PACK_PRICE_CREDITS,
  getNewCardQueues,
  subscribeToNewCardQueues,
  getNewCardCount,
  getPendingNewCardsCountForCategory,
  NewCardQueues,
  isOneTimePackPurchased,
  getPurchasedOneTimePacks,
  isStoreTutorialCompleted,
  markStoreTutorialCompleted,
  STARTER_TUTORIAL_PACK_IDS,
  areAllStarterTutorialPacksPurchased,
} from '../utils/storeCollectionSystem';
import { getAllDefaultCustomCards } from '../utils/cardDatabaseSystem';
import { CardVisualRenderer } from './CardVisualRenderer';
import { PixelPackOpeningExperience } from './PixelPackOpeningExperience';
import { BigPackOpeningExperience } from './BigPackOpeningExperience';
import { TutorialCalloutArrow } from './TutorialCalloutArrow';
import confetti from 'canvas-confetti';
import {
  shouldDisableParticles,
  triggerAppCelebration,
  isHighQualityModeActive,
} from '../utils/graphicSettingsSystem';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

const triggerHaptic = (duration: number = 20) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {}
  }
};

const triggerConfetti = (opts?: any) => {
  triggerAppCelebration(opts);
};

interface CardStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  initialTab?: 'packs';
  onOpenCollection?: () => void;
  isStarterRedirectMode?: boolean;
  onStarterPacksCompleted?: () => void;
}

const CATEGORY_ICONS: Record<StoreCategory, React.ComponentType<{ className?: string }>> = {
  parents: HeartHandshake,
  youth: Award,
  career: Shield,
  sponsor: Briefcase,
  life: Sparkles,
  agent: UserCheck,
  street: Flame,
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  bronze: { bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-700/50', label: 'Bronze' },
  silver: { bg: 'bg-slate-400/30', text: 'text-slate-200', border: 'border-slate-400/50', label: 'Silver' },
  gold: { bg: 'bg-yellow-500/30', text: 'text-yellow-300', border: 'border-yellow-500/60', label: 'Gold' },
  legendary: { bg: 'bg-purple-500/30', text: 'text-purple-300', border: 'border-purple-500/60', label: 'Legendary' },
  iconic: { bg: 'bg-amber-400/30', text: 'text-amber-200', border: 'border-amber-400/70', label: 'Iconic' },
  obsidian_knife: { bg: 'bg-stone-800/60', text: 'text-stone-300', border: 'border-stone-600', label: 'Obsidian Knife' },
  copper_dagger: { bg: 'bg-orange-800/40', text: 'text-orange-300', border: 'border-orange-600/60', label: 'Copper Dagger' },
  steel_blade: { bg: 'bg-blue-800/40', text: 'text-blue-300', border: 'border-blue-500/60', label: 'Steel Blade' },
  muramasa_blade: { bg: 'bg-rose-900/50', text: 'text-rose-300', border: 'border-rose-500/70', label: 'Muramasa Blade' },
  scrap: { bg: 'bg-zinc-800/40', text: 'text-zinc-400', border: 'border-zinc-700', label: 'Scrap' },
  rust: { bg: 'bg-amber-950/40', text: 'text-amber-600', border: 'border-amber-800/50', label: 'Rust' },
  ash: { bg: 'bg-neutral-800/40', text: 'text-neutral-400', border: 'border-neutral-700', label: 'Ash' },
  disaster: { bg: 'bg-red-950/50', text: 'text-red-400', border: 'border-red-800/60', label: 'Disaster' },
};

export const CardStoreModal: React.FC<CardStoreModalProps> = ({
  isOpen,
  onClose,
  showToast,
  onOpenCollection,
  isStarterRedirectMode = false,
  onStarterPacksCompleted,
}) => {
  const { t } = useLanguage();
  const [credits, setCredits] = useState<number>(getChampionCredits());
  const [collection, setCollection] = useState<StoreCollection>(getStoreCollection());
  const [newCardQueues, setNewCardQueues] = useState<NewCardQueues>(getNewCardQueues());
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>(() => getPurchasedOneTimePacks());
  const [storeFilter, setStoreFilter] = useState<'all' | 'starter' | 'standard' | 'epic'>('all');
  const [storeSection, setStoreSection] = useState<'packs' | 'upgrades'>('packs');
  const [cardDust, setCardDust] = useState<number>(() => getCardDustBalance());
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<string[]>(() => getPurchasedDustUpgrades());

  // Pack opening states
  const [isOpeningPack, setIsOpeningPack] = useState<boolean>(false);
  const [activePackResult, setActivePackResult] = useState<PackOpenResult | null>(null);
  const [revealedCardIndices, setRevealedCardIndices] = useState<Set<number>>(new Set());
  const [isTearingAnimation, setIsTearingAnimation] = useState<boolean>(false);
  const [packSessionKey, setPackSessionKey] = useState<number>(0);
  const [isOpeningAnother, setIsOpeningAnother] = useState<boolean>(false);
  const [selectedInspectCard, setSelectedInspectCard] = useState<CustomCard | null>(null);
  const [isTutorialPackOpening, setIsTutorialPackOpening] = useState<boolean>(false);
  const [packsPage, setPacksPage] = useState<number>(1);
  const PACKS_PER_PAGE = 6;

  const openedStarterCount = useMemo(() => {
    return STARTER_TUTORIAL_PACK_IDS.filter((id) => purchasedPacks.includes(id)).length;
  }, [purchasedPacks]);

  const allStarterPacksDone = openedStarterCount >= STARTER_TUTORIAL_PACK_IDS.length;

  // Guided starter pack flow active when redirected from Unique Career with Tutorial ON
  const isStarterMissionActive = useMemo(() => {
    return Boolean(isStarterRedirectMode && isTutorialEnabled() && !allStarterPacksDone);
  }, [isStarterRedirectMode, allStarterPacksDone]);

  // Sync credits, collection and new card queues in real-time
  useEffect(() => {
    if (!isOpen) return;

    setCredits(getChampionCredits());
    setCollection(getStoreCollection());
    setNewCardQueues(getNewCardQueues());
    setPurchasedPacks(getPurchasedOneTimePacks());
    setCardDust(getCardDustBalance());
    setPurchasedUpgrades(getPurchasedDustUpgrades());

    const unsubCredits = subscribeToChampionCredits((c) => setCredits(c));
    const unsubCol = subscribeToStoreCollection((col) => setCollection(col));
    const unsubQueues = subscribeToNewCardQueues((q) => setNewCardQueues(q));
    const unsubDust = subscribeToCardDust((d) => setCardDust(d));
    const unsubUpgrades = subscribeToDustUpgrades((u) => setPurchasedUpgrades(u));

    return () => {
      unsubCredits();
      unsubCol();
      unsubQueues();
      unsubDust();
      unsubUpgrades();
    };
  }, [isOpen]);

  const handlePurchaseUpgrade = (upgrade: DustUpgradeDefinition) => {
    if (purchasedUpgrades.includes(upgrade.id)) {
      showToast(`"${upgrade.name}" ${t('is already unlocked!') || 'is already unlocked!'}`);
      return;
    }
    if (cardDust < upgrade.costDust) {
      triggerHaptic(40);
      showToast(
        `⚠️ ${t('Insufficient Card Dust!') || 'Insufficient Card Dust!'} "${upgrade.name}" ${t('costs')} ${upgrade.costDust} ${t('Dust')} (${t('You have')} ${cardDust}). ${t('Recycle duplicate cards in your Deck to earn Dust!') || 'Recycle duplicate cards in your Deck to earn Dust!'}`
      );
      return;
    }
    triggerHaptic(30);
    const result = purchaseDustUpgrade(upgrade.id);
    if (!result.success) {
      showToast(result.errorMessage || 'Failed to unlock upgrade.');
      return;
    }
    setPurchasedUpgrades(getPurchasedDustUpgrades());
    setCardDust(result.remainingDust);
    triggerConfetti({ particleCount: 120, spread: 80 });
    showToast(`🎉 ${t('Unlocked')} "${upgrade.name}"! ${upgrade.effectLabel}`);
  };

  const totalPendingGuarantees = useMemo(() => {
    return Object.values(newCardQueues).reduce((acc, q) => acc + (q?.length || 0), 0);
  }, [newCardQueues]);

  // Backward compatibility alias
  const isFirstVisitTutorial = isStarterMissionActive;

  // Handle purchasing a pack
  const handlePurchasePack = (pack: StorePackDefinition, fromOpenAnother = false) => {
    // Check one-time limit
    if (pack.isOneTime && purchasedPacks.includes(pack.id)) {
      triggerHaptic(30);
      showToast(t('STORE_PACK_ONE_TIME_LIMIT') || '⚠️ This pack has already been purchased (Limit 1 per career).');
      return;
    }

    if (credits < pack.priceCredits) {
      triggerHaptic(40);
      showToast(
        `⚠️ ${t('INSUFFICIENT_FUNDS') || 'Insufficient Champion Credits!'} ${pack.name} (${pack.priceCredits} Credits). ${t('STORE_BALANCE_LABEL', { credits: credits.toString() }) || `You currently have ${credits}.`}`
      );
      return;
    }

    triggerHaptic(30);
    const result = purchaseAndOpenPack(pack.id);
    if (!result.success) {
      showToast(result.errorMessage || 'Failed to open pack.');
      return;
    }

    // Track first-time starter pack tutorial opening on the very first pack if redirected
    if (isStarterMissionActive && openedStarterCount === 0 && STARTER_TUTORIAL_PACK_IDS.includes(pack.id)) {
      setIsTutorialPackOpening(true);
    }

    setPurchasedPacks(getPurchasedOneTimePacks());
    setPackSessionKey((prev) => prev + 1);
    setIsOpeningAnother(fromOpenAnother);
    setActivePackResult(result);
    setRevealedCardIndices(new Set());
    setIsOpeningPack(true);
    setIsTearingAnimation(false);
    showToast(`✨ Opened ${pack.name}! ${result.cards.length} Cards added to your persistent Store Collection.`);
  };

  const handleRevealCard = (index: number) => {
    triggerHaptic(15);
    setRevealedCardIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleRevealAll = () => {
    triggerHaptic(30);
    if (activePackResult) {
      setRevealedCardIndices(new Set([0, 1, 2, 3, 4]));
    }
  };

  const handleClosePackReveal = () => {
    setIsOpeningPack(false);
    setActivePackResult(null);
    setRevealedCardIndices(new Set());
    setIsTearingAnimation(false);
    setIsOpeningAnother(false);
    setIsTutorialPackOpening(false);
  };

  const handlePackOpeningDone = () => {
    const latestPurchased = getPurchasedOneTimePacks();
    setPurchasedPacks(latestPurchased);
    const completedAllFive = areAllStarterTutorialPacksPurchased(latestPurchased);

    if (completedAllFive && !isStoreTutorialCompleted()) {
      markStoreTutorialCompleted();
      markTutorialSeen('card_store');
      markTutorialSeen('store_entry_explanation');
      markTutorialSeen('unique_career_store_redirect');
    }

    handleClosePackReveal();

    if (completedAllFive && isStarterRedirectMode && onStarterPacksCompleted) {
      showToast('🎉 All 5 Starter & Epic Packs opened! Returning to launch Unique Career...');
      onClose();
      onStarterPacksCompleted();
    }
  };

  // Filter packs for active tab (starter packs appear first, and sold-out packs move to the end so purchasable items lead)
  const displayedPacks = useMemo(() => {
    let baseList: StorePackDefinition[];
    if (isStarterMissionActive) {
      baseList = [...STARTER_PACKS, EPIC_UPGRADE_PACK];
    } else if (storeFilter === 'starter') {
      baseList = STARTER_PACKS;
    } else if (storeFilter === 'epic') {
      baseList = [EPIC_UPGRADE_PACK];
    } else if (storeFilter === 'standard') {
      baseList = STORE_PACKS;
    } else {
      baseList = ALL_STORE_PACKS;
    }

    const available: StorePackDefinition[] = [];
    const soldOut: StorePackDefinition[] = [];
    for (const pack of baseList) {
      const isSoldOut = Boolean(pack.isOneTime && purchasedPacks.includes(pack.id));
      if (isSoldOut) {
        soldOut.push(pack);
      } else {
        available.push(pack);
      }
    }
    return [...available, ...soldOut];
  }, [isStarterMissionActive, storeFilter, purchasedPacks]);

  useEffect(() => {
    setPacksPage(1);
  }, [storeFilter, isOpen]);

  const totalPackPages = Math.max(1, Math.ceil(displayedPacks.length / PACKS_PER_PAGE));
  const paginatedPacks = useMemo(() => {
    const start = (packsPage - 1) * PACKS_PER_PAGE;
    return displayedPacks.slice(start, start + PACKS_PER_PAGE);
  }, [displayedPacks, packsPage]);

  const renderInspectCardModal = () => {
    if (!selectedInspectCard) return null;
    return (
      <div
        id="card-inspect-overlay"
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 safe-top safe-bottom overflow-y-auto animate-in fade-in duration-150"
        onClick={() => setSelectedInspectCard(null)}
      >
        <div
          id="card-inspect-modal"
          className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto shadow-2xl text-left relative space-y-4 card-3d-tilt"
          data-glow={selectedInspectCard.tier === 'legendary' || selectedInspectCard.tier === 'iconic' ? 'gold' : selectedInspectCard.tier === 'gold' ? 'cyan' : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {isHighQualityModeActive() && ['gold', 'legendary', 'iconic', 'silver', 'steel_blade', 'muramasa_blade', 'disaster'].includes(selectedInspectCard.tier) && (
            <div className="holo-foil-shimmer" style={{ zIndex: 10, opacity: 0.5 }} />
          )}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-mono uppercase text-slate-400">
                {selectedInspectCard.category} Card Definition
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white truncate">
                {selectedInspectCard.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedInspectCard(null)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Tier:</span>
              <span className="font-bold text-amber-300 uppercase">
                {selectedInspectCard.tier}
              </span>
            </div>

            {(() => {
              const inspectOwned = getCardOwnedCount(selectedInspectCard.id, collection);
              const inspectNew = getNewCardCount(selectedInspectCard.id);
              const inspectNormal = Math.max(0, inspectOwned - inspectNew);

              return (
                <>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Owned Copies:</span>
                    <div className="text-right">
                      <span className="font-mono font-black text-white">
                        x{inspectOwned}
                      </span>
                      {inspectNew > 0 && (
                        <div className="text-[10px] text-yellow-300 font-bold">
                          {inspectNew} NEW Guaranteed • {inspectNormal} Normal
                        </div>
                      )}
                    </div>
                  </div>

                  {inspectNew > 0 && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-400/20 to-amber-500/15 border border-yellow-400/60 text-xs shadow-md">
                      <div className="flex items-center gap-1.5 font-bold text-yellow-300 mb-1">
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                        <span>NEW CARD STATUS ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-yellow-100/90 leading-relaxed">
                        This card has <strong>{inspectNew} NEW</strong> copy queued. It is guaranteed to appear the next time Unique Career draws from the <strong>{selectedInspectCard.category.toUpperCase()}</strong> category. Other copies remain standard.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Active Deck Status:</span>
              <span
                className={`font-bold ${
                  isCardEligibleForUniqueCareerActiveDeck(selectedInspectCard, collection)
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {isCardEligibleForUniqueCareerActiveDeck(selectedInspectCard, collection)
                  ? 'Eligible (Unlocked)'
                  : 'Locked (Requires Store Copy)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1 font-bold">Description:</div>
              <p className="text-white text-xs leading-relaxed">
                {selectedInspectCard.description}
              </p>
            </div>

            {selectedInspectCard.modifiers && selectedInspectCard.modifiers.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px] font-bold mb-1">Modifiers / Effects:</div>
                {selectedInspectCard.modifiers.map((m, idx) => (
                  <div key={idx} className="font-mono text-emerald-400 text-[11px]">
                    {m.operation.toUpperCase()} {m.value} {m.target}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSelectedInspectCard(null)}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // ================= STANDALONE PACK OPENING FULL-SCREEN VIEW =================
  // When opening a pack, replace the store modal entirely with the dedicated Pack Opening screen.
  // Once the user confirms, they return seamlessly right back to the store.
  if (isOpeningPack && activePackResult) {
    return (
      <div
        id="drawstar-standalone-pack-opening-root"
        className="fixed inset-0 z-50 bg-slate-950 text-white font-pixel select-none"
      >
        {activePackResult.pack.isBigPack || activePackResult.cards.length > 5 ? (
          <BigPackOpeningExperience
            key={`big-pack-opening-${packSessionKey}`}
            pack={activePackResult.pack}
            cards={activePackResult.cards}
            onDone={handlePackOpeningDone}
            onInspectCard={(card) => setSelectedInspectCard(card)}
            credits={credits}
            collection={collection}
            isTutorialFlow={isTutorialPackOpening}
          />
        ) : (
          <PixelPackOpeningExperience
            key={`pack-opening-session-${packSessionKey}`}
            pack={activePackResult.pack}
            cards={activePackResult.cards}
            revealedCardIndices={revealedCardIndices}
            onRevealCard={handleRevealCard}
            onRevealAll={handleRevealAll}
            onOpenAnother={() => {
              const currentPack = activePackResult.pack;
              handlePurchasePack(currentPack, true);
            }}
            onViewCollection={() => {
              handleClosePackReveal();
              if (onOpenCollection) {
                onClose();
                onOpenCollection();
              }
            }}
            onDone={handlePackOpeningDone}
            onInspectCard={(card) => setSelectedInspectCard(card)}
            credits={credits}
            collection={collection}
            isOpeningAnother={isOpeningAnother}
          />
        )}

        {/* Selected inspect card overlay */}
        {renderInspectCardModal()}
      </div>
    );
  }

  return (
    <>
      <ConsoleModalShell
        id="drawstar-card-store-modal"
        isOpen={isOpen}
        onClose={onClose}
        closeDisabled={false}
        title={t('STORE_MODAL_TITLE') || 'CARD STORE'}
        subtitle={t('STORE_MODAL_SUBTITLE') || 'Purchase and rip packs to unlock canonical cards for your collection.'}
        badge={isStarterMissionActive ? `STARTER ${openedStarterCount}/5` : t('STORE_BADGE_PACK_SHOP') || 'PACK SHOP'}
        icon={<ShoppingBag className="w-5 h-5 text-amber-300" />}
        accentColor="amber"
        maxWidthClass="sm:max-w-5xl"
        headerRight={
          <div className="flex items-center gap-2 shrink-0">
            {totalPendingGuarantees > 0 && (
              <div
                id="store-pending-guarantees-badge"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-950/80 border border-yellow-400 text-yellow-300 text-xs font-mono font-bold shadow-sm"
                title={`${totalPendingGuarantees} card copy guaranteed to appear on next matching Unique Career draw.`}
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>{totalPendingGuarantees} NEW</span>
              </div>
            )}
            <div
              id="store-champion-credits-badge"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-amber-500/70 rounded-lg"
            >
              <span className="text-xs">🪙</span>
              <span className="text-xs sm:text-sm font-black font-mono text-white tabular-nums">
                {credits.toLocaleString()}
              </span>
            </div>
          </div>
        }
        tabs={
          isStarterMissionActive
            ? undefined
            : [
                { id: 'all', label: t('STORE_TAB_ALL_PACKS') || 'All Packs', badge: ALL_STORE_PACKS.length },
                { id: 'starter', label: t('STORE_TAB_STARTER_PACKS') || 'Starter Packs', badge: 4 },
                { id: 'epic', label: t('STORE_TAB_EPIC_UPGRADE') || 'Epic Upgrade', badge: 1 },
                { id: 'standard', label: t('STORE_TAB_CATEGORY_PACKS') || 'Category Packs', badge: 7 },
              ]
        }
        activeTabId={storeFilter}
        onTabChange={(id) => {
          if (!isStarterMissionActive) setStoreFilter(id as any);
        }}
        bodyClassName="p-3 sm:p-5 space-y-4 font-pixel"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300 min-w-0">
              {onOpenCollection && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCollection();
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-lg border font-arcade uppercase text-xs font-black flex items-center gap-1.5 transition-colors bg-blue-950 hover:bg-blue-900 border-blue-400 text-blue-200 cursor-pointer active:scale-95"
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>{t('STORE_BTN_COLLECTION') || 'Collection'}</span>
                </button>
              )}
              <span className="hidden sm:inline text-slate-400">
                {t('STORE_BALANCE_LABEL', { credits: credits.toLocaleString() }) || `Balance: ${credits.toLocaleString()} Credits`}
              </span>
            </div>

            <button
              id="store-modal-close-btn"
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2 rounded-lg font-arcade uppercase font-black text-xs transition-colors border bg-slate-800 hover:bg-slate-700 text-white cursor-pointer border-slate-600 active:scale-95"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* FIRST UNIQUE CAREER -> STARTER PACKS TUTORIAL BANNER */}
          {isStarterMissionActive && (
            <div
              id="store-first-visit-tutorial-banner"
              className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/90 border-2 border-amber-400 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-amber-500 text-slate-950 border border-amber-300 rounded-lg flex items-center justify-center shrink-0 font-arcade font-black text-sm">
                  ★
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-arcade font-black uppercase text-amber-300 tracking-wide">
                    STARTER DECK SETUP ({openedStarterCount}/5 OPENED)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed mt-1">
                    Open all 4 Starter Packs and the Epic Upgrade Pack (1 Credit each). Once all 5 are opened, you will return automatically to Unique Career!
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {STARTER_TUTORIAL_PACK_IDS.map((pid) => (
                  <span
                    key={pid}
                    className={`w-4 h-4 border ${
                      purchasedPacks.includes(pid)
                        ? 'bg-emerald-400 border-emerald-200'
                        : 'bg-slate-900 border-amber-500/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pagination Top Bar when multiple pages */}
          {totalPackPages > 1 && (
            <ConsolePaginationBar
              currentPage={packsPage}
              totalPages={totalPackPages}
              onPageChange={setPacksPage}
              totalItems={displayedPacks.length}
              pageSize={PACKS_PER_PAGE}
              label="PACKS PAGE"
            />
          )}

          {/* STORE PACKS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedPacks.map((pack) => {
              const IconComp = pack.category !== 'all' ? (CATEGORY_ICONS[pack.category] || Package) : Package;
              const isSoldOut = pack.isOneTime && purchasedPacks.includes(pack.id);
              const isStarterTarget = isStarterMissionActive && STARTER_TUTORIAL_PACK_IDS.includes(pack.id) && !isSoldOut;
              const canAfford = credits >= pack.priceCredits && !isSoldOut;

              return (
                <div
                  key={pack.id}
                  id={`store-pack-card-${pack.id}`}
                  className={`group relative rounded-xl border-2 ${
                    isStarterTarget
                      ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_22px_rgba(245,158,11,0.35)] bg-slate-950'
                      : isSoldOut
                      ? 'border-slate-800 bg-slate-950/60 opacity-60'
                      : `${pack.accentBorder} bg-slate-950 hover:border-amber-400`
                  } p-3.5 sm:p-4 shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-200`}
                  data-glow={pack.id === 'pack-epic-upgrade' ? 'cyan' : isStarterTarget ? 'gold' : undefined}
                >
                  {isHighQualityModeActive() && (pack.id === 'pack-epic-upgrade' || pack.category === 'all') && (
                    <div className="holo-foil-shimmer" style={{ zIndex: 5, opacity: 0.65 }} />
                  )}

                  <div>
                    {/* Pack Top Row */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black uppercase border rounded ${pack.badgeColor} flex items-center gap-1.5`}
                      >
                        <IconComp className="w-3 h-3" />
                        {pack.categoryLabel}
                      </span>

                      <div className="flex items-center gap-1">
                        {pack.isOneTime && (
                          <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950 px-1.5 py-0.5 border border-cyan-800 rounded">
                            1-TIME
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-200 font-bold bg-slate-900 px-1.5 py-0.5 border border-slate-700 rounded">
                          {t('STORE_PACK_CARDS_COUNT', { count: pack.cardCount.toString() }) || `${pack.cardCount} CARDS`}
                        </span>
                      </div>
                    </div>

                    {/* Pack Title */}
                    <h3 className="text-base font-black font-arcade text-white group-hover:text-amber-300 transition-colors uppercase tracking-wide">
                      {pack.name}
                    </h3>

                    {/* Pack Description */}
                    <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1.5 leading-relaxed">
                      {pack.description}
                    </p>

                    {/* Pack Info Preview */}
                    <div className="mt-3 pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
                      {pack.id === 'pack-epic-upgrade' ? (
                        <>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Special Odds:</span>
                            <span className="text-cyan-300 font-bold">20% Iconic / Slot</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Remaining Drop:</span>
                            <span className="text-purple-300 font-bold">80% Legendary</span>
                          </div>
                        </>
                      ) : pack.category === 'all' ? (
                        <>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Pool Scope:</span>
                            <span className="text-amber-300 font-bold">All Categories</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Bulk Delivery:</span>
                            <span className="text-slate-200 font-bold">{pack.cardCount} Cards</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Drop Tiers:</span>
                            <span className="text-amber-300 font-bold">Bronze → Iconic</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Double-Edged:</span>
                            <span className="text-orange-300 font-bold">Obsidian → Muramasa</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-2.5 border-t border-slate-800">
                    {isSoldOut ? (
                      <div className="w-full min-h-[44px] py-2 px-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-center text-xs font-arcade uppercase font-black flex items-center justify-center">
                        {t('STORE_PACK_SOLD_OUT') || 'SOLD OUT (1/1 CLAIMED)'}
                      </div>
                    ) : (
                      <button
                        type="button"
                        id={`store-buy-${pack.id}`}
                        disabled={!canAfford}
                        onClick={() => handlePurchasePack(pack)}
                        className={`w-full min-h-[44px] py-2.5 px-3 rounded-lg font-arcade font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border-2 ${
                          isStarterTarget && canAfford
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-200 shadow-lg animate-pulse'
                            : canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                            : 'bg-slate-900 text-slate-500 cursor-not-allowed border-slate-700'
                        }`}
                      >
                        <Package className="w-4 h-4 shrink-0" />
                        <span>
                          {canAfford
                            ? t('STORE_PACK_BUY_BTN', { price: pack.priceCredits.toString() }) || `BUY & OPEN (${pack.priceCredits} ${pack.priceCredits === 1 ? 'CREDIT' : 'CREDITS'})`
                            : `${pack.priceCredits} ${pack.priceCredits === 1 ? 'CREDIT' : 'CREDITS'} REQUIRED`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPackPages > 1 && (
            <ConsolePaginationBar
              currentPage={packsPage}
              totalPages={totalPackPages}
              onPageChange={setPacksPage}
              totalItems={displayedPacks.length}
              pageSize={PACKS_PER_PAGE}
              label="PACKS PAGE"
            />
          )}
        </div>
      </ConsoleModalShell>

      {/* ================= INSPECT CARD MODAL ================= */}
      {renderInspectCardModal()}
    </>
  );
};
