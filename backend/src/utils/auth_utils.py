import os
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
BCRYPT_MAX_BYTES = 72


def _to_bcrypt_input(password: str) -> bytes:
    encoded = password.encode("utf-8")
    return encoded[:BCRYPT_MAX_BYTES] if len(encoded) > BCRYPT_MAX_BYTES else encoded


def hash_password(password: str) -> str:
    pwd_bytes = _to_bcrypt_input(password)
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = _to_bcrypt_input(plain_password)
    return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))


def create_access_token(data: dict) -> tuple[str, str]:
    payload = data.copy()
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload["jti"] = jti
    payload["exp"] = expire
    payload["iat"] = datetime.now(timezone.utc)
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token, jti


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
