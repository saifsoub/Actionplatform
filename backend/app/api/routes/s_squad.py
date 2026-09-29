"""S/Squad execution through the canonical S/Passport authority gate.

A repository seat is not a live worker merely because its Passport ID exists.
Every invocation checks current identity and policy before the model is called.
"""
import logging
from typing import Literal

import anthropic as anthropic_sdk
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser
from app.core.ai import get_anthropic_client
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/s-squad", tags=["s-squad"])

# Canonical seat-to-Passport assignment in S/Agency's registry.
SEATS = {
    "team-lead": ("S-PASS-4C7A130D9E1D", "planning", "Squad Lead: plan, route, coordinate, and escalate."),
    "business-strategy": ("S-PASS-1FD06ADB440F", "business_planning", "Business Strategist: produce commercial analysis and plans."),
    "research-intelligence": ("S-PASS-80E975F13E6E", "research", "Research Specialist: verify sources and synthesize findings."),
    "operations-delivery": ("S-PASS-4ABE7EB12961", "delivery", "Operations Specialist: plan and coordinate delivery."),
    "product-design": ("S-PASS-2413537589E8", "product_design", "Product Designer: design journeys and prototypes."),
    "content-communications": ("S-PASS-D50FDA4B3C21", "content", "Communications Specialist: develop content and presentations."),
    "engineering-integration": ("S-PASS-80B4C0CA4EB0", "software", "Engineering Specialist: design software and integrations."),
    "qa-evidence": ("S-PASS-EB7EC4B664A7", "quality_assurance", "QA Specialist: review evidence, risks, and acceptance criteria."),
    "scribe-progress": ("S-PASS-FBCCF33CEB0E", "progress_tracking", "Scribe: track progress, decisions, evidence, and handoffs."),
}
PURPOSE = "s-squad-delivery"


class SquadRequest(BaseModel):
    task: str = Field(min_length=1, max_length=4000)
    context: str = Field(default="", max_length=8000)
    action_id: str = Field(min_length=1, max_length=120)
    secondary_validation: bool = False


class SquadSeat(BaseModel):
    seat_id: str
    passport_id: str
    status: str


class SquadResult(BaseModel):
    seat_id: str
    passport_id: str
    receipt_id: str
    answer: str
    mode: Literal["advisory"] = "advisory"


def owner_only(user: CurrentUser) -> None:
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Owner access required")


def registry_url() -> str:
    if not settings.S_PASSPORT_URL:
        raise HTTPException(status_code=503, detail="S/Passport registry not configured")
    return settings.S_PASSPORT_URL.rstrip("/")


async def passport_status(client: httpx.AsyncClient, passport_id: str, seat_id: str) -> str:
    try:
        response = await client.get(
            f"{registry_url()}/functions/v1/passport-registry",
            params={"passport_id": passport_id},
        )
        response.raise_for_status()
        passports = response.json().get("passports", [])
    except (httpx.HTTPError, ValueError, AttributeError):
        logger.exception("S/Passport registry unavailable")
        raise HTTPException(status_code=503, detail="S/Passport registry unavailable")
    if len(passports) != 1 or passports[0].get("passport_id") != passport_id:
        raise HTTPException(status_code=403, detail="Passport identity unavailable")
    return str(passports[0].get("status", ""))


@router.get("/seats", response_model=list[SquadSeat])
async def list_squad_seats(current_user: CurrentUser) -> list[SquadSeat]:
    owner_only(current_user)
    async with httpx.AsyncClient(timeout=10) as client:
        result = []
        for seat_id, (passport_id, _, _) in SEATS.items():
            status = await passport_status(client, passport_id, seat_id)
            result.append(SquadSeat(seat_id=seat_id, passport_id=passport_id, status=status))
        return result


@router.post("/{seat_id}/run", response_model=SquadResult)
async def run_squad_seat(
    seat_id: str, body: SquadRequest, current_user: CurrentUser
) -> SquadResult:
    owner_only(current_user)
    seat = SEATS.get(seat_id)
    if seat is None:
        raise HTTPException(status_code=404, detail="S/Squad seat not found")
    passport_id, capability, role = seat
    if not settings.S_PASSPORT_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=503, detail="S/Passport gate credential not configured")
    async with httpx.AsyncClient(timeout=10) as client:
        if await passport_status(client, passport_id, seat_id) != "active":
            raise HTTPException(status_code=409, detail="S/Squad seat Passport is paused")
        try:
            gate = await client.post(
                f"{registry_url()}/functions/v1/passport-gate",
                headers={
                    "Authorization": f"Bearer {settings.S_PASSPORT_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "passport_id": passport_id,
                    "action_id": body.action_id,
                    "capability": capability,
                    "purpose": PURPOSE,
                    "secondary_validation": body.secondary_validation,
                    "spend_amount": 0,
                    "requests_delegation": False,
                    "irreversible": False,
                },
            )
            decision = gate.json()
        except (httpx.HTTPError, ValueError):
            logger.exception("S/Passport authority gate unavailable")
            raise HTTPException(status_code=503, detail="S/Passport authority gate unavailable")
    if decision.get("decision") != "allow":
        raise HTTPException(
            status_code=403,
            detail={"decision": decision.get("decision", "deny"),
                    "reasons": decision.get("reasons", []),
                    "receipt_id": decision.get("receipt_id")},
        )
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    system = (
        f"You are the S/Squad {seat_id} seat under S/Agency. {role} "
        "Operate only within the authorized task and supplied context. "
        "This API gives you no external tools: do not claim to have changed data, "
        "deployed, sent messages, or completed a task in another system. "
        "State evidence and remaining actions precisely."
    )
    try:
        message = await get_anthropic_client().messages.create(
            model=settings.COUNCIL_MODEL,
            max_tokens=1600,
            system=system,
            messages=[{"role": "user", "content": f"Task: {body.task}\nContext: {body.context or '(none)'}"}],
        )
    except anthropic_sdk.RateLimitError:
        raise HTTPException(status_code=429, detail="AI service rate limit reached")
    except anthropic_sdk.APIError:
        logger.exception("S/Squad model unavailable for seat %s", seat_id)
        raise HTTPException(status_code=502, detail="AI service unavailable")
    answer = "\n".join(
        block.text for block in message.content
        if isinstance(block, anthropic_sdk.types.TextBlock)
    ).strip()
    if not answer:
        raise HTTPException(status_code=502, detail="AI returned no text")
    return SquadResult(
        seat_id=seat_id, passport_id=passport_id,
        receipt_id=str(decision["receipt_id"]), answer=answer,
    )
