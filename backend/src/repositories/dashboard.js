const TOP_N = 5;
const CONTRACT_EXPIRY_MONTHS = 12;

function buildFilterClause(filters) {
  const conditions = ["p.id IS NOT NULL"];
  const params = [];
  let idx = 1;

  if (filters.team != null && String(filters.team).trim() !== "") {
    conditions.push(`p.team = $${idx++}`);
    params.push(String(filters.team).trim());
  }
  if (filters.position != null && String(filters.position).trim() !== "") {
    conditions.push(`p.position = $${idx++}`);
    params.push(String(filters.position).trim());
  }
  if (filters.age_min != null && !Number.isNaN(Number(filters.age_min))) {
    conditions.push(`(p.age ~ '^\\d+$' AND NULLIF(TRIM(p.age), '')::int >= $${idx++})`);
    params.push(Number(filters.age_min));
  }
  if (filters.age_max != null && !Number.isNaN(Number(filters.age_max))) {
    conditions.push(`(p.age ~ '^\\d+$' AND NULLIF(TRIM(p.age), '')::int <= $${idx++})`);
    params.push(Number(filters.age_max));
  }

  return { whereClause: conditions.join(" AND "), params };
}

export async function getSummary(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  const result = await db.query(
    `SELECT
       COUNT(*)::int AS total_players,
       ROUND(AVG(CASE WHEN p.age ~ '^\\d+$' THEN NULLIF(TRIM(p.age), '')::int END), 2)::float AS average_age
     FROM players p
     WHERE ${whereClause}`,
    params
  );
  return result.rows[0];
}

export async function getTopPerformersByGoals(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  params.push(TOP_N);
  const result = await db.query(
    `SELECT p.id, p.name, p.team, p.position, COALESCE(ps.goals, 0) AS value
     FROM players p
     LEFT JOIN player_stats ps ON ps.player_id = p.id
     WHERE ${whereClause}
     ORDER BY COALESCE(ps.goals, 0) DESC NULLS LAST, p.id
     LIMIT $${params.length}`,
    params
  );
  return result.rows;
}

export async function getTopPerformersByAssists(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  params.push(TOP_N);
  const result = await db.query(
    `SELECT p.id, p.name, p.team, p.position, COALESCE(ps.assists, 0) AS value
     FROM players p
     LEFT JOIN player_stats ps ON ps.player_id = p.id
     WHERE ${whereClause}
     ORDER BY COALESCE(ps.assists, 0) DESC NULLS LAST, p.id
     LIMIT $${params.length}`,
    params
  );
  return result.rows;
}

export async function getTopPerformersByPace(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  params.push(TOP_N);
  const result = await db.query(
    `SELECT p.id, p.name, p.team, p.position, COALESCE(pa.pace, 0) AS value
     FROM players p
     LEFT JOIN player_attributes pa ON pa.player_id = p.id
     WHERE ${whereClause}
     ORDER BY COALESCE(pa.pace, 0) DESC NULLS LAST, p.id
     LIMIT $${params.length}`,
    params
  );
  return result.rows;
}

export async function getTopPerformersBySalary(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  params.push(TOP_N);
  const result = await db.query(
    `SELECT p.id, p.name, p.team, p.position, COALESCE(pc.salary, 0) AS value
     FROM players p
     LEFT JOIN player_contracts pc ON pc.player_id = p.id
     WHERE ${whereClause}
     ORDER BY COALESCE(pc.salary, 0) DESC NULLS LAST, p.id
     LIMIT $${params.length}`,
    params
  );
  return result.rows;
}

export async function getDistributionByTeam(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  const result = await db.query(
    `SELECT p.team AS team, COUNT(*)::int AS count
     FROM players p
     WHERE ${whereClause}
     GROUP BY p.team
     ORDER BY count DESC`,
    params
  );
  return result.rows;
}

export async function getDistributionByPosition(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  const result = await db.query(
    `SELECT p.position AS position, COUNT(*)::int AS count
     FROM players p
     WHERE ${whereClause}
     GROUP BY p.position
     ORDER BY count DESC`,
    params
  );
  return result.rows;
}

export async function getGoalsByPosition(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  const result = await db.query(
    `SELECT p.position, COALESCE(SUM(ps.goals), 0)::int AS total_goals, COUNT(p.id)::int AS player_count
     FROM players p
     LEFT JOIN player_stats ps ON ps.player_id = p.id
     WHERE ${whereClause}
     GROUP BY p.position
     ORDER BY total_goals DESC`,
    params
  );
  return result.rows;
}

export async function getAssistsByPosition(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  const result = await db.query(
    `SELECT p.position, COALESCE(SUM(ps.assists), 0)::int AS total_assists, COUNT(p.id)::int AS player_count
     FROM players p
     LEFT JOIN player_stats ps ON ps.player_id = p.id
     WHERE ${whereClause}
     GROUP BY p.position
     ORDER BY total_assists DESC`,
    params
  );
  return result.rows;
}

export async function getAgeDemographicsByTeam(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  const result = await db.query(
    `SELECT p.team,
       COUNT(*) FILTER (WHERE p.age ~ '^\\d+$' AND NULLIF(TRIM(p.age), '')::int < 21)::int AS under_21,
       COUNT(*) FILTER (WHERE p.age ~ '^\\d+$' AND NULLIF(TRIM(p.age), '')::int BETWEEN 21 AND 25)::int AS age_21_25,
       COUNT(*) FILTER (WHERE p.age ~ '^\\d+$' AND NULLIF(TRIM(p.age), '')::int BETWEEN 26 AND 30)::int AS age_26_30,
       COUNT(*) FILTER (WHERE p.age ~ '^\\d+$' AND NULLIF(TRIM(p.age), '')::int > 30)::int AS over_30
     FROM players p
     WHERE ${whereClause}
     GROUP BY p.team
     ORDER BY p.team`,
    params
  );
  return result.rows;
}

export async function getUpcomingContractExpirations(filters, db) {
  const { whereClause, params } = buildFilterClause(filters);
  params.push(CONTRACT_EXPIRY_MONTHS);
  const monthsParamIdx = params.length;
  const result = await db.query(
    `SELECT p.id, p.name, p.team, p.position, pc.contract_end, pc.salary
     FROM players p
     INNER JOIN player_contracts pc ON pc.player_id = p.id
     WHERE ${whereClause}
       AND pc.contract_end IS NOT NULL
       AND pc.contract_end <= CURRENT_DATE + (interval '1 month' * $${monthsParamIdx})
       AND pc.contract_end >= CURRENT_DATE
     ORDER BY pc.contract_end ASC
     LIMIT 20`,
    params
  );
  return result.rows;
}

export async function getTopPlayersForRadar(filters, limit, db) {
  const { whereClause, params } = buildFilterClause(filters);
  params.push(limit ?? 5);
  const result = await db.query(
    `SELECT p.id, p.name, p.team, p.position,
       pa.pace, pa.shooting, pa.passing, pa.dribbling, pa.defending, pa.physical,
       pa.finishing, pa.crossing, pa.long_shots, pa.positioning,
       pa.diving, pa.handling, pa.kicking, pa.reflexes
     FROM players p
     LEFT JOIN player_attributes pa ON pa.player_id = p.id
     WHERE ${whereClause}
     ORDER BY COALESCE(pa.pace, 0) + COALESCE(pa.shooting, 0) + COALESCE(pa.passing, 0) DESC NULLS LAST
     LIMIT $${params.length}`,
    params
  );
  return result.rows;
}
