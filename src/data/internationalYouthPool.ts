import { FederationName, RepresentativePlayer, InternationalYouthClub } from '../types/youthLeague';
import { KitConfig, PlayerCardData } from '../types';
import {
  getYouthScaledTeamAndPlayers,
  YouthScaledTeamResult,
} from '../utils/youthSquadGenerator';

export interface FederationClubTemplate {
  id: string;
  name: string;
  country: string;
  federation: FederationName;
  flag: string;
  primaryColor: string;
  secondaryColor: string;
  preferredFormation: string;
  ovr?: number;
  teamOvr?: number;
  attOvr?: number;
  midOvr?: number;
  defOvr?: number;
  kit?: KitConfig;
  players?: PlayerCardData[];
  representativePlayers?: RepresentativePlayer[];
}

const RAW_FEDERATION_CLUB_POOLS: Record<FederationName, FederationClubTemplate[]> = {
  UEFA: [
    { id: 'uefa-barcelona', name: 'Catalunya FC', country: 'Spain', federation: 'UEFA', flag: '🇪🇸', primaryColor: '#a50044', secondaryColor: '#004d98', preferredFormation: '4-3-3' },
    { id: 'uefa-real-madrid', name: 'Blancos CF', country: 'Spain', federation: 'UEFA', flag: '🇪🇸', primaryColor: '#ffffff', secondaryColor: '#febe10', preferredFormation: '4-3-3' },
    { id: 'uefa-man-city', name: 'Eastlands Sky Blues City', country: 'England', federation: 'UEFA', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', primaryColor: '#6cabdd', secondaryColor: '#1c2c5b', preferredFormation: '4-3-3' },
    { id: 'uefa-chelsea', name: 'London FC', country: 'England', federation: 'UEFA', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', primaryColor: '#034694', secondaryColor: '#ee242c', preferredFormation: '4-2-3-1' },
    { id: 'uefa-arsenal', name: 'Gunners FC', country: 'England', federation: 'UEFA', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', primaryColor: '#ef0107', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'uefa-psg', name: 'Bleus de Paris', country: 'France', federation: 'UEFA', flag: '🇫🇷', primaryColor: '#004170', secondaryColor: '#da291c', preferredFormation: '4-3-3' },
    { id: 'uefa-bayern', name: 'Bavaria Rot FC', country: 'Germany', federation: 'UEFA', flag: '🇩🇪', primaryColor: '#dc052d', secondaryColor: '#0066b2', preferredFormation: '4-2-3-1' },
    { id: 'uefa-dortmund', name: 'Westfalen Schwarzgelb BVB', country: 'Germany', federation: 'UEFA', flag: '🇩🇪', primaryColor: '#fde100', secondaryColor: '#000000', preferredFormation: '4-3-3' },
    { id: 'uefa-ajax', name: 'Amstel Godenzonen AFC', country: 'Netherlands', federation: 'UEFA', flag: '🇳🇱', primaryColor: '#d2122e', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'uefa-benfica', name: 'Águias Encarnadas SL', country: 'Portugal', federation: 'UEFA', flag: '🇵🇹', primaryColor: '#ff0000', secondaryColor: '#ffffff', preferredFormation: '4-4-2' },
    { id: 'uefa-sporting', name: 'Alvalade Leões CP', country: 'Portugal', federation: 'UEFA', flag: '🇵🇹', primaryColor: '#008000', secondaryColor: '#ffffff', preferredFormation: '3-4-3' },
    { id: 'uefa-juventus', name: 'Piemonte Bianconeri FC', country: 'Italy', federation: 'UEFA', flag: '🇮🇹', primaryColor: '#000000', secondaryColor: '#ffffff', preferredFormation: '3-5-2' },
    { id: 'uefa-milan', name: 'Rossoneri Calcio', country: 'Italy', federation: 'UEFA', flag: '🇮🇹', primaryColor: '#fb090b', secondaryColor: '#000000', preferredFormation: '4-2-3-1' },
    { id: 'uefa-dinamo', name: 'Maksimir Modri', country: 'Croatia', federation: 'UEFA', flag: '🇭🇷', primaryColor: '#0000ff', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'uefa-salzburg', name: 'Mozartstadt Rot-Weiß', country: 'Austria', federation: 'UEFA', flag: '🇦🇹', primaryColor: '#e20111', secondaryColor: '#ffffff', preferredFormation: '4-4-2' },
    { id: 'uefa-anderlecht', name: 'Neerpede Mauves RSC', country: 'Belgium', federation: 'UEFA', flag: '🇧🇪', primaryColor: '#5c2d91', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
  ],
  CONMEBOL: [
    { id: 'con-river', name: 'Millonarios Plate', country: 'Argentina', federation: 'CONMEBOL', flag: '🇦🇷', primaryColor: '#ffffff', secondaryColor: '#eb1c24', preferredFormation: '4-3-1-2' },
    { id: 'con-boca', name: 'Xeneizes Juniors', country: 'Argentina', federation: 'CONMEBOL', flag: '🇦🇷', primaryColor: '#0047ab', secondaryColor: '#f7d117', preferredFormation: '4-3-3' },
    { id: 'con-flamengo', name: 'Gávea Rubro-Negro CR', country: 'Brazil', federation: 'CONMEBOL', flag: '🇧🇷', primaryColor: '#c3281e', secondaryColor: '#000000', preferredFormation: '4-2-3-1' },
    { id: 'con-palmeiras', name: 'Palestra Alviverde SE', country: 'Brazil', federation: 'CONMEBOL', flag: '🇧🇷', primaryColor: '#006437', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'con-santos', name: 'Vila Belmiro Peixe FC', country: 'Brazil', federation: 'CONMEBOL', flag: '🇧🇷', primaryColor: '#ffffff', secondaryColor: '#000000', preferredFormation: '4-3-3' },
    { id: 'con-sao-paulo', name: 'Morumbi Soberano FC', country: 'Brazil', federation: 'CONMEBOL', flag: '🇧🇷', primaryColor: '#fe0000', secondaryColor: '#000000', preferredFormation: '4-2-3-1' },
    { id: 'con-penarol', name: 'Carboneros Aurinegros CA', country: 'Uruguay', federation: 'CONMEBOL', flag: '🇺🇾', primaryColor: '#fcd116', secondaryColor: '#000000', preferredFormation: '4-4-2' },
    { id: 'con-nacional', name: 'Parque Central Tricolor', country: 'Uruguay', federation: 'CONMEBOL', flag: '🇺🇾', primaryColor: '#002f6c', secondaryColor: '#ba0c2f', preferredFormation: '4-3-3' },
    { id: 'con-idv', name: 'Sangolquí Negriazul', country: 'Ecuador', federation: 'CONMEBOL', flag: '🇪🇨', primaryColor: '#000000', secondaryColor: '#1d70b8', preferredFormation: '4-3-3' },
    { id: 'con-atletico-nac', name: 'Verdolaga Paisa Atlético', country: 'Colombia', federation: 'CONMEBOL', flag: '🇨🇴', primaryColor: '#008751', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
  ],
  CAF: [
    { id: 'caf-al-ahly', name: 'Cairo Red Devils SC', country: 'Egypt', federation: 'CAF', flag: '🇪🇬', primaryColor: '#e30613', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'caf-sundowns', name: 'Tshwane Brazilians FC', country: 'South Africa', federation: 'CAF', flag: '🇿🇦', primaryColor: '#f7ce00', secondaryColor: '#00853f', preferredFormation: '4-3-3' },
    { id: 'caf-wydad', name: 'Casablanca Red Castle AC', country: 'Morocco', federation: 'CAF', flag: '🇲🇦', primaryColor: '#e20613', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'caf-asec', name: 'Abidjan Mimosas SC', country: "Côte d'Ivoire", federation: 'CAF', flag: '🇨🇮', primaryColor: '#ff8200', secondaryColor: '#000000', preferredFormation: '4-3-3' },
    { id: 'caf-generation', name: 'Dakar Grenats Academy', country: 'Senegal', federation: 'CAF', flag: '🇸🇳', primaryColor: '#00853f', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'caf-tp-mazembe', name: 'Lubumbashi Ravens TP', country: 'DR Congo', federation: 'CAF', flag: '🇨🇩', primaryColor: '#000000', secondaryColor: '#ffffff', preferredFormation: '4-4-2' },
  ],
  AFC: [
    { id: 'afc-al-hilal', name: 'Riyadh Blue Crescent SFC', country: 'Saudi Arabia', federation: 'AFC', flag: '🇸🇦', primaryColor: '#0033a0', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'afc-urawa', name: 'Saitama Red Diamonds', country: 'Japan', federation: 'AFC', flag: '🇯🇵', primaryColor: '#d7000f', secondaryColor: '#000000', preferredFormation: '4-2-3-1' },
    { id: 'afc-jeonbuk', name: 'Jeonju Green Warriors', country: 'South Korea', federation: 'AFC', flag: '🇰🇷', primaryColor: '#005a2b', secondaryColor: '#84be00', preferredFormation: '4-1-4-1' },
    { id: 'afc-marinos', name: 'Minato Tricolore FC', country: 'Japan', federation: 'AFC', flag: '🇯🇵', primaryColor: '#000080', secondaryColor: '#ff0000', preferredFormation: '4-3-3' },
    { id: 'afc-al-ain', name: 'Garden City Purple FC', country: 'UAE', federation: 'AFC', flag: '🇦🇪', primaryColor: '#4b0082', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'afc-melbourne', name: 'Yarra Sky Blues City', country: 'Australia', federation: 'AFC', flag: '🇦🇺', primaryColor: '#6cabdd', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
  ],
  OFC: [
    { id: 'ofc-auckland', name: 'Waitematā Navy Blues FC', country: 'New Zealand', federation: 'OFC', flag: '🇳🇿', primaryColor: '#0000ff', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'ofc-wellington', name: 'Harbour Gold United', country: 'New Zealand', federation: 'OFC', flag: '🇳🇿', primaryColor: '#ffff00', secondaryColor: '#000000', preferredFormation: '4-4-2' },
    { id: 'ofc-hekari', name: 'Port Moresby Reds United', country: 'Papua New Guinea', federation: 'OFC', flag: '🇵🇬', primaryColor: '#ff0000', secondaryColor: '#000000', preferredFormation: '4-4-2' },
    { id: 'ofc-suva', name: 'Viti Levu Whites FC', country: 'Fiji', federation: 'OFC', flag: '🇫🇯', primaryColor: '#ffffff', secondaryColor: '#000000', preferredFormation: '4-3-3' },
  ],
  CONCACAF: [
    { id: 'cnc-pachuca', name: 'Hidalgo Tuzos CF', country: 'Mexico', federation: 'CONCACAF', flag: '🇲🇽', primaryColor: '#002f6c', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'cnc-america', name: 'Coapa Águilas CF', country: 'Mexico', federation: 'CONCACAF', flag: '🇲🇽', primaryColor: '#ffff99', secondaryColor: '#000080', preferredFormation: '4-3-3' },
    { id: 'cnc-dallas', name: 'North Texas Toros FC', country: 'United States', federation: 'CONCACAF', flag: '🇺🇸', primaryColor: '#e31837', secondaryColor: '#002d62', preferredFormation: '4-2-3-1' },
    { id: 'cnc-la-galaxy', name: 'Carson Starlights SC', country: 'United States', federation: 'CONCACAF', flag: '🇺🇸', primaryColor: '#00245d', secondaryColor: '#ffd100', preferredFormation: '4-3-3' },
    { id: 'cnc-saprissa', name: 'Tibás Morado Deportivo', country: 'Costa Rica', federation: 'CONCACAF', flag: '🇨🇷', primaryColor: '#7b002c', secondaryColor: '#ffffff', preferredFormation: '4-4-2' },
    { id: 'cnc-seattle', name: 'Puget Rave Green FC', country: 'United States', federation: 'CONCACAF', flag: '🇺🇸', primaryColor: '#5d9732', secondaryColor: '#005595', preferredFormation: '4-2-3-1' },
  ],
};

const FIRST_NAMES_BY_COUNTRY: Record<string, string[]> = {
  Spain: ['Juan', 'Mateo', 'Lucas', 'Pablo', 'Hugo', 'Leo', 'Alejandro', 'Daniel'],
  England: ['Harry', 'Oliver', 'George', 'Noah', 'Jack', 'Arthur', 'Leo', 'Charlie'],
  France: ['Gabriel', 'Léo', 'Raphaël', 'Louis', 'Arthur', 'Jules', 'Maël', 'Lucas'],
  Germany: ['Noah', 'Matteo', 'Finn', 'Leon', 'Paul', 'Elias', 'Lukas', 'Felix'],
  Netherlands: ['Noah', 'Sem', 'Lucas', 'Liam', 'Mees', 'Daan', 'Milan', 'Levi'],
  Portugal: ['Francisco', 'Afonso', 'Duarte', 'Lourenço', 'Tomas', 'Martim', 'Rodrigo'],
  Italy: ['Leonardo', 'Francesco', 'Tommaso', 'Edoardo', 'Alessandro', 'Lorenzo', 'Mattia'],
  Croatia: ['Luka', 'David', 'Jakov', 'Petar', 'Ivan', 'Mateo', 'Roko', 'Filip'],
  Argentina: ['Mateo', 'Thiago', 'Benjamín', 'Joaquín', 'Bautista', 'Felipe', 'Santiago'],
  Brazil: ['Gabriel', 'Lucas', 'Pedro', 'Matheus', 'Enzo', 'Guilherme', 'Nicolas'],
  Uruguay: ['Mateo', 'Santiago', 'Agustín', 'Joaquín', 'Lucas', 'Ignacio', 'Facundo'],
  Ecuador: ['Mateo', 'Thiago', 'Lucas', 'Matías', 'Gabriel', 'Alejandro', 'Dylan'],
  Colombia: ['Emiliano', 'Luciana', 'Mateo', 'Thiago', 'Matías', 'Alejandro', 'Samuel'],
  Egypt: ['Mohamed', 'Ahmed', 'Youssef', 'Omar', 'Ali', 'Hamza', 'Hassan', 'Ibrahim'],
  'South Africa': ['Siyabonga', 'Junior', 'Thabo', 'Lethabo', 'Bandile', 'Kutlwano', 'Kagiso'],
  Morocco: ['Adam', 'Youssef', 'Amine', 'Rayane', 'Yassin', 'Mehdi', 'Omar', 'Hamza'],
  "Côte d'Ivoire": ['Sekou', 'Franck', 'Yao', 'Kouassi', 'Ibrahim', 'Moussa', 'Abdoulaye'],
  Senegal: ['Mamadou', 'Ibrahima', 'Ousmane', 'Aliou', 'Cheikh', 'Pape', 'Abdoulaye'],
  'DR Congo': ['Dieumerci', 'Cedric', 'Junior', 'Glody', 'Tresor', 'Chancel', 'Joel'],
  'Saudi Arabia': ['Mohammed', 'Abdullah', 'Abdulrahman', 'Ali', 'Fahad', 'Sultan', 'Khalid'],
  Japan: ['Ren', 'Minato', 'Itsuki', 'Yamato', 'Hinata', 'Souta', 'Yuto', 'Takumi'],
  'South Korea': ['Min-jun', 'Seo-jun', 'Do-yun', 'Ha-joon', 'Eun-woo', 'Si-woo', 'Ji-ho'],
  Australia: ['Oliver', 'Noah', 'Jack', 'Henry', 'William', 'Leo', 'Lucas', 'Thomas'],
  'New Zealand': ['Oliver', 'Noah', 'Leo', 'Jack', 'Lucas', 'Ezra', 'Hudson', 'Liam'],
  'Papua New Guinea': ['John', 'Paul', 'David', 'Samuel', 'Michael', 'Peter', 'Junior'],
  Fiji: ['Tevita', 'Sisa', 'Filimoni', 'Jone', 'Mosese', 'Ratu', 'Waisea', 'Viliame'],
  Mexico: ['Santiago', 'Mateo', 'Matías', 'Diego', 'Sebastian', 'Leonardo', 'Emiliano'],
  'United States': ['Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry'],
  'Costa Rica': ['Mateo', 'Santiago', 'Thiago', 'Sebastian', 'Gabriel', 'Felipe', 'Lucas'],
};

const LAST_NAMES_BY_COUNTRY: Record<string, string[]> = {
  Spain: ['Martínez', 'García', 'López', 'González', 'Rodríguez', 'Fernández', 'Pérez'],
  England: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Davies'],
  France: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit'],
  Germany: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner'],
  Netherlands: ['de Jong', 'Jansen', 'de Vries', 'van de Berg', 'Bakker', 'Smit', 'Meijer'],
  Portugal: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues'],
  Italy: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo'],
  Croatia: ['Horvat', 'Kovačić', 'Babić', 'Jurić', 'Novak', 'Petrović', 'Marić'],
  Argentina: ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez'],
  Brazil: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Ferreira', 'Lima'],
  Uruguay: ['Rodríguez', 'González', 'Gómez', 'Fernández', 'López', 'Pérez', 'Silva'],
  Ecuador: ['Zambrano', 'Sánchez', 'Mendoza', 'Vera', 'Cedeño', 'Morales', 'López'],
  Colombia: ['Rodríguez', 'Gómez', 'González', 'Martínez', 'García', 'López', 'Hernández'],
  Egypt: ['Mohamed', 'Hassan', 'Ali', 'Ibrahim', 'Ahmed', 'Mahmoud', 'Elsayed'],
  'South Africa': ['Dlamini', 'Nkosi', 'Ndlovu', 'Sithole', 'Khumalo', 'Mokoena', 'Makhanya'],
  Morocco: ['Alaoui', 'Bennani', 'El Amrani', 'Chraibi', 'Idrissi', 'Berrada', 'El Mansouri'],
  "Côte d'Ivoire": ['Kouassi', 'Koffi', 'Koné', 'Yao', 'Diallo', 'Touré', 'Traoré'],
  Senegal: ['Ndiaye', 'Diop', 'Sow', 'Faye', 'Ba', 'Diallo', 'Fall'],
  'DR Congo': ['Lukaku', 'Kabamba', 'Mukendi', 'Ilunga', 'Tshilombo', 'Mbala', 'Kazadi'],
  'Saudi Arabia': ['Al-Harbi', 'Al-Ghamdi', 'Al-Qahtani', 'Al-Otaibi', 'Al-Dosari', 'Al-Shehri'],
  Japan: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto'],
  'South Korea': ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho'],
  Australia: ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Johnson'],
  'New Zealand': ['Smith', 'Wilson', 'Brown', 'Williams', 'Jones', 'Taylor', 'Patel'],
  'Papua New Guinea': ['Kila', 'Waqa', 'Pora', 'Kare', 'Aua', 'Mani', 'Vele'],
  Fiji: ['Tawake', 'Ratuvou', 'Nakarawa', 'Naivalu', 'Vatubua', 'Cakobau', 'Burotu'],
  Mexico: ['Hernández', 'García', 'Martínez', 'López', 'González', 'Pérez', 'Rodríguez'],
  'United States': ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'],
  'Costa Rica': ['Mora', 'Jiménez', 'González', 'Rodríguez', 'Vargas', 'Monge', 'Castro'],
};

export const FEDERATION_CLUB_POOLS: Record<FederationName, FederationClubTemplate[]> = Object.fromEntries(
  Object.entries(RAW_FEDERATION_CLUB_POOLS).map(([fed, clubs]) => {
    const federation = fed as FederationName;
    const hydrated = clubs.map((tmpl, idx) => {
      const baseOvr =
        federation === 'UEFA'
          ? 52 - Math.min(4, Math.floor(idx / 3))
          : federation === 'CONMEBOL'
          ? 50 - Math.min(4, Math.floor(idx / 2))
          : federation === 'CAF' || federation === 'CONCACAF'
          ? 48 - Math.min(3, Math.floor(idx / 2))
          : federation === 'AFC'
          ? 47 - Math.min(3, Math.floor(idx / 2))
          : 44 - Math.min(2, idx);

      const kit: KitConfig = {
        style: 'normal',
        color1: tmpl.primaryColor,
        color2: tmpl.secondaryColor,
        pattern: idx % 3 === 0 ? 'stripes' : idx % 3 === 1 ? 'solid' : 'sash',
        collar: 'crew',
      };

      const scaled = getYouthScaledTeamAndPlayers(
        {
          id: tmpl.id,
          name: tmpl.name,
          country: tmpl.country,
          federation: tmpl.federation,
          flag: tmpl.flag,
          ovr: baseOvr,
          primaryColor: tmpl.primaryColor,
          secondaryColor: tmpl.secondaryColor,
          preferredFormation: tmpl.preferredFormation,
          tierClass: 'big',
          kit,
        },
        16,
        'intl_cup'
      );

      return {
        ...tmpl,
        ovr: scaled.teamOvr,
        teamOvr: scaled.teamOvr,
        attOvr: scaled.attOvr,
        midOvr: scaled.midOvr,
        defOvr: scaled.defOvr,
        kit,
        players: scaled.players,
        representativePlayers: scaled.representativePlayers,
      };
    });

    return [federation, hydrated];
  })
) as Record<FederationName, FederationClubTemplate[]>;

export function getAllIntlYouthPoolTemplates(): FederationClubTemplate[] {
  return Object.values(FEDERATION_CLUB_POOLS).flat();
}

export function getIntlYouthPoolClubScaledSquad(
  clubIdOrName: FederationClubTemplate | string,
  age: number = 16
): YouthScaledTeamResult | null {
  const tmpl =
    typeof clubIdOrName === 'string'
      ? getAllIntlYouthPoolTemplates().find(
          (c) =>
            c.id.toLowerCase() === clubIdOrName.toLowerCase() ||
            c.name.toLowerCase() === clubIdOrName.toLowerCase()
        )
      : clubIdOrName;
  if (!tmpl) return null;

  return getYouthScaledTeamAndPlayers(
    {
      id: tmpl.id,
      name: tmpl.name,
      country: tmpl.country,
      federation: tmpl.federation,
      flag: tmpl.flag,
      primaryColor: tmpl.primaryColor,
      secondaryColor: tmpl.secondaryColor,
      preferredFormation: tmpl.preferredFormation,
      tierClass: 'big',
      kit: tmpl.kit,
    },
    age,
    'intl_cup'
  );
}

export function getAllIntlYouthPoolClubs(age: number = 16): Array<InternationalYouthClub & { players: PlayerCardData[] }> {
  return getAllIntlYouthPoolTemplates().map((tmpl) => {
    const scaled =
      age === 16 && tmpl.players && tmpl.players.length === 23 && tmpl.representativePlayers
        ? null
        : getIntlYouthPoolClubScaledSquad(tmpl, age);
    return {
      id: tmpl.id,
      name: tmpl.name,
      country: tmpl.country,
      federation: tmpl.federation,
      flag: tmpl.flag,
      primaryColor: tmpl.primaryColor,
      secondaryColor: tmpl.secondaryColor,
      preferredFormation: tmpl.preferredFormation,
      teamOvr: scaled ? scaled.teamOvr : tmpl.teamOvr || 68,
      attOvr: scaled ? scaled.attOvr : tmpl.attOvr || 68,
      midOvr: scaled ? scaled.midOvr : tmpl.midOvr || 68,
      defOvr: scaled ? scaled.defOvr : tmpl.defOvr || 68,
      representativePlayers: scaled
        ? scaled.representativePlayers
        : tmpl.representativePlayers || [],
      sourceType: 'federation_pool',
      players: scaled ? scaled.players : tmpl.players || [],
    };
  });
}

export function createRepresentativePlayers(
  clubName: string,
  country: string,
  teamOvr: number,
  attOvr: number,
  midOvr: number,
  defOvr: number
): RepresentativePlayer[] {
  // Check if this club belongs to the 48 Int'l Youth Pool clubs and return synced stars
  const matchedPool = getAllIntlYouthPoolTemplates().find(
    (c) => c.name.toLowerCase() === clubName.toLowerCase()
  );
  if (matchedPool && matchedPool.representativePlayers && matchedPool.representativePlayers.length === 4) {
    return matchedPool.representativePlayers.map((rep) => ({
      ...rep,
      ovr:
        rep.position === 'GK' || rep.position === 'DEF'
          ? Math.max(35, Math.min(99, Math.round((rep.ovr + defOvr) / 2)))
          : rep.position === 'MID'
          ? Math.max(35, Math.min(99, Math.round((rep.ovr + midOvr) / 2)))
          : Math.max(35, Math.min(99, Math.round((rep.ovr + attOvr) / 2))),
    }));
  }

  // Deterministically generate a 23-player scaled roster for custom/league clubs and extract top 4 reps
  const scaled = getYouthScaledTeamAndPlayers(
    {
      id: clubName.toLowerCase().replace(/\s+/g, '-'),
      name: clubName,
      country,
      ovr: Math.max(38, Math.min(60, teamOvr - 20)),
    },
    16,
    'intl_cup'
  );
  return scaled.representativePlayers;
}
