from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app import crud
from app.api.deps import SessionDep, get_current_active_superuser
from app.core.security import get_password_hash
from app.models import (
    User,
    UserPublic,
)

router = APIRouter(tags=["private"], prefix="/private")


class PrivateUserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    is_verified: bool = False


@router.post("/users/", response_model=UserPublic, dependencies=[Depends(get_current_active_superuser)])
def create_user(user_in: PrivateUserCreate, session: SessionDep) -> Any:
    """
    Create a new user.
    """
    existing = crud.get_user_by_email(session=session, email=user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
    )

    session.add(user)
    session.commit()

    return user
