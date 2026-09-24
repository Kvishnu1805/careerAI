import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
engine = None

try:
    if db_url.startswith("sqlite"):
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        # MySQL (TiDB) or PostgreSQL with optimized connection pooling for cloud latencies
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=280,
            pool_size=5,
            max_overflow=10,
            pool_timeout=15,
            connect_args={"connect_timeout": 10}
        )
        # Test connection
        with engine.connect() as conn:
            pass
except Exception as e:
    logger.warning(f"Could not connect to {db_url}: {e}. Falling back to SQLite.")
    db_url = "sqlite:///./careerai.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

