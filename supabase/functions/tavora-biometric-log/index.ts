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
    if (!await rateLimit(req, 'tavora-biometric-log', 10)) return Response.json({ error: 'Too many requests' }, { status: 429, headers: corsHeaders });
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      baseline_vector,
      peak_emotional_moment,
      recovery_time,
      attention_leakage,
      emotional_volatility,
      avg_pulse,
      protocol_41_activated,
      total_time,
      cards_interacted,
      total_clicks
    } = await readBody(req);

    // Get user metadata
    const userAgent = null;
    const ipAddress = null;

    // Insert biometric data for machine learning
    const { error } = await supabase
      .from('tavora_biometric_logs')
      .insert({
        baseline_v: baseline_vector?.vBase || 0,
        baseline_a: baseline_vector?.aBase || 0,
        peak_card_id: peak_emotional_moment?.cardId || null,
        peak_text: peak_emotional_moment?.text || null,
        peak_pulse: peak_emotional_moment?.pulse || null,
        recovery_time_seconds: recovery_time || null,
        attention_leakage_percent: attention_leakage,
        emotional_volatility_percent: emotional_volatility,
        avg_pulse_bpm: avg_pulse,
        protocol_41_activated: protocol_41_activated,
        total_test_time_seconds: total_time,
        cards_interacted_count: cards_interacted,
        total_clicks_count: total_clicks,
        user_agent: userAgent,
        ip_address: ipAddress,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Biometric data logged successfully',
        data: null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Неуспешно записване.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});