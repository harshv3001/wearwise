from fastapi import Response, UploadFile, status
from sqlalchemy.orm import Session

from app import utils
from app.utils import build_image_url, delete_upload_file, save_upload_file
from src.auth.schemas import ChangePasswordRequest
from src.users import queries as user_queries
from src.users.exceptions import (
    CurrentPasswordIncorrectError,
    EmailAlreadyRegisteredError,
    PasswordMismatchError,
    PasswordReuseError,
    SocialOnlyPasswordChangeError,
    UsernameAlreadyTakenError,
)
from src.users.models import User
from src.users.schemas import UserUpdate, UserOut
from src.users.utils import (
    clean_optional_list,
    clean_optional_string,
    normalize_email,
    normalize_username,
    require_non_empty_string,
)


def serialize_user(user: User, db: Session) -> UserOut:
    image_url = build_image_url(user.image_path)

    if not image_url:
        linked_account = user_queries.get_profile_image_provider_account(
            db,
            user_id=user.id,
        )
        image_url = linked_account.provider_avatar_url if linked_account else None

    return UserOut.model_validate({**user.__dict__, "image_url": image_url})


def update_current_user(*, db: Session, current_user: User, payload: UserUpdate) -> User:
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return current_user

    if "first_name" in update_data:
        update_data["first_name"] = require_non_empty_string(
            update_data["first_name"], "First name"
        )
    if "last_name" in update_data:
        update_data["last_name"] = require_non_empty_string(
            update_data["last_name"], "Last name"
        )
    if "username" in update_data:
        update_data["username"] = normalize_username(update_data["username"])
    if "email" in update_data:
        update_data["email"] = normalize_email(update_data["email"])
    for field in ("gender", "country", "country_code", "state", "state_code", "city"):
        if field in update_data:
            update_data[field] = clean_optional_string(update_data[field])
    for field in ("pref_styles", "pref_colors"):
        if field in update_data:
            update_data[field] = clean_optional_list(update_data[field])

    if "email" in update_data and update_data["email"] != current_user.email:
        email_exists = user_queries.get_other_user_by_email(
            db,
            email=update_data["email"],
            excluded_user_id=current_user.id,
        )
        if email_exists:
            raise EmailAlreadyRegisteredError()
        current_user.email_verified_at = None
        current_user.email_verification_source = None

    if "username" in update_data and update_data["username"] != current_user.username:
        username_exists = user_queries.get_other_user_by_username(
            db,
            username=update_data["username"],
            excluded_user_id=current_user.id,
        )
        if username_exists:
            raise UsernameAlreadyTakenError()

    return user_queries.update_user_fields(db, user=current_user, update_data=update_data)


def upload_profile_image(*, db: Session, current_user: User, file: UploadFile) -> User:
    new_image_key = save_upload_file(file, folder="profile_images")

    if current_user.image_path:
        delete_upload_file(current_user.image_path)

    current_user.image_path = new_image_key
    return user_queries.save_user(db, user=current_user)


def get_linked_identities(*, db: Session, current_user: User) -> dict:
    linked_accounts = user_queries.list_auth_provider_accounts_by_user(
        db,
        user_id=current_user.id,
    )
    return {
        "has_password": bool(current_user.password),
        "providers": [
            {
                "provider": account.provider,
                "provider_email": account.provider_email,
                "provider_avatar_url": account.provider_avatar_url,
                "linked_at": account.linked_at,
            }
            for account in linked_accounts
        ],
    }


def change_password(*, db: Session, current_user: User, payload: ChangePasswordRequest) -> Response:
    if not current_user.password:
        raise SocialOnlyPasswordChangeError()

    current_password = payload.current_password.strip()
    new_password = payload.new_password.strip()
    confirm_new_password = payload.confirm_new_password.strip()

    if not utils.verify_password(current_password, current_user.password):
        raise CurrentPasswordIncorrectError()
    if new_password != confirm_new_password:
        raise PasswordMismatchError()
    if current_password == new_password:
        raise PasswordReuseError()

    current_user.password = utils.hash_password(new_password)
    user_queries.save_user(db, user=current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
