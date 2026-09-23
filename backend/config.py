import os
from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerAI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database URL - Supports MySQL and fallback SQLite
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./careerai.db")
    
    # JWT Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-careerai-key-change-in-prod-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # AI Keys (Optional - Intelligent fallback active if not provided)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://career-ai-rho-two.vercel.app",
        "*"
    ]

settings = Settings()

