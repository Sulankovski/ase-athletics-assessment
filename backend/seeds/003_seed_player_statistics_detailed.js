import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { pool } from "../src/middleware/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKEND_DIR = join(__dirname, "..");
const DATA_PATH = join(BACKEND_DIR, "..", "data", "player_statistics_detailed.json");

const NA_STR = "N/A";

/**
 * Find existing player in DB by matching fullName.
 * For each existing player name in DB, split on " " and check if ALL parts
 * are present in the incoming fullName. If yes -> same player.
 * @param {string} fullName - fullName from JSON (e.g. "Alessandro Rodriguez Mendez")
 * @param {{ id: number, name: string }[]} existingPlayers - rows from players table
 * @returns {{ id: number, name: string } | null} matching player or null
 */
function findExistingPlayer(fullName, existingPlayers) {
  if (!fullName || typeof fullName !== "string") return null;
  const fullNameLower = fullName.toLowerCase().trim();

  for (const row of existingPlayers) {
    const dbName = row.name;
    if (!dbName || typeof dbName !== "string") continue;
    const parts = dbName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) continue;

    const allPartsPresent = parts.every((part) =>
      fullNameLower.includes(part.toLowerCase())
    );
    if (allPartsPresent) return row;
  }
  return null;
}

function getValue(val, defaultVal = null) {
  return val == null || val === "" ? defaultVal : val;
}

function getStr(val, defaultVal = NA_STR) {
  const v = getValue(val);
  return v == null ? defaultVal : String(v);
}

function getInt(val) {
  const v = getValue(val);
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function getDecimal(val) {
  const v = getValue(val);
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getDate(val) {
  const v = getValue(val);
  if (!v) return null;
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

function toInitials(nameStr) {
  if (!nameStr || typeof nameStr !== "string") return NA_STR;
  const parts = nameStr.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return NA_STR;
  if (parts.length === 1) {
    const c = parts[0][0];
    return c ? c.toUpperCase() : NA_STR;
  }
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first && last) ? (first.toUpperCase() + last.toUpperCase()) : NA_STR;
}

function extractPlayersFromJson(data) {
  const schema = data?.playerDataSchema;
  if (!schema || typeof schema !== "object") return [];

  const players = [];
  for (const key of Object.keys(schema)) {
    if (!/^PL\d+$/.test(key)) continue;
    const playerData = schema[key];
    if (!playerData || typeof playerData !== "object") continue;
    players.push(playerData);
  }
  return players;
}

function mapToPlayerRow(p) {
  const basic = p.basicInfo || {};
  const club = p.clubInfo || {};
  const market = p.marketData || {};
  const marketValue = market.currentMarketValue != null
    ? String(market.currentMarketValue)
    : NA_STR;
  return {
    name: getStr(basic.fullName || basic.name),
    age: getStr(basic.age),
    team: getStr(club.currentTeam),
    position: getStr(club.position),
    jersey_number: getStr(club.jerseyNumber),
    preferred_foot: getStr(basic.preferredFoot),
    height: getStr(basic.height),
    weight: getStr(basic.weight),
    image_url: basic.profileImage
      ? getStr(basic.profileImage)
      : toInitials(basic.displayName || basic.fullName || basic.name),
    market_value: marketValue,
  };
}

function mapToPlayerStatsRow(playerId, p) {
  const basic = p.seasonStats?.basicStats || {};
  const adv = p.seasonStats?.advancedStats || {};
  const shoot = adv.shootingMetrics || {};
  const pass = adv.passingMetrics || {};
  const tech = adv.technicalMetrics || {};
  const def = adv.defensiveMetrics || {};
  const gk = p.seasonStats?.advancedStats?.goalkeepingStats;

  const aerialTotal = getInt(def.aerialDuels);
  const aerialPct = getDecimal(def.aerialDuelSuccess);
  const aerialWon =
    aerialTotal != null && aerialPct != null
      ? Math.round(aerialTotal * (aerialPct / 100))
      : getInt(def.aerialDuels);

  return {
    player_id: playerId,
    appearances: getInt(basic.appearances),
    goals: getInt(basic.goals),
    assists: getInt(basic.assists),
    yellow_cards: getInt(basic.yellowCards),
    red_cards: getInt(basic.redCards),
    minutes_played: getInt(basic.minutesPlayed),
    shots_on_target: getInt(shoot.shotsOnTarget),
    total_shots: getInt(shoot.totalShots),
    pass_accuracy: getDecimal(pass.passAccuracy),
    dribbles_completed: getInt(tech.dribbles),
    tackles_won: getInt(def.tacklesWon),
    aerial_duels_won: aerialWon,
    saves: getInt(gk?.saves),
    clean_sheets: getInt(basic.cleanSheets ?? gk?.cleanSheets),
    goals_conceded: getInt(gk?.goalsConceded),
    long_passes: getInt(pass.longPasses),
    catches: null,
    punches: null,
  };
}

function mapToPlayerAttributesRow(playerId, p) {
  const scout = p.scoutingNotes?.attributes || {};
  const tech = scout.technical || {};
  const detailed = scout.detailed || {};
  const gk = scout.goalkeeper || {};

  return {
    player_id: playerId,
    pace: getInt(tech.pace),
    shooting: getInt(tech.shooting),
    passing: getInt(tech.passing),
    dribbling: getInt(tech.dribbling),
    defending: getInt(tech.defending),
    physical: getInt(tech.physical),
    finishing: getInt(detailed.finishing),
    crossing: getInt(detailed.crossing),
    long_shots: getInt(detailed.longShots),
    positioning: getInt(detailed.positioning ?? gk.positioning),
    diving: getInt(gk.diving),
    handling: getInt(gk.handling),
    kicking: getInt(gk.kicking),
    reflexes: getInt(gk.reflexes),
  };
}

function mapToContractRow(playerId, p) {
  const contract = p.contractInfo || {};
  const salary = contract.salary || {};
  const annual = getInt(salary.annualSalary);
  const weekly = getInt(salary.weeklyWage);
  const salaryValue = annual ?? (weekly != null ? weekly * 52 : null);

  return {
    player_id: playerId,
    salary: salaryValue,
    contract_end: getDate(contract.contractEnd),
  };
}

async function seedPlayerStatisticsDetailed() {
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
    const playersFromJson = extractPlayersFromJson(data);
    if (playersFromJson.length === 0) {
      console.log("No player records found in JSON.");
      return false;
    }

    const existingResult = await client.query(
      "SELECT id, name FROM players"
    );
    const existingPlayers = [...existingResult.rows];

    let inserted = 0;
    let updated = 0;

    for (const p of playersFromJson) {
      const basic = p.basicInfo || {};
      const fullName = basic.fullName || basic.name || "";
      const market = p.marketData || {};
      const marketValue = market.currentMarketValue != null
        ? String(market.currentMarketValue)
        : NA_STR;

      const existingPlayer = findExistingPlayer(fullName, existingPlayers);
      if (existingPlayer) {
        await client.query(
          "UPDATE players SET market_value = $1 WHERE id = $2",
          [marketValue, existingPlayer.id]
        );
        updated++;
        continue;
      }

      const playerRow = mapToPlayerRow(p);
      const insertPlayer = await client.query(
        `INSERT INTO players (name, age, team, position, jersey_number, preferred_foot, height, weight, image_url, market_value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          playerRow.name,
          playerRow.age,
          playerRow.team,
          playerRow.position,
          playerRow.jersey_number,
          playerRow.preferred_foot,
          playerRow.height,
          playerRow.weight,
          playerRow.image_url,
          playerRow.market_value,
        ]
      );
      const playerId = insertPlayer.rows[0].id;
      existingPlayers.push({ id: playerId, name: playerRow.name });

      const statsRow = mapToPlayerStatsRow(playerId, p);
      await client.query(
        `INSERT INTO player_stats (
          player_id, appearances, goals, assists, yellow_cards, red_cards,
          minutes_played, shots_on_target, total_shots, pass_accuracy,
          dribbles_completed, tackles_won, aerial_duels_won, saves, clean_sheets,
          goals_conceded, long_passes, catches, punches
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          statsRow.player_id,
          statsRow.appearances,
          statsRow.goals,
          statsRow.assists,
          statsRow.yellow_cards,
          statsRow.red_cards,
          statsRow.minutes_played,
          statsRow.shots_on_target,
          statsRow.total_shots,
          statsRow.pass_accuracy,
          statsRow.dribbles_completed,
          statsRow.tackles_won,
          statsRow.aerial_duels_won,
          statsRow.saves,
          statsRow.clean_sheets,
          statsRow.goals_conceded,
          statsRow.long_passes,
          statsRow.catches,
          statsRow.punches,
        ]
      );

      const attrRow = mapToPlayerAttributesRow(playerId, p);
      await client.query(
        `INSERT INTO player_attributes (
          player_id, pace, shooting, passing, dribbling, defending, physical,
          finishing, crossing, long_shots, positioning, diving, handling, kicking, reflexes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          attrRow.player_id,
          attrRow.pace,
          attrRow.shooting,
          attrRow.passing,
          attrRow.dribbling,
          attrRow.defending,
          attrRow.physical,
          attrRow.finishing,
          attrRow.crossing,
          attrRow.long_shots,
          attrRow.positioning,
          attrRow.diving,
          attrRow.handling,
          attrRow.kicking,
          attrRow.reflexes,
        ]
      );

      const contractRow = mapToContractRow(playerId, p);
      await client.query(
        `INSERT INTO player_contracts (player_id, salary, contract_end)
         VALUES ($1, $2, $3)`,
        [
          contractRow.player_id,
          contractRow.salary,
          contractRow.contract_end,
        ]
      );

      inserted++;
    }

    console.log(
      `Seed completed: ${inserted} players inserted, ${updated} market values updated.`
    );
    return true;
  } catch (err) {
    console.error("Seed error:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default seedPlayerStatisticsDetailed;
