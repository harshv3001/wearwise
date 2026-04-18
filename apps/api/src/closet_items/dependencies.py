from uuid import UUID

from fastapi import Depends
from sqlalchemy.orm import Session

from src.closet_items.exceptions import ClosetItemNotFoundError
from src.closet_items.models import ClosetItem
from src.closet_items import queries as closet_item_queries
from src.database import get_db
from src.users.models import User
from src.users.dependencies import get_authenticated_user


def get_owned_closet_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
) -> ClosetItem:
    item = closet_item_queries.get_closet_item_by_id_and_user(
        db,
        item_id=item_id,
        user_id=current_user.id,
    )
    if not item:
        raise ClosetItemNotFoundError()
    return item
