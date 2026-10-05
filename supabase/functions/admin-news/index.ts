import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://budimse.online',
  'https://www.budimse.online',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string | null) {
  const corsOrigin = ALLOWED_ORIGINS.includes(origin ?? '') ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': corsOrigin,
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

  const adminSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data: adminRecord } = await adminSupabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRecord) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

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
      const body = await req.json();
      const { title, body: newsBody, image_url, published } = body;

      if (!title || title.trim().length < 3) {
        return new Response(JSON.stringify({ error: 'Заглавието е задължително (мин. 3 символа).' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!newsBody || newsBody.trim().length < 10) {
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
          body: newsBody.trim(),
          image_url: image_url?.trim() || null,
          published: published ?? false,
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
      const body = await req.json();
      const { id, title, body: newsBody, image_url, published } = body;

      if (!id) {
        return new Response(JSON.stringify({ error: 'ID е задължително.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title !== undefined) updateData.title = title.trim();
      if (newsBody !== undefined) updateData.body = newsBody.trim();
      if (image_url !== undefined) updateData.image_url = image_url?.trim() || null;
      if (published !== undefined) updateData.published = published;

      const { data, error } = await adminSupabase
        .from('news')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return new Response(JSON.stringify({ news: data }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'DELETE') {
      const body = await req.json();
      const { id } = body;
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID е задължително.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { error } = await adminSupabase.from('news').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Сървърна грешка.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
