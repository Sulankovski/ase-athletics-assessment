import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { pool } from "../middleware/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_DIR = join(__dirname, "..", "..");
const MIGRATIONS_DIR = join(BACKEND_DIR, "migrations");
const SEEDS_DIR = join(BACKEND_DIR, "seeds");

export async function runMigrations() {
  try {
    const sqlFiles = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations_run (
          filename VARCHAR(255) PRIMARY KEY
        );
      `);

      for (const sqlFile of sqlFiles) {
        const existsResult = await client.query(
          "SELECT 1 FROM migrations_run WHERE filename = $1",
          [sqlFile]
        );
        if (existsResult.rows.length > 0) {
          console.log(`Skipping migration (already run): ${sqlFile}`);
          continue;
        }

        const sqlPath = join(MIGRATIONS_DIR, sqlFile);
        const sql = fs.readFileSync(sqlPath, "utf-8");
        await client.query(sql);
        await client.query("INSERT INTO migrations_run (filename) VALUES ($1)", [sqlFile]);
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

export async function runSeeds() {
  try {
    const seedFiles = fs.readdirSync(SEEDS_DIR).filter((f) => f.endsWith(".js")).sort();
    const client = await pool.connect();
    try {
      for (const seedFile of seedFiles) {
        const existsResult = await client.query(
          "SELECT 1 FROM seeds_run WHERE script_name = $1",
          [seedFile]
        );
        if (existsResult.rows.length > 0) {
          console.log(`Seeding skipped (already run): ${seedFile}`);
          continue;
        }

        const seedPath = join(SEEDS_DIR, seedFile);
        const mod = await import(pathToFileURL(seedPath).href);
        const run = mod.default ?? mod.run;
        if (typeof run !== "function") {
          console.log(`Seeding skipped (no default/run export): ${seedFile}`);
          continue;
        }

        const success = await run();
        if (success) {
          await client.query("INSERT INTO seeds_run (script_name) VALUES ($1)", [seedFile]);
          console.log(`Seeding completed: ${seedFile}`);
        }
      }
    } finally {
      client.release();
    }
  } catch (e) {
    console.log(`Seeding error: ${e.message}`);
  }
}

export async function initDb() {
  // When Docker Postgres starts slower than Node, avoid crashing: retry connect, then migrate/seed.
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

  await runMigrations();
  await runSeeds();
}
