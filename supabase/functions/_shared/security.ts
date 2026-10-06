import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

export const ALLOWED_ORIGINS = ['https://budimse.online', 'https://www.budimse.online', 'http://localhost:3000', 'http://localhost:5173'];

export function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Server configuration missing');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: serverFetch } });
}

// Preserve an upstream cancellation while bounding Auth, database and storage calls.
export function serverFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const signal = init.signal ?? (input instanceof Request ? input.signal : undefined);
  return fetch(input, { ...init, signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000) });
}

export class RequestBodyError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; this.name = 'RequestBodyError'; }
}

export function requestBodyErrorResponse(error: unknown, headers: Record<string, string>): Response | null {
  return error instanceof RequestBodyError ? Response.json({ error: error.message }, { status: error.status, headers }) : null;
}

export function rateLimitResponse(headers: Record<string, string>): Response {
  return Response.json({ error: 'Твърде много заявки. Опитай след малко.' }, {
    status: 429, headers: { ...headers, 'Retry-After': String(Math.ceil((60000 - Date.now() % 60000) / 1000)) },
  });
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin');
  return {
    ...(origin && ALLOWED_ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
  };
}

export function publicRequestError(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders(req) });
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return Response.json({ error: 'Invalid origin' }, { status: 403 });
  return null;
}

export async function readRawBody(req: Request, maxBytes = 50000, timeoutMs = 8000): Promise<string> {
  if (Number(req.headers.get('content-length') ?? 0) > maxBytes) throw new RequestBodyError('Payload too large', 413);
  const reader = req.body?.getReader();
  if (!reader) return '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new RequestBodyError('Request body timed out', 408)), timeoutMs); });
  const reading = async () => {
    let text = '', size = 0;
    const decoder = new TextDecoder('utf-8', { fatal: true });
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new RequestBodyError('Payload too large', 413);
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return text;
  };
  try { return await Promise.race([reading(), deadline]); }
  catch (error) {
    // A broken stream's cancellation callback must not postpone the response.
    void reader.cancel().catch(() => {});
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError('Invalid request body', 400);
  } finally { clearTimeout(timer); }
}

export async function readBody(req: Request, maxBytes = 50000, timeoutMs = 8000): Promise<Record<string, any>> {
  const text = await readRawBody(req, maxBytes, timeoutMs);
  let body;
  try { body = JSON.parse(text); } catch { throw new RequestBodyError('Invalid JSON', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RequestBodyError('Invalid request', 400);
  return body;
}

export async function sha256(value: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// Owner capabilities are 256-bit private random tokens, never public session IDs.
export async function ownerHash(token: unknown): Promise<string> {
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new Error('Invalid owner token');
  return sha256(token);
}

export async function rateLimit(req: Request, action: string, limit: number): Promise<boolean> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const bucket = await sha256(`${action}:${ip}:${Math.floor(Date.now() / 60000)}`);
  const { data, error } = await serviceClient().rpc('consume_rate_limit', { bucket_key: bucket, max_requests: limit });
  if (error) throw new Error('Rate limit service unavailable');
  return data === true;
}

export async function verifyRecaptcha(token: unknown): Promise<boolean> {
  const secret = Deno.env.get('RECAPTCHA_SECRET_KEY');
  if (!secret || typeof token !== 'string' || !token || token.length > 4096) return false;
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true && ['budimse.online', 'www.budimse.online', 'localhost'].includes(result.hostname);
  } catch { return false; }
}
