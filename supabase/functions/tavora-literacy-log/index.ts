import { publicRequestError, corsHeaders as getCors, rateLimit, readBody } from '../_shared/security.ts';


import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

Deno.serve(async (req) => {
  const gate = publicRequestError(req);
  if (gate) return gate;
  const corsHeaders = getCors(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!await rateLimit(req, 'tavora-literacy-log', 10)) return Response.json({ error: 'Too many requests' }, { status: 429, headers: corsHeaders });
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      total_time,
      total_interactions,
      impulse_clicks,
      avg_impulse_index,
      warnings_bypassed,
      avg_reading_time,
      response_control,
      analytical_depth,
      trigger_awareness,
      behavioral_baseline
    } = await readBody(req);

    // Get anonymized metadata
    const userAgent = null;
    const ipAddress = null;

    // Insert literacy test data
    const { data, error } = await supabase
      .from('tavora_literacy_logs')
      .insert({
        total_time,
        total_interactions,
        impulse_clicks,
        avg_impulse_index,
        warnings_bypassed,
        avg_reading_time,
        response_control,
        analytical_depth,
        trigger_awareness,
        behavioral_baseline,
        user_agent: userAgent,
        ip_address: ipAddress
      })
      .select('id')
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Literacy test data saved successfully',
        data: { id: data.id }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error saving literacy test data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Неуспешно записване.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
