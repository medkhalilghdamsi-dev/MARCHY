# MARCHY — Backend Integration & Architecture Handoff

**Target Release**: Production Backend Services Integration  
**Branch**: `khalil`  
**Brand Motto**: EVERYDAY COMMERCE, MADE EASIER.  
**Author**: Principal Frontend Architect & API Integration Team  

---

## 1. Overview & Architectural Boundaries

MARCHY is a high-performance React 18 / Vite SPA designed for multi-vendor commerce in Tunisia with international expansion capabilities.
The frontend has been built with realistic client-side simulations (`MarketplaceService.js`, `useMarketplaceState.js`, `useDemoOrders.js`).

This document defines the strict contract, data models, error handling, and communication protocol required for backend engineering teams to connect their RESTful or GraphQL microservices to the MARCHY frontend without requiring UI refactoring.

```
+-------------------------------------------------------------------------+
|                           MARCHY FRONTEND                               |
| (React 18, React Router 7, Vite 6, Mobile-First, RTL Arabic & French)   |
+-------------------------------------------------------------------------+
                                    |
                    HTTPS / JSON REST API (Bearer JWT)
                                    v
+-------------------------------------------------------------------------+
|                         API GATEWAY / ROUTER                            |
|             (/api/v1/*, Rate Limiting, CORS, Trace-ID)                 |
+-------------------------------------------------------------------------+
       |                  |                   |                  |
       v                  v                   v                  v
[Auth & Users]   [Catalog & Search]   [Cart & Orders]    [Vendors & Payout]
```

---

## 2. Authentication & Session Protocol

### Headers
Every authenticated request from the client includes:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
X-Marchy-Language: en | fr | ar
X-Marchy-Currency: TND
X-Client-Version: 1.0.0
Content-Type: application/json
```

### Endpoints

#### `POST /api/v1/auth/login`
- **Request Body**:
```json
{
  "email": "customer@example.tn",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "d7a8f9c2-...",
  "expiresIn": 86400,
  "user": {
    "id": "usr-8821",
    "name": "Nour Ben Salem",
    "email": "customer@example.tn",
    "phone": "+216 98 123 456",
    "role": "buyer",
    "governorate": "Tunis",
    "city": "La Marsa",
    "address": "14 Rue de la République"
  }
}
```

#### `GET /api/v1/auth/me`
Fetches current session profile and saved addresses.

---

## 3. Product Catalog & Multi-Vendor Offers API

### `GET /api/v1/products`
Supports faceted filtering, search, sorting, and pagination.

- **Query Parameters**:
  - `q`: Search keyword (e.g. `espresso`, `olive`)
  - `category`: Category slug (e.g. `electronics`, `groceries`)
  - `seller`: Seller slug (e.g. `atlas-tech-tunis`)
  - `minPrice`: Minimum price in TND (e.g. `50`)
  - `maxPrice`: Maximum price in TND (e.g. `500`)
  - `rating`: Minimum rating threshold (e.g. `4`)
  - `sort`: `featured` | `price-low` | `price-high` | `rating` | `newest`
  - `page`: Page index (1-based)
  - `limit`: Items per page (default: `20`)

- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": 101,
      "name": "Artisan Cold-Pressed Extra Virgin Olive Oil 1L",
      "slug": "artisan-cold-pressed-extra-virgin-olive-oil-1l",
      "category": "Groceries",
      "price": 28.500,
      "compareAtPrice": 34.000,
      "currency": "TND",
      "rating": 4.9,
      "reviewCount": 142,
      "stock": 45,
      "image": "/products/olive-oil.jpg",
      "badge": "Best Seller",
      "featured": true,
      "seller": {
        "slug": "souks-frais-tunis",
        "name": "Souks Frais Tunis",
        "city": "Tunis",
        "rating": 4.9,
        "verified": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 158,
    "totalPages": 8
  },
  "facets": {
    "categories": [{ "slug": "groceries", "count": 48 }, { "slug": "home", "count": 32 }],
    "governorates": [{ "name": "Tunis", "count": 82 }, { "name": "Sousse", "count": 45 }],
    "priceRange": { "min": 5.000, "max": 2400.000 }
  }
}
```

### `GET /api/v1/products/:id`
Retrieves single product detail with media gallery, specifications, and default buy-box offer.

### `GET /api/v1/products/:id/offers`
Retrieves all competing merchant offers for this product.

- **Response `200 OK`**:
```json
{
  "productId": 101,
  "offers": [
    {
      "sellerSlug": "souks-frais-tunis",
      "sellerName": "Souks Frais Tunis",
      "sellerCity": "Tunis",
      "sellerRating": 4.9,
      "price": 28.500,
      "stock": 45,
      "deliveryDays": "24–48h",
      "isBuyBoxWinner": true,
      "isOfficial": true
    },
    {
      "sellerSlug": "daily-essentials-monastir",
      "sellerName": "Daily Essentials Monastir",
      "sellerCity": "Monastir",
      "sellerRating": 4.7,
      "price": 29.800,
      "stock": 18,
      "deliveryDays": "48–72h",
      "isBuyBoxWinner": false,
      "isOfficial": false
    }
  ]
}
```

---

## 4. Multi-Vendor Cart & Stock Reservation

### `POST /api/v1/cart/validate`
Validates inventory availability and calculates coupons prior to checkout.

- **Request Body**:
```json
{
  "items": [
    { "productId": 101, "sellerSlug": "souks-frais-tunis", "qty": 2, "variant": null },
    { "productId": 204, "sellerSlug": "atlas-tech-tunis", "qty": 1, "variant": "Silver 128GB" }
  ],
  "couponCode": "MARCHY10"
}
```

- **Response `200 OK`**:
```json
{
  "valid": true,
  "subtotal": 188.500,
  "discount": 18.850,
  "total": 169.650,
  "items": [
    {
      "productId": 101,
      "sellerSlug": "souks-frais-tunis",
      "availableStock": 45,
      "inStock": true,
      "unitPrice": 28.500,
      "lineTotal": 57.000
    },
    {
      "productId": 204,
      "sellerSlug": "atlas-tech-tunis",
      "availableStock": 12,
      "inStock": true,
      "unitPrice": 131.500,
      "lineTotal": 131.500
    }
  ],
  "coupon": {
    "code": "MARCHY10",
    "description": "10% Platform Welcome Discount",
    "discountAmount": 18.850
  }
}
```

---

## 5. Multi-Vendor Order Placement & Splitting (P0)

Because MARCHY is a multi-vendor marketplace, a single customer order containing items from multiple independent vendors is split into distinct sub-orders.

### `POST /api/v1/checkout/orders`

- **Request Body**:
```json
{
  "customer": {
    "name": "Kmar Trabelsi",
    "phone": "+216 22 345 678",
    "governorate": "Sousse",
    "address": "Appartement 4B, Résidence les Oliviers, Khezama Ouest",
    "notes": "Call upon arrival at the gate"
  },
  "shippingMethod": "Standard courier (seller confirmed)",
  "paymentMethod": "Cash on delivery · Pay upon inspection",
  "couponCode": "MARCHY10",
  "items": [
    {
      "productId": 101,
      "sellerSlug": "souks-frais-tunis",
      "sellerName": "Souks Frais Tunis",
      "price": 28.500,
      "qty": 2,
      "variant": null
    },
    {
      "productId": 305,
      "sellerSlug": "maison-sousse",
      "sellerName": "Maison Sousse",
      "price": 85.000,
      "qty": 1,
      "variant": "Terracotta"
    }
  ]
}
```

- **Response `201 Created`**:
```json
{
  "masterOrderId": "MC-9024",
  "placedAt": "2026-11-07T12:00:00Z",
  "customer": {
    "name": "Kmar Trabelsi",
    "phone": "+216 22 345 678",
    "governorate": "Sousse",
    "address": "Appartement 4B, Résidence les Oliviers, Khezama Ouest"
  },
  "payment": {
    "method": "Cash on delivery",
    "terms": "Pay upon inspection with courier",
    "currency": "TND",
    "totalDue": 127.800
  },
  "subOrders": [
    {
      "subOrderId": "MC-9024-A",
      "sellerSlug": "souks-frais-tunis",
      "sellerName": "Souks Frais Tunis",
      "sellerCity": "Tunis",
      "status": "Order Placed",
      "subtotal": 57.000,
      "discount": 5.700,
      "total": 51.300,
      "estimatedDispatch": "Within 24 hours",
      "items": [
        {
          "productId": 101,
          "name": "Artisan Cold-Pressed Extra Virgin Olive Oil 1L",
          "qty": 2,
          "price": 28.500
        }
      ]
    },
    {
      "subOrderId": "MC-9024-B",
      "sellerSlug": "maison-sousse",
      "sellerName": "Maison Sousse",
      "sellerCity": "Sousse",
      "status": "Order Placed",
      "subtotal": 85.000,
      "discount": 8.500,
      "total": 76.500,
      "estimatedDispatch": "Same-day pickup available",
      "items": [
        {
          "productId": 305,
          "name": "Handmade Glazed Ceramic Planter",
          "qty": 1,
          "price": 85.000
        }
      ]
    }
  ]
}
```

---

## 6. Order Tracking & Lifecycle Webhooks

### Order Status Progression
The backend manages the status machine:
```
Order Placed -> Merchant Confirmed -> In Preparation -> Handed to Courier -> Out for Delivery -> Delivered
      \
       +--> Cancelled (by customer or merchant prior to courier handover)
```

### `GET /api/v1/orders/:id`
Retrieves live order tracking information, courier tracking link, status timeline, and downloadable PDF receipt metadata.

---

## 7. Webhook Integrations for Local Couriers & Gateways

### Local Courier Handover Webhook
```http
POST /api/v1/webhooks/courier-dispatch
X-Marchy-Webhook-Signature: sha256=...
```
```json
{
  "event": "parcel.status_changed",
  "orderId": "MC-9024-A",
  "carrier": "Aramex / First Delivery / Rapid Poste",
  "trackingNumber": "TN-88371940",
  "status": "Out for Delivery",
  "updatedAt": "2026-11-07T14:30:00Z"
}
```

### Payment Gateway Webhook (ClicToPay / Flouci / Konnect)
```http
POST /api/v1/webhooks/payment-settlement
X-Marchy-Signature: sha256=...
```
```json
{
  "event": "payment.settled",
  "masterOrderId": "MC-9024",
  "transactionReference": "TX-CLIC-88392",
  "amount": 127.800,
  "currency": "TND",
  "status": "SUCCESS"
}
```

---

## 8. Frontend Integration Strategy (Zero Downtime)

To swap from the mock simulation layer to live backend endpoints:
1. Environment Configuration:
   Set `VITE_API_BASE_URL=https://api.marchy.tn/v1` in production `.env`.
2. Client Service Adapter:
   The existing `MarketplaceService.js` will inspect `import.meta.env.VITE_API_BASE_URL`. If configured, it performs `fetch()` with credentials; if omitted, it smoothly falls back to the client simulation.
3. No React component or JSX file needs modification during backend cutover.
