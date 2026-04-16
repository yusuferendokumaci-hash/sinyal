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

// TTL presets - aggressive caching to save API quota (100/day free plan)
export const CACHE_TTL = {
  MATCHES: 30 * 60 * 1000,     // 30 min
  ODDS: 60 * 60 * 1000,        // 1 hour
  STANDINGS: 12 * 60 * 60 * 1000, // 12 hours
  SCORERS: 12 * 60 * 60 * 1000,   // 12 hours
  LIVE: 2 * 60 * 1000,         // 2 min
  TEAM_STATS: 24 * 60 * 60 * 1000, // 24 hours
};
