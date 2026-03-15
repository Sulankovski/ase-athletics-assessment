import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { pool } from "../middleware/database.js";
import { runSeeds } from "../../seeds/populate_user_data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_DIR = join(__dirname, "..", "..");
const MIGRATIONS_DIR = join(BACKEND_DIR, "migrations");

export async function runMigrations() {
  try {
    const sqlFiles = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
    const client = await pool.connect();
    try {
      for (const sqlFile of sqlFiles) {
        const sqlPath = join(MIGRATIONS_DIR, sqlFile);
        const sql = fs.readFileSync(sqlPath, "utf-8");
        await client.query(sql);
        console.log(`Running migration: ${sqlFile}`);
      }
      console.log("Migrations completed.");
      return true;
    } finally {
      client.release();
    }
  } catch (e) {
    console.log(`Migrations skipped (database not available): ${e.message}`);
    return false;
  }
}

export async function initDb() {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const client = await pool.connect();
      client.release();
      break;
    } catch {
      if (attempt < maxAttempts - 1) {
        console.log(`Waiting for database... (attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        console.log(`Database not available after ${maxAttempts} attempts. Skipping init.`);
        return;
      }
    }
  }

  if (await runMigrations()) {
    await runSeeds();
  }
}
