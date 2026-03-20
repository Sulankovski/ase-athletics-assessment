import PlayerLookupSelect from '@/components/filters/PlayerLookupSelect';
import ResponsiveSelect from '@/components/filters/ResponsiveSelect';
import CollapsibleFiltersPanel from '@/components/filters/CollapsibleFiltersPanel';
import {
  PLAYER_FILTER_LABELS,
  PLAYER_LIST_FILTER_KEYS,
  PREFERRED_FOOT_OPTIONS,
  preferredFootSelectValue,
} from '@/constants/playerSearchFilters';
import { browseFiltersToQueryParams } from '@/utils/playerBrowseFilters';

const INPUT_CLASSES = 'input w-full py-2 text-sm disabled:opacity-60';
const NUMBER_INPUT_CLASSES = `${INPUT_CLASSES} tabular-nums [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100`;

const NUMERIC_FILTER_KEYS = new Set([
  'age',
  'jersey_number',
  'height',
  'weight',
  'market_value',
]);

function sanitizeUnsignedIntegerInput(raw) {
  return String(raw ?? '').replace(/\D/g, '');
}

function unsignedIntegerDisplayForInput(raw) {
  const s = String(raw ?? '').trim();
  if (s === '') return '';
  return /^\d+$/.test(s) ? s : '';
}

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
  searchValue = '',
  onSearchChange,
  appliedSearchQuery = '',
  browseFiltersLocked = false,
  searchLocked = false,
}) {
  const handleChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  const appliedQP = appliedValues ? browseFiltersToQueryParams(appliedValues) : {};
  const filterChips = Object.entries(appliedQP).map(([key, val]) => ({
    key,
    label: PLAYER_FILTER_LABELS[key] || key,
    value: String(val),
  }));
  const searchQ = String(appliedSearchQuery ?? '').trim();
  const chips =
    searchQ !== ''
      ? [
          { key: '__search__', label: 'Search', value: searchQ },
          ...filterChips,
        ]
      : filterChips;

  const renderFilterControl = (key) => {
    const label = PLAYER_FILTER_LABELS[key] || key;

    if (key === 'team') {
      return (
        <PlayerLookupSelect
          kind="team"
          id={`players-browse-filter-${key}`}
          fieldLabel={PLAYER_FILTER_LABELS[key] || key}
          value={values[key] ?? ''}
          onChange={(v) => handleChange(key, v)}
          disabled={loading || browseFiltersLocked}
          placeholderLabel="All teams"
        />
      );
    }

    if (key === 'position') {
      return (
        <PlayerLookupSelect
          kind="position"
          id={`players-browse-filter-${key}`}
          fieldLabel={PLAYER_FILTER_LABELS[key] || key}
          value={values[key] ?? ''}
          onChange={(v) => handleChange(key, v)}
          disabled={loading || browseFiltersLocked}
          placeholderLabel="All positions"
        />
      );
    }

    if (key === 'preferred_foot') {
      return (
        <ResponsiveSelect
          id={`players-browse-filter-${key}`}
          fieldLabel={PLAYER_FILTER_LABELS[key] || key}
          value={preferredFootSelectValue(values[key])}
          onChange={(v) => handleChange(key, v)}
          disabled={loading || browseFiltersLocked}
          placeholderLabel="Any foot"
          options={PREFERRED_FOOT_OPTIONS.map(({ value: v, label: optLabel }) => ({
            value: v,
            label: optLabel,
          }))}
        />
      );
    }

    if (NUMERIC_FILTER_KEYS.has(key)) {
      return (
        <input
          id={`players-browse-filter-${key}`}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          autoComplete="off"
          placeholder={`Filter by ${label}…`}
          value={unsignedIntegerDisplayForInput(values[key])}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') {
              handleChange(key, '');
              return;
            }
            handleChange(key, sanitizeUnsignedIntegerInput(v));
          }}
          disabled={loading || browseFiltersLocked}
          className={NUMBER_INPUT_CLASSES}
        />
      );
    }

    return (
      <input
        id={`players-browse-filter-${key}`}
        type="text"
        autoComplete="off"
        placeholder={`Filter by ${label}…`}
        value={values[key] ?? ''}
        onChange={(e) => handleChange(key, e.target.value)}
        disabled={loading || browseFiltersLocked}
        className={INPUT_CLASSES}
      />
    );
  };

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
            if (browseFiltersLocked) {
              collapse();
              return;
            }
            onApply();
            collapse();
          }}
        >
          <div className="mb-4 min-w-0">
            <label
              htmlFor="players-browse-keyword-search"
              className="block text-xs font-medium text-neutral-gray600 mb-1"
            >
              Keyword search
            </label>
            <input
              id="players-browse-keyword-search"
              type="search"
              name="q"
              autoComplete="off"
              placeholder="Search — name, team, position, value…"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              disabled={loading || searchLocked}
              className={`${INPUT_CLASSES} disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            <p className="mt-1.5 text-[11px] text-neutral-gray500">
              {searchLocked
                ? 'Clear applied filters below to use keyword search.'
                : browseFiltersLocked
                  ? 'Keyword search is active — field filters are disabled until you clear the search box.'
                  : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 desktop:grid-cols-4">
            {PLAYER_LIST_FILTER_KEYS.map((key) => (
              <div key={key} className="min-w-0">
                <label
                  htmlFor={`players-browse-filter-${key}`}
                  className="block text-xs font-medium text-neutral-gray600 mb-1"
                >
                  {PLAYER_FILTER_LABELS[key] || key}
                </label>
                {renderFilterControl(key)}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading || applyDisabled || browseFiltersLocked}
              title={
                browseFiltersLocked
                  ? 'Clear keyword search to apply field filters'
                  : applyDisabled && !loading
                    ? 'Change a filter to apply'
                    : undefined
              }
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
