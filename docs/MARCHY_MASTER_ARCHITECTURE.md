# MARCHY Master Architecture
## Tunisia-first commerce ecosystem — product, operations, finance, technology and delivery blueprint

**Status:** Architecture baseline / decision record  
**Version:** 1.0  
**Date:** 6 November 2026  
**Initial market:** Tunisia  
**Expansion:** Design for future markets, but activate cross-border commerce only after separate legal, currency, payment, tax and logistics approval.  
**Repository scope:** Frontend architecture and backend integration contracts only. Backend implementation remains with the backend engineering team.

---

## 1. Executive direction

MARCHY is intended to become a trusted, multi-category commerce platform for Tunisia: a customer marketplace, a seller operating system, and eventually a fulfilment, logistics, advertising and retail platform.

It should take inspiration from the breadth and operational discipline of Amazon, but it must be designed around Tunisian buying and selling realities rather than copying a foreign checkout or fulfilment model.

The platform must support three distinct commercial models:

1. **Third-party marketplace:** independent merchants list and sell products through MARCHY.
2. **First-party retail:** MARCHY purchases or owns stock and sells products as the retailer.
3. **Fulfilment services:** MARCHY or a contracted fulfilment partner stores, picks, packs and dispatches seller-owned inventory under a separate service agreement.

These models must remain distinguishable in catalog, order, inventory, accounting, customer communication and reporting. A customer should still experience one coherent storefront and, where operationally supported, one combined checkout.

### Product principles

- Trust before growth: accurate product information, real seller identity, honest delivery estimates, clear return rules and reliable support.
- COD is a first-class payment workflow, not a temporary checkbox.
- Mobile-first customer experience; desktop-capable seller and operations tools.
- One source of truth for products, offers, stock, orders, payments, shipments, refunds and settlements.
- Every money movement must be traceable, reconcilable and represented in an append-only ledger.
- A parcel is not delivered because a frontend status changed; a seller is not paid because an order says delivered.
- Launch only capabilities that can be operated safely. Future modules must not be presented as live before they exist.
- Tunisia-first localization: TND, Arabic RTL, French and English, Tunisian geographic data, COD, domestic payment rails and local courier workflows.
- Demo data and simulated actions must be explicitly labelled.

### What MARCHY is not at launch

MARCHY is not initially a bank, payment institution, e-wallet or escrow provider; it is not automatically a courier or warehouse operator; it is not an international import/export marketplace; and it is not an unrestricted product-listing platform.

Use appropriately licensed payment partners and contracted carriers. The exact legal role of MARCHY in each transaction — marketplace intermediary, disclosed agent, reseller/merchant of record or another structure — must be confirmed by Tunisian legal and accounting advisers before production money flows are enabled.

---

## 2. Tunisia market design requirements

### 2.1 Payment and customer behaviour

The U.S. International Trade Administration's Tunisia eCommerce guide, published 26 February 2026, describes COD as the most common payment option, notes domestic card payment through local arrangements and identifies e-Dinar as another local instrument. It also describes restrictions affecting many cross-border online purchases. Source: https://www.trade.gov/country-commercial-guides/tunisia-ecommerce

The first release must support:

- Cash on delivery, with order confirmation and carrier cash collection tracked separately.
- Domestic online card payment through a contracted, approved local acquiring/payment provider.
- Other local payment methods only after provider contracts, technical documentation, settlement mechanics, refunds and reconciliation are confirmed.
- Payment-method availability by order, seller, delivery region and provider capability.
- Payment pending, success, failure, reversal, refund and dispute states.
- Clear customer communication about whether an order is paid online or due at delivery.

Do not hard-code one payment gateway or assume a provider supports marketplace split payments. Verify merchant onboarding, refunds, settlement reports, chargebacks, sub-merchant support and commercial terms before integration.

### 2.2 COD is a workflow, not a payment label

A COD order has separate events:

1. Customer submits an order and chooses COD.
2. MARCHY validates the order and seller acceptance rules.
3. Seller prepares the parcel.
4. Carrier accepts the parcel and records custody.
5. Carrier attempts delivery.
6. Customer pays the carrier at delivery.
7. Carrier records collected cash against the shipment.
8. Carrier remits funds under its contract and remittance schedule.
9. MARCHY reconciles the remittance against delivered shipments and collection records.
10. The platform calculates seller payable, commissions, shipping charges, adjustments and approved reserves.
11. Seller payout is released under the approved settlement policy.

Steps 5, 6, 8 and 11 are not the same event. A carrier status of delivered does not prove cash was remitted or the seller was paid.

### 2.3 Delivery geography

Model Tunisian geography as structured, versioned data:

- Country
- Governorate
- Delegation or locality where supported
- City, town or locality
- Postal code, optional where unavailable or unreliable
- Address line, building, floor, landmark and delivery instructions
- Customer contact phone and optional alternate phone

Delivery coverage, fees, estimated windows, COD availability, remote-area surcharges and carrier service levels must be configurable by provider and geographic zone. Do not embed delivery prices or coverage assumptions in UI components.

Keep the original customer-entered address snapshot on each order for audit, even if the saved address is later edited.

### 2.4 Language, currency and display

Required at launch:
- Arabic with true RTL layout.
- French and English.
- TND as the initial transaction currency.
- Localized date, number, phone and address formatting.
- Language-specific product content with predictable fallback.
- Money stored as integer minor units or exact decimal values with explicit currency. Never use binary floating-point as the financial source of truth.
- No silent currency conversion or approximate exchange rate presented as a payable amount.

### 2.5 Legal and compliance baseline

The Tunisian Ministry of Trade's e-commerce overview lists, among other applicable frameworks, Law No. 2000-83 of 9 August 2000 on electronic exchanges and commerce, distribution law, consumer protection law and competition/pricing legislation: https://commerce.gov.tn/presentation-de-lenvironnement-du-e-commerce-en-tunisie_11_187

TUNTRUST identifies Law No. 83-2000 and related electronic-exchange instruments in its legal framework: https://ance.tn/fr/content/cadre-legal

This is an architecture document, not a legal opinion. Before launch, Tunisian counsel and an accountant must verify:
- Current consolidated laws and implementing rules.
- Marketplace/intermediary versus first-party retail obligations, contracts and disclosures.
- Seller eligibility, business registration and tax documentation.
- Consumer information, pricing, delivery, cancellation, returns, warranty and complaint obligations.
- Invoicing, VAT, withholding, accounting and record-retention treatment.
- Personal-data processing, consent, access, retention, transfers and security obligations.
- Electronic signature, proof of consent and order confirmation requirements.
- Restricted, regulated, counterfeit or unsafe goods policy.
- Advertising, sponsored placement and price-promotion rules.

Do not infer a tax rate, withholding rate, payout restriction or licence requirement from a blog or old implementation. Configure such rules only after a qualified adviser confirms the rule and effective dates. Record the source, approval owner and effective dates.

---

## 3. Business model and revenue architecture

| Revenue stream | Description | Priority |
|---|---|---|
| Marketplace commission | Percentage or fixed fee on eligible third-party sales | Core |
| Seller service fees | Optional operational services with disclosed pricing | Later |
| Fulfilment fees | Storage, pick/pack, handling and related services | Later |
| Delivery margin | Only where contractually and legally appropriate | Validate |
| First-party retail margin | Retail revenue less inventory cost | Controlled pilot |
| Seller subscriptions | Paid seller plans with defined entitlements | Later |
| Sponsored products | Paid placements with transparent sponsored labels | Later |
| Promotions | Seller-funded vouchers or campaign services | Later |

### 3.1 Commission engine

Commission must be rule-driven, versioned and effective-dated. Rules may vary by category, seller plan, seller agreement, commercial model, product exception or date range.

Each order line snapshots the applied rule and calculation inputs at purchase time. Changing a rule must not rewrite historical order economics.

A rule defines:
- Calculation basis.
- Percentage and/or fixed component.
- Minimum or maximum where applicable.
- Discount funding responsibility.
- Treatment of shipping, COD fee and tax.
- Rounding policy.
- Refund and reversal behaviour.
- Effective-from and effective-to timestamps.

The frontend must not calculate final seller earnings. It may display a backend-provided estimate, labelled as estimated until settlement.

### 3.2 Seller plans

Future subscription plans may control listing limits, staff seats, analytics depth, promotional tools or fulfilment options. A paid plan must not imply guaranteed sales or guaranteed visibility. Entitlement checks belong on the backend; hiding a button is not authorization.

### 3.3 First-party retail separation

A MARCHY-owned product offer must have MARCHY as seller of record for that offer, its own inventory owner and stock ledger, purchase cost/landed-cost record, pricing and margin reporting, supplier and purchase-order records, and distinct return, warranty and accounting responsibility.

A catalog product may have one MARCHY offer and multiple third-party seller offers. The catalog product is not the seller offer.

---

## 4. Core platform domains

These are logical boundaries. The backend may begin as a modular monolith; do not force microservices before scale and team ownership justify them.

### 4.1 Customer Store

Capabilities:
- Home, discovery, departments, category pages and collections.
- Search, autocomplete, filters, sort and pagination.
- Product detail with variants, specifications, images and seller offers.
- Seller storefront and profile.
- Compare, wishlist and recently viewed.
- Cart with seller-aware line items.
- Checkout with address, delivery option and payment method.
- Order confirmation, history and tracking.
- Returns, refunds and support.
- Product questions, reviews and ratings.
- Account, addresses, communication preferences and privacy controls.

The customer sees one coherent cart, but fulfilment and seller responsibilities remain visible where relevant. A multi-seller cart may create one parent checkout and multiple seller fulfilment orders. Explain split parcels, shipping fees and delivery windows before submission.

### 4.2 Seller Central

Capabilities:
- Application and onboarding.
- Business identity and verification status.
- Store profile, contacts and policies.
- Staff and role assignment.
- Product listing and catalog matching.
- Offer price, condition, SKU and availability.
- Inventory and stock movement.
- Order acceptance/rejection with reason, preparation and dispatch.
- Shipping label/pickup request where supported.
- Returns, customer questions and support.
- Promotions and coupons.
- Sales, order, return and inventory analytics.
- Payout statements and transaction history.

Seller onboarding states: draft, submitted, under review, approved, rejected, needs information, suspended or closed.

A seller must not publish offers, receive orders or request payouts until backend eligibility checks pass. Verification requirements depend on approved legal and commercial policy.

### 4.3 Catalog and offer management

Separate four concepts:

1. **Catalog product:** canonical identity, title, brand, category, attributes, media and normalized specifications.
2. **Variant:** purchasable variation such as size, colour, capacity or model.
3. **Seller offer:** seller-specific SKU, price, condition, stock availability, fulfilment method, lead time and sales status.
4. **Inventory item:** physical or logically allocated quantity at a specific owner/location.

A seller may propose a new catalog product or match an existing one. Duplicate matching should use GTIN/EAN/UPC where available, brand, model and normalized attributes. Do not merge products solely because titles look similar.

Catalog moderation: draft, submitted, approved, needs changes, rejected, archived.  
Offer lifecycle: draft, active, paused, out of stock, suppressed, closed.

### 4.4 Order orchestration

Use a parent customer order and child seller fulfilment orders when checkout contains multiple sellers or fulfilment nodes.

Core records:
- Checkout session: temporary expiring quote and selections.
- Customer order: customer's commercial purchase and total.
- Seller order: fulfilment and seller responsibility partition.
- Order line: product, variant, offer, seller, quantity and immutable price snapshot.
- Shipment: physical parcel and carrier tracking.
- Payment transaction: online collection attempt or COD collection record.
- Refund: approved reversal amount and reason.
- Settlement: seller payable calculation and remittance.
- Support case: customer/seller issue linked to relevant entities.

Order lifecycle (high-level): pending confirmation, confirmed, processing, partially shipped, shipped, partially delivered, delivered. Exceptional states include cancelled, rejected, delivery failed, returned, partially returned, refunded, partially refunded and disputed.

Do not use one status field to represent order, payment, shipment and refund. They are separate state machines.

### 4.5 Inventory and reservations

Track inventory per SKU/variant, seller, owner and location.

Minimum quantity model:
- on hand;
- reserved;
- available to sell;
- damaged;
- in transit;
- returned pending inspection.

The backend owns the available-to-sell calculation. Checkout must reserve stock atomically with expiry, create the order only after successful submission, consume or release reservation according to payment/order outcome, and reconcile stock on dispatch, cancellation, return and damage inspection.

For COD, reservation still expires if the customer does not complete order confirmation within the configured window.

Inventory adjustments require reason, actor, timestamp, source and audit trail. No silent stock edits.

### 4.6 Logistics and fulfilment

Support:
- Seller fulfilled: seller stores, packs and hands over the parcel.
- MARCHY/partner fulfilled: seller-owned stock is stored and fulfilled by MARCHY or an authorized partner under contract.
- MARCHY retail fulfilled: MARCHY-owned stock is fulfilled by MARCHY or a partner.
- Supplier/direct fulfilment only if separately approved and operationally supported.

Carrier integration abstraction:
- Serviceability and zone coverage.
- Rate quote.
- Pickup scheduling.
- Shipment creation and label.
- Tracking events.
- Delivery attempts and proof.
- COD amount collected.
- COD remittance report.
- Return-to-origin.
- Claims and lost/damaged parcel workflow.

Retain provider event ID, raw payload reference, received timestamp, normalized event and processing result. Webhooks must be authenticated, idempotent and replay-safe.

Operations queues:
- Awaiting seller acceptance.
- Awaiting preparation.
- Ready for pickup.
- Picked up/in transit.
- Out for delivery.
- Delivery attempted.
- Delivered.
- Failed/return to origin.
- COD remittance outstanding.
- Shipment exceptions.

### 4.7 Financial operations

This is a critical platform domain, not a dashboard decoration.

#### Double-entry ledger

Every posted financial event creates balanced journal entries. The ledger is append-only: corrections use reversing/adjusting entries, never edits to posted entries.

Core entities:
- Chart of accounts.
- Journal and journal lines.
- Financial event.
- Payment transaction.
- Refund.
- Seller payable.
- Seller settlement and payout.
- Carrier remittance.
- Gateway settlement.
- Fee/commission rule.
- Reconciliation batch and discrepancy.

Each journal line includes amount, currency, account, debit/credit side, entity references, effective date, posting date, source event, idempotency key and actor/system identity.

Illustrative account families, subject to accountant approval:
- Payment provider clearing.
- COD carrier clearing.
- Cash/bank.
- Customer refund payable.
- Seller payable.
- Marketplace commission revenue.
- Delivery/handling revenue.
- Payment processing expense.
- Carrier delivery expense.
- Refund/claims expense.
- Inventory asset and cost of goods sold for first-party retail.
- Tax payable/receivable where applicable.

Exact postings depend on MARCHY's legal role, provider contracts and accounting policy. The illustrative list is not final accounting advice.

#### Seller payable

Seller payable is not simply order value minus commission. It may include item revenue due to seller, seller-funded and MARCHY-funded discounts, commission, delivery fees/subsidies, COD collection fee, contractually chargeable processing fees, refund/return/claim adjustments, approved reserves and prior balance adjustments.

Each component must be explicit and visible in a seller statement.

#### COD reconciliation

Reconcile by shipment reference, carrier, seller order, expected COD, actual collected amount, carrier deductions, remittance batch, remitted amount, remittance date, variance and dispute status.

Never mark COD as remitted because a shipment is delivered. Unmatched cash remains in a clearing/discrepancy workflow until resolved.

#### Online payment reconciliation

For each gateway retain payment intent/reference, order allocation, authorization/capture status, gross amount, gateway fee, net settlement, settlement batch, refunds/reversals, chargebacks/disputes and reconciliation status.

Do not store card PAN or CVV. Use provider-hosted checkout, tokenization or approved hosted fields. Minimize PCI scope and follow provider integration requirements.

#### Seller payout

Payout lifecycle: calculated, pending review, approved, submitted, processing, paid. Exceptional states: failed, reversed, held or cancelled.

Eligibility considers seller verification and destination verification, delivered/settled order status, return/refund window and reserve policy, unresolved disputes, actual carrier/gateway remittance, minimum threshold, schedule/cut-off and approved risk holds.

Seller sees opening balance, earned amount, fees, adjustments, holds, payout and closing balance. A failed payout must be retryable without duplicate payment.

#### Financial safety

- No frontend-created balances.
- No manual database balance overwrite.
- No payout without maker-checker approval and audit.
- Idempotency for payment, refund and payout commands.
- Daily reconciliation for every payment provider and carrier.
- Exception queues with owner, age, amount at risk and resolution notes.
- Role-based access to sensitive financial data.
- Currency explicit on every financial record.
- Financial exports access-controlled and audited.

### 4.8 Customer support, returns and disputes

Support capabilities:
- Help centre and searchable policies.
- Customer support case creation.
- Controlled seller/customer messaging.
- Internal notes not visible to customers.
- Evidence uploads with malware and size controls.
- SLA, assignment and escalation queues.
- Return authorization and status tracking.
- Refund decision and execution.
- Delivery failure and damaged parcel claims.

Return lifecycle: requested, under review, approved/rejected, label or pickup pending, in transit, received, inspected, refund or replacement, closed.

Return rules must be configurable by category, seller agreement, condition and applicable law. A refund request is not a completed refund; the UI must wait for backend/payment-provider confirmation.

### 4.9 Reviews, questions and trust

- Only eligible purchasers can submit verified-purchase reviews.
- Moderation preserves audit history and reason codes.
- Product and seller ratings are separate.
- Incentives, if any, are disclosed and policy-compliant.
- Product Q&A identifies seller or MARCHY as answer source.
- Trust indicators use defined measurable criteria.
- Never fabricate review counts, performance, delivery promises or verification badges.

### 4.10 Advertising and merchandising

Future sponsored products require seller campaigns, budgets, bids/pricing model, schedule, placement, targeting eligibility, impression/click/conversion events, spend ledger, billing statement and invalid-traffic controls.

Sponsored placements must be visibly labelled and distinguishable from organic ranking. Do not launch paid ads before event accounting, budget caps, billing, credits and reporting are reliable.

### 4.11 Administration and trust operations

Admin capabilities:
- Seller review/suspension.
- Catalog moderation.
- Order exception handling.
- Carrier and payment reconciliation.
- Returns and disputes.
- Commission and fee configuration.
- Payout approval.
- Promotion approval.
- User and role management.
- Audit, security, operational dashboards and exports.

Separate roles: support agent, seller reviewer, catalog moderator, fulfilment operator, finance analyst, payout approver, finance administrator, platform administrator and security/audit reviewer.

High-risk operations require maker-checker approval. No one person should be able to create a payout destination, approve a payout and execute it without independent controls.

---

## 5. Shared data model

This is a logical model, not a mandate for one physical schema.

### Identity and organization
- users
- customer_profiles
- seller_organizations
- seller_memberships
- seller_verification_cases
- seller_documents
- roles
- permissions
- role_assignments
- addresses
- consents
- audit_events

A user can be a customer and a member of one or more seller organizations. Seller staff roles are organization-scoped.

### Catalog
- categories
- brands
- catalog_products
- product_attributes
- product_attribute_values
- product_media
- product_variants
- product_identifiers
- catalog_moderation_cases
- seller_offers
- seller_offer_prices
- seller_skus

### Inventory
- inventory_locations
- inventory_items
- inventory_balances
- inventory_reservations
- inventory_movements
- stock_adjustments
- purchase_orders
- goods_receipts

### Commerce
- carts and cart_lines
- checkout_sessions
- checkout_quotes
- customer_orders
- seller_orders
- order_lines
- order_status_events
- discounts
- promotions
- promotion_redemptions
- tax_calculation_snapshots

### Payments and finance
- payment_intents
- payment_transactions
- payment_provider_events
- refunds
- chargebacks
- chart_of_accounts
- journals
- journal_lines
- seller_payables
- settlement_batches
- seller_settlements
- payout_destinations
- payouts
- carrier_cod_collections
- carrier_remittances
- gateway_settlements
- reconciliation_batches
- reconciliation_items
- financial_adjustments

### Logistics
- carriers
- carrier_services
- delivery_zones
- shipping_quotes
- shipments
- shipment_packages
- shipment_events
- pickup_requests
- delivery_attempts
- proof_of_delivery
- return_shipments
- carrier_invoices

### Support and trust
- support_cases
- support_messages
- internal_notes
- case_attachments
- return_requests
- return_items
- product_reviews
- seller_reviews
- product_questions
- moderation_actions
- fraud_risk_signals

### Growth and analytics
- seller_subscriptions
- subscription_plans
- subscription_entitlements
- ad_campaigns
- ad_creatives
- ad_events
- notification_preferences
- notifications
- analytics_events

### Data invariants

1. Every seller offer references exactly one seller organization and one catalog product/variant.
2. Every order line snapshots seller, offer, product title, selected variant, SKU, quantity, unit price, discount allocation, tax treatment and currency.
3. Every stock movement has reason, source, actor and timestamp.
4. Every payment, refund and payout command has an idempotency key.
5. Every financial posting balances by currency and journal.
6. Every shipment references its fulfilment responsibility and the order lines it carries.
7. A seller payout references settlement lines and cannot exceed eligible payable.
8. Status history is append-only; current status is a projection of validated events.
9. Customer-entered address snapshots on an order are immutable.
10. Preserve financial/order records where retention obligations require it; use controlled anonymization where legally appropriate.

---

## 6. Backend API and integration contract

The frontend consumes documented backend contracts. It must not treat local mock arrays as production data.

### API conventions

- Versioned REST API initially, for example /api/v1.
- JSON schemas and shared/generated types.
- Secure server-managed sessions or an approved token strategy.
- Every resource endpoint enforces ownership and permissions server-side.
- Stable cursor pagination for large lists.
- Explicit, validated filters and sorting.
- Money returned as an exact amount and currency, e.g. amount_minor plus currency TND.
- ISO 8601 UTC timestamps; frontend localizes display.
- Mutating commands accept an Idempotency-Key.
- Stable error structure: code, message, field_errors, request_id.
- Documented rate limits and retry guidance.
- Sensitive fields omitted unless the caller's role requires them.

### Core endpoint groups

| Domain | Example endpoints |
|---|---|
| Identity | POST /auth/login, POST /auth/logout, GET /me, GET /me/permissions |
| Catalog | GET /catalog/products, GET /catalog/products/{id}, GET /categories |
| Offers | GET /products/{id}/offers, POST /seller/offers, PATCH /seller/offers/{id} |
| Search | GET /search?q=... |
| Checkout | POST /checkout/quote, POST /checkout/reservations, POST /orders |
| Orders | GET /me/orders, GET /orders/{id}, POST /seller/orders/{id}/accept |
| Inventory | GET /seller/inventory, POST /seller/inventory/adjustments |
| Shipping | GET /shipping/quotes, POST /shipments, GET /shipments/{id}/tracking |
| Payments | POST /payment-intents, GET /payments/{id} |
| Returns | POST /orders/{id}/returns, GET /returns/{id} |
| Seller finance | GET /seller/finance/summary, GET /seller/settlements, GET /seller/payouts |
| Support | POST /support/cases, GET /support/cases/{id}, POST /support/cases/{id}/messages |
| Admin | Role-protected /admin endpoints with audited commands |

These are proposed contract examples, not claims that endpoints exist today.

### Checkout quote

Frontend sends cart lines with offer/variant identifiers and quantity, selected delivery address, delivery service preference, payment method and coupon/promotion code.

Backend returns validated lines and current prices, availability, per-seller subtotal, discount allocation/funding, shipping by parcel/seller, applicable confirmed taxes/fees, payment method availability, delivery estimate and caveats, total payable, quote expiry and validation errors.

The frontend displays the returned quote. It must not calculate the authoritative payable total.

### Order creation

Order creation references a valid unexpired quote or equivalent server-validated checkout context. Backend atomically validates customer, offer, price and quantity; reserves stock; validates delivery and payment method; creates customer order, seller orders and order lines; creates payment intent or COD obligation; snapshots price and policy; and emits events through a reliable outbox.

The client receives an order reference and next action. It must not create production orders solely in localStorage.

### Event contracts

Events should be versioned and include event ID/type, occurrence time, aggregate ID/version, correlation ID, causation ID and payload schema version.

Initial events:
- seller.application_submitted
- seller.approved
- catalog.product_submitted
- catalog.product_approved
- offer.activated
- inventory.reserved
- inventory.released
- order.created
- seller_order.accepted
- seller_order.rejected
- shipment.created
- shipment.picked_up
- shipment.delivery_attempted
- shipment.delivered
- shipment.returned_to_origin
- payment.succeeded
- payment.failed
- cod.collected
- carrier.remittance_received
- refund.approved
- refund.succeeded
- seller_settlement.calculated
- seller_payout.submitted
- seller_payout.paid
- support.case_opened

Consumers are idempotent. Use a transactional outbox after database commits. External webhooks must be verified, deduplicated and replay-safe.

### Frontend demo-to-production boundary

- Define service interfaces for each domain.
- Keep mock adapters for local development and API adapters for production.
- Select adapters through environment/configuration.
- Never mix mock and live records without a visible label.
- Remove simulated success states from production paths.
- Preserve loading, empty, error, retry and permission-denied states.
- Add contract tests against backend staging.

A UI action is production-ready only when backend command, authorization, persistence, audit, failure handling and user feedback exist.

---

## 7. Security, privacy and reliability

### Access control

Use least privilege and server-side authorization:
- Customers access their own account, orders, addresses and cases.
- Sellers access only their organization and authorized staff scope.
- Support agents see information needed for assigned cases.
- Finance roles separate read, approve and execute.
- Admins use MFA and audited privileged sessions.
- Service accounts use scoped credentials and rotation.

### Personal data

Collect only data needed to fulfil the transaction and meet legal obligations. Define purpose/legal basis, consent records where required, retention schedule, export/correction/deletion process, access logging, encryption, attachment controls, vendor/subprocessor register and breach response.

Do not expose seller/customer phone numbers or addresses to unrelated users. Mask sensitive information when full detail is not required.

### Application security

- Validate inputs server-side.
- Protect against XSS, CSRF, injection, IDOR and privilege escalation.
- Secure file uploads and scan for malware.
- Rate-limit login, OTP, checkout, review and messaging.
- Never store secrets in frontend environment variables.
- Use CSP and secure headers.
- Protect webhook endpoints with signatures and replay protection.
- Do not log passwords, card data or unnecessary personal data.

### Reliability and observability

Use request/correlation IDs, structured logs, error monitoring and metrics for checkout conversion, payment failures, order confirmation, delivery success, RTO, COD remittance delay, refunds, seller cancellations and payout ageing.

Alert on stuck orders, unmatched COD, payout failures, inventory oversell and webhook backlog. Backups, restore procedures, recovery objectives and graceful provider-outage behaviour must be documented and tested.

---

## 8. Frontend application architecture

The current frontend uses React 18, Vite 6 and React Router 7. Evolve the existing investment toward domain-oriented feature modules; do not rewrite without evidence.

Recommended target organization:

- app: route tree, app shell, guards and error boundaries
- components/ui: accessible primitives
- components/layout: buyer, seller and admin shells
- domains/identity
- domains/catalog
- domains/search
- domains/offers
- domains/cart
- domains/checkout
- domains/orders
- domains/inventory
- domains/fulfilment
- domains/logistics
- domains/payments
- domains/finance
- domains/returns
- domains/support
- domains/reviews
- domains/promotions
- domains/advertising
- domains/analytics
- domains/administration
- services/api: HTTP client, auth/session and error normalization
- services/adapters: mock and live adapters
- hooks, i18n, styles, utils and shared types

This is a target direction, not a mandate to move every file immediately. Migrate one domain at a time with tests and no broken routes.

### Shared shells

- Store shell: buyer navigation, search, cart, account, language and theme.
- Seller Central shell: seller navigation, organization switcher, order/inventory alerts and help.
- Operations shell: queues, filters, exception handling and task ownership.
- Finance shell: balances, reconciliation, settlement and payout controls with stricter permissions.
- Admin shell: system-wide control plane, audit and configuration.

Hiding an admin link is not authorization. Backend permissions must enforce access.

### State ownership

- Server state: products, offers, stock, orders, shipments, payments, finance and support.
- Client state: open menu, selected tab, temporary filters and unsaved form input.
- Persisted preferences: wishlist/cart where supported, locale and theme.
- Never persist authoritative inventory, order status, payment state or seller balance as localStorage truth.
- Optimistic updates only for reversible low-risk interactions.
- For money, stock and order mutations, wait for server confirmation.

### Design system

Continue MARCHY's premium minimal direction:
- Consistent spacing, typography, semantic colours, radius and elevation tokens.
- Status labels that do not rely on colour alone.
- Accessible keyboard and screen-reader support.
- Loading skeletons and useful empty states.
- Responsive data tables that become readable cards on small screens.
- Arabic RTL tested at every breakpoint.
- Light and dark themes.
- Consistent date, currency and number formatting.
- No fake chart data in production.

### Proposed route map

**Store:** /, /search, /category/:slug, /product/:slug, /seller/:slug, /cart, /checkout, /orders, /orders/:id, /account, /wishlist, /help, /returns.

**Seller Central:** /seller, /seller/onboarding, /seller/products, /seller/products/new, /seller/inventory, /seller/orders, /seller/orders/:id, /seller/promotions, /seller/analytics, /seller/finance, /seller/settings, /seller/team.

**Operations/Admin:** /operations/orders, /operations/shipments, /operations/returns, /operations/sellers, /operations/catalog, /operations/reconciliation, /admin/users, /admin/roles, /admin/commissions, /admin/audit, /admin/configuration.

These are proposed information architecture. Introduce routes only with complete permissions, states and working flows.

---

## 9. Launch strategy and phased delivery

Do not launch every Amazon-like capability at once. Build a reliable commerce core, prove unit economics and operations, then expand.

### Phase 0 — Decisions and operating readiness
- Confirm legal entity and marketplace role.
- Confirm intermediary/agent/reseller role by transaction type.
- Confirm seller onboarding documents and tax requirements.
- Obtain payment provider and carrier proposals/contracts.
- Define commission, shipping, return, refund and payout policies.
- Approve chart of accounts and accounting treatment with accountant.
- Select initial categories and prohibited/restricted goods policy.
- Define support ownership and escalation.

**Exit:** signed-off business rules, legal review, provider capability matrix and operating procedures.

### Phase 1 — Trustworthy marketplace MVP
- Customer catalog, search, product page and seller offers.
- Seller onboarding and listing review.
- Cart and multi-seller checkout.
- COD with seller acceptance and carrier workflow.
- One domestic online payment integration only if provider onboarding, refunds and reconciliation are ready.
- Carrier-event-based order tracking.
- Basic support, cancellation and return request.
- Seller order and inventory workspace.
- Admin seller/catalog/order exception queues.
- Financial event records and daily reconciliation, even if payouts initially use a controlled finance process.

**Exit:** orders can be placed, fulfilled, delivered, reconciled and supported without spreadsheets being the only source of truth.

### Phase 2 — Operational control
- Carrier integrations, labels and pickup workflows.
- Automated COD collection/remittance reconciliation.
- Seller statements and controlled payouts.
- Returns inspection, refunds and claims.
- Inventory reservation and oversell protection.
- Seller performance and operations analytics.

**Exit:** operations and finance can reconcile orders, parcels, cash and seller obligations.

### Phase 3 — Seller ecosystem
- Seller staff roles and multi-user organizations.
- Bulk product import and catalog matching.
- Promotions, coupons and seller-funded discounts.
- Improved search, ranking and merchandising.
- Seller subscriptions only when value and entitlements are proven.

### Phase 4 — Fulfilment and first-party retail
- Warehouse/location inventory.
- Inbound purchase orders and goods receiving.
- Pick/pack/dispatch and returns processing.
- First-party procurement, landed cost and margin accounting.
- Multi-node inventory and fulfilment routing.

### Phase 5 — Advertising, intelligence and expansion
- Sponsored products with auditable billing.
- Demand and stock forecasting.
- Fraud/risk signals and operational automation.
- Additional markets only after separate payment, currency, tax, consumer-law and logistics validation.

---

## 10. MVP acceptance criteria

Screens alone do not constitute completion.

### Buyer
- Browse, search, compare offers and view accurate seller/stock/delivery information.
- Submit multi-seller cart and see parcel/fee implications.
- Checkout quote and final total are server-authoritative.
- COD and online payment states are distinct.
- See real order and carrier events.
- Request cancellation/return and see actual decision/status.
- Arabic RTL, French and English work on mobile and desktop.

### Seller
- Apply, submit required documents and see verification status.
- Approved seller can create/match catalog product and publish offer.
- Update stock with audited movements.
- Accept/prepare orders and receive carrier handoff instructions.
- See order economics and statements with pending vs paid clearly separated.
- Cannot access another seller's data.

### Operations and finance
- Triage orders, delivery exceptions, returns and support.
- Reconcile carrier COD collections to remittance batches.
- Reconcile online settlements to provider reports.
- Derive seller payable from immutable order and financial events.
- Payouts require approval, idempotency and end-to-end traceability.
- Audit privileged changes.
- Export reports with controlled permissions.

### Engineering
- Automated tests cover checkout, inventory reservation, multi-seller orders, COD, payment failure, refunds, returns, reconciliation and seller authorization.
- Monitoring detects stuck orders, failed webhooks, unmatched remittances and payout failures.
- Backup restore and incident procedures are tested.
- No production path reports success from a mock adapter.

---

## 11. Risks and controls

| Risk | Tunisia relevance | Control |
|---|---|---|
| COD refusal / failed delivery | Delivery and reverse logistics can consume margin | Order confirmation, clear product data, address validation, seller acceptance and RTO analytics |
| Carrier cash mismatch | Delivery and cash remittance are separate | Shipment-level COD ledger, remittance batches and discrepancy queue |
| Low customer trust | Product quality, delivery and refunds influence purchase confidence | Seller verification, accurate media/specs, transparent policies and support |
| Seller stock inaccuracy | Causes cancellations and broken delivery promises | Atomic reservations, stock movements and seller performance |
| Thin margins | Commission may not cover payment, support and delivery costs | Contribution margin per delivered order by category/seller |
| Unclear legal role | Affects contracts, invoicing, obligations and money flow | Legal review before production payments and payouts |
| Provider limitations | Split payments, sub-merchants or refunds may not be supported | Provider capability matrix and contract validation |
| Counterfeit/unsafe goods | Customer harm and reputation risk | Seller verification, listing moderation and restricted-goods policy |
| Overbuilding | Modules can outpace operating readiness | Phase gates and measurable exit criteria |

---

## 12. Metrics that matter

**Marketplace:** GMV, net merchandise value after cancellations/returns, orders, delivered orders, active buyers, repeat purchase, active sellers, seller activation, catalog coverage and in-stock rate.

**Conversion and trust:** search-to-product click-through, product-to-cart conversion, checkout completion, COD confirmation, online payment success, cancellation/return rate, verified review rate and support contact rate.

**Logistics:** seller acceptance time, preparation time, pickup lead time, on-time delivery, first-attempt success, failed delivery/RTO, COD remittance delay and shipment loss/damage.

**Financial:** contribution margin per delivered order, commission revenue, payment/carrier costs, COD discrepancy value and ageing, refund/chargeback rate, seller payable ageing, payout failure and first-party stock ageing/margin.

**Seller:** order acceptance, cancellation, stock accuracy, late dispatch, return/dispute rate, response time and policy violations.

Do not optimize GMV alone. A high-GMV marketplace that loses money on every delivered order is not healthy.

---

## 13. Decisions required before backend implementation

These are intentionally OPEN and must be resolved by the named owner before production enablement.

| Decision | Owner | Evidence required |
|---|---|---|
| Legal role per transaction type | Founder + Tunisian counsel | Written legal opinion and contract model |
| Seller eligibility and documents | Operations + counsel | Approved onboarding checklist |
| Tax, invoice and withholding treatment | Accountant + counsel | Written accounting/tax policy |
| Payment provider and merchant structure | Finance + backend | Provider documentation, contract and test credentials |
| Marketplace split payment support | Finance + provider | Explicit provider confirmation |
| COD carrier fees/remittance schedule | Operations + finance | Signed carrier terms and sample reports |
| Commission basis and category rates | Founder + finance | Approved commercial schedule |
| Refund/return rules by category | Operations + counsel | Published policy and workflow |
| Seller payout frequency/reserves | Finance + counsel | Approved settlement policy |
| First-party inventory pilot | Founder + finance + operations | Working capital, procurement and warehouse plan |
| Data retention and privacy schedule | Counsel + security | Approved data map and retention schedule |
| Restricted product catalogue | Operations + counsel | Approved product policy |

---

## 14. Immediate implementation order for the existing frontend

The repository already contains meaningful buyer, seller and operations screens, including product offers, seller-aware cart lines, checkout, orders, tracking, account, wishlist, notifications and initial operations views. These are a prototype foundation, not a complete production commerce backend.

Next frontend work, in order:

1. **Domain contracts and adapter boundaries:** separate mock data from API services; define money, products, offers, stock, checkout quotes, orders, shipments and permissions.
2. **Unified role-aware shell:** Store, Seller Central, Operations and Admin share the design system but expose only authorized workspaces.
3. **Seller onboarding and verification UX:** document submission, review states, missing information and approval.
4. **Seller catalog and offer lifecycle:** product matching, variants/SKU, offer price, stock and moderation.
5. **Seller order management:** accept/reject, preparation, dispatch and exception reasons.
6. **Operations shipment and COD reconciliation:** distinguish delivery from collection and remittance.
7. **Seller finance statements:** estimated earnings, pending payable, settled and paid amounts must come from backend contracts.
8. **Returns and support case management.**
9. **Admin permission, audit and configuration views.**
10. **Replace demo adapters incrementally after backend staging contracts are available.**

### Frontend non-negotiables

- No backend code is changed as part of this work.
- No deployment unless separately requested.
- All repository work stays on branch khalil.
- No fake payment success, payout claims, invented carrier tracking or fabricated seller balances.
- Demo screens visibly identify simulated data and local-only actions.
- Every module includes loading, empty, error, permission-denied and mobile states.
- Business-critical interactions have automated tests before completion.

---

## 15. Reference sources

These sources inform Tunisia-specific design assumptions. They are not a substitute for legal, tax or provider advice.

1. U.S. International Trade Administration, **Tunisia — eCommerce**, last published 26 February 2026. Domestic payment context, COD, e-Dinar, local market and cross-border constraints.  
   https://www.trade.gov/country-commercial-guides/tunisia-ecommerce
2. Tunisian Ministry of Trade, **Presentation of the e-commerce environment in Tunisia**. Legal framework cited for electronic commerce, distribution, consumer protection and competition/pricing.  
   https://commerce.gov.tn/presentation-de-lenvironnement-du-e-commerce-en-tunisie_11_187
3. TUNTRUST / National Electronic Certification Agency, **Legal framework**. Law No. 83-2000 and related electronic-exchange instruments.  
   https://ance.tn/fr/content/cadre-legal
4. Tunisian legal text reference, **Law No. 2000-83 of 9 August 2000**. Verify current consolidated text and official Journal Officiel publication before relying on a specific provision.  
   https://www.lois.tn/doc/17578

---

## 16. Definition of success

MARCHY succeeds when a Tunisian customer can confidently discover, order, receive, return and get support for a product; a Tunisian seller can reliably list, sell, fulfil and understand their earnings; and MARCHY's operations and finance teams can reconcile every order, parcel, payment, COD collection, refund and seller payout.

The ambition is Amazon-scale breadth over time. The first proof is much more focused: **a trustworthy Tunisian marketplace whose commerce and cash operations actually work.**
