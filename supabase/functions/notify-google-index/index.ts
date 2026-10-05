import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://budimse.online',
  'https://www.budimse.online',
  'http://localhost:5173',
  'http://localhost:3000',
];

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / windowMs)}`;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}

function getCorsHeaders(origin: string | null) {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin ?? '') ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 10 req/min per IP
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp, 10, 60000)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
    );
  }

  // Origin validation
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'Invalid origin' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { slug, title, action } = body;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const siteUrl = 'https://budimse.online';
    const articleUrl = `${siteUrl}/news/${slug}`;

    const results: Record<string, unknown> = {
      url: articleUrl,
      slug,
      title,
      action: action || 'URL_UPDATED',
      timestamp: new Date().toISOString(),
    };

    try {
      const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`;
      const pingRes = await fetch(googlePingUrl, { method: 'GET' });
      results.google_sitemap_ping = pingRes.status;
    } catch (e) {
      results.google_sitemap_ping = 'failed';
    }

    try {
      const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${siteUrl}/sitemap.xml`)}`;
      const bingRes = await fetch(bingPingUrl, { method: 'GET' });
      results.bing_ping = bingRes.status;
    } catch (e) {
      results.bing_ping = 'failed';
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('news')
      .update({ updated_at: new Date().toISOString() })
      .eq('slug', slug);

    results.db_updated = !updateError;

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
