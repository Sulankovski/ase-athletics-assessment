import {
  validatePlayerCreate,
  parsePlayerUpdate,
  parseStatsForCreate,
  parseAttributesForCreate,
  parseStatsForUpdate,
  parseAttributesForUpdate,
  parseContractForCreate,
  parseContractForUpdate,
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
  findDistinctTeams,
  findDistinctPositions,
  SEARCH_COLUMNS,
} from "../repositories/player.js";
import * as playerStatsRepo from "../repositories/player_stats.js";
import * as playerAttributesRepo from "../repositories/player_attributes.js";
import * as playerContractsRepo from "../repositories/player_contracts.js";
import * as reportsRepo from "../repositories/reports.js";
import {
  toReportResponse,
  validateReportCreate,
  parseReportForCreate,
  validateReportUpdate,
  parseReportForUpdate,
} from "../models/report.js";
import { PlayerNotFoundError } from "../exceptions/players.js";
import { ReportNotFoundError } from "../exceptions/reports.js";
import { ValidationError } from "../exceptions/validation.js";

async function enrichPlayer(playerRow, db) {
  const [stats, attributes, contract] = await Promise.all([
    playerStatsRepo.findByPlayerId(playerRow.id, db),
    playerAttributesRepo.findByPlayerId(playerRow.id, db),
    playerContractsRepo.findByPlayerId(playerRow.id, db),
  ]);
  return toPlayerResponse(playerRow, stats, attributes, contract);
}

/**
 * Batch-load stats, attributes, and contracts for many players in three queries
 * instead of N+1 per player (list/search endpoints).
 */
async function enrichPlayers(playerRows, db) {
  if (playerRows.length === 0) return [];
  const ids = playerRows.map((p) => p.id);
  const [statsRows, attrRows, contractRows] = await Promise.all([
    playerStatsRepo.findByPlayerIds(ids, db),
    playerAttributesRepo.findByPlayerIds(ids, db),
    playerContractsRepo.findByPlayerIds(ids, db),
  ]);
  const statsByPlayer = Object.fromEntries(statsRows.map((r) => [r.player_id, r]));
  const attrsByPlayer = Object.fromEntries(attrRows.map((r) => [r.player_id, r]));
  const contractsByPlayer = Object.fromEntries(contractRows.map((r) => [r.player_id, r]));
  return playerRows.map((p) =>
    toPlayerResponse(
      p,
      statsByPlayer[p.id] ?? null,
      attrsByPlayer[p.id] ?? null,
      contractsByPlayer[p.id] ?? null
    )
  );
}

export async function createPlayer(body, db) {
  const validated = validatePlayerCreate(body);
  const row = await create(validated, db);
  const stats = parseStatsForCreate(body.stats ?? body.Stats);
  const attributes = parseAttributesForCreate(body.attributes ?? body.Attributes);
  const contract = parseContractForCreate(body.contract ?? body.Contract);
  await playerStatsRepo.create(row.id, stats, db);
  await playerAttributesRepo.create(row.id, attributes, db);
  if (contract.salary != null || contract.contract_end != null) {
    await playerContractsRepo.create(row.id, contract, db);
  }
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
  const contractUpdates = parseContractForUpdate(body.contract ?? body.Contract);
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
  if (Object.keys(contractUpdates).length > 0) {
    const existingContract = await playerContractsRepo.findByPlayerId(id, db);
    if (existingContract) {
      await playerContractsRepo.update(id, contractUpdates, db);
    } else {
      const fullContract = { ...parseContractForCreate({}), ...contractUpdates };
      await playerContractsRepo.create(id, fullContract, db);
    }
  }
  if (
    Object.keys(playerUpdates).length === 0 &&
    Object.keys(statsUpdates).length === 0 &&
    Object.keys(attrUpdates).length === 0 &&
    Object.keys(contractUpdates).length === 0
  ) {
    throw new ValidationError(
      "At least one field is required (player fields, stats, attributes, or contract)"
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

export async function getPlayerReports(playerId, db) {
  const player = await findById(playerId, db);
  if (!player) {
    throw new PlayerNotFoundError();
  }
  const rows = await reportsRepo.findByPlayerId(playerId, db);
  return { reports: rows.map(toReportResponse) };
}

export async function createPlayerReport(playerId, body, db) {
  const player = await findById(playerId, db);
  if (!player) {
    throw new PlayerNotFoundError();
  }
  validateReportCreate(body);
  const data = parseReportForCreate(body);
  data.player_name = data.player_name || player.name;
  const row = await reportsRepo.create(playerId, data, db);
  return toReportResponse(row);
}

export async function updatePlayerReport(playerId, reportId, body, db) {
  const player = await findById(playerId, db);
  if (!player) {
    throw new PlayerNotFoundError();
  }
  const existing = await reportsRepo.findByIdAndPlayerId(reportId, playerId, db);
  if (!existing) {
    throw new ReportNotFoundError();
  }
  const validated = validateReportUpdate(body);
  const updates = parseReportForUpdate(validated);
  if (Object.keys(updates).length === 0) {
    throw new ValidationError("At least one field is required");
  }
  if (updates.player_name !== undefined) {
    const name = String(updates.player_name || "").trim();
    updates.player_name = name || player.name;
  }
  const row = await reportsRepo.update(reportId, playerId, updates, db);
  if (!row) {
    throw new ReportNotFoundError();
  }
  return toReportResponse(row);
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

/**
 * List players: either unfiltered page, or AND-filter on whitelisted query keys (ILIKE substring).
 * Keys must match SEARCH_COLUMNS in the repository — arbitrary query params are ignored for safety.
 */
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

/** @returns {{ teams: string[] }} */
export async function getDistinctTeams(db) {
  const teams = await findDistinctTeams(db);
  return { teams };
}

/** @returns {{ positions: string[] }} */
export async function getDistinctPositions(db) {
  const positions = await findDistinctPositions(db);
  return { positions };
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
