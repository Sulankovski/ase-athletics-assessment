import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_DIR = join(__dirname, "..", "..");
dotenv.config({ path: join(BACKEND_DIR, ".env") });

const { Pool } = pg;

const DATABASE_URL = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

export const pool = new Pool({ connectionString: DATABASE_URL });

export function getDb(req, res, next) {
  pool.connect((err, client, release) => {
    if (err) {
      return next(err);
    }
    req.db = client;
    req.releaseDb = release;
    res.on("finish", () => release());
    next();
  });
}
