import { useEffect, useState, useSyncExternalStore } from 'react';
import { fetchPlayerPositions, fetchPlayerTeams } from '@/services/playerService';

let cacheVersion = 0;
let resolvedData = null;
/** @type {Promise<{ teams: string[], positions: string[] }> | null} */
let loadPromise = null;

const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getCacheVersionSnapshot() {
  return cacheVersion;
}

function notifyInvalidate() {
  listeners.forEach((l) => l());
}

function ensureLoaded() {
  if (resolvedData) return Promise.resolve(resolvedData);
  if (!loadPromise) {
    loadPromise = Promise.all([fetchPlayerTeams(), fetchPlayerPositions()])
      .then(([t, p]) => {
        resolvedData = {
          teams: Array.isArray(t?.teams) ? t.teams : [],
          positions: Array.isArray(p?.positions) ? p.positions : [],
        };
        loadPromise = null;
        return resolvedData;
      })
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

/** Call after creating a player so new teams/positions appear in dropdowns. */
export function invalidatePlayerLookupOptions() {
  resolvedData = null;
  loadPromise = null;
  cacheVersion += 1;
  notifyInvalidate();
}

/**
 * Shared teams + positions from GET `/players/teams` and `/players/positions`.
 * One in-flight fetch for the whole app; refetches when `invalidatePlayerLookupOptions` runs.
 */
export function usePlayerLookupOptions() {
  const version = useSyncExternalStore(subscribe, getCacheVersionSnapshot, getCacheVersionSnapshot);
  const [state, setState] = useState(() => ({
    loading: !resolvedData,
    teams: resolvedData?.teams ?? [],
    positions: resolvedData?.positions ?? [],
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;

    if (resolvedData) {
      setState({
        loading: false,
        teams: resolvedData.teams,
        positions: resolvedData.positions,
        error: null,
      });
      return undefined;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    ensureLoaded()
      .then((data) => {
        if (!cancelled) {
          setState({ loading: false, teams: data.teams, positions: data.positions, error: null });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setState({
            loading: false,
            teams: [],
            positions: [],
            error: e?.message ?? 'Could not load options',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [version]);

  return state;
}
