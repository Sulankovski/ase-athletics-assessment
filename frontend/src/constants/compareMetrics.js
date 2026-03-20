/** Stat & attribute keys + labels for compare pickers and radar axes (aligned with API + profile). */

export const COMPARE_STAT_DEFINITIONS = [
  ['appearances', 'Appearances'],
  ['goals', 'Goals'],
  ['assists', 'Assists'],
  ['yellow_cards', 'Yellow cards'],
  ['red_cards', 'Red cards'],
  ['minutes_played', 'Minutes played'],
  ['shots_on_target', 'Shots on target'],
  ['total_shots', 'Total shots'],
  ['pass_accuracy', 'Pass accuracy'],
  ['dribbles_completed', 'Dribbles completed'],
  ['tackles_won', 'Tackles won'],
  ['aerial_duels_won', 'Aerial duels won'],
  ['saves', 'Saves'],
  ['clean_sheets', 'Clean sheets'],
  ['goals_conceded', 'Goals conceded'],
  ['long_passes', 'Long passes'],
  ['catches', 'Catches'],
  ['punches', 'Punches'],
];

export const COMPARE_ATTR_DEFINITIONS = [
  ['pace', 'Pace'],
  ['shooting', 'Shooting'],
  ['passing', 'Passing'],
  ['dribbling', 'Dribbling'],
  ['defending', 'Defending'],
  ['physical', 'Physical'],
  ['finishing', 'Finishing'],
  ['crossing', 'Crossing'],
  ['long_shots', 'Long shots'],
  ['positioning', 'Positioning'],
  ['diving', 'Diving'],
  ['handling', 'Handling'],
  ['kicking', 'Kicking'],
  ['reflexes', 'Reflexes'],
];

export const ALL_COMPARE_STAT_KEYS = COMPARE_STAT_DEFINITIONS.map(([k]) => k);
export const ALL_COMPARE_ATTR_KEYS = COMPARE_ATTR_DEFINITIONS.map(([k]) => k);

/** Default radar selection on Compare page */
export const COMPARE_DEFAULT_STAT_KEYS = ['appearances', 'minutes_played'];
export const COMPARE_DEFAULT_ATTR_KEYS = ['pace', 'physical'];

export const COMPARE_STAT_LABELS = Object.fromEntries(
  COMPARE_STAT_DEFINITIONS.map(([k, l]) => [k, l]),
);
export const COMPARE_ATTR_LABELS = Object.fromEntries(
  COMPARE_ATTR_DEFINITIONS.map(([k, l]) => [k, l]),
);
