'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/lib/mock-data';
import { generatePredictions } from '@/lib/predictions';
import { Locale, t } from '@/lib/i18n';
import { TeamLogo } from './TeamLogo';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { getFlag } from '@/lib/flags';
import { Clock, ChevronRight, TrendingUp, Shield, Heart, Timer, Flame } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  locale: Locale;
  onSelect: (id: string) => void;
  delay?: number;
}

export function MatchCard({ match, locale, onSelect, delay = 0 }: MatchCardProps) {
  const prediction = generatePredictions(match);
  const mainMarket = prediction.categories[0].markets[0]; // 1X2
  const [fav, setFav] = useState(false);
  const [countdown, setCountdown] = useState('');

  const isBanko = prediction.mainPrediction.confidence >= 70;
  const mainOdds = prediction.mainPrediction.odds;

  useEffect(() => {
    setFav(isFavorite(match.id));
  }, [match.id]);

  // Countdown timer
  useEffect(() => {
    function calcCountdown() {
      const [h, m] = match.kickoff.split(':').map(Number);
      const now = new Date();
      const kickoff = new Date(now);
      kickoff.setHours(h, m, 0, 0);
      const diff = kickoff.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (hours > 0) setCountdown(`${hours}s ${mins}dk`);
      else setCountdown(`${mins}dk`);
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
      className={`animate-slide-up ${delay > 0 ? `animate-fade-in-delay-${delay}` : ''} group cursor-pointer bg-card border border-border rounded-2xl p-4 sm:p-5 hover:border-accent/40 hover:bg-card-hover card-lift relative ${isBanko ? 'banko-pulse' : ''}`}
    >
      {/* Banko badge */}
      {isBanko && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center gap-1 bg-gold text-background text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
            <Flame className="w-3 h-3" />
            BANKO
          </div>
        </div>
      )}

      {/* League + Time + Fav header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getFlag(match.leagueCountry)}</span>
          <span className="text-xs font-medium text-muted">{match.league}</span>
        </div>
        <div className="flex items-center gap-2">
          {countdown && (
            <div className="flex items-center gap-1 text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
              <Timer className="w-2.5 h-2.5" />
              {countdown}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="w-3 h-3" />
            <span>{match.kickoff}</span>
          </div>
          <button
            onClick={handleFav}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-danger text-danger' : 'text-muted/40 hover:text-muted'}`} />
          </button>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-center">
          <div className="mb-1.5 flex justify-center"><TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size="lg" /></div>
          <div className="text-sm font-semibold truncate">{match.homeTeam.name}</div>
          <div className="flex items-center justify-center gap-0.5 mt-1.5">
            {match.homeTeam.form.map((f, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                  f === 'W' ? 'bg-accent/20 text-accent' : f === 'D' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                }`}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="px-4 flex flex-col items-center">
          <span className="text-xs text-muted mb-1">VS</span>
          <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center bg-surface">
            <Shield className="w-4 h-4 text-muted" />
          </div>
        </div>

        <div className="flex-1 text-center">
          <div className="mb-1.5 flex justify-center"><TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size="lg" /></div>
          <div className="text-sm font-semibold truncate">{match.awayTeam.name}</div>
          <div className="flex items-center justify-center gap-0.5 mt-1.5">
            {match.awayTeam.form.map((f, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                  f === 'W' ? 'bg-accent/20 text-accent' : f === 'D' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                }`}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick prediction */}
      <div className="border-t border-border pt-3 mt-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-accent">{t(locale, 'mainPrediction')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {mainOdds && (
              <span className="text-[10px] font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded border border-gold/20">
                {mainOdds.toFixed(2)}
              </span>
            )}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              prediction.mainPrediction.confidence >= 70
                ? 'bg-gold/15 text-gold'
                : prediction.mainPrediction.confidence >= 55
                ? 'bg-accent/15 text-accent'
                : prediction.mainPrediction.confidence >= 40
                ? 'bg-gold/15 text-gold'
                : 'bg-muted/15 text-muted'
            }`}>
              %{prediction.mainPrediction.confidence}
            </span>
          </div>
        </div>

        {/* 1X2 probabilities with bookmaker odds */}
        <div className="grid grid-cols-3 gap-2">
          {mainMarket.options.map((opt) => (
            <div
              key={opt.name}
              className={`text-center py-2 rounded-lg border ${
                opt.recommended
                  ? 'border-accent/40 bg-accent/10'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="text-[10px] text-muted mb-0.5">
                {opt.name === '1' ? match.homeTeam.shortName : opt.name === '2' ? match.awayTeam.shortName : 'X'}
              </div>
              <div className={`text-sm font-bold ${opt.recommended ? 'text-accent' : 'text-foreground'}`}>
                {opt.bookmakerOdds ? opt.bookmakerOdds.toFixed(2) : `%${opt.probability}`}
              </div>
            </div>
          ))}
        </div>

        {/* View details */}
        <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted group-hover:text-accent transition-colors">
          <span>{t(locale, 'viewDetails')}</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}

