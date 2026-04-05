from typing import Optional

from pydantic import BaseModel


class CurrentWeather(BaseModel):
    temperature: Optional[float] = None
    feels_like: Optional[float] = None
    weather_code: Optional[int] = None
    weather_label: str
    wind_speed: Optional[float] = None
    is_day: Optional[bool] = None
