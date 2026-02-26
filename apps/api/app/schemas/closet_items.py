from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class ClosetItemBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)

    category: str = Field(min_length=1, max_length=50)

    color: Optional[str] = Field(default=None, max_length=50)
    season: Optional[str] = Field(default=None, max_length=50)
    brand: Optional[str] = Field(default=None, max_length=80)
    price: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = Field(default=None, max_length=500)
    store: Optional[str] = Field(default=None, max_length=100)
    date_acquired: Optional[date] = None


class ClosetItemCreate(ClosetItemBase):
    pass


class ClosetItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    category: Optional[str] = Field(default=None, min_length=1, max_length=50)
    color: Optional[str] = Field(default=None, max_length=50)
    season: Optional[str] = Field(default=None, max_length=50)
    brand: Optional[str] = Field(default=None, max_length=80)
    price: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = Field(default=None, max_length=500)
    store: Optional[str] = Field(default=None, max_length=100)
    times_worn: Optional[int] = Field(default=None, ge=0)
    date_acquired: Optional[date] = None


class ClosetItemOut(ClosetItemBase):
    id: int
    user_id: int
    times_worn: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
