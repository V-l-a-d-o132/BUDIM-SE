import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import ScrollToTop from './components/ScrollToTop'
import CookieBanner from './components/feature/CookieBanner'

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <ScrollToTop />
      <AppRoutes />
      <CookieBanner />
    </BrowserRouter>
  )
}

export default App
