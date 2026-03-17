export async function findByEmail(email, db) {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] ?? null;
}

export async function findById(id, db) {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [parseInt(id, 10)]);
  return result.rows[0] ?? null;
}

export async function existsByEmail(email, db) {
  const result = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
  return result.rows.length > 0;
}

export async function create({ name, email, password_hash }, db) {
  const result = await db.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password_hash]
  );
  return result.rows[0];
}
