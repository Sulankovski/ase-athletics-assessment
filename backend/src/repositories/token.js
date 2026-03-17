export async function create({ jti, user_id, expires_at }, db) {
  await db.query(
    "INSERT INTO tokens (jti, user_id, expires_at) VALUES ($1, $2, $3)",
    [jti, user_id, expires_at]
  );
}

export async function deleteByJti(jti, db) {
  if (jti) {
    await db.query("DELETE FROM tokens WHERE jti = $1", [jti]);
  }
}
