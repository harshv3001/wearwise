from datetime import date as date_type
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import get_db
from app.oauth2 import get_current_user

from app.models import (
    user as user_models,
    outfit as outfit_models,
    closet_items as closet_items_models,
    wear_log as wear_log_models,
)

from app.schemas.wear import WearCreate, WearOut
from app.schemas.wear_log import WearLogCreate, WearLogOut, WearLogUpdate
from app.schemas.outfit import OutfitItemCreate


router = APIRouter(prefix="/wear", tags=["Wear"])


# -------- helpers --------

def _validate_closet_items_belong_to_user(
    db: Session,
    user_id: int,
    items: List[OutfitItemCreate],
) -> None:
    if not items or len(items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Outfit must contain at least one closet item.",
        )

    ids = [i.closet_item_id for i in items]

    if len(ids) != len(set(ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate closet_item_id in items.",
        )

    found = (
        db.query(closet_items_models.ClosetItem.id)
        .filter(
            closet_items_models.ClosetItem.user_id == user_id,
            closet_items_models.ClosetItem.id.in_(ids),
        )
        .all()
    )
    found_ids = {row[0] for row in found}

    missing = [cid for cid in ids if cid not in found_ids]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Closet items not found: {missing}",
        )


def _get_wearlog_or_404(db: Session, wear_log_id: int, user_id: int) -> wear_log_models.WearLog:
    wl = (
        db.query(wear_log_models.WearLog)
        .filter(wear_log_models.WearLog.id == wear_log_id, wear_log_models.WearLog.user_id == user_id)
        .first()
    )
    if not wl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wear log not found")
    return wl


def _get_outfit_item_ids(db: Session, outfit_id: int) -> List[int]:
    rows = (
        db.query(outfit_models.OutfitItem.closet_item_id)
        .filter(outfit_models.OutfitItem.outfit_id == outfit_id)
        .all()
    )
    return [r[0] for r in rows]


def _inc_times_worn(db: Session, user_id: int, closet_item_ids: List[int], delta: int) -> None:
    if not closet_item_ids:
        return

    # Atomic update (but prevent going below 0 with a small safe-guard by read+write if needed)
    # For simplicity: do atomic update, and rely on correct usage (delete only once).
    (
        db.query(closet_items_models.ClosetItem)
        .filter(
            closet_items_models.ClosetItem.user_id == user_id,
            closet_items_models.ClosetItem.id.in_(closet_item_ids),
        )
        .update(
            {closet_items_models.ClosetItem.times_worn: closet_items_models.ClosetItem.times_worn + delta},
            synchronize_session=False,
        )
    )


# -------- routes --------

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=WearOut)
def wear_outfit(
    payload: WearCreate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    date_worn = payload.date_worn or date_type.today()
    outfit_payload = payload.outfit

    _validate_closet_items_belong_to_user(db, current_user.id, outfit_payload.items)

    try:
        # 1) Create Outfit
        outfit = outfit_models.Outfit(
            user_id=current_user.id,
            **outfit_payload.model_dump(exclude={"items"}),
        )
        db.add(outfit)
        db.flush()

        # 2) Create OutfitItems
        for it in outfit_payload.items:
            db.add(
                outfit_models.OutfitItem(
                    outfit_id=outfit.id,
                    closet_item_id=it.closet_item_id,
                    position=it.position,
                    note=it.note,
                )
            )

        # 3) Create WearLog
        wear_log_in = WearLogCreate(
            outfit_id=outfit.id,
            date_worn=date_worn,
            notes=payload.notes,
        )
        wear_log = wear_log_models.WearLog(user_id=current_user.id, **wear_log_in.model_dump())
        db.add(wear_log)
        db.flush()

        # 4) Increment times_worn
        ids = [i.closet_item_id for i in outfit_payload.items]
        _inc_times_worn(db, current_user.id, ids, delta=1)

        db.commit()

        return WearOut(outfit_id=outfit.id, wear_log_id=wear_log.id, date_worn=date_worn)

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to wear/report outfit.",
        )


@router.get("/", response_model=dict)
def list_wear_logs(
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
    date_from: Optional[date_type] = None,
    date_to: Optional[date_type] = None,
    limit: int = Query(default=30, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    q = db.query(wear_log_models.WearLog).filter(wear_log_models.WearLog.user_id == current_user.id)

    if date_from:
        q = q.filter(wear_log_models.WearLog.date_worn >= date_from)
    if date_to:
        q = q.filter(wear_log_models.WearLog.date_worn <= date_to)

    total = q.count()

    logs = (
        q.order_by(wear_log_models.WearLog.date_worn.desc(), wear_log_models.WearLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    # lightweight summary list
    items = []
    for wl in logs:
        items.append(
            {
                "id": wl.id,
                "outfit_id": wl.outfit_id,
                "date_worn": wl.date_worn,
                "notes": wl.notes,
                "created_at": wl.created_at,
                "updated_at": wl.updated_at,
            }
        )

    return {"items": items, "limit": limit, "offset": offset, "total": total}


@router.get("/{wear_log_id}", response_model=WearLogOut)
def get_wear_log(
    wear_log_id: int,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    wl = _get_wearlog_or_404(db, wear_log_id, current_user.id)
    return wl


@router.patch("/{wear_log_id}", response_model=WearLogOut)
def update_wear_log(
    wear_log_id: int,
    payload: WearLogUpdate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    wl = _get_wearlog_or_404(db, wear_log_id, current_user.id)

    if payload.date_worn is not None:
        wl.date_worn = payload.date_worn

    if payload.notes is not None:
        wl.notes = payload.notes

    db.commit()
    db.refresh(wl)
    return wl

@router.delete("/{wear_log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wear_log(
    wear_log_id: int,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    wl = _get_wearlog_or_404(db, wear_log_id, current_user.id)

    # decrement times_worn based on the outfit items used in this log
    item_ids = _get_outfit_item_ids(db, wl.outfit_id)

    try:
        _inc_times_worn(db, current_user.id, item_ids, delta=-1)
        db.delete(wl)
        db.commit()
        return
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete wear log.",
        )