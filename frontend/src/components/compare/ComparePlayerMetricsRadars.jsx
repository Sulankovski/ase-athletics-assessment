import { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { COMPARE_ATTR_LABELS, COMPARE_STAT_LABELS } from '@/constants/compareMetrics';
import { chartColors } from '@/styles/designTokens';
import {
  formatAttrTooltip,
  formatStatTooltip,
  normalizeRadarValue,
} from '@/utils/compareRadar';

function withAlpha(hex, alpha = 0.12) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const chartSurface =
  'h-[200px] tablet:h-[220px] w-full min-h-[180px] min-w-0 rounded-md border border-neutral-200/80 bg-white/80 p-2';

const radarOptionsBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
};

function EmptyRadar({ message }) {
  return (
    <div
      className={`${chartSurface} flex items-center justify-center text-center text-xs text-neutral-gray500 px-3`}
      role="status"
    >
      {message}
    </div>
  );
}

export default function ComparePlayerMetricsRadars({
  player,
  selectedStatKeys,
  selectedAttributeKeys,
  statMaxes,
  attrMaxes,
  colorIndex = 0,
}) {
  const paletteLen = chartColors.length || 1;
  const borderColor = chartColors[colorIndex % paletteLen] || '#0ea5e9';

  const statsData = useMemo(() => {
    if (!selectedStatKeys.length) return null;
    const stats = player?.stats ?? {};
    const labels = selectedStatKeys.map((k) => COMPARE_STAT_LABELS[k] ?? k);
    const raw = selectedStatKeys.map((k) => stats[k]);
    const normalized = selectedStatKeys.map((k, i) =>
      normalizeRadarValue(raw[i], statMaxes[k] ?? 1),
    );
    return {
      labels,
      keys: selectedStatKeys,
      raw,
      normalized,
    };
  }, [player, selectedStatKeys, statMaxes]);

  const attrsData = useMemo(() => {
    if (!selectedAttributeKeys.length) return null;
    const attrs = player?.attributes ?? {};
    const labels = selectedAttributeKeys.map((k) => COMPARE_ATTR_LABELS[k] ?? k);
    const raw = selectedAttributeKeys.map((k) => attrs[k]);
    const normalized = selectedAttributeKeys.map((k, i) =>
      normalizeRadarValue(raw[i], attrMaxes[k] ?? 100),
    );
    return {
      labels,
      keys: selectedAttributeKeys,
      raw,
      normalized,
    };
  }, [player, selectedAttributeKeys, attrMaxes]);

  const statsChartData = useMemo(() => {
    if (!statsData) return null;
    return {
      labels: statsData.labels,
      datasets: [
        {
          label: 'Stats',
          data: statsData.normalized,
          borderColor,
          backgroundColor: withAlpha(borderColor, 0.14),
          borderWidth: 2,
          pointBackgroundColor: borderColor,
        },
      ],
    };
  }, [statsData, borderColor]);

  const attrsChartData = useMemo(() => {
    if (!attrsData) return null;
    return {
      labels: attrsData.labels,
      datasets: [
        {
          label: 'Attributes',
          data: attrsData.normalized,
          borderColor,
          backgroundColor: withAlpha(borderColor, 0.14),
          borderWidth: 2,
          pointBackgroundColor: borderColor,
        },
      ],
    };
  }, [attrsData, borderColor]);

  const statsOptions = useMemo(() => {
    if (!statsData) return radarOptionsBase;
    return {
      ...radarOptionsBase,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 25, font: { size: 9 } },
          grid: { color: 'rgba(0,0,0,0.06)' },
          pointLabels: { font: { size: 9 } },
        },
      },
      plugins: {
        ...radarOptionsBase.plugins,
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              const key = statsData.keys[i];
              const r = statsData.raw[i];
              return `${ctx.label}: ${formatStatTooltip(key, r)}`;
            },
          },
        },
      },
    };
  }, [statsData]);

  const attrsOptions = useMemo(() => {
    if (!attrsData) return radarOptionsBase;
    return {
      ...radarOptionsBase,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 25, font: { size: 9 } },
          grid: { color: 'rgba(0,0,0,0.06)' },
          pointLabels: { font: { size: 9 } },
        },
      },
      plugins: {
        ...radarOptionsBase.plugins,
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              const r = attrsData.raw[i];
              return `${ctx.label}: ${formatAttrTooltip(r)}`;
            },
          },
        },
      },
    };
  }, [attrsData]);

  return (
    <div className="flex min-w-0 flex-col gap-3 border-t border-neutral-200/90 bg-neutral-gray50/40 px-3 py-3 tablet:px-4 tablet:py-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-gray500">Radar charts</h3>
      <div className="min-w-0">
        <p className="mb-1.5 text-xs font-medium text-neutral-gray700">Stats</p>
        {!statsChartData ? (
          <EmptyRadar message="Select one or more stats above to show this radar." />
        ) : (
          <div className={chartSurface}>
            <Radar data={statsChartData} options={statsOptions} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="mb-1.5 text-xs font-medium text-neutral-gray700">Attributes</p>
        {!attrsChartData ? (
          <EmptyRadar message="Select one or more attributes above to show this radar." />
        ) : (
          <div className={chartSurface}>
            <Radar data={attrsChartData} options={attrsOptions} />
          </div>
        )}
      </div>
    </div>
  );
}
