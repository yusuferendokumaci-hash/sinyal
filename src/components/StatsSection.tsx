'use client';

import { Match } from '@/lib/mock-data';
import { Locale, t } from '@/lib/i18n';
import { BarChart3, Users, Swords } from 'lucide-react';
import { TeamLogo } from './TeamLogo';

interface StatsSectionProps {
  match: Match;
  locale: Locale;
  embedded?: boolean;
}

export function StatsSection({ match, locale, embedded }: StatsSectionProps) {
  const h = match.homeTeam;
  const a = match.awayTeam;
  const h2h = match.h2h;

  const content = (
    <>
      {/* Team Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <TeamStats team={h} locale={locale} isHome={true} />
        <TeamStats team={a} locale={locale} isHome={false} />
      </div>

      {/* H2H */}
      <div className="border-t border-border pt-5">
        <div className="flex items-center gap-2 mb-4">
          <Swords className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold">{t(locale, 'h2h')}</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label={t(locale, 'totalMatches')} value={h2h.totalMatches.toString()} />
          <StatBox label={t(locale, 'homeWins')} value={h2h.homeWins.toString()} color="accent" />
          <StatBox label={t(locale, 'draws')} value={h2h.draws.toString()} color="gold" />
          <StatBox label={t(locale, 'awayWins')} value={h2h.awayWins.toString()} color="blue" />
        </div>

        {/* H2H Bar */}
        <div className="mt-4">
          <div className="flex h-3 rounded-full overflow-hidden bg-border/50">
            <div
              className="bg-accent transition-all"
              style={{ width: `${(h2h.homeWins / h2h.totalMatches) * 100}%` }}
            />
            <div
              className="bg-gold transition-all"
              style={{ width: `${(h2h.draws / h2h.totalMatches) * 100}%` }}
            />
            <div
              className="bg-blue-500 transition-all"
              style={{ width: `${(h2h.awayWins / h2h.totalMatches) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted">
            <span>{h.shortName} {Math.round((h2h.homeWins / h2h.totalMatches) * 100)}%</span>
            <span>{t(locale, 'draw')} {Math.round((h2h.draws / h2h.totalMatches) * 100)}%</span>
            <span>{a.shortName} {Math.round((h2h.awayWins / h2h.totalMatches) * 100)}%</span>
          </div>
        </div>
      </div>
    </>
  );

  if (embedded) return content;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-orange-400" />
        </div>
        <h2 className="text-lg font-bold">{t(locale, 'stats')}</h2>
      </div>
      {content}
    </div>
  );
}

function TeamStats({ team, locale, isHome }: { team: Match['homeTeam']; locale: Locale; isHome: boolean }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <TeamLogo logo={team.logo} name={team.name} size="md" />
        <div>
          <div className="text-sm font-bold">{team.name}</div>
          <div className="text-[10px] text-muted">{isHome ? t(locale, 'home') : t(locale, 'away')}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MiniStat label={t(locale, 'goalsScored')} value={team.goalsScored.toString()} />
        <MiniStat label={t(locale, 'goalsConceded')} value={team.goalsConceded.toString()} />
        <MiniStat label={`${t(locale, 'avgGoals')}/M`} value={team.avgGoalsScored.toFixed(1)} />
        <MiniStat label={isHome ? `${t(locale, 'home')} %` : `${t(locale, 'away')} %`} value={`${Math.round((isHome ? team.homeWinRate : team.awayWinRate) * 100)}%`} />
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  const colorClass = color === 'accent' ? 'text-accent' : color === 'gold' ? 'text-gold' : color === 'blue' ? 'text-blue-400' : 'text-foreground';
  return (
    <div className="bg-surface rounded-xl p-3 border border-border text-center">
      <div className={`text-xl font-black ${colorClass}`}>{value}</div>
      <div className="text-[10px] text-muted mt-0.5">{label}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center py-1.5">
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[9px] text-muted">{label}</div>
    </div>
  );
}
