from pydantic import BaseModel


class Player(BaseModel):
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
