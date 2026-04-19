from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from src.closet_items.schemas import ClosetItemOut, ClosetItemSummaryOut


class OutfitCanvasLayoutBase(BaseModel):
    closet_item_id: UUID
    position: int = Field(default=0, ge=0)
    x: float
    y: float
    width: float = Field(gt=0)
    height: float = Field(gt=0)
    rotation: float = 0
    scale_x: float = Field(default=1, gt=0)
    scale_y: float = Field(default=1, gt=0)


class OutfitCanvasLayoutEntry(OutfitCanvasLayoutBase):
    pass


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
    canvas_layout: List[OutfitCanvasLayoutEntry] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None


class PaginationMeta(BaseModel):
    limit: int
    offset: int
    total: int


class OutfitCreate(OutfitBase):
    items: List[OutfitItemCreate] = Field(default_factory=list)
    canvas_layout: List[OutfitCanvasLayoutEntry] = Field(default_factory=list)


class OutfitUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    occasion: Optional[str] = Field(default=None, max_length=30)
    season: Optional[str] = Field(default=None, max_length=30)
    is_favorite: Optional[bool] = None
    notes: Optional[str] = Field(default=None, max_length=500)
    items: Optional[List[OutfitItemCreate]] = None
    canvas_layout: Optional[List[OutfitCanvasLayoutEntry]] = None


class OutfitOut(OutfitReadBase):
    items: List[OutfitItemOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class OutfitListItem(OutfitReadBase):
    item_count: int
    preview_items: List[ClosetItemSummaryOut] = Field(default_factory=list)

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
