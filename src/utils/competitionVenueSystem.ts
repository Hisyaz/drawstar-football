/**
 * Competition & Final Venue Configuration System
 *
 * Responsibilities:
 * - Provides 3 unique strictly fictional commercial sponsors per club continental & national-team competition.
 * - Defines tournament stadium pools for World Cup, Copa América, Eurocopa, AFCON, Asian Cup, and Oceania (OFC).
 * - Enforces WORLD ARENA exclusively for World Cup Opening Match & World Cup Finals.
 * - Produces dynamic "FINAL [CITY] [YEAR]" perimeter banner configurations and stadium overlays.
 */

import type { TeamSponsor } from '../gameplay/types/team';
import type { ContinentalCompetitionId } from '../types/continentalCompetitions';
import {
  CONTINENTAL_FINAL_VENUE_POOLS,
  getContinentalFinalVenue,
  getLocalizedCity,
} from './continentalVenueSystem';
import { LanguageCode, getStoredLanguage } from './localizationSystem';

export type NationalTournamentVenueId =
  | 'WORLD_CUP'
  | 'COPA_AMERICA'
  | 'EURO'
  | 'AFCON'
  | 'ASIAN_CUP'
  | 'OFC'
  | 'INTL_YOUTH_CUP';

export type CompetitionVenueId = ContinentalCompetitionId | NationalTournamentVenueId;

export function formatFinalBoardText(city: string, year: number): string {
  return `FINAL • ${city.trim().toUpperCase()} • ${year}`;
}

export interface CompetitionVenueEntry {
  stadiumId: string;
  stadiumName: string;
  city: string;
  country: string;
  capacity: number;
}

export interface ResolvedCompetitionVenue {
  competitionId: CompetitionVenueId;
  competitionLabel: string;
  stadiumId: string;
  stadiumName: string;
  city: string;
  localizedCity: string;
  country: string;
  capacity: number;
  year: number;
  isFinal: boolean;
  isOpeningMatch: boolean;
  isNeutralVenue: boolean;
  themeColors: [string, string, string];
  baseSponsors: [TeamSponsor, TeamSponsor, TeamSponsor];
  finalBannerText?: string;
  competitionBannerText: string;
  perimeterSponsors: TeamSponsor[];
}

// ---------------------------------------------------------------------------
// 3 Unique Fictional Sponsors Per Competition (Zero Real-World Brands)
// ---------------------------------------------------------------------------
export const COMPETITION_SPONSORS: Record<
  CompetitionVenueId,
  [TeamSponsor, TeamSponsor, TeamSponsor]
> = {
  UEFA_CL: [
    { id: 'ucl_kronos', name: 'KRONOS TELEKOM', colors: ['#0b1332', '#ffffff', '#60a5fa'] },
    { id: 'ucl_aurora', name: 'AURORA AVIATION', colors: ['#1e1b4b', '#facc15', '#818cf8'] },
    { id: 'ucl_veritas', name: 'VERITAS FINANZ', colors: ['#0f172a', '#e0f2fe', '#38bdf8'] },
  ],
  UEFA_EL: [
    { id: 'uel_solaris', name: 'SOLARIS ENERGY', colors: ['#1c1917', '#fb923c', '#f97316'] },
    { id: 'uel_veloce', name: 'VELOCE MOTORS', colors: ['#09090b', '#ffffff', '#f59e0b'] },
    { id: 'uel_nordic', name: 'NORDIC HORIZON', colors: ['#18181b', '#fed7aa', '#ea580c'] },
  ],
  UEFA_ECL: [
    { id: 'uecl_meridian', name: 'MERIDIAN CLOUD', colors: ['#052e16', '#ffffff', '#22c55e'] },
    { id: 'uecl_atlantis', name: 'ATLANTIS PORT', colors: ['#064e3b', '#ecfdf5', '#10b981'] },
    { id: 'uecl_prisma', name: 'PRISMA AUDIO', colors: ['#090d16', '#86efac', '#34d399'] },
  ],
  UEFA_SC: [
    { id: 'usc_apex', name: 'APEX TELEMETRY', colors: ['#0f172a', '#f8fafc', '#38bdf8'] },
    { id: 'usc_olympus', name: 'OLYMPUS WATCH', colors: ['#1e293b', '#fde047', '#cbd5e1'] },
    { id: 'usc_heliobank', name: 'HELIOBANK', colors: ['#172554', '#ffffff', '#60a5fa'] },
  ],
  CONMEBOL_LIB: [
    { id: 'lib_pampa', name: 'PAMPA DORADA', colors: ['#1c1917', '#fde047', '#eab308'] },
    { id: 'lib_andes', name: 'ANDES BREWING', colors: ['#111827', '#ffffff', '#facc15'] },
    { id: 'lib_caudal', name: 'CAUDAL SEGUROS', colors: ['#27272a', '#fef08a', '#ca8a04'] },
  ],
  CONMEBOL_SUD: [
    { id: 'sud_surlog', name: 'SURAMERICA LOGISTICA', colors: ['#0c4a6e', '#ffffff', '#38bdf8'] },
    { id: 'sud_yaguarete', name: 'YAGUARETE TECH', colors: ['#1e3a8a', '#e0f2fe', '#0ea5e9'] },
    { id: 'sud_tupi', name: 'TUPI ENERGIA', colors: ['#082f49', '#bae6fd', '#0284c7'] },
  ],
  CONMEBOL_REC: [
    { id: 'rec_cordillera', name: 'CORDILLERA CAPITAL', colors: ['#1f2937', '#fcd34d', '#f59e0b'] },
    { id: 'rec_plata', name: 'PLATA FIBERNET', colors: ['#0f172a', '#f8fafc', '#38bdf8'] },
    { id: 'rec_solarsur', name: 'SOLAR DEL SUR', colors: ['#292524', '#fed7aa', '#fb923c'] },
  ],
  CONCACAF_CC: [
    { id: 'ccc_azteca', name: 'AZTECA WIRELESS', colors: ['#064e3b', '#ffffff', '#34d399'] },
    { id: 'ccc_sierra', name: 'SIERRA MOBILITY', colors: ['#0f172a', '#fde047', '#eab308'] },
    { id: 'ccc_caribbean', name: 'CARIBBEAN TRANSIT', colors: ['#172554', '#e0f2fe', '#38bdf8'] },
  ],
  CONCACAF_CAC: [
    { id: 'cac_istmo', name: 'ISTMO BANCO', colors: ['#1e293b', '#ffffff', '#22d3ee'] },
    { id: 'cac_pacifico', name: 'PACIFICO COFFEE', colors: ['#292524', '#fef3c7', '#d97706'] },
    { id: 'cac_quetzal', name: 'QUETZAL AIR', colors: ['#065f46', '#ecfdf5', '#10b981'] },
  ],
  AFC_CL: [
    { id: 'afcl_silkroad', name: 'SILKROAD CARGO', colors: ['#3b0764', '#facc15', '#c084fc'] },
    { id: 'afcl_sakura', name: 'SAKURA ROBOTICS', colors: ['#1e1b4b', '#ffffff', '#a855f7'] },
    { id: 'afcl_shorouk', name: 'SHOROUK PALMS', colors: ['#312e81', '#fef08a', '#e879f9'] },
  ],
  AFC_CUP: [
    { id: 'afcc_pacifica', name: 'PACIFICA CHIPSET', colors: ['#0f172a', '#e0f2fe', '#0ea5e9'] },
    { id: 'afcc_orient', name: 'ORIENT EXPRESSWAY', colors: ['#1e293b', '#fde047', '#f59e0b'] },
    { id: 'afcc_coral', name: 'CORAL MARITIME', colors: ['#134e4a', '#ffffff', '#2dd4bf'] },
  ],
  CAF_CL: [
    { id: 'cafl_savannah', name: 'SAVANNAH SOLAR', colors: ['#052e16', '#fde047', '#22c55e'] },
    { id: 'cafl_atlas', name: 'ATLAS SATLINK', colors: ['#450a0a', '#ffffff', '#ef4444'] },
    { id: 'cafl_oasis', name: 'OASIS BOTANICALS', colors: ['#14532d', '#fef9c3', '#4ade80'] },
  ],
  CAF_CONFED_CUP: [
    { id: 'cafc_baobab', name: 'BAOBAB PAY', colors: ['#1e293b', '#fde047', '#f59e0b'] },
    { id: 'cafc_sahara', name: 'SAHARA LOGISTICS', colors: ['#431407', '#ffffff', '#fb923c'] },
    { id: 'cafc_zambezi', name: 'ZAMBEZI HYDRO', colors: ['#064e3b', '#e0f2fe', '#10b981'] },
  ],
  CAF_SC: [
    { id: 'cafsc_goldcoast', name: 'GOLDCOAST MINING', colors: ['#1c1917', '#fde047', '#eab308'] },
    { id: 'cafsc_nilerail', name: 'NILE RAILWAYS', colors: ['#0f172a', '#ffffff', '#22c55e'] },
    { id: 'cafsc_serengeti', name: 'SERENGETI AIR', colors: ['#3f1d0b', '#fef3c7', '#f97316'] },
  ],
  OFC_CL: [
    { id: 'ofcl_tasman', name: 'TASMAN CLEAN ENERGY', colors: ['#083344', '#ffffff', '#22d3ee'] },
    { id: 'ofcl_coralreef', name: 'CORAL REEF FIBER', colors: ['#0f172a', '#67e8f9', '#06b6d4'] },
    { id: 'ofcl_kiwi', name: 'KIWI MARINA', colors: ['#064e3b', '#f8fafc', '#34d399'] },
  ],
  WORLD_CUP: [
    { id: 'wc_globus', name: 'GLOBUS DIGITAL', colors: ['#0f172a', '#fde047', '#38bdf8'] },
    { id: 'wc_terra', name: 'TERRA SUSTAIN', colors: ['#064e3b', '#ffffff', '#22c55e'] },
    { id: 'wc_nova', name: 'NOVA ORBITAL', colors: ['#1e1b4b', '#f8fafc', '#f59e0b'] },
  ],
  COPA_AMERICA: [
    { id: 'ca_pachamama', name: 'PACHAMAMA BIO', colors: ['#064e3b', '#fde047', '#10b981'] },
    { id: 'ca_guarani', name: 'GUARANI MOTORS', colors: ['#1e3a8a', '#ffffff', '#38bdf8'] },
    { id: 'ca_riogrande', name: 'RIO GRANDE PAY', colors: ['#1c1917', '#fed7aa', '#f59e0b'] },
  ],
  EURO: [
    { id: 'euro_rail', name: 'EUROPA RAIL', colors: ['#172554', '#ffffff', '#38bdf8'] },
    { id: 'euro_rhine', name: 'RHINE OPTICS', colors: ['#0f172a', '#f8fafc', '#60a5fa'] },
    { id: 'euro_baltic', name: 'BALTIC CLOUD', colors: ['#1e1b4b', '#fde047', '#818cf8'] },
  ],
  AFCON: [
    { id: 'afcon_kili', name: 'KILIMANJARO FIBER', colors: ['#14532d', '#fde047', '#22c55e'] },
    { id: 'afcon_maghreb', name: 'MAGHREB BANK', colors: ['#450a0a', '#ffffff', '#f97316'] },
    { id: 'afcon_dune', name: 'DUNE CLEAN POWER', colors: ['#1c1917', '#fef08a', '#eab308'] },
  ],
  ASIAN_CUP: [
    { id: 'ac_shinkansen', name: 'SHINKANSEN TECH', colors: ['#1e1b4b', '#ffffff', '#e879f9'] },
    { id: 'ac_lotus', name: 'LOTUS ELECTRONICS', colors: ['#3b0764', '#fef08a', '#c084fc'] },
    { id: 'ac_persia', name: 'PERSIA MARBLE', colors: ['#0f172a', '#e0f2fe', '#38bdf8'] },
  ],
  OFC: [
    { id: 'ofc_southerncross', name: 'SOUTHERN CROSS AIR', colors: ['#0c4a6e', '#ffffff', '#22d3ee'] },
    { id: 'ofc_aotearoa', name: 'AOTEAROA DAIRY', colors: ['#064e3b', '#ecfdf5', '#34d399'] },
    { id: 'ofc_pacifica', name: 'PACIFICA MARINE', colors: ['#082f49', '#fde047', '#06b6d4'] },
  ],
  INTL_YOUTH_CUP: [
    { id: 'iyc_academy', name: 'NEXTGEN FUTBOL', colors: ['#0f172a', '#fde047', '#38bdf8'] },
    { id: 'iyc_horizont', name: 'HORIZONT SPORT', colors: ['#172554', '#ffffff', '#60a5fa'] },
    { id: 'iyc_solaris', name: 'JUVENTUD GLOBAL', colors: ['#064e3b', '#fef08a', '#22c55e'] },
  ],
};

// ---------------------------------------------------------------------------
// World Cup Exclusive Venue + Regional Tournament Stadium Pools
// ---------------------------------------------------------------------------
export const WORLD_ARENA_VENUE: CompetitionVenueEntry = {
  stadiumId: 'world_arena',
  stadiumName: 'WORLD ARENA',
  city: 'Global Host',
  country: 'International',
  capacity: 95000,
};

export const NATIONAL_TOURNAMENT_VENUE_POOLS: Record<
  NationalTournamentVenueId,
  CompetitionVenueEntry[]
> = {
  WORLD_CUP: [
    { stadiumId: 'usa_meadowlands_bowl', stadiumName: 'Atlantic Liberty Bowl', city: 'New York', country: 'USA', capacity: 82500 },
    { stadiumId: 'mex_azteca_coloso', stadiumName: 'Coloso del Pedregal', city: 'Mexico City', country: 'Mexico', capacity: 87523 },
    { stadiumId: 'eng_national_arch', stadiumName: 'London National Arch Stadium', city: 'London', country: 'England', capacity: 90000 },
    { stadiumId: 'fr_saint_denis', stadiumName: 'Grand Stade du Nord', city: 'Paris', country: 'France', capacity: 80698 },
    { stadiumId: 'santiago_bernabeu', stadiumName: 'Coliseo de Chamartín', city: 'Madrid', country: 'Spain', capacity: 83186 },
    { stadiumId: 'maracana_legend', stadiumName: 'Estádio Carioca Monumental', city: 'Rio de Janeiro', country: 'Brazil', capacity: 78838 },
    { stadiumId: 'estadio_monumental', stadiumName: 'Estadio Monumental de Núñez', city: 'Buenos Aires', country: 'Argentina', capacity: 84567 },
    { stadiumId: 'ger_bavaria_arena', stadiumName: 'Bavaria Rot Arena', city: 'Munich', country: 'Germany', capacity: 75024 },
    { stadiumId: 'hun_danube_arena', stadiumName: 'Danube National Arena', city: 'Budapest', country: 'Hungary', capacity: 67215 },
    { stadiumId: 'afc_modern_world_arena', stadiumName: 'Musashino Olympic Stadium', city: 'Tokyo', country: 'Japan', capacity: 68000 },
    { stadiumId: 'ita_roma_olimpico', stadiumName: 'Stadio Olimpico della Capitale', city: 'Rome', country: 'Italy', capacity: 70634 },
    { stadiumId: 'ksa_kingdom_pearl', stadiumName: 'Pearl of Najd Arena', city: 'Riyadh', country: 'Saudi Arabia', capacity: 68752 },
  ],
  COPA_AMERICA: [
    { stadiumId: 'estadio_monumental', stadiumName: 'Estadio Monumental de Núñez', city: 'Buenos Aires', country: 'Argentina', capacity: 84567 },
    { stadiumId: 'maracana_legend', stadiumName: 'Estádio Carioca Monumental', city: 'Rio de Janeiro', country: 'Brazil', capacity: 78838 },
    { stadiumId: 'uru_centenario', stadiumName: 'Estadio Centenario del Plata', city: 'Montevideo', country: 'Uruguay', capacity: 60235 },
    { stadiumId: 'col_barranquilla_caribe', stadiumName: 'Estadio Metropolitano del Caribe', city: 'Barranquilla', country: 'Colombia', capacity: 46692 },
    { stadiumId: 'col_bogota_arena', stadiumName: 'Estadio Altiplano Andino', city: 'Bogotá', country: 'Colombia', capacity: 39512 },
    { stadiumId: 'col_medellin_arena', stadiumName: 'Estadio Olímpico del Valle de Aburrá', city: 'Medellín', country: 'Colombia', capacity: 44739 },
    { stadiumId: 'conmebol_pacific_andes_oval', stadiumName: 'Estadio Nacional de los Andes', city: 'Santiago', country: 'Chile', capacity: 48665 },
    { stadiumId: 'conmebol_pacific_andes_oval', stadiumName: 'Estadio Nacional del Pacífico', city: 'Lima', country: 'Peru', capacity: 43086 },
    { stadiumId: 'conmebol_pacific_andes_oval', stadiumName: 'Estadio Nacional del Chaco', city: 'Asunción', country: 'Paraguay', capacity: 42354 },
    { stadiumId: 'bra_morumbi_paulista', stadiumName: 'Estádio Paulista do Morumbi', city: 'São Paulo', country: 'Brazil', capacity: 66795 },
    { stadiumId: 'bra_itaquera_arena', stadiumName: 'Arena Leste Paulista', city: 'São Paulo', country: 'Brazil', capacity: 49205 },
    { stadiumId: 'bra_engenho_olimpico', stadiumName: 'Estádio Olímpico do Engenho', city: 'Rio de Janeiro', country: 'Brazil', capacity: 46831 },
    { stadiumId: 'la_bombonera', stadiumName: 'La Caja', city: 'Buenos Aires', country: 'Argentina', capacity: 54000 },
    { stadiumId: 'arg_cilindro_sur', stadiumName: 'Estadio Cilindro del Sur', city: 'Avellaneda', country: 'Argentina', capacity: 51389 },
  ],
  EURO: [
    { stadiumId: 'eng_national_arch', stadiumName: 'London National Arch Stadium', city: 'London', country: 'England', capacity: 90000 },
    { stadiumId: 'hun_danube_arena', stadiumName: 'Danube National Arena', city: 'Budapest', country: 'Hungary', capacity: 67215 },
    { stadiumId: 'fr_saint_denis', stadiumName: 'Grand Stade du Nord', city: 'Paris', country: 'France', capacity: 80698 },
    { stadiumId: 'santiago_bernabeu', stadiumName: 'Coliseo de Chamartín', city: 'Madrid', country: 'Spain', capacity: 83186 },
    { stadiumId: 'esp_catalunya_bowl', stadiumName: 'Gran Estadio de Les Corts', city: 'Barcelona', country: 'Spain', capacity: 99354 },
    { stadiumId: 'ger_bavaria_arena', stadiumName: 'Bavaria Rot Arena', city: 'Munich', country: 'Germany', capacity: 75024 },
    { stadiumId: 'ger_westfalen_wall', stadiumName: 'Westfalen Signal Bastion', city: 'Dortmund', country: 'Germany', capacity: 81365 },
    { stadiumId: 'ita_roma_olimpico', stadiumName: 'Stadio Olimpico della Capitale', city: 'Rome', country: 'Italy', capacity: 70634 },
    { stadiumId: 'ita_lombardia_arena', stadiumName: 'Stadio della Lombardia', city: 'Milan', country: 'Italy', capacity: 75817 },
    { stadiumId: 'ned_amstel_arena', stadiumName: 'Amstel Grand Arena', city: 'Amsterdam', country: 'Netherlands', capacity: 55865 },
    { stadiumId: 'por_lisboa_luz', stadiumName: 'Estádio da Colina da Luz', city: 'Lisbon', country: 'Portugal', capacity: 64642 },
    { stadiumId: 'eng_tottenham_superdome', stadiumName: 'North London Superdome', city: 'London', country: 'England', capacity: 62850 },
  ],
  AFCON: [
    { stadiumId: 'caf_north_olympic_bowl', stadiumName: 'Atlantic Grand Bowl', city: 'Casablanca', country: 'Morocco', capacity: 67000 },
    { stadiumId: 'caf_north_olympic_bowl', stadiumName: 'Algiers Mediterranean Olympic Bowl', city: 'Algiers', country: 'Algeria', capacity: 64000 },
    { stadiumId: 'caf_north_olympic_bowl', stadiumName: 'Nile International Olympic Stadium', city: 'Cairo', country: 'Egypt', capacity: 75000 },
    { stadiumId: 'sen_diamniadio_arena', stadiumName: 'Diamniadio Lions Arena', city: 'Diamniadio', country: 'Senegal', capacity: 50000 },
  ],
  ASIAN_CUP: [
    { stadiumId: 'afc_modern_world_arena', stadiumName: 'Musashino Olympic Stadium', city: 'Tokyo', country: 'Japan', capacity: 68000 },
    { stadiumId: 'afc_modern_world_arena', stadiumName: 'Han River World Arena', city: 'Seoul', country: 'South Korea', capacity: 66704 },
    { stadiumId: 'afc_modern_world_arena', stadiumName: 'Harbour Olympic Stadium', city: 'Sydney', country: 'Australia', capacity: 82500 },
    { stadiumId: 'ksa_kingdom_pearl', stadiumName: 'Pearl of Najd Arena', city: 'Riyadh', country: 'Saudi Arabia', capacity: 68752 },
  ],
  OFC: [
    { stadiumId: 'floating_marina_arena', stadiumName: 'Oceania Floating Marina Arena', city: 'Pacific Marina', country: 'Oceania', capacity: 42000 },
    { stadiumId: 'nzl_waitemata_harbour', stadiumName: 'Waitemata Harbour Stadium', city: 'Auckland', country: 'New Zealand', capacity: 50000 },
  ],
  INTL_YOUTH_CUP: [
    { stadiumId: 'estadio_monumental', stadiumName: 'Estadio Monumental de Núñez', city: 'Buenos Aires', country: 'Argentina', capacity: 84567 },
    { stadiumId: 'maracana_legend', stadiumName: 'Estádio Carioca Monumental', city: 'Rio de Janeiro', country: 'Brazil', capacity: 78838 },
    { stadiumId: 'santiago_bernabeu', stadiumName: 'Coliseo de Chamartín', city: 'Madrid', country: 'Spain', capacity: 83186 },
    { stadiumId: 'eng_national_arch', stadiumName: 'London National Arch Stadium', city: 'London', country: 'England', capacity: 90000 },
    { stadiumId: 'fr_saint_denis', stadiumName: 'Grand Stade du Nord', city: 'Paris', country: 'France', capacity: 80698 },
    { stadiumId: 'ita_roma_olimpico', stadiumName: 'Stadio Olimpico della Capitale', city: 'Rome', country: 'Italy', capacity: 70634 },
    { stadiumId: 'ger_bavaria_arena', stadiumName: 'Bavaria Rot Arena', city: 'Munich', country: 'Germany', capacity: 75024 },
    { stadiumId: 'por_lisboa_luz', stadiumName: 'Estádio da Colina da Luz', city: 'Lisbon', country: 'Portugal', capacity: 64642 },
    { stadiumId: 'ksa_kingdom_pearl', stadiumName: 'Pearl of Najd Arena', city: 'Riyadh', country: 'Saudi Arabia', capacity: 68752 },
  ],
};

const COMPETITION_LABELS: Record<CompetitionVenueId, string> = {
  UEFA_CL: 'EUROPEAN WINNERS LEAGUE',
  UEFA_EL: 'EUROPEAN EUROLEAGUE',
  UEFA_ECL: 'EUROPEAN CONFEDERATIONS CUP',
  UEFA_SC: 'SUPEREUROCUP',
  CONMEBOL_LIB: 'COPA DE PROCERES',
  CONMEBOL_SUD: 'SUDACA',
  CONMEBOL_REC: 'RECOPASUDACA',
  CONCACAF_CC: 'NAF WINNERS CUP',
  CONCACAF_CAC: 'CARIBEAN CUP',
  AFC_CL: 'AFN ASIAN WINNERS CUP',
  AFC_CUP: 'AFN ASIAN WINNERS TWO',
  CAF_CL: 'AF WINNERS LEAGUE',
  CAF_CONFED_CUP: 'AF NATIONS CUP',
  CAF_SC: 'AF SUPERCUP',
  OFC_CL: 'OCE WINNERS CUP',
  WORLD_CUP: 'WORLD CHAMPIONSHIP',
  COPA_AMERICA: 'COPA DE LAS AMERICAS',
  EURO: 'EUROCUP',
  AFCON: 'AFRICAN CUP',
  ASIAN_CUP: 'AFN ASIAN CUP',
  OFC: 'OCEANIC CUP',
  INTL_YOUTH_CUP: 'INTERNATIONAL YOUTH CUP',
};

const COMPETITION_THEME_COLORS: Record<CompetitionVenueId, [string, string, string]> = {
  UEFA_CL: ['#0f172a', '#f8fafc', '#3b82f6'],
  UEFA_EL: ['#1c1917', '#fb923c', '#f8fafc'],
  UEFA_ECL: ['#052e16', '#22c55e', '#f8fafc'],
  UEFA_SC: ['#172554', '#facc15', '#38bdf8'],
  CONMEBOL_LIB: ['#1c1917', '#facc15', '#ffffff'],
  CONMEBOL_SUD: ['#0c4a6e', '#38bdf8', '#ffffff'],
  CONMEBOL_REC: ['#1e293b', '#fbbf24', '#38bdf8'],
  CONCACAF_CC: ['#064e3b', '#facc15', '#ffffff'],
  CONCACAF_CAC: ['#134e4a', '#2dd4bf', '#ffffff'],
  AFC_CL: ['#3b0764', '#facc15', '#c084fc'],
  AFC_CUP: ['#0f172a', '#38bdf8', '#facc15'],
  CAF_CL: ['#052e16', '#facc15', '#ef4444'],
  CAF_CONFED_CUP: ['#431407', '#fb923c', '#ffffff'],
  CAF_SC: ['#1c1917', '#facc15', '#22c55e'],
  OFC_CL: ['#083344', '#22d3ee', '#ffffff'],
  WORLD_CUP: ['#0f172a', '#facc15', '#38bdf8'],
  COPA_AMERICA: ['#064e3b', '#facc15', '#38bdf8'],
  EURO: ['#172554', '#38bdf8', '#ffffff'],
  AFCON: ['#14532d', '#facc15', '#ef4444'],
  ASIAN_CUP: ['#3b0764', '#e879f9', '#facc15'],
  OFC: ['#0c4a6e', '#22d3ee', '#f8fafc'],
  INTL_YOUTH_CUP: ['#0f172a', '#fde047', '#38bdf8'],
};

function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Infers CompetitionVenueId from competitionId, competitionName, or stageTitle.
 */
export function inferCompetitionVenueId(
  competitionId?: string,
  competitionName?: string,
  stageName?: string
): CompetitionVenueId | null {
  if (competitionId) {
    const upper = competitionId.trim().toUpperCase();
    if (upper in COMPETITION_SPONSORS) {
      return upper as CompetitionVenueId;
    }
    if (upper === 'FIFA_WORLD_CUP' || upper === 'WC') return 'WORLD_CUP';
    if (upper === 'UEFA_EURO' || upper === 'EURO_CUP') return 'EURO';
    if (upper === 'AFRICA_CUP' || upper === 'CAF_AFCON') return 'AFCON';
    if (upper === 'AFC_ASIAN_CUP') return 'ASIAN_CUP';
    if (upper === 'OFC_NATIONS_CUP' || upper === 'OFC_CUP') return 'OFC';
    if (upper === 'INTERNATIONAL_YOUTH_CUP' || upper === 'YOUTH_CUP' || upper === 'IYC') return 'INTL_YOUTH_CUP';
  }

  const haystack = `${competitionName || ''} ${stageName || ''}`.toLowerCase();
  if (!haystack.trim()) return null;

  if (
    haystack.includes('intl youth cup') ||
    haystack.includes('international youth cup') ||
    haystack.includes('youth world cup') ||
    haystack.includes('youth cup')
  ) {
    return 'INTL_YOUTH_CUP';
  }
  if (
    haystack.includes('world championship') ||
    haystack.includes('world cup') ||
    haystack.includes('mundial') ||
    haystack.includes('copa del mundo')
  ) {
    return 'WORLD_CUP';
  }
  if (
    haystack.includes('copa de las americas') ||
    haystack.includes('copa america') ||
    haystack.includes('copa américa')
  ) {
    return 'COPA_AMERICA';
  }
  if (
    haystack.includes('eurocup') ||
    haystack.includes('eurocopa') ||
    haystack.includes('uefa euro') ||
    haystack.includes('european championship') ||
    haystack.includes('euro 20')
  ) {
    return 'EURO';
  }
  if (
    haystack.includes('african cup') ||
    haystack.includes('afcon') ||
    haystack.includes('africa cup') ||
    haystack.includes('copa africana')
  ) {
    return 'AFCON';
  }
  if (
    haystack.includes('afn asian cup') ||
    haystack.includes('asian cup') ||
    haystack.includes('copa asiática') ||
    haystack.includes('afc asian')
  ) {
    return 'ASIAN_CUP';
  }
  if (
    haystack.includes('oceanic cup') ||
    haystack.includes('oceania') ||
    haystack.includes('ofc nations')
  ) {
    return 'OFC';
  }
  if (
    haystack.includes('european winners league') ||
    haystack.includes('ewl') ||
    haystack.includes('champions league') ||
    haystack.includes('ucl') ||
    haystack.includes('european champions')
  ) {
    return haystack.includes('caf') || haystack.includes('african') || haystack.includes('af winners')
      ? 'CAF_CL'
      : haystack.includes('afc') || haystack.includes('asian') || haystack.includes('afn')
      ? 'AFC_CL'
      : haystack.includes('ofc') || haystack.includes('oce winners')
      ? 'OFC_CL'
      : 'UEFA_CL';
  }
  if (haystack.includes('af winners league')) return 'CAF_CL';
  if (haystack.includes('afn asian winners cup')) return 'AFC_CL';
  if (haystack.includes('afn asian winners two') || haystack.includes('afc cup')) return 'AFC_CUP';
  if (haystack.includes('oce winners cup')) return 'OFC_CL';
  if (
    haystack.includes('european euroleague') ||
    haystack.includes('eel') ||
    haystack.includes('europa league') ||
    haystack.includes('uel')
  ) {
    return 'UEFA_EL';
  }
  if (
    haystack.includes('european confederations cup') ||
    haystack.includes('ecc') ||
    haystack.includes('conference league') ||
    haystack.includes('uecl')
  ) {
    return 'UEFA_ECL';
  }
  if (haystack.includes('supereurocup')) return 'UEFA_SC';
  if (haystack.includes('af supercup')) return 'CAF_SC';
  if (haystack.includes('super cup') || haystack.includes('supercopa')) {
    if (haystack.includes('caf') || haystack.includes('af ')) return 'CAF_SC';
    return 'UEFA_SC';
  }
  if (haystack.includes('copa de proceres') || haystack.includes('libertadores')) return 'CONMEBOL_LIB';
  if (haystack.includes('recopasudaca') || haystack.includes('recopa')) return 'CONMEBOL_REC';
  if (haystack.includes('sudaca') || haystack.includes('sudamericana')) return 'CONMEBOL_SUD';
  if (
    haystack.includes('naf winners cup') ||
    (haystack.includes('concacaf') && haystack.includes('champions'))
  ) {
    return 'CONCACAF_CC';
  }
  if (haystack.includes('caribean cup') || haystack.includes('central american')) return 'CONCACAF_CAC';
  if (haystack.includes('af nations cup') || haystack.includes('confederation cup')) return 'CAF_CONFED_CUP';

  return null;
}

export function isNationalTournamentVenueId(
  id: CompetitionVenueId
): id is NationalTournamentVenueId {
  return (
    id === 'WORLD_CUP' ||
    id === 'COPA_AMERICA' ||
    id === 'EURO' ||
    id === 'AFCON' ||
    id === 'ASIAN_CUP' ||
    id === 'OFC' ||
    id === 'INTL_YOUTH_CUP'
  );
}

/**
 * Resolves full tournament/final stadium & perimeter banner + 3-sponsor configuration.
 */
export function resolveCompetitionMatchVenue(params: {
  competitionId?: string;
  competitionName?: string;
  stageName?: string;
  seasonYear: number;
  isFinal?: boolean;
  isOpeningMatch?: boolean;
  fixtureSeed?: string;
  overrideCity?: string;
  overrideStadiumId?: string;
  homeStadiumId?: string;
  homeStadiumName?: string;
  homeStadiumCity?: string;
  homeStadiumCapacity?: number;
  language?: LanguageCode;
}): ResolvedCompetitionVenue | null {
  const compId = inferCompetitionVenueId(
    params.competitionId,
    params.competitionName,
    params.stageName
  );
  if (!compId) return null;

  const year = params.seasonYear || 2026;
  const stageLow = (params.stageName || '').toLowerCase();
  const isFinal =
    params.isFinal ??
    (stageLow.includes('grand final') ||
      stageLow.endsWith('final') ||
      stageLow.includes(' final'));
  const isOpeningMatch = params.isOpeningMatch ?? false;
  const lang = params.language || getStoredLanguage();
  const baseSponsors = COMPETITION_SPONSORS[compId];
  const themeColors = COMPETITION_THEME_COLORS[compId];
  const competitionLabel = COMPETITION_LABELS[compId];

  let selectedVenue: CompetitionVenueEntry;
  let isNeutralVenue = true;

  if (isNationalTournamentVenueId(compId)) {
    if (compId === 'WORLD_CUP' && (isFinal || isOpeningMatch)) {
      selectedVenue = { ...WORLD_ARENA_VENUE };
    } else {
      const pool = NATIONAL_TOURNAMENT_VENUE_POOLS[compId];
      if (params.overrideCity) {
        const matched = pool.find(
          (v) => v.city.toLowerCase() === params.overrideCity!.trim().toLowerCase()
        );
        if (matched) {
          selectedVenue = matched;
        } else {
          const idx = stableHash(`${compId}_${year}_${params.fixtureSeed || 'match'}`) % pool.length;
          selectedVenue = { ...pool[idx], city: params.overrideCity };
        }
      } else {
        const idx =
          stableHash(`${compId}_${year}_${isFinal ? 'final' : params.fixtureSeed || 'group'}`) %
          pool.length;
        selectedVenue = pool[idx];
      }
    }
  } else {
    // Club Continental Competition
    const pool = CONTINENTAL_FINAL_VENUE_POOLS[compId] || CONTINENTAL_FINAL_VENUE_POOLS.UEFA_CL;
    if (isFinal) {
      if (params.overrideCity) {
        const matched = pool.find(
          (v) => v.city.toLowerCase() === params.overrideCity!.trim().toLowerCase()
        );
        const picked = matched || getContinentalFinalVenue(compId, year);
        selectedVenue = {
          stadiumId: params.overrideStadiumId || picked.stadiumId || 'eng_national_arch',
          stadiumName: picked.stadium,
          city: matched ? matched.city : params.overrideCity,
          country: picked.country,
          capacity: picked.capacity,
        };
      } else {
        const picked = getContinentalFinalVenue(compId, year);
        selectedVenue = {
          stadiumId: params.overrideStadiumId || picked.stadiumId || 'eng_national_arch',
          stadiumName: picked.stadium,
          city: picked.city,
          country: picked.country,
          capacity: picked.capacity,
        };
      }
    } else {
      // Non-final two-legged continental ties are played at the home club's ground
      isNeutralVenue = false;
      const fallbackFinal = getContinentalFinalVenue(compId, year);
      selectedVenue = {
        stadiumId: params.homeStadiumId || fallbackFinal.stadiumId || 'eur_modern_compact_arena',
        stadiumName: params.homeStadiumName || fallbackFinal.stadium,
        city: params.homeStadiumCity || fallbackFinal.city,
        country: fallbackFinal.country,
        capacity: params.homeStadiumCapacity || 52000,
      };
    }
  }

  const localizedCity = getLocalizedCity(selectedVenue.city, lang);
  const finalBannerText = isFinal
    ? formatFinalBoardText(localizedCity, year)
    : undefined;
  const competitionBannerText = isOpeningMatch
    ? `${competitionLabel} OPENER ${year}`
    : `${competitionLabel} ${year}`;

  const bannerSponsor: TeamSponsor = {
    id: `${compId.toLowerCase()}_banner_${year}`,
    name: finalBannerText || competitionBannerText,
    colors: [themeColors[0], themeColors[1], themeColors[2]],
  };

  // Interleave the competition/FINAL banner all around the perimeter adboards alongside the 3 unique sponsors
  const perimeterSponsors: TeamSponsor[] = [
    bannerSponsor,
    baseSponsors[0],
    bannerSponsor,
    baseSponsors[1],
    bannerSponsor,
    baseSponsors[2],
  ];

  return {
    competitionId: compId,
    competitionLabel,
    stadiumId: selectedVenue.stadiumId,
    stadiumName: selectedVenue.stadiumName,
    city: selectedVenue.city,
    localizedCity,
    country: selectedVenue.country,
    capacity: selectedVenue.capacity,
    year,
    isFinal,
    isOpeningMatch,
    isNeutralVenue,
    themeColors,
    baseSponsors,
    finalBannerText,
    competitionBannerText,
    perimeterSponsors,
  };
}
