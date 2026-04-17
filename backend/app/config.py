import os
import sys

from pydantic_settings import BaseSettings

INSECURE_SECRET_SENTINEL = "dev-only-change-in-production"


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_anon_key: str = ""
    nordigen_secret_id: str = ""
    nordigen_secret_key: str = ""
    cors_origins: str = "http://localhost:3000"
    secret_key: str = INSECURE_SECRET_SENTINEL
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    environment: str = "development"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()


def _is_prod() -> bool:
    return settings.environment.lower() in ("production", "prod")


if _is_prod():
    missing = []
    if not settings.supabase_url:
        missing.append("SUPABASE_URL")
    if not settings.supabase_service_key:
        missing.append("SUPABASE_SERVICE_KEY")
    if not settings.secret_key or settings.secret_key == INSECURE_SECRET_SENTINEL:
        missing.append("SECRET_KEY")
    if len(settings.secret_key) < 32 and settings.secret_key != INSECURE_SECRET_SENTINEL:
        missing.append("SECRET_KEY (must be ≥32 chars)")
    if not settings.cors_origins or settings.cors_origins == "http://localhost:3000":
        missing.append("CORS_ORIGINS (must not be localhost in production)")
    if missing:
        sys.stderr.write(
            "FATAL: missing/insecure required environment variables in production: "
            + ", ".join(missing)
            + "\n"
        )
        # Fail-closed: refuse to boot.
        raise SystemExit(1)
elif settings.secret_key == INSECURE_SECRET_SENTINEL:
    # Dev warning only, still boot.
    sys.stderr.write(
        "WARNING: using insecure default SECRET_KEY. "
        "Set ENVIRONMENT=production + a real SECRET_KEY before deploying.\n"
    )
