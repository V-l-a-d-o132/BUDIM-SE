import { corsHeaders, publicRequestError, readBody, ownerHash, rateLimit, serviceClient, verifyRecaptcha, requestBodyErrorResponse, rateLimitResponse } from '../_shared/security.ts';

Deno.serve(async (req: Request) => {
  const gate = publicRequestError(req);
  if (gate) return gate;
  const headers = corsHeaders(req);
  try {
    const body = await readBody(req, 12000);
    const actor = await ownerHash(body.owner_token);
    const allowed = ['history', 'like', 'comment', 'repost', 'delete'];
    if (!allowed.includes(body.action)) return Response.json({ error: 'Invalid action' }, { status: 400, headers });
    let permitted;
    try { permitted = await rateLimit(req, `game-${body.action}`, body.action === 'like' ? 45 : 15); }
    catch { return Response.json({ error: 'Операцията временно не е достъпна. Опитай отново.' }, { status: 503, headers }); }
    if (!permitted) {
      return rateLimitResponse(headers);
    }
    const client = serviceClient();
    if (body.action === 'history') {
      const { data, error } = await client.rpc('game_history', { owner_hash: actor });
      if (error) throw new Error('History unavailable');
      return Response.json({ posts: data }, { headers });
    }
    if (typeof body.post_id !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.post_id)) {
      return Response.json({ error: 'Invalid post' }, { status: 400, headers });
    }
    const details: Record<string, unknown> = {};
    if (body.action === 'like') {
      if (typeof body.liked !== 'boolean') return Response.json({ error: 'Invalid reaction' }, { status: 400, headers });
      details.liked = body.liked;
    }
    if (['comment', 'repost'].includes(body.action) && !await verifyRecaptcha(body.recaptcha_token)) {
      return Response.json({ error: 'reCAPTCHA verification required' }, { status: 403, headers });
    }
    if (body.action === 'comment') {
      if (typeof body.content !== 'string' || !body.content.trim() || body.content.length > 1000 ||
        (body.username !== undefined && (typeof body.username !== 'string' || body.username.length > 50))) {
        return Response.json({ error: 'Invalid comment' }, { status: 400, headers });
      }
      details.content = body.content.trim();
      details.username = body.username?.trim() || 'Анонимен';
    }
    if (body.action === 'repost') {
      if (!['instagram', 'tiktok', 'facebook'].includes(body.platform)) return Response.json({ error: 'Invalid platform' }, { status: 400, headers });
      details.platform = body.platform;
    }
    const { data, error } = await client.rpc('game_interact', { action: body.action, post_id: body.post_id, actor_hash: actor, details });
    if (error) return Response.json({ error: 'Операцията не е разрешена или публикацията не е достъпна.' }, { status: 403, headers });
    return Response.json(data, { headers });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error, headers); if (bodyError) return bodyError;
    return Response.json({ error: 'Неуспешна обработка на заявката.' }, { status: 400, headers });
  }
});
