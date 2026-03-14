import json
import logging
from pathlib import Path

from sqlalchemy import select

from backend.src.middleware.database import SessionLocal
from backend.src.models.player import Player

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
        db = SessionLocal()
        try:
            if db.scalar(select(Player).limit(1)):
                print("Seeding skipped (table already populated).")
                return

            if not DATA_PATH.exists():
                logger.warning("Seed data not found: %s", DATA_PATH)
                return

            with open(DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)

            players_data = data.get("players", [])
            if not players_data:
                return

            for p in players_data:
                db.add(
                    Player(
                        name=get_value(p, "name", NA_STR),
                        age=get_value(p, "age", NA_STR),
                        team=get_value(p, "team", NA_STR),
                        position=get_value(p, "position", NA_STR),
                        jersey_number=get_value(p, "jerseyNumber", NA_STR),
                        preferred_foot=get_value(p, "preferredFoot", NA_STR),
                        height=get_value(p, "height", NA_STR),
                        weight=get_value(p, "weight", NA_STR),
                        image_url=get_value(p, "imageUrl", NA_STR),
                    )
                )
            db.commit()
            print(f"Seeding completed. ({len(players_data)} players)")
        finally:
            db.close()
    except Exception as e:
        print(f"Seeding skipped (database not available): {e}")
