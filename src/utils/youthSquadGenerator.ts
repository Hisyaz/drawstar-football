import {
  EmblemConfig,
  GkDetailedStats,
  KitConfig,
  Nationality,
  OutfieldDetailedStats,
  PlayerAccessories,
  PlayerBiometrics,
  PlayerCardData,
  PlayerStats,
} from '../types';
import {
  EditorTeamData,
  FormationType,
  PlayerRolePosition,
  SquadSlot,
  TacticalStyle,
  TeamSquadSaveFile,
} from '../types/leagueEditor';
import { FederationName, RepresentativePlayer } from '../types/youthLeague';
import { NATIONALITIES } from '../constants';
import {
  createDefaultManager,
  generatePlaystyleForRoleAndStyle,
  getDefaultTacticalPositions,
} from './tacticalSystem';
import { generateArgentinePlayerNationalityAndName } from './argentinaNameGenerator';
import { generateBrazilianPlayerNationalityAndName } from './brazilNameGenerator';
import { generateEnglishPlayerNationalityAndName } from './englishNameGenerator';
import { generateFrenchPlayerNationalityAndName } from './frenchNameGenerator';
import { generateGermanPlayerNationalityAndName } from './germanNameGenerator';
import { generateItalianPlayerNationalityAndName } from './italianNameGenerator';
import { generatePortuguesePlayerNationalityAndName } from './portugueseNameGenerator';
import { generateSaudiPlayerNationalityAndName } from './saudiNameGenerator';
import { generateSpanishPlayerNationalityAndName } from './spanishNameGenerator';

export type YouthSquadScaleMode = 'league' | 'intl_cup';

export interface YouthClubSeedInput {
  id: string;
  name: string;
  country: string;
  city?: string;
  youthLeague?: string;
  federation?: FederationName;
  flag?: string;
  ovr?: number;
  baseOvr?: number;
  primaryColor?: string;
  secondaryColor?: string;
  preferredFormation?: string;
  tacticalStyle?: TacticalStyle;
  tierClass?: 'big' | 'small';
  stadiumId?: string;
  kit?: KitConfig;
  emblem?: EmblemConfig;
}

export interface YouthScaledTeamResult {
  team: EditorTeamData;
  players: PlayerCardData[];
  starters: PlayerCardData[];
  subs: PlayerCardData[];
  reserves: PlayerCardData[];
  teamOvr: number;
  attOvr: number;
  midOvr: number;
  defOvr: number;
  age: number;
  mode: YouthSquadScaleMode;
  representativePlayers: RepresentativePlayer[];
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clampOvr(val: number, min: number = 35, max: number = 90): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

const YOUTH_COUNTRY_META: Record<string, { code: string; iso: string; first: string[]; last: string[] }> = {
  netherlands: {
    code: 'NED',
    iso: 'nl',
    first: ['Noah', 'Sem', 'Lucas', 'Liam', 'Mees', 'Daan', 'Milan', 'Levi', 'Thijs', 'Luuk', 'Bram', 'Koen'],
    last: ['de Jong', 'Jansen', 'de Vries', 'van de Berg', 'Bakker', 'Smit', 'Meijer', 'Bos', 'Vos', 'Mulder', 'van Dijk'],
  },
  croatia: {
    code: 'CRO',
    iso: 'hr',
    first: ['Luka', 'David', 'Jakov', 'Petar', 'Ivan', 'Mateo', 'Roko', 'Filip', 'Marko', 'Josip', 'Borna', 'Dominik'],
    last: ['Horvat', 'Kovačić', 'Babić', 'Jurić', 'Novak', 'Petrović', 'Marić', 'Vuković', 'Knežević', 'Matić'],
  },
  austria: {
    code: 'AUT',
    iso: 'at',
    first: ['Paul', 'David', 'Jakob', 'Maximilian', 'Felix', 'Alexander', 'Tobias', 'Moritz', 'Jonas', 'Sebastian'],
    last: ['Gruber', 'Bauer', 'Pichler', 'Steiner', 'Moser', 'Mayer', 'Hofer', 'Leitner', 'Berger', 'Fuchs'],
  },
  belgium: {
    code: 'BEL',
    iso: 'be',
    first: ['Arthur', 'Liam', 'Noah', 'Jules', 'Lucas', 'Louis', 'Victor', 'Gabriel', 'Adam', 'Wout', 'Romain'],
    last: ['Peeters', 'Janssens', 'Maes', 'Jacobs', 'Mertens', 'Willems', 'Claes', 'Goossens', 'Wouters', 'De Smet'],
  },
  uruguay: {
    code: 'URU',
    iso: 'uy',
    first: ['Mateo', 'Santiago', 'Agustín', 'Joaquín', 'Lucas', 'Ignacio', 'Facundo', 'Nicolás', 'Federico', 'Rodrigo'],
    last: ['Rodríguez', 'González', 'Gómez', 'Fernández', 'López', 'Pérez', 'Silva', 'Suárez', 'Cavani', 'Valverde'],
  },
  ecuador: {
    code: 'ECU',
    iso: 'ec',
    first: ['Mateo', 'Thiago', 'Lucas', 'Matías', 'Gabriel', 'Alejandro', 'Dylan', 'Moisés', 'Piero', 'Kendry'],
    last: ['Zambrano', 'Sánchez', 'Mendoza', 'Vera', 'Cedeño', 'Morales', 'López', 'Caicedo', 'Hincapié', 'Valencia'],
  },
  colombia: {
    code: 'COL',
    iso: 'co',
    first: ['Emiliano', 'Mateo', 'Thiago', 'Matías', 'Alejandro', 'Samuel', 'Luis', 'Jhon', 'James', 'Camilo'],
    last: ['Rodríguez', 'Gómez', 'González', 'Martínez', 'García', 'López', 'Hernández', 'Díaz', 'Córdoba', 'Muñoz'],
  },
  egypt: {
    code: 'EGY',
    iso: 'eg',
    first: ['Mohamed', 'Ahmed', 'Youssef', 'Omar', 'Ali', 'Hamza', 'Hassan', 'Ibrahim', 'Mostafa', 'Ziad'],
    last: ['Mohamed', 'Hassan', 'Ali', 'Ibrahim', 'Ahmed', 'Mahmoud', 'Elsayed', 'Salah', 'Marmoush', 'Fathi'],
  },
  'south africa': {
    code: 'RSA',
    iso: 'za',
    first: ['Siyabonga', 'Junior', 'Thabo', 'Lethabo', 'Bandile', 'Kutlwano', 'Kagiso', 'Themba', 'Teboho', 'Bongani'],
    last: ['Dlamini', 'Nkosi', 'Ndlovu', 'Sithole', 'Khumalo', 'Mokoena', 'Makhanya', 'Zwane', 'Mabena', 'Tau'],
  },
  morocco: {
    code: 'MAR',
    iso: 'ma',
    first: ['Adam', 'Youssef', 'Amine', 'Rayane', 'Yassin', 'Mehdi', 'Omar', 'Hamza', 'Achraf', 'Bilal'],
    last: ['Alaoui', 'Bennani', 'El Amrani', 'Chraibi', 'Idrissi', 'Berrada', 'El Mansouri', 'Hakimi', 'Ounahi'],
  },
  "côte d'ivoire": {
    code: 'CIV',
    iso: 'ci',
    first: ['Sekou', 'Franck', 'Yao', 'Kouassi', 'Ibrahim', 'Moussa', 'Abdoulaye', 'Simon', 'Wilfried', 'Karim'],
    last: ['Kouassi', 'Koffi', 'Koné', 'Yao', 'Diallo', 'Touré', 'Traoré', 'Kessié', 'Adingra', 'Fofana'],
  },
  senegal: {
    code: 'SEN',
    iso: 'sn',
    first: ['Mamadou', 'Ibrahima', 'Ousmane', 'Aliou', 'Cheikh', 'Pape', 'Abdoulaye', 'Sadio', 'Lamine', 'Habib'],
    last: ['Ndiaye', 'Diop', 'Sow', 'Faye', 'Ba', 'Diallo', 'Fall', 'Mané', 'Camara', 'Sarr'],
  },
  'dr congo': {
    code: 'COD',
    iso: 'cd',
    first: ['Dieumerci', 'Cédric', 'Junior', 'Glody', 'Trésor', 'Chancel', 'Joël', 'Gael', 'Samuel', 'Noah'],
    last: ['Lukaku', 'Kabamba', 'Mukendi', 'Ilunga', 'Tshilombo', 'Mbala', 'Kazadi', 'Bolasie', 'Bakambu'],
  },
  japan: {
    code: 'JPN',
    iso: 'jp',
    first: ['Ren', 'Minato', 'Itsuki', 'Yamato', 'Hinata', 'Souta', 'Yuto', 'Takumi', 'Takefusa', 'Kaoru', 'Ritsu'],
    last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Kubo', 'Mitoma', 'Endo'],
  },
  'south korea': {
    code: 'KOR',
    iso: 'kr',
    first: ['Min-jun', 'Seo-jun', 'Do-yun', 'Ha-joon', 'Eun-woo', 'Si-woo', 'Ji-ho', 'Kang-in', 'Min-jae', 'Jun-ho'],
    last: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Son', 'Hwang', 'Yoon'],
  },
  uae: {
    code: 'UAE',
    iso: 'ae',
    first: ['Ali', 'Omar', 'Khalid', 'Sultan', 'Zayed', 'Ahmed', 'Hamdan', 'Rashid', 'Maktoum', 'Saeed'],
    last: ['Al-Mabkhout', 'Al-Amri', 'Al-Balushi', 'Al-Zaabi', 'Al-Ahbabi', 'Al-Hassani', 'Al-Kuwari', 'Al-Suwaidi'],
  },
  australia: {
    code: 'AUS',
    iso: 'au',
    first: ['Oliver', 'Noah', 'Jack', 'Henry', 'William', 'Leo', 'Lucas', 'Thomas', 'Riley', 'Mitchell'],
    last: ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Johnson', 'Irvine', 'Goodwin', 'Boyle'],
  },
  'new zealand': {
    code: 'NZL',
    iso: 'nz',
    first: ['Oliver', 'Noah', 'Leo', 'Jack', 'Lucas', 'Ezra', 'Hudson', 'Liam', 'Chris', 'Sarpreet'],
    last: ['Smith', 'Wilson', 'Brown', 'Williams', 'Jones', 'Taylor', 'Patel', 'Wood', 'Singh', 'Reid'],
  },
  'papua new guinea': {
    code: 'PNG',
    iso: 'pg',
    first: ['John', 'Paul', 'David', 'Samuel', 'Michael', 'Peter', 'Junior', 'Raymond', 'Tommy', 'Alwin'],
    last: ['Kila', 'Waqa', 'Pora', 'Kare', 'Aua', 'Mani', 'Vele', 'Gunemba', 'Komolong', 'Simon'],
  },
  fiji: {
    code: 'FIJ',
    iso: 'fj',
    first: ['Tevita', 'Sisa', 'Filimoni', 'Jone', 'Mosese', 'Ratu', 'Waisea', 'Viliame', 'Roy', 'Setareki'],
    last: ['Tawake', 'Ratuvou', 'Nakarawa', 'Naivalu', 'Vatubua', 'Cakobau', 'Burotu', 'Krishna', 'Hughes'],
  },
  mexico: {
    code: 'MEX',
    iso: 'mx',
    first: ['Santiago', 'Mateo', 'Matías', 'Diego', 'Sebastián', 'Leonardo', 'Emiliano', 'Rodrigo', 'Gael', 'Iker'],
    last: ['Hernández', 'García', 'Martínez', 'López', 'González', 'Pérez', 'Rodríguez', 'Jiménez', 'Vega', 'Reyes'],
  },
  'united states': {
    code: 'USA',
    iso: 'us',
    first: ['Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Christian', 'Weston', 'Gio'],
    last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Pulisic', 'Adams', 'Reyna'],
  },
  'costa rica': {
    code: 'CRC',
    iso: 'cr',
    first: ['Mateo', 'Santiago', 'Thiago', 'Sebastián', 'Gabriel', 'Felipe', 'Lucas', 'Keylor', 'Manfred', 'Joel'],
    last: ['Mora', 'Jiménez', 'González', 'Rodríguez', 'Vargas', 'Monge', 'Castro', 'Navas', 'Ugalde', 'Ruiz'],
  },
};

function resolveYouthCountryCode(country: string): string {
  const c = (country || '').trim().toLowerCase();
  if (c === 'argentina') return 'ARG';
  if (c === 'brazil' || c === 'brasil') return 'BRA';
  if (c === 'spain' || c === 'españa' || c === 'espana') return 'ESP';
  if (c === 'england') return 'ENG';
  if (c === 'france') return 'FR';
  if (c === 'italy' || c === 'italia') return 'ITA';
  if (c === 'germany' || c === 'deutschland') return 'GER';
  if (c === 'portugal') return 'POR';
  if (c === 'saudi arabia') return 'KSA';
  return YOUTH_COUNTRY_META[c]?.code || 'ENG';
}

function resolveYouthNationality(country: string): Nationality {
  const code = resolveYouthCountryCode(country);
  const found = NATIONALITIES.find(
    (n) =>
      n.code.toUpperCase() === code.toUpperCase() ||
      n.name.toLowerCase() === country.toLowerCase()
  );
  if (found) return found;
  const meta = YOUTH_COUNTRY_META[country.toLowerCase()];
  return {
    code: meta?.code || code,
    iso: meta?.iso || code.toLowerCase().slice(0, 2),
    name: country || 'International',
  };
}

function generateDeterministicYouthIdentity(
  country: string,
  rng: () => number,
  slotNumber: number
): { name: string; nationality: Nationality } {
  const lower = (country || '').trim().toLowerCase();
  const baseNat = resolveYouthNationality(country);

  // Use country-authentic name pools deterministically seeded when possible,
  // with occasional domestic-league diversity (first 4 slots strictly domestic, remaining 85% domestic)
  const useDomesticGenerator = slotNumber <= 12 || rng() < 0.88;
  if (useDomesticGenerator) {
    if (lower === 'england') {
      const id = generateEnglishPlayerNationalityAndName();
      return { name: id.name, nationality: slotNumber <= 11 ? baseNat : id.nationality };
    }
    if (lower === 'france') {
      const id = generateFrenchPlayerNationalityAndName();
      return { name: id.name, nationality: slotNumber <= 11 ? baseNat : id.nationality };
    }
    if (lower === 'spain') {
      const id = generateSpanishPlayerNationalityAndName();
      return { name: id.name, nationality: slotNumber <= 11 ? baseNat : id.nationality };
    }
    if (lower === 'argentina') {
      const id = generateArgentinePlayerNationalityAndName();
      return { name: id.name, nationality: slotNumber <= 11 ? baseNat : id.nationality };
    }
    if (lower === 'brazil' || lower === 'brasil') {
      const id = generateBrazilianPlayerNationalityAndName();
      return { name: id.name, nationality: slotNumber <= 11 ? baseNat : id.nationality };
    }
    if (lower === 'saudi arabia') {
      const id = generateSaudiPlayerNationalityAndName();
      return { name: id.name, nationality: slotNumber <= 11 ? baseNat : id.nationality };
    }
    if (lower === 'italy') {
      const id = generateItalianPlayerNationalityAndName();
      return { name: id.name, nationality: slotNumber <= 11 ? baseNat : id.nationality };
    }
    if (lower === 'germany') {
      const id = generateGermanPlayerNationalityAndName();
      return { name: id.name, nationality: slotNumber <= 11 ? baseNat : id.nationality };
    }
    if (lower === 'portugal') {
      const id = generatePortuguesePlayerNationalityAndName();
      return { name: id.name, nationality: slotNumber <= 11 ? baseNat : id.nationality };
    }
  }

  const meta = YOUTH_COUNTRY_META[lower];
  if (meta) {
    const f = meta.first[Math.floor(rng() * meta.first.length)];
    const l = meta.last[Math.floor(rng() * meta.last.length)];
    return { name: `${f} ${l}`, nationality: baseNat };
  }

  const fallbackFirst = ['Lucas', 'Mateo', 'Noah', 'Leo', 'Liam', 'Gabriel', 'Daniel', 'David'];
  const fallbackLast = ['Silva', 'Santos', 'Martínez', 'Smith', 'Müller', 'Rossi', 'Dubois', 'Fernández'];
  return {
    name: `${fallbackFirst[Math.floor(rng() * fallbackFirst.length)]} ${fallbackLast[Math.floor(rng() * fallbackLast.length)]}`,
    nationality: baseNat,
  };
}

function normalizeFormation(raw?: string): FormationType {
  const f = (raw || '4-3-3').trim();
  if (
    f === '4-3-3' ||
    f === '4-2-3-1' ||
    f === '4-4-2' ||
    f === '3-4-3' ||
    f === '3-5-2' ||
    f === '3-4-1-2' ||
    f === '3-4-2-1' ||
    f === '5-3-2' ||
    f === '5-4-1'
  ) {
    return f;
  }
  if (f === '4-3-1-2' || f === '4-1-4-1') return '4-2-3-1';
  return '4-3-3';
}

function roleToLineCategory(role: string): 'GK' | 'DEF' | 'MID' | 'ATT' {
  const r = role.toUpperCase();
  if (r === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(r)) return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(r)) return 'MID';
  return 'ATT';
}

function buildStarterRolesForFormation(formation: FormationType): PlayerRolePosition[] {
  const setup = getDefaultTacticalPositions(formation, 'possession');
  if (setup.length === 11) {
    return setup.map((s) => s.role);
  }
  return ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CM', 'LW', 'ST', 'RW'];
}

const SUB_ROLES_7: PlayerRolePosition[] = ['GK', 'CB', 'LB', 'CDM', 'CM', 'LW', 'ST'];
const RESERVE_ROLES_5: PlayerRolePosition[] = ['GK', 'RB', 'CM', 'CAM', 'RW'];

/**
 * Computes the yearly scaled OVR for a club at age (10..16).
 * - Career mode scales from age 10 (~40-50 domestic, ~46-56 Int'l) up to age 16 (~62-72 domestic, ~67-76 Int'l).
 * - Kickoff defaults to age = 16.
 * - Int'l Youth Cup mode yields higher OVR tiering than domestic Youth Leagues at the same age.
 */
export function computeYouthTeamTargetOvrForAge(
  club: YouthClubSeedInput,
  age: number = 16,
  mode: YouthSquadScaleMode = 'league'
): number {
  const clampedAge = Math.max(10, Math.min(16, Math.round(age)));
  const yearsProgressed = clampedAge - 10; // 0 .. 6

  // Base anchor at age 10
  const seedHash = hashSeed(`${club.id}:${club.name}`);
  const tierBaselineAt10 =
    typeof club.ovr === 'number'
      ? club.ovr
      : typeof club.baseOvr === 'number'
      ? club.baseOvr
      : club.federation === 'UEFA'
      ? 49 + (seedHash % 4)
      : club.federation === 'CONMEBOL'
      ? 47 + (seedHash % 4)
      : club.federation === 'CAF' || club.federation === 'CONCACAF'
      ? 45 + (seedHash % 4)
      : club.federation === 'AFC'
      ? 44 + (seedHash % 4)
      : 41 + (seedHash % 3);

  // League scaling: ~3.75 OVR per year (age 10: 40-50 -> age 16: 62-72)
  const leagueScaled = tierBaselineAt10 + yearsProgressed * 3.7;
  if (mode === 'league') {
    return clampOvr(leagueScaled, 38, 76);
  }

  // Int'l Youth Cup receives a +4 to +6 higher OVR tier bump at the same age
  const fedPrestigeBonus =
    club.federation === 'UEFA'
      ? 6
      : club.federation === 'CONMEBOL'
      ? 5
      : club.federation === 'CAF' || club.federation === 'CONCACAF'
      ? 4
      : club.federation === 'AFC'
      ? 3
      : 2;

  return clampOvr(leagueScaled + fedPrestigeBonus, 44, 80);
}

function buildDetailedStatsForYouthPlayer(
  role: PlayerRolePosition,
  targetOvr: number,
  rng: () => number
): PlayerStats {
  const line = roleToLineCategory(role);
  const jitter = () => Math.round((rng() - 0.5) * 6);
  const clamp = (v: number) => Math.max(30, Math.min(95, Math.round(v)));

  if (line === 'GK') {
    const gkDetailed: GkDetailedStats = {
      saving: clamp(targetOvr + 1 + jitter()),
      reflexes: clamp(targetOvr + 2 + jitter()),
      handling: clamp(targetOvr + jitter()),
      positioning: clamp(targetOvr + jitter()),
      aerialReach: clamp(targetOvr - 1 + jitter()),
      oneOnOne: clamp(targetOvr + jitter()),
      distribution: clamp(targetOvr - 4 + jitter()),
    };
    return {
      pro: clamp(targetOvr - 8),
      def: clamp(targetOvr - 6),
      cre: gkDetailed.distribution,
      men: clamp(targetOvr),
      goa: clamp(
        (gkDetailed.saving + gkDetailed.reflexes + gkDetailed.handling + gkDetailed.positioning + gkDetailed.oneOnOne) / 5
      ),
      phy: clamp(gkDetailed.aerialReach),
      gkDetailed,
    };
  }

  const isAtt = line === 'ATT';
  const isMid = line === 'MID';
  const isDef = line === 'DEF';

  const pace = clamp(targetOvr + (role === 'LW' || role === 'RW' || role === 'LB' || role === 'RB' ? 4 : 0) + jitter());
  const stamina = clamp(targetOvr + (isMid ? 3 : 0) + jitter());
  const strength = clamp(targetOvr + (role === 'CB' || role === 'CDM' || role === 'ST' ? 2 : -3) + jitter());

  const ballControl = clamp(targetOvr + (isAtt || isMid ? 2 : -4) + jitter());
  const retention = clamp(targetOvr + (isMid ? 2 : -2) + jitter());
  const dribbling = clamp(targetOvr + (isAtt ? 3 : isDef ? -6 : 1) + jitter());

  const shortPass = clamp(targetOvr + (isMid ? 3 : -2) + jitter());
  const longPass = clamp(targetOvr + (isMid ? 2 : -4) + jitter());
  const crossing = clamp(targetOvr + (role === 'LB' || role === 'RB' || role === 'LW' || role === 'RW' ? 3 : -5) + jitter());

  const shooting = clamp(targetOvr + (isAtt ? 4 : isMid ? -3 : -14) + jitter());
  const heading = clamp(targetOvr + (role === 'CB' || role === 'ST' ? 2 : -8) + jitter());
  const longShots = clamp(targetOvr + (isAtt || role === 'CAM' ? 2 : -9) + jitter());

  const tackling = clamp(targetOvr + (isDef ? 4 : role === 'CDM' ? 3 : -14) + jitter());
  const marking = clamp(targetOvr + (isDef ? 4 : role === 'CDM' ? 2 : -15) + jitter());
  const interceptions = clamp(targetOvr + (isDef || role === 'CDM' ? 3 : -10) + jitter());

  const positioning = clamp(targetOvr + jitter());
  const composure = clamp(targetOvr - 1 + jitter());
  const reactions = clamp(targetOvr + jitter());

  const detailed: OutfieldDetailedStats = {
    pace,
    stamina,
    strength,
    ballControl,
    retention,
    dribbling,
    shortPass,
    longPass,
    crossing,
    shooting,
    heading,
    longShots,
    tackling,
    marking,
    interceptions,
    positioning,
    composure,
    reactions,
  };

  return {
    phy: clamp((pace + stamina + strength) / 3),
    pro: clamp((ballControl + retention + dribbling) / 3),
    cre: clamp((shortPass + longPass + crossing) / 3),
    goa: clamp((shooting + heading + longShots) / 3),
    def: clamp((tackling + marking + interceptions) / 3),
    men: clamp((positioning + composure + reactions) / 3),
    detailed,
  };
}

const SKIN_TONES = ['#ffe0bd', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3818'];
const HAIR_COLORS = ['#111111', '#241408', '#3b220c', '#78350f', '#a66d40', '#e5c158'];

/**
 * Generates a deterministic 23-player Youth squad (11 starters + 7 subs + 5 reserves)
 * along with a fast-path-safe EditorTeamData containing full 35/25/25/25 squadSaveFile
 * and representative players synchronized with the top GK/DEF/MID/ATT.
 */
export function getYouthScaledTeamAndPlayers(
  club: YouthClubSeedInput,
  age: number = 16,
  mode: YouthSquadScaleMode = 'league'
): YouthScaledTeamResult {
  const clampedAge = Math.max(10, Math.min(16, Math.round(age)));
  const rng = mulberry32(hashSeed(`${club.id}:${club.name}:${mode}:${clampedAge}`));

  const primaryColor = club.primaryColor || club.kit?.color1 || '#1d4ed8';
  const secondaryColor = club.secondaryColor || club.kit?.color2 || '#ffffff';
  const formation = normalizeFormation(club.preferredFormation);
  const style: TacticalStyle =
    club.tacticalStyle || (['possession', 'gegenpressing', 'counter_attack'][Math.floor(rng() * 3)] as TacticalStyle);

  const kit: KitConfig = club.kit || {
    style: 'normal',
    color1: primaryColor,
    color2: secondaryColor,
    pattern: rng() < 0.35 ? 'stripes' : rng() < 0.65 ? 'solid' : 'sash',
    collar: 'crew',
  };

  const emblem: EmblemConfig = club.emblem || {
    shape: 'crested-shield',
    mode: '2',
    color1: primaryColor,
    color2: secondaryColor,
  };

  const clubTargetOvr = computeYouthTeamTargetOvrForAge(club, clampedAge, mode);
  const countryCode = resolveYouthCountryCode(club.country);
  const starterRoles = buildStarterRolesForFormation(formation);
  const allRoles: PlayerRolePosition[] = [...starterRoles, ...SUB_ROLES_7, ...RESERVE_ROLES_5];

  const players: PlayerCardData[] = allRoles.map((role, index) => {
    const slotNumber = index + 1; // 1..23
    const isStarter = slotNumber <= 11;
    const isSub = slotNumber >= 12 && slotNumber <= 18;

    let ovrOffset = 0;
    if (isStarter) {
      // Standout academy prodigies up to +2, others -1..+1 around clubTargetOvr
      ovrOffset = slotNumber <= 3 ? 1 + (slotNumber % 2) : Math.round((rng() - 0.5) * 2);
    } else if (isSub) {
      ovrOffset = -2 - (slotNumber % 2);
    } else {
      ovrOffset = -4 - (slotNumber % 3);
    }

    const playerOvr = clampOvr(clubTargetOvr + ovrOffset, 35, 84);
    const potentialOvr = clampOvr(playerOvr + 12 + Math.floor(rng() * 14), playerOvr + 6, 94);
    const playerAge = slotNumber % 4 === 0 ? Math.max(9, clampedAge - 1) : clampedAge;

    const { name, nationality } = generateDeterministicYouthIdentity(club.country, rng, slotNumber);
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(' ') || name;
    const stats = buildDetailedStatsForYouthPlayer(role, playerOvr, rng);
    const line = roleToLineCategory(role);
    const playStyle = generatePlaystyleForRoleAndStyle(role, style, slotNumber + hashSeed(club.id), playerOvr);

    const biometrics: PlayerBiometrics = {
      strength: stats.phy,
      skinColor: SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)],
      hairStyle: rng() < 0.65 ? 'straight' : rng() < 0.85 ? 'wavy' : 'curly',
      hairLength: rng() < 0.7 ? 'short' : 'medium',
      hairRoot: HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)],
      hairDye: '#111111',
    };

    const accessories: PlayerAccessories = {
      accessory: 'none',
      headbandColor: primaryColor,
    };

    return {
      id: `youth-${club.id}-${mode}-a${clampedAge}-s${slotNumber}`,
      firstName,
      lastName,
      name,
      number: slotNumber,
      shirtNumber: slotNumber,
      ovr: playerOvr,
      overallRating: playerOvr,
      potentialOvr,
      age: playerAge,
      club: club.name,
      clubCountry: countryCode,
      nationality,
      position: line,
      subPosition: role,
      playStyle,
      preferredFoot: slotNumber % 4 === 0 ? 'Left' : 'Right',
      weakFootStars: rng() < 0.2 ? 4 : 3,
      heightCm: line === 'GK' ? 182 + Math.floor(rng() * 8) : 165 + Math.floor(rng() * 16),
      weightKg: line === 'GK' ? 74 : 60 + Math.floor(rng() * 12),
      stats,
      biometrics,
      accessories,
      kit,
      emblem,
    };
  });

  const starters = players.slice(0, 11);
  const subs = players.slice(11, 18);
  const reserves = players.slice(18, 23);

  const avgOf = (arr: PlayerCardData[]) =>
    arr.length > 0
      ? Math.round(arr.reduce((sum, p) => sum + (p.ovr || clubTargetOvr), 0) / arr.length)
      : clubTargetOvr;

  const teamOvr = avgOf(starters);
  const defOvr = avgOf(starters.filter((p) => p.position === 'GK' || p.position === 'DEF'));
  const midOvr = avgOf(starters.filter((p) => p.position === 'MID'));
  const attOvr = avgOf(starters.filter((p) => p.position === 'ATT'));

  const squadSlots: SquadSlot[] = [];
  for (let s = 1; s <= 35; s++) {
    squadSlots.push({
      slotNumber: s,
      player: s <= players.length ? players[s - 1] : null,
    });
  }
  const reserveSlots: SquadSlot[] = [];
  for (let s = 36; s <= 60; s++) {
    reserveSlots.push({ slotNumber: s, player: null });
  }
  const u20Slots: SquadSlot[] = [];
  for (let s = 1; s <= 25; s++) {
    u20Slots.push({ slotNumber: s, player: null });
  }
  const u17Slots: SquadSlot[] = [];
  for (let s = 1; s <= 25; s++) {
    u17Slots.push({
      slotNumber: s,
      player: s <= players.length ? players[s - 1] : null,
    });
  }

  const squadSaveFile: TeamSquadSaveFile = {
    squad: squadSlots,
    reserves: reserveSlots,
    u20: u20Slots,
    u17: u17Slots,
  };

  const baseManager = createDefaultManager(club.name, countryCode, club.id, starters);
  const manager = {
    ...baseManager,
    primaryTactic: {
      ...baseManager.primaryTactic,
      formation,
      style,
      positions: getDefaultTacticalPositions(formation, style),
    },
  };

  const gkLeader = [...players].filter((p) => p.position === 'GK').sort((a, b) => (b.ovr || 0) - (a.ovr || 0))[0];
  const defLeader = [...players].filter((p) => p.position === 'DEF').sort((a, b) => (b.ovr || 0) - (a.ovr || 0))[0];
  const midLeader = [...players].filter((p) => p.position === 'MID').sort((a, b) => (b.ovr || 0) - (a.ovr || 0))[0];
  const attLeader = [...players].filter((p) => p.position === 'ATT').sort((a, b) => (b.ovr || 0) - (a.ovr || 0))[0];

  const team: EditorTeamData = {
    id: club.id,
    name: club.name,
    shortName: club.name.slice(0, 3).toUpperCase(),
    leagueId: club.youthLeague ? `youth_${club.youthLeague.toLowerCase().replace(/\s+/g, '_')}` : undefined,
    countryCode,
    countryName: club.country,
    city: club.city,
    emblem,
    kit,
    reputation: teamOvr,
    attackRating: attOvr,
    midfieldRating: midOvr,
    defenseRating: defOvr,
    overallRating: teamOvr,
    ovr: teamOvr,
    federation: club.federation,
    manager,
    squadSaveFile,
    stadium: {
      name: `${club.name} Ground`,
      capacity: club.tierClass === 'big' ? 6500 : 1800,
      tier: club.tierClass === 'big' ? 2 : 1,
      gameplayStadiumId: club.stadiumId,
    },
    goalkeeperPlayerId: gkLeader?.id,
    defenderPlayerId: defLeader?.id,
    creatorPlayerId: midLeader?.id,
    goalscorerPlayerId: attLeader?.id,
    captainPlayerId: starters[1]?.id || starters[0]?.id,
  };

  const repList: RepresentativePlayer[] = (['GK', 'DEF', 'MID', 'ATT'] as const).map((line) => {
    const leader =
      players
        .filter((p) => p.position === line)
        .sort((a, b) => (b.ovr || 0) - (a.ovr || 0))[0] || starters[0];
    return {
      id: leader.id,
      name: leader.name,
      position: line,
      ovr: leader.ovr || clubTargetOvr,
      country: leader.nationality?.name || club.country,
    };
  });

  return {
    team,
    players,
    starters,
    subs,
    reserves,
    teamOvr,
    attOvr,
    midOvr,
    defOvr,
    age: clampedAge,
    mode,
    representativePlayers: repList,
  };
}
