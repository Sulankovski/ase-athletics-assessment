import { Router } from "express";
import { getCurrentUser } from "../middleware/auth.js";
import * as authService from "../services/auth.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const result = await authService.login(req.body, req.db);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const user = await authService.register(req.body, req.db);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", getCurrentUser, async (req, res, next) => {
  try {
    const result = await authService.logout(req.currentUser, req.db);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/me", getCurrentUser, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.currentUser, req.db);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export { router };
