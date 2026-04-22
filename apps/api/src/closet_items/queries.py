from typing import Optional
from uuid import UUID

from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from src.closet_items.models import ClosetItem


def create_closet_item(db: Session, **item_data) -> ClosetItem:
    item = ClosetItem(**item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_closet_items_by_user(
    db: Session,
    *,
    user_id: UUID,
    category: Optional[str],
    color: Optional[str],
    season: Optional[str],
    price: Optional[float],
    store: Optional[str],
    material: Optional[str],
    query_text: Optional[str],
    sort_by: str,
    order: str,
    limit: int,
    offset: int,
) -> list[ClosetItem]:
    query = db.query(ClosetItem).filter(ClosetItem.user_id == user_id)

    if category:
        query = query.filter(ClosetItem.category == category)
    if color:
        query = query.filter(ClosetItem.color == color)
    if season:
        query = query.filter(ClosetItem.season.any(season))
    if price is not None:
        query = query.filter(ClosetItem.price == price)
    if store:
        query = query.filter(ClosetItem.store == store)
    if material:
        query = query.filter(ClosetItem.material == material)
    if query_text:
        query = query.filter(ClosetItem.name.ilike(f"%{query_text}%"))

    sort_fields = {
        "created_at": ClosetItem.created_at,
        "times_worn": ClosetItem.times_worn,
        "name": ClosetItem.name,
        "category": ClosetItem.category,
        "color": ClosetItem.color,
        "season": ClosetItem.season,
        "price": ClosetItem.price,
        "store": ClosetItem.store,
        "material": ClosetItem.material,
    }
    sort_column = sort_fields[sort_by]
    query = query.order_by(asc(sort_column) if order == "asc" else desc(sort_column))
    return query.offset(offset).limit(limit).all()


def get_closet_item_by_id_and_user(
    db: Session,
    *,
    item_id: UUID,
    user_id: UUID,
) -> ClosetItem | None:
    return (
        db.query(ClosetItem)
        .filter(ClosetItem.id == item_id, ClosetItem.user_id == user_id)
        .first()
    )


def update_closet_item(
    db: Session,
    *,
    item: ClosetItem,
    update_data: dict,
) -> ClosetItem:
    for key, value in update_data.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


def save_closet_item(db: Session, *, item: ClosetItem) -> ClosetItem:
    db.commit()
    db.refresh(item)
    return item


def delete_closet_item(db: Session, *, item: ClosetItem) -> None:
    db.delete(item)
    db.commit()
