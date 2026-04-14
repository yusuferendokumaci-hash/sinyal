'use client';

import { Team } from '@/lib/mock-data';
import { Locale, t } from '@/lib/i18n';

interface FormChartProps {
  homeTeam: Team;
  awayTeam: Team;
  locale: Locale;
}

export function FormChart({ homeTeam, awayTeam, locale }: FormChartProps) {
  const getPoints = (form: ('W' | 'D' | 'L')[]) =>
    form.map((f) => (f === 'W' ? 3 : f === 'D' ? 1 : 0));

  const homePoints = getPoints(homeTeam.form);
  const awayPoints = getPoints(awayTeam.form);

  const maxPt = 3;
  const labels = ['M-5', 'M-4', 'M-3', 'M-2', 'M-1'];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-xs text-muted">{homeTeam.shortName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{awayTeam.shortName}</span>
          <div className="w-3 h-3 rounded-full bg-gold" />
        </div>
      </div>

      <div className="relative h-32 bg-surface rounded-xl border border-border p-3">
        {/* Grid lines */}
        {[0, 1, 2, 3].map((v) => (
          <div
            key={v}
            className="absolute left-3 right-3 border-t border-border/30"
            style={{ bottom: `${12 + (v / maxPt) * (128 - 24)}px` }}
          />
        ))}

        {/* SVG lines */}
        <svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)]" viewBox="0 0 400 100" preserveAspectRatio="none">
          {/* Home team line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={homePoints.map((p, i) => `${(i / 4) * 400},${100 - (p / maxPt) * 100}`).join(' ')}
          />
          {/* Away team line */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 4"
            points={awayPoints.map((p, i) => `${(i / 4) * 400},${100 - (p / maxPt) * 100}`).join(' ')}
          />
          {/* Home dots */}
          {homePoints.map((p, i) => (
            <circle key={`h${i}`} cx={(i / 4) * 400} cy={100 - (p / maxPt) * 100} r="5" fill="#10b981" />
          ))}
          {/* Away dots */}
          {awayPoints.map((p, i) => (
            <circle key={`a${i}`} cx={(i / 4) * 400} cy={100 - (p / maxPt) * 100} r="5" fill="#f59e0b" />
          ))}
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-3 right-3 flex justify-between">
          {labels.map((l) => (
            <span key={l} className="text-[9px] text-muted/50">{l}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <span className="text-[10px] text-muted">W=3 D=1 L=0</span>
      </div>
    </div>
  );
}
