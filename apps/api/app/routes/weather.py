from fastapi import APIRouter, Query

from app.schemas.weather import CurrentWeather
from app.services import weather_service

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/current", response_model=CurrentWeather)
async def current_weather(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
) -> CurrentWeather:
    return await weather_service.get_current_weather(
        latitude=latitude,
        longitude=longitude,
    )
