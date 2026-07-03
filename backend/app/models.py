"""Database models and the plan/limits source of truth."""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class PlanTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"


# Server-side source of truth for what each tier allows.
# A max_* value of None means "unlimited".
PLAN_LIMITS: dict[PlanTier, dict] = {
    PlanTier.FREE: {
        "label": "Free",
        "price_usd": 0,
        "max_projects": 3,
        "max_batch": 50,
        "watermark": True,
        "pdf_export": False,
    },
    PlanTier.PRO: {
        "label": "Pro",
        "price_usd": 9,
        "max_projects": 50,
        "max_batch": 5000,
        "watermark": False,
        "pdf_export": True,
    },
    PlanTier.TEAM: {
        "label": "Team",
        "price_usd": 29,
        "max_projects": None,
        "max_batch": None,
        "watermark": False,
        "pdf_export": True,
    },
}


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    plan: PlanTier = Field(default=PlanTier.FREE)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(index=True, foreign_key="user.id")
    name: str
    config: str = Field(default="{}")  # JSON blob of the badge design config
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
