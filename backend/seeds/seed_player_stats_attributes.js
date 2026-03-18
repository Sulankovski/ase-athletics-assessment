import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { pool } from "../src/middleware/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_DIR = join(__dirname, "..");
const DATA_PATH = join(BACKEND_DIR, "..", "data", "players_Data_production.json");

const STATS_KEYS = [
  "appearances",
  "goals",
  "assists",
  "yellowCards",
  "redCards",
  "minutesPlayed",
  "shotsOnTarget",
  "totalShots",
  "passAccuracy",
  "dribblesCompleted",
  "tacklesWon",
  "aerialDuelsWon",
  "saves",
  "cleanSheets",
  "goalsConceded",
  "longPasses",
  "catches",
  "punches",
];

const STATS_COLUMNS = [
  "appearances",
  "goals",
  "assists",
  "yellow_cards",
  "red_cards",
  "minutes_played",
  "shots_on_target",
  "total_shots",
  "pass_accuracy",
  "dribbles_completed",
  "tackles_won",
  "aerial_duels_won",
  "saves",
  "clean_sheets",
  "goals_conceded",
  "long_passes",
  "catches",
  "punches",
];

const ATTR_KEYS = [
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physical",
  "finishing",
  "crossing",
  "longShots",
  "positioning",
  "diving",
  "handling",
  "kicking",
  "reflexes",
];

const ATTR_COLUMNS = [
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physical",
  "finishing",
  "crossing",
  "long_shots",
  "positioning",
  "diving",
  "handling",
  "kicking",
  "reflexes",
];

function getStatValue(stats, key) {
  const val = stats[key];
  return val != null ? val : null;
}

function getAttrValue(attrs, key) {
  const val = attrs[key];
  return val != null ? val : null;
}

async function seedPlayerStatsAttributes() {
  const client = await pool.connect();
  try {
    let dataPath = DATA_PATH;
    try {
      fs.accessSync(dataPath);
    } catch {
      dataPath = join(BACKEND_DIR, "data", "players_Data_production.json");
      try {
        fs.accessSync(dataPath);
      } catch {
        console.log(`Seed data not found: ${DATA_PATH}`);
        return false;
      }
    }

    const raw = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(raw);
    const playersData = data.players || [];
    if (playersData.length === 0) {
      return false;
    }

    for (const p of playersData) {
      const playerResult = await client.query(
        "SELECT id FROM players WHERE name = $1 AND team = $2 LIMIT 1",
        [p.name, p.team]
      );
      const playerRow = playerResult.rows[0];
      if (!playerRow) continue;

      const playerId = playerRow.id;
      const stats = p.stats ?? {};
      const attrs = p.attributes ?? {};

      const statsValues = STATS_KEYS.map((k) => getStatValue(stats, k));
      const statsPlaceholders = STATS_COLUMNS.map((_, i) => `$${i + 2}`).join(", ");
      const statsUpdateSet = STATS_COLUMNS.map((c, i) => `${c} = EXCLUDED.${c}`).join(", ");
      await client.query(
        `INSERT INTO player_stats (player_id, ${STATS_COLUMNS.join(", ")}) 
         VALUES ($1, ${statsPlaceholders})
         ON CONFLICT (player_id) DO UPDATE SET ${statsUpdateSet}, updated_at = NOW()`,
        [playerId, ...statsValues]
      );

      const attrValues = ATTR_KEYS.map((k) => getAttrValue(attrs, k));
      const attrPlaceholders = ATTR_COLUMNS.map((_, i) => `$${i + 2}`).join(", ");
      const attrUpdateSet = ATTR_COLUMNS.map((c) => `${c} = EXCLUDED.${c}`).join(", ");
      await client.query(
        `INSERT INTO player_attributes (player_id, ${ATTR_COLUMNS.join(", ")}) 
         VALUES ($1, ${attrPlaceholders})
         ON CONFLICT (player_id) DO UPDATE SET ${attrUpdateSet}, updated_at = NOW()`,
        [playerId, ...attrValues]
      );
    }

    console.log(`Player stats & attributes seeding completed. (${playersData.length} players)`);
    return true;
  } catch (e) {
    console.log(`Player stats & attributes seeding error: ${e.message}`);
    return false;
  } finally {
    client.release();
  }
}

export default seedPlayerStatsAttributes;
