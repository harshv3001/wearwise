from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database import get_db
from app.oauth2 import get_current_user
from app.models import outfit as outfit_models
from app.schemas.outfit import (
    OutfitCreate,
    OutfitOut,
    OutfitUpdate,
    OutfitItemCreate,
    OutfitItemOut,
    OutfitItemDetailOut,
    OutfitListResponse,
    OutfitDetailOut,
)
from app.schemas.closet_items import ClosetItemSummaryOut
from app.utils import save_upload_file, build_image_url, delete_upload_file
from src.closet_items.models import ClosetItem
from src.users.models import User

router = APIRouter(prefix="/outfits", tags=["Outfits"])


def _validate_closet_items_belong_to_user(
    db: Session,
    user_id: UUID,
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
        db.query(ClosetItem.id)
        .filter(
            ClosetItem.user_id == user_id,
            ClosetItem.id.in_(ids),
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


def _validate_canvas_layout(items: List[OutfitItemCreate], canvas_layout) -> None:
    if not canvas_layout:
        return

    item_ids = [item.closet_item_id for item in items]
    item_id_set = set(item_ids)

    if len(item_ids) != len(item_id_set):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate closet_item_id in items.",
        )

    layout_ids = [entry.closet_item_id for entry in canvas_layout]

    if len(layout_ids) != len(set(layout_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate closet_item_id in canvas_layout.",
        )

    missing_from_layout = [item_id for item_id in item_ids if item_id not in set(layout_ids)]
    extra_in_layout = [layout_id for layout_id in layout_ids if layout_id not in item_id_set]

    if missing_from_layout or extra_in_layout:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="canvas_layout must contain exactly the same closet_item_id values as items.",
        )


def _get_outfit_or_404(db: Session, outfit_id: UUID, user_id: UUID) -> outfit_models.Outfit:
    outfit = (
        db.query(outfit_models.Outfit)
        .filter(outfit_models.Outfit.id == outfit_id, outfit_models.Outfit.user_id == user_id)
        .first()
    )
    if not outfit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit not found")
    return outfit


def _serialize_canvas_layout(canvas_layout):
    return canvas_layout or []


def _serialize_closet_item(closet_item: ClosetItem):
    return {
        "id": closet_item.id,
        "user_id": closet_item.user_id,
        "name": closet_item.name,
        "category": closet_item.category,
        "color": closet_item.color,
        "season": closet_item.season,
        "brand": closet_item.brand,
        "price": closet_item.price,
        "notes": closet_item.notes,
        "store": closet_item.store,
        "material": closet_item.material,
        "date_acquired": closet_item.date_acquired,
        "times_worn": closet_item.times_worn,
        "image_url": build_image_url(closet_item.image_path),
        "created_at": closet_item.created_at,
        "updated_at": closet_item.updated_at,
    }


def _serialize_outfit_items(items) -> List[OutfitItemOut]:
    serialized_items = []
    for item in items:
        serialized_items.append(
            OutfitItemOut(
                closet_item_id=item.closet_item_id,
                position=item.position,
                layer=item.layer,
                note=item.note,
                outfit_id=item.outfit_id,
                image_url=build_image_url(
                    item.closet_item.image_path if getattr(item, "closet_item", None) else None
                ),
            )
        )
    return serialized_items


def _serialize_outfit_detail_items(items) -> List[OutfitItemDetailOut]:
    serialized_items = []
    for item in items:
        serialized_items.append(
            OutfitItemDetailOut(
                closet_item_id=item.closet_item_id,
                position=item.position,
                layer=item.layer,
                note=item.note,
                outfit_id=item.outfit_id,
                closet_item=_serialize_closet_item(item.closet_item),
            )
        )
    return serialized_items


def _serialize_outfit(outfit: outfit_models.Outfit, items) -> OutfitOut:
    return OutfitOut(
        id=outfit.id,
        name=outfit.name,
        occasion=outfit.occasion,
        season=outfit.season,
        is_favorite=outfit.is_favorite,
        notes=outfit.notes,
        image_url=build_image_url(outfit.image_path),
        canvas_layout=_serialize_canvas_layout(outfit.canvas_layout),
        created_at=outfit.created_at,
        updated_at=outfit.updated_at,
        items=_serialize_outfit_items(items),
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
        canvas_layout=_serialize_canvas_layout(outfit.canvas_layout),
        created_at=outfit.created_at,
        updated_at=outfit.updated_at,
        items=_serialize_outfit_detail_items(items),
    )


def _serialize_preview_closet_item(row) -> ClosetItemSummaryOut:
    return ClosetItemSummaryOut(
        id=row.closet_item_id,
        name=row.name,
        category=row.category or "Uncategorized",
        image_url=build_image_url(row.image_path),
    )


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=OutfitOut)
def create_outfit(
    payload: OutfitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _validate_closet_items_belong_to_user(db, current_user.id, payload.items)
    _validate_canvas_layout(payload.items, payload.canvas_layout)

    outfit = outfit_models.Outfit(
        user_id=current_user.id,
        **payload.model_dump(exclude={"items"}, mode="json")
    )
    db.add(outfit)
    db.flush()

    for it in payload.items:
        db.add(
            outfit_models.OutfitItem(
                outfit_id=outfit.id,
                closet_item_id=it.closet_item_id,
                position=it.position,
                layer=it.layer,
                note=it.note,
            )
        )

    db.commit()
    db.refresh(outfit)

    outfit_items = (
        db.query(outfit_models.OutfitItem)
        .options(joinedload(outfit_models.OutfitItem.closet_item))
        .filter(outfit_models.OutfitItem.outfit_id == outfit.id)
        .order_by(
            outfit_models.OutfitItem.position.asc(),
            outfit_models.OutfitItem.layer.asc(),
        )
        .all()
    )

    return _serialize_outfit(outfit, outfit_items)


@router.get("/", response_model=OutfitListResponse)
def list_outfits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
                ClosetItem.name,
                ClosetItem.category,
                ClosetItem.image_path,
            )
            .join(
                ClosetItem,
                ClosetItem.id == outfit_models.OutfitItem.closet_item_id,
            )
            .filter(outfit_models.OutfitItem.outfit_id.in_(outfit_ids))
            .order_by(
                outfit_models.OutfitItem.outfit_id.asc(),
                outfit_models.OutfitItem.position.asc(),
                outfit_models.OutfitItem.layer.asc(),
            )
            .all()
        )
        for row in rows:
            previews_by_outfit[row.outfit_id].append(_serialize_preview_closet_item(row))

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
                "canvas_layout": _serialize_canvas_layout(outfit.canvas_layout),
                "created_at": outfit.created_at,
                "updated_at": outfit.updated_at,
                "item_count": counts_by_outfit.get(outfit.id, 0),
                "preview_items": previews_by_outfit.get(outfit.id, []),
            }
        )

    return {"items": items, "limit": limit, "offset": offset, "total": total}


@router.get("/{outfit_id}", response_model=OutfitDetailOut)
def get_outfit(
    outfit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = _get_outfit_or_404(db, outfit_id, current_user.id)

    outfit_items = (
        db.query(outfit_models.OutfitItem)
        .options(joinedload(outfit_models.OutfitItem.closet_item))
        .filter(outfit_models.OutfitItem.outfit_id == outfit.id)
        .order_by(
            outfit_models.OutfitItem.position.asc(),
            outfit_models.OutfitItem.layer.asc(),
        )
        .all()
    )

    return _serialize_outfit_detail(outfit, outfit_items)


@router.patch("/{outfit_id}", response_model=OutfitDetailOut)
def update_outfit(
    outfit_id: UUID,
    payload: OutfitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = _get_outfit_or_404(db, outfit_id, current_user.id)

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
                    layer=it.layer,
                    note=it.note,
                )
            )

    if payload.canvas_layout is not None:
        _validate_canvas_layout(next_items, payload.canvas_layout)
        outfit.canvas_layout = [
            entry.model_dump(mode="json") for entry in payload.canvas_layout
        ]

    db.commit()
    db.refresh(outfit)

    outfit_items = (
        db.query(outfit_models.OutfitItem)
        .options(joinedload(outfit_models.OutfitItem.closet_item))
        .filter(outfit_models.OutfitItem.outfit_id == outfit.id)
        .order_by(
            outfit_models.OutfitItem.position.asc(),
            outfit_models.OutfitItem.layer.asc(),
        )
        .all()
    )

    return _serialize_outfit_detail(outfit, outfit_items)


@router.post("/{outfit_id}/image", response_model=OutfitDetailOut)
def upload_outfit_image(
    outfit_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
        .order_by(
            outfit_models.OutfitItem.position.asc(),
            outfit_models.OutfitItem.layer.asc(),
        )
        .all()
    )

    return _serialize_outfit_detail(outfit, outfit_items)


@router.delete("/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_outfit(
    outfit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = _get_outfit_or_404(db, outfit_id, current_user.id)

    if outfit.image_path:
        delete_upload_file(outfit.image_path)

    db.delete(outfit)
    db.commit()
    return
