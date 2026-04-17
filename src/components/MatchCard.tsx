'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/lib/mock-data';
import { generatePredictions } from '@/lib/predictions';
import { Locale, t } from '@/lib/i18n';
import { TeamLogo } from './TeamLogo';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { getFlag, getFlagImageUrl } from '@/lib/flags';
import { ChevronRight, TrendingUp, Heart, Timer, Flame, Zap } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  locale: Locale;
  onSelect: (id: string) => void;
  delay?: number;
}

export function MatchCard({ match, locale, onSelect, delay = 0 }: MatchCardProps) {
  const [fav, setFav] = useState(false);
  const [countdown, setCountdown] = useState('');

  let prediction;
  try {
    prediction = generatePredictions(match);
  } catch {
    prediction = null;
  }
  const mainMarket = prediction?.categories?.[0]?.markets?.[0];
  const isBanko = (prediction?.mainPrediction?.confidence ?? 0) >= 70;
  const mainOdds = prediction?.mainPrediction?.odds;
  const confidence = prediction?.mainPrediction?.confidence ?? 0;

  useEffect(() => {
    setFav(isFavorite(match.id));
  }, [match.id]);

  useEffect(() => {
    function calcCountdown() {
      const [h, m] = match.kickoff.split(':').map(Number);
      const now = new Date();
      const kickoff = new Date(now);
      kickoff.setHours(h, m, 0, 0);
      const diff = kickoff.getTime() - now.getTime();
      if (diff <= 0) { setCountdown(''); return; }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setCountdown(hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`);
    }
    calcCountdown();
    const interval = setInterval(calcCountdown, 60000);
    return () => clearInterval(interval);
  }, [match.kickoff]);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFav(toggleFavorite(match.id));
  };

  return (
    <div
      onClick={() => onSelect(match.id)}
      className={`group cursor-pointer relative overflow-hidden rounded-2xl border transition-all duration-300 min-w-0 ${
        isBanko
          ? 'bg-gradient-to-br from-card via-card to-gold/5 border-gold/30 hover:border-gold/50'
          : 'bg-card border-border hover:border-accent/30 hover:bg-card-hover'
      }`}
      style={{ animation: `slideUp 0.5s ease-out ${delay * 0.1}s both` }}
    >
      {/* Top accent line */}
      <div className={`h-0.5 w-full ${isBanko ? 'bg-gradient-to-r from-gold via-gold-light to-gold' : 'bg-gradient-to-r from-transparent via-accent/30 to-transparent'}`} />

      {/* Banko badge - top left */}
      {isBanko && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-gold to-gold-light text-background text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-gold/20 uppercase tracking-wider">
            <Flame className="w-3 h-3" />
            BANKO
          </div>
        </div>
      )}

      <div className={`p-4 sm:p-5 ${isBanko ? 'pt-10' : ''}`}>
        {/* League + Time + Fav */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getFlagImageUrl(match.leagueCountry) ? (
              <img src={getFlagImageUrl(match.leagueCountry)} alt="" className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />
            ) : (
              <span className="text-base">{getFlag(match.leagueCountry)}</span>
            )}
            <div>
              <span className="text-[11px] font-semibold text-foreground/80">{match.league}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {countdown && (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gold bg-gold/8 px-2 py-0.5 rounded-md border border-gold/15">
                <Timer className="w-2.5 h-2.5" />
                {countdown}
              </div>
            )}
            <span className="text-[11px] text-muted font-mono">{match.kickoff}</span>
            <button onClick={handleFav} className="p-0.5 hover:scale-125 transition-transform">
              <Heart className={`w-3.5 h-3.5 transition-colors ${fav ? 'fill-danger text-danger' : 'text-border hover:text-muted'}`} />
            </button>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-2 mb-4 overflow-hidden">
          {/* Home */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="flex-shrink-0">
              <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size="lg" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{match.homeTeam.name}</div>
              <div className="flex items-center gap-0.5 mt-1">
                {match.homeTeam.form.map((f, i) => (
                  <span key={i} className={`w-4 h-4 rounded-sm text-[8px] font-black flex items-center justify-center ${
                    f === 'W' ? 'bg-accent/20 text-accent' : f === 'D' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                  }`}>{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
            <span className="text-[10px] font-black text-muted">VS</span>
          </div>

          {/* Away */}
          <div className="flex-1 min-w-0 flex items-center gap-2 justify-end text-right">
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{match.awayTeam.name}</div>
              <div className="flex items-center gap-0.5 mt-1 justify-end">
                {match.awayTeam.form.map((f, i) => (
                  <span key={i} className={`w-4 h-4 rounded-sm text-[8px] font-black flex items-center justify-center ${
                    f === 'W' ? 'bg-accent/20 text-accent' : f === 'D' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                  }`}>{f}</span>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size="lg" />
            </div>
          </div>
        </div>

        {/* Prediction section */}
        <div className="bg-surface/50 rounded-xl border border-border/50 p-3">
          {prediction ? (
            <>
              {/* Main prediction bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Zap className={`w-3.5 h-3.5 ${isBanko ? 'text-gold' : 'text-accent'}`} />
                  <span className="text-[11px] font-semibold text-muted">{t(locale, 'mainPrediction')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {mainOdds && (
                    <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/20 font-mono">
                      {mainOdds.toFixed(2)}
                    </span>
                  )}
                  <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    confidence >= 70
                      ? 'bg-gradient-to-r from-gold/20 to-gold/10 text-gold border border-gold/20'
                      : confidence >= 55
                      ? 'bg-accent/15 text-accent border border-accent/20'
                      : 'bg-muted/10 text-muted border border-muted/20'
                  }`}>
                    {confidence}%
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="h-1 bg-border/30 rounded-full mb-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    confidence >= 70 ? 'bg-gradient-to-r from-gold to-gold-light' : confidence >= 55 ? 'bg-accent' : 'bg-muted/50'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>

              {/* 1X2 odds */}
              {mainMarket?.options && (
                <div className="grid grid-cols-3 gap-1.5">
                  {mainMarket.options.map((opt) => (
                    <div
                      key={opt.name}
                      className={`text-center py-2 rounded-lg transition-all ${
                        opt.recommended
                          ? 'bg-accent/10 border border-accent/25'
                          : 'bg-background/50 border border-border/30'
                      }`}
                    >
                      <div className="text-[9px] text-muted font-medium mb-0.5 uppercase">
                        {opt.name === '1' ? match.homeTeam.shortName : opt.name === '2' ? match.awayTeam.shortName : 'X'}
                      </div>
                      <div className={`text-sm font-bold font-mono ${opt.recommended ? 'text-accent' : 'text-foreground/80'}`}>
                        {opt.bookmakerOdds ? opt.bookmakerOdds.toFixed(2) : `${opt.probability}%`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-3 text-xs text-muted">
              {locale === 'tr' ? 'Tahmin hesaplaniyor...' : 'Calculating...'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1 mt-3 text-[11px] text-muted/60 group-hover:text-accent transition-colors">
          <span>{t(locale, 'viewDetails')}</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
