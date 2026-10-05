import { useEffect, useState, useCallback } from 'react';
import AdminGuard from '@/pages/admin/components/AdminGuard';
import AdminLayout from '@/pages/admin/components/AdminLayout';
import { supabase, invalidateNewsCache } from '@/lib/supabase';
import { usePageSeo } from '@/hooks/usePageSeo';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  image_url: string | null;
}

interface NewsForm {
  id?: string;
  title: string;
  body: string;
  image_url: string;
  published: boolean;
}

const emptyForm: NewsForm = { title: '', body: '', image_url: '', published: false };

async function callAdminNews(method: string, body: unknown, token: string) {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/admin-news`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export default function AdminNews() {
  usePageSeo({
    title: 'Администрация — Новини',
    description: 'Административен панел — управление на новини.',
    noIndex: true,
  });

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setToken(session.access_token);
    });
  }, []);

  const loadNews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const data = await callAdminNews('GET', null, token);
    setNewsList(data.news ?? []);
    setLoading(false);
  }, [token]);

  useEffect(() => { loadNews(); }, [loadNews]);

  // Check URL for ?new=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
      setForm(emptyForm);
      setEditing(true);
    }
  }, []);

  const handleEdit = async (item: NewsItem) => {
    // Load full body
    const { data } = await supabase.from('news').select('*').eq('id', item.id).maybeSingle();
    if (data) {
      setForm({ id: data.id, title: data.title, body: data.body, image_url: data.image_url ?? '', published: data.published });
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setStatusMsg('Заглавието и текстът са задължителни.');
      return;
    }
    setSaving(true);
    setStatusMsg('');

    const method = form.id ? 'PUT' : 'POST';
    const payload = form.id
      ? { id: form.id, title: form.title, body: form.body, image_url: form.image_url || null, published: form.published }
      : { title: form.title, body: form.body, image_url: form.image_url || null, published: form.published };

    const data = await callAdminNews(method, payload, token);

    if (data.error) {
      setStatusMsg(data.error);
    } else {
      const savedSlug = data.news?.slug ?? form.title.toLowerCase().replace(/\s+/g, '-');
      const savedTitle = data.news?.title ?? form.title;
      const isPublished = form.published;

      // Invalidate frontend cache
      invalidateNewsCache();

      // Auto-index if published
      if (isPublished) {
        try {
          const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
          const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
          await fetch(`${supabaseUrl}/functions/v1/notify-google-index`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'apikey': supabaseAnonKey,
            },
            body: JSON.stringify({
              slug: savedSlug,
              title: savedTitle,
              action: form.id ? 'URL_UPDATED' : 'URL_UPDATED',
            }),
          });
        } catch {
          // Non-critical — don't block save
        }
      }

      setStatusMsg(form.id ? 'Новината е обновена.' : 'Новината е създадена.');
      setEditing(false);
      setForm(emptyForm);
      loadNews();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Сигурен ли си, че искаш да изтриеш тази новина?')) return;
    setDeleting(id);
    await callAdminNews('DELETE', { id }, token);
    setNewsList((prev) => prev.filter((n) => n.id !== id));
    if (form.id === id) { setEditing(false); setForm(emptyForm); }
    setDeleting(null);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Новини">
        <div className="max-w-6xl mx-auto">
          {!editing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{newsList.length} новини</p>
                <button
                  onClick={() => { setForm(emptyForm); setEditing(true); setStatusMsg(''); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line"></i>
                  Нова новина
                </button>
              </div>

              {statusMsg && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-2.5">{statusMsg}</p>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <i className="ri-loader-4-line animate-spin text-gray-300 text-3xl"></i>
                </div>
              ) : newsList.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <i className="ri-newspaper-line text-4xl mb-3 block"></i>
                  <p className="text-sm">Няма новини. Създай първата.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {newsList.map((item, i) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i !== newsList.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      {item.image_url && (
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(item.created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                        item.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.published ? 'Публикувана' : 'Чернова'}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <i className="ri-edit-line text-sm"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deleting === item.id
                            ? <i className="ri-loader-4-line animate-spin text-sm"></i>
                            : <i className="ri-delete-bin-line text-sm"></i>
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Editor */
            <div className="max-w-3xl space-y-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditing(false); setForm(emptyForm); setStatusMsg(''); }}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-left-line"></i>
                </button>
                <h2 className="text-base font-medium text-gray-900">
                  {form.id ? 'Редактирай новина' : 'Нова новина'}
                </h2>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Заглавие *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="Заглавие на новината"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">URL на снимка</label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="https://..."
                  />
                  {form.image_url && (
                    <div className="mt-2 w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                      <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Текст *</label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    rows={14}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors resize-y font-mono leading-relaxed"
                    placeholder="Текст на новината..."
                  ></textarea>
                  <p className="text-xs text-gray-400 mt-1">Поддържа се обикновен текст. Нов ред = нов параграф.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                    className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.published ? 'bg-gray-900' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.published ? 'translate-x-5' : 'translate-x-1'}`}></span>
                  </button>
                  <span className="text-sm text-gray-700">
                    {form.published ? 'Публикувана (видима на сайта)' : 'Чернова (скрита)'}
                  </span>
                </div>

                {statusMsg && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{statusMsg}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? <><i className="ri-loader-4-line animate-spin"></i> Запазване...</> : <><i className="ri-save-line"></i> Запази</>}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setForm(emptyForm); setStatusMsg(''); }}
                    className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Откажи
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}