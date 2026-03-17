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

export function validatePlayerCreate(data) {
  const normalized = normalizePlayerInput(data);
  const { error, value } = playerCreateSchema.validate(normalized);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
}

export function validatePlayerUpdate(data) {
  const normalized = normalizePlayerUpdateInput(data);
  const { error, value } = playerUpdateSchema.validate(normalized);
  if (error) {
    const msg = error.details[0].message.replace(/"([^"]+)"/g, "$1");
    throw new ValidationError(msg);
  }
  const result = Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== "")
  );
  if (Object.keys(result).length === 0) {
    throw new ValidationError("At least one field is required");
  }
  return result;
}

export function toPlayerResponse(row) {
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
  };
}
