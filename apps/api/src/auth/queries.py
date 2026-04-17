from datetime import datetime

from sqlalchemy.orm import Session

from src.auth.models import AuthSession
from src.users.models import User


def create_auth_session(
    db: Session,
    *,
    user_id,
    refresh_token_hash: str,
    expires_at: datetime,
    user_agent: str | None,
    ip_address: str | None,
    last_used_at: datetime,
) -> AuthSession:
    auth_session = AuthSession(
        user_id=user_id,
        refresh_token_hash=refresh_token_hash,
        user_agent=user_agent,
        ip_address=ip_address,
        expires_at=expires_at,
        last_used_at=last_used_at,
    )
    db.add(auth_session)
    db.commit()
    db.refresh(auth_session)
    return auth_session


def get_active_auth_session_by_token_hash(
    db: Session,
    *,
    refresh_token_hash: str,
) -> AuthSession | None:
    return (
        db.query(AuthSession)
        .filter(
            AuthSession.refresh_token_hash == refresh_token_hash,
            AuthSession.revoked_at.is_(None),
        )
        .first()
    )


def revoke_auth_session(db: Session, *, auth_session: AuthSession, revoked_at: datetime) -> AuthSession:
    auth_session.revoked_at = revoked_at
    db.commit()
    return auth_session


def rotate_auth_session(
    db: Session,
    *,
    auth_session: AuthSession,
    revoked_at: datetime,
    last_used_at: datetime,
) -> AuthSession:
    auth_session.revoked_at = revoked_at
    auth_session.last_used_at = last_used_at
    db.commit()
    return auth_session


def get_user_by_email(db: Session, *, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, *, user_id) -> User | None:
    return db.query(User).filter(User.id == user_id).first()
