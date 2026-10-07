// Keep the public API contract independent of the hosting provider. Each browser
// and post has an owner-scoped object key; do not use read-modify-write counters.
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json = (data, status = 200) => Response.json(data, { status, headers: {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
}});
const read = (store, key) => store.get(key, { type: 'json', consistency: 'strong' });
const deniedOrigin = (request, allowedOrigins) => (request.headers.get('Origin') &&
  ![new URL(request.url).origin, ...allowedOrigins].includes(request.headers.get('Origin'))) ||
  request.headers.get('Sec-Fetch-Site') === 'cross-site';

async function bodyOf(request, maximum) {
  // EdgeOne shadows request.body with parsed JSON. Read the native stream
  // getter directly, without cloning into an extra unconsumed stream branch.
  const stream = Object.getOwnPropertyDescriptor(Request.prototype, 'body').get.call(request);
  const reader = stream?.getReader();
  if (!reader) throw new Error('empty');
  const chunks = []; let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); throw new Error('large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let at = 0;
  for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function hashIdentity(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value.toLowerCase()));
  return [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, '0')).join('');
}

async function postIdentity(owner, requestId) {
  const hex = await hashIdentity(`${owner}:${requestId}`);
  // Stable UUID per author/request. No conditional Blob write is needed to
  // prevent another author from overwriting a post or claiming its identity.
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function handleEdgeVisitors(request, store, allowedOrigins = []) {
  if (deniedOrigin(request, allowedOrigins)) return json({ error: 'origin_not_allowed' }, 403);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'method_not_allowed' }, 405);
  if (!store) return json({ error: 'statistics_unavailable' }, 503);
  try {
    if (request.method === 'POST') {
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'invalid_content_type' }, 415);
      let body; try { body = await bodyOf(request, 256); } catch { return json({ error: 'invalid_request' }, 400); }
      if (!body || typeof body.visitorId !== 'string' || !uuid.test(body.visitorId)) return json({ error: 'invalid_visitor' }, 400);
      const hash = await hashIdentity(body.visitorId);
      await store.setJSON(`visitors/${hash}`, { visited: true });
    }
    const { blobs } = await store.list({ prefix: 'visitors/', consistency: 'strong' });
    return json({ count: blobs.length, metric: 'unique_browsers' });
  } catch { return json({ error: 'statistics_unavailable' }, 503); }
}

const clean = value => typeof value === 'string' ? value.trim() : '';
const validText = (value, min, max) => value.length >= min && value.length <= max &&
  !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
const publicPost = ({ id, nickname, shoe, court, rating, content, created_at }) =>
  ({ id, nickname, shoe, court, rating, content, created_at });

export async function handleEdgeCommunity(request, store, now = Date.now(), allowedOrigins = []) {
  if (deniedOrigin(request, allowedOrigins)) return json({ error: 'origin_not_allowed' }, 403);
  if (!['GET', 'POST', 'DELETE'].includes(request.method)) return json({ error: 'method_not_allowed' }, 405);
  if (!store) return json({ error: 'community_unavailable' }, 503);
  try {
    if (request.method === 'GET') {
      const offset = Number(new URL(request.url).searchParams.get('offset') || 0);
      if (!Number.isInteger(offset) || offset < 0 || offset > 10000) return json({ error: 'invalid_offset' }, 400);
      const { blobs } = await store.list({ prefix: 'experiences/', consistency: 'strong' });
      const rows = [];
      // Bound parallel reads; this object-store implementation targets a small
      // beta community. Move to an indexed database before large-scale launch.
      for (let at = 0; at < blobs.length; at += 24) {
        const batch = await Promise.all(blobs.slice(at, at + 24).map(async ({ key }) => {
          const record = await read(store, key);
          if (!record || await read(store, `deleted/${record.id}/${record.author_hash}`)) return null;
          return publicPost(record);
        }));
        rows.push(...batch.filter(Boolean));
      }
      rows.sort((a, b) => b.created_at - a.created_at || b.id.localeCompare(a.id));
      return json({ posts: rows.slice(offset, offset + 12), nextOffset: rows.length > offset + 12 ? offset + 12 : null });
    }
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'invalid_content_type' }, 415);
    let body; try { body = await bodyOf(request, 8192); } catch { return json({ error: 'invalid_request' }, 400); }
    if (!body || typeof body.id !== 'string' || typeof body.authorToken !== 'string' ||
      !uuid.test(body.id) || !uuid.test(body.authorToken)) return json({ error: 'invalid_identity' }, 400);
    const hash = await hashIdentity(body.authorToken);
    const id = request.method === 'DELETE' ? body.id.toLowerCase() : await postIdentity(hash, body.id.toLowerCase());
    const key = `experiences/${id}/${hash}`, existing = await read(store, key);
    const deletedKey = `deleted/${id}/${hash}`;
    if (request.method === 'DELETE') {
      if (!existing || existing.author_hash !== hash) return json({ error: 'post_not_owned' }, 403);
      // A permanent tombstone prevents stale clients from resurrecting a post
      // through a retry or taking ownership of a deleted request ID.
      await store.setJSON(deletedKey, { deleted: true });
      return json({ deleted: true, id });
    }
    const nickname = clean(body.nickname), shoe = clean(body.shoe), content = clean(body.content), court = clean(body.court);
    if (!validText(nickname, 1, 24) || !validText(shoe, 1, 80) || !validText(content, 10, 1000) ||
      !['indoor', 'outdoor', 'both'].includes(court) || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
      return json({ error: 'invalid_experience' }, 400);
    }
    if (await read(store, deletedKey)) return json({ error: 'post_deleted' }, 409);
    if (existing) {
      return json({ id, created: false });
    }
    // Sequential cooldown is best effort, not a distributed lock. Blob does
    // not support atomic conditional writes. Ownership safety never relies on
    // this throttle; strict abuse prevention needs a database/WAF later.
    const rateKey = `rates/${hash}`;
    const previous = await read(store, rateKey);
    if (previous && now - previous.created_at < 60000) return json({ error: 'share_too_fast', retryAfter: Math.ceil((60000 - (now - previous.created_at)) / 1000) }, 429);
    await store.setJSON(key, { id, author_hash: hash, nickname, shoe, court, rating: body.rating, content, created_at: now });
    await store.setJSON(rateKey, { id, created_at: now });
    if (await read(store, deletedKey)) return json({ error: 'post_deleted' }, 409);
    return json({ id, created: true }, 201);
  } catch (error) { console.error('[edgeone-community]', error instanceof Error ? error.name : 'StorageError'); return json({ error: 'community_unavailable' }, 503); }
}
