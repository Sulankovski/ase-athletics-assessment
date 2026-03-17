export async function findAll(limit, db) {
  const result = await db.query(
    "SELECT * FROM players ORDER BY id LIMIT $1",
    [limit]
  );
  return result.rows;
}
