import mimetypes

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response

from app.utils import AWS_BUCKET_NAME, s3_client

router = APIRouter(prefix="/media", tags=["Media"])

ALLOWED_PREFIXES = ("closet_items/", "outfits/", "profile_images/")


@router.get("/{file_path:path}")
def get_media(file_path: str):
    if not file_path or not file_path.startswith(ALLOWED_PREFIXES):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    try:
        s3_object = s3_client.get_object(Bucket=AWS_BUCKET_NAME, Key=file_path)
    except (BotoCoreError, ClientError) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        ) from error

    media_type = (
        s3_object.get("ContentType")
        or mimetypes.guess_type(file_path)[0]
        or "application/octet-stream"
    )

    body = s3_object["Body"].read()

    return Response(
      content=body,
      media_type=media_type,
      headers={
          "Cache-Control": "public, max-age=3600",
      },
    )
