import { spawnSync } from 'node:child_process';
import { readdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, 'pages');
const base = process.argv[2] || '/courtside/';
if (!/^\/[a-zA-Z0-9_/-]*\/$/.test(base)) throw new Error('Use a base such as /courtside/.');
if (output !== path.join(path.resolve(root), 'pages')) throw new Error('Unexpected build destination.');
// Vite empties only this generated directory. Website source files are untouched.
const build = spawnSync(process.execPath, [
  path.join(root, 'node_modules/vite/bin/vite.js'), 'build',
  '--config', 'vite.spa.config.mjs', '--base', base,
  '--outDir', output, '--emptyOutDir',
], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) throw build.error || new Error('Pages build failed.');
async function adapt(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await adapt(file); continue; }
    if (!/\.(html|js|css)$/.test(entry.name)) continue;
    const original = await readFile(file, 'utf8');
    // Adapt only generated public-image paths. Keep API and external URLs intact.
    const adapted = original.replace(/(["'`(=])\/(shoes|players|mascot)\//g, `$1${base}$2/`)
      .replace(/(["'`(=])\/favicon\.svg/g, `$1${base}favicon.svg`);
    if (adapted !== original) await writeFile(file, adapted);
  }
}
await adapt(output);
await writeFile(path.join(output, '.nojekyll'), '');
await copyFile(path.join(output, 'index.html'), path.join(output, '404.html'));
const catalog = JSON.parse(await readFile(path.join(root, 'src/catalog2026.json'), 'utf8'));
for (const shoe of catalog.shoes) {
  for (const photo of shoe.photos) await stat(path.join(output, photo.replace(/^\//, '')));
}
console.log(`Pages ready: ${catalog.shoes.length} shoe profiles, base ${base}.`);
