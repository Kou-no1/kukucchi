import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export function AppShell({
  children,
  title,
  backTo = '/home',
  className = '',
}: {
  children: ReactNode
  title: string
  backTo?: string
  className?: string
}) {
  const location = useLocation()
  const showBack = location.pathname !== '/home'

  return (
    <div className={['app-shell', className].filter(Boolean).join(' ')}>
      <header className="top-bar">
        {showBack ? (
          <Link className="icon-button" to={backTo} aria-label="もどる">
            ←
          </Link>
        ) : (
          <span className="brand-mark" aria-hidden="true">
            く
          </span>
        )}
        <h1>{title}</h1>
        <Link className="icon-button" to="/settings" aria-label="せってい">
          ⚙
        </Link>
      </header>
      <main>{children}</main>
    </div>
  )
}
