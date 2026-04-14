export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  form: ('W' | 'D' | 'L')[];
  goalsScored: number;
  goalsConceded: number;
  homeWinRate: number;
  awayWinRate: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
}

export interface H2H {
  homeWins: number;
  draws: number;
  awayWins: number;
  totalMatches: number;
  avgGoals: number;
}

export interface BookmakerOdds {
  matchResult?: { home: number; draw: number; away: number };
  overUnder15?: { over: number; under: number };
  overUnder25?: { over: number; under: number };
  overUnder35?: { over: number; under: number };
  btts?: { yes: number; no: number };
  doubleChance?: { homeOrDraw: number; homeOrAway: number; drawOrAway: number };
  firstHalf?: { home: number; draw: number; away: number };
}

export interface Match {
  id: string;
  league: string;
  leagueCountry: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoff: string;
  h2h: H2H;
  status: 'upcoming' | 'live' | 'finished';
  odds?: BookmakerOdds;
}

const teams: Record<string, Team> = {
  galatasaray: {
    id: 'galatasaray',
    name: 'Galatasaray',
    shortName: 'GAL',
    logo: '🦁',
    form: ['W', 'W', 'D', 'W', 'W'],
    goalsScored: 58,
    goalsConceded: 21,
    homeWinRate: 0.82,
    awayWinRate: 0.64,
    avgGoalsScored: 2.3,
    avgGoalsConceded: 0.8,
  },
  fenerbahce: {
    id: 'fenerbahce',
    name: 'Fenerbahce',
    shortName: 'FB',
    logo: '🟡',
    form: ['W', 'D', 'W', 'L', 'W'],
    goalsScored: 52,
    goalsConceded: 24,
    homeWinRate: 0.78,
    awayWinRate: 0.56,
    avgGoalsScored: 2.1,
    avgGoalsConceded: 0.9,
  },
  besiktas: {
    id: 'besiktas',
    name: 'Besiktas',
    shortName: 'BJK',
    logo: '🦅',
    form: ['L', 'W', 'D', 'W', 'D'],
    goalsScored: 44,
    goalsConceded: 30,
    homeWinRate: 0.68,
    awayWinRate: 0.48,
    avgGoalsScored: 1.8,
    avgGoalsConceded: 1.2,
  },
  trabzonspor: {
    id: 'trabzonspor',
    name: 'Trabzonspor',
    shortName: 'TS',
    logo: '🔵',
    form: ['D', 'L', 'W', 'W', 'D'],
    goalsScored: 38,
    goalsConceded: 33,
    homeWinRate: 0.62,
    awayWinRate: 0.40,
    avgGoalsScored: 1.5,
    avgGoalsConceded: 1.3,
  },
  realmadrid: {
    id: 'realmadrid',
    name: 'Real Madrid',
    shortName: 'RMA',
    logo: '👑',
    form: ['W', 'W', 'W', 'D', 'W'],
    goalsScored: 68,
    goalsConceded: 22,
    homeWinRate: 0.88,
    awayWinRate: 0.72,
    avgGoalsScored: 2.6,
    avgGoalsConceded: 0.8,
  },
  barcelona: {
    id: 'barcelona',
    name: 'FC Barcelona',
    shortName: 'BAR',
    logo: '🔴',
    form: ['W', 'W', 'L', 'W', 'W'],
    goalsScored: 72,
    goalsConceded: 28,
    homeWinRate: 0.85,
    awayWinRate: 0.68,
    avgGoalsScored: 2.8,
    avgGoalsConceded: 1.1,
  },
  liverpool: {
    id: 'liverpool',
    name: 'Liverpool',
    shortName: 'LIV',
    logo: '🔴',
    form: ['W', 'D', 'W', 'W', 'W'],
    goalsScored: 65,
    goalsConceded: 25,
    homeWinRate: 0.84,
    awayWinRate: 0.66,
    avgGoalsScored: 2.4,
    avgGoalsConceded: 0.9,
  },
  mancity: {
    id: 'mancity',
    name: 'Manchester City',
    shortName: 'MCI',
    logo: '🩵',
    form: ['D', 'W', 'W', 'L', 'W'],
    goalsScored: 62,
    goalsConceded: 27,
    homeWinRate: 0.80,
    awayWinRate: 0.70,
    avgGoalsScored: 2.3,
    avgGoalsConceded: 1.0,
  },
  psg: {
    id: 'psg',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    logo: '🔵',
    form: ['W', 'W', 'W', 'D', 'W'],
    goalsScored: 70,
    goalsConceded: 20,
    homeWinRate: 0.90,
    awayWinRate: 0.74,
    avgGoalsScored: 2.7,
    avgGoalsConceded: 0.7,
  },
  marseille: {
    id: 'marseille',
    name: 'Olympique Marseille',
    shortName: 'OM',
    logo: '⚪',
    form: ['W', 'L', 'D', 'W', 'L'],
    goalsScored: 45,
    goalsConceded: 35,
    homeWinRate: 0.65,
    awayWinRate: 0.45,
    avgGoalsScored: 1.7,
    avgGoalsConceded: 1.3,
  },
  bayernmunich: {
    id: 'bayernmunich',
    name: 'Bayern Munich',
    shortName: 'BAY',
    logo: '🔴',
    form: ['W', 'W', 'D', 'W', 'W'],
    goalsScored: 75,
    goalsConceded: 24,
    homeWinRate: 0.88,
    awayWinRate: 0.72,
    avgGoalsScored: 2.9,
    avgGoalsConceded: 0.9,
  },
  dortmund: {
    id: 'dortmund',
    name: 'Borussia Dortmund',
    shortName: 'BVB',
    logo: '🟡',
    form: ['W', 'D', 'L', 'W', 'D'],
    goalsScored: 55,
    goalsConceded: 36,
    homeWinRate: 0.74,
    awayWinRate: 0.52,
    avgGoalsScored: 2.1,
    avgGoalsConceded: 1.4,
  },
  juventus: {
    id: 'juventus',
    name: 'Juventus',
    shortName: 'JUV',
    logo: '⬛',
    form: ['D', 'W', 'D', 'W', 'W'],
    goalsScored: 48,
    goalsConceded: 22,
    homeWinRate: 0.76,
    awayWinRate: 0.58,
    avgGoalsScored: 1.8,
    avgGoalsConceded: 0.8,
  },
  acmilan: {
    id: 'acmilan',
    name: 'AC Milan',
    shortName: 'MIL',
    logo: '🔴',
    form: ['L', 'W', 'W', 'D', 'W'],
    goalsScored: 50,
    goalsConceded: 30,
    homeWinRate: 0.72,
    awayWinRate: 0.50,
    avgGoalsScored: 1.9,
    avgGoalsConceded: 1.1,
  },
};

export const matches: Match[] = [
  {
    id: '1',
    league: 'Super Lig',
    leagueCountry: 'TR',
    homeTeam: teams.galatasaray,
    awayTeam: teams.fenerbahce,
    kickoff: '21:00',
    h2h: { homeWins: 42, draws: 28, awayWins: 36, totalMatches: 106, avgGoals: 2.4 },
    status: 'upcoming',
  },
  {
    id: '2',
    league: 'Super Lig',
    leagueCountry: 'TR',
    homeTeam: teams.besiktas,
    awayTeam: teams.trabzonspor,
    kickoff: '19:00',
    h2h: { homeWins: 35, draws: 22, awayWins: 28, totalMatches: 85, avgGoals: 2.6 },
    status: 'upcoming',
  },
  {
    id: '3',
    league: 'La Liga',
    leagueCountry: 'ES',
    homeTeam: teams.realmadrid,
    awayTeam: teams.barcelona,
    kickoff: '22:00',
    h2h: { homeWins: 105, draws: 52, awayWins: 100, totalMatches: 257, avgGoals: 2.8 },
    status: 'upcoming',
  },
  {
    id: '4',
    league: 'Premier League',
    leagueCountry: 'GB',
    homeTeam: teams.liverpool,
    awayTeam: teams.mancity,
    kickoff: '18:30',
    h2h: { homeWins: 55, draws: 32, awayWins: 48, totalMatches: 135, avgGoals: 2.7 },
    status: 'upcoming',
  },
  {
    id: '5',
    league: 'Ligue 1',
    leagueCountry: 'FR',
    homeTeam: teams.psg,
    awayTeam: teams.marseille,
    kickoff: '21:45',
    h2h: { homeWins: 28, draws: 16, awayWins: 22, totalMatches: 66, avgGoals: 2.5 },
    status: 'upcoming',
  },
  {
    id: '6',
    league: 'Bundesliga',
    leagueCountry: 'DE',
    homeTeam: teams.bayernmunich,
    awayTeam: teams.dortmund,
    kickoff: '20:30',
    h2h: { homeWins: 60, draws: 24, awayWins: 40, totalMatches: 124, avgGoals: 3.1 },
    status: 'upcoming',
  },
  {
    id: '7',
    league: 'Serie A',
    leagueCountry: 'IT',
    homeTeam: teams.juventus,
    awayTeam: teams.acmilan,
    kickoff: '20:45',
    h2h: { homeWins: 72, draws: 48, awayWins: 52, totalMatches: 172, avgGoals: 2.3 },
    status: 'upcoming',
  },
];

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function getLeagues(): string[] {
  return [...new Set(matches.map((m) => m.league))];
}
