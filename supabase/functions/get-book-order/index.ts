import { publicRequestError, corsHeaders, serviceClient, readBody, ownerHash, rateLimit } from '../_shared/security.ts';
import { BookError, bookResponse, publicBookOrder, UUID, BOOK_BUCKET } from '../_shared/book-payments.ts';

Deno.serve(async (req: Request) => {
  const rejected = publicRequestError(req); if (rejected) return rejected;
  const headers = corsHeaders(req);
  try {
    let body; try { body = await readBody(req, 12000); } catch { throw new BookError('Невалидна заявка.'); }
    if (typeof body.order_id !== 'string' || !UUID.test(body.order_id) || !['status', 'download'].includes(body.action ?? 'status')) throw new BookError('Невалидна заявка.');
    let tokenHash; try { tokenHash = await ownerHash(body.order_token); } catch { throw new BookError('Поръчката не е достъпна.', 404); }
    if (!await rateLimit(req, body.action === 'download' ? 'book-download' : 'book-status', body.action === 'download' ? 10 : 40)) throw new BookError('Твърде много заявки. Опитай след минута.', 429);
    const db = serviceClient();
    const result = await db.rpc('book_order_for_owner', { order_id: body.order_id, token_hash: tokenHash });
    if (result.error) throw new Error('Order lookup unavailable');
    if (!result.data) throw new BookError('Поръчката не е достъпна.', 404);
    if (body.action === 'download') {
      const access = await db.rpc('book_download_for_owner', { order_id: body.order_id, token_hash: tokenHash });
      if (access.error) throw new Error('Download lookup unavailable');
      if (!access.data?.object_path) throw new BookError('Изтеглянето още не е достъпно за тази поръчка.', 409);
      // A refund stops new links; an already issued link expires within 60 s.
      const signed = await db.storage.from(BOOK_BUCKET).createSignedUrl(access.data.object_path, 60, { download: 'Pette-stepeni-elektronno-izdanie.pdf' });
      if (signed.error || !signed.data?.signedUrl) throw new Error('Download signing unavailable');
      const stillAllowed = await db.rpc('book_download_for_owner', { order_id: body.order_id, token_hash: tokenHash });
      if (stillAllowed.error || !stillAllowed.data) throw new BookError('Изтеглянето не е достъпно за тази поръчка.', 409);
      const recorded = await db.rpc('record_book_download', { order_id: body.order_id });
      if (recorded.error) throw new Error('Download history unavailable');
      return Response.json({ url: signed.data.signedUrl, expires_in: 60 }, { headers });
    }
    return Response.json({ order: publicBookOrder(result.data) }, { headers });
  } catch (error) { return bookResponse(error, headers); }
});
