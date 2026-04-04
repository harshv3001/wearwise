from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime
from uuid import UUID


class WearLogBase(BaseModel):
    date_worn: date
    notes: Optional[str] = Field(default=None, max_length=500)


class WearLogCreate(WearLogBase):
    # Required because you always auto-save outfit before reporting
    outfit_id: UUID


class WearLogUpdate(BaseModel):
    date_worn: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=500)


class WearLogOut(WearLogBase):
    id: UUID
    user_id: UUID
    outfit_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
