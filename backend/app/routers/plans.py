"""Plan catalog and per-user plan/usage."""

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db import get_session
from ..deps import get_current_user
from ..models import PLAN_LIMITS, PlanConfig, Project, User

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.get("")
def list_plans(session: Session = Depends(get_session)):
    """Public plan catalog — reads admin-configured values from DB."""
    configs = session.exec(select(PlanConfig)).all()
    return [
        {
            "tier": c.tier.value,
            "label": c.label,
            "price_usd": c.price_usd,
            "max_projects": c.max_projects,
            "max_batch": c.max_batch,
            "watermark": c.watermark,
            "pdf_export": c.pdf_export,
        }
        for c in configs
    ]


@router.get("/me")
def my_plan(
    current: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    config = session.exec(
        select(PlanConfig).where(PlanConfig.tier == current.plan)
    ).first()
    limits = (
        {
            "label": config.label,
            "price_usd": config.price_usd,
            "max_projects": config.max_projects,
            "max_batch": config.max_batch,
            "watermark": config.watermark,
            "pdf_export": config.pdf_export,
        }
        if config
        else PLAN_LIMITS.get(current.plan, {})
    )
    project_count = len(
        session.exec(select(Project).where(Project.owner_id == current.id)).all()
    )
    return {
        "tier": current.plan.value,
        "limits": limits,
        "usage": {"projects": project_count},
    }
