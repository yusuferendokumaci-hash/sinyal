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

  if (picks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-gold" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              {locale === 'tr' ? 'Gunun Kuponu' : "Today's Pick"}
            </h2>
            <p className="text-[10px] text-muted">
              {locale === 'tr' ? 'AI tarafindan secilmis tahminler' : 'AI selected predictions'}
            </p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted">
            {locale === 'tr'
              ? 'Bugun icin uygun kupon bulunamadi. Maclar yaklastikca kupon olusturulacak.'
              : 'No suitable coupon found for today. A coupon will be generated as matches approach.'}
          </p>
        </div>
      </div>
    );
  }

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

      {/* Coupon confidence meter */}
      <div className="mt-3 bg-surface rounded-xl p-3 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted">{locale === 'tr' ? 'Kupon Guven Seviyesi' : 'Coupon Confidence'}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            coupon.totalProbability >= 30 ? 'bg-accent/15 text-accent' : coupon.totalProbability >= 20 ? 'bg-gold/15 text-gold' : 'bg-danger/15 text-danger'
          }`}>
            {coupon.totalProbability >= 30 ? (locale === 'tr' ? 'YUKSEK' : 'HIGH') : coupon.totalProbability >= 20 ? (locale === 'tr' ? 'ORTA' : 'MEDIUM') : (locale === 'tr' ? 'RISKLI' : 'RISKY')}
          </span>
        </div>
        <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${
            coupon.totalProbability >= 30 ? 'bg-gradient-to-r from-accent to-accent-light' : coupon.totalProbability >= 20 ? 'bg-gradient-to-r from-gold to-gold-light' : 'bg-danger'
          }`} style={{ width: `${Math.min(coupon.totalProbability * 2, 100)}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[9px] text-muted">
          <span>{picks.length} {locale === 'tr' ? 'mac' : 'picks'}</span>
          <span>%{coupon.totalProbability} {locale === 'tr' ? 'olasilik' : 'probability'}</span>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-3 flex items-start gap-2 bg-accent/5 border border-accent/15 rounded-xl px-3 py-2">
        <Sparkles className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-muted leading-relaxed">
          {locale === 'tr'
            ? 'Bu kupon AI tahmin motoru tarafindan olusturulmustur. Dixon-Coles istatistik modeli ve Poisson dagilimi ile hesaplanmistir.'
            : 'This coupon is generated by our AI prediction engine using Dixon-Coles statistical model and Poisson distribution.'}
        </p>
      </div>
    </div>
  );
}
