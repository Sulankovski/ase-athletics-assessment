const STATS_COLUMNS = [
  "appearances",
  "goals",
  "assists",
  "yellow_cards",
  "red_cards",
  "minutes_played",
  "shots_on_target",
  "total_shots",
  "pass_accuracy",
  "dribbles_completed",
  "tackles_won",
  "aerial_duels_won",
  "saves",
  "clean_sheets",
  "goals_conceded",
  "long_passes",
  "catches",
  "punches",
];

export async function create(playerId, data, db) {
  const values = STATS_COLUMNS.map((c) => data[c] ?? null);
  await db.query(
    `INSERT INTO player_stats (player_id, ${STATS_COLUMNS.join(", ")}) 
     VALUES ($1, ${STATS_COLUMNS.map((_, i) => `$${i + 2}`).join(", ")})`,
    [parseInt(playerId, 10), ...values]
  );
}

export async function update(playerId, data, db) {
  const keys = Object.keys(data).filter((k) => STATS_COLUMNS.includes(k));
  if (keys.length === 0) return;
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => data[k]);
  values.push(parseInt(playerId, 10));
  await db.query(
    `UPDATE player_stats SET ${setClause} WHERE player_id = $${keys.length + 1}`,
    values
  );
}

export async function findByPlayerId(playerId, db) {
  const result = await db.query(
    "SELECT * FROM player_stats WHERE player_id = $1",
    [parseInt(playerId, 10)]
  );
  return result.rows[0] ?? null;
}

export async function findByPlayerIds(playerIds, db) {
  if (playerIds.length === 0) return [];
  const result = await db.query(
    "SELECT * FROM player_stats WHERE player_id = ANY($1)",
    [playerIds]
  );
  return result.rows;
}
