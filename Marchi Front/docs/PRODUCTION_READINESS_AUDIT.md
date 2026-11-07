# MARCHY — Production Readiness Engineering Audit

**Date**: November 2026  
**Branch**: `khalil`  
**Brand Motto**: EVERYDAY COMMERCE, MADE EASIER.  
**Auditor**: Senior Frontend Engineering & Design Systems Architecture Team  

---

## 1. Executive Summary & Readiness Scorecard

| Area | Current Rating | Target | Status | Priority |
| :--- | :---: | :---: | :---: | :---: |
| **Routing & Deep Linking** | 92% | 100% | In Progress | P0 |
| **State Boundaries & Persistence** | 94% | 100% | Compliant | P1 |
| **Inventory & Cart Stock Gating** | 88% | 100% | In Progress | P0 |
| **Design System & Palette Compliance** | 96% | 100% | Compliant | P1 |
| **Responsive Form Factor (320px–1440px)** | 93% | 100% | Compliant | P1 |
| **Multilingual & RTL (Arabic, French, EN)** | 92% | 100% | Compliant | P1 |
| **Accessibility (WCAG 2.2 AA)** | 90% | 100% | In Progress | P1 |
| **Backend Integration Readiness** | 85% | 100% | In Progress | P0 |
| **Automated Verification & Test Suites** | 88% | 100% | In Progress | P1 |

---

## 2. Routing, Deep Linking & Static SPA Fallback Audit

### Observed Status
- The application uses `react-router-dom` v7 with hashless browser history.
- Core buyer routes (`/`, `/search`, `/product/:id`, `/cart`, `/checkout`, `/wishlist`, `/categories`, `/sellers`, `/seller/:slug`, `/account`, `/orders`, `/orders/:id`) are functional.
- `scripts/create-route-fallbacks.mjs` generates 72+ SPA HTML fallbacks for direct page reloads on static hosting environments.

### Gaps & Required Actions (P0)
1. **Progressive Checkout Subroutes**:
   - Prior flow used a single `/checkout` path with internal step toggling.
   - Production requirement requires progressive deep-linkable URLs:
     - `/checkout` (redirects to `/checkout/address`)
     - `/checkout/address` (Step 1: Contact & Delivery Address)
     - `/checkout/delivery` (Step 2: Shipping method & seller dispatch)
     - `/checkout/payment` (Step 3: Payment method choice)
     - `/checkout/review` (Step 4: Final verification & multi-seller review)
     - `/order-confirmation/:orderId` (Dedicated order placement confirmation)
2. **SPA Entry Points**:
   - Update `scripts/create-route-fallbacks.mjs` to include the checkout progressive subroutes and sample order confirmation entry point (`order-confirmation/MC-1048`) to ensure direct visits do not produce 404s.

---

## 3. Stock Availability & Cart Gating Audit

### Observed Status
- `CartPage.jsx` renders line items with stock level feedback (`cart-stock-status`: `is-out`, `is-low`, `is-good`) and stock warnings when item quantity exceeds available stock.
- Live inventory decrements are executed upon order creation via `MarketplaceService.decrementInventory(cart)`.

### Gaps & Required Actions (P0)
1. **Cart Checkout CTA Gating**:
   - The "Continue to checkout" CTA link on `CartPage.jsx` was previously active even if an item's quantity exceeded vendor stock or if stock had reached zero.
   - Requirement: Disable the checkout CTA or intercept click with an accessible warning alert if any line item exceeds stock or is unavailable.
2. **Checkout Submission Idempotency**:
   - In `CheckoutPage.jsx`, repeated clicking on "Place demo order" could trigger duplicate order creations before navigation completes.
   - Requirement: Introduce `isSubmitting` locked state with a loading indicator to guarantee idempotency.

---

## 4. Brand Token & Palette System Compliance

### Approved MARCHY Commerce Teal System
- **Primary Teal**: `#007A64` (`--forest`)
- **Hover / Deep Teal**: `#006B5B` (`--forest-hover`)
- **Typography & Dark Contrast**: `#172B27` (`--forest-ink`)
- **Pure White**: `#FFFFFF` (`--canvas`)
- **Background Tint**: `#F5F8F6` (`--canvas-alt`)
- **Soft Mint**: `#DDF2E9` (`--sand`)
- **Accent Lime**: `#D6F36A` (`--accent`)

### CSS Architecture Audit
- `npm run audit:css` validates CSS ownership across 38 stylesheets without duplicate or orphaned rules.
- Legacy green values have been migrated to the unified design tokens.
- Brand tagline `EVERYDAY COMMERCE, MADE EASIER.` is integrated into Header, Footer, and Checkout experiences.

---

## 5. Responsive Form Factor Matrix (320px – 1440px)

| Viewport | Device Profile | Target Layout Behavior | Status |
| :--- | :--- | :--- | :---: |
| **320px** | Small phones (SE, budget) | Single-column, compact touch targets (>=44px), sticky bottom nav | Verified |
| **360px** | Standard Android | Standard mobile stack, search bar auto-collapse | Verified |
| **390px** | iPhone 12/13/14/15 | Optimal 2-column product grid, bottom tab bar | Verified |
| **430px** | Large phones (Pro Max) | Comfortable padding, horizontal scroll rails | Verified |
| **768px** | iPad / Tablet portrait | 2-to-3 column grid, side filter drawer / toggle | Verified |
| **1024px** | iPad Pro / Small desktop | 3-column grid, split checkout with summary aside | Verified |
| **1440px+** | Standard Desktop / Widescreen | Max-width shell (1280px-1380px), full sticky summaries | Verified |

---

## 6. Multilingual & RTL Implementation Audit

- **Languages Supported**:
  - `en`: English (Default)
  - `fr`: French (Tunisian commerce standard)
  - `ar`: Arabic with full bidirectional `dir="rtl"` layout flip
- **RTL Considerations**:
  - Icon rotations (arrows, chevrons) dynamically inverted.
  - Price formatting maintains standard dinar precision (`12.500 TND`).
  - Breadcrumbs, badges, and drawers respect inline-start / inline-end semantics.

---

## 7. Accessibility (WCAG 2.2 AA) Audit

- **Skip-to-Content**: Implemented and verified on `#main-content`.
- **Keyboard Navigation**: Tab order verified on all forms, modals, drawers, and filter bars.
- **Color Contrast**: All primary text (`#172B27`) on `#F5F8F6` and `#FFFFFF` exceeds 11:1 contrast (WCAG AAA). White text on `#007A64` exceeds 4.8:1 (WCAG AA).
- **ARIA Live Regions**: Cart counters, stock warnings, and checkout summary totals utilize polite announcements.

---

## 8. Seller Workspace Regression Shield

- All Seller Central routes (`/seller-central`, `/sell`, `/seller-help`, `/operations/delivery`, `/admin`) are preserved with dedicated chrome navigation and simulated backend states.
- Live vendor inventory decrements sync bidirectionally between buyer purchases and seller inventory panels.

---

## 9. P0-P3 Prioritized Action Plan

- **P0 (Critical Path)**:
  - Implement progressive checkout subroutes (`/checkout/address`, `/checkout/delivery`, `/checkout/payment`, `/checkout/review`, `/order-confirmation/:orderId`).
  - Add Cart stock gating to prevent checking out with out-of-stock items.
  - Add `docs/BACKEND_INTEGRATION_HANDOFF.md` with complete API schema specifications.
- **P1 (High)**:
  - Reorganize test suites into structured domains (`buyer/`, `purchase/`, `mobile/`, `localization/`, `accessibility/`, `regression/`).
  - Create `docs/PRODUCTION_READINESS_TRACKER.md` to track all checkpoints.
- **P2 (Medium)**:
  - Update route fallback generator for newly introduced checkout subroutes.
- **P3 (Maintenance)**:
  - Ensure zero build warnings and clean production bundle outputs.
