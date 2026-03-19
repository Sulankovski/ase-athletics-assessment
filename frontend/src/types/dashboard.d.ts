/** JSDoc / TS types for dashboard API response */

export interface TopPerformer {
  id: number;
  name: string;
  team: string;
  position: string;
  value: number;
}

export interface TeamCount {
  team: string;
  count: number;
}

export interface PositionCount {
  position: string;
  count: number;
}

export interface GoalsByPosition {
  position: string;
  total_goals: number;
  player_count: number;
}

export interface AssistsByPosition {
  position: string;
  total_assists: number;
  player_count: number;
}

export interface AgeTeamRow {
  team: string;
  under_21: number;
  age_21_25: number;
  age_26_30: number;
  over_30: number;
}

export interface ContractRow {
  id: number;
  name: string;
  team: string;
  position: string;
  contract_end: string;
  salary: number;
}

export interface RadarPlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  attributes: Record<string, number>;
}

export interface DashboardStats {
  summary: {
    total_players: number;
    average_age: number;
  };
  top_performers: {
    goals: TopPerformer[];
    assists: TopPerformer[];
    pace: TopPerformer[];
    salary: TopPerformer[];
  };
  distributions: {
    by_team: TeamCount[];
    by_position: PositionCount[];
  };
  goals_by_position: GoalsByPosition[];
  assists_by_position: AssistsByPosition[];
  age_demographics_by_team: AgeTeamRow[];
  upcoming_contract_expirations: ContractRow[];
  radar_comparison: RadarPlayer[];
  applied_filters?: Record<string, unknown>;
}
