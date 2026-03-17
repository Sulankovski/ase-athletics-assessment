import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
} from "../exceptions/auth.js";
import {
  JWT_EXPIRATION_HOURS,
  createAccessToken,
  hashPassword,
  verifyPassword,
} from "../utils/auth_utils.js";
import { validateUserCreate, toUserResponse } from "../models/user.js";
import {
  findByEmail,
  findById,
  existsByEmail,
  create as createUser,
} from "../repositories/user.js";
import * as tokenRepository from "../repositories/token.js";

function getCredentialsFromBody(body) {
  const b = body ?? {};
  const username = b.username ?? b.email ?? b.Username ?? b.Email;
  const password = b.password ?? b.Password;
  return { username, password };
}

export async function login(body, db) {
  const { username, password } = getCredentialsFromBody(body);
  if (!username || !password) {
    const e = new Error("username and password are required (use form-urlencoded or JSON body)");
    e.statusCode = 400;
    e.detail = e.message;
    throw e;
  }
  const user = await findByEmail(username, db);
  if (!user) {
    throw new InvalidCredentialsError();
  }
  if (!verifyPassword(password, user.password_hash)) {
    throw new InvalidCredentialsError();
  }

  const [token, jti] = createAccessToken({
    sub: String(user.id),
    email: user.email,
    name: user.name,
  });
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + JWT_EXPIRATION_HOURS);
  await tokenRepository.create({ jti, user_id: user.id, expires_at: expiresAt }, db);

  return {
    access_token: token,
    token_type: "bearer",
    user: toUserResponse(user),
  };
}

export async function register(body, db) {
  const validated = validateUserCreate(body);
  if (await existsByEmail(validated.email, db)) {
    throw new UserAlreadyExistsError();
  }

  const passwordHash = hashPassword(validated.password);
  const user = await createUser(
    { name: validated.name, email: validated.email, password_hash: passwordHash },
    db
  );
  return toUserResponse(user);
}

export async function logout(currentUser, db) {
  await tokenRepository.deleteByJti(currentUser?.jti, db);
  return { message: "Successfully logged out" };
}

export async function getMe(currentUser, db) {
  const user = await findById(currentUser?.sub, db);
  if (!user) {
    throw new UserNotFoundError();
  }
  return toUserResponse(user);
}
