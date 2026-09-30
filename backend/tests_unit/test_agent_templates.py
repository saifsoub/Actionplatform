import os

from fastapi import FastAPI
from fastapi.testclient import TestClient

os.environ.setdefault("PROJECT_NAME", "Test Project")
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_USER", "postgres")
os.environ.setdefault("POSTGRES_DB", "app")
os.environ.setdefault("FIRST_SUPERUSER", "admin@example.com")
os.environ.setdefault("FIRST_SUPERUSER_PASSWORD", "not-a-default-password")

from app.agent_templates import LINKEDIN_POST_DRAFTER_TEMPLATE, list_agent_templates
from app.api.deps import get_current_user
from app.api.routes.agents import list_templates, router


def test_linkedin_post_drafter_template_covers_review_ready_drafts() -> None:
    template = LINKEDIN_POST_DRAFTER_TEMPLATE

    assert template.name == "linkedin-post-drafter"
    assert template.persona == "LinkedIn Drafting Agent"
    assert template.role == "LinkedIn Content Drafter"
    assert template.is_public is False

    instructions = template.instructions.lower()
    assert "voice alignment" in instructions
    assert "post structure" in instructions
    assert "hook" in instructions
    assert "cta" in instructions
    assert "variants" in instructions
    assert "review" in instructions


def test_list_agent_templates_returns_serializable_agent_payloads() -> None:
    payloads = list_agent_templates()

    assert payloads == [LINKEDIN_POST_DRAFTER_TEMPLATE.model_dump()]
    assert set(payloads[0]) == {
        "name",
        "persona",
        "emoji",
        "role",
        "instructions",
        "color",
        "is_public",
    }


def test_templates_route_returns_template_payloads() -> None:
    assert list_templates(_current_user=object()) == {
        "data": [LINKEDIN_POST_DRAFTER_TEMPLATE.model_dump()]
    }


def test_templates_endpoint_resolves_before_agent_id_route() -> None:
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: object()

    response = TestClient(app).get(
        "/agents/templates",
        headers={"Authorization": "Bearer test-token"},
    )

    assert response.status_code == 200
    assert response.json() == {"data": [LINKEDIN_POST_DRAFTER_TEMPLATE.model_dump()]}
