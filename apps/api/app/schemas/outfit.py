from typing import Optional, Set
from pydantic import BaseModel, Field

class OutfitBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    closet_items_ids: Optional[Set[int]] = None

class OutfitCreate(OutfitBase):
    pass

class OutfitUpdate(BaseModel):
    name: Optional[str] = Field(min_length=1, max_length=100)
    closet_items_ids: Optional[Set[int]] = None

class OutfitOut(OutfitBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

