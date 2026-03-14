from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..exceptions.auth import (
    InvalidCredentialsError,
    TokenInvalidOrExpiredError,
    UserAlreadyExistsError,
    UserNotFoundError,
)
from ..middleware.database import get_db
from ..middleware.security import bearer_scheme, oauth2_scheme
from ..models.user import Token, User, UserCreate, UserResponse
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
    db: Session = Depends(get_db),
):
    actual_token = token or (bearer.credentials if bearer else None)
    if not actual_token:
        raise TokenInvalidOrExpiredError("Not authenticated")
    payload = decode_access_token(actual_token)
    if payload is None:
        raise TokenInvalidOrExpiredError("Invalid or expired token")
    jti = payload.get("jti")
    if not jti:
        raise TokenInvalidOrExpiredError("Invalid token")
    stmt = select(Token).where(Token.jti == jti, Token.expires_at > datetime.now(timezone.utc))
    if db.scalar(stmt) is None:
        raise TokenInvalidOrExpiredError("Token invalid or expired")
    return payload


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    stmt = select(User).where(User.email == form_data.username)
    user = db.scalar(stmt)
    if not user:
        raise InvalidCredentialsError()
    if not verify_password(form_data.password, user.password_hash):
        raise InvalidCredentialsError()

    token, jti = create_access_token(
        {"sub": str(user.id), "email": user.email, "name": user.name}
    )
    expires_at = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    db.add(Token(jti=jti, user_id=user.id, expires_at=expires_at))
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/register", response_model=UserResponse)
def register(data: UserCreate, db: Session = Depends(get_db)):
    stmt = select(User).where(User.email == data.email)
    if db.scalar(stmt):
        raise UserAlreadyExistsError()

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    jti = current_user.get("jti")
    if jti:
        stmt = select(Token).where(Token.jti == jti)
        token_row = db.scalar(stmt)
        if token_row:
            db.delete(token_row)
            db.commit()
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(User).where(User.id == int(current_user["sub"]))
    user = db.scalar(stmt)
    if not user:
        raise UserNotFoundError()
    return UserResponse.model_validate(user)
