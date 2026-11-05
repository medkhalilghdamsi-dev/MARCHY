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
│   │   ├── ErrorBoundary.jsx              # Root runtime crash recovery UI
│   │   ├── MarketplaceApp.jsx             # Route table, code-splitting & document title manager
│   │   ├── MarketplaceContext.jsx         # Re-export barrel -> ../providers/MarketplaceContext
│   │   └── ToastProvider.jsx              # Re-export barrel -> ../providers/ToastProvider
│   ├── providers/                         # React Context providers
│   │   ├── MarketplaceContext.jsx         # Cart, wishlist, saved-for-later, coupons, theme & i18n
│   │   └── ToastProvider.jsx              # Accessible toast notification system
│   ├── components/
│   │   ├── layout/                        # Global marketplace chrome
│   │   │   ├── Header.jsx                 # Top navigation, search, language & theme controls
│   │   │   ├── Footer.jsx                 # Multi-column marketplace footer
│   │   │   └── MobileTabBar.jsx           # Sticky bottom navigation bar for mobile viewports
│   │   ├── marketplace/                   # Shared product & merchandising components
│   │   │   ├── ProductCard.jsx            # Product card (grid/list, quick-add, wishlist, compare)
│   │   │   ├── ProductReviews.jsx         # Star breakdown, verified reviews & review submission
│   │   │   └── ProductSpecs.jsx           # Technical attributes & fulfilment specification table
│   │   ├── seller/                        # Seller workspace feature modules
│   │   │   ├── SellerAnalytics.jsx        # SVG revenue charts, KPI cards & regional distribution
│   │   │   └── SellerSettings.jsx         # Store profile, shipping fees, notifications & RIB payout
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
│   │   ├── seller/                        # Seller-facing route views
│   │   │   ├── SellerLaunchPage.jsx       # Interactive storefront & first-listing planner (/sell)
│   │   │   ├── SellerDashboardPage.jsx    # Seller workspace (Overview, Orders, Products, Storefront, Insights, Settings)
│   │   │   └── SellerPreparationPage.jsx  # Pre-onboarding readiness guide (/seller-help)
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
