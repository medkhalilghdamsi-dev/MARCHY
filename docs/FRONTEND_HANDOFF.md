# MARCHY Frontend to Backend Integration Handoff

## 1. Executive Summary & Architecture

This repository is the complete frontend for **MARCHY**, a multi-vendor marketplace tailored for the Tunisian market. The application is built with **React 18**, **Vite 6**, and **React Router v7**, with modular code-splitting and full support for English, French, and Arabic (RTL).

This document serves as the formal handoff contract for the Senior Backend Engineering team. The frontend is structured such that connecting backend APIs requires zero rewriting of UI views—only replacing or configuring client service adapters.

---

## 2. Connected Workspaces & Route Registry

| Space | Routes | Primary Responsibility |
|---|---|---|
| **Buyer Marketplace** | `/`<br>`/search`<br>`/category/:category`<br>`/product/:id`<br>`/cart`<br>`/checkout`<br>`/wishlist`<br>`/categories`<br>`/sellers`<br>`/seller/:slug` | Catalogue browsing, multi-criteria filtering, product comparison, image galleries, reviews, coupons, cart grouping, multi-step checkout preview |
| **Buyer Account** | `/account`<br>`/login`<br>`/signup`<br>`/orders`<br>`/orders/:id` | Guest and authenticated buyer profiles, order history list, timeline tracking |
| **Merchant Portal** | `/sell`<br>`/seller-help`<br>`/seller-dashboard`<br>`/seller/:slug` | Onboarding guide, storefront preview, draft product creation, local order fulfilment, performance analytics (charts, KPIs), store settings (RIB, delivery policies) |
| **Delivery Operations** | `/operations/delivery` | Cross-merchant fulfilment queue, courier assignment, status updates |
| **Platform Admin** | `/admin` | Marketplace overview, store verification queues, operational controls |
| **Support & Policies** | `/help`<br>`/delivery`<br>`/returns` | Information centers, returns guidelines, customer support links |

---

## 3. Client State & LocalStorage Registry

Currently, mock and prototype state is isolated in `src/utils/marketplace.js`, `src/hooks/useMarketplaceState.js`, and `src/hooks/useDemoOrders.js`.

| Storage Key | Type | Description | Production Replacement Target |
|---|---|---|---|
| `marchy-language` | `'en' \| 'fr' \| 'ar'` | Current user locale | User profile preference + Cookie |
| `marchy-theme` | `'light' \| 'dark'` | Active design theme | User profile preference + Cookie |
| `marchy-cart` | `Array<CartItem>` | Shopping cart items | Persistent Server Cart (`/cart`) |
| `marchy-wishlist` | `Array<number>` | Saved product IDs | User Wishlist Service (`/wishlist`) |
| `marchy-recently-viewed` | `Array<number>` | Recent product IDs | Browsing history / recommendation service |
| `marchy-compare` | `Array<number>` | Up to 3 product IDs for comparison | Session / In-memory state |
| `marchy-applied-coupon` | `string` | Active coupon code | Server validated checkout session |
| `marchy-product-reviews-${id}` | `Array<Review>` | User submitted product reviews | Product Reviews Service (`/reviews`) |
| `marchy-seller-settings-${slug}` | `SellerSettings` | Merchant profile, delivery & bank info | Merchant Profile API (`/merchant/settings`) |
| `marchy-seller-drafts` | `Array<Draft>` | Uncommitted merchant product listings | Merchant Drafts API (`/merchant/drafts`) |
| `marchy-demo-operations-v1` | `Array<Order>` | Shared order queue across buyer & operations | Authoritative Order Management System |

---

## 4. Target API Contracts & Schemas

### 4.1 Product Resource
```typescript
interface Product {
  id: number;
  name: string;
  category: string;
  price: number; // e.g. 189.000 in TND
  oldPrice: number | null; // For illustrative or reference discounts
  tag?: string;
  image: string; // Primary image URL
  images?: string[]; // Multi-image gallery URLs
  description: string;
  seller: string; // "Store Name · City"
  delivery?: string;
  specs?: Record<string, string>; // Technical specs (e.g. { Material: 'Linen', Dimensions: '45x45cm' })
  rating?: number; // e.g. 4.6
  reviewCount?: number; // e.g. 42
  stock?: 'In stock' | 'Low stock' | 'Out of stock';
  badge?: 'Best seller' | 'New arrival' | 'Deal' | 'Handmade' | null;
}
```

### 4.2 Product Reviews
```typescript
// GET /api/v1/products/:id/reviews
// POST /api/v1/products/:id/reviews
interface Review {
  id: string;
  productId: number;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO format: YYYY-MM-DD
  verified: boolean; // Verified buyer flag
}
```

### 4.3 Coupon & Promotion Validation
```typescript
// POST /api/v1/coupons/validate
interface CouponValidationRequest {
  code: string;
  cartSubtotal: number;
  items: Array<{ productId: number; category: string; price: number; qty: number }>;
}

interface CouponValidationResponse {
  valid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10%, or 5.000 for 5 TND
  calculatedDiscount: number;
  message?: string;
}
```

### 4.4 Checkout & Multi-Seller Orders
```typescript
// POST /api/v1/checkouts
interface CheckoutRequest {
  idempotencyKey: string;
  deliveryDetails: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    deliveryNotes?: string;
  };
  paymentMethod: 'cash_on_delivery' | 'card' | 'wallet';
  appliedCoupon?: string;
  items: Array<{
    productId: number;
    quantity: number;
    sellerSlug: string;
  }>;
}

interface CheckoutResponse {
  checkoutGroupId: string;
  orders: Array<{
    orderId: string; // e.g. "MC-1049"
    sellerName: string;
    sellerSlug: string;
    itemsCount: number;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    status: 'Processing' | 'Ready for pickup' | 'In transit' | 'Delivered' | 'Cancelled';
  }>;
}
```

### 4.5 Merchant Analytics
```typescript
// GET /api/v1/merchant/analytics?period=7d|30d|90d|1y
interface MerchantAnalyticsResponse {
  period: '7d' | '30d' | '90d' | '1y';
  grossRevenue: number;
  previousPeriodRevenue: number;
  totalOrders: number;
  previousPeriodOrders: number;
  storefrontVisits: number;
  conversionRate: number;
  revenueTrend: Array<{
    label: string; // e.g. 'Mon' or 'Week 1'
    value: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    unitsSold: number;
    revenue: number;
    inStock: boolean;
  }>;
  regionalDistribution: Array<{
    city: string;
    percentage: number;
    amount: number;
  }>;
}
```

### 4.6 Merchant Settings
```typescript
// GET /api/v1/merchant/settings
// PUT /api/v1/merchant/settings
interface MerchantSettings {
  storeName: string;
  tagline: string;
  description: string;
  city: string;
  contactEmail: string;
  phone: string;
  handlingTime: 'Same day' | '24h' | '48h' | '3-5 days';
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryAreas: string[];
  notifyNewOrder: boolean;
  notifyLowStock: boolean;
  notifyWeeklyDigest: boolean;
  bankName: string;
  accountHolder: string;
  rib: string; // 20 digits Tunisian bank identifier
  payoutFrequency: 'Weekly' | 'Bi-weekly' | 'Monthly';
}
```

---

## 5. Security & Authentication Integration Points

1. **Tokens & Cookies**:
   - Prefer HTTP-only `Secure` SameSite cookies for access and refresh tokens.
   - When user authenticates at `/login` or `/signup`, the API response should set the session cookie and return user profile details.
2. **Guarded Routes**:
   - The frontend routes `/seller-dashboard`, `/account`, and `/admin` should be wrapped in authentication guard adapters.
   - Never trust frontend role assertions; the server must validate authorization on every REST/GraphQL endpoint.
3. **Price Validation & Payment**:
   - Prices, discounts, and delivery fees sent from the client must be re-calculated and verified server-side before persisting orders.
   - Cash on delivery requires SMS or phone verification (OTP) in production for fraud prevention in Tunisia.
   - Online payments require redirect integration with local payment switches (SMT / ClicToPay) or FinTech APIs (Flouci, Konnect).

---

## 6. Verification & Build Commands

```bash
# Verify build and bundle output
npm run build

# Preview build locally
npm run preview
```
All production builds generate directory-level `index.html` fallback entry points for 72 unique marketplace routes, ensuring seamless refreshes on static hosts.
