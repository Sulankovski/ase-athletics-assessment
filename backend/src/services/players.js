import {
  validatePlayerCreate,
  parsePlayerUpdate,
  parseStatsForCreate,
  parseAttributesForCreate,
  parseStatsForUpdate,
  parseAttributesForUpdate,
  toPlayerResponse,
} from "../models/player.js";
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
import * as playerStatsRepo from "../repositories/player_stats.js";
import * as playerAttributesRepo from "../repositories/player_attributes.js";
import { PlayerNotFoundError } from "../exceptions/players.js";
import { ValidationError } from "../exceptions/validation.js";

async function enrichPlayer(playerRow, db) {
  const [stats, attributes] = await Promise.all([
    playerStatsRepo.findByPlayerId(playerRow.id, db),
    playerAttributesRepo.findByPlayerId(playerRow.id, db),
  ]);
  return toPlayerResponse(playerRow, stats, attributes);
}

async function enrichPlayers(playerRows, db) {
  if (playerRows.length === 0) return [];
  const ids = playerRows.map((p) => p.id);
  const [statsRows, attrRows] = await Promise.all([
    playerStatsRepo.findByPlayerIds(ids, db),
    playerAttributesRepo.findByPlayerIds(ids, db),
  ]);
  const statsByPlayer = Object.fromEntries(statsRows.map((r) => [r.player_id, r]));
  const attrsByPlayer = Object.fromEntries(attrRows.map((r) => [r.player_id, r]));
  return playerRows.map((p) =>
    toPlayerResponse(p, statsByPlayer[p.id] ?? null, attrsByPlayer[p.id] ?? null)
  );
}

export async function createPlayer(body, db) {
  const validated = validatePlayerCreate(body);
  const row = await create(validated, db);
  const stats = parseStatsForCreate(body.stats ?? body.Stats);
  const attributes = parseAttributesForCreate(body.attributes ?? body.Attributes);
  await playerStatsRepo.create(row.id, stats, db);
  await playerAttributesRepo.create(row.id, attributes, db);
  return enrichPlayer(row, db);
}

export async function updatePlayer(id, body, db) {
  const existing = await findById(id, db);
  if (!existing) {
    throw new PlayerNotFoundError();
  }
  let row = existing;
  const statsUpdates = parseStatsForUpdate(body.stats ?? body.Stats);
  const attrUpdates = parseAttributesForUpdate(body.attributes ?? body.Attributes);
  const playerUpdates = parsePlayerUpdate(body);
  if (Object.keys(playerUpdates).length > 0) {
    row = await update(id, playerUpdates, db);
  }
  if (Object.keys(statsUpdates).length > 0) {
    const existingStats = await playerStatsRepo.findByPlayerId(id, db);
    if (existingStats) {
      await playerStatsRepo.update(id, statsUpdates, db);
    } else {
      const fullStats = { ...parseStatsForCreate({}), ...statsUpdates };
      await playerStatsRepo.create(id, fullStats, db);
    }
  }
  if (Object.keys(attrUpdates).length > 0) {
    const existingAttrs = await playerAttributesRepo.findByPlayerId(id, db);
    if (existingAttrs) {
      await playerAttributesRepo.update(id, attrUpdates, db);
    } else {
      const fullAttrs = { ...parseAttributesForCreate({}), ...attrUpdates };
      await playerAttributesRepo.create(id, fullAttrs, db);
    }
  }
  if (
    Object.keys(playerUpdates).length === 0 &&
    Object.keys(statsUpdates).length === 0 &&
    Object.keys(attrUpdates).length === 0
  ) {
    throw new ValidationError(
      "At least one field is required (player fields, stats, or attributes)"
    );
  }
  return enrichPlayer(row, db);
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
  return enrichPlayer(row, db);
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
  const players = await enrichPlayers(rows, db);
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
  const players = await enrichPlayers(rows, db);
  const totalPages = Math.ceil(total / limit);
  return {
    players,
    pagination: { page, limit, total, totalPages },
  };
}
