'use client';

import { useState, useEffect } from 'react';
import { Locale } from '@/lib/i18n';
import { getHistory, getStats } from '@/lib/history';
import { CheckCircle, XCircle, TrendingUp, Award, RotateCcw } from 'lucide-react';

interface TrackRecordProps {
  locale: Locale;
}

export function TrackRecord({ locale }: TrackRecordProps) {
  const [stats, setStats] = useState({ total: 0, won: 0, lost: 0, winRate: 0 });
  const [history, setHistory] = useState<ReturnType<typeof getHistory>>([]);

  useEffect(() => {
    setStats(getStats());
    setHistory(getHistory().slice(0, 10));
  }, []);

  const handleClear = () => {
    localStorage.removeItem('sinyal-prediction-history');
    setStats({ total: 0, won: 0, lost: 0, winRate: 0 });
    setHistory([]);
  };

  // Empty state
  if (stats.total === 0 && history.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Award className="w-4.5 h-4.5 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              {locale === 'tr' ? 'Basari Orani' : 'Track Record'}
            </h2>
            <p className="text-[10px] text-muted">
              {locale === 'tr' ? 'Tahmin gecmisi takibi' : 'Prediction history tracking'}
            </p>
          </div>
        </div>

        <div className="text-center py-6">
          <div className="text-4xl mb-2 opacity-20">
            <Award className="w-10 h-10 mx-auto text-muted" />
          </div>
          <p className="text-sm text-muted">
            {locale === 'tr'
              ? 'Henuz kayitli tahmin yok. Maclar oynanip sonuclandikca basari oraniniz burada gorunecek.'
              : 'No predictions recorded yet. Your success rate will appear here as matches are played.'}
          </p>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface rounded-xl p-2.5 border border-border text-center">
            <div className="text-lg font-black text-accent">0</div>
            <div className="text-[9px] text-muted">{locale === 'tr' ? 'Dogru' : 'Correct'}</div>
          </div>
          <div className="bg-surface rounded-xl p-2.5 border border-border text-center">
            <div className="text-lg font-black text-danger">0</div>
            <div className="text-[9px] text-muted">{locale === 'tr' ? 'Yanlis' : 'Wrong'}</div>
          </div>
          <div className="bg-surface rounded-xl p-2.5 border border-border text-center">
            <div className="text-lg font-black text-muted">-%</div>
            <div className="text-[9px] text-muted">{locale === 'tr' ? 'Isabet' : 'Accuracy'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in">
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
              {locale === 'tr' ? `${stats.total} tahmin kaydi` : `${stats.total} predictions recorded`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl font-black text-accent">%{stats.winRate}</div>
            <div className="text-[10px] text-muted">
              {locale === 'tr' ? 'Isabet' : 'Accuracy'}
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors"
            title={locale === 'tr' ? 'Gecmisi Sifirla' : 'Reset History'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted" />
          </button>
        </div>
      </div>

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
            <TrendingUp className="w-3 h-3 text-gold" />
          </div>
          <div className="text-lg font-black text-gold">{stats.total}</div>
          <div className="text-[9px] text-muted">{locale === 'tr' ? 'Toplam' : 'Total'}</div>
        </div>
      </div>

      {/* Recent predictions */}
      {history.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] text-muted mb-1">
            {locale === 'tr' ? 'Son Tahminler' : 'Recent Predictions'}
          </div>
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
              </div>
              <span className="text-[10px] font-medium text-muted flex-shrink-0 ml-2">{h.odds.toFixed(2)}x</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
