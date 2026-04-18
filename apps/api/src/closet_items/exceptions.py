from fastapi import HTTPException

from src.closet_items.constants import ALLOWED_SORT_FIELDS


class ClosetItemNotFoundError(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=404, detail="Closet item not found")


class InvalidClosetItemSortFieldError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=400,
            detail=f"Invalid sort_by. Allowed: {', '.join(ALLOWED_SORT_FIELDS)}",
        )


class InvalidClosetItemSortOrderError(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=400, detail="Invalid order. Use 'asc' or 'desc'")
