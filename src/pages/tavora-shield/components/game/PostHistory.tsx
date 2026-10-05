import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { GamePost } from './types';
import { getSessionId } from './useSessionId';
import Icon from '@/components/base/Icon';

const platformIcons: Record<string, string> = {
  instagram: 'ri-instagram-line',
  tiktok: 'ri-music-2-fill',
  facebook: 'ri-facebook-fill',
};

export default function PostHistory() {
  const [posts, setPosts] = useState<GamePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const sessionId = getSessionId();

    supabase
      .from('social_game_posts')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (mounted.current) {
          setPosts(data || []);
          setLoading(false);
        }
      });

    return () => { mounted.current = false; };
  }, []);

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const viralCount = posts.filter((p) => p.is_viral).length;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-center py-8">
        <Icon name="ri-loader-4-line" size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg">
          <Icon name="ri-history-line" size={14} className="text-gray-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Твоята история</h4>
          <p className="text-[10px] text-gray-400">Всичките ти публикации от тази сесия</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-xs text-gray-400">Все още не си публикувал нищо</p>
          <p className="text-[10px] text-gray-300 mt-1">Отвори Instagram, TikTok или Facebook и публикувай</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2.5 bg-gray-50 rounded-xl">
              <p className="text-xl font-light text-gray-900">{posts.length}</p>
              <p className="text-[9px] text-gray-500">Публикации</p>
            </div>
            <div className="text-center p-2.5 bg-red-50 rounded-xl">
              <p className="text-xl font-light text-red-600">{viralCount}</p>
              <p className="text-[9px] text-gray-500">Вирални 🔥</p>
            </div>
            <div className="text-center p-2.5 bg-amber-50 rounded-xl">
              <p className="text-xl font-light text-amber-600">{totalLikes >= 1000 ? `${(totalLikes / 1000).toFixed(0)}K` : totalLikes}</p>
              <p className="text-[9px] text-gray-500">Общо лайкове</p>
            </div>
          </div>

          {/* Posts list */}
          <div className="space-y-2">
            {posts.map((p) => (
              <div
                key={p.id}
                className={`border rounded-xl overflow-hidden cursor-pointer transition-all ${p.is_viral ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-gray-50/50'}`}
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.avatar_color} flex items-center justify-center flex-shrink-0`}>
                    <Icon name="ri-user-fill" size={9} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <i className={`${platformIcons[p.platform] || 'ri-global-line'} text-gray-400 text-[10px]`}></i>
                      <span className="text-[9px] text-gray-500">{p.platform}</span>
                      {p.is_viral && <span className="text-[8px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">🔥 ВИРАЛЕН</span>}
                      {p.challenge_id && <span className="text-[8px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">🏆 Предизвикателство</span>}
                    </div>
                    <p className="text-[9px] text-gray-700 truncate">{p.content}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900">{p.likes >= 1000 ? `${(p.likes / 1000).toFixed(0)}K` : p.likes}</p>
                    <p className="text-[7px] text-gray-400">лайкове</p>
                  </div>
                  <Icon name={expanded === p.id ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} size={14} className="text-gray-400 flex-shrink-0" />
                </div>

                {expanded === p.id && (
                  <div className="px-3 pb-3 border-t border-gray-100 pt-2.5 space-y-2">
                    <p className="text-[9px] text-gray-700 leading-relaxed">{p.content}</p>

                    {/* Score bar */}
                    <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] text-gray-500">AI Оценка</span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${p.viral_score >= 55 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{p.ai_label}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                        <div
                          className={`h-1.5 rounded-full ${p.viral_score >= 70 ? 'bg-red-500' : p.viral_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${p.viral_score}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[7px] text-green-600">Качествено</span>
                        <span className="text-[7px] text-gray-400">{p.viral_score}/100</span>
                        <span className="text-[7px] text-red-500">Манипулативно</span>
                      </div>
                    </div>

                    {p.ai_reason && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                        <p className="text-[8px] text-amber-700 leading-relaxed">
                          <i className="ri-robot-line mr-1"></i>{p.ai_reason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 text-[9px] text-gray-500">
                      <span><Icon name="ri-heart-line" size={10} className="inline mr-0.5" />{p.likes.toLocaleString()}</span>
                    <span><Icon name="ri-chat-1-line" size={10} className="inline mr-0.5" />{p.comments}</span>
                    <span><Icon name="ri-share-forward-line" size={10} className="inline mr-0.5" />{p.shares}</span>
                      <span className="ml-auto text-[8px] text-gray-400">
                        {new Date(p.created_at).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
