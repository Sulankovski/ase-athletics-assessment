CREATE TABLE IF NOT EXISTS player_contracts (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  salary INTEGER,
  contract_end DATE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_player_contracts_player_id ON player_contracts(player_id);

CREATE TRIGGER player_contracts_updated_at_trigger
  AFTER INSERT OR UPDATE ON player_contracts
  FOR EACH ROW
  EXECUTE PROCEDURE update_player_updated_at();
