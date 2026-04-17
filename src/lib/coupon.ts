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

// --- BANKO KUPON: Max 2 mac, yuksek olasilik + iyi oran
// Eger tek macta 2.0+ oran bulunursa tek mac, yoksa 2 mac birlestir
export function generateBankoPick(matches: Match[]): CouponSelection[] {
  const MAX_PICKS = 2;
  const MIN_TOTAL_ODDS = 2.0;
  const MIN_PROB = 65; // %65+ olasilikli
  const MIN_ODDS = 1.30; // Her pick min 1.30

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

  if (candidates.length === 0) return [];

  // Her mactan en iyi pick'i al (ayni maca 2 tahmin yapma)
  const bestPerMatch = new Map<string, typeof candidates[0]>();
  for (const c of candidates) {
    const existing = bestPerMatch.get(c.match.id);
    // Value = prob * odds, en yuksek value'lu pick
    const cValue = c.option.probability * c.odds;
    const eValue = existing ? existing.option.probability * existing.odds : -1;
    if (cValue > eValue) bestPerMatch.set(c.match.id, c);
  }
  const uniqueCandidates = Array.from(bestPerMatch.values());

  // Once: tek macta 2.0+ oranli + yuksek olasilikli var mi?
  // Boylece tekli bahis olarak verilebilir
  const singleHighOdds = uniqueCandidates
    .filter(c => c.odds >= MIN_TOTAL_ODDS && c.option.probability >= MIN_PROB)
    .sort((a, b) => b.option.probability - a.option.probability);

  if (singleHighOdds.length > 0) {
    const pick = singleHighOdds[0];
    return [{
      matchId: pick.match.id,
      matchLabel: `${pick.match.homeTeam.name} vs ${pick.match.awayTeam.name}`,
      marketLabel: pick.market.label,
      optionName: pick.option.name,
      probability: pick.option.probability,
      odds: pick.odds,
    }];
  }

  // Aksi halde 2 mac birlestir (toplam 2.0+ olacak sekilde)
  // En yuksek value'lu 2 farkli macin pick'ini al
  uniqueCandidates.sort((a, b) => {
    // Prob * odds (value) ile sirala
    const aVal = a.option.probability * a.odds;
    const bVal = b.option.probability * b.odds;
    return bVal - aVal;
  });

  const selected: CouponSelection[] = [];
  let totalOdds = 1;

  for (const pick of uniqueCandidates) {
    if (selected.length >= MAX_PICKS) break;
    selected.push({
      matchId: pick.match.id,
      matchLabel: `${pick.match.homeTeam.name} vs ${pick.match.awayTeam.name}`,
      marketLabel: pick.market.label,
      optionName: pick.option.name,
      probability: pick.option.probability,
      odds: pick.odds,
    });
    totalOdds *= pick.odds;
    if (totalOdds >= MIN_TOTAL_ODDS && selected.length >= 2) break;
  }

  return selected;
}

// --- YUKSEK ORAN KUPON: Min 100x toplam oran
// Riskli ama mantikli secimler: skor, HT/FT (1/2, 2/1), riskli MS1/MS2, 1H KG, HT sonuclari
export function generateHighOddsPick(matches: Match[]): CouponSelection[] {
  const MIN_TOTAL_ODDS = 100;
  const MAX_PICKS = 6;
  const MIN_PICK_ODDS = 3.0; // Her pick min 3.0 oran (riskli)
  const MAX_PICK_ODDS = 20.0; // Cok saglam outlier almayalim
  const MIN_PROB = 8; // Skor tahminleri dusuk prob olabilir (%8-15)

  interface Candidate {
    match: Match;
    marketLabel: string;
    optionName: string;
    odds: number;
    prob: number;
    value: number; // prob * odds (edge)
  }

  const candidates: Candidate[] = [];

  for (const match of matches) {
    let pred;
    try { pred = generatePredictions(match); } catch { continue; }

    // 1) Tum normal marketler (HT/FT, 1H BTTS, riskli MS dahil)
    for (const category of pred.categories) {
      for (const market of category.markets) {
        for (const opt of market.options) {
          const odds = opt.bookmakerOdds || probToOdds(opt.probability);
          if (odds >= MIN_PICK_ODDS && odds <= MAX_PICK_ODDS && opt.probability >= MIN_PROB) {
            candidates.push({
              match,
              marketLabel: market.label,
              optionName: opt.name,
              odds,
              prob: opt.probability,
              value: opt.probability * odds / 100, // normalized edge
            });
          }
        }
      }
    }

    // 2) Skor tahminleri (en olasilikli 2 skor)
    for (const sp of pred.scorePredictions.slice(0, 2)) {
      if (sp.probability < MIN_PROB) continue;
      const odds = probToOdds(sp.probability);
      if (odds < MIN_PICK_ODDS || odds > MAX_PICK_ODDS) continue;
      candidates.push({
        match,
        marketLabel: 'score',
        optionName: `${sp.home}-${sp.away}`,
        odds,
        prob: sp.probability,
        value: sp.probability * odds / 100,
      });
    }
  }

  if (candidates.length === 0) return [];

  // Value score ile sirala (en mantikli riskli pick once)
  candidates.sort((a, b) => b.value - a.value);

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
      marketLabel: pick.marketLabel,
      optionName: pick.optionName,
      probability: pick.prob,
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
