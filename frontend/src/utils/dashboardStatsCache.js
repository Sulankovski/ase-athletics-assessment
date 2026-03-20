/** Time-to-live for cached `/dashboard/stats` payloads (in-memory only). */
export const DASHBOARD_STATS_CACHE_TTL_MS = 1 * 60 * 60 * 1000;

/** @type {Map<string, { savedAt: number, payload: object }>} */
const cache = new Map();

/**
 * Stable key for the params object passed to `fetchDashboardStats`
 * (same shape as `toQueryParams` on the dashboard).
 */
export function dashboardStatsCacheKey(params) {
  const entries = Object.entries(params ?? {})
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => [k, typeof v === 'number' ? v : String(v)])
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

/** @returns {object|null} API payload if fresh, otherwise null */
export function readDashboardStatsCache(params) {
  const key = dashboardStatsCacheKey(params);
  const entry = cache.get(key);
  if (!entry) return null;
  const { savedAt, payload } = entry;
  if (typeof savedAt !== 'number' || payload == null) {
    cache.delete(key);
    return null;
  }
  if (Date.now() - savedAt > DASHBOARD_STATS_CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return payload;
}

export function writeDashboardStatsCache(params, payload) {
  cache.set(dashboardStatsCacheKey(params), { savedAt: Date.now(), payload });
}
