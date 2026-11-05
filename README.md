# MARCHY Marketplace

A responsive, multi-page Tunisia-first marketplace frontend built with React and Vite.

## Project structure

```text
MARCHY/
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   └── MarketplaceApp.jsx  # Route composition and app shell
│   ├── components/
│   │   └── MarketplaceChrome.jsx # Header, product card, footer, mobile tabs
│   ├── data/
│   │   ├── products.js         # Illustrative product catalogue and categories
│   │   └── sellers.js          # Illustrative seller profiles and mappings
│   ├── hooks/
│   │   ├── useMarketplaceState.js # Persistent language, cart and wishlist state
│   │   └── useDemoOrders.js        # Browser-local demo order lifecycle
│   ├── i18n/
│   │   ├── translations.js     # English/French/Arabic interface copy
│   │   └── translate.js        # Shared translated React-tree helper
│   ├── pages/
│   │   ├── ShoppingPages.jsx   # Home, search, product, cart, checkout, wishlist
│   │   ├── OperationsPages.jsx # Demo orders, tracking, delivery and admin
│   │   ├── DiscoveryPages.jsx  # Categories and seller discovery/storefront
│   │   ├── SellerPages.jsx     # Seller onboarding, workspace and preparation
│   │   └── SupportPages.jsx    # Account, help, delivery, returns and not-found
│   ├── styles/
│   │   ├── base.css                 # Fonts, tokens and foundational rules
│   │   ├── discovery.css            # Category and seller discovery
│   │   ├── shopping.css             # Shopping, product and cart styles
│   │   ├── design-foundation.css    # Shared design-system refinements
│   │   ├── seller-experience.css    # Seller-facing pages
│   │   ├── seller-workspace.css     # Seller dashboard workspace
│   │   ├── quality-refinements.css  # Accessibility and responsive polish
│   │   ├── multi-seller-basket.css  # Multi-seller cart details
│   │   ├── checkout.css             # Checkout preview
│   │   ├── result-controls.css      # Search and listing controls
│   │   ├── experience-upgrade.css   # Cross-page interaction and visual refinements
│   │   ├── auth.css                 # Authentication screens
│   │   ├── operations.css           # Delivery and admin demo screens
│   │   ├── theme.css                # Theme variants
│   │   └── final-quality.css        # Final shared design tokens and overrides
│   ├── utils/
│   │   └── marketplace.js     # Search, text normalisation and storage helpers
│   ├── App.jsx                 # Stable application entry/re-export
│   ├── main.jsx                # React + router bootstrap
│   └── styles.css              # Stable stylesheet entry/import
├── tests/
│   └── marketplace.spec.js     # Playwright route, responsive and interaction tests
├── index.html
├── package.json
├── scripts/
│   └── create-route-fallbacks.mjs # Static-host deep-link fallbacks
├── playwright.config.js
└── vite.config.js
```

## Module responsibilities

- **Bootstrap:** `src/main.jsx` mounts React and configures the browser router.
- **Application:** `src/App.jsx` is the stable entry boundary; route composition and shared application state currently live in `src/app/MarketplaceApp.jsx`.
- **Data:** `src/data/` holds illustrative catalogue and seller records. Keep sample data separate from UI and never present it as verified inventory.
- **Internationalisation:** `src/i18n/` owns interface copy for English, French and Arabic.
- **Utilities:** `src/utils/` owns reusable search normalisation and browser-local storage helpers.
- **Styles:** `src/styles.css` is the stable global style entry. Ordered CSS modules in `src/styles/` separate foundations, discovery, shopping, seller experiences, checkout, result controls and the final cross-page experience layer without changing cascade order.
- **Tests:** `tests/` contains route, responsive, interaction and accessibility checks.

### Remaining modularisation

The current structure separates route composition, shared marketplace chrome, page journeys, persistent browser state, translations, utilities and ordered style layers. Continue extracting individual components only when doing so creates a clear reusable boundary; avoid empty abstraction layers or changing route and storage contracts just for file-count reasons.

## Run locally

```bash
npm ci
npm run dev
```

## Frontend experience

- Responsive marketplace homepage and category discovery
- Global search suggestions with multilingual synonyms and relevance-aware results
- Category, seller-location and price filters
- Sorting and switchable grid/list result layouts
- Product detail pages with image zoom, seller information, related listings and buyer checklists
- Product comparison, cart, wishlist and recently viewed products
- Multi-step demo checkout with contact validation, one local demo order per merchant and buyer tracking
- Buyer order history with search, status filters and direct tracking links
- Seller directory, storefront previews and browser-local seller workspace demonstration
- English, French and Arabic interface with RTL layout support
- Responsive navigation and keyboard interactions
- Refined page hierarchy, product-card states, cart/checkout surfaces and comparison tray
- Contrast and keyboard-focus improvements guided by automated accessibility checks

## Validation

```bash
npm run build
npm run test:e2e
```

The Playwright suite covers public routes, responsive overflow, Arabic RTL, navigation, cart and wishlist interactions, comparison, seller storefront interactions and accessibility checks. These checks are authored but must be run locally or in CI before treating them as passing.

## Connected operational workspaces

- Buyer order history: `/orders` — searchable sample order list with status filters and tracking links.
- Buyer order tracking: `/orders/:id` — sample delivery progress linked to merchant and operations updates.
- Delivery operations: `/operations/delivery` — shared demo fulfilment queue and courier assignment.
- Platform administration: `/admin` — cross-marketplace demo order overview.
- Merchant workspace links directly to delivery and admin interfaces.
- Checkout creates browser-local demo orders and clears the cart; it does not submit a real order, send notifications or process payment.
- Both operational screens use the same browser-local demo order store. This demonstrates frontend workflow continuity only; it is not a live multi-user system.
- Backend integration boundaries and suggested resource contracts: [Frontend handoff](docs/FRONTEND_HANDOFF.md).

## Important

MARCHY is currently a frontend prototype. The product catalogue, seller storefronts, prices, discounts, stock and delivery information are illustrative and are not verified live offers. Cart, wishlist, comparison and recently viewed data are stored locally in the browser. Authentication, order submission, payment processing, inventory, seller management, delivery calculations and backend integrations are not connected.
