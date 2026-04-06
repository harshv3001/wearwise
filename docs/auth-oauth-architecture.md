# OAuth Architecture for WearWise

## Goals

- Keep existing email/password login working.
- Add Google and Facebook without creating duplicate users.
- Make the backend the source of truth for identity and sessions.
- Never trust provider identity in the SPA without backend verification.
- Avoid storing provider tokens unless a future feature actually needs them.
- Issue WearWise tokens and sessions after every successful login, regardless of auth method.
- Make Apple and GitHub easy to add later.

## Recommended flow

Use a backend-owned OAuth redirect flow with a short frontend exchange step.

### Why this is the best fit

This project is a Next.js SPA talking to a FastAPI API. In that setup, the cleanest practical approach is:

1. The frontend asks the backend to start OAuth.
2. The backend generates state and returns the provider authorization URL.
3. The browser goes to Google or Facebook.
4. The provider redirects back to the backend callback.
5. The backend exchanges the authorization code, fetches the provider profile, decides which local user this belongs to, and creates or links the provider record.
6. The backend redirects to the SPA with a short-lived one-time exchange code.
7. The SPA exchanges that code with the backend for a WearWise access token, and the backend sets an `HttpOnly` refresh cookie.

This keeps provider verification on the backend while still fitting a modern SPA.

## Why not the other options

### Frontend gets provider token and sends it to backend

This is common in demos, but it makes the browser hold more provider credentials than necessary and pushes identity trust closer to the client. It can work, but it is easier to get wrong and harder to standardize across providers.

### Backend-only OAuth redirect flow

This is excellent when the whole app already uses cookie sessions. Your app currently uses bearer access tokens in the SPA, so a pure backend-only session flow would force a larger auth rewrite immediately.

### Hybrid flow

This is the recommended option here. It combines backend-owned provider verification with an SPA-friendly session bootstrap.

## Responsibilities

### Frontend

- Render login and signup UI.
- Start OAuth by calling the backend.
- Handle the final callback page.
- Exchange the one-time code for WearWise session credentials.
- Store only the short-lived WearWise access token.
- Use the refresh cookie implicitly when the access token expires.

### Backend

- Generate OAuth state and validate callback state.
- Exchange provider authorization codes.
- Fetch provider profile data.
- Decide whether to create, log in, or link a local user.
- Enforce duplicate-account rules.
- Issue WearWise access tokens and refresh sessions.
- Remain the only source of truth for user identity.

## Why backend verification matters

- The backend can verify the provider response directly over server-to-server HTTPS.
- The backend can enforce consistent rules for account linking and duplicate prevention.
- The backend can issue one local session model for password, Google, and Facebook.
- The frontend never has to decide whether a provider identity should map to an existing user.

## Data model

Use a separate provider-link table. Do not overload `users`.

### `users`

Keep user profile data in `users`.

Important auth-related fields:

- `email`: unique, required.
- `password`: nullable. `NULL` means the account currently has no password login.
- `email_verified_at`: nullable timestamp.
- `email_verification_source`: nullable string such as `password`, `google`, or `facebook`.

### `auth_provider_accounts`

One row per linked provider account.

Important fields:

- `user_id`: foreign key to `users.id`.
- `provider`: string like `google`, `facebook`, later `apple`, `github`.
- `provider_user_id`: provider-specific stable subject ID.
- `provider_email`: provider-reported email if any.
- `provider_email_verified`: provider-reported email verification flag.
- `provider_display_name`, `provider_avatar_url`: optional UX metadata.
- `token_expires_at`, `scopes`: optional provider-token metadata.
- `access_token_encrypted`, `refresh_token_encrypted`: nullable and normally unused.
- `provider_metadata`: JSONB for provider profile snapshots and future debugging.
- `linked_at`, `last_login_at`: audit and support data.

Constraints:

- Unique on `(provider, provider_user_id)` so the same provider identity cannot attach to two WearWise users.
- Unique on `(user_id, provider)` so one WearWise user only links one Google account, one Facebook account, etc.
- Index on `user_id`.

### `auth_sessions`

Use a first-party session table for refresh-token rotation.

Important fields:

- `user_id`
- `refresh_token_hash`
- `created_at`
- `expires_at`
- `last_used_at`
- `revoked_at`
- `user_agent`
- `ip_address`

Constraints:

- Unique index on `refresh_token_hash`.
- Index on `user_id`.

## Why this schema is better than `users` only

- One user can link multiple providers cleanly.
- Password login remains independent from social login.
- Provider identity history and login metadata stay separate from profile data.
- Apple and GitHub can be added without changing the `users` table again.

## Duplicate-account prevention

Rules:

1. If `(provider, provider_user_id)` already exists, log that same user in.
2. If the provider is being linked by a signed-in user, require the provider email to match that user email.
3. If no provider row exists but a local user with the same email exists:
   - Auto-link only when the provider says the email is verified.
   - Otherwise reject and ask the user to sign in first, then link from settings.
4. If the provider returns no usable email and the user is not already signed in, reject and ask them to create a password account first.

This avoids accidental account takeover through weak provider email assertions.

## Existing-user migration

Existing password users do not need special migration logic beyond the new nullable and metadata columns.

- All existing users keep logging in with email/password exactly as before.
- Their `password` remains populated.
- When they first use Google or Facebook with the same verified email, the backend links the provider to the existing `users` row instead of creating a new user.

## How to represent auth method availability

Derive it from data instead of storing a fragile “signup type” enum.

- Password login available: `users.password IS NOT NULL`
- Social login available: at least one row exists in `auth_provider_accounts`
- Both available: both conditions are true

This is more reliable than a single `signup_method` field because users can evolve from one method to many.

## Session strategy

Use two layers:

1. Short-lived WearWise access JWT for API authorization.
2. Long-lived `HttpOnly` refresh cookie backed by `auth_sessions`.

### Why this strategy

- It fits the current SPA architecture without requiring a full cookie-only rewrite.
- The refresh token stays out of JavaScript.
- Access tokens can stay short-lived.
- Password and social auth share the same first-party session model.

### Current implementation

- Access JWT lifetime: 15 minutes.
- Refresh session lifetime: 30 days.
- Refresh tokens are rotated on refresh.
- Logout revokes the current refresh session and clears the cookie.

## API design

### Existing endpoints kept

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### New endpoints

- `GET /auth/providers`
  Returns configured providers.

- `GET /auth/oauth/{provider}/start?intent=login|link`
  Starts OAuth and sets a short-lived state cookie.

- `GET /auth/oauth/{provider}/callback`
  Provider callback handled only by the backend.

- `POST /auth/oauth/exchange`
  Exchanges the short-lived frontend code for a WearWise access token and refresh cookie.

- `POST /auth/refresh`
  Rotates the refresh session and returns a new access token.

- `POST /auth/logout`
  Revokes the refresh session and clears the cookie.

- `GET /auth/identities`
  Returns linked providers for account settings UI.

## UX flow

### Social login

1. User clicks `Continue with Google` or `Continue with Facebook`.
2. SPA calls backend start endpoint.
3. Browser redirects to provider.
4. Provider returns to backend.
5. Backend creates or links the local identity.
6. Backend redirects to `/oauth/callback` in the SPA.
7. SPA exchanges the one-time code and redirects to `/dashboard`.

### Linking a provider

1. Signed-in user opens profile or account settings.
2. User clicks `Link Google` or `Link Facebook`.
3. Same OAuth flow runs with `intent=link`.
4. Backend validates the signed-in account context through signed state.
5. On success, the SPA returns to `/profile`.

## Error handling

Handle these explicitly:

- Provider denied consent.
- Missing callback code or state.
- Invalid or expired state.
- Provider token exchange failure.
- Provider profile missing email.
- Existing account email match but provider email not verified.
- Provider already linked to another user.
- Expired or revoked refresh session.
- Login attempt with password on a social-only account.

User-facing messages should be action-oriented:

- “Continue with your existing sign-in method, then link this provider from Profile.”
- “This provider account is already linked to another WearWise account.”
- “Your session expired. Please sign in again.”

## Security best practices

- Backend handles all provider token exchange and identity verification.
- Use signed state and compare it with a backend cookie to protect the callback.
- Never trust provider identity directly from the frontend.
- Do not store provider tokens by default.
- If provider tokens are needed later, encrypt them with a real secret-management solution such as KMS or Vault, not plain database storage.
- Keep access JWTs short-lived.
- Keep refresh tokens in `HttpOnly` cookies only.
- Hash refresh tokens in the database.
- Revoke refresh sessions on logout.
- Allow account auto-linking only when provider email is verified.
- Normalize emails to lowercase before comparison.

## Local environment setup

Backend env:

- `API_BASE_URL=http://localhost:8000`
- `FRONTEND_URL=http://localhost:3000`
- `AUTH_COOKIE_SECURE=false`
- `AUTH_COOKIE_SAMESITE=lax`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `FACEBOOK_CLIENT_ID=...`
- `FACEBOOK_CLIENT_SECRET=...`

Frontend env:

- `NEXT_PUBLIC_API_URL=http://localhost:8000`

Provider console setup:

- Google redirect URI: `http://localhost:8000/auth/oauth/google/callback`
- Facebook redirect URI: `http://localhost:8000/auth/oauth/facebook/callback`

## Production environment setup

Backend env:

- `API_BASE_URL=https://api.yourdomain.com`
- `FRONTEND_URL=https://wearwise.xyz`
- `AUTH_COOKIE_SECURE=true`
- `AUTH_COOKIE_SAMESITE=lax` for same-site subdomains, or `none` only if frontend and API are truly cross-site

Provider console setup:

- Google redirect URI: `https://api.yourdomain.com/auth/oauth/google/callback`
- Facebook redirect URI: `https://api.yourdomain.com/auth/oauth/facebook/callback`

Also ensure:

- CORS allows the real frontend origins.
- HTTPS is enforced everywhere.
- Secrets come from deployment environment variables or a secret manager.

## Extending to Apple and GitHub later

This design already supports new providers cleanly:

- Add a new provider client implementation.
- Add provider env vars.
- Reuse the same `auth_provider_accounts` table.
- Reuse the same callback, exchange, session, and linking rules.

The rest of the app should not need a new auth architecture per provider.
