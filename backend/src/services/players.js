import { validatePlayerCreate, toPlayerResponse } from "../models/player.js";
import { findAll, findById, create } from "../repositories/player.js";
import { PlayerNotFoundError } from "../exceptions/players.js";

export async function createPlayer(body, db) {
  const validated = validatePlayerCreate(body);
  const row = await create(validated, db);
  return toPlayerResponse(row);
}

export async function getPlayerById(id, db) {
  const row = await findById(id, db);
  if (!row) {
    throw new PlayerNotFoundError();
  }
  return toPlayerResponse(row);
}

export async function getPlayers(query, db) {
  const limit = Math.min(parseInt(query?.limit, 10) || 10, 100);
  const rows = await findAll(limit, db);
  const players = rows.map(toPlayerResponse);
  return { players };
}
