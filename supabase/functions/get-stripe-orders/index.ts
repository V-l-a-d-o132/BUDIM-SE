import { requireAdmin } from '../_shared/admin-auth.ts';
import Stripe from 'npm:stripe@16.12.0';
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
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method !== 'POST' && req.method !== 'OPTIONS') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const denied = await requireAdmin(supabase, 'orders');
  if (denied) return new Response(denied.body, { status: denied.status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() });

    const body = await req.json().catch(() => ({ limit: 50 }));
    const limit = Math.min(body.limit ?? 50, 100);
    const starting_after = body.starting_after ?? undefined;

    const sessions = await stripe.checkout.sessions.list({
      limit,
      starting_after,
      expand: ['data.line_items', 'data.customer_details'],
    });

    const orders = sessions.data.map((s) => ({
      id: s.id,
      status: s.payment_status,
      amount_total: s.amount_total,
      currency: s.currency,
      customer_email: s.customer_details?.email ?? null,
      customer_name: s.customer_details?.name ?? null,
      customer_address: s.customer_details?.address ?? null,
      shipping_address: s.shipping_details?.address ?? null,
      shipping_name: s.shipping_details?.name ?? null,
      line_items: s.line_items?.data?.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        amount_total: li.amount_total,
      })) ?? [],
      created: s.created,
      metadata: s.metadata,
    }));

    const paid = sessions.data.filter((s) => s.payment_status === 'paid');
    const totalRevenue = paid.reduce((sum, s) => sum + (s.amount_total ?? 0), 0);

    return new Response(JSON.stringify({
      orders,
      has_more: sessions.has_more,
      stats: {
        total_orders: paid.length,
        total_revenue_stotinki: totalRevenue,
        currency: 'bgn',
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Stripe error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
