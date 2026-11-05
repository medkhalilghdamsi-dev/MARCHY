# MARCHY frontend architecture

## Scope and runtime

MARCHY is a frontend-only React 18 application built with Vite and React Router. This repository owns the browser experience and illustrative demo state. It does not own authentication, authoritative catalogue data, inventory, payment, order persistence or delivery integrations.

Runtime entry:
1. `index.html` provides the browser document and root mount.
2. `src/main.jsx` mounts React, BrowserRouter and the global stylesheet entry.
3. `src/App.jsx` is a stable re-export boundary.
4. `src/app/MarketplaceApp.jsx` composes the app shell, global buyer state, shared chrome and route table. `src/components/AppErrorBoundary.jsx` provides a recoverable UI fallback for render failures.
5. `src/app/MarketplaceRoutes.jsx` maps stable URLs to page components.
6. `src/app/usePageMetadata.js` owns route-derived titles, descriptions and social-sharing metadata.

## Source map

| Path | Responsibility | Keep out of this layer |
|---|---|---|
| `src/app/` | App shell, route composition, route metadata | Page-specific business logic |
| `src/components/` | Focused header, product card, footer and mobile navigation modules; legacy barrel retained | Route orchestration and persistent app state |
| `src/pages/` | Focused homepage, search, product, cart/checkout and wishlist modules; discovery, seller, support and operations page groups | Direct API transport or server assumptions |
| `src/hooks/` | Reusable stateful browser behavior | Presentation markup |
| `src/data/` | Clearly illustrative product, category and seller fixtures | Claims of verified live inventory |
| `src/i18n/` | English, French and Arabic copy and translation helpers | Page routing |
| `src/utils/` | Pure helpers and guarded browser storage access | React page composition |
| `src/styles/` | Global tokens and ordered page/experience style layers | Inline duplicate style systems |
| `tests/` | Browser-level route, buyer journey, responsive and accessibility coverage | Backend integration tests |
| `docs/` | Architecture, handoff, decisions and contributor guidance | Runtime code |

## Route ownership

| URL | Page owner | Journey |
|---|---|---|
| `/` | `HomePage.jsx` | Buyer discovery |
| `/search`, `/category/:category` | `SearchPage.jsx` | Search, filters and sorting |
| `/product/:id` | `ProductPage.jsx` | Product evaluation and add-to-cart |
| `/cart` | `CartPage.jsx` | Multi-seller basket |
| `/checkout` | `CheckoutPage.jsx` | Checkout preview |
| `/wishlist` | `WishlistPage.jsx` | Saved buyer items |
| `/categories`, `/sellers`, `/seller/:slug` | DiscoveryPages | Category and seller discovery |
| `/account`, `/login`, `/signup`, `/help`, `/delivery`, `/returns` | SupportPages | Account and support previews |
| `/sell`, `/seller-dashboard`, `/seller-help` | SellerPages | Merchant-facing prototype |
| `/orders`, `/orders/:id`, `/operations/delivery`, `/admin` | OperationsPages | Connected local demo order workflow |
| unmatched URL | SupportPages | Not-found state |

Keep route URLs stable. If a route must change, retain a redirect or compatibility alias and update the route tests. See [QA_MATRIX.md](./QA_MATRIX.md) for the full route inventory, release gates and buyer journey checks.

## State ownership

| State | Owner | Persistence | Notes |
|---|---|---|---|
| Language | `useMarketplaceState` | `marchy-language` | en, fr, ar; Arabic controls RTL |
| Theme | `useMarketplaceState` | `marchy-theme` | light/dark semantic theme; shared header toggle |
| Cart | `useMarketplaceState` | `marchy-cart` | Browser-local demo cart |
| Wishlist | `useMarketplaceState` | `marchy-wishlist` | Browser-local product IDs |
| Compare tray | Search page | `marchy-compare` | Browser-local comparison selection |
| Product view preference | Search page | `marchy-product-view` | Grid/list preference |
| Recently viewed | Buyer pages | Browser local storage | Discovery convenience only |
| Merchant drafts | Seller pages | `marchy-seller-drafts` | Local draft preview; never published |
| Demo orders | `useDemoOrders` | `marchy-demo-operations-v1` | Shared same-browser demo workflow |

Pages should use hooks/services for state. Do not introduce new direct localStorage reads or writes in page components; add a guarded helper or a dedicated hook instead. Local storage is not secure, authoritative or multi-user persistence.

## CSS architecture and cascade

See [CSS_ARCHITECTURE.md](./CSS_ARCHITECTURE.md) for selector inventory, stylesheet ownership and the safe extraction process. Run `npm run audit:css` before changing cross-layer rules.

Global styles enter through `src/styles.css`. Import order is intentional; later layers can refine or override earlier layers:

1. `base-foundation.css`, `base-discovery.css`, `base-shopping.css`, `base-mobile-navigation.css` — reset, shared foundations and base layout groups.
2. `discovery.css`, `shopping.css` — original discovery and buyer shopping rules.
3. `design-foundation.css`, `seller-experience.css`, `seller-workspace.css` — shared design and seller journeys.
4. `quality-refinements.css`, `multi-seller-basket.css`, `checkout.css`, `result-controls.css` — responsive/accessibility refinements, basket, checkout and search controls.
5. `experience-foundation.css`, `product-experience.css`, `discovery-experience.css`, `buyer-experience.css` — page-family experience layers.
6. `auth.css`, `operations.css` — account and operations-specific surfaces.
7. `theme.css`, `final-quality.css` — semantic light/dark tokens and final cross-marketplace brand corrections.

When adding CSS:
- Prefer existing design tokens; forest green `#1f5b45` is the primary brand accent.
- Put component styles in the closest owning stylesheet.
- Add a late override only when correcting a documented cross-layer conflict.
- Avoid repeating selectors in multiple layers. When a duplicate is unavoidable, document why cascade order is needed.
- Support light/dark mode, keyboard focus, reduced motion, mobile safe areas and Arabic RTL.
- Do not use orange for primary actions; reserve semantic sale/warning colours for their actual meaning.


## Internationalisation

`src/i18n/translations.js` is the stable dictionary entry point used by `translate.js`. The base shopping dictionary lives in `translations-base.js`; page-family additions are kept in ordered modules for account/discovery, seller workspace, help/guides, buyer account, category/checkout, homepage, operations, order tracking and order history. Import order is intentional because later page-family entries may override earlier base strings. Keep translation keys as the English source copy and preserve French/Arabic values together.

## Component and page boundaries

- App shell owns global language/cart/wishlist state and shared header/footer/mobile navigation.
- Route table owns URL-to-page mapping and shared page props.
- Page modules own route-level orchestration. Extract repeated interface pieces into components only when they have a clear reusable contract.
- Components own reusable presentation and local interaction, not global storage.
- Hooks own reusable state and effects.
- Utilities should remain small and independently understandable.
- Fixtures must be labelled as demo/sample wherever a buyer could mistake them for verified offers.

## Known modularisation targets

The buyer journey and shared marketplace chrome have focused modules. Route pages are `HomePage.jsx`, `SearchPage.jsx`, `ProductPage.jsx`, `CartPages.jsx`, `WishlistPage.jsx`, `SellersPage.jsx`, `SellerPage.jsx`, `CategoriesPage.jsx`, `AccountPage.jsx`, `AuthPage.jsx`, `SellerLaunchPage.jsx`, `SellerDashboardPage.jsx`, `SellerPreparationPage.jsx`, `DeliveryOperationsPage.jsx`, `AdminOperationsPage.jsx`, `BuyerOrderTrackingPage.jsx` and `BuyerOrdersPage.jsx`. `DiscoveryPages.jsx` and `SellerPages.jsx` are compatibility barrels. Operations routes import their focused page modules directly. `SupportPages.jsx` retains help and guide pages; `OperationsShared.jsx` owns shared operations presentation. `ShoppingPages.jsx` and `MarketplaceChrome.jsx` remain backwards-compatible export barrels; new code should import focused modules directly.

Remaining deliberate refactors:
1. Continue reducing CSS cross-layer coupling by moving component rules into their owning stylesheets only when cascade analysis proves it safe.
2. Move browser-local demo order operations behind an explicit demo service interface before backend adapter work.
3. Keep the route smoke-test matrix aligned with `MarketplaceRoutes.jsx`.

Refactor one boundary at a time. Preserve route URLs, storage keys, accessible names, visible copy, RTL behavior and test coverage.

## Backend handoff boundary

The backend developer owns authenticated services, authoritative prices and stock, checkout/order creation, payments, delivery providers, seller permissions, reviews and platform moderation. See [FRONTEND_HANDOFF.md](./FRONTEND_HANDOFF.md) for the proposed resource contracts and service boundaries. Keep this repository's UI fixtures and local demo behavior visibly separate from production data.
