const REPORT_COLUMNS = [
  "player_id", "player_name", "scout_name", "date",
  "match_opponent", "match_competition", "match_result", "match_minutes_played", "match_position",
  "rating_technical", "rating_physical", "rating_mental", "rating_tactical",
  "rating_finishing", "rating_passing", "rating_dribbling", "rating_defending",
  "rating_leadership", "rating_work_rate",
  "strengths", "weaknesses", "key_moments",
  "overall_rating", "recommendation", "notes",
];

export async function create(playerId, data, db) {
  const pid = parseInt(playerId, 10);
  const values = [
    pid,
    data.player_name,
    data.scout_name,
    data.date,
    data.match_opponent,
    data.match_competition,
    data.match_result,
    data.match_minutes_played,
    data.match_position,
    data.rating_technical,
    data.rating_physical,
    data.rating_mental,
    data.rating_tactical,
    data.rating_finishing,
    data.rating_passing,
    data.rating_dribbling,
    data.rating_defending,
    data.rating_leadership,
    data.rating_work_rate,
    JSON.stringify(data.strengths ?? []),
    JSON.stringify(data.weaknesses ?? []),
    JSON.stringify(data.key_moments ?? []),
    data.overall_rating,
    data.recommendation,
    data.notes,
  ];
  const placeholders = REPORT_COLUMNS.map((_, i) => `$${i + 1}`).join(", ");
  const result = await db.query(
    `INSERT INTO reports (${REPORT_COLUMNS.join(", ")}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function findByPlayerId(playerId, db) {
  const result = await db.query(
    "SELECT * FROM reports WHERE player_id = $1 ORDER BY date DESC",
    [parseInt(playerId, 10)]
  );
  return result.rows;
}
