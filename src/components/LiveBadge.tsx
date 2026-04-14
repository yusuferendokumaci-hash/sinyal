'use client';

import { Locale } from '@/lib/i18n';

interface LiveBadgeProps {
  status: 'upcoming' | 'live' | 'finished';
  locale: Locale;
  score?: { home: number; away: number };
}

export function LiveBadge({ status, locale, score }: LiveBadgeProps) {
  if (status === 'live') {
    return (
      <div className="flex items-center gap-1.5 bg-danger/15 border border-danger/30 rounded-full px-2.5 py-1">
        <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
        <span className="text-[10px] font-bold text-danger">CANLI</span>
        {score && (
          <span className="text-xs font-black text-foreground ml-1">
            {score.home} - {score.away}
          </span>
        )}
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="flex items-center gap-1.5 bg-muted/15 border border-muted/30 rounded-full px-2.5 py-1">
        <span className="text-[10px] font-bold text-muted">
          {locale === 'tr' ? 'BITTI' : 'FT'}
        </span>
        {score && (
          <span className="text-xs font-black text-foreground ml-1">
            {score.home} - {score.away}
          </span>
        )}
      </div>
    );
  }

  return null;
}
