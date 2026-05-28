# SEI-26 First Deliverable

## Issue

- Linear: SEI-26, "[Starter] Execute First Deliverable - ChatGPT Agent"
- Project: ChatGPT Agent Queue
- Goal: ship one concrete deliverable from intake to done.

## Concrete deliverable

This file is the first deliverable artifact for SEI-26. It turns the intake checklist into a handoff record that can be reviewed, linked from the pull request, and copied into Linear after QA passes.

## Acceptance criteria

| Criterion | Status | Evidence |
| --- | --- | --- |
| Confirm acceptance criteria | Complete | Acceptance criteria are enumerated in this table. |
| Implement or prepare output | Complete | Prepared this durable deliverable artifact at `docs/SEI-26-FIRST-DELIVERABLE.md`. |
| Add proof/links in comments | Prepared | See the "Linear comment template" section for the exact proof comment to post once Linear access is available. |
| Move to done only after QA pass | Prepared | See the "Done gate" section. The issue should stay open until verification commands pass and the proof comment is posted. |

## QA plan

Because this change is documentation-only, QA focuses on repository verification rather than runtime behavior:

1. Confirm the artifact exists at `docs/SEI-26-FIRST-DELIVERABLE.md`.
2. Run the repository test command:

   ```bash
   npm run test
   ```

3. If the test command cannot run because the environment lacks required dependencies or registry access, record the exact failure in Linear and do not move the issue to Done.

## Current QA result

Executed on 2026-05-28 in the Cursor cloud workspace:

| Command | Result |
| --- | --- |
| `git diff --check` | Passed with exit code 0 before commit. |
| `npm run test` | Failed before test execution: `sh: 1: bun: not found`. |
| `node --version && npm --version && docker --version` | Node and npm are available (`v22.22.3`, `10.9.7`), but Docker is unavailable: `docker: command not found`. |

The repository's `frontend/README.md` says Playwright tests need `docker compose up -d --wait backend` before `bunx playwright test`. This environment is missing both `bun` and Docker, so QA cannot pass here without environment setup.

## Done gate

Move SEI-26 to Done only when all of the following are true:

- The deliverable artifact is committed and linked from a pull request.
- The verification command has passed in an environment with the required test tooling.
- A Linear comment contains the proof links and QA result.

## Linear comment template

```markdown
### SEI-26 deliverable proof

- Deliverable artifact: `docs/SEI-26-FIRST-DELIVERABLE.md`
- Pull request: <PR link>
- QA: `npm run test` -> failed before test execution: `sh: 1: bun: not found`
- Environment blocker: Docker is also unavailable (`docker: command not found`), but the frontend README requires Docker Compose backend before Playwright tests.

Done gate: do not move SEI-26 to Done until QA passes in an environment with the required test tooling.
```
