from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    CouncilSession,
    CouncilSessionOutcomeUpdate,
    CouncilSessionPublic,
    CouncilSessionsPublic,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/", response_model=CouncilSessionsPublic)
def list_sessions(
    current_user: CurrentUser,
    session: SessionDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=500),
) -> CouncilSessionsPublic:
    count = session.exec(
        select(func.count())
        .select_from(CouncilSession)
        .where(CouncilSession.owner_id == current_user.id)
    ).one()
    sessions = session.exec(
        select(CouncilSession)
        .where(CouncilSession.owner_id == current_user.id)
        .order_by(col(CouncilSession.created_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return CouncilSessionsPublic(data=list(sessions), count=count)


@router.get("/{session_id}", response_model=CouncilSessionPublic)
def get_session(
    session_id: UUID,
    current_user: CurrentUser,
    session: SessionDep,
) -> CouncilSessionPublic:
    council_session = session.get(CouncilSession, session_id)
    if not council_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if council_session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your session")
    return CouncilSessionPublic.model_validate(council_session)


@router.patch("/{session_id}/outcome", response_model=CouncilSessionPublic)
def update_outcome(
    session_id: UUID,
    body: CouncilSessionOutcomeUpdate,
    current_user: CurrentUser,
    session: SessionDep,
) -> CouncilSessionPublic:
    council_session = session.get(CouncilSession, session_id)
    if not council_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if council_session.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your session")
    council_session.outcome = body.outcome
    council_session.outcome_note = body.outcome_note
    session.add(council_session)
    session.commit()
    session.refresh(council_session)
    return CouncilSessionPublic.model_validate(council_session)
