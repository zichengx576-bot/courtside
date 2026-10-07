const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function boundedBody(request){
 const reader=request.body?.getReader();if(!reader)return '';
 const chunks=[];let length=0,tooLarge=false;
 try{for(;;){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>256){tooLarge=true;chunks.length=0;continue;}chunks.push(value);}}
 finally{reader.releaseLock();}
 if(tooLarge)throw new Error('body_too_large');
 const bytes=new Uint8Array(length);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.byteLength;}return new TextDecoder().decode(bytes);
}
export async function handleVisitors(request,db){
 const origin=new URL(request.url).origin;
 if((request.headers.get('Origin')&&request.headers.get('Origin')!==origin)||request.headers.get('Sec-Fetch-Site')==='cross-site'){
  if(request.body)try{await boundedBody(request);}catch{}
  return json({error:'origin_not_allowed'},403);
 }
 if(!['GET','POST'].includes(request.method))return json({error:'method_not_allowed'},405);
 if(!db)return json({error:'statistics_unavailable'},503);
 try{
  if(request.method==='GET'){
   const row=await db.prepare('SELECT COUNT(*) AS count FROM visitors').first();
   return json({count:Number(row.count),metric:'unique_browsers'});
  }
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'invalid_content_type'},415);

  let body;try{body=JSON.parse(await boundedBody(request));}catch{return json({error:'invalid_request'},400);}
  if(!body||typeof body.visitorId!=='string'||!uuid.test(body.visitorId))return json({error:'invalid_visitor'},400);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body.visitorId.toLowerCase()));
  const hash=[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  // A unique key and transactional D1 batch prevent refreshes/concurrent retries from increasing the total.
  const results=await db.batch([
   db.prepare('INSERT OR IGNORE INTO visitors (id_hash) VALUES (?)').bind(hash),
   db.prepare('SELECT COUNT(*) AS count FROM visitors')
  ]);
  return json({count:Number(results[1].results[0].count),metric:'unique_browsers'});
 }catch{return json({error:'statistics_unavailable'},503);}
}
