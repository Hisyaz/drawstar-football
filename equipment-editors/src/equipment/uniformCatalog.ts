import type { BrandId } from "./brands";
import type { KitColorId } from "./kitPalette";

export type CollarType = "crew" | "vneck" | "polo";
export type CuffType = "none" | "small" | "normal" | "big";
export type ShirtPattern =
  | "solid"
  | "stripes"
  | "hoops"
  | "half"
  | "sash_left"
  | "sash_right"
  | "raglan"
  | "gradient"
  | "check"
  | "diagonal"
  | "chest_line"
  | "two"
  | "middle";
export type SponsorFont = "block" | "narrow" | "classic" | "pixel" | "script";
export type SponsorBorder = "none" | "small" | "broad";
export type KitSlot = "home" | "away" | "gk" | "third" | "gk2";

export const COLLARS: { id: CollarType; label: string }[] = [
  { id: "crew", label: "Crew Neck" },
  { id: "vneck", label: "V-Neck" },
  { id: "polo", label: "Polo Buttoned" },
];

export const PATTERNS: { id: ShirtPattern; label: string }[] = [
  { id: "solid", label: "Solid Classic" },
  { id: "stripes", label: "Vertical Stripes" },
  { id: "hoops", label: "Horizontal Hoops" },
  { id: "half", label: "Half and Half" },
  { id: "sash_left", label: "Diagonal Sash (left)" },
  { id: "sash_right", label: "Diagonal Sash (right)" },
  { id: "raglan", label: "Raglan Sleeves" },
  { id: "gradient", label: "Smooth Gradient" },
  { id: "check", label: "Checkered Squares" },
  { id: "diagonal", label: "Diagonal Split" },
  { id: "chest_line", label: "Solid Chest Line" },
  { id: "two", label: "Two Colors" },
  { id: "middle", label: "Middle Stripe" },
];

export const CUFFS: { id: CuffType; label: string }[] = [
  { id: "none", label: "None" },
  { id: "small", label: "Small" },
  { id: "normal", label: "Normal" },
  { id: "big", label: "Big" },
];

export const FONTS: { id: SponsorFont; label: string; css: string }[] = [
  { id: "block", label: "Block", css: "Impact, sans-serif" },
  { id: "narrow", label: "Narrow", css: "Arial Narrow, Arial, sans-serif" },
  { id: "classic", label: "Classic", css: "Georgia, serif" },
  { id: "pixel", label: "Pixel", css: "monospace" },
  { id: "script", label: "Script", css: "cursive" },
];

export const BORDERS: { id: SponsorBorder; label: string }[] = [
  { id: "none", label: "None" },
  { id: "small", label: "Small" },
  { id: "broad", label: "Broad" },
];

export const KIT_SLOTS: { id: KitSlot; label: string; required: boolean }[] = [
  { id: "home", label: "HOME", required: true },
  { id: "away", label: "AWAY", required: true },
  { id: "gk", label: "GOALKEEPER", required: true },
  { id: "third", label: "THIRD", required: false },
  { id: "gk2", label: "GK 2", required: false },
];

export interface ShirtDesign {
  collar: CollarType;
  pattern: ShirtPattern;
  base: KitColorId;
  base2: KitColorId;
  patternColor: KitColorId;
  collarColor: KitColorId;
  cuff: CuffType;
  cuffColor: KitColorId;
  sponsor: string;
  font: SponsorFont;
  letterColor: KitColorId;
  border: SponsorBorder;
  borderColor: KitColorId;
}

export interface ClubTeam {
  id: string;
  name: string;
  brand: BrandId;
  kits: Partial<Record<KitSlot, ShirtDesign>>;
}

export function blankShirt(partial: Partial<ShirtDesign> = {}): ShirtDesign {
  return {
    collar: "crew",
    pattern: "solid",
    base: "navy",
    base2: "white",
    patternColor: "white",
    collarColor: "white",
    cuff: "small",
    cuffColor: "white",
    sponsor: "",
    font: "block",
    letterColor: "white",
    border: "none",
    borderColor: "black",
    ...partial,
  };
}
