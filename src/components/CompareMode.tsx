'use client';

import { useState } from 'react';
import { Match } from '@/lib/mock-data';
import { Locale, t } from '@/lib/i18n';
import { ArrowLeftRight, X } from 'lucide-react';
import { TeamLogo } from './TeamLogo';

interface CompareModeProps {
  matches: Match[];
  locale: Locale;
  onClose: () => void;
}

export function CompareMode({ matches, locale, onClose }: CompareModeProps) {
  // Collect all unique teams
  const teamsMap = new Map<string, Match['homeTeam']>();
  matches.forEach((m) => {
    teamsMap.set(m.homeTeam.id, m.homeTeam);
    teamsMap.set(m.awayTeam.id, m.awayTeam);
  });
  const allTeams = Array.from(teamsMap.values());

  const [team1Id, setTeam1Id] = useState(allTeams[0]?.id || '');
  const [team2Id, setTeam2Id] = useState(allTeams[1]?.id || '');

  const team1 = teamsMap.get(team1Id);
  const team2 = teamsMap.get(team2Id);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold">
              {locale === 'tr' ? 'Takim Karsilastirma' : 'Team Comparison'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-card rounded-xl transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Team selectors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <select
            value={team1Id}
            onChange={(e) => setTeam1Id(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:border-accent outline-none"
          >
            {allTeams.map((tm) => (
              <option key={tm.id} value={tm.id}>{tm.name}</option>
            ))}
          </select>
          <select
            value={team2Id}
            onChange={(e) => setTeam2Id(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:border-accent outline-none"
          >
            {allTeams.map((tm) => (
              <option key={tm.id} value={tm.id}>{tm.name}</option>
            ))}
          </select>
        </div>

        {team1 && team2 && (
          <div className="space-y-4">
            {/* Team Headers */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-card border border-border rounded-2xl p-4">
                <div className="mb-2 flex justify-center"><TeamLogo logo={team1.logo} name={team1.name} size="xl" /></div>
                <div className="text-sm font-bold">{team1.name}</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">VS</span>
                </div>
              </div>
              <div className="text-center bg-card border border-border rounded-2xl p-4">
                <div className="mb-2 flex justify-center"><TeamLogo logo={team2.logo} name={team2.name} size="xl" /></div>
                <div className="text-sm font-bold">{team2.name}</div>
              </div>
            </div>

            {/* Comparison rows */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <CompareRow
                label={t(locale, 'goalsScored')}
                val1={team1.goalsScored}
                val2={team2.goalsScored}
                higherBetter
              />
              <CompareRow
                label={t(locale, 'goalsConceded')}
                val1={team1.goalsConceded}
                val2={team2.goalsConceded}
                higherBetter={false}
              />
              <CompareRow
                label={`${t(locale, 'avgGoals')} (${locale === 'tr' ? 'Atilan' : 'Scored'})`}
                val1={team1.avgGoalsScored}
                val2={team2.avgGoalsScored}
                higherBetter
                decimal
              />
              <CompareRow
                label={`${t(locale, 'avgGoals')} (${locale === 'tr' ? 'Yenilen' : 'Conceded'})`}
                val1={team1.avgGoalsConceded}
                val2={team2.avgGoalsConceded}
                higherBetter={false}
                decimal
              />
              <CompareRow
                label={`${t(locale, 'home')} %`}
                val1={Math.round(team1.homeWinRate * 100)}
                val2={Math.round(team2.homeWinRate * 100)}
                higherBetter
                suffix="%"
              />
              <CompareRow
                label={`${t(locale, 'away')} %`}
                val1={Math.round(team1.awayWinRate * 100)}
                val2={Math.round(team2.awayWinRate * 100)}
                higherBetter
                suffix="%"
              />
              <CompareRow
                label={`${t(locale, 'form')} (${locale === 'tr' ? 'Puan' : 'Pts'})`}
                val1={team1.form.reduce((a, f) => a + (f === 'W' ? 3 : f === 'D' ? 1 : 0), 0)}
                val2={team2.form.reduce((a, f) => a + (f === 'W' ? 3 : f === 'D' ? 1 : 0), 0)}
                higherBetter
              />
            </div>

            {/* Form comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <div className="text-[10px] text-muted mb-2">{team1.shortName} - {t(locale, 'form')}</div>
                <div className="flex items-center justify-center gap-1">
                  {team1.form.map((f, i) => (
                    <span key={i} className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                      f === 'W' ? 'bg-accent/20 text-accent' : f === 'D' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                    }`}>{f}</span>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <div className="text-[10px] text-muted mb-2">{team2.shortName} - {t(locale, 'form')}</div>
                <div className="flex items-center justify-center gap-1">
                  {team2.form.map((f, i) => (
                    <span key={i} className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                      f === 'W' ? 'bg-accent/20 text-accent' : f === 'D' ? 'bg-gold/20 text-gold' : 'bg-danger/20 text-danger'
                    }`}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompareRow({ label, val1, val2, higherBetter, decimal, suffix = '' }: {
  label: string;
  val1: number;
  val2: number;
  higherBetter: boolean;
  decimal?: boolean;
  suffix?: string;
}) {
  const winner1 = higherBetter ? val1 > val2 : val1 < val2;
  const winner2 = higherBetter ? val2 > val1 : val2 < val1;
  const tie = val1 === val2;

  return (
    <div className="flex items-center border-b border-border/50 last:border-0">
      <div className={`flex-1 text-center py-3 text-sm font-bold ${winner1 && !tie ? 'text-accent' : 'text-foreground'}`}>
        {decimal ? val1.toFixed(1) : val1}{suffix}
        {winner1 && !tie && <span className="text-[10px] ml-1">{'>'}</span>}
      </div>
      <div className="px-3 py-3 text-[10px] text-muted text-center min-w-[100px] bg-surface/50">
        {label}
      </div>
      <div className={`flex-1 text-center py-3 text-sm font-bold ${winner2 && !tie ? 'text-accent' : 'text-foreground'}`}>
        {winner2 && !tie && <span className="text-[10px] mr-1">{'<'}</span>}
        {decimal ? val2.toFixed(1) : val2}{suffix}
      </div>
    </div>
  );
}
