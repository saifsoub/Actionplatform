# Shopify ops checklists

Use these thresholds as defaults. Replace them with the store's own baseline when the user provides better numbers.

## Weekly KPI thresholds

| Metric | Watch | Act now |
| --- | --- | --- |
| Revenue | More than 10% below plan | More than 20% below plan or two weak days in a row |
| Gross margin | Down 3 points from baseline | Down 5 points or promotion is unprofitable |
| Sessions | Down 15% from same weekdays | Down 25% or one major channel is near zero |
| Conversion rate | Down 10% from baseline | Down 20% or checkout failures are elevated |
| AOV | Down 10% from baseline | Down 20% or discount stacking is suspected |
| Failed payments | 20% above baseline | Any sharp spike after payment, currency, or checkout changes |
| Refund or return rate | 25% above baseline | Quality, fulfillment, or product page accuracy issue suspected |
| Top SKU stock cover | Less than 14 days | Less than 7 days or bestseller is out of stock |
| Fulfillment backlog | More than 1 business day late | More than 2 business days late or support tickets rising |
| Support first response | More than 12 hours | More than 24 hours or revenue-impacting issue appears |
| Paid efficiency | MER or ROAS down 15% | MER or ROAS down 25% with spend still running |

## 48-hour incident triggers

Use these triggers during active revenue incidents:

| Signal | Action |
| --- | --- |
| Revenue down more than 20% for two comparable days | Start the 48-hour revenue drop playbook |
| Conversion rate down more than 20% while sessions are steady | Inspect checkout, theme, app, discounts, shipping, and mobile PDPs before changing traffic |
| Failed payments spike after a payment, currency, tax, or checkout change | Escalate to payment owner or provider immediately |
| A desktop or mobile test order fails | Stop paid traffic increases, document the error, and escalate checkout or payment investigation |
| One major channel is near zero | Check platform status, budget, rejected ads, UTMs, links, and tracking before assuming demand changed |
| Recent theme publish plus conversion drop | Ask the developer or theme owner to review rollback options |
| Top product out of stock or unpublished | Swap merchandising and pause traffic to affected pages |
| Shipping rates unavailable for a key region | Escalate to operations or Shopify Support before running acquisition traffic |
| Support tickets mention checkout, payment, discount, or shipping failures | Alert support lead and add an incident macro |

## Monday plan

1. Confirm last week's revenue, margin, conversion rate, AOV, sessions, refunds, fulfillment, and top SKU stock cover.
2. Set the week's revenue target and the one constraint that matters most.
3. Lock campaign calendar, email or SMS sends, launches, and promo windows.
4. Check top landing pages, top products, checkout, discounts, shipping profiles, and payment methods before pushing traffic.
5. Name risks that need same-day monitoring: low stock, delayed fulfillment, app changes, theme changes, budget changes, or support backlog.
6. Assign 3 to 7 actions with owner, metric, deadline, and rollback rule.

## Wednesday variance check

1. Compare week to date against plan and the same weekdays last week.
2. Identify the variance driver: sessions, conversion rate, AOV, refunds, or fulfillment.
3. Pull channel-level performance for paid, organic, email, SMS, social, and affiliates.
4. Review product mix, top SKUs, stockouts, discount usage, and checkout or payment errors.
5. Decide whether to hold, push, pause, rollback, or escalate.
6. Send a short owner update with the gap, cause, action, and next checkpoint.

## Friday closeout

1. Record final revenue, margin, sessions, conversion rate, AOV, orders, refunds, fulfillment, and inventory risks.
2. Write what worked, what failed, and which assumption changed.
3. Close or carry forward every open action.
4. Prepare next Monday's target, bottleneck, watchlist, and first actions.
5. Archive incident notes, campaign notes, and owner decisions so next week does not restart from memory.

## 48-hour revenue drop playbook

### First 15 minutes

- Compare last 48 hours with same weekdays last week and four weeks ago.
- Check Shopify Admin > Analytics, Shopify Admin > Orders, and the payment processor.
- Split the drop into sessions, conversion rate, AOV, order count, refunds, and failed payments.
- Confirm whether the drop began at a specific hour.

### First 30 minutes

- Place a desktop and mobile test order only if store policy allows it. Use the safest available method, tag or note the order, and cancel or refund it according to the store's normal process.
- Do not change live payment, tax, fraud, or checkout settings while testing unless the account owner approves the change.
- Check Shopify Admin > Settings > Payments for disabled or failing payment methods.
- Check Shopify Admin > Settings > Shipping and delivery for broken rates or unavailable regions.
- Check Shopify Admin > Discounts for expired, stacked, or misconfigured offers.
- Check Shopify Admin > Products and Inventory for top SKU stockouts or unpublished variants.
- Check Online Store > Themes for recent publishes or app embed changes.

### First 60 minutes

- Check paid platforms for paused campaigns, rejected ads, exhausted budgets, spend spikes, or tracking outages.
- Check email and SMS tools for failed sends, broken links, suppressed segments, or unexpected unsubscribes.
- Check top landing pages, product pages, cart, checkout, search, and collections on mobile.
- Check apps that touch pricing, subscriptions, bundles, reviews, upsells, inventory, fulfillment, or checkout.
- Reconcile Shopify orders with payment processor transactions and payouts.

### Next 2 hours

- Roll back the most likely recent theme or app change when evidence points to it.
- Restore campaigns only after checkout and payment checks pass.
- Swap merchandising if a top product is unavailable.
- Pause unprofitable discount stacking or broken offers.
- Escalate to the named owner if payment, checkout, theme, app, or ad-platform access is needed.

### Same day monitoring

- Track revenue, orders, failed payments, sessions, conversion rate, AOV, checkout reach, and abandoned checkouts hourly until stable.
- Confirm recovery against the same hours from the prior comparable day.
- Keep an incident log with timestamp, observation, action, owner, and result.

## Rollback examples

| Case | Rollback rule |
| --- | --- |
| Theme publish followed by conversion drop | Revert to the last stable theme if checkout or core product pages fail tests |
| New app touches price, cart, checkout, inventory, subscriptions, bundles, or upsells | Disable or roll back only after documenting what changed and who owns the app |
| Discount causes margin loss or unexpected stacking | Pause the discount, preserve screenshots, and create a corrected test discount before relaunch |
| Paid spend continues while checkout is failing | Pause scaling and keep only essential retargeting until checkout checks pass |
| Bestseller unavailable | Remove it from hero placements, redirect traffic to the closest in-stock substitute, and update support macros |

## Customer and support communication

- Alert support when tickets mention payment, checkout, shipping, discount, missing product, or order confirmation failures.
- Give support the current read, affected customer path, workaround, refund or cancellation rule, and next checkpoint.
- Consider customer-facing messaging only when customers are actively blocked, misled, charged incorrectly, or likely to contact support in volume.
- Do not promise root cause or recovery timing until the incident owner confirms it.

## Owner update templates

### Initial incident update

Revenue is down [x%] over the last 48 hours versus [comparison period]. I am splitting the issue into traffic, conversion, AOV, refunds, and payment failures before changing campaigns. First checks are checkout, payments, shipping, discounts, top SKU stock, recent theme or app changes, and channel traffic. Next checkpoint: [time].

### Progress update

Current read: [traffic/conversion/AOV/measurement] is the likely driver. Evidence: [metric or observation]. Action now: [specific action] owned by [person]. Recovery metric: [metric] should move by [time]. If it does not, escalation goes to [owner or vendor].

### Resolved update

Root cause: [cause]. Fix applied: [fix]. Revenue recovery signal: [metric and time window]. Prevention: [monitor, rollback rule, approval step, or weekly checklist change]. Open risks: [remaining risk or none].
