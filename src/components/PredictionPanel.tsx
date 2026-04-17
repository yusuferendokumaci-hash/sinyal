'use client';

import { Match } from '@/lib/mock-data';
import { generatePredictions } from '@/lib/predictions';
import { Locale, t, getMarketName, getOptionName } from '@/lib/i18n';
import { OddsBar } from './OddsBar';
import { StatsSection } from './StatsSection';
import { Accordion } from './Accordion';
import { FormChart } from './FormChart';
import { GoalDistribution } from './GoalDistribution';
import { TeamLogo } from './TeamLogo';
import { ShareCard } from './ShareCard';
import { LiveBadge } from './LiveBadge';
import {
  Trophy,
  Target,
  BarChart3,
  Brain,
  ChevronLeft,
  Zap,
  Award,
  Flag,
  Share2,
  CreditCard,
  LineChart,
} from 'lucide-react';

interface PredictionPanelProps {
  match: Match;
  locale: Locale;
  onBack: () => void;
}

const categoryConfig: Record<string, { icon: (open?: boolean) => React.ReactNode; titleKey: string; badgeColor: string }> = {
  matchResult: {
    icon: () => <Trophy className="w-4 h-4 text-gold" />,
    titleKey: 'catMatchResult',
    badgeColor: 'bg-gold/15 text-gold',
  },
  goals: {
    icon: () => <Target className="w-4 h-4 text-accent" />,
    titleKey: 'catGoals',
    badgeColor: 'bg-accent/15 text-accent',
  },
  firstHalf: {
    icon: () => <Zap className="w-4 h-4 text-purple-400" />,
    titleKey: 'catFirstHalf',
    badgeColor: 'bg-purple-400/15 text-purple-400',
  },
  corners: {
    icon: () => <Flag className="w-4 h-4 text-blue-400" />,
    titleKey: 'catCorners',
    badgeColor: 'bg-blue-400/15 text-blue-400',
  },
  cards: {
    icon: () => <CreditCard className="w-4 h-4 text-red-400" />,
    titleKey: 'catCards',
    badgeColor: 'bg-red-400/15 text-red-400',
  },
};

export function PredictionPanel({ match, locale, onBack }: PredictionPanelProps) {
  const prediction = generatePredictions(match);

  const confidenceLevel =
    prediction.mainPrediction.confidence >= 55
      ? { label: t(locale, 'highConfidence'), color: 'text-accent', bg: 'bg-accent/15', border: 'border-accent/30' }
      : prediction.mainPrediction.confidence >= 40
      ? { label: t(locale, 'mediumConfidence'), color: 'text-gold', bg: 'bg-gold/15', border: 'border-gold/30' }
      : { label: t(locale, 'lowConfidence'), color: 'text-muted', bg: 'bg-muted/15', border: 'border-muted/30' };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted hover:text-accent transition-colors text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        {t(locale, 'back')}
      </button>

      {/* Match header */}
      <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-xs text-muted">{match.league} &middot; {match.kickoff}</span>
          <LiveBadge status={match.status} locale={locale} />
        </div>
        <div className="flex items-center justify-center gap-8 sm:gap-16">
          <div className="text-center">
            <div className="mb-2 flex justify-center"><TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size="xl" /></div>
            <div className="text-lg font-bold">{match.homeTeam.name}</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {match.homeTeam.form.map((f, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center ${
                    f === 'W' ? 'bg-accent/20 text-accent' : f === 'D' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-2 border-accent/30 flex items-center justify-center bg-accent/5">
              <span className="text-xl font-bold text-accent">VS</span>
            </div>
          </div>

          <div className="text-center">
            <div className="mb-2 flex justify-center"><TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size="xl" /></div>
            <div className="text-lg font-bold">{match.awayTeam.name}</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {match.awayTeam.form.map((f, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center ${
                    f === 'W' ? 'bg-accent/20 text-accent' : f === 'D' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Prediction - always visible */}
      <div className="bg-card border border-accent/30 rounded-2xl p-5 sm:p-6 glow-green animate-fade-in animate-fade-in-delay-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <h2 className="text-lg font-bold">{t(locale, 'mainPrediction')}</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">
              {prediction.mainPrediction.label}
            </div>
            <p className="text-sm text-muted max-w-md">
              {locale === 'tr' ? prediction.mainPrediction.description_tr : prediction.mainPrediction.description_en}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-1.5">
            <div className="text-4xl font-black text-accent">
              %{prediction.mainPrediction.confidence}
            </div>
            <div className="text-lg font-bold text-gold">
              {prediction.mainPrediction.odds}x
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${confidenceLevel.bg} ${confidenceLevel.color} ${confidenceLevel.border} border`}>
              {confidenceLevel.label}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Share2 className="w-3 h-3" />
            {locale === 'tr' ? 'Paylas' : 'Share'}
          </div>
          <ShareCard match={match} prediction={prediction.mainPrediction} locale={locale} />
        </div>
      </div>

      {/* Market Categories - Accordion sections */}
      {prediction.categories.map((category) => {
        const config = categoryConfig[category.id];
        if (!config) return null;

        const recommendedCount = category.markets.reduce(
          (acc, m) => acc + m.options.filter((o) => o.recommended).length, 0
        );

        return (
          <Accordion
            key={category.id}
            icon={config.icon()}
            title={t(locale, config.titleKey as keyof typeof import('@/lib/i18n').translations.tr)}
            badge={`${category.markets.length} ${locale === 'tr' ? 'market' : 'markets'}`}
            badgeColor={config.badgeColor}
          >
            {/* Goal averages summary for goals category */}
            {category.id === 'goals' && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-surface rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} size="sm" />
                    <span className="text-xs font-semibold">{match.homeTeam.shortName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-black text-accent">{match.homeTeam.avgGoalsScored.toFixed(1)}</div>
                      <div className="text-[9px] text-muted">{locale === 'tr' ? 'Att. Ort.' : 'Scored/G'}</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-danger">{match.homeTeam.avgGoalsConceded.toFixed(1)}</div>
                      <div className="text-[9px] text-muted">{locale === 'tr' ? 'Yed. Ort.' : 'Conc./G'}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-surface rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} size="sm" />
                    <span className="text-xs font-semibold">{match.awayTeam.shortName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-black text-accent">{match.awayTeam.avgGoalsScored.toFixed(1)}</div>
                      <div className="text-[9px] text-muted">{locale === 'tr' ? 'Att. Ort.' : 'Scored/G'}</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-danger">{match.awayTeam.avgGoalsConceded.toFixed(1)}</div>
                      <div className="text-[9px] text-muted">{locale === 'tr' ? 'Yed. Ort.' : 'Conc./G'}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 bg-accent/5 border border-accent/20 rounded-xl p-3 text-center">
                  <div className="text-xs text-muted mb-1">{locale === 'tr' ? 'Toplam Gol Ortalamasi' : 'Combined Goal Average'}</div>
                  <div className="text-2xl font-black text-accent">
                    {(match.homeTeam.avgGoalsScored + match.awayTeam.avgGoalsScored).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted">{locale === 'tr' ? 'mac basi beklenen gol' : 'expected goals per match'}</div>
                </div>
              </div>
            )}

            {/* First Half score predictions */}
            {category.id === 'firstHalf' && prediction.halfTimeScorePredictions && prediction.halfTimeScorePredictions.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-muted mb-3 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  {locale === 'tr' ? 'Ilk Yari Skor Tahminleri' : 'First Half Score Predictions'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {prediction.halfTimeScorePredictions.slice(0, 6).map((sp, i) => (
                    <div
                      key={i}
                      className={`text-center py-2.5 px-3 rounded-lg border transition-all ${
                        i === 0 ? 'border-purple-400/40 bg-purple-400/5' : 'border-border bg-surface'
                      }`}
                    >
                      <div className="text-xl font-black mb-0.5">
                        <span className={i === 0 ? 'text-purple-400' : 'text-foreground'}>
                          {sp.home} - {sp.away}
                        </span>
                      </div>
                      <div className={`text-[10px] font-medium ${i === 0 ? 'text-purple-400' : 'text-muted'}`}>
                        %{sp.probability}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              {category.markets.map((market) => (
                <div key={market.label}>
                  <h3 className="text-sm font-semibold text-muted mb-3 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" />
                    {getMarketName(locale, market.label)}
                  </h3>
                  <div className="space-y-2">
                    {market.options.map((opt) => (
                      <OddsBar
                        key={opt.name}
                        label={formatOptionLabel(opt.name, match, locale)}
                        probability={opt.probability}
                        recommended={opt.recommended}
                        color={opt.recommended ? 'green' : 'blue'}
                        bookmakerOdds={opt.bookmakerOdds}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Accordion>
        );
      })}

      {/* Score Predictions - Accordion */}
      <Accordion
        icon={<Award className="w-4 h-4 text-purple-400" />}
        title={t(locale, 'catScorePredictions' as keyof typeof import('@/lib/i18n').translations.tr)}
        badge={`${prediction.scorePredictions.length} ${locale === 'tr' ? 'skor' : 'scores'}`}
        badgeColor="bg-purple-400/15 text-purple-400"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {prediction.scorePredictions.map((sp, i) => (
            <div
              key={i}
              className={`text-center py-3 px-4 rounded-xl border transition-all ${
                i === 0
                  ? 'border-accent/40 bg-accent/5 glow-green'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="text-2xl font-black mb-1">
                <span className={i === 0 ? 'text-accent' : 'text-foreground'}>
                  {sp.home} - {sp.away}
                </span>
              </div>
              <div className={`text-xs font-medium ${i === 0 ? 'text-accent' : 'text-muted'}`}>
                %{sp.probability}
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Charts - Accordion */}
      <Accordion
        icon={<LineChart className="w-4 h-4 text-pink-400" />}
        title={locale === 'tr' ? 'Grafikler' : 'Charts'}
        badgeColor="bg-pink-400/15 text-pink-400"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted mb-3">{locale === 'tr' ? 'Form Grafigi' : 'Form Chart'}</h3>
            <FormChart homeTeam={match.homeTeam} awayTeam={match.awayTeam} locale={locale} />
          </div>
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-muted mb-3">{locale === 'tr' ? 'Gol Dagilimi' : 'Goal Distribution'}</h3>
            <GoalDistribution
              homeGoalsScored={match.homeTeam.goalsScored}
              homeGoalsConceded={match.homeTeam.goalsConceded}
              awayGoalsScored={match.awayTeam.goalsScored}
              awayGoalsConceded={match.awayTeam.goalsConceded}
              homeName={match.homeTeam.shortName}
              awayName={match.awayTeam.shortName}
              locale={locale}
            />
          </div>
        </div>
      </Accordion>

      {/* AI Analysis - Accordion */}
      <Accordion
        icon={<Brain className="w-4 h-4 text-orange-400" />}
        title={t(locale, 'catAnalysis' as keyof typeof import('@/lib/i18n').translations.tr)}
        badgeColor="bg-orange-400/15 text-orange-400"
      >
        <div className="bg-surface rounded-xl p-4 border border-border">
          <pre className="text-sm text-muted/90 whitespace-pre-wrap font-sans leading-relaxed">
            {locale === 'tr' ? prediction.analysis_tr : prediction.analysis_en}
          </pre>
        </div>
      </Accordion>

      {/* Statistics - Accordion */}
      <Accordion
        icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
        title={t(locale, 'catStats' as keyof typeof import('@/lib/i18n').translations.tr)}
        badgeColor="bg-cyan-400/15 text-cyan-400"
      >
        <StatsSection match={match} locale={locale} embedded />
      </Accordion>
    </div>
  );
}

function formatOptionLabel(name: string, match: Match, locale: Locale): string {
  if (name === '1') return match.homeTeam.name;
  if (name === '2') return match.awayTeam.name;
  if (name === 'X') return t(locale, 'draw');
  if (name === '1X') return `${match.homeTeam.shortName} / ${t(locale, 'draw')}`;
  if (name === 'X2') return `${t(locale, 'draw')} / ${match.awayTeam.shortName}`;
  if (name === '12') return `${match.homeTeam.shortName} / ${match.awayTeam.shortName}`;
  return getOptionName(locale, name);
}
