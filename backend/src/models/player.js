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

export function validatePlayerCreate(data) {
  const normalized = normalizePlayerInput(data);
  const { error, value } = playerCreateSchema.validate(normalized);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
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
