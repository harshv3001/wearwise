from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from src.auth import schemas as auth_schemas
from src.database import get_db
from src.users.dependencies import get_authenticated_user
from src.users.models import User
from src.users import schemas as user_schemas
from src.users.service import (
    change_password,
    get_linked_identities,
    serialize_user,
    update_current_user,
    upload_profile_image,
)

router = APIRouter(prefix="/auth", tags=["Users"])


@router.get("/me", response_model=user_schemas.UserOut, summary="Get the current user profile")
def get_me(
    current_user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    return serialize_user(current_user, db)


@router.patch("/me", response_model=user_schemas.UserOut, summary="Update the current user profile")
def update_me(
    payload: user_schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    updated_user = update_current_user(db=db, current_user=current_user, payload=payload)
    return serialize_user(updated_user, db)


@router.post(
    "/me/image",
    response_model=user_schemas.UserOut,
    summary="Upload a profile image",
)
def upload_me_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    updated_user = upload_profile_image(db=db, current_user=current_user, file=file)
    return serialize_user(updated_user, db)


@router.get("/identities", summary="List linked sign-in identities")
def list_linked_identities(
    current_user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db),
):
    return get_linked_identities(db=db, current_user=current_user)


@router.post(
    "/change-password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Change the current user password",
)
def update_password(
    payload: auth_schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    return change_password(db=db, current_user=current_user, payload=payload)
