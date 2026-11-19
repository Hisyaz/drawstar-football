import { blankShirt, type ClubTeam, type KitSlot, type ShirtDesign } from "./uniformCatalog";
import type { BrandId } from "./brands";

const STORAGE_KEY = "drawstar.teams.v2";

function club(id: string, name: string, brand: BrandId, homeBase: ClubTeam["kits"]["home"]): ClubTeam {
  return {
    id,
    name,
    brand,
    kits: {
      home: homeBase,
      away: blankShirt({ base: "white", base2: homeBase?.base ?? "navy", patternColor: homeBase?.base ?? "navy", collarColor: homeBase?.base ?? "navy", cuffColor: homeBase?.base ?? "navy", pattern: "solid", sponsor: "AWAY", letterColor: homeBase?.base ?? "navy" }),
      gk: blankShirt({ base: "lime", base2: "black", patternColor: "black", pattern: "solid", collarColor: "black", cuffColor: "black", sponsor: "GK", letterColor: "black" }),
    },
  };
}

export function testClubs(): ClubTeam[] {
  return [
    club("club_generic", "Test FC", "generic", blankShirt({ pattern: "solid", base: "navy", patternColor: "white", sponsor: "TEST" })),
    club("club_leone", "Leone Athletic", "leone", blankShirt({ pattern: "stripes", base: "navy", patternColor: "white", sponsor: "LEONE" })),
    club("club_electrik", "Electrik FC", "electrik", blankShirt({ pattern: "sash_left", base: "black", patternColor: "sky", sponsor: "VOLT" })),
    club("club_tapitas", "Tapitas United", "tapitas", blankShirt({ pattern: "hoops", base: "red", patternColor: "white", collar: "polo", sponsor: "TAPITAS" })),
    club("club_low", "Low Systems", "low_systems", blankShirt({ pattern: "middle", base: "light_grey", patternColor: "black", sponsor: "LOW" })),
  ];
}

export function loadTeams(): ClubTeam[] {
  if (typeof localStorage === "undefined") return testClubs();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = testClubs();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as ClubTeam[];
    if (!Array.isArray(parsed) || parsed.length === 0) return testClubs();
    return parsed;
  } catch {
    return testClubs();
  }
}

export function saveTeams(teams: readonly ClubTeam[]): void {
  if (typeof localStorage === "undefined") return;
  const names = new Set<string>();
  for (const team of teams) {
    const key = team.name.trim().toLowerCase();
    if (!key) throw new Error("Club name is required");
    if (names.has(key)) throw new Error(`Duplicate club name: ${team.name}`);
    if (!team.kits.home || !team.kits.away || !team.kits.gk) throw new Error(`${team.name} needs a home, away, and goalkeeper shirt`);
    names.add(key);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

export function upsertTeam(team: ClubTeam): ClubTeam[] {
  const teams = loadTeams().filter((item) => item.id !== team.id);
  teams.push({ ...team, name: team.name.trim() });
  saveTeams(teams);
  return teams;
}

export function deleteTeam(id: string): ClubTeam[] {
  const teams = loadTeams().filter((item) => item.id !== id);
  const next = teams.length ? teams : testClubs();
  saveTeams(next);
  return next;
}

export function setKit(team: ClubTeam, slot: KitSlot, shirt: ShirtDesign): ClubTeam {
  return { ...team, kits: { ...team.kits, [slot]: shirt } };
}
