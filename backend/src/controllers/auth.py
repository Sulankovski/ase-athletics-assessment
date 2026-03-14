from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, OAuth2PasswordRequestForm

from ..middleware.database import get_db_connection
from ..middleware.security import bearer_scheme, oauth2_scheme
from ..models.user import UserCreate, UserResponse
from ..utils.auth_utils import (
    JWT_EXPIRATION_HOURS,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    bearer: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    actual_token = token or (bearer.credentials if bearer else None)
    if not actual_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_access_token(actual_token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    jti = payload.get("jti")
    if not jti:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM tokens WHERE jti = %s AND expires_at > NOW()",
            (jti,),
        )
        if not cur.fetchone():
            cur.close()
            raise HTTPException(status_code=401, detail="Token invalid or expired")
        cur.close()
    finally:
        conn.close()
    return payload


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, email, password_hash, created_at FROM users WHERE email = %s",
            (form_data.username,),
        )
        row = cur.fetchone()
        cur.close()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user = dict(row)
        if not verify_password(form_data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token, jti = create_access_token(
            {"sub": str(user["id"]), "email": user["email"], "name": user["name"]}
        )
        expires_at = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO tokens (jti, user_id, expires_at) VALUES (%s, %s, %s)",
            (jti, user["id"], expires_at),
        )
        conn.commit()
        cur.close()
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user["id"],
                name=user["name"],
                email=user["email"],
                created_at=user["created_at"],
            ),
        }
    finally:
        conn.close()


@router.post("/register", response_model=UserResponse)
def register(data: UserCreate):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM users WHERE email = %s OR name = %s",
            (data.email, data.name),
        )
        if cur.fetchone():
            cur.close()
            raise HTTPException(
                status_code=400,
                detail="A user with this email or name already exists",
            )

        password_hash = hash_password(data.password)
        cur.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING id, name, email, created_at
            """,
            (data.name, data.email, password_hash),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        return UserResponse(**dict(row))
    finally:
        conn.close()


@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    """Invalidate the current token by removing it from the token store."""
    jti = current_user.get("jti")
    if jti:
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM tokens WHERE jti = %s", (jti,))
            conn.commit()
            cur.close()
        finally:
            conn.close()
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = %s",
            (int(current_user["sub"]),),
        )
        row = cur.fetchone()
        cur.close()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse(**dict(row))
    finally:
        conn.close()
