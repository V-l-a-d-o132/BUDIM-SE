import Stripe from 'npm:stripe@22.6.0';
import { serviceClient } from '../_shared/security.ts';
import { signingSecret, bookEventData, STRIPE_VERSION } from '../_shared/book-payments.ts';

const verifier = new Stripe('signature-verification-only', { apiVersion: STRIPE_VERSION });
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req: Request) => {
  const headers = { 'Cache-Control': 'no-store' };
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
  const mode = new URL(req.url).searchParams.get('mode');
  const signature = req.headers.get('stripe-signature');
  if (!['live', 'test'].includes(mode ?? '') || !signature) return Response.json({ error: 'Invalid webhook' }, { status: 400, headers });
  const isLive = mode === 'live';
  let secret: string | null;
  try { secret = await signingSecret(isLive); } catch { return Response.json({ error: 'Webhook unavailable' }, { status: 503, headers }); }
  if (!secret) return Response.json({ error: 'Webhook unavailable' }, { status: 503, headers });
  const declaredSize = Number(req.headers.get('content-length') ?? 0);
  if (declaredSize > 1_000_000) return Response.json({ error: 'Payload too large' }, { status: 413, headers });
  let raw = ''; const reader = req.body?.getReader(); let size = 0; const decoder = new TextDecoder();
  if (reader) while (true) {
    const chunk = await reader.read(); if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > 1_000_000) { await reader.cancel(); return Response.json({ error: 'Payload too large' }, { status: 413, headers }); }
    raw += decoder.decode(chunk.value, { stream: true });
  }
  raw += decoder.decode();
  let event: Stripe.Event;
  try { event = await verifier.webhooks.constructEventAsync(raw, signature, secret, 300, cryptoProvider); }
  catch { return Response.json({ error: 'Invalid signature' }, { status: 400, headers }); }
  if (event.livemode !== isLive) return Response.json({ error: 'Mode mismatch' }, { status: 400, headers });
  try {
    const data = bookEventData(event);
    if (!data) return Response.json({ received: true, ignored: true }, { headers });
    const result = await serviceClient().rpc('apply_book_payment_event', { event_id: event.id, event_type: event.type, is_live: isLive, event_created: event.created, event_data: data });
    if (result.error) throw new Error('Order event transaction failed');
    return Response.json({ received: true, duplicate: result.data?.duplicate === true }, { headers });
  } catch {
    // Failed transactions roll back their event IDs, so Stripe retries can recover.
    console.error('Book webhook processing failed', event.id, event.type);
    return Response.json({ error: 'Event processing unavailable' }, { status: 503, headers });
  }
});
