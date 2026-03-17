import Joi from "joi";
import { ValidationError } from "../exceptions/validation.js";

function normalizeUserInput(data) {
  const d = data ?? {};
  return {
    name: d.name ?? d.Name,
    email: d.email ?? d.Email,
    password: d.password ?? d.Password,
  };
}

const userCreateSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().max(255).lowercase().trim().required(),
  password: Joi.string()
    .min(7)
    .pattern(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
    .required()
    .messages({
      "string.min": "Password must be at least 7 characters",
      "string.pattern.base": "Password must contain at least one letter and one number",
    }),
});

export function validateUserCreate(data) {
  const normalized = normalizeUserInput(data);
  const { error, value } = userCreateSchema.validate(normalized, { abortEarly: false });
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
}

export function toUserResponse(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    created_at: row.created_at,
  };
}
