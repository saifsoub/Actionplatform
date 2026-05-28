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

## Done gate

Move SEI-26 to Done only when all of the following are true:

- The deliverable artifact is committed and linked from a pull request.
- The verification command has passed, or a reviewer explicitly accepts a documented environment blocker.
- A Linear comment contains the proof links and QA result.

## Linear comment template

```markdown
### SEI-26 deliverable proof

- Deliverable artifact: `docs/SEI-26-FIRST-DELIVERABLE.md`
- Pull request: <PR link>
- QA: `npm run test` -> <pass/fail and exact result>

Done gate: move SEI-26 to Done only after QA is accepted.
```
