import { corsHeaders, serviceClient, ALLOWED_ORIGINS } from '../_shared/security.ts';
import { bookMode, signingSecret, BOOK_PRICES, bookResponse } from '../_shared/book-payments.ts';

Deno.serve(async (req: Request) => {
  const headers = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return Response.json({ error: 'Invalid origin' }, { status: 403, headers });
  try {
    const livemode = bookMode();
    const result = await serviceClient().rpc('book_edition_configuration');
    if (result.error) throw new Error('Edition configuration unavailable');
    const ready = Boolean(await signingSecret(livemode));
    return Response.json({ livemode, currency: 'eur', prices: BOOK_PRICES, physical_available: ready,
      digital_available: ready && result.data?.digital_available === true, edition: result.data?.edition ?? null }, { headers });
  } catch (error) { return bookResponse(error, headers); }
});
