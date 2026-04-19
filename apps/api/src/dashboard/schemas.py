from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class DashboardCategoryCount(BaseModel):
    category: str
    count: int = Field(ge=0)


class DashboardStats(BaseModel):
    total_closet_items: int = Field(ge=0)
    saved_outfits_count: int = Field(ge=0)
    logged_today_count: int = Field(ge=0)


class DashboardClosetItemUsage(BaseModel):
    id: UUID
    name: str
    category: str
    times_worn: int = Field(ge=0)
    image_url: Optional[str] = None


class DashboardTodayOutfit(BaseModel):
    wear_log_id: UUID
    outfit_id: UUID
    name: str
    occasion: Optional[str] = None
    image_url: Optional[str] = None
    date_worn: date
    created_at: datetime


class DashboardClosetHealth(BaseModel):
    never_worn_count: int = Field(ge=0)
    low_rotation_count: int = Field(ge=0)


class DashboardRecentActivity(BaseModel):
    logged_this_week_count: int = Field(ge=0)
    last_logged_date: Optional[date] = None


class DashboardSummaryOut(BaseModel):
    stats: DashboardStats
    category_counts: list[DashboardCategoryCount]
    most_used_items: list[DashboardClosetItemUsage] = Field(default_factory=list)
    least_used_items: list[DashboardClosetItemUsage] = Field(default_factory=list)
    today_logged_outfit: Optional[DashboardTodayOutfit] = None
    closet_health: DashboardClosetHealth
    recent_activity: DashboardRecentActivity
