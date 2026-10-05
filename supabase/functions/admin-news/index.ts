import { cleanNewsBody, validNewsTitle, cleanImageUrl } from '../_shared/news-validation.ts';
import { readBody } from '../_shared/security.ts';
import { requireAdmin } from '../_shared/admin-auth.ts';
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

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

  const denied = await requireAdmin(supabase, 'news');
  if (denied) return new Response(denied.body, { status: denied.status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

  const adminSupabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });

  const url = new URL(req.url);
  const method = req.method;

  try {
    if (method === 'GET') {
      const { data, error } = await adminSupabase
        .from('news')
        .select('id, title, slug, published, created_at, updated_at, image_url')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ news: data }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST') {
      const body = await readBody(req, 120000);
      const { title, body: newsBody, image_url, published } = body;

      if (!validNewsTitle(title)) {
        return new Response(JSON.stringify({ error: 'Заглавието е задължително (мин. 3 символа).' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (typeof newsBody !== 'string' || newsBody.trim().length < 10 || newsBody.length > 100000) {
        return new Response(JSON.stringify({ error: 'Текстът е задължителен (мин. 10 символа).' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const baseSlug = slugify(title);
      const slug = `${baseSlug}-${Date.now()}`;

      const { data, error } = await adminSupabase
        .from('news')
        .insert({
          title: title.trim(),
          slug,
          body: cleanNewsBody(newsBody),
          image_url: cleanImageUrl(image_url),
          published: typeof published === 'boolean' ? published : false,
          author_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return new Response(JSON.stringify({ news: data }), {
        status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'PUT') {
      const body = await readBody(req, 120000);
      const { id, title, body: newsBody, image_url, published } = body;

      if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/i.test(id)) {
        return new Response(JSON.stringify({ error: 'ID е задължително.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title !== undefined) { if (!validNewsTitle(title)) return Response.json({ error: 'Невалидно заглавие.' }, { status: 400, headers: corsHeaders }); updateData.title = title.trim(); }
      if (newsBody !== undefined) updateData.body = cleanNewsBody(newsBody);
      if (image_url !== undefined) updateData.image_url = cleanImageUrl(image_url);
      if (published !== undefined) { if (typeof published !== 'boolean') return Response.json({ error: 'Невалиден статус.' }, { status: 400, headers: corsHeaders }); updateData.published = published; }

      const { data, error } = await adminSupabase
        .from('news')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) return Response.json({ error: 'Новината не е намерена.' }, { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify({ news: data }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'DELETE') {
      const body = await readBody(req, 120000);
      const { id } = body;
      if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/i.test(id)) {
        return new Response(JSON.stringify({ error: 'ID е задължително.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: deleted, error } = await adminSupabase.from('news').delete().eq('id', id).select('id').maybeSingle();
      if (!error && !deleted) return Response.json({ error: 'Новината не е намерена.' }, { status: 404, headers: corsHeaders });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('admin-news request failed');
    return new Response(JSON.stringify({ error: 'Сървърна грешка.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
