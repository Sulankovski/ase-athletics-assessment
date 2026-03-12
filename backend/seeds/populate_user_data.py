import json
import logging
import os
from pathlib import Path

import psycopg2

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_PATH = PROJECT_ROOT / "data" / "players_Data_production.json"

NA_STR = "N/A"


def get_value(obj, key, default=NA_STR):
    val = obj.get(key)
    return default if val is None or val == "" else str(val)


def run_seeds():
    try:
        conn = psycopg2.connect(
            host=os.getenv("PGHOST", "localhost"),
            port=os.getenv("PGPORT", "5432"),
            dbname=os.getenv("PGDATABASE", "user_data"),
            user=os.getenv("PGUSER", "postgres"),
            password=os.getenv("PGPASSWORD", "postgres"),
        )
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM players")
        if cur.fetchone()[0] > 0:
            print("Seeding skipped (table already populated).")
            cur.close()
            conn.close()
            return

        if not DATA_PATH.exists():
            logger.warning("Seed data not found: %s", DATA_PATH)
            cur.close()
            conn.close()
            return

        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        players = data.get("players", [])
        if not players:
            cur.close()
            conn.close()
            return

        insert_sql = """
            INSERT INTO players (name, age, team, position, jersey_number, preferred_foot, height, weight, image_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        for p in players:
            cur.execute(
                insert_sql,
                (
                    get_value(p, "name", NA_STR),
                    get_value(p, "age", NA_STR),
                    get_value(p, "team", NA_STR),
                    get_value(p, "position", NA_STR),
                    get_value(p, "jerseyNumber", NA_STR),
                    get_value(p, "preferredFoot", NA_STR),
                    get_value(p, "height", NA_STR),
                    get_value(p, "weight", NA_STR),
                    get_value(p, "imageUrl", NA_STR),
                ),
            )
        conn.commit()
        cur.close()
        conn.close()
        print(f"Seeding completed. ({len(players)} players)")
    except psycopg2.OperationalError as e:
        print(f"Seeding skipped (database not available): {e}")


if __name__ == "__main__":
    run_seeds()
