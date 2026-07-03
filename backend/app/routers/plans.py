"""Plan catalog and per-user plan/usage."""

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db import get_session
from ..deps import get_current_user
from ..models import PLAN_LIMITS, Project, User

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.get("")
def list_plans():
    """Public plan catalog (tier + limits)."""
    return [{"tier": tier.value, **limits} for tier, limits in PLAN_LIMITS.items()]


@router.get("/me")
def my_plan(
    current: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    limits = PLAN_LIMITS[current.plan]
    project_count = len(
        session.exec(select(Project).where(Project.owner_id == current.id)).all()
    )
    return {
        "tier": current.plan.value,
        "limits": limits,
        "usage": {"projects": project_count},
    }
