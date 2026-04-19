from fastapi import Depends
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.database import get_db
from src.users.models import User


def get_authenticated_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


def get_users_db_session(db: Session = Depends(get_db)) -> Session:
    return db
