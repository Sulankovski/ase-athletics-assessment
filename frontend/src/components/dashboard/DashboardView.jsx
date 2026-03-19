import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import { formatSalary, formatAge, formatShortDate } from '@/utils/format';
import { chartColors } from '@/styles/designTokens';

const ATTRIBUTE_ORDER = [
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

function withAlpha(hex, alpha = 0.15) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* Heights scale with ui_guidelines breakpoints: mobile → tablet → desktop → large */
const chartSurface =
  'h-[200px] tablet:h-[240px] desktop:h-[280px] large:h-[300px] w-full min-h-[180px] min-w-0';
const chartSurfaceRadar =
  'h-[240px] tablet:h-[280px] desktop:h-[320px] large:h-[340px] w-full min-h-[200px] min-w-0 max-w-full';

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

function aggregateAgeLeague(ageRows) {
  const acc = { under_21: 0, age_21_25: 0, age_26_30: 0, over_30: 0 };
  (ageRows || []).forEach((row) => {
    acc.under_21 += row.under_21 || 0;
    acc.age_21_25 += row.age_21_25 || 0;
    acc.age_26_30 += row.age_26_30 || 0;
    acc.over_30 += row.over_30 || 0;
  });
  return acc;
}

export default function DashboardView({ data }) {
  const summary = data?.summary ?? {};
  const top = data?.top_performers ?? {};
  const dist = data?.distributions ?? {};
  const goalsByPos = data?.goals_by_position ?? [];
  const assistsByPos = data?.assists_by_position ?? [];
  const ageByTeam = data?.age_demographics_by_team ?? [];
  const contracts = data?.upcoming_contract_expirations ?? [];
  const radarRaw = data?.radar_comparison ?? [];

  const topGoal = top.goals?.[0];
  const topAssist = top.assists?.[0];
  const topPace = top.pace?.[0];
  const topSalary = top.salary?.[0];

  const sortedRadar = useMemo(
    () =>
      [...radarRaw].sort(
        (a, b) =>
          (b.attributes?.pace ?? 0) +
          (b.attributes?.shooting ?? 0) +
          (b.attributes?.passing ?? 0) -
          ((a.attributes?.pace ?? 0) + (a.attributes?.shooting ?? 0) + (a.attributes?.passing ?? 0)),
      ),
    [radarRaw],
  );

  const [visibleRadarIds, setVisibleRadarIds] = useState(null);

  useEffect(() => {
    setVisibleRadarIds(new Set(sortedRadar.map((p) => p.id)));
  }, [sortedRadar]);

  const toggleRadarPlayer = (playerId) => {
    setVisibleRadarIds((prev) => {
      const base = prev ?? new Set(sortedRadar.map((p) => p.id));
      const next = new Set(base);
      if (next.has(playerId)) {
        if (next.size <= 1) return next;
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const showAllRadarPlayers = () => {
    setVisibleRadarIds(new Set(sortedRadar.map((p) => p.id)));
  };

  const radarPlayerColor = (player) => {
    const i = sortedRadar.findIndex((p) => p.id === player.id);
    return chartColors[(i >= 0 ? i : 0) % chartColors.length] || '#0ea5e9';
  };

  const radarShownPlayers = useMemo(() => {
    if (visibleRadarIds == null) return sortedRadar;
    return sortedRadar.filter((p) => visibleRadarIds.has(p.id));
  }, [sortedRadar, visibleRadarIds]);

  const radarHiddenPlayers = useMemo(() => {
    if (visibleRadarIds == null) return [];
    return sortedRadar.filter((p) => !visibleRadarIds.has(p.id));
  }, [sortedRadar, visibleRadarIds]);

  const leagueAge = aggregateAgeLeague(ageByTeam);
  const leagueDoughnutData = {
    labels: ['Under 21', '21–25', '26–30', 'Over 30'],
    datasets: [
      {
        data: [
          leagueAge.under_21,
          leagueAge.age_21_25,
          leagueAge.age_26_30,
          leagueAge.over_30,
        ],
        backgroundColor: [
          chartColors[0] || '#0ea5e9',
          chartColors[1] || '#10b981',
          chartColors[2] || '#f59e0b',
          chartColors[3] || '#8b5cf6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const topTeamsForAge = (dist.by_team || []).slice(0, 6);

  const goalsBarData = {
    labels: goalsByPos.map((r) => r.position),
    datasets: [
      {
        label: 'Total goals',
        data: goalsByPos.map((r) => r.total_goals),
        backgroundColor: chartColors[0] || '#0ea5e9',
        borderRadius: 6,
      },
    ],
  };

  const assistsBarData = {
    labels: assistsByPos.map((r) => r.position),
    datasets: [
      {
        label: 'Total assists',
        data: assistsByPos.map((r) => r.total_assists),
        backgroundColor: chartColors[1] || '#10b981',
        borderRadius: 6,
      },
    ],
  };

  const radarData = useMemo(() => {
    return {
      labels: ATTRIBUTE_ORDER.map(([, label]) => label),
      datasets: sortedRadar.map((player, i) => {
        const color = chartColors[i % chartColors.length] || '#0ea5e9';
        const hidden =
          visibleRadarIds != null && !visibleRadarIds.has(player.id);
        return {
          label: player.name,
          data: ATTRIBUTE_ORDER.map(([key]) => player.attributes?.[key] ?? 0),
          borderColor: color,
          backgroundColor: withAlpha(color, 0.12),
          borderWidth: 2,
          pointBackgroundColor: color,
          hidden,
        };
      }),
    };
  }, [sortedRadar, visibleRadarIds]);

  const barAxisOptions = {
    ...baseChartOptions,
    scales: {
      x: {
        ticks: { maxRotation: 45, minRotation: 0, font: { size: 10 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
    },
  };

  const radarOptions = {
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
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-8 tablet:space-y-10 desktop:space-y-12">
      <section className="min-w-0" aria-label="Performance summary and tables">
        <h3 className="text-sm tablet:text-base desktop:text-lg font-semibold text-neutral-gray800 leading-snug">
          Summary & on-pitch leaders
        </h3>
        <div className="mt-3 tablet:mt-4 grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 large:grid-cols-5 gap-3 tablet:gap-4 desktop:gap-5">
          <div className="card p-3 tablet:p-4 desktop:p-5 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-gray500">
              Total players
            </p>
            <p className="mt-2 text-xl tablet:text-2xl desktop:text-3xl font-bold text-primary-700 tabular-nums">
              {summary.total_players ?? '—'}
            </p>
          </div>
          <div className="card p-3 tablet:p-4 desktop:p-5 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-gray500">
              Average age
            </p>
            <p className="mt-2 text-xl tablet:text-2xl desktop:text-3xl font-bold text-primary-700 tabular-nums">
              {formatAge(summary.average_age)}
            </p>
          </div>
          <div className="card p-3 tablet:p-4 desktop:p-5 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-gray500">
              Top goals
            </p>
            {topGoal ? (
              <>
                <p className="mt-2 text-base tablet:text-lg font-bold text-neutral-gray900 leading-tight break-words">
                  {topGoal.name}
                </p>
                <p className="text-xs tablet:text-sm text-neutral-gray600 mt-1 leading-relaxed">
                  {topGoal.team} · {topGoal.position}
                </p>
                <p className="mt-2 text-xl tablet:text-2xl font-bold text-primary-600 tabular-nums">
                  {topGoal.value}
                </p>
              </>
            ) : (
              <p className="mt-2 text-neutral-gray500">No data</p>
            )}
          </div>
          <div className="card p-3 tablet:p-4 desktop:p-5 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-gray500">
              Top assists
            </p>
            {topAssist ? (
              <>
                <p className="mt-2 text-base tablet:text-lg font-bold text-neutral-gray900 leading-tight break-words">
                  {topAssist.name}
                </p>
                <p className="text-xs tablet:text-sm text-neutral-gray600 mt-1 leading-relaxed">
                  {topAssist.team} · {topAssist.position}
                </p>
                <p className="mt-2 text-xl tablet:text-2xl font-bold text-primary-600 tabular-nums">
                  {topAssist.value}
                </p>
              </>
            ) : (
              <p className="mt-2 text-neutral-gray500">No data</p>
            )}
          </div>
          <div className="card p-3 tablet:p-4 desktop:p-5 min-w-0 tablet:col-span-2 desktop:col-span-1 large:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-gray500">
              Highest pace
            </p>
            {topPace ? (
              <>
                <p className="mt-2 text-base tablet:text-lg font-bold text-neutral-gray900 leading-tight break-words">
                  {topPace.name}
                </p>
                <p className="text-xs tablet:text-sm text-neutral-gray600 mt-1 leading-relaxed">
                  {topPace.team} · {topPace.position}
                </p>
                <p className="mt-2 text-xl tablet:text-2xl font-bold text-primary-600 tabular-nums">
                  {topPace.value}
                </p>
              </>
            ) : (
              <p className="mt-2 text-neutral-gray500">No data</p>
            )}
          </div>
        </div>

        <h3 className="mt-6 tablet:mt-8 desktop:mt-10 text-sm tablet:text-base desktop:text-lg font-semibold text-neutral-gray800 leading-snug">
          Market insights
        </h3>
        <div className="mt-3 tablet:mt-4 grid grid-cols-1 desktop:grid-cols-2 gap-4 tablet:gap-5 desktop:gap-6 min-w-0">
          <div className="table-container min-w-0">
            <div className="px-3 tablet:px-4 py-2.5 tablet:py-3 border-b border-neutral-gray200 bg-neutral-gray50">
              <h4 className="text-sm tablet:text-base font-semibold text-neutral-gray900">
                Top salaries
              </h4>
            </div>
            <div className="overflow-x-auto -mx-0">
              <table className="w-full min-w-[280px] text-xs tablet:text-sm">
                <thead>
                  <tr className="table-header border-b border-neutral-gray200">
                    <th className="text-left font-semibold">Player</th>
                    <th className="text-left font-semibold">Team</th>
                    <th className="text-right font-semibold">Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {(top.salary || []).slice(0, 8).map((row) => (
                    <tr key={`${row.id}-salary`} className="border-b border-neutral-gray100">
                      <td className="py-2 px-4 font-medium text-neutral-gray900">{row.name}</td>
                      <td className="py-2 px-4 text-neutral-gray600">{row.team}</td>
                      <td className="py-2 px-4 text-right font-medium">{formatSalary(row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {topSalary && (
              <p className="px-3 tablet:px-4 py-2.5 tablet:py-3 text-xs text-neutral-gray500 bg-neutral-gray50 leading-relaxed">
                Highest earner: <span className="font-semibold text-neutral-gray800">{topSalary.name}</span>{' '}
                ({formatSalary(topSalary.value)})
              </p>
            )}
          </div>

          <div className="table-container min-w-0">
            <div className="px-3 tablet:px-4 py-2.5 tablet:py-3 border-b border-neutral-gray200 bg-neutral-gray50">
              <h4 className="text-sm tablet:text-base font-semibold text-neutral-gray900">
                Upcoming contract expirations
              </h4>
            </div>
            <div className="overflow-x-auto max-h-[240px] tablet:max-h-[280px] desktop:max-h-[320px] overflow-y-auto">
              <table className="w-full min-w-[320px] text-xs tablet:text-sm">
                <thead className="sticky top-0 bg-neutral-gray50 z-10">
                  <tr className="border-b border-neutral-gray200">
                    <th className="text-left font-semibold py-2 px-4">Player</th>
                    <th className="text-left font-semibold py-2 px-4">Team</th>
                    <th className="text-left font-semibold py-2 px-4">Ends</th>
                    <th className="text-right font-semibold py-2 px-4">Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((row) => (
                    <tr key={row.id} className="border-b border-neutral-gray100 hover:bg-neutral-gray50/80">
                      <td className="py-2 px-4 font-medium text-neutral-gray900 whitespace-nowrap max-w-[140px] truncate">
                        {row.name}
                      </td>
                      <td className="py-2 px-4 text-neutral-gray600">{row.team}</td>
                      <td className="py-2 px-4 text-neutral-gray600 whitespace-nowrap">
                        {formatShortDate(row.contract_end)}
                      </td>
                      <td className="py-2 px-4 text-right">{formatSalary(row.salary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <h3 className="mt-6 tablet:mt-8 desktop:mt-10 text-sm tablet:text-base desktop:text-lg font-semibold text-neutral-gray800 leading-snug">
          Team distributions
        </h3>
        <div className="mt-3 tablet:mt-4 grid grid-cols-1 desktop:grid-cols-2 gap-4 tablet:gap-5 desktop:gap-6 min-w-0">
          <div className="table-container min-w-0">
            <div className="px-3 tablet:px-4 py-2.5 tablet:py-3 border-b border-neutral-gray200 bg-neutral-gray50">
              <h4 className="text-sm tablet:text-base font-semibold text-neutral-gray900">Players by team</h4>
            </div>
            <div className="overflow-x-auto max-h-[280px] tablet:max-h-[320px] desktop:max-h-[360px] overflow-y-auto">
              <table className="w-full min-w-[240px] text-xs tablet:text-sm">
                <thead className="sticky top-0 bg-neutral-gray50">
                  <tr className="border-b border-neutral-gray200">
                    <th className="text-left font-semibold py-2 px-4">Team</th>
                    <th className="text-right font-semibold py-2 px-4">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(dist.by_team || []).map((row) => (
                    <tr key={row.team} className="border-b border-neutral-gray100">
                      <td className="py-2 px-4 text-neutral-gray800">{row.team}</td>
                      <td className="py-2 px-4 text-right font-medium">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="table-container min-w-0">
            <div className="px-3 tablet:px-4 py-2.5 tablet:py-3 border-b border-neutral-gray200 bg-neutral-gray50">
              <h4 className="text-sm tablet:text-base font-semibold text-neutral-gray900">
                Players by position
              </h4>
            </div>
            <div className="overflow-x-auto max-h-[280px] tablet:max-h-[320px] desktop:max-h-[360px] overflow-y-auto">
              <table className="w-full min-w-[220px] text-xs tablet:text-sm">
                <thead className="sticky top-0 bg-neutral-gray50">
                  <tr className="border-b border-neutral-gray200">
                    <th className="text-left font-semibold py-2 px-4">Position</th>
                    <th className="text-right font-semibold py-2 px-4">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(dist.by_position || []).map((row) => (
                    <tr key={row.position} className="border-b border-neutral-gray100">
                      <td className="py-2 px-4 text-neutral-gray800">{row.position}</td>
                      <td className="py-2 px-4 text-right font-medium">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="viz-heading" className="min-w-0">
        <h2
          id="viz-heading"
          className="text-lg tablet:text-xl desktop:text-2xl font-bold text-neutral-gray900 leading-tight"
        >
          Interactive visualizations
        </h2>

        <h3 className="mt-4 tablet:mt-6 text-sm tablet:text-base desktop:text-lg font-semibold text-neutral-gray800 leading-snug">
          Goals & assists by position
        </h3>
        <div className="mt-3 tablet:mt-4 grid grid-cols-1 desktop:grid-cols-2 gap-4 tablet:gap-5 desktop:gap-6 min-w-0">
          <div className="card p-3 tablet:p-4 desktop:p-5 min-w-0 overflow-hidden">
            <h4 className="text-xs tablet:text-sm font-semibold text-neutral-gray800">Goals distribution</h4>
            <div className={chartSurface}>
              <Bar data={goalsBarData} options={barAxisOptions} />
            </div>
          </div>
          <div className="card p-3 tablet:p-4 desktop:p-5 min-w-0 overflow-hidden">
            <h4 className="text-xs tablet:text-sm font-semibold text-neutral-gray800">
              Assists distribution
            </h4>
            <div className={chartSurface}>
              <Bar data={assistsBarData} options={barAxisOptions} />
            </div>
          </div>
        </div>

        <h3 className="mt-6 tablet:mt-8 desktop:mt-10 text-sm tablet:text-base desktop:text-lg font-semibold text-neutral-gray800 leading-snug">
          Age demographics across teams
        </h3>
        <p className="mt-2 text-xs tablet:text-sm text-neutral-gray600 max-w-3xl leading-relaxed">
          League-wide age bands (all teams aggregated), plus team-level donuts for the six largest
          squads by player count.
        </p>
        <div className="mt-3 tablet:mt-4 grid grid-cols-1 large:grid-cols-2 gap-4 tablet:gap-5 desktop:gap-6 min-w-0">
          <div className="card p-3 tablet:p-4 desktop:p-5 flex flex-col items-stretch min-w-0 overflow-hidden">
            <h4 className="text-xs tablet:text-sm font-semibold text-neutral-gray800">League total</h4>
            <div className="h-[220px] tablet:h-[260px] desktop:h-[280px] w-full max-w-md mx-auto min-w-0 flex items-center justify-center">
              <Doughnut
                data={leagueDoughnutData}
                options={{
                  ...baseChartOptions,
                  cutout: '55%',
                  plugins: {
                    ...baseChartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: 10, font: { size: 10 }, padding: 8 },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="card p-3 tablet:p-4 desktop:p-5 min-w-0 overflow-hidden">
            <h4 className="text-xs tablet:text-sm font-semibold text-neutral-gray800 mb-3 tablet:mb-4">
              Top squads by headcount
            </h4>
            <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-2 large:grid-cols-3 gap-2 tablet:gap-3 desktop:gap-4">
              {topTeamsForAge.map(({ team }) => {
                const row = ageByTeam.find((r) => r.team === team);
                if (!row) return null;
                const d = {
                  labels: ['U21', '21–25', '26–30', '30+'],
                  datasets: [
                    {
                      data: [row.under_21, row.age_21_25, row.age_26_30, row.over_30],
                      backgroundColor: [
                        chartColors[0] || '#0ea5e9',
                        chartColors[1] || '#10b981',
                        chartColors[2] || '#f59e0b',
                        chartColors[3] || '#8b5cf6',
                      ],
                      borderWidth: 0,
                    },
                  ],
                };
                return (
                  <div key={team} className="flex flex-col items-center min-w-0">
                    <p className="text-[10px] tablet:text-xs font-semibold text-neutral-gray700 text-center mb-1.5 tablet:mb-2 line-clamp-2 min-h-[2.25rem] tablet:min-h-[2.5rem] break-words px-0.5">
                      {team}
                    </p>
                    <div className="h-[120px] tablet:h-[140px] desktop:h-[160px] w-full max-w-[160px] tablet:max-w-[180px] min-w-0">
                      <Doughnut
                        data={d}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: { enabled: true },
                          },
                          cutout: '50%',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <h3 className="mt-6 tablet:mt-8 desktop:mt-10 text-sm tablet:text-base desktop:text-lg font-semibold text-neutral-gray800 leading-snug">
          Player attribute comparison 
        </h3>
        <p className="mt-2 text-xs tablet:text-sm text-neutral-gray600 max-w-3xl leading-relaxed">
          Players are ordered by combined <strong>pace</strong>, <strong>shooting</strong>, and{' '}
          <strong>passing</strong> (highest first). Tap a name to show or hide that profile on the
          chart (at least one player stays visible).
        </p>
        <div className="mt-3 tablet:mt-4 card p-3 tablet:p-4 desktop:p-5 min-w-0 overflow-hidden">
          {sortedRadar.length > 0 && (
            <div
              className="mb-3 tablet:mb-4 flex flex-col gap-3 tablet:gap-4"
              role="group"
              aria-label="Select players to compare"
            >
              <div>
                <p className="mb-1.5 text-[10px] tablet:text-xs font-medium uppercase tracking-wide text-neutral-500">
                  On chart
                </p>
                <div className="flex flex-wrap gap-2" aria-label="Players shown on chart">
                  {radarShownPlayers.map((player) => {
                    const color = radarPlayerColor(player);
                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => toggleRadarPlayer(player.id)}
                        aria-pressed
                        className="inline-flex max-w-full items-center gap-2 rounded-md border border-primary-300 bg-primary-50 px-2.5 py-1.5 text-left text-[11px] tablet:text-xs font-medium text-primary-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full border border-white/80 shadow-sm"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        <span className="truncate">{player.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {radarHiddenPlayers.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] tablet:text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Hidden — tap to add back
                  </p>
                  <div className="flex flex-wrap gap-2" aria-label="Players hidden from chart">
                    {radarHiddenPlayers.map((player) => {
                      const color = radarPlayerColor(player);
                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => toggleRadarPlayer(player.id)}
                          aria-pressed={false}
                          className="inline-flex max-w-full items-center gap-2 rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1.5 text-left text-[11px] tablet:text-xs font-medium text-neutral-500 opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 hover:opacity-90 hover:border-neutral-300"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full border border-white/80 shadow-sm opacity-90"
                            style={{ backgroundColor: color }}
                            aria-hidden
                          />
                          <span className="truncate">{player.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={showAllRadarPlayers}
                className="self-start text-[11px] tablet:text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline"
              >
                Show all players
              </button>
            </div>
          )}
          <div className={`${chartSurfaceRadar} mx-auto`}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </section>
    </div>
  );
}
