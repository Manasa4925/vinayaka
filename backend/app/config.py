import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve and load .env from the backend root folder
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/task_manager"
    )
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "9a6dcf88f284e36506d860d5bfa4e7dfc89d2d0b5e4cf1923485ba8483ef30b1"
    )
    REFRESH_SECRET_KEY: str = os.getenv(
        "REFRESH_SECRET_KEY", "e834b9d038dc6cb937812984570fa72c3d56d7870164c67be8df1a774ea08832"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

settings = Settings()
