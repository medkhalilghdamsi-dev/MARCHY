# MARCHY — Frontend Architecture & Project Organization

MARCHY is a multi-vendor marketplace frontend built with **React 18**, **Vite 6**, and **React Router 7**, designed with the **MARCHY Premium Minimal** design system (light/dark mode, RTL Arabic & English support, TND currency formatting, and responsive mobile-to-desktop layouts).

---

## Directory Structure

```text
MARCHY/
├── docs/                                  # Architecture, audits & QA documentation
│   ├── ANTIGRAVITY_AUDIT.md               # Phase 0 baseline audit & technical findings
│   ├── ARCHITECTURE.md                    # Project organization & module ownership guide
│   ├── BUYER_FRONTEND_ROADMAP.md          # Buyer UX roadmap
│   ├── FRONTEND_IMPROVEMENTS_SUMMARY.md   # Summary of production UX upgrades
│   └── QA_AUDIT_REPORT.md                 # End-to-end Playwright & accessibility report
├── public/                                # Static assets (icons, manifest, fallback SVG)
├── scripts/                               # Build & prerender helpers
│   └── postbuild-spa-routes.mjs           # Generates static SPA entry points for 72 routes
├── src/
│   ├── app/                               # Application shell, routing & error boundaries
│   │   ├── routePaths.js                  # Shared canonical route paths and seller portal route scope
│   │   ├── ErrorBoundary.jsx              # Root runtime crash recovery UI
│   │   ├── MarketplaceApp.jsx             # Route table, code-splitting & document title manager
│   │   ├── MarketplaceContext.jsx         # Re-export barrel -> ../providers/MarketplaceContext
│   │   └── ToastProvider.jsx              # Re-export barrel -> ../providers/ToastProvider
│   ├── providers/                         # React Context providers
│   │   ├── MarketplaceContext.jsx         # Cart, wishlist, saved-for-later, coupons, theme & i18n
│   │   └── ToastProvider.jsx              # Accessible toast notification system
│   ├── components/
│   │   ├── layout/                        # Buyer chrome and independent seller portal chrome
│   │   │   ├── Header.jsx                 # Top navigation, search, language & theme controls
│   │   │   ├── Footer.jsx                 # Multi-column marketplace footer
│   │   │   └── MobileTabBar.jsx           # Sticky bottom navigation bar for mobile viewports
│   │   ├── marketplace/                   # Shared product & merchandising components
│   │   │   ├── ProductCard.jsx            # Product card (grid/list, quick-add, wishlist, compare)
│   │   │   ├── ProductReviews.jsx         # Star breakdown, verified reviews & review submission
│   │   │   └── ProductSpecs.jsx           # Technical attributes & fulfilment specification table
│   │   ├── seller/                        # Seller workspace feature modules
│   │   │   ├── SellerCentralNavigation.jsx # Seller Central section navigation
│   │   │   ├── SellerCentralWorkspace.jsx  # Lazy-loaded section composition and profile workspace routing
│   │   │   ├── SellerProfileWorkspace.jsx  # Business profile, operations & verification forms
│   │   │   ├── SellerCatalogManager.jsx    # Seller product listings and local draft lifecycle
│   │   │   ├── SellerInventoryWorkspace.jsx # SKU stock, movements & low-stock thresholds
│   │   │   ├── SellerOrdersWorkspace.jsx   # Seller order preparation workflow
│   │   │   ├── SellerReturnsWorkspace.jsx  # Return requests and inspection workflow
│   │   │   ├── SellerFinanceWorkspace.jsx  # Demo ledger and settlement visibility
│   │   │   ├── SellerAnalyticsWorkspace.jsx # Seller business intelligence preview
│   │   │   └── SellerSupportWorkspace.jsx  # Support cases and dispute preparation
│   │   └── ui/                            # Reusable accessible UI primitives
│   │       └── index.jsx                  # Badge, EmptyState, Breadcrumbs, Modal, ConfirmDialog, Tabs, Skeleton
│   ├── pages/
│   │   ├── buyer/                         # Buyer-facing route views
│   │   │   ├── HomePage.jsx               # Hero, budget discovery, categories, featured, deals, recent
│   │   │   ├── SearchPage.jsx             # Search autocomplete, filters, compare tray & pagination
│   │   │   ├── ProductPage.jsx            # Gallery, lightbox, specs, reviews, seller trust & mobile buybar
│   │   │   ├── CartPage.jsx               # Seller-grouped cart, free-delivery meter, coupons & saved-for-later
│   │   │   ├── CheckoutPage.jsx           # Multi-step demo checkout (contact, delivery, payment, review)
│   │   │   ├── WishlistPage.jsx           # Saved products collection
│   │   │   ├── CategoriesPage.jsx         # Searchable department directory
│   │   │   ├── SellersPage.jsx            # Filterable Tunisian seller directory
│   │   │   ├── SellerStorefrontPage.jsx   # Public seller storefront with search, category filter & share
│   │   │   ├── AccountPage.jsx            # Buyer hub, shortlist, demo orders & recently viewed history
│   │   │   ├── BuyerOrdersPage.jsx        # Filterable buyer order history
│   │   │   └── BuyerOrderTrackingPage.jsx # Step-by-step parcel tracking view
│   │   ├── seller/                        # Independent seller-facing route views
│   │   │   ├── SellerLaunchPage.jsx       # Seller launch information and storefront planner (/sell)
│   │   │   ├── SellerCentralPage.jsx      # Independent Seller Central business workspace (/seller-central)
│   │   │   └── SellerPreparationPage.jsx  # Seller readiness guide (/seller-help)
│   │   └── shared/                        # Shared auth, support & operations views
│   │       ├── AuthPage.jsx               # Sign-in (/login) & registration (/signup) preview
│   │       ├── HelpCenterPage.jsx         # FAQ & support topic directory (/help)
│   │       ├── MarketplaceGuidePage.jsx   # Delivery (/delivery) & returns (/returns) checklists
│   │       ├── NotFoundPage.jsx           # 404 recovery page
│   │       ├── OperationsShared.jsx       # Shared status badges, OpsShell layout & OrderTable
│   │       ├── DeliveryOperationsPage.jsx # Courier assignment & fulfilment queue (/operations/delivery)
│   │       └── AdminOperationsPage.jsx    # Platform-wide order control centre (/admin)
│   ├── data/                              # Curated mock catalogue & seller profiles
│   │   ├── products.js                    # 40 products across 13 categories, specs & mockReviews
│   │   └── sellers.js                     # Tunisian demo storefronts & category mappings
│   ├── hooks/                             # Custom state & persistence hooks
│   │   ├── useMarketplaceState.js         # Synchronous localStorage-backed cart, wishlist, coupons & theme state
│   │   └── useDemoOrders.js               # Cross-tab synchronized demo order store
│   ├── i18n/                              # Bilingual translation engine
│   │   └── translate.js                   # English & RTL Arabic phrase dictionary and React tree translator
│   ├── styles/                            # Modular CSS architecture
│   │   ├── design-system.css              # Design tokens, custom properties, buttons, forms & cards
│   │   ├── base.css                       # Reset, typography, header, footer & core layout
│   │   ├── marketplace.css                # Buyer discovery, search, product detail, cart & checkout styles
│   │   ├── workspaces.css                 # Seller dashboard, analytics, settings & operations styles
│   │   └── rtl.css                        # RTL Arabic overrides
│   ├── utils/                             # Pure helper functions
│   │   └── marketplace.js                 # TND money formatter, search normalization/synonyms & JSON storage helpers
│   ├── App.jsx                            # Entry wrapper -> ./app/MarketplaceApp
│   ├── main.jsx                           # React root with BrowserRouter, MarketplaceProvider & ToastProvider
│   └── styles.css                         # CSS entry point importing ./styles/*.css in cascade order
└── tests/                                 # Playwright E2E, responsive & axe-core accessibility test suite
    └── marketplace.spec.js
```



---

## Seller portal separation (current frontend boundary)

The seller journey is a distinct application surface within the same React application. It shares the design system, providers and platform contracts, but it must not inherit buyer navigation or buyer shopping controls.

### Seller portal routes

| Route | Purpose |
|---|---|
| /sell | Seller entry point and storefront preparation planner |
| /seller-central | Seller onboarding and operational workspace |
| /seller-help | Seller preparation guide |
| /seller-dashboard | Legacy route; redirects to /seller-central |

### Layout ownership

- `SellerPortalHeader` and `SellerPortalFooter` are rendered only on seller portal routes.
- Buyer `Header`, `Footer`, `MobileTabBar` and `GlobalCompareDrawer` are excluded from seller portal routes.
- Public seller storefronts at `/seller/:slug` remain buyer-facing marketplace pages and retain buyer chrome.
- Seller navigation is independent: Start selling, Seller Central and Seller guide.
- Seller Central owns seller setup and operational modules. Buyer account, cart, wishlist and checkout navigation do not appear in the seller shell.
- Buyer route pages are lazy-loaded behind the shared route suspense boundary; seller operational workspaces are lazy-loaded by section so initial navigation does not download every buyer page or seller tool.
- Marketplace route metadata loads buyer catalog and seller directory data only on the matching buyer route; buyer and seller chrome are separate lazy chunks so the independent seller portal avoids eagerly loading buyer navigation, compare UI and product metadata.

- Shared providers and tokens remain shared implementation infrastructure; visual chrome and route journeys remain separated.

### Route and module rules

1. Buyer-facing pages belong in `src/pages/buyer`.
2. Seller-facing pages and workflows belong in `src/pages/seller` and `src/components/seller`.
3. Cross-journey primitives belong in `src/components/ui`; do not duplicate buyer or seller page-level navigation in those primitives.
4. Buyer and seller shells must be selected explicitly from route scope, not inferred from component names.
5. A public seller storefront (`/seller/:slug`) is a marketplace destination, not Seller Central.
6. Keep the old seller dashboard implementation out of active navigation. Its route redirects to Seller Central to avoid maintaining two competing seller workspaces.
7. Keep business logic and API contracts out of page layout components. Future migrations should move local-storage adapters behind feature services before connecting the backend.

### Remaining organization work before platform administration

- Audit and retire legacy seller dashboard modules only after confirming no active imports, redirects, tests or shared behavior still depend on them.
- Continue migrating seller feature state from component-local browser storage to explicit feature services; preserve the current local-demo boundary until backend contracts are implemented.
- Consolidate repeated seller tables, filters, status labels, confirmation patterns and form fields into accessible shared primitives where real duplication exists.
- Add route-level coverage for seller-only chrome, buyer storefront chrome, direct navigation, refresh and browser history.
- Keep production build and Playwright regression checks green after each structural refactor.

### Seller browser-storage boundary

- Seller-side browser persistence is accessed through `src/services/seller/sellerStorage.js`; UI modules must not call `localStorage` directly.
- The service centralizes stable storage keys, safe JSON reads, list/profile normalization, write/remove failure handling, and same-tab plus cross-tab change notifications.
- `src/hooks/useSellerProfile.js` provides a shared reactive view of the saved seller preparation profile.
- `src/hooks/useSellerOnboardingDraft.js` owns onboarding form state, completion calculation, save/clear behavior and synchronization; the page component stays focused on layout and section composition.
- `SellerCentralNavigation`, `SellerCentralWorkspace` and `SellerProfileWorkspace` have separate responsibilities: navigation, operational module composition, and onboarding forms. `SellerCentralPage` owns the route, page shell and onboarding draft actions; `SellerCentralWorkspace` owns the lazy-loaded operational modules and their loading fallback. Profile draft actions are rendered only for business profile, operations preferences and verification readiness—not across catalogue, orders, finance or support.
- Seller inventory persists the catalogue update and movement record through `writeSellerValues`; it snapshots previous browser values and attempts rollback if either write fails, so the interface does not report a partial stock adjustment.
- Seller Central is a distinct route and application shell, not a buyer journey tab. Its sections are addressable with `/seller-central?section=catalog` (valid IDs are defined once in `src/app/sellerCentralSections.js`); navigation updates browser history, so direct links, refresh and Back/Forward preserve the selected workspace.
- The section metadata file is the single source of truth for navigation labels, icons, page headings and descriptions. Seller onboarding state is isolated in `useSellerOnboardingDraft`, while profile forms and section navigation are separate components.

- This is a frontend prototype persistence boundary only. It is not authentication, tenant isolation, authoritative inventory, financial ledger storage, or a substitute for the backend API.
