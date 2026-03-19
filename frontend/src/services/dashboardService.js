import { api } from './api.js';

function buildStatsQueryString(params = {}) {
  const qs = new URLSearchParams();
  if (params.team != null && String(params.team).trim() !== '') {
    qs.set('team', String(params.team).trim());
  }
  if (params.age_min != null && params.age_min !== '') {
    const n = Number(params.age_min);
    if (!Number.isNaN(n)) qs.set('age_min', String(n));
  }
  if (params.age_max != null && params.age_max !== '') {
    const n = Number(params.age_max);
    if (!Number.isNaN(n)) qs.set('age_max', String(n));
  }
  const q = qs.toString();
  return q ? `?${q}` : '';
}

/** Fetches authenticated `/dashboard/stats` with optional team, age_min, age_max. */
export function fetchDashboardStats(params = {}) {
  return api.get(`/dashboard/stats${buildStatsQueryString(params)}`);
}
