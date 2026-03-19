import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import express from "express";
import { initDb } from "./utils/db_init.js";
import { getDb } from "./middleware/database.js";
import { router as authRouter } from "./controllers/auth.js";
import { router as playersRouter } from "./controllers/players.js";
import { router as dashboardRouter } from "./controllers/dashboard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_DIR = join(__dirname, "..");
dotenv.config({ path: join(BACKEND_DIR, ".env") });

const app = express();

const defaultAllowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const configuredAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...configuredAllowedOrigins,
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowedOrigin = !origin || allowedOrigins.has(origin);

  if (isAllowedOrigin && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  if (isAllowedOrigin) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin) {
      return res.status(403).json({ detail: "Origin not allowed by CORS" });
    }
    return res.sendStatus(204);
  }

  if (!isAllowedOrigin) {
    return res.status(403).json({ detail: "Origin not allowed by CORS" });
  }

  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "ASE Athletics API", status: "ok" });
});

app.use("/api/auth", getDb, authRouter);
app.use("/api/players", getDb, playersRouter);
app.use("/api/dashboard", getDb, dashboardRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;
  const detail = err.detail ?? err.message ?? "Internal server error";
  res.status(statusCode).json({ detail });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  await initDb();
});
