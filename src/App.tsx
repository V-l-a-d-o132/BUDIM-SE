import { useLayoutEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from './router'
import ScrollToTop from './components/ScrollToTop'
import CookieBanner from './components/feature/CookieBanner'
import ErrorBoundary from './components/base/ErrorBoundary'
import './lib/privacy'

function PrivacyRoute() {
  const { pathname, search, hash } = useLocation()
  useLayoutEffect(() => { window.BudimPrivacy?.route() }, [pathname, search, hash])
  return null
}

function App() {
  return (
    <ErrorBoundary><BrowserRouter basename={__BASE_PATH__}>
      <PrivacyRoute />
      <ScrollToTop />
      <AppRoutes />
      <CookieBanner />
    </BrowserRouter></ErrorBoundary>
  )
}

export default App
