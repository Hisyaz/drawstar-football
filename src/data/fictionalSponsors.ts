import { TeamSponsor } from '../gameplay/types/team';
import { EditorTeamData } from '../types/leagueEditor';

export type EquipmentSponsorId =
  | 'electrik'
  | 'tapitas'
  | 'leone'
  | 'low_systems'
  | 'generic';

export interface EquipmentSponsorMeta {
  id: EquipmentSponsorId;
  label: string;
  shortTag: string;
  tierNote: string;
}

export const EQUIPMENT_SPONSORS: EquipmentSponsorMeta[] = [
  { id: 'electrik', label: 'Electrik', shortTag: 'ELK', tierNote: 'Global Tier 1 Apparel Giant' },
  { id: 'tapitas', label: 'Tapitas', shortTag: 'TPT', tierNote: 'Global Tier 1 Sportswear Giant' },
  { id: 'leone', label: 'Leone', shortTag: 'LEO', tierNote: 'Heritage Technical Outfitter' },
  { id: 'low_systems', label: 'Low Systems', shortTag: 'LOW', tierNote: 'Emerging Tech Apparel Brand' },
  { id: 'generic', label: 'Generic (No Brand)', shortTag: 'NONE', tierNote: 'Unbranded / In-House Kit' },
];

export const EQUIPMENT_SPONSOR_LABELS: Record<EquipmentSponsorId, string> = {
  electrik: 'Electrik',
  tapitas: 'Tapitas',
  leone: 'Leone',
  low_systems: 'Low Systems',
  generic: 'Generic (No Brand)',
};

export interface FictionalBrandDefinition {
  id: string;
  name: string;
  colors: [string, string, string]; // [background, text, accent]
  industry: string;
  scope: 'international' | 'national';
  countryCode?: string;
}

/**
 * 10 Strictly Fictional International Commercial Brands
 */
export const INTERNATIONAL_COMMERCIAL_BRANDS: FictionalBrandDefinition[] = [
  {
    id: 'intl_aerovan',
    name: 'AEROVAN',
    colors: ['#0c4a6e', '#ffffff', '#38bdf8'],
    industry: 'Global Aviation',
    scope: 'international',
  },
  {
    id: 'intl_nexora',
    name: 'NEXORA TEL',
    colors: ['#1e1b4b', '#ffffff', '#818cf8'],
    industry: 'Telecom Networks',
    scope: 'international',
  },
  {
    id: 'intl_vortex_ev',
    name: 'VORTEX EV',
    colors: ['#090d16', '#34d399', '#10b981'],
    industry: 'Electric Mobility',
    scope: 'international',
  },
  {
    id: 'intl_solarion',
    name: 'SOLARION',
    colors: ['#7c2d12', '#fef08a', '#f59e0b'],
    industry: 'Clean Energy',
    scope: 'international',
  },
  {
    id: 'intl_finapex',
    name: 'FINAPEX',
    colors: ['#0f172a', '#f8fafc', '#fbbf24'],
    industry: 'Global Finance',
    scope: 'international',
  },
  {
    id: 'intl_kronos_cargo',
    name: 'KRONOS CARGO',
    colors: ['#14532d', '#ffffff', '#4ade80'],
    industry: 'Freight & Shipping',
    scope: 'international',
  },
  {
    id: 'intl_orbita_cloud',
    name: 'ORBITA CLOUD',
    colors: ['#312e81', '#e0e7ff', '#22d3ee'],
    industry: 'Cloud Computing',
    scope: 'international',
  },
  {
    id: 'intl_zenith_pay',
    name: 'ZENITH PAY',
    colors: ['#4c1d95', '#ffffff', '#c084fc'],
    industry: 'Digital Payments',
    scope: 'international',
  },
  {
    id: 'intl_hydra_sport',
    name: 'HYDRA BLAST',
    colors: ['#164e63', '#ecfeff', '#06b6d4'],
    industry: 'Sports Hydration',
    scope: 'international',
  },
  {
    id: 'intl_meridian_bank',
    name: 'MERIDIAN BANK',
    colors: ['#7f1d1d', '#ffffff', '#f87171'],
    industry: 'Commercial Banking',
    scope: 'international',
  },
];

/**
 * 3 Strictly Fictional National Brands Per Country (covering all league countries + international fallbacks)
 */
export const NATIONAL_COMMERCIAL_BRANDS_BY_COUNTRY: Record<string, FictionalBrandDefinition[]> = {
  ENG: [
    {
      id: 'eng_albion_rail',
      name: 'ALBION RAIL',
      colors: ['#1e3a8a', '#ffffff', '#ef4444'],
      industry: 'National Rail',
      scope: 'national',
      countryCode: 'ENG',
    },
    {
      id: 'eng_thames_mutual',
      name: 'THAMES MUTUAL',
      colors: ['#064e3b', '#ffffff', '#34d399'],
      industry: 'Building Society',
      scope: 'national',
      countryCode: 'ENG',
    },
    {
      id: 'eng_crown_fibre',
      name: 'CROWN FIBRE',
      colors: ['#3b0764', '#faf5ff', '#a855f7'],
      industry: 'Broadband',
      scope: 'national',
      countryCode: 'ENG',
    },
  ],
  ESP: [
    {
      id: 'esp_ibergrid',
      name: 'IBERGRID',
      colors: ['#991b1b', '#fef08a', '#f59e0b'],
      industry: 'Power Utility',
      scope: 'national',
      countryCode: 'ESP',
    },
    {
      id: 'esp_sol_banca',
      name: 'SOL BANCA',
      colors: ['#7c2d12', '#ffffff', '#fb923c'],
      industry: 'Retail Banking',
      scope: 'national',
      countryCode: 'ESP',
    },
    {
      id: 'esp_costa_red',
      name: 'COSTA RED',
      colors: ['#0f172a', '#f8fafc', '#ef4444'],
      industry: 'Telecom Iberia',
      scope: 'national',
      countryCode: 'ESP',
    },
  ],
  ITA: [
    {
      id: 'ita_bella_rete',
      name: 'BELLA RETE',
      colors: ['#0369a1', '#ffffff', '#38bdf8'],
      industry: 'Telecom Italia',
      scope: 'national',
      countryCode: 'ITA',
    },
    {
      id: 'ita_valle_credito',
      name: 'VALLE CREDITO',
      colors: ['#14532d', '#ffffff', '#ef4444'],
      industry: 'Regional Banking',
      scope: 'national',
      countryCode: 'ITA',
    },
    {
      id: 'ita_modena_motor',
      name: 'MODENA DRIVE',
      colors: ['#7f1d1d', '#fef9c3', '#facc15'],
      industry: 'Automotive',
      scope: 'national',
      countryCode: 'ITA',
    },
  ],
  GER: [
    {
      id: 'ger_rheinwerk',
      name: 'RHEINWERK',
      colors: ['#18181b', '#facc15', '#ef4444'],
      industry: 'Industrial Engineering',
      scope: 'national',
      countryCode: 'GER',
    },
    {
      id: 'ger_nordstrom',
      name: 'NORDSTROM AG',
      colors: ['#0c4a6e', '#ffffff', '#38bdf8'],
      industry: 'Grid & Energy',
      scope: 'national',
      countryCode: 'GER',
    },
    {
      id: 'ger_bayern_kredit',
      name: 'KRONEN KREDIT',
      colors: ['#1e293b', '#f8fafc', '#eab308'],
      industry: 'Consumer Finance',
      scope: 'national',
      countryCode: 'GER',
    },
  ],
  FR: [
    {
      id: 'fr_lumiere_tel',
      name: 'LUMIÈRE TEL',
      colors: ['#1e3a8a', '#ffffff', '#f43f5e'],
      industry: 'Fiber & Mobile',
      scope: 'national',
      countryCode: 'FR',
    },
    {
      id: 'fr_hexabank',
      name: 'HEXABANQUE',
      colors: ['#0f172a', '#ffffff', '#60a5fa'],
      industry: 'National Banking',
      scope: 'national',
      countryCode: 'FR',
    },
    {
      id: 'fr_azur_voyage',
      name: 'AZUR EXPRESS',
      colors: ['#1d4ed8', '#fef08a', '#facc15'],
      industry: 'High-Speed Transit',
      scope: 'national',
      countryCode: 'FR',
    },
  ],
  ARG: [
    {
      id: 'arg_pampa_gas',
      name: 'PAMPA GAS',
      colors: ['#0369a1', '#ffffff', '#facc15'],
      industry: 'Energy Distribution',
      scope: 'national',
      countryCode: 'ARG',
    },
    {
      id: 'arg_sur_pagos',
      name: 'SUR PAGOS',
      colors: ['#0f172a', '#38bdf8', '#ffffff'],
      industry: 'Digital Wallet',
      scope: 'national',
      countryCode: 'ARG',
    },
    {
      id: 'arg_mate_real',
      name: 'YERBA REAL',
      colors: ['#14532d', '#fef9c3', '#4ade80'],
      industry: 'Consumer Goods',
      scope: 'national',
      countryCode: 'ARG',
    },
  ],
  BRA: [
    {
      id: 'bra_verde_pix',
      name: 'VERDEPAY',
      colors: ['#14532d', '#fde047', '#22c55e'],
      industry: 'Instant Payments',
      scope: 'national',
      countryCode: 'BRA',
    },
    {
      id: 'bra_atlantico_tel',
      name: 'ATLÂNTICO TEL',
      colors: ['#1e3a8a', '#facc15', '#3b82f6'],
      industry: 'Telecom Brasil',
      scope: 'national',
      countryCode: 'BRA',
    },
    {
      id: 'bra_ouro_banco',
      name: 'BANCO DO SUL',
      colors: ['#713f12', '#fef08a', '#eab308'],
      industry: 'Commercial Bank',
      scope: 'national',
      countryCode: 'BRA',
    },
  ],
  POR: [
    {
      id: 'por_lusitania_net',
      name: 'LUSONET',
      colors: ['#7f1d1d', '#ffffff', '#22c55e'],
      industry: 'Fiber Telecom',
      scope: 'national',
      countryCode: 'POR',
    },
    {
      id: 'por_tejo_energia',
      name: 'TEJO ENERGIA',
      colors: ['#064e3b', '#fef08a', '#10b981'],
      industry: 'Renewables',
      scope: 'national',
      countryCode: 'POR',
    },
    {
      id: 'por_porto_credito',
      name: 'COSTA CRÉDITO',
      colors: ['#1e3a8a', '#ffffff', '#f59e0b'],
      industry: 'Retail Bank',
      scope: 'national',
      countryCode: 'POR',
    },
  ],
  KSA: [
    {
      id: 'ksa_oasis_air',
      name: 'OASIS WINGS',
      colors: ['#064e3b', '#fef08a', '#34d399'],
      industry: 'Regional Aviation',
      scope: 'national',
      countryCode: 'KSA',
    },
    {
      id: 'ksa_najd_holdings',
      name: 'NAJD HOLDINGS',
      colors: ['#0f172a', '#facc15', '#eab308'],
      industry: 'Infrastructure',
      scope: 'national',
      countryCode: 'KSA',
    },
    {
      id: 'ksa_red_dune_tel',
      name: 'DUNELINK TEL',
      colors: ['#14532d', '#ffffff', '#4ade80'],
      industry: '5G Networks',
      scope: 'national',
      countryCode: 'KSA',
    },
  ],
  DEFAULT: [
    {
      id: 'def_metro_tel',
      name: 'METRO TEL',
      colors: ['#1e293b', '#ffffff', '#38bdf8'],
      industry: 'Telecom',
      scope: 'national',
    },
    {
      id: 'def_civic_bank',
      name: 'CIVIC BANK',
      colors: ['#064e3b', '#ffffff', '#34d399'],
      industry: 'Banking',
      scope: 'national',
    },
    {
      id: 'def_terra_energy',
      name: 'TERRA GRID',
      colors: ['#7c2d12', '#fef08a', '#f59e0b'],
      industry: 'Utilities',
      scope: 'national',
    },
  ],
};

export function normalizeBrandCountryCode(countryCodeOrName?: string): string {
  const raw = (countryCodeOrName || '').trim().toUpperCase();
  if (!raw) return 'DEFAULT';
  if (raw === 'ENG' || raw === 'EN' || raw === 'UK' || raw === 'GB' || raw.includes('ENGLAND')) return 'ENG';
  if (raw === 'ESP' || raw === 'ES' || raw.includes('SPAIN')) return 'ESP';
  if (raw === 'ITA' || raw === 'IT' || raw.includes('ITALY')) return 'ITA';
  if (raw === 'GER' || raw === 'DE' || raw.includes('GERMANY')) return 'GER';
  if (raw === 'FR' || raw === 'FRA' || raw.includes('FRANCE')) return 'FR';
  if (raw === 'ARG' || raw === 'AR' || raw.includes('ARGENTINA')) return 'ARG';
  if (raw === 'BRA' || raw === 'BR' || raw.includes('BRAZIL')) return 'BRA';
  if (raw === 'POR' || raw === 'PT' || raw.includes('PORTUGAL')) return 'POR';
  if (raw === 'KSA' || raw === 'SAU' || raw === 'SA' || raw.includes('SAUDI')) return 'KSA';
  return 'DEFAULT';
}

export function getNationalBrandsForCountry(countryCodeOrName?: string): FictionalBrandDefinition[] {
  const key = normalizeBrandCountryCode(countryCodeOrName);
  return NATIONAL_COMMERCIAL_BRANDS_BY_COUNTRY[key] || NATIONAL_COMMERCIAL_BRANDS_BY_COUNTRY.DEFAULT;
}

export type ClubCommercialTier = 'big' | 'standard_d1' | 'small_or_d2';

export function inferDivisionTierFromTeam(
  team: Partial<EditorTeamData>,
  explicitDivisionTier?: string
): '1st' | '2nd' | 'youth' | 'state_only' {
  if (
    explicitDivisionTier === '1st' ||
    explicitDivisionTier === '2nd' ||
    explicitDivisionTier === 'youth' ||
    explicitDivisionTier === 'state_only'
  ) {
    return explicitDivisionTier;
  }
  const lid = (team.leagueId || '').toLowerCase();
  if (lid.includes('_youth') || team.id?.includes('_y_')) return 'youth';
  if (lid.includes('state_only') || team.isStateChampionshipsOnly) return 'state_only';
  if (lid.includes('_d2') || team.id?.includes('por2_')) return '2nd';
  return '1st';
}

export function classifyTeamCommercialTier(
  team: Partial<EditorTeamData>,
  explicitDivisionTier?: string
): ClubCommercialTier {
  const divTier = inferDivisionTierFromTeam(team, explicitDivisionTier);
  const rep = team.reputation ?? team.overallRating ?? team.ovr ?? 70;

  if (divTier === '2nd' || divTier === 'youth' || divTier === 'state_only') {
    return 'small_or_d2';
  }
  if (rep >= 80) {
    return 'big';
  }
  if (rep >= 74) {
    return 'standard_d1';
  }
  // Portugal & Saudi mid-table teams around 71-73 stay small_or_d2 for 2-3 national sponsors
  return 'small_or_d2';
}

export function stableTeamHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

/**
 * Generates 1 to 3 strictly fictional commercial sponsors for a team:
 * - Bigger clubs (`big`): 1 national + 2 international (3 sponsors)
 * - Standard D1 clubs (`standard_d1`): 1 national + 1 international (2 sponsors)
 * - Small D1 & 2nd division/youth clubs (`small_or_d2`): 2 national OR 3 national only
 */
export function getAssignedCommercialSponsorsForTeam(
  team: Partial<EditorTeamData> & { id?: string; name?: string; countryCode?: string; countryName?: string },
  explicitDivisionTier?: string
): TeamSponsor[] {
  const seedKey = `${team.id || ''}:${team.name || 'club'}`;
  const hash = stableTeamHash(seedKey);
  const tier = classifyTeamCommercialTier(team, explicitDivisionTier);
  const nationalPool = getNationalBrandsForCountry(team.countryCode || team.countryName);
  const intlPool = INTERNATIONAL_COMMERCIAL_BRANDS;

  const pickNat = (offset: number): TeamSponsor => {
    const b = nationalPool[(hash + offset) % nationalPool.length];
    return { id: b.id, name: b.name, colors: b.colors };
  };

  const pickIntl = (offset: number): TeamSponsor => {
    const b = intlPool[(hash + offset) % intlPool.length];
    return { id: b.id, name: b.name, colors: b.colors };
  };

  if (tier === 'big') {
    const intl1 = pickIntl(0);
    const intl2 = pickIntl(3);
    const nat1 = pickNat(0);
    // Avoid duplicates
    return [
      nat1,
      intl1,
      intl2.name === intl1.name ? pickIntl(5) : intl2,
    ];
  }

  if (tier === 'standard_d1') {
    return [pickNat(0), pickIntl(1)];
  }

  // small_or_d2: strictly national brands only (2 national or 3 national)
  const useThreeNationals = hash % 3 === 0;
  const n0 = pickNat(0);
  const n1 = pickNat(1);
  if (!useThreeNationals) {
    return [n0, n1];
  }
  const n2 = pickNat(2);
  return [n0, n1, n2];
}

// Explicit overrides to guarantee exact distribution across showcase big teams:
// - Most big clubs: Electrik or Tapitas
// - Fewer big teams: Leone
// - 1 or 2 big teams total: Low Systems
const BIG_CLUB_EQUIPMENT_OVERRIDES: Record<string, EquipmentSponsorId> = {
  // Low Systems (exactly 2 big clubs globally)
  ger_leverkusen: 'low_systems',
  eng_newcastle: 'low_systems',

  // Leone (fewer big teams)
  ita_napoli: 'leone',
  eng_astonvilla: 'leone',
  esp_realbetis: 'leone',
  arg_racing: 'leone',
  arg_estudiantes: 'leone',
  bra_botafogo: 'leone',
  bra_cruzeiro: 'leone',
  fr_monaco: 'leone',
  ger_frankfurt: 'leone',

  // Electrik vs Tapitas iconic pairings for major clubs
  eng_mancity: 'electrik',
  eng_chelsea: 'electrik',
  eng_tottenham: 'electrik',
  eng_liverpool: 'tapitas',
  eng_arsenal: 'tapitas',
  eng_manutd: 'tapitas',
  esp_barcelona: 'electrik',
  esp_atletico: 'electrik',
  esp_realmadrid: 'tapitas',
  ger_bayern: 'tapitas',
  ger_dortmund: 'electrik',
  ger_leipzig: 'tapitas',
  fr_psg: 'electrik',
  fr_marseille: 'tapitas',
  fr_lyon: 'tapitas',
  ita_inter: 'electrik',
  ita_juventus: 'tapitas',
  ita_milan: 'electrik',
  ita_roma: 'tapitas',
  arg_boca: 'tapitas',
  arg_river: 'electrik',
  bra_flamengo: 'tapitas',
  bra_palmeiras: 'electrik',
  bra_saopaulo: 'tapitas',
  bra_corinthians: 'electrik',
  por_benfica: 'tapitas',
  por_porto: 'electrik',
  por_sporting: 'tapitas',
  sau_alhilal: 'electrik',
  sau_alnassr: 'tapitas',
  sau_alittihad: 'electrik',
  sau_alahli: 'tapitas',
};

/**
 * Deterministic uniform / equipment sponsor assignment:
 * - Big clubs: Most split between Electrik & Tapitas, fewer have Leone, 1-2 big teams have Low Systems
 * - Smaller/mid D1 clubs: Mix of Electrik, Tapitas, Leone, a few Low Systems, occasional Generic
 * - 2nd division / youth / state_only clubs: Most use Generic (No Brand), a few use one of the other 4
 */
export function getAssignedEquipmentSponsorForTeam(
  team: Partial<EditorTeamData> & { id?: string; name?: string },
  explicitDivisionTier?: string
): EquipmentSponsorId {
  const tid = (team.id || '').toLowerCase();
  if (tid && BIG_CLUB_EQUIPMENT_OVERRIDES[tid]) {
    return BIG_CLUB_EQUIPMENT_OVERRIDES[tid];
  }

  const divTier = inferDivisionTierFromTeam(team, explicitDivisionTier);
  const rep = team.reputation ?? team.overallRating ?? team.ovr ?? 70;
  const hash = stableTeamHash(`${tid}:${team.name || 'club'}:eq`);

  if (divTier === 'youth' || divTier === 'state_only') {
    return hash % 10 === 0 ? 'leone' : 'generic';
  }

  if (divTier === '2nd') {
    // Most 2nd division teams use Generic (~75%); only a few (~25%, primarily bigger ex-D1 clubs) use a brand
    if (rep >= 72 || hash % 4 === 0) {
      const d2Brands: EquipmentSponsorId[] = ['leone', 'low_systems', 'electrik', 'tapitas'];
      return d2Brands[hash % d2Brands.length];
    }
    return 'generic';
  }

  // 1st Division
  if (rep >= 80) {
    // Big clubs fallback not in explicit map: heavily Electrik/Tapitas, occasional Leone, never extra Low Systems
    const slot = hash % 10;
    if (slot < 4) return 'electrik';
    if (slot < 8) return 'tapitas';
    return 'leone';
  }

  if (rep >= 74) {
    // Standard D1 clubs: Electrik / Tapitas / Leone + a few Low Systems
    const slot = hash % 10;
    if (slot < 3) return 'electrik';
    if (slot < 6) return 'tapitas';
    if (slot < 8) return 'leone';
    return 'low_systems';
  }

  // Smaller 1st-division clubs: mix including Leone, Low Systems, Electrik/Tapitas, occasional Generic
  const slot = hash % 10;
  if (slot < 2) return 'electrik';
  if (slot < 4) return 'tapitas';
  if (slot < 7) return 'leone';
  if (slot < 9) return 'low_systems';
  return 'generic';
}

const KNOWN_REAL_BRAND_SUBSTRINGS = [
  'etihad',
  'emirates',
  'spotify',
  'betsson',
  'betano',
  'directv',
  'quilmes',
  'codere',
  'bbva',
  'santander',
  'rakuten',
  'standard chartered',
  'snapdragon',
  'infinite athlete',
  'american express',
  'betway',
  'stake.com',
  'jeep',
  'qatar airways',
  'red bull',
  'telecom',
  'heineken',
  'mastercard',
  'visa',
  'nike',
  'adidas',
  'puma',
  'pixbet',
  'crefisa',
  'superbet',
  'parimatch',
  'banrisul',
  'betfair',
  'savvy games',
  'kafd',
  'roshn',
  'aramco',
  'red sea global',
  'riyadh air',
  'riyadh season',
  'barmenia',
  'msc crociere',
  'mediaworld',
  'binance',
  'cma cgm',
  'kutxabank',
  'yasuda',
  'pamesa',
  'debet',
  'sbotop',
  'hollywoodbets',
  'net88',
  'kaiyun',
  'rollbit',
  'bc.game',
  'boulanger',
  'winamax',
  'indeed',
  'bwin',
  'unibet',
  'ea sports',
  'playstation',
  'adidas',
];

export function isLegacyRealLifeBrand(brandName?: string): boolean {
  if (!brandName) return false;
  const low = brandName.trim().toLowerCase();
  if (!low) return false;
  if (low === '· t ···' || low === '1&1' || low === '+ - = ÷ ×' || low === 'aia') return true;
  return KNOWN_REAL_BRAND_SUBSTRINGS.some((real) => low.includes(real));
}

export function containsLegacyRealLifeBrands(sponsors?: Array<{ name?: string }>): boolean {
  if (!Array.isArray(sponsors) || sponsors.length === 0) return false;
  return sponsors.some((s) => isLegacyRealLifeBrand(s?.name));
}
