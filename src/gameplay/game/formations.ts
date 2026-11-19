/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DetailedTactics,
  FormationName,
  StreetFormationName,
  Player,
  PlayerRole,
  SubPosition,
  TacticalPlaystyle,
  TeamSide,
} from '../types';
import { applyPositionalHierarchyToPlayer } from './playstyles';

export interface FormationSlotPos {
  x: number;
  y: number;
  label?: string;
}

export type FormationCoordinates = Record<PlayerRole, FormationSlotPos>;

export interface StreetFormationSlotSpec {
  role: PlayerRole;
  streetRole: 'GK' | 'DEF1' | 'DEF2' | 'MID1' | 'MID2' | 'ATT1' | 'ATT2';
  subPosition: Extract<SubPosition, 'GK' | 'CB' | 'CM' | 'ST'>;
  x: number;
  y: number;
}

export const STREET_1_2_2_2_SLOTS: StreetFormationSlotSpec[] = [
  { role: 'GK', streetRole: 'GK', subPosition: 'GK', x: 0.5, y: 0.94 },
  { role: 'CB1', streetRole: 'DEF1', subPosition: 'CB', x: 0.3, y: 0.78 },
  { role: 'CB2', streetRole: 'DEF2', subPosition: 'CB', x: 0.7, y: 0.78 },
  { role: 'CM1', streetRole: 'MID1', subPosition: 'CM', x: 0.3, y: 0.62 },
  { role: 'CM2', streetRole: 'MID2', subPosition: 'CM', x: 0.7, y: 0.62 },
  { role: 'ST1', streetRole: 'ATT1', subPosition: 'ST', x: 0.34, y: 0.48 },
  { role: 'ST2', streetRole: 'ATT2', subPosition: 'ST', x: 0.66, y: 0.48 },
];

export const STREET_HOME_FORMATION_1_2_2_2: Partial<Record<PlayerRole, FormationSlotPos>> =
  STREET_1_2_2_2_SLOTS.reduce((acc, slot) => {
    acc[slot.role] = { x: slot.x, y: slot.y, label: slot.streetRole };
    return acc;
  }, {} as Partial<Record<PlayerRole, FormationSlotPos>>);

export function getStreetFormationPositions(
  attacksUp: boolean = true
): Partial<Record<PlayerRole, FormationSlotPos>> {
  if (attacksUp) return STREET_HOME_FORMATION_1_2_2_2;
  const mirrored: Partial<Record<PlayerRole, FormationSlotPos>> = {};
  for (const slot of STREET_1_2_2_2_SLOTS) {
    mirrored[slot.role] = {
      x: slot.x,
      y: 1 - slot.y,
      label: slot.streetRole,
    };
  }
  return mirrored;
}

export const HOME_FORMATIONS: Record<FormationName, Record<PlayerRole, FormationSlotPos>> = {
  "4-4-2": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.16,
      "y": 0.82,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.84,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.84,
      "label": "CB"
    },
    "RB": {
      "x": 0.84,
      "y": 0.82,
      "label": "RB"
    },
    "LM": {
      "x": 0.15,
      "y": 0.62,
      "label": "LM"
    },
    "CM1": {
      "x": 0.38,
      "y": 0.64,
      "label": "CM"
    },
    "CM2": {
      "x": 0.62,
      "y": 0.64,
      "label": "CM"
    },
    "RM": {
      "x": 0.85,
      "y": 0.62,
      "label": "RM"
    },
    "ST1": {
      "x": 0.38,
      "y": 0.5,
      "label": "ST"
    },
    "ST2": {
      "x": 0.62,
      "y": 0.5,
      "label": "ST"
    }
  },
  "4-3-3": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.16,
      "y": 0.82,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.84,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.84,
      "label": "CB"
    },
    "RB": {
      "x": 0.84,
      "y": 0.82,
      "label": "RB"
    },
    "CM1": {
      "x": 0.5,
      "y": 0.7,
      "label": "CDM"
    },
    "CM2": {
      "x": 0.34,
      "y": 0.6,
      "label": "LCM"
    },
    "RM": {
      "x": 0.66,
      "y": 0.6,
      "label": "RCM"
    },
    "LM": {
      "x": 0.16,
      "y": 0.48,
      "label": "LW"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.46,
      "label": "ST"
    },
    "ST2": {
      "x": 0.84,
      "y": 0.48,
      "label": "RW"
    }
  },
  "4-2-3-1": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.16,
      "y": 0.82,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.84,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.84,
      "label": "CB"
    },
    "RB": {
      "x": 0.84,
      "y": 0.82,
      "label": "RB"
    },
    "CM1": {
      "x": 0.38,
      "y": 0.71,
      "label": "CDM"
    },
    "CM2": {
      "x": 0.62,
      "y": 0.71,
      "label": "CDM"
    },
    "LM": {
      "x": 0.18,
      "y": 0.55,
      "label": "LAM"
    },
    "RM": {
      "x": 0.82,
      "y": 0.55,
      "label": "RAM"
    },
    "ST2": {
      "x": 0.5,
      "y": 0.56,
      "label": "CAM"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.46,
      "label": "ST"
    }
  },
  "4-5-1": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.16,
      "y": 0.82,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.84,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.84,
      "label": "CB"
    },
    "RB": {
      "x": 0.84,
      "y": 0.82,
      "label": "RB"
    },
    "LM": {
      "x": 0.14,
      "y": 0.62,
      "label": "LM"
    },
    "CM1": {
      "x": 0.32,
      "y": 0.64,
      "label": "CM"
    },
    "CM2": {
      "x": 0.5,
      "y": 0.68,
      "label": "CDM"
    },
    "RM": {
      "x": 0.68,
      "y": 0.64,
      "label": "CM"
    },
    "ST2": {
      "x": 0.86,
      "y": 0.62,
      "label": "RM"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.48,
      "label": "ST"
    }
  },
  "3-5-2": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.26,
      "y": 0.84,
      "label": "LCB"
    },
    "CB1": {
      "x": 0.5,
      "y": 0.85,
      "label": "CB"
    },
    "CB2": {
      "x": 0.74,
      "y": 0.84,
      "label": "RCB"
    },
    "RB": {
      "x": 0.12,
      "y": 0.62,
      "label": "LWB"
    },
    "LM": {
      "x": 0.88,
      "y": 0.62,
      "label": "RWB"
    },
    "CM1": {
      "x": 0.34,
      "y": 0.66,
      "label": "CM"
    },
    "CM2": {
      "x": 0.5,
      "y": 0.72,
      "label": "CDM"
    },
    "RM": {
      "x": 0.66,
      "y": 0.66,
      "label": "CM"
    },
    "ST1": {
      "x": 0.38,
      "y": 0.48,
      "label": "ST"
    },
    "ST2": {
      "x": 0.62,
      "y": 0.48,
      "label": "ST"
    }
  },
  "3-4-3": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.25,
      "y": 0.84,
      "label": "LCB"
    },
    "CB1": {
      "x": 0.5,
      "y": 0.85,
      "label": "CB"
    },
    "CB2": {
      "x": 0.75,
      "y": 0.84,
      "label": "RCB"
    },
    "RB": {
      "x": 0.15,
      "y": 0.63,
      "label": "LM"
    },
    "CM1": {
      "x": 0.38,
      "y": 0.65,
      "label": "CM"
    },
    "CM2": {
      "x": 0.62,
      "y": 0.65,
      "label": "CM"
    },
    "RM": {
      "x": 0.85,
      "y": 0.63,
      "label": "RM"
    },
    "LM": {
      "x": 0.18,
      "y": 0.48,
      "label": "LW"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.46,
      "label": "ST"
    },
    "ST2": {
      "x": 0.82,
      "y": 0.48,
      "label": "RW"
    }
  },
  "3-4-3-diamond": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.25,
      "y": 0.84,
      "label": "LCB"
    },
    "CB1": {
      "x": 0.5,
      "y": 0.85,
      "label": "CB"
    },
    "CB2": {
      "x": 0.75,
      "y": 0.84,
      "label": "RCB"
    },
    "CM1": {
      "x": 0.5,
      "y": 0.72,
      "label": "CDM"
    },
    "RB": {
      "x": 0.14,
      "y": 0.61,
      "label": "LM"
    },
    "RM": {
      "x": 0.86,
      "y": 0.61,
      "label": "RM"
    },
    "CM2": {
      "x": 0.5,
      "y": 0.56,
      "label": "CAM"
    },
    "LM": {
      "x": 0.18,
      "y": 0.46,
      "label": "LW"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.44,
      "label": "ST"
    },
    "ST2": {
      "x": 0.82,
      "y": 0.46,
      "label": "RW"
    }
  },
  "5-3-2": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.12,
      "y": 0.8,
      "label": "LWB"
    },
    "CB1": {
      "x": 0.31,
      "y": 0.85,
      "label": "LCB"
    },
    "CB2": {
      "x": 0.5,
      "y": 0.86,
      "label": "CB"
    },
    "RB": {
      "x": 0.69,
      "y": 0.85,
      "label": "RCB"
    },
    "LM": {
      "x": 0.88,
      "y": 0.8,
      "label": "RWB"
    },
    "CM1": {
      "x": 0.32,
      "y": 0.65,
      "label": "CM"
    },
    "CM2": {
      "x": 0.5,
      "y": 0.68,
      "label": "CDM"
    },
    "RM": {
      "x": 0.68,
      "y": 0.65,
      "label": "CM"
    },
    "ST1": {
      "x": 0.38,
      "y": 0.49,
      "label": "ST"
    },
    "ST2": {
      "x": 0.62,
      "y": 0.49,
      "label": "ST"
    }
  },
  "5-4-1": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.12,
      "y": 0.8,
      "label": "LWB"
    },
    "CB1": {
      "x": 0.31,
      "y": 0.85,
      "label": "LCB"
    },
    "CB2": {
      "x": 0.5,
      "y": 0.86,
      "label": "CB"
    },
    "RB": {
      "x": 0.69,
      "y": 0.85,
      "label": "RCB"
    },
    "LM": {
      "x": 0.88,
      "y": 0.8,
      "label": "RWB"
    },
    "CM1": {
      "x": 0.38,
      "y": 0.65,
      "label": "CM"
    },
    "CM2": {
      "x": 0.62,
      "y": 0.65,
      "label": "CM"
    },
    "RM": {
      "x": 0.16,
      "y": 0.58,
      "label": "LM"
    },
    "ST2": {
      "x": 0.84,
      "y": 0.58,
      "label": "RM"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.47,
      "label": "ST"
    }
  },
  "custom": {
    "GK": {
      "x": 0.5,
      "y": 0.96,
      "label": "GK"
    },
    "LB": {
      "x": 0.16,
      "y": 0.82,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.84,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.84,
      "label": "CB"
    },
    "RB": {
      "x": 0.84,
      "y": 0.82,
      "label": "RB"
    },
    "CM1": {
      "x": 0.5,
      "y": 0.7,
      "label": "CDM"
    },
    "CM2": {
      "x": 0.34,
      "y": 0.6,
      "label": "LCM"
    },
    "RM": {
      "x": 0.66,
      "y": 0.6,
      "label": "RCM"
    },
    "LM": {
      "x": 0.16,
      "y": 0.48,
      "label": "LW"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.46,
      "label": "ST"
    },
    "ST2": {
      "x": 0.84,
      "y": 0.48,
      "label": "RW"
    }
  }
};

export const TACTICAL_BOARD_FORMATIONS: Record<FormationName, Record<PlayerRole, { x: number; y: number; label: string }>> = {
  "4-4-2": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.14,
      "y": 0.78,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.81,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.81,
      "label": "CB"
    },
    "RB": {
      "x": 0.86,
      "y": 0.78,
      "label": "RB"
    },
    "LM": {
      "x": 0.14,
      "y": 0.44,
      "label": "LMF"
    },
    "CM1": {
      "x": 0.38,
      "y": 0.48,
      "label": "CMF"
    },
    "CM2": {
      "x": 0.62,
      "y": 0.48,
      "label": "CMF"
    },
    "RM": {
      "x": 0.86,
      "y": 0.44,
      "label": "RMF"
    },
    "ST1": {
      "x": 0.35,
      "y": 0.11,
      "label": "CF"
    },
    "ST2": {
      "x": 0.65,
      "y": 0.11,
      "label": "CF"
    }
  },
  "4-3-3": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.14,
      "y": 0.78,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.81,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.81,
      "label": "CB"
    },
    "RB": {
      "x": 0.86,
      "y": 0.78,
      "label": "RB"
    },
    "CM1": {
      "x": 0.5,
      "y": 0.64,
      "label": "DMF"
    },
    "CM2": {
      "x": 0.33,
      "y": 0.46,
      "label": "CMF"
    },
    "RM": {
      "x": 0.67,
      "y": 0.46,
      "label": "CMF"
    },
    "LM": {
      "x": 0.16,
      "y": 0.18,
      "label": "LWF"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.1,
      "label": "CF"
    },
    "ST2": {
      "x": 0.84,
      "y": 0.18,
      "label": "RWF"
    }
  },
  "4-2-3-1": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.14,
      "y": 0.78,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.81,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.81,
      "label": "CB"
    },
    "RB": {
      "x": 0.86,
      "y": 0.78,
      "label": "RB"
    },
    "CM1": {
      "x": 0.36,
      "y": 0.64,
      "label": "DMF"
    },
    "CM2": {
      "x": 0.64,
      "y": 0.64,
      "label": "DMF"
    },
    "LM": {
      "x": 0.16,
      "y": 0.3,
      "label": "LMF"
    },
    "ST2": {
      "x": 0.5,
      "y": 0.28,
      "label": "AMF"
    },
    "RM": {
      "x": 0.84,
      "y": 0.3,
      "label": "RMF"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.1,
      "label": "CF"
    }
  },
  "4-5-1": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.14,
      "y": 0.78,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.81,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.81,
      "label": "CB"
    },
    "RB": {
      "x": 0.86,
      "y": 0.78,
      "label": "RB"
    },
    "CM2": {
      "x": 0.5,
      "y": 0.64,
      "label": "DMF"
    },
    "CM1": {
      "x": 0.33,
      "y": 0.48,
      "label": "CMF"
    },
    "RM": {
      "x": 0.67,
      "y": 0.48,
      "label": "CMF"
    },
    "LM": {
      "x": 0.15,
      "y": 0.28,
      "label": "LMF"
    },
    "ST2": {
      "x": 0.85,
      "y": 0.28,
      "label": "RMF"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.1,
      "label": "CF"
    }
  },
  "3-5-2": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.24,
      "y": 0.8,
      "label": "CB"
    },
    "CB1": {
      "x": 0.5,
      "y": 0.82,
      "label": "CB"
    },
    "CB2": {
      "x": 0.76,
      "y": 0.8,
      "label": "CB"
    },
    "CM2": {
      "x": 0.5,
      "y": 0.64,
      "label": "DMF"
    },
    "RB": {
      "x": 0.12,
      "y": 0.46,
      "label": "LWB"
    },
    "LM": {
      "x": 0.88,
      "y": 0.46,
      "label": "RWB"
    },
    "CM1": {
      "x": 0.34,
      "y": 0.44,
      "label": "CMF"
    },
    "RM": {
      "x": 0.66,
      "y": 0.44,
      "label": "CMF"
    },
    "ST1": {
      "x": 0.36,
      "y": 0.11,
      "label": "CF"
    },
    "ST2": {
      "x": 0.64,
      "y": 0.11,
      "label": "CF"
    }
  },
  "3-4-3": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.24,
      "y": 0.8,
      "label": "CB"
    },
    "CB1": {
      "x": 0.5,
      "y": 0.82,
      "label": "CB"
    },
    "CB2": {
      "x": 0.76,
      "y": 0.8,
      "label": "CB"
    },
    "RB": {
      "x": 0.14,
      "y": 0.48,
      "label": "LMF"
    },
    "CM1": {
      "x": 0.38,
      "y": 0.5,
      "label": "CMF"
    },
    "CM2": {
      "x": 0.62,
      "y": 0.5,
      "label": "CMF"
    },
    "RM": {
      "x": 0.86,
      "y": 0.48,
      "label": "RMF"
    },
    "LM": {
      "x": 0.16,
      "y": 0.18,
      "label": "LWF"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.1,
      "label": "CF"
    },
    "ST2": {
      "x": 0.84,
      "y": 0.18,
      "label": "RWF"
    }
  },
  "3-4-3-diamond": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.24,
      "y": 0.8,
      "label": "CB"
    },
    "CB1": {
      "x": 0.5,
      "y": 0.82,
      "label": "CB"
    },
    "CB2": {
      "x": 0.76,
      "y": 0.8,
      "label": "CB"
    },
    "CM1": {
      "x": 0.5,
      "y": 0.64,
      "label": "DMF"
    },
    "RB": {
      "x": 0.14,
      "y": 0.46,
      "label": "LMF"
    },
    "RM": {
      "x": 0.86,
      "y": 0.46,
      "label": "RMF"
    },
    "CM2": {
      "x": 0.5,
      "y": 0.3,
      "label": "AMF"
    },
    "LM": {
      "x": 0.16,
      "y": 0.17,
      "label": "LWF"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.09,
      "label": "CF"
    },
    "ST2": {
      "x": 0.84,
      "y": 0.17,
      "label": "RWF"
    }
  },
  "5-3-2": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.12,
      "y": 0.74,
      "label": "LWB"
    },
    "CB1": {
      "x": 0.31,
      "y": 0.8,
      "label": "CB"
    },
    "CB2": {
      "x": 0.5,
      "y": 0.82,
      "label": "CB"
    },
    "RB": {
      "x": 0.69,
      "y": 0.8,
      "label": "CB"
    },
    "LM": {
      "x": 0.88,
      "y": 0.74,
      "label": "RWB"
    },
    "CM2": {
      "x": 0.5,
      "y": 0.58,
      "label": "DMF"
    },
    "CM1": {
      "x": 0.33,
      "y": 0.42,
      "label": "CMF"
    },
    "RM": {
      "x": 0.67,
      "y": 0.42,
      "label": "CMF"
    },
    "ST1": {
      "x": 0.36,
      "y": 0.11,
      "label": "CF"
    },
    "ST2": {
      "x": 0.64,
      "y": 0.11,
      "label": "CF"
    }
  },
  "5-4-1": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.12,
      "y": 0.74,
      "label": "LWB"
    },
    "CB1": {
      "x": 0.31,
      "y": 0.8,
      "label": "CB"
    },
    "CB2": {
      "x": 0.5,
      "y": 0.82,
      "label": "CB"
    },
    "RB": {
      "x": 0.69,
      "y": 0.8,
      "label": "CB"
    },
    "LM": {
      "x": 0.88,
      "y": 0.74,
      "label": "RWB"
    },
    "CM1": {
      "x": 0.37,
      "y": 0.52,
      "label": "CMF"
    },
    "CM2": {
      "x": 0.63,
      "y": 0.52,
      "label": "CMF"
    },
    "RM": {
      "x": 0.16,
      "y": 0.3,
      "label": "LMF"
    },
    "ST2": {
      "x": 0.84,
      "y": 0.3,
      "label": "RMF"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.1,
      "label": "CF"
    }
  },
  "custom": {
    "GK": {
      "x": 0.5,
      "y": 0.93,
      "label": "GK"
    },
    "LB": {
      "x": 0.14,
      "y": 0.78,
      "label": "LB"
    },
    "CB1": {
      "x": 0.38,
      "y": 0.81,
      "label": "CB"
    },
    "CB2": {
      "x": 0.62,
      "y": 0.81,
      "label": "CB"
    },
    "RB": {
      "x": 0.86,
      "y": 0.78,
      "label": "RB"
    },
    "CM1": {
      "x": 0.5,
      "y": 0.64,
      "label": "DMF"
    },
    "CM2": {
      "x": 0.33,
      "y": 0.46,
      "label": "CMF"
    },
    "RM": {
      "x": 0.67,
      "y": 0.46,
      "label": "CMF"
    },
    "LM": {
      "x": 0.16,
      "y": 0.18,
      "label": "LWF"
    },
    "ST1": {
      "x": 0.5,
      "y": 0.1,
      "label": "CF"
    },
    "ST2": {
      "x": 0.84,
      "y": 0.18,
      "label": "RWF"
    }
  }
};

export function getAwayFormationPositions(formation: FormationName): Record<PlayerRole, { x: number; y: number }> {
  const home = HOME_FORMATIONS[formation] || HOME_FORMATIONS['4-3-3'];
  const away = {} as Record<PlayerRole, { x: number; y: number }>;
  for (const role of Object.keys(home) as PlayerRole[]) {
    const pos = home[role];
    away[role] = { x: pos.x, y: 1 - pos.y };
  }
  return away;
}

export const FORMATION_LIST: Array<{ id: FormationName; name: string; tag: string }> = [
  {
    "id": "4-4-2",
    "name": "4-4-2 Classic",
    "tag": "Balanced"
  },
  {
    "id": "4-3-3",
    "name": "4-3-3 Attack",
    "tag": "Wide Flanks"
  },
  {
    "id": "4-2-3-1",
    "name": "4-2-3-1 Modern",
    "tag": "Double Pivot"
  },
  {
    "id": "4-5-1",
    "name": "4-5-1 Solid",
    "tag": "Midfield Lock"
  },
  {
    "id": "3-5-2",
    "name": "3-5-2 Wingbacks",
    "tag": "Wide & Strikers"
  },
  {
    "id": "3-4-3",
    "name": "3-4-3 Frontline",
    "tag": "All-Out Offense"
  },
  {
    "id": "3-4-3-diamond",
    "name": "3-4-3 Diamond",
    "tag": "CAM & CDM Hub"
  },
  {
    "id": "5-3-2",
    "name": "5-3-2 Counter",
    "tag": "Steel Defense"
  },
  {
    "id": "5-4-1",
    "name": "5-4-1 Fort",
    "tag": "Ultra Low Block"
  },
  {
    "id": "custom",
    "name": "Custom Formation",
    "tag": "Freeform Board"
  }
];

export function isDefenderLabel(label: string): boolean {
  const s = (label || '').toUpperCase();
  return (
    ['CB', 'CB1', 'CB2', 'LB', 'RB', 'LWB', 'RWB', 'LIB', 'LCB', 'RCB', 'SW'].includes(s) ||
    s.startsWith('CB') ||
    s.startsWith('LB') ||
    s.startsWith('RB')
  );
}

export function isMidfielderLabel(label: string): boolean {
  const s = (label || '').toUpperCase();
  return (
    ['CDM', 'CM', 'CM1', 'CM2', 'CAM', 'LM', 'RM', 'DMF', 'CMF', 'AMF', 'LMF', 'RMF', 'LAM', 'RAM', 'LCM', 'RCM'].includes(s) ||
    s.startsWith('CM') ||
    s.startsWith('DM') ||
    s.startsWith('AM')
  );
}

export function isAttackerLabel(label: string): boolean {
  const s = (label || '').toUpperCase();
  return (
    ['ST', 'ST1', 'ST2', 'SS', 'CF', 'LW', 'RW', 'LWF', 'RWF'].includes(s) ||
    s.startsWith('ST') ||
    s.startsWith('CF')
  );
}

export function validateFormationStructure(
  players: Array<{ role?: string; subPosition?: string; label?: string }>
): {
  isValid: boolean;
  gkCount: number;
  defCount: number;
  midCount: number;
  attCount: number;
  message: string;
} {
  let gkCount = 0;
  let defCount = 0;
  let midCount = 0;
  let attCount = 0;
  for (const p of players) {
    const label = (p.label || p.subPosition || p.role || '').toUpperCase();
    // The tactical slot role is authoritative when the card's natural sub-position
    // differs (e.g. the selected keeper has an outfield legacy position).
    if (label === 'GK' || (p.role || '').toUpperCase() === 'GK' || (p.subPosition || '').toUpperCase() === 'GK') gkCount++;
    else if (isDefenderLabel(label)) defCount++;
    else if (isMidfielderLabel(label)) midCount++;
    else if (isAttackerLabel(label)) attCount++;
  }
  const issues: string[] = [];
  if (gkCount !== 1) issues.push(gkCount === 0 ? '1 Goalkeeper' : 'Exactly 1 Goalkeeper');
  if (defCount < 2) issues.push(`at least 2 Defenders (currently: ${defCount})`);
  if (midCount < 2) issues.push(`at least 2 Midfielders (currently: ${midCount})`);
  if (attCount < 1) issues.push(`at least 1 Attacker (currently: ${attCount})`);
  const isValid = issues.length === 0;
  const message = isValid
    ? 'Lineup is valid'
    : `⚠️ INVALID FORMATION: Lineup requires ${issues.join(', ')}!`;
  return { isValid, gkCount, defCount, midCount, attCount, message };
}

export const CANONICAL_PLAYSTYLES: TacticalPlaystyle[] = [
  "possession",
  "arteta_control",
  "long_ball",
  "catenaccio",
  "counterattack",
  "gegenpress",
  "futbol_champan",
  "jogobonito",
  "custom"
];

export interface TacticalPlaystyleMeta {
  id: TacticalPlaystyle;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
  tactics: {
    pressIntensity: number;
    defensiveLineDepth: number;
    horizontalCompactness: number;
    directness: number;
    tempo: number;
    foulingTendency: number;
  };
}

export const PLAYSTYLE_DEFINITIONS: Record<TacticalPlaystyle, TacticalPlaystyleMeta> = {
  "possession": {
    "id": "possession",
    "name": "Tiki-Taka",
    "subtitle": "Fluid Possession",
    "description": "Spanish positional mastery: short triangulations, high defensive line, suffocating 3-second counter-press on turnovers.",
    "accentColor": "#10b981",
    "tactics": {
      "pressIntensity": 0.85,
      "defensiveLineDepth": 0.78,
      "horizontalCompactness": 0.65,
      "directness": 0.15,
      "tempo": 0.48,
      "foulingTendency": 0.2
    }
  },
  "arteta_control": {
    "id": "arteta_control",
    "name": "Controlled Possession",
    "subtitle": "Arteta Positional Lock",
    "description": "Impenetrable 4-CB rest defense security, ultra-compact horizontal shape, patient buildup, and set-piece orientation.",
    "accentColor": "#38bdf8",
    "tactics": {
      "pressIntensity": 0.82,
      "defensiveLineDepth": 0.75,
      "horizontalCompactness": 0.92,
      "directness": 0.22,
      "tempo": 0.5,
      "foulingTendency": 0.35
    }
  },
  "conservative": {
    "id": "conservative",
    "name": "Controlled Possession",
    "subtitle": "Arteta Positional Lock",
    "description": "Impenetrable 4-CB rest defense security, ultra-compact horizontal shape, patient buildup, and set-piece orientation.",
    "accentColor": "#6366f1",
    "tactics": {
      "pressIntensity": 0.82,
      "defensiveLineDepth": 0.75,
      "horizontalCompactness": 0.92,
      "directness": 0.22,
      "tempo": 0.5,
      "foulingTendency": 0.35
    }
  },
  "long_ball": {
    "id": "long_ball",
    "name": "Direct Long Ball",
    "subtitle": "Burnley Two Towers",
    "description": "Direct route-one architecture: towering 500px+ aerial balls to target forwards (ST1/ST2) and surging midfield swarms winning second-ball knockdowns.",
    "accentColor": "#f59e0b",
    "tactics": {
      "pressIntensity": 0.65,
      "defensiveLineDepth": 0.35,
      "horizontalCompactness": 0.78,
      "directness": 0.96,
      "tempo": 0.78,
      "foulingTendency": 0.45
    }
  },
  "brexitball": {
    "id": "brexitball",
    "name": "Direct Long Ball",
    "subtitle": "Burnley Two Towers",
    "description": "Direct route-one architecture: towering 500px+ aerial balls to target forwards (ST1/ST2) and surging midfield swarms winning second-ball knockdowns.",
    "accentColor": "#ca8a04",
    "tactics": {
      "pressIntensity": 0.65,
      "defensiveLineDepth": 0.35,
      "horizontalCompactness": 0.78,
      "directness": 0.96,
      "tempo": 0.78,
      "foulingTendency": 0.45
    }
  },
  "catenaccio": {
    "id": "catenaccio",
    "name": "Catenaccio",
    "subtitle": "Tenacious Defensive Fort",
    "description": "Deep low compact block (18-22m), aggressive man-marking, bone-crunching physical duels, funneling attacks into congested wide areas.",
    "accentColor": "#3b82f6",
    "tactics": {
      "pressIntensity": 0.85,
      "defensiveLineDepth": 0.15,
      "horizontalCompactness": 0.9,
      "directness": 0.45,
      "tempo": 0.6,
      "foulingTendency": 0.7
    }
  },
  "counterattack": {
    "id": "counterattack",
    "name": "Counterattack",
    "subtitle": "Vibeball / Direct Breaks",
    "description": "Absorbs pressure then unleashes lightning 3-4 pass vertical breaks into central channels. Automatically switches to aerial cross bombardment when trailing late in game.",
    "accentColor": "#ec4899",
    "tactics": {
      "pressIntensity": 0.65,
      "defensiveLineDepth": 0.25,
      "horizontalCompactness": 0.8,
      "directness": 0.85,
      "tempo": 0.95,
      "foulingTendency": 0.35
    }
  },
  "gegenpress": {
    "id": "gegenpress",
    "name": "Gegenpress",
    "subtitle": "German High-Line Intensity",
    "description": "Relentless high-line pressing suffocating rivals near the halfway line with active offside traps. Triggers high-block turnovers followed by rapid forward combinations.",
    "accentColor": "#ef4444",
    "tactics": {
      "pressIntensity": 0.96,
      "defensiveLineDepth": 0.85,
      "horizontalCompactness": 0.75,
      "directness": 0.7,
      "tempo": 0.92,
      "foulingTendency": 0.55
    }
  },
  "futbol_champan": {
    "id": "futbol_champan",
    "name": "Fútbol Champán",
    "subtitle": "Argentine Flair & Grit",
    "description": "Fluid possession with high intensity. Free-roaming No. 10 dictates tempo (80%+ target bias). Uses tactical fouls to break counters & drops into a steel block when leading.",
    "accentColor": "#06b6d4",
    "tactics": {
      "pressIntensity": 0.75,
      "defensiveLineDepth": 0.55,
      "horizontalCompactness": 0.75,
      "directness": 0.5,
      "tempo": 0.7,
      "foulingTendency": 0.85
    }
  },
  "jogobonito": {
    "id": "jogobonito",
    "name": "Jogo Bonito",
    "subtitle": "Samba Relational Ginga",
    "description": "Brazilian flair with relational overloads: players congregate near the ball carrier to weave rapid tiki-taka triangles, sombreros, and acrobatic volleys.",
    "accentColor": "#eab308",
    "tactics": {
      "pressIntensity": 0.72,
      "defensiveLineDepth": 0.58,
      "horizontalCompactness": 0.7,
      "directness": 0.25,
      "tempo": 0.75,
      "foulingTendency": 0.25
    }
  },
  "custom": {
    "id": "custom",
    "name": "Custom Tactics",
    "subtitle": "User Defined Philosophy",
    "description": "Custom fine-tuned tactical balance across defensive line depth, marking style, offside trap, compactness, build-up creation, final third behavior, shape, and attacking runs.",
    "accentColor": "#f97316",
    "tactics": {
      "pressIntensity": 0.75,
      "defensiveLineDepth": 0.5,
      "horizontalCompactness": 0.75,
      "directness": 0.5,
      "tempo": 0.7,
      "foulingTendency": 0.4
    }
  }
};

export const TACTICAL_PRESETS_DETAILED: Record<TacticalPlaystyle, DetailedTactics> = {
  "possession": {
    "defensiveLine": 4,
    "defensiveStyle": "zonal",
    "offsideTrap": true,
    "compactness": 2,
    "creation": "short",
    "finalThird": "secure",
    "shape": "total_football",
    "runs": "moderate"
  },
  "arteta_control": {
    "defensiveLine": 4,
    "defensiveStyle": "zonal",
    "offsideTrap": true,
    "compactness": 4,
    "creation": "short",
    "finalThird": "secure",
    "shape": "strict",
    "runs": "moderate"
  },
  "gegenpress": {
    "defensiveLine": 5,
    "defensiveStyle": "marking",
    "offsideTrap": true,
    "compactness": 2,
    "creation": "mixed",
    "finalThird": "early_shoot",
    "shape": "total_football",
    "runs": "all_attack"
  },
  "catenaccio": {
    "defensiveLine": 1,
    "defensiveStyle": "marking",
    "offsideTrap": false,
    "compactness": 4,
    "creation": "long",
    "finalThird": "early_shoot",
    "shape": "strict",
    "runs": "all_defend"
  },
  "counterattack": {
    "defensiveLine": 2,
    "defensiveStyle": "mixed",
    "offsideTrap": false,
    "compactness": 3,
    "creation": "mixed",
    "finalThird": "crossing",
    "shape": "strict",
    "runs": "moderate"
  },
  "long_ball": {
    "defensiveLine": 2,
    "defensiveStyle": "marking",
    "offsideTrap": false,
    "compactness": 3,
    "creation": "long",
    "finalThird": "crossing",
    "shape": "strict",
    "runs": "moderate"
  },
  "brexitball": {
    "defensiveLine": 2,
    "defensiveStyle": "marking",
    "offsideTrap": false,
    "compactness": 3,
    "creation": "long",
    "finalThird": "crossing",
    "shape": "strict",
    "runs": "moderate"
  },
  "jogobonito": {
    "defensiveLine": 3,
    "defensiveStyle": "zonal",
    "offsideTrap": false,
    "compactness": 2,
    "creation": "short",
    "finalThird": "secure",
    "shape": "relational",
    "runs": "all_attack"
  },
  "futbol_champan": {
    "defensiveLine": 4,
    "defensiveStyle": "mixed",
    "offsideTrap": true,
    "compactness": 2,
    "creation": "short",
    "finalThird": "secure",
    "shape": "free",
    "runs": "all_attack"
  },
  "conservative": {
    "defensiveLine": 4,
    "defensiveStyle": "zonal",
    "offsideTrap": true,
    "compactness": 4,
    "creation": "short",
    "finalThird": "secure",
    "shape": "strict",
    "runs": "moderate"
  },
  "custom": {
    "defensiveLine": 3,
    "defensiveStyle": "mixed",
    "offsideTrap": true,
    "compactness": 2,
    "creation": "mixed",
    "finalThird": "secure",
    "shape": "total_football",
    "runs": "moderate"
  }
};

export function getDefaultTactics(playstyle: TacticalPlaystyle = 'possession'): DetailedTactics {
  return { ...(TACTICAL_PRESETS_DETAILED[playstyle] || TACTICAL_PRESETS_DETAILED.possession) };
}

export function detectMatchingPreset(tactics: DetailedTactics): TacticalPlaystyle {
  for (const style of CANONICAL_PLAYSTYLES) {
    if (style === 'custom') continue;
    const preset = TACTICAL_PRESETS_DETAILED[style];
    if (
      preset &&
      preset.defensiveLine === tactics.defensiveLine &&
      preset.defensiveStyle === tactics.defensiveStyle &&
      preset.offsideTrap === tactics.offsideTrap &&
      preset.compactness === tactics.compactness &&
      preset.creation === tactics.creation &&
      preset.finalThird === tactics.finalThird &&
      preset.shape === tactics.shape &&
      preset.runs === tactics.runs
    ) {
      return style;
    }
  }
  return 'custom';
}

export function applyFormationToPlayers(
  players: Player[],
  team: TeamSide,
  formation: FormationName,
  fieldW: number,
  fieldH: number,
  pitchLeft: number,
  pitchTop: number,
  attacksUp?: boolean,
  streetFormation?: StreetFormationName
): void {
  const isUp = attacksUp !== undefined ? attacksUp : team === 'home';
  const sidePlayers = players.filter((p) => p.team === team);
  const useStreetCoords =
    streetFormation === '1-2-2-2' ||
    (sidePlayers.length === 7 &&
      sidePlayers.every((p) =>
        p.role === 'GK' ||
        p.role === 'CB1' ||
        p.role === 'CB2' ||
        p.role === 'CM1' ||
        p.role === 'CM2' ||
        p.role === 'ST1' ||
        p.role === 'ST2'
      ));

  const coords: Partial<Record<PlayerRole, { x: number; y: number }>> = useStreetCoords
    ? getStreetFormationPositions(isUp)
    : isUp
    ? HOME_FORMATIONS[formation] || HOME_FORMATIONS['4-3-3']
    : getAwayFormationPositions(formation);

  for (const p of sidePlayers) {
    const slot = coords[p.role];
    if (slot) {
      p.baseX = slot.x;
      p.baseY = slot.y;
      p.targetX = pitchLeft + slot.x * fieldW;
      p.targetY = pitchTop + slot.y * fieldH;
      applyPositionalHierarchyToPlayer(p, formation, p.playstyle);
    }
  }
}

export { resolveMatchModeRules as getMatchModeRules } from '../types';

export function isStreet7v7Squad(players: Player[], team: TeamSide): boolean {
  const sidePlayers = players.filter((p) => p.team === team);
  return sidePlayers.length > 0 && sidePlayers.length <= 7;
}
