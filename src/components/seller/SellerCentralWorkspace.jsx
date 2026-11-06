import { lazy, Suspense } from 'react'
import { SellerProfileWorkspace } from './SellerProfileWorkspace'

const SellerCatalogManager = lazy(() => import('./SellerCatalogManager').then(m => ({ default: m.SellerCatalogManager })))
const SellerInventoryWorkspace = lazy(() => import('./SellerInventoryWorkspace').then(m => ({ default: m.SellerInventoryWorkspace })))
const SellerOffersManager = lazy(() => import('./SellerOffersManager').then(m => ({ default: m.SellerOffersManager })))
const SellerOrdersWorkspace = lazy(() => import('./SellerOrdersWorkspace').then(m => ({ default: m.SellerOrdersWorkspace })))
const SellerReturnsWorkspace = lazy(() => import('./SellerReturnsWorkspace').then(m => ({ default: m.SellerReturnsWorkspace })))
const SellerFinanceWorkspace = lazy(() => import('./SellerFinanceWorkspace').then(m => ({ default: m.SellerFinanceWorkspace })))
const SellerAnalyticsWorkspace = lazy(() => import('./SellerAnalyticsWorkspace').then(m => ({ default: m.SellerAnalyticsWorkspace })))
const SellerSupportWorkspace = lazy(() => import('./SellerSupportWorkspace').then(m => ({ default: m.SellerSupportWorkspace })))

export function SellerCentralWorkspace({ section, form, update, governorates, categories, steps }) {
  if (['profile', 'operations', 'verification'].includes(section)) {
    return <SellerProfileWorkspace section={section} form={form} update={update} governorates={governorates} categories={categories} steps={steps} />
  }

  return (
    <Suspense fallback={<div className="sc-module-loading" role="status">Loading seller workspace…</div>}>
      {section === 'catalog' && <SellerCatalogManager />}
      {section === 'inventory' && <SellerInventoryWorkspace />}
      {section === 'offers' && <SellerOffersManager />}
      {section === 'orders' && <SellerOrdersWorkspace />}
      {section === 'returns' && <SellerReturnsWorkspace />}
      {section === 'finance' && <SellerFinanceWorkspace />}
      {section === 'analytics' && <SellerAnalyticsWorkspace />}
      {section === 'support' && <SellerSupportWorkspace />}
    </Suspense>
  )
}
