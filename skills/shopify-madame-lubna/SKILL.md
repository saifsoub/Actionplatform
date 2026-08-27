---
name: shopify-madame-lubna
description: Use when working on the Madame Lubna Shopify storefront, including product catalog changes, pricing and promotion QA, merchandising, PDP copy, SEO checks, launch readiness, and post-launch monitoring.
---

# Shopify Madame Lubna

## Overview

Use this skill as the operating playbook for Madame Lubna storefront work. The safe default is simple: change only what the merchant has approved, verify the customer path, capture evidence, and escalate when the source of truth is missing.

This skill does not grant store access and does not replace Shopify-specific tooling. If the task requires Admin GraphQL design, use `shopify-admin`. If it requires Shopify CLI execution or store operations through the CLI, use `shopify-use-shopify-cli`.

## Non-negotiables

- Do not invent Madame Lubna brand facts, product claims, prices, discounts, materials, ingredients, policies, or launch dates.
- Do not ask for or store secrets, private tokens, or customer data in chat, docs, issues, or comments.
- Do not make live storefront changes without an explicit merchant-approved source of truth.
- Preserve product handles, URLs, variants, and sales channel visibility unless the merchant approves the change.
- Treat price, promo, inventory, tax, shipping, legal, and checkout uncertainty as escalation triggers.

## Intake checklist

Before touching Shopify, capture:

| Area | Required details |
| --- | --- |
| Request | Goal, deadline, launch window, requester, final approver |
| Products | Product handles, SKUs, variants, collections, markets, sales channels |
| Catalog source | Approved titles, descriptions, media, price, compare-at price, tags, inventory policy |
| Promotion | Discount type, code or automatic rule, eligibility, start and end time, stacking rules |
| Merchandising | Homepage slots, collections, navigation, search terms, filters, landing pages |
| Risk | Rollback owner, support contact, known constraints, screenshots or links to source material |

Valid approval means the named merchant approver confirms the source of truth in writing in the task thread, ticket, brief, or shared catalog sheet. The approver must be the merchant owner, launch owner, or delegated stakeholder already named for the Madame Lubna work. If the requester and approver differ, record both. If authority is unclear, stop and ask who can approve launch.

Use the most recent written approver-confirmed source as the source of truth. If chat, sheet, ticket, or brief disagree and no approver has resolved the conflict, treat the work as blocked. For emergencies, ask the approver to reply with the exact approved value, scope, risk acceptance, and launch timestamp. Do not infer emergency approval from silence or urgency.

If any required detail is missing, ask for the missing item or escalate. Do not fill the gap with generic Shopify assumptions. A deadline does not override missing approval.

## Workflow

1. **Scope the change.** Restate the affected products, promos, pages, and launch window. Keep unrelated cleanup out of scope.
2. **Confirm source of truth.** Use the merchant-approved catalog sheet, brief, ticket, or written approval. If sources conflict, stop and ask which source wins.
3. **Prepare changes safely.** Before final approval, you may draft copy, stage unpublished products, prepare theme previews, create disabled discounts, capture current values, or assemble QA checklists. You may continue unaffected prep while a blocked price or promo awaits approval, but label blocked items clearly. Do not publish, activate, schedule, or expose customer-facing changes until approval is recorded.
4. **Apply the smallest change.** Update only approved fields. Keep existing handles and URL redirects stable unless the request is explicitly about URLs.
5. **QA the customer path.** Check PDP, collection, search, cart, checkout, promo behavior, mobile layout, and SEO basics.
6. **Capture evidence.** Save links, screenshots, tested SKUs, promo outcomes, timestamps, and any known risks. Use the merchant-approved QA location first, then the launch ticket, then the task thread. If none exists, put the evidence in the task thread and ask where to move it. State where the evidence lives.
7. **Get sign-off.** A launch is not ready until the approver signs off or the risk is explicitly accepted.
8. **Monitor after launch.** Watch orders, discount usage, checkout errors, traffic, abandoned carts, inventory depletion, support messages, and theme or app errors for the merchant-approved window. If no window is given, monitor through the first hour after launch and the first three orders when access allows.

## Quick reference

| Task | What to verify |
| --- | --- |
| Product update | Title, handle, variants, price, compare-at price, images, alt text, description, tags, collections, sales channels |
| Pricing QA | PDP display, collection cards, cart line items, checkout total, compare-at logic, currency and market behavior |
| Promo QA | Eligibility, exclusions, start/end time, code entry, automatic discount behavior, stacking, minimums, checkout total |
| Merchandising | Homepage placement, collection order, navigation, filters, search result, related products, landing page placement |
| PDP quality | Above-the-fold clarity, media order, variant selectors, size or use details, care notes, shipping and returns, add-to-cart |
| SEO | Page title, meta description, URL handle, redirects, image alt text, canonical behavior, broken links, accidental noindex |
| Launch readiness | Full product-to-checkout test, mobile check, analytics sanity, rollback plan, approver sign-off |
| Monitoring | First orders, failed checkouts, discount usage, inventory, customer support, app/theme errors |

## Product description template

Use merchant-approved product facts only.

```markdown
## Product
[Approved product name]

## Short description
[One or two sentences with the main customer benefit. No unsupported claims.]

## Details
- Material/ingredient: [approved fact]
- Size/fit/variant notes: [approved fact]
- Care/use instructions: [approved fact]
- What is included: [approved fact]

## Merchandising notes
[Collection placement, badges, bundles, related products, or launch context.]

## SEO
- Page title: [under about 60 characters when possible]
- Meta description: [under about 155 characters when possible]
- Image alt text: [plain description of the product image]
```

## Pricing and promotion QA

Run at least one customer-path test for each affected promo:

- Product is eligible or excluded exactly as approved.
- Discount appears at the expected stage: PDP message, cart, or checkout.
- Code accepts, rejects, or auto-applies correctly.
- Minimum order, customer segment, product, collection, market, and time-window rules work.
- Stacking with other discounts matches the approved rule.
- Compare-at price and sale messaging are not misleading.
- Final checkout total matches the expected calculation, including shipping and tax behavior where visible.

Escalate if math is ambiguous. Price mistakes are not "content tweaks."

## Rollback checklist

Before launch, know how to return the storefront to the previous state:

- Products or variants changed, with old values recorded.
- Discounts created or edited, with the disable step identified.
- Current values captured before price, compare-at price, inventory, or promo changes. Use Shopify history, export, screenshots, or admin-visible current values, depending on access.
- Collections, navigation, homepage slots, and landing pages changed.
- Theme preview or live theme changes, with previous version or backup noted.
- URL handle or redirect changes, with redirect state recorded.
- Owner who can execute rollback if the launch owner is unavailable.

## Launch sign-off template

```markdown
## Madame Lubna launch sign-off

Scope:
- [Products, promos, pages, and markets changed]

Source of truth:
- [Brief, sheet, ticket, or written approval]

QA evidence:
- Products/SKUs checked:
- Promo tests:
- PDP and collection checks:
- SEO checks:
- Cart and checkout checks:
- Mobile checks:
- Evidence location:

Known risks:
- [None, or approved exceptions]

Rollback:
- Owner:
- Steps:

Monitoring:
- Owner:
- Window:
- Signals:

Approver:
- Name:
- Requester, if different:
- Timestamp:
```

## Escalation rules

Stop and escalate when:

- Approved product facts, prices, discount rules, inventory, or launch timing conflict.
- A URL handle, redirect, theme file, checkout setting, tax setting, shipping rule, market rule, or app integration must change.
- Promo behavior can over-discount, stack unexpectedly, or affect products outside the approved scope.
- Checkout, cart, PDP, or add-to-cart flow fails.
- Legal, medical, beauty, ingredient, sourcing, sustainability, or guarantee claims lack approval.
- The approver is unavailable and the change affects price, checkout, inventory, legal copy, or launch timing.
- The launch deadline arrives before approval, while source-of-truth conflicts or rollback ownership are still unclear.

## Common mistakes

| Mistake | Better behavior |
| --- | --- |
| Writing generic luxury copy | Use only approved Madame Lubna facts and a clear customer benefit |
| Treating compare-at changes as harmless | Verify legal sale messaging, PDP display, cart, and checkout |
| Testing the promo on one product only | Test eligible and excluded cases |
| Changing handles for neatness | Preserve URLs unless approved, then check redirects |
| Publishing before sign-off | Keep changes draft or scheduled until approval is recorded |
| Saving screenshots locally only | Put evidence where the merchant or task owner can review it |
| Treating a deadline as approval | Ship only with approval or record the launch as blocked |
| Calling launch done after QA | Assign monitoring owner and watch post-launch signals |

## Definition of done

Work is done when:

- Approved catalog or merchandising changes are live, scheduled, or explicitly handed back as blocked.
- Price and promo behavior is verified through cart and checkout where access allows.
- Affected PDPs, collections, search, navigation, SEO fields, and mobile views have been checked.
- Any skipped QA path records the access limit, reason, risk, and owner for follow-up.
- Evidence includes tested SKUs, promo outcomes, screenshots or links, timestamps, and known risks.
- The merchant approver has signed off, or the blocker and escalation owner are recorded.
- A post-launch monitoring owner knows what to watch and when to report.
