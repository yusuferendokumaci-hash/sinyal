'use client';

import { Locale, t } from '@/lib/i18n';

interface GoalDistributionProps {
  homeGoalsScored: number;
  homeGoalsConceded: number;
  awayGoalsScored: number;
  awayGoalsConceded: number;
  homeName: string;
  awayName: string;
  locale: Locale;
}

export function GoalDistribution({
  homeGoalsScored, homeGoalsConceded,
  awayGoalsScored, awayGoalsConceded,
  homeName, awayName, locale,
}: GoalDistributionProps) {
  const totalGoals = homeGoalsScored + homeGoalsConceded + awayGoalsScored + awayGoalsConceded;

  const segments = [
    { label: `${homeName} ${t(locale, 'goalsScored')}`, value: homeGoalsScored, color: '#10b981' },
    { label: `${homeName} ${t(locale, 'goalsConceded')}`, value: homeGoalsConceded, color: '#ef4444' },
    { label: `${awayName} ${t(locale, 'goalsScored')}`, value: awayGoalsScored, color: '#f59e0b' },
    { label: `${awayName} ${t(locale, 'goalsConceded')}`, value: awayGoalsConceded, color: '#8b5cf6' },
  ];

  // Build donut chart with SVG
  const radius = 50;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((seg, i) => {
          const pct = seg.value / totalGoals;
          const dash = circumference * pct;
          const gap = circumference - dash;
          const currentOffset = offset;
          offset += dash;

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-currentOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-700"
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground text-lg font-black">
          {totalGoals}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-muted text-[8px]">
          {locale === 'tr' ? 'Toplam' : 'Total'}
        </text>
      </svg>

      <div className="grid grid-cols-2 gap-2 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <div>
              <div className="text-xs font-bold">{seg.value}</div>
              <div className="text-[9px] text-muted leading-tight">{seg.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
