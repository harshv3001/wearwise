from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime


class WearLogBase(BaseModel):
    date_worn: date
    notes: Optional[str] = Field(default=None, max_length=500)


class WearLogCreate(WearLogBase):
    # Required because you always auto-save outfit before reporting
    outfit_id: int


class WearLogUpdate(BaseModel):
    date_worn: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=500)


class WearLogOut(WearLogBase):
    id: int
    user_id: int
    outfit_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True