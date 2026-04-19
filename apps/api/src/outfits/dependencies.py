from uuid import UUID

from fastapi import Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.outfits import queries as outfit_queries
from src.outfits.exceptions import OutfitNotFoundError
from src.outfits.models import Outfit
from src.users.dependencies import get_authenticated_user
from src.users.models import User


def get_owned_outfit(
    outfit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
) -> Outfit:
    outfit = outfit_queries.get_outfit_by_id_and_user(db, outfit_id=outfit_id, user_id=current_user.id)
    if not outfit:
        raise OutfitNotFoundError()
    return outfit
