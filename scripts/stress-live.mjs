// Bounded, read-only production probes. No valid form submission or payment is made.
import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { performance } from 'node:perf_hooks';

const phase = process.argv[2] ?? 'after';
if (!['before', 'after', 'limits'].includes(phase)) throw new Error('Choose before, after or limits');
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8')
  .split('\n').filter(line => line && !line.startsWith('#') && line.includes('='))
  .map(line => { const at = line.indexOf('='); return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
const base = env.VITE_PUBLIC_SUPABASE_URL;
if (base !== 'https://plcmsgbsetpqwjkfmjzk.supabase.co') throw new Error('Unexpected project');
const key = env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const token = randomBytes(32).toString('hex');
const answers = Object.fromEntries(Array.from({ length: 35 }, (_, i) => [`${Math.floor(i / 7)}-${i % 7}`, 0]));
const api = (name, body, accepted = [200], extra = {}) => ({ name, url: `${base}/functions/v1/${name}`, method: 'POST', body: JSON.stringify(body), accepted, headers: extra });
const cases = [
  { name: 'book-store', url: `${base}/functions/v1/book-store`, accepted: [200] },
  api('social-game', { action: 'history', owner_token: token }),
  api('get-book-order', { order_id: 'a14e1a35-3cc3-46cc-93f4-eab9e725a91f', order_token: token }, [404]),
  api('admin-book-orders', { action: 'list', mode: 'test' }, [401]),
  api('tavora-content-analyzer', { text: 'short' }, [400]),
  api('tavora-shield-submit', { answers: {} }, [400]),
];
let nextStart = 0;
let serverErrors = 0;
const samples = [];
const pauses = ms => new Promise(resolve => setTimeout(resolve, ms));
async function probe(c, group, concurrency) {
  if (serverErrors >= 3) throw new Error('Stopped after three unexpected server failures');
  const now = Date.now();
  const slot = Math.max(now, nextStart); nextStart = slot + 125; // at most 8 starts/sec
  if (slot > now) await pauses(slot - now);
  const start = performance.now();
  const headers = { ...((c.url.startsWith(base)) ? { apikey: key, Origin: 'https://budimse.online' } : {}),
    ...(c.method === 'POST' ? { 'Content-Type': 'application/json' } : {}), ...c.headers };
  let status = 0; let error; let size = 0; let json;
  try {
    const res = await fetch(c.url, { method: c.method ?? 'GET', headers, body: c.body, signal: AbortSignal.timeout(15000) });
    status = res.status;
    if (status === 429) {
      const retry = Number(res.headers.get('Retry-After'));
      if (!Number.isInteger(retry) || retry < 1 || retry > 60) throw new Error('Invalid Retry-After');
    }
    const reader = res.body.getReader(); const parts = [];
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 100000) { await reader.cancel(); throw new Error('Response exceeded probe limit'); }
      parts.push(Buffer.from(value));
    }
    const content = Buffer.concat(parts).toString('utf8');
    if (/verify you are human|unusual traffic|checking your browser/i.test(content)) throw new Error('Site requested human verification');
    if (c.url.startsWith(base)) {
      try { json = JSON.parse(content); } catch { if (res.status !== 204) throw new Error('Non-JSON API response'); }
      if (c.name === 'social-game' && res.status === 200 && (!Array.isArray(json.posts) || json.posts.length)) throw new Error('Foreign owner data returned');
      if (c.name === 'get-book-order' && res.status !== 404 && res.status !== 429) throw new Error('Order isolation failed');
      if (c.name === 'admin-book-orders' && res.status === 200) throw new Error('Administrator access was granted');
      if (c.name.startsWith('private:') && res.status === 200 && (!Array.isArray(json) || json.length)) throw new Error('Private rows returned');
    }
    if (!c.accepted.includes(status)) throw new Error(`Expected ${c.accepted.join('/')} but received ${status}`);
  } catch (e) { error = e.name === 'TimeoutError' ? 'Timeout' : e.message; }
  if (status >= 500 || status === 0) serverErrors++;
  const sample = { group, concurrency, name: c.name, status, ms: Math.round(performance.now() - start), bytes: size, ok: !error, ...(error ? { error } : {}) };
  samples.push(sample); return sample;
}
async function batch(list, group, concurrency) {
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < list.length) { const c = list[cursor++]; await probe(c, group, concurrency); }
  }));
}
const started = new Date().toISOString();
let fatal;
try {
  for (const concurrency of phase === 'limits' ? [] : [2, 4, 8]) {
    await batch(Array.from({ length: 12 }, (_, i) => ({ name: ['/', '/order', '/privacy'][i % 3], url: 'https://budimse.online' + ['/', '/order', '/privacy'][i % 3], accepted: [200] })), 'website', concurrency);
    await batch(Array.from({ length: 12 }, (_, i) => cases[i % cases.length]), 'api', concurrency);
  }
  const guardCases = [
    api('tavora-content-analyzer', { text: 'Synthetic educational test excerpt.' }, [403]),
    api('tavora-shield-submit', { answers }, [403]),
    api('create-book-checkout', { format: 'physical', quantity: 0 }, [400]),
    api('social-game', { action: 'history', owner_token: token }, [403], { Origin: 'https://foreign.example' }),
    ...['gemini-content-analyzer-v2', 'tavora-shield-content-analyzer', 'tavora-biometric-log', 'tavora-literacy-log'].map(n => api(n, {}, [410], { Authorization: `Bearer ${key}` })),
    ...['book_orders', 'contact_submissions', 'tavora_shield_results', 'admin_users'].map(n => ({ name: `private:${n}`, url: `${base}/rest/v1/${n}?select=*&limit=1`, accepted: [200, 401, 403], headers: { Authorization: `Bearer ${key}` } })),
    { ...api('submit-partnership', {}, [400, 413, 429]), body: '{' },
    { ...api('analyze-viral-post', {}, [400, 413, 429]), body: '{' },
    api('submit-partnership', { text: 'x'.repeat(10000) }, [413, 429]),
    api('tavora-content-analyzer', { text: 'x'.repeat(16000) }, [413, 429]),
    api('book-payment-webhook?mode=test', {}, [400], { 'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${'0'.repeat(64)}` }),
  ];
  if (phase !== 'limits') await batch(guardCases, 'security', 2);
  else {
    await batch(Array.from({ length: 14 }, () => ({ ...api('submit-partnership', {}, [400, 429]), body: '{' })), 'limiter', 4);
    if (!samples.some(s => s.status === 429)) throw new Error('Burst did not exercise the request limit');
  }
} catch (e) { fatal = e.message; }
const percentile = (values, p) => values.length ? values.sort((a, b) => a - b)[Math.ceil(p * values.length) - 1] : 0;
const groups = [];
for (const group of ['website', 'api', 'security', 'limiter']) for (const concurrency of [2, 4, 8]) {
  const rows = samples.filter(s => s.group === group && s.concurrency === concurrency);
  if (!rows.length) continue;
  groups.push({ group, concurrency, requests: rows.length, failures: rows.filter(s => !s.ok).length,
    p50_ms: percentile(rows.map(s => s.ms), .5), p95_ms: percentile(rows.map(s => s.ms), .95), max_ms: Math.max(...rows.map(s => s.ms)),
    statuses: Object.fromEntries([...new Set(rows.map(s => s.status))].map(status => [status, rows.filter(s => s.status === status).length])) });
}
const result = { phase, started, finished: new Date().toISOString(), safety: { max_concurrency: 8, max_starts_per_second: 8, timeout_ms: 15000, provider_calls: 0, successful_form_writes: 0, payment_creations: 0 }, groups, failures: samples.filter(s => !s.ok), ...(fatal ? { fatal } : {}) };
writeFileSync(new URL(`../../stress-${phase}.json`, import.meta.url), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (result.failures.length || fatal) process.exitCode = 1;
