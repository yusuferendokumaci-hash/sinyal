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
      matchLabel: `${pick.match.homeTeam.shortName} vs ${pick.match.awayTeam.shortName}`,
      marketLabel: pick.market.label,
      optionName: pick.option.name,
      probability: pick.option.probability,
      odds: pick.odds,
    });
  }

  return selected;
}
