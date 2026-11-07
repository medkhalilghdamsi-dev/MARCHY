import { BadgeCheck, BarChart3, Building2, ClipboardCheck, LifeBuoy, RotateCcw, ShieldCheck, Store, Truck, Wallet } from 'lucide-react'

export const SELLER_CENTRAL_SECTIONS = Object.freeze([
  { id: 'profile', label: 'Business profile', icon: Building2, eyebrow: 'YOUR BUSINESS PROFILE', title: 'Tell us about your business', description: 'These details help establish the identity and location of your future storefront.' },
  { id: 'catalog', label: 'Product catalogue', icon: Store, eyebrow: 'SELLER PRODUCT CATALOGUE', title: 'Manage your product catalogue', description: 'Create listings with seller SKUs, prices, variants and stock. Customer publishing remains locked until real seller approval.' },
  { id: 'inventory', label: 'Inventory', icon: Truck, eyebrow: 'SELLER INVENTORY', title: 'Control seller stock and variants', description: 'Review SKU-level quantities, record stock movements and configure low-stock thresholds.' },
  { id: 'offers', label: 'Offers & pricing', icon: BadgeCheck, eyebrow: 'SELLER OFFERS', title: 'Configure seller-specific offers and pricing', description: 'Set prices, promotions, delivery and payment preferences for each listing.' },
  { id: 'orders', label: 'Orders & fulfilment', icon: ClipboardCheck, eyebrow: 'SELLER ORDERS', title: 'Manage incoming orders and parcel preparation', description: 'Review orders assigned to your storefront, prepare parcels and record courier handoff readiness.' },
  { id: 'returns', label: 'Returns & refunds', icon: RotateCcw, eyebrow: 'RETURNS MANAGEMENT', title: 'Review return requests and inspection outcomes', description: 'Handle buyer return requests, record receipt and inspection, and refer refunds for platform review.' },
  { id: 'finance', label: 'Finance & settlements', icon: Wallet, eyebrow: 'SELLER FINANCE', title: 'Review seller proceeds, COD reconciliation and settlement records', description: 'Review illustrative transaction activity and understand the future finance workflow. No real money movement is connected.' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, eyebrow: 'BUSINESS INTELLIGENCE', title: 'Understand order activity, product demand and business performance', description: 'Explore order trends, delivered sales, top products and customer locations using local demo records.' },
  { id: 'support', label: 'Support & disputes', icon: LifeBuoy, eyebrow: 'SELLER SUPPORT', title: 'Track seller support requests, return disputes and case history', description: 'Create local cases, record notes, track statuses and organise return or operational disputes.' },
  { id: 'operations', label: 'Operations preferences', icon: Truck, eyebrow: 'FULFILMENT PREFERENCES', title: 'How will you fulfil orders?', description: 'Set realistic expectations for delivery and payment handling in Tunisia.' },
  { id: 'verification', label: 'Verification readiness', icon: ShieldCheck, eyebrow: 'SELLER VERIFICATION', title: 'Verification readiness', description: 'Prepare accurate business information. Document collection and verification are not yet enabled in this prototype.' }
])

export const SELLER_CENTRAL_SECTION_IDS = new Set(SELLER_CENTRAL_SECTIONS.map(section => section.id))
