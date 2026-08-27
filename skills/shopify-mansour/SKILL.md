---
name: shopify-mansour
description: Use when handling Mansour Shopify operations, including catalog cleanup, inventory fixes, campaign or discount setup, order exception triage, daily handovers, and Claude-to-Claude Shopify session transfers.
---

# Shopify Mansour

## Overview

Use this skill for Shopify operations tied to the Mansour account. Move fast on triage and preparation, not on guesses. Collect source data, separate safe analysis from risky store changes, and leave the next operator with a clear handover.

For reusable transfer fields and detailed playbooks, load `references/handover-checklist.md`.

## When to use

Use this when the request mentions Mansour, or the active workspace/thread/handover is already Mansour, and any of:

- Shopify admin work, products, variants, collections, SKUs, inventory, discounts, campaigns, orders, refunds, fulfillment, returns, or customer-impacting exceptions.
- Catalog cleanup, merchandising, PDP fixes, SEO fields, tags, vendors, product types, publication status, or sales-channel readiness.
- End-of-day updates, "Claude handover", next-shift notes, unresolved blockers, or daily transfer continuity.

Do not use this for generic Shopify API authoring unless the work belongs to Mansour. For non-Mansour Shopify development, use the relevant Shopify skill instead.

## Required intake

Before changing store state, capture store scope, object scope, source of truth, desired outcome, risk owner, and rollback path. Examples: product handles, SKUs, collections, order IDs, campaign names, exact inventory deltas, discount rules, approved trackers, ERP/WMS sheets, Shopify exports, or prior handovers.

If any required input is missing, stay in triage mode. Produce a proposed action list and ask for the missing source data instead of inventing values.

If sources conflict, treat Shopify as the current store state and the approved tracker, ERP, WMS, or merchant note as the target state. Stop before mutation and report the conflict if the target source is unclear, stale, or disagrees with another source. Use the user's stated timezone for deadlines. If none is stated, use UTC and say so.

## Mutation guardrails

Safe without extra approval: read data, draft analysis, prepare diffs, propose actions, and prepare reversible import files from explicit source values.

Needs explicit confirmation in the current task:

- Price, compare-at price, inventory quantity, cost, tax, or market changes.
- Publishing, archiving, deleting, redirecting handles, or sales-channel changes.
- Creating, editing, deleting, duplicating, activating, pausing, or stacking campaigns, discounts, or codes, including values, dates, targets, eligibility, limits, and market/currency scope.
- Refunds, cancellations, fulfillment holds, address edits, customer emails, fraud decisions, or return approvals.
- Bulk edits affecting more than 10 named products, variants, or orders, or any unnamed set.

Urgency is not approval. Phrases like "flash sale soon", "move fast", or "don't slow down" only justify faster triage and prep. They do not authorize risky writes.

For risky changes, respond with: proposed change, source evidence, blast radius, rollback path, and approval needed. Confirmation must name the affected objects, exact target values or mechanics, timing, and approver or requester.

## Standard workflow

1. Confirm the source of truth and scope.
2. Classify the task as catalog, inventory, campaign, order triage, or handover.
3. Split actions into safe now, needs approval, and blocked.
4. Execute only the confirmed safe work.
5. Record each action with object ID, before value, after value, evidence, and timestamp.
6. End with a Claude handover note, even if no store change was made or the work is blocked.

## Playbooks

Catalog: check title, handle, description, media, variants, SKU/barcode, vendor, type, tags, collections, channels, SEO, and status. Flag URL, discovery, ad, feed, or PDP risk.

Inventory: never infer stock. Use SKU, location, current Shopify quantity, target source quantity, delta, and reason. Stop on conflicting source data.

Campaigns and discounts: validate dates, timezone, targets, eligibility, stacking, limits, minimums, markets/currencies, and existing active discounts. Avoid overlaps unless explicitly approved.

Order triage: classify exceptions as payment, fraud, address, inventory, fulfillment, cancellation, refund, return, or customer-contact blocker. Prioritize customer-facing SLA/shipment failures first, then payment/fraud/refund/cancellation, inventory/fulfillment, address/contact, and internal cleanup.

## Handover format

Use the Mansour Shopify handover template in `references/handover-checklist.md`. Include date/time, operator, source checked, scope, completed work, needs approval, blocked items, risks, rollback notes, and exact next actions. Use "current agent" when no person is named.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Treating "move fast" as permission to mutate Shopify | Move fast on triage and preparation. Gate risky writes. |
| Changing inventory from memory or screenshots without location context | Require SKU, location, source quantity, Shopify quantity, and delta. |
| Creating a discount without conflict checks | Check active discounts, eligibility, dates, limits, and stacking. |
| Writing a vague handover | Include object IDs, evidence, exact next action, and owner. |
| Mixing completed actions with proposals | Keep completed, needs approval, and blocked in separate sections. |
