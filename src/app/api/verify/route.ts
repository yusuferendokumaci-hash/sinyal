import { NextResponse } from 'next/server';
import { generatePredictions } from '@/lib/predictions';
import { getCached, setCache, CACHE_TTL } from '@/lib/api-cache';
import type { Match } from '@/lib/mock-data';

export const revalidate = 3600; // 1 hour cache

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY || '';

interface VerifiedResult {
  id: string;
  date: string;
  matchLabel: string;
  marketLabel: string;
  optionName: string;
  predictedOdds: number;
  actualScore: string;
  result: 'won' | 'lost';
}

async function apiFetch(endpoint: string, params: Record<string, string>) {
  if (!API_KEY) return null;
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString(), {
      headers: { 'x-apisports-key': API_KEY },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.errors && Object.keys(data.errors).length > 0) return null;
    return data;
  } catch {
    return null;
  }
}

// Check if a prediction's market/option won based on final score
function checkPredictionResult(
  marketLabel: string,
  optionName: string,
  homeGoals: number,
  awayGoals: number,
): 'won' | 'lost' {
  const total = homeGoals + awayGoals;
  const homeWin = homeGoals > awayGoals;
  const draw = homeGoals === awayGoals;
  const awayWin = awayGoals > homeGoals;
  const bttsYes = homeGoals > 0 && awayGoals > 0;

  switch (marketLabel) {
    case '1X2':
      if (optionName === '1') return homeWin ? 'won' : 'lost';
      if (optionName === 'X') return draw ? 'won' : 'lost';
      if (optionName === '2') return awayWin ? 'won' : 'lost';
      break;
    case 'doubleChance':
      if (optionName === '1X') return (homeWin || draw) ? 'won' : 'lost';
      if (optionName === '12') return (homeWin || awayWin) ? 'won' : 'lost';
      if (optionName === 'X2') return (draw || awayWin) ? 'won' : 'lost';
      break;
    case 'overUnder15':
      if (optionName === 'over') return total > 1.5 ? 'won' : 'lost';
      if (optionName === 'under') return total < 1.5 ? 'won' : 'lost';
      break;
    case 'overUnder25':
      if (optionName === 'over') return total > 2.5 ? 'won' : 'lost';
      if (optionName === 'under') return total < 2.5 ? 'won' : 'lost';
      break;
    case 'overUnder35':
      if (optionName === 'over') return total > 3.5 ? 'won' : 'lost';
      if (optionName === 'under') return total < 3.5 ? 'won' : 'lost';
      break;
    case 'btts':
      if (optionName === 'yes') return bttsYes ? 'won' : 'lost';
      if (optionName === 'no') return !bttsYes ? 'won' : 'lost';
      break;
    case 'score':
      // "X-Y" format
      return optionName === `${homeGoals}-${awayGoals}` ? 'won' : 'lost';
  }
  return 'lost';
}

export async function GET() {
  const cacheKey = 'verified-results';
  const cached = getCached<VerifiedResult[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ results: cached, cached: true });
  }

  // Check last 2 days
  const results: VerifiedResult[] = [];
  const dates: string[] = [];
  for (let d = 1; d <= 2; d++) {
    const day = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const local = new Date(day.getTime() + 3 * 60 * 60 * 1000);
    dates.push(local.toISOString().split('T')[0]);
  }

  // Supported league IDs (subset of main leagues to save quota)
  const mainLeagues = [203, 140, 39, 61, 78, 135, 88, 94, 144, 2, 3, 848, 333, 334, 253];

  for (const date of dates) {
    const data = await apiFetch('/fixtures', { date, status: 'FT-AET-PEN' });
    if (!data?.response) continue;

    const fixtures = data.response.filter((f: any) =>
      mainLeagues.includes(f.league.id) &&
      f.goals.home !== null &&
      f.goals.away !== null
    ).slice(0, 10); // Max 10 per day

    for (const fixture of fixtures) {
      const match: Match = {
        id: fixture.fixture.id.toString(),
        league: fixture.league.name,
        leagueCountry: 'XX',
        homeTeam: {
          id: fixture.teams.home.id.toString(),
          name: fixture.teams.home.name,
          shortName: fixture.teams.home.name.substring(0, 3).toUpperCase(),
          logo: fixture.teams.home.logo,
          form: ['W', 'D', 'W', 'L', 'W'],
          goalsScored: 40, goalsConceded: 30,
          homeWinRate: 0.6, awayWinRate: 0.4,
          avgGoalsScored: 1.5, avgGoalsConceded: 1.2,
        },
        awayTeam: {
          id: fixture.teams.away.id.toString(),
          name: fixture.teams.away.name,
          shortName: fixture.teams.away.name.substring(0, 3).toUpperCase(),
          logo: fixture.teams.away.logo,
          form: ['D', 'W', 'D', 'W', 'L'],
          goalsScored: 35, goalsConceded: 32,
          homeWinRate: 0.55, awayWinRate: 0.35,
          avgGoalsScored: 1.4, avgGoalsConceded: 1.3,
        },
        kickoff: '20:00',
        h2h: { homeWins: 5, draws: 3, awayWins: 4, totalMatches: 12, avgGoals: 2.5 },
        status: 'finished',
      };

      let pred;
      try { pred = generatePredictions(match); } catch { continue; }

      const mainPick = pred.mainPrediction;
      const actualResult = checkPredictionResult(
        mainPick.marketLabel,
        mainPick.optionName,
        fixture.goals.home,
        fixture.goals.away,
      );

      const prettyDate = new Date(fixture.fixture.date).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul',
      });

      results.push({
        id: `auto-${fixture.fixture.id}`,
        date: prettyDate,
        matchLabel: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        marketLabel: mainPick.marketLabel,
        optionName: mainPick.optionName,
        predictedOdds: mainPick.odds,
        actualScore: `${fixture.goals.home}-${fixture.goals.away}`,
        result: actualResult,
      });
    }
  }

  setCache(cacheKey, results, 6 * 60 * 60 * 1000); // 6 hour cache
  return NextResponse.json({ results });
}
