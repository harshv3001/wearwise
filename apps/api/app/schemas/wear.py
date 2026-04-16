from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import date

from app.schemas.outfit import OutfitCreate


class WearCreate(BaseModel):
    # Wear today => frontend can send null and backend uses today
    date_worn: Optional[date] = None
    notes: Optional[str] = Field(default=None, max_length=500)

    # Use outfit_id to report an existing saved outfit.
    outfit_id: Optional[UUID] = None

    # Use outfit to create and report a brand-new outfit in one request.
    outfit: Optional[OutfitCreate] = None


class WearOut(BaseModel):
    outfit_id: UUID
    wear_log_id: UUID
    date_worn: date
