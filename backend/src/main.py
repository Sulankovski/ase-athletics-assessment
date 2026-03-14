from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from contextlib import asynccontextmanager

from fastapi import FastAPI

from .controllers import auth, players
from .utils.db_init import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="ASE Athletics API", version="1.0.0", lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "ASE Athletics API", "status": "ok"}


app.include_router(auth.router)
app.include_router(players.router)
