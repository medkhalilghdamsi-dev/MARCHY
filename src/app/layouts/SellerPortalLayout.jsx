import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { SellerPortalHeader, SellerPortalFooter } from '../../components/layout/SellerPortalChrome'

export function SellerPortalLayout() {
  return (
    <>
      <SellerPortalHeader />
      <main id="main-content">
        <Outlet />
      </main>
      <Suspense fallback={null}>
        <SellerPortalFooter />
      </Suspense>
    </>
  )
}
