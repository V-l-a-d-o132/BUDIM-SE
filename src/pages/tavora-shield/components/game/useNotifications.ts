import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getSessionId } from './useSessionId';
import { playNotificationSound } from './useSoundEffects';

export interface GameNotification {
  id: string;
  type: 'like' | 'comment' | 'share';
  postContent: string;
  actor: string;
  count?: number;
  timestamp: number;
}

export function useNotifications(myPostIds: string[]) {
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const mounted = useRef(true);
  const prevLikes = useRef<Record<string, number>>({});
  const prevComments = useRef<Record<string, number>>({});
  const myPostIdsRef = useRef(myPostIds);

  useEffect(() => {
    myPostIdsRef.current = myPostIds;
  }, [myPostIds]);

  const addNotification = useCallback((notif: Omit<GameNotification, 'id' | 'timestamp'>) => {
    if (!mounted.current) return;
    const newNotif: GameNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
    setUnreadCount((c) => c + 1);
    playNotificationSound();
  }, []);

  useEffect(() => {
    mounted.current = true;
    const sessionId = getSessionId();

    // Watch for likes/shares on MY posts
    const postsChannel = supabase
      .channel(`my-posts-notif-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'social_game_posts',
      }, (payload) => {
        if (!mounted.current) return;
        const updated = payload.new as { id: string; likes: number; shares: number; content: string; username: string; session_id: string };
        const old = payload.old as { likes: number; shares: number };

        // Only notify for MY posts (by session_id)
        if (!myPostIdsRef.current.includes(updated.id)) return;

        const prevL = prevLikes.current[updated.id] ?? old.likes;
        const prevS = prevComments.current[updated.id] ?? old.shares;

        if (updated.likes > prevL) {
          addNotification({
            type: 'like',
            postContent: updated.content.slice(0, 50),
            actor: 'Някой',
            count: updated.likes - prevL,
          });
        }
        if (updated.shares > prevS) {
          addNotification({
            type: 'share',
            postContent: updated.content.slice(0, 50),
            actor: 'Някой',
          });
        }

        prevLikes.current[updated.id] = updated.likes;
        prevComments.current[updated.id] = updated.shares;
      })
      .subscribe();

    // Watch for comments on MY posts
    const commentsChannel = supabase
      .channel(`my-comments-notif-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'social_game_comments',
      }, async (payload) => {
        if (!mounted.current) return;
        const comment = payload.new as { post_id: string; username: string; content: string; session_id: string; approved: boolean };

        // Don't notify for own comments
        if (comment.session_id === sessionId) return;
        if (!comment.approved) return;

        // Check if this comment is on one of my posts
        if (!myPostIdsRef.current.includes(comment.post_id)) return;

        addNotification({
          type: 'comment',
          postContent: comment.content.slice(0, 50),
          actor: comment.username || 'Анонимен',
        });
      })
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [addNotification]);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markAllRead, clearNotifications };
}
