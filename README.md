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
│   │   └── useMarketplaceState.js # Persistent language, cart and wishlist state
│   ├── i18n/
│   │   ├── translations.js     # English/French/Arabic interface copy
│   │   └── translate.js        # Shared translated React-tree helper
│   ├── pages/
│   │   ├── ShoppingPages.jsx   # Home, search, product, cart, checkout, wishlist
│   │   ├── DiscoveryPages.jsx  # Categories and seller discovery/storefront
│   │   ├── SellerPages.jsx     # Seller onboarding, workspace and preparation
│   │   └── SupportPages.jsx    # Account, help, delivery, returns and not-found
│   ├── styles/
│   │   └── marketplace.css    # Design system and responsive styles
│   ├── utils/
│   │   └── marketplace.js     # Search, text normalisation and storage helpers
│   ├── App.jsx                 # Stable application entry/re-export
│   ├── main.jsx                # React + router bootstrap
│   └── styles.css              # Stable stylesheet entry/import
├── tests/
│   └── marketplace.spec.js     # Playwright route, responsive and interaction tests
├── index.html
├── package.json
├── playwright.config.js
└── vite.config.js
```

## Module responsibilities

- **Bootstrap:** `src/main.jsx` mounts React and configures the browser router.
- **Application:** `src/App.jsx` is the stable entry boundary; route composition and shared application state currently live in `src/app/MarketplaceApp.jsx`.
- **Data:** `src/data/` holds illustrative catalogue and seller records. Keep sample data separate from UI and never present it as verified inventory.
- **Internationalisation:** `src/i18n/` owns interface copy for English, French and Arabic.
- **Utilities:** `src/utils/` owns reusable search normalisation and browser-local storage helpers.
- **Styles:** `src/styles.css` is the stable global style entry; marketplace rules live in `src/styles/marketplace.css`.
- **Tests:** `tests/` contains route, responsive, interaction and accessibility checks.

### Remaining modularisation

The route module still contains page and visual component implementations. Extract them incrementally into:
- `src/components/` — reusable header, footer, navigation and product cards
- `src/layouts/` — shared page layouts
- `src/pages/` — route-level pages grouped by shopping, seller and support journeys
- `src/hooks/` — reusable state and interaction hooks

Preserve all route URLs, local-storage keys, browser-local state, language behaviour and RTL layout during extraction. Keep structural refactors separate from visual redesigns.

## Run locally

```bash
npm install
npm run dev
```

## Frontend experience

- Responsive marketplace homepage and category discovery
- Global search suggestions with multilingual synonyms and relevance-aware results
- Category, seller-location and price filters
- Sorting and switchable grid/list result layouts
- Product detail pages with image zoom, seller information, related listings and buyer checklists
- Product comparison, cart, wishlist and recently viewed products
- Multi-step checkout preview with contact validation and explicit non-submission confirmation
- Seller directory, storefront previews and browser-local seller workspace demonstration
- English, French and Arabic interface with RTL layout support
- Responsive navigation and keyboard interactions

## Validation

```bash
npm run build
npm run test:e2e
```

The Playwright suite covers public routes, responsive overflow, Arabic RTL, navigation, cart and wishlist interactions, comparison, seller storefront interactions and accessibility checks. These checks are authored but must be run locally or in CI before treating them as passing.

## Important

MARCHY is currently a frontend prototype. The product catalogue, seller storefronts, prices, discounts, stock and delivery information are illustrative and are not verified live offers. Cart, wishlist, comparison and recently viewed data are stored locally in the browser. Authentication, order submission, payment processing, inventory, seller management, delivery calculations and backend integrations are not connected.
