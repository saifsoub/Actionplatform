import logging

from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import UserProfile, UserProfilePublic, UserProfileUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["profile"])


def _get_or_create_profile(session: SessionDep, user_id: object) -> UserProfile:
    """Fetch the user's profile, creating it atomically on first access."""
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == user_id)
    ).first()
    if profile:
        return profile
    try:
        profile = UserProfile(user_id=user_id)
        session.add(profile)
        session.commit()
        session.refresh(profile)
        return profile
    except IntegrityError:
        session.rollback()
        profile = session.exec(
            select(UserProfile).where(UserProfile.user_id == user_id)
        ).first()
        if not profile:
            logger.error("Failed to initialize profile for user %s", user_id)
            raise HTTPException(status_code=500, detail="Failed to initialize profile.")
        return profile


@router.get("/", response_model=UserProfilePublic)
def get_profile(current_user: CurrentUser, session: SessionDep) -> UserProfilePublic:
    profile = _get_or_create_profile(session, current_user.id)
    return UserProfilePublic.model_validate(profile)


@router.put("/", response_model=UserProfilePublic)
def update_profile(
    body: UserProfileUpdate,
    current_user: CurrentUser,
    session: SessionDep,
) -> UserProfilePublic:
    profile = _get_or_create_profile(session, current_user.id)
    update_data = body.model_dump(exclude_unset=True)
    profile.sqlmodel_update(update_data)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return UserProfilePublic.model_validate(profile)
