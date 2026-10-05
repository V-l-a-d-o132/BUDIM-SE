import { serviceClient, verifyRecaptcha, rateLimit, readBody, ownerHash, sha256, publicRequestError } from '../_shared/security.ts';

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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

Deno.serve(async (req) => {
  const gate = publicRequestError(req);
  if (gate) return gate;
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!await rateLimit(req, 'game-publish', 5)) {
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
    const { content, platform, username, challenge_id, recaptcha_token, owner_token } = await readBody(req, 12000);

    if (typeof content !== 'string' || !content.trim() || content.length > 2000 || !['instagram','tiktok','facebook'].includes(platform) || (username !== undefined && (typeof username !== 'string' || username.length > 50)) || (challenge_id != null && (typeof challenge_id !== 'string' || challenge_id.length > 100))) {
      return new Response(
        JSON.stringify({ error: 'Липсват задължителни полета' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!await verifyRecaptcha(recaptcha_token)) return Response.json({ error: 'reCAPTCHA verification required' }, { status: 403, headers: corsHeaders });

    // Profanity filter (basic)
    const profanityWords = ['педераст', 'курва', 'путка', 'еба', 'майка ти', 'уби', 'мръсница'];
    const lowerContent = content.toLowerCase();
    if (profanityWords.some((w) => lowerContent.includes(w))) {
      return new Response(
        JSON.stringify({ error: 'Съдържанието съдържа неподходящи думи.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const owner = owner_token === undefined ? await sha256(crypto.randomUUID() + crypto.randomUUID()) : await ownerHash(owner_token);

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

    const postData = {
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

    };

    const { data: post, error: saveError } = await serviceClient().rpc('create_game_post', { post_data: postData, owner_hash: owner });
    if (saveError || !post) return Response.json({ error: 'Публикацията не е записана. Проверете лимита и опитайте отново.' }, { status: 400, headers: corsHeaders });

    return new Response(
      JSON.stringify({
        success: true,
        post,
        is_viral: isViral,
        viral_score: viralScore,
        likes,
        ai_label: aiLabel,
        ai_reason: aiReason,

      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in analyze-viral-post:', error);
    return new Response(
      JSON.stringify({ error: 'Грешка при обработката' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
