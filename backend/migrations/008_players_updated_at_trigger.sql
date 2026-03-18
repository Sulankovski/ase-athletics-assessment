CREATE OR REPLACE FUNCTION update_player_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'players' THEN
    NEW.updated_at = NOW();
    RETURN NEW;
  ELSE
    UPDATE players SET updated_at = NOW() WHERE id = COALESCE(NEW.player_id, OLD.player_id);
    RETURN COALESCE(NEW, OLD);
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS players_updated_at_trigger ON players;
CREATE TRIGGER players_updated_at_trigger
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE PROCEDURE update_player_updated_at();
