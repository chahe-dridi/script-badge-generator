"""Database engine, session dependency, and table creation."""

from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings

settings = get_settings()

# SQLite needs check_same_thread=False when used across FastAPI's threadpool.
_connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

engine = create_engine(settings.database_url, echo=False, connect_args=_connect_args)


def init_db() -> None:
    """Create tables from SQLModel metadata.

    NOTE: create_all is fine for a greenfield first pass. Before the first
    production schema change, switch to Alembic migrations (see BACKEND-PLAN.md).
    """
    # Import models so they register on SQLModel.metadata before create_all.
    from . import models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
