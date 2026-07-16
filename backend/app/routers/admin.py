"""Admin-only endpoints: user management, plan config, dashboard stats."""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from ..db import get_session
from ..deps import get_current_admin
from ..models import PlanConfig, PlanTier, User
from ..schemas import AdminStats, PlanConfigRead, PlanConfigUpdate, UserAdminRead, UserAdminUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStats)
def get_stats(
    session: Session = Depends(get_session),
    _admin: User = Depends(get_current_admin),
):
    total = session.exec(select(func.count(User.id))).one()
    active = session.exec(select(func.count(User.id)).where(User.is_active == True)).one()  # noqa: E712
    cutoff = datetime.utcnow() - timedelta(days=7)
    recent = session.exec(
        select(func.count(User.id)).where(User.created_at >= cutoff)
    ).one()

    by_plan = {}
    for tier in PlanTier:
        count = session.exec(
            select(func.count(User.id)).where(User.plan == tier)
        ).one()
        by_plan[tier.value] = count

    return AdminStats(
        total_users=total,
        active_users=active,
        inactive_users=total - active,
        recent_signups_7d=recent,
        by_plan=by_plan,
    )


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserAdminRead])
def list_users(
    q: Optional[str] = Query(default=None, description="Search by name or email"),
    session: Session = Depends(get_session),
    _admin: User = Depends(get_current_admin),
):
    stmt = select(User).order_by(User.created_at.desc())
    users = session.exec(stmt).all()

    if q:
        q_lower = q.lower()
        users = [
            u for u in users
            if q_lower in u.email.lower()
            or (u.full_name and q_lower in u.full_name.lower())
        ]
    return users


@router.get("/users/{user_id}", response_model=UserAdminRead)
def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    _admin: User = Depends(get_current_admin),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserAdminRead)
def update_user(
    user_id: int,
    payload: UserAdminUpdate,
    session: Session = Depends(get_session),
    admin: User = Depends(get_current_admin),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Admins cannot strip their own admin flag or deactivate themselves.
    if user.id == admin.id:
        if payload.is_admin is False:
            raise HTTPException(status_code=400, detail="Cannot revoke your own admin status")
        if payload.is_active is False:
            raise HTTPException(status_code=400, detail="Cannot suspend yourself")

    if payload.plan is not None:
        user.plan = payload.plan
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.is_admin is not None:
        user.is_admin = payload.is_admin

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


# ── Plans ─────────────────────────────────────────────────────────────────────

@router.get("/plans", response_model=List[PlanConfigRead])
def list_plan_configs(
    session: Session = Depends(get_session),
    _admin: User = Depends(get_current_admin),
):
    return session.exec(select(PlanConfig)).all()


@router.put("/plans/{tier}", response_model=PlanConfigRead)
def update_plan_config(
    tier: PlanTier,
    payload: PlanConfigUpdate,
    session: Session = Depends(get_session),
    _admin: User = Depends(get_current_admin),
):
    config = session.exec(select(PlanConfig).where(PlanConfig.tier == tier)).first()
    if not config:
        raise HTTPException(status_code=404, detail="Plan config not found")

    if payload.label is not None:
        config.label = payload.label
    if payload.price_usd is not None:
        if payload.price_usd < 0:
            raise HTTPException(status_code=400, detail="price_usd must be >= 0")
        config.price_usd = payload.price_usd
    if payload.max_projects is not None:
        config.max_projects = payload.max_projects
    if payload.max_batch is not None:
        config.max_batch = payload.max_batch
    if payload.watermark is not None:
        config.watermark = payload.watermark
    if payload.pdf_export is not None:
        config.pdf_export = payload.pdf_export

    config.updated_at = datetime.utcnow()
    session.add(config)
    session.commit()
    session.refresh(config)
    return config
