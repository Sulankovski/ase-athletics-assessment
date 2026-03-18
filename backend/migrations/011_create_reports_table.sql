CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player_name VARCHAR(255) NOT NULL,
  scout_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  match_opponent VARCHAR(255),
  match_competition VARCHAR(255),
  match_result VARCHAR(255),
  match_minutes_played INTEGER,
  match_position VARCHAR(255),
  rating_technical INTEGER,
  rating_physical INTEGER,
  rating_mental INTEGER,
  rating_tactical INTEGER,
  rating_finishing INTEGER,
  rating_passing INTEGER,
  rating_dribbling INTEGER,
  rating_defending INTEGER,
  rating_leadership INTEGER,
  rating_work_rate INTEGER,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  key_moments JSONB DEFAULT '[]',
  overall_rating INTEGER,
  recommendation TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_player_id ON reports(player_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);
