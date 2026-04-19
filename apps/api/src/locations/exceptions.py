from fastapi import HTTPException, status


class LocationProviderUnavailableError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Location provider is temporarily unavailable.",
        )


class CountryOptionsUnavailableError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not load country options.",
        )
