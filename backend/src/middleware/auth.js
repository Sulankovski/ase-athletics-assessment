import { extractToken } from "./security.js";
import { decodeAccessToken } from "../utils/auth_utils.js";
import { TokenInvalidOrExpiredError } from "../exceptions/auth.js";

export async function getCurrentUser(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return next(new TokenInvalidOrExpiredError("Not authenticated"));
  }
  const payload = decodeAccessToken(token);
  if (!payload) {
    return next(new TokenInvalidOrExpiredError("Invalid or expired token"));
  }
  const jti = payload.jti;
  if (!jti) {
    return next(new TokenInvalidOrExpiredError("Invalid token"));
  }
  const db = req.db;
  const tokenResult = await db.query(
    "SELECT 1 FROM tokens WHERE jti = $1 AND expires_at > NOW()",
    [jti]
  );
  if (tokenResult.rows.length === 0) {
    return next(new TokenInvalidOrExpiredError("Token invalid or expired"));
  }
  req.currentUser = payload;
  next();
}
