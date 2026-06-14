import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const location = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    const appMain = document.querySelector('.app-shell main')
    if (appMain instanceof HTMLElement) {
      appMain.scrollTop = 0
    }
  }, [location.pathname, location.search])

  return null
}
