"""User-owned projects, with plan-based quota enforcement."""

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..db import get_session
from ..deps import get_current_user
from ..models import PLAN_LIMITS, Project, User
from ..schemas import ProjectCreate, ProjectRead

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _to_read(p: Project) -> ProjectRead:
    return ProjectRead(
        id=p.id,
        name=p.name,
        config=json.loads(p.config or "{}"),
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


@router.get("", response_model=list[ProjectRead])
def list_projects(
    current: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    projects = session.exec(
        select(Project).where(Project.owner_id == current.id)
    ).all()
    return [_to_read(p) for p in projects]


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    max_projects = PLAN_LIMITS[current.plan]["max_projects"]
    if max_projects is not None:
        count = len(
            session.exec(select(Project).where(Project.owner_id == current.id)).all()
        )
        if count >= max_projects:
            raise HTTPException(
                status_code=403,
                detail=(
                    f"Project limit reached for the {current.plan.value} plan "
                    f"({max_projects}). Upgrade to add more."
                ),
            )

    project = Project(
        owner_id=current.id,
        name=payload.name,
        config=json.dumps(payload.config),
    )
    session.add(project)
    session.commit()
    session.refresh(project)
    return _to_read(project)


@router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    payload: ProjectCreate,
    current: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
    # 404 (not 403) so we don't confirm existence of another user's project.
    if not project or project.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Project not found")

    project.name = payload.name
    project.config = json.dumps(payload.config)
    project.updated_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()
    session.refresh(project)
    return _to_read(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
    if not project or project.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
