# MARCHY Marketplace — Production-Ready Frontend

A modern, responsive, accessible multi-vendor marketplace frontend built for Tunisia with **React 18**, **Vite 6**, and **React Router v7**. Follows the **Forest Green Premium Minimal** design system with complete light and dark themes, Arabic RTL support, code splitting, and an isolated mock data layer ready for seamless backend integration.

---

## Key Highlights & Architectural Features

- **Tunisia-First Commerce Experience**: Prices in Tunisian Dinars (TND, with 3 decimal precision), local governorates and cities, Cash on Delivery + local digital payment demos (ClicToPay, Flouci/Konnect).
- **Connected Multi-Vendor Ecosystem**:
  - **Buyer Marketplace**: Home merchandising, instant autocomplete search, multi-faceted filtering (category, price range, city, discounts), product comparison (up to 3 items), multi-image gallery with zoom lightbox, customer ratings & reviews, coupon code engine, multi-seller cart grouping, and multi-step checkout preview.
  - **Seller Portal**: Merchant workspace with 6 dedicated tabs: Overview, Orders Fulfilment, Product Drafts Manager, Storefront Profile Preview, Performance Analytics (interactive pure-SVG sales charts, regional distribution), and Business Settings (payout RIB, delivery fees, alerts).
  - **Operations Workspaces**: Shared demo delivery courier assignments (`/operations/delivery`) and platform admin overview (`/admin`).
- **Modern State & Architecture**:
  - Centralized `MarketplaceContext` eliminating prop drilling.
  - Global `ToastProvider` for accessible, animated notifications across all actions.
  - `ErrorBoundary` at the application root for graceful error handling.
  - Route-level code splitting using `React.lazy()` and Rollup manual chunking.
  - PWA Web App Manifest (`manifest.json`) and rich Open Graph / Twitter Card SEO metadata.
  - Pre-rendered SPA directory fallbacks (72 routes) for zero-configuration static deployment (Render, Vercel, Netlify).

---

## Project Structure

```text
MARCHY/
├── docs/
│   ├── ANTIGRAVITY_AUDIT.md      # Phase 0 baseline audit & technical findings
│   ├── ARCHITECTURE.md           # Project organization & module ownership guide
│   ├── BUYER_FRONTEND_ROADMAP.md # Buyer UX roadmap
│   ├── FRONTEND_IMPROVEMENTS_SUMMARY.md
│   └── QA_AUDIT_REPORT.md        # End-to-end Playwright & accessibility report
├── public/
│   ├── favicon.svg               # SVG brand favicon
│   ├── manifest.json             # Web App PWA Manifest
│   ├── product-placeholder.svg   # Fallback product image
│   └── _redirects                # SPA redirect configuration
├── src/
│   ├── app/
│   │   ├── ErrorBoundary.jsx     # Graceful error boundary fallback
│   │   └── MarketplaceApp.jsx    # Core app router & lazy page loader
│   ├── providers/
│   │   ├── MarketplaceContext.jsx# React Context provider for global state
│   │   └── ToastProvider.jsx     # Non-intrusive toast notifications
│   ├── components/
│   │   ├── layout/               # Header, Footer, MobileTabBar
│   │   ├── marketplace/          # ProductCard, ProductReviews, ProductSpecs
│   │   ├── seller/               # SellerAnalytics, SellerSettings
│   │   └── ui/                   # Reusable accessible UI primitives
│   ├── pages/
│   │   ├── buyer/                # HomePage, SearchPage, ProductPage, CartPage, CheckoutPage, WishlistPage, CategoriesPage, SellersPage, SellerStorefrontPage, AccountPage, BuyerOrdersPage, BuyerOrderTrackingPage
│   │   ├── seller/               # SellerLaunchPage, SellerDashboardPage, SellerPreparationPage
│   │   └── shared/               # AuthPage, HelpCenterPage, MarketplaceGuidePage, NotFoundPage, DeliveryOperationsPage, AdminOperationsPage
│   ├── data/
│   │   ├── products.js           # 40 mock products across 13 categories with specs & reviews
│   │   └── sellers.js            # 10 merchant storefronts across Tunisian cities
│   ├── hooks/
│   │   ├── useDemoOrders.js      # Synced localStorage order lifecycle
│   │   └── useMarketplaceState.js# Theme, language, cart, wishlist & coupon primitives
│   ├── i18n/
│   │   └── translate.js          # Shared English / RTL Arabic translation tree processor
│   ├── styles/
│   │   ├── design-system.css     # CSS custom property tokens, reset & components
│   │   ├── base.css              # Core typography, header, footer & layout
│   │   ├── marketplace.css       # Buyer discovery, search, product, cart & checkout styles
│   │   ├── workspaces.css        # Seller workspace, analytics, settings & operations styles
│   │   └── rtl.css               # RTL Arabic overrides
│   ├── utils/
│   │   └── marketplace.js        # Normalised search scoring, money format (TND), JSON helpers
│   ├── App.jsx                   # Application root export
│   ├── main.jsx                  # React 18 bootstrap with nested providers
│   └── styles.css                # Central style sheet entry point
├── scripts/
│   └── postbuild-spa-routes.mjs  # Post-build SPA directory generator (72 routes)
├── tests/
│   └── marketplace.spec.js       # Playwright E2E, accessibility & responsive viewports
├── index.html                    # HTML5 shell with PWA & font preconnects
├── package.json
├── playwright.config.js
└── vite.config.js                # Vite build & chunk configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 20 / 22)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/MARCHY.git
cd MARCHY

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Opens the local development server at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Builds the optimized production assets in `dist/` and runs the route fallback generator:
- **Vendor Chunk**: Separated React and router bundles for optimal HTTP caching.
- **Lazy Loaded Route Chunks**: Shopping, Seller, Operations, Support, and Discovery views load on demand.
- **SPA Route Fallbacks**: 72 pre-generated directory entry points ensuring direct URL reloads work on static hosts without server rewrites.

### Preview Build Locally

```bash
npm run preview
```

---

## Design System — Forest Green Premium Minimal

- **Signature Accent**: Forest Green (`#1f5b45` light / `#83b99d` dark), paired with warm gold (`#b58b4b`).
- **Surfaces**: High-contrast, clean elevation scale with controlled shadows.
- **Themes**: Instant toggle between Light Mode (`[data-theme="light"]`) and Dark Mode (`[data-theme="dark"]`).
- **Typography**: Inter/DM Sans for readable metadata, Manrope for bold editorial headers.
- **Accessibility**: Full WCAG AA contrast compliance, keyboard navigation focus rings, visible skip links, and ARIA modal dialog traps.
- **Internationalization**: 3-language selector (English, French, Arabic), with proper HTML `dir="rtl"` and mirrored grid alignment.

---

## Testing & Quality Assurance

Playwright E2E test suites cover:
1. Route availability across all public views (`/`, `/search`, `/product/1`, `/cart`, `/checkout`, `/seller-dashboard`, etc.).
2. Responsive layout validation across 5 standard viewport widths:
   - 360px (Small Mobile)
   - 390px (iPhone standard)
   - 768px (Tablet portrait)
   - 1024px (Tablet landscape / Laptop)
   - 1440px (Desktop)
3. Arabic RTL layout validation without horizontal scroll overflow.
4. Mobile navigation drawer and bottom navigation tab interactions.

Run tests:
```bash
npm run test:e2e
```

---

## Backend Integration Handoff

Detailed API contracts, data schemas, and backend integration requirements are documented in [FRONTEND_HANDOFF.md](docs/FRONTEND_HANDOFF.md).
