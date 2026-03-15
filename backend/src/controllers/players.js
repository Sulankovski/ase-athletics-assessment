import { Router } from "express";
import { toPlayerSchema } from "../models/player.js";

const router = Router();

router.get("", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const db = req.db;
    const result = await db.query(
      "SELECT * FROM players ORDER BY id LIMIT $1",
      [limit]
    );
    const players = result.rows.map(toPlayerSchema);
    res.json({ players });
  } catch (err) {
    next(err);
  }
});

export { router };
