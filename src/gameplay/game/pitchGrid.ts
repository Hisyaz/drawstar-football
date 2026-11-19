/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerPlaystyle, PlayerRole, PrimaryPosition, SubPosition } from '../types';

export interface PitchGridZone {
  subPos: SubPosition;
  primary: PrimaryPosition;
  pesLabel: string;
  name: string;
  role: PlayerRole;
  icon: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  description: string;
}

export interface OverlapCorridor {
  id: string;
  title: string;
  roles: SubPosition[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const GOALKEEPER_ZONE = {
  "minX": 0.38,
  "maxX": 0.62,
  "minY": 0.88,
  "maxY": 0.94
};

export const PITCH_GRID_ZONES: PitchGridZone[] = [
  {
    "subPos": "LW",
    "primary": "ATT",
    "pesLabel": "LWF",
    "name": "Left Winger",
    "role": "LM",
    "icon": "⚡",
    "minX": 0.08,
    "maxX": 0.28,
    "minY": 0.06,
    "maxY": 0.36,
    "description": "Flank speedster delivering crosses & diagonal goal cuts"
  },
  {
    "subPos": "RW",
    "primary": "ATT",
    "pesLabel": "RWF",
    "name": "Right Winger",
    "role": "RM",
    "icon": "⚡",
    "minX": 0.72,
    "maxX": 0.92,
    "minY": 0.06,
    "maxY": 0.36,
    "description": "Flank speedster delivering crosses & cutting into the box"
  },
  {
    "subPos": "ST",
    "primary": "ATT",
    "pesLabel": "CF",
    "name": "Center Forward",
    "role": "ST1",
    "icon": "⚽",
    "minX": 0.32,
    "maxX": 0.68,
    "minY": 0.06,
    "maxY": 0.22,
    "description": "Primary penalty-box spearhead & clinical finisher"
  },
  {
    "subPos": "SS",
    "primary": "ATT",
    "pesLabel": "SS",
    "name": "Second Striker",
    "role": "ST2",
    "icon": "🎯",
    "minX": 0.26,
    "maxX": 0.74,
    "minY": 0.16,
    "maxY": 0.36,
    "description": "Shadow forward roaming behind lines (inherits CAM styles)"
  },
  {
    "subPos": "LM",
    "primary": "MID",
    "pesLabel": "LMF",
    "name": "Left Midfielder",
    "role": "LM",
    "icon": "🏃",
    "minX": 0.08,
    "maxX": 0.25,
    "minY": 0.36,
    "maxY": 0.68,
    "description": "Wide midfield operator supporting transitions & wing width"
  },
  {
    "subPos": "RM",
    "primary": "MID",
    "pesLabel": "RMF",
    "name": "Right Midfielder",
    "role": "RM",
    "icon": "🏃",
    "minX": 0.75,
    "maxX": 0.92,
    "minY": 0.36,
    "maxY": 0.68,
    "description": "Wide midfield operator supporting transitions & wing width"
  },
  {
    "subPos": "CAM",
    "primary": "MID",
    "pesLabel": "AMF",
    "name": "Attacking Midfielder",
    "role": "CM2",
    "icon": "🎩",
    "minX": 0.25,
    "maxX": 0.75,
    "minY": 0.36,
    "maxY": 0.52,
    "description": "Central playmaker creating through-balls in the final third"
  },
  {
    "subPos": "CM",
    "primary": "MID",
    "pesLabel": "CMF",
    "name": "Central Midfielder",
    "role": "CM1",
    "icon": "⚙️",
    "minX": 0.24,
    "maxX": 0.76,
    "minY": 0.4,
    "maxY": 0.64,
    "description": "Box-to-box engine distributing play & controlling tempo"
  },
  {
    "subPos": "CDM",
    "primary": "MID",
    "pesLabel": "DMF",
    "name": "Defensive Midfielder",
    "role": "CM1",
    "icon": "🛡️",
    "minX": 0.25,
    "maxX": 0.75,
    "minY": 0.52,
    "maxY": 0.68,
    "description": "Deep defensive shield screening backline & recycling balls"
  },
  {
    "subPos": "LWB",
    "primary": "MID",
    "pesLabel": "LWB",
    "name": "Left Wing-Back",
    "role": "LB",
    "icon": "⚡",
    "minX": 0.08,
    "maxX": 0.25,
    "minY": 0.52,
    "maxY": 0.68,
    "description": "Flank runner in lower midfield (employs fullback playstyles)"
  },
  {
    "subPos": "RWB",
    "primary": "MID",
    "pesLabel": "RWB",
    "name": "Right Wing-Back",
    "role": "RB",
    "icon": "⚡",
    "minX": 0.75,
    "maxX": 0.92,
    "minY": 0.52,
    "maxY": 0.68,
    "description": "Flank runner in lower midfield (employs fullback playstyles)"
  },
  {
    "subPos": "LB",
    "primary": "DEF",
    "pesLabel": "LB",
    "name": "Left Back",
    "role": "LB",
    "icon": "🛡️",
    "minX": 0.08,
    "maxX": 0.28,
    "minY": 0.68,
    "maxY": 0.92,
    "description": "Defensive flank stopper tracking opposition wingers"
  },
  {
    "subPos": "RB",
    "primary": "DEF",
    "pesLabel": "RB",
    "name": "Right Back",
    "role": "RB",
    "icon": "🛡️",
    "minX": 0.72,
    "maxX": 0.92,
    "minY": 0.68,
    "maxY": 0.92,
    "description": "Defensive flank stopper tracking opposition wingers"
  },
  {
    "subPos": "CB",
    "primary": "DEF",
    "pesLabel": "CB",
    "name": "Center Back",
    "role": "CB1",
    "icon": "🧱",
    "minX": 0.24,
    "maxX": 0.76,
    "minY": 0.68,
    "maxY": 0.9,
    "description": "Central defensive wall executing tackles & aerial clearances"
  },
  {
    "subPos": "LIB",
    "primary": "DEF",
    "pesLabel": "LIB",
    "name": "Libero / Sweeper",
    "role": "CB2",
    "icon": "👑",
    "minX": 0.36,
    "maxX": 0.64,
    "minY": 0.7,
    "maxY": 0.9,
    "description": "Deep sweeping distributor (employs CDM & CB playstyles)"
  }
];

export const OVERLAP_CORRIDORS: OverlapCorridor[] = [
  {
    "id": "attack_pocket",
    "title": "Attack Pocket (ST vs. SS)",
    "roles": [
      "ST",
      "SS"
    ],
    "minX": 0.32,
    "maxX": 0.68,
    "minY": 0.16,
    "maxY": 0.22
  },
  {
    "id": "upper_midfield",
    "title": "Upper Central Midfield (CM vs. CAM)",
    "roles": [
      "CAM",
      "CM"
    ],
    "minX": 0.25,
    "maxX": 0.75,
    "minY": 0.4,
    "maxY": 0.52
  },
  {
    "id": "lower_midfield",
    "title": "Lower Central Midfield (CM vs. CDM)",
    "roles": [
      "CM",
      "CDM"
    ],
    "minX": 0.25,
    "maxX": 0.75,
    "minY": 0.52,
    "maxY": 0.64
  },
  {
    "id": "lower_flank_left",
    "title": "Left Flank Corridor (LM vs. LWB)",
    "roles": [
      "LM",
      "LWB"
    ],
    "minX": 0.08,
    "maxX": 0.25,
    "minY": 0.52,
    "maxY": 0.68
  },
  {
    "id": "lower_flank_right",
    "title": "Right Flank Corridor (RM vs. RWB)",
    "roles": [
      "RM",
      "RWB"
    ],
    "minX": 0.75,
    "maxX": 0.92,
    "minY": 0.52,
    "maxY": 0.68
  },
  {
    "id": "central_defense",
    "title": "Central Defensive Spine (CB vs. LIB)",
    "roles": [
      "CB",
      "LIB"
    ],
    "minX": 0.36,
    "maxX": 0.64,
    "minY": 0.7,
    "maxY": 0.9
  }
];

export function clampToOutfieldPitch(x: number, y: number): { x: number; y: number } {
  const clampedX = Math.max(0.08, Math.min(0.92, x));
  let clampedY = Math.max(0.06, Math.min(0.94, y));
  if (
    clampedX >= GOALKEEPER_ZONE.minX &&
    clampedX <= GOALKEEPER_ZONE.maxX &&
    clampedY >= GOALKEEPER_ZONE.minY &&
    clampedY <= GOALKEEPER_ZONE.maxY
  ) {
    clampedY = GOALKEEPER_ZONE.minY - 0.02;
  }
  return { x: clampedX, y: clampedY };
}

export function resolvePositionFromPitchGrid(
  x: number,
  y: number,
  preferredSubPos?: SubPosition
): { candidates: PitchGridZone[]; isOverlap: boolean; primaryMatch: PitchGridZone } {
  const clamped = clampToOutfieldPitch(x, y);
  const cx = clamped.x;
  const cy = clamped.y;

  for (const corridor of OVERLAP_CORRIDORS) {
    if (cx >= corridor.minX && cx <= corridor.maxX && cy >= corridor.minY && cy <= corridor.maxY) {
      const candidates = corridor.roles
        .map((r) => PITCH_GRID_ZONES.find((z) => z.subPos === r))
        .filter((z): z is PitchGridZone => !!z);
      if (candidates.length > 1) {
        const match = candidates.find((z) => z.subPos === preferredSubPos);
        return { candidates, isOverlap: true, primaryMatch: match || candidates[0] };
      }
    }
  }

  const hits = PITCH_GRID_ZONES.filter(
    (z) => cx >= z.minX && cx <= z.maxX && cy >= z.minY && cy <= z.maxY
  );
  if (hits.length > 1) {
    const match = hits.find((z) => z.subPos === preferredSubPos);
    return { candidates: hits, isOverlap: true, primaryMatch: match || hits[0] };
  }
  if (hits.length === 1) {
    return { candidates: hits, isOverlap: false, primaryMatch: hits[0] };
  }

  let bestDist = Infinity;
  let bestZone = PITCH_GRID_ZONES[0];
  for (const z of PITCH_GRID_ZONES) {
    const dx = Math.max(0, Math.max(z.minX - cx, cx - z.maxX));
    const dy = Math.max(0, Math.max(z.minY - cy, cy - z.maxY));
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      bestZone = z;
    }
  }
  return { candidates: [bestZone], isOverlap: false, primaryMatch: bestZone };
}

export function resolveLegacyRoleFromSubPos(
  subPos: SubPosition,
  x = 0.5
): { role: PlayerRole; pesLabel: string } {
  if (subPos === 'GK') return { role: 'GK', pesLabel: 'GK' };
  const zone = PITCH_GRID_ZONES.find((z) => z.subPos === subPos);
  if (!zone) return { role: 'CM1', pesLabel: 'CMF' };
  let role = zone.role;
  if (subPos === 'CB') role = x < 0.5 ? 'CB1' : 'CB2';
  else if (subPos === 'CM') role = x < 0.5 ? 'CM1' : 'CM2';
  return { role, pesLabel: zone.pesLabel };
}

export const ALLOWED_PLAYSTYLES_BY_SUBPOS: Record<SubPosition, PlayerPlaystyle[]> = {
  "ST": [
    "poacher",
    "target",
    "complete",
    "finisher",
    "decoy"
  ],
  "LW": [
    "traditional",
    "inverted",
    "prolific",
    "pressing"
  ],
  "RW": [
    "traditional",
    "inverted",
    "prolific",
    "pressing"
  ],
  "SS": [
    "creator",
    "shadow",
    "classic_n10",
    "engine",
    "finisher",
    "complete",
    "poacher",
    "target",
    "decoy"
  ],
  "CAM": [
    "creator",
    "shadow",
    "classic_n10",
    "engine"
  ],
  "CM": [
    "box_to_box",
    "maestro",
    "runner"
  ],
  "CDM": [
    "enforcer",
    "anchor",
    "regista"
  ],
  "LM": [
    "traditional",
    "inverted",
    "prolific",
    "pressing",
    "box_to_box",
    "maestro",
    "runner"
  ],
  "RM": [
    "traditional",
    "inverted",
    "prolific",
    "pressing",
    "box_to_box",
    "maestro",
    "runner"
  ],
  "LWB": [
    "attacker_fb",
    "inverted_fb",
    "balanced_fb",
    "defensive"
  ],
  "RWB": [
    "attacker_fb",
    "inverted_fb",
    "balanced_fb",
    "defensive"
  ],
  "LB": [
    "defensive",
    "inverted_fb",
    "attacker_fb",
    "balanced_fb"
  ],
  "RB": [
    "defensive",
    "inverted_fb",
    "attacker_fb",
    "balanced_fb"
  ],
  "CB": [
    "destroyer",
    "distributor",
    "playmaker",
    "stopper"
  ],
  "LIB": [
    "enforcer",
    "anchor",
    "regista",
    "destroyer",
    "distributor",
    "playmaker",
    "stopper",
    "sweeper_cb"
  ],
  "GK": [
    "balanced_gk",
    "sweeper",
    "wall"
  ]
};

export function isPlaystyleAllowedForSubPos(
  playstyle: PlayerPlaystyle,
  subPos: SubPosition
): boolean {
  if (playstyle === 'basic') return true;
  const allowed = ALLOWED_PLAYSTYLES_BY_SUBPOS[subPos];
  return !!allowed && allowed.includes(playstyle);
}

export function resolveEffectivePlaystyle(
  playstyle: PlayerPlaystyle | undefined,
  subPos: SubPosition
): PlayerPlaystyle {
  if (!playstyle || playstyle === 'basic') {
    const allowed = ALLOWED_PLAYSTYLES_BY_SUBPOS[subPos];
    return allowed && allowed.length > 0 ? allowed[0] : 'basic';
  }
  return isPlaystyleAllowedForSubPos(playstyle, subPos) ? playstyle : 'basic';
}
