import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const navigation = useNavigationType();
  useEffect(() => {
    if (!hash) {
      if (navigation !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    let id: string;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const scroll = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      return true;
    };
    if (scroll()) return;
    // A lazy route may not have mounted yet.
    const observer = new MutationObserver(() => { if (scroll()) observer.disconnect(); });
    observer.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
    const timer = window.setTimeout(() => observer.disconnect(), 10000);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, [pathname, hash, key, navigation]);
  return null;
}
