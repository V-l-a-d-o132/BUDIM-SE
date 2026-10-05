import { useEffect, useState } from 'react';
import AdminGuard from '@/pages/admin/components/AdminGuard';
import AdminLayout from '@/pages/admin/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { usePageSeo } from '@/hooks/usePageSeo';

interface LineItem {
  description: string;
  quantity: number;
  amount_total: number;
}

interface Order {
  id: string;
  status: string;
  amount_total: number;
  currency: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_address: Record<string, string> | null;
  shipping_address: Record<string, string> | null;
  shipping_name: string | null;
  line_items: LineItem[];
  created: number;
  metadata: Record<string, string>;
}

interface Stats {
  total_orders: number;
  total_revenue_stotinki: number;
  currency: string;
}

function formatAmount(stotinki: number, currency: string) {
  const amount = stotinki / 100;
  if (currency === 'bgn') return `${amount.toFixed(2)} лв.`;
  if (currency === 'eur') return `€${amount.toFixed(2)}`;
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}

function formatAddress(addr: Record<string, string> | null) {
  if (!addr) return '—';
  return [addr.line1, addr.line2, addr.city, addr.postal_code, addr.country]
    .filter(Boolean).join(', ');
}

export default function AdminOrders() {
  usePageSeo({
    title: 'Администрация — Поръчки',
    description: 'Административен панел — поръчки от Stripe.',
    noIndex: true,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/get-stripe-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ limit: 50 }),
      });

      if (!res.ok) {
        setError('Грешка при зареждане на поръчките.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setOrders(data.orders ?? []);
      setStats(data.stats ?? null);
      setLoading(false);
    }
    load();
  }, []);

  const statusLabel = (s: string) => {
    if (s === 'paid') return { label: 'Платена', cls: 'bg-green-50 text-green-700' };
    if (s === 'unpaid') return { label: 'Неплатена', cls: 'bg-red-50 text-red-700' };
    return { label: s, cls: 'bg-gray-100 text-gray-600' };
  };

  return (
    <AdminGuard>
      <AdminLayout title="Поръчки от Stripe">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Платени поръчки</p>
                <p className="text-3xl font-light text-gray-900">{stats.total_orders}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Общ приход</p>
                <p className="text-3xl font-light text-gray-900">
                  {formatAmount(stats.total_revenue_stotinki, stats.currency)}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <i className="ri-loader-4-line animate-spin text-gray-300 text-3xl"></i>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">
              <i className="ri-error-warning-line text-4xl mb-3 block"></i>
              <p className="text-sm">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <i className="ri-shopping-bag-line text-4xl mb-3 block"></i>
              <p className="text-sm">Няма поръчки все още.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-6">
              {/* List */}
              <div className="lg:col-span-2 space-y-2">
                {orders.map((order) => {
                  const st = statusLabel(order.status);
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelected(order)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        selected?.id === order.id
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-100 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm font-medium truncate ${selected?.id === order.id ? 'text-white' : 'text-gray-900'}`}>
                          {order.customer_name ?? order.customer_email ?? 'Анонимен'}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                          selected?.id === order.id ? 'bg-white/20 text-white' : st.cls
                        }`}>
                          {st.label}
                        </span>
                      </div>
                      <p className={`text-xs ${selected?.id === order.id ? 'text-gray-300' : 'text-gray-400'}`}>
                        {formatAmount(order.amount_total, order.currency)}
                      </p>
                      <p className={`text-xs mt-1 ${selected?.id === order.id ? 'text-gray-400' : 'text-gray-300'}`}>
                        {new Date(order.created * 1000).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Detail */}
              <div className="lg:col-span-3">
                {selected ? (
                  <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-24 space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-base font-medium text-gray-900">
                          {selected.customer_name ?? 'Анонимен'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{selected.id}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${statusLabel(selected.status).cls}`}>
                        {statusLabel(selected.status).label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Имейл</p>
                        <p className="text-sm text-gray-900">{selected.customer_email ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Сума</p>
                        <p className="text-sm font-medium text-gray-900">{formatAmount(selected.amount_total, selected.currency)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Дата</p>
                        <p className="text-sm text-gray-900">
                          {new Date(selected.created * 1000).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Получател</p>
                        <p className="text-sm text-gray-900">{selected.shipping_name ?? selected.customer_name ?? '—'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-medium">Адрес за доставка</p>
                      <p className="text-sm text-gray-900">{formatAddress(selected.shipping_address ?? selected.customer_address)}</p>
                    </div>

                    {selected.line_items.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-medium">Продукти</p>
                        <div className="space-y-2">
                          {selected.line_items.map((li, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                              <div>
                                <p className="text-sm text-gray-900">{li.description}</p>
                                <p className="text-xs text-gray-400">Количество: {li.quantity}</p>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{formatAmount(li.amount_total, selected.currency)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-gray-400">
                    <i className="ri-shopping-bag-line text-3xl mb-2 block"></i>
                    <p className="text-sm">Избери поръчка от списъка</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}