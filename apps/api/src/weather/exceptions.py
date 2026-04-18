from fastapi import HTTPException, status


class WeatherProviderUnavailableError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Weather provider is temporarily unavailable.",
        )


class WeatherUnavailableForLocationError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Weather data is unavailable for this location.",
        )
