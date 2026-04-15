from app.schemas.closet_items import ClosetItemOut
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime


class OutfitItemBase(BaseModel):
    closet_item_id: UUID
    position: int = Field(default=0, ge=0)
    layer: int = Field(default=1, ge=1)
    note: Optional[str] = Field(default=None, max_length=255)


class OutfitItemCreate(OutfitItemBase):
    pass


class OutfitItemOut(OutfitItemBase):
    outfit_id: UUID
    image_url: Optional[str] = None


    class Config:
        from_attributes = True


class OutfitBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    occasion: Optional[str] = Field(default=None, max_length=30)
    season: Optional[str] = Field(default=None, max_length=30)
    is_favorite: bool = False
    notes: Optional[str] = Field(default=None, max_length=500)


class OutfitReadBase(OutfitBase):
    id: UUID
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class PaginationMeta(BaseModel):
    limit: int
    offset: int
    total: int


class OutfitCreate(OutfitBase):
    items: List[OutfitItemCreate] = Field(default_factory=list)


class OutfitUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    occasion: Optional[str] = Field(default=None, max_length=30)
    season: Optional[str] = Field(default=None, max_length=30)
    is_favorite: Optional[bool] = None
    notes: Optional[str] = Field(default=None, max_length=500)
    items: Optional[List[OutfitItemCreate]] = None


class OutfitOut(OutfitReadBase):
    items: List[OutfitItemOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class OutfitListItem(OutfitReadBase):
    item_count: int
    preview_items: List[OutfitItemOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class OutfitListResponse(PaginationMeta):
    items: List[OutfitListItem]


class OutfitItemDetailOut(OutfitItemBase):
    outfit_id: UUID
    closet_item: ClosetItemOut

    class Config:
        from_attributes = True


class OutfitDetailOut(OutfitReadBase):
    items: List[OutfitItemDetailOut] = Field(default_factory=list)

    class Config:
        from_attributes = True
