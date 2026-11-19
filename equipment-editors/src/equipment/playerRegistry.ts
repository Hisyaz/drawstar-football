import { loadBoots } from "./bootRegistry";

const STORAGE_KEY = "drawstar.players.v1";
const SELECT_KEY = "drawstar.player.selected";

export interface SavedPlayer {
  id: string;
  name: string;
  speed: number;
  sprintSpeed: number;
  shotPower: number;
  passing: number;
  tackling: number;
  heading: number;
  dribbling: number;
  bootId: string;
}

function clamp(n: number): number {
  return Math.max(40, Math.min(99, Math.round(n) || 40));
}

export function defaultPlayer(): SavedPlayer {
  const bootId = loadBoots()[0]?.id ?? "";
  return {
    id: "player_default",
    name: "New Player",
    speed: 72,
    sprintSpeed: 74,
    shotPower: 70,
    passing: 72,
    tackling: 60,
    heading: 64,
    dribbling: 70,
    bootId,
  };
}

export function sanitizePlayer(player: SavedPlayer): SavedPlayer {
  return {
    ...player,
    name: player.name.trim() || "New Player",
    speed: clamp(player.speed),
    sprintSpeed: clamp(player.sprintSpeed),
    shotPower: clamp(player.shotPower),
    passing: clamp(player.passing),
    tackling: clamp(player.tackling),
    heading: clamp(player.heading),
    dribbling: clamp(player.dribbling),
  };
}

export function loadPlayers(): SavedPlayer[] {
  if (typeof localStorage === "undefined") return [defaultPlayer()];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = [defaultPlayer()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as SavedPlayer[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [defaultPlayer()];
    return parsed.filter((player) => player && typeof player.name === "string").map(sanitizePlayer);
  } catch {
    return [defaultPlayer()];
  }
}

export function savePlayers(players: readonly SavedPlayer[]): void {
  if (typeof localStorage === "undefined") return;
  const names = new Set<string>();
  for (const player of players) {
    const key = player.name.trim().toLowerCase();
    if (!key) throw new Error("Player name is required");
    if (names.has(key)) throw new Error(`Duplicate player name: ${player.name}`);
    names.add(key);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players.map(sanitizePlayer)));
}

export function upsertPlayer(player: SavedPlayer): SavedPlayer[] {
  const players = loadPlayers().filter((item) => item.id !== player.id);
  players.push(sanitizePlayer({ ...player, name: player.name.trim() }));
  savePlayers(players);
  return players;
}

export function deletePlayer(id: string): SavedPlayer[] {
  const players = loadPlayers().filter((item) => item.id !== id);
  const next = players.length ? players : [defaultPlayer()];
  savePlayers(next);
  return next;
}

export function getSelectedPlayer(): SavedPlayer {
  const players = loadPlayers();
  if (typeof localStorage === "undefined") return players[0];
  const id = localStorage.getItem(SELECT_KEY);
  return players.find((player) => player.id === id) ?? players[0];
}

export function setSelectedPlayerId(id: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SELECT_KEY, id);
}
