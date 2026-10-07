import assert from 'node:assert/strict';
import fs from 'node:fs';
import {athletes,templateRules,playerTemplate,rankShoes,recommendationReasons} from '../src/advisor.js';
const catalog=JSON.parse(fs.readFileSync('src/catalog2026.json','utf8'));
const code=fs.readFileSync('src/data.js','utf8').replace("import catalog from './catalog2026.json';",'const catalog='+JSON.stringify(catalog)+';');
const {criteria,defaultProfile}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const translations=JSON.parse(fs.readFileSync('src/translations.json','utf8'));
assert.equal(Object.keys(athletes).length,15);
const reached=new Set();
for(const [style,roles] of Object.entries(templateRules))for(const [position,key] of Object.entries(roles)){
 const p={...defaultProfile,style,position};assert.equal(playerTemplate(p).key,key);reached.add(key);
 assert.equal(playerTemplate({...p,weight:120,height:225,court:'outdoor',footShape:'greek'}).key,key,'Physique and court must not masquerade as a measured NBA similarity');
}
assert.equal(reached.size,15);
for(const a of Object.values(athletes))assert(a.tags.length>=2&&a.description&&a.source.startsWith('https://www.nba.com/'));
for(const key of ['shai','edwards','kawhi','klay','davis','rodman','brunson'])for(const value of [athletes[key].name,athletes[key].title,athletes[key].description,...athletes[key].tags])assert(translations[value]&&!/[\u3400-\u9fff]/.test(translations[value]),'New athlete strings must have English copy');
for(const [a,b] of [[64.9,65.1],[84.9,85.1]])assert(criteria({...defaultProfile,weight:a}).every((w,i)=>Math.abs(w-criteria({...defaultProfile,weight:b})[i])<.02),'Weight boundaries must not produce scoring cliffs');
for(const id of ['nike-ja4','nike-book2','nike-kd19']){
 const s=catalog.shoes.find(s=>s.id===id),p={...defaultProfile,width:'wide'};assert(s.fit.snug&&s.fit.source.startsWith('https://www.nike.com/'));
 const r=recommendationReasons(s,p);assert(r.evidence.conflicts.some(n=>n.includes('官方标注')));assert(r.evidence.conflicts.some(n=>n.includes('不等于已实测')));
 assert(!rankShoes(p,catalog.shoes,criteria(p)).slice(0,4).some(r=>r.shoe.id===id));
}
for(const court of ['outdoor','rubber'])for(const s of catalog.shoes)assert(recommendationReasons(s,{...defaultProfile,court}).evidence.surfacePending,'No outdoor version-specific suitability has yet been confirmed');
assert(!rankShoes(defaultProfile,catalog.shoes,criteria(defaultProfile)).slice(0,4).some(r=>r.shoe.id==='lining-gamma-2'),'Incomplete release configurations must not become top priorities');
assert(!JSON.stringify(catalog).includes('超䨻 䨻'));
assert(catalog.shoes.find(s=>s.id==='wade-wow-12').weight.label.includes('US 9.5'));
assert(catalog.shoes.find(s=>s.id==='puma-mb06').weight.label.includes('单/双鞋口径未明确'));
console.log('Evidence QA passed: 15 reachable, bilingual templates; smooth weight rules; brand-snug vs measured-width distinction; outdoor uncertainty; incomplete product priority; attributed mass.');
