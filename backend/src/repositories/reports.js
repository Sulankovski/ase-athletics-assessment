const REPORT_COLUMNS = [
  "player_id", "player_name", "scout_name", "date",
  "match_opponent", "match_competition", "match_result", "match_minutes_played", "match_position",
  "rating_technical", "rating_physical", "rating_mental", "rating_tactical",
  "rating_finishing", "rating_passing", "rating_dribbling", "rating_defending",
  "rating_leadership", "rating_work_rate",
  "strengths", "weaknesses", "key_moments",
  "overall_rating", "recommendation", "notes",
];

const REPORT_UPDATEABLE_COLUMNS = REPORT_COLUMNS.filter((c) => c !== "player_id");

const JSONB_COLUMNS = new Set(["strengths", "weaknesses", "key_moments"]);

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

export async function findByIdAndPlayerId(reportId, playerId, db) {
  const result = await db.query("SELECT * FROM reports WHERE id = $1 AND player_id = $2", [
    parseInt(reportId, 10),
    parseInt(playerId, 10),
  ]);
  return result.rows[0] ?? null;
}

export async function update(reportId, playerId, data, db) {
  const keys = REPORT_UPDATEABLE_COLUMNS.filter((k) => data[k] !== undefined);
  if (keys.length === 0) {
    return findByIdAndPlayerId(reportId, playerId, db);
  }

  let p = 1;
  const setParts = keys.map((k) => {
    const fragment = JSONB_COLUMNS.has(k) ? `${k} = $${p}::jsonb` : `${k} = $${p}`;
    p += 1;
    return fragment;
  });
  setParts.push("updated_at = NOW()");

  const values = keys.map((k) => {
    const v = data[k];
    if (JSONB_COLUMNS.has(k)) return JSON.stringify(Array.isArray(v) ? v : []);
    return v;
  });
  values.push(parseInt(reportId, 10), parseInt(playerId, 10));

  const result = await db.query(
    `UPDATE reports SET ${setParts.join(", ")} WHERE id = $${p} AND player_id = $${p + 1} RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}
