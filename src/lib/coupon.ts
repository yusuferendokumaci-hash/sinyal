import { Match } from './mock-data';
import { generatePredictions, MarketPrediction } from './predictions';

export interface CouponSelection {
  matchId: string;
  matchLabel: string;
  marketLabel: string;
  optionName: string;
  probability: number;
  odds: number;
}

export interface Coupon {
  selections: CouponSelection[];
  totalOdds: number;
  totalProbability: number;
}

// Convert probability to decimal odds
export function probToOdds(probability: number): number {
  if (probability <= 0) return 1;
  const raw = 100 / probability;
  // Apply small margin (bookmaker edge ~5%)
  return Math.round(raw * 0.95 * 100) / 100;
}

// Calculate coupon totals
export function calculateCoupon(selections: CouponSelection[]): Coupon {
  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const totalProbability = selections.reduce((acc, s) => acc * (s.probability / 100), 1) * 100;

  return {
    selections,
    totalOdds: Math.round(totalOdds * 100) / 100,
    totalProbability: Math.round(totalProbability * 10) / 10,
  };
}

// Generate AI's daily best picks
// Strategy: 2-3 matches, each pick min 1.40 odds, best value selections
export function generateDailyPick(matches: Match[]): CouponSelection[] {
  const MIN_ODDS = 1.40;
  const MAX_ODDS = 3.50;
  const MAX_PICKS = 3; // 2-3 matches for better total odds

  interface Candidate {
    match: Match;
    market: MarketPrediction;
    option: MarketPrediction['options'][0];
    odds: number;
    value: number; // edge score
  }

  const candidates: Candidate[] = [];

  for (const match of matches) {
    const prediction = generatePredictions(match);

    for (const category of prediction.categories) {
      for (const market of category.markets) {
        for (const opt of market.options) {
          // Use real bookmaker odds if available, otherwise calculated
          const odds = opt.bookmakerOdds || probToOdds(opt.probability);
          // Only picks with meaningful odds (1.40 - 3.50) and decent probability (>45%)
          if (odds >= MIN_ODDS && odds <= MAX_ODDS && opt.probability >= 45) {
            const prob = opt.probability / 100;
            const value = prob * odds;
            candidates.push({ match, market, option: opt, odds, value });
          }
        }
      }
    }
  }

  // Sort by value score (best edge first)
  candidates.sort((a, b) => b.value - a.value);

  const selected: CouponSelection[] = [];
  const usedMatchIds = new Set<string>();

  for (const pick of candidates) {
    if (selected.length >= MAX_PICKS) break;
    // One pick per match
    if (usedMatchIds.has(pick.match.id)) continue;
    usedMatchIds.add(pick.match.id);

    selected.push({
      matchId: pick.match.id,
      matchLabel: `${pick.match.homeTeam.name} vs ${pick.match.awayTeam.name}`,
      marketLabel: pick.market.label,
      optionName: pick.option.name,
      probability: pick.option.probability,
      odds: pick.odds,
    });
  }

  return selected;
}

// --- BANKO KUPON: En yuksek olasilikli maclar (en guvenli), min 2.0 toplam oran
export function generateBankoPick(matches: Match[]): CouponSelection[] {
  const MAX_PICKS = 5;
  const MIN_TOTAL_ODDS = 2.0; // Min 2x toplam oran
  const MIN_PROB = 65; // %65+ olasilikli
  const MIN_ODDS = 1.20; // Her pick min 1.20

  interface Candidate {
    match: Match;
    market: MarketPrediction;
    option: MarketPrediction['options'][0];
    odds: number;
  }

  const candidates: Candidate[] = [];

  for (const match of matches) {
    let pred;
    try { pred = generatePredictions(match); } catch { continue; }

    for (const category of pred.categories) {
      for (const market of category.markets) {
        for (const opt of market.options) {
          const odds = opt.bookmakerOdds || probToOdds(opt.probability);
          if (odds >= MIN_ODDS && opt.probability >= MIN_PROB) {
            candidates.push({ match, market, option: opt, odds });
          }
        }
      }
    }
  }

  // En yuksek olasilik once
  candidates.sort((a, b) => b.option.probability - a.option.probability);

  const selected: CouponSelection[] = [];
  const usedMatchIds = new Set<string>();
  let totalOdds = 1;

  for (const pick of candidates) {
    if (selected.length >= MAX_PICKS) break;
    if (usedMatchIds.has(pick.match.id)) continue;

    // En az 2 pick ve min 2.0 toplam oran olunca dur
    if (selected.length >= 2 && totalOdds >= MIN_TOTAL_ODDS) break;

    usedMatchIds.add(pick.match.id);
    selected.push({
      matchId: pick.match.id,
      matchLabel: `${pick.match.homeTeam.name} vs ${pick.match.awayTeam.name}`,
      marketLabel: pick.market.label,
      optionName: pick.option.name,
      probability: pick.option.probability,
      odds: pick.odds,
    });
    totalOdds *= pick.odds;
  }

  return selected;
}

// --- YUKSEK ORAN KUPON: Min 100x toplam oran
export function generateHighOddsPick(matches: Match[]): CouponSelection[] {
  const MIN_TOTAL_ODDS = 100;
  const MAX_PICKS = 6;
  const MIN_PICK_ODDS = 2.5; // Her pick min 2.5 oran (riskli ama deger)
  const MIN_PROB = 25; // Cok dusuk prob almayalim, elense de tutma ihtimali olsun

  interface Candidate {
    match: Match;
    market: MarketPrediction;
    option: MarketPrediction['options'][0];
    odds: number;
    prob: number;
  }

  const candidates: Candidate[] = [];

  for (const match of matches) {
    let pred;
    try { pred = generatePredictions(match); } catch { continue; }

    for (const category of pred.categories) {
      for (const market of category.markets) {
        for (const opt of market.options) {
          const odds = opt.bookmakerOdds || probToOdds(opt.probability);
          if (odds >= MIN_PICK_ODDS && opt.probability >= MIN_PROB) {
            candidates.push({ match, market, option: opt, odds, prob: opt.probability });
          }
        }
      }
    }
  }

  // Value score ile sirala (prob * odds)
  candidates.sort((a, b) => (b.prob * b.odds) - (a.prob * a.odds));

  const selected: CouponSelection[] = [];
  const usedMatchIds = new Set<string>();
  let totalOdds = 1;

  for (const pick of candidates) {
    if (selected.length >= MAX_PICKS) break;
    if (usedMatchIds.has(pick.match.id)) continue;
    usedMatchIds.add(pick.match.id);

    selected.push({
      matchId: pick.match.id,
      matchLabel: `${pick.match.homeTeam.name} vs ${pick.match.awayTeam.name}`,
      marketLabel: pick.market.label,
      optionName: pick.option.name,
      probability: pick.option.probability,
      odds: pick.odds,
    });

    totalOdds *= pick.odds;
    // 100x asinca dur (min 2 pick)
    if (totalOdds >= MIN_TOTAL_ODDS && selected.length >= 2) break;
  }

  return selected;
}

// --- SKOR DENEMESI: En olasilikli skor tahminleri, max 2 mac
export function generateScorePick(matches: Match[]): CouponSelection[] {
  const MAX_PICKS = 2;

  interface ScoreCandidate {
    match: Match;
    home: number;
    away: number;
    probability: number;
    odds: number;
  }

  const candidates: ScoreCandidate[] = [];

  for (const match of matches) {
    let pred;
    try { pred = generatePredictions(match); } catch { continue; }

    // Take the TOP score prediction for each match
    const topScore = pred.scorePredictions[0];
    if (!topScore) continue;

    // Score prediction olasiligi dusuk, bu yuzden cok olasilikli olanlari almali
    if (topScore.probability < 8) continue;

    const odds = probToOdds(topScore.probability);
    candidates.push({
      match,
      home: topScore.home,
      away: topScore.away,
      probability: topScore.probability,
      odds,
    });
  }

  // En yuksek olasilikli skorlar once
  candidates.sort((a, b) => b.probability - a.probability);

  const selected: CouponSelection[] = [];
  const usedMatchIds = new Set<string>();

  for (const pick of candidates) {
    if (selected.length >= MAX_PICKS) break;
    if (usedMatchIds.has(pick.match.id)) continue;
    usedMatchIds.add(pick.match.id);

    selected.push({
      matchId: pick.match.id,
      matchLabel: `${pick.match.homeTeam.name} vs ${pick.match.awayTeam.name}`,
      marketLabel: 'score',
      optionName: `${pick.home}-${pick.away}`,
      probability: pick.probability,
      odds: pick.odds,
    });
  }

  return selected;
}
