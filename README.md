# MARCHY Marketplace

A responsive, multi-page Tunisia-first marketplace frontend built with React and Vite.

## Project structure

```text
MARCHY/
├── public/                 # Static public assets
├── src/
│   ├── app/
│   │   └── MarketplaceApp.jsx  # Application shell, routes, page composition and shared UI
│   ├── data/
│   │   └── products.js         # Illustrative product catalogue and categories
│   ├── styles/
│   │   └── marketplace.css    # Marketplace design system and responsive styles
│   ├── App.jsx                 # Stable application entry/re-export
│   ├── main.jsx                # React + router bootstrap
│   └── styles.css              # Stable global stylesheet entry/import
├── tests/
│   └── marketplace.spec.js     # Playwright frontend and accessibility coverage
├── index.html
├── package.json
├── playwright.config.js
└── vite.config.js
```

### Architecture boundaries

- **App bootstrap:** `src/main.jsx` owns React mounting and router setup.
- **Application shell:** `src/App.jsx` remains a stable import boundary; the current route composition lives in `src/app/MarketplaceApp.jsx`.
- **Catalogue data:** `src/data/` contains sample catalogue data only. UI components should not invent verified seller or stock claims.
- **Styles:** `src/styles.css` remains the global style entry; marketplace rules live in `src/styles/marketplace.css`.
- **Tests:** `tests/` contains browser-level route, responsive, interaction and accessibility checks.

### Next modularisation boundary

The application shell currently still contains several page and shared-component implementations. The next refactor should extract these into:
- `src/components/` — reusable UI (header, footer, product cards, navigation)
- `src/layouts/` — shared page layouts
- `src/pages/` — route-level pages
- `src/hooks/` — reusable browser-state and interaction hooks
- `src/utils/` — formatting, search and storage helpers
- `src/i18n/` — translation dictionaries and language helpers

Keep route URLs, browser-local state behaviour, English/French/Arabic support and RTL behaviour stable while extracting modules. Avoid mixing visual redesigns with structural refactors.

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
