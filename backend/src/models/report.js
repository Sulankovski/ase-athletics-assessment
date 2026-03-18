import Joi from "joi";
import { ValidationError } from "../exceptions/validation.js";

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

export function parseReportForCreate(data) {
  const d = data ?? {};
  const match = d.matchDetails ?? d.match_details ?? {};
  const ratings = d.ratings ?? {};
  return {
    player_name: getVal(d, ["playerName", "player_name"]) ?? null,
    scout_name: getVal(d, ["scoutName", "scout_name"]) ?? "N/A",
    date: getVal(d, ["date"]) ?? null,
    match_opponent: getVal(match, ["opponent"]) ?? null,
    match_competition: getVal(match, ["competition"]) ?? null,
    match_result: getVal(match, ["result"]) ?? null,
    match_minutes_played: toNum(getVal(match, ["minutesPlayed", "minutes_played"])),
    match_position: getVal(match, ["position"]) ?? null,
    rating_technical: toNum(getVal(ratings, ["technical"])),
    rating_physical: toNum(getVal(ratings, ["physical"])),
    rating_mental: toNum(getVal(ratings, ["mental"])),
    rating_tactical: toNum(getVal(ratings, ["tactical"])),
    rating_finishing: toNum(getVal(ratings, ["finishing"])),
    rating_passing: toNum(getVal(ratings, ["passing"])),
    rating_dribbling: toNum(getVal(ratings, ["dribbling"])),
    rating_defending: toNum(getVal(ratings, ["defending"])),
    rating_leadership: toNum(getVal(ratings, ["leadership"])),
    rating_work_rate: toNum(getVal(ratings, ["workRate", "work_rate"])),
    strengths: Array.isArray(d.strengths) ? d.strengths : [],
    weaknesses: Array.isArray(d.weaknesses) ? d.weaknesses : [],
    key_moments: Array.isArray(d.keyMoments) ? d.keyMoments : (Array.isArray(d.key_moments) ? d.key_moments : []),
    overall_rating: toNum(getVal(d, ["overallRating", "overall_rating"])),
    recommendation: getVal(d, ["recommendation"]) ?? null,
    notes: getVal(d, ["notes"]) ?? null,
  };
}

const reportCreateSchema = Joi.object({
  scoutName: Joi.string().trim().required(),
  date: Joi.string().trim().required(),
  playerName: Joi.string().trim(),
  matchDetails: Joi.object({
    opponent: Joi.string().trim(),
    competition: Joi.string().trim(),
    result: Joi.string().trim(),
    minutesPlayed: Joi.number().integer().min(0),
    position: Joi.string().trim(),
  }),
  ratings: Joi.object({
    technical: Joi.number().integer().min(0).max(10),
    physical: Joi.number().integer().min(0).max(10),
    mental: Joi.number().integer().min(0).max(10),
    tactical: Joi.number().integer().min(0).max(10),
    finishing: Joi.number().integer().min(0).max(10),
    passing: Joi.number().integer().min(0).max(10),
    dribbling: Joi.number().integer().min(0).max(10),
    defending: Joi.number().integer().min(0).max(10),
    leadership: Joi.number().integer().min(0).max(10),
    workRate: Joi.number().integer().min(0).max(10),
  }),
  strengths: Joi.array().items(Joi.string()),
  weaknesses: Joi.array().items(Joi.string()),
  keyMoments: Joi.array().items(Joi.string()),
  overallRating: Joi.number().integer().min(0).max(10),
  recommendation: Joi.string().trim(),
  notes: Joi.string().trim(),
});

export function validateReportCreate(data) {
  const normalized = {
    scoutName: data?.scoutName ?? data?.scout_name ?? "",
    date: data?.date ?? "",
    playerName: data?.playerName ?? data?.player_name ?? "",
    matchDetails: data?.matchDetails ?? data?.match_details ?? {},
    ratings: data?.ratings ?? {},
    strengths: data?.strengths ?? [],
    weaknesses: data?.weaknesses ?? [],
    keyMoments: data?.keyMoments ?? data?.key_moments ?? [],
    overallRating: data?.overallRating ?? data?.overall_rating,
    recommendation: data?.recommendation ?? "",
    notes: data?.notes ?? "",
  };
  const { error, value } = reportCreateSchema.validate(normalized, { stripUnknown: true });
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value.date || "").trim())) {
    throw new ValidationError("date must be in YYYY-MM-DD format");
  }
  return value;
}

function formatDateOnly(val) {
  if (val == null) return null;
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.substring(0, 10);
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseJsonArray(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function toReportResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    playerId: row.player_id,
    playerName: row.player_name,
    scoutName: row.scout_name,
    date: formatDateOnly(row.date),
    matchDetails: {
      opponent: row.match_opponent,
      competition: row.match_competition,
      result: row.match_result,
      minutesPlayed: row.match_minutes_played,
      position: row.match_position,
    },
    ratings: {
      technical: row.rating_technical,
      physical: row.rating_physical,
      mental: row.rating_mental,
      tactical: row.rating_tactical,
      finishing: row.rating_finishing,
      passing: row.rating_passing,
      dribbling: row.rating_dribbling,
      defending: row.rating_defending,
      leadership: row.rating_leadership,
      workRate: row.rating_work_rate,
    },
    strengths: parseJsonArray(row.strengths),
    weaknesses: parseJsonArray(row.weaknesses),
    keyMoments: parseJsonArray(row.key_moments),
    overallRating: row.overall_rating,
    recommendation: row.recommendation,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
