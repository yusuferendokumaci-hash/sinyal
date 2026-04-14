'use client';

import { Match } from '@/lib/mock-data';
import { MainPick } from '@/lib/predictions';
import { Locale } from '@/lib/i18n';
import { Share2, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareCardProps {
  match: Match;
  prediction: MainPick;
  locale: Locale;
}

export function ShareCard({ match, prediction, locale }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = locale === 'tr'
    ? `${match.homeTeam.name} vs ${match.awayTeam.name}\nTahmin: ${prediction.label}\nOlasilik: %${prediction.confidence} | Oran: ${prediction.odds}\n\nSINYAL - AI Futbol Tahminleri`
    : `${match.homeTeam.name} vs ${match.awayTeam.name}\nPrediction: ${prediction.label}\nProbability: ${prediction.confidence}% | Odds: ${prediction.odds}\n\nSINYAL - AI Football Predictions`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-muted hover:text-foreground hover:border-accent/40 transition-all"
      >
        {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
        {copied ? (locale === 'tr' ? 'Kopyalandi' : 'Copied') : (locale === 'tr' ? 'Kopyala' : 'Copy')}
      </button>
      <button
        onClick={handleTwitter}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-xs text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-all"
      >
        <ExternalLink className="w-3 h-3" />
        Tweet
      </button>
    </div>
  );
}
