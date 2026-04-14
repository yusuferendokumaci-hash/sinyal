// In-memory server-side cache to avoid hitting API rate limits
// Caches responses for configurable TTL (default 30 min)

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache(key: string, data: unknown, ttlMs: number = 30 * 60 * 1000) {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

export function clearCache() {
  cache.clear();
}

// TTL presets
export const CACHE_TTL = {
  MATCHES: 5 * 60 * 1000,      // 5 min - matches change status
  ODDS: 10 * 60 * 1000,        // 10 min - odds update periodically
  STANDINGS: 60 * 60 * 1000,   // 1 hour - standings change rarely during day
  SCORERS: 60 * 60 * 1000,     // 1 hour
  LIVE: 30 * 1000,             // 30 sec - live scores
  TEAM_STATS: 6 * 60 * 60 * 1000, // 6 hours - team stats barely change
};
