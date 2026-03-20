import CollapsibleFiltersPanel from '@/components/filters/CollapsibleFiltersPanel';
import { PLAYER_FILTER_LABELS, PLAYER_LIST_FILTER_KEYS } from '@/constants/playerSearchFilters';
import { browseFiltersToQueryParams } from '@/utils/playerBrowseFilters';

const INPUT_CLASSES = 'input w-full py-2 text-sm disabled:opacity-60';

/**
 * Filters for GET /players — fields match backend `SEARCH_COLUMNS` (ILIKE contains per field).
 */
export default function PlayersBrowseFilters({
  values,
  onChange,
  onApply,
  onClear,
  onRemoveAppliedKey,
  loading = false,
  applyDisabled = false,
  appliedValues = null,
}) {
  const handleChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  const appliedQP = appliedValues ? browseFiltersToQueryParams(appliedValues) : {};
  const chips = Object.entries(appliedQP).map(([key, val]) => ({
    key,
    label: PLAYER_FILTER_LABELS[key] || key,
    value: String(val),
  }));

  return (
    <CollapsibleFiltersPanel
      idPrefix="players-browse"
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 desktop:grid-cols-4">
            {PLAYER_LIST_FILTER_KEYS.map((key) => (
              <div key={key} className="min-w-0">
                <label
                  htmlFor={`players-browse-filter-${key}`}
                  className="block text-xs font-medium text-neutral-gray600 mb-1"
                >
                  {PLAYER_FILTER_LABELS[key] || key}
                </label>
                <input
                  id={`players-browse-filter-${key}`}
                  type="text"
                  autoComplete="off"
                  placeholder={`Filter by ${PLAYER_FILTER_LABELS[key] || key}…`}
                  value={values[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  disabled={loading}
                  className={INPUT_CLASSES}
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading || applyDisabled}
              title={applyDisabled && !loading ? 'Change a filter to apply' : undefined}
              className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Apply filters'}
            </button>
          </div>
        </form>
      )}
    </CollapsibleFiltersPanel>
  );
}
