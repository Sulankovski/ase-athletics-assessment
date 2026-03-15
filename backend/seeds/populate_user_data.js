import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { pool } from "../src/middleware/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_DIR = join(__dirname, "..");
const PROJECT_ROOT = join(BACKEND_DIR, "..");
const DATA_PATH = join(PROJECT_ROOT, "data", "players_Data_production.json");

const NA_STR = "N/A";

function getValue(obj, key, defaultVal = NA_STR) {
  const val = obj[key];
  return val == null || val === "" ? defaultVal : String(val);
}

export async function runSeeds() {
  try {
    const client = await pool.connect();
    try {
      const countResult = await client.query("SELECT 1 FROM players LIMIT 1");
      if (countResult.rows.length > 0) {
        console.log("Seeding skipped (table already populated).");
        return;
      }

      let dataPath = DATA_PATH;
      try {
        fs.accessSync(dataPath);
      } catch {
        console.log(`Seed data not found: ${DATA_PATH}`);
        return;
      }

      const raw = fs.readFileSync(dataPath, "utf-8");
      const data = JSON.parse(raw);
      const playersData = data.players || [];
      if (playersData.length === 0) {
        return;
      }

      for (const p of playersData) {
        await client.query(
          `INSERT INTO players (name, age, team, position, jersey_number, preferred_foot, height, weight, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            getValue(p, "name", NA_STR),
            getValue(p, "age", NA_STR),
            getValue(p, "team", NA_STR),
            getValue(p, "position", NA_STR),
            getValue(p, "jerseyNumber", NA_STR),
            getValue(p, "preferredFoot", NA_STR),
            getValue(p, "height", NA_STR),
            getValue(p, "weight", NA_STR),
            getValue(p, "imageUrl", NA_STR),
          ]
        );
      }
      console.log(`Seeding completed. (${playersData.length} players)`);
    } finally {
      client.release();
    }
  } catch (e) {
    console.log(`Seeding skipped (database not available): ${e.message}`);
  }
}
