from app.utils import build_image_url
from src.closet_items.constants import DEFAULT_SUMMARY_CATEGORY
from src.closet_items.models import ClosetItem
from src.outfits.schemas import (
    OutfitDetailOut,
    OutfitItemDetailOut,
    OutfitItemOut,
    OutfitOut,
)


def serialize_canvas_layout(canvas_layout):
    return canvas_layout or []


def serialize_closet_item_payload(closet_item: ClosetItem) -> dict:
    return {
        "id": closet_item.id,
        "user_id": closet_item.user_id,
        "name": closet_item.name,
        "category": closet_item.category,
        "color": closet_item.color,
        "season": closet_item.season,
        "brand": closet_item.brand,
        "price": closet_item.price,
        "notes": closet_item.notes,
        "store": closet_item.store,
        "material": closet_item.material,
        "date_acquired": closet_item.date_acquired,
        "times_worn": closet_item.times_worn,
        "image_url": build_image_url(closet_item.image_path),
        "created_at": closet_item.created_at,
        "updated_at": closet_item.updated_at,
    }


def serialize_outfit_items(items) -> list[OutfitItemOut]:
    return [
        OutfitItemOut(
            closet_item_id=item.closet_item_id,
            position=item.position,
            layer=item.layer,
            note=item.note,
            outfit_id=item.outfit_id,
            image_url=build_image_url(
                item.closet_item.image_path if getattr(item, "closet_item", None) else None
            ),
        )
        for item in items
    ]


def serialize_outfit_detail_items(items) -> list[OutfitItemDetailOut]:
    return [
        OutfitItemDetailOut(
            closet_item_id=item.closet_item_id,
            position=item.position,
            layer=item.layer,
            note=item.note,
            outfit_id=item.outfit_id,
            closet_item=serialize_closet_item_payload(item.closet_item),
        )
        for item in items
    ]


def serialize_outfit(outfit, items) -> OutfitOut:
    return OutfitOut(
        id=outfit.id,
        name=outfit.name,
        occasion=outfit.occasion,
        season=outfit.season,
        is_favorite=outfit.is_favorite,
        notes=outfit.notes,
        image_url=build_image_url(outfit.image_path),
        canvas_layout=serialize_canvas_layout(outfit.canvas_layout),
        created_at=outfit.created_at,
        updated_at=outfit.updated_at,
        items=serialize_outfit_items(items),
    )


def serialize_outfit_detail(outfit, items) -> OutfitDetailOut:
    return OutfitDetailOut(
        id=outfit.id,
        name=outfit.name,
        occasion=outfit.occasion,
        season=outfit.season,
        is_favorite=outfit.is_favorite,
        notes=outfit.notes,
        image_url=build_image_url(outfit.image_path),
        canvas_layout=serialize_canvas_layout(outfit.canvas_layout),
        created_at=outfit.created_at,
        updated_at=outfit.updated_at,
        items=serialize_outfit_detail_items(items),
    )


def serialize_preview_closet_item(row):
    return {
        "id": row.closet_item_id,
        "name": row.name,
        "category": row.category or DEFAULT_SUMMARY_CATEGORY,
        "image_url": build_image_url(row.image_path),
    }
