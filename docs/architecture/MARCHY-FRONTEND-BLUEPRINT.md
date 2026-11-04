# MARCHY Frontend Architecture, UX and Design System Blueprint

**Status:** Living implementation standard / first foundation proposal
**Stack:** React 18, React Router 7, Vite 6, CSS, Playwright and axe-core
**Product:** Tunisia-first multi-vendor marketplace; English, French and Arabic RTL.

## 1. Product principles
1. Clarity before decoration: one primary task and clear hierarchy per screen.
2. Trust is a feature: price, seller identity, availability, delivery, returns and fees must be explicit and truthful.
3. Discovery should be effortless: search, filters and recommendations reduce work rather than overwhelm.
4. Mobile is first-class: touch targets, short forms, sticky actions and responsive content are intentional.
5. Localization is structural: translated content, correct lang/dir and logical CSS properties.
6. Reuse by default: shared patterns are implemented once and reused across buyer and seller surfaces.
7. No fake certainty: demo content and unavailable integrations are clearly labelled; previews never imply real payment or order placement.

## 2. Target architecture
Move incrementally from page-group modules and a shared application hook to feature-oriented modules. Do not perform a big-bang rewrite.

```text
src/
  app/                       # route table, layouts, providers, app shell
  design-system/
    tokens/                  # semantic tokens and visual foundations
    primitives/              # Button, IconButton, Input, Select, Badge
    patterns/                # ProductCard, Price, EmptyState, PageHeader
    layouts/                 # Container, PageSection, responsive grids
  features/
    discovery/               # homepage and curated collections
    search/                  # query, suggestions, filters, sorting
    catalog/                 # product listing composition and entities
    product/                 # product detail, gallery, purchase panel
    cart/                    # cart model, seller groups, quantity controls
    checkout/                # checkout steps, address, delivery, summary
    wishlist/                # saved products
    sellers/                 # seller directory and storefront
    seller-workspace/        # dashboard, products, orders, analytics
    account/                 # profile, preferences, auth entry points
    support/                 # help, delivery, returns
    localization/            # locale config, messages, formatting, direction
  shared/
    components/              # Header, Footer, MobileNavigation
    hooks/                   # reusable non-domain hooks
    lib/                     # storage, validation, formatting
    styles/                  # reset, fonts, global utilities
  data/                      # demo fixtures only, not production authority
```

### Feature module contract
Each feature owns its route composition, UI, model/state transitions, adapters and tests.

```text
features/search/
  components/
  hooks/
  model/
  pages/
  search.test.jsx
  index.js
```

- Pages compose screens; they do not contain every detail component.
- Feature components stay inside their feature unless genuinely reusable.
- Shared and design-system modules never import from features.
- Expose deliberate public feature exports; avoid cross-feature reach-through and circular imports.

### Dependency direction
```text
app -> features -> design-system/shared
app -> shared
design-system -> shared/lib only
shared -> no feature imports
data fixtures -> feature adapters until APIs exist
```

## 3. App shell and routing
Use explicit MarketplaceLayout, SellerLayout, AuthLayout and SupportLayout boundaries. Keep shared chrome appropriate to each surface.
Use one route table with metadata for title, description, breadcrumbs and layout. Unknown routes render a helpful not-found screen.
Shareable search state (query, category, sort, filters, pagination) belongs in URL parameters. Ephemeral state (open menu, modal, active popover) stays local.

## 4. State and data ownership
| State | Examples | Owner |
|---|---|---|
| URL state | query, filters, sort, page | React Router search params |
| Ephemeral UI | menu, modal, tab | local component state |
| Shared client state | cart, wishlist, locale | feature model/hooks with explicit actions |
| Persisted preferences | locale, recent views, view mode | versioned storage adapter |
| Server state (future) | products, stock, seller, orders | API/query cache |
| Form state | values, touched, validation | form-local model |

Rules:
- Never treat persisted client data as authoritative server facts.
- Use stable IDs; do not rely on object copies in local storage.
- Validate and version persisted payloads; recover safely from corrupt or old data.
- Centralize storage reads/writes and handle unavailable storage.
- Derive cart totals, seller subtotals and item counts; do not store duplicate calculated values.
- Model async states explicitly: idle, loading, success, empty and error.
- Hide API details behind feature adapters so demo fixtures can be replaced without rewriting UI.

## 5. Buyer UX information architecture
Primary navigation: Discover, Categories, Sellers, curated Deals, Search; account, wishlist and cart remain utility actions.

### Homepage hierarchy
1. Header with prominent search and clear account/cart access.
2. Focused value proposition and one primary discovery action.
3. Popular categories with recognizable labels.
4. Curated collections with a distinct editorial purpose.
5. Popular products only when supported by real signals.
6. Local sellers with accurate identity and trust context.
7. Recently viewed/personalized rows only when useful.
8. Seller invitation and informative footer.

Avoid repeating category shortcuts and product grids. Every section must add a distinct discovery path. Never claim popularity, discounts, stock or verification without evidence.

### Search and category results
- Keyboard-navigable suggestions; search remains editable.
- Show result count, active filters and clear-all.
- Use relevant filters for each product type, not irrelevant generic filters.
- On mobile, filters open in a full-height sheet with apply action and active count.
- Preserve filters in URL; keep sort and grid/list controls predictable.
- Empty results explain the issue and offer recovery actions.

### Product detail page
Above the fold: gallery, product name, price, seller identity/trust state, availability, delivery information, quantity, add-to-cart and save action.
Below the fold: description, structured specifications, delivery/returns/warranty, seller details and relevant related products.
Never invent ratings, reviews, scarcity, stock or delivery promises. Show unknown/unavailable states honestly.

### Cart and checkout
- Group cart items by seller and show seller subtotals.
- Explain delivery per seller and whether delivery can be combined.
- Make quantity changes and removal clear and reversible where practical.
- Separate item subtotal, delivery, discounts and total.
- Keep checkout short, linear and validated, with a persistent order summary.
- Never imply an order or payment succeeded without backend confirmation.

## 6. Seller UX information architecture
Seller navigation: Overview, Products, Orders, Inventory, Customers (when supported), Analytics, Storefront, Settings/Help.
Dashboard hierarchy: business status and next steps; order queue; inventory/product issues; sales summary with period; recent activity; common shortcuts.
Product creation is a guided form with validation, image guidance, category attributes, preview and explicit draft/publish states. Destructive actions require confirmation. Local/demo actions must be labelled.

## 7. Responsive and RTL rules
Initial test widths: 320-389 small mobile; 390-767 mobile; 768-1023 tablet; 1024-1439 desktop; 1440+ wide.
Use fluid containers and grid/minmax, not fixed widths. No horizontal page overflow.
RTL: set document lang/dir; prefer margin-inline, padding-inline, inset-inline, border-inline and text-align:start. Mirror only directional icons. Test mixed Arabic/Latin, TND, phone numbers, product codes and errors. Keep keyboard order logical.

## 8. Design system
### Brand direction
Modern, warm, confident and locally relevant: a restrained editorial marketplace, not a discount-heavy template.
- Brand: warm persimmon/orange for primary actions and highlights.
- Ink: deep blue-charcoal for text and navigation.
- Surfaces: white and cool neutral backgrounds.
- Status: accessible green, amber, red and blue semantic palettes.
- Use brand colour sparingly; large surfaces remain neutral.
- Typography: Manrope for display/headings and DM Sans for interface/body, with tested Arabic font fallback.

### Spacing, shape and type
- 4px base rhythm: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.
- Control radius 8px; card 12px; panel 16px; overlay 20px.
- Subtle borders are default; shadows reserved for elevation.
- Display clamp(2.25rem, 4vw, 3.5rem); H1 2-2.75rem; H2 1.5-2rem; H3 1.125-1.25rem.
- Body 1rem; supporting 0.875rem; metadata 0.75rem. Essential price/trust/delivery text must not be tiny.
- Body line-height 1.5-1.7; headings 1.1-1.25.

### Core component inventory
Primitives: Button, IconButton, Link, TextField, SearchField, Select, Checkbox, Radio, Switch, QuantityStepper, Badge, Tooltip, Divider, Skeleton, Spinner, Dialog, Drawer, Toast, Tabs, Breadcrumbs.
Marketplace patterns: ProductCard, ProductPrice, SellerIdentity, StockStatus, DeliverySummary, RatingSummary (real data only), FilterChip, FilterPanel, SortControl, ProductGallery, CartSellerGroup, OrderSummary, EmptyState, ErrorState, PageHeader, Pagination.
Seller patterns: MetricCard, OrderStatus, InventoryStatus, ProductForm, ProductTable, ActivityFeed, DashboardNavigation.
Every interactive component defines applicable default, hover, focus-visible, active, disabled, loading, error and selected states.

## 9. Accessibility and quality gates
- WCAG 2.2 AA target; semantic landmarks and one clear H1 per page.
- Visible focus; full keyboard operation; no keyboard traps.
- Accessible names for icon-only actions; field errors linked and announced.
- Dialogs manage focus and restore it on close.
- Touch targets aim for 44x44 CSS px.
- Contrast 4.5:1 normal text and 3:1 large text/UI boundaries.
- Respect reduced motion.
- Test EN, FR and AR, including mixed-direction content.

## 10. Performance budgets
Initial targets to measure: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at 75th percentile. Initial JS target <= 200 KB gzip before route chunks, subject to measurement.
Lazy-load below-fold images and route modules; use responsive image sizes, dimensions/aspect ratios and modern formats. Limit font weights. Keep third-party scripts off the critical path.

## 11. Delivery roadmap
1. Foundation: semantic tokens, component contracts, CSS consolidation, layout shells, route metadata and storage validation.
2. Buyer: navigation/homepage, search/filters, category/product pages, cart and checkout.
3. Seller: dedicated layout/navigation, actionable overview, product management, order/inventory workflows when APIs exist.
4. Quality: visual regression, Playwright/axe, Lighthouse, real-device, keyboard, reduced-motion and RTL verification.

## 12. Definition of done
- Clear user goal and one primary action.
- Existing design tokens and shared components used.
- Tested at 320, 390, 768, 1024 and 1440px.
- EN, FR and AR RTL verified.
- Loading, empty, error, success and disabled states where relevant.
- Keyboard and screen-reader accessible.
- Critical path automated tests pass.
- No unsupported claims about products, sellers, price, stock, reviews or transactions.
- No console errors or horizontal overflow at supported viewports.

## 13. Migration guardrails
- Preserve existing public routes while reorganizing internals.
- Do not replace the stack or add a state library without evidence.
- Migrate one feature/pattern at a time, with tests.
- Measure before optimizing; never claim performance/accessibility scores without running tools.
- Keep the current prototype honest until real APIs and operational policies exist.