/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FormationName,
  Player,
  PlayerPlaystyle,
  PlayerRole,
  PrimaryPosition,
  SubPosition,
} from '../types';
import { resolveEffectivePlaystyle } from './pitchGrid';

export const PRIMARY_ID = {
  "ATT": 0,
  "MID": 1,
  "DEF": 2,
  "GK": 3
} as const;

export const SUBPOS_ID = {
  "GK": 0,
  "CB": 1,
  "LB": 2,
  "RB": 3,
  "LWB": 4,
  "RWB": 5,
  "LIB": 6,
  "CDM": 7,
  "CM": 8,
  "CAM": 9,
  "LM": 10,
  "RM": 11,
  "LW": 12,
  "RW": 13,
  "ST": 14,
  "SS": 15
} as const;

export const PLAYSTYLE_ID = {
  "POACHER": 0,
  "TARGET": 1,
  "COMPLETE": 2,
  "FINISHER": 3,
  "DECOY": 4,
  "TRADITIONAL": 5,
  "INVERTED": 6,
  "PROLIFIC": 7,
  "PRESSING": 8,
  "CREATOR": 9,
  "SHADOW": 10,
  "CLASSIC_N10": 11,
  "ENGINE": 12,
  "BOX_TO_BOX": 13,
  "MAESTRO": 14,
  "RUNNER": 15,
  "ENFORCER": 16,
  "ANCHOR": 17,
  "REGISTA": 18,
  "DEFENSIVE": 19,
  "INVERTED_FB": 20,
  "ATTACKER_FB": 21,
  "BALANCED_FB": 22,
  "DESTROYER": 23,
  "DISTRIBUTOR": 24,
  "PLAYMAKER": 25,
  "STOPPER": 26,
  "SWEEPER_CB": 27,
  "BALANCED_GK": 28,
  "SWEEPER": 29,
  "WALL": 30,
  "BASIC": 31
} as const;

export interface PlaystyleBias {
  forwardRunBias: number;
  trackBackBias: number;
  cutInsideBias: number;
  crossBias: number;
  holdZoneY: number;
  pressTackleRadius: number;
  stepOutBias: number;
  safePassBias: number;
  penetrationBias: number;
  boxArrivalBias: number;
  roamFreedom: number;
  aerialDuelBias: number;
  physicalShieldBias: number;
  sweeperRushDistance: number;
  wallLineAnchor: number;
}

export const PLAYSTYLE_BIASES: Record<number, PlaystyleBias> = {
  "0": {
    "forwardRunBias": 1.45,
    "trackBackBias": 0.2,
    "cutInsideBias": 1,
    "crossBias": 0.2,
    "holdZoneY": 0.45,
    "pressTackleRadius": 0.7,
    "stepOutBias": 0.2,
    "safePassBias": 0.7,
    "penetrationBias": 1.3,
    "boxArrivalBias": 1.5,
    "roamFreedom": 0.6,
    "aerialDuelBias": 1.1,
    "physicalShieldBias": 0.8,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "1": {
    "forwardRunBias": 1.05,
    "trackBackBias": 0.35,
    "cutInsideBias": 0.9,
    "crossBias": 0.1,
    "holdZoneY": 0.5,
    "pressTackleRadius": 0.9,
    "stepOutBias": 0.4,
    "safePassBias": 1.2,
    "penetrationBias": 0.8,
    "boxArrivalBias": 1.35,
    "roamFreedom": 0.5,
    "aerialDuelBias": 1.5,
    "physicalShieldBias": 1.6,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "2": {
    "forwardRunBias": 1.35,
    "trackBackBias": 0.45,
    "cutInsideBias": 1.25,
    "crossBias": 0.6,
    "holdZoneY": 0.48,
    "pressTackleRadius": 1,
    "stepOutBias": 0.5,
    "safePassBias": 1,
    "penetrationBias": 1.25,
    "boxArrivalBias": 1.35,
    "roamFreedom": 1.2,
    "aerialDuelBias": 1.2,
    "physicalShieldBias": 1.2,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "3": {
    "forwardRunBias": 1.3,
    "trackBackBias": 0.25,
    "cutInsideBias": 1.1,
    "crossBias": 0.2,
    "holdZoneY": 0.46,
    "pressTackleRadius": 0.8,
    "stepOutBias": 0.3,
    "safePassBias": 0.9,
    "penetrationBias": 1.1,
    "boxArrivalBias": 1.45,
    "roamFreedom": 0.8,
    "aerialDuelBias": 1.05,
    "physicalShieldBias": 0.9,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "4": {
    "forwardRunBias": 1.25,
    "trackBackBias": 0.6,
    "cutInsideBias": 1.2,
    "crossBias": 0.4,
    "holdZoneY": 0.52,
    "pressTackleRadius": 1.1,
    "stepOutBias": 0.7,
    "safePassBias": 1.2,
    "penetrationBias": 1,
    "boxArrivalBias": 0.9,
    "roamFreedom": 1.5,
    "aerialDuelBias": 0.9,
    "physicalShieldBias": 1.1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "5": {
    "forwardRunBias": 1.35,
    "trackBackBias": 0.65,
    "cutInsideBias": 0.45,
    "crossBias": 1.55,
    "holdZoneY": 0.55,
    "pressTackleRadius": 0.9,
    "stepOutBias": 0.4,
    "safePassBias": 0.85,
    "penetrationBias": 1.2,
    "boxArrivalBias": 0.7,
    "roamFreedom": 0.4,
    "aerialDuelBias": 0.6,
    "physicalShieldBias": 0.7,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "6": {
    "forwardRunBias": 1.3,
    "trackBackBias": 0.55,
    "cutInsideBias": 1.5,
    "crossBias": 0.45,
    "holdZoneY": 0.52,
    "pressTackleRadius": 0.9,
    "stepOutBias": 0.5,
    "safePassBias": 1,
    "penetrationBias": 1.3,
    "boxArrivalBias": 1.2,
    "roamFreedom": 1.2,
    "aerialDuelBias": 0.6,
    "physicalShieldBias": 1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "7": {
    "forwardRunBias": 1.4,
    "trackBackBias": 0.4,
    "cutInsideBias": 1.35,
    "crossBias": 0.5,
    "holdZoneY": 0.5,
    "pressTackleRadius": 0.85,
    "stepOutBias": 0.4,
    "safePassBias": 0.8,
    "penetrationBias": 1.25,
    "boxArrivalBias": 1.45,
    "roamFreedom": 1.1,
    "aerialDuelBias": 1,
    "physicalShieldBias": 0.9,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "8": {
    "forwardRunBias": 1.15,
    "trackBackBias": 1.35,
    "cutInsideBias": 0.9,
    "crossBias": 0.8,
    "holdZoneY": 0.58,
    "pressTackleRadius": 1.4,
    "stepOutBias": 1.2,
    "safePassBias": 1.1,
    "penetrationBias": 0.9,
    "boxArrivalBias": 0.8,
    "roamFreedom": 0.7,
    "aerialDuelBias": 0.8,
    "physicalShieldBias": 1.1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "9": {
    "forwardRunBias": 1.1,
    "trackBackBias": 0.5,
    "cutInsideBias": 1.1,
    "crossBias": 0.7,
    "holdZoneY": 0.58,
    "pressTackleRadius": 0.8,
    "stepOutBias": 0.4,
    "safePassBias": 1,
    "penetrationBias": 1.55,
    "boxArrivalBias": 1,
    "roamFreedom": 1.4,
    "aerialDuelBias": 0.6,
    "physicalShieldBias": 1.1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "10": {
    "forwardRunBias": 1.4,
    "trackBackBias": 0.45,
    "cutInsideBias": 1.15,
    "crossBias": 0.4,
    "holdZoneY": 0.55,
    "pressTackleRadius": 0.9,
    "stepOutBias": 0.5,
    "safePassBias": 0.9,
    "penetrationBias": 1.1,
    "boxArrivalBias": 1.55,
    "roamFreedom": 1,
    "aerialDuelBias": 1.2,
    "physicalShieldBias": 1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "11": {
    "forwardRunBias": 0.85,
    "trackBackBias": 0.3,
    "cutInsideBias": 1.2,
    "crossBias": 0.6,
    "holdZoneY": 0.56,
    "pressTackleRadius": 0.6,
    "stepOutBias": 0.3,
    "safePassBias": 1.3,
    "penetrationBias": 1.4,
    "boxArrivalBias": 0.85,
    "roamFreedom": 1.6,
    "aerialDuelBias": 0.5,
    "physicalShieldBias": 1.4,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "12": {
    "forwardRunBias": 1.25,
    "trackBackBias": 1.2,
    "cutInsideBias": 1,
    "crossBias": 0.7,
    "holdZoneY": 0.6,
    "pressTackleRadius": 1.25,
    "stepOutBias": 0.9,
    "safePassBias": 1,
    "penetrationBias": 1.1,
    "boxArrivalBias": 1.2,
    "roamFreedom": 1.1,
    "aerialDuelBias": 1.1,
    "physicalShieldBias": 1.3,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "13": {
    "forwardRunBias": 1.3,
    "trackBackBias": 1.35,
    "cutInsideBias": 1,
    "crossBias": 0.6,
    "holdZoneY": 0.64,
    "pressTackleRadius": 1.2,
    "stepOutBias": 0.8,
    "safePassBias": 1,
    "penetrationBias": 1.1,
    "boxArrivalBias": 1.35,
    "roamFreedom": 1.1,
    "aerialDuelBias": 1.15,
    "physicalShieldBias": 1.2,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "14": {
    "forwardRunBias": 0.95,
    "trackBackBias": 0.8,
    "cutInsideBias": 0.9,
    "crossBias": 0.5,
    "holdZoneY": 0.65,
    "pressTackleRadius": 0.85,
    "stepOutBias": 0.5,
    "safePassBias": 1.5,
    "penetrationBias": 1.2,
    "boxArrivalBias": 0.65,
    "roamFreedom": 1.2,
    "aerialDuelBias": 0.6,
    "physicalShieldBias": 1.3,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "15": {
    "forwardRunBias": 1.45,
    "trackBackBias": 0.95,
    "cutInsideBias": 1.1,
    "crossBias": 0.6,
    "holdZoneY": 0.63,
    "pressTackleRadius": 1,
    "stepOutBias": 0.7,
    "safePassBias": 0.9,
    "penetrationBias": 1.15,
    "boxArrivalBias": 1.3,
    "roamFreedom": 1,
    "aerialDuelBias": 0.9,
    "physicalShieldBias": 1.1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "16": {
    "forwardRunBias": 0.55,
    "trackBackBias": 1.35,
    "cutInsideBias": 0.8,
    "crossBias": 0.2,
    "holdZoneY": 0.72,
    "pressTackleRadius": 1.4,
    "stepOutBias": 1.35,
    "safePassBias": 1.1,
    "penetrationBias": 0.7,
    "boxArrivalBias": 0.3,
    "roamFreedom": 0.6,
    "aerialDuelBias": 1.3,
    "physicalShieldBias": 1.5,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "17": {
    "forwardRunBias": 0.4,
    "trackBackBias": 1.45,
    "cutInsideBias": 0.7,
    "crossBias": 0.1,
    "holdZoneY": 0.74,
    "pressTackleRadius": 1.2,
    "stepOutBias": 0.4,
    "safePassBias": 1.4,
    "penetrationBias": 0.8,
    "boxArrivalBias": 0.15,
    "roamFreedom": 0.35,
    "aerialDuelBias": 1.2,
    "physicalShieldBias": 1.4,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "18": {
    "forwardRunBias": 0.5,
    "trackBackBias": 1.1,
    "cutInsideBias": 0.8,
    "crossBias": 0.7,
    "holdZoneY": 0.75,
    "pressTackleRadius": 0.8,
    "stepOutBias": 0.3,
    "safePassBias": 1.3,
    "penetrationBias": 1.55,
    "boxArrivalBias": 0.2,
    "roamFreedom": 1.2,
    "aerialDuelBias": 0.6,
    "physicalShieldBias": 1.35,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "19": {
    "forwardRunBias": 0.35,
    "trackBackBias": 1.5,
    "cutInsideBias": 0.5,
    "crossBias": 0.4,
    "holdZoneY": 0.82,
    "pressTackleRadius": 1.25,
    "stepOutBias": 0.6,
    "safePassBias": 1.3,
    "penetrationBias": 0.7,
    "boxArrivalBias": 0.05,
    "roamFreedom": 0.2,
    "aerialDuelBias": 1.1,
    "physicalShieldBias": 1.1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "20": {
    "forwardRunBias": 0.85,
    "trackBackBias": 1.25,
    "cutInsideBias": 1.6,
    "crossBias": 0.4,
    "holdZoneY": 0.74,
    "pressTackleRadius": 1.15,
    "stepOutBias": 0.8,
    "safePassBias": 1.35,
    "penetrationBias": 1.15,
    "boxArrivalBias": 0.4,
    "roamFreedom": 1.2,
    "aerialDuelBias": 0.7,
    "physicalShieldBias": 1.1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "21": {
    "forwardRunBias": 1.45,
    "trackBackBias": 1.05,
    "cutInsideBias": 0.6,
    "crossBias": 1.4,
    "holdZoneY": 0.7,
    "pressTackleRadius": 1,
    "stepOutBias": 0.7,
    "safePassBias": 0.9,
    "penetrationBias": 1.1,
    "boxArrivalBias": 0.85,
    "roamFreedom": 0.9,
    "aerialDuelBias": 0.8,
    "physicalShieldBias": 1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "22": {
    "forwardRunBias": 0.9,
    "trackBackBias": 1.35,
    "cutInsideBias": 0.8,
    "crossBias": 0.9,
    "holdZoneY": 0.78,
    "pressTackleRadius": 1.15,
    "stepOutBias": 0.6,
    "safePassBias": 1.1,
    "penetrationBias": 0.95,
    "boxArrivalBias": 0.35,
    "roamFreedom": 0.6,
    "aerialDuelBias": 1,
    "physicalShieldBias": 1.1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "23": {
    "forwardRunBias": 0.2,
    "trackBackBias": 1.45,
    "cutInsideBias": 0.5,
    "crossBias": 0.1,
    "holdZoneY": 0.83,
    "pressTackleRadius": 1.35,
    "stepOutBias": 1.4,
    "safePassBias": 1,
    "penetrationBias": 0.6,
    "boxArrivalBias": 0.1,
    "roamFreedom": 0.4,
    "aerialDuelBias": 1.45,
    "physicalShieldBias": 1.4,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "24": {
    "forwardRunBias": 0.25,
    "trackBackBias": 1.45,
    "cutInsideBias": 0.5,
    "crossBias": 0.2,
    "holdZoneY": 0.85,
    "pressTackleRadius": 1,
    "stepOutBias": 0.6,
    "safePassBias": 1.45,
    "penetrationBias": 1.15,
    "boxArrivalBias": 0.05,
    "roamFreedom": 0.5,
    "aerialDuelBias": 1.15,
    "physicalShieldBias": 1.2,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "25": {
    "forwardRunBias": 0.35,
    "trackBackBias": 1.35,
    "cutInsideBias": 0.6,
    "crossBias": 0.3,
    "holdZoneY": 0.84,
    "pressTackleRadius": 0.95,
    "stepOutBias": 0.7,
    "safePassBias": 1.1,
    "penetrationBias": 1.5,
    "boxArrivalBias": 0.15,
    "roamFreedom": 0.8,
    "aerialDuelBias": 1.2,
    "physicalShieldBias": 1.25,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "26": {
    "forwardRunBias": 0.15,
    "trackBackBias": 1.55,
    "cutInsideBias": 0.5,
    "crossBias": 0.1,
    "holdZoneY": 0.86,
    "pressTackleRadius": 1.15,
    "stepOutBias": 0.5,
    "safePassBias": 1.2,
    "penetrationBias": 0.8,
    "boxArrivalBias": 0.05,
    "roamFreedom": 0.25,
    "aerialDuelBias": 1.4,
    "physicalShieldBias": 1.3,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "27": {
    "forwardRunBias": 0.65,
    "trackBackBias": 1.4,
    "cutInsideBias": 0.8,
    "crossBias": 0.3,
    "holdZoneY": 0.89,
    "pressTackleRadius": 1.05,
    "stepOutBias": 0.9,
    "safePassBias": 1.3,
    "penetrationBias": 1.3,
    "boxArrivalBias": 0.2,
    "roamFreedom": 1.3,
    "aerialDuelBias": 1.25,
    "physicalShieldBias": 1.3,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  },
  "28": {
    "forwardRunBias": 0,
    "trackBackBias": 1,
    "cutInsideBias": 0,
    "crossBias": 0,
    "holdZoneY": 0.96,
    "pressTackleRadius": 1,
    "stepOutBias": 0.4,
    "safePassBias": 1.1,
    "penetrationBias": 0.9,
    "boxArrivalBias": 0,
    "roamFreedom": 0.1,
    "aerialDuelBias": 1,
    "physicalShieldBias": 1,
    "sweeperRushDistance": 160,
    "wallLineAnchor": 0.95
  },
  "29": {
    "forwardRunBias": 0,
    "trackBackBias": 1,
    "cutInsideBias": 0,
    "crossBias": 0,
    "holdZoneY": 0.91,
    "pressTackleRadius": 1.2,
    "stepOutBias": 1.4,
    "safePassBias": 1.25,
    "penetrationBias": 1.2,
    "boxArrivalBias": 0,
    "roamFreedom": 0.4,
    "aerialDuelBias": 1.15,
    "physicalShieldBias": 1.1,
    "sweeperRushDistance": 270,
    "wallLineAnchor": 0.7
  },
  "30": {
    "forwardRunBias": 0,
    "trackBackBias": 1,
    "cutInsideBias": 0,
    "crossBias": 0,
    "holdZoneY": 0.97,
    "pressTackleRadius": 0.85,
    "stepOutBias": 0.2,
    "safePassBias": 1,
    "penetrationBias": 0.8,
    "boxArrivalBias": 0,
    "roamFreedom": 0.05,
    "aerialDuelBias": 0.95,
    "physicalShieldBias": 1,
    "sweeperRushDistance": 110,
    "wallLineAnchor": 1.25
  },
  "31": {
    "forwardRunBias": 1,
    "trackBackBias": 1,
    "cutInsideBias": 1,
    "crossBias": 1,
    "holdZoneY": 0.65,
    "pressTackleRadius": 1,
    "stepOutBias": 1,
    "safePassBias": 1,
    "penetrationBias": 1,
    "boxArrivalBias": 1,
    "roamFreedom": 1,
    "aerialDuelBias": 1,
    "physicalShieldBias": 1,
    "sweeperRushDistance": 0,
    "wallLineAnchor": 0
  }
};

export interface SubPositionMeta {
  id: SubPosition;
  numericId: number;
  primary: PrimaryPosition;
  primaryId: number;
  name: string;
  shortCode: string;
  isSpecial: boolean;
  inheritedFrom?: SubPosition[];
  allowedPlaystyles: PlayerPlaystyle[];
}

export const SUB_POSITION_DEFINITIONS: Record<SubPosition, SubPositionMeta> = {
  "ST": {
    "id": "ST",
    "numericId": 14,
    "primary": "ATT",
    "primaryId": 0,
    "name": "Striker",
    "shortCode": "ST",
    "isSpecial": false,
    "allowedPlaystyles": [
      "poacher",
      "target",
      "complete",
      "finisher",
      "decoy"
    ]
  },
  "LW": {
    "id": "LW",
    "numericId": 12,
    "primary": "ATT",
    "primaryId": 0,
    "name": "Left Winger",
    "shortCode": "LW",
    "isSpecial": false,
    "allowedPlaystyles": [
      "traditional",
      "inverted",
      "prolific",
      "pressing"
    ]
  },
  "RW": {
    "id": "RW",
    "numericId": 13,
    "primary": "ATT",
    "primaryId": 0,
    "name": "Right Winger",
    "shortCode": "RW",
    "isSpecial": false,
    "allowedPlaystyles": [
      "traditional",
      "inverted",
      "prolific",
      "pressing"
    ]
  },
  "SS": {
    "id": "SS",
    "numericId": 15,
    "primary": "ATT",
    "primaryId": 0,
    "name": "Second Striker / False 9",
    "shortCode": "SS",
    "isSpecial": true,
    "inheritedFrom": [
      "CAM",
      "ST"
    ],
    "allowedPlaystyles": [
      "creator",
      "shadow",
      "classic_n10",
      "engine",
      "finisher",
      "complete",
      "poacher",
      "target",
      "decoy"
    ]
  },
  "CAM": {
    "id": "CAM",
    "numericId": 9,
    "primary": "MID",
    "primaryId": 1,
    "name": "Attacking Midfielder",
    "shortCode": "CAM",
    "isSpecial": false,
    "allowedPlaystyles": [
      "creator",
      "shadow",
      "classic_n10",
      "engine"
    ]
  },
  "CM": {
    "id": "CM",
    "numericId": 8,
    "primary": "MID",
    "primaryId": 1,
    "name": "Central Midfielder",
    "shortCode": "CM",
    "isSpecial": false,
    "allowedPlaystyles": [
      "box_to_box",
      "maestro",
      "runner"
    ]
  },
  "CDM": {
    "id": "CDM",
    "numericId": 7,
    "primary": "MID",
    "primaryId": 1,
    "name": "Defensive Midfielder",
    "shortCode": "CDM",
    "isSpecial": false,
    "allowedPlaystyles": [
      "enforcer",
      "anchor",
      "regista"
    ]
  },
  "LM": {
    "id": "LM",
    "numericId": 10,
    "primary": "MID",
    "primaryId": 1,
    "name": "Left Wide Midfielder",
    "shortCode": "LM",
    "isSpecial": true,
    "inheritedFrom": [
      "LW"
    ],
    "allowedPlaystyles": [
      "traditional",
      "inverted",
      "prolific",
      "pressing",
      "box_to_box",
      "maestro",
      "runner"
    ]
  },
  "RM": {
    "id": "RM",
    "numericId": 11,
    "primary": "MID",
    "primaryId": 1,
    "name": "Right Wide Midfielder",
    "shortCode": "RM",
    "isSpecial": true,
    "inheritedFrom": [
      "RW"
    ],
    "allowedPlaystyles": [
      "traditional",
      "inverted",
      "prolific",
      "pressing",
      "box_to_box",
      "maestro",
      "runner"
    ]
  },
  "LWB": {
    "id": "LWB",
    "numericId": 4,
    "primary": "MID",
    "primaryId": 1,
    "name": "Left Wingback",
    "shortCode": "LWB",
    "isSpecial": true,
    "inheritedFrom": [
      "LB"
    ],
    "allowedPlaystyles": [
      "attacker_fb",
      "inverted_fb",
      "balanced_fb",
      "defensive"
    ]
  },
  "RWB": {
    "id": "RWB",
    "numericId": 5,
    "primary": "MID",
    "primaryId": 1,
    "name": "Right Wingback",
    "shortCode": "RWB",
    "isSpecial": true,
    "inheritedFrom": [
      "RB"
    ],
    "allowedPlaystyles": [
      "attacker_fb",
      "inverted_fb",
      "balanced_fb",
      "defensive"
    ]
  },
  "LB": {
    "id": "LB",
    "numericId": 2,
    "primary": "DEF",
    "primaryId": 2,
    "name": "Left Fullback",
    "shortCode": "LB",
    "isSpecial": false,
    "allowedPlaystyles": [
      "defensive",
      "inverted_fb",
      "attacker_fb",
      "balanced_fb"
    ]
  },
  "RB": {
    "id": "RB",
    "numericId": 3,
    "primary": "DEF",
    "primaryId": 2,
    "name": "Right Fullback",
    "shortCode": "RB",
    "isSpecial": false,
    "allowedPlaystyles": [
      "defensive",
      "inverted_fb",
      "attacker_fb",
      "balanced_fb"
    ]
  },
  "CB": {
    "id": "CB",
    "numericId": 1,
    "primary": "DEF",
    "primaryId": 2,
    "name": "Center Back",
    "shortCode": "CB",
    "isSpecial": false,
    "allowedPlaystyles": [
      "destroyer",
      "distributor",
      "playmaker",
      "stopper"
    ]
  },
  "LIB": {
    "id": "LIB",
    "numericId": 6,
    "primary": "DEF",
    "primaryId": 2,
    "name": "Libero / Sweeper",
    "shortCode": "LIB",
    "isSpecial": true,
    "inheritedFrom": [
      "CB",
      "CDM"
    ],
    "allowedPlaystyles": [
      "enforcer",
      "anchor",
      "regista",
      "destroyer",
      "distributor",
      "playmaker",
      "stopper",
      "sweeper_cb"
    ]
  },
  "GK": {
    "id": "GK",
    "numericId": 0,
    "primary": "GK",
    "primaryId": 3,
    "name": "Goalkeeper",
    "shortCode": "GK",
    "isSpecial": false,
    "allowedPlaystyles": [
      "balanced_gk",
      "sweeper",
      "wall"
    ]
  }
};

export interface PlaystyleDefinitionDetailed {
  id: PlayerPlaystyle;
  numericId: number;
  name: string;
  tag: string;
  icon: string;
  description: string;
  archetypes: { modern: string; legends: string };
  mechanicalEffect: string;
  bias: PlaystyleBias;
}

export const PLAYSTYLE_DEFINITIONS_DETAILED: Record<PlayerPlaystyle, PlaystyleDefinitionDetailed> = {
  "poacher": {
    "id": "poacher",
    "numericId": 0,
    "name": "Poacher",
    "tag": "Goal Predator",
    "icon": "⚡",
    "description": "Lurks on the shoulder of the last defender; makes predatory blindside runs; lethal conversion rate inside the 6-yard box.",
    "archetypes": {
      "modern": "Erling Haaland",
      "legends": "Gerd Müller"
    },
    "mechanicalEffect": "+15% finish conversion in 6-yard box, stays on defender shoulder, 0 trackback drag.",
    "bias": {
      "forwardRunBias": 1.45,
      "trackBackBias": 0.2,
      "cutInsideBias": 1,
      "crossBias": 0.2,
      "holdZoneY": 0.45,
      "pressTackleRadius": 0.7,
      "stepOutBias": 0.2,
      "safePassBias": 0.7,
      "penetrationBias": 1.3,
      "boxArrivalBias": 1.5,
      "roamFreedom": 0.6,
      "aerialDuelBias": 1.1,
      "physicalShieldBias": 0.8,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "target": {
    "id": "target",
    "numericId": 1,
    "name": "Target Forward",
    "tag": "Aerial Anchor",
    "icon": "🛡️",
    "description": "Uses upper-body strength to pin center-backs, win aerial knockdowns, and hold up play for arriving runners.",
    "archetypes": {
      "modern": "Olivier Giroud",
      "legends": "Didier Drogba"
    },
    "mechanicalEffect": "+20% aerial duel win rate, +15% Q shield mass, holds line for second-ball runners.",
    "bias": {
      "forwardRunBias": 1.05,
      "trackBackBias": 0.35,
      "cutInsideBias": 0.9,
      "crossBias": 0.1,
      "holdZoneY": 0.5,
      "pressTackleRadius": 0.9,
      "stepOutBias": 0.4,
      "safePassBias": 1.2,
      "penetrationBias": 0.8,
      "boxArrivalBias": 1.35,
      "roamFreedom": 0.5,
      "aerialDuelBias": 1.5,
      "physicalShieldBias": 1.6,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "complete": {
    "id": "complete",
    "numericId": 2,
    "name": "Complete Striker",
    "tag": "Total Threat",
    "icon": "👑",
    "description": "All-round monster capable of beating defenders 1v1, running in behind, scoring from range, and clinical finishing.",
    "archetypes": {
      "modern": "Kylian Mbappé",
      "legends": "Ronaldo Nazário"
    },
    "mechanicalEffect": "Fluid channel runs, balanced inside cuts, +10% sprint burst when leading into space.",
    "bias": {
      "forwardRunBias": 1.35,
      "trackBackBias": 0.45,
      "cutInsideBias": 1.25,
      "crossBias": 0.6,
      "holdZoneY": 0.48,
      "pressTackleRadius": 1,
      "stepOutBias": 0.5,
      "safePassBias": 1,
      "penetrationBias": 1.25,
      "boxArrivalBias": 1.35,
      "roamFreedom": 1.2,
      "aerialDuelBias": 1.2,
      "physicalShieldBias": 1.2,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "finisher": {
    "id": "finisher",
    "numericId": 3,
    "name": "Finisher",
    "tag": "Channel Master",
    "icon": "🎯",
    "description": "Master of channel timing; arrives into space at the exact moment to apply a devastating one-touch finish.",
    "archetypes": {
      "modern": "Lautaro Martínez",
      "legends": "Eusébio"
    },
    "mechanicalEffect": "Times cutback arrival to perfection; +15% 1-touch volley and first-time strike accuracy.",
    "bias": {
      "forwardRunBias": 1.3,
      "trackBackBias": 0.25,
      "cutInsideBias": 1.1,
      "crossBias": 0.2,
      "holdZoneY": 0.46,
      "pressTackleRadius": 0.8,
      "stepOutBias": 0.3,
      "safePassBias": 0.9,
      "penetrationBias": 1.1,
      "boxArrivalBias": 1.45,
      "roamFreedom": 0.8,
      "aerialDuelBias": 1.05,
      "physicalShieldBias": 0.9,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "decoy": {
    "id": "decoy",
    "numericId": 4,
    "name": "Decoy Runner",
    "tag": "Space Opener",
    "icon": "🏃",
    "description": "Tireless off-the-ball runner who drags center-backs out of position to open gaps for wingers and trailing midfielders.",
    "archetypes": {
      "modern": "Ferran Torres",
      "legends": "Roberto Firmino"
    },
    "mechanicalEffect": "Pulls opposing markers 25px wide to isolate Zone 14; relentless off-ball work rate.",
    "bias": {
      "forwardRunBias": 1.25,
      "trackBackBias": 0.6,
      "cutInsideBias": 1.2,
      "crossBias": 0.4,
      "holdZoneY": 0.52,
      "pressTackleRadius": 1.1,
      "stepOutBias": 0.7,
      "safePassBias": 1.2,
      "penetrationBias": 1,
      "boxArrivalBias": 0.9,
      "roamFreedom": 1.5,
      "aerialDuelBias": 0.9,
      "physicalShieldBias": 1.1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "traditional": {
    "id": "traditional",
    "numericId": 5,
    "name": "Traditional Winger",
    "tag": "Touchline Sprinter",
    "icon": "🚀",
    "description": "Hugs the touchline, beats fullbacks on the outside with acceleration, and delivers whipped crosses into the box.",
    "archetypes": {
      "modern": "Bukayo Saka",
      "legends": "Garrincha, Ryan Giggs"
    },
    "mechanicalEffect": "Stays glued to touchline; +20% cross curl accuracy; sprint ramp acceleration on flank.",
    "bias": {
      "forwardRunBias": 1.35,
      "trackBackBias": 0.65,
      "cutInsideBias": 0.45,
      "crossBias": 1.55,
      "holdZoneY": 0.55,
      "pressTackleRadius": 0.9,
      "stepOutBias": 0.4,
      "safePassBias": 0.85,
      "penetrationBias": 1.2,
      "boxArrivalBias": 0.7,
      "roamFreedom": 0.4,
      "aerialDuelBias": 0.6,
      "physicalShieldBias": 0.7,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "inverted": {
    "id": "inverted",
    "numericId": 6,
    "name": "Inverted Winger",
    "tag": "Inside Cutter",
    "icon": "⚡",
    "description": "Cuts inside on their stronger foot toward central shooting pockets; nightmare for defenders 1v1.",
    "archetypes": {
      "modern": "Lamine Yamal",
      "legends": "Lionel Messi"
    },
    "mechanicalEffect": "Sharp 45° cuts into half-spaces; +15% curl finesse shot accuracy from the edge of box.",
    "bias": {
      "forwardRunBias": 1.3,
      "trackBackBias": 0.55,
      "cutInsideBias": 1.5,
      "crossBias": 0.45,
      "holdZoneY": 0.52,
      "pressTackleRadius": 0.9,
      "stepOutBias": 0.5,
      "safePassBias": 1,
      "penetrationBias": 1.3,
      "boxArrivalBias": 1.2,
      "roamFreedom": 1.2,
      "aerialDuelBias": 0.6,
      "physicalShieldBias": 1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "prolific": {
    "id": "prolific",
    "numericId": 7,
    "name": "Prolific Winger",
    "tag": "Inside Forward",
    "icon": "🔥",
    "description": "Inside forward archetype; starts wide but aggressively attacks the far post to score like a second striker.",
    "archetypes": {
      "modern": "Cole Palmer, Mohamed Salah",
      "legends": "Cristiano Ronaldo, Arjen Robben"
    },
    "mechanicalEffect": "Diagonal back-post runs; crashes 18-yard box on cross deliveries; high conversion.",
    "bias": {
      "forwardRunBias": 1.4,
      "trackBackBias": 0.4,
      "cutInsideBias": 1.35,
      "crossBias": 0.5,
      "holdZoneY": 0.5,
      "pressTackleRadius": 0.85,
      "stepOutBias": 0.4,
      "safePassBias": 0.8,
      "penetrationBias": 1.25,
      "boxArrivalBias": 1.45,
      "roamFreedom": 1.1,
      "aerialDuelBias": 1,
      "physicalShieldBias": 0.9,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "pressing": {
    "id": "pressing",
    "numericId": 8,
    "name": "Pressing Winger",
    "tag": "Flank Harrier",
    "icon": "🛡️",
    "description": "High-intensity pressing winger who harasses opposing fullbacks on build-up and forces immediate turnovers.",
    "archetypes": {
      "modern": "Luis Díaz",
      "legends": "Park Ji-sung"
    },
    "mechanicalEffect": "+30% pressing recovery speed; closes down rival fullbacks within 25px.",
    "bias": {
      "forwardRunBias": 1.15,
      "trackBackBias": 1.35,
      "cutInsideBias": 0.9,
      "crossBias": 0.8,
      "holdZoneY": 0.58,
      "pressTackleRadius": 1.4,
      "stepOutBias": 1.2,
      "safePassBias": 1.1,
      "penetrationBias": 0.9,
      "boxArrivalBias": 0.8,
      "roamFreedom": 0.7,
      "aerialDuelBias": 0.8,
      "physicalShieldBias": 1.1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "creator": {
    "id": "creator",
    "numericId": 9,
    "name": "Creator",
    "tag": "Visionary Architect",
    "icon": "🎨",
    "description": "Visionary playmaker who unlocks compact defensive blocks with defense-splitting through-balls.",
    "archetypes": {
      "modern": "Kevin De Bruyne",
      "legends": "Zinedine Zidane, Dennis Bergkamp"
    },
    "mechanicalEffect": "+25% through-ball lead distance; reads runner speed to deliver zero-stumble passes.",
    "bias": {
      "forwardRunBias": 1.1,
      "trackBackBias": 0.5,
      "cutInsideBias": 1.1,
      "crossBias": 0.7,
      "holdZoneY": 0.58,
      "pressTackleRadius": 0.8,
      "stepOutBias": 0.4,
      "safePassBias": 1,
      "penetrationBias": 1.55,
      "boxArrivalBias": 1,
      "roamFreedom": 1.4,
      "aerialDuelBias": 0.6,
      "physicalShieldBias": 1.1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "shadow": {
    "id": "shadow",
    "numericId": 10,
    "name": "Shadow Striker",
    "tag": "Ghost Runner",
    "icon": "👻",
    "description": "Late arriving runner who charges into the penalty box from deep to capitalize on cutbacks and rebounds.",
    "archetypes": {
      "modern": "Jude Bellingham",
      "legends": "Johan Cruyff"
    },
    "mechanicalEffect": "Timed late run into Zone 14 / penalty spot; catches defenders marking front-line forwards.",
    "bias": {
      "forwardRunBias": 1.4,
      "trackBackBias": 0.45,
      "cutInsideBias": 1.15,
      "crossBias": 0.4,
      "holdZoneY": 0.55,
      "pressTackleRadius": 0.9,
      "stepOutBias": 0.5,
      "safePassBias": 0.9,
      "penetrationBias": 1.1,
      "boxArrivalBias": 1.55,
      "roamFreedom": 1,
      "aerialDuelBias": 1.2,
      "physicalShieldBias": 1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "classic_n10": {
    "id": "classic_n10",
    "numericId": 11,
    "name": "Classic No. 10",
    "tag": "La Pausa Wizard",
    "icon": "🎩",
    "description": "Pure ball wizard; dictates tempo with pauses (la pausa), close-quarters dribbling, and impossible passes.",
    "archetypes": {
      "modern": "James Rodríguez",
      "legends": "Juan Román Riquelme, Diego Maradona"
    },
    "mechanicalEffect": "Immune to close press stumbles; draws tactical fouls; sublime chip pass trajectory.",
    "bias": {
      "forwardRunBias": 0.85,
      "trackBackBias": 0.3,
      "cutInsideBias": 1.2,
      "crossBias": 0.6,
      "holdZoneY": 0.56,
      "pressTackleRadius": 0.6,
      "stepOutBias": 0.3,
      "safePassBias": 1.3,
      "penetrationBias": 1.4,
      "boxArrivalBias": 0.85,
      "roamFreedom": 1.6,
      "aerialDuelBias": 0.5,
      "physicalShieldBias": 1.4,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "engine": {
    "id": "engine",
    "numericId": 12,
    "name": "Engine",
    "tag": "Box-to-Box Hybrid",
    "icon": "⚙️",
    "description": "Box-to-box hybrid attacking midfielder who contributes relentlessly to pressing transitions and counter-attacks.",
    "archetypes": {
      "modern": "Federico Valverde",
      "legends": "Pavel Nedvěd, Ruud Gullit"
    },
    "mechanicalEffect": "High work-rate; recovers deep then joins counter-attacks with explosive linear pace.",
    "bias": {
      "forwardRunBias": 1.25,
      "trackBackBias": 1.2,
      "cutInsideBias": 1,
      "crossBias": 0.7,
      "holdZoneY": 0.6,
      "pressTackleRadius": 1.25,
      "stepOutBias": 0.9,
      "safePassBias": 1,
      "penetrationBias": 1.1,
      "boxArrivalBias": 1.2,
      "roamFreedom": 1.1,
      "aerialDuelBias": 1.1,
      "physicalShieldBias": 1.3,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "box_to_box": {
    "id": "box_to_box",
    "numericId": 13,
    "name": "Box-to-Box",
    "tag": "Two-Box Dynamo",
    "icon": "🔄",
    "description": "Dynamic stamina engine with commanding presence in both penalty boxes; breaks play and finishes attacks.",
    "archetypes": {
      "modern": "Dominik Szoboszlai",
      "legends": "Lothar Matthäus"
    },
    "mechanicalEffect": "Surges from defensive box to opponent 18-yard area; relentless late-match motor.",
    "bias": {
      "forwardRunBias": 1.3,
      "trackBackBias": 1.35,
      "cutInsideBias": 1,
      "crossBias": 0.6,
      "holdZoneY": 0.64,
      "pressTackleRadius": 1.2,
      "stepOutBias": 0.8,
      "safePassBias": 1,
      "penetrationBias": 1.1,
      "boxArrivalBias": 1.35,
      "roamFreedom": 1.1,
      "aerialDuelBias": 1.15,
      "physicalShieldBias": 1.2,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "maestro": {
    "id": "maestro",
    "numericId": 14,
    "name": "Maestro",
    "tag": "Midfield Metronome",
    "icon": "🎼",
    "description": "Metronome who controls match tempo through short and long passing triangles; rarely loses possession.",
    "archetypes": {
      "modern": "Pedri",
      "legends": "Xavi Hernández"
    },
    "mechanicalEffect": "+15% short pass velocity; 0-turn deceleration; always available in passing triangle.",
    "bias": {
      "forwardRunBias": 0.95,
      "trackBackBias": 0.8,
      "cutInsideBias": 0.9,
      "crossBias": 0.5,
      "holdZoneY": 0.65,
      "pressTackleRadius": 0.85,
      "stepOutBias": 0.5,
      "safePassBias": 1.5,
      "penetrationBias": 1.2,
      "boxArrivalBias": 0.65,
      "roamFreedom": 1.2,
      "aerialDuelBias": 0.6,
      "physicalShieldBias": 1.3,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "runner": {
    "id": "runner",
    "numericId": 15,
    "name": "Runner",
    "tag": "Vertical Surge",
    "icon": "⚡",
    "description": "Uses intelligent vertical bursts from deep to break through defensive lines and generate numeric overloads.",
    "archetypes": {
      "modern": "Marcos Llorente",
      "legends": "Yaya Touré"
    },
    "mechanicalEffect": "Explosive third-man runs; breaks offside trap from deep midfield channels.",
    "bias": {
      "forwardRunBias": 1.45,
      "trackBackBias": 0.95,
      "cutInsideBias": 1.1,
      "crossBias": 0.6,
      "holdZoneY": 0.63,
      "pressTackleRadius": 1,
      "stepOutBias": 0.7,
      "safePassBias": 0.9,
      "penetrationBias": 1.15,
      "boxArrivalBias": 1.3,
      "roamFreedom": 1,
      "aerialDuelBias": 0.9,
      "physicalShieldBias": 1.1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "enforcer": {
    "id": "enforcer",
    "numericId": 16,
    "name": "Enforcer",
    "tag": "Physical Hammer",
    "icon": "🔨",
    "description": "Imposes physical intimidation in midfield through hard standing challenges, tactical fouls, and duel supremacy.",
    "archetypes": {
      "modern": "Casemiro",
      "legends": "Roy Keane"
    },
    "mechanicalEffect": "+20% shoulder barge mass; +15% standing tackle sweep reach; shuts down rivals.",
    "bias": {
      "forwardRunBias": 0.55,
      "trackBackBias": 1.35,
      "cutInsideBias": 0.8,
      "crossBias": 0.2,
      "holdZoneY": 0.72,
      "pressTackleRadius": 1.4,
      "stepOutBias": 1.35,
      "safePassBias": 1.1,
      "penetrationBias": 0.7,
      "boxArrivalBias": 0.3,
      "roamFreedom": 0.6,
      "aerialDuelBias": 1.3,
      "physicalShieldBias": 1.5,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "anchor": {
    "id": "anchor",
    "numericId": 17,
    "name": "Anchor",
    "tag": "Backline Shield",
    "icon": "⚓",
    "description": "Positional screen protecting the center-backs; cuts passing lanes, intercepts build-up balls, and plays safe lay-offs.",
    "archetypes": {
      "modern": "Rodri",
      "legends": "Sergio Busquets"
    },
    "mechanicalEffect": "Holds Zone 14 anchor; +20% pass lane interception radius; prevents counters.",
    "bias": {
      "forwardRunBias": 0.4,
      "trackBackBias": 1.45,
      "cutInsideBias": 0.7,
      "crossBias": 0.1,
      "holdZoneY": 0.74,
      "pressTackleRadius": 1.2,
      "stepOutBias": 0.4,
      "safePassBias": 1.4,
      "penetrationBias": 0.8,
      "boxArrivalBias": 0.15,
      "roamFreedom": 0.35,
      "aerialDuelBias": 1.2,
      "physicalShieldBias": 1.4,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "regista": {
    "id": "regista",
    "numericId": 18,
    "name": "Regista",
    "tag": "Deep Orchestrator",
    "icon": "🎻",
    "description": "Deep-lying orchestrator with zero destructive duties; commands tempo with press resistance, immaculate vision, and long switches.",
    "archetypes": {
      "modern": "Toni Kroos, Hakan Çalhanoğlu",
      "legends": "Andrea Pirlo, Xabi Alonso, Pep Guardiola"
    },
    "mechanicalEffect": "Drops between center-backs on buildup; +25% diagonal switch accuracy with backspin.",
    "bias": {
      "forwardRunBias": 0.5,
      "trackBackBias": 1.1,
      "cutInsideBias": 0.8,
      "crossBias": 0.7,
      "holdZoneY": 0.75,
      "pressTackleRadius": 0.8,
      "stepOutBias": 0.3,
      "safePassBias": 1.3,
      "penetrationBias": 1.55,
      "boxArrivalBias": 0.2,
      "roamFreedom": 1.2,
      "aerialDuelBias": 0.6,
      "physicalShieldBias": 1.35,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "defensive": {
    "id": "defensive",
    "numericId": 19,
    "name": "Defensive Fullback",
    "tag": "Lockdown Flank",
    "icon": "🔒",
    "description": "Stays deep, rarely crosses the halfway line; dedicated to locking down rival wingers 1v1.",
    "archetypes": {
      "modern": "Kyle Walker",
      "legends": "Lilian Thuram"
    },
    "mechanicalEffect": "Maintains backline shape; never caught out on breaks; shuts down outside runs.",
    "bias": {
      "forwardRunBias": 0.35,
      "trackBackBias": 1.5,
      "cutInsideBias": 0.5,
      "crossBias": 0.4,
      "holdZoneY": 0.82,
      "pressTackleRadius": 1.25,
      "stepOutBias": 0.6,
      "safePassBias": 1.3,
      "penetrationBias": 0.7,
      "boxArrivalBias": 0.05,
      "roamFreedom": 0.2,
      "aerialDuelBias": 1.1,
      "physicalShieldBias": 1.1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "inverted_fb": {
    "id": "inverted_fb",
    "numericId": 20,
    "name": "Inverted Fullback",
    "tag": "Pivot Auxiliary",
    "icon": "📐",
    "description": "Steps inside into the central midfield pivot during possession to create central passing superiority.",
    "archetypes": {
      "modern": "Pedro Porro, Trent Alexander-Arnold",
      "legends": "Philipp Lahm"
    },
    "mechanicalEffect": "Tucks inside into midfield double-pivot on possession; creates central overload.",
    "bias": {
      "forwardRunBias": 0.85,
      "trackBackBias": 1.25,
      "cutInsideBias": 1.6,
      "crossBias": 0.4,
      "holdZoneY": 0.74,
      "pressTackleRadius": 1.15,
      "stepOutBias": 0.8,
      "safePassBias": 1.35,
      "penetrationBias": 1.15,
      "boxArrivalBias": 0.4,
      "roamFreedom": 1.2,
      "aerialDuelBias": 0.7,
      "physicalShieldBias": 1.1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "attacker_fb": {
    "id": "attacker_fb",
    "numericId": 21,
    "name": "Attacking Fullback",
    "tag": "Overlapping Winger",
    "icon": "⚡",
    "description": "Aggressive overlapping fullback acting as a supplementary winger with tireless touchline stamina.",
    "archetypes": {
      "modern": "Achraf Hakimi",
      "legends": "Roberto Carlos, Cafu"
    },
    "mechanicalEffect": "Explosive touchline overlaps; provides wide crossing option on attacking breaks.",
    "bias": {
      "forwardRunBias": 1.45,
      "trackBackBias": 1.05,
      "cutInsideBias": 0.6,
      "crossBias": 1.4,
      "holdZoneY": 0.7,
      "pressTackleRadius": 1,
      "stepOutBias": 0.7,
      "safePassBias": 0.9,
      "penetrationBias": 1.1,
      "boxArrivalBias": 0.85,
      "roamFreedom": 0.9,
      "aerialDuelBias": 0.8,
      "physicalShieldBias": 1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "balanced_fb": {
    "id": "balanced_fb",
    "numericId": 22,
    "name": "Balanced Fullback",
    "tag": "Two-Way Master",
    "icon": "⚖️",
    "description": "Reliable two-way fullback who provides defensive security while timing forward support runs.",
    "archetypes": {
      "modern": "Andrew Robertson",
      "legends": "Paolo Maldini"
    },
    "mechanicalEffect": "Smooth transitions between 4-man rest defense and wide support triangles.",
    "bias": {
      "forwardRunBias": 0.9,
      "trackBackBias": 1.35,
      "cutInsideBias": 0.8,
      "crossBias": 0.9,
      "holdZoneY": 0.78,
      "pressTackleRadius": 1.15,
      "stepOutBias": 0.6,
      "safePassBias": 1.1,
      "penetrationBias": 0.95,
      "boxArrivalBias": 0.35,
      "roamFreedom": 0.6,
      "aerialDuelBias": 1,
      "physicalShieldBias": 1.1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "destroyer": {
    "id": "destroyer",
    "numericId": 23,
    "name": "Destroyer",
    "tag": "Crunch Stopper",
    "icon": "💥",
    "description": "Aggressive, physical stopper who steps out of the defensive line to crunch tackles and dominate strikers.",
    "archetypes": {
      "modern": "Antonio Rüdiger",
      "legends": "Nemanja Vidić"
    },
    "mechanicalEffect": "Steps forward 20px to break dribbles; +20% clean tackle win rate in duels.",
    "bias": {
      "forwardRunBias": 0.2,
      "trackBackBias": 1.45,
      "cutInsideBias": 0.5,
      "crossBias": 0.1,
      "holdZoneY": 0.83,
      "pressTackleRadius": 1.35,
      "stepOutBias": 1.4,
      "safePassBias": 1,
      "penetrationBias": 0.6,
      "boxArrivalBias": 0.1,
      "roamFreedom": 0.4,
      "aerialDuelBias": 1.45,
      "physicalShieldBias": 1.4,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "distributor": {
    "id": "distributor",
    "numericId": 24,
    "name": "Distributor",
    "tag": "Composed Passer",
    "icon": "🛡️",
    "description": "Composed center-back who calmly breaks lines with crisp ground passes out from the back.",
    "archetypes": {
      "modern": "William Saliba",
      "legends": "Franco Baresi"
    },
    "mechanicalEffect": "Immune to press panic; splits midfield lines with 12px/f ground distribution.",
    "bias": {
      "forwardRunBias": 0.25,
      "trackBackBias": 1.45,
      "cutInsideBias": 0.5,
      "crossBias": 0.2,
      "holdZoneY": 0.85,
      "pressTackleRadius": 1,
      "stepOutBias": 0.6,
      "safePassBias": 1.45,
      "penetrationBias": 1.15,
      "boxArrivalBias": 0.05,
      "roamFreedom": 0.5,
      "aerialDuelBias": 1.15,
      "physicalShieldBias": 1.2,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "playmaker": {
    "id": "playmaker",
    "numericId": 25,
    "name": "Playmaker CB",
    "tag": "Deep Ball Striker",
    "icon": "📡",
    "description": "Visionary defender equipped with long-range diagonal passing to initiate rapid counter-attacks.",
    "archetypes": {
      "modern": "Virgil van Dijk",
      "legends": "Franz Beckenbauer, Ronald Koeman"
    },
    "mechanicalEffect": "+25% long ball velocity; hits 600px diagonal switches right onto winger cleats.",
    "bias": {
      "forwardRunBias": 0.35,
      "trackBackBias": 1.35,
      "cutInsideBias": 0.6,
      "crossBias": 0.3,
      "holdZoneY": 0.84,
      "pressTackleRadius": 0.95,
      "stepOutBias": 0.7,
      "safePassBias": 1.1,
      "penetrationBias": 1.5,
      "boxArrivalBias": 0.15,
      "roamFreedom": 0.8,
      "aerialDuelBias": 1.2,
      "physicalShieldBias": 1.25,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "stopper": {
    "id": "stopper",
    "numericId": 26,
    "name": "Stopper",
    "tag": "Positioning Wall",
    "icon": "🧱",
    "description": "Elite reader of the game; relies on immaculate positioning, anticipation, and clean challenges.",
    "archetypes": {
      "modern": "Gabriel Magalhães",
      "legends": "Fabio Cannavaro"
    },
    "mechanicalEffect": "Near-zero foul attribution; positions perfectly to block shots and cut passes.",
    "bias": {
      "forwardRunBias": 0.15,
      "trackBackBias": 1.55,
      "cutInsideBias": 0.5,
      "crossBias": 0.1,
      "holdZoneY": 0.86,
      "pressTackleRadius": 1.15,
      "stepOutBias": 0.5,
      "safePassBias": 1.2,
      "penetrationBias": 0.8,
      "boxArrivalBias": 0.05,
      "roamFreedom": 0.25,
      "aerialDuelBias": 1.4,
      "physicalShieldBias": 1.3,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "sweeper_cb": {
    "id": "sweeper_cb",
    "numericId": 27,
    "name": "Libero / Sweeper",
    "tag": "Covering Sweeper",
    "icon": "🧹",
    "description": "Sweeps behind defensive line off the ball, and steps forward into central midfield with the ball.",
    "archetypes": {
      "modern": "John Stones",
      "legends": "Franz Beckenbauer, Ronald Koeman, Matthias Sammer"
    },
    "mechanicalEffect": "Drops 15px deeper to collect through-balls; steps into midfield pivot in possession.",
    "bias": {
      "forwardRunBias": 0.65,
      "trackBackBias": 1.4,
      "cutInsideBias": 0.8,
      "crossBias": 0.3,
      "holdZoneY": 0.89,
      "pressTackleRadius": 1.05,
      "stepOutBias": 0.9,
      "safePassBias": 1.3,
      "penetrationBias": 1.3,
      "boxArrivalBias": 0.2,
      "roamFreedom": 1.3,
      "aerialDuelBias": 1.25,
      "physicalShieldBias": 1.3,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  },
  "balanced_gk": {
    "id": "balanced_gk",
    "numericId": 28,
    "name": "Balanced Goalkeeper",
    "tag": "Consistent Guardian",
    "icon": "🧤",
    "description": "All-round goalkeeper with consistent handling, positioning, and reliable counter-attack distribution.",
    "archetypes": {
      "modern": "Thibaut Courtois",
      "legends": "Iker Casillas, Dino Zoff"
    },
    "mechanicalEffect": "Balanced dive coverage and steady distribution throws to fullbacks.",
    "bias": {
      "forwardRunBias": 0,
      "trackBackBias": 1,
      "cutInsideBias": 0,
      "crossBias": 0,
      "holdZoneY": 0.96,
      "pressTackleRadius": 1,
      "stepOutBias": 0.4,
      "safePassBias": 1.1,
      "penetrationBias": 0.9,
      "boxArrivalBias": 0,
      "roamFreedom": 0.1,
      "aerialDuelBias": 1,
      "physicalShieldBias": 1,
      "sweeperRushDistance": 160,
      "wallLineAnchor": 0.95
    }
  },
  "sweeper": {
    "id": "sweeper",
    "numericId": 29,
    "name": "Sweeper Keeper",
    "tag": "11th Outfield Player",
    "icon": "⚡",
    "description": "Acts as an eleventh outfield player; steps 15–20 yards outside the box to clear through-balls with feet.",
    "archetypes": {
      "modern": "Manuel Neuer, Alisson, Ederson",
      "legends": "Lev Yashin, René Higuita"
    },
    "mechanicalEffect": "Holds line 250px up pitch; rushes to clear through-balls before attackers reach them.",
    "bias": {
      "forwardRunBias": 0,
      "trackBackBias": 1,
      "cutInsideBias": 0,
      "crossBias": 0,
      "holdZoneY": 0.91,
      "pressTackleRadius": 1.2,
      "stepOutBias": 1.4,
      "safePassBias": 1.25,
      "penetrationBias": 1.2,
      "boxArrivalBias": 0,
      "roamFreedom": 0.4,
      "aerialDuelBias": 1.15,
      "physicalShieldBias": 1.1,
      "sweeperRushDistance": 270,
      "wallLineAnchor": 0.7
    }
  },
  "wall": {
    "id": "wall",
    "numericId": 30,
    "name": "Wall Shot-Stopper",
    "tag": "Goal Mouth Titan",
    "icon": "🏰",
    "description": "Pure shot-stopper who dominates the goal mouth; unbeatable on reflex saves and close-range strikes.",
    "archetypes": {
      "modern": "Emiliano Martínez",
      "legends": "Oliver Kahn, Peter Schmeichel"
    },
    "mechanicalEffect": "Anchors on the goal line; +15px diving reach bonus on rocket strikes and postage stamps.",
    "bias": {
      "forwardRunBias": 0,
      "trackBackBias": 1,
      "cutInsideBias": 0,
      "crossBias": 0,
      "holdZoneY": 0.97,
      "pressTackleRadius": 0.85,
      "stepOutBias": 0.2,
      "safePassBias": 1,
      "penetrationBias": 0.8,
      "boxArrivalBias": 0,
      "roamFreedom": 0.05,
      "aerialDuelBias": 0.95,
      "physicalShieldBias": 1,
      "sweeperRushDistance": 110,
      "wallLineAnchor": 1.25
    }
  },
  "basic": {
    "id": "basic",
    "numericId": 31,
    "name": "Basic",
    "tag": "Positional Baseline",
    "icon": "⚽",
    "description": "Standard tactical execution with zero qualitative behavioral alterations, operating purely on baseline attributes.",
    "archetypes": {
      "modern": "Tactical Flex",
      "legends": "Versatile Squad Player"
    },
    "mechanicalEffect": "Neutral 1.0x behavioral multipliers; operates on baseline canonical attributes and tactical formation anchors.",
    "bias": {
      "forwardRunBias": 1,
      "trackBackBias": 1,
      "cutInsideBias": 1,
      "crossBias": 1,
      "holdZoneY": 0.65,
      "pressTackleRadius": 1,
      "stepOutBias": 1,
      "safePassBias": 1,
      "penetrationBias": 1,
      "boxArrivalBias": 1,
      "roamFreedom": 1,
      "aerialDuelBias": 1,
      "physicalShieldBias": 1,
      "sweeperRushDistance": 0,
      "wallLineAnchor": 0
    }
  }
};

export interface DefaultSlotPlaystyle {
  role: PlayerRole;
  primary: PrimaryPosition;
  subPos: SubPosition;
  playstyle: PlayerPlaystyle;
}

export const HOME_PLAYER_PLAYSTYLES: Record<PlayerRole, DefaultSlotPlaystyle> = {
  "GK": {
    "role": "GK",
    "primary": "GK",
    "subPos": "GK",
    "playstyle": "wall"
  },
  "LB": {
    "role": "LB",
    "primary": "DEF",
    "subPos": "LB",
    "playstyle": "balanced_fb"
  },
  "CB1": {
    "role": "CB1",
    "primary": "DEF",
    "subPos": "CB",
    "playstyle": "stopper"
  },
  "CB2": {
    "role": "CB2",
    "primary": "DEF",
    "subPos": "LIB",
    "playstyle": "playmaker"
  },
  "RB": {
    "role": "RB",
    "primary": "DEF",
    "subPos": "RWB",
    "playstyle": "attacker_fb"
  },
  "LM": {
    "role": "LM",
    "primary": "MID",
    "subPos": "LM",
    "playstyle": "traditional"
  },
  "CM1": {
    "role": "CM1",
    "primary": "MID",
    "subPos": "CM",
    "playstyle": "box_to_box"
  },
  "CM2": {
    "role": "CM2",
    "primary": "MID",
    "subPos": "CAM",
    "playstyle": "engine"
  },
  "RM": {
    "role": "RM",
    "primary": "MID",
    "subPos": "CAM",
    "playstyle": "classic_n10"
  },
  "ST1": {
    "role": "ST1",
    "primary": "ATT",
    "subPos": "SS",
    "playstyle": "classic_n10"
  },
  "ST2": {
    "role": "ST2",
    "primary": "ATT",
    "subPos": "ST",
    "playstyle": "complete"
  }
};

export const AWAY_PLAYER_PLAYSTYLES: Record<PlayerRole, DefaultSlotPlaystyle> = {
  "GK": {
    "role": "GK",
    "primary": "GK",
    "subPos": "GK",
    "playstyle": "balanced_gk"
  },
  "RB": {
    "role": "RB",
    "primary": "DEF",
    "subPos": "RB",
    "playstyle": "inverted_fb"
  },
  "CB1": {
    "role": "CB1",
    "primary": "DEF",
    "subPos": "LIB",
    "playstyle": "distributor"
  },
  "CB2": {
    "role": "CB2",
    "primary": "DEF",
    "subPos": "CB",
    "playstyle": "destroyer"
  },
  "LB": {
    "role": "LB",
    "primary": "DEF",
    "subPos": "LB",
    "playstyle": "attacker_fb"
  },
  "RM": {
    "role": "RM",
    "primary": "MID",
    "subPos": "RM",
    "playstyle": "classic_n10"
  },
  "CM1": {
    "role": "CM1",
    "primary": "MID",
    "subPos": "CDM",
    "playstyle": "anchor"
  },
  "CM2": {
    "role": "CM2",
    "primary": "MID",
    "subPos": "CAM",
    "playstyle": "creator"
  },
  "LM": {
    "role": "LM",
    "primary": "ATT",
    "subPos": "LW",
    "playstyle": "prolific"
  },
  "ST1": {
    "role": "ST1",
    "primary": "ATT",
    "subPos": "ST",
    "playstyle": "poacher"
  },
  "ST2": {
    "role": "ST2",
    "primary": "ATT",
    "subPos": "SS",
    "playstyle": "shadow"
  }
};

export function resolveSubPositionForSlot(role: PlayerRole, formation: FormationName): SubPosition {
  if (role === 'GK') return 'GK';
  switch (formation) {
    case '4-3-3':
      if (role === 'LB') return 'LB';
      if (role === 'CB1' || role === 'CB2') return 'CB';
      if (role === 'RB') return 'RB';
      if (role === 'CM1') return 'CDM';
      if (role === 'CM2' || role === 'RM') return 'CM';
      if (role === 'LM') return 'LW';
      if (role === 'ST1') return 'ST';
      if (role === 'ST2') return 'RW';
      break;
    case '4-2-3-1':
      if (role === 'LB') return 'LB';
      if (role === 'CB1' || role === 'CB2') return 'CB';
      if (role === 'RB') return 'RB';
      if (role === 'CM1' || role === 'CM2') return 'CDM';
      if (role === 'LM') return 'LM';
      if (role === 'RM') return 'RM';
      if (role === 'ST2') return 'CAM';
      if (role === 'ST1') return 'ST';
      break;
    case '3-5-2':
      if (role === 'LB' || role === 'CB1' || role === 'CB2') return 'CB';
      if (role === 'RB') return 'LWB';
      if (role === 'LM') return 'RWB';
      if (role === 'CM1' || role === 'RM') return 'CM';
      if (role === 'CM2') return 'CDM';
      if (role === 'ST1') return 'ST';
      if (role === 'ST2') return 'SS';
      break;
    case '3-4-3-diamond':
      if (role === 'LB' || role === 'CB1' || role === 'CB2') return 'CB';
      if (role === 'CM1') return 'CDM';
      if (role === 'RB') return 'LM';
      if (role === 'RM') return 'RM';
      if (role === 'CM2') return 'CAM';
      if (role === 'LM') return 'LW';
      if (role === 'ST1') return 'ST';
      if (role === 'ST2') return 'RW';
      break;
    case '3-4-3':
      if (role === 'LB' || role === 'CB1' || role === 'CB2') return 'CB';
      if (role === 'RB') return 'LM';
      if (role === 'CM1' || role === 'CM2') return 'CM';
      if (role === 'RM') return 'RM';
      if (role === 'LM') return 'LW';
      if (role === 'ST1') return 'ST';
      if (role === 'ST2') return 'RW';
      break;
    case '5-3-2':
      if (role === 'LB') return 'LWB';
      if (role === 'CB1' || role === 'CB2' || role === 'RB') return 'CB';
      if (role === 'LM') return 'RWB';
      if (role === 'CM1' || role === 'RM') return 'CM';
      if (role === 'CM2') return 'CDM';
      if (role === 'ST1') return 'ST';
      if (role === 'ST2') return 'SS';
      break;
    case '5-4-1':
      if (role === 'LB') return 'LWB';
      if (role === 'CB1' || role === 'CB2' || role === 'RB') return 'CB';
      if (role === 'LM') return 'RWB';
      if (role === 'CM1' || role === 'CM2') return 'CM';
      if (role === 'RM') return 'LM';
      if (role === 'ST2') return 'RM';
      if (role === 'ST1') return 'ST';
      break;
    case '4-5-1':
      if (role === 'LB') return 'LB';
      if (role === 'CB1' || role === 'CB2') return 'CB';
      if (role === 'RB') return 'RB';
      if (role === 'LM') return 'LM';
      if (role === 'CM1' || role === 'RM') return 'CM';
      if (role === 'CM2') return 'CDM';
      if (role === 'ST2') return 'RM';
      if (role === 'ST1') return 'ST';
      break;
    default:
      if (role === 'LB') return 'LB';
      if (role === 'CB1' || role === 'CB2') return 'CB';
      if (role === 'RB') return 'RB';
      if (role === 'LM') return 'LM';
      if (role === 'CM1' || role === 'CM2') return 'CM';
      if (role === 'RM') return 'RM';
      if (role === 'ST1') return 'SS';
      if (role === 'ST2') return 'ST';
      break;
  }
  return 'CM';
}

export function getAllowedPlaystylesForSubPosition(subPos: SubPosition): PlayerPlaystyle[] {
  return SUB_POSITION_DEFINITIONS[subPos]?.allowedPlaystyles || ['basic'];
}

export function applyPositionalHierarchyToPlayer(
  player: Player,
  formation: FormationName,
  overridePlaystyle?: PlayerPlaystyle
): void {
  const defaultMeta =
    player.team === 'home' ? HOME_PLAYER_PLAYSTYLES[player.role] : AWAY_PLAYER_PLAYSTYLES[player.role];
  const slotSubPos = resolveSubPositionForSlot(player.role, formation);
  const subPos: SubPosition = player.subPos || defaultMeta?.subPos || slotSubPos;
  const subMeta = SUB_POSITION_DEFINITIONS[subPos] || SUB_POSITION_DEFINITIONS[slotSubPos] || SUB_POSITION_DEFINITIONS.CM;

  player.primaryPos = subMeta.primary;
  player.primaryPosId = subMeta.primaryId;
  player.subPos = subPos;
  player.subPosId = subMeta.numericId;

  if (!player.intrinsicPlaystyle) {
    player.intrinsicPlaystyle =
      overridePlaystyle || player.playstyle || defaultMeta?.playstyle || subMeta.allowedPlaystyles[0];
  }
  const desired = overridePlaystyle || player.intrinsicPlaystyle;
  const effective = resolveEffectivePlaystyle(desired, subPos);
  const def = PLAYSTYLE_DEFINITIONS_DETAILED[effective] || PLAYSTYLE_DEFINITIONS_DETAILED.basic;
  player.playstyle = effective;
  player.playstyleId = def ? def.numericId : PLAYSTYLE_ID.BASIC;
  player.playstyleName = def ? def.name : 'Basic';
}

export function getPlaystyleBias(playstyleId?: number): PlaystyleBias {
  if (playstyleId !== undefined && PLAYSTYLE_BIASES[playstyleId]) {
    return PLAYSTYLE_BIASES[playstyleId];
  }
  return PLAYSTYLE_BIASES[PLAYSTYLE_ID.BALANCED_FB];
}
