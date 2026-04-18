from __future__ import annotations

from typing import Any

import httpx

from src.locations.constants import (
    COUNTRIESNOW_BASE_URL,
    MAX_CITY_RESULTS,
    OPEN_METEO_GEOCODING_URL,
)
from src.locations.exceptions import (
    CountryOptionsUnavailableError,
    LocationProviderUnavailableError,
)
from src.locations.schemas import CitySuggestion, CountryOption, StateOption
from src.locations.utils import display_label, is_matching_country, is_matching_state

REQUEST_TIMEOUT = httpx.Timeout(10.0, connect=5.0)


async def fetch_json(method: str, url: str, **kwargs: Any) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT, follow_redirects=True) as client:
            response = await client.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as exc:
        raise LocationProviderUnavailableError() from exc


def parse_country_items(payload: dict[str, Any]) -> list[CountryOption]:
    raw_items = payload.get("data")
    if not isinstance(raw_items, list):
        return []

    seen_names: set[str] = set()
    countries: list[CountryOption] = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue
        name = (
            item.get("name")
            or item.get("country")
            or item.get("country_name")
            or item.get("countryName")
        )
        if not isinstance(name, str) or not name.strip():
            continue
        normalized_name = name.strip()
        dedupe_key = normalized_name.lower()
        if dedupe_key in seen_names:
            continue
        seen_names.add(dedupe_key)
        countries.append(
            CountryOption(
                name=normalized_name,
                code=(
                    item.get("iso2")
                    or item.get("code")
                    or item.get("country_code")
                    or item.get("countryCode")
                    or ""
                ),
            )
        )
    countries.sort(key=lambda item: item.name)
    return countries


async def get_countries() -> list[CountryOption]:
    primary_payload = await fetch_json("GET", f"{COUNTRIESNOW_BASE_URL}/positions")
    countries = parse_country_items(primary_payload)
    if countries:
        return countries

    fallback_payload = await fetch_json("GET", f"{COUNTRIESNOW_BASE_URL}/states")
    countries = parse_country_items(fallback_payload)
    if countries:
        return countries

    raise CountryOptionsUnavailableError()


def extract_state_items(payload: dict[str, Any]) -> list[dict[str, Any]]:
    raw_data = payload.get("data")
    if isinstance(raw_data, dict):
        states = raw_data.get("states")
        if isinstance(states, list):
            return [item for item in states if isinstance(item, dict)]
        return []
    if isinstance(raw_data, list):
        return [item for item in raw_data if isinstance(item, dict)]
    return []


def normalize_state_option(item: dict[str, Any]) -> StateOption | None:
    name = item.get("name") or item.get("state_name") or item.get("state")
    if not isinstance(name, str) or not name.strip():
        return None
    return StateOption(
        name=name.strip(),
        code=(
            item.get("state_code")
            or item.get("stateCode")
            or item.get("iso2")
            or item.get("code")
        ),
    )


async def get_states(country: str) -> list[StateOption]:
    payload = await fetch_json(
        "GET",
        f"{COUNTRIESNOW_BASE_URL}/states/q",
        params={"country": country.strip()},
    )
    states = [
        state
        for item in extract_state_items(payload)
        if (state := normalize_state_option(item)) is not None
    ]
    states.sort(key=lambda item: item.name)
    return states


def normalize_city_result(
    item: dict[str, Any],
    *,
    selected_country: str,
    selected_country_code: str | None,
    selected_state: str | None,
    selected_state_code: str | None,
) -> CitySuggestion | None:
    city = item.get("name")
    latitude = item.get("latitude")
    longitude = item.get("longitude")
    if not isinstance(city, str) or latitude is None or longitude is None:
        return None

    country = item.get("country") or selected_country
    country_code = item.get("country_code") or selected_country_code or ""
    state = item.get("admin1") or selected_state or ""

    if not is_matching_country(
        expected_country=selected_country,
        expected_country_code=selected_country_code,
        candidate_country=country,
        candidate_country_code=country_code,
    ):
        return None
    if not is_matching_state(selected_state, state):
        return None

    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except (TypeError, ValueError):
        return None

    city = city.strip()
    state = state.strip()
    country = country.strip()
    return CitySuggestion(
        city=city,
        state=state,
        state_code=selected_state_code or None,
        country=country,
        country_code=country_code,
        latitude=latitude,
        longitude=longitude,
        display_label=display_label(city, state, country),
    )


async def search_cities(
    *,
    query: str,
    country: str,
    country_code: str | None = None,
    state: str | None = None,
    state_code: str | None = None,
) -> list[CitySuggestion]:
    query = query.strip()
    country = country.strip()
    if len(query) < 2 or not country:
        return []

    params: dict[str, Any] = {
        "name": query,
        "count": MAX_CITY_RESULTS,
        "language": "en",
        "format": "json",
    }
    if country_code:
        params["countryCode"] = country_code

    payload = await fetch_json("GET", OPEN_METEO_GEOCODING_URL, params=params)
    raw_results = payload.get("results")
    if not isinstance(raw_results, list):
        return []

    suggestions: list[CitySuggestion] = []
    seen_locations: set[tuple[str, float, float]] = set()
    for item in raw_results:
        if not isinstance(item, dict):
            continue
        suggestion = normalize_city_result(
            item,
            selected_country=country,
            selected_country_code=country_code,
            selected_state=state,
            selected_state_code=state_code,
        )
        if suggestion is None:
            continue
        dedupe_key = (
            suggestion.display_label.lower(),
            round(suggestion.latitude, 5),
            round(suggestion.longitude, 5),
        )
        if dedupe_key in seen_locations:
            continue
        seen_locations.add(dedupe_key)
        suggestions.append(suggestion)
        if len(suggestions) >= MAX_CITY_RESULTS:
            break
    return suggestions
