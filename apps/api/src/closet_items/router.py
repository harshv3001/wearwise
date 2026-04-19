from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from src.closet_items.dependencies import get_owned_closet_item
from src.closet_items.models import ClosetItem
from src.closet_items.schemas import (
    ClosetItemCreate,
    ClosetItemOut,
    ClosetItemSummaryOut,
    ClosetItemUpdate,
)
from src.closet_items.service import (
    create_closet_item,
    delete_closet_item,
    list_closet_items,
    serialize_closet_item,
    serialize_closet_item_summary,
    update_closet_item,
    upload_closet_item_image,
)
from src.database import get_db
from src.users.dependencies import get_authenticated_user
from src.users.models import User

router = APIRouter(prefix="/closet-items", tags=["Closet Items"])


@router.post("/", response_model=ClosetItemOut, status_code=status.HTTP_201_CREATED)
def create_item(
    payload: ClosetItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    item = create_closet_item(db=db, current_user=current_user, payload=payload)
    return serialize_closet_item(item)


@router.get("/", response_model=List[ClosetItemSummaryOut])
def list_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
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
    items = list_closet_items(
        db=db,
        current_user=current_user,
        category=category,
        color=color,
        season=season,
        price=price,
        store=store,
        material=material,
        query_text=q,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        order=order,
    )
    return [serialize_closet_item_summary(item) for item in items]


@router.get("/{item_id}", response_model=ClosetItemOut)
def get_item(item: ClosetItem = Depends(get_owned_closet_item)):
    return serialize_closet_item(item)


@router.put("/{item_id}", response_model=ClosetItemOut)
def update_item(
    payload: ClosetItemUpdate,
    db: Session = Depends(get_db),
    item: ClosetItem = Depends(get_owned_closet_item),
):
    updated_item = update_closet_item(db=db, item=item, payload=payload)
    return serialize_closet_item(updated_item)


@router.post("/{item_id}/image", response_model=ClosetItemOut)
def upload_item_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    item: ClosetItem = Depends(get_owned_closet_item),
):
    updated_item = upload_closet_item_image(db=db, item=item, file=file)
    return serialize_closet_item(updated_item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    db: Session = Depends(get_db),
    item: ClosetItem = Depends(get_owned_closet_item),
):
    delete_closet_item(db=db, item=item)
    return None
