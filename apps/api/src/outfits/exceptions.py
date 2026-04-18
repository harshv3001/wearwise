from fastapi import HTTPException, status


class OutfitNotFoundError(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Outfit not found")


class DuplicateOutfitClosetItemError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate closet_item_id in items.",
        )


class DuplicateCanvasLayoutClosetItemError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate closet_item_id in canvas_layout.",
        )


class OutfitCanvasLayoutMismatchError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="canvas_layout must contain exactly the same closet_item_id values as items.",
        )


class OutfitClosetItemsNotFoundError(HTTPException):
    def __init__(self, missing_ids: list) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Closet items not found: {missing_ids}",
        )
