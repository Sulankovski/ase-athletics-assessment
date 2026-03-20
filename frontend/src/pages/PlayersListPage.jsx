import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Menu } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PlayerListCard from '@/components/player/PlayerListCard';
import PlayerEditAddPanel from '@/components/player/PlayerEditAddPanel';
import { createPlayer, fetchPlayers } from '@/services/playerService';
import {
  buildPlayerCreatePayload,
  cloneEmptyPlayerForCreate,
  isPlayerCreateDraftValid,
} from '@/utils/playerEdit';
import { PLAYER_NAV_FROM_PLAYERS_LIST } from '@/constants/navigation';

const PAGE_SIZE = 25;

export default function PlayersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = useMemo(() => {
    const raw = parseInt(searchParams.get('page') || '1', 10);
    return Number.isFinite(raw) && raw >= 1 ? raw : 1;
  }, [searchParams]);

  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listRefreshNonce, setListRefreshNonce] = useState(0);

  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [listActionsOpen, setListActionsOpen] = useState(false);
  const listActionsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPlayers({ page, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        setPlayers(Array.isArray(data?.players) ? data.players : []);
        setPagination(data?.pagination ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load players');
        setPlayers([]);
        setPagination(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, listRefreshNonce]);

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
    if (!listActionsOpen) return undefined;
    const close = (e) => {
      if (listActionsRef.current && !listActionsRef.current.contains(e.target)) {
        setListActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [listActionsOpen]);

  useEffect(() => {
    if (loading) setListActionsOpen(false);
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
        navigate(`/players/${created.id}`, { state: PLAYER_NAV_FROM_PLAYERS_LIST });
      } else {
        setListRefreshNonce((n) => n + 1);
      }
    } catch (err) {
      const detail = err?.data?.detail;
      let msg =
        err?.data?.message || err?.message || 'Could not create player';
      if (typeof detail === 'string') msg = detail;
      else if (Array.isArray(detail) && detail.length > 0) {
        msg = detail.map((d) => d?.message ?? d).join('; ');
      }
      setCreateError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  const totalPages = pagination?.totalPages ?? 0;
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  const goPage = (next) => {
    const p = Math.max(1, next);
    setSearchParams(p <= 1 ? {} : { page: String(p) });
  };

  return (
    <PageLayout mainClassName="flex flex-col flex-1 min-h-0 bg-neutral-gray50">
      <div className="w-full max-w-none flex flex-1 flex-col min-h-0 min-w-0 px-4 tablet:px-6 desktop:px-8 xl:px-10 2xl:px-12 py-6 tablet:py-8 desktop:py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 shrink-0 mb-6"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to dashboard
        </Link>

        <div className="min-w-0 shrink-0 mb-6 tablet:mb-8">
          <div ref={listActionsRef} className="mt-1 w-full min-w-0">
            <div className="flex flex-row items-center justify-between gap-3 tablet:gap-4">
              <h1 className="text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight break-words min-w-0 flex-1 pr-1">
                All players
              </h1>
              {!loading && (
                <div className="flex shrink-0 items-center gap-2 self-center">
                  <button
                    type="button"
                    onClick={openAddPlayer}
                    className="btn-primary hidden lg:inline-flex py-2 px-4 text-sm"
                  >
                    Add player
                  </button>
                  <button
                    type="button"
                    className="lg:hidden inline-flex items-center justify-center rounded-md border border-neutral-gray300 bg-white p-2 text-neutral-gray800 shadow-sm hover:bg-neutral-gray50 transition-colors"
                    aria-expanded={listActionsOpen}
                    aria-controls="players-list-header-actions-mobile"
                    onClick={() => setListActionsOpen((o) => !o)}
                  >
                    <Menu className="h-5 w-5 shrink-0" aria-hidden />
                    <span className="sr-only">Player actions</span>
                  </button>
                </div>
              )}
            </div>
            {!loading && listActionsOpen && (
              <div
                id="players-list-header-actions-mobile"
                className="lg:hidden mt-3 flex flex-col gap-2 rounded-lg border border-neutral-gray200 bg-white p-3 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => {
                    setListActionsOpen(false);
                    openAddPlayer();
                  }}
                  className="btn-primary w-full justify-center py-2 px-4 text-sm"
                >
                  Add player
                </button>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div
            className="flex flex-1 flex-col items-center justify-center min-h-[40vh] py-8 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-3 text-sm text-neutral-gray600">
              <Loader2 className="h-8 w-8 shrink-0 animate-spin text-primary-600" aria-hidden />
              <p>Loading players…</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-3 tablet:px-4 py-2.5 tablet:py-3 text-xs tablet:text-sm text-red-800"
            role="alert"
          >
            <p className="font-semibold">Could not load players</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid items-start gap-4 tablet:gap-5 grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 large:grid-cols-4 min-w-0 flex-1 content-start">
              {players.map((p) => (
                <PlayerListCard key={p.id} player={p} />
              ))}
            </div>

            {players.length === 0 && (
              <p className="mt-8 text-center text-sm text-neutral-gray600">No players found.</p>
            )}

            {totalPages > 1 && (
              <nav
                className="mt-8 tablet:mt-10 flex flex-wrap items-center justify-center gap-3"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  onClick={() => goPage(page - 1)}
                  disabled={!canPrev}
                  className="btn-primary py-2 px-4 text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-gray600 tabular-nums">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goPage(page + 1)}
                  disabled={!canNext}
                  className="btn-primary py-2 px-4 text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}

        {addPlayerOpen && createDraft && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="players-list-add-title"
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
                <h2 id="players-list-add-title">Add player</h2>
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
