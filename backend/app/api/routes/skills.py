import json
import logging
import re
import uuid

import anthropic as anthropic_sdk
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

logger = logging.getLogger(__name__)

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.models import (
    Agent,
    AgentSkillLink,
    Message,
    Skill,
    SkillCreate,
    SkillMatchResult,
    SkillPublic,
    SkillsPublic,
    SkillUpdate,
)

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/", response_model=SkillsPublic)
def list_skills(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> SkillsPublic:
    count = session.exec(
        select(func.count()).where(Skill.owner_id == current_user.id)
    ).one()
    skills = session.exec(
        select(Skill).where(Skill.owner_id == current_user.id).offset(skip).limit(limit)
    ).all()
    return SkillsPublic(data=list(skills), count=count)


@router.post("/", response_model=SkillPublic)
def create_skill(
    body: SkillCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> Skill:
    skill = Skill.model_validate(body, update={"owner_id": current_user.id})
    session.add(skill)
    session.commit()
    session.refresh(skill)
    return skill


@router.get("/{skill_id}", response_model=SkillPublic)
def get_skill(
    skill_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Skill:
    skill = session.get(Skill, skill_id)
    if not skill or skill.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.patch("/{skill_id}", response_model=SkillPublic)
def update_skill(
    skill_id: uuid.UUID,
    body: SkillUpdate,
    session: SessionDep,
    current_user: CurrentUser,
) -> Skill:
    skill = session.get(Skill, skill_id)
    if not skill or skill.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Skill not found")
    update_data = body.model_dump(exclude_unset=True)
    skill.sqlmodel_update(update_data)
    session.add(skill)
    session.commit()
    session.refresh(skill)
    return skill


@router.delete("/{skill_id}", response_model=Message)
def delete_skill(
    skill_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Message:
    skill = session.get(Skill, skill_id)
    if not skill or skill.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Skill not found")
    session.delete(skill)
    session.commit()
    return Message(message="Skill deleted")


@router.post("/{skill_id}/match", response_model=SkillMatchResult)
async def match_skill_to_agents(
    skill_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> SkillMatchResult:
    """Use Claude to determine which agents this skill fits, or suggest a new agent."""
    skill = session.get(Skill, skill_id)
    if not skill or skill.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Skill not found")

    agents = session.exec(
        select(Agent).where(Agent.owner_id == current_user.id)
    ).all()

    if not settings.ANTHROPIC_API_KEY:
        # Fallback: no AI matching, suggest adding to all
        return SkillMatchResult(
            skill_id=skill_id,
            skill_name=skill.name,
            matched_agent_ids=[a.id for a in agents],
            suggested_new_agent=False,
            reasoning="AI matching not configured. Showing all agents as candidates.",
        )

    agents_summary = "\n".join(
        f"- ID:{a.id} | {a.persona} ({a.role}): {a.instructions[:200]}"
        for a in agents
    ) or "No agents created yet."

    prompt = f"""You are a skill-matching assistant. Given a new skill and a list of agents, determine:
1. Which agents would benefit from this skill (0 or more)
2. Whether a brand-new dedicated agent should be created for this skill

Skill name: {skill.name}
Skill description: {skill.description}
Skill tags: {skill.tags}
Skill instructions: {skill.instructions[:500]}

Existing agents:
{agents_summary}

Respond in JSON format only:
{{
  "matched_agent_ids": ["<uuid>", ...],
  "suggested_new_agent": true/false,
  "reasoning": "One sentence explanation"
}}"""

    client = anthropic_sdk.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    try:
        msg = await client.messages.create(
            model=settings.COUNCIL_MODEL,
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = next((b.text for b in msg.content if hasattr(b, "text")), "{}")
        # extract JSON from possible markdown code block
        md_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if md_match:
            text = md_match.group(1).strip()
        data = json.loads(text)
        matched_ids = []
        for uid in data.get("matched_agent_ids", []):
            try:
                matched_ids.append(uuid.UUID(str(uid)))
            except ValueError:
                pass
        # auto-assign skill to matched agents
        for aid in matched_ids:
            existing = session.get(AgentSkillLink, {"agent_id": aid, "skill_id": skill_id})
            if not existing:
                session.add(AgentSkillLink(agent_id=aid, skill_id=skill_id))
        session.commit()
        return SkillMatchResult(
            skill_id=skill_id,
            skill_name=skill.name,
            matched_agent_ids=matched_ids,
            suggested_new_agent=bool(data.get("suggested_new_agent", False)),
            reasoning=str(data.get("reasoning", "")),
        )
    except anthropic_sdk.RateLimitError:
        raise HTTPException(status_code=429, detail="AI service rate limit reached. Please try again shortly.")
    except anthropic_sdk.APIError as e:
        logger.error("Skill match AI error: %s", e)
        raise HTTPException(status_code=502, detail="AI matching service unavailable")
    except json.JSONDecodeError as e:
        logger.error("Skill match JSON parse error: %s", e)
        raise HTTPException(status_code=502, detail="AI returned a malformed response")
