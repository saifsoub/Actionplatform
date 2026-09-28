"""Run the repository's Shopify playbooks as authenticated advisory agents.

This endpoint has no Shopify credentials or mutation tools. It produces a
decision-grade response from a versioned skill; store actions require a
separate, explicitly authorized Shopify integration.
"""

import logging
from pathlib import Path

import anthropic as anthropic_sdk
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser
from app.core.ai import get_anthropic_client
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/shopify-skills", tags=["shopify-skills"])

SKILLS_ROOT = Path(__file__).resolve().parents[4] / "skills"
SKILL_REFERENCES = {
    "shopify-dima": "shopify-dima-handover.md",
    "shopify-noura": "claude-handover-reference.md",
    "shopify-atlas": "handover-template.md",
}


class SkillCatalogItem(BaseModel):
    slug: str
    title: str
    mode: str = "advisory"


class SkillRunRequest(BaseModel):
    task: str = Field(min_length=1, max_length=4000)
    context: str = Field(default="", max_length=8000)


class SkillRunResponse(BaseModel):
    slug: str
    mode: str = "advisory"
    answer: str


def load_skill(slug: str) -> str:
    """Load only allowlisted repository files; never accept user-supplied paths."""
    reference = SKILL_REFERENCES.get(slug)
    if reference is None:
        raise HTTPException(status_code=404, detail="Shopify skill not found")
    skill_dir = SKILLS_ROOT / slug
    try:
        instructions = (skill_dir / "SKILL.md").read_text(encoding="utf-8")
        handover = (skill_dir / "references" / reference).read_text(encoding="utf-8")
    except OSError:
        logger.exception("Shopify skill source unavailable: %s", slug)
        raise HTTPException(status_code=503, detail="Shopify skill source unavailable")
    return f"{instructions}\n\n# Supporting reference\n{handover}"


@router.get("/", response_model=list[SkillCatalogItem])
def list_shopify_skills(_current_user: CurrentUser) -> list[SkillCatalogItem]:
    return [
        SkillCatalogItem(slug=slug, title=slug.removeprefix("shopify-").title())
        for slug in SKILL_REFERENCES
    ]


@router.post("/{slug}/run", response_model=SkillRunResponse)
async def run_shopify_skill(
    slug: str,
    body: SkillRunRequest,
    _current_user: CurrentUser,
) -> SkillRunResponse:
    instructions = load_skill(slug)
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")

    system = (
        "Follow the Shopify skill and supporting reference below. Your role in "
        "this API is advisory: you have no Shopify, Linear, or other external "
        "tools. Never claim to have read a store, changed data, sent messages, "
        "or completed a handover in another system. Do not invent metrics or "
        "source evidence. Give a useful answer and identify the exact missing "
        "inputs or access needed for actions.\n\n" + instructions
    )
    prompt = f"Task: {body.task}\n\nContext supplied by the user:\n{body.context or '(none)'}"
    try:
        message = await get_anthropic_client().messages.create(
            model=settings.COUNCIL_MODEL,
            max_tokens=1600,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic_sdk.RateLimitError:
        raise HTTPException(status_code=429, detail="AI service rate limit reached")
    except anthropic_sdk.APIError:
        logger.exception("Shopify skill AI error: %s", slug)
        raise HTTPException(status_code=502, detail="AI service unavailable")

    answer = "\n".join(
        block.text for block in message.content
        if isinstance(block, anthropic_sdk.types.TextBlock)
    ).strip()
    if not answer:
        raise HTTPException(status_code=502, detail="AI returned no text")
    return SkillRunResponse(slug=slug, answer=answer)
