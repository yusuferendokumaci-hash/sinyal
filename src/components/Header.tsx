'use client';

import { useState, useEffect, useRef } from 'react';
import { Locale, t } from '@/lib/i18n';
import { Activity, TrendingUp, ChevronDown } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

interface LiveMatch {
  id: number;
  home: string;
  homeLogo: string;
  away: string;
  awayLogo: string;
  homeGoals: number;
  awayGoals: number;
  minute: number;
  status: string;
  league: string;
}

interface HeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function Header({ locale, onLocaleChange }: HeaderProps) {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [showLive, setShowLive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch live matches
  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch('/api/live');
        const data = await res.json();
        if (data.live?.length > 0) setLiveMatches(data.live);
      } catch {}
    }
    fetchLive();
    const interval = setInterval(fetchLive, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLive(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
              <Activity className="w-5 h-5 text-background" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gold rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-accent-light to-gold-light bg-clip-text text-transparent">
              {t(locale, 'siteName')}
            </h1>
            <p className="text-[10px] text-muted tracking-wide uppercase">
              {t(locale, 'siteSlogan')}
            </p>
          </div>
        </a>

        <div className="flex items-center gap-3">
          {/* Live matches dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLive(!showLive)}
              className="hidden sm:flex items-center gap-2 text-xs bg-card px-3 py-1.5 rounded-full border border-border hover:border-accent/40 transition-colors"
            >
              {liveMatches.length > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                  <span className="text-danger font-bold">LIVE</span>
                  <span className="text-muted">{liveMatches.length}</span>
                  <ChevronDown className={`w-3 h-3 text-muted transition-transform ${showLive ? 'rotate-180' : ''}`} />
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 text-accent" />
                  <span className="text-muted">
                    {locale === 'tr' ? 'Canli mac yok' : 'No live matches'}
                  </span>
                </>
              )}
            </button>

            {/* Dropdown panel */}
            {showLive && liveMatches.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl shadow-black/20 overflow-hidden z-50">
                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                    <span className="text-xs font-bold text-danger">
                      {locale === 'tr' ? 'CANLI MACLAR' : 'LIVE MATCHES'}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted">{liveMatches.length} {locale === 'tr' ? 'mac' : 'matches'}</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {liveMatches.map((m) => (
                    <div key={m.id} className="px-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                      {/* League name */}
                      <div className="text-[9px] text-muted mb-1.5 font-medium uppercase tracking-wide">
                        {m.league}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <img src={m.homeLogo} alt="" className="w-4 h-4 object-contain" />
                          <span className="text-xs font-medium truncate">{m.home}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 mx-2">
                          <span className="text-sm font-black text-foreground">{m.homeGoals}</span>
                          <span className="text-[10px] text-muted">-</span>
                          <span className="text-sm font-black text-foreground">{m.awayGoals}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className="text-xs font-medium truncate text-right">{m.away}</span>
                          <img src={m.awayLogo} alt="" className="w-4 h-4 object-contain" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-[10px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded">
                          {m.status === 'HT' ? 'DY' : `${m.minute}'`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile live indicator */}
          {liveMatches.length > 0 && (
            <div className="sm:hidden flex items-center gap-1 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-danger font-bold">{liveMatches.length}</span>
            </div>
          )}

          <ThemeToggle />
          <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
        </div>
      </div>
    </header>
  );
}
