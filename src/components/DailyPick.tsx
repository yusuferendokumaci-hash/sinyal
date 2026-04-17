'use client';

import { Match } from '@/lib/mock-data';
import {
  generateDailyPick,
  generateBankoPick,
  generateHighOddsPick,
  generateScorePick,
  calculateCoupon,
} from '@/lib/coupon';
import { Locale, t, getMarketName, getOptionName } from '@/lib/i18n';
import { Sparkles, TrendingUp, Zap, Clock, Flame, Target, DollarSign, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';

interface DailyPickProps {
  matches: Match[];
  locale: Locale;
}

type TabKey = 'daily' | 'banko' | 'high' | 'score';

export function DailyPick({ matches, locale }: DailyPickProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('daily');

  const dailyPicks = useMemo(() => generateDailyPick(matches), [matches]);
  const bankoPicks = useMemo(() => generateBankoPick(matches), [matches]);
  const highPicks = useMemo(() => generateHighOddsPick(matches), [matches]);
  const scorePicks = useMemo(() => generateScorePick(matches), [matches]);

  const currentPicks =
    activeTab === 'daily' ? dailyPicks :
    activeTab === 'banko' ? bankoPicks :
    activeTab === 'high' ? highPicks :
    scorePicks;

  const coupon = useMemo(() => calculateCoupon(currentPicks), [currentPicks]);

  const tabs: { key: TabKey; label: string; labelEn: string; icon: React.ReactNode; color: string }[] = [
    { key: 'daily', label: 'Gunun Kuponu', labelEn: "Today's Pick", icon: <Sparkles className="w-3 h-3" />, color: 'gold' },
    { key: 'banko', label: 'Banko', labelEn: 'Banko', icon: <Flame className="w-3 h-3" />, color: 'accent' },
    { key: 'high', label: 'Yuksek Oran', labelEn: 'High Odds', icon: <DollarSign className="w-3 h-3" />, color: 'danger' },
    { key: 'score', label: 'Skor', labelEn: 'Score', icon: <Target className="w-3 h-3" />, color: 'purple' },
  ];

  const activeTabConfig = tabs.find(t => t.key === activeTab)!;

  return (
    <div className="bg-card border border-gold/30 rounded-2xl p-5 glow-gold animate-fade-in">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-surface rounded-xl p-1 border border-border overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const colorClasses = isActive
            ? tab.color === 'gold' ? 'bg-gold text-background'
            : tab.color === 'accent' ? 'bg-accent text-background'
            : tab.color === 'danger' ? 'bg-danger text-background'
            : 'bg-purple-500 text-background'
            : 'text-muted hover:text-foreground';

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${colorClasses}`}
            >
              {tab.icon}
              {locale === 'tr' ? tab.label : tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            activeTab === 'daily' ? 'bg-gold/15' :
            activeTab === 'banko' ? 'bg-accent/15' :
            activeTab === 'high' ? 'bg-danger/15' :
            'bg-purple-500/15'
          }`}>
            {activeTabConfig.icon}
          </div>
          <div>
            <h2 className="text-base font-bold">
              {locale === 'tr' ? activeTabConfig.label : activeTabConfig.labelEn}
            </h2>
            <p className="text-[10px] text-muted">
              {activeTab === 'daily' && (locale === 'tr' ? 'En iyi value tahminler' : 'Best value predictions')}
              {activeTab === 'banko' && (locale === 'tr' ? 'En guvenli banko maclar' : 'Safest sure-bet matches')}
              {activeTab === 'high' && (locale === 'tr' ? 'Yuksek kazanc denemesi (100x+)' : 'High reward attempt (100x+)')}
              {activeTab === 'score' && (locale === 'tr' ? 'En olasilikli skor tahminleri' : 'Most likely score predictions')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xl font-black ${
            activeTab === 'daily' ? 'text-gold' :
            activeTab === 'banko' ? 'text-accent' :
            activeTab === 'high' ? 'text-danger' :
            'text-purple-400'
          }`}>
            {coupon.totalOdds}x
          </div>
          <div className="text-[10px] text-muted">
            {locale === 'tr' ? 'Toplam Oran' : 'Total Odds'}
          </div>
        </div>
      </div>

      {/* Picks */}
      {currentPicks.length > 0 ? (
        <>
          <div className="space-y-2">
            {currentPicks.map((pick, i) => {
              const matchData = matches.find(m => m.id === pick.matchId);
              return (
                <div key={i} className="flex items-center justify-between bg-surface rounded-xl px-3 py-2.5 border border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activeTab === 'daily' ? 'bg-gold/10' :
                      activeTab === 'banko' ? 'bg-accent/10' :
                      activeTab === 'high' ? 'bg-danger/10' :
                      'bg-purple-500/10'
                    }`}>
                      <span className={`text-xs font-bold ${
                        activeTab === 'daily' ? 'text-gold' :
                        activeTab === 'banko' ? 'text-accent' :
                        activeTab === 'high' ? 'text-danger' :
                        'text-purple-400'
                      }`}>{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="text-xs font-semibold truncate">{pick.matchLabel}</div>
                        {matchData?.kickoff && (
                          <span className="flex items-center gap-0.5 text-[9px] text-gold bg-gold/10 px-1.5 py-0.5 rounded flex-shrink-0 border border-gold/15">
                            <Clock className="w-2 h-2" />
                            {matchData.kickoff}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted">
                        {pick.marketLabel === 'score' ? (
                          <><Trophy className="w-2.5 h-2.5 inline mr-0.5" /> {locale === 'tr' ? 'Skor' : 'Score'}: <span className="text-accent font-bold">{pick.optionName}</span></>
                        ) : pick.marketLabel === 'htft' ? (
                          <>{locale === 'tr' ? 'IY/MS' : 'HT/FT'}: <span className="text-accent font-bold">{pick.optionName}</span></>
                        ) : (
                          <>{getMarketName(locale, pick.marketLabel)} &middot; <span className="text-accent font-medium">{getOptionName(locale, pick.optionName)}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-accent">%{pick.probability}</span>
                    <span className="text-[10px] text-muted bg-card px-1.5 py-0.5 rounded border border-border">{pick.odds}x</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-accent" />
              <span className="text-[10px] text-muted">
                {locale === 'tr' ? 'Birlesik Olasilik' : 'Combined'}: <span className="text-foreground font-bold">%{coupon.totalProbability}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-gold" />
              <span className="text-[10px] text-muted">
                {locale === 'tr' ? 'Oran' : 'Odds'}: <span className="text-gold font-bold">{coupon.totalOdds}x</span>
              </span>
            </div>
          </div>

          {/* Coupon confidence meter */}
          <div className="mt-3 bg-surface rounded-xl p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted">{locale === 'tr' ? 'Kupon Guven Seviyesi' : 'Coupon Confidence'}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                coupon.totalProbability >= 30 ? 'bg-accent/15 text-accent' : coupon.totalProbability >= 15 ? 'bg-gold/15 text-gold' : 'bg-danger/15 text-danger'
              }`}>
                {coupon.totalProbability >= 30 ? (locale === 'tr' ? 'YUKSEK' : 'HIGH') : coupon.totalProbability >= 15 ? (locale === 'tr' ? 'ORTA' : 'MEDIUM') : (locale === 'tr' ? 'RISKLI' : 'RISKY')}
              </span>
            </div>
            <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${
                coupon.totalProbability >= 30 ? 'bg-gradient-to-r from-accent to-accent-light' : coupon.totalProbability >= 15 ? 'bg-gradient-to-r from-gold to-gold-light' : 'bg-danger'
              }`} style={{ width: `${Math.min(coupon.totalProbability * 2, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[9px] text-muted">
              <span>{currentPicks.length} {locale === 'tr' ? 'mac' : 'picks'}</span>
              <span>%{coupon.totalProbability} {locale === 'tr' ? 'olasilik' : 'probability'}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted">
            {locale === 'tr' ? 'Bu kategori icin uygun mac bulunamadi.' : 'No suitable matches found for this category.'}
          </p>
          <p className="text-[10px] text-muted/60 mt-1">
            {activeTab === 'banko' && (locale === 'tr' ? 'Banko icin en az %70 olasilikli mac gerek.' : 'Banko requires 70%+ probability matches.')}
            {activeTab === 'high' && (locale === 'tr' ? '100x+ icin yeterli mac bulunamadi.' : 'Not enough matches for 100x+ odds.')}
            {activeTab === 'score' && (locale === 'tr' ? 'Guvenilir skor tahmini icin yeterli veri yok.' : 'Not enough data for reliable score predictions.')}
          </p>
        </div>
      )}
    </div>
  );
}
