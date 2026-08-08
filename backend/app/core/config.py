from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sentinel AI"
    VERSION: str = "1.0.0"
    MODEL_NAME: str = "mistral/mistral-small-latest"
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "sentinel_documents"
    GEMINI_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    GROK_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""
    SECRET_KEY: str = "sentinel_secret"
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )   


settings = Settings()