"""Request/response DTOs (kept separate from DB models)."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .models import PlanTier


# ── Auth / users ──
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = None


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    plan: PlanTier
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Projects ──
class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    config: dict = Field(default_factory=dict)


class ProjectRead(BaseModel):
    id: int
    name: str
    config: dict
    created_at: datetime
    updated_at: datetime


# ── Admin ──

class UserAdminRead(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    plan: PlanTier
    is_active: bool
    is_admin: bool
    created_at: datetime


class UserAdminUpdate(BaseModel):
    plan: Optional[PlanTier] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class PlanConfigRead(BaseModel):
    tier: PlanTier
    label: str
    price_usd: float
    max_projects: Optional[int] = None
    max_batch: Optional[int] = None
    watermark: bool
    pdf_export: bool
    updated_at: datetime


class PlanConfigUpdate(BaseModel):
    label: Optional[str] = None
    price_usd: Optional[float] = None
    max_projects: Optional[int] = None
    max_batch: Optional[int] = None
    watermark: Optional[bool] = None
    pdf_export: Optional[bool] = None


class AdminStats(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    recent_signups_7d: int
    by_plan: dict
