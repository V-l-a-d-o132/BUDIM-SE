import LegacyIcon from '@/components/base/LegacyIcon';
import { useState, useCallback } from 'react';
import { gameCommand } from './gameApi';
import { type GamePost } from './types';
import { playLikeSound } from './useSoundEffects';

interface LikeButtonProps {
  post: GamePost;
  className?: string;
  iconSize?: string;
  showCount?: boolean;
}

export default function LikeButton({ post, className = '', iconSize = 'text-base', showCount = true }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.likes);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleLike = useCallback(async () => {
    if (loading) return;
    const newLiked = !liked;
    const delta = newLiked ? 1 : -1;
    const newCount = count + delta;

    // Optimistic update
    setLiked(newLiked);
    setCount(newCount);
    if (newLiked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
      playLikeSound();
    }

    setLoading(true);
    try {
      const data = await gameCommand('like', { post_id: post.id, liked: newLiked });
      setCount(data.likes);
      setLiked(data.liked);

    } catch {
      // Revert on error
      setLiked(!newLiked);
      setCount(count);
    } finally {
      setLoading(false);
    }
  }, [liked, count, loading, post.id]);

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`cursor-pointer flex items-center gap-0.5 disabled:opacity-70 select-none ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span
        style={{
          display: 'inline-block',
          transform: animating ? 'scale(1.4)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <LegacyIcon className={`${liked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-800'} ${iconSize}`}></LegacyIcon>
      </span>
      {showCount && count > 0 && (
        <span className="text-[7px] text-gray-500 tabular-nums">{count.toLocaleString()}</span>
      )}
    </button>
  );
}
