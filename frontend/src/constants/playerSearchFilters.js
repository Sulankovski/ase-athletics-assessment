/**
 * GET /players query keys supported by the backend (`SEARCH_COLUMNS` in player repository).
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
  'image_url',
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
  image_url: 'Image URL',
  market_value: 'Market value',
};

export const EMPTY_PLAYER_BROWSE_FILTERS = Object.fromEntries(
  PLAYER_LIST_FILTER_KEYS.map((k) => [k, '']),
);
