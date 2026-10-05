import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://budimse.online',
  'https://www.budimse.online',
  'http://localhost:5173',
  'http://localhost:3000',
];

const BASE_URL = 'https://budimse.online';

const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
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
  const origin = req.headers.get('origin');
  const corsOrigin = ALLOWED_ORIGINS.includes(origin ?? '') ? origin : ALLOWED_ORIGINS[0];

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const { data: articles } = await supabase
    .from('news')
    .select('slug, created_at, updated_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  const now = new Date().toISOString().split('T')[0];

  const staticEntries = STATIC_PAGES.map(
    (p) => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  ).join('\n');

  const articleEntries = (articles ?? [])
    .map((a) => {
      const lastmod = (a.updated_at ?? a.created_at ?? now).split('T')[0];
      return `  <url>
    <loc>${BASE_URL}/news/${a.slug}</loc>
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

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': corsOrigin,
    },
  });
});
