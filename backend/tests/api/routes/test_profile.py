from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.models import UserProfile
from tests.utils.user import authentication_token_from_email
from tests.utils.utils import random_email


def _auth_headers_for_new_user(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(client=client, email=random_email(), db=db)


def test_get_profile_creates_default_profile(
    client: TestClient,
    db: Session,
) -> None:
    headers = _auth_headers_for_new_user(client, db)

    response = client.get(f"{settings.API_V1_STR}/profile/", headers=headers)

    assert response.status_code == 200
    content = response.json()
    assert content["id"]
    assert content["user_id"]
    assert content["role"] is None
    assert content["domain"] is None
    assert content["biggest_challenge"] is None
    assert content["goals"] is None
    assert content["timezone"] is None
    assert content["sage_email_digest"] is False
    assert content["onboarding_complete"] is False

    profile = db.exec(
        select(UserProfile).where(UserProfile.user_id == content["user_id"])
    ).one()
    assert str(profile.id) == content["id"]


def test_get_profile_reuses_existing_profile(
    client: TestClient,
    db: Session,
) -> None:
    headers = _auth_headers_for_new_user(client, db)

    first_response = client.get(f"{settings.API_V1_STR}/profile/", headers=headers)
    second_response = client.get(f"{settings.API_V1_STR}/profile/", headers=headers)

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    first_profile = first_response.json()
    second_profile = second_response.json()
    assert second_profile["id"] == first_profile["id"]

    profiles = db.exec(
        select(UserProfile).where(UserProfile.user_id == first_profile["user_id"])
    ).all()
    assert len(profiles) == 1


def test_update_profile_persists_fields(
    client: TestClient,
    db: Session,
) -> None:
    headers = _auth_headers_for_new_user(client, db)
    payload = {
        "role": "Founder / CEO",
        "domain": "SaaS / Tech",
        "biggest_challenge": "Narrowing the launch scope",
        "goals": "Ship the first paid pilot",
        "timezone": "America/New_York",
        "sage_email_digest": True,
        "onboarding_complete": True,
    }

    update_response = client.put(
        f"{settings.API_V1_STR}/profile/",
        headers=headers,
        json=payload,
    )
    get_response = client.get(f"{settings.API_V1_STR}/profile/", headers=headers)

    assert update_response.status_code == 200
    assert get_response.status_code == 200
    updated_profile = update_response.json()
    assert updated_profile == get_response.json()
    for key, value in payload.items():
        assert updated_profile[key] == value


def test_update_profile_accepts_partial_payload(
    client: TestClient,
    db: Session,
) -> None:
    headers = _auth_headers_for_new_user(client, db)
    initial_payload = {
        "role": "Founder / CEO",
        "domain": "SaaS / Tech",
        "onboarding_complete": True,
    }
    client.put(
        f"{settings.API_V1_STR}/profile/",
        headers=headers,
        json=initial_payload,
    )

    response = client.put(
        f"{settings.API_V1_STR}/profile/",
        headers=headers,
        json={"role": "Engineer"},
    )
    get_response = client.get(f"{settings.API_V1_STR}/profile/", headers=headers)

    assert response.status_code == 200
    assert get_response.status_code == 200
    content = response.json()
    assert content == get_response.json()
    assert content["role"] == "Engineer"
    assert content["domain"] == initial_payload["domain"]
    assert content["onboarding_complete"] is True


def test_get_profile_requires_authentication(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/profile/")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_update_profile_rejects_invalid_field_length(
    client: TestClient,
    db: Session,
) -> None:
    headers = _auth_headers_for_new_user(client, db)

    response = client.put(
        f"{settings.API_V1_STR}/profile/",
        headers=headers,
        json={"role": "x" * 101},
    )

    assert response.status_code == 422
