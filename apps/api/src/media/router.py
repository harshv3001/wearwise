from fastapi import APIRouter

from src.media.service import get_media_response

router = APIRouter(prefix="/media", tags=["Media"])


@router.get("/{file_path:path}")
def get_media(file_path: str):
    return get_media_response(file_path)
