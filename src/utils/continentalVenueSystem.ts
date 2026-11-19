import {
  ContinentalCompetitionId,
  ContinentalFinalVenue,
} from '../types/continentalCompetitions';
import { LanguageCode, getStoredLanguage } from './localizationSystem';

/**
 * 1. FINAL VENUE POOLS
 * Each competition has an authentic pool of final venues.
 * Rules:
 * - No city is duplicated within the same competition pool.
 * - Maximum 2 venues per country where possible.
 * - Official and historical host stadiums.
 */
export const CONTINENTAL_FINAL_VENUE_POOLS: Record<ContinentalCompetitionId, ContinentalFinalVenue[]> = {
  // UEFA Champions League — 12 copyright-safe arenas including Budapest (Danube National Arena) & Lisbon
  UEFA_CL: [
    { city: 'London', country: 'England', stadium: 'London National Arch Stadium', capacity: 90000, stadiumId: 'eng_national_arch' },
    { city: 'Budapest', country: 'Hungary', stadium: 'Danube National Arena', capacity: 67215, stadiumId: 'hun_danube_arena' },
    { city: 'Paris', country: 'France', stadium: 'Grand Stade du Nord', capacity: 80698, stadiumId: 'fr_saint_denis' },
    { city: 'Madrid', country: 'Spain', stadium: 'Coliseo de Chamartín', capacity: 83186, stadiumId: 'santiago_bernabeu' },
    { city: 'Munich', country: 'Germany', stadium: 'Bavaria Rot Arena', capacity: 75024, stadiumId: 'ger_bavaria_arena' },
    { city: 'Rome', country: 'Italy', stadium: 'Stadio Olimpico della Capitale', capacity: 70634, stadiumId: 'ita_roma_olimpico' },
    { city: 'Lisbon', country: 'Portugal', stadium: 'Estádio da Colina da Luz', capacity: 64642, stadiumId: 'por_lisboa_luz' },
    { city: 'Milan', country: 'Italy', stadium: 'Stadio della Lombardia', capacity: 75817, stadiumId: 'ita_lombardia_arena' },
    { city: 'Amsterdam', country: 'Netherlands', stadium: 'Amstel Grand Arena', capacity: 55865, stadiumId: 'ned_amstel_arena' },
    { city: 'Istanbul', country: 'Türkiye', stadium: 'Bosporus Olympic Arena', capacity: 76000, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Glasgow', country: 'Scotland', stadium: 'Clyde Park National', capacity: 52000, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Berlin', country: 'Germany', stadium: 'Spree Olympic Stadion', capacity: 74475, stadiumId: 'eur_modern_compact_arena' },
  ],

  // UEFA Europa League — 10 venues
  UEFA_EL: [
    { city: 'Dublin', country: 'Ireland', stadium: 'Liffey Park Arena', capacity: 51700, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Seville', country: 'Spain', stadium: 'Estadio del Guadalquivir', capacity: 52000, stadiumId: 'esp_andaluz_ground' },
    { city: 'Baku', country: 'Azerbaijan', stadium: 'Caspian Olympic Arena', capacity: 68700, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Gdańsk', country: 'Poland', stadium: 'Baltic Amber Arena', capacity: 41600, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Lyon', country: 'France', stadium: 'Rhône Grand Arena', capacity: 59186, stadiumId: 'fr_lyon_rhone' },
    { city: 'Stockholm', country: 'Sweden', stadium: 'Nordic Crown Arena', capacity: 50000, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Basel', country: 'Switzerland', stadium: 'Rhine Park Stadium', capacity: 38500, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Budapest', country: 'Hungary', stadium: 'Danube National Arena', capacity: 67215, stadiumId: 'hun_danube_arena' },
    { city: 'Turin', country: 'Italy', stadium: 'Torino Alpi Arena', capacity: 41507, stadiumId: 'ita_torino_arena' },
    { city: 'Bilbao', country: 'Spain', stadium: 'Catedral de Bizkaia Arena', capacity: 53200, stadiumId: 'esp_basque_cathedral' },
  ],

  // UEFA Conference League — 10 venues
  UEFA_ECL: [
    { city: 'Tirana', country: 'Albania', stadium: 'Illyria National Arena', capacity: 22500, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Prague', country: 'Czech Republic', stadium: 'Bohemia City Arena', capacity: 24500, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Athens', country: 'Greece', stadium: 'Aegean Classic Arena', capacity: 32500, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Wrocław', country: 'Poland', stadium: 'Silesia Municipal Arena', capacity: 45100, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Leipzig', country: 'Germany', stadium: 'Saxony Central Arena', capacity: 47000, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Vienna', country: 'Austria', stadium: 'Prater Imperial Stadion', capacity: 50800, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Rotterdam', country: 'Netherlands', stadium: 'Maas Harbour Stadion', capacity: 51100, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Helsinki', country: 'Finland', stadium: 'Baltic Olympic Bowl', capacity: 36200, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Copenhagen', country: 'Denmark', stadium: 'Øresund Park Arena', capacity: 38000, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Warsaw', country: 'Poland', stadium: 'Vistula National Arena', capacity: 58500, stadiumId: 'eur_modern_compact_arena' },
  ],

  // UEFA Super Cup — 6 venues
  UEFA_SC: [
    { city: 'Helsinki', country: 'Finland', stadium: 'Baltic Olympic Bowl', capacity: 36200, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Piraeus', country: 'Greece', stadium: 'Saronic Port Arena', capacity: 32115, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Warsaw', country: 'Poland', stadium: 'Vistula National Arena', capacity: 58500, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Cardiff', country: 'Wales', stadium: 'Taff River National Arena', capacity: 74000, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Budapest', country: 'Hungary', stadium: 'Danube National Arena', capacity: 67215, stadiumId: 'hun_danube_arena' },
    { city: 'Tallinn', country: 'Estonia', stadium: 'Northern Citadel Park', capacity: 25000, stadiumId: 'eur_modern_compact_arena' },
  ],

  // CONMEBOL Libertadores — 10 venues
  CONMEBOL_LIB: [
    { city: 'Rio de Janeiro', country: 'Brazil', stadium: 'Estádio Carioca Monumental', capacity: 78838, stadiumId: 'maracana_legend' },
    { city: 'Buenos Aires', country: 'Argentina', stadium: 'Estadio Monumental de Núñez', capacity: 84567, stadiumId: 'estadio_monumental' },
    { city: 'Montevideo', country: 'Uruguay', stadium: 'Estadio Centenario del Plata', capacity: 60235, stadiumId: 'uru_centenario' },
    { city: 'Lima', country: 'Peru', stadium: 'Estadio Nacional del Pacífico', capacity: 55000, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Santiago', country: 'Chile', stadium: 'Estadio Nacional de los Andes', capacity: 48665, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Guayaquil', country: 'Ecuador', stadium: 'Estadio del Astillero Sur', capacity: 59283, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'São Paulo', country: 'Brazil', stadium: 'Estádio Paulista do Morumbi', capacity: 66795, stadiumId: 'bra_morumbi_paulista' },
    { city: 'Medellín', country: 'Colombia', stadium: 'Estadio Olímpico del Valle de Aburrá', capacity: 44739, stadiumId: 'col_medellin_arena' },
    { city: 'Asunción', country: 'Paraguay', stadium: 'Estadio Nacional del Chaco', capacity: 42354, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Barranquilla', country: 'Colombia', stadium: 'Estadio Metropolitano del Caribe', capacity: 46692, stadiumId: 'col_barranquilla_caribe' },
  ],

  // CONMEBOL Sudamericana — 10 venues
  CONMEBOL_SUD: [
    { city: 'Asunción', country: 'Paraguay', stadium: 'Estadio Olla del Chaco', capacity: 45000, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Córdoba', country: 'Argentina', stadium: 'Estadio Chateau de la Sierra', capacity: 57000, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Bogotá', country: 'Colombia', stadium: 'Estadio Altiplano Andino', capacity: 39512, stadiumId: 'col_bogota_arena' },
    { city: 'Brasília', country: 'Brazil', stadium: 'Estádio Planalto Central', capacity: 72788, stadiumId: 'bra_engenho_olimpico' },
    { city: 'Quito', country: 'Ecuador', stadium: 'Estadio de la Mitad Andina', capacity: 41575, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Viña del Mar', country: 'Chile', stadium: 'Estadio Bahía del Pacífico', capacity: 32000, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Santa Cruz', country: 'Bolivia', stadium: 'Estadio Oriente Boliviano', capacity: 38500, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Porto Alegre', country: 'Brazil', stadium: 'Arena dos Pampas', capacity: 55662, stadiumId: 'bra_itaquera_arena' },
    { city: 'Rosario', country: 'Argentina', stadium: 'Estadio Coloso del Parque', capacity: 42000, stadiumId: 'arg_avellaneda_fortaleza' },
    { city: 'Cali', country: 'Colombia', stadium: 'Estadio Olímpico del Valle del Cauca', capacity: 38588, stadiumId: 'conmebol_pacific_andes_oval' },
  ],

  // CONMEBOL Recopa — 4 venues
  CONMEBOL_REC: [
    { city: 'Rio de Janeiro', country: 'Brazil', stadium: 'Estádio Carioca Monumental', capacity: 78838, stadiumId: 'maracana_legend' },
    { city: 'Buenos Aires', country: 'Argentina', stadium: 'Estadio Monumental de Núñez', capacity: 84567, stadiumId: 'estadio_monumental' },
    { city: 'Montevideo', country: 'Uruguay', stadium: 'Estadio Centenario del Plata', capacity: 60235, stadiumId: 'uru_centenario' },
    { city: 'Quito', country: 'Ecuador', stadium: 'Estadio de la Mitad Andina', capacity: 41575, stadiumId: 'conmebol_pacific_andes_oval' },
  ],

  // CONCACAF Champions Cup — 10 venues
  CONCACAF_CC: [
    { city: 'Mexico City', country: 'Mexico', stadium: 'Coloso del Pedregal', capacity: 87523, stadiumId: 'mex_azteca_coloso' },
    { city: 'New York', country: 'USA', stadium: 'Atlantic Liberty Bowl', capacity: 82500, stadiumId: 'usa_meadowlands_bowl' },
    { city: 'Guadalajara', country: 'Mexico', stadium: 'Estadio Valle de Zapopan', capacity: 46355, stadiumId: 'mex_azteca_coloso' },
    { city: 'Atlanta', country: 'USA', stadium: 'Georgia Peachtree Dome', capacity: 71000, stadiumId: 'usa_meadowlands_bowl' },
    { city: 'San José', country: 'Costa Rica', stadium: 'Estadio Sabana Nacional', capacity: 35100, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Toronto', country: 'Canada', stadium: 'Ontario Harbour Field', capacity: 35000, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Monterrey', country: 'Mexico', stadium: 'Estadio Sierra Madre Norte', capacity: 53500, stadiumId: 'mex_azteca_coloso' },
    { city: 'Miami', country: 'USA', stadium: 'Biscayne Sun Bowl', capacity: 65326, stadiumId: 'usa_meadowlands_bowl' },
    { city: 'Los Angeles', country: 'USA', stadium: 'Pasadena Arroyo Bowl', capacity: 88565, stadiumId: 'usa_meadowlands_bowl' },
    { city: 'Panama City', country: 'Panama', stadium: 'Estadio Istmo Olímpico', capacity: 35000, stadiumId: 'conmebol_pacific_andes_oval' },
  ],

  // CONCACAF Central American Cup
  CONCACAF_CAC: [
    { city: 'San José', country: 'Costa Rica', stadium: 'Estadio Sabana Nacional', capacity: 35100, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Panama City', country: 'Panama', stadium: 'Estadio Istmo Olímpico', capacity: 32000, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Tegucigalpa', country: 'Honduras', stadium: 'Estadio Nacional del Istmo', capacity: 35000, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Guatemala City', country: 'Guatemala', stadium: 'Estadio Mateo Olímpico', capacity: 26000, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'San Salvador', country: 'El Salvador', stadium: 'Estadio Coloso de Cuscatlán', capacity: 44836, stadiumId: 'conmebol_pacific_andes_oval' },
    { city: 'Alajuela', country: 'Costa Rica', stadium: 'Estadio Catedral Rojinegra', capacity: 22000, stadiumId: 'conmebol_pacific_andes_oval' },
  ],

  // AFC Champions League — 10 venues
  AFC_CL: [
    { city: 'Riyadh', country: 'Saudi Arabia', stadium: 'Pearl of Najd Arena', capacity: 68752, stadiumId: 'ksa_kingdom_pearl' },
    { city: 'Tokyo', country: 'Japan', stadium: 'Musashino Olympic Stadium', capacity: 68000, stadiumId: 'afc_modern_world_arena' },
    { city: 'Doha', country: 'Qatar', stadium: 'Crescent Bay Iconic Arena', capacity: 80000, stadiumId: 'ksa_kingdom_pearl' },
    { city: 'Seoul', country: 'South Korea', stadium: 'Han River World Arena', capacity: 66704, stadiumId: 'afc_modern_world_arena' },
    { city: 'Abu Dhabi', country: 'UAE', stadium: 'Emirates Dunes Olympic Arena', capacity: 45000, stadiumId: 'ksa_kingdom_pearl' },
    { city: 'Tehran', country: 'Iran', stadium: 'Alborz Grand Bowl', capacity: 78116, stadiumId: 'afc_modern_world_arena' },
    { city: 'Shanghai', country: 'China', stadium: 'Pudong Crescent Arena', capacity: 54856, stadiumId: 'afc_modern_world_arena' },
    { city: 'Jeddah', country: 'Saudi Arabia', stadium: 'Red Sea Shining Jewel Arena', capacity: 62345, stadiumId: 'ksa_kingdom_pearl' },
    { city: 'Sydney', country: 'Australia', stadium: 'Harbour Olympic Stadium', capacity: 82500, stadiumId: 'afc_modern_world_arena' },
    { city: 'Osaka', country: 'Japan', stadium: 'Kansai Bay Bowl', capacity: 45000, stadiumId: 'afc_modern_world_arena' },
  ],

  // AFC Cup — 8 venues
  AFC_CUP: [
    { city: 'Kuala Lumpur', country: 'Malaysia', stadium: 'Malacca Straits National Arena', capacity: 87411, stadiumId: 'afc_modern_world_arena' },
    { city: 'Amman', country: 'Jordan', stadium: 'Levantine Olympic Stadium', capacity: 25000, stadiumId: 'ksa_kingdom_pearl' },
    { city: 'Muscat', country: 'Oman', stadium: 'Arabian Sea Sports Complex', capacity: 34000, stadiumId: 'ksa_kingdom_pearl' },
    { city: 'Bangkok', country: 'Thailand', stadium: 'Chao Phraya National Arena', capacity: 51000, stadiumId: 'afc_modern_world_arena' },
    { city: 'Melbourne', country: 'Australia', stadium: 'Yarra Rectangular Arena', capacity: 30050, stadiumId: 'eur_modern_compact_arena' },
    { city: 'Jeddah', country: 'Saudi Arabia', stadium: 'Red Sea Shining Jewel Arena', capacity: 62345, stadiumId: 'ksa_kingdom_pearl' },
    { city: 'Busan', country: 'South Korea', stadium: 'Gyeongnam Asiad Bowl', capacity: 53769, stadiumId: 'afc_modern_world_arena' },
    { city: 'Yokohama', country: 'Japan', stadium: 'Kanagawa Bay International', capacity: 72327, stadiumId: 'afc_modern_world_arena' },
  ],

  // CAF Champions League — 10 venues
  CAF_CL: [
    { city: 'Cairo', country: 'Egypt', stadium: 'Nile International Olympic Stadium', capacity: 75000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Casablanca', country: 'Morocco', stadium: 'Atlantic Grand Bowl', capacity: 67000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Dakar', country: 'Senegal', stadium: 'Diamniadio Lions Arena', capacity: 50000, stadiumId: 'sen_diamniadio_arena' },
    { city: 'Tunis', country: 'Tunisia', stadium: 'Carthage Olympic Arena', capacity: 60000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Algiers', country: 'Algeria', stadium: 'Algiers Mediterranean Olympic Bowl', capacity: 64000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Alexandria', country: 'Egypt', stadium: 'Delta Coast Olympic Bowl', capacity: 80000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Rabat', country: 'Morocco', stadium: 'Bou Regreg National Arena', capacity: 53000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Johannesburg', country: 'South Africa', stadium: 'Highveld Calabash Bowl', capacity: 90000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Abidjan', country: 'Ivory Coast', stadium: 'Ebrié Lagoon National Arena', capacity: 60000, stadiumId: 'sen_diamniadio_arena' },
    { city: 'Marrakech', country: 'Morocco', stadium: 'Atlas Foothills Bowl', capacity: 45240, stadiumId: 'caf_north_olympic_bowl' },
  ],

  // CAF Confederation Cup — 8 venues
  CAF_CONFED_CUP: [
    { city: 'Abidjan', country: 'Ivory Coast', stadium: 'Ebrié Lagoon National Arena', capacity: 60000, stadiumId: 'sen_diamniadio_arena' },
    { city: 'Dakar', country: 'Senegal', stadium: 'Diamniadio Lions Arena', capacity: 50000, stadiumId: 'sen_diamniadio_arena' },
    { city: 'Tangier', country: 'Morocco', stadium: 'Strait Grand Bowl', capacity: 65000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Cairo', country: 'Egypt', stadium: 'Nile International Olympic Stadium', capacity: 75000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Oran', country: 'Algeria', stadium: 'Western Mediterranean Arena', capacity: 40143, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Sousse', country: 'Tunisia', stadium: 'Sahel Olympic Arena', capacity: 40000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Fez', country: 'Morocco', stadium: 'Merinid Complex Bowl', capacity: 45000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Algiers', country: 'Algeria', stadium: 'Algiers Mediterranean Olympic Bowl', capacity: 64000, stadiumId: 'caf_north_olympic_bowl' },
  ],

  // CAF Super Cup
  CAF_SC: [
    { city: 'Cairo', country: 'Egypt', stadium: 'Nile International Olympic Stadium', capacity: 75000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Casablanca', country: 'Morocco', stadium: 'Atlantic Grand Bowl', capacity: 67000, stadiumId: 'caf_north_olympic_bowl' },
    { city: 'Dakar', country: 'Senegal', stadium: 'Diamniadio Lions Arena', capacity: 50000, stadiumId: 'sen_diamniadio_arena' },
    { city: 'Riyadh', country: 'Saudi Arabia', stadium: 'Pearl of Najd Arena', capacity: 68752, stadiumId: 'ksa_kingdom_pearl' },
  ],

  // OFC Champions League — Features Oceania Floating Marina & New Zealand National Arena
  OFC_CL: [
    { city: 'Auckland', country: 'New Zealand', stadium: 'Waitemata Harbour Stadium', capacity: 50000, stadiumId: 'nzl_waitemata_harbour' },
    { city: 'Pacific Marina', country: 'Oceania', stadium: 'Oceania Floating Marina Arena', capacity: 42000, stadiumId: 'floating_marina_arena' },
    { city: 'Wellington', country: 'New Zealand', stadium: 'Cook Strait Waterfront Bowl', capacity: 34500, stadiumId: 'nzl_waitemata_harbour' },
    { city: 'Suva', country: 'Fiji', stadium: 'Coral Harbour Stadium', capacity: 18000, stadiumId: 'floating_marina_arena' },
  ],
};

/**
 * Deterministically selects and locks the final venue for the given competition and seasonYear.
 * Since the rule states the venue is chosen one season before the final and then locked,
 * using a hash of the competition ID and season year produces a consistent, stable selection.
 */
export function getContinentalFinalVenue(
  competitionId: ContinentalCompetitionId | string,
  seasonYear: number
): ContinentalFinalVenue {
  const pool = CONTINENTAL_FINAL_VENUE_POOLS[competitionId as ContinentalCompetitionId] ||
    CONTINENTAL_FINAL_VENUE_POOLS.UEFA_CL;

  // Calculate stable hash
  let hash = 0;
  const str = `${competitionId}_${seasonYear}_continental_venue_lock`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

/**
 * Returns the final venue that has been locked for the upcoming season (N + 1).
 */
export function getNextSeasonContinentalFinalVenue(
  competitionId: ContinentalCompetitionId | string,
  currentSeasonYear: number
): ContinentalFinalVenue {
  return getContinentalFinalVenue(competitionId, currentSeasonYear + 1);
}

/**
 * Localized city translations for natural phrasing in titles & dynamic FINAL banners.
 */
const LOCALIZED_CITIES: Record<string, Record<LanguageCode, string>> = {
  London: { 'en-GB': 'London', 'es-ES': 'Londres', 'es-AR': 'Londres', 'pt-BR': 'Londres', 'fr-FR': 'Londres' },
  Paris: { 'en-GB': 'Paris', 'es-ES': 'París', 'es-AR': 'París', 'pt-BR': 'Paris', 'fr-FR': 'Paris' },
  Munich: { 'en-GB': 'Munich', 'es-ES': 'Múnich', 'es-AR': 'Múnich', 'pt-BR': 'Munique', 'fr-FR': 'Munich' },
  Rome: { 'en-GB': 'Rome', 'es-ES': 'Roma', 'es-AR': 'Roma', 'pt-BR': 'Roma', 'fr-FR': 'Rome' },
  Lisbon: { 'en-GB': 'Lisbon', 'es-ES': 'Lisboa', 'es-AR': 'Lisboa', 'pt-BR': 'Lisboa', 'fr-FR': 'Lisbonne' },
  Budapest: { 'en-GB': 'Budapest', 'es-ES': 'Budapest', 'es-AR': 'Budapest', 'pt-BR': 'Budapeste', 'fr-FR': 'Budapest' },
  Berlin: { 'en-GB': 'Berlin', 'es-ES': 'Berlín', 'es-AR': 'Berlín', 'pt-BR': 'Berlim', 'fr-FR': 'Berlin' },
  Istanbul: { 'en-GB': 'Istanbul', 'es-ES': 'Estambul', 'es-AR': 'Estambul', 'pt-BR': 'Istambul', 'fr-FR': 'Istanbul' },
  Glasgow: { 'en-GB': 'Glasgow', 'es-ES': 'Glasgow', 'es-AR': 'Glasgow', 'pt-BR': 'Glasgow', 'fr-FR': 'Glasgow' },
  Madrid: { 'en-GB': 'Madrid', 'es-ES': 'Madrid', 'es-AR': 'Madrid', 'pt-BR': 'Madri', 'fr-FR': 'Madrid' },
  Milan: { 'en-GB': 'Milan', 'es-ES': 'Milán', 'es-AR': 'Milán', 'pt-BR': 'Milão', 'fr-FR': 'Milan' },
  Amsterdam: { 'en-GB': 'Amsterdam', 'es-ES': 'Ámsterdam', 'es-AR': 'Ámsterdam', 'pt-BR': 'Amsterdã', 'fr-FR': 'Amsterdam' },
  Turin: { 'en-GB': 'Turin', 'es-ES': 'Turín', 'es-AR': 'Turín', 'pt-BR': 'Turim', 'fr-FR': 'Turin' },
  Lyon: { 'en-GB': 'Lyon', 'es-ES': 'Lyon', 'es-AR': 'Lyon', 'pt-BR': 'Lyon', 'fr-FR': 'Lyon' },
  Bilbao: { 'en-GB': 'Bilbao', 'es-ES': 'Bilbao', 'es-AR': 'Bilbao', 'pt-BR': 'Bilbau', 'fr-FR': 'Bilbao' },
  Athens: { 'en-GB': 'Athens', 'es-ES': 'Atenas', 'es-AR': 'Atenas', 'pt-BR': 'Atenas', 'fr-FR': 'Athènes' },
  Cardiff: { 'en-GB': 'Cardiff', 'es-ES': 'Cardiff', 'es-AR': 'Cardiff', 'pt-BR': 'Cardiff', 'fr-FR': 'Cardiff' },
  Dublin: { 'en-GB': 'Dublin', 'es-ES': 'Dublín', 'es-AR': 'Dublín', 'pt-BR': 'Dublin', 'fr-FR': 'Dublin' },
  Seville: { 'en-GB': 'Seville', 'es-ES': 'Sevilla', 'es-AR': 'Sevilla', 'pt-BR': 'Sevilha', 'fr-FR': 'Séville' },
  Warsaw: { 'en-GB': 'Warsaw', 'es-ES': 'Varsovia', 'es-AR': 'Varsovia', 'pt-BR': 'Varsóvia', 'fr-FR': 'Varsovie' },
  Prague: { 'en-GB': 'Prague', 'es-ES': 'Praga', 'es-AR': 'Praga', 'pt-BR': 'Praga', 'fr-FR': 'Prague' },
  Vienna: { 'en-GB': 'Vienna', 'es-ES': 'Viena', 'es-AR': 'Viena', 'pt-BR': 'Viena', 'fr-FR': 'Vienne' },
  Cairo: { 'en-GB': 'Cairo', 'es-ES': 'El Cairo', 'es-AR': 'El Cairo', 'pt-BR': 'Cairo', 'fr-FR': 'Le Caire' },
  Riyadh: { 'en-GB': 'Riyadh', 'es-ES': 'Riad', 'es-AR': 'Riad', 'pt-BR': 'Riad', 'fr-FR': 'Riyad' },
  'New York': { 'en-GB': 'New York', 'es-ES': 'Nueva York', 'es-AR': 'Nueva York', 'pt-BR': 'Nova York', 'fr-FR': 'New York' },
  'Mexico City': { 'en-GB': 'Mexico City', 'es-ES': 'Ciudad de México', 'es-AR': 'Ciudad de México', 'pt-BR': 'Cidade do México', 'fr-FR': 'Mexico' },
  Tokyo: { 'en-GB': 'Tokyo', 'es-ES': 'Tokio', 'es-AR': 'Tokio', 'pt-BR': 'Tóquio', 'fr-FR': 'Tokyo' },
  Seoul: { 'en-GB': 'Seoul', 'es-ES': 'Seúl', 'es-AR': 'Seúl', 'pt-BR': 'Seul', 'fr-FR': 'Séoul' },
  Sydney: { 'en-GB': 'Sydney', 'es-ES': 'Sídney', 'es-AR': 'Sídney', 'pt-BR': 'Sydney', 'fr-FR': 'Sydney' },
  'Rio de Janeiro': { 'en-GB': 'Rio de Janeiro', 'es-ES': 'Río de Janeiro', 'es-AR': 'Río de Janeiro', 'pt-BR': 'Rio de Janeiro', 'fr-FR': 'Rio de Janeiro' },
  'Buenos Aires': { 'en-GB': 'Buenos Aires', 'es-ES': 'Buenos Aires', 'es-AR': 'Buenos Aires', 'pt-BR': 'Buenos Aires', 'fr-FR': 'Buenos Aires' },
  'São Paulo': { 'en-GB': 'São Paulo', 'es-ES': 'São Paulo', 'es-AR': 'São Paulo', 'pt-BR': 'São Paulo', 'fr-FR': 'São Paulo' },
  Auckland: { 'en-GB': 'Auckland', 'es-ES': 'Auckland', 'es-AR': 'Auckland', 'pt-BR': 'Auckland', 'fr-FR': 'Auckland' },
};

export function getLocalizedCity(city: string, lang: LanguageCode): string {
  if (LOCALIZED_CITIES[city] && LOCALIZED_CITIES[city][lang]) {
    return LOCALIZED_CITIES[city][lang];
  }
  return city;
}

export interface LegendaryFinalAnalysisParams {
  city: string;
  isWon: boolean;
  teamConsecutiveWins: number; // e.g. 1, 2, 3, 4, 5+
  playerTotalWins: number;      // e.g. 1, 2, 3, 4, 5+
  trailedByTwoOrMore?: boolean; // Trailed by 2+ goals at any point before winning
  playerGoals?: number;
  playerAssists?: number;
  playerRating?: number;
  isMvp?: boolean;
  finalGoalDiff?: number;       // Math.abs(homeScore - awayScore)
  redCardsCount?: number;       // Red cards in the match
  wonOnPenalties?: boolean;
  wonInExtraTime?: boolean;
  lastMinuteWinner?: boolean;   // Winning goal scored in 88'+ or stoppage time
  isGoalkeeperMasterclass?: boolean; // GK MVP or 8+ saves / clean sheet under heavy attack
  isHistoricUnderdogVictory?: boolean; // Team with significantly lower OVR won
  language?: LanguageCode;
}

/**
 * 3. LEGENDARY FINAL NAME SYSTEM + PRIORITY RESOLUTION
 *
 * Evaluates the final match outcome and returns the legendary title if earned.
 * Priority Order:
 * 1. Team Consecutive Trophy Legends (2nd, 3rd, 4th, 5th+ in a row)
 * 2. Player Trophy Legends (2nd, 3rd, 4th, 5th+ career wins)
 * 3. The Miracle of [City] (Comeback from 2+ goals down)
 * 4. Other Major Match-Event Legends (Masterpiece, Hero, Battle, Stoppage-Time, Extra-Time, Shootout, Wall, Fairytale, Glory)
 * 5. No Legendary Title (Normal headline)
 */
export function calculateLegendaryFinalTitle(params: LegendaryFinalAnalysisParams): {
  title: string | null;
  priorityCategory: 'DYNASTY' | 'PLAYER_CROWNS' | 'MIRACLE' | 'MATCH_EVENT' | 'NONE';
  description: string | null;
} {
  if (!params.isWon) {
    return { title: null, priorityCategory: 'NONE', description: null };
  }

  const lang = params.language || getStoredLanguage();
  const city = getLocalizedCity(params.city, lang);

  // Helper for preposition handling: in Spanish/French/Portuguese, "de" / "d'" / "do"
  const formatCityTitle = (templates: Record<LanguageCode, (c: string) => string>): string => {
    const fn = templates[lang] || templates['en-GB'];
    return fn(city);
  };

  // =========================================================================
  // PRIORITY 1 — DYNASTY / CONSECUTIVE TROPHY LEGENDS (Winning Team)
  // =========================================================================
  if (params.teamConsecutiveWins >= 2) {
    const streak = params.teamConsecutiveWins;

    if (streak === 2) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Reign of ${c}`,
        'es-ES': (c) => `El Reinado de ${c}`,
        'es-AR': (c) => `El Reinado de ${c}`,
        'pt-BR': (c) => `O Reinado de ${c}`,
        'fr-FR': (c) => `Le Règne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `Back-to-back continental supremacy crowned in ${city}!`,
      };
    } else if (streak === 3) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Dynasty of ${c}`,
        'es-ES': (c) => `La Dinastía de ${c}`,
        'es-AR': (c) => `La Dinastía de ${c}`,
        'pt-BR': (c) => `A Dinastia de ${c}`,
        'fr-FR': (c) => `La Dynastie de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `A legendary continental three-peat established forever in ${city}!`,
      };
    } else if (streak === 4) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Empire of ${c}`,
        'es-ES': (c) => `El Imperio de ${c}`,
        'es-AR': (c) => `El Imperio de ${c}`,
        'pt-BR': (c) => `O Império de ${c}`,
        'fr-FR': (c) => `L'Empire de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `A four-in-a-row football empire cemented in ${city}!`,
      };
    } else if (streak === 5) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Golden Era of ${c}`,
        'es-ES': (c) => `La Era Dorada de ${c}`,
        'es-AR': (c) => `La Era Dorada de ${c}`,
        'pt-BR': (c) => `A Era Dourada de ${c}`,
        'fr-FR': (c) => `L'Ère Dorée de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `Five consecutive continental crowns write the greatest era in football history!`,
      };
    } else if (streak === 6) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Immortals of ${c}`,
        'es-ES': (c) => `Los Inmortales de ${c}`,
        'es-AR': (c) => `Los Inmortales de ${c}`,
        'pt-BR': (c) => `Os Imortais de ${c}`,
        'fr-FR': (c) => `Les Immortels de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `Six consecutive triumphs ascend into pure immortality in ${city}!`,
      };
    } else if (streak === 7) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Unbreakable of ${c}`,
        'es-ES': (c) => `Los Invencibles de ${c}`,
        'es-AR': (c) => `Los Indestructibles de ${c}`,
        'pt-BR': (c) => `Os Invencíveis de ${c}`,
        'fr-FR': (c) => `Les Invincibles de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `Seven straight continental championships — an unbreakable empire!`,
      };
    } else {
      // 8+ in a row
      const title = formatCityTitle({
        'en-GB': (c) => `The Eternal Champions of ${c}`,
        'es-ES': (c) => `Los Campeones Eternos de ${c}`,
        'es-AR': (c) => `Los Campeones Eternos de ${c}`,
        'pt-BR': (c) => `Os Campeões Eternos de ${c}`,
        'fr-FR': (c) => `Les Champions Éternels de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `${streak} consecutive triumphs — the undisputed eternal sovereigns of world football!`,
      };
    }
  }

  // =========================================================================
  // PRIORITY 2 — PLAYER PERSONAL TROPHY LEGENDS
  // =========================================================================
  if (params.playerTotalWins >= 2) {
    const wins = params.playerTotalWins;

    if (wins === 2) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Second Crown of ${c}`,
        'es-ES': (c) => `La Segunda Corona de ${c}`,
        'es-AR': (c) => `La Segunda Corona de ${c}`,
        'pt-BR': (c) => `A Segunda Coroa de ${c}`,
        'fr-FR': (c) => `La Deuxième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `Lifting the continental trophy for the 2nd time in career history!`,
      };
    } else if (wins === 3) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Three Crowns of ${c}`,
        'es-ES': (c) => `Las Tres Coronas de ${c}`,
        'es-AR': (c) => `Las Tres Coronas de ${c}`,
        'pt-BR': (c) => `As Três Coroas de ${c}`,
        'fr-FR': (c) => `Les Trois Couronnes de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `A historic 3rd personal continental crown earned in ${city}!`,
      };
    } else if (wins === 4) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Fourth Crown of ${c}`,
        'es-ES': (c) => `La Cuarta Corona de ${c}`,
        'es-AR': (c) => `La Cuarta Corona de ${c}`,
        'pt-BR': (c) => `A Quarta Coroa de ${c}`,
        'fr-FR': (c) => `La Quatrième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `A 4th career continental winner medal secured in ${city}!`,
      };
    } else if (wins === 5) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Fifth Crown of ${c}`,
        'es-ES': (c) => `La Quinta Corona de ${c}`,
        'es-AR': (c) => `La Quinta Corona de ${c}`,
        'pt-BR': (c) => `A Quinta Coroa de ${c}`,
        'fr-FR': (c) => `La Cinquième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `Five-time continental king crowned under the floodlights of ${city}!`,
      };
    } else if (wins === 6) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Sixth Crown of ${c}`,
        'es-ES': (c) => `La Sexta Corona de ${c}`,
        'es-AR': (c) => `La Sexta Corona de ${c}`,
        'pt-BR': (c) => `A Sexta Coroa de ${c}`,
        'fr-FR': (c) => `La Sixième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `Six continental trophies — matching the greatest individual champions of all time!`,
      };
    } else if (wins === 7) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Seventh Crown of ${c}`,
        'es-ES': (c) => `La Séptima Corona de ${c}`,
        'es-AR': (c) => `La Séptima Corona de ${c}`,
        'pt-BR': (c) => `A Sétima Coroa de ${c}`,
        'fr-FR': (c) => `La Septième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `The legendary Hepta! Seven career continental crowns!`,
      };
    } else {
      const title = formatCityTitle({
        'en-GB': (c) => `The Immortal Crown of ${c}`,
        'es-ES': (c) => `La Corona Inmortal de ${c}`,
        'es-AR': (c) => `La Corona Inmortal de ${c}`,
        'pt-BR': (c) => `A Coroa Imortal de ${c}`,
        'fr-FR': (c) => `La Couronne Immortelle de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `${wins} career continental titles — an untouchable record in world football!`,
      };
    }
  }

  // =========================================================================
  // PRIORITY 3 — THE MIRACLE OF [CITY] (Comeback from 2+ goals down)
  // =========================================================================
  if (params.trailedByTwoOrMore) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Miracle of ${c}`,
      'es-ES': (c) => `El Milagro de ${c}`,
      'es-AR': (c) => `El Milagro de ${c}`,
      'pt-BR': (c) => `O Milagre de ${c}`,
      'fr-FR': (c) => `Le Miracle de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MIRACLE',
      description: `An impossible comeback from 2+ goals down to steal continental glory!`,
    };
  }

  // =========================================================================
  // PRIORITY 4 — OTHER MAJOR MATCH-EVENT LEGENDS
  // =========================================================================

  // Hat-trick (3+ goals scored in final)
  if ((params.playerGoals || 0) >= 3) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Masterpiece of ${c}`,
      'es-ES': (c) => `La Obra Maestra de ${c}`,
      'es-AR': (c) => `La Obra Maestra de ${c}`,
      'pt-BR': (c) => `A Obra-Prima de ${c}`,
      'fr-FR': (c) => `Le Chef-d'œuvre de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A breathtaking hat-trick masterclass in the continental showpiece!`,
    };
  }

  // The Hero: Player scored 2+ goals and was MVP / decisive
  if ((params.playerGoals || 0) >= 2 && params.isMvp) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Hero of ${c}`,
      'es-ES': (c) => `El Héroe de ${c}`,
      'es-AR': (c) => `El Héroe de ${c}`,
      'pt-BR': (c) => `O Herói de ${c}`,
      'fr-FR': (c) => `Le Héros de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A decisive brace that carried the squad to continental glory!`,
    };
  }

  // The Battle: 2+ players received red cards during the final
  if ((params.redCardsCount || 0) >= 2) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Battle of ${c}`,
      'es-ES': (c) => `La Batalla de ${c}`,
      'es-AR': (c) => `La Batalla de ${c}`,
      'pt-BR': (c) => `A Batalha de ${c}`,
      'fr-FR': (c) => `La Bataille de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A fiercely contested final filled with cards, tension, and raw grit!`,
    };
  }

  // Stoppage-time / Last-minute winner
  if (params.lastMinuteWinner) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Stoppage-Time Triumph of ${c}`,
      'es-ES': (c) => `El Triunfo en el Descuento de ${c}`,
      'es-AR': (c) => `El Triunfo en el Descuento de ${c}`,
      'pt-BR': (c) => `O Triunfo nos Acréscimos de ${c}`,
      'fr-FR': (c) => `Le Triomphe dans le Temps Additionnel de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A dramatic last-gasp winner in the dying moments of the final!`,
    };
  }

  // Extra-time epic (120 minutes)
  if (params.wonInExtraTime) {
    const title = formatCityTitle({
      'en-GB': (c) => `The 120-Minute Epic of ${c}`,
      'es-ES': (c) => `La Epopeya de 120 Minutos de ${c}`,
      'es-AR': (c) => `La Épica de 120 Minutos de ${c}`,
      'pt-BR': (c) => `A Épica de 120 Minutos de ${c}`,
      'fr-FR': (c) => `L'Épopée de 120 Minutes de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `An exhausting, heroic 120-minute battle won in extra time!`,
    };
  }

  // Penalty Shootout drama
  if (params.wonOnPenalties) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Shootout of ${c}`,
      'es-ES': (c) => `Los Penales de ${c}`,
      'es-AR': (c) => `Los Penales de ${c}`,
      'pt-BR': (c) => `A Disputa de ${c}`,
      'fr-FR': (c) => `La Séance de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `Nerves of steel in a high-stakes penalty shootout drama!`,
    };
  }

  // Goalkeeper Masterclass
  if (params.isGoalkeeperMasterclass) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Wall of ${c}`,
      'es-ES': (c) => `El Muro de ${c}`,
      'es-AR': (c) => `El Muro de ${c}`,
      'pt-BR': (c) => `A Muralha de ${c}`,
      'fr-FR': (c) => `Le Mur de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `An impenetrable goalkeeping clinic that denied every opposing assault!`,
    };
  }

  // Historic Underdog Upset / Fairytale
  if (params.isHistoricUnderdogVictory) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Fairytale of ${c}`,
      'es-ES': (c) => `El Cuento de Hadas de ${c}`,
      'es-AR': (c) => `La Hazaña Soñada de ${c}`,
      'pt-BR': (c) => `O Conto de Fadas de ${c}`,
      'fr-FR': (c) => `Le Conte de Fées de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A sensational underdog story shocking the continental giants!`,
    };
  }

  // The Glory of [City]: Decisive win by 2+ goals
  if ((params.finalGoalDiff || 0) >= 2) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Glory of ${c}`,
      'es-ES': (c) => `La Gloria de ${c}`,
      'es-AR': (c) => `La Gloria de ${c}`,
      'pt-BR': (c) => `A Glória de ${c}`,
      'fr-FR': (c) => `La Gloire de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A commanding victory by two or more goals in ${city}!`,
    };
  }

  // =========================================================================
  // PRIORITY 5 — NO LEGENDARY TITLE (Normal headline)
  // =========================================================================
  return { title: null, priorityCategory: 'NONE', description: null };
}
