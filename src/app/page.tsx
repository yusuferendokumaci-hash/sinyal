'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MatchCard } from '@/components/MatchCard';
import { PredictionPanel } from '@/components/PredictionPanel';
import { DailyPick } from '@/components/DailyPick';
import { TrackRecord } from '@/components/TrackRecord';
import { MatchCardSkeleton, DailyPickSkeleton } from '@/components/LoadingSkeleton';
import { LeagueTable, getAvailableLeagues } from '@/components/LeagueTable';
import { TopScorers } from '@/components/TopScorers';
import { CompareMode } from '@/components/CompareMode';
import { Accordion } from '@/components/Accordion';
import { matches as mockMatches, getLeagues as getMockLeagues, getMatchById as getMockMatchById, Match } from '@/lib/mock-data';
import { getFlag } from '@/lib/flags';
import { Locale, t, getMarketName, getOptionName } from '@/lib/i18n';
import {
  Calendar, Filter, Sparkles, BarChart3, Shield, Zap,
  Trophy, ArrowLeftRight, Users, Newspaper, ChevronDown,
} from 'lucide-react';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('tr');
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'scorers'>('matches');
  const [showCompare, setShowCompare] = useState(false);
  const [showLeagueFilter, setShowLeagueFilter] = useState(false);
  const [liveMatches, setLiveMatches] = useState<Match[]>(mockMatches);
  const [dataSource, setDataSource] = useState<'mock' | 'api'>('mock');
  const [loading, setLoading] = useState(true);


  // Fetch live data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        if (data.source === 'api' && data.matches?.length > 0) {
          setLiveMatches(data.matches);
          setDataSource('api');
        }
      } catch {
        // Keep mock data
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const matches = liveMatches;
  const leagues = [...new Set(matches.map((m: Match) => m.league))];
  const leagueCountryMap = new Map<string, string>();
  matches.forEach((m: Match) => leagueCountryMap.set(m.league, m.leagueCountry));

  const baseMatches = selectedLeague
    ? matches.filter((m: Match) => m.league === selectedLeague)
    : matches;

  // Sort by kickoff time
  const filteredMatches = [...baseMatches].sort((a: Match, b: Match) => {
    return a.kickoff.localeCompare(b.kickoff);
  });

  const match = selectedMatch ? matches.find((m: Match) => m.id === selectedMatch) : null;


  if (match) {
    return (
      <div className="min-h-screen bg-background">
        <Header locale={locale} onLocaleChange={setLocale} />
        <PredictionPanel
          match={match}
          locale={locale}
          onBack={() => setSelectedMatch(null)}
        />
      </div>
    );
  }

  if (showCompare) {
    return (
      <div className="min-h-screen bg-background">
        <Header locale={locale} onLocaleChange={setLocale} />
        <CompareMode matches={matches} locale={locale} onClose={() => setShowCompare(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header locale={locale} onLocaleChange={setLocale} />

      {/* Compact Hero Bar */}
      <section className="border-b border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[11px] font-medium text-accent">AI Tahmin Motoru</span>
              </div>
              {dataSource === 'api' && (
                <div className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span className="text-[10px] font-medium text-gold">CANLI VERI</span>
                </div>
              )}
              {loading && (
                <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-1">
                  <span className="text-[10px] font-medium text-blue-400">Yukleniyor...</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <QuickStat icon={<Shield className="w-3.5 h-3.5" />} value={matches.length.toString()} label={locale === 'tr' ? 'Mac' : 'Matches'} />
              <QuickStat icon={<BarChart3 className="w-3.5 h-3.5" />} value={leagues.length.toString()} label={locale === 'tr' ? 'Lig' : 'Leagues'} />
              <QuickStat icon={<Zap className="w-3.5 h-3.5" />} value="10" label={locale === 'tr' ? 'Bahis' : 'Bets'} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">
        {/* Daily Pick + Track Record */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {loading ? <DailyPickSkeleton /> : <DailyPick matches={matches} locale={locale} />}
          <TrackRecord locale={locale} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'matches' ? 'bg-accent text-background' : 'bg-card text-muted border border-border hover:border-accent/40'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {locale === 'tr' ? 'Maclar' : 'Matches'}
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'standings' ? 'bg-accent text-background' : 'bg-card text-muted border border-border hover:border-accent/40'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {locale === 'tr' ? 'Puan Tablosu' : 'Standings'}
          </button>
          <button
            onClick={() => setActiveTab('scorers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'scorers' ? 'bg-accent text-background' : 'bg-card text-muted border border-border hover:border-accent/40'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {locale === 'tr' ? 'Gol Kralligi' : 'Top Scorers'}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-card text-muted border border-border hover:border-accent/40 transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            {locale === 'tr' ? 'Karsilastir' : 'Compare'}
          </button>
        </div>

        {/* Tab content: Matches */}
        {activeTab === 'matches' && (
          <>
            {/* Header + League filter dropdown */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-bold">{t(locale, 'todayMatches')}</h2>
                <span className="text-xs text-muted bg-card border border-border rounded-full px-2.5 py-1">
                  {filteredMatches.length} {locale === 'tr' ? 'mac' : 'matches'}
                </span>
              </div>

              {/* League dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLeagueFilter(!showLeagueFilter)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border hover:border-accent/40 transition-all text-xs"
                >
                  <Filter className="w-3.5 h-3.5 text-muted" />
                  {selectedLeague ? (
                    <>
                      <span className="text-sm">{getFlag(leagueCountryMap.get(selectedLeague) || '')}</span>
                      <span className="font-medium">{selectedLeague}</span>
                    </>
                  ) : (
                    <span className="text-muted">{t(locale, 'allLeagues')}</span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${showLeagueFilter ? 'rotate-180' : ''}`} />
                </button>

                {showLeagueFilter && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLeagueFilter(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl shadow-black/20 overflow-hidden z-50">
                      <div className="px-3 py-2 border-b border-border">
                        <span className="text-[10px] text-muted font-medium uppercase tracking-wide">
                          {locale === 'tr' ? 'Lig Sec' : 'Select League'}
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <button
                          onClick={() => { setSelectedLeague(null); setShowLeagueFilter(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-surface/50 transition-colors ${
                            !selectedLeague ? 'bg-accent/10 text-accent' : 'text-foreground'
                          }`}
                        >
                          <span className="text-sm">🌍</span>
                          <span className="font-medium">{t(locale, 'allLeagues')}</span>
                          <span className="ml-auto text-[10px] text-muted">{matches.length}</span>
                        </button>
                        {leagues.map((league) => {
                          const country = leagueCountryMap.get(league) || '';
                          const count = matches.filter((m: Match) => m.league === league).length;
                          return (
                            <button
                              key={league}
                              onClick={() => { setSelectedLeague(league); setShowLeagueFilter(false); }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-surface/50 transition-colors border-t border-border/30 ${
                                selectedLeague === league ? 'bg-accent/10 text-accent' : 'text-foreground'
                              }`}
                            >
                              <span className="text-sm">{getFlag(country)}</span>
                              <span className="font-medium">{league}</span>
                              <span className="ml-auto text-[10px] text-muted bg-surface px-1.5 py-0.5 rounded">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Match grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-hidden">
              {loading ? (
                <>
                  {[...Array(6)].map((_, i) => <MatchCardSkeleton key={i} />)}
                </>
              ) : filteredMatches.map((match, i) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  locale={locale}
                  onSelect={setSelectedMatch}
                  delay={Math.min(i + 1, 4)}
                />
              ))}
            </div>
          </>
        )}

        {/* Tab content: Standings */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            {getAvailableLeagues().map((league) => (
              <Accordion
                key={league}
                icon={<Trophy className="w-4 h-4 text-gold" />}
                title={league}
                defaultOpen={league === 'Super Lig'}
              >
                <LeagueTable league={league} locale={locale} />
              </Accordion>
            ))}
          </div>
        )}

        {/* Tab content: Top Scorers */}
        {activeTab === 'scorers' && (
          <div className="space-y-4">
            {['Super Lig', 'La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1', 'Eredivisie', 'Saudi Pro League', 'Superliga', 'Eliteserien', 'Allsvenskan', 'Super League', 'Ekstraklasa', 'Liga MX'].map((league) => (
              <Accordion
                key={league}
                icon={<Users className="w-4 h-4 text-accent" />}
                title={league}
                defaultOpen={league === 'Super Lig'}
              >
                <TopScorers league={league} locale={locale} />
              </Accordion>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="/favicon.svg" alt="SINYAL" className="w-6 h-6" />
                <span className="font-bold text-sm bg-gradient-to-r from-accent-light to-gold-light bg-clip-text text-transparent">SINYAL</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                {locale === 'tr'
                  ? 'Yapay zeka destekli futbol tahmin platformu. Dixon-Coles ve Poisson istatistik modelleri ile analiz.'
                  : 'AI-powered football prediction platform using Dixon-Coles and Poisson statistical models.'}
              </p>
            </div>

            {/* Links */}
            <div>
              <div className="text-xs font-semibold mb-2">{locale === 'tr' ? 'Sosyal Medya' : 'Social Media'}</div>
              <div className="space-y-1.5">
                <a href="https://t.me/sinyaltahminleri" target="_blank" rel="noopener" className="flex items-center gap-1.5 text-[11px] text-muted hover:text-accent transition-colors">
                  📱 Telegram
                </a>
              </div>
            </div>

            {/* Stats */}
            <div>
              <div className="text-xs font-semibold mb-2">{locale === 'tr' ? 'Ozellikler' : 'Features'}</div>
              <div className="space-y-1 text-[11px] text-muted">
                <div>🔬 {locale === 'tr' ? 'Dixon-Coles Modeli' : 'Dixon-Coles Model'}</div>
                <div>📊 {locale === 'tr' ? '25+ Lig Destegi' : '25+ League Support'}</div>
                <div>💰 {locale === 'tr' ? 'Gercek Bahisci Oranlari' : 'Real Bookmaker Odds'}</div>
                <div>🤖 {locale === 'tr' ? 'Telegram Bot' : 'Telegram Bot'}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[10px] text-muted/60">
              &copy; 2026 SINYAL. {locale === 'tr' ? 'Tum haklari saklidir.' : 'All rights reserved.'}
            </p>
            <p className="text-[10px] text-muted/40">
              {locale === 'tr'
                ? 'Bu site sadece bilgi amaclidir. Bahis kararlari tamamen size aittir.'
                : 'For informational purposes only. Betting decisions are entirely your own.'}
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

function QuickStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-accent">
        {icon}
      </div>
      <div>
        <div className="text-lg font-black">{value}</div>
        <div className="text-[10px] text-muted">{label}</div>
      </div>
    </div>
  );
}
