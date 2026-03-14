from fastapi import APIRouter, Depends

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..middleware.database import get_db
from ..models.player import Player, PlayerSchema

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("")
def list_players(limit: int = 10, db: Session = Depends(get_db)):
    stmt = select(Player).order_by(Player.id).limit(limit)
    rows = db.scalars(stmt).all()
    return {"players": [PlayerSchema.model_validate(p) for p in rows]}
