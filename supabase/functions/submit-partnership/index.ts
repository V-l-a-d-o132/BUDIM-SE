import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://budimse.online',
  'https://www.budimse.online',
  'http://localhost:5173',
  'http://localhost:3000',
];

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60000): boolean {
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting: 5 req/min per IP (form submission)
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp, 5, 60000)) {
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
    const { organization, type, email, message } = body;

    // --- Validation ---
    if (!organization || typeof organization !== 'string' || organization.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Невалидно наименование на организацията.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validTypes = ['school', 'ngo', 'corporate', 'media', 'other'];
    if (!type || !validTypes.includes(type)) {
      return new Response(JSON.stringify({ error: 'Невалиден вид организация.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 200) {
      return new Response(JSON.stringify({ error: 'Невалиден имейл адрес.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (message && message.length > 500) {
      return new Response(JSON.stringify({ error: 'Описанието е твърде дълго (макс. 500 символа).' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Sanitize ---
    const sanitized = {
      organization: organization.trim().slice(0, 200),
      type,
      email: email.trim().toLowerCase().slice(0, 200),
      message: message ? message.trim().slice(0, 500) : null,
      ip_hint: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    };

    // --- Save to Supabase ---
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert(sanitized);

    if (dbError) {
      console.error('DB error:', dbError);
      return new Response(JSON.stringify({ error: 'Грешка при записване. Опитайте отново.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Неочаквана грешка.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
