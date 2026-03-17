import { Router } from "express";
import { getCurrentUser } from "../middleware/auth.js";
import * as playersService from "../services/players.js";

const router = Router();

router.use(getCurrentUser);

router.post("", async (req, res, next) => {
  try {
    const player = await playersService.createPlayer(req.body, req.db);
    res.status(201).json(player);
  } catch (err) {
    next(err);
  }
});

router.get("", async (req, res, next) => {
  try {
    const result = await playersService.getPlayers(req.query, req.db);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const player = await playersService.updatePlayer(req.params.id, req.body, req.db);
    res.json(player);
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
