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
| Buyer order history | `/orders` | Searchable/filterable sample order list with links to tracking |
| Buyer order tracking | `/orders/:id` | Sample buyer-facing order progress using the same shared demo order state |

The operations workspaces use one shared browser-local demo order store (`marchy-demo-operations-v1`). Delivery and admin changes are reflected in both workspaces, including across open tabs. This is a frontend demonstration, not a source of truth.

## Existing browser-local state

- `marchy-language`: selected interface language
- `marchy-cart`: buyer cart
- `marchy-wishlist`: buyer wishlist
- `marchy-seller-drafts`: merchant product drafts
- `marchy-demo-operations-v1`: shared illustrative operations orders used by buyer checkout, merchant, buyer tracking, delivery and admin views

Buyer checkout creates one local demo order per seller in the basket, clears the local cart after confirmation and opens the first order's tracking page. The buyer account and `/orders` history page read the same browser-local demo order collection; they are not authenticated or tied to an individual guest identity. Only a display name, city, seller, item count, total and demo payment label are placed in the local demo order; phone, street address and delivery notes are not persisted. No real order, notification or payment is created.

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

## End-to-end order workflow contract

The buyer demo checkout groups cart lines by merchant and creates one order per merchant. Production should expose this as a single checkout operation so a multi-merchant basket cannot be partially submitted.

Suggested request:

```ts
type CheckoutRequest = {
  lines: Array<{ productId: string; variantId?: string; quantity: number }>;
  deliveryAddressId: string;
  paymentMethod: 'cash_on_delivery' | 'online';
  idempotencyKey: string;
};
```

Suggested response:

```ts
type CheckoutResponse = {
  checkoutId: string;
  orders: Array<{
    id: string;
    merchantId: string;
    status: 'pending_payment' | 'processing';
    subtotalTnd: number;
    deliveryFeeTnd: number;
    totalTnd: number;
    currency: 'TND';
  }>;
};
```

Recommended service boundaries (route names are proposals, not existing endpoints):

| Operation | Suggested API | Required server behavior |
|---|---|---|
| Submit basket | `POST /checkouts` | Reprice every line, validate stock/address/payment, group by merchant, create all orders atomically, enforce idempotency |
| Buyer order history | `GET /me/orders` | Return only orders belonging to the authenticated buyer |
| Order detail/tracking | `GET /orders/:id` | Check buyer/merchant/courier/admin access; return status and shipment events |
| Merchant order queue | `GET /merchant/orders` | Scope to authenticated merchant; never accept arbitrary merchant ownership from the client |
| Merchant status update | `PATCH /merchant/orders/:id/status` | Validate allowed state transitions and write an audit event |
| Courier assignment | `PATCH /operations/orders/:id/courier` | Require operations permission; validate provider and assignment eligibility |
| Shipment events | `GET /orders/:id/shipments` | Return provider events and timestamps; distinguish estimated from confirmed events |

### Shared order lifecycle

Use one canonical server-side order status vocabulary and return allowed actions for the current actor. A practical baseline is:

`processing → ready_for_pickup → in_transit → delivered`

Cancellation, failed delivery, return and refund should be explicit states or separate workflows with documented transition rules. The frontend demo status selector is intentionally permissive; it is not a business-rules implementation.

### Role ownership

- Buyer: create checkout, view own orders, request cancellation/return where eligible.
- Merchant: view orders containing that merchant's lines, prepare/hand over those lines, update merchant-owned fulfilment status.
- Courier/operations: view assigned shipments, record pickup/delivery events, manage eligible courier assignments.
- Platform admin: cross-marketplace moderation and operations according to explicit permissions, with audit history.

A multi-merchant checkout may produce several merchant orders under one checkout reference. The buyer should see one grouped purchase in order history with access to each merchant shipment. Delivery charges and final totals must come from the server, not the current demo subtotal.

### Frontend adapter boundary

Keep the current `useDemoOrders` implementation as a demo adapter. Introduce a production `orderService` with equivalent methods (list, get, create checkout, update merchant status, assign courier) and select the adapter at the app/service composition layer. Do not let page components read or write local storage directly. Add explicit loading, empty, validation, conflict, permission and network-error states when the API is connected.


## Current frontend architecture notes

The implementation branch introduces a shared React state composition layer:

- src/context/MarketplaceContext.jsx owns the MarketplaceProvider and useMarketplace hook.
- src/context/connectMarketplacePage.jsx connects page modules to shared marketplace state without passing cart, wishlist, language and theme through the route tree.
- src/app/MarketplaceApp.jsx owns route definitions and lazy-loads page modules. The header and footer remain in the application shell.
- src/components/AppErrorBoundary.jsx provides a recoverable route-rendering failure state.
- A route-level Suspense fallback displays an accessible loading state while a page chunk is downloaded.

The original useMarketplaceState hook remains the state implementation. Cart, wishlist, language and theme retain their existing browser-local storage keys and behavior.

## Seller workspace preview

The seller workspace now includes two populated demo tabs:

- **Insights** derives order count, total sample order value, average sample order and category mix from the existing demo orders/catalogue. Its SVG trend is based on sample order totals only. It deliberately does not fabricate views, clicks, conversion, customer analytics or payouts.
- **Settings** allows editing a local storefront profile, preparation-time preference, delivery/returns notes and notification toggles. Values are stored in browser local storage under a seller-specific demo key. No bank, payout, identity or other sensitive financial details are collected.

These are frontend previews only. They do not publish a storefront, send notifications, verify a business or update a live seller account.

## Styling and accessibility

src/styles/theme.css is the canonical source for semantic light/dark colour tokens. Duplicate semantic token declarations were removed from base.css; legacy --orange and --green aliases now resolve to the forest-green theme tokens. The skip link, route loading indicator, error state and seller workspace controls are styled in final-quality.css.

The existing stylesheet set has not been aggressively purged. Selector-level removal requires CSS coverage and visual regression testing across buyer, seller, operations, RTL and dark-mode routes. The safe next step is to gather coverage before deleting legacy selectors or splitting page CSS.

## Automated quality workflow

The existing .github/workflows/buyer-frontend-qa.yml and .github/workflows/frontend-build.yml validate pull requests targeting main. Buyer QA also runs on frontend/** branches and uses Node 22.12 to satisfy the installed accessibility tooling. They build the production app and run Chromium browser checks. A green workflow is required evidence before merging or deploying.


## Route CSS loading and interaction feedback

Seller workspace styles, support/auth styles and operations styles are now imported by their corresponding lazy-loaded page modules instead of the global stylesheet entry. This allows those stylesheets to load only when their route group is visited. Buyer discovery and shopping styles remain global for now because the homepage and search/product journeys share those page modules and selectors.

The MarketplaceProvider also exposes a small notification API. Adding a product to the cart or toggling a wishlist item displays a dismissible, automatically-clearing accessible toast. This is local interaction feedback only; it does not represent a server response.


## Demo coupon behavior

The cart accepts two illustrative, frontend-only promotion codes: MARCHY10 (10% off the product subtotal) and BIENVENUE (5 TND off). The selected code is kept in browser local storage while the buyer moves from cart to checkout. Checkout allocates the discount proportionally across seller demo orders and clears the local code after demo-order creation. These codes are not real offers and do not validate against seller campaigns or a backend promotion service.
