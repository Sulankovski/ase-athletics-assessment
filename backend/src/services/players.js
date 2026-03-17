import { validatePlayerCreate, validatePlayerUpdate, toPlayerResponse } from "../models/player.js";
import {
  findAll,
  findById,
  create,
  update,
  deleteById,
  searchByText,
  searchByParameters,
  SEARCH_COLUMNS,
} from "../repositories/player.js";
import { PlayerNotFoundError } from "../exceptions/players.js";

export async function createPlayer(body, db) {
  const validated = validatePlayerCreate(body);
  const row = await create(validated, db);
  return toPlayerResponse(row);
}

export async function updatePlayer(id, body, db) {
  const existing = await findById(id, db);
  if (!existing) {
    throw new PlayerNotFoundError();
  }
  const validated = validatePlayerUpdate(body);
  const row = await update(id, validated, db);
  return toPlayerResponse(row);
}

export async function deletePlayer(id, db) {
  const deleted = await deleteById(id, db);
  if (!deleted) {
    throw new PlayerNotFoundError();
  }
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
  const filters = {};
  for (const key of Object.keys(query ?? {})) {
    if (SEARCH_COLUMNS.includes(key) && key !== "limit") {
      filters[key] = query[key];
    }
  }
  const rows =
    Object.keys(filters).length > 0
      ? await searchByParameters(filters, limit, db)
      : await findAll(limit, db);
  const players = rows.map(toPlayerResponse);
  return { players };
}

export async function searchPlayersByText(query, db) {
  const term = (query?.q ?? query?.query ?? "").trim();
  const limit = Math.min(parseInt(query?.limit, 10) || 50, 100);
  if (!term) {
    return { players: [] };
  }
  const rows = await searchByText(term, limit, db);
  const players = rows.map(toPlayerResponse);
  return { players };
}
