import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { requireAdmin } from '../_shared/admin-auth.ts';
import { corsHeaders } from '../_shared/security.ts';
Deno.serve(async (req: Request) => {
  const headers = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (!/^Bearer\s+\S+$/i.test(req.headers.get('Authorization') || '')) return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const denied = await requireAdmin(client, 'news');
  if (denied) return new Response(denied.body, { status: denied.status, headers: { ...headers, 'Content-Type': 'application/json' } });
  return Response.json({ error: 'Sitemap ping is retired. Indexing is handled through the published sitemap.' }, { status: 410, headers });
});
