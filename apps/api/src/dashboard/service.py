from datetime import date as date_type

from sqlalchemy.orm import Session

from src.closet_items.service import serialize_closet_item
from src.closet_items.utils import normalize_category
from src.dashboard import queries as dashboard_queries
from src.dashboard.schemas import (
    DashboardCategoryCount,
    DashboardClosetHealth,
    DashboardClosetItemUsage,
    DashboardRecentActivity,
    DashboardStats,
    DashboardSummaryOut,
    DashboardTodayOutfit,
)
from src.media.utils import build_image_url
from src.users.models import User


def serialize_dashboard_item_usage(item) -> DashboardClosetItemUsage | None:
    if not item:
        return None

    serialized = serialize_closet_item(item)
    return DashboardClosetItemUsage(
        id=serialized.id,
        name=serialized.name,
        category=serialized.category,
        times_worn=serialized.times_worn,
        image_url=serialized.image_url,
    )


def serialize_dashboard_item_usages(items) -> list[DashboardClosetItemUsage]:
    return [
        serialized_item
        for serialized_item in (
            serialize_dashboard_item_usage(item) for item in (items or [])
        )
        if serialized_item is not None
    ]


def get_dashboard_summary(*, db: Session, current_user: User) -> DashboardSummaryOut:
    today = date_type.today()
    week_start = dashboard_queries.get_week_start(today)

    total_closet_items = dashboard_queries.count_closet_items_by_user(
        db, user_id=current_user.id
    )
    saved_outfits_count = dashboard_queries.count_outfits_by_user(
        db, user_id=current_user.id
    )
    logged_today_count = dashboard_queries.count_logged_on_date(
        db, user_id=current_user.id, target_date=today
    )

    category_rows = dashboard_queries.list_category_counts(db, user_id=current_user.id)
    most_used_items = dashboard_queries.get_most_used_items(
        db, user_id=current_user.id
    )
    least_used_items = dashboard_queries.get_least_used_items(
        db, user_id=current_user.id
    )
    today_outfit_row = dashboard_queries.get_today_logged_outfit(
        db, user_id=current_user.id, target_date=today
    )

    never_worn_count = dashboard_queries.count_never_worn_items(
        db, user_id=current_user.id
    )
    low_rotation_count = dashboard_queries.count_low_rotation_items(
        db, user_id=current_user.id
    )
    logged_this_week_count = dashboard_queries.count_logged_since_date(
        db, user_id=current_user.id, start_date=week_start
    )
    last_logged_date = dashboard_queries.get_last_logged_date(
        db, user_id=current_user.id
    )

    today_logged_outfit = None
    if today_outfit_row:
        today_logged_outfit = DashboardTodayOutfit(
            wear_log_id=today_outfit_row.wear_log_id,
            outfit_id=today_outfit_row.outfit_id,
            name=today_outfit_row.name,
            occasion=today_outfit_row.occasion,
            image_url=build_image_url(today_outfit_row.image_path),
            date_worn=today_outfit_row.date_worn,
            created_at=today_outfit_row.created_at,
        )

    return DashboardSummaryOut(
        stats=DashboardStats(
            total_closet_items=total_closet_items,
            saved_outfits_count=saved_outfits_count,
            logged_today_count=logged_today_count,
        ),
        category_counts=[
            DashboardCategoryCount(
                category=normalize_category(row.category) or "Uncategorized",
                count=int(row.count),
            )
            for row in category_rows
        ],
        most_used_items=serialize_dashboard_item_usages(most_used_items),
        least_used_items=serialize_dashboard_item_usages(least_used_items),
        today_logged_outfit=today_logged_outfit,
        closet_health=DashboardClosetHealth(
            never_worn_count=never_worn_count,
            low_rotation_count=low_rotation_count,
        ),
        recent_activity=DashboardRecentActivity(
            logged_this_week_count=logged_this_week_count,
            last_logged_date=last_logged_date,
        ),
    )
