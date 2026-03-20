import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2, Menu } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { registerDashboardCharts } from '@/components/dashboard/registerCharts';
import DashboardView from '@/components/dashboard/DashboardView';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import PlayerEditAddPanel from '@/components/player/PlayerEditAddPanel';
import { fetchDashboardStats } from '@/services/dashboardService';
import { createPlayer } from '@/services/playerService';
import {
  buildPlayerCreatePayload,
  cloneEmptyPlayerForCreate,
  isPlayerCreateDraftValid,
} from '@/utils/playerEdit';
import { PLAYER_NAV_FROM_DASHBOARD } from '@/constants/navigation';
import {
  readDashboardStatsCache,
  writeDashboardStatsCache,
} from '@/utils/dashboardStatsCache';

registerDashboardCharts();

const emptyFilters = { team: '', age_min: '', age_max: '' };

function toQueryParams(f) {
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

/** Same effective API params → treat as no change (Apply disabled). */
function filtersEffectivelyEqual(a, b) {
  const pa = toQueryParams(a);
  const pb = toQueryParams(b);
  const keys = new Set([...Object.keys(pa), ...Object.keys(pb)]);
  for (const k of keys) {
    if (pa[k] !== pb[k]) return false;
  }
  return true;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterForm, setFilterForm] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [teamOptions, setTeamOptions] = useState([]);
  const [statsRefreshNonce, setStatsRefreshNonce] = useState(0);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [dashActionsOpen, setDashActionsOpen] = useState(false);
  const dashActionsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const params = toQueryParams(appliedFilters);

    const applyPayload = (payload) => {
      if (cancelled) return;
      setData(payload);
      const af = payload?.applied_filters ?? {};
      const narrowedByTeam = af.team != null && String(af.team).trim() !== '';
      if (!narrowedByTeam && payload?.distributions?.by_team?.length) {
        setTeamOptions(
          [...payload.distributions.by_team]
            .map((r) => r.team)
            .sort((a, b) => a.localeCompare(b)),
        );
      }
    };

    // Fresh network when user explicitly refreshed (e.g. after creating a player).
    if (statsRefreshNonce === 0) {
      const cached = readDashboardStatsCache(params);
      if (cached) {
        setError(null);
        applyPayload(cached);
        setLoading(false);
        return () => {
          cancelled = true;
        };
      }
    }

    setLoading(true);
    setError(null);

    fetchDashboardStats(params)
      .then((payload) => {
        applyPayload(payload);
        writeDashboardStatsCache(params, payload);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load dashboard stats');
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, statsRefreshNonce]);

  useEffect(() => {
    if (!addPlayerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !createLoading) {
        setAddPlayerOpen(false);
        setCreateDraft(null);
        setCreateError(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addPlayerOpen, createLoading]);

  useEffect(() => {
    if (!dashActionsOpen) return undefined;
    const close = (e) => {
      if (dashActionsRef.current && !dashActionsRef.current.contains(e.target)) {
        setDashActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [dashActionsOpen]);

  useEffect(() => {
    if (loading) setDashActionsOpen(false);
  }, [loading]);

  const openAddPlayer = () => {
    setCreateError(null);
    setCreateDraft(cloneEmptyPlayerForCreate());
    setAddPlayerOpen(true);
  };

  const closeAddPlayer = () => {
    if (createLoading) return;
    setAddPlayerOpen(false);
    setCreateDraft(null);
    setCreateError(null);
  };

  const handleCreatePlayer = async () => {
    if (!createDraft || !isPlayerCreateDraftValid(createDraft)) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const payload = buildPlayerCreatePayload(createDraft);
      const created = await createPlayer(payload);
      setAddPlayerOpen(false);
      setCreateDraft(null);
      setCreateError(null);
      if (created?.id != null) {
        navigate(`/players/${created.id}`, { state: PLAYER_NAV_FROM_DASHBOARD });
      } else {
        setStatsRefreshNonce((n) => n + 1);
      }
    } catch (err) {
      const detail = err?.data?.detail;
      let msg =
        err?.data?.message ||
        err?.message ||
        'Could not create player';
      if (typeof detail === 'string') msg = detail;
      else if (Array.isArray(detail) && detail.length > 0) {
        msg = detail.map((d) => d?.message ?? d).join('; ');
      }
      setCreateError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterForm });
  };

  const handleClearFilters = () => {
    setFilterForm(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const handleRemoveDashboardFilterKey = (key) => {
    const next = { ...appliedFilters, [key]: '' };
    setFilterForm(next);
    setAppliedFilters(next);
  };

  const appliedSummaryDisplay =
    loading && Object.keys(toQueryParams(appliedFilters)).length > 0
      ? toQueryParams(appliedFilters)
      : !loading && data?.applied_filters && Object.keys(data.applied_filters).length > 0
        ? data.applied_filters
        : null;

  const canApplyFilters = !filtersEffectivelyEqual(filterForm, appliedFilters);

  return (
    <PageLayout mainClassName="flex flex-col flex-1 min-h-0 bg-neutral-gray50">
      <div className="w-full max-w-none flex flex-1 flex-col min-h-0 min-w-0 items-stretch self-stretch px-4 tablet:px-6 desktop:px-8 xl:px-10 2xl:px-12 py-6 tablet:py-8 desktop:py-10">
        <div className="min-w-0 w-full max-w-none shrink-0 self-stretch text-left">
          <div ref={dashActionsRef} className="mt-1 w-full min-w-0 max-w-none">
            <div
              className={
                loading
                  ? 'w-full'
                  : 'flex flex-row items-center justify-between gap-3 tablet:gap-4'
              }
            >
              <h2
                className={
                  loading
                    ? 'w-full text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight break-words text-left'
                    : 'text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight break-words min-w-0 flex-1 pr-1 text-left'
                }
              >
                Welcome, {user?.name || user?.email || 'User'}
              </h2>
              {!loading && (
                <div className="flex shrink-0 items-center gap-2 self-center">
                  <div
                    id="dashboard-header-actions"
                    className="hidden lg:flex flex-wrap items-center gap-2"
                  >
                    <Link to="/players" className="btn-primary py-2 px-4 text-sm">
                      Show all players
                    </Link>
                    <button type="button" onClick={openAddPlayer} className="btn-primary py-2 px-4 text-sm">
                      Add player
                    </button>
                  </div>
                  <button
                    type="button"
                    className="lg:hidden inline-flex items-center justify-center rounded-md border border-neutral-gray300 bg-white p-2 text-neutral-gray800 shadow-sm hover:bg-neutral-gray50 transition-colors"
                    aria-expanded={dashActionsOpen}
                    aria-controls="dashboard-header-actions-mobile"
                    onClick={() => setDashActionsOpen((o) => !o)}
                  >
                    <Menu className="h-5 w-5 shrink-0" aria-hidden />
                    <span className="sr-only">Player actions</span>
                  </button>
                </div>
              )}
            </div>
            {!loading && dashActionsOpen && (
              <div
                id="dashboard-header-actions-mobile"
                className="lg:hidden mt-3 flex flex-col gap-2 rounded-lg border border-neutral-gray200 bg-white p-3 shadow-sm"
              >
                <Link
                  to="/players"
                  className="btn-primary w-full justify-center py-2 px-4 text-sm"
                  onClick={() => setDashActionsOpen(false)}
                >
                  Show all players
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDashActionsOpen(false);
                    openAddPlayer();
                  }}
                  className="btn-primary w-full justify-center py-2 px-4 text-sm"
                >
                  Add player
                </button>
              </div>
            )}
          </div>

          <section
            aria-labelledby="kpi-heading"
            className="min-w-0 w-full max-w-none self-stretch mt-6 tablet:mt-8 text-left"
          >
            <h2
              id="kpi-heading"
              className="text-lg tablet:text-xl desktop:text-2xl font-bold text-neutral-gray900 leading-tight text-left"
            >
              Key performance indicators
            </h2>
            <div className="mt-3 tablet:mt-4 w-full max-w-none">
              <DashboardFilters
                values={filterForm}
                onChange={setFilterForm}
                teamOptions={teamOptions}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                onRemoveAppliedKey={handleRemoveDashboardFilterKey}
                loading={loading}
                applyDisabled={!canApplyFilters}
                appliedSummary={appliedSummaryDisplay}
              />
            </div>
          </section>
        </div>

        <div className="mt-2 tablet:mt-4 flex-1 flex flex-col min-h-0 min-w-0 w-full max-w-none self-stretch">
          {loading && (
            <div
              className="flex w-full max-w-none flex-1 flex-col items-center justify-center gap-3 min-h-[40vh] tablet:min-h-[50vh] py-6 tablet:py-8 text-sm tablet:text-base text-neutral-gray600 text-center"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden />
              <p>Loading dashboard statistics…</p>
            </div>
          )}

          {error && !loading && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 tablet:px-4 py-2.5 tablet:py-3 text-xs tablet:text-sm text-red-800"
              role="alert"
            >
              <p className="font-semibold">Could not load stats</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && data && <DashboardView data={data} />}

          {!loading && !error && !data && (
            <p className="text-neutral-600">No dashboard data returned.</p>
          )}
        </div>

        {addPlayerOpen && createDraft && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-player-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Dismiss"
              onClick={closeAddPlayer}
              disabled={createLoading}
            />
            <div
              className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg border border-neutral-gray200 bg-neutral-gray50 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sr-only">
                <h2 id="add-player-title">Add player</h2>
              </div>
              <div className="overflow-y-auto flex-1 min-h-0 p-3 tablet:p-4">
                <PlayerEditAddPanel mode="create" draft={createDraft} setDraft={setCreateDraft} />
              </div>
              {createError && (
                <div className="mx-3 tablet:mx-4 mb-0 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  {createError}
                </div>
              )}
              <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-gray200 bg-white px-3 py-3 tablet:px-4">
                <button
                  type="button"
                  onClick={closeAddPlayer}
                  disabled={createLoading}
                  className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreatePlayer}
                  disabled={createLoading || !isPlayerCreateDraftValid(createDraft)}
                  title={
                    !isPlayerCreateDraftValid(createDraft) && !createLoading
                      ? 'Fill all required profile fields (including image URL)'
                      : undefined
                  }
                  className="btn-primary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Creating…' : 'Create player'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
