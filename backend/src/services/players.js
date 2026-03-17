import { validatePlayerCreate, validatePlayerUpdate, toPlayerResponse } from "../models/player.js";
import {
  findAll,
  findById,
  create,
  update,
  deleteById,
  searchByText,
  searchByParameters,
  countAll,
  countSearchByText,
  countSearchByParameters,
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

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query?.page, 10) || 1);
  const limit = Math.min(
    Math.max(1, parseInt(query?.limit, 10) || DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export async function getPlayers(query, db) {
  const { page, limit, offset } = getPaginationParams(query);
  const filters = {};
  for (const key of Object.keys(query ?? {})) {
    if (SEARCH_COLUMNS.includes(key) && key !== "limit" && key !== "page") {
      filters[key] = query[key];
    }
  }
  const [rows, total] =
    Object.keys(filters).length > 0
      ? await Promise.all([
          searchByParameters(filters, limit, offset, db),
          countSearchByParameters(filters, db),
        ])
      : await Promise.all([
          findAll(limit, offset, db),
          countAll(db),
        ]);
  const players = rows.map(toPlayerResponse);
  const totalPages = Math.ceil(total / limit);
  return {
    players,
    pagination: { page, limit, total, totalPages },
  };
}

export async function searchPlayersByText(query, db) {
  const term = (query?.q ?? query?.query ?? "").trim();
  if (!term) {
    return { players: [], pagination: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 0 } };
  }
  const { page, limit, offset } = getPaginationParams(query);
  const [rows, total] = await Promise.all([
    searchByText(term, limit, offset, db),
    countSearchByText(term, db),
  ]);
  const players = rows.map(toPlayerResponse);
  const totalPages = Math.ceil(total / limit);
  return {
    players,
    pagination: { page, limit, total, totalPages },
  };
}
