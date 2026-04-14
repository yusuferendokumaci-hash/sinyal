import { NextResponse } from 'next/server';
import { fetchLeagueStandings, LEAGUE_IDS } from '@/lib/api-football';
import { getCached, setCache, CACHE_TTL } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league') || 'Super Lig';
  const leagueId = LEAGUE_IDS[league];

  if (!leagueId) {
    return NextResponse.json({ source: 'mock', standings: null });
  }

  const cacheKey = `standings-${leagueId}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ source: 'api', standings: cached, cached: true });
  }

  try {
    const standings = await fetchLeagueStandings(leagueId);
    if (standings && standings.length > 0) {
      setCache(cacheKey, standings, CACHE_TTL.STANDINGS);
      return NextResponse.json({ source: 'api', standings });
    }
    return NextResponse.json({ source: 'mock', standings: null });
  } catch {
    return NextResponse.json({ source: 'mock', standings: null });
  }
}
