"""Explicit development-only database initialization command.

Run `python -m app.database.init_db` after setting DATABASE_URL. This creates
missing tables but never drops or alters existing tables. Use migrations when
schema changes need to be deployed later.
"""

from app.database.session import Base, engine
import app.models  # noqa: F401  # Registers all model tables with Base metadata.


def initialize_database() -> None:
    if engine is None:
        raise RuntimeError("DATABASE_URL must be configured before initializing the database.")

    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    initialize_database()
    print("Database tables created or already present.")
