# Mansour Shopify handover checklist

Use this file when a Mansour Shopify session needs a same-day or next-shift transfer. Keep the note factual. Do not include secrets, private customer details beyond required order identifiers, or unsupported guesses.

## Minimum transfer fields

- Date and time.
- Operator or agent. Use "current agent" if no person is named.
- Store, market, and Shopify area reviewed.
- Source of truth checked, including timestamp or freshness if available.
- Objects touched: product handles, variant IDs, SKUs, collection IDs, discount IDs, order IDs.
- Completed changes with before and after values.
- Proposed changes that still need approval.
- Blockers and the exact missing input.
- Customer, revenue, inventory, SEO, feed, or campaign risks.
- Rollback notes or export location.
- Next Claude action list.

Use the requester's stated timezone for deadlines. If none is stated, use UTC and say so.

## Operational rows

Use these row formats inside the handover when relevant:

- Catalog: `product/variant | field | current value | target value | evidence | risk | status`
- Inventory: `SKU | location | Shopify qty | source qty | delta | reason | action status`
- Campaign: `discount/campaign | dates | target | mechanics | conflicts checked | rollback | status`
- Order triage: `order ID | severity | exception type | current blocker | evidence checked | owner/escalation | next action`

Order severity order:

1. Customer-facing SLA breach or shipment failure.
2. Payment, fraud, refund, or cancellation risk.
3. Inventory or fulfillment blocker.
4. Address or customer-contact blocker.
5. Internal cleanup with no customer impact.

## Quick template

```markdown
## Mansour Shopify handover

### Session context
- Date/time:
- Operator:
- Store/market:
- Source of truth:
- Scope:

### Completed
| Object | Change | Evidence | Rollback |
| --- | --- | --- | --- |
|  |  |  |  |

### Needs approval
| Object | Proposed action | Reason | Risk | Approver |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

### Blocked
| Item | Blocker | Missing source | Owner | Next check |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

### Risks
- Customer:
- Revenue:
- Inventory:
- SEO/feed:
- Campaign:

### Next Claude should
1.
2.
3.
```

## Final check

Before handing over, verify:

- Every completed mutation has an object ID and rollback note.
- Every proposed mutation is separate from completed work.
- Every blocked item names the missing source or owner.
- Any conflicting sources are called out instead of silently resolved.
- The next action list is concrete enough for a new operator to continue without reading the whole chat.
