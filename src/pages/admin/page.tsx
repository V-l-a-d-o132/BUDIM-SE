import { useAdminAuth } from '@/hooks/useAdminAuth';
import { requiredAdminPermission } from '@/lib/admin-permissions';
import { useEffect, useState } from 'react';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { usePageSeo } from '@/hooks/usePageSeo';

interface Stats {
  inquiries: number;
  news_published: number;
  news_draft: number;
}

export default function AdminDashboard() {
  usePageSeo({
    title: 'Администрация — Обзор',
    description: 'Административен панел на Център БУДИМ СЕ.',
    noIndex: true,
  });

  const { admin } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ count: inquiries }, { count: newsPublished }, { count: newsDraft }] = await Promise.all([
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('news').select('*', { count: 'exact', head: true }).eq('published', false),
      ]);
      setStats({
        inquiries: inquiries ?? 0,
        news_published: newsPublished ?? 0,
        news_draft: newsDraft ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AdminGuard>
      <AdminLayout title="Обзор">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Запитвания', value: stats?.inquiries, icon: 'ri-mail-line', link: '/admin/inquiries' },
              { label: 'Публикувани новини', value: stats?.news_published, icon: 'ri-newspaper-line', link: '/admin/news' },
              { label: 'Чернови', value: stats?.news_draft, icon: 'ri-draft-line', link: '/admin/news' },
            ].filter(s => admin?.permissions.includes(requiredAdminPermission(s.link))).map((s, i) => (
              <a key={i} href={s.link} className="bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-300 transition-colors cursor-pointer block">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-lg">
                    <i className={`${s.icon} text-gray-500 text-lg`}></i>
                  </div>
                </div>
                <div className="text-3xl font-light text-gray-900 mb-1">
                  {loading ? <span className="text-gray-200">—</span> : s.value}
                </div>
                <p className="text-sm text-gray-500">{s.label}</p>
              </a>
            ))}
          </div>

          {/* Quick links */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Бързи действия</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {admin?.permissions.includes('news') && <a
                href="/admin/news?new=1"
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg flex-shrink-0">
                  <i className="ri-add-line text-gray-500"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Нова новина</p>
                  <p className="text-xs text-gray-400">Публикувай статия</p>
                </div>
              </a>}
              {admin?.permissions.includes('orders') && <a
                href="/admin/orders"
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg flex-shrink-0">
                  <i className="ri-shopping-bag-line text-gray-500"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Поръчки от Stripe</p>
                  <p className="text-xs text-gray-400">Виж всички продажби</p>
                </div>
              </a>}
              <a
                href="/admin/inquiries"
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg flex-shrink-0">
                  <i className="ri-mail-line text-gray-500"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Запитвания за партньорство</p>
                  <p className="text-xs text-gray-400">Виж всички запитвания</p>
                </div>
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg flex-shrink-0">
                  <i className="ri-external-link-line text-gray-500"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Виж сайта</p>
                  <p className="text-xs text-gray-400">Отвори в нов таб</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}