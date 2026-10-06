import { rateLimit, readBody, publicRequestError, corsHeaders, serviceClient, requestBodyErrorResponse, rateLimitResponse } from '../_shared/security.ts';

Deno.serve(async (req: Request) => {
  const gate = publicRequestError(req); if (gate) return gate;
  const headers = corsHeaders(req);
  try {
    if (!await rateLimit(req, 'partnership', 5)) return rateLimitResponse(headers);
    const { organization, type, email, message } = await readBody(req, 8000);
    if (typeof organization !== 'string' || organization.trim().length < 2 || organization.length > 200)
      return Response.json({ error: 'Невалидно наименование на организацията.' }, { status: 400, headers });
    if (!['school', 'ngo', 'corporate', 'media', 'other'].includes(type))
      return Response.json({ error: 'Невалиден вид организация.' }, { status: 400, headers });
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200)
      return Response.json({ error: 'Невалиден имейл адрес.' }, { status: 400, headers });
    if (message != null && (typeof message !== 'string' || message.length > 500))
      return Response.json({ error: 'Описанието е твърде дълго (макс. 500 символа).' }, { status: 400, headers });
    const { error } = await serviceClient().from('contact_submissions').insert({
      organization: organization.trim(), type, email: email.trim().toLowerCase(),
      message: message ? message.trim() : null, ip_hint: null,
    });
    if (error) throw new Error('Inquiry storage unavailable');
    return Response.json({ success: true }, { headers });
  } catch (error) {
    return requestBodyErrorResponse(error, headers) ?? Response.json({ error: 'Записването временно не е достъпно. Опитай отново.' }, { status: 503, headers });
  }
});
