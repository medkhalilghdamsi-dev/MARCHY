import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <main id="main-content" className="auth-layout">
      <Outlet />
    </main>
  )
}
