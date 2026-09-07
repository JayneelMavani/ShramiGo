from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "ShramiGo API"
    DEBUG: bool = False

    DATABASE_URL: str
    SUPABASE_DATABASE_URL: str | None = None
    USE_SUPABASE: bool = False

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    TIMEZONE: str = "UTC"
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    REDIS_URL: str | None = None
    LOGIN_RATE_LIMIT_IP: int = 10
    LOGIN_RATE_LIMIT_EMAIL: int = 5
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: int = 300
    RAZORPAY_KEY_ID: str | None = None
    RAZORPAY_KEY_SECRET: str | None = None
    RAZORPAY_WEBHOOK_SECRET: str | None = None
    RAZORPAY_CURRENCY: str = "INR"

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        if len(value) < 32 or value.lower().startswith("change-this"):
            raise ValueError("SECRET_KEY must be a random value of at least 32 characters")
        return value

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def effective_database_url(self) -> str:
        if self.USE_SUPABASE and self.SUPABASE_DATABASE_URL:
            return self.SUPABASE_DATABASE_URL
        return self.DATABASE_URL

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()