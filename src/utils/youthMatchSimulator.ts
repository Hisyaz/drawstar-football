import { PlayerCardData, PlayerConfig } from '../types';
import { EditorTeamData } from '../types/leagueEditor';
import { StadiumDefinition } from '../gameplay/types/stadium';
import { FederationName, YouthSeasonStats } from '../types/youthLeague';
import {
  MatchAssistProviderSummary,
  MatchGoalScorerSummary,
  PlayerMatchStatus,
  SimulatedMatchResult,
  YouthBlockSimulationOutput,
} from '../types/matchSimulation';
import {
  getYouthLeagueTeamScaledSquad,
  resolvePlayerYouthLeagueStrict,
  YouthTeamData,
} from '../data/youthLeaguesDatabase';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { classifyMatchImportance } from './matchImportanceSystem';
import { detectPlayerContinentalCompetition } from './continentalScheduleIntegration';
import { CONTINENTAL_COMPETITIONS_CATALOG } from './continentalDatabaseSystem';
import { buildUnifiedSeasonBlockMatches } from './continentalScheduleIntegration';
import { injectNationalTeamMatchesIntoBlock } from './internationalScheduleIntegration';
import { simulatePlayerGoalsAndAssists } from './goalAssistSimulationModifiers';
import { resolveAuthoritativeClubContext } from './clubContextRebuilder';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { getSanitizedTeamsForLeague } from './leagueSanitizer';
import { getWorldSimulationState } from './worldSimulationEngine';
import {
  getPermanentStamina,
  getFitnessPercentage,
  calculateFitnessRecovery,
  calculateFitnessChangeByStatus,
  calculateInjuryRisk,
  checkManagerSelection,
  generateRandomInjury,
} from './staminaInjurySystem';
import {
  getOrCreateDisciplinaryRecord,
  checkAndApplyStageYellowClear,
  checkIsSuspendedForMatch,
  serveSuspensionForMatch,
  recordMatchDisciplinaryEvents,
} from './competitionDisciplinarySystem';
import {
  getBadRepRedCardChanceMultiplier,
  addBadReputation,
} from './badReputationSystem';
import { getYouthScaledTeamAndPlayers } from './youthSquadGenerator';
import {
  simulateDatabaseMatch,
  SimulatedDatabaseMatchResult,
} from './databaseMatchSimulationEngine';
import { invalidateTeamStrengthCache } from './lightweightMatchEngine';
import { injectUserPlayerIntoYouthEditorTeam } from './youthLeagueSimulation';
import { resolveYouthStadiumForClub } from '../gameplay/game/stadiumRegistry';
import { getTurfInjuryMultiplier } from '../gameplay/game/turfPhysics';
import {
  buildIntlCupEditorTeam,
  resolveIntlYouthCupFinalVenueConfig,
} from './internationalYouthCupEngine';

function inferCupFederation(country?: string): FederationName {
  const c = (country || '').toLowerCase();
  if (c === 'argentina' || c === 'brazil') return 'CONMEBOL';
  if (c === 'japan' || c === 'south korea' || c === 'saudi arabia') return 'AFC';
  return 'UEFA';
}

export function getCountryCupName(countryCodeOrName?: string): string {
  const code = (countryCodeOrName || '').toUpperCase().trim();
  if (code === 'ENG' || code === 'ENGLAND' || code === 'GB' || code === 'UK') return 'English Cup';
  if (code === 'ESP' || code === 'SPAIN') return 'Spanish Cup';
  if (code === 'FR' || code === 'FRA' || code === 'FRANCE') return 'French Cup';
  if (code === 'GER' || code === 'DEU' || code === 'GERMANY') return 'German Cup';
  if (code === 'ITA' || code === 'ITALY' || code === 'ITALIA') return 'Italian Cup';
  if (code === 'POR' || code === 'PRT' || code === 'PORTUGAL') return 'Portuguese Cup';
  if (code === 'ARG' || code === 'ARGENTINA') return 'Argentinean Cup';
  if (code === 'BRA' || code === 'BRAZIL' || code === 'BRASIL') return 'Brazilian Cup';
  if (code === 'KSA' || code === 'SAU' || code === 'SAUDI' || code === 'SAUDI ARABIA') return 'Saudi Cup';
  return 'Domestic Cup';
}

/**
 * Generates individual match results for a Youth or Pro Career block (9 matches per half-season block)
 */
export function generateYouthBlockMatches(
  player: PlayerConfig,
  blockNumber: 1 | 2,
  acceptedManagerRole: boolean = true
): YouthBlockSimulationOutput {
  const isPro = isProfessionalPlayer(player);
  const age = player.age || 10;
  const squadDest = player.squadDestination || (isPro ? (age <= 16 ? 'U17' : age <= 18 ? 'U20' : 'First Team') : 'Youth');
  const leagueData = resolvePlayerYouthLeagueStrict(player);
  const categoryLabel = isPro ? '' : `U${age}`;

  const careerDb = getCareerLeagueDatabase();

  // Resolve authoritative club and league context
  const authContext = isPro
    ? resolveAuthoritativeClubContext(player.club || '', careerDb)
    : null;

  const playerClubName = isPro
    ? (authContext?.club || player.club || 'Pro Club')
    : (player.club || leagueData.teams[0]?.name || 'Youth Academy FC');

  // Get opponent teams exclusively from the authoritative competition
  let opponentTeams: { name: string; ovr: number; leagueId?: string; ylTeam?: YouthTeamData }[] = [];
  if (isPro && authContext && authContext.leagueId) {
    const sanitizedTeams = getSanitizedTeamsForLeague(authContext.leagueId, careerDb);
    opponentTeams = sanitizedTeams
      .filter((t) => t.name.toLowerCase() !== playerClubName.toLowerCase() && !t.name.toLowerCase().includes(playerClubName.toLowerCase()))
      .map((t) => ({
        name: t.name,
        ovr: t.ovr || 75,
        leagueId: authContext.leagueId,
      }));

    if (opponentTeams.length === 0 && authContext.canonicalD1Id) {
      const fallbackLeagueTeams = getSanitizedTeamsForLeague(authContext.canonicalD1Id, careerDb);
      opponentTeams = fallbackLeagueTeams
        .filter((t) => t.name.toLowerCase() !== playerClubName.toLowerCase())
        .map((t) => ({ name: t.name, ovr: t.ovr || 75, leagueId: authContext.canonicalD1Id }));
    }
  } else {
    opponentTeams = leagueData.teams
      .filter((t) => t.name.toLowerCase() !== playerClubName.toLowerCase())
      .map((t) => ({ name: t.name, ovr: t.ovr, ylTeam: t }));
  }

  // Pre-build 23-player age-scaled Youth EditorTeamData rosters & club stadium resolution for Youth mode
  const youthAge = Math.max(10, Math.min(16, Math.round(age || 16)));
  const youthTeamPreparedMap = new Map<
    string,
    { editorTeam: EditorTeamData; stadium: StadiumDefinition; squadOvr: number }
  >();

  if (!isPro) {
    const matchedPlayerTeam = leagueData.teams.find(
      (t) => t.name.toLowerCase() === playerClubName.toLowerCase()
    );
    const seedTeams = matchedPlayerTeam
      ? leagueData.teams
      : [
          {
            ...leagueData.teams[0],
            id: `youth-custom-${playerClubName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
            name: playerClubName,
          },
          ...leagueData.teams.slice(1),
        ];

    seedTeams.forEach((rawTeam) => {
      const isPlayerClub = rawTeam.name.toLowerCase() === playerClubName.toLowerCase();
      const scaled =
        getYouthLeagueTeamScaledSquad(rawTeam, youthAge) ||
        getYouthScaledTeamAndPlayers(
          {
            id: rawTeam.id,
            name: rawTeam.name,
            country: rawTeam.country,
            city: rawTeam.city,
            youthLeague: rawTeam.youthLeague,
            federation: inferCupFederation(rawTeam.country),
            ovr: rawTeam.ovr,
            primaryColor: rawTeam.kit?.color1,
            secondaryColor: rawTeam.kit?.color2,
            tierClass: rawTeam.tierClass,
            stadiumId: rawTeam.stadiumId,
            kit: rawTeam.kit,
          },
          youthAge,
          'league'
        );

      const stadium = resolveYouthStadiumForClub(
        {
          name: rawTeam.name,
          country: rawTeam.country,
          stadiumId: rawTeam.stadiumId,
          tierClass: rawTeam.tierClass,
        },
        false
      );

      let editorTeam: EditorTeamData = {
        ...scaled.team,
        stadium: {
          name: stadium.name,
          capacity: stadium.capacity || 2000,
          tier: rawTeam.tierClass === 'big' ? 2 : 1,
          gameplayStadiumId: stadium.id,
        },
      };

      if (isPlayerClub) {
        editorTeam = injectUserPlayerIntoYouthEditorTeam(editorTeam, player);
      }

      invalidateTeamStrengthCache(editorTeam.id);
      youthTeamPreparedMap.set(rawTeam.name.toLowerCase(), {
        editorTeam,
        stadium,
        squadOvr: scaled.teamOvr,
      });
    });
  }

  const totalMatchesInBlock = 9; // Double round robin = 18 total matches (9 per block)
  const ovr = player.ovr || 60;
  const staminaAttr = getPermanentStamina(player);
  let currentFitness = getFitnessPercentage(player);
  const primaryPos = player.position || 'ATT';

  const matches: SimulatedMatchResult[] = [];

  let gamesPlayed = 0;
  let starts = 0;
  let subs = 0;
  let benchCount = 0;
  let totalMinutesPlayed = 0;
  let totalMvps = 0;
  let totalGoals = 0;
  let totalAssists = 0;
  let totalRatingSum = 0;
  let cleanSheets = 0;
  let yellowCards = 0;
  let redCards = 0;
  let injuryMatchesMissed = 0;
  let remainingInjuryMatches = player.isInjured
    ? Math.max(1, Math.ceil((player.injuryWeeksRemaining || 2) / 2))
    : 0;

  for (let i = 0; i < totalMatchesInBlock; i++) {
    const matchNumber = (blockNumber - 1) * totalMatchesInBlock + i + 1;
    let opponent = opponentTeams[i % opponentTeams.length] || { name: 'Rivals FC', ovr: 60 };
    let isPlayerHome = i % 2 === 0;

    let homeTeamName = '';
    let awayTeamName = '';
    let competitionName = 'League Match';

    if (isPro && authContext) {
      // MATCHMAKING VALIDATION: Ensure domestic opponent matches the authoritative league
      const cupName = getCountryCupName(authContext.countryCode || authContext.clubCountry);
      const contCompId = detectPlayerContinentalCompetition(player, careerDb);
      const contMeta = contCompId ? CONTINENTAL_COMPETITIONS_CATALOG[contCompId] : null;
      const intlName = contMeta ? contMeta.name : null;

      if (squadDest === 'First Team') {
        if (i % 4 === 1) {
          competitionName = cupName;
          homeTeamName = isPlayerHome ? playerClubName : opponent.name;
          awayTeamName = isPlayerHome ? opponent.name : playerClubName;
        } else if (i % 4 === 3 && intlName) {
          competitionName = intlName;
          homeTeamName = isPlayerHome ? playerClubName : opponent.name;
          awayTeamName = isPlayerHome ? opponent.name : playerClubName;
        } else {
          competitionName = authContext.league;
          // Synchronize with authoritative World Results fixture schedule
          try {
            const worldState = getWorldSimulationState(undefined, careerDb, player as any);
            for (const league of Object.values(worldState.leagues)) {
              if (
                league.name.toLowerCase() === authContext.league.toLowerCase() ||
                (authContext.canonicalD1Id && league.leagueId === authContext.canonicalD1Id)
              ) {
                const fixtures = league.matchdays[matchNumber] || [];
                const matchedFix = fixtures.find(
                  (f) =>
                    f.homeTeamName.toLowerCase() === playerClubName.toLowerCase() ||
                    f.awayTeamName.toLowerCase() === playerClubName.toLowerCase()
                );
                if (matchedFix) {
                  const isUserHome = matchedFix.homeTeamName.toLowerCase() === playerClubName.toLowerCase();
                  isPlayerHome = isUserHome;
                  homeTeamName = matchedFix.homeTeamName;
                  awayTeamName = matchedFix.awayTeamName;
                  opponent = {
                    name: isUserHome ? matchedFix.awayTeamName : matchedFix.homeTeamName,
                    ovr: isUserHome ? (matchedFix.awayTeamOvr || 75) : (matchedFix.homeTeamOvr || 75),
                    leagueId: authContext.canonicalD1Id,
                  };
                  break;
                }
              }
            }
          } catch (e) {
            // graceful fallback
          }

          if (!homeTeamName) {
            homeTeamName = isPlayerHome ? playerClubName : opponent.name;
            awayTeamName = isPlayerHome ? opponent.name : playerClubName;
          }
        }
      } else if (squadDest === 'Reserves') {
        competitionName = i % 4 === 1 ? `${authContext.league} Reserves Cup` : `${authContext.league} Reserves`;
        homeTeamName = isPlayerHome ? `${playerClubName} Reserves` : `${opponent.name} Reserves`;
        awayTeamName = isPlayerHome ? `${opponent.name} Reserves` : `${playerClubName} Reserves`;
      } else if (squadDest === 'U20') {
        competitionName = i % 4 === 1 ? `${authContext.league} U20 Cup` : `${authContext.league} U20`;
        homeTeamName = isPlayerHome ? `${playerClubName} U20` : `${opponent.name} U20`;
        awayTeamName = isPlayerHome ? `${opponent.name} U20` : `${playerClubName} U20`;
      } else {
        // U17
        competitionName = i % 4 === 1 ? `${authContext.league} U17 Cup` : `${authContext.league} U17`;
        homeTeamName = isPlayerHome ? `${playerClubName} U17` : `${opponent.name} U17`;
        awayTeamName = isPlayerHome ? `${opponent.name} U17` : `${playerClubName} U17`;
      }
    } else {
      const resolvedYouthName = player.youthLeagueName || leagueData.name;
      competitionName = `${resolvedYouthName} ${categoryLabel}`;
      homeTeamName = isPlayerHome ? `${playerClubName} ${categoryLabel}` : `${opponent.name} ${categoryLabel}`;
      awayTeamName = isPlayerHome ? `${opponent.name} ${categoryLabel}` : `${playerClubName} ${categoryLabel}`;
    }

    // Apply rest/recovery between matches (3.5 days)
    if (i > 0) {
      const recovered = calculateFitnessRecovery(staminaAttr, 3.5);
      currentFitness = Math.min(100, parseFloat((currentFitness + recovered).toFixed(1)));
    }

    // Check injury status
    let isInjuredThisMatch = false;
    if (remainingInjuryMatches > 0) {
      isInjuredThisMatch = true;
      remainingInjuryMatches--;
      injuryMatchesMissed++;
    }

    // Determine match selection and status
    // Statuses: 'starter', 'sub_out', 'sub_in', 'benched', 'not_called'
    let status: PlayerMatchStatus = 'benched';
    let minutesPlayed = 0;

    // Calculate dynamic match importance (Definitive, Important, Regular)
    const importanceEval = classifyMatchImportance({
      stageTitle: `Match ${matchNumber}`,
      competitionName,
      teamAName: isPlayerHome ? homeTeamName : awayTeamName,
      teamBName: isPlayerHome ? awayTeamName : homeTeamName,
      currentMatchIndex: matchNumber - 1,
      totalMatchesInSeason: 18,
      playerPlayMode: player.keyMatchPlayMode || 'decisive',
    });

    const isImportantMatch =
      importanceEval.category === 'DEFINITIVE' ||
      importanceEval.category === 'IMPORTANT' ||
      i === totalMatchesInBlock - 1;

    if (!isInjuredThisMatch) {
      const selection = checkManagerSelection(
        { ...player, fitness: currentFitness, staminaCurrent: currentFitness, isInjured: false },
        isImportantMatch
      );

      if (selection.recommendedStatus === 'starter') {
        // Decide if subbed out before minute 70 or plays 70+ mins
        const isSubbedOutEarly = !isImportantMatch && (currentFitness < 75 || Math.random() < 0.25);
        if (isSubbedOutEarly) {
          minutesPlayed = Math.floor(48 + Math.random() * 20); // 48 - 67 mins (< 70)
          status = 'sub_out';
        } else {
          minutesPlayed = Math.floor(70 + Math.random() * 21); // 70 - 90 mins
          status = 'starter';
        }
        starts++;
        gamesPlayed++;
      } else if (selection.recommendedStatus === 'sub') {
        // Roll if sub enters the match (~80% enters, ~20% benched all game)
        const willEnter = Math.random() < 0.80;
        if (willEnter) {
          minutesPlayed = Math.floor(18 + Math.random() * 28); // 18 - 45 mins
          status = 'sub_in';
          subs++;
          gamesPlayed++;
        } else {
          minutesPlayed = 0;
          status = 'benched';
          benchCount++;
        }
      } else {
        minutesPlayed = 0;
        status = 'benched';
        benchCount++;
      }
    } else {
      minutesPlayed = 0;
      status = 'not_called';
      benchCount++;
    }

    // Apply fitness change according to new status and minutes played
    const fitChange = calculateFitnessChangeByStatus(staminaAttr, status, minutesPlayed);
    currentFitness = Math.max(0, Math.min(100, parseFloat((currentFitness + fitChange.netChange).toFixed(1))));

    const isPlayed = status === 'starter' || status === 'sub_out' || status === 'sub_in';

    let playerTeamScore = 0;
    let opponentTeamScore = 0;
    let homeScore = 0;
    let awayScore = 0;
    let playerGoals = 0;
    let playerAssists = 0;
    let matchRating: number | undefined = undefined;
    let isMvp = false;
    let mvpName: string | undefined = undefined;
    let mvpRating: number | undefined = undefined;
    let matchYellow = false;
    let matchRed = false;
    let goalScorers: MatchGoalScorerSummary[] | undefined = undefined;
    let assistProviders: MatchAssistProviderSummary[] | undefined = undefined;
    let stadiumId: string | undefined = undefined;
    let stadiumName: string | undefined = undefined;
    let turfQuality: SimulatedMatchResult['turfQuality'] = undefined;
    let displayedHalfMinutes: SimulatedMatchResult['displayedHalfMinutes'] = undefined;
    let matchMode: SimulatedMatchResult['matchMode'] = undefined;
    let homeSquadOvr: number | undefined = undefined;
    let awaySquadOvr: number | undefined = undefined;
    let syntheticInjuryApplied: boolean | undefined = undefined;

    if (!isPro) {
      // PHASE 7 YOUTH MATCH ENGINE: 23-player squads + simulateDatabaseMatch + BIG/SMALL stadium + synthetic turf +10% injury
      const playerPrep = youthTeamPreparedMap.get(playerClubName.toLowerCase());
      const oppPrep = youthTeamPreparedMap.get(opponent.name.toLowerCase());

      if (playerPrep && oppPrep) {
        const homePrep = isPlayerHome ? playerPrep : oppPrep;
        const awayPrep = isPlayerHome ? oppPrep : playerPrep;
        const matchStadium = homePrep.stadium;

        stadiumId = matchStadium.id;
        stadiumName = matchStadium.name;
        turfQuality = matchStadium.turfQuality;
        displayedHalfMinutes = 35;
        matchMode = 'youth';
        syntheticInjuryApplied = matchStadium.turfQuality === 'synthetic';

        const simResult: SimulatedDatabaseMatchResult = simulateDatabaseMatch(
          homePrep.editorTeam,
          awayPrep.editorTeam,
          {
            competitionId: `youth_${leagueData.id}`,
            competitionName,
            stageName: `MATCH ${matchNumber}`,
            matchdayIndex: matchNumber,
            userPlayer: isPlayed ? (player as unknown as PlayerCardData) : undefined,
          }
        );

        homeScore = simResult.homeScore;
        awayScore = simResult.awayScore;
        homeSquadOvr = simResult.homeTeamOvr;
        awaySquadOvr = simResult.awayTeamOvr;
        playerTeamScore = isPlayerHome ? homeScore : awayScore;
        opponentTeamScore = isPlayerHome ? awayScore : homeScore;

        goalScorers = [
          ...simResult.homeScorers.map((s) => ({
            playerName: s.name,
            team: 'home' as const,
            minute: s.minute,
            assistPlayerName: s.assistPlayerName,
            isOwnGoal: (s as any).isOwnGoal,
          })),
          ...simResult.awayScorers.map((s) => ({
            playerName: s.name,
            team: 'away' as const,
            minute: s.minute,
            assistPlayerName: s.assistPlayerName,
            isOwnGoal: (s as any).isOwnGoal,
          })),
        ].sort((a, b) => a.minute - b.minute);

        assistProviders = [
          ...simResult.homePlayers
            .filter((p) => (p.assists || 0) > 0)
            .map((p) => ({ playerName: p.name, team: 'home' as const, assists: p.assists })),
          ...simResult.awayPlayers
            .filter((p) => (p.assists || 0) > 0)
            .map((p) => ({ playerName: p.name, team: 'away' as const, assists: p.assists })),
        ];

        mvpName = simResult.mvpPlayer?.name;
        mvpRating = simResult.mvpPlayer?.rating;

        if (isPlayed && minutesPlayed > 0) {
          const userTeamRoster = isPlayerHome ? simResult.homePlayers : simResult.awayPlayers;
          const userBox =
            userTeamRoster.find((p) => p.isUserPlayer) ||
            userTeamRoster.find((p) => p.id === player.id || p.name === player.name);

          const oppEffectiveOvr = Math.max(40, isPlayerHome ? simResult.awayTeamOvr : simResult.homeTeamOvr);
          const perfFactor = (minutesPlayed / 90) * (ovr / oppEffectiveOvr);
          const sim = simulatePlayerGoalsAndAssists(player, perfFactor, playerTeamScore, {
            teamStrategy: (player as any).teamStrategy || (player as any).tactics?.style,
            minutesPlayed,
            opponentOvr: oppEffectiveOvr,
          });

          const rawGoals = Math.max(userBox?.goals || 0, sim.playerGoals);
          playerGoals = Math.min(rawGoals, playerTeamScore);
          playerAssists = Math.min(
            Math.max(userBox?.assists || 0, sim.playerAssists),
            Math.max(0, playerTeamScore - (playerGoals > 0 ? 0 : 0))
          );

          if ((primaryPos === 'DEF' || primaryPos === 'GK') && opponentTeamScore === 0) {
            cleanSheets++;
          }

          const dribbleGoals = Math.min(playerGoals, (sim as any).dribbleGoals || 0);
          const regularGoals = playerGoals - dribbleGoals;
          const dribbleAssists = Math.min(playerAssists, (sim as any).dribbleAssists || 0);
          const regularAssists = playerAssists - dribbleAssists;

          const baseEngineRating = userBox?.rating ?? 6.3 + (perfFactor - 0.8) * 1.6;
          const adjustedRating =
            baseEngineRating +
            (regularGoals * 0.45 + dribbleGoals * 0.9) +
            (regularAssists * 0.3 + dribbleAssists * 0.6);
          matchRating = parseFloat(Math.min(10.0, Math.max(5.5, adjustedRating)).toFixed(1));

          totalGoals += playerGoals;
          totalAssists += playerAssists;
          totalRatingSum += matchRating;

          if (
            userBox?.isMvp ||
            (mvpRating !== undefined && matchRating >= mvpRating) ||
            (matchRating >= 8.2 && (playerGoals > 0 || playerAssists > 0))
          ) {
            isMvp = true;
            mvpName = player.name || mvpName;
            mvpRating = Math.max(mvpRating || 0, matchRating);
            totalMvps++;
          }

          totalMinutesPlayed += minutesPlayed;

          const redMultiplier = getBadRepRedCardChanceMultiplier(player.badReputationTier || 0);
          if ((userBox?.redCards || 0) > 0 || Math.random() < 0.02 * redMultiplier) {
            matchRed = true;
            redCards++;
            const repRes = addBadReputation(player as any, 10);
            player.badReputation = repRes.updatedPlayer.badReputation;
            player.badReputationTier = repRes.updatedPlayer.badReputationTier;
          } else if ((userBox?.yellowCards || 0) > 0 || Math.random() < 0.12) {
            matchYellow = true;
            yellowCards++;
          }

          // Synthetic-pitch +10% injury risk multiplier via getTurfInjuryMultiplier
          const { riskPercentage } = calculateInjuryRisk({
            ...player,
            fitness: currentFitness,
            staminaCurrent: currentFitness,
          });
          const turfMultiplier = getTurfInjuryMultiplier(matchStadium.turfQuality);
          const effectiveRiskPct = riskPercentage * turfMultiplier;

          if (Math.random() * 100 < effectiveRiskPct) {
            isInjuredThisMatch = true;
            const inj = generateRandomInjury();
            remainingInjuryMatches = Math.max(1, Math.ceil((inj.weeks || 2) / 2));
          }
        }
      }
    } else {
      // PRO PATH: preserved unchanged
      const playerTeamOvr = ovr + 2;
      const opponentOvr = opponent.ovr || 60;
      const teamOvrDiff = playerTeamOvr - opponentOvr;

      playerTeamScore = Math.max(0, Math.floor(1.5 + teamOvrDiff * 0.05 + (Math.random() - 0.4) * 2));
      opponentTeamScore = Math.max(0, Math.floor(1.2 - teamOvrDiff * 0.05 + (Math.random() - 0.4) * 2));

      homeScore = isPlayerHome ? playerTeamScore : opponentTeamScore;
      awayScore = isPlayerHome ? opponentTeamScore : playerTeamScore;
      displayedHalfMinutes = 45;
      matchMode = 'pro';

      if (isPlayed && minutesPlayed > 0) {
        const perfFactor = (minutesPlayed / 90) * (ovr / opponentOvr);
        const matchVariance = (Math.random() - 0.45) * 1.8;

        let rawRating = 6.0 + (perfFactor - 0.8) * 2.5 + matchVariance;
        if (playerTeamScore > opponentTeamScore) rawRating += 0.5;

        const sim = simulatePlayerGoalsAndAssists(player, perfFactor, playerTeamScore, {
          teamStrategy: (player as any).teamStrategy || (player as any).tactics?.style,
          minutesPlayed,
          opponentOvr,
        });
        playerGoals = sim.playerGoals;
        playerAssists = sim.playerAssists;

        if ((primaryPos === 'DEF' || primaryPos === 'GK') && opponentTeamScore === 0) {
          cleanSheets++;
        }

        playerGoals = Math.min(playerGoals, playerTeamScore);
        if (playerGoals > 0 && playerTeamScore === 0) playerTeamScore = playerGoals;

        const dribbleGoals = Math.min(playerGoals, (sim as any).dribbleGoals || 0);
        const regularGoals = playerGoals - dribbleGoals;
        const dribbleAssists = Math.min(playerAssists, (sim as any).dribbleAssists || 0);
        const regularAssists = playerAssists - dribbleAssists;

        rawRating += regularGoals * 0.8 + dribbleGoals * 1.6 + (regularAssists * 0.5 + dribbleAssists * 1.0);
        matchRating = parseFloat(Math.min(10.0, Math.max(5.5, rawRating)).toFixed(1));

        totalGoals += playerGoals;
        totalAssists += playerAssists;
        totalRatingSum += matchRating;

        if (matchRating >= 8.0 && (playerGoals > 0 || playerAssists > 0 || matchRating >= 8.8)) {
          isMvp = true;
          totalMvps++;
        }

        totalMinutesPlayed += minutesPlayed;

        const redMultiplier = getBadRepRedCardChanceMultiplier(player.badReputationTier || 0);
        if (Math.random() < 0.12) {
          matchYellow = true;
          yellowCards++;
        } else if (Math.random() < 0.02 * redMultiplier) {
          matchRed = true;
          redCards++;
          const repRes = addBadReputation(player as any, 10);
          player.badReputation = repRes.updatedPlayer.badReputation;
          player.badReputationTier = repRes.updatedPlayer.badReputationTier;
        }

        const { riskPercentage } = calculateInjuryRisk({
          ...player,
          fitness: currentFitness,
          staminaCurrent: currentFitness,
        });

        if (Math.random() * 100 < riskPercentage) {
          isInjuredThisMatch = true;
          const inj = generateRandomInjury();
          remainingInjuryMatches = Math.max(1, Math.ceil((inj.weeks || 2) / 2));
        }
      }
    }

    matches.push({
      matchId: `youth-b${blockNumber}-m${matchNumber}`,
      matchIndex: matchNumber,
      matchdayIndex: matchNumber,
      stageName: `MATCH ${matchNumber}`,
      homeTeamName,
      awayTeamName,
      homeScore,
      awayScore,
      playerTeamScore,
      opponentScore: opponentTeamScore,
      isPlayerHome,
      playerStatus: status,
      minutesPlayed,
      playerGoals,
      playerAssists,
      playerRating: matchRating,
      isMvp,
      mvpName,
      mvpRating,
      goalScorers,
      assistProviders,
      yellowCard: matchYellow,
      redCard: matchRed,
      isInjured: isInjuredThisMatch,
      cleanSheet: isPlayed && opponentTeamScore === 0,
      playerFitness: Math.round(currentFitness),
      importanceCategory: importanceEval.category,
      isDerby: importanceEval.isDerby,
      derbyName: importanceEval.derbyName,
      importanceReason: importanceEval.reasonTitle,
      isKeyMatch: Boolean(importanceEval.isPlayableInCurrentMode && isPlayed && !isInjuredThisMatch && minutesPlayed > 0),
      stadiumId,
      stadiumName,
      turfQuality,
      displayedHalfMinutes,
      matchMode,
      homeSquadOvr,
      awaySquadOvr,
      syntheticInjuryApplied,
    });
  }

  const seasonYear = 2026 + ((player.age || 10) - 10);
  const { unifiedMatches: contUnifiedMatches } = buildUnifiedSeasonBlockMatches(player, blockNumber, matches, seasonYear);
  const { unifiedMatches } = injectNationalTeamMatchesIntoBlock(contUnifiedMatches, player, blockNumber, seasonYear);

  // Apply Authentic Disciplinary System across the complete unified match calendar
  const disciplinaryStore = (player as any).disciplinaryStore ? { ...(player as any).disciplinaryStore } : {};

  unifiedMatches.forEach((m) => {
    const compName = m.competitionName || (m.isNationalTeamMatch ? 'National Championship' : 'Domestic League');
    const compType = m.competitionType || (m.isNationalTeamMatch ? 'national' : 'league');
    const contId = m.continentalCompId;

    const { key, state: discState, rules } = getOrCreateDisciplinaryRecord(
      disciplinaryStore,
      compName,
      compType,
      contId
    );

    // 1. Stage-based Yellow Card Clears (World Cup group stage & QF; Champions league phase & QF)
    const stageName = m.stageName || (m as any).continentalStage || '';
    const { updatedState: clearedState } = checkAndApplyStageYellowClear(discState, stageName, rules);
    let activeState = clearedState;

    // 2. Check for active suspension for this specific competition
    const { isSuspended, reason: suspReason } = checkIsSuspendedForMatch(activeState);

    if (isSuspended) {
      // Player is barred from participating in this match of this competition!
      m.playerStatus = 'suspended';
      m.minutesPlayed = 0;
      m.playerGoals = 0;
      m.playerAssists = 0;
      m.playerRating = undefined;
      m.isMvp = false;
      m.yellowCard = false;
      m.redCard = false;
      m.isSuspended = true;
      m.suspensionReason = suspReason || 'Disciplinary Suspension';
      m.isKeyMatch = false;

      // Serve the suspension for this competition
      activeState = serveSuspensionForMatch(activeState);
      disciplinaryStore[key] = activeState;
    } else {
      m.isSuspended = false;
      m.suspensionReason = undefined;

      // 3. If player participated on the pitch, process cards
      const isPlayed = m.playerStatus === 'starter' || m.playerStatus === 'sub_out' || m.playerStatus === 'sub_in';
      if (isPlayed && (m.minutesPlayed || 0) > 0) {
        const gotYellow = Boolean(m.yellowCard);
        const gotRed = Boolean(m.redCard);

        if (gotYellow || gotRed) {
          const outcome = recordMatchDisciplinaryEvents(activeState, rules, gotYellow, gotRed);
          activeState = outcome.updatedState;
          disciplinaryStore[key] = activeState;
        }
      }
    }
  });

  (player as any).disciplinaryStore = disciplinaryStore;

  const aggregatedStats = recalculateYouthBlockStats(unifiedMatches);

  return {
    matches: unifiedMatches,
    aggregatedStats,
  };
}

/**
 * Aggregates season block statistics from a list of match results.
 * Used both during initial block generation and after live gameplay matches overwrite a simulated fixture.
 */
export function recalculateYouthBlockStats(matches: SimulatedMatchResult[]): YouthSeasonStats {
  let finalGamesPlayed = 0;
  let finalMinutesPlayed = 0;
  let finalGoals = 0;
  let finalAssists = 0;
  let finalRatingSum = 0;
  let finalCleanSheets = 0;
  let finalYellowCards = 0;
  let finalRedCards = 0;
  let finalInjuryMatchesMissed = 0;
  let finalMvps = 0;

  matches.forEach((m) => {
    // National team matches have separate international stat tracking and do not mix with domestic club league tables
    if (m.isNationalTeamMatch || m.competitionType === 'national') return;

    const isP = m.playerStatus === 'starter' || m.playerStatus === 'sub_out' || m.playerStatus === 'sub_in';
    if (isP) {
      finalGamesPlayed++;
      finalMinutesPlayed += m.minutesPlayed || 0;
      finalGoals += m.playerGoals || 0;
      finalAssists += m.playerAssists || 0;
      if (m.playerRating) finalRatingSum += m.playerRating;
      if (m.cleanSheet) finalCleanSheets++;
      if (m.isMvp) finalMvps++;
    }
    if (m.yellowCard) finalYellowCards++;
    if (m.redCard) finalRedCards++;
    if (m.isInjured) finalInjuryMatchesMissed++;
  });

  const finalAvgRating = finalGamesPlayed > 0 ? parseFloat((finalRatingSum / finalGamesPlayed).toFixed(1)) : 6.5;

  return {
    gamesPlayed: finalGamesPlayed,
    minutesPlayed: finalMinutesPlayed,
    goals: finalGoals,
    assists: finalAssists,
    avgRating: finalAvgRating,
    cleanSheets: finalCleanSheets,
    yellowCards: finalYellowCards,
    redCards: finalRedCards,
    injuryMatchesMissed: finalInjuryMatchesMissed,
    mvps: finalMvps,
  };
}

/**
 * Generates a single live match result for International Youth Cup stage matches
 * using full 23-player `intl_cup` squads, Special Unlocked Youth Stadiums (35m halves)
 * for non-final stages OR Pro stadium showcase rules (45m halves, Youth squads) for the Final.
 */
export function generateTournamentMatchResult(
  player: PlayerConfig,
  stageName: string,
  opponentName: string,
  opponentOvr: number
): {
  matchResult: SimulatedMatchResult;
  updatedPlayer: PlayerConfig;
} {
  const ovr = player.ovr || 60;
  const playerClubName = player.club || 'Villa Lugano Deportivo';
  const age = Math.max(10, Math.min(16, Math.round(player.age || 16)));
  const categoryLabel = `U${age}`;
  const seasonYear = 2026 + (age - 10);

  const stageLower = stageName.toLowerCase();
  const isFinalStage =
    stageLower.includes('final') &&
    !stageLower.includes('quarter') &&
    !stageLower.includes('semi') &&
    !stageLower.includes('third');

  const isKnockout =
    stageName.includes('Quarter') ||
    stageName.includes('Semi') ||
    stageName.includes('Final') ||
    stageName.includes('Decider') ||
    stageName.includes('Third');

  const playerLeague = resolvePlayerYouthLeagueStrict(player);
  const homeTeamName = `${playerClubName} ${categoryLabel}`;
  const awayTeamName = opponentName.includes(`U${age}`) ? opponentName : `${opponentName} ${categoryLabel}`;

  // Prepare 23-player Int'l Youth Cup rosters + venue (Special Youth Stadium for pre-final, Pro Stadium for Final)
  const playerClubStub = {
    id: `iyc-${playerClubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: playerClubName,
    country: playerLeague.country,
    federation: inferCupFederation(playerLeague.country),
    primaryColor: '#f59e0b',
    secondaryColor: '#ffffff',
    preferredFormation: '4-3-3',
    teamOvr: Math.max(45, ovr),
    sourceType: 'youth_league' as const,
  };
  const oppClubStub = {
    id: `iyc-${opponentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: opponentName,
    country: 'Spain',
    federation: 'UEFA' as const,
    primaryColor: '#1d4ed8',
    secondaryColor: '#ffffff',
    preferredFormation: '4-3-3',
    teamOvr: opponentOvr || 68,
    sourceType: 'federation_pool' as const,
  };

  let homeEditorTeam: EditorTeamData;
  let awayEditorTeam: EditorTeamData;
  let matchStadium: StadiumDefinition;
  let displayedHalfMinutes: 35 | 45 = 35;

  if (isFinalStage) {
    const finalCfg = resolveIntlYouthCupFinalVenueConfig(playerClubStub, oppClubStub, seasonYear, player);
    homeEditorTeam = finalCfg.homeTeam;
    awayEditorTeam = finalCfg.awayTeam;
    matchStadium = finalCfg.stadium;
    displayedHalfMinutes = finalCfg.displayedHalfMinutes;
  } else {
    const builtHome = buildIntlCupEditorTeam(playerClubStub, age, player);
    const builtAway = buildIntlCupEditorTeam(oppClubStub, age);
    homeEditorTeam = builtHome.team;
    awayEditorTeam = builtAway.team;
    matchStadium = builtHome.stadium;
    displayedHalfMinutes = 35;
  }

  // Read current authoritative fitness
  const staminaAttr = getPermanentStamina(player);
  let currentFitness = getFitnessPercentage(player);

  let status: PlayerMatchStatus = 'benched';
  let minutesPlayed = 0;

  if (player.isInjured) {
    status = 'not_called';
    minutesPlayed = 0;
  } else {
    const selection = checkManagerSelection(
      { ...player, fitness: currentFitness, staminaCurrent: currentFitness, isInjured: false },
      isKnockout
    );

    if (selection.recommendedStatus === 'starter') {
      const isSubbedOutEarly = !isKnockout && (currentFitness < 75 || Math.random() < 0.2);
      if (isSubbedOutEarly) {
        minutesPlayed = Math.floor(50 + Math.random() * 18); // 50 - 67 mins (< 70)
        status = 'sub_out';
      } else {
        minutesPlayed = Math.floor(70 + Math.random() * 21); // 70 - 90 mins
        status = 'starter';
      }
    } else if (selection.recommendedStatus === 'sub') {
      const willEnter = Math.random() < 0.85;
      if (willEnter) {
        minutesPlayed = Math.floor(18 + Math.random() * 28);
        status = 'sub_in';
      } else {
        minutesPlayed = 0;
        status = 'benched';
      }
    } else {
      minutesPlayed = 0;
      status = 'benched';
    }
  }

  // Calculate fitness change
  const fitChange = calculateFitnessChangeByStatus(staminaAttr, status, minutesPlayed);
  currentFitness = Math.max(0, Math.min(100, parseFloat((currentFitness + fitChange.netChange).toFixed(1))));

  const isPlayed = status === 'starter' || status === 'sub_out' || status === 'sub_in';

  // Run full 23-player simulateDatabaseMatch
  const simResult = simulateDatabaseMatch(homeEditorTeam, awayEditorTeam, {
    competitionId: 'INTL_YOUTH_CUP',
    competitionName: 'International Youth Cup',
    stageName,
    isKnockout,
    allowPenalties: isKnockout,
    userPlayer: isPlayed ? (player as unknown as PlayerCardData) : undefined,
  });

  const playerTeamScore = simResult.homeScore;
  const opponentTeamScore = simResult.awayScore;

  // Roll for injury risk if played (with synthetic turf +10% multiplier if applicable)
  let isInjuredThisMatch = player.isInjured || false;
  let injuryName = player.injuryName;
  let injuryWeeksRemaining = player.injuryWeeksRemaining;
  let injuryTotalWeeks = player.injuryTotalWeeks;
  const turfMultiplier = getTurfInjuryMultiplier(matchStadium.turfQuality);

  if (isPlayed && !player.isInjured && minutesPlayed > 0) {
    const { riskPercentage } = calculateInjuryRisk({
      ...player,
      fitness: currentFitness,
      staminaCurrent: currentFitness,
    });
    if (Math.random() * 100 < riskPercentage * turfMultiplier) {
      isInjuredThisMatch = true;
      const inj = generateRandomInjury();
      injuryName = inj.name;
      injuryWeeksRemaining = inj.weeks;
      injuryTotalWeeks = inj.weeks;
    }
  }

  const userBox =
    simResult.homePlayers.find((p) => p.isUserPlayer) ||
    simResult.homePlayers.find((p) => p.id === player.id || p.name === player.name);

  let playerGoals = 0;
  let playerAssists = 0;

  if (isPlayed && minutesPlayed > 0) {
    const oppScaledOvr = Math.max(40, simResult.awayTeamOvr || opponentOvr);
    const factor = (minutesPlayed / 90) * (ovr / oppScaledOvr);
    const sim = simulatePlayerGoalsAndAssists(player, factor, playerTeamScore);
    playerGoals = Math.min(Math.max(userBox?.goals || 0, sim.playerGoals), playerTeamScore);
    playerAssists = Math.max(userBox?.assists || 0, sim.playerAssists);
  }

  const effectiveOppOvr = Math.max(40, simResult.awayTeamOvr || opponentOvr);
  const perfFactor = ovr / effectiveOppOvr + playerGoals * 0.5 + playerAssists * 0.3;
  const rawRating = (userBox?.rating ?? 6.2 + perfFactor * 0.8) + playerGoals * 0.4 + playerAssists * 0.25;
  const matchRating = isPlayed ? parseFloat(Math.min(10.0, Math.max(6.0, rawRating)).toFixed(1)) : undefined;

  let mvpName = simResult.mvpPlayer?.name;
  let mvpRating = simResult.mvpPlayer?.rating;
  const isMvp = matchRating
    ? Boolean(userBox?.isMvp || (mvpRating !== undefined && matchRating >= mvpRating) || (matchRating >= 8.2 && (playerGoals > 0 || playerAssists > 0)))
    : false;
  if (isMvp && matchRating) {
    mvpName = player.name || mvpName;
    mvpRating = Math.max(mvpRating || 0, matchRating);
  }

  const roundedFit = Math.round(currentFitness);

  const importanceEval = classifyMatchImportance({
    stageTitle: stageName,
    competitionName: 'International Youth Cup',
    teamAName: homeTeamName,
    teamBName: awayTeamName,
    isFinalMatchday: isFinalStage,
    playerPlayMode: player.keyMatchPlayMode || 'decisive',
  });

  const redMultiplier = getBadRepRedCardChanceMultiplier(player.badReputationTier || 0);
  const matchYellow = Math.random() < 0.1;
  const matchRed = !matchYellow && Math.random() < 0.01 * redMultiplier;

  let updatedBadRep = player.badReputation;
  let updatedBadRepTier = player.badReputationTier;
  if (matchRed) {
    const repRes = addBadReputation(player as any, 10);
    updatedBadRep = repRes.updatedPlayer.badReputation;
    updatedBadRepTier = repRes.updatedPlayer.badReputationTier;
  }

  const goalScorers: MatchGoalScorerSummary[] = [
    ...simResult.homeScorers.map((s) => ({
      playerName: s.name,
      team: 'home' as const,
      minute: s.minute,
      assistPlayerName: s.assistPlayerName,
      isOwnGoal: (s as any).isOwnGoal,
    })),
    ...simResult.awayScorers.map((s) => ({
      playerName: s.name,
      team: 'away' as const,
      minute: s.minute,
      assistPlayerName: s.assistPlayerName,
      isOwnGoal: (s as any).isOwnGoal,
    })),
  ].sort((a, b) => a.minute - b.minute);

  const assistProviders: MatchAssistProviderSummary[] = [
    ...simResult.homePlayers
      .filter((p) => (p.assists || 0) > 0)
      .map((p) => ({ playerName: p.name, team: 'home' as const, assists: p.assists })),
    ...simResult.awayPlayers
      .filter((p) => (p.assists || 0) > 0)
      .map((p) => ({ playerName: p.name, team: 'away' as const, assists: p.assists })),
  ];

  const matchResult: SimulatedMatchResult = {
    matchId: `tourn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    matchIndex: 1,
    stageName,
    homeTeamName,
    awayTeamName,
    homeScore: playerTeamScore,
    awayScore: opponentTeamScore,
    isPlayerHome: true,
    playerStatus: status,
    minutesPlayed,
    playerGoals,
    playerAssists,
    playerRating: matchRating,
    isMvp,
    mvpName,
    mvpRating,
    goalScorers,
    assistProviders,
    yellowCard: matchYellow,
    redCard: matchRed,
    isInjured: isInjuredThisMatch,
    playerFitness: roundedFit,
    importanceCategory: importanceEval.category,
    isDerby: importanceEval.isDerby,
    derbyName: importanceEval.derbyName,
    importanceReason: importanceEval.reasonTitle,
    isKeyMatch: Boolean(importanceEval.isPlayableInCurrentMode && isPlayed && !isInjuredThisMatch && minutesPlayed > 0),
    stadiumId: matchStadium.id,
    stadiumName: matchStadium.name,
    turfQuality: matchStadium.turfQuality,
    displayedHalfMinutes,
    matchMode: 'youth',
    homeSquadOvr: simResult.homeTeamOvr,
    awaySquadOvr: simResult.awayTeamOvr,
    syntheticInjuryApplied: matchStadium.turfQuality === 'synthetic',
  };

  const updatedPlayer: PlayerConfig = {
    ...player,
    fitness: roundedFit,
    staminaCurrent: roundedFit,
    isInjured: isInjuredThisMatch,
    injuryName: isInjuredThisMatch ? injuryName : player.injuryName,
    injuryWeeksRemaining: isInjuredThisMatch ? injuryWeeksRemaining : player.injuryWeeksRemaining,
    injuryTotalWeeks: isInjuredThisMatch ? injuryTotalWeeks : player.injuryTotalWeeks,
    hasSeenInjuryModal: isInjuredThisMatch && !player.isInjured ? false : player.hasSeenInjuryModal,
    badReputation: updatedBadRep,
    badReputationTier: updatedBadRepTier,
  };

  return {
    matchResult,
    updatedPlayer,
  };
}

