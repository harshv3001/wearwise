import mimetypes
from pathlib import Path

from fastapi import UploadFile

from src.config import settings
from src.media.constants import ALLOWED_EXTENSIONS, ALLOWED_IMAGE_TYPES
from src.media.exceptions import InvalidUploadExtensionError, InvalidUploadTypeError


def validate_upload_file(upload_file: UploadFile) -> str:
    if upload_file.content_type not in ALLOWED_IMAGE_TYPES:
        raise InvalidUploadTypeError()

    original_name = upload_file.filename or "image"
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise InvalidUploadExtensionError()
    return extension


def build_image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    return f"{settings.API_BASE_URL}/media/{image_path}"


def infer_media_type(file_path: str) -> str:
    return mimetypes.guess_type(file_path)[0] or "application/octet-stream"
