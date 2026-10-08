import { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

export interface NewsItem {
  id: string; title: string; slug: string; body: string; image_url: string | null;
  created_at: string; updated_at?: string | null; published?: boolean;
}
export interface NewsSnapshot {
  route: string;
  items: NewsItem[];
}
export const NewsSnapshotContext = createContext<NewsSnapshot | null>(null);
export const NewsSanitizerContext = createContext<((html: string) => string) | null>(null);
export const NEWS_HTML_POLICY = { ALLOWED_TAGS: ['a', 'b', 'strong', 'i', 'em', 'br'], ALLOWED_ATTR: ['href', 'title'] };

export function useNewsSnapshot() {
  const provided = useContext(NewsSnapshotContext);
  const { pathname } = useLocation();
  let value = provided;
  if (!value && typeof document !== 'undefined') {
    try { value = JSON.parse(document.getElementById('news-snapshot')?.textContent || 'null'); }
    catch { /* A missing or malformed snapshot falls back to the public API. */ }
  }
  if (!value || value.route !== pathname || !Array.isArray(value.items)) return null;
  if (!value.items.every(item => item && item.published === true && typeof item.id === 'string'
    && typeof item.slug === 'string' && typeof item.title === 'string' && typeof item.body === 'string')) return null;
  return value.items;
}
