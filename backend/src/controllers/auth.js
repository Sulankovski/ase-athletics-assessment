import { Router } from "express";
import { getCurrentUser } from "../middleware/auth.js";
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

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const username = body.username ?? body.email ?? body.Username ?? body.Email;
    const password = body.password ?? body.Password;
    if (!username || !password) {
      return next({
        statusCode: 400,
        detail: "username and password are required (use form-urlencoded or JSON body)",
      });
    }
    const db = req.db;
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [username]);
    const user = userResult.rows[0];
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
    await db.query(
      "INSERT INTO tokens (jti, user_id, expires_at) VALUES ($1, $2, $3)",
      [jti, user.id, expiresAt]
    );

    res.json({
      access_token: token,
      token_type: "bearer",
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const validated = validateUserCreate(req.body);
    const db = req.db;
    const existing = await db.query("SELECT 1 FROM users WHERE email = $1", [validated.email]);
    if (existing.rows.length > 0) {
      throw new UserAlreadyExistsError();
    }

    const passwordHash = hashPassword(validated.password);
    const insertResult = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [validated.name, validated.email, passwordHash]
    );
    const user = insertResult.rows[0];
    res.json(toUserResponse(user));
  } catch (err) {
    if (err.message?.includes("Email") || err.message?.includes("Password") || err.message?.includes("name")) {
      const e = new Error(err.message);
      e.statusCode = 400;
      e.detail = err.message;
      return next(e);
    }
    next(err);
  }
});

router.post("/logout", getCurrentUser, async (req, res, next) => {
  try {
    const jti = req.currentUser?.jti;
    if (jti) {
      const db = req.db;
      await db.query("DELETE FROM tokens WHERE jti = $1", [jti]);
    }
    res.json({ message: "Successfully logged out" });
  } catch (err) {
    next(err);
  }
});

router.get("/me", getCurrentUser, async (req, res, next) => {
  try {
    const db = req.db;
    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
      parseInt(req.currentUser.sub, 10),
    ]);
    const user = userResult.rows[0];
    if (!user) {
      throw new UserNotFoundError();
    }
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
});

export { router };
