import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import express from "express";
import { initDb } from "./utils/db_init.js";
import { getDb } from "./middleware/database.js";
import { router as authRouter } from "./controllers/auth.js";
import { router as playersRouter } from "./controllers/players.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_DIR = join(__dirname, "..");
dotenv.config({ path: join(BACKEND_DIR, ".env") });

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "ASE Athletics API", status: "ok" });
});

app.use("/auth", getDb, authRouter);
app.use("/players", getDb, playersRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;
  const detail = err.detail ?? err.message ?? "Internal server error";
  res.status(statusCode).json({ detail });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  await initDb();
});
