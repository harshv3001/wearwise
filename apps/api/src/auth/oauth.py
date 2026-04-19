from __future__ import annotations

import base64
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlencode

import httpx
import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.auth.models import AuthProviderAccount
from src.config import settings
from src.users.models import User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _encrypt_optional_token(token: str | None) -> str | None:
    if not token:
        return None
    secret = settings.JWT_SECRET.encode("utf-8")
    raw = token.encode("utf-8")
    encrypted = bytes(
        raw[index] ^ secret[index % len(secret)] for index in range(len(raw))
    )
    return _b64url(encrypted)


@dataclass
class ProviderProfile:
    provider: str
    provider_user_id: str
    email: str | None
    email_verified: bool | None
    first_name: str
    last_name: str
    display_name: str | None
    avatar_url: str | None
    access_token: str | None
    refresh_token: str | None
    expires_in: int | None
    scopes: str | None
    raw_profile: dict[str, Any]


class OAuthProviderClient:
    provider_name: str

    def is_configured(self) -> bool:
        raise NotImplementedError

    def authorization_url(self, state: str) -> str:
        raise NotImplementedError

    async def exchange_code(self, code: str) -> ProviderProfile:
        raise NotImplementedError


class GoogleOAuthClient(OAuthProviderClient):
    provider_name = "google"

    def is_configured(self) -> bool:
        return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)

    def authorization_url(self, state: str) -> str:
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.provider_callback_url(self.provider_name),
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "include_granted_scopes": "true",
            "prompt": "select_account",
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    async def exchange_code(self, code: str) -> ProviderProfile:
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.provider_callback_url(self.provider_name),
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if token_response.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google authentication failed during token exchange",
                )

            token_payload = token_response.json()
            access_token = token_payload.get("access_token")
            if not access_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google authentication did not return an access token",
                )

            userinfo_response = await client.get(
                "https://openidconnect.googleapis.com/v1/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if userinfo_response.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google authentication failed during profile lookup",
                )
            profile = userinfo_response.json()

        return ProviderProfile(
            provider=self.provider_name,
            provider_user_id=str(profile["sub"]),
            email=profile.get("email"),
            email_verified=profile.get("email_verified"),
            first_name=profile.get("given_name") or "Google",
            last_name=profile.get("family_name") or "User",
            display_name=profile.get("name"),
            avatar_url=profile.get("picture"),
            access_token=access_token,
            refresh_token=token_payload.get("refresh_token"),
            expires_in=token_payload.get("expires_in"),
            scopes=token_payload.get("scope"),
            raw_profile=profile,
        )


class FacebookOAuthClient(OAuthProviderClient):
    provider_name = "facebook"

    def is_configured(self) -> bool:
        return bool(settings.FACEBOOK_CLIENT_ID and settings.FACEBOOK_CLIENT_SECRET)

    def authorization_url(self, state: str) -> str:
        params = {
            "client_id": settings.FACEBOOK_CLIENT_ID,
            "redirect_uri": settings.provider_callback_url(self.provider_name),
            "response_type": "code",
            "scope": "email,public_profile",
            "state": state,
            "auth_type": "rerequest",
        }
        return f"https://www.facebook.com/v23.0/dialog/oauth?{urlencode(params)}"

    async def exchange_code(self, code: str) -> ProviderProfile:
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_response = await client.get(
                "https://graph.facebook.com/v23.0/oauth/access_token",
                params={
                    "client_id": settings.FACEBOOK_CLIENT_ID,
                    "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                    "redirect_uri": settings.provider_callback_url(self.provider_name),
                    "code": code,
                },
            )
            if token_response.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Facebook authentication failed during token exchange",
                )

            token_payload = token_response.json()
            access_token = token_payload.get("access_token")
            if not access_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Facebook authentication did not return an access token",
                )

            profile_response = await client.get(
                "https://graph.facebook.com/me",
                params={
                    "fields": "id,first_name,last_name,name,email,picture.type(large)",
                    "access_token": access_token,
                },
            )
            if profile_response.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Facebook authentication failed during profile lookup",
                )
            profile = profile_response.json()

        picture_data = profile.get("picture", {}).get("data", {})
        return ProviderProfile(
            provider=self.provider_name,
            provider_user_id=str(profile["id"]),
            email=profile.get("email"),
            email_verified=bool(profile.get("email")),
            first_name=profile.get("first_name") or "Facebook",
            last_name=profile.get("last_name") or "User",
            display_name=profile.get("name"),
            avatar_url=picture_data.get("url"),
            access_token=access_token,
            refresh_token=None,
            expires_in=token_payload.get("expires_in"),
            scopes=None,
            raw_profile=profile,
        )


PROVIDER_CLIENTS: dict[str, OAuthProviderClient] = {
    "google": GoogleOAuthClient(),
    "facebook": FacebookOAuthClient(),
}


def get_provider_client(provider: str) -> OAuthProviderClient:
    client = PROVIDER_CLIENTS.get(provider)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unsupported OAuth provider",
        )
    if not client.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{provider.capitalize()} OAuth is not configured",
        )
    return client


def create_state_token(*, provider: str, intent: str, user_id: str | None = None) -> str:
    now = _utcnow()
    payload = {
        "purpose": "oauth_state",
        "provider": provider,
        "intent": intent,
        "nonce": secrets.token_urlsafe(24),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.OAUTH_STATE_TTL_MINUTES)).timestamp()),
    }
    if user_id:
        payload["user_id"] = user_id
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def verify_state_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth state",
        ) from exc
    if payload.get("purpose") != "oauth_state":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth state",
        )
    return payload


def create_frontend_exchange_code(
    *,
    user_id: str,
    provider: str,
    intent: str,
    linked: bool = False,
) -> str:
    now = _utcnow()
    payload = {
        "purpose": "oauth_exchange",
        "user_id": user_id,
        "provider": provider,
        "intent": intent,
        "linked": linked,
        "iat": int(now.timestamp()),
        "exp": int(
            (now + timedelta(minutes=settings.OAUTH_EXCHANGE_CODE_TTL_MINUTES)).timestamp()
        ),
        "jti": secrets.token_urlsafe(16),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def verify_frontend_exchange_code(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth completion code",
        ) from exc
    if payload.get("purpose") != "oauth_exchange":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth completion code",
        )
    return payload


def _normalize_email(email: str | None) -> str | None:
    return email.strip().lower() if email else None


def resolve_or_create_user(
    db: Session,
    *,
    profile: ProviderProfile,
    current_user: User | None = None,
) -> tuple[User, AuthProviderAccount, bool]:
    normalized_email = _normalize_email(profile.email)
    if not normalized_email and not current_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"{profile.provider.capitalize()} did not return an email address. "
                "Please sign up with email/password first, then link this provider from your profile."
            ),
        )

    existing_provider_account = (
        db.query(AuthProviderAccount)
        .filter(
            AuthProviderAccount.provider == profile.provider,
            AuthProviderAccount.provider_user_id == profile.provider_user_id,
        )
        .first()
    )

    if current_user and existing_provider_account and existing_provider_account.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"This {profile.provider.capitalize()} account is already linked to another user",
        )

    if current_user and normalized_email and current_user.email != normalized_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot link a provider account that belongs to a different email address",
        )

    if existing_provider_account:
        user = db.query(User).filter(User.id == existing_provider_account.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Linked provider account points to a missing user",
            )
        linked_now = False
    else:
        if current_user:
            user = current_user
        else:
            user = db.query(User).filter(User.email == normalized_email).first()
            if user and not profile.email_verified:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "An account with this email already exists, but the provider did not verify the email. "
                        "Sign in with your existing method first, then link this provider from your account settings."
                    ),
                )
            if not user:
                user = User(
                    first_name=profile.first_name,
                    last_name=profile.last_name,
                    email=normalized_email,
                    password=None,
                    email_verified_at=_utcnow() if profile.email_verified else None,
                    email_verification_source=profile.provider if profile.email_verified else None,
                )
                db.add(user)
                db.flush()

        existing_provider_account = AuthProviderAccount(
            user_id=user.id,
            provider=profile.provider,
            provider_user_id=profile.provider_user_id,
        )
        db.add(existing_provider_account)
        db.flush()
        linked_now = True

    existing_provider_account.provider_email = normalized_email
    existing_provider_account.provider_email_verified = profile.email_verified
    existing_provider_account.provider_display_name = profile.display_name
    existing_provider_account.provider_avatar_url = profile.avatar_url
    existing_provider_account.access_token_encrypted = (
        _encrypt_optional_token(profile.access_token)
        if settings.STORE_PROVIDER_TOKENS
        else None
    )
    existing_provider_account.refresh_token_encrypted = (
        _encrypt_optional_token(profile.refresh_token)
        if settings.STORE_PROVIDER_TOKENS
        else None
    )
    existing_provider_account.token_expires_at = (
        _utcnow() + timedelta(seconds=profile.expires_in)
        if profile.expires_in
        else None
    )
    existing_provider_account.scopes = profile.scopes
    existing_provider_account.provider_metadata = profile.raw_profile
    existing_provider_account.last_login_at = _utcnow()

    if normalized_email and not user.email:
        user.email = normalized_email
    if profile.email_verified and not user.email_verified_at:
        user.email_verified_at = _utcnow()
        user.email_verification_source = profile.provider

    db.commit()
    db.refresh(user)
    db.refresh(existing_provider_account)
    return user, existing_provider_account, linked_now


def build_frontend_callback_url(*, code: str, provider: str, intent: str) -> str:
    return (
        f"{settings.FRONTEND_URL}/oauth/callback?"
        f"{urlencode({'code': code, 'provider': provider, 'intent': intent})}"
    )
