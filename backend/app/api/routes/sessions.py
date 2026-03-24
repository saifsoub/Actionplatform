from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

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
    skip: int = 0,
    limit: int = 50,
) -> CouncilSessionsPublic:
    count = session.exec(
        select(func.count()).where(CouncilSession.owner_id == current_user.id)  # type: ignore[call-overload]
    ).one()
    sessions = session.exec(
        select(CouncilSession)
        .where(CouncilSession.owner_id == current_user.id)
        .order_by(CouncilSession.created_at.desc())  # type: ignore[union-attr]
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
    valid_outcomes = {"acted", "skipped", "pending"}
    if body.outcome not in valid_outcomes:
        raise HTTPException(status_code=400, detail=f"outcome must be one of {valid_outcomes}")
    council_session.outcome = body.outcome
    council_session.outcome_note = body.outcome_note
    session.add(council_session)
    session.commit()
    session.refresh(council_session)
    return CouncilSessionPublic.model_validate(council_session)
