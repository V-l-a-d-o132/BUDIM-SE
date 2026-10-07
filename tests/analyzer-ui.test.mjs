// React component tests in a DOM emulator. No real browser, provider, CAPTCHA,
// payment or database is invoked. Production components are bundled unchanged;
// only the CAPTCHA dependency and runtime environment are isolated fixtures.
import { test as nodeTest, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { createElement, act } from 'react';
import { validatedContentAnalysis } from '../supabase/functions/_shared/content-analysis.ts';
import { demoApps } from '../src/pages/tavora-shield/components/focus/model.ts';

let dom, root, container, components, createRoot, MemoryRouter, temporary;
let requests = [], writes = [], releaseFetch;
const originalFetch = globalThis.fetch;
const project = fileURLToPath(new URL('../', import.meta.url));
const normalize = text => text.replace(/\s+/g, ' ').trim();
const test = (name, run) => nodeTest(name, { timeout: 15_000 }, run);
function button(text, scope = container) {
  const found = [...scope.querySelectorAll('button')].find(node => normalize(node.textContent) === text);
  assert.ok(found, `Expected button: ${text}`); return found;
}
const click = async node => { assert.ok(node); await act(async () => { node.click(); }); };
const mount = async Component => { await act(async () => { root.render(createElement(MemoryRouter, { initialEntries: ['/analizator'] }, createElement(Component))); }); };
const selectApp = async value => { const select = container.querySelector('select[aria-label="Избери демо приложение"]'); await act(async () => { select.value = value; select.dispatchEvent(new dom.window.Event('change', { bubbles: true })); }); };
const fillPart = async value => { for (const fieldset of container.querySelectorAll('fieldset')) await click(fieldset.querySelector(`input[value="${value}"]`)); };
const completeQuiz = async (value = '0') => { await click(button('Започни')); for (let part = 0; part < 5; part++) { await fillPart(value); await click(button(part < 4 ? 'Напред' : 'Виж резултата')); } };

before(async () => {
  // Node's BroadcastChannel would keep the DOM fixture process alive.
  globalThis.BroadcastChannel = undefined;
  dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://fixture.test/analizator' });
  for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'Event', 'MouseEvent', 'Node', 'Storage']) globalThis[key] = dom.window[key];
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.requestAnimationFrame = callback => { queueMicrotask(() => callback(0)); return 0; };
  globalThis.cancelAnimationFrame = () => {};
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  const setItem = dom.window.Storage.prototype.setItem;
  dom.window.Storage.prototype.setItem = function(key, value) { writes.push({ key, value }); return setItem.call(this, key, value); };
  globalThis.fetch = async (url, init = {}) => {
    assert.match(String(url), /^https:\/\/fixture\.supabase\.test\/functions\/v1\/tavora-content-analyzer$/);
    requests.push({ url, ...init, body: JSON.parse(init.body) });
    return new Promise(resolve => { releaseFetch = resolve; });
  };
  ({ createRoot } = await import('react-dom/client'));
  ({ MemoryRouter } = await import('react-router-dom'));
  await mkdir(path.join(project, 'node_modules/.tmp'), { recursive: true });
  temporary = await mkdtemp(path.join(project, 'node_modules/.tmp/analyzer-ui-'));
  const output = await build({
    stdin: { contents: "export { default as SelfAssessment } from './src/pages/tavora-shield/components/SelfAssessment.tsx'; export { default as Focus } from './src/pages/tavora-shield/components/GrayscaleGuide.tsx'; export { default as Analyzer } from './src/pages/tavora-shield/components/ContentAnalyzer.tsx'; export { default as Page } from './src/pages/tavora-shield/page.tsx';", resolveDir: project, loader: 'tsx' },
    bundle: true, write: false, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic',
    alias: { '@': path.join(project, 'src') }, loader: { '.css': 'empty' }, logLevel: 'silent',
    define: { 'import.meta.env': JSON.stringify({ VITE_PUBLIC_SUPABASE_URL: 'https://fixture.supabase.test', VITE_PUBLIC_SUPABASE_ANON_KEY: 'fixture-public-key' }) },
    plugins: [{ name: 'isolated-captcha-fixture', setup(build) {
      build.onResolve({ filter: /^react-google-recaptcha$/ }, () => ({ path: 'captcha', namespace: 'fixture' }));
      build.onResolve({ filter: /^react$/, namespace: 'fixture' }, () => ({ path: 'react', external: true }));
      build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: "import {forwardRef,useImperativeHandle} from 'react'; export default forwardRef(function Fixture(_,ref){useImperativeHandle(ref,()=>({executeAsync:async()=> 'fixture-token',reset(){}}),[]);return null;});", loader: 'js' }));
    } }],
  });
  const modulePath = path.join(temporary, 'components.mjs'); await writeFile(modulePath, output.outputFiles[0].text);
  components = await import(pathToFileURL(modulePath).href);
});
beforeEach(() => { requests = []; writes = []; releaseFetch = null; container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
after(async () => { globalThis.fetch = originalFetch; dom?.window.close(); if (temporary) await rm(temporary, { recursive: true, force: true }); });

test('answers select immediately, a zero is accepted, and navigation preserves existing choices', async () => {
  await mount(components.SelfAssessment); await click(button('Започни'));
  assert.equal(container.querySelectorAll('input:checked').length, 0); assert.equal(button('Напред').disabled, true);
  await click(container.querySelector('input[name="assessment-0-0"][value="0"]'));
  assert.equal(container.querySelector('input[name="assessment-0-0"][value="0"]').checked, true);
  assert.doesNotMatch(container.textContent, /Пауза за размисъл|Рефлективни паузи/);
  await fillPart('0'); assert.equal(button('Напред').disabled, false);
  await click(button('Напред')); await click(button('Назад'));
  assert.equal(container.querySelectorAll('input[value="0"]:checked').length, 7);
  assert.equal(requests.length, 0); assert.equal(writes.length, 0);
});
test('all skipped responses produce an honest empty map and can be edited or reset', async () => {
  await mount(components.SelfAssessment); await completeQuiz('skip');
  assert.match(normalize(container.textContent), /0 конкретни отговора/); assert.match(normalize(container.textContent), /35 неприложими/);
  assert.doesNotMatch(container.textContent, /Авторски индекс|Степен 5|Съзнателна свобода/);
  await click(button('Редактирай отговорите')); assert.equal(container.querySelectorAll('input[value="skip"]:checked').length, 7);
  await click(container.querySelector('input[name="assessment-4-6"][value="4"]')); await click(button('Виж резултата'));
  assert.match(normalize(container.textContent), /1 конкретен отговор/);
  await click(button('Започни наново')); await click(button('Започни')); assert.equal(container.querySelectorAll('input:checked').length, 0);
  assert.equal(requests.length, 0); assert.equal(writes.length, 0);
});
test('switching tools retains assessment progress without a submission or storage write', async () => {
  await mount(components.Page);
  await click([...container.querySelectorAll('button')].find(node => node.getAttribute('aria-controls') === 'module-assessment'));
  await click(button('Започни'));
  await click(container.querySelector('input[name="assessment-0-0"][value="4"]'));
  await click([...container.querySelectorAll('button')].find(node => node.getAttribute('aria-controls') === 'module-grayscale'));
  assert.equal(container.querySelector('#module-assessment').hidden, true);
  await click([...container.querySelectorAll('button')].find(node => node.getAttribute('aria-controls') === 'module-assessment'));
  assert.equal(container.querySelector('input[name="assessment-0-0"][value="4"]').checked, true);
  assert.equal(requests.length, 0); assert.equal(writes.length, 0);
});
test('all 12 application prototypes and their navigation render on both iOS and Android without external calls', async () => {
  await mount(components.Focus);
  for (const platform of ['iOS', 'Android']) {
    await click(button(platform));
    for (const app of demoApps) {
      await selectApp(app.id);
      assert.ok(container.querySelector(`[data-testid="app-${app.id}"]`), `${platform} / ${app.id}`);
      const navigation = container.querySelector('.demo-app-nav');
      if (navigation) for (const item of [...navigation.querySelectorAll('button')]) { await click(item); assert.ok(container.querySelector(`[data-testid="app-${app.id}"]`)); }
    }
  }
  assert.equal(requests.length, 0); assert.equal(writes.length, 0);
});
test('focus controls are independent and color changes preserve the same application and reactions', async () => {
  await mount(components.Focus); await selectApp('instagram');
  await click(container.querySelector('button[aria-label="Харесай демо публикацията"]'));
  await click(container.querySelector('button[role="switch"][aria-label="Сиви цветове"]'));
  assert.ok(container.querySelector('[data-testid="phone-screen"]').classList.contains('grayscale'));
  assert.equal(container.querySelector('button[aria-label="Премахни демо харесването"]').getAttribute('aria-pressed'), 'true');
  assert.equal(container.querySelector('button[role="switch"][aria-label="Тихи известия"]').getAttribute('aria-checked'), 'false');
  await click(container.querySelector('button[role="switch"][aria-label="Пауза на социалните приложения"]'));
  assert.ok(container.querySelector('.demo-paused'));
  await selectApp('whatsapp'); assert.ok(container.querySelector('[data-testid="app-whatsapp"]'));
  await click(container.querySelector('button[role="switch"][aria-label="Тихи известия"]'));
  await click(button('Начален екран')); assert.equal(container.querySelectorAll('.demo-badge').length, 0);
  assert.equal(container.querySelector('button[role="switch"][aria-label="Пауза на социалните приложения"]').getAttribute('aria-checked'), 'true');
  assert.equal(requests.length, 0); assert.equal(writes.length, 0);
});
test('local example dialogs support Escape and Photos switches to a valid tab between platforms', async () => {
  await mount(components.Focus); await selectApp('photos'); await click(button('Търсене'));
  await click(button('Android')); assert.ok(container.querySelector('.demo-app-nav button[aria-pressed="true"]'));
  await click(button('Създай')); assert.match(container.querySelector('.demo-app-content').textContent, /Колаж/);
  await click(button('iOS')); assert.equal(normalize(container.querySelector('.demo-app-nav button[aria-pressed="true"]').textContent), 'Библиотека');
  await click(container.querySelector('.demo-photo-grid button')); const dialog = container.querySelector('[role="dialog"]'); assert.ok(dialog);
  await act(async () => { dialog.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
  assert.equal(container.querySelector('[role="dialog"]'), null);
});
test('analysis prevents duplicate submissions, renders five checked rows, then clears a stale result on editing', async () => {
  await mount(components.Analyzer); await click(button('Убеждаващ пример'));
  const submit = button('Анализирай'); await click(submit); await click(submit); await click(submit);
  assert.equal(requests.length, 1); assert.equal(container.querySelector('textarea').disabled, true);
  const raw = { ...Object.fromEntries(['emotional_pressure','urgency_suggestion','social_pressure','polarizing_language','auto_reaction_nudge'].map(key => [key, { score: 0, description: 'Не е отчетен израз.', evidence: [] }])), overall_assessment: 'Нужен е контекст.', positive_notes: '', recommendation: 'Провери източника.', detected_patterns: [] };
  raw.urgency_suggestion = { score: 10, description: 'Възможен сигнал.', evidence: ['веднага'] };
  await act(async () => { releaseFetch(Response.json({ success: true, analysis: validatedContentAnalysis(raw, requests[0].body.text) })); });
  assert.equal(container.querySelectorAll('section').length, 5); assert.equal(container.querySelectorAll('mark').length, 1);
  assert.doesNotMatch(container.textContent, /\/100|процент риск/);
  const input = container.querySelector('textarea');
  await act(async () => { Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, 'value').set.call(input, 'Редактиран текст с нов контекст.'); input.dispatchEvent(new dom.window.Event('input', { bubbles: true })); });
  assert.equal(container.querySelectorAll('section').length, 0); assert.equal(input.value, 'Редактиран текст с нов контекст.');
});
test('an incomplete analysis is a retryable error, never an invented reassuring result', async () => {
  await mount(components.Analyzer); await click(button('Информационен пример')); await click(button('Анализирай'));
  await act(async () => { releaseFetch(Response.json({ success: true, analysis: {} })); });
  assert.match(container.querySelector('[role="alert"]').textContent, /не може да бъде проверен/);
  assert.equal(container.querySelectorAll('section').length, 0); assert.equal(button('Анализирай').disabled, false);
});

