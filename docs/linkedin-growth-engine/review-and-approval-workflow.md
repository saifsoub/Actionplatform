# Review and approval workflow for posts

## Purpose

This workflow gives every LinkedIn post a clear path from draft feedback to final sign-off before publishing. It is built for a small growth team where one person may write, review, approve, and publish, but the system should still record who made each decision and why.

The first implementation should optimize for clarity over process weight. A post should never reach publishing unless the latest approved revision is the exact content being published.

Revisions are first-class records. The post points to the latest revision for fast reads, but approvals, feedback, scheduling, and publishing must all reference a revision number so the team can reconstruct what was reviewed and approved.

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
4. If changes are needed, a reviewer requests changes. The status becomes `changes_requested`, and at least one open feedback item must explain what needs work.
5. The author edits the draft, resolves or responds to feedback, then submits the new revision for review.
6. If there is no open feedback on the current revision, the approver approves it directly from `in_review`. The status becomes `approved`.
7. The publisher schedules or publishes the approved revision.

Any content edit after approval must reset the status to `draft` and clear scheduling. This keeps sign-off tied to the text that will actually go live.

## Feedback model

Feedback should be attached to a post revision, not just to the post. Start with general comments and leave inline comments for a later release unless the editor already supports stable text anchors.

Each feedback item should store:

- `id`
- `post_id`
- `post_revision_id`
- `revision_number`
- `created_by_id`
- `body`
- `status`, with values `open` or `resolved`
- `created_at`
- `resolved_by_id`
- `resolved_at`

Open feedback blocks approval. Resolved feedback stays visible in the history. The author or reviewer may resolve feedback after the requested edit is made, but the activity timeline must record who resolved it.

## Approval record

Approvals should be immutable records. Do not store only `approved_by` on the post.

Each approval should store:

- `id`
- `post_id`
- `post_revision_id`
- `revision_number`
- `approver_id`
- `approved_at`
- `decision_note`

The post can denormalize `approved_revision_number` for quick reads, but the approval table is the source of truth.

## Edit and transition rules

- A post can be edited in `draft` or `changes_requested`.
- Editing a post in `changes_requested` moves it back to `draft` and creates a new revision.
- A post in `in_review` must be withdrawn to `draft` before the author can edit it.
- Editing an `approved` or `scheduled` post creates a new revision and moves the post back to `draft`. It must clear `approved_revision_number`, `scheduled_for`, and `scheduled_revision_number`, then record an `approval_invalidated` activity.
- A post can move to `approved` only when there is no open feedback on the current revision.
- A post can move to `scheduled` only if the scheduled revision matches the approved revision.
- A post can move to `published` only from `scheduled` or `approved`. Publishing writes `published_revision_number` and rejects stale or mismatched revisions.
- A published post cannot be edited in place. Corrections should create a follow-up draft or an internal note.
- Archiving is allowed from any state. For `published` posts, archive should hide the record from active queues without deleting the published history.
- Unarchiving moves an archived post back to `draft` so the team can decide the next action deliberately.
- Unscheduling moves a post from `scheduled` back to `approved` without changing the approved revision.
- Withdrawing review moves a post from `in_review` back to `draft` without losing feedback history.

## Authorization rules

Start with simple role checks, then refine for team policy.

- Authors can create, edit, submit, withdraw, archive, and resolve feedback on their own posts.
- Assigned reviewers can add feedback, request changes, and resolve feedback.
- Assigned approvers can approve the current revision.
- Assigned publishers can schedule, unschedule, mark published, and archive from active queues.
- Superusers can perform any workflow action for support and recovery.
- Single-user accounts may let the same user review and approve their own work, but the action records must still use the specific workflow action.

## User experience

The post detail screen should show the workflow in one place:

- Current status and revision number.
- Main editor for the latest revision.
- Review panel with open and resolved feedback.
- Activity timeline for edits, submissions, feedback, approvals, scheduling, and publishing.
- Primary action button based on status, such as "Submit for review", "Request changes", "Approve", "Schedule", or "Mark published".

The list view should support queue filters:

- My drafts.
- Needs review.
- Changes requested.
- Approved and ready to schedule.
- Scheduled.
- Published.

## Notifications

The first version can use in-app indicators. Email or Slack can come later.

Notification storage is out of scope for the first workflow implementation. The first version can derive queue counts from post status and assignment fields.

Trigger an in-app notification when:

- A post is submitted for review.
- Changes are requested.
- Feedback is resolved.
- A post is approved.
- An approved post is edited and loses approval.
- A post is scheduled or published.

## Edge cases

- Stale approval: if the approved revision is older than the latest revision, the UI must show "approval required" and block scheduling.
- Concurrent edits: API edit requests should include the last seen `revision_number` or `updated_at` value so one editor cannot overwrite another editor's changes silently.
- Empty draft: a post with empty content cannot be submitted for review.
- Missing approver: approval can be self-service for single-user accounts, but team accounts should support assigning an approver before review.
- Publishing failure: keep the post in `scheduled`, record the error, and require another publish attempt or a move back to `approved`.

## Minimal data model

The first code-backed version should add these core records:

```text
Post
- id
- owner_id
- status
- latest_revision_number
- approved_revision_number
- assigned_reviewer_id
- assigned_approver_id
- assigned_publisher_id
- scheduled_for
- scheduled_revision_number
- published_at
- published_revision_number
- created_at
- updated_at

PostRevision
- id
- post_id
- revision_number
- title
- body
- created_by_id
- created_at

PostFeedback
- id
- post_id
- post_revision_id
- revision_number
- created_by_id
- body
- status
- created_at
- resolved_by_id
- resolved_at

PostApproval
- id
- post_id
- post_revision_id
- revision_number
- approver_id
- decision_note
- approved_at

PostActivity
- id
- post_id
- post_revision_id
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
- `GET /posts/{post_id}/revisions` returns revision history for audit and comparison views.
- `PATCH /posts/{post_id}` edits the draft body or title and creates a new revision. The request should include the last seen `revision_number` or `updated_at` value.
- `PATCH /posts/{post_id}/assignments` updates `assigned_reviewer_id`, `assigned_approver_id`, and `assigned_publisher_id`.
- `POST /posts/{post_id}/submit-review` moves a draft or changes-requested post to review. The current revision must have non-empty content and no open feedback.
- `POST /posts/{post_id}/withdraw-review` moves a post from review back to draft.
- `POST /posts/{post_id}/feedback` adds feedback to the current revision.
- `POST /posts/{post_id}/feedback/{feedback_id}/resolve` resolves feedback.
- `POST /posts/{post_id}/request-changes` returns the post to the author. It requires at least one open feedback item on the current revision.
- `POST /posts/{post_id}/approve` approves the current revision.
- `POST /posts/{post_id}/schedule` schedules an approved revision. The request body should include `scheduled_for` and `revision_number`.
- `POST /posts/{post_id}/unschedule` moves a scheduled post back to approved.
- `POST /posts/{post_id}/publish` marks an approved or scheduled post as published. The request body should include `revision_number`, which must match `scheduled_revision_number` for scheduled posts or `approved_revision_number` for approved posts.
- `POST /posts/{post_id}/archive` archives inactive work.
- `POST /posts/{post_id}/unarchive` restores archived work to draft.

Use `PostActivity.action` values from a fixed enum so the timeline stays queryable:

- `created`
- `edited`
- `submitted_for_review`
- `review_withdrawn`
- `feedback_added`
- `feedback_resolved`
- `changes_requested`
- `approved`
- `approval_invalidated`
- `scheduled`
- `unscheduled`
- `published`
- `publish_failed`
- `archived`
- `unarchived`

## Acceptance criteria

- The workflow has a documented state machine for draft, review, changes, approval, scheduling, publishing, and archive.
- Approval is tied to a specific revision.
- Editing approved content invalidates approval and scheduling.
- Open feedback blocks final approval.
- Review, approval, scheduling, and publishing can be reconstructed from immutable revision and activity records.
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
