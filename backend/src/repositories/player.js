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
