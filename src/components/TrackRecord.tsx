'use client';

import { useState, useEffect } from 'react';
import { Locale } from '@/lib/i18n';
import { getHistory, getStats } from '@/lib/history';
import { CheckCircle, XCircle, TrendingUp, Award, RotateCcw, Flame, Zap } from 'lucide-react';

interface TrackRecordProps {
  locale: Locale;
}

// Verified results - unique predictions only
const verifiedResults = [
  { id: 'apr15-1', date: '15 Nisan', matchLabel: 'Al-Nassr vs Al-Ettifaq', marketLabel: '3.5 Alt', odds: 2.60, result: 'won' as const },
  { id: 'apr15-2', date: '15 Nisan', matchLabel: 'Arsenal vs Sporting CP', marketLabel: 'KG Yok', odds: 1.80, result: 'won' as const },
  { id: 'apr15-3', date: '15 Nisan', matchLabel: 'Bayern vs Real Madrid', marketLabel: '3.5 Alt', odds: 2.25, result: 'lost' as const },
  { id: 'apr15-4', date: '15 Nisan', matchLabel: 'Metalist vs Veres Rivne', marketLabel: 'MS1', odds: 1.52, result: 'won' as const },
  { id: 'apr15-5', date: '15 Nisan', matchLabel: 'Al-Nassr vs Al-Ettifaq', marketLabel: '2.5 Alt', odds: 4.75, result: 'won' as const },
];

// Calculate current streak from results
function calcStreak(results: { result: 'won' | 'lost' }[]): { count: number; type: 'won' | 'lost' } {
  if (results.length === 0) return { count: 0, type: 'won' };
  const firstResult = results[0].result;
  let count = 0;
  for (const r of results) {
    if (r.result === firstResult) count++;
    else break;
  }
  return { count, type: firstResult };
}

export function TrackRecord({ locale }: TrackRecordProps) {
  const [stats, setStats] = useState({ total: 0, won: 0, lost: 0, winRate: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [streak, setStreak] = useState({ count: 0, type: 'won' as 'won' | 'lost' });

  useEffect(() => {
    const localStats = getStats();
    const localHistory = getHistory().slice(0, 10);

    const allResults = [...verifiedResults.map(r => ({
      id: r.id, date: r.date, matchLabel: r.matchLabel, marketLabel: r.marketLabel,
      optionName: '', probability: 0, odds: r.odds, result: r.result,
    })), ...localHistory];

    const verifiedWon = verifiedResults.filter(r => r.result === 'won').length;
    const verifiedTotal = verifiedResults.length;

    const totalWon = localStats.won + verifiedWon;
    const totalAll = localStats.total + verifiedTotal;

    setStats({
      total: totalAll,
      won: totalWon,
      lost: totalAll - totalWon,
      winRate: Math.round((totalWon / Math.max(totalAll, 1)) * 100),
    });
    setHistory(allResults.slice(0, 10));

    // Calculate streak from most recent results
    const streakData = calcStreak(allResults.filter(r => r.result === 'won' || r.result === 'lost') as { result: 'won' | 'lost' }[]);
    setStreak(streakData);
  }, []);

  const handleClear = () => {
    localStorage.removeItem('sinyal-prediction-history');
    location.reload();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Award className="w-4.5 h-4.5 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              {locale === 'tr' ? 'Basari Orani' : 'Track Record'}
            </h2>
            <p className="text-[10px] text-muted">
              {locale === 'tr' ? 'Dogrulanmis tahmin sonuclari' : 'Verified prediction results'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-accent">%{stats.winRate}</div>
          <div className="text-[10px] text-muted">
            {locale === 'tr' ? 'Isabet' : 'Accuracy'}
          </div>
        </div>
      </div>

      {/* Streak banner */}
      {streak.count >= 2 && streak.type === 'won' && (
        <div className="mb-4 bg-gradient-to-r from-gold/15 to-accent/15 border border-gold/25 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-gold" />
            <div>
              <div className="text-sm font-black text-gold">
                {streak.count} {locale === 'tr' ? 'MACLIK SERI' : 'WIN STREAK'} 🔥
              </div>
              <div className="text-[10px] text-muted">
                {locale === 'tr'
                  ? `Son ${streak.count} tahminimiz ust uste tuttu!`
                  : `Last ${streak.count} predictions hit in a row!`}
              </div>
            </div>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: streak.count }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-accent" />
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-surface rounded-xl p-2.5 border border-border text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-3 h-3 text-accent" />
          </div>
          <div className="text-lg font-black text-accent">{stats.won}</div>
          <div className="text-[9px] text-muted">{locale === 'tr' ? 'Dogru' : 'Correct'}</div>
        </div>
        <div className="bg-surface rounded-xl p-2.5 border border-border text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <XCircle className="w-3 h-3 text-danger" />
          </div>
          <div className="text-lg font-black text-danger">{stats.lost}</div>
          <div className="text-[9px] text-muted">{locale === 'tr' ? 'Yanlis' : 'Wrong'}</div>
        </div>
        <div className="bg-surface rounded-xl p-2.5 border border-border text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-gold" />
          </div>
          <div className="text-lg font-black text-gold">{streak.count}</div>
          <div className="text-[9px] text-muted">{locale === 'tr' ? 'Seri' : 'Streak'}</div>
        </div>
      </div>

      {/* Visual streak bar */}
      {history.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] text-muted mb-1.5">{locale === 'tr' ? 'Son Tahminler' : 'Recent'}</div>
          <div className="flex gap-1">
            {history.slice(0, 10).map((h, i) => (
              <div
                key={i}
                className={`flex-1 h-6 rounded-md flex items-center justify-center text-[8px] font-black ${
                  h.result === 'won'
                    ? 'bg-accent/20 text-accent'
                    : h.result === 'lost'
                    ? 'bg-danger/20 text-danger'
                    : 'bg-muted/10 text-muted'
                }`}
              >
                {h.result === 'won' ? '✓' : h.result === 'lost' ? '✗' : '?'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent predictions detail */}
      {history.length > 0 && (
        <div className="space-y-1.5">
          {history.slice(0, 5).map((h) => (
            <div key={h.id} className="flex items-center justify-between bg-surface rounded-lg px-2.5 py-1.5 border border-border">
              <div className="flex items-center gap-2 min-w-0">
                {h.result === 'won' ? (
                  <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" />
                ) : h.result === 'lost' ? (
                  <XCircle className="w-3 h-3 text-danger flex-shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-muted/40 flex-shrink-0" />
                )}
                <span className="text-[10px] text-muted truncate">{h.matchLabel}</span>
                {h.marketLabel && <span className="text-[9px] text-accent font-medium flex-shrink-0">· {h.marketLabel}</span>}
              </div>
              <span className="text-[10px] font-medium text-muted flex-shrink-0 ml-2">{h.odds.toFixed(2)}x</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
