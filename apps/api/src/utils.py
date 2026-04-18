from passlib.context import CryptContext

from src.media.constants import AWS_BUCKET_NAME
from src.media.service import delete_upload_file, s3_client, save_upload_file
from src.media.utils import build_image_url

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


__all__ = [
    "AWS_BUCKET_NAME",
    "build_image_url",
    "delete_upload_file",
    "hash_password",
    "pwd_context",
    "s3_client",
    "save_upload_file",
    "verify_password",
]
