---
name: shopify-atlas
description: Use when handing off Shopify Atlas work, continuing from a Claude handover, preparing Linear-ready status, or transferring ownership of Shopify operating work.
---

# Shopify Atlas

## Overview

Shopify Atlas turns messy Shopify work into a handover another agent can continue without guessing. It is a handoff and coordination skill, not a substitute for Shopify API, theme, checkout, or implementation skills.

Core principle: direct evidence first, clear next action last.

## When to use

Use this skill when:

- A Shopify task needs a Claude-style handover.
- Work is moving between agents, branches, or Linear issues.
- A previous agent summary exists but the source files, PR, or issue state still need checking.
- The task is partly done and the next owner needs status, risks, and exact continuation steps.

Do not use this skill to invent implementation details. If the work requires a specific Shopify surface, route after the handover context is clear:

| Work found | Use or recommend |
| --- | --- |
| Admin GraphQL operation | `shopify-admin` |
| Shopify CLI execution or config validation | `shopify-use-shopify-cli` |
| Metafields or metaobjects | `shopify-custom-data` |
| Theme or Liquid work | `shopify-liquid` |
| Hydrogen storefront work | `shopify-hydrogen` |
| Storefront GraphQL | `shopify-storefront-graphql` |
| Checkout, customer account, admin, or POS UI extensions | Matching Shopify Polaris or POS skill |

## Operating rules

1. Inspect the current Linear issue, comments, related issues, branch, PR, files, and verification notes before writing the handover.
2. Prefer source evidence over summaries. If the Claude handover reference is unavailable, say that and reconstruct only from evidence you can inspect.
3. Separate facts, assumptions, recommendations, and risks.
4. Name the capability or Shopify skill that should own the next step when implementation is still required.
5. Do not claim work is complete without fresh verification evidence or a clear note that verification is missing.
6. Keep Linear decision-grade: concise, specific, and easy to continue.

## Workflow

1. Confirm the controlling issue, user request, and current owner.
2. Read the Claude handover reference or prior handoff. If it is unavailable, record the access gap.
3. Inspect related Linear issues, comments, branches, PRs, commits, and changed files.
4. Identify what actually changed and what remains unverified.
5. Decide whether this is handoff-only or needs another Shopify skill, tool, or implementation pass.
6. Run or cite the strongest available verification. If none is available, state the exact command or check still needed.
7. Write the 11-section handover below.
8. Self-check that another agent can continue without asking for basic context.

## Required 11-section handover

Use these headings in this order.

```md
## 1. Current status

## 2. Source evidence inspected

## 3. What changed

## 4. Decisions already made

## 5. Verification

## 6. Remaining work

## 7. Blockers and risks

## 8. Relevant issues

## 9. Relevant files and artifacts

## 10. Open questions

## 11. Recommended next action
```

### Section requirements

| Section | Must include |
| --- | --- |
| Current status | One sentence with issue state, owner, and whether work is done, blocked, or in progress. |
| Source evidence inspected | Linear issues, comments, PRs, commits, files, logs, test output, and any source that could not be accessed. |
| What changed | Concrete changes only. Use file paths, issue IDs, branch names, and commands when known. |
| Decisions already made | Accepted constraints, routing choices, scope cuts, or reasons for not using a tool. |
| Verification | Commands run, outputs observed, CI checked, manual checks, or explicit missing verification. |
| Remaining work | Ordered tasks the next owner can execute. |
| Blockers and risks | Missing access, unclear ownership, unverified claims, customer-impacting choices, or destructive actions. |
| Relevant issues | Controlling issue first, then related issues and why they matter. |
| Relevant files and artifacts | Paths, PR links, commits, screenshots, docs, exports, or generated files. |
| Open questions | Only questions that change execution or risk. Do not pad. |
| Recommended next action | A specific first action, with the owner or capability that should take it. |

## Example

```md
## 1. Current status

SEI-46 is in progress on `cursor/shopify-atlas-skill-2435`; the skill file exists, but verification has not run yet.

## 2. Source evidence inspected

- Linear SEI-46 description and comments.
- Related SEI-39, SEI-69, SEI-71, SEI-72, and SEI-74 operating standards.
- Repository search for existing `skills/` content.
- Claude handover link could not be inspected because browser authentication was unavailable.

## 3. What changed

- Added `skills/shopify-atlas/SKILL.md`.
- Added `skills/shopify-atlas/references/handover-template.md`.

## 4. Decisions already made

- Treat `shopify-atlas` as a handoff skill, not a Shopify implementation skill.
- Route implementation details to the more specific Shopify skill after context is gathered.

## 5. Verification

- Pending: run Markdown and repository checks.

## 6. Remaining work

1. Run repository checks.
2. Commit and push the branch.
3. Create or update the PR.

## 7. Blockers and risks

- The original Claude handover reference was not directly accessible, so this handover records reconstruction from Linear and repo evidence.

## 8. Relevant issues

- SEI-46 controls this task.
- SEI-69, SEI-71, SEI-72, and SEI-74 define capability, update, handoff, and role rules.

## 9. Relevant files and artifacts

- `skills/shopify-atlas/SKILL.md`
- `skills/shopify-atlas/references/handover-template.md`

## 10. Open questions

- None that block verification.

## 11. Recommended next action

Run the repo checks and update the PR with the verified result.
```

## Quality checks

Before sending the handover, verify:

- The controlling issue is named.
- The source evidence list includes both inspected and unavailable sources.
- Facts and assumptions are not mixed.
- Verification is explicit, even when incomplete.
- Risks are stated plainly.
- The next action starts with a verb and names the right owner, tool, or skill.
- The handover is concise enough to paste into Linear without editing.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Treating a previous summary as proof | Inspect the issue, branch, PR, files, or logs directly. |
| Saying "done" when tests or checks were not run | Say what is verified and what remains unverified. |
| Writing a narrative timeline | Use the 11 sections and keep only decision-useful detail. |
| Solving Shopify implementation inside the handover | Route to the specific Shopify skill after context is captured. |
| Hiding missing access | Name the unavailable source and give the fallback path. |
