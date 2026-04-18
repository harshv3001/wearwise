from typing import Optional
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.orm import Session

from src.media.service import delete_upload_file, save_upload_file
from src.media.utils import build_image_url
from src.outfits import queries as outfit_queries
from src.outfits.exceptions import (
    DuplicateCanvasLayoutClosetItemError,
    DuplicateOutfitClosetItemError,
    OutfitCanvasLayoutMismatchError,
    OutfitClosetItemsNotFoundError,
)
from src.outfits.models import Outfit
from src.outfits.schemas import OutfitCreate, OutfitItemCreate, OutfitUpdate
from src.outfits.utils import serialize_outfit, serialize_outfit_detail, serialize_preview_closet_item
from src.users.models import User


def validate_closet_items_belong_to_user(
    db: Session,
    *,
    user_id: UUID,
    items: list[OutfitItemCreate],
) -> None:
    if not items:
        return

    ids = [item.closet_item_id for item in items]
    if len(ids) != len(set(ids)):
        raise DuplicateOutfitClosetItemError()

    found_ids = outfit_queries.get_owned_closet_item_ids(db, user_id=user_id, closet_item_ids=ids)
    missing_ids = [closet_item_id for closet_item_id in ids if closet_item_id not in found_ids]
    if missing_ids:
        raise OutfitClosetItemsNotFoundError(missing_ids)


def validate_canvas_layout(items: list[OutfitItemCreate], canvas_layout) -> None:
    if not canvas_layout:
        return

    item_ids = [item.closet_item_id for item in items]
    item_id_set = set(item_ids)
    if len(item_ids) != len(item_id_set):
        raise DuplicateOutfitClosetItemError()

    layout_ids = [entry.closet_item_id for entry in canvas_layout]
    if len(layout_ids) != len(set(layout_ids)):
        raise DuplicateCanvasLayoutClosetItemError()

    if set(layout_ids) != item_id_set:
        raise OutfitCanvasLayoutMismatchError()


def create_outfit(
    *,
    db: Session,
    current_user: User,
    payload: OutfitCreate,
):
    validate_closet_items_belong_to_user(db, user_id=current_user.id, items=payload.items)
    validate_canvas_layout(payload.items, payload.canvas_layout)

    outfit = outfit_queries.create_outfit(
        db,
        user_id=current_user.id,
        outfit_data=payload.model_dump(exclude={"items"}, mode="json"),
    )
    outfit_queries.add_outfit_items(db, outfit_id=outfit.id, items=payload.items)
    outfit_queries.commit_and_refresh_outfit(db, outfit=outfit)
    outfit_items = outfit_queries.list_outfit_items_with_closet_items(db, outfit_id=outfit.id)
    return serialize_outfit(outfit, outfit_items)


def list_outfits(
    *,
    db: Session,
    current_user: User,
    occasion: Optional[str],
    season: Optional[str],
    favorite: Optional[bool],
    limit: int,
    offset: int,
):
    total, outfits = outfit_queries.list_outfits_by_user(
        db,
        user_id=current_user.id,
        occasion=occasion,
        season=season,
        favorite=favorite,
        limit=limit,
        offset=offset,
    )

    outfit_ids = [outfit.id for outfit in outfits]
    previews_by_outfit = {outfit_id: [] for outfit_id in outfit_ids}
    counts_by_outfit = {outfit_id: 0 for outfit_id in outfit_ids}

    if outfit_ids:
        counts_by_outfit.update(outfit_queries.get_outfit_item_counts(db, outfit_ids=outfit_ids))
        for row in outfit_queries.list_outfit_preview_rows(db, outfit_ids=outfit_ids):
            previews_by_outfit[row.outfit_id].append(serialize_preview_closet_item(row))

    items = [
        {
            "id": outfit.id,
            "name": outfit.name,
            "occasion": outfit.occasion,
            "season": outfit.season,
            "is_favorite": outfit.is_favorite,
            "image_url": build_image_url(outfit.image_path),
            "canvas_layout": outfit.canvas_layout or [],
            "created_at": outfit.created_at,
            "updated_at": outfit.updated_at,
            "item_count": counts_by_outfit.get(outfit.id, 0),
            "preview_items": previews_by_outfit.get(outfit.id, []),
        }
        for outfit in outfits
    ]
    return {"items": items, "limit": limit, "offset": offset, "total": total}


def get_outfit_detail(*, db: Session, outfit: Outfit):
    outfit_items = outfit_queries.list_outfit_items_with_closet_items(db, outfit_id=outfit.id)
    return serialize_outfit_detail(outfit, outfit_items)


def update_outfit(
    *,
    db: Session,
    outfit: Outfit,
    current_user: User,
    payload: OutfitUpdate,
):
    next_items = payload.items
    if next_items is None:
        next_items = [
            OutfitItemCreate(
                closet_item_id=item.closet_item_id,
                position=item.position,
                layer=item.layer,
                note=item.note,
            )
            for item in outfit.outfit_items
        ]

    if payload.name is not None:
        outfit.name = payload.name
    if payload.occasion is not None:
        outfit.occasion = payload.occasion
    if payload.season is not None:
        outfit.season = payload.season
    if payload.is_favorite is not None:
        outfit.is_favorite = payload.is_favorite
    if payload.notes is not None:
        outfit.notes = payload.notes

    if payload.items is not None:
        validate_closet_items_belong_to_user(db, user_id=current_user.id, items=payload.items)
        outfit_queries.replace_outfit_items(db, outfit_id=outfit.id, items=payload.items)

    if payload.canvas_layout is not None:
        validate_canvas_layout(next_items, payload.canvas_layout)
        outfit.canvas_layout = [entry.model_dump(mode="json") for entry in payload.canvas_layout]

    outfit_queries.save_outfit(db, outfit=outfit)
    outfit_items = outfit_queries.list_outfit_items_with_closet_items(db, outfit_id=outfit.id)
    return serialize_outfit_detail(outfit, outfit_items)


def upload_outfit_image(*, db: Session, outfit: Outfit, file: UploadFile):
    new_image_key = save_upload_file(file, folder="outfits")
    if outfit.image_path:
        delete_upload_file(outfit.image_path)
    outfit.image_path = new_image_key
    outfit_queries.save_outfit(db, outfit=outfit)
    outfit_items = outfit_queries.list_outfit_items_with_closet_items(db, outfit_id=outfit.id)
    return serialize_outfit_detail(outfit, outfit_items)


def delete_outfit(*, db: Session, outfit: Outfit) -> None:
    if outfit.image_path:
        delete_upload_file(outfit.image_path)
    outfit_queries.delete_outfit(db, outfit=outfit)
