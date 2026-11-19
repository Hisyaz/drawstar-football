import React, { useState, useMemo } from 'react';
import { PlayerConfig, PlayerCardData, ManagerState, AccountingState } from '../types';
import {
  calculateEffectiveFame,
  isPlayerFromSouthAmericanYouthLeague,
  isPlayerStartedInArgentina,
  isPlayerStartedInBrazil,
} from '../utils/professionalOfferEligibility';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';

const triggerConfetti = () => {
  if (shouldDisableParticles()) return;
  try {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    } else if ((confetti as any)?.default && typeof (confetti as any).default === 'function') {
      (confetti as any).default({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    }
  } catch (e) {
    // ignore
  }
};
import {
  Trophy,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Banknote,
  Star,
  Clock,
  ShieldCheck,
  TrendingUp,
  Building2,
  Camera,
  Shirt,
  Users,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

export interface HotProspectClubPitch {
  id: string;
  clubName: string;
  shortName: string;
  badgeBg: string;
  countryName: string;
  leagueName: string;
  stadiumName: string;
  managerName: string;
  primaryAdvantage: 'Salary' | 'Starting role' | 'Contract length' | 'Release clause' | 'Development' | 'Prestige';
  advantageHighlight: string;
  weeklyWage: number;
  yearlySalary: number;
  signingBonus: number;
  contractYears: number;
  releaseClause: number;
  startingRole: string;
  roleDescription: string;
  developmentPoints: number;
  developmentPhilosophy: string;
  prestigeHonors: string;
  managerQuote: string;
  firstDayNarrative: {
    stadiumArrival: string;
    pressConferenceQuote: string;
    fanReaction: string;
  };
}

interface HotProspectEventModalProps {
  isOpen: boolean;
  player: PlayerConfig | PlayerCardData;
  manager?: ManagerState | null;
  accounting?: AccountingState;
  onCompleteTransfer: (selectedPitch: HotProspectClubPitch) => void;
  onClose: () => void;
}

export const HotProspectEventModal: React.FC<HotProspectEventModalProps> = ({
  isOpen,
  player,
  manager,
  accounting,
  onCompleteTransfer,
  onClose,
}) => {
  const [selectedClubIndex, setSelectedClubIndex] = useState<number>(0);
  const [stage, setStage] = useState<'selection' | 'first_day'>('selection');

  const ovr = player.ovr || 85;
  const effectiveFame = calculateEffectiveFame(player.fame || 0, manager);
  const isSouthAmericanYouth = isPlayerFromSouthAmericanYouthLeague(player);

  const eligiblePitches: HotProspectClubPitch[] = useMemo(() => {
    const basePitches: HotProspectClubPitch[] = [
      {
        id: 'hot_atletico',
        clubName: 'Atlético Aviación',
        shortName: 'Aviación',
        badgeBg: 'from-red-800 via-blue-900 to-slate-950',
        countryName: 'Spain',
        leagueName: 'Spanish League',
        stadiumName: 'Aviación Metropolitano',
        managerName: 'Diego Simeone',
        primaryAdvantage: 'Prestige',
        advantageHighlight: 'European Winners League Constant Contenders & Fearless Defensive Tenacity',
        weeklyWage: 135000,
        yearlySalary: 135000 * 52,
        signingBonus: 3500000,
        contractYears: 5,
        releaseClause: 130000000,
        startingRole: 'Key Senior Starter',
        roleDescription: 'Direct inclusion in Simeone’s intense pressing machine contesting Spanish League & European Winners League.',
        developmentPoints: 245,
        developmentPhilosophy: 'High-Intensity Tactical Fortitude & Unbreakable Mentality',
        prestigeHonors: '11x Spanish League Titles, 3x European Euroleague, 3x European Winners League Finalists',
        managerQuote: '"At Atlético Aviación, we don’t just admire talent; we demand courage and sacrifice. You have both."',
        firstDayNarrative: {
          stadiumArrival:
            'You step onto the pristine turf of the Aviación Metropolitano as thousands of Rojiblancos cheer from the stands. Diego Simeone presents you with the iconic red-and-white stripes.',
          pressConferenceQuote:
            '"We signed a warrior with world-class feet. This club plays with heart, and today our future arrives."',
          fanReaction:
            'Madrid Sports Daily: "THE CHOSEN WARRIOR: Simeone secures Europe\'s most ferocious young prodigy!"',
        },
      },
      {
        id: 'hot_juventus',
        clubName: 'Piemonte Bianconeri FC',
        shortName: 'Piemonte',
        badgeBg: 'from-neutral-900 via-slate-800 to-amber-500',
        countryName: 'Italy',
        leagueName: 'Italian League',
        stadiumName: 'Torino Bianconeri Stadium',
        managerName: 'Thiago Motta',
        primaryAdvantage: 'Salary',
        advantageHighlight: 'Regal Italian Wage Package (€160k/wk) & Sovereign Silverware Pedigree',
        weeklyWage: 160000,
        yearlySalary: 160000 * 52,
        signingBonus: 4200000,
        contractYears: 4,
        releaseClause: 110000000,
        startingRole: 'Undisputed Focal Talisman',
        roleDescription: 'Guaranteed centerpiece of the Bianconeri tactical project targeting the Italian League.',
        developmentPoints: 235,
        developmentPhilosophy: 'Tactical Precision, Tactical Versatility & Winning DNA',
        prestigeHonors: '36x Italian League Titles, 15x Italian Cup, 2x European Champions',
        managerQuote: '"Fino Alla Fine. Piemonte Bianconeri exists solely to win trophies. We want you to be the crown jewel of our attack."',
        firstDayNarrative: {
          stadiumArrival:
            'A private jet delivers you to Turin. Flanked by club icons in the trophy room, you sign your contract beneath 36 Italian championship trophies.',
          pressConferenceQuote:
            '"Piemonte Bianconeri is royalty. We only recruit players who can bear the weight of black-and-white greatness."',
          fanReaction:
            'Torino Sports Daily: "PIEMONTE SCOOPS GENERATIONAL JEWEL: The new era of Turin dominance begins!"',
        },
      },
      {
        id: 'hot_benfica',
        clubName: 'Águias Encarnadas SL',
        shortName: 'Águias SL',
        badgeBg: 'from-red-700 via-rose-900 to-amber-400',
        countryName: 'Portugal',
        leagueName: 'Portuguese League',
        stadiumName: 'Estádio da Luz Sul (Lisbon)',
        managerName: 'Bruno Lage',
        primaryAdvantage: 'Release clause',
        advantageHighlight: 'Stepping-Stone Strategic Buyout Clause (€85M) & Premier Continental Showcase',
        weeklyWage: 95000,
        yearlySalary: 95000 * 52,
        signingBonus: 3000000,
        contractYears: 4,
        releaseClause: 85000000,
        startingRole: 'Marquee Attacking Lead',
        roleDescription: 'Complete freedom to express your football in the European Winners League spotlight.',
        developmentPoints: 265,
        developmentPhilosophy: 'World-Renowned Seixal Campus Technical Mastery',
        prestigeHonors: '38x Portuguese Championships, 2x European Cup Champions',
        managerQuote: '"Lisbon\'s red cathedral is the finest stage on earth for young artists. We will turn your talent into a legend."',
        firstDayNarrative: {
          stadiumArrival:
            'Beneath the majestic flight of the club eagle in Lisbon, club legends welcome you into the cathedral of Portuguese football.',
          pressConferenceQuote:
            '"Águias Encarnadas gives young talent the entire world. Here, you will shine across Europe with zero fear."',
          fanReaction:
            'Lisbon Chronicle: "O NOVO REI ENCARNADO: Águias lands the continent’s most sought-after wunderkind!"',
        },
      },
      {
        id: 'hot_dortmund',
        clubName: 'Westfalen Schwarzgelb BVB',
        shortName: 'Westfalen',
        badgeBg: 'from-yellow-400 via-amber-500 to-slate-950',
        countryName: 'Germany',
        leagueName: 'German League',
        stadiumName: 'Westfalen Yellow Wall Park',
        managerName: 'Nuri Şahin',
        primaryAdvantage: 'Development',
        advantageHighlight: 'Global #1 Prodigy Development Engine (+260 Pts/Yr) & 81,000 Yellow Wall Passion',
        weeklyWage: 125000,
        yearlySalary: 125000 * 52,
        signingBonus: 3800000,
        contractYears: 5,
        releaseClause: 95000000,
        startingRole: 'Key Starter & Offensive Leader',
        roleDescription: 'Heavy regular minutes in the German League and European Winners League.',
        developmentPoints: 260,
        developmentPhilosophy: 'Westfalen High-Velocity Youth Incubation & Vertical Mastery',
        prestigeHonors: '8x German Championships, 1997 European Winners League Winners',
        managerQuote: '"The Westfalen Stadium was built for players who thrill. 81,000 fans in the Yellow Wall will roar for you."',
        firstDayNarrative: {
          stadiumArrival:
            'Walking out of the tunnel into the imposing Yellow Wall in North Rhine-Westphalia, club executives hand you the black-and-yellow shirt amidst flashes from international journalists.',
          pressConferenceQuote:
            '"Westfalen Schwarzgelb is where great talent becomes immortal. We give our young masters the keys to the pitch."',
          fanReaction:
            'Ruhr Sports Review: "GELBE WAND JUBELT: Westfalen beats the world to generational prodigy!"',
        },
      },
      {
        id: 'hot_monaco',
        clubName: 'Principauté Rouge AS',
        shortName: 'Principauté',
        badgeBg: 'from-red-600 via-rose-700 to-slate-900',
        countryName: 'France',
        leagueName: 'French League',
        stadiumName: 'Stade de la Principauté (Fontvieille)',
        managerName: 'Adi Hütter',
        primaryAdvantage: 'Starting role',
        advantageHighlight: 'Guaranteed Immediate Key Starter Status & Principality Luxury Tax-Free Package',
        weeklyWage: 145000,
        yearlySalary: 145000 * 52,
        signingBonus: 3900000,
        contractYears: 4,
        releaseClause: 90000000,
        startingRole: 'Undisputed Starting Star',
        roleDescription: 'Immediate first-name on the team sheet contesting French League and European competitions.',
        developmentPoints: 240,
        developmentPhilosophy: 'French Riviera Technical Polish & Explosive Transition Football',
        prestigeHonors: '8x French League Titles, 5x French Cup, European Winners League Semifinalists',
        managerQuote: '"At Principauté Rouge, you get elite European football with the absolute freedom to lead our squad."',
        firstDayNarrative: {
          stadiumArrival:
            'Overlooking the Mediterranean yacht harbor, you complete your medical and sign your deal at the Riviera training center.',
          pressConferenceQuote:
            '"Principauté Rouge AS is an incubator of world champions. Today, the next global superstar joins the club."',
          fanReaction:
            'Riviera Sports: "LE COEUR DU ROCHER: Principauté Rouge signs generational dynamo to orchestrate French League title charge!"',
        },
      },
      {
        id: 'hot_lille',
        clubName: 'Flandres Dogues SC',
        shortName: 'Flandres',
        badgeBg: 'from-red-600 via-red-800 to-blue-950',
        countryName: 'France',
        leagueName: 'French League',
        stadiumName: 'Grand Stade du Nord (Flandres)',
        managerName: 'Bruno Génésio',
        primaryAdvantage: 'Development',
        advantageHighlight: 'Top-Tier French Talent Incubator (+255 Pts/Yr) & Proven Global Supercarrier',
        weeklyWage: 110000,
        yearlySalary: 110000 * 52,
        signingBonus: 3200000,
        contractYears: 5,
        releaseClause: 80000000,
        startingRole: 'Marquee Attacking Lead',
        roleDescription: 'Immediate starting keys to the Flandres offensive engine competing in French League and Europe.',
        developmentPoints: 255,
        developmentPhilosophy: 'Northern French Elite Academy Polish & Direct High-Pace Transition Football',
        prestigeHonors: '4x French League Champions, 6x French Cup, 2021 French Supercup Winners',
        managerQuote: '"Flandres Dogues launched world-class superstars. Here, you get immediate responsibility and the tactical freedom to explode."',
        firstDayNarrative: {
          stadiumArrival:
            'Under the retractable roof of the Grand Stade du Nord, the Dogues unveil you before thousands of passionate northern French supporters.',
          pressConferenceQuote:
            '"Flandres develops winners. We do not wait on world-class potential; we unleash it immediately onto the pitch."',
          fanReaction:
            'Nord Football Daily: "LE PRODIGE DU NORD: Flandres Dogues wins international tug-of-war for wonderkid!"',
        },
      },
      {
        id: 'hot_inter',
        clubName: 'Nerazzurri Milano',
        shortName: 'Nerazzurri',
        badgeBg: 'from-blue-600 via-blue-900 to-slate-950',
        countryName: 'Italy',
        leagueName: 'Italian League',
        stadiumName: 'Stadio Giuseppe Meazza',
        managerName: 'Simone Inzaghi',
        primaryAdvantage: 'Prestige',
        advantageHighlight: 'Reigning Italian Champions & 20-Time Italian Champions (Second Star Royalty)',
        weeklyWage: 165000,
        yearlySalary: 165000 * 52,
        signingBonus: 4400000,
        contractYears: 5,
        releaseClause: 125000000,
        startingRole: 'Marquee Starting Talisman',
        roleDescription: 'Pivotal catalyst in Inzaghi’s devastating 3-5-2 system dominating Italian and European football.',
        developmentPoints: 245,
        developmentPhilosophy: 'Nerazzurri Tactical Fluidity, Ruthless Efficiency & European Winners League Mastery',
        prestigeHonors: '20x Italian League Titles (Second Star), 3x European Winners League, 9x Italian Cup',
        managerQuote: '"Nerazzurri Milano represents glory and historic passion. Put on the black-and-blue stripes and cement your name in Milanese lore."',
        firstDayNarrative: {
          stadiumArrival:
            'Arriving at the Appiano Gentile training centre, club directors personally welcome you with the famous black-and-blue shirt.',
          pressConferenceQuote:
            '"Nerazzurri Milano only targets difference-makers. This player has the courage to wear our second star."',
          fanReaction:
            'Milano Gazzetta: "NERAZZURRO DA SOGNO: Nerazzurri Milano signs generational maestro to ignite the Meazza!"',
        },
      },
      {
        id: 'hot_milan',
        clubName: 'Rossoneri Calcio',
        shortName: 'Rossoneri',
        badgeBg: 'from-red-600 via-rose-900 to-neutral-950',
        countryName: 'Italy',
        leagueName: 'Italian League',
        stadiumName: 'Stadio San Siro Milano',
        managerName: 'Paulo Fonseca',
        primaryAdvantage: 'Prestige',
        advantageHighlight: '7x European Winners League Aristocracy & Iconic Milanello Heritage',
        weeklyWage: 155000,
        yearlySalary: 155000 * 52,
        signingBonus: 4100000,
        contractYears: 5,
        releaseClause: 120000000,
        startingRole: 'Key Attacking Conductor',
        roleDescription: 'Centerpiece of the Rossoneri tactical project hunting European and domestic silverware.',
        developmentPoints: 240,
        developmentPhilosophy: 'Milanello Laboratory Precision, Aesthetic Flair & European Aristocracy',
        prestigeHonors: '7x European Winners League Champions, 19x Italian League Titles, 5x Supereurocups',
        managerQuote: '"Rossoneri Calcio is the home of legends. From iconic defenders to Ballon d\'Or icons, this shirt demands greatness. You were born for this stage."',
        firstDayNarrative: {
          stadiumArrival:
            'At Casa Rossonera, you walk past the gleaming room of seven European Cups before holding up the red-and-black shirt before cheering tifosi.',
          pressConferenceQuote:
            '"Rossoneri Calcio doesn’t buy hype; we create icons. Today, our newest superstar enters the San Siro."',
          fanReaction:
            'Corriere dello Sport: "COLPACCIO ROSSONERO: Rossoneri Calcio secures world football\'s hottest teenage jewel!"',
        },
      },
      {
        id: 'hot_porto',
        clubName: 'Invicta Dragões FC',
        shortName: 'Invicta',
        badgeBg: 'from-blue-700 via-blue-950 to-amber-400',
        countryName: 'Portugal',
        leagueName: 'Portuguese League',
        stadiumName: 'Estádio dos Dragões (Invicta)',
        managerName: 'Vítor Bruno',
        primaryAdvantage: 'Release clause',
        advantageHighlight: 'Strategic Stepping-Stone Release Clause (€80M) & Fierce Dragons Competitive Grit',
        weeklyWage: 95000,
        yearlySalary: 95000 * 52,
        signingBonus: 3100000,
        contractYears: 4,
        releaseClause: 80000000,
        startingRole: 'Primary Offensive Starter',
        roleDescription: 'Unrestricted creative license spearheading the Dragões title assault and European Winners League clashes.',
        developmentPoints: 260,
        developmentPhilosophy: 'Raça Dragão (Dragon Spirit), High-Intensity Pressing & South American-European Fusion',
        prestigeHonors: '30x Portuguese Champions, 2x European Winners League Champions, 2x European Euroleague',
        managerQuote: '"At Invicta Dragões, we forge fighters who play beautiful, devastating football. The northern fortress will be your kingdom."',
        firstDayNarrative: {
          stadiumArrival:
            'Inside the roaring northern fortress in Invicta, club directors unveil you flanked by blue smoke and the iconic dragon symbol.',
          pressConferenceQuote:
            '"Invicta Dragões has turned countless stars into European champions. You are our next masterpiece."',
          fanReaction:
            'Jornal do Norte: "RAÇA E MAGIA: Invicta Dragões signs brilliant phenom in blockbuster deal!"',
        },
      },
      {
        id: 'hot_leipzig',
        clubName: 'Messestadt Rot-Weiß',
        shortName: 'Messestadt',
        badgeBg: 'from-red-600 via-slate-800 to-amber-300',
        countryName: 'Germany',
        leagueName: 'German League',
        stadiumName: 'Zentralstadion Messestadt',
        managerName: 'Marco Rose',
        primaryAdvantage: 'Development',
        advantageHighlight: 'State-of-the-Art High-Speed Performance Academy (+265 Pts/Yr) & Relentless Vertical Gegenpressing',
        weeklyWage: 130000,
        yearlySalary: 130000 * 52,
        signingBonus: 3700000,
        contractYears: 5,
        releaseClause: 95000000,
        startingRole: 'Vital High-Press Engine',
        roleDescription: 'Dynamic starter executing lightning counter-attacks in the German League and European Winners League.',
        developmentPoints: 265,
        developmentPhilosophy: 'Hyper-Fast Transition Science, Biometric Optimization & Elite Youth Acceleration',
        prestigeHonors: '2x German Cup Champions, 1x German Supercup, European Winners League Semifinalists',
        managerQuote: '"We play the fastest, most aggressive tactical football in modern Europe. Our science and data will elevate your ceiling higher than anyone else can."',
        firstDayNarrative: {
          stadiumArrival:
            'Touring the multi-million euro Saxony Performance Academy, high-performance coaches present you with custom biometric metrics and your #7 shirt.',
          pressConferenceQuote:
            '"Messestadt Rot-Weiß provides the ultimate platform for generational athletes. We know how to take world-class talent to the absolute peak."',
          fanReaction:
            'Sachsen Sportblatt: "TURBO-TRANSFER: Messestadt Rot-Weiß secures international wonderkid in coup of the summer!"',
        },
      },
      {
        id: 'hot_como',
        clubName: 'Lario Azzurri Calcio',
        shortName: 'Lario',
        badgeBg: 'from-sky-700 via-blue-900 to-slate-900',
        countryName: 'Italy',
        leagueName: 'Italian League',
        stadiumName: 'Stadio Giuseppe Sinigaglia (Lakefront)',
        managerName: 'Cesc Fàbregas',
        primaryAdvantage: 'Starting role',
        advantageHighlight: 'Guaranteed Immediate Undisputed Starting Protagonist & Cesc Fàbregas Masterclass Mentorship',
        weeklyWage: 120000,
        yearlySalary: 120000 * 52,
        signingBonus: 3400000,
        contractYears: 4,
        releaseClause: 70000000,
        startingRole: 'Undisputed Franchise Protagonist',
        roleDescription: 'Given complete central keys to Fàbregas’s ambitious, possession-heavy Italian League revolution.',
        developmentPoints: 250,
        developmentPhilosophy: 'Elite Possession DNA, Modern Technical Courage & Lakefront Ambition',
        prestigeHonors: 'Italian League Rising Phenomenon, International Investment Project backed by World Champions',
        managerQuote: '"I came through Catalunya FC and Gunners FC as a teenager. I know exactly what a prodigy needs: absolute trust on the ball and the freedom to dictate the game. That is my promise to you."',
        firstDayNarrative: {
          stadiumArrival:
            'Stepping off a private wooden speedboat right at the lakefront dock of Stadio Sinigaglia, Cesc Fàbregas personally welcomes you with the Italian press looking on.',
          pressConferenceQuote:
            '"At Lario Azzurri, we are creating a unique, fearless project. This player has the vision and technique to make world football look at our lakefront."',
          fanReaction:
            'Sky Sport Italia: "LA RIVOLUZIONE DEL LARIO: Fàbregas convinces top global prospect to become the face of Lario Azzurri!"',
        },
      },
      {
        id: 'hot_napoli',
        clubName: 'Partenopei Napoli SSC',
        shortName: 'Partenopei',
        badgeBg: 'from-sky-500 via-blue-700 to-slate-950',
        countryName: 'Italy',
        leagueName: 'Italian League',
        stadiumName: 'Stadio San Paolo Partenopeo',
        managerName: 'Antonio Conte',
        primaryAdvantage: 'Salary',
        advantageHighlight: 'Lucrative Italian Salary Package (€150k/wk) & Eternal Neapolitan Religious Passion',
        weeklyWage: 150000,
        yearlySalary: 150000 * 52,
        signingBonus: 4000000,
        contractYears: 5,
        releaseClause: 115000000,
        startingRole: 'Crucial Senior Starter',
        roleDescription: 'Focal creative and physical force driving Antonio Conte’s relentless Italian League charge.',
        developmentPoints: 245,
        developmentPhilosophy: 'Conte High-Octane Work Ethic & Passionate Neapolitan Creative Freedom',
        prestigeHonors: '3x Italian League Titles, 6x Italian Cup, 1x European Euroleague',
        managerQuote: '"In Naples, football is religion. If you sweat for this city and fight for every ball, the Partenopei fans will revere you like a deity."',
        firstDayNarrative: {
          stadiumArrival:
            'Flashing blue smoke fills the streets of Fuorigrotta as you drive into the stadium. Thousands of Partenopei supporters chant your name outside.',
          pressConferenceQuote:
            '"Partenopei Napoli has a storied history with South American and world geniuses. This young man possesses that special spark."',
          fanReaction:
            'Il Mattino: "L\'EREDE PARTENOPEO: Naples explodes with joy as Conte secures generational superstar!"',
        },
      },
      {
        id: 'hot_betis',
        clubName: 'Heliópolis Verdiblanco',
        shortName: 'Heliópolis',
        badgeBg: 'from-emerald-600 via-green-800 to-amber-400',
        countryName: 'Spain',
        leagueName: 'Spanish League',
        stadiumName: 'Estadio de Heliópolis (Seville)',
        managerName: 'Manuel Pellegrini',
        primaryAdvantage: 'Starting role',
        advantageHighlight: 'Unquestioned Starting Playmaker Role & 60,000 Fanatical Verdiblancos Singing in Chorus',
        weeklyWage: 115000,
        yearlySalary: 115000 * 52,
        signingBonus: 3300000,
        contractYears: 4,
        releaseClause: 75000000,
        startingRole: 'Star Attacking Conductor',
        roleDescription: 'Total creative leadership in Pellegrini\'s free-flowing attacking brand in Spanish League and Europe.',
        developmentPoints: 245,
        developmentPhilosophy: 'El Ingeniero Technical Football, Joyful Seville Flair & Unconditional Fan Loyalty',
        prestigeHonors: '1x Spanish League Champions, 3x Spanish Cup Champions, Constant European Contenders',
        managerQuote: '"Heliópolis breathes joy and technical courage. With us, you will enjoy football every single weekend with 60,000 fans behind you."',
        firstDayNarrative: {
          stadiumArrival:
            'Under the warm Andalusian sun in Heliópolis, green-and-white flags wave as club legends and Manuel Pellegrini hand you the Verdiblanco jersey.',
          pressConferenceQuote:
            '"Heliópolis Verdiblanco is pure passion. We signed a player who understands the poetry of football and isn\'t afraid to attack."',
          fanReaction:
            'Andalucía Deportiva: "LOCURA VERDIBLANCA: Heliópolis seals dream transfer for international prodigy!"',
        },
      },
      {
        id: 'hot_sevilla',
        clubName: 'Nervión Rojiblancos FC',
        shortName: 'Nervión',
        badgeBg: 'from-red-600 via-rose-800 to-slate-900',
        countryName: 'Spain',
        leagueName: 'Spanish League',
        stadiumName: 'Coliseo de Nervión',
        managerName: 'García Pimienta',
        primaryAdvantage: 'Prestige',
        advantageHighlight: '7x European Euroleague Kings & Nervión European Mystique',
        weeklyWage: 120000,
        yearlySalary: 120000 * 52,
        signingBonus: 3500000,
        contractYears: 4,
        releaseClause: 80000000,
        startingRole: 'Integral Senior Starter',
        roleDescription: 'Direct first-choice starter leading Nervión\'s resurgence in Spanish League and European knockouts.',
        developmentPoints: 240,
        developmentPhilosophy: 'Casta y Coraje (Courage and Heart), Intense Andalusian Pressure & Positional Football',
        prestigeHonors: '7x European Euroleague Champions (Record Holders), 1x Spanish League, 5x Spanish Cup',
        managerQuote: '"Here in Nervión, magical European nights are born. We play with \'Casta y Coraje\'. You have the heart to conquer Seville."',
        firstDayNarrative: {
          stadiumArrival:
            'Standing beneath the famous mosaic in Nervión, club officials present you with the white-and-red shirt as the club anthem blasts through the stadium.',
          pressConferenceQuote:
            '"Nervión Rojiblancos never surrenders. Today we add a footballer capable of changing any game on the continent."',
          fanReaction:
            'Diario de Nervión: "CASTA Y CORAJE: Nervión Rojiblancos beats continental giants to signature of young virtuoso!"',
        },
      },
      {
        id: 'hot_villarreal',
        clubName: 'Plana Baixa Amarillo CF',
        shortName: 'Plana Baixa',
        badgeBg: 'from-yellow-400 via-amber-500 to-blue-900',
        countryName: 'Spain',
        leagueName: 'Spanish League',
        stadiumName: 'Estadio de la Plana',
        managerName: 'Marcelino García Toral',
        primaryAdvantage: 'Development',
        advantageHighlight: 'World-Renowned Levante Sports City (+250 Pts/Yr) & Yellow Submarine European Pedigree',
        weeklyWage: 118000,
        yearlySalary: 118000 * 52,
        signingBonus: 3300000,
        contractYears: 5,
        releaseClause: 85000000,
        startingRole: 'Key Starting Forward/Midfielder',
        roleDescription: 'Starting linchpin in Marcelino\'s lethal structured counter-attacking system.',
        developmentPoints: 250,
        developmentPhilosophy: 'Yellow Submarine Technical Precision, Academy Excellence & Tactically Disciplined Freedom',
        prestigeHonors: '2021 European Euroleague Champions, European Winners League Semifinalists (2006, 2022)',
        managerQuote: '"Plana Baixa Amarillo has shown the entire world that a focused club with elite training can defeat giants like Bavaria Rot and Red Devils United. Here, your development is sacred."',
        firstDayNarrative: {
          stadiumArrival:
            'At the modern Estadio de la Plana, club directors give you a personal tour of the yellow fortress before the official photo call.',
          pressConferenceQuote:
            '"We don\'t sign players just for a season; we build careers. This is one of the most exciting signings in Plana Baixa\'s history."',
          fanReaction:
            'El Periódico Mediterráneo: "EL SUBMARINO BOMBARDEA: Plana Baixa signs extraordinary prospect to lead Spanish League campaign!"',
        },
      },
      {
        id: 'hot_sporting',
        clubName: 'Alvalade Leões CP',
        shortName: 'Alvalade CP',
        badgeBg: 'from-emerald-700 via-green-900 to-amber-400',
        countryName: 'Portugal',
        leagueName: 'Portuguese League',
        stadiumName: 'Estádio de Alvalade (Lisbon)',
        managerName: 'João Pereira',
        primaryAdvantage: 'Development',
        advantageHighlight: 'Legendary Alcochete Academy (+260 Pts/Yr) & Reigning Portuguese Champions',
        weeklyWage: 100000,
        yearlySalary: 100000 * 52,
        signingBonus: 3100000,
        contractYears: 5,
        releaseClause: 85000000,
        startingRole: 'Marquee Starting Talisman',
        roleDescription: 'Complete tactical freedom leading Alvalade Leões\'s title defense and European Winners League campaign.',
        developmentPoints: 260,
        developmentPhilosophy: 'Alcochete Academy Technical Wizardry, Dynamic 3-4-3 Fluency & Youth Fearlessness',
        prestigeHonors: '20x Portuguese League Champions, 17x Portuguese Cup, European Cup Winners\' Cup Champions',
        managerQuote: '"Our academy produced Ballon d\'Or icons and continental champions. Alvalade is where legends take flight. The green-and-white faithful will adore you."',
        firstDayNarrative: {
          stadiumArrival:
            'Inside the green-and-white sanctuary in Alvalade, club directors hand you the green-and-white hoops in front of the club museum.',
          pressConferenceQuote:
            '"Alvalade Leões creates kings of football. Today we welcome a talent who embodies our motto: Effort, Dedication, Devotion, and Glory."',
          fanReaction:
            'Jornal de Lisboa: "O NOVO LEÃO DE ALVALADE: Alvalade CP secures generational talent to defend the throne!"',
        },
      },
    ];

    // Argentine Giants (Included if you start in Argentina)
    const bocaPitch: HotProspectClubPitch = {
      id: 'hot_boca_juniors',
      clubName: 'Xeneizes Juniors',
      shortName: 'Xeneizes',
      badgeBg: 'from-blue-700 via-blue-900 to-yellow-400',
      countryName: 'Argentina',
      leagueName: 'Argentinean League',
      stadiumName: 'La Caja (Buenos Aires)',
      managerName: 'Fernando Gago',
      primaryAdvantage: 'Prestige',
      advantageHighlight: 'The Temple of La Ribera • The Greatest Mystique in South America & La 12',
      weeklyWage: 92000,
      yearlySalary: 92000 * 52,
      signingBonus: 2700000,
      contractYears: 4,
      releaseClause: 65000000,
      startingRole: 'Marquee Xeneize Talisman Starter',
      roleDescription: 'Directly handed the iconic #10 shirt to conduct Xeneizes Juniors in the Copa De Proceres and Superclásico.',
      developmentPoints: 235,
      developmentPhilosophy: 'Mística Xeneize, Garra & Fearless Argentine Street Creativity (Potrero)',
      prestigeHonors: '6x Copa De Proceres, 3x Continental Championship Champions (defeating Blancos CF & Rossoneri), 35x Argentinean League',
      managerQuote: '"Our stadium doesn\'t tremble; its heart beats. Wearing the blue and gold is the ultimate dream of every Argentine boy. You will be a legend here."',
      firstDayNarrative: {
        stadiumArrival:
          'Stepping out of the tunnel onto the shaking pitch as 54,000 Xeneizes chant in unison, club legends personally welcome you and hand you the blue-and-gold shirt.',
        pressConferenceQuote:
          '"Xeneizes Juniors is the biggest club in the world in feeling. This young man plays with the courage and magic required in our stadium."',
        fanReaction:
          'Diario Olé: "¡BOMBAZO XENEIZE! Xeneizes Juniors secures generational potrero prodigy for Copa De Proceres title quest!"',
      },
    };

    const riverPitch: HotProspectClubPitch = {
      id: 'hot_river_plate',
      clubName: 'Millonarios Plate',
      shortName: 'Millonarios',
      badgeBg: 'from-neutral-100 via-red-600 to-slate-900',
      countryName: 'Argentina',
      leagueName: 'Argentinean League',
      stadiumName: 'Estadio Monumental de Núñez (Buenos Aires)',
      managerName: 'Marcelo Gallardo',
      primaryAdvantage: 'Prestige',
      advantageHighlight: 'El Más Grande • 84,500 Fans in Núñez & Marcelo Gallardo Elite Championship Culture',
      weeklyWage: 95000,
      yearlySalary: 95000 * 52,
      signingBonus: 2800000,
      contractYears: 4,
      releaseClause: 70000000,
      startingRole: 'Marquee Millonario Playmaker',
      roleDescription: 'Focal creative brain in Marcelo Gallardo\'s high-pressing, aesthetic football aiming for continental glory.',
      developmentPoints: 240,
      developmentPhilosophy: 'Paladar Negro Elegance, Gallardo Relentless Pressure & World-Renowned Núñez Academy Heritage',
      prestigeHonors: '4x Copa De Proceres Champions (including 2018), 38x Argentinean League Titles, 1x Continental Championship',
      managerQuote: '"At Millonarios Plate, victory is not enough; we must win with elegance, courage, and relentless hunger. You have the exact talent to lead our team."',
      firstDayNarrative: {
        stadiumArrival:
          'Before 84,500 roaring Millonarios in Núñez, Marcelo Gallardo presents you with the famous red-sash white jersey amidst red smoke and fireworks.',
        pressConferenceQuote:
          '"Millonarios Plate demands absolute footballing excellence. This player possesses the paladar negro and fire to make history here."',
        fanReaction:
          'Buenos Aires Sports: "EL NUEVO PRÍNCIPE DE NÚÑEZ: Millonarios Plate signs dream wunderkind to lead Gallardo\'s dream project!"',
      },
    };

    // Brazilian Giants (Included if starting in Brazil)
    const flamengoPitch: HotProspectClubPitch = {
      id: 'hot_flamengo',
      clubName: 'Gávea Rubro-Negro CR',
      shortName: 'Gávea CR',
      badgeBg: 'from-red-900 via-rose-950 to-neutral-950',
      countryName: 'Brazil',
      leagueName: 'Brazilian League',
      stadiumName: 'Estádio da Gávea / Maracanã (Rio de Janeiro)',
      managerName: 'Filipe Luís',
      primaryAdvantage: 'Prestige',
      advantageHighlight: '45 Million Nação Rubro-Negra & Iconic Rio Talisman Status',
      weeklyWage: 95000,
      yearlySalary: 95000 * 52,
      signingBonus: 2800000,
      contractYears: 4,
      releaseClause: 70000000,
      startingRole: 'Marquee Talisman Starter',
      roleDescription: 'Central idol of Brazilian football commanding the attack in Copa De Proceres.',
      developmentPoints: 225,
      developmentPhilosophy: 'Ninho Magic & Jogo Bonito Domination',
      prestigeHonors: '3x Copa De Proceres Champions, 8x Brazilian League, 1x Continental Championship',
      managerQuote: '"To wear the Manto Sagrado in Rio de Janeiro in front of 80,000 screaming fans is unlike anything in world football."',
      firstDayNarrative: {
        stadiumArrival:
          'A crowd of thousands of Rubro-Negro supporters gathers outside Gávea, setting off red-and-black flares as you hold up the legendary #10 jersey.',
        pressConferenceQuote:
          '"Playing for Gávea Rubro-Negro is being part of a nation. Today we welcome a true footballing magician."',
        fanReaction:
          'Rio Esporte: "O MANTO TEM NOVO DONO: Rio in ecstasy as Gávea Rubro-Negro signs prodigy!"',
      },
    };

    const corinthiansPitch: HotProspectClubPitch = {
      id: 'hot_corinthians',
      clubName: 'Itaquera Alvinegro SC',
      shortName: 'Itaquera',
      badgeBg: 'from-neutral-900 via-slate-800 to-neutral-950',
      countryName: 'Brazil',
      leagueName: 'Brazilian League',
      stadiumName: 'Arena de Itaquera (São Paulo)',
      managerName: 'Ramón Díaz',
      primaryAdvantage: 'Contract length',
      advantageHighlight: 'Fiel Torcida Unconditional Devotion & Optimal 4-Year European Gateway Deal',
      weeklyWage: 88000,
      yearlySalary: 88000 * 52,
      signingBonus: 2600000,
      contractYears: 4,
      releaseClause: 65000000,
      startingRole: 'Key Playmaking Starter',
      roleDescription: 'Commanding the midfield/attack with the backing of 35 million fanatical supporters.',
      developmentPoints: 220,
      developmentPhilosophy: 'Garra do Terrão & Relentless Competitive Spirit',
      prestigeHonors: '2x Club International Championship Champions, 1x Copa De Proceres, 7x Brazilian League',
      managerQuote: '"Here in Itaquera, you have the hunger, the spine, and the brilliance to become an idol in São Paulo."',
      firstDayNarrative: {
        stadiumArrival:
          'The deafening drums of the supporters echo outside the Arena de Itaquera. Club directors unveil you in front of a battery of South American cameras.',
        pressConferenceQuote:
          '"Itaquera Alvinegro is passion and struggle. You will feel the heartbeat of 35 million supporters every minute on the pitch."',
        fanReaction:
          'Gazeta Paulista: "A FIEL ENLOUQUECE: Itaquera secures generational talent with massive buyout clause!"',
      },
    };

    const palmeirasPitch: HotProspectClubPitch = {
      id: 'hot_palmeiras',
      clubName: 'Palestra Alviverde SE',
      shortName: 'Palestra',
      badgeBg: 'from-emerald-800 via-green-900 to-slate-950',
      countryName: 'Brazil',
      leagueName: 'Brazilian League',
      stadiumName: 'Parque Palestra (São Paulo)',
      managerName: 'Abel Ferreira',
      primaryAdvantage: 'Development',
      advantageHighlight: 'Modern South American Serial Winner & State-of-the-Art Academia de Futebol',
      weeklyWage: 98000,
      yearlySalary: 98000 * 52,
      signingBonus: 2900000,
      contractYears: 4,
      releaseClause: 75000000,
      startingRole: 'Primary Senior Weapon',
      roleDescription: 'Integral starting asset in Abel Ferreira’s ruthlessly organized championship machine.',
      developmentPoints: 235,
      developmentPhilosophy: 'Academia de Futebol Tactical Discipline & Relentless Winning Mentality',
      prestigeHonors: '3x Copa De Proceres Champions, 12x Brazilian League (Record Brazilian Champions)',
      managerQuote: '"We have the best sporting infrastructure and competitive discipline in the Americas. We will win everything together."',
      firstDayNarrative: {
        stadiumArrival:
          'Inside the modern Parque Palestra, head coach Abel Ferreira personally welcomes you to the tactical center before handing you your green-and-white shirt.',
        pressConferenceQuote:
          '"We don’t settle for being good; we want to dominate South America and compete globally. This player is ready."',
        fanReaction:
          'Brasil Esporte: "MAIOR CAMPEÃO DO BRASIL: Palestra Alviverde beats European rivals to secure prodigy signing!"',
      },
    };

    const isStartedInArgentina = isPlayerStartedInArgentina(player);
    const isStartedInBrazil = isPlayerStartedInBrazil(player) || (isSouthAmericanYouth && !isStartedInArgentina);

    if (isStartedInArgentina) {
      // Guarantee at least 1 Argentine giant (Boca or River), with a high chance of both (Superclásico choice!)
      const argClubs = [bocaPitch, riverPitch].sort(() => 0.5 - Math.random());
      const euroClubs = [...basePitches].sort(() => 0.5 - Math.random());

      const selected: HotProspectClubPitch[] = [argClubs[0]];
      if (Math.random() < 0.5) {
        selected.push(argClubs[1]);
        selected.push(euroClubs[0]);
      } else {
        selected.push(euroClubs[0]);
        selected.push(euroClubs[1]);
      }
      return selected.sort(() => 0.5 - Math.random());
    }

    if (isStartedInBrazil) {
      const brClubs = [flamengoPitch, corinthiansPitch, palmeirasPitch].sort(() => 0.5 - Math.random());
      const euroClubs = [...basePitches].sort(() => 0.5 - Math.random());
      const selected: HotProspectClubPitch[] = [brClubs[0], euroClubs[0], euroClubs[1]];
      return selected.sort(() => 0.5 - Math.random());
    }

    // Default European or International: Randomly select EXACTLY 3 from the 16 European elite suitors
    const shuffled = [...basePitches].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [player, manager, isSouthAmericanYouth]);

  const [mobileClubDetail, setMobileClubDetail] = useState<'contract' | 'pitch'>('contract');
  const [firstDayTab, setFirstDayTab] = useState<'story' | 'contract'>('story');

  if (!isOpen || eligiblePitches.length === 0) return null;

  const currentPitch = eligiblePitches[selectedClubIndex] || eligiblePitches[0];

  const handleSelectClub = (index: number) => {
    setSelectedClubIndex(index);
    setFirstDayTab('story');
    setStage('first_day');
    triggerConfetti();
  };

  const handleFinalizeSigning = () => {
    onCompleteTransfer(currentPitch);
  };

  const renderClubCard = (pitch: HotProspectClubPitch, idx: number, mobileSingle = false) => (
    <div
      key={pitch.id}
      className="bg-slate-950 border-2 border-slate-700 hover:border-amber-400 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between space-y-3 transition-all relative overflow-hidden group"
    >
      <div className="space-y-2.5">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pitch.badgeBg} flex items-center justify-center font-black text-white text-sm shadow-md border-2 border-white/20 font-arcade shrink-0`}
          >
            {pitch.shortName.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-white text-sm sm:text-base leading-snug group-hover:text-amber-300 transition truncate">
              {pitch.clubName}
            </h4>
            <div className="text-[11px] text-slate-400">
              {pitch.leagueName} • {pitch.countryName}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-amber-300 font-black uppercase tracking-wider text-[10px]">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ADVANTAGE: {pitch.primaryAdvantage.toUpperCase()}
          </div>
          <p className="text-xs text-amber-100 leading-snug">
            {pitch.advantageHighlight}
          </p>
        </div>

        {mobileSingle && (
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setMobileClubDetail('contract')}
              className={`min-h-[38px] rounded text-xs font-bold uppercase cursor-pointer ${
                mobileClubDetail === 'contract'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Offer Terms
            </button>
            <button
              type="button"
              onClick={() => setMobileClubDetail('pitch')}
              className={`min-h-[38px] rounded text-xs font-bold uppercase cursor-pointer ${
                mobileClubDetail === 'pitch'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Manager Pitch
            </button>
          </div>
        )}

        {(!mobileSingle || mobileClubDetail === 'contract') && (
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs space-y-1.5">
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Weekly Wage:</span>
              <strong className="text-emerald-400 font-arcade">€{pitch.weeklyWage.toLocaleString()}/wk</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Starting Role:</span>
              <strong className="text-white text-right">{pitch.startingRole}</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Contract Length:</span>
              <strong className="text-sky-400 font-arcade">{pitch.contractYears} Yrs</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Release Clause:</span>
              <strong className="text-rose-400 font-arcade">€{(pitch.releaseClause / 1000000).toFixed(0)}M</strong>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Development:</span>
              <strong className="text-purple-400 font-arcade">+{pitch.developmentPoints} Pts/Yr</strong>
            </div>
          </div>
        )}

        {(!mobileSingle || mobileClubDetail === 'pitch') && (
          <div className="space-y-2 border-t border-slate-800 pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              Manager: <span className="text-white">{pitch.managerName}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
              {pitch.managerQuote}
            </p>
            {mobileSingle && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {pitch.developmentPhilosophy}
              </p>
            )}
          </div>
        )}
      </div>

      {!mobileSingle && (
        <button
          type="button"
          onClick={() => handleSelectClub(idx)}
          className="w-full min-h-[44px] py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg border-2 border-amber-200 shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <span>Sign with {pitch.shortName}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        stage === 'selection'
          ? 'Hot Prospect: Elite Summit'
          : `Welcome to ${currentPitch.clubName}!`
      }
      subtitle={
        stage === 'selection'
          ? `${ovr} OVR • ${effectiveFame} Effective Fame • 3 Elite Suitors`
          : `${currentPitch.stadiumName} • ${currentPitch.countryName}`
      }
      badge={stage === 'selection' ? 'HOT PROSPECT SUMMIT' : 'OFFICIAL UNVEILING'}
      icon={<Crown className="w-5 h-5 text-amber-300 fill-amber-400/20" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-4xl"
      zIndexClass="z-[100]"
      tabs={
        stage === 'first_day'
          ? [
              { id: 'story', label: 'Day 1 Story', icon: <Building2 className="w-3.5 h-3.5" /> },
              { id: 'contract', label: 'Signed Terms', icon: <Banknote className="w-3.5 h-3.5" /> },
            ]
          : undefined
      }
      activeTabId={stage === 'first_day' ? firstDayTab : undefined}
      onTabChange={
        stage === 'first_day'
          ? (id) => setFirstDayTab(id as 'story' | 'contract')
          : undefined
      }
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        stage === 'selection' ? (
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => handleSelectClub(selectedClubIndex)}
              className="w-full min-h-[48px] py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 border-amber-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Sign with {currentPitch.shortName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFinalizeSigning}
            className="w-full min-h-[48px] py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 border-amber-200 shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
            <span className="truncate">Begin Your Chapter at {currentPitch.clubName}</span>
          </button>
        )
      }
    >
      {stage === 'selection' && (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            With <strong className="text-white">{ovr} OVR</strong> and{' '}
            <strong className="text-white">{effectiveFame} Effective Fame</strong>, 3 premier institutions are pitching a distinct competitive advantage for your signature.
          </p>

          {/* Mobile: Console Club Pager (1 club per page) */}
          <div className="md:hidden space-y-3">
            <ConsolePaginationBar
              currentPage={selectedClubIndex + 1}
              totalPages={eligiblePitches.length}
              onPageChange={(page) => setSelectedClubIndex(page - 1)}
              label={`Club ${selectedClubIndex + 1} of ${eligiblePitches.length}`}
            />
            {renderClubCard(currentPitch, selectedClubIndex, true)}
          </div>

          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-3.5">
            {eligiblePitches.map((pitch, idx) => renderClubCard(pitch, idx, false))}
          </div>
        </div>
      )}

      {stage === 'first_day' && (
        <div className="space-y-4">
          {firstDayTab === 'story' ? (
            <ConsolePagedText
              resetKey={currentPitch.id}
              textSizeClass="text-sm sm:text-base"
              pages={[
                {
                  heading: '1. Stadium Arrival',
                  paragraphs: [currentPitch.firstDayNarrative.stadiumArrival],
                },
                {
                  heading: '2. Official Press Conference',
                  paragraphs: [currentPitch.firstDayNarrative.pressConferenceQuote],
                },
                {
                  heading: '3. Global Media Headline',
                  paragraphs: [currentPitch.firstDayNarrative.fanReaction],
                },
              ]}
            />
          ) : (
            <div className="space-y-3">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                Signed Professional Agreement Terms
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Weekly Wage</div>
                  <div className="text-sm font-black text-emerald-400 mt-1 font-arcade">
                    €{currentPitch.weeklyWage.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Signing Bonus</div>
                  <div className="text-sm font-black text-white mt-1 font-arcade">
                    €{currentPitch.signingBonus.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Contract Length</div>
                  <div className="text-sm font-black text-sky-400 mt-1 font-arcade">
                    {currentPitch.contractYears} Years
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Release Clause</div>
                  <div className="text-sm font-black text-rose-400 mt-1 font-arcade">
                    €{(currentPitch.releaseClause / 1000000).toFixed(0)}M
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ConsoleModalShell>
  );
};
