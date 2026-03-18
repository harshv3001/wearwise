from pathlib import Path
import os

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import asc, desc

from app.database import get_db
from app.schemas.closet_items import ClosetItemCreate, ClosetItemOut, ClosetItemUpdate
from app.models import user as user_models
from app.models import closet_items as closet_items_models
from app.oauth2 import get_current_user
from app.utils import save_upload_file, build_image_url

router = APIRouter(prefix="/closet-items", tags=["Closet Items"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLOSET_ITEM_UPLOAD_DIR = BASE_DIR / "uploads" / "closet_items"


def _serialize_closet_item(item: closet_items_models.ClosetItem) -> ClosetItemOut:
    return ClosetItemOut(
        id=item.id,
        user_id=item.user_id,
        name=item.name,
        category=item.category,
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


@router.post("/", response_model=ClosetItemOut, status_code=status.HTTP_201_CREATED)
def create_item(
    payload: ClosetItemCreate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    item = closet_items_models.ClosetItem(
        user_id=current_user.id, **payload.model_dump()
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _serialize_closet_item(item)


@router.get("/", response_model=List[ClosetItemOut])
def list_items(
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
    category: Optional[str] = Query(default=None),
    color: Optional[str] = Query(default=None),
    season: Optional[str] = Query(default=None),
    price: Optional[float] = Query(default=None, ge=0),
    store: Optional[str] = Query(default=None),
    material: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None, description="Search by name contains"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    sort_by: str = Query(default="created_at"),
    order: str = Query(default="desc"),
):
    closet_item = closet_items_models.ClosetItem

    query = db.query(closet_item).filter(closet_item.user_id == current_user.id)

    if category:
        query = query.filter(closet_item.category == category)
    if color:
        query = query.filter(closet_item.color == color)
    if season:
        query = query.filter(closet_item.season == season)
    if price is not None:
        query = query.filter(closet_item.price == price)
    if store:
        query = query.filter(closet_item.store == store)
    if material:
        query = query.filter(closet_item.material == material)
    if q:
        query = query.filter(closet_item.name.ilike(f"%{q}%"))

    allowed_sort_fields = {
        "created_at": closet_item.created_at,
        "times_worn": closet_item.times_worn,
        "name": closet_item.name,
        "category": closet_item.category,
        "color": closet_item.color,
        "season": closet_item.season,
        "price": closet_item.price,
        "store": closet_item.store,
        "material": closet_item.material,
    }

    sort_column = allowed_sort_fields.get(sort_by)
    if not sort_column:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort_by. Allowed: {', '.join(allowed_sort_fields.keys())}",
        )

    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    elif order.lower() == "desc":
        query = query.order_by(desc(sort_column))
    else:
        raise HTTPException(
            status_code=400, detail="Invalid order. Use 'asc' or 'desc'"
        )

    items = query.offset(offset).limit(limit).all()
    return [_serialize_closet_item(item) for item in items]


@router.get("/{item_id}", response_model=ClosetItemOut)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    closet_item = closet_items_models.ClosetItem
    item = (
        db.query(closet_item)
        .filter(
            closet_item.id == item_id,
            closet_item.user_id == current_user.id,
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Closet item not found")
    return _serialize_closet_item(item)


@router.put("/{item_id}", response_model=ClosetItemOut)
def update_item(
    item_id: int,
    payload: ClosetItemUpdate,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    closet_item = closet_items_models.ClosetItem
    qset = db.query(closet_item).filter(
        closet_item.id == item_id,
        closet_item.user_id == current_user.id,
    )
    item = qset.first()
    if not item:
        raise HTTPException(status_code=404, detail="Closet item not found")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return _serialize_closet_item(item)

    qset.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(item)
    return _serialize_closet_item(item)


@router.post("/{item_id}/image", response_model=ClosetItemOut)
def upload_closet_item_image(
    item_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    closet_item = closet_items_models.ClosetItem
    item = (
        db.query(closet_item)
        .filter(
            closet_item.id == item_id,
            closet_item.user_id == current_user.id,
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Closet item not found")

    filename = save_upload_file(file, CLOSET_ITEM_UPLOAD_DIR)

    if item.image_path:
        old_file_path = BASE_DIR / "uploads" / item.image_path
        if old_file_path.exists():
            os.remove(old_file_path)

    item.image_path = f"closet_items/{filename}"
    db.commit()
    db.refresh(item)

    return _serialize_closet_item(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
):
    closet_item = closet_items_models.ClosetItem
    qset = db.query(closet_item).filter(
        closet_item.id == item_id,
        closet_item.user_id == current_user.id,
    )
    item = qset.first()
    if not item:
        raise HTTPException(status_code=404, detail="Closet item not found")

    if item.image_path:
        file_path = BASE_DIR / "uploads" / item.image_path
        if file_path.exists():
            os.remove(file_path)

    qset.delete(synchronize_session=False)
    db.commit()
    return