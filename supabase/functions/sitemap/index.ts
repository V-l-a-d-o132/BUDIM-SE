import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { corsHeaders, serverFetch } from '../_shared/security.ts';

const BASE_URL = 'https://budimse.online';

const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/digitalna-gramotnost', priority: '0.9', changefreq: 'monthly' },
  { url: '/mediyna-gramotnost-uchenici', priority: '0.9', changefreq: 'monthly' },
  { url: '/obucheniya-za-uchilishta', priority: '0.9', changefreq: 'monthly' },
  { url: '/resursi', priority: '0.9', changefreq: 'monthly' },
  { url: '/sources', priority: '0.7', changefreq: 'monthly' },
  { url: '/center', priority: '0.9', changefreq: 'monthly' },
  { url: '/author', priority: '0.8', changefreq: 'monthly' },
  { url: '/step-1', priority: '0.8', changefreq: 'monthly' },
  { url: '/step-2', priority: '0.8', changefreq: 'monthly' },
  { url: '/step-3', priority: '0.8', changefreq: 'monthly' },
  { url: '/step-4', priority: '0.8', changefreq: 'monthly' },
  { url: '/step-5', priority: '0.8', changefreq: 'monthly' },
  { url: '/analizator', priority: '0.8', changefreq: 'weekly' },
  { url: '/news', priority: '0.9', changefreq: 'daily' },
  { url: '/order', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/testimonials', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
  { url: '/terms', priority: '0.4', changefreq: 'yearly' },
];

Deno.serve(async (req) => {
  const headers = { ...corsHeaders(req), 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (!['GET', 'HEAD'].includes(req.method)) return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
  try {

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: serverFetch } },
    );

    const { data: articles, error } = await supabase
      .from('news')
      .select('slug, created_at, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false }).limit(50000);
    if (error) throw new Error('Published article lookup unavailable');

    const now = new Date().toISOString().split('T')[0];

    const staticEntries = STATIC_PAGES.map(
      (p) => `  <url>
      <loc>${BASE_URL}${p.url}</loc>
      <lastmod>2026-10-08</lastmod>
      <changefreq>${p.changefreq}</changefreq>
      <priority>${p.priority}</priority>
    </url>`,
    ).join('\n');

    const articleEntries = (articles ?? [])
      .map((a) => {
        const timestamp = Date.parse(a.updated_at ?? a.created_at ?? now);
        const lastmod = Number.isFinite(timestamp) ? new Date(timestamp).toISOString().split('T')[0] : now;
        return `  <url>
      <loc>${BASE_URL}/news/${encodeURIComponent(a.slug)}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${staticEntries}
  ${articleEntries}
  </urlset>`;

    return new Response(req.method === 'HEAD' ? null : xml, {
      headers: {
        ...headers,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return Response.json({ error: 'Sitemap temporarily unavailable' }, {
      status: 503, headers: { ...headers, 'Retry-After': '60' },
    });
  }
});
