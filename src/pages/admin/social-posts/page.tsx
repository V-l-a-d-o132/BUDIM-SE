import LegacyIcon from '@/components/base/LegacyIcon';
import { useState, useEffect, useCallback } from 'react';
import AdminGuard from '../components/AdminGuard';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { usePageSeo } from '@/hooks/usePageSeo';

// ── Reset Modal ───────────────────────────────────────────────────────────────
function ResetModal({ onConfirm, onCancel, loading }: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <LegacyIcon className="ri-alarm-warning-line text-red-600 text-xl"></LegacyIcon>
        </div>
        <h3 className="text-base font-semibold text-gray-900 text-center mb-2">Нулиране на всички постове</h3>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-1">
          Това ще изтрие <strong>всички постове и коментари</strong> от играта.
        </p>
        <p className="text-xs text-gray-400 text-center mb-6">
          Използвай преди нов урок, за да започнете с чиста база.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            Отказ
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <><LegacyIcon className="ri-loader-4-line animate-spin"></LegacyIcon>Нулиране...</>
            ) : (
              <><LegacyIcon className="ri-delete-bin-2-line"></LegacyIcon>Нулирай всичко</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface GamePost {
  id: string;
  created_at: string;
  platform: string;
  content: string;
  username: string;
  avatar_color: string;
  likes: number;
  comments: number;
  shares: number;
  is_viral: boolean;
  viral_score: number;
  ai_label: string;
  ai_reason?: string;
  approved: boolean;
}

type StatusFilter = 'all' | 'approved' | 'hidden' | 'viral';
type PlatformFilter = 'all' | 'instagram' | 'tiktok' | 'facebook';
type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'custom';

const platformLabels: Record<string, { label: string; icon: string; color: string }> = {
  instagram: { label: 'Instagram', icon: 'ri-instagram-line', color: 'text-pink-600 bg-pink-50' },
  tiktok: { label: 'TikTok', icon: 'ri-music-2-fill', color: 'text-gray-900 bg-gray-100' },
  facebook: { label: 'Facebook', icon: 'ri-facebook-fill', color: 'text-[#1877F2] bg-[#e7f0fd]' },
};

// ── CSV Export helper ─────────────────────────────────────────────────────────
function exportToCSV(posts: GamePost[]) {
  const headers = ['Потребител', 'Платформа', 'Съдържание', 'Лайкове', 'Коментари', 'Споделяния', 'Вирален', 'Вирален скор', 'AI етикет', 'Одобрен', 'Дата'];
  const rows = posts.map((p) => [
    p.username,
    p.platform,
    `"${p.content.replace(/"/g, '""')}"`,
    p.likes,
    p.comments,
    p.shares,
    p.is_viral ? 'Да' : 'Не',
    p.viral_score,
    p.ai_label,
    p.approved ? 'Да' : 'Не',
    new Date(p.created_at).toLocaleString('bg-BG'),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `игрови-постове-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Date range helper ─────────────────────────────────────────────────────────
function getDateRange(filter: DateFilter, customFrom: string, customTo: string): { from: string | null; to: string | null } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === 'today') {
    return { from: todayStart.toISOString(), to: null };
  }
  if (filter === 'yesterday') {
    const yStart = new Date(todayStart);
    yStart.setDate(yStart.getDate() - 1);
    return { from: yStart.toISOString(), to: todayStart.toISOString() };
  }
  if (filter === 'week') {
    const wStart = new Date(todayStart);
    wStart.setDate(wStart.getDate() - 7);
    return { from: wStart.toISOString(), to: null };
  }
  if (filter === 'custom' && customFrom) {
    const from = new Date(customFrom);
    const to = customTo ? new Date(customTo + 'T23:59:59') : null;
    return { from: from.toISOString(), to: to ? to.toISOString() : null };
  }
  return { from: null, to: null };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SocialPostsAdmin() {
  usePageSeo({
    title: 'Администрация — Игрови постове',
    description: 'Административен панел — модерация на игрови постове.',
    noIndex: true,
  });

  const [posts, setPosts] = useState<GamePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, viral: 0, approved: 0, hidden: 0 });
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('social_game_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (platformFilter !== 'all') query = query.eq('platform', platformFilter);
    if (filter === 'approved') query = query.eq('approved', true);
    if (filter === 'hidden') query = query.eq('approved', false);
    if (filter === 'viral') query = query.eq('is_viral', true);

    const { from, to } = getDateRange(dateFilter, customFrom, customTo);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data } = await query.limit(200);
    if (data) {
      setPosts(data);
      setStats({
        total: data.length,
        viral: data.filter((p) => p.is_viral).length,
        approved: data.filter((p) => p.approved).length,
        hidden: data.filter((p) => !p.approved).length,
      });
    }
    setLoading(false);
  }, [filter, platformFilter, dateFilter, customFrom, customTo]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const toggleApproval = async (post: GamePost) => {
    setActionLoading(post.id);
    const { data, error } = await supabase.from('social_game_posts').update({ approved: !post.approved }).eq('id', post.id).select('id').single();
    if (error || !data) { alert('Публикацията не е обновена. Проверете достъпа и опитайте отново.'); setActionLoading(null); return; }
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, approved: !p.approved } : p));
    setActionLoading(null);
  };

  const deletePost = async (id: string) => {
    if (!confirm('Сигурен ли си, че искаш да изтриеш този пост?')) return;
    setActionLoading(id);
    const { data, error } = await supabase.from('social_game_posts').delete().eq('id', id).select('id').single();
    if (!error && data) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => ({ ...prev, total: prev.total - 1 }));
    }
    setActionLoading(null);
  };

  const handleReset = async () => {
    setResetLoading(true);
    try {
      const { error } = await supabase.from('social_game_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setPosts([]);
      setStats({ total: 0, viral: 0, approved: 0, hidden: 0 });
      setShowResetModal(false);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    } catch (e) {
      alert('Нулирането не е изпълнено. Проверете достъпа и опитайте отново.');
    } finally {
      setResetLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const dateFilterLabels: Record<DateFilter, string> = {
    all: 'Всички дати',
    today: 'Днес',
    yesterday: 'Вчера',
    week: 'Последните 7 дни',
    custom: 'Избери период',
  };

  return (
    <AdminGuard>
      <AdminLayout title="Игрови постове">
        <div className="space-y-5">

          {/* Reset modal */}
          {showResetModal && (
            <ResetModal
              onConfirm={handleReset}
              onCancel={() => setShowResetModal(false)}
              loading={resetLoading}
            />
          )}

          {/* Success banner */}
          {resetSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <LegacyIcon className="ri-checkbox-circle-fill text-green-600 text-lg"></LegacyIcon>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Нулирането е успешно!</p>
                <p className="text-xs text-green-600 mt-0.5">Всички постове и коментари са изтрити. Готови сте за нов урок.</p>
              </div>
            </div>
          )}

          {/* ── TOP ACTION BAR ── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Игрови постове от учениците</p>
              <p className="text-xs text-gray-400 mt-0.5">Управлявай, филтрирай и експортирай резултатите от урока</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* CSV Export */}
              <button
                onClick={() => exportToCSV(posts)}
                disabled={posts.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <LegacyIcon className="ri-download-2-line text-sm"></LegacyIcon>
                </div>
                Експорт CSV
              </button>
              {/* Reset */}
              <button
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <LegacyIcon className="ri-refresh-line text-sm"></LegacyIcon>
                </div>
                Нулирай за нов урок
              </button>
            </div>
          </div>

          {/* ── STATS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Общо постове', value: stats.total, icon: 'ri-file-list-3-line', color: 'text-gray-600', bg: 'bg-gray-50' },
              { label: 'Вирални', value: stats.viral, icon: 'ri-fire-line', color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Одобрени', value: stats.approved, icon: 'ri-checkbox-circle-line', color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Скрити', value: stats.hidden, icon: 'ri-eye-off-line', color: 'text-gray-400', bg: 'bg-gray-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${s.bg} flex-shrink-0`}>
                  <LegacyIcon className={`${s.icon} ${s.color} text-lg`}></LegacyIcon>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── FILTERS ── */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
            {/* Row 1: Status + Platform */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-gray-400 w-16 flex-shrink-0">Статус</span>
              <div className="flex gap-1 flex-wrap">
                {(['all', 'approved', 'hidden', 'viral'] as StatusFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {f === 'all' ? 'Всички' : f === 'approved' ? 'Одобрени' : f === 'hidden' ? 'Скрити' : '🔥 Вирални'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-gray-400 w-16 flex-shrink-0">Платформа</span>
              <div className="flex gap-1 flex-wrap">
                {(['all', 'instagram', 'tiktok', 'facebook'] as PlatformFilter[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${platformFilter === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {p === 'all' ? 'Всички' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Date filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-gray-400 w-16 flex-shrink-0">Период</span>
              <div className="flex gap-1 flex-wrap">
                {(['all', 'today', 'yesterday', 'week', 'custom'] as DateFilter[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDateFilter(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${dateFilter === d ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {dateFilterLabels[d]}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom date range */}
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-3 pt-1 pl-20">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 whitespace-nowrap">От:</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 cursor-pointer focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 whitespace-nowrap">До:</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 cursor-pointer focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── POSTS LIST ── */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {/* List header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">
                {loading ? 'Зареждане...' : `${posts.length} поста`}
                {dateFilter !== 'all' && !loading && (
                  <span className="ml-2 text-gray-400">· {dateFilterLabels[dateFilter]}</span>
                )}
              </p>
              {!loading && posts.length > 0 && (
                <button
                  onClick={() => exportToCSV(posts)}
                  className="text-xs text-gray-400 hover:text-gray-700 cursor-pointer flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <LegacyIcon className="ri-download-2-line"></LegacyIcon>
                  Свали CSV
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <LegacyIcon className="ri-loader-4-line animate-spin text-gray-400 text-2xl"></LegacyIcon>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <LegacyIcon className="ri-inbox-line text-gray-300 text-4xl"></LegacyIcon>
                </div>
                <p className="text-sm text-gray-400">Няма постове за избрания период</p>
                {dateFilter !== 'all' && (
                  <button
                    onClick={() => setDateFilter('all')}
                    className="mt-2 text-xs text-gray-500 underline cursor-pointer hover:text-gray-700"
                  >
                    Покажи всички
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {posts.map((post) => {
                  const plt = platformLabels[post.platform] || { label: post.platform, icon: 'ri-global-line', color: 'text-gray-600 bg-gray-100' };
                  return (
                    <div key={post.id} className={`p-4 transition-colors ${!post.approved ? 'bg-gray-50/60' : 'hover:bg-gray-50/40'}`}>
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${post.avatar_color || 'from-gray-400 to-gray-600'} flex items-center justify-center flex-shrink-0`}>
                          <LegacyIcon className="ri-user-fill text-white text-sm"></LegacyIcon>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-sm font-semibold text-gray-900">{post.username}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${plt.color}`}>
                              <LegacyIcon className={plt.icon}></LegacyIcon>{plt.label}
                            </span>
                            {post.is_viral && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">🔥 ВИРАЛЕН</span>
                            )}
                            {!post.approved && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Скрит</span>
                            )}
                            <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">{formatDate(post.created_at)}</span>
                          </div>

                          <p className="text-sm text-gray-700 mb-2 leading-relaxed">{post.content}</p>

                          {/* Viral score bar */}
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${post.viral_score >= 70 ? 'bg-red-500' : post.viral_score >= 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                                  style={{ width: `${post.viral_score}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] text-gray-500 font-medium">{post.viral_score}/100</span>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${post.viral_score >= 55 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                              {post.ai_label}
                            </span>
                          </div>

                          {post.ai_reason && (
                            <p className="text-[10px] text-gray-400 italic mb-2 leading-relaxed">{post.ai_reason}</p>
                          )}

                          {/* Engagement */}
                          <div className="flex items-center gap-4 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <LegacyIcon className="ri-heart-line"></LegacyIcon>{post.likes.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <LegacyIcon className="ri-chat-1-line"></LegacyIcon>{post.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <LegacyIcon className="ri-share-forward-line"></LegacyIcon>{post.shares}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleApproval(post)}
                            disabled={actionLoading === post.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 ${
                              post.approved
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {actionLoading === post.id
                              ? <LegacyIcon className="ri-loader-4-line animate-spin"></LegacyIcon>
                              : post.approved ? 'Скрий' : 'Одобри'}
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            disabled={actionLoading === post.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap disabled:opacity-50"
                          >
                            Изтрий
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </AdminLayout>
    </AdminGuard>
  );
}