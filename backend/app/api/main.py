from fastapi import APIRouter

from app.api.routes import (
    agents,
    council,
    engagement,
    items,
    login,
    private,
    profile,
    sessions,
    skills,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(agents.router)
api_router.include_router(skills.router)
api_router.include_router(council.router)
api_router.include_router(sessions.router)
api_router.include_router(profile.router)
api_router.include_router(engagement.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
