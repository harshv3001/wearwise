from pathlib import Path
from uuid import uuid4
import shutil

from fastapi import HTTPException, UploadFile, status


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def save_upload_file(upload_file: UploadFile, upload_dir: Path) -> str:
    if upload_file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only jpg, jpeg, png, and webp images are allowed.",
        )

    original_name = upload_file.filename or "image"
    ext = Path(original_name).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file extension. Allowed: .jpg, .jpeg, .png, .webp",
        )

    unique_filename = f"{uuid4().hex}{ext}"
    file_path = upload_dir / unique_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return unique_filename


def build_image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    return f"/uploads/{image_path}"