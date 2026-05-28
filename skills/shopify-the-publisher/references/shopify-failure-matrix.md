# Shopify publishing failure matrix

Use this matrix during execution and verification. When in doubt, stop before changing more resources.

| Failure type | Examples | Immediate action | Retry guidance |
| --- | --- | --- | --- |
| Wrong store | Shop domain mismatch, unexpected shop ID, unfamiliar product titles | Stop all work and verify authentication | Do not retry until store identity is confirmed |
| Wrong target | Online Store expected but another publication appears, target channel missing | Stop and confirm target publication | Retry only after target is corrected |
| Permission denied | Missing scopes, publication permission errors, protected resource action | Stop the batch and report missing access | Do not retry until permissions change |
| Invalid resource | Product, collection, page, or article ID not found | Mark row `not_found` and continue if isolated | Retry only after source of truth is corrected |
| Ambiguous match | Duplicate handles, SKU used as product lookup with multiple parent matches, handle changed, multiple matches | Mark row `ambiguous` and skip | Do not retry without a stable ID |
| State drift | Resource changed since dry run, status changed to draft or archived | Stop high-risk batches, refresh manifest | Retry only with a new dry run |
| Validation error | Draft resource cannot publish, required field missing, invalid publication input | Mark row `blocked` | Retry after data is fixed and approved |
| Missing hidden signal | Source data does not prove whether hidden products are accidental or intentional | Mark affected rows `blocked` | Retry only after the merchant provides a clear signal |
| Draft activation risk | Publish request would also require changing product status to active | Split status activation from publication approval | Retry only after both approvals are explicit |
| Rate limit | Throttle response, cost limit, retry-after header | Pause and back off | Retry with smaller batches and logged attempts |
| Transient API error | 429, 500, 502, 503, network timeout | Pause and retry the same row or batch once safe | Retry with exponential backoff and idempotent checks |
| Partial batch failure | Some rows changed and some failed | Stop if cause is unknown, then verify changed rows | Retry only failed rows after diagnosis |
| Verification mismatch | API accepted change but re-query shows old state | Stop and investigate target, propagation, or permission issue | Retry only after verifying actual state |
| Hidden item exposure risk | Dry run finds hidden-by-design resources in change set | Remove or require explicit row-level approval | Do not retry from broad approval |
| Live item removal risk | Unpublish dry run finds currently live resources that would become hidden | Require exact count approval for customer-facing removal | Do not retry from broad approval |

## Default stop thresholds

Stop execution when any of these happen:

- One wrong-store or wrong-target signal.
- One permission error affecting the requested operation.
- One systemic validation issue affecting many rows.
- More than 2 percent ambiguous rows in a bulk job.
- More than 5 percent verification mismatches after a batch.
- Any hidden, embargoed, draft, or archived resource would change without explicit approval.

## Default retry pattern

For transient API failures:

1. Re-query the resource to avoid duplicating a completed change.
2. Retry the failed row or batch after a short backoff.
3. Use a smaller batch on the next attempt.
4. Stop after two failed attempts for the same row or one repeated batch-level failure.

Do not retry business-rule failures. Fix the source data or approval first.

## Reporting failures

Every failure report should include:

- Resource ID and handle.
- Requested action.
- Error message or observed mismatch.
- Whether Shopify changed state.
- Whether the row is safe to retry.
- Next action needed from the operator.
