from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_anon_key: str = ""
    nordigen_secret_id: str = ""
    nordigen_secret_key: str = ""
    cors_origins: str = "http://localhost:3000,https://finneijsten.github.io,https://klaarboek.vercel.app"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    login_rate_limit: str = "5/minute"
    register_rate_limit: str = "3/minute"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
