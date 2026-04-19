from uuid import uuid4

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile
from fastapi.responses import Response

from src.media.constants import ALLOWED_MEDIA_PREFIXES, AWS_BUCKET_NAME, AWS_REGION
from src.media.exceptions import MediaNotFoundError, MediaUploadFailedError
from src.media.utils import infer_media_type, validate_upload_file

s3_client = boto3.client(
    "s3",
    aws_access_key_id=__import__("os").getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=__import__("os").getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=AWS_REGION,
)


def save_upload_file(upload_file: UploadFile, *, folder: str) -> str:
    extension = validate_upload_file(upload_file)
    unique_filename = f"{uuid4().hex}{extension}"
    s3_key = f"{folder}/{unique_filename}"

    try:
        upload_file.file.seek(0)
        s3_client.upload_fileobj(
            upload_file.file,
            AWS_BUCKET_NAME,
            s3_key,
            ExtraArgs={"ContentType": upload_file.content_type},
        )
    except (BotoCoreError, ClientError) as exc:
        raise MediaUploadFailedError() from exc

    return s3_key


def delete_upload_file(s3_key: str | None) -> None:
    if not s3_key:
        return
    try:
        s3_client.delete_object(Bucket=AWS_BUCKET_NAME, Key=s3_key)
    except (BotoCoreError, ClientError):
        pass


def get_media_response(file_path: str) -> Response:
    if not file_path or not file_path.startswith(ALLOWED_MEDIA_PREFIXES):
        raise MediaNotFoundError()

    try:
        s3_object = s3_client.get_object(Bucket=AWS_BUCKET_NAME, Key=file_path)
    except (BotoCoreError, ClientError) as exc:
        raise MediaNotFoundError() from exc

    media_type = s3_object.get("ContentType") or infer_media_type(file_path)
    body = s3_object["Body"].read()
    return Response(
        content=body,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=3600"},
    )
