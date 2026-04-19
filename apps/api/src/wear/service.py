from datetime import date as date_type
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.outfits import queries as outfit_queries
from src.outfits.schemas import OutfitItemCreate
from src.outfits.service import validate_closet_items_belong_to_user
from src.users.models import User
from src.wear import queries as wear_queries
from src.wear.exceptions import (
    OutfitMustContainClosetItemsError,
    OutfitSelectionConflictError,
    OutfitSelectionRequiredError,
    WearDeleteFailedError,
    WearOperationFailedError,
)
from src.wear.log_schemas import WearLogOut, WearLogUpdate
from src.wear.schemas import WearCreate, WearOut
from src.wear.utils import serialize_wear_log_summary


def wear_outfit(*, db: Session, current_user: User, payload: WearCreate) -> WearOut:
    date_worn = payload.date_worn or date_type.today()

    try:
        if payload.outfit_id and payload.outfit:
            raise OutfitSelectionConflictError()

        if payload.outfit_id:
            outfit = outfit_queries.get_outfit_by_id_and_user(
                db,
                outfit_id=payload.outfit_id,
                user_id=current_user.id,
            )
            if not outfit:
                raise HTTPException(status_code=404, detail="Outfit not found")

            closet_item_ids = outfit_queries.get_outfit_closet_item_ids(db, outfit_id=outfit.id)
            if not closet_item_ids:
                raise OutfitMustContainClosetItemsError()
        elif payload.outfit:
            outfit_payload = payload.outfit
            if not outfit_payload.items:
                raise OutfitMustContainClosetItemsError()
            validate_closet_items_belong_to_user(
                db,
                user_id=current_user.id,
                items=outfit_payload.items,
            )

            outfit = outfit_queries.create_outfit(
                db,
                user_id=current_user.id,
                outfit_data=outfit_payload.model_dump(exclude={"items"}),
            )
            outfit_queries.add_outfit_items(db, outfit_id=outfit.id, items=outfit_payload.items)
            closet_item_ids = [item.closet_item_id for item in outfit_payload.items]
        else:
            raise OutfitSelectionRequiredError()

        wear_log = wear_queries.create_wear_log(
            db,
            user_id=current_user.id,
            outfit_id=outfit.id,
            date_worn=date_worn,
            notes=payload.notes,
        )
        wear_queries.update_closet_item_times_worn(
            db,
            user_id=current_user.id,
            closet_item_ids=closet_item_ids,
            delta=1,
        )
        db.commit()

        return WearOut(outfit_id=outfit.id, wear_log_id=wear_log.id, date_worn=date_worn)
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise WearOperationFailedError() from exc


def list_wear_logs(
    *,
    db: Session,
    current_user: User,
    date_from: Optional[date_type],
    date_to: Optional[date_type],
    limit: int,
    offset: int,
) -> dict:
    total, wear_logs = wear_queries.list_wear_logs_by_user(
        db,
        user_id=current_user.id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )
    return {
        "items": [serialize_wear_log_summary(wear_log) for wear_log in wear_logs],
        "limit": limit,
        "offset": offset,
        "total": total,
    }


def update_wear_log(*, db: Session, wear_log, payload: WearLogUpdate) -> WearLogOut:
    if payload.date_worn is not None:
        wear_log.date_worn = payload.date_worn
    if payload.notes is not None:
        wear_log.notes = payload.notes
    wear_queries.save_wear_log(db, wear_log=wear_log)
    return wear_log


def delete_wear_log(*, db: Session, current_user: User, wear_log) -> None:
    closet_item_ids = outfit_queries.get_outfit_closet_item_ids(db, outfit_id=wear_log.outfit_id)
    try:
        wear_queries.update_closet_item_times_worn(
            db,
            user_id=current_user.id,
            closet_item_ids=closet_item_ids,
            delta=-1,
        )
        wear_queries.delete_wear_log(db, wear_log=wear_log)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise WearDeleteFailedError() from exc
