from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException, status

from app.schemas.weather import CurrentWeather

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
REQUEST_TIMEOUT = httpx.Timeout(10.0, connect=5.0)

WEATHER_CODE_LABELS = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


async def _fetch_json(url: str, *, params: dict[str, Any]) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Weather provider is temporarily unavailable.",
        ) from exc


def _get_weather_label(weather_code: int | None) -> str:
    if weather_code is None:
        return "Weather unavailable"
    return WEATHER_CODE_LABELS.get(weather_code, "Current conditions unavailable")


async def get_current_weather(latitude: float, longitude: float) -> CurrentWeather:
    payload = await _fetch_json(
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
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Weather data is unavailable for this location.",
        )

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
        weather_label=_get_weather_label(weather_code_int),
        wind_speed=current.get("wind_speed_10m"),
        is_day=is_day_bool,
    )
