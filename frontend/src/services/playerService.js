import { api } from './api.js';

/** Authenticated GET `/players/:id` — full player with stats, attributes, contract. */
export function fetchPlayerById(id) {
  const n = Number(id);
  const segment = Number.isFinite(n) ? String(n) : encodeURIComponent(String(id));
  return api.get(`/players/${segment}`);
}
