from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.user import LoginResponse


ProviderName = Literal["google", "facebook"]
OAuthIntent = Literal["login"]


class OAuthStartResponse(BaseModel):
    authorization_url: str


class OAuthExchangeRequest(BaseModel):
    code: str = Field(min_length=1)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=60)
    confirm_new_password: str = Field(min_length=8, max_length=60)


class RefreshResponse(LoginResponse):
    pass
