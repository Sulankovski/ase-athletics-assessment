import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ruler, Weight, Footprints, Hash } from 'lucide-react';
import { Bar, Radar } from 'react-chartjs-2';
import { formatSalary, formatShortDate, formatMarketValue } from '@/utils/format';
import { chartColors } from '@/styles/designTokens';
import PlayerEditAddPanel from '@/components/player/PlayerEditAddPanel';

const OUTFIELD_ATTR_ORDER = [
  ['pace', 'Pace'],
  ['shooting', 'Shooting'],
  ['passing', 'Passing'],
  ['dribbling', 'Dribbling'],
  ['defending', 'Defending'],
  ['physical', 'Physical'],
  ['finishing', 'Finishing'],
  ['crossing', 'Crossing'],
  ['long_shots', 'Long shots'],
  ['positioning', 'Positioning'],
];

const GK_ATTR_ORDER = [
  ['diving', 'Diving'],
  ['handling', 'Handling'],
  ['kicking', 'Kicking'],
  ['reflexes', 'Reflexes'],
];

/** Every API attribute key (outfield + GK), for the full metrics table. */
const ALL_ATTR_ROWS = [...OUTFIELD_ATTR_ORDER, ...GK_ATTR_ORDER];

const STAT_ROWS = [
  ['appearances', 'Appearances'],
  ['goals', 'Goals'],
  ['assists', 'Assists'],
  ['yellow_cards', 'Yellow cards'],
  ['red_cards', 'Red cards'],
  ['minutes_played', 'Minutes played'],
  ['shots_on_target', 'Shots on target'],
  ['total_shots', 'Total shots'],
  ['pass_accuracy', 'Pass accuracy (%)'],
  ['dribbles_completed', 'Dribbles completed'],
  ['tackles_won', 'Tackles won'],
  ['aerial_duels_won', 'Aerial duels won'],
  ['saves', 'Saves'],
  ['clean_sheets', 'Clean sheets'],
  ['goals_conceded', 'Goals conceded'],
  ['long_passes', 'Long passes'],
  ['catches', 'Catches'],
  ['punches', 'Punches'],
];

function withAlpha(hex, alpha = 0.15) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isLikelyHttpImage(s) {
  return typeof s === 'string' && (s.startsWith('http') || s.startsWith('/'));
}

function displayInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2)
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

function formatStatCell(key, raw) {
  if (raw == null || raw === '') return '/';
  if (key === 'pass_accuracy') {
    const n = Number(raw);
    if (!Number.isFinite(n)) return '/';
    return `${n.toFixed(1)}%`;
  }
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return '/';
    if (Number.isInteger(raw)) return raw.toLocaleString();
    return raw.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  const asNum = Number(raw);
  if (typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(asNum)) {
    if (Number.isInteger(asNum)) return asNum.toLocaleString();
    return asNum.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  return String(raw);
}

function formatAttrCell(raw) {
  if (raw == null || raw === '') return '/';
  const n = Number(raw);
  if (!Number.isFinite(n)) return '/';
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

const chartSurface =
  'h-[240px] tablet:h-[280px] lg:h-[300px] xl:h-[320px] w-full min-h-[220px] min-w-0';

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 10, font: { size: 11 } },
    },
  },
};

export default function PlayerProfileView({ player, isEditing, draft, setDraft }) {
  const attrs = player?.attributes ?? {};
  const stats = player?.stats ?? {};
  const contract = player?.contract ?? {};

  const isGkProfile = useMemo(() => {
    const pos = String(player?.position ?? '').toUpperCase();
    if (pos === 'GK' || pos === 'G') return true;
    const s = stats?.saves;
    return s != null && s !== '' && Number.isFinite(Number(s));
  }, [player?.position, stats]);

  const attrOrder = useMemo(() => {
    if (isGkProfile) return GK_ATTR_ORDER;
    return OUTFIELD_ATTR_ORDER;
  }, [isGkProfile]);

  const primaryColor = chartColors[0] || '#0ea5e9';

  const radarData = useMemo(() => {
    return {
      labels: attrOrder.map(([, label]) => label),
      datasets: [
        {
          label: player?.name ?? 'Attributes',
          data: attrOrder.map(([key]) => {
            const v = attrs[key];
            const n = Number(v);
            return Number.isFinite(n) ? n : 0;
          }),
          borderColor: primaryColor,
          backgroundColor: withAlpha(primaryColor, 0.12),
          borderWidth: 2,
          pointBackgroundColor: primaryColor,
        },
      ],
    };
  }, [attrOrder, attrs, player?.name, primaryColor]);

  const radarOptions = useMemo(
    () => ({
      ...baseChartOptions,
      plugins: {
        ...baseChartOptions.plugins,
        legend: { display: false },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, font: { size: 9 } },
          grid: { color: 'rgba(0,0,0,0.06)' },
          pointLabels: { font: { size: 9 } },
        },
      },
    }),
    [],
  );

  const barData = useMemo(() => {
    const labels = [];
    const data = [];
    const push = (label, key) => {
      const v = stats[key];
      if (v == null || v === '') return;
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) return;
      labels.push(label);
      data.push(n);
    };

    if (isGkProfile) {
      push('Saves', 'saves');
      push('Clean sheets', 'clean_sheets');
      push('Goals conceded', 'goals_conceded');
      push('Catches', 'catches');
      push('Punches', 'punches');
    }
    push('Goals', 'goals');
    push('Assists', 'assists');
    push('Shots on target', 'shots_on_target');
    push('Appearances', 'appearances');

    if (labels.length === 0) {
      labels.push('Goals', 'Assists');
      data.push(Number(stats.goals) || 0, Number(stats.assists) || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Season totals',
          data,
          backgroundColor: chartColors[1] || '#10b981',
          borderRadius: 6,
        },
      ],
    };
  }, [isGkProfile, stats]);

  const barOptions = useMemo(
    () => ({
      ...baseChartOptions,
      scales: {
        x: {
          ticks: { maxRotation: 35, minRotation: 0, font: { size: 10 } },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
      },
    }),
    [],
  );

  if (isEditing && draft) {
    return (
      <div className="w-full min-w-0 space-y-6 tablet:space-y-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to dashboard
        </Link>
        <PlayerEditAddPanel mode="edit" draft={draft} setDraft={setDraft} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-8 tablet:space-y-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        Back to dashboard
      </Link>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch xl:gap-8 2xl:gap-10">
        <div className="w-full xl:w-[min(100%,440px)] xl:max-w-[480px] xl:shrink-0">
          <section className="card overflow-hidden p-0 min-w-0 shadow-sm border border-neutral-gray200/80">
            <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-5 py-6 tablet:px-6 tablet:py-8 text-white">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex shrink-0 justify-center sm:justify-start">
                    {isLikelyHttpImage(player?.image_url) ? (
                      <img
                        src={player.image_url}
                        alt=""
                        className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
                      />
                    ) : (
                      <div
                        className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-2xl bg-white/15 text-2xl sm:text-3xl font-bold tracking-tight ring-4 ring-white/20 shadow-lg text-white"
                        aria-hidden
                      >
                        {displayInitials(player?.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="text-[11px] tablet:text-xs font-semibold uppercase tracking-wider text-white/85">
                      {player?.team ?? '—'} · #{player?.jersey_number ?? '—'}
                    </p>
                    <p className="mt-2 text-2xl tablet:text-3xl font-bold leading-tight text-white break-words">
                      {player?.name ?? 'Player'}
                    </p>
                    <p className="mt-2 text-sm tablet:text-base text-white/90">
                      <span className="font-semibold">{player?.position ?? '—'}</span>
                      {player?.preferred_foot ? (
                        <span className="text-white/80"> · {player.preferred_foot} foot</span>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/10 px-3 py-3 tablet:px-4 backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] tablet:text-xs font-semibold uppercase tracking-wide text-white/70">
                      Market value
                    </p>
                    <p className="mt-1 text-base tablet:text-lg font-bold tabular-nums text-white">
                      {formatMarketValue(player?.market_value)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-3 tablet:px-4 backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] tablet:text-xs font-semibold uppercase tracking-wide text-white/70">
                      Contract ends
                    </p>
                    <p className="mt-1 text-base tablet:text-lg font-bold tabular-nums text-amber-100/95 leading-snug">
                      {formatShortDate(contract?.contract_end)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-5 tablet:px-6 tablet:py-6 grid grid-cols-2 gap-x-4 gap-y-5 bg-white">
              <div className="flex gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Ruler className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-gray500">Height</p>
                  <p className="text-sm font-semibold text-neutral-gray900">
                    {player?.height ? `${player.height} cm` : '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Weight className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-gray500">Weight</p>
                  <p className="text-sm font-semibold text-neutral-gray900">
                    {player?.weight ? `${player.weight} kg` : '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Footprints className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-gray500">Age</p>
                  <p className="text-sm font-semibold text-neutral-gray900 tabular-nums">
                    {player?.age != null && player.age !== '' ? player.age : '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Hash className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-gray500">Salary (yr)</p>
                  <p className="text-sm font-semibold text-neutral-gray900 tabular-nums">
                    {formatSalary(contract?.salary)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-5 tablet:gap-6 auto-rows-fr">
          <section
            className="dashboard-card p-4 tablet:p-5 min-w-0 flex flex-col h-full"
            aria-labelledby="attrs-heading"
          >
            <h2
              id="attrs-heading"
              className="text-base tablet:text-lg font-bold text-neutral-gray900 leading-tight"
            >
              Attribute profile
            </h2>
            <p className="mt-1 text-xs tablet:text-sm text-neutral-gray600">
              {isGkProfile ? 'Goalkeeping ratings (0–100).' : 'Outfield ratings (0–100).'}
            </p>
            <div className={`mt-4 flex-1 min-h-0 ${chartSurface}`}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </section>

          <section
            className="dashboard-card p-4 tablet:p-5 min-w-0 flex flex-col h-full"
            aria-labelledby="perf-heading"
          >
            <h2
              id="perf-heading"
              className="text-base tablet:text-lg font-bold text-neutral-gray900 leading-tight"
            >
              Performance snapshot
            </h2>
            <p className="mt-1 text-xs tablet:text-sm text-neutral-gray600">
              Season output and efficiency indicators.
            </p>
            <div className={`mt-4 flex-1 min-h-0 ${chartSurface}`}>
              <Bar data={barData} options={barOptions} />
            </div>
          </section>
        </div>
      </div>

      <section
        className="min-w-0 rounded-lg overflow-hidden shadow-md border border-primary-800/25"
        aria-labelledby="all-metrics-heading"
      >
        <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-4 py-2.5 tablet:py-3">
          <p
            id="all-metrics-heading"
            className="text-[11px] tablet:text-xs font-bold uppercase tracking-wider text-white/90"
          >
            Full metrics
          </p>
        </div>

        <div className="bg-white">
          <div className="grid desktop:grid-cols-2 desktop:divide-x divide-neutral-gray200">
          <div className="p-4 tablet:p-6 desktop:p-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-4">
              Statistics
            </h3>
            <div className="rounded-lg border border-neutral-gray100 overflow-hidden">
              <table className="w-full text-xs tablet:text-sm">
                <tbody>
                  {STAT_ROWS.map(([key, label], i) => (
                    <tr
                      key={key}
                      className={`border-b border-neutral-gray100 last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-gray50/50'}`}
                    >
                      <th
                        scope="row"
                        className="py-2.5 px-3 tablet:px-4 text-left font-medium text-neutral-gray700"
                      >
                        {label}
                      </th>
                      <td className="py-2.5 px-3 tablet:px-4 text-right font-semibold text-neutral-gray900 tabular-nums">
                        {formatStatCell(key, stats[key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 tablet:p-6 desktop:p-8 border-t desktop:border-t-0 border-neutral-gray200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-4">
              Attributes
            </h3>
            <div className="rounded-lg border border-neutral-gray100 overflow-hidden">
              <table className="w-full text-xs tablet:text-sm">
                <tbody>
                  {ALL_ATTR_ROWS.map(([key, label], i) => (
                    <tr
                      key={key}
                      className={`border-b border-neutral-gray100 last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-gray50/50'}`}
                    >
                      <th
                        scope="row"
                        className="py-2.5 px-3 tablet:px-4 text-left font-medium text-neutral-gray700"
                      >
                        {label}
                      </th>
                      <td className="py-2.5 px-3 tablet:px-4 text-right font-semibold text-neutral-gray900 tabular-nums">
                        {formatAttrCell(attrs[key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
