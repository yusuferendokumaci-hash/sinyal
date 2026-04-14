// Prediction history tracking via localStorage

export interface PredictionRecord {
  id: string;
  date: string;
  matchLabel: string;
  marketLabel: string;
  optionName: string;
  probability: number;
  odds: number;
  result?: 'won' | 'lost' | 'pending';
}

const STORAGE_KEY = 'sinyal-prediction-history';

export function getHistory(): PredictionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRecord(record: PredictionRecord) {
  const history = getHistory();
  // Avoid duplicates
  if (history.some(h => h.id === record.id)) return;
  history.unshift(record);
  // Keep last 100
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
}

export function updateResult(id: string, result: 'won' | 'lost') {
  const history = getHistory();
  const idx = history.findIndex(h => h.id === id);
  if (idx >= 0) {
    history[idx].result = result;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export function getStats() {
  const history = getHistory().filter(h => h.result && h.result !== 'pending');
  const won = history.filter(h => h.result === 'won').length;
  const total = history.length;
  return {
    total,
    won,
    lost: total - won,
    winRate: total > 0 ? Math.round((won / total) * 100) : 0,
  };
}
