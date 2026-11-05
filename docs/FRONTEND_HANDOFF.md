# MARCHY frontend handoff

## Scope

This repository is the MARCHY frontend. It is a React 18 + Vite application using React Router. This handoff deliberately excludes backend implementation.

## Connected frontend workspaces

| Workspace | Route | Responsibility |
|---|---|---|
| Buyer marketplace | `/`, `/search`, `/product/:id`, `/cart`, `/checkout`, etc. | Discovery and shopping journey |
| Merchant | `/sell`, `/seller-dashboard`, `/seller/:slug` | Storefront planning and merchant workspace preview |
| Delivery operations | `/operations/delivery` | Fulfilment queue, courier assignment UI and status progression |
| Platform admin | `/admin` | Cross-marketplace order overview and operational status controls |

The operations workspaces use one shared browser-local demo order store (`marchy-demo-operations-v1`). Delivery and admin changes are reflected in both workspaces, including across open tabs. This is a frontend demonstration, not a source of truth.

## Existing browser-local state

- `marchy-language`: selected interface language
- `marchy-cart`: buyer cart
- `marchy-wishlist`: buyer wishlist
- `marchy-seller-drafts`: merchant product drafts
- `marchy-demo-operations-v1`: shared illustrative operations orders

Do not treat local storage as secure, authoritative or multi-user persistence. It is only for prototype continuity.

## Backend integration boundaries

The senior backend developer should provide authenticated APIs and replace the local demo services for:

1. Identity and access: buyer, merchant, courier, operations administrator; role-based permissions and session lifecycle.
2. Catalogue: products, variants, media, categories, stock, merchant ownership and moderation.
3. Basket and checkout: authoritative pricing, delivery fee calculation, address validation, order review and idempotent order creation.
4. Orders: order lifecycle, seller fulfilment, cancellation, returns, refunds and audit history.
5. Delivery: provider assignment, shipment events, tracking, proof of delivery and failed-delivery handling.
6. Payments: cash on delivery and supported online payment methods, payment intents, reconciliation and refunds.
7. Trust and support: verified reviews, merchant verification, reports, disputes and support cases.
8. Platform administration: moderation queues, merchant approvals, operational controls and audit logs.

## Suggested API resource shapes

These are integration contracts to agree on, not implemented endpoints.

- `Product`: id, merchantId, title, description, categoryId, priceTnd, compareAtPriceTnd, currency, media[], variants[], stock, status.
- `Merchant`: id, displayName, slug, city, description, verificationStatus, categories[], status.
- `CartLine`: productId, variantId, merchantId, quantity, unitPriceTnd.
- `Order`: id, buyerId, lines[], subtotalTnd, deliveryFeeTnd, totalTnd, paymentMethod, paymentStatus, fulfilmentStatus, address, createdAt.
- `Shipment`: id, orderId, providerId, trackingCode, status, events[].
- `Review`: id, productId, buyerId, orderId, rating, body, verifiedPurchase, createdAt.

All monetary values must be validated server-side and stored in a consistent minor-unit or decimal representation. The UI's TND formatting is presentation only.

## Frontend integration principles

- Keep page components independent of transport details. Introduce typed API/service modules and inject them into the app.
- Keep demo fixtures separate from production API adapters.
- Model loading, empty, error, permission-denied and success states explicitly.
- Never infer authorization from hidden navigation; enforce every permission on the server.
- Never trust prices, stock, totals, courier assignment or status transitions sent by the browser.
- Preserve existing route URLs where possible. Add guarded route wrappers when authentication is introduced.
- Keep Arabic RTL, French and English support; test currency, address and phone formats for Tunisia.
- Mark sample data and non-live capabilities clearly until real services are connected.

## Validation

Run:

```bash
npm install
npm run build
npm run test:e2e
```

The tests are authored in `tests/marketplace.spec.js`. A passing CI run is required before release; source changes alone are not evidence that the tests passed.
