from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Easy Learn API"
    polza_api_url: str | None = Field(default=None, alias="POLZA_API_URL")
    polza_api_key: str | None = Field(default=None, alias="POLZA_API_KEY")
    polza_model: str | None = Field(default=None, alias="POLZA_MODEL")
    allowed_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="ALLOWED_ORIGINS",
    )
    request_timeout_seconds: float = Field(default=20, alias="REQUEST_TIMEOUT_SECONDS")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def polza_enabled(self) -> bool:
        return bool(self.polza_api_url and self.polza_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
