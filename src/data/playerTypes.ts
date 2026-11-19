import { OutfieldDetailedStats, PlayerStats } from '../types';
import { calculateThreeStatGroupValue } from '../utils/statCalculations';

export type PlayerTypeId =
  | 'speedster'
  | 'tank'
  | 'flair'
  | 'architect'
  | 'ice_cold'
  | 'patient'
  | 'wasted_talent'
  | 'cannon';

export type StatDevelopmentState = 'natural' | 'skillful' | 'normal' | 'poor' | 'weakness';

export interface StatDevelopmentStateInfo {
  state: StatDevelopmentState;
  label: string;
  badge: string;
  yearlyBonus: number; // +2 for natural, +1 for skillful, 0 otherwise
  costMultiplier: number; // 1.0 for natural/skillful/normal, 1.05 for poor, 1.10 for weakness
  description: string;
}

export const STAT_DEV_STATE_CONFIG: Record<StatDevelopmentState, StatDevelopmentStateInfo> = {
  natural: {
    state: 'natural',
    label: 'Natural',
    badge: '🌟 NATURAL (+2/YR)',
    yearlyBonus: 2,
    costMultiplier: 1.0,
    description: 'Effortless genetic instinct. Gains +2 attribute points automatically each year.',
  },
  skillful: {
    state: 'skillful',
    label: 'Skillful',
    badge: '⚡ SKILLFUL (+1/YR)',
    yearlyBonus: 1,
    costMultiplier: 1.0,
    description: 'High developmental affinity. Gains +1 attribute point automatically each year.',
  },
  normal: {
    state: 'normal',
    label: 'Normal',
    badge: '⚪ NORMAL',
    yearlyBonus: 0,
    costMultiplier: 1.0,
    description: 'Standard baseline development without yearly bonuses or training penalties.',
  },
  poor: {
    state: 'poor',
    label: 'Poor',
    badge: '⚠️ POOR (+5% COST)',
    yearlyBonus: 0,
    costMultiplier: 1.05,
    description: 'Learning resistance. Requires 5% more stat points to advance to the next level.',
  },
  weakness: {
    state: 'weakness',
    label: 'Weakness',
    badge: '❌ WEAKNESS (+10% COST)',
    yearlyBonus: 0,
    costMultiplier: 1.10,
    description: 'Core physiological/tactical liability. Requires 10% more stat points to advance.',
  },
};

export interface StatHighlight {
  key: keyof OutfieldDetailedStats;
  label: string;
  category: 'PHY' | 'PRO' | 'CRE' | 'GOA' | 'DEF' | 'MEN';
  value: number;
}

export interface PlayerTypeProfile {
  categoryRatings: {
    PRO: 'Supreme' | 'Elite' | 'High' | 'Solid' | 'Moderate' | 'Low';
    GOA: 'Supreme' | 'Elite' | 'High' | 'Solid' | 'Moderate' | 'Low';
    CRE: 'Supreme' | 'Elite' | 'High' | 'Solid' | 'Moderate' | 'Low';
    DEF: 'Supreme' | 'Elite' | 'High' | 'Solid' | 'Moderate' | 'Low';
    PHY: 'Supreme' | 'Elite' | 'High' | 'Solid' | 'Moderate' | 'Low';
    MEN: 'Supreme' | 'Elite' | 'High' | 'Solid' | 'Moderate' | 'Low';
  };
  summary: string;
}

export interface PlayerTypeTheme {
  primaryColor: string;
  accentColor: string;
  borderGlow: string;
  bgGradient: string;
  badgeBg: string;
  iconBg: string;
  textColor: string;
  glowShadow: string;
  cardPattern: 'speed_lines' | 'armor_mesh' | 'geometric_kaleido' | 'compass_grid' | 'ice_frost' | 'shield_matrix' | 'neon_sparks' | 'blast_waves';
}

export interface PlayerTypeDefinition {
  id: PlayerTypeId;
  name: string;
  badge: string;
  subtitle: string;
  archetypeRole: string;
  tagline: string;
  description: string;
  conductWarning?: string;
  startingBadRepTier?: number;
  detailedStats: OutfieldDetailedStats;
  statDevelopmentMatrix: Record<keyof OutfieldDetailedStats, StatDevelopmentState>;
  primaryStrengths: StatHighlight[];
  secondaryStrengths: StatHighlight[];
  weaknesses: StatHighlight[];
  yearlyBonusStatKeys: (keyof OutfieldDetailedStats)[];
  profile: PlayerTypeProfile;
  theme: PlayerTypeTheme;
}

export const PLAYER_TYPES: Record<PlayerTypeId, PlayerTypeDefinition> = {
  speedster: {
    id: 'speedster',
    name: 'Speedster',
    badge: '⚡ VELOCITY',
    subtitle: 'Lightning Pace & Explosive Burst',
    archetypeRole: 'Pure Kinetic Engine',
    tagline: 'Outrunning defensive lines before they can even set their shape.',
    description:
      'Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space.',
    detailedStats: {
      // PHY (165)
      pace: 90,
      stamina: 55,
      strength: 20,
      // PRO (155)
      ballControl: 50,
      retention: 40,
      dribbling: 65,
      // CRE (125)
      shortPass: 45,
      longPass: 35,
      crossing: 45,
      // GOA (95)
      shooting: 45,
      heading: 15,
      longShots: 35,
      // DEF (50)
      tackling: 15,
      marking: 20,
      interceptions: 15,
      // MEN (135)
      positioning: 40,
      composure: 35,
      reactions: 60,
    },
    statDevelopmentMatrix: {
      pace: 'natural',
      dribbling: 'natural',
      reactions: 'skillful',
      stamina: 'skillful',
      ballControl: 'skillful',
      shooting: 'normal',
      crossing: 'normal',
      shortPass: 'normal',
      positioning: 'normal',
      composure: 'normal',
      retention: 'normal',
      longPass: 'poor',
      longShots: 'poor',
      marking: 'poor',
      strength: 'weakness',
      heading: 'weakness',
      tackling: 'weakness',
      interceptions: 'weakness',
    },
    yearlyBonusStatKeys: ['pace', 'dribbling', 'reactions'],
    primaryStrengths: [
      { key: 'pace', label: 'Pace', category: 'PHY', value: 90 },
      { key: 'dribbling', label: 'Dribbling', category: 'PRO', value: 65 },
      { key: 'reactions', label: 'Reactions', category: 'MEN', value: 60 },
    ],
    secondaryStrengths: [
      { key: 'stamina', label: 'Stamina', category: 'PHY', value: 55 },
      { key: 'ballControl', label: 'Ball Control', category: 'PRO', value: 50 },
      { key: 'shortPass', label: 'Short Passing', category: 'CRE', value: 45 },
    ],
    weaknesses: [
      { key: 'strength', label: 'Strength', category: 'PHY', value: 20 },
      { key: 'heading', label: 'Heading', category: 'GOA', value: 15 },
      { key: 'tackling', label: 'Tackling', category: 'DEF', value: 15 },
      { key: 'interceptions', label: 'Interceptions', category: 'DEF', value: 15 },
    ],
    profile: {
      categoryRatings: {
        PHY: 'Supreme',
        PRO: 'High',
        CRE: 'Solid',
        MEN: 'Solid',
        GOA: 'Moderate',
        DEF: 'Low',
      },
      summary: 'Extreme physical speed with elite transitional counter-attacking threat.',
    },
    theme: {
      primaryColor: '#f59e0b',
      accentColor: '#fbbf24',
      borderGlow: 'border-amber-400/80 shadow-amber-500/30',
      bgGradient: 'from-amber-950/80 via-slate-900 to-yellow-950/70',
      badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-400/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
      textColor: 'text-amber-400',
      glowShadow: 'shadow-[0_0_35px_rgba(245,158,11,0.35)]',
      cardPattern: 'speed_lines',
    },
  },

  tank: {
    id: 'tank',
    name: 'Tank',
    badge: '🛡️ COLOSSUS',
    subtitle: 'Physical Powerhouse & Aerial Juggernaut',
    archetypeRole: 'Immovable Force',
    tagline: 'Dominating physical duels, aerial battles, and defensive collisions.',
    description:
      'A commanding physical presence who overpowers adversaries in shoulder-to-shoulder contests, wins every ball in the air, and anchors defensive or offensive duels with sheer raw strength.',
    detailedStats: {
      // PHY (183)
      pace: 35,
      stamina: 60,
      strength: 88,
      // PRO (75)
      ballControl: 35,
      retention: 20,
      dribbling: 20,
      // CRE (75)
      shortPass: 35,
      longPass: 25,
      crossing: 15,
      // GOA (157)
      shooting: 50,
      heading: 72,
      longShots: 35,
      // DEF (160)
      tackling: 60,
      marking: 55,
      interceptions: 45,
      // MEN (75)
      positioning: 25,
      composure: 25,
      reactions: 25,
    },
    statDevelopmentMatrix: {
      strength: 'natural',
      heading: 'natural',
      tackling: 'skillful',
      marking: 'skillful',
      stamina: 'skillful',
      shooting: 'normal',
      interceptions: 'normal',
      ballControl: 'normal',
      shortPass: 'normal',
      positioning: 'normal',
      reactions: 'normal',
      pace: 'poor',
      longShots: 'poor',
      composure: 'poor',
      dribbling: 'weakness',
      retention: 'weakness',
      crossing: 'weakness',
      longPass: 'weakness',
    },
    yearlyBonusStatKeys: ['strength', 'heading', 'tackling'],
    primaryStrengths: [
      { key: 'strength', label: 'Strength', category: 'PHY', value: 88 },
      { key: 'heading', label: 'Heading', category: 'GOA', value: 72 },
      { key: 'tackling', label: 'Tackling', category: 'DEF', value: 60 },
    ],
    secondaryStrengths: [
      { key: 'stamina', label: 'Stamina', category: 'PHY', value: 60 },
      { key: 'marking', label: 'Marking', category: 'DEF', value: 55 },
      { key: 'shooting', label: 'Shooting', category: 'GOA', value: 50 },
    ],
    weaknesses: [
      { key: 'dribbling', label: 'Dribbling', category: 'PRO', value: 20 },
      { key: 'retention', label: 'Retention', category: 'PRO', value: 20 },
      { key: 'crossing', label: 'Crossing', category: 'CRE', value: 15 },
      { key: 'longPass', label: 'Long Passing', category: 'CRE', value: 25 },
    ],
    profile: {
      categoryRatings: {
        PHY: 'Supreme',
        DEF: 'Elite',
        GOA: 'High',
        CRE: 'Moderate',
        PRO: 'Low',
        MEN: 'Low',
      },
      summary: 'Mammoth physical strength with dominant aerial presence and tackling power.',
    },
    theme: {
      primaryColor: '#e11d48',
      accentColor: '#f43f5e',
      borderGlow: 'border-rose-500/80 shadow-rose-600/30',
      bgGradient: 'from-rose-950/80 via-slate-900 to-red-950/70',
      badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-400/40',
      iconBg: 'bg-rose-500/20 text-rose-400',
      textColor: 'text-rose-400',
      glowShadow: 'shadow-[0_0_35px_rgba(225,29,72,0.35)]',
      cardPattern: 'armor_mesh',
    },
  },

  flair: {
    id: 'flair',
    name: 'Flair',
    badge: '✨ MAGICIAN',
    subtitle: 'Street Magician & Master Dribbler',
    archetypeRole: 'Samba Virtuoso',
    tagline: 'Mesmerizing defenders with close control, elastis, and feints in tight spaces.',
    description:
      'Blessed with supernatural close touch and effortless improvisation. The Flair archetype dances out of tight traps, manipulates defenders off-balance, and keeps the ball glued to their boots under heavy pressure.',
    detailedStats: {
      // PHY (115)
      pace: 55,
      stamina: 40,
      strength: 20,
      // PRO (243)
      ballControl: 80,
      retention: 75,
      dribbling: 88,
      // CRE (130)
      shortPass: 50,
      longPass: 35,
      crossing: 45,
      // GOA (97)
      shooting: 45,
      heading: 12,
      longShots: 40,
      // DEF (45)
      tackling: 15,
      marking: 15,
      interceptions: 15,
      // MEN (95)
      positioning: 25,
      composure: 55,
      reactions: 15,
    },
    statDevelopmentMatrix: {
      dribbling: 'natural',
      ballControl: 'natural',
      retention: 'skillful',
      shortPass: 'skillful',
      composure: 'skillful',
      pace: 'normal',
      shooting: 'normal',
      longShots: 'normal',
      crossing: 'normal',
      longPass: 'normal',
      reactions: 'normal',
      stamina: 'poor',
      positioning: 'poor',
      strength: 'weakness',
      tackling: 'weakness',
      marking: 'weakness',
      interceptions: 'weakness',
      heading: 'weakness',
    },
    yearlyBonusStatKeys: ['dribbling', 'ballControl', 'retention'],
    primaryStrengths: [
      { key: 'dribbling', label: 'Dribbling', category: 'PRO', value: 88 },
      { key: 'ballControl', label: 'Ball Control', category: 'PRO', value: 80 },
      { key: 'retention', label: 'Retention', category: 'PRO', value: 75 },
    ],
    secondaryStrengths: [
      { key: 'pace', label: 'Pace', category: 'PHY', value: 55 },
      { key: 'composure', label: 'Composure', category: 'MEN', value: 55 },
      { key: 'shortPass', label: 'Short Passing', category: 'CRE', value: 50 },
    ],
    weaknesses: [
      { key: 'heading', label: 'Heading', category: 'GOA', value: 12 },
      { key: 'strength', label: 'Strength', category: 'PHY', value: 20 },
      { key: 'tackling', label: 'Tackling', category: 'DEF', value: 15 },
      { key: 'marking', label: 'Marking', category: 'DEF', value: 15 },
      { key: 'interceptions', label: 'Interceptions', category: 'DEF', value: 15 },
    ],
    profile: {
      categoryRatings: {
        PRO: 'Supreme',
        CRE: 'High',
        PHY: 'Solid',
        MEN: 'Solid',
        GOA: 'Moderate',
        DEF: 'Low',
      },
      summary: 'Incredible ball wizardry and progression mastery with flair and finesse.',
    },
    theme: {
      primaryColor: '#a855f7',
      accentColor: '#c084fc',
      borderGlow: 'border-purple-500/80 shadow-purple-600/30',
      bgGradient: 'from-purple-950/80 via-slate-900 to-fuchsia-950/70',
      badgeBg: 'bg-purple-500/20 text-purple-300 border border-purple-400/40',
      iconBg: 'bg-purple-500/20 text-purple-400',
      textColor: 'text-purple-400',
      glowShadow: 'shadow-[0_0_35px_rgba(168,85,247,0.35)]',
      cardPattern: 'geometric_kaleido',
    },
  },

  architect: {
    id: 'architect',
    name: 'Architect',
    badge: '📐 MAESTRO',
    subtitle: 'Tactical Maestro & Visionary Playmaker',
    archetypeRole: 'Metronome Conductor',
    tagline: 'Dictating the match tempo with surgical line-breaking passes and spatial geometry.',
    description:
      'A chess master with high footballing IQ. The Architect sees passing angles before they develop, threading pinpoint diagonal switches, through balls, and controlling the tempo from any sector on the pitch.',
    detailedStats: {
      // PHY (95)
      pace: 25,
      stamina: 45,
      strength: 25,
      // PRO (160)
      ballControl: 65,
      retention: 55,
      dribbling: 40,
      // CRE (222)
      shortPass: 82,
      longPass: 80,
      crossing: 60,
      // GOA (100)
      shooting: 40,
      heading: 15,
      longShots: 45,
      // DEF (80)
      tackling: 20,
      marking: 25,
      interceptions: 35,
      // MEN (168)
      positioning: 70,
      composure: 60,
      reactions: 38,
    },
    statDevelopmentMatrix: {
      shortPass: 'natural',
      longPass: 'natural',
      positioning: 'skillful',
      composure: 'skillful',
      crossing: 'skillful',
      ballControl: 'normal',
      retention: 'normal',
      longShots: 'normal',
      reactions: 'normal',
      stamina: 'normal',
      interceptions: 'normal',
      dribbling: 'poor',
      shooting: 'poor',
      marking: 'poor',
      pace: 'weakness',
      strength: 'weakness',
      tackling: 'weakness',
      heading: 'weakness',
    },
    yearlyBonusStatKeys: ['shortPass', 'longPass', 'positioning'],
    primaryStrengths: [
      { key: 'shortPass', label: 'Short Passing', category: 'CRE', value: 82 },
      { key: 'longPass', label: 'Long Passing', category: 'CRE', value: 80 },
      { key: 'positioning', label: 'Positioning', category: 'MEN', value: 70 },
    ],
    secondaryStrengths: [
      { key: 'ballControl', label: 'Ball Control', category: 'PRO', value: 65 },
      { key: 'crossing', label: 'Crossing', category: 'CRE', value: 60 },
      { key: 'composure', label: 'Composure', category: 'MEN', value: 60 },
    ],
    weaknesses: [
      { key: 'pace', label: 'Pace', category: 'PHY', value: 25 },
      { key: 'strength', label: 'Strength', category: 'PHY', value: 25 },
      { key: 'heading', label: 'Heading', category: 'GOA', value: 15 },
      { key: 'tackling', label: 'Tackling', category: 'DEF', value: 20 },
    ],
    profile: {
      categoryRatings: {
        CRE: 'Supreme',
        MEN: 'Elite',
        PRO: 'High',
        GOA: 'Solid',
        DEF: 'Moderate',
        PHY: 'Low',
      },
      summary: 'Peerless vision and pinpoint passing range to unlock any defensive block.',
    },
    theme: {
      primaryColor: '#0ea5e9',
      accentColor: '#38bdf8',
      borderGlow: 'border-sky-400/80 shadow-sky-500/30',
      bgGradient: 'from-sky-950/80 via-slate-900 to-cyan-950/70',
      badgeBg: 'bg-sky-500/20 text-sky-300 border border-sky-400/40',
      iconBg: 'bg-sky-500/20 text-sky-400',
      textColor: 'text-sky-400',
      glowShadow: 'shadow-[0_0_35px_rgba(14,165,233,0.35)]',
      cardPattern: 'compass_grid',
    },
  },

  ice_cold: {
    id: 'ice_cold',
    name: 'Ice-Cold',
    badge: '❄️ FINISHER',
    subtitle: 'Ruthless Lethality & Clutch Composure',
    archetypeRole: 'Apex Assassin',
    tagline: 'Zero heartbeat in the penalty box; clinical execution when everything is on the line.',
    description:
      'Possesses nerves of steel and unmatched instincts inside the final third. The Ice-Cold player excels in high-pressure moments, finding the bottom corners with supreme composure and razor-sharp positional sense.',
    detailedStats: {
      // PHY (110)
      pace: 30,
      stamina: 45,
      strength: 35,
      // PRO (135)
      ballControl: 50,
      retention: 45,
      dribbling: 40,
      // CRE (85)
      shortPass: 45,
      longPass: 20,
      crossing: 20,
      // GOA (170)
      shooting: 80,
      heading: 35,
      longShots: 55,
      // DEF (50)
      tackling: 15,
      marking: 15,
      interceptions: 20,
      // MEN (225)
      positioning: 75,
      composure: 85,
      reactions: 65,
    },
    statDevelopmentMatrix: {
      composure: 'natural',
      shooting: 'natural',
      positioning: 'skillful',
      reactions: 'skillful',
      longShots: 'skillful',
      ballControl: 'normal',
      retention: 'normal',
      heading: 'normal',
      shortPass: 'normal',
      stamina: 'normal',
      strength: 'normal',
      dribbling: 'poor',
      interceptions: 'poor',
      pace: 'poor',
      crossing: 'weakness',
      longPass: 'weakness',
      tackling: 'weakness',
      marking: 'weakness',
    },
    yearlyBonusStatKeys: ['composure', 'shooting', 'positioning'],
    primaryStrengths: [
      { key: 'composure', label: 'Composure', category: 'MEN', value: 85 },
      { key: 'shooting', label: 'Shooting', category: 'GOA', value: 80 },
      { key: 'positioning', label: 'Positioning', category: 'MEN', value: 75 },
    ],
    secondaryStrengths: [
      { key: 'reactions', label: 'Reactions', category: 'MEN', value: 65 },
      { key: 'longShots', label: 'Long Shots', category: 'GOA', value: 55 },
      { key: 'ballControl', label: 'Ball Control', category: 'PRO', value: 50 },
    ],
    weaknesses: [
      { key: 'crossing', label: 'Crossing', category: 'CRE', value: 20 },
      { key: 'longPass', label: 'Long Passing', category: 'CRE', value: 20 },
      { key: 'tackling', label: 'Tackling', category: 'DEF', value: 15 },
      { key: 'marking', label: 'Marking', category: 'DEF', value: 15 },
      { key: 'pace', label: 'Pace', category: 'PHY', value: 30 },
    ],
    profile: {
      categoryRatings: {
        MEN: 'Supreme',
        GOA: 'Elite',
        PRO: 'Solid',
        PHY: 'Solid',
        CRE: 'Moderate',
        DEF: 'Low',
      },
      summary: 'Deadly finishing accuracy backed by supreme composure under maximum pressure.',
    },
    theme: {
      primaryColor: '#06b6d4',
      accentColor: '#22d3ee',
      borderGlow: 'border-cyan-400/80 shadow-cyan-500/30',
      bgGradient: 'from-cyan-950/80 via-slate-900 to-blue-950/70',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      textColor: 'text-cyan-400',
      glowShadow: 'shadow-[0_0_35px_rgba(6,182,212,0.35)]',
      cardPattern: 'ice_frost',
    },
  },

  patient: {
    id: 'patient',
    name: 'Patient',
    badge: '🧱 GUARDIAN',
    subtitle: 'Tireless Engine & Defensive Shield',
    archetypeRole: 'Tactical Anchor',
    tagline: 'Relentless work rate, discipline, and anticipation that smothers opposition attacks.',
    description:
      'An indefatigable workhorse who never tires. The Patient archetype reads opposition passing lanes before they materialize, tracks runners relentlessly for 90 minutes, and forms an impenetrable defensive wall.',
    detailedStats: {
      // PHY (180)
      pace: 45,
      stamina: 85,
      strength: 50,
      // PRO (102)
      ballControl: 40,
      retention: 42,
      dribbling: 20,
      // CRE (110)
      shortPass: 50,
      longPass: 40,
      crossing: 20,
      // GOA (55)
      shooting: 15,
      heading: 25,
      longShots: 15,
      // DEF (218)
      tackling: 68,
      marking: 72,
      interceptions: 78,
      // MEN (60)
      positioning: 25,
      composure: 15,
      reactions: 20,
    },
    statDevelopmentMatrix: {
      stamina: 'natural',
      interceptions: 'natural',
      marking: 'skillful',
      tackling: 'skillful',
      strength: 'skillful',
      shortPass: 'normal',
      composure: 'normal',
      positioning: 'normal',
      reactions: 'normal',
      pace: 'normal',
      ballControl: 'normal',
      retention: 'poor',
      longPass: 'poor',
      heading: 'poor',
      shooting: 'weakness',
      longShots: 'weakness',
      dribbling: 'weakness',
      crossing: 'weakness',
    },
    yearlyBonusStatKeys: ['stamina', 'interceptions', 'marking'],
    primaryStrengths: [
      { key: 'stamina', label: 'Stamina', category: 'PHY', value: 85 },
      { key: 'interceptions', label: 'Interceptions', category: 'DEF', value: 78 },
      { key: 'marking', label: 'Marking', category: 'DEF', value: 72 },
    ],
    secondaryStrengths: [
      { key: 'tackling', label: 'Tackling', category: 'DEF', value: 68 },
      { key: 'strength', label: 'Strength', category: 'PHY', value: 50 },
      { key: 'shortPass', label: 'Short Passing', category: 'CRE', value: 50 },
    ],
    weaknesses: [
      { key: 'shooting', label: 'Shooting', category: 'GOA', value: 15 },
      { key: 'longShots', label: 'Long Shots', category: 'GOA', value: 15 },
      { key: 'dribbling', label: 'Dribbling', category: 'PRO', value: 20 },
      { key: 'crossing', label: 'Crossing', category: 'CRE', value: 20 },
      { key: 'heading', label: 'Heading', category: 'GOA', value: 25 },
    ],
    profile: {
      categoryRatings: {
        DEF: 'Supreme',
        PHY: 'Elite',
        MEN: 'High',
        CRE: 'Solid',
        PRO: 'Moderate',
        GOA: 'Low',
      },
      summary: 'Inexhaustible stamina and stellar defensive anticipation to anchor the squad.',
    },
    theme: {
      primaryColor: '#10b981',
      accentColor: '#34d399',
      borderGlow: 'border-emerald-500/80 shadow-emerald-600/30',
      bgGradient: 'from-emerald-950/80 via-slate-900 to-teal-950/70',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      textColor: 'text-emerald-400',
      glowShadow: 'shadow-[0_0_35px_rgba(16,185,129,0.35)]',
      cardPattern: 'shield_matrix',
    },
  },

  cannon: {
    id: 'cannon',
    name: 'Cannon',
    badge: '💥 ARTILLERY',
    subtitle: 'Ballistic Striker & Shot Power Artillery',
    archetypeRole: 'Long-Range Bombarder',
    tagline: 'Unleashing unstoppable supersonic strikes from anywhere in the attacking half.',
    description:
      'Armed with immense leg power and raw ballistic velocity. The Cannon punishes goalkeepers from impossible distances, crashes through challenges, and finishes chances with violent shot power.',
    detailedStats: {
      // PHY (160)
      pace: 45,
      stamina: 45,
      strength: 70,
      // PRO (105)
      ballControl: 45,
      retention: 20,
      dribbling: 40,
      // CRE (105)
      shortPass: 45,
      longPass: 35,
      crossing: 25,
      // GOA (225)
      shooting: 82,
      heading: 55,
      longShots: 88,
      // DEF (45)
      tackling: 15,
      marking: 15,
      interceptions: 15,
      // MEN (135)
      positioning: 40,
      composure: 40,
      reactions: 55,
    },
    statDevelopmentMatrix: {
      longShots: 'natural',
      shooting: 'natural',
      strength: 'skillful',
      heading: 'skillful',
      reactions: 'skillful',
      pace: 'normal',
      ballControl: 'normal',
      shortPass: 'normal',
      positioning: 'normal',
      composure: 'normal',
      stamina: 'normal',
      longPass: 'poor',
      crossing: 'poor',
      retention: 'poor',
      tackling: 'weakness',
      marking: 'weakness',
      interceptions: 'weakness',
      dribbling: 'weakness',
    },
    yearlyBonusStatKeys: ['longShots', 'shooting', 'strength'],
    primaryStrengths: [
      { key: 'longShots', label: 'Long Shots', category: 'GOA', value: 88 },
      { key: 'shooting', label: 'Shooting', category: 'GOA', value: 82 },
      { key: 'strength', label: 'Strength', category: 'PHY', value: 70 },
    ],
    secondaryStrengths: [
      { key: 'heading', label: 'Heading', category: 'GOA', value: 55 },
      { key: 'reactions', label: 'Reactions', category: 'MEN', value: 55 },
      { key: 'pace', label: 'Pace', category: 'PHY', value: 45 },
    ],
    weaknesses: [
      { key: 'marking', label: 'Marking', category: 'DEF', value: 15 },
      { key: 'tackling', label: 'Tackling', category: 'DEF', value: 15 },
      { key: 'interceptions', label: 'Interceptions', category: 'DEF', value: 15 },
      { key: 'retention', label: 'Retention', category: 'PRO', value: 20 },
      { key: 'crossing', label: 'Crossing', category: 'CRE', value: 25 },
    ],
    profile: {
      categoryRatings: {
        GOA: 'Supreme',
        PHY: 'Elite',
        MEN: 'Solid',
        CRE: 'Solid',
        PRO: 'Moderate',
        DEF: 'Low',
      },
      summary: 'Overpowering long-range shot artillery capable of turning matches in an instant.',
    },
    theme: {
      primaryColor: '#f97316',
      accentColor: '#fb923c',
      borderGlow: 'border-orange-500/80 shadow-orange-600/30',
      bgGradient: 'from-orange-950/80 via-slate-900 to-amber-950/70',
      badgeBg: 'bg-orange-500/20 text-orange-300 border border-orange-400/40',
      iconBg: 'bg-orange-500/20 text-orange-400',
      textColor: 'text-orange-400',
      glowShadow: 'shadow-[0_0_35px_rgba(249,115,22,0.35)]',
      cardPattern: 'blast_waves',
    },
  },

  wasted_talent: {
    id: 'wasted_talent',
    name: 'Wasted Talent',
    badge: '🔮 VOLATILE GENIUS',
    subtitle: 'Supreme Natural Magic & Severe Disciplinary Issues',
    archetypeRole: 'Unpredictable Maverick',
    tagline: 'World-class celestial technique and long-range fireworks, notorious for heated brawls and stupid red cards.',
    description:
      'A player blessed with generational raw genius, capable of celestial close control and breathtaking 35-yard screamer goals. However, you are widely known for getting into heated fights, volatile outbursts, and picking up stupid red cards, earning you an immediate reputation as a troublesome maverick. You start your career as a "Bad Boy" with Bad Reputation Tier I (+20% Red Card Risk, club skepticism, and locker room friction). An insanely talented player with huge conduct issues—a dangerous but deadly tradeoff.',
    conductWarning: '⚠️ CONDUCT DISCLAIMER: Selecting this archetype grants INSTANT BAD REP TIER I ("BAD BOY"). Known for reckless fights and stupid red cards, you start with +20% higher red card risk in matches, club skepticism, and your reputation can never drop below Tier I!',
    startingBadRepTier: 1,
    detailedStats: {
      // PHY (126)
      pace: 76,
      stamina: 20,
      strength: 30,
      // PRO (224)
      ballControl: 85,
      retention: 55,
      dribbling: 84,
      // CRE (209)
      shortPass: 68,
      longPass: 75,
      crossing: 66,
      // GOA (179)
      shooting: 78,
      heading: 15,
      longShots: 86,
      // DEF (30)
      tackling: 10,
      marking: 10,
      interceptions: 10,
      // MEN (73)
      positioning: 18,
      composure: 30,
      reactions: 25,
    },
    statDevelopmentMatrix: {
      ballControl: 'natural',
      longShots: 'natural',
      dribbling: 'skillful',
      shooting: 'skillful',
      pace: 'skillful',
      longPass: 'skillful',
      shortPass: 'normal',
      crossing: 'normal',
      retention: 'normal',
      composure: 'poor',
      reactions: 'poor',
      positioning: 'poor',
      stamina: 'weakness',
      strength: 'weakness',
      tackling: 'weakness',
      marking: 'weakness',
      interceptions: 'weakness',
      heading: 'weakness',
    },
    yearlyBonusStatKeys: ['pace', 'ballControl', 'dribbling', 'longPass', 'shooting', 'longShots'],
    primaryStrengths: [
      // PHY - Physical Pace
      { key: 'pace', label: 'Pace', category: 'PHY', value: 76 },
      // PRO - Prowess Ball Control & Dribbling
      { key: 'ballControl', label: 'Ball Control', category: 'PRO', value: 85 },
      { key: 'dribbling', label: 'Dribbling', category: 'PRO', value: 84 },
      // CRE - Creation Long Passing
      { key: 'longPass', label: 'Long Passing', category: 'CRE', value: 75 },
      // GOA - Goalscoring Shooting & Long Shots
      { key: 'shooting', label: 'Shooting', category: 'GOA', value: 78 },
      { key: 'longShots', label: 'Long Shots', category: 'GOA', value: 86 },
    ],
    secondaryStrengths: [
      // CRE - Creation Short Passing & Crossing
      { key: 'shortPass', label: 'Short Passing', category: 'CRE', value: 68 },
      { key: 'crossing', label: 'Crossing', category: 'CRE', value: 66 },
    ],
    weaknesses: [
      { key: 'stamina', label: 'Stamina', category: 'PHY', value: 20 },
      { key: 'strength', label: 'Strength', category: 'PHY', value: 30 },
      { key: 'marking', label: 'Marking', category: 'DEF', value: 10 },
      { key: 'tackling', label: 'Tackling', category: 'DEF', value: 10 },
      { key: 'interceptions', label: 'Interceptions', category: 'DEF', value: 10 },
      { key: 'positioning', label: 'Positioning', category: 'MEN', value: 18 },
      { key: 'reactions', label: 'Reactions', category: 'MEN', value: 25 },
      { key: 'heading', label: 'Heading', category: 'GOA', value: 15 },
    ],
    profile: {
      categoryRatings: {
        PRO: 'Supreme',
        GOA: 'Supreme',
        CRE: 'Elite',
        PHY: 'Solid',
        MEN: 'Low',
        DEF: 'Low',
      },
      summary: 'Sensational pace, ball wizardry, vision and thunderous long shots paired with notorious discipline issues.',
    },
    theme: {
      primaryColor: '#ec4899',
      accentColor: '#f472b6',
      borderGlow: 'border-pink-500/80 shadow-pink-600/30',
      bgGradient: 'from-pink-950/80 via-slate-900 to-rose-950/70',
      badgeBg: 'bg-pink-500/20 text-pink-300 border border-pink-400/40',
      iconBg: 'bg-pink-500/20 text-pink-400',
      textColor: 'text-pink-400',
      glowShadow: 'shadow-[0_0_35px_rgba(236,72,153,0.35)]',
      cardPattern: 'neon_sparks',
    },
  },
};

export const ALL_PLAYER_TYPES: PlayerTypeDefinition[] = [
  PLAYER_TYPES.speedster,
  PLAYER_TYPES.tank,
  PLAYER_TYPES.flair,
  PLAYER_TYPES.architect,
  PLAYER_TYPES.ice_cold,
  PLAYER_TYPES.patient,
  PLAYER_TYPES.cannon,
  PLAYER_TYPES.wasted_talent,
];

/**
 * Calculates 6 category group averages (PRO, GOA, CRE, DEF, PHY, MEN)
 * from detailed 18 stats for UI and player stats object.
 */
export function calculateSixCategoryStats(detailed: OutfieldDetailedStats): PlayerStats {
  const pro = calculateThreeStatGroupValue(detailed.ballControl, detailed.retention, detailed.dribbling);
  const cre = calculateThreeStatGroupValue(detailed.shortPass, detailed.longPass, detailed.crossing);
  const goa = calculateThreeStatGroupValue(detailed.shooting, detailed.heading, detailed.longShots);
  const def = calculateThreeStatGroupValue(detailed.tackling, detailed.marking, detailed.interceptions);
  const phy = calculateThreeStatGroupValue(detailed.pace, detailed.stamina, detailed.strength);
  const men = calculateThreeStatGroupValue(detailed.positioning, detailed.composure, detailed.reactions);

  return {
    pro,
    cre,
    goa,
    def,
    phy,
    men,
    detailed: { ...detailed },
  };
}

/**
 * Returns the exact 5-state developmental affinity for an attribute:
 * 1- natural (+2/yr, 1.00x cost)
 * 2- skillful (+1/yr, 1.00x cost)
 * 3- normal (+0/yr, 1.00x cost)
 * 4- poor (+0/yr, 1.05x cost)
 * 5- weakness (+0/yr, 1.10x cost)
 */
export function getStatDevelopmentState(
  playerTypeId: PlayerTypeId | string | undefined,
  statKey: string
): StatDevelopmentState {
  if (!playerTypeId || !(playerTypeId in PLAYER_TYPES)) return 'normal';
  const typeDef = PLAYER_TYPES[playerTypeId as PlayerTypeId];
  if (typeDef.statDevelopmentMatrix && statKey in typeDef.statDevelopmentMatrix) {
    return typeDef.statDevelopmentMatrix[statKey as keyof OutfieldDetailedStats] || 'normal';
  }
  if (typeDef.weaknesses.some((w) => w.key === statKey)) return 'weakness';
  if (typeDef.primaryStrengths.some((s) => s.key === statKey)) return 'natural';
  if (typeDef.secondaryStrengths.some((s) => s.key === statKey)) return 'skillful';
  return 'normal';
}

/**
 * Checks if a specific attribute key is listed as a weakness for the given player type.
 */
export function isStatWeaknessForPlayerType(
  playerTypeId: PlayerTypeId | string | undefined,
  statKey: string
): boolean {
  return getStatDevelopmentState(playerTypeId, statKey) === 'weakness';
}

/**
 * Checks if a specific attribute key is listed as poor in development (+5% cost) for the given player type.
 */
export function isStatPoorForPlayerType(
  playerTypeId: PlayerTypeId | string | undefined,
  statKey: string
): boolean {
  return getStatDevelopmentState(playerTypeId, statKey) === 'poor';
}

/**
 * Returns the training cost multiplier for a given stat on this archetype (1.00x, 1.05x, or 1.10x).
 */
export function getStatDevelopmentCostMultiplier(
  playerTypeId: PlayerTypeId | string | undefined,
  statKey: string
): number {
  const state = getStatDevelopmentState(playerTypeId, statKey);
  return STAT_DEV_STATE_CONFIG[state]?.costMultiplier ?? 1.0;
}

/**
 * Checks if a specific attribute key is listed as a primary or secondary strength for the given player type.
 */
export function getPlayerTypeStatRole(
  playerTypeId: PlayerTypeId | string | undefined,
  statKey: string
): 'primary' | 'secondary' | 'weakness' | null {
  if (!playerTypeId || !(playerTypeId in PLAYER_TYPES)) return null;
  const state = getStatDevelopmentState(playerTypeId, statKey);
  if (state === 'natural') return 'primary';
  if (state === 'skillful') return 'secondary';
  if (state === 'weakness') return 'weakness';
  return null;
}

/**
 * Applies the Yearly Archetype Bonus:
 * - Natural stats (+2 permanent points annually, capped at 99)
 * - Skillful stats (+1 permanent point annually, capped at 99)
 * - Normal, Poor, and Weakness receive no yearly bonus.
 * Annually from Age 10 to Age 20 (inclusive).
 */
export function applyYearlyArchetypeBonus(
  playerTypeId: PlayerTypeId | string | undefined,
  currentDetailedStats: OutfieldDetailedStats,
  currentAge: number
): {
  updatedDetailed: OutfieldDetailedStats;
  boostedStatKeys: (keyof OutfieldDetailedStats)[];
  primaryBoostedKeys: (keyof OutfieldDetailedStats)[];
  secondaryBoostedKeys: (keyof OutfieldDetailedStats)[];
} {
  if (!playerTypeId || !(playerTypeId in PLAYER_TYPES)) {
    return {
      updatedDetailed: { ...currentDetailedStats },
      boostedStatKeys: [],
      primaryBoostedKeys: [],
      secondaryBoostedKeys: [],
    };
  }

  // Only applies from Age 10 to Age 20 (inclusive)
  if (currentAge < 10 || currentAge > 20) {
    return {
      updatedDetailed: { ...currentDetailedStats },
      boostedStatKeys: [],
      primaryBoostedKeys: [],
      secondaryBoostedKeys: [],
    };
  }

  const typeDef = PLAYER_TYPES[playerTypeId as PlayerTypeId];
  const updatedDetailed: OutfieldDetailedStats = { ...currentDetailedStats };
  const boostedStatKeys: (keyof OutfieldDetailedStats)[] = [];
  const primaryBoostedKeys: (keyof OutfieldDetailedStats)[] = [];
  const secondaryBoostedKeys: (keyof OutfieldDetailedStats)[] = [];

  // Iterate over all 18 attributes using the 5-state development matrix
  for (const [key, state] of Object.entries(typeDef.statDevelopmentMatrix)) {
    const sKey = key as keyof OutfieldDetailedStats;
    const currentVal = updatedDetailed[sKey] ?? 40;

    if (state === 'natural' && currentVal < 99) {
      const add = Math.min(2, 99 - currentVal);
      updatedDetailed[sKey] = currentVal + add;
      primaryBoostedKeys.push(sKey);
      if (!boostedStatKeys.includes(sKey)) {
        boostedStatKeys.push(sKey);
      }
    } else if (state === 'skillful' && currentVal < 99) {
      const add = Math.min(1, 99 - currentVal);
      updatedDetailed[sKey] = currentVal + add;
      secondaryBoostedKeys.push(sKey);
      if (!boostedStatKeys.includes(sKey)) {
        boostedStatKeys.push(sKey);
      }
    }
  }

  return { updatedDetailed, boostedStatKeys, primaryBoostedKeys, secondaryBoostedKeys };
}
