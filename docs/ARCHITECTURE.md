# MARCHY — Frontend Architecture

**Scope:** React frontend only. Work on branch `khalil`. Backend services and API contracts are intentionally outside this architecture map.

## Stack

- React 18, JavaScript/JSX, Vite 6
- React Router 7
- Plain CSS, imported through one global entry point
- Playwright for end-to-end tests

## Runtime flow

`src/main.jsx` mounts `BrowserRouter`, `MarketplaceProvider`, `ToastProvider`, and the root app.

`src/App.jsx` is the small application entry wrapper. `src/app/MarketplaceApp.jsx` owns route composition, lazy-loaded pages, buyer/seller chrome, scroll reset, page titles, and the route-level error boundary.

## Source ownership

```text
src/
├── app/             # Application shell, route paths, seller section registry, error boundary
├── components/
│   ├── layout/      # Buyer header/footer/mobile navigation and seller portal chrome
│   ├── marketplace/ # Product, comparison, Q&A, reviews, offers and merchandising UI
│   ├── seller/      # Seller Central navigation and workspace feature modules
│   └── ui/          # Shared accessible UI primitives and exports
├── data/            # Demo catalogue, seller records and marketplace demo seed data
├── hooks/           # Marketplace, order, seller onboarding and profile hooks
├── i18n/            # Translation dictionaries and translation utilities
├── pages/
│   ├── buyer/       # Buyer-facing route pages
│   ├── seller/      # Seller launch, preparation and Seller Central pages
│   └── shared/      # Authentication, help, guides, operations and not-found pages
├── providers/       # Marketplace state and toast context providers
├── services/
│   ├── platform/    # API client, adapters, contracts and platform service boundary
│   └── seller/      # Seller-specific browser storage helpers
├── styles/          # Feature and shared CSS modules (loaded by styles.css)
└── utils/           # Formatting, marketplace and storage helpers
```

## Important module boundaries

| Area | Primary owner | Responsibility |
|---|---|---|
| Routing and app chrome | `src/app/MarketplaceApp.jsx` | Route table, lazy loading, layout selection |
| Global marketplace state | `src/providers/MarketplaceContext.jsx` | Cart, wishlist, language and theme state |
| Notifications | `src/providers/ToastProvider.jsx` | App-wide toast context |
| Demo marketplace operations | `src/services/marketplaceService.js` | Frontend demo workflows |
| Platform integration boundary | `src/services/platform/` | API contracts, client and adapters |
| Seller Central | `src/pages/seller/` + `src/components/seller/` | Seller-facing workspace |
| Demo catalogue | `src/data/products.js`, `sellers.js` | Product and seller fixtures |
| Persistence helpers | `src/utils/storage.js` | Safe browser storage primitives |

## CSS entry point and cascade

All global styles are imported from `src/styles.css`. Import order is intentional and must be treated as part of the UI:

1. Design system and base styles
2. Discovery and shopping
3. Seller experience and workspace
4. Product, basket, checkout and result controls
5. Auth, operations and theme
6. Final quality and buyer/product refinements, followed by the eight ordered Upwork UI slices and seller portal

The broad refinement files are still present because they contain late overrides. The former `upwork-ui.css` and `buyer-ui-polish.css` monoliths have each been split into eight feature-oriented slices, imported in their original cascade order. See `FRONTEND_ARCHITECTURE_AUDIT.md` for the slice inventory and verification status. Do not reorder imports, delete rules, or move selectors between files without checking selector ownership and running visual regression checks.

## Working rules

- Keep buyer, seller and shared route pages in their respective folders.
- Put reusable primitives in `components/ui`; keep feature-specific components with their feature.
- Keep static fixtures in `data`, domain workflows in `services`, and reusable browser helpers in `utils`.
- Avoid new root-level page/component aggregation files.
- Avoid adding global CSS imports from individual components. Add global styles through `src/styles.css` in a documented group.
- Do not duplicate design tokens or global resets in feature stylesheets.
- Verify imports and dynamic references before deleting files.
- Preserve accessibility, responsive behaviour, Arabic RTL support and existing routes.

## Build and test commands

- `npm run build` — Vite production build plus static route fallback generation.
- `npm run test:e2e` — Playwright end-to-end suite.
- `npm run audit:css` — static duplicate-selector ownership report for styles imported by `src/styles.css`.

This document describes the current source layout; update it when ownership changes.
