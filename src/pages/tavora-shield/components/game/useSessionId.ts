import { useRef } from 'react';

let _sessionId: string | null = null;

export function getSessionId(): string {
  if (!_sessionId) {
    const stored = sessionStorage.getItem('game_session_id');
    if (stored) {
      _sessionId = stored;
    } else {
      _sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem('game_session_id', _sessionId);
    }
  }
  return _sessionId;
}

export function useSessionId() {
  const ref = useRef<string>(getSessionId());
  return ref.current;
}
