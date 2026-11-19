import { FootballSchoolId } from '../types/youthFootballSchools';
import { KitConfig, KitPattern, PlayerCardData } from '../types';
import { FormationType } from '../types/leagueEditor';
import {
  getYouthScaledTeamAndPlayers,
  YouthScaledTeamResult,
} from '../utils/youthSquadGenerator';

export interface YouthTeamData {
  id: string;
  name: string;
  youthLeague: string;
  city: string;
  country: string;
  ovr: number;
  developmentStyle?: FootballSchoolId;
  tierClass?: 'big' | 'small';
  primaryColor?: string;
  secondaryColor?: string;
  kit?: KitConfig;
  crowdPalette?: [string, string];
  preferredFormation?: FormationType;
  stadiumId?: string;
  players?: PlayerCardData[];
}

export interface YouthLeagueData {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  teams: YouthTeamData[];
}

const RAW_YOUTH_LEAGUES_DATABASE: Record<string, YouthLeagueData> = {
  buenos_aires: {
    id: 'buenos_aires',
    name: 'Liga Bonaerense de Juveniles',
    city: 'Buenos Aires',
    country: 'Argentina',
    flag: '🇦🇷',
    teams: [
      { id: 'ba-1', name: 'Palermo Juniors', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 50, developmentStyle: 'paladar_negro' },
      { id: 'ba-2', name: 'Belgrano Plate', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 48, developmentStyle: 'futbol_champan' },
      { id: 'ba-3', name: 'Recoleta Estudiantes', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 47, developmentStyle: 'paladar_negro' },
      { id: 'ba-4', name: 'Caballito Atlético', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 45, developmentStyle: 'futbol_champan' },
      { id: 'ba-5', name: 'San Telmo Deportivo', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 43, developmentStyle: 'paladar_negro' },
      { id: 'ba-6', name: 'Flores FC', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 42, developmentStyle: 'futbol_champan' },
      { id: 'ba-7', name: 'La Boca Unión', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 41, developmentStyle: 'paladar_negro' },
      { id: 'ba-8', name: 'Barracas Sportivo', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 40, developmentStyle: 'futbol_champan' },
      { id: 'ba-9', name: 'Mataderos Juniors', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 40, developmentStyle: 'paladar_negro' },
      { id: 'ba-10', name: 'Villa Lugano Deportivo', youthLeague: 'Liga Bonaerense de Juveniles', city: 'Buenos Aires', country: 'Argentina', ovr: 40, developmentStyle: 'futbol_champan' },
    ],
  },
  sao_paulo: {
    id: 'sao_paulo',
    name: 'Liga de Futebol Juvenil de São Paulo',
    city: 'São Paulo',
    country: 'Brazil',
    flag: '🇧🇷',
    teams: [
      { id: 'sp-1', name: 'Moema Atlético Clube', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 50, developmentStyle: 'jogo_bonito' },
      { id: 'sp-2', name: 'Pinheiros Futebol Clube', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 48, developmentStyle: 'relational_play' },
      { id: 'sp-3', name: 'Vila Mariana Esporte Clube', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 47, developmentStyle: 'jogo_bonito' },
      { id: 'sp-4', name: 'Tatuapé Atlético', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 45, developmentStyle: 'relational_play' },
      { id: 'sp-5', name: 'Liberdade Futebol Clube', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 43, developmentStyle: 'jogo_bonito' },
      { id: 'sp-6', name: 'Santana União Esportiva', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 42, developmentStyle: 'relational_play' },
      { id: 'sp-7', name: 'Lapa Associação Futebol', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 41, developmentStyle: 'jogo_bonito' },
      { id: 'sp-8', name: 'Ipiranga Esporte Clube', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 40, developmentStyle: 'relational_play' },
      { id: 'sp-9', name: 'Guaianases Juventude', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 40, developmentStyle: 'jogo_bonito' },
      { id: 'sp-10', name: 'Capela do Socorro Atlético', youthLeague: 'Liga de Futebol Juvenil de São Paulo', city: 'São Paulo', country: 'Brazil', ovr: 40, developmentStyle: 'relational_play' },
    ],
  },
  madrid: {
    id: 'madrid',
    name: 'Liga de Canteras Madrileñas',
    city: 'Madrid',
    country: 'Spain',
    flag: '🇪🇸',
    teams: [
      { id: 'mad-1', name: 'Chamartín Atlético', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 50, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-2', name: 'Salamanca Club Deportivo', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 48, developmentStyle: 'tiki_taka' },
      { id: 'mad-3', name: 'Retiro Deportivo', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 47, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-4', name: 'Argüelles Unión Deportiva', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 45, developmentStyle: 'tiki_taka' },
      { id: 'mad-5', name: 'Malasaña Racing Club', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 43, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-6', name: 'Lavapiés Atlético', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 42, developmentStyle: 'tiki_taka' },
      { id: 'mad-7', name: 'Carabanchel Sporting', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 41, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-8', name: 'Vallecas Deportivo', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 40, developmentStyle: 'tiki_taka' },
      { id: 'mad-9', name: 'Usera Cultural', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 40, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-10', name: 'Villaverde Gimnástico', youthLeague: 'Liga de Canteras Madrileñas', city: 'Madrid', country: 'Spain', ovr: 40, developmentStyle: 'tiki_taka' },
    ],
  },
  london: {
    id: 'london',
    name: 'London Youth League',
    city: 'London',
    country: 'England',
    flag: '🏴',
    teams: [
      { id: 'lon-1', name: 'Kensington United', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 50, developmentStyle: 'brexit_ball' },
      { id: 'lon-2', name: 'Camden Athletic', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 48, developmentStyle: 'modern_english' },
      { id: 'lon-3', name: 'Westminster FC', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 47, developmentStyle: 'brexit_ball' },
      { id: 'lon-4', name: 'Greenwich Rovers', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 45, developmentStyle: 'modern_english' },
      { id: 'lon-5', name: 'Islington Town', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 43, developmentStyle: 'brexit_ball' },
      { id: 'lon-6', name: 'Hackney Borough', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 42, developmentStyle: 'modern_english' },
      { id: 'lon-7', name: 'Brixton Athletic', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 41, developmentStyle: 'brexit_ball' },
      { id: 'lon-8', name: 'Croydon FC', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 40, developmentStyle: 'modern_english' },
      { id: 'lon-9', name: 'Peckham Rovers', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 40, developmentStyle: 'brexit_ball' },
      { id: 'lon-10', name: 'Tottenham Hale Town', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 40, developmentStyle: 'modern_english' },
    ],
  },
  paris: {
    id: 'paris',
    name: 'Ligue Parisienne des Jeunes',
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    teams: [
      { id: 'par-1', name: 'Montmartre Olympique', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 50, developmentStyle: 'counter_attack' },
      { id: 'par-2', name: 'Passy Racing Club', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 48, developmentStyle: 'french_possession' },
      { id: 'par-3', name: 'Bastille Athletic', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 47, developmentStyle: 'counter_attack' },
      { id: 'par-4', name: 'Belleville Football Club', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 45, developmentStyle: 'french_possession' },
      { id: 'par-5', name: 'Le Marais Union Sportive', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 43, developmentStyle: 'counter_attack' },
      { id: 'par-6', name: 'Montparnasse Stade', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 42, developmentStyle: 'french_possession' },
      { id: 'par-7', name: 'Batignolles Sporting', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 41, developmentStyle: 'counter_attack' },
      { id: 'par-8', name: 'La Villette FC', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 40, developmentStyle: 'french_possession' },
      { id: 'par-9', name: 'Clignancourt Olympique', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 40, developmentStyle: 'counter_attack' },
      { id: 'par-10', name: 'Auteuil Athletic Club', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 40, developmentStyle: 'french_possession' },
    ],
  },
  roma: {
    id: 'roma',
    name: 'Campionato Giovanile di Roma',
    city: 'Roma',
    country: 'Italy',
    flag: '🇮🇹',
    teams: [
      { id: 'rom-1', name: 'Trastevere Giovanile', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 50, developmentStyle: 'high_intensity_defense' },
      { id: 'rom-2', name: 'Parioli Calcio Junior', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 48, developmentStyle: 'tiki_taka' },
      { id: 'rom-3', name: 'Testaccio Lupetti FC', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 47, developmentStyle: 'high_intensity_defense' },
      { id: 'rom-4', name: 'Prati Aquilotti', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 45, developmentStyle: 'tiki_taka' },
      { id: 'rom-5', name: 'Ostiense Sportiva', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 43, developmentStyle: 'high_intensity_defense' },
      { id: 'rom-6', name: 'Monteverde Ragazzi', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 42, developmentStyle: 'tiki_taka' },
      { id: 'rom-7', name: 'San Lorenzo Azzurri', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 41, developmentStyle: 'high_intensity_defense' },
      { id: 'rom-8', name: 'Flaminio Giovani', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 40, developmentStyle: 'tiki_taka' },
      { id: 'rom-9', name: 'Eur Capitolina Youth', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 40, developmentStyle: 'high_intensity_defense' },
      { id: 'rom-10', name: 'Torpignattara Calcio', youthLeague: 'Campionato Giovanile di Roma', city: 'Roma', country: 'Italy', ovr: 40, developmentStyle: 'tiki_taka' },
    ],
  },
  berlin: {
    id: 'berlin',
    name: 'Berliner Jugendliga',
    city: 'Berlin',
    country: 'Germany',
    flag: '🇩🇪',
    teams: [
      { id: 'ber-1', name: 'Charlottenburg Jugend SV', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 50, developmentStyle: 'high_intensity_defense' },
      { id: 'ber-2', name: 'Kreuzberg Kickers U17', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 48, developmentStyle: 'relational_play' },
      { id: 'ber-3', name: 'Prenzlauer Berg Adler', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 47, developmentStyle: 'high_intensity_defense' },
      { id: 'ber-4', name: 'Köpenick Union Nachwuchs', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 45, developmentStyle: 'relational_play' },
      { id: 'ber-5', name: 'Neukölln Stern Jugend', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 43, developmentStyle: 'high_intensity_defense' },
      { id: 'ber-6', name: 'Mitte Viktoria Jugend', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 42, developmentStyle: 'relational_play' },
      { id: 'ber-7', name: 'Spandau Blau-Weiß', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 41, developmentStyle: 'high_intensity_defense' },
      { id: 'ber-8', name: 'Pankow Eintracht', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 40, developmentStyle: 'relational_play' },
      { id: 'ber-9', name: 'Schöneberg Olympia', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 40, developmentStyle: 'high_intensity_defense' },
      { id: 'ber-10', name: 'Wedding Fortuna Jugend', youthLeague: 'Berliner Jugendliga', city: 'Berlin', country: 'Germany', ovr: 40, developmentStyle: 'relational_play' },
    ],
  },
  lisboa: {
    id: 'lisboa',
    name: 'Liga Juvenil de Lisboa',
    city: 'Lisboa',
    country: 'Portugal',
    flag: '🇵🇹',
    teams: [
      { id: 'lis-1', name: 'Belém Navegadores Sub-17', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 50, developmentStyle: 'tiki_taka' },
      { id: 'lis-2', name: 'Alfama Águias Jovens', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 48, developmentStyle: 'jogo_bonito' },
      { id: 'lis-3', name: 'Alvalade Leõezinhos', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 47, developmentStyle: 'tiki_taka' },
      { id: 'lis-4', name: 'Alcântara Desportivo', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 45, developmentStyle: 'jogo_bonito' },
      { id: 'lis-5', name: 'Chiado Sporting Clube', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 43, developmentStyle: 'tiki_taka' },
      { id: 'lis-6', name: 'Benfica Bairro Juvenil', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 42, developmentStyle: 'jogo_bonito' },
      { id: 'lis-7', name: 'Estrela Atlética Sub-17', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 41, developmentStyle: 'tiki_taka' },
      { id: 'lis-8', name: 'Graça União Futebol', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 40, developmentStyle: 'jogo_bonito' },
      { id: 'lis-9', name: 'Oriente Lusitano', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 40, developmentStyle: 'tiki_taka' },
      { id: 'lis-10', name: 'Marvila Academia FC', youthLeague: 'Liga Juvenil de Lisboa', city: 'Lisboa', country: 'Portugal', ovr: 40, developmentStyle: 'jogo_bonito' },
    ],
  },
  riyadh: {
    id: 'riyadh',
    name: 'Riyadh Youth Champions League',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    teams: [
      { id: 'riy-1', name: 'Olaya Crescents U17', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 50, developmentStyle: 'counter_attack' },
      { id: 'riy-2', name: 'Diriyah Falcons Academy', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 48, developmentStyle: 'relational_play' },
      { id: 'riy-3', name: 'Malaz Royal Youth', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 47, developmentStyle: 'counter_attack' },
      { id: 'riy-4', name: 'Najd Desert Stars', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 45, developmentStyle: 'relational_play' },
      { id: 'riy-5', name: 'Al-Murabba United U17', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 43, developmentStyle: 'counter_attack' },
      { id: 'riy-6', name: 'Suwaidi Athletic Youth', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 42, developmentStyle: 'relational_play' },
      { id: 'riy-7', name: 'Batha Oasis FC', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 41, developmentStyle: 'counter_attack' },
      { id: 'riy-8', name: 'Qiddiya Future Club', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 40, developmentStyle: 'relational_play' },
      { id: 'riy-9', name: 'Al-Rawdah Sporting', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 40, developmentStyle: 'counter_attack' },
      { id: 'riy-10', name: 'Tuwaiq Juniors FC', youthLeague: 'Riyadh Youth Champions League', city: 'Riyadh', country: 'Saudi Arabia', ovr: 40, developmentStyle: 'relational_play' },
    ],
  },
};

const YOUTH_TEAM_COLOR_PALETTES: Array<[string, string, KitPattern]> = [
  ['#dc2626', '#ffffff', 'stripes'],
  ['#1d4ed8', '#facc15', 'solid'],
  ['#047857', '#ffffff', 'sash'],
  ['#7c3aed', '#f8fafc', 'halves'],
  ['#ea580c', '#0f172a', 'solid'],
  ['#0284c7', '#e0f2fe', 'hoops'],
  ['#be123c', '#fde047', 'diagonal'],
  ['#15803d', '#0f172a', 'stripes'],
  ['#b45309', '#fef3c7', 'sash'],
  ['#334155', '#38bdf8', 'solid'],
];

const YOUTH_FORMATIONS: FormationType[] = ['4-3-3', '4-2-3-1', '4-4-2', '3-4-3', '3-5-2'];

export const YOUTH_LEAGUES_DATABASE: Record<string, YouthLeagueData> = Object.fromEntries(
  Object.entries(RAW_YOUTH_LEAGUES_DATABASE).map(([leagueId, league]) => {
    const hydratedTeams: YouthTeamData[] = league.teams.map((team, idx) => {
      const [primaryColor, secondaryColor, pattern] =
        YOUTH_TEAM_COLOR_PALETTES[(idx + leagueId.length) % YOUTH_TEAM_COLOR_PALETTES.length];
      const tierClass: 'big' | 'small' = idx < 3 || team.ovr >= 47 ? 'big' : 'small';
      const preferredFormation = YOUTH_FORMATIONS[(idx + leagueId.length) % YOUTH_FORMATIONS.length];
      const stadiumId = `youth_${leagueId}_${tierClass}`;
      const kit: KitConfig = {
        style: 'normal',
        color1: primaryColor,
        color2: secondaryColor,
        pattern,
        collar: idx % 2 === 0 ? 'crew' : 'v-neck',
      };

      const scaled = getYouthScaledTeamAndPlayers(
        {
          id: team.id,
          name: team.name,
          country: team.country,
          city: team.city,
          youthLeague: team.youthLeague,
          ovr: team.ovr,
          primaryColor,
          secondaryColor,
          preferredFormation,
          tierClass,
          stadiumId,
          kit,
        },
        16,
        'league'
      );

      return {
        ...team,
        tierClass,
        primaryColor,
        secondaryColor,
        kit,
        crowdPalette: [primaryColor, secondaryColor],
        preferredFormation,
        stadiumId,
        players: scaled.players,
      };
    });

    return [
      leagueId,
      {
        ...league,
        teams: hydratedTeams,
      },
    ];
  })
);

/**
 * Returns a dynamically age-scaled (10 -> 16) 23-player squad and EditorTeamData
 * for any Youth League club. Kickoff defaults to age = 16.
 */
export function getYouthLeagueTeamScaledSquad(
  teamOrName: YouthTeamData | string,
  age: number = 16
): YouthScaledTeamResult | null {
  const team =
    typeof teamOrName === 'string'
      ? findYouthTeamAndLeague(teamOrName)?.team
      : teamOrName;
  if (!team) return null;

  const leagueEntry = Object.entries(YOUTH_LEAGUES_DATABASE).find(([, l]) =>
    l.teams.some((t) => t.id === team.id || t.name === team.name)
  );
  const leagueId = leagueEntry?.[0] || 'london';
  const tierClass = team.tierClass || (team.ovr >= 47 ? 'big' : 'small');

  return getYouthScaledTeamAndPlayers(
    {
      id: team.id,
      name: team.name,
      country: team.country,
      city: team.city,
      youthLeague: team.youthLeague,
      ovr: team.ovr,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
      preferredFormation: team.preferredFormation,
      tierClass,
      stadiumId: team.stadiumId || `youth_${leagueId}_${tierClass}`,
      kit: team.kit,
    },
    age,
    'league'
  );
}

/**
 * Strips diacritics and normalizes city/country strings to canonical Youth League keys.
 */
export function normalizeYouthLookupKey(input?: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function getYouthLeagueCountryCode(leagueIdOrCity?: string): string {
  const key = normalizeYouthLookupKey(leagueIdOrCity);
  if (!key) return '';
  if (key === 'buenos_aires' || key.includes('buenos aires') || key.includes('argentin') || key === 'arg' || key.includes('bonaerense')) return 'ARG';
  if (key === 'sao_paulo' || key.includes('sao paulo') || key.includes('brazil') || key.includes('brasil') || key === 'bra' || key.includes('paulista')) return 'BRA';
  if (key === 'madrid' || key.includes('madrid') || key.includes('spain') || key.includes('espana') || key === 'esp' || key.includes('madrilen') || key.includes('canteras')) return 'ESP';
  if (key === 'london' || key.includes('london') || key.includes('londres') || key.includes('england') || key.includes('english') || key === 'eng' || key === 'gb' || key === 'uk') return 'ENG';
  if (key === 'paris' || key.includes('paris') || key.includes('france') || key === 'fr' || key === 'fra') return 'FR';
  if (key === 'roma' || key.includes('roma') || key.includes('rome') || key.includes('italy') || key.includes('italia') || key === 'ita' || key.includes('giovanile di roma')) return 'ITA';
  if (key === 'berlin' || key.includes('berlin') || key.includes('german') || key.includes('deutsch') || key === 'ger' || key === 'deu') return 'GER';
  if (key === 'lisboa' || key.includes('lisboa') || key.includes('lisbon') || key.includes('portug') || key === 'por' || key === 'prt') return 'POR';
  if (key === 'riyadh' || key.includes('riyadh') || key.includes('riad') || key.includes('saudi') || key === 'ksa' || key === 'sau') return 'KSA';
  return '';
}

export function findYouthTeamAndLeague(
  clubName?: string
): { leagueKey: string; league: YouthLeagueData; team: YouthTeamData } | null {
  const target = normalizeYouthLookupKey(clubName);
  if (!target) return null;
  for (const [leagueKey, league] of Object.entries(YOUTH_LEAGUES_DATABASE)) {
    const match = league.teams.find((t) => normalizeYouthLookupKey(t.name) === target);
    if (match) {
      return { leagueKey, league, team: match };
    }
  }
  return null;
}

/**
  Finds the official Youth League matching a city/country/league input.
  Returns null if no matching league exists in the database (zero silent London fallback).
 */
export function getYouthLeagueByCity(cityName?: string): YouthLeagueData | null {
  if (!cityName) return null;
  const normalized = normalizeYouthLookupKey(cityName).replace(/^youth_/, '');
  if (!normalized) return null;

  // Direct ID check
  if (YOUTH_LEAGUES_DATABASE[normalized]) {
    return YOUTH_LEAGUES_DATABASE[normalized];
  }

  if (
    normalized === 'arg' ||
    normalized.includes('buenos aires') ||
    normalized.includes('buenos_aires') ||
    normalized.includes('argentin') ||
    normalized.includes('bonaerense')
  ) {
    return YOUTH_LEAGUES_DATABASE.buenos_aires;
  }
  if (
    normalized === 'bra' ||
    normalized.includes('sao paulo') ||
    normalized.includes('sao_paulo') ||
    normalized.includes('brazil') ||
    normalized.includes('brasil') ||
    normalized.includes('paulista')
  ) {
    return YOUTH_LEAGUES_DATABASE.sao_paulo;
  }
  if (
    normalized === 'esp' ||
    normalized.includes('madrid') ||
    normalized.includes('spain') ||
    normalized.includes('espana') ||
    normalized.includes('madrilen') ||
    normalized.includes('canteras')
  ) {
    return YOUTH_LEAGUES_DATABASE.madrid;
  }
  if (
    normalized === 'eng' ||
    normalized === 'gb' ||
    normalized === 'uk' ||
    normalized.includes('london') ||
    normalized.includes('londres') ||
    normalized.includes('england') ||
    normalized.includes('english')
  ) {
    return YOUTH_LEAGUES_DATABASE.london;
  }
  if (
    normalized === 'fr' ||
    normalized === 'fra' ||
    normalized.includes('paris') ||
    normalized.includes('france') ||
    normalized.includes('parisienne')
  ) {
    return YOUTH_LEAGUES_DATABASE.paris;
  }
  if (
    normalized === 'ita' ||
    normalized.includes('roma') ||
    normalized.includes('rome') ||
    normalized.includes('italy') ||
    normalized.includes('italia') ||
    normalized.includes('giovanile di roma')
  ) {
    return YOUTH_LEAGUES_DATABASE.roma;
  }
  if (
    normalized === 'ger' ||
    normalized === 'deu' ||
    normalized.includes('berlin') ||
    normalized.includes('german') ||
    normalized.includes('deutsch') ||
    normalized.includes('berliner jugendliga')
  ) {
    return YOUTH_LEAGUES_DATABASE.berlin;
  }
  if (
    normalized === 'por' ||
    normalized === 'prt' ||
    normalized.includes('lisboa') ||
    normalized.includes('lisbon') ||
    normalized.includes('portug')
  ) {
    return YOUTH_LEAGUES_DATABASE.lisboa;
  }
  if (
    normalized === 'ksa' ||
    normalized === 'sau' ||
    normalized.includes('riyadh') ||
    normalized.includes('riad') ||
    normalized.includes('saudi')
  ) {
    return YOUTH_LEAGUES_DATABASE.riyadh;
  }

  return null;
}

export interface YouthLeagueLookupPlayer {
  youthLeagueName?: string;
  youthTeamName?: string;
  club?: string;
  league?: string;
  leagueId?: string;
  city?: string;
  startingCity?: string;
  clubCountry?: string;
  countryCode?: string;
  country?: string;
  nationality?: { name?: string; code?: string } | string;
}

/**
 * Strictly resolves the player's authoritative current Youth League with zero London fallback
 * for South American or continental European / Middle Eastern players.
 * Priority:
 * 1. Exact club/youthTeamName match across all Youth Leagues
 * 2. Explicit youthLeagueName / youth_* leagueId / non-pro league
 * 3. Normalized current city / startingCity
 * 4. clubCountry / countryCode / country / nationality
 */
export function resolvePlayerYouthLeagueStrict(
  player?: YouthLeagueLookupPlayer | null
): YouthLeagueData {
  if (!player) return YOUTH_LEAGUES_DATABASE.sao_paulo;

  // 1. Exact youth team / club name lookup across all Youth Leagues
  const clubMatch = findYouthTeamAndLeague(player.youthTeamName || player.club);
  if (clubMatch) {
    return clubMatch.league;
  }

  // 2. Explicit youthLeagueName or youth_* leagueId
  const explicitYouthId =
    player.leagueId && player.leagueId.toLowerCase().startsWith('youth_')
      ? player.leagueId.slice('youth_'.length)
      : '';
  const candidateLeagueStrings = [player.youthLeagueName, explicitYouthId].filter(Boolean) as string[];

  for (const str of candidateLeagueStrings) {
    const norm = normalizeYouthLookupKey(str);
    for (const league of Object.values(YOUTH_LEAGUES_DATABASE)) {
      if (
        normalizeYouthLookupKey(league.name) === norm ||
        normalizeYouthLookupKey(league.id) === norm
      ) {
        return league;
      }
    }
    const matched = getYouthLeagueByCity(str);
    if (matched) return matched;
  }

  // Also check player.league strictly against official Youth League names (never Pro league substrings)
  if (player.league) {
    const normLeague = normalizeYouthLookupKey(player.league);
    for (const league of Object.values(YOUTH_LEAGUES_DATABASE)) {
      if (normalizeYouthLookupKey(league.name) === normLeague || normalizeYouthLookupKey(league.id) === normLeague) {
        return league;
      }
    }
  }

  // 3. Normalized current city / startingCity
  for (const cityCandidate of [player.city, player.startingCity]) {
    if (cityCandidate) {
      const byCity = getYouthLeagueByCity(cityCandidate);
      if (byCity) return byCity;
    }
  }

  // 4. Club country / countryCode / country / nationality
  const natName =
    typeof player.nationality === 'string'
      ? player.nationality
      : player.nationality?.name || '';
  const natCode =
    typeof player.nationality === 'object' ? player.nationality?.code || '' : '';

  for (const countryCandidate of [
    player.countryCode,
    player.clubCountry,
    player.country,
    natCode,
    natName,
  ]) {
    if (countryCandidate) {
      const byCountry = getYouthLeagueByCity(countryCandidate);
      if (byCountry) return byCountry;
    }
  }

  console.warn(
    `[YouthLeagues] Could not resolve Youth League strictly for player (${player.club || 'no-club'}, city=${player.city || player.startingCity || 'none'}, country=${player.countryCode || player.clubCountry || 'none'}). Defaulting to sao_paulo.`
  );
  return YOUTH_LEAGUES_DATABASE.sao_paulo;
}

/**
 * Resolves the player's authoritative current youth league.
 * Delegates to strict non-London-biased resolver.
 */
export function getPlayerCurrentYouthLeague(player?: YouthLeagueLookupPlayer | null): YouthLeagueData {
  return resolvePlayerYouthLeagueStrict(player);
}
