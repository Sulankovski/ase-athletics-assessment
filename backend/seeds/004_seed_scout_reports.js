import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { pool } from "../src/middleware/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_DIR = join(__dirname, "..");
const DATA_PATH = join(BACKEND_DIR, "..", "data", "scout_report.json");

function findPlayerByName(playerName, players) {
  if (!playerName || typeof playerName !== "string") return null;
  const nameLower = playerName.toLowerCase().trim();
  const parts = nameLower.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;

  for (const p of players) {
    const dbName = (p.name || "").toLowerCase();
    const allPartsPresent = parts.every((part) => dbName.includes(part));
    if (allPartsPresent) return p;
  }
  return null;
}

function getInt(val) {
  if (val == null) return null;
  const n = Number(val);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function getDate(val) {
  if (!val) return null;
  const s = String(val);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

async function seedScoutReports() {
  const client = await pool.connect();
  try {
    let dataPath = DATA_PATH;
    try {
      fs.accessSync(dataPath);
    } catch {
      console.log(`Seed data not found: ${DATA_PATH}`);
      return false;
    }

    const raw = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(raw);
    const reports = data.scoutingReports || [];
    if (reports.length === 0) {
      console.log("No scouting reports found in JSON.");
      return false;
    }

    const playersResult = await client.query("SELECT id, name FROM players");
    const players = playersResult.rows;

    let inserted = 0;
    let skipped = 0;

    for (const r of reports) {
      const playerName = r.playerName || "";
      const player = findPlayerByName(playerName, players);
      if (!player) {
        skipped++;
        continue;
      }

      const match = r.matchDetails || {};
      const ratings = r.ratings || {};

      await client.query(
        `INSERT INTO reports (
          player_id, player_name, scout_name, date,
          match_opponent, match_competition, match_result, match_minutes_played, match_position,
          rating_technical, rating_physical, rating_mental, rating_tactical,
          rating_finishing, rating_passing, rating_dribbling, rating_defending,
          rating_leadership, rating_work_rate,
          strengths, weaknesses, key_moments,
          overall_rating, recommendation, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
        [
          player.id,
          playerName,
          r.scoutName || "N/A",
          getDate(r.date),
          match.opponent ?? null,
          match.competition ?? null,
          match.result ?? null,
          getInt(match.minutesPlayed),
          match.position ?? null,
          getInt(ratings.technical),
          getInt(ratings.physical),
          getInt(ratings.mental),
          getInt(ratings.tactical),
          getInt(ratings.finishing),
          getInt(ratings.passing),
          getInt(ratings.dribbling),
          getInt(ratings.defending),
          getInt(ratings.leadership),
          getInt(ratings.workRate),
          JSON.stringify(r.strengths || []),
          JSON.stringify(r.weaknesses || []),
          JSON.stringify(r.keyMoments || []),
          getInt(r.overallRating),
          r.recommendation ?? null,
          r.notes ?? null,
        ]
      );
      inserted++;
    }

    console.log(
      `Scout reports seed completed: ${inserted} inserted, ${skipped} skipped (no matching player).`
    );
    return true;
  } catch (err) {
    console.error("Scout reports seed error:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default seedScoutReports;
