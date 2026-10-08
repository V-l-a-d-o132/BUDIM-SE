import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import type { Plugin } from 'vite';

// Hosts may invoke `vite build` directly rather than the package.json command.
// Keep static HTML generation inside the build lifecycle in either case.
export function staticPages(): Plugin {
  let root = process.cwd();
  let output = 'out';
  return {
    name: 'budimse-static-public-pages',
    apply: 'build',
    configResolved(config) { root = config.root; output = resolve(root, config.build.outDir); },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const consent = await readFile(resolve(root, 'public/privacy-consent.js'), 'utf8');
        return html.replace('<script src="/privacy-consent.js"></script>', () => '<script data-privacy-consent>' + consent.replace(/<\/script/gi, '<\\/script') + '</script>');
      },
    },
    async closeBundle() {
      const { stdout, stderr } = await promisify(execFile)(process.execPath, ['scripts/prerender.mjs', output], { cwd: root, maxBuffer: 4 * 1024 * 1024 });
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
    },
  };
}
