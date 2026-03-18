import Joi from "joi";
import { ValidationError } from "../exceptions/validation.js";

function normalizePlayerInput(data) {
  const d = data ?? {};
  return {
    name: d.name ?? d.Name,
    age: d.age ?? d.Age,
    team: d.team ?? d.Team,
    position: d.position ?? d.Position,
    jersey_number: d.jersey_number ?? d.jerseyNumber ?? d.JerseyNumber,
    preferred_foot: d.preferred_foot ?? d.preferredFoot ?? d.PreferredFoot,
    height: d.height ?? d.Height,
    weight: d.weight ?? d.Weight,
    image_url: d.image_url ?? d.imageUrl ?? d.ImageUrl,
  };
}

const playerCreateSchema = Joi.object({
  name: Joi.string().trim().required(),
  age: Joi.string().trim().required(),
  team: Joi.string().trim().required(),
  position: Joi.string().trim().required(),
  jersey_number: Joi.string().trim().required(),
  preferred_foot: Joi.string().trim().required(),
  height: Joi.string().trim().required(),
  weight: Joi.string().trim().required(),
  image_url: Joi.string().trim().required(),
});

const UPDATEABLE_FIELDS = [
  { key: "age", aliases: ["age", "Age"] },
  { key: "team", aliases: ["team", "Team"] },
  { key: "position", aliases: ["position", "Position"] },
  { key: "jersey_number", aliases: ["jersey_number", "jerseyNumber", "JerseyNumber"] },
  { key: "preferred_foot", aliases: ["preferred_foot", "preferredFoot", "PreferredFoot"] },
  { key: "height", aliases: ["height", "Height"] },
  { key: "weight", aliases: ["weight", "Weight"] },
  { key: "image_url", aliases: ["image_url", "imageUrl", "ImageUrl"] },
];

function normalizePlayerUpdateInput(data) {
  const d = data ?? {};
  const result = {};
  for (const { key, aliases } of UPDATEABLE_FIELDS) {
    for (const a of aliases) {
      if (d[a] !== undefined && d[a] !== null) {
        result[key] = String(d[a]).trim();
        break;
      }
    }
  }
  return result;
}

const playerUpdateSchema = Joi.object({
  age: Joi.string().trim(),
  team: Joi.string().trim(),
  position: Joi.string().trim(),
  jersey_number: Joi.string().trim(),
  preferred_foot: Joi.string().trim(),
  height: Joi.string().trim(),
  weight: Joi.string().trim(),
  image_url: Joi.string().trim(),
}).min(1);

const STATS_FIELD_MAP = [
  ["appearances", ["appearances"]],
  ["goals", ["goals"]],
  ["assists", ["assists"]],
  ["yellow_cards", ["yellow_cards", "yellowCards"]],
  ["red_cards", ["red_cards", "redCards"]],
  ["minutes_played", ["minutes_played", "minutesPlayed"]],
  ["shots_on_target", ["shots_on_target", "shotsOnTarget"]],
  ["total_shots", ["total_shots", "totalShots"]],
  ["pass_accuracy", ["pass_accuracy", "passAccuracy"]],
  ["dribbles_completed", ["dribbles_completed", "dribblesCompleted"]],
  ["tackles_won", ["tackles_won", "tacklesWon"]],
  ["aerial_duels_won", ["aerial_duels_won", "aerialDuelsWon"]],
  ["saves", ["saves"]],
  ["clean_sheets", ["clean_sheets", "cleanSheets"]],
  ["goals_conceded", ["goals_conceded", "goalsConceded"]],
  ["long_passes", ["long_passes", "longPasses"]],
  ["catches", ["catches"]],
  ["punches", ["punches"]],
];

const ATTR_FIELD_MAP = [
  ["pace", ["pace"]],
  ["shooting", ["shooting"]],
  ["passing", ["passing"]],
  ["dribbling", ["dribbling"]],
  ["defending", ["defending"]],
  ["physical", ["physical"]],
  ["finishing", ["finishing"]],
  ["crossing", ["crossing"]],
  ["long_shots", ["long_shots", "longShots"]],
  ["positioning", ["positioning"]],
  ["diving", ["diving"]],
  ["handling", ["handling"]],
  ["kicking", ["kicking"]],
  ["reflexes", ["reflexes"]],
];

function getVal(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return null;
}

function toNum(val) {
  if (val == null) return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

export function parseStatsForCreate(data) {
  const d = data ?? {};
  const result = {};
  for (const [dbKey, aliases] of STATS_FIELD_MAP) {
    const val = getVal(d, aliases);
    result[dbKey] = dbKey === "pass_accuracy" ? (val != null ? toNum(val) : null) : toNum(val);
  }
  return result;
}

export function parseAttributesForCreate(data) {
  const d = data ?? {};
  const result = {};
  for (const [dbKey, aliases] of ATTR_FIELD_MAP) {
    const val = getVal(d, aliases);
    result[dbKey] = toNum(val);
  }
  return result;
}

export function parseStatsForUpdate(data) {
  const d = data ?? {};
  const result = {};
  for (const [dbKey, aliases] of STATS_FIELD_MAP) {
    const val = getVal(d, aliases);
    if (val !== undefined && val !== null) {
      result[dbKey] = toNum(val);
    }
  }
  return result;
}

export function parseAttributesForUpdate(data) {
  const d = data ?? {};
  const result = {};
  for (const [dbKey, aliases] of ATTR_FIELD_MAP) {
    const val = getVal(d, aliases);
    if (val !== undefined && val !== null) {
      result[dbKey] = toNum(val);
    }
  }
  return result;
}

export function validatePlayerCreate(data) {
  const normalized = normalizePlayerInput(data);
  const { error, value } = playerCreateSchema.validate(normalized);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
}

export function parsePlayerUpdate(data) {
  const normalized = normalizePlayerUpdateInput(data);
  const { error, value } = playerUpdateSchema.validate(normalized);
  if (error) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== "")
  );
}

export function validatePlayerUpdate(data) {
  const result = parsePlayerUpdate(data);
  if (Object.keys(result).length === 0) {
    throw new ValidationError("At least one field is required");
  }
  return result;
}

export function toPlayerResponse(row, stats = null, attributes = null) {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    team: row.team,
    position: row.position,
    jersey_number: row.jersey_number,
    preferred_foot: row.preferred_foot,
    height: row.height,
    weight: row.weight,
    image_url: row.image_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    stats: toPlayerStatsResponse(stats),
    attributes: toPlayerAttributesResponse(attributes),
  };
}

export function toPlayerStatsResponse(row) {
  if (!row) return null;
  return {
    appearances: row.appearances,
    goals: row.goals,
    assists: row.assists,
    yellow_cards: row.yellow_cards,
    red_cards: row.red_cards,
    minutes_played: row.minutes_played,
    shots_on_target: row.shots_on_target,
    total_shots: row.total_shots,
    pass_accuracy: row.pass_accuracy != null ? Number(row.pass_accuracy) : null,
    dribbles_completed: row.dribbles_completed,
    tackles_won: row.tackles_won,
    aerial_duels_won: row.aerial_duels_won,
    saves: row.saves,
    clean_sheets: row.clean_sheets,
    goals_conceded: row.goals_conceded,
    long_passes: row.long_passes,
    catches: row.catches,
    punches: row.punches,
  };
}

export function toPlayerAttributesResponse(row) {
  if (!row) return null;
  return {
    pace: row.pace,
    shooting: row.shooting,
    passing: row.passing,
    dribbling: row.dribbling,
    defending: row.defending,
    physical: row.physical,
    finishing: row.finishing,
    crossing: row.crossing,
    long_shots: row.long_shots,
    positioning: row.positioning,
    diving: row.diving,
    handling: row.handling,
    kicking: row.kicking,
    reflexes: row.reflexes,
  };
}
