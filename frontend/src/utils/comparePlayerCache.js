/**
 * Full player payloads for /compare, keyed by id. Evicted when a player leaves the compare list.
 * In-flight requests are deduped; loads started before eviction do not repopulate the cache.
 */
import { fetchPlayerById } from '@/services/playerService';

function normId(id) {
  return String(id);
}

/** @type {Map<string, object>} */
const cache = new Map();
/** @type {Map<string, number>} bump on evict so late responses skip cache write */
const generation = new Map();
/** @type {Map<string, Promise<object>>} */
const inflight = new Map();

/** API player object or null */
export function getCachedComparePlayer(id) {
  if (id == null) return null;
  return cache.get(normId(id)) ?? null;
}

export function evictComparePlayer(id) {
  if (id == null) return;
  const k = normId(id);
  cache.delete(k);
  generation.set(k, (generation.get(k) ?? 0) + 1);
}

/**
 * Resolves full player: cache hit returns immediately; otherwise fetches once (shared per id).
 */
export function loadComparePlayerForCompare(id) {
  if (id == null) {
    return Promise.reject(new Error('Missing player id'));
  }
  const k = normId(id);
  const hit = cache.get(k);
  if (hit) return Promise.resolve(hit);

  const pending = inflight.get(k);
  if (pending) return pending;

  const genAtStart = generation.get(k) ?? 0;
  const p = fetchPlayerById(id)
    .then((player) => {
      inflight.delete(k);
      if ((generation.get(k) ?? 0) !== genAtStart) {
        return player;
      }
      cache.set(k, player);
      return player;
    })
    .catch((err) => {
      inflight.delete(k);
      throw err;
    });

  inflight.set(k, p);
  return p;
}
