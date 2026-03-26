import asyncio
import logging
from datetime import datetime, timezone

import anthropic as anthropic_sdk
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.models import (
    CouncilQueryRequest,
    CouncilQueryResponse,
    CouncilSession,
    Subscription,
    SubscriptionTier,
    UserProfile,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/council", tags=["council"])

# Module-level singleton — avoids re-initialising the HTTP client on every request
_anthropic_client: anthropic_sdk.AsyncAnthropic | None = None


def _get_anthropic_client() -> anthropic_sdk.AsyncAnthropic:
    global _anthropic_client
    if _anthropic_client is None:
        _anthropic_client = anthropic_sdk.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _anthropic_client


# ── Subscription tier limits ──────────────────────────────────────────────────
TIER_LIMITS: dict[str, int] = {
    SubscriptionTier.free: 3,
    SubscriptionTier.pro: 50,
    SubscriptionTier.elite: 9999,
}

# ── Agent personas ─────────────────────────────────────────────────────────────
AGENT_PROMPTS: dict[str, str] = {
    "atlas": (
        "You are Atlas — a strategic systems thinker with a global perspective. "
        "You speak with calm authority. You help people see positioning, leverage, moats, "
        "and the systemic forces shaping their situation. You challenge whether the right "
        "problem is being solved, and you always think about the 18-month horizon. "
        "Respond in 3–5 crisp, decisive sentences. No bullet points or headers."
    ),
    "nova": (
        "You are Nova — a luminous creative ideator who finds unexpected angles. "
        "You surface hidden human truths, invert problems, and draw inspiration from "
        "film, architecture, game design, and nature. You ask questions that make people "
        "think bigger than they thought possible. "
        "Respond in 3–5 vivid, energetic sentences. No bullet points or headers."
    ),
    "reza": (
        "You are Reza — a sharp devil's advocate who stress-tests ideas with precision. "
        "You identify the riskiest hidden assumption, name the thing nobody is saying, "
        "and demand evidence. You are not negative — you want the idea to survive reality. "
        "Respond in 3–5 pointed, honest sentences. No bullet points or headers."
    ),
    "kai": (
        "You are Kai — a pragmatic builder who cares about shipping and learning fast. "
        "You cut scope relentlessly, define the smallest next action, and reject planning theater. "
        "You think in days, not months. Momentum over perfection. "
        "Respond in 3–5 action-oriented sentences. No bullet points or headers."
    ),
}

SYNTHESIS_PROMPT = (
    "You are the Council voice. Four advisors — Atlas (strategy), Nova (vision), "
    "Reza (critique), and Kai (execution) — have each shared their perspective. "
    "Write a single paragraph of 2–3 sentences that distills the single most important "
    "shared insight across all four perspectives. Be direct and decisive. "
    "No attribution to individual advisors, no bullet points."
)


def _build_profile_context(profile: UserProfile | None) -> str:
    """Build a context prefix from the user's profile to personalize responses."""
    if not profile:
        return ""
    parts = []
    if profile.role:
        parts.append(f"Role: {profile.role}")
    if profile.domain:
        parts.append(f"Domain/Industry: {profile.domain}")
    if profile.biggest_challenge:
        parts.append(f"Biggest challenge: {profile.biggest_challenge}")
    if profile.goals:
        parts.append(f"90-day goal: {profile.goals}")
    if not parts:
        return ""
    today = datetime.now(timezone.utc).strftime("%B %d, %Y")
    context = "\n".join(parts)
    return (
        f"[Context about this person — factor it into your response naturally, "
        f"don't repeat it back verbatim]\nDate: {today}\n{context}\n\n"
    )


async def _call_agent(client: anthropic_sdk.AsyncAnthropic, system: str, question: str) -> str:
    msg = await client.messages.create(
        model=settings.COUNCIL_MODEL,
        max_tokens=350,
        system=system,
        messages=[{"role": "user", "content": question}],
    )
    for block in msg.content:
        if hasattr(block, "text"):
            return block.text  # type: ignore[union-attr]
    return ""


@router.post("/query", response_model=CouncilQueryResponse)
async def query_council(
    body: CouncilQueryRequest,
    current_user: CurrentUser,
    session: SessionDep,
) -> CouncilQueryResponse:
    # ── Check API key early ──
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI council not configured")

    # ── Check/create subscription, locking the row to prevent race conditions ──
    sub = session.exec(
        select(Subscription)
        .where(Subscription.user_id == current_user.id)
        .with_for_update()
    ).first()

    if not sub:
        sub = Subscription(user_id=current_user.id, tier=SubscriptionTier.free)
        session.add(sub)
        session.commit()
        session.refresh(sub)
        # Re-acquire with lock now that it exists
        sub = session.exec(
            select(Subscription)
            .where(Subscription.user_id == current_user.id)
            .with_for_update()
        ).first()
        assert sub is not None  # just created above

    limit = TIER_LIMITS.get(sub.tier, 3)
    if sub.sessions_used >= limit:
        raise HTTPException(
            status_code=402,
            detail=f"Session limit reached for {sub.tier} plan. Please upgrade.",
        )

    # ── Increment usage atomically before the AI call ──
    # This ensures concurrent requests cannot bypass the limit even if the
    # AI call takes several seconds.
    sub.sessions_used += 1
    session.add(sub)
    session.commit()

    # ── Fetch user profile for personalization ──
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()
    profile_ctx = _build_profile_context(profile)
    personalized_question = f"{profile_ctx}{body.question}" if profile_ctx else body.question

    client = _get_anthropic_client()

    try:
        results = await asyncio.gather(
            *[_call_agent(client, prompt, personalized_question) for prompt in AGENT_PROMPTS.values()]
        )
    except anthropic_sdk.RateLimitError:
        sub.sessions_used -= 1
        session.add(sub)
        session.commit()
        raise HTTPException(status_code=429, detail="AI service rate limit reached. Please try again shortly.")
    except anthropic_sdk.APIError as e:
        # Rollback the usage increment so the failed session isn't counted
        sub.sessions_used -= 1
        session.add(sub)
        session.commit()
        logger.error("Council agent API error: %s", e)
        raise HTTPException(status_code=502, detail=f"Upstream AI error: {e}")

    responses = dict(zip(AGENT_PROMPTS.keys(), results))

    synthesis_context = (
        f"Question: {body.question}\n\n"
        + "\n\n".join(
            f"{agent_id.capitalize()}: {text}" for agent_id, text in responses.items()
        )
    )

    try:
        synthesis = await _call_agent(client, SYNTHESIS_PROMPT, synthesis_context)
    except anthropic_sdk.APIError as e:
        logger.warning("Council synthesis API error (using fallback): %s", e)
        synthesis = "The council has spoken — validate your core assumption first."

    # ── Persist session to DB ──
    council_session = CouncilSession(
        question=body.question,
        atlas_response=responses.get("atlas", ""),
        nova_response=responses.get("nova", ""),
        reza_response=responses.get("reza", ""),
        kai_response=responses.get("kai", ""),
        synthesis=synthesis,
        owner_id=current_user.id,
    )
    session.add(council_session)
    session.commit()
    session.refresh(council_session)

    return CouncilQueryResponse(
        responses=responses,
        synthesis=synthesis,
        session_id=council_session.id,
    )
