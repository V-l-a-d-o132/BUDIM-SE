import { useLayoutEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from './router'
import ScrollToTop from './components/ScrollToTop'
import CookieBanner from './components/feature/CookieBanner'
import './lib/privacy'

function PrivacyRoute() {
  const { pathname, search, hash } = useLocation()
  useLayoutEffect(() => { window.BudimPrivacy?.route() }, [pathname, search, hash])
  return null
}

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <PrivacyRoute />
      <ScrollToTop />
      <AppRoutes />
      <CookieBanner />
    </BrowserRouter>
  )
}

export default App
