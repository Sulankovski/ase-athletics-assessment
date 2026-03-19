import { api } from './api.js';

function playerPathSegment(id) {
  const n = Number(id);
  return Number.isFinite(n) ? String(n) : encodeURIComponent(String(id));
}

/** Authenticated GET `/players/:id` — full player with stats, attributes, contract. */
export function fetchPlayerById(id) {
  return api.get(`/players/${playerPathSegment(id)}`);
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
