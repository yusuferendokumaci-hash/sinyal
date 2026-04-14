'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { PredictionPanel } from '@/components/PredictionPanel';
import { matches as mockMatches, Match } from '@/lib/mock-data';
import { Locale } from '@/lib/i18n';

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('tr');
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        const allMatches = data.matches || mockMatches;
        const found = allMatches.find((m: Match) => m.id === params.id);
        setMatch(found || null);
      } catch {
        const found = mockMatches.find(m => m.id === params.id);
        setMatch(found || null);
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Header locale={locale} onLocaleChange={setLocale} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-4xl mb-4">404</div>
          <div className="text-muted">{locale === 'tr' ? 'Mac bulunamadi' : 'Match not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header locale={locale} onLocaleChange={setLocale} />
      <PredictionPanel match={match} locale={locale} onBack={() => router.push('/')} />
    </div>
  );
}
