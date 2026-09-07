from pydantic_settings import BaseSettings
from motor.motor_asyncio import AsyncIOMotorClient
from functools import lru_cache
import os


class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "ecobuild"
    STAGE_A_URL: str = "http://localhost:8000/api/predict/quantities"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# MongoDB client singleton
_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        settings = get_settings()
        _client = AsyncIOMotorClient(settings.MONGO_URI)
    return _client


def get_db():
    settings = get_settings()
    return get_client()[settings.DB_NAME]


# Collection names
RATE_MASTER_COLLECTION = "rate_master"
PROJECT_ESTIMATES_COLLECTION = "project_estimates"
ECO_MATERIAL_RULES_COLLECTION = "eco_material_rules"
PROJECTS_COLLECTION = "projects"
WASTE_THRESHOLDS_COLLECTION = "waste_thresholds"
REUSE_RULES_COLLECTION = "reuse_rules"
PROGRESS_UPDATES_COLLECTION = "progress_updates"
SITE_IMAGES_COLLECTION = "site_images"
