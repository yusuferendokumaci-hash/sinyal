import { Match, Team, H2H, BookmakerOdds } from './mock-data';
import { getCached, setCache, CACHE_TTL } from './api-cache';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY || '';

interface ApiResponse<T> {
  response: T;
  errors: Record<string, string>;
  results: number;
}

async function apiFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') return null;

  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'x-apisports-key': API_KEY,
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.errors && Object.keys(data.errors).length > 0) return null;
    return data;
  } catch {
    return null;
  }
}

// Get today's fixtures
export async function fetchTodayFixtures(): Promise<Match[] | null> {
  // Use local date (Turkey UTC+3) to avoid timezone issues
  const now = new Date();
  const localDate = new Date(now.getTime() + 3 * 60 * 60 * 1000); // UTC+3
  const today = localDate.toISOString().split('T')[0];

  const data = await apiFetch<ApiResponse<ApiFixture[]>>('/fixtures', {
    date: today,
  });

  if (!data || !data.response?.length) return null;

  // Filter to supported leagues - comprehensive list
  const majorLeagueIds = [
    // TURKEY
    203, // Super Lig
    204, // 1. Lig (TFF 1. Lig)

    // ENGLAND
    39,  // Premier League
    40,  // Championship
    41,  // League One
    42,  // League Two

    // SPAIN
    140, // La Liga
    141, // Segunda Division

    // GERMANY
    78,  // Bundesliga
    79,  // 2. Bundesliga
    80,  // 3. Liga

    // ITALY
    135, // Serie A
    136, // Serie B

    // FRANCE
    61,  // Ligue 1
    62,  // Ligue 2

    // NETHERLANDS
    88,  // Eredivisie
    89,  // Eerste Divisie (Hollanda 2. Lig)

    // PORTUGAL
    94,  // Primeira Liga
    95,  // Segunda Liga

    // BELGIUM
    144, // Jupiler Pro League

    // SCOTLAND
    179, // Scottish Premiership

    // SWITZERLAND
    207, // Super League (Isvicre)

    // DENMARK
    119, // Superliga (Danimarka)

    // NORWAY
    103, // Eliteserien (Norvec)

    // SWEDEN
    113, // Allsvenskan (Isvec)

    // AUSTRIA
    218, // Bundesliga (Avusturya)

    // GREECE
    197, // Super League (Yunanistan)

    // CZECH REPUBLIC
    345, // Czech Liga

    // POLAND
    106, // Ekstraklasa (Polonya)

    // CROATIA
    210, // HNL (Hirvatistan)

    // SERBIA
    286, // Super Liga (Sirbistan)

    // UKRAINE
    333, // Premier League (Ukrayna)

    // RUSSIA
    235, // Premier League (Rusya)

    // MIDDLE EAST
    307, // UAE Pro League
    334, // Saudi Pro League (SPL)

    // AMERICAS
    253, // MLS (USA)
    71,  // Serie A (Brezilya)
    128, // Liga Profesional (Arjantin)
    262, // Liga MX (Meksika)

    // ASIA
    292, // K-League (Guney Kore)
    188, // J-League (Japonya)

    // UEFA Competitions
    2,   // Champions League
    3,   // Europa League
    848, // Conference League

    // International
    1,   // World Cup
    4,   // Euro Championship
    9,   // Copa America
    29,  // Nations League
  ];

  const filtered = data.response.filter(
    (f) => majorLeagueIds.includes(f.league.id)
  );

  if (filtered.length === 0) return null;

  // Fetch real team stats from standings (one request per league, cached)
  // Wrapped in try-catch so API errors don't break match loading
  let teamStatsMap = new Map<number, RealTeamStats>();
  try {
    const leagueIds = [...new Set(filtered.map(f => f.league.id))];
    teamStatsMap = await fetchAllTeamStats(leagueIds);
  } catch {}

  // Fetch real bookmaker odds for fixtures
  let oddsMap = new Map<number, BookmakerOdds>();
  try {
    const fixtureIds = filtered.slice(0, 50).map(f => f.fixture.id);
    oddsMap = await fetchOddsBatch(today, fixtureIds);
  } catch {}

  const matches: Match[] = [];

  for (const fixture of filtered.slice(0, 50)) {
    const homeTeam = mapTeam(fixture.teams.home, true, teamStatsMap);
    const awayTeam = mapTeam(fixture.teams.away, false, teamStatsMap);

    const h2hData = { homeWins: 5, draws: 3, awayWins: 4, totalMatches: 12, avgGoals: 2.5 };

    matches.push({
      id: fixture.fixture.id.toString(),
      league: fixture.league.name,
      leagueCountry: countryToCode(fixture.league.country),
      homeTeam,
      awayTeam,
      kickoff: new Date(fixture.fixture.date).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      h2h: h2hData,
      status: mapStatus(fixture.fixture.status.short),
      odds: oddsMap.get(fixture.fixture.id) || undefined,
    });
  }

  return matches.length > 0 ? matches : null;
}

// Fetch odds for specific fixtures (one API call per fixture, but we limit to save quota)
async function fetchOddsBatch(date: string, fixtureIds?: number[]): Promise<Map<number, BookmakerOdds>> {
  const oddsMap = new Map<number, BookmakerOdds>();

  if (!fixtureIds || fixtureIds.length === 0) return oddsMap;

  // Fetch odds per fixture (max 10 to save API quota - free plan 100/day)
  const idsToFetch = fixtureIds.slice(0, 3); // Max 3 to save API quota

  const results = await Promise.all(
    idsToFetch.map(id =>
      apiFetch<ApiResponse<ApiOddsFixture[]>>('/odds', { fixture: id.toString() })
    )
  );

  for (const data of results) {
    if (!data?.response?.length) continue;

    for (const item of data.response) {
      processOddsItem(item, oddsMap);
    }
  }

  return oddsMap;
}

function processOddsItem(item: ApiOddsFixture, oddsMap: Map<number, BookmakerOdds>) {
    const fixtureId = item.fixture.id;
    const odds: BookmakerOdds = {};

    for (const bookmaker of item.bookmakers || []) {
      for (const bet of bookmaker.bets || []) {
        // Match Winner (1X2) - bet id 1
        if (bet.id === 1 || bet.name === 'Match Winner') {
          const home = bet.values.find((v: ApiOddsValue) => v.value === 'Home')?.odd;
          const draw = bet.values.find((v: ApiOddsValue) => v.value === 'Draw')?.odd;
          const away = bet.values.find((v: ApiOddsValue) => v.value === 'Away')?.odd;
          if (home && draw && away) {
            odds.matchResult = {
              home: parseFloat(home),
              draw: parseFloat(draw),
              away: parseFloat(away),
            };
          }
        }

        // Goals Over/Under - bet id 5 (contains 1.5, 2.5, 3.5)
        if (bet.id === 5 || bet.name === 'Goals Over/Under') {
          const o15 = bet.values.find((v: ApiOddsValue) => v.value === 'Over 1.5')?.odd;
          const u15 = bet.values.find((v: ApiOddsValue) => v.value === 'Under 1.5')?.odd;
          if (o15 && u15) {
            odds.overUnder15 = { over: parseFloat(o15), under: parseFloat(u15) };
          }
          const o25 = bet.values.find((v: ApiOddsValue) => v.value === 'Over 2.5')?.odd;
          const u25 = bet.values.find((v: ApiOddsValue) => v.value === 'Under 2.5')?.odd;
          if (o25 && u25) {
            odds.overUnder25 = { over: parseFloat(o25), under: parseFloat(u25) };
          }
          const o35 = bet.values.find((v: ApiOddsValue) => v.value === 'Over 3.5')?.odd;
          const u35 = bet.values.find((v: ApiOddsValue) => v.value === 'Under 3.5')?.odd;
          if (o35 && u35) {
            odds.overUnder35 = { over: parseFloat(o35), under: parseFloat(u35) };
          }
        }

        // Both Teams Score - bet id 8
        if (bet.id === 8 || bet.name === 'Both Teams Score') {
          const yes = bet.values.find((v: ApiOddsValue) => v.value === 'Yes')?.odd;
          const no = bet.values.find((v: ApiOddsValue) => v.value === 'No')?.odd;
          if (yes && no) {
            odds.btts = {
              yes: parseFloat(yes),
              no: parseFloat(no),
            };
          }
        }

        // Double Chance - bet id 12
        if (bet.id === 12 || bet.name === 'Double Chance') {
          const hd = bet.values.find((v: ApiOddsValue) => v.value === 'Home/Draw')?.odd;
          const ha = bet.values.find((v: ApiOddsValue) => v.value === 'Home/Away')?.odd;
          const da = bet.values.find((v: ApiOddsValue) => v.value === 'Draw/Away')?.odd;
          if (hd && ha && da) {
            odds.doubleChance = {
              homeOrDraw: parseFloat(hd),
              homeOrAway: parseFloat(ha),
              drawOrAway: parseFloat(da),
            };
          }
        }

        // First Half Winner - bet id 13
        if (bet.id === 13 || bet.name === 'First Half Winner') {
          const h = bet.values.find((v: ApiOddsValue) => v.value === 'Home')?.odd;
          const d = bet.values.find((v: ApiOddsValue) => v.value === 'Draw')?.odd;
          const a = bet.values.find((v: ApiOddsValue) => v.value === 'Away')?.odd;
          if (h && d && a) {
            odds.firstHalf = { home: parseFloat(h), draw: parseFloat(d), away: parseFloat(a) };
          }
        }
      }
      // Only need first bookmaker's data
      if (Object.keys(odds).length >= 3) break;
    }

    if (Object.keys(odds).length > 0) {
      oddsMap.set(fixtureId, odds);
    }
}

// Get H2H data
async function fetchH2H(teamId1: number, teamId2: number): Promise<H2H | null> {
  const data = await apiFetch<ApiResponse<ApiH2HFixture[]>>('/fixtures/headtohead', {
    h2h: `${teamId1}-${teamId2}`,
    last: '20',
  });

  if (!data || !data.response?.length) return null;

  let homeWins = 0, draws = 0, awayWins = 0, totalGoals = 0;
  const total = data.response.length;

  for (const match of data.response) {
    const hg = match.goals.home || 0;
    const ag = match.goals.away || 0;
    totalGoals += hg + ag;

    if (match.teams.home.id === teamId1) {
      if (hg > ag) homeWins++;
      else if (hg === ag) draws++;
      else awayWins++;
    } else {
      if (ag > hg) homeWins++;
      else if (hg === ag) draws++;
      else awayWins++;
    }
  }

  return {
    homeWins,
    draws,
    awayWins,
    totalMatches: total,
    avgGoals: Math.round((totalGoals / total) * 10) / 10,
  };
}

// Get team statistics for a season
export async function fetchTeamStats(teamId: number, leagueId: number): Promise<Partial<Team> | null> {
  const season = new Date().getFullYear();
  const data = await apiFetch<ApiResponse<ApiTeamStats[]>>('/teams/statistics', {
    team: teamId.toString(),
    league: leagueId.toString(),
    season: season.toString(),
  });

  if (!data || !data.response) return null;

  const stats = data.response as unknown as ApiTeamStatsResponse;

  return {
    goalsScored: stats.goals?.for?.total?.total || 0,
    goalsConceded: stats.goals?.against?.total?.total || 0,
    avgGoalsScored: parseFloat(stats.goals?.for?.average?.total || '0'),
    avgGoalsConceded: parseFloat(stats.goals?.against?.average?.total || '0'),
  };
}

// Get league standings
export async function fetchLeagueStandings(leagueId: number): Promise<LeagueStanding[] | null> {
  const season = new Date().getFullYear();
  const data = await apiFetch<ApiResponse<ApiStandingsResponse[]>>('/standings', {
    league: leagueId.toString(),
    season: season.toString(),
  });

  if (!data || !data.response?.length) return null;

  const standings = data.response[0]?.league?.standings?.[0];
  if (!standings) return null;

  return standings.map((s: ApiStandingEntry) => ({
    rank: s.rank,
    teamId: s.team.id,
    teamName: s.team.name,
    teamLogo: s.team.logo,
    played: s.all.played,
    won: s.all.win,
    drawn: s.all.draw,
    lost: s.all.lose,
    goalsFor: s.all.goals.for,
    goalsAgainst: s.all.goals.against,
    goalDiff: s.goalsDiff,
    points: s.points,
    form: s.form || '',
  }));
}

// Get top scorers
export async function fetchTopScorers(leagueId: number): Promise<TopScorer[] | null> {
  const season = new Date().getFullYear();
  const data = await apiFetch<ApiResponse<ApiTopScorer[]>>('/players/topscorers', {
    league: leagueId.toString(),
    season: season.toString(),
  });

  if (!data || !data.response?.length) return null;

  return data.response.slice(0, 10).map((p) => ({
    playerId: p.player.id,
    playerName: p.player.name,
    playerPhoto: p.player.photo,
    teamName: p.statistics[0]?.team?.name || '',
    teamLogo: p.statistics[0]?.team?.logo || '',
    goals: p.statistics[0]?.goals?.total || 0,
    assists: p.statistics[0]?.goals?.assists || 0,
    matches: p.statistics[0]?.games?.appearences || 0,
  }));
}

// --- Real team stats from standings ---

interface RealTeamStats {
  form: ('W' | 'D' | 'L')[];
  goalsFor: number;
  goalsAgainst: number;
  played: number;
  homeWin: number;
  homePlayed: number;
  awayWin: number;
  awayPlayed: number;
}

// Fetch standings for all leagues to get real team stats (uses 2024 season for free plan)
async function fetchAllTeamStats(leagueIds: number[]): Promise<Map<number, RealTeamStats>> {
  const statsMap = new Map<number, RealTeamStats>();

  // Use cache to avoid repeated requests
  // Using top-level import for api-cache

  // Free plan only supports 2022-2024 season
  const season = 2024;

  for (const leagueId of leagueIds) {
    const cacheKey = `team-stats-${leagueId}-${season}`;
    const cached = getCached<Map<number, RealTeamStats>>(cacheKey);
    if (cached) {
      // Merge cached entries
      cached.forEach((v, k) => statsMap.set(k, v));
      continue;
    }

    const data = await apiFetch<ApiResponse<ApiStandingsResponse[]>>('/standings', {
      league: leagueId.toString(),
      season: season.toString(),
    });

    if (!data?.response?.[0]) continue;

    const standings = (data.response[0] as any)?.league?.standings?.[0];
    if (!standings) continue;

    const leagueStats = new Map<number, RealTeamStats>();

    for (const s of standings) {
      const formStr = (s.form || '').substring(0, 5);
      const form: ('W' | 'D' | 'L')[] = formStr.split('').map((c: string) =>
        c === 'W' ? 'W' : c === 'D' ? 'D' : 'L'
      ).slice(0, 5) as ('W' | 'D' | 'L')[];

      const homePlayed = (s.home?.win || 0) + (s.home?.draw || 0) + (s.home?.lose || 0);
      const awayPlayed = (s.away?.win || 0) + (s.away?.draw || 0) + (s.away?.lose || 0);

      const stats: RealTeamStats = {
        form: form.length >= 3 ? form : ['W', 'D', 'L', 'W', 'D'],
        goalsFor: s.all?.goals?.for || 30,
        goalsAgainst: s.all?.goals?.against || 25,
        played: s.all?.played || 20,
        homeWin: s.home?.win || 5,
        homePlayed: homePlayed || 10,
        awayWin: s.away?.win || 3,
        awayPlayed: awayPlayed || 10,
      };

      statsMap.set(s.team.id, stats);
      leagueStats.set(s.team.id, stats);
    }

    setCache(cacheKey, leagueStats, CACHE_TTL.TEAM_STATS);
  }

  return statsMap;
}

// --- Helper functions ---

function mapTeam(
  apiTeam: { id: number; name: string; logo: string; winner?: boolean | null },
  isHome: boolean,
  teamStatsMap?: Map<number, RealTeamStats>
): Team {
  const id = apiTeam.id;
  const real = teamStatsMap?.get(id);

  if (real) {
    // Use REAL stats from API
    const played = Math.max(real.played, 1);
    return {
      id: id.toString(),
      name: apiTeam.name,
      shortName: apiTeam.name.replace(/^(Al |FC |AC |AS |SS |US |CD )/, '').substring(0, 3).toUpperCase(),
      logo: apiTeam.logo,
      form: real.form,
      goalsScored: real.goalsFor,
      goalsConceded: real.goalsAgainst,
      homeWinRate: real.homePlayed > 0 ? real.homeWin / real.homePlayed : 0.5,
      awayWinRate: real.awayPlayed > 0 ? real.awayWin / real.awayPlayed : 0.4,
      avgGoalsScored: Math.round((real.goalsFor / played) * 100) / 100,
      avgGoalsConceded: Math.round((real.goalsAgainst / played) * 100) / 100,
    };
  }

  // Fallback: seed-based stats for teams without standings data
  const r = (i: number) => {
    const x = Math.sin(id * 9301 + i * 49297) * 49297;
    return x - Math.floor(x);
  };

  const form: ('W' | 'D' | 'L')[] = [];
  for (let i = 0; i < 5; i++) {
    const val = r(i + 10);
    if (val < 0.45) form.push('W');
    else if (val < 0.7) form.push('D');
    else form.push('L');
  }

  const attackBase = 1.0 + r(1) * 1.8;
  const defenseBase = 0.6 + r(2) * 1.2;
  const played = 25 + Math.floor(r(3) * 10);

  return {
    id: id.toString(),
    name: apiTeam.name,
    shortName: apiTeam.name.replace(/^(Al |FC |AC |AS |SS |US |CD )/, '').substring(0, 3).toUpperCase(),
    logo: apiTeam.logo,
    form,
    goalsScored: Math.round(attackBase * played),
    goalsConceded: Math.round(defenseBase * played),
    homeWinRate: 0.40 + r(4) * 0.45,
    awayWinRate: 0.25 + r(5) * 0.45,
    avgGoalsScored: Math.round(attackBase * 100) / 100,
    avgGoalsConceded: Math.round(defenseBase * 100) / 100,
  };
}

function mapStatus(status: string): 'upcoming' | 'live' | 'finished' {
  if (['NS', 'TBD', 'PST', 'CANC'].includes(status)) return 'upcoming';
  if (['FT', 'AET', 'PEN'].includes(status)) return 'finished';
  return 'live';
}

// --- Exported types ---

export interface LeagueStanding {
  rank: number;
  teamId: number;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: string;
}

export interface TopScorer {
  playerId: number;
  playerName: string;
  playerPhoto: string;
  teamName: string;
  teamLogo: string;
  goals: number;
  assists: number;
  matches: number;
}

export const LEAGUE_IDS: Record<string, number> = {
  // Turkey
  'Super Lig': 203, 'TFF 1. Lig': 204,
  // England
  'Premier League': 39, 'Championship': 40, 'League One': 41, 'League Two': 42,
  // Spain
  'La Liga': 140, 'Segunda Division': 141,
  // Germany
  'Bundesliga': 78, '2. Bundesliga': 79, '3. Liga': 80,
  // Italy
  'Serie A': 135, 'Serie B': 136,
  // France
  'Ligue 1': 61, 'Ligue 2': 62,
  // Netherlands
  'Eredivisie': 88, 'Eerste Divisie': 89,
  // Portugal
  'Primeira Liga': 94, 'Segunda Liga': 95,
  // Belgium
  'Jupiler Pro League': 144,
  // Scotland
  'Scottish Premiership': 179,
  // Scandinavia
  'Superliga': 119, 'Eliteserien': 103, 'Allsvenskan': 113,
  // Central Europe
  'Super League': 207, 'Bundesliga Austria': 218,
  'Super League Greece': 197, 'Czech Liga': 345,
  'Ekstraklasa': 106, 'HNL': 210,
  // Eastern Europe
  'Super Liga Serbia': 286, 'Premier League Ukraine': 333,
  'Russian Premier League': 235,
  // Middle East
  'Saudi Pro League': 334, 'UAE Pro League': 307,
  // Americas
  'MLS': 253, 'Serie A Brazil': 71, 'Liga Profesional': 128, 'Liga MX': 262,
  // Asia
  'K-League': 292, 'J-League': 188,
  // UEFA
  'UEFA Champions League': 2, 'UEFA Europa League': 3, 'UEFA Europa Conference League': 848,
  // International
  'World Cup': 1, 'Euro Championship': 4, 'Copa America': 9, 'UEFA Nations League': 29,
};

function countryToCode(country: string): string {
  const map: Record<string, string> = {
    'Turkey': 'TR', 'Spain': 'ES', 'England': 'GB', 'France': 'FR',
    'Germany': 'DE', 'Italy': 'IT', 'Netherlands': 'NL', 'Portugal': 'PT',
    'Belgium': 'BE', 'Scotland': 'SC', 'Russia': 'RU',
    'Saudi-Arabia': 'SA', 'UAE': 'AE', 'USA': 'US',
    'World': 'WC', 'Brazil': 'BR', 'Argentina': 'AR',
    'Japan': 'JP', 'South-Korea': 'KR', 'China': 'CN',
    'Mexico': 'MX', 'Australia': 'AU', 'Greece': 'GR',
    'Austria': 'AT', 'Switzerland': 'CH', 'Poland': 'PL',
    'Ukraine': 'UA', 'Czech-Republic': 'CZ', 'Croatia': 'HR',
    'Serbia': 'RS', 'Denmark': 'DK', 'Sweden': 'SE',
    'Norway': 'NO', 'Finland': 'FI', 'Romania': 'RO',
    'Colombia': 'CO', 'Chile': 'CL', 'Egypt': 'EG',
    'Morocco': 'MA', 'Nigeria': 'NG', 'South-Africa': 'ZA',
    'India': 'IN', 'Qatar': 'QA',
  };
  return map[country] || country.substring(0, 2).toUpperCase();
}

// --- API type definitions ---

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
}

interface ApiH2HFixture {
  teams: {
    home: { id: number };
    away: { id: number };
  };
  goals: { home: number | null; away: number | null };
}

interface ApiTeamStats {
  // generic wrapper
}

interface ApiTeamStatsResponse {
  goals?: {
    for?: { total?: { total?: number }; average?: { total?: string } };
    against?: { total?: { total?: number }; average?: { total?: string } };
  };
}

interface ApiStandingsResponse {
  league?: {
    standings?: ApiStandingEntry[][];
  };
}

interface ApiStandingEntry {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  form: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

interface ApiTopScorer {
  player: { id: number; name: string; photo: string };
  statistics: {
    team?: { name?: string; logo?: string };
    goals?: { total?: number; assists?: number };
    games?: { appearences?: number };
  }[];
}

interface ApiOddsValue {
  value: string;
  odd: string;
}

interface ApiOddsFixture {
  fixture: { id: number };
  bookmakers: {
    id: number;
    name: string;
    bets: {
      id: number;
      name: string;
      values: ApiOddsValue[];
    }[];
  }[];
}
