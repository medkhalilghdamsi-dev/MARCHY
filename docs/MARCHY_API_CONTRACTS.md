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
