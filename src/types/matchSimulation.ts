import { YouthSeasonStats } from './youthLeague';

export type PlayerMatchStatus =
  | 'starter'
  | 'sub_out'
  | 'sub_in'
  | 'benched'
  | 'not_called'
  | 'sub'
  | 'bench'
  | 'suspended';

export interface MatchGoalScorerSummary {
  playerName: string;
  team: 'home' | 'away';
  minute: number;
  assistPlayerName?: string;
  isOwnGoal?: boolean;
  isPenalty?: boolean;
}

export interface MatchAssistProviderSummary {
  playerName: string;
  team: 'home' | 'away';
  assists: number;
}

export interface SimulatedMatchResult {
  matchId: string;
  matchIndex: number;
  stageName?: string; // e.g. "MATCH 1", "GROUP STAGE - MATCH 1"
  matchdayIndex?: number;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  playerTeamScore?: number;
  opponentScore?: number;
  isPlayerHome: boolean;
  playerStatus: PlayerMatchStatus;
  minutesPlayed?: number; // Exact minutes played on pitch (0 to 90+)
  playerGoals: number;
  playerAssists: number;
  playerRating?: number; // Shown if played
  isMvp: boolean;
  mvpName?: string;
  mvpRating?: number;
  goalScorers?: MatchGoalScorerSummary[];
  assistProviders?: MatchAssistProviderSummary[];
  yellowCard?: boolean;
  redCard?: boolean;
  isInjured?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  goalsConceded?: number; // For Goalkeepers
  cleanSheet?: boolean;
  playerFitness?: number; // Fitness percentage after match (0 to 100%)
  importanceCategory?: 'DEFINITIVE' | 'IMPORTANT' | 'REGULAR';
  isDerby?: boolean;
  derbyName?: string;
  importanceReason?: string;
  isKeyMatch?: boolean;
  calendarDate?: string;
  competitionName?: string;
  competitionType?: 'league' | 'cup' | 'continental' | 'supercup' | 'national';
  continentalCompId?: string;
  continentalStage?: 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'supercup';
  continentalMatchday?: number;
  isNationalTeamMatch?: boolean;
  nationalTier?: 'Senior' | 'U20' | 'U17';
  nationalCompName?: string;
  nationalWindow?: string;
  homeNationCode?: string;
  awayNationCode?: string;
  homeNationIso?: string;
  awayNationIso?: string;
  homeNationOvr?: number;
  awayNationOvr?: number;
  stadiumId?: string;
  stadiumName?: string;
  turfQuality?: 'pristine' | 'normal' | 'poor' | 'synthetic' | 'concrete' | 'sand';
  displayedHalfMinutes?: 35 | 45 | 6;
  matchMode?: 'pro' | 'youth' | 'street';
  homeSquadOvr?: number;
  awaySquadOvr?: number;
  syntheticInjuryApplied?: boolean;
}

export interface YouthBlockSimulationOutput {
  matches: SimulatedMatchResult[];
  aggregatedStats: YouthSeasonStats;
}
