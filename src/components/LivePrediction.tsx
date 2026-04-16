'use client';

import { Locale } from '@/lib/i18n';
import { Zap, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface LivePredictionProps {
  matchId: string;
  homeName: string;
  awayName: string;
  homeGoals: number;
  awayGoals: number;
  minute: number;
  locale: Locale;
}

interface LiveTip {
  label: string;
  confidence: number;
  reasoning: string;
  type: 'hot' | 'safe' | 'risky';
}

function generateLiveTips(
  homeGoals: number, awayGoals: number, minute: number,
  homeName: string, awayName: string
): LiveTip[] {
  const tips: LiveTip[] = [];
  const totalGoals = homeGoals + awayGoals;
  const remaining = 90 - minute;
  const isFirstHalf = minute <= 45;

  // Goal-based tips
  if (totalGoals === 0 && minute >= 30 && minute <= 60) {
    tips.push({
      label: `${minute}. dk 0-0 | Ilk golü ${homeName} atacak`,
      confidence: 58,
      reasoning: 'Ev sahibi baskisi artiyor, gol beklentisi yuksek',
      type: 'risky',
    });
  }

  if (totalGoals >= 2 && minute <= 60) {
    tips.push({
      label: '2.5 Ust Gol',
      confidence: 72,
      reasoning: `${totalGoals} gol ${minute}. dk'da - tempo yuksek, daha fazla gol bekleniyor`,
      type: 'hot',
    });
  }

  if (totalGoals === 0 && minute >= 65) {
    tips.push({
      label: '0.5 Alt (Golsuz biter)',
      confidence: 55,
      reasoning: 'Gec dakikalar, iki takim da savunma agirlikli',
      type: 'safe',
    });
  }

  if (homeGoals > awayGoals && minute >= 70) {
    tips.push({
      label: `${homeName} Kazanir (MS1)`,
      confidence: 78,
      reasoning: `${homeName} ${homeGoals}-${awayGoals} onde, ${remaining} dk kaldi`,
      type: 'safe',
    });
  }

  if (homeGoals === awayGoals && minute >= 60) {
    tips.push({
      label: 'Beraberlik (X)',
      confidence: 62,
      reasoning: `${homeGoals}-${awayGoals} esitlik, iki takim da risk almiyor`,
      type: 'safe',
    });
  }

  if (totalGoals >= 1 && totalGoals <= 2 && minute >= 45 && minute <= 70) {
    tips.push({
      label: 'KG Var',
      confidence: 60,
      reasoning: 'Her iki takim da atak yapiyor, ikinci gol bekleniyor',
      type: 'risky',
    });
  }

  // Always return at least one tip
  if (tips.length === 0) {
    tips.push({
      label: minute <= 45 ? 'Ilk yari analizi devam ediyor' : 'Mac analiz ediliyor',
      confidence: 50,
      reasoning: 'Yeterli veri bekleniyor',
      type: 'safe',
    });
  }

  return tips.slice(0, 3);
}

export function LivePrediction({ matchId, homeName, awayName, homeGoals, awayGoals, minute, locale }: LivePredictionProps) {
  const tips = generateLiveTips(homeGoals, awayGoals, minute, homeName, awayName);

  return (
    <div className="bg-gradient-to-r from-danger/5 to-gold/5 border border-danger/20 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          <span className="text-[10px] font-black text-danger">CANLI TAHMIN</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted">
          <Clock className="w-2.5 h-2.5" />
          {minute}&apos;
        </div>
        <span className="text-xs font-black text-foreground ml-auto">{homeGoals} - {awayGoals}</span>
      </div>

      <div className="space-y-1.5">
        {tips.map((tip, i) => (
          <div key={i} className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
            tip.type === 'hot' ? 'bg-gold/10 border border-gold/20' :
            tip.type === 'risky' ? 'bg-danger/10 border border-danger/20' :
            'bg-surface border border-border'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              {tip.type === 'hot' ? <Zap className="w-3 h-3 text-gold flex-shrink-0" /> :
               tip.type === 'risky' ? <AlertTriangle className="w-3 h-3 text-danger flex-shrink-0" /> :
               <TrendingUp className="w-3 h-3 text-accent flex-shrink-0" />}
              <div className="min-w-0">
                <div className="text-[11px] font-semibold truncate">{tip.label}</div>
                <div className="text-[9px] text-muted truncate">{tip.reasoning}</div>
              </div>
            </div>
            <span className={`text-[11px] font-bold flex-shrink-0 ml-2 ${
              tip.confidence >= 70 ? 'text-accent' : tip.confidence >= 55 ? 'text-gold' : 'text-muted'
            }`}>
              {tip.confidence}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 text-center text-[9px] text-muted/60">
        {locale === 'tr' ? 'Pro plan ile gercek zamanli analiz' : 'Real-time analysis with Pro plan'}
      </div>
    </div>
  );
}
