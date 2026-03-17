import { toPlayerResponse } from "../models/player.js";
import { findAll } from "../repositories/player.js";

export async function getPlayers(query, db) {
  const limit = Math.min(parseInt(query?.limit, 10) || 10, 100);
  const rows = await findAll(limit, db);
  const players = rows.map(toPlayerResponse);
  return { players };
}
