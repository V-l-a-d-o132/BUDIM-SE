// Read-only check of the deployed, unrendered HTTP responses. Run after Publish.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const base = 'https://budimse.online';
const routes = ['/', '/center', '/digitalna-gramotnost', '/mediyna-gramotnost-uchenici', '/obucheniya-za-uchilishta', '/news/proverka-na-fakti'];
const failures = [];
for (const route of routes) {
  try {
    const response = await fetch(base + route, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, 'HTTP status');
    const dom = new JSDOM(await response.text());
    const doc = dom.window.document;
    assert.equal(doc.querySelectorAll('h1').length, 1, 'HTML must contain the page heading before JavaScript');
    assert.equal(doc.querySelector('link[rel=canonical]')?.getAttribute('href'), base + route, 'canonical must identify this route');
    assert.equal(doc.getElementById('root')?.getAttribute('data-prerender-route'), route, 'host must serve the matching static page');
    const org = JSON.parse(doc.getElementById('organization-schema-jsonld')?.textContent || '{}');
    assert.equal(org['@type'], 'EducationalOrganization', 'center identity');
    assert.ok(doc.querySelector('script[data-privacy-consent]'), 'consent bootstrap is present');
    assert.equal(doc.querySelector('script[src="/privacy-consent.js"]'), null, 'no blocking consent network request');
    console.log('PASS ' + route + ' — ' + doc.title);
    dom.window.close();
  } catch (error) { failures.push(route + ': ' + error.message); }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
