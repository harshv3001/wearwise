from src.weather.constants import WEATHER_CODE_LABELS


def get_weather_label(weather_code: int | None) -> str:
    if weather_code is None:
        return "Weather unavailable"
    return WEATHER_CODE_LABELS.get(weather_code, "Current conditions unavailable")
