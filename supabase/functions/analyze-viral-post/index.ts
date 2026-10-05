import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not configured, skipping validation');
    return true;
  }
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('reCAPTCHA verification error:', e);
    return false;
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp, 15, 60000)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
    );
  }

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'Invalid origin' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
    );
  }

  try {
    const { content, platform, username, session_id, challenge_id, recaptcha_token } = await req.json();

    if (!content || !platform) {
      return new Response(
        JSON.stringify({ error: 'Липсват задължителни полета' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate reCAPTCHA
    if (recaptcha_token) {
      const recaptchaValid = await verifyRecaptcha(recaptcha_token);
      if (!recaptchaValid) {
        return new Response(
          JSON.stringify({ error: 'reCAPTCHA validation failed. Please try again.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    }

    // Profanity filter (basic)
    const profanityWords = ['педераст', 'курва', 'путка', 'еба', 'майка ти', 'уби', 'мръсница'];
    const lowerContent = content.toLowerCase();
    if (profanityWords.some((w) => lowerContent.includes(w))) {
      return new Response(
        JSON.stringify({ error: 'Съдържанието съдържа неподходящи думи.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const sessionId = session_id || crypto.randomUUID();

    // Simple viral scoring algorithm
    const viralWords = ['🔥', '💥', 'скандал', 'шок', 'разкритие', 'невероятно', 'вирален', '-breaking'];
    const qualityWords = ['анализ', 'мисъл', 'размисъл', 'интересно', 'прочетете', 'заслужава', 'задълбочено'];

    let viralScore = 30;
    let matchedViral = 0;
    let matchedQuality = 0;

    viralWords.forEach((w) => {
      if (lowerContent.includes(w.toLowerCase())) { viralScore += 8; matchedViral++; }
    });
    qualityWords.forEach((w) => {
      if (lowerContent.includes(w.toLowerCase())) { viralScore -= 6; matchedQuality++; }
    });

    viralScore = Math.max(0, Math.min(100, viralScore));
    const isViral = viralScore >= 55;

    const likes = isViral
      ? Math.floor(Math.random() * 5000) + 1000
      : Math.floor(Math.random() * 20) + 1;

    let aiLabel = 'Нормално';
    if (viralScore >= 70) aiLabel = 'Манипулативно';
    else if (viralScore >= 40) aiLabel = 'Леко оформено';
    else aiLabel = 'Качествено';

    let aiReason = 'Текстът е балансиран и не използва агресивни реторични техники.';
    if (matchedViral > 0 && matchedQuality === 0) {
      aiReason = `Алгоритъмът засече ${matchedViral} вирални елемента (емоджита, сензационни думи). Това активира емоционалните рецептори и увеличава reach-а.`;
    } else if (matchedQuality > 0 && matchedViral === 0) {
      aiReason = 'Текстът съдържа интелектуални маркери, които алгоритъмът често потиска в полза на емоционално съдържание.';
    } else if (matchedViral > 0 && matchedQuality > 0) {
      aiReason = 'Комбинация от вирални и качествени елементи. Алгоритъмът е разколебан — доста интересен случай.';
    }

    const post = {
      id: crypto.randomUUID(),
      content: content.trim(),
      platform,
      username: username || 'Анонимен',
      likes,
      comments: Math.floor(likes * 0.1),
      shares: Math.floor(likes * 0.05),
      timestamp: new Date().toISOString(),
      is_viral: isViral,
      viral_score: viralScore,
      ai_label: aiLabel,
      ai_reason: aiReason,
      challenge_id: challenge_id || null,
      session_id: sessionId,
    };

    return new Response(
      JSON.stringify({
        success: true,
        post,
        is_viral: isViral,
        viral_score: viralScore,
        likes,
        ai_label: aiLabel,
        ai_reason: aiReason,
        session_id: sessionId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in analyze-viral-post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Грешка при обработката' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
