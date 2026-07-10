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
    """Create tables and seed plan configs.

    NOTE: create_all is fine for a greenfield first pass. Before the first
    production schema change, switch to Alembic migrations (see BACKEND-PLAN.md).
    """
    from . import models  # noqa: F401

    SQLModel.metadata.create_all(engine)
    _seed_plan_configs()


def _seed_plan_configs() -> None:
    """Insert default PlanConfig rows if they don't exist yet (idempotent)."""
    from sqlmodel import select
    from .models import PlanConfig, PLAN_LIMITS

    with Session(engine) as session:
        for tier, limits in PLAN_LIMITS.items():
            exists = session.exec(
                select(PlanConfig).where(PlanConfig.tier == tier)
            ).first()
            if not exists:
                session.add(PlanConfig(
                    tier=tier,
                    label=limits["label"],
                    price_usd=float(limits["price_usd"]),
                    max_projects=limits["max_projects"],
                    max_batch=limits["max_batch"],
                    watermark=limits["watermark"],
                    pdf_export=limits["pdf_export"],
                ))
        session.commit()


def get_session():
    with Session(engine) as session:
        yield session
