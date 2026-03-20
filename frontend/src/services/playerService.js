import { api } from './api.js';
import { browseFiltersToQueryParams } from '@/utils/playerBrowseFilters';

function playerPathSegment(id) {
  const n = Number(id);
  return Number.isFinite(n) ? String(n) : encodeURIComponent(String(id));
}

const PLAYERS_LIST_LIMIT = 25;

function playersListQuery(params = {}) {
  const search = new URLSearchParams();
  const page = params.page != null ? Number(params.page) : 1;
  const limit = params.limit != null ? Number(params.limit) : PLAYERS_LIST_LIMIT;
  if (Number.isFinite(page) && page > 0) search.set('page', String(Math.floor(page)));
  if (Number.isFinite(limit) && limit > 0) search.set('limit', String(Math.floor(limit)));
  const filters = browseFiltersToQueryParams(params);
  for (const [k, v] of Object.entries(filters)) {
    search.set(k, v);
  }
  const q = search.toString();
  return q ? `?${q}` : '';
}

/** Authenticated GET `/players` — paginated list with full nested player objects. */
export function fetchPlayers(params = {}) {
  return api.get(`/players${playersListQuery(params)}`);
}

function searchPlayersQuery(params = {}) {
  const search = new URLSearchParams();
  const term = String(params.q ?? params.query ?? '').trim();
  if (!term) return '';
  search.set('query', term);
  const page = params.page != null ? Number(params.page) : 1;
  const limit = params.limit != null ? Number(params.limit) : PLAYERS_LIST_LIMIT;
  if (Number.isFinite(page) && page > 0) search.set('page', String(Math.floor(page)));
  if (Number.isFinite(limit) && limit > 0) search.set('limit', String(Math.floor(limit)));
  const q = search.toString();
  return q ? `?${q}` : '';
}

/** Authenticated GET `/players/search` — `query` (or `q`) matches across player columns (ILIKE OR). */
export function searchPlayers(params = {}) {
  return api.get(`/players/search${searchPlayersQuery(params)}`);
}

/** Authenticated GET `/players/:id` — full player with stats, attributes, contract. */
export function fetchPlayerById(id) {
  return api.get(`/players/${playerPathSegment(id)}`);
}

/** Authenticated GET `/players/:id/reports` — `{ reports: [...] }` scout reports. */
export function fetchPlayerReports(id) {
  return api.get(`/players/${playerPathSegment(id)}/reports`);
}

/** Authenticated PUT `/players/:id/reports/:reportId` — partial/full scout report update. */
export function updatePlayerReport(playerId, reportId, body) {
  return api.put(
    `/players/${playerPathSegment(playerId)}/reports/${playerPathSegment(reportId)}`,
    body
  );
}

/** Authenticated POST `/players/:id/reports` — create scout report. */
export function createPlayerReport(playerId, body) {
  return api.post(`/players/${playerPathSegment(playerId)}/reports`, body);
}

/** Authenticated PUT `/players/:id` — player body may include stats, attributes, contract. */
export function updatePlayer(id, body) {
  return api.put(`/players/${playerPathSegment(id)}`, body);
}

/** Authenticated DELETE `/players/:id` — responds 204 with no body. */
export function deletePlayer(id) {
  return api.delete(`/players/${playerPathSegment(id)}`);
}

/** Authenticated POST `/players` — create player (body per backend `validatePlayerCreate`). */
export function createPlayer(body) {
  return api.post('/players', body);
}

/** Authenticated GET `/players/teams` — `{ teams: string[] }` from DB. */
export function fetchPlayerTeams() {
  return api.get('/players/teams');
}

/** Authenticated GET `/players/positions` — `{ positions: string[] }` from DB. */
export function fetchPlayerPositions() {
  return api.get('/players/positions');
}
