import {
  EMPTY_PLAYER_BROWSE_FILTERS,
  PLAYER_FILTER_LABELS,
  PLAYER_LIST_FILTER_KEYS,
} from '@/constants/playerSearchFilters';

/** Non-empty filter fields → API query object for GET /players */
export function browseFiltersToQueryParams(values) {
  const p = {};
  for (const key of PLAYER_LIST_FILTER_KEYS) {
    const v = values?.[key];
    if (v != null && String(v).trim() !== '') {
      p[key] = String(v).trim();
    }
  }
  return p;
}

export function browseFiltersEffectivelyEqual(a, b) {
  const pa = browseFiltersToQueryParams(a ?? {});
  const pb = browseFiltersToQueryParams(b ?? {});
  const keys = new Set([...Object.keys(pa), ...Object.keys(pb)]);
  for (const k of keys) {
    if (pa[k] !== pb[k]) return false;
  }
  return true;
}

/** Build URLSearchParams for players list: page + filter keys */
export function browseFiltersToSearchParams(filters, page = 1) {
  const sp = new URLSearchParams();
  if (page > 1) sp.set('page', String(page));
  const qp = browseFiltersToQueryParams(filters);
  for (const [k, v] of Object.entries(qp)) {
    sp.set(k, v);
  }
  return sp;
}

/**
 * Same as browse filters URL plus optional full-text `q` (consumed by GET /players/search).
 * Keeps browse filters and header search in sync in the address bar.
 */
export function playersListUrlSearchParams(filters, page = 1, textQuery = '') {
  const sp = browseFiltersToSearchParams(filters, page);
  const v = String(textQuery ?? '').trim();
  if (v) sp.set('q', v);
  else sp.delete('q');
  return sp;
}

/** Read filter fields from current URL search params */
export function browseFiltersFromSearchParams(searchParams) {
  const o = { ...EMPTY_PLAYER_BROWSE_FILTERS };
  for (const key of PLAYER_LIST_FILTER_KEYS) {
    const v = searchParams.get(key);
    if (v != null && v !== '') o[key] = v;
  }
  return o;
}

/** Human-readable active filter summary lines */
export function formatBrowseAppliedSummary(filters) {
  const qp = browseFiltersToQueryParams(filters);
  return Object.entries(qp).map(([k, v]) => `${PLAYER_FILTER_LABELS[k] || k} ≈ ${v}`);
}
