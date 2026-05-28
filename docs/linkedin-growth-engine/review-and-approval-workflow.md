# Review and approval workflow for posts

## Purpose

This workflow gives every LinkedIn post a clear path from draft feedback to final sign-off before publishing. It is built for a small growth team where one person may write, review, approve, and publish, but the system should still record who made each decision and why.

The first implementation should optimize for clarity over process weight. A post should never reach publishing unless the latest approved revision is the exact content being published.

## Roles

- Author: creates and edits drafts.
- Reviewer: leaves feedback and requests changes.
- Approver: gives final sign-off on the current revision.
- Publisher: schedules or publishes the approved post.

One user can hold more than one role on a post. The audit trail must still record the action with the user's id and timestamp.

## Post states

Use a single status field for the post lifecycle.

| State | Meaning | Allowed next states |
| --- | --- | --- |
| `draft` | The author is still editing. | `in_review`, `archived` |
| `in_review` | The draft is ready for feedback. | `changes_requested`, `approved`, `draft`, `archived` |
| `changes_requested` | A reviewer returned the post with feedback. | `draft`, `in_review`, `archived` |
| `approved` | An approver signed off on the current revision. | `scheduled`, `draft`, `archived` |
| `scheduled` | The approved content has a planned publish time. | `published`, `approved`, `draft`, `archived` |
| `published` | The post has been published or marked as published. | `archived` |
| `archived` | Work stopped or the post was removed from the active queue. | `draft` |

## Review loop

1. The author creates a post in `draft`.
2. The author submits the post for review. The status becomes `in_review`.
3. Reviewers add feedback against the current revision.
4. A reviewer either requests changes or marks the draft as ready for approval.
5. If changes are requested, the status becomes `changes_requested`. The author edits the draft, then submits it again.
6. The approver approves the current revision. The status becomes `approved`.
7. The publisher schedules or publishes the approved revision.

Any content edit after approval must reset the status to `draft` and clear scheduling. This keeps sign-off tied to the text that will actually go live.

## Feedback model

Feedback should be attached to a post revision, not just to the post. Start with general comments and leave inline comments for a later release unless the editor already supports stable text anchors.

Each feedback item should store:

- `id`
- `post_id`
- `revision_number`
- `author_id`
- `body`
- `status`, with values `open` or `resolved`
- `created_at`
- `resolved_at`

Open feedback blocks approval. Resolved feedback stays visible in the history.

## Approval record

Approvals should be immutable records. Do not store only `approved_by` on the post.

Each approval should store:

- `id`
- `post_id`
- `revision_number`
- `approver_id`
- `approved_at`
- `decision_note`

The post can denormalize `approved_revision_number` for quick reads, but the approval table is the source of truth.

## Edit and transition rules

- A post can be edited in `draft` or `changes_requested`.
- Editing an `approved` or `scheduled` post creates a new revision and moves the post back to `draft`.
- A post can move to `approved` only when there is no open feedback on the current revision.
- A post can move to `scheduled` only if the scheduled revision matches the approved revision.
- A post can move to `published` only from `scheduled` or `approved`.
- A published post cannot be edited in place. Corrections should create a follow-up draft or an internal note.
- Archiving is allowed from any state. For `published` posts, archive should hide the record from active queues without deleting the published history.

## User experience

The post detail screen should show the workflow in one place:

- Current status and revision number.
- Main editor for the latest revision.
- Review panel with open and resolved feedback.
- Activity timeline for edits, submissions, feedback, approvals, scheduling, and publishing.
- Primary action button based on status, such as "Submit for review", "Request changes", "Approve", "Schedule", or "Mark published".

The list view should support queue filters:

- Drafts assigned to me.
- Needs review.
- Changes requested.
- Approved and ready to schedule.
- Scheduled.
- Published.

## Notifications

The first version can use in-app indicators. Email or Slack can come later.

Trigger an in-app notification when:

- A post is submitted for review.
- Changes are requested.
- Feedback is resolved.
- A post is approved.
- An approved post is edited and loses approval.
- A post is scheduled or published.

## Edge cases

- Stale approval: if the approved revision is older than the latest revision, the UI must show "approval required" and block scheduling.
- Concurrent edits: use an `updated_at` or revision check so one editor cannot overwrite another editor's changes silently.
- Empty draft: a post with empty content cannot be submitted for review.
- Missing approver: approval can be self-service for single-user accounts, but team accounts should support assigning an approver before review.
- Publishing failure: keep the post in `scheduled`, record the error, and require another publish attempt or a move back to `approved`.

## Minimal data model

The first code-backed version should add these core records:

```text
Post
- id
- owner_id
- title
- body
- status
- revision_number
- approved_revision_number
- scheduled_for
- published_at
- created_at
- updated_at

PostFeedback
- id
- post_id
- revision_number
- author_id
- body
- status
- created_at
- resolved_at

PostApproval
- id
- post_id
- revision_number
- approver_id
- decision_note
- approved_at

PostActivity
- id
- post_id
- actor_id
- action
- from_status
- to_status
- revision_number
- metadata
- created_at
```

## API shape

Keep the API explicit. Status changes should be actions, not loose partial updates.

- `POST /posts` creates a draft.
- `GET /posts` lists posts with filters for status and assignment.
- `GET /posts/{post_id}` returns the post, feedback, approvals, and recent activity.
- `PATCH /posts/{post_id}` edits the draft body or title.
- `POST /posts/{post_id}/submit-review` moves a draft to review.
- `POST /posts/{post_id}/feedback` adds feedback to the current revision.
- `POST /posts/{post_id}/feedback/{feedback_id}/resolve` resolves feedback.
- `POST /posts/{post_id}/request-changes` returns the post to the author.
- `POST /posts/{post_id}/approve` approves the current revision.
- `POST /posts/{post_id}/schedule` schedules an approved revision.
- `POST /posts/{post_id}/publish` marks an approved or scheduled post as published.
- `POST /posts/{post_id}/archive` archives inactive work.

## Acceptance criteria

- The workflow has a documented state machine for draft, review, changes, approval, scheduling, publishing, and archive.
- Approval is tied to a specific revision.
- Editing approved content invalidates approval and scheduling.
- Open feedback blocks final approval.
- The design records who submitted, reviewed, approved, scheduled, and published a post.
- The API proposal uses explicit workflow actions for status transitions.
- The UI proposal gives users a queue for items that need their attention.

## Implementation notes

This repository does not currently have a LinkedIn post domain. When the feature moves from design to implementation, mirror the existing FastAPI and React patterns:

- Backend models should live in `backend/app/models.py`, with route handlers under `backend/app/api/routes/posts.py`.
- The router should be registered in `backend/app/api/main.py`.
- Database changes should use an Alembic migration under `backend/app/alembic/versions/`.
- Backend tests should live under `backend/tests/api/routes/test_posts.py`.
- Frontend work should add a route under `frontend/src/routes/_layout/` and a feature component under `frontend/src/components/`.
- If the frontend uses the generated client, regenerate it with `bash scripts/generate-client.sh` after backend API changes.
