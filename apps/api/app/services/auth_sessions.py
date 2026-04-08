from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Request, Response
from sqlalchemy.orm import Session

from app.config import settings
from app.models.auth_session import AuthSession
from app.models.auth_provider_account import AuthProviderAccount
from app.models.user import User
from app.schemas.user import UserOut
from app.utils import build_image_url
from app import oauth2


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def serialize_user(user: User, db: Session) -> UserOut:
    image_url = build_image_url(user.image_path)

    if not image_url:
        linked_account = (
            db.query(AuthProviderAccount)
            .filter(
                AuthProviderAccount.user_id == user.id,
                AuthProviderAccount.provider_avatar_url.isnot(None),
            )
            .order_by(AuthProviderAccount.linked_at.asc())
            .first()
        )
        image_url = linked_account.provider_avatar_url if linked_account else None

    return UserOut.model_validate(
        {
            **user.__dict__,
            "image_url": image_url,
        }
    )


def build_login_response(user: User, access_token: str, db: Session) -> dict:
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": serialize_user(user, db),
    }


def create_session(
    db: Session,
    *,
    user: User,
    request: Request | None = None,
) -> tuple[str, AuthSession]:
    refresh_token = generate_refresh_token()
    expires_at = _utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    auth_session = AuthSession(
        user_id=user.id,
        refresh_token_hash=hash_refresh_token(refresh_token),
        user_agent=(request.headers.get("user-agent") if request else None),
        ip_address=(request.client.host if request and request.client else None),
        expires_at=expires_at,
        last_used_at=_utcnow(),
    )
    db.add(auth_session)
    db.commit()
    db.refresh(auth_session)
    return refresh_token, auth_session


def issue_auth_tokens(
    db: Session,
    *,
    user: User,
    response: Response,
    request: Request | None = None,
) -> dict:
    access_token = oauth2.create_access_token(data={"user_id": user.id})
    refresh_token, _ = create_session(db, user=user, request=request)
    set_refresh_cookie(response, refresh_token)
    return build_login_response(user, access_token, db)


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )


def revoke_session_by_refresh_token(db: Session, refresh_token: str | None) -> None:
    if not refresh_token:
        return
    token_hash = hash_refresh_token(refresh_token)
    session = (
        db.query(AuthSession)
        .filter(AuthSession.refresh_token_hash == token_hash, AuthSession.revoked_at.is_(None))
        .first()
    )
    if not session:
        return
    session.revoked_at = _utcnow()
    db.commit()


def refresh_session(
    db: Session,
    *,
    refresh_token: str,
    response: Response,
    request: Request | None = None,
) -> dict | None:
    token_hash = hash_refresh_token(refresh_token)
    auth_session = (
        db.query(AuthSession)
        .filter(
            AuthSession.refresh_token_hash == token_hash,
            AuthSession.revoked_at.is_(None),
        )
        .first()
    )
    if not auth_session:
        return None
    if auth_session.expires_at <= _utcnow():
        auth_session.revoked_at = _utcnow()
        db.commit()
        return None

    user = db.query(User).filter(User.id == auth_session.user_id).first()
    if not user:
        auth_session.revoked_at = _utcnow()
        db.commit()
        return None

    auth_session.revoked_at = _utcnow()
    auth_session.last_used_at = _utcnow()
    db.commit()

    return issue_auth_tokens(db, user=user, response=response, request=request)
