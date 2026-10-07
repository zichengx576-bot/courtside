import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const endpoint=new URL('/api/community',process.argv[2]||'http://127.0.0.1:5173/');
const http=(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(10000)});
assert(['localhost','127.0.0.1'].includes(endpoint.hostname),'Test posts must stay in the local preview');
const send=async(method,body,origin=endpoint.origin)=>{const response=await http(endpoint,{method,headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});response.testBody=await response.text();return response;};
const list=async offset=>{const response=await http(endpoint+(offset===undefined?'':`?offset=${offset}`));assert.equal(response.status,200);return response.json();};
const token=randomUUID(),id=randomUUID(),record={id,authorToken:token,nickname:'本地验收测试',shoe:'未收录测试鞋款',court:'outdoor',rating:4,content:'仅用于本地验收，测试公开分享、刷新和作者删除；不是真实穿着评价。'};
const created=[];
try{
 const retries=await Promise.all(Array.from({length:5},()=>send('POST',record)));
 for(const response of retries)assert([200,201].includes(response.status));created.push(record);
 const visible=(await list()).posts.filter(post=>post.id===id);assert.equal(visible.length,1);assert.equal(visible[0].shoe,record.shoe);assert.equal(visible[0].content,record.content);assert(!('author_hash' in visible[0]));assert(!('authorToken' in visible[0]));
 assert.equal((await send('DELETE',{id,authorToken:randomUUID()})).status,403);
 assert.equal((await send('POST',{...record,id:randomUUID()})).status,429);
 for(const change of [{rating:6},{content:'短'},{nickname:'x'.repeat(25)},{court:'bad'},{shoe:'x'.repeat(81)},{content:'x'.repeat(1001)}])assert.equal((await send('POST',{...record,...change,id:randomUUID(),authorToken:randomUUID()})).status,400);
 assert.equal((await send('POST',{...record,id:randomUUID()},'https://example.com')).status,403);
 const oversized=await send('POST',{...record,id:randomUUID(),padding:'x'.repeat(10000)});assert.equal(oversized.status,400,oversized.testBody);
 const invalidPage=await http(endpoint+'?offset=-1');await invalidPage.text();assert.equal(invalidPage.status,400);
 for(let n=0;n<12;n++){const entry={...record,id:randomUUID(),authorToken:randomUUID()};assert.equal((await send('POST',entry)).status,201);created.push(entry);}
 const first=await list();assert.equal(first.posts.length,12);assert.equal(first.nextOffset,12);const second=await list(first.nextOffset);assert(second.posts.length>=1);assert(!first.posts.some(a=>second.posts.some(b=>a.id===b.id)));
 for(const entry of created){assert.equal((await send('DELETE',{id:entry.id,authorToken:entry.authorToken})).status,200);}created.length=0;
 assert(!(await list()).posts.some(post=>post.id===id));
 console.log('Community API passed: shared persistence, safe retries, author-only deletion, rate limits, field/body/origin validation, pagination and public-response privacy. Local test posts removed.');
}finally{for(const entry of created)await send('DELETE',{id:entry.id,authorToken:entry.authorToken});}
