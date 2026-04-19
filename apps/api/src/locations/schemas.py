from typing import Optional

from pydantic import BaseModel


class CountryOption(BaseModel):
    name: str
    code: str


class StateOption(BaseModel):
    name: str
    code: Optional[str] = None


class CitySuggestion(BaseModel):
    city: str
    state: str
    state_code: Optional[str] = None
    country: str
    country_code: str
    latitude: float
    longitude: float
    display_label: str
