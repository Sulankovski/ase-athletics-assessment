from pydantic import BaseModel, ConfigDict
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Player(Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, default="N/A")
    age: Mapped[str] = mapped_column(String(50), default="N/A")
    team: Mapped[str] = mapped_column(String(255), default="N/A")
    position: Mapped[str] = mapped_column(String(100), default="N/A")
    jersey_number: Mapped[str] = mapped_column(String(50), default="N/A")
    preferred_foot: Mapped[str] = mapped_column(String(50), default="N/A")
    height: Mapped[str] = mapped_column(String(50), default="N/A")
    weight: Mapped[str] = mapped_column(String(50), default="N/A")
    image_url: Mapped[str] = mapped_column(String(500), default="N/A")


# Pydantic schema
class PlayerSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    age: str
    team: str
    position: str
    jersey_number: str
    preferred_foot: str
    height: str
    weight: str
    image_url: str
