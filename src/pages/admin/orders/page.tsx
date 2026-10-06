import { useCallback, useEffect, useState } from 'react';
import AdminGuard from '@/pages/admin/components/AdminGuard';
import AdminLayout from '@/pages/admin/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { bookApi, euro, paymentLabels, deliveryLabels } from '@/lib/book-orders';
import type { BookOrder } from '@/lib/book-orders';
import { usePageSeo } from '@/hooks/usePageSeo';
import StripeReconciliation from './StripeReconciliation';

type AdminOrder = Omit<BookOrder, 'amount_total' | 'downloadable'> & {
  expected_amount: number; customer_email: string | null; customer_name: string | null;
  customer_phone: string | null; shipping_name: string | null; shipping_address: Record<string, string> | null;
};
interface Totals { paid_orders: number; gross_minor: number; refunded_minor: number; net_minor: number }
interface Cursor { id: string; created_at: string }
interface History { action: string; details: Record<string, string>; created_at: string }
const nextDelivery: Record<string, string> = { ready: 'preparing', preparing: 'shipped', shipped: 'delivered' };
const deliveryActions: Record<string, string> = { ready: 'Започни подготовката', preparing: 'Отбележи изпращане', shipped: 'Отбележи доставка' };
const historyLabels: Record<string, string> = { created: 'Създадена', payment_verified: 'Потвърдено плащане', delivery_updated: 'Обновена доставка', download_link_issued: 'Издаден линк за изтегляне' };

export default function AdminOrders() {
  usePageSeo({ title: 'Администрация — Поръчки на книгата', description: 'Поръчки, електронни издания и доставки.', noIndex: true });
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<Totals | null>(null);
  const [mode, setMode] = useState<boolean | undefined>();
  const [activeMode, setActiveMode] = useState<boolean | null>(null);
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [configured, setConfigured] = useState(false);
  const [edition, setEdition] = useState<{ id: string; label: string } | null>(null);
  const [editionLabel, setEditionLabel] = useState('Обогатено електронно издание');

  const api = useCallback(async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Влез отново в администрацията.');
    return bookApi('admin-book-orders', body, session.access_token);
  }, []);
  const load = useCallback(async (more?: Cursor) => {
    setLoading(true); setError('');
    try {
      const result = await api({ action: 'list', ...(mode !== undefined ? { livemode: mode } : {}), ...(more ? { cursor: more } : {}) });
      setOrders(previous => more ? [...previous, ...result.orders] : result.orders);
      setStats(result.stats); setActiveMode(result.active_mode); setCursor(result.cursor); setHasMore(result.has_more);
      setConfigured(result.configuration.webhook_configured === true); setEdition(result.edition ?? null);
      if (!more) { setSelected(null); setHistory([]); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Поръчките временно не са достъпни.'); }
    finally { setLoading(false); }
  }, [api, mode]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let active = true; setHistory([]); setCarrier(selected?.shipping_carrier ?? ''); setTracking(selected?.tracking_number ?? '');
    if (selected) api({ action: 'history', order_id: selected.id }).then(data => { if (active) setHistory(data.history); }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [api, selected]);
  const selectedMode = mode ?? activeMode;
  const setup = async () => {
    setBusy(true); setError(''); setNotice('');
    try { await api({ action: 'setup_webhook', livemode: selectedMode }); setConfigured(true); setNotice('Известяванията от Stripe са настроени за избрания режим.'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Настройката не е завършена.'); }
    finally { setBusy(false); }
  };
  const updateDelivery = async () => {
    if (!selected) return;
    const next = nextDelivery[selected.fulfillment_status];
    if (!next) return;
    setBusy(true); setError('');
    try {
      const result = await api({ action: 'update_delivery', order_id: selected.id, previous_status: selected.fulfillment_status, next_status: next, carrier, tracking_number: tracking });
      setOrders(previous => previous.map(row => row.id === result.order.id ? result.order : row)); setSelected(result.order);
    } catch (err) { setError(err instanceof Error ? err.message : 'Статусът не е обновен.'); }
    finally { setBusy(false); }
  };
  const uploadEdition = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (file.size > 25 * 1024 * 1024 || file.size === 0 || !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Избери PDF файл до 25 MB.');
      if (!editionLabel.trim()) throw new Error('Въведи име на изданието.');
      const bytes = await file.arrayBuffer();
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
      const path = `editions/${crypto.randomUUID()}/${hash}.pdf`;
      const result = await supabase.storage.from('book-downloads').upload(path, file, { contentType: 'application/pdf', upsert: false });
      if (result.error) throw new Error('Файлът не е качен. Провери входа си с втори фактор и опитай отново.');
      const activated = await api({ action: 'activate_ebook', object_path: path, sha256: hash, label: editionLabel.trim() });
      setEdition(activated.edition); setNotice('Електронното издание е публикувано за покупка и защитено изтегляне.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Изданието не е публикувано.'); }
    finally { setBusy(false); }
  };

  return <AdminGuard><AdminLayout title="Поръчки на книгата"><div className="max-w-6xl mx-auto space-y-6">
    <div className="flex flex-wrap gap-3 items-center">
      <label className="text-sm text-gray-600">Показване
        <select value={selectedMode === null ? '' : selectedMode ? 'live' : 'test'} disabled={busy || activeMode === null} onChange={e => setMode(e.target.value === 'live')} className="ml-3 border rounded-lg p-2">
          {activeMode === null && <option value="">Зареждане…</option>}<option value="live">Реални поръчки</option><option value="test">Тестови поръчки</option>
        </select>
      </label>
      <button onClick={() => load()} disabled={loading || busy} className="text-sm underline">Обнови</button>
    </div>
    {activeMode === false && <p className="p-3 bg-amber-50 text-amber-900 rounded-lg text-sm">Сайтът е в тестов режим. За реални продажби трябва да бъде настроен реалният Stripe ключ и известяванията за реални плащания.</p>}
    {selectedMode === false && <p className="text-sm text-gray-600">Тестови данни — сумите тук не са реален приход и тези поръчки не се изпращат.</p>}
    {error && <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</p>}
    {notice && <p role="status" className="p-3 bg-green-50 text-green-800 rounded-lg text-sm">{notice}</p>}
    {stats && <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[
      ['Платени поръчки', String(stats.paid_orders)], ['Получени плащания', euro(stats.gross_minor)],
      ['Възстановени суми', euro(stats.refunded_minor)], ['Плащания след възстановявания', euro(stats.net_minor)],
    ].map(([label,value]) => <div key={label} className="p-4 bg-white border rounded-xl"><p className="text-xs text-gray-500 mb-2">{label}</p><p className="text-xl text-gray-900">{value}</p></div>)}</div>}
    <p className="text-xs text-gray-500">Справката обхваща записаните в новата система поръчки на книгата. Показаните суми са в EUR и са преди таксите на Stripe.</p>
    <StripeReconciliation mode={selectedMode ?? null} api={api} />
    <section className="bg-white border rounded-xl p-5 space-y-3">
      <h2 className="font-medium text-gray-900">Плащания и електронно издание</h2>
      <p className="text-sm text-gray-600">Известявания от Stripe: {configured ? 'настроени' : 'очакват настройка'} за {selectedMode ? 'реални плащания' : 'тестови плащания'}.</p>
      <button onClick={setup} disabled={busy || selectedMode === null} className="border rounded-lg px-4 py-2 text-sm disabled:opacity-50">{configured ? 'Провери настройката' : 'Настрой известяванията'}</button>
      <p className="text-sm text-gray-600">Активно електронно издание: {edition?.label ?? 'още не е качено'}.</p>
      <label className="block text-sm text-gray-600">Име на новото издание<input value={editionLabel} maxLength={120} onChange={e => setEditionLabel(e.target.value)} className="block w-full mt-2 border rounded-lg px-3 py-2" /></label>
      <label className="block text-sm text-gray-600">Качи окончателния PDF за продажба<input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={e => { uploadEdition(e.target.files?.[0]); e.target.value = ''; }} className="block mt-2 text-sm" /></label>
      <p className="text-xs text-gray-500">До 25 MB. Новите покупки получават това издание; предишните покупки запазват своята версия.</p>
    </section>
    {loading && orders.length === 0 ? <p className="text-gray-500 py-10 text-center">Зареждане…</p> : orders.length === 0 ? <p className="text-gray-500 py-10 text-center">Няма записани поръчки в този режим.</p> : <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-2">{orders.map(row => <button key={row.id} onClick={() => setSelected(row)} className={`w-full text-left p-4 rounded-xl border ${selected?.id === row.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}`}>
        <p className="text-sm font-medium text-gray-900 truncate">{row.customer_name ?? row.customer_email ?? `Поръчка ${row.id.slice(0,8)}`}</p>
        <p className="text-sm text-gray-600 mt-1">{row.format === 'digital' ? 'Електронно' : 'Физическо'} · {euro(row.expected_amount)}</p>
        <p className="text-xs text-gray-500 mt-2">{paymentLabels[row.payment_status]} · {deliveryLabels[row.fulfillment_status]}</p>
        <p className="text-xs text-gray-400 mt-2">{new Date(row.created_at).toLocaleString('bg-BG')}</p>
      </button>)}{hasMore && cursor && <button onClick={() => load(cursor)} disabled={loading} className="w-full py-3 border rounded-lg text-sm">Зареди още</button>}</div>
      <div className="lg:col-span-3">{selected ? <section className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="font-medium text-gray-900">{selected.format === 'digital' ? 'Електронно издание' : 'Физическа книга'} · {selected.quantity} бр.</h2>
        <p className="text-xs break-all text-gray-500">{selected.id}</p>
        <p className="text-sm text-gray-700">{paymentLabels[selected.payment_status]} · {deliveryLabels[selected.fulfillment_status]}</p>
        <dl className="text-sm space-y-2 text-gray-600"><div><dt className="font-medium">Клиент</dt><dd>{selected.customer_name ?? '—'} · {selected.customer_email ?? '—'} · {selected.customer_phone ?? '—'}</dd></div>
          {selected.format === 'physical' && <div><dt className="font-medium">Доставка</dt><dd>{selected.shipping_name ?? '—'}</dd><dd>{selected.shipping_address ? ['line1','line2','city','postal_code','country'].map(key => selected.shipping_address?.[key]).filter(Boolean).join(', ') : 'Адресът се записва след потвърдено плащане.'}</dd></div>}
          <div><dt className="font-medium">Платено / възстановено</dt><dd>{euro(selected.amount_paid)} / {euro(selected.amount_refunded)}</dd></div>
        </dl>
        {selected.format === 'physical' && ['paid','partially_refunded'].includes(selected.payment_status) && ['ready','preparing','shipped'].includes(selected.fulfillment_status) && <div className="border-t pt-4 space-y-3">
          {selected.fulfillment_status === 'preparing' && <><label className="block text-sm">Куриер<input value={carrier} maxLength={80} onChange={e=>setCarrier(e.target.value)} className="block mt-1 w-full border rounded-lg p-2" /></label><label className="block text-sm">Товарителница<input value={tracking} maxLength={120} onChange={e=>setTracking(e.target.value)} className="block mt-1 w-full border rounded-lg p-2" /></label></>}
          <button onClick={updateDelivery} disabled={busy} className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">{deliveryActions[selected.fulfillment_status]}</button>
        </div>}
        {selected.tracking_number && <p className="text-sm text-gray-600">{selected.shipping_carrier} · {selected.tracking_number}</p>}
        <div className="border-t pt-4"><h3 className="text-sm font-medium text-gray-900 mb-3">История</h3><ul className="space-y-2">{history.map((item,i)=><li key={i} className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString('bg-BG')} · {historyLabels[item.action] ?? item.action}{item.details.to ? ` → ${deliveryLabels[item.details.to] ?? item.details.to}` : ''}</li>)}</ul></div>
      </section> : <p className="text-center text-sm text-gray-400 py-10">Избери поръчка за подробности.</p>}</div>
    </div>}
  </div></AdminLayout></AdminGuard>;
}
