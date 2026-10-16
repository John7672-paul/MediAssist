import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel


# Load backend/.env when it exists. The file is intentionally not committed.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Settings(BaseModel):
    database_url: str | None = None
    secret_key: str | None = None
    frontend_url: str = "http://localhost:3000"
    access_token_expire_minutes: int = 30
    openai_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    """Read the application settings from environment variables."""
    return Settings(
        database_url=os.getenv("DATABASE_URL") or None,
        secret_key=os.getenv("SECRET_KEY") or None,
        frontend_url=os.getenv("FRONTEND_URL", "http://localhost:3000"),
        access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")),
        openai_api_key=os.getenv("OPENAI_API_KEY") or None,
    )
