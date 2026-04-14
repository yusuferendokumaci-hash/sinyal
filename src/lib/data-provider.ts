import { Match, matches as mockMatches, getLeagues as getMockLeagues } from './mock-data';
import { fetchTodayFixtures } from './api-football';

let cachedMatches: Match[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getMatches(): Promise<Match[]> {
  // Check cache
  if (cachedMatches && Date.now() - cacheTime < CACHE_TTL) {
    return cachedMatches;
  }

  // Try API first
  try {
    const apiMatches = await fetchTodayFixtures();
    if (apiMatches && apiMatches.length > 0) {
      cachedMatches = apiMatches;
      cacheTime = Date.now();
      return apiMatches;
    }
  } catch {
    // Fall back to mock data
  }

  return mockMatches;
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const allMatches = await getMatches();
  return allMatches.find((m) => m.id === id);
}

export async function getAllLeagues(): Promise<string[]> {
  const allMatches = await getMatches();
  return [...new Set(allMatches.map((m) => m.league))];
}

// Check if using real API data
export function isApiActive(): boolean {
  const key = process.env.API_FOOTBALL_KEY;
  return !!key && key !== 'YOUR_API_KEY_HERE';
}
