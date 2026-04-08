from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    # name: str = Field(min_length=1)
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    username: Optional[str] = Field(default=None, min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8, max_length=60)

    age: Optional[int] = Field(default=None, ge=1, le=120)
    gender: Optional[str] = None

    country: Optional[str] = None
    country_code: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    pref_styles: Optional[List[str]] = None
    pref_colors: Optional[List[str]] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    # name: str
    first_name: str
    last_name: str
    username: Optional[str] = None
    email: EmailStr
    image_url: Optional[str] = None
    email_verified_at: Optional[datetime] = None
    email_verification_source: Optional[str] = None

    age: Optional[int] = None
    gender: Optional[str] = None

    country: Optional[str] = None
    country_code: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    pref_styles: Optional[List[str]] = None
    pref_colors: Optional[List[str]] = None

    created_at: datetime


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1)
    last_name: Optional[str] = Field(default=None, min_length=1)
    username: Optional[str] = Field(default=None, min_length=3, max_length=30)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(default=None, ge=1, le=120)
    gender: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pref_styles: Optional[List[str]] = None
    pref_colors: Optional[List[str]] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int | None = None


class LoginResponse(Token):
    user: UserOut


class TokenData(BaseModel):
    id: Optional[UUID] = None
