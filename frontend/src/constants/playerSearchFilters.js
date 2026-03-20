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

/**
 * Teams present in seed / production dataset (`players_Data_production.json`).
 * Keep in sync when seed data adds clubs.
 */
export const PLAYER_BROWSE_TEAM_OPTIONS = [
  'AC Milan',
  'AS Roma',
  'Ajax',
  'Al-Ahli',
  'Al-Nassr',
  'Arsenal',
  'Atletico Madrid',
  'Barcelona',
  'Bayer Leverkusen',
  'Bayern Munich',
  'Borussia Dortmund',
  'Brighton',
  'Chelsea',
  'Club America',
  'Inter Milan',
  'Juventus',
  'Lech Poznan',
  'Lille',
  'Liverpool',
  'Lyon',
  'Manchester City',
  'Manchester United',
  'Monaco',
  'Mumbai City FC',
  'Napoli',
  'Newcastle',
  'Paris Saint-Germain',
  'Porto',
  'Real Madrid',
  'Red Star Belgrade',
  'Sevilla',
  'Tottenham',
  'Urawa Reds',
  'Valencia',
  'West Ham',
];

export const PLAYER_BROWSE_POSITION_OPTIONS = ['Defender', 'Forward', 'Goalkeeper', 'Midfielder'];
