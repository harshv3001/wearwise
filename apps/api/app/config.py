import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DEFAULT_ENV_FILE = ".env"


def resolve_env_file() -> Path:
    env_file = os.getenv("APP_ENV_FILE", DEFAULT_ENV_FILE)
    env_path = Path(env_file)
    if not env_path.is_absolute():
        env_path = BASE_DIR / env_path
    return env_path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=resolve_env_file(), extra="ignore")

    # Optional full DB URL (used in Docker)
    DATABASE_URL: Optional[str] = None

    # Individual DB parts (used locally)
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432

    # JWT
    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
