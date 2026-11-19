import { PlayerCardData, PlayerConfig } from '../types';
import { EditorTeamData } from '../types/leagueEditor';
import { YouthSeasonStats, YouthLeagueStanding } from '../types/youthLeague';
import {
  resolvePlayerYouthLeagueStrict,
  getYouthLeagueTeamScaledSquad,
  YouthTeamData,
} from '../data/youthLeaguesDatabase';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { simulateFullProfessionalLeague } from './professionalLeagueEngine';
import { getYouthScaledTeamAndPlayers } from './youthSquadGenerator';
import { simulateDatabaseMatch, SimulatedDatabaseMatchResult } from './databaseMatchSimulationEngine';
import { invalidateTeamStrengthCache } from './lightweightMatchEngine';

export interface YouthLeaguePlayerLeaderEntry {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goals: number;
  assists: number;
  mvps: number;
  ratingSum: number;
  appearances: number;
  avgRating: number;
  isUserPlayer: boolean;
}

/**
 * Injects a Unique Career user player into a 23-player Youth EditorTeamData squad
 * by replacing the closest position match in slots 1..11 (or slot 10/11 outfield).
 */
export function injectUserPlayerIntoYouthEditorTeam(
  baseTeam: EditorTeamData,
  player: PlayerConfig,
  userOvrOverride?: number
): EditorTeamData {
  const cloned: EditorTeamData = {
    ...baseTeam,
    squadSaveFile: baseTeam.squadSaveFile
      ? {
          squad: baseTeam.squadSaveFile.squad.map((s) => ({
            slotNumber: s.slotNumber,
            player: s.player ? { ...s.player } : null,
          })),
          reserves: [...(baseTeam.squadSaveFile.reserves || [])],
          u20: [...(baseTeam.squadSaveFile.u20 || [])],
          u17: baseTeam.squadSaveFile.u17
            ? baseTeam.squadSaveFile.u17.map((s) => ({
                slotNumber: s.slotNumber,
                player: s.player ? { ...s.player } : null,
              }))
            : [],
        }
      : undefined,
  };

  const squad = cloned.squadSaveFile?.squad;
  if (!squad || squad.length === 0) return cloned;

  const userPos = (player.position || 'ATT').toUpperCase();
  const userSub = (player.subPosition || '').toUpperCase();
  const resolvedOvr = Math.max(35, Math.min(99, userOvrOverride ?? player.ovr ?? 60));

  const userCard: PlayerCardData = {
    ...(player as unknown as PlayerCardData),
    id: player.id || 'user-youth-player',
    name: player.name || 'Wonderkid',
    firstName: player.firstName || (player.name || 'Wonderkid').split(' ')[0],
    lastName: player.lastName || (player.name || 'Wonderkid').split(' ').slice(1).join(' ') || 'Wonderkid',
    ovr: resolvedOvr,
    overallRating: resolvedOvr,
    club: cloned.name,
    position: (userPos === 'GK' || userPos === 'DEF' || userPos === 'MID' || userPos === 'ATT'
      ? userPos
      : 'ATT') as PlayerCardData['position'],
    subPosition: userSub || (userPos === 'GK' ? 'GK' : userPos === 'DEF' ? 'CB' : userPos === 'MID' ? 'CM' : 'ST'),
  };

  // Pick starter slot matching subPosition first, then primary position, else slot 10
  let targetIdx = squad.findIndex(
    (s) => s.slotNumber >= 1 && s.slotNumber <= 11 && s.player && (s.player.subPosition || '').toUpperCase() === userCard.subPosition
  );
  if (targetIdx === -1) {
    targetIdx = squad.findIndex(
      (s) => s.slotNumber >= 1 && s.slotNumber <= 11 && s.player && (s.player.position || '').toUpperCase() === userCard.position
    );
  }
  if (targetIdx === -1) {
    targetIdx = userCard.position === 'GK' ? 0 : Math.min(9, squad.length - 1);
  }

  if (squad[targetIdx]) {
    squad[targetIdx].player = userCard;
  }

  return cloned;
}

function buildScaledEditorTeamForYouthClub(
  club: YouthTeamData,
  age: number,
  customName?: string
): { editorTeam: EditorTeamData; teamOvr: number } {
  const scaled =
    customName && customName.toLowerCase() !== club.name.toLowerCase()
      ? getYouthScaledTeamAndPlayers(
          {
            id: club.id,
            name: customName,
            country: club.country,
            city: club.city,
            youthLeague: club.youthLeague,
            ovr: club.ovr,
            primaryColor: club.kit?.color1,
            secondaryColor: club.kit?.color2,
            tierClass: club.tierClass,
            stadiumId: club.stadiumId,
            kit: club.kit,
          },
          age,
          'league'
        )
      : getYouthLeagueTeamScaledSquad(club, age) ||
        getYouthScaledTeamAndPlayers(
          {
            id: club.id,
            name: customName || club.name,
            country: club.country,
            city: club.city,
            youthLeague: club.youthLeague,
            ovr: club.ovr,
            primaryColor: club.kit?.color1,
            secondaryColor: club.kit?.color2,
            tierClass: club.tierClass,
            stadiumId: club.stadiumId,
            kit: club.kit,
          },
          age,
          'league'
        );

  return { editorTeam: scaled.team, teamOvr: scaled.teamOvr };
}

/**
 * Simulates a full Youth or Pro League season for the teams in the player's league.
 * For Youth players, executes a full 23-player double round-robin simulation via
 * `simulateDatabaseMatch` (mirrored after `professionalLeagueEngine.ts`).
 * For professional players, delegates to the authentic national professional league simulator.
 */
export function simulateFullYouthLeagueStandings(
  player: PlayerConfig,
  playerStats: YouthSeasonStats
): {
  standings: YouthLeagueStanding[];
  playerTeamStanding: YouthLeagueStanding;
  playerTeamQualified: boolean;
  leagueName: string;
  topScorers?: YouthLeaguePlayerLeaderEntry[];
  topAssisters?: YouthLeaguePlayerLeaderEntry[];
  mvpLeaderboard?: YouthLeaguePlayerLeaderEntry[];
  totalMatchesSimulated?: number;
  fixtureResults?: SimulatedDatabaseMatchResult[];
} {
  const isPro = isProfessionalPlayer(player);

  if (isPro) {
    const proSim = simulateFullProfessionalLeague(player, playerStats);
    return {
      standings: proSim.standings,
      playerTeamStanding: proSim.playerTeamStanding,
      playerTeamQualified: false, // Professional leagues never qualify for youth cup
      leagueName: proSim.leagueName,
    };
  }

  const leagueData = resolvePlayerYouthLeagueStrict(player);
  const leagueName = leagueData.name;
  const playerClubName = player.club || leagueData.teams[0]?.name || 'Youth Academy Club';
  const clampedAge = Math.max(10, Math.min(16, Math.round(player.age || 16)));

  const matchedIndex = leagueData.teams.findIndex(
    (t) => t.name.toLowerCase() === playerClubName.toLowerCase()
  );
  const playerTeamIdx = matchedIndex >= 0 ? matchedIndex : 0;

  // Build age-scaled 23-player EditorTeamData per team in this Youth League
  const preparedTeams = leagueData.teams.map((rawTeam, idx) => {
    const isPlayerTeam = idx === playerTeamIdx;
    const effectiveName = isPlayerTeam && matchedIndex < 0 ? playerClubName : rawTeam.name;
    const { editorTeam: baseEditorTeam, teamOvr: baseYouthOvr } = buildScaledEditorTeamForYouthClub(
      rawTeam,
      clampedAge,
      effectiveName
    );

    let editorTeam = baseEditorTeam;
    let displayOvr = baseYouthOvr;

    if (isPlayerTeam) {
      editorTeam = injectUserPlayerIntoYouthEditorTeam(baseEditorTeam, player);
      const userBonus = (playerStats.avgRating - 6.5) * 1.2;
      displayOvr = Math.max(35, Math.min(99, Math.round(baseYouthOvr * 0.8 + (player.ovr || baseYouthOvr) * 0.2 + userBonus)));
    }

    invalidateTeamStrengthCache(editorTeam.id);

    return {
      teamId: editorTeam.id,
      teamName: editorTeam.name,
      isPlayerTeam,
      teamOvr: displayOvr,
      editorTeam,
    };
  });

  // Track standings per team
  const statsMap = new Map<
    string,
    {
      teamId: string;
      teamName: string;
      W: number;
      D: number;
      L: number;
      GF: number;
      GA: number;
      pts: number;
      isPlayer: boolean;
      teamOvr: number;
    }
  >();

  preparedTeams.forEach((pt) => {
    statsMap.set(pt.teamId, {
      teamId: pt.teamId,
      teamName: pt.teamName,
      W: 0,
      D: 0,
      L: 0,
      GF: 0,
      GA: 0,
      pts: 0,
      isPlayer: pt.isPlayerTeam,
      teamOvr: pt.teamOvr,
    });
  });

  // Track individual player stats across all 90 simulated Youth fixtures
  const playerLeadersMap = new Map<string, YouthLeaguePlayerLeaderEntry>();
  const fixtureResults: SimulatedDatabaseMatchResult[] = [];
  const competitionId = `youth_${leagueData.id}`;
  let matchCounter = 0;

  const accumulatePlayers = (teamPlayers: SimulatedDatabaseMatchResult['homePlayers']) => {
    teamPlayers.forEach((mp) => {
      const existing = playerLeadersMap.get(mp.id);
      if (existing) {
        existing.goals += mp.goals || 0;
        existing.assists += mp.assists || 0;
        existing.mvps += mp.isMvp ? 1 : 0;
        existing.ratingSum += mp.rating || 6.0;
        existing.appearances += 1;
        existing.avgRating = parseFloat((existing.ratingSum / existing.appearances).toFixed(2));
      } else {
        playerLeadersMap.set(mp.id, {
          playerId: mp.id,
          playerName: mp.name,
          teamId: mp.teamId,
          teamName: mp.teamName,
          goals: mp.goals || 0,
          assists: mp.assists || 0,
          mvps: mp.isMvp ? 1 : 0,
          ratingSum: mp.rating || 6.0,
          appearances: 1,
          avgRating: mp.rating || 6.0,
          isUserPlayer: Boolean(mp.isUserPlayer),
        });
      }
    });
  };

  // Full Double Round-Robin Simulation (10 clubs -> 90 matches, 18 per team) via simulateDatabaseMatch
  for (let i = 0; i < preparedTeams.length; i++) {
    for (let j = i + 1; j < preparedTeams.length; j++) {
      const teamA = preparedTeams[i];
      const teamB = preparedTeams[j];

      for (let leg = 0; leg < 2; leg++) {
        matchCounter++;
        const home = leg === 0 ? teamA : teamB;
        const away = leg === 0 ? teamB : teamA;
        const involvesUser = home.isPlayerTeam || away.isPlayerTeam;

        const simResult = simulateDatabaseMatch(home.editorTeam, away.editorTeam, {
          competitionId,
          competitionName: leagueName,
          stageName: `Matchday ${Math.min(18, Math.ceil(matchCounter / 5))}`,
          matchdayIndex: Math.min(18, Math.ceil(matchCounter / 5)),
          userPlayer: involvesUser ? (player as unknown as PlayerCardData) : undefined,
        });

        fixtureResults.push(simResult);
        accumulatePlayers(simResult.homePlayers);
        accumulatePlayers(simResult.awayPlayers);

        const homeStat = statsMap.get(home.teamId);
        const awayStat = statsMap.get(away.teamId);
        if (homeStat && awayStat) {
          homeStat.GF += simResult.homeScore;
          homeStat.GA += simResult.awayScore;
          awayStat.GF += simResult.awayScore;
          awayStat.GA += simResult.homeScore;

          if (simResult.homeScore > simResult.awayScore) {
            homeStat.W += 1;
            homeStat.pts += 3;
            awayStat.L += 1;
          } else if (simResult.homeScore < simResult.awayScore) {
            awayStat.W += 1;
            awayStat.pts += 3;
            homeStat.L += 1;
          } else {
            homeStat.D += 1;
            homeStat.pts += 1;
            awayStat.D += 1;
            awayStat.pts += 1;
          }
        }
      }
    }
  }

  // Sort standings by Points desc, Goal Difference desc, Goals For desc, Team OVR desc
  const sorted = Array.from(statsMap.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.GF - a.GA;
    const gdB = b.GF - b.GA;
    if (gdB !== gdA) return gdB - gdA;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return b.teamOvr - a.teamOvr;
  });

  const standings: YouthLeagueStanding[] = sorted.map((s, idx) => {
    const rank = idx + 1;
    const qualifiedForIntCup = rank <= 2;

    return {
      rank,
      teamId: s.teamId,
      teamName: s.teamName,
      played: s.W + s.D + s.L,
      won: s.W,
      drawn: s.D,
      lost: s.L,
      goalsFor: s.GF,
      goalsAgainst: s.GA,
      goalDifference: s.GF - s.GA,
      points: s.pts,
      isPlayerTeam: s.isPlayer,
      qualifiedForIntCup,
      teamOvr: s.teamOvr,
      qualificationBadge: qualifiedForIntCup
        ? {
            type: 'youth_intl_cup',
            label: "Int'l Youth Cup",
            shortLabel: "Int'l Youth Cup",
            badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
            iconName: 'trophy',
          }
        : {
            type: 'none',
            label: 'Youth League',
            shortLabel: 'Youth League',
            badgeClass: 'bg-slate-800/50 text-slate-500 border-slate-700/50',
            iconName: 'shield',
          },
      qualificationText: qualifiedForIntCup ? "Int'l Youth Cup" : 'Youth League',
    };
  });

  const playerTeamStanding = standings.find((s) => s.isPlayerTeam) || standings[0];

  const allPlayerLeaders = Array.from(playerLeadersMap.values());
  const topScorers = [...allPlayerLeaders]
    .filter((e) => e.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.avgRating - a.avgRating)
    .slice(0, 15);
  const topAssisters = [...allPlayerLeaders]
    .filter((e) => e.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.avgRating - a.avgRating)
    .slice(0, 15);
  const mvpLeaderboard = [...allPlayerLeaders]
    .sort((a, b) => b.mvps - a.mvps || b.avgRating - a.avgRating)
    .slice(0, 15);

  return {
    standings,
    playerTeamStanding,
    playerTeamQualified: playerTeamStanding.qualifiedForIntCup,
    leagueName,
    topScorers,
    topAssisters,
    mvpLeaderboard,
    totalMatchesSimulated: fixtureResults.length,
    fixtureResults,
  };
}
