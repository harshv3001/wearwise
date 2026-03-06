from typing import Optional
from pydantic import BaseModel, Field
from datetime import date

from app.schemas.outfit import OutfitCreate


class WearCreate(BaseModel):
    # Wear today => frontend can send null and backend uses today
    date_worn: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=500)

    # Outfit generator selection
    outfit: OutfitCreate


class WearOut(BaseModel):
    outfit_id: int
    wear_log_id: int
    date_worn: date