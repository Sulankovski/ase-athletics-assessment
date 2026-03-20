import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDashboardStats(toQueryParams(appliedFilters))
      .then((payload) => {
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
        navigate(`/players/${created.id}`);
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

  const appliedSummaryDisplay =
    loading && Object.keys(toQueryParams(appliedFilters)).length > 0
      ? toQueryParams(appliedFilters)
      : !loading && data?.applied_filters && Object.keys(data.applied_filters).length > 0
        ? data.applied_filters
        : null;

  const canApplyFilters = !filtersEffectivelyEqual(filterForm, appliedFilters);

  return (
    <PageLayout mainClassName="flex flex-col bg-neutral-gray50">
      <div className="container-custom py-6 tablet:py-8 desktop:py-10 large:py-12 flex-1 flex flex-col max-w-full min-w-0">
        <div className="min-w-0">
          <p className="text-xs tablet:text-sm font-medium text-primary-700">Football analytics</p>
          <div className="mt-1 flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-4">
            <h2 className="text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight break-words min-w-0 flex-1">
              Welcome, {user?.name || user?.email || 'User'}
            </h2>
            {!loading && (
              <div className="flex flex-wrap items-center gap-2 shrink-0 tablet:pt-0.5">
                <Link to="/players" className="btn-primary py-2 px-4 text-sm">
                  Show all players
                </Link>
                <button type="button" onClick={openAddPlayer} className="btn-primary py-2 px-4 text-sm">
                  Add player
                </button>
              </div>
            )}
          </div>
        </div>

        {!loading && (
          <section aria-labelledby="kpi-heading" className="min-w-0 mt-6 tablet:mt-8">
            <h2
              id="kpi-heading"
              className="text-lg tablet:text-xl desktop:text-2xl font-bold text-neutral-gray900 leading-tight"
            >
              Key performance indicators
            </h2>
            <div className="mt-3 tablet:mt-4">
              <DashboardFilters
                values={filterForm}
                onChange={setFilterForm}
                teamOptions={teamOptions}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                loading={loading}
                applyDisabled={!canApplyFilters}
                appliedSummary={appliedSummaryDisplay}
              />
            </div>
          </section>
        )}

        <div className="mt-2 tablet:mt-4 flex-1 flex flex-col min-h-0 min-w-0">
          {loading && (
            <div
              className="flex flex-1 flex-col items-center justify-center gap-3 min-h-[40vh] tablet:min-h-[50vh] py-6 tablet:py-8 text-sm tablet:text-base text-neutral-gray600 px-4 text-center"
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
