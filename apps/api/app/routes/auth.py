from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas import user as user_schema

from app.models import user as user_model

from app.database import get_db

from app import utils, oauth2
from app.oauth2 import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


def _clean_optional_string(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = value.strip()
    return cleaned or None


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=user_schema.UserOut,
)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(user_model.User).filter(user_model.User.email == user.email).first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_dict = user.model_dump()

    # user_dict["name"] = user_dict["name"].strip()
    user_dict["first_name"] = user_dict["first_name"].strip()
    user_dict["last_name"] = user_dict["last_name"].strip()
    user_dict["email"] = user_dict["email"].strip().lower()
    user_dict["country"] = _clean_optional_string(user_dict.get("country"))
    user_dict["country_code"] = _clean_optional_string(user_dict.get("country_code"))
    user_dict["state"] = _clean_optional_string(user_dict.get("state"))
    user_dict["state_code"] = _clean_optional_string(user_dict.get("state_code"))
    user_dict["city"] = _clean_optional_string(user_dict.get("city"))

    user_dict["password"] = utils.hash_password(user.password.strip())

    new_user = user_model.User(**user_dict)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=user_schema.LoginResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user_selected = (
        db.query(user_model.User).filter(user_model.User.email == form.username).first()
    )
    if not user_selected or not utils.verify_password(
        form.password, user_selected.password
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid credentials"
        )

    token = oauth2.create_access_token(data={"user_id": user_selected.id})
    return {"access_token": token, "token_type": "bearer", "user": user_selected}


@router.get("/me", response_model=user_schema.UserOut)
def get_me(current_user: user_model.User = Depends(get_current_user)):
    return current_user
