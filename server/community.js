const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function bodyOf(request){
 const reader=request.body?.getReader();if(!reader)throw new Error('empty');
 const chunks=[];let size=0,tooLarge=false;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){tooLarge=true;chunks.length=0;continue;}chunks.push(value);}}finally{reader.releaseLock();}
 if(tooLarge)throw new Error('large');
 const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.byteLength;}return JSON.parse(new TextDecoder().decode(bytes));
}
const publicFields='id, nickname, shoe, court, rating, content, created_at';
const clean=value=>typeof value==='string'?value.trim():'';
const validText=(value,min,max)=>value.length>=min&&value.length<=max&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
async function authorHash(token){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token.toLowerCase()));return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');}
export async function handleCommunity(request,db){
 const url=new URL(request.url);
 if((request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)||request.headers.get('Sec-Fetch-Site')==='cross-site'){
  // Finish reading without retaining oversized input so a denied request cannot break the next keep-alive request.
  if(request.body)try{await bodyOf(request);}catch{}
  return json({error:'origin_not_allowed'},403);
 }
 if(!['GET','POST','DELETE'].includes(request.method))return json({error:'method_not_allowed'},405);
 if(!db)return json({error:'community_unavailable'},503);
 try{
  if(request.method==='GET'){
   const offset=Number(url.searchParams.get('offset')||0);
   if(!Number.isInteger(offset)||offset<0||offset>10000)return json({error:'invalid_offset'},400);
   const rows=await db.prepare(`SELECT ${publicFields} FROM wearing_experiences ORDER BY created_at DESC, id DESC LIMIT 13 OFFSET ?`).bind(offset).all();
   return json({posts:rows.results.slice(0,12),nextOffset:rows.results.length>12?offset+12:null});
  }
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'invalid_content_type'},415);

  let body;try{body=await bodyOf(request);}catch{return json({error:'invalid_request'},400);}
  if(!body||!uuid.test(body.id||'')||!uuid.test(body.authorToken||''))return json({error:'invalid_identity'},400);
  const hash=await authorHash(body.authorToken),id=body.id.toLowerCase();
  if(request.method==='DELETE'){
   const result=await db.prepare('DELETE FROM wearing_experiences WHERE id = ? AND author_hash = ?').bind(id,hash).run();
   if(!result.meta.changes)return json({error:'post_not_owned'},403);
   return json({deleted:true,id});
  }
  const nickname=clean(body.nickname),shoe=clean(body.shoe),content=clean(body.content),court=clean(body.court);
  if(!validText(nickname,1,24)||!validText(shoe,1,80)||!validText(content,10,1000)||!['indoor','outdoor','both'].includes(court)||!Number.isInteger(body.rating)||body.rating<1||body.rating>5)return json({error:'invalid_experience'},400);
  // The request ID makes uncertain network retries safe; author tokens never leave the browser in a public response.
  const existing=await db.prepare('SELECT author_hash FROM wearing_experiences WHERE id = ?').bind(id).first();
  if(existing){if(existing.author_hash!==hash)return json({error:'id_conflict'},409);return json({id,created:false});}
  const now=Date.now();
  const result=await db.prepare('INSERT OR IGNORE INTO wearing_experiences (id,author_hash,nickname,shoe,court,rating,content,created_at) SELECT ?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM wearing_experiences WHERE author_hash = ? AND created_at > ?)').bind(id,hash,nickname,shoe,court,body.rating,content,now,hash,now-60000).run();
  if(!result.meta.changes){const retry=await db.prepare('SELECT author_hash FROM wearing_experiences WHERE id = ?').bind(id).first();if(retry?.author_hash===hash)return json({id,created:false});return json({error:'share_too_fast',retryAfter:60},429);}
  return json({id,created:true},201);
 }catch(error){console.error('[community] Storage request failed:',error instanceof Error?error.message:'unknown storage error');return json({error:'community_unavailable'},503);}
}
