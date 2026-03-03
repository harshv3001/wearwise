from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


# ---- Outfit Items ----

class OutfitItemBase(BaseModel):
    closet_item_id: int
    position: int = Field(default=0, ge=0)
    note: Optional[str] = Field(default=None, max_length=255)


class OutfitItemCreate(OutfitItemBase):
    pass


class OutfitItemOut(OutfitItemBase):
    outfit_id: int

    class Config:
        from_attributes = True


# ---- Outfits ----

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
    created_at: datetime
    updated_at: Optional[datetime] = None

    items: List[OutfitItemOut] = Field(default_factory=list)

    class Config:
        from_attributes = True
