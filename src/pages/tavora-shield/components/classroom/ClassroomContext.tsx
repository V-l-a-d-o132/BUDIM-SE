import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { clearLabToken, createLabToken, emptyLabState, existingLabToken, labAllowed, labRequest, labSyncPayload,
  retainMediaUrls, type LabScope, type LabState } from '@/lib/classroom';

export interface Classroom {
  state: LabState; loading: boolean; error: string;
  allowed: (scope: LabScope) => boolean;
  join: (code: string, alias: string) => Promise<void>;
  command: (action: string, payload?: Record<string, unknown>) => Promise<void>;
  refresh: () => Promise<void>; leave: () => void;
}
const Context = createContext<Classroom | null>(null);
export const useClassroom = () => useContext(Context);

export function ClassroomProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LabState>(emptyLabState);
  const stateRef=useRef(state);
  const [loading, setLoading] = useState(Boolean(existingLabToken()));
  const [error, setError] = useState('');
  const mounted = useRef(true);
  const generation = useRef(0);
  const reading = useRef(false);
  const writes = useRef(0);
  const refresh = useCallback(async () => {
    const token = existingLabToken();
    if (!token || reading.current || writes.current > 0) return;
    reading.current = true;
    const current = ++generation.current;
    try {
      const previous=stateRef.current;
      const result = await labRequest('state', labSyncPayload(previous), token,previous);
      if (mounted.current && current === generation.current) { stateRef.current=retainMediaUrls(previous,result);setState(stateRef.current);setError(''); }
    } catch (err) {
      if (mounted.current && current === generation.current) setError(err instanceof Error ? err.message : 'Връзката се прекъсна.');
    } finally {
      reading.current = false;
      if (mounted.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState !== 'hidden') void refresh(); }, 8000+Math.floor(Math.random()*2000));
    const focus = () => { void refresh(); };
    window.addEventListener('focus', focus);
    return () => { mounted.current = false; generation.current++; window.clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [refresh]);
  const command = useCallback(async (action: string, payload: Record<string, unknown> = {}) => {
    const current = ++generation.current;
    writes.current++;
    try {
      const result = await labRequest(action, payload);
      if (mounted.current && current === generation.current) { stateRef.current=retainMediaUrls(stateRef.current,result);setState(stateRef.current);setError(''); }
    } catch (err) {
      if (mounted.current && current === generation.current) setError(err instanceof Error ? err.message : 'Действието не е записано.');
      throw err;
    } finally {
      writes.current--;
      if (writes.current === 0) void refresh();
    }
  }, [refresh]);
  const join = async (code: string, alias: string) => {
    const current = ++generation.current;
    writes.current++;
    setLoading(true);
    try {
      const result = await labRequest('join', { code: code.trim().toUpperCase(), alias: alias.trim() }, createLabToken());
      if (mounted.current && current === generation.current) { stateRef.current=result;setState(result);setError(''); }
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : 'Заявката не е изпратена.');
      throw err;
    } finally { writes.current--;if (mounted.current) setLoading(false); }
  };
  const leave = () => { generation.current++; clearLabToken(); stateRef.current=emptyLabState;setState(emptyLabState); setError(''); setLoading(false); };
  return <Context.Provider value={{ state, loading, error, allowed: scope => !loading && !error && labAllowed(state, scope), join, command, refresh, leave }}>{children}</Context.Provider>;
}
