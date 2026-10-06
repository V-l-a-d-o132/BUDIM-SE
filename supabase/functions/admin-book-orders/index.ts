import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { requireAdmin } from '../_shared/admin-auth.ts';
import { publicRequestError, corsHeaders, serviceClient, readBody } from '../_shared/security.ts';
import { bookMode, bookStripe, BOOK_EVENTS, BOOK_WEBHOOK_URL, BOOK_BUCKET, STRIPE_VERSION, UUID, BookError, bookResponse } from '../_shared/book-payments.ts';

Deno.serve(async (req: Request) => {
  const rejected = publicRequestError(req); if (rejected) return rejected;
  const headers = corsHeaders(req);
  const authorization = req.headers.get('authorization');
  if (!authorization) return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const denied = await requireAdmin(userClient, 'orders');
  if (denied) return new Response(denied.body, { status: denied.status, headers: { ...headers, 'Content-Type': 'application/json' } });
  try {
    let body; try { body = await readBody(req, 16000); } catch { throw new BookError('Невалидна заявка.'); }
    const db = serviceClient();
    const isLive = body.livemode === undefined ? bookMode() : body.livemode;
    if (typeof isLive !== 'boolean') throw new BookError('Невалиден режим.');
    const action = body.action ?? 'list';
    if (action === 'list') {
      const limit = body.limit ?? 50;
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new BookError('Невалиден размер на страница.');
      let query = db.from('book_orders').select('*').eq('livemode', isLive).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(limit + 1);
      if (body.cursor) {
        if (!UUID.test(body.cursor.id ?? '') || !/^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|\+00:00)$/.test(body.cursor.created_at ?? '')) throw new BookError('Невалидна страница.');
        query = query.or(`created_at.lt.${body.cursor.created_at},and(created_at.eq.${body.cursor.created_at},id.lt.${body.cursor.id})`);
      }
      const [orders, totals, editions, configuration] = await Promise.all([
        query, db.rpc('book_order_totals', { is_live: isLive }), db.rpc('book_edition_configuration'), db.rpc('book_payment_configuration', { is_live: isLive }),
      ]);
      if (orders.error || totals.error || editions.error || configuration.error) throw new Error('Orders unavailable');
      const rows = orders.data ?? []; const page = rows.slice(0, limit); const last = page.at(-1);
      return Response.json({ orders: page, has_more: rows.length > limit, cursor: last ? { id: last.id, created_at: last.created_at } : null,
        stats: totals.data, edition: editions.data?.edition, digital_available: editions.data?.digital_available,
        configuration: configuration.data ?? {}, livemode: isLive, active_mode: bookMode() }, { headers });
    }
    if (action === 'history') {
      if (!UUID.test(body.order_id ?? '')) throw new BookError('Невалидна поръчка.');
      const result = await db.rpc('list_book_order_history', { order_id: body.order_id });
      if (result.error) throw new Error('History unavailable');
      return Response.json({ history: result.data }, { headers });
    }
    if (action === 'update_delivery') {
      if (!UUID.test(body.order_id ?? '') || !['ready', 'preparing', 'shipped'].includes(body.previous_status) || !['preparing', 'shipped', 'delivered'].includes(body.next_status)
        || typeof (body.carrier ?? '') !== 'string' || typeof (body.tracking_number ?? '') !== 'string' || (body.carrier?.length ?? 0) > 80 || (body.tracking_number?.length ?? 0) > 120) throw new BookError('Невалидни данни за доставка.');
      const { data: { user } } = await userClient.auth.getUser();
      const result = await db.rpc('update_book_delivery', { order_id: body.order_id, previous_status: body.previous_status, next_status: body.next_status, carrier: body.carrier ?? '', tracking: body.tracking_number ?? '', actor_id: user!.id });
      if (result.error) throw new BookError('Доставката не е обновена. Презареди поръчката и провери текущия статус.', 409);
      return Response.json({ order: result.data }, { headers });
    }
    if (action === 'setup_webhook') {
      const stripe = await bookStripe(isLive);
      const url = `${BOOK_WEBHOOK_URL}?mode=${isLive ? 'live' : 'test'}`;
      const configuration = await db.rpc('book_payment_configuration', { is_live: isLive });
      if (configuration.error) throw new Error('Configuration unavailable');
      if (configuration.data?.webhook_endpoint_id) {
        const endpoint = await stripe.webhookEndpoints.retrieve(configuration.data.webhook_endpoint_id);
        if (endpoint.url !== url || endpoint.livemode !== isLive) throw new Error('Webhook configuration mismatch');
        await stripe.webhookEndpoints.update(endpoint.id, { disabled: false, enabled_events: BOOK_EVENTS });
        return Response.json({ configured: true, livemode: isLive, endpoint_id: endpoint.id }, { headers });
      }
      const endpoint = await stripe.webhookEndpoints.create({ url, api_version: STRIPE_VERSION, enabled_events: BOOK_EVENTS,
        description: 'БУДИМ СЕ — verified book orders and refunds', metadata: { integration: 'budimse_books_v1' } },
        { idempotencyKey: `budimse-book-webhook-v1:${isLive ? 'live' : 'test'}` });
      if (!endpoint.secret || endpoint.livemode !== isLive) throw new Error('Webhook configuration mismatch');
      const saved = await db.rpc('configure_book_payment_secret', { is_live: isLive, secret_kind: 'webhook', new_value: endpoint.secret, endpoint_id: endpoint.id });
      if (saved.error) throw new Error('Webhook secret storage unavailable');
      return Response.json({ configured: true, livemode: isLive, endpoint_id: endpoint.id }, { headers });
    }
    if (action === 'configure_test_key') {
      if (typeof body.key !== 'string' || !/^rk_test_[a-zA-Z0-9]+$/.test(body.key) || body.key.length > 512) throw new BookError('Използвай ограничен тестов ключ с префикс rk_test_.');
      const { default: Stripe } = await import('npm:stripe@22.6.0');
      const stripe = new Stripe(body.key, { apiVersion: STRIPE_VERSION, httpClient: Stripe.createFetchHttpClient() });
      await stripe.checkout.sessions.list({ limit: 1 });
      const saved = await db.rpc('configure_book_payment_secret', { is_live: false, secret_kind: 'api_key', new_value: body.key });
      if (saved.error) throw new Error('Test key storage unavailable');
      return Response.json({ configured: true }, { headers });
    }
    if (action === 'activate_ebook') {
      if (typeof body.object_path !== 'string' || !/^editions\/[a-f0-9-]+\/[a-f0-9]{64}\.pdf$/.test(body.object_path) || typeof body.label !== 'string' || body.label.trim().length < 1 || body.label.length > 120
        || !/^[a-f0-9]{64}$/.test(body.sha256 ?? '') || !body.object_path.endsWith(`/${body.sha256}.pdf`)) throw new BookError('Невалидно електронно издание.');
      const download = await db.storage.from(BOOK_BUCKET).download(body.object_path);
      if (download.error || !download.data || download.data.size > 25 * 1024 * 1024) throw new BookError('PDF файлът не е достъпен или надвишава 25 MB.');
      const bytes = new Uint8Array(await download.data.arrayBuffer());
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') throw new BookError('Файлът трябва да бъде PDF.');
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
      if (digest !== body.sha256) throw new BookError('Файлът не съответства на избраното издание.');
      const activated = await db.rpc('activate_book_edition', { object_path: body.object_path, edition_label: body.label.trim(), file_sha256: digest });
      if (activated.error) throw new Error('Edition activation unavailable');
      return Response.json({ edition: activated.data }, { headers });
    }
    throw new BookError('Непозната операция.');
  } catch (error) { return bookResponse(error, headers); }
});
