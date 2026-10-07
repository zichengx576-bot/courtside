import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const endpoint=new URL('/api/visitors',process.argv[2]||'http://127.0.0.1:5173/');
const read=async()=>{const response=await fetch(endpoint);assert.equal(response.status,200);const body=await response.json();assert.equal(body.metric,'unique_browsers');assert(Number.isSafeInteger(body.count));return body.count;};
const register=visitorId=>fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Origin:endpoint.origin},body:JSON.stringify({visitorId})});
const before=await read(),sameBrowser=randomUUID();
const retries=await Promise.all(Array.from({length:8},()=>register(sameBrowser)));
for(const response of retries){assert.equal(response.status,200);assert.equal((await response.json()).count,before+1);}
assert.equal(await read(),before+1,'Refreshing the same browser must not create a new visitor');
await Promise.all([register(randomUUID()),register(randomUUID())]);assert.equal(await read(),before+3,'Distinct browser IDs must increase the shared total');
const invalid=await register('not-a-browser-id');assert.equal(invalid.status,400);
const oversized=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:randomUUID(),padding:'x'.repeat(1024)})});assert.equal(oversized.status,400);
const crossSite=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.com'},body:JSON.stringify({visitorId:randomUUID()})});assert.equal(crossSite.status,403);
assert.equal(await read(),before+3,'Rejected requests must not inflate the count');
console.log('Visitor API passed: shared totals, same-browser refresh, concurrent deduplication, new browsers, invalid bodies and cross-site rejection. Local test data only.');
