import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_ALGORITHM = "HS256";
export const JWT_EXPIRATION_HOURS = 24;

export function hashPassword(password) {
  const pwd = typeof password === "string" ? password : String(password);
  return bcrypt.hashSync(pwd, bcrypt.genSaltSync());
}

export function verifyPassword(plainPassword, hashedPassword) {
  const pwd = typeof plainPassword === "string" ? plainPassword : String(plainPassword);
  return bcrypt.compareSync(pwd, hashedPassword);
}

export function createAccessToken(data) {
  const jti = crypto.randomUUID();
  const expire = new Date();
  expire.setHours(expire.getHours() + JWT_EXPIRATION_HOURS);
  const payload = {
    ...data,
    jti,
    exp: Math.floor(expire.getTime() / 1000),
    iat: Math.floor(Date.now() / 1000),
  };
  const token = jwt.sign(payload, JWT_SECRET, { algorithm: JWT_ALGORITHM });
  return [token, jti];
}

export function decodeAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
  } catch {
    return null;
  }
}
