from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from src.outfits.schemas import OutfitCreate


class WearCreate(BaseModel):
    date_worn: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=500)
    outfit_id: Optional[UUID] = None
    outfit: Optional[OutfitCreate] = None


class WearOut(BaseModel):
    outfit_id: UUID
    wear_log_id: UUID
    date_worn: date


class WearLogSummaryOut(BaseModel):
    id: UUID
    outfit_id: UUID
    date_worn: date
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class WearLogListOut(BaseModel):
    items: list[WearLogSummaryOut]
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)
