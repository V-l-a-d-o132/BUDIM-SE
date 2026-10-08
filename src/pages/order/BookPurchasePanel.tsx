import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/base/Icon';
import { bookApi, euro, paymentLabels, deliveryLabels, orderAccess, privateOrderLink } from '@/lib/book-orders';
import type { BookStore, BookOrder, BookFormat } from '@/lib/book-orders';

export default function BookPurchasePanel() {
  const [store, setStore] = useState<BookStore | null>(null);
  const [format, setFormat] = useState<BookFormat>('physical');
  const [quantity, setQuantity] = useState(1);
  const [immediate, setImmediate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<BookOrder | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const pollCount = useRef(0);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => { setOrderId(new URLSearchParams(window.location.search).get('order')); }, []);

  useEffect(() => {
    let active = true;
    bookApi('book-store').then(data => { if (active) setStore(data); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!orderId) {
      if (new URLSearchParams(window.location.search).get('success') === 'true') setNotice('Провери потвърждението от Stripe. Този адрес сам по себе си не потвърждава плащане.');
      return;
    }
    let cancelled = false; let timer: ReturnType<typeof setTimeout> | undefined;
    try { tokenRef.current = orderAccess(orderId); } catch { setError('Достъпът до поръчката не е наличен в този браузър. Използвай запазения личен линк.'); return; }
    if (!tokenRef.current) { setError('За тази поръчка е нужен личният линк, получен при покупката. При затруднение се свържи с нас и посочи номера на поръчката.'); return; }
    pollCount.current = 0;
    const refresh = async () => {
      try {
        const data = await bookApi('get-book-order', { order_id: orderId, order_token: tokenRef.current, action: 'status' });
        if (cancelled) return;
        setOrder(data.order); setError('');
        if (['created', 'pending'].includes(data.order.payment_status) && pollCount.current++ < 20) timer = setTimeout(refresh, 3000);
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : 'Поръчката временно не е достъпна.'); }
    };
    refresh();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [orderId]);

  const checkout = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      const qty = format === 'digital' ? 1 : quantity;
      const storageKey = `book-attempt:${format}:${qty}`;
      const existing = sessionStorage.getItem(storageKey);
      const attempt = existing ? JSON.parse(existing) : {
        request_id: crypto.randomUUID(),
        order_token: Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join(''),
      };
      // Persist before requesting Checkout, so a network retry uses the same order.
      sessionStorage.setItem(storageKey, JSON.stringify(attempt));
      const result = await bookApi('create-book-checkout', { ...attempt, quantity: qty, format, currency: 'eur', immediate_delivery: immediate });
      sessionStorage.setItem(`book-order:${result.orderId}`, result.orderToken);
      const url = new URL(result.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('Платежната страница не е достъпна.');
      window.location.assign(url.href);
    } catch (err) { setError(err instanceof Error ? err.message : 'Покупката временно не е достъпна.'); setBusy(false); }
  };

  const refreshOrder = async () => {
    if (!orderId || !tokenRef.current) return;
    setBusy(true); setError('');
    try { setOrder((await bookApi('get-book-order', { order_id: orderId, order_token: tokenRef.current })).order); }
    catch (err) { setError(err instanceof Error ? err.message : 'Поръчката временно не е достъпна.'); }
    finally { setBusy(false); }
  };
  const download = async () => {
    setBusy(true); setError('');
    try {
      const data = await bookApi('get-book-order', { order_id: orderId, order_token: tokenRef.current, action: 'download' });
      const url = new URL(data.url);
      const expected = new URL(import.meta.env.VITE_PUBLIC_SUPABASE_URL);
      if (url.origin !== expected.origin || !url.pathname.startsWith('/storage/v1/object/sign/book-downloads/')) throw new Error('Изтеглянето временно не е достъпно.');
      window.location.assign(url.href);
    } catch (err) { setError(err instanceof Error ? err.message : 'Изтеглянето временно не е достъпно.'); }
    finally { setBusy(false); }
  };
  const saveAccess = () => {
    if (!order || !tokenRef.current) return;
    const text = `БУДИМ СЕ — Петте степени\nПоръчка: ${order.id}\nИздание: ${order.format === 'digital' ? 'Електронно' : 'Физическо'}\nКоличество: ${order.quantity}\nСума: ${euro(order.amount_total)}\nСтатус към ${new Date().toLocaleString('bg-BG')}: ${paymentLabels[order.payment_status] ?? order.payment_status}\n\nЛичен линк за достъп:\n${privateOrderLink(order.id, tokenRef.current)}\n\nПази този линк за себе си. Той дава достъп до твоята поръчка.\nКонтакт: budimseonline@gmail.com\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `BUDIM-SE-order-${order.id.slice(0, 8)}.txt`; a.click(); URL.revokeObjectURL(url);
  };
  const newPurchase = () => {
    if (order) sessionStorage.removeItem(`book-attempt:${order.format}:${order.quantity}`);
    setOrder(null); setOrderId(null); setError(''); setNotice('');
    window.history.replaceState(null, '', '/order');
  };

  const ready = store && (format === 'physical' ? store.physical_available : store.digital_available);
  const total = (store?.prices[format] ?? (format === 'physical' ? 1499 : 399)) * (format === 'digital' ? 1 : quantity);

  return <div id="book-purchase" className="border border-gray-200 rounded-xl p-5 md:p-7 lg:sticky lg:top-28 bg-white space-y-5">
    {store?.livemode === false && <p className="p-3 rounded-lg bg-amber-50 text-amber-900 text-sm" role="status">Тестов режим — покупките тук не са реални и не водят до доставка.</p>}
    {order && <section className="p-4 rounded-lg bg-gray-50 space-y-3" aria-label="Твоята поръчка" aria-live="polite">
      <h2 className="font-medium text-gray-900">{paymentLabels[order.payment_status] ?? order.payment_status}</h2>
      <p className="text-sm text-gray-600">{order.format === 'digital' ? 'Електронно издание' : 'Физическа книга'} · {order.quantity} бр. · {euro(order.amount_total)}</p>
      <p className="text-xs text-gray-500 break-all">Поръчка {order.id}</p>
      <p className="text-sm text-gray-700">{deliveryLabels[order.fulfillment_status] ?? order.fulfillment_status}</p>
      {order.tracking_number && <p className="text-sm text-gray-600">{order.shipping_carrier} · товарителница {order.tracking_number}</p>}
      {order.payment_status === 'pending' && <p className="text-sm text-gray-600">При този начин на плащане потвърждението може да пристигне по-късно. Запази личния линк и провери отново.</p>}
      {order.downloadable && <button onClick={download} disabled={busy} className="w-full rounded-lg bg-gray-900 text-white py-3 disabled:opacity-50">Изтегли електронната книга</button>}
      <div className="flex flex-wrap gap-3 text-sm">
        <button onClick={refreshOrder} disabled={busy} className="underline underline-offset-4">Провери статуса</button>
        <button onClick={saveAccess} className="underline underline-offset-4">Запази личния линк</button>
        {['paid', 'partially_refunded', 'refunded', 'expired'].includes(order.payment_status) && <button onClick={newPurchase} className="underline underline-offset-4">Нова покупка</button>}
      </div>
    </section>}
    {notice && <p className="text-sm text-gray-600" role="status">{notice}</p>}
    {error && <p className="p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</p>}
    <fieldset>
      <legend className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Избери издание</legend>
      <div className="grid grid-cols-2 gap-3">
        {(['physical', 'digital'] as const).map(value => <label key={value} className={`p-3 rounded-lg border cursor-pointer ${format === value ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>
          <input type="radio" name="book-format" value={value} checked={format === value} onChange={() => { setFormat(value); setError(''); }} className="mr-2 accent-gray-900" />
          <span className="text-sm">{value === 'physical' ? 'Физическа книга' : 'Електронно издание'}</span>
          <span className="block font-medium mt-2">{euro(store?.prices[value] ?? (value === 'physical' ? 1499 : 399))}</span>
        </label>)}
      </div>
    </fieldset>
    <p className="text-sm text-gray-500">{format === 'digital' ? 'Обогатено електронно издание в PDF за лично ползване. Изтегляне след потвърдено плащане.' : 'Физическата книга се изпраща на посочения при плащането адрес.'}</p>
    {format === 'physical' && <label className="flex items-center justify-between gap-4 text-sm text-gray-700">Количество
      <input type="number" min={1} max={100} value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(100, Math.trunc(Number(e.target.value)) || 1)))} className="w-24 border border-gray-200 rounded-lg px-3 py-2" />
    </label>}
    {format === 'digital' && <label className="flex gap-3 text-sm text-gray-600 leading-relaxed">
      <input type="checkbox" checked={immediate} onChange={e => setImmediate(e.target.checked)} className="mt-1 accent-gray-900" />
      <span>Искам електронната книга да бъде предоставена веднага след потвърдено плащане.</span>
    </label>}
    <div className="text-3xl font-medium text-gray-900">{euro(total)}</div>
    {format === 'digital' && store && !store.digital_available && <p className="text-sm text-gray-500">Електронното издание се подготвя. Покупката ще бъде достъпна при публикуването му.</p>}
    <button onClick={checkout} disabled={busy || !ready || (format === 'digital' && !immediate)} className="w-full py-4 bg-gray-900 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
      <Icon name={busy ? 'ri-loader-4-line' : 'ri-shopping-bag-line'} size={20} className={busy ? 'animate-spin' : ''} />
      {busy ? 'Обработване…' : `Купи — ${euro(total)}`}
    </button>
    <p className="text-xs text-gray-500">Плащане чрез Stripe. <Link to="/terms" className="underline">Условия за покупка</Link> · <Link to="/privacy" className="underline">Поверителност</Link></p>
  </div>;
}
