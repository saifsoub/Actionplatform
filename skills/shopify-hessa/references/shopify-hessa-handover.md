# Shopify Hessa handover reference

Use this file when a Shopify request needs more than a short answer. It defines Hessa's operating standard for merchant-facing catalog, promotion, merchandising, and reporting work.

## Baseline pressure tests

The skill was written against three baseline scenarios:

1. Bulk improve 80 product pages from handles only before a weekend campaign.
2. Launch a 25 percent collection discount without margin data and under pressure to move fast.
3. Produce a weekly performance report from traffic and sales exports without channel definitions, margin data, or a campaign calendar.

Baseline agents were generally careful, but they drifted by scenario. They lacked one shared operating loop, one handoff-note standard, and reusable templates. Hessa's fixed rules close those gaps.

## Merchant operating loop

1. Translate the request into the business outcome. Name the KPI before discussing tasks.
2. Separate blocking data from useful context. Ask for the few inputs that prevent unsafe work.
3. Snapshot current state before live edits. For Shopify, this can be an export, mutation log, screenshot, discount settings capture, or report copy.
4. Work in batches. Preview or run a small sample before bulk edits.
5. QA both success and failure paths. Discounts need eligible and ineligible cart tests.
6. Report what changed, what was assumed, what was tested, and how to roll back.

## Baseline data requirements

### Catalog and PDP work

Blocking:

- Product handles or product IDs.
- Current product data export or permission to fetch it.
- Goal of the work, such as conversion, SEO, campaign alignment, upsell, or clearance.
- Product facts that must remain true, including sizing, materials, ingredients, compatibility, warranty, care, legal claims, and delivery promises.
- Approval rule: review sheet, sample batch approval, or approved live execution.

Useful but not always blocking:

- Brand voice examples.
- Priority products.
- Target audience.
- Campaign dates and offer.
- Current top landing pages or conversion data.

Never invent specs, awards, reviews, certifications, scarcity, health claims, or shipping promises.

### Promotion work

Blocking:

- Exact scope: collection URL or ID, product list, variant list, customer segment, or whole store.
- Discount type: automatic discount, discount code, compare-at price change, Shopify sale, bundle, free shipping, or gift-with-purchase.
- Start and end time with timezone.
- Stacking rules.
- Exclusions.

Useful but not always blocking:

- Margin or COGS.
- Inventory status.
- Existing promo calendar.
- Ad/email/SMS send schedule.
- Redemption target.

Default to non-combinable discounts with an end date unless the merchant approves otherwise. If margin data is missing, say the offer can be launched operationally but financial risk is unverified.

### Analytics and reporting

Blocking:

- Date range and timezone.
- Sales definition: gross sales, net sales, total sales, or another export-specific field.
- Traffic source and export definitions.
- Comparison period.

Useful but not always blocking:

- Channel mapping rules.
- Campaign calendar.
- Product margin, COGS, shipping costs, payment fees, and ad spend.
- Inventory and stockout dates.
- Known tracking changes, outages, launches, or influencer posts.

Do not infer profitability from revenue. Do not claim causality from a weekly report unless the data supports it.

## PDP improvement checklist

For every product page batch:

- Confirm each handle resolves to one product.
- Preserve verified product facts and required compliance language.
- Keep product titles stable unless title edits are in scope.
- Keep handles stable unless redirects are approved.
- Improve above-the-fold clarity: what it is, who it is for, why it matters.
- Keep SEO title and meta description within practical Shopify search snippet lengths.
- Add or improve image alt text using visible facts, not keyword stuffing.
- Check mobile rendering and product form behavior.
- Spot-check collection cards and search results if titles, images, or tags changed.
- Keep a rollback file.

## Merchandising checklist

Use this order when merchandising a Shopify catalog:

1. Confirm objective: conversion, AOV, sell-through, seasonal relevance, inventory cleanup, or launch visibility.
2. Confirm product set and exclusions.
3. Check inventory and margin before pushing low-margin or low-stock products.
4. Rank actions by reversibility:
   - Tags and collection membership are usually easy to reverse.
   - Sort order and featured products are visible but recoverable.
   - Title, handle, template, price, and inventory changes need more caution.
5. QA collection pages on desktop and mobile.
6. Record what changed and why.

## Promotion guardrails

Before enabling a promo:

- Confirm affected products or variants count.
- Check existing active discounts and stacking behavior.
- Exclude gift cards unless explicitly included.
- Check subscription, bundle, preorder, and low-stock behavior.
- Check already-discounted products if compare-at pricing is in use.
- Test one eligible cart.
- Test one ineligible cart if exclusions exist.
- Capture disable/delete rollback steps.

If the merchant asks to move fast, ask for only these minimum confirmations:

1. Scope.
2. Discount type.
3. Start and end time.
4. Stacking behavior.
5. Exclusions.

## Experimentation framework

Use experiments when the merchant wants improvement but the right change is uncertain.

Good Shopify experiment candidates:

- PDP hero copy.
- Offer positioning.
- Collection sort order.
- Featured products.
- Bundles or cross-sells.
- Email or SMS landing page alignment.

Minimum experiment note:

```markdown
Hypothesis:
Primary KPI:
Segment:
Change:
Control or baseline:
Run dates:
Stop rule:
Risks:
```

Avoid experiments that mix too many changes at once. If the merchant needs action now, make the safest change and label it as an operational adjustment, not a clean test.

## Weekly reporting format

Use this structure for recurring reports:

```markdown
# Weekly Shopify report

Period:
Comparison:
Sales definition:
Traffic source:

## Summary
- [one measured result]
- [one likely driver]
- [one action to take]

## KPI table
| Metric | Current | Comparison | Change | Note |
| --- | ---: | ---: | ---: | --- |

## Drivers
- Traffic:
- Conversion:
- AOV:
- Product mix:
- Discounts:
- Refunds or cancellations:

## Caveats
- [tracking, channel mapping, attribution, margin, inventory, or date issue]

## Next actions
1. [owner/action/output]
2. [owner/action/output]
3. [owner/action/output]
```

## Handoff-note standard

Every substantial Hessa task ends with:

- Goal and scope.
- Changes made or proposed.
- Blocking gaps and assumptions.
- QA performed with samples.
- Risks left open.
- Rollback path.
- Next action.

If nothing changed because data was missing, the handoff note should still say exactly what is needed to proceed.
