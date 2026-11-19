/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Phase 12: Parametric Player Appearance Framework (Integration Contract)
 *
 * Lightweight, zero-GC data contract for player physical dimensions,
 * facial features, hairstyles, uniform styling, and body art hooks.
 * Stored per-player in under 120 bytes (under 3 KB total across all 22 players).
 */

export type MelaninSkinTone =
  | '#ffdbac' // Tone 1: Light Nordic / Celtic
  | '#f1c27d' // Tone 2: Fair European / Mediterranean
  | '#e0ac69' // Tone 3: Olive / Southern European / East Asian
  | '#c68642' // Tone 4: Bronzed / Latin / Middle Eastern
  | '#8d5524' // Tone 5: Deep Bronze / South Asian / Afro-Latino
  | '#3b2219' // Tone 6: Rich Melanin / African
  | string;

export type HairPresetId =
  | 'buzzcut'
  | 'high-fade'
  | 'afro'
  | 'braids'
  | 'topknot'
  | 'wavy'
  | 'part'
  | 'bald'
  // Legacy preset support
  | 'curly_blond'
  | 'afro_black'
  | 'ponytail_dark'
  | 'dreads'
  | 'crop_brown'
  | 'blond_sweep'
  | 'ginger_curly'
  | 'spiky_black'
  | string;

export type FacialHairPreset = 'clean' | 'stubble' | 'beard' | 'goatee';

export type JerseyFitPreset = 'tucked' | 'untucked';

export type CollarStylePreset = 'crew' | 'v-neck' | 'polo';

export type SleeveLengthPreset = 'short' | 'long' | 'undershirt';

export type SockHeightPreset = 'low' | 'standard' | 'high-knee';

export type EarringStylePreset = 'none' | 'left-stud' | 'right-stud' | 'dual-stud' | 'small-hoop';

export type TattooPreset = 'none' | 'forearm-ink' | 'full-sleeve';

export interface PlayerTattoos {
  leftArm: TattooPreset;
  rightArm: TattooPreset;
}

/**
 * Authoritative PlayerAppearance Integration Schema
 */
export interface PlayerAppearance {
  // Physical Dimensions (scales coordinate transforms)
  heightCm: number;          // 165 - 202 (scales vertical player height multiplier 0.88 - 1.15)
  weightKg: number;          // 60 - 95 (scales torso radius & shadow spread)
  muscleMass: number;        // 1 - 5 (controls limb thickness, shoulder width)
  // Thickness tiers (0 thin .. 3 thick). Optional: default follows the body build.
  // C6 canonical names live in AppearanceV2.physique and bodyProfile.ts.
  calfTier?: 0 | 1 | 2 | 3;
  thighTier?: 0 | 1 | 2 | 3;
  waistTier?: 0 | 1 | 2 | 3;
  chestTier?: 0 | 1 | 2 | 3;
  armTier?: 0 | 1 | 2 | 3;
  neckTier?: 0 | 1 | 2 | 3;
  skinTone: MelaninSkinTone; // Hex melanin tone

  // Head & Hair Preset IDs
  hairStyle: HairPresetId;
  hairColor: string;         // Hex hair tint
  facialHair?: FacialHairPreset;

  // Uniform & Kit Styling Hooks
  jerseyFit?: JerseyFitPreset;
  collarStyle?: CollarStylePreset;
  sleeveLength?: SleeveLengthPreset;
  sockHeight?: SockHeightPreset;

  // Accessories & Body Art Hooks
  earrings?: EarringStylePreset;
  tattoos?: PlayerTattoos;

  // Backwards compatibility flag for legacy systems
  hasBeard?: boolean;
}

// ============================================================================
// C6: Appearance and Physique Schema v2 (Canonical Data Model)
// Shared by renderer (C7/C8/C9), player editor (C10/C11), and managers (C12).
// ============================================================================

export type AppearanceSchemaVersion = 2;

export type HairLengthV2 = 'shaven' | 'fade' | 'short' | 'medium' | 'long';
export type HairTextureV2 = 'straight' | 'wavy' | 'curly' | 'braids' | 'dreads';
export type HairColorV2 = 'black' | 'dark_brown' | 'light_brown' | 'auburn' | 'blonde' | 'red';
export type HairDyeV2 =
  | 'natural'
  | 'silver_white'
  | 'platinum'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'pink'
  | 'blue'
  | 'green';

export type SkinToneV2 = 'pale' | 'fair' | 'tanned' | 'sun_kissed' | 'olive' | 'dark' | 'ebony';

export type FacialHairV2 =
  | 'none'
  | 'full_beard'
  | 'well_kept_beard'
  | 'three_day_stubble'
  | 'mutton_chops'
  | 'royal_beard'
  | 'goatee'
  | 'chin_strap'
  | 'mustache'
  | 'pointy_mustache'
  | 'classic_mustache';

export type HeadwearV2 =
  | 'none'
  | 'sports_headband'
  | 'performance_elastic_band'
  | 'protective_face_mask'
  | 'sports_glasses';

export type NecklaceV2 =
  | 'none'
  | 'military_tag'
  | 'silver_necklace'
  | 'gold_necklace'
  | 'diamond_encrusted_gold_necklace';

export type NeckTattooV2 = 'none' | 'script_lettering' | 'rose' | 'blackout_neck' | 'winger_crest';
export type ArmTattooV2 =
  | 'none'
  | 'double_stripe_band'
  | 'script_name_sleeve'
  | 'tribal_sleeve'
  | 'floral_mandala_sleeve'
  | 'blackout_sleeve';
export type FaceTattooV2 = 'none' | 'cheek_star' | 'under_eye_cross' | 'cheek_script' | 'temple_crown';

export interface TattoosV2 {
  neck: NeckTattooV2;
  leftArm: ArmTattooV2;
  rightArm: ArmTattooV2;
  face: FaceTattooV2;
}

export type EarringStyleV2 = 'none' | 'small_barbell' | 'large_barbell' | 'studs' | 'gem';
export type EarringMaterialV2 = 'silver' | 'gold' | 'bronze' | 'black_steel' | 'steel';
export type EarringGemV2 = 'diamond' | 'white_pearl' | 'emerald' | 'sapphire' | 'amethyst';

export interface EarringSlotV2 {
  style: EarringStyleV2;
  material: EarringMaterialV2;
  gem: EarringGemV2;
}

export interface EarringsV2 {
  left: EarringSlotV2;
  right: EarringSlotV2;
}

// 4-tier physique thickness types + limb/neck lengths
export type ThicknessTier = 0 | 1 | 2 | 3;
export type NeckWidthV2 = 'thin' | 'normal' | 'wide' | 'bulky';
export type NeckLengthV2 = 'turtle' | 'short' | 'normal' | 'long';
export type ChestSizeV2 = 'frail' | 'normal' | 'wide' | 'powerful';
export type WaistSizeV2 = 'skinny' | 'normal' | 'chubby' | 'chonky';
export type ThighSizeV2 = 'skinny' | 'normal' | 'powerful' | 'huge';
export type CalfSizeV2 = 'skinny' | 'normal' | 'powerful' | 'huge';
export type LimbLengthV2 = 'short' | 'normal' | 'long';
export type MuscularityTierV2 = 'low' | 'medium' | 'high';

export interface PhysiqueV2 {
  heightCm: number;
  weightKg: number;
  strength: number; // 0-70 = low, 71-89 = medium, 90+ = high muscularity
  neckWidth: NeckWidthV2;
  neckLength: NeckLengthV2;
  chest: ChestSizeV2;
  waist: WaistSizeV2;
  thighs: ThighSizeV2;
  calves: CalfSizeV2;
  legsLength: LimbLengthV2;
  armsLength: LimbLengthV2;
}

export type ShirtCutV2 = 'tight' | 'normal' | 'big_retro';
export type JerseyTuckV2 = 'tucked' | 'untucked';
export type SockLengthV2 = 'short' | 'normal' | 'long';
export type SleeveLengthV2 = 'normal' | 'long';
export type InteriorShirtSleeveV2 = 'short' | 'long';
export type InteriorShirtNeckV2 = 'short' | 'long';

export interface InteriorShirtV2 {
  enabled: boolean;
  sleeve: InteriorShirtSleeveV2;
  neck: InteriorShirtNeckV2;
}

export interface UniformV2 {
  shirtCut: ShirtCutV2;
  tucked: JerseyTuckV2;
  socks: SockLengthV2;
  sleeves: SleeveLengthV2;
  interiorShirt: InteriorShirtV2;
  shoeColor: string;
}

export type RegularGlassesDesignV2 = 'none' | 'round' | 'square' | 'rectangular';
export type GlassesShadeV2 = 'transparent' | 'tinted_black' | 'iridescent' | 'grey' | 'gold' | 'blue' | 'pink' | 'red';
export interface RegularGlassesV2 {
  design: RegularGlassesDesignV2;
  frameColor: string;
  shade: GlassesShadeV2;
}

export interface AppearanceV2 {
  version: AppearanceSchemaVersion;
  hairLength: HairLengthV2;
  hairTexture: HairTextureV2;
  hairColor: HairColorV2;
  hairDye: HairDyeV2;
  skinTone: SkinToneV2;
  facialHair: FacialHairV2;
  headwear: HeadwearV2;
  regularGlasses: RegularGlassesV2;
  necklace: NecklaceV2;
  tattoos: TattoosV2;
  earrings: EarringsV2;
  physique: PhysiqueV2;
  uniform: UniformV2;
}

export interface AppearanceValidationResult {
  valid: boolean;
  errors: string[];
  repaired: AppearanceV2;
}

