from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.oauth2 import get_current_user
from app.models import user as user_models, outfit as outfit_models, closet_items as closet_items_models
from app.schemas.outfit import (
    OutfitCreate,
    OutfitOut,
    OutfitUpdate,
    OutfitItemCreate,
    OutfitListResponse,
    OutfitDetailOut,
)
from app.utils import save_upload_file, build_image_url, delete_upload_file

router = APIRouter(prefix="/outfits", tags=["Outfits"])


def _validate_closet_items_belong_to_user(
    db: Session,
    user_id: int,
    items: List[OutfitItemCreate],
) -> None:
    if not items:
        return

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


def _get_outfit_or_404(db: Session, outfit_id: int, user_id: int) -> outfit_models.Outfit:
    outfit = (
        db.query(outfit_models.Outfit)
        .filter(outfit_models.Outfit.id == outfit_id, outfit_models.Outfit.user_id == user_id)
        .first()
    )
    if not outfit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit not found")
    return outfit


def _serialize_outfit(outfit: outfit_models.Outfit, items) -> OutfitOut:
    return OutfitOut(
        id=outfit.id,
        name=outfit.name,
        occasion=outfit.occasion,
        season=outfit.season,
        is_favorite=outfit.is_favorite,
        notes=outfit.notes,
        image_url=build_image_url(outfit.image_path),
        created_at=outfit.created_at,
        updated_at=outfit.updated_at,
        items=items,
    )


def _serialize_outfit_detail(outfit: outfit_models.Outfit, items) -> OutfitDetailOut:
    return OutfitDetailOut(
        id=outfit.id,
        name=outfit.name,
        occasion=outfit.occasion,
        season=outfit.season,
        is_favorite=outfit.is_favorite,
        notes=outfit.notes,
        image_url=build_image_url(outfit.image_path),
        created_at=outfit.created_at,
        updated_at=outfit.updated_at,
        items=items,
    )


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=OutfitOut)
def create_outfit(
    payload: OutfitCreate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    _validate_closet_items_belong_to_user(db, current_user.id, payload.items)

    outfit = outfit_models.Outfit(
        user_id=current_user.id, **payload.model_dump(exclude={"items"})
    )
    db.add(outfit)
    db.flush()

    for it in payload.items:
        db.add(
            outfit_models.OutfitItem(
                outfit_id=outfit.id,
                closet_item_id=it.closet_item_id,
                position=it.position,
                note=it.note,
            )
        )

    db.commit()
    db.refresh(outfit)

    outfit.outfit_items
    return _serialize_outfit(outfit, outfit.outfit_items)


@router.get("/", response_model=OutfitListResponse)
def list_outfits(
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
    occasion: Optional[str] = None,
    season: Optional[str] = None,
    favorite: Optional[bool] = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    base_q = db.query(outfit_models.Outfit).filter(outfit_models.Outfit.user_id == current_user.id)

    if occasion:
        base_q = base_q.filter(outfit_models.Outfit.occasion == occasion)
    if season:
        base_q = base_q.filter(outfit_models.Outfit.season == season)
    if favorite is not None:
        base_q = base_q.filter(outfit_models.Outfit.is_favorite == favorite)

    total = base_q.count()

    outfits = (
        base_q.order_by(outfit_models.Outfit.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    outfit_ids = [o.id for o in outfits]
    previews_by_outfit = {oid: [] for oid in outfit_ids}
    counts_by_outfit = {oid: 0 for oid in outfit_ids}

    if outfit_ids:
        counts = (
            db.query(outfit_models.OutfitItem.outfit_id, func.count(outfit_models.OutfitItem.closet_item_id)) # pylint: disable=not-callable
            .filter(outfit_models.OutfitItem.outfit_id.in_(outfit_ids))
            .group_by(outfit_models.OutfitItem.outfit_id)
            .all()
        )
        for oid, count in counts:
            counts_by_outfit[oid] = int(count)

        rows = (
            db.query(
                outfit_models.OutfitItem.outfit_id,
                outfit_models.OutfitItem.closet_item_id,
                outfit_models.OutfitItem.position,
                outfit_models.OutfitItem.note,
                closet_items_models.ClosetItem.image_path,
            )
            .join(
                closet_items_models.ClosetItem,
                closet_items_models.ClosetItem.id == outfit_models.OutfitItem.closet_item_id,
            )
            .filter(outfit_models.OutfitItem.outfit_id.in_(outfit_ids))
            .order_by(
                outfit_models.OutfitItem.outfit_id.asc(),
                outfit_models.OutfitItem.position.asc(),
            )
            .all()
        )
        for row in rows:
            previews_by_outfit[row.outfit_id].append(
                {
                    "closet_item_id": row.closet_item_id,
                    "position": row.position,
                    "outfit_id": row.outfit_id,
                    "note": row.note,
                    "image_url": build_image_url(row.image_path),
                }
            )

    items = []
    for outfit in outfits:
        items.append(
            {
                "id": outfit.id,
                "name": outfit.name,
                "occasion": outfit.occasion,
                "season": outfit.season,
                "is_favorite": outfit.is_favorite,
                "image_url": build_image_url(outfit.image_path),
                "created_at": outfit.created_at,
                "updated_at": outfit.updated_at,
                "item_count": counts_by_outfit.get(outfit.id, 0),
                "preview_items": previews_by_outfit.get(outfit.id, []),
            }
        )

    return {"items": items, "limit": limit, "offset": offset, "total": total}


@router.get("/{outfit_id}", response_model=OutfitDetailOut)
def get_outfit(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    outfit = _get_outfit_or_404(db, outfit_id, current_user.id)

    outfit_items = (
        db.query(outfit_models.OutfitItem)
        .options(joinedload(outfit_models.OutfitItem.closet_item))
        .filter(outfit_models.OutfitItem.outfit_id == outfit.id)
        .order_by(outfit_models.OutfitItem.position.asc())
        .all()
    )

    return _serialize_outfit_detail(outfit, outfit_items)


@router.patch("/{outfit_id}", response_model=OutfitOut)
def update_outfit(
    outfit_id: int,
    payload: OutfitUpdate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    outfit = _get_outfit_or_404(db, outfit_id, current_user.id)

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
        _validate_closet_items_belong_to_user(db, current_user.id, payload.items)

        db.query(outfit_models.OutfitItem).filter(
            outfit_models.OutfitItem.outfit_id == outfit.id
        ).delete()

        for it in payload.items:
            db.add(
                outfit_models.OutfitItem(
                    outfit_id=outfit.id,
                    closet_item_id=it.closet_item_id,
                    position=it.position,
                    note=it.note,
                )
            )

    db.commit()
    db.refresh(outfit)

    outfit_items = (
        db.query(outfit_models.OutfitItem)
        .filter(outfit_models.OutfitItem.outfit_id == outfit.id)
        .order_by(outfit_models.OutfitItem.position.asc())
        .all()
    )

    return _serialize_outfit(outfit, outfit_items)


@router.post("/{outfit_id}/image", response_model=OutfitDetailOut)
def upload_outfit_image(
    outfit_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    outfit = _get_outfit_or_404(db, outfit_id, current_user.id)

    new_image_key = save_upload_file(file, folder="outfits")

    if outfit.image_path:
        delete_upload_file(outfit.image_path)

    outfit.image_path = new_image_key
    db.commit()
    db.refresh(outfit)

    outfit_items = (
        db.query(outfit_models.OutfitItem)
        .options(joinedload(outfit_models.OutfitItem.closet_item))
        .filter(outfit_models.OutfitItem.outfit_id == outfit.id)
        .order_by(outfit_models.OutfitItem.position.asc())
        .all()
    )

    return _serialize_outfit_detail(outfit, outfit_items)


@router.delete("/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_outfit(
    outfit_id: int,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    outfit = _get_outfit_or_404(db, outfit_id, current_user.id)

    if outfit.image_path:
        delete_upload_file(outfit.image_path)

    db.delete(outfit)
    db.commit()
    return