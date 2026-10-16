from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


settings = get_settings()

# A database is optional so the health endpoint can run before PostgreSQL is
# configured. Production database URLs use PostgreSQL through psycopg.
engine = (
    create_engine(settings.database_url, pool_pre_ping=True)
    if settings.database_url
    else None
)
SessionLocal = (
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
    if engine is not None
    else None
)


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models added in later phases."""


def get_db() -> Generator[Session, None, None]:
    """Provide a database session to routes that require one."""
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL must be configured before using the database.")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
