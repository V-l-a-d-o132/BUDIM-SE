// Checks the new build-time HTML against the actual client tree in a DOM emulator.
// No real API, browser or payment requests are made.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';
const result = await build({
  stdin: { contents: "import {hydrateRoot} from 'react-dom/client';import App from './src/App';window.__hydrationErrors=[];window.__testRoot=hydrateRoot(document.getElementById('root'),<App/>,{onRecoverableError:error=>window.__hydrationErrors.push(String(error))});", resolveDir: process.cwd(), loader: 'tsx' },
  bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', loader: { '.css': 'empty' },
  alias: { '@': path.resolve('src') }, minify: true,
  define: { __BASE_PATH__: JSON.stringify('/'), __IS_PREVIEW__: 'false', 'process.env.NODE_ENV': JSON.stringify('production'), 'import.meta.env': JSON.stringify({ VITE_PUBLIC_SUPABASE_URL: 'https://fixture.supabase.test', VITE_PUBLIC_SUPABASE_ANON_KEY: 'fixture-key' }) },
});
const routes = ['/', '/digitalna-gramotnost', '/mediyna-gramotnost-uchenici', '/obucheniya-za-uchilishta', '/center', '/resursi', '/contact', '/sources', '/step-1', '/order', '/news', '/news/proverka-na-fakti'];
for (const route of routes) {
  const html = await fs.readFile(path.join('out', route, 'index.html'), 'utf8');
  const console = new VirtualConsole();
  const errors = [];
  console.on('jsdomError', error => { if (!error.message.includes('navigation')) errors.push(String(error)); });
  const dom = new JSDOM(html, { url: 'https://budimse.online' + route, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: console });
  const heading = dom.window.document.querySelector('h1').textContent;
  dom.window.fetch = () => new Promise(() => {});
  dom.window.scrollTo = () => {};
  dom.window.eval(result.outputFiles[0].text);
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.deepEqual([...dom.window.__hydrationErrors], [], route + ': hydration recovery');
  assert.deepEqual(errors, [], route + ': DOM errors');
  assert.equal(dom.window.document.querySelector('h1').textContent, heading, route + ': heading survives hydration');
  assert.equal(dom.window.document.querySelectorAll('main').length, 1, route + ': one main after hydration');
  dom.window.__testRoot.unmount();
  dom.window.close();
}
console.log('Hydration passed for ' + routes.length + ' representative public routes.');
