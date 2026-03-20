/**
 * Players list browse panel: query keys forwarded to GET /players (subset of backend `SEARCH_COLUMNS`).
 * Exclude pagination keys `page` / `limit`.
 */
export const PLAYER_LIST_FILTER_KEYS = [
  'name',
  'age',
  'team',
  'position',
  'jersey_number',
  'preferred_foot',
  'height',
  'weight',
  'market_value',
];

export const PLAYER_FILTER_LABELS = {
  name: 'Name',
  age: 'Age',
  team: 'Team',
  position: 'Position',
  jersey_number: 'Jersey number',
  preferred_foot: 'Preferred foot',
  height: 'Height',
  weight: 'Weight',
  market_value: 'Market value',
};

export const EMPTY_PLAYER_BROWSE_FILTERS = Object.fromEntries(
  PLAYER_LIST_FILTER_KEYS.map((k) => [k, '']),
);

/** Preferred foot: shared by player form + browse filters (API values are case-insensitive for search). */
export const PREFERRED_FOOT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

/** Maps stored value to `<select>` value (`left` / `right` only). */
export function preferredFootSelectValue(raw) {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === 'left' || s === 'right') return s;
  return '';
}
