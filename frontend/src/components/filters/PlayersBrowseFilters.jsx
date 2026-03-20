import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded((e) => !e);

  const handleChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  const appliedQP = appliedValues ? browseFiltersToQueryParams(appliedValues) : {};
  const appliedEntries = Object.entries(appliedQP);
  const hasApplied = appliedEntries.length > 0;

  const shellClass =
    'rounded-lg overflow-hidden shadow-md border border-primary-800/25';

  return (
    <div className={shellClass}>
      {hasApplied && (
        <div className="bg-white px-3 py-2.5 tablet:px-4 border-b border-neutral-gray200">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-gray500 mb-2">
            Active filters
          </p>
          <ul className="flex flex-wrap gap-2">
            {appliedEntries.map(([key, val]) => (
              <li key={key}>
                <span className="inline-flex items-center gap-1.5 max-w-full rounded-md border border-primary-200 bg-primary-50/90 pl-2.5 pr-1 py-1 text-xs text-primary-900">
                  <span className="truncate">
                    <span className="font-medium">{PLAYER_FILTER_LABELS[key] || key}</span>
                    <span className="text-primary-800/80"> ≈ </span>
                    <span className="tabular-nums">{val}</span>
                  </span>
                  {onRemoveAppliedKey && (
                    <button
                      type="button"
                      onClick={() => onRemoveAppliedKey(key)}
                      disabled={loading}
                      className="shrink-0 rounded p-0.5 text-primary-700 hover:bg-primary-100/80 disabled:opacity-50 leading-none"
                      aria-label={`Remove ${PLAYER_FILTER_LABELS[key] || key} filter`}
                      title="Remove this filter"
                    >
                      <span className="sr-only">Remove</span>
                      <span className="block text-sm font-bold leading-none px-0.5" aria-hidden>
                        −
                      </span>
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-3 py-2.5 tablet:px-4 tablet:py-3">
        <div className="flex min-w-0 w-full flex-nowrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleExpanded}
            className="inline-flex min-w-0 items-center text-left text-[11px] tablet:text-xs font-bold uppercase tracking-wider text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm"
            aria-expanded={expanded}
            aria-controls="players-browse-filters-panel"
            id="players-browse-filters-toggle"
          >
            Filters
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              disabled={loading || !hasApplied}
              className="rounded border border-white/35 bg-white/10 px-2.5 py-1 text-[11px] tablet:text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/20 disabled:pointer-events-none disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={toggleExpanded}
              className="inline-flex rounded p-1 text-white/90 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label={expanded ? 'Collapse filters' : 'Expand filters'}
            >
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div
          id="players-browse-filters-panel"
          role="region"
          aria-labelledby="players-browse-filters-toggle"
          className="bg-white p-3 tablet:p-4"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onApply();
              setExpanded(false);
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
        </div>
      )}
    </div>
  );
}
