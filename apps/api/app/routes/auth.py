from urllib.parse import quote

import re

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status, UploadFile, File
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import oauth2, utils
from app.config import settings
from app.database import get_db
from app.models.auth_provider_account import AuthProviderAccount
from app.models import user as user_model
from app.schemas import auth as auth_schema
from app.schemas import user as user_schema
from app.services.auth_sessions import (
    clear_refresh_cookie,
    issue_auth_tokens,
    refresh_session,
    revoke_session_by_refresh_token,
)
from app.services.oauth import (
    build_frontend_callback_url,
    create_frontend_exchange_code,
    create_state_token,
    get_provider_client,
    resolve_or_create_user,
    verify_frontend_exchange_code,
    verify_state_token,
)
from app.utils import build_image_url, delete_upload_file, save_upload_file

router = APIRouter(prefix="/auth", tags=["Auth"])
USERNAME_PATTERN = re.compile(r"^[a-zA-Z][a-zA-Z0-9_.-]*$")


def _clean_optional_string(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = value.strip()
    return cleaned or None


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _require_non_empty_string(value: str, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail=f"{field_name} is required")
    return cleaned


def _normalize_username(username: str | None) -> str | None:
    cleaned = _clean_optional_string(username)
    if not cleaned:
        return None
    normalized = cleaned.lower()
    if len(normalized) < 3:
        raise HTTPException(status_code=422, detail="Username must be at least 3 characters")
    if not USERNAME_PATTERN.fullmatch(normalized):
        raise HTTPException(
            status_code=422,
            detail="Username must start with a letter and can only include letters, numbers, dots, underscores, and hyphens",
        )
    return normalized


def _clean_optional_list(values: list[str] | None) -> list[str] | None:
    if values is None:
        return None

    cleaned = [value.strip() for value in values if value and value.strip()]
    return cleaned or None


def _serialize_user(user: user_model.User, db: Session) -> user_schema.UserOut:
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

    return user_schema.UserOut.model_validate(
        {
            **user.__dict__,
            "image_url": image_url,
        }
    )


def _oauth_error_redirect(
    *,
    error: str,
    provider: str | None = None,
    intent: str | None = None,
) -> RedirectResponse:
    query = [f"oauth_error={quote(error)}"]
    if provider:
        query.append(f"provider={quote(provider)}")
    if intent:
        query.append(f"intent={quote(intent)}")
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/oauth/callback?{'&'.join(query)}",
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=user_schema.UserOut,
)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    normalized_email = _normalize_email(user.email)
    existing = db.query(user_model.User).filter(user_model.User.email == normalized_email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_dict = user.model_dump()
    user_dict["first_name"] = _require_non_empty_string(user_dict["first_name"], "First name")
    user_dict["last_name"] = _require_non_empty_string(user_dict["last_name"], "Last name")
    user_dict["username"] = _normalize_username(user_dict.get("username"))
    user_dict["email"] = normalized_email
    user_dict["country"] = _clean_optional_string(user_dict.get("country"))
    user_dict["country_code"] = _clean_optional_string(user_dict.get("country_code"))
    user_dict["state"] = _clean_optional_string(user_dict.get("state"))
    user_dict["state_code"] = _clean_optional_string(user_dict.get("state_code"))
    user_dict["city"] = _clean_optional_string(user_dict.get("city"))
    user_dict["pref_styles"] = _clean_optional_list(user_dict.get("pref_styles"))
    user_dict["pref_colors"] = _clean_optional_list(user_dict.get("pref_colors"))
    user_dict["password"] = utils.hash_password(user.password.strip())

    if user_dict["username"]:
        username_exists = (
            db.query(user_model.User)
            .filter(user_model.User.username == user_dict["username"])
            .first()
        )
        if username_exists:
            raise HTTPException(status_code=409, detail="Username is already taken")

    new_user = user_model.User(
        **user_dict,
        email_verification_source="password",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return _serialize_user(new_user, db)


@router.post("/login", response_model=user_schema.LoginResponse)
def login(
    response: Response,
    request: Request,
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    normalized_email = _normalize_email(form.username)
    user_selected = (
        db.query(user_model.User).filter(user_model.User.email == normalized_email).first()
    )
    if not user_selected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid credentials"
        )
    if not user_selected.password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account uses social login. Continue with Google or Facebook, or add a password after signing in.",
        )
    if not utils.verify_password(form.password, user_selected.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid credentials"
        )

    return issue_auth_tokens(db, user=user_selected, response=response, request=request)


@router.post("/refresh", response_model=auth_schema.RefreshResponse)
def refresh_auth_session(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No active session")

    refreshed = refresh_session(
        db,
        refresh_token=refresh_token,
        response=response,
        request=request,
    )
    if not refreshed:
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
        )
    return refreshed


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    revoke_session_by_refresh_token(
        db, request.cookies.get(settings.REFRESH_COOKIE_NAME)
    )
    clear_refresh_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=user_schema.UserOut)
def get_me(
    current_user: user_model.User = Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    return _serialize_user(current_user, db)


@router.patch("/me", response_model=user_schema.UserOut)
def update_me(
    payload: user_schema.UserUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(oauth2.get_current_user),
):
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return _serialize_user(current_user, db)

    if "first_name" in update_data:
        update_data["first_name"] = _require_non_empty_string(
            update_data["first_name"], "First name"
        )
    if "last_name" in update_data:
        update_data["last_name"] = _require_non_empty_string(
            update_data["last_name"], "Last name"
        )
    if "username" in update_data:
        update_data["username"] = _normalize_username(update_data["username"])
    if "email" in update_data:
        update_data["email"] = _normalize_email(update_data["email"])
    for field in ("gender", "country", "country_code", "state", "state_code", "city"):
        if field in update_data:
            update_data[field] = _clean_optional_string(update_data[field])
    for field in ("pref_styles", "pref_colors"):
        if field in update_data:
            update_data[field] = _clean_optional_list(update_data[field])

    if "email" in update_data and update_data["email"] != current_user.email:
        email_exists = (
            db.query(user_model.User)
            .filter(
                user_model.User.email == update_data["email"],
                user_model.User.id != current_user.id,
            )
            .first()
        )
        if email_exists:
            raise HTTPException(status_code=409, detail="Email already registered")
        current_user.email_verified_at = None
        current_user.email_verification_source = None

    if "username" in update_data and update_data["username"] != current_user.username:
        username_exists = (
            db.query(user_model.User)
            .filter(
                user_model.User.username == update_data["username"],
                user_model.User.id != current_user.id,
            )
            .first()
        )
        if username_exists:
            raise HTTPException(status_code=409, detail="Username is already taken")

    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return _serialize_user(current_user, db)


@router.post("/me/image", response_model=user_schema.UserOut)
def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(oauth2.get_current_user),
):
    new_image_key = save_upload_file(file, folder="profile_images")

    if current_user.image_path:
        delete_upload_file(current_user.image_path)

    current_user.image_path = new_image_key
    db.commit()
    db.refresh(current_user)
    return _serialize_user(current_user, db)


@router.get("/identities")
def get_linked_identities(
    current_user: user_model.User = Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    linked_accounts = (
        db.query(AuthProviderAccount)
        .filter(AuthProviderAccount.user_id == current_user.id)
        .order_by(AuthProviderAccount.provider.asc())
        .all()
    )
    return {
        "has_password": bool(current_user.password),
        "providers": [
            {
                "provider": account.provider,
                "provider_email": account.provider_email,
                "provider_avatar_url": account.provider_avatar_url,
                "linked_at": account.linked_at,
            }
            for account in linked_accounts
        ],
    }


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: auth_schema.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(oauth2.get_current_user),
):
    if not current_user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password change is not available for social-only accounts.",
        )

    current_password = payload.current_password.strip()
    new_password = payload.new_password.strip()
    confirm_new_password = payload.confirm_new_password.strip()

    if not utils.verify_password(current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current password is incorrect.",
        )

    if new_password != confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password and confirm password do not match.",
        )

    if current_password == new_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be different from your current password.",
        )

    current_user.password = utils.hash_password(new_password)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/providers")
def list_oauth_providers():
    return {
        "providers": [
            {
                "name": "google",
                "enabled": bool(
                    settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET
                ),
            },
            {
                "name": "facebook",
                "enabled": bool(
                    settings.FACEBOOK_CLIENT_ID and settings.FACEBOOK_CLIENT_SECRET
                ),
            },
        ]
    }


@router.get(
    "/oauth/{provider}/start", response_model=auth_schema.OAuthStartResponse
)
def start_oauth(
    provider: auth_schema.ProviderName,
    response: Response,
    intent: auth_schema.OAuthIntent = Query(default="login"),
):
    state = create_state_token(
        provider=provider,
        intent=intent,
    )
    response.set_cookie(
        key="wearwise_oauth_state",
        value=state,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=settings.OAUTH_STATE_TTL_MINUTES * 60,
        path="/",
    )
    client = get_provider_client(provider)
    return {"authorization_url": client.authorization_url(state)}


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: auth_schema.ProviderName,
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    expected_state = request.cookies.get("wearwise_oauth_state")
    if error:
        return _oauth_error_redirect(error=error, provider=provider)
    if not code or not state:
        return _oauth_error_redirect(
            error="missing_callback_params", provider=provider
        )
    if not expected_state or expected_state != state:
        return _oauth_error_redirect(error="invalid_state", provider=provider)

    state_payload = verify_state_token(state)
    if state_payload.get("provider") != provider:
        return _oauth_error_redirect(error="provider_mismatch", provider=provider)

    client = get_provider_client(provider)
    try:
        profile = await client.exchange_code(code)
    except HTTPException as exc:
        return _oauth_error_redirect(
            error=str(exc.detail),
            provider=provider,
            intent=state_payload.get("intent"),
        )

    try:
        user, _, linked_now = resolve_or_create_user(db, profile=profile)
    except HTTPException as exc:
        return _oauth_error_redirect(
            error=str(exc.detail),
            provider=provider,
            intent=state_payload.get("intent"),
        )
    exchange_code = create_frontend_exchange_code(
        user_id=str(user.id),
        provider=provider,
        intent=state_payload["intent"],
        linked=linked_now,
    )
    redirect_response = RedirectResponse(
        url=build_frontend_callback_url(
            code=exchange_code,
            provider=provider,
            intent=state_payload["intent"],
        ),
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )
    redirect_response.delete_cookie(
        key="wearwise_oauth_state",
        path="/",
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    return redirect_response


@router.post("/oauth/exchange", response_model=user_schema.LoginResponse)
def exchange_oauth_code(
    payload: auth_schema.OAuthExchangeRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    exchange_payload = verify_frontend_exchange_code(payload.code)
    user = (
        db.query(user_model.User)
        .filter(user_model.User.id == exchange_payload["user_id"])
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User no longer exists",
        )
    return issue_auth_tokens(db, user=user, response=response, request=request)
