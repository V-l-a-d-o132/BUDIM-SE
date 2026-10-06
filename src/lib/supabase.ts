import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (input, init = {}) => {
      const signal = init.signal ?? (input instanceof Request ? input.signal : undefined);
      return fetch(input, { ...init, signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(45000)]) : AbortSignal.timeout(45000) });
    },
    headers: {
      'x-client-info': 'budimse-web',
    },
  },
  db: {
    schema: 'public',
  },
});

// ─── Simple in-memory + sessionStorage cache ───────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function cacheGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(`sb_cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(`sb_cache_${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, ts: Date.now() };
    sessionStorage.setItem(`sb_cache_${key}`, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — skip silently
  }
}

export async function fetchNewsListCached() {
  const cacheKey = 'news_list';
  const cached = cacheGet<unknown[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('news')
    .select('id, title, slug, image_url, created_at, body')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .abortSignal(AbortSignal.timeout(15000));

  if (error) throw new Error('Новините временно не могат да бъдат заредени.');
  const result = data ?? [];
  cacheSet(cacheKey, result);
  return result;
}

export async function fetchNewsDetailCached(slug: string) {
  const cacheKey = `news_detail_${slug}`;
  const cached = cacheGet<unknown>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .abortSignal(AbortSignal.timeout(15000))
    .maybeSingle();

  if (error) throw new Error('Новината временно не може да бъде заредена.');
  if (data) cacheSet(cacheKey, data);
  return data;
}

export function invalidateNewsCache() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith('sb_cache_news'))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}
