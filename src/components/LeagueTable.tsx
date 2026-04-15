'use client';

import { Locale } from '@/lib/i18n';

export interface LeagueStandingRow {
  rank: number;
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

// Mock league standings
const mockStandings: Record<string, LeagueStandingRow[]> = {
  'Super Lig': [
    { rank: 1, teamName: 'Galatasaray', teamLogo: '🦁', played: 30, won: 22, drawn: 5, lost: 3, goalsFor: 58, goalsAgainst: 21, goalDiff: 37, points: 71, form: 'WWDWW' },
    { rank: 2, teamName: 'Fenerbahce', teamLogo: '🟡', played: 30, won: 20, drawn: 6, lost: 4, goalsFor: 52, goalsAgainst: 24, goalDiff: 28, points: 66, form: 'WDWLW' },
    { rank: 3, teamName: 'Besiktas', teamLogo: '🦅', played: 30, won: 16, drawn: 7, lost: 7, goalsFor: 44, goalsAgainst: 30, goalDiff: 14, points: 55, form: 'LWDWD' },
    { rank: 4, teamName: 'Trabzonspor', teamLogo: '🔵', played: 30, won: 13, drawn: 9, lost: 8, goalsFor: 38, goalsAgainst: 33, goalDiff: 5, points: 48, form: 'DLWWD' },
  ],
  'La Liga': [
    { rank: 1, teamName: 'FC Barcelona', teamLogo: '🔴', played: 30, won: 24, drawn: 3, lost: 3, goalsFor: 72, goalsAgainst: 28, goalDiff: 44, points: 75, form: 'WWLWW' },
    { rank: 2, teamName: 'Real Madrid', teamLogo: '👑', played: 30, won: 23, drawn: 4, lost: 3, goalsFor: 68, goalsAgainst: 22, goalDiff: 46, points: 73, form: 'WWWDW' },
  ],
  'Premier League': [
    { rank: 1, teamName: 'Liverpool', teamLogo: '🔴', played: 30, won: 22, drawn: 5, lost: 3, goalsFor: 65, goalsAgainst: 25, goalDiff: 40, points: 71, form: 'WDWWW' },
    { rank: 2, teamName: 'Manchester City', teamLogo: '🩵', played: 30, won: 20, drawn: 6, lost: 4, goalsFor: 62, goalsAgainst: 27, goalDiff: 35, points: 66, form: 'DWWLW' },
  ],
  'Bundesliga': [
    { rank: 1, teamName: 'Bayern Munich', teamLogo: '🔴', played: 28, won: 22, drawn: 4, lost: 2, goalsFor: 75, goalsAgainst: 24, goalDiff: 51, points: 70, form: 'WWDWW' },
    { rank: 2, teamName: 'B. Dortmund', teamLogo: '🟡', played: 28, won: 17, drawn: 5, lost: 6, goalsFor: 55, goalsAgainst: 36, goalDiff: 19, points: 56, form: 'WDLWD' },
  ],
  'Ligue 1': [
    { rank: 1, teamName: 'PSG', teamLogo: '🔵', played: 29, won: 24, drawn: 3, lost: 2, goalsFor: 70, goalsAgainst: 20, goalDiff: 50, points: 75, form: 'WWWDW' },
    { rank: 2, teamName: 'O. Marseille', teamLogo: '⚪', played: 29, won: 14, drawn: 8, lost: 7, goalsFor: 45, goalsAgainst: 35, goalDiff: 10, points: 50, form: 'WLDWL' },
  ],
  'Serie A': [
    { rank: 1, teamName: 'Juventus', teamLogo: '⬛', played: 29, won: 18, drawn: 8, lost: 3, goalsFor: 48, goalsAgainst: 22, goalDiff: 26, points: 62, form: 'DWDWW' },
    { rank: 2, teamName: 'AC Milan', teamLogo: '🔴', played: 29, won: 16, drawn: 6, lost: 7, goalsFor: 50, goalsAgainst: 30, goalDiff: 20, points: 54, form: 'LWWDW' },
    { rank: 3, teamName: 'Inter', teamLogo: '🔵', played: 29, won: 17, drawn: 5, lost: 7, goalsFor: 55, goalsAgainst: 28, goalDiff: 27, points: 56, form: 'WWDLW' },
    { rank: 4, teamName: 'Napoli', teamLogo: '🔵', played: 29, won: 15, drawn: 7, lost: 7, goalsFor: 46, goalsAgainst: 29, goalDiff: 17, points: 52, form: 'WDWWL' },
  ],
  'Eredivisie': [
    { rank: 1, teamName: 'PSV', teamLogo: '🔴', played: 28, won: 24, drawn: 2, lost: 2, goalsFor: 82, goalsAgainst: 22, goalDiff: 60, points: 74, form: 'WWWWW' },
    { rank: 2, teamName: 'Ajax', teamLogo: '🔴', played: 28, won: 18, drawn: 5, lost: 5, goalsFor: 65, goalsAgainst: 30, goalDiff: 35, points: 59, form: 'WDWWL' },
    { rank: 3, teamName: 'Feyenoord', teamLogo: '🔴', played: 28, won: 17, drawn: 4, lost: 7, goalsFor: 60, goalsAgainst: 35, goalDiff: 25, points: 55, form: 'LWWDW' },
  ],
  'Primeira Liga': [
    { rank: 1, teamName: 'Sporting CP', teamLogo: '🟢', played: 28, won: 22, drawn: 4, lost: 2, goalsFor: 68, goalsAgainst: 18, goalDiff: 50, points: 70, form: 'WWDWW' },
    { rank: 2, teamName: 'Benfica', teamLogo: '🔴', played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 65, goalsAgainst: 22, goalDiff: 43, points: 65, form: 'WDWWW' },
    { rank: 3, teamName: 'Porto', teamLogo: '🔵', played: 28, won: 19, drawn: 3, lost: 6, goalsFor: 58, goalsAgainst: 25, goalDiff: 33, points: 60, form: 'WWLWW' },
  ],
  'Saudi Pro League': [
    { rank: 1, teamName: 'Al Hilal', teamLogo: '🔵', played: 26, won: 22, drawn: 3, lost: 1, goalsFor: 65, goalsAgainst: 15, goalDiff: 50, points: 69, form: 'WWWWW' },
    { rank: 2, teamName: 'Al Ittihad', teamLogo: '🟡', played: 26, won: 17, drawn: 5, lost: 4, goalsFor: 52, goalsAgainst: 24, goalDiff: 28, points: 56, form: 'WDWWL' },
    { rank: 3, teamName: 'Al Nassr', teamLogo: '🟡', played: 26, won: 16, drawn: 4, lost: 6, goalsFor: 50, goalsAgainst: 28, goalDiff: 22, points: 52, form: 'WWDLW' },
    { rank: 4, teamName: 'Al Ahli', teamLogo: '🟢', played: 26, won: 14, drawn: 6, lost: 6, goalsFor: 45, goalsAgainst: 30, goalDiff: 15, points: 48, form: 'DLWWW' },
  ],
  'Championship': [
    { rank: 1, teamName: 'Leeds United', teamLogo: '⚪', played: 38, won: 24, drawn: 8, lost: 6, goalsFor: 68, goalsAgainst: 32, goalDiff: 36, points: 80, form: 'WWDWW' },
    { rank: 2, teamName: 'Sheffield Utd', teamLogo: '🔴', played: 38, won: 22, drawn: 9, lost: 7, goalsFor: 62, goalsAgainst: 35, goalDiff: 27, points: 75, form: 'WDWWL' },
    { rank: 3, teamName: 'Burnley', teamLogo: '🔵', played: 38, won: 21, drawn: 8, lost: 9, goalsFor: 58, goalsAgainst: 38, goalDiff: 20, points: 71, form: 'WLWWD' },
  ],
  'MLS': [
    { rank: 1, teamName: 'Inter Miami', teamLogo: '🩷', played: 10, won: 7, drawn: 2, lost: 1, goalsFor: 22, goalsAgainst: 10, goalDiff: 12, points: 23, form: 'WWDWW' },
    { rank: 2, teamName: 'LAFC', teamLogo: '⬛', played: 10, won: 6, drawn: 2, lost: 2, goalsFor: 18, goalsAgainst: 12, goalDiff: 6, points: 20, form: 'WDWLW' },
    { rank: 3, teamName: 'Atlanta United', teamLogo: '🔴', played: 10, won: 5, drawn: 3, lost: 2, goalsFor: 15, goalsAgainst: 10, goalDiff: 5, points: 18, form: 'DWWDL' },
  ],
  'Eerste Divisie': [
    { rank: 1, teamName: 'NAC Breda', teamLogo: '🟡', played: 30, won: 20, drawn: 5, lost: 5, goalsFor: 58, goalsAgainst: 28, goalDiff: 30, points: 65, form: 'WWDWL' },
    { rank: 2, teamName: 'De Graafschap', teamLogo: '🔵', played: 30, won: 18, drawn: 6, lost: 6, goalsFor: 52, goalsAgainst: 30, goalDiff: 22, points: 60, form: 'WDWWW' },
    { rank: 3, teamName: 'FC Emmen', teamLogo: '🔴', played: 30, won: 17, drawn: 5, lost: 8, goalsFor: 48, goalsAgainst: 32, goalDiff: 16, points: 56, form: 'LWWDW' },
  ],
  'TFF 1. Lig': [
    { rank: 1, teamName: 'Eyupspor', teamLogo: '🟡', played: 28, won: 18, drawn: 6, lost: 4, goalsFor: 48, goalsAgainst: 20, goalDiff: 28, points: 60, form: 'WWDWW' },
    { rank: 2, teamName: 'Goztepe', teamLogo: '🟡', played: 28, won: 17, drawn: 5, lost: 6, goalsFor: 45, goalsAgainst: 25, goalDiff: 20, points: 56, form: 'WDWLW' },
    { rank: 3, teamName: 'Sakaryaspor', teamLogo: '🟢', played: 28, won: 16, drawn: 6, lost: 6, goalsFor: 42, goalsAgainst: 24, goalDiff: 18, points: 54, form: 'DWWWL' },
  ],
  '2. Bundesliga': [
    { rank: 1, teamName: 'HSV', teamLogo: '🔵', played: 28, won: 17, drawn: 7, lost: 4, goalsFor: 50, goalsAgainst: 25, goalDiff: 25, points: 58, form: 'WDWWW' },
    { rank: 2, teamName: 'Köln', teamLogo: '🔴', played: 28, won: 16, drawn: 6, lost: 6, goalsFor: 48, goalsAgainst: 28, goalDiff: 20, points: 54, form: 'WWDLW' },
    { rank: 3, teamName: 'Hertha BSC', teamLogo: '🔵', played: 28, won: 15, drawn: 5, lost: 8, goalsFor: 44, goalsAgainst: 32, goalDiff: 12, points: 50, form: 'LWWWW' },
  ],
  'Serie B': [
    { rank: 1, teamName: 'Sassuolo', teamLogo: '🟢', played: 30, won: 21, drawn: 5, lost: 4, goalsFor: 56, goalsAgainst: 22, goalDiff: 34, points: 68, form: 'WWWDW' },
    { rank: 2, teamName: 'Pisa', teamLogo: '🔵', played: 30, won: 18, drawn: 7, lost: 5, goalsFor: 48, goalsAgainst: 25, goalDiff: 23, points: 61, form: 'DWWWL' },
    { rank: 3, teamName: 'Spezia', teamLogo: '⚪', played: 30, won: 17, drawn: 6, lost: 7, goalsFor: 45, goalsAgainst: 28, goalDiff: 17, points: 57, form: 'WLWDW' },
  ],
  'Superliga': [
    { rank: 1, teamName: 'FC Midtjylland', teamLogo: '🔴', played: 26, won: 17, drawn: 5, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDiff: 28, points: 56, form: 'WWDWW' },
    { rank: 2, teamName: 'FC Copenhagen', teamLogo: '🔵', played: 26, won: 16, drawn: 4, lost: 6, goalsFor: 48, goalsAgainst: 25, goalDiff: 23, points: 52, form: 'WDWLW' },
    { rank: 3, teamName: 'Brøndby', teamLogo: '🟡', played: 26, won: 14, drawn: 6, lost: 6, goalsFor: 42, goalsAgainst: 28, goalDiff: 14, points: 48, form: 'DWWWL' },
  ],
  'Eliteserien': [
    { rank: 1, teamName: 'Bodø/Glimt', teamLogo: '🟡', played: 20, won: 14, drawn: 3, lost: 3, goalsFor: 48, goalsAgainst: 18, goalDiff: 30, points: 45, form: 'WWWDW' },
    { rank: 2, teamName: 'Molde', teamLogo: '🔵', played: 20, won: 12, drawn: 4, lost: 4, goalsFor: 40, goalsAgainst: 22, goalDiff: 18, points: 40, form: 'WDWWL' },
    { rank: 3, teamName: 'Rosenborg', teamLogo: '⬛', played: 20, won: 11, drawn: 5, lost: 4, goalsFor: 35, goalsAgainst: 20, goalDiff: 15, points: 38, form: 'DWWLW' },
  ],
  'Allsvenskan': [
    { rank: 1, teamName: 'Malmö FF', teamLogo: '🔵', played: 22, won: 15, drawn: 4, lost: 3, goalsFor: 45, goalsAgainst: 18, goalDiff: 27, points: 49, form: 'WWWDW' },
    { rank: 2, teamName: 'AIK', teamLogo: '⬛', played: 22, won: 13, drawn: 5, lost: 4, goalsFor: 38, goalsAgainst: 20, goalDiff: 18, points: 44, form: 'WDWWL' },
    { rank: 3, teamName: 'Djurgården', teamLogo: '🔵', played: 22, won: 12, drawn: 4, lost: 6, goalsFor: 36, goalsAgainst: 24, goalDiff: 12, points: 40, form: 'LWWWW' },
  ],
  'Super League': [
    { rank: 1, teamName: 'Young Boys', teamLogo: '🟡', played: 28, won: 19, drawn: 5, lost: 4, goalsFor: 62, goalsAgainst: 28, goalDiff: 34, points: 62, form: 'WDWWW' },
    { rank: 2, teamName: 'FC Basel', teamLogo: '🔴', played: 28, won: 17, drawn: 6, lost: 5, goalsFor: 55, goalsAgainst: 30, goalDiff: 25, points: 57, form: 'WWDLW' },
    { rank: 3, teamName: 'FC Lugano', teamLogo: '⬛', played: 28, won: 15, drawn: 5, lost: 8, goalsFor: 45, goalsAgainst: 32, goalDiff: 13, points: 50, form: 'WLWWD' },
  ],
  'Ekstraklasa': [
    { rank: 1, teamName: 'Legia Warszawa', teamLogo: '🟢', played: 28, won: 18, drawn: 6, lost: 4, goalsFor: 52, goalsAgainst: 22, goalDiff: 30, points: 60, form: 'WWDWW' },
    { rank: 2, teamName: 'Jagiellonia', teamLogo: '🟡', played: 28, won: 17, drawn: 5, lost: 6, goalsFor: 48, goalsAgainst: 26, goalDiff: 22, points: 56, form: 'WDWWL' },
  ],
  'Liga MX': [
    { rank: 1, teamName: 'Club América', teamLogo: '🟡', played: 14, won: 10, drawn: 2, lost: 2, goalsFor: 28, goalsAgainst: 12, goalDiff: 16, points: 32, form: 'WWWDW' },
    { rank: 2, teamName: 'Tigres UANL', teamLogo: '🟡', played: 14, won: 9, drawn: 3, lost: 2, goalsFor: 25, goalsAgainst: 14, goalDiff: 11, points: 30, form: 'DWWWL' },
  ],
};

interface LeagueTableProps {
  league: string;
  locale: Locale;
}

export function LeagueTable({ league, locale }: LeagueTableProps) {
  const standings = mockStandings[league] || [];

  if (standings.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted border-b border-border">
            <th className="text-left py-2 px-2 w-6">#</th>
            <th className="text-left py-2 px-2">{locale === 'tr' ? 'Takim' : 'Team'}</th>
            <th className="text-center py-2 px-1 w-6">O</th>
            <th className="text-center py-2 px-1 w-6">G</th>
            <th className="text-center py-2 px-1 w-6">B</th>
            <th className="text-center py-2 px-1 w-6">M</th>
            <th className="text-center py-2 px-1 w-10">A</th>
            <th className="text-center py-2 px-1 w-10 hidden sm:table-cell">AV</th>
            <th className="text-center py-2 px-2 w-8 font-bold">P</th>
            <th className="text-center py-2 px-1 hidden sm:table-cell">{locale === 'tr' ? 'Form' : 'Form'}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => (
            <tr key={row.rank} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
              <td className="py-2 px-2">
                <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                  row.rank <= 1 ? 'bg-accent/20 text-accent' : row.rank <= 3 ? 'bg-blue-500/20 text-blue-400' : 'bg-surface text-muted'
                }`}>
                  {row.rank}
                </span>
              </td>
              <td className="py-2 px-2 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>{row.teamLogo}</span>
                  <span className="truncate max-w-[100px]">{row.teamName}</span>
                </div>
              </td>
              <td className="text-center py-2 px-1 text-muted">{row.played}</td>
              <td className="text-center py-2 px-1 text-accent">{row.won}</td>
              <td className="text-center py-2 px-1 text-gold">{row.drawn}</td>
              <td className="text-center py-2 px-1 text-danger">{row.lost}</td>
              <td className="text-center py-2 px-1 text-muted">{row.goalsFor}-{row.goalsAgainst}</td>
              <td className="text-center py-2 px-1 hidden sm:table-cell">
                <span className={row.goalDiff > 0 ? 'text-accent' : row.goalDiff < 0 ? 'text-danger' : 'text-muted'}>
                  {row.goalDiff > 0 ? '+' : ''}{row.goalDiff}
                </span>
              </td>
              <td className="text-center py-2 px-2 font-black">{row.points}</td>
              <td className="py-2 px-1 hidden sm:table-cell">
                <div className="flex items-center gap-0.5 justify-center">
                  {row.form.split('').map((f, i) => (
                    <span
                      key={i}
                      className={`w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center ${
                        f === 'W' ? 'bg-accent/20 text-accent' : f === 'D' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function getAvailableLeagues(): string[] {
  return Object.keys(mockStandings);
}
