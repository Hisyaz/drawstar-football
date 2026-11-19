import type { PlayerRole, PlayerStats, TeamKit } from "../types";
import type { PlayerAppearance } from "../types/player";

export const PITCH_CONFIG = {
  FIELD_WIDTH: 1500,
  FIELD_HEIGHT: 2500,
  MARGIN_X: 180,
  MARGIN_TOP: 220,
  MARGIN_BOTTOM: 200,
  TOTAL_WIDTH: 1860,
  TOTAL_HEIGHT: 2920,
  PITCH_LEFT: 180,
  PITCH_RIGHT: 1680,
  PITCH_TOP: 220,
  PITCH_BOTTOM: 2720,
  CENTER_X: 930,
  CENTER_Y: 1470,
  GOAL_WIDTH: 220,
  GOAL_DEPTH: 60,
  GOAL_CROSSBAR_HEIGHT: 65,
  PENALTY_BOX_WIDTH: 620,
  PENALTY_BOX_HEIGHT: 320,
  SIX_YARD_BOX_WIDTH: 280,
  SIX_YARD_BOX_HEIGHT: 120,
  CENTER_CIRCLE_RADIUS: 180,
  PENALTY_SPOT_DIST: 220,
  CORNER_ARC_RADIUS: 30,
  SPRITE_WIDTH: 24,
  SPRITE_HEIGHT: 28,
  BALL_RADIUS: 5.5,
};

export const PHYSICS = {
  "NORMAL_WALK_SPEED": 2.3,
  "RUN_SPEED": 3.8,
  "ACCELERATION": 0.28,
  "DECELERATION": 0.85,
  "BALL_FRICTION_GROUND": 0.984,
  "BALL_AIR_DRAG": 0.9972,
  "GRAVITY": 0.24,
  "BOUNCE_COEFFICIENT": 0.62,
  "TACKLE_SLIDE_SPEED": 5.2,
  "TACKLE_DURATION": 26,
  "FOUL_KNOCKDOWN_DURATION": 60,
  "CARD_DISPLAY_DURATION": 120
};

export const HOME_KIT: TeamKit = {
  "name": "Retro All-Stars",
  "shortName": "RAS",
  "primaryColor": "#0055b8",
  "secondaryColor": "#ffffff",
  "shortsColor": "#ffffff",
  "socksColor": "#0055b8",
  "gkColor": "#ffbb00"
};

export const AWAY_KIT: TeamKit = {
  "name": "Pixel Legends",
  "shortName": "PXL",
  "primaryColor": "#c8102e",
  "secondaryColor": "#ffffff",
  "shortsColor": "#1a1a1a",
  "socksColor": "#c8102e",
  "gkColor": "#00aa55"
};

export interface FormationSlotBase {
  x: number;
  y: number;
  name: string;
  number: number;
  scale: number;
  appearance: PlayerAppearance;
  stats: PlayerStats;
}

export const HOME_FORMATION_BASE: Record<PlayerRole, FormationSlotBase> = {
  "GK": {
    "x": 0.5,
    "y": 0.96,
    "name": "Schmeichel",
    "number": 1,
    "scale": 1.08,
    "appearance": {
      "heightCm": 193,
      "weightKg": 92,
      "muscleMass": 5,
      "skinTone": "#ffdbac",
      "hairStyle": "wavy",
      "hairColor": "#f7d050",
      "facialHair": "clean",
      "jerseyFit": "tucked",
      "collarStyle": "crew",
      "sleeveLength": "long",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.1,
      "sprintSpeed": 3.3,
      "shotPower": 4.5,
      "passing": 3.8,
      "tackling": 4.2,
      "heading": 4
    }
  },
  "LB": {
    "x": 0.16,
    "y": 0.82,
    "name": "Maldini",
    "number": 3,
    "scale": 1.02,
    "appearance": {
      "heightCm": 186,
      "weightKg": 82,
      "muscleMass": 3,
      "skinTone": "#f1c27d",
      "hairStyle": "part",
      "hairColor": "#2a1a0e",
      "facialHair": "stubble",
      "jerseyFit": "untucked",
      "collarStyle": "polo",
      "sleeveLength": "short",
      "sockHeight": "high-knee",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.3,
      "sprintSpeed": 3.7,
      "shotPower": 3.8,
      "passing": 4,
      "tackling": 4.8,
      "heading": 4.4
    }
  },
  "CB1": {
    "x": 0.38,
    "y": 0.84,
    "name": "Baresi",
    "number": 6,
    "scale": 1.01,
    "appearance": {
      "heightCm": 176,
      "weightKg": 73,
      "muscleMass": 3,
      "skinTone": "#ffdbac",
      "hairStyle": "part",
      "hairColor": "#1a1a1a",
      "facialHair": "clean",
      "jerseyFit": "tucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.2,
      "sprintSpeed": 3.5,
      "shotPower": 3.5,
      "passing": 4.1,
      "tackling": 4.9,
      "heading": 4.5
    }
  },
  "CB2": {
    "x": 0.62,
    "y": 0.84,
    "name": "Koeman",
    "number": 4,
    "scale": 1.04,
    "appearance": {
      "heightCm": 181,
      "weightKg": 83,
      "muscleMass": 4,
      "skinTone": "#ffdbac",
      "hairStyle": "wavy",
      "hairColor": "#e8c040",
      "facialHair": "clean",
      "jerseyFit": "tucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.1,
      "sprintSpeed": 3.4,
      "shotPower": 5.2,
      "passing": 4.4,
      "tackling": 4.6,
      "heading": 4.2
    }
  },
  "RB": {
    "x": 0.84,
    "y": 0.82,
    "name": "Cafu",
    "number": 2,
    "scale": 0.99,
    "appearance": {
      "heightCm": 176,
      "weightKg": 74,
      "muscleMass": 4,
      "skinTone": "#8d5524",
      "hairStyle": "buzzcut",
      "hairColor": "#121212",
      "facialHair": "clean",
      "jerseyFit": "untucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "low",
      "earrings": "left-stud",
      "tattoos": {
        "leftArm": "forearm-ink",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.5,
      "sprintSpeed": 4,
      "shotPower": 3.7,
      "passing": 4,
      "tackling": 4.3,
      "heading": 3.8
    }
  },
  "LM": {
    "x": 0.15,
    "y": 0.62,
    "name": "Giggs",
    "number": 11,
    "scale": 0.97,
    "appearance": {
      "heightCm": 179,
      "weightKg": 71,
      "muscleMass": 2,
      "skinTone": "#ffdbac",
      "hairStyle": "part",
      "hairColor": "#2b1b11",
      "facialHair": "stubble",
      "jerseyFit": "untucked",
      "collarStyle": "crew",
      "sleeveLength": "long",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.6,
      "sprintSpeed": 4.1,
      "shotPower": 4,
      "passing": 4.3,
      "tackling": 3.2,
      "heading": 3.4
    }
  },
  "CM1": {
    "x": 0.38,
    "y": 0.64,
    "name": "Matthäus",
    "number": 10,
    "scale": 0.98,
    "appearance": {
      "heightCm": 174,
      "weightKg": 74,
      "muscleMass": 4,
      "skinTone": "#ffdbac",
      "hairStyle": "high-fade",
      "hairColor": "#4d301c",
      "facialHair": "clean",
      "jerseyFit": "tucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.4,
      "sprintSpeed": 3.8,
      "shotPower": 4.9,
      "passing": 4.6,
      "tackling": 4.4,
      "heading": 4
    }
  },
  "CM2": {
    "x": 0.62,
    "y": 0.64,
    "name": "Gullit",
    "number": 8,
    "scale": 1.07,
    "appearance": {
      "heightCm": 191,
      "weightKg": 88,
      "muscleMass": 5,
      "skinTone": "#8d5524",
      "hairStyle": "braids",
      "hairColor": "#111111",
      "facialHair": "beard",
      "jerseyFit": "untucked",
      "collarStyle": "polo",
      "sleeveLength": "short",
      "sockHeight": "high-knee",
      "earrings": "dual-stud",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      },
      "hasBeard": true
    },
    "stats": {
      "speed": 2.4,
      "sprintSpeed": 3.9,
      "shotPower": 4.7,
      "passing": 4.4,
      "tackling": 4.1,
      "heading": 4.8
    }
  },
  "RM": {
    "x": 0.85,
    "y": 0.62,
    "name": "Gascoigne",
    "number": 7,
    "scale": 0.98,
    "appearance": {
      "heightCm": 175,
      "weightKg": 78,
      "muscleMass": 3,
      "skinTone": "#ffdbac",
      "hairStyle": "buzzcut",
      "hairColor": "#ecd264",
      "facialHair": "clean",
      "jerseyFit": "untucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "low",
      "earrings": "left-stud",
      "tattoos": {
        "leftArm": "full-sleeve",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.4,
      "sprintSpeed": 3.8,
      "shotPower": 4.4,
      "passing": 4.5,
      "tackling": 3.6,
      "heading": 3.5
    }
  },
  "ST1": {
    "x": 0.38,
    "y": 0.51,
    "name": "Maradona",
    "number": 9,
    "scale": 0.93,
    "appearance": {
      "heightCm": 165,
      "weightKg": 70,
      "muscleMass": 4,
      "skinTone": "#c68642",
      "hairStyle": "afro",
      "hairColor": "#0a0a0a",
      "facialHair": "stubble",
      "jerseyFit": "untucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "low",
      "earrings": "left-stud",
      "tattoos": {
        "leftArm": "forearm-ink",
        "rightArm": "forearm-ink"
      }
    },
    "stats": {
      "speed": 2.5,
      "sprintSpeed": 4,
      "shotPower": 4.8,
      "passing": 4.9,
      "tackling": 3,
      "heading": 3.9
    }
  },
  "ST2": {
    "x": 0.62,
    "y": 0.51,
    "name": "Van Basten",
    "number": 14,
    "scale": 1.06,
    "appearance": {
      "heightCm": 188,
      "weightKg": 80,
      "muscleMass": 3,
      "skinTone": "#ffdbac",
      "hairStyle": "part",
      "hairColor": "#362115",
      "facialHair": "clean",
      "jerseyFit": "tucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.4,
      "sprintSpeed": 3.9,
      "shotPower": 5,
      "passing": 4.2,
      "tackling": 3.2,
      "heading": 4.7
    }
  }
};

export const AWAY_FORMATION_BASE: Record<PlayerRole, FormationSlotBase> = {
  "GK": {
    "x": 0.5,
    "y": 0.04,
    "name": "Zoff",
    "number": 1,
    "scale": 1.07,
    "appearance": {
      "heightCm": 182,
      "weightKg": 78,
      "muscleMass": 3,
      "skinTone": "#f1c27d",
      "hairStyle": "part",
      "hairColor": "#1e140d",
      "facialHair": "clean",
      "jerseyFit": "tucked",
      "collarStyle": "crew",
      "sleeveLength": "long",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2,
      "sprintSpeed": 3.2,
      "shotPower": 4.3,
      "passing": 3.7,
      "tackling": 4.3,
      "heading": 4
    }
  },
  "RB": {
    "x": 0.16,
    "y": 0.18,
    "name": "Brehme",
    "number": 2,
    "scale": 0.99,
    "appearance": {
      "heightCm": 176,
      "weightKg": 77,
      "muscleMass": 3,
      "skinTone": "#ffdbac",
      "hairStyle": "wavy",
      "hairColor": "#e0b830",
      "facialHair": "clean",
      "jerseyFit": "tucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.3,
      "sprintSpeed": 3.7,
      "shotPower": 4.6,
      "passing": 4.2,
      "tackling": 4.4,
      "heading": 3.9
    }
  },
  "CB1": {
    "x": 0.38,
    "y": 0.16,
    "name": "Scirea",
    "number": 6,
    "scale": 1.03,
    "appearance": {
      "heightCm": 178,
      "weightKg": 75,
      "muscleMass": 3,
      "skinTone": "#f1c27d",
      "hairStyle": "part",
      "hairColor": "#1c1c1c",
      "facialHair": "clean",
      "jerseyFit": "tucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.2,
      "sprintSpeed": 3.5,
      "shotPower": 3.4,
      "passing": 4.2,
      "tackling": 4.9,
      "heading": 4.4
    }
  },
  "CB2": {
    "x": 0.62,
    "y": 0.16,
    "name": "Desailly",
    "number": 4,
    "scale": 1.05,
    "appearance": {
      "heightCm": 185,
      "weightKg": 85,
      "muscleMass": 5,
      "skinTone": "#3b2219",
      "hairStyle": "buzzcut",
      "hairColor": "#0a0a0a",
      "facialHair": "stubble",
      "jerseyFit": "tucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "high-knee",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.3,
      "sprintSpeed": 3.6,
      "shotPower": 3.6,
      "passing": 3.9,
      "tackling": 4.8,
      "heading": 4.6
    }
  },
  "LB": {
    "x": 0.84,
    "y": 0.18,
    "name": "Roberto Carlos",
    "number": 3,
    "scale": 0.93,
    "appearance": {
      "heightCm": 168,
      "weightKg": 73,
      "muscleMass": 5,
      "skinTone": "#8d5524",
      "hairStyle": "bald",
      "hairColor": "#111111",
      "facialHair": "clean",
      "jerseyFit": "untucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "low",
      "earrings": "none",
      "tattoos": {
        "leftArm": "forearm-ink",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.6,
      "sprintSpeed": 4.2,
      "shotPower": 5.4,
      "passing": 4.1,
      "tackling": 4.2,
      "heading": 3.5
    }
  },
  "RM": {
    "x": 0.15,
    "y": 0.38,
    "name": "Valderrama",
    "number": 10,
    "scale": 0.97,
    "appearance": {
      "heightCm": 175,
      "weightKg": 72,
      "muscleMass": 2,
      "skinTone": "#c68642",
      "hairStyle": "afro",
      "hairColor": "#e8a810",
      "facialHair": "clean",
      "jerseyFit": "untucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "low",
      "earrings": "dual-stud",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.1,
      "sprintSpeed": 3.4,
      "shotPower": 4,
      "passing": 5,
      "tackling": 3.4,
      "heading": 3.3
    }
  },
  "CM1": {
    "x": 0.38,
    "y": 0.36,
    "name": "Rijkaard",
    "number": 5,
    "scale": 1.06,
    "appearance": {
      "heightCm": 190,
      "weightKg": 86,
      "muscleMass": 5,
      "skinTone": "#8d5524",
      "hairStyle": "afro",
      "hairColor": "#0a0a0a",
      "facialHair": "beard",
      "jerseyFit": "untucked",
      "collarStyle": "polo",
      "sleeveLength": "short",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      },
      "hasBeard": true
    },
    "stats": {
      "speed": 2.3,
      "sprintSpeed": 3.7,
      "shotPower": 4.4,
      "passing": 4.4,
      "tackling": 4.7,
      "heading": 4.4
    }
  },
  "CM2": {
    "x": 0.62,
    "y": 0.36,
    "name": "Hagi",
    "number": 8,
    "scale": 0.97,
    "appearance": {
      "heightCm": 172,
      "weightKg": 72,
      "muscleMass": 3,
      "skinTone": "#f1c27d",
      "hairStyle": "part",
      "hairColor": "#1c1510",
      "facialHair": "stubble",
      "jerseyFit": "untucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "standard",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.3,
      "sprintSpeed": 3.7,
      "shotPower": 4.8,
      "passing": 4.6,
      "tackling": 3.5,
      "heading": 3.6
    }
  },
  "LM": {
    "x": 0.85,
    "y": 0.38,
    "name": "Stoichkov",
    "number": 7,
    "scale": 1,
    "appearance": {
      "heightCm": 178,
      "weightKg": 77,
      "muscleMass": 4,
      "skinTone": "#ffdbac",
      "hairStyle": "high-fade",
      "hairColor": "#111111",
      "facialHair": "stubble",
      "jerseyFit": "untucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "high-knee",
      "earrings": "none",
      "tattoos": {
        "leftArm": "forearm-ink",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.5,
      "sprintSpeed": 4,
      "shotPower": 4.9,
      "passing": 4.2,
      "tackling": 3.6,
      "heading": 4
    }
  },
  "ST1": {
    "x": 0.38,
    "y": 0.36,
    "name": "Romário",
    "number": 11,
    "scale": 0.94,
    "appearance": {
      "heightCm": 167,
      "weightKg": 70,
      "muscleMass": 4,
      "skinTone": "#8d5524",
      "hairStyle": "buzzcut",
      "hairColor": "#0c0c0c",
      "facialHair": "stubble",
      "jerseyFit": "untucked",
      "collarStyle": "crew",
      "sleeveLength": "short",
      "sockHeight": "low",
      "earrings": "none",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      }
    },
    "stats": {
      "speed": 2.5,
      "sprintSpeed": 4.1,
      "shotPower": 4.9,
      "passing": 4.1,
      "tackling": 2.8,
      "heading": 4.2
    }
  },
  "ST2": {
    "x": 0.62,
    "y": 0.36,
    "name": "Baggio",
    "number": 9,
    "scale": 0.97,
    "appearance": {
      "heightCm": 174,
      "weightKg": 73,
      "muscleMass": 3,
      "skinTone": "#c68642",
      "hairStyle": "topknot",
      "hairColor": "#141414",
      "facialHair": "goatee",
      "jerseyFit": "untucked",
      "collarStyle": "polo",
      "sleeveLength": "short",
      "sockHeight": "standard",
      "earrings": "small-hoop",
      "tattoos": {
        "leftArm": "none",
        "rightArm": "none"
      },
      "hasBeard": true
    },
    "stats": {
      "speed": 2.4,
      "sprintSpeed": 3.9,
      "shotPower": 4.7,
      "passing": 4.8,
      "tackling": 3,
      "heading": 3.8
    }
  }
};
