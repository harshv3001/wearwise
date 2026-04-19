from fastapi import HTTPException

from src.auth.constants import USERNAME_PATTERN


def clean_optional_string(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = value.strip()
    return cleaned or None


def clean_optional_list(values: list[str] | None) -> list[str] | None:
    if values is None:
        return None

    cleaned = [value.strip() for value in values if value and value.strip()]
    return cleaned or None


def require_non_empty_string(value: str, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail=f"{field_name} is required")
    return cleaned


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_username(username: str | None) -> str | None:
    cleaned = clean_optional_string(username)
    if not cleaned:
        return None
    normalized = cleaned.lower()
    if len(normalized) < 3:
        raise HTTPException(status_code=422, detail="Username must be at least 3 characters")
    if not USERNAME_PATTERN.fullmatch(normalized):
        raise HTTPException(
            status_code=422,
            detail=(
                "Username must start with a letter and can only include letters, "
                "numbers, dots, underscores, and hyphens"
            ),
        )
    return normalized
