'use client';

interface OddsBarProps {
  probability: number;
  label: string;
  recommended?: boolean;
  color?: 'green' | 'gold' | 'red' | 'blue';
  bookmakerOdds?: number;
}

export function OddsBar({ probability, label, recommended, color = 'green', bookmakerOdds }: OddsBarProps) {
  const colorMap = {
    green: { bar: 'bg-accent', text: 'text-accent', bg: 'from-accent/10' },
    gold: { bar: 'bg-gold', text: 'text-gold', bg: 'from-gold/10' },
    red: { bar: 'bg-danger', text: 'text-danger', bg: 'from-danger/10' },
    blue: { bar: 'bg-blue-500', text: 'text-blue-400', bg: 'from-blue-500/10' },
  };
  const c = colorMap[color];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      recommended
        ? `border-accent/25 bg-gradient-to-r ${c.bg} to-transparent`
        : 'border-border/50 bg-surface/30 hover:bg-surface/50'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {recommended && (
              <span className={`text-[9px] font-black ${c.text} bg-accent/10 px-1.5 py-0.5 rounded uppercase tracking-wider`}>
                TOP
              </span>
            )}
            <span className="text-sm font-medium truncate">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            {bookmakerOdds && (
              <span className="text-xs font-bold text-gold bg-gold/8 px-2 py-0.5 rounded-md border border-gold/15 font-mono">
                {bookmakerOdds.toFixed(2)}
              </span>
            )}
            <span className={`text-sm font-bold font-mono ${recommended ? c.text : 'text-foreground/80'}`}>
              {probability}%
            </span>
          </div>
        </div>
        <div className="h-1.5 bg-border/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full prob-bar ${c.bar} ${recommended ? 'opacity-100' : 'opacity-40'}`}
            style={{ '--bar-width': `${probability}%`, width: `${probability}%` } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
