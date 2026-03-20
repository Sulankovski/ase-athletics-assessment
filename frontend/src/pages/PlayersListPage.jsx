import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PlayerListCard from '@/components/player/PlayerListCard';
import { fetchPlayers } from '@/services/playerService';

const PAGE_SIZE = 25;

export default function PlayersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = useMemo(() => {
    const raw = parseInt(searchParams.get('page') || '1', 10);
    return Number.isFinite(raw) && raw >= 1 ? raw : 1;
  }, [searchParams]);

  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [page]);

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
        <div className="min-w-0 shrink-0 mb-6 tablet:mb-8">
          <h1 className="mt-2 text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight">
            All players
          </h1>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 shrink-0 mb-6"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to dashboard
        </Link>

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
      </div>
    </PageLayout>
  );
}
