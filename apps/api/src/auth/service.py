from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from src.auth.oauth import (
    build_frontend_callback_url,
    create_frontend_exchange_code,
    create_state_token,
    get_provider_client,
    resolve_or_create_user,
    verify_frontend_exchange_code,
    verify_state_token,
)
from src.auth.constants import OAUTH_STATE_COOKIE_NAME
from src.auth.exceptions import (
    InvalidCredentialsError,
    NoActiveSessionError,
    SessionExpiredError,
    SocialLoginPasswordRequiredError,
)
from src.auth import queries as auth_queries
from src.config import settings
from src import utils
from src.users.models import User
from src.users import queries as user_queries
from src.users.utils import (
    clean_optional_list,
    clean_optional_string,
    normalize_email,
    normalize_username,
    require_non_empty_string,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def build_login_response(user: User, access_token: str, db: Session) -> dict:
    from src.users.service import serialize_user

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": serialize_user(user, db),
    }


def create_auth_session(
    db: Session,
    *,
    user: User,
    request: Request | None = None,
) -> tuple[str, object]:
    refresh_token = generate_refresh_token()
    now = _utcnow()
    expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    auth_session = auth_queries.create_auth_session(
        db,
        user_id=user.id,
        refresh_token_hash=hash_refresh_token(refresh_token),
        user_agent=request.headers.get("user-agent") if request else None,
        ip_address=request.client.host if request and request.client else None,
        expires_at=expires_at,
        last_used_at=now,
    )
    return refresh_token, auth_session


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


def issue_auth_tokens(
    db: Session,
    *,
    user: User,
    response: Response,
    request: Request | None = None,
) -> dict:
    from src.auth import dependencies as auth_dependencies

    access_token = auth_dependencies.create_access_token(data={"user_id": user.id})
    refresh_token, _ = create_auth_session(db, user=user, request=request)
    set_refresh_cookie(response, refresh_token)
    return build_login_response(user, access_token, db)


def revoke_session_by_refresh_token(db: Session, refresh_token: str | None) -> None:
    if not refresh_token:
        return

    token_hash = hash_refresh_token(refresh_token)
    session = auth_queries.get_active_auth_session_by_token_hash(
        db,
        refresh_token_hash=token_hash,
    )
    if not session:
        return

    auth_queries.revoke_auth_session(db, auth_session=session, revoked_at=_utcnow())


def refresh_auth_session(
    db: Session,
    *,
    refresh_token: str,
    response: Response,
    request: Request | None = None,
) -> dict | None:
    token_hash = hash_refresh_token(refresh_token)
    auth_session = auth_queries.get_active_auth_session_by_token_hash(
        db,
        refresh_token_hash=token_hash,
    )
    if not auth_session:
        return None
    if auth_session.expires_at <= _utcnow():
        auth_queries.revoke_auth_session(
            db,
            auth_session=auth_session,
            revoked_at=_utcnow(),
        )
        return None

    user = auth_queries.get_user_by_id(db, user_id=auth_session.user_id)
    if not user:
        auth_queries.revoke_auth_session(
            db,
            auth_session=auth_session,
            revoked_at=_utcnow(),
        )
        return None

    now = _utcnow()
    auth_queries.rotate_auth_session(
        db,
        auth_session=auth_session,
        revoked_at=now,
        last_used_at=now,
    )

    return issue_auth_tokens(db, user=user, response=response, request=request)


def register_user(db: Session, payload) -> User:
    normalized_email = normalize_email(payload.email)
    existing = user_queries.get_user_by_email(db, email=normalized_email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_dict = payload.model_dump()
    user_dict["first_name"] = require_non_empty_string(user_dict["first_name"], "First name")
    user_dict["last_name"] = require_non_empty_string(user_dict["last_name"], "Last name")
    user_dict["username"] = normalize_username(user_dict.get("username"))
    user_dict["email"] = normalized_email
    user_dict["country"] = clean_optional_string(user_dict.get("country"))
    user_dict["country_code"] = clean_optional_string(user_dict.get("country_code"))
    user_dict["state"] = clean_optional_string(user_dict.get("state"))
    user_dict["state_code"] = clean_optional_string(user_dict.get("state_code"))
    user_dict["city"] = clean_optional_string(user_dict.get("city"))
    user_dict["pref_styles"] = clean_optional_list(user_dict.get("pref_styles"))
    user_dict["pref_colors"] = clean_optional_list(user_dict.get("pref_colors"))
    user_dict["password"] = utils.hash_password(payload.password.strip())

    if user_dict["username"]:
        username_exists = user_queries.get_user_by_username(
            db,
            username=user_dict["username"],
        )
        if username_exists:
            raise HTTPException(status_code=409, detail="Username is already taken")

    return user_queries.create_user(
        db,
        **user_dict,
        email_verification_source="password",
    )


def authenticate_user(db: Session, *, email: str, password: str) -> User:
    normalized_email = normalize_email(email)
    user = user_queries.get_user_by_email(db, email=normalized_email)
    if not user:
        raise InvalidCredentialsError()
    if not user.password:
        raise SocialLoginPasswordRequiredError()
    if not utils.verify_password(password, user.password):
        raise InvalidCredentialsError()
    return user


def refresh_login(
    db: Session,
    *,
    request: Request,
    response: Response,
) -> dict:
    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not refresh_token:
        raise NoActiveSessionError()

    refreshed = refresh_auth_session(
        db,
        refresh_token=refresh_token,
        response=response,
        request=request,
    )
    if not refreshed:
        clear_refresh_cookie(response)
        raise SessionExpiredError()
    return refreshed


def logout_user(db: Session, *, request: Request, response: Response) -> Response:
    revoke_session_by_refresh_token(db, request.cookies.get(settings.REFRESH_COOKIE_NAME))
    clear_refresh_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


__all__ = [
    "OAUTH_STATE_COOKIE_NAME",
    "build_frontend_callback_url",
    "build_login_response",
    "clean_optional_list",
    "clean_optional_string",
    "clear_refresh_cookie",
    "create_auth_session",
    "create_frontend_exchange_code",
    "create_state_token",
    "get_provider_client",
    "hash_refresh_token",
    "issue_auth_tokens",
    "normalize_email",
    "normalize_username",
    "refresh_auth_session",
    "refresh_login",
    "register_user",
    "require_non_empty_string",
    "resolve_or_create_user",
    "revoke_session_by_refresh_token",
    "set_refresh_cookie",
    "verify_frontend_exchange_code",
    "verify_state_token",
]
