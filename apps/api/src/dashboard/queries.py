from datetime import date, timedelta
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import count

from src.closet_items.models import ClosetItem
from src.outfits.models import Outfit
from src.wear.models import WearLog


def count_closet_items_by_user(db: Session, *, user_id: UUID) -> int:
    return (
        db.query(count(ClosetItem.id))
        .filter(ClosetItem.user_id == user_id)
        .scalar()
        or 0
    )


def count_outfits_by_user(db: Session, *, user_id: UUID) -> int:
    return (
        db.query(count(Outfit.id))
        .filter(Outfit.user_id == user_id)
        .scalar()
        or 0
    )


def count_logged_on_date(db: Session, *, user_id: UUID, target_date: date) -> int:
    return (
        db.query(count(WearLog.id))
        .filter(WearLog.user_id == user_id, WearLog.date_worn == target_date)
        .scalar()
        or 0
    )


def list_category_counts(db: Session, *, user_id: UUID):
    return (
        db.query(
            ClosetItem.category.label("category"),
            count(ClosetItem.id).label("count"),
        )
        .filter(ClosetItem.user_id == user_id)
        .group_by(ClosetItem.category)
        .order_by(count(ClosetItem.id).desc(), ClosetItem.category.asc())
        .all()
    )


def get_most_used_item(db: Session, *, user_id: UUID) -> ClosetItem | None:
    return (
        db.query(ClosetItem)
        .filter(ClosetItem.user_id == user_id)
        .order_by(
            ClosetItem.times_worn.desc(),
            ClosetItem.created_at.asc(),
            ClosetItem.name.asc(),
        )
        .first()
    )


def get_least_used_item(db: Session, *, user_id: UUID) -> ClosetItem | None:
    return (
        db.query(ClosetItem)
        .filter(ClosetItem.user_id == user_id)
        .order_by(
            ClosetItem.times_worn.asc(),
            ClosetItem.created_at.asc(),
            ClosetItem.name.asc(),
        )
        .first()
    )


def count_never_worn_items(db: Session, *, user_id: UUID) -> int:
    return (
        db.query(count(ClosetItem.id))
        .filter(ClosetItem.user_id == user_id, ClosetItem.times_worn == 0)
        .scalar()
        or 0
    )


def count_low_rotation_items(db: Session, *, user_id: UUID, threshold: int = 1) -> int:
    return (
        db.query(count(ClosetItem.id))
        .filter(
            ClosetItem.user_id == user_id,
            ClosetItem.times_worn > 0,
            ClosetItem.times_worn <= threshold,
        )
        .scalar()
        or 0
    )


def get_today_logged_outfit(db: Session, *, user_id: UUID, target_date: date):
    return (
        db.query(
            WearLog.id.label("wear_log_id"),
            WearLog.outfit_id,
            WearLog.date_worn,
            WearLog.created_at,
            Outfit.name,
            Outfit.occasion,
            Outfit.image_path,
        )
        .join(Outfit, Outfit.id == WearLog.outfit_id)
        .filter(WearLog.user_id == user_id, WearLog.date_worn == target_date)
        .order_by(WearLog.created_at.desc())
        .first()
    )


def count_logged_since_date(db: Session, *, user_id: UUID, start_date: date) -> int:
    return (
        db.query(count(WearLog.id))
        .filter(WearLog.user_id == user_id, WearLog.date_worn >= start_date)
        .scalar()
        or 0
    )


def get_last_logged_date(db: Session, *, user_id: UUID) -> date | None:
    row = (
        db.query(WearLog.date_worn)
        .filter(WearLog.user_id == user_id)
        .order_by(WearLog.date_worn.desc(), WearLog.created_at.desc())
        .first()
    )
    return row[0] if row else None


def get_week_start(today: date) -> date:
    return today - timedelta(days=today.weekday())
