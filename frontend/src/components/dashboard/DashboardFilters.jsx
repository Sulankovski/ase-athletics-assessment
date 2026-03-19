/**
 * KPI filters: team + age range. Matches backend query params (team, age_min, age_max).
 */
export default function DashboardFilters({
  values,
  onChange,
  teamOptions = [],
  onApply,
  onClear,
  loading = false,
  applyDisabled = false,
  appliedSummary = null,
}) {
  const handleChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  const hasActiveFilters =
    appliedSummary &&
    typeof appliedSummary === 'object' &&
    Object.keys(appliedSummary).length > 0;

  return (
    <form
      className="rounded-lg border border-neutral-gray200 bg-white p-3 tablet:p-4 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:items-end">
        <div className="min-w-0 flex-1 tablet:max-w-[220px]">
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
          <button
            type="button"
            onClick={onClear}
            disabled={loading}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <p className="mt-3 text-xs text-neutral-500 leading-relaxed">
          Active filters:{' '}
          {[
            appliedSummary.team != null &&
              appliedSummary.team !== '' &&
              `team = ${appliedSummary.team}`,
            appliedSummary.age_min != null && `age_min = ${appliedSummary.age_min}`,
            appliedSummary.age_max != null && `age_max = ${appliedSummary.age_max}`,
          ]
            .filter(Boolean)
            .join(' · ') || '—'}
        </p>
      )}
    </form>
  );
}
