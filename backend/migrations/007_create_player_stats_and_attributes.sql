CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  appearances INTEGER,
  goals INTEGER,
  assists INTEGER,
  yellow_cards INTEGER,
  red_cards INTEGER,
  minutes_played INTEGER,
  shots_on_target INTEGER,
  total_shots INTEGER,
  pass_accuracy DECIMAL(5, 2),
  dribbles_completed INTEGER,
  tackles_won INTEGER,
  aerial_duels_won INTEGER,
  saves INTEGER,
  clean_sheets INTEGER,
  goals_conceded INTEGER,
  long_passes INTEGER,
  catches INTEGER,
  punches INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_attributes (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  pace INTEGER,
  shooting INTEGER,
  passing INTEGER,
  dribbling INTEGER,
  defending INTEGER,
  physical INTEGER,
  finishing INTEGER,
  crossing INTEGER,
  long_shots INTEGER,
  positioning INTEGER,
  diving INTEGER,
  handling INTEGER,
  kicking INTEGER,
  reflexes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_attributes_player_id ON player_attributes(player_id);

CREATE OR REPLACE FUNCTION update_player_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players SET updated_at = NOW() WHERE id = COALESCE(NEW.player_id, OLD.player_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER player_stats_updated_at_trigger
  AFTER INSERT OR UPDATE ON player_stats
  FOR EACH ROW
  EXECUTE PROCEDURE update_player_updated_at();

CREATE TRIGGER player_attributes_updated_at_trigger
  AFTER INSERT OR UPDATE ON player_attributes
  FOR EACH ROW
  EXECUTE PROCEDURE update_player_updated_at();
