---
name: shopify-the-publisher
description: Use when publishing, unpublishing, scheduling, or verifying Shopify product, collection, page, blog, theme, or sales channel visibility changes, especially bulk Online Store launches, rollback planning, or "make this live/hidden" requests.
---

# Shopify the publisher

## Overview

Publishing is a production change. Treat every request to make Shopify content live or hidden as customer-facing until proven otherwise.

Default to a dry run, explicit target channel, reversible logs, and verification from Shopify after execution. Never turn vague launch pressure into a blind publish.

## When to use

Use this skill for:

- Product, collection, page, blog, article, or theme publish and unpublish work.
- Online Store visibility changes, sales channel publication changes, and launch cutovers.
- Bulk work from CSVs, spreadsheets, product handles, IDs, SKUs, tags, collections, or saved searches.
- Requests like "publish everything", "hide these products", "make launch live", "roll back visibility", or "check what is published".

Do not use this as the source for Shopify API syntax. For Admin GraphQL design, use `shopify-admin`. For store-authenticated CLI execution, validation, or handle/SKU lookups, use `shopify-use-shopify-cli`.

## Required inputs

Do not execute until these are known:

| Input | Required detail |
| --- | --- |
| Store | Shop domain or authenticated store context |
| Resource | Product, collection, page, blog, article, theme, or other publishable type |
| Direction | Publish, unpublish, schedule, verify, or rollback |
| Target | Exact sales channel, publication, theme role, or Online Store target |
| Source of truth | IDs, handles, CSV, query, collection, tag, or issue list |
| Exclusions | Hidden by design, embargoed, draft, archived, out-of-stock, or incomplete items |
| Approval | Written approval tied to the dry-run manifest, not a vague "yes" |

If any input is missing, produce a dry-run plan and ask for the missing decision before changing Shopify.

## Operating flow

1. Scope the change.
   - Confirm store, resource type, target channel, direction, and source of truth.
   - State what will not be touched.
   - Prefer stable Shopify IDs. Use handles when IDs are unavailable. Treat SKUs as variant identifiers unless the task proves otherwise.

2. Snapshot current state.
   - Export or query current publish state for every candidate.
   - Record resource ID, handle, title, status, target channel, current publication state, and timestamp.
   - Keep enough before-state to undo the change.

3. Build a dry-run manifest.
   - Normalize inputs to one row per publishable resource.
   - Group product variants under their parent product. Variants are not published independently.
   - Categorize each resource as `would_change`, `already_correct`, `excluded`, `ambiguous`, `not_found`, or `blocked`.
   - Count resources that are currently hidden and would become visible.

4. Gate on approval.
   - Show totals and risky rows before execution.
   - Require approval that references the manifest or exact counts.
   - Stop if hidden, embargoed, draft, archived, or ambiguous resources would change without explicit approval.

5. Execute in batches.
   - Use the current Shopify Admin API or Shopify CLI guidance for the exact mutation or command.
   - Limit batch size, respect rate limits, and log every attempted resource.
   - Stop on systemic failures, permission errors, wrong-store signals, or unexpected target channels.

6. Verify from Shopify.
   - Re-query the target state after execution.
   - Compare requested, changed, already correct, skipped, failed, and unknown counts.
   - Spot-check representative high-risk resources, including products with variants.

7. Report and hand off.
   - Provide the manifest path or summary, counts, failures, skipped rows, and rollback notes.
   - Do not call the work complete until verification matches the requested state or the remaining gaps are listed.

## Safety rules

- Never publish all candidates from a vague instruction if any item may be intentionally hidden.
- Never assume Online Store means every sales channel.
- Never change draft or archived resources unless the request explicitly includes them.
- Never rely only on the admin UI after a bulk change. Verify through Shopify data.
- Never store access tokens, API keys, or session cookies in issues, docs, commits, or chat.
- If the authenticated store cannot be verified, stop before execution.

## Quick reference

| Situation | Default action |
| --- | --- |
| Bulk publish request | Build dry-run manifest first |
| Hidden products included | Require explicit approval for those exact products |
| CSV has variant rows | Collapse to parent products before publishing |
| Handles or SKUs are duplicated | Mark ambiguous and skip |
| API returns permission or publication errors | Stop the batch and diagnose |
| Verification count differs | Report mismatch and do not claim completion |

## Common mistakes

- Treating "publish everything" as approval to expose intentionally hidden products.
- Counting CSV rows instead of unique publishable resources.
- Matching by SKU when the operation happens at product level.
- Publishing to all channels when the user asked for Online Store.
- Skipping before-state capture, which makes rollback slow and error-prone.
- Reporting only successful API responses without re-querying Shopify.

## References

- `references/shopify-publishing-checklist.md`
- `references/shopify-failure-matrix.md`
