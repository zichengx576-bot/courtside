import { cp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = fileURLToPath(new URL('../../outputs/edgeone-courtside/', import.meta.url));
const client = path.join(output, 'client');
const build = spawnSync(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'),
  'build', '--config', 'vite.spa.config.mjs', '--outDir', client], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) throw build.error || new Error('Frontend build failed');
await cp(client, output, { recursive: true });
// Remove only the generated intermediate directory after checking containment.
if (path.resolve(client) !== path.join(path.resolve(output), 'client')) throw new Error('Unexpected intermediate path');
await rm(client, { recursive: true, force: true });
await mkdir(path.join(output, 'cloud-functions/api'), { recursive: true });
await mkdir(path.join(output, 'cloud-functions/_shared'), { recursive: true });
await cp(path.join(root, 'server/edgeone-storage.js'), path.join(output, 'cloud-functions/_shared/storage.js'));
for (const [route, handler] of [['visitors', 'handleEdgeVisitors'], ['community', 'handleEdgeCommunity']]) {
  await writeFile(path.join(output, `cloud-functions/api/${route}.js`),
    `import { getStore } from '@edgeone/pages-blob';\nimport { ${handler} } from '../_shared/storage.js';\n` +
    `const allowedOrigins = ['https://courtside-sneaker-lab-h4lgkgdz.edgeone.dev', ...(process.env.COURTSIDE_PUBLIC_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean)];\n` +
    `export async function onRequest({ request }) {\n  try {\n    return await ${handler}(request, getStore({ name: 'courtside-public', consistency: 'strong' }), ${route === 'community' ? 'Date.now(), ' : ''}allowedOrigins);\n  } catch {\n    return Response.json({ error: '${route === 'visitors' ? 'statistics' : 'community'}_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });\n  }\n}\n`);
}
await writeFile(path.join(output, 'package.json'), JSON.stringify({ name: 'courtside-edgeone', private: true,
  type: 'module', dependencies: { '@edgeone/pages-blob': '0.0.18' } }, null, 2) + '\n');
await writeFile(path.join(output, 'edgeone.json'), JSON.stringify({
  rewrites: [{ source: '/*', destination: '/index.html' }],
  headers: [
    { source: '/*', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'X-Frame-Options', value: 'DENY' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }] },
    { source: '/', headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }] },
    { source: '/assets/*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/api/*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
  ],
}, null, 2) + '\n');
const html = await readFile(path.join(output, 'index.html'), 'utf8');
if (!html.includes('type="module"') || html.includes('127.0.0.1:5173')) throw new Error('Invalid production frontend');
console.log('EdgeOne distribution prepared. Original website and Cloudflare database are unchanged.');
