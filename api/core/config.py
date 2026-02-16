import os
from dotenv import load_dotenv

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# api/core/config.py -> api/core -> api
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    REALITY_DEFENDER_API_KEY: str = os.getenv("REALITY_DEFENDER_API_KEY", "")
    API_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Deepfake Detector API"

settings = Settings()
