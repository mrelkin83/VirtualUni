---
name: billing-regression-check
description: Claude-only background knowledge for touching backend/src/modules/billing/. Use before or after editing Wompi checkout/webhook code — reminds to run the billing test suite and re-derive the checksum/signature algorithm against docs.wompi.co instead of trusting the existing implementation.
user-invocable: false
---

# Billing regression check

`backend/src/modules/billing/` handles real money and cryptographic
signature verification for Wompi (checkout integrity signature, webhook
checksum). It has already produced one real, silent bug this project: an
earlier version of `verificarChecksum` walked the wrong path into
`payload.data` (it dropped the first path segment of each
`signature.properties` entry) and rejected every valid webhook checksum.
Tests still passed at the time because the test itself made the same wrong
assumption — a checksum check can be *wrong* without being *failing*.

## Before editing anything in this module

1. Re-read the current algorithm in `billing.service.ts`
   (`createCheckoutSession` for the integrity signature,
   `verificarChecksum` for the webhook checksum) rather than assuming it's
   still correct.
2. If you're not re-deriving it from a fresh read of
   [docs.wompi.co](https://docs.wompi.co) in this session, say so and flag
   the risk explicitly rather than silently trusting memory or the existing
   code.
3. Concatenation order and exactly which fields are included matter — a
   single wrong field silently breaks security, not functionality, so a
   green test suite is not proof of correctness if the tests encode the same
   wrong assumption as the code.

## After editing anything in this module

Run the billing test suite before considering the change done:

```bash
cd backend && npx jest billing
```

If you changed the checksum or integrity-signature logic specifically, also
manually recompute one example by hand (a `node -e` one-liner using
`crypto.createHash('sha256')`) against the fields you believe Wompi expects,
and compare it to what the code produces for the same input — don't rely on
the Jest assertions alone to catch a case where the test's expected value
was derived from the same wrong logic as the implementation.

For anything touching auth/JWT/PII/webhook-signature code in this module
specifically, also consider running the `security-reviewer` subagent
(`.claude/agents/security-reviewer.md`) — it has this exact bug documented
as calibration for what to look for.
