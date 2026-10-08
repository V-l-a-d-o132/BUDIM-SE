import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const template = await fs.readFile('out/index.html', 'utf8');
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { render, publicPages } = await server.ssrLoadModule('/scripts/render.tsx');
  for (const route of [...publicPages, '/404']) {
    const { html, seo } = await render(route);
    const head = '<title>' + escape(seo.title) + '</title>\n'
      + Object.entries(seo.meta).map(([name, value]) => '<meta ' + (name.startsWith('og:') ? 'property' : 'name') + '="' + name + '" content="' + escape(value) + '" />').join('\n')
      + '\n<link rel="canonical" href="' + escape(seo.url) + '" />\n'
      + Object.entries(seo.schemas).map(([id, value]) => '<script type="application/ld+json" id="' + id + '">' + JSON.stringify(value).replace(/</g, '\\u003c') + '</script>').join('\n');
    const output = template.replace(/<!--page-meta:start-->[\s\S]*?<!--page-meta:end-->/, '<!--page-meta:start-->' + head + '<!--page-meta:end-->')
      .replace('<div id="root"></div>', '<div id="root">' + html + '</div>');
    const document = new JSDOM(output).window.document;
    assert.equal(document.querySelectorAll('h1').length, 1, route + ': one page heading');
    assert.equal(document.querySelectorAll('main').length, 1, route + ': one main landmark');
    assert.ok(document.getElementById('main-content'), route + ': working skip link');
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1, route + ': one canonical');
    assert.equal(document.querySelector('link[rel="canonical"]').href, seo.url, route + ': matching canonical');
    assert.equal(document.querySelectorAll('title').length, 1, route + ': one title');
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
    assert.equal(new Set(ids).size, ids.length, route + ': unique element ids');
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(script.textContent);
    for (const link of document.querySelectorAll('a[href]')) {
      const target = new URL(link.getAttribute('href'), 'https://budimse.online' + route);
      if (target.origin === 'https://budimse.online') assert.ok(publicPages.includes(target.pathname) || target.pathname.startsWith('/news/') || (target.pathname === route && target.hash), route + ': unknown internal link ' + target.pathname);
    }
    document.defaultView.close();
    const file = route === '/404' ? 'out/404.html' : path.join('out', route, 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, output);
  }
  console.log('Prerendered ' + publicPages.length + ' public pages and the 404 page.');
} finally { await server.close(); }
