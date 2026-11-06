# MARCHY API Contracts — Frontend/Backend Handoff

**Status:** Proposed v1 contract; align with backend implementation before integration.  
**Market:** Tunisia first; TND.  
**Frontend:** React 18 + Vite 6.  
**Scope:** Contract only. This document does not claim that these endpoints exist.

## 1. Environment and adapter selection

- `VITE_MARCHY_DATA_MODE=mock` (default): explicit local demo adapter.
- `VITE_MARCHY_DATA_MODE=api`: production/staging API adapter; no fallback to mock on errors.
- `VITE_MARCHY_API_URL=https://api.example.tn`: API origin, no trailing slash required.
- Never place private API keys, gateway secrets or service credentials in Vite variables.
- Authentication should use secure server-managed cookies or a separately agreed token strategy. If cookies are used cross-origin, backend CORS and cookie settings must be configured together.

## 2. Shared response conventions

Every response uses JSON unless status 204.

Errors:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Please review the highlighted fields.",
  "field_errors": { "phone": "Enter a valid Tunisian phone number." },
  "request_id": "req_..."
}
```

Paginated collection:
```json
{
  "items": [],
  "next_cursor": null,
  "total_estimate": 0
}
```

Money:
```json
{ "amount_minor": 125500, "currency": "TND" }
```
One TND equals 1,000 millimes. The backend must choose one canonical representation and use it consistently. The frontend adapter currently expects camelCase `amountMinor`; use a documented serialization layer or agree to camelCase before integration. Never send formatted strings as authoritative money.

All timestamps are ISO 8601 UTC. All mutating transaction requests use an `Idempotency-Key`. Include `X-Request-Id` or `request_id` in responses. Pagination is cursor-based.

## 3. First integration endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/catalog/products | Search/browse catalogue |
| GET | /api/v1/catalog/products/{id} | Canonical product detail |
| GET | /api/v1/products/{id}/offers | Seller offers and availability |
| POST | /api/v1/checkout/quote | Authoritative price, stock, parcel and payment quote |
| POST | /api/v1/orders | Create order from valid quote |
| GET | /api/v1/me/orders | Customer order history |
| GET | /api/v1/orders/{id} | Authorized order detail |
| GET | /api/v1/seller/profile | Current seller organization/profile |
| GET | /api/v1/seller/offers | Seller offers |
| GET | /api/v1/seller/inventory | Seller inventory |
| GET | /api/v1/seller/orders | Seller order queue |
| POST | /api/v1/seller/orders/{id}/accept | Accept seller order |
| GET | /api/v1/shipments/{id}/tracking | Carrier event timeline |
| GET | /api/v1/seller/finance/summary | Backend-derived finance summary |
| GET | /api/v1/seller/settlements | Seller statements |
| GET | /api/v1/seller/payouts | Payout history |

## 4. Checkout quote request

```json
{
  "lines": [
    { "offer_id": "offer_123", "variant_id": "variant_42", "quantity": 2 }
  ],
  "shipping_address_id": "address_123",
  "delivery_service_id": "service_01",
  "payment_method": "cod",
  "promotion_code": null
}
```

Response must include:
- quote id and expiry;
- validated product/variant/offer, seller and quantity per line;
- authoritative unit prices and discount allocations;
- parcel grouping by seller/fulfilment node;
- delivery price and estimate per parcel;
- payment method eligibility and any COD constraints;
- applicable fees/taxes only when confirmed by policy;
- total amount and currency;
- line-level and checkout-level validation errors.

The frontend displays the quote; it does not calculate the payable total.

## 5. Order creation request

```json
{
  "quote_id": "quote_123",
  "customer_note": "Call on arrival",
  "confirmation": { "accepted_terms_version": "2026-01" }
}
```

The backend must revalidate quote expiry, price, offer status, stock, address, delivery and payment eligibility; reserve inventory atomically; create the parent customer order and seller fulfilment orders; snapshot all commercial terms; create the payment intent or COD obligation; and publish domain events through a transactional outbox.

The client must not decrement inventory or mark payment as successful. The response contains order references and the next permitted action.

## 6. COD and financial invariants

- COD order creation is not cash collection.
- Shipment delivered is not carrier remittance.
- Carrier remittance is not seller payout.
- Seller payable is derived from ledger events and approved settlement rules.
- Payment, refund and payout operations are idempotent.
- Posted journal entries are immutable; corrections use reversals/adjustments.
- Every reconciliation discrepancy has an owner, amount, age and resolution state.
- Frontend finance screens display backend values and distinguish estimated, pending, settled, held and paid.

## 7. Authorization

Every endpoint validates authorization server-side. Seller endpoints are scoped to the authenticated seller organization and membership. Admin/finance operations use role checks, audit records and maker-checker approval for high-risk actions. Hiding a route or button is not access control.

## 8. Integration sequence

1. Backend agrees naming, casing, pagination and money representation with frontend.
2. Backend publishes OpenAPI 3.1 specification and staging environment.
3. Identity/session and permission contract is integrated first.
4. Catalogue and offers.
5. Checkout quote and order creation.
6. Seller orders and inventory.
7. Carrier tracking and COD remittance.
8. Finance statements, reconciliation and payouts.
9. Contract tests run against staging before live adapter is enabled.

## 9. Known compatibility decision

The current UI formatter accepts display values in TND and can explicitly convert millimes. The API contract should use integer millimes to avoid floating-point ambiguity. The frontend API adapter validates `amountMinor` with `currency: "TND"`; the backend and frontend must agree whether JSON uses camelCase or snake_case and normalize at the adapter boundary. Do not integrate until this is settled.

## 10. Seller onboarding and verification contract

Seller onboarding must be a server-owned state machine. The local Seller Central preparation page is a browser-only planning tool; it does not create an application or establish a seller identity.

### Proposed endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/seller/onboarding/draft | Retrieve the authenticated user's saved application draft |
| PUT | /api/v1/seller/onboarding/draft | Create/update a server-side draft |
| POST | /api/v1/seller/applications | Submit a completed application for review |
| GET | /api/v1/seller/applications/{id} | Read application status and required next steps |
| POST | /api/v1/seller/applications/{id}/documents | Upload a requested document using a secure upload flow |

### Proposed application fields

- storefront_name
- legal_name
- business_type
- governorate_code and locality
- business_phone and business_email
- primary_category_id
- business_description
- fulfilment_preference
- payment_capabilities_requested
- website_or_public_business_reference (optional)
- accepted_terms_version and accepted_at (only at the real submission step)

Do not accept an arbitrary client-supplied verification status, seller ID, approval decision or payout destination. The backend assigns IDs and controls all status transitions.

### State machine

\`draft → submitted → under_review → approved\`

Exceptional transitions:
- \`under_review → needs_information → submitted\`
- \`under_review → rejected\`
- \`approved → suspended → approved\` (only through audited admin action)
- \`approved → closed\` (policy-controlled)

Each transition records actor, timestamp, reason code, previous state, new state and correlation/request ID. Only authorized operations roles can approve, reject or suspend.

### Document handling

- Publish the exact document checklist only after legal/operations approval.
- Use short-lived signed upload URLs or a controlled upload service.
- Validate MIME type, extension, file size and malware scan result.
- Store private documents outside public catalogue media.
- Restrict access to specifically authorized reviewers.
- Log every view, download, replacement and deletion.
- Never store identity documents in browser localStorage or expose them through public URLs.

### Verification and account activation

Application submission is not seller approval. Approval does not itself create a payout destination or enable money movement. Seller activation requires separate checks for organization membership, permissions, accepted seller agreement, catalogue policy and finance onboarding. Seller payout destination verification is a distinct controlled workflow.

### Tunisia policy dependencies

The final checklist, business-type eligibility, registration/tax fields, retention period and seller agreement must be confirmed by Tunisian counsel and an accountant. The frontend must not imply that a specific document is universally mandatory until MARCHY's policy has been approved.

## 11. Seller catalogue, offers and inventory contract

Seller catalogue data must be scoped to the authenticated seller organization. A product record describes the shared product identity; a seller listing/offer describes that seller's commercial offer. Do not let one seller overwrite another seller's price, SKU, condition or stock.

### Proposed endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/seller/listings | Paginated seller-owned listing records |
| POST | /api/v1/seller/listings | Create a seller listing draft |
| PATCH | /api/v1/seller/listings/{id} | Update an editable seller listing |
| POST | /api/v1/seller/listings/{id}/submit | Submit listing for moderation |
| GET | /api/v1/seller/listings/{id}/moderation | Read moderation outcome and requested changes |
| POST | /api/v1/seller/inventory/adjustments | Record an auditable stock adjustment |

### Listing payload

A listing draft should include:
- product identity or a request to create a new catalogue product;
- seller SKU, unique within the seller organization;
- category ID and required category attributes;
- title, factual description and media references;
- variant definitions with stable variant IDs/SKUs where applicable;
- offer price in integer minor units, currency and optional compare-at price;
- fulfilment eligibility and handling time;
- seller's declared condition and warranty details where relevant.

The backend validates category-specific attributes, prohibited/restricted goods, media ownership, SKU uniqueness, price bounds, variant structure and seller eligibility. Product media must use an approved upload flow; arbitrary public image URLs are not a substitute for controlled media ownership.

### Listing lifecycle

\`draft → submitted → under_review → approved → active\`

Additional states:
- \`needs_changes\` (seller edits and resubmits)
- \`rejected\` (terminal for that submission; a revised listing may be created)
- \`paused\` (seller or authorized operations action)
- \`archived\` (seller action subject to open-order and legal-retention checks)

Only moderation services/authorized reviewers can approve or reject. Seller requests can submit, edit eligible drafts, pause or archive where policy permits. The client must never set \`approved\` or \`active\` directly.

### Inventory invariants

- Inventory is tracked by seller organization, offer, variant and fulfilment location.
- Available-to-sell is derived from on-hand minus reserved, damaged, safety-stock and other unavailable quantities.
- Order reservation/release/consumption is server-side and atomic.
- Manual adjustments require a reason code, actor, timestamp and idempotency key.
- A stock adjustment must not overwrite another seller's offer or variant stock.
- Low-stock thresholds are configurable per SKU/variant.
- Every adjustment creates an immutable inventory movement record; corrections use compensating movements.

### Demo boundary

The current Seller Central catalogue manager stores isolated preparation records in browser localStorage. Its “Submit for review” action changes a local demo state only. It does not create a backend listing, publish a customer offer, reserve stock, or approve/activate a product.



## 11. Seller orders and fulfilment workflow

The seller workspace must return only orders containing items assigned to the authenticated seller organization. Never trust a seller identifier supplied by the browser to authorize access. For multi-seller checkouts, each seller receives its own fulfilment view while the buyer retains the platform-level order relationship.

| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/seller/orders | List seller-assigned orders with status, date and cursor filters |
| GET | /api/v1/seller/orders/{orderId} | Read an authorized seller order and its fulfilment lines |
| POST | /api/v1/seller/orders/{orderId}/accept | Accept eligible seller lines (idempotent) |
| POST | /api/v1/seller/orders/{orderId}/preparation | Update preparation state and optional seller note |
| POST | /api/v1/seller/orders/{orderId}/packed | Confirm packing and parcel metadata (idempotent) |
| POST | /api/v1/seller/orders/{orderId}/ready-for-pickup | Request courier handoff and pickup slot (idempotent) |

Seller fulfilment state is distinct from customer order/payment state. The backend owns the canonical state machine and validates every transition. Seller actions must be scoped to that seller's order lines, even when one checkout contains multiple sellers. Acceptance revalidates listing eligibility and reserved inventory; packing validates quantities and parcel data. Marking ready for pickup is not proof of courier collection; only a courier integration or verified operations event may advance tracking to in-transit. Never mark COD collected, payment settled, delivered or refunded from a seller preparation action. The local prototype stores a separate sellerFulfilmentStatus and does not send notifications or create courier bookings.


## 12. Returns, inspections and refunds

| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/seller/returns | List return cases scoped to the authenticated seller |
| GET | /api/v1/seller/returns/{returnId} | Read an authorized return case and item-level history |
| POST | /api/v1/returns | Buyer submits a return request against an eligible delivered order line (idempotent) |
| POST | /api/v1/seller/returns/{returnId}/decision | Seller accepts or declines within policy and permitted reasons |
| POST | /api/v1/seller/returns/{returnId}/received | Record physical receipt, parcel condition and evidence references |
| POST | /api/v1/seller/returns/{returnId}/inspection | Record inspection outcome and recommend next disposition |
| GET | /api/v1/returns/{returnId}/refund | Read refund review/execution state; no seller-side execution |

Return requests must reference a real delivered order line and validate policy windows, item exclusions, quantities and prior return claims on the server. Seller authorization is based on the authenticated seller's order-line ownership, not browser-supplied seller IDs. Evidence uploads use signed/private storage references and must not expose private customer data publicly. The case lifecycle (submitted, accepted/declined, received, inspected, refund review) is distinct from refund execution. Only authorized platform finance operations may approve, calculate and execute full or partial refunds, reconcile gateway/COD amounts, and record ledger entries. A seller inspection or recommendation never means a refund has been approved or paid.

The current frontend prototype stores buyer return requests in browser local storage for demonstration only; it does not enforce legal eligibility windows, arrange reverse logistics, upload evidence, notify sellers, or issue refunds.


## 13. Seller finance, COD reconciliation and settlements

All finance endpoints are authenticated, seller-organization scoped and read from the platform ledger. The seller UI must never calculate authoritative payable balances from browser order data or local storage.

| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/seller/finance/summary | Read seller-scoped gross sales, fees, refunds, holds and payable balances for a date range |
| GET | /api/v1/seller/finance/ledger | Read immutable seller-visible ledger activity with cursor pagination and filters |
| GET | /api/v1/seller/finance/statements | Download or retrieve finalized seller statements |
| GET | /api/v1/seller/finance/cod/reconciliation | Read COD collection, carrier remittance batches and seller-level reconciliation |
| GET | /api/v1/seller/finance/cod/discrepancies | Read unresolved discrepancies visible to the seller |
| GET | /api/v1/seller/settlements | Read settlement batches and their line-item breakdown |
| GET | /api/v1/seller/payouts | Read payout history and provider references |
| POST | /api/v1/seller/payout-destination/verification | Begin secure payout-destination verification workflow |

### Ledger and balance invariants

- The platform ledger is double-entry and authoritative; each posted journal balances debits and credits.
- Seller-visible entries are a projection of the ledger, never a client-authored financial record.
- Order acceptance, packing, courier pickup and delivery do not by themselves create seller payout.
- Commission, tax, shipping, refunds, chargebacks, reserves, penalties and adjustments must use explicit policy codes and effective dates.
- Posted journal entries are immutable. Corrections use linked reversal or adjustment journals with actor, reason, timestamp and correlation ID.
- Every monetary value uses integer minor units and an explicit currency. TND uses a documented millime convention; never use floating-point arithmetic for authoritative balances.
- Summary totals reconcile to the ledger for the same seller, currency, filters and as-of timestamp. Pending, held, available, settled and paid amounts remain distinct.
- Seller access is scoped server-side to the authenticated organization and membership. A browser-supplied seller ID is never authorization.

### COD and carrier reconciliation

COD must distinguish order amount due, courier cash collection, carrier remittance batch, platform bank receipt, reconciliation result and seller settlement. A delivered shipment is not proof of cash collection or remittance. Each carrier batch records its carrier, batch ID, shipment references, gross amount, fees, net remittance, received date and matching status. Discrepancies record amount, age, owner, evidence and resolution state. Seller UI is read-only for carrier cash and cannot mark a batch collected or reconciled.

### Settlements and payout controls

Settlement batches snapshot eligible ledger entries, seller deductions, holds, reserve releases, fees and net payable. Payout initiation, destination changes, approval and execution are finance-controlled server workflows with step-up verification, audit events and idempotency keys. Sellers can view statuses and submit permitted support evidence; they cannot approve or execute payouts, issue refunds, modify ledger entries or override reconciliation. Bank/provider references and sensitive payout details must be masked in seller views.

### Frontend prototype boundary

The current Seller Finance workspace contains a small, explicitly illustrative sample ledger for layout demonstration only. It does not represent a seller's actual balance, commission schedule, refund liability, COD status or settlement. No payout destination, bank account, carrier, payment provider or refund execution is connected. Replace sample rows with authenticated API responses before production use.


## 14. Seller analytics and business intelligence

| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/seller/analytics/summary | Seller-scoped KPIs for a date range and comparison period |
| GET | /api/v1/seller/analytics/orders-timeseries | Time-bucketed order counts and lifecycle outcomes |
| GET | /api/v1/seller/analytics/sales-timeseries | Delivered sales, net sales and refunds from authoritative finance events |
| GET | /api/v1/seller/analytics/products | Product and variant performance, units, returns and contribution |
| GET | /api/v1/seller/analytics/fulfilment | Preparation, dispatch, delivery and cancellation performance |
| GET | /api/v1/seller/analytics/locations | Aggregated destination geography with privacy thresholds |
| GET | /api/v1/seller/analytics/export | Authorized report export with filters, timezone and generated-at metadata |

### Analytics definitions and controls

- All queries are authorized server-side against the authenticated seller organization; client-supplied seller IDs are not trusted.
- Date filters use an explicit timezone and inclusive/exclusive boundaries. Responses include an as-of timestamp, currency, timezone, applied filters and data completeness.
- Orders placed, accepted, dispatched, delivered and cancelled are distinct lifecycle measures. Delivered sales are sourced from confirmed delivery and finance rules; COD collected and carrier-remitted amounts remain separate measures.
- Gross merchandise value, seller net sales, platform fees, refunds, taxes, shipping and payable balances must not be conflated. Financial KPIs reconcile to the ledger and finance summary.
- Product ranking uses stable product/variant identifiers and defines whether ranking is by units, order lines, delivered value or net contribution.
- Conversion, traffic, advertising ROAS, profit and customer lifetime value require their own reliable event, campaign and cost sources. Do not estimate them from order data alone.
- Exports enforce seller scope, redact personal customer information by default, record audit metadata and use asynchronous jobs for large result sets.
- Low-volume geographic and customer segments require privacy thresholds; analytics must not expose another seller's or an identifiable customer's information.

### Frontend prototype boundary

The current Seller Analytics workspace reads local demo orders and matches them to the saved storefront name. It provides illustrative order counts, delivered order value, product demand and destination city breakdowns. It does not provide audited revenue, net profit, conversion, traffic, advertising performance or live carrier outcomes. Replace local data with authenticated analytics APIs before production.
