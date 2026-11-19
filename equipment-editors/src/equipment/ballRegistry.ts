import {
  BALL_PRESETS,
  designAllowsWinter,
  resolveBall,
  slotChoices,
  type BallPreset,
} from "./ballCatalog";

const STORAGE_KEY = "drawstar.balls.v6";

export interface SavedBall {
  id: string;
  name: string;
  designId: string;
  subOptionId?: string;
  materialId: BallPreset["materialId"];
  colors: string[];
  winter?: boolean;
}

function canStore(): boolean {
  return typeof localStorage !== "undefined";
}

function presetToSaved(preset: BallPreset): SavedBall {
  return {
    id: preset.id,
    name: preset.name,
    designId: preset.designId,
    subOptionId: preset.subOptionId,
    materialId: preset.materialId,
    colors: [...preset.colors],
  };
}

export function defaultBalls(): SavedBall[] {
  return BALL_PRESETS.map(presetToSaved);
}

export function colorsMatchDesign(designId: string, colors: readonly string[], winter = false, subOptionId?: string): boolean {
  const resolved = resolveBall(designId, subOptionId);
  if (winter && !designAllowsWinter(resolved.materialId)) return false;
  if (colors.length !== resolved.design.slots.length) return false;
  return colors.every((color, i) => slotChoices(resolved.design.slots[i], winter).includes(color));
}

export function colorsForDesign(designId: string, previous: readonly string[] = [], winter = false, subOptionId?: string): string[] {
  const resolved = resolveBall(designId, subOptionId);
  const useWinter = winter && designAllowsWinter(resolved.materialId);
  return resolved.design.slots.map((slot, i) => {
    const choices = slotChoices(slot, useWinter);
    const kept = previous[i];
    return kept && choices.includes(kept) ? kept : choices[0];
  });
}

export function loadBalls(): SavedBall[] {
  if (!canStore()) return defaultBalls();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = defaultBalls();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as SavedBall[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultBalls();
    const valid = parsed.filter((ball) => ball && typeof ball.name === "string" && ball.designId && colorsMatchDesign(ball.designId, ball.colors, !!ball.winter, ball.subOptionId));
    return valid.length ? valid : defaultBalls();
  } catch {
    return defaultBalls();
  }
}

export function upsertBall(ball: SavedBall): SavedBall[] {
  const balls = loadBalls().filter((item) => item.id !== ball.id);
  balls.push({ ...ball, name: ball.name.trim(), colors: [...ball.colors] });
  saveBalls(balls);
  return balls;
}

export function deleteBall(id: string): SavedBall[] {
  const balls = loadBalls().filter((item) => item.id !== id);
  saveBalls(balls.length ? balls : defaultBalls());
  return balls.length ? balls : defaultBalls();
}
export function saveBalls(balls: readonly SavedBall[]): void {
  if (!canStore()) return;
  const names = new Set<string>();
  for (const ball of balls) {
    const key = ball.name.trim().toLowerCase();
    if (!key) throw new Error("Ball name is required");
    if (names.has(key)) throw new Error(`Duplicate ball name: ${ball.name}`);
    if (!colorsMatchDesign(ball.designId, ball.colors, !!ball.winter, ball.subOptionId)) throw new Error(`Colors do not match the design for ${ball.name}`);
    names.add(key);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(balls));
}
