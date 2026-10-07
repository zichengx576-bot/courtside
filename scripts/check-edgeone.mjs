import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { handleEdgeVisitors, handleEdgeCommunity } from '../server/edgeone-storage.js';

// This exercises the SDK's actual overwrite semantics. It is not a
// substitute for a deployment against the real Tencent storage service.
class MemoryBlob {
  objects = new Map();
  async get(key, options) { assert.equal(options.consistency, 'strong'); return structuredClone(this.objects.get(key) ?? null); }
  async setJSON(key, value) {
    this.objects.set(key, structuredClone(value));
  }
  async list(options) {
    assert.equal(options.consistency, 'strong');
    return { blobs: [...this.objects.keys()].filter(key => key.startsWith(options.prefix)).map(key => ({ key, etag: 'test' })) };
  }
}
const request = (path, method = 'GET', body, origin = 'https://courtside.example') => new Request('https://courtside.example' + path, {
  method, headers: { Origin: origin, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}),
});
const community = new MemoryBlob();
const record = { id: randomUUID(), authorToken: randomUUID(), nickname: '测试鞋友', shoe: 'G.T. Cut 1', court: 'indoor', rating: 4, content: '这是本地测试记录，不是公开的真实穿着评价。' };
const now = 60000 * 100 + 59000;
const first = await handleEdgeCommunity(request('/api/community', 'POST', record), community, now);
assert.equal(first.status, 201);
const firstId = (await first.json()).id;
assert.equal((await handleEdgeCommunity(request('/api/community', 'POST', record), community, now)).status, 200);
assert.equal((await handleEdgeCommunity(request('/api/community', 'POST', { ...record, id: randomUUID() }), community, now + 2000)).status, 429, 'Cooldown must cover a minute boundary');
assert.equal((await handleEdgeCommunity(request('/api/community', 'POST', { ...record, id: randomUUID() }), community, now + 61000)).status, 201);
assert.equal((await handleEdgeCommunity(request('/api/community', 'DELETE', { ...record, id: firstId }), community, now + 62000)).status, 200);
assert.equal((await handleEdgeCommunity(request('/api/community', 'POST', record), community, now + 63000)).status, 409, 'Deleted records must not be resurrected by retries');

const conflictStore = new MemoryBlob(), contestedId = randomUUID();
const contenders = [record, { ...record, authorToken: randomUUID() }].map(value => ({ ...value, id: contestedId }));
const conflict = await Promise.all(contenders.map(value => handleEdgeCommunity(request('/api/community', 'POST', value), conflictStore, now)));
assert.deepEqual(conflict.map(response => response.status), [201, 201]);
const ids = await Promise.all(conflict.map(response => response.json().then(value => value.id)));
assert.notEqual(ids[0], ids[1], 'Two authors cannot claim the same public post identity');
assert.equal((await handleEdgeCommunity(request('/api/community', 'DELETE', { ...contenders[1], id: ids[0] }), conflictStore)).status, 403);
assert.equal((await handleEdgeCommunity(request('/api/community', 'DELETE', { ...contenders[0], id: ids[0] }), conflictStore)).status, 200);
const remaining = await (await handleEdgeCommunity(request('/api/community'), conflictStore)).json();
assert.equal(remaining.posts.length, 1);
assert.equal(remaining.posts[0].id, ids[1]);
assert.equal(JSON.stringify(remaining).includes('author_hash'), false);
assert.equal((await handleEdgeCommunity(request('/api/community', 'POST', record, 'https://evil.example'), community)).status, 403);
assert.equal((await handleEdgeCommunity(request('/api/community', 'POST', { ...record, rating: 6 }), community)).status, 400);
const proxied = new Request('http://internal-gateway/api/visitors', {
  method: 'POST', headers: { Origin: 'https://courtside.example', 'Content-Type': 'application/json' },
  body: JSON.stringify({ visitorId: randomUUID() }),
});
assert.equal((await handleEdgeVisitors(proxied, new MemoryBlob(), ['https://courtside.example'])).status, 200,
  'Only explicitly configured public origins may traverse the hosting proxy');
const untrusted = new Request('http://internal-gateway/api/visitors', { headers: { Origin: 'https://evil.example' } });
assert.equal((await handleEdgeVisitors(untrusted, new MemoryBlob(), ['https://courtside.example'])).status, 403);
const parsedBodyRequest = request('/api/visitors', 'POST', { visitorId: randomUUID() });
Object.defineProperty(parsedBodyRequest, 'body', { value: { visitorId: 'platform-parsed-body' } });
assert.equal((await handleEdgeVisitors(parsedBodyRequest, new MemoryBlob())).status, 200,
  'Hosting adapters may shadow Request.body with parsed JSON');
assert.equal((await handleEdgeVisitors(request('/api/visitors'), null)).status, 503);
const outage = { ...new MemoryBlob(), list: async () => { throw new Error('outage'); } };
assert.equal((await handleEdgeVisitors(request('/api/visitors'), outage)).status, 503, 'Storage outages must not display fabricated visitor counts');

const store = new MemoryBlob();
const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks = []; for await (const part of incoming) chunks.push(part);
    const url = `http://127.0.0.1:${server.address().port}${incoming.url}`;
    const webRequest = new Request(url, { method: incoming.method, headers: incoming.headers,
      ...(!['GET', 'HEAD'].includes(incoming.method) ? { body: Buffer.concat(chunks) } : {}) });
    const response = await (new URL(url).pathname === '/api/visitors' ? handleEdgeVisitors : handleEdgeCommunity)(webRequest, store);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch { outgoing.writeHead(500); outgoing.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const endpoint = `http://127.0.0.1:${server.address().port}`;
try {
  for (const script of ['check-visitors.mjs']) {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [fileURLToPath(new URL(script, import.meta.url)), endpoint], { stdio: 'inherit' });
      child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${script} failed: ${code}`)));
    });
  }
  console.log('EdgeOne adapter passed: visitor concurrency, author isolation, sequential cooldown boundary, deletion retries and storage failures. Real cloud verification pending.');
} finally { await new Promise(resolve => server.close(resolve)); }
