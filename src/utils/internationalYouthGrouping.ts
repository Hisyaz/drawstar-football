import { PlayerCardData } from '../types';
import { FederationName, InternationalYouthClub } from '../types/youthLeague';
import { getAllIntlYouthPoolClubs } from '../data/internationalYouthPool';

export type GroupedYouthClub = InternationalYouthClub & { players?: PlayerCardData[] };

export interface InternationalYouthSection {
  sectionId: string;
  sectionLabel: string;
  isBundledRegional: boolean;
  countries: string[];
  teamCountInSection: number;
  federations: FederationName[];
  clubs: GroupedYouthClub[];
}

interface RegionalBundleSpec {
  sectionId: string;
  sectionLabel: string;
}

const COUNTRY_TO_REGIONAL_SECTION: Record<string, RegionalBundleSpec> = {
  // Greek & Balkan
  greece: { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },
  croatia: { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },
  serbia: { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },
  bulgaria: { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },
  romania: { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },
  slovenia: { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },
  'bosnia and herzegovina': { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },
  albania: { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },
  'north macedonia': { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },
  montenegro: { sectionId: 'greek_balkan', sectionLabel: 'Greek & Balkan' },

  // Nordic
  denmark: { sectionId: 'nordic', sectionLabel: 'Nordic' },
  sweden: { sectionId: 'nordic', sectionLabel: 'Nordic' },
  norway: { sectionId: 'nordic', sectionLabel: 'Nordic' },
  finland: { sectionId: 'nordic', sectionLabel: 'Nordic' },
  iceland: { sectionId: 'nordic', sectionLabel: 'Nordic' },

  // Benelux / Alpine
  netherlands: { sectionId: 'benelux_alpine', sectionLabel: 'Benelux / Alpine' },
  belgium: { sectionId: 'benelux_alpine', sectionLabel: 'Benelux / Alpine' },
  austria: { sectionId: 'benelux_alpine', sectionLabel: 'Benelux / Alpine' },
  switzerland: { sectionId: 'benelux_alpine', sectionLabel: 'Benelux / Alpine' },
  luxembourg: { sectionId: 'benelux_alpine', sectionLabel: 'Benelux / Alpine' },

  // Western Europe
  france: { sectionId: 'western_europe', sectionLabel: 'Western Europe' },
  'republic of ireland': { sectionId: 'western_europe', sectionLabel: 'Western Europe' },
  ireland: { sectionId: 'western_europe', sectionLabel: 'Western Europe' },
  scotland: { sectionId: 'western_europe', sectionLabel: 'Western Europe' },
  wales: { sectionId: 'western_europe', sectionLabel: 'Western Europe' },

  // Andean South America
  ecuador: { sectionId: 'andean_south_america', sectionLabel: 'Andean South America' },
  colombia: { sectionId: 'andean_south_america', sectionLabel: 'Andean South America' },
  peru: { sectionId: 'andean_south_america', sectionLabel: 'Andean South America' },
  chile: { sectionId: 'andean_south_america', sectionLabel: 'Andean South America' },
  bolivia: { sectionId: 'andean_south_america', sectionLabel: 'Andean South America' },
  venezuela: { sectionId: 'andean_south_america', sectionLabel: 'Andean South America' },
  paraguay: { sectionId: 'andean_south_america', sectionLabel: 'Andean South America' },

  // North & West Africa
  egypt: { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  morocco: { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  "côte d'ivoire": { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  "cote d'ivoire": { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  senegal: { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  tunisia: { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  algeria: { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  nigeria: { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  ghana: { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  mali: { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },
  cameroon: { sectionId: 'north_west_africa', sectionLabel: 'North & West Africa' },

  // Central & Southern Africa
  'dr congo': { sectionId: 'central_southern_africa', sectionLabel: 'Central & Southern Africa' },
  'south africa': { sectionId: 'central_southern_africa', sectionLabel: 'Central & Southern Africa' },
  angola: { sectionId: 'central_southern_africa', sectionLabel: 'Central & Southern Africa' },
  zambia: { sectionId: 'central_southern_africa', sectionLabel: 'Central & Southern Africa' },
  uganda: { sectionId: 'central_southern_africa', sectionLabel: 'Central & Southern Africa' },
  kenya: { sectionId: 'central_southern_africa', sectionLabel: 'Central & Southern Africa' },

  // Arabian Gulf & Levant
  'saudi arabia': { sectionId: 'arabian_gulf_levant', sectionLabel: 'Arabian Gulf & Levant' },
  uae: { sectionId: 'arabian_gulf_levant', sectionLabel: 'Arabian Gulf & Levant' },
  qatar: { sectionId: 'arabian_gulf_levant', sectionLabel: 'Arabian Gulf & Levant' },
  iran: { sectionId: 'arabian_gulf_levant', sectionLabel: 'Arabian Gulf & Levant' },
  iraq: { sectionId: 'arabian_gulf_levant', sectionLabel: 'Arabian Gulf & Levant' },
  jordan: { sectionId: 'arabian_gulf_levant', sectionLabel: 'Arabian Gulf & Levant' },

  // East Asia & Oceania
  'south korea': { sectionId: 'east_asia_oceania', sectionLabel: 'East Asia & Oceania' },
  australia: { sectionId: 'east_asia_oceania', sectionLabel: 'East Asia & Oceania' },
  china: { sectionId: 'east_asia_oceania', sectionLabel: 'East Asia & Oceania' },
  'china pr': { sectionId: 'east_asia_oceania', sectionLabel: 'East Asia & Oceania' },
  thailand: { sectionId: 'east_asia_oceania', sectionLabel: 'East Asia & Oceania' },
  vietnam: { sectionId: 'east_asia_oceania', sectionLabel: 'East Asia & Oceania' },
  indonesia: { sectionId: 'east_asia_oceania', sectionLabel: 'East Asia & Oceania' },

  // Pacific Islands
  'papua new guinea': { sectionId: 'pacific_islands', sectionLabel: 'Pacific Islands' },
  fiji: { sectionId: 'pacific_islands', sectionLabel: 'Pacific Islands' },
  'solomon islands': { sectionId: 'pacific_islands', sectionLabel: 'Pacific Islands' },
  samoa: { sectionId: 'pacific_islands', sectionLabel: 'Pacific Islands' },
  tahiti: { sectionId: 'pacific_islands', sectionLabel: 'Pacific Islands' },
  vanuatu: { sectionId: 'pacific_islands', sectionLabel: 'Pacific Islands' },

  // Central America & Caribbean
  'costa rica': { sectionId: 'central_america_caribbean', sectionLabel: 'Central America & Caribbean' },
  jamaica: { sectionId: 'central_america_caribbean', sectionLabel: 'Central America & Caribbean' },
  honduras: { sectionId: 'central_america_caribbean', sectionLabel: 'Central America & Caribbean' },
  'el salvador': { sectionId: 'central_america_caribbean', sectionLabel: 'Central America & Caribbean' },
  panama: { sectionId: 'central_america_caribbean', sectionLabel: 'Central America & Caribbean' },
  canada: { sectionId: 'central_america_caribbean', sectionLabel: 'Central America & Caribbean' },
};

function slugifySectionId(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Resolves the section ID & label for a single-team country or multi-team country.
 */
export function resolveRegionalBundleForCountry(country: string): RegionalBundleSpec {
  const key = (country || '').trim().toLowerCase();
  if (COUNTRY_TO_REGIONAL_SECTION[key]) {
    return COUNTRY_TO_REGIONAL_SECTION[key];
  }
  return {
    sectionId: `intl_${slugifySectionId(country || 'world')}`,
    sectionLabel: country || 'International',
  };
}

/**
 * Groups Int'l Youth Cup pool clubs by country, automatically bundling 1-team countries
 * into geographical regional sections with `sectionId`, `sectionLabel`, and `teamCountInSection`.
 */
export function groupInternationalYouthClubs(
  clubs: GroupedYouthClub[] = getAllIntlYouthPoolClubs()
): InternationalYouthSection[] {
  const countryCounts = new Map<string, number>();
  for (const club of clubs) {
    const key = club.country.trim().toLowerCase();
    countryCounts.set(key, (countryCounts.get(key) || 0) + 1);
  }

  const sectionsMap = new Map<string, InternationalYouthSection>();

  for (const club of clubs) {
    const countryKey = club.country.trim().toLowerCase();
    const countInCountry = countryCounts.get(countryKey) || 0;
    const isSingleTeamCountry = countInCountry <= 1;

    let sectionId: string;
    let sectionLabel: string;
    let isBundledRegional = false;

    if (isSingleTeamCountry) {
      const bundle = resolveRegionalBundleForCountry(club.country);
      sectionId = bundle.sectionId;
      sectionLabel = bundle.sectionLabel;
      isBundledRegional = true;
    } else {
      sectionId = slugifySectionId(club.country);
      sectionLabel = club.country;
      isBundledRegional = false;
    }

    let sec = sectionsMap.get(sectionId);
    if (!sec) {
      sec = {
        sectionId,
        sectionLabel,
        isBundledRegional,
        countries: [],
        teamCountInSection: 0,
        federations: [],
        clubs: [],
      };
      sectionsMap.set(sectionId, sec);
    }

    if (!sec.countries.includes(club.country)) {
      sec.countries.push(club.country);
    }
    if (!sec.federations.includes(club.federation)) {
      sec.federations.push(club.federation);
    }
    sec.clubs.push(club);
    sec.teamCountInSection = sec.clubs.length;
  }

  return Array.from(sectionsMap.values()).sort((a, b) => {
    if (b.teamCountInSection !== a.teamCountInSection) {
      return b.teamCountInSection - a.teamCountInSection;
    }
    return a.sectionLabel.localeCompare(b.sectionLabel);
  });
}

/**
 * Returns Int'l Youth Cup sections that hold 2+ clubs (eligible for Special Unlocked Youth Stadiums).
 */
export function getIntlYouthCupStadiumEligibleSections(
  clubs: GroupedYouthClub[] = getAllIntlYouthPoolClubs()
): InternationalYouthSection[] {
  return groupInternationalYouthClubs(clubs).filter((sec) => sec.teamCountInSection >= 2);
}

/**
 * Resolves which grouped section a given Int'l Youth Cup club or country belongs to.
 */
export function getIntlYouthSectionForClubOrCountry(
  clubOrCountry: Pick<InternationalYouthClub, 'id' | 'name' | 'country'> | string,
  clubs: GroupedYouthClub[] = getAllIntlYouthPoolClubs()
): InternationalYouthSection | null {
  const sections = groupInternationalYouthClubs(clubs);
  if (typeof clubOrCountry === 'string') {
    const target = clubOrCountry.trim().toLowerCase();
    return (
      sections.find(
        (s) =>
          s.sectionId === target ||
          s.sectionLabel.toLowerCase() === target ||
          s.countries.some((c) => c.toLowerCase() === target) ||
          s.clubs.some((c) => c.id.toLowerCase() === target || c.name.toLowerCase() === target)
      ) || null
    );
  }
  return (
    sections.find(
      (s) =>
        s.clubs.some((c) => c.id === clubOrCountry.id || c.name === clubOrCountry.name) ||
        s.countries.some((c) => c.toLowerCase() === clubOrCountry.country.toLowerCase())
    ) || null
  );
}
