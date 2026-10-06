import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks, createRequire } from 'node:module';
const require = createRequire(import.meta.url);
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('npm:')) return next(require.resolve(specifier.slice(4).replace(/@\d[^/]*$/, '')), context);
  return next(specifier, context);
} });
const { readBody, readRawBody, RequestBodyError, serverFetch } = await import('../supabase/functions/_shared/security.ts');
const request = body => new Request('https://fixture.test', { method: 'POST', body, duplex: 'half' });

test('body limits use actual UTF-8 bytes and reject chunked input above the cap', async () => {
  const encoded = new TextEncoder().encode(JSON.stringify({ text: 'Български' }));
  assert.deepEqual(await readBody(request(encoded), encoded.length), { text: 'Български' });
  const stream = new ReadableStream({ start(controller) {
    controller.enqueue(encoded.slice(0, 5)); controller.enqueue(encoded.slice(5)); controller.close();
  } });
  await assert.rejects(readBody(request(stream), encoded.length - 1), error => error instanceof RequestBodyError && error.status === 413);
});

test('malformed JSON and non-object bodies have a client error without quoting the input', async () => {
  for (const value of ['{PRIVATE_INPUT', '[]', 'null', '42']) {
    await assert.rejects(readBody(request(value)), error => error.status === 400 && !error.message.includes('PRIVATE_INPUT'));
  }
});

test('invalid UTF-8 cannot silently replace signed webhook bytes', async () => {
  await assert.rejects(readRawBody(request(new Uint8Array([0xc3, 0x28]))), error => error.status === 400);
});

test('a stalled stream returns on its deadline even if cancellation never resolves', async () => {
  let cancelled = false;
  const stream = new ReadableStream({ cancel() { cancelled = true; return new Promise(() => {}); } });
  const start = Date.now();
  await assert.rejects(readBody(request(stream), 100, 25), error => error.status === 408);
  assert.equal(cancelled, true); assert.ok(Date.now() - start < 500);
});

test('raw webhook reading preserves exact multibyte content across chunk boundaries', async () => {
  const input = '{"text":"Пример 🌍"}'; const bytes = new TextEncoder().encode(input);
  const stream = new ReadableStream({ start(controller) { for (const byte of bytes) controller.enqueue(new Uint8Array([byte])); controller.close(); } });
  assert.equal(await readRawBody(request(stream)), input);
});

test('outbound requests retain caller cancellation instead of replacing it', async () => {
  const original = globalThis.fetch; const controller = new AbortController(); controller.abort(new Error('cancelled'));
  let observed;
  globalThis.fetch = async (_input, init) => { observed = init.signal; throw init.signal.reason; };
  try { await assert.rejects(serverFetch('https://fixture.test', { signal: controller.signal }), /cancelled/); assert.equal(observed.aborted, true); }
  finally { globalThis.fetch = original; }
});
