from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.core.config import settings


def iso(dt: datetime) -> str:
    return dt.isoformat()


def create_monitored_post(
    client: TestClient,
    headers: dict[str, str],
    *,
    title: str = "Launch notes for agentic sales teams",
    published_at: datetime | None = None,
    next_check_at: datetime | None = None,
) -> dict[str, object]:
    now = datetime.now(timezone.utc)
    body = {
        "title": title,
        "linkedin_url": "https://www.linkedin.com/posts/example-launch-notes",
        "published_at": iso(published_at or now),
        "monitor_until": iso(now + timedelta(days=3)),
        "check_interval_hours": 12,
        "notes": "Watch for buying signals and thoughtful objections.",
    }
    if next_check_at is not None:
        body["next_check_at"] = iso(next_check_at)

    response = client.post(
        f"{settings.API_V1_STR}/engagement/posts/",
        headers=headers,
        json=body,
    )
    assert response.status_code == 200
    return response.json()


def test_record_engagement_check_builds_follow_up_workflow(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    post = create_monitored_post(client, superuser_token_headers)

    first_check = client.post(
        f"{settings.API_V1_STR}/engagement/posts/{post['id']}/checks",
        headers=superuser_token_headers,
        json={
            "comments_count": 5,
            "reactions_count": 32,
            "reposts_count": 2,
            "impressions_count": 1200,
            "notes": "Two founder comments need replies.",
            "follow_up_opportunities": [
                {
                    "source": "comment",
                    "contact_name": "Maya Patel",
                    "profile_url": "https://www.linkedin.com/in/maya-patel",
                    "prompt": "Asked how onboarding works for a small sales team.",
                    "priority": "high",
                }
            ],
        },
    )

    assert first_check.status_code == 200
    first_body = first_check.json()
    assert first_body["check"]["comments_delta"] == 5
    assert first_body["check"]["reactions_delta"] == 32
    assert first_body["check"]["reposts_delta"] == 2
    assert first_body["check"]["impressions_delta"] == 1200
    assert first_body["post"]["last_checked_at"] is not None
    assert first_body["post"]["next_check_at"] is not None
    assert len(first_body["follow_up_opportunities"]) == 1
    opportunity = first_body["follow_up_opportunities"][0]
    assert opportunity["status"] == "open"
    assert opportunity["priority"] == "high"
    assert opportunity["prompt"] == "Asked how onboarding works for a small sales team."

    second_check = client.post(
        f"{settings.API_V1_STR}/engagement/posts/{post['id']}/checks",
        headers=superuser_token_headers,
        json={
            "comments_count": 7,
            "reactions_count": 40,
            "reposts_count": 3,
            "impressions_count": 1500,
        },
    )

    assert second_check.status_code == 200
    second_body = second_check.json()
    assert second_body["check"]["comments_delta"] == 2
    assert second_body["check"]["reactions_delta"] == 8
    assert second_body["check"]["reposts_delta"] == 1
    assert second_body["check"]["impressions_delta"] == 300
    assert second_body["follow_up_opportunities"] == []


def test_engagement_workflow_prioritizes_due_posts_and_open_follow_ups(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    now = datetime.now(timezone.utc)
    due_post = create_monitored_post(
        client,
        superuser_token_headers,
        title="Post that needs a fresh engagement check",
        published_at=now - timedelta(hours=6),
        next_check_at=now - timedelta(minutes=30),
    )
    opportunity_post = create_monitored_post(
        client,
        superuser_token_headers,
        title="Post with comments worth pursuing",
    )

    response = client.post(
        f"{settings.API_V1_STR}/engagement/posts/{opportunity_post['id']}/checks",
        headers=superuser_token_headers,
        json={
            "comments_count": 1,
            "reactions_count": 10,
            "follow_up_opportunities": [
                {
                    "source": "comment",
                    "contact_name": "Jordan Lee",
                    "prompt": "Wants the checklist template mentioned in the post.",
                    "priority": "medium",
                }
            ],
        },
    )
    assert response.status_code == 200

    workflow = client.get(
        f"{settings.API_V1_STR}/engagement/workflow",
        headers=superuser_token_headers,
    )

    assert workflow.status_code == 200
    body = workflow.json()
    assert body["totals"]["monitored_posts"] >= 2
    assert body["totals"]["posts_to_check"] >= 1
    assert body["totals"]["open_follow_ups"] >= 1
    assert any(item["id"] == due_post["id"] for item in body["posts_to_check"])
    assert any(
        item["contact_name"] == "Jordan Lee"
        for item in body["open_follow_ups"]
    )


def test_engagement_posts_are_owner_scoped(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
) -> None:
    post = create_monitored_post(client, superuser_token_headers)

    response = client.post(
        f"{settings.API_V1_STR}/engagement/posts/{post['id']}/checks",
        headers=normal_user_token_headers,
        json={"comments_count": 1, "reactions_count": 1},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Engagement post not found"
