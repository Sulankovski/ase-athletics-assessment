from fastapi import APIRouter

from ..middleware.database import get_db_connection
from ..models.player import Player

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("")
async def list_players(limit: int = 10):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, name, age, team, position, jersey_number, preferred_foot, height, weight, image_url
            FROM players
            ORDER BY id
            LIMIT %s
            """,
            (limit,),
        )
        rows = cur.fetchall()
        cur.close()
        players = [Player(**dict(row)) for row in rows]
        return {"players": players}
    finally:
        conn.close()
