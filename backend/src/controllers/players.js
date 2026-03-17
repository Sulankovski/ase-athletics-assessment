import { Router } from "express";
import { getCurrentUser } from "../middleware/auth.js";
import * as playersService from "../services/players.js";

const router = Router();

router.use(getCurrentUser);

router.get("", async (req, res, next) => {
  try {
    const result = await playersService.getPlayers(req.query, req.db);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const player = await playersService.getPlayerById(req.params.id, req.db);
    res.json(player);
  } catch (err) {
    next(err);
  }
});

export { router };
