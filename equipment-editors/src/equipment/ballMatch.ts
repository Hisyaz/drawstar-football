import { designAllowsWinter, materialById, type BallMaterialId, type StatLevel } from "./ballCatalog";
import { loadBalls, type SavedBall } from "./ballRegistry";

const SELECT_KEY = "drawstar.ball.selected";

const LEVEL: Record<StatLevel, number> = {
  low: 0.84,
  medium: 1,
  high: 1.16,
  maximum: 1.34,
};

export interface KickFlight {
  vx: number;
  vy: number;
  vz: number;
  spin: number;
  spinY: number;
}

export interface BallPitchState {
  weather?: string;
  grass?: string;
  surface?: string;
  minute?: number;
}

export type KickKind = "short" | "long" | "cross" | "shot";

let matchSeason = "summer";

export function setMatchSeason(season: string) {
  matchSeason = season;
}

export function getMatchSeason(): string {
  return matchSeason;
}

export function ballsForCurrentSeason(): SavedBall[] {
  const balls = loadBalls();
  if (matchSeason === "winter") return balls.filter((ball) => ball.winter && designAllowsWinter(ball.materialId));
  return balls.filter((ball) => !ball.winter);
}

export function getSelectedBall(): SavedBall {
  const balls = ballsForCurrentSeason();
  const fallback = balls[0] ?? loadBalls()[0];
  if (typeof localStorage === "undefined") return fallback;
  const id = localStorage.getItem(SELECT_KEY);
  return balls.find((b) => b.id === id) ?? fallback;
}

export function setSelectedBallId(id: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SELECT_KEY, id);
}

function scaleSpeed(flight: KickFlight, factor: number) {
  flight.vx *= factor;
  flight.vy *= factor;
}

function jitter(flight: KickFlight, amount: number) {
  const side = Math.random() < 0.5 ? -1 : 1;
  const len = Math.hypot(flight.vx, flight.vy) || 1;
  flight.vx += (-flight.vy / len) * amount * side;
  flight.vy += (flight.vx / len) * amount * side;
}

/** Scales a kick from the selected material. Weather and pitch only change those numbers. */
export function applyKickMaterial(flight: KickFlight, kind: KickKind, pitch: BallPitchState = {}): BallMaterialId {
  const ball = getSelectedBall();
  const material = materialById(ball.materialId);
  const mods = material.modifiers;
  const wet = pitch.weather === "rain" || pitch.weather === "torrential" || pitch.surface === "wet" || pitch.surface === "muddy";
  const longGrass = pitch.grass === "long";
  const shortGrass = pitch.grass === "short" || pitch.grass === "shaved";
  const cold = pitch.weather === "snow" || pitch.weather === "blizzard";
  const windy = pitch.weather === "wind" || pitch.weather === "windy";
  const minute = pitch.minute ?? 0;

  scaleSpeed(flight, LEVEL[mods.speed] * (0.92 + LEVEL[mods.power] * 0.08));
  flight.vz *= 0.9 + LEVEL[mods.power] * 0.1;
  flight.spin *= LEVEL[mods.curve];
  if (LEVEL[mods.accuracy] < 1) jitter(flight, (1 - LEVEL[mods.accuracy]) * 1.4);
  if (kind === "long" && mods.longPassAccuracy) jitter(flight, (1 - LEVEL[mods.longPassAccuracy]) * 2.2);

  switch (ball.materialId) {
    case "raw_pigskin":
      if (!wet && shortGrass) scaleSpeed(flight, 1.08);
      if (!wet) jitter(flight, 0.45);
      if (wet) flight.spin *= 0.72;
      break;
    case "woven_hemp":
      if (longGrass) scaleSpeed(flight, 0.62);
      if (wet) {
        scaleSpeed(flight, 0.55);
        flight.vz *= 0.7;
      }
      break;
    case "dressed_leather":
      if (wet) {
        const soak = Math.min(0.22, minute / 280);
        scaleSpeed(flight, 1 - soak);
        flight.spin *= 1 - soak;
        flight.vz *= 1 + soak * 0.35;
      }
      break;
    case "pu_coated_skin":
      if (wet) scaleSpeed(flight, 1.08);
      break;
    case "micro_textured":
      if (longGrass) scaleSpeed(flight, 1.06);
      break;
    case "glossy_pvc":
      flight.spin *= 0.9;
      break;
    case "thermobond":
      if (Math.abs(flight.spin) < 1.2) jitter(flight, wet || windy ? 1.8 : 1.15);
      break;
    case "groove_synthetic":
      break;
    case "ocean_composite":
      if (shortGrass && !wet) scaleSpeed(flight, 1.08);
      break;
    case "smart_sensor":
      jitter(flight, -0.35);
      break;
    default:
      break;
  }

  if (cold && ball.materialId === "glossy_pvc") scaleSpeed(flight, 0.96);
  return ball.materialId;
}

let pitchState: BallPitchState = {};

export function setBallPitch(next: BallPitchState) {
  pitchState = { ...pitchState, ...next };
}

export function getBallPitch(): BallPitchState {
  return pitchState;
}

export function applyBallFrame(_ball: unknown, frame: { airborne: boolean; onPuddle: boolean }) {
  return ballEnvironment(pitchState, frame.airborne, frame.onPuddle);
}
export function ballEnvironment(pitch: BallPitchState, airborne: boolean, onPuddle: boolean): { bounce: number; drag: number; wind: number; kill: boolean } {
  const id = getSelectedBall().materialId;
  const material = materialById(id);
  const wet = pitch.weather === "rain" || pitch.weather === "torrential" || pitch.surface === "wet" || pitch.surface === "muddy";
  const windy = pitch.weather === "wind" || pitch.weather === "windy" || wet;
  let bounce = LEVEL[material.modifiers.bounce];
  let drag = 1;
  let wind = 0;
  let kill = false;

  if (id === "raw_pigskin" && onPuddle && !airborne) kill = true;
  if (id === "woven_hemp" && wet && !airborne) drag = 0.9;
  if (id === "pu_coated_skin" && wet && !airborne) drag = 1.015;
  if (id === "glossy_pvc" && (pitch.surface === "muddy" || wet) && !airborne) drag = 1.01;
  if (id === "thermobond" && airborne && (wet || windy)) wind = 0.045;
  if (id === "ocean_composite" && airborne && windy) wind = 0.03;
  if (id === "groove_synthetic") wind = 0;
  if (id === "woven_hemp") bounce *= 0.82;
  return { bounce, drag, wind, kill };
}
