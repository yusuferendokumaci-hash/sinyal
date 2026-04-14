'use client';

import { Match } from '@/lib/mock-data';
import { generateDailyPick, calculateCoupon, CouponSelection } from '@/lib/coupon';
import { Locale, t, getMarketName, getOptionName } from '@/lib/i18n';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useMemo } from 'react';

interface DailyPickProps {
  matches: Match[];
  locale: Locale;
}

export function DailyPick({ matches, locale }: DailyPickProps) {
  const picks = useMemo(() => generateDailyPick(matches), [matches]);
  const coupon = useMemo(() => calculateCoupon(picks), [picks]);

  if (picks.length === 0) return null;

  return (
    <div className="bg-card border border-gold/30 rounded-2xl p-5 glow-gold animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-gold" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              {locale === 'tr' ? 'Gunun Kuponu' : "Today's Pick"}
            </h2>
            <p className="text-[10px] text-muted">
              {locale === 'tr' ? 'AI tarafindan secilmis en guvenilir tahminler' : 'Most confident predictions selected by AI'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-gold">{coupon.totalOdds}x</div>
          <div className="text-[10px] text-muted">
            {locale === 'tr' ? 'Toplam Oran' : 'Total Odds'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {picks.map((pick, i) => (
          <div key={i} className="flex items-center justify-between bg-surface rounded-xl px-3 py-2.5 border border-border">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gold">{i + 1}</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{pick.matchLabel}</div>
                <div className="text-[10px] text-muted">
                  {getMarketName(locale, pick.marketLabel)} &middot; <span className="text-accent font-medium">{getOptionName(locale, pick.optionName)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-accent">%{pick.probability}</span>
              <span className="text-[10px] text-muted bg-card px-1.5 py-0.5 rounded border border-border">{pick.odds}x</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-accent" />
          <span className="text-[10px] text-muted">
            {locale === 'tr' ? 'Birlesik Olasilik' : 'Combined Probability'}: <span className="text-foreground font-bold">%{coupon.totalProbability}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-gold" />
          <span className="text-[10px] text-muted">
            {locale === 'tr' ? 'Toplam Oran' : 'Total Odds'}: <span className="text-gold font-bold">{coupon.totalOdds}x</span>
          </span>
        </div>
      </div>
    </div>
  );
}
