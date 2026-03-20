import BrowseFilterSelect from '@/components/filters/BrowseFilterSelect';
import CollapsibleFiltersPanel from '@/components/filters/CollapsibleFiltersPanel';
import {
  PLAYER_BROWSE_POSITION_OPTIONS,
  PLAYER_BROWSE_TEAM_OPTIONS,
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

/** Include `current` in the list when it’s not in `fixed` (e.g. deep link or new seed data). */
function optionsWithCurrent(fixed, current) {
  const c = String(current ?? '').trim();
  if (!c) return fixed;
  if (fixed.includes(c)) return fixed;
  return [...fixed, c].sort((a, b) => a.localeCompare(b));
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

  const renderFilterControl = (key) => {
    const label = PLAYER_FILTER_LABELS[key] || key;

    if (key === 'team') {
      const teamChoices = optionsWithCurrent(PLAYER_BROWSE_TEAM_OPTIONS, values.team);
      return (
        <BrowseFilterSelect
          id={`players-browse-filter-${key}`}
          fieldLabel={PLAYER_FILTER_LABELS[key] || key}
          value={values[key] ?? ''}
          onChange={(v) => handleChange(key, v)}
          disabled={loading}
          placeholderLabel="All teams"
          options={teamChoices.map((t) => ({ value: t, label: t }))}
        />
      );
    }

    if (key === 'position') {
      const positionChoices = optionsWithCurrent(PLAYER_BROWSE_POSITION_OPTIONS, values.position);
      return (
        <BrowseFilterSelect
          id={`players-browse-filter-${key}`}
          fieldLabel={PLAYER_FILTER_LABELS[key] || key}
          value={values[key] ?? ''}
          onChange={(v) => handleChange(key, v)}
          disabled={loading}
          placeholderLabel="All positions"
          options={positionChoices.map((p) => ({ value: p, label: p }))}
        />
      );
    }

    if (key === 'preferred_foot') {
      return (
        <BrowseFilterSelect
          id={`players-browse-filter-${key}`}
          fieldLabel={PLAYER_FILTER_LABELS[key] || key}
          value={preferredFootSelectValue(values[key])}
          onChange={(v) => handleChange(key, v)}
          disabled={loading}
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
          disabled={loading}
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
        disabled={loading}
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
                {renderFilterControl(key)}
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
