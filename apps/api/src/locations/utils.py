def normalize_text(value: str | None) -> str:
    return " ".join((value or "").strip().lower().split())


def is_matching_state(expected_state: str | None, candidate_state: str | None) -> bool:
    if not expected_state:
        return True
    return normalize_text(expected_state) == normalize_text(candidate_state)


def is_matching_country(
    expected_country: str,
    expected_country_code: str | None,
    candidate_country: str | None,
    candidate_country_code: str | None,
) -> bool:
    if expected_country_code and candidate_country_code:
        return expected_country_code.strip().upper() == candidate_country_code.strip().upper()
    return normalize_text(expected_country) == normalize_text(candidate_country)


def display_label(city: str, state: str, country: str) -> str:
    return ", ".join(part for part in [city, state, country] if part)
