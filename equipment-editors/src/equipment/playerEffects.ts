import { bootDesign, bootMaterial, bootPaint, type BootModifiers, type StatLevel } from "./bootCatalog";
import { getSelectedPlayer, type SavedPlayer } from "./playerRegistry";
import { loadBoots } from "./bootRegistry";

const SHIFT: Record<StatLevel, number> = { low: -8, medium: 0, high: 8 };

function clamp(n: number): number {
  return Math.max(40, Math.min(99, Math.round(n)));
}

export interface PitchNote {
  weather?: string;
  surface?: string;
}

/** Boot material shifts this player's stats. Weather only scales those shifts. */
export function statsWithBoots(player: SavedPlayer, pitch: PitchNote = {}) {
  const boot = loadBoots().find((item) => item.id === player.bootId) ?? loadBoots()[0];
  const design = boot ? bootDesign(boot.designId) : null;
  const material = design ? bootMaterial(design.materialId) : null;
  const mods: BootModifiers | null = material?.modifiers ?? null;
  const wet = pitch.weather === "rain" || pitch.weather === "torrential" || pitch.surface === "wet" || pitch.surface === "muddy";
  const passCut = material?.id === "kangaroo" && wet ? 0.5 : 1;
  const speed = mods ? SHIFT[mods.speed] + SHIFT[mods.agility] * 0.5 : 0;
  const sprint = mods ? SHIFT[mods.speed] + SHIFT[mods.acceleration] : 0;
  return {
    speed: clamp(player.speed + speed),
    sprintSpeed: clamp(player.sprintSpeed + sprint),
    shotPower: clamp(player.shotPower + (mods ? SHIFT[mods.power] : 0)),
    passing: clamp(player.passing + (mods ? SHIFT[mods.passAccuracy] * passCut + SHIFT[mods.control] * 0.5 * passCut : 0)),
    tackling: clamp(player.tackling),
    heading: clamp(player.heading),
    dribbling: clamp(player.dribbling + (mods ? SHIFT[mods.dribbling] + SHIFT[mods.control] * 0.5 : 0)),
    curve: mods ? 1 + SHIFT[mods.curve] / 50 : 1,
    staminaDrain: material?.id === "bovine" && wet ? 1.2 : 1,
    boot,
    design,
    paint: boot && design ? bootPaint(design.id, boot.subOptionId) : "",
  };
}

/** Copies the selected created player onto the match's user player. */
export function applyCreatedPlayer(player: {
  name: string;
  stats: { speed: number; sprintSpeed: number; shotPower: number; passing: number; tackling: number; heading: number; dribbling?: number };
  bootDesignId?: string;
  bootSubOptionId?: string;
  bootColors?: string[];
  bootCurve?: number;
  bootStaminaDrain?: number;
  bootPaint?: string;
}, pitch: PitchNote = {}) {
  const selected = getSelectedPlayer();
  const rated = statsWithBoots(selected, pitch);
  player.name = selected.name;
  player.stats.speed = rated.speed;
  player.stats.sprintSpeed = rated.sprintSpeed;
  player.stats.shotPower = rated.shotPower;
  player.stats.passing = rated.passing;
  player.stats.tackling = rated.tackling;
  player.stats.heading = rated.heading;
  player.stats.dribbling = rated.dribbling;
  player.bootCurve = rated.curve;
  player.bootStaminaDrain = rated.staminaDrain;
  if (rated.boot && rated.design) {
    player.bootDesignId = rated.design.id;
    player.bootSubOptionId = rated.boot.subOptionId;
    player.bootColors = [...rated.boot.colors];
    player.bootPaint = rated.paint;
  }
}
