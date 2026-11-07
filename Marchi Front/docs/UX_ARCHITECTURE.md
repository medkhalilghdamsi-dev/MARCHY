# MARCHY — Complete Buyer UX Architecture

**Status:** UX architecture baseline  
**Scope:** Buyer experience / frontend only  
**Branch:** `khalil`  
**Product vision:** A Tunisia-first marketplace that makes discovering, comparing, saving and buying products feel as effortless as a world-class marketplace while remaining clear about what is real, confirmed and illustrative.

---

## 1. UX north star

MARCHY should answer five questions immediately:

1. **What can I find here?**
2. **Can I find the right product quickly?**
3. **Can I understand the real offer before I decide?**
4. **Can I compare/save/move between products without losing context?**
5. **Can I complete checkout with confidence and know exactly what happens next?**

### Core UX principles

- **Discovery first:** search, categories, recommendations and merchandising are always visible paths.
- **Clarity before persuasion:** price, variant, seller, availability, delivery and important limitations are separated clearly.
- **Progressive disclosure:** simple cards first; richer information when the buyer asks for it.
- **One continuous journey:** every page should preserve search context, filters, saved state, cart state and return paths.
- **Local by default:** TND, Tunisia-relevant language, governorates, delivery expectations and local storefront discovery.
- **Trust without fake trust:** never imply verification, payment processing, delivery guarantees or live stock when the frontend cannot establish them.
- **Fast decisions:** every listing should expose enough information to compare without opening ten pages.
- **Mobile-first interaction:** thumb-friendly controls, sticky purchase actions and bottom navigation.
- **RTL as a first-class layout:** Arabic changes direction and alignment without breaking hierarchy or interaction.
- **Accessible by default:** keyboard navigation, focus states, semantic labels, contrast, reduced motion and screen-reader-friendly controls.

---

## 2. Global information architecture

### Primary buyer navigation

**Header**
- MARCHY logo → Home
- Global search
- Language: EN / FR / عربي
- Theme
- Saved / Wishlist
- Account / Sign in
- Cart

**Primary category navigation**
- Shop by category
- High-value categories
- Sellers
- Deals

**Mobile navigation**
- Home
- Search
- Categories
- Saved
- Cart
- Account

### Secondary navigation

- Categories
- Sellers
- Help
- Delivery
- Returns
- Account
- Orders
- Recently viewed
- Wishlist

### Navigation rule

The buyer should never need to return to the homepage to continue shopping. Search, breadcrumbs, category context, filters and persistent cart/saved state must provide a continuous path.

---

## 3. Complete buyer journey map

### Journey A — Browse and discover

Home
→ category / search
→ results
→ product
→ save or add to cart
→ cart
→ checkout
→ order confirmation / tracking

### Journey B — Search-led

Search
→ autocomplete
→ results
→ refine
→ compare candidates
→ product
→ cart

### Journey C — Category-led

Home / Categories
→ category landing
→ subcategory / result set
→ filter + sort
→ product
→ related products
→ cart

### Journey D — Intent to compare

Search / category
→ product A
→ save
→ product B
→ save
→ wishlist
→ compare
→ product decision
→ cart

### Journey E — Return visitor

Home
→ recently viewed / saved
→ product
→ cart
→ checkout

### Journey F — Post-purchase

Account / Orders
→ order
→ order status
→ seller / delivery information
→ help / returns

---

## 4. Screen architecture

### 4.1 Home

**Purpose:** create discovery momentum.

Order:
1. Global navigation
2. Hero + primary search
3. Trending searches
4. Budget shortcuts
5. Key marketplace benefits
6. Quick category discovery
7. Category visual grid
8. Featured products
9. Recently viewed
10. Deals / price comparison
11. Seller discovery
12. Marketplace disclosure / footer

**Primary CTA:** Search / Explore  
**Secondary CTAs:** category, product, seller, deals

Home must never become a static marketing page. It is the marketplace's discovery engine.

---

### 4.2 Search / category results

**Purpose:** reduce the distance between intent and the correct product.

Layout:
- Breadcrumb / query context
- Search title + result count
- Search refinement trigger
- Filter chips
- Sort control
- Active-filter summary
- Product grid
- Empty state / recovery suggestions
- Pagination or progressive loading
- Recently viewed / related discovery

**Filters**
- Category
- Price range
- Seller / storefront
- Location
- Availability
- Rating/reviews when real data exists
- Discount
- Variant attributes relevant to category

**Sort**
- Recommended
- Price: low → high
- Price: high → low
- Newest
- Best rated when supported
- Discount
- Relevance for search

**Critical rule:** filter state belongs to the URL so refresh, back/forward and sharing preserve the shopping context.

---

### 4.3 Product detail

**Purpose:** convert interest into a confident decision.

Above the fold:
- Image gallery + thumbnails
- Product title
- Rating / review summary when supported
- Price
- Previous price / discount when supported
- Variant selector
- Availability status
- Seller identity
- Key delivery information
- Add to cart
- Save
- Buy / checkout path where supported

Below:
1. Product overview
2. Specifications
3. What's included
4. Delivery
5. Returns
6. Seller storefront preview
7. Reviews
8. Related products
9. Frequently considered together
10. Recently viewed

**Mobile:** sticky bottom purchase bar.

**Decision rule:** the buyer should be able to answer *what is it, how much is it, who sells it, what option am I buying, when/how might I receive it, and what happens if there is a problem* without hunting through the page.

---

### 4.4 Wishlist / Saved

**Purpose:** turn temporary interest into a persistent decision workspace.

Features:
- Saved count
- Product grid
- Category grouping
- Price visibility
- Availability/change indicators when real data exists
- Remove
- Add to cart
- Compare
- Continue shopping

Empty state:
- explain value
- show a direct discovery CTA
- teach the heart interaction

---

### 4.5 Compare

**Purpose:** reduce decision friction.

Compare architecture:
- Select products from results/product pages
- Floating compare tray
- Maximum practical comparison set
- Compare table
- Image + title + seller + price
- Key specifications
- Variant differences
- Delivery/availability differences
- Remove / replace
- Add chosen product to cart

On mobile, use horizontal scrolling with sticky product identity.

---

### 4.6 Cart

**Purpose:** verify the basket before commitment.

Structure:
- Cart title + item count
- Seller grouping
- Product image
- Product title
- Selected variant
- Unit price
- Quantity controls
- Remove
- Save for later
- Seller subtotal
- Delivery status
- Cart subtotal
- Coupon
- Estimated total
- Checkout CTA
- Continue shopping

**Multi-seller rule:** clearly separate seller subtotals and seller-specific delivery confirmation.

---

### 4.7 Checkout

**Purpose:** complete the transaction with minimum uncertainty.

Steps:
1. Delivery details
2. Order review
3. Payment / confirmation when real integration exists
4. Confirmation

Persistent summary:
- Items
- Seller groups
- Product subtotal
- Delivery
- Discounts
- Final total

UX requirements:
- clear validation
- inline errors
- preserve entered data
- editable previous steps
- mobile-friendly forms
- no surprise costs
- explicit payment state
- explicit order state

For the current frontend prototype, demo actions must remain visually distinct from real marketplace actions.

---

### 4.8 Order confirmation

Show:
- Order number
- Status
- Seller(s)
- Products
- Amount
- Delivery information
- Next step
- Track order
- Continue shopping
- Help / returns

Avoid dead-end confirmation pages.

---

### 4.9 Orders / tracking

Order list:
- Order ID
- Date
- Seller
- Item count
- Total
- Current status

Order detail:
- status timeline
- seller
- items
- delivery information
- payment state
- support
- return path

Status model:
**Placed → Confirmed → Preparing → Dispatched → Out for delivery → Delivered**

Additional states:
**Cancelled / Return requested / Returned / Failed delivery**

Only expose states that the backend can actually support when integrated.

---

### 4.10 Account

Account is a **shopping control centre**, not a generic profile page.

Priority:
- Orders
- Saved items
- Recently viewed
- Cart
- Preferences
- Language
- Help
- Delivery / returns
- Sign in / sign out

Avoid presenting fake account functionality. Current preview/session language must remain explicit until authentication exists.

---

### 4.11 Sellers

Seller directory:
- Search
- Category
- Location
- Seller cards
- Product count
- Storefront entry

Seller storefront:
- seller identity
- location
- catalogue
- categories
- seller-specific discovery
- seller information
- product grid

Buyer should always have a route from product → seller → other products.

---

### 4.12 Categories

Category hub:
- visual department grid
- category names
- product counts when available
- popular categories
- direct search
- subcategories

Category landing:
- category identity
- featured products
- refinement
- sort
- related categories
- seller discovery

---

## 5. Search UX architecture

### Global search

States:
- idle
- focused
- typing
- autocomplete
- recent searches
- category suggestions
- product suggestions
- no suggestions
- submitted
- no results

Autocomplete priority:
1. exact product/category matches
2. popular/recent query
3. category
4. seller
5. broader suggestions

Keyboard:
- Arrow Up/Down moves through suggestions
- Enter submits
- Escape closes
- focus remains predictable

Mobile:
- search opens as a dedicated full-width interaction
- clear button
- recent searches
- back/close control

---

## 6. Product-card architecture

Every product card should communicate:

**Image → product name → seller → price → discount/reference price → rating if supported → availability/delivery cue → save → quick add**

Interaction:
- entire card opens product
- heart does not navigate
- quick add confirms action
- selected variant is respected
- hover enhancement must not be required for touch devices

Card states:
- default
- hover
- focus
- saved
- added
- unavailable
- loading
- image error

---

## 7. Trust architecture

Trust must be layered.

### Layer 1 — factual UI
- price
- seller
- location
- product details
- variant
- delivery information

### Layer 2 — evidence
- reviews
- seller information
- order history
- delivery tracking
- verified badges only when backed by real data

### Layer 3 — reassurance
- returns
- support
- payment protection
- delivery guarantees only when actually implemented

Never manufacture trust signals.

---

## 8. Feedback and system states

Every meaningful action needs a response.

### Action feedback
- Added to cart → toast + cart count update
- Saved → heart state + toast
- Removed → undo opportunity
- Coupon applied → inline confirmation
- Form error → field-level error
- Checkout step → progress state
- Order placed → confirmation state

### Global states
- Loading
- Empty
- Error
- Success
- Offline / unavailable
- Partial data
- Not found

Feedback should be short, contextual and non-blocking.

---

## 9. Mobile UX architecture

Mobile is not a smaller desktop.

### Persistent
- bottom navigation
- cart count
- search access
- saved access

### Mobile-specific
- sticky product purchase bar
- filter bottom sheet
- sort bottom sheet
- horizontally scrollable chips
- swipe/scroll image gallery
- compact seller cards
- large touch targets
- collapsible specifications
- sticky checkout summary where appropriate

Target interaction sizes: approximately 44px minimum for primary controls.

---

## 10. Responsive layout system

### Mobile
**320–767px**
- one-column
- compact header
- bottom navigation
- 2-column product grid where content permits
- full-width filters

### Tablet
**768–1023px**
- two-column content
- expanded search
- adaptive product grid
- side filter where space permits

### Desktop
**1024px+**
- full navigation
- multi-column product grids
- persistent refinement
- richer product detail layout
- multi-column checkout

### Large desktop
Use additional whitespace and grid width rather than simply enlarging cards.

---

## 11. Arabic / RTL architecture

Arabic is a complete layout mode.

Requirements:
- `dir="rtl"`
- mirrored spacing and alignment
- logical CSS properties
- correct icon direction
- breadcrumb order
- filter drawer direction
- product gallery controls
- checkout step progression
- numeric data remains readable
- mixed Arabic/Latin product names remain stable

Never solve RTL by simply text-aligning everything right.

---

## 12. Accessibility architecture

Every page must support:

- semantic landmarks
- one logical H1
- keyboard navigation
- visible focus
- descriptive labels
- accessible button names
- form errors connected to fields
- alt text for meaningful imagery
- decorative images hidden from assistive technology
- sufficient contrast
- reduced motion
- no keyboard traps
- logical tab order
- live regions for cart/toast updates

Accessibility is part of the interaction model, not a final QA task.

---

## 13. Performance UX

Perceived speed priorities:

1. Render meaningful shell immediately.
2. Keep navigation responsive.
3. Lazy-load secondary routes.
4. Lazy-load below-the-fold imagery.
5. Reserve image space to prevent layout shift.
6. Use skeletons for route transitions.
7. Avoid blocking interaction on non-critical UI.
8. Compress and size images appropriately.
9. Keep product-card rendering efficient.
10. Preserve state during navigation.

---

## 14. Error recovery architecture

### Search error
Show:
- query
- alternative spelling
- category suggestions
- popular categories
- clear filters

### Product not found
Show:
- clear explanation
- return to search
- related products
- categories

### Empty cart
Show:
- clear message
- continue shopping
- popular categories
- recently viewed

### Empty wishlist
Show:
- explanation
- how to save
- discovery CTA

### Checkout error
Preserve all entered fields and explain exactly what needs correction.

---

## 15. State architecture

Buyer state should be conceptually separated into:

**Navigation state**
- route
- query
- category
- filters
- sort
- pagination

**Shopping state**
- cart
- selected variants
- wishlist
- recently viewed

**Preference state**
- language
- theme
- display preferences

**Session state**
- authentication/session status

**Transaction state**
- checkout details
- order
- payment state

**UI state**
- drawers
- modals
- toasts
- loading states
- expanded sections

URL state should own shareable shopping context. Local/device state should own temporary preview state until real persistence exists.

---

## 16. Cross-page continuity rules

The buyer should retain:

- search query
- active filters
- sort
- selected category
- wishlist state
- cart state
- recently viewed
- language
- theme
- checkout form progress

Back/forward navigation must restore the visible shopping state, not merely the URL.

---

## 17. Conversion architecture

The marketplace funnel is:

**Discover → Find → Evaluate → Save/Compare → Cart → Checkout → Confirm → Track → Return**

Every page gets one primary job.

| Page | Primary job |
|---|---|
| Home | Start discovery |
| Search | Find candidates |
| Category | Explore a department |
| Product | Make a decision |
| Wishlist | Compare/save |
| Compare | Decide |
| Cart | Verify basket |
| Checkout | Complete |
| Confirmation | Reassure |
| Orders | Track |
| Account | Manage |
| Seller | Explore storefront |
| Help | Recover from uncertainty |

---

## 18. Buyer UX component system

Reusable primitives:

- Header
- Search
- Breadcrumbs
- Page heading
- Section heading
- Product card
- Product grid
- Seller card
- Category card
- Filter chip
- Filter drawer
- Sort control
- Price display
- Rating
- Variant selector
- Quantity control
- Save button
- Compare control
- Add-to-cart control
- Toast
- Modal
- Drawer
- Empty state
- Error state
- Skeleton
- Stepper
- Order timeline
- Summary card
- Footer
- Mobile bottom navigation

Components should communicate the same states and terminology everywhere.

---

## 19. UX content rules

Use:
- short labels
- concrete actions
- consistent terminology
- plain language
- buyer-focused benefits
- explicit uncertainty

Prefer:
- **Save**
- **Add to cart**
- **Compare**
- **Review order**
- **Track order**
- **Delivery to be confirmed**

Avoid:
- vague marketing claims
- fake verification language
- unexplained badges
- hidden fees
- false urgency
- invented stock
- invented delivery promises

---

## 20. Definition of a 9.5/10 buyer experience

MARCHY reaches the target when:

- a new buyer understands the marketplace within seconds;
- search can be started from anywhere;
- results can be refined without losing context;
- product cards enable rapid comparison;
- product pages answer purchase-critical questions;
- save/compare/cart actions are instant and obvious;
- multi-seller carts remain understandable;
- checkout is linear and reassuring;
- order tracking is comprehensible;
- mobile is as intentional as desktop;
- Arabic RTL feels native;
- keyboard/accessibility flows work;
- loading, empty and error states are designed;
- no UI claims capabilities the product does not have;
- the whole journey feels like one coherent product rather than separate pages.

---

## 21. Implementation priority

### P0 — Journey integrity
- Search state persistence
- Back/forward restoration
- Product → cart continuity
- Variant-safe cart interactions
- Checkout continuity
- Empty/error recovery

### P1 — Discovery
- Search autocomplete
- Result refinement
- Category hierarchy
- Product-card decision density
- Recently viewed
- Wishlist

### P2 — Decision support
- Compare
- richer product information
- seller context
- delivery/returns clarity
- reviews/specifications presentation

### P3 — Mobile
- bottom navigation
- filter/sort sheets
- sticky purchase bar
- touch interactions
- mobile checkout

### P4 — Localization
- complete Arabic RTL
- French/English consistency
- localized commerce terminology

### P5 — Polish
- motion
- micro-interactions
- visual hierarchy
- loading transitions
- empty/error states
- performance refinements
- accessibility refinements

---

## 22. Current MARCHY architecture mapped to the target

Current buyer routes already provide the major foundation:

- `/` Home
- `/search` Search
- `/category/:category` Category results
- `/product/:id` Product
- `/cart` Cart
- `/checkout` Checkout
- `/wishlist` Saved
- `/categories` Categories
- `/sellers` Seller directory
- `/seller/:slug` Seller storefront
- `/account` Account
- `/orders` Orders
- `/orders/:id` Order tracking
- `/help` Help
- `/delivery` Delivery
- `/returns` Returns

The architecture therefore focuses the next frontend work on **journey quality, state continuity, decision support, mobile execution, accessibility and polish**, rather than adding unnecessary pages.

---

## 23. Final UX operating model

MARCHY should feel like one continuous shopping system:

**HOME**
→ discover

**SEARCH / CATEGORY**
→ narrow

**PRODUCT**
→ understand

**SAVE / COMPARE**
→ decide

**CART**
→ verify

**CHECKOUT**
→ commit

**ORDER**
→ follow

**ACCOUNT**
→ return

**SELLER**
→ discover more

**HELP**
→ recover

Every transition should preserve context, provide feedback and make the next action obvious.

This is the UX architecture baseline for the buyer-facing MARCHY frontend. Backend capabilities must later plug into these interfaces without forcing a redesign of the buyer journey.
