import validator from "validator";

export function validateUserCreate(data) {
  const { name, email, password } = data;
  if (!name || typeof name !== "string") {
    throw new Error("name is required");
  }
  if (!email || typeof email !== "string") {
    throw new Error("email is required");
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 255) {
    throw new Error("Email is too long");
  }
  if (!validator.isEmail(normalizedEmail)) {
    throw new Error("Invalid email format");
  }
  if (!password || typeof password !== "string") {
    throw new Error("password is required");
  }
  if (password.length < 7) {
    throw new Error("Password must be at least 7 characters");
  }
  if (!/[a-zA-Z]/.test(password)) {
    throw new Error("Password must contain at least one letter");
  }
  if (!/\d/.test(password)) {
    throw new Error("Password must contain at least one number");
  }
  return { name, email: normalizedEmail, password };
}

export function toUserResponse(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    created_at: row.created_at,
  };
}
