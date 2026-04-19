from sqlalchemy.orm import Session

from src.auth.models import AuthProviderAccount
from src.users.models import User


def get_user_by_email(db: Session, *, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, *, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_other_user_by_email(db: Session, *, email: str, excluded_user_id) -> User | None:
    return db.query(User).filter(User.email == email, User.id != excluded_user_id).first()


def get_other_user_by_username(
    db: Session,
    *,
    username: str,
    excluded_user_id,
) -> User | None:
    return (
        db.query(User)
        .filter(User.username == username, User.id != excluded_user_id)
        .first()
    )


def create_user(db: Session, **user_data) -> User:
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def save_user(db: Session, *, user: User) -> User:
    db.commit()
    db.refresh(user)
    return user


def update_user_fields(db: Session, *, user: User, update_data: dict) -> User:
    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


def get_profile_image_provider_account(db: Session, *, user_id) -> AuthProviderAccount | None:
    return (
        db.query(AuthProviderAccount)
        .filter(
            AuthProviderAccount.user_id == user_id,
            AuthProviderAccount.provider_avatar_url.isnot(None),
        )
        .order_by(AuthProviderAccount.linked_at.asc())
        .first()
    )


def list_auth_provider_accounts_by_user(db: Session, *, user_id) -> list[AuthProviderAccount]:
    return (
        db.query(AuthProviderAccount)
        .filter(AuthProviderAccount.user_id == user_id)
        .order_by(AuthProviderAccount.provider.asc())
        .all()
    )
