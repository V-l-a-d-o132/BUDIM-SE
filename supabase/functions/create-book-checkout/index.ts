import { publicRequestError, corsHeaders, readBody, rateLimit, serviceClient } from '../_shared/security.ts';
import { bookMode, bookStripe, signingSecret, purchaseInput, returnOrigin, BOOK_STORE, BookError, bookResponse } from '../_shared/book-payments.ts';

Deno.serve(async (req: Request) => {
  const rejected = publicRequestError(req);
  if (rejected) return rejected;
  const headers = corsHeaders(req);
  try {
    const body = await readBody(req, 12000);
    const input = await purchaseInput(body);
    if (!await rateLimit(req, 'book-checkout', 10)) throw new BookError('Твърде много заявки. Опитай след минута.', 429);
    const isLive = bookMode();
    if (!await signingSecret(isLive)) throw new BookError('Покупката временно не е достъпна.', 503);
    const db = serviceClient();
    const begun = await db.rpc('begin_book_order', { request_id: input.requestId, owner_hash: input.tokenHash, book_format: input.format, book_quantity: input.quantity, is_live: isLive, immediate_delivery: input.immediateDelivery });
    if (begun.error) {
      if (begun.error.message?.includes('Digital edition unavailable')) throw new BookError('Електронното издание още не е достъпно за покупка.', 409);
      if (begun.error.message?.includes('Order request conflict')) throw new BookError('Заявката вече е използвана за друга поръчка.', 409);
      throw new Error('Order storage unavailable');
    }
    const order = begun.data;
    if (!order || typeof order.id !== 'string') throw new Error('Order storage unavailable');
    const stripe = await bookStripe(isLive);
    if (order.stripe_session_id) {
      const previous = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
      if (previous.livemode !== isLive || previous.metadata?.order_id !== order.id) throw new Error('Checkout mode mismatch');
      if (previous.status !== 'open' || !previous.url) throw new BookError('Тази платежна сесия е приключила. Провери статуса на поръчката.', 409, order.id);
      return Response.json({ orderId: order.id, sessionId: previous.id, url: previous.url, orderToken: input.token, livemode: isLive }, { headers });
    }
    const origin = returnOrigin(req);
    const accessFragment = typeof body.order_token === 'string' ? `#access=${input.token}` : '';
    const metadata = { store: BOOK_STORE, order_id: order.id, format: input.format };
    const suffix = order.id.replaceAll('-', '').slice(0, 8).split('').map((c: string) => String.fromCharCode(97 + parseInt(c, 16))).join('');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', locale: 'bg', integration_identifier: `budimse_books_${suffix}`,
      adaptive_pricing: { enabled: false },
      line_items: [{ quantity: input.quantity, price_data: { currency: 'eur', unit_amount: order.unit_amount,
        product_data: { name: input.format === 'digital' ? 'Петте степени — Електронно издание' : 'Петте степени — Физическа книга',
          description: input.format === 'digital' ? 'Електронна книга за лично ползване. Защитено изтегляне след потвърдено плащане.' : 'Авторски приложен труд на Владимир Атанасов за вниманието и дигиталните навици' } } }],
      client_reference_id: order.id, metadata, payment_intent_data: { metadata },
      success_url: `${origin}/order?order=${order.id}&session_id={CHECKOUT_SESSION_ID}${accessFragment}`,
      cancel_url: `${origin}/order?order=${order.id}&canceled=true${accessFragment}`,
      ...(input.format === 'physical' ? { phone_number_collection: { enabled: true }, shipping_address_collection: { allowed_countries: ['BG', 'DE', 'AT', 'CH', 'GB', 'NL', 'BE', 'FR', 'IT', 'ES', 'GR'] as const } } : {}),
      custom_text: { submit: { message: input.format === 'digital' ? 'След потвърдено плащане електронната книга ще бъде достъпна на страницата на поръчката.' : 'След плащането можеш да проследиш поръчката и доставката на страницата на поръчката.' } },
    }, { idempotencyKey: `budimse-book:${isLive ? 'live' : 'test'}:${order.id}` });
    if (session.livemode !== isLive || !session.url) throw new Error('Checkout mode mismatch');
    const bound = await db.rpc('bind_book_checkout', { order_id: order.id, session_id: session.id, session_url: session.url });
    if (bound.error) throw new Error('Checkout binding unavailable');
    return Response.json({ orderId: order.id, sessionId: session.id, url: session.url, orderToken: input.token, livemode: isLive }, { headers });
  } catch (error) { return bookResponse(error, headers); }
});
