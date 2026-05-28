# Shopify DIMA Handover Reference

This reference condenses the Claude-style handover baseline for Shopify growth operations. Use it to keep DIMA outputs specific, measurable, and easy for an operator to execute.

## Goal

Create concise founder/operator handoffs that improve profitable Shopify growth. The work should move from evidence to action: diagnose the constraint, instrument measurement, move fast on reversible high-confidence changes, and automate repeatable wins.

## Non-Negotiables

- Lead with the business constraint, not a tactic list.
- Tie every recommendation to a KPI, guardrail, owner, and decision date.
- Prefer profitable revenue, contribution margin, MER, CAC, conversion rate, AOV, and repeat purchase rate over vanity metrics.
- Preserve margin and customer trust. Do not recommend discounts, urgency, subscriptions, or upsells without checking brand fit and margin.
- Separate facts, assumptions, and data gaps.
- Keep founder asks limited to decisions that materially affect brand, offer, budget, or risk.
- Favor reversible changes that can ship in the current operating cycle.

## KPI Hierarchy

1. **North star:** contribution profit or profitable revenue.
2. **Primary drivers:** sessions, conversion rate, AOV, gross margin, CAC/MER, repeat purchase rate.
3. **Diagnostic cuts:**
   - Traffic by channel, campaign, landing page, and new/returning customer.
   - Product page view to add-to-cart, add-to-cart to checkout, checkout to purchase.
   - Mobile versus desktop conversion.
   - Top products by sessions, revenue, margin, conversion, inventory, and return rate.
   - Discount rate, refund rate, shipping cost, bundle attach rate, upsell take rate.
   - Email/SMS campaign revenue, flow revenue, list growth, and segment performance.

## Weekly Cadence

### Monday - Diagnose and Prioritize

- Review the KPI tree and isolate the constraint.
- Write one diagnosis sentence: "The current constraint is X for Y segment because Z."
- Score opportunities with `impact x confidence x speed x measurability / risk`.
- Select one main bet and one or two quick wins.

### Tuesday to Thursday - Ship and Instrument

- Confirm baseline, data source, KPI, guardrail, owner, launch date, and decision rule.
- Ship small changes that are reversible and observable.
- QA mobile, checkout, PDP, discount, tracking, and email/SMS links.

### Friday - Decide

Give each shipped item one label:

- **Scale:** worked; expand exposure, budget, or template usage.
- **Iterate:** promising; adjust the next variable.
- **Kill:** did not work or hurt a guardrail; remove it.
- **Hold:** inconclusive; revisit when traffic or data quality improves.

## Common High-Impact Fixes

Use this library only after naming the constraint. Each fix must connect to a segment, product, funnel step, or data gap from the diagnosis.

### Conversion Rate

- Match paid ad promise to landing page headline and first-screen product proof.
- Clarify shipping, returns, delivery timing, guarantees, and payment options near add-to-cart.
- Improve mobile PDP hierarchy: first image, product promise, reviews, variant clarity, sticky add-to-cart.
- Reduce checkout surprises from shipping, tax, discount code behavior, or payment methods.
- Add objection-handling FAQs and social proof for top products.

### AOV and Margin

- Test bundles based on common product pairings or first-time buyer kits.
- Set a free shipping threshold slightly above current AOV when margin allows.
- Add cart or post-purchase upsells that complement the hero product.
- Promote high-margin best sellers instead of low-margin volume drivers.

### Retention and Owned Channels

- Improve abandoned checkout, welcome, post-purchase, replenishment, review request, and winback flows.
- Segment by first product purchased, purchase recency, engagement, and predicted reorder timing.
- Use email/SMS to validate offers before scaling paid spend.

### Acquisition Efficiency

- Clean UTMs and compare spend to contribution profit, not only platform ROAS.
- Route traffic to the best-fit PDP, collection, quiz, or offer page.
- Shift budget toward segments with healthy MER/CAC and enough margin.
- Pause or isolate spend where traffic quality is masking a conversion problem.

## Standard Operator Handoff

```markdown
## Situation
[One paragraph on store state, comparison window, and the named constraint.]

## KPI Read
- North star:
- Primary KPI:
- Guardrails:
- Baseline:
- Data gaps:

## Ranked Action Plan
| Rank | Action | DIMA Rationale | Owner | KPI | Guardrail | Effort/Risk | Decision Date |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | QA and fix mobile checkout surprises for top paid products | Diagnose checkout leakage; instrument abandonment and CVR by device; move fast on reversible copy/payment/shipping fixes; automate a weekly checkout QA checklist if it works | Growth operator + theme owner | Checkout completion rate | AOV, MER, support complaints | Medium effort / low-to-medium risk | Friday |

## This Week's Loop
- Main bet:
- Quick win 1:
- Quick win 2:
- Friday decision rule:

## Founder/Operator Asks
- [Decision, asset, budget approval, or constraint only.]

## Automation Follow-Up
- [Flow, template, dashboard, checklist, saved segment, or SOP to create if this works.]
```

## Communication Standards

- Be direct, specific, and operator-oriented.
- Use short paragraphs and tables for action plans.
- Say "I need X to decide Y" instead of asking broad exploratory questions.
- Avoid generic ecommerce advice when a metric, segment, or product constraint is available.
- Mark assumptions clearly and keep recommendations useful even when data is incomplete.
