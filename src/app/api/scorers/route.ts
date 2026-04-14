import { NextResponse } from 'next/server';
import { fetchTopScorers, LEAGUE_IDS } from '@/lib/api-football';
import { getCached, setCache, CACHE_TTL } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league') || 'Super Lig';
  const leagueId = LEAGUE_IDS[league];

  if (!leagueId) {
    return NextResponse.json({ source: 'mock', scorers: null });
  }

  const cacheKey = `scorers-${leagueId}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ source: 'api', scorers: cached, cached: true });
  }

  try {
    const scorers = await fetchTopScorers(leagueId);
    if (scorers && scorers.length > 0) {
      setCache(cacheKey, scorers, CACHE_TTL.SCORERS);
      return NextResponse.json({ source: 'api', scorers });
    }
    return NextResponse.json({ source: 'mock', scorers: null });
  } catch {
    return NextResponse.json({ source: 'mock', scorers: null });
  }
}
