from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Sentinel AI Python Service"
    VERSION: str = "1.0.0"

    INTERNAL_SERVICE_KEY: str

    MODEL_NAME: str = "mistral/mistral-small-latest"
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "sentinel_documents"
    SIMILARITY_THRESHOLD: float = 0.0

    GEMINI_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    GROK_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
