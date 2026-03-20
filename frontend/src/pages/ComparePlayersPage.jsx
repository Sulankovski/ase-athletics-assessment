import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileDown, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ComparePlayerCard from '@/components/compare/ComparePlayerCard';
import CompareStatsAttributesBar from '@/components/compare/CompareStatsAttributesBar';
import { registerDashboardCharts } from '@/components/dashboard/registerCharts';
import { ALL_COMPARE_ATTR_KEYS, ALL_COMPARE_STAT_KEYS } from '@/constants/compareMetrics';
import { useComparePlayers, COMPARE_MIN } from '@/context/ComparePlayersContext';
import { getCachedComparePlayer, loadComparePlayerForCompare } from '@/utils/comparePlayerCache';
import { computeAttrMaxes, computeStatMaxes } from '@/utils/compareRadar';
import { buildComparePlayersPdf } from '@/utils/pdf/buildComparePlayersPdf';

registerDashboardCharts();

export default function ComparePlayersPage() {
  const {
    selected,
    compareStatsKeys: selectedStats,
    compareAttrKeys: selectedAttributes,
    setCompareStatsKeys: setSelectedStats,
    setCompareAttrKeys: setSelectedAttributes,
  } = useComparePlayers();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /** Synced across all cards: hover one “Age” chip → every player’s Age highlights */
  const [hoveredParam, setHoveredParam] = useState(null);
  const [exportPdfLoading, setExportPdfLoading] = useState(false);

  const orderedStatKeys = useMemo(
    () => ALL_COMPARE_STAT_KEYS.filter((k) => selectedStats.includes(k)),
    [selectedStats],
  );
  const orderedAttrKeys = useMemo(
    () => ALL_COMPARE_ATTR_KEYS.filter((k) => selectedAttributes.includes(k)),
    [selectedAttributes],
  );

  const statMaxes = useMemo(
    () => computeStatMaxes(players, orderedStatKeys),
    [players, orderedStatKeys],
  );
  const attrMaxes = useMemo(
    () => computeAttrMaxes(players, orderedAttrKeys),
    [players, orderedAttrKeys],
  );

  const toggleStat = useCallback((key) => {
    setSelectedStats((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, [setSelectedStats]);

  const toggleAttribute = useCallback((key) => {
    setSelectedAttributes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, [setSelectedAttributes]);

  const clearAllCompareMetrics = useCallback(() => {
    setSelectedStats([]);
    setSelectedAttributes([]);
  }, [setSelectedStats, setSelectedAttributes]);

  const handleExportPdf = async () => {
    if (players.length === 0) return;
    setExportPdfLoading(true);
    try {
      await buildComparePlayersPdf(players, orderedStatKeys, orderedAttrKeys);
    } catch (err) {
      window.alert(err?.message || 'Could not export PDF');
    } finally {
      setExportPdfLoading(false);
    }
  };

  useEffect(() => {
    if (selected.length < COMPARE_MIN) {
      setPlayers([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setError(null);

    const ids = selected.map((s) => s.id);
    const allWarm = ids.length > 0 && ids.every((id) => getCachedComparePlayer(id) != null);

    if (allWarm) {
      setPlayers(ids.map((id) => getCachedComparePlayer(id)));
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    Promise.all(ids.map((id) => loadComparePlayerForCompare(id)))
      .then((rows) => {
        if (cancelled) return;
        setPlayers(rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load players');
        setPlayers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  const tooFew = selected.length < COMPARE_MIN;
  const n = players.length;
  const compareGridClass =
    n === 2
      ? 'grid w-full min-w-0 gap-2 tablet:gap-3 grid-cols-1 md:grid-cols-2'
      : n === 3
        ? 'grid w-full min-w-0 gap-2 tablet:gap-3 grid-cols-1 md:grid-cols-3'
        : 'grid w-full min-w-0 gap-2 tablet:gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4';

  return (
    <PageLayout mainClassName="flex flex-col flex-1 min-h-0 bg-neutral-gray50">
      <div className="w-full max-w-none flex flex-1 flex-col min-h-0 min-w-0 py-6 tablet:py-8 desktop:py-10">
        <div className="shrink-0 px-1.5 tablet:px-2 desktop:px-3 xl:px-4 2xl:px-6">
          <Link
            to="/players"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 shrink-0 mb-6"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Back to player list
          </Link>

          <div className="min-w-0 mb-6 tablet:mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight">
              Compare players
            </h1>
            {!tooFew && !loading && !error && players.length > 0 ? (
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={exportPdfLoading}
                className="btn-secondary inline-flex shrink-0 items-center justify-center gap-2 self-start py-2.5 px-4 text-sm disabled:opacity-50 sm:self-auto"
              >
                {exportPdfLoading ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <FileDown className="h-4 w-4 shrink-0" aria-hidden />
                )}
                Export PDF
              </button>
            ) : null}
          </div>
        </div>

        {tooFew && (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 mx-4 tablet:mx-6 desktop:mx-8 xl:mx-10 2xl:mx-12"
            role="status"
          >
            <p className="font-medium">Need at least {COMPARE_MIN} players</p>
            <p className="mt-1 text-amber-800/90">
              Add players from the list or dashboard, then open Compare from the bar above.
            </p>
            <Link to="/players" className="mt-3 inline-block text-sm font-semibold text-primary-800 hover:underline">
              Go to all players
            </Link>
          </div>
        )}

        {loading && !tooFew && (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-3 min-h-[40vh] py-8 text-neutral-gray600 px-4"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-hidden />
            <p className="text-sm">Loading player profiles…</p>
          </div>
        )}

        {!loading && error && !tooFew && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 mx-4 tablet:mx-6 desktop:mx-8"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && !tooFew && (
          <div className="w-full min-w-0 flex-1 flex flex-col gap-4 px-1.5 tablet:px-2 desktop:px-3">
            <CompareStatsAttributesBar
              selectedStats={selectedStats}
              selectedAttributes={selectedAttributes}
              onToggleStat={toggleStat}
              onToggleAttribute={toggleAttribute}
              onStatsSelectAll={() => setSelectedStats([...ALL_COMPARE_STAT_KEYS])}
              onStatsClear={() => setSelectedStats([])}
              onAttributesSelectAll={() => setSelectedAttributes([...ALL_COMPARE_ATTR_KEYS])}
              onAttributesClear={() => setSelectedAttributes([])}
              onClearAll={clearAllCompareMetrics}
            />
            <div
              className={`${compareGridClass} items-stretch`}
              onMouseLeave={() => setHoveredParam(null)}
            >
              {players.map((p, i) => (
                <ComparePlayerCard
                  key={p.id}
                  player={p}
                  hoveredParam={hoveredParam}
                  onParamHover={setHoveredParam}
                  selectedStatKeys={orderedStatKeys}
                  selectedAttributeKeys={orderedAttrKeys}
                  statMaxes={statMaxes}
                  attrMaxes={attrMaxes}
                  chartColorIndex={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
