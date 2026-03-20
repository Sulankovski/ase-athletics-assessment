import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Collapsible filter chrome shared by players list and dashboard KPI filters.
 * @param {string} idPrefix — unique prefix for aria ids.
 * @param {{ key: string, label: string, value: string }[]} chips
 * @param {(key: string) => void} [onRemoveChip]
 * @param {() => void} onClear
 * @param {(api: { collapse: () => void }) => React.ReactNode} children
 */
export default function CollapsibleFiltersPanel({
  idPrefix,
  chips = [],
  onRemoveChip,
  onClear,
  loading = false,
  children,
}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((e) => !e);
  const collapse = () => setExpanded(false);

  const hasApplied = chips.length > 0;
  const panelId = `${idPrefix}-filters-panel`;
  const toggleId = `${idPrefix}-filters-toggle`;

  return (
    <div className="w-full max-w-none rounded-lg overflow-hidden shadow-md border border-primary-800/25">
      {hasApplied && (
        <div className="bg-white px-3 py-2.5 tablet:px-4 border-b border-neutral-gray200">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-gray500 mb-2">
            Active filters
          </p>
          <ul className="flex flex-wrap gap-2">
            {chips.map(({ key, label, value }) => (
              <li key={key}>
                <span className="inline-flex items-center gap-1.5 max-w-full rounded-md border border-primary-200 bg-primary-50/90 pl-2.5 pr-1 py-1 text-xs text-primary-900">
                  <span className="truncate">
                    <span className="font-medium">{label}</span>
                    <span className="text-primary-800/80"> ≈ </span>
                    <span className="tabular-nums">{value}</span>
                  </span>
                  {onRemoveChip && (
                    <button
                      type="button"
                      onClick={() => onRemoveChip(key)}
                      disabled={loading}
                      className="shrink-0 rounded p-0.5 text-primary-700 hover:bg-primary-100/80 disabled:opacity-50 leading-none"
                      aria-label={`Remove ${label} filter`}
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
            aria-controls={panelId}
            id={toggleId}
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
          id={panelId}
          role="region"
          aria-labelledby={toggleId}
          className="bg-white p-3 tablet:p-4 w-full"
        >
          {children({ collapse })}
        </div>
      )}
    </div>
  );
}
