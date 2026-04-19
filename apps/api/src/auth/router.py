from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src.auth import schemas as auth_schemas
from src.auth import queries as auth_queries
from src.auth.constants import OAUTH_STATE_COOKIE_NAME
from src.auth.service import (
    build_frontend_callback_url,
    create_frontend_exchange_code,
    create_state_token,
    get_provider_client,
    issue_auth_tokens,
    logout_user,
    refresh_login,
    register_user,
    resolve_or_create_user,
    verify_frontend_exchange_code,
    verify_state_token,
    authenticate_user,
)
from src.config import settings
from src.database import get_db
from src.users import schemas as user_schemas

router = APIRouter(prefix="/auth", tags=["Auth"])


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
    response_model=user_schemas.UserOut,
    summary="Register a new account",
)
def register(
    payload: user_schemas.UserCreate,
    db: Session = Depends(get_db),
):
    user = register_user(db, payload)
    from src.users.service import serialize_user

    return serialize_user(user, db)


@router.post("/login", response_model=user_schemas.LoginResponse, summary="Sign in")
def login(
    response: Response,
    request: Request,
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, email=form.username, password=form.password)
    return issue_auth_tokens(db, user=user, response=response, request=request)


@router.post(
    "/refresh",
    response_model=auth_schemas.RefreshResponse,
    summary="Refresh an authenticated session",
)
def refresh_authentication(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    return refresh_login(db, request=request, response=response)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="Sign out")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    return logout_user(db, request=request, response=response)


@router.get("/providers", summary="List configured OAuth providers")
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
    "/oauth/{provider}/start",
    response_model=auth_schemas.OAuthStartResponse,
    summary="Start an OAuth sign-in flow",
)
def start_oauth(
    provider: auth_schemas.ProviderName,
    response: Response,
    intent: auth_schemas.OAuthIntent = Query(default="login"),
):
    state = create_state_token(provider=provider, intent=intent)
    response.set_cookie(
        key=OAUTH_STATE_COOKIE_NAME,
        value=state,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=settings.OAUTH_STATE_TTL_MINUTES * 60,
        path="/",
    )
    client = get_provider_client(provider)
    return {"authorization_url": client.authorization_url(state)}


@router.get("/oauth/{provider}/callback", summary="Handle an OAuth callback")
async def oauth_callback(
    provider: auth_schemas.ProviderName,
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    expected_state = request.cookies.get(OAUTH_STATE_COOKIE_NAME)
    if error:
        return _oauth_error_redirect(error=error, provider=provider)
    if not code or not state:
        return _oauth_error_redirect(error="missing_callback_params", provider=provider)
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
        key=OAUTH_STATE_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    return redirect_response


@router.post(
    "/oauth/exchange",
    response_model=user_schemas.LoginResponse,
    summary="Exchange frontend OAuth code for tokens",
)
def exchange_oauth_code(
    payload: auth_schemas.OAuthExchangeRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    exchange_payload = verify_frontend_exchange_code(payload.code)
    user = auth_queries.get_user_by_id(db, user_id=exchange_payload["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User no longer exists",
        )
    return issue_auth_tokens(db, user=user, response=response, request=request)
