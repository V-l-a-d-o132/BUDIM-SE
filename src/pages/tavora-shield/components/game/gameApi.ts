import { supabase } from '@/lib/supabase';

let memoryToken: string | null = null;
export function getOwnerToken(): string {
  if (memoryToken) return memoryToken;
  try {
    const stored = sessionStorage.getItem('game_owner_token');
    if (stored && /^[a-f0-9]{64}$/.test(stored)) return memoryToken = stored;
  } catch { /* Keep the private capability in memory when storage is unavailable. */ }
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  memoryToken = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  try { sessionStorage.setItem('game_owner_token', memoryToken); } catch { /* memory fallback */ }
  return memoryToken;
}

export async function gameCommand(action: string, details: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke('social-game', {
    body: { ...details, action, owner_token: getOwnerToken() },
  });
  if (error || data?.error) throw new Error(data?.error || 'Операцията не беше изпълнена. Опитайте отново.');
  return data;
}
