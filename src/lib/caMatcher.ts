import Fuse from 'fuse.js';
import { CampusAmbassador } from './types';

export interface CAMatchResult {
  ca: CampusAmbassador;
  score: number;
}

export function findBestCAMatches(
  rawInput: string,
  caList: CampusAmbassador[],
  limit = 3
): CAMatchResult[] {
  if (!rawInput || !rawInput.trim() || caList.length === 0) return [];

  const fuse = new Fuse(caList, {
    keys: ['code', 'name', 'college'],
    threshold: 0.4,
    includeScore: true,
  });

  const results = fuse.search(rawInput.trim());

  return results.slice(0, limit).map((res) => ({
    ca: res.item,
    score: res.score ? 1 - res.score : 1, // Higher score = better match
  }));
}
