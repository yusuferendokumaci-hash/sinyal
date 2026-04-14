import { Match } from './mock-data';

export interface ScorePrediction {
  home: number;
  away: number;
  probability: number;
}

export interface MarketOption {
  name: string;
  probability: number;
  recommended?: boolean;
  bookmakerOdds?: number; // Real odds from betting sites
}

export interface MarketPrediction {
  label: string;
  options: MarketOption[];
}

export interface MarketCategory {
  id: string;
  icon: string;
  markets: MarketPrediction[];
}

export interface MainPick {
  marketLabel: string;
  optionName: string;
  probability: number;
  odds: number;
  label: string;
  confidence: number;
  description_tr: string;
  description_en: string;
}

export interface MatchPrediction {
  mainPrediction: MainPick;
  categories: MarketCategory[];
  scorePredictions: ScorePrediction[];
  analysis_tr: string;
  analysis_en: string;
}

// --- Core math ---

function poissonProb(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

function probToOdds(prob: number): number {
  if (prob <= 0) return 99;
  return Math.round((1 / prob) * 100) / 100;
}

// --- Form & strength analysis ---

function formPoints(form: ('W' | 'D' | 'L')[]): number {
  // Exponential decay: most recent match matters most
  const weights = [1.5, 1.2, 1.0, 0.8, 0.6];
  let pts = 0, totalW = 0;
  form.forEach((r, i) => {
    const w = weights[i] || 0.5;
    totalW += w;
    if (r === 'W') pts += 3 * w;
    else if (r === 'D') pts += 1 * w;
  });
  return pts / (3 * totalW); // 0-1 scale
}

function attackStrength(team: Match['homeTeam'], leagueAvgGoals: number): number {
  return team.avgGoalsScored / Math.max(leagueAvgGoals, 0.5);
}

function defenseStrength(team: Match['homeTeam'], leagueAvgGoals: number): number {
  return team.avgGoalsConceded / Math.max(leagueAvgGoals, 0.5);
}

// --- Main prediction engine ---

export function generatePredictions(match: Match): MatchPrediction {
  const home = match.homeTeam;
  const away = match.awayTeam;
  const h2h = match.h2h;

  // League average estimation (from both teams' data)
  const leagueAvgGoals = (home.avgGoalsScored + home.avgGoalsConceded + away.avgGoalsScored + away.avgGoalsConceded) / 4;

  // Attack & defense ratings relative to league average
  const homeAttack = attackStrength(home, leagueAvgGoals);
  const homeDefense = defenseStrength(home, leagueAvgGoals);
  const awayAttack = attackStrength(away, leagueAvgGoals);
  const awayDefense = defenseStrength(away, leagueAvgGoals);

  // Form factors (0-1)
  const homeForm = formPoints(home.form);
  const awayForm = formPoints(away.form);

  // H2H factor
  const h2hHomeDominance = h2h.totalMatches > 0
    ? (h2h.homeWins - h2h.awayWins) / h2h.totalMatches
    : 0;

  // Expected goals using Dixon-Coles inspired model
  // xG = leagueAvg * attack_team * defense_opponent * venue_factor * form_adjustment * h2h_adjustment
  const HOME_ADVANTAGE = 1.25; // ~25% home boost (realistic)
  const AWAY_FACTOR = 0.85;

  let homeXG =
    leagueAvgGoals *
    homeAttack *
    awayDefense *
    HOME_ADVANTAGE *
    (0.7 + homeForm * 0.3) * // form adds up to 30%
    (1 + h2hHomeDominance * 0.1); // H2H adds up to 10%

  let awayXG =
    leagueAvgGoals *
    awayAttack *
    homeDefense *
    AWAY_FACTOR *
    (0.7 + awayForm * 0.3) *
    (1 - h2hHomeDominance * 0.1);

  // Clamp xG to realistic range
  homeXG = Math.max(0.3, Math.min(4.5, homeXG));
  awayXG = Math.max(0.2, Math.min(4.0, awayXG));

  // --- Poisson score matrix ---
  const MAX_GOALS = 8;
  const scoreMatrix: number[][] = [];
  for (let i = 0; i <= MAX_GOALS; i++) {
    scoreMatrix[i] = [];
    for (let j = 0; j <= MAX_GOALS; j++) {
      scoreMatrix[i][j] = poissonProb(homeXG, i) * poissonProb(awayXG, j);
    }
  }

  // Dixon-Coles low-score correction (rho parameter)
  // Adjusts 0-0, 1-0, 0-1, 1-1 probabilities based on correlation
  const rho = -0.05; // slight negative correlation typical
  const p00 = scoreMatrix[0][0];
  const p10 = scoreMatrix[1][0];
  const p01 = scoreMatrix[0][1];
  const p11 = scoreMatrix[1][1];

  scoreMatrix[0][0] = p00 * (1 + rho / (poissonProb(homeXG, 0) * poissonProb(awayXG, 0)));
  scoreMatrix[1][0] = p10 * (1 - rho * awayXG / (poissonProb(homeXG, 1) * poissonProb(awayXG, 0)));
  scoreMatrix[0][1] = p01 * (1 - rho * homeXG / (poissonProb(homeXG, 0) * poissonProb(awayXG, 1)));
  scoreMatrix[1][1] = p11 * (1 + rho / (poissonProb(homeXG, 1) * poissonProb(awayXG, 1)));

  // Ensure no negative probs
  for (let i = 0; i <= MAX_GOALS; i++)
    for (let j = 0; j <= MAX_GOALS; j++)
      scoreMatrix[i][j] = Math.max(0, scoreMatrix[i][j]);

  // Normalize
  let totalProb = 0;
  for (let i = 0; i <= MAX_GOALS; i++)
    for (let j = 0; j <= MAX_GOALS; j++)
      totalProb += scoreMatrix[i][j];

  for (let i = 0; i <= MAX_GOALS; i++)
    for (let j = 0; j <= MAX_GOALS; j++)
      scoreMatrix[i][j] /= totalProb;

  // --- Extract probabilities from score matrix ---
  let homeWinP = 0, drawP = 0, awayWinP = 0;
  let over15 = 0, over25 = 0, over35 = 0;
  let bttsYes = 0;
  const scoreProbs: ScorePrediction[] = [];

  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      const p = scoreMatrix[i][j];
      if (i > j) homeWinP += p;
      else if (i === j) drawP += p;
      else awayWinP += p;
      if (i + j >= 2) over15 += p;
      if (i + j >= 3) over25 += p;
      if (i + j >= 4) over35 += p;
      if (i > 0 && j > 0) bttsYes += p;
      if (p >= 0.015) {
        scoreProbs.push({ home: i, away: j, probability: Math.round(p * 1000) / 10 });
      }
    }
  }
  scoreProbs.sort((a, b) => b.probability - a.probability);

  // --- Build markets ---

  // Real bookmaker odds (if available from API)
  const bo = match.odds;

  // 1X2
  const matchResult: MarketPrediction = {
    label: '1X2',
    options: [
      { name: '1', probability: r1(homeWinP), recommended: homeWinP > drawP && homeWinP > awayWinP, bookmakerOdds: bo?.matchResult?.home },
      { name: 'X', probability: r1(drawP), recommended: drawP > homeWinP && drawP > awayWinP, bookmakerOdds: bo?.matchResult?.draw },
      { name: '2', probability: r1(awayWinP), recommended: awayWinP > homeWinP && awayWinP > drawP, bookmakerOdds: bo?.matchResult?.away },
    ],
  };

  // Double Chance
  const doubleChance: MarketPrediction = {
    label: 'doubleChance',
    options: [
      { name: '1X', probability: r1(homeWinP + drawP), recommended: (homeWinP + drawP) >= 0.6, bookmakerOdds: bo?.doubleChance?.homeOrDraw },
      { name: '12', probability: r1(homeWinP + awayWinP), bookmakerOdds: bo?.doubleChance?.homeOrAway },
      { name: 'X2', probability: r1(drawP + awayWinP), recommended: (drawP + awayWinP) >= 0.6, bookmakerOdds: bo?.doubleChance?.drawOrAway },
    ],
  };

  // First Half (use ~42% of xG for first half, standard split)
  const htHomeXG = homeXG * 0.44;
  const htAwayXG = awayXG * 0.44;
  let htHome = 0, htDraw = 0, htAway = 0;
  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 4; j++) {
      const p = poissonProb(htHomeXG, i) * poissonProb(htAwayXG, j);
      if (i > j) htHome += p;
      else if (i === j) htDraw += p;
      else htAway += p;
    }
  }
  const htT = htHome + htDraw + htAway;
  const firstHalf: MarketPrediction = {
    label: 'firstHalf',
    options: [
      { name: '1', probability: r1(htHome / htT), recommended: htHome / htT > htDraw / htT && htHome / htT > htAway / htT, bookmakerOdds: bo?.firstHalf?.home },
      { name: 'X', probability: r1(htDraw / htT), recommended: htDraw / htT > htHome / htT && htDraw / htT > htAway / htT, bookmakerOdds: bo?.firstHalf?.draw },
      { name: '2', probability: r1(htAway / htT), recommended: htAway / htT > htHome / htT && htAway / htT > htDraw / htT, bookmakerOdds: bo?.firstHalf?.away },
    ],
  };

  // Goals markets
  const overUnder15: MarketPrediction = {
    label: 'overUnder15',
    options: [
      { name: 'over', probability: r1(over15), recommended: over15 > 0.5, bookmakerOdds: bo?.overUnder15?.over },
      { name: 'under', probability: r1(1 - over15), recommended: over15 <= 0.5, bookmakerOdds: bo?.overUnder15?.under },
    ],
  };
  const overUnder25: MarketPrediction = {
    label: 'overUnder25',
    options: [
      { name: 'over', probability: r1(over25), recommended: over25 > 0.5, bookmakerOdds: bo?.overUnder25?.over },
      { name: 'under', probability: r1(1 - over25), recommended: over25 <= 0.5, bookmakerOdds: bo?.overUnder25?.under },
    ],
  };
  const overUnder35: MarketPrediction = {
    label: 'overUnder35',
    options: [
      { name: 'over', probability: r1(over35), recommended: over35 > 0.5, bookmakerOdds: bo?.overUnder35?.over },
      { name: 'under', probability: r1(1 - over35), recommended: over35 <= 0.5, bookmakerOdds: bo?.overUnder35?.under },
    ],
  };
  const btts: MarketPrediction = {
    label: 'btts',
    options: [
      { name: 'yes', probability: r1(bttsYes), recommended: bttsYes > 0.5, bookmakerOdds: bo?.btts?.yes },
      { name: 'no', probability: r1(1 - bttsYes), recommended: bttsYes <= 0.5, bookmakerOdds: bo?.btts?.no },
    ],
  };

  // --- Corners (regression-based model) ---
  // Average corners per game in top leagues: ~10-11
  // Corners correlate with: attack strength, opponent defense weakness, possession proxy
  const avgCornersPerGame = 10.2;
  const homeCornerXG = avgCornersPerGame * 0.53 * // home teams average ~53% of corners
    (homeAttack * 0.5 + awayDefense * 0.3 + homeForm * 0.2);
  const awayCornerXG = avgCornersPerGame * 0.47 *
    (awayAttack * 0.5 + homeDefense * 0.3 + awayForm * 0.2);
  const totalCornerXG = Math.max(6, Math.min(16, homeCornerXG + awayCornerXG));

  const cornerProbs = (threshold: number) => {
    let over = 0;
    for (let i = 0; i <= 25; i++) {
      if (i > threshold) over += poissonProb(totalCornerXG, i);
    }
    return over;
  };

  const corners85: MarketPrediction = {
    label: 'corners85',
    options: [
      { name: 'over', probability: r1(cornerProbs(8.5)), recommended: cornerProbs(8.5) > 0.5 },
      { name: 'under', probability: r1(1 - cornerProbs(8.5)), recommended: cornerProbs(8.5) <= 0.5 },
    ],
  };
  const corners95: MarketPrediction = {
    label: 'corners95',
    options: [
      { name: 'over', probability: r1(cornerProbs(9.5)), recommended: cornerProbs(9.5) > 0.5 },
      { name: 'under', probability: r1(1 - cornerProbs(9.5)), recommended: cornerProbs(9.5) <= 0.5 },
    ],
  };
  const corners105: MarketPrediction = {
    label: 'corners105',
    options: [
      { name: 'over', probability: r1(cornerProbs(10.5)), recommended: cornerProbs(10.5) > 0.5 },
      { name: 'under', probability: r1(1 - cornerProbs(10.5)), recommended: cornerProbs(10.5) <= 0.5 },
    ],
  };

  // --- Cards (intensity-based model) ---
  // Average cards per game: ~4-5 in top leagues
  // Factors: derby factor, referee tendencies (we approximate), defensive teams, form pressure
  const avgCardsPerGame = 4.3;
  const isCompetitiveMatch = Math.abs(homeWinP - awayWinP) < 0.15; // close match = more fouls
  const competitiveFactor = isCompetitiveMatch ? 1.15 : 1.0;
  // Defensive teams foul more
  const homeDefensivePressure = 1 + (homeDefense - 1) * 0.2;
  const awayDefensivePressure = 1 + (awayDefense - 1) * 0.2;
  const totalCardXG = Math.max(2, Math.min(8,
    avgCardsPerGame * competitiveFactor *
    ((homeDefensivePressure + awayDefensivePressure) / 2)
  ));

  const cardProbs = (threshold: number) => {
    let over = 0;
    for (let i = 0; i <= 15; i++) {
      if (i > threshold) over += poissonProb(totalCardXG, i);
    }
    return over;
  };

  const cards25: MarketPrediction = {
    label: 'cards25',
    options: [
      { name: 'over', probability: r1(cardProbs(2.5)), recommended: cardProbs(2.5) > 0.5 },
      { name: 'under', probability: r1(1 - cardProbs(2.5)), recommended: cardProbs(2.5) <= 0.5 },
    ],
  };
  const cards35: MarketPrediction = {
    label: 'cards35',
    options: [
      { name: 'over', probability: r1(cardProbs(3.5)), recommended: cardProbs(3.5) > 0.5 },
      { name: 'under', probability: r1(1 - cardProbs(3.5)), recommended: cardProbs(3.5) <= 0.5 },
    ],
  };
  const cards45: MarketPrediction = {
    label: 'cards45',
    options: [
      { name: 'over', probability: r1(cardProbs(4.5)), recommended: cardProbs(4.5) > 0.5 },
      { name: 'under', probability: r1(1 - cardProbs(4.5)), recommended: cardProbs(4.5) <= 0.5 },
    ],
  };

  // --- SMART MAIN PREDICTION ---
  // Scan ALL markets, find the best pick with min 1.40 odds
  const MIN_ODDS = 1.40;
  const MAX_ODDS = 5.0; // don't pick crazy long shots

  interface Candidate {
    marketLabel: string;
    optionName: string;
    probability: number;
    odds: number;
    value: number; // probability * odds (expected value)
  }

  const allMarkets = [
    matchResult, doubleChance, firstHalf,
    overUnder15, overUnder25, overUnder35, btts,
    corners85, corners95, corners105,
    cards25, cards35, cards45,
  ];

  const candidates: Candidate[] = [];
  for (const market of allMarkets) {
    for (const opt of market.options) {
      const prob = opt.probability / 100;
      const calcOdds = probToOdds(prob);
      // Use bookmaker odds if available, otherwise calculated
      const odds = opt.bookmakerOdds || calcOdds;
      if (odds >= MIN_ODDS && odds <= MAX_ODDS && prob >= 0.45) {
        candidates.push({
          marketLabel: market.label,
          optionName: opt.name,
          probability: opt.probability,
          odds,
          value: prob * odds * (prob > 0.6 ? 1.1 : 1.0),
        });
      }
    }
  }

  // Sort by: best value, then highest probability as tiebreaker
  candidates.sort((a, b) => {
    const valueDiff = b.value - a.value;
    if (Math.abs(valueDiff) > 0.01) return valueDiff;
    return b.probability - a.probability;
  });

  // Pick the best candidate, fallback to 1X2 winner if none qualifies
  let mainPick: MainPick;
  if (candidates.length > 0) {
    const best = candidates[0];
    const labelMap: Record<string, { tr: string; en: string }> = {
      '1X2': { tr: 'Mac Sonucu', en: 'Match Result' },
      doubleChance: { tr: 'Cift Sans', en: 'Double Chance' },
      firstHalf: { tr: 'Ilk Yari', en: 'First Half' },
      overUnder15: { tr: 'Alt/Ust 1.5 Gol', en: 'Over/Under 1.5 Goals' },
      overUnder25: { tr: 'Alt/Ust 2.5 Gol', en: 'Over/Under 2.5 Goals' },
      overUnder35: { tr: 'Alt/Ust 3.5 Gol', en: 'Over/Under 3.5 Goals' },
      btts: { tr: 'Karsilikli Gol', en: 'Both Teams to Score' },
      corners85: { tr: 'Korner 8.5', en: 'Corners 8.5' },
      corners95: { tr: 'Korner 9.5', en: 'Corners 9.5' },
      corners105: { tr: 'Korner 10.5', en: 'Corners 10.5' },
      cards25: { tr: 'Kart 2.5', en: 'Cards 2.5' },
      cards35: { tr: 'Kart 3.5', en: 'Cards 3.5' },
      cards45: { tr: 'Kart 4.5', en: 'Cards 4.5' },
    };

    const optNameMap: Record<string, { tr: string; en: string }> = {
      '1': { tr: home.name, en: home.name },
      '2': { tr: away.name, en: away.name },
      'X': { tr: 'Beraberlik', en: 'Draw' },
      '1X': { tr: `${home.shortName} veya Beraberlik`, en: `${home.shortName} or Draw` },
      'X2': { tr: `Beraberlik veya ${away.shortName}`, en: `Draw or ${away.shortName}` },
      '12': { tr: `${home.shortName} veya ${away.shortName}`, en: `${home.shortName} or ${away.shortName}` },
      over: { tr: 'Ust', en: 'Over' },
      under: { tr: 'Alt', en: 'Under' },
      yes: { tr: 'Var', en: 'Yes' },
      no: { tr: 'Yok', en: 'No' },
    };

    const mLabel = labelMap[best.marketLabel] || { tr: best.marketLabel, en: best.marketLabel };
    const oLabel = optNameMap[best.optionName] || { tr: best.optionName, en: best.optionName };

    mainPick = {
      marketLabel: best.marketLabel,
      optionName: best.optionName,
      probability: best.probability,
      odds: best.odds,
      label: `${mLabel.tr} - ${oLabel.tr}`,
      confidence: Math.round(best.probability),
      description_tr: `${mLabel.tr}: ${oLabel.tr} tahmini %${Math.round(best.probability)} olasilikla oneriliyor. Oran: ${best.odds}`,
      description_en: `${mLabel.en}: ${oLabel.en} predicted with ${Math.round(best.probability)}% probability. Odds: ${best.odds}`,
    };
  } else {
    // Fallback: best 1X2 option
    const best1x2 = [
      { name: '1', prob: homeWinP, label: home.name },
      { name: 'X', prob: drawP, label: 'Beraberlik' },
      { name: '2', prob: awayWinP, label: away.name },
    ].sort((a, b) => b.prob - a.prob)[0];

    mainPick = {
      marketLabel: '1X2',
      optionName: best1x2.name,
      probability: r1(best1x2.prob),
      odds: probToOdds(best1x2.prob),
      label: `Mac Sonucu - ${best1x2.label}`,
      confidence: Math.round(best1x2.prob * 100),
      description_tr: `${best1x2.label} kazanma ihtimali %${Math.round(best1x2.prob * 100)}.`,
      description_en: `${best1x2.label} has a ${Math.round(best1x2.prob * 100)}% chance of winning.`,
    };
  }

  // --- Categories ---
  const categories: MarketCategory[] = [
    { id: 'matchResult', icon: 'trophy', markets: [matchResult, doubleChance, firstHalf] },
    { id: 'goals', icon: 'goal', markets: [overUnder15, overUnder25, overUnder35, btts] },
    { id: 'corners', icon: 'corner', markets: [corners85, corners95, corners105] },
    { id: 'cards', icon: 'card', markets: [cards25, cards35, cards45] },
  ];

  // --- Analysis ---
  const analysis_tr = buildAnalysisTR(match, homeXG, awayXG, homeForm, awayForm, homeWinP, drawP, awayWinP, over25, bttsYes, totalCornerXG, totalCardXG, homeAttack, homeDefense, awayAttack, awayDefense);
  const analysis_en = buildAnalysisEN(match, homeXG, awayXG, homeForm, awayForm, homeWinP, drawP, awayWinP, over25, bttsYes, totalCornerXG, totalCardXG, homeAttack, homeDefense, awayAttack, awayDefense);

  return {
    mainPrediction: mainPick,
    categories,
    scorePredictions: scoreProbs.slice(0, 6),
    analysis_tr,
    analysis_en,
  };
}

function r1(val: number): number {
  return Math.round(val * 1000) / 10;
}

// --- Analysis generators ---

function buildAnalysisTR(
  match: Match, homeXG: number, awayXG: number,
  homeForm: number, awayForm: number,
  homeWin: number, draw: number, awayWin: number,
  over25: number, btts: number,
  cornerXG: number, cardXG: number,
  homeAtt: number, homeDef: number, awayAtt: number, awayDef: number,
): string {
  const h = match.homeTeam;
  const a = match.awayTeam;
  const lines: string[] = [];

  lines.push(`--- ${h.name} vs ${a.name} ---`);
  lines.push('');

  // Strength ratings
  lines.push(`TAKIM GUCU ANALIZI`);
  lines.push(`${h.name}: Atak gucu ${(homeAtt * 100).toFixed(0)}% | Defans ${(homeDef * 100).toFixed(0)}%`);
  lines.push(`${a.name}: Atak gucu ${(awayAtt * 100).toFixed(0)}% | Defans ${(awayDef * 100).toFixed(0)}%`);
  lines.push('');

  // Form
  const hWins = h.form.filter(f => f === 'W').length;
  const aWins = a.form.filter(f => f === 'W').length;
  lines.push(`SON FORM`);
  lines.push(`${h.name}: ${h.form.join('-')} (${hWins}G ${h.form.filter(f => f === 'D').length}B ${h.form.filter(f => f === 'L').length}M) | Form puani: %${Math.round(homeForm * 100)}`);
  lines.push(`${a.name}: ${a.form.join('-')} (${aWins}G ${a.form.filter(f => f === 'D').length}B ${a.form.filter(f => f === 'L').length}M) | Form puani: %${Math.round(awayForm * 100)}`);
  lines.push('');

  // xG
  lines.push(`BEKLENEN GOL (xG)`);
  lines.push(`${h.name}: ${homeXG.toFixed(2)} xG | ${a.name}: ${awayXG.toFixed(2)} xG`);
  lines.push(`Toplam beklenen gol: ${(homeXG + awayXG).toFixed(2)}`);
  lines.push('');

  // H2H
  lines.push(`KARSILASMA GECMISI (${match.h2h.totalMatches} mac)`);
  lines.push(`${h.name}: ${match.h2h.homeWins} galibiyet | Beraberlik: ${match.h2h.draws} | ${a.name}: ${match.h2h.awayWins} galibiyet`);
  lines.push(`Ortalama gol: ${match.h2h.avgGoals}`);
  lines.push('');

  // Key stats
  // Goal averages
  lines.push(`GOL ORTALAMALARI`);
  lines.push(`${h.name}: Mac basi ${h.avgGoalsScored.toFixed(2)} gol atiyor, ${h.avgGoalsConceded.toFixed(2)} gol yiyor`);
  lines.push(`${a.name}: Mac basi ${a.avgGoalsScored.toFixed(2)} gol atiyor, ${a.avgGoalsConceded.toFixed(2)} gol yiyor`);
  const totalAvgGoals = h.avgGoalsScored + a.avgGoalsScored;
  lines.push(`Iki takimin toplam gol ortalamasi: ${totalAvgGoals.toFixed(2)} (mac basi)`);
  lines.push(`Sezon toplam: ${h.name} ${h.goalsScored}A-${h.goalsConceded}Y | ${a.name} ${a.goalsScored}A-${a.goalsConceded}Y`);
  lines.push('');

  lines.push(`ONEMLI GOSTERGELER`);
  lines.push(`2.5 Ust Gol: %${Math.round(over25 * 100)} | KG Var: %${Math.round(btts * 100)}`);
  lines.push(`Beklenen korner: ${cornerXG.toFixed(1)} | Beklenen kart: ${cardXG.toFixed(1)}`);
  lines.push('');

  // Verdict
  lines.push(`SONUC`);
  if (homeWin > 0.50) {
    lines.push(`${h.name} bu macta acik favoridir. Ev sahibi avantaji ve istatistiksel ustunluk galibiyeti destekliyor.`);
  } else if (awayWin > 0.45) {
    lines.push(`${a.name} deplasmanda guclu bir aday. Takim kalitesi ve form durumu deplasman galibiyetine isaret ediyor.`);
  } else if (Math.abs(homeWin - awayWin) < 0.08) {
    lines.push(`Cok dengeli bir karsilasma. Her iki takim da birbirine yakin gucte. Beraberlik ihtimali yuksek.`);
  } else {
    lines.push(`${homeWin > awayWin ? h.name : a.name} hafif favori ancak surpriz sonuc ihtimali de var.`);
  }

  return lines.join('\n');
}

function buildAnalysisEN(
  match: Match, homeXG: number, awayXG: number,
  homeForm: number, awayForm: number,
  homeWin: number, draw: number, awayWin: number,
  over25: number, btts: number,
  cornerXG: number, cardXG: number,
  homeAtt: number, homeDef: number, awayAtt: number, awayDef: number,
): string {
  const h = match.homeTeam;
  const a = match.awayTeam;
  const lines: string[] = [];

  lines.push(`--- ${h.name} vs ${a.name} ---`);
  lines.push('');

  lines.push(`TEAM STRENGTH ANALYSIS`);
  lines.push(`${h.name}: Attack ${(homeAtt * 100).toFixed(0)}% | Defense ${(homeDef * 100).toFixed(0)}%`);
  lines.push(`${a.name}: Attack ${(awayAtt * 100).toFixed(0)}% | Defense ${(awayDef * 100).toFixed(0)}%`);
  lines.push('');

  const hWins = h.form.filter(f => f === 'W').length;
  const aWins = a.form.filter(f => f === 'W').length;
  lines.push(`RECENT FORM`);
  lines.push(`${h.name}: ${h.form.join('-')} (${hWins}W ${h.form.filter(f => f === 'D').length}D ${h.form.filter(f => f === 'L').length}L) | Rating: ${Math.round(homeForm * 100)}%`);
  lines.push(`${a.name}: ${a.form.join('-')} (${aWins}W ${a.form.filter(f => f === 'D').length}D ${a.form.filter(f => f === 'L').length}L) | Rating: ${Math.round(awayForm * 100)}%`);
  lines.push('');

  lines.push(`EXPECTED GOALS (xG)`);
  lines.push(`${h.name}: ${homeXG.toFixed(2)} xG | ${a.name}: ${awayXG.toFixed(2)} xG`);
  lines.push(`Total expected goals: ${(homeXG + awayXG).toFixed(2)}`);
  lines.push('');

  lines.push(`HEAD-TO-HEAD (${match.h2h.totalMatches} matches)`);
  lines.push(`${h.name}: ${match.h2h.homeWins} wins | Draws: ${match.h2h.draws} | ${a.name}: ${match.h2h.awayWins} wins`);
  lines.push(`Average goals: ${match.h2h.avgGoals}`);
  lines.push('');

  // Goal averages
  lines.push(`GOAL AVERAGES`);
  lines.push(`${h.name}: Scores ${h.avgGoalsScored.toFixed(2)} per game, concedes ${h.avgGoalsConceded.toFixed(2)} per game`);
  lines.push(`${a.name}: Scores ${a.avgGoalsScored.toFixed(2)} per game, concedes ${a.avgGoalsConceded.toFixed(2)} per game`);
  const totalAvgGoalsEN = h.avgGoalsScored + a.avgGoalsScored;
  lines.push(`Combined goal average: ${totalAvgGoalsEN.toFixed(2)} goals per match`);
  lines.push(`Season totals: ${h.name} ${h.goalsScored}F-${h.goalsConceded}A | ${a.name} ${a.goalsScored}F-${a.goalsConceded}A`);
  lines.push('');

  lines.push(`KEY INDICATORS`);
  lines.push(`Over 2.5 Goals: ${Math.round(over25 * 100)}% | BTTS: ${Math.round(btts * 100)}%`);
  lines.push(`Expected corners: ${cornerXG.toFixed(1)} | Expected cards: ${cardXG.toFixed(1)}`);
  lines.push('');

  lines.push(`VERDICT`);
  if (homeWin > 0.50) {
    lines.push(`${h.name} are clear favorites. Home advantage and statistical superiority support a home win.`);
  } else if (awayWin > 0.45) {
    lines.push(`${a.name} are strong contenders away. Team quality and form point to an away victory.`);
  } else if (Math.abs(homeWin - awayWin) < 0.08) {
    lines.push(`Very balanced encounter. Both teams are evenly matched. Draw probability is elevated.`);
  } else {
    lines.push(`${homeWin > awayWin ? h.name : a.name} are slight favorites but an upset is possible.`);
  }

  return lines.join('\n');
}
