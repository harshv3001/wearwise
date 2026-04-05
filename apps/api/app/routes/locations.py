from fastapi import APIRouter, Query

from app.schemas.location import CitySuggestion, CountryOption, StateOption
from app.services import location_service

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("/countries", response_model=list[CountryOption])
async def countries() -> list[CountryOption]:
    return await location_service.get_countries()


@router.get("/states", response_model=list[StateOption])
async def states(country: str = Query(..., min_length=1)) -> list[StateOption]:
    return await location_service.get_states(country=country)


@router.get("/cities/search", response_model=list[CitySuggestion])
async def city_search(
    q: str = Query(..., min_length=2),
    country: str = Query(..., min_length=1),
    country_code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    state_code: str | None = Query(default=None),
) -> list[CitySuggestion]:
    return await location_service.search_cities(
        query=q,
        country=country,
        country_code=country_code,
        state=state,
        state_code=state_code,
    )
