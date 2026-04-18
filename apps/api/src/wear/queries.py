from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from src.closet_items.models import ClosetItem
from src.wear.models import WearLog


def get_wear_log_by_id_and_user(
    db: Session,
    *,
    wear_log_id: UUID,
    user_id: UUID,
) -> WearLog | None:
    return (
        db.query(WearLog)
        .filter(WearLog.id == wear_log_id, WearLog.user_id == user_id)
        .first()
    )


def create_wear_log(
    db: Session,
    *,
    user_id: UUID,
    outfit_id: UUID,
    date_worn: date,
    notes: Optional[str],
) -> WearLog:
    wear_log = WearLog(
        user_id=user_id,
        outfit_id=outfit_id,
        date_worn=date_worn,
        notes=notes,
    )
    db.add(wear_log)
    db.flush()
    return wear_log


def list_wear_logs_by_user(
    db: Session,
    *,
    user_id: UUID,
    date_from: Optional[date],
    date_to: Optional[date],
    limit: int,
    offset: int,
) -> tuple[int, list[WearLog]]:
    query = db.query(WearLog).filter(WearLog.user_id == user_id)
    if date_from:
        query = query.filter(WearLog.date_worn >= date_from)
    if date_to:
        query = query.filter(WearLog.date_worn <= date_to)

    total = query.count()
    logs = (
        query.order_by(WearLog.date_worn.desc(), WearLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return total, logs


def save_wear_log(db: Session, *, wear_log: WearLog) -> WearLog:
    db.commit()
    db.refresh(wear_log)
    return wear_log


def delete_wear_log(db: Session, *, wear_log: WearLog) -> None:
    db.delete(wear_log)


def update_closet_item_times_worn(
    db: Session,
    *,
    user_id: UUID,
    closet_item_ids: list[UUID],
    delta: int,
) -> None:
    if not closet_item_ids:
        return

    (
        db.query(ClosetItem)
        .filter(ClosetItem.user_id == user_id, ClosetItem.id.in_(closet_item_ids))
        .update({ClosetItem.times_worn: ClosetItem.times_worn + delta}, synchronize_session=False)
    )
