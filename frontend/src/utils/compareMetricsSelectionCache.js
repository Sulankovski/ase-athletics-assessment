import {
  ALL_COMPARE_ATTR_KEYS,
  ALL_COMPARE_STAT_KEYS,
  COMPARE_DEFAULT_ATTR_KEYS,
  COMPARE_DEFAULT_STAT_KEYS,
} from '@/constants/compareMetrics';

/** @type {{ stats: string[], attrs: string[] } | null} */
let cached = null;

function sanitizeStats(keys) {
  if (!Array.isArray(keys)) return [...COMPARE_DEFAULT_STAT_KEYS];
  const allowed = new Set(ALL_COMPARE_STAT_KEYS);
  const picked = keys.filter((k) => typeof k === 'string' && allowed.has(k));
  if (picked.length === 0) return keys.length === 0 ? [] : [...COMPARE_DEFAULT_STAT_KEYS];
  return ALL_COMPARE_STAT_KEYS.filter((k) => picked.includes(k));
}

function sanitizeAttrs(keys) {
  if (!Array.isArray(keys)) return [...COMPARE_DEFAULT_ATTR_KEYS];
  const allowed = new Set(ALL_COMPARE_ATTR_KEYS);
  const picked = keys.filter((k) => typeof k === 'string' && allowed.has(k));
  if (picked.length === 0) return keys.length === 0 ? [] : [...COMPARE_DEFAULT_ATTR_KEYS];
  return ALL_COMPARE_ATTR_KEYS.filter((k) => picked.includes(k));
}

/** @returns {{ stats: string[], attrs: string[] } | null} */
export function readCompareMetricsSelection() {
  if (!cached) return null;
  return {
    stats: sanitizeStats(cached.stats),
    attrs: sanitizeAttrs(cached.attrs),
  };
}

export function writeCompareMetricsSelection(stats, attrs) {
  cached = {
    stats: sanitizeStats(stats),
    attrs: sanitizeAttrs(attrs),
  };
}

export function clearCompareMetricsSelection() {
  cached = null;
}
