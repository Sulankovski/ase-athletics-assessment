import CollapsibleFiltersPanel from '@/components/filters/CollapsibleFiltersPanel';

/** @param {Record<string, unknown> | null} summary */
export function dashboardAppliedSummaryToChips(summary) {
  if (!summary || typeof summary !== 'object') return [];
  /** @type {{ key: string, label: string, value: string }[]} */
  const chips = [];
  const team = summary.team;
  if (team != null && String(team).trim() !== '') {
    chips.push({ key: 'team', label: 'Team', value: String(team) });
  }
  const ageMin = summary.age_min;
  if (ageMin != null && ageMin !== '') {
    chips.push({ key: 'age_min', label: 'Age min', value: String(ageMin) });
  }
  const ageMax = summary.age_max;
  if (ageMax != null && ageMax !== '') {
    chips.push({ key: 'age_max', label: 'Age max', value: String(ageMax) });
  }
  return chips;
}

/**
 * KPI filters: team + age range. Same collapsible shell as players list (`CollapsibleFiltersPanel`).
 */
export default function DashboardFilters({
  values,
  onChange,
  teamOptions = [],
  onApply,
  onClear,
  onRemoveAppliedKey,
  loading = false,
  applyDisabled = false,
  appliedSummary = null,
}) {
  const handleChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  const chips = dashboardAppliedSummaryToChips(appliedSummary);

  return (
    <CollapsibleFiltersPanel
      idPrefix="dashboard-kpi"
      chips={chips}
      onRemoveChip={onRemoveAppliedKey}
      onClear={onClear}
      loading={loading}
    >
      {({ collapse }) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApply();
            collapse();
          }}
        >
          <div className="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:items-end w-full">
            <div className="min-w-0 flex-1 tablet:max-w-[220px] w-full">
              <label htmlFor="dash-filter-team" className="block text-xs font-medium text-neutral-gray600 mb-1">
                Team
              </label>
              <select
                id="dash-filter-team"
                value={values.team}
                onChange={(e) => handleChange('team', e.target.value)}
                disabled={loading || teamOptions.length === 0}
                className="input w-full py-2 text-sm disabled:opacity-60"
              >
                <option value="">All teams</option>
                {teamOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full tablet:w-[7rem]">
              <label htmlFor="dash-filter-age-min" className="block text-xs font-medium text-neutral-gray600 mb-1">
                Age min
              </label>
              <input
                id="dash-filter-age-min"
                type="number"
                min={0}
                max={60}
                step={1}
                inputMode="numeric"
                placeholder="e.g. 18"
                value={values.age_min}
                onChange={(e) => handleChange('age_min', e.target.value)}
                disabled={loading}
                className="input w-full py-2 text-sm disabled:opacity-60"
              />
            </div>

            <div className="w-full tablet:w-[7rem]">
              <label htmlFor="dash-filter-age-max" className="block text-xs font-medium text-neutral-gray600 mb-1">
                Age max
              </label>
              <input
                id="dash-filter-age-max"
                type="number"
                min={0}
                max={60}
                step={1}
                inputMode="numeric"
                placeholder="e.g. 35"
                value={values.age_max}
                onChange={(e) => handleChange('age_max', e.target.value)}
                disabled={loading}
                className="input w-full py-2 text-sm disabled:opacity-60"
              />
            </div>

            <div className="flex flex-wrap gap-2 tablet:pb-0.5">
              <button
                type="submit"
                disabled={loading || applyDisabled}
                title={applyDisabled && !loading ? 'Change a filter to apply' : undefined}
                className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Apply filters'}
              </button>
            </div>
          </div>
        </form>
      )}
    </CollapsibleFiltersPanel>
  );
}
