/**
 * Session-only filter prefs for Dashboard KPIs and Players browse (in-memory).
 * Cleared on full page refresh. Call clear* from filter "Clear" actions as well.
 */
import {
  EMPTY_PLAYER_BROWSE_FILTERS,
  PLAYER_LIST_FILTER_KEYS,
} from '@/constants/playerSearchFilters';
import {
  browseFiltersEffectivelyEqual,
  browseFiltersToQueryParams,
} from '@/utils/playerBrowseFilters';

// ——— Players (browse) ———

/** @type {Record<string, string>|null} */
let playersBrowseCached = null;

export function readPlayersBrowseFiltersCache() {
  if (!playersBrowseCached) return null;
  const o = { ...EMPTY_PLAYER_BROWSE_FILTERS };
  for (const k of PLAYER_LIST_FILTER_KEYS) {
    const v = playersBrowseCached[k];
    if (v != null && String(v).trim() !== '') o[k] = String(v).trim();
  }
  if (browseFiltersEffectivelyEqual(o, EMPTY_PLAYER_BROWSE_FILTERS)) return null;
  return o;
}

export function writePlayersBrowseFiltersCache(filters) {
  const merged = { ...EMPTY_PLAYER_BROWSE_FILTERS, ...(filters ?? {}) };
  if (browseFiltersEffectivelyEqual(merged, EMPTY_PLAYER_BROWSE_FILTERS)) {
    playersBrowseCached = null;
    return;
  }
  playersBrowseCached = {};
  const qp = browseFiltersToQueryParams(merged);
  for (const [k, v] of Object.entries(qp)) {
    playersBrowseCached[k] = v;
  }
}

export function clearPlayersBrowseFiltersCache() {
  playersBrowseCached = null;
}

// ——— Dashboard (KPI) ———

export const EMPTY_DASHBOARD_FILTERS = { team: '', age_min: '', age_max: '' };

/** @param {typeof EMPTY_DASHBOARD_FILTERS} f */
export function dashboardFiltersToQueryParams(f) {
  const p = {};
  if (f.team?.trim()) p.team = f.team.trim();
  if (f.age_min !== '' && f.age_min != null) {
    const n = Number(f.age_min);
    if (!Number.isNaN(n)) p.age_min = n;
  }
  if (f.age_max !== '' && f.age_max != null) {
    const n = Number(f.age_max);
    if (!Number.isNaN(n)) p.age_max = n;
  }
  return p;
}

export function dashboardFiltersEffectivelyEqual(a, b) {
  const pa = dashboardFiltersToQueryParams(a ?? EMPTY_DASHBOARD_FILTERS);
  const pb = dashboardFiltersToQueryParams(b ?? EMPTY_DASHBOARD_FILTERS);
  const keys = new Set([...Object.keys(pa), ...Object.keys(pb)]);
  for (const k of keys) {
    if (pa[k] !== pb[k]) return false;
  }
  return true;
}

/** @type {typeof EMPTY_DASHBOARD_FILTERS | null} */
let dashboardCached = null;

export function readDashboardFiltersCache() {
  if (!dashboardCached) return null;
  return {
    team: dashboardCached.team ?? '',
    age_min: dashboardCached.age_min ?? '',
    age_max: dashboardCached.age_max ?? '',
  };
}

export function writeDashboardFiltersCache(f) {
  const next = {
    team: f.team != null ? String(f.team) : '',
    age_min: f.age_min !== '' && f.age_min != null ? String(f.age_min) : '',
    age_max: f.age_max !== '' && f.age_max != null ? String(f.age_max) : '',
  };
  if (dashboardFiltersEffectivelyEqual(next, EMPTY_DASHBOARD_FILTERS)) {
    dashboardCached = null;
    return;
  }
  dashboardCached = next;
}

export function clearDashboardFiltersCache() {
  dashboardCached = null;
}
