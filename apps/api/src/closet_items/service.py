from typing import Optional
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.utils import build_image_url, delete_upload_file, save_upload_file
from src.closet_items import queries as closet_item_queries
from src.closet_items.constants import ALLOWED_SORT_FIELDS, DEFAULT_SUMMARY_CATEGORY
from src.closet_items.exceptions import (
    InvalidClosetItemSortFieldError,
    InvalidClosetItemSortOrderError,
)
from src.closet_items.models import ClosetItem
from src.closet_items.schemas import ClosetItemCreate, ClosetItemOut, ClosetItemSummaryOut, ClosetItemUpdate
from src.closet_items.utils import normalize_category
from src.users.models import User


def serialize_closet_item(item: ClosetItem) -> ClosetItemOut:
    return ClosetItemOut(
        id=item.id,
        user_id=item.user_id,
        name=item.name,
        category=normalize_category(item.category),
        color=item.color,
        season=item.season,
        brand=item.brand,
        price=item.price,
        notes=item.notes,
        store=item.store,
        material=item.material,
        date_acquired=item.date_acquired,
        times_worn=item.times_worn,
        image_url=build_image_url(item.image_path),
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


def serialize_closet_item_summary(item: ClosetItem) -> ClosetItemSummaryOut:
    return ClosetItemSummaryOut(
        id=item.id,
        name=item.name,
        category=normalize_category(item.category) or DEFAULT_SUMMARY_CATEGORY,
        image_url=build_image_url(item.image_path),
    )


def create_closet_item(*, db: Session, current_user: User, payload: ClosetItemCreate) -> ClosetItem:
    payload_data = payload.model_dump()
    payload_data["category"] = normalize_category(payload_data.get("category"))
    return closet_item_queries.create_closet_item(
        db,
        user_id=current_user.id,
        **payload_data,
    )


def list_closet_items(
    *,
    db: Session,
    current_user: User,
    category: Optional[str],
    color: Optional[str],
    season: Optional[str],
    price: Optional[float],
    store: Optional[str],
    material: Optional[str],
    query_text: Optional[str],
    limit: int,
    offset: int,
    sort_by: str,
    order: str,
) -> list[ClosetItem]:
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise InvalidClosetItemSortFieldError()
    normalized_order = order.lower()
    if normalized_order not in {"asc", "desc"}:
        raise InvalidClosetItemSortOrderError()

    normalized_category = normalize_category(category) if category else None
    return closet_item_queries.list_closet_items_by_user(
        db,
        user_id=current_user.id,
        category=normalized_category,
        color=color,
        season=season,
        price=price,
        store=store,
        material=material,
        query_text=query_text,
        sort_by=sort_by,
        order=normalized_order,
        limit=limit,
        offset=offset,
    )


def update_closet_item(
    *,
    db: Session,
    item: ClosetItem,
    payload: ClosetItemUpdate,
) -> ClosetItem:
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return item

    if "category" in update_data:
        update_data["category"] = normalize_category(update_data["category"])
    return closet_item_queries.update_closet_item(db, item=item, update_data=update_data)


def upload_closet_item_image(*, db: Session, item: ClosetItem, file: UploadFile) -> ClosetItem:
    new_image_key = save_upload_file(file, folder="closet_items")

    if item.image_path:
        delete_upload_file(item.image_path)

    item.image_path = new_image_key
    return closet_item_queries.save_closet_item(db, item=item)


def delete_closet_item(*, db: Session, item: ClosetItem) -> None:
    if item.image_path:
        delete_upload_file(item.image_path)
    closet_item_queries.delete_closet_item(db, item=item)
