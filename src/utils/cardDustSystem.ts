import { CustomCard, CustomCardCategory, CustomCardTier } from '../types';
import { safeGetItem, safeSetItem } from './storageCleaner';
import { getProfileStorageKey } from './profileSystem';
import {
  getStoreCollection,
  saveStoreCollection,
  StoreCollection,
  addChampionCredits,
  getChampionCredits,
} from './storeCollectionSystem';
import { getAllDefaultCustomCards } from './cardDatabaseSystem';
import {
  getStoredGlobalIconPoints,
  modifyStoredGlobalIconPoints,
} from './legendCareerSystem';

// ============================================================================
// STORAGE KEYS & EVENT CONSTANTS
// ============================================================================

export const CARD_DUST_BALANCE_KEY = 'drawstar_card_dust_balance_v1';
export const DUST_UPGRADES_KEY = 'drawstar_dust_upgrades_v1';

function getScopedKey(base: string): string {
  return getProfileStorageKey(base);
}

// ============================================================================
// DUST VALUE DEFINITIONS
// ============================================================================

/**
 * Positive Tiers Base Dust:
 * - Bronze: 25
 * - Silver: 100
 * - Gold: 200
 * - Legendary: 500
 * - Iconic: 1000
 */
export const POSITIVE_TIER_DUST: Record<string, number> = {
  bronze: 25,
  silver: 100,
  gold: 200,
  legendary: 500,
  iconic: 1000,
};

/**
 * Negative Tiers:
 * "negative cards give the same in tiers but halved so lowest tier is 12.5 instead of 25 and so on and disaster gives 1"
 * - Scrap (Tier 1 ~ Bronze): 12.5
 * - Rust (Tier 2 ~ Silver): 50
 * - Ash (Tier 3 ~ Gold): 100
 * - Disaster (Tier 4): 1
 */
export const NEGATIVE_TIER_DUST: Record<string, number> = {
  scrap: 12.5,
  rust: 50,
  ash: 100,
  disaster: 1,
};

/**
 * Double-Edged Tiers:
 * "double edged give randomly either 1 or double as much as regular ones at a 50% rate (50/50 chance of 1 or double)"
 * - Obsidian Knife (Tier 1 ~ Bronze, base 25): 1 OR 50 (expected 25.5)
 * - Copper Dagger (Tier 2 ~ Silver, base 100): 1 OR 200 (expected 100.5)
 * - Steel Blade (Tier 3 ~ Gold, base 200): 1 OR 400 (expected 200.5)
 * - Muramasa Blade (Tier 4 ~ Legendary/Icon, base 500): 1 OR 1000 (expected 500.5)
 */
export const DOUBLE_EDGED_TIER_DOUBLES: Record<string, number> = {
  obsidian_knife: 50,
  copper_dagger: 200,
  copper_knife: 200,
  stone_dagger: 200,
  steel_blade: 400,
  muramasa_blade: 1000,
};

// ============================================================================
// UPGRADE DEFINITIONS
// ============================================================================

export type DustUpgradeId =
  | 'reroll_runs'
  | 'free_reroll_per_career'
  | 'extra_draw_parents'
  | 'extra_draw_youth'
  | 'extra_draw_career'
  | 'extra_draw_sponsor'
  | 'extra_draw_life'
  | 'extra_draw_agent'
  | 'extra_draw_street'
  | 'extra_draw_match_day'
  | 'extra_draw_interview'
  | 'starting_stats_boost_15';

export interface DustUpgradeDefinition {
  id: DustUpgradeId;
  name: string;
  category: 'general' | 'extra_card' | 'stats';
  costDust: number;
  iconName: string;
  description: string;
  effectLabel: string;
  categoryKey?: CustomCardCategory | string;
}

export const DUST_UPGRADE_DEFINITIONS: DustUpgradeDefinition[] = [
  {
    id: 'free_reroll_per_career',
    name: '1 Free Reroll per Unique Career',
    category: 'general',
    costDust: 5000,
    iconName: 'RotateCcw',
    description:
      'Adds a Free Reroll button when drawing cards in Unique Career (Parent, Youth, Street, or Career draws). Can only be used once per career; once used, it disappears for that run.',
    effectLabel: '1 Free Card Reroll per Unique Career',
  },
  {
    id: 'reroll_runs',
    name: 'Tactical Reroll Protocol',
    category: 'general',
    costDust: 1000,
    iconName: 'Dices',
    description: 'Unlocks the ability to reroll card offerings during your Unique Career runs for 5 Champion Coins per reroll.',
    effectLabel: 'Unlock Rerolls (5 Champion Coins)',
  },
  {
    id: 'starting_stats_boost_15',
    name: 'Prodigy Talent Surge',
    category: 'stats',
    costDust: 1000,
    iconName: 'Zap',
    description: 'Permanently grants +15 bonus starting stat attribute points to spend when initializing any new career run.',
    effectLabel: '+15 Starting Stat Points',
  },
  {
    id: 'extra_draw_parents',
    name: '1 Extra Parent Card Draw',
    category: 'extra_card',
    costDust: 2000,
    iconName: 'HeartHandshake',
    description: 'Draw 4 cards instead of 3 during Parent card draws in Unique Career.',
    effectLabel: '+1 Extra Parent Card Choice (Draw 4, Pick 1)',
    categoryKey: 'parents',
  },
  {
    id: 'extra_draw_youth',
    name: '1 Extra Youth Card Draw',
    category: 'extra_card',
    costDust: 2000,
    iconName: 'Award',
    description: 'Draw 4 cards instead of 3 during Youth card draws in Unique Career.',
    effectLabel: '+1 Extra Youth Card Choice (Draw 4, Pick 1)',
    categoryKey: 'youth',
  },
  {
    id: 'extra_draw_career',
    name: '1 Extra Career Card Draw',
    category: 'extra_card',
    costDust: 2000,
    iconName: 'Shield',
    description: 'Draw 4 cards instead of 3 during Pre-Season & Mid-Season Career draws in Unique Career.',
    effectLabel: '+1 Extra Career Card Choice (Draw 4, Pick 1)',
    categoryKey: 'career',
  },
  {
    id: 'extra_draw_sponsor',
    name: 'Commercial Deal Roster',
    category: 'extra_card',
    costDust: 1000,
    iconName: 'Briefcase',
    description: 'Draw 4 cards instead of 3 when negotiating commercial endorsements & boot deals.',
    effectLabel: '+1 Extra Sponsor Card Choice (Draw 4, Pick 1)',
    categoryKey: 'sponsor',
  },
  {
    id: 'extra_draw_life',
    name: 'Lifestyle Spotlight',
    category: 'extra_card',
    costDust: 1000,
    iconName: 'Sparkles',
    description: 'Draw 4 cards instead of 3 on off-pitch media, luxury lifestyle & social events.',
    effectLabel: '+1 Extra Lifestyle Card Choice (Draw 4, Pick 1)',
    categoryKey: 'life',
  },
  {
    id: 'extra_draw_agent',
    name: 'Boardroom Advisory Network',
    category: 'extra_card',
    costDust: 1000,
    iconName: 'UserCheck',
    description: 'Draw 4 cards instead of 3 on agent strategy, tactical guidance & leverage negotiations.',
    effectLabel: '+1 Extra Agent Card Choice (Draw 4, Pick 1)',
    categoryKey: 'agent',
  },
  {
    id: 'extra_draw_street',
    name: '1 Extra Street Card Draw',
    category: 'extra_card',
    costDust: 2000,
    iconName: 'Flame',
    description: 'Draw 4 cards instead of 3 during Street card draws in Unique Career.',
    effectLabel: '+1 Extra Street Card Choice (Draw 4, Pick 1)',
    categoryKey: 'street',
  },
  {
    id: 'extra_draw_match_day',
    name: 'Clutch Matchday Intel',
    category: 'extra_card',
    costDust: 1000,
    iconName: 'Activity',
    description: 'Draw 4 cards instead of 3 on high-stakes matchday condition modifiers.',
    effectLabel: '+1 Extra Match Day Card Choice (Draw 4, Pick 1)',
    categoryKey: 'match_day',
  },
  {
    id: 'extra_draw_interview',
    name: 'Press Room Charisma',
    category: 'extra_card',
    costDust: 1000,
    iconName: 'MessageSquare',
    description: 'Draw 4 cards instead of 3 on post-match interviews & media soundbites.',
    effectLabel: '+1 Extra Interview Card Choice (Draw 4, Pick 1)',
    categoryKey: 'interview',
  },
];

// ============================================================================
// LISTENERS & REACTIVITY
// ============================================================================

const dustListeners = new Set<(dust: number) => void>();
const upgradesListeners = new Set<(upgrades: string[]) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('drawstar_profile_switched', () => {
    const dust = getCardDustBalance();
    dustListeners.forEach((fn) => {
      try {
        fn(dust);
      } catch {}
    });

    const up = getPurchasedDustUpgrades();
    upgradesListeners.forEach((fn) => {
      try {
        fn(up);
      } catch {}
    });
  });
}

// ============================================================================
// DUST BALANCE GET / SET / SUBSCRIBE
// ============================================================================

export function getCardDustBalance(): number {
  const key = getScopedKey(CARD_DUST_BALANCE_KEY);
  try {
    const raw = safeGetItem(key);
    if (raw !== null && raw !== undefined) {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading Card Dust balance:', err);
  }
  return 0;
}

export function setCardDustBalance(dust: number): number {
  const safeDust = Math.max(0, Math.round(dust * 10) / 10); // Maintain 1 decimal precision (e.g. 12.5)
  const key = getScopedKey(CARD_DUST_BALANCE_KEY);
  try {
    safeSetItem(key, String(safeDust));
  } catch (err) {
    console.warn('Error saving Card Dust balance:', err);
  }
  dustListeners.forEach((fn) => {
    try {
      fn(safeDust);
    } catch {}
  });
  return safeDust;
}

export function addCardDust(amount: number): number {
  if (amount <= 0) return getCardDustBalance();
  const current = getCardDustBalance();
  return setCardDustBalance(current + amount);
}

export function deductCardDust(amount: number): boolean {
  if (amount <= 0) return true;
  const current = getCardDustBalance();
  if (current < amount) return false;
  setCardDustBalance(current - amount);
  return true;
}

export function subscribeToCardDust(listener: (dust: number) => void): () => void {
  dustListeners.add(listener);
  return () => dustListeners.delete(listener);
}

// ============================================================================
// CARD DUST EVALUATION
// ============================================================================

/**
 * Calculates the Dust value for a specific card copy:
 * - Bronze: 25
 * - Silver: 100
 * - Gold: 200
 * - Legendary: 500
 * - Iconic: 1000
 * - Negative cards: Halved by tier (Scrap 12.5, Rust 50, Ash 100, Disaster 1)
 * - Double-Edged: 50% chance 1, 50% chance double (or expected value if isPreview=true)
 */
export function getCardRecycleDustValue(card: CustomCard, isPreview: boolean = false): number {
  if (!card) return 0;

  const tier = (card.tier || '').toString().toLowerCase();
  const effectCat = (card.effectCategory || '').toString().toLowerCase();

  // 1. DISASTER CARD
  if (tier === 'disaster' || card.name.toLowerCase().includes('disaster')) {
    return 1;
  }

  // 2. DOUBLE-EDGED CARDS
  const isDoubleEdged =
    effectCat === 'double_edged' ||
    Boolean(DOUBLE_EDGED_TIER_DOUBLES[tier]) ||
    ['obsidian_knife', 'copper_dagger', 'copper_knife', 'stone_dagger', 'steel_blade', 'muramasa_blade'].includes(tier);

  if (isDoubleEdged) {
    const doubleValue = DOUBLE_EDGED_TIER_DOUBLES[tier] || 50;
    if (isPreview) {
      // Expected mathematical value: 50% * 1 + 50% * double
      return 1 * 0.5 + doubleValue * 0.5;
    }
    // Live roll: 50/50 chance of 1 OR double
    return Math.random() < 0.5 ? 1 : doubleValue;
  }

  // 3. NEGATIVE CARDS (Scrap, Rust, Ash, or effectCategory === 'negative')
  const isNegative =
    effectCat === 'negative' ||
    Boolean(NEGATIVE_TIER_DUST[tier]) ||
    ['scrap', 'rust', 'ash', 'disaster'].includes(tier);

  if (isNegative) {
    if (NEGATIVE_TIER_DUST[tier] !== undefined) {
      return NEGATIVE_TIER_DUST[tier];
    }
    // Generic negative tier fallback: halve regular tier
    const baseVal = POSITIVE_TIER_DUST[tier] || 25;
    return baseVal / 2;
  }

  // 4. POSITIVE CARDS (Bronze, Silver, Gold, Legendary, Iconic)
  if (POSITIVE_TIER_DUST[tier] !== undefined) {
    return POSITIVE_TIER_DUST[tier];
  }

  return 25; // Default bronze fallback
}

// ============================================================================
// RECYCLING CARDS & BATCH RECYCLE DUPLICATES
// ============================================================================

export interface DuplicateSummaryItem {
  card: CustomCard;
  ownedCount: number;
  duplicateCount: number;
  estimatedDustPerCopy: number;
  totalEstimatedDust: number;
}

export interface DuplicateSummaryResult {
  totalDuplicates: number;
  estimatedDust: number;
  items: DuplicateSummaryItem[];
}

/**
 * Returns a summary of all duplicate card copies in the player's collection.
 */
export function getDuplicateCardsSummary(collection?: StoreCollection): DuplicateSummaryResult {
  const col = collection ?? getStoreCollection();
  const allCards = getAllDefaultCustomCards();

  let totalDuplicates = 0;
  let estimatedDust = 0;
  const items: DuplicateSummaryItem[] = [];

  allCards.forEach((card) => {
    const count = col[card.id] || 0;
    if (count > 1) {
      const duplicateCount = count - 1;
      const estimatedDustPerCopy = getCardRecycleDustValue(card, true);
      const totalCardDust = duplicateCount * estimatedDustPerCopy;

      totalDuplicates += duplicateCount;
      estimatedDust += totalCardDust;

      items.push({
        card,
        ownedCount: count,
        duplicateCount,
        estimatedDustPerCopy,
        totalEstimatedDust: totalCardDust,
      });
    }
  });

  return {
    totalDuplicates,
    estimatedDust: Math.round(estimatedDust * 10) / 10,
    items,
  };
}

/**
 * Recycles ALL duplicated cards in the collection down to 1 copy each.
 * All duplicates are turned into Dust based on their tier rules.
 * Keeps exactly 1 of each card in the player's collection.
 */
export function recycleAllDuplicateCards(): {
  totalRecycled: number;
  totalDustEarned: number;
  remainingDust: number;
  recycledBreakdown: Record<string, number>;
} {
  const currentCollection = { ...getStoreCollection() };
  const allCards = getAllDefaultCustomCards();
  const cardMap = new Map<string, CustomCard>(allCards.map((c) => [c.id, c]));

  let totalRecycled = 0;
  let totalDustEarned = 0;
  const recycledBreakdown: Record<string, number> = {};

  Object.entries(currentCollection).forEach(([cardId, count]) => {
    if (count > 1) {
      const cardDef = cardMap.get(cardId);
      if (!cardDef) return;

      const copiesToRecycle = count - 1;
      for (let i = 0; i < copiesToRecycle; i++) {
        const dustValue = getCardRecycleDustValue(cardDef, false);
        totalDustEarned += dustValue;
      }

      totalRecycled += copiesToRecycle;
      recycledBreakdown[cardId] = copiesToRecycle;
      // Retain exactly 1 copy of the card!
      currentCollection[cardId] = 1;
    }
  });

  totalDustEarned = Math.round(totalDustEarned * 10) / 10;

  if (totalRecycled > 0) {
    saveStoreCollection(currentCollection);
    addCardDust(totalDustEarned);
  }

  return {
    totalRecycled,
    totalDustEarned,
    remainingDust: getCardDustBalance(),
    recycledBreakdown,
  };
}

/**
 * Recycles specific duplicate copies of a single card down to a target count.
 */
export function recycleSingleCardDuplicate(cardId: string, countToRecycle: number = 1): {
  success: boolean;
  dustEarned: number;
  remainingCopies: number;
  remainingDust: number;
} {
  const currentCollection = { ...getStoreCollection() };
  const currentCount = currentCollection[cardId] || 0;

  if (currentCount <= 1 || countToRecycle <= 0) {
    return {
      success: false,
      dustEarned: 0,
      remainingCopies: currentCount,
      remainingDust: getCardDustBalance(),
    };
  }

  const allCards = getAllDefaultCustomCards();
  const cardDef = allCards.find((c) => c.id === cardId);
  if (!cardDef) {
    return {
      success: false,
      dustEarned: 0,
      remainingCopies: currentCount,
      remainingDust: getCardDustBalance(),
    };
  }

  // Maximum copies that can be recycled while keeping 1 copy
  const maxRecyclable = currentCount - 1;
  const actualRecycle = Math.min(countToRecycle, maxRecyclable);

  let earnedDust = 0;
  for (let i = 0; i < actualRecycle; i++) {
    earnedDust += getCardRecycleDustValue(cardDef, false);
  }
  earnedDust = Math.round(earnedDust * 10) / 10;

  currentCollection[cardId] = currentCount - actualRecycle;
  saveStoreCollection(currentCollection);
  addCardDust(earnedDust);

  return {
    success: true,
    dustEarned: earnedDust,
    remainingCopies: currentCollection[cardId],
    remainingDust: getCardDustBalance(),
  };
}

// ============================================================================
// DUST UPGRADES STORE PERSISTENCE
// ============================================================================

export function getPurchasedDustUpgrades(): string[] {
  try {
    const raw = safeGetItem(getScopedKey('drawstar_dust_upgrades_v1'));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isDustUpgradePurchased(upgradeId: DustUpgradeId | string): boolean {
  return getPurchasedDustUpgrades().includes(upgradeId);
}

export function purchaseDustUpgrade(upgradeId: DustUpgradeId): {
  success: boolean;
  errorMessage?: string;
  remainingDust: number;
} {
  const upgradeDef = DUST_UPGRADE_DEFINITIONS.find((u) => u.id === upgradeId);
  if (!upgradeDef) {
    return {
      success: false,
      errorMessage: 'Unknown upgrade ID.',
      remainingDust: getCardDustBalance(),
    };
  }

  const purchased = getPurchasedDustUpgrades();
  if (purchased.includes(upgradeId)) {
    return {
      success: false,
      errorMessage: `"${upgradeDef.name}" has already been unlocked!`,
      remainingDust: getCardDustBalance(),
    };
  }

  const currentDust = getCardDustBalance();
  if (currentDust < upgradeDef.costDust) {
    return {
      success: false,
      errorMessage: `Insufficient Card Dust! "${upgradeDef.name}" requires ${upgradeDef.costDust} Dust (You have ${currentDust}).`,
      remainingDust: currentDust,
    };
  }

  // Deduct dust and save upgrade
  deductCardDust(upgradeDef.costDust);
  purchased.push(upgradeId);
  safeSetItem(getScopedKey(DUST_UPGRADES_KEY), JSON.stringify(purchased));

  upgradesListeners.forEach((fn) => {
    try {
      fn(purchased);
    } catch {}
  });

  return {
    success: true,
    remainingDust: getCardDustBalance(),
  };
}

export function subscribeToDustUpgrades(listener: (upgrades: string[]) => void): () => void {
  upgradesListeners.add(listener);
  return () => upgradesListeners.delete(listener);
}

// ============================================================================
// FIXED DUST EXCHANGES (CONVERSOR)
// ============================================================================

export const DUST_EXCHANGE_CREDIT_COST = 10;
export const DUST_EXCHANGE_CREDIT_REWARD = 1;
export const DUST_EXCHANGE_ICON_POINTS_COST = 100000;
export const DUST_EXCHANGE_ICON_POINTS_REWARD = 1000;

export function exchangeDustForCredit(): {
  success: boolean;
  errorMessage?: string;
  remainingDust: number;
  newCredits: number;
} {
  const currentDust = getCardDustBalance();
  if (currentDust < DUST_EXCHANGE_CREDIT_COST) {
    return {
      success: false,
      errorMessage: `Insufficient Card Dust! Needs ${DUST_EXCHANGE_CREDIT_COST} Dust (You have ${currentDust}).`,
      remainingDust: currentDust,
      newCredits: getChampionCredits(),
    };
  }
  deductCardDust(DUST_EXCHANGE_CREDIT_COST);
  const newCredits = addChampionCredits(DUST_EXCHANGE_CREDIT_REWARD);
  return {
    success: true,
    remainingDust: getCardDustBalance(),
    newCredits,
  };
}

export function exchangeDustForIconPoints(): {
  success: boolean;
  errorMessage?: string;
  remainingDust: number;
  newIconPoints: number;
} {
  const currentDust = getCardDustBalance();
  if (currentDust < DUST_EXCHANGE_ICON_POINTS_COST) {
    return {
      success: false,
      errorMessage: `Insufficient Card Dust! Needs ${DUST_EXCHANGE_ICON_POINTS_COST.toLocaleString()} Dust (You have ${currentDust.toLocaleString()}).`,
      remainingDust: currentDust,
      newIconPoints: getStoredGlobalIconPoints(),
    };
  }
  deductCardDust(DUST_EXCHANGE_ICON_POINTS_COST);
  const newIconPoints = modifyStoredGlobalIconPoints(DUST_EXCHANGE_ICON_POINTS_REWARD);
  return {
    success: true,
    remainingDust: getCardDustBalance(),
    newIconPoints,
  };
}

// ============================================================================
// MATCH FILTERS & SPECIAL HAIRS DUST UNLOCKS
// ============================================================================

export const MATCH_FILTER_DUST_COST = 1000;
export const SPECIAL_HAIR_DUST_COST = 1000;

function getSpecialHairTypeMap(): Record<string, string> {
  return {
    'el-shaarawy-spikes': 'hair_el_shaarawy',
    'taribo-west': 'hair_taribo_west',
    'valderrama-afro': 'hair_valderrama',
    'davids-goggles': 'hair_davids_goggles',
    'pogba-razor': 'hair_pogba_razor',
    'beckham-mohawk': 'hair_beckham_mohawk',
    'cucurella-afro': 'hair_cucurella_afro',
    'vidal-crest': 'hair_vidal_crest',
    'ronaldo-noodle': 'hair_ronaldo_noodle',
    'puyol-curly': 'hair_puyol_curly',
    'neymar-mohawk': 'hair_neymar_mohawk',
    'r9-2002': 'hair_r9_2002',
  };
}

export function getMatchFilterUpgradeId(filterId: string): string {
  return `unlock_filter_${filterId}`;
}

export function isMatchFilterUnlocked(filterId: string): boolean {
  if (!filterId || filterId === 'none') return true;
  return isDustUpgradePurchased(getMatchFilterUpgradeId(filterId));
}

export function getSpecialHairUpgradeId(hairId: string): string {
  return `unlock_hair_${hairId}`;
}

export function isSpecialHairDustUnlocked(hairIdOrType: string): boolean {
  if (!hairIdOrType) return false;
  const resolvedId = getSpecialHairTypeMap()[hairIdOrType] || hairIdOrType;
  return isDustUpgradePurchased(getSpecialHairUpgradeId(resolvedId));
}

function purchaseGenericDustUnlock(
  upgradeId: string,
  displayName: string,
  costDust: number
): {
  success: boolean;
  errorMessage?: string;
  remainingDust: number;
} {
  const purchased = getPurchasedDustUpgrades();
  if (purchased.includes(upgradeId)) {
    return {
      success: false,
      errorMessage: `"${displayName}" has already been unlocked!`,
      remainingDust: getCardDustBalance(),
    };
  }

  const currentDust = getCardDustBalance();
  if (currentDust < costDust) {
    return {
      success: false,
      errorMessage: `Insufficient Card Dust! "${displayName}" requires ${costDust.toLocaleString()} Dust (You have ${currentDust.toLocaleString()}).`,
      remainingDust: currentDust,
    };
  }

  deductCardDust(costDust);
  purchased.push(upgradeId);
  safeSetItem(getScopedKey(DUST_UPGRADES_KEY), JSON.stringify(purchased));

  upgradesListeners.forEach((fn) => {
    try {
      fn(purchased);
    } catch {}
  });

  return {
    success: true,
    remainingDust: getCardDustBalance(),
  };
}

export function purchaseMatchFilterUnlock(
  filterId: string,
  filterName: string
): {
  success: boolean;
  errorMessage?: string;
  remainingDust: number;
} {
  if (!filterId || filterId === 'none') {
    return {
      success: false,
      errorMessage: 'Standard Clean filter is already unlocked by default.',
      remainingDust: getCardDustBalance(),
    };
  }
  return purchaseGenericDustUnlock(getMatchFilterUpgradeId(filterId), filterName, MATCH_FILTER_DUST_COST);
}

export function purchaseSpecialHairUnlock(
  hairId: string,
  hairName: string
): {
  success: boolean;
  errorMessage?: string;
  remainingDust: number;
} {
  return purchaseGenericDustUnlock(getSpecialHairUpgradeId(hairId), hairName, SPECIAL_HAIR_DUST_COST);
}

// ============================================================================
// IN-GAME CHECK HELPERS
// ============================================================================

/**
 * Checks if Rerolls are unlocked for Unique Career runs.
 */
export function isRerollUnlocked(): boolean {
  return isDustUpgradePurchased('reroll_runs');
}

/**
 * Checks if the once-per-career Free Reroll upgrade is unlocked via Card Dust.
 */
export function isFreeCareerRerollUnlocked(): boolean {
  return isDustUpgradePurchased('free_reroll_per_career');
}

/**
 * Checks if the player has unlocked the +1 Extra Card choice upgrade for a specific category.
 */
export function hasExtraCardChoice(category: string): boolean {
  const norm = category.toLowerCase().trim();
  const upgradeId = `extra_draw_${norm}`;
  return isDustUpgradePurchased(upgradeId);
}

/**
 * Returns bonus starting stat points from Dust Upgrades (+15 if unlocked).
 */
export function getStartingStatBonus(): number {
  return isDustUpgradePurchased('starting_stats_boost_15') ? 15 : 0;
}
