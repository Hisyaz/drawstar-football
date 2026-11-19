import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Layers,
  Sparkles,
  Shield,
  Award,
  HeartHandshake,
  Briefcase,
  UserCheck,
  Flame,
  Info,
  ChevronRight,
  Zap,
  CheckCircle2,
  Lock,
  RotateCcw,
  Crown,
  Dices,
  Activity,
  MessageSquare,
  Monitor,
  Tv,
  Gamepad2,
  Film,
  BookOpen,
  Cpu,
  Clapperboard,
  Sun,
  Eye,
  Star,
  Crosshair,
  ShieldAlert,
  Compass,
  Trophy,
  Coins,
} from 'lucide-react';
import { CustomCard, CustomCardCategory, CustomCardTier, StoreUpgradeItem } from '../types';
import {
  getStoreCollection,
  subscribeToStoreCollection,
  StoreCollection,
  getNewCardQueues,
  subscribeToNewCardQueues,
  getNewCardCount,
  NewCardQueues,
  isCardEligibleForUniqueCareerActiveDeck,
  getChampionCredits,
  subscribeToChampionCredits,
} from '../utils/storeCollectionSystem';
import { getAllDefaultCustomCards } from '../utils/cardDatabaseSystem';
import {
  getCardDustBalance,
  subscribeToCardDust,
  recycleAllDuplicateCards,
  recycleSingleCardDuplicate,
  getDuplicateCardsSummary,
  getCardRecycleDustValue,
  DUST_UPGRADE_DEFINITIONS,
  getPurchasedDustUpgrades,
  subscribeToDustUpgrades,
  purchaseDustUpgrade,
  DustUpgradeDefinition,
  DUST_EXCHANGE_CREDIT_COST,
  DUST_EXCHANGE_CREDIT_REWARD,
  DUST_EXCHANGE_ICON_POINTS_COST,
  DUST_EXCHANGE_ICON_POINTS_REWARD,
  exchangeDustForCredit,
  exchangeDustForIconPoints,
  MATCH_FILTER_DUST_COST,
  SPECIAL_HAIR_DUST_COST,
  getMatchFilterUpgradeId,
  getSpecialHairUpgradeId,
  purchaseMatchFilterUnlock,
  purchaseSpecialHairUnlock,
} from '../utils/cardDustSystem';
import { getStoredGlobalIconPoints } from '../utils/legendCareerSystem';
import { ALL_RETRO_FILTERS, RetroFilterDefinition } from '../gameplay/game/graphicsConfig';
import { SPECIAL_HAIR_ITEMS } from '../data/storeItems';
import {
  PixelCardsIcon,
  PixelSparklesIcon,
  PixelStarIcon,
  PixelCheckIcon,
  PixelCloseIcon,
  PixelCoinIcon,
} from './pixel/PixelIcons';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';
import { isHighQualityModeActive, triggerAppCelebration } from '../utils/graphicSettingsSystem';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';
import { isTutorialEnabled, hasSeenTutorial, markTutorialSeen } from '../utils/tutorialSystem';
import { DustTutorialModal } from './RetroPagedTutorialModal';

interface CardCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onOpenStore?: () => void;
  t?: (key: string) => string;
}

const CATEGORY_NAMES: Record<string, string> = {
  all: 'All Categories',
  parents: 'Parent Cards',
  youth: 'Youth Cards',
  career: 'Career Cards',
  sponsor: 'Sponsor Cards',
  life: 'Lifestyle Cards',
  agent: 'Agent Cards',
  street: 'Street Cards',
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  bronze: { bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-700/60', label: 'Bronze' },
  silver: { bg: 'bg-slate-800/90', text: 'text-slate-200', border: 'border-slate-500/60', label: 'Silver' },
  gold: { bg: 'bg-yellow-950/80', text: 'text-yellow-300', border: 'border-yellow-500/80', label: 'Gold' },
  legendary: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-500/80', label: 'Legendary' },
  iconic: { bg: 'bg-amber-900/80', text: 'text-amber-200', border: 'border-amber-400/90', label: 'Iconic' },
  obsidian_knife: { bg: 'bg-stone-900', text: 'text-stone-300', border: 'border-stone-600', label: 'Obsidian Knife' },
  copper_dagger: { bg: 'bg-orange-950/80', text: 'text-orange-300', border: 'border-orange-600/70', label: 'Copper Dagger' },
  steel_blade: { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-500/70', label: 'Steel Blade' },
  muramasa_blade: { bg: 'bg-rose-950/90', text: 'text-rose-300', border: 'border-rose-500/80', label: 'Muramasa Blade' },
  scrap: { bg: 'bg-zinc-900', text: 'text-zinc-400', border: 'border-zinc-700', label: 'Scrap' },
  rust: { bg: 'bg-amber-950/90', text: 'text-amber-600', border: 'border-amber-800/60', label: 'Rust' },
  ash: { bg: 'bg-neutral-900', text: 'text-neutral-400', border: 'border-neutral-700', label: 'Ash' },
  disaster: { bg: 'bg-red-950/90', text: 'text-red-400', border: 'border-red-800/80', label: 'Disaster' },
};

export const CardCollectionModal: React.FC<CardCollectionModalProps> = ({
  isOpen,
  onClose,
  showToast,
  onOpenStore,
  t = (s) => s,
}) => {
  const [collection, setCollection] = useState<StoreCollection>(getStoreCollection());
  const [newCardQueues, setNewCardQueues] = useState<NewCardQueues>(getNewCardQueues());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInspectCard, setSelectedInspectCard] = useState<CustomCard | null>(null);
  const [collectionTab, setCollectionTab] = useState<'cards' | 'unlock_exchange' | 'rules'>('cards');
  const [unlockFilter, setUnlockFilter] = useState<'all' | 'exchange' | 'career' | 'filters' | 'hairs'>('all');
  const [cardsPage, setCardsPage] = useState<number>(1);
  const CARDS_PER_PAGE = 8;
  const [dustBalance, setDustBalance] = useState<number>(() => getCardDustBalance());
  const [championCredits, setChampionCredits] = useState<number>(() => getChampionCredits());
  const [globalIconPoints, setGlobalIconPoints] = useState<number>(() => getStoredGlobalIconPoints());
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<string[]>(() => getPurchasedDustUpgrades());
  const [isRecycling, setIsRecycling] = useState<boolean>(false);
  const [showDustTutorial, setShowDustTutorial] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDustTutorial(false);
      return;
    }

    setCollection(getStoreCollection());
    setNewCardQueues(getNewCardQueues());
    setDustBalance(getCardDustBalance());
    setChampionCredits(getChampionCredits());
    setGlobalIconPoints(getStoredGlobalIconPoints());
    setPurchasedUpgrades(getPurchasedDustUpgrades());

    if (isTutorialEnabled() && !hasSeenTutorial('card_collection_dust')) {
      setShowDustTutorial(true);
    }

    const unsubCol = subscribeToStoreCollection((col) => setCollection(col));
    const unsubQueues = subscribeToNewCardQueues((q) => setNewCardQueues(q));
    const unsubDust = subscribeToCardDust((d) => setDustBalance(d));
    const unsubCredits = subscribeToChampionCredits((c) => setChampionCredits(c));
    const unsubUpgrades = subscribeToDustUpgrades((u) => setPurchasedUpgrades(u));

    return () => {
      unsubCol();
      unsubQueues();
      unsubDust();
      unsubCredits();
      unsubUpgrades();
    };
  }, [isOpen]);

  const handleCloseDustTutorial = () => {
    markTutorialSeen('card_collection_dust');
    setShowDustTutorial(false);
  };

  const duplicateSummary = useMemo(() => {
    return getDuplicateCardsSummary(collection);
  }, [collection]);

  const handleRecycleAllDuplicates = () => {
    if (duplicateSummary.totalDuplicates <= 0) {
      showToast(t('NO_DUPLICATES_TO_RECYCLE') || 'No duplicate cards to recycle. You already have 1 copy of each owned card!');
      return;
    }
    setIsRecycling(true);
    haptics.impactHeavy();
    audioManager.playLevelUpSound();

    const result = recycleAllDuplicateCards();
    setCollection(getStoreCollection());
    setDustBalance(result.remainingDust);
    setIsRecycling(false);

    showToast(
      `✨ Recycled ${result.totalRecycled} duplicate cards into +${result.totalDustEarned} Dust! 1 copy of each card was safely preserved.`
    );
  };

  const handleRecycleSingleCard = (card: CustomCard) => {
    const currentCount = collection[card.id] || 0;
    if (currentCount <= 1) {
      showToast(`Cannot recycle: You only have 1 copy of "${card.name}".`);
      return;
    }
    haptics.impactMedium();
    audioManager.playCardFlipSound();

    const result = recycleSingleCardDuplicate(card.id, 1);
    if (result.success) {
      setCollection(getStoreCollection());
      setDustBalance(result.remainingDust);
      showToast(`✨ Recycled 1 duplicate of "${card.name}" for +${result.dustEarned} Dust! (Remaining: x${result.remainingCopies})`);
    }
  };

  const handleExchangeCredit = () => {
    const result = exchangeDustForCredit();
    if (!result.success) {
      haptics.errorBuzz();
      showToast(`⚠️ ${result.errorMessage}`);
      return;
    }
    haptics.mediumTap();
    audioManager.playCardFlipSound();
    setDustBalance(result.remainingDust);
    setChampionCredits(result.newCredits);
    showToast(`🪙 Exchanged ${DUST_EXCHANGE_CREDIT_COST} Dust → +${DUST_EXCHANGE_CREDIT_REWARD} Champion Credit! (Credits: ${result.newCredits.toLocaleString()})`);
  };

  const handleExchangeIconPoints = () => {
    const result = exchangeDustForIconPoints();
    if (!result.success) {
      haptics.errorBuzz();
      showToast(`⚠️ ${result.errorMessage}`);
      return;
    }
    haptics.impactHeavy();
    audioManager.playLevelUpSound();
    triggerAppCelebration({ particleCount: 140, spread: 90 });
    setDustBalance(result.remainingDust);
    setGlobalIconPoints(result.newIconPoints);
    showToast(
      `👑 Exchanged ${DUST_EXCHANGE_ICON_POINTS_COST.toLocaleString()} Dust → +${DUST_EXCHANGE_ICON_POINTS_REWARD.toLocaleString()} Icon Points! Icon Play Unlocked!`
    );
  };

  const handlePurchaseDustUpgrade = (upgrade: DustUpgradeDefinition) => {
    if (purchasedUpgrades.includes(upgrade.id)) {
      showToast(`"${upgrade.name}" is already unlocked!`);
      return;
    }
    const result = purchaseDustUpgrade(upgrade.id);
    if (!result.success) {
      haptics.errorBuzz();
      showToast(`⚠️ ${result.errorMessage}`);
      return;
    }
    haptics.impactHeavy();
    audioManager.playLevelUpSound();
    triggerAppCelebration({ particleCount: 100, spread: 75 });
    setPurchasedUpgrades(getPurchasedDustUpgrades());
    setDustBalance(result.remainingDust);
    showToast(`🎉 Unlocked "${upgrade.name}"! ${upgrade.effectLabel}`);
  };

  const handleUnlockMatchFilter = (filter: RetroFilterDefinition) => {
    const upgradeId = getMatchFilterUpgradeId(filter.id);
    if (purchasedUpgrades.includes(upgradeId)) {
      showToast(`"${filter.name}" match filter is already unlocked!`);
      return;
    }
    const result = purchaseMatchFilterUnlock(filter.id, filter.name);
    if (!result.success) {
      haptics.errorBuzz();
      showToast(`⚠️ ${result.errorMessage}`);
      return;
    }
    haptics.impactHeavy();
    audioManager.playLevelUpSound();
    triggerAppCelebration({ particleCount: 90, spread: 70 });
    setPurchasedUpgrades(getPurchasedDustUpgrades());
    setDustBalance(result.remainingDust);
    showToast(`🎞️ Unlocked Match Filter "${filter.name}"! Equip it in Graphics Settings.`);
  };

  const handleUnlockSpecialHair = (hair: StoreUpgradeItem) => {
    const upgradeId = getSpecialHairUpgradeId(hair.id);
    if (purchasedUpgrades.includes(upgradeId)) {
      showToast(`"${hair.name}" is already unlocked for Unique Career!`);
      return;
    }
    const result = purchaseSpecialHairUnlock(hair.id, hair.name);
    if (!result.success) {
      haptics.errorBuzz();
      showToast(`⚠️ ${result.errorMessage}`);
      return;
    }
    haptics.impactHeavy();
    audioManager.playLevelUpSound();
    triggerAppCelebration({ particleCount: 90, spread: 70 });
    setPurchasedUpgrades(getPurchasedDustUpgrades());
    setDustBalance(result.remainingDust);
    showToast(
      `💈 Unlocked "${hair.name}"! Now available to purchase in Unique Career for €${hair.costEuros.toLocaleString()}.`
    );
  };

  const lockableFilters = useMemo(
    () => ALL_RETRO_FILTERS.filter((f) => f.id !== 'none'),
    []
  );

  const sortedSpecialHairs = useMemo(
    () => [...SPECIAL_HAIR_ITEMS].sort((a, b) => (a.tier || 1) - (b.tier || 1)),
    []
  );

  const featuredCareerUpgradeIds = useMemo(
    () => [
      'free_reroll_per_career',
      'extra_draw_parents',
      'extra_draw_youth',
      'extra_draw_street',
      'extra_draw_career',
    ],
    []
  );

  const featuredCareerUpgrades = useMemo(
    () =>
      featuredCareerUpgradeIds
        .map((id) => DUST_UPGRADE_DEFINITIONS.find((u) => u.id === id))
        .filter((u): u is DustUpgradeDefinition => Boolean(u)),
    [featuredCareerUpgradeIds]
  );

  const additionalDustUpgrades = useMemo(
    () => DUST_UPGRADE_DEFINITIONS.filter((u) => !featuredCareerUpgradeIds.includes(u.id)),
    [featuredCareerUpgradeIds]
  );

  const renderUpgradeIcon = (iconName: string) => {
    switch (iconName) {
      case 'RotateCcw':
        return (
          <div className="w-11 h-11 rounded-xl bg-emerald-950/90 border border-emerald-400/70 flex items-center justify-center text-emerald-300 shadow-sm shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
        );
      case 'HeartHandshake':
        return (
          <div className="w-11 h-11 rounded-xl bg-rose-950/90 border border-rose-400/70 flex items-center justify-center text-rose-300 shadow-sm shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
        );
      case 'Award':
        return (
          <div className="w-11 h-11 rounded-xl bg-sky-950/90 border border-sky-400/70 flex items-center justify-center text-sky-300 shadow-sm shrink-0">
            <Award className="w-5 h-5" />
          </div>
        );
      case 'Flame':
        return (
          <div className="w-11 h-11 rounded-xl bg-orange-950/90 border border-orange-400/70 flex items-center justify-center text-orange-300 shadow-sm shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        );
      case 'Shield':
        return (
          <div className="w-11 h-11 rounded-xl bg-blue-950/90 border border-blue-400/70 flex items-center justify-center text-blue-300 shadow-sm shrink-0">
            <Shield className="w-5 h-5" />
          </div>
        );
      case 'Dices':
        return (
          <div className="w-11 h-11 rounded-xl bg-amber-950/90 border border-amber-400/70 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
            <Dices className="w-5 h-5" />
          </div>
        );
      case 'Zap':
        return (
          <div className="w-11 h-11 rounded-xl bg-yellow-950/90 border border-yellow-400/70 flex items-center justify-center text-yellow-300 shadow-sm shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        );
      case 'Briefcase':
        return (
          <div className="w-11 h-11 rounded-xl bg-teal-950/90 border border-teal-400/70 flex items-center justify-center text-teal-300 shadow-sm shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        );
      case 'Sparkles':
        return (
          <div className="w-11 h-11 rounded-xl bg-purple-950/90 border border-purple-400/70 flex items-center justify-center text-purple-300 shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 'UserCheck':
        return (
          <div className="w-11 h-11 rounded-xl bg-indigo-950/90 border border-indigo-400/70 flex items-center justify-center text-indigo-300 shadow-sm shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        );
      case 'Activity':
        return (
          <div className="w-11 h-11 rounded-xl bg-lime-950/90 border border-lime-400/70 flex items-center justify-center text-lime-300 shadow-sm shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        );
      case 'MessageSquare':
        return (
          <div className="w-11 h-11 rounded-xl bg-cyan-950/90 border border-cyan-400/70 flex items-center justify-center text-cyan-300 shadow-sm shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-600 flex items-center justify-center text-slate-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
    }
  };

  const renderFilterIcon = (filterId: string) => {
    switch (filterId) {
      case 'crt_arcade':
        return (
          <div className="w-11 h-11 rounded-xl bg-cyan-950/90 border border-cyan-400/70 flex items-center justify-center text-cyan-300 shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
        );
      case 'vhs_1994':
        return (
          <div className="w-11 h-11 rounded-xl bg-rose-950/90 border border-rose-400/70 flex items-center justify-center text-rose-300 shrink-0">
            <Tv className="w-5 h-5" />
          </div>
        );
      case 'neo_geo_16bit':
        return (
          <div className="w-11 h-11 rounded-xl bg-emerald-950/90 border border-emerald-400/70 flex items-center justify-center text-emerald-300 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
        );
      case 'vintage_1954':
        return (
          <div className="w-11 h-11 rounded-xl bg-stone-900 border border-amber-500/60 flex items-center justify-center text-amber-200 shrink-0">
            <Film className="w-5 h-5" />
          </div>
        );
      case 'manga_tsubasa':
        return (
          <div className="w-11 h-11 rounded-xl bg-sky-950/90 border border-sky-400/70 flex items-center justify-center text-sky-300 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        );
      case 'cyberpunk_neon':
        return (
          <div className="w-11 h-11 rounded-xl bg-fuchsia-950/90 border border-fuchsia-400/70 flex items-center justify-center text-fuchsia-300 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
        );
      case 'cinematic_35mm':
      default:
        return (
          <div className="w-11 h-11 rounded-xl bg-yellow-950/90 border border-yellow-400/70 flex items-center justify-center text-yellow-300 shrink-0">
            <Clapperboard className="w-5 h-5" />
          </div>
        );
    }
  };

  const renderSpecialHairIcon = (hairId: string) => {
    switch (hairId) {
      case 'hair_el_shaarawy':
        return (
          <div className="w-11 h-11 rounded-xl bg-red-950/90 border border-red-400/70 flex items-center justify-center text-red-300 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        );
      case 'hair_taribo_west':
        return (
          <div className="w-11 h-11 rounded-xl bg-emerald-950/90 border border-emerald-400/70 flex items-center justify-center text-emerald-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 'hair_valderrama':
        return (
          <div className="w-11 h-11 rounded-xl bg-yellow-950/90 border border-yellow-400/70 flex items-center justify-center text-yellow-300 shrink-0">
            <Sun className="w-5 h-5" />
          </div>
        );
      case 'hair_davids_goggles':
        return (
          <div className="w-11 h-11 rounded-xl bg-orange-950/90 border border-orange-400/70 flex items-center justify-center text-orange-300 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        );
      case 'hair_pogba_razor':
        return (
          <div className="w-11 h-11 rounded-xl bg-violet-950/90 border border-violet-400/70 flex items-center justify-center text-violet-300 shrink-0">
            <Star className="w-5 h-5" />
          </div>
        );
      case 'hair_beckham_mohawk':
        return (
          <div className="w-11 h-11 rounded-xl bg-sky-950/90 border border-sky-400/70 flex items-center justify-center text-sky-300 shrink-0">
            <Crosshair className="w-5 h-5" />
          </div>
        );
      case 'hair_cucurella_afro':
        return (
          <div className="w-11 h-11 rounded-xl bg-blue-950/90 border border-blue-400/70 flex items-center justify-center text-blue-300 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      case 'hair_vidal_crest':
        return (
          <div className="w-11 h-11 rounded-xl bg-rose-950/90 border border-rose-400/70 flex items-center justify-center text-rose-300 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
        );
      case 'hair_ronaldo_noodle':
        return (
          <div className="w-11 h-11 rounded-xl bg-amber-950/90 border border-amber-400/70 flex items-center justify-center text-amber-300 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
        );
      case 'hair_puyol_curly':
        return (
          <div className="w-11 h-11 rounded-xl bg-red-900/80 border border-amber-400/80 flex items-center justify-center text-amber-300 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
        );
      case 'hair_neymar_mohawk':
        return (
          <div className="w-11 h-11 rounded-xl bg-yellow-900/70 border border-emerald-400/80 flex items-center justify-center text-yellow-300 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        );
      case 'hair_r9_2002':
      default:
        return (
          <div className="w-11 h-11 rounded-xl bg-amber-950 border-2 border-yellow-300 flex items-center justify-center text-yellow-300 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
        );
    }
  };

  const renderUnlockExchangeRow = (opts: {
    key: string;
    icon: React.ReactNode;
    name: string;
    badge?: string;
    description: string;
    priceDust: number;
    isUnlocked?: boolean;
    buttonLabel: string;
    unlockedLabel?: string;
    onAction: () => void;
    isExchange?: boolean;
  }) => {
    const canAfford = dustBalance >= opts.priceDust;
    const lockedByInsufficient = !opts.isUnlocked && !canAfford;

    return (
      <div
        key={opts.key}
        className={`grid grid-cols-1 md:grid-cols-[56px_200px_1fr_140px_115px] items-start md:items-center gap-3 p-3 rounded-xl border transition-all ${
          opts.isUnlocked
            ? 'bg-emerald-950/25 border-emerald-500/50'
            : opts.isExchange
            ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400/70'
            : 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/40'
        }`}
      >
        {/* 1. UNIQUE ICON */}
        <div className="flex items-center gap-3 md:justify-center">
          {opts.icon}
          <div className="md:hidden min-w-0">
            <div className="text-sm font-black font-arcade text-white leading-tight">{opts.name}</div>
            {opts.badge && (
              <span className="inline-block mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 uppercase">
                {opts.badge}
              </span>
            )}
          </div>
        </div>

        {/* 2. NAME */}
        <div className="hidden md:block min-w-0">
          <div className="text-sm font-black font-arcade text-white leading-snug">{opts.name}</div>
          {opts.badge && (
            <span className="inline-block mt-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 uppercase">
              {opts.badge}
            </span>
          )}
        </div>

        {/* 3. DESCRIPTION */}
        <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
          {opts.description}
        </p>

        {/* 4. UNLOCK BUTTON */}
        <div className="flex md:justify-center">
          {opts.isUnlocked ? (
            <span className="w-full md:w-auto min-h-[40px] px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-arcade font-black text-[11px] uppercase flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{opts.unlockedLabel || 'UNLOCKED'}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={opts.onAction}
              disabled={lockedByInsufficient}
              className={`w-full md:w-auto min-h-[42px] px-3.5 py-2 rounded-lg font-arcade font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                canAfford
                  ? opts.isExchange
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 border-amber-200 cursor-pointer active:scale-95 shadow-md'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 border-cyan-300 cursor-pointer active:scale-95 shadow-md'
                  : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-70'
              }`}
              title={
                canAfford
                  ? `${opts.buttonLabel} (${opts.priceDust.toLocaleString()} Dust)`
                  : `Need ${opts.priceDust.toLocaleString()} Dust (You have ${dustBalance.toLocaleString()})`
              }
            >
              {!canAfford && <Lock className="w-3.5 h-3.5 shrink-0" />}
              <span>{opts.buttonLabel}</span>
            </button>
          )}
        </div>

        {/* 5. PRICE */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 text-right font-mono">
          <span className="md:hidden text-[11px] text-slate-400 uppercase font-bold">Price:</span>
          <span
            className={`text-xs sm:text-sm font-black tabular-nums px-2.5 py-1 rounded-lg border ${
              opts.isUnlocked
                ? 'bg-slate-900/60 border-slate-800 text-slate-400 line-through'
                : canAfford
                ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200'
                : 'bg-slate-900 border-slate-700 text-amber-300'
            }`}
          >
            ✨ {opts.priceDust.toLocaleString()} Dust
          </span>
        </div>
      </div>
    );
  };

  const allCanonicalCards = useMemo(() => getAllDefaultCustomCards(), []);

  // Stats calculation
  const collectionStats = useMemo(() => {
    let ownedUniqueCount = 0;
    let totalCopiesCount = 0;

    allCanonicalCards.forEach((card) => {
      const count = collection[card.id] || 0;
      if (count > 0) {
        ownedUniqueCount++;
        totalCopiesCount += count;
      }
    });

    return {
      ownedUniqueCount,
      totalPossibleCount: allCanonicalCards.length,
      totalCopiesCount,
    };
  }, [allCanonicalCards, collection]);

  const totalPendingGuarantees = useMemo(() => {
    return Object.values(newCardQueues).reduce((acc, q) => acc + (q?.length || 0), 0);
  }, [newCardQueues]);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return allCanonicalCards.filter((card) => {
      if (selectedCategoryFilter !== 'all') {
        const matches =
          selectedCategoryFilter === 'life'
            ? card.category === 'life'
            : selectedCategoryFilter === 'agent'
            ? card.category === 'agent'
            : card.category.includes(selectedCategoryFilter as any);
        if (!matches) return false;
      }

      if (selectedTierFilter !== 'all') {
        if (selectedTierFilter === 'double_edged') {
          const isDouble =
            card.tier === 'obsidian_knife' ||
            card.tier === 'copper_dagger' ||
            card.tier === 'steel_blade' ||
            card.tier === 'muramasa_blade';
          if (!isDouble) return false;
        } else if (selectedTierFilter === 'negative') {
          const isNeg =
            card.effectCategory === 'negative' ||
            card.tier === 'scrap' ||
            card.tier === 'rust' ||
            card.tier === 'ash' ||
            card.tier === 'disaster';
          if (!isNeg) return false;
        } else if (card.tier !== selectedTierFilter) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(query);
        const matchesDesc = (card.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [allCanonicalCards, selectedCategoryFilter, selectedTierFilter, searchQuery]);

  useEffect(() => {
    setCardsPage(1);
  }, [selectedCategoryFilter, selectedTierFilter, searchQuery, isOpen]);

  const totalCardPages = Math.max(1, Math.ceil(filteredCards.length / CARDS_PER_PAGE));
  const paginatedCards = useMemo(() => {
    const safePage = Math.min(cardsPage, totalCardPages);
    const start = (safePage - 1) * CARDS_PER_PAGE;
    return filteredCards.slice(start, start + CARDS_PER_PAGE);
  }, [filteredCards, cardsPage, totalCardPages]);

  if (!isOpen) return null;

  return (
    <>
      <ConsoleModalShell
        id="card-collection-modal-window"
        isOpen={isOpen}
        onClose={onClose}
        title={t('CARD COLLECTION')}
        subtitle={t('Canonical deck archive across your saves.')}
        badge={t('ALBUM & DECK')}
        icon={<PixelCardsIcon size={22} />}
        accentColor="cyan"
        maxWidthClass="sm:max-w-6xl"
        headerRight={
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-2.5 py-1.5 bg-slate-900 border border-cyan-400/60 rounded-lg text-xs font-mono font-black text-white tabular-nums">
              {collectionStats.ownedUniqueCount}/{collectionStats.totalPossibleCount}
            </div>
            <div className="hidden sm:flex px-2.5 py-1.5 bg-slate-900 border border-amber-500/60 rounded-lg items-center gap-1 text-xs font-mono font-black text-amber-300 tabular-nums">
              <span>✨</span>
              <span>{dustBalance.toLocaleString()}</span>
            </div>
          </div>
        }
        tabs={[
          { id: 'cards', label: t('Cards Archive') || 'Cards Archive', badge: filteredCards.length },
          { id: 'unlock_exchange', label: t('UNLOCK & EXCHANGE') || 'UNLOCK & EXCHANGE' },
          { id: 'rules', label: t('DECK RULES') || 'Deck Rules & Dust' },
        ]}
        activeTabId={collectionTab}
        onTabChange={(id) => setCollectionTab(id as any)}
        bodyClassName="p-3 sm:p-5 bg-[#070b17] space-y-4"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              {onOpenStore && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStore();
                  }}
                  className="min-h-[44px] px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 rounded-lg text-xs font-arcade font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <PixelCoinIcon size={14} />
                  <span>{t('BUY PACKS')}</span>
                </button>
              )}
              <span className="text-cyan-300 font-bold">
                ✨ {dustBalance.toLocaleString()} {t('DUST')}
              </span>
            </div>
            <button
              id="card-collection-modal-close-btn"
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-lg font-arcade font-black text-xs uppercase cursor-pointer active:scale-95"
            >
              {t('CLOSE') || 'Close'}
            </button>
          </div>
        }
      >
        {collectionTab === 'unlock_exchange' ? (
          <div className="space-y-4">
            {/* Live Currency Balances Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
              <div className="p-3 bg-slate-950 border border-cyan-500/50 rounded-xl flex items-center justify-between">
                <span className="text-xs text-cyan-300 uppercase font-bold">Card Dust Balance</span>
                <span className="text-base font-black text-white tabular-nums">
                  ✨ {dustBalance.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-amber-500/50 rounded-xl flex items-center justify-between">
                <span className="text-xs text-amber-300 uppercase font-bold">Champion Credits</span>
                <span className="text-base font-black text-amber-200 tabular-nums">
                  🪙 {championCredits.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-purple-500/50 rounded-xl flex items-center justify-between">
                <span className="text-xs text-purple-300 uppercase font-bold">Icon Play Points</span>
                <span className="text-base font-black text-yellow-200 tabular-nums">
                  👑 {globalIconPoints.toLocaleString()} / 1,000
                </span>
              </div>
            </div>

            {/* Sub-section Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Options' },
                { id: 'exchange', label: 'Fixed Exchanges (2)' },
                { id: 'career', label: 'Unique Career Unlocks (5)' },
                { id: 'filters', label: `Match Filters (${lockableFilters.length})` },
                { id: 'hairs', label: `Special Hairs (${sortedSpecialHairs.length})` },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setUnlockFilter(sub.id as any)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-arcade font-black uppercase border transition-all cursor-pointer ${
                    unlockFilter === sub.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Column Header Legend (Desktop) */}
            <div className="hidden md:grid md:grid-cols-[56px_200px_1fr_140px_115px] gap-3 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] font-mono font-black uppercase text-slate-400">
              <div className="text-center">Icon</div>
              <div>Name</div>
              <div>Description</div>
              <div className="text-center">Unlock / Exchange</div>
              <div className="text-right">Price</div>
            </div>

            {/* 1. FIXED DUST EXCHANGES */}
            {(unlockFilter === 'all' || unlockFilter === 'exchange') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 pt-1">
                  <h3 className="text-xs sm:text-sm font-arcade font-black uppercase text-amber-300 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Fixed Dust Exchanges (Conversor)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Fixed Rates Only</span>
                </div>

                <div className="space-y-2">
                  {renderUnlockExchangeRow({
                    key: 'exchange_10_dust_to_1_credit',
                    icon: (
                      <div className="w-11 h-11 rounded-xl bg-amber-950/90 border border-amber-400/80 flex items-center justify-center shrink-0">
                        <PixelCoinIcon size={22} />
                      </div>
                    ),
                    name: '1 Champion Credit Exchange',
                    badge: 'FIXED EXCHANGE',
                    description: 'Fixed conversion: Spend exactly 10 Card Dust to immediately gain +1 Champion Credit.',
                    priceDust: DUST_EXCHANGE_CREDIT_COST,
                    isUnlocked: false,
                    buttonLabel: 'EXCHANGE',
                    onAction: handleExchangeCredit,
                    isExchange: true,
                  })}

                  {renderUnlockExchangeRow({
                    key: 'exchange_100k_dust_to_1000_icon_points',
                    icon: (
                      <div className="w-11 h-11 rounded-xl bg-purple-950/90 border border-yellow-400/80 flex items-center justify-center text-yellow-300 shrink-0">
                        <Crown className="w-5 h-5" />
                      </div>
                    ),
                    name: 'Icon Play Unlock Exchange',
                    badge: '1,000 ICON PTS',
                    description: 'Fixed conversion: Spend exactly 100,000 Card Dust to gain +1,000 Global Icon Points (unlocks Play as a Legend / Icon Play).',
                    priceDust: DUST_EXCHANGE_ICON_POINTS_COST,
                    isUnlocked: false,
                    buttonLabel: 'EXCHANGE',
                    onAction: handleExchangeIconPoints,
                    isExchange: true,
                  })}
                </div>
              </div>
            )}

            {/* 2. UNIQUE CAREER DRAW & REROLL UNLOCKS */}
            {(unlockFilter === 'all' || unlockFilter === 'career') && (
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-arcade font-black uppercase text-emerald-300 flex items-center gap-2 pt-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Unique Career Card Draw &amp; Reroll Unlocks</span>
                </h3>

                <div className="space-y-2">
                  {featuredCareerUpgrades.map((upg) =>
                    renderUnlockExchangeRow({
                      key: upg.id,
                      icon: renderUpgradeIcon(upg.iconName),
                      name: upg.name,
                      badge: upg.id === 'free_reroll_per_career' ? 'ONCE PER CAREER' : 'DRAW 4 CARDS',
                      description: upg.description,
                      priceDust: upg.costDust,
                      isUnlocked: purchasedUpgrades.includes(upg.id),
                      buttonLabel: 'UNLOCK',
                      onAction: () => handlePurchaseDustUpgrade(upg),
                    })
                  )}
                </div>

                {additionalDustUpgrades.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                      Additional Legacy Card Upgrades
                    </div>
                    {additionalDustUpgrades.map((upg) =>
                      renderUnlockExchangeRow({
                        key: upg.id,
                        icon: renderUpgradeIcon(upg.iconName),
                        name: upg.name,
                        badge: upg.category === 'extra_card' ? 'DRAW 4 CARDS' : 'PERMANENT',
                        description: upg.description,
                        priceDust: upg.costDust,
                        isUnlocked: purchasedUpgrades.includes(upg.id),
                        buttonLabel: 'UNLOCK',
                        onAction: () => handlePurchaseDustUpgrade(upg),
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. MATCH FILTERS (LOCKED BY DEFAULT, 1,000 DUST EACH) */}
            {(unlockFilter === 'all' || unlockFilter === 'filters') && (
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-arcade font-black uppercase text-cyan-300 flex items-center gap-2 pt-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Match Visual Filters (1,000 Dust Each)</span>
                </h3>

                <div className="space-y-2">
                  {lockableFilters.map((filter) =>
                    renderUnlockExchangeRow({
                      key: filter.id,
                      icon: renderFilterIcon(filter.id),
                      name: filter.name,
                      badge: filter.era,
                      description: `${filter.description} (Locked by default — equip inside Graphics Settings once unlocked.)`,
                      priceDust: MATCH_FILTER_DUST_COST,
                      isUnlocked: purchasedUpgrades.includes(getMatchFilterUpgradeId(filter.id)),
                      buttonLabel: 'UNLOCK',
                      onAction: () => handleUnlockMatchFilter(filter),
                    })
                  )}
                </div>
              </div>
            )}

            {/* 4. SPECIAL HAIRSTYLES (ORDERED LOWEST TO HIGHEST TIER, 1,000 DUST EACH) */}
            {(unlockFilter === 'all' || unlockFilter === 'hairs') && (
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-arcade font-black uppercase text-pink-300 flex items-center gap-2 pt-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Special Hairstyles — Tier 2 to Tier 5 (1,000 Dust Each)</span>
                </h3>

                <div className="space-y-2">
                  {sortedSpecialHairs.map((hair) => {
                    const careerCostText = `€${hair.costEuros.toLocaleString()}`;
                    const bonusText = hair.effectSummary || hair.effect || 'Special Hairstyle Bonus';
                    return renderUnlockExchangeRow({
                      key: hair.id,
                      icon: renderSpecialHairIcon(hair.id),
                      name: hair.name,
                      badge: `TIER ${hair.tier}`,
                      description: `${hair.description} Unique Career Purchase Cost: ${careerCostText} • Bonuses: ${bonusText}.`,
                      priceDust: SPECIAL_HAIR_DUST_COST,
                      isUnlocked: purchasedUpgrades.includes(getSpecialHairUpgradeId(hair.id)),
                      buttonLabel: 'UNLOCK',
                      onAction: () => handleUnlockSpecialHair(hair),
                    });
                  })}
                </div>
              </div>
            )}
          </div>
        ) : collectionTab === 'rules' ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
              <div className="p-3 bg-slate-950 border border-blue-500/40 rounded-xl">
                <div className="text-lg sm:text-xl font-black text-white tabular-nums">
                  {collectionStats.ownedUniqueCount}/{collectionStats.totalPossibleCount}
                </div>
                <div className="text-[11px] text-blue-300 uppercase">Unlocked</div>
              </div>
              <div className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl">
                <div className="text-lg sm:text-xl font-black text-amber-300 tabular-nums">
                  x{collectionStats.totalCopiesCount}
                </div>
                <div className="text-[11px] text-amber-200 uppercase">Total Copies</div>
              </div>
              <div className="p-3 bg-slate-950 border border-cyan-500/40 rounded-xl">
                <div className="text-lg sm:text-xl font-black text-cyan-300 tabular-nums">
                  {dustBalance.toLocaleString()}
                </div>
                <div className="text-[11px] text-cyan-200 uppercase">Dust Balance</div>
              </div>
            </div>

            {totalPendingGuarantees > 0 && (
              <div className="p-3.5 bg-yellow-950/60 border border-yellow-400/70 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-yellow-200">
                <PixelSparklesIcon size={18} color="#facc15" />
                <span>
                  {totalPendingGuarantees} guaranteed new card draw(s) queued for your next matching Unique Career event.
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-arcade font-black text-sm uppercase">
                <Zap className="w-4 h-4" />
                <span>{t('UNIQUE CAREER ACTIVE DECK RULES')}</span>
              </div>
              <div className="space-y-3 text-sm leading-relaxed">
                <div className="p-3.5 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-1">
                  <div className="font-bold text-amber-300">1. {t('Universal Baseline')}</div>
                  <p className="text-slate-200">
                    {t('All 15 standard Bronze cards are active by default across all career playthroughs with equal draw weight.')}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-1">
                  <div className="font-bold text-yellow-300">2. {t('Permanent Unlocks')}</div>
                  <p className="text-slate-200">
                    {t('Silver, Gold, Legendary and Iconic cards unlocked via Card Store packs are added permanently into your career draw pool.')}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-1">
                  <div className="font-bold text-rose-300">3. {t('Double-Edged Blades')}</div>
                  <p className="text-slate-200">
                    {t('Copper Daggers, Steel Blades and Muramasa Blades grant massive stat gains at the cost of injury, stamina or discipline risk.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Filter & Search Toolbar (wrap-safe, 44px touch controls) */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search cards by name or effect...')}
                  className="w-full min-h-[44px] pl-9 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 font-sans focus:outline-none focus:border-blue-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:flex items-center gap-2">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  aria-label="Filter cards by category"
                  className="min-h-[44px] px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="all">{t('All Categories')}</option>
                  <option value="parents">{t('Parent Cards')}</option>
                  <option value="youth">{t('Youth Cards')}</option>
                  <option value="career">{t('Career Cards')}</option>
                  <option value="sponsor">{t('Sponsor Cards')}</option>
                  <option value="life">{t('Lifestyle Cards')}</option>
                  <option value="agent">{t('Agent Cards')}</option>
                  <option value="street">{t('Street Cards')}</option>
                </select>

                <select
                  value={selectedTierFilter}
                  onChange={(e) => setSelectedTierFilter(e.target.value)}
                  aria-label="Filter cards by tier"
                  className="min-h-[44px] px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="all">{t('All Tiers')}</option>
                  <option value="bronze">{t('Bronze (Default)')}</option>
                  <option value="silver">{t('Silver')}</option>
                  <option value="gold">{t('Gold')}</option>
                  <option value="legendary">{t('Legendary')}</option>
                  <option value="iconic">{t('Iconic')}</option>
                  <option value="double_edged">{t('Double-Edged Blades')}</option>
                  <option value="negative">{t('Negative / Hazard')}</option>
                </select>
              </div>

              {duplicateSummary.totalDuplicates > 0 ? (
                <button
                  type="button"
                  onClick={handleRecycleAllDuplicates}
                  disabled={isRecycling}
                  className="min-h-[44px] px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-arcade font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-cyan-300 rounded-lg shadow transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
                  <span>{t('RECYCLE DUPLICATES')} ({duplicateSummary.totalDuplicates} → +{duplicateSummary.estimatedDust})</span>
                </button>
              ) : (
                <div className="min-h-[44px] px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('0 DUPLICATES (1 OF EACH KEPT)')}</span>
                </div>
              )}
            </div>

            {filteredCards.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center text-slate-500">
                  <PixelCardsIcon size={24} />
                </div>
                <p className="text-sm font-arcade uppercase text-slate-300">
                  {t('No cards matching current filters')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter('all');
                    setSelectedTierFilter('all');
                    setSearchQuery('');
                  }}
                  className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono uppercase text-blue-300 border border-slate-600 rounded-lg cursor-pointer"
                >
                  {t('Reset Filters')}
                </button>
              </div>
            ) : (
              <>
                <ConsolePaginationBar
                  currentPage={cardsPage}
                  totalPages={totalCardPages}
                  onPageChange={setCardsPage}
                  totalItems={filteredCards.length}
                  pageSize={CARDS_PER_PAGE}
                  label="PAGE"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {paginatedCards.map((card) => {
                    const ownedCount = collection[card.id] || 0;
                    const newCopiesCount = getNewCardCount(card.id);
                    const tierStyle = TIER_COLORS[card.tier] || {
                      bg: 'bg-slate-900',
                      text: 'text-slate-300',
                      border: 'border-slate-700',
                      label: card.tier,
                    };
                    const isOwned = ownedCount > 0;

                    return (
                      <button
                        type="button"
                        key={card.id}
                        id={`collection-card-${card.id}`}
                        onClick={() => {
                          audioManager.playCardFlipSound();
                          haptics.lightTap();
                          setSelectedInspectCard(card);
                        }}
                        className={`p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden text-left active:scale-95 ${
                          newCopiesCount > 0
                            ? 'bg-[#0d1627] border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.25)]'
                            : isOwned
                            ? 'bg-[#0a1020] border-blue-500/70 hover:border-blue-400'
                            : 'bg-[#050810]/80 border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-600'
                        }`}
                      >
                        {isHighQualityModeActive() &&
                          ['silver', 'gold', 'legendary', 'iconic'].includes(card.tier.toLowerCase()) && (
                            <div className="holo-foil-shimmer" />
                          )}

                        <div className="w-full">
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase border rounded ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                            >
                              {tierStyle.label}
                            </span>

                            <div className="flex items-center gap-1">
                              {newCopiesCount > 0 && (
                                <span className="px-1.5 py-0.5 text-[9px] font-mono font-black uppercase bg-yellow-400 text-slate-950 rounded animate-pulse">
                                  ✨ NEW
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 font-mono text-xs font-black border rounded ${
                                  isOwned
                                    ? 'bg-amber-950/90 text-amber-300 border-amber-500/60'
                                    : 'bg-slate-900 text-slate-400 border-slate-800'
                                }`}
                              >
                                x{ownedCount}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-sm font-black font-arcade text-white leading-tight mb-1">
                            {card.name}
                          </h4>

                          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                            {CATEGORY_NAMES[card.category] || card.category}
                          </span>

                          <p className="text-xs text-slate-200 font-sans line-clamp-2 leading-relaxed">
                            {card.description || 'Custom canonical career effect card.'}
                          </p>
                        </div>

                        <div className="w-full mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                          <span className={isOwned ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {isOwned ? t('✓ UNLOCKED') : t('🔒 LOCKED')}
                          </span>
                          <span className="text-blue-400 font-bold">{t('INSPECT ▶')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {totalCardPages > 1 && (
                  <ConsolePaginationBar
                    currentPage={cardsPage}
                    totalPages={totalCardPages}
                    onPageChange={setCardsPage}
                    totalItems={filteredCards.length}
                    pageSize={CARDS_PER_PAGE}
                    label="PAGE"
                  />
                )}
              </>
            )}
          </div>
        )}
      </ConsoleModalShell>

      {/* ================= CARD INSPECTION MODAL (FULLSCREEN MOBILE) ================= */}
      <ConsoleModalShell
        isOpen={Boolean(selectedInspectCard)}
        onClose={() => setSelectedInspectCard(null)}
        title={selectedInspectCard?.name || ''}
        subtitle={selectedInspectCard ? CATEGORY_NAMES[selectedInspectCard.category] || selectedInspectCard.category : ''}
        icon={<PixelCardsIcon size={20} />}
        accentColor="amber"
        maxWidthClass="sm:max-w-lg"
        zIndexClass="z-[70]"
        bodyClassName="p-4 sm:p-6 space-y-4"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedInspectCard(null)}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-black text-xs uppercase rounded-lg cursor-pointer active:scale-95"
            >
              {t('CLOSE')}
            </button>
          </div>
        }
      >
        {selectedInspectCard && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">{t('TIER:')}</span>
                <span
                  className={`text-sm font-mono font-black uppercase ${
                    TIER_COLORS[selectedInspectCard.tier]?.text || 'text-white'
                  }`}
                >
                  {TIER_COLORS[selectedInspectCard.tier]?.label || selectedInspectCard.tier}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">{t('OWNED:')}</span>
                <span className="text-sm font-mono font-black text-amber-300">
                  x{collection[selectedInspectCard.id] || 0}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-black uppercase text-amber-300">
                {t('EFFECT & ATTRIBUTES')}
              </h4>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
                {selectedInspectCard.description}
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase">{t('UNIQUE CAREER DECK:')}</span>
              <span
                className={
                  isCardEligibleForUniqueCareerActiveDeck(selectedInspectCard, collection)
                    ? 'text-emerald-400 font-bold'
                    : 'text-amber-400 font-bold'
                }
              >
                {isCardEligibleForUniqueCareerActiveDeck(selectedInspectCard, collection)
                  ? `✓ ${t('ACTIVE IN DRAW POOL')}`
                  : `🔒 ${t('UNLOCK VIA PACKS')}`}
              </span>
            </div>

            {(collection[selectedInspectCard.id] || 0) > 1 && (
              <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-cyan-200 block">
                    {t('Duplicates Available')}: x{(collection[selectedInspectCard.id] || 0) - 1}
                  </span>
                  <span className="block text-xs text-slate-300 mt-0.5">
                    {t('Recycle 1 extra copy to earn Card Dust for store upgrades.')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRecycleSingleCard(selectedInspectCard)}
                  className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 text-white font-arcade font-black text-xs uppercase rounded-lg flex items-center justify-center gap-1.5 border border-cyan-400 shadow cursor-pointer active:scale-95 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{t('RECYCLE 1')} (+{getCardRecycleDustValue(selectedInspectCard, false)})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </ConsoleModalShell>

      <DustTutorialModal isOpen={showDustTutorial} onClose={handleCloseDustTutorial} />
    </>
  );
};
