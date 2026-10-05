import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { GameComment, AVATAR_COLORS } from './types';
import { getSessionId } from './useSessionId';
import { containsProfanity, getProfanityMessage } from './profanityFilter';
import Icon from '@/components/base/Icon';

interface CommentsSectionProps {
  postId: string;
  initialCount: number;
  username: string;
}

export default function CommentsSection({ postId, initialCount, username }: CommentsSectionProps) {
  const [comments, setComments] = useState<GameComment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [justSent, setJustSent] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    supabase
      .from('social_game_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('approved', true)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (mounted.current) {
          setComments(data || []);
          setLoaded(true);
        }
      });

    const channel = supabase
      .channel(`comments-${postId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'social_game_comments',
        filter: `post_id=eq.${postId}`,
      }, (payload) => {
        if (!mounted.current) return;
        const c = payload.new as GameComment;
        if (!c.approved) return;
        setComments((prev) => {
          if (prev.find((x) => x.id === c.id)) return prev;
          return [...prev, c];
        });
      })
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [postId]);

  // Auto-scroll to bottom when new comment arrives
  useEffect(() => {
    if (listRef.current && comments.length > 0) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = async () => {
    if (!text.trim() || loading) return;

    // Profanity check
    if (containsProfanity(text)) {
      setError(getProfanityMessage());
      return;
    }

    setError('');
    setLoading(true);
    const sessionId = getSessionId();
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const finalUsername = username || 'Анонимен';

    // Optimistic insert — show immediately
    const optimisticComment: GameComment = {
      id: `opt-${Date.now()}`,
      post_id: postId,
      username: finalUsername,
      avatar_color: avatarColor,
      content: text.trim(),
      session_id: sessionId,
      approved: true,
      flagged: false,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimisticComment]);
    const sentText = text.trim();
    setText('');
    setJustSent(true);
    setTimeout(() => setJustSent(false), 1500);

    const { data, error: dbError } = await supabase
      .from('social_game_comments')
      .insert({
        post_id: postId,
        username: finalUsername,
        avatar_color: avatarColor,
        content: sentText,
        session_id: sessionId,
        approved: true,
      })
      .select()
      .maybeSingle();

    if (!dbError && data && mounted.current) {
      // Replace optimistic with real
      setComments((prev) => prev.map((c) => c.id === optimisticComment.id ? data : c));
    } else if (dbError && mounted.current) {
      // Remove optimistic on error
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setError('Грешка при изпращане. Опитай отново.');
    }
    setLoading(false);
  };

  return (
    <div className="mt-1.5 border-t border-gray-100 pt-1.5">
      {/* Comments list */}
      {(loaded ? comments.length > 0 : initialCount > 0) && (
        <div
          ref={listRef}
          className="space-y-1.5 mb-1.5 max-h-28 overflow-y-auto pr-0.5"
          style={{ scrollBehavior: 'smooth' }}
        >
          {!loaded && initialCount > 0 && (
            <p className="text-[7px] text-gray-400 italic">{initialCount} коментара...</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-1.5">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${c.avatar_color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon name="ri-user-fill" size={6} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[7px] text-gray-700 leading-relaxed">
                  <span className="font-bold text-gray-900">{c.username}</span>
                  {' '}
                  <span>{c.content}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loaded && comments.length === 0 && (
        <p className="text-[7px] text-gray-300 italic mb-1.5">Бъди първи да коментираш...</p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1 mb-1.5 flex items-start gap-1">
          <Icon name="ri-error-warning-line" size={10} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-[7px] text-red-600 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0">
          <Icon name="ri-user-fill" size={6} className="text-white" />
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); if (error) setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Добави коментар..."
          maxLength={200}
          className={`flex-1 text-[8px] border rounded-full px-2 py-0.5 outline-none transition-colors ${error ? 'border-red-300 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-gray-300'}`}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || loading}
          className="text-[8px] font-semibold cursor-pointer whitespace-nowrap disabled:opacity-40 transition-all"
          style={{ color: justSent ? '#22c55e' : '#3b82f6' }}
        >
          {loading ? (
            <Icon name="ri-loader-4-line" size={10} className="animate-spin" />
          ) : justSent ? (
            <Icon name="ri-check-line" size={10} />
          ) : 'Изпрати'}
        </button>
      </div>
    </div>
  );
}
