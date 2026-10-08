import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppShell } from '../src/App';
import { SeoCaptureContext, buildSeo, type PageSeoOptions } from '../src/hooks/usePageSeo';
export { publicPages } from '../src/content/publicPages';

export async function render(url: string) {
  let options: PageSeoOptions | null = null;
  const html = await new Promise<string>((resolve, reject) => {
    const stream = new PassThrough();
    let output = '';
    stream.on('data', chunk => { output += chunk.toString(); });
    stream.on('end', () => { clearTimeout(timer); resolve(output); });
    stream.on('error', reject);
    const rendering = renderToPipeableStream(
      <SeoCaptureContext.Provider value={value => { options = value; }}>
        <StaticRouter location={url}><AppShell /></StaticRouter>
      </SeoCaptureContext.Provider>,
      { onAllReady() { rendering.pipe(stream); }, onError(error) { clearTimeout(timer); reject(error); } },
    );
    const timer = setTimeout(() => { rendering.abort(); reject(new Error('Prerender timed out: ' + url)); }, 15000);
  });
  if (!options) throw new Error('Missing page metadata: ' + url);
  return { html, seo: buildSeo(options) };
}
