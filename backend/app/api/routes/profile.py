from fastapi import APIRouter
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import UserProfile, UserProfilePublic, UserProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/", response_model=UserProfilePublic)
def get_profile(current_user: CurrentUser, session: SessionDep) -> UserProfilePublic:
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()
    if not profile:
        # Auto-create blank profile on first access
        profile = UserProfile(user_id=current_user.id)
        session.add(profile)
        session.commit()
        session.refresh(profile)
    return UserProfilePublic.model_validate(profile)


@router.put("/", response_model=UserProfilePublic)
def update_profile(
    body: UserProfileUpdate,
    current_user: CurrentUser,
    session: SessionDep,
) -> UserProfilePublic:
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        session.add(profile)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    session.add(profile)
    session.commit()
    session.refresh(profile)
    return UserProfilePublic.model_validate(profile)
