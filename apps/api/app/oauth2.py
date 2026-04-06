from datetime import datetime, timedelta, timezone
from uuid import UUID
import jwt
from jwt import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .config import settings
from .schemas import user
from app.models import user as user_models
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    if "user_id" in to_encode and isinstance(to_encode["user_id"], UUID):
        to_encode["user_id"] = str(to_encode["user_id"])
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def verify_access_token(
    token: str, credentials_exception: HTTPException
) -> user.TokenData:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        return user.TokenData(id=UUID(user_id))
    except (InvalidTokenError, ValueError) as exc:
        raise credentials_exception from exc


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> user_models.User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = verify_access_token(token, credentials_exception)

    current_user = (
        db.query(user_models.User).filter(user_models.User.id == token_data.id).first()
    )

    if current_user is None:
        raise credentials_exception

    return current_user


def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> user_models.User | None:
    if not token:
        return None
    try:
        return get_current_user(token=token, db=db)
    except HTTPException:
        return None
