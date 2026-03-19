/** Mirrors backend `UPDATEABLE_FIELDS` + nested stats / attributes / contract. */

export const PLAYER_EDIT_FIELDS = [
  ['age', 'Age'],
  ['team', 'Team'],
  ['position', 'Position'],
  ['jersey_number', 'Jersey number'],
  ['preferred_foot', 'Preferred foot'],
  ['height', 'Height (cm)'],
  ['weight', 'Weight (kg)'],
  ['image_url', 'Image URL'],
  ['market_value', 'Market value'],
];

export const STAT_EDIT_KEYS = [
  'appearances',
  'goals',
  'assists',
  'yellow_cards',
  'red_cards',
  'minutes_played',
  'shots_on_target',
  'total_shots',
  'pass_accuracy',
  'dribbles_completed',
  'tackles_won',
  'aerial_duels_won',
  'saves',
  'clean_sheets',
  'goals_conceded',
  'long_passes',
  'catches',
  'punches',
];

export const STAT_EDIT_LABELS = {
  appearances: 'Appearances',
  goals: 'Goals',
  assists: 'Assists',
  yellow_cards: 'Yellow cards',
  red_cards: 'Red cards',
  minutes_played: 'Minutes played',
  shots_on_target: 'Shots on target',
  total_shots: 'Total shots',
  pass_accuracy: 'Pass accuracy (%)',
  dribbles_completed: 'Dribbles completed',
  tackles_won: 'Tackles won',
  aerial_duels_won: 'Aerial duels won',
  saves: 'Saves',
  clean_sheets: 'Clean sheets',
  goals_conceded: 'Goals conceded',
  long_passes: 'Long passes',
  catches: 'Catches',
  punches: 'Punches',
};

export const ATTR_EDIT_KEYS = [
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defending',
  'physical',
  'finishing',
  'crossing',
  'long_shots',
  'positioning',
  'diving',
  'handling',
  'kicking',
  'reflexes',
];

export const ATTR_EDIT_LABELS = {
  pace: 'Pace',
  shooting: 'Shooting',
  passing: 'Passing',
  dribbling: 'Dribbling',
  defending: 'Defending',
  physical: 'Physical',
  finishing: 'Finishing',
  crossing: 'Crossing',
  long_shots: 'Long shots',
  positioning: 'Positioning',
  diving: 'Diving',
  handling: 'Handling',
  kicking: 'Kicking',
  reflexes: 'Reflexes',
};

function toInputString(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  return String(v).trim();
}

function emptyStatsRecord() {
  return Object.fromEntries(STAT_EDIT_KEYS.map((k) => [k, '']));
}

function emptyAttrsRecord() {
  return Object.fromEntries(ATTR_EDIT_KEYS.map((k) => [k, '']));
}

/** Form state for PUT /players/:id (name is read-only in UI — not sent). */
export function clonePlayerForEdit(player) {
  const stats = player?.stats ?? {};
  const attrs = player?.attributes ?? {};
  const contract = player?.contract ?? {};
  const statsDraft = { ...emptyStatsRecord() };
  for (const k of STAT_EDIT_KEYS) {
    statsDraft[k] = toInputString(stats[k]);
  }
  const attrsDraft = { ...emptyAttrsRecord() };
  for (const k of ATTR_EDIT_KEYS) {
    attrsDraft[k] = toInputString(attrs[k]);
  }
  return {
    name: player?.name ?? '',
    age: toInputString(player?.age),
    team: toInputString(player?.team),
    position: toInputString(player?.position),
    jersey_number: toInputString(player?.jersey_number),
    preferred_foot: toInputString(player?.preferred_foot),
    height: toInputString(player?.height),
    weight: toInputString(player?.weight),
    image_url: toInputString(player?.image_url),
    market_value: toInputString(player?.market_value),
    stats: statsDraft,
    attributes: attrsDraft,
    contract: {
      salary: contract.salary != null && contract.salary !== '' ? String(contract.salary) : '',
      contract_end:
        typeof contract.contract_end === 'string' && contract.contract_end.length >= 10
          ? contract.contract_end.substring(0, 10)
          : '',
    },
  };
}

function parseNumericField(key, raw) {
  if (raw === '' || raw == null) return null;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  if (key === 'pass_accuracy') return n;
  return Number.isInteger(n) ? n : Math.round(n);
}

/** Build JSON body for PUT /players/:id. */
export function buildPlayerUpdatePayload(draft) {
  const player = {};
  for (const [key] of PLAYER_EDIT_FIELDS) {
    const v = draft[key];
    if (v != null && String(v).trim() !== '') {
      player[key] = String(v).trim();
    }
  }

  const stats = {};
  for (const key of STAT_EDIT_KEYS) {
    const n = parseNumericField(key, draft.stats[key]);
    if (n !== null) stats[key] = n;
  }

  const attributes = {};
  for (const key of ATTR_EDIT_KEYS) {
    const raw = draft.attributes[key];
    if (raw === '' || raw == null) continue;
    const n = Number(String(raw).trim());
    if (!Number.isFinite(n)) continue;
    attributes[key] = Math.round(n);
  }

  const contract = {};
  const salRaw = draft.contract?.salary;
  if (salRaw !== '' && salRaw != null) {
    const n = Number(String(salRaw).trim());
    if (Number.isFinite(n)) contract.salary = n;
  }
  const end = draft.contract?.contract_end?.trim();
  if (end) contract.contract_end = end;

  return {
    ...player,
    stats,
    attributes,
    contract,
  };
}
