import ResponsiveSelect from '@/components/filters/ResponsiveSelect';
import { usePlayerLookupOptions } from '@/hooks/usePlayerLookupOptions';

/** Ensures the current draft/URL value appears even if not yet returned from the API. */
function optionsWithCurrent(fixed, current) {
  const c = String(current ?? '').trim();
  if (!c) return fixed;
  if (fixed.includes(c)) return fixed;
  return [...fixed, c].sort((a, b) => a.localeCompare(b));
}

/**
 * Team or position dropdown backed by GET `/players/teams` and `/players/positions`.
 * Reuses {@link ResponsiveSelect} for mobile-friendly picking.
 *
 * @param {'team' | 'position'} kind
 */
export default function PlayerLookupSelect({
  kind,
  id,
  fieldLabel,
  value,
  onChange,
  disabled = false,
  placeholderLabel,
}) {
  const { teams, positions, loading, error } = usePlayerLookupOptions();
  const baseList = kind === 'team' ? teams : positions;
  const currentVal = value ?? '';
  const choices = optionsWithCurrent(baseList, currentVal);
  const options = choices.map((x) => ({ value: x, label: x }));

  const busy = loading && baseList.length === 0;
  const placeholder = busy ? `Loading ${kind === 'team' ? 'teams' : 'positions'}…` : placeholderLabel;

  return (
    <div className="min-w-0">
      <ResponsiveSelect
        id={id}
        fieldLabel={fieldLabel}
        value={currentVal}
        onChange={onChange}
        disabled={disabled || busy}
        placeholderLabel={placeholder}
        options={options}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
