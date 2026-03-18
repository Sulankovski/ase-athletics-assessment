import { Router } from "express";
import { getCurrentUser } from "../middleware/auth.js";
import * as dashboardService from "../services/dashboard.js";

const router = Router();

router.use(getCurrentUser);

router.get("/stats", async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.query, req.db);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export { router };
