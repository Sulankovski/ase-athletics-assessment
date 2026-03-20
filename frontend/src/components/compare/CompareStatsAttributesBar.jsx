import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  ALL_COMPARE_ATTR_KEYS,
  ALL_COMPARE_STAT_KEYS,
  COMPARE_ATTR_DEFINITIONS,
  COMPARE_STAT_DEFINITIONS,
} from '@/constants/compareMetrics';

const STAT_LABEL = Object.fromEntries(COMPARE_STAT_DEFINITIONS);
const ATTR_LABEL = Object.fromEntries(COMPARE_ATTR_DEFINITIONS);

function ToggleChip({ id, label, pressed, onToggle }) {
  return (
    <button
      type="button"
      id={id}
      aria-pressed={pressed}
      onClick={() => onToggle()}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${pressed
          ? 'border-primary-500 bg-primary-100 text-primary-900'
          : 'border-neutral-200 bg-white text-neutral-gray600 hover:border-neutral-300 hover:bg-neutral-gray50'
        }`}
    >
      {label}
    </button>
  );
}

function Group({ title, definitions, selectedKeys, onToggle, onSelectAll, onClear }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-neutral-gray800">{title}</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            className="text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline"
            onClick={onSelectAll}
          >
            All
          </button>
          <span className="text-neutral-300" aria-hidden>
            ·
          </span>
          <button
            type="button"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-800 hover:underline"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${title} metrics`}>
        {definitions.map(([key, label]) => (
          <ToggleChip
            key={key}
            id={`compare-metric-${key}`}
            label={label}
            pressed={selectedKeys.includes(key)}
            onToggle={() => onToggle(key)}
          />
        ))}
      </div>
    </div>
  );
}

/** Summary chip: same shell as Active filters on players list, without value text */
function SummaryChip({ label, onRemove, removeLabel }) {
  return (
    <li>
      <span className="inline-flex items-center gap-1.5 max-w-full rounded-md border border-primary-200 bg-primary-50/90 pl-2.5 pr-1 py-1 text-xs text-primary-900">
        <span className="truncate font-medium">{label}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded p-0.5 text-primary-700 hover:bg-primary-100/80 leading-none"
            aria-label={removeLabel}
            title="Remove from charts"
          >
            <span className="sr-only">Remove</span>
            <span className="block text-sm font-bold leading-none px-0.5" aria-hidden>
              −
            </span>
          </button>
        )}
      </span>
    </li>
  );
}

export default function CompareStatsAttributesBar({
  selectedStats,
  selectedAttributes,
  onToggleStat,
  onToggleAttribute,
  onStatsSelectAll,
  onStatsClear,
  onAttributesSelectAll,
  onAttributesClear,
  onClearAll,
}) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((e) => !e);

  const panelId = 'compare-metrics-panel';
  const toggleId = 'compare-metrics-toggle';

  const statSummaryItems = useMemo(() => {
    const items = [];
    const allStats = selectedStats.length === ALL_COMPARE_STAT_KEYS.length && selectedStats.length > 0;
    if (allStats) {
      items.push({
        key: 'summary-all-stats',
        label: `All stats (${ALL_COMPARE_STAT_KEYS.length})`,
        onRemove: onStatsClear,
        removeLabel: 'Remove all stats from charts',
      });
    } else {
      for (const key of selectedStats) {
        items.push({
          key: `stat-${key}`,
          label: STAT_LABEL[key] ?? key,
          onRemove: () => onToggleStat(key),
          removeLabel: `Remove ${STAT_LABEL[key] ?? key} from charts`,
        });
      }
    }
    return items;
  }, [selectedStats, onStatsClear, onToggleStat]);

  const attrSummaryItems = useMemo(() => {
    const items = [];
    const allAttrs =
      selectedAttributes.length === ALL_COMPARE_ATTR_KEYS.length && selectedAttributes.length > 0;
    if (allAttrs) {
      items.push({
        key: 'summary-all-attrs',
        label: `All attributes (${ALL_COMPARE_ATTR_KEYS.length})`,
        onRemove: onAttributesClear,
        removeLabel: 'Remove all attributes from charts',
      });
    } else {
      for (const key of selectedAttributes) {
        items.push({
          key: `attr-${key}`,
          label: ATTR_LABEL[key] ?? key,
          onRemove: () => onToggleAttribute(key),
          removeLabel: `Remove ${ATTR_LABEL[key] ?? key} from charts`,
        });
      }
    }
    return items;
  }, [selectedAttributes, onAttributesClear, onToggleAttribute]);

  const hasSelection = statSummaryItems.length > 0 || attrSummaryItems.length > 0;
  const canClear = hasSelection;

  return (
    <div className="mb-4 w-full max-w-none overflow-hidden rounded-lg border border-primary-800/25 shadow-md">
      {hasSelection ? (
        <div className="border-b border-neutral-gray200 bg-white px-3 py-2.5 tablet:px-4">
          <div className="space-y-3">
            <div className="min-w-0">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-gray600">
                Stats
              </p>
              {statSummaryItems.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {statSummaryItems.map(({ key, label, onRemove, removeLabel }) => (
                    <SummaryChip
                      key={key}
                      label={label}
                      onRemove={onRemove}
                      removeLabel={removeLabel}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-gray500">None selected</p>
              )}
            </div>
            <div className="min-w-0 border-t border-neutral-100 pt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-gray600">
                Attributes
              </p>
              {attrSummaryItems.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {attrSummaryItems.map(({ key, label, onRemove, removeLabel }) => (
                    <SummaryChip
                      key={key}
                      label={label}
                      onRemove={onRemove}
                      removeLabel={removeLabel}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-gray500">None selected</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs text-amber-950 tablet:px-4">
          No stats or attributes selected. Open the panel below to choose what appears on each radar.
        </div>
      )}

      <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-3 py-2.5 tablet:px-4 tablet:py-3">
        <div className="flex w-full min-w-0 flex-nowrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleExpanded}
            className="inline-flex min-w-0 flex-1 items-center text-left text-[11px] font-bold uppercase tracking-wider text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 tablet:text-xs"
            aria-expanded={expanded}
            aria-controls={panelId}
            id={toggleId}
          >
            Additional stats and attributes
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClearAll}
              disabled={!canClear}
              className="rounded border border-white/35 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/20 disabled:pointer-events-none disabled:opacity-40 tablet:text-xs"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={toggleExpanded}
              className="inline-flex rounded p-1 text-white/90 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label={expanded ? 'Collapse' : 'Expand'}
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
          className="w-full bg-white p-3 tablet:p-4"
        >
          <div className="flex flex-col gap-6">
            <Group
              title="Stats"
              definitions={COMPARE_STAT_DEFINITIONS}
              selectedKeys={selectedStats}
              onToggle={onToggleStat}
              onSelectAll={onStatsSelectAll}
              onClear={onStatsClear}
            />
            <Group
              title="Attributes"
              definitions={COMPARE_ATTR_DEFINITIONS}
              selectedKeys={selectedAttributes}
              onToggle={onToggleAttribute}
              onSelectAll={onAttributesSelectAll}
              onClear={onAttributesClear}
            />
          </div>
        </div>
      )}
    </div>
  );
}
