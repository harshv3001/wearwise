from uuid import UUID

from fastapi import Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.users.dependencies import get_authenticated_user
from src.users.models import User
from src.wear import queries as wear_queries
from src.wear.exceptions import WearLogNotFoundError
from src.wear.models import WearLog


def get_owned_wear_log(
    wear_log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
) -> WearLog:
    wear_log = wear_queries.get_wear_log_by_id_and_user(
        db,
        wear_log_id=wear_log_id,
        user_id=current_user.id,
    )
    if not wear_log:
        raise WearLogNotFoundError()
    return wear_log
