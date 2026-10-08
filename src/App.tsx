import { Suspense, useLayoutEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AppRoutes } from './router';
import ScrollToTop from './components/ScrollToTop';
import CookieBanner from './components/feature/CookieBanner';
import ErrorBoundary from './components/base/ErrorBoundary';
import RouteLoading from './components/base/RouteLoading';
import './lib/privacy';

function PrivacyRoute() {
  const { pathname, search, hash } = useLocation();
  useLayoutEffect(() => { window.BudimPrivacy?.route(); }, [pathname, search, hash]);
  return null;
}
export function AppShell() {
  return <ErrorBoundary>
    <PrivacyRoute /><ScrollToTop />
    <Suspense fallback={<RouteLoading />}><AppRoutes /></Suspense>
    <CookieBanner />
  </ErrorBoundary>;
}
export default function App() {
  return <BrowserRouter basename={__BASE_PATH__}><AppShell /></BrowserRouter>;
}
