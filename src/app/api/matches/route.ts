import { NextResponse } from 'next/server';
import { fetchTodayFixtures } from '@/lib/api-football';
import { getCached, setCache, CACHE_TTL } from '@/lib/api-cache';
import { Match } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = 'matches-today';

  // Check cache first
  const cached = getCached<Match[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ source: 'api', matches: cached, date: new Date().toISOString(), cached: true });
  }

  try {
    const matches = await fetchTodayFixtures();
    if (matches && matches.length > 0) {
      setCache(cacheKey, matches, CACHE_TTL.MATCHES);
      return NextResponse.json({ source: 'api', matches, date: new Date().toISOString() });
    }
    return NextResponse.json({ source: 'mock', matches: null, date: new Date().toISOString() });
  } catch {
    return NextResponse.json({ source: 'mock', matches: null });
  }
}
