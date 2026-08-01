/**
 * committees.ts
 * Single source of truth for committee names and normalization.
 * Import normalizeCommitteeName anywhere you display or compare committee names.
 */

export const COMMITTEES = ['UNCND', 'UNCSW', 'WHO(SCHOOL)', 'IPC', 'UNGA-DISEC', 'AIPPM'] as const;
export type CommitteeName = (typeof COMMITTEES)[number];

/**
 * Maps every known Google Form label (old full names, abbreviations, typos)
 * to the canonical short code used in the app and DB.
 */
export const COMMITTEE_NAME_MAP: Record<string, string> = {
  // UNCND
  'United Nations Commission on Narcotic Drugs': 'UNCND',
  'uncnd': 'UNCND',

  // UNCSW
  'United Nations Commission on the Status of Women': 'UNCSW',
  'UN Commission on the Status of Women': 'UNCSW',
  'uncsw': 'UNCSW',

  // WHO
  'World Health Organisation': 'WHO(SCHOOL)',
  'World Health Organization': 'WHO(SCHOOL)',
  'WHO': 'WHO(SCHOOL)',
  'who': 'WHO(SCHOOL)',
  'WHO (SCHOOL)': 'WHO(SCHOOL)',
  'WHO(School)': 'WHO(SCHOOL)',

  // IPC
  'International Press Corps': 'IPC',
  'ipc': 'IPC',

  // UNGA-DISEC
  'United Nations General Assembly - Disarmament and International Security': 'UNGA-DISEC',
  'United Nations General Assembly – Disarmament and International Security': 'UNGA-DISEC',
  'UNGA DISEC': 'UNGA-DISEC',
  'DISEC': 'UNGA-DISEC',
  'unga-disec': 'UNGA-DISEC',

  // AIPPM
  'All India Political Parties Meet': 'AIPPM',
  'aippm': 'AIPPM',
};

/**
 * Normalize a committee name string (from Google Form, DB, anywhere) to the
 * canonical code like 'UNCSW', 'WHO(SCHOOL)', etc.
 * Falls back to returning the trimmed raw value if no match found.
 */
export function normalizeCommitteeName(raw: string | undefined | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // Exact match
  if (COMMITTEE_NAME_MAP[trimmed]) return COMMITTEE_NAME_MAP[trimmed];

  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  const found = Object.entries(COMMITTEE_NAME_MAP).find(([k]) => k.toLowerCase() === lower);
  if (found) return found[1];

  // Already a valid current name
  if ((COMMITTEES as readonly string[]).includes(trimmed)) return trimmed;

  // Return raw as fallback (still shows something in the UI)
  return trimmed;
}
