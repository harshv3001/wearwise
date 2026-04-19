from typing import Optional


def normalize_category(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None

    trimmed = " ".join(str(value).strip().split())
    if not trimmed:
        return None

    return trimmed.title()
