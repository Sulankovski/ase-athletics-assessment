import logging
import os
import time
from pathlib import Path
from backend.seeds.populate_user_data import run_seeds

import psycopg2

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
MIGRATIONS_DIR = BACKEND_DIR / "migrations"


def _get_connection():
    return psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        port=os.getenv("PGPORT", "5432"),
        dbname=os.getenv("PGDATABASE", "user_data"),
        user=os.getenv("PGUSER", "postgres"),
        password=os.getenv("PGPASSWORD", "postgres"),
    )


def run_migrations() -> bool:
    try:
        conn = _get_connection()
        conn.autocommit = True
        cur = conn.cursor()
        for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
            logger.info("Running migration: %s", sql_file.name)
            cur.execute(sql_file.read_text())
        cur.close()
        conn.close()
        print("Migrations completed.")
        return True
    except psycopg2.OperationalError as e:
        print(f"Migrations skipped (database not available): {e}")
        return False


def init_db():
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            conn = _get_connection()
            conn.close()
            break
        except psycopg2.OperationalError:
            if attempt < max_attempts - 1:
                logger.info("Waiting for database... (attempt %d/%d)", attempt + 1, max_attempts)
                time.sleep(2)
            else:
                logger.warning("Database not available after %d attempts. Skipping init.", max_attempts)
                return

    if run_migrations():

        run_seeds()
