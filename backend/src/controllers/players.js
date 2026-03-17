import { Router } from "express";
import * as playersService from "../services/players.js";

const router = Router();

router.get("", async (req, res, next) => {
  try {
    const result = await playersService.getPlayers(req.query, req.db);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export { router };
