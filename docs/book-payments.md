# Book purchases and delivery

New orders use EUR only: physical book €14.99 per copy (1–100), enriched PDF edition €3.99 (one personal copy). Prices and quantities are checked on the server and in PostgreSQL. Adaptive pricing is disabled. Checkout uses the payment methods enabled in the Stripe account.

## Deployment

Apply the versioned migrations and deploy `create-book-checkout`, `book-store`, `get-book-order`, `book-payment-webhook`, and `admin-book-orders` with their `_shared` dependencies and `deno.json`. Their function-level JWT checks are disabled intentionally: the webhook verifies the raw Stripe signature; administrator operations verify the user, current session, role, and MFA; purchase/status endpoints validate input and private order capabilities. Status and download endpoints never return customer contact or address details.

The frontend changes must also be imported and published in Readdy. An older frontend cannot show the new server-confirmed order status or the electronic edition. A query parameter such as `success=true` is never proof of payment.

## Configure each Stripe mode

- `STRIPE_SECRET_KEY` selects the active mode by its `sk_test_`/`rk_test_` or `sk_live_`/`rk_live_` prefix. Optional `BOOK_PAYMENTS_MODE=test|live` sets the mode explicitly; a matching key is still required. Optional `STRIPE_TEST_SECRET_KEY` and `STRIPE_LIVE_SECRET_KEY` keep the credentials separate.
- In `/admin/orders`, select the corresponding mode and use **Настрой известяванията**. This creates an endpoint at `/functions/v1/book-payment-webhook?mode=test|live` with API version `2026-08-26.dahlia` and the required completion, delayed payment, failure, expiry, and refund events. The signing secret is saved encrypted in Supabase Vault. The browser receives only the endpoint ID and configuration status.
- Optional `STRIPE_BOOK_WEBHOOK_SECRET_TEST` and `STRIPE_BOOK_WEBHOOK_SECRET_LIVE` override Vault. Keep these consistent with the actual endpoints. Never expose API keys or signing secrets through `VITE_*`, the repository, the frontend, or an order response.
- Test and real orders, event IDs, and totals are isolated by mode. Test purchases do not represent revenue or shipments. Before accepting real customers, configure the real key and real webhook, publish the frontend, and verify the published flow. Keep the endpoint enabled and monitor failed deliveries in Stripe; processing failures return 503 so Stripe can retry.

The first deployment was checked with the connected **test** account. No real payment was taken. Its test webhook is configured; the final electronic-book PDF has not been supplied or activated.

## Electronic edition

In `/admin/orders`, upload the final PDF (up to 25 MiB) with an edition label. The server checks its PDF header and SHA-256 hash before activation. The `book-downloads` bucket is private. Uploads use a unique path and cannot overwrite existing files; earlier orders retain their purchased edition when a new edition is activated. Physical checkout stays available independently of the PDF. Electronic checkout is blocked until an edition and a signing secret exist.

The purchaser explicitly requests delivery immediately after verified payment. The terms do not rely on a waiver of applicable withdrawal rights. A random private order token is persisted before Checkout; only its hash is stored on the server. On return, an early page script moves the token from the URL fragment into session storage before any third-party script runs. The customer can save a private access-link text file. The link must be kept private and retained after closing the tab. If access is lost, support must verify the purchase before restoring access; automated email delivery is not implemented here.

PDF links expire after 60 seconds and require a paid or partially refunded order. A full refund stops issuance of new links; an already issued link can remain valid until its short expiry. `download_link_issued` records issuance, not proof that the customer downloaded or read the file.

## Physical delivery and reporting

Only a verified paid physical order can move from `ready` to `preparing`, `shipped`, and `delivered`. Shipping requires a carrier and tracking number. Updates compare the previous status and record the administrator in the audit history. Carrier status is entered by staff; no carrier API is integrated. Test orders are shown separately and must not be dispatched.

The administrator totals cover **all orders recorded by this integration**, independently of the displayed page size, in integer EUR cents: paid amount, cumulative refunds, and amount remaining after refunds. They are before Stripe fees. Older untracked Checkout Sessions and other Stripe products are excluded; this is not a complete Stripe balance or accounting reconciliation. The legacy `get-stripe-orders` endpoint groups returned-page amounts by their actual currency instead of labeling every payment BGN.

## Verification

Run `npm test`, `npm run typecheck`, `npm run check:edge`, `npm run build`, and `npm audit --omit=dev --audit-level=high`.

The automated suite covers database roles/MFA, exact prices, concurrent/repeated order requests, owner isolation, real HMAC verification, forged/stale signatures, delayed success/failure, declining/expiring payments, duplicated/out-of-order events, full/partial/orphan refunds, immutable editions, refund revocation, delivery transitions, and totals beyond a page of 1,000 records. Vault encryption is provided by the deployed Supabase Vault; the local platform fixture exercises access control with a test stand-in.

Remote checks create genuine unpaid Stripe test Checkout Sessions and verify their EUR totals, metadata, redirects, adaptive-pricing setting, and reuse on concurrent requests. Signed synthetic event fixtures exercise the deployed webhook and PostgreSQL success, decline, delayed-payment and refund transitions without taking any payment. These fixtures are explicitly isolated to test mode and removed after verification. They do not replace completing the Stripe-hosted Checkout with test payment methods.

Before real sales, finish the published-browser checks: successful test card, declined test card, cancellation/expiry, and a delayed payment method enabled in the account. Verify the corresponding order and Stripe session together, replay an actual webhook event, and check PDF access and revocation after a test refund with the final file. No live card should be used for these checks. UI end-to-end payment completion and a final-file download remain release checks; do not describe the synthetic fixture tests as completed customer payments.
