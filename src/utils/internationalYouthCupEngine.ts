import { PlayerCardData, PlayerConfig } from '../types';
import { EditorTeamData } from '../types/leagueEditor';
import { StadiumDefinition } from '../gameplay/types/stadium';
import { FootballMatchMode } from '../gameplay/types';
import { ResolvedPitchMetrics, resolvePitchMetrics } from '../gameplay/game/pitchDimensions';
import {
  getRegisteredStadiumsByCategory,
  getStadiumById,
  resolveYouthStadiumForClub,
} from '../gameplay/game/stadiumRegistry';
import {
  formatFinalBoardText,
  NATIONAL_TOURNAMENT_VENUE_POOLS,
  ResolvedCompetitionVenue,
  resolveCompetitionMatchVenue,
} from './competitionVenueSystem';
import {
  FederationName,
  InternationalYouthClub,
  YouthLeagueStanding,
  GroupStageGroup,
  KnockoutStageMatch,
  TournamentMatch,
} from '../types/youthLeague';
import {
  findYouthTeamAndLeague,
  resolvePlayerYouthLeagueStrict,
  YOUTH_LEAGUES_DATABASE,
  YouthTeamData,
} from '../data/youthLeaguesDatabase';
import {
  FEDERATION_CLUB_POOLS,
  FederationClubTemplate,
  getAllIntlYouthPoolTemplates,
  getIntlYouthPoolClubScaledSquad,
} from '../data/internationalYouthPool';
import { getYouthScaledTeamAndPlayers } from './youthSquadGenerator';
import { simulateDatabaseMatch, SimulatedDatabaseMatchResult } from './databaseMatchSimulationEngine';
import { invalidateTeamStrengthCache } from './lightweightMatchEngine';
import { injectUserPlayerIntoYouthEditorTeam } from './youthLeagueSimulation';

export interface IntlYouthCupFinalVenueConfig {
  stadium: StadiumDefinition;
  stadiumId: string;
  stadiumName: string;
  city: string;
  country: string;
  matchMode: FootballMatchMode; // 'youth'
  competitionTag: 'intl_youth_cup_final';
  displayedHalfMinutes: 45;
  pitchMetrics: ResolvedPitchMetrics;
  disableSurroundingsAndIntro: false;
  crowdAttendancePctOverride: number; // Strictly 0.60 .. 0.80
  isCasualCrowd: true;
  finalBoardCity: string;
  finalBoardYear: number;
  finalBannerText: string;
  venueConfig: ResolvedCompetitionVenue | null;
  homeTeam: EditorTeamData;
  awayTeam: EditorTeamData;
  homePlayers: PlayerCardData[];
  awayPlayers: PlayerCardData[];
  homeSquadOvr: number;
  awaySquadOvr: number;
}

export interface FullInternationalYouthCupData {
  all32Clubs: InternationalYouthClub[];
  groups: GroupStageGroup[];
  playerGroup: GroupStageGroup;
  playerGroupRank: number;
  playerGroupQualified: boolean;
  knockoutMatches: KnockoutStageMatch[];
  playerStageMatches: TournamentMatch[];
  isQuarterFinalWinner: boolean;
  quarterOpponent: InternationalYouthClub;
  semiOpponent: InternationalYouthClub;
  finalOpponent: InternationalYouthClub;
  thirdPlaceOpponent: InternationalYouthClub;
  playerGroupNonPlayerMatches?: { teamAId: string; teamBId: string; gA: number; gB: number; round: number }[];
  finalVenueConfig?: IntlYouthCupFinalVenueConfig;
  simulatedGroupMatchResults?: SimulatedDatabaseMatchResult[];
}

function stableFinalHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function inferFederationForCountry(country: string): FederationName {
  const c = (country || '').toLowerCase();
  if (c === 'argentina' || c === 'brazil' || c === 'uruguay' || c === 'colombia' || c === 'ecuador') return 'CONMEBOL';
  if (c === 'saudi arabia' || c === 'japan' || c === 'south korea' || c === 'australia' || c === 'uae') return 'AFC';
  if (c === 'egypt' || c === 'morocco' || c === 'senegal' || c === 'south africa' || c.includes('ivoire') || c.includes('congo')) return 'CAF';
  if (c === 'mexico' || c === 'united states' || c === 'costa rica') return 'CONCACAF';
  if (c === 'new zealand' || c === 'fiji' || c === 'papua new guinea') return 'OFC';
  return 'UEFA';
}

/**
 * Builds a 23-player Youth EditorTeamData (`intl_cup` OVR scaling) for any InternationalYouthClub
 * or opponent name/club descriptor, injecting the Unique Career player if this is the user's club.
 */
export function buildIntlCupEditorTeam(
  clubInput: Pick<InternationalYouthClub, 'id' | 'name' | 'country' | 'federation' | 'primaryColor' | 'secondaryColor' | 'preferredFormation' | 'teamOvr' | 'sourceType'> & { tierClass?: 'big' | 'small' },
  age: number = 16,
  player?: PlayerConfig
): { team: EditorTeamData; players: PlayerCardData[]; teamOvr: number; stadium: StadiumDefinition } {
  const clampedAge = Math.max(10, Math.min(16, Math.round(age || 16)));
  const poolTemplates = getAllIntlYouthPoolTemplates();
  const matchedPool = poolTemplates.find(
    (t) =>
      t.id === clubInput.id ||
      t.name.toLowerCase() === clubInput.name.toLowerCase()
  );

  let scaledTeam: EditorTeamData;
  let scaledPlayers: PlayerCardData[];
  let teamOvr: number;

  if (matchedPool) {
    const res = getIntlYouthPoolClubScaledSquad(matchedPool, clampedAge);
    scaledTeam = res.team;
    scaledPlayers = res.players;
    teamOvr = res.teamOvr;
  } else {
    const matchedYL = findYouthTeamAndLeague(clubInput.name);
    const ylTeam: YouthTeamData | undefined = matchedYL?.team;
    const res = getYouthScaledTeamAndPlayers(
      {
        id: ylTeam?.id || clubInput.id,
        name: clubInput.name,
        country: ylTeam?.country || clubInput.country || 'International',
        city: ylTeam?.city,
        youthLeague: ylTeam?.youthLeague,
        federation: clubInput.federation || inferFederationForCountry(ylTeam?.country || clubInput.country),
        ovr: ylTeam?.ovr || (clubInput.teamOvr ? Math.max(40, clubInput.teamOvr - 6) : undefined),
        primaryColor: ylTeam?.kit?.color1 || clubInput.primaryColor,
        secondaryColor: ylTeam?.kit?.color2 || clubInput.secondaryColor,
        preferredFormation: clubInput.preferredFormation || '4-3-3',
        tierClass: ylTeam?.tierClass || clubInput.tierClass || 'big',
        kit: ylTeam?.kit,
      },
      clampedAge,
      'intl_cup'
    );
    scaledTeam = res.team;
    scaledPlayers = res.players;
    teamOvr = res.teamOvr;
  }

  const specialStadium = resolveYouthStadiumForClub(
    {
      name: scaledTeam.name,
      country: scaledTeam.countryName || clubInput.country,
      stadiumId: scaledTeam.stadium?.gameplayStadiumId,
      tierClass: clubInput.tierClass,
    },
    true
  );

  const playerClubName = (player?.club || '').toLowerCase();
  const isUserClub = Boolean(
    player &&
      playerClubName &&
      scaledTeam.name.toLowerCase() === playerClubName
  );

  let finalTeam: EditorTeamData = {
    ...scaledTeam,
    stadium: {
      name: specialStadium.name,
      capacity: specialStadium.capacity || 8500,
      tier: 3,
      gameplayStadiumId: specialStadium.id,
    },
  };

  if (isUserClub && player) {
    finalTeam = injectUserPlayerIntoYouthEditorTeam(finalTeam, player);
    const injectedSquad = (finalTeam.squadSaveFile?.squad || [])
      .filter((s) => s.slotNumber <= 23 && s.player)
      .map((s) => s.player!);
    if (injectedSquad.length > 0) {
      scaledPlayers = injectedSquad;
    }
  }

  invalidateTeamStrengthCache(finalTeam.id);

  return {
    team: finalTeam,
    players: scaledPlayers,
    teamOvr,
    stadium: specialStadium,
  };
}

/**
 * Resolves the showcase International Youth Cup Final configuration:
 * - Selects an existing Professional Stadium (`category === 'pro'`) deterministically for the season year.
 * - Enforces 45-minute halves (`displayedHalfMinutes: 45`), Pro pitch dimensions,
 *   60%–80% casual crowd attendance, and `[CITY NAME] [YEAR]` adboard text.
 * - Fields the two finalists' 23-player **Youth squads**.
 */
export function resolveIntlYouthCupFinalVenueConfig(
  finalistA: InternationalYouthClub | { id?: string; name: string; country?: string; teamOvr?: number; preferredFormation?: string; primaryColor?: string; secondaryColor?: string },
  finalistB: InternationalYouthClub | { id?: string; name: string; country?: string; teamOvr?: number; preferredFormation?: string; primaryColor?: string; secondaryColor?: string },
  seasonYear: number = new Date().getFullYear(),
  player?: PlayerConfig
): IntlYouthCupFinalVenueConfig {
  const proStadiums = getRegisteredStadiumsByCategory('pro');
  const proById = new Map(proStadiums.map((s) => [s.id, s]));

  // Prefer NATIONAL_TOURNAMENT_VENUE_POOLS.INTL_YOUTH_CUP verified against STADIUM_REGISTRY pro stadiums
  const poolCandidates = (NATIONAL_TOURNAMENT_VENUE_POOLS.INTL_YOUTH_CUP || [])
    .map((entry) => proById.get(entry.stadiumId))
    .filter((s): s is StadiumDefinition => Boolean(s && (s.category || 'pro') === 'pro'));

  const availableProStadiums = poolCandidates.length > 0 ? poolCandidates : proStadiums;
  const seedKey = `intl_youth_cup_final:${seasonYear}:${finalistA.name}:${finalistB.name}`;
  const hash = stableFinalHash(seedKey);

  const selectedStadium =
    availableProStadiums[hash % Math.max(1, availableProStadiums.length)] ||
    getStadiumById('estadio_monumental');

  const crowdAttendancePctOverride = parseFloat((0.6 + (hash % 21) / 100).toFixed(2)); // 0.60 .. 0.80
  const finalBoardCity = selectedStadium.city || 'Buenos Aires';
  const finalBoardYear = seasonYear;
  const finalBannerText = formatFinalBoardText(finalBoardCity, finalBoardYear);

  const pitchMetrics = resolvePitchMetrics(
    {
      preset: selectedStadium.pitchPreset || 'balanced',
      lengthMeters: selectedStadium.pitchLengthMeters,
      widthMeters: selectedStadium.pitchWidthMeters,
    },
    'pro'
  );

  const venueConfig = resolveCompetitionMatchVenue({
    competitionId: 'INTL_YOUTH_CUP',
    competitionName: 'International Youth Cup',
    stageName: 'Grand Final',
    seasonYear,
    isFinal: true,
    overrideCity: finalBoardCity,
    overrideStadiumId: selectedStadium.id,
  });

  const age = Math.max(10, Math.min(16, Math.round(player?.age || 16)));

  const buildClubInput = (
    c: typeof finalistA,
    fallbackId: string
  ): InternationalYouthClub => ({
    id: c.id || fallbackId,
    name: c.name,
    country: c.country || 'Spain',
    federation: (c as InternationalYouthClub).federation || inferFederationForCountry(c.country || 'Spain'),
    flag: (c as InternationalYouthClub).flag || '🏆',
    primaryColor: c.primaryColor || '#1d4ed8',
    secondaryColor: c.secondaryColor || '#ffffff',
    preferredFormation: c.preferredFormation || '4-3-3',
    teamOvr: c.teamOvr || 68,
    attOvr: c.teamOvr || 68,
    midOvr: c.teamOvr || 68,
    defOvr: c.teamOvr || 68,
    representativePlayers: (c as InternationalYouthClub).representativePlayers || [],
    sourceType: (c as InternationalYouthClub).sourceType || 'federation_pool',
  });

  const builtA = buildIntlCupEditorTeam(buildClubInput(finalistA, 'iyc-finalist-a'), age, player);
  const builtB = buildIntlCupEditorTeam(buildClubInput(finalistB, 'iyc-finalist-b'), age, player);

  return {
    stadium: selectedStadium,
    stadiumId: selectedStadium.id,
    stadiumName: selectedStadium.name,
    city: finalBoardCity,
    country: selectedStadium.country || 'International',
    matchMode: 'youth',
    competitionTag: 'intl_youth_cup_final',
    displayedHalfMinutes: 45,
    pitchMetrics,
    disableSurroundingsAndIntro: false,
    crowdAttendancePctOverride,
    isCasualCrowd: true,
    finalBoardCity,
    finalBoardYear,
    finalBannerText,
    venueConfig,
    homeTeam: builtA.team,
    awayTeam: builtB.team,
    homePlayers: builtA.players,
    awayPlayers: builtB.players,
    homeSquadOvr: builtA.teamOvr,
    awaySquadOvr: builtB.teamOvr,
  };
}

/**
 * Generates strictly 32 clubs for the International Youth Cup:
 * - Combines 10 Domestic Youth League qualifiers (Top 2 from the user's league + top representative from the other 8 Youth Leagues)
 * - Plus 22 Federation Pool clubs from `FEDERATION_CLUB_POOLS`
 * - Enforces UEFA <= 16 and non-UEFA <= 8 so `drawConstrainedGroups` (8 groups of 4) always satisfies confederation caps.
 * - Every club is backed by a 23-player Youth squad (`intl_cup` OVR scaling) and Special Unlocked Youth Stadium ID.
 */
export function generate32ClubsForCup(
  player: PlayerConfig,
  playerLeagueStandings?: YouthLeagueStanding[]
): InternationalYouthClub[] {
  const age = Math.max(10, Math.min(16, Math.round(player.age || 16)));
  const playerClubName = player.club || 'Kensington United';
  const playerLeague = resolvePlayerYouthLeagueStrict(player);

  const all32Clubs: InternationalYouthClub[] = [];
  const usedNames = new Set<string>();

  const toIntlYouthClubFromLeagueTeam = (
    ylTeam: YouthTeamData,
    flag: string,
    overrideName?: string
  ): InternationalYouthClub => {
    const clubName = overrideName || ylTeam.name;
    const isPlayer = clubName.toLowerCase() === playerClubName.toLowerCase();
    const resolvedFederation =
      (ylTeam as { federation?: FederationName }).federation ||
      inferFederationForCountry(ylTeam.country);
    const scaled = getYouthScaledTeamAndPlayers(
      {
        id: ylTeam.id,
        name: clubName,
        country: ylTeam.country,
        city: ylTeam.city,
        youthLeague: ylTeam.youthLeague,
        federation: resolvedFederation,
        ovr: ylTeam.ovr,
        primaryColor: ylTeam.kit?.color1,
        secondaryColor: ylTeam.kit?.color2,
        tierClass: ylTeam.tierClass,
        stadiumId: ylTeam.stadiumId,
        kit: ylTeam.kit,
      },
      age,
      'intl_cup'
    );

    const specialStadium = resolveYouthStadiumForClub(
      {
        name: clubName,
        country: ylTeam.country,
        stadiumId: ylTeam.stadiumId,
        tierClass: ylTeam.tierClass,
      },
      true
    );

    const teamOvr = isPlayer && player.ovr
      ? Math.max(35, Math.min(99, Math.round(scaled.teamOvr * 0.75 + player.ovr * 0.25)))
      : scaled.teamOvr;

    return {
      id: `yl-${ylTeam.id}`,
      name: clubName,
      country: ylTeam.country,
      federation: resolvedFederation,
      flag,
      primaryColor: ylTeam.kit?.color1 || (isPlayer ? '#f59e0b' : '#3b82f6'),
      secondaryColor: ylTeam.kit?.color2 || '#ffffff',
      preferredFormation: scaled.team.manager?.primaryTactic?.formation || '4-3-3',
      teamOvr,
      attOvr: scaled.attOvr,
      midOvr: scaled.midOvr,
      defOvr: scaled.defOvr,
      representativePlayers: scaled.representativePlayers,
      sourceType: 'youth_league',
      stadiumId: specialStadium.id,
      tierClass: ylTeam.tierClass,
    };
  };

  // 1. Extract 10 Youth League representatives across the 9 leagues:
  //    - 2 from the player's Youth League (guaranteeing playerClub is represented)
  //    - 1 winner from each of the remaining 8 Youth Leagues
  const playerLeagueNames: string[] = [];
  if (playerLeagueStandings && playerLeagueStandings.length >= 2) {
    playerLeagueNames.push(
      ...playerLeagueStandings.slice(0, 2).map((s) => s.teamName)
    );
  } else {
    const sorted = [...playerLeague.teams].sort((a, b) => b.ovr - a.ovr);
    playerLeagueNames.push(sorted[0].name, sorted[1].name);
  }

  if (!playerLeagueNames.some((n) => n.toLowerCase() === playerClubName.toLowerCase())) {
    playerLeagueNames[1] = playerClubName;
  }

  playerLeagueNames.forEach((name, idx) => {
    const matchedTeam =
      playerLeague.teams.find((t) => t.name.toLowerCase() === name.toLowerCase()) ||
      playerLeague.teams[idx % playerLeague.teams.length];
    const clubObj = toIntlYouthClubFromLeagueTeam(
      matchedTeam,
      playerLeague.flag,
      name
    );
    if (!usedNames.has(clubObj.name.toLowerCase())) {
      all32Clubs.push(clubObj);
      usedNames.add(clubObj.name.toLowerCase());
    }
  });

  Object.values(YOUTH_LEAGUES_DATABASE).forEach((league) => {
    if (league.id === playerLeague.id) return;
    const sortedTeams = [...league.teams].sort((a, b) => b.ovr - a.ovr);
    const chosen = sortedTeams.find((t) => !usedNames.has(t.name.toLowerCase())) || sortedTeams[0];
    if (chosen && !usedNames.has(chosen.name.toLowerCase()) && all32Clubs.length < 10) {
      const clubObj = toIntlYouthClubFromLeagueTeam(chosen, league.flag);
      all32Clubs.push(clubObj);
      usedNames.add(clubObj.name.toLowerCase());
    }
  });

  // 2. Count federation slots already used by Youth League teams and fill remaining 22 to reach strictly 32
  const ylFedCounts: Record<FederationName, number> = {
    UEFA: 0,
    CONMEBOL: 0,
    CAF: 0,
    AFC: 0,
    CONCACAF: 0,
    OFC: 0,
  };
  all32Clubs.forEach((c) => {
    ylFedCounts[c.federation] = (ylFedCounts[c.federation] || 0) + 1;
  });

  // Target total per federation summing to 32 while strictly respecting group caps (UEFA <= 16, others <= 8)
  const targetByFed: Record<FederationName, number> = {
    UEFA: Math.min(16, Math.max(ylFedCounts.UEFA, 15)),
    CONMEBOL: Math.min(8, Math.max(ylFedCounts.CONMEBOL, 6)),
    CAF: 4,
    AFC: Math.min(8, Math.max(ylFedCounts.AFC, 4)),
    CONCACAF: 2,
    OFC: 1,
  };

  const toIntlClubFromPoolTemplate = (tmpl: FederationClubTemplate): InternationalYouthClub => {
    const scaled = getIntlYouthPoolClubScaledSquad(tmpl, age);
    const specialStadium = resolveYouthStadiumForClub(
      {
        name: tmpl.name,
        country: tmpl.country,
      },
      true
    );

    return {
      id: tmpl.id,
      name: tmpl.name,
      country: tmpl.country,
      federation: tmpl.federation,
      flag: tmpl.flag,
      primaryColor: tmpl.primaryColor,
      secondaryColor: tmpl.secondaryColor,
      preferredFormation: tmpl.preferredFormation,
      teamOvr: scaled.teamOvr,
      attOvr: scaled.attOvr,
      midOvr: scaled.midOvr,
      defOvr: scaled.defOvr,
      representativePlayers: scaled.representativePlayers,
      sourceType: 'federation_pool',
      stadiumId: specialStadium.id,
      tierClass: 'big',
    };
  };

  const fedsOrder: FederationName[] = ['UEFA', 'CONMEBOL', 'CAF', 'AFC', 'CONCACAF', 'OFC'];
  const currentFedTotals: Record<FederationName, number> = { ...ylFedCounts };

  for (const fed of fedsOrder) {
    const needed = Math.max(0, targetByFed[fed] - currentFedTotals[fed]);
    if (needed === 0) continue;

    const pool = [...FEDERATION_CLUB_POOLS[fed]].filter(
      (t) => !usedNames.has(t.name.toLowerCase())
    );
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const picked = pool.slice(0, Math.min(needed, 32 - all32Clubs.length));
    for (const tmpl of picked) {
      all32Clubs.push(toIntlClubFromPoolTemplate(tmpl));
      usedNames.add(tmpl.name.toLowerCase());
      currentFedTotals[fed] += 1;
    }
  }

  // Safety fill if any edge case left count < 32
  if (all32Clubs.length < 32) {
    for (const fed of fedsOrder) {
      const fedCap = fed === 'UEFA' ? 16 : 8;
      for (const tmpl of FEDERATION_CLUB_POOLS[fed]) {
        if (all32Clubs.length >= 32) break;
        if (currentFedTotals[fed] >= fedCap) break;
        if (usedNames.has(tmpl.name.toLowerCase())) continue;
        all32Clubs.push(toIntlClubFromPoolTemplate(tmpl));
        usedNames.add(tmpl.name.toLowerCase());
        currentFedTotals[fed] += 1;
      }
    }
  }

  // Guarantee player's club is present in the 32-club list
  let playerClub = all32Clubs.find((c) => c.name.toLowerCase() === playerClubName.toLowerCase());
  if (!playerClub) {
    const fallbackClub = toIntlYouthClubFromLeagueTeam(
      playerLeague.teams[0],
      playerLeague.flag,
      playerClubName
    );
    all32Clubs[0] = fallbackClub;
  } else {
    playerClub.primaryColor = playerClub.primaryColor || '#f59e0b';
  }

  return all32Clubs.slice(0, 32);
}

/**
 * Draws 32 clubs into 8 Groups of 4 (Groups A-H) with constraints:
 * - Max 2 UEFA teams per group.
 * - Max 1 team per other association (CONMEBOL, CAF, AFC, CONCACAF, OFC) per group.
 */
export function drawConstrainedGroups(all32Clubs: InternationalYouthClub[]): GroupStageGroup[] {
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const shuffleArray = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Attempt balanced federation-by-federation draw first:
  // Always placing into distinct least-filled groups keeps group size spread <= 1,
  // mathematically guaranteeing UEFA <= 2 and non-UEFA <= 1 whenever caps hold.
  for (let attempt = 0; attempt < 20; attempt++) {
    const groups: GroupStageGroup[] = groupLetters.map((letter) => ({
      groupName: `Group ${letter}`,
      teams: [],
      standings: [],
    }));

    const byFed = new Map<FederationName, InternationalYouthClub[]>();
    all32Clubs.forEach((club) => {
      const fed = club.federation || inferFederationForCountry(club.country);
      const list = byFed.get(fed) || [];
      list.push(club.federation ? club : { ...club, federation: fed });
      byFed.set(fed, list);
    });

    const uefaClubs = shuffleArray(byFed.get('UEFA') || []);
    const otherFeds = shuffleArray(
      Array.from(byFed.entries())
        .filter(([fed]) => fed !== 'UEFA')
        .map(([fed, clubs]) => [fed, shuffleArray(clubs)] as const)
    ).sort((a, b) => b[1].length - a[1].length);

    let failed = false;

    // 1. Place UEFA clubs into groups with fewest UEFA first, then fewest total teams
    for (const club of uefaClubs) {
      const candidates = groups
        .filter((g) => g.teams.length < 4 && g.teams.filter((t) => t.federation === 'UEFA').length < 2)
        .sort((a, b) => {
          const uA = a.teams.filter((t) => t.federation === 'UEFA').length;
          const uB = b.teams.filter((t) => t.federation === 'UEFA').length;
          if (uA !== uB) return uA - uB;
          if (a.teams.length !== b.teams.length) return a.teams.length - b.teams.length;
          return Math.random() - 0.5;
        });

      if (candidates.length === 0) {
        failed = true;
        break;
      }
      candidates[0].teams.push(club);
    }

    // 2. Place each non-UEFA federation one by one into distinct least-filled groups
    if (!failed) {
      for (const [fed, clubs] of otherFeds) {
        for (const club of clubs) {
          const candidates = groups
            .filter((g) => g.teams.length < 4 && g.teams.every((t) => t.federation !== fed))
            .sort((a, b) => {
              if (a.teams.length !== b.teams.length) return a.teams.length - b.teams.length;
              return Math.random() - 0.5;
            });

          if (candidates.length === 0) {
            failed = true;
            break;
          }
          candidates[0].teams.push(club);
        }
        if (failed) break;
      }
    }

    if (!failed && groups.every((g) => g.teams.length === 4)) {
      groups.forEach((g) => {
        g.teams = shuffleArray(g.teams);
      });
      return groups;
    }
  }

  // Fallback if caller supplied pools exceeding mathematical caps
  return groupLetters.map((letter, i) => ({
    groupName: `Group ${letter}`,
    teams: all32Clubs.slice(i * 4, (i + 1) * 4),
    standings: [],
  }));
}

/**
 * Simulates group matches and knockouts for pre-drawn groups using full 23-player Youth squads
 * (`simulateDatabaseMatch`) hosted at Special Unlocked Youth Stadiums (35-min halves),
 * while attaching the Pro-venue 45-min `finalVenueConfig` for the Final showcase match.
 */
export function simulateGroupStageMatches(
  player: PlayerConfig,
  groups: GroupStageGroup[],
  all32Clubs: InternationalYouthClub[]
): FullInternationalYouthCupData {
  const age = Math.max(10, Math.min(16, Math.round(player.age || 16)));
  const seasonYear = 2026 + (age - 10);
  const playerClubName = player.club || 'Kensington United';
  const playerClub =
    all32Clubs.find((c) => c.name.toLowerCase() === playerClubName.toLowerCase()) || all32Clubs[0];

  // Cache 23-player EditorTeamData builds for all clubs involved in the tournament
  const editorTeamCache = new Map<string, ReturnType<typeof buildIntlCupEditorTeam>>();
  const getPreparedClub = (club: InternationalYouthClub) => {
    const cached = editorTeamCache.get(club.id);
    if (cached) return cached;
    const built = buildIntlCupEditorTeam(club, age, player);
    editorTeamCache.set(club.id, built);
    return built;
  };

  let playerGroupNonPlayerMatches: { teamAId: string; teamBId: string; gA: number; gB: number; round: number }[] = [];
  const simulatedGroupMatchResults: SimulatedDatabaseMatchResult[] = [];

  const simulatedGroups: GroupStageGroup[] = groups.map((group) => {
    const groupTeams = group.teams;
    const isPlayerGroup = groupTeams.some(
      (t) => t.id === playerClub.id || t.name.toLowerCase() === playerClubName.toLowerCase()
    );

    if (isPlayerGroup) {
      // Simulate non-player group matches with real 23-player Youth squads
      const pTeam =
        groupTeams.find((t) => t.id === playerClub.id || t.name.toLowerCase() === playerClubName.toLowerCase()) ||
        groupTeams[0];
      const opponents = groupTeams.filter((t) => t.id !== pTeam.id);
      const o1 = opponents[0];
      const o2 = opponents[1];
      const o3 = opponents[2];

      const simDbPair = (tA: InternationalYouthClub, tB: InternationalYouthClub, round: number) => {
        const home = getPreparedClub(tA);
        const away = getPreparedClub(tB);
        const sim = simulateDatabaseMatch(home.team, away.team, {
          competitionId: 'INTL_YOUTH_CUP',
          competitionName: "Int'l Youth Cup",
          stageName: `${group.groupName} - Matchday ${round}`,
          matchdayIndex: round,
        });
        simulatedGroupMatchResults.push(sim);
        return { teamAId: tA.id, teamBId: tB.id, gA: sim.homeScore, gB: sim.awayScore, round };
      };

      if (o1 && o2 && o3) {
        playerGroupNonPlayerMatches = [
          simDbPair(o2, o3, 1),
          simDbPair(o1, o3, 2),
          simDbPair(o1, o2, 3),
        ];
      }

      // Initial standings for player group (0 matches played pending interactive/skip progression)
      const initialStandings = groupTeams.map((gt) => ({
        clubId: gt.id,
        clubName: gt.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      }));

      return {
        groupName: group.groupName,
        teams: groupTeams,
        standings: initialStandings,
      };
    }

    // Non-player groups: simulate all 6 single round-robin group matches via simulateDatabaseMatch
    const groupStandingsMap = new Map<
      string,
      {
        clubId: string;
        clubName: string;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        gf: number;
        ga: number;
        gd: number;
        points: number;
      }
    >();

    groupTeams.forEach((gt) => {
      groupStandingsMap.set(gt.id, {
        clubId: gt.id,
        clubName: gt.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      });
    });

    let md = 0;
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        md++;
        const teamA = groupTeams[i];
        const teamB = groupTeams[j];
        const home = getPreparedClub(teamA);
        const away = getPreparedClub(teamB);

        const sim = simulateDatabaseMatch(home.team, away.team, {
          competitionId: 'INTL_YOUTH_CUP',
          competitionName: "Int'l Youth Cup",
          stageName: `${group.groupName} - Matchday ${Math.min(3, Math.ceil(md / 2))}`,
          matchdayIndex: Math.min(3, Math.ceil(md / 2)),
        });
        simulatedGroupMatchResults.push(sim);

        const gA = sim.homeScore;
        const gB = sim.awayScore;
        const sA = groupStandingsMap.get(teamA.id);
        const sB = groupStandingsMap.get(teamB.id);

        if (sA && sB) {
          sA.played += 1;
          sB.played += 1;
          sA.gf += gA;
          sA.ga += gB;
          sA.gd = sA.gf - sA.ga;
          sB.gf += gB;
          sB.ga += gA;
          sB.gd = sB.gf - sB.ga;

          if (gA > gB) {
            sA.won += 1;
            sA.points += 3;
            sB.lost += 1;
          } else if (gA < gB) {
            sB.won += 1;
            sB.points += 3;
            sA.lost += 1;
          } else {
            sA.drawn += 1;
            sA.points += 1;
            sB.drawn += 1;
            sB.points += 1;
          }
        }
      }
    }

    const sortedStandings = Array.from(groupStandingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    return {
      groupName: group.groupName,
      teams: groupTeams,
      standings: sortedStandings,
    };
  });

  const playerGroup =
    simulatedGroups.find((g) =>
      g.teams.some((t) => t.id === playerClub.id || t.name.toLowerCase() === playerClubName.toLowerCase())
    ) || simulatedGroups[0];

  const playerInGroupStandings = playerGroup.standings.findIndex(
    (s) => s.clubId === playerClub.id || s.clubName.toLowerCase() === playerClubName.toLowerCase()
  );
  const playerGroupRank = playerInGroupStandings >= 0 ? playerInGroupStandings + 1 : 1;
  const playerGroupQualified = true; // Pending live match completion

  // Select Knockout Stage Opponents
  const nonPlayerClubs = all32Clubs
    .filter((c) => c.id !== playerClub.id && c.name.toLowerCase() !== playerClubName.toLowerCase())
    .sort((a, b) => b.teamOvr - a.teamOvr);

  const quarterOpponent = nonPlayerClubs[0] || {
    id: 'opp-qf',
    name: 'Catalunya FC',
    country: 'Spain',
    federation: 'UEFA' as FederationName,
    flag: '🇪🇸',
    primaryColor: '#004d98',
    secondaryColor: '#a50044',
    preferredFormation: '4-3-3',
    teamOvr: 68,
    attOvr: 70,
    midOvr: 68,
    defOvr: 66,
    representativePlayers: [],
    sourceType: 'federation_pool' as const,
  };

  const semiOpponent = nonPlayerClubs[1] || {
    id: 'opp-sf',
    name: 'Blancos CF',
    country: 'Spain',
    federation: 'UEFA' as FederationName,
    flag: '🇪🇸',
    primaryColor: '#ffffff',
    secondaryColor: '#febe10',
    preferredFormation: '4-3-3',
    teamOvr: 70,
    attOvr: 72,
    midOvr: 70,
    defOvr: 68,
    representativePlayers: [],
    sourceType: 'federation_pool' as const,
  };

  const finalOpponent = nonPlayerClubs[2] || {
    id: 'opp-fn',
    name: 'Gávea Rubro-Negro CR',
    country: 'Brazil',
    federation: 'CONMEBOL' as FederationName,
    flag: '🇧🇷',
    primaryColor: '#c1272d',
    secondaryColor: '#000000',
    preferredFormation: '4-3-3',
    teamOvr: 72,
    attOvr: 74,
    midOvr: 72,
    defOvr: 70,
    representativePlayers: [],
    sourceType: 'federation_pool' as const,
  };

  const thirdPlaceOpponent = nonPlayerClubs[3] || {
    id: 'opp-3rd',
    name: 'Bavaria Rot FC',
    country: 'Germany',
    federation: 'UEFA' as FederationName,
    flag: '🇩🇪',
    primaryColor: '#dc052d',
    secondaryColor: '#0066b2',
    preferredFormation: '4-3-3',
    teamOvr: 67,
    attOvr: 68,
    midOvr: 67,
    defOvr: 66,
    representativePlayers: [],
    sourceType: 'federation_pool' as const,
  };

  // Pre-simulate realistic baseline 23-player group stage summaries for player's 3 group foes
  const groupOpponents = playerGroup.teams.filter(
    (t) => t.id !== playerClub.id && t.name.toLowerCase() !== playerClubName.toLowerCase()
  );
  const groupOpps = [
    groupOpponents[0] || quarterOpponent,
    groupOpponents[1] || semiOpponent,
    groupOpponents[2] || thirdPlaceOpponent,
  ];

  const preparedPlayerClub = getPreparedClub(playerClub);
  const playerStageMatches: TournamentMatch[] = groupOpps.map((opp, idx) => {
    const isPlayerHome = idx % 2 === 0;
    const preparedOpp = getPreparedClub(opp);
    const homeTeam = isPlayerHome ? preparedPlayerClub.team : preparedOpp.team;
    const awayTeam = isPlayerHome ? preparedOpp.team : preparedPlayerClub.team;

    const sim = simulateDatabaseMatch(homeTeam, awayTeam, {
      competitionId: 'INTL_YOUTH_CUP',
      competitionName: "Int'l Youth Cup",
      stageName: `Group Stage Match ${idx + 1}`,
      matchdayIndex: idx + 1,
      userPlayer: player as unknown as PlayerCardData,
    });

    const teamScore = isPlayerHome ? sim.homeScore : sim.awayScore;
    const opponentScore = isPlayerHome ? sim.awayScore : sim.homeScore;
    const playerRoster = isPlayerHome ? sim.homePlayers : sim.awayPlayers;
    const userBox =
      playerRoster.find((p) => p.isUserPlayer) ||
      playerRoster.find((p) => p.id === player.id || p.name === player.name);

    return {
      matchId: `int-32-g${idx + 1}`,
      stageName: `Group Stage Match ${idx + 1}`,
      opponentName: opp.name,
      opponentOvr: opp.teamOvr,
      teamScore,
      opponentScore,
      playerGoals: userBox?.goals || 0,
      playerAssists: userBox?.assists || 0,
      playerRating: userBox?.rating || 6.8,
      isWinner: teamScore >= opponentScore,
    };
  });

  const finalVenueConfig = resolveIntlYouthCupFinalVenueConfig(
    playerClub,
    finalOpponent,
    seasonYear,
    player
  );

  return {
    all32Clubs,
    groups: simulatedGroups,
    playerGroup,
    playerGroupRank,
    playerGroupQualified,
    knockoutMatches: [],
    playerStageMatches,
    isQuarterFinalWinner: true,
    quarterOpponent,
    semiOpponent,
    finalOpponent,
    thirdPlaceOpponent,
    playerGroupNonPlayerMatches,
    finalVenueConfig,
    simulatedGroupMatchResults,
  };
}

export interface NonQualifiedCupSummary {
  champion: InternationalYouthClub;
  runnerUp: InternationalYouthClub;
  score: string;
}

/**
 * Simulates a final from the 32-team pool for a year when player did not qualify,
 * using 23-player `intl_cup` squads and the Pro-stadium showcase venue rules.
 */
export function generateNonQualifiedCupChampion(player: PlayerConfig): NonQualifiedCupSummary {
  const all32 = generate32ClubsForCup(player);
  const age = Math.max(10, Math.min(16, Math.round(player.age || 16)));
  const sorted = [...all32].sort((a, b) => b.teamOvr - a.teamOvr);

  const contenderA = sorted[Math.floor(Math.random() * Math.min(6, sorted.length))];
  const remaining = sorted.filter((c) => c.id !== contenderA.id);
  const contenderB = remaining[Math.floor(Math.random() * Math.min(6, remaining.length))];

  const seasonYear = 2026 + (age - 10);
  const venue = resolveIntlYouthCupFinalVenueConfig(contenderA, contenderB, seasonYear);
  const sim = simulateDatabaseMatch(venue.homeTeam, venue.awayTeam, {
    competitionId: 'INTL_YOUTH_CUP',
    competitionName: 'International Youth Cup',
    stageName: 'Grand Final',
    isKnockout: true,
    allowPenalties: true,
  });

  const homeWon =
    sim.winnerTeamId === venue.homeTeam.id ||
    sim.homeScore > sim.awayScore ||
    (sim.homeScore === sim.awayScore && (sim.homePenalties || 0) >= (sim.awayPenalties || 0));

  const champion = homeWon ? contenderA : contenderB;
  const runnerUp = homeWon ? contenderB : contenderA;
  const score = homeWon
    ? `${sim.homeScore} - ${sim.awayScore}`
    : `${sim.awayScore} - ${sim.homeScore}`;

  return { champion, runnerUp, score };
}

/**
 * Builds and simulates the 32-team International Youth Cup.
 * Combines 10 Youth League qualifiers with 22 Federation Pool clubs.
 */
export function buildInternationalYouthCup32(
  player: PlayerConfig,
  playerLeagueStandings?: YouthLeagueStanding[]
): FullInternationalYouthCupData {
  const all32Clubs = generate32ClubsForCup(player, playerLeagueStandings);
  const constrainedGroups = drawConstrainedGroups(all32Clubs);
  return simulateGroupStageMatches(player, constrainedGroups, all32Clubs);
}
