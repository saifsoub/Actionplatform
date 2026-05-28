import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    EngagementCheck,
    EngagementCheckCreate,
    EngagementCheckResult,
    EngagementPost,
    EngagementPostCreate,
    EngagementPostPublic,
    EngagementPostsPublic,
    EngagementPostStatus,
    EngagementPostUpdate,
    EngagementWorkflowPublic,
    EngagementWorkflowTotals,
    FollowUpOpportunity,
    FollowUpOpportunityPublic,
    FollowUpOpportunityUpdate,
    FollowUpStatus,
    Message,
)

router = APIRouter(prefix="/engagement", tags=["engagement"])


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def get_owned_post(
    session: SessionDep,
    current_user: CurrentUser,
    post_id: uuid.UUID,
) -> EngagementPost:
    post = session.exec(
        select(EngagementPost).where(
            EngagementPost.id == post_id,
            EngagementPost.owner_id == current_user.id,
        )
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Engagement post not found")
    return post


def get_owned_follow_up(
    session: SessionDep,
    current_user: CurrentUser,
    follow_up_id: uuid.UUID,
) -> FollowUpOpportunity:
    follow_up = session.exec(
        select(FollowUpOpportunity).where(
            FollowUpOpportunity.id == follow_up_id,
            FollowUpOpportunity.owner_id == current_user.id,
        )
    ).first()
    if not follow_up:
        raise HTTPException(status_code=404, detail="Follow-up opportunity not found")
    return follow_up


def non_negative_delta(current: int, previous: int) -> int:
    return max(current - previous, 0)


@router.get("/posts/", response_model=EngagementPostsPublic)
def list_posts(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
) -> EngagementPostsPublic:
    count = session.exec(
        select(func.count())
        .select_from(EngagementPost)
        .where(EngagementPost.owner_id == current_user.id)
    ).one()
    posts = session.exec(
        select(EngagementPost)
        .where(EngagementPost.owner_id == current_user.id)
        .order_by(col(EngagementPost.created_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return EngagementPostsPublic(data=list(posts), count=count)


@router.post("/posts/", response_model=EngagementPostPublic)
def create_post(
    body: EngagementPostCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> EngagementPost:
    published_at = as_utc(body.published_at)
    next_check_at = body.next_check_at
    if next_check_at is None and body.status == EngagementPostStatus.monitoring:
        next_check_at = published_at + timedelta(hours=body.check_interval_hours)

    post = EngagementPost.model_validate(
        body,
        update={
            "owner_id": current_user.id,
            "published_at": published_at,
            "monitor_until": as_utc(body.monitor_until) if body.monitor_until else None,
            "next_check_at": as_utc(next_check_at) if next_check_at else None,
        },
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.get("/posts/{post_id}", response_model=EngagementPostPublic)
def get_post(
    post_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> EngagementPost:
    return get_owned_post(session, current_user, post_id)


@router.patch("/posts/{post_id}", response_model=EngagementPostPublic)
def update_post(
    post_id: uuid.UUID,
    body: EngagementPostUpdate,
    session: SessionDep,
    current_user: CurrentUser,
) -> EngagementPost:
    post = get_owned_post(session, current_user, post_id)
    update_data = body.model_dump(exclude_unset=True)
    post.sqlmodel_update(update_data)
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.delete("/posts/{post_id}", response_model=Message)
def delete_post(
    post_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Message:
    post = get_owned_post(session, current_user, post_id)
    session.delete(post)
    session.commit()
    return Message(message="Engagement post deleted")


@router.post("/posts/{post_id}/checks", response_model=EngagementCheckResult)
def record_check(
    post_id: uuid.UUID,
    body: EngagementCheckCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> EngagementCheckResult:
    post = get_owned_post(session, current_user, post_id)
    previous_check = session.exec(
        select(EngagementCheck)
        .where(EngagementCheck.post_id == post.id)
        .order_by(col(EngagementCheck.checked_at).desc())
    ).first()

    previous_comments = previous_check.comments_count if previous_check else 0
    previous_reactions = previous_check.reactions_count if previous_check else 0
    previous_reposts = previous_check.reposts_count if previous_check else 0
    previous_impressions = previous_check.impressions_count if previous_check else 0
    checked_at = as_utc(body.checked_at or utc_now())

    check = EngagementCheck(
        post_id=post.id,
        owner_id=current_user.id,
        checked_at=checked_at,
        comments_count=body.comments_count,
        comments_delta=non_negative_delta(body.comments_count, previous_comments),
        reactions_count=body.reactions_count,
        reactions_delta=non_negative_delta(body.reactions_count, previous_reactions),
        reposts_count=body.reposts_count,
        reposts_delta=non_negative_delta(body.reposts_count, previous_reposts),
        impressions_count=body.impressions_count,
        impressions_delta=non_negative_delta(body.impressions_count, previous_impressions),
        notes=body.notes,
    )
    session.add(check)

    follow_ups = [
        FollowUpOpportunity.model_validate(
            item,
            update={"post_id": post.id, "owner_id": current_user.id},
        )
        for item in body.follow_up_opportunities
    ]
    for follow_up in follow_ups:
        session.add(follow_up)

    next_check_at = checked_at + timedelta(hours=post.check_interval_hours)
    monitor_until = as_utc(post.monitor_until) if post.monitor_until else None
    if monitor_until and next_check_at > monitor_until:
        post.status = EngagementPostStatus.completed
        post.next_check_at = None
    else:
        post.next_check_at = next_check_at
    post.last_checked_at = checked_at
    session.add(post)

    session.commit()
    session.refresh(post)
    session.refresh(check)
    for follow_up in follow_ups:
        session.refresh(follow_up)

    return EngagementCheckResult(
        post=EngagementPostPublic.model_validate(post),
        check=check,
        follow_up_opportunities=list(follow_ups),
    )


@router.get("/workflow", response_model=EngagementWorkflowPublic)
def get_workflow(
    session: SessionDep,
    current_user: CurrentUser,
    limit: int = Query(default=50, ge=1, le=200),
) -> EngagementWorkflowPublic:
    now = utc_now()
    monitored_count = session.exec(
        select(func.count())
        .select_from(EngagementPost)
        .where(
            EngagementPost.owner_id == current_user.id,
            EngagementPost.status == EngagementPostStatus.monitoring,
        )
    ).one()
    posts_to_check = session.exec(
        select(EngagementPost)
        .where(
            EngagementPost.owner_id == current_user.id,
            EngagementPost.status == EngagementPostStatus.monitoring,
            col(EngagementPost.next_check_at).is_not(None),
            col(EngagementPost.next_check_at) <= now,
        )
        .order_by(col(EngagementPost.next_check_at).asc())
        .limit(limit)
    ).all()
    posts_to_check_count = session.exec(
        select(func.count())
        .select_from(EngagementPost)
        .where(
            EngagementPost.owner_id == current_user.id,
            EngagementPost.status == EngagementPostStatus.monitoring,
            col(EngagementPost.next_check_at).is_not(None),
            col(EngagementPost.next_check_at) <= now,
        )
    ).one()
    open_follow_ups = session.exec(
        select(FollowUpOpportunity)
        .where(
            FollowUpOpportunity.owner_id == current_user.id,
            FollowUpOpportunity.status == FollowUpStatus.open,
        )
        .order_by(col(FollowUpOpportunity.created_at).asc())
        .limit(limit)
    ).all()
    open_follow_up_count = session.exec(
        select(func.count())
        .select_from(FollowUpOpportunity)
        .where(
            FollowUpOpportunity.owner_id == current_user.id,
            FollowUpOpportunity.status == FollowUpStatus.open,
        )
    ).one()

    return EngagementWorkflowPublic(
        totals=EngagementWorkflowTotals(
            monitored_posts=monitored_count,
            posts_to_check=posts_to_check_count,
            open_follow_ups=open_follow_up_count,
        ),
        posts_to_check=list(posts_to_check),
        open_follow_ups=list(open_follow_ups),
    )


@router.patch("/follow-ups/{follow_up_id}", response_model=FollowUpOpportunityPublic)
def update_follow_up(
    follow_up_id: uuid.UUID,
    body: FollowUpOpportunityUpdate,
    session: SessionDep,
    current_user: CurrentUser,
) -> FollowUpOpportunity:
    follow_up = get_owned_follow_up(session, current_user, follow_up_id)
    update_data = body.model_dump(exclude_unset=True)
    follow_up.sqlmodel_update(update_data)
    session.add(follow_up)
    session.commit()
    session.refresh(follow_up)
    return follow_up
