import logging
import os
import time
from pathlib import Path

from sqlalchemy import text

from backend.seeds.populate_user_data import run_seeds

from ..middleware.database import engine

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
MIGRATIONS_DIR = BACKEND_DIR / "migrations"


def run_migrations() -> bool:
    try:
        with engine.begin() as conn:
            for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
                logger.info("Running migration: %s", sql_file.name)
                conn.execute(text(sql_file.read_text()))
        print("Migrations completed.")
        return True
    except Exception as e:
        print(f"Migrations skipped (database not available): {e}")
        return False


def init_db():
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            with engine.connect():
                break
        except Exception:
            if attempt < max_attempts - 1:
                logger.info("Waiting for database... (attempt %d/%d)", attempt + 1, max_attempts)
                time.sleep(2)
            else:
                logger.warning("Database not available after %d attempts. Skipping init.", max_attempts)
                return

    if run_migrations():
        run_seeds()
