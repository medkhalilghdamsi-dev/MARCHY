# MARCHY — Frontend Architecture

**Scope:** React frontend only. Work on branch `khalil`. Backend services and API contracts are intentionally outside this architecture map.

## Stack

- React 18, JavaScript/JSX, Vite 6
- React Router 7
- Plain CSS, imported through one global entry point
- Playwright for end-to-end tests

## Runtime flow

`src/main.jsx` mounts `BrowserRouter`, `MarketplaceProvider`, `ToastProvider`, and the root app.

`src/App.jsx` is intentionally tiny and re-exports the application shell.

`src/app/MarketplaceApp.jsx` owns only application-level concerns: language direction, scroll reset, page-title orchestration and the route-level error boundary.

`src/app/routes.jsx` owns the route tree and lazy page loading.

Route layouts own persistent chrome:
- `src/app/layouts/MarketplaceLayout.jsx` — buyer/public marketplace chrome
- `src/app/layouts/SellerPortalLayout.jsx` — seller portal chrome
- `src/app/layouts/AuthLayout.jsx` — authentication surface without marketplace chrome

This uses React Router's nested layout model so persistent UI is defined once and route pages stay focused on page content.

## Source ownership

```text
src/
├── app/                    # Application shell and routing
│   ├── layouts/            # Persistent route-level chrome
│   ├── routes.jsx          # Canonical route tree + lazy page loading
│   ├── PageTitleManager.jsx
│   ├── PageLoadingFallback.jsx
│   ├── MarketplaceApp.jsx
│   ├── routePaths.js
│   └── ErrorBoundary.jsx
│
├── components/
│   ├── layout/              # Header/footer/mobile navigation + seller portal chrome
│   ├── marketplace/         # Buyer marketplace feature components
│   ├── seller/              # Seller Central feature modules
│   └── ui/                  # Reusable accessible primitives
│
├── pages/
│   ├── buyer/               # Buyer route-level screens
│   ├── seller/              # Seller route-level screens
│   └── shared/              # Cross-domain route screens
│
├── providers/               # App-wide state/context
├── hooks/                   # Reusable stateful behaviour
├── services/                # Domain workflows + platform integration boundary
│   ├── platform/
│   └── seller/
├── data/                    # Demo fixtures only
├── i18n/                    # Translation dictionaries/utilities
├── utils/                   # Small stateless/browser helpers
└── styles/                  # CSS ownership layers
```

## Dependency direction

The frontend follows this dependency direction:

```text
Route
  ↓
Page
  ↓
Feature component
  ↓
Shared UI primitive
  ↓
Design system / CSS

Page + feature logic
  ↓
Hooks / providers
  ↓
Services
  ↓
Platform adapter / future API
```

Pages should not contain platform HTTP implementation details.

Feature components should not own global application routing.

Shared UI primitives should not import marketplace-specific business logic.

Demo data remains replaceable by the platform service boundary.

## Route architecture

The route tree is grouped by persistent experience rather than by individual page:

```text
MarketplaceLayout
├── Home
├── Search
├── Category
├── Product
├── Cart
├── Checkout
├── Orders
├── Account
├── Wishlist
├── Sellers
├── Help / Guides
└── Operations / Admin

SellerPortalLayout
├── Sell
├── Seller Central
├── Seller preparation
└── Legacy seller-dashboard redirect

AuthLayout
├── Login
└── Signup
```

This keeps headers, footers, mobile navigation and seller portal chrome out of individual pages.

## Important module boundaries

| Area | Primary owner | Responsibility |
|---|---|---|
| Application shell | `src/app/MarketplaceApp.jsx` | Direction, scroll reset, title manager and error boundary |
| Routing | `src/app/routes.jsx` | Route tree, layout grouping and lazy page loading |
| Marketplace chrome | `src/app/layouts/MarketplaceLayout.jsx` | Buyer header/footer/mobile navigation and compare drawer |
| Seller chrome | `src/app/layouts/SellerPortalLayout.jsx` | Seller portal header/footer |
| Auth chrome | `src/app/layouts/AuthLayout.jsx` | Auth-only page surface |
| Global marketplace state | `src/providers/MarketplaceContext.jsx` | Cart, wishlist, language and theme state |
| Notifications | `src/providers/ToastProvider.jsx` | App-wide toast context |
| Demo marketplace operations | `src/services/marketplaceService.js` | Frontend demo workflows |
| Platform integration boundary | `src/services/platform/` | API contracts, client and adapters |
| Seller Central | `src/pages/seller/` + `src/components/seller/` | Seller-facing workspace |
| Demo catalogue | `src/data/products.js`, `sellers.js` | Product and seller fixtures |
| Persistence helpers | `src/utils/` | Safe browser storage and formatting helpers |

## CSS architecture

All global styles are imported from `src/styles.css`. Import order is intentional.

CSS ownership follows the same principle as the component tree:
- design system and base
- buyer discovery/shopping
- seller workspace
- commerce surfaces
- shared/support surfaces
- late refinement layers
- responsive/layout guards

Do not add feature CSS to unrelated global files. Do not reorder the global import chain without visual regression testing.

The current stylesheet collection still contains legacy refinement layers. The next cleanup phase is ownership-based consolidation, not another mass rewrite.

## Frontend evolution rule

When adding a feature:

1. Add the route to `src/app/routes.jsx` only if it is a new screen.
2. Add the route screen to the correct `pages/` domain.
3. Keep reusable feature UI in the relevant `components/` domain.
4. Use `components/ui` only for genuinely reusable primitives.
5. Put browser/domain behaviour in hooks or services instead of page-wide utility code.
6. Keep API access behind `services/platform`.
7. Add CSS to the smallest owning stylesheet.
8. Add buyer/seller responsive and RTL coverage before considering the feature complete.

## Build and test commands

- `npm run build` — Vite production build plus static route fallback generation.
- `npm run test:e2e` — Playwright end-to-end suite.
- `npm run audit:css` — static duplicate-selector ownership report.

This document is the canonical frontend architecture map. Update it whenever ownership boundaries change.