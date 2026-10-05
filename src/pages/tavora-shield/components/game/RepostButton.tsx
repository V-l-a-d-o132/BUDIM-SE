import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GamePost, AVATAR_COLORS } from './types';
import { getSessionId } from './useSessionId';
import { usePostLimit } from './usePostLimit';

interface RepostButtonProps {
  post: GamePost;
  targetPlatform: GamePost['platform'];
  onReposted: (newPost: GamePost) => void;
  iconSize?: string;
}

export default function RepostButton({ post, targetPlatform, onReposted, iconSize = 'text-base' }: RepostButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { canPost, remaining, incrementCount } = usePostLimit();

  const handleRepost = async () => {
    if (loading || done || !canPost) return;
    setLoading(true);

    try {
      const sessionId = getSessionId();
      const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

      const { data, error } = await supabase
        .from('social_game_posts')
        .insert({
          platform: targetPlatform,
          content: `🔁 Споделено: "${post.content.slice(0, 120)}${post.content.length > 120 ? '...' : ''}"`,
          username: 'Ти (repost)',
          avatar_color: avatarColor,
          likes: Math.floor(post.likes * 0.3),
          comments: Math.floor(post.comments * 0.2),
          shares: 0,
          is_viral: false,
          viral_score: Math.max(5, post.viral_score - 20),
          ai_label: 'Споделено съдържание',
          ai_reason: 'Споделеното съдържание получава по-малко engagement от оригинала.',
          approved: true,
          session_id: sessionId,
        })
        .select()
        .maybeSingle();

      if (!error && data) {
        onReposted(data as GamePost);
        incrementCount();
        setDone(true);
        // Update shares count on original post
        await supabase
          .from('social_game_posts')
          .update({ shares: post.shares + 1 })
          .eq('id', post.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!canPost && !done) {
    return (
      <button
        disabled
        title="Достигна лимита от 3 поста"
        className="cursor-not-allowed opacity-40 flex items-center gap-0.5"
      >
        <i className={`ri-repeat-line text-gray-400 ${iconSize}`}></i>
      </button>
    );
  }

  return (
    <button
      onClick={handleRepost}
      disabled={loading || done}
      title={done ? 'Споделено на стената ти!' : `Сподели на стената си (${remaining} оставащи)`}
      className="cursor-pointer flex items-center gap-0.5 disabled:opacity-60 transition-all"
    >
      {loading ? (
        <i className={`ri-loader-4-line animate-spin text-gray-500 ${iconSize}`}></i>
      ) : done ? (
        <i className={`ri-repeat-fill text-green-500 ${iconSize}`}></i>
      ) : (
        <i className={`ri-repeat-line text-gray-800 ${iconSize}`}></i>
      )}
    </button>
  );
}
