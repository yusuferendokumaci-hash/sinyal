'use client';

import { Locale } from '@/lib/i18n';

interface TopScorerRow {
  rank: number;
  playerName: string;
  teamName: string;
  teamLogo: string;
  goals: number;
  assists: number;
  matches: number;
}

const mockScorers: Record<string, TopScorerRow[]> = {
  'Super Lig': [
    { rank: 1, playerName: 'M. Icardi', teamName: 'Galatasaray', teamLogo: '🦁', goals: 22, assists: 5, matches: 28 },
    { rank: 2, playerName: 'E. Dzeko', teamName: 'Fenerbahce', teamLogo: '🟡', goals: 18, assists: 7, matches: 27 },
    { rank: 3, playerName: 'C. Immobile', teamName: 'Besiktas', teamLogo: '🦅', goals: 15, assists: 4, matches: 26 },
  ],
  'La Liga': [
    { rank: 1, playerName: 'R. Lewandowski', teamName: 'Barcelona', teamLogo: '🔴', goals: 24, assists: 8, matches: 29 },
    { rank: 2, playerName: 'K. Mbappe', teamName: 'Real Madrid', teamLogo: '👑', goals: 21, assists: 10, matches: 28 },
  ],
  'Premier League': [
    { rank: 1, playerName: 'M. Salah', teamName: 'Liverpool', teamLogo: '🔴', goals: 20, assists: 12, matches: 28 },
    { rank: 2, playerName: 'E. Haaland', teamName: 'Man City', teamLogo: '🩵', goals: 19, assists: 3, matches: 25 },
    { rank: 3, playerName: 'A. Isak', teamName: 'Newcastle', teamLogo: '⬛', goals: 17, assists: 5, matches: 27 },
  ],
  'Bundesliga': [
    { rank: 1, playerName: 'H. Kane', teamName: 'Bayern Munich', teamLogo: '🔴', goals: 28, assists: 8, matches: 26 },
    { rank: 2, playerName: 'S. Guirassy', teamName: 'B. Dortmund', teamLogo: '🟡', goals: 18, assists: 4, matches: 25 },
  ],
  'Serie A': [
    { rank: 1, playerName: 'L. Martinez', teamName: 'Inter', teamLogo: '🔵', goals: 19, assists: 6, matches: 28 },
    { rank: 2, playerName: 'D. Vlahovic', teamName: 'Juventus', teamLogo: '⬛', goals: 16, assists: 3, matches: 27 },
  ],
  'Ligue 1': [
    { rank: 1, playerName: 'B. Barcola', teamName: 'PSG', teamLogo: '🔵', goals: 16, assists: 9, matches: 27 },
    { rank: 2, playerName: 'J. David', teamName: 'Lille', teamLogo: '🔴', goals: 15, assists: 4, matches: 26 },
  ],
  'Saudi Pro League': [
    { rank: 1, playerName: 'A. Mitrovic', teamName: 'Al Hilal', teamLogo: '🔵', goals: 22, assists: 5, matches: 24 },
    { rank: 2, playerName: 'C. Ronaldo', teamName: 'Al Nassr', teamLogo: '🟡', goals: 20, assists: 6, matches: 25 },
    { rank: 3, playerName: 'K. Benzema', teamName: 'Al Ittihad', teamLogo: '🟡', goals: 15, assists: 8, matches: 22 },
  ],
  'Eredivisie': [
    { rank: 1, playerName: 'L. de Jong', teamName: 'PSV', teamLogo: '🔴', goals: 18, assists: 5, matches: 26 },
    { rank: 2, playerName: 'B. Brobbey', teamName: 'Ajax', teamLogo: '🔴', goals: 14, assists: 3, matches: 25 },
  ],
};

interface TopScorersProps {
  league: string;
  locale: Locale;
}

export function TopScorers({ league, locale }: TopScorersProps) {
  const scorers = mockScorers[league] || [];
  if (scorers.length === 0) return null;

  return (
    <div className="space-y-2">
      {scorers.map((s) => (
        <div key={s.rank} className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-border">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            s.rank === 1 ? 'bg-gold/20 text-gold' : s.rank === 2 ? 'bg-muted/20 text-muted' : 'bg-orange-900/20 text-orange-400'
          }`}>
            {s.rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{s.playerName}</div>
            <div className="flex items-center gap-1 text-[10px] text-muted">
              <span>{s.teamLogo}</span>
              <span>{s.teamName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-center">
            <div>
              <div className="text-sm font-black text-accent">{s.goals}</div>
              <div className="text-[8px] text-muted">{locale === 'tr' ? 'GOL' : 'G'}</div>
            </div>
            <div>
              <div className="text-sm font-black text-gold">{s.assists}</div>
              <div className="text-[8px] text-muted">{locale === 'tr' ? 'AST' : 'A'}</div>
            </div>
            <div>
              <div className="text-sm font-bold text-muted">{s.matches}</div>
              <div className="text-[8px] text-muted">{locale === 'tr' ? 'MAC' : 'MP'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
