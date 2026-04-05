from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=4, max_length=60)

    age: Optional[int] = None
    gender: Optional[str] = None

    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None

    pref_styles: Optional[List[str]] = None
    pref_colors: Optional[List[str]] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: EmailStr

    age: Optional[int]
    gender: Optional[str]

    country: Optional[str]
    state: Optional[str]
    city: Optional[str]

    pref_styles: Optional[List[str]]
    pref_colors: Optional[List[str]]

    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(Token):
    user: UserOut


class TokenData(BaseModel):
    id: Optional[UUID] = None
