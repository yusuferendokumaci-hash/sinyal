const STORAGE_KEY = 'sinyal-favorites';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(matchId: string): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(matchId);
  if (idx >= 0) {
    favs.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    return false;
  } else {
    favs.push(matchId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    return true;
  }
}

export function isFavorite(matchId: string): boolean {
  return getFavorites().includes(matchId);
}
