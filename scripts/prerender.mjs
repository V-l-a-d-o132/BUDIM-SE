import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer, loadEnv } from 'vite';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import assert from 'node:assert/strict';
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const serialize = value => JSON.stringify(value).replace(/</g, '\\u003c');
const outputDir = process.argv[2] || 'out';
const template = await fs.readFile(path.join(outputDir, 'index.html'), 'utf8');
const env = { ...loadEnv('production', process.cwd(), 'VITE_PUBLIC_'), ...process.env };
let articles = JSON.parse(await fs.readFile('content/news.public-snapshot.json', 'utf8'));
// Only the same published rows available to anonymous visitors enter static HTML.
// CI can reproduce the last verified public snapshot without production secrets.
if (env.VITE_PUBLIC_SUPABASE_URL && env.VITE_PUBLIC_SUPABASE_ANON_KEY && env.BUDIMSE_NEWS_SOURCE !== 'snapshot') {
  try {
    const url = new URL('/rest/v1/news', env.VITE_PUBLIC_SUPABASE_URL);
    url.search = new URLSearchParams({ select: 'id,title,slug,body,image_url,created_at,updated_at,published', published: 'eq.true', order: 'created_at.desc', limit: '500' }).toString();
    const response = await fetch(url, { headers: { apikey: env.VITE_PUBLIC_SUPABASE_ANON_KEY }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('Public news API status ' + response.status);
    const latest = await response.json();
    if (!Array.isArray(latest)) throw new Error('Invalid public news response');
    articles = latest; // An empty published list is authoritative, too.
  } catch (error) { throw new Error('Cannot verify published articles; keep the previous deployment and retry the build. ' + error.message); }
}
articles = articles.filter(article => article.published === true && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)
  && typeof article.title === 'string' && typeof article.body === 'string');
assert.equal(new Set(articles.map(article => article.slug)).size, articles.length, 'Published article slugs must be unique');
const sanitizerDom = new JSDOM('');
const purifier = createDOMPurify(sanitizerDom.window);
const sanitize = html => purifier.sanitize(html, { ALLOWED_TAGS: ['a', 'b', 'strong', 'i', 'em', 'br'], ALLOWED_ATTR: ['href', 'title'] });
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { render, publicPages, metaAttribute } = await server.ssrLoadModule('/scripts/render.tsx');
  const routes = [...publicPages, ...articles.map(article => '/news/' + article.slug)];
  for (const route of [...routes, '/404']) {
    const snapshot = route === '/news' ? { route, items: articles } : route.startsWith('/news/') ? { route, items: articles.filter(article => route === '/news/' + article.slug) } : null;
    const { html, seo } = await render(route, snapshot, sanitize);
    const head = '<title>' + escape(seo.title) + '</title>\n'
      + Object.entries(seo.meta).map(([name, value]) => '<meta ' + metaAttribute(name) + '="' + name + '" content="' + escape(value) + '" />').join('\n')
      + '\n<link rel="canonical" href="' + escape(seo.url) + '" />\n'
      + Object.entries(seo.schemas).map(([id, value]) => '<script type="application/ld+json" id="' + id + '">' + serialize(value) + '</script>').join('\n');
    const output = template.replace(/<!--page-meta:start-->[\s\S]*?<!--page-meta:end-->/, () => '<!--page-meta:start-->' + head + '<!--page-meta:end-->')
      .replace('<div id="root"></div>', () => '<div id="root" data-prerender-route="' + escape(route) + '">' + html + '</div>' + (snapshot ? '<script type="application/json" id="news-snapshot">' + serialize(snapshot) + '</script>' : ''));
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
      if (target.origin === 'https://budimse.online') {
        const downloadableFile = target.pathname.startsWith('/resources/')
          && (await fs.stat(path.join(outputDir, target.pathname)).catch(() => null))?.isFile();
        assert.ok(routes.includes(target.pathname) || target.pathname.startsWith('/news/')
          || (target.pathname === route && target.hash) || downloadableFile,
        route + ': unknown internal link ' + target.pathname);
      }
    }
    document.defaultView.close();
    const file = route === '/404' ? path.join(outputDir, '404.html') : path.join(outputDir, route, 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, output);
    if (route !== '/' && route !== '/404') await fs.writeFile(path.join(outputDir, route + '.html'), output);
  }
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + routes.map(route => {
    const article = articles.find(article => route === '/news/' + article.slug);
    const lastmod = article ? (article.updated_at || article.created_at).slice(0, 10) : ['/resursi', '/center'].includes(route) ? '2026-10-09' : '2026-10-08';
    return '  <url><loc>https://budimse.online' + escape(route) + '</loc><lastmod>' + escape(lastmod) + '</lastmod></url>';
  }).join('\n') + '\n</urlset>\n';
  await fs.writeFile(path.join(outputDir, 'sitemap.xml'), sitemap);
  await fs.writeFile(path.join(outputDir, 'build-info.json'), JSON.stringify({ builtAt: new Date().toISOString(), staticPages: publicPages.length, articles: articles.length, totalPublicPages: routes.length, prerendered: true }));
  console.log('Prerendered ' + routes.length + ' public pages (' + articles.length + ' articles) and the 404 page.');
} finally { await server.close(); sanitizerDom.window.close(); }
