from datetime import date
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
