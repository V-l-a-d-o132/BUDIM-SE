import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { type GameComment } from './types';
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_SITE_KEY } from '@/components/base/RecaptchaBadge';
import { gameCommand } from './gameApi';
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
  const recaptchaRef = useRef<ReCAPTCHA>(null);

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
    try {
      const token = await recaptchaRef.current?.executeAsync();
      if (!token) throw new Error('Проверката за бот не е успешна. Опитайте отново.');
      await gameCommand('comment', { post_id: postId, content: text.trim(), username: username || 'Анонимен', recaptcha_token: token });
      if (mounted.current) {
        setText(''); setJustSent(true);
        setTimeout(() => { if (mounted.current) setJustSent(false); }, 3000);
      }
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : 'Грешка при изпращане.');
    } finally { recaptchaRef.current?.reset(); }

    setLoading(false);
  };

  return (
    <div className="mt-1.5 border-t border-gray-100 pt-1.5"><ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} size="invisible" />{justSent && <p role="status" className="text-xs text-gray-600">Коментарът е записан и очаква модерация.</p>}
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
