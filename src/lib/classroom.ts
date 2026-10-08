import { supabase } from './supabase';

export type LabApp = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'x' | 'snapchat' | 'whatsapp' | 'gmail';
export type LabScope = 'simulators' | 'analyzer';
export type PostKind = 'post' | 'story' | 'clip' | 'listing';
export interface LabRoom {
  id: string; name: string; code?: string; status: 'open' | 'paused' | 'closed';
  expires_at: string; sort_mode: 'chronological' | 'reactions';
  simulators_enabled: boolean; analyzer_enabled: boolean;
  moderate_posts: boolean; moderate_comments: boolean;
}
export interface LabAccess {
  member_id: string; alias: string; status: 'pending' | 'approved' | 'revoked';
  simulators: boolean; analyzer: boolean; room: LabRoom;
}
export interface LabMember { id: string; alias: string }
export interface LabMedia { id: string; mime_type: string; url?: string; path?: string; url_expires_at?: number }
export interface LabPost {
  id: string; member_id: string; alias: string; app_id: LabApp; kind: PostKind;
  content: string; created_at: string; approved: boolean; media: LabMedia | null;
  likes: number; comments: number; shares: number; views: number;
  reaction: string | null; saved: boolean; shared: boolean;
}
export interface LabComment {
  id: string; post_id: string; member_id: string; alias: string;
  content: string; approved: boolean; created_at: string;
}
export interface LabMessage {
  id: string; app_id: LabApp; member_id: string; recipient_id: string | null;
  alias: string; content: string; subject: string; created_at: string;
}
export interface LabNotification {
  id: string; app_id: LabApp; content: string; created_at: string; read: boolean;
}
export interface LabState {
  revision?: string;
  access: LabAccess | null; participants: LabMember[]; posts: LabPost[];
  comments: LabComment[]; follows: string[]; messages: LabMessage[]; notifications: LabNotification[];
  app_follows?: {app_id:LabApp;target_id:string}[];
}
export const emptyLabState: LabState = {
  access: null, participants: [], posts: [], comments: [], follows: [], messages: [], notifications: [],
};
export function labSyncPayload(state: LabState, now = Date.now()): Record<string, unknown> {
  // Time can change a snapshot even when nobody posts: renew signed media and
  // remove expired stories through a full, authorized server read.
  const expired = state.posts.some(post =>
    (post.media && (!post.media.url || (post.media.url_expires_at ?? 0) <= now + 30000))
    || (post.kind === 'story' && Date.parse(post.created_at) + 86400000 <= now));
  return state.revision && !expired ? { revision: state.revision } : {};
}
export function retainMediaUrls(previous: LabState, next: LabState): LabState {
  const known = new Map(previous.posts.filter(post => post.media).map(post => [post.media!.id, post.media!]));
  for (const post of next.posts) {
    if (!post.media) continue;
    const old = known.get(post.media.id);
    if (old?.url && old.url_expires_at && old.url_expires_at > Date.now() + 30000) {
      post.media.url=old.url; post.media.url_expires_at=old.url_expires_at;
    }
  }
  return next;
}
const tokenKey = 'budimse_classroom_capability_v1';
let memoryToken = '';
export function existingLabToken(): string {
  if (memoryToken) return memoryToken;
  try {
    const value = window.sessionStorage.getItem(tokenKey);
    if (value && /^[a-f0-9]{64}$/.test(value)) memoryToken = value;
  } catch { /* The current tab still works without storage. */ }
  return memoryToken;
}
export function createLabToken(): string {
  if (!existingLabToken()) {
    memoryToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, '0')).join('');
    try { window.sessionStorage.setItem(tokenKey, memoryToken); } catch { /* Keep the capability in memory. */ }
  }
  return memoryToken;
}
export function clearLabToken() {
  memoryToken = '';
  try { window.sessionStorage.removeItem(tokenKey); } catch { /* Storage may be disabled. */ }
}
export function labAllowed(state: LabState, scope: LabScope): boolean {
  const access = state.access;
  return Boolean(access && access.status === 'approved' && access[scope]
    && access.room.status === 'open' && Date.parse(access.room.expires_at) > Date.now()
    && access.room[scope === 'simulators' ? 'simulators_enabled' : 'analyzer_enabled']);
}
export async function labRequest(action: string, payload: Record<string, unknown> = {}, token = existingLabToken(), previous?:LabState): Promise<LabState> {
  const { data, error } = await supabase.functions.invoke('classroom', { body: { action, ...payload, access_token: token } });
  if (error) {
    const context = (error as { context?: Response }).context;
    if (context instanceof Response) {
      const result = await context.json().catch(() => null);
      if (typeof result?.error === 'string' && result.error.length < 500) throw new Error(result.error);
    }
    throw new Error('Връзката със заниманието се прекъсна. Опитай отново.');
  }
  if(data?.success===true&&data.state?.unchanged===true&&previous?.revision&&data.state.revision===previous.revision){
    return {...previous,access:data.state.access,revision:data.state.revision};
  }
  if (data?.success !== true || !data.state || !Array.isArray(data.state.posts)) throw new Error('Заниманието временно не може да бъде заредено.');
  return data.state;
}
export const mediaTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
export async function uploadLabMedia(file: File): Promise<string> {
  if (!mediaTypes.includes(file.type) || file.size > 12 * 1024 * 1024 || file.size < 1) {
    throw new Error('Избери JPG, PNG, WebP, MP4 или WebM файл до 12 MB.');
  }
  const { data, error } = await supabase.functions.invoke('classroom', {
    body: { action: 'prepare_upload', access_token: existingLabToken(), mime_type: file.type, size: file.size },
  });
  if (error || !data?.upload?.token || !data.upload.path || !data.upload.media_id) throw new Error('Качването не можа да започне. Опитай отново.');
  const uploaded = await supabase.storage.from('classroom-media').uploadToSignedUrl(
    data.upload.path, data.upload.token, file, { contentType: file.type },
  );
  if (uploaded.error) throw new Error('Файлът не е качен. Опитай отново.');
  return data.upload.media_id;
}
export function orderedPosts(posts: LabPost[], mode: LabRoom['sort_mode']): LabPost[] {
  return [...posts].sort((a, b) => {
    const difference = mode === 'reactions'
      ? (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares) : 0;
    return difference || Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id);
  });
}
