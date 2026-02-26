from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas import user as user_schema

from app.models import user as user_model

from app.database import get_db

from app import utils, oauth2

router = APIRouter(prefix="/auth", tags=["Auth"])


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

    user_dict["name"] = user_dict["name"].strip()
    user_dict["email"] = user_dict["email"].strip().lower()

    user_dict["password"] = utils.hash_password(user.password.strip())

    new_user = user_model.User(**user_dict)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=user_schema.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 form uses "username" field → we treat it as email
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
    return {"access_token": token, "token_type": "bearer"}
