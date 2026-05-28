# Shopify Nova playbooks

Use these playbooks when a merchant needs a concrete operating template. Adapt the numbers to the store's actual traffic, margin, inventory, and staffing.

## 14-day conversion sprint

### Goal

Find and fix the highest-confidence conversion constraint without turning the whole store upside down.

### Inputs

- Conversion rate, sessions, revenue, AOV, add-to-cart rate, checkout start rate, checkout completion rate
- Device split, channel split, top landing pages, top product detail pages
- Recent theme, app, price, product, shipping, or campaign changes
- Best sellers, gross margin, inventory availability, return reasons, support tickets

### Plan

| Day | Work | Output |
| --- | --- | --- |
| 1 | Baseline metrics by device, channel, top products, and top landing pages | Constraint hypothesis |
| 2 | Mobile product page and cart audit | Broken or confusing moments list |
| 3 | Checkout and shipping promise review | Friction list with owner |
| 4 | Search, navigation, and collection audit | Findability fixes |
| 5 | Trust and offer clarity audit | Copy, policy, review, and guarantee fixes |
| 6 | Prioritize fixes by impact, confidence, speed, risk | Sprint backlog |
| 7 to 10 | Ship the top two to four reversible changes | Change log with timestamps |
| 11 to 13 | Monitor primary and guardrail metrics | Early read |
| 14 | Decide keep, roll back, or iterate | Next sprint brief |

### Recommended first fixes

- Make primary add-to-cart action visible on mobile product pages.
- Put shipping cost, delivery cutoff, returns, and fit guidance near the purchase decision.
- Promote high-margin in-stock winners on homepage and top collections.
- Reduce navigation choices that bury best sellers.
- Add cart upsells only when they match the product and do not slow checkout.

### Metrics

- Primary: conversion rate or revenue per session
- Secondary: add-to-cart rate, checkout start rate, checkout completion rate, AOV
- Guardrails: refund rate, support tickets, page speed, margin, stockout rate

## Promotion launch checklist

### Choose the offer

- Objective: acquire customers, clear inventory, lift AOV, reactivate buyers, or defend a seasonal moment
- Offer type: bundle, gift guide, free shipping threshold, gift with purchase, loyalty perk, limited discount, early access
- Economics: expected revenue, gross margin, inventory depth, fulfillment capacity, return risk
- Eligibility: customer segment, region, channel, product set, exclusions, start and end dates

### Build the store moment

- Homepage hero or announcement bar with the offer and deadline
- Collection page for eligible products
- Product badges for eligible items
- Cart message that explains threshold, bundle, or gift qualification
- Shipping cutoff and delivery promise near the decision point
- Discount code or automatic discount tested before launch

### Launch channels

- Email to eligible customers
- SMS only for opted-in recipients
- Paid media or retargeting with matching terms and dates
- Organic social and creator copy with the same offer rules
- Customer support macro for promo questions

### QA before launch

- Offer applies only to intended products and customers.
- Stacking rules are clear.
- Inventory is enough for featured products.
- Shipping promise is realistic.
- Tracking links and discount attribution work.
- The store has a rollback path if margin, fulfillment, or customer experience breaks.

### After launch

- Check revenue, conversion, AOV, margin, inventory, refund requests, and support tickets.
- Cut spend or narrow eligibility if margin or fulfillment fails.
- Re-merchandise toward in-stock winners every day during the promo.

## Lifecycle automation starter set

Start with a small set of flows. Each flow needs a reason to exist, an exit rule, and one metric.

### Before enabling flows

- Confirm email or SMS consent for the channel being used.
- Respect unsubscribe, suppression, bounced, complained, and do-not-contact lists.
- Add frequency caps so a customer does not receive overlapping reminders.
- Add exit rules for purchase, cart completion, restock purchase, refund, cancellation, or product unavailability.
- Keep SMS copy shorter and stricter than email. Do not send SMS unless the customer opted in for that channel.

| Flow | Trigger | Message job | Good first metric | Guardrail |
| --- | --- | --- | --- | --- |
| Welcome | New subscriber or first account creation | Explain the brand, best sellers, and buying help | First purchase rate | Unsubscribe rate |
| Browse abandonment | Viewed product or collection with no cart | Bring the shopper back to the exact intent | Click-to-session rate | Complaint rate |
| Cart abandonment | Cart created with no checkout | Remove the blocker and restate value | Recovered revenue | Discount dependency |
| Post-purchase | Order fulfilled or delivered | Reduce remorse and teach product use | Review rate or support deflection | Support ticket volume |
| Replenishment | Expected depletion window | Prompt repeat purchase before the customer runs out | Repeat purchase rate | Spam complaints |
| Winback | No purchase after normal interval | Offer a relevant reason to return | Reactivation rate | Margin and unsubscribe rate |
| Back in stock | Variant restocked after signup | Convert captured demand quickly | Signup-to-purchase rate | Inventory oversell |

## Weekly operating review

Use this cadence for a merchant who needs accountability rather than a one-off tactic list.

### Scorecard

- Revenue, orders, sessions, conversion rate, AOV, gross margin
- Add-to-cart, checkout start, checkout completion
- New customers, returning customers, repeat purchase rate
- Top products by revenue, margin, inventory risk
- Campaign contribution and discount cost
- Refunds, returns, support tickets, fulfillment delays

### Review questions

1. What changed this week in traffic, conversion, AOV, inventory, or retention?
2. Which segment, product, channel, or device explains most of the movement?
3. What did we ship, and can we see the effect?
4. What is the biggest constraint next week?
5. Which one to three actions will we take, and what would make us roll them back?

### Output template

```markdown
## This week
- Biggest movement:
- Likely cause:
- Evidence:

## Next constraint
- Constraint:
- Why it matters:

## Actions
1. [Action] - owner: [role], metric: [metric], rollback: [trigger]
2. [Action] - owner: [role], metric: [metric], rollback: [trigger]
3. [Action] - owner: [role], metric: [metric], rollback: [trigger]

## Decision date
- Review on:
- Keep if:
- Roll back if:
```
