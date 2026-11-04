# MARCHY Marketplace

A responsive, multi-page Tunisia-first marketplace frontend built with React and Vite.

## Run locally

```bash
npm install
npm run dev
```

## Frontend experience

- Responsive marketplace homepage and category discovery
- Global search suggestions with multilingual synonyms and relevance-aware results
- Category, seller-location and price filters
- Sorting by best match, price, name, newest and illustrative price difference
- Switchable, persistent grid and list result layouts in search results and seller storefronts
- Product-page native sharing with copy-link fallback
- Product detail pages with image zoom, seller information, related listings and category-specific buyer checklists
- Product comparison for up to three listings, with add/remove actions from search cards and product detail pages
- Client-side cart grouped by seller with per-seller subtotals and quantity controls
- Multi-step checkout preview with contact validation, seller-by-seller order review and explicit non-submission confirmation
- Wishlist and recently viewed products
- Browser-persisted cart, wishlist, language, comparison and recently viewed state
- Seller directory, storefront previews with active filter chips and sharing, plus seller workspace demonstration with editable browser-local product drafts
- English, French and Arabic interface with RTL layout support
- Responsive navigation, mobile layouts and accessible keyboard interactions

## Validation

```bash
npm run build
npm run test:e2e
```

The Playwright suite covers public routes, responsive overflow across desktop/tablet/mobile widths, Arabic RTL overflow, mobile navigation, cart and wishlist interactions, persistent comparison and recently viewed products, seller storefront sharing and filters, editable browser-local seller drafts, and accessibility violations on core pages. These checks are authored but must be run in CI or locally before treating them as passing.

## Important

MARCHY is currently a frontend prototype. The product catalogue, seller storefronts, prices, discounts, stock and delivery information are illustrative and are not verified live offers. Cart, wishlist, comparison and recently viewed data are stored locally in the browser. Authentication, order submission, payment processing, inventory, seller management, delivery calculations and backend integrations are not connected.
