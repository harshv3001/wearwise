from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.functions import count

from src.closet_items.models import ClosetItem
from src.outfits.models import Outfit, OutfitItem


def get_owned_closet_item_ids(
    db: Session,
    *,
    user_id: UUID,
    closet_item_ids: list[UUID],
) -> set[UUID]:
    rows = (
        db.query(ClosetItem.id)
        .filter(ClosetItem.user_id == user_id, ClosetItem.id.in_(closet_item_ids))
        .all()
    )
    return {row[0] for row in rows}


def create_outfit(db: Session, *, user_id: UUID, outfit_data: dict) -> Outfit:
    outfit = Outfit(user_id=user_id, **outfit_data)
    db.add(outfit)
    db.flush()
    return outfit


def add_outfit_items(db: Session, *, outfit_id: UUID, items: list) -> None:
    for item in items:
        db.add(
            OutfitItem(
                outfit_id=outfit_id,
                closet_item_id=item.closet_item_id,
                position=item.position,
                layer=item.layer,
                note=item.note,
            )
        )


def commit_and_refresh_outfit(db: Session, *, outfit: Outfit) -> Outfit:
    db.commit()
    db.refresh(outfit)
    return outfit


def list_outfit_items_with_closet_items(db: Session, *, outfit_id: UUID) -> list[OutfitItem]:
    return (
        db.query(OutfitItem)
        .options(joinedload(OutfitItem.closet_item))
        .filter(OutfitItem.outfit_id == outfit_id)
        .order_by(OutfitItem.position.asc(), OutfitItem.layer.asc())
        .all()
    )


def get_outfit_closet_item_ids(db: Session, *, outfit_id: UUID) -> list[UUID]:
    rows = (
        db.query(OutfitItem.closet_item_id)
        .filter(OutfitItem.outfit_id == outfit_id)
        .all()
    )
    return [row[0] for row in rows]


def get_outfit_by_id_and_user(db: Session, *, outfit_id: UUID, user_id: UUID) -> Outfit | None:
    return db.query(Outfit).filter(Outfit.id == outfit_id, Outfit.user_id == user_id).first()


def list_outfits_by_user(
    db: Session,
    *,
    user_id: UUID,
    occasion: Optional[str],
    season: Optional[str],
    favorite: Optional[bool],
    limit: int,
    offset: int,
) -> tuple[int, list[Outfit]]:
    query = db.query(Outfit).filter(Outfit.user_id == user_id)
    if occasion:
        query = query.filter(Outfit.occasion == occasion)
    if season:
        query = query.filter(Outfit.season == season)
    if favorite is not None:
        query = query.filter(Outfit.is_favorite == favorite)

    total = query.count()
    outfits = query.order_by(Outfit.created_at.desc()).offset(offset).limit(limit).all()
    return total, outfits


def get_outfit_item_counts(db: Session, *, outfit_ids: list[UUID]) -> dict[UUID, int]:
    statement = (
        select(
            OutfitItem.outfit_id,
            count(OutfitItem.closet_item_id).label("item_count"),
        )
        .where(OutfitItem.outfit_id.in_(outfit_ids))
        .group_by(OutfitItem.outfit_id)
    )
    counts = db.execute(statement).all()
    return {outfit_id: int(item_count) for outfit_id, item_count in counts}


def list_outfit_preview_rows(db: Session, *, outfit_ids: list[UUID]):
    return (
        db.query(
            OutfitItem.outfit_id,
            OutfitItem.closet_item_id,
            ClosetItem.name,
            ClosetItem.category,
            ClosetItem.image_path,
        )
        .join(ClosetItem, ClosetItem.id == OutfitItem.closet_item_id)
        .filter(OutfitItem.outfit_id.in_(outfit_ids))
        .order_by(OutfitItem.outfit_id.asc(), OutfitItem.position.asc(), OutfitItem.layer.asc())
        .all()
    )


def replace_outfit_items(db: Session, *, outfit_id: UUID, items: list) -> None:
    db.query(OutfitItem).filter(OutfitItem.outfit_id == outfit_id).delete()
    add_outfit_items(db, outfit_id=outfit_id, items=items)


def save_outfit(db: Session, *, outfit: Outfit) -> Outfit:
    db.commit()
    db.refresh(outfit)
    return outfit


def delete_outfit(db: Session, *, outfit: Outfit) -> None:
    db.delete(outfit)
    db.commit()
