import { useState, useEffect, useCallback } from 'react';
import AdminGuard from '../components/AdminGuard';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { usePageSeo } from '@/hooks/usePageSeo';

interface GameComment {
  id: string;
  created_at: string;
  post_id: string;
  username: string;
  avatar_color: string;
  content: string;
  session_id?: string;
  approved: boolean;
  flagged: boolean;
}

interface PostInfo {
  id: string;
  platform: string;
  content: string;
  username: string;
}

export default function CommentsAdmin() {
  usePageSeo({
    title: 'Администрация — Модерация на коментари',
    description: 'Административен панел — модерация на коментари от играта.',
    noIndex: true,
  });

  const [comments, setComments] = useState<GameComment[]>([]);
  const [posts, setPosts] = useState<Record<string, PostInfo>>();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'hidden' | 'flagged'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, approved: 0, hidden: 0, flagged: 0 });

  const loadComments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('social_game_comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter === 'approved') query = query.eq('approved', true);
    if (filter === 'hidden') query = query.eq('approved', false);
    if (filter === 'flagged') query = query.eq('flagged', true);

    const { data } = await query.limit(200);
    if (data) {
      setComments(data);
      setStats({
        total: data.length,
        approved: data.filter((c) => c.approved).length,
        hidden: data.filter((c) => !c.approved).length,
        flagged: data.filter((c) => c.flagged).length,
      });

      // Load post info for unique post_ids
      const postIds = [...new Set(data.map((c) => c.post_id))];
      if (postIds.length > 0) {
        const { data: postData } = await supabase
          .from('social_game_posts')
          .select('id, platform, content, username')
          .in('id', postIds);
        if (postData) {
          const map: Record<string, PostInfo> = {};
          postData.forEach((p) => { map[p.id] = p; });
          setPosts(map);
        }
      }
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadComments(); }, [loadComments]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-comments-' + Date.now())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'social_game_comments' }, () => {
        loadComments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadComments]);

  const toggleApproval = async (comment: GameComment) => {
    setActionLoading(comment.id);
    await supabase
      .from('social_game_comments')
      .update({ approved: !comment.approved })
      .eq('id', comment.id);
    setComments((prev) => prev.map((c) => c.id === comment.id ? { ...c, approved: !c.approved } : c));
    setActionLoading(null);
  };

  const toggleFlag = async (comment: GameComment) => {
    setActionLoading(comment.id + '-flag');
    await supabase
      .from('social_game_comments')
      .update({ flagged: !comment.flagged, approved: comment.flagged ? comment.approved : false })
      .eq('id', comment.id);
    setComments((prev) => prev.map((c) =>
      c.id === comment.id
        ? { ...c, flagged: !c.flagged, approved: c.flagged ? c.approved : false }
        : c
    ));
    setActionLoading(null);
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Изтрий коментара?')) return;
    setActionLoading(id);
    await supabase.from('social_game_comments').delete().eq('id', id);
    setComments((prev) => prev.filter((c) => c.id !== id));
    setActionLoading(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const platformIcon: Record<string, string> = {
    instagram: 'ri-instagram-line',
    tiktok: 'ri-music-2-fill',
    facebook: 'ri-facebook-fill',
  };

  return (
    <AdminGuard>
      <AdminLayout title="Модерация на коментари">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Общо коментари', value: stats.total, icon: 'ri-chat-1-line', color: 'text-gray-600' },
              { label: 'Одобрени', value: stats.approved, icon: 'ri-checkbox-circle-line', color: 'text-green-600' },
              { label: 'Скрити', value: stats.hidden, icon: 'ri-eye-off-line', color: 'text-gray-400' },
              { label: 'Маркирани', value: stats.flagged, icon: 'ri-flag-line', color: 'text-red-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className={`${s.icon} ${s.color} text-lg`}></i>
                </div>
                <p className="text-2xl font-light text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-1 flex-wrap">
              {([
                { id: 'all', label: 'Всички' },
                { id: 'approved', label: 'Одобрени' },
                { id: 'hidden', label: 'Скрити' },
                { id: 'flagged', label: '🚩 Маркирани' },
              ] as const).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${filter === f.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={loadComments}
              className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <i className="ri-refresh-line text-xs"></i>
              Обнови
            </button>
          </div>

          {/* Comments list */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <i className="ri-loader-4-line animate-spin text-gray-400 text-2xl"></i>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-16">
                <i className="ri-chat-1-line text-gray-300 text-4xl mb-3 block"></i>
                <p className="text-sm text-gray-400">Няма коментари</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {comments.map((comment) => {
                  const post = posts[comment.post_id];
                  return (
                    <div
                      key={comment.id}
                      className={`p-4 ${!comment.approved ? 'bg-gray-50 opacity-70' : ''} ${comment.flagged ? 'border-l-2 border-red-400' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${comment.avatar_color} flex items-center justify-center flex-shrink-0`}>
                          <i className="ri-user-fill text-white text-xs"></i>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-gray-900">{comment.username}</span>
                            {comment.flagged && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">🚩 Маркиран</span>
                            )}
                            {!comment.approved && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Скрит</span>
                            )}
                            <span className="text-[10px] text-gray-400 ml-auto">{formatDate(comment.created_at)}</span>
                          </div>

                          {/* Comment text */}
                          <p className="text-sm text-gray-800 mb-2 leading-relaxed">{comment.content}</p>

                          {/* Post context */}
                          {post && (
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                              <i className={`${platformIcon[post.platform] || 'ri-global-line'} text-gray-400 text-xs flex-shrink-0`}></i>
                              <div className="min-w-0">
                                <span className="text-[10px] text-gray-500 font-medium">Пост от </span>
                                <span className="text-[10px] text-gray-700 font-semibold">{post.username}</span>
                                <span className="text-[10px] text-gray-400">: </span>
                                <span className="text-[10px] text-gray-500 truncate">{post.content.slice(0, 60)}…</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => toggleApproval(comment)}
                            disabled={actionLoading === comment.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 ${comment.approved ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {actionLoading === comment.id ? <i className="ri-loader-4-line animate-spin"></i> : comment.approved ? 'Скрий' : 'Одобри'}
                          </button>
                          <button
                            onClick={() => toggleFlag(comment)}
                            disabled={actionLoading === comment.id + '-flag'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 ${comment.flagged ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          >
                            {actionLoading === comment.id + '-flag' ? <i className="ri-loader-4-line animate-spin"></i> : comment.flagged ? 'Размаркирай' : '🚩 Маркирай'}
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            disabled={!!actionLoading}
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