import uuid

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Agent,
    AgentCreate,
    AgentPublic,
    AgentsPublic,
    AgentSkillLink,
    AgentUpdate,
    Message,
    Skill,
)

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/", response_model=AgentsPublic)
def list_agents(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> AgentsPublic:
    count = session.exec(
        select(func.count()).select_from(Agent).where(Agent.owner_id == current_user.id)
    ).one()
    agents = session.exec(
        select(Agent).where(Agent.owner_id == current_user.id).offset(skip).limit(limit)
    ).all()
    return AgentsPublic(data=list(agents), count=count)


@router.get("/public", response_model=AgentsPublic)
def list_public_agents(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> AgentsPublic:
    count = session.exec(
        select(func.count()).select_from(Agent).where(Agent.is_public.is_(True))
    ).one()
    agents = session.exec(
        select(Agent).where(Agent.is_public.is_(True)).offset(skip).limit(limit)
    ).all()
    return AgentsPublic(data=list(agents), count=count)


@router.post("/", response_model=AgentPublic)
def create_agent(
    body: AgentCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> Agent:
    agent = Agent.model_validate(body, update={"owner_id": current_user.id})
    session.add(agent)
    session.commit()
    session.refresh(agent)
    return agent


@router.get("/{agent_id}", response_model=AgentPublic)
def get_agent(
    agent_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Agent:
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.owner_id != current_user.id and not agent.is_public:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return agent


@router.patch("/{agent_id}", response_model=AgentPublic)
def update_agent(
    agent_id: uuid.UUID,
    body: AgentUpdate,
    session: SessionDep,
    current_user: CurrentUser,
) -> Agent:
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    update_data = body.model_dump(exclude_unset=True)
    agent.sqlmodel_update(update_data)
    session.add(agent)
    session.commit()
    session.refresh(agent)
    return agent


@router.delete("/{agent_id}", response_model=Message)
def delete_agent(
    agent_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Message:
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(agent)
    session.commit()
    return Message(message="Agent deleted")


@router.post("/{agent_id}/skills/{skill_id}", response_model=Message)
def add_skill_to_agent(
    agent_id: uuid.UUID,
    skill_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Message:
    agent = session.get(Agent, agent_id)
    if not agent or agent.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Agent not found")
    skill = session.get(Skill, skill_id)
    if not skill or skill.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Skill not found")
    existing = session.get(AgentSkillLink, {"agent_id": agent_id, "skill_id": skill_id})
    if existing:
        return Message(message="Skill already assigned")
    link = AgentSkillLink(agent_id=agent_id, skill_id=skill_id)
    session.add(link)
    session.commit()
    return Message(message="Skill added to agent")


@router.delete("/{agent_id}/skills/{skill_id}", response_model=Message)
def remove_skill_from_agent(
    agent_id: uuid.UUID,
    skill_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Message:
    agent = session.get(Agent, agent_id)
    if not agent or agent.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Agent not found")
    link = session.get(AgentSkillLink, {"agent_id": agent_id, "skill_id": skill_id})
    if not link:
        raise HTTPException(status_code=404, detail="Skill not linked to agent")
    session.delete(link)
    session.commit()
    return Message(message="Skill removed from agent")
