import * as dashboardRepo from "../repositories/dashboard.js";
import { toDashboardStatsResponse } from "../models/dashboard.js";

function parseFilters(query) {
  const filters = {};
  if (query?.team != null && String(query.team).trim() !== "") {
    filters.team = String(query.team).trim();
  }
  if (query?.position != null && String(query.position).trim() !== "") {
    filters.position = String(query.position).trim();
  }
  const ageMin = query?.age_min ?? query?.ageMin;
  const ageMax = query?.age_max ?? query?.ageMax;
  if (ageMin != null && !Number.isNaN(Number(ageMin))) {
    filters.age_min = Number(ageMin);
  }
  if (ageMax != null && !Number.isNaN(Number(ageMax))) {
    filters.age_max = Number(ageMax);
  }
  return filters;
}

export async function getDashboardStats(query, db) {
  const filters = parseFilters(query);

  const [
    summary,
    topGoals,
    topAssists,
    topPace,
    topSalary,
    byTeam,
    byPosition,
    goalsByPosition,
    assistsByPosition,
    ageDemographics,
    contractExpirations,
    radarPlayers,
  ] = await Promise.all([
    dashboardRepo.getSummary(filters, db),
    dashboardRepo.getTopPerformersByGoals(filters, db),
    dashboardRepo.getTopPerformersByAssists(filters, db),
    dashboardRepo.getTopPerformersByPace(filters, db),
    dashboardRepo.getTopPerformersBySalary(filters, db),
    dashboardRepo.getDistributionByTeam(filters, db),
    dashboardRepo.getDistributionByPosition(filters, db),
    dashboardRepo.getGoalsByPosition(filters, db),
    dashboardRepo.getAssistsByPosition(filters, db),
    dashboardRepo.getAgeDemographicsByTeam(filters, db),
    dashboardRepo.getUpcomingContractExpirations(filters, db),
    dashboardRepo.getTopPlayersForRadar(filters, 5, db),
  ]);

  const raw = {
    summary: { total_players: summary?.total_players, average_age: summary?.average_age },
    top_performers: {
      goals: topGoals,
      assists: topAssists,
      pace: topPace,
      salary: topSalary,
    },
    distributions: { by_team: byTeam, by_position: byPosition },
    goals_by_position: goalsByPosition,
    assists_by_position: assistsByPosition,
    age_demographics_by_team: ageDemographics,
    upcoming_contract_expirations: contractExpirations,
    radar_comparison: radarPlayers,
    applied_filters: filters,
  };

  return toDashboardStatsResponse(raw);
}
