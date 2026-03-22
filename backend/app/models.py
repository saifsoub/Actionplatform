import uuid
from datetime import datetime, timezone
from enum import Enum

from pydantic import EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    agents: list["Agent"] = Relationship(back_populates="owner", cascade_delete=True)
    skills: list["Skill"] = Relationship(back_populates="owner", cascade_delete=True)
    subscription: "Subscription | None" = Relationship(back_populates="user")


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


# ─────────────────────────────────────────────
# Agents & Skills
# ─────────────────────────────────────────────

class AgentBase(SQLModel):
    name: str = Field(min_length=1, max_length=100)
    persona: str = Field(min_length=1, max_length=100)  # friendly display name
    emoji: str = Field(default="🤖", max_length=10)
    role: str = Field(min_length=1, max_length=100)
    instructions: str = Field(min_length=1, max_length=4000)
    color: str = Field(default="#00D4FF", max_length=20)
    is_public: bool = Field(default=False)


class AgentCreate(AgentBase):
    pass


class AgentUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    persona: str | None = Field(default=None, min_length=1, max_length=100)
    emoji: str | None = Field(default=None, max_length=10)
    role: str | None = Field(default=None, min_length=1, max_length=100)
    instructions: str | None = Field(default=None, min_length=1, max_length=4000)
    color: str | None = Field(default=None, max_length=20)
    is_public: bool | None = None


class Agent(AgentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: "User | None" = Relationship(back_populates="agents")
    skills: list["AgentSkillLink"] = Relationship(back_populates="agent", cascade_delete=True)


class AgentPublic(AgentBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class AgentsPublic(SQLModel):
    data: list[AgentPublic]
    count: int


# ─── Skills ───

class SkillBase(SQLModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=500)
    instructions: str = Field(min_length=1, max_length=4000)
    tags: str = Field(default="", max_length=500)  # comma-separated tags


class SkillCreate(SkillBase):
    pass


class SkillUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    instructions: str | None = Field(default=None, max_length=4000)
    tags: str | None = Field(default=None, max_length=500)


class Skill(SkillBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: "User | None" = Relationship(back_populates="skills")
    agent_links: list["AgentSkillLink"] = Relationship(back_populates="skill", cascade_delete=True)


class SkillPublic(SkillBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class SkillsPublic(SQLModel):
    data: list[SkillPublic]
    count: int


# ─── Agent-Skill link ───

class AgentSkillLink(SQLModel, table=True):
    agent_id: uuid.UUID = Field(foreign_key="agent.id", primary_key=True, ondelete="CASCADE")
    skill_id: uuid.UUID = Field(foreign_key="skill.id", primary_key=True, ondelete="CASCADE")
    agent: Agent | None = Relationship(back_populates="skills")
    skill: Skill | None = Relationship(back_populates="agent_links")


# ─── Skill match result ───

class SkillMatchResult(SQLModel):
    skill_id: uuid.UUID
    skill_name: str
    matched_agent_ids: list[uuid.UUID]
    suggested_new_agent: bool
    reasoning: str


# ─────────────────────────────────────────────
# Subscriptions
# ─────────────────────────────────────────────

class SubscriptionTier(str, Enum):
    free = "free"
    pro = "pro"
    elite = "elite"


class SubscriptionBase(SQLModel):
    tier: SubscriptionTier = SubscriptionTier.free
    currency: str = Field(default="USD", max_length=3)
    sessions_used: int = Field(default=0)


class Subscription(SubscriptionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE", unique=True
    )
    user: "User | None" = Relationship(back_populates="subscription")


class SubscriptionPublic(SubscriptionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    sessions_limit: int
    created_at: datetime | None = None


# ─── Council session response ───

class CouncilQueryRequest(SQLModel):
    question: str = Field(min_length=1, max_length=2000)
    round: int = Field(default=0, ge=0)


class CouncilQueryResponse(SQLModel):
    responses: dict[str, str]
    synthesis: str
