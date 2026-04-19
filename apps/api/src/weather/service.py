from __future__ import annotations

from typing import Any

import httpx

from src.weather.constants import OPEN_METEO_FORECAST_URL
from src.weather.exceptions import (
    WeatherProviderUnavailableError,
    WeatherUnavailableForLocationError,
)
from src.weather.schemas import CurrentWeather
from src.weather.utils import get_weather_label

REQUEST_TIMEOUT = httpx.Timeout(10.0, connect=5.0)


async def fetch_json(url: str, *, params: dict[str, Any]) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as exc:
        raise WeatherProviderUnavailableError() from exc


async def get_current_weather(latitude: float, longitude: float) -> CurrentWeather:
    payload = await fetch_json(
        OPEN_METEO_FORECAST_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
            "timezone": "auto",
            "forecast_days": 1,
        },
    )
    current = payload.get("current")
    if not isinstance(current, dict):
        raise WeatherUnavailableForLocationError()

    weather_code = current.get("weather_code")
    weather_code_int = int(weather_code) if isinstance(weather_code, (int, float)) else None
    is_day = current.get("is_day")
    is_day_bool = None
    if isinstance(is_day, bool):
        is_day_bool = is_day
    elif isinstance(is_day, (int, float)):
        is_day_bool = bool(is_day)

    return CurrentWeather(
        temperature=current.get("temperature_2m"),
        feels_like=current.get("apparent_temperature"),
        weather_code=weather_code_int,
        weather_label=get_weather_label(weather_code_int),
        wind_speed=current.get("wind_speed_10m"),
        is_day=is_day_bool,
    )
