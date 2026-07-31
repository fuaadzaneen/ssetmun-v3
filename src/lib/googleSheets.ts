import Papa from 'papaparse';
import { CommitteePreference } from './types';

export interface ParsedSheetRow {
  name: string;
  dob: string;
  email: string;
  whatsapp: string;
  college: string;
  course: string;
  delegation_type: string;
  raw_ca_input: string;
  muns_attended: string;
  mun_achievements: string;
  committee_preferences: CommitteePreference[];
  accommodation_required: string;
  food_preference: string;
  travel_assistance: string;
  queries_suggestions: string;
}

export async function fetchSheetData(
  sheetId: string,
  sheetName: string
): Promise<ParsedSheetRow[]> {
  // Google Sheet public CSV export endpoint
  const encodedSheetName = encodeURIComponent(sheetName);
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodedSheetName}`;

  const res = await fetch(csvUrl, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch Google Sheet CSV (Status ${res.status})`);
  }

  const csvText = await res.text();
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });

  if (!parsed.data || parsed.data.length <= 1) {
    return [];
  }

  const headers = parsed.data[0].map(h => h.trim().toLowerCase());
  
  // Find logistics indices
  const accIdx = headers.findIndex(h => h.includes('accommodation'));
  const foodIdx = headers.findIndex(h => h.includes('food preference'));
  const queriesIdx = headers.findIndex(h => h.includes('queries'));
  const travelIdx = headers.findIndex(h => h.includes('travel'));

  const rows = parsed.data.slice(1);

  return rows.map((row) => {
    const clean = (val: string | undefined) => (val ? val.trim() : '');

    const name = clean(row[1]);
    const dob = clean(row[2]);
    const email = clean(row[3]).toLowerCase();
    const whatsapp = clean(row[4]);
    const college = clean(row[5]);
    const course = clean(row[6]);
    const delegation_type = clean(row[7]) || 'Institutional';
    const raw_ca_input = clean(row[8]);
    const muns_attended = clean(row[9]);
    const mun_achievements = clean(row[10]);

    // Committee Preferences
    const comm1 = clean(row[11]);
    const comm2 = clean(row[12]);
    const comm3 = clean(row[13]);

    const committee_preferences: CommitteePreference[] = [];
    if (comm1) {
      committee_preferences.push({
        committee: comm1,
        portfolios: [clean(row[14]), clean(row[15]), clean(row[16])].filter(Boolean),
      });
    }
    if (comm2) {
      committee_preferences.push({
        committee: comm2,
        portfolios: [clean(row[17]), clean(row[18]), clean(row[19])].filter(Boolean),
      });
    }
    if (comm3) {
      committee_preferences.push({
        committee: comm3,
        portfolios: [clean(row[20]), clean(row[21]), clean(row[22])].filter(Boolean),
      });
    }

    // Logistics fields (Accommodation, Food, Travel, Queries)
    const accommodation_required = accIdx >= 0 ? clean(row[accIdx]) : 'No';
    const food_preference = foodIdx >= 0 ? clean(row[foodIdx]) : 'Non-Veg';
    const queries_suggestions = queriesIdx >= 0 ? clean(row[queriesIdx]) : '';
    const travel_assistance = travelIdx >= 0 ? clean(row[travelIdx]) : 'No';

    return {
      name,
      dob,
      email,
      whatsapp,
      college,
      course,
      delegation_type,
      raw_ca_input,
      muns_attended,
      mun_achievements,
      committee_preferences,
      accommodation_required,
      food_preference,
      travel_assistance,
      queries_suggestions,
    };
  }).filter((r) => r.email && r.name);
}
