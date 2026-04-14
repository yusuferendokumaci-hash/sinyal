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
    green: { bar: 'bg-accent', text: 'text-accent', glow: 'shadow-accent/20' },
    gold: { bar: 'bg-gold', text: 'text-gold', glow: 'shadow-gold/20' },
    red: { bar: 'bg-danger', text: 'text-danger', glow: 'shadow-danger/20' },
    blue: { bar: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  };
  const c = colorMap[color];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      recommended ? 'border-accent/30 bg-accent/5 glow-green' : 'border-border bg-surface'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium truncate">{label}</span>
          <div className="flex items-center gap-2">
            {recommended && (
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                ★
              </span>
            )}
            {bookmakerOdds && (
              <span className="text-xs font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded border border-gold/20">
                {bookmakerOdds.toFixed(2)}
              </span>
            )}
            <span className={`text-sm font-bold ${recommended ? c.text : 'text-foreground'}`}>
              %{probability}
            </span>
          </div>
        </div>
        <div className="h-2 bg-border/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full prob-bar ${c.bar} ${recommended ? 'opacity-100' : 'opacity-60'}`}
            style={{ '--bar-width': `${probability}%`, width: `${probability}%` } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
