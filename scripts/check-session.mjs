import assert from 'node:assert/strict';
import fs from 'node:fs';
const catalog=fs.readFileSync(new URL('../src/catalog2026.json',import.meta.url),'utf8');
const data=fs.readFileSync(new URL('../src/data.js',import.meta.url),'utf8').replace("import catalog from './catalog2026.json';",'const catalog='+catalog+';');
const dataUrl='data:text/javascript;base64,'+Buffer.from(data).toString('base64');
const code=fs.readFileSync(new URL('../src/session.js',import.meta.url),'utf8').replace("'./data.js'",JSON.stringify(dataUrl));
const {readExperience,readChat,saveLocal}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const {defaultProfile,shoes}=await import(dataUrl),store=new Map(),storage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
const original={version:2,left:shoes[3].id,right:shoes[5].id,profile:{...defaultProfile,weight:95,position:'C',width:'wide',height:200,footShape:'greek',arch:'high',budget:800},applied:defaultProfile};
assert(saveLocal('courtside-experience-v2',original,storage));const restored=readExperience(storage);assert.equal(restored.left,original.left);assert.equal(restored.profile.weight,95);assert.equal(restored.applied.weight,75);
store.set('courtside-experience-v2',JSON.stringify({...original,left:'retired',right:'retired',profile:{weight:999}}));const safe=readExperience(storage);assert.notEqual(safe.left,safe.right);assert.equal(safe.profile.weight,75);
store.set('courtside-experience-v2','bad JSON');assert.deepEqual(readExperience(storage).profile,defaultProfile);
store.set('courtside-experience-v2',JSON.stringify({...original,version:1}));assert.equal(readExperience(storage).left,shoes[0].id);
const entry={question:'那它适合水泥地吗？',profile:original.profile,context:[shoes[0].id,'retired']};store.set('courtside-chat-v2',JSON.stringify({version:2,entries:[entry,{question:null,context:[]}]}));const chat=readChat(storage);assert.equal(chat.length,1);assert.equal(chat[0].question,entry.question);assert.deepEqual(chat[0].context,[shoes[0].id]);
const denied={getItem(){throw Error('disabled');},setItem(){throw Error('disabled');}};assert.equal(saveLocal('x',{},denied),false);assert.deepEqual(readExperience(denied).profile,defaultProfile);assert.deepEqual(readChat(denied),[]);assert.equal(saveLocal('x',{},null),false);
console.log('Session QA passed: refresh restoration, draft/applied distinction, retired shoes, corrupt/old storage, chat context and denied storage.');

store.set('courtside-experience-v2',JSON.stringify(original));const migrated=readExperience(storage);assert.equal(migrated.profile.height,200);assert.equal(migrated.profile.footShape,'greek');assert.equal(migrated.profile.arch,'high');assert(!Object.hasOwn(migrated.profile,'budget'));
