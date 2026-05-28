# Shopify publishing checklist

Use this checklist before changing Shopify publication state. Keep the completed checklist with the execution notes when the work has launch or rollback risk.

## Preflight

- Confirm the authenticated store and target environment.
- Confirm the resource type and direction.
- Confirm the target sales channel, publication, theme role, or Online Store target.
- Confirm the source of truth and save it unchanged.
- Confirm whether draft, archived, hidden, embargoed, out-of-stock, or incomplete resources are in scope.
- Fetch current Shopify state for every candidate.
- Record a before-state snapshot with resource ID, handle, title, status, target state, and timestamp.
- Normalize the source list to one publishable resource per row.
- Collapse product variant rows to parent products.
- Flag missing IDs, duplicate handles, duplicate SKUs, changed handles, and resources not found in Shopify.
- Flag resources that are currently hidden and would become visible.
- Flag resources already in the requested state.

## Dry-run manifest

Create a manifest with these columns:

| Column | Purpose |
| --- | --- |
| resource_type | Product, collection, page, blog, article, theme, or other publishable type |
| resource_id | Stable Shopify ID when available |
| handle | Human-readable identifier |
| title | Resource title |
| current_status | Active, draft, archived, or equivalent |
| current_target_state | Current publish state for the target |
| requested_target_state | Desired publish state |
| action | Publish, unpublish, skip, verify, or rollback |
| reason | Why this action is safe or why it is skipped |
| risk | Low, medium, or high |

Use these categories:

- `would_change`
- `already_correct`
- `excluded`
- `ambiguous`
- `not_found`
- `blocked`

## Approval gate

Before execution, report:

- Total candidates.
- Count by category.
- Count currently hidden that would become visible.
- Count draft or archived resources in scope.
- Count ambiguous or not found resources.
- Exact target channel or publication.
- Planned batch size and stop conditions.

Approval must reference the manifest, exact rows, or exact counts. If the approval is vague, continue planning but do not execute.

## Execution

- Re-check the store identity immediately before changing data.
- Execute only rows approved for change.
- Use current Shopify Admin API or Shopify CLI guidance for the exact operation.
- Keep batch sizes small enough to isolate failures.
- Respect Shopify rate limits.
- Log resource ID, handle, prior state, requested state, result, error, and timestamp for every row.
- Pause after the first batch and verify before continuing when the change is high risk.
- Stop if failures suggest wrong store, wrong channel, missing permission, invalid mutation, or source data drift.

## Verification

- Re-query Shopify after execution.
- Compare verified state with the dry-run manifest.
- Reconcile requested, changed, already correct, skipped, failed, and unknown counts.
- Spot-check a few representative resources in the target channel.
- For product launches, include products with variants, products that were previously hidden, and products with known exclusions.
- Save or report the final manifest.

## Rollback notes

Rollback uses the before-state snapshot. Do not invent rollback state from memory.

For each reverted resource, log the same fields as execution. Verify rollback from Shopify after the revert and report any resources that could not be restored.
