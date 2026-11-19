import { FormationType, TacticalStyle, TacticalPositionSetup, PlaystyleAssignment } from '../types/leagueEditor';

export interface ClubTacticalProfile {
  managerName: string;
  managerNationality: string;
  primaryFormation: FormationType;
  primaryStyle: TacticalStyle;
  secondaryFormation: FormationType;
  secondaryStyle: TacticalStyle;
  starOverrides?: { role: string; playstyle: PlaystyleAssignment; slotId?: string }[];
}

export interface TacticalPreset {
  id: string;
  name: string;
  subtitle: string;
  flagEmoji: string;
  formation: FormationType;
  style: TacticalStyle;
  description: string;
  positions: TacticalPositionSetup[];
}

/**
 * 7 Definitive Tactical Blueprints & Archetypes
 */
export const TACTICAL_PRESETS: TacticalPreset[] = [
  {
    id: 'brexit_ball_442',
    name: 'The Brexit Ball (Direct 4-4-2)',
    subtitle: 'Burnley, Stoke, Millwall & Everton Physical Direct Football',
    flagEmoji: '🇬🇧',
    formation: '4-4-2',
    style: 'long_balls',
    description: 'Direct aerial football bypassing midfield. Dual strikers (Target Man hold-up + Poacher predator), Enforcer & Box-to-Box midfield, Traditional crossing wingers, Destroyer + Stopper CBs, and a Wall in goal.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Wall', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Defensive', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Balanced', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Enforcer', zoneRow: 5, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_lm', role: 'LW', playstyle: 'Traditional', zoneRow: 4, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_rm', role: 'RW', playstyle: 'Traditional', zoneRow: 4, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_st1', role: 'ST', playstyle: 'Poacher', zoneRow: 0, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st2', role: 'ST', playstyle: 'Target', zoneRow: 0, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'tiki_taka_433',
    name: 'Tiki-Taka / Positional (4-3-3)',
    subtitle: 'Pep Guardiola / Man City & Barça Positional Play',
    flagEmoji: '👑',
    formation: '4-3-3',
    style: 'possession',
    description: 'Dominant ball control with high line, Inverted Fullbacks, ball-playing CBs (Distributor + Playmaker), Anchor pivot, Maestro creator, Inverted Wingers cutting inside, and a Decoy False 9.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Sweeper', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Inverted', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Distributor', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Playmaker', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Inverted', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm', role: 'CDM', playstyle: 'Anchor', zoneRow: 6, zoneCol: 1, heightOffset: -1 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Maestro', zoneRow: 5, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_lw', role: 'LW', playstyle: 'Inverted', zoneRow: 1, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st', role: 'ST', playstyle: 'Decoy', zoneRow: 0, zoneCol: 1, heightOffset: 0 },
      { slotId: 'att_rw', role: 'RW', playstyle: 'Inverted', zoneRow: 1, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'gegenpressing_433',
    name: 'Heavy Metal Gegenpressing (4-3-3)',
    subtitle: 'Arne Slot / Klopp / Postecoglou High Intensity Press',
    flagEmoji: '⚡',
    formation: '4-3-3',
    style: 'gegenpressing',
    description: 'Relentless counter-pressing upon losing possession. High-flying attacking fullbacks, Pressing wingers suffocating defenders, Enforcer holding shield, and Complete dynamic striker.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Sweeper', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm', role: 'CDM', playstyle: 'Enforcer', zoneRow: 6, zoneCol: 1, heightOffset: -1 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Runner', zoneRow: 5, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_lw', role: 'LW', playstyle: 'Pressing', zoneRow: 1, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st', role: 'ST', playstyle: 'Complete', zoneRow: 0, zoneCol: 1, heightOffset: 0 },
      { slotId: 'att_rw', role: 'RW', playstyle: 'Pressing', zoneRow: 1, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'blitz_counter_4231',
    name: 'Mouball / Lethal Counter-Attack (4-2-3-1)',
    subtitle: 'José Mourinho / Real Madrid Ruthless Counter-Attacking Masterclass',
    flagEmoji: '🚀',
    formation: '4-2-3-1',
    style: 'counter_attack',
    description: 'Disciplined, compact mid-to-low block engineered by José Mourinho. Unforgiving defensive spine with dual holding pivots (Anchor + Enforcer / Box-to-Box), elite playmaking CAM launching rapid direct counters into blistering prolific wingers and a predatory lethal number 9.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Wall', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Distributor', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Balanced', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm1', role: 'CDM', playstyle: 'Anchor', zoneRow: 6, zoneCol: 0, heightOffset: -1 },
      { slotId: 'mid_cdm2', role: 'CDM', playstyle: 'Enforcer', zoneRow: 6, zoneCol: 2, heightOffset: -1 },
      { slotId: 'mid_cam', role: 'CAM', playstyle: 'Shadow', zoneRow: 3, zoneCol: 1, heightOffset: 1 },
      { slotId: 'mid_lw', role: 'LW', playstyle: 'Prolific', zoneRow: 3, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_rw', role: 'RW', playstyle: 'Prolific', zoneRow: 3, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_st', role: 'ST', playstyle: 'Poacher', zoneRow: 0, zoneCol: 1, heightOffset: 0 },
    ],
  },
  {
    id: 'catenaccio_532',
    name: 'Iron Fortress Catenaccio (5-3-2)',
    subtitle: 'Diego Simeone / Cholo Low Block & Steel Defense',
    flagEmoji: '🛡️',
    formation: '5-3-2',
    style: 'catenaccio',
    description: 'Impenetrable defensive fortress with 3 centerbacks (Distributor, Destroyer, Stopper), defensive fullbacks, Enforcer anchor, and lethal dual counter strikers (Finisher + Target Man).',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Wall', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Defensive', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Distributor', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb3', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Defensive', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm', role: 'CDM', playstyle: 'Enforcer', zoneRow: 6, zoneCol: 1, heightOffset: -1 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Runner', zoneRow: 5, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_st1', role: 'ST', playstyle: 'Finisher', zoneRow: 0, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st2', role: 'ST', playstyle: 'Target', zoneRow: 0, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'total_control_3421',
    name: 'Total Wingback Overload (3-4-2-1)',
    subtitle: 'Ruben Amorim / Xabi Alonso Tactical Dynamics',
    flagEmoji: '🌪️',
    formation: '3-4-2-1',
    style: 'possession',
    description: '3 CB build-up with wide wingback overloads, twin playmakers/shadow strikers in the pockets behind the striker, and relentless positional switching.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Sweeper', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Distributor', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb3', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_lm', role: 'LW', playstyle: 'Traditional', zoneRow: 4, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Maestro', zoneRow: 5, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Anchor', zoneRow: 5, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_rm', role: 'RW', playstyle: 'Traditional', zoneRow: 4, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cam', role: 'CAM', playstyle: 'Creator', zoneRow: 3, zoneCol: 1, heightOffset: 1 },
      { slotId: 'att_st1', role: 'ST', playstyle: 'Poacher', zoneRow: 0, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st2', role: 'ST', playstyle: 'Complete', zoneRow: 0, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'south_american_4312',
    name: 'La Nuestra & Garra Sudamericana (4-3-3 / 4-3-1-2)',
    subtitle: 'Marcelo Gallardo / River & Boca High Intensity and Flair',
    flagEmoji: '🇦🇷',
    formation: '4-3-3',
    style: 'gegenpressing',
    description: 'Fierce South American pressing with dribbling technical wingers, Enforcer pitbull CDM, Box-to-Box and Maestro midfielders, and relentless False 9 / Decoy striker.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Wall', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm', role: 'CDM', playstyle: 'Enforcer', zoneRow: 6, zoneCol: 1, heightOffset: -1 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Maestro', zoneRow: 5, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_lw', role: 'LW', playstyle: 'Pressing', zoneRow: 1, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st', role: 'ST', playstyle: 'Decoy', zoneRow: 0, zoneCol: 1, heightOffset: 0 },
      { slotId: 'att_rw', role: 'RW', playstyle: 'Pressing', zoneRow: 1, zoneCol: 2, heightOffset: 0 },
    ],
  },
];

/**
 * Authentic tactical database of clubs across England, Spain, France, Argentina, Brazil & Youth.
 */
export const CLUB_TACTICAL_PROFILES: Record<string, ClubTacticalProfile> = {
  // === ENGLAND PREMIER LEAGUE ===
  eng_mancity: {
    managerName: 'Arel Veyra',
    managerNationality: 'Italy',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'RW', playstyle: 'Inverted', slotId: 'att_rw' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
      { role: 'CB', playstyle: 'Distributor', slotId: 'def_cb1' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
    ],
  },
  eng_liverpool: {
    managerName: 'Bren Veyra',
    managerNationality: 'Netherlands',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'LW', playstyle: 'Pressing', slotId: 'att_lw' },
      { role: 'RW', playstyle: 'Pressing', slotId: 'att_rw' },
      { role: 'ST', playstyle: 'Complete', slotId: 'att_st' },
      { role: 'CAM', playstyle: 'Creator', slotId: 'mid_cam' },
    ],
  },
  eng_arsenal: {
    managerName: 'Ciro Veyra',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
      { role: 'CM', playstyle: 'Box-to-Box', slotId: 'mid_cm1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb1' },
      { role: 'LB', playstyle: 'Inverted', slotId: 'def_lb' },
    ],
  },
  eng_chelsea: {
    managerName: 'Dalen Veyra',
    managerNationality: 'England',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'CAM', playstyle: 'Creator', slotId: 'mid_cam' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'RB', playstyle: 'Attacker', slotId: 'def_rb' },
    ],
  },
  eng_manutd: {
    managerName: 'Eron Veyra',
    managerNationality: 'Portugal',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'CAM', playstyle: 'Shadow', slotId: 'mid_cam' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'CM', playstyle: 'Maestro', slotId: 'mid_cm1' },
    ],
  },
  eng_tottenham: {
    managerName: 'Faro Veyra',
    managerNationality: 'Denmark',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'CDM', playstyle: 'Enforcer', slotId: 'mid_cdm1' },
      { role: 'CDM', playstyle: 'Box-to-Box', slotId: 'mid_cdm2' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb1' },
      { role: 'LB', playstyle: 'Attacker', slotId: 'def_lb' },
      { role: 'CAM', playstyle: 'Creator', slotId: 'mid_cam' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
    ],
  },
  eng_newcastle: {
    managerName: 'Galen Veyra',
    managerNationality: 'Germany',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'RB', playstyle: 'Attacker', slotId: 'def_rb' },
      { role: 'ST', playstyle: 'Complete', slotId: 'att_st' },
    ],
  },
  eng_astonvilla: {
    managerName: 'Halen Veyra',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'CDM', playstyle: 'Enforcer', slotId: 'mid_cdm1' },
    ],
  },
  eng_westham: {
    managerName: 'Iven Veyra',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  eng_brighton: {
    managerName: 'Jaro Veyra',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'gegenpressing',
  },
  eng_fulham: {
    managerName: 'Kalen Veyra',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  eng_brentford: {
    managerName: 'Lior Veyra',
    managerNationality: 'Denmark',
    primaryFormation: '3-5-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'long_balls',
    starOverrides: [
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
    ],
  },
  eng_palace: {
    managerName: 'Marek Veyra',
    managerNationality: 'Austria',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  eng_wolves: {
    managerName: 'Nilo Veyra',
    managerNationality: 'England',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  eng_everton: {
    managerName: 'Orin Veyra',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  eng_bournemouth: {
    managerName: 'Pavel Veyra',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  eng_nottingham: {
    managerName: 'Quen Veyra',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'catenaccio',
  },
  eng_leicester: {
    managerName: 'Rian Veyra',
    managerNationality: 'Wales',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  eng_ipswich: {
    managerName: 'Soren Veyra',
    managerNationality: 'Northern Ireland',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  eng_southampton: {
    managerName: 'Tarek Veyra',
    managerNationality: 'Scotland',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'possession',
  },

  // === ENGLAND CHAMPIONSHIP (BREXIT BALL CENTRAL) ===
  eng_burnley: {
    managerName: 'Ulan Veyra',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'LB', playstyle: 'Defensive', slotId: 'def_lb' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'RB', playstyle: 'Balanced', slotId: 'def_rb' },
      { role: 'CM', playstyle: 'Box-to-Box', slotId: 'mid_cm1' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
      { role: 'LW', playstyle: 'Traditional', slotId: 'mid_lm' },
      { role: 'RW', playstyle: 'Traditional', slotId: 'mid_rm' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
    ],
  },
  eng_stoke: {
    managerName: 'Vero Veyra',
    managerNationality: 'Spain',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
    ],
  },
  eng_millwall: {
    managerName: 'Warin Veyra',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  eng_luton: {
    managerName: 'Xavi Veyra',
    managerNationality: 'Wales',
    primaryFormation: '3-5-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
    ],
  },
  eng_sheffield: {
    managerName: 'Yoren Veyra',
    managerNationality: 'England',
    primaryFormation: '3-5-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
    ],
  },
  eng_leeds: {
    managerName: 'Zalen Veyra',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  eng_wba: {
    managerName: 'Arel Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
  },
  eng_norwich: {
    managerName: 'Bren Caldor',
    managerNationality: 'Denmark',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },
  eng_sunderland: {
    managerName: 'Ciro Caldor',
    managerNationality: 'France',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  eng_preston: {
    managerName: 'Dalen Caldor',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'catenaccio',
  },
  eng_derby: {
    managerName: 'Eron Caldor',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  eng_blackburn: {
    managerName: 'Faro Caldor',
    managerNationality: 'England',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'long_balls',
  },
  eng_middlesbrough: {
    managerName: 'Galen Caldor',
    managerNationality: 'England',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  eng_coventry: {
    managerName: 'Halen Caldor',
    managerNationality: 'England',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  eng_cardiff: {
    managerName: 'Iven Caldor',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },

  // === SPAIN LA LIGA ===
  esp_realmadrid: {
    managerName: 'Jaro Caldor',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'LW', playstyle: 'Prolific', slotId: 'mid_lw' },
      { role: 'RW', playstyle: 'Prolific', slotId: 'mid_rw' },
      { role: 'CAM', playstyle: 'Shadow', slotId: 'mid_cam' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm1' },
      { role: 'CDM', playstyle: 'Enforcer', slotId: 'mid_cdm2' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
    ],
  },
  esp_barcelona: {
    managerName: 'Kalen Caldor',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'RW', playstyle: 'Inverted', slotId: 'mid_rw' },
      { role: 'LW', playstyle: 'Pressing', slotId: 'mid_lw' },
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
    ],
  },
  esp_atletico: {
    managerName: 'Lior Caldor',
    managerNationality: 'Argentina',
    primaryFormation: '5-3-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st1' },
    ],
  },
  esp_realsociedad: {
    managerName: 'Marek Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'gegenpressing',
  },
  esp_athletic: {
    managerName: 'Nilo Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'LW', playstyle: 'Pressing', slotId: 'mid_lw' },
      { role: 'RW', playstyle: 'Pressing', slotId: 'mid_rw' },
    ],
  },
  esp_villarreal: {
    managerName: 'Orin Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-4-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  esp_realbetis: {
    managerName: 'Pavel Caldor',
    managerNationality: 'Chile',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  esp_girona: {
    managerName: 'Quen Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'possession',
  },
  esp_valencia: {
    managerName: 'Rian Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-4-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'catenaccio',
  },
  esp_sevilla: {
    managerName: 'Soren Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  esp_getafe: {
    managerName: 'Tarek Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  esp_mallorca: {
    managerName: 'Ulan Caldor',
    managerNationality: 'Spain',
    primaryFormation: '5-3-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'long_balls',
  },
  esp_osasuna: {
    managerName: 'Vero Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
  },
  esp_celta: {
    managerName: 'Warin Caldor',
    managerNationality: 'Spain',
    primaryFormation: '3-4-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  esp_rayo: {
    managerName: 'Xavi Caldor',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },

  // === ARGENTINA LIGA PROFESIONAL ===
  arg_river: {
    managerName: 'Yoren Caldor',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'ST', playstyle: 'Decoy', slotId: 'att_st' },
      { role: 'LW', playstyle: 'Pressing', slotId: 'att_lw' },
      { role: 'RW', playstyle: 'Pressing', slotId: 'att_rw' },
      { role: 'CM', playstyle: 'Maestro', slotId: 'mid_cm2' },
    ],
  },
  arg_boca: {
    managerName: 'Zalen Caldor',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
    ],
  },
  arg_racing: {
    managerName: 'Arel Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'LW', playstyle: 'Prolific', slotId: 'att_lw' },
      { role: 'RW', playstyle: 'Prolific', slotId: 'att_rw' },
    ],
  },
  arg_independiente: {
    managerName: 'Bren Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
  },
  arg_sanlorenzo: {
    managerName: 'Ciro Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-4-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  arg_velez: {
    managerName: 'Dalen Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  arg_estudiantes: {
    managerName: 'Eron Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '5-3-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
  },
  arg_lanus: {
    managerName: 'Faro Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
    ],
  },
  arg_deportivoriestra: {
    managerName: 'Galen Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  arg_sarmiento: {
    managerName: 'Halen Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'catenaccio',
  },
  arg_argentinos: {
    managerName: 'Iven Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },
  arg_huracan: {
    managerName: 'Jaro Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
  },

  // === BRAZIL BRASILEIRÃO ===
  bra_flamengo: {
    managerName: 'Kalen Mirel',
    managerNationality: 'Brazil',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'CAM', playstyle: 'Classic N10', slotId: 'mid_cam' },
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st' },
    ],
  },
  bra_palmeiras: {
    managerName: 'Lior Mirel',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'RW', playstyle: 'Pressing', slotId: 'mid_rw' },
      { role: 'ST', playstyle: 'Complete', slotId: 'att_st' },
    ],
  },
  bra_botafogo: {
    managerName: 'Marek Mirel',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'LW', playstyle: 'Pressing', slotId: 'mid_lw' },
      { role: 'RW', playstyle: 'Pressing', slotId: 'mid_rw' },
    ],
  },
  bra_atletico_mg: {
    managerName: 'Nilo Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  bra_saopaulo: {
    managerName: 'Orin Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  bra_cruzeiro: {
    managerName: 'Pavel Mirel',
    managerNationality: 'Brazil',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'GK', playstyle: 'Sweeper', slotId: 'gk_1' },
      { role: 'CM', playstyle: 'Maestro', slotId: 'mid_cm1' },
    ],
  },
  bra_corinthians: {
    managerName: 'Quen Mirel',
    managerNationality: 'Argentina',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'CAM', playstyle: 'Classic N10', slotId: 'mid_cam' },
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st1' },
    ],
  },
  bra_fluminense: {
    managerName: 'Rian Mirel',
    managerNationality: 'Brazil',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'catenaccio',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
  },
  bra_gremio: {
    managerName: 'Soren Mirel',
    managerNationality: 'Brazil',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  bra_internacional: {
    managerName: 'Tarek Mirel',
    managerNationality: 'Brazil',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  bra_santos: {
    managerName: 'Ulan Mirel',
    managerNationality: 'Brazil',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },

  // === FRANCE LIGUE 1 ===
  fr_psg: {
    managerName: 'Vero Mirel',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'LW', playstyle: 'Pressing', slotId: 'att_lw' },
      { role: 'ST', playstyle: 'Decoy', slotId: 'att_st' },
    ],
  },
  fr_monaco: {
    managerName: 'Warin Mirel',
    managerNationality: 'Austria',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'gegenpressing',
  },
  fr_marseille: {
    managerName: 'Xavi Mirel',
    managerNationality: 'Italy',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  fr_lille: {
    managerName: 'Yoren Mirel',
    managerNationality: 'France',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  fr_lyon: {
    managerName: 'Zalen Mirel',
    managerNationality: 'France',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  fr_lens: {
    managerName: 'Arel Dovari',
    managerNationality: 'Belgium',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  fr_nice: {
    managerName: 'Bren Dovari',
    managerNationality: 'France',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'counter_attack',
  },

  // === GERMAN BUNDESLIGA (FIRST DIVISION) ===
  ger_bayern: {
    managerName: 'Ciro Dovari',
    managerNationality: 'Belgium',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Complete', slotId: 'att_st' },
      { role: 'RW', playstyle: 'Inverted', slotId: 'mid_rw' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
      { role: 'LW', playstyle: 'Pressing', slotId: 'mid_lw' },
    ],
  },
  ger_leverkusen: {
    managerName: 'Dalen Dovari',
    managerNationality: 'Spain',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'LB', playstyle: 'Inverted', slotId: 'def_lb' },
    ],
  },
  ger_dortmund: {
    managerName: 'Eron Dovari',
    managerNationality: 'Türkiye',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'GK', playstyle: 'Balanced', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st' },
      { role: 'CDM', playstyle: 'Enforcer', slotId: 'mid_cdm' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
    ],
  },
  ger_leipzig: {
    managerName: 'Faro Dovari',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'LB', playstyle: 'Attacker', slotId: 'def_lb' },
      { role: 'CAM', playstyle: 'Shadow', slotId: 'mid_cam' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
    ],
  },
  ger_stuttgart: {
    managerName: 'Galen Dovari',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Prolific', slotId: 'att_st' },
    ],
  },
  ger_frankfurt: {
    managerName: 'Halen Dovari',
    managerNationality: 'Germany',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },
  ger_mgladbach: {
    managerName: 'Iven Dovari',
    managerNationality: 'Switzerland',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  ger_wolfsburg: {
    managerName: 'Jaro Dovari',
    managerNationality: 'Austria',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-4-1-2',
    secondaryStyle: 'long_balls',
  },
  ger_freiburg: {
    managerName: 'Kalen Dovari',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'possession',
  },
  ger_unionberlin: {
    managerName: 'Lior Dovari',
    managerNationality: 'Denmark',
    primaryFormation: '3-5-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'counter_attack',
  },
  ger_hoffenheim: {
    managerName: 'Marek Dovari',
    managerNationality: 'United States',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  ger_bremen: {
    managerName: 'Nilo Dovari',
    managerNationality: 'Germany',
    primaryFormation: '3-5-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'possession',
  },
  ger_augsburg: {
    managerName: 'Orin Dovari',
    managerNationality: 'Denmark',
    primaryFormation: '4-4-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'long_balls',
  },
  ger_mainz: {
    managerName: 'Pavel Dovari',
    managerNationality: 'Denmark',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-4-1-2',
    secondaryStyle: 'long_balls',
  },
  ger_heidenheim: {
    managerName: 'Quen Dovari',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
  },
  ger_stpauli: {
    managerName: 'Rian Dovari',
    managerNationality: 'Germany',
    primaryFormation: '3-4-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
  },
  ger_kiel: {
    managerName: 'Soren Dovari',
    managerNationality: 'Germany',
    primaryFormation: '3-5-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  ger_bochum: {
    managerName: 'Tarek Dovari',
    managerNationality: 'Germany',
    primaryFormation: '4-4-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'long_balls',
  },

  // === GERMAN 2. BUNDESLIGA (SECOND DIVISION) ===
  ger_hsv: {
    managerName: 'Ulan Dovari',
    managerNationality: 'Germany',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'long_balls',
  },
  ger_koln: {
    managerName: 'Vero Dovari',
    managerNationality: 'Austria',
    primaryFormation: '4-4-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  ger_schalke: {
    managerName: 'Warin Dovari',
    managerNationality: 'Netherlands',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'long_balls',
  },
  ger_hertha: {
    managerName: 'Xavi Dovari',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },
  ger_dusseldorf: {
    managerName: 'Yoren Dovari',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  ger_hannover: {
    managerName: 'Zalen Dovari',
    managerNationality: 'Germany',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'long_balls',
  },
  ger_nurnberg: {
    managerName: 'Arel Tavren',
    managerNationality: 'Germany',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  ger_kaiserslautern: {
    managerName: 'Bren Tavren',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  ger_karlsruhe: {
    managerName: 'Ciro Tavren',
    managerNationality: 'Germany',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'long_balls',
  },
  ger_paderborn: {
    managerName: 'Dalen Tavren',
    managerNationality: 'Poland',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'possession',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  ger_darmstadt: {
    managerName: 'Eron Tavren',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
  },
  ger_furth: {
    managerName: 'Faro Tavren',
    managerNationality: 'Germany',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'long_balls',
  },
  ger_magdeburg: {
    managerName: 'Galen Tavren',
    managerNationality: 'Germany',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'possession',
  },
  ger_braunschweig: {
    managerName: 'Halen Tavren',
    managerNationality: 'Germany',
    primaryFormation: '3-5-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'long_balls',
  },
  ger_elversberg: {
    managerName: 'Iven Tavren',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  ger_munster: {
    managerName: 'Jaro Tavren',
    managerNationality: 'Germany',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'catenaccio',
  },
  ger_ulm: {
    managerName: 'Kalen Tavren',
    managerNationality: 'Germany',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'counter_attack',
  },
  ger_regensburg: {
    managerName: 'Lior Tavren',
    managerNationality: 'United States',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
  },

  // === YOUTH LEAGUE ACADEMIES ===
  eng_y_kensington: { managerName: 'Marek Tavren', managerNationality: 'England', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  eng_y_camden: { managerName: 'Nilo Tavren', managerNationality: 'England', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '4-2-3-1', secondaryStyle: 'gegenpressing' },
  eng_y_westminster: { managerName: 'Orin Tavren', managerNationality: 'England', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  eng_y_greenwich: { managerName: 'Pavel Tavren', managerNationality: 'England', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  eng_y_islington: { managerName: 'Quen Tavren', managerNationality: 'England', primaryFormation: '4-2-3-1', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },
  eng_y_hackney: { managerName: 'Rian Tavren', managerNationality: 'England', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '3-4-3', secondaryStyle: 'counter_attack' },
  eng_y_brixton: { managerName: 'Soren Tavren', managerNationality: 'England', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },
  eng_y_croydon: { managerName: 'Tarek Tavren', managerNationality: 'England', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
  eng_y_peckham: { managerName: 'Ulan Tavren', managerNationality: 'England', primaryFormation: '3-5-2', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'long_balls' },
  eng_y_tottenhamhale: { managerName: 'Vero Tavren', managerNationality: 'England', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },

  arg_y_palermo: { managerName: 'Warin Tavren', managerNationality: 'Argentina', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  arg_y_belgrano: { managerName: 'Xavi Tavren', managerNationality: 'Argentina', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  arg_y_recoleta: { managerName: 'Yoren Tavren', managerNationality: 'Argentina', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  arg_y_caballito: { managerName: 'Zalen Tavren', managerNationality: 'Argentina', primaryFormation: '4-4-2', primaryStyle: 'counter_attack', secondaryFormation: '4-3-3', secondaryStyle: 'gegenpressing' },
  arg_y_santelmo: { managerName: 'Arel Solvek', managerNationality: 'Argentina', primaryFormation: '4-4-2', primaryStyle: 'catenaccio', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  arg_y_flores: { managerName: 'Bren Solvek', managerNationality: 'Argentina', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },
  arg_y_laboca: { managerName: 'Ciro Solvek', managerNationality: 'Argentina', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
  arg_y_barracas: { managerName: 'Dalen Solvek', managerNationality: 'Argentina', primaryFormation: '5-3-2', primaryStyle: 'catenaccio', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
  arg_y_mataderos: { managerName: 'Eron Solvek', managerNationality: 'Argentina', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  arg_y_villalugano: { managerName: 'Faro Solvek', managerNationality: 'Argentina', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },

  esp_y_chamartin: { managerName: 'Galen Solvek', managerNationality: 'Spain', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  esp_y_salamanca: { managerName: 'Halen Solvek', managerNationality: 'Spain', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  esp_y_retiro: { managerName: 'Iven Solvek', managerNationality: 'Spain', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '3-4-3', secondaryStyle: 'possession' },
  esp_y_arguelles: { managerName: 'Jaro Solvek', managerNationality: 'Spain', primaryFormation: '4-2-3-1', primaryStyle: 'gegenpressing', secondaryFormation: '4-3-3', secondaryStyle: 'gegenpressing' },
  esp_y_malasana: { managerName: 'Kalen Solvek', managerNationality: 'Spain', primaryFormation: '3-4-2-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  esp_y_lavapies: { managerName: 'Lior Solvek', managerNationality: 'Spain', primaryFormation: '4-4-2', primaryStyle: 'counter_attack', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  esp_y_carabanchel: { managerName: 'Marek Solvek', managerNationality: 'Spain', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  esp_y_vallecas: { managerName: 'Nilo Solvek', managerNationality: 'Spain', primaryFormation: '4-2-3-1', primaryStyle: 'gegenpressing', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  esp_y_usera: { managerName: 'Orin Solvek', managerNationality: 'Spain', primaryFormation: '5-3-2', primaryStyle: 'catenaccio', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
  esp_y_villaverde: { managerName: 'Pavel Solvek', managerNationality: 'Spain', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },

  fr_y_montmartre: { managerName: 'Quen Solvek', managerNationality: 'France', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  fr_y_passy: { managerName: 'Rian Solvek', managerNationality: 'France', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  fr_y_bastille: { managerName: 'Soren Solvek', managerNationality: 'France', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '4-2-3-1', secondaryStyle: 'gegenpressing' },
  fr_y_belleville: { managerName: 'Tarek Solvek', managerNationality: 'France', primaryFormation: '4-2-3-1', primaryStyle: 'counter_attack', secondaryFormation: '3-4-2-1', secondaryStyle: 'counter_attack' },
  fr_y_lemarais: { managerName: 'Ulan Solvek', managerNationality: 'France', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  fr_y_montparnasse: { managerName: 'Vero Solvek', managerNationality: 'France', primaryFormation: '4-4-2', primaryStyle: 'counter_attack', secondaryFormation: '4-2-3-1', secondaryStyle: 'catenaccio' },
  fr_y_batignolles: { managerName: 'Warin Solvek', managerNationality: 'France', primaryFormation: '3-5-2', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },
  fr_y_lavillette: { managerName: 'Xavi Solvek', managerNationality: 'France', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  fr_y_clignancourt: { managerName: 'Yoren Solvek', managerNationality: 'France', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  fr_y_auteuil: { managerName: 'Zalen Solvek', managerNationality: 'France', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },

  bra_y_moema: { managerName: 'Arel Rendale', managerNationality: 'Brazil', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  bra_y_pinheiros: { managerName: 'Bren Rendale', managerNationality: 'Brazil', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  bra_y_vilamariana: { managerName: 'Ciro Rendale', managerNationality: 'Brazil', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '3-4-3', secondaryStyle: 'gegenpressing' },
  bra_y_tatuape: { managerName: 'Dalen Rendale', managerNationality: 'Brazil', primaryFormation: '4-4-2', primaryStyle: 'counter_attack', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  bra_y_liberdade: { managerName: 'Eron Rendale', managerNationality: 'Brazil', primaryFormation: '4-2-3-1', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'possession' },
  bra_y_santana: { managerName: 'Faro Rendale', managerNationality: 'Brazil', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-2-3-1', secondaryStyle: 'counter_attack' },
  bra_y_lapa: { managerName: 'Galen Rendale', managerNationality: 'Brazil', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-3-2', secondaryStyle: 'catenaccio' },
  bra_y_ipiranga: { managerName: 'Halen Rendale', managerNationality: 'Brazil', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  bra_y_guaianases: { managerName: 'Iven Rendale', managerNationality: 'Brazil', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  bra_y_capela: { managerName: 'Jaro Rendale', managerNationality: 'Brazil', primaryFormation: '5-3-2', primaryStyle: 'catenaccio', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
};

/**
 * Authentic Manager Name Bank per country
 */
const COUNTRY_COACH_NAMES: Record<string, { firstNames: string[]; lastNames: string[] }> = {
  ENG: {
    firstNames: ['Jack', 'Darren', 'Stuart', 'Nigel', 'Craig', 'Trevor', 'Duncan', 'Martin', 'Graham', 'Colin', 'Russell', 'Ian'],
    lastNames: ['Henderson', 'Walker', 'Campbell', 'Clarke', 'Holden', 'Wright', 'Robinson', 'Pearson', 'Hughes', 'Watson', 'Bennett', 'Taylor'],
  },
  ESP: {
    firstNames: ['Javier', 'Sergio', 'Álvaro', 'Borja', 'Ignacio', 'Gonzalo', 'Enrique', 'Raúl', 'Pablo', 'Marcos', 'Manuel', 'Fernando'],
    lastNames: ['Navarro', 'Morales', 'Vega', 'Serrano', 'Montero', 'Prieto', 'Heredia', 'Salgado', 'Crespo', 'Mendieta', 'Ibáñez', 'Garrido'],
  },
  FRA: {
    firstNames: ['Julien', 'Sébastien', 'Maxime', 'Romain', 'Adrien', 'Thomas', 'Alexandre', 'Fabien', 'Florian', 'Vincent', 'Benoît', 'Grégory'],
    lastNames: ['Moreau', 'Laurent', 'Dubois', 'Marchand', 'Girard', 'Chevalier', 'Roy', 'Colin', 'Renaud', 'Guérin', 'Tavenot', 'Poirier'],
  },
  ARG: {
    firstNames: ['Agustín', 'Leandro', 'Matías', 'Franco', 'Esteban', 'Hernán', 'Facundo', 'Luciano', 'Ramiro', 'Cristian', 'Damián', 'Mauro'],
    lastNames: ['Benítez', 'Peralta', 'Domínguez', 'Almada', 'Carrizo', 'Giménez', 'Blanco', 'Romero', 'Fabbiani', 'Sanguinetti', 'Vojvoda', 'Oldrá'],
  },
  BRA: {
    firstNames: ['Lucas', 'Marcelo', 'Gabriel', 'Thiago', 'Rodrigo', 'Bruno', 'Danilo', 'Caio', 'Eduardo', 'Matheus', 'Wellington', 'Leandro'],
    lastNames: ['Silveira', 'Guimarães', 'Ferreira', 'Nogueira', 'Alcantara', 'Vasconcelos', 'Santana', 'Medeiros', 'Farias', 'Brandão', 'Barreto', 'Machado'],
  },
  GER: {
    firstNames: ['Lukas', 'Leon', 'Finn', 'Paul', 'Jonas', 'Felix', 'Maximilian', 'Noah', 'Elias', 'Julian', 'Moritz', 'Florian', 'Niklas', 'David', 'Johannes'],
    lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein'],
  },
};

/**
 * Derives or retrieves a club's realistic tactical profile without bugs or duplicate defaults.
 */
export function getClubTacticalProfile(teamId: string = '', teamName: string = '', countryCode: string = 'ENG'): ClubTacticalProfile {
  const normId = (teamId || '').toLowerCase().trim();
  const normName = (teamName || '').toLowerCase().trim();

  // 1. Direct registry ID lookup
  if (normId && CLUB_TACTICAL_PROFILES[normId]) {
    return CLUB_TACTICAL_PROFILES[normId];
  }

  // Explicit cross-country collision guards before any fuzzy ID or name matching
  const ccUpper = (countryCode || '').toUpperCase().trim();
  const isCrossCountryCollision =
    normId === 'arg_arsenal' ||
    normId === 'conmebol_liverpool_mvd' ||
    normId === 'conmebol_barcelona_sc' ||
    normId === 'conmebol_everton_chi' ||
    (ccUpper === 'ARG' && (normName.includes('arsenal') || normName.includes('sarand') || normName.includes('viaducto'))) ||
    (ccUpper === 'URU' && (normName.includes('liverpool') || normName.includes('belvedere') || normName.includes('cuchilla'))) ||
    (ccUpper === 'ECU' && (normName.includes('barcelona') || normName.includes('guayaquil') || normName.includes('astillero'))) ||
    (ccUpper === 'CHI' && (normName.includes('everton') || normName.includes('ruleteros') || normName.includes('viña')));

  // 2. Normalized prefix matching ONLY when teamId has no conflicting country prefix
  const COUNTRY_PREFIX_RE = /^(eng2?_|esp2?_|fra?2?_|arg2?_|bra2?_|ger2?_|ita2?_|por2?_|sau_|conmebol_|uefa_)/;
  if (!isCrossCountryCollision && normId.length >= 4 && !COUNTRY_PREFIX_RE.test(normId)) {
    const strippedId = normId.replace(COUNTRY_PREFIX_RE, '');
    for (const [key, profile] of Object.entries(CLUB_TACTICAL_PROFILES)) {
      const strippedKey = key.replace(COUNTRY_PREFIX_RE, '');
      if (strippedKey === strippedId) {
        return profile;
      }
    }
  }

  if (isCrossCountryCollision) {
    // Do not fall through to English/Spanish profiles; fall through to deterministic local club generator below
  } else {
    // 3. Name-based match lookup with generic & legacy alias support
    if (normName.includes('bavaria rot') || normName.includes('bayern') || normName.includes('münchen') || normName.includes('munich')) return CLUB_TACTICAL_PROFILES.ger_bayern;
    if (normName.includes('rheinland werkself') || normName.includes('leverkusen') || normName.includes('bayer 04')) return CLUB_TACTICAL_PROFILES.ger_leverkusen;
    if (normName.includes('westfalen schwarzgelb') || normName.includes('dortmund') || normName.includes('bvb')) return CLUB_TACTICAL_PROFILES.ger_dortmund;
    if (normName.includes('messestadt') || normName.includes('leipzig') || normName.includes('rbl')) return CLUB_TACTICAL_PROFILES.ger_leipzig;
    if (normName.includes('schwaben brustring') || normName.includes('stuttgart')) return CLUB_TACTICAL_PROFILES.ger_stuttgart;
    if (normName.includes('mainhattan') || normName.includes('frankfurt') || normName.includes('eintracht frankfurt')) return CLUB_TACTICAL_PROFILES.ger_frankfurt;
    if (normName.includes('niederrhein fohlen') || normName.includes('mönchengladbach') || normName.includes('mgladbach') || normName.includes('gladbach')) return CLUB_TACTICAL_PROFILES.ger_mgladbach;
    if (normName.includes('autostadt') || normName.includes('wolfsburg')) return CLUB_TACTICAL_PROFILES.ger_wolfsburg;
    if (normName.includes('breisgau greif') || normName.includes('freiburg')) return CLUB_TACTICAL_PROFILES.ger_freiburg;
    if (normName.includes('köpenick eisern') || normName.includes('union berlin')) return CLUB_TACTICAL_PROFILES.ger_unionberlin;
    if (normName.includes('kraichgau') || normName.includes('hoffenheim')) return CLUB_TACTICAL_PROFILES.ger_hoffenheim;
    if (normName.includes('weser grün') || normName.includes('bremen') || normName.includes('werder')) return CLUB_TACTICAL_PROFILES.ger_bremen;
    if (normName.includes('fuggerstadt') || normName.includes('augsburg')) return CLUB_TACTICAL_PROFILES.ger_augsburg;
    if (normName.includes('rheinhessen') || normName.includes('mainz')) return CLUB_TACTICAL_PROFILES.ger_mainz;
    if (normName.includes('ostalb brenz') || normName.includes('heidenheim')) return CLUB_TACTICAL_PROFILES.ger_heidenheim;
    if (normName.includes('kiez braun') || normName.includes('st. pauli') || normName.includes('st pauli')) return CLUB_TACTICAL_PROFILES.ger_stpauli;
    if (normName.includes('förde störche') || normName.includes('kiel') || normName.includes('holstein')) return CLUB_TACTICAL_PROFILES.ger_kiel;
    if (normName.includes('ruhrgebiet') || normName.includes('bochum')) return CLUB_TACTICAL_PROFILES.ger_bochum;
    if (normName.includes('elbe raute') || normName.includes('hamburg') || normName.includes('hsv')) return CLUB_TACTICAL_PROFILES.ger_hsv;
    if (normName.includes('domstadt geißböcke') || normName.includes('köln') || normName.includes('koln') || normName.includes('cologne')) return CLUB_TACTICAL_PROFILES.ger_koln;
    if (normName.includes('gelsenkirchen knappen') || normName.includes('schalke')) return CLUB_TACTICAL_PROFILES.ger_schalke;
    if (normName.includes('spree alte dame') || normName.includes('hertha')) return CLUB_TACTICAL_PROFILES.ger_hertha;
    if (normName.includes('rheinufer rot') || normName.includes('düsseldorf') || normName.includes('dusseldorf') || normName.includes('fortuna')) return CLUB_TACTICAL_PROFILES.ger_dusseldorf;
    if (normName.includes('leine schwarz') || normName.includes('hannover')) return CLUB_TACTICAL_PROFILES.ger_hannover;
    if (normName.includes('franken club') || normName.includes('nürnberg') || normName.includes('nurnberg')) return CLUB_TACTICAL_PROFILES.ger_nurnberg;
    if (normName.includes('betzenberg') || normName.includes('kaiserslautern')) return CLUB_TACTICAL_PROFILES.ger_kaiserslautern;
    if (normName.includes('baden blau') || normName.includes('karlsruhe') || normName.includes('ksc')) return CLUB_TACTICAL_PROFILES.ger_karlsruhe;
    if (normName.includes('pader schwarz') || normName.includes('paderborn')) return CLUB_TACTICAL_PROFILES.ger_paderborn;
    if (normName.includes('südhessen lilien') || normName.includes('darmstadt')) return CLUB_TACTICAL_PROFILES.ger_darmstadt;
    if (normName.includes('kleeblatt franken') || normName.includes('fürth') || normName.includes('furth') || normName.includes('greuther')) return CLUB_TACTICAL_PROFILES.ger_furth;
    if (normName.includes('börde blau') || normName.includes('magdeburg')) return CLUB_TACTICAL_PROFILES.ger_magdeburg;
    if (normName.includes('oker löwen') || normName.includes('braunschweig') || normName.includes('eintracht braunschweig')) return CLUB_TACTICAL_PROFILES.ger_braunschweig;
    if (normName.includes('saarland kaiserlinde') || normName.includes('elversberg')) return CLUB_TACTICAL_PROFILES.ger_elversberg;
    if (normName.includes('westmünster') || normName.includes('münster') || normName.includes('munster') || normName.includes('preußen')) return CLUB_TACTICAL_PROFILES.ger_munster;
    if (normName.includes('donau spatzen') || normName.includes('ulm')) return CLUB_TACTICAL_PROFILES.ger_ulm;
    if (normName.includes('oberpfalz rot') || normName.includes('regensburg') || normName.includes('jahn')) return CLUB_TACTICAL_PROFILES.ger_regensburg;

    if (normName.includes('lancashire clarets') || normName.includes('burnley')) return CLUB_TACTICAL_PROFILES.eng_burnley;
    if ((normName.includes('goodison toffees') || normName.includes('everton')) && !normName.includes('viña') && !normName.includes('vina') && !normName.includes('ruleteros')) return CLUB_TACTICAL_PROFILES.eng_everton;
    if (normName.includes('potteries city') || normName.includes('stoke')) return CLUB_TACTICAL_PROFILES.eng_stoke;
    if (normName.includes('bermondsey lions') || normName.includes('millwall')) return CLUB_TACTICAL_PROFILES.eng_millwall;
    if (normName.includes('bedfordshire hatters') || normName.includes('luton')) return CLUB_TACTICAL_PROFILES.eng_luton;
    if (normName.includes('steel city blades') || normName.includes('sheffield united')) return CLUB_TACTICAL_PROFILES.eng_sheffield;
    if (normName.includes('deepdale north end') || normName.includes('preston')) return CLUB_TACTICAL_PROFILES.eng_preston;
    if (normName.includes('peak district rams') || normName.includes('derby county')) return CLUB_TACTICAL_PROFILES.eng_derby;
    if (normName.includes('eastlands sky blues') || normName.includes('manchester city') || normName.includes('man city')) return CLUB_TACTICAL_PROFILES.eng_mancity;
    if ((normName.includes('mersey reds') || normName.includes('liverpool')) && !normName.includes('montevideo') && !normName.includes('belvedere')) return CLUB_TACTICAL_PROFILES.eng_liverpool;
    if ((normName.includes('gunners fc') || normName === 'arsenal' || normName === 'arsenal fc') && !normName.includes('sarand') && !normName.includes('viaducto') && ccUpper !== 'ARG') return CLUB_TACTICAL_PROFILES.eng_arsenal;
    if (normName === 'london fc' || normName.includes('chelsea')) return CLUB_TACTICAL_PROFILES.eng_chelsea;
    if (normName.includes('red devils united') || normName.includes('manchester united') || normName.includes('man utd')) return CLUB_TACTICAL_PROFILES.eng_manutd;
    if (normName.includes('lilywhites hotspur') || normName.includes('tottenham') || normName.includes('spurs')) return CLUB_TACTICAL_PROFILES.eng_tottenham;
    if (normName.includes('tyneside magpies') || normName.includes('newcastle')) return CLUB_TACTICAL_PROFILES.eng_newcastle;
    if (normName.includes('midlands villans') || normName.includes('aston villa')) return CLUB_TACTICAL_PROFILES.eng_astonvilla;
    if (normName.includes('sussex seagulls') || normName.includes('brighton')) return CLUB_TACTICAL_PROFILES.eng_brighton;
    if (normName.includes('hounslow bees') || normName.includes('brentford')) return CLUB_TACTICAL_PROFILES.eng_brentford;
    if (normName.includes('selhurst eagles') || normName.includes('crystal palace') || normName.includes('palace')) return CLUB_TACTICAL_PROFILES.eng_palace;
    if (normName.includes('blancos cf') || normName.includes('real madrid')) return CLUB_TACTICAL_PROFILES.esp_realmadrid;
    if ((normName.includes('catalunya fc') || normName.includes('barcelona') || normName.includes('barça')) && !normName.includes('guayaquil') && !normName.includes('astillero')) return CLUB_TACTICAL_PROFILES.esp_barcelona;
    if (normName.includes('atlético aviación') || normName.includes('atletico aviacion') || normName.includes('atletico madrid') || normName.includes('atlético madrid') || normName.includes('atlético de madrid')) return CLUB_TACTICAL_PROFILES.esp_atletico;
    if (normName.includes('sur azulones') || normName.includes('getafe')) return CLUB_TACTICAL_PROFILES.esp_getafe;
    if (normName.includes('plana baixa') || normName.includes('villarreal')) return CLUB_TACTICAL_PROFILES.esp_villarreal;
    if (normName.includes('bizkaia rojiblanco') || normName.includes('athletic bilbao') || normName === 'athletic club') return CLUB_TACTICAL_PROFILES.esp_athletic;
    if (normName.includes('gipuzkoa txuri') || normName.includes('sociedad')) return CLUB_TACTICAL_PROFILES.esp_realsociedad;
    if (normName.includes('baleares bermellones') || normName.includes('mallorca')) return CLUB_TACTICAL_PROFILES.esp_mallorca;
    if (normName.includes('millonarios plate') || normName.includes('river plate')) return CLUB_TACTICAL_PROFILES.arg_river;
    if (normName.includes('xeneizes juniors') || normName.includes('boca juniors')) return CLUB_TACTICAL_PROFILES.arg_boca;
    if (normName.includes('academia avellaneda') || normName === 'racing club') return CLUB_TACTICAL_PROFILES.arg_racing;
    if (normName.includes('boedo ciclón') || normName.includes('boedo ciclon') || normName.includes('san lorenzo')) return CLUB_TACTICAL_PROFILES.arg_sanlorenzo;
    if (normName.includes('granate del sur') || normName.includes('lanus') || normName.includes('lanús')) return CLUB_TACTICAL_PROFILES.arg_lanus;
    if (normName.includes('bajo flores malevo') || normName.includes('riestra')) return CLUB_TACTICAL_PROFILES.arg_deportivoriestra;
    if (normName.includes('gávea rubro-negro') || normName.includes('gavea rubro-negro') || normName.includes('flamengo')) return CLUB_TACTICAL_PROFILES.bra_flamengo;
    if (normName.includes('palestra alviverde') || normName.includes('palmeiras')) return CLUB_TACTICAL_PROFILES.bra_palmeiras;
    if (normName.includes('estrela solitária') || normName.includes('estrela solitaria') || normName.includes('botafogo fr')) return CLUB_TACTICAL_PROFILES.bra_botafogo;
    if (normName.includes('toca celeste') || normName.includes('cruzeiro')) return CLUB_TACTICAL_PROFILES.bra_cruzeiro;
    if (normName.includes('itaquera alvinegro') || normName.includes('corinthians')) return CLUB_TACTICAL_PROFILES.bra_corinthians;
    if (normName.includes('bleus de paris') || normName.includes('paris saint') || normName.includes('psg')) return CLUB_TACTICAL_PROFILES.fr_psg;
    if (normName.includes('principauté rouge') || normName.includes('principaute rouge') || normName.includes('monaco')) return CLUB_TACTICAL_PROFILES.fr_monaco;
    if (normName.includes('phocéenne olympique') || normName.includes('phoceenne') || normName.includes('marseille')) return CLUB_TACTICAL_PROFILES.fr_marseille;
    if (normName.includes('rhône gones') || normName.includes('rhone gones') || normName.includes('olympique lyon') || normName === 'lyon') return CLUB_TACTICAL_PROFILES.fr_lyon;
  }

  // 4. Deterministic generator with authentic name generation and tactical balance
  let hash = 0;
  const str = `${normId}_${normName}_${countryCode}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Tactical Style Archetype Pools
  const archetypes: {
    primaryStyle: TacticalStyle;
    primaryFormation: FormationType;
    secondaryStyle: TacticalStyle;
    secondaryFormation: FormationType;
  }[] = [
    { primaryStyle: 'long_balls', primaryFormation: '4-4-2', secondaryStyle: 'catenaccio', secondaryFormation: '5-4-1' },
    { primaryStyle: 'long_balls', primaryFormation: '3-5-2', secondaryStyle: 'counter_attack', secondaryFormation: '4-4-2' },
    { primaryStyle: 'counter_attack', primaryFormation: '4-2-3-1', secondaryStyle: 'catenaccio', secondaryFormation: '5-3-2' },
    { primaryStyle: 'counter_attack', primaryFormation: '4-4-2', secondaryStyle: 'long_balls', secondaryFormation: '4-4-2' },
    { primaryStyle: 'gegenpressing', primaryFormation: '4-3-3', secondaryStyle: 'possession', secondaryFormation: '4-2-3-1' },
    { primaryStyle: 'gegenpressing', primaryFormation: '4-2-3-1', secondaryStyle: 'counter_attack', secondaryFormation: '4-3-3' },
    { primaryStyle: 'possession', primaryFormation: '4-3-3', secondaryStyle: 'gegenpressing', secondaryFormation: '3-4-2-1' },
    { primaryStyle: 'possession', primaryFormation: '4-2-3-1', secondaryStyle: 'possession', secondaryFormation: '4-3-3' },
    { primaryStyle: 'catenaccio', primaryFormation: '5-3-2', secondaryStyle: 'counter_attack', secondaryFormation: '4-4-2' },
    { primaryStyle: 'catenaccio', primaryFormation: '5-4-1', secondaryStyle: 'long_balls', secondaryFormation: '4-4-2' },
  ];

  const selectedArchetype = archetypes[absHash % archetypes.length];

  const upperCC = (countryCode || 'ENG').toUpperCase();
  const natCode = ['ENG', 'GB', 'UK'].includes(upperCC) ? 'ENG' : ['ESP', 'ES'].includes(upperCC) ? 'ESP' : ['FRA', 'FR'].includes(upperCC) ? 'FRA' : ['GER', 'DE', 'DEU'].includes(upperCC) ? 'GER' : ['ARG', 'AR'].includes(upperCC) ? 'ARG' : ['BRA', 'BR'].includes(upperCC) ? 'BRA' : 'ENG';

  const bank = COUNTRY_COACH_NAMES[natCode] || COUNTRY_COACH_NAMES.ENG;
  const firstName = bank.firstNames[absHash % bank.firstNames.length];
  const lastName = bank.lastNames[(absHash >> 3) % bank.lastNames.length];
  const generatedCoachName = `${firstName} ${lastName}`;

  const nationalityMap: Record<string, string> = {
    ENG: 'England',
    FRA: 'France',
    ESP: 'Spain',
    GER: 'Germany',
    ARG: 'Argentina',
    BRA: 'Brazil',
  };
  const nat = nationalityMap[natCode] || 'International';

  return {
    managerName: generatedCoachName,
    managerNationality: nat,
    primaryFormation: selectedArchetype.primaryFormation,
    primaryStyle: selectedArchetype.primaryStyle,
    secondaryFormation: selectedArchetype.secondaryFormation,
    secondaryStyle: selectedArchetype.secondaryStyle,
  };
}
