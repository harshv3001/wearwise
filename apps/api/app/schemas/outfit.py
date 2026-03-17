from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from .closet_items import ClosetItemOut


class OutfitItemBase(BaseModel):
    closet_item_id: int
    position: int = Field(default=0, ge=0)
    note: Optional[str] = Field(default=None, max_length=255)


class OutfitItemCreate(OutfitItemBase):
    pass


class OutfitItemOut(OutfitItemBase):
    outfit_id: int
    image_url: Optional[str] = None


    class Config:
        from_attributes = True


class OutfitBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    occasion: Optional[str] = Field(default=None, max_length=30)
    season: Optional[str] = Field(default=None, max_length=30)
    is_favorite: bool = False
    notes: Optional[str] = Field(default=None, max_length=500)


class OutfitCreate(OutfitBase):
    items: List[OutfitItemCreate] = Field(default_factory=list)


class OutfitUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    occasion: Optional[str] = Field(default=None, max_length=30)
    season: Optional[str] = Field(default=None, max_length=30)
    is_favorite: Optional[bool] = None
    notes: Optional[str] = Field(default=None, max_length=500)
    items: Optional[List[OutfitItemCreate]] = None


class OutfitOut(OutfitBase):
    id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OutfitItemOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class OutfitListItem(BaseModel):
    id: int
    name: str
    occasion: Optional[str] = None
    season: Optional[str] = None
    is_favorite: bool
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    item_count: int
    preview_items: List[OutfitItemOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class OutfitListResponse(BaseModel):
    items: List[OutfitListItem]
    limit: int
    offset: int
    total: int


class OutfitItemDetailOut(OutfitItemBase):
    outfit_id: int
    closet_item: ClosetItemOut

    class Config:
        from_attributes = True


class OutfitDetailOut(OutfitBase):
    id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OutfitItemDetailOut] = Field(default_factory=list)

    class Config:
        from_attributes = True