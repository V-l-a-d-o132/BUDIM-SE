import { useState, useCallback } from 'react';
import { getSessionId } from './useSessionId';

const MAX_POSTS_PER_SESSION = 3;
const STORAGE_KEY = 'game_post_count';

function getStorageKey(): string {
  return `${STORAGE_KEY}_${getSessionId()}`;
}

export function usePostLimit() {
  const [postCount, setPostCount] = useState<number>(() => {
    try {
      return parseInt(sessionStorage.getItem(getStorageKey()) || '0', 10);
    } catch {
      return 0;
    }
  });

  const canPost = postCount < MAX_POSTS_PER_SESSION;
  const remaining = Math.max(0, MAX_POSTS_PER_SESSION - postCount);

  const incrementCount = useCallback(() => {
    setPostCount((prev) => {
      const next = prev + 1;
      try {
        sessionStorage.setItem(getStorageKey(), String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { postCount, canPost, remaining, incrementCount, max: MAX_POSTS_PER_SESSION };
}
