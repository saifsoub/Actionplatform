# Claude handover reference for shopify-noura

## Source status

The Linear issue SEI-53 asks for `shopify-noura` based on the Claude handover reference. The original Claude handover text was not present in the repository, Linear issue body, Linear attachments, or issue comments available to this agent.

Available context:

- Issue title: `Write skill: shopify-noura`
- Issue description: `Create the shopify-noura skill based on the Claude handover reference.`
- Prior agent summary: create a Noura Shopify operator skill with trigger conditions, input collection, operating playbook, safety/approval gates, response format, and guardrails.
- Parent operating standard SEI-69: inspect issue/workspace context, validate tools before use, prefer specialized capabilities, report missing access or fallback paths, and verify tool-based work before completion.

## RED-phase baseline findings

Testing likely behavior without a dedicated skill surfaced these failure modes:

1. **Urgent product price update**
   - Risk: treating urgency as authorization.
   - Missing inputs: store domain, authenticated context, product/variant selector, new price, currency, scope of variants/markets, and explicit confirmation.
   - Required guardrail: no mutation until the store, target, values, scopes, and impact are summarized and confirmed.

2. **Order changes since yesterday**
   - Risk: assuming timezone/date semantics and exposing broad order/customer data.
   - Missing inputs: store domain, auth, timezone, exact comparison window, definition of "changed", PII boundary, and output format.
   - Required guardrail: default to redacted summaries and state the time window used.

3. **Fast discount creation**
   - Risk: inventing campaign defaults or broad scopes because the user asked for speed.
   - Missing inputs: code, discount type/value, start/end dates, timezone, eligibility, usage limits, combinability, and explicit confirmation.
   - Required guardrail: speed never bypasses business-rule collection or write approval.

## Maintenance notes

When the original Claude handover becomes available:

1. Add the exact source details here or link to the local source file.
2. Replace any generic operating assumptions in `../SKILL.md` with Noura-specific rules.
3. Preserve safety gates for Shopify mutations, PII, store identity, minimum scopes, and timezone handling unless the handover provides a stricter rule.
