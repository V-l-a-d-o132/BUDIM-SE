import { rateLimit, readBody, publicRequestError } from '../_shared/security.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const ALLOWED_ORIGINS = [
  'https://budimse.online',
  'https://www.budimse.online',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string | null) {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin ?? '') ? (origin ?? ALLOWED_ORIGINS[0]) : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  };
}

Deno.serve(async (req) => {
  const gate = publicRequestError(req);
  if (gate) return gate;
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
  if (!await rateLimit(req, 'partnership', 5)) {
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
    const body = await readBody(req, 8000);
    const { organization, type, email, message } = body;

    // --- Validation ---
    if (!organization || typeof organization !== 'string' || organization.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Невалидно наименование на организацията.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validTypes = ['school', 'ngo', 'corporate', 'media', 'other'];
    if (typeof type !== 'string' || !validTypes.includes(type)) {
      return new Response(JSON.stringify({ error: 'Невалиден вид организация.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email) || email.length > 200) {
      return new Response(JSON.stringify({ error: 'Невалиден имейл адрес.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (message != null && (typeof message !== 'string' || message.length > 500)) {
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
      ip_hint: null,
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
