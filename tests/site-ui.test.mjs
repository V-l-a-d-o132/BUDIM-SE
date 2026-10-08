// DOM integration checks. Network and database responses are isolated fixtures.
import { before, after, beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { createElement as h, act } from 'react';

let dom, root, container, components, createRoot, MemoryRouter, Routes, Route, temporary;
const originalFetch = globalThis.fetch;
let requests, respond;
const flush = async () => { await act(async () => {}); };
const click = async node => { assert.ok(node); await act(async () => node.click()); };
const button = text => [...container.querySelectorAll('button')].find(node => node.textContent === text || node.getAttribute('aria-label') === text);
const submit = async () => { await act(async () => { container.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); }); };
async function mount(Component, route = '/') {
  await act(async () => root.render(h(MemoryRouter, { initialEntries: [route] }, h(Routes, null, h(Route, { path: '*', element: h(Component) })))));
}

before(async () => {
  dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://fixture.test/' });
  for (const key of ['window','document','HTMLElement','Event','KeyboardEvent','PointerEvent','Node','FormData']) globalThis[key] = dom.window[key];
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  ({ createRoot } = await import('react-dom/client'));
  ({ MemoryRouter, Routes, Route } = await import('react-router-dom'));
  temporary = await mkdtemp(path.resolve('node_modules/.tmp/site-ui-'));
  const result = await build({
    stdin: { contents: "export {default as Navbar} from './src/components/feature/Navbar'; export {default as Form} from './src/components/feature/PartnershipForm'; export {NewsListPage as List, NewsDetailPage as Detail} from './src/pages/news/page';", resolveDir: process.cwd(), loader: 'tsx' },
    bundle: true, write: false, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic',
    alias: { '@': path.resolve('src') },
    define: { 'import.meta.env': JSON.stringify({ VITE_PUBLIC_SUPABASE_URL: 'https://fixture.supabase.test', VITE_PUBLIC_SUPABASE_ANON_KEY: 'fixture-key' }) },
    plugins: [{ name: 'news-fixture', setup(build) {
      build.onResolve({ filter: /^@\/lib\/supabase$/ }, () => ({ path: 'news', namespace: 'fixture' }));
      build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const fetchNewsListCached=()=>globalThis.siteNewsList();export const fetchNewsDetailCached=()=>globalThis.siteNewsDetail();' }));
    } }],
  });
  const file = path.join(temporary, 'components.mjs'); await writeFile(file, result.outputFiles[0].text);
  components = await import(pathToFileURL(file).href);
});
beforeEach(() => {
  requests = [];
  globalThis.fetch = async (url, init) => { requests.push({ url, ...init }); return new Promise(resolve => { respond = resolve; }); };
  globalThis.siteNewsList = async () => [];
  globalThis.siteNewsDetail = async () => null;
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); document.getElementById('news-snapshot')?.remove(); });
after(async () => { globalThis.fetch = originalFetch; dom.window.close(); await rm(temporary, { recursive: true, force: true }); });

test('mobile navigation opens, Escape restores focus, and selecting a route closes it', async () => {
  await mount(components.Navbar);
  const toggle = button('Отвори менюто');
  assert.equal(document.getElementById('mobile-navigation').hidden, true);
  await click(toggle);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  await act(async () => document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  assert.equal(document.activeElement, toggle);
  assert.equal(document.getElementById('mobile-navigation').hidden, true);
  await click(toggle);
  await click(document.querySelector('#mobile-navigation a[href="/obucheniya-za-uchilishta"]'));
  assert.equal(document.getElementById('mobile-navigation').hidden, true);
});

test('contact form sends once while pending and clears only after confirmed success', async () => {
  await mount(components.Form);
  container.querySelector('[name=organization]').value = 'Тестово училище';
  container.querySelector('[name=email]').value = 'teacher@example.invalid';
  container.querySelector('[name=message]').value = 'Урок за проверка на информация.';
  await submit(); await submit();
  assert.equal(requests.length, 1);
  assert.equal(button('Изпращане…').disabled, true);
  assert.equal(JSON.parse(requests[0].body).type, 'school');
  await act(async () => respond(new Response(JSON.stringify({ success: true }), { status: 200 })));
  assert.match(container.textContent, /Получихме запитването/);
  assert.equal(container.querySelector('[name=message]').value, '');
});

test('failed contact request keeps the draft and allows another attempt', async () => {
  await mount(components.Form);
  container.querySelector('[name=message]').value = 'Запази този текст.';
  await submit();
  await act(async () => respond(new Response('{}', { status: 503 })));
  assert.equal(container.querySelector('[name=message]').value, 'Запази този текст.');
  assert.match(container.textContent, /Не успяхме да потвърдим/);
  assert.equal(button('Изпрати запитването').disabled, false);
});

test('unmount cancels an in-flight contact request', async () => {
  await mount(components.Form); await submit();
  const signal = requests[0].signal;
  await act(async () => root.render(null));
  assert.equal(signal.aborted, true);
  await act(async () => respond(new Response('{}', { status: 503 })));
});

test('an empty publication list stays empty instead of reviving fallback articles', async () => {
  await mount(components.List); await flush();
  assert.match(container.textContent, /Все още няма публикувани материали/);
  assert.equal(container.querySelectorAll('article').length, 0);
});

test('failed news requests expose retry and recover without invented content', async () => {
  globalThis.siteNewsList = async () => { throw new Error('offline'); };
  await mount(components.List); await flush();
  assert.match(container.textContent, /временно не могат да бъдат заредени/);
  globalThis.siteNewsList = async () => [];
  await click(button('Опитай отново')); await flush();
  assert.match(container.textContent, /Все още няма публикувани материали/);
});

test('an unpublished article is not restored from the old mock catalogue', async () => {
  await act(async () => root.render(h(MemoryRouter, { initialEntries: ['/news/email-apnea'] }, h(Routes, null, h(Route, { path: '/news/:slug', element: h(components.Detail) })))));
  await flush();
  assert.match(container.textContent, /Този материал не е наличен/);
  assert.match(document.querySelector('meta[name=robots]').content, /noindex/);
});

test('article HTML is sanitized while useful source links and headings remain', async () => {
  globalThis.siteNewsDetail = async () => ({ id: 'fixture', slug: 'example', title: 'Пример', body: '## Проверка\nТекст <script>alert(1)</script><a href="javascript:alert(1)">опасен линк</a> <a href="https://example.org/source">Източник</a>', created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-08T00:00:00Z', image_url: null });
  await act(async () => root.render(h(MemoryRouter, { initialEntries: ['/news/example'] }, h(Routes, null, h(Route, { path: '/news/:slug', element: h(components.Detail) })))));
  await flush();
  assert.equal(container.querySelector('article script'), null);
  assert.equal(container.querySelector('a[href^="javascript:"]'), null);
  assert.equal(container.querySelector('article h2').textContent, 'Проверка');
  assert.ok(container.querySelector('article a[href="https://example.org/source"]'));
  const schema = JSON.parse(document.getElementById('page-schema-jsonld').textContent);
  assert.equal(schema.dateModified, '2026-10-08T00:00:00Z');
});

const snapshotArticle = { id: 'snapshot-fixture', slug: 'snapshot-example', title: 'Публикуван материал', body: 'Проверен текст с <strong>контекст</strong>.', image_url: null, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-08T00:00:00Z', published: true };
function addSnapshot(route, items) {
  const script = document.createElement('script'); script.id = 'news-snapshot'; script.type = 'application/json';
  script.textContent = JSON.stringify({ route, items }); document.body.append(script);
}
async function mountSnapshotDetail() {
  await act(async () => root.render(h(MemoryRouter, { initialEntries: ['/news/snapshot-example'] }, h(Routes, null, h(Route, { path: '/news/:slug', element: h(components.Detail) })))));
}

test('a prerendered article stays readable while its public API refresh is pending or unavailable', async () => {
  addSnapshot('/news/snapshot-example', [snapshotArticle]);
  let reject;
  globalThis.siteNewsDetail = () => new Promise((_, fail) => { reject = fail; });
  await mountSnapshotDetail();
  assert.equal(container.querySelector('h1').textContent, snapshotArticle.title);
  assert.equal(container.querySelector('article strong').textContent, 'контекст');
  await act(async () => reject(new Error('offline')));
  assert.equal(container.querySelector('h1').textContent, snapshotArticle.title);
  assert.match(container.textContent, /Не успяхме да проверим за обновяване/);
});

test('a confirmed withdrawal removes a prerendered article and marks its page noindex', async () => {
  addSnapshot('/news/snapshot-example', [snapshotArticle]);
  globalThis.siteNewsDetail = async () => null;
  await mountSnapshotDetail(); await flush();
  assert.match(container.textContent, /Този материал не е наличен/);
  assert.equal(container.querySelector('article'), null);
  assert.match(document.querySelector('meta[name=robots]').content, /noindex/);
  assert.equal(document.querySelector('meta[property="article:published_time"]'), null);
});

test('an authoritative empty list replaces the build snapshot rather than reviving old publications', async () => {
  addSnapshot('/news', [snapshotArticle]);
  globalThis.siteNewsList = async () => [];
  await mount(components.List, '/news'); await flush();
  assert.match(container.textContent, /Все още няма публикувани материали/);
  assert.equal(container.querySelectorAll('article').length, 0);
});
