from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field
from dotenv import load_dotenv
import os


class Settings(BaseSettings):
    # Database
    use_sqlite: bool = Field(default=True, alias="USE_SQLITE")
    sqlite_url: str = Field(default="sqlite:///./app.db", alias="SQLITE_URL")
    database_url: str = Field(
        default="postgresql+psycopg2://ai_tracker:ai_tracker@db:5432/ai_tracker",
        alias="DATABASE_URL",
    )

    # API security
    api_key: str = Field(default="change-me-dev", alias="API_KEY")

    # Encryption (Fernet base64 key)
    secret_key: str = Field(default="", alias="SECRET_KEY")

    # Nordigen / GoCardless Bank Account Data
    ng_secret_id: str = Field(default="", alias="NORDIGEN_SECRET_ID")
    ng_secret_key: str = Field(default="", alias="NORDIGEN_SECRET_KEY")
    ng_redirect_uri: str = Field(default="http://localhost:8000/auth/callback", alias="NORDIGEN_REDIRECT_URI")
    ng_base_url: str = Field(default="https://bankaccountdata.gocardless.com", alias="NORDIGEN_BASE_URL")
    ng_user_language: str = Field(default="IT", alias="NORDIGEN_USER_LANGUAGE")
    ng_institution_id: str = Field(default="", alias="NORDIGEN_INSTITUTION_ID")

    # Backward-compatibility for previous TrueLayer-based code paths
    # The new provider implementation in services/truelayer.py will read these
    # Nordigen settings instead of the old TL ones.
    tl_client_id: str = Field(default="", alias="TRUE_LAYER_CLIENT_ID")
    tl_client_secret: str = Field(default="", alias="TRUE_LAYER_CLIENT_SECRET")
    tl_redirect_uri: str = Field(default="http://localhost:8000/auth/callback", alias="TRUE_LAYER_REDIRECT_URI")
    tl_scope: str = Field(default="accounts transactions offline_access", alias="TRUE_LAYER_SCOPE")
    tl_base_url: str = Field(default="https://api.truelayer-sandbox.com", alias="TRUE_LAYER_BASE_URL")
    tl_auth_url: str = Field(default="https://auth.truelayer-sandbox.com", alias="TRUE_LAYER_AUTH_URL")
    tl_token_url: str = Field(default="https://auth.truelayer-sandbox.com/connect/token", alias="TRUE_LAYER_TOKEN_URL")

    # Environment
    env: str = Field(default="development", alias="ENV")

    # CORS
    cors_origins: str = Field(default="*", alias="CORS_ORIGINS")

    @property
    def sqlalchemy_database_uri(self) -> str:
        return self.sqlite_url if self.use_sqlite else self.database_url


@lru_cache()
def get_settings() -> Settings:
    # Load .env for local/dev if present (no-op if missing). Try common paths.
    for candidate in ("backend/.env", ".env", "/app/.env"):
        if os.path.exists(candidate):
            load_dotenv(candidate, override=False)
    return Settings()


