import {
  PlayerCardData,
  PlayerConfig,
  Nationality,
  AccessoryType,
  HeadwearType,
  EyewearType,
  NeckTattooType,
  ArmTattooType,
  FaceTattooType,
  EarringType,
  NecklaceType,
} from '../types';
import { EditorTeamData, LeagueDatabase, SquadSlot, TacticalStyle } from '../types/leagueEditor';
import { NationalTeam } from '../types/nationalTeam';
import { InternationalYouthClub } from '../types/youthLeague';
import {
  AppearanceV2,
  ArmTattooV2,
  CanonicalGoalkeeperStats,
  CanonicalOutfieldStats,
  DetailedTactics,
  EarringSlotV2,
  FaceTattooV2,
  FacialHairV2,
  FootballMatchMode,
  FormationName,
  HairColorV2,
  HairDyeV2,
  HairLengthV2,
  HairTextureV2,
  HeadwearV2,
  NeckTattooV2,
  NecklaceV2,
  PlayerAppearance,
  PlayerPlaystyle,
  PlayerRole,
  RatingTier,
  SkinToneV2,
  StreetFormationName,
  SubPosition,
  TacticalPlaystyle,
  TeamDefinition,
  TeamKit,
  TeamRosterPlayer,
  TeamTacticalRoles,
} from '../gameplay/types';
import { StadiumDefinition } from '../gameplay/types/stadium';
import {
  HAIR_COLOR_HEX_V2,
  SKIN_TONE_HEX_V2,
  createDefaultAppearanceV2,
} from '../gameplay/game/appearanceV2';
import {
  getDefaultTactics,
  STREET_1_2_2_2_SLOTS,
  TACTICAL_BOARD_FORMATIONS,
} from '../gameplay/game/formations';
import { resolveStreetStadiumForCity } from '../gameplay/game/streetStadiumGenerator';
import { resolveYouthStadiumForClub } from '../gameplay/game/youthStadiumGenerator';
import {
  CanonicalConfederation,
  SPECIAL_TEAM_IDS,
  resolveCountryConfederation,
  resolveDefaultStadiumForTeam,
  toGameplayConfederation,
} from './confederationStadiumDefaults';
import {
  YOUTH_LEAGUES_DATABASE,
  findYouthTeamAndLeague,
  getYouthLeagueTeamScaledSquad,
  YouthTeamData,
} from '../data/youthLeaguesDatabase';
import { getYouthScaledTeamAndPlayers } from './youthSquadGenerator';
import {
  buildIntlCupEditorTeam,
  resolveIntlYouthCupFinalVenueConfig,
} from './internationalYouthCupEngine';
import {
  getNationalTeamsDatabase,
} from './nationalTeamDatabaseManager';
import {
  resolveU17WorldCupMatchConfig,
  U17NationDescriptor,
} from './u17NationalTeamEngine';
import { injectUserPlayerIntoYouthEditorTeam } from './youthLeagueSimulation';
import {
  buildStreetMatchTeams,
  StreetMatchBuildOptions,
  StreetMatchBuildResult,
} from './streetTeamBuilder';

// ============================================================================
// 1. APPEARANCE CONVERSION (PlayerCardData <-> AppearanceV2 & PlayerAppearance)
// ============================================================================

const SKIN_HEX_TO_V2: Array<[string, SkinToneV2]> = [
  ['#fff2e6', 'pale'],
  ['#ffe0bd', 'pale'],
  ['#ffdbac', 'pale'],
  ['#f7beab', 'fair'],
  ['#f5d0b1', 'fair'],
  ['#ffcd94', 'fair'],
  ['#f1c27d', 'fair'],
  ['#e0ac69', 'tanned'],
  ['#d59a58', 'sun_kissed'],
  ['#c68642', 'sun_kissed'],
  ['#8d5524', 'olive'],
  ['#5c3818', 'dark'],
  ['#3b220c', 'ebony'],
  ['#3b2219', 'ebony'],
  ['#2a1710', 'ebony'],
];

function hexRgbDist(a: string, b: string): number {
  const parse = (hex: string) => {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return [180, 130, 90];
    return [
      parseInt(clean.slice(0, 2), 16) || 0,
      parseInt(clean.slice(2, 4), 16) || 0,
      parseInt(clean.slice(4, 6), 16) || 0,
    ];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

function mapSkinColorToV2(hex?: string): SkinToneV2 {
  if (!hex) return 'olive';
  const low = hex.toLowerCase();
  for (const [candidate, tone] of SKIN_HEX_TO_V2) {
    if (candidate === low) return tone;
  }
  let best: SkinToneV2 = 'olive';
  let bestDist = Infinity;
  for (const [candidate, tone] of SKIN_HEX_TO_V2) {
    const d = hexRgbDist(low, candidate);
    if (d < bestDist) {
      bestDist = d;
      best = tone;
    }
  }
  return best;
}

function mapHairColorToV2(hex?: string): HairColorV2 {
  if (!hex) return 'dark_brown';
  const low = hex.toLowerCase();
  if (low === '#111111' || low === '#09090b' || low === '#18181b') return 'black';
  if (low === '#241408' || low === '#3b220c') return 'dark_brown';
  if (low === '#a66d40') return 'light_brown';
  if (low === '#78350f') return 'auburn';
  if (low === '#e5c158') return 'blonde';
  if (low === '#a52a2a') return 'red';

  const entries = Object.entries(HAIR_COLOR_HEX_V2) as Array<[HairColorV2, string]>;
  let best: HairColorV2 = 'dark_brown';
  let bestDist = Infinity;
  for (const [k, candidate] of entries) {
    const d = hexRgbDist(hex, candidate);
    if (d < bestDist) {
      bestDist = d;
      best = k;
    }
  }
  return best;
}

function mapHairDyeToV2(rootHex?: string, dyeHex?: string): HairDyeV2 {
  if (!dyeHex || dyeHex === 'none' || !rootHex || dyeHex.toLowerCase() === rootHex.toLowerCase()) {
    return 'natural';
  }
  const dyes: Array<[HairDyeV2, string]> = [
    ['silver_white', '#cbd5e1'],
    ['platinum', '#e5e4e2'],
    ['platinum', '#f8fafc'],
    ['red', '#ef4444'],
    ['red', '#dc2626'],
    ['orange', '#f97316'],
    ['yellow', '#ffeb3b'],
    ['yellow', '#facc15'],
    ['pink', '#ff69b4'],
    ['pink', '#ec4899'],
    ['blue', '#00a2ff'],
    ['blue', '#2563eb'],
    ['green', '#00ff66'],
    ['green', '#16a34a'],
  ];
  let best: HairDyeV2 = 'natural';
  let bestDist = 180;
  for (const [dye, candidate] of dyes) {
    const d = hexRgbDist(dyeHex, candidate);
    if (d < bestDist) {
      bestDist = d;
      best = dye;
    }
  }
  return best;
}

function mapHairLengthAndTexture(
  style?: string,
  len?: string,
  specialHair?: string
): { hairLength: HairLengthV2; hairTexture: HairTextureV2 } {
  if (style === 'special' || len === 'special') {
    switch (specialHair) {
      case 'valderrama-afro':
      case 'cucurella-afro':
      case 'puyol-curly':
      case 'afro':
        return { hairLength: 'long', hairTexture: 'curly' };
      case 'davids-goggles':
      case 'locs':
        return { hairLength: 'long', hairTexture: 'dreads' };
      case 'cornrows':
      case 'braid-top':
        return { hairLength: 'medium', hairTexture: 'braids' };
      case 'taribo-west':
        return { hairLength: 'short', hairTexture: 'braids' };
      case 'neymar-mohawk':
      case 'baggio-ponytail':
        return { hairLength: 'long', hairTexture: 'straight' };
      case 'el-shaarawy-spikes':
      case 'beckham-mohawk':
      case 'vidal-crest':
      case 'beckham-fauxhawk':
        return { hairLength: 'fade', hairTexture: 'straight' };
      case 'pogba-razor':
      case 'ronaldo-noodle':
        return { hairLength: 'short', hairTexture: 'curly' };
      case 'r9-2002':
      case 'zidane-bald-ring':
        return { hairLength: 'shaven', hairTexture: 'straight' };
      default:
        return { hairLength: 'short', hairTexture: 'straight' };
    }
  }

  let hairLength: HairLengthV2 = 'short';
  if (len === 'shaved' || len === 'buzzed' || len === 'bald') hairLength = 'shaven';
  else if (len === 'fade' || len === 'very-short') hairLength = 'fade';
  else if (len === 'short') hairLength = 'short';
  else if (len === 'medium') hairLength = 'medium';
  else if (len === 'long') hairLength = 'long';

  let hairTexture: HairTextureV2 = 'straight';
  if (specialHair === 'braids' || style === 'braided' || style === 'braids' || style === 'cornrows') {
    hairTexture = 'braids';
  } else if (specialHair === 'dreads' || style === 'dreads' || style === 'dreadlocks') {
    hairTexture = 'dreads';
  } else if (style === 'curly' || style === 'afro') {
    hairTexture = 'curly';
  } else if (style === 'wavy') {
    hairTexture = 'wavy';
  } else if (style === 'bald' || style === 'buzzcut' || hairLength === 'shaven') {
    hairLength = 'shaven';
    hairTexture = 'straight';
  }

  return { hairLength, hairTexture };
}

function mapFacialHairToV2(fh?: string): FacialHairV2 {
  if (!fh || fh === 'none' || fh === 'clean' || fh === 'clean-shaven') return 'none';
  if (fh === '3-day-beard' || fh === 'stubble' || fh === 'three_day_stubble' || fh === 'pubescent-moustache') {
    return 'three_day_stubble';
  }
  if (fh === 'full-beard' || fh === 'beard' || fh === 'full_beard' || fh === 'wild-beard') {
    return 'full_beard';
  }
  if (fh === 'well-kept' || fh === 'well_kept_beard') return 'well_kept_beard';
  if (fh === 'mutton-chops' || fh === 'mutton_chops' || fh === 'chops') return 'mutton_chops';
  if (fh === 'royal-beard' || fh === 'royal_beard') return 'royal_beard';
  if (fh === 'goatee') return 'goatee';
  if (fh === 'chin-strap' || fh === 'chin_strap') return 'chin_strap';
  if (fh === 'moustache' || fh === 'mustache') return 'mustache';
  if (fh === 'pointy-moustache' || fh === 'pointy_mustache') return 'pointy_mustache';
  if (fh === 'classic-moustache' || fh === 'classic_mustache' || fh === 'handlebar') return 'classic_mustache';
  return 'three_day_stubble';
}

function mapHeadwearToV2(acc?: PlayerCardData['accessories']): HeadwearV2 {
  if (!acc) return 'none';
  const primary = acc.accessory;
  if (primary === 'sports-glasses' || primary === 'classic-glasses') return 'sports_glasses';
  if (primary === 'protective-mask') return 'protective_face_mask';
  if (primary === 'headband') return 'sports_headband';
  if (primary === 'performance-band') return 'performance_elastic_band';
  if (primary === 'none' && !acc.eyewear && !acc.headwear) return 'none';

  if (acc.eyewear === 'sports-glasses' || acc.eyewear === 'classic-glasses') {
    return 'sports_glasses';
  }
  if (acc.eyewear === 'protective-mask') {
    return 'protective_face_mask';
  }
  if (acc.headwear === 'headband') {
    return 'sports_headband';
  }
  if (acc.headwear === 'performance-band') {
    return 'performance_elastic_band';
  }
  return 'none';
}

function mapNecklaceToV2(n?: string): NecklaceV2 {
  if (!n || n === 'none') return 'none';
  if (n === 'dog-tags') return 'military_tag';
  if (n === 'silver-chain') return 'silver_necklace';
  if (n === 'gold-chain') return 'gold_necklace';
  if (n === 'diamond-chain' || n === 'diamonds-incrusted') return 'diamond_encrusted_gold_necklace';
  return 'none';
}

function mapEarringSlot(
  e?: string,
  mat?: string,
  gem?: string
): EarringSlotV2 {
  const style: EarringSlotV2['style'] =
    e === 'small-barbell' ? 'small_barbell'
    : e === 'large-barbell' ? 'large_barbell'
    : e === 'gem' ? 'gem'
    : e === 'silver' || e === 'gold' || e === 'steel' ? 'studs'
    : 'none';
  const material: EarringSlotV2['material'] =
    e === 'gold' ? 'gold'
    : e === 'steel' ? 'steel'
    : mat === 'gold' ? 'gold'
    : mat === 'bronze' ? 'bronze'
    : mat === 'black' ? 'black_steel'
    : mat === 'steel' ? 'steel'
    : 'silver';
  const gemMapped: EarringSlotV2['gem'] =
    gem === 'emerald' ? 'emerald'
    : gem === 'sapphire' ? 'sapphire'
    : gem === 'amethyst' ? 'amethyst'
    : gem === 'white' ? 'white_pearl'
    : 'diamond';
  return { style, material, gem: gemMapped };
}

export interface PlayerRenderExtras {
  rawSkinHex?: string;
  rawHairRootHex?: string;
  rawHairDyeHex?: string;
  specialHair?: string;
  facialHairRaw?: string;
  headbandColor?: string;
  glassesColor?: string;
  regularGlassesDesign?: 'round' | 'square' | 'rectangular';
  regularGlassesFrameColor?: string;
  regularGlassesShade?: string;
  eyewearRaw?: string;
  kitPattern?: string;
  kitCollar?: string;
  kitStyle?: 'normal' | 'loose' | 'tight';
  shirtNumber?: number;
  isGk?: boolean;
  isCaptain?: boolean;
  statBreakActive?: boolean;
  earringStyleRaw?: string;
}

export function extractPlayerRenderExtras(
  player: PlayerCardData,
  kitOverride?: Partial<TeamKit>
): PlayerRenderExtras {
  const isSpecial =
    player.biometrics?.hairLength === 'special' || player.biometrics?.hairStyle === 'special';
  const rawDye = player.biometrics?.hairDye;
  return {
    rawSkinHex: player.biometrics?.skinColor,
    rawHairRootHex: player.biometrics?.hairRoot,
    rawHairDyeHex: rawDye && rawDye !== 'none' ? rawDye : undefined,
    specialHair: isSpecial ? player.biometrics?.specialHair : undefined,
    facialHairRaw: player.biometrics?.facialHair || player.biometrics?.facialHairStyle || 'none',
    headbandColor: player.accessories?.headbandColor,
    glassesColor: player.accessories?.glassesColor || player.accessories?.sportsGlassesColor,
    regularGlassesDesign: player.accessories?.regularGlassesDesign,
    regularGlassesFrameColor: player.accessories?.regularGlassesFrameColor,
    regularGlassesShade: player.accessories?.regularGlassesShade,
    eyewearRaw: player.accessories?.eyewear || player.accessories?.accessory,
    kitPattern: (kitOverride as any)?.pattern || player.kit?.pattern || 'solid',
    kitCollar: (kitOverride as any)?.collar || player.kit?.collar || 'crew',
    kitStyle: (kitOverride as any)?.style || player.kit?.style || 'normal',
    shirtNumber: player.shirtNumber || player.number || 10,
    isGk: (player.subPosition || player.position || '').toUpperCase() === 'GK',
    isCaptain: false,
    statBreakActive: Boolean(player.statBreakActive),
    earringStyleRaw: player.accessories?.earring,
  };
}

export function playerCardToAppearanceV2(player: PlayerCardData): AppearanceV2 {
  const base = createDefaultAppearanceV2();
  const existing = player.appearanceV2;

  const { hairLength, hairTexture } = mapHairLengthAndTexture(
    player.biometrics?.hairStyle,
    player.biometrics?.hairLength,
    player.biometrics?.specialHair
  );

  const heightCm = player.heightCm ?? existing?.physique?.heightCm ?? 178;
  const weightKg = player.weightKg ?? existing?.physique?.weightKg ?? 74;
  const strength =
    player.statBreakStats?.strength ??
    player.biometrics?.strength ??
    player.stats?.detailed?.strength ??
    existing?.physique?.strength ??
    75;

  const mapArmTat = (val?: ArmTattooType | boolean): ArmTattooV2 => {
    if (!val || val === 'none') return 'none';
    if (val === true || val === 'tribal') return 'tribal_sleeve';
    if (val === 'mandala-sleeve' || val === 'full-sleeve-flowery') return 'floral_mandala_sleeve';
    if (val === 'blackout-sleeve') return 'blackout_sleeve';
    if (val === 'double-stripe' || val === 'two-lines') return 'double_stripe_band';
    return 'script_name_sleeve';
  };

  const armL: ArmTattooV2 = mapArmTat(player.accessories?.tattooArmL);
  const armR: ArmTattooV2 = mapArmTat(player.accessories?.tattooArmR);
  const neckT: NeckTattooV2 =
    player.accessories?.tattooNeck && player.accessories.tattooNeck !== 'none'
      ? player.accessories.tattooNeck === 'wings'
        ? 'winger_crest'
        : player.accessories.tattooNeck === 'rose'
        ? 'rose'
        : player.accessories.tattooNeck === 'blackout'
        ? 'blackout_neck'
        : 'script_lettering'
      : 'none';
  const faceT: FaceTattooV2 =
    player.accessories?.tattooFace && player.accessories.tattooFace !== 'none'
      ? player.accessories.tattooFace === 'star'
        ? 'cheek_star'
        : player.accessories.tattooFace === 'under-eye-cross'
        ? 'under_eye_cross'
        : player.accessories.tattooFace === 'crown-temple'
        ? 'temple_crown'
        : 'cheek_script'
      : 'none';

  const kitShirtCut =
    player.kit?.style === 'loose'
      ? 'big_retro'
      : player.kit?.style === 'tight'
      ? 'tight'
      : player.kit?.style === 'normal'
      ? 'normal'
      : existing?.uniform?.shirtCut || base.uniform.shirtCut;

  return {
    version: 2,
    hairLength,
    hairTexture,
    hairColor: mapHairColorToV2(player.biometrics?.hairRoot),
    hairDye: mapHairDyeToV2(player.biometrics?.hairRoot, player.biometrics?.hairDye),
    skinTone: mapSkinColorToV2(player.biometrics?.skinColor),
    facialHair: mapFacialHairToV2(player.biometrics?.facialHair || player.biometrics?.facialHairStyle),
    headwear: mapHeadwearToV2(player.accessories),
    regularGlasses: {
      design: player.accessories?.regularGlassesDesign || existing?.regularGlasses?.design || (player.accessories?.accessory === 'classic-glasses' ? 'rectangular' : 'none'),
      frameColor: player.accessories?.regularGlassesFrameColor || existing?.regularGlasses?.frameColor || '#334155',
      shade: player.accessories?.regularGlassesShade || existing?.regularGlasses?.shade || 'transparent',
    },
    necklace: mapNecklaceToV2(player.accessories?.necklace),
    tattoos: {
      neck: neckT,
      leftArm: armL,
      rightArm: armR,
      face: faceT,
    },
    earrings: {
      left: mapEarringSlot(
        player.accessories?.earring || player.accessories?.earringL,
        player.accessories?.earringMaterial,
        player.accessories?.earringGemColor
      ),
      right: mapEarringSlot(
        player.accessories?.earring || player.accessories?.earringR,
        player.accessories?.earringMaterial,
        player.accessories?.earringGemColor
      ),
    },
    physique: {
      ...base.physique,
      ...(existing?.physique || {}),
      heightCm,
      weightKg,
      strength,
    },
    uniform: {
      ...base.uniform,
      ...(existing?.uniform || {}),
      shirtCut: kitShirtCut,
    },
  };
}

export function applyAppearanceV2ToPlayerCard(player: PlayerCardData, v2: AppearanceV2): PlayerCardData {
  const skinHex = SKIN_TONE_HEX_V2[v2.skinTone] || player.biometrics.skinColor;
  const rootHex = HAIR_COLOR_HEX_V2[v2.hairColor] || player.biometrics.hairRoot;

  const hairLenMap: Record<HairLengthV2, PlayerCardData['biometrics']['hairLength']> = {
    shaven: 'shaved',
    fade: 'fade',
    short: 'short',
    medium: 'medium',
    long: 'long',
  };

  const keepSpecialHair =
    player.biometrics.hairStyle === 'special' || player.biometrics.hairLength === 'special';

  let hairStyle: PlayerCardData['biometrics']['hairStyle'] = player.biometrics.hairStyle;
  let hairLength: PlayerCardData['biometrics']['hairLength'] =
    keepSpecialHair ? player.biometrics.hairLength : hairLenMap[v2.hairLength] || 'short';

  if (!keepSpecialHair) {
    if (v2.hairLength === 'shaven') hairStyle = 'straight';
    else if (v2.hairTexture === 'braids') hairStyle = 'braided';
    else if (v2.hairTexture === 'dreads') hairStyle = 'dreads';
    else if (v2.hairTexture === 'curly') hairStyle = 'curly';
    else if (v2.hairTexture === 'wavy') hairStyle = 'wavy';
    else hairStyle = 'straight';
  }

  const mapBackHeadwear = (hw: HeadwearV2): { accessory: AccessoryType; headwear: HeadwearType; eyewear: EyewearType } => {
    if (hw === 'sports_headband') return { accessory: 'headband', headwear: 'headband', eyewear: 'none' };
    if (hw === 'performance_elastic_band') return { accessory: 'performance-band', headwear: 'performance-band', eyewear: 'none' };
    if (hw === 'protective_face_mask') return { accessory: 'protective-mask', headwear: 'none', eyewear: 'protective-mask' };
    if (hw === 'sports_glasses') return { accessory: 'sports-glasses', headwear: 'none', eyewear: 'sports-glasses' };
    return { accessory: 'none', headwear: 'none', eyewear: 'none' };
  };

  const hwMapped = mapBackHeadwear(v2.headwear);
  if (v2.regularGlasses.design !== 'none') {
    hwMapped.accessory = 'classic-glasses';
    hwMapped.headwear = 'none';
    hwMapped.eyewear = 'classic-glasses';
  }

  const mapBackNecklace = (n: NecklaceV2): NecklaceType => {
    if (n === 'military_tag') return 'dog-tags';
    if (n === 'silver_necklace') return 'silver-chain';
    if (n === 'gold_necklace') return 'gold-chain';
    if (n === 'diamond_encrusted_gold_necklace') return 'diamond-chain';
    return 'none';
  };

  const mapBackArmTat = (a: ArmTattooV2): ArmTattooType => {
    if (a === 'double_stripe_band') return 'double-stripe';
    if (a === 'script_name_sleeve') return 'script-sleeve';
    if (a === 'tribal_sleeve') return 'tribal';
    if (a === 'floral_mandala_sleeve') return 'mandala-sleeve';
    if (a === 'blackout_sleeve') return 'blackout-sleeve';
    return 'none';
  };

  const mapBackNeckTat = (nt: NeckTattooV2): NeckTattooType => {
    if (nt === 'script_lettering') return 'script';
    if (nt === 'rose') return 'rose';
    if (nt === 'blackout_neck') return 'blackout';
    if (nt === 'winger_crest') return 'wings';
    return 'none';
  };

  const mapBackFaceTat = (ft: FaceTattooV2): FaceTattooType => {
    if (ft === 'cheek_star') return 'star';
    if (ft === 'under_eye_cross') return 'under-eye-cross';
    if (ft === 'cheek_script') return 'script-cheek';
    if (ft === 'temple_crown') return 'crown-temple';
    return 'none';
  };

  const mapBackEarring = (style: EarringSlotV2['style']): EarringType => {
    if (style === 'small_barbell') return 'small-barbell';
    if (style === 'large_barbell') return 'large-barbell';
    if (style === 'gem') return 'gem';
    if (style === 'studs') return 'silver';
    return 'none';
  };

  return {
    ...player,
    heightCm: v2.physique.heightCm,
    weightKg: v2.physique.weightKg,
    appearanceV2: v2,
    biometrics: {
      ...player.biometrics,
      strength: v2.physique.strength,
      skinColor: skinHex,
      hairRoot: rootHex,
      hairLength,
      hairStyle,
    },
    accessories: {
      ...player.accessories,
      accessory: hwMapped.accessory,
      headwear: hwMapped.headwear,
      eyewear: hwMapped.eyewear,
      regularGlassesDesign: v2.regularGlasses.design === 'none' ? undefined : v2.regularGlasses.design,
      regularGlassesFrameColor: v2.regularGlasses.frameColor,
      regularGlassesShade: v2.regularGlasses.shade,
      necklace: mapBackNecklace(v2.necklace),
      tattooNeck: mapBackNeckTat(v2.tattoos.neck),
      tattooArmL: mapBackArmTat(v2.tattoos.leftArm),
      tattooArmR: mapBackArmTat(v2.tattoos.rightArm),
      tattooFace: mapBackFaceTat(v2.tattoos.face),
      earringL: mapBackEarring(v2.earrings.left.style),
      earringR: mapBackEarring(v2.earrings.right.style),
    },
  };
}

export function playerCardToLegacyAppearance(player: PlayerCardData): PlayerAppearance {
  const v2 = playerCardToAppearanceV2(player);
  const strength = v2.physique.strength;
  const muscleMass = Math.max(1, Math.min(5, Math.round((strength - 40) / 14) + 1));

  let facialHair: PlayerAppearance['facialHair'] = 'clean';
  if (v2.facialHair === 'three_day_stubble') facialHair = 'stubble';
  else if (v2.facialHair === 'goatee') facialHair = 'goatee';
  else if (v2.facialHair !== 'none') facialHair = 'beard';

  let hairStyle: PlayerAppearance['hairStyle'] = 'part';
  if (v2.hairLength === 'shaven') hairStyle = 'buzzcut';
  else if (v2.hairLength === 'fade') hairStyle = 'high-fade';
  else if (v2.hairTexture === 'braids') hairStyle = 'braids';
  else if (v2.hairTexture === 'dreads') hairStyle = 'dreads';
  else if (v2.hairTexture === 'curly') hairStyle = 'afro';
  else if (v2.hairTexture === 'wavy') hairStyle = 'wavy';

  const effectiveHairColor =
    player.biometrics?.hairDye && player.biometrics.hairDye !== 'none'
      ? player.biometrics.hairDye
      : player.biometrics?.hairRoot || '#18181b';

  return {
    heightCm: v2.physique.heightCm,
    weightKg: v2.physique.weightKg,
    muscleMass,
    skinTone: player.biometrics?.skinColor || SKIN_TONE_HEX_V2[v2.skinTone] || '#e0ac69',
    hairStyle,
    hairColor: effectiveHairColor,
    facialHair,
    jerseyFit: v2.uniform.tucked === 'tucked' ? 'tucked' : 'untucked',
    collarStyle: (player.kit?.collar as any) === 'v-neck' ? 'v-neck' : (player.kit?.collar as any) === 'polo' ? 'polo' : 'crew',
    sleeveLength: v2.uniform.sleeves === 'long' ? 'long' : v2.uniform.interiorShirt.enabled ? 'undershirt' : 'short',
    sockHeight: v2.uniform.socks === 'short' ? 'low' : v2.uniform.socks === 'long' ? 'high-knee' : 'standard',
    earrings: v2.earrings.left.style !== 'none' && v2.earrings.right.style !== 'none'
      ? 'dual-stud'
      : v2.earrings.left.style !== 'none'
      ? 'left-stud'
      : v2.earrings.right.style !== 'none'
      ? 'right-stud'
      : 'none',
    tattoos: {
      leftArm: v2.tattoos.leftArm === 'none' ? 'none' : 'full-sleeve',
      rightArm: v2.tattoos.rightArm === 'none' ? 'none' : 'full-sleeve',
    },
    hasBeard: facialHair !== 'clean',
  };
}

// ============================================================================
// 2. STATS, POSITION & PLAYSTYLE CONVERSION
// ============================================================================

const SUBPOS_SET = new Set<SubPosition>([
  'ST', 'LW', 'RW', 'SS', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LB', 'RB', 'CB', 'LWB', 'RWB', 'LIB', 'GK',
]);

export function mapSubPosition(sub?: string, fallbackRole: PlayerRole = 'CM1'): SubPosition {
  const up = (sub || '').toUpperCase().trim();
  if (SUBPOS_SET.has(up as SubPosition)) return up as SubPosition;
  if (up === 'CF') return 'ST';
  if (up === 'SW') return 'LIB';
  if (fallbackRole === 'GK') return 'GK';
  if (fallbackRole === 'LB') return 'LB';
  if (fallbackRole === 'RB') return 'RB';
  if (fallbackRole === 'CB1' || fallbackRole === 'CB2') return 'CB';
  if (fallbackRole === 'LM') return 'LM';
  if (fallbackRole === 'RM') return 'RM';
  if (fallbackRole === 'ST1' || fallbackRole === 'ST2') return 'ST';
  return 'CM';
}

export function mapRoleForSlot(subPos: SubPosition, index: number): PlayerRole {
  if (subPos === 'GK' || index === 0) return 'GK';
  if (subPos === 'LB' || subPos === 'LWB') return 'LB';
  if (subPos === 'RB' || subPos === 'RWB') return 'RB';
  if (subPos === 'CB' || subPos === 'LIB') return index % 2 === 0 ? 'CB1' : 'CB2';
  if (subPos === 'LM' || subPos === 'LW') return 'LM';
  if (subPos === 'RM' || subPos === 'RW') return 'RM';
  if (subPos === 'CDM' || subPos === 'CM' || subPos === 'CAM') return index % 2 === 0 ? 'CM1' : 'CM2';
  return index % 2 === 0 ? 'ST1' : 'ST2';
}

const PLAYSTYLE_MAP: Record<string, PlayerPlaystyle> = {
  poacher: 'poacher',
  target: 'target',
  'target man': 'target',
  complete: 'complete',
  'complete forward': 'complete',
  finisher: 'finisher',
  'clinical finisher': 'finisher',
  decoy: 'decoy',
  traditional: 'traditional',
  'traditional winger': 'traditional',
  inverted: 'inverted',
  'inverted winger': 'inverted',
  prolific: 'prolific',
  'prolific winger': 'prolific',
  'inside forward': 'prolific',
  pressing: 'pressing',
  creator: 'creator',
  shadow: 'shadow',
  'shadow striker': 'shadow',
  classic_n10: 'classic_n10',
  'classic no 10': 'classic_n10',
  engine: 'engine',
  box_to_box: 'box_to_box',
  'box to box': 'box_to_box',
  maestro: 'maestro',
  runner: 'runner',
  enforcer: 'enforcer',
  anchor: 'anchor',
  'anchor man': 'anchor',
  regista: 'regista',
  defensive: 'defensive',
  'defensive fullback': 'defensive',
  inverted_fb: 'inverted_fb',
  'inverted fullback': 'inverted_fb',
  attacker_fb: 'attacker_fb',
  'attacking fullback': 'attacker_fb',
  balanced_fb: 'balanced_fb',
  destroyer: 'destroyer',
  distributor: 'distributor',
  playmaker: 'playmaker',
  stopper: 'stopper',
  sweeper_cb: 'sweeper_cb',
  libero: 'sweeper_cb',
  balanced_gk: 'balanced_gk',
  sweeper: 'sweeper',
  'sweeper keeper': 'sweeper',
  wall: 'wall',
};

export function mapPlaystyle(raw?: string, subPos: SubPosition = 'CM'): PlayerPlaystyle {
  const key = (raw || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
  if (PLAYSTYLE_MAP[key]) return PLAYSTYLE_MAP[key];
  const under = (raw || '').toLowerCase().trim();
  if (PLAYSTYLE_MAP[under]) return PLAYSTYLE_MAP[under];
  if (subPos === 'GK') return 'balanced_gk';
  if (subPos === 'ST' || subPos === 'SS') return 'poacher';
  if (subPos === 'LW' || subPos === 'RW' || subPos === 'LM' || subPos === 'RM') return 'prolific';
  if (subPos === 'CB') return 'stopper';
  if (subPos === 'LIB') return 'sweeper_cb';
  if (subPos === 'LB' || subPos === 'RB' || subPos === 'LWB' || subPos === 'RWB') return 'balanced_fb';
  return 'box_to_box';
}

export function playerCardToCanonicalStats(
  p: PlayerCardData,
  role: PlayerRole
): CanonicalOutfieldStats | CanonicalGoalkeeperStats {
  const clamp = (v: number | undefined, fallback: number) =>
    Math.max(40, Math.min(105, Math.round(v ?? fallback)));
  const ovr = p.ovr || p.overallRating || 72;

  if (role === 'GK' || p.subPosition === 'GK') {
    const gk = p.stats?.gkDetailed;
    return {
      sav: clamp(gk?.saving, ovr),
      ref: clamp(gk?.reflexes, ovr),
      han: clamp(gk?.handling, Math.max(50, ovr - 2)),
      gpo: clamp(gk?.positioning, ovr),
      aer: clamp(gk?.aerialReach, ovr),
      oneOnOne: clamp(gk?.oneOnOne, ovr),
      dis: clamp(gk?.distribution, Math.max(50, ovr - 5)),
    };
  }

  const d = p.stats?.detailed;
  const s = p.stats;
  return {
    pac: clamp(d?.pace, s?.phy || ovr),
    sta: clamp(d?.stamina, s?.phy || ovr),
    str: clamp(d?.strength ?? p.biometrics?.strength, s?.phy || ovr),
    bcl: clamp(d?.ballControl, s?.pro || ovr),
    ret: clamp(d?.retention, s?.pro || ovr),
    dri: clamp(d?.dribbling, s?.pro || ovr),
    spa: clamp(d?.shortPass, s?.cre || ovr),
    lpa: clamp(d?.longPass, s?.cre || ovr),
    cro: clamp(d?.crossing, s?.cre || ovr),
    sho: clamp(d?.shooting, s?.goa || ovr),
    hea: clamp(d?.heading, s?.goa || ovr),
    lsh: clamp(d?.longShots, s?.goa || ovr),
    tck: clamp(d?.tackling, s?.def || ovr),
    sld: clamp(d?.tackling, s?.def || ovr),
    int: clamp(d?.interceptions, s?.def || ovr),
    mrk: clamp(d?.marking, s?.def || ovr),
    pos: clamp(d?.positioning, s?.men || ovr),
    cmp: clamp(d?.composure, s?.men || ovr),
    rea: clamp(d?.reactions, s?.men || ovr),
  };
}

export function playerCardToTeamRosterPlayer(
  p: PlayerCardData,
  role: PlayerRole,
  shirtNum?: number,
  isCaptain?: boolean
): TeamRosterPlayer {
  const subPosition = mapSubPosition(p.subPosition || p.position, role);
  return {
    id: p.id,
    name: p.name,
    number: shirtNum || p.shirtNumber || p.number || 10,
    role,
    subPosition,
    playstyle: mapPlaystyle(p.playStyle, subPosition),
    intrinsicPlaystyle: mapPlaystyle(p.playStyle, subPosition),
    appearance: playerCardToLegacyAppearance(p),
    appearanceV2: playerCardToAppearanceV2(p),
    scale: p.heightCm ? Math.max(0.88, Math.min(1.15, p.heightCm / 178)) : 1.0,
    canonicalStats: playerCardToCanonicalStats(p, role),
    isCaptain,
    ...(p.streetOutfit ? { streetOutfit: p.streetOutfit } : {}),
  };
}

// ============================================================================
// 3. TEAM & TACTICS CONVERSION (DrawStar Club/National <-> Gameplay TeamDefinition)
// ============================================================================

const VALID_FORMATIONS: FormationName[] = [
  '4-3-3', '4-2-3-1', '4-4-2', '4-5-1', '3-5-2', '3-4-3', '3-4-3-diamond', '5-3-2', '5-4-1',
];

export function normalizeFormationName(raw?: string): FormationName {
  if (!raw) return '4-3-3';
  const clean = raw.trim() as FormationName;
  if (VALID_FORMATIONS.includes(clean)) return clean;
  if (clean.startsWith('4-3-3')) return '4-3-3';
  if (clean.startsWith('4-2-3-1')) return '4-2-3-1';
  if (clean.startsWith('4-4-2')) return '4-4-2';
  if (clean.startsWith('4-5-1')) return '4-5-1';
  if (clean.startsWith('3-5-2')) return '3-5-2';
  if (clean.startsWith('3-4-3')) return clean.includes('diamond') ? '3-4-3-diamond' : '3-4-3';
  if (clean.startsWith('5-3-2')) return '5-3-2';
  if (clean.startsWith('5-4-1')) return '5-4-1';
  return '4-3-3';
}

export function normalizeTacticalPlaystyle(raw?: string): TacticalPlaystyle {
  const key = (raw || '').toLowerCase().replace(/[\s-]+/g, '_').trim();
  const map: Record<string, TacticalPlaystyle> = {
    possession: 'possession',
    gegenpress: 'gegenpress',
    counterattack: 'counterattack',
    counter_attack: 'counterattack',
    catenaccio: 'catenaccio',
    long_ball: 'long_ball',
    futbol_champan: 'futbol_champan',
    conservative: 'conservative',
    arteta_control: 'arteta_control',
    brexitball: 'brexitball',
    jogobonito: 'jogobonito',
    jogo_bonito: 'jogobonito',
  };
  return map[key] || 'possession';
}

function drawStarKitToTeamKit(
  kit: EditorTeamData['kit'],
  fallbackName: string,
  shortName: string,
  primary = '#0284c7',
  secondary = '#ffffff'
): TeamKit {
  const p = kit?.color1 || primary;
  const s = kit?.color2 || secondary;
  return {
    name: fallbackName,
    shortName: shortName.slice(0, 3).toUpperCase(),
    primaryColor: p,
    secondaryColor: s,
    shortsColor: s,
    socksColor: p,
    gkColor: '#eab308',
  };
}

function calcRatingTier(ovr: number): RatingTier {
  if (ovr >= 85) return 'S';
  if (ovr >= 78) return 'A';
  if (ovr >= 68) return 'B';
  return 'C';
}

function synthesizeStarter(
  id: string,
  name: string,
  role: PlayerRole,
  subPos: SubPosition,
  num: number,
  ovr: number
): TeamRosterPlayer {
  const fakeCard: PlayerCardData = {
    id,
    name,
    number: num,
    shirtNumber: num,
    ovr,
    age: 24,
    club: '',
    subPosition: subPos,
    stats: {
      pro: ovr,
      def: ovr,
      cre: ovr,
      men: ovr,
      goa: ovr,
      phy: ovr,
    },
    biometrics: {
      strength: ovr,
      skinColor: '#e0ac69',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#18181b',
      hairDye: '#18181b',
    },
    accessories: {
      accessory: 'none',
      headbandColor: '#ffffff',
    },
    kit: {
      color1: '#0284c7',
      color2: '#ffffff',
      pattern: 'solid',
    },
    emblem: {
      shape: 'crested-shield',
      mode: '1',
      color1: '#0284c7',
      color2: '#ffffff',
    },
  };
  return playerCardToTeamRosterPlayer(fakeCard, role, num, false);
}

const ORDERED_ROLES: PlayerRole[] = ['GK', 'LB', 'CB1', 'CB2', 'RB', 'LM', 'CM1', 'CM2', 'RM', 'ST1', 'ST2'];

export interface EditorTeamGameplayOptions {
  teamSize?: 7 | 11;
  isStreet?: boolean;
  cityId?: string;
  stadiumOverride?: StadiumDefinition;
}

function buildGameplayRosterFromSlots(
  teamId: string,
  rawPlayers: Array<{ card?: PlayerCardData; name: string; roleHint?: string; shirtNum?: number; customPos?: { x: number; y: number } }>,
  captainId: string | undefined,
  avgOvr: number,
  teamSize: 7 | 11 = 11
): TeamRosterPlayer[] {
  const roster: TeamRosterPlayer[] = [];
  const usedIds = new Set<string>();

  if (teamSize === 7) {
    for (let i = 0; i < 7; i++) {
      const slotSpec = STREET_1_2_2_2_SLOTS[i];
      const targetRole = slotSpec.role;
      const source = rawPlayers[i];
      const pos = source?.customPos || { x: slotSpec.x, y: slotSpec.y };
      if (source?.card) {
        const rp = playerCardToTeamRosterPlayer(
          source.card,
          targetRole,
          source.shirtNum || source.card.shirtNumber || i + 1,
          source.card.id === captainId
        );
        rp.customPos = pos;
        rp.streetRoleLabel = slotSpec.streetRole;
        if (usedIds.has(rp.id)) rp.id = `${teamId}_street_${i}`;
        usedIds.add(rp.id);
        roster.push(rp);
      } else {
        const rp = synthesizeStarter(
          `${teamId}_street_synth_${i}`,
          source?.name || `Street ${slotSpec.streetRole}`,
          targetRole,
          slotSpec.subPosition,
          source?.shirtNum || i + 1,
          avgOvr
        );
        rp.customPos = pos;
        rp.streetRoleLabel = slotSpec.streetRole;
        usedIds.add(rp.id);
        roster.push(rp);
      }
    }
    return roster;
  }

  for (let i = 0; i < 11; i++) {
    const targetRole = ORDERED_ROLES[i];
    const source = rawPlayers[i];
    if (source?.card) {
      const rp = playerCardToTeamRosterPlayer(
        source.card,
        targetRole,
        source.shirtNum || source.card.shirtNumber || i + 1,
        source.card.id === captainId
      );
      if (source.customPos) rp.customPos = source.customPos;
      if (usedIds.has(rp.id)) rp.id = `${teamId}_slot_${i}`;
      usedIds.add(rp.id);
      roster.push(rp);
    } else {
      const sub = mapSubPosition(source?.roleHint, targetRole);
      const rp = synthesizeStarter(
        `${teamId}_synth_${i}`,
        source?.name || `${sub} #${i + 1}`,
        targetRole,
        sub,
        source?.shirtNum || i + 1,
        avgOvr
      );
      usedIds.add(rp.id);
      roster.push(rp);
    }
  }

  for (let i = 11; i < Math.min(rawPlayers.length, 18); i++) {
    const source = rawPlayers[i];
    if (!source?.card) continue;
    const sub = mapSubPosition(source.card.subPosition || source.card.position || source.roleHint, 'CM1');
    const role = mapRoleForSlot(sub, i);
    const rp = playerCardToTeamRosterPlayer(
      source.card,
      role,
      source.shirtNum || source.card.shirtNumber || i + 1,
      false
    );
    if (usedIds.has(rp.id)) rp.id = `${teamId}_sub_${i}`;
    usedIds.add(rp.id);
    roster.push(rp);
  }

  return roster;
}

export function editorTeamToGameplayTeam(
  team: EditorTeamData,
  leagueName?: string,
  allPlayersById?: Record<string, PlayerCardData>,
  options?: EditorTeamGameplayOptions
): TeamDefinition {
  const confed = resolveCountryConfederation(team.countryCode || team.countryName, team.federation);
  const sortedSquad = [...(team.squadSaveFile?.squad || [])].sort((a, b) => a.slotNumber - b.slotNumber);
  const populatedCount = sortedSquad.filter((s) => Boolean(s.player)).length;
  const isStreetMode = Boolean(
    options?.teamSize === 7 ||
      options?.isStreet ||
      team.stadium?.gameplayStadiumId?.startsWith('street_') ||
      (populatedCount === 7 && (team.manager?.primaryTactic?.playstyle === 'jogobonito' || team.id.startsWith('street_')))
  );
  const teamSize: 7 | 11 = options?.teamSize === 7 || isStreetMode ? 7 : 11;

  const streetStadium = isStreetMode
    ? options?.stadiumOverride || resolveStreetStadiumForCity(options?.cityId || team.stadium?.gameplayStadiumId || team.name)
    : undefined;

  const resolvedVenue = streetStadium
    ? {
        homeStadiumId: streetStadium.id,
        homeVenueConfig: {
          stadiumId: streetStadium.id,
          customStadiumName: streetStadium.name,
          seatPattern: 'solid' as const,
          seatColors: ['#475569', '#f59e0b'],
          netTension: streetStadium.netTension || ('soft' as const),
          goalFrame: streetStadium.goalFrame || ('round_steel' as const),
          benchType: streetStadium.dugouts?.type || ('folding_chairs' as const),
          benchQuality: streetStadium.dugouts?.quality || ('municipal' as const),
          pitchPreset: streetStadium.pitchPreset || ('compact' as const),
          pitchLengthMeters: streetStadium.pitchLengthMeters || 46,
          pitchWidthMeters: streetStadium.pitchWidthMeters || 27,
          turfQuality: streetStadium.turfQuality || ('concrete' as const),
          mowingPattern: 'plain' as const,
          grassLength: 'short' as const,
          baseSurfaceStatus: 'normal' as const,
          sponsors: [],
          adboardTier: 'basic_paper' as const,
        },
      }
    : resolveDefaultStadiumForTeam(confed, team.stadium, {
        id: team.id,
        name: team.name,
        country: team.countryName || team.countryCode,
        countryCode: team.countryCode,
        category: 'club',
        ratingTier: calcRatingTier(team.overallRating || team.ovr || 74),
      });

  const formation = normalizeFormationName(team.manager?.primaryTactic?.formation);
  const tacticalPlaystyle = normalizeTacticalPlaystyle(
    team.manager?.primaryTactic?.playstyle || team.manager?.primaryTactic?.style
  );
  const tactics: DetailedTactics = team.manager?.primaryTactic
    ? {
        ...getDefaultTactics(tacticalPlaystyle),
        defensiveLine: (team.manager.primaryTactic.defensiveLine as any) || 3,
        defensiveStyle: (team.manager.primaryTactic.defensiveStyle as any) || 'zonal',
        offsideTrap: team.manager.primaryTactic.offsideTrap === 'YES',
        compactness: (team.manager.primaryTactic.compactness as any) || 2,
        creation: (team.manager.primaryTactic.passingStyle as any) || 'mixed',
        finalThird: (team.manager.primaryTactic.finalThirdApproach as any) || 'secure',
        shape: (team.manager.primaryTactic.teamShape as any) || 'free',
        runs: (team.manager.primaryTactic.attackingSupport as any) || 'moderate',
      }
    : getDefaultTactics(tacticalPlaystyle);

  const avgOvr = team.overallRating || team.ovr || 74;
  const startingSlots = sortedSquad.filter((s) => s.slotNumber <= teamSize);
  const subSlots = teamSize === 7 ? [] : sortedSquad.filter((s) => s.slotNumber >= 12 && s.slotNumber <= 18);
  const reserveFallback =
    teamSize === 7
      ? []
      : [...sortedSquad.filter((s) => s.slotNumber >= 19), ...(team.squadSaveFile?.reserves || [])];

  // For 7v7 Street: strictly 7 players, never padded to 11. For 11v11: 11 starters + up to 7 bench entries.
  const starting =
    teamSize === 7
      ? startingSlots.slice(0, 7)
      : startingSlots.length >= 11
      ? startingSlots.slice(0, 11)
      : [...startingSlots, ...reserveFallback].slice(0, 11);
  const subs =
    teamSize === 7
      ? []
      : subSlots.length > 0
      ? subSlots.slice(0, 7)
      : reserveFallback.slice(0, 7);
  const combinedSlots = [...starting, ...subs];

  const captainId = team.tacticalRoles?.captainId || team.keyRoles?.captainPlayerId || team.captainPlayerId;

  const rawEntries = combinedSlots.map((slot: SquadSlot, idx) => {
    const anySlot = slot as any;
    const resolvedCard: PlayerCardData | undefined =
      slot.player || anySlot.playerData || (anySlot.playerId && allPlayersById?.[anySlot.playerId]) || undefined;
    const formationCoords =
      teamSize === 7
        ? STREET_1_2_2_2_SLOTS[idx]
        : TACTICAL_BOARD_FORMATIONS[formation]?.[ORDERED_ROLES[idx]] || undefined;
    return {
      card: resolvedCard,
      name: resolvedCard?.name || anySlot.playerName || `Player ${slot.slotNumber}`,
      roleHint: resolvedCard?.subPosition || resolvedCard?.position || anySlot.assignedRole,
      shirtNum: resolvedCard?.shirtNumber || resolvedCard?.number || anySlot.shirtNumber || idx + 1,
      customPos:
        typeof anySlot.xPercent === 'number' && typeof anySlot.yPercent === 'number'
          ? { x: anySlot.xPercent / 100, y: anySlot.yPercent / 100 }
          : formationCoords
          ? { x: formationCoords.x, y: formationCoords.y }
          : undefined,
    };
  });

  const players = buildGameplayRosterFromSlots(team.id, rawEntries, captainId, avgOvr, teamSize);
  const firstId = players[0]?.id || 'p1';
  const roles: TeamTacticalRoles = team.tacticalRoles || {
    captainId: captainId && players.some((p) => p.id === captainId) ? captainId : players[Math.min(5, players.length - 1)]?.id || firstId,
    freeKickNearId: team.keyRoles?.creatorPlayerId || players[Math.min(Math.max(0, players.length - 2), 8)]?.id || firstId,
    freeKickLongId: team.keyRoles?.creatorPlayerId || players[Math.min(Math.max(0, players.length - 3), 6)]?.id || firstId,
    penaltyTakerId: team.keyRoles?.goalscorerPlayerId || players[players.length - 1]?.id || firstId,
    leftCornerTakerId: players[Math.min(Math.max(0, players.length - 2), 5)]?.id || firstId,
    rightCornerTakerId: players[Math.min(Math.max(0, players.length - 1), 8)]?.id || firstId,
  };

  const shortName = (team.shortName || team.name.slice(0, 3)).toUpperCase();
  const homeKit = drawStarKitToTeamKit(team.kit, `${team.name} Home`, shortName);
  const awayKit = team.awayKit
    ? drawStarKitToTeamKit(team.awayKit, `${team.name} Away`, shortName, '#ffffff', homeKit.primaryColor)
    : {
        ...homeKit,
        name: `${team.name} Away`,
        primaryColor: homeKit.secondaryColor,
        secondaryColor: homeKit.primaryColor,
        shortsColor: homeKit.primaryColor,
        socksColor: homeKit.secondaryColor,
      };
  const thirdKit = team.thirdKit
    ? drawStarKitToTeamKit(team.thirdKit, `${team.name} Third`, shortName, '#0f172a', homeKit.secondaryColor)
    : undefined;

  return {
    id: team.id,
    name: team.name,
    shortName,
    category: 'club',
    confederation: toGameplayConfederation(confed),
    country: team.countryName || team.countryCode || 'International',
    countryCode: (team.countryCode || 'XX').toUpperCase(),
    league: leagueName || team.leagueId || (teamSize === 7 ? 'Street Football 7v7' : 'Premier Division'),
    badge: {
      icon: teamSize === 7 ? '🧱' : '🛡️',
      bg: team.emblem?.color2 || homeKit.secondaryColor,
      text: shortName,
      primaryColor: team.emblem?.color1 || homeKit.primaryColor,
      secondaryColor: team.emblem?.color2 || homeKit.secondaryColor,
    },
    ratingTier: calcRatingTier(avgOvr),
    averageOvr: avgOvr,
    description:
      teamSize === 7
        ? `${team.name} (${streetStadium?.name || 'Street Cage'}) · Street 7v7 1-2-2-2`
        : `${team.name} (${leagueName || team.countryName || 'Club'}) · ${formation}`,
    tacticalPlaystyle,
    preferredFormation: formation,
    ...(teamSize === 7 ? { streetFormation: '1-2-2-2' as StreetFormationName } : {}),
    teamSize,
    tactics,
    kit: homeKit,
    awayKit,
    thirdKit,
    players,
    roles,
    manager: team.manager
      ? {
          id: team.managerId || team.manager.id,
          name: team.manager.name,
          country: team.manager.nationality,
          countryCode: team.countryCode || 'XX',
          age: team.manager.age,
          appearanceV2: team.manager.appearanceV2,
          attire: team.manager.attire,
          jacketColor: team.manager.jacketColor,
          shirtColor: team.manager.shirtColor,
          tieColor: team.manager.tieColor,
          pantsColor: team.manager.pantsColor,
        }
      : undefined,
    homeStadiumId: resolvedVenue.homeStadiumId,
    homeVenueConfig: resolvedVenue.homeVenueConfig,
  };
}

export function nationalTeamToGameplayTeam(nat: NationalTeam): TeamDefinition {
  const confed = resolveCountryConfederation(nat.nation.code || nat.nation.name, nat.confederation);
  const resolvedVenue = resolveDefaultStadiumForTeam(confed, nat.stadium, {
    id: nat.id,
    name: nat.nation.name,
    country: nat.nation.name,
    countryCode: nat.nation.code,
    category: 'national',
    ratingTier: calcRatingTier(nat.teamOvr || nat.ovr || 78),
  });

  const mgr = nat.manager as any;
  const formation = normalizeFormationName(mgr?.primaryTactic?.formation || mgr?.preferredFormation || '4-3-3');
  const tacticalPlaystyle = normalizeTacticalPlaystyle(mgr?.primaryTactic?.playstyle || mgr?.tactic || 'possession');
  const tactics: DetailedTactics = mgr?.primaryTactic
    ? {
        ...getDefaultTactics(tacticalPlaystyle),
        defensiveLine: mgr.primaryTactic.defensiveLine || 3,
        defensiveStyle: mgr.primaryTactic.defensiveStyle || 'zonal',
        offsideTrap: mgr.primaryTactic.offsideTrap === 'YES',
        compactness: mgr.primaryTactic.compactness || 2,
        creation: mgr.primaryTactic.passingStyle || 'mixed',
        finalThird: mgr.primaryTactic.finalThirdApproach || 'secure',
        shape: mgr.primaryTactic.teamShape || 'free',
        runs: mgr.primaryTactic.attackingSupport || 'moderate',
      }
    : getDefaultTactics(tacticalPlaystyle);

  const avgOvr = nat.teamOvr || nat.ovr || 78;
  const rawEntries = (nat.squad || []).map((card, idx) => ({
    card,
    name: card.name,
    roleHint: card.subPosition || card.position,
    shirtNum: card.shirtNumber || card.number || idx + 1,
  }));

  const players = buildGameplayRosterFromSlots(nat.id, rawEntries, undefined, avgOvr);
  const firstId = players[0]?.id || 'p1';
  const shortName = (nat.nation.code || nat.nation.name.slice(0, 3)).toUpperCase();
  const primary = nat.homeKit?.color1 || '#0284c7';
  const secondary = nat.homeKit?.color2 || '#ffffff';

  const homeKit = drawStarKitToTeamKit(nat.homeKit, `${nat.nation.name} Home`, shortName, primary, secondary);
  const awayKit = nat.awayKit
    ? drawStarKitToTeamKit(nat.awayKit, `${nat.nation.name} Away`, shortName, secondary, primary)
    : {
        ...homeKit,
        name: `${nat.nation.name} Away`,
        primaryColor: secondary,
        secondaryColor: primary,
        shortsColor: primary,
        socksColor: secondary,
      };

  return {
    id: nat.id,
    name: nat.nation.name,
    shortName,
    category: 'national',
    confederation: toGameplayConfederation(confed),
    country: nat.nation.name,
    countryCode: (nat.nation.code || 'XX').toUpperCase(),
    league: `${confed} National Teams`,
    badge: {
      icon: '🌍',
      bg: secondary,
      text: shortName,
      primaryColor: primary,
      secondaryColor: secondary,
    },
    ratingTier: calcRatingTier(avgOvr),
    averageOvr: avgOvr,
    description: `${nat.nation.name} National Team (${confed})`,
    tacticalPlaystyle,
    preferredFormation: formation,
    tactics,
    kit: homeKit,
    awayKit,
    players,
    roles: nat.tacticalRoles || {
      captainId: players[Math.min(5, players.length - 1)]?.id || firstId,
      freeKickNearId: players[Math.min(8, players.length - 1)]?.id || firstId,
      freeKickLongId: players[Math.min(6, players.length - 1)]?.id || firstId,
      penaltyTakerId: players[Math.min(9, players.length - 1)]?.id || firstId,
      leftCornerTakerId: players[Math.min(5, players.length - 1)]?.id || firstId,
      rightCornerTakerId: players[Math.min(8, players.length - 1)]?.id || firstId,
    },
    manager: {
      name: mgr?.name || 'Head Coach',
      country: mgr?.nationality || nat.nation.name,
      countryCode: nat.nation.code || 'XX',
    },
    homeStadiumId: resolvedVenue.homeStadiumId,
    homeVenueConfig: resolvedVenue.homeVenueConfig,
  };
}

export function isSpecialTeamId(teamId?: string): boolean {
  if (!teamId) return false;
  return (SPECIAL_TEAM_IDS as readonly string[]).includes(teamId);
}

/**
 * Builds the full Kick Off catalog from DrawStar's LeagueDatabase + NationalTeamsDatabase.
 * Never yields Special Teams inside League/Career pools.
 */
export function buildAllDrawStarGameplayTeams(
  leagueDb: LeagueDatabase,
  nationalTeams: NationalTeam[],
  allPlayersById?: Record<string, PlayerCardData>
): TeamDefinition[] {
  const result: TeamDefinition[] = [];
  const seenIds = new Set<string>();

  for (const team of Object.values(leagueDb.teams || {})) {
    if (!team || !team.id || isSpecialTeamId(team.id) || team.isTemporaryContinentalClub) continue;
    const league = team.leagueId ? leagueDb.leagues?.[team.leagueId] : undefined;
    const gp = editorTeamToGameplayTeam(team, league?.name, allPlayersById);
    if (!seenIds.has(gp.id)) {
      seenIds.add(gp.id);
      result.push(gp);
    }
  }

  for (const nat of nationalTeams || []) {
    if (!nat || !nat.id || isSpecialTeamId(nat.id)) continue;
    const gp = nationalTeamToGameplayTeam(nat);
    if (!seenIds.has(gp.id)) {
      seenIds.add(gp.id);
      result.push(gp);
    }
  }

  return result;
}

/**
 * Resolves a Career player's current Club (never a Special Team!) + an authentic Opponent Club
 * from DrawStar's LeagueDatabase, ensuring the user's Unique Career Player is inserted in the Starting XI.
 */
export function resolveCareerMatchTeams(
  player: PlayerCardData,
  leagueDb: LeagueDatabase,
  opponentTeamNameOrId?: string
): {
  homeTeam: TeamDefinition;
  awayTeam: TeamDefinition;
  lockedPlayerId: string;
} {
  const teams = Object.values(leagueDb.teams || {}).filter(
    (t) => t && !isSpecialTeamId(t.id)
  );

  const playerClub =
    teams.find((t) => player.clubId && t.id === player.clubId) ||
    teams.find((t) => t.name.toLowerCase() === (player.club || '').toLowerCase()) ||
    teams[0];

  const opponentClub =
    teams.find(
      (t) =>
        opponentTeamNameOrId &&
        (t.id === opponentTeamNameOrId ||
          t.name.toLowerCase() === opponentTeamNameOrId.toLowerCase())
    ) ||
    teams.find(
      (t) =>
        playerClub &&
        t.id !== playerClub.id &&
        t.leagueId === playerClub.leagueId
    ) ||
    teams.find((t) => !playerClub || t.id !== playerClub.id) ||
    playerClub;

  const homeLeague = playerClub?.leagueId ? leagueDb.leagues?.[playerClub.leagueId] : undefined;
  const awayLeague = opponentClub?.leagueId ? leagueDb.leagues?.[opponentClub.leagueId] : undefined;

  const homeTeam = playerClub
    ? editorTeamToGameplayTeam(playerClub, homeLeague?.name)
    : editorTeamToGameplayTeam({
        id: 'career_user_fc',
        name: player.club || 'DrawStar United',
        countryCode: (player.countryCode as any) || 'ES',
        overallRating: player.ovr || 75,
      });

  const awayTeam = opponentClub && opponentClub.id !== playerClub?.id
    ? editorTeamToGameplayTeam(opponentClub, awayLeague?.name)
    : editorTeamToGameplayTeam({
        id: 'career_rival_fc',
        name: opponentTeamNameOrId || 'Metropolitan FC',
        countryCode: (player.countryCode as any) || 'ES',
        overallRating: Math.max(60, (player.ovr || 75) - 2),
      });

  // Inject or update the Unique Career user player inside homeTeam's Starting XI
  const subPos = mapSubPosition(player.subPosition || player.position, 'ST1');
  const preferredRole = mapRoleForSlot(subPos, 9);
  const userRosterPlayer = playerCardToTeamRosterPlayer(
    player,
    preferredRole,
    player.shirtNumber || player.number || 10,
    false
  );

  const existingIdx = homeTeam.players.findIndex(
    (p) => p.id === player.id || p.name.toLowerCase() === player.name.toLowerCase()
  );
  if (existingIdx >= 0 && existingIdx < 11) {
    userRosterPlayer.role = homeTeam.players[existingIdx].role;
    homeTeam.players[existingIdx] = { ...userRosterPlayer, role: homeTeam.players[existingIdx].role };
  } else {
    const slotIdx = homeTeam.players.findIndex((p) => p.role === preferredRole);
    const replaceIdx = slotIdx >= 0 && slotIdx < 11 ? slotIdx : 9;
    if (homeTeam.players[replaceIdx]) {
      userRosterPlayer.role = homeTeam.players[replaceIdx].role;
      homeTeam.players[replaceIdx] = userRosterPlayer;
    } else {
      homeTeam.players.unshift(userRosterPlayer);
    }
  }

  return {
    homeTeam,
    awayTeam,
    lockedPlayerId: userRosterPlayer.id,
  };
}

/**
 * Resolves a Career player's Senior National Team vs Opponent National Team
 * from DrawStar's NationalTeamsDatabase for International/World Cup Key Matches.
 */
export function resolveCareerInternationalMatchTeams(
  player: PlayerCardData,
  callingNationNameOrCode: string,
  opponentNationNameOrCode: string,
  nationalTeams: NationalTeam[]
): {
  homeTeam: TeamDefinition;
  awayTeam: TeamDefinition;
  lockedPlayerId: string;
} {
  const findNat = (q: string) =>
    nationalTeams.find(
      (n) =>
        n.nation.name.toLowerCase() === q.toLowerCase() ||
        n.nation.code.toLowerCase() === q.toLowerCase()
    );

  const userNat = findNat(callingNationNameOrCode) || findNat(player.nationality?.name || '') || nationalTeams[0];
  const oppNat =
    findNat(opponentNationNameOrCode) ||
    nationalTeams.find((n) => !userNat || n.id !== userNat.id) ||
    userNat;

  const homeTeam: TeamDefinition = userNat
    ? nationalTeamToGameplayTeam(userNat)
    : editorTeamToGameplayTeam({
        id: 'career_nat_home',
        name: callingNationNameOrCode || 'National Team',
        countryCode: (player.nationality?.code as any) || 'ES',
        overallRating: player.ovr || 78,
      });

  const awayTeam: TeamDefinition = oppNat && oppNat.id !== userNat?.id
    ? nationalTeamToGameplayTeam(oppNat)
    : editorTeamToGameplayTeam({
        id: 'career_nat_away',
        name: opponentNationNameOrCode || 'Opponent XI',
        countryCode: 'FR',
        overallRating: Math.max(70, (player.ovr || 78) - 2),
      });

  const subPos = mapSubPosition(player.subPosition || player.position, 'ST1');
  const preferredRole = mapRoleForSlot(subPos, 9);
  const userRosterPlayer = playerCardToTeamRosterPlayer(
    player,
    preferredRole,
    player.shirtNumber || player.number || 10,
    false
  );

  const existingIdx = homeTeam.players.findIndex(
    (p) => p.id === player.id || p.name.toLowerCase() === player.name.toLowerCase()
  );
  if (existingIdx >= 0 && existingIdx < 11) {
    userRosterPlayer.role = homeTeam.players[existingIdx].role;
    homeTeam.players[existingIdx] = { ...userRosterPlayer, role: homeTeam.players[existingIdx].role };
  } else {
    const slotIdx = homeTeam.players.findIndex((p) => p.role === preferredRole);
    const replaceIdx = slotIdx >= 0 && slotIdx < 11 ? slotIdx : 9;
    if (homeTeam.players[replaceIdx]) {
      userRosterPlayer.role = homeTeam.players[replaceIdx].role;
      homeTeam.players[replaceIdx] = userRosterPlayer;
    } else {
      homeTeam.players.unshift(userRosterPlayer);
    }
  }

  return {
    homeTeam,
    awayTeam,
    lockedPlayerId: userRosterPlayer.id,
  };
}

/**
 * Applies TacticalGamePlan changes back onto DrawStar EditorTeamData (Task 4).
 */
export function applyGamePlanToEditorTeam(
  team: EditorTeamData,
  gameplayTeam: TeamDefinition,
  formation: FormationName,
  playstyle: TacticalPlaystyle,
  tactics: DetailedTactics,
  roles: TeamTacticalRoles
): EditorTeamData {
  const currentPrimary = team.manager?.primaryTactic || {
    formation: '4-3-3',
    style: 'possession',
    positions: [],
    playstyle: 'possession',
    defensiveLine: 3,
    defensiveStyle: 'zonal',
    offsideTrap: 'NO' as const,
    compactness: 3,
    passingStyle: 'short',
    finalThirdApproach: 'secure',
    teamShape: 'free',
    attackingSupport: 'moderate',
  };

  const styleMap: Record<string, TacticalStyle> = {
    possession: 'possession',
    gegenpress: 'gegenpressing',
    counterattack: 'counter_attack',
    catenaccio: 'catenaccio',
    long_ball: 'long_balls',
  };

  const nextManager = {
    name: team.manager?.name || 'Head Coach',
    nationality: team.manager?.nationality || (team.countryCode as Nationality['code']) || 'ES',
    age: team.manager?.age || 45,
    hasSecondaryTactic: team.manager?.hasSecondaryTactic || false,
    secondaryTactic: team.manager?.secondaryTactic,
    primaryTactic: {
      ...currentPrimary,
      formation: formation as any,
      style: (styleMap[playstyle] || currentPrimary.style || 'possession') as TacticalStyle,
      positions: currentPrimary.positions || [],
      playstyle: playstyle as any,
      defensiveLine: tactics.defensiveLine as any,
      defensiveStyle: tactics.defensiveStyle as any,
      offsideTrap: (tactics.offsideTrap ? 'YES' : 'NO') as 'YES' | 'NO',
      compactness: tactics.compactness as any,
      passingStyle: tactics.creation as any,
      finalThirdApproach: tactics.finalThird as any,
      teamShape: tactics.shape as any,
      attackingSupport: tactics.runs as any,
    },
  };

  // Sync Starting XI (1-11) & Subs (12-18) onto SquadSlot[] while preserving slots 19-35, reserves, u20, u17
  const origSquad = team.squadSaveFile?.squad || [];
  const slotById = new Map<string, SquadSlot>();
  for (const s of origSquad) {
    if (s.player?.id) slotById.set(s.player.id, s);
  }
  const origSlotByNum = new Map<number, SquadSlot>();
  for (const s of origSquad) {
    origSlotByNum.set(s.slotNumber, s);
  }

  const nextPrimarySlots: SquadSlot[] = [];
  for (let i = 0; i < 18; i++) {
    const slotNumber = i + 1;
    const gp = gameplayTeam.players[i];
    const prevSlot = (gp && slotById.get(gp.id)) || origSlotByNum.get(slotNumber);
    const baseCard = prevSlot?.player;
    if (gp && baseCard) {
      nextPrimarySlots.push({
        slotNumber,
        player: {
          ...baseCard,
          subPosition: gp.subPosition,
          playStyle: gp.playstyle,
          shirtNumber: gp.number,
          number: gp.number,
        },
      });
    } else if (prevSlot) {
      nextPrimarySlots.push(prevSlot);
    } else {
      nextPrimarySlots.push({ slotNumber, player: null });
    }
  }

  const extraSquadSlots = origSquad.filter((s) => s.slotNumber > 18);

  return {
    ...team,
    manager: nextManager,
    tacticalRoles: roles,
    captainPlayerId: roles.captainId,
    keyRoles: {
      ...(team.keyRoles || {}),
      captainPlayerId: roles.captainId,
      goalscorerPlayerId: roles.penaltyTakerId,
      creatorPlayerId: roles.freeKickNearId,
    },
    squadSaveFile: {
      squad: [...nextPrimarySlots, ...extraSquadSlots],
      reserves: team.squadSaveFile?.reserves || [],
      u20: team.squadSaveFile?.u20 || [],
      u17: team.squadSaveFile?.u17 || [],
    },
  };
}

export function resolveGameplayConfederationLabel(c: CanonicalConfederation): string {
  return c;
}

// ============================================================================
// PHASE 8: STREET 7v7, YOUTH/INT'L YOUTH CUP & U17 NATIONAL ADAPTERS
// ============================================================================

export interface StreetGameplayMatchBundle extends StreetMatchBuildResult {
  homeTeam: TeamDefinition;
  awayTeam: TeamDefinition;
  formation: StreetFormationName;
  matchMode: FootballMatchMode;
  displayedHalfMinutes: 30;
}

/**
 * Builds ready-to-play native 7v7 (1-2-2-2) Street Teams + fresh 13-player pull from the current city,
 * assigning contrasting Streetwear bibs and the bespoke city Street stadium without padding to 11.
 */
export function buildStreetGameplayTeams(
  cityIdOrName?: string,
  leagueDb?: LeagueDatabase | null,
  userPlayer?: PlayerCardData | PlayerConfig | null,
  options?: StreetMatchBuildOptions
): StreetGameplayMatchBundle {
  const streetMatch = buildStreetMatchTeams(cityIdOrName, leagueDb, userPlayer, options);

  const homeTeam = editorTeamToGameplayTeam(
    streetMatch.homeEditorTeam,
    `${streetMatch.cityName} Street 7v7`,
    undefined,
    {
      teamSize: 7,
      isStreet: true,
      cityId: streetMatch.cityId,
      stadiumOverride: streetMatch.stadium,
    }
  );
  const awayTeam = editorTeamToGameplayTeam(
    streetMatch.awayEditorTeam,
    `${streetMatch.cityName} Street 7v7`,
    undefined,
    {
      teamSize: 7,
      isStreet: true,
      cityId: streetMatch.cityId,
      stadiumOverride: streetMatch.stadium,
    }
  );

  // Align Away kit directly to its contrasting Streetwear bib
  awayTeam.kit = {
    ...awayTeam.kit,
    name: streetMatch.bibPair.awayName,
    primaryColor: streetMatch.bibPair.awayKit.color1,
    secondaryColor: streetMatch.bibPair.awayKit.color2,
    shortsColor: streetMatch.bibPair.awayKit.color2,
    socksColor: streetMatch.bibPair.awayKit.color1,
  };
  homeTeam.kit = {
    ...homeTeam.kit,
    name: streetMatch.bibPair.homeName,
    primaryColor: streetMatch.bibPair.homeKit.color1,
    secondaryColor: streetMatch.bibPair.homeKit.color2,
    shortsColor: streetMatch.bibPair.homeKit.color2,
    socksColor: streetMatch.bibPair.homeKit.color1,
  };
  homeTeam.awayKit = { ...awayTeam.kit };

  return {
    ...streetMatch,
    homeTeam,
    awayTeam,
    formation: '1-2-2-2',
    matchMode: 'street',
    displayedHalfMinutes: 30,
  };
}

export interface YouthAndIntlCupGameplayOptions {
  homeClub:
    | string
    | InternationalYouthClub
    | YouthTeamData
    | EditorTeamData
    | { id?: string; name: string; country?: string; teamOvr?: number; primaryColor?: string; secondaryColor?: string };
  awayClub:
    | string
    | InternationalYouthClub
    | YouthTeamData
    | EditorTeamData
    | { id?: string; name: string; country?: string; teamOvr?: number; primaryColor?: string; secondaryColor?: string };
  age?: number; // Defaults strictly to 16 for Kickoff Youth
  competitionMode?: 'youth_league' | 'intl_youth_cup' | 'intl_youth_cup_final';
  seasonYear?: number;
  userPlayer?: PlayerCardData | PlayerConfig | null;
}

export interface YouthAndIntlCupGameplayBundle {
  homeTeam: TeamDefinition;
  awayTeam: TeamDefinition;
  homeEditorTeam: EditorTeamData;
  awayEditorTeam: EditorTeamData;
  stadium: StadiumDefinition;
  age: number;
  matchMode: FootballMatchMode;
  competitionMode: 'youth_league' | 'intl_youth_cup' | 'intl_youth_cup_final';
  displayedHalfMinutes: 35 | 45;
  disableSurroundingsAndIntro: boolean;
  isCasualCrowd: boolean;
  crowdAttendancePctOverride?: number;
  finalBoardCity?: string;
  finalBoardYear?: number;
  lockedPlayerId?: string;
}

function isEditorTeamData(val: unknown): val is EditorTeamData {
  return Boolean(val && typeof val === 'object' && 'squadSaveFile' in (val as any));
}

function resolveYouthLeagueSideEditorTeam(
  clubInput: YouthAndIntlCupGameplayOptions['homeClub'],
  age: number,
  userPlayer?: PlayerCardData | PlayerConfig | null
): { team: EditorTeamData; leagueName: string; stadium: StadiumDefinition } {
  if (isEditorTeamData(clubInput)) {
    const stadium = resolveYouthStadiumForClub(
      {
        name: clubInput.name,
        country: clubInput.countryName || clubInput.countryCode,
        stadiumId: clubInput.stadium?.gameplayStadiumId,
      },
      false
    );
    const updated =
      userPlayer && userPlayer.club?.toLowerCase() === clubInput.name.toLowerCase()
        ? injectUserPlayerIntoYouthEditorTeam(clubInput, userPlayer as PlayerConfig)
        : clubInput;
    return {
      team: {
        ...updated,
        stadium: {
          name: stadium.name,
          capacity: stadium.capacity || 3500,
          tier: 2,
          gameplayStadiumId: stadium.id,
        },
      },
      leagueName: clubInput.leagueId || (clubInput.city ? `${clubInput.city} Youth League` : 'Domestic Youth League'),
      stadium,
    };
  }

  const name = typeof clubInput === 'string' ? clubInput : clubInput.name;
  const matched = findYouthTeamAndLeague(name);
  if (matched) {
    const scaled = getYouthLeagueTeamScaledSquad(matched.team, age);
    const stadium = resolveYouthStadiumForClub(
      {
        name: matched.team.name,
        country: matched.league.country,
        stadiumId: matched.team.stadiumId,
        tierClass: matched.team.tierClass,
      },
      false
    );
    let finalTeam: EditorTeamData = {
      ...scaled.team,
      stadium: {
        name: stadium.name,
        capacity: stadium.capacity || 3500,
        tier: 2,
        gameplayStadiumId: stadium.id,
      },
    };
    if (userPlayer && (userPlayer.club || '').toLowerCase() === matched.team.name.toLowerCase()) {
      finalTeam = injectUserPlayerIntoYouthEditorTeam(finalTeam, userPlayer as PlayerConfig);
    }
    return {
      team: finalTeam,
      leagueName: matched.league.name,
      stadium,
    };
  }

  const fallbackCountry = typeof clubInput === 'object' && 'country' in clubInput && clubInput.country ? clubInput.country : 'Argentina';
  const scaled = getYouthScaledTeamAndPlayers(
    {
      id: (typeof clubInput === 'object' && clubInput.id) || `youth_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      country: fallbackCountry,
      ovr: (typeof clubInput === 'object' && ('ovr' in clubInput ? clubInput.ovr : 'teamOvr' in clubInput ? clubInput.teamOvr : undefined)) || 46,
      primaryColor: (typeof clubInput === 'object' && 'primaryColor' in clubInput ? clubInput.primaryColor : undefined) || '#0284c7',
      secondaryColor: (typeof clubInput === 'object' && 'secondaryColor' in clubInput ? clubInput.secondaryColor : undefined) || '#ffffff',
    },
    age,
    'league'
  );
  const stadium = resolveYouthStadiumForClub({ name, country: fallbackCountry }, false);
  let finalTeam: EditorTeamData = {
    ...scaled.team,
    stadium: {
      name: stadium.name,
      capacity: stadium.capacity || 3500,
      tier: 2,
      gameplayStadiumId: stadium.id,
    },
  };
  if (userPlayer && (userPlayer.club || '').toLowerCase() === name.toLowerCase()) {
    finalTeam = injectUserPlayerIntoYouthEditorTeam(finalTeam, userPlayer as PlayerConfig);
  }
  return {
    team: finalTeam,
    leagueName: `${fallbackCountry} Youth League`,
    stadium,
  };
}

/**
 * Exposes playable Youth League and Int'l Youth Cup gameplay TeamDefinitions,
 * defaulting Kickoff Youth age strictly to 16 and supporting 23-player rosters & Final Pro showcase rules.
 */
export function buildYouthAndIntlCupGameplayTeams(
  options: YouthAndIntlCupGameplayOptions
): YouthAndIntlCupGameplayBundle {
  const age = Math.max(10, Math.min(16, Math.round(options.age ?? 16)));
  const competitionMode = options.competitionMode || 'youth_league';
  const seasonYear = options.seasonYear ?? new Date().getFullYear();
  const userConfig = options.userPlayer ? (options.userPlayer as unknown as PlayerConfig) : undefined;

  const normalizeCupClubInput = (
    c: YouthAndIntlCupGameplayOptions['homeClub'],
    fallbackId: string
  ) => {
    if (typeof c === 'string') {
      const matchedYL = findYouthTeamAndLeague(c);
      return {
        id: matchedYL?.team.id || fallbackId,
        name: c,
        country: matchedYL?.league.country || 'Argentina',
        federation: 'UEFA' as const,
        primaryColor: matchedYL?.team.primaryColor || '#0284c7',
        secondaryColor: matchedYL?.team.secondaryColor || '#ffffff',
        preferredFormation: '4-3-3',
        teamOvr: matchedYL?.team.ovr ? matchedYL.team.ovr + 14 : 64,
        sourceType: 'federation_pool' as const,
      };
    }
    const anyC = c as any;
    return {
      id: anyC.id || fallbackId,
      name: anyC.name,
      country: anyC.country || anyC.countryName || 'Argentina',
      federation: anyC.federation || 'UEFA',
      primaryColor: anyC.primaryColor || anyC.kit?.color1 || '#0284c7',
      secondaryColor: anyC.secondaryColor || anyC.kit?.color2 || '#ffffff',
      preferredFormation: anyC.preferredFormation || anyC.manager?.primaryTactic?.formation || '4-3-3',
      teamOvr: anyC.teamOvr || anyC.ovr || anyC.overallRating || 64,
      sourceType: (anyC.sourceType || 'federation_pool') as 'federation_pool' | 'youth_league',
      tierClass: anyC.tierClass,
    };
  };

  let homeEditorTeam: EditorTeamData;
  let awayEditorTeam: EditorTeamData;
  let stadium: StadiumDefinition;
  let leagueLabel = 'Youth League';
  let displayedHalfMinutes: 35 | 45 = 35;
  let disableSurroundingsAndIntro = true;
  let crowdAttendancePctOverride: number | undefined;
  let finalBoardCity: string | undefined;
  let finalBoardYear: number | undefined;

  if (competitionMode === 'intl_youth_cup_final') {
    const cupHome = normalizeCupClubInput(options.homeClub, 'intl_cup_home');
    const cupAway = normalizeCupClubInput(options.awayClub, 'intl_cup_away');
    const finalVenue = resolveIntlYouthCupFinalVenueConfig(
      cupHome,
      cupAway,
      seasonYear,
      userConfig
        ? { ...userConfig, age }
        : ({ id: 'kickoff_youth_guest', name: 'Guest', age, ovr: 68 } as unknown as PlayerConfig)
    );
    homeEditorTeam = finalVenue.homeTeam;
    awayEditorTeam = finalVenue.awayTeam;
    stadium = finalVenue.stadium;
    leagueLabel = 'International Youth Cup Final';
    displayedHalfMinutes = 45;
    disableSurroundingsAndIntro = false;
    crowdAttendancePctOverride = finalVenue.crowdAttendancePctOverride;
    finalBoardCity = finalVenue.finalBoardCity;
    finalBoardYear = finalVenue.finalBoardYear;
  } else if (competitionMode === 'intl_youth_cup') {
    const cupHome = buildIntlCupEditorTeam(normalizeCupClubInput(options.homeClub, 'intl_cup_home'), age, userConfig);
    const cupAway = buildIntlCupEditorTeam(normalizeCupClubInput(options.awayClub, 'intl_cup_away'), age, userConfig);
    homeEditorTeam = cupHome.team;
    awayEditorTeam = cupAway.team;
    stadium = cupHome.stadium;
    leagueLabel = 'International Youth Cup';
  } else {
    const ylHome = resolveYouthLeagueSideEditorTeam(options.homeClub, age, options.userPlayer);
    const ylAway = resolveYouthLeagueSideEditorTeam(options.awayClub, age, options.userPlayer);
    homeEditorTeam = ylHome.team;
    awayEditorTeam = ylAway.team;
    stadium = ylHome.stadium;
    leagueLabel = ylHome.leagueName;
  }

  const homeTeam = editorTeamToGameplayTeam(homeEditorTeam, leagueLabel);
  const awayTeam = editorTeamToGameplayTeam(awayEditorTeam, leagueLabel);
  homeTeam.homeStadiumId = stadium.id;
  if (homeTeam.homeVenueConfig) {
    homeTeam.homeVenueConfig = {
      ...homeTeam.homeVenueConfig,
      stadiumId: stadium.id,
      customStadiumName: stadium.name,
      pitchLengthMeters: stadium.pitchLengthMeters || (competitionMode === 'intl_youth_cup_final' ? 105 : 90),
      pitchWidthMeters: stadium.pitchWidthMeters || (competitionMode === 'intl_youth_cup_final' ? 68 : 56),
      turfQuality: stadium.turfQuality || 'normal',
    };
  }

  let lockedPlayerId: string | undefined;
  if (options.userPlayer) {
    const matchInHome = homeTeam.players.find(
      (p) =>
        p.id === options.userPlayer?.id ||
        p.name.toLowerCase() === (options.userPlayer?.name || '').toLowerCase()
    );
    lockedPlayerId = matchInHome?.id || options.userPlayer.id;
  }

  return {
    homeTeam,
    awayTeam,
    homeEditorTeam,
    awayEditorTeam,
    stadium,
    age,
    matchMode: 'youth',
    competitionMode,
    displayedHalfMinutes,
    disableSurroundingsAndIntro,
    isCasualCrowd: true,
    crowdAttendancePctOverride,
    finalBoardCity,
    finalBoardYear,
    lockedPlayerId,
  };
}

export interface U17NationalGameplayOptions {
  homeNation:
    | string
    | U17NationDescriptor
    | Nationality
    | { code: string; name: string; iso?: string; ovr?: number };
  awayNation:
    | string
    | U17NationDescriptor
    | Nationality
    | { code: string; name: string; iso?: string; ovr?: number };
  stageName?: string;
  seasonYear?: number;
  isKnockout?: boolean;
  userPlayer?: PlayerCardData | null;
}

export interface U17NationalGameplayBundle {
  homeTeam: TeamDefinition;
  awayTeam: TeamDefinition;
  homeEditorTeam: EditorTeamData;
  awayEditorTeam: EditorTeamData;
  stadium: StadiumDefinition;
  homeU17Squad: PlayerCardData[];
  awayU17Squad: PlayerCardData[];
  matchMode: FootballMatchMode;
  competitionTag: 'u17_world_cup';
  displayedHalfMinutes: 45;
  disableSurroundingsAndIntro: false;
  userIncludedTeam: 'home' | 'away' | null;
  lockedPlayerId?: string;
}

function resolveU17NationInput(
  input: U17NationalGameplayOptions['homeNation']
): U17NationDescriptor | { code: string; name: string; iso?: string; ovr?: number } {
  if (typeof input !== 'string') return input;
  const query = input.trim().toLowerCase();
  const db = getNationalTeamsDatabase();
  const matched = db.find(
    (nt) =>
      nt.nation.code.toLowerCase() === query ||
      nt.nation.name.toLowerCase() === query
  );
  if (matched) {
    return {
      code: matched.nation.code,
      name: matched.nation.name,
      iso: matched.nation.iso,
      ovr: matched.teamOvr || matched.ovr || 72,
    };
  }
  return {
    code: input.slice(0, 3).toUpperCase(),
    name: input,
    iso: input.slice(0, 2).toLowerCase(),
    ovr: 68,
  };
}

/**
 * Exposes playable U17 National Teams pulled directly from populated DB `u17Squad`
 * (23-man tournament call-up + Unique Career user player injection when selected)
 * configured on an authentic Pro World Cup stadium with 45m halves & full surroundings/intro.
 */
export function buildU17NationalGameplayTeams(
  options: U17NationalGameplayOptions
): U17NationalGameplayBundle {
  const natA = resolveU17NationInput(options.homeNation);
  const natB = resolveU17NationInput(options.awayNation);
  const stageName = options.stageName || 'Group Stage';
  const seasonYear = options.seasonYear ?? new Date().getFullYear();

  const wcConfig = resolveU17WorldCupMatchConfig(
    {
      stageName,
      isKnockout: options.isKnockout,
    },
    natA,
    natB,
    seasonYear,
    options.userPlayer || undefined
  );

  const homeTeam = editorTeamToGameplayTeam(wcConfig.homeTeam, 'U17 World Championship');
  const awayTeam = editorTeamToGameplayTeam(wcConfig.awayTeam, 'U17 World Championship');
  homeTeam.category = 'national';
  awayTeam.category = 'national';
  homeTeam.homeStadiumId = wcConfig.stadium.id;
  if (homeTeam.homeVenueConfig) {
    homeTeam.homeVenueConfig = {
      ...homeTeam.homeVenueConfig,
      stadiumId: wcConfig.stadium.id,
      customStadiumName: wcConfig.stadium.name,
      pitchLengthMeters: wcConfig.pitchMetrics.lengthMeters,
      pitchWidthMeters: wcConfig.pitchMetrics.widthMeters,
    };
  }

  let lockedPlayerId: string | undefined;
  if (options.userPlayer && wcConfig.userIncludedTeam) {
    const targetTeam = wcConfig.userIncludedTeam === 'home' ? homeTeam : awayTeam;
    const found = targetTeam.players.find(
      (p) =>
        p.id === options.userPlayer?.id ||
        p.name.toLowerCase() === (options.userPlayer?.name || '').toLowerCase()
    );
    lockedPlayerId = found?.id || options.userPlayer.id;
  }

  return {
    homeTeam,
    awayTeam,
    homeEditorTeam: wcConfig.homeTeam,
    awayEditorTeam: wcConfig.awayTeam,
    stadium: wcConfig.stadium,
    homeU17Squad: wcConfig.homeU17Squad,
    awayU17Squad: wcConfig.awayU17Squad,
    matchMode: 'youth',
    competitionTag: 'u17_world_cup',
    displayedHalfMinutes: 45,
    disableSurroundingsAndIntro: false,
    userIncludedTeam: wcConfig.userIncludedTeam,
    lockedPlayerId,
  };
}

