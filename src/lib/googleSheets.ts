import Papa from 'papaparse';
import { CommitteePreference } from './types';
import { normalizeCommitteeName } from './committees';

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

export async function fetchPaymentData(sheetId: string, sheetName: string): Promise<{ emails: Set<string>; phones: Set<string> }> {
  const encodedSheetName = encodeURIComponent(sheetName);
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodedSheetName}`;

  const res = await fetch(csvUrl, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch payment sheet (Status ${res.status})`);
  }

  const csvText = await res.text();
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });

  if (!parsed.data || parsed.data.length <= 1) {
    return { emails: new Set(), phones: new Set() };
  }

  const headers = parsed.data[0].map(h => h.trim().toLowerCase());
  const emailIdx = headers.findIndex(h => h.includes('email'));
  const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('whatsapp') || h.includes('contact'));

  const rows = parsed.data.slice(1);
  const emails = new Set<string>();
  const phones = new Set<string>();

  for (const row of rows) {
    if (emailIdx >= 0 && row[emailIdx]) emails.add(row[emailIdx].trim().toLowerCase());
    if (phoneIdx >= 0 && row[phoneIdx]) phones.add(row[phoneIdx].trim());
  }

  return { emails, phones };
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

    const getPortfolios = (rawComm: string, prefLevel: number) => {
      if (!rawComm) return [];
      const normalized = normalizeCommitteeName(rawComm);
      const searchKey = normalized === 'UNGA-DISEC' ? 'unga' : normalized.toLowerCase();
      
      const levels = [
        ['first', '1st'],
        ['second', '2nd'],
        ['third', '3rd']
      ][prefLevel - 1];

      let startIdx = headers.findIndex((h) => {
        const lower = h.toLowerCase();
        const hasCommittee = lower.includes(searchKey);
        const hasLevel = levels.some((lvl) => lower.includes(lvl));
        return hasCommittee && hasLevel;
      });

      // Fallback for First & Second Round Registrations sheets where headers lack committee names
      if (startIdx === -1) {
        const HARDCODED_MAP: Record<string, Record<number, number>> = {
          'unga': { 1: 14, 2: 17, 3: 20 },
          'uncsw': { 1: 23, 2: 26, 3: 29 },
          'uncnd': { 1: 32, 2: 35, 3: 38 },
          'who': { 1: 41, 2: 44, 3: 47 },
          'aippm': { 1: 50, 2: 53, 3: 56 }
        };
        
        // Find the base search key for WHO or AIPPM as it might be parsed differently
        const normalizedKey = searchKey.includes('who') ? 'who' : searchKey.includes('aippm') ? 'aippm' : searchKey;
        
        if (HARDCODED_MAP[normalizedKey] && HARDCODED_MAP[normalizedKey][prefLevel]) {
          const fallbackIdx = HARDCODED_MAP[normalizedKey][prefLevel];
          // Ensure we don't out-of-bounds and that the header is actually "first preference"
          if (headers[fallbackIdx] && headers[fallbackIdx].includes('first pref')) {
            startIdx = fallbackIdx;
          }
        }
      }

      if (startIdx !== -1) {
        return [clean(row[startIdx]), clean(row[startIdx + 1]), clean(row[startIdx + 2])].filter(Boolean);
      }
      return [];
    };

    const committee_preferences: CommitteePreference[] = [];
    if (comm1) {
      committee_preferences.push({
        committee: normalizeCommitteeName(comm1),
        portfolios: getPortfolios(comm1, 1),
      });
    }
    if (comm2) {
      committee_preferences.push({
        committee: normalizeCommitteeName(comm2),
        portfolios: getPortfolios(comm2, 2),
      });
    }
    if (comm3) {
      committee_preferences.push({
        committee: normalizeCommitteeName(comm3),
        portfolios: getPortfolios(comm3, 3),
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
  }).filter((r) => r.email && r.email.includes('@') && r.name);
}
