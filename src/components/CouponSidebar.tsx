'use client';

import { CouponSelection, calculateCoupon, probToOdds } from '@/lib/coupon';
import { Locale, getMarketName, getOptionName } from '@/lib/i18n';
import { Receipt, X, Trash2, ShoppingCart } from 'lucide-react';

interface CouponSidebarProps {
  selections: CouponSelection[];
  locale: Locale;
  onRemove: (index: number) => void;
  onClear: () => void;
  open: boolean;
  onToggle: () => void;
}

export function CouponSidebar({ selections, locale, onRemove, onClear, open, onToggle }: CouponSidebarProps) {
  const coupon = calculateCoupon(selections);

  return (
    <>
      {/* Floating button */}
      {selections.length > 0 && !open && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-accent text-background flex items-center justify-center shadow-lg shadow-accent/30 hover:scale-105 transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-background text-[10px] font-bold flex items-center justify-center">
            {selections.length}
          </span>
        </button>
      )}

      {/* Sidebar drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-card border-l border-border transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-accent" />
              <h2 className="text-base font-bold">
                {locale === 'tr' ? 'Kuponum' : 'My Coupon'}
              </h2>
              <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold">
                {selections.length}
              </span>
            </div>
            <button onClick={onToggle} className="p-1 hover:bg-surface rounded-lg transition-colors">
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          {/* Selections */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {selections.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                <p className="text-sm text-muted">
                  {locale === 'tr' ? 'Kuponunuz bos. Mac detaylarindan bahis ekleyin.' : 'Your coupon is empty. Add bets from match details.'}
                </p>
              </div>
            ) : (
              selections.map((sel, i) => (
                <div key={i} className="bg-surface rounded-xl p-3 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{sel.matchLabel}</span>
                    <button
                      onClick={() => onRemove(i)}
                      className="p-1 hover:bg-card rounded transition-colors"
                    >
                      <X className="w-3 h-3 text-muted" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-muted">
                      {getMarketName(locale, sel.marketLabel)} &middot;{' '}
                      <span className="text-accent font-medium">{getOptionName(locale, sel.optionName)}</span>
                    </div>
                    <span className="text-xs font-bold text-gold">{sel.odds}x</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {selections.length > 0 && (
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{locale === 'tr' ? 'Toplam Oran' : 'Total Odds'}</span>
                <span className="text-xl font-black text-gold">{coupon.totalOdds}x</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">{locale === 'tr' ? 'Birlesik Olasilik' : 'Combined Prob.'}</span>
                <span className="text-sm font-bold text-accent">%{coupon.totalProbability}</span>
              </div>
              <button
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-danger/30 text-danger text-xs hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                {locale === 'tr' ? 'Kuponu Temizle' : 'Clear Coupon'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onToggle} />
      )}
    </>
  );
}
