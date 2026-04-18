from typing import Optional

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.outfits.dependencies import get_owned_outfit
from src.outfits.models import Outfit
from src.outfits.schemas import OutfitCreate, OutfitDetailOut, OutfitListResponse, OutfitOut, OutfitUpdate
from src.outfits.service import (
    create_outfit,
    delete_outfit,
    get_outfit_detail,
    list_outfits,
    update_outfit,
    upload_outfit_image,
)
from src.users.dependencies import get_authenticated_user
from src.users.models import User

router = APIRouter(prefix="/outfits", tags=["Outfits"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=OutfitOut)
def create_outfit_route(
    payload: OutfitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    return create_outfit(db=db, current_user=current_user, payload=payload)


@router.get("/", response_model=OutfitListResponse)
def list_outfits_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    occasion: Optional[str] = None,
    season: Optional[str] = None,
    favorite: Optional[bool] = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    return list_outfits(
        db=db,
        current_user=current_user,
        occasion=occasion,
        season=season,
        favorite=favorite,
        limit=limit,
        offset=offset,
    )


@router.get("/{outfit_id}", response_model=OutfitDetailOut)
def get_outfit_route(
    db: Session = Depends(get_db),
    outfit: Outfit = Depends(get_owned_outfit),
):
    return get_outfit_detail(db=db, outfit=outfit)


@router.patch("/{outfit_id}", response_model=OutfitDetailOut)
def update_outfit_route(
    payload: OutfitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    outfit: Outfit = Depends(get_owned_outfit),
):
    return update_outfit(db=db, outfit=outfit, current_user=current_user, payload=payload)


@router.post("/{outfit_id}/image", response_model=OutfitDetailOut)
def upload_outfit_image_route(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    outfit: Outfit = Depends(get_owned_outfit),
):
    return upload_outfit_image(db=db, outfit=outfit, file=file)


@router.delete("/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_outfit_route(
    db: Session = Depends(get_db),
    outfit: Outfit = Depends(get_owned_outfit),
):
    delete_outfit(db=db, outfit=outfit)
    return None
