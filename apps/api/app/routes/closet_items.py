from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from sqlalchemy import asc, desc


from app.schemas.closet_items import ClosetItemCreate, ClosetItemOut, ClosetItemUpdate
from app.models import user as user_models
from app.models import closet_items as closet_items_models

from app.oauth2 import get_current_user

router = APIRouter(prefix="/closet-items", tags=["Closet Items"])


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
    return item


@router.get("/", response_model=List[ClosetItemOut])
def list_items(
    db: Session = Depends(get_db),
    current_user: user_models.User = Depends(get_current_user),
    # filters
    category: Optional[str] = Query(default=None),
    color: Optional[str] = Query(default=None),
    season: Optional[str] = Query(default=None),
    price: Optional[float] = Query(default=None, ge=0),
    store: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None, description="Search by name contains"),
    # pagination
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    # sorting
    sort_by: str = Query(default="created_at"),
    order: str = Query(default="desc"),
):
    closet_item = closet_items_models.ClosetItem

    query = db.query(closet_item).filter(closet_item.user_id == current_user.id)

    # apply filters
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
    if q:
        query = query.filter(closet_item.name.ilike(f"%{q}%"))

    # allowlist sortable fields
    allowed_sort_fields = {
        "created_at": closet_item.created_at,
        "times_worn": closet_item.times_worn,
        "name": closet_item.name,
        "category": closet_item.category,
        "color": closet_item.color,
        "season": closet_item.season,
        "price": closet_item.price,
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

    # pagination
    items = query.offset(offset).limit(limit).all()
    return items


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
    return item


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
        return item

    qset.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(item)
    return item


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

    qset.delete(synchronize_session=False)
    db.commit()
    return
