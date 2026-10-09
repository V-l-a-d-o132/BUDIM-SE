import Stripe from 'npm:stripe@22.6.0';
import { serviceClient, ownerHash, ALLOWED_ORIGINS, requestBodyErrorResponse, rateLimitResponse } from './security.ts';

export const BOOK_STORE = 'budimse_books_v1';
export const BOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'checkout.session.expired', 'payment_intent.payment_failed', 'charge.refunded'];
export const BOOK_PRICES = { physical: 1499, digital: 399 } as const;
export const BOOK_BUCKET = 'book-downloads';
export const BOOK_WEBHOOK_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/book-payment-webhook`;
export const STRIPE_VERSION = '2026-08-26.dahlia';
export const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export class BookError extends Error {
  status: number;
  readonly orderId?: string;
  constructor(message: string, status = 400, orderId?: string) { super(message); this.status = status; this.orderId = orderId; }
}

export function bookMode(): boolean {
  const configured = Deno.env.get('BOOK_PAYMENTS_MODE');
  if (configured && !['live', 'test'].includes(configured)) throw new BookError('Покупката временно не е достъпна.', 503);
  if (configured) return configured === 'live';
  const key = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  if (/^[sr]k_live_/.test(key)) return true;
  if (/^[sr]k_test_/.test(key)) return false;
  throw new BookError('Покупката временно не е достъпна.', 503);
}

export async function bookStripe(isLive: boolean): Promise<Stripe> {
  const base = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  let key = isLive ? Deno.env.get('STRIPE_LIVE_SECRET_KEY') : Deno.env.get('STRIPE_TEST_SECRET_KEY');
  const prefix = isLive ? /^[sr]k_live_/ : /^[sr]k_test_/;
  if (!key && prefix.test(base)) key = base;
  if (!key && !isLive) {
    const result = await serviceClient().rpc('book_payment_secret', { is_live: false, secret_kind: 'api_key' });
    if (result.error) throw new BookError('Настройката на плащанията временно не е достъпна.', 503);
    key = result.data;
  }
  if (!key || !prefix.test(key)) throw new BookError('Липсва настройка за избрания режим на плащане.', 503);
  return new Stripe(key, { apiVersion: STRIPE_VERSION, httpClient: Stripe.createFetchHttpClient(), timeout: 10000, maxNetworkRetries: 1 });
}

export async function signingSecret(isLive: boolean): Promise<string | null> {
  const value = Deno.env.get(isLive ? 'STRIPE_BOOK_WEBHOOK_SECRET_LIVE' : 'STRIPE_BOOK_WEBHOOK_SECRET_TEST');
  if (value) return value;
  const result = await serviceClient().rpc('book_payment_secret', { is_live: isLive, secret_kind: 'webhook' });
  if (result.error) throw new BookError('Настройката на плащанията временно не е достъпна.', 503);
  return result.data ?? null;
}

export function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
}

export async function purchaseInput(body: Record<string, any>) {
  const format = body.format ?? 'physical';
  const quantity = body.quantity ?? 1;
  if (!['physical', 'digital'].includes(format) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100 || (format === 'digital' && quantity !== 1)) throw new BookError('Невалидно издание или количество.');
  if (body.currency !== undefined && body.currency !== 'eur') throw new BookError('Покупките са само в EUR.');
  if (format === 'digital' && body.immediate_delivery !== true) throw new BookError('Потвърди, че желаеш незабавен достъп до електронната книга.');
  // Compatibility for the previously published physical checkout. The new
  // client always persists and supplies both values, including on retries.
  const requestId = body.request_id ?? crypto.randomUUID();
  const token = body.order_token ?? randomToken();
  if (typeof requestId !== 'string' || !UUID.test(requestId)) throw new BookError('Невалидна заявка за поръчка.');
  let tokenHash: string;
  try { tokenHash = await ownerHash(token); } catch { throw new BookError('Невалиден достъп до поръчката.'); }
  return { format: format as 'physical' | 'digital', quantity, requestId, token, tokenHash, immediateDelivery: body.immediate_delivery === true };
}

export function returnOrigin(req: Request): string {
  const origin = req.headers.get('origin');
  return origin && ALLOWED_ORIGINS.includes(origin) ? origin : 'https://budimse.online';
}

export function publicBookOrder(order: Record<string, any>) {
  return {
    id: order.id, format: order.format, quantity: order.quantity, currency: order.currency,
    amount_total: order.expected_amount, amount_paid: order.amount_paid, amount_refunded: order.amount_refunded,
    payment_status: order.payment_status, fulfillment_status: order.fulfillment_status, livemode: order.livemode,
    shipping_carrier: order.shipping_carrier, tracking_number: order.tracking_number,
    created_at: order.created_at, paid_at: order.paid_at,
    downloadable: order.format === 'digital' && ['paid', 'partially_refunded'].includes(order.payment_status) && order.fulfillment_status !== 'cancelled',
  };
}

function idOf(value: any): string | null { return typeof value === 'string' ? value : value?.id ?? null; }

// Signature verification happens before this function. Keep only the fields
// needed for a durable order; never persist complete provider event payloads.
export function bookEventData(event: Stripe.Event): Record<string, any> | null {
  if (!BOOK_EVENTS.some(type => type === event.type)) return null;
  const object = event.data.object as any;
  if (event.type === 'charge.refunded') return {
    payment_intent_id: idOf(object.payment_intent), currency: object.currency,
    amount_refunded: object.amount_refunded,
  };
  if (object.metadata?.store !== BOOK_STORE) return null;
  if (!UUID.test(object.metadata.order_id ?? '')) throw new BookError('Invalid order metadata');
  if (event.type === 'payment_intent.payment_failed') return {
    order_id: object.metadata.order_id, format: object.metadata.format, payment_intent_id: object.id,
  };
  const shipping = object.collected_information?.shipping_details ?? object.shipping_details;
  return {
    order_id: object.metadata.order_id, format: object.metadata.format,
    session_id: object.id, session_status: object.status, payment_status: object.payment_status,
    payment_intent_id: idOf(object.payment_intent), amount_total: object.amount_total, currency: object.currency,
    customer_email: object.customer_details?.email ?? null, customer_name: object.customer_details?.name ?? null,
    customer_phone: object.metadata.format === 'physical' ? object.customer_details?.phone ?? null : null,
    shipping_name: object.metadata.format === 'physical' ? shipping?.name ?? null : null,
    shipping_address: object.metadata.format === 'physical' ? shipping?.address ?? null : null,
  };
}

export function bookResponse(error: unknown, headers: Record<string, string>): Response {
  const bodyError = requestBodyErrorResponse(error, headers); if (bodyError) return bodyError;
  if (error instanceof BookError && error.status === 429) return rateLimitResponse(headers);
  if (error instanceof BookError) return Response.json({ error: error.message,
    ...(error.orderId ? { code: 'checkout_closed', order_id: error.orderId } : {}),
  }, { status: error.status, headers });
  console.error('Book operation failed', error instanceof Error ? error.name : 'UnknownError');
  return Response.json({ error: 'Операцията временно не е достъпна. Опитай отново.' }, { status: 503, headers });
}
