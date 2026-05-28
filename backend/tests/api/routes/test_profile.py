from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.models import UserProfile
from tests.utils.user import authentication_token_from_email
from tests.utils.utils import random_email


def _create_user_headers(client: TestClient, db: Session) -> tuple[dict[str, str], str]:
    email = random_email()
    headers = authentication_token_from_email(client=client, email=email, db=db)
    user = crud.get_user_by_email(session=db, email=email)
    assert user
    return headers, str(user.id)


def _profiles_for_user(db: Session, user_id: str) -> list[UserProfile]:
    return list(
        db.exec(select(UserProfile).where(UserProfile.user_id == user_id)).all()
    )


def test_get_profile_creates_default_profile(
    client: TestClient, db: Session
) -> None:
    headers, user_id = _create_user_headers(client, db)

    response = client.get(f"{settings.API_V1_STR}/profile/", headers=headers)

    assert response.status_code == 200
    content = response.json()
    assert content["user_id"] == user_id
    assert content["role"] is None
    assert content["domain"] is None
    assert content["biggest_challenge"] is None
    assert content["goals"] is None
    assert content["timezone"] is None
    assert content["sage_email_digest"] is False
    assert content["onboarding_complete"] is False
    assert "id" in content
    assert "created_at" in content
    assert len(_profiles_for_user(db, user_id)) == 1


def test_get_profile_is_idempotent(
    client: TestClient, db: Session
) -> None:
    headers, user_id = _create_user_headers(client, db)

    first_response = client.get(f"{settings.API_V1_STR}/profile/", headers=headers)
    second_response = client.get(f"{settings.API_V1_STR}/profile/", headers=headers)

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert second_response.json()["id"] == first_response.json()["id"]
    assert len(_profiles_for_user(db, user_id)) == 1


def test_update_profile_persists_all_fields(
    client: TestClient, db: Session
) -> None:
    headers, user_id = _create_user_headers(client, db)
    data = {
        "role": "Founder",
        "domain": "Health care",
        "biggest_challenge": "Prioritizing experiments",
        "goals": "Ship an onboarding flow",
        "timezone": "America/New_York",
        "sage_email_digest": True,
        "onboarding_complete": True,
    }

    response = client.put(
        f"{settings.API_V1_STR}/profile/",
        headers=headers,
        json=data,
    )

    assert response.status_code == 200
    content = response.json()
    assert content["user_id"] == user_id
    for key, value in data.items():
        assert content[key] == value

    profile = _profiles_for_user(db, user_id)[0]
    db.refresh(profile)
    for key, value in data.items():
        assert getattr(profile, key) == value


def test_update_profile_partial_payload_preserves_existing_values(
    client: TestClient, db: Session
) -> None:
    headers, user_id = _create_user_headers(client, db)
    initial_data = {
        "role": "Operator",
        "domain": "SaaS",
        "goals": "Improve activation",
        "sage_email_digest": True,
    }
    initial_response = client.put(
        f"{settings.API_V1_STR}/profile/",
        headers=headers,
        json=initial_data,
    )
    assert initial_response.status_code == 200

    response = client.put(
        f"{settings.API_V1_STR}/profile/",
        headers=headers,
        json={"domain": "Fintech", "onboarding_complete": True},
    )

    assert response.status_code == 200
    content = response.json()
    assert content["role"] == initial_data["role"]
    assert content["domain"] == "Fintech"
    assert content["goals"] == initial_data["goals"]
    assert content["sage_email_digest"] is True
    assert content["onboarding_complete"] is True

    profile = _profiles_for_user(db, user_id)[0]
    db.refresh(profile)
    assert profile.role == initial_data["role"]
    assert profile.domain == "Fintech"
    assert profile.goals == initial_data["goals"]
    assert profile.sage_email_digest is True
    assert profile.onboarding_complete is True


def test_get_profile_requires_authentication(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/profile/")

    assert response.status_code == 401


def test_update_profile_requires_authentication(client: TestClient) -> None:
    response = client.put(
        f"{settings.API_V1_STR}/profile/",
        json={"role": "Founder"},
    )

    assert response.status_code == 401


def test_update_profile_rejects_invalid_field_length(
    client: TestClient, db: Session
) -> None:
    headers, _user_id = _create_user_headers(client, db)

    response = client.put(
        f"{settings.API_V1_STR}/profile/",
        headers=headers,
        json={"role": "x" * 101},
    )

    assert response.status_code == 422
