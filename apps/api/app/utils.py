from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

from pathlib import Path
from uuid import uuid4
import os

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, UploadFile, status
from app.config import settings

#checking CI/CD pipeline

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)



ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=AWS_REGION,
)


def _validate_upload_file(upload_file: UploadFile) -> str:
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

    return ext


def save_upload_file(upload_file: UploadFile, folder: str = "closet_items") -> str:
    ext = _validate_upload_file(upload_file)

    unique_filename = f"{uuid4().hex}{ext}"
    s3_key = f"{folder}/{unique_filename}"

    try:
        upload_file.file.seek(0)
        s3_client.upload_fileobj(
            upload_file.file,
            AWS_BUCKET_NAME,
            s3_key,
            ExtraArgs={
                "ContentType": upload_file.content_type,
            },
        )
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image to storage.",
        ) from e

    return s3_key


def delete_upload_file(s3_key: str | None) -> None:
    if not s3_key:
        return

    try:
        s3_client.delete_object(Bucket=AWS_BUCKET_NAME, Key=s3_key)
    except (BotoCoreError, ClientError):
        # keep delete non-blocking for now
        pass


def build_image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None

    return f"{settings.API_BASE_URL}/media/{image_path}"
