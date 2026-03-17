export async function create(player, db) {
  const result = await db.query(
    `INSERT INTO players (name, age, team, position, jersey_number, preferred_foot, height, weight, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      player.name,
      player.age,
      player.team,
      player.position,
      player.jersey_number,
      player.preferred_foot,
      player.height,
      player.weight,
      player.image_url,
    ]
  );
  return result.rows[0];
}

const UPDATEABLE_COLUMNS = [
  "age",
  "team",
  "position",
  "jersey_number",
  "preferred_foot",
  "height",
  "weight",
  "image_url",
];

export async function update(id, data, db) {
  const keys = UPDATEABLE_COLUMNS.filter((k) => data[k] !== undefined);
  if (keys.length === 0) return findById(id, db);

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => data[k]);
  values.push(parseInt(id, 10));

  const result = await db.query(
    `UPDATE players SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteById(id, db) {
  const result = await db.query("DELETE FROM players WHERE id = $1 RETURNING id", [parseInt(id, 10)]);
  return result.rowCount > 0;
}

export async function findById(id, db) {
  const result = await db.query("SELECT * FROM players WHERE id = $1", [parseInt(id, 10)]);
  return result.rows[0] ?? null;
}

export async function findAll(limit, db) {
  const result = await db.query(
    "SELECT * FROM players ORDER BY id LIMIT $1",
    [limit]
  );
  return result.rows;
}
