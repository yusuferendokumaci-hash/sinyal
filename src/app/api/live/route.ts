import { NextResponse } from 'next/server';
import { getCached, setCache, CACHE_TTL } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY || '';

export async function GET() {
  const cacheKey = 'live-matches';
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ live: cached, cached: true });
  }

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    return NextResponse.json({ live: [] });
  }

  try {
    const res = await fetch(`${API_BASE}/fixtures?live=all`, {
      headers: { 'x-apisports-key': API_KEY },
    });

    if (!res.ok) return NextResponse.json({ live: [] });

    const data = await res.json();
    if (data.errors && Object.keys(data.errors).length > 0) {
      return NextResponse.json({ live: [] });
    }

    const fixtures = data.response || [];

    const live = fixtures.slice(0, 8).map((f: any) => ({
      id: f.fixture.id,
      home: f.teams.home.name,
      homeLogo: f.teams.home.logo,
      away: f.teams.away.name,
      awayLogo: f.teams.away.logo,
      homeGoals: f.goals.home ?? 0,
      awayGoals: f.goals.away ?? 0,
      minute: f.fixture.status.elapsed || 0,
      status: f.fixture.status.short,
      league: f.league.name,
    }));

    setCache(cacheKey, live, CACHE_TTL.LIVE);
    return NextResponse.json({ live });
  } catch {
    return NextResponse.json({ live: [] });
  }
}
