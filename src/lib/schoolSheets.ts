import Papa from "papaparse";
import { CommitteePreference } from "./types";
import { normalizeCommitteeName } from "./committees";

export interface ParsedSchoolRow {
  name: string;
  email: string;
  whatsapp: string;
  emergency_contact: string;
  food_preference: string;
  committee_preferences: CommitteePreference[];
}

/**
 * Fetch and parse a school filled Google Sheet.
 * The school template has info rows at top (school name, fee, link)
 * then a header row, then data rows.
 * We detect the real header row by scanning the first 6 rows for "name"+"email".
 */
export async function fetchSchoolSheetData(
  sheetId: string,
  sheetName?: string
): Promise<ParsedSchoolRow[]> {
  const encodedSheet = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : "";
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${encodedSheet}`;

  const res = await fetch(csvUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch school sheet (HTTP ${res.status})`);

  const csvText = await res.text();
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: false });
  if (!parsed.data || parsed.data.length < 2) return [];

  // Find the header row (within first 6 rows)
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(6, parsed.data.length); i++) {
    const joined = parsed.data[i].join(" ").toLowerCase();
    if ((joined.includes("full name") || joined.includes("name")) && joined.includes("email")) {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx === -1) headerRowIdx = 0;

  const headers = parsed.data[headerRowIdx].map((h) => h.trim().toLowerCase());
  const dataRows = parsed.data.slice(headerRowIdx + 1);

  // Fuzzy column finders
  const find = (needle: string) => headers.findIndex((h) => h.includes(needle));
  const findAll = (needle: string) =>
    headers.map((h, i) => (h.includes(needle) ? i : -1)).filter((i) => i !== -1);

  const nameIdx = find("full name") !== -1 ? find("full name") : find("name");
  const emailIdx = find("email");
  const phoneIdx = find("phone") !== -1 ? find("phone") : find("whatsapp");
  const emergIdx = find("emergency");
  const foodIdx = find("food");

  const commPrefIdxs =
    findAll("committee pref").length > 0 ? findAll("committee pref") : findAll("comm pref");
  const countryAllIdxs = findAll("country pref");

  const comm1Idx = commPrefIdxs[0] ?? -1;
  const comm2Idx = commPrefIdxs[1] ?? -1;

  let countries1: number[] = [];
  let countries2: number[] = [];
  if (comm2Idx !== -1) {
    countries1 = countryAllIdxs.filter((i) => i > comm1Idx && i < comm2Idx).slice(0, 5);
    countries2 = countryAllIdxs.filter((i) => i > comm2Idx).slice(0, 5);
  } else if (comm1Idx !== -1) {
    countries1 = countryAllIdxs.filter((i) => i > comm1Idx).slice(0, 5);
  }

  const useFallback = nameIdx === -1 || emailIdx === -1;
  const clean = (val: string | undefined) => (val ? val.trim() : "");

  return dataRows
    .map((row): ParsedSchoolRow => {
      let name: string, email: string, whatsapp: string, emergency_contact: string;
      let food_preference: string;
      let comm1Raw: string, comm2Raw: string;
      let port1: string[], port2: string[];

      if (useFallback) {
        // Positional: Sl.No(0), Name(1), Email(2), Phone(3), Emergency(4),
        //   CommPref01(5), Country01-05(6-10), CommPref02(11), Country01-05(12-16), Food(17)
        name = clean(row[1]);
        email = clean(row[2]).toLowerCase();
        whatsapp = clean(row[3]);
        emergency_contact = clean(row[4]);
        comm1Raw = clean(row[5]);
        port1 = [6, 7, 8, 9, 10].map((i) => clean(row[i])).filter(Boolean);
        comm2Raw = clean(row[11]);
        port2 = [12, 13, 14, 15, 16].map((i) => clean(row[i])).filter(Boolean);
        food_preference = clean(row[17]) || "Non-Veg";
      } else {
        name = clean(row[nameIdx]);
        email = clean(row[emailIdx]).toLowerCase();
        whatsapp = phoneIdx !== -1 ? clean(row[phoneIdx]) : "";
        emergency_contact = emergIdx !== -1 ? clean(row[emergIdx]) : "";
        comm1Raw = comm1Idx !== -1 ? clean(row[comm1Idx]) : "";
        comm2Raw = comm2Idx !== -1 ? clean(row[comm2Idx]) : "";
        port1 = countries1.map((i) => clean(row[i])).filter(Boolean);
        port2 = countries2.map((i) => clean(row[i])).filter(Boolean);
        food_preference = foodIdx !== -1 ? clean(row[foodIdx]) : "Non-Veg";
      }

      const committee_preferences: CommitteePreference[] = [];
      if (comm1Raw) committee_preferences.push({ committee: normalizeCommitteeName(comm1Raw), portfolios: port1 });
      if (comm2Raw) committee_preferences.push({ committee: normalizeCommitteeName(comm2Raw), portfolios: port2 });

      return { name, email, whatsapp, emergency_contact, food_preference: food_preference || "Non-Veg", committee_preferences };
    })
    .filter((r) => r.email && r.name);
}
