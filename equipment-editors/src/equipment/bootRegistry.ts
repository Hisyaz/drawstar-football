import { BOOT_PRESETS, bootDesign, type BootPreset } from "./bootCatalog";

const STORAGE_KEY = "drawstar.boots.v4";

export interface SavedBoot {
  id: string;
  name: string;
  designId: string;
  subOptionId?: string;
  colors: string[];
}

function presetToSaved(preset: BootPreset): SavedBoot {
  return { id: preset.id, name: preset.name, designId: preset.designId, subOptionId: preset.subOptionId, colors: [...preset.colors] };
}

export function defaultBoots(): SavedBoot[] {
  return BOOT_PRESETS.map(presetToSaved);
}

export function colorsMatchBoot(designId: string, colors: readonly string[]): boolean {
  const design = bootDesign(designId);
  return colors.length === design.slots.length && colors.every((color, i) => design.slots[i].colors.includes(color));
}

export function colorsForBoot(designId: string, previous: readonly string[] = []): string[] {
  const design = bootDesign(designId);
  return design.slots.map((slot, i) => (previous[i] && slot.colors.includes(previous[i]) ? previous[i] : slot.colors[0]));
}

export function upsertBoot(boot: SavedBoot): SavedBoot[] {
  const boots = loadBoots().filter((item) => item.id !== boot.id);
  boots.push({ ...boot, name: boot.name.trim(), colors: [...boot.colors] });
  saveBoots(boots);
  return boots;
}

export function deleteBoot(id: string): SavedBoot[] {
  const boots = loadBoots().filter((item) => item.id !== id);
  saveBoots(boots.length ? boots : defaultBoots());
  return boots.length ? boots : defaultBoots();
}

export function loadBoots(): SavedBoot[] {
  if (typeof localStorage === "undefined") return defaultBoots();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = defaultBoots();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as SavedBoot[];
    if (!Array.isArray(parsed)) return defaultBoots();
    const valid = parsed.filter((boot) => boot && colorsMatchBoot(boot.designId, boot.colors));
    return valid.length ? valid : defaultBoots();
  } catch {
    return defaultBoots();
  }
}

export function saveBoots(boots: readonly SavedBoot[]): void {
  if (typeof localStorage === "undefined") return;
  const names = new Set<string>();
  for (const boot of boots) {
    const key = boot.name.trim().toLowerCase();
    if (!key) throw new Error("Boot name is required");
    if (names.has(key)) throw new Error(`Duplicate boot name: ${boot.name}`);
    if (!colorsMatchBoot(boot.designId, boot.colors)) throw new Error(`Colors do not match the design for ${boot.name}`);
    names.add(key);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boots));
}
