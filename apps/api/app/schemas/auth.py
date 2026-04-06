from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.user import LoginResponse


ProviderName = Literal["google", "facebook"]
OAuthIntent = Literal["login", "link"]


class OAuthStartResponse(BaseModel):
    authorization_url: str


class OAuthExchangeRequest(BaseModel):
    code: str = Field(min_length=1)


class RefreshResponse(LoginResponse):
    pass

