import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

DATABASE_URL = settings.DATABASE_URL
engine = None

# 1. Attempt connection using the configured DATABASE_URL (PostgreSQL)
if DATABASE_URL.startswith("postgresql"):
    try:
        logger.info("Attempting to connect to PostgreSQL database...")
        # We specify a short connect_timeout (3s) so it doesn't hang if database is unreachable
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3}
        )
        # Test connection by checking connectivity
        with engine.connect() as conn:
            pass
        logger.info("Successfully connected to PostgreSQL database!")
    except Exception as e:
        logger.warning(
            f"PostgreSQL connection failed: {e}\n"
            "--> Falling back to local SQLite database (sqlite:///./task_manager.db) for testing..."
        )
        engine = None

# 2. Fall back to SQLite if PostgreSQL was unreachable or not configured
if engine is None:
    SQLITE_URL = "sqlite:///./task_manager.db"
    logger.info(f"Initializing SQLite database engine: {SQLITE_URL}")
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False}  # Required for SQLite multithreading in FastAPI
    )

# Create SessionLocal class for database transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy ORM models
Base = declarative_base()
