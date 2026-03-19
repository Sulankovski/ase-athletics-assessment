import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PlayerProfileView from '@/components/player/PlayerProfileView';
import { registerDashboardCharts } from '@/components/dashboard/registerCharts';
import { fetchPlayerById } from '@/services/playerService';

registerDashboardCharts();

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (id == null || String(id).trim() === '') {
      setLoading(false);
      setPlayer(null);
      setError(new Error('Missing player id'));
      return undefined;
    }

    setLoading(true);
    setError(null);

    fetchPlayerById(id)
      .then((data) => {
        if (!cancelled) setPlayer(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <PageLayout mainClassName="flex flex-col bg-neutral-gray50">
      <div className="w-full max-w-none flex-1 min-w-0 px-4 tablet:px-6 desktop:px-8 xl:px-10 2xl:px-12 py-6 tablet:py-8 desktop:py-10">
        <p className="text-xs tablet:text-sm font-medium text-primary-700">Player profile</p>
        <h1 className="mt-1 text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight">
          Detailed performance &amp; attributes
        </h1>

        {loading && (
          <div
            className="mt-8 flex flex-col items-center justify-center gap-3 min-h-[40vh] text-sm text-neutral-gray600"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden />
            <p>Loading player…</p>
          </div>
        )}

        {!loading && error && (
          <div
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <p className="font-semibold">
              {error.status === 404 ? 'Player not found' : 'Could not load player'}
            </p>
            <p className="mt-1">{error.message}</p>
            <Link
              to="/dashboard"
              className="mt-3 inline-block text-sm font-medium text-primary-800 underline hover:no-underline"
            >
              Return to dashboard
            </Link>
          </div>
        )}

        {!loading && !error && player && <div className="mt-6 tablet:mt-8"><PlayerProfileView player={player} /></div>}
      </div>
    </PageLayout>
  );
}
