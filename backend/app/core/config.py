from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    PROJECT_NAME: str = "Sentinel AI"
    VERSION: str = "1.0.0"

    MODEL_NAME: str = "mistral/mistral-small-latest"

    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "sentinel_documents"
    SIMILARITY_THRESHOLD: float = 0.20
    DATABASE_URL: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    GEMINI_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    GROK_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""
    SECRET_KEY: str
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()