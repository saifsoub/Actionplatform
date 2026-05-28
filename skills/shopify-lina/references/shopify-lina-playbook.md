# shopify-lina playbook

Use this reference when the main skill says the task is operational Shopify work for Lina.

## Universal preflight

Before acting, collect:

- store domain
- merchant goal
- object identifiers such as handle, SKU, variant ID, order name, discount code, or customer email
- sales channel, market, inventory location, date range, and timezone when relevant
- whether the user wants a read-only check, a prepared command, or execution
- whether the action is reversible

Read first. If there are multiple matches, stop and ask the user to choose. If there is no match, report the lookup used and the missing identifier.

## Product launch or catalog update

Required inputs:

- product title and handle
- vendor and product type
- status, publication target, and market if applicable
- variant options, SKUs, prices, compare-at prices, barcodes, and weights
- inventory policy and tracked inventory expectation
- media assets and alt text
- SEO title and description

Checklist:

1. Look up any existing product by handle and title.
2. Check for duplicate SKUs across variants before creating or updating variants.
3. Confirm product status and sales channel publication separately.
4. Set variant price and inventory policy before publication.
5. Add media with alt text.
6. Set SEO fields when provided. If missing, leave them unchanged or ask for copy.
7. Read back product ID, handle, status, variant SKUs, publication state, and key fields.

Receipt:

```markdown
Product:
Product ID:
Handle:
Status and channels:
Variants:
Inventory policy:
Media:
SEO:
Verification read:
```

Pause for confirmation before publishing across channels, changing prices for live products, deleting variants, or bulk editing more than one product family.

## Inventory and SKU updates

Required inputs:

- SKU or variant ID
- inventory location
- absolute quantity or delta
- reason for the change

Checklist:

1. Resolve SKU to variant ID and inventory item ID.
2. Resolve the location by name or ID.
3. Read the current quantity for that inventory item at that location.
4. If the user gave a delta, calculate the target quantity and show the math.
5. Confirm before negative stock, large swings, or bulk location changes.
6. Apply the inventory update.
7. Read back the same SKU, inventory item, location, and final quantity.

Receipt:

```markdown
SKU:
Variant ID:
Inventory item ID:
Location:
Before:
Change:
After:
Reason:
Verification read:
```

Do not update variant metadata when the task is inventory. Inventory lives on inventory items at locations.

## Discounts and promotions

Required inputs:

- discount type, code or automatic
- amount or percentage
- eligible products, collections, customers, markets, or order conditions
- start and end time with timezone
- usage limit, one-use-per-customer rule, and combination behavior

Decision guide:

| Request | Prefer |
| --- | --- |
| Customer enters a code | Discount code |
| Promotion should apply without a code | Automatic discount |
| Specific products or collections only | Product or collection eligibility |
| Spend threshold | Minimum subtotal or quantity requirement |
| One campaign code across channels | Discount code with explicit dates and usage rules |

Checklist:

1. Search for existing discounts with the same title or code.
2. Confirm whether the campaign may combine with product, order, or shipping discounts.
3. Use bounded start and end times. Do not create open-ended promotions unless the user says so.
4. Scope eligibility narrowly.
5. Create or update the discount.
6. Read back active dates, status, code, value, combinations, and usage limits.
7. If possible, describe the cart condition that should trigger the promotion.

Receipt:

```markdown
Discount:
Type:
Code:
Value:
Eligibility:
Dates:
Combinations:
Usage limits:
Verification read:
Test condition:
```

Pause before activating a discount on live traffic if scope, dates, or stacking behavior is unclear.

## Order and customer triage

Required inputs:

- order name or ID
- customer-safe problem statement
- requested action, such as inspect, prepare response, refund, cancel, resend invoice, or update note

Checklist:

1. Read the order by order name or ID.
2. Summarize only needed customer data. Redact email, phone, and address unless required.
3. Check financial status, fulfillment status, risk, tags, notes, refunds, returns, and timeline signals.
4. Separate facts from recommended action.
5. For refunds, cancellations, fulfillments, fraud overrides, or customer messages, prepare the action and ask for confirmation before execution.
6. Verify after any approved write.

Receipt:

```markdown
Order:
Issue:
Current status:
Relevant facts:
Recommended action:
Action taken:
Verification read:
Escalation:
```

Do not reveal full customer PII in summaries. Do not make irreversible order changes from a vague customer request.

## Performance reporting

Required inputs:

- date range and timezone
- metric list
- comparison period
- filters, such as channel, market, product, collection, discount, or customer segment

Common metrics:

- gross sales
- discounts
- returns and refunds
- net sales
- orders
- average order value
- units sold
- conversion rate when analytics data is available
- top products, variants, discounts, and channels

Checklist:

1. Confirm the reporting source. Shopify orders data does not always answer traffic or conversion questions.
2. Use one timezone for all dates.
3. Define each metric in the receipt.
4. Keep filters explicit.
5. Compare to the previous period only when the user asked for trend or performance change.
6. Separate data from interpretation.

Receipt:

```markdown
Date range:
Timezone:
Source:
Filters:
Metrics:
Comparison:
Findings:
Limits:
Recommended next action:
```

Never invent missing analytics. If Shopify data cannot answer a question, say which source is needed.

## Post-change receipt standard

Every write ends with a receipt:

- object type and object ID
- before and after values
- command, mutation, or operation summary
- verification read and timestamp
- unchanged assumptions
- rollback path, if one exists
- remaining risks or follow-up

If verification fails, say so plainly and stop. Do not claim the store changed until the read-back confirms it.

