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

// Routes with literal segments must be registered before `GET /:id` so e.g. "search" is never treated as an id.
router.get("/search", async (req, res, next) => {
  try {
    const result = await playersService.searchPlayersByText(req.query, req.db);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/teams", async (req, res, next) => {
  try {
    const result = await playersService.getDistinctTeams(req.db);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/positions", async (req, res, next) => {
  try {
    const result = await playersService.getDistinctPositions(req.db);
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

router.delete("/:id", async (req, res, next) => {
  try {
    await playersService.deletePlayer(req.params.id, req.db);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get("/:id/reports", async (req, res, next) => {
  try {
    const result = await playersService.getPlayerReports(req.params.id, req.db);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/reports", async (req, res, next) => {
  try {
    const report = await playersService.createPlayerReport(req.params.id, req.body, req.db);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/reports/:reportId", async (req, res, next) => {
  try {
    const report = await playersService.updatePlayerReport(
      req.params.id,
      req.params.reportId,
      req.body,
      req.db
    );
    res.json(report);
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
