function formatDateOnly(val) {
  if (val == null) return null;
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.substring(0, 10);
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTopPerformerItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    position: row.position,
    value: row.value != null ? Number(row.value) : 0,
  };
}

function toAgeDemographicsRow(row) {
  if (!row) return null;
  return {
    team: row.team,
    under_21: row.under_21 ?? 0,
    age_21_25: row.age_21_25 ?? 0,
    age_26_30: row.age_26_30 ?? 0,
    over_30: row.over_30 ?? 0,
  };
}

function toContractExpirationItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    position: row.position,
    contract_end: formatDateOnly(row.contract_end),
    salary: row.salary != null ? Number(row.salary) : null,
  };
}

function toRadarPlayer(row) {
  if (!row) return null;
  const attrs = {};
  const attrKeys = [
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
  for (const k of attrKeys) {
    if (row[k] != null) attrs[k] = Number(row[k]);
  }
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    position: row.position,
    attributes: attrs,
  };
}

export function toDashboardStatsResponse(data) {
  if (!data) return null;
  return {
    summary: {
      total_players: data.summary?.total_players ?? 0,
      average_age: data.summary?.average_age != null ? Number(data.summary.average_age) : null,
    },
    top_performers: {
      goals: (data.top_performers?.goals ?? []).map(toTopPerformerItem),
      assists: (data.top_performers?.assists ?? []).map(toTopPerformerItem),
      pace: (data.top_performers?.pace ?? []).map(toTopPerformerItem),
      salary: (data.top_performers?.salary ?? []).map(toTopPerformerItem),
    },
    distributions: {
      by_team: (data.distributions?.by_team ?? []).map((r) => ({
        team: r.team,
        count: r.count,
      })),
      by_position: (data.distributions?.by_position ?? []).map((r) => ({
        position: r.position,
        count: r.count,
      })),
    },
    goals_by_position: (data.goals_by_position ?? []).map((r) => ({
      position: r.position,
      total_goals: r.total_goals ?? r.total ?? 0,
      player_count: r.player_count ?? 0,
    })),
    assists_by_position: (data.assists_by_position ?? []).map((r) => ({
      position: r.position,
      total_assists: r.total_assists ?? r.total ?? 0,
      player_count: r.player_count ?? 0,
    })),
    age_demographics_by_team: (data.age_demographics_by_team ?? []).map(toAgeDemographicsRow),
    upcoming_contract_expirations: (data.upcoming_contract_expirations ?? []).map(
      toContractExpirationItem
    ),
    radar_comparison: (data.radar_comparison ?? []).map(toRadarPlayer),
    applied_filters: data.applied_filters ?? {},
  };
}
