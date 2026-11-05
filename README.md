# MARCHY Marketplace

MARCHY is a Tunisia-first, multi-page marketplace **frontend prototype** built with React 18, React Router and Vite. The repository focuses on the buyer shopping experience while also containing seller, support and connected operations-preview workspaces.

## Start here

```bash
npm ci
npm run dev
```

Validate changes before committing:

```bash
npm run build
npm run test:e2e
```

Node.js 22 is used in CI. Playwright starts the Vite server automatically and runs the browser suite against Chromium.

## Repository map

```text
MARCHY/
├── .github/workflows/       # Single frontend CI workflow
├── docs/
│   ├── ARCHITECTURE.md      # Route, state, CSS and module ownership
│   └── FRONTEND_HANDOFF.md  # Backend integration boundaries and proposals
├── public/                 # Static assets and route fallback support
├── scripts/                # Build-time route fallback generation
├── src/
│   ├── app/                # App shell, route table and page metadata
│   ├── components/         # Shared marketplace chrome and product cards
│   ├── data/               # Illustrative product and seller fixtures
│   ├── hooks/              # Shared browser state and demo order behavior
│   ├── i18n/               # English, French and Arabic translations
│   ├── pages/              # Focused buyer pages + discovery, seller, support and operations groups
│   ├── styles/             # Ordered design-system and page style layers
│   └── utils/              # Search, formatting and guarded storage helpers
├── tests/                  # Playwright route, journey and accessibility tests
├── index.html
├── package.json
├── playwright.config.js
└── vite.config.js
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full module map, route ownership, browser-state keys, CSS cascade order and safe modularisation plan. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the working and validation rules.

## Frontend capabilities

- Buyer homepage, category discovery, search suggestions, URL-persistent filters and sorting.
- Product detail, seller storefront previews, product comparison and recently viewed products.
- Wishlist, multi-seller cart and multi-step demo checkout.
- Buyer order history and tracking preview.
- Seller onboarding, local product-draft workspace and preparation guide.
- Delivery operations and platform admin preview sharing a browser-local demo order store.
- English, French and Arabic interface support, including RTL layout.
- Responsive navigation, keyboard interactions and accessibility checks.

## Route groups

| Group | Routes |
|---|---|
| Buyer shopping | `/`, `/search`, `/category/:category`, `/product/:id`, `/cart`, `/checkout`, `/wishlist` |
| Discovery | `/categories`, `/sellers`, `/seller/:slug` |
| Account and support | `/account`, `/login`, `/signup`, `/help`, `/delivery`, `/returns` |
| Seller preview | `/sell`, `/seller-dashboard`, `/seller-help` |
| Demo operations | `/orders`, `/orders/:id`, `/operations/delivery`, `/admin` |

## Important limitations

This is not a live marketplace backend. Product and seller records, prices, discounts, stock, reviews and delivery details are illustrative. Cart, wishlist, comparison, seller drafts and demo orders are stored in the browser. Checkout does not create a real order, authenticate a buyer, process a payment, notify a seller or book a courier. Never present prototype state as verified or multi-user data.

The senior backend developer's integration boundary is documented in [docs/FRONTEND_HANDOFF.md](./docs/FRONTEND_HANDOFF.md). This frontend organisation pass does not implement backend services.

## Quality checks

One GitHub Actions workflow runs the production build and Playwright browser regression suite for pushes and pull requests targeting `main`. CI uses `npm ci` and Node.js 22 for reproducible installs.
